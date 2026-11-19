import { Composition } from './composition.js';
import { Poster } from './posters.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, ready() {}, on() {} };
const { gsap, ScrollTrigger, SplitText, CustomEase } = window;
const root = document.documentElement;
root.classList.add('js');
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create('weight', 'M0,0 C0.62,0 0.18,1.12 0.6,1.035 C0.78,0.995 0.88,1 1,1');
CustomEase.create('drop', 'M0,0 C0.5,0 0.6,0.62 0.72,1.06 C0.8,0.97 0.9,1 1,1');

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduce = !!HX.reducedMotion;
const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

/* ---------- smooth scroll (desktop visitors only) ---------- */
let lenis = null;
if (!HX.embed && canHover && !reduce && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const navH = () => $('#nav').offsetHeight;
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href');
  const el = id.length > 1 ? $(id) : null;
  if (!el) return;
  e.preventDefault();
  closeMenu();
  const y = id === '#top' ? 0 : el.getBoundingClientRect().top + scrollY - navH() + 2;
  if (lenis) lenis.scrollTo(y, { duration: 1.4 });
  else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
}));

/* ---------- menu ---------- */
const menuBtn = $('.menu-btn'), overlay = $('#overlay');
function closeMenu() {
  if (!root.classList.contains('menu-open')) return;
  root.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); overlay.setAttribute('aria-hidden', 'true');
  menuBtn.querySelector('span').textContent = 'Menu';
  if (lenis) lenis.start();
}
menuBtn.addEventListener('click', () => {
  const open = !root.classList.contains('menu-open');
  root.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open)); overlay.setAttribute('aria-hidden', String(!open));
  menuBtn.querySelector('span').textContent = open ? 'Close' : 'Menu';
  if (open) {
    if (lenis) lenis.stop();
    gsap.fromTo($$('.overlay nav a'), { xPercent: -12, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.7, ease: 'weight', stagger: 0.05 });
  } else if (lenis) lenis.start();
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

/* ---------- hero composition ---------- */
const svg = $('#comp');
const capState = $('[data-cap-state]'), capNo = $('[data-cap-no]');
let compNo = 7;
const LABEL = { A: 'Poster study', B: 'Poster study', L: 'F O R M' };
const comp = new Composition(svg, {
  onState: (k) => {
    if (k !== 'L') { compNo++; capNo.textContent = 'Composition No. ' + String(compNo).padStart(2, '0'); }
    gsap.to(capState, { opacity: 0, duration: 0.2, onComplete: () => { capState.textContent = LABEL[k]; gsap.to(capState, { opacity: 1, duration: 0.3 }); } });
  },
});
let heroVisible = true;
new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; }, { rootMargin: '80px 0px' }).observe($('.comp'));
if (canHover && !HX.embed) {
  const pt = svg.createSVGPoint();
  addEventListener('pointermove', (e) => {
    const m = svg.getScreenCTM();
    if (!m) return;
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(m.inverse());
    comp.setPointer(p.x, p.y, true);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { comp.ptr.real = false; });
}
let clock = 0;
gsap.ticker.add((time, delta) => {
  const dt = Math.min(0.05, delta / 1000);
  clock += dt;
  if (heroVisible) comp.tick(dt, clock);
});
const SEQ = ['L', 'B', 'L', 'A'];
let seqI = 0, seed = 2;
function nextComp() {
  const key = SEQ[seqI % SEQ.length];
  seqI++;
  comp.go(key, gsap, { dur: 1.35, each: 0.045, seed: seed++ });
  const hold = key === 'L' ? 3.3 : 2.5;
  gsap.delayedCall(1.35 + 0.045 * 15 + hold, nextComp);
}
let compStarted = false;
function startComp() {
  if (compStarted) return;
  compStarted = true;
  comp.drawGrid(gsap);
  if (reduce) { comp.go('L', gsap, { dur: 0.01, each: 0 }); return; }
  comp.go('A', gsap, { dur: 1.0, each: 0.03, ease: 'drop', seed: 1 });
  gsap.delayedCall(3.6, nextComp);
}

/* ---------- learn by making: poster wall ---------- */
const NAMES = ['Mara Lindqvist', 'Kenji Arano', 'Ama Boateng', 'Lucía Ferrer', 'Theo Brandt', 'Priya Raman', 'Oskar Nyberg', 'Hana Sato', 'Rafael Moura', 'Imani Wells', 'Jonas Becker', 'Leila Haddou', 'Wei Lin', 'Sara Okafor', 'Mateo Ruiz', 'Elin Dahl'];
const COURSES = ['Typography', 'Colour Theory', 'Product Design', 'Motion Basics'];
const figs = $$('.poster');
const posters = figs.map((f, i) => new Poster(f.querySelector('canvas'), 101 + i * 17));
let studyN = 214, made = 1284, wallVisible = false, nameI = 0, wallStarted = false;
const countEl = $('[data-wall-count]');
function caption(i, n) {
  const f = figs[i];
  f.querySelector('[data-p-title]').textContent = 'Study ' + n;
  f.querySelector('[data-p-by]').textContent = NAMES[nameI % NAMES.length] + ' · ' + COURSES[(nameI * 3 + i) % 4];
  nameI++;
}
function startWall() {
  if (wallStarted) return;
  wallStarted = true;
  const now = performance.now();
  posters.forEach((p, i) => { p.generate(studyN + i, now + i * 120, false); p.t0 = now + i * 140; caption(i, studyN + i); });
  studyN += posters.length;
  let k = 0;
  const visibleCount = () => posters.filter((p) => p.canvas.offsetParent !== null).length || posters.length;
  gsap.delayedCall(2.6, function swap() {
    if (wallVisible && !reduce) {
      const n = visibleCount();
      const i = (k * 3) % n; k++;
      posters[i].generate(studyN, performance.now(), false);
      caption(i, studyN); studyN++;
      made++; countEl.textContent = made.toLocaleString('en-US') + ' studies made this cohort';
    }
    gsap.delayedCall(2.2, swap);
  });
}
gsap.ticker.add(() => { if (!wallStarted) return; const now = performance.now(); posters.forEach((p) => p.draw(now)); });
new IntersectionObserver((es) => { wallVisible = es[0].isIntersecting; if (wallVisible) fontsReady.then(startWall); }, { rootMargin: '200px 0px' }).observe($('#wall'));
let rz;
addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => posters.forEach((p) => { if (p.model) { p.size(); p.done = false; p.t0 = performance.now() - 10000; } }), 150); });

/* ---------- admissions form ---------- */
const form = $('.form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.name.value.trim(), email = form.email.value.trim(), msg = form.querySelector('.form__msg');
  if (!name) { msg.textContent = 'Please add your name.'; form.name.focus(); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { msg.textContent = 'Please add a full email address.'; form.email.focus(); return; }
  const course = form.course.value.split(',')[0];
  form.classList.add('is-done');
  msg.textContent = `Thank you, ${name.split(' ')[0]}. Your application for ${course} is in. We reply within five working days.`;
  gsap.from(msg, { y: 20, opacity: 0, duration: 0.8, ease: 'weight' });
});

/* ---------- reveals ---------- */
function splitLines(el) {
  try { return SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' }).lines; } catch (e) { return [el]; }
}
function intro() {
  gsap.set('.hero__copy > *', { visibility: 'visible' });
  const lines = splitLines($('.hero__title'));
  const tl = gsap.timeline({ delay: HX.embed ? 0.1 : 0.25 });
  tl.from(lines, { yPercent: 105, duration: 1.1, ease: 'weight', stagger: 0.09 }, 0.1)
    .from('.hero__copy .label', { x: -20, opacity: 0, duration: 0.8, ease: 'weight' }, 0)
    .from('.hero__sub', { y: 16, opacity: 0, duration: 0.9, ease: 'weight' }, 0.4)
    .from('.hero__ctas .btn', { y: 16, opacity: 0, duration: 0.9, ease: 'weight', stagger: 0.08 }, 0.5)
    .from('.hero__facts div', { y: 12, opacity: 0, duration: 0.8, ease: 'weight', stagger: 0.07 }, 0.65)
    .from('.comp__cap', { opacity: 0, duration: 0.8 }, 0.9);
}
function reveals() {
  $$('.split').forEach((el) => {
    const lines = splitLines(el);
    el.style.visibility = 'visible';
    gsap.from(lines, { yPercent: 105, duration: 1, ease: 'weight', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  $$('.reveal').forEach((el) => gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'weight', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
  // colour blocks wipe up
  gsap.fromTo('.block', { clipPath: 'inset(100% 0% 0% 0%)', opacity: 1 }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut', stagger: 0.09, scrollTrigger: { trigger: '.blocks', start: 'top 85%', once: true } });
  gsap.from('.block .glyph', { scale: 0.4, rotate: -30, opacity: 0, duration: 1, ease: 'back.out(1.7)', stagger: 0.09, delay: 0.45, scrollTrigger: { trigger: '.blocks', start: 'top 85%', once: true } });
  // faculty: monograms assemble shape by shape
  $$('.person').forEach((p, i) => {
    gsap.set(p, { opacity: 1 });
    gsap.from(p.querySelectorAll('.m'), { scale: 0, rotate: -60, transformOrigin: '50% 50%', duration: 0.9, ease: 'back.out(1.8)', stagger: 0.07, delay: i * 0.12, scrollTrigger: { trigger: '.people', start: 'top 85%', once: true } });
    gsap.from(p.querySelector('.person__body'), { y: 20, opacity: 0, duration: 0.9, ease: 'weight', delay: 0.2 + i * 0.12, scrollTrigger: { trigger: '.people', start: 'top 85%', once: true } });
  });
  // calendar bars grow week by week
  gsap.from('.bar', { scaleX: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.gantt', start: 'top 85%', once: true } });
  gsap.from('.seats', { opacity: 0, x: -10, duration: 0.6, stagger: 0.12, delay: 0.6, scrollTrigger: { trigger: '.gantt', start: 'top 85%', once: true } });
  // pricing cards
  $$('.plan').forEach((p, i) => {
    gsap.set(p, { opacity: 1 });
    gsap.from(p, { y: 40, opacity: 0, duration: 1, ease: 'weight', delay: i * 0.1, scrollTrigger: { trigger: '.plans', start: 'top 85%', once: true } });
    gsap.from(p.querySelector('.plan__shape'), { scale: 0, rotate: 90, transformOrigin: '50% 50%', duration: 1.2, ease: 'back.out(1.6)', delay: 0.3 + i * 0.1, scrollTrigger: { trigger: '.plans', start: 'top 85%', once: true } });
  });
  // admissions art falls into place, then keeps breathing
  gsap.from('.apply__art svg > *', { y: -260, rotate: 25, opacity: 0, transformOrigin: '50% 50%', duration: 1.1, ease: 'drop', stagger: 0.1, scrollTrigger: { trigger: '.apply', start: 'top 80%', once: true } });
  if (!reduce) {
    gsap.to('.apply__art .a2', { y: -16, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.apply__art .a1', { rotate: 8, transformOrigin: '50% 50%', duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }
  // footer letters drop in
  gsap.fromTo('.footer__word span', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut', stagger: 0.06, scrollTrigger: { trigger: '.footer', start: 'top 92%', once: true } });
}

/* ---------- boot ---------- */
let readySent = false;
fontsReady.then(() => {
  if (reduce) {
    gsap.set('.hero__copy > *', { visibility: 'visible' });
    $$('.split').forEach((el) => { el.style.visibility = 'visible'; });
    $$('.reveal, .reveal-block').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
  } else { intro(); reveals(); }
  startComp();
  ScrollTrigger.refresh();
  requestAnimationFrame(() => requestAnimationFrame(() => { if (!readySent) { readySent = true; HX.ready(); } }));
});
setTimeout(() => {
  gsap.set('.hero__copy > *', { visibility: 'visible' });
  if (!readySent) { readySent = true; startComp(); HX.ready(); }
}, 3500);
