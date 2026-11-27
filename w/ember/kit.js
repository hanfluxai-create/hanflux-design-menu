/* Hanflux premium film templates: shared kit (copied into each w/<slug>/ by tools/premium/sync.sh).
   film()    a scroll-driven film drawn on a canvas from still frames. No autoplaying video anywhere:
             the first frame is a plain <img>, frames stream in behind it, and scroll picks the frame.
   reveals() scroll reveals, counters, the phone menu, demo forms and the tap-to-play film dialog. */
const HX = window.HX || {};
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export function film({ section, canvas, counts, base = './film/', onProgress }) {
  const sec = typeof section === 'string' ? $(section) : section;
  const cv = typeof canvas === 'string' ? $(canvas) : canvas;
  if (!sec || !cv) return;
  const portrait = innerWidth / innerHeight < 0.85;
  const kind = portrait ? 'm' : 'd';
  const total = counts[kind];
  const saver = !!(navigator.connection && navigator.connection.saveData);
  const stride = HX.lite || saver ? 2 : 1;               // phone frames in the menu and data saver: every other frame
  const still = !!HX.reducedMotion;                      // reduced motion: the film stays on its first frame
  const ctx = cv.getContext('2d', { alpha: false });
  const frames = new Array(total);
  const src = (i) => `${base}${kind}/${String(i + 1).padStart(3, '0')}.webp`;
  let sized = false, drawn = -1, target = 0, cur = 0, raf = 0, visible = true;

  // chapters: [data-at="0.10,0.32"] is shown while the film is between those two points
  const chapters = $$('[data-at]', sec).map((el) => { const [a, b] = el.dataset.at.split(',').map(Number); return { el, a, b, on: null }; });

  function nearest(i) {
    if (frames[i]) return i;
    for (let d = 1; d < total; d++) { if (frames[i - d]) return i - d; if (frames[i + d]) return i + d; }
    return -1;
  }
  function draw(i) {
    const k = nearest(i);
    if (k < 0 || k === drawn) return;
    const im = frames[k];
    if (!sized) { cv.width = im.naturalWidth; cv.height = im.naturalHeight; sized = true; }
    ctx.drawImage(im, 0, 0, cv.width, cv.height);
    if (drawn < 0) cv.classList.add('on');
    drawn = k;
  }
  function load(i) {
    return new Promise((res) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => { frames[i] = im; if (Math.abs(i - Math.round(cur * (total - 1))) <= 8) { drawn = -2; draw(Math.round(cur * (total - 1))); } res(); };
      im.onerror = () => res();
      im.src = src(i);
    });
  }
  // coarse to fine: the whole film is scrubbable after the first pass, then it sharpens
  function order() {
    const seen = new Set(), out = [];
    for (let s = 16; s >= stride; s = s >> 1) { for (let i = 0; i < total; i += s) if (!seen.has(i)) { seen.add(i); out.push(i); } if (s === stride) break; }
    if (!seen.has(total - 1) && stride === 1) out.push(total - 1);
    return out;
  }
  async function loadAll() {
    const q = still ? [0] : order();
    await load(q.shift());
    HX.ready && HX.ready();
    const workers = Array.from({ length: 4 }, async () => { while (q.length) await load(q.shift()); });
    await Promise.all(workers);
  }

  function measure() {
    const r = sec.getBoundingClientRect();
    const span = Math.max(1, r.height - innerHeight);
    target = still ? 0 : clamp(-r.top / span);
    visible = r.bottom > -200 && r.top < innerHeight + 200;
  }
  function apply(p) {
    draw(Math.round(p * (total - 1)));
    for (const c of chapters) { const on = p >= c.a && p <= c.b; if (on !== c.on) { c.on = on; c.el.classList.toggle('on', on); } }
    sec.style.setProperty('--p', p.toFixed(4));
    onProgress && onProgress(p);
  }
  function tick() {
    raf = 0;
    cur += (target - cur) * 0.22;
    if (Math.abs(target - cur) < 0.0006) cur = target;
    apply(cur);
    if (cur !== target && visible) raf = requestAnimationFrame(tick);
  }
  function onScroll() { measure(); if (visible && !raf) raf = requestAnimationFrame(tick); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  if (still) sec.classList.add('still');
  measure(); cur = target; apply(cur);
  loadAll();
  return { get progress() { return cur; } };
}

export function reveals() {
  const root = document.documentElement;
  root.classList.add('js');

  // scroll reveals
  const els = $$('.rv');
  if ('IntersectionObserver' in window && !HX.reducedMotion) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  } else els.forEach((el) => el.classList.add('in'));

  // counters: <b data-count="94.2" data-dec="1">
  const nums = $$('[data-count]');
  if (nums.length && 'IntersectionObserver' in window) {
    const fmt = (el, v) => { const d = +el.dataset.dec || 0; el.textContent = (el.dataset.pre || '') + v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) + (el.dataset.suf || ''); };
    const io2 = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return; io2.unobserve(e.target);
      const el = e.target, to = +el.dataset.count;
      if (HX.reducedMotion) return fmt(el, to);
      const t0 = performance.now(), dur = 1400;
      const step = (t) => { const k = clamp((t - t0) / dur); fmt(el, to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), { threshold: 0.4 });
    nums.forEach((el) => io2.observe(el));
  }

  // phone menu
  const btn = $('[data-menu]'), menu = $('#menu');
  if (btn && menu) {
    const set = (open) => { root.classList.toggle('menu-open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    btn.addEventListener('click', () => set(!root.classList.contains('menu-open')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  // header gets a backing once the page has moved
  const head = $('.nav');
  if (head) { const f = () => head.classList.toggle('stuck', scrollY > 24); addEventListener('scroll', f, { passive: true }); f(); }

  // demo forms: nothing is sent anywhere
  $$('form[data-demo]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    f.classList.add('sent');
    const ok = $('.form-ok', f); if (ok) { ok.hidden = false; ok.focus && ok.focus(); }
  }));

  // the film, played on a tap (a tap is allowed to start video in every browser, Low Power Mode included)
  const dlg = $('#film-dlg');
  if (dlg && dlg.showModal) {
    const v = $('video', dlg);
    $$('[data-play-film]').forEach((b) => b.addEventListener('click', () => {
      const want = innerWidth / innerHeight < 0.85 ? v.dataset.m : v.dataset.d;
      if (v.getAttribute('src') !== want) v.src = want;
      dlg.showModal();
      const p = v.play(); if (p && p.catch) p.catch(() => {});
    }));
    const close = () => { v.pause(); dlg.close(); };
    $$('[data-close-film]', dlg).forEach((b) => b.addEventListener('click', close));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    dlg.addEventListener('close', () => v.pause());
  }
}

export { clamp, $, $$ };
