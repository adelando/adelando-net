#!/usr/bin/env node
// Builds the site into ./dist. No dependencies — just Node 18+.
//
//   node build.mjs            build once
//   node build.mjs --serve    build, then preview at http://localhost:8000
//                             (rebuilds when you save a file)

import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync, readFileSync, statSync, watch } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const DIST = join(ROOT, "dist");
const PUBLIC = join(ROOT, "public");

const ACCENTS = ["cyan", "magenta", "purple"];
const LINK_TYPES = ["demo", "github", "download"];

// Import a module fresh each time so --serve picks up edits.
const load = async (rel) =>
  (await import(pathToFileURL(join(ROOT, rel)).href + `?t=${Date.now()}`)).default;

const inPublic = (url) => {
  const clean = url.split(/[?#]/)[0];
  const p = join(PUBLIC, clean);
  return existsSync(p) || existsSync(join(p, "index.html"));
};

/* ── Check the content files and explain mistakes in plain English ── */
function validate({ projects, downloads }) {
  const errors = [];
  const warnings = [];

  projects.forEach((p, i) => {
    const where = `content/projects.mjs → project ${i + 1}${p.title ? ` ("${p.title}")` : ""}`;
    if (!p.title) errors.push(`${where}: needs a title.`);
    if (!p.description) errors.push(`${where}: needs a description.`);
    if (!Array.isArray(p.tags)) errors.push(`${where}: tags must be a list, e.g. ["HTML", "CSS"].`);
    if (!Array.isArray(p.links)) errors.push(`${where}: links must be a list (use [] for none).`);
    if (p.accent && !ACCENTS.includes(p.accent))
      errors.push(`${where}: accent "${p.accent}" isn't one of ${ACCENTS.join(", ")}.`);
    if (!p.icon && !p.image) warnings.push(`${where}: no icon or image, using 🚀.`);
    (Array.isArray(p.links) ? p.links : []).forEach((l) => {
      if (!LINK_TYPES.includes(l.type))
        errors.push(`${where}: link type "${l.type}" isn't one of ${LINK_TYPES.join(", ")}.`);
      if (l.url && l.url.startsWith("/") && !inPublic(l.url))
        warnings.push(`${where}: link ${l.url} has no matching file in public/ — it will 404 until you add it.`);
    });
    if (p.image && p.image.startsWith("/") && !inPublic(p.image)) {
      warnings.push(`${where}: image ${p.image} not found in public/ — showing the icon instead.`);
      p.image = undefined;
    }
    p.accent ||= "cyan";
    p.icon ||= "🚀";
    p.tags ||= [];
    p.links ||= [];
  });

  downloads.forEach((s) => {
    const where = `content/downloads.mjs → "${s.name || s.id}"`;
    if (!s.id || !s.name) errors.push(`${where}: each server needs an id and a name.`);
    if (!ACCENTS.includes(s.accent)) s.accent = "cyan";
    if (s.image && !inPublic(s.image)) {
      warnings.push(`${where}: image ${s.image} not found in public/ — showing the icon instead.`);
      s.image = undefined;
    }
    for (const v of s.versions || []) {
      for (const key of ["download", "resourcepack"]) {
        const url = v[key];
        if (url && url !== "soon" && url.startsWith("/") && !inPublic(url))
          warnings.push(`${where} version ${v.name}: ${key} ${url} has no matching file in public/.`);
      }
    }
    s.versions ||= [];
    s.install ||= [];
  });

  return { errors, warnings };
}

async function build() {
  const started = Date.now();
  const [site, projects, downloads, pages] = await Promise.all([
    load("content/site.mjs"),
    load("content/projects.mjs"),
    load("content/downloads.mjs"),
    import(pathToFileURL(join(ROOT, "src/pages.mjs")).href + `?t=${Date.now()}`),
  ]);

  const { errors, warnings } = validate({ projects, downloads });
  if (site.about.photo && !inPublic(site.about.photo)) {
    warnings.push(`content/site.mjs: photo ${site.about.photo} not found in public/ — showing an initial instead.`);
    site.about.photo = undefined;
  }
  if (errors.length) throw new Error("Please fix these first:\n  • " + errors.join("\n  • "));

  await rm(DIST, { recursive: true, force: true });
  await mkdir(join(DIST, "assets"), { recursive: true });
  await cp(PUBLIC, DIST, { recursive: true });

  // CSS and JS get a fingerprint in their filename so browsers can cache them forever.
  const assets = {};
  for (const [key, file] of [["css", "site.css"], ["js", "site.js"]]) {
    const source = await readFile(join(ROOT, "src", file));
    const hash = createHash("sha256").update(source).digest("hex").slice(0, 10);
    const name = file.replace(".", `.${hash}.`);
    await writeFile(join(DIST, "assets", name), source);
    assets[key] = `/assets/${name}`;
  }

  const ctx = { site, projects, downloads, assets };
  const built = [
    pages.homePage(ctx),
    pages.projectsPage(ctx),
    pages.downloadsPage(ctx),
    pages.aboutPage(ctx),
    pages.notFoundPage(ctx),
  ];
  for (const page of built) await writeFile(join(DIST, page.file), pages.layout(ctx, page));

  const urls = built.filter((p) => !p.noindex).map((p) => `  <url><loc>${site.url}${p.path}</loc></url>`);
  await writeFile(
    join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
  );
  await writeFile(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);

  for (const w of warnings) console.warn(`  ! ${w}`);
  console.log(`Built ${built.length} pages, ${projects.length} projects → dist/ (${Date.now() - started} ms)`);
}

/* ── Local preview that behaves like Cloudflare (clean URLs, 404 page) ── */
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2",
  ".xml": "application/xml", ".txt": "text/plain", ".zip": "application/zip",
};

// Reads dist/_redirects ("from to status" per line) so the preview matches Cloudflare.
function redirects() {
  const file = join(DIST, "_redirects");
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split(/\s+/));
}

function serve(port = 8000) {
  const isFile = (p) => existsSync(p) && statSync(p).isFile();
  createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (path.includes("..")) return res.writeHead(400).end();
    const redirect = redirects().find(([from]) => from === path);
    if (redirect) return res.writeHead(Number(redirect[2]) || 302, { location: redirect[1] }).end();
    const candidates = [join(DIST, path), join(DIST, path + ".html"), join(DIST, path, "index.html")];
    let file = candidates.find(isFile);
    let status = 200;
    if (!file) [file, status] = [join(DIST, "404.html"), 404];
    res.writeHead(status, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(await readFile(file));
  }).listen(port, () => console.log(`Preview: http://localhost:${port}  (Ctrl+C to stop)`));
}

const serving = process.argv.includes("--serve");
try {
  await build();
} catch (err) {
  console.error(`\n${err.message}\n`);
  if (!serving) process.exit(1);
}

if (serving) {
  serve(Number(process.env.PORT) || 8000);
  let timer;
  for (const dir of ["content", "src", "public"]) {
    watch(join(ROOT, dir), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => build().catch((e) => console.error(`\n${e.message}\n`)), 120);
    });
  }
}
