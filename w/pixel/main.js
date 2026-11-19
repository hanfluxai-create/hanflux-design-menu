import { startWorld, paintSprites } from './world.js';
import { sprite } from './sprites.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, ready() {}, on() {} };
const gsap = window.gsap;
const reduced = !!HX.reducedMotion;
if (reduced) document.documentElement.classList.add('reduced');
const phone = () => innerWidth < 760;

/* smooth scroll, never inside the menu frame */
let lenis = null;
if (!HX.embed && !reduced && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.12 });
  window.__lenis = lenis;
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

paintSprites();

/* HUD */
const elScore = document.querySelector('[data-score]'), elCoins = document.querySelector('[data-coins]'), elWorld = document.querySelector('[data-world]');
let pending = null;
const world = startWorld(document.getElementById('world'), {
  onScore(score, coins) {
    pending = [score, coins];
  }
});
setInterval(() => {
  if (!pending) return;
  elScore.textContent = String(pending[0]).padStart(6, '0');
  elCoins.textContent = String(pending[1] % 100).padStart(2, '0');
  pending = null;
}, 120);

/* levels follow the page */
const levels = [...document.querySelectorAll('[data-level]')];
const foot = document.querySelector('.foot');
let curLevel = 1;
function onScroll() {
  const vh = innerHeight;
  let lv = 1;
  for (const el of levels) if (el.getBoundingClientRect().top < vh * 0.6) lv = +el.dataset.level;
  if (lv !== curLevel) {
    curLevel = lv;
    world.setLevel(lv);
    elWorld.textContent = '1-' + lv;
  }
  const fr = foot.getBoundingClientRect();
  const d = Math.min(1, Math.max(0, (vh - fr.top) / Math.max(1, Math.min(fr.height, vh * 1.4))));
  world.setDawn(d * d * (3 - 2 * d));
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* menu: the pause screen */
const menuBtn = document.querySelector('[data-menu-btn]'), menu = document.querySelector('[data-menu]');
const setMenu = (open) => {
  menuBtn.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (lenis) open ? lenis.stop() : lenis.start();
};
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

/* anchors */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const el = id.length > 1 && document.querySelector(id);
  if (!el) return;
  e.preventDefault();
  if (a.dataset.pick) pick(a.dataset.pick);
  const off = id === '#top' ? 0 : el.getBoundingClientRect().top + scrollY - (id === '#book' ? -innerHeight * 0.32 : 0);
  lenis ? lenis.scrollTo(off, { duration: 1.4 }) : scrollTo({ top: off, behavior: reduced ? 'auto' : 'smooth' });
});

/* pop-in panels, stepped like a game */
const pops = [...document.querySelectorAll('.panel, .perk')];
pops.forEach((p) => p.setAttribute('data-pop', ''));
const io = new IntersectionObserver((ents) => ents.forEach((en) => {
  if (!en.isIntersecting) return;
  const sibs = [...en.target.parentElement.children];
  en.target.style.transitionDelay = (Math.max(0, sibs.indexOf(en.target)) % 6) * 0.07 + 's';
  en.target.classList.add('is-in');
  io.unobserve(en.target);
}), { rootMargin: '0px 0px -6% 0px' });
pops.forEach((p) => (reduced ? p.classList.add('is-in') : io.observe(p)));

/* stat bars fill in steps */
const stats = document.querySelector('.stats');
if (stats && !reduced) {
  const bars = [...stats.querySelectorAll('.bar')];
  bars.forEach((b) => { b.dataset.v = b.style.getPropertyValue('--v'); b.style.setProperty('--v', '0'); });
  const sio = new IntersectionObserver((e) => { if (e[0].isIntersecting) { bars.forEach((b, i) => setTimeout(() => b.style.setProperty('--v', b.dataset.v), i * 120)); sio.disconnect(); } }, { rootMargin: '0px 0px -10% 0px' });
  sio.observe(stats);
}

/* the battle station illustration */
const st = document.querySelector('[data-station]');
if (st) {
  const x = st.getContext('2d');
  x.imageSmoothingEnabled = false;
  const R = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const dith = (a, b, w, h, c, d) => { x.fillStyle = c; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if ((BAY[(((b + j) & 3) << 2) | ((a + i) & 3)] + 0.5) / 16 < d) x.fillRect(a + i, b + j, 1, 1); };
  const stars = Array.from({ length: 22 }, (_, i) => ({ x: (i * 37) % 58, y: (i * 23) % 32, s: 1 + (i % 3) }));
  let visible = false, last = 0;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(st);
  const draw = (t) => {
    // wall
    R(0, 0, 160, 100, '#120a2a');
    dith(0, 0, 160, 40, '#1a0f3a', 0.5);
    R(0, 6, 160, 2, '#ff5fa2'); dith(0, 8, 160, 6, '#ff5fa2', 0.18); dith(0, 3, 160, 3, '#ff5fa2', 0.12);
    // shelf with trophy
    R(8, 30, 30, 2, '#3d3657'); x.drawImage(sprite('trophy'), 10, 14); x.drawImage(sprite('crown'), 24, 15);
    // poster
    R(130, 14, 22, 18, '#1d0f40'); R(131, 15, 20, 16, '#3a1d6e'); x.drawImage(sprite('idle1'), 133, 13);
    // desk
    R(0, 70, 160, 3, '#5e5878'); R(0, 73, 160, 8, '#2a2440'); R(0, 81, 160, 19, '#0c0620');
    dith(0, 81, 160, 6, '#6ff3ff', 0.18 + 0.08 * Math.sin(t * 2));
    R(6, 81, 3, 19, '#1e1a33'); R(151, 81, 3, 19, '#1e1a33');
    // monitor + game
    R(44, 16, 70, 44, '#1e1a33'); R(44, 16, 70, 1, '#5e5878'); R(47, 19, 64, 37, '#05030e');
    stars.forEach((s) => { const sx = 47 + ((s.x * 1.1 - t * 14 * s.s) % 64 + 64) % 64; R(Math.floor(sx), 20 + s.y, 1, 1, s.s > 2 ? '#ffffff' : '#6f5aa8'); });
    const shipY = 33 + Math.round(Math.sin(t * 1.7) * 9);
    R(54, shipY, 6, 3, '#6ff3ff'); R(52, shipY + 1, 2, 1, '#ff9a3d'); R(57, shipY - 1, 2, 1, '#ffffff'); R(57, shipY + 3, 2, 1, '#2a9ec4');
    for (let i = 0; i < 3; i++) { const lx = 62 + ((t * 60 + i * 18) % 46); R(Math.floor(lx), shipY + 1, 3, 1, '#3dff8a'); }
    for (let i = 0; i < 3; i++) { const ex = 100 - ((t * 10 + i * 15) % 40), ey = 24 + i * 10 + Math.round(Math.sin(t * 3 + i) * 2); R(Math.floor(ex), ey, 4, 3, '#ff5fa2'); R(Math.floor(ex) + 1, ey + 1, 1, 1, '#ffffff'); }
    R(48, 20, 20, 3, '#05030e'); x.fillStyle = '#ffd34d'; [0, 1, 2, 3, 4].forEach((i) => R(49 + i * 4, 21, 3, 1, i < 3 + (Math.floor(t) % 3) ? '#ffd34d' : '#3d3657'));
    R(76, 60, 6, 6, '#3d3657'); R(70, 66, 18, 4, '#3d3657');
    // keyboard with rgb wave
    R(46, 64, 44, 6, '#1e1a33');
    for (let i = 0; i < 20; i++) for (let j = 0; j < 2; j++) { const hue = ['#ff5fa2', '#ffd34d', '#3dff8a', '#6ff3ff', '#7b6cf0'][(i + Math.floor(t * 8)) % 5]; R(47 + i * 2, 65 + j * 2, 1, 1, hue); }
    // mouse + pad
    R(96, 66, 22, 4, '#160828'); R(106, 65, 4, 4, '#ffffff'); R(107, 65, 2, 1, '#3dff8a');
    // chai on the desk
    x.drawImage(sprite('chai'), 22, 55);
    // headset on stand
    R(126, 50, 2, 20, '#5e5878'); R(121, 68, 12, 2, '#5e5878'); x.drawImage(sprite('headset'), 119, 36);
    // tower
    R(138, 34, 18, 36, '#1e1a33'); R(140, 36, 14, 28, '#05030e'); R(138, 34, 18, 1, '#5e5878');
    [42, 52].forEach((fy, i) => { const c = ['#ff5fa2', '#3dff8a', '#6ff3ff', '#ffd34d'][(Math.floor(t * 3) + i) % 4]; R(143, fy, 8, 8, c); R(145, fy + 2, 4, 4, '#05030e'); R(146, fy + 3, 2, 2, c); });
    dith(134, 70, 26, 2, '#3dff8a', 0.4);
    // gaming chair in the foreground: winged back, headrest pillow, racing stripe
    R(5, 52, 30, 48, '#160828');
    R(7, 54, 26, 46, '#ff5fa2'); R(7, 54, 3, 46, '#b8306f'); R(30, 54, 3, 46, '#b8306f');
    R(5, 64, 4, 20, '#160828'); R(3, 66, 4, 16, '#ff5fa2'); R(31, 64, 4, 20, '#160828'); R(33, 66, 4, 16, '#ff5fa2');
    R(9, 50, 22, 4, '#160828'); R(11, 48, 18, 4, '#160828'); R(12, 49, 16, 3, '#ff5fa2');
    R(17, 56, 6, 44, '#ffffff'); R(17, 56, 1, 44, '#c7bff0');
    R(12, 58, 16, 6, '#160828'); R(13, 59, 14, 4, '#ffffff'); R(13, 62, 14, 1, '#c7bff0');
    R(15, 70, 10, 1, '#b8306f'); R(15, 76, 10, 1, '#b8306f');
  };
  const loop = (now) => { requestAnimationFrame(loop); if (!visible || now - last < 70) return; last = now; draw(now / 1000); };
  draw(0);
  requestAnimationFrame(loop);
}

/* booking */
const form = document.querySelector('[data-book]');
const total = form.querySelector('[data-total]'), hoursOut = form.querySelector('[data-hours]');
let hours = 2;
const dayLabels = form.querySelectorAll('[data-days] span');
const now = new Date();
const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
dayLabels.forEach((s, i) => { if (i < 2) return; const d = new Date(now.getTime() + i * 864e5); s.textContent = wd[d.getDay()] + ' ' + d.getDate(); });
function calc() {
  const k = form.querySelector('input[name="kind"]:checked');
  const rate = +k.dataset.rate, night = k.dataset.unit === 'night';
  form.querySelector('.stepper').style.opacity = night ? 0.4 : 1;
  const amt = night ? rate : rate * hours;
  total.innerHTML = '<i class="rs">₹</i>' + amt.toLocaleString('en-IN');
}
function pick(v) { const r = form.querySelector(`input[name="kind"][value="${v}"]`); if (r) { r.checked = true; calc(); } }
form.addEventListener('change', calc);
form.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => { hours = Math.min(8, Math.max(1, hours + +b.dataset.step)); hoursOut.textContent = hours; calc(); }));
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true;
  ['name', 'phone'].forEach((n) => {
    const inp = form.querySelector(`[name="${n}"]`), bad = n === 'phone' ? inp.value.replace(/\D/g, '').length < 10 : !inp.value.trim();
    inp.closest('.field').classList.toggle('is-bad', bad); if (bad) ok = false;
  });
  if (!ok) { form.querySelector('.is-bad input').focus(); return; }
  const k = form.querySelector('input[name="kind"]:checked');
  const day = form.querySelector('input[name="day"]:checked').nextElementSibling.textContent;
  const time = form.querySelector('[name="time"]').value;
  const tag = form.querySelector('[name="name"]').value.trim().slice(0, 24);
  const what = { station: 'Station 17', console: 'Console pod 3', squad: 'Squad room B', night: 'Your night pass' }[k.value];
  form.querySelector('[data-done-msg]').textContent = `${what} is locked in for ${tag}, ${day.toLowerCase() === 'today' || day.toLowerCase() === 'tomorrow' ? day.toLowerCase() : day} at ${time}. Confirmation is on its way to your WhatsApp.`;
  form.classList.add('is-done');
  form.querySelector('[data-done]').hidden = false;
});
form.querySelector('[data-again]').addEventListener('click', () => { form.classList.remove('is-done'); form.querySelector('[data-done]').hidden = true; form.reset(); hours = 2; hoursOut.textContent = 2; calc(); });
calc();

/* footer countdown */
const cnt = document.querySelector('[data-count]');
let c = 9;
setInterval(() => { c = c <= 0 ? 9 : c - 1; cnt.textContent = c; }, 1000);

if (gsap && !reduced) {
  gsap.from('.hero__inner > *', { y: 24, opacity: 0, duration: 0.6, ease: 'steps(4)', stagger: 0.12, delay: 0.2 });
}
