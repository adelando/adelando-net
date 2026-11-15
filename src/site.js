// Adelando.net — all the site's behaviour. Each block only runs on
// pages that contain the elements it needs.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ── Dev preview banner: only on Cloudflare preview copies (*.workers.dev), never on adelando.net ── */
if (location.hostname.endsWith(".workers.dev")) {
  const banner = document.createElement("div");
  banner.className = "preview-banner";
  banner.setAttribute("role", "note");
  banner.innerHTML = 'Dev preview: this isn\'t the live site. <a href="https://adelando.net">Go to adelando.net</a>';
  document.body.prepend(banner);
}

/* ── Mobile menu ── */
{
  const toggle = $(".nav-toggle");
  const nav = $("#site-nav");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
  });
}

/* ── Home hero: an LED dot matrix playing a spectrum, like the visualizers ── */
{
  const canvas = $(".hero-matrix");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const STEP = 16;
    const COLORS = [[0, 212, 255], [157, 0, 255], [255, 0, 128]];
    let w = 0, h = 0, cols = 0, rows = 0, raf = 0, visible = true;

    const colorAt = (t) => {
      const seg = t < 0.5 ? 0 : 1;
      const k = (t - seg * 0.5) * 2;
      const a = COLORS[seg], b = COLORS[seg + 1];
      return `${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)}`;
    };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / STEP);
      rows = Math.ceil(h / STEP);
      draw(performance.now());
    };

    const draw = (now) => {
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);
      // On wide screens the bars stay on the right so the headline stays readable.
      const narrow = w < 760;
      for (let c = 0; c < cols; c++) {
        const x = c / cols;
        const reach = narrow ? 0.34 : Math.min(1, Math.max(0, (x - 0.44) / 0.28));
        const level =
          0.5 +
          0.22 * Math.sin(c * 0.45 + t * 1.7) +
          0.16 * Math.sin(c * 0.17 - t * 1.1) +
          0.12 * Math.sin(c * 1.3 + t * 2.6);
        const barRows = Math.max(0, level) * rows * 0.78 * reach;
        // Colour sweeps cyan → purple → magenta across the part of the grid that has bars.
        const rgb = colorAt(narrow ? x : Math.min(1, Math.max(0, (x - 0.44) / 0.56)));
        for (let r = 0; r < rows; r++) {
          const fromBottom = rows - r;
          let alpha = 0.07;
          if (fromBottom <= barRows) {
            alpha = narrow ? 0.3 : 0.25 + 0.6 * (fromBottom / Math.max(barRows, 1));
            if (barRows - fromBottom < 1) alpha = narrow ? 0.5 : 1;
          }
          ctx.fillStyle = `rgba(${rgb},${alpha})`;
          ctx.beginPath();
          ctx.arc(c * STEP + STEP / 2, r * STEP + STEP / 2, alpha > 0.1 ? 2.6 : 1.4, 0, 6.2832);
          ctx.fill();
        }
      }
    };

    // ~30fps is plenty for this, and it stops when off-screen or the tab is hidden.
    let last = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return;
      last = now;
      draw(now);
    };
    const update = () => {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden && !reducedMotion) raf = requestAnimationFrame(loop);
    };

    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; update(); }).observe(canvas);
    document.addEventListener("visibilitychange", update);
  }
}

/* ── Projects: tag filter ── */
{
  const grid = $("#project-grid");
  if (grid) {
    const chips = $$("[data-filter]");
    const cards = $$(".project-card", grid);
    const empty = $("#filter-empty");

    const apply = (tag, push = true) => {
      let shown = 0;
      for (const card of cards) {
        const match = !tag || JSON.parse(card.dataset.tags).includes(tag);
        card.hidden = !match;
        if (match) shown++;
      }
      for (const chip of chips) chip.setAttribute("aria-pressed", chip.dataset.filter === tag);
      empty.hidden = shown > 0;
      if (push) history.replaceState(null, "", (tag ? `?tag=${encodeURIComponent(tag)}` : location.pathname) + location.hash);
    };

    for (const chip of chips) chip.addEventListener("click", () => apply(chip.dataset.filter));
    $("[data-filter-reset]")?.addEventListener("click", () => apply(""));

    // "More projects" starts collapsed. Open it when a link points at it
    // (#more) or the URL asks for a tag, e.g. /projects?tag=Canvas.
    const more = $("#more");
    const openMore = () => { if (more && location.hash === "#more") more.open = true; };
    openMore();
    addEventListener("hashchange", openMore);
    for (const link of $$('a[href="#more"]')) link.addEventListener("click", () => { if (more) more.open = true; });

    const initial = new URLSearchParams(location.search).get("tag");
    if (initial) {
      if (more) more.open = true;
      apply(initial, false);
    }
  }
}

/* ── GitHub data (shared by the home page and the GitHub page) ── */
const GH_USER = document.body.dataset.githubUser;
const GH_CACHE_KEY = `gh:${GH_USER}`;
const GH_CACHE_MINUTES = 15;

async function loadGitHub({ fresh = false } = {}) {
  if (!fresh) {
    try {
      const cached = JSON.parse(sessionStorage.getItem(GH_CACHE_KEY));
      if (cached && Date.now() - cached.at < GH_CACHE_MINUTES * 60000) return cached.data;
    } catch { /* no cache, carry on */ }
  }
  const get = async (url) => {
    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    return res.json();
  };
  const base = `https://api.github.com/users/${GH_USER}`;
  const reposFrom = async (page) => {
    const batch = await get(`${base}/repos?per_page=100&page=${page}&sort=pushed`);
    return batch.length === 100 ? batch.concat(await reposFrom(page + 1)) : batch;
  };
  const [user, repos] = await Promise.all([get(base), reposFrom(1)]);
  // Keep only what the pages use, so the cache stays small.
  const data = {
    user: {
      name: user.name, login: user.login, bio: user.bio, avatar: user.avatar_url,
      repos: user.public_repos, followers: user.followers, following: user.following, location: user.location,
    },
    repos: repos.map((r) => ({
      name: r.name, url: r.html_url, description: r.description, language: r.language, fork: r.fork,
      stars: r.stargazers_count, forks: r.forks_count, issues: r.open_issues_count,
      pushed: r.pushed_at, created: r.created_at, topics: r.topics || [],
    })),
  };
  try { sessionStorage.setItem(GH_CACHE_KEY, JSON.stringify({ at: Date.now(), data })); } catch { /* storage full or blocked */ }
  return data;
}

const shortDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

/* Home: latest repos panel */
{
  const panel = $("[data-github-latest]");
  if (panel) {
    const list = $("[data-github-list]", panel);
    loadGitHub()
      .then(({ user, repos }) => {
        $("[data-github-count]", panel).textContent = user.repos ? `All ${user.repos}` : "All my";
        list.innerHTML = repos
          .slice(0, 4)
          .map(
            (r) =>
              `<li><a href="${escapeHtml(r.url)}" target="_blank" rel="noopener"><span class="row-main">${escapeHtml(r.name)}</span><span class="row-meta">${shortDate(r.pushed)}</span></a></li>`
          )
          .join("");
      })
      .catch(() => { list.hidden = true; });
  }
}

/* GitHub page: profile, search, filter, sort */
{
  const page = $("[data-github-page]");
  if (page) {
    const LANG_COLORS = {
      JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", HTML: "#e34c26", CSS: "#563d7c",
      SCSS: "#c6538c", Java: "#b07219", "C#": "#178600", "C++": "#f34b7d", C: "#555555", PHP: "#4F5D95",
      Ruby: "#701516", Go: "#00ADD8", Rust: "#dea584", Swift: "#F05138", Kotlin: "#A97BFF", Shell: "#89e051",
      PowerShell: "#012456", Lua: "#000080", Dart: "#00B4AB", Vue: "#41b883", Svelte: "#ff3e00",
      Dockerfile: "#384d54", YAML: "#cb171e", Makefile: "#427819",
    };
    const grid = $("#gh-grid"), search = $("#gh-search"), lang = $("#gh-lang"), sort = $("#gh-sort");
    const count = $("#gh-count"), error = $("#gh-error");
    const skeleton = grid.innerHTML;
    let repos = [];

    const SORTS = {
      pushed: (a, b) => new Date(b.pushed) - new Date(a.pushed),
      created: (a, b) => new Date(b.created) - new Date(a.created),
      stars: (a, b) => b.stars - a.stars,
      name: (a, b) => a.name.localeCompare(b.name),
    };

    const card = (r) => `<a class="repo-card" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">
      <div class="repo-top"><span class="repo-name">${escapeHtml(r.name)}</span>${r.fork ? '<span class="repo-fork">Fork</span>' : ""}</div>
      <p class="repo-desc${r.description ? "" : " is-pending"}">${escapeHtml(r.description || "No description yet.")}</p>
      <div class="repo-meta">
        ${r.language ? `<span class="repo-lang"><span class="lang-dot" style="background:${LANG_COLORS[r.language] || "#8b949e"}"></span>${escapeHtml(r.language)}</span>` : ""}
        ${r.stars ? `<span>★ ${r.stars}</span>` : ""}
        ${r.forks ? `<span>${r.forks} fork${r.forks > 1 ? "s" : ""}</span>` : ""}
        ${r.issues ? `<span>${r.issues} open issue${r.issues > 1 ? "s" : ""}</span>` : ""}
        <span>Updated ${shortDate(r.pushed)}</span>
      </div></a>`;

    const render = () => {
      const q = search.value.toLowerCase().trim();
      const list = repos
        .filter(
          (r) =>
            (!lang.value || r.language === lang.value) &&
            (!q || [r.name, r.description || "", ...r.topics].some((s) => s.toLowerCase().includes(q)))
        )
        .sort(SORTS[sort.value]);
      count.textContent = `${list.length} ${list.length === 1 ? "repository" : "repositories"}`;
      grid.innerHTML = list.length
        ? list.map(card).join("")
        : '<p class="empty-note" style="grid-column:1/-1;margin:0">No repositories match that search.</p>';
    };

    const start = async (fresh) => {
      error.hidden = true;
      grid.innerHTML = skeleton;
      grid.setAttribute("aria-busy", "true");
      try {
        const data = await loadGitHub({ fresh });
        repos = data.repos;
        const u = data.user;
        $("#gh-avatar").src = u.avatar;
        $("#gh-name").textContent = u.name || u.login;
        $("#gh-bio").textContent = u.bio || "";
        $("#gh-meta").innerHTML = [
          u.repos && `<span><b>${u.repos}</b> repos</span>`,
          u.followers && `<span><b>${u.followers}</b> followers</span>`,
          u.following && `<span>following <b>${u.following}</b></span>`,
          u.location && `<span>${escapeHtml(u.location)}</span>`,
        ].filter(Boolean).join("");
        $("#gh-profile").hidden = false;
        lang.length = 1;
        for (const l of [...new Set(repos.map((r) => r.language).filter(Boolean))].sort()) lang.add(new Option(l, l));
        render();
      } catch {
        grid.innerHTML = "";
        count.textContent = "";
        error.hidden = false;
      }
      grid.removeAttribute("aria-busy");
    };

    search.addEventListener("input", render);
    lang.addEventListener("change", render);
    sort.addEventListener("change", render);
    $("#gh-retry").addEventListener("click", () => start(true));
    start(false);
  }
}

/* ── 404: "No-as-a-Service" typewriter ── */
{
  const out = $("#typed-text");
  if (out) {
    const btn = $("#retry-btn");
    let replies = [
      "The page you're looking for declined to exist.",
      "Whatever you were after — it said no.",
      "404: The content politely ghosted you.",
    ];
    let timer;

    const type = () => {
      clearTimeout(timer);
      const msg = replies[Math.floor(Math.random() * replies.length)];
      if (reducedMotion) { out.textContent = msg; return; }
      out.textContent = "";
      btn.disabled = true;
      let i = 0;
      const next = () => {
        out.textContent += msg[i++];
        if (i < msg.length) timer = setTimeout(next, msg[i - 1] === " " ? 25 : 20 + Math.random() * 45);
        else btn.disabled = false;
      };
      next();
    };

    btn.addEventListener("click", type);
    fetch("/404_response.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((list) => { if (Array.isArray(list) && list.length) replies = list; })
      .catch(() => { /* keep the built-in replies */ })
      .finally(type);
  }
}
