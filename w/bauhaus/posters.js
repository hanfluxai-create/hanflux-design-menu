// Formhaus "learn by making" wall: generative Bauhaus composition studies on canvas.
// Each poster is a list of draw ops on a 300 x 400 design grid, revealed one by one.

const P = { red: '#d7261e', blue: '#1f4e9e', yellow: '#f2c230', black: '#111111', paper: '#f0e9dc', paper2: '#e6dccb' };
const WORDS = ['form', 'rhythm', 'balance', 'tension', 'weight', 'order', 'contrast', 'measure', 'gravity', 'pulse'];

function mulberry(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const outBack = (t) => { const c = 1.6; t = Math.min(1, Math.max(0, t)) - 1; return 1 + (c + 1) * t * t * t + c * t * t; };
const outCubic = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

function template(rand, n) {
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const R = (a, b) => a + rand() * (b - a);
  const ops = [];
  const kind = Math.floor(rand() * 6);
  const word = pick(WORDS);
  let bg = P.paper, ink = P.black;
  if (kind === 0) { // sun and bars
    bg = pick([P.paper, P.paper, P.yellow]);
    const sun = pick([P.red, P.blue, P.black].filter((c) => c !== bg));
    ops.push({ k: 'circle', cx: R(100, 200), cy: R(120, 190), r: R(84, 124), c: sun });
    ops.push({ k: 'rect', cx: R(90, 210), cy: R(170, 260), w: R(20, 32), h: 420, rot: pick([0, 45, -45, 30, -30]), c: P.black });
    ops.push({ k: 'rect', cx: 150, cy: R(270, 300), w: 300, h: R(10, 18), rot: 0, c: pick([P.red, P.blue, P.black]) });
    ops.push({ k: 'tri', cx: R(60, 240), cy: R(220, 300), w: R(46, 72), h: R(46, 72), rot: pick([0, 90, 180, 270]), c: pick([P.blue, P.yellow, P.red].filter((c) => c !== bg && c !== sun)) });
    ops.push({ k: 'circle', cx: R(40, 260), cy: R(40, 90), r: R(10, 18), c: P.black });
  } else if (kind === 1) { // dot grid
    bg = pick([P.black, P.blue, P.paper]);
    ink = bg === P.paper ? P.black : P.paper;
    const cols = [P.red, P.yellow, P.blue, P.paper, P.black].filter((c) => c !== bg);
    const odd = Math.floor(rand() * 12);
    for (let i = 0; i < 12; i++) {
      const cx = 60 + (i % 3) * 90, cy = 64 + Math.floor(i / 3) * 78, r = R(14, 34), c = pick(cols);
      if (i === odd) ops.push({ k: 'rect', cx, cy, w: 56, h: 56, rot: 45, c: P.red === bg ? P.yellow : P.red });
      else ops.push({ k: 'circle', cx, cy, r, c });
    }
  } else if (kind === 2) { // stack
    bg = P.paper;
    let y = 400;
    const cols = [P.black, P.red, P.yellow, P.blue];
    const start = Math.floor(rand() * 4);
    let top = 400;
    for (let i = 0; i < 4; i++) { const h = R(28, 56); ops.push({ k: 'rect', cx: 150, cy: y - h / 2, w: 300, h, rot: 0, c: cols[(start + i) % 4] }); y -= h; top = y; }
    ops.push({ k: 'half', cx: R(90, 210), cy: top, r: R(64, 104), rot: 0, c: cols[(start + 1) % 4] === P.yellow ? P.blue : P.yellow });
    ops.push({ k: 'circle', cx: R(40, 260), cy: R(50, 110), r: R(14, 26), c: P.red });
  } else if (kind === 3) { // diagonal
    bg = P.paper;
    const big = pick([P.blue, P.red, P.black]);
    ops.push({ k: 'rtri', cx: 150, cy: 200, w: 300, h: 400, rot: 0, c: big });
    ops.push({ k: 'circle', cx: R(110, 190), cy: R(160, 240), r: R(54, 78), c: P.yellow });
    for (let i = 0; i < 3; i++) ops.push({ k: 'line', x1: 170, y1: 56 + i * 12, x2: R(220, 284), y2: 56 + i * 12, w: 3, c: P.black });
    ops.push({ k: 'rect', cx: R(200, 260), cy: R(300, 360), w: 26, h: 26, rot: 0, c: big === P.red ? P.blue : P.red });
  } else if (kind === 4) { // arcs
    bg = pick([P.paper, P.black]);
    const cols = [P.red, P.yellow, P.blue, bg === P.paper ? P.black : P.paper];
    for (let i = 0; i < 12; i++) {
      if (rand() < 0.18) continue;
      const cx = 50 + (i % 3) * 100, cy = 50 + Math.floor(i / 3) * 100;
      const rot = pick([0, 90, 180, 270]);
      const off = [[-50, 50], [-50, -50], [50, -50], [50, 50]][rot / 90];
      ops.push({ k: 'quarter', cx: cx + off[0], cy: cy + off[1], r: 100, rot, c: pick(cols) });
    }
    ink = bg === P.paper ? P.black : P.paper;
  } else { // type study
    bg = pick([P.yellow, P.paper, P.blue]);
    ink = bg === P.blue ? P.paper : P.black;
    ops.push({ k: 'circle', cx: R(170, 230), cy: R(110, 160), r: R(70, 100), c: bg === P.blue ? P.red : P.blue });
    ops.push({ k: 'glyph', ch: pick(['F', 'O', 'R', 'M', 'A', 'S', 'H']), x: R(18, 60), y: 330, size: 330, c: ink });
    ops.push({ k: 'rect', cx: 150, cy: R(340, 352), w: 300, h: 10, rot: 0, c: P.red === bg ? P.black : P.red });
  }
  // shared typography: number, word, ruler
  ops.push({ k: 'text', s: 'No. ' + n, x: 14, y: 22, size: 11, font: '700 11px Archivo, sans-serif', c: ink, align: 'left' });
  ops.push({ k: 'text', s: 'FORMHAUS', x: 286, y: 22, size: 11, font: '700 11px Archivo, sans-serif', c: ink, align: 'right' });
  ops.push({ k: 'text', s: word, x: 14, y: 386, font: '400 34px "Archivo Black", sans-serif', c: kind === 2 ? P.paper : ink, align: 'left' });
  return { bg, ops };
}

function drawOp(ctx, o, e) {
  if (e <= 0) return;
  ctx.fillStyle = o.c; ctx.strokeStyle = o.c;
  ctx.save();
  switch (o.k) {
    case 'circle': ctx.translate(o.cx, o.cy); ctx.scale(e, e); ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fill(); break;
    case 'rect': ctx.translate(o.cx, o.cy); ctx.rotate(o.rot * Math.PI / 180); ctx.scale(o.h > o.w ? 1 : e, o.h > o.w ? e : 1); ctx.fillRect(-o.w / 2, -o.h / 2, o.w, o.h); break;
    case 'half': ctx.translate(o.cx, o.cy); ctx.rotate(o.rot * Math.PI / 180); ctx.scale(e, e); ctx.beginPath(); ctx.arc(0, 0, o.r, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill(); break;
    case 'tri': ctx.translate(o.cx, o.cy); ctx.rotate(o.rot * Math.PI / 180); ctx.scale(e, e); ctx.beginPath(); ctx.moveTo(0, -o.h / 2); ctx.lineTo(o.w / 2, o.h / 2); ctx.lineTo(-o.w / 2, o.h / 2); ctx.closePath(); ctx.fill(); break;
    case 'rtri': ctx.translate(o.cx, o.cy); ctx.rotate(o.rot * Math.PI / 180); ctx.translate(-o.w / 2, o.h / 2); ctx.scale(e, e); ctx.beginPath(); ctx.moveTo(0, -o.h); ctx.lineTo(o.w, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); break;
    case 'quarter': ctx.translate(o.cx, o.cy); ctx.rotate(o.rot * Math.PI / 180); ctx.scale(e, e); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.r, -Math.PI / 2, 0); ctx.closePath(); ctx.fill(); break;
    case 'line': ctx.lineWidth = o.w; ctx.beginPath(); ctx.moveTo(o.x1, o.y1); ctx.lineTo(o.x1 + (o.x2 - o.x1) * Math.min(1, e), o.y2); ctx.stroke(); break;
    case 'glyph': ctx.globalAlpha = Math.min(1, e); ctx.font = `400 ${o.size}px "Archivo Black", sans-serif`; ctx.textBaseline = 'alphabetic'; ctx.fillText(o.ch, o.x, o.y + (1 - Math.min(1, e)) * 30); break;
    case 'text': ctx.globalAlpha = Math.min(1, e); ctx.font = o.font; ctx.textAlign = o.align; ctx.textBaseline = 'alphabetic'; ctx.fillText(o.s, o.x, o.y); break;
    default: break;
  }
  ctx.restore();
}

export class Poster {
  constructor(canvas, seed) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.seed = seed; this.t0 = 0; this.done = true; this.model = null;
  }
  size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(60, this.canvas.clientWidth || 240);
    const W = Math.round(w * dpr), H = Math.round(w * 4 / 3 * dpr);
    if (this.canvas.width !== W || this.canvas.height !== H) { this.canvas.width = W; this.canvas.height = H; }
    this.k = W / 300;
  }
  generate(n, now, instant) {
    const rand = mulberry(this.seed++ * 7919 + 13);
    this.model = template(rand, n);
    this.model.ops.forEach((o, i) => { o.t = i * 70; });
    this.prev = this.lastBg || this.model.bg;
    this.lastBg = this.model.bg;
    this.t0 = instant ? now - 10000 : now;
    this.done = false;
    this.size();
  }
  draw(now) {
    if (this.done || !this.model) return;
    const { ctx } = this, m = this.model;
    const el = now - this.t0;
    ctx.setTransform(this.k, 0, 0, this.k, 0, 0);
    // background wipes in from the left
    const wipe = outCubic(el / 520);
    ctx.fillStyle = this.prev; ctx.fillRect(0, 0, 300, 400);
    ctx.fillStyle = m.bg; ctx.fillRect(0, 0, 300 * wipe, 400);
    let last = 0;
    for (const o of m.ops) {
      const e = outBack((el - 260 - o.t) / 520);
      drawOp(ctx, o, e);
      last = Math.max(last, o.t);
    }
    if (el > last + 260 + 600) this.done = true;
  }
}
