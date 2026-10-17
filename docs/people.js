// Renders people.html from the `people` list in data/tools.json (generated from tools.yaml).
const GROUPS = [
  { id: "core", title: "Core developers" },
  { id: "major", title: "Major contributors" },
  { id: "contributor", title: "Contributors" },
];
const LANGS = { r: "R", python: "Python", web: "Web" };
const MAX_CHIPS = 8;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const initials = (name) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("");

function person(p, tools) {
  const pkgs = (p.packages || []).map((id) => tools[id]);
  const chip = (t, extra = false) =>
    `<a class="pkg" data-lang="${t.language}" href="index.html#tool-${t.id}" title="${LANGS[t.language]}"${extra ? " hidden" : ""}>${esc(t.name)}</a>`;
  const shown = pkgs.slice(0, MAX_CHIPS).map((t) => chip(t)).join("");
  const rest = pkgs.slice(MAX_CHIPS);
  const avatar = p.avatar === false
    ? `<span class="avatar fallback" aria-hidden="true">${esc(initials(p.name))}</span>`
    : `<span class="avatar" aria-hidden="true" data-initials="${esc(initials(p.name))}">
         <img src="https://github.com/${encodeURIComponent(p.github)}.png?size=160" alt="" loading="lazy"
              onerror="this.parentElement.classList.add('fallback'); this.parentElement.textContent = this.parentElement.dataset.initials">
       </span>`;
  return `
  <article class="person ${p.group}">
    ${avatar}
    <div class="person-body">
      <h3>${esc(p.name)}</h3>
      <a class="handle" href="https://github.com/${encodeURIComponent(p.github)}">@${esc(p.github)}</a>
      ${p.affiliation ? `<p class="affil">${esc(p.affiliation)}</p>` : ""}
      ${p.previously ? `<p class="prev">previously ${esc(p.previously)}</p>` : ""}
      ${pkgs.length ? `<div class="pkgs">${shown}${rest.length ? `${rest.map((t) => chip(t, true)).join("")}<button type="button" class="more" aria-label="Show ${rest.length} more packages">+${rest.length} more</button>` : ""}</div>` : ""}
    </div>
  </article>`;
}

async function main() {
  const data = await fetch("data/tools.json").then((r) => r.json());
  const tools = Object.fromEntries(data.tools.map((t) => [t.id, t]));
  // "+N more": reveal the hidden chips in place (same flex row) and drop the button
  document.getElementById("people").addEventListener("click", (e) => {
    const btn = e.target.closest(".more");
    if (!btn) return;
    btn.parentElement.querySelectorAll(".pkg[hidden]").forEach((a) => (a.hidden = false));
    btn.remove();
  });
  document.getElementById("people").innerHTML = GROUPS.map((g) => {
    const people = data.people.filter((p) => p.group === g.id);
    return people.length ? `<h2 class="people-group">${g.title}</h2><div class="people-grid ${g.id}">${people.map((p) => person(p, tools)).join("")}</div>` : "";
  }).join("");
}

main();
