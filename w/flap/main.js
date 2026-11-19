import { Board, sizeBoard, every, start } from './flap.js';
import { poster, barcode } from './posters.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: innerWidth < 760 ? 'mobile' : 'desktop', reducedMotion: false, ready() {}, on() {} };
const { gsap, ScrollTrigger } = window;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
const RM = !!HX.reducedMotion;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const mob = () => document.documentElement.clientWidth < 760;
const wait = (ms) => new Promise((res) => { const stop = every(ms, () => { stop(); res(); }, ms); });
start();

/* ---------- grain ---------- */
(() => {
  const c = document.createElement('canvas'); c.width = c.height = 160;
  const x = c.getContext('2d'); const d = x.createImageData(160, 160);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0);
  document.documentElement.style.setProperty('--grain', `url(${c.toDataURL('image/png')})`);
})();

/* ---------- trips ---------- */
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const TRIPS = [
  { code: 'KYOTO', cc: 'JP', n: 9, p: 2480, m: 10, d: 13, v: ['slow', 'culture', 'food'], st: 'BOARDING', name: 'Kyoto in maple season', why: 'Temple gardens at dawn, kaiseki dinners and a slow train into the mountains, with a host who grew up in Gion.' },
  { code: 'LISBON', cc: 'PT', n: 7, p: 1890, m: 4, d: 9, v: ['food', 'slow', 'warm'], st: 'ON TIME', name: 'Lisbon and the Alentejo coast', why: 'Tiled streets, grilled sardines and three days on a quiet Atlantic beach, led by a host who runs a tiny wine bar in Alfama.' },
  { code: 'REYKJAVIK', cc: 'IS', n: 6, p: 2750, m: 1, d: 12, v: ['wild'], st: 'GATE 4', name: 'Northern lights, Iceland', why: 'Aurora hunts with a forecaster on call, hot springs under the snow and a cabin with a sky-facing window.' },
  { code: 'OAXACA', cc: 'MX', n: 8, p: 2190, m: 2, d: 14, v: ['food', 'culture', 'warm'], st: '3 SEATS LEFT', sh: '3 LEFT', name: 'Oaxaca for the food', why: 'Seven moles in eight days, a mezcal palenque in the hills and market mornings with a chef who cooks for her village.' },
  { code: 'MARRAKESH', cc: 'MA', n: 7, p: 1740, m: 3, d: 3, v: ['culture', 'wild'], st: 'ON TIME', name: 'Marrakesh and the Atlas', why: 'Riads, souks and two nights in a guesthouse high in the Atlas, with a host who knows every rooftop in the medina.' },
  { code: 'PATAGONIA', cc: 'AR', n: 12, p: 3960, m: 0, d: 20, v: ['wild'], st: 'FINAL CALL', sh: 'CLOSING', name: 'Patagonia on foot', why: 'Five trail days under granite towers, refugio dinners and a glacier lake you can only reach by walking.' },
  { code: 'HOKKAIDO', cc: 'JP', n: 10, p: 3120, m: 1, d: 6, v: ['wild', 'food'], st: 'WAITLIST', name: 'Hokkaido in deep snow', why: 'Powder mornings, onsen afternoons and crab markets at dawn, with a host who has skied these hills since she was four.' },
  { code: 'DOLOMITES', cc: 'IT', n: 7, p: 2340, m: 8, d: 12, v: ['wild', 'slow'], st: 'ON TIME', name: 'Dolomites hut to hut', why: 'Rifugio to rifugio across limestone towers, with polenta, strudel and a host who has walked every path twice.' },
  { code: 'KERALA', cc: 'IN', n: 9, p: 1980, m: 11, d: 4, v: ['slow', 'warm', 'food'], st: 'BOARDING', name: 'Kerala backwaters', why: 'A night on a rice barge, spice gardens in the hills and a cooking class in a Kochi family kitchen.' },
  { code: 'TBILISI', cc: 'GE', n: 8, p: 1690, m: 9, d: 9, v: ['food', 'culture'], st: 'GATE 2', name: 'Tbilisi and the wine valleys', why: 'Sulphur baths, long supra feasts and amber wine poured from clay jars, with a host who makes her own.' },
  { code: 'AZORES', cc: 'PT', n: 6, p: 1560, m: 6, d: 11, v: ['wild', 'warm', 'slow'], st: 'ON TIME', name: 'The Azores by sea', why: 'Crater lakes, whale watching at sunrise and swims in natural pools between black lava rocks.' },
  { code: 'HANOI', cc: 'VN', n: 10, p: 2290, m: 2, d: 28, v: ['food', 'culture'], st: '2 SEATS LEFT', sh: '2 LEFT', name: 'Hanoi to Hoi An', why: 'Street food at dawn, a night train south and lantern-lit Hoi An, with a host who knows which noodle stall is worth the queue.' },
  { code: 'SICILY', cc: 'IT', n: 8, p: 2420, m: 5, d: 6, v: ['food', 'warm', 'slow'], st: 'BOARDING', name: 'Sicily, slowly', why: 'Baroque towns, lemon groves and long lunches by the sea, with a host whose grandmother still makes the cannoli.' },
  { code: 'NAMIBIA', cc: 'NA', n: 11, p: 3580, m: 7, d: 15, v: ['wild'], st: 'GATE 7', name: 'Namibia under the stars', why: 'Red dunes at sunrise, desert elephants and a sky so dark the Milky Way casts a shadow.' },
  { code: 'FAROE IS', cc: 'FO', n: 5, p: 1980, m: 5, d: 20, v: ['wild', 'slow'], st: 'ON TIME', name: 'The Faroe Islands', why: 'Grass-roofed villages, cliff walks above puffin colonies and dinner in a farmhouse kitchen.' },
];
const SLOT_TIMES = ['09:40', '11:15', '13:05', '14:50', '16:20', '18:45'];
const statusCol = (s) => (/BOARD|FINAL|LEFT|CLOS/.test(s) ? 'y' : /WAIT/.test(s) ? 'g' : ' ');
const price = (p) => '$' + p.toLocaleString('en-US');

/* ---------- hero board ---------- */
const boardEl = $('#board'), rowsEl = $('#boardRows'), headEl = $('#boardHead');
let board = null, layout = '', slots = [0, 1, 2, 3, 4, 5], introDone = false, lastSlot = -1;
const LAYOUT = { d: { cols: 42, rows: 6, slots: 6 }, m: { cols: 18, rows: 8, slots: 4 } };

function rowD(slot, t) {
  return {
    text: SLOT_TIMES[slot] + ' ' + t.code.padEnd(10) + ' ' + t.cc + ' ' + (t.n + ' NIGHTS').padEnd(9) + ' ' + t.st.padEnd(12),
    colors: 'yyyyy' + ' '.repeat(12) + 'gg ' + 'g'.repeat(9) + ' ' + statusCol(t.st).repeat(12),
  };
}
function rowsM(slot, t) {
  const s = t.sh || t.st;
  return [
    { text: SLOT_TIMES[slot] + ' ' + t.code.padEnd(9) + ' ' + t.cc, colors: 'yyyyy' + ' '.repeat(11) + 'gg' },
    { text: (t.n + ' NIGHTS').padEnd(10) + s.padStart(8), colors: 'g'.repeat(10) + statusCol(t.st).repeat(8) },
  ];
}
function writeSlot(slot, o = {}) {
  const t = TRIPS[slots[slot]];
  if (layout === 'd') return board.setRow(slot, rowD(slot, t).text, { colors: rowD(slot, t).colors, ...o });
  const [a, b] = rowsM(slot, t);
  const t1 = board.setRow(slot * 2, a.text, { colors: a.colors, ...o });
  const t2 = board.setRow(slot * 2 + 1, b.text, { colors: b.colors, ...o, delay: (o.delay || 0) + 90 });
  return Math.max(t1, t2);
}
function buildBoard() {
  const L = boardEl.clientWidth < 720 ? 'm' : 'd';
  if (L === layout) { sizeHero(); return false; }
  layout = L;
  const cfg = LAYOUT[L];
  board = new Board(rowsEl, cfg.rows, cfg.cols, { groupEvery: L === 'm' ? 2 : 0 });
  sizeHero();
  return true;
}
function sizeHero() {
  const cfg = LAYOUT[layout];
  const { cw, gap } = sizeBoard(boardEl, cfg.cols, { ratio: layout === 'd' ? 1.46 : 1.48, fs: 1.3 });
  const at = (c) => c * (cw + gap) + 'px';
  const labels = layout === 'd' ? [['Time', 0], ['Destination', 6], ['Trip', 17], ['Status', 30]] : [['Time', 0], ['Destination', 6], ['Status', 12]];
  headEl.innerHTML = labels.map(([l, c]) => `<span style="left:${at(c)}">${l}</span>`).join('');
}
function centerText(msg, cols) { const pad = Math.max(0, Math.floor((cols - msg.length) / 2)); return ' '.repeat(pad) + msg; }

async function introBoard() {
  const cfg = LAYOUT[layout];
  slots = layout === 'd' ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3];
  if (RM) { for (let s = 0; s < cfg.slots; s++) writeSlot(s, { instant: true }); introDone = true; return; }
  const mid = layout === 'd' ? 2 : 3;
  const msg = 'WHERE TO NEXT?';
  const line = centerText(msg, cfg.cols);
  const colors = ' '.repeat(line.length - 1) + 'y';
  const t1 = board.setRow(mid, line, { sweep: 34, min: 5, max: 10, colors, jitter: 40 });
  await wait(t1 + 1500);
  board.setRow(mid, '', { sweep: 10, min: 2, max: 5 });
  let longest = 0;
  for (let s = 0; s < cfg.slots; s++) longest = Math.max(longest, writeSlot(s, { delay: 120 + s * 70, sweep: 12, min: 3, max: 8 }));
  await wait(longest);
  introDone = true;
}
function cycleBoard() {
  if (!introDone || document.hidden) return;
  const cfg = LAYOUT[layout];
  let slot; do { slot = Math.floor(Math.random() * cfg.slots); } while (slot === lastSlot && cfg.slots > 1);
  lastSlot = slot;
  const pool = TRIPS.map((_, i) => i).filter((i) => !slots.includes(i));
  slots[slot] = pool[Math.floor(Math.random() * pool.length)];
  writeSlot(slot, { sweep: 16, min: 4, max: 12 });
}

/* ---------- clock ---------- */
const clockHost = $('#clockFlap');
const clockBoard = new Board(clockHost, 1, 5);
let lastClock = '';
function tickClock() {
  const d = new Date();
  const s = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  if (s !== lastClock) { clockBoard.setRow(0, s, { sweep: 40, min: 2, max: 6, instant: RM }); lastClock = s; }
}

/* ---------- trip cards: posters + mini flaps ---------- */
$$('[data-poster]').forEach((el) => { el.innerHTML = poster(el.dataset.poster); });
$$('[data-stamp]').forEach((el) => { el.innerHTML = poster(el.dataset.stamp, true); });
$$('.barcode').forEach((el, i) => el.style.setProperty('--barcode', barcode(17 + i * 31)));
const minis = $$('.flaprow--mini').map((host) => {
  const text = host.dataset.flap.toUpperCase();
  const b = new Board(host, 1, text.length);
  const cut = text.indexOf(' ');
  const colors = 'y'.repeat(cut) + ' '.repeat(text.length - cut);
  return { host, b, text, colors, done: false };
});
const miniIO = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  const m = minis.find((x) => x.host === e.target);
  if (m && !m.done) { m.done = true; m.b.setRow(0, m.text, { colors: m.colors, sweep: 20, min: 3, max: 7, jitter: 40, instant: RM }); }
  miniIO.unobserve(e.target);
}), { threshold: 0.3 });
minis.forEach((m) => miniIO.observe(m.host));

/* phone: the trips carousel nudges itself forward inside the menu frame */
(() => {
  const grid = $('#tripsGrid');
  let vis = false, idx = 0;
  new IntersectionObserver((es) => { vis = es[0].isIntersecting && es[0].intersectionRatio > 0.5; }, { threshold: [0, 0.5, 0.8] }).observe(grid);
  if (!HX.embed) return;
  every(2600, () => {
    if (!vis || !mob()) return;
    const cards = $$('.trip', grid); idx = (idx + 1) % cards.length;
    grid.scrollTo({ left: cards[idx].offsetLeft - (grid.clientWidth - cards[idx].clientWidth) / 2, behavior: 'smooth' });
  });
})();

/* ---------- trip builder ---------- */
const monthsEl = $('#months');
monthsEl.insertAdjacentHTML('beforeend', MON.map((m, i) => `<label><input type="radio" name="month" value="${i}"${i === 10 ? ' checked' : ''}><span>${m}</span></label>`).join(''));
const resultHost = $('#resultRows');
const resultBoard = new Board(resultHost, 2, 16);
sizeBoard($('.board--result'), 16, { ratio: 1.5, max: 42, fs: 1.24 });
const VIBE = { slow: 'slow and scenic', food: 'food first', wild: 'wild and remote', culture: 'a culture deep dive', warm: 'warm water' };
function match(vibe, month) {
  const c = TRIPS.filter((t) => t.v.includes(vibe));
  let best = c[0], bd = 99;
  c.forEach((t) => { const d = Math.min((t.m - month + 12) % 12, (month - t.m + 12) % 12); if (d < bd) { bd = d; best = t; } });
  return { t: best, exact: bd === 0 };
}
function renderResult(animate = true) {
  const vibe = $('input[name="vibe"]:checked').value;
  const month = +$('input[name="month"]:checked').value;
  const { t, exact } = match(vibe, month);
  const r1 = `${MON[t.m]} ${String(t.d).padStart(2, '0')} ${t.code.padEnd(9)}`;
  const r2 = (t.n + ' NIGHTS').padEnd(9) + price(t.p).padStart(7);
  const o = { sweep: 22, min: 4, max: 11, instant: !animate || RM };
  resultBoard.setRow(0, r1, { ...o, colors: 'yyyyyy' });
  resultBoard.setRow(1, r2, { ...o, delay: 120, colors: 'g'.repeat(9) + 'y'.repeat(7) });
  $('#resultKicker').textContent = exact ? `Best match for ${VIBE[vibe]} in ${MONTH[month]}` : `Closest ${VIBE[vibe]} departure to ${MONTH[month]}`;
  $('#resultName').textContent = t.name;
  $('#resultWhy').textContent = t.why + ` ${t.n} nights, ${price(t.p)} per person.`;
}
$('#vibes').addEventListener('change', () => { userTouched = true; renderResult(); });
monthsEl.addEventListener('change', () => { userTouched = true; renderResult(); });
let userTouched = false;
(() => {
  if (!HX.embed) return;
  const script = [['food', 2], ['wild', 1], ['warm', 5], ['culture', 3], ['slow', 10]];
  let k = 0, vis = false;
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; }, { threshold: 0.35 }).observe($('#builder'));
  every(2900, () => {
    if (!vis || userTouched) return;
    const [v, m] = script[k++ % script.length];
    $(`input[name="vibe"][value="${v}"]`).checked = true;
    $(`input[name="month"][value="${m}"]`).checked = true;
    renderResult();
  });
})();

/* ---------- newsletter ---------- */
const letterBoard = new Board($('#letterRows'), 1, 17);
sizeBoard($('.board--letter'), 17, { ratio: 1.5, max: 30, fs: 1.24 });
$('#signup').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('#email').value.trim();
  const ok = /.+@.+\..+/.test(v);
  if (ok) {
    letterBoard.setRow(0, 'SEE YOU AT GATE 1', { sweep: 30, min: 5, max: 12, colors: ' '.repeat(16) + 'y' });
    $('#signupMsg').textContent = 'You are on the list. The next letter lands December 1.';
    $('#email').value = '';
  } else {
    letterBoard.setRow(0, 'CHECK YOUR EMAIL', { sweep: 24, min: 3, max: 8 });
    $('#signupMsg').textContent = 'That address looks off. Try again?';
  }
});

/* ---------- mobile menu with flapping labels ---------- */
const burger = $('#burger'), menu = $('#menu');
const menuFlaps = $$('.menu__links a').map((a) => {
  const label = a.dataset.flap; const host = $('.menu__flap', a);
  return { b: new Board(host, 1, label.length), label };
});
function setMenu(open) {
  menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', String(!open));
  burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menuFlaps.forEach((m, i) => m.b.setRow(0, open ? m.label : '', { delay: open ? 120 + i * 70 : 0, sweep: 26, min: 3, max: 9, instant: !open || RM }));
}
burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
$$('.menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------- nav ---------- */
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('is-solid', scrollY > 30);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* ---------- stats + reveals ---------- */
function reveals() {
  if (RM || !gsap) return;
  $$('[data-count]').forEach((el) => {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
    const o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 1.6, ease: 'expo.out', onUpdate: () => { el.textContent = o.v.toFixed(dec) + suf; } }) });
  });
  $$('.sec-head').forEach((h) => gsap.from(h.children, { y: 28, opacity: 0, duration: 1, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 88%' } }));
  gsap.from('.trip', { y: 50, opacity: 0, duration: 1.1, stagger: 0.09, ease: 'power3.out', scrollTrigger: { trigger: '#tripsGrid', start: 'top 85%' } });
  gsap.from('.pass', { y: 40, opacity: 0, rotate: (i) => (i % 2 ? 1.5 : -1.5), duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.passes', start: 'top 85%' } });
  gsap.from('.postcard', { y: 60, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.cards', start: 'top 85%' } });
  gsap.from('.hero__copy > *', { y: 30, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'power3.out', delay: 0.3 });
}

/* ---------- boot ---------- */
let rT = 0;
addEventListener('resize', () => {
  clearTimeout(rT);
  rT = setTimeout(() => {
    const rebuilt = buildBoard();
    if (rebuilt) { introDone = true; slots = layout === 'd' ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3]; for (let s = 0; s < LAYOUT[layout].slots; s++) writeSlot(s, { instant: true }); }
    sizeMinis();
    if (ScrollTrigger) ScrollTrigger.refresh();
  }, 180);
});
function sizeMinis() {
  sizeBoard($('.board--result'), 16, { ratio: 1.5, max: 42, fs: 1.24 });
  sizeBoard($('.board--letter'), 17, { ratio: 1.5, max: 30, fs: 1.24 });
}

async function boot() {
  try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]); } catch (e) {}
  buildBoard();
  sizeMinis();
  renderResult(false);
  letterBoard.setRow(0, 'NEXT LETTER DEC 1', { instant: true, colors: ' '.repeat(12) + 'yyyyy' });
  tickClock(); every(5000, tickClock);
  reveals();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    HX.ready();
    introBoard().then(() => every(3300, cycleBoard, 2600));
  }));
}
boot();
