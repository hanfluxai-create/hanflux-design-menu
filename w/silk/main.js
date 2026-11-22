// Selvine Salon & Spa · page behaviour
import { initSilk } from './silk.js';
import { paintPortrait } from './hair.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, ready() {}, on() {} };
const { gsap, ScrollTrigger, SplitText } = window;
const root = document.documentElement;
root.classList.add('js');

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth01 = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduce = !!HX.reducedMotion;
const isPhone = () => innerWidth <= 760;
const G = !!(gsap && ScrollTrigger);
if (G) {
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
}
const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready.catch(() => {}) : Promise.resolve();

/* ---------------- ready signal for the menu frame ---------------- */
let fontsDone = false, readySent = false, silk = null, silkDrawn = false;
function tryReady() {
  if (readySent || !fontsDone || (silk && !silkDrawn)) return;
  readySent = true;
  HX.ready();
}
setTimeout(() => { if (!readySent) { readySent = true; HX.ready(); } }, 5000);

/* ---------------- smooth scroll (real desktop visitors only) ---------------- */
let lenis = null;
if (G && !HX.embed && canHover && !reduce && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.95 });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const docTop = (el) => el.getBoundingClientRect().top + scrollY;
function goTo(y) {
  y = Math.max(0, Math.round(y));
  if (lenis) lenis.scrollTo(y, { duration: 1.6 });
  else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
}

/* ---------------- nav and the full-screen menu ---------------- */
const nav = $('.nav');
const menuBtn = $('.nav__menu');
const menu = $('#menu');
function navSolid() { nav.classList.toggle('is-solid', scrollY > 40); }
addEventListener('scroll', navSolid, { passive: true });
navSolid();
function openMenu() {
  root.classList.add('menu-open');
  menuBtn.setAttribute('aria-expanded', 'true');
  menuBtn.setAttribute('aria-label', 'Close menu');
  menu.setAttribute('aria-hidden', 'false');
  if (lenis) lenis.stop();
  if (G) gsap.fromTo($$('.menu__links a, .menu__foot > *', menu), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.045, overwrite: true });
  const first = $('.menu__links a', menu);
  if (first) first.focus({ preventScroll: true });
}
function closeMenu(refocus) {
  if (!root.classList.contains('menu-open')) return;
  root.classList.remove('menu-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-label', 'Open menu');
  menu.setAttribute('aria-hidden', 'true');
  if (lenis) lenis.start();
  if (refocus) menuBtn.focus({ preventScroll: true });
}
menuBtn.addEventListener('click', () => (root.classList.contains('menu-open') ? closeMenu(true) : openMenu()));

/* ---------------- the silk ---------------- */
const servicesEl = $('#services');
const bookEl = $('#book');
const stageEl = $('.book__stage');
const silkCanvas = $('.silk');
const portraitLayout = () => innerWidth <= 760 || (innerWidth <= 1080 && innerWidth < innerHeight);
let servValue = 0, canvasFade = 0, stageH = stageEl.offsetHeight;
const silkState = { serv: 0, ribbon: false, fold: 0 };
function silkStateNow() {
  const vh = innerHeight || 1;
  const top = bookEl.getBoundingClientRect().top;
  const rib = top < vh * 1.01;
  silkState.ribbon = rib;
  silkState.fold = rib ? smooth01((vh - top) / (vh * 0.78)) : 0;
  silkState.serv = servValue;
  // on phones the ribbon lives in the stage above the form: let it go once the stage has scrolled away
  const fade = portraitLayout() ? smooth01((-top - stageH * 0.45) / (vh * 0.22)) : 0;
  if (Math.abs(fade - canvasFade) > 0.004) { canvasFade = fade; silkCanvas.style.opacity = fade > 0.004 ? (1 - fade).toFixed(3) : ''; }
  return silkState;
}
try {
  silk = initSilk(silkCanvas, { state: silkStateNow, onFirstFrame: () => { silkDrawn = true; tryReady(); } });
} catch (e) { silk = null; }
if (!silk) root.classList.add('no-webgl');
else {
  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
    silk.setActive(seen.size > 0);
  }, { rootMargin: '40px 0px' });
  $$('[data-silk]').forEach((el) => io.observe(el));
}

/* ---------------- services: pinned, the silk changes colour per service ---------------- */
const tabs = $$('.tab', servicesEl);
const panels = $$('.panel', servicesEl);
const progI = $('.services__progress i', servicesEl);
const TONE = ['dark', 'light', 'light', 'light', 'light'];
const TINT = ['#4b2137', '#dcae9f', '#8d9c84', '#c9a46a', '#cfbea9'];
const PIN = 2.3, STEP = 0.5;
let curTab = -1, pinST = null;
function setTab(k) {
  if (k === curTab) return;
  curTab = k;
  tabs.forEach((t, i) => { const on = i === k; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
  panels.forEach((p, i) => p.classList.toggle('is-on', i === k));
  servicesEl.dataset.tone = TONE[k];
  servicesEl.style.setProperty('--tint', TINT[k]);
}
function applyServ(p) {
  const x = (p * PIN) / STEP;
  servValue = clamp(x, 0, 4) / 4;
  setTab(clamp(Math.round(x), 0, 4));
  if (progI) progI.style.transform = `scaleX(${clamp(x / 4, 0, 1).toFixed(4)})`;
}
function tabY(k) { return pinST ? pinST.start + k * STEP * innerHeight + 2 : docTop(servicesEl); }
setTab(0);
if (G && !reduce) {
  pinST = ScrollTrigger.create({
    trigger: servicesEl, start: 'top top', end: () => '+=' + Math.round(innerHeight * PIN),
    pin: true, anticipatePin: 1, invalidateOnRefresh: true,
    onUpdate: (self) => applyServ(self.progress), onRefresh: (self) => applyServ(self.progress)
  });
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => {
    if (pinST) goTo(tabY(i));
    else { setTab(i); servValue = i / 4; }
  });
  t.addEventListener('keydown', (e) => {
    let j = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % tabs.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = tabs.length - 1;
    if (j < 0) return;
    e.preventDefault();
    tabs[j].focus({ preventScroll: true });
    tabs[j].click();
  });
});

/* ---------------- anchors, with service and stylist presets ---------------- */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.classList.contains('skip')) return;
  const id = a.getAttribute('href');
  const el = id.length > 1 && id !== '#top' ? $(id) : null;
  if (id !== '#top' && !el) return;
  e.preventDefault();
  closeMenu(false);
  if (a.dataset.svc) presetService(a.dataset.svc);
  if (a.dataset.stylist) presetStylist(a.dataset.stylist);
  let y = 0;
  if (a.dataset.tab != null) y = tabY(+a.dataset.tab);
  else if (el === servicesEl) y = tabY(0);
  else if (el) y = docTop(el) - (el === bookEl && isPhone() ? -innerHeight * 0.2 : 0);
  goTo(y);
});

/* ---------------- before and after ---------------- */
const ba = $('[data-ba]');
const baRange = $('.ba__range', ba);
const cvBefore = $('[data-ba-before]', ba);
const cvAfter = $('[data-ba-after]', ba);
let baTouched = false, baPaintedW = 0, sweep = null;
const setBA = (v) => ba.style.setProperty('--x', v.toFixed(2) + '%');
function paintBA() {
  const w = cvBefore.clientWidth;
  if (!w || Math.abs(w - baPaintedW) < 2) return;
  baPaintedW = w;
  paintPortrait(cvBefore, 'before');
  paintPortrait(cvAfter, 'after');
}
function stopSweep() { baTouched = true; if (sweep) { sweep.kill(); sweep = null; } }
baRange.addEventListener('input', () => { stopSweep(); setBA(+baRange.value); });
ba.addEventListener('pointerdown', stopSweep, { passive: true });
new IntersectionObserver((entries) => { if (entries[0].isIntersecting) paintBA(); }, { rootMargin: '900px 0px' }).observe(ba);
if (G && !reduce) {
  const sv = { v: 50 };
  sweep = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: 'sine.inOut' }, onUpdate: () => { setBA(sv.v); baRange.value = String(Math.round(sv.v)); } })
    .to(sv, { v: 27, duration: 2.3 })
    .to(sv, { v: 73, duration: 3.6 })
    .to(sv, { v: 50, duration: 2.2 });
  ScrollTrigger.create({ trigger: ba, start: 'top 88%', end: 'bottom 8%', onToggle: (self) => { if (sweep && !baTouched) (self.isActive ? sweep.play() : sweep.pause()); } });
}

/* ---------------- bridal ornament draws in ---------------- */
const orns = $$('.bridal__orn .orn').filter((p) => !p.hasAttribute('stroke-dasharray'));
orns.forEach((p) => { p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1'; p.style.strokeDashoffset = (G && !reduce) ? '1' : '0'; });
if (G && !reduce) {
  gsap.to(orns, { strokeDashoffset: 0, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: '.bridal', start: 'top 82%', end: 'top 12%', scrub: 0.8 } });
}

/* ---------------- membership card and savings ---------------- */
const ccard = $('[data-tilt]');
const cvis = $('.circle__visual');
if (canHover && !HX.embed && !reduce) {
  cvis.addEventListener('pointermove', (e) => {
    const r = cvis.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
    ccard.style.setProperty('--ry', (nx * 24 - 6).toFixed(2) + 'deg');
    ccard.style.setProperty('--rx', (-ny * 16 + 5).toFixed(2) + 'deg');
  });
  cvis.addEventListener('pointerleave', () => { ccard.style.removeProperty('--ry'); ccard.style.removeProperty('--rx'); });
} else if (G && !reduce) {
  ccard.style.transition = 'none';
  const o = { t: 0 };
  const sway = gsap.to(o, { t: 1, duration: 4.6, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true,
    onUpdate: () => { ccard.style.setProperty('--ry', (-17 + o.t * 15).toFixed(2) + 'deg'); ccard.style.setProperty('--rx', (10 - o.t * 5).toFixed(2) + 'deg'); } });
  ScrollTrigger.create({ trigger: cvis, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? sway.play() : sway.pause()) });
}

function radios(btns, onPick) {
  const pick = (i, user) => {
    btns.forEach((b, k) => { const on = k === i; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
    onPick(i, user);
  };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => { if (!b.disabled) pick(i, true); });
    b.addEventListener('keydown', (e) => {
      let j = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = i + 1;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = i - 1;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = btns.length - 1;
      if (j < 0 && e.key !== 'ArrowLeft' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const dir = j >= i ? 1 : -1;
      j = (j + btns.length) % btns.length;
      for (let n = 0; n < btns.length && btns[j].disabled; n++) j = (j + dir + btns.length) % btns.length;
      pick(j, true);
      btns[j].focus();
    });
  });
  const checked = btns.findIndex((b) => b.getAttribute('aria-checked') === 'true');
  btns.forEach((b, k) => { b.tabIndex = k === Math.max(0, checked) ? 0 : -1; });
  return pick;
}

const saveEl = $('[data-save]');
let saveNow = 5401;
const savingsFor = (m) => m * 12 * 0.15 + 4 * 800 + 3200 - 9999;
const segBtns = $$('.seg button');
radios(segBtns, (i) => {
  const to = savingsFor(+segBtns[i].dataset.spend);
  if (!G || reduce) { saveNow = to; saveEl.textContent = inr(to); return; }
  const o = { v: saveNow };
  gsap.to(o, { v: to, duration: 0.9, ease: 'power3.out', overwrite: true, onUpdate: () => { saveNow = o.v; saveEl.textContent = inr(o.v); } });
});

/* ---------------- booking ---------------- */
const form = $('.booker');
const sel = $('#bk-svc');
const whoBtns = $$('.who button');
const dayBtns = $$('.days button');
const slotBtns = $$('.slots button');
const nameIn = $('#bk-name');
const phoneIn = $('#bk-phone');
const errEl = $('[data-err]');
const booked = $('.booked', form);
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOWL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const now = new Date();
const dates = dayBtns.map((b, i) => {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
  b.querySelector('small').textContent = i === 0 ? 'Today' : DOW[d.getDay()];
  b.querySelector('b').textContent = String(d.getDate());
  b.setAttribute('aria-label', `${i === 0 ? 'Today, ' : ''}${DOWL[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`);
  return d;
});
{
  const a = dates[0], z = dates[dates.length - 1], m = $('[data-month]');
  m.textContent = a.getMonth() === z.getMonth() ? `${MON[a.getMonth()]} ${a.getFullYear()}`
    : (a.getFullYear() === z.getFullYear() ? `${MON[a.getMonth()]} and ${MON[z.getMonth()]} ${z.getFullYear()}` : `${MON[a.getMonth()]} ${a.getFullYear()} and ${MON[z.getMonth()]} ${z.getFullYear()}`);
}
const slotMin = (t) => { const m = t.match(/(\d+):(\d+)\s*(AM|PM)/); let h = +m[1] % 12; if (m[3] === 'PM') h += 12; return h * 60 + +m[2]; };
let who = 'Any', whoManual = false, dayI = 0, slotT = '5:30 PM';
const dayLabel = (i) => (i === 0 ? 'Today' : `${DOW[dates[i].getDay()]} ${dates[i].getDate()}`);
const dayLong = (i) => `${i === 0 ? 'today, ' : ''}${DOWL[dates[i].getDay()]} ${dates[i].getDate()} ${MON[dates[i].getMonth()]}`;
function svcInfo() {
  const o = sel.options[sel.selectedIndex];
  return { v: o.value, name: o.textContent.split(' · ')[0], p: o.dataset.p, d: o.dataset.d, who: o.dataset.who };
}
function summary() {
  const s = svcInfo();
  $('[data-sum-svc]').textContent = s.name;
  $('[data-sum-who]').textContent = s.v === 'circle' ? 'our front desk' : (who === 'Any' ? 'any senior stylist' : who);
  $('[data-sum-when]').textContent = `${dayLabel(dayI)} · ${slotT}`;
  $('[data-sum-dur]').textContent = s.d;
  $('[data-sum-price]').textContent = s.p;
}
const pickWho = radios(whoBtns, (i, user) => { who = whoBtns[i].dataset.who; if (user) whoManual = true; summary(); });
const pickSlot = radios(slotBtns, (i) => { slotT = slotBtns[i].textContent.trim(); summary(); });
function lockPastSlots() {
  const cut = now.getHours() * 60 + now.getMinutes() + 30;
  let firstOpen = -1;
  slotBtns.forEach((b, i) => {
    const past = dayI === 0 && slotMin(b.textContent) <= cut;
    b.disabled = past;
    if (past) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
    if (!past && firstOpen < 0) firstOpen = i;
  });
  const cur = slotBtns.findIndex((b) => b.getAttribute('aria-checked') === 'true');
  if (firstOpen >= 0 && (cur < 0 || slotBtns[cur].disabled)) {
    const pref = slotBtns.findIndex((b) => !b.disabled && slotMin(b.textContent) >= slotMin('5:30 PM'));
    pickSlot(pref >= 0 ? pref : firstOpen, false);
  }
  return firstOpen;
}
const pickDay = radios(dayBtns, (i) => { dayI = i; lockPastSlots(); summary(); });
if (lockPastSlots() < 0) pickDay(1, false);
function presetService(v) {
  if (!sel.querySelector(`option[value="${v}"]`)) return;
  sel.value = v;
  sel.dispatchEvent(new Event('change'));
}
function presetStylist(name) {
  const i = whoBtns.findIndex((b) => b.dataset.who === name);
  if (i >= 0) { pickWho(i, true); }
}
sel.addEventListener('change', () => {
  const s = svcInfo();
  if (!whoManual) { const i = whoBtns.findIndex((b) => b.dataset.who === s.who); pickWho(i >= 0 ? i : 0, false); }
  summary();
});
summary();
[nameIn, phoneIn].forEach((el) => el.addEventListener('input', () => { el.removeAttribute('aria-invalid'); errEl.textContent = ''; }));
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameIn.value.trim();
  const digits = phoneIn.value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  if (name.length < 2) { errEl.textContent = 'Please add your name, so we know who to expect.'; nameIn.setAttribute('aria-invalid', 'true'); nameIn.focus(); return; }
  if (!/^[6-9]\d{9}$/.test(digits)) { errEl.textContent = 'Please enter a 10-digit mobile number for your WhatsApp confirmation.'; phoneIn.setAttribute('aria-invalid', 'true'); phoneIn.focus(); return; }
  errEl.textContent = '';
  const s = svcInfo();
  const withWho = s.v === 'circle' ? 'set up at the front desk' : (who === 'Any' ? 'with a senior stylist' : `with ${who}`);
  $('[data-booked-text]').textContent = `Thank you, ${name.split(/\s+/)[0]}. ${s.name} ${withWho}, ${dayLong(dayI)} at ${slotT}. Your confirmation is on its way to WhatsApp on +91 ${digits.slice(0, 5)} ${digits.slice(5)}.`;
  form.classList.add('is-done');
  booked.hidden = false;
  if (G) gsap.fromTo(booked, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' });
  const h = $('h3', booked);
  h.setAttribute('tabindex', '-1');
  h.focus({ preventScroll: true });
});
$('[data-rebook]').addEventListener('click', () => {
  form.classList.remove('is-done');
  booked.hidden = true;
  nameIn.focus();
});

/* ---------------- WhatsApp chat (a demo conversation, nothing is sent) ---------------- */
const wa = $('.wa');
const waBody = $('.wa__body', wa);
let waOpener = null;
const ANSWERS = [
  'Hair spa ritual slots this week: Tuesday at 4:00 PM and Thursday at 11:30 AM. It is ₹2,200 for 45 minutes. Shall I hold one for you?',
  'Ruhi has bridal trials on Thursday at 10:00 AM and Saturday at 2:30 PM. A trial is ₹4,500 and fully adjusted when you book a package.',
  'Selvine Circle is ₹9,999 a year: 15% off every service, four blow-dries, a birthday massage and priority weekend slots. We can set it up at your next visit.'
];
function bubble(text, out) {
  const b = document.createElement('div');
  b.className = 'bubble ' + (out ? 'bubble--out' : 'bubble--in');
  b.textContent = text;
  waBody.appendChild(b);
  waBody.scrollTop = waBody.scrollHeight;
}
function reply(text) {
  const t = document.createElement('div');
  t.className = 'bubble bubble--in bubble--typing';
  t.innerHTML = '<i></i><i></i><i></i>';
  t.setAttribute('aria-hidden', 'true');
  waBody.appendChild(t);
  waBody.scrollTop = waBody.scrollHeight;
  setTimeout(() => { t.remove(); bubble(text, false); }, 950);
}
function openWA(opener) {
  if (HX.embed) return;
  waOpener = opener;
  closeMenu(false);
  const was = wa.hidden;
  wa.hidden = false;
  if (opener && opener.closest('.booker') && !form.classList.contains('is-done')) {
    const s = svcInfo();
    bubble(`Hello, I would like ${s.name.toLowerCase()} ${who === 'Any' ? 'with any senior stylist' : 'with ' + who}, ${dayLabel(dayI).toLowerCase()} at ${slotT}.`, true);
    reply('Lovely, that slot is open. Send us your name and we will confirm it right here in a minute.');
  }
  if (was) $('.wa__close', wa).focus({ preventScroll: true });
}
function closeWA() {
  wa.hidden = true;
  if (waOpener) waOpener.focus({ preventScroll: true });
}
$$('[data-wa]').forEach((b) => b.addEventListener('click', () => openWA(b)));
$('.wa__close', wa).addEventListener('click', closeWA);
$$('.wa__quick button', wa).forEach((b) => b.addEventListener('click', () => { bubble(b.textContent.trim(), true); reply(ANSWERS[+b.dataset.q]); }));
addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!wa.hidden) closeWA();
  closeMenu(true);
});

/* ---------------- visit: copy the address ---------------- */
const copyBtn = $('[data-copy]');
copyBtn.addEventListener('click', async () => {
  const text = 'Selvine Salon and Spa, Plot 812, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033';
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove();
    } catch (e2) { ok = false; }
  }
  const span = $('span', copyBtn);
  span.textContent = ok ? 'Address copied' : 'Plot 812, Road No. 36';
  clearTimeout(copyBtn._t);
  copyBtn._t = setTimeout(() => { span.textContent = 'Copy address'; }, 2600);
});

/* ---------------- newsletter ---------------- */
const news = $('.news');
news.addEventListener('submit', (e) => {
  e.preventDefault();
  const inp = $('#news-mail');
  const msg = $('[data-news-msg]');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(inp.value.trim())) { msg.textContent = 'Please enter a full email address, like name@email.com.'; inp.focus(); return; }
  msg.textContent = 'You are on the list. Festive slots reach you two days before anyone else.';
  inp.value = '';
});

/* ---------------- a little realism about the time of day ---------------- */
if (now.getHours() >= 18) {
  const t = $('[data-tonight]');
  if (t) t.textContent = 'Open chairs tomorrow';
  $$('[data-next]').forEach((el) => { el.textContent = 'Free tomorrow, ' + el.dataset.next; });
}

/* ---------------- phone booking bar ---------------- */
const mbar = $('.mbar');
let bookVis = false, footVis = false;
function mbarCheck() {
  const after = pinST ? pinST.end + innerHeight * 0.25 : innerHeight * 0.85;
  const on = isPhone() && scrollY > after && !bookVis && !footVis && !root.classList.contains('menu-open');
  mbar.classList.toggle('is-on', on);
}
new IntersectionObserver((es) => { es.forEach((en) => { if (en.target === bookEl) bookVis = en.isIntersecting; else footVis = en.isIntersecting; }); mbarCheck(); }).observe(bookEl);
{
  const ioF = new IntersectionObserver((es) => { footVis = es[0].isIntersecting; mbarCheck(); });
  ioF.observe($('.footer'));
}
addEventListener('scroll', mbarCheck, { passive: true });

/* ---------------- decorative loops rest while offscreen ---------------- */
{
  const io = new IntersectionObserver((es) => es.forEach((en) => en.target.classList.toggle('anim-off', !en.isIntersecting)), { rootMargin: '80px 0px' });
  $$('.hero, .ccard, .map').forEach((el) => io.observe(el));
}

/* ---------------- magnetic buttons (desktop pointer only) ---------------- */
if (G && canHover && !HX.embed && !reduce) {
  $$('.magnetic').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------------- intro and scroll reveals ---------------- */
function showAll() {
  $$('.hero__eyebrow, .hero__lead, .hero__ctas, .hero__proof, .tonight, .nav__bar').forEach((el) => { el.style.opacity = '1'; });
  $('.hero__title').style.visibility = 'visible';
}
function heroIntro() {
  const inner = $$('.hero__title .hl').map((hl) => {
    const s = document.createElement('span');
    s.className = 'hl__i';
    while (hl.firstChild) s.appendChild(hl.firstChild);
    hl.appendChild(s);
    return s;
  });
  gsap.set('.hero__title', { visibility: 'visible' });
  gsap.timeline({ delay: HX.embed ? 0.1 : 0.25, defaults: { ease: 'expo.out' } })
    .fromTo('.nav__bar', { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 1.2, clearProps: 'transform' }, 0.1)
    .fromTo('.hero__eyebrow', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.1 }, 0.15)
    .fromTo(inner, { yPercent: 112 }, { yPercent: 0, duration: 1.55, stagger: 0.12 }, 0.2)
    .fromTo('.hero__lead', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.2 }, 0.62)
    .fromTo('.hero__ctas', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.2 }, 0.72)
    .fromTo('.hero__proof', { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0.95)
    .fromTo('.tonight', { opacity: 0, x: 34 }, { opacity: 1, x: 0, duration: 1.4 }, 0.85);
}
function reveals() {
  if (SplitText) {
    $$('[data-split]').forEach((el) => {
      let lines;
      try { lines = SplitText.create(el, { type: 'lines', mask: 'lines' }).lines; } catch (e) { return; }
      el.classList.add('is-split');
      gsap.set(lines, { yPercent: 108 });
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(lines, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1 }) });
    });
  }
  const groups = new Map();
  $$('[data-reveal]').forEach((el) => {
    const p = el.parentElement;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p).push(el);
  });
  groups.forEach((els) => {
    gsap.set(els, { opacity: 0, y: 34 });
    ScrollTrigger.batch(els, {
      start: 'top 93%', once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, overwrite: true, clearProps: 'transform,opacity' })
    });
  });
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    const fmt = (v) => (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN'));
    ScrollTrigger.create({
      trigger: el, start: 'top 94%', once: true,
      onEnter: () => { const o = { v: 0 }; el.textContent = fmt(0); gsap.to(o, { v: end, duration: 1.7, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v); } }); }
    });
  });
}

let resizeT = 0;
addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => { stageH = stageEl.offsetHeight; paintBA(); mbarCheck(); }, 180);
});

fontsReady.then(() => {
  fontsDone = true;
  if (G && !reduce) { heroIntro(); reveals(); }
  else showAll();
  if (G) ScrollTrigger.refresh();
  tryReady();
});
if (!G) setTimeout(showAll, 50);
