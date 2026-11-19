// Split-flap engine. Each cell is four half-flaps:
//   static top    = next character's top half (revealed as the flap falls)
//   static bottom = current character's bottom half (covered as the flap lands)
//   falling top   = current character's top half, hinged at the centre line, 0 → -90deg
//   falling bottom= next character's bottom half, +90 → 0deg, with a bounce on the final landing
// Shading follows the light: the falling flap darkens as it turns away, the revealed half
// starts in its shadow, and the half being covered catches a cast shadow.
export const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$:.,-/?!&'";
const IDX = {}; [...DRUM].forEach((c, i) => { IDX[c] = i; });
const N = DRUM.length;
const active = new Set();
let running = false;
const glyph = (c) => (c === ' ' ? '' : c);

function loop(now) {
  for (const c of active) if (!c.update(now)) active.delete(c);
  for (const t of timers) if (now >= t.at) { t.at = now + t.every; t.fn(now); }
  requestAnimationFrame(loop);
}
export function start() { if (!running) { running = true; requestAnimationFrame(loop); } }

// rAF-based timers pause together with the menu frame (rAF is held while paused)
const timers = new Set();
export function every(ms, fn, first = ms) { const t = { every: ms, fn, at: performance.now() + first }; timers.add(t); return () => timers.delete(t); }

export class Cell {
  constructor() {
    const el = document.createElement('span');
    el.className = 'fl';
    el.innerHTML = '<span class="fh fh--t"><b></b><i></i></span><span class="fh fh--b"><b></b><i></i></span><span class="fh fh--ft"><b></b><i></i></span><span class="fh fh--fb"><b></b><i></i></span>';
    const h = el.children;
    this.el = el;
    [this.t, this.b, this.ft, this.fb] = h;
    this.tg = this.t.firstChild; this.bg = this.b.firstChild; this.ftg = this.ft.firstChild; this.fbg = this.fb.firstChild;
    this.ts = this.t.lastChild; this.bs = this.b.lastChild; this.fts = this.ft.lastChild; this.fbs = this.fb.lastChild;
    this.cur = ' '; this.col = ''; this.tcol = ''; this.queue = [];
    this.inStep = false; this.startAt = 0;
    this.speed = 0.86 + Math.random() * 0.28;
  }
  paint(half, col) { if (half._c !== col) { if (half._c) half.classList.remove(half._c); if (col) half.classList.add(col); half._c = col; } }
  set(ch, col = '') {
    this.queue.length = 0; this.inStep = false; active.delete(this);
    this.cur = ch; this.col = col; this.tcol = col;
    this.tg.textContent = this.bg.textContent = glyph(ch);
    this.paint(this.t, col); this.paint(this.b, col);
    this.ft.style.visibility = this.fb.style.visibility = 'hidden';
    this.ts.style.opacity = this.bs.style.opacity = 0;
  }
  // queue a flip towards `target`, travelling forward on the drum, at most `maxSteps` flaps
  to(target, delay = 0, col = '', maxSteps = 8) {
    if (IDX[target] === undefined) target = ' ';
    const from = this.queue.length ? this.queue[this.queue.length - 1] : this.cur;
    if (from === target && !this.queue.length && !this.inStep) {
      if (col !== this.col) { this.col = this.tcol = col; this.paint(this.t, col); this.paint(this.b, col); }
      return;
    }
    let d = (IDX[target] - IDX[from] + N) % N;
    if (d === 0) d = N;
    const k = Math.max(1, Math.min(d, maxSteps));
    for (let s = k - 1; s >= 0; s--) this.queue.push(DRUM[(IDX[target] - s + N * 2) % N]);
    this.tcol = col;
    if (!active.has(this)) { this.startAt = performance.now() + delay; active.add(this); start(); }
  }
  update(now) {
    // time-accurate: if frames are slow, whole steps are consumed inside one frame
    for (let guard = 0; guard < 24; guard++) {
      if (now < this.startAt) return true;
      if (!this.inStep) {
        if (!this.queue.length) return false;
        const next = this.queue[0];
        this.next = next; this.last = this.queue.length === 1;
        this.d1 = (this.last ? 66 : 38) * this.speed;
        this.d2 = (this.last ? 210 : 46) * this.speed;
        this.t0 = this.startAt; this.p2 = false;
        const ng = glyph(next), cg = glyph(this.cur);
        const nc = this.last ? this.tcol : this.col;
        this.tg.textContent = ng; this.paint(this.t, nc);
        this.fbg.textContent = ng; this.paint(this.fb, nc);
        this.ftg.textContent = cg; this.paint(this.ft, this.col);
        this.ft.style.visibility = 'visible';
        this.fb.style.visibility = 'hidden';
        this.inStep = true;
      }
      const e = now - this.t0;
      if (e < this.d1) {
        // phase 1: the upper flap falls with gravity towards the viewer
        const p = e / this.d1, a = -90 * p * p;
        this.ft.style.transform = `rotateX(${a.toFixed(1)}deg)`;
        this.fts.style.opacity = (p * 0.72).toFixed(2);
        this.ts.style.opacity = (0.62 * (1 - p * 0.55)).toFixed(2);
        return true;
      }
      if (e < this.d1 + this.d2) {
        // phase 2 (the half-step): the lower half swings down over the old character
        if (!this.p2) { this.p2 = true; this.ft.style.visibility = 'hidden'; this.fb.style.visibility = 'visible'; }
        const q = (e - this.d1) / this.d2;
        let a;
        if (!this.last) a = 90 * (1 - q * q);
        else if (q < 0.46) { const u = q / 0.46; a = 90 * (1 - u * u); }
        else if (q < 0.72) { const u = (q - 0.46) / 0.26; a = 16 * Math.sin(u * Math.PI); }
        else { const u = (q - 0.72) / 0.28; a = 4.5 * Math.sin(u * Math.PI); }
        this.fb.style.transform = `rotateX(${a.toFixed(1)}deg)`;
        const lift = a / 90;
        this.fbs.style.opacity = (lift * 0.8).toFixed(2);
        this.ts.style.opacity = (0.28 * Math.max(0, lift)).toFixed(2);
        this.bs.style.opacity = (lift > 0.02 ? 0.6 * (1 - lift) : 0).toFixed(2);
        return true;
      }
      // landed
      this.bg.textContent = glyph(this.next);
      this.paint(this.b, this.last ? this.tcol : this.col);
      this.ft.style.visibility = 'hidden'; this.fb.style.visibility = 'hidden';
      this.fts.style.opacity = 0; this.fbs.style.opacity = 0; this.ts.style.opacity = 0; this.bs.style.opacity = 0;
      this.cur = this.next; this.queue.shift(); this.inStep = false;
      if (this.last) this.col = this.tcol;
      this.startAt = this.t0 + this.d1 + this.d2 + (Math.random() < 0.08 ? 20 : 0); // the odd hesitation
      if (!this.queue.length) return false;
    }
    return true;
  }
}

export class Board {
  constructor(host, rows, cols, opts = {}) {
    this.host = host; this.nr = rows; this.nc = cols; this.rows = [];
    host.textContent = '';
    for (let r = 0; r < rows; r++) {
      const row = document.createElement('div');
      row.className = 'frow' + (opts.groupEvery && r > 0 && r % opts.groupEvery === 0 ? ' is-group' : '');
      const cells = [];
      for (let c = 0; c < cols; c++) { const cell = new Cell(); row.appendChild(cell.el); cells.push(cell); }
      host.appendChild(row);
      this.rows.push(cells);
    }
  }
  // text: string (padded/cut to width); cols: string of colour codes per char ('y','g','r' or ' ')
  setRow(r, text, o = {}) {
    const { delay = 0, sweep = 18, jitter = 60, colors = '', min = 3, max = 9, instant = false } = o;
    const cells = this.rows[r]; if (!cells) return 0;
    const t = (text + ' '.repeat(this.nc)).slice(0, this.nc).toUpperCase();
    let longest = 0;
    cells.forEach((cell, c) => {
      const col = (colors[c] && colors[c] !== ' ') ? colors[c] : '';
      if (instant) { cell.set(t[c], col); return; }
      const steps = min + Math.floor(Math.random() * (max - min + 1));
      const dl = delay + c * sweep + Math.random() * jitter;
      cell.to(t[c], dl, col, steps);
      longest = Math.max(longest, dl + steps * 90 + 280);
    });
    return longest;
  }
  text(r) { return this.rows[r].map((c) => c.cur).join(''); }
}

export function sizeBoard(el, cols, o = {}) {
  const cs = getComputedStyle(el);
  const inner = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  let gap = o.gap ?? Math.max(2, Math.round(inner * 0.0024));
  let cw = Math.floor((inner - gap * (cols - 1)) / cols);
  if (o.max) cw = Math.min(cw, o.max);
  else gap = Math.max(gap, (inner - cw * cols) / (cols - 1)); // let the gaps absorb the remainder so rows span the board
  const ch = Math.round(cw * (o.ratio || 1.48));
  el.style.setProperty('--cw', cw + 'px');
  el.style.setProperty('--ch', ch + 'px');
  el.style.setProperty('--fs', Math.round(cw * (o.fs || 1.06)) + 'px');
  el.style.setProperty('--gap', gap.toFixed(2) + 'px');
  el.style.setProperty('--r', Math.max(2, Math.round(cw * 0.1)) + 'px');
  el.style.setProperty('--rg', Math.round(ch * 0.17) + 'px');
  return { cw, ch, gap };
}
