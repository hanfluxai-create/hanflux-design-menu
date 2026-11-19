import { burgerSVG } from './burger.js';
import { burstSVG, speedLines, friesSVG, shakeSVG, truckSVG, ORIGIN } from './art.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, ready() {}, on() {} };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = !!HX.reducedMotion;
const { gsap, ScrollTrigger } = window;
if (gsap) gsap.registerPlugin(ScrollTrigger);
document.documentElement.classList.add('js');

/* ------------------------------------------------------------ art */
$('.hero-burger').innerHTML = burgerSVG({ patties: 2, seed: 7 }, 'aria-hidden="true"');
const speed = (n, seed, col) => `<svg viewBox="0 0 1000 1000" aria-hidden="true">${speedLines(500, 500, n, 120, 760, seed, col)}</svg>`;
$('.speed').innerHTML = speed(HX.lite ? 46 : 72, 9, '#111');
$('.order__fx').innerHTML = speed(60, 4, '#ffd400');
$('.burst--smash').innerHTML = burstSVG('SMASH!', { seed: 3, size: 66 });
$('.burst--boom').innerHTML = burstSVG('KA-BOOM!', { fill: '#e63223', color: '#ffd400', seed: 8, size: 60, rot: 6 });
$('.burst--final').innerHTML = burstSVG('BOOM!', { fill: '#ffd400', color: '#e63223', seed: 5, size: 74, rot: -6 });
const ART = {
  boom: () => burgerSVG({ patties: 1, seed: 4, seeds: 15 }),
  double: () => burgerSVG({ patties: 2, seed: 11, seeds: 16 }),
  shinobi: () => burgerSVG({ patties: 1, spicy: true, seed: 3, seeds: 12 }),
  veg: () => burgerSVG({ patties: 1, veg: true, seed: 5, seeds: 15 }),
  fries: () => friesSVG(),
  shake: () => shakeSVG(),
};
$$('[data-art]').forEach((el) => { el.innerHTML = ART[el.dataset.art](); });
$$('[data-origin]').forEach((el) => { el.innerHTML = ORIGIN[+el.dataset.origin](); });
$('.truck__art').innerHTML = truckSVG('aria-hidden="true"');
$('.order__burger').innerHTML = burgerSVG({ patties: 2, spicy: true, seed: 13, seeds: 16 }, 'aria-hidden="true"');

/* ------------------------------------------------------------ today */
(function today() {
  const d = new Date().getDay();
  const li = $$('.sched li').find((l) => l.dataset.days.split(',').map(Number).includes(d));
  if (li) li.classList.add('is-today');
  const line = $('[data-today-line]');
  if (d === 1) line.textContent = 'Truck’s day off today. Boom HQ is open 12 noon to midnight.';
  else if (li) line.textContent = `Truck tonight: ${$('strong', li).textContent}, ${$('.sched__where', li).lastChild.textContent.replace(/^,?\s*/, '')}, from 6 PM`;
})();

/* ------------------------------------------------------------ cart */
const cart = { n: 0, total: 0 };
const badge = $('[data-cart-count]'), cartBtn = $('.cart'), bag = $('[data-bag]'), toast = $('.toast');
let toastT = 0;
function say(msg) {
  toast.textContent = msg; toast.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { toast.hidden = true; }, 2200);
}
$$('.add').forEach((b) => b.addEventListener('click', () => {
  const card = b.closest('.card');
  cart.n++; cart.total += +card.dataset.price;
  badge.textContent = cart.n;
  cartBtn.classList.remove('is-bump'); void cartBtn.offsetWidth; cartBtn.classList.add('is-bump');
  bag.textContent = `Your bag: ${cart.n} item${cart.n > 1 ? 's' : ''}, ₹${cart.total.toLocaleString('en-IN')}. Ready when you are.`;
  b.textContent = 'Added!'; b.classList.add('is-added');
  setTimeout(() => { b.textContent = 'Add +'; b.classList.remove('is-added'); }, 900);
  say(`${card.dataset.item} added to your bag`);
  if (gsap && !RM) {
    const p = document.createElement('span');
    p.className = 'pow'; p.textContent = ['POW!', 'ZAP!', 'BAM!', 'YUM!'][cart.n % 4];
    card.appendChild(p);
    const r = b.getBoundingClientRect(), c = card.getBoundingClientRect();
    gsap.set(p, { left: r.left - c.left + r.width / 2 - 30, top: r.top - c.top - 10 });
    gsap.fromTo(p, { scale: 0.2, rotation: -20, opacity: 1 }, { scale: 1.2, rotation: 8, y: -46, duration: 0.5, ease: 'back.out(3)' });
    gsap.to(p, { opacity: 0, duration: 0.3, delay: 0.55, onComplete: () => p.remove() });
  }
}));
$$('[data-order]').forEach((b) => b.addEventListener('click', (e) => {
  e.preventDefault();
  const ok = $('[data-order-ok]');
  const kind = b.dataset.order;
  const empty = cart.n === 0;
  ok.textContent = kind === 'whatsapp' ? 'Say hi on WhatsApp and the Boom team will take your order in under two minutes.'
    : empty ? 'Your bag is empty. Add something from the menu and we’ll fire up the griddle.'
    : kind === 'delivery' ? `Order sent to the griddle! ${cart.n} item${cart.n > 1 ? 's' : ''} on the way, about 30 minutes to your door.`
    : `Order sent! Pick it up at Boom HQ, Lane 7, Koregaon Park, in about 12 minutes.`;
  ok.hidden = false;
  if (gsap && !RM) gsap.fromTo(ok, { scale: 0.8, rotation: -3 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(3)' });
}));

/* ------------------------------------------------------------ nav, menu, scroll */
const menuBtn = $('.nav__menu'), panel = $('#menu-panel');
let lenis = null;
function setMenu(open) { menuBtn.setAttribute('aria-expanded', open); panel.hidden = !open; document.body.style.overflow = open ? 'hidden' : ''; if (lenis) open ? lenis.stop() : lenis.start(); }
menuBtn.addEventListener('click', () => setMenu(panel.hidden));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) setMenu(false); });
if (!HX.embed && !RM && window.Lenis && gsap && matchMedia('(pointer: fine)').matches) {
  lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  if (a.dataset.order) return;
  const id = a.getAttribute('href');
  const t = id === '#top' ? null : $(id);
  if (id !== '#top' && !t) return;
  e.preventDefault();
  if (!panel.hidden) setMenu(false);
  const y = id === '#top' ? 0 : t.getBoundingClientRect().top + scrollY - (innerWidth < 700 ? 70 : 84);
  if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
}));
if (!HX.embed && gsap && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  $$('.magnetic').forEach((b) => {
    const xTo = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3' });
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.22); yTo((e.clientY - r.top - r.height / 2) * 0.3); });
    b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ------------------------------------------------------------ the assembly */
const hero = $('.hero');
let build = null;
function assemble() {
  const layers = $$('.hero-burger .b-layer');
  const L = (n) => layers.find((l) => l.dataset.layer === n);
  const order = ['heel', 'sauce', 'lettuce', 'patty0', 'cheese0', 'patty1', 'cheese1', 'tomato', 'onion', 'crown'].map(L).filter(Boolean);
  const pBurger = $('.p-burger');
  const smash = $('.burst--smash'), boom = $('.burst--boom');
  const tl = gsap.timeline({ paused: true, onStart: () => hero.classList.remove('is-built'), onComplete: () => hero.classList.add('is-built') });
  tl.set(order, { opacity: 0 }).set([smash, boom], { opacity: 0, scale: 0 })
    .fromTo(L('shadow'), { scaleX: 0.2, opacity: 0, transformOrigin: '50% 50%' }, { scaleX: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0);
  let t = 0.2;
  const shake = (at) => tl.fromTo(pBurger, { x: -7, y: 4 }, { x: 0, y: 0, duration: 0.45, ease: 'elastic.out(1, 0.3)' }, at);
  order.forEach((layer) => {
    const name = layer.dataset.layer;
    if (name.startsWith('cheese') || name === 'sauce') {
      tl.fromTo(layer, { opacity: 1, scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.3, ease: 'power2.out' }, t);
      t += 0.12;
      return;
    }
    const drop = name === 'crown' ? 0.32 : 0.24;
    tl.fromTo(layer, { opacity: 1, y: -640 }, { y: 0, duration: drop, ease: 'power3.in' }, t)
      .fromTo(layer, { scaleY: 0.8, scaleX: 1.05, transformOrigin: '50% 100%' }, { scaleY: 1, scaleX: 1, duration: 0.45, ease: 'elastic.out(1, 0.38)', immediateRender: false }, t + drop);
    if (name === 'patty0') { tl.fromTo(smash, { scale: 0, rotation: -40, opacity: 1 }, { scale: 1, rotation: -10, duration: 0.42, ease: 'back.out(3)' }, t + drop); shake(t + drop); }
    if (name === 'crown') { tl.fromTo(boom, { scale: 0, rotation: 40, opacity: 1 }, { scale: 1, rotation: 8, duration: 0.5, ease: 'back.out(3)' }, t + drop); shake(t + drop); }
    t += name === 'crown' ? 0.2 : 0.13;
  });
  return tl;
}
function idle() {
  gsap.to('.hero-burger svg', { y: -9, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.burst--smash svg, .burst--boom svg', { scale: 1.06, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.35, transformOrigin: '50% 50%' });
}

/* ------------------------------------------------------------ page turns */
function choreography() {
  if (!gsap || RM) return;
  const turn = (els, opts = {}) => gsap.from(els, { rotateY: -72, transformPerspective: 1500, transformOrigin: '0% 50%', opacity: 0, x: -24, duration: 0.8, stagger: 0.1, ease: 'power3.out', ...opts });
  ScrollTrigger.batch('.page:not(.hero) .panel:not(.card):not(.strip__p), .card, .strip__p', {
    start: 'top 90%', once: true, onEnter: (els) => turn(els),
  });
  ScrollTrigger.batch('.bubble', { start: 'top 92%', once: true, onEnter: (els) => gsap.from(els, { scale: 0.5, opacity: 0, duration: 0.6, stagger: 0.09, ease: 'back.out(2.4)' }) });
  ScrollTrigger.create({ trigger: '.truck__hero', start: 'top 80%', once: true, onEnter: () => {
    gsap.from('.truck__art', { xPercent: -130, duration: 1.1, ease: 'power3.out' });
    gsap.from('.truck__sfx', { scale: 0, rotation: -40, duration: 0.5, delay: 0.8, ease: 'back.out(3)' });
  } });
  ScrollTrigger.create({ trigger: '.order__panel', start: 'top 75%', once: true, onEnter: () => {
    gsap.from('.order__burger', { y: -300, opacity: 0, duration: 0.6, ease: 'power3.in' });
    gsap.fromTo('.burst--final', { scale: 0, opacity: 1, rotation: -30 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.5, delay: 0.6, ease: 'back.out(3)' });
  } });
  gsap.to('.order__burger', { y: -8, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
}

/* ------------------------------------------------------------ boot */
(async function boot() {
  const fonts = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();
  await Promise.race([fonts, new Promise((r) => setTimeout(r, 2000))]);
  if (!gsap || RM) {
    $$('.burst').forEach((b) => { b.style.opacity = 1; });
    hero.classList.add('is-built');
    HX.ready();
    return;
  }
  choreography();
  build = assemble();
  gsap.from('.p-title, .p-cta', { rotateY: -80, transformPerspective: 1500, transformOrigin: '0% 50%', opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' });
  gsap.from('.p-burger', { rotateY: 70, transformPerspective: 1600, transformOrigin: '100% 50%', opacity: 0, duration: 0.7, ease: 'power3.out' });
  requestAnimationFrame(() => {
    HX.ready();
    build.play(0);
    idle();
    ScrollTrigger.refresh();
  });
  // replay the build when the page comes back to the top after a while away
  let away = 0, seen = true;
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) { if (seen) away = performance.now(); seen = false; return; }
    if (!seen && performance.now() - away > 4500) build.restart();
    seen = true;
  }, { threshold: 0.3 }).observe(hero);
})();
