import { SIGN } from './sign-data.js';
import { buildNeon, Flicker, IGNITE, IGNITE_SOFT, SPUTTER, SPUTTER_SHORT, GLITCHES, PAL, el } from './sign.js';
import { brickAlbedo, floorTexture, puddleMask, hazeTexture, toURL, rng } from './textures.js';
import { openSign, POSTERS, arrow } from './art.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, ready() {}, on() {} };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const RM = !!HX.reducedMotion;
const MOBILE = () => innerWidth < 700;
root.classList.add('js');

const { gsap, ScrollTrigger, SplitText } = window;
if (gsap) gsap.registerPlugin(ScrollTrigger, SplitText);

/* ------------------------------------------------------------------ textures */
async function textures() {
  const brick = brickAlbedo({ w: 1024, h: 800, bw: 64, bh: 25, m: 3 });
  const [b, f, p, h, g] = await Promise.all([
    toURL(brick),
    toURL(floorTexture({ w: 1024, h: 256 })),
    toURL(puddleMask({ w: 1024, h: 256 })),
    toURL(hazeTexture({ w: 768, h: 384 })),
    toURL(grain(220)),
  ]);
  root.style.setProperty('--brick', `url(${b})`);
  root.style.setProperty('--floor-tex', `url(${f})`);
  root.style.setProperty('--puddles', `url(${p})`);
  root.style.setProperty('--haze', `url(${h})`);
  root.style.setProperty('--grain', `url(${g})`);
  // make sure the brick has decoded before we say we are ready
  await new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = b; });
}
function grain(size) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), img = g.createImageData(size, size), r = rng(91);
  for (let i = 0; i < img.data.length; i += 4) { const v = r() * 255 | 0; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0);
  return c;
}

/* ------------------------------------------------------------------ hero sign */
const hero = $('.hero');
const signHost = $('#sign');
const T = 15;
const sign = buildNeon(signHost, { vb: SIGN.vb, tubes: SIGN.tubes, T, label: 'Neon sign reading Velvet Ward, with a cocktail glass', clips: 260, quality: HX.lite ? 0.8 : 1 });
signHost.removeAttribute('aria-hidden');

// wall spill: the same tubes, heavily blurred, multiplied into the brick
const [vx, vy, vw, vh] = SIGN.vb;
const E = 0.55; // expansion around the sign
const wallVB = [vx - vw * E, vy - vh * E, vw * (1 + 2 * E), vh * (1 + 2 * E)];
const wallSvg = el('svg', { class: 'wall-glow', viewBox: wallVB.join(' '), 'aria-hidden': 'true', preserveAspectRatio: 'none' });
const wdefs = el('defs', {}, wallSvg);
const wf = (id, sd) => { const f = el('filter', { id, filterUnits: 'userSpaceOnUse', x: wallVB[0], y: wallVB[1], width: wallVB[2], height: wallVB[3], 'color-interpolation-filters': 'sRGB' }, wdefs); el('feGaussianBlur', { stdDeviation: sd }, f); };
wf('wl1', T * 3.2); wf('wl2', T * 10);
const WALL = {};
SIGN.tubes.forEach((t) => {
  const g = el('g', {}, wallSvg);
  const u1 = el('use', { stroke: PAL[t.c].glow, 'stroke-width': T * 7, filter: 'url(#wl2)', opacity: 0.9, fill: 'none', 'stroke-linecap': 'round' }, g);
  const u2 = el('use', { stroke: PAL[t.c].tube, 'stroke-width': T * 3, filter: 'url(#wl1)', opacity: 1, fill: 'none', 'stroke-linecap': 'round' }, g);
  u1.setAttribute('href', sign.href(t.id)); u2.setAttribute('href', sign.href(t.id));
  g.style.opacity = 0; WALL[t.id] = g;
});
$('.wall__light').appendChild(wallSvg);

// reflection on the wet floor: flipped, streaked vertically, rippled
const reflSvg = el('svg', { class: 'refl', viewBox: SIGN.vb.join(' '), 'aria-hidden': 'true', preserveAspectRatio: 'none' });
const rdefs = el('defs', {}, reflSvg);
const rf = el('filter', { id: 'rfx', filterUnits: 'userSpaceOnUse', x: vx - 200, y: vy - 300, width: vw + 400, height: vh + 600, 'color-interpolation-filters': 'sRGB' }, rdefs);
el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.0035 0.06', numOctaves: 2, seed: 4, result: 'n' }, rf);
el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: T * 2.2, xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' }, rf);
el('feGaussianBlur', { in: 'd', stdDeviation: `${T * 0.45} ${T * 2.2}` }, rf);
const REFL = {};
const reflG = el('g', { filter: 'url(#rfx)' }, reflSvg);
SIGN.tubes.forEach((t) => {
  const g = el('g', {}, reflG);
  const a = el('use', { stroke: PAL[t.c].glow, 'stroke-width': T * 2.2, opacity: 0.85, fill: 'none', 'stroke-linecap': 'round' }, g);
  const b = el('use', { stroke: PAL[t.c].core, 'stroke-width': T * 0.7, opacity: 0.8, fill: 'none', 'stroke-linecap': 'round' }, g);
  a.setAttribute('href', sign.href(t.id)); b.setAttribute('href', sign.href(t.id));
  g.style.opacity = 0; REFL[t.id] = g;
});
$('.floor__refl').appendChild(reflSvg);

// tube lengths weight the ambient wash
const LEN = {};
let LTOT = 0;
SIGN.tubes.forEach((t) => { const p = sign.svg.querySelector(sign.href(t.id)); LEN[t.id] = p && p.getTotalLength ? p.getTotalLength() : 100; LTOT += LEN[t.id]; });
let washRaf = 0;
const flick = new Flicker((id, v) => {
  sign.set(id, v);
  if (WALL[id]) WALL[id].style.opacity = v;
  if (REFL[id]) REFL[id].style.opacity = v;
  if (!washRaf) washRaf = requestAnimationFrame(() => {
    washRaf = 0;
    let s = 0; for (const k in LEN) s += (flick.get(k) || 0) * LEN[k];
    hero.style.setProperty('--wash', (s / LTOT).toFixed(3));
  });
});

function layoutHero() {
  const W = hero.clientWidth, H = hero.clientHeight;
  const aspect = vw / vh;
  const navH = MOBILE() ? 64 : 76;
  let sw, top, floorY;
  if (MOBILE()) {
    sw = Math.min(W * 0.98, 560);
    top = navH + 18 + Math.max(0, (H - 844) * 0.2);
    floorY = top + sw / aspect * 0.97;
  } else {
    sw = Math.min(W * 0.6, 900, H * 0.6 * aspect);
    top = Math.max(navH - 18, H * 0.075);
    floorY = top + sw / aspect * 0.985;
  }
  const sh = sw / aspect;
  const left = (W - sw) / 2;
  hero.style.setProperty('--sign-w', sw + 'px');
  hero.style.setProperty('--sign-top', top + 'px');
  hero.style.setProperty('--floor-y', floorY + 'px');
  hero.style.setProperty('--brick-size', Math.round(sw * 1.18) + 'px');
  const floorH = H - floorY;
  hero.style.setProperty('--rf', Math.min(48, (sh * 0.42) / floorH * 100).toFixed(1) + '%');
  hero.style.setProperty('--pm', Math.max(100, (floorH * 2.4) / W * 100).toFixed(0) + '% 100%');
  hero.style.setProperty('--hz-y', ((top + sh * 0.45) / H * 100).toFixed(1) + '%');
  // wall glow box
  Object.assign(wallSvg.style, { left: left - sw * E + 'px', top: top - sh * E + 'px', width: sw * (1 + 2 * E) + 'px', height: sh * (1 + 2 * E) + 'px' });
  // reflection: mirror around the floor line
  Object.assign(reflSvg.style, { left: left + 'px', top: floorY - (top + sh) + 'px', width: sw + 'px', height: sh + 'px', transform: 'scaleY(-1)' });
  // washes follow the sign
  const px = (ux, uy) => [((ux - vx) / vw * sw + left) / W * 100, ((uy - vy) / vh * sh + top) / floorY * 100];
  const [a1, b1] = px(560, 300), [a2, b2] = px(1100, 760), [a3, b3] = px(1500, 220);
  hero.style.setProperty('--wx1', a1 + '%'); hero.style.setProperty('--wy1', b1 + '%');
  hero.style.setProperty('--wx2', a2 + '%'); hero.style.setProperty('--wy2', b2 + '%');
  hero.style.setProperty('--wx3', a3 + '%'); hero.style.setProperty('--wy3', b3 + '%');
  // hardware: a power cable sagging from the end of the swash down to a junction box by the skirting
  const hw = $('.hardware');
  hw.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const sx = left + ((1634 - vx) / vw) * sw, sy = top + ((1026 - vy) / vh) * sh;
  const bx = Math.min(W - 26, sx + (MOBILE() ? 26 : 70)), by = floorY - (MOBILE() ? 52 : 74);
  const cab = $$('.cable', hw);
  cab[0].setAttribute('d', `M${sx} ${sy}C${sx + 4} ${sy + (by - sy) * 0.55} ${bx - 2} ${by - (by - sy) * 0.45} ${bx} ${by}`);
  cab[1].setAttribute('d', `M${bx} ${by + 44}L${bx} ${floorY + 2}`);
  $('.tbox', hw).setAttribute('transform', `translate(${bx} ${by}) scale(${MOBILE() ? 0.62 : 1})`);
}
layoutHero();
addEventListener('resize', () => { layoutHero(); }, { passive: true });

const ORDER = [
  ['V', 260, IGNITE], ['el', 470, IGNITE_SOFT], ['vet', 560, IGNITE], ['cross', 700, IGNITE_SOFT],
  ['W', 820, IGNITE], ['glass', 980, IGNITE], ['swash', 1120, IGNITE_SOFT], ['ard', 560, SPUTTER], ['cherry', 900, SPUTTER],
];
function ignite(scale = 1) {
  if (RM) { SIGN.tubes.forEach((t) => flick.now(t.id, 1)); return; }
  ORDER.forEach(([id, d, f]) => flick.play(id, f, d * scale));
}
function blackout() { SIGN.tubes.forEach((t) => flick.now(t.id, 0)); }

// occasional glitches while the hero is on screen
let heroVisible = true, lastHidden = 0, glitchTimer = 0;
function scheduleGlitch() {
  clearTimeout(glitchTimer);
  if (RM) return;
  glitchTimer = setTimeout(() => {
    if (heroVisible && !HX.paused) {
      const pool = ['ard', 'cherry', 'el', 'swash', 'vet', 'W', 'glass'];
      const id = pool[(Math.random() * pool.length) | 0];
      flick.play(id, GLITCHES[(Math.random() * GLITCHES.length) | 0]);
      if (Math.random() < 0.3) flick.play(pool[(Math.random() * pool.length) | 0], GLITCHES[1], 160);
    }
    scheduleGlitch();
  }, 3200 + Math.random() * 5200);
}
new IntersectionObserver(([e]) => {
  const was = heroVisible;
  heroVisible = e.isIntersecting;
  hero.classList.toggle('is-off', !heroVisible);
  if (!heroVisible) lastHidden = performance.now();
  else if (!was && performance.now() - lastHidden > 5000 && !RM) { blackout(); ignite(0.55); }
}, { threshold: 0.12 }).observe(hero);

/* ------------------------------------------------------------------ secondary neon */
function lightPiece(piece, order, opts = {}) {
  const f = new Flicker((id, v) => piece.set(id, v));
  piece.flick = f;
  piece.ignite = () => {
    if (RM) { piece.ids.forEach((id) => f.now(id, 1)); return; }
    const late = opts.late === undefined ? -1 : opts.late;
    order.forEach((id, i) => f.play(id, i === late ? SPUTTER_SHORT : (i % 2 ? IGNITE_SOFT : IGNITE), (opts.gap || 140) * i + Math.random() * 60));
  };
  return piece;
}
const openHost = $('#open-sign');
const OS = openSign();
const open = lightPiece(buildNeon(openHost, { ...OS, label: 'Neon sign: Open till 3 AM', clips: 0, quality: 0.8 }), ['frame', 'oO', 'oP', 'oE', 'oN', 'till'], { gap: 150, late: 3 });

const posters = $$('.poster').map((fig) => {
  const def = POSTERS[fig.dataset.poster]();
  const host = $('.poster__art', fig);
  host.style.setProperty('--spill', def.spill);
  const p = buildNeon(host, { ...def, label: '', clips: 0, quality: 0.7, halo: HX.lite ? 0.6 : 0.9 });
  const piece = lightPiece(p, p.ids, { gap: 110, late: p.ids.length > 3 ? 1 : -1 });
  const f0 = piece.flick.apply;
  piece.flick.apply = (id, v) => { f0(id, v); host.style.setProperty('--on', Math.max(...p.ids.map((k) => piece.flick.get(k) || 0))); };
  piece.fig = fig;
  return piece;
});

const arrows = $$('.neon-arrow').map((host) => {
  const def = arrow(host.dataset.dir, host.dataset.c);
  const p = buildNeon(host, { vb: def.vb, tubes: def.tubes, T: def.T, label: '', quality: 0.7, glass: true });
  const g = el('g', { class: 'chevs' }, p.svg);
  def.chev.forEach((d) => {
    const c = el('g', { class: 'chev' }, g);
    el('path', { d, stroke: PAL[host.dataset.c].glow, 'stroke-width': def.T * 1.6, opacity: 0.55, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: `url(#${p.uid}G)` }, c);
    el('path', { d, stroke: PAL[host.dataset.c].core, 'stroke-width': def.T * 0.6, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, c);
  });
  const piece = lightPiece(p, p.ids);
  piece.host = host;
  return piece;
});

/* ------------------------------------------------------------------ lineup: tonight */
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
(function tonight() {
  const today = new Date().getDay();
  const nights = $$('.night');
  let pick = nights.find((n) => +n.dataset.day === today);
  let label = 'Tonight';
  if (!pick) { pick = nights.find((n) => +n.dataset.day === (today + 1) % 7) || nights[0]; label = 'Tomorrow'; }
  pick.classList.add('is-tonight');
  $('.night__badge', pick).textContent = label;
  $('[data-tonight-act]').textContent = $('h3', pick).textContent;
  $('[data-tonight-genre]').textContent = $('.night__genre', pick).textContent;
  $('.hero__tonight-label').textContent = label;
  // date chips in the form
  const chips = $$('[data-dates] .chip');
  const now = new Date();
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let best = null, bestDelta = 9;
  chips.forEach((c) => {
    const inp = $('input', c), span = $('span', c);
    const delta = (map[inp.value] - now.getDay() + 7) % 7;
    const d = new Date(now); d.setDate(now.getDate() + delta);
    span.innerHTML = `${inp.value}<small>${delta === 0 ? 'Tonight' : d.getDate() + ' ' + mon[d.getMonth()]}</small>`;
    c.style.order = delta;
    if (delta < bestDelta) { bestDelta = delta; best = inp; }
  });
  if (best) best.checked = true;
})();
$$('[data-guest]').forEach((b) => b.addEventListener('click', () => {
  const on = b.classList.toggle('is-on');
  b.textContent = on ? 'On the list ✓' : 'Guest list';
}));

/* ------------------------------------------------------------------ nav + menu */
const nav = $('#nav');
const menu = $('#menu');
const menuBtn = $('.nav__menu');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', open);
  menu.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (lenis) open ? lenis.stop() : lenis.start();
}
menuBtn.addEventListener('click', () => setMenu(menu.hidden));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
let lastY = -1;
function onScroll() {
  const y = scrollY;
  if ((y > 40) !== (lastY > 40)) nav.classList.toggle('is-solid', y > 40);
  lastY = y;
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ------------------------------------------------------------------ smooth scroll */
let lenis = null;
if (!HX.embed && !RM && window.Lenis && matchMedia('(pointer: fine)').matches) {
  lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  if (gsap) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href');
  const t = id.length > 1 ? $(id) : null;
  if (!t && id !== '#top') return;
  e.preventDefault();
  if (!menu.hidden) setMenu(false);
  const target = id === '#top' ? 0 : t;
  if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -60, duration: 1.4 });
  else if (target === 0) scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
  else scrollTo({ top: t.getBoundingClientRect().top + scrollY - 60, behavior: RM ? 'auto' : 'smooth' });
}));

/* ------------------------------------------------------------------ magnetic buttons */
if (!HX.embed && matchMedia('(hover: hover) and (pointer: fine)').matches && gsap) {
  $$('.magnetic').forEach((b) => {
    const xTo = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35); });
    b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ------------------------------------------------------------------ form */
(function form() {
  const f = $('.rform');
  const out = $('output[name="size"]', f);
  let size = 4;
  $$('[data-step]', f).forEach((b) => b.addEventListener('click', () => { size = Math.min(12, Math.max(1, size + +b.dataset.step)); out.textContent = size; }));
  const err = $('.rform__err', f), ok = $('.rform__ok', f);
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = f.name.value.trim(), phone = f.phone.value.replace(/[^0-9]/g, '');
    f.name.classList.toggle('is-bad', !name); f.phone.classList.toggle('is-bad', phone.length < 8);
    if (!name || phone.length < 8) { err.hidden = false; return; }
    err.hidden = true;
    const night = f.querySelector('input[name="night"]:checked');
    const nightLabel = night ? DAYS[{ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[night.value]] : 'Wednesday';
    const time = (f.querySelector('input[name="time"]:checked') || {}).value || '10 PM';
    const seat = (f.querySelector('input[name="seat"]:checked') || {}).value || 'Booth';
    $('[data-ok-text]', f).textContent = `${name.split(' ')[0]}, your ${seat.toLowerCase()} for ${size} is held for ${nightLabel} at ${time}. We’ll confirm on WhatsApp within fifteen minutes.`;
    ok.hidden = false;
    if (gsap) gsap.from(ok, { opacity: 0, scale: 0.97, duration: 0.6, ease: 'power3.out' });
  });
  $('[data-reset]', f).addEventListener('click', () => { ok.hidden = true; f.reset(); size = 4; out.textContent = 4; });
})();

/* ------------------------------------------------------------------ scroll choreography */
function reveals() {
  if (!gsap || RM) {
    open.ignite(); posters.forEach((p) => p.ignite()); arrows.forEach((a) => { a.ignite(); a.host.classList.add('is-lit'); });
    $$('.drink').forEach((d) => d.classList.add('is-lit'));
    $('.lineup').classList.add('is-lit');
    return;
  }
  // headings: line by line
  $$('.split').forEach((h) => {
    const st = SplitText.create(h, { type: 'lines', linesClass: 'split-line' });
    gsap.from(st.lines, { yPercent: 60, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });
  const fadeUp = (targets, trigger, extra = {}) => gsap.from(targets, { y: 28, opacity: 0, duration: 0.85, ease: 'power3.out', stagger: 0.08, ...extra, scrollTrigger: { trigger, start: 'top 86%', once: true } });
  $$('.sec-head').forEach((s) => fadeUp($$('.kicker, .lede', s), s));
  ScrollTrigger.batch('.night, .drink, .pkg, .poster, .facts li, .ticks li, .hours div', {
    start: 'top 92%', once: true,
    onEnter: (els) => gsap.from(els, { y: 36, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07, clearProps: 'opacity' }),
  });
  fadeUp('.rform', '.rform', { y: 40 });
  fadeUp('.visit__map', '.visit__map', { y: 40 });
  fadeUp('.footer__top > *, .footer__cols > div', '.footer', { stagger: 0.06 });

  // neon pieces light when they arrive
  ScrollTrigger.create({ trigger: '.lineup__head', start: 'top 70%', once: true, onEnter: () => { open.ignite(); $('.lineup').classList.add('is-lit'); } });
  posters.forEach((p) => ScrollTrigger.create({ trigger: p.fig, start: 'top 85%', once: true, onEnter: () => setTimeout(p.ignite, Math.random() * 250) }));
  arrows.forEach((a) => ScrollTrigger.create({ trigger: a.host, start: 'top 88%', once: true, onEnter: () => { a.ignite(); setTimeout(() => a.host.classList.add('is-lit'), 500); } }));
  ScrollTrigger.batch('.drink', {
    start: 'top 88%', once: true,
    onEnter: (els) => els.forEach((d, i) => {
      const tl = gsap.timeline({ delay: 0.15 + i * 0.12 });
      tl.call(() => d.classList.add('is-lit')).call(() => d.classList.remove('is-lit'), null, 0.05)
        .call(() => d.classList.add('is-lit'), null, 0.12).call(() => d.classList.remove('is-lit'), null, 0.2).call(() => d.classList.add('is-lit'), null, 0.34);
    }),
  });
  // map route
  const route = $('.map__route');
  ScrollTrigger.create({ trigger: '.visit__map', start: 'top 75%', once: true, onEnter: () => {
    const len = route.getTotalLength();
    route.classList.add('is-drawn');
    gsap.fromTo(route, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' });
    gsap.from('.map__tag', { scale: 0.6, opacity: 0, transformOrigin: '50% 50%', duration: 0.6, delay: 1.2, ease: 'back.out(2)' });
  } });
  // hero: gentle parallax on the way out
  gsap.to('.hero__copy, .hero__tonight, .hero__scroll', { y: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 30%', scrub: true } });
  gsap.to(signHost, { y: 70, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
}

// pause decorative loops when off screen
const pauseIO = new IntersectionObserver((ents) => ents.forEach((e) => e.target.classList.toggle('is-paused', !e.isIntersecting)));
$$('.neon-arrow, .ticker').forEach((n) => pauseIO.observe(n));
HX.on('pause', () => clearTimeout(glitchTimer));
HX.on('play', () => scheduleGlitch());

/* ------------------------------------------------------------------ boot */
(async function boot() {
  const fontsReady = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();
  await Promise.all([textures(), Promise.race([fontsReady, new Promise((r) => setTimeout(r, 2200))])]);
  root.classList.add('is-ready');
  reveals();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    HX.ready();
    ignite(1);
    scheduleGlitch();
    if (ScrollTrigger) ScrollTrigger.refresh();
  }));
})();
