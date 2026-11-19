import { startClay } from './scene.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, ready() {}, on() {} };
const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, SplitText = window.SplitText;
const reduced = !!HX.reducedMotion;
const phone = () => innerWidth < 760;
if (reduced) document.documentElement.classList.add('reduced');
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
if (gsap && SplitText) gsap.registerPlugin(SplitText);

/* smooth scroll (never inside the menu frame) */
let lenis = null;
if (!HX.embed && !reduced && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true });
  window.__lenis = lenis;
  if (ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
  if (gsap) { gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
}

/* nav */
const nav = document.querySelector('[data-nav]');
const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 30);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const menuBtn = document.querySelector('[data-menu-btn]'), menu = document.querySelector('[data-menu]');
const setMenu = (open) => {
  menuBtn.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (lenis) open ? lenis.stop() : lenis.start();
  if (open && gsap) gsap.from(menu.querySelectorAll('nav a, .btn, .menu__note'), { y: 24, opacity: 0, stagger: 0.05, duration: 0.5, ease: 'power3.out' });
};
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

/* anchor links through Lenis */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  const el = document.querySelector(id);
  if (!el) return;
  e.preventDefault();
  const y = id === '#top' ? 0 : el.getBoundingClientRect().top + scrollY - (phone() ? 60 : 70);
  lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
});

/* the clay world */
const stage = document.querySelector('.stage');
const world = startClay({ canvas: stage.querySelector('canvas'), stage, overlay: stage.querySelector('[data-overlay]') });
if (world) {
  world.renderIcons([...document.querySelectorAll('canvas.ico')]);
} else {
  document.querySelectorAll('canvas.ico').forEach((c) => c.classList.add('is-drawn'));
}

/* hero entrance */
if (gsap && !reduced) {
  gsap.from('.hero > *', { y: 36, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.15 });
  gsap.from('.nav > *', { y: -20, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06, delay: 0.1 });
}

/* split-line headings */
if (gsap && SplitText && ScrollTrigger && !reduced) {
  document.fonts.ready.then(() => {
    document.querySelectorAll('[data-split]:not(.hero__title)').forEach((el) => {
      const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
      gsap.from(split.lines, {
        yPercent: 110, duration: 1.05, ease: 'expo.out', stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
    ScrollTrigger.refresh();
  });
}

/* reveal cards */
const revealIO = new IntersectionObserver((ents) => {
  ents.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target;
    const sibs = [...el.parentElement.querySelectorAll(':scope > [data-reveal]')];
    el.style.transitionDelay = (Math.max(0, sibs.indexOf(el)) * 0.09) + 's';
    el.classList.add('is-in');
    revealIO.unobserve(el);
  });
}, { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('[data-reveal]').forEach((el) => (reduced ? el.classList.add('is-in') : revealIO.observe(el)));

/* parent dashboard: bars grow, counters tick, skills fill */
const dash = document.querySelector('[data-dash]');
if (gsap && ScrollTrigger && dash && !reduced) {
  const tl = gsap.timeline({ paused: true });
  tl.from(dash.querySelectorAll('.bar i'), { scaleY: 0, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.06 }, 0);
  dash.querySelectorAll('.skill').forEach((s, i) => { tl.fromTo(s, { '--k': 0 }, { '--k': 1, duration: 1.1, ease: 'expo.out' }, 0.15 + i * 0.08); });
  dash.querySelectorAll('[data-count]').forEach((n) => {
    const end = +n.dataset.count, o = { v: 0 };
    tl.to(o, { v: end, duration: 1.4, ease: 'power3.out', onUpdate: () => { n.textContent = Math.round(o.v); } }, 0.1);
  });
  ScrollTrigger.create({ trigger: dash, start: 'top 80%', once: true, onEnter: () => tl.play() });
}
const unlock = document.querySelector('[data-unlock]');
if (unlock) unlock.addEventListener('click', () => {
  const box = unlock.closest('.nudge');
  box.classList.add('is-done');
  box.querySelector('p').innerHTML = '<b>Robot Builders</b> is unlocked for Aarav.';
  unlock.textContent = 'Unlocked';
});

/* the little Code Quest puzzle in the phone */
const board = document.querySelector('[data-board]');
if (board && gsap) {
  const pip = board.querySelector('[data-pip]');
  const blocks = [...document.querySelectorAll('[data-code] .blk')];
  const run = document.querySelector('[data-run]'), yay = document.querySelector('[data-yay]');
  const cell = (c, r) => ({ xPercent: c * 100, yPercent: r * 100 });
  const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6, defaults: { ease: 'power2.inOut' } });
  const glow = (i) => () => blocks.forEach((b, j) => b.style.filter = j === i ? 'brightness(1.12) drop-shadow(0 0 6px rgba(255,201,74,.9))' : '');
  tl.set(pip, { ...cell(1, 0), rotation: 0, scale: 1 })
    .set(yay, { opacity: 0, scale: 0.6 })
    .call(() => run.classList.add('is-on'), null, 0.4)
    .call(() => run.classList.remove('is-on'), null, 0.6)
    .call(glow(0), null, 0.7).to(pip, { ...cell(3, 0), duration: 0.9 }, 0.7)
    .call(glow(1), null, 1.7).to(pip, { rotation: 90, duration: 0.35, ease: 'back.out(2)' }, 1.7)
    .to(pip, { rotation: 0, duration: 0.01 }, 2.15)
    .call(glow(2), null, 2.2).to(pip, { ...cell(3, 2), duration: 0.9 }, 2.2)
    .call(glow(3), null, 3.2).to(pip, { y: '-=18', duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 1 }, 3.2)
    .to(yay, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, 3.5)
    .call(glow(-1), null, 4.4)
    .to(yay, { opacity: 0, duration: 0.3 }, 5.0)
    .to(pip, { opacity: 0, duration: 0.2 }, 5.1).set(pip, { ...cell(1, 0), opacity: 1 }, 5.35);
  const io = new IntersectionObserver((e) => { e[0].isIntersecting ? tl.play() : tl.pause(); });
  io.observe(board);
  run.addEventListener('click', () => tl.restart());
}

/* magnetic buttons on desktop pointers only */
if (!HX.embed && matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced && gsap) {
  document.querySelectorAll('[data-magnetic]').forEach((b) => {
    const xTo = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3.out' }), yTo = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3.out' });
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35); });
    b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* FAQ: one open at a time on phones keeps the page short */
document.querySelectorAll('.qa').forEach((d) => d.addEventListener('toggle', () => {
  if (d.open && phone()) document.querySelectorAll('.qa').forEach((o) => { if (o !== d) o.open = false; });
}));

if (ScrollTrigger) addEventListener('load', () => ScrollTrigger.refresh());
