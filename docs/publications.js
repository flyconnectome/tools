// Renders publications.html from the `publications` block in data/tools.json (generated from tools.yaml).
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const doiUrl = (doi) => `https://doi.org/${doi}`;
// Italicise genus/species names in titles
const fmtTitle = (t) => esc(t).replace(/\b(Drosophila|Aedes aegypti)\b/g, "<i>$1</i>");

let TOOLS = {};
const NATVERSE = { id: "natverse", name: "natverse", language: "r", url: "https://natverse.org" };

function chip(id) {
  const t = id === "natverse" ? NATVERSE : TOOLS[id];
  const href = id === "natverse" ? NATVERSE.url : `index.html#tool-${t.id}`;
  return `<a class="pkg" data-lang="${t.language}" href="${href}">${esc(t.name)}</a>`;
}

// Does a citation entry apply to the given tool? "natverse" covers all of our R packages.
function applies(entry, toolId) {
  if (!toolId) return true;
  const t = TOOLS[toolId];
  return entry.for.includes(toolId) || (entry.for.includes("natverse") && t.language === "r" && !t.maintainer);
}

const plainCitation = (e) => `${e.authors} (${e.year}). ${e.title}. ${e.venue}. ${doiUrl(e.doi)}`;

function copyButton(text) {
  return `<button type="button" class="copy-cite" data-text="${esc(text)}" title="Copy citation">Copy</button>`;
}

function renderCite(toolId) {
  const { cite } = DATA.publications;
  const papers = cite.filter((e) => e.kind !== "software" && applies(e, toolId));
  const software = cite.filter((e) => e.kind === "software" && applies(e, toolId));
  document.getElementById("cite-papers").innerHTML = papers.length ? papers.map((e) => `
    <li class="cite">
      <div class="cite-main">
        <p class="cite-ref"><span class="cite-authors">${esc(e.authors)} (${e.year})</span>
          <a href="${doiUrl(e.doi)}">${fmtTitle(e.title)}</a>. <i>${esc(e.venue)}</i>.</p>
        <p class="cite-for">Cite when using ${e.for.map(chip).join(" ")}${e.note ? ` <span class="note">- ${esc(e.note)}</span>` : ""}</p>
      </div>
      <div class="cite-actions"><a class="doi" href="${doiUrl(e.doi)}">doi:${esc(e.doi)}</a>${copyButton(plainCitation(e))}</div>
    </li>`).join("") : `<li class="empty">No paper to cite specifically for this tool - see its software archive below, if it has one.</li>`;
  document.getElementById("cite-software").innerHTML = software.length ? software.map((e) => `
    <div class="software">
      <span class="sw-name">${e.for.map(chip).join(" ")}</span>
      <a class="doi" href="${doiUrl(e.doi)}">doi:${esc(e.doi)}</a>
    </div>`).join("") : `<p class="empty">No software archive listed for this tool.</p>`;

  const t = TOOLS[toolId];
  document.getElementById("cite-hint").textContent = !toolId ? "" :
    t.maintainer ? `${t.name} is maintained by ${t.maintainer}.`
    : toolId === "navis" ? "No navis paper yet (in the works) - please cite the Zenodo DOI below, plus the NBLAST paper if you use NBLAST."
    : `Please also cite the papers describing any dataset you use.`;
  // Keep the navis notice visible whenever it is relevant
  document.getElementById("navis-note").hidden = !!toolId && toolId !== "navis";
}

function renderSelected() {
  const byYear = {};
  DATA.publications.selected.forEach((e) => (byYear[e.year] ||= []).push(e));
  document.getElementById("selected-list").innerHTML = Object.keys(byYear).sort((a, b) => b - a).map((y) => `
    <div class="year-group">
      <h3 class="year">${y}</h3>
      <ul class="pub-list">${byYear[y].map((e) => `
        <li class="pub">
          <a class="pub-title" href="${doiUrl(e.doi)}">${fmtTitle(e.title)}</a>
          <p class="pub-meta">${esc(e.authors)}, <i>${esc(e.venue)}</i> (${e.year})</p>
          <p class="pub-uses">${e.uses.map(chip).join(" ")}</p>
        </li>`).join("")}
      </ul>
    </div>`).join("");
}

let DATA;
async function main() {
  DATA = await fetch("data/tools.json").then((r) => r.json());
  TOOLS = Object.fromEntries(DATA.tools.map((t) => [t.id, t]));

  // Tool picker: every tool (alphabetical by name, with language for the duplicate "fafbseg")
  const sel = document.getElementById("cite-tool");
  const LANG = { r: "R", python: "Python", web: "Web" };
  sel.innerHTML += [...DATA.tools].sort((a, b) => a.name.localeCompare(b.name))
    .map((t) => `<option value="${t.id}">${esc(t.name)} (${LANG[t.language]})</option>`).join("");
  sel.addEventListener("change", () => renderCite(sel.value));

  document.addEventListener("click", async (e) => {
    const b = e.target.closest(".copy-cite");
    if (!b) return;
    try { await navigator.clipboard.writeText(b.dataset.text); b.textContent = "Copied!"; }
    catch { b.textContent = "Copy failed"; }
    const label = b.closest(".callout") ? "Copy citation" : "Copy";
    setTimeout(() => (b.textContent = label), 1400);
  });

  renderCite("");
  renderSelected();
}

main();
