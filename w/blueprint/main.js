// Keystone Build · page controller
import { elevationSVG, planSVG, projectSVG } from './drawing.js';
import { initModel } from './scene.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: innerWidth < 760 ? 'mobile' : 'desktop', reducedMotion: false, ready() {}, on() {} };
const root = document.documentElement;
root.classList.add('js');
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (v) => { const t = clamp(v); return t * t * (3 - 2 * t); };
const mobile = HX.device === 'mobile' || window.innerWidth < 760;
const lite = !!HX.lite || mobile;
const reduced = !!HX.reducedMotion;
const gsap = window.gsap, ST = window.ScrollTrigger, Split = window.SplitText;
if (gsap && ST) gsap.registerPlugin(ST);
if (gsap && Split) gsap.registerPlugin(Split);

if (!HX.embed && !mobile && !reduced && window.Lenis && gsap) {
  const lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', () => ST && ST.update());
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => { const id = a.getAttribute('href'); if (id.length < 2) return; const t = $(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { duration: 1.4 }); }));
}

/* ---------------------------------------------------------------- hero drawings */
const dwg = $('#dwg');
dwg.innerHTML = elevationSVG() + planSVG();
const elev = $('.dwg-elev', dwg), plan = $('.dwg-plan', dwg);
elev.style.transformOrigin = '50% 86.6%';
plan.style.transformOrigin = '50% 50%';
if (reduced) { elev.classList.add('drawn'); plan.classList.add('drawn'); }

/* ---------------------------------------------------------------- 3D structural model */
const canvas = $('#model');
let model = null;
function planMap() {
  const r = dwg.getBoundingClientRect(), c = canvas.getBoundingClientRect();
  const s = Math.min(r.width / 1000, r.height / 880);
  const offX = r.left - c.left + (r.width - 1000 * s) / 2, offY = r.top - c.top + (r.height - 880 * s) / 2;
  return { ox: offX + 120 * s, oy: offY + 192 * s, ppm: 20 * s, s, offX, offY };
}
const mls = $$('.ml').map(el => ({ el, p: el.dataset.p.split(',').map(Number), on: false }));
let proj = null;
try {
  model = initModel(canvas, { lite, mobile, fx: mobile ? 0.6 : 0.69, fy: mobile ? 0.3 : 0.47, planMap, onProject: (fn) => { proj = fn; } });
} catch (e) { model = null; }

/* ---------------------------------------------------------------- hero phases */
const hero = $('#top');
const c0 = $('.c0'), c1 = $('.c1'), c2 = $('.c2');
const tbTitle = $('.tb-title'), tbNo = $('.tb-no'), tbScale = $('.tb-scale');
const sheets = [['South elevation', 'KB-2026-014', '1:100'], ['Typical floor plan, L3', 'KB-2026-015', '1:100'], ['Structural model', 'KB-2026-016', 'NTS']];
let sheetIdx = 0, planDrawn = false, t0 = performance.now();
const xh = $('.xhair'), xH = $('.xh'), xV = $('.xv'), xBox = $('.xbox'), xy = $('.xy');
const ptr = { x: -1, y: -1, t: 0 };
if (!mobile && !HX.embed) window.addEventListener('pointermove', (e) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = performance.now(); }, { passive: true });
function setCopy(el, o, ty) { el.style.setProperty('--o', o.toFixed(3)); el.style.setProperty('--ty', ty.toFixed(1) + 'px'); el.style.visibility = o < 0.01 ? 'hidden' : 'visible'; el.style.pointerEvents = o > 0.5 ? 'auto' : 'none'; }
const fmt = (v) => { const n = Math.round(v / 50) * 50; return (n < 0 ? '-' : '') + Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
const nav = $('#nav');

function heroFrame(now) {
  requestAnimationFrame(heroFrame);
  nav.classList.toggle('is-scrolled', window.scrollY > 30);
  const r = hero.getBoundingClientRect(), vh = window.innerHeight;
  if (r.bottom < 0) return;
  const p = clamp(-r.top / Math.max(1, r.height - vh)), t = (now - t0) / 1000;
  // elevation folds back into the plan, the plan hands over to the 3D model
  const fold = sm((p - 0.16) / 0.18);
  elev.style.transform = 'rotateX(' + (fold * 82).toFixed(2) + 'deg)';
  elev.style.opacity = (1 - sm((p - 0.27) / 0.07)).toFixed(3);
  const pin = sm((p - 0.26) / 0.12), pout = sm((p - 0.5) / 0.08);
  plan.style.opacity = (pin * (1 - pout)).toFixed(3);
  plan.style.transform = 'scale(' + (0.92 + 0.08 * pin).toFixed(4) + ')';
  if (!planDrawn && p > 0.24) { planDrawn = true; plan.classList.add('drawn'); }
  const m3 = sm((p - 0.45) / 0.07);
  canvas.style.opacity = m3.toFixed(3);
  if (model && m3 > 0.001) {
    const tilt = sm((p - 0.55) / 0.17), grow = clamp((p - 0.53) / 0.3);
    model.render({ t: tilt, grow, alpha: 1, spin: Math.sin(t * 0.2) * 0.1 * tilt });
    const show = grow > 0.97 && proj;
    mls.forEach(m => {
      if (show) { const [x, y] = proj(m.p); m.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'; }
      if (!!show !== m.on) { m.on = !!show; m.el.classList.toggle('on', m.on); }
    });
  } else mls.forEach(m => { if (m.on) { m.on = false; m.el.classList.remove('on'); } });
  // copy
  const a = 1 - sm((p - 0.14) / 0.08); setCopy(c0, a, (1 - a) * -30);
  const b = sm((p - 0.27) / 0.08) * (1 - sm((p - 0.5) / 0.07)); setCopy(c1, b, (1 - b) * 24);
  const c = sm((p - 0.6) / 0.1); setCopy(c2, c, (1 - c) * 24);
  const si = p < 0.24 ? 0 : p < 0.52 ? 1 : 2;
  if (si !== sheetIdx) { sheetIdx = si; tbTitle.textContent = sheets[si][0]; tbNo.textContent = sheets[si][1]; tbScale.textContent = sheets[si][2]; }
  // crosshair with live drawing coordinates
  const active = p < 0.46 && !reduced;
  xh.classList.toggle('on', active);
  if (active) {
    const map = planMap(), wr = dwg.getBoundingClientRect(), hr = $('.hero-sticky').getBoundingClientRect();
    let x, y;
    if (ptr.x >= 0 && now - ptr.t < 6000 && ptr.y > wr.top && ptr.y < wr.bottom) { x = ptr.x - hr.left; y = ptr.y - hr.top; }
    else { x = wr.left - hr.left + wr.width * (0.5 + 0.33 * Math.sin(t * 0.42)); y = wr.top - hr.top + wr.height * (0.48 + 0.3 * Math.sin(t * 0.31 + 1.2)); }
    xH.style.transform = 'translateY(' + y.toFixed(1) + 'px)'; xV.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
    xBox.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    xy.style.transform = 'translate(' + Math.min(x, hr.width - 190).toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    let u = (x - map.offX) / map.s, v = (y - map.offY) / map.s;
    if (p < 0.26) { const es = Math.min(wr.width / 1180, wr.height / 880), eox = wr.left - hr.left + (wr.width - 1180 * es) / 2, eoy = wr.top - hr.top + (wr.height - 880 * es) / 2; u = (x - eox) / es; v = (y - eoy) / es; }
    xy.textContent = p < 0.26 ? 'X ' + fmt((u - 120) / 20 * 1000) + ' · Y ' + fmt((762 - v) / 20 * 1000) : 'X ' + fmt((u - 120) / 20 * 1000) + ' · Z ' + fmt((v - 192) / 20 * 1000);
  }
}
requestAnimationFrame(heroFrame);

/* ---------------------------------------------------------------- menu */
const menuBtn = $('.menu-btn'), menu = $('#menu');
function setMenu(open) {
  root.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-hidden', String(!open));
  $('span', menuBtn).textContent = open ? 'Close' : 'Menu';
  if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
}
menuBtn.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
$$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------------------------------------------------------------- projects: drawing to render */
$$('.pj-card').forEach(card => {
  $('.pj-svg', card).innerHTML = projectSVG(card.dataset.pj);
  const btns = $$('.pj-tg button', card);
  const set = (rd) => { card.classList.toggle('is-rd', rd); btns.forEach(b => b.classList.toggle('on', (b.dataset.v === 'rd') === rd)); };
  btns.forEach(b => b.addEventListener('click', () => { card.dataset.user = '1'; set(b.dataset.v === 'rd'); }));
  card._set = set;
});
const pjIO = new IntersectionObserver((es) => es.forEach(e => {
  const card = e.target;
  if (e.isIntersecting && !card.classList.contains('drawn')) {
    card.classList.add('drawn');
    setTimeout(() => { if (!card.dataset.user) card._set(true); }, reduced ? 0 : 2300);
    if (HX.embed) { let rd = true; card._cyc = setInterval(() => { if (card.dataset.user) return; rd = !rd; card._set(rd); }, 4600); }
  }
}), { threshold: 0.2 });
$$('.pj-card').forEach(c => pjIO.observe(c));

/* ---------------------------------------------------------------- form */
const form = $('#quote-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.elements.name, phone = form.elements.phone;
  let ok = true;
  [name, phone].forEach(f => f.closest('.fld').classList.remove('err'));
  if (!name.value.trim()) { name.closest('.fld').classList.add('err'); ok = false; }
  if (phone.value.replace(/\D/g, '').length < 8) { phone.closest('.fld').classList.add('err'); ok = false; }
  if (!ok) { (name.value.trim() ? phone : name).focus(); return; }
  $('.fd-n', form).textContent = ', ' + name.value.trim().split(' ')[0];
  $('.f-in', form).hidden = true; $('.f-done', form).hidden = false;
  requestAnimationFrame(() => form.classList.add('is-done'));
});

if (!mobile && !HX.embed && !reduced) {
  $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)'; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ---------------------------------------------------------------- motion */
function motion() {
  requestAnimationFrame(() => elev.classList.add('drawn'));
  setTimeout(() => HX.ready(), 250);
  if (!gsap || !ST || reduced) { root.classList.add('intro-done'); $$('[data-reveal]').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
  if (Split) {
    const s = Split.create($('#hero-title'), { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    root.classList.add('intro-done');
    gsap.from(s.lines, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.2 });
    $$('[data-split]').forEach(el => { const t = Split.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' }); gsap.from(t.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 90%' } }); });
  } else root.classList.add('intro-done');
  gsap.from(['.c0 .eyebrow', '.c0 .lede', '.c0 .ctas', '.tblock'], { opacity: 0, y: 18, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.5, clearProps: 'transform,opacity' });
  ST.batch('[data-reveal]', { start: 'top 94%', onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08, overwrite: true }) });
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, dec = +(el.dataset.dec || 0), o = { v: 0 };
    el.textContent = dec ? '0.0' : '0';
    ST.create({ trigger: el, start: 'top 94%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = dec ? o.v.toFixed(dec) : Math.round(o.v).toString(); } }) });
  });
  const digits = $$('.digits span'), dO = { v: 0 };
  digits.forEach(d => { d.textContent = '0'; });
  ST.create({ trigger: '.board', start: 'top 88%', once: true, onEnter: () => gsap.to(dO, { v: 900, duration: 2.2, ease: 'power3.out', onUpdate: () => { const s = String(Math.round(dO.v)).padStart(4, '0'); digits.forEach((d, i) => { d.textContent = s[i]; }); } }) });
  ST.create({ trigger: '.tl', start: 'top 80%', end: 'bottom 60%', scrub: 0.4, onUpdate: (s) => $('.tl').style.setProperty('--tlp', s.progress.toFixed(3)) });
  $$('.svc svg path').forEach(p => { p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = '1'; });
  ST.batch('.svc', { start: 'top 90%', onEnter: (els) => els.forEach((c, i) => gsap.to($$('svg path', c), { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.06, delay: i * 0.12 })) });
  setTimeout(() => { $$('[data-reveal]').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && getComputedStyle(el).opacity === '0') gsap.to(el, { opacity: 1, y: 0, duration: 0.6 }); }); }, 3500);
}
const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
fontsReady.then(() => { motion(); if (ST) ST.refresh(); });
window.addEventListener('load', () => { if (ST) ST.refresh(); if (model) model.resize(); });
