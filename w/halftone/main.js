import { createCup } from './cup.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, paused: false, on() {}, ready() {} };
document.documentElement.classList.add('js');
const mobile = HX.device === 'mobile' || window.innerWidth < 760;
const fine = window.matchMedia('(pointer: fine)').matches && !HX.embed;
const RM = !!HX.reducedMotion;
const gsap = window.gsap;
const ST = window.ScrollTrigger;
if (gsap && ST) gsap.registerPlugin(ST);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const inr = (n) => '₹' + n.toLocaleString('en-IN');

/* ---------- nav + menu ---------- */
const nav = $('.nav');
const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 30);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
const menuBtn = $('.nav__menu');
const menu = $('#menu');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
  menu.setAttribute('aria-hidden', String(!open));
  menuBtn.textContent = open ? 'Close' : 'Menu';
  document.body.style.overflow = open ? 'hidden' : '';
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
$$('#menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------- hero: the printed cup ---------- */
const hero = $('#hero');
let cup = null;
try {
  cup = createCup($('.hero__gl'), hero, {
    zone: $('.hero__cup'), lite: HX.lite || mobile, interactive: fine, autoLens: !RM,
    onFirstFrame: () => HX.ready(),
  });
} catch (e) { cup = null; }
if (!cup) { hero.classList.add('no-gl'); HX.ready(); }
function heroProgress() {
  const r = hero.getBoundingClientRect();
  if (cup) cup.setScroll(Math.max(0, Math.min(1, -r.top / Math.max(1, r.height * 0.9))));
}
window.addEventListener('scroll', heroProgress, { passive: true });
heroProgress();
if (document.fonts) document.fonts.ready.then(() => { if (cup) cup.relayout(); if (ST) ST.refresh(); });

/* ---------- bag ---------- */
let bag = 0;
const bagLink = $('.nav__bag');
const bagN = $('#bagn');
const toast = $('#toast');
let toastT = 0;
$$('.add').forEach((b) => b.addEventListener('click', () => {
  bag += 1;
  bagN.textContent = String(bag);
  bagLink.setAttribute('aria-label', `Bag, ${bag} item${bag === 1 ? '' : 's'}`);
  bagLink.classList.remove('is-bump'); void bagLink.offsetWidth; bagLink.classList.add('is-bump');
  toast.textContent = `${b.dataset.name}, 250 g, is in your bag. It roasts Tuesday and ships Thursday.`;
  clearTimeout(toastT);
  toastT = setTimeout(() => { toast.textContent = ''; }, 3600);
  b.classList.add('is-added'); b.textContent = 'Added';
  setTimeout(() => { b.classList.remove('is-added'); b.textContent = 'Add 250 g'; }, 1600);
}));

/* ---------- subscription configurator ---------- */
const cfg = $('#cfg');
const bagArt = $('.bag');
function updateCfg() {
  const origin = cfg.querySelector('input[name="origin"]:checked').value;
  const grind = cfg.querySelector('input[name="grind"]:checked').value;
  const size = parseInt(cfg.querySelector('input[name="size"]:checked').value, 10);
  $('#price').textContent = inr(950 * size);
  const words = origin === "Roaster's choice" ? ["Roaster's", 'choice'] : origin.split(' ');
  $('#bag-o1').textContent = words[0];
  $('#bag-o2').textContent = words.slice(1).join(' ');
  $('#bag-g').textContent = `${grind.toUpperCase()} · ${size * 250} G`;
  bagArt.classList.remove('is-bump'); void bagArt.offsetWidth; bagArt.classList.add('is-bump');
}
cfg.addEventListener('change', updateCfg);
cfg.addEventListener('submit', (e) => {
  e.preventDefault();
  const origin = cfg.querySelector('input[name="origin"]:checked').value;
  const size = parseInt(cfg.querySelector('input[name="size"]:checked').value, 10);
  $('.cfg__ok', cfg).textContent = `You're in. ${origin}, ${size * 250} g, roasts Tuesday 24 November and lands by Thursday. We'll confirm on WhatsApp.`;
  const btn = $('button[type="submit"]', cfg);
  btn.textContent = 'Subscribed';
  btn.disabled = true;
});

/* ---------- cafés: open or closed, in Bengaluru time ---------- */
function istNow() {
  const n = new Date();
  const ist = new Date(n.getTime() + (n.getTimezoneOffset() + 330) * 60000);
  return { day: (ist.getDay() + 6) % 7, min: ist.getHours() * 60 + ist.getMinutes(), date: ist };
}
const fmtMin = (m) => { const h = Math.floor(m / 60), mm = m % 60; const ap = h >= 12 ? 'PM' : 'AM'; const hh = ((h + 11) % 12) + 1; return `${hh}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${ap}`; };
function updateCafes() {
  const { day, min } = istNow();
  $$('.cafe').forEach((c) => {
    const hours = JSON.parse(c.dataset.open);
    const [o, cl] = hours[day];
    const st = $('.cafe__state', c);
    const open = min >= o && min < cl;
    st.classList.toggle('is-closed', !open);
    $('span', st).textContent = open ? `Open now · until ${fmtMin(cl)}` : `Closed · opens ${fmtMin(min < o ? o : hours[(day + 1) % 7][0])}`;
  });
}
updateCafes();
setInterval(updateCafes, 60000);

/* ---------- countdown to Monday 9 PM IST ---------- */
function nextClose() {
  const { day, min, date } = istNow();
  let add = (7 - day) % 7;
  if (add === 0 && min >= 21 * 60) add = 7;
  const t = new Date(date);
  t.setDate(t.getDate() + add); t.setHours(21, 0, 0, 0);
  return t.getTime() - date.getTime();
}
let closeAt = Date.now() + nextClose();
function tickCount() {
  let ms = closeAt - Date.now();
  if (ms <= 0) { closeAt = Date.now() + nextClose() + 1000; ms = closeAt - Date.now(); }
  const s = Math.floor(ms / 1000);
  $('#cd-d').textContent = String(Math.floor(s / 86400));
  $('#cd-h').textContent = String(Math.floor(s / 3600) % 24).padStart(2, '0');
  $('#cd-m').textContent = String(Math.floor(s / 60) % 60).padStart(2, '0');
  $('#cd-s').textContent = String(s % 60).padStart(2, '0');
}
tickCount();
setInterval(() => { if (!HX.paused) tickCount(); }, 1000);

/* ---------- roast dates follow the calendar (IST): this week's batch, next roast after the Monday close ---------- */
(() => {
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const f = (d) => `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`;
  const { date } = istNow();
  const roast = new Date(date); roast.setDate(date.getDate() - ((date.getDay() + 5) % 7));
  const ship = new Date(roast); ship.setDate(roast.getDate() + 2);
  const next = new Date(date.getTime() + nextClose()); next.setDate(next.getDate() + 1);
  const mid = $('.mast__mid'); if (mid) mid.textContent = `Roasted ${f(roast)} ${roast.getFullYear()} · Ships ${f(ship)}`;
  const first = $('.cfg__first'); if (first) first.textContent = `first roast ${f(next)}`;
  const bag = document.getElementById('bag-r'); if (bag) bag.textContent = `ROASTED ${String(next.getDate()).padStart(2, '0')}.${String(next.getMonth() + 1).padStart(2, '0')}.${String(next.getFullYear()).slice(2)}`;
})();

/* ---------- brew guide ---------- */
const stepsEls = $$('#steps li');
const STEP_T = [-20, 0, 45, 75, 120, 180];
const ring = $('.brew__ring');
const water = $('.brew__water');
const fill = $('.brew__fill');
const drip = $('.brew__drip');
const clockEl = $('#clock');
const stepName = $('#stepname');
function brewAt(t) {
  let idx = 0;
  STEP_T.forEach((s, i) => { if (t >= s) idx = i; });
  stepsEls.forEach((li, i) => { li.classList.toggle('is-on', i === idx); li.classList.toggle('is-done', i < idx); });
  clockEl.textContent = t < 0 ? 'prep' : `${Math.floor(Math.min(t, 180) / 60)}:${String(Math.floor(Math.min(t, 180) % 60)).padStart(2, '0')}`;
  stepName.textContent = $('h3', stepsEls[idx]).textContent;
  const p = Math.max(0, Math.min(1, t / 180));
  ring.style.strokeDashoffset = String(1 - p);
  let w = 0;
  if (t >= 0 && t < 45) w = 0.35 * Math.min(1, t / 8);
  else if (t >= 45 && t < 75) w = 0.35 + 0.4 * Math.min(1, (t - 45) / 20);
  else if (t >= 75 && t < 120) w = 0.75 + 0.25 * Math.min(1, (t - 75) / 25);
  else if (t >= 120) w = Math.max(0, 1 - (t - 120) / 60);
  water.setAttribute('transform', `translate(0 ${(120 * (1 - w)).toFixed(1)})`);
  fill.setAttribute('transform', `translate(0 ${(80 * (1 - p * 0.92)).toFixed(1)})`);
  drip.style.opacity = t > 2 && t < 178 ? '1' : '0';
}
brewAt(-20);
if (gsap && ST) {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    if (RM) return undefined;
    const pinEl = $('#brewpin');
    pinEl.setAttribute('data-tour', '900');
    const st = ST.create({
      trigger: pinEl, start: 'top top', end: '+=150%', pin: true, scrub: 0.6,
      onUpdate: (self) => brewAt(-20 + self.progress * 205),
    });
    return () => { st.kill(); pinEl.removeAttribute('data-tour'); };
  });
  mm.add('(max-width: 900px)', () => {
    let tl = null;
    const st = ST.create({
      trigger: '#brewpin', start: 'top 75%', end: 'bottom top',
      onToggle: (self) => {
        if (self.isActive && !tl && !RM) {
          const o = { t: -20 };
          tl = gsap.to(o, { t: 185, duration: 9, ease: 'none', repeat: -1, repeatDelay: 1.2, onUpdate: () => brewAt(o.t) });
        } else if (!self.isActive && tl) { tl.kill(); tl = null; }
      },
    });
    return () => { st.kill(); if (tl) tl.kill(); };
  });
}

/* ---------- motion ---------- */
if (gsap && ST && !RM) {
  gsap.from('.mast', { y: -14, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 });
  gsap.from('.hero__t', { y: 34, opacity: 0, duration: 1.1, ease: 'expo.out', delay: 0.15 });
  gsap.from('.hero__bottom > *', { y: 22, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.35 });
  gsap.from('.sticker', { y: 30, rotate: 14, opacity: 0, duration: 1, ease: 'back.out(1.6)', delay: 0.6 });
  gsap.from('.stamp', { scale: 0.4, rotate: -40, opacity: 0, duration: 1, ease: 'back.out(1.7)', delay: 0.7 });

  const rev = $$('[data-reveal]');
  gsap.set(rev, { opacity: 0, y: 40 });
  ST.batch(rev, {
    start: 'top 90%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, overwrite: true }),
  });
  $$('.org').forEach((card) => {
    const bars = $$('.prof dd span', card);
    const segs = $$('.roast__bar i', card);
    gsap.set(bars, { scaleX: 0 });
    ST.create({
      trigger: card, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.to(bars, { scaleX: 1, duration: 1.1, ease: 'expo.out', stagger: 0.1, delay: 0.25 });
        gsap.from(segs, { scaleY: 0, transformOrigin: 'bottom', duration: 0.5, ease: 'back.out(2)', stagger: 0.05, delay: 0.2 });
      },
    });
  });
  $$('.h2').forEach((h) => {
    gsap.from(h, { y: 30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 90%', once: true } });
  });
}

/* ---------- magnetic buttons ---------- */
if (fine && gsap) {
  $$('.magnet').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - (r.left + r.width / 2)) * 0.2, y: (e.clientY - (r.top + r.height / 2)) * 0.3, duration: 0.4, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' }));
  });
}
