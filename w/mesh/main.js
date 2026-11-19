import { Gradient } from './gradient.js';

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
const sine = (t) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t, 0, 1));
const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduce = !!HX.reducedMotion;
const lite = !!HX.lite || (HX.device === 'mobile' && HX.embed);
const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

/* ---------- smooth scroll for real desktop visitors ---------- */
let lenis = null;
if (!HX.embed && canHover && !reduce && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href');
  const el = id.length > 1 ? $(id) : null;
  if (!el) return;
  e.preventDefault();
  closeMenu();
  if (lenis) lenis.scrollTo(el, { duration: 1.6 });
  else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: reduce ? 'auto' : 'smooth' });
}));

/* ---------- menu ---------- */
const menuBtn = $('.menu-btn'), overlay = $('#overlay');
function closeMenu() {
  if (!root.classList.contains('menu-open')) return;
  root.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); overlay.setAttribute('aria-hidden', 'true');
  if (lenis) lenis.start();
}
menuBtn.addEventListener('click', () => {
  const open = !root.classList.contains('menu-open');
  root.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  overlay.setAttribute('aria-hidden', String(!open));
  if (open) gsap.fromTo($$('.overlay nav a, .overlay .btn'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'expo.out' });
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

/* ---------- palettes: dawn, day, dusk, night ---------- */
const hex = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const PALETTES = [
  ['#ffb199', '#ffd6a5', '#fff0de', '#f6a6b2', '#cdb9f2'],
  ['#69c6d9', '#b8e0d2', '#eaf6f2', '#93d3e6', '#f3ead0'],
  ['#b8a1ff', '#ff9fb2', '#ffc6a6', '#8f7df0', '#f4c8e8'],
  ['#1b1a3a', '#3b3a75', '#12112b', '#4c3f92', '#26245a'],
].map((p) => p.map(hex));
function paletteAt(t) {
  t = clamp(t, 0, 3);
  const i = Math.min(2, Math.floor(t));
  const f = smooth(t - i);
  return PALETTES[i].map((c, k) => [mix(c[0], PALETTES[i + 1][k][0], f), mix(c[1], PALETTES[i + 1][k][1], f), mix(c[2], PALETTES[i + 1][k][2], f)]);
}
// time of day follows the section in the middle of the screen
let anchors = [];
function buildAnchors() {
  anchors = $$('[data-tod]').map((el) => {
    const r = el.getBoundingClientRect();
    return { y: r.top + scrollY + Math.min(r.height, innerHeight) * 0.5, t: parseFloat(el.dataset.tod) };
  }).sort((a, b) => a.y - b.y);
}
function todAt(y) {
  if (!anchors.length) return 0;
  if (y <= anchors[0].y) return anchors[0].t;
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i], b = anchors[i + 1];
    if (y <= b.y) return mix(a.t, b.t, sine((y - a.y) / Math.max(1, b.y - a.y)));
  }
  return anchors[anchors.length - 1].t;
}

/* ---------- breath engine ---------- */
class Breath {
  constructor(pattern) { this.set(pattern); }
  set(pattern) { this.p = pattern; this.t = 0; this.cycle = 0; }
  get total() { return this.p.reduce((a, b) => a + b, 0); }
  update(dt) {
    this.t += dt;
    const T = this.total;
    if (this.t >= T) { this.t -= T; this.cycle++; }
    let acc = 0;
    for (let i = 0; i < 4; i++) {
      const d = this.p[i];
      if (d > 0 && this.t < acc + d) { this.phase = i; this.k = (this.t - acc) / d; this.left = acc + d - this.t; return; }
      acc += d;
    }
    this.phase = 0; this.k = 0; this.left = this.p[0];
  }
  // 0 = empty lungs, 1 = full lungs
  get fill() {
    if (this.phase === 0) return sine(this.k);
    if (this.phase === 1) return 1;
    if (this.phase === 2) return 1 - sine(this.k);
    return 0;
  }
  get glow() { return this.phase === 1 ? 0.85 + 0.15 * Math.sin(this.t * 5) : this.fill; }
}
const WORDS = ['Breathe in', 'Hold', 'Breathe out', 'Rest'];

const heroBreath = new Breath([4, 7, 8, 0]);
const practice = new Breath([4, 7, 8, 0]);
let practiceOn = true, practiceVisible = false, practiceRounds = 4;
const orbHero = $('#orbHero'), orbPractice = $('#orbPractice');
const heroWord = $('[data-hero-word]'), segs = $$('[data-seg]');
const pWord = $('[data-word]'), pCount = $('[data-count]'), pRound = $('[data-round]'), ring = $('.ring-fg');
let lastHeroPhase = -1, lastPPhase = -1, lastCount = -1, lastRound = -1;

function swapText(el, txt) {
  if (el.textContent === txt) return;
  if (reduce) { el.textContent = txt; return; }
  gsap.to(el, { opacity: 0, y: -6, duration: 0.25, ease: 'power2.in', onComplete: () => { el.textContent = txt; gsap.fromTo(el, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }); } });
}
function stepBreath(dt) {
  heroBreath.update(dt);
  const hs = mix(0.925, 1.0, heroBreath.fill);
  orbHero.style.transform = `scale(${hs.toFixed(4)})`;
  if (heroBreath.phase !== lastHeroPhase) { lastHeroPhase = heroBreath.phase; swapText(heroWord, WORDS[heroBreath.phase]); }
  for (let i = 0; i < 3; i++) {
    const v = i < heroBreath.phase ? 1 : i === heroBreath.phase ? heroBreath.k : 0;
    segs[i].style.transform = `scaleX(${v.toFixed(3)})`;
  }
  if (practiceOn && practiceVisible) practice.update(dt);
  if (practice.phase === undefined) practice.update(0);
  const ps = mix(0.6, 1.0, practice.fill);
  orbPractice.style.transform = `scale(${ps.toFixed(4)})`;
  ring.style.strokeDashoffset = (1 - practice.k).toFixed(4);
  if (practice.phase !== lastPPhase) { lastPPhase = practice.phase; swapText(pWord, WORDS[practice.phase]); }
  const c = Math.max(1, Math.ceil(practice.left - 1e-3));
  if (c !== lastCount) { lastCount = c; pCount.textContent = c; }
  const round = (practice.cycle % practiceRounds) + 1;
  if (round !== lastRound) { lastRound = round; pRound.textContent = `Round ${round} of ${practiceRounds}`; }
}
// pattern chips
$$('.chip').forEach((chip) => chip.addEventListener('click', () => {
  $$('.chip').forEach((c) => { c.classList.toggle('is-on', c === chip); c.setAttribute('aria-checked', String(c === chip)); });
  practice.set(chip.dataset.pattern.split(',').map(Number));
  practice.update(0); lastPPhase = -1; lastRound = -1;
  practiceOn = true; $('[data-toggle-label]').textContent = 'Pause';
}));
$('[data-toggle]').addEventListener('click', () => {
  practiceOn = !practiceOn;
  $('[data-toggle-label]').textContent = practiceOn ? 'Pause' : 'Resume';
});
new IntersectionObserver((es) => { practiceVisible = es[0].isIntersecting; }, { threshold: 0.25 }).observe($('.practice'));

/* ---------- gradient ---------- */
const canvas = $('#mesh');
const grad = new Gradient(canvas, { scale: lite ? 0.38 : 0.5, lite });
const BASE = [[0.14, 0.18], [0.88, 0.22], [0.52, 0.56], [0.16, 0.88], [0.86, 0.86]];
const AMP = [[0.12, 0.10], [0.10, 0.12], [0.16, 0.12], [0.12, 0.09], [0.10, 0.12]];
const FREQ = [[0.11, 0.13], [0.09, 0.15], [0.07, 0.10], [0.13, 0.08], [0.10, 0.12]];
let ptrX = 0.5, ptrY = 0.5;
if (canHover && !HX.embed) addEventListener('pointermove', (e) => { ptrX = e.clientX / innerWidth; ptrY = e.clientY / innerHeight; }, { passive: true });
const S = { time: 0, scroll: 0, colors: paletteAt(0), points: BASE.map((p) => p.slice()), orbA: [0, 0, 0, 0], orbB: [0, 0, 0, 0], night: 0 };
let tod = 0, isNight = false, follow = [0.5, 0.5], navScrolled = false;
const nav = $('#nav');

function orbRect(el) {
  const r = el.getBoundingClientRect();
  if (r.bottom < -40 || r.top > innerHeight + 40 || r.width < 2) return [0, 0, 0, 0];
  return [r.left + r.width / 2, r.top + r.height / 2, r.width / 2, 0];
}
let last = performance.now(), frames = 0, readySent = false;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = clamp((now - last) / 1000, 0.001, 0.05);
  last = now;
  if (!reduce) S.time += dt;
  stepBreath(reduce ? 0 : dt);
  const vh = innerHeight, a = innerWidth / vh;
  tod = mix(tod, todAt(scrollY + vh * 0.5), frames === 0 ? 1 : 1 - Math.exp(-dt * 6));
  const scrolled = scrollY > 30;
  if (scrolled !== navScrolled) { navScrolled = scrolled; nav.classList.toggle('is-scrolled', scrolled); }
  const night = tod > 2.3;
  if (night !== isNight) { isNight = night; root.classList.toggle('is-night', night); }
  S.colors = paletteAt(tod);
  S.night = smooth((tod - 2.3) / 0.6);
  S.scroll = scrollY / vh;
  follow[0] = mix(follow[0], ptrX, 0.03); follow[1] = mix(follow[1], ptrY, 0.03);
  for (let i = 0; i < 5; i++) {
    let x = BASE[i][0] + AMP[i][0] * Math.sin(S.time * FREQ[i][0] * 2.2 + i * 1.7);
    let y = BASE[i][1] + AMP[i][1] * Math.cos(S.time * FREQ[i][1] * 2.2 + i * 2.3);
    if (i === 2) { x = mix(x, follow[0], 0.35); y = mix(y, follow[1], 0.35); }
    S.points[i][0] = x * a; S.points[i][1] = y;
  }
  S.orbA = orbRect(orbHero); S.orbA[3] = heroBreath.glow;
  S.orbB = orbRect(orbPractice); S.orbB[3] = practice.glow || 0;
  if (grad.ok) grad.render(S);
  frames++;
  if (!readySent && frames >= 2) { readySent = true; fontsReady.then(() => HX.ready()); }
}
if (!grad.ok) root.classList.add('no-webgl');
let rz;
addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { grad.resize(); buildAnchors(); }, 120); });
ScrollTrigger.addEventListener('refresh', buildAnchors);

/* ---------- text + reveals ---------- */
function splitLines(el) {
  try { return SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' }).lines; } catch (e) { return [el]; }
}
function intro() {
  gsap.set(['.hero .stage__copy', '.breathcap'], { visibility: 'visible' });
  const lines = splitLines($('.hero__title'));
  const tl = gsap.timeline({ delay: HX.embed ? 0.1 : 0.3 });
  tl.from('.orb--hero', { opacity: 0, duration: 1.8, ease: 'power2.out' }, 0)
    .from(lines, { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.1 }, 0.2)
    .from('.hero .eyebrow', { opacity: 0, y: 10, duration: 1, ease: 'expo.out' }, 0.15)
    .from('.hero__sub', { opacity: 0, y: 14, duration: 1.1, ease: 'expo.out' }, 0.45)
    .from('.hero__ctas > *', { opacity: 0, y: 14, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0.55)
    .from('.breathcap', { opacity: 0, duration: 1.2 }, 0.8)
    .from('.nav', { opacity: 0, y: -10, duration: 1.1, ease: 'expo.out' }, 0.2);
}
function reveals() {
  $$('.split').forEach((el) => {
    const lines = splitLines(el);
    el.style.visibility = 'visible';
    gsap.from(lines, { yPercent: 110, duration: 1.25, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  $$('.reveal').forEach((el) => gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
  const groups = new Map();
  $$('.reveal-card').forEach((el) => { const p = el.parentElement; if (!groups.has(p)) groups.set(p, []); groups.get(p).push(el); });
  groups.forEach((els, parent) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: parent, start: 'top 88%', once: true } }));
  $$('[data-to]').forEach((el) => {
    const to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec || '0', 10), o = { v: 0 };
    el.textContent = (0).toFixed(dec);
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = o.v.toFixed(dec); } }) });
  });
  gsap.fromTo('.phone--a', { y: 70 }, { y: -30, ease: 'none', scrollTrigger: { trigger: '.app', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.phone--b', { y: -20, rotate: 6 }, { y: 50, rotate: 2, ease: 'none', scrollTrigger: { trigger: '.app', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.moonrise', { y: 60, scale: 0.8 }, { y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.download', start: 'top bottom', end: 'center center', scrub: true } });
}

/* ---------- sample audio (generated, only on click) ---------- */
let audio = null, sampleTimer = null;
const toast = $('.toast'), sampleBtn = $('[data-sample]');
function stopSample() {
  if (!audio) return;
  const { ctx, master } = audio;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
  setTimeout(() => ctx.close(), 1400);
  audio = null; clearInterval(sampleTimer);
  toast.hidden = true; sampleBtn.classList.remove('is-playing'); $('[data-sample-label]').textContent = 'Listen to a sample';
}
function startSample() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  const len = 3 * ctx.sampleRate, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  let lastv = 0;
  for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; lastv = (lastv + 0.02 * w) / 1.02; d[i] = lastv * 3.2; }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
  const ng = ctx.createGain(); ng.gain.value = 0.55;
  src.connect(lp); lp.connect(ng); ng.connect(master); src.start();
  [146.83, 220.0, 277.18, 329.63].forEach((f, i) => {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.detune.value = (i - 1.5) * 5;
    const g = ctx.createGain(); g.gain.value = 0.035;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07 + i * 0.03;
    const lg = ctx.createGain(); lg.gain.value = 0.025;
    lfo.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(master); o.start(); lfo.start();
  });
  master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5);
  audio = { ctx, master };
  let left = 20;
  toast.hidden = false; sampleBtn.classList.add('is-playing'); $('[data-sample-label]').textContent = 'Playing sample';
  $('[data-toast-time]').textContent = 'Sample · 0:20';
  sampleTimer = setInterval(() => { left--; $('[data-toast-time]').textContent = `Sample · 0:${String(Math.max(0, left)).padStart(2, '0')}`; if (left <= 0) stopSample(); }, 1000);
}
sampleBtn.addEventListener('click', () => (audio ? stopSample() : startSample()));
$('[data-sample-stop]').addEventListener('click', stopSample);

/* ---------- footer form ---------- */
const mini = $('.mini');
mini.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = mini.querySelector('input').value.trim(), msg = mini.querySelector('.mini__msg');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg.textContent = 'Please add a full email address.'; return; }
  msg.textContent = 'You are in. Your first calm idea lands on Sunday morning.';
  mini.querySelector('input').value = '';
});

/* ---------- magnetic ---------- */
if (canHover && !HX.embed) {
  $$('.magnetic').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' }), yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35); });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------- boot ---------- */
buildAnchors();
requestAnimationFrame(frame);
fontsReady.then(() => {
  if (reduce) {
    gsap.set(['.hero .stage__copy', '.breathcap'], { visibility: 'visible' });
    $$('.split').forEach((el) => { el.style.visibility = 'visible'; });
    $$('.reveal, .reveal-card').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
  } else { intro(); reveals(); }
  ScrollTrigger.refresh();
  buildAnchors();
});
setTimeout(() => {
  gsap.set(['.hero .stage__copy', '.breathcap'], { visibility: 'visible' });
  if (!readySent) { readySent = true; HX.ready(); }
}, 3500);
