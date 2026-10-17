// Renders the tools website from data/tools.json (generated from tools.yaml by scripts/build.py).

const LANGS = { r: "R", python: "Python", web: "Web" };
const $ = (sel, el = document) => el.querySelector(sel);

const state = { q: "", lang: "", cat: "", dataset: "", view: "grid" };
let DATA, STATS, TOOLS, DSETS;

// ------------------------------------------------------------------ helpers
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Minimal inline markdown: links, `code`, **bold**, _italic_.
function md(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,:;]|$)/g, "$1<i>$2</i>");
}
const plain = (s) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[`*]/g, "").replace(/(^|\s)_([^_]+)_/g, "$1$2");

function ago(iso) {
  const days = (Date.now() - new Date(iso)) / 864e5;
  if (days < 1) return "today";
  if (days < 2) return "yesterday";
  if (days < 30) return `${Math.floor(days)} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;
  const y = Math.floor(days / 365);
  return `${y} yr${y > 1 ? "s" : ""} ago`;
}

const ICON_STAR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .25a.75.75 0 0 1 .67.42l1.88 3.8 4.2.61a.75.75 0 0 1 .41 1.28l-3.04 2.96.72 4.18a.75.75 0 0 1-1.09.79L8 12.33l-3.75 1.97a.75.75 0 0 1-1.09-.8l.72-4.17L.84 6.37a.75.75 0 0 1 .42-1.28l4.2-.61L7.33.67A.75.75 0 0 1 8 .25z"/></svg>';
const ICON_CLOCK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0zm7-3.25v2.99l2.53 1.46a.75.75 0 0 1-.75 1.3l-2.9-1.68A.75.75 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0z"/></svg>';

const stars = (t) => STATS?.repos?.[t.repo]?.stars ?? 0;

// -------------------------------------------------------------------- cards
function card(t, { compact = false } = {}) {
  const s = STATS?.repos?.[t.repo];
  const ds = Object.entries(t.datasets || {});
  const status = t.status !== "stable"
    ? `<span class="status ${t.status}" title="${t.status === "wip" ? "Work in progress" : "Data access is restricted"}">${t.status === "wip" ? "WIP" : "restricted"}</span>` : "";
  const repoUrl = t.repo ? `https://github.com/${t.repo}` : null;
  const docsDiffer = repoUrl && !t.url.startsWith(repoUrl);
  return `
  <article class="card" data-lang="${t.language}"${compact ? "" : ` id="tool-${t.id}"`}>
    <div class="card-head">
      <h3><a href="${esc(t.url)}">${esc(t.name)}</a></h3>
      <span class="spacer"></span>${status}${t.maintainer ? `<span class="status ext" title="Not one of our tools - maintained by ${esc(t.maintainer)}">by ${esc(t.maintainer)}</span>` : ""}<span class="tag">${LANGS[t.language]}</span>
    </div>
    <p>${md(t.summary)}</p>
    ${!compact && ds.length ? `<div class="ds">${ds.slice(0, 7).map(([d, k]) =>
      `<span class="${k}" title="${k} support">${esc(DSETS[d].name)}</span>`).join("")}${ds.length > 7 ? `<span>+${ds.length - 7}</span>` : ""}</div>` : ""}
    <div class="card-foot">
      ${s ? `<span title="GitHub stars">${ICON_STAR} ${s.stars}</span><span title="Last push to GitHub">${ICON_CLOCK} ${ago(s.pushed_at)}</span>` : ""}
      <span class="links">${docsDiffer ? `<a href="${esc(t.url)}">Docs</a>` : ""}${repoUrl ? `<a href="${repoUrl}">GitHub</a>` : ""}</span>
    </div>
  </article>`;
}

// ------------------------------------------------------------------ filters
function matches(t) {
  if (state.lang && t.language !== state.lang) return false;
  if (state.cat && t.category !== state.cat) return false;
  if (state.dataset && !(state.dataset in (t.datasets || {}))) return false;
  if (state.q) {
    const hay = `${t.name} ${t.id} ${t.maintainer || ""} ${plain(t.summary)} ${LANGS[t.language]} ${Object.keys(t.datasets || {}).map((d) => DSETS[d].name).join(" ")}`.toLowerCase();
    return state.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
  }
  return true;
}

function renderFilters() {
  const chip = (group, val, label, extra = "") =>
    `<button type="button" class="chip${state[group] === val ? " active" : ""}" data-group="${group}" data-val="${val}" ${extra} aria-pressed="${state[group] === val}">${label}</button>`;
  $("#lang-chips").innerHTML = chip("lang", "", "All") +
    Object.entries(LANGS).map(([k, v]) => chip("lang", k, v, `data-lang="${k}"`)).join("");
  $("#cat-chips").innerHTML = chip("cat", "", "All categories") +
    DATA.categories.map((c) => chip("cat", c.id, c.name)).join("");
}

function renderTools() {
  renderFilters();
  const list = TOOLS.filter(matches);
  const grid = $("#tool-grid"), pairs = $("#pair-view");
  grid.hidden = state.view !== "grid";
  pairs.hidden = state.view !== "pairs";
  document.querySelectorAll(".view-toggle button").forEach((b) => b.classList.toggle("active", b.dataset.view === state.view));
  $("#dataset-filter").value = state.dataset;

  if (state.view === "grid") {
    grid.innerHTML = list.length ? list.map((t) => card(t)).join("")
      : `<div class="empty">No tools match these filters. <a href="#tools" data-reset>Reset filters</a></div>`;
    $("#result-count").textContent = `${list.length} of ${TOOLS.length} tools`;
  } else {
    const ok = new Set(list.map((t) => t.id));
    const byId = Object.fromEntries(TOOLS.map((t) => [t.id, t]));
    const rows = DATA.pairs.filter((p) => [...p.r, ...p.python].some((i) => ok.has(i)));
    pairs.innerHTML = `<div class="pair-head"><span class="r">R</span><span></span><span class="python">Python</span></div>` +
      (rows.length ? rows.map((p) => `
      <div class="pair">
        <div class="pair-side r">${p.r.map((i) => card(byId[i], { compact: true })).join("")}</div>
        <div class="pair-mid"><span>${esc(p.what)}</span></div>
        <div class="pair-side python">${p.python.map((i) => card(byId[i], { compact: true })).join("")}</div>
      </div>`).join("") : `<div class="empty">No R ↔ Python pairs match these filters.</div>`);
    $("#result-count").textContent = `${rows.length} of ${DATA.pairs.length} R ↔ Python pairs`;
  }
  document.querySelectorAll("#matrix tbody tr").forEach((tr) => tr.classList.toggle("selected", tr.dataset.id === state.dataset));
}

function bindFilters() {
  $("#q").addEventListener("input", (e) => { state.q = e.target.value.trim(); renderTools(); });
  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) { state[chip.dataset.group] = chip.dataset.val; renderTools(); }
    const view = e.target.closest(".view-toggle button");
    if (view) { state.view = view.dataset.view; renderTools(); }
    if (e.target.closest("[data-reset]")) {
      Object.assign(state, { q: "", lang: "", cat: "", dataset: "" });
      $("#q").value = ""; renderTools();
    }
  });
  const sel = $("#dataset-filter");
  sel.innerHTML += DATA.datasets.map((d) => `<option value="${d.id}">${esc(d.name)}${d.access === "restricted" ? " (restricted)" : ""}</option>`).join("");
  sel.addEventListener("change", () => { state.dataset = sel.value; renderTools(); });
}

// Scroll to a tool's card (switching to the grid and clearing filters that would hide it).
function showTool(id) {
  const t = TOOLS.find((x) => x.id === id);
  if (!t) return;
  if (state.view !== "grid" || !matches(t)) {
    Object.assign(state, { q: "", lang: "", cat: "", dataset: "", view: "grid" });
    $("#q").value = "";
    renderTools();
  }
  const el = document.getElementById(`tool-${id}`);
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
}

// ------------------------------------------------------------------- matrix
function renderMatrix() {
  const cols = ["r", "python", "web"].map((lang) => TOOLS.filter((t) => t.language === lang && Object.keys(t.datasets).length));
  const flat = cols.flatMap((c, i) => (i ? ["gap", ...c] : c));
  const head = `<thead><tr><th></th>${flat.map((t) => t === "gap" ? `<th class="group-gap"></th>` :
    `<th class="col ${t.language}" data-tool="${t.id}"><a href="#tool-${t.id}" data-show="${t.id}" title="${esc(plain(t.summary))}">${esc(t.name)}</a></th>`).join("")}</tr></thead>`;
  const body = DATA.datasets.map((d) => `
    <tr data-id="${d.id}">
      <th scope="row" title="Show tools for ${esc(d.name)}">${esc(d.name)}${d.access === "restricted" ? `<span class="lock" title="restricted access">● restricted</span>` : ""}
        <small>${esc(d.species)} · ${esc(d.tissue)}</small></th>
      ${flat.map((t) => {
        if (t === "gap") return `<td class="group-gap"></td>`;
        const k = t.datasets[d.id];
        return `<td class="${t.language}" data-tool="${t.id}">${k ? `<span class="dot ${k}" title="${esc(t.name)} · ${esc(d.name)}: ${k}"></span>` : ""}</td>`;
      }).join("")}
    </tr>`).join("");
  const m = $("#matrix");
  m.innerHTML = head + `<tbody>${body}</tbody>`;

  m.addEventListener("click", (e) => {
    const show = e.target.closest("[data-show]");
    if (show) { e.preventDefault(); showTool(show.dataset.show); return; }
    const row = e.target.closest("tbody tr");
    if (!row) return;
    state.dataset = state.dataset === row.dataset.id ? "" : row.dataset.id;
    state.view = "grid";
    renderTools();
    if (state.dataset) $("#tools").scrollIntoView({ behavior: "smooth" });
  });
  // Column highlight on hover
  m.addEventListener("mouseover", (e) => {
    const cell = e.target.closest("[data-tool]");
    m.querySelectorAll(".hl").forEach((c) => c.classList.remove("hl"));
    if (cell) m.querySelectorAll(`[data-tool="${cell.dataset.tool}"]`).forEach((c) => c.classList.add("hl"));
  });
  m.addEventListener("mouseleave", () => m.querySelectorAll(".hl").forEach((c) => c.classList.remove("hl")));
}

// ------------------------------------------------------------------ recipes
let codeLang = "python";

function usedTools(recipe, lang) {
  const code = recipe[lang] || "";
  return TOOLS.filter((t) => t.language === lang && (lang === "r"
    ? new RegExp(`(library\\(|\\b)${t.name.replace(/\./g, "\\.")}(\\)|::)`).test(code)
    : new RegExp(`^\\s*(import|from) ${t.name}\\b|import [\\w, ]*\\b${t.name}\\b`, "m").test(code)));
}

function renderRecipe(id) {
  const r = DATA.recipes.find((x) => x.id === id);
  const langs = ["r", "python"].filter((l) => r[l]);
  const lang = langs.includes(codeLang) ? codeLang : langs[0];
  document.querySelectorAll("#recipe-list button").forEach((b) => b.setAttribute("aria-selected", b.dataset.id === id));
  const uses = usedTools(r, lang);
  const panel = $("#recipe-panel");
  panel.innerHTML = `
    <p class="blurb">${md(r.blurb)}</p>
    <div class="code-tabs" role="tablist">
      ${langs.map((l) => `<button type="button" role="tab" data-lang="${l}" aria-selected="${l === lang}">${LANGS[l]}</button>`).join("")}
      <button type="button" class="copy">Copy</button>
    </div>
    <pre><code class="language-${lang}">${esc(r[lang])}</code></pre>
    ${uses.length ? `<div class="uses">Uses ${uses.map((t) => `<a href="#tool-${t.id}" data-show="${t.id}">${esc(t.name)}</a>`).join(", ")}</div>` : ""}`;
  if (window.hljs) hljs.highlightElement($("pre code", panel));
  panel.querySelectorAll(".code-tabs [data-lang]").forEach((b) => b.addEventListener("click", () => { codeLang = b.dataset.lang; renderRecipe(id); }));
  $(".copy", panel).addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText(r[lang]); e.target.textContent = "Copied!"; }
    catch { e.target.textContent = "Copy failed"; }
    setTimeout(() => (e.target.textContent = "Copy"), 1400);
  });
  panel.querySelectorAll("[data-show]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); showTool(a.dataset.show); }));
}

function renderRecipes() {
  $("#recipe-list").innerHTML = DATA.recipes.map((r) =>
    `<li><button type="button" role="tab" data-id="${r.id}">${esc(r.title)}</button></li>`).join("");
  $("#recipe-list").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) renderRecipe(b.dataset.id);
  });
  renderRecipe(DATA.recipes[0].id);
}

// -------------------------------------------------------------------- graph
function renderGraph() {
  const box = $("#graph");
  if (!window.d3) { box.insertAdjacentHTML("beforeend", `<p class="empty">Could not load the graph library.</p>`); return; }
  const tip = $("#tooltip");
  const nodes = TOOLS.map((t) => ({ ...t, r: Math.min(15, 4 + 1.6 * Math.log2(stars(t) + 1)) }));
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const links = nodes.flatMap((n) => n.depends.map((d) => ({ source: n.id, target: d, kind: "dep" })));
  DATA.pairs.forEach((p) => p.r.forEach((a) => p.python.forEach((b) => {
    if (byId[a].language !== byId[b].language) links.push({ source: a, target: b, kind: "pair" });
  })));
  const neighbors = new Map(nodes.map((n) => [n.id, new Set([n.id])]));
  links.forEach((l) => { neighbors.get(l.source).add(l.target); neighbors.get(l.target).add(l.source); });

  box.insertAdjacentHTML("afterbegin", `<div class="graph-labels"><span class="r">R / natverse</span><span class="python">Python / navis</span></div>`);
  const svg = d3.select(box).insert("svg", ":first-child").attr("role", "img").attr("aria-label", "Dependency graph of the tools");
  const g = svg.append("g");
  const link = g.append("g").selectAll("line").data(links).join("line").attr("class", (d) => `link ${d.kind === "pair" ? "pair" : ""}`);
  const node = g.append("g").selectAll("g").data(nodes).join("g").attr("class", (d) => `node ${d.language}${d.maintainer ? " ext" : ""}`);
  node.append("circle").attr("r", (d) => d.r);
  node.append("text").text((d) => d.name).attr("x", (d) => d.r + 4).attr("y", 4);

  let W = box.clientWidth, H = box.clientHeight;
  const xFor = (d) => ({ r: 0.27, web: 0.5, python: 0.73 }[d.language] * W);
  const sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id((d) => d.id).distance((l) => (l.kind === "pair" ? 160 : 70)).strength((l) => (l.kind === "pair" ? 0.02 : 0.4)))
    .force("charge", d3.forceManyBody().strength(-320))
    .force("x", d3.forceX(xFor).strength(0.12))
    .force("y", d3.forceY(H / 2).strength(0.045))
    .force("collide", d3.forceCollide((d) => d.r + 16))
    .on("tick", () => {
      // keep nodes inside the box (and below the R / Python labels)
      nodes.forEach((d) => { d.x = Math.max(d.r + 8, Math.min(W - d.r - 90, d.x)); d.y = Math.max(52, Math.min(H - 48, d.y)); });
      link.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y).attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

  const zoom = d3.zoom().scaleExtent([0.4, 3]).on("zoom", (e) => g.attr("transform", e.transform));
  svg.call(zoom).on("wheel.zoom", null);   // don't hijack page scrolling; pinch / dblclick / drag still work

  node.call(d3.drag()
    .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.25).restart(); d.fx = d.x; d.fy = d.y; })
    .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
    .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

  node.on("mouseenter", (e, d) => {
    const nb = neighbors.get(d.id);
    box.classList.add("focus");
    node.classed("on", (n) => nb.has(n.id));
    link.classed("on", (l) => l.source.id === d.id || l.target.id === d.id);
    const s = STATS?.repos?.[d.repo];
    tip.innerHTML = `<b>${esc(d.name)}</b> · ${LANGS[d.language]}${d.maintainer ? ` · by ${esc(d.maintainer)}` : ""}${s ? ` · ★ ${s.stars}` : ""}<br>${md(d.summary)}`;
    tip.hidden = false;
  }).on("mousemove", (e) => {
    tip.style.left = `${Math.min(e.clientX + 14, innerWidth - 320)}px`;
    tip.style.top = `${e.clientY + 14}px`;
  }).on("mouseleave", () => {
    box.classList.remove("focus"); node.classed("on", false); link.classed("on", false); tip.hidden = true;
  }).on("click", (e, d) => { tip.hidden = true; showTool(d.id); });

  new ResizeObserver(() => {
    W = box.clientWidth; H = box.clientHeight;
    svg.attr("viewBox", [0, 0, W, H]);
    sim.force("x", d3.forceX(xFor).strength(0.12)).force("y", d3.forceY(H / 2).strength(0.045)).alpha(0.3).restart();
  }).observe(box);
}

// --------------------------------------------------------------------- misc
function renderHeroStats() {
  const ours = TOOLS.filter((t) => !t.maintainer);
  const n = (lang) => ours.filter((t) => t.language === lang).length;
  $("#hero-stats").innerHTML = [
    [ours.length, "tools"], [n("r"), "R packages"], [n("python"), "Python libraries"], [DATA.datasets.length, "datasets"],
  ].map(([v, l]) => `<li><b>${v}</b>${l}</li>`).join("");
  if (STATS?.updated) $("#footer-meta").insertAdjacentHTML("beforeend", ` GitHub stats updated ${new Date(STATS.updated).toLocaleDateString()}.`);
}

function bindTheme() {
  $(".theme-toggle").addEventListener("click", () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    window.dispatchEvent(new Event("themechange"));
  });
}

async function main() {
  bindTheme();
  const [data, stats] = await Promise.all([
    fetch("data/tools.json").then((r) => r.json()),
    fetch("data/stats.json").then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]);
  DATA = data; STATS = stats;
  DSETS = Object.fromEntries(DATA.datasets.map((d) => [d.id, d]));
  // Order: language, then category order, then YAML order; stars break nothing else.
  const catOrder = Object.fromEntries(DATA.categories.map((c, i) => [c.id, i]));
  const langOrder = { web: 0, r: 1, python: 2 };
  TOOLS = DATA.tools.map((t, i) => ({ ...t, _i: i }))
    .sort((a, b) => langOrder[a.language] - langOrder[b.language] || catOrder[a.category] - catOrder[b.category] || a._i - b._i);

  renderHeroStats();
  bindFilters();
  renderMatrix();
  renderTools();
  renderRecipes();
  renderGraph();
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#tool-"]');
    if (a) { e.preventDefault(); showTool(a.getAttribute("href").slice(6)); }
  });
}

main();
