// Lumen Dental · interactions
const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, ready() {}, on() {} };
const { gsap, ScrollTrigger, SplitText } = window;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const isPhone = () => innerWidth < 760;
const finePointer = matchMedia('(pointer:fine)').matches && !HX.embed;
const reduce = !!HX.reducedMotion;
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MOL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.config({ nullTargetWarn: false });
gsap.ticker.lagSmoothing(0);

/* ---------- smooth scroll (never inside the menu frame) ---------- */
let lenis = null;
if (!HX.embed && !reduce && window.Lenis && finePointer) {
  lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
function goTo(target) {
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -84, duration: 1.4 });
  else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 84, behavior: reduce ? 'auto' : 'smooth' });
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  const el = $(id);
  if (!el) return;
  e.preventDefault();
  closeMenu();
  goTo(el);
}));

/* ---------- nav ---------- */
const nav = $('.nav');
const menuBtn = $('.nav__menu');
const menu = $('#menu');
function openMenu() { document.documentElement.classList.add('menu-open'); menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.setAttribute('aria-label', 'Close menu'); menu.setAttribute('aria-hidden', 'false'); lenis && lenis.stop(); }
function closeMenu() { if (!document.documentElement.classList.contains('menu-open')) return; document.documentElement.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); menu.setAttribute('aria-hidden', 'true'); lenis && lenis.start(); }
menuBtn.addEventListener('click', () => (document.documentElement.classList.contains('menu-open') ? closeMenu() : openMenu()));
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenu(); closeChat(); } });
const mbar = $('.mbar');
let bookInView = false;
function onScroll() {
  const y = scrollY;
  nav.classList.toggle('is-scrolled', y > 24);
  const show = y > innerHeight * 0.75 && !bookInView;
  mbar.classList.toggle('show', show);
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- dates ---------- */
const today = new Date();
const dayLabel = (d) => `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`;
$('[data-today]').textContent = 'Today · ' + dayLabel(today);

/* ---------- hero slot card ---------- */
const chipsBox = $('.chips');
const chips = $$('.chip', chipsBox);
const pill = $('.chips__pill');
const holdBtn = $('[data-hold]');
const holdLabel = $('.slotcard__label');
const slotNote = $('.slotcard__note');
let heroSlot = null;
function placePill(ch) {
  if (!ch) return;
  pill.style.width = ch.offsetWidth + 'px';
  pill.style.transform = `translateX(${ch.offsetLeft - 6}px) scale(1)`;
}
function pickChip(ch, quiet) {
  chips.forEach((c) => c.setAttribute('aria-checked', String(c === ch)));
  chipsBox.classList.add('has-pick');
  placePill(ch);
  heroSlot = ch.dataset.slot;
  holdLabel.textContent = `Hold ${heroSlot} today`;
  holdBtn.classList.remove('is-done');
  if (!quiet) { slotNote.textContent = 'No payment now. Free to reschedule.'; slotNote.classList.remove('is-ok'); }
}
chips.forEach((c) => c.addEventListener('click', () => pickChip(c)));
addEventListener('resize', () => placePill(chips.find((c) => c.getAttribute('aria-checked') === 'true')));
holdBtn.addEventListener('click', () => {
  if (!heroSlot) { pickChip(chips[1]); return; }
  holdBtn.classList.add('is-done');
  holdLabel.textContent = 'Held for 10 minutes';
  slotNote.textContent = `${heroSlot} is yours. Add your name below to confirm.`;
  slotNote.classList.add('is-ok');
  booking.select(0, heroSlot);
  setTimeout(() => goTo('#book'), 650);
});

/* ---------- hero intro ---------- */
(function wrapHeroTitle() {
  const h1 = $('.hero__title');
  $$('.hl', h1).forEach((hl) => { const m = document.createElement('span'); m.className = 'line-mask'; hl.replaceWith(m); m.appendChild(hl); });
})();
function intro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  gsap.set('.hero__title', { visibility: 'visible' });
  if (reduce) { gsap.set('.hero__eyebrow,.hero__lead,.hero__ctas,.hero__proof,.slotcard', { opacity: 1 }); pickChip(chips[1], true); return; }
  tl.fromTo('.hero__title .hl', { yPercent: 112 }, { yPercent: 0, duration: 1.35, stagger: 0.1 }, 0.05)
    .fromTo('.hero__eyebrow', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1 }, 0)
    .fromTo('.hero__lead', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1 }, 0.35)
    .fromTo('.hero__ctas', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1 }, 0.45)
    .fromTo('.hero__proof', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.1 }, 0.55)
    .fromTo('.slotcard', { opacity: 0, y: 40, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 1.4 }, 0.3)
    .fromTo('.chip', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.07 }, 0.75)
    .add(() => pickChip(chips[1], true), 1.55);
}
intro();

/* ---------- WebGL hero ---------- */
const heroEl = $('.hero');
import('./scene.js').then((m) => {
  const r = m.initHero($('.hero__gl'), heroEl);
  if (!r) HX.ready();
}).catch(() => HX.ready());

/* ---------- reveals ---------- */
function reveals() {
  $$('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, { yPercent: 118, duration: 1.15, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      }
    });
  });
  const items = $$('[data-reveal]');
  gsap.set(items, { opacity: 0, y: 34 });
  ScrollTrigger.batch(items, {
    start: 'top 92%', once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.05, ease: 'expo.out', stagger: 0.07, overwrite: true, clearProps: 'transform' })
  });
  // counters
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = dec ? o.v.toFixed(dec) : Math.round(o.v).toLocaleString('en-IN'); } }) });
  });
  // the fixed aurora drifts as the page scrolls, so every section gets its own light
  if (!reduce) [['.b1', 70, 26], ['.b2', -62, 18], ['.b3', -44, -70], ['.b4', -48, 64]].forEach(([sel, x, y]) =>
    gsap.to('.backdrop ' + sel, { xPercent: x, yPercent: y, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1 } }));
}

/* ---------- first visit dial + timeline ---------- */
function visitTimeline() {
  const steps = $('.steps'), items = $$('.step'), tEl = $('[data-dial-time]'), lEl = $('[data-dial-label]');
  const prog = $('.dial__prog'), ticksG = $('.dial__ticks');
  const C = 2 * Math.PI * 86, NT = 45, ticks = [];
  for (let i = 0; i < NT; i++) {
    const a = (i / NT) * Math.PI * 2, r1 = i % 5 === 0 ? 70 : 73, r2 = 77;
    const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ln.setAttribute('x1', 100 + Math.cos(a) * r1); ln.setAttribute('y1', 100 + Math.sin(a) * r1);
    ln.setAttribute('x2', 100 + Math.cos(a) * r2); ln.setAttribute('y2', 100 + Math.sin(a) * r2);
    ticksG.appendChild(ln); ticks.push(ln);
  }
  let lastIdx = -1;
  function update(p) {
    steps.style.setProperty('--p', p.toFixed(4));
    prog.style.strokeDashoffset = (C * (1 - p)).toFixed(2);
    const mins = Math.round(p * 45);
    tEl.textContent = '00:' + String(mins).padStart(2, '0');
    ticks.forEach((t, i) => t.classList.toggle('on', i < mins));
    const idx = Math.min(items.length - 1, Math.floor(p * items.length * 0.999 + 0.12));
    if (idx !== lastIdx) {
      lastIdx = idx;
      items.forEach((el, i) => el.classList.toggle('is-on', i <= idx && p > 0.01));
      lEl.textContent = items[idx].dataset.label;
    }
  }
  update(0);
  ScrollTrigger.create({ trigger: steps, start: 'top 70%', end: 'bottom 62%', scrub: 0.4, onUpdate: (s) => update(s.progress) });
}

/* ---------- reviews carousel ---------- */
function carousel() {
  const root = $('[data-carousel]'), track = $('.carousel__track', root), cards = $$('.review', track), dotsBox = $('.carousel__dots', root);
  cards.forEach(() => dotsBox.appendChild(document.createElement('i')));
  const dots = $$('i', dotsBox);
  const step = () => cards[1].offsetLeft - cards[0].offsetLeft;
  const maxIdx = () => Math.max(0, Math.round((track.scrollWidth - track.clientWidth) / step()));
  const cur = () => Math.round(track.scrollLeft / step());
  function paint() { const c = cur(); dots.forEach((d, i) => d.classList.toggle('on', i === Math.min(c, cards.length - 1))); }
  function go(i) { const m = maxIdx(); if (i > m) i = 0; if (i < 0) i = m; track.scrollTo({ left: i * step(), behavior: reduce ? 'auto' : 'smooth' }); }
  $('[data-next]', root).addEventListener('click', () => { go(cur() + 1); hold(); });
  $('[data-prev]', root).addEventListener('click', () => { go(cur() - 1); hold(); });
  track.addEventListener('scroll', () => requestAnimationFrame(paint), { passive: true });
  paint();
  let inView = false, pausedUntil = 0;
  const hold = () => { pausedUntil = performance.now() + 9000; };
  ['pointerdown', 'wheel', 'touchstart'].forEach((ev) => track.addEventListener(ev, hold, { passive: true }));
  root.addEventListener('mouseenter', () => { pausedUntil = Infinity; });
  root.addEventListener('mouseleave', () => { pausedUntil = performance.now() + 1500; });
  ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onToggle: (s) => { inView = s.isActive; } });
  if (!reduce) setInterval(() => { if (inView && !HX.paused && performance.now() > pausedUntil) go(cur() + 1); }, 4200);
}

/* ---------- EMI ---------- */
function emi() {
  const segA = $$('.emi .seg:not(.seg--months) button'), segM = $$('.emi .seg--months button');
  const out = $('[data-emi]'), note = $('[data-emi-note]');
  let amt = 65000, months = 12, shown = { v: 65000 / 12 };
  function calc(anim) {
    const v = amt / months;
    gsap.to(shown, { v, duration: anim ? 0.7 : 0, ease: 'power3.out', onUpdate: () => { out.textContent = inr(shown.v); } });
    note.textContent = `${inr(amt)} over ${months} months at 0% interest`;
  }
  const radio = (list, btn) => list.forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
  segA.forEach((b) => b.addEventListener('click', () => { radio(segA, b); amt = +b.dataset.amt; calc(true); }));
  segM.forEach((b) => b.addEventListener('click', () => { radio(segM, b); months = +b.dataset.m; calc(true); }));
  calc(false);
  // in the menu frame, cycle once so the calculator reads as live
  if (HX.embed && !reduce) {
    let k = 0;
    ScrollTrigger.create({ trigger: '.emi', start: 'top 75%', once: true, onEnter: () => {
      const seq = [[segM[1], 'm'], [segA[0], 'a'], [segM[3], 'm']];
      const tick = () => { const [b, kind] = seq[k++ % seq.length]; b.click(); if (k < 3) setTimeout(tick, 1400); };
      setTimeout(tick, 900);
    } });
  }
}

/* ---------- booking widget ---------- */
const booking = (function () {
  const form = $('.booker');
  const tBtns = $$('.tchips button', form);
  const dayBtns = $$('[data-week] button', form);
  const slotBtns = $$('[data-slots] button', form);
  const sumWhen = $('[data-sum-when]'), sumT = $('[data-sum-t]'), sumD = $('[data-sum-d]'), sumP = $('[data-sum-p]');
  const err = $('[data-err]'), done = $('.booked'), doneText = $('[data-booked-text]');
  const days = [];
  for (let i = 0; i < 7; i++) { const d = new Date(today); d.setDate(today.getDate() + i); days.push(d); }
  const m0 = days[0].getMonth(), m1 = days[6].getMonth();
  $('[data-month]').textContent = m0 === m1 ? `${MOL[m0]} ${days[0].getFullYear()}` : `${MO[m0]} to ${MO[m1]}`;
  let state = { day: 0, slot: '5:15 PM', t: tBtns[0] };
  // deterministic availability: today's evening matches the hero card
  const booked = (di, si) => {
    if (di === 0) return !['4:30 PM', '5:15 PM', '6:00 PM'].includes(slotBtns[si].textContent);
    const h = Math.sin((di + 3) * 12.9898 + si * 78.233) * 43758.5453;
    return (h - Math.floor(h)) < (days[di].getDay() === 0 ? 0.5 : 0.3);
  };
  dayBtns.forEach((b, i) => {
    const d = days[i];
    b.querySelector('small').textContent = i === 0 ? 'Today' : WD[d.getDay()];
    b.querySelector('b').textContent = d.getDate();
    const free = slotBtns.filter((_, si) => !booked(i, si)).length;
    b.querySelector('i').classList.toggle('few', free <= 4);
    b.setAttribute('aria-label', `${dayLabel(d)}, ${free} slots free`);
    b.addEventListener('click', () => select(i, null));
  });
  function paintSlots() {
    slotBtns.forEach((b, si) => {
      const isBooked = booked(state.day, si) || (days[state.day].getDay() === 0 && /8:15|7:30/.test(b.textContent));
      b.disabled = isBooked;
      b.classList.toggle('is-on', !isBooked && b.textContent === state.slot);
      b.setAttribute('aria-pressed', String(!isBooked && b.textContent === state.slot));
    });
    $$('.slots__group', form).forEach((g) => {
      const all = $$('button', g).every((b) => b.disabled);
      g.classList.toggle('is-full', all);
    });
    if (!slotBtns.some((b) => b.classList.contains('is-on'))) {
      const firstEve = slotBtns.find((b, si) => si >= 8 && !b.disabled) || slotBtns.find((b) => !b.disabled);
      if (firstEve) { state.slot = firstEve.textContent; firstEve.classList.add('is-on'); firstEve.setAttribute('aria-pressed', 'true'); }
    }
  }
  function paintSummary() {
    sumWhen.textContent = `${dayLabel(days[state.day])} · ${state.slot}`;
    sumT.textContent = state.t.dataset.t; sumD.textContent = state.t.dataset.d; sumP.textContent = state.t.dataset.p;
    gsap.fromTo(sumWhen, { opacity: 0.35, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }
  function select(di, slot) {
    state.day = di; if (slot) state.slot = slot;
    dayBtns.forEach((b, i) => b.setAttribute('aria-checked', String(i === di)));
    paintSlots(); paintSummary();
  }
  tBtns.forEach((b) => b.addEventListener('click', () => { tBtns.forEach((x) => x.setAttribute('aria-checked', String(x === b))); state.t = b; paintSummary(); }));
  slotBtns.forEach((b) => b.addEventListener('click', () => { if (b.disabled) return; state.slot = b.textContent; paintSlots(); paintSummary(); }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name, phone = form.elements.phone;
    const okName = name.value.trim().length > 1, digits = phone.value.replace(/\D/g, ''), okPhone = digits.length >= 10;
    name.parentElement.classList.toggle('is-bad', !okName); phone.parentElement.classList.toggle('is-bad', !okPhone);
    if (!okName || !okPhone) { err.textContent = !okName ? 'Add your name so we know who to expect.' : 'Add a 10-digit WhatsApp number for your confirmation.'; (okName ? phone : name).focus(); return; }
    err.textContent = '';
    const first = name.value.trim().split(/\s+/)[0];
    doneText.textContent = `See you ${dayLabel(days[state.day])} at ${state.slot}, ${first}. Details are on their way to your WhatsApp.`;
    done.hidden = false;
    gsap.fromTo(done, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    gsap.fromTo('.booked__check', { scale: 0.4, rotate: -30 }, { scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(2)' });
  });
  $('[data-rebook]').addEventListener('click', () => { done.hidden = true; });
  ['input'].forEach((ev) => form.addEventListener(ev, (e) => { if (e.target.matches('input')) { e.target.parentElement.classList.remove('is-bad'); err.textContent = ''; } }));
  select(0, '5:15 PM');
  ScrollTrigger.create({ trigger: '#book', start: 'top 70%', end: 'bottom 30%', onToggle: (s) => { bookInView = s.isActive; onScroll(); } });
  return { select };
})();

/* ---------- FAQ ---------- */
function faq() {
  const items = $$('.acc__item');
  items.forEach((d) => {
    const s = $('summary', d), body = $('.acc__body', d);
    s.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, duration: 0.45, ease: 'power3.inOut', onComplete: () => { d.open = false; body.style.height = ''; ScrollTrigger.refresh(); } });
      } else {
        items.forEach((o) => { if (o !== d && o.open) { const b = $('.acc__body', o); gsap.to(b, { height: 0, duration: 0.4, ease: 'power3.inOut', onComplete: () => { o.open = false; b.style.height = ''; } }); } });
        d.open = true;
        gsap.fromTo(body, { height: 0 }, { height: body.scrollHeight, duration: 0.55, ease: 'power3.out', onComplete: () => { body.style.height = ''; ScrollTrigger.refresh(); } });
      }
    });
  });
}

/* ---------- WhatsApp chat preview ---------- */
const chat = $('.wa');
const chatBody = $('.wa__body', chat);
const replies = [
  ['Book a check-up', 'Lovely. Today we have 4:30 PM, 5:15 PM and 6:00 PM free with Dr. Meera Iyer. Shall I hold one for you?'],
  ['I have tooth pain', 'Sorry to hear that. We keep two emergency slots every evening. Send a photo if you can, and Dr. Arjun Rao can see you at 6:00 PM today.'],
  ['Aligner prices', 'Clear aligners start at ₹65,000 including retainers, or ₹5,417 a month on 0% EMI. Would you like a free scan slot this week?']
];
function openChat() { chat.hidden = false; $('.wa__close', chat).focus({ preventScroll: true }); }
function closeChat() { chat.hidden = true; }
$$('[data-wa]').forEach((b) => b.addEventListener('click', () => { closeMenu(); chat.hidden ? openChat() : closeChat(); }));
$('.wa__close', chat).addEventListener('click', closeChat);
$$('.wa__quick button', chat).forEach((b) => b.addEventListener('click', () => {
  const [q, a] = replies[+b.dataset.q];
  const add = (cls, html) => { const el = document.createElement('div'); el.className = 'bubble ' + cls; el.innerHTML = html; chatBody.appendChild(el); chatBody.scrollTop = chatBody.scrollHeight; return el; };
  add('bubble--out', q);
  const typing = add('bubble--in bubble--typing', '<i></i><i></i><i></i>');
  setTimeout(() => { typing.remove(); add('bubble--in', a); }, 1100);
}));

/* ---------- magnetic buttons (desktop pointer only) ---------- */
if (finePointer && !reduce) {
  $$('.magnetic').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' }), yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.22); yTo((e.clientY - r.top - r.height / 2) * 0.32); });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------- boot ---------- */
visitTimeline();
carousel();
emi();
faq();
const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1800))]).then(() => {
  reveals();
  ScrollTrigger.refresh();
});
addEventListener('load', () => ScrollTrigger.refresh());
