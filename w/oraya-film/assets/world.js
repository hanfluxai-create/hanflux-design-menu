/* =====================================================================
   ORAYA WORLD
   One WebGL canvas behind the whole page:
   1. FILM: the Grok footage, frame by frame from scroll, drawn in a
      shader (zoom-through ripple between clips, scroll-velocity colour
      split, grain). Frames decode off the main thread.
   2. PARTICLES: GPU points that rebuild the last film frame, then morph
      into a new shape for every section as you scroll.
   ===================================================================== */
import * as THREE from './three.module.min.js';

window.__worldBoot = true; window.__worldStage = 'module';
const errPush = (e) => { try { (window.__errs = window.__errs || []).push(String((e && (e.stack || e.message)) || e).slice(0, 600)); if (window.__errs.length > 20) window.__errs.length = 20; } catch (x) {} };
const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const ease = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
const lerp = (a, b, t) => a + (b - a) * t;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(pointer: coarse)').matches;

const film = $('#top'), stage = $('#stage'), canvas = $('#gl');
const scrim = $('#scrim'), cue = $('#cue');
const statusEl = $('#status'), stText = $('#statusText'), stMeta = $('#statusMeta');

/* ---------------- film timeline ---------------- */
const N = 172, NA = 90, FW = 720, FH = 1222, TA = NA - 1, TF = 16, TEND = TA + TF + (N - NA - 1);
const MAP = [[0, 0], [0.04, 0], [0.42, TA], [0.47, TA], [0.56, TA + TF], [0.86, TEND], [1, TEND]];
const BEATS = [
  { k: 'ring', a: null, b: [0.11, 0.15] },
  { k: 'leak', a: [0.14, 0.18], b: [0.29, 0.33] },
  { k: 'answer', a: [0.32, 0.36], b: [0.46, 0.5] },
  { k: 'book', a: [0.58, 0.62], b: [0.75, 0.79] },
  { k: 'final', a: [0.81, 0.86], b: null },
];
const STATES = [
  { to: 0.14, tone: 'light', dot: '#06b6d4', t: 'Incoming call', m: '6:42 PM' },
  { to: 0.33, tone: 'light', dot: '#ef4444', t: 'Unanswered', m: 'Lead going cold' },
  { to: 0.53, tone: 'light', dot: '#8b5cf6', t: 'Answered by Oraya', m: '0:07' },
  { to: 0.81, tone: 'dark', dot: '#34d399', t: 'Booked', m: 'Tue 9:00 AM' },
  { to: 9, tone: 'dark', dot: '#34d399', t: '', m: '', off: true },
];
function pToT(p) {
  for (let k = 1; k < MAP.length; k++) if (p <= MAP[k][0]) {
    const a = MAP[k - 1], b = MAP[k], span = b[0] - a[0];
    return a[1] + (b[1] - a[1]) * (span ? (p - a[0]) / span : 1);
  }
  return TEND;
}

/* ---------------- words: split headline lines for staggered reveals ---------------- */
function splitWords(el) {
  if (!el || el.dataset.split) return;
  el.dataset.split = '1';
  const out = [];
  let i = 0;
  el.childNodes.forEach((n) => {
    if (n.nodeType === 3) {
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) out.push(document.createTextNode(' '));
        else {
          const w = document.createElement('span'); w.className = 'wd';
          const s = document.createElement('span'); s.textContent = part.replace(/ /g, ' '); s.style.setProperty('--i', i++);
          w.appendChild(s); out.push(w);
        }
      });
    } else out.push(n.cloneNode(true));
  });
  el.textContent = ''; out.forEach((n) => el.appendChild(n));
}
document.querySelectorAll('.beat .say, .closer .h1-line').forEach(splitWords);
BEATS.forEach((b) => { b.el = stage.querySelector(`[data-beat="${b.k}"]`); });
const closerCta = stage.querySelector('.closer-bottom');

/* section reveals (CSS scroll-driven where supported, observer fallback) */
const sda = CSS.supports && CSS.supports('animation-timeline: view()');
if (!sda) document.documentElement.classList.add('no-sda');
const rvSel = '.scene h2';
document.querySelectorAll(rvSel).forEach((el) => { splitWords(el); el.classList.add('rvw'); });
document.querySelectorAll('.scene .kicker,.scene .lede,.scene > .glass,.scene > .rail,.scene > .vsl,.scene > .proof-row,.scene > .sym,.scene > .weeks,.scene > .form-card,.scene > .btn,.scene > .dark-panel,.scene > details,.founder-row,.faq-list,.scene > .marquee').forEach((el) => el.classList.add('rv'));
if (!sda && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.rv,.rvw').forEach((el) => io.observe(el));
}


/* ---------------- QA mode (?qa): on-screen frame meter + reports from the real device ---------------- */
const QA = /[?&]qa\b/.test(location.search);
const qa = { sid: Math.random().toString(36).slice(2, 9), scenes: {}, errs: window.__qaErrs || [], sent: 0, renderer: '', glReady: false };
let qaHud = null, qaFps = 60, qaLast = 0;
function qaErr(e) { qa.errs.push(String((e && (e.stack || e.message)) || e).slice(0, 500)); }
function qaStat(key, ms) {
  const o = qa.scenes[key] || (qa.scenes[key] = { n: 0, sum: 0, max: 0, slow: 0 });
  o.n++; o.sum += ms; if (ms > o.max) o.max = ms; if (ms > 34) o.slow++;
}
function qaReport(final) {
  const sc = {}; for (const k in qa.scenes) { const o = qa.scenes[k]; sc[k] = { fps: Math.round(1000 / (o.sum / o.n)), worstMs: Math.round(o.max), slowPct: Math.round((o.slow / o.n) * 100), n: o.n }; }
  const body = JSON.stringify({
    sid: qa.sid, final: !!final, t: Math.round(performance.now() / 1000), ua: navigator.userAgent, w: innerWidth, ih: innerHeight,
    vv: window.visualViewport ? Math.round(visualViewport.height) : null, lvh: Hc, svh: H, dpr: devicePixelRatio, drawDpr: dpr,
    renderer: qa.renderer, glReady: qa.glReady, frames: have.reduce((a, b) => a + b, 0) + '/' + N, decoded: bmp.size,
    vids: vEls.map((o) => ({ n: o.name, rs: o.v ? o.v.readyState : -1, paused: o.v ? o.v.paused : null, err: o.v && o.v.error ? o.v.error.code : 0 })),
    scenes: sc, errs: qa.errs.slice(0, 12), maxScroll: Math.round(qaMaxScroll),
  });
  /* mirror: diagnostics beacon disabled */
  qa.sent++;
}
let qaMaxScroll = 0;
if (QA) {
  addEventListener('error', (e) => qaErr(e.error || e.message));
  addEventListener('unhandledrejection', (e) => qaErr(e.reason));
  qaHud = document.createElement('div');
  qaHud.style.cssText = 'position:fixed;z-index:9999;left:8px;top:calc(env(safe-area-inset-top,0px) + 64px);padding:6px 9px;border-radius:9px;background:rgba(0,0,0,.72);color:#9effc4;font:600 11px/1.35 ui-monospace,Menlo,monospace;pointer-events:none;white-space:pre';
  document.body.appendChild(qaHud);
  setInterval(() => qaReport(false), 5000);
  addEventListener('pagehide', () => qaReport(true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) qaReport(true); });
}

window.__worldStage = 'renderer';
/* ---------------- renderer ---------------- */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false, depth: false });
} catch (e) { renderer = null; }
if (!renderer) {
  document.documentElement.classList.add('no-gl');
  throw new Error('WebGL unavailable');
}
renderer.autoClear = false;
try { const g = renderer.getContext(), ext = g.getExtension('WEBGL_debug_renderer_info'); qa.renderer = ext ? g.getParameter(ext.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER); } catch (e) {}
renderer.setClearColor(0x03040b, 1);

const probe = document.createElement('div');
probe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:100vh;height:100lvh;visibility:hidden;pointer-events:none';
document.body.appendChild(probe);

let W = 0, Hc = 0, H = 0, dpr = 1, wide = false, rTop = 220, rBot = 110, cBot = 240;
const wideMQ = matchMedia('(min-width:760px) and (min-aspect-ratio:4/5)');

/* ---------------- film plane ---------------- */
const blank = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); blank.needsUpdate = true;
const filmU = {
  uTex0: { value: blank }, uTex1: { value: blank },
  uRect0: { value: new THREE.Vector4(0, 0, 1, 1) }, uRect1: { value: new THREE.Vector4(0, 0, 1, 1) },
  uBg0: { value: new THREE.Vector3(1, 1, 1) }, uBg1: { value: new THREE.Vector3(1, 1, 1) },
  uWorld: { value: new THREE.Vector3(0.012, 0.016, 0.043) },
  uRes: { value: new THREE.Vector2(1, 1) }, uDpr: { value: 1 },
  uMix: { value: 0 }, uRipple: { value: 0 }, uFlash: { value: 0 }, uCenter: { value: new THREE.Vector2(0, 0) },
  uTime: { value: 0 }, uVel: { value: 0 }, uFade: { value: 1 },
};
const filmMat = new THREE.ShaderMaterial({
  uniforms: filmU, depthTest: false, depthWrite: false,
  vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `
    precision highp float;
    uniform sampler2D uTex0, uTex1; uniform vec4 uRect0, uRect1; uniform vec3 uBg0, uBg1, uWorld;
    uniform vec2 uRes, uCenter; uniform float uDpr, uMix, uRipple, uFlash, uTime, uVel, uFade;
    vec3 samp(sampler2D t, vec4 r, vec2 p, vec3 bg){
      vec2 uv = (p - r.xy) / r.zw;
      if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return bg;
      return texture2D(t, uv).rgb;
    }
    vec3 split(sampler2D t, vec4 r, vec2 p, vec2 o, vec3 bg){
      return vec3(samp(t, r, p - o, bg).r, samp(t, r, p, bg).g, samp(t, r, p + o, bg).b);
    }
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
      vec2 d = p - uCenter; float r = length(d) + 0.001;
      p += d / r * sin(r * 0.055 - uTime * 7.0) * uRipple * 26.0 * exp(-r * 0.0022);
      vec2 o = vec2(clamp(uVel, -1.0, 1.0) * 1.5, clamp(uVel, -1.0, 1.0) * 7.0) * (1.0 + uRipple * 2.0);
      vec3 c = split(uTex0, uRect0, p, o, uBg0);
      if (uMix > 0.001) c = mix(c, split(uTex1, uRect1, p, o, uBg1), uMix);
      c += uFlash;
      vec2 q = gl_FragCoord.xy / (uRes * uDpr) - 0.5;
      c *= 1.0 - dot(q, q) * 0.22 * step(0.5, 1.0 - c.r * c.g * c.b);
      c += (hash(gl_FragCoord.xy + fract(uTime * 7.3) * 91.0) - 0.5) * 0.04;
      gl_FragColor = vec4(mix(uWorld, c, uFade), 1.0);
    }`,
});
const filmScene = new THREE.Scene();
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), filmMat); quad.frustumCulled = false; filmScene.add(quad);
const orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

/* ---------------- frames: fetch compressed, decode near the playhead ---------------- */
const blobs = new Array(N), have = new Uint8Array(N);
const conn = navigator.connection || {}, lite = !!(conn.saveData || /2g|3g/.test(conn.effectiveType || ''));
const src = (i) => 'film/f' + String(i).padStart(3, '0') + '.webp';
const order = [], seen = new Set();
const push = (i) => { if (i >= 0 && i < N && !seen.has(i)) { seen.add(i); order.push(i); } };
{ [0, TA, NA, N - 1].forEach(push); [12, 6, 3, 2, 1].forEach((st) => { if (lite && st < 2) return; for (let i = 0; i < N; i += st) push(i); }); }
let qi = 0, busy = 0;
function pump() { while (busy < 6 && qi < order.length) load(order[qi++]); }
function load(i) {
  busy++;
  fetch(src(i)).then((r) => (r.ok ? r.blob() : Promise.reject())).then((b) => {
    blobs[i] = b; have[i] = 1; busy--; if (Math.abs(i - head) < 10 || i === N - 1) want(i); pump();
  }).catch(() => { busy--; pump(); });
}
const bmp = new Map(), pending = new Set();
const canBitmap = typeof createImageBitmap === 'function';
let head = 0;
function want(i) {
  if (i < 0 || i >= N || !have[i] || bmp.has(i) || pending.has(i)) return;
  pending.add(i);
  const done = (b) => { pending.delete(i); bmp.set(i, b); evict(); if (i === N - 1) onLastFrame(b); };
  if (canBitmap) createImageBitmap(blobs[i]).then(done, () => pending.delete(i));
  else {
    const im = new Image(); const u = URL.createObjectURL(blobs[i]);
    im.onload = () => { (im.decode ? im.decode() : Promise.resolve()).then(() => done(im), () => done(im)); };
    im.onerror = () => pending.delete(i); im.src = u;
  }
}
const KEEP = touch ? 12 : 24;
function evict() {
  if (bmp.size <= KEEP) return;
  const ks = [...bmp.keys()].sort((a, b) => Math.abs(b - head) - Math.abs(a - head));
  for (const k of ks) {
    if (bmp.size <= KEEP) break;
    if (k === texIdx[0] || k === texIdx[1] || k === N - 1 || k === TA || k === NA) continue;
    const b = bmp.get(k); if (b && b.close) b.close(); bmp.delete(k);
  }
}
function nearest(i, lo, hi) {
  if (bmp.has(i)) return i;
  for (let d = 1; d <= hi - lo; d++) { if (i - d >= lo && bmp.has(i - d)) return i - d; if (i + d <= hi && bmp.has(i + d)) return i + d; }
  return -1;
}
function warm(i, lo, hi, dir) { for (let k = -3; k <= 8; k++) { const j = i + k * (dir < 0 ? -1 : 1); if (j >= lo && j <= hi) want(j); } }

const tex = [0, 1].map(() => { const t = new THREE.Texture(); t.flipY = false; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.colorSpace = THREE.NoColorSpace; return t; });
const texIdx = [-1, -1];
function texFor(i, keep) {
  if (i < 0) return null;
  for (let s = 0; s < 2; s++) if (texIdx[s] === i) return tex[s];
  const b = bmp.get(i); if (!b) return null;
  const s = texIdx[0] === keep ? 1 : 0;
  tex[s].image = b; tex[s].needsUpdate = true; texIdx[s] = i; return tex[s];
}

/* ---------------- film layout (CSS px, top-left origin) ---------------- */
function rectA(z = 1) {
  const band = Math.max(H - rTop - rBot, H * 0.36), cx = wide ? W * 0.64 : W / 2;
  const s = Math.min(band / (0.58 * FH), (wide ? W * 0.52 : W * 0.98) / FW), w = FW * s, h = FH * s, cy = rTop + (H - rTop - rBot) / 2;
  return zoom({ x: cx - w / 2, y: cy - 0.51 * h, w, h, ax: cx, ay: cy }, z);
}
function rectB(k = 0, z = 1) {
  const cx = wide ? W * 0.64 : W / 2, s = wide ? H / FH : Math.max(W / FW, H / FH), w = FW * s, h = FH * s;
  let y = (H - h) / 2; const x = cx - w / 2;
  if (!wide && k > 0) { const need = cBot + 18 - (y + 0.33 * h); if (need > 0) y += need * k; }
  return zoom({ x, y, w, h, ax: cx, ay: y + 0.42 * h }, z);
}
function zoom(r, z) { return { x: r.ax - (r.ax - r.x) * z, y: r.ay - (r.ay - r.y) * z, w: r.w * z, h: r.h * z, ax: r.ax, ay: r.ay }; }
const shiftK = (bt) => ease((bt - 52) / 20);
const WHITE = [1, 1, 1], BLACK = [0, 0, 0];
function setRect(u, r) { u.value.set(r.x, r.y, r.w, r.h); }

function drawFilm(t) {
  const half = TA + TF / 2;
  let i0 = -1, i1 = -1, r0, r1, mix = 0, bg0 = WHITE, bg1 = WHITE, ripple = 0, flash = 0, cx, cy;
  if (t <= TA) {
    const f = Math.floor(t), fr = t - f; head = f;
    warm(f, 0, TA, velDir);
    i0 = nearest(f, 0, TA); r0 = r1 = rectA(reduce ? 1 : 1 + 0.02 * (t / TA));
    if (fr > 0.04 && i0 === f && f + 1 <= TA && bmp.has(f + 1)) { i1 = f + 1; mix = fr; }
    cx = r0.ax; cy = r0.ay;
  } else if (t < TA + TF) {
    const u = (t - TA) / TF; head = u < 0.5 ? TA : NA;
    want(TA); want(NA); warm(NA, NA, N - 1, 1);
    i0 = nearest(TA, 0, TA); i1 = nearest(NA, NA, N - 1);
    if (reduce) { r0 = rectA(1); r1 = rectB(0, 1); mix = i1 >= 0 ? ease(u) : 0; bg1 = BLACK; }
    else {
      r0 = rectA(1.02 + 1.5 * ease(u / 0.62) * ease(u / 0.62));
      r1 = rectB(0, 1 + 0.85 * (1 - ease((u - 0.3) / 0.7)));
      mix = i1 >= 0 ? ease((u - 0.34) / 0.3) : 0; bg1 = BLACK;
      ripple = Math.sin(Math.PI * u); flash = 0.22 * Math.sin(Math.PI * clamp((u - 0.25) / 0.45));
    }
    cx = lerp(r0.ax, r1.ax, mix); cy = lerp(r0.ay, r1.ay, mix);
  } else {
    const bt = Math.min(N - 1 - NA, t - TA - TF), f = NA + Math.floor(bt), fr = bt - Math.floor(bt); head = f;
    warm(f, NA, N - 1, velDir);
    i0 = nearest(f, NA, N - 1); r0 = r1 = rectB(shiftK(bt), reduce ? 1 : 1 + 0.07 * (1 - ease(bt / 14)));
    if (fr > 0.04 && i0 === f && f + 1 <= N - 1 && bmp.has(f + 1)) { i1 = f + 1; mix = fr; }
    bg0 = bg1 = BLACK; cx = r0.ax; cy = r0.ay;
  }
  const t0 = texFor(i0, i1), t1 = i1 >= 0 ? texFor(i1, i0) : null;
  filmU.uTex0.value = t0 || blank; filmU.uTex1.value = t1 || filmU.uTex0.value;
  if (!t0) { mix = 0; }
  setRect(filmU.uRect0, r0); setRect(filmU.uRect1, r1 || r0);
  filmU.uBg0.value.fromArray(bg0); filmU.uBg1.value.fromArray(bg1);
  filmU.uMix.value = t1 ? mix : 0; filmU.uRipple.value = ripple; filmU.uFlash.value = flash; filmU.uCenter.value.set(cx, cy);
}

/* ---------------- particles ---------------- */
const NP = touch ? 6000 : 12000;
const pScene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 50); cam.position.set(0, 0, 6);
const geo = new THREE.BufferGeometry();
const aFrom = new Float32Array(NP * 3), aTo = new Float32Array(NP * 3), cFrom = new Float32Array(NP * 3), cTo = new Float32Array(NP * 3), aRnd = new Float32Array(NP);
for (let i = 0; i < NP; i++) aRnd[i] = Math.random();
geo.setAttribute('position', new THREE.BufferAttribute(aFrom, 3));
geo.setAttribute('aFrom', new THREE.BufferAttribute(aFrom, 3));
geo.setAttribute('aTo', new THREE.BufferAttribute(aTo, 3));
geo.setAttribute('cFrom', new THREE.BufferAttribute(cFrom, 3));
geo.setAttribute('cTo', new THREE.BufferAttribute(cTo, 3));
geo.setAttribute('aRnd', new THREE.BufferAttribute(aRnd, 1));
const pU = { uMorph: { value: 0 }, uTime: { value: 0 }, uSize: { value: touch ? 2.3 : 2.1 }, uDpr: { value: 1 }, uVel: { value: 0 }, uAlpha: { value: 0 }, uFlow: { value: 1 } };
const pMat = new THREE.ShaderMaterial({
  uniforms: pU, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `
    attribute vec3 aFrom, aTo, cFrom, cTo; attribute float aRnd;
    uniform float uMorph, uTime, uSize, uDpr, uVel, uAlpha, uFlow;
    varying vec3 vCol; varying float vA;
    vec3 flow(vec3 p, float t){
      return vec3(sin(p.y * 1.7 + t * 0.9 + aRnd * 6.0) + sin(p.z * 2.3 + t * 0.6),
                  sin(p.z * 1.9 + t * 0.7 + aRnd * 4.0) + sin(p.x * 2.1 - t * 0.5),
                  sin(p.x * 1.6 + t * 0.8) + sin(p.y * 2.4 + t * 0.4 + aRnd * 3.0)) * 0.5;
    }
    void main(){
      float m = clamp(uMorph * 1.4 - aRnd * 0.4, 0.0, 1.0); m = m * m * (3.0 - 2.0 * m);
      vec3 p = mix(aFrom, aTo, m);
      float tb = (0.03 + sin(m * 3.14159) * 0.6) * uFlow;
      p += flow(p * 1.3, uTime) * tb;
      p.y += uVel * (aRnd - 0.5) * 0.5;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * (0.5 + aRnd * 1.0) * uDpr * (6.0 / -mv.z);
      vCol = mix(cFrom, cTo, m);
      vA = uAlpha * (0.78 + 0.22 * sin(uTime * 2.2 + aRnd * 40.0));
    }`,
  fragmentShader: `
    precision mediump float;
    varying vec3 vCol; varying float vA;
    void main(){
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.0, d); a = a * (0.55 + 0.45 * a);
      gl_FragColor = vec4(vCol * a * vA * 1.35, 1.0);
    }`,
});
const points = new THREE.Points(geo, pMat); points.frustumCulled = false;
const group = new THREE.Group(); group.add(points); pScene.add(group);

/* colour ramp: cyan, blue, violet, magenta (the orb) */
const RAMP = [[0.02, 0.74, 0.91], [0.19, 0.28, 0.86], [0.57, 0.18, 0.9], [0.93, 0.16, 0.6]];
function ramp(t, out, k = 1) {
  if (!(t === t)) t = 0;
  t = ((t % 1) + 1) % 1; const x = t * 3, i = Math.min(2, Math.floor(x)), f = x - i;
  out[0] = lerp(RAMP[i][0], RAMP[i + 1][0], f) * k; out[1] = lerp(RAMP[i][1], RAMP[i + 1][1], f) * k; out[2] = lerp(RAMP[i][2], RAMP[i + 1][2], f) * k;
  return out;
}
const tmp = [0, 0, 0];
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

let visW = 2, visH = 4, R = 0.8;
const SHAPES = {};
function mk(fn) { const pos = new Float32Array(NP * 3), col = new Float32Array(NP * 3); for (let i = 0; i < NP; i++) fn(i, pos, col, i * 3); return { pos, col }; }
function set3(a, o, x, y, z) { a[o] = x; a[o + 1] = y; a[o + 2] = z; }
function buildShapes() {
  const vh = 2 * cam.position.z * Math.tan((cam.fov * Math.PI) / 360); visH = vh; visW = vh * cam.aspect;
  R = Math.min(visW, visH) * (wide ? 0.34 : 0.42);
  const ox = wide ? visW * 0.17 : 0;
  SHAPES.dust = mk((i, p, c, o) => { set3(p, o, (Math.random() - 0.5) * visW * 1.2, (Math.random() - 0.5) * visH * 1.1, -2.2 + Math.random() * 3.4); ramp(Math.random(), tmp, 0.55); set3(c, o, ...tmp); });
  SHAPES.drift = mk((i, p, c, o) => { set3(p, o, (Math.random() - 0.5) * visW * 1.3, (Math.random() - 0.5) * visH * 1.15, -3.5 + Math.random() * 3.2); if (Math.random() < 0.78) set3(c, o, 0, 0, 0); else { ramp(Math.random(), tmp, 0.5); set3(c, o, ...tmp); } });
  SHAPES.wave = mk((i, p, c, o) => {
    const s = i % 6, x = (Math.random() - 0.5) * visW * 1.15, env = 0.55 + 0.45 * Math.cos(x * 1.1);
    const y = Math.sin(x * 3.1 + s * 0.55) * R * 0.42 * env * (1 - s * 0.09) + gauss() * 0.012;
    set3(p, o, x, y + R * 0.05, (s - 2.5) * 0.09 + gauss() * 0.03); ramp(0.15 + (x / visW + 0.5) * 0.8, tmp, 0.9); set3(c, o, ...tmp);
  });
  SHAPES.leak = mk((i, p, c, o) => {
    const t = Math.pow(Math.random(), 0.75), y = R * 1.15 - t * R * 3.2, spread = 0.12 + t * 0.9;
    set3(p, o, ox + gauss() * R * spread * 0.55, y, gauss() * R * 0.35 * spread);
    const k = 0.95 - t * 0.55; set3(c, o, lerp(0.57, 0.95, t) * k, lerp(0.2, 0.18, t) * k, lerp(0.9, 0.3, t) * k);
  });
  SHAPES.rings = mk((i, p, c, o) => {
    const q = i % 4, cxq = (q % 2 ? 1 : -1) * R * 0.58 + ox, cyq = (q < 2 ? 1 : -1) * R * 0.62, a = Math.random() * Math.PI * 2, rr = R * 0.34 + gauss() * 0.018;
    set3(p, o, cxq + Math.cos(a) * rr, cyq + Math.sin(a) * rr, Math.sin(a * 2 + q) * 0.08 + gauss() * 0.02); ramp(q / 4 + 0.05, tmp, 0.95); set3(c, o, ...tmp);
  });
  const booked = new Set([1, 4, 7, 10, 13, 18]);
  SHAPES.grid = mk((i, p, c, o) => {
    const cols = 5, rows = 4, cell = (R * 2.1) / cols, gap = cell * 0.18, k = i % (cols * rows), cxk = k % cols, cyk = Math.floor(k / cols);
    const x = (cxk - (cols - 1) / 2) * cell + (Math.random() - 0.5) * (cell - gap), y = ((rows - 1) / 2 - cyk) * cell * 0.82 + (Math.random() - 0.5) * (cell * 0.82 - gap);
    set3(p, o, x + ox, y, gauss() * 0.02);
    if (booked.has(k)) { ramp(0.72 + Math.random() * 0.2, tmp, 1.15); set3(c, o, ...tmp); } else set3(c, o, 0.16, 0.18, 0.3);
  });
  SHAPES.week = mk((i, p, c, o) => {
    const k = i % 4, w = R * 0.42, x = (k - 1.5) * w * 1.18 + (Math.random() - 0.5) * w, y = (Math.random() - 0.5) * w * 1.25;
    set3(p, o, x + ox, y, gauss() * 0.03); ramp(0.1 + k * 0.22, tmp, 0.95); set3(c, o, ...tmp);
  });
  SHAPES.pair = mk((i, p, c, o) => {
    const r = Math.random();
    if (r < 0.16) { const t = Math.random(), x = lerp(-R * 0.72, R * 0.72, t), y = Math.sin(t * Math.PI) * R * 0.22; set3(p, o, x + ox, y + gauss() * 0.02, gauss() * 0.03); ramp(0.4 + t * 0.4, tmp, 1); set3(c, o, ...tmp); return; }
    const left = r < 0.58, th = Math.acos(2 * Math.random() - 1), ph = Math.random() * Math.PI * 2, rr = R * 0.38 * Math.cbrt(0.35 + 0.65 * Math.random());
    set3(p, o, (left ? -R * 0.72 : R * 0.72) + ox + rr * Math.sin(th) * Math.cos(ph), rr * Math.cos(th), rr * Math.sin(th) * Math.sin(ph));
    if (left) { ramp(0.55 + Math.random() * 0.2, tmp, 1); set3(c, o, ...tmp); } else set3(c, o, 0.2, 0.83, 0.6);
  });
  SHAPES.sphere = mk((i, p, c, o) => {
    const shell = i < NP * 0.72, k = shell ? i : Math.random() * (NP - 1), y = clamp(1 - (2 * (k + 0.5)) / NP, -1, 1), rad = Math.sqrt(Math.max(0, 1 - y * y)), th = k * 2.39996;
    const rr = R * 0.95 * (shell ? 1 + gauss() * 0.01 : Math.cbrt(Math.random()) * 0.92);
    const x = Math.cos(th) * rad, z = Math.sin(th) * rad;
    set3(p, o, x * rr + ox, y * rr, z * rr); ramp(0.5 + Math.atan2(z, x) / (Math.PI * 2) + y * 0.15, tmp, shell ? 1 : 0.6); set3(c, o, ...tmp);
  });
  SHAPES.calm = mk((i, p, c, o) => {
    const th = Math.acos(2 * Math.random() - 1), ph = Math.random() * Math.PI * 2, rr = R * 0.5 * Math.cbrt(Math.random());
    set3(p, o, rr * Math.sin(th) * Math.cos(ph) + visW * 0.18, rr * Math.cos(th) - visH * 0.24, rr * Math.sin(th) * Math.sin(ph) - 1.2); ramp(Math.random(), tmp, 0.38); set3(c, o, ...tmp);
  });
  SHAPES.orbit = mk((i, p, c, o) => {
    const a = Math.random() * Math.PI * 2, ring = i % 3, rr = R * (0.6 + ring * 0.28), tilt = 1.05 + ring * 0.22, node = Math.random() < 0.06;
    const x = Math.cos(a) * rr, y0 = Math.sin(a) * rr * 0.32, z = Math.sin(a) * rr * Math.cos(tilt);
    set3(p, o, x + ox + (node ? gauss() * 0.04 : 0), y0 + (node ? gauss() * 0.04 : gauss() * 0.01), z); ramp(ring / 3 + a / 12, tmp, node ? 1.4 : 0.8); set3(c, o, ...tmp);
  });
  const HB = [7 / 23, 21 / 23, 1, 5 / 23];
  SHAPES.bars = mk((i, p, c, o) => {
    const k = i % 4, bw = R * 0.36, h = R * 1.9 * HB[k], x = (k - 1.5) * bw * 1.45 + (Math.random() - 0.5) * bw, y = -R * 0.95 + Math.random() * h;
    set3(p, o, x + ox, y, gauss() * 0.03); ramp(0.08 + (y + R) / (R * 2.4) * 0.85, tmp, 0.95); set3(c, o, ...tmp);
  });
  SHAPES.text21 = textShape('21×', ox, wide ? 0 : visH * 0.2);
  buildImageShape();
}
function textShape(str, ox, oy = 0) {
  const cw = 420, ch = 220, cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
  const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '800 190px Poppins, Inter, sans-serif'; x.fillText(str, cw / 2, ch / 2 + 8);
  const d = x.getImageData(0, 0, cw, ch).data, pts = [];
  for (let y = 0; y < ch; y += 2) for (let xx = 0; xx < cw; xx += 2) if (d[(y * cw + xx) * 4 + 3] > 128) pts.push(xx, y);
  const n = pts.length / 2 || 1, scale = (R * 2.5) / cw;
  return mk((i, p, c, o) => {
    const j = Math.floor(Math.random() * n), px = pts[j * 2] ?? cw / 2, py = pts[j * 2 + 1] ?? ch / 2;
    set3(p, o, (px - cw / 2) * scale + ox + (Math.random() - 0.5) * scale * 2, (ch / 2 - py) * scale + oy + (Math.random() - 0.5) * scale * 2, gauss() * 0.04);
    ramp(px / cw * 0.85 + 0.05, tmp, 1); set3(c, o, ...tmp);
  });
}
/* the last film frame, rebuilt as points at the exact place it sits on screen */
let lastFrame = null;
function onLastFrame(b) { if (!lastFrame) { lastFrame = b; buildImageShape(); refreshAttrs(true); } }
function buildImageShape() {
  if (!lastFrame || !W) { SHAPES.image = SHAPES.dust; return; }
  const sw = 180, sh = Math.round((sw * FH) / FW), cv = document.createElement('canvas'); cv.width = sw; cv.height = sh;
  const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(lastFrame, 0, 0, sw, sh);
  const d = x.getImageData(0, 0, sw, sh).data, cdf = new Float32Array(sw * sh); let acc = 0;
  for (let k = 0; k < sw * sh; k++) { const l = (0.3 * d[k * 4] + 0.59 * d[k * 4 + 1] + 0.11 * d[k * 4 + 2]) / 255; acc += Math.pow(l, 1.7) + 0.002; cdf[k] = acc; }
  const r = rectB(1, 1);
  SHAPES.image = mk((i, p, c, o) => {
    const v = Math.random() * acc; let lo = 0, hi = cdf.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] < v) lo = m + 1; else hi = m; }
    const ix = lo % sw, iy = Math.floor(lo / sw), px = r.x + ((ix + Math.random()) / sw) * r.w, py = r.y + ((iy + Math.random()) / sh) * r.h;
    set3(p, o, (px / W - 0.5) * visW, (0.5 - py / Hc) * visH, gauss() * 0.04);
    set3(c, o, (d[lo * 4] / 255) * 1.25, (d[lo * 4 + 1] / 255) * 1.25, (d[lo * 4 + 2] / 255) * 1.25);
  });
}


/* ---------------- scene loops: Grok clips as moving backgrounds behind a scene ---------------- */
const VIDS = window.ORAYA_VIDEOS || [];
const vidU = { uTex: { value: blank }, uAlpha: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uDpr: { value: 1 }, uSize: { value: new THREE.Vector2(720, 1026) }, uAnchor: { value: new THREE.Vector2(0.5, 0.56) } };
const vidMat = new THREE.ShaderMaterial({
  uniforms: vidU, transparent: true, depthTest: false, depthWrite: false,
  vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `
    precision highp float;
    uniform sampler2D uTex; uniform float uAlpha, uDpr; uniform vec2 uRes, uSize, uAnchor;
    void main(){
      vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
      float s = min(uRes.x / uSize.x, uRes.y * 0.96 / uSize.y) * 1.04; vec2 sz = uSize * s; vec2 o = uRes * uAnchor - sz * 0.5;
      vec2 uv = (p - o) / sz;
      if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0); return; }
      vec3 c = texture2D(uTex, vec2(uv.x, 1.0 - uv.y)).rgb;
      float e = smoothstep(0.0, 0.14, uv.y) * smoothstep(1.0, 0.86, uv.y) * smoothstep(0.0, 0.07, uv.x) * smoothstep(1.0, 0.93, uv.x);
      gl_FragColor = vec4(c, uAlpha * e);
    }`,
});
const vScene = new THREE.Scene();
const vQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), vidMat); vQuad.frustumCulled = false; vScene.add(vQuad);
const vEls = [...document.querySelectorAll('[data-video]')].filter((el) => VIDS.includes(el.dataset.video)).map((el) => ({ el, name: el.dataset.video, v: null, tex: null, pt: null, pReady: false, blocked: false, top: 0, h: 1, vw: 720, vh: 1026 }));
/* a tap is a user gesture: retry any video the phone refused to autoplay (Low Power Mode) */
function unblock() { vEls.forEach((o) => { if (o.v && o.blocked) o.v.play().then(() => { o.blocked = false; }, () => {}); }); }
addEventListener('touchend', unblock, { passive: true }); addEventListener('click', unblock, { passive: true });
function measureVids() { const sy = scrollY; vEls.forEach((o) => { const r = o.el.getBoundingClientRect(); o.top = r.top + sy; o.h = r.height; }); }
function vidFrame(sy) {
  let best = null, bw = 0; const vc = sy + H / 2;
  for (const o of vEls) {
    const c = o.top + o.h / 2, w = 1 - ease(Math.abs(c - vc) / (Math.max(o.h, H) * 0.7));
    if (!o.pt && Math.abs(c - vc) < H * 3) {
      const t = new THREE.Texture(); t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; o.pt = t;
      const im = new Image(); im.decoding = 'async'; im.onload = () => { t.image = im; t.needsUpdate = true; o.pReady = true; }; im.src = 'film/loop-' + o.name + '.webp';
    }
    if (!reduce && !o.v && Math.abs(c - vc) < H * 2) {
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.src = 'film/loop-' + o.name + (v.canPlayType('video/mp4; codecs="avc1.640028"') ? '.mp4' : '.webm');
      v.addEventListener('loadedmetadata', () => { o.vw = v.videoWidth || 720; o.vh = v.videoHeight || 1026; });
      o.v = v; o.tex = new THREE.VideoTexture(v); o.tex.colorSpace = THREE.NoColorSpace; o.tex.generateMipmaps = false; o.tex.minFilter = THREE.LinearFilter;
      v.load();
    }
    if (o.v) { if (w > 0.02) { if (o.v.paused && !o.blocked && !o.trying) { o.trying = true; o.v.play().then(() => { o.trying = false; }, () => { o.trying = false; o.blocked = true; }); } } else if (!o.v.paused) o.v.pause(); }
    o.live = !!(o.v && !o.v.paused && o.v.readyState >= 2);
    if ((o.live || o.pReady) && w > bw) { bw = w; best = o; }
  }
  if (best) { vidU.uTex.value = best.live ? best.tex : best.pt; vidU.uSize.value.set(best.vw, best.vh); vidU.uAnchor.value.set(wide ? 0.66 : 0.5, 0.56); }
  vidU.uAlpha.value = best ? bw * 0.92 : 0;
  return best ? bw : 0;
}

/* ---------------- scroll anchors: which shape belongs where ---------------- */
const SECTIONS = [...document.querySelectorAll('[data-shape]')];
const DIM = { calm: 0.3, image: 1, dust: 0.5, drift: 0.55, text21: 1 };
let anchors = [], filmTop = 0, filmLen = 1, filmEnd = 0;
function measureAnchors() {
  const sy = scrollY, fr = film.getBoundingClientRect();
  filmTop = fr.top + sy; filmLen = Math.max(1, film.offsetHeight - stage.offsetHeight); filmEnd = filmTop + filmLen;
  const at = (p) => filmTop + filmLen * p;
  anchors = [{ y: at(0.62), s: 'dust' }, { y: at(0.985), s: 'image' }];
  let last = anchors[1].y;
  SECTIONS.forEach((el) => {
    const r = el.getBoundingClientRect(), y = Math.max(r.top + sy + Math.min(r.height, H * 1.4) / 2 - H / 2, last + H * 0.55);
    anchors.push({ y, s: el.dataset.shape, id: el.id }); last = y;
  });
  measureVids();
}
let segA = -1, segB = -1;
function refreshAttrs(force) {
  const A = SHAPES[anchors[segA]?.s], B = SHAPES[anchors[segB]?.s];
  if (!A || !B) return;
  if (force || geo.userData.a !== segA || geo.userData.b !== segB || geo.userData.ver !== shapeVer) {
    aFrom.set(A.pos); aTo.set(B.pos); cFrom.set(A.col); cTo.set(B.col);
    ['aFrom', 'aTo', 'cFrom', 'cTo', 'position'].forEach((n) => (geo.attributes[n].needsUpdate = true));
    geo.userData = { a: segA, b: segB, ver: shapeVer };
  }
}
let shapeVer = 0;
function particleState(sy) {
  if (!anchors.length) return { m: 0, alpha: 0, imgW: 0 };
  let k = 0; while (k < anchors.length - 2 && sy > anchors[k + 1].y) k++;
  const a = anchors[k], b = anchors[k + 1];
  let raw = clamp((sy - a.y) / Math.max(1, b.y - a.y));
  if (sy < a.y) raw = 0;
  const m = ease((raw - 0.18) / 0.64);
  if (segA !== k || segB !== k + 1) { segA = k; segB = k + 1; refreshAttrs(); }
  const dimA = DIM[a.s] ?? 1, dimB = DIM[b.s] ?? 1;
  const imgW = a.s === 'image' ? 1 - m : b.s === 'image' ? m : 0;
  return { m, alpha: lerp(dimA, dimB, m), imgW, same: a.s === b.s, id: (m < 0.5 ? a : b).id || 'film' };
}

/* ---------------- copy, status and scrim follow the story ---------------- */
let lastState = -1;
function ui(p) {
  for (let k = 0; k < BEATS.length; k++) {
    const b = BEATS[k], vin = b.a ? clamp((p - b.a[0]) / (b.a[1] - b.a[0])) : 1, vout = b.b ? 1 - clamp((p - b.b[0]) / (b.b[1] - b.b[0])) : 1, v = Math.min(vin, vout);
    b.el.style.setProperty('--v', v.toFixed(3));
    b.el.style.opacity = Math.min(1, v * 3).toFixed(3);
    b.el.style.transform = reduce ? 'none' : `translate3d(0,${((1 - v) * (vin < 1 ? 16 : -16)).toFixed(1)}px,0)`;
    if (k === 4) closerCta.style.pointerEvents = v > 0.6 ? 'auto' : 'none';
  }
  let si = 0; while (p > STATES[si].to) si++;
  if (si !== lastState) {
    lastState = si; const st = STATES[si];
    statusEl.setAttribute('data-tone', st.tone); statusEl.style.setProperty('--sd', st.dot); statusEl.classList.toggle('off', !!st.off);
    if (st.t) { stText.textContent = st.t; stMeta.textContent = st.m; }
  }
  cue.style.opacity = (1 - clamp(p / 0.03)).toFixed(2);
  scrim.style.opacity = clamp((p - 0.57) / 0.06).toFixed(2);
  const meta = document.querySelector('meta[name="theme-color"]'); const dark = p > 0.5;
  if (meta && meta.dataset.dark !== String(dark)) { meta.dataset.dark = String(dark); meta.setAttribute('content', dark ? '#03040b' : '#ffffff'); }
}

/* ---------------- size ---------------- */
function size(force) {
  const w = innerWidth, hc = probe.offsetHeight || innerHeight, h = stage.clientHeight || innerHeight;
  const nd = Math.min(devicePixelRatio || 1, touch ? 1.75 : 2);
  if (!force && w === W && hc === Hc && h === H && nd === dpr) return;
  W = w; Hc = hc; H = h; dpr = nd; wide = wideMQ.matches;
  renderer.setPixelRatio(dpr); renderer.setSize(W, Hc, false);
  filmU.uRes.value.set(W, Hc); filmU.uDpr.value = dpr; pU.uDpr.value = dpr; vidU.uRes.value.set(W, Hc); vidU.uDpr.value = dpr;
  cam.aspect = W / Hc; cam.updateProjectionMatrix();
  rTop = 0; ['ring', 'leak', 'answer'].forEach((k) => { const el = stage.querySelector(`[data-beat="${k}"]`); rTop = Math.max(rTop, el.offsetTop + el.offsetHeight); });
  rTop += 12; if (wide) rTop = 70;
  const hud = stage.querySelector('.hud'); rBot = H - hud.offsetTop + 4;
  const cl = stage.querySelector('[data-beat="final"]'), ct = cl.querySelector('.closer-top'); cBot = cl.offsetTop + ct.offsetTop + ct.offsetHeight;
  buildShapes(); shapeVer++; measureAnchors(); refreshAttrs(true);
}

/* ---------------- pointer, velocity, smooth scroll ---------------- */
const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', (e) => { ptr.tx = (e.clientX / W) * 2 - 1; ptr.ty = (e.clientY / Hc) * 2 - 1; }, { passive: true });
let lenis = null;
function startLenis() {
  if (touch || reduce || !window.Lenis || lenis || (window.HX && HX.embed)) return;
  lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, anchors: true });
  document.documentElement.classList.add('has-lenis');
}

/* ---------------- loop ---------------- */
let pCur = 0, tCur = 0, lastSY = scrollY, vel = 0, velDir = 1, last = performance.now(), running = true;
const clock0 = performance.now();
let rawLast = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  if (!running) { rawLast = now; return; }
  const rawMs = now - rawLast; rawLast = now;
  try { step(now, rawMs); } catch (e) { if (!frame.err) { frame.err = 1; errPush(e); } if (QA) qaErr(e); }
}
function step(now, rawMs) {
  if (lenis) lenis.raf(now);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const sy = lenis ? lenis.scroll : scrollY;
  const dv = (sy - lastSY) / Math.max(1, H); lastSY = sy;
  vel = lerp(vel, clamp(dv / Math.max(dt, 0.008) * 0.06, -1, 1), 0.12); if (Math.abs(dv) > 1e-5) velDir = dv >= 0 ? 1 : -1;
  const time = (now - clock0) / 1000;

  // film
  const pT = clamp((sy - filmTop) / filmLen);
  pCur += (pT - pCur) * 0.24; if (Math.abs(pT - pCur) < 0.0004) pCur = pT;
  const tT = pToT(pCur); tCur += (tT - tCur) * 0.3; if (Math.abs(tT - tCur) < 0.02) tCur = tT;
  const post = (sy - filmEnd) / H;
  const fade = 1 - ease(post / 0.55);
  filmU.uFade.value = fade; filmU.uTime.value = reduce ? 0 : time; filmU.uVel.value = reduce ? 0 : vel * (pCur > 0.995 ? 0.3 : 1);
  if (fade > 0.001) drawFilm(tCur);
  ui(pCur);

  // scene loops
  const vw = vEls.length && fade < 0.5 ? vidFrame(sy) : 0;

  // particles
  const ps = particleState(sy);
  const target = (post > 0 ? ease(post / 0.4) : 0) * ps.alpha * (1 - vw * 0.65);
  pU.uAlpha.value = lerp(pU.uAlpha.value, target, 0.12);
  pU.uMorph.value = ps.m; pU.uTime.value = reduce ? 0 : time; pU.uVel.value = reduce ? 0 : vel * 2; pU.uFlow.value = reduce ? 0 : ps.same ? 0.22 : 1 - ps.imgW * 0.85;
  ptr.x = lerp(ptr.x, ptr.tx, 0.05); ptr.y = lerp(ptr.y, ptr.ty, 0.05);
  const free = reduce ? 0 : 1 - ps.imgW;
  group.rotation.y = free * (Math.sin(time * 0.13) * 0.22 + ptr.x * 0.3);
  group.rotation.x = free * (ptr.y * 0.18 + Math.sin(time * 0.1) * 0.06);

  renderer.clear();
  if (fade > 0.001) renderer.render(filmScene, orthoCam);
  if (vw > 0.01) renderer.render(vScene, orthoCam);
  if (pU.uAlpha.value > 0.003) renderer.render(pScene, cam);
  if (!qa.glReady) { qa.glReady = true; window.__worldStage = 'ready'; document.documentElement.classList.add('gl-ready'); }
  if (QA && rawMs < 1000) {
    const key = sy < filmEnd ? 'film-' + Math.min(9, Math.floor(pCur * 10)) : ps.id;
    qaStat(key, rawMs); qaMaxScroll = Math.max(qaMaxScroll, sy);
    qaFps = lerp(qaFps, 1000 / Math.max(rawMs, 1), 0.08);
    if (now - qaLast > 250) { qaLast = now; qaHud.textContent = `${Math.round(qaFps)} fps  ${key}\n${qa.renderer.slice(0, 28)}\nerrors ${qa.errs.length}`; }
  }
}

/* ---------------- boot ---------------- */
window.__worldStage = 'size';
try { size(true); } catch (e) { errPush(e); if (QA) qaErr(e); }
window.__worldStage = 'loop';
pump();
let rs = 0; addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(() => size(false), 120); });
addEventListener('load', () => { measureAnchors(); startLenis(); });
document.fonts && document.fonts.ready.then(() => { SHAPES.text21 = textShape('21×', wide ? visW * 0.17 : 0, wide ? 0 : visH * 0.2); shapeVer++; measureAnchors(); refreshAttrs(true); });
document.addEventListener('visibilitychange', () => { running = !document.hidden; last = performance.now(); });
new ResizeObserver(() => { measureAnchors(); }).observe(document.body);
setTimeout(startLenis, 800);
requestAnimationFrame(frame);
