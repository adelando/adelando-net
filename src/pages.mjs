// Page templates. You only need to touch this file to change page LAYOUT.
// To change text, projects or downloads, edit the files in /content instead.

import { icon } from "./icons.mjs";

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// `text with code` -> text with <code>code</code>
const rich = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");

const external = (url) => /^https?:\/\//.test(url);
const linkAttrs = (url) => (external(url) ? ' target="_blank" rel="noopener"' : "");

/* ───────────────────────── Shared layout ───────────────────────── */

export function layout(ctx, page) {
  const { site, assets } = ctx;
  const title = page.title ? `${page.title} | ${site.name}` : site.name;
  const canonical = site.url + (page.path === "/" ? "/" : page.path);
  const navLinks = site.nav
    .map(
      (n) =>
        `<a href="${n.href}"${n.href === page.path ? ' aria-current="page"' : ""}>${esc(n.label)}</a>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="theme-color" content="#070711">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preload" href="/fonts/bricolage-grotesque.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assets.css}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.url}/images/og.png">
<meta property="og:site_name" content="${esc(site.name)}">
<meta name="twitter:card" content="summary_large_image">
${page.noindex ? '<meta name="robots" content="noindex">\n' : ""}<script type="speculationrules">{"prerender":[{"where":{"and":[{"href_matches":"/*"},{"not":{"href_matches":"/projects/*"}}]},"eagerness":"moderate"}]}</script>
<script src="${assets.js}" defer></script>
</head>
<body data-github-user="${esc(site.githubUser)}">
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="wordmark" href="/" aria-label="${esc(site.name)} home">adelando<span>.net</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Menu">${icon("menu", 20)}</button>
    <nav id="site-nav" class="site-nav" aria-label="Main">${navLinks}</nav>
  </div>
</header>
<main id="main">
${page.body}
</main>
<footer class="site-footer">
  <div class="wrap footer-inner">
    <nav class="footer-nav" aria-label="Footer"><a href="/">Home</a>${site.nav
      .map((n) => `<a href="${n.href}">${esc(n.label)}</a>`)
      .join("")}</nav>
    <a class="support-link" href="${site.supportUrl}" target="_blank" rel="noopener">${icon("coffee")}Support my work</a>
    <p class="footer-note">© ${new Date().getFullYear()} ${esc(site.name)}. Built with HTML, CSS and JavaScript.</p>
  </div>
</footer>
</body>
</html>
`;
}

/* ───────────────────────── Building blocks ───────────────────────── */

const LINK_DEFAULTS = {
  demo: { label: "Live demo", icon: "demo" },
  github: { label: "GitHub", icon: "github" },
  download: { label: "Download", icon: "download" },
};

function projectLink(link) {
  const d = LINK_DEFAULTS[link.type];
  const label = esc(link.label || d.label);
  if (!link.url) {
    return `<span class="btn btn-quiet is-soon" aria-disabled="true">${icon(d.icon, 15)}${label}<small>coming soon</small></span>`;
  }
  const cls = link.type === "github" ? "btn btn-quiet" : "btn btn-line";
  return `<a class="${cls}" href="${esc(link.url)}"${linkAttrs(link.url)}>${icon(d.icon, 15)}${label}</a>`;
}

function projectCard(p, headingLevel = 2) {
  const art = p.image
    ? `<img class="card-art" src="${esc(p.image)}" alt="" loading="lazy" decoding="async" width="640" height="360">`
    : `<div class="card-art card-art-icon" aria-hidden="true"><span>${esc(p.icon)}</span></div>`;
  return `<article class="project-card accent-${p.accent}" data-tags="${esc(JSON.stringify(p.tags))}">
  ${art}
  <div class="card-body">
    <h${headingLevel} class="card-title">${esc(p.title)}</h${headingLevel}>
    <p class="card-text">${esc(p.description)}</p>
    <ul class="tag-list" aria-label="Built with">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
    <div class="card-actions">${p.links.map(projectLink).join("")}</div>
  </div>
</article>`;
}

/* ───────────────────────── Home ───────────────────────── */

export function homePage({ site, projects, downloads }) {
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  const shown = featured.length ? featured : projects.slice(0, 3);

  const body = `<section class="hero">
  <canvas class="hero-matrix" aria-hidden="true"></canvas>
  <div class="wrap hero-inner">
    <h1 class="hero-title">${esc(site.home.headline)}</h1>
    <p class="hero-intro">${esc(site.home.intro)}</p>
    <div class="hero-actions">
      <a class="btn btn-solid" href="/projects">Browse projects</a>
      <a class="btn btn-line" href="/downloads">${icon("download", 15)}World downloads</a>
      <a class="btn btn-line" href="/projects#github">${icon("github", 15)}GitHub</a>
    </div>
  </div>
</section>

<section class="wrap section">
  <div class="section-head">
    <h2 class="section-title">Latest projects</h2>
    <a class="more-link" href="/projects">See all ${projects.length} projects</a>
  </div>
  <div class="project-grid project-grid-3">
    ${shown.map((p) => projectCard(p, 3)).join("\n")}
  </div>
</section>

<section class="wrap section split">
  <div class="panel accent-magenta">
    <h2 class="panel-title">Minecraft world archives</h2>
    <p class="panel-text">World backups from my old servers, ready to drop into your saves folder.</p>
    <ul class="row-list">
      ${downloads
        .map(
          (s) =>
            `<li><a href="/downloads#${s.id}"><span class="row-icon" aria-hidden="true">${esc(s.icon)}</span><span class="row-main">${esc(s.name)}</span><span class="row-meta">${s.versions.length} versions</span></a></li>`
        )
        .join("\n      ")}
    </ul>
    <a class="more-link" href="/downloads">See all world downloads</a>
  </div>
  <div class="panel accent-cyan" data-github-latest>
    <h2 class="panel-title">Recently updated on GitHub</h2>
    <p class="panel-text"><span data-github-count>All my</span> public repositories, loaded live from GitHub.</p>
    <ul class="row-list" data-github-list>
      <li class="skeleton-row"></li><li class="skeleton-row"></li><li class="skeleton-row"></li>
    </ul>
    <a class="more-link" href="/projects#github">Browse all repositories</a>
  </div>
</section>`;

  return { path: "/", file: "index.html", title: "", description: site.home.intro, body };
}

/* ───────────────────────── Projects (featured, more, GitHub) ───────────────────────── */

function githubSection(site) {
  const profileUrl = `https://github.com/${site.githubUser}`;
  return `<section class="wrap section" id="github" data-github-page>
  <div class="section-head">
    <h2 class="section-title">On GitHub</h2>
  </div>
  <p class="page-intro section-intro">Every public repository, loaded live from GitHub so it's always up to date.</p>

  <div class="profile" id="gh-profile" hidden>
    <img class="profile-avatar" id="gh-avatar" alt="" width="64" height="64">
    <div class="profile-body">
      <p class="profile-name" id="gh-name"></p>
      <p class="profile-bio" id="gh-bio"></p>
      <p class="profile-meta" id="gh-meta"></p>
    </div>
    <a class="btn btn-quiet" href="${profileUrl}" target="_blank" rel="noopener">${icon("github", 15)}View on GitHub</a>
  </div>

  <div class="toolbar">
    <label class="search-field">${icon("search", 16)}<span class="visually-hidden">Search repositories</span><input type="search" id="gh-search" placeholder="Search repositories" autocomplete="off"></label>
    <label><span class="visually-hidden">Language</span><select id="gh-lang"><option value="">All languages</option></select></label>
    <label><span class="visually-hidden">Sort by</span><select id="gh-sort">
      <option value="pushed">Recently updated</option>
      <option value="stars">Most stars</option>
      <option value="name">Name (A–Z)</option>
      <option value="created">Newest first</option>
    </select></label>
    <span class="toolbar-count" id="gh-count" aria-live="polite"></span>
  </div>

  <div class="repo-grid" id="gh-grid" aria-busy="true">
    ${'<div class="repo-card skeleton-card"></div>'.repeat(6)}
  </div>
  <p class="empty-note" id="gh-error" hidden>GitHub didn't answer, most likely because it limits how often visitors can ask. Wait a minute and <button type="button" class="text-button" id="gh-retry">try again</button>, or <a href="${profileUrl}" target="_blank" rel="noopener">see the repositories on GitHub</a>.</p>
  <noscript><p class="empty-note">This list needs JavaScript. You can <a href="${profileUrl}">see the repositories on GitHub</a> instead.</p></noscript>
</section>`;
}

export function projectsPage({ site, projects }) {
  const featured = projects.filter((p) => p.featured);
  const more = projects.filter((p) => !p.featured);
  const tags = [...new Set(more.flatMap((p) => p.tags))];

  const featuredSection = featured.length
    ? `<section class="wrap section" id="featured" aria-labelledby="featured-title">
  <div class="section-head"><h2 class="section-title" id="featured-title">Featured</h2></div>
  <div class="project-grid project-grid-3">
    ${featured.map((p) => projectCard(p, 3)).join("\n")}
  </div>
</section>`
    : "";

  const moreSection = more.length
    ? `<section class="wrap section">
<details class="more-projects" id="more">
  <summary>
    <span class="more-summary-text">
      <h2 class="section-title" id="more-title">More projects <span class="more-count">${more.length}</span></h2>
      <span class="more-hint">Smaller builds and experiments, most with a live demo you can try in the browser.</span>
    </span>
    <span class="more-toggle" aria-hidden="true"><span class="more-toggle-label"></span>${icon("chevron", 18)}</span>
  </summary>

  <div class="filter-bar" role="group" aria-label="Filter projects by tag">
    <button type="button" class="chip" data-filter="" aria-pressed="true">All <span class="chip-count">${more.length}</span></button>
    ${tags
      .map((t) => {
        const n = more.filter((p) => p.tags.includes(t)).length;
        return `<button type="button" class="chip" data-filter="${esc(t)}" aria-pressed="false">${esc(t)} <span class="chip-count">${n}</span></button>`;
      })
      .join("\n    ")}
  </div>

  <div class="project-grid" id="project-grid">
    ${more.map((p) => projectCard(p, 3)).join("\n")}
  </div>
  <p class="empty-note" id="filter-empty" hidden>No projects use that tag yet. <button type="button" class="text-button" data-filter-reset>Show all projects</button></p>
</details>
</section>`
    : "";

  const body = `<section class="wrap section page-top page-head">
  <h1 class="page-title">Projects</h1>
  <p class="page-intro">Things I've built, from the apps I use every day to small experiments, plus everything public on GitHub.</p>
  <nav class="filter-bar jump-links" aria-label="On this page">
    ${featured.length ? '<a class="chip" href="#featured">Featured</a>' : ""}
    ${more.length ? '<a class="chip" href="#more">More projects</a>' : ""}
    <a class="chip" href="#github">${icon("github", 14)}On GitHub</a>
  </nav>
</section>

${featuredSection}

${moreSection}

${githubSection(site)}`;

  return {
    path: "/projects",
    file: "projects.html",
    title: "Projects",
    description: "Projects by Adelando — Homeward, Gamified Health RPG, Turnkeeper, audio visualizers and tools — plus every public GitHub repository.",
    body,
  };
}

/* ───────────────────────── Downloads ───────────────────────── */

function soonButton(label, iconName) {
  return `<span class="btn btn-quiet is-soon" aria-disabled="true">${iconName ? icon(iconName, 15) : ""}${label}<small>coming soon</small></span>`;
}

function versionRow(v) {
  const details = [
    `<span class="${v.worlds ? "" : "is-pending"}">${esc(v.worlds || "List coming soon")}</span>`,
    v.excludes ? `<span class="detail-line"><b>Excludes</b> ${esc(v.excludes)}</span>` : "",
    v.note ? `<span class="detail-line"><b>Note</b> ${esc(v.note)}</span>` : "",
  ].join("");

  const actions = [
    v.download
      ? `<a class="btn btn-line" href="${esc(v.download)}"${linkAttrs(v.download)}>${icon("download", 15)}Download</a>`
      : soonButton("Download", "download"),
    v.resourcepack && v.resourcepack !== "soon"
      ? `<a class="btn btn-quiet" href="${esc(v.resourcepack)}"${linkAttrs(v.resourcepack)}>Resourcepack</a>`
      : v.resourcepack === "soon"
        ? soonButton("Resourcepack")
        : "",
  ].join("");

  return `<tr>
        <th scope="row"><span class="cell-label">Version</span>${esc(v.name)}</th>
        <td class="${v.size ? "" : "is-pending"}"><span class="cell-label">Size</span>${esc(v.size || "Coming soon")}</td>
        <td><span class="cell-label">Worlds</span>${details}</td>
        <td class="cell-actions">${actions}</td>
      </tr>`;
}

export function downloadsPage({ downloads }) {
  const servers = downloads
    .map((s) => {
      const badge = s.image
        ? `<img class="server-badge" src="${esc(s.image)}" alt="" width="72" height="72" loading="lazy" decoding="async">`
        : `<span class="server-badge server-badge-icon" aria-hidden="true">${esc(s.icon)}</span>`;
      return `<section class="server accent-${s.accent}" id="${s.id}">
    <header class="server-head">
      ${badge}
      <div>
        <h2 class="server-name">${esc(s.name)}</h2>
        <p class="server-text">${esc(s.description)}</p>
      </div>
    </header>
    <table class="version-table">
      <thead><tr><th scope="col">Version</th><th scope="col">Size</th><th scope="col">Worlds</th><th scope="col"><span class="visually-hidden">Download</span></th></tr></thead>
      <tbody>
      ${s.versions.map(versionRow).join("\n      ")}
      </tbody>
    </table>
    <details class="install">
      <summary>How to install a ${esc(s.name)} world ${icon("chevron", 16)}</summary>
      <ol>${s.install.map((step) => `<li>${rich(step)}</li>`).join("")}</ol>
    </details>
  </section>`;
    })
    .join("\n");

  const body = `<section class="wrap section page-top">
  <h1 class="page-title">World downloads</h1>
  <p class="page-intro">World backups from my old Minecraft servers. Pick a server, then the version you played on.</p>
  <nav class="filter-bar" aria-label="Servers">
    ${downloads.map((s) => `<a class="chip" href="#${s.id}"><span aria-hidden="true">${esc(s.icon)}</span> ${esc(s.name)}</a>`).join("\n    ")}
  </nav>
  ${servers}
</section>`;

  return {
    path: "/downloads",
    file: "downloads.html",
    title: "Downloads",
    description: "Download Minecraft world archives from the Aydaacraft and CreativityCraft servers.",
    body,
  };
}

/* ───────────────────────── About ───────────────────────── */

export function aboutPage({ site }) {
  const a = site.about;
  const avatar = a.photo
    ? `<img class="about-photo" src="${esc(a.photo)}" alt="${esc(a.name)}" width="120" height="120">`
    : `<span class="about-photo about-photo-fallback" aria-hidden="true">${esc(a.name[0])}</span>`;

  const platform = (p) => {
    const inner = `<span class="platform-icon">${icon(p.icon, 20)}</span>
        <span class="platform-name">${esc(p.name)}</span>
        <span class="platform-user">${esc(p.username)}</span>
        <span class="platform-note">${esc(p.note || "")}</span>`;
    return p.url
      ? `<li><a class="platform" href="${esc(p.url)}" target="_blank" rel="noopener">${inner}</a></li>`
      : `<li><div class="platform">${inner}</div></li>`;
  };

  const body = `<section class="wrap section page-top about-head">
  ${avatar}
  <div>
    <h1 class="page-title">${esc(a.name)}</h1>
    <p class="aka">Also known as ${a.aka.map((n) => `<b>${esc(n)}</b>`).join(" and ")}</p>
    <p class="page-intro">${esc(a.tagline)}</p>
  </div>
</section>

<section class="wrap section">
  <dl class="fact-grid">
    ${a.facts
      .map(
        (f) => `<div class="fact"><span class="fact-icon" aria-hidden="true">${esc(f.icon)}</span><dt>${esc(f.title)}</dt><dd>${esc(f.text)}</dd></div>`
      )
      .join("\n    ")}
  </dl>
</section>

<section class="wrap section">
  <div class="section-head">
    <h2 class="section-title">Find me online</h2>
  </div>
  <p class="page-intro">${esc(a.platformsNote)}</p>
  <ul class="platform-list">
    ${a.platforms.map(platform).join("\n    ")}
  </ul>
</section>`;

  return {
    path: "/about",
    file: "about.html",
    title: "About",
    description: "Australian coder, Minecraft server hoster, and open-source experimenter.",
    body,
  };
}

/* ───────────────────────── 404 ───────────────────────── */

export function notFoundPage() {
  const body = `<section class="wrap section page-top notfound">
  <p class="notfound-code" aria-hidden="true">404</p>
  <h1 class="page-title">This page doesn't exist.</h1>
  <p class="page-intro">I asked the server for it anyway. It said:</p>
  <div class="terminal" aria-live="polite"><span class="terminal-prompt" aria-hidden="true">&gt;</span><span id="typed-text"></span><span class="terminal-cursor" aria-hidden="true"></span></div>
  <div class="hero-actions">
    <a class="btn btn-solid" href="/">${icon("home", 15)}Go to the home page</a>
    <button class="btn btn-line" type="button" id="retry-btn">${icon("retry", 15)}Ask again</button>
  </div>
</section>`;

  return {
    path: "/404",
    file: "404.html",
    title: "Page not found",
    description: "The page you're looking for doesn't exist.",
    noindex: true,
    body,
  };
}
