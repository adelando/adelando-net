# Deploying adelando.net to Cloudflare

This sets up adelando.net the same way as Homeward: a **Cloudflare Worker
serving static assets**, connected to this GitHub repository, so every push to
`main` deploys itself. It costs nothing, and needs no database, server,
environment variable or secret.

> **Why a Worker and not "Pages"?** Cloudflare has folded Pages into Workers,
> and Homeward was migrated across. New projects should start as a Worker. The
> result is the same thing you would get from Pages (static files on
> Cloudflare's network, deployed from Git), but it is configured by
> `wrangler.jsonc` in the repo instead of by dashboard guesses.

---

## Before you start

- **Merge this setup into `main` first.** Cloudflare deploys whatever is on the
  production branch, and `wrangler.jsonc` must be on it, or the very first
  build fails before it does anything.
- **adelando.net is already on Cloudflare** (its DNS runs through Cloudflare,
  which is why the live site shows `server: cloudflare`). That makes the domain
  step a two-minute job. If the domain were ever elsewhere, you would add it to
  Cloudflare as a site first.
- **The Drawbridge PHP app will not come across.** Cloudflare serves files; it
  does not run PHP. The Drawbridge *zips* are in the repo and keep working. The
  running app at `/projects/drawbridge/drawbridge/` lives only on the old host.
  If you want it online, keep the old host running it under a subdomain (e.g.
  `drawbridge.adelando.net`) before you cancel anything.

---

## Part 1: create the Worker

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com) and open
   **Workers & Pages** in the sidebar. Cloudflare moves this around; at the
   time of writing it sits under **Compute**.
2. **Create** → **Workers** tab → **Import a repository** (sometimes labelled
   **Connect to Git**).
3. Authorise Cloudflare to see your GitHub account if it asks, pick
   `adelando/adelando-net`, and continue.

### Build settings

| Field | Value |
|---|---|
| Project name | `adelando-net`. **Must match `name` in `wrangler.jsonc`**, or builds fail |
| Production branch | `main` |
| Build command | *(leave empty)* |
| Deploy command | `npx wrangler deploy` |
| Root directory / path | `/` *(the default)* |
| Environment variables | none |

There is no build step: `wrangler.jsonc` tells Cloudflare to upload `site/` as
is. If a deploy ever fails having produced nothing, check the project name and
deploy command first, then `wrangler.jsonc`.

**Deploy**, and wait about a minute.

### Check it before touching the domain

Open the address Cloudflare gives you:
`https://adelando-net.<your-subdomain>.workers.dev`. Check:

- the home page loads at `/`
- the nav links work and the URLs keep their `.html`
- a made-up address like `/nope` shows the "No" 404 page
- a project demo opens, e.g. `/projects/palette.html`

That address is told not to be indexed by search engines (see
`site/_headers`), so it will not compete with the real site.

---

## Part 2: move adelando.net across

The domain currently points at the old host. Moving it means removing the old
DNS records and letting the Worker claim the hostnames.
**The site is briefly unreachable** between steps 2 and 3, typically a minute
or two, so do them back to back.

1. **Note down the old records.** Cloudflare dashboard → the `adelando.net`
   site → **DNS** → **Records**. Find the `A`/`AAAA`/`CNAME` records named
   `adelando.net` (shown as `@`) and `www`. Screenshot them; they are your way
   back. **Leave everything else alone**, especially `MX` and `TXT` records,
   which run email and domain verification.
2. **Delete those `@` and `www` web records.** A Worker cannot claim a hostname
   that already has a record.
3. **Attach the domains to the Worker.** **Workers & Pages** → `adelando-net` →
   **Settings** → **Domains & Routes** → **Add** → **Custom domain**. Enter
   `adelando.net` and add it. Then do the same for `www.adelando.net`.
   Cloudflare creates the DNS records and the certificate itself.
4. Wait a minute or two until both show as **Active**, then open
   `https://adelando.net` and `https://www.adelando.net`.

### Going back

If something is wrong: remove the two custom domains from the Worker, then
re-create the old DNS records from your screenshot. The old host is untouched
until you cancel it, so this is a complete undo.

---

## Part 3: tidy up (optional)

- **Rocket Loader.** The live site currently has Cloudflare's Rocket Loader on,
  which rewrites every page's scripts as it is served. It is a zone setting, so
  it stays on after the move. The site does not need it. To turn it off:
  the `adelando.net` site → **Speed** → **Optimization** → **Content
  Optimization** → **Rocket Loader**.
- **Web Analytics** and the **managed robots.txt** are also zone settings and
  carry on unchanged.
- **Cancel the old host** once you are happy, and not before you have dealt
  with Drawbridge (see above).

---

## Day to day

| To... | Do |
|---|---|
| Change the site | Edit files in `site/`, commit, push to `main`. Live in about a minute |
| Preview locally | `npm run serve` (quick), or `npm install && npm run preview` (exactly as Cloudflare serves it, at http://localhost:8787) |
| Deploy by hand | `npx wrangler login` once, then `npm run deploy` |
| See deploys / roll back | Worker → **Deployments**. Any earlier version can be rolled back to in one click |

Pushes to other branches get their own preview address if **Settings → Build →
Branch control** has non-production builds turned on. Those addresses are
`noindex` too.

---

## What the config does

- **`wrangler.jsonc`**: names the Worker, serves only `site/`, answers missing
  pages with `404.html` and a real 404 status (replacing the old `.htaccess`),
  and sets `html_handling: "none"` so `/about.html` is served as-is rather than
  redirected to `/about`.
- **`site/_redirects`**: one rule, `/ → /index.html`, because
  `html_handling: "none"` stops `/` finding the home page on its own.
- **`site/_headers`**: pages are `no-cache` so edits show up immediately;
  images and downloads are cached for a week, the stylesheet for an hour; and
  `workers.dev` preview copies are marked `noindex`.

Neither `_headers` nor `_redirects` is served to visitors. Cloudflare reads
them and applies them.
