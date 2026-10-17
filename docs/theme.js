// Light/dark toggle shared by all pages. The saved choice is applied before first paint by an inline
// script in each page's <head>; this only handles the button.
document.querySelector(".theme-toggle")?.addEventListener("click", () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  window.dispatchEvent(new Event("themechange"));
});
