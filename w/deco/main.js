import { heroSVG, heroLayout } from './frame.js';
import { roomSVG, vignette, terraceSVG, barSVG, lotusSVG, boatSVG, crestPaths } from './art.js';
import { POSTERS, posterSVG } from './posters.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, ready() {}, on() {} };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const RM = !!HX.reducedMotion;
const { gsap, ScrollTrigger, SplitText, DrawSVGPlugin } = window;
if (gsap) gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
root.classList.add('js');
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

/* ------------------------------------------------------------ static art */
$$('[data-crest]').forEach((p) => p.setAttribute('d', crestPaths()));
$$('.suite__arch').forEach((el) => { el.innerHTML = roomSVG(el.dataset.room, el.dataset.label); });
const VEN = { terrace: [terraceSVG, '0 0 400 360'], bar: [barSVG, '0 0 400 360'], lotus: [lotusSVG, '0 0 400 330'], boat: [boatSVG, '0 0 400 280'] };
$$('[data-venue]').forEach((el) => { const [fn, vb] = VEN[el.dataset.venue]; el.innerHTML = vignette(fn(), vb, el.dataset.label); });
$('.gallery__track').innerHTML = POSTERS.map((p) => `<figure class="poster">${posterSVG(p)}<figcaption>${p.label.replace(/^Poster: /, '')}</figcaption></figure>`).join('');

/* ------------------------------------------------------------ hero doors */
const hero = $('.hero');
let shineURL = '';
let built = { W: 0, H: 0 };
function buildHero() {
  const W = hero.clientWidth, H = hero.clientHeight;
  if (W === built.W && H === built.H) return false;
  built = { W, H };
  const left = heroSVG(W, H, { uid: 'dl' });
  const right = heroSVG(W, H, { uid: 'dr' });
  const shine = '<div class="door__shine"><i></i></div>';
  $('.door--l .door__inner').innerHTML = left.svg + shine;
  $('.door--r .door__inner').innerHTML = right.svg + shine;
  // shimmer mask: the same line art in white, a touch heavier
  const m = heroSVG(W, H, { stroke: '#fff', mask: true, uid: 'mk' }).svg.replace(/stroke-width="([\d.]+)"/g, (_, w) => `stroke-width="${(+w * 1.7).toFixed(2)}"`);
  if (shineURL) URL.revokeObjectURL(shineURL);
  shineURL = URL.createObjectURL(new Blob([m], { type: 'image/svg+xml' }));
  $$('.door__shine').forEach((s) => s.style.setProperty('--shine-mask', `url("${shineURL}")`));
  // text panels follow the arch
  const L = left.layout;
  const colX = L.m2 + 40;
  const colW = Math.max(220, L.cx - L.a - 36 - colX - 36);
  const palmTop = L.bottom - Math.min(L.H * 0.42, 380) * 0.9;
  hero.style.setProperty('--col-x', colX + 'px');
  hero.style.setProperty('--col-w', colW + 'px');
  hero.style.setProperty('--col-top', L.top - 10 + 'px');
  hero.style.setProperty('--col-h', Math.max(260, palmTop - L.top) + 'px');
  hero.style.setProperty('--mtext-top', L.bottom + 22 + 'px');
  return true;
}
buildHero();

function intro() {
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  const _to = tl.to.bind(tl);
  tl.to = (t, v, p) => ((Array.isArray(t) && !t.length) ? tl : _to(t, v, p));
  const q = (sel) => $$(sel, $('.doors')).filter((p) => (p.getAttribute('d') || '').length > 2);
  const sets = ['.d-frame, .d-frame2, .d-fans', '.d-crown, .d-crown2, .d-arch, .d-arch2, .d-base', '.d-rays', '.d-rings', '.l-palace path', '.d-water', '.d-palms', '.d-stars'];
  const set = (t, v) => { if (t.length) gsap.set(t, v); };
  sets.forEach((s) => set(q(s), { drawSVG: '0%' }));
  set(q('.d-sky'), { opacity: 0 });
  set($$('.l-refl', $('.doors')), { opacity: 0 });
  tl.to(q('.d-frame, .d-frame2, .d-fans'), { drawSVG: '100%', duration: 1.1 }, 0)
    .to(q('.d-crown, .d-crown2, .d-arch, .d-arch2, .d-base'), { drawSVG: '100%', duration: 1.1, stagger: 0.04 }, 0.1)
    .to(q('.d-sky'), { opacity: 1, duration: 1.2, ease: 'power1.out' }, 0.25)
    .to(q('.d-rays'), { drawSVG: '0% 100%', duration: 0.9, ease: 'power3.out' }, 0.45)
    .to(q('.d-rings'), { drawSVG: '100%', duration: 0.8 }, 0.6)
    .to(q('.l-palace path'), { drawSVG: '100%', duration: 0.75, stagger: { each: 0.012, from: 'start' } }, 0.35)
    .to(q('.d-palms'), { drawSVG: '100%', duration: 1.1 }, 0.55)
    .to(q('.d-water'), { drawSVG: '100%', duration: 0.6 }, 1.05)
    .to($$('.l-refl', $('.doors')), { opacity: 0.42, duration: 0.6, ease: 'none' }, 1.15)
    .to(q('.d-stars'), { drawSVG: '100%', duration: 0.5 }, 1.2);
  // text
  const st = SplitText.create('.hero__title', { type: 'lines', linesClass: 'line' });
  tl.from('.hero__col--l .label', { opacity: 0, y: 14, duration: 0.7, ease: 'power3.out' }, 0.5)
    .from(st.lines, { opacity: 0, y: 26, duration: 0.9, stagger: 0.08, ease: 'power3.out' }, 0.6)
    .from('.hero__sub, .hero__ctas .btn, .hero__rate', { opacity: 0, y: 18, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.8);
  tl.call(shimmer, null, 1.6);
  return tl;
}
let shimmerTl = null;
function shimmer() {
  if (RM) return;
  if (shimmerTl) shimmerTl.kill();
  const bands = $$('.door__shine i');
  shimmerTl = gsap.timeline({ repeat: -1, repeatDelay: 2.6 })
    .fromTo(bands, { xPercent: 250 }, { xPercent: -150, duration: 2.6, ease: 'power2.inOut' });
}

/* ------------------------------------------------------------ nav + menu + scroll */
const nav = $('#nav'), menu = $('#menu'), menuBtn = $('.nav__menu');
let lenis = null;
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', open); menu.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (lenis) open ? lenis.stop() : lenis.start();
}
menuBtn.addEventListener('click', () => setMenu(menu.hidden));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
const solidAt = () => innerHeight * (RM ? 0.3 : 0.92);
let wasSolid = null;
function onScroll() { const s = scrollY > solidAt(); if (s !== wasSolid) { nav.classList.toggle('is-solid', s); wasSolid = s; } }
addEventListener('scroll', onScroll, { passive: true });
onScroll();
if (!HX.embed && !RM && window.Lenis && matchMedia('(pointer: fine)').matches) {
  lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href');
  const t = id === '#top' ? null : $(id);
  if (id !== '#top' && !t) return;
  e.preventDefault();
  if (!menu.hidden) setMenu(false);
  const y = id === '#top' ? 0 : t.getBoundingClientRect().top + scrollY - (innerWidth < 900 ? 64 : 84);
  if (lenis) lenis.scrollTo(y, { duration: 1.5 });
  else scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
}));
if (!HX.embed && gsap && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  $$('.magnetic').forEach((b) => {
    const xTo = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3' });
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.2); yTo((e.clientY - r.top - r.height / 2) * 0.3); });
    b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ------------------------------------------------------------ booking calendar */
(function booking() {
  const form = $('.booking');
  const grid = $('[data-grid]', form), monthEl = $('[data-month]', form);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let checkIn = new Date(today); checkIn.setDate(checkIn.getDate() + 21);
  let checkOut = new Date(checkIn); checkOut.setDate(checkOut.getDate() + 3);
  let view = new Date(checkIn.getFullYear(), checkIn.getMonth(), 1);
  let adults = 2, kids = 0;
  const fmt = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const same = (a, b) => a && b && a.getTime() === b.getTime();
  function render() {
    monthEl.textContent = view.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const first = (view.getDay() + 6) % 7;
    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    let html = '';
    for (let i = 0; i < first; i++) html += '<span></span>';
    for (let d = 1; d <= days; d++) {
      const dt = new Date(view.getFullYear(), view.getMonth(), d);
      const cls = [same(dt, checkIn) ? 'is-start' : '', same(dt, checkOut) ? 'is-end' : '', checkIn && checkOut && dt > checkIn && dt < checkOut ? 'in-range' : ''].join(' ').trim();
      html += `<button type="button" data-d="${dt.getTime()}" class="${cls}" ${dt < today ? 'disabled' : ''} aria-label="${fmt(dt)}">${d}</button>`;
    }
    grid.innerHTML = html;
    $('[data-prev]', form).disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
    const nights = checkOut ? Math.round((checkOut - checkIn) / 864e5) : 0;
    $('[data-in]', form).textContent = fmt(checkIn);
    $('[data-out]', form).textContent = checkOut ? fmt(checkOut) : 'Select a date';
    $('[data-nights]', form).textContent = nights || '–'.replace('–', '0');
    const rate = +$('[data-suite]', form).value;
    $('[data-total]', form).textContent = nights ? inr(rate * nights) : inr(rate);
  }
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-d]'); if (!b || b.disabled) return;
    const dt = new Date(+b.dataset.d);
    if (!checkIn || checkOut) { checkIn = dt; checkOut = null; }
    else if (dt > checkIn) checkOut = dt;
    else checkIn = dt;
    render();
  });
  $('[data-prev]', form).addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); });
  $('[data-next]', form).addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); });
  $('[data-suite]', form).addEventListener('change', render);
  $$('[data-step]', form).forEach((b) => b.addEventListener('click', () => {
    const [k, v] = b.dataset.step.split(':');
    if (k === 'adults') adults = Math.min(6, Math.max(1, adults + +v)); else kids = Math.min(4, Math.max(0, kids + +v));
    $('[data-adults]', form).textContent = adults; $('[data-kids]', form).textContent = kids;
  }));
  const ok = $('.booking__ok', form);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!checkOut) { checkOut = new Date(checkIn); checkOut.setDate(checkOut.getDate() + 2); render(); }
    const nights = Math.round((checkOut - checkIn) / 864e5);
    const sel = $('[data-suite]', form);
    const suite = sel.options[sel.selectedIndex].text.split(',')[0];
    $('[data-ok]', form).textContent = `We are holding the ${suite} for ${nights} night${nights > 1 ? 's' : ''}, ${fmt(checkIn)} to ${fmt(checkOut)}, for ${adults} adult${adults > 1 ? 's' : ''}${kids ? ` and ${kids} child${kids > 1 ? 'ren' : ''}` : ''}. Estimated ${inr(+sel.value * nights)} before taxes. Our concierge will confirm on WhatsApp within the hour.`;
    ok.hidden = false;
    if (gsap && !RM) gsap.from(ok, { opacity: 0, scale: 0.98, duration: 0.6, ease: 'power3.out' });
  });
  $('[data-again]', form).addEventListener('click', () => { ok.hidden = true; });
  render();
})();

/* ------------------------------------------------------------ scroll choreography */
function counters(scope) {
  $$('[data-count]', scope).forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.4, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } });
  });
}
function choreography() {
  if (!gsap || RM) return;
  // doors open as you scroll into the hotel
  const welcome = $('.welcome');
  welcome.classList.add('is-behind');
  $('.hero__stage').prepend(welcome);
  $$('[data-count]', welcome).forEach((el) => { el.textContent = '0'; });
  let counted = false;
  gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: '+=100%', pin: true, scrub: 0.6, onUpdate: (st) => { if (!counted && st.progress > 0.55) { counted = true; counters(welcome); } } } })
    .to('.hero__text, .hero__cue', { opacity: 0, y: -36, duration: 0.24, ease: 'power1.in' }, 0)
    .to('.door--l', { rotateY: 104, duration: 1, ease: 'power2.inOut' }, 0.1)
    .to('.door--r', { rotateY: -104, duration: 1, ease: 'power2.inOut' }, 0.1)
    .to('.door__shade', { opacity: 1, duration: 0.8, ease: 'power1.in' }, 0.15)
    .to('.door', { opacity: 0, duration: 0.22, ease: 'power1.in' }, 0.92)
    .fromTo('.welcome__inner', { scale: 0.88, opacity: 0, y: 40 }, { scale: 1, opacity: 1, y: 0, duration: 0.62, ease: 'power2.out' }, 0.42);

  // section heads: ornament draws, label and heading open like a curtain
  $$('.head, .spa__body, .booking__intro, .gallery__head').forEach((h) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: h, start: 'top 85%', once: true } });
    const orn = $$('.orn path', h);
    if (orn.length) tl.from(orn, { drawSVG: '50% 50%', duration: 0.9, ease: 'power2.out' }, 0);
    const lb = $$('.label', h), hd = $$('.h2', h), ld = $$('.lede', h);
    if (lb.length) tl.from(lb, { opacity: 0, y: 10, duration: 0.6, ease: 'power3.out' }, 0.1);
    if (hd.length) tl.from(hd, { clipPath: 'inset(0 50% 0 50%)', opacity: 0.2, duration: 1.0, ease: 'power3.inOut' }, 0.15);
    if (ld.length) tl.from(ld, { opacity: 0, y: 18, duration: 0.8, ease: 'power3.out' }, 0.4);
  });
  // line art draws when it arrives
  const drawIn = (el, dur = 1.2) => {
    const paths = $$('path', el);
    gsap.set(paths, { drawSVG: '0%' });
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => gsap.to(paths, { drawSVG: '100%', duration: dur, stagger: 0.035, ease: 'power2.inOut' }) });
  };
  $$('.suite__arch, .venue__art, .spa__art, .weddings__art').forEach((el) => drawIn(el, 1.0));
  ScrollTrigger.batch('.suite, .venue__body, .treatments li, .venues-stats > div, .perks li, .footer__cols > div', {
    start: 'top 90%', once: true,
    onEnter: (els) => gsap.from(els, { opacity: 0, y: 30, duration: 0.8, stagger: 0.08, ease: 'power3.out' }),
  });
  ScrollTrigger.create({ trigger: '.booking', start: 'top 85%', once: true, onEnter: () => gsap.from('.booking > *:not(.booking__ok)', { opacity: 0, y: 24, duration: 0.7, stagger: 0.06, ease: 'power3.out' }) });

  // gallery: a horizontal walk past the posters on wide screens
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const track = $('.gallery__track');
    const dist = () => Math.max(0, track.scrollWidth - (innerWidth - track.getBoundingClientRect().left));
    gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.gallery', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.5, invalidateOnRefresh: true } });
    gsap.from('.poster', { y: 60, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.gallery', start: 'top 70%', once: true } });
  });
  mm.add('(max-width: 900px)', () => {
    ScrollTrigger.batch('.poster', { start: 'top 92%', once: true, onEnter: (els) => gsap.from(els, { opacity: 0, y: 30, duration: 0.8, stagger: 0.08, ease: 'power3.out' }) });
  });
}

/* ------------------------------------------------------------ boot */
(async function boot() {
  const fontsReady = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();
  await Promise.race([fontsReady, new Promise((r) => setTimeout(r, 2200))]);
  if (!gsap) { HX.ready(); return; }
  choreography();
  if (!RM) intro(); else shimmer();
  requestAnimationFrame(() => {
    HX.ready();
    ScrollTrigger.refresh();
  });
  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (buildHero() && !RM) { shimmer(); } ScrollTrigger.refresh(); }, 220);
  });
  HX.on('pause', () => shimmerTl && shimmerTl.pause());
  HX.on('play', () => shimmerTl && shimmerTl.resume());
})();
