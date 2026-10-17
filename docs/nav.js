// Scroll-spy for the "On this page" rail and the top nav: marks the section in view
// (aria-current) and fills the rail's track in proportion to progress through the page.
const ids = ["overview", "tools", "datasets", "recipes", "ecosystem", "contact"];
const sections = ids.map((id) => document.getElementById(id));
const links = [...document.querySelectorAll("[data-spy]")];
const rail = document.querySelector(".rail");
const track = document.querySelector(".rail-track");
const fill = document.querySelector(".rail-fill");
const dots = [...rail.querySelectorAll("i")];

let current = null;
function update() {
  const probe = innerHeight * 0.35;   // a section counts as "current" once its top passes 35% of the viewport
  let idx = 0;
  sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= probe) idx = i; });
  const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom) idx = sections.length - 1;

  if (idx !== current) {
    current = idx;
    links.forEach((a) => (a.dataset.spy === ids[idx] ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
  }

  // Only show the rail once the hero is mostly out of view, so it never sits on top of the hero's content
  rail.classList.toggle("shown", sections[0].getBoundingClientRect().bottom < innerHeight * 0.5);

  // Fill: from the first dot to the current one, plus the fraction of the current section read so far
  if (getComputedStyle(rail).display === "none") return;   // rail hidden on narrow screens
  const r = sections[idx].getBoundingClientRect();
  const frac = atBottom || idx === sections.length - 1 ? 0 : Math.min(1, Math.max(0, (probe - r.top) / r.height));
  const rr = rail.getBoundingClientRect();
  const y = (i) => { const b = dots[i].getBoundingClientRect(); return b.top + b.height / 2 - rr.top; };
  const next = Math.min(idx + 1, dots.length - 1);
  track.style.top = `${y(0)}px`;
  track.style.height = `${y(dots.length - 1) - y(0)}px`;
  fill.style.height = `${y(idx) + (y(next) - y(idx)) * frac - y(0)}px`;
}

let queued = false;
const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; update(); }); } };
addEventListener("scroll", schedule, { passive: true });
addEventListener("resize", schedule);
new ResizeObserver(schedule).observe(document.body);   // sections grow once tools.json has rendered
update();
