# Adelando.net 🌐

[![Website Live](https://img.shields.io/badge/Live-adelando.net-blue?style=flat-square)](https://adelando.net)
[![GitHub Repo](https://img.shields.io/badge/Repository-adelando--net-black?logo=github&style=flat-square)](https://github.com/adelando/adelando-net)

The official repository for **[adelando.net](https://adelando.net)**. This repository contains the source code for my personal website, serving as the central hub for my digital presence, portfolio, and active projects.

---

## 🗺️ Site Structure & Pages

The website is divided into several key sections to showcase my work, background, and tools:

* **Home:** The main landing page providing an overview of who I am and quick links to my latest work.
* **Projects:** A showcase of my development projects, scripts, and automation tools—including my custom integrations and local AI builds.
* **About:** More information about my professional background, certifications, and experience.
* **404 Error ("No-as-a-Service"):** A custom, tongue-in-cheek 404 page functioning as a "No-as-a-Service" endpoint. If you hit a dead link, you're in the wrong place—but at least you'll get a definitive, stylish "no" for your trouble.

## 📁 What's Here

```
site/                everything that gets served
  index.html         Home
  projects.html      Projects
  downloads.html     Minecraft world downloads
  github.html        Repos, fetched live from the GitHub API
  about.html         About
  404.html           "No-as-a-Service" 404 page
  404_response.json  the 404 page's list of ways to say no
  css/  images/      styles and pictures
  projects/          the project demos, plus the Drawbridge zips
  _headers           caching rules, read by Cloudflare (not served)
  _redirects         serves index.html at "/" (not served)
wrangler.jsonc       Cloudflare deploy config
package.json         serve / preview / deploy scripts
```

There is no framework and no build step. The files in `site/` are exactly what
visitors get.

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adelando/adelando-net.git
   cd adelando-net
   ```
2. **Run the site locally** (needs Python only):
   ```bash
   npm run serve        # or: python3 -m http.server 4173 --directory site
   ```
   Then open http://localhost:4173.
3. **Preview it exactly as Cloudflare serves it** (404 page, headers, `/` rewrite):
   ```bash
   npm install
   npm run preview      # http://localhost:8787
   ```

## ☁️ Deploying

`adelando.net` is a Cloudflare Worker serving static assets, the same setup as
Homeward. `wrangler.jsonc` points it at `site/` and there is no build step, so
the Git-connected Worker only needs a deploy command:

| Setting | Value |
|---|---|
| Build command | *(leave empty)* |
| Deploy command | `npx wrangler deploy` |

Every push to `main` deploys. The full first-time walkthrough, including moving
the domain across from the old host, is in [docs/deploying.md](docs/deploying.md).

To deploy by hand instead: `npx wrangler deploy`.

### Things worth not breaking

- **Only `site/` is served.** Anything at the repo root (this README,
  `wrangler.jsonc`, `package.json`) stays private.
- **`.html` URLs are served as-is.** `html_handling` is `"none"` so `/about.html`
  is not redirected to `/about`; `site/_redirects` restores `/` → `index.html`.
- **Missing pages get `404.html` with a real 404 status.** Its links are
  root-relative (`/css/style.css`) so it still renders at any depth.

## 🛠️ Built With
 * **HTML5 & CSS3** - Core structure, layout, and styling.
 * **JavaScript** - For dynamic interactions and frontend logic.
## 🤝 Contributing
Since this is a personal website repository, direct contributions are rare, but suggestions, bug reports, and optimizations are always welcome!
 1. Fork the Project
 2. Create your Feature Branch (git checkout -b feature/Enhancement)
 3. Commit your Changes (git commit -m 'Add a cool enhancement')
 4. Push to the Branch (git push origin feature/Enhancement)
 5. Open a Pull Request
## 📝 License
Distributed under the MIT License. See LICENSE for more information.