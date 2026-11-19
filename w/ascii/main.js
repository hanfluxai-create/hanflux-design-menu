import { createAsciiHero } from './ascii.js';
import { initMap } from './worldmap.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, paused: false, on() {}, ready() {} };
const root = document.documentElement;
root.classList.add('js');
const mobile = HX.device === 'mobile' || window.innerWidth < 760;
const fine = window.matchMedia('(pointer: fine)').matches && !HX.embed;
const RM = !!HX.reducedMotion;
const gsap = window.gsap;
const ST = window.ScrollTrigger;
if (gsap && ST) {
  gsap.registerPlugin(ST);
  if (window.ScrambleTextPlugin) gsap.registerPlugin(window.ScrambleTextPlugin);
}
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const onScreen = (el, cb, margin = '0px') => {
  const io = new IntersectionObserver((e) => cb(e[0].isIntersecting), { rootMargin: margin });
  io.observe(el);
};

/* ---------- nav + menu ---------- */
const nav = $('.nav');
const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
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

/* ---------- hero: ASCII padlock ---------- */
const heroEl = $('#hero');
const canvas = $('.hero__gl');
const term = $('#term');
let hero = null;
if (term) term.style.minHeight = term.offsetHeight + 'px';

const fontGate = Promise.race([
  document.fonts ? document.fonts.load('700 16px "JetBrains Mono"') : Promise.resolve(),
  sleep(1400),
]).catch(() => {});

fontGate.then(() => {
  try {
    hero = createAsciiHero(canvas, heroEl, {
      mobile,
      lite: HX.lite,
      interactive: fine,
      navH: nav.offsetHeight,
      quiet: () => {
        const c = $('.hero__copy');
        if (!c) return null;
        const r = c.getBoundingClientRect(), hr = heroEl.getBoundingClientRect();
        return { x0: r.left - hr.left - 24, y0: r.top - hr.top - 24, x1: r.right - hr.left + 24, y1: r.bottom - hr.top + 24 };
      },
      onFirstFrame: () => HX.ready(),
    });
  } catch (e) {
    hero = null;
  }
  if (!hero) { heroEl.classList.add('no-gl'); HX.ready(); }
  if (document.fonts && hero) document.fonts.ready.then(() => hero.rebuildAtlas());
});
runTerminal();

/* hero intro */
if (gsap && !RM) {
  const hl = $('.hl');
  gsap.from('.hero__copy > *', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.1 });
  if (hl) gsap.fromTo(hl, { '--hl': 0 }, { '--hl': 1, duration: 0.7, ease: 'expo.inOut', delay: 0.55 });
  gsap.from('.term', { y: 24, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.35 });
}

/* terminal: types the scan, drives the lock's scanner and breach */
function runTerminal() {
  if (!term) return;
  if (RM) return;
  const cmd = '$ blackline scan --target acme-retail.com';
  const lines = [
    { pre: '  resolving scope ', dots: 8, res: '<span class="c-ok">14 hosts, 3 clouds</span>' },
    { pre: '  fingerprinting ', dots: 9, res: '<span class="c-ok">213 open ports</span>' },
    { html: '  <span class="c-crit">CRIT</span> auth bypass on /api/v2/session', breach: true },
    { html: '  <span class="c-high">HIGH</span> exposed .git on staging host' },
    { html: '  <span class="c-high">HIGH</span> admin panel reachable without MFA' },
    { html: '  <span class="c-med">MED </span> TLS 1.0 on the mail gateway' },
    { html: '  <span class="c-dim">done in 00:41:07 · 3 crit · 7 high · 19 med</span>' },
    { html: '<span class="c-ok">&gt; report sent. we fix it before they find it.</span>' },
  ];
  const cur = '<span class="cur"></span>';
  const head = '<span class="c-dim"># engagement 4471 · scope signed 17 nov 2026</span>\n';
  let firstRun = true;
  (async function play() {
    for (;;) {
      let out = head;
      const quick = firstRun;
      firstRun = false;
      term.innerHTML = out + cur;
      await sleep(quick ? 120 : 260);
      if (!quick) {
        for (let i = 1; i <= cmd.length; i++) {
          term.innerHTML = out + '<span class="c-cmd">' + esc(cmd.slice(0, i)) + '</span>' + cur;
          await sleep(i < 3 ? 60 : 16 + Math.random() * 18);
        }
      }
      out += '<span class="c-cmd">' + esc(cmd) + '</span>\n';
      term.innerHTML = out + cur;
      await sleep(quick ? 120 : 240);
      if (hero) hero.scan(quick ? 1.3 : 2.2);
      for (const L of lines) {
        if (L.dots) {
          for (let d = 1; d <= L.dots; d++) { term.innerHTML = out + L.pre + '.'.repeat(d) + cur; await sleep(quick ? 30 : 46); }
          out += L.pre + '.'.repeat(L.dots) + ' ' + L.res + '\n';
          term.innerHTML = out + cur;
          await sleep(quick ? 90 : 150);
        } else {
          out += L.html + '\n';
          term.innerHTML = out + cur;
          if (L.breach && hero) hero.breach();
          await sleep(L.breach ? (quick ? 380 : 560) : (quick ? 220 : 340));
        }
      }
      await sleep(7200);
      while (HX.paused) await sleep(500);
    }
  })();
}

/* status bar: utc clock + events counter */
const utcEl = $('#utc');
const evEl = $('#evtoday');
let evCount = 2918404117;
function tickStatus() {
  if (utcEl) utcEl.textContent = new Date().toISOString().slice(11, 19);
  evCount += 9000 + Math.floor(Math.random() * 42000);
  if (evEl) evEl.textContent = fmt(evCount);
}
tickStatus();
setInterval(() => { if (!HX.paused) tickStatus(); }, 1000);

/* ---------- live threat feed ---------- */
const log = $('#log');
const EV = [
  ['crit', 'shadow copies deleted on {client} file server', 'CONTAINED'],
  ['crit', 'lateral movement over a remote service on {client}', 'CONTAINED'],
  ['crit', 'ransomware note dropped in a test share, {client}', 'CONTAINED'],
  ['high', 'impossible travel login, finance admin', 'ESCALATED'],
  ['high', 'mailbox rule forwarding to an outside address', 'CONTAINED'],
  ['high', 'new admin created outside the change window', 'ESCALATED'],
  ['high', 'service account used from {ip}', 'ESCALATED'],
  ['med', 'password spray, {n} attempts from {ip}', 'BLOCKED'],
  ['med', 'MFA push fatigue burst on {client}', 'BLOCKED'],
  ['med', 'beacon to a domain registered {h} hours ago', 'BLOCKED'],
  ['med', 'DNS tunnelling pattern from {client}', 'TRIAGED'],
  ['med', 'macro document opened by a new hire', 'TRIAGED'],
  ['low', 'port scan from {ip}', 'CLOSED'],
  ['low', 'expired certificate on a staging host', 'TICKETED'],
  ['low', 'login attempt from an anonymising relay', 'BLOCKED'],
  ['low', 'outdated plugin on the marketing site', 'TICKETED'],
];
const ip = () => ['203.0.113.', '198.51.100.', '192.0.2.'][Math.floor(Math.random() * 3)] + (2 + Math.floor(Math.random() * 250));
const client = () => 'client-' + String(1 + Math.floor(Math.random() * 24)).padStart(2, '0');
function pickEvent() {
  const r = Math.random();
  const sev = r < 0.08 ? 'crit' : r < 0.28 ? 'high' : r < 0.7 ? 'med' : 'low';
  const pool = EV.filter((e) => e[0] === sev);
  return pool[Math.floor(Math.random() * pool.length)];
}
let clock = Date.now() - 1500;
if (log) {
  // re-time the static entries so the log ends at "now"
  const items = $$('li', log);
  items.forEach((li, i) => {
    const t = Date.now() - (items.length - i) * 2300;
    $('time', li).textContent = new Date(t).toISOString().slice(11, 19);
  });
}
function addEvent() {
  clock = Math.min(Date.now(), clock + 700 + Math.random() * 2200);
  const [sev, d, st] = pickEvent();
  const desc = d.replace('{ip}', ip()).replace('{client}', client()).replace('{n}', String(80 + Math.floor(Math.random() * 900))).replace('{h}', String(1 + Math.floor(Math.random() * 9)));
  const li = document.createElement('li');
  li.className = 'ev ev--' + sev + ' is-new';
  li.innerHTML = `<time>${new Date(clock).toISOString().slice(11, 19)}</time><b>${sev.toUpperCase()}</b><span class="ev__d"></span><em>${st}</em>`;
  $('.ev__d', li).textContent = desc;
  log.appendChild(li);
  if (gsap) {
    gsap.fromTo(log, { y: li.offsetHeight }, { y: 0, duration: 0.55, ease: 'power3.out', overwrite: true });
    gsap.fromTo(li, { opacity: 0 }, { opacity: 1, duration: 0.5 });
  }
  setTimeout(() => li.classList.remove('is-new'), 1700);
  while (log.children.length > 16) log.removeChild(log.firstElementChild);
}
let feedOn = false;
(async function feedLoop() {
  for (;;) {
    await sleep(850 + Math.random() * 1100);
    if (feedOn && !HX.paused && log) addEvent();
  }
})();
if (log) onScreen($('#feed'), (v) => { feedOn = v; }, '100px');

/* ASCII world map */
const blockedEl = $('#blocked');
let blocked = 1204887;
const mapCanvas = $('.map__canvas');
function startMap() {
  try {
    initMap(mapCanvas, {
      mobile,
      onBlock: () => { blocked += 1 + Math.floor(Math.random() * 37); if (blockedEl) blockedEl.textContent = fmt(blocked); },
    });
  } catch (e) { /* map is decorative */ }
}
if (mapCanvas) fontGate.then(startMap);

/* ---------- stats ---------- */
const RAMP = ' .:-=+*#%@';
const sparks = $$('.stat__spark').map((el) => {
  let v = 0.4 + Math.random() * 0.4;
  const arr = [];
  for (let k = 0; k < 26; k++) { v = Math.max(0.08, Math.min(1, v + (Math.random() - 0.5) * 0.34)); arr.push(v); }
  return { el, arr, v };
});
const sch = (v) => RAMP[Math.max(1, Math.min(9, Math.round(v * 9)))];
function renderSpark(s) { s.el.innerHTML = s.arr.slice(0, -1).map(sch).join('') + '<i>' + sch(s.arr[s.arr.length - 1]) + '</i>'; }
sparks.forEach(renderSpark);
let statsOn = false;
setInterval(() => {
  if (!statsOn || HX.paused) return;
  sparks.forEach((s) => {
    s.v = Math.max(0.08, Math.min(1, s.v + (Math.random() - 0.5) * 0.36));
    s.arr.shift(); s.arr.push(s.v); renderSpark(s);
  });
}, 650);
onScreen($('#stats'), (v) => { statsOn = v; }, '60px');

/* ASCII load chart */
const chart = $('#chart');
if (chart) {
  let cols = 80, rows = 8, data = [], tk = 0, lastW = 0;
  const gen = () => {
    tk += 1;
    const base = 0.34 + 0.16 * Math.sin(tk * 0.085) + 0.09 * Math.sin(tk * 0.23 + 1.3);
    const spike = Math.random() < 0.055 ? 0.32 + Math.random() * 0.3 : 0;
    return Math.max(0.06, Math.min(1, base + (Math.random() - 0.5) * 0.12 + spike));
  };
  const charW = () => {
    const s = document.createElement('span');
    s.textContent = '0000000000';
    s.style.visibility = 'hidden';
    chart.appendChild(s);
    const w = s.getBoundingClientRect().width / 10;
    s.remove();
    return w || 7.2;
  };
  const AX = 6;
  function draw() {
    let html = '';
    for (let r = rows; r >= 1; r--) {
      const lab = r === rows ? '40k' : (r === Math.ceil(rows / 2) ? '20k' : '');
      html += '<span class="ax">' + lab.padStart(4) + ' |</span>';
      let run = '', cls = '';
      for (let c = 0; c < cols; c++) {
        const v = data[c] * rows;
        let ch = ' ', k = '';
        if (v >= r) { ch = '#'; k = data[c] > 0.7 ? 'hi' : 'lo'; }
        else if (v >= r - 0.5) { ch = '.'; k = data[c] > 0.7 ? 'hi' : 'lo'; }
        if (c === cols - 1 && ch !== ' ') k = 'now';
        if (k !== cls) { if (run) html += cls ? `<i class="${cls}">${run}</i>` : run; run = ''; cls = k; }
        run += ch;
      }
      if (run) html += cls ? `<i class="${cls}">${run}</i>` : run;
      html += '\n';
    }
    html += '<span class="ax">     +' + '-'.repeat(cols) + '</span>\n';
    const line = ' '.repeat(cols + AX).split('');
    ['-24h', '-18h', '-12h', '-6h', 'now'].forEach((L, i) => {
      const pos = AX + Math.round((cols - L.length) * i / 4);
      for (let j = 0; j < L.length; j++) line[pos + j] = L[j];
    });
    html += '<span class="ax">' + line.join('') + '</span>';
    chart.innerHTML = html;
  }
  function setup() {
    const w = chart.clientWidth;
    if (!w || Math.abs(w - lastW) < 2) return;
    lastW = w;
    const cs = getComputedStyle(chart);
    const inner = w - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    cols = Math.max(20, Math.floor(inner / charW()) - AX - 1);
    rows = window.innerWidth < 560 ? 6 : 8;
    while (data.length < cols) data.unshift(gen());
    data = data.slice(-cols);
    draw();
  }
  setup();
  new ResizeObserver(setup).observe(chart);
  if (document.fonts) document.fonts.ready.then(() => { lastW = 0; setup(); });
  setInterval(() => { if (!statsOn || HX.paused) return; data.shift(); data.push(gen()); draw(); }, 900);
}

if (gsap && ST) {
  $$('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || '0', 10);
    const o = { v: 0 };
    ST.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.fromTo(o, { v: 0 }, { v: target, duration: 1.2, ease: 'power3.out', onUpdate: () => { el.textContent = dec ? o.v.toFixed(dec) : fmt(o.v); } }),
    });
  });

  /* scramble-in headings */
  $$('[data-scramble]').forEach((h) => {
    const txt = h.textContent;
    h.setAttribute('aria-label', txt);
    if (RM || !window.ScrambleTextPlugin) return;
    ST.create({
      trigger: h, start: 'top 90%', once: true,
      onEnter: () => gsap.to(h, { duration: 0.9, ease: 'none', scrambleText: { text: txt, chars: '01<>/[]{}#*+=_', revealDelay: 0.12, speed: 0.9 } }),
    });
  });

  /* panel reveals */
  const rev = $$('[data-reveal]');
  if (!RM) {
    gsap.set(rev, { opacity: 0, y: 26 });
    ST.batch(rev, {
      start: 'top 92%', once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: true }),
    });
  }

  /* attack path types itself in */
  const pathItems = $$('#path li');
  if (pathItems.length && !RM) {
    gsap.set(pathItems, { clipPath: 'inset(-24px 100% 0 0)' });
    ST.create({
      trigger: '#path', start: 'top 85%', once: true,
      onEnter: () => gsap.to(pathItems, { clipPath: 'inset(-24px 0% 0 0)', duration: 0.42, ease: 'steps(16)', stagger: 0.15 }),
    });
  }

  /* hotline title glitch */
  const hot = $('.hot__title');
  if (hot && !RM) {
    ST.create({
      trigger: hot, start: 'top 85%', once: true,
      onEnter: () => gsap.fromTo(hot, { x: -6, skewX: 8, opacity: 0.2 }, { x: 0, skewX: 0, opacity: 1, duration: 0.5, ease: 'steps(6)' }),
    });
  }
}

/* ---------- magnetic buttons (desktop pointers only) ---------- */
if (fine && gsap) {
  $$('.magnet').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - (r.left + r.width / 2)) * 0.22, y: (e.clientY - (r.top + r.height / 2)) * 0.3, duration: 0.4, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' }));
  });
}

/* ---------- form ---------- */
const form = $('#pentest-form');
if (form) {
  const ok = $('.form__ok', form);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('[name="name"]', form), email = $('[name="email"]', form);
    const badName = !name.value.trim();
    const badMail = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim());
    name.classList.toggle('is-bad', badName);
    email.classList.toggle('is-bad', badMail);
    if (badName || badMail) {
      ok.style.color = 'var(--red)';
      ok.textContent = '> add your name and a work email so a tester can reach you.';
      return;
    }
    const ticket = 'BL-' + (48000 + Math.floor(Math.random() * 900));
    ok.style.color = '';
    ok.textContent = `request received. ticket ${ticket} is open and a lead tester will reply within 4 business hours.`;
    form.classList.add('is-sent');
    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    $('span', btn).textContent = 'Request sent';
  });
}

/* keep layout-dependent pieces fresh after fonts settle */
if (document.fonts) document.fonts.ready.then(() => { if (ST) ST.refresh(); });
