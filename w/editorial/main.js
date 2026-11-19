import { INK, rng, weave, stamp, motif, crackle, fabricTile } from './print.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, ready() {}, on() {} };
const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, SplitText = window.SplitText;
const reduced = !!HX.reducedMotion;
if (reduced) document.documentElement.classList.add('reduced');
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
if (gsap && SplitText) gsap.registerPlugin(SplitText);
const phone = () => innerWidth < 760;
const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* smooth scroll */
let lenis = null;
if (!HX.embed && !reduced && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.1 });
  window.__lenis = lenis;
  if (ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
  if (gsap) { gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
}

/* nav, menu, anchors */
const nav = document.querySelector('[data-nav]');
const onScrollNav = () => nav.classList.toggle('is-scrolled', scrollY > 20);
addEventListener('scroll', onScrollNav, { passive: true }); onScrollNav();
const menuBtn = document.querySelector('[data-menu-btn]'), menu = document.querySelector('[data-menu]');
const setMenu = (open) => {
  menuBtn.setAttribute('aria-expanded', String(open)); menu.hidden = !open;
  menuBtn.querySelector('span').textContent = open ? 'Close' : 'Menu';
  document.body.style.overflow = open ? 'hidden' : '';
  if (lenis) open ? lenis.stop() : lenis.start();
};
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const el = a.getAttribute('href').length > 1 && document.querySelector(a.getAttribute('href'));
  if (!el) return;
  e.preventDefault();
  const y = a.getAttribute('href') === '#top' ? 0 : el.getBoundingClientRect().top + scrollY - (phone() ? 50 : 60);
  lenis ? lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
});

/* wood */
function wood(w, h, seed, tone = 1) {
  const c = mk(w, h), x = c.getContext('2d'), img = x.createImageData(w, h), r = rng(seed);
  const a1 = r() * 6, a2 = r() * 6, kx = r() * w, ky = r() * h;
  for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
    const dk = Math.hypot((xx - kx) * 0.6, y - ky);
    const warp = Math.sin(xx * 0.012 + a1) * 7 + Math.sin(xx * 0.031 + a2) * 2.4 + 30 / (1 + dk * 0.08);
    const g = 0.5 + 0.5 * Math.sin((y + warp) * 0.42);
    const fine = (Math.sin(xx * 1.7 + y * 0.3) * 0.5 + 0.5) * 0.05 + r() * 0.04;
    const v = (0.78 + g * 0.2 + fine) * tone;
    const o = (y * w + xx) * 4;
    img.data[o] = Math.min(255, 128 * v); img.data[o + 1] = Math.min(255, 78 * v); img.data[o + 2] = Math.min(255, 44 * v); img.data[o + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return c;
}

/* ---------- the live print table ---------- */
const PROGRAM = [
  { name: 'kesar', base: INK.cloth, cap: 'Kesar buti, a three-block print. Iron black, madder and harda on mulmul cotton.', passes: [['rekh', INK.ink, 'Rekh, the outline, in iron black'], ['datta', INK.madder, 'Datta, the fill, in madder'], ['gadh', INK.ochre, 'Gadh, the leaves, in harda gold']] },
  { name: 'anaar', base: INK.sand, cap: 'Anaar, the pomegranate. Iron black and two madders on cotton silk.', passes: [['rekh', INK.ink, 'Rekh, the outline, in iron black'], ['datta', INK.madder, 'Datta, the fruit, in madder'], ['gadh', INK.madderD, 'Gadh, the seeds, in deep madder']] },
  { name: 'bagru', base: '#d6b98a', cap: 'Bagru diamond. Iron black and madder on ochre cotton.', passes: [['rekh', INK.ink, 'Rekh, the lattice, in iron black'], ['datta', INK.madder, 'Datta, the centres, in madder']] }
];
function printTable() {
  const cloth = document.querySelector('[data-cloth]'), cv = cloth.querySelector('[data-print]'), blk = cloth.querySelector('[data-block]');
  const passEl = document.querySelector('[data-pass]'), countEl = document.querySelector('[data-count]'), figEl = document.querySelector('.hero__fig');
  const top = blk.querySelector('.blk__top');
  top.style.backgroundImage = `url(${wood(160, 160, 11).toDataURL('image/jpeg', 0.85)})`;
  const ctx = cv.getContext('2d');
  let W, H, d, cell, cells = [], prog = 0, pass = 0, idx = 0, r = rng(21);
  let phase = 'move', t0 = 0, from = [0, 0], to = [0, 0], lift = 1, visible = true;
  function layout() {
    const rect = cloth.getBoundingClientRect();
    W = rect.width; H = rect.height; d = DPR();
    cv.width = Math.round(W * d); cv.height = Math.round(H * d);
    const cols = W < 430 ? 3 : 4;
    cell = W / cols;
    cells = [];
    for (let i = 0; i <= cols; i++) {
      const off = i % 2 ? cell / 2 : 0;
      for (let j = -1; j * cell + off < H + cell / 2; j++) {
        const x = i * cell, y = j * cell + off + cell / 2;
        if (y < -cell * 0.3) continue;
        cells.push([x, y]);
      }
    }
    cells.sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]));
    const s = cell * 0.98;
    blk.style.width = blk.style.height = s + 'px';
  }
  function fresh() {
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.drawImage(weave(cv.width, cv.height, PROGRAM[prog].base, 4 + prog), 0, 0);
  }
  function print(i, p) {
    const [x, y] = cells[i], [layer, col] = PROGRAM[prog].passes[p];
    stamp(ctx, PROGRAM[prog].name, layer, x * d, y * d, cell * 0.94 * d, col, rng(i * 31 + p * 7 + prog * 101 + 1), { mis: 2.2 * d });
  }
  function caption() {
    const P = PROGRAM[prog];
    passEl.textContent = `Block ${pass + 1} of ${P.passes.length} · ${P.passes[pass][2]}`;
    countEl.textContent = `Stamp ${Math.min(idx + 1, cells.length)} of ${cells.length}`;
    figEl.textContent = 'Fig. 1 · ' + P.cap;
  }
  function place(x, y, l) {
    const s = cell * 0.98, sc = 1 + l * 0.07;
    blk.style.transform = `translate3d(${(x - s / 2).toFixed(1)}px, ${(y - s / 2).toFixed(1)}px, 0) scale(${sc.toFixed(3)}) rotate(${(-1.5 + l * 1.5).toFixed(2)}deg)`;
    blk.style.setProperty('--lift', l.toFixed(3));
  }
  function start() {
    layout(); fresh();
    // the first passes are already on the cloth when the page opens
    for (let i = 0; i < cells.length; i++) print(i, 0);
    pass = 1; idx = Math.floor(cells.length * 0.45);
    for (let i = 0; i < idx; i++) print(i, 1);
    from = cells[Math.max(0, idx - 1)]; to = cells[idx];
    place(from[0], from[1], 1);
    caption();
    phase = 'move'; t0 = performance.now();
  }
  function next(now) {
    idx++;
    if (idx >= cells.length) {
      pass++; idx = 0;
      if (pass >= PROGRAM[prog].passes.length) { phase = 'rest'; t0 = now; return; }
    }
    from = to; to = cells[idx]; phase = 'move'; t0 = now; caption();
  }
  function tick(now) {
    requestAnimationFrame(tick);
    if (!visible) { t0 = now - (now - t0); return; }
    const dt = now - t0;
    if (phase === 'move') {
      const dur = Math.hypot(to[0] - from[0], to[1] - from[1]) > cell * 2 ? 520 : 300;
      const k = ease(clamp(dt / dur));
      place(from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k, 1);
      if (dt >= dur) { phase = 'press'; t0 = now; }
    } else if (phase === 'press') {
      const k = clamp(dt / 110); lift = 1 - k * k; place(to[0], to[1], lift);
      if (dt >= 110) { print(idx, pass); phase = 'hold'; t0 = now; }
    } else if (phase === 'hold') {
      if (dt >= 80) { phase = 'lift'; t0 = now; }
    } else if (phase === 'lift') {
      const k = clamp(dt / 140); lift = 1 - (1 - k) * (1 - k); place(to[0], to[1], lift);
      if (dt >= 140) next(now);
    } else if (phase === 'rest') {
      if (dt < 400) blk.style.opacity = String(1 - dt / 400);
      if (dt >= 2600) { phase = 'out'; t0 = now; }
    } else if (phase === 'out') {
      const k = ease(clamp(dt / 900));
      cv.style.transform = `translateX(${(-k * 104).toFixed(2)}%)`;
      if (dt >= 900) {
        prog = (prog + 1) % PROGRAM.length; pass = 0; idx = 0; fresh();
        cv.style.transform = 'translateX(104%)'; phase = 'in'; t0 = now;
      }
    } else if (phase === 'in') {
      const k = ease(clamp(dt / 900));
      cv.style.transform = `translateX(${((1 - k) * 104).toFixed(2)}%)`;
      if (dt >= 900) {
        cv.style.transform = ''; blk.style.opacity = '1';
        from = [W * 0.5, -cell]; to = cells[0]; phase = 'move'; t0 = now; caption();
      }
    }
  }
  start();
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: '60px' }).observe(cloth);
  if (!reduced) requestAnimationFrame(tick);
  let rw = innerWidth;
  addEventListener('resize', () => { if (Math.abs(innerWidth - rw) > 40) { rw = innerWidth; start(); } });
}
printTable();
requestAnimationFrame(() => requestAnimationFrame(() => HX.ready()));

/* ---------- fabrics for the garments and plates ---------- */
const tileSeeds = { kesar: 5, neel: 8, dabu: 13, anaar: 6, chameli: 9, bagru: 4, border: 3 };
const tiles = [...document.querySelectorAll('image[data-tile]')];
let ti = 0;
function nextTile() {
  if (ti >= tiles.length) return;
  const img = tiles[ti++], key = img.dataset.tile;
  const c = fabricTile(key, key === 'border' ? 128 : 256, tileSeeds[key] || 1);
  img.setAttribute('href', c.toDataURL('image/jpeg', 0.9));
  setTimeout(nextTile, 16);
}
setTimeout(nextTile, 60);

/* ---------- reveals ---------- */
if (gsap && SplitText && ScrollTrigger && !reduced) {
  document.fonts.ready.then(() => {
    document.querySelectorAll('[data-split]').forEach((el) => {
      const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line' });
      const isHero = el.classList.contains('hero__title');
      gsap.from(split.lines, {
        yPercent: 108, duration: isHero ? 1.4 : 1.15, ease: 'expo.out', stagger: isHero ? 0.11 : 0.08, delay: isHero ? 0.15 : 0,
        scrollTrigger: isHero ? undefined : { trigger: el, start: 'top 88%', once: true }
      });
    });
    ScrollTrigger.refresh();
  });
  gsap.from('.issue, .hero__sub, .hero__ctas, .table', { y: 26, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.35 });
}
const rIO = new IntersectionObserver((ents) => ents.forEach((en) => {
  if (!en.isIntersecting) return;
  const sibs = [...en.target.parentElement.children];
  en.target.style.transitionDelay = (sibs.indexOf(en.target) % 3) * 0.1 + 's';
  en.target.classList.add('is-in'); rIO.unobserve(en.target);
}), { rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('[data-reveal]').forEach((el) => (reduced ? el.classList.add('is-in') : rIO.observe(el)));

/* ---------- bag ---------- */
let bagN = 0;
const bag = document.querySelector('[data-bag]'), bagNum = document.querySelector('[data-bag-n]');
document.querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', () => {
  bagN++; bagNum.textContent = bagN; bag.setAttribute('aria-label', `Bag, ${bagN} item${bagN > 1 ? 's' : ''}`);
  bag.classList.remove('is-bump'); void bag.offsetWidth; bag.classList.add('is-bump');
  b.textContent = 'Added to bag'; b.classList.add('is-added');
  setTimeout(() => { b.textContent = 'Add to bag'; b.classList.remove('is-added'); bag.classList.remove('is-bump'); }, 2200);
}));

/* ---------- craft: block to cloth ---------- */
function silhouette(S, positions, name, dil) {
  const m = mk(S, S), x = m.getContext('2d'), mo = motif(name);
  for (const [px, py, sz] of positions) {
    x.save(); x.translate(px, py); x.scale(sz / 2, sz / 2);
    for (const L of ['rekh', 'datta', 'gadh']) if (mo[L]) mo[L](x, '#000');
    x.restore();
  }
  if (!dil) return m;
  const out = mk(S, S), o = out.getContext('2d');
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; o.drawImage(m, Math.cos(a) * dil, Math.sin(a) * dil); }
  o.drawImage(m, 0, 0);
  return out;
}
function craftState(cv, step) {
  const S = Math.round(cv.getBoundingClientRect().width * DPR()) || 800;
  cv.width = cv.height = S;
  const x = cv.getContext('2d');
  const big = S * 0.6, pos = [[S / 2, S / 2, big], [0, 0, big], [S, 0, big], [0, S, big], [S, S, big]];
  if (step === 0) {
    // the carved block: raised motif, cut-away ground, relief light
    x.drawImage(wood(S >> 1, S >> 1, 31, 0.62), 0, 0, S, S);
    const r = rng(5); x.strokeStyle = 'rgba(30,14,6,.35)'; x.lineWidth = S / 400;
    for (let i = 0; i < 260; i++) { const a = r() * Math.PI * 2, px = r() * S, py = r() * S, l = S * (0.008 + r() * 0.018); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
    const sil = silhouette(S, pos, 'kesar', 0);
    const raised = mk(S, S), rx = raised.getContext('2d');
    rx.drawImage(wood(S >> 1, S >> 1, 32, 1.12), 0, 0, S, S);
    rx.globalCompositeOperation = 'destination-in'; rx.drawImage(sil, 0, 0);
    const sh = mk(S, S), sx = sh.getContext('2d');
    sx.drawImage(sil, 0, 0); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = 'rgba(20,8,2,.7)'; sx.fillRect(0, 0, S, S);
    x.drawImage(sh, S * 0.006, S * 0.008);
    const hi = mk(S, S), hx = hi.getContext('2d');
    hx.drawImage(sil, 0, 0); hx.globalCompositeOperation = 'source-in'; hx.fillStyle = 'rgba(255,220,180,.5)'; hx.fillRect(0, 0, S, S);
    x.drawImage(hi, -S * 0.002, -S * 0.003);
    x.drawImage(raised, 0, 0);
    const v = x.createRadialGradient(S / 2, S / 2, S * 0.2, S / 2, S / 2, S * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,8,2,.45)'); x.fillStyle = v; x.fillRect(0, 0, S, S);
    return;
  }
  x.drawImage(weave(S, S, INK.cloth, 12), 0, 0);
  const passes = [['rekh', INK.ink], ['datta', INK.madder], ['gadh', INK.ochre]];
  const upto = step === 1 ? 1 : 3;
  passes.slice(0, upto).forEach(([L, col], li) => pos.forEach(([px, py, sz], i) => stamp(x, 'kesar', L, px, py, sz, col, rng(i * 17 + li * 5 + 3), { mis: S * 0.004 })));
  if (step < 3) return;
  const dil = silhouette(S, pos, 'kesar', S * 0.014);
  const ind = mk(S, S), ix = ind.getContext('2d');
  ix.drawImage(weave(S >> 1, S >> 1, INK.indigo, 19, { dark: true }), 0, 0, S, S);
  ix.globalCompositeOperation = 'destination-out'; ix.drawImage(dil, 0, 0);
  x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = step === 3 ? 0.62 : 1; x.drawImage(ind, 0, 0); x.restore();
  if (step === 3) {
    const mud = mk(S, S), mx = mud.getContext('2d');
    mx.drawImage(dil, 0, 0); mx.globalCompositeOperation = 'source-in'; mx.fillStyle = '#7d6c55'; mx.fillRect(0, 0, S, S);
    mx.globalCompositeOperation = 'source-atop'; mx.globalAlpha = 0.4; mx.drawImage(weave(S >> 1, S >> 1, '#5d4e3b', 7), 0, 0, S, S);
    x.save(); x.globalAlpha = 0.86; x.drawImage(mud, 0, 0); x.restore();
    crackle(x, 0, 0, S, S, rng(4), 'rgba(40,30,20,.55)', 160);
  } else {
    const cr = mk(S, S), cx2 = cr.getContext('2d');
    crackle(cx2, 0, 0, S, S, rng(9), 'rgba(46,58,107,.6)', 220);
    cx2.globalCompositeOperation = 'destination-in'; cx2.drawImage(dil, 0, 0);
    x.drawImage(cr, 0, 0);
    x.save(); x.globalCompositeOperation = 'soft-light'; x.fillStyle = 'rgba(255,240,220,.25)'; x.fillRect(0, 0, S, S); x.restore();
  }
}
const craftLabels = ['Sheesham block, carved by hand', 'Rekh: the outline in iron black', 'Datta: madder and harda gold', 'Dabu: clay resist, then the indigo vat', 'Washed, sun-dried, ready to cut'];
const cA = document.querySelector('[data-craft="a"]'), cB = document.querySelector('[data-craft="b"]'), cLabel = document.querySelector('[data-craft-label]');
let front = cA, craftStep = -1;
function showStep(n) {
  if (n === craftStep) return;
  craftStep = n;
  const back = front === cA ? cB : cA;
  craftState(back, n);
  back.classList.add('is-on'); front.classList.remove('is-on'); front = back;
  cLabel.textContent = craftLabels[n];
  document.querySelectorAll('.step').forEach((s) => s.classList.toggle('is-active', +s.dataset.step === n));
}
const steps = [...document.querySelectorAll('.step')];
function pickStep() {
  const mid = innerHeight * (phone() ? 0.62 : 0.5);
  let best = 0;
  steps.forEach((s, i) => { if (s.getBoundingClientRect().top < mid) best = i; });
  showStep(best);
}
let craftReady = false;
new IntersectionObserver((e) => { if (e[0].isIntersecting && !craftReady) { craftReady = true; craftState(cA, 0); craftStep = 0; } }, { rootMargin: '600px 0px' }).observe(document.querySelector('.craft'));
addEventListener('scroll', () => { if (craftReady) pickStep(); }, { passive: true });

/* ---------- lookbook: horizontal on desktop, swaying cloth ---------- */
const look = document.querySelector('.lookbook'), track = document.querySelector('[data-track]');
function lookScroll() {
  if (phone()) { track.style.transform = ''; return; }
  const r = look.getBoundingClientRect(), len = r.height - innerHeight;
  const p = clamp(-r.top / Math.max(1, len));
  const q = p < 0.5 ? Math.min(0.5, p / 0.42 * 0.5) : 0.5 + Math.min(0.5, (p - 0.5) / 0.42 * 0.5);
  track.style.transform = `translate3d(${(-q * 200).toFixed(3)}vw, 0, 0)`;
}
addEventListener('scroll', lookScroll, { passive: true }); addEventListener('resize', lookScroll); lookScroll();
const strips = [...document.querySelectorAll('[data-strip]')];
const shadeG = document.querySelector('[data-sway-shade]');
const shades = strips.map(() => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('fill', 'url(#g-side)'); p.setAttribute('class', 'mul'); shadeG.appendChild(p); return p; });
const pins = strips.map(() => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); p.setAttribute('width', '8'); p.setAttribute('height', '18'); p.setAttribute('rx', '2'); p.setAttribute('fill', '#c9a77a'); shadeG.appendChild(p); return p; });
const barY = (x) => 150 + 11 * (1 - Math.pow((x - 300) / 250, 2));
function sway(t) {
  strips.forEach((el, i) => {
    const x0 = 78 + i * 90, w = 76, L = +el.dataset.l;
    const a = Math.sin(t * 0.8 + i * 1.3) * 0.035 + Math.sin(t * 1.9 + i) * 0.01;
    const y0 = barY(x0), y1 = barY(x0 + w);
    const bx = L * a;
    let d = `M${x0} ${y0} L${x0 + w} ${y1} Q${x0 + w + bx * 0.4} ${y1 + L * 0.5} ${x0 + w + bx} ${y1 + L}`;
    for (let k = 4; k >= 0; k--) {
      const xx = x0 + bx + (w * k) / 4, yy = y0 + L + Math.sin(t * 2.2 + k * 1.6 + i) * 3;
      d += k === 4 ? '' : ` Q${xx + w / 8} ${yy + 6} ${xx} ${yy}`;
    }
    d += ` Q${x0 + bx * 0.4} ${y0 + L * 0.5} ${x0} ${y0} Z`;
    el.setAttribute('d', d); shades[i].setAttribute('d', d);
    pins[i].setAttribute('x', x0 + 8); pins[i].setAttribute('y', y0 - 10);
  });
}
let lookVis = false;
new IntersectionObserver((e) => { lookVis = e[0].isIntersecting; }, { rootMargin: '100px' }).observe(document.querySelector('.spread__art--sun'));
sway(0);
const swayLoop = (now) => { requestAnimationFrame(swayLoop); if (lookVis && !reduced) sway(now / 1000); };
requestAnimationFrame(swayLoop);

/* loupe: four times life size */
const loupe = document.querySelector('[data-loupe]');
new IntersectionObserver((e, o) => {
  if (!e[0].isIntersecting) return; o.disconnect();
  const S = Math.round(loupe.getBoundingClientRect().width * DPR()) || 900;
  loupe.width = loupe.height = S;
  const x = loupe.getContext('2d');
  x.drawImage(weave(S >> 1, S >> 1, INK.cloth, 33), 0, 0, S, S);
  x.save(); x.globalAlpha = 0.35; x.drawImage(weave(S, S, INK.cloth, 34), 0, 0); x.restore();
  const R = rng(77);
  [['rekh', INK.ink, 0, 0], ['datta', INK.madder, S * 0.012, S * 0.009], ['gadh', INK.ochre, -S * 0.008, S * 0.012]].forEach(([L, c, ox, oy]) => stamp(x, 'kesar', L, S * 0.5 + ox, S * 0.52 + oy, S * 1.05, c, R, { mis: 0 }));
  const g = x.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S * 0.52);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,24,10,.32)'); x.fillStyle = g; x.fillRect(0, 0, S, S);
}, { rootMargin: '700px' }).observe(loupe);

/* workshop: counters and the block archive */
document.querySelectorAll('[data-count-to]').forEach((el) => {
  const end = +el.dataset.countTo;
  new IntersectionObserver((e, o) => {
    if (!e[0].isIntersecting) return; o.disconnect();
    if (reduced || !gsap) return;
    const v = { n: 0 }; gsap.to(v, { n: end, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(v.n); } });
  }).observe(el);
});
const carveMotif = { kesar: 'kesar', anaar: 'anaar', jaal: 'jaal', bagru: 'bagru' };
new IntersectionObserver((e, o) => {
  if (!e[0].isIntersecting) return; o.disconnect();
  document.querySelectorAll('[data-carve]').forEach((cv, i) => {
    const S = Math.round(cv.getBoundingClientRect().width * DPR()) || 300;
    cv.width = cv.height = S;
    const x = cv.getContext('2d');
    x.drawImage(wood(S >> 1, S >> 1, 40 + i, 0.6), 0, 0, S, S);
    const name = carveMotif[cv.dataset.carve];
    const sil = silhouette(S, [[S / 2, S / 2, S * 0.78]], name, 0);
    const sh = mk(S, S), sx = sh.getContext('2d'); sx.drawImage(sil, 0, 0); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = 'rgba(20,8,2,.7)'; sx.fillRect(0, 0, S, S);
    x.drawImage(sh, S * 0.01, S * 0.013);
    const rs = mk(S, S), rx = rs.getContext('2d'); rx.drawImage(wood(S >> 1, S >> 1, 50 + i, 1.15), 0, 0, S, S); rx.globalCompositeOperation = 'destination-in'; rx.drawImage(sil, 0, 0);
    x.drawImage(rs, 0, 0);
    const v = x.createRadialGradient(S / 2, S / 2, S * 0.25, S / 2, S / 2, S * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,8,2,.45)'); x.fillStyle = v; x.fillRect(0, 0, S, S);
  });
}, { rootMargin: '600px' }).observe(document.querySelector('.archive'));

/* the seal */
const seal = document.querySelector('[data-seal]');
document.fonts.ready.then(() => {
  const S = Math.round(132 * DPR()); seal.width = seal.height = S;
  const x = seal.getContext('2d'), R = rng(12);
  x.drawImage(weave(S, S, INK.bone, 2), 0, 0);
  const ring = mk(S, S), rc = ring.getContext('2d');
  rc.strokeStyle = INK.madder; rc.fillStyle = INK.madder; rc.lineWidth = S * 0.02;
  rc.beginPath(); rc.arc(S / 2, S / 2, S * 0.47, 0, Math.PI * 2); rc.stroke();
  rc.beginPath(); rc.arc(S / 2, S / 2, S * 0.33, 0, Math.PI * 2); rc.stroke();
  const txt = 'ATELIER NOOR · SANGANER · JAIPUR · ';
  rc.font = `600 ${Math.round(S * 0.075)}px Inter, sans-serif`; rc.textAlign = 'center'; rc.textBaseline = 'middle';
  [...txt].forEach((ch, i) => { const a = (i / txt.length) * Math.PI * 2 - Math.PI / 2; rc.save(); rc.translate(S / 2 + Math.cos(a) * S * 0.4, S / 2 + Math.sin(a) * S * 0.4); rc.rotate(a + Math.PI / 2); rc.fillText(ch, 0, 0); rc.restore(); });
  x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.9; x.drawImage(ring, 0, 0); x.restore();
  stamp(x, 'chameli', 'datta', S / 2, S / 2, S * 0.42, INK.madder, R, { mis: 0 });
  stamp(x, 'chameli', 'rekh', S / 2, S / 2, S * 0.42, INK.ink, R, { mis: 1 });
});

/* newsletter */
const news = document.querySelector('[data-news]');
news.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = news.querySelector('input').value.trim();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  news.classList.toggle('is-bad', !ok);
  if (!ok) { news.querySelector('input').focus(); return; }
  news.classList.add('is-done'); news.querySelector('[data-news-ok]').hidden = false;
});
