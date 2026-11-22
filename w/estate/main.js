// Ruvela Residences · page controller
import { initScene } from './scene.js';
import { PLANS, renderPlan, renderSitePlan, renderTowerProgress, roomArea, fmtArea, dims } from './plans.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: innerWidth < 760 ? 'mobile' : 'desktop', reducedMotion: false, ready() {}, on() {} };
const root = document.documentElement;
root.classList.add('js');
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const mobile = HX.device === 'mobile' || window.innerWidth < 760;
const lite = !!HX.lite || mobile;
const reduced = !!HX.reducedMotion;
if (lite) root.classList.add('lite');
if (reduced) root.classList.add('no-motion');
const gsap = window.gsap, ST = window.ScrollTrigger, Split = window.SplitText;
if (gsap && ST) gsap.registerPlugin(ST);
if (gsap && Split) gsap.registerPlugin(Split);
const inr = (v) => '₹' + Math.round(v).toLocaleString('en-IN');
const trim = (s) => s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
const money = (v) => v >= 1e7 ? '₹' + trim((v / 1e7).toFixed(2)) + ' Cr' : '₹' + trim((v / 1e5).toFixed(1)) + ' lakh';

/* ---------------------------------------------------------------- smooth scroll (full page, desktop only) */
let lenis = null;
if (!HX.embed && !mobile && !reduced && window.Lenis && gsap) {
  lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  if (ST) lenis.on('scroll', () => ST.update());
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
function goTo(sel) {
  const t = typeof sel === 'string' ? $(sel) : sel; if (!t) return;
  if (lenis) lenis.scrollTo(t, { offset: 0, duration: 1.4 });
  else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}
$$('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); if (id.length < 2) return;
  const t = $(id); if (!t) return; e.preventDefault(); setMenu(false); goTo(t);
}));

/* ---------------------------------------------------------------- hero */
const hero = $('#top'), sticky = $('.hero-sticky'), nav = $('#nav');
function heroProgress() {
  const r = hero.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - sticky.offsetHeight));
}
const cap0 = $('.cap-0'), cap1 = $('.cap-1'), cap2 = $('.cap-2'), hint = $('.scroll-hint');
const planfx = $('.planfx'), card = $('.plancard'), pcPlan = $('.pc-plan');
const ldLine = $('.ld-line'), ldDot = $('.ld-dot'), ldRing = $('.ld-ring');
const lcT = $('.lc-t'), lcN = $('.lc-n'), lcSun = $('.lc-sun');
pcPlan.innerHTML = renderPlan(PLANS['3bhk'], { id: 'hero-plan', labels: 'names', dims: false, pad: 1.2 });
const planSvg = $('svg', pcPlan);
// the plan draws like one pen: the outline sweeps around the home, then the inner walls follow
const heroWalls = (() => {
  const vb = planSvg.viewBox.baseVal, cx = vb.x + vb.width / 2, cy = vb.y + vb.height / 2;
  const list = $$('.walls .wl', pcPlan).map(p => {
    const len = Math.max(0.01, p.getTotalLength()), a = p.getPointAtLength(0), b = p.getPointAtLength(len);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, ext = !p.classList.contains('wl-i');
    p.style.strokeDasharray = len.toFixed(3) + ' ' + len.toFixed(3);
    return { p, len, ext, k: ext ? (Math.atan2(my - cy, mx - cx) + Math.PI * 1.25) % (Math.PI * 2) : mx * 0.6 + my, s: -1 };
  });
  const pens = [list.filter(w => w.ext).sort((a, b) => a.k - b.k), list.filter(w => !w.ext).sort((a, b) => a.k - b.k)];
  pens.forEach(pen => { let acc = 0; const tot = pen.reduce((t, w) => t + w.len, 0); pen.forEach(w => { w.a = acc / tot; acc += w.len; w.b = acc / tot; }); });
  return { all: list, ext: pens[0], int: pens[1] };
})();
function drawWalls(d) {
  const run = (pen, t) => pen.forEach(w => {
    const s = clamp((t - w.a) / Math.max(1e-4, w.b - w.a));
    if (Math.abs(s - w.s) < 0.002) return;
    w.s = s; w.p.style.strokeDashoffset = (w.len * (1 - s)).toFixed(3); w.p.style.opacity = s > 0.002 ? '1' : '0';
  });
  run(heroWalls.ext, clamp(d / 0.6)); run(heroWalls.int, clamp((d - 0.4) / 0.6));
}
drawWalls(0);
const cache = new Map();
const setVar = (el, k, v, eps = 0.002) => { const key = el; let m = cache.get(key); if (!m) cache.set(key, m = {}); if (m[k] !== undefined && Math.abs(m[k] - v) < eps) return; m[k] = v; el.style.setProperty(k, typeof v === 'number' ? v.toFixed(3) : v); };
function setCap(el, o, ty) {
  setVar(el, '--o', o); setVar(el, '--ty', Math.round(ty) + 'px', 0);
  const vis = o > 0.01;
  if (el._vis !== vis) { el._vis = vis; el.style.visibility = vis ? 'visible' : 'hidden'; el.style.pointerEvents = o > 0.5 ? 'auto' : 'none'; }
}
let heroDusk = 0, lastDraw = -1, cardBox = null;
window.addEventListener('resize', () => { cardBox = null; });
const lcEl = $('.lightclock');
const phase = (t) => t < 0.18 ? 'Morning light' : t < 0.45 ? 'Midday sun' : t < 0.7 ? 'Afternoon' : t < 0.92 ? 'Golden hour' : 'Dusk';
function heroFrame(sp, t, home) {
  // light: the scrim and captions follow the time of day
  heroDusk = smooth(clamp((t - 0.55) / 0.3));
  setVar(sticky, '--dusk', heroDusk);
  sticky.classList.toggle('is-dusk', t > 0.62);
  // captions
  const k0 = clamp((sp - 0.025) / 0.08);
  setCap(cap0, 1 - k0, -44 * smooth(k0));
  if (hint) hint.style.opacity = (1 - clamp(sp / 0.04)).toFixed(3);
  const a1 = smooth(clamp((sp - 0.17) / 0.08)) * (1 - smooth(clamp((sp - 0.43) / 0.06)));
  setCap(cap1, a1, (1 - a1) * (sp < 0.3 ? 34 : -34));
  const a2 = smooth(clamp((sp - 0.49) / 0.07)) * (1 - smooth(clamp((sp - 0.72) / 0.05)));
  setCap(cap2, a2, (1 - a2) * (sp < 0.6 ? 34 : -34));
  // the floor plan draws itself over the home
  const po = smooth(clamp((sp - 0.76) / 0.07));
  setVar(planfx, '--po', po);
  if (planfx._vis !== po > 0.01) { planfx._vis = po > 0.01; planfx.style.visibility = planfx._vis ? 'visible' : 'hidden'; }
  if (po > 0.01) {
    setVar(card, '--ps', 0.965 + 0.035 * po); setVar(card, '--pty', Math.round((1 - po) * 26) + 'px', 0);
    const d = clamp((sp - 0.79) / 0.14);
    if (Math.abs(d - lastDraw) > 0.002) {
      lastDraw = d;
      drawWalls(d);
      setVar(planSvg, '--fo', clamp((sp - 0.86) / 0.07)); setVar(planSvg, '--lo', clamp((sp - 0.9) / 0.07));
    }
    // leader line from the card to the glowing floor (card box is cached, so no layout reads per frame)
    if (home && home.on > 0.02) {
      if (!cardBox) cardBox = { l: card.offsetLeft, t: card.offsetTop - (mobile ? 0 : card.offsetHeight / 2), w: card.offsetWidth, h: card.offsetHeight };
      const b = cardBox, ex = home.x, ey = home.y;
      let dPath;
      if (mobile) { const sx = b.l + b.w * 0.5, sy = b.t; dPath = `M${sx.toFixed(1)} ${sy.toFixed(1)}V${Math.max(ey + 26, sy - 400).toFixed(1)}L${ex.toFixed(1)} ${(ey + 8).toFixed(1)}`; }
      else { const sx = b.l + b.w, sy = b.t + b.h * 0.42; dPath = `M${sx.toFixed(1)} ${sy.toFixed(1)}H${Math.max(sx + 20, ex - 60).toFixed(1)}L${(ex - 8).toFixed(1)} ${ey.toFixed(1)}`; }
      ldLine.setAttribute('d', dPath);
      ldDot.setAttribute('cx', ex.toFixed(1)); ldDot.setAttribute('cy', ey.toFixed(1));
      ldRing.setAttribute('cx', ex.toFixed(1)); ldRing.setAttribute('cy', ey.toFixed(1));
    }
  }
  // light study clock: 07:10 to 18:40 (on phones it waits until the tower labels have gone)
  if (mobile) setVar(lcEl, '--lco', smooth(clamp((sp - 0.1) / 0.06)));
  const mins = Math.round(430 + 690 * t), hh = Math.floor(mins / 60), mm = mins % 60;
  const label = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  if (lcT.textContent !== label) lcT.textContent = label;
  const ph = phase(t); if (lcN.textContent !== ph) lcN.textContent = ph;
  const th = Math.PI * (1 - (0.06 + 0.88 * t));
  lcSun.setAttribute('cx', (32 + 28 * Math.cos(th)).toFixed(2)); lcSun.setAttribute('cy', (30 - 28 * Math.sin(th)).toFixed(2));
}

let sceneOk = false, scene = null;
try {
  scene = initScene($('#stage'), {
    mobile, lite, instant: reduced, root: hero, labels: $$('.tl'),
    getProgress: heroProgress,
    onFrame: heroFrame,
    onFirstFrame: () => { sceneOk = true; HX.ready(); }
  });
} catch (err) {
  // No WebGL: the hero keeps its copy over a drawn site plan, and the story captions follow the scroll.
  const fb = document.createElement('div');
  fb.className = 'hero-fallback';
  fb.innerHTML = renderSitePlan();
  sticky.prepend(fb);
  $('#stage').style.display = 'none';
  const loop = () => { requestAnimationFrame(loop); const p = heroProgress(); heroFrame(p, smooth(clamp((p - 0.02) / 0.86)), null); };
  requestAnimationFrame(loop);
}

/* ---------------------------------------------------------------- nav, dock */
const dock = $('#dock'), darkZones = [$('#location'), $('#visit'), $('.footer')];
function chrome() {
  if (HX.paused) return;
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 24);
  const hr = hero.getBoundingClientRect();
  let dark;
  if (hr.bottom > 40) dark = heroDusk > 0.5;
  else dark = darkZones.some(z => { const r = z.getBoundingClientRect(); return r.top <= 36 && r.bottom > 36; });
  nav.classList.toggle('is-dark', dark);
  if (dock) dock.classList.toggle('is-on', hr.bottom < window.innerHeight * 0.35);
}
let chromeQ = false;
window.addEventListener('scroll', () => { if (!chromeQ) { chromeQ = true; requestAnimationFrame(() => { chromeQ = false; chrome(); }); } }, { passive: true });
setInterval(chrome, 400);
chrome();

/* ---------------------------------------------------------------- menu */
const menuBtn = $('.menu-btn'), menu = $('#menu');
function setMenu(open) {
  if (!menuBtn) return;
  if (open === root.classList.contains('menu-open')) return;
  root.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.setAttribute('aria-hidden', String(!open));
  if (lenis) open ? lenis.stop() : lenis.start();
}
menuBtn.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setMenu(false); closeChat(); } });

// the menu pauses offscreen frames: rAF is held by the runtime, CSS and SMIL loops are paused here
HX.on('pause', () => { root.classList.add('paused-anim'); $$('svg').forEach(s => s.pauseAnimations && s.pauseAnimations()); });
HX.on('play', () => { root.classList.remove('paused-anim'); const j = $('.t-jog svg'); if (j && j.unpauseAnimations && j.closest('.tile.on')) j.unpauseAnimations(); });

/* ---------------------------------------------------------------- 01 site plan */
const spWrap = $('#siteplan');
spWrap.innerHTML = renderSitePlan();
const sp = $('svg', spWrap);
$$('.st-track, .st-podium', sp).forEach(p => p.setAttribute('pathLength', '1'));
const onView = (el, fn, opts = { threshold: 0.18 }) => {
  if (reduced || !('IntersectionObserver' in window)) { fn(); return; }
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { fn(); io.disconnect(); } }), opts);
  io.observe(el);
};
onView(sp, () => sp.classList.add('drawn'));

/* ---------------------------------------------------------------- 02 configurations */
const cfgSvg = $('#cfg-svg'), cfgTabs = $$('.cfg-tab');
const rr = { n: $('.rr-n'), d: $('.rr-d'), box: $('#room-read') };
let curPlan = '2bhk';
function selectRoom(i) {
  const P = PLANS[curPlan], r = P.rooms[i];
  $$('.rm', cfgSvg).forEach(g => g.classList.toggle('is-sel', g.dataset.room === String(i)));
  rr.n.textContent = r.n;
  rr.d.textContent = dims(r) + ' · ' + fmtArea(roomArea(r)) + ' sq ft';
  rr.box.classList.remove('flash'); void rr.box.offsetWidth; rr.box.classList.add('flash');
}
function showPlan(id, animate = true) {
  curPlan = id;
  const P = PLANS[id];
  cfgSvg.innerHTML = renderPlan(P, { id: 'plan-' + id, interactive: true, labels: 'full' });
  if (animate) { cfgSvg.classList.remove('swap'); void cfgSvg.offsetWidth; cfgSvg.classList.add('swap'); }
  $('#cfg-name').textContent = P.name;
  $('#cfg-area').textContent = P.area.toLocaleString('en-IN');
  $('#cfg-price').textContent = money(P.price);
  $('#cfg-facts').innerHTML = P.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  cfgTabs.forEach(t => { const on = t.dataset.cfg === id; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
  selectRoom(P.rooms.findIndex(r => r.k === 'living'));
}
cfgSvg.addEventListener('click', (e) => { const g = e.target.closest('[data-room]'); if (g) selectRoom(+g.dataset.room); });
cfgSvg.addEventListener('keydown', (e) => { if (e.key !== 'Enter' && e.key !== ' ') return; const g = e.target.closest('[data-room]'); if (g) { e.preventDefault(); selectRoom(+g.dataset.room); } });
cfgTabs.forEach((t, i) => {
  t.addEventListener('click', () => { if (t.dataset.cfg !== curPlan) showPlan(t.dataset.cfg); });
  t.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = cfgTabs[(i + (e.key === 'ArrowRight' ? 1 : cfgTabs.length - 1)) % cfgTabs.length];
    n.focus(); showPlan(n.dataset.cfg);
  });
});
showPlan('2bhk', false);
$('#cfg-emi').addEventListener('click', () => { setLoan(Math.round(PLANS[curPlan].price * 0.8)); goTo('#emi'); });

/* ---------------------------------------------------------------- 03 amenity tiles animate only while visible */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach(e => e.target.classList.toggle('on', e.isIntersecting)), { threshold: 0.05 });
  $$('.tile').forEach(t => io.observe(t));
  const jog = $('.t-jog svg');
  if (jog && jog.pauseAnimations) new IntersectionObserver((es) => { es[0].isIntersecting ? jog.unpauseAnimations() : jog.pauseAnimations(); }).observe(jog);
}

/* ---------------------------------------------------------------- 04 location map */
const destBtns = $$('#dest button'), routes = $$('.rt'), marks = $$('.md'), mapRead = $('#map-read');
let routeIdx = 0, userPicked = false;
function setRoute(id) {
  destBtns.forEach((b, i) => { const on = b.dataset.route === id; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); if (on) routeIdx = i; });
  routes.forEach(r => r.classList.toggle('is-on', r.dataset.r === id));
  marks.forEach(m => m.classList.toggle('is-on', m.dataset.r === id));
  const b = destBtns[routeIdx];
  mapRead.innerHTML = `<b>${$('.d-t b', b).textContent} min</b> ${$('.d-t', b).textContent.includes('walk') ? 'walk' : 'drive'} to ${$('.d-n', b).textContent}`;
}
destBtns.forEach(b => {
  b.addEventListener('click', () => { userPicked = true; setRoute(b.dataset.route); });
  b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { userPicked = true; setRoute(b.dataset.route); } });
});
setRoute('bal');
let mapVisible = false;
if ('IntersectionObserver' in window) new IntersectionObserver((es) => { mapVisible = es[0].isIntersecting; }, { threshold: 0.3 }).observe($('.map'));
setInterval(() => { if (mapVisible && !userPicked && !reduced) setRoute(destBtns[(routeIdx + 1) % destBtns.length].dataset.route); }, 2300);

/* ---------------------------------------------------------------- 05 progress */
$$('.tp').forEach(f => { $('.tp-art', f).innerHTML = renderTowerProgress(+f.dataset.floors, +f.dataset.done, f.dataset.name); });
const pt = $('.prog-towers'), tl = $('.timeline');
onView(pt, () => { pt.classList.add('built'); $$('.tp', pt).forEach(f => f.classList.add('built')); });
onView(tl, () => {
  const now = $('li.now', tl);
  tl.style.setProperty('--tl', (now.offsetTop + 17 - 14) + 'px');
});

/* ---------------------------------------------------------------- 06 EMI */
const amt = $('#emi-amt'), yrs = $('#emi-yrs'), emiV = $('#emi-v'), presets = $$('.emi-presets .chip');
const emiState = { v: 0 };
function fill(r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100).toFixed(2) + '%'); }
function calcEmi(animate = true) {
  const P = +amt.value, n = +yrs.value * 12, r = 0.085 / 12, f = Math.pow(1 + r, n);
  const E = Math.round(P * r * f / (f - 1)), total = E * n, interest = total - P;
  $('#emi-amt-o').textContent = money(P);
  $('#emi-yrs-o').textContent = yrs.value + ' years';
  $('#emi-p').textContent = inr(P); $('#emi-i').textContent = inr(interest); $('#emi-t').textContent = inr(total);
  $('#emi-bp').style.width = (P / total * 100).toFixed(1) + '%';
  fill(amt); fill(yrs);
  presets.forEach(c => c.classList.toggle('is-on', +c.dataset.loan === P));
  if (gsap && animate && !reduced) gsap.to(emiState, { v: E, duration: 0.55, ease: 'power3.out', overwrite: true, onUpdate: () => { emiV.textContent = Math.round(emiState.v).toLocaleString('en-IN'); } });
  else { emiState.v = E; emiV.textContent = E.toLocaleString('en-IN'); }
}
function setLoan(v) { amt.value = String(clamp(v, +amt.min, +amt.max)); calcEmi(); }
amt.addEventListener('input', () => calcEmi());
yrs.addEventListener('input', () => calcEmi());
presets.forEach(c => c.addEventListener('click', () => setLoan(+c.dataset.loan)));
calcEmi(false);

/* ---------------------------------------------------------------- 07 site visit booking */
const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MO = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysEl = $('#days'), slotsEl = $('#slots'), booker = $('#booker');
const dates = [];
(function buildDays() {
  const now = new Date();
  for (let i = 1; i <= 6; i++) { const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i); dates.push(d); }
  daysEl.innerHTML = dates.map((d, i) => `<button type="button" class="day${i === 0 ? ' is-on' : ''}" aria-pressed="${i === 0}" aria-label="${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}"><small>${WD[d.getDay()].slice(0, 3)}</small><b>${d.getDate()}</b><small>${MO[d.getMonth()].slice(0, 3)}</small></button>`).join('');
})();
function single(group) {
  group.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', group).forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
  });
}
single(daysEl); single(slotsEl);
$$('button', slotsEl).forEach(b => b.setAttribute('aria-pressed', String(b.classList.contains('is-on'))));
const bkErr = $('#bk-err'), bkName = $('#bk-name'), bkPhone = $('#bk-phone');
booker.addEventListener('submit', (e) => {
  e.preventDefault();
  [bkName, bkPhone].forEach(f => f.parentElement.classList.remove('err'));
  const name = bkName.value.trim();
  let digits = bkPhone.value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (!name) { bkErr.textContent = 'Add your name so we know who to welcome.'; bkName.parentElement.classList.add('err'); bkName.focus(); return; }
  if (!/^[6-9]\d{9}$/.test(digits)) { bkErr.textContent = 'Add a 10-digit mobile number for your WhatsApp confirmation.'; bkPhone.parentElement.classList.add('err'); bkPhone.focus(); return; }
  bkErr.textContent = '';
  const di = $$('.day', daysEl).findIndex(b => b.classList.contains('is-on')), d = dates[Math.max(0, di)];
  const slot = $('.slot.is-on', slotsEl);
  const time = slot ? slot.firstChild.textContent.trim() : '5:30 pm';
  $('#bk-who').textContent = ', ' + name.split(/\s+/)[0];
  $('#bk-when').textContent = `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]} at ${time}`;
  $('#bk-p').textContent = ($('#bk-cab').checked ? 'A cab will pick you up 40 minutes before your slot. ' : '') + 'Your visit pass and the lounge location are on their way to WhatsApp.';
  $('.bk-inner', booker).hidden = true;
  $('#bk-done').hidden = false;
  booker.classList.add('is-done');
  $('#bk-again').focus({ preventScroll: true });
});
$('#bk-again').addEventListener('click', () => {
  booker.reset(); booker.classList.remove('is-done');
  $('#bk-done').hidden = true; $('.bk-inner', booker).hidden = false; bkName.focus({ preventScroll: true });
});

/* ---------------------------------------------------------------- WhatsApp chat preview */
const wa = $('#wa'), waBody = $('#wa-body');
const replies = [
  ['Send me the price sheet', 'Sent! Homes start at ₹96 lakh for a 2 BHK, ₹1.28 Cr for a 3 BHK and ₹1.86 Cr for a sky villa. The PDF has floor-wise rates and the payment plan.'],
  ['Is 5:30 pm free today?', 'Yes, today’s 5:30 pm golden hour slot is open. Shall I book it in your name and send a cab?'],
  ['East-facing 2 BHKs?', 'We have 14 east-facing 2 BHKs left in Tower C, from floor 6 to 18. Morning sun, and the clubhouse lawn below.']
];
function openChat() { wa.hidden = false; setMenu(false); $('.wa-x', wa).focus({ preventScroll: true }); }
function closeChat() { if (wa) wa.hidden = true; }
$$('[data-wa]').forEach(b => b.addEventListener('click', () => (wa.hidden ? openChat() : closeChat())));
$('.wa-x', wa).addEventListener('click', closeChat);
$$('.wa-quick button', wa).forEach(b => b.addEventListener('click', () => {
  const [q, a] = replies[+b.dataset.q];
  const add = (cls, html) => { const el = document.createElement('div'); el.className = 'bub ' + cls; el.innerHTML = html; waBody.appendChild(el); waBody.scrollTop = waBody.scrollHeight; return el; };
  add('bub-out', q);
  const typing = add('bub-in bub-typing', '<i></i><i></i><i></i>');
  setTimeout(() => { typing.remove(); add('bub-in', a); }, 1000);
}));

/* ---------------------------------------------------------------- 08 FAQ */
$$('.q button').forEach(b => b.addEventListener('click', () => {
  const panel = $('#' + b.getAttribute('aria-controls'));
  const open = b.getAttribute('aria-expanded') === 'true';
  b.setAttribute('aria-expanded', String(!open));
  if (open) {
    if (gsap && !reduced) gsap.to(panel, { height: 0, duration: 0.45, ease: 'power3.inOut', onComplete: () => { panel.hidden = true; panel.style.height = ''; if (ST) ST.refresh(); } });
    else panel.hidden = true;
  } else {
    panel.hidden = false;
    if (gsap && !reduced) gsap.fromTo(panel, { height: 0 }, { height: panel.scrollHeight, duration: 0.5, ease: 'power3.out', onComplete: () => { panel.style.height = ''; if (ST) ST.refresh(); } });
  }
}));

/* ---------------------------------------------------------------- magnetic buttons (desktop pointer only) */
if (!mobile && !HX.embed && !reduced && window.matchMedia('(pointer: fine)').matches) {
  $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ---------------------------------------------------------------- motion: splits, reveals, counters */
function motion() {
  const show = (els) => els.forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  if (!gsap || !ST || reduced) { root.classList.add('intro-done'); show($$('[data-reveal]')); return; }
  const h1 = $('#hero-title');
  if (Split) {
    const s = Split.create(h1, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    gsap.from(s.lines, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: 0.25 });
  }
  gsap.from([$('.cap-0 .eyebrow'), $('.cap-0 .lede'), $('.cap-0 .poss'), $('.cap-0 .ctas'), $('.lightclock'), $('.hero-coord')].filter(Boolean),
    { opacity: 0, y: 18, duration: 1.1, ease: 'power3.out', stagger: 0.08, delay: 0.55, clearProps: 'transform,opacity' });
  root.classList.add('intro-done');
  if (Split) $$('[data-split]').forEach(el => {
    const s = Split.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    gsap.from(s.lines, { yPercent: 110, duration: 1.15, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 92%' } });
  });
  ST.batch('[data-reveal]', { start: 'top 95%', onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', stagger: 0.06, overwrite: true }) });
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, dec = +(el.dataset.dec || 0), o = { v: 0 };
    el.textContent = (0).toFixed(dec);
    ST.create({ trigger: el, start: 'top 95%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = o.v.toFixed(dec); } }) });
  });
  // safety net: never leave content hidden
  setTimeout(() => { $$('[data-reveal]').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && getComputedStyle(el).opacity === '0') gsap.to(el, { opacity: 1, y: 0, duration: 0.6 }); }); }, 3200);
}
const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
fontsReady.then(() => { motion(); if (ST) ST.refresh(); });
setTimeout(() => root.classList.add('intro-done'), 4000);
window.addEventListener('load', () => { if (ST) ST.refresh(); setTimeout(() => { if (!sceneOk) HX.ready(); }, 2500); });
