import { createField } from './field.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, on() {}, ready() {} };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const root = document.documentElement;
root.classList.add('js');

const isMobile = () => HX.device === 'mobile' || window.innerWidth < 760;
const MOBILE = isMobile();
const LITE = !!HX.lite || MOBILE;
const REDUCED = !!HX.reducedMotion;
const FINE = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const { gsap, ScrollTrigger, SplitText } = window;
gsap.registerPlugin(ScrollTrigger, SplitText);

/* ---------- smooth scroll ---------- */
let lenis = null;
if (!HX.embed && !REDUCED && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.105, wheelMultiplier: 1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
function goTo(hash) {
  const el = hash === '#top' ? document.body : $(hash);
  if (!el) return;
  if (lenis) lenis.scrollTo(hash === '#top' ? 0 : el, { offset: 0, duration: 1.4 });
  else window.scrollTo({ top: hash === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY, behavior: REDUCED ? 'auto' : 'smooth' });
}
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const h = a.getAttribute('href');
  if (h.length < 2) return;
  e.preventDefault();
  closeMenu();
  goTo(h);
}));

/* ---------- nav + menu ---------- */
const nav = $('#nav'), menu = $('#menu'), menuBtn = $('#menuBtn');
function onScrollNav() { nav.classList.toggle('scrolled', window.scrollY > 30); }
window.addEventListener('scroll', onScrollNav, { passive: true });
onScrollNav();
function closeMenu() {
  if (!menu.classList.contains('open')) return;
  menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true');
  menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu');
  if (lenis) lenis.start();
}
menuBtn.addEventListener('click', () => {
  const open = !menu.classList.contains('open');
  if (!open) return closeMenu();
  menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false');
  menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.setAttribute('aria-label', 'Close menu');
  if (lenis) lenis.stop();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ---------- particle states per section ---------- */
const HALF_H = 10 * Math.tan(19 * Math.PI / 180);
const worldYAt = px => (0.5 - px / window.innerHeight) * 2 * HALF_H;
const demoHead = $('#demo-title'), demoTag = $('#demoEyebrow'), custTag = $('#custEyebrow'), footWord = $('#footWord');
const aboveEl = (el, gap, half) => s => worldYAt(el.getBoundingClientRect().top - gap) + half * s;
const centerOn = el => () => { const r = el.getBoundingClientRect(); return worldYAt(r.top + r.height / 2); };
const D = {
  hero:     { m: 0, x: 2.75, y: 0.02, s: 1.0, o: 1, r: 0 },
  ingest:   { m: 1, x: 2.45, y: -0.25, s: 0.86, o: 1, r: 0 },
  learn:    { m: 2, x: 2.65, y: 0.05, s: 1.0, o: 1, r: 0 },
  act:      { m: 3, x: 2.3, y: 0.1, s: 0.9, o: 1, r: 0 },
  predict:  { m: 3, x: 0.2, y: -2.9, s: 1.7, o: 0.26, r: 0 },
  features: { m: 4, x: 0, y: -0.2, s: 1.45, o: 0.2, r: 0 },
  cust:     { m: 4, x: 2.72, y: -0.05, s: 1.1, o: 1, r: 0 },
  pricing:  { m: 4, x: 0, y: -7.3, s: 2.65, o: 0.8, r: 0 },
  demo:     { m: 5, x: 0, y: 0, s: 1.0, o: 1, r: 0, ay: aboveEl(demoTag, 30, 0.68) },
  end:      { m: 5, x: 0, y: 0, s: 1.22, o: 0.42, r: 0, ay: centerOn(footWord) }
};
const M = {
  hero:     { m: 0, x: 0, y: 1.62, s: 0.64, o: 1, r: 0 },
  ingest:   { m: 1, x: 0, y: 1.55, s: 0.5, o: 1, r: 0 },
  learn:    { m: 2, x: 0, y: 1.55, s: 0.56, o: 1, r: 0 },
  act:      { m: 3, x: 0, y: 1.42, s: 0.58, o: 1, r: 0 },
  predict:  { m: 3, x: 0, y: -2.4, s: 0.95, o: 0.24, r: 0 },
  features: { m: 4, x: 0, y: 0, s: 0.85, o: 0.2, r: 0 },
  cust:     { m: 4, x: 0, y: 0, s: 0.66, o: 1, r: 0, ay: aboveEl(custTag, 26, 2.25) },
  pricing:  { m: 4, x: 0, y: -4.5, s: 1.5, o: 0.6, r: 0 },
  demo:     { m: 5, x: 0, y: 0, s: 0.4, o: 1, r: 0, ay: aboveEl(demoTag, 22, 0.68) },
  end:      { m: 5, x: 0, y: 0, s: 0.39, o: 0.5, r: 0, ay: centerOn(footWord) }
};
let keys = [];
function topOf(el) { return el.getBoundingClientRect().top + window.scrollY; }
function buildKeys() {
  const S = isMobile() ? M : D, vh = window.innerHeight;
  const how = $('#how'), predict = $('#predict'), feat = $('#features'), cust = $('#customers'), price = $('#pricing'), demo = $('#demo');
  const ht = topOf(how), span = how.offsetHeight - vh;
  const maxY = Math.max(1, document.documentElement.scrollHeight - vh);
  const k = [
    [0, S.hero],
    [ht - vh * 0.62, S.hero],
    [ht - vh * 0.02, S.ingest],
    [ht + span * 0.2, S.ingest],
    [ht + span * 0.42, S.learn],
    [ht + span * 0.58, S.learn],
    [ht + span * 0.8, S.act],
    [ht + span, S.act],
    [topOf(predict) + vh * 0.15, S.predict],
    [topOf(predict) + predict.offsetHeight - vh * 1.0, S.predict],
    [topOf(feat) + vh * 0.25, S.features],
    [topOf(feat) + feat.offsetHeight - vh * 0.95, S.features],
    [topOf(cust) - vh * 0.05, S.cust],
    [topOf(cust) + cust.offsetHeight - vh * 0.95, S.cust],
    [topOf(price) + vh * 0.2, S.pricing],
    [topOf(price) + price.offsetHeight - vh * 0.85, S.pricing],
    [topOf(demo) - vh * 0.08, S.demo],
    [topOf(demoHead) - vh * 0.42, S.demo],
    [maxY, S.end]
  ];
  for (let i = 1; i < k.length; i++) if (k[i][0] <= k[i - 1][0]) k[i][0] = k[i - 1][0] + 1;
  keys = k;
}
const tgt = { m: 0, x: 0, y: 0, s: 1, o: 1, r: 0 };
const FIELDS = ['m', 'x', 'y', 's', 'o', 'r'];
const yOf = st => (st.ay ? st.ay(st.s) : st.y);
function put(st) { FIELDS.forEach(f => { tgt[f] = st[f]; }); tgt.y = yOf(st); return tgt; }
function targetAt(y) {
  if (!keys.length) return put(isMobile() ? M.hero : D.hero);
  if (y <= keys[0][0]) return put(keys[0][1]);
  for (let i = 1; i < keys.length; i++) {
    if (y <= keys[i][0]) {
      const [y0, a] = keys[i - 1], [y1, b] = keys[i];
      let t = clamp((y - y0) / (y1 - y0), 0, 1);
      t = t * t * (3 - 2 * t);
      FIELDS.forEach(f => { tgt[f] = a[f] + (b[f] - a[f]) * t; });
      const ya = yOf(a), yb = yOf(b);
      tgt.y = ya + (yb - ya) * t;
      return tgt;
    }
  }
  return put(keys[keys.length - 1][1]);
}

/* ---------- how it works: steps ---------- */
const how = $('#how'), steps = $$('.step', how), rails = $$('.rail i', how), legends = $$('.lg', how);
let stepIdx = 0;
function updateHow() {
  const r = how.getBoundingClientRect();
  const span = how.offsetHeight - window.innerHeight;
  const p = clamp(-r.top / span, 0, 1);
  const idx = p < 0.33 ? 0 : p < 0.7 ? 1 : 2;
  if (idx === stepIdx) return;
  stepIdx = idx;
  steps.forEach((s, i) => { s.classList.toggle('is-on', i === idx); s.classList.toggle('is-past', i < idx); });
  rails.forEach((s, i) => s.classList.toggle('on', i <= idx));
  legends.forEach((s, i) => s.classList.toggle('is-on', i === idx));
}
window.addEventListener('scroll', updateHow, { passive: true });

/* ---------- counters ---------- */
function fmt(v, dec, suffix) {
  const s = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
  return s + (suffix || '');
}
function runCount(el, dur = 1.6) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), suf = el.dataset.suffix || '';
  if (REDUCED) { el.textContent = fmt(end, dec, suf); return; }
  const o = { v: 0 };
  el.textContent = fmt(0, dec, suf);
  gsap.to(o, { v: end, duration: dur, ease: 'expo.out', onUpdate: () => { el.textContent = fmt(o.v, dec, suf); }, onComplete: () => { el.textContent = fmt(end, dec, suf); } });
}

/* ---------- reveals ---------- */
function splitAll() {
  $$('[data-split]').forEach(el => {
    let lines;
    try { lines = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' }).lines; } catch (e) { lines = [el]; }
    gsap.set(el, { visibility: 'visible' });
    if (REDUCED) return;
    const inHero = !!el.closest('#top');
    gsap.from(lines, {
      yPercent: 118, duration: 1.1, ease: 'expo.out', stagger: 0.085, delay: inHero ? 0.1 : 0,
      scrollTrigger: inHero ? null : { trigger: el, start: 'top 90%', once: true }
    });
  });
}
function rises() {
  const hero = $$('#top [data-rise]');
  gsap.to(hero, { opacity: 1, y: 0, duration: 1.05, ease: 'power3.out', stagger: 0.09, delay: REDUCED ? 0 : 0.35 });
  $$('[data-rise]').filter(el => !el.closest('#top')).forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.95, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true, onEnter: () => el.classList.add('in') }
    });
  });
  $$('[data-count]').forEach(el => {
    if (el.closest('#top')) { setTimeout(() => runCount(el, 1.8), REDUCED ? 0 : 450); return; }
    ScrollTrigger.create({ trigger: el, start: 'top 94%', once: true, onEnter: () => runCount(el) });
  });
}

/* ---------- dashboard ---------- */
function dashboard() {
  const sec = $('#predict');
  const act = $('.act-line', sec), area = $('.act-area', sec), reveal = $('.fc-reveal', sec), annot = $('.annot', sec);
  const sparks = $$('.spark path', sec), rows = $$('.movers li', sec);
  const len = act.getTotalLength();
  gsap.set(act, { strokeDasharray: len, strokeDashoffset: len });
  gsap.set(area, { opacity: 0 });
  gsap.set(annot, { opacity: 0, y: 8 });
  sparks.forEach(p => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
  gsap.set(rows, { opacity: 0, x: -12 });
  const tl = gsap.timeline({ paused: true });
  tl.to(act, { strokeDashoffset: 0, duration: 0.95, ease: 'power2.inOut' }, 0.05)
    .to(area, { opacity: 1, duration: 0.8 }, 0.3)
    .to(reveal, { attr: { width: 228 }, duration: 0.95, ease: 'power2.out' }, 0.55)
    .to(annot, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }, 1.05)
    .to(sparks, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.out', stagger: 0.08 }, 0.25)
    .to(rows, { opacity: 1, x: 0, duration: 0.55, ease: 'power3.out', stagger: 0.07 }, 0.4);
  ScrollTrigger.create({
    trigger: $('.dash', sec), start: 'top 88%', once: true,
    onEnter: () => { tl.play(); $$('[data-count]', sec).forEach(el => runCount(el, 1.4)); }
  });
}

/* ---------- micro interactions ---------- */
function interactions() {
  if (FINE) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px');
        b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
    $$('.card').forEach(c => c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--px', (e.clientX - r.left) + 'px');
      c.style.setProperty('--py', (e.clientY - r.top) + 'px');
    }));
  }
  const form = $('#demoForm'), ok = $('.form-ok', form), email = $('#dEmail');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      email.focus();
      email.setAttribute('aria-invalid', 'true');
      email.placeholder = 'Please enter a valid work email';
      form.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 320 });
      return;
    }
    email.removeAttribute('aria-invalid');
    ok.textContent = 'Booked. A forecasting lead will email ' + v + ' within one business day with three demo slots.';
    form.classList.add('sent');
  });
}

/* ---------- boot ---------- */
let fieldReady = false, uiReady = false, readySent = false;
function maybeReady() {
  if (readySent || !fieldReady || !uiReady) return;
  readySent = true;
  HX.ready && HX.ready();
}

buildKeys();
try {
  createField($('#field'), {
    getTarget: () => targetAt(window.scrollY),
    lite: LITE, mobile: MOBILE,
    onFirstFrame: () => { fieldReady = true; maybeReady(); }
  });
} catch (err) {
  $('#field').style.display = 'none';
  root.style.background = 'radial-gradient(60% 50% at 75% 45%, rgba(94,242,255,.16), transparent 70%), #04050b';
  fieldReady = true;
}

const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
Promise.race([fontsReady, new Promise(r => setTimeout(r, 1800))]).then(() => {
  splitAll();
  rises();
  dashboard();
  interactions();
  updateHow();
  ScrollTrigger.refresh();
  buildKeys();
  uiReady = true;
  maybeReady();
});

let rz = 0;
window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { ScrollTrigger.refresh(); buildKeys(); }, 200); });
window.addEventListener('load', () => setTimeout(buildKeys, 300));
