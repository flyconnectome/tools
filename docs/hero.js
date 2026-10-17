// Hero: FlyWire neurons (skeletons) inside a faint brain outline, rendered with three.js.
// Data comes from data/hero.{json,bin}, produced by scripts/export_hero.py.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const container = document.getElementById("hero-canvas");
const legend = document.querySelector("#hero-legend ul");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const PALETTE = {
  dark: { APL: "#6fb6ff", pns: ["#ffc94d", "#ff8a5c", "#ff6b9a", "#c08cff", "#5be3c5", "#b6f36b", "#ffd6a0"], brain: "#5b9cff" },
  light: { APL: "#1f6fe5", pns: ["#c98a00", "#e0582a", "#d6336c", "#8a4fe0", "#0f9f80", "#5a9a12", "#b8742a"], brain: "#1f6fe5" },
};
const isDark = () => {
  const t = document.documentElement.dataset.theme;
  return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
};

function webglOK() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }
  catch { return false; }
}

async function main() {
  if (!webglOK()) { document.getElementById("hero-legend").hidden = true; return; }
  const [meta, buf] = await Promise.all([
    fetch("data/hero.json").then((r) => r.json()),
    fetch("data/hero.bin").then((r) => r.arrayBuffer()),
  ]);

  // ---- decode the binary blob (see scripts/export_hero.py for the layout)
  const N = meta.neurons.reduce((s, n) => s + n.n, 0);
  const parents = new Int32Array(buf, 0, N);
  const coords = new Int16Array(buf, 4 * N, 3 * N);
  const bOff = 4 * N + 6 * N;
  const bVerts = new Int16Array(buf, bOff, 3 * meta.brain.nv);
  const bFaces = new Uint16Array(buf, bOff + 6 * meta.brain.nv, 3 * meta.brain.nf);
  const s = meta.scale_um;

  // ---- scene
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 1, 10000);
  camera.up.set(0, -1, 0);   // FlyWire's y axis points ventrally

  // Brain outline as a fresnel shell: bright at grazing angles, transparent face-on.
  const brainGeom = new THREE.BufferGeometry();
  brainGeom.setAttribute("position", new THREE.BufferAttribute(Float32Array.from(bVerts, (v) => v * s), 3));
  brainGeom.setIndex(new THREE.BufferAttribute(Uint32Array.from(bFaces), 1));
  brainGeom.computeVertexNormals();
  brainGeom.computeBoundingBox();
  const center = brainGeom.boundingBox.getCenter(new THREE.Vector3());
  const size = brainGeom.boundingBox.getSize(new THREE.Vector3());
  const brainMat = new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color() }, strength: { value: 0.5 } },
    vertexShader: `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 color; uniform float strength;
      varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 3.0);
        gl_FragColor = vec4(color, f * strength);
      }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
  const pivot = new THREE.Group();
  pivot.position.copy(center).multiplyScalar(-1);
  const world = new THREE.Group();
  world.add(pivot);
  scene.add(world);
  pivot.add(new THREE.Mesh(brainGeom, brainMat));

  // Neurons as line segments (child -> parent)
  let offset = 0;
  const neurons = meta.neurons.map((n) => {
    const pos = Float32Array.from(coords.subarray(3 * offset, 3 * (offset + n.n)), (v) => v * s);
    const idx = [];
    for (let i = 0; i < n.n; i++) { const p = parents[offset + i]; if (p >= 0) idx.push(i, p); }
    offset += n.n;
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geom.setIndex(idx);
    const mat = new THREE.LineBasicMaterial({ transparent: true, opacity: n.name === "APL" ? 0.22 : 0.95, depthWrite: false });
    const line = new THREE.LineSegments(geom, mat);
    line.userData = { name: n.name, baseOpacity: mat.opacity, nIdx: idx.length };
    pivot.add(line);
    return line;
  });

  function applyTheme() {
    const dark = isDark();
    const pal = PALETTE[dark ? "dark" : "light"];
    let k = 0;
    neurons.forEach((l) => {
      const c = l.userData.name === "APL" ? pal.APL : pal.pns[k++ % pal.pns.length];
      l.material.color.set(c);
      l.material.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      l.material.needsUpdate = true;
      l.userData.color = c;
    });
    brainMat.uniforms.color.value.set(pal.brain);
    brainMat.uniforms.strength.value = dark ? 0.32 : 0.25;
    brainMat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    brainMat.needsUpdate = true;
    legend.innerHTML = neurons.map((l) =>
      `<li data-name="${l.userData.name}"><i style="background:${l.userData.color}"></i>${l.userData.name}</li>`).join("");
    render();
  }

  // Legend hover highlights a single neuron
  legend.addEventListener("mouseover", (e) => {
    const li = e.target.closest("li");
    neurons.forEach((l) => (l.material.opacity = !li || li.dataset.name === l.userData.name ? l.userData.baseOpacity : 0.05));
    render();
  });
  legend.addEventListener("mouseleave", () => { neurons.forEach((l) => (l.material.opacity = l.userData.baseOpacity)); render(); });

  // ---- camera & controls: frontal view, slowly turning around the dorsal-ventral axis
  const dist = Math.max(size.x, size.y) * 2.15;
  camera.position.set(0, -size.y * 0.08, -dist);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.autoRotate = !reduceMotion;
  controls.autoRotateSpeed = 0.6;
  controls.addEventListener("change", render);

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the whole brain in view on narrow screens
    camera.position.setLength(dist * Math.max(0.8, 1.05 / camera.aspect));
    camera.updateProjectionMatrix();
    // APL is very dense: dim it further on small canvases where its lines pile up
    const apl = neurons.find((l) => l.userData.name === "APL");
    if (apl) apl.userData.baseOpacity = apl.material.opacity = 0.22 * Math.min(1, Math.max(0.35, w / 900));
    render();
  }

  let needsRender = true;
  function render() { needsRender = true; }

  // Grow the neurons in on load
  const t0 = performance.now(), GROW = reduceMotion ? 0 : 2600;
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(container);

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const p = GROW ? Math.min(1, (now - t0) / GROW) : 1;
    if (p < 1) {
      const ease = 1 - Math.pow(1 - p, 3);
      neurons.forEach((l) => l.geometry.setDrawRange(0, Math.floor(l.userData.nIdx * ease / 2) * 2));
      needsRender = true;
    }
    controls.update();   // also applies auto-rotation (fires "change")
    if (needsRender) { renderer.render(scene, camera); needsRender = false; }
  }

  window.addEventListener("themechange", applyTheme);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
  new ResizeObserver(resize).observe(container);
  applyTheme();
  resize();
  requestAnimationFrame(frame);
}

main().catch((e) => {
  console.warn("Hero visualization failed:", e);
  document.getElementById("hero-legend").hidden = true;
});
