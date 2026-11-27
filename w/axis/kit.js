/* Hanflux premium film templates: shared kit (copied into each w/<slug>/ by tools/premium/sync.sh).
   film()    a film played by the scroll, frame by frame on a canvas. There is no <video> anywhere, so iPhone
             Low Power Mode, data saver and autoplay rules cannot stall it. The first frame is a plain <img>.
             Frames are fetched as blobs, coarse to fine, and stay compressed in memory; only a small moving
             window around the current frame is kept decoded (createImageBitmap, off the main thread), so a
             scroll never waits on an image decode and memory stays flat. Every film on a page shares one
             passive scroll listener and one requestAnimationFrame loop.
   reveals() scroll reveals, counters, the phone menu and demo forms. */
const HX = window.HX || {};
const W = window, D = document;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const $ = (s, r = D) => r.querySelector(s);
const $$ = (s, r = D) => [...r.querySelectorAll(s)];

// The loader runs in a worker: it fetches the frames, keeps them compressed and decodes on request, so neither the
// network nor an image decode ever lands on the thread that scrolls the page. Decoded frames come back by transfer.
const LOADER = `let blobs=[];onmessage=function(e){var m=e.data;if(m.load){var o=m.load,at=0,live=0;(function next(){while(live<4&&at<o.length)(function(i){live++;fetch(m.base+String(i+1).padStart(3,'0')+'.webp').then(function(r){if(!r.ok)throw 0;return r.blob()}).then(function(b){blobs[i]=b;postMessage({have:i})}).catch(function(){}).then(function(){live--;next()})})(o[at++])})()}else{var i=m.dec,b=blobs[i];if(!b)return postMessage({i:i});createImageBitmap(b).then(function(x){postMessage({i:i,bmp:x},[x])},function(){postMessage({i:i})})}}`;
function loader() { try { return new Worker(URL.createObjectURL(new Blob([LOADER], { type: 'text/javascript' }))); } catch (e) { return null; } }

const films = [];
let raf = 0, listening = false, vh = 0;

function measureAll() { vh = W.innerHeight; for (const f of films) f.measure(); }
function frame() {
  raf = 0;
  const y = W.scrollY;
  let more = false;
  for (const f of films) if (f.step(y)) more = true;
  if (more) raf = requestAnimationFrame(frame);
}
function kick() { if (!raf) raf = requestAnimationFrame(frame); }
function listen() {
  if (listening) return; listening = true;
  W.addEventListener('scroll', kick, { passive: true });
  W.addEventListener('resize', () => { measureAll(); kick(); }, { passive: true });
  W.addEventListener('load', () => { measureAll(); kick(); });
  // anything above a film that changes height (fonts, late images) moves it: measure again, never inside the scroll
  if ('ResizeObserver' in W) new ResizeObserver(() => { measureAll(); kick(); }).observe(D.body);
}

export function film({ section, canvas, counts, base = './film/', onProgress }) {
  const sec = typeof section === 'string' ? $(section) : section;
  const cv = typeof canvas === 'string' ? $(canvas) : canvas || (sec && $('canvas', sec));
  if (!sec || !cv) return;
  const portrait = W.matchMedia('(max-aspect-ratio: 85/100)').matches;
  const kind = portrait && counts.m ? 'm' : 'd';
  const total = counts[kind];
  const conn = navigator.connection || {};
  const lean = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '') || !!HX.lite || !!HX.embed;   // previews inside the menu take half the frames
  const still = !!HX.reducedMotion;
  const ctx = cv.getContext('2d', { alpha: false });
  const canBmp = !!W.createImageBitmap;
  const AHEAD = portrait ? 10 : 12, BEHIND = 5, KEEP = portrait ? 22 : 28;
  const blobs = [], bmp = {}, busy = {};
  const src = (i) => `${base}${kind}/${String(i + 1).padStart(3, '0')}.webp`;
  const chapters = $$('[data-at]', sec).map((el) => { const [a, b] = el.dataset.at.split(',').map(Number); return { el, a, b, on: null }; });
  const bar = $('[data-bar]', sec);
  let top = 0, span = 1, p = -1, pos = 0, dir = 1, speed = 0, moving = false, nBusy = 0, shown = -1, started = false, readied = false;

  let wk = null;
  function got(i, b) { busy[i] = 0; nBusy--; if (b) { bmp[i] = b; kick(); } pump(); }
  function decode(i) {
    if (i < 0 || i >= total || bmp[i] || busy[i] || !blobs[i] || nBusy >= 3) return;
    busy[i] = 1; nBusy++;
    if (wk) wk.postMessage({ dec: i });
    else if (canBmp) createImageBitmap(blobs[i]).then((b) => got(i, b), () => got(i, null));
    else { const im = new Image(), u = URL.createObjectURL(blobs[i]); im.onload = () => { URL.revokeObjectURL(u); got(i, im); }; im.onerror = () => got(i, null); im.src = u; }
  }
  // Decode what the scroll is about to show. A quick scroll moves through the film faster than it was shot, so it
  // only decodes every 2nd, 3rd or 4th frame ahead (the ones it will land on); a slow scroll gets every frame.
  function pump() {
    const c = Math.round(pos), st = speed > 2.4 ? 4 : speed > 1.6 ? 3 : speed > 0.55 ? 2 : 1;
    decode(c);
    if (st > 1) { const want = Math.round(p * (total - 1)); decode(want); for (let k = 1; k * st <= AHEAD; k++) decode(Math.round(c / st) * st + k * st * dir); return trim(c); }
    for (let k = 1; k <= AHEAD; k++) { decode(c + k * dir); if (k <= BEHIND) decode(c - k * dir); }
    trim(c);
  }
  function trim(c) {
    for (const key in bmp) if (Math.abs(key - c) > KEEP) { if (bmp[key].close) bmp[key].close(); delete bmp[key]; }
  }
  function nearest(i) { if (bmp[i]) return i; for (let d = 1; d <= KEEP; d++) { if (bmp[i - d]) return i - d; if (bmp[i + d]) return i + d; } return -1; }
  function draw(i) {
    const k = nearest(i); if (k < 0 || k === shown) return;
    const b = bmp[k], w = b.width || b.naturalWidth, h = b.height || b.naturalHeight;
    if (cv.width !== w) { cv.width = w; cv.height = h; }
    ctx.drawImage(b, 0, 0); shown = k;
    if (!cv.classList.contains('on')) cv.classList.add('on');
    ready();
  }
  function ready() { if (!readied) { readied = true; HX.ready && HX.ready(); } }
  function load() {
    if (started || still || !W.fetch) return; started = true;
    const order = [], seen = {}, steps = lean ? [8, 4, 2] : [12, 6, 3, 1];
    steps.forEach((s) => { for (let i = 0; i < total; i += s) if (!seen[i]) { seen[i] = 1; order.push(i); } });
    if (!seen[total - 1]) order.push(total - 1);
    wk = canBmp && W.Worker ? loader() : null;
    if (wk) {
      wk.onmessage = (e) => { const m = e.data; if (m.have !== undefined) { blobs[m.have] = 1; if (Math.abs(m.have - Math.round(pos)) <= AHEAD) pump(); } else got(m.i, m.bmp || null); };
      wk.onerror = () => { wk = null; main(); };
      wk.postMessage({ load: order, base: new URL(`${base}${kind}/`, location.href).href });
    } else main();
    function main() {   // no worker: the same thing on the page's own thread
      let at = 0, live = 0;
      (function next() {
        while (live < 4 && at < order.length) {
          const i = order[at++]; live++;
          fetch(src(i)).then((r) => { if (!r.ok) throw 0; return r.blob(); })
            .then((b) => { blobs[i] = b; if (Math.abs(i - Math.round(pos)) <= AHEAD) pump(); })
            .catch(() => {}).then(() => { live--; next(); });
        }
      })();
    }
  }
  const me = {
    measure() { const r = sec.getBoundingClientRect(); top = r.top + W.scrollY; span = Math.max(1, r.height - vh); },
    // one step of this film for the current scroll position; returns true while it still has work to do
    step(y) {
      const rel = y - top;
      if (rel < -vh * 1.5 || rel > span + vh * 1.5) return false;      // far away: nothing to do, nothing loaded yet
      if (!started) load();
      const q = still ? 0 : clamp(rel / span);
      if (q !== p) {
        p = q;
        for (const c of chapters) { const on = q >= c.a && q <= c.b; if (on !== c.on) { c.on = on; c.el.classList.toggle('on', on); } }
        if (bar) bar.style.transform = `scaleX(${(0.02 + q * 0.98).toFixed(4)})`;
        onProgress && onProgress(q);
      }
      const want = p * (total - 1), d = want - pos;
      if (d) dir = d > 0 ? 1 : -1;
      const was = pos;
      pos = Math.abs(d) < 0.35 ? want : pos + d * 0.2;
      speed += (Math.abs(pos - was) - speed) * 0.3;
      moving = pos !== want;
      pump(); draw(Math.round(pos));
      return moving || (shown !== Math.round(pos) && nBusy > 0);
    },
    get progress() { return p; }
  };
  if (still) sec.classList.add('still');
  films.push(me); listen();
  vh = W.innerHeight; me.measure(); me.step(W.scrollY);
  // a page whose film never draws (no fetch, reduced motion, a slow line) still tells the menu it is ready
  const img = $('img.film-still', sec);
  if (still || !W.fetch) { if (img && !img.complete) img.addEventListener('load', ready); else ready(); }
  else setTimeout(ready, 2500);
  return me;
}

export function reveals() {
  const root = D.documentElement;
  root.classList.add('js');

  // scroll reveals
  const els = $$('.rv');
  if ('IntersectionObserver' in W && !HX.reducedMotion) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  } else els.forEach((el) => el.classList.add('in'));

  // counters: <b data-count="94.2" data-dec="1">
  const nums = $$('[data-count]');
  if (nums.length && 'IntersectionObserver' in W) {
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

  // the header gets a backing once the page has moved (an observer, not a second scroll listener)
  const head = $('.nav');
  if (head && 'IntersectionObserver' in W) {
    const mark = D.createElement('i');
    mark.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none;visibility:hidden';
    D.body.prepend(mark);
    new IntersectionObserver((es) => head.classList.toggle('stuck', !es[0].isIntersecting)).observe(mark);
  }

  // demo forms: nothing is sent anywhere
  $$('form[data-demo]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    f.classList.add('sent');
    const ok = $('.form-ok', f); if (ok) { ok.hidden = false; ok.focus && ok.focus(); }
  }));
}

export { clamp, $, $$ };
