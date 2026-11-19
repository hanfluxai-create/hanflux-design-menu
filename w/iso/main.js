// Cargoflow · page controller
import { initScene } from './scene.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: innerWidth < 760 ? 'mobile' : 'desktop', reducedMotion: false, ready() {}, on() {} };
const root = document.documentElement;
root.classList.add('js');
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mobile = HX.device === 'mobile' || window.innerWidth < 760;
const lite = !!HX.lite || mobile;
const reduced = !!HX.reducedMotion;
const gsap = window.gsap, ST = window.ScrollTrigger, Split = window.SplitText;
if (gsap && ST) gsap.registerPlugin(ST);
if (gsap && Split) gsap.registerPlugin(Split);
const SVGNS = 'http://www.w3.org/2000/svg';

/* ---------------------------------------------------------------- smooth scroll */
if (!HX.embed && !mobile && !reduced && window.Lenis && gsap) {
  const lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', () => ST && ST.update());
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = $(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { duration: 1.4 });
  }));
}

/* ---------------------------------------------------------------- scroll modes for the 3D island */
const hero = $('#top'), feat = $('#product');
function getMode() {
  const vh = window.innerHeight;
  const h = hero.getBoundingClientRect();
  if (h.bottom > 0) return { mode: 'hero', p: clamp(-h.top / Math.max(1, h.height)) };
  const f = feat.getBoundingClientRect();
  if (f.top < vh && f.bottom > 0) return { mode: 'features', p: clamp(-f.top / Math.max(1, f.height - vh)) };
  return { mode: 'none', p: 0 };
}
let ok3d = false;
try {
  initScene($('#stage'), { mobile, lite, embed: HX.embed, instant: reduced, pinRoot: $('#pins'), getMode, onFirstFrame: () => { ok3d = true; HX.ready(); } });
} catch (e) {
  $('#stage').style.display = 'none';
  HX.ready();
}

/* ---------------------------------------------------------------- features panel + nav */
const feats = $$('.feat'), nav = $('#nav');
let curF = -1;
function ui() {
  requestAnimationFrame(ui);
  const vh = window.innerHeight, f = feat.getBoundingClientRect();
  if (f.top < vh && f.bottom > 0) {
    const p = clamp(-f.top / Math.max(1, f.height - vh));
    const idx = p < 0.3 ? 0 : p < 0.68 ? 1 : 2;
    if (idx !== curF) { curF = idx; feats.forEach((el, i) => el.classList.toggle('is-on', i === idx)); }
    const spans = [[0, 0.3], [0.3, 0.68], [0.68, 1]];
    feats.forEach((el, i) => { const [a, b] = spans[i]; el.style.setProperty('--fp', clamp((p - a) / (b - a)).toFixed(3)); });
  }
  nav.classList.toggle('is-scrolled', window.scrollY > 20);
}
requestAnimationFrame(ui);

/* ---------------------------------------------------------------- menu */
const menuBtn = $('.menu-btn'), menu = $('#menu');
function setMenu(open) {
  root.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.setAttribute('aria-hidden', String(!open));
  if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
}
menuBtn.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
$$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------------------------------------------------------------- live map */
const LAND = [
  [[-165, 65], [-150, 70], [-125, 70], [-95, 72], [-80, 73], [-70, 66], [-62, 58], [-56, 52], [-60, 47], [-66, 45], [-70, 42], [-74, 40], [-76, 36], [-81, 31], [-80, 26], [-82, 25], [-84, 30], [-90, 29], [-97, 27], [-97, 22], [-92, 18], [-88, 16], [-84, 11], [-79, 8], [-83, 8], [-86, 12], [-92, 15], [-100, 17], [-106, 22], [-110, 24], [-112, 30], [-115, 32], [-118, 34], [-121, 36], [-124, 41], [-124, 46], [-125, 50], [-132, 55], [-140, 59], [-150, 60], [-158, 57], [-165, 60]],
  [[-55, 82], [-30, 83], [-20, 75], [-25, 68], [-42, 60], [-50, 64], [-55, 72]],
  [[-80, 8], [-73, 12], [-62, 11], [-52, 5], [-50, 0], [-35, -6], [-38, -13], [-40, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -42], [-67, -50], [-70, -55], [-74, -50], [-73, -40], [-71, -30], [-70, -18], [-76, -12], [-81, -5], [-80, 0], [-78, 5]],
  [[-10, 36], [-9, 43], [-1, 44], [-4, 48], [2, 51], [8, 54], [8, 57], [5, 59], [5, 62], [13, 68], [20, 70], [30, 71], [42, 67], [55, 69], [70, 73], [80, 73], [100, 77], [115, 74], [130, 72], [142, 72], [160, 70], [170, 68], [180, 66], [180, 62], [165, 60], [160, 55], [156, 51], [150, 59], [142, 59], [136, 54], [140, 47], [132, 43], [128, 38], [126, 35], [121, 31], [122, 25], [117, 23], [110, 20], [108, 16], [109, 12], [105, 9], [100, 13], [100, 8], [103, 1], [98, 8], [98, 16], [94, 17], [91, 22], [88, 22], [86, 20], [80, 15], [77, 8], [73, 16], [72, 21], [67, 24], [61, 25], [57, 26], [51, 24], [56, 22], [59, 22], [55, 17], [52, 15], [45, 13], [43, 13], [39, 21], [35, 28], [34, 31], [35, 36], [30, 36], [27, 37], [26, 40], [29, 41], [23, 40], [22, 37], [21, 40], [18, 40], [16, 38], [15, 41], [12, 44], [9, 44], [6, 43], [3, 43], [3, 42], [-1, 37], [-6, 36]],
  [[-17, 21], [-10, 30], [-6, 36], [10, 37], [11, 33], [20, 31], [25, 32], [32, 31], [34, 28], [38, 22], [43, 12], [51, 12], [48, 5], [41, -2], [40, -10], [40, -16], [35, -24], [33, -28], [28, -33], [20, -35], [18, -32], [12, -18], [13, -10], [12, -5], [9, -1], [9, 4], [5, 6], [-2, 5], [-8, 4], [-13, 8], [-17, 13]],
  [[-5, 50], [1, 51], [2, 53], [-1, 55], [-3, 58.5], [-6, 57], [-5, 54], [-4, 52]], [[-10, 52], [-6, 52], [-6, 55], [-8, 55], [-10, 54]], [[-24, 64], [-14, 64], [-14, 66], [-22, 66.5]],
  [[130, 31], [136, 34], [140, 35], [142, 40], [141, 45], [139, 41], [135, 35], [131, 34]], [[80, 6], [82, 7], [81, 9.5], [80, 9]], [[44, -25], [48, -25], [50, -16], [49, -12], [44, -17]],
  [[114, -22], [114, -34], [118, -35], [124, -33], [132, -31], [136, -35], [140, -38], [146, -39], [150, -37], [153, -31], [153, -25], [146, -19], [142, -11], [136, -12], [130, -12], [125, -15], [122, -18]],
  [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]], [[95, 5.5], [98, 3.5], [104, -2], [106, -6], [102, -4], [96, 2]], [[105, -6], [114, -7], [114, -8.5], [106, -7]],
  [[131, -1], [141, -3], [150, -10], [141, -9], [135, -4]], [[120, 18], [122, 18], [124, 10], [126, 7], [122, 7], [120, 14]], [[-85, 22], [-74, 20], [-77, 19.5], [-82, 23]]
];
const px = (lon, lat) => [(lon + 130) * 3, (72 - lat) * 3];
function inside(pt, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi)) c = !c;
  }
  return c;
}
function smoothPath(pts) {
  const P = pts.map(([lo, la]) => px(lo, la));
  let d = 'M' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1);
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += 'C' + c1.map(v => v.toFixed(1)).join(' ') + ' ' + c2.map(v => v.toFixed(1)).join(' ') + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
  }
  return d;
}
(function liveMap() {
  const svg = $('.map-svg'); if (!svg) return;
  let d = '';
  for (let lat = 70.75; lat > -48; lat -= 2.5) for (let lon = -128.75; lon < 150; lon += 2.5) {
    if (LAND.some(poly => inside([lon, lat], poly))) { const [x, y] = px(lon, lat); d += 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'h0'; }
  }
  $('.map-dots', svg).setAttribute('d', d);
  const ROUTES = [
    { c: 'ok', pts: [[121.5, 31.2], [120, 24], [113, 13], [104, 2], [97, 6], [88, 6], [80, 4.5], [66, 12], [50, 12.5], [41, 17], [33.5, 28], [26, 33.5], [12, 37.2], [-5.6, 36], [-10.5, 41], [-7, 47.5], [-1, 49.8], [4.3, 51.9]], sp: 0.018 },
    { c: 'ok', pts: [[4.3, 51.9], [-8, 51], [-30, 48.5], [-55, 44], [-74, 40.7]], sp: 0.03 },
    { c: 'late', pts: [[-81, 32], [-72, 26], [-55, 13], [-36, -3], [-36, -14], [-46.3, -24]], sp: 0.026 },
    { c: 'warn', pts: [[72.9, 19], [66, 21.5], [59, 23.5], [55.1, 25]], sp: 0.06 },
    { c: 'rail', pts: [[-118.2, 34], [-106, 35.2], [-96, 38.5], [-87.6, 41.9], [-80, 41], [-74, 40.7]], sp: 0.035 }
  ];
  const gR = $('.map-routes', svg), gV = $('.map-vehicles', svg), gP = $('.map-ports', svg);
  const vehicles = [];
  ROUTES.forEach((r, i) => {
    const dd = smoothPath(r.pts);
    if (r.c !== 'rail') { const g = document.createElementNS(SVGNS, 'path'); g.setAttribute('d', dd); g.setAttribute('class', 'route-glow'); g.style.stroke = r.c === 'ok' ? '#2ed3a5' : r.c === 'warn' ? '#ff6a4d' : '#f2a93b'; gR.appendChild(g); }
    const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', dd); p.setAttribute('class', 'route ' + r.c); gR.appendChild(p);
    if (r.c !== 'rail') { const fl = document.createElementNS(SVGNS, 'path'); fl.setAttribute('d', dd); fl.setAttribute('class', 'route-flow'); gR.appendChild(fl); }
    const len = p.getTotalLength();
    for (let k = 0; k < (i === 0 ? 2 : 1); k++) {
      const v = document.createElementNS(SVGNS, 'circle'); v.setAttribute('r', i === 0 && k === 0 ? 7 : 5.5); v.setAttribute('class', 'veh' + (r.c === 'warn' ? ' warn' : ''));
      gV.appendChild(v); vehicles.push({ v, p, len, u: (k * 0.5 + i * 0.17) % 1, sp: r.sp });
    }
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len; p.dataset.len = len;
  });
  const PORTS = [['Shanghai', 121.5, 31.2, 8, -8], ['Singapore', 103.8, 1.3, 8, 14], ['Rotterdam', 4.3, 51.9, 8, -8], ['New York', -74, 40.7, 6, -9], ['Los Angeles', -118.2, 34, -22, 17], ['Savannah', -81, 32, 8, 15], ['Santos', -46.3, -24, 9, 4], ['Jebel Ali', 55.1, 25, -40, -10], ['Mumbai', 72.9, 19, 8, 13]];
  PORTS.forEach(([n, lo, la, dx, dy]) => {
    const [x, y] = px(lo, la), g = document.createElementNS(SVGNS, 'g'); g.setAttribute('class', 'port');
    g.innerHTML = '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.5"/><text x="' + (x + dx).toFixed(1) + '" y="' + (y + dy).toFixed(1) + '">' + n + '</text>';
    gP.appendChild(g);
  });
  let on = false, last = 0;
  function tick(now) {
    if (!on) return; requestAnimationFrame(tick);
    const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
    vehicles.forEach(o => { o.u = (o.u + dt * o.sp) % 1; const q = o.p.getPointAtLength(o.u * o.len); o.v.setAttribute('cx', q.x.toFixed(1)); o.v.setAttribute('cy', q.y.toFixed(1)); });
  }
  vehicles.forEach(o => { const q = o.p.getPointAtLength(o.u * o.len); o.v.setAttribute('cx', q.x.toFixed(1)); o.v.setAttribute('cy', q.y.toFixed(1)); });
  let drawn = false;
  new IntersectionObserver((es) => {
    on = es[0].isIntersecting;
    if (on && !drawn) {
      drawn = true;
      $$('.route', gR).forEach((p, i) => { p.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(.6,.1,.2,1) ' + (i * 0.18) + 's'; requestAnimationFrame(() => { p.style.strokeDashoffset = 0; }); setTimeout(() => { if (!p.classList.contains('rail')) { p.style.strokeDasharray = ''; } else p.style.strokeDasharray = '2 6'; p.style.strokeDashoffset = ''; p.style.transition = ''; }, 2600 + i * 180); });
    }
    if (on) { last = 0; requestAnimationFrame(tick); }
  }, { threshold: 0.1 }).observe(svg);
  if (reduced) $$('.route', gR).forEach(p => { p.style.strokeDashoffset = 0; });
  $$('.app-filters .chip').forEach(c => c.addEventListener('click', () => { $$('.app-filters .chip').forEach(x => x.classList.toggle('on', x === c)); }));
})();

/* ---------------------------------------------------------------- live dates: the dashboard always shows today */
(function liveDates() {
  const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
  const dm = (d) => d.getDate() + ' ' + d.toLocaleDateString('en-GB', { month: 'short' }).slice(0, 3);
  const t = day(0), date = $('.app-date'), mc = $('.mc-eta'), es = $$('.eta-s');
  if (date) date.textContent = t.toLocaleDateString('en-GB', { weekday: 'long' }) + ', ' + t.getDate() + ' ' + t.toLocaleDateString('en-GB', { month: 'long' }) + ' · updated 6 s ago';
  if (mc && mc.firstChild && mc.firstChild.nodeType === 3) mc.firstChild.textContent = 'ETA ' + dm(day(5)) + ', 09:40 · ';
  if (es[0]) es[0].textContent = 'ETA ' + dm(day(2)) + ', 18:15';
  if (es[2]) es[2].textContent = 'New ETA ' + dm(day(14)) + ' · customer notified';
})();

/* ---------------------------------------------------------------- integrations hub */
(function hub() {
  const svg = $('.hub-lines'); if (!svg) return;
  const nodes = [[102, 78], [498, 78], [60, 260], [540, 260], [102, 442], [498, 442]];
  const cols = ['#f5b34f', '#2ed3a5', '#ff6a4d', '#7cc4ff', '#9b8cff', '#24365f'];
  let h = '';
  nodes.forEach(([x, y], i) => {
    const d = 'M300 260C' + (300 + (x - 300) * 0.55).toFixed(0) + ' 260 ' + (x - (x - 300) * 0.25).toFixed(0) + ' ' + y + ' ' + x + ' ' + y;
    h += '<path class="hl-base" d="' + d + '"/><path class="hl-flow" d="' + d + '" style="stroke:' + cols[i] + ';animation-delay:' + (-i * 0.55).toFixed(2) + 's"/>';
  });
  svg.innerHTML = h;
})();

/* ---------------------------------------------------------------- CTA isometric illustration */
(function ctaIso() {
  const svg = $('.cta-iso'); if (!svg) return;
  const s = 34, ox = 268, oy = 172, c30 = Math.cos(Math.PI / 6), s30 = 0.5;
  const P = (x, y, z) => [ox + (x - z) * c30 * s, oy + (x + z) * s30 * s - y * s];
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f); return 'rgb(' + Math.min(255, r) + ',' + Math.min(255, g) + ',' + Math.min(255, b) + ')'; };
  const poly = (pts, fill, extra = '') => '<path d="M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z" fill="' + fill + '"' + extra + '/>';
  const boxes = [
    [-2.2, 0, -1.4, 3.6, 1.3, 1.3, '#ff6a4d', 1], [-2.2, 0, -0.1, 3.6, 1.3, 1.3, '#2ed3a5', 1], [-2.2, 1.3, -0.75, 3.6, 1.3, 1.3, '#7cc4ff', 1],
    [2.2, 0, -1.2, 0.95, 0.95, 0.95, '#ffd79a', 0], [3.3, 0, -1.2, 0.95, 0.95, 0.95, '#ffd79a', 0], [2.2, 0, -0.1, 0.95, 0.95, 0.95, '#ffd79a', 0], [2.75, 0.95, -0.65, 0.95, 0.95, 0.95, '#ffcf80', 0],
    [-5.6, 0, 0.6, 3.6, 1.3, 1.3, '#ffffff', 1]
  ].sort((a, b) => (a[0] + a[2] + a[1]) - (b[0] + b[2] + b[1]));
  let out = '';
  // floor grid
  for (let i = -6; i <= 6; i++) { const a = P(i, 0, -6), b = P(i, 0, 6), c = P(-6, 0, i), e = P(6, 0, i); out += '<path d="M' + a.join(' ') + 'L' + b.join(' ') + 'M' + c.join(' ') + 'L' + e.join(' ') + '" stroke="#ffffff" stroke-opacity=".07" stroke-width="1"/>'; }
  boxes.forEach(([x, y, z, w, h, d, col, ribs]) => {
    const top = [P(x, y + h, z), P(x + w, y + h, z), P(x + w, y + h, z + d), P(x, y + h, z + d)];
    const left = [P(x, y, z + d), P(x + w, y, z + d), P(x + w, y + h, z + d), P(x, y + h, z + d)];
    const right = [P(x + w, y, z), P(x + w, y, z + d), P(x + w, y + h, z + d), P(x + w, y + h, z)];
    out += poly(left, shade(col, 0.9)) + poly(right, shade(col, 0.74)) + poly(top, shade(col, 1.06));
    if (ribs) for (let k = 1; k < 12; k++) { const a = P(x + w * k / 12, y + 0.08, z + d), b = P(x + w * k / 12, y + h - 0.08, z + d); out += '<path d="M' + a.join(' ') + 'L' + b.join(' ') + '" stroke="#0b1b3f" stroke-opacity=".12" stroke-width="1.2"/>'; }
    else { const a = P(x + w / 2, y + h, z), b = P(x + w / 2, y + h, z + d), c = P(x + w / 2, y + h, z + d), e = P(x + w / 2, y, z + d); out += '<path d="M' + a.join(' ') + 'L' + b.join(' ') + 'M' + c.join(' ') + 'L' + e.join(' ') + '" stroke="#c98f5a" stroke-opacity=".55" stroke-width="3"/>'; }
  });
  const r0 = P(-5.8, 0, 3.6), r1 = P(-1, 0, 4.4), r2 = P(3.6, 0, 2.4), r3 = P(5.6, 0, -2.4);
  out += '<path class="cta-route" d="M' + r0.join(' ') + 'C' + r1.join(' ') + ' ' + r2.join(' ') + ' ' + r3.join(' ') + '" fill="none" stroke="#2ed3a5" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"/>';
  const pin = P(5.6, 2.4, -2.4);
  out += '<g transform="translate(' + pin[0].toFixed(1) + ' ' + (pin[1] - 4).toFixed(1) + ')"><ellipse cx="0" cy="' + (2.4 * s + 4) + '" rx="16" ry="6" fill="#000" fill-opacity=".18"/><path d="M0 0c-14 0-24 10-24 23 0 17 24 37 24 37s24-20 24-37C24 10 14 0 0 0z" fill="#ff6a4d"/><circle cx="0" cy="23" r="8.5" fill="#fff"/></g>';
  out += '<circle class="cta-dot" r="7" fill="#fff" stroke="#2ed3a5" stroke-width="3"/>';
  svg.innerHTML = out;
  const route = $('.cta-route', svg), dot = $('.cta-dot', svg), L = route.getTotalLength();
  let u = 0, run = false, last = 0;
  const step = (now) => { if (!run) return; requestAnimationFrame(step); const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now; u = (u + dt * 0.16) % 1; const q = route.getPointAtLength(u * L); dot.setAttribute('cx', q.x); dot.setAttribute('cy', q.y); route.style.strokeDashoffset = -now / 60; };
  const q0 = route.getPointAtLength(0.3 * L); dot.setAttribute('cx', q0.x); dot.setAttribute('cy', q0.y);
  if (!reduced) new IntersectionObserver((es) => { run = es[0].isIntersecting; if (run) { last = 0; requestAnimationFrame(step); } }).observe(svg);
})();

/* ---------------------------------------------------------------- pricing toggle */
$$('.tg').forEach(b => b.addEventListener('click', () => {
  $$('.tg').forEach(x => x.classList.toggle('on', x === b));
  const k = b.dataset.bill;
  $$('.amt').forEach(a => {
    const to = +a.dataset[k], from = +a.textContent.replace(/[^\d]/g, '');
    if (gsap && !reduced) { const o = { v: from }; gsap.to(o, { v: to, duration: 0.6, ease: 'power2.out', onUpdate: () => { a.textContent = Math.round(o.v); } }); }
    else a.textContent = to;
  });
  $$('.per').forEach(p => { p.textContent = k === 'y' ? '/mo, billed yearly' : '/mo'; });
}));

/* ---------------------------------------------------------------- CTA form */
const ctaForm = $('.cta-form');
ctaForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const inp = $('#cta-email', ctaForm);
  if (!/^\S+@\S+\.\S+$/.test(inp.value.trim())) { ctaForm.classList.add('err'); inp.focus(); return; }
  ctaForm.classList.remove('err'); ctaForm.hidden = true; $('.cta-ok').hidden = false;
});

/* ---------------------------------------------------------------- magnetic buttons */
if (!mobile && !HX.embed && !reduced) {
  $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + 'px)'; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ---------------------------------------------------------------- motion */
function fmt(v, dec) { return dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US'); }
function motion() {
  root.classList.add('hl-on');
  if (!gsap || !ST || reduced) { $$('[data-reveal]').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
  const h1 = $('#hero-title');
  gsap.from(['.pill', '.hero .sub', '.hero .ctas', '.hero .fine'], { opacity: 0, y: 20, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.35, clearProps: 'transform' });
  if (Split) {
    const s = Split.create(h1, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    gsap.from(s.lines, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.09, delay: 0.15 });
    $$('[data-split]').forEach(el => {
      const t = Split.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
      gsap.from(t.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
  }
  ST.batch('[data-reveal]', { start: 'top 94%', onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08, overwrite: true }) });
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, dec = +(el.dataset.dec || 0), o = { v: 0 };
    el.textContent = fmt(0, dec);
    ST.create({ trigger: el, start: 'top 94%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v, dec); } }) });
  });
  gsap.from('.eta-bar i, .mc-bar i', { scaleX: 0, duration: 1.4, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.app', start: 'top 80%' } });
  gsap.from('.node', { opacity: 0, scale: 0.85, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.08, scrollTrigger: { trigger: '.hub', start: 'top 80%' } });
  setTimeout(() => { $$('[data-reveal]').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && getComputedStyle(el).opacity === '0') gsap.to(el, { opacity: 1, y: 0, duration: 0.6 }); }); }, 3500);
}
const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
fontsReady.then(() => { motion(); if (ST) ST.refresh(); });
window.addEventListener('load', () => { if (ST) ST.refresh(); if (!ok3d) setTimeout(() => HX.ready(), 2500); });
