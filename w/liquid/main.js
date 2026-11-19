import { Liquid } from './liquid.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, ready() {}, on() {} };
const { gsap, ScrollTrigger, SplitText } = window;
const root = document.documentElement;
root.classList.add('js');
gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const mix3 = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduce = !!HX.reducedMotion;
const isPhone = () => window.innerWidth <= 900;
const lite = !!HX.lite || (HX.device === 'mobile' && HX.embed);

/* ---------------- smooth scroll (real visitors on desktop only) ---------------- */
let lenis = null;
if (!HX.embed && canHover && !reduce && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.095, smoothWheel: true, wheelMultiplier: 0.95 });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href');
  const el = id.length > 1 ? $(id) : null;
  if (!el && id !== '#top') return;
  e.preventDefault();
  closeMenu();
  const target = id === '#top' ? 0 : el;
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
  else window.scrollTo({ top: target === 0 ? 0 : el.getBoundingClientRect().top + scrollY, behavior: reduce ? 'auto' : 'smooth' });
}));

/* ---------------- nav + menu ---------------- */
const nav = $('#nav');
const menuBtn = $('.menu-btn');
const overlay = $('#overlay');
function closeMenu() {
  if (!root.classList.contains('menu-open')) return;
  root.classList.remove('menu-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  overlay.setAttribute('aria-hidden', 'true');
  if (lenis) lenis.start();
}
menuBtn.addEventListener('click', () => {
  const open = !root.classList.contains('menu-open');
  root.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  overlay.setAttribute('aria-hidden', String(!open));
  if (open) {
    if (lenis) lenis.stop();
    gsap.fromTo($$('.overlay__links a'), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: 'expo.out' });
  } else if (lenis) lenis.start();
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

/* ---------------- bag (demo state) ---------------- */
const PRICES = { 'Saffron Noir': 185, 'Oud Lumière': 185, 'Néroli Bleu': 185, 'Discovery set': 38 };
let bagCount = 0, bagTotal = 0;
const bagNote = $('[data-bag-note]');
$$('[data-add]').forEach((btn) => btn.addEventListener('click', () => {
  const name = btn.dataset.add;
  bagCount += 1; bagTotal += PRICES[name] || 0;
  $$('[data-bag]').forEach((el) => {
    el.textContent = bagCount; el.classList.add('has');
    gsap.fromTo(el, { scale: 1.6 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, .45)' });
  });
  $('.bag').setAttribute('aria-label', `Bag, ${bagCount} item${bagCount > 1 ? 's' : ''}`);
  const label = btn.querySelector('span');
  btn.classList.add('is-added'); label.textContent = 'Added to bag';
  clearTimeout(btn._t);
  btn._t = setTimeout(() => { btn.classList.remove('is-added'); label.textContent = 'Add to bag'; }, 2600);
  if (bagNote) {
    const left = 150 - bagTotal;
    bagNote.textContent = left > 0
      ? `${name} is in your bag. Add $${left} more for free shipping.`
      : `${name} is in your bag. Bag total $${bagTotal}, and shipping is on us.`;
  }
}));

/* ---------------- newsletter ---------------- */
const form = $('.signup');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = form.querySelector('input');
  const msg = form.querySelector('.signup__msg');
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
  if (!ok) { msg.textContent = 'Please enter a full email address, for example name@domain.com.'; input.focus(); return; }
  form.classList.add('is-done');
  msg.textContent = 'Merci. Your first letter arrives on the first Sunday of December.';
  gsap.from(msg, { y: 16, opacity: 0, duration: 1, ease: 'expo.out' });
});

/* ---------------- liquid sculpture ---------------- */
const canvas = $('#liquid');
const liquid = new Liquid(canvas, { lite, scale: lite ? 0.42 : 0.5 });
if (!liquid.ok) root.classList.add('no-webgl');

const LOOK = {
  hero: { f0: [1.0, 0.77, 0.42], glow: [0.80, 0.50, 0.18], spread: 1.0, speed: 1.0 },
  scents: [
    { f0: [1.0, 0.60, 0.22], glow: [0.86, 0.33, 0.07], spread: 0.96, speed: 1.0 },
    { f0: [0.97, 0.63, 0.56], glow: [0.66, 0.22, 0.22], spread: 0.84, speed: 0.72 },
    { f0: [0.66, 0.80, 1.0], glow: [0.20, 0.38, 0.82], spread: 1.05, speed: 1.3 },
  ],
  letter: { f0: [1.0, 0.77, 0.42], glow: [0.80, 0.50, 0.18], spread: 1.0, speed: 1.0 },
};
const PIN = 2.8; // pinned scroll length of the scents sequence, in viewport heights
const owners = [
  { key: 'hero', el: $('.hero') },
  { key: 'scents', el: $('.scents') },
  { key: 'letter', el: $('.letter') },
];
function layout(key) {
  const a = innerWidth / innerHeight;
  if (isPhone()) {
    const z = clamp(a * 1.06, 0.36, 0.9);
    if (key === 'hero') return { fx: 0, fy: 0.24, zoom: z * 0.9 };
    if (key === 'scents') return { fx: 0, fy: 0.265, zoom: z * 0.8 };
    return { fx: 0, fy: 0.2, zoom: z * 0.92 };
  }
  if (key === 'hero') return { fx: 0.215, fy: 0.0, zoom: 0.92 };
  if (key === 'scents') return { fx: 0.205, fy: -0.01, zoom: 0.86 };
  return { fx: -0.215, fy: 0.0, zoom: 0.95 };
}
// scents pin progress -> continuous scent index 0..2 (holds on each panel)
let scentP = 0;
function scentIndex(p) {
  if (p < 0.1) return 0;
  if (p < 0.45) return smooth((p - 0.1) / 0.35);
  if (p < 0.55) return 1;
  if (p < 0.9) return 1 + smooth((p - 0.55) / 0.35);
  return 2;
}
function scentLook(p) {
  const f = scentIndex(p);
  const i = Math.min(1, Math.floor(f));
  const t = f - i;
  const A = LOOK.scents[i], B = LOOK.scents[i + 1];
  return { f0: mix3(A.f0, B.f0, t), glow: mix3(A.glow, B.glow, t), spread: mix(A.spread, B.spread, t), speed: mix(A.speed, B.speed, t) };
}

const st = {
  time: 0, intro: 0, spread: 1, speed: 1, gather: 0, presence: 1, topY: 1.5, bottomY: -1.5, lean: 0,
  f0: LOOK.hero.f0.slice(), glow: LOOK.hero.glow.slice(), offX: 0.3, offY: 0, zoom: 0.92, lightX: 0, lightY: 0, wob: 0.012,
};
const tgt = { offX: 0.3, offY: 0, zoom: 0.92, presence: 1, gather: 0, spread: 1, speed: 1, f0: st.f0.slice(), glow: st.glow.slice(), letterTop: 0, letterBottom: 0 };

function computeTarget() {
  const vh = innerHeight, a = innerWidth / vh;
  let wsum = 0, ox = 0, oy = 0, zm = 0, ga = 0, sp = 0, spd = 0;
  const f0 = [0, 0, 0], gl = [0, 0, 0];
  for (const o of owners) {
    const r = o.el.getBoundingClientRect();
    const vis = clamp((Math.min(r.bottom, vh) - Math.max(r.top, 0)) / Math.min(r.height, vh), 0, 1);
    o.vis = vis;
    if (o.key === 'letter') { tgt.letterTop = r.top; tgt.letterH = r.height; tgt.letterBottom = Math.min(r.bottom, r.top + vh * 1.05); }
    if (vis <= 0) continue;
    const L = layout(o.key);
    const anchor = clamp(vh / 2, r.top + vh / 2, r.bottom - vh / 2) - L.fy * vh;
    const look = o.key === 'scents' ? scentLook(scentP) : LOOK[o.key];
    const g = o.key === 'letter' ? smooth((vh - r.top) / (vh * 0.86)) : 0;
    wsum += vis;
    ox += vis * L.fx * a; oy += vis * (0.5 - anchor / vh); zm += vis * L.zoom; ga += vis * g;
    sp += vis * look.spread; spd += vis * look.speed;
    for (let j = 0; j < 3; j++) { f0[j] += vis * look.f0[j]; gl[j] += vis * look.glow[j]; }
  }
  tgt.presence = smooth(wsum / 0.62);
  if (wsum > 0) {
    tgt.offX = ox / wsum; tgt.offY = oy / wsum; tgt.zoom = zm / wsum; tgt.gather = ga / wsum;
    tgt.spread = sp / wsum; tgt.speed = spd / wsum;
    for (let j = 0; j < 3; j++) { tgt.f0[j] = f0[j] / wsum; tgt.glow[j] = gl[j] / wsum; }
  }
}

let ptrX = 0.5, ptrY = 0.5;
if (canHover && !HX.embed) addEventListener('pointermove', (e) => { ptrX = e.clientX / innerWidth; ptrY = e.clientY / innerHeight; }, { passive: true });

let lastT = performance.now(), lastScroll = scrollY, vel = 0, drawnEmpty = false, frames = 0, readySent = false;
let introStart = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const rawDt = (now - lastT) / 1000;
  const dt = clamp(rawDt, 0.001, 0.05);
  lastT = now;
  computeTarget();
  const k = 1 - Math.exp(-dt * 9), kc = 1 - Math.exp(-dt * 4);
  const firstFrame = frames === 0;
  const kk = firstFrame ? 1 : k, kkc = firstFrame ? 1 : kc;
  st.offX = mix(st.offX, tgt.offX, kk); st.offY = mix(st.offY, tgt.offY, kk); st.zoom = mix(st.zoom, tgt.zoom, kk);
  st.presence = mix(st.presence, tgt.presence, firstFrame ? 1 : 1 - Math.exp(-dt * 7));
  st.gather = mix(st.gather, tgt.gather, firstFrame ? 1 : 1 - Math.exp(-dt * 5));
  st.spread = mix(st.spread, tgt.spread, kkc); st.speed = mix(st.speed, tgt.speed, kkc);
  for (let j = 0; j < 3; j++) { st.f0[j] = mix(st.f0[j], tgt.f0[j], kkc); st.glow[j] = mix(st.glow[j], tgt.glow[j], kkc); }
  // scroll speed makes the surface ripple
  const sy = scrollY;
  vel = mix(vel, Math.abs(sy - lastScroll) / Math.max(rawDt, 0.008), 0.2);
  lastScroll = sy;
  st.wob = mix(st.wob, 0.011 + Math.min(0.022, vel * 0.000011), 0.15);
  if (!reduce) st.time += dt * st.speed;
  if (!introStart) introStart = now;
  st.intro = reduce ? 1 : 1 - Math.pow(1 - clamp((now - introStart) / 2600, 0, 1), 3);
  const t = now / 1000;
  st.lightX = mix(st.lightX, (ptrX - 0.5) * 0.9 + 0.22 * Math.sin(t * 0.17), 0.06);
  st.lightY = mix(st.lightY, (ptrY - 0.5) * 0.35 + 0.07 * Math.sin(t * 0.23 + 1.0), 0.06);
  st.lean = mix(st.lean, (ptrX - 0.5) * 0.14, 0.05);
  // drip anchors in world units (relative to the sculpture centre)
  const vh = innerHeight, W = 6 / 2.2;
  st.topY = ((0.5 - tgt.letterTop / vh) - st.offY) / st.zoom * W;
  st.bottomY = ((0.5 - tgt.letterBottom / vh) - st.offY) / st.zoom * W;
  const floorPx = tgt.letterTop + floorFrac() * Math.min(tgt.letterH || vh, vh);
  st.floorY = ((0.5 - floorPx / vh) - st.offY) / st.zoom * W;
  if (!liquid.ok) return;
  liquid.update(st);
  rippleCheck();
  if (st.presence > 0.004) { liquid.render(st); drawnEmpty = false; }
  else if (!drawnEmpty) { liquid.render({ ...st, presence: 0 }); drawnEmpty = true; }
  frames++;
  if (!readySent && frames >= 2) { readySent = true; fontsReady.then(() => HX.ready()); }
}

// drops landing on the pool line set off ripples in the DOM, in sync with the shader
const pool = $('.pool');
const floorFrac = () => (isPhone() ? 0.4 : 0.84);
let lastLand = null;
function placePool() {
  const h = Math.min($('.letter').offsetHeight, innerHeight);
  pool.style.setProperty('--floor', Math.round(floorFrac() * h) + 'px');
}
function rippleCheck() {
  if (liquid.landCycle === undefined) return;
  if (lastLand === null) { lastLand = liquid.landCycle; return; }
  if (liquid.landCycle !== lastLand) {
    lastLand = liquid.landCycle;
    if (st.gather > 0.85 && st.presence > 0.5) {
      const a = innerWidth / innerHeight;
      pool.style.setProperty('--px', ((0.5 + st.offX / a) * 100).toFixed(2) + '%');
      pool.classList.remove('is-ripple'); void pool.offsetWidth; pool.classList.add('is-ripple');
    }
  }
}
placePool();

let resizeT;
addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (liquid.ok) liquid.resize(); placePool(); }, 120); });

/* ---------------- text + reveals ---------------- */
const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

function splitLines(el) {
  try {
    return SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' }).lines;
  } catch (e) { return [el]; }
}

function intro() {
  const title = $('.hero__title');
  gsap.set(['.hero__inner', '.hero__meta'], { visibility: 'visible' });
  const lines = splitLines(title);
  const tl = gsap.timeline({ delay: HX.embed ? 0.15 : 0.35 });
  tl.from(lines, { yPercent: 115, duration: 1.5, ease: 'expo.out', stagger: 0.12 })
    .from('.hero__eyebrow', { opacity: 0, y: 14, duration: 1, ease: 'expo.out' }, 0.1)
    .from('.hero__sub', { opacity: 0, y: 18, duration: 1.2, ease: 'expo.out' }, 0.45)
    .from('.hero__ctas .btn', { opacity: 0, y: 18, duration: 1.2, ease: 'expo.out', stagger: 0.08 }, 0.55)
    .from('.hero__meta p', { opacity: 0, duration: 1.2, stagger: 0.1 }, 0.8)
    .from('.nav', { opacity: 0, y: -12, duration: 1.2, ease: 'expo.out' }, 0.2);
}

function reveals() {
  $$('.split').forEach((el) => {
    const lines = splitLines(el);
    el.style.visibility = 'visible';
    gsap.from(lines, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  $$('.reveal').forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
  $$('.num').forEach((el) => {
    const end = +el.dataset.count;
    const o = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.3, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); } }),
    });
  });
  // the discovery box lid lifts a little as you scroll past
  gsap.fromTo('.kit__lid', { y: 24 }, { y: -18, ease: 'none', scrollTrigger: { trigger: '.discovery', start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* ---------------- scents: pinned sequence ---------------- */
function scentsPin() {
  const section = $('.scents');
  const track = $('.scents__track');
  const panels = $$('.scent');
  const bodies = panels.map((p) => p.querySelector('.scent__body'));
  const steps = $$('.scents__steps li');
  let lastIdx = -1;
  const onUpdate = (self) => {
    scentP = self.progress;
    const idx = Math.round(scentIndex(self.progress));
    if (idx !== lastIdx) {
      lastIdx = idx;
      steps.forEach((s, i) => s.classList.toggle('is-on', i <= idx));
      drawPyramid(panels[idx]);
    }
  };
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + Math.round(innerHeight * PIN), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1, onUpdate },
    });
    tl.to(track, { xPercent: -100 / 3, duration: 0.35 }, 0.1)
      .fromTo(bodies[1], { x: 160, opacity: 0.2 }, { x: 0, opacity: 1, duration: 0.35 }, 0.1)
      .to(bodies[0], { x: -120, opacity: 0, duration: 0.3 }, 0.1)
      .to(track, { xPercent: -200 / 3, duration: 0.35 }, 0.55)
      .fromTo(bodies[2], { x: 160, opacity: 0.2 }, { x: 0, opacity: 1, duration: 0.35 }, 0.55)
      .to(bodies[1], { x: -120, opacity: 0, duration: 0.3 }, 0.55)
      .set({}, {}, 1);
    return () => gsap.set([track, ...bodies], { clearProps: 'all' });
  });
  mm.add('(max-width: 900px)', () => {
    gsap.set(panels.slice(1), { autoAlpha: 0, y: 40 });
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + Math.round(innerHeight * PIN), pin: true, scrub: 0.5, invalidateOnRefresh: true, onUpdate },
    });
    tl.to(panels[0], { autoAlpha: 0, y: -40, duration: 0.12 }, 0.19)
      .to(panels[1], { autoAlpha: 1, y: 0, duration: 0.14 }, 0.29)
      .to(panels[1], { autoAlpha: 0, y: -40, duration: 0.12 }, 0.64)
      .to(panels[2], { autoAlpha: 1, y: 0, duration: 0.14 }, 0.74)
      .set({}, {}, 1);
    return () => gsap.set(panels, { clearProps: 'all' });
  });
}
const drawn = new WeakSet();
function drawPyramid(panel) {
  if (!panel || drawn.has(panel)) return;
  drawn.add(panel);
  const svg = panel.querySelector('.pyramid__svg');
  gsap.fromTo(svg.querySelectorAll('.pyr-t, .pyr-h, .pyr-b'), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.9, stagger: { each: 0.12, from: 'end' }, ease: 'expo.out' });
  gsap.fromTo(panel.querySelectorAll('.pyramid__list > div'), { opacity: 0, x: 14 }, { opacity: 1, x: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out' });
}

/* ---------------- ingredients carousel ---------------- */
function ingredientRing() {
  const stage = $('.stage');
  const ring = $('.ring');
  const cards = $$('.ing', ring);
  let ang = 0, boost = 0, live = false, lastY = scrollY;
  const paths = $$('.ing svg path').filter((p) => !p.hasAttribute('stroke-dasharray'));
  paths.forEach((p) => { p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1'; p.style.strokeDashoffset = reduce ? '0' : '1'; });
  ScrollTrigger.create({
    trigger: stage, start: 'top 85%', once: true,
    onEnter: () => gsap.to(paths, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: { amount: 0.6 } }),
  });
  const tick = (time, delta) => {
    if (!live) return;
    const dt = Math.min(0.05, delta / 1000);
    const y = scrollY;
    boost = mix(boost, (y - lastY) * 0.9, 0.08);
    lastY = y;
    ang -= (reduce ? 0 : 7 * dt) + boost * dt * 4;
    ring.style.transform = `rotateX(-3deg) rotateY(${ang.toFixed(3)}deg)`;
    for (let i = 0; i < cards.length; i++) {
      const a = ((i * 45 + ang) % 360 + 360) % 360;
      const f = Math.cos(a * Math.PI / 180);
      cards[i].style.opacity = (0.12 + 0.88 * smooth((f + 0.35) / 1.35)).toFixed(3);
    }
  };
  gsap.ticker.add(tick);
  new IntersectionObserver((es) => { live = es[0].isIntersecting; }, { rootMargin: '120px 0px' }).observe(stage);
  live = true; tick(0, 16); live = false;
}

/* ---------------- magnetic buttons ---------------- */
function magnetic() {
  if (!canHover || HX.embed) return;
  $$('.magnetic').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------------- nav state ---------------- */
function navState() {
  let on = false;
  const check = () => { const v = scrollY > 40; if (v !== on) { on = v; nav.classList.toggle('is-scrolled', v); } };
  addEventListener('scroll', check, { passive: true });
  if (lenis) lenis.on('scroll', check);
  check();
}

/* ---------------- boot ---------------- */
scentsPin();
navState();
magnetic();
ingredientRing();
requestAnimationFrame(loop);
fontsReady.then(() => {
  if (reduce) { gsap.set(['.hero__inner', '.hero__meta'], { visibility: 'visible' }); $$('.split').forEach((el) => { el.style.visibility = 'visible'; }); $$('.reveal').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; }); }
  else { intro(); reveals(); }
  ScrollTrigger.refresh();
});
setTimeout(() => {
  gsap.set(['.hero__inner', '.hero__meta'], { visibility: 'visible' });
  if (!readySent) { readySent = true; HX.ready(); }
}, 3500);
