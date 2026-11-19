import { createTV } from './tv.js';
import { drawCover, drawEmblem } from './covers.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, paused: false, on() {}, ready() {} };
document.documentElement.classList.add('js');
const mobile = HX.device === 'mobile' || window.innerWidth < 760;
const RM = !!HX.reducedMotion;
const gsap = window.gsap;
const ST = window.ScrollTrigger;
if (gsap && ST) gsap.registerPlugin(ST);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- nav + menu ---------- */
const nav = $('.nav');
const onScrollNav = () => nav.classList.toggle('is-stuck', window.scrollY > 30);
window.addEventListener('scroll', onScrollNav, { passive: true });
onScrollNav();
const menuBtn = $('.nav__menu');
const menu = $('#menu');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
  menu.setAttribute('aria-hidden', String(!open));
  $('.nav__menu-t', menuBtn).textContent = open ? 'Close' : 'Menu';
  document.body.style.overflow = open ? 'hidden' : '';
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
$$('#menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------- the TV ---------- */
let tv = null;
try {
  tv = createTV($('.tv'), { lite: HX.lite || mobile, mobile, boot: !RM, onFirstFrame: () => HX.ready() });
} catch (e) { tv = null; }
if (!tv) { document.documentElement.classList.add('no-gl'); HX.ready(); }

/* DOM static: a short burst of snow over everything, like flipping channels */
const snow = $('.snow');
const sctx = snow.getContext('2d');
let snowImg = null;
function sizeSnow() {
  const s = mobile ? 0.25 : 0.32;
  snow.width = Math.max(32, Math.ceil(window.innerWidth * s));
  snow.height = Math.max(32, Math.ceil(window.innerHeight * s));
  snowImg = null;
}
sizeSnow();
window.addEventListener('resize', sizeSnow);
let snowRun = 0;
function snowBurst(dur = 380, peak = 0.42) {
  if (RM) return;
  const id = ++snowRun;
  const t0 = performance.now();
  const w = snow.width, h = snow.height;
  if (!snowImg) snowImg = sctx.createImageData(w, h);
  const d = snowImg.data;
  (function step(now) {
    if (id !== snowRun) return;
    const a = (now - t0) / dur;
    if (a >= 1) { snow.style.opacity = '0'; return; }
    const env = a < 0.18 ? a / 0.18 : 1 - (a - 0.18) / 0.82;
    for (let y = 0; y < h; y++) {
      const band = Math.random() < 0.07 ? 1.6 : (Math.random() < 0.05 ? 0.3 : 1);
      for (let x = 0; x < w; x++) {
        const v = Math.min(255, Math.random() * 255 * band);
        const i = (y * w + x) * 4;
        d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
      }
    }
    sctx.putImageData(snowImg, 0, 0);
    snow.style.opacity = (env * peak).toFixed(3);
    requestAnimationFrame(step);
  })(t0);
}

/* ---------- OSD: channel display, PLAY / FF / REW, tape counter ---------- */
const osd = $('.osd');
const chDisp = $('#chdisp');
const modeEl = $('#mode');
const tcEl = $('#tc');
const ffEl = $('#ff');
let chTimer = 0;
function showChannel(ch, name) {
  $('b', chDisp).textContent = 'CH ' + ch;
  $('span', chDisp).textContent = name;
  chDisp.classList.add('is-on');
  clearTimeout(chTimer);
  chTimer = setTimeout(() => chDisp.classList.remove('is-on'), 1100);
}
let mode = 'PLAY', modeTimer = 0, lastY = window.scrollY, lastT = performance.now();
function setMode(m) {
  if (m === mode) return;
  mode = m;
  modeEl.textContent = m === 'FF' ? 'FF ▶▶' : m === 'REW' ? 'REW ◀◀' : 'PLAY ▶';
  modeEl.classList.toggle('is-ff', m !== 'PLAY');
  ffEl.textContent = m === 'REW' ? 'REW ◀◀' : 'FF ▶▶';
  ffEl.classList.toggle('is-on', m !== 'PLAY' && osd.classList.contains('is-away'));
}
window.addEventListener('scroll', () => {
  const now = performance.now();
  const v = (window.scrollY - lastY) / Math.max(16, now - lastT);
  lastY = window.scrollY; lastT = now;
  if (Math.abs(v) > 0.5) setMode(v > 0 ? 'FF' : 'REW');
  clearTimeout(modeTimer);
  modeTimer = setTimeout(() => setMode('PLAY'), 420);
}, { passive: true });
let tc = 197;
let tcLast = performance.now();
function tickTC() {
  const now = performance.now();
  const dt = (now - tcLast) / 1000; tcLast = now;
  if (!HX.paused) tc = Math.max(0, tc + dt * (mode === 'FF' ? 9 : mode === 'REW' ? -7 : 1));
  const s = Math.floor(tc);
  tcEl.textContent = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join(':');
}
setInterval(tickTC, 250);

/* channels follow the section at the middle of the screen */
let current = '03';
const sections = $$('[data-ch]');
const chIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const ch = e.target.dataset.ch;
    if (ch === current) return;
    current = ch;
    if (tv) tv.burst(ch);
    snowBurst();
    showChannel(ch, e.target.dataset.chname || '');
    e.target.classList.add('is-glitch');
    setTimeout(() => e.target.classList.remove('is-glitch'), 560);
  });
}, { rootMargin: '-49% 0px -49% 0px' });
sections.forEach((s) => chIO.observe(s));
const heroIO = new IntersectionObserver((e) => osd.classList.toggle('is-away', !e[0].isIntersecting), { rootMargin: '-35% 0px -35% 0px' });
heroIO.observe($('#hero'));
setTimeout(() => showChannel('03', 'STATIC BLOOM TV'), 500);

/* occasional tracking glitches, echoed on the hero title */
(async function glitches() {
  for (;;) {
    await sleep(4200 + Math.random() * 4800);
    if (HX.paused || RM) continue;
    if (tv) tv.glitch(0.32);
    const h = $('#hero');
    if (current === '03' && h) { h.classList.add('is-glitch'); setTimeout(() => h.classList.remove('is-glitch'), 520); }
  }
})();

/* ---------- covers (drawn when they come near) ---------- */
const fontsReady = Promise.race([
  Promise.all([document.fonts.load('40px "Archivo Black"'), document.fonts.load('40px "VT323"')]).catch(() => {}),
  sleep(2200),
]);
const coverSize = mobile ? 420 : 512;
const coverIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    coverIO.unobserve(e.target);
    fontsReady.then(() => { try { drawCover(e.target, coverSize); } catch (err) { /* decorative */ } });
  });
}, { rootMargin: '900px 0px' });
$$('.cover').forEach((c) => coverIO.observe(c));

/* preview buttons: one plays at a time */
$$('.play').forEach((b) => b.addEventListener('click', () => {
  const on = b.getAttribute('aria-pressed') !== 'true';
  $$('.play').forEach((o) => { o.setAttribute('aria-pressed', 'false'); $('.play__t', o).textContent = 'Preview'; });
  if (on) { b.setAttribute('aria-pressed', 'true'); $('.play__t', b).textContent = 'Playing'; }
}));

/* ---------- roster: VCR menu ---------- */
const ROSTER = [
  ['LUNA FAX', 'PORTLAND, OR', 'DREAM POP, TAPE DELAY, LATE NIGHTS', 'NIGHT RECEIVER (LP)', 'FRI 13.08 · BLOOM STAGE'],
  ['MOTH CHOIR', 'SEATTLE, WA', 'SLOWCORE, CELLO, WHISPERED HOOKS', 'SOFT FOCUS (EP)', 'FRI 13.08 · BLOOM STAGE'],
  ['COBALT DREAMHOUSE', 'LOS ANGELES, CA', 'SYNTHWAVE, DRUM MACHINES, BIG CHORUSES', 'REWIND FOREVER (LP)', 'SAT 14.08 · HEADLINER'],
  ['TAPE GHOSTS', 'OAKLAND, CA', 'LO-FI HOUSE, WARPED SAMPLES', 'TRACKING ERROR (SINGLE)', 'SAT 14.08 · STATIC TENT'],
  ['KID HALATION', 'AUSTIN, TX', 'BEDROOM POP, SUNBURNT GUITARS', 'OVEREXPOSED (LP, JULY 24)', 'SUN 15.08 · BLOOM STAGE'],
  ['ECHO MOTEL', 'DENVER, CO', 'SHOEGAZE, WALLS OF REVERB', 'VACANCY (LP)', 'SUN 15.08 · BLOOM STAGE'],
  ['PALE HARBOR RADIO', 'DULUTH, MN', 'INDIE FOLK, AM RADIO WARMTH', 'LONG WAVE (EP)', 'FRI 13.08 · STATIC TENT'],
  ['SOFT TRACKING', 'CHICAGO, IL', 'AMBIENT, FIELD RECORDINGS', 'HEAD CLEANER (LP)', 'FRI 13.08 · SUNRISE SET'],
  ['VELOUR MACHINES', 'BROOKLYN, NY', 'ITALO DISCO, ARPEGGIOS, GLITTER', 'AFTER HOURS ONLY (12 INCH)', 'SUN 15.08 · STATIC TENT'],
  ['JUNIPER HISS', 'MINNEAPOLIS, MN', 'POST-PUNK, TAUT BASS, NO FILLER', 'SIGNAL LOSS (LP)', 'FRI 13.08 · STATIC TENT'],
  ['SATURN MALL', 'SAN DIEGO, CA', 'CITY POP, SAX SOLOS, SUNSET DRIVES', 'FOOD COURT LOVE (SINGLE)', 'SAT 14.08 · BLOOM STAGE'],
  ['LILAC OVERDRIVE', 'PHILADELPHIA, PA', 'NOISE POP, FUZZ, HAND CLAPS', 'PURPLE STATIC (EP)', 'SUN 15.08 · STATIC TENT'],
];
const rosterBtns = $$('#roster-list button');
const pic = $('.vcr__pic');
const emblemCanvas = document.createElement('canvas');
emblemCanvas.width = 320; emblemCanvas.height = 240;
function paintEmblem(name, i) {
  drawEmblem(emblemCanvas, name, i);
  pic.src = emblemCanvas.toDataURL('image/png');
  pic.alt = 'Generated channel card for ' + name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
if (pic) paintEmblem(ROSTER[0][0], 0);
let sel = 0, userPicked = false, rosterOn = false;
function select(i, fromUser) {
  sel = i;
  rosterBtns.forEach((b, k) => b.classList.toggle('is-sel', k === i));
  const r = ROSTER[i];
  $('#r-name').textContent = r[0]; $('#r-from').textContent = r[1]; $('#r-sound').textContent = r[2];
  $('#r-latest').textContent = r[3]; $('#r-live').textContent = r[4];
  if (pic) {
    paintEmblem(r[0], i);
    if (!RM) { pic.classList.remove('is-flick'); void pic.offsetWidth; pic.classList.add('is-flick'); }
  }
  if (fromUser) userPicked = true;
}
rosterBtns.forEach((b, i) => {
  b.addEventListener('click', () => select(i, true));
  b.addEventListener('mouseenter', () => { if (window.matchMedia('(pointer: fine)').matches) select(i, true); });
  b.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = (i + (e.key === 'ArrowDown' ? 1 : -1) + rosterBtns.length) % rosterBtns.length;
      rosterBtns[n].focus(); select(n, true);
    }
  });
});
fontsReady.then(() => { if (pic) paintEmblem(ROSTER[sel][0], sel); });
new IntersectionObserver((e) => { rosterOn = e[0].isIntersecting; }, { rootMargin: '0px' }).observe($('#roster'));
setInterval(() => {
  if (!rosterOn || userPicked || HX.paused || RM) return;
  const maxI = window.innerWidth < 640 ? 7 : rosterBtns.length;
  select((sel + 1) % maxI, false);
}, 2300);

/* ---------- shop ---------- */
let bag = 0;
const bagN = $('#bagn');
const bagLink = $('.nav__bag');
const toast = $('#toast');
let toastT = 0;
$$('.opts').forEach((g) => {
  const opts = $$('.opt', g);
  opts.forEach((o) => o.addEventListener('click', () => {
    opts.forEach((x) => { x.classList.toggle('is-on', x === o); x.setAttribute('aria-checked', String(x === o)); });
  }));
});
$$('.add').forEach((b) => b.addEventListener('click', () => {
  bag += 1;
  bagN.textContent = String(bag);
  bagLink.setAttribute('aria-label', `Bag, ${bag} item${bag === 1 ? '' : 's'}`);
  bagLink.classList.remove('is-bump'); void bagLink.offsetWidth; bagLink.classList.add('is-bump');
  const card = b.closest('.good');
  const opt = card ? $('.opt.is-on', card) : null;
  toast.textContent = `● REC · ${b.dataset.name}${opt ? ' (' + opt.textContent + ')' : ''} added to your bag`;
  clearTimeout(toastT);
  toastT = setTimeout(() => { toast.textContent = ''; }, 3200);
  b.classList.add('is-added'); b.textContent = 'Added';
  setTimeout(() => { b.classList.remove('is-added'); b.textContent = 'Add to bag'; }, 1600);
}));
const tapeArt = $('.good__art--tape');
if (tapeArt && !RM) new IntersectionObserver((e) => tapeArt.classList.toggle('is-spin', e[0].isIntersecting)).observe(tapeArt);

/* ---------- tape club ---------- */
const form = $('#club-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('input', form);
  const msg = $('.rec-form__msg', form);
  const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value.trim());
  input.classList.toggle('is-bad', !ok);
  if (!ok) { msg.textContent = 'that tape is blank. add an email to record.'; return; }
  form.classList.add('is-done');
  msg.textContent = '● REC · you are on the tape. first mixtape lands friday.';
  const btn = $('button', form);
  btn.disabled = true;
  btn.lastChild.textContent = 'Saved';
});

/* ---------- motion ---------- */
if (gsap && ST && !RM) {
  gsap.from('.hero__kick', { y: -16, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.25 });
  gsap.from('.hero__a', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.35 });
  gsap.from('.hero__b', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.5 });
  gsap.from('.hero__foot > *', { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.6 });

  const rev = $$('[data-reveal]');
  gsap.set(rev, { opacity: 0, y: 40 });
  ST.batch(rev, {
    start: 'top 92%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.07, overwrite: true }),
  });
  $$('.day__head').forEach((el) => {
    gsap.fromTo(el, { scale: 0.94 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: true } });
  });
}
if (document.fonts) document.fonts.ready.then(() => { if (ST) ST.refresh(); });
