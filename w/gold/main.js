// Varelle · page choreography: hero chapters, the ring builder, reveals, forms and the chat sheet.
import { createRing } from './ring.js';
import { buildStone } from './gem.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, paused: false, on() {}, ready() {} };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const root = document.documentElement;
root.classList.add('js');
const stacked = () => window.innerWidth < 760 || window.innerWidth / window.innerHeight < 0.82;
const MOBILE = HX.device === 'mobile' || window.innerWidth < 760;
const LITE = !!HX.lite || MOBILE;
const REDUCED = !!HX.reducedMotion;
const FINE = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
const { gsap, ScrollTrigger, SplitText, DrawSVGPlugin } = window;
gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

/* Indian digit grouping: 4,14,700 */
function inr(n) {
  const s = String(Math.round(n));
  if (s.length <= 3) return s;
  return s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3);
}

/* ---------- smooth scroll, nav, menu ---------- */
let lenis = null;
if (!HX.embed && !REDUCED && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const nav = $('#nav'), menu = $('#menu'), menuBtn = $('#menuBtn');
function closeMenu() {
  if (!menu.classList.contains('open')) return;
  menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true');
  menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu');
  lenis && lenis.start();
}
menuBtn.addEventListener('click', () => {
  if (menu.classList.contains('open')) return closeMenu();
  menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false');
  menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.setAttribute('aria-label', 'Close menu');
  lenis && lenis.stop();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); closeWA(); } });
function scrollToY(y) {
  if (lenis) lenis.scrollTo(y, { duration: 1.6 });
  else window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
}
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const h = a.getAttribute('href');
  if (h.length < 2) return;
  const el = h === '#top' ? null : $(h);
  if (h !== '#top' && !el) return;
  e.preventDefault(); closeMenu();
  scrollToY(el ? el.getBoundingClientRect().top + window.scrollY : 0);
}));

/* ---------- hero chapters ---------- */
const track = $('#track'), heroStage = $('#heroStage'), buildStage = $('#buildStage');
const heroIn = $('.hero-in'), caps = $$('.cap'), railItems = $$('.rail li'), hint = $('.scroll-hint');
const chip = $('.metal-chip'), metalName = $('#metalName'), rates = $('#rates');
const CH = [0, 0.33, 0.585, 0.97];
let trackTop = 0, trackSpan = 1;
function heroP() { return clamp((window.scrollY - trackTop) / trackSpan, 0, 1); }
function measure() {
  trackTop = track.getBoundingClientRect().top + window.scrollY;
  trackSpan = Math.max(1, track.offsetHeight - window.innerHeight);
  // tour stops: one per chapter. On wide screens the last one also brings the rate strip into view.
  CH.forEach((p, i) => { $('#m' + i).style.top = Math.round(p * trackSpan) + 'px'; });
  if (stacked()) {
    rates.setAttribute('data-tour', '2200'); rates.setAttribute('data-tour-offset', '-0.3');
  } else {
    rates.removeAttribute('data-tour'); rates.removeAttribute('data-tour-offset');
    $('#m3').style.top = Math.round(trackSpan + rates.offsetHeight) + 'px';
  }
}
const METALS = [['18K yellow gold', '#e8c06a'], ['18K rose gold', '#eaa58c'], ['Platinum 950', '#dfe2e6']];
let lastP = -1, lastMetal = -1, lastRail = -1;
function heroUI() {
  const p = heroP();
  if (Math.abs(p - lastP) < 0.0004) return;
  lastP = p;
  const ho = 1 - sstep(0.04, 0.12, p);
  heroIn.style.opacity = ho.toFixed(3);
  heroIn.style.transform = `translate3d(0, ${(-p * 220).toFixed(1)}px, 0)`;
  heroIn.style.visibility = ho < 0.01 ? 'hidden' : 'visible';
  hint.style.opacity = (1 - sstep(0, 0.04, p)).toFixed(3);
  const c = [sstep(0.17, 0.24, p) * (1 - sstep(0.44, 0.5, p)), sstep(0.49, 0.55, p) * (1 - sstep(0.69, 0.75, p)), sstep(0.8, 0.88, p)];
  caps.forEach((el, i) => {
    el.style.opacity = c[i].toFixed(3);
    el.style.visibility = c[i] < 0.01 ? 'hidden' : 'visible';
    el.style.translate = `0 ${((1 - c[i]) * 26).toFixed(1)}px`;
  });
  const r = p < 0.19 ? 0 : p < 0.47 ? 1 : p < 0.75 ? 2 : 3;
  if (r !== lastRail) { lastRail = r; railItems.forEach((li, i) => li.classList.toggle('on', i === r)); }
  const m = p < 0.19 ? 0 : p < 0.47 ? 1 : 2;
  if (m !== lastMetal) { lastMetal = m; metalName.textContent = METALS[m][0]; chip.style.setProperty('--mc', METALS[m][1]); }
  chip.style.opacity = (1 - sstep(0.7, 0.78, p)).toFixed(3);
}
$$('.rail button').forEach(b => b.addEventListener('click', () => {
  const i = +b.dataset.go;
  scrollToY(trackTop + CH[i] * trackSpan);
}));

/* ---------- the ring ---------- */
let ring = null, glReady = false, uiReady = false, sent = false;
const glCanvas = $('#ringGL'), HERO_LABEL = glCanvas.getAttribute('aria-label');
const ready = () => { if (!sent && glReady && uiReady) { sent = true; HX.ready && HX.ready(); } };
try {
  ring = createRing(glCanvas, {
    lite: LITE, fine: FINE, reduced: REDUCED, stacked, heroP,
    onFirstFrame: () => { glReady = true; ready(); }
  });
  setTimeout(() => { if (!glReady) { glReady = true; ready(); } }, 2600);
} catch (err) {
  ring = null;
  root.classList.add('no-gl');
  glCanvas.style.display = 'none';
  glReady = true;
}
function visiblePx(r) { return Math.max(0, Math.min(window.innerHeight, r.bottom) - Math.max(0, r.top)); }
function pickStage() {
  if (!ring) return;
  const hr = heroStage.getBoundingClientRect(), br = buildStage.getBoundingClientRect();
  const hv = visiblePx(hr), bv = visiblePx(br), vh = window.innerHeight;
  const near = r => r.bottom > -vh * 0.3 && r.top < vh * 1.3;
  let want = null;
  if (bv > 0 && bv >= hv) want = 'builder';
  else if (hv > 0) want = 'hero';
  else if (near(br)) want = 'builder';
  else if (near(hr)) want = 'hero';
  if (want && ring.view !== want) {
    ring.attach(want, want === 'hero' ? heroStage : buildStage);
    glCanvas.setAttribute('aria-label', want === 'hero' ? HERO_LABEL : 'Your solitaire, shown live in 3D with the metal, shape and carat you choose. Drag to turn it.');
  }
  ring.setRunning(hv > 0 || bv > 0);
}

/* ---------- ring builder ---------- */
const SETTING = { y: ['18K yellow gold', 42500], r: ['18K rose gold', 42500], p: ['platinum', 68000] };
const SHAPES = { round: ['Round brilliant', 1], oval: ['Oval', 0.88], cushion: ['Cushion', 0.82], princess: ['Princess', 0.8], emerald: ['Emerald cut', 0.84] };
const bForm = $('#bForm'), carat = $('#carat'), caratOut = $('#caratOut'), bRead = $('#bRead');
const estTotal = $('#estTotal'), estSet = $('#estSet'), estSetK = $('#estSetK'), estStone = $('#estStone'), estStoneK = $('#estStoneK'), estTax = $('#estTax');
const bPrice = document.createElement('p');
bPrice.className = 'b-price'; bPrice.setAttribute('aria-hidden', 'true');
$('.b-ui').appendChild(bPrice);
const build = { metal: 'y', shape: 'round', carat: 1, view: 'ring' };
const shown = { total: 0 };
function stoneMM(name, c) {
  const s = buildStone(name), k = (6.4 / (2 * buildStone('round').xmax)) * Math.cbrt(c);
  return [s.xmax * 2 * k, s.zmax * 2 * k];
}
function quote(b) {
  const stone = Math.round(360000 * Math.pow(b.carat, 1.55) * SHAPES[b.shape][1] / 100) * 100;
  const set = SETTING[b.metal][1];
  const tax = Math.round((stone + set) * 0.03);
  return { stone, set, tax, total: Math.round((stone + set + tax) / 100) * 100 };
}
function sizeText(b) {
  const [x, z] = stoneMM(b.shape, b.carat);
  return Math.abs(x - z) < 0.05 ? `${x.toFixed(1)} mm` : `${Math.max(x, z).toFixed(1)} × ${Math.min(x, z).toFixed(1)} mm`;
}
function renderBuild(animate = true) {
  const q = quote(build);
  caratOut.textContent = build.carat.toFixed(2) + ' ct';
  carat.style.setProperty('--p', ((build.carat - 0.5) / 2.5 * 100).toFixed(1) + '%');
  bRead.textContent = `${SHAPES[build.shape][0]} · ${build.carat.toFixed(2)} ct · approx. ${sizeText(build)}`;
  estSetK.textContent = `Setting, ${SETTING[build.metal][0]}`;
  estSet.textContent = '₹' + inr(q.set);
  estStoneK.textContent = `Stone, ${build.carat.toFixed(2)} ct ${build.shape}, certified`;
  estStone.textContent = '₹' + inr(q.stone);
  estTax.textContent = '₹' + inr(q.tax);
  gsap.killTweensOf(shown);
  const paint = () => { const v = inr(Math.round(shown.total / 100) * 100); estTotal.textContent = v; bPrice.textContent = '₹' + v; };
  if (animate && !REDUCED && shown.total) gsap.to(shown, { total: q.total, duration: 0.7, ease: 'power3.out', onUpdate: paint, onComplete: () => { shown.total = q.total; paint(); } });
  else { shown.total = q.total; paint(); }
  ring && ring.setBuild({ metal: build.metal, shape: build.shape, carat: build.carat, view: build.view });
}
bForm.addEventListener('change', e => {
  const t = e.target;
  if (t.name === 'metal') build.metal = t.value;
  if (t.name === 'shape') build.shape = t.value;
  stopDemo();
  renderBuild();
});
carat.addEventListener('input', () => { build.carat = parseFloat(carat.value); stopDemo(); renderBuild(false); });
bForm.addEventListener('submit', e => e.preventDefault());
const segBtns = $$('.b-ui .seg button');
function setView(v) {
  build.view = v;
  segBtns.forEach(b => b.setAttribute('aria-checked', String(b.dataset.view === v)));
  ring && ring.setBuild({ view: v });
}
segBtns.forEach(b => b.addEventListener('click', () => { stopDemo(); setView(b.dataset.view); }));

// drag to turn
let dragging = false, lastX = 0;
buildStage.addEventListener('pointerdown', e => {
  if (e.target.closest('.seg')) return;
  dragging = true; lastX = e.clientX; stopDemo();
});
window.addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - lastX; lastX = e.clientX;
  ring && ring.drag(dx);
}, { passive: true });
['pointerup', 'pointercancel'].forEach(ev => window.addEventListener(ev, () => { dragging = false; }));

// shape icons and facet plans, drawn from the same cutting planes as the 3D stone
const SVGNS = 'http://www.w3.org/2000/svg';
function planPaths(name, cls) {
  const st = buildStone(name);
  const s = st.plan.map(poly => 'M' + poly.map(p => p[0].toFixed(3) + ' ' + p[1].toFixed(3)).join('L') + 'Z').join('');
  const o = 'M' + st.outline.map(p => p[0].toFixed(3) + ' ' + p[1].toFixed(3)).join('L') + 'Z';
  return `<path class="${cls || ''}" d="${s}"/><path class="o" d="${o}"/>`;
}
$$('.sh').forEach(svg => { svg.innerHTML = planPaths(svg.dataset.shape); });
function facetPlan(svg, ticks) {
  const st = buildStone('round');
  let html = '';
  st.plan.forEach(poly => {
    const d = 'M' + poly.map(p => p[0].toFixed(4) + ' ' + p[1].toFixed(4)).join('L') + 'Z';
    html += `<path d="${d}"/>`;
  });
  html += '<path class="girdle" d="M1.02 0A1.02 1.02 0 1 1 -1.02 0A1.02 1.02 0 1 1 1.02 0Z"/>';
  if (ticks) {
    let t = '';
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2, r0 = 1.06, r1 = i % 8 === 0 ? 1.11 : 1.085;
      t += `M${(Math.cos(a) * r0).toFixed(4)} ${(Math.sin(a) * r0).toFixed(4)}L${(Math.cos(a) * r1).toFixed(4)} ${(Math.sin(a) * r1).toFixed(4)}`;
    }
    html += `<path class="tbl" d="${t}"/>`;
  }
  svg.innerHTML = `<defs><linearGradient id="fgr${svg.id}" gradientUnits="userSpaceOnUse" x1="-1.1" y1="-1.1" x2="1.1" y2="1.1"><stop offset="0" stop-color="#9a7431"/><stop offset=".3" stop-color="#ecc97a"/><stop offset=".5" stop-color="#fbeab8"/><stop offset=".7" stop-color="#cf9f48"/><stop offset="1" stop-color="#a47a33"/></linearGradient></defs><g style="stroke:url(#fgr${svg.id})">${html}</g>`;
}
facetPlan($('#facets'), true);
facetPlan($('#facets2'), false);

// a no-WebGL builder still shows the chosen shape
if (!ring) {
  const big = document.createElementNS(SVGNS, 'svg');
  big.setAttribute('viewBox', '-1.25 -1.25 2.5 2.5'); big.setAttribute('class', 'sh b-fall'); big.setAttribute('aria-hidden', 'true');
  buildStage.insertBefore(big, buildStage.firstChild);
  const upd = () => { big.innerHTML = planPaths(build.shape); };
  bForm.addEventListener('change', upd); upd();
}

// during the menu's auto-tour the builder plays with itself
const DEMO = [{ metal: 'r' }, { shape: 'oval' }, { carat: 1.5 }, { view: 'stone' }, { metal: 'p' }, { view: 'ring' }, { shape: 'cushion' }, { carat: 2 }, { metal: 'y' }, { shape: 'emerald' }, { carat: 1.25 }, { shape: 'round' }, { carat: 1 }];
let demoOn = false, demoI = 0, demoTimer = 0, demoStopped = false;
function demoStep() {
  if (HX.paused) return;
  const s = DEMO[demoI++ % DEMO.length];
  if (s.metal) { bForm.querySelector(`input[name="metal"][value="${s.metal}"]`).checked = true; build.metal = s.metal; renderBuild(); }
  if (s.shape) { bForm.querySelector(`input[name="shape"][value="${s.shape}"]`).checked = true; build.shape = s.shape; renderBuild(); }
  if (s.view) setView(s.view);
  if (s.carat) {
    const o = { c: build.carat };
    gsap.to(o, { c: s.carat, duration: 0.9, ease: 'power2.inOut', onUpdate: () => { build.carat = Math.round(o.c * 20) / 20; carat.value = build.carat; renderBuild(false); } });
  }
}
function startDemo() { if (demoOn || demoStopped) return; demoOn = true; demoTimer = setInterval(demoStep, 1250); setTimeout(demoStep, 500); }
function pauseDemo() { if (!demoOn) return; demoOn = false; clearInterval(demoTimer); }
function stopDemo() { demoStopped = true; pauseDemo(); }
if (HX.tour) {
  new IntersectionObserver(es => es.forEach(en => (en.isIntersecting ? startDemo() : pauseDemo())), { threshold: 0.35 }).observe(buildStage);
  ['wheel', 'touchstart', 'keydown'].forEach(ev => window.addEventListener(ev, () => { pauseDemo(); }, { passive: true }));
}

/* ---------- counters ---------- */
function runCount(el, dur = 1.8) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const end = parseFloat(el.dataset.count), from = parseFloat(el.dataset.from || '0');
  if (REDUCED) { el.textContent = inr(end); return; }
  const o = { v: from };
  el.textContent = inr(from);
  gsap.to(o, { v: end, duration: dur, ease: 'expo.out', onUpdate: () => { el.textContent = inr(o.v); }, onComplete: () => { el.textContent = inr(end); } });
}

/* ---------- reveals ---------- */
function reveals() {
  $$('[data-split]').forEach(el => {
    let lines;
    try { lines = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' }).lines; } catch (e) { lines = [el]; }
    gsap.set(el, { visibility: 'visible' });
    if (REDUCED) return;
    const inHero = !!el.closest('#heroStage');
    gsap.from(lines, { yPercent: 112, duration: 1.25, ease: 'expo.out', stagger: 0.1, delay: inHero ? 0.2 : 0, scrollTrigger: inHero ? null : { trigger: el, start: 'top 90%', once: true } });
  });
  if (REDUCED) gsap.set($$('[data-rise]'), { opacity: 1, y: 0 });
  else gsap.to($$('#heroStage [data-rise]'), { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.1, delay: 0.45 });
  if (!REDUCED) $$('[data-rise]').filter(el => !el.closest('#heroStage')).forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 93%', once: true } });
  });
  $$('[data-count]').forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 95%', once: true, onEnter: () => runCount(el, el.dataset.from ? 1.4 : 2) }));

  // line art draws itself in
  $$('.col-art .art, .store-art .art').forEach(svg => {
    const draw = $$('.b > *', svg), fade = $$('.f > *', svg);
    if (REDUCED) return;
    gsap.set(draw, { drawSVG: '0%' });
    gsap.set(fade, { opacity: 0 });
    ScrollTrigger.create({
      trigger: svg, start: 'top 88%', once: true, onEnter: () => {
        gsap.to(draw, { drawSVG: '100%', duration: 1.3, ease: 'power2.inOut', stagger: 0.035 });
        gsap.to(fade, { opacity: 1, duration: 0.6, ease: 'power1.out', stagger: { amount: 0.9 }, delay: 0.35 });
      }
    });
  });
  const sparks = $$('.rspark path');
  if (!REDUCED) {
    gsap.set(sparks, { drawSVG: '0%' });
    ScrollTrigger.create({ trigger: rates, start: 'top 92%', once: true, onEnter: () => gsap.to(sparks, { drawSVG: '100%', duration: 1.4, ease: 'power2.out', stagger: 0.15 }) });
    $$('.facets').forEach(svg => {
      const paths = $$('path', svg);
      gsap.set(paths, { drawSVG: '0%' });
      ScrollTrigger.create({ trigger: svg, start: 'top 85%', once: true, onEnter: () => gsap.to(paths, { drawSVG: '100%', duration: 1.6, ease: 'power2.inOut', stagger: { amount: 1.1, from: 'center' } }) });
    });
  }
}

/* ---------- appointment form ---------- */
const bookForm = $('#bookForm'), bDate = $('#bDate'), bNote = $('#bNote');
const field = n => bookForm.querySelector(`[name="${n}"]`);
function isoDay(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function setDefaultDate() {
  const now = new Date(), t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  bDate.min = isoDay(now); bDate.value = isoDay(t);
}
setDefaultDate();
bookForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = field('name'), phone = field('phone');
  let bad = null;
  if (phone.value.replace(/\D/g, '').length < 10) { phone.setAttribute('aria-invalid', 'true'); bad = phone; } else phone.removeAttribute('aria-invalid');
  if (name.value.trim().length < 2) { name.setAttribute('aria-invalid', 'true'); bad = name; } else name.removeAttribute('aria-invalid');
  if (bad) {
    bad.focus();
    bookForm.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 320 });
    return;
  }
  const first = name.value.trim().split(/\s+/)[0];
  const kind = bookForm.querySelector('input[name="kind"]:checked').value;
  const d = bDate.value ? new Date(bDate.value + 'T12:00:00') : null;
  const when = d && !isNaN(d) ? ' on ' + d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
  $('#okText').textContent = `Thank you, ${first}. A Varelle consultant will WhatsApp you within the hour to confirm your ${kind}${when}.`;
  bookForm.classList.add('sent');
  const r = bookForm.getBoundingClientRect();
  if (r.top < 0 || r.top > window.innerHeight * 0.5) scrollToY(r.top + window.scrollY - 90);
});
$('#bookAgain').addEventListener('click', () => { bookForm.reset(); setDefaultDate(); bookForm.classList.remove('sent'); });
$('#reserve').addEventListener('click', () => {
  const q = quote(build);
  bNote.value = `Reserve my design: ${SETTING[build.metal][0]} solitaire, ${build.shape} ${build.carat.toFixed(2)} ct (estimate ₹${inr(q.total)}).`;
  field('interest').value = 'Solitaire ring';
});
$$('a[data-city]').forEach(a => a.addEventListener('click', () => {
  field('city').value = a.dataset.city;
  const r = bookForm.querySelector('input[name="kind"][value="store visit"]');
  if (r) r.checked = true;
}));

/* ---------- WhatsApp-style chat sheet ---------- */
const wa = $('#wa'), waBody = $('#waBody'), waQuick = $('#waQuick');
const CHAT = {
  jaipur: {
    name: 'Varelle Jaipur', sub: 'Usually replies in 10 minutes',
    hello: 'Namaste! This is Varelle Jaipur. Ask us about a piece, today\'s rate or a visit to the atelier.',
    a: ['Yes, we are open until 8:30 pm today. Ask for Meenal at the bridal counter and the chai will be ready.',
      'Today\'s sample rate for 22K is ₹7,245 a gram. Book a visit and we hold it for you for 48 hours.',
      'Wonderful! Share your wedding date and two times that suit you, and we will reserve the bridal lounge.']
  },
  mumbai: {
    name: 'Varelle Mumbai', sub: 'Usually replies in 15 minutes',
    hello: 'Hello from Kala Ghoda! Ask us about a piece, today\'s rate or the bridal lounge.',
    a: ['We are open until 8 pm today. We close on Mondays, so plan a visit any day from Tuesday to Sunday.',
      'Today\'s sample rate for 22K is ₹7,245 a gram. Book a visit and we hold it for you for 48 hours.',
      'Lovely! The bridal lounge is by appointment. Send a date and we will set it up with your shortlist.']
  }
};
let chat = CHAT.jaipur, lastFocus = null;
function bubble(cls, text) {
  const el = document.createElement('div');
  el.className = 'bub ' + cls;
  if (cls.includes('typing')) el.innerHTML = '<i></i><i></i><i></i>'; else el.textContent = text;
  waBody.appendChild(el);
  waBody.scrollTop = waBody.scrollHeight;
  return el;
}
function say(q, a) {
  bubble('out', q);
  const t = bubble('in typing');
  setTimeout(() => { t.remove(); bubble('in', a); }, 1100);
}
function openWA(store, pre) {
  closeMenu();
  chat = CHAT[store] || CHAT.jaipur;
  $('#waName').textContent = chat.name; $('#waSub').textContent = chat.sub;
  waBody.innerHTML = '';
  bubble('in', chat.hello);
  lastFocus = document.activeElement;
  wa.hidden = false;
  if (pre) setTimeout(() => say(pre[0], pre[1]), 450);
  setTimeout(() => $('.wa-x', wa).focus({ preventScroll: true }), 60);
}
function closeWA() { if (wa.hidden) return; wa.hidden = true; lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true }); }
$('.wa-x', wa).addEventListener('click', closeWA);
$$('button', waQuick).forEach(b => b.addEventListener('click', () => say(b.textContent, chat.a[+b.dataset.q])));
$$('[data-wa]').forEach(b => b.addEventListener('click', () => openWA(b.dataset.wa)));
$('#sendDesign').addEventListener('click', () => {
  const q = quote(build);
  openWA('jaipur', [`Hi! I designed a solitaire: ${SETTING[build.metal][0]}, ${build.shape}, ${build.carat.toFixed(2)} ct. Estimate ₹${inr(q.total)}.`,
    `Beautiful choice. We have ${build.shape === 'round' ? 'three rounds' : 'two ' + build.shape + 's'} close to ${build.carat.toFixed(2)} ct in the atelier this week. Shall we show them to you on a video call tomorrow?`]);
});

/* ---------- magnetic buttons, desktop only ---------- */
if (FINE && !REDUCED) $$('.magnetic').forEach(b => {
  b.addEventListener('pointermove', e => {
    const r = b.getBoundingClientRect();
    b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px');
    b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + 'px');
  });
  b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
});

/* ---------- scroll loop ---------- */
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    nav.classList.toggle('scrolled', window.scrollY > 30);
    heroUI();
    pickStage();
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
HX.on && HX.on('play', () => { lastP = -1; onScroll(); });

/* ---------- boot ---------- */
measure();
renderBuild(false);
nav.classList.toggle('scrolled', window.scrollY > 30);
heroUI();
pickStage();
const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
Promise.race([fontsReady, new Promise(r => setTimeout(r, 1800))]).then(() => {
  reveals();
  measure();
  ScrollTrigger.refresh();
  window.__goldOK = true;
  uiReady = true; ready();
});
let rz = 0;
window.addEventListener('resize', () => {
  clearTimeout(rz);
  rz = setTimeout(() => { measure(); ScrollTrigger.refresh(); lastP = -1; heroUI(); pickStage(); }, 180);
});
