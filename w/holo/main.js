import { createCard } from './card.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, on() {}, ready() {} };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const root = document.documentElement;
root.classList.add('js');
const isMobile = () => HX.device === 'mobile' || window.innerWidth < 760;
const MOBILE = isMobile();
const LITE = !!HX.lite || MOBILE;
const REDUCED = !!HX.reducedMotion;
const FINE = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const { gsap, ScrollTrigger, SplitText } = window;
gsap.registerPlugin(ScrollTrigger, SplitText);

/* ---------- smooth scroll, nav, menu ---------- */
let lenis = null;
if (!HX.embed && !REDUCED && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const nav = $('#nav'), menu = $('#menu'), menuBtn = $('#menuBtn');
function closeMenu() {
  if (!menu.classList.contains('open')) return;
  menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true');
  menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu');
  lenis && lenis.start();
}
menuBtn.addEventListener('click', () => {
  if (menu.classList.contains('open')) return closeMenu();
  menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false');
  menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.setAttribute('aria-label', 'Close menu');
  lenis && lenis.stop();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
const track = $('#track');
function trackSpan() { return Math.max(1, track.offsetHeight - window.innerHeight); }
function trackTop() { return track.getBoundingClientRect().top + window.scrollY; }
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const h = a.getAttribute('href');
  if (h.length < 2) return;
  e.preventDefault(); closeMenu();
  let y;
  if (h === '#top') y = 0;
  else if (h === '#anatomy') y = trackTop() + trackSpan() * 0.38;
  else { const el = $(h); if (!el) return; y = el.getBoundingClientRect().top + window.scrollY; }
  if (lenis) lenis.scrollTo(y, { duration: 1.6 });
  else window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
}));
function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 30); }
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- card choreography ---------- */
const PI = Math.PI;
const KD = [
  [0.0, { x: 3.7, y: 0.2, s: 1.0, rx: -0.2, ry: -0.55, rz: 0.13, ex: 0, beam: 0.62, sp: 1 }],
  [0.06, { x: 3.7, y: 0.2, s: 1.0, rx: -0.2, ry: -0.55, rz: 0.13, ex: 0, beam: 0.62, sp: 1 }],
  [0.3, { x: 2.75, y: 0.05, s: 1.03, rx: -0.12, ry: PI - 0.36, rz: -0.07, ex: 0, beam: 0.42, sp: 1 }],
  [0.5, { x: 2.85, y: 0.05, s: 1.03, rx: -0.16, ry: PI - 0.18, rz: -0.04, ex: 0, beam: 0.42, sp: 1 }],
  [0.6, { x: 2.2, y: 0.0, s: 0.86, rx: -0.75, ry: 2 * PI + 0.1, rz: 0.36, ex: 0.12, beam: 0.3, sp: 1 }],
  [0.72, { x: 1.75, y: -0.15, s: 0.78, rx: -1.0, ry: 2 * PI + 0.28, rz: 0.5, ex: 1, beam: 0.22, sp: 1 }],
  [1.0, { x: 1.75, y: -0.15, s: 0.78, rx: -0.96, ry: 2 * PI + 0.5, rz: 0.5, ex: 1, beam: 0.22, sp: 1 }]
];
const KM = [
  [0.0, { x: 0, y: 2.15, s: 0.5, rx: -0.22, ry: -0.5, rz: 0.12, ex: 0, beam: 0.5, sp: 1 }],
  [0.06, { x: 0, y: 2.15, s: 0.5, rx: -0.22, ry: -0.5, rz: 0.12, ex: 0, beam: 0.5, sp: 1 }],
  [0.3, { x: 0, y: 1.75, s: 0.53, rx: -0.12, ry: PI - 0.3, rz: -0.06, ex: 0, beam: 0.36, sp: 1 }],
  [0.5, { x: 0, y: 1.75, s: 0.53, rx: -0.15, ry: PI - 0.15, rz: -0.04, ex: 0, beam: 0.36, sp: 1 }],
  [0.6, { x: -0.4, y: 1.1, s: 0.42, rx: -0.8, ry: 2 * PI + 0.06, rz: 0.2, ex: 0.12, beam: 0.26, sp: 1.4 }],
  [0.72, { x: -0.6, y: 0.82, s: 0.345, rx: -1.02, ry: 2 * PI + 0.05, rz: 0.1, ex: 1, beam: 0.2, sp: 2.2 }],
  [1.0, { x: -0.6, y: 0.82, s: 0.345, rx: -0.98, ry: 2 * PI + 0.14, rz: 0.1, ex: 1, beam: 0.2, sp: 2.2 }]
];
const st = {};
function keyed(p) {
  const K = isMobile() ? KM : KD;
  if (p <= K[0][0]) return Object.assign(st, K[0][1]);
  for (let i = 1; i < K.length; i++) {
    if (p <= K[i][0]) {
      const [p0, a] = K[i - 1], [p1, b] = K[i];
      const t = sstep(p0, p1, p);
      for (const k in a) st[k] = a[k] + (b[k] - a[k]) * t;
      return st;
    }
  }
  return Object.assign(st, K[K.length - 1][1]);
}
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
if (FINE) window.addEventListener('pointermove', e => { pointer.tx = (e.clientX / window.innerWidth) * 2 - 1; pointer.ty = (e.clientY / window.innerHeight) * 2 - 1; }, { passive: true });
function progress() { return clamp(-track.getBoundingClientRect().top / trackSpan(), 0, 1); }
function getState(time) {
  const p = progress();
  const s = keyed(p);
  pointer.x += (pointer.tx - pointer.x) * 0.08; pointer.y += (pointer.ty - pointer.y) * 0.08;
  const live = 1 - sstep(0.0, 0.1, p) * 0.7;
  const idle = REDUCED ? 0 : 1;
  s.ry += (pointer.x * 0.38 + Math.sin(time * 0.5) * 0.13 * idle) * live;
  s.rx += (pointer.y * 0.24 + Math.sin(time * 0.37) * 0.06 * idle) * live;
  s.rz += Math.sin(time * 0.29) * 0.02 * idle;
  return s;
}

/* ---------- overlay text, labels and leader lines ---------- */
const heroEl = $('#top .hero-in'), caps = $$('.cap'), hint = $('.scroll-hint');
const labelEls = $$('#labels li'), leaders = $('#leaders');
leaders.innerHTML = labelEls.map(() => '<line x1="0" y1="0" x2="0" y2="0"/><circle r="3" cx="0" cy="0"/>').join('');
const lines = $$('line', leaders), dots = $$('circle', leaders);
let lastP = -1;
function overlay(cur, project) {
  const p = progress();
  if (Math.abs(p - lastP) > 0.0005 || p > 0.6) {
    lastP = p;
    const ho = 1 - sstep(0.02, 0.1, p);
    heroEl.style.opacity = ho.toFixed(3);
    heroEl.style.transform = `translate3d(0, ${(-p * 260).toFixed(1)}px, 0)`;
    heroEl.style.visibility = ho < 0.01 ? 'hidden' : 'visible';
    hint.style.opacity = (1 - sstep(0.0, 0.03, p)).toFixed(3);
    const c0 = sstep(0.17, 0.26, p) * (1 - sstep(0.47, 0.55, p));
    const c1 = sstep(0.62, 0.71, p);
    [c0, c1].forEach((o, i) => {
      caps[i].style.opacity = o.toFixed(3);
      caps[i].style.visibility = o < 0.01 ? 'hidden' : 'visible';
      caps[i].style.translate = `0 ${((1 - o) * 24).toFixed(1)}px`;
    });
  }
  const lo = sstep(0.66, 0.75, p) * clamp((cur.ex - 0.8) * 5, 0, 1);
  if (lo < 0.01) {
    if (labelEls[0].style.opacity !== '0') { labelEls.forEach(l => { l.style.opacity = '0'; }); leaders.style.opacity = '0'; }
    return;
  }
  const vw = window.innerWidth, mob = isMobile();
  const pts = labelEls.map((_, i) => project(i));
  const maxX = Math.max(...pts.map(q => q.x));
  const lw = mob ? 132 : 250;
  const lx = clamp(maxX + (mob ? 18 : 56), 10, vw - lw - (mob ? 10 : 28));
  const hs = labelEls.map(l => l.offsetHeight || 60);
  const ys = pts.map((q, i) => q.y - hs[i] / 2);
  const order = pts.map((_, i) => i).sort((a, b) => ys[a] - ys[b]);
  const gap = mob ? 8 : 14;
  for (let k = 1; k < order.length; k++) {
    const a = order[k - 1], b = order[k];
    if (ys[b] < ys[a] + hs[a] + gap) ys[b] = ys[a] + hs[a] + gap;
  }
  leaders.style.opacity = lo.toFixed(3);
  labelEls.forEach((l, i) => {
    l.style.opacity = lo.toFixed(3);
    l.style.transform = `translate3d(${lx.toFixed(1)}px, ${ys[i].toFixed(1)}px, 0)`;
    lines[i].setAttribute('x1', pts[i].x.toFixed(1)); lines[i].setAttribute('y1', pts[i].y.toFixed(1));
    lines[i].setAttribute('x2', (lx - 4).toFixed(1)); lines[i].setAttribute('y2', (ys[i] + hs[i] / 2).toFixed(1));
    dots[i].setAttribute('cx', pts[i].x.toFixed(1)); dots[i].setAttribute('cy', pts[i].y.toFixed(1));
  });
}

/* ---------- counters ---------- */
function fmt(v, dec) { return dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US'); }
function runCount(el, dur = 1.6) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const end = parseFloat(el.dataset.count), from = parseFloat(el.dataset.from || '0'), dec = parseInt(el.dataset.dec || '0', 10);
  if (REDUCED) { el.textContent = fmt(end, dec); return; }
  const o = { v: from };
  el.textContent = fmt(from, dec);
  gsap.to(o, { v: end, duration: dur, ease: 'expo.out', onUpdate: () => { el.textContent = fmt(o.v, dec); }, onComplete: () => { el.textContent = fmt(end, dec); } });
}

/* ---------- reveals ---------- */
function reveals() {
  $$('[data-split]').forEach(el => {
    let parts;
    try { parts = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' }).lines; } catch (e) { parts = [el]; }
    gsap.set(el, { visibility: 'visible' });
    if (REDUCED) return;
    const inHero = !!el.closest('#top');
    gsap.from(parts, { yPercent: 118, duration: 1.1, ease: 'expo.out', stagger: 0.085, delay: inHero ? 0.1 : 0, scrollTrigger: inHero ? null : { trigger: el, start: 'top 90%', once: true } });
  });
  gsap.to($$('#top [data-rise]'), { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.09, delay: REDUCED ? 0 : 0.35 });
  $$('[data-rise]').filter(el => !el.closest('#top')).forEach(el => {
    const isPhone = el.classList.contains('phone');
    const vars = { opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } };
    if (isPhone) {
      const mob = isMobile();
      vars.transform = el.classList.contains('p1')
        ? (mob ? 'translate(-30%, 6%) rotate(-6deg) scale(.96)' : 'translate(-40%, 4%) rotate(-6deg)')
        : (mob ? 'translate(30%, -6%) rotate(5deg) scale(.96)' : 'translate(42%, -4%) rotate(5deg)');
      vars.duration = 1.2;
    } else vars.y = 0;
    gsap.to(el, vars);
  });
  $$('[data-count]').forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 94%', once: true, onEnter: () => runCount(el, el.dataset.from ? 2 : 1.6) }));
  const ring = $('.ring');
  ScrollTrigger.create({ trigger: ring, start: 'top 90%', once: true, onEnter: () => ring.classList.add('in') });
  gsap.from($$('.feed li'), { opacity: 0, x: 18, duration: 0.6, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: '.feed', start: 'top 92%', once: true } });
  gsap.from($$('.cmp tbody tr'), { opacity: 0, y: 14, duration: 0.6, ease: 'power3.out', stagger: 0.05, scrollTrigger: { trigger: '.cmp', start: 'top 88%', once: true } });
  const fp = $$('.fp path');
  fp.forEach(path => { const l = path.getTotalLength(); path.style.strokeDasharray = l; path.style.strokeDashoffset = l; });
  ScrollTrigger.create({ trigger: '.sv-bio', start: 'top 92%', once: true, onEnter: () => gsap.to(fp, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', stagger: 0.1 }) });
}

/* ---------- small live details ---------- */
function liveBits() {
  const frz = $('.sv-freeze'), virt = $('.sv-virtual');
  let on = false;
  setInterval(() => { if (HX.paused) return; on = !on; frz.classList.toggle('frozen', on); virt.classList.toggle('fan', on); }, 2600);

  const ahead = $('#ahead'), joined = $('#joined');
  let n = 48210;
  const msgs = ['+1 joined behind you', '3 invites just went out', '+2 joined behind you', '1 invite just went out'];
  let mi = 0;
  setInterval(() => {
    if (HX.paused) return;
    const m = msgs[mi % msgs.length]; mi++;
    if (m.includes('invite')) { n -= parseInt(m, 10); ahead.textContent = n.toLocaleString('en-US'); }
    joined.textContent = m;
    joined.classList.add('show');
    setTimeout(() => joined.classList.remove('show'), 2200);
  }, 4200);

  const form = $('#wlForm'), email = $('#wlEmail'), ok = $('.wl-ok', form);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      email.setAttribute('aria-invalid', 'true'); email.placeholder = 'Please enter a valid email'; email.focus();
      form.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 320 });
      return;
    }
    email.removeAttribute('aria-invalid');
    ok.textContent = `You're in at #${(n + 1).toLocaleString('en-US')}. Share your link to move up 500 spots.`;
    form.classList.add('sent');
  });

  $$('.acc details').forEach(d => d.addEventListener('toggle', () => { if (d.open) $$('.acc details').forEach(o => { if (o !== d) o.open = false; }); }));

  const mc = $('#miniCard');
  if (FINE) {
    mc.parentElement.addEventListener('pointermove', e => {
      const r = mc.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      mc.style.setProperty('--ry', ((x - 0.5) * 26).toFixed(2) + 'deg');
      mc.style.setProperty('--rx', ((0.5 - y) * 18).toFixed(2) + 'deg');
      mc.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); mc.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    });
    mc.parentElement.addEventListener('pointerleave', () => { mc.style.setProperty('--ry', '-16deg'); mc.style.setProperty('--rx', '8deg'); });
  }
  if (!REDUCED) {
    let t0 = 0;
    const spin = t => {
      if (!t0) t0 = t;
      const k = (t - t0) / 1000;
      if (!mc.matches(':hover')) {
        mc.style.setProperty('--gx', (50 + Math.sin(k * 0.6) * 40).toFixed(1) + '%');
        mc.style.setProperty('--gy', (45 + Math.cos(k * 0.45) * 30).toFixed(1) + '%');
      }
      requestAnimationFrame(spin);
    };
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting && !t0) requestAnimationFrame(spin); }));
    io.observe(mc);
  }

  if (FINE) $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px');
      b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px');
    });
    b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
  });
}

/* ---------- boot ---------- */
let glReady = false, uiReady = false, sent = false;
const ready = () => { if (!sent && glReady && uiReady) { sent = true; HX.ready && HX.ready(); } };
let scene = null;
try {
  scene = createCard($('#gl'), { lite: LITE, getState, onFrame: overlay, onFirstFrame: () => { glReady = true; ready(); } });
  const io = new IntersectionObserver(es => es.forEach(en => scene.setRunning(en.isIntersecting)), { rootMargin: '80px 0px' });
  io.observe(track);
} catch (err) {
  $('#gl').style.display = 'none';
  glReady = true;
}
const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
Promise.race([fontsReady, new Promise(r => setTimeout(r, 1800))]).then(() => {
  reveals();
  liveBits();
  ScrollTrigger.refresh();
  uiReady = true; ready();
});
let rz = 0;
window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => ScrollTrigger.refresh(), 200); });
