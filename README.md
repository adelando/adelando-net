# Adelando.net 🌐

[![Website Live](https://img.shields.io/badge/Live-adelando.net-blue?style=flat-square)](https://adelando.net)

Source for **[adelando.net](https://adelando.net)** — my projects, Minecraft world downloads, GitHub repos and an about page.

The site is plain HTML, CSS and JavaScript. A small build script (no dependencies, just Node) turns the files in `content/` into finished pages in `dist/`, which Cloudflare Workers serves.

## Editing the site

Everything you'd normally change lives in `content/`. Each file has instructions at the top.

| I want to…                                   | Edit this                |
| -------------------------------------------- | ------------------------ |
| Add, remove or reorder a project             | `content/projects.mjs`   |
| Add a world download or a server             | `content/downloads.mjs`  |
| Change the menu, home page text or About page | `content/site.mjs`       |
| Add an image, a demo page or a download file | drop it in `public/`     |
| Change colours or styling                    | `src/site.css` (colours are at the top) |
| Change a page's layout                       | `src/pages.mjs`          |

### Add a project

Open `content/projects.mjs` and paste a new block at the top of the list:

```js
{
  title: "My new thing",
  description: "What it does, in a sentence or two.",
  icon: "🚀",
  accent: "cyan",                  // cyan, magenta or purple
  tags: ["HTML", "JavaScript"],
  featured: true,                  // optional: show it on the home page
  links: [
    { type: "demo", url: "/projects/my-new-thing.html" },
    { type: "github", url: "https://github.com/adelando/my-new-thing" },
  ],
},
```

Put the demo file in `public/projects/`. The projects page, the tag filter buttons and the home page update on the next build. If something is missing or mistyped, the build tells you which project and what to fix.

## Preview on your computer

You need [Node.js](https://nodejs.org) 18 or newer. Nothing to install after that.

```bash
npm run dev
```

Open http://localhost:8000. The site rebuilds whenever you save a file; refresh the browser to see it.

## Publishing (Cloudflare Workers)

`wrangler.jsonc` tells Cloudflare to serve the `dist/` folder as static files.

**From your computer**

```bash
npm run deploy
```

**Automatically on every push** — in the Cloudflare dashboard, connect this repository to the Worker (Workers Builds) and set:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

## What's in the repo

```
content/     the words and data: projects, downloads, site settings
public/      files copied to the site as-is: images, fonts, demo pages, favicon
src/         page templates, the stylesheet and the script
build.mjs    turns the above into dist/
dist/        the finished site (generated, not committed)
```

## Drawbridge

`public/projects/drawbridge/` holds the zip builds only, with no `index.html`, so the Drawbridge card's Downloads button returns a 404 until a page is added there or the card links to the zips directly.

## Credits

- 404 replies from [no-as-a-service](https://github.com/hotheadhacker/no-as-a-service).
- Typeface: [Bricolage Grotesque](https://github.com/ateliertriay/bricolage), SIL Open Font License.
