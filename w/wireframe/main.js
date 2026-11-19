// Arcline Studio · page controller
import { initScene } from './scene.js';
import * as AX from './axo.js';

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

/* ---------------------------------------------------------------- smooth scroll (full-page desktop only) */
if (!HX.embed && !mobile && !reduced && window.Lenis && gsap) {
  const lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', () => ST && ST.update());
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = $(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: 0, duration: 1.4 });
  }));
}

/* ---------------------------------------------------------------- scroll state shared with the scene */
const hero = $('#top'), proc = $('#process');
function prog(el) {
  const r = el.getBoundingClientRect(), vh = window.innerHeight;
  return { p: clamp(-r.top / Math.max(1, r.height - vh)), vis: r.bottom > 0 && r.top < vh };
}
function getMode() {
  const h = prog(hero); if (h.vis) return { mode: 'hero', p: h.p };
  const q = prog(proc); if (q.vis) return { mode: 'process', p: q.p };
  return { mode: 'none', p: 0 };
}

/* ---------------------------------------------------------------- 3D */
let sceneOk = false;
try {
  initScene($('#stage'), {
    mobile, lite, embed: HX.embed, instant: reduced, labelRoot: $('#labels'), getMode,
    onFirstFrame: () => { sceneOk = true; HX.ready(); }
  });
} catch (err) {
  // No WebGL: fall back to the same house as a static line drawing.
  const fb = document.createElement('div');
  fb.className = 'hero-fallback drawn';
  fb.innerHTML = AX.renderAxo(AX.casaLumen(), { id: 'fb', label: 'Axonometric line drawing of Casa Lumen' });
  $('.hero-sticky').prepend(fb);
  $('#stage').style.display = 'none';
  HX.ready();
}

/* ---------------------------------------------------------------- hero captions + process steps */
const capIntro = $('.cap-intro'), capEx = $('.cap-explode'), capLight = $('.cap-light');
const smLines = $$('.sm-line'), hint = $('.scroll-hint');
const steps = $$('.step'), psN = $('.ps-n'), psT = $('.ps-t'), pbar = $('.process-bar');
const stepNames = ['Sketch', 'Model', 'Detail', 'Build'];
let curStage = -1, curStep = -1;
function setCap(el, o, ty) {
  el.style.setProperty('--o', o.toFixed(3));
  el.style.setProperty('--ty', ty.toFixed(1) + 'px');
  el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
  el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
}
const nav = $('#nav'), darkZones = [$('#contact'), $('.footer')];
function ui() {
  requestAnimationFrame(ui);
  const h = prog(hero);
  if (h.vis) {
    const p = h.p;
    const a = 1 - clamp((p - 0.05) / 0.1);
    setCap(capIntro, a, (1 - a) * -46);
    if (hint) hint.style.opacity = a.toFixed(3);
    const b = clamp((p - 0.22) / 0.1) * (1 - clamp((p - 0.55) / 0.08));
    setCap(capEx, b, (1 - b) * 26);
    const c = clamp((p - 0.68) / 0.12);
    setCap(capLight, c, (1 - c) * 34);
    const stage = p < 0.2 ? 0 : p < 0.62 ? 1 : 2;
    if (stage !== curStage) { curStage = stage; smLines.forEach((s, i) => s.classList.toggle('on', i === stage)); }
  }
  const q = prog(proc);
  if (q.vis) {
    const p = q.p, idx = p < 0.22 ? 0 : p < 0.5 ? 1 : p < 0.78 ? 2 : 3;
    if (idx !== curStep) {
      curStep = idx;
      steps.forEach((s, i) => s.classList.toggle('is-on', i === idx));
      psN.textContent = 'A-10' + (4 + idx); psT.textContent = stepNames[idx];
    }
    pbar.style.setProperty('--pp', p.toFixed(4));
  }
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 30);
  const mid = 34;
  const dark = darkZones.some(z => { const r = z.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
  nav.classList.toggle('is-dark', dark);
  root.classList.toggle('is-dark-zone', dark);
}
requestAnimationFrame(ui);

/* ---------------------------------------------------------------- menu */
const menuBtn = $('.menu-btn'), menu = $('#menu');
function setMenu(open) {
  root.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
  $('.menu-txt').textContent = open ? 'Close' : 'Menu';
  if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
}
menuBtn.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
$$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------------------------------------------------------------- work drawings */
const builders = { casaLumen: AX.casaLumen, longHouse: AX.longHouse, kilnPavilion: AX.kilnPavilion, arcLibrary: AX.arcLibrary };
const cards = $$('.proj');
setTimeout(() => {
  cards.forEach((card, i) => {
    const mk = builders[card.dataset.axo];
    $('.proj-svg', card).innerHTML = AX.renderAxo(mk(), { id: 'ax' + i, label: card.dataset.label, span: 1000, pad: mobile ? 30 : 38 });
  });
  if (reduced) { cards.forEach(c => c.classList.add('drawn')); return; }
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('drawn'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -6% 0px', threshold: 0.12 });
  cards.forEach(c => io.observe(c));
}, 30);

/* ---------------------------------------------------------------- sun path study */
(function sunPath() {
  const fig = $('[data-sun]'); if (!fig) return;
  const C = [280, 320], S = [240, 250], Wn = [220, 165];
  const pt = (r, th) => [C[0] - r[0] * Math.cos(th), C[1] - r[1] * Math.sin(th)];
  let d = '';
  for (const r of [S, Wn]) for (let k = 1; k < 12; k++) {
    const th = k / 12 * Math.PI, a = pt(r, th), b = pt([r[0] + 7, r[1] + 7], th);
    d += 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
  }
  $('.sp-hours', fig).innerHTML = '<path d="' + d + '"/>';
  const rects = [[200, 180, 490, 186], [220, 186, 470, 242], [160, 242, 470, 248], [150, 308, 430, 320]];
  function clip(a, b) { // first hit of segment a->b with any rect (Liang-Barsky)
    let best = 1;
    for (const [x0, y0, x1, y1] of rects) {
      let t0 = 0, t1 = 1; const dx = b[0] - a[0], dy = b[1] - a[1];
      const P = [-dx, dx, -dy, dy], Q = [a[0] - x0, x1 - a[0], a[1] - y0, y1 - a[1]];
      let ok = true;
      for (let i = 0; i < 4; i++) {
        if (Math.abs(P[i]) < 1e-9) { if (Q[i] < 0) { ok = false; break; } continue; }
        const t = Q[i] / P[i];
        if (P[i] < 0) { if (t > t1) { ok = false; break; } if (t > t0) t0 = t; } else { if (t < t0) { ok = false; break; } if (t < t1) t1 = t; }
      }
      if (ok && t0 > 1e-4 && t0 < best) best = t0;
    }
    return best;
  }
  const ray = $('.sp-ray', fig), rayS = $('.sp-ray-s', fig), patch = $('.sp-patch', fig), sun = $('.sp-sun', fig), sunS = $('.sp-sun-s', fig), glass = $('.sp-glass', fig);
  const P = (q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1);
  // summer: high sun, stopped by the roof overhang
  const ss = pt(S, 0.6 * Math.PI), st = [300, 306], ts = clip(ss, st), hs = [ss[0] + (st[0] - ss[0]) * ts, ss[1] + (st[1] - ss[1]) * ts];
  sunS.setAttribute('cx', ss[0].toFixed(1)); sunS.setAttribute('cy', ss[1].toFixed(1));
  rayS.setAttribute('d', 'M' + P(ss) + 'L' + P(hs) + 'M' + (hs[0] - 5) + ' ' + (hs[1] - 5) + 'l10 10M' + (hs[0] + 5) + ' ' + (hs[1] - 5) + 'l-10 10');
  function frame(th) {
    const s0 = pt(Wn, th), right = th > Math.PI / 2;
    const gx = right ? 350 : 190, g = [gx, 296];
    const k = (308 - s0[1]) / (g[1] - s0[1]), fl = [s0[0] + (g[0] - s0[0]) * k, 307];
    const t = clip(s0, fl), hit = [s0[0] + (fl[0] - s0[0]) * t, s0[1] + (fl[1] - s0[1]) * t];
    sun.setAttribute('cx', s0[0].toFixed(1)); sun.setAttribute('cy', s0[1].toFixed(1));
    ray.setAttribute('d', 'M' + P(s0) + 'L' + P(t < 0.999 ? hit : fl));
    const lit = t >= 0.999 && fl[0] > 192 && fl[0] < 348;
    patch.setAttribute('d', lit ? 'M' + P([fl[0], 306]) + 'L' + P([right ? Math.max(192, fl[0] - 46) : Math.min(348, fl[0] + 46), 306]) : 'M0 0');
    glass.style.fill = lit ? '#ffd9bd' : '#f6ece4';
  }
  let th = 0.74 * Math.PI, dir = -1, on = false, last = 0;
  frame(th);
  if (reduced) return;
  function loop(now) {
    if (!on) return;
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    th += dir * dt * 0.09;
    if (th < 0.2 * Math.PI) { th = 0.2 * Math.PI; dir = 1; } else if (th > 0.8 * Math.PI) { th = 0.8 * Math.PI; dir = -1; }
    frame(th);
  }
  new IntersectionObserver((es) => { on = es[0].isIntersecting; if (on) { last = 0; requestAnimationFrame(loop); } }).observe(fig);
})();

/* ---------------------------------------------------------------- clocks */
const tzParts = (tz) => {
  const parts = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).formatToParts(new Date());
  const h = +parts.find(p => p.type === 'hour').value, m = +parts.find(p => p.type === 'minute').value;
  return { h: h % 24, m };
};
$$('.clock').forEach((c, i) => {
  c.dataset.tz = i === 0 ? 'Asia/Kolkata' : 'Europe/Lisbon';
  const g = $('.ticks', c); let d = '';
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, r0 = k % 3 === 0 ? 27 : 30; d += 'M' + (40 + Math.sin(a) * r0).toFixed(2) + ' ' + (40 - Math.cos(a) * r0).toFixed(2) + 'L' + (40 + Math.sin(a) * 33).toFixed(2) + ' ' + (40 - Math.cos(a) * 33).toFixed(2); }
  g.innerHTML = '<path d="' + d + '"/>';
});
function clocks() {
  $$('[data-clock]').forEach(el => { const t = tzParts(el.dataset.clock); el.textContent = String(t.h).padStart(2, '0') + ':' + String(t.m).padStart(2, '0'); });
  $$('.clock').forEach(c => {
    const t = tzParts(c.dataset.tz);
    $('.hh', c).style.transform = 'rotate(' + ((t.h % 12) * 30 + t.m * 0.5) + 'deg)';
    $('.mh', c).style.transform = 'rotate(' + (t.m * 6) + 'deg)';
  });
}
clocks(); setInterval(clocks, 20000);

/* ---------------------------------------------------------------- form */
const form = $('#contact-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#f-name'), email = $('#f-email');
  let ok = true;
  [name, email].forEach(f => f.parentElement.classList.remove('err'));
  if (!name.value.trim()) { name.parentElement.classList.add('err'); ok = false; }
  if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) { email.parentElement.classList.add('err'); ok = false; }
  if (!ok) { (name.value.trim() ? email : name).focus(); return; }
  $('.fd-name', form).textContent = ', ' + name.value.trim().split(' ')[0];
  $('.form-inner', form).hidden = true;
  const done = $('.form-done', form); done.hidden = false;
  requestAnimationFrame(() => form.classList.add('is-done'));
});

/* ---------------------------------------------------------------- magnetic buttons (desktop, not embedded) */
if (!mobile && !HX.embed && !reduced) {
  $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)';
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ---------------------------------------------------------------- motion: splits, reveals, counters */
function motion() {
  if (!gsap || !ST) { $$('[data-reveal]').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; }); root.classList.add('intro-done'); return; }
  const introEls = [$('.cap-intro .eyebrow'), $('.cap-intro .lede'), $('.cap-intro .ctas'), $('.sheet-meta'), $('.hero-foot')].filter(Boolean);
  const h1 = $('#hero-title');
  if (reduced) {
    root.classList.add('intro-done');
    $$('[data-reveal]').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }
  // hero intro
  if (Split) {
    const s = Split.create(h1, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    root.classList.add('intro-done');
    gsap.from(s.lines, { yPercent: 108, duration: 1.25, ease: 'expo.out', stagger: 0.1, delay: 0.15 });
  } else root.classList.add('intro-done');
  gsap.from(introEls, { opacity: 0, y: 18, duration: 1.1, ease: 'power3.out', stagger: 0.08, delay: 0.45, clearProps: 'transform' });

  // section headings
  if (Split) $$('[data-split]').forEach(el => {
    const s = Split.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    gsap.from(s.lines, { yPercent: 108, duration: 1.15, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  // reveals
  ST.batch('[data-reveal]', {
    start: 'top 94%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', stagger: 0.07, overwrite: true })
  });
  // manifesto word by word
  const man = $('[data-words]');
  if (man && Split) {
    const s = Split.create(man, { type: 'words', wordsClass: 'w' });
    gsap.to(s.words, { opacity: 1, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: man, start: 'top 82%', end: 'bottom 52%', scrub: 0.4 } });
  }
  // counters
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, o = { v: 0 };
    ST.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-US'); } }) });
  });
  // the principle icons draw themselves
  $$('.principles svg path, .principles svg circle:not(.dotfill)').forEach(p => { p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = '1'; });
  ST.batch('.principles li', { start: 'top 90%', onEnter: (els) => els.forEach((li, i) => gsap.to($$('path, circle:not(.dotfill)', li), { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.08, delay: i * 0.1 })) });
  // sun path diagram draws in
  const spEls = $$('.sunpath .sp-house path, .sunpath .sp-ground, .sunpath .sp-hatch, .sunpath .sp-arc');
  spEls.forEach(p => { p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = '1'; });
  ST.create({ trigger: '.sunpath', start: 'top 88%', once: true, onEnter: () => gsap.to(spEls, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', stagger: 0.04, onComplete: () => spEls.forEach(p => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; p.removeAttribute('pathLength'); }) }) });
  // monograms draw too
  $$('.mono path').forEach(p => { p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = '1'; });
  ST.batch('.partner', { start: 'top 92%', onEnter: (els) => els.forEach((c, i) => gsap.to($$('.mono path', c), { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', stagger: 0.12, delay: 0.2 + i * 0.12 })) });
  // safety net: never leave content hidden
  setTimeout(() => { $$('[data-reveal]').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && getComputedStyle(el).opacity === '0') gsap.to(el, { opacity: 1, y: 0, duration: 0.6 }); }); }, 3500);
}
const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
fontsReady.then(() => { motion(); if (ST) ST.refresh(); });
window.addEventListener('load', () => { if (ST) ST.refresh(); if (!sceneOk) setTimeout(() => HX.ready(), 2500); });
