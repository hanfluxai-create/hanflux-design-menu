// Ruvela Residences: floor plans, the 2D site plan and the progress towers, all drawn as SVG from data.
// Plan units are feet (1 SVG unit = 1 ft), so every size a visitor taps comes straight from the geometry.
import * as L from './layout.js';

/* ------------------------------------------------------------------ plan data */
// k: bed, living, kitchen, bath, util, wd, pass, deck, study, entry, powder
// out: outside the main walls (decks, utility balconies). hb: headboard or fixture wall (n, s, e, w).
// d: [axis, wallPos, start, width, swing]  axis 'h' = wall along x at y = wallPos, 'v' = wall along y at x = wallPos.
//    swing: +1/-1 the side the leaf opens into, 0 = open archway, 's' = sliding door.
// w: windows [axis, wallPos, start, width]
export const PLANS = {
  '2bhk': {
    id: '2bhk', name: '2 BHK', area: 1180, carpet: 806, price: 9600000,
    rooms: [
      { n: 'Bedroom 2', k: 'bed', x: 0, y: 0, w: 11.5, h: 12, hb: 'w' },
      { n: 'Master bedroom', k: 'bed', x: 0, y: 12, w: 11.5, h: 14, hb: 'w', m: 1 },
      { n: 'Bath 2', k: 'bath', x: 11.5, y: 0, w: 5.5, h: 8, hb: 'n' },
      { n: 'Passage', k: 'pass', x: 11.5, y: 8, w: 5.5, h: 7 },
      { n: 'Master bath', k: 'bath', x: 11.5, y: 15, w: 5.5, h: 8, hb: 'e' },
      { n: 'Wardrobe', k: 'wd', x: 11.5, y: 23, w: 5.5, h: 3 },
      { n: 'Entry', k: 'entry', x: 17, y: 0, w: 5, h: 10 },
      { n: 'Kitchen', k: 'kitchen', x: 22, y: 0, w: 9, h: 10 },
      { n: 'Living and dining', k: 'living', x: 17, y: 10, w: 14, h: 16 },
      { n: 'Utility', k: 'util', x: 31, y: 0, w: 4, h: 6, out: 1 },
      { n: 'Balcony', k: 'deck', x: 17, y: 26, w: 14, h: 5.5, out: 1 }
    ],
    d: [['h', 0, 18, 3, 1], ['h', 10, 17, 5, 0], ['h', 10, 23.5, 6, 0], ['v', 31, 1.5, 2.5, 1], ['v', 17, 10, 5, 0],
        ['v', 11.5, 9, 2.5, -1], ['v', 11.5, 12.25, 2.5, -1], ['h', 8, 12.5, 2.5, -1], ['v', 11.5, 16, 2.5, 1], ['v', 11.5, 23, 3, 0], ['h', 26, 19, 10, 's']],
    w: [['v', 0, 3, 6], ['h', 0, 3, 5.5], ['v', 0, 16, 6], ['h', 26, 3, 5.5], ['h', 0, 24, 5], ['h', 0, 13, 2.5], ['v', 31, 12, 10]],
    facts: [['Carpet area', '806 sq ft'], ['Balcony and utility', '101 sq ft'], ['Facing', 'East or west'], ['Floors', '2 to 20, Towers A and C'], ['Car parks', '1 covered, EV ready']]
  },
  '3bhk': {
    id: '3bhk', name: '3 BHK', area: 1560, carpet: 1092, price: 12800000,
    rooms: [
      { n: 'Bedroom 2', k: 'bed', x: 0, y: 0, w: 12, h: 12, hb: 'w' },
      { n: 'Master bedroom', k: 'bed', x: 0, y: 12, w: 12, h: 14, hb: 'w', m: 1 },
      { n: 'Bath 2', k: 'bath', x: 12, y: 0, w: 5.5, h: 8, hb: 'n' },
      { n: 'Passage', k: 'pass', x: 12, y: 8, w: 5.5, h: 7 },
      { n: 'Master bath', k: 'bath', x: 12, y: 15, w: 5.5, h: 7.5, hb: 'e' },
      { n: 'Wardrobe', k: 'wd', x: 12, y: 22.5, w: 5.5, h: 3.5 },
      { n: 'Entry', k: 'entry', x: 17.5, y: 0, w: 5, h: 9.5 },
      { n: 'Kitchen', k: 'kitchen', x: 22.5, y: 0, w: 9, h: 9.5 },
      { n: 'Living and dining', k: 'living', x: 17.5, y: 9.5, w: 14, h: 16.5 },
      { n: 'Utility', k: 'util', x: 31.5, y: 0, w: 5, h: 8 },
      { n: 'Bath 3', k: 'bath', x: 36.5, y: 0, w: 5.5, h: 8, hb: 'n' },
      { n: 'Passage', k: 'pass', x: 31.5, y: 8, w: 10.5, h: 4.5 },
      { n: 'Bedroom 3', k: 'bed', x: 31.5, y: 12.5, w: 10.5, h: 13.5, hb: 'e' },
      { n: 'Deck', k: 'deck', x: 17.5, y: 26, w: 24.5, h: 6, out: 1 }
    ],
    d: [['h', 0, 18.5, 3, 1], ['h', 9.5, 17.5, 5, 0], ['h', 9.5, 24, 5, 0], ['v', 31.5, 2, 2.5, 1], ['v', 17.5, 9.5, 5, 0],
        ['v', 12, 9, 2.5, -1], ['v', 12, 12.25, 2.5, -1], ['h', 8, 13, 2.5, -1], ['v', 12, 16, 2.5, 1], ['v', 12, 22.5, 3.5, 0],
        ['v', 31.5, 9.5, 3, 0], ['h', 12.5, 33, 2.5, 1], ['h', 8, 38, 2.5, -1], ['h', 26, 19.5, 10, 's'], ['h', 26, 34, 6, 's']],
    w: [['v', 0, 3, 6], ['h', 0, 3, 6], ['v', 0, 16, 6], ['h', 26, 3, 6], ['h', 0, 25, 5], ['h', 0, 13.5, 2.5], ['h', 0, 38, 2.5], ['v', 42, 15, 8]],
    facts: [['Carpet area', '1,092 sq ft'], ['Deck', '147 sq ft'], ['Facing', 'West, over the hills'], ['Floors', '2 to 22, all towers'], ['Car parks', '2 covered, EV ready']]
  },
  'villa': {
    id: 'villa', name: '3.5 BHK sky villa', area: 2240, carpet: 1430, price: 18600000,
    rooms: [
      { n: 'Bedroom 2', k: 'bed', x: 0, y: 0, w: 13, h: 12, hb: 'w' },
      { n: 'Master suite', k: 'bed', x: 0, y: 12, w: 13, h: 14, hb: 'w', m: 1 },
      { n: 'Bath 2', k: 'bath', x: 13, y: 0, w: 6, h: 8, hb: 'n' },
      { n: 'Passage', k: 'pass', x: 13, y: 8, w: 6, h: 7 },
      { n: 'Master bath', k: 'bath', x: 13, y: 15, w: 6, h: 7, hb: 'e' },
      { n: 'Walk-in wardrobe', k: 'wd', x: 13, y: 22, w: 6, h: 4 },
      { n: 'Entry foyer', k: 'entry', x: 19, y: 0, w: 6, h: 9 },
      { n: 'Kitchen', k: 'kitchen', x: 25, y: 0, w: 12, h: 9 },
      { n: 'Living and dining', k: 'living', x: 19, y: 9, w: 18, h: 17 },
      { n: 'Utility', k: 'util', x: 37, y: 0, w: 6, h: 7 },
      { n: 'Passage', k: 'pass', x: 37, y: 7, w: 6, h: 9 },
      { n: 'Bath 3', k: 'bath', x: 37, y: 16, w: 6, h: 6, hb: 'w' },
      { n: 'Powder room', k: 'powder', x: 37, y: 22, w: 6, h: 4 },
      { n: 'Study', k: 'study', x: 43, y: 0, w: 12, h: 11 },
      { n: 'Bedroom 3', k: 'bed', x: 43, y: 11, w: 12, h: 15, hb: 'e' },
      { n: 'Sky deck', k: 'deck', x: 0, y: 26, w: 55, h: 7, out: 1, pool: 1 }
    ],
    d: [['h', 0, 20.25, 3.5, 1], ['h', 9, 19, 6, 0], ['h', 9, 27, 8, 0], ['v', 37, 2, 2.5, 1], ['v', 19, 9, 6, 0],
        ['v', 13, 9, 2.5, -1], ['v', 13, 12.25, 2.5, -1], ['h', 8, 14.75, 2.5, -1], ['v', 13, 16, 2.5, 1], ['v', 13, 22, 4, 0],
        ['v', 37, 10, 4, 0], ['v', 43, 8, 2.5, 1], ['v', 43, 12.75, 2.5, 1], ['v', 43, 17.25, 2.5, -1], ['v', 37, 22.75, 2.5, 1],
        ['h', 26, 3, 7, 's'], ['h', 26, 21, 14, 's'], ['h', 26, 45, 8, 's']],
    w: [['v', 0, 3, 6], ['h', 0, 3, 7], ['v', 0, 15, 8], ['h', 0, 28, 7], ['h', 0, 15, 2.5], ['h', 0, 46, 6], ['v', 55, 2, 7], ['v', 55, 14, 9], ['h', 0, 38.5, 3]],
    facts: [['Carpet area', '1,430 sq ft'], ['Sky deck', '385 sq ft with a plunge pool'], ['Facing', 'Three sides open'], ['Floors', '19 to 24, Tower B only'], ['Car parks', '2 covered, EV ready']]
  }
};

/* ------------------------------------------------------------------ helpers */
const f1 = (v) => (Math.round(v * 100) / 100).toString();
export function feet(v) {
  const ft = Math.floor(v + 1e-6), inch = Math.round((v - ft) * 12);
  return ft + '′' + inch + '″';
}
export const roomArea = (r) => Math.round(r.w * r.h * 100) / 100;
export const fmtArea = (a) => (Math.round(a)).toLocaleString('en-IN');
export function dims(r) { return feet(r.w) + ' × ' + feet(r.h); }

function bounds(plan) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const r of plan.rooms) { x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h); }
  return { x0, y0, x1, y1 };
}
const inRoom = (rooms, x, y) => rooms.some(r => !r.out && x > r.x + 1e-3 && x < r.x + r.w - 1e-3 && y > r.y + 1e-3 && y < r.y + r.h - 1e-3);

// Walls: union of room edges, split into interior/exterior pieces, minus door and window openings.
function walls(plan) {
  const main = plan.rooms.filter(r => !r.out);
  const lines = { h: new Map(), v: new Map() };
  const add = (ax, p, a, b) => { const k = f1(p), m = lines[ax]; if (!m.has(k)) m.set(k, []); m.get(k).push([Math.min(a, b), Math.max(a, b)]); };
  for (const r of main) { add('h', r.y, r.x, r.x + r.w); add('h', r.y + r.h, r.x, r.x + r.w); add('v', r.x, r.y, r.y + r.h); add('v', r.x + r.w, r.y, r.y + r.h); }
  const cuts = { h: new Map(), v: new Map() };
  const cut = (ax, p, s, w) => { const k = f1(p); if (!cuts[ax].has(k)) cuts[ax].set(k, []); cuts[ax].get(k).push([s, s + w]); };
  for (const d of plan.d) cut(d[0], d[1], d[2], d[3]);
  for (const w of plan.w) cut(w[0], w[1], w[2], w[3]);
  const out = [];
  for (const ax of ['h', 'v']) for (const [k, segs] of lines[ax]) {
    const p = +k;
    // break points: every room corner on this line
    const pts = new Set();
    segs.forEach(([a, b]) => { pts.add(a); pts.add(b); });
    for (const r of main) { if (ax === 'h') { pts.add(r.x); pts.add(r.x + r.w); } else { pts.add(r.y); pts.add(r.y + r.h); } }
    (cuts[ax].get(k) || []).forEach(([a, b]) => { pts.add(a); pts.add(b); });
    const sorted = [...pts].sort((a, b) => a - b);
    let prev = null;
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i], b = sorted[i + 1], m = (a + b) / 2;
      if (b - a < 1e-3) continue;
      if (!segs.some(([s, e]) => m > s && m < e)) { prev = null; continue; }
      if ((cuts[ax].get(k) || []).some(([s, e]) => m > s && m < e)) { prev = null; continue; }
      const s1 = ax === 'h' ? inRoom(main, m, p - 0.3) : inRoom(main, p - 0.3, m);
      const s2 = ax === 'h' ? inRoom(main, m, p + 0.3) : inRoom(main, p + 0.3, m);
      const ext = !(s1 && s2);
      if (prev && prev.ext === ext && Math.abs(prev.b - a) < 1e-3) { prev.b = b; continue; }
      prev = { ax, p, a, b, ext }; out.push(prev);
    }
  }
  return out;
}

// the living room keeps a clear band between dining (top) and lounge (bottom) for its label
function livingLayout(r) {
  const lh = Math.min(7, r.h * 0.4), sy = r.y + r.h - lh - 0.6, top = r.y + 6.65;
  return { lh, sy, ly: (top + sy) / 2 + 0.35 };
}

/* furniture, in plan feet; returns SVG markup */
function furniture(r) {
  const s = [], R = (x, y, w, h, rx = 0.25, c = 'fu') => s.push(`<rect class="${c}" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}"/>`);
  const Ci = (x, y, rr, c = 'fu') => s.push(`<circle class="${c}" cx="${f1(x)}" cy="${f1(y)}" r="${rr}"/>`);
  const Ln = (x1, y1, x2, y2, c = 'fu') => s.push(`<path class="${c}" d="M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}"/>`);
  const { x, y, w, h } = r, cx = x + w / 2, cy = y + h / 2;
  if (r.k === 'bed') {
    const bw = r.m ? 6 : 5, bl = 6.6;
    if (r.hb === 'w' || r.hb === 'e') {
      const left = r.hb === 'w', bx = left ? x + 0.5 : x + w - 0.5 - bl, by = cy - bw / 2 + (r.m ? 0.8 : 0);
      R(bx, by, bl, bw, 0.35);
      const px = left ? bx + 0.35 : bx + bl - 1.55;
      R(px, by + 0.4, 1.2, bw / 2 - 0.6, 0.3); R(px, by + bw / 2 + 0.2, 1.2, bw / 2 - 0.6, 0.3);
      Ln(left ? bx + 2.6 : bx + bl - 2.6, by, left ? bx + 2.6 : bx + bl - 2.6, by + bw);
      const nx = left ? bx : bx + bl - 1.5;
      if (by - 1.9 > y + 0.3) R(nx, by - 1.8, 1.5, 1.4, 0.2);
      if (by + bw + 1.9 < y + h - 0.3) R(nx, by + bw + 0.4, 1.5, 1.4, 0.2);
    }
  } else if (r.k === 'living') {
    const dw = Math.min(6.2, w * 0.42), dh = 3.2, dx = cx - dw / 2 + w * 0.1, dy = y + 2.2;
    R(dx, dy, dw, dh, 0.3);
    for (let i = 0; i < 3; i++) { const t = dx + 0.5 + i * (dw - 1.9) / 2; R(t, dy - 1.25, 0.9, 0.9, 0.2); R(t, dy + dh + 0.35, 0.9, 0.9, 0.2); }
    const { lh, sy } = livingLayout(r);
    R(x + 0.4, sy, 2.7, lh, 0.4); R(x + 0.4, sy, 0.9, lh, 0.3);
    R(x + 4.1, sy + lh / 2 - 1.6, 2.2, 3.2, 0.3, 'fu fu-t');
    R(x + w - 1.4, sy + lh / 2 - 2.8, 1, 5.6, 0.2);
    if (w > 16) { R(x + 4.4, sy - 2.4 + lh, 2.4, 2.2, 0.4); }
  } else if (r.k === 'kitchen') {
    R(x + 0.35, y + 0.35, w - 0.7, 2.1, 0.15, 'fu fu-c');
    R(x + 0.35, y + 2.45, 2.1, h - 3.6, 0.15, 'fu fu-c');
    for (let i = 0; i < 4; i++) Ci(x + w - 3.4 + (i % 2) * 1.1, y + 0.9 + Math.floor(i / 2) * 1.0, 0.33);
    R(x + 0.7, y + h / 2 - 0.4, 1.4, 2.2, 0.4, 'fu');
    if (w > 10) R(cx - 2.4, y + h - 3.3, 4.8, 2, 0.25, 'fu fu-c');
  } else if (r.k === 'bath' || r.k === 'powder') {
    const top = r.hb !== 's';
    if (r.k === 'bath') { R(x + 0.35, y + 0.35, 3.1, 3.1, 0.2, 'fu fu-w'); Ln(x + 0.35, y + 0.35, x + 3.45, y + 3.45, 'fu fu-w'); }
    const wx = r.k === 'bath' ? x + w - 1.95 : x + 0.6, wy = top ? y + h - 2.5 : y + 0.5;
    R(wx, wy, 1.5, 0.6, 0.2); s.push(`<ellipse class="fu" cx="${f1(wx + 0.75)}" cy="${f1(wy + 1.35)}" rx="0.62" ry="0.85"/>`);
    const bx = r.k === 'bath' ? x + 0.5 : x + w - 2.3;
    R(bx, y + h - 1.7, 1.8, 1.3, 0.35); Ci(bx + 0.9, y + h - 1.05, 0.32);
  } else if (r.k === 'util') {
    R(x + 0.4, y + 0.4, 2.2, 2.2, 0.25); Ci(x + 1.5, y + 1.5, 0.75);
    if (h > 6.5) R(x + 0.4, y + 3.2, 2.2, 1.6, 0.25);
  } else if (r.k === 'wd') {
    const vert = w < h;
    if (h <= 4.1 || !vert) { R(x + 0.3, y + 0.3, w - 0.6, 1.8, 0.15); for (let i = 1; i < Math.floor(w / 1.2); i++) Ln(x + 0.3 + i * 1.2, y + 0.3, x + 0.3 + i * 1.2, y + 2.1); }
    if (h > 3.9) R(x + 0.3, y + h - 2.1, w - 0.6, 1.8, 0.15);
  } else if (r.k === 'study') {
    R(x + 0.4, y + 0.4, w * 0.55, 2.2, 0.2); Ci(x + 0.4 + w * 0.27, y + 3.4, 0.75);
    R(x + w - 1.6, y + 0.4, 1.2, h - 0.8, 0.15);
    R(x + 1, y + h - 4.2, 5.6, 2.6, 0.4);
  } else if (r.k === 'entry') {
    R(x + 0.35, y + h / 2 - 0.2, 1.3, h / 2 - 0.4, 0.15);
  } else if (r.k === 'deck') {
    if (r.pool) { R(x + w - 12, y + 1.2, 9.5, 4.2, 0.5, 'fu fu-pool'); }
    const n = r.pool ? 3 : 2;
    for (let i = 0; i < n; i++) { const lx = x + 1.2 + i * 2.6 + (r.pool ? 12 : 0); R(lx, y + 1, 1.8, 4, 0.5); Ln(lx, y + 2.2, lx + 1.8, y + 2.2); }
    for (let i = 0; i < (r.pool ? 5 : 3); i++) Ci(x + w - 1.3 - i * 1.7 - (r.pool ? 12.5 : 0), y + h - 1.1, 0.55, 'fu fu-p');
  }
  return s.join('');
}

function doorSVG(d) {
  const [ax, p, a, wd, sw] = d;
  if (sw === 0) return '';
  if (sw === 's') {
    if (ax === 'h') return `<path class="dr dr-s" d="M${f1(a)} ${f1(p - 0.18)}H${f1(a + wd * 0.55)}M${f1(a + wd * 0.45)} ${f1(p + 0.18)}H${f1(a + wd)}"/>`;
    return `<path class="dr dr-s" d="M${f1(p - 0.18)} ${f1(a)}V${f1(a + wd * 0.55)}M${f1(p + 0.18)} ${f1(a + wd * 0.45)}V${f1(a + wd)}"/>`;
  }
  // hinge at the start of the opening, leaf swings into side `sw`
  if (ax === 'h') {
    const hx = a, hy = p, ly = p + sw * wd;
    return `<path class="dr" d="M${f1(hx)} ${f1(hy)}L${f1(hx)} ${f1(ly)}"/><path class="dr dr-a" d="M${f1(hx + wd)} ${f1(hy)}A${wd} ${wd} 0 0 ${sw > 0 ? 1 : 0} ${f1(hx)} ${f1(ly)}"/>`;
  }
  const hx = p, hy = a, lx = p + sw * wd;
  return `<path class="dr" d="M${f1(hx)} ${f1(hy)}L${f1(lx)} ${f1(hy)}"/><path class="dr dr-a" d="M${f1(hx)} ${f1(hy + wd)}A${wd} ${wd} 0 0 ${sw > 0 ? 0 : 1} ${f1(lx)} ${f1(hy)}"/>`;
}
function windowSVG(w) {
  const [ax, p, a, wd] = w;
  if (ax === 'h') return `<rect class="wn" x="${f1(a)}" y="${f1(p - 0.3)}" width="${wd}" height="0.6"/><path class="wn-l" d="M${f1(a)} ${f1(p)}H${f1(a + wd)}"/>`;
  return `<rect class="wn" x="${f1(p - 0.3)}" y="${f1(a)}" width="0.6" height="${wd}"/><path class="wn-l" d="M${f1(p)} ${f1(a)}V${f1(a + wd)}"/>`;
}

/* ------------------------------------------------------------------ plan renderer */
// opts: { id, interactive, labels: 'full' | 'names' | 'none', pad }
export function renderPlan(plan, opts = {}) {
  const b = bounds(plan), pad = opts.pad ?? 2.2;
  const vb = [b.x0 - pad, b.y0 - pad, b.x1 - b.x0 + pad * 2, b.y1 - b.y0 + pad * 2];
  const id = opts.id || plan.id;
  const rooms = plan.rooms.map((r, i) => {
    const area = roomArea(r), small = Math.min(r.w, r.h) < 6.2, tiny = Math.min(r.w, r.h) < 4.5 || area < 30;
    const lab = r.k === 'pass' ? '' : r.n;
    const cls = ['rm', 'rm-' + r.k, r.out ? 'rm-out' : '', small ? 'rm-sm' : '', tiny ? 'rm-tiny' : ''].join(' ');
    const fs0 = r.k === 'living' || (r.k === 'bed' && !small) || r.k === 'deck' ? 1.05 : 0.82;
    const maxW = r.w - 0.9, est = (t, f) => t.length * f * 0.56;
    const fs = lab && est(lab, fs0) > maxW ? Math.max(0.55, fs0 * maxW / est(lab, fs0)) : fs0;
    const half = lab ? Math.max(est(lab, fs), r.k === 'pass' ? 0 : est(dims(r), 0.6) * (opts.labels === 'full' ? 1 : 0)) / 2 : 0;
    const shift = r.k === 'bed' && r.hb === 'w' ? 2.4 : r.k === 'bed' && r.hb === 'e' ? -2.4 : 0;
    const lx = Math.min(r.x + r.w - 0.45 - half, Math.max(r.x + 0.45 + half, r.x + r.w / 2 + shift));
    const ly = r.k === 'living' ? livingLayout(r).ly : r.y + r.h / 2;
    const label = (opts.labels === 'none' || !lab) ? '' :
      `<text class="rl" x="${f1(lx)}" y="${f1(ly - (opts.labels === 'names' ? -0.3 : 0.15))}" style="font-size:${f1(fs)}px">${lab.replace('Living and dining', 'Living &amp; dining')}</text>` +
      (opts.labels === 'full' ? `<text class="rd" x="${f1(lx)}" y="${f1(ly + 1.1)}">${dims(r)}</text>` : '');
    const tap = opts.interactive && r.k !== 'pass';
    const aria = tap ? ` tabindex="0" role="button" aria-label="${r.n}, ${feet(r.w)} by ${feet(r.h)}, ${fmtArea(area)} square feet" data-room="${i}"` : '';
    return `<g class="${cls}"${aria}><rect class="rf" x="${f1(r.x)}" y="${f1(r.y)}" width="${f1(r.w)}" height="${f1(r.h)}"/>${opts.furniture === false ? '' : furniture(r)}${label}</g>`;
  }).join('');
  const wl = walls(plan).map(s => {
    const d = s.ax === 'h' ? `M${f1(s.a)} ${f1(s.p)}H${f1(s.b)}` : `M${f1(s.p)} ${f1(s.a)}V${f1(s.b)}`;
    return `<path class="wl ${s.ext ? 'wl-x' : 'wl-i'}" d="${d}"/>`;
  }).join('');
  const outs = plan.rooms.filter(r => r.out).map(r => `<path class="wl wl-o" d="M${f1(r.x)} ${f1(r.y)}V${f1(r.y + r.h)}H${f1(r.x + r.w)}V${f1(r.y)}"/>`).join('');
  const doors = plan.d.map(doorSVG).join('');
  const wins = plan.w.map(windowSVG).join('');
  // overall dimension lines
  const W = b.x1 - b.x0, dimTop = `<g class="dm"><path d="M${f1(b.x0)} ${f1(b.y0 - 1.2)}H${f1(b.x1)}M${f1(b.x0)} ${f1(b.y0 - 1.7)}V${f1(b.y0 - 0.7)}M${f1(b.x1)} ${f1(b.y0 - 1.7)}V${f1(b.y0 - 0.7)}"/></g>`;
  return `<svg class="plan" id="${id}" viewBox="${vb.map(f1).join(' ')}" role="img" aria-label="Floor plan of the ${plan.name}, ${plan.area.toLocaleString('en-IN')} square feet" data-w="${f1(W)}">` +
    `<g class="rooms">${rooms}</g><g class="walls">${outs}${wl}</g><g class="wins">${wins}</g><g class="doors">${doors}</g>${opts.dims === false ? '' : dimTop}</svg>`;
}

/* ------------------------------------------------------------------ site plan (shared with the 3D scene) */
export function renderSitePlan() {
  const S = L.SITE, P = L.POOL, K = L.KIDS_POOL, D = L.DECK, CL = L.CLUB;
  const pts = (arr) => arr.map(p => f1(p[0]) + ',' + f1(p[1])).join(' ');
  const rr = (inset, r) => pts(L.roundRect(S.x0 + inset, S.z0 + inset, S.x1 - inset, S.z1 - inset, r, 6));
  const rect = (o, w, d, yaw, cls, extra = '') => {
    const c = Math.cos(yaw), s = Math.sin(yaw), hw = w / 2, hd = d / 2;
    // three.js rotation.y: world = (lx*c + lz*s, -lx*s + lz*c)
    const P4 = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([lx, lz]) => [o.x + lx * c + lz * s, o.z - lx * s + lz * c]);
    return `<polygon class="${cls}" points="${pts(P4)}"${extra}/>`;
  };
  const trees = L.siteTrees().map((t, i) => `<circle class="st-tree st-t${t.k}" cx="${f1(t.x)}" cy="${f1(t.z)}" r="${f1(1.05 * t.s)}" style="--i:${i}"/>`).join('');
  const lawns = L.LAWNS.map(l => `<ellipse class="st-lawn" cx="${l.x}" cy="${l.z}" rx="${l.rx}" ry="${l.rz}" transform="rotate(${f1(l.rot * 180 / Math.PI)} ${l.x} ${l.z})"/>`).join('');
  const towers = L.TOWERS.map((t, i) => rect(t, t.w, t.d, t.yaw, 'st-tower') +
    `<text class="st-tl" x="${f1(t.x)}" y="${f1(t.z + 0.9)}">${t.id}</text><text class="st-tf" x="${f1(t.x)}" y="${f1(t.z + 2.3)}">${t.floors} floors</text>`).join('');
  const lanes = [1, 2, 3].map(i => `<path class="st-lane" d="M${f1(P.x - P.w / 2 + 0.3)} ${f1(P.z - P.d / 2 + i * P.d / 4)}H${f1(P.x + P.w / 2 - 0.3)}"/>`).join('');
  const track = `<polygon class="st-track" points="${rr(L.TRACK.inset + L.TRACK.width / 2, S.r - L.TRACK.inset - L.TRACK.width / 2)}"/>`;
  const mpc = (x1, y1, x2, y2, tx, ty, label, anchor = 'start') =>
    `<g class="st-call"><path d="M${x1} ${y1}L${x2} ${y2}"/><circle cx="${x1}" cy="${y1}" r="0.35"/><text x="${tx}" y="${ty}" text-anchor="${anchor}">${label}</text></g>`;
  return `<svg class="siteplan" viewBox="-31 -24 62 50" role="img" aria-label="Site plan of Ruvela Residences: three towers along the northern edge, a landscaped podium with lawns, a lap pool, a kids' play garden, a clubhouse and a jogging loop, with the main gate on Baner Road">
  <defs><pattern id="sp-hatch" width="1.2" height="1.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V1.2" class="st-hatch"/></pattern></defs>
  <g class="st-contours">
    <path d="M-31 -20C-18 -23 -6 -18 6 -21S24 -24 31 -19"/><path d="M-31 -16.5C-20 -19.5 -8 -15 4 -17.8S22 -21 31 -15.5"/><path d="M-31 -13C-24 -14 -20 -12 -12 -12.3"/><path d="M20 -12C24 -13.5 28 -12.5 31 -12"/>
  </g>
  <g class="st-road"><rect x="-31" y="${f1(L.ROAD_Z - 2.7)}" width="62" height="5.4"/><path class="st-dash" d="M-31 ${L.ROAD_Z}H31"/>
    <rect x="${f1(L.ROAD_X - 1.8)}" y="-24" width="3.6" height="${f1(L.ROAD_Z - 2.7 + 24)}"/></g>
  <text class="st-roadl" x="-27" y="${f1(L.ROAD_Z + 0.5)}">BANER ROAD</text>
  <path class="st-drive" d="M${L.GATE.x - 2.1} ${S.z1}V${L.ROAD_Z - 2.7}H${L.GATE.x + 2.1}V${S.z1}"/>
  <polygon class="st-podium" points="${rr(0, S.r)}"/>
  ${track}
  <g class="st-lawns">${lawns}</g>
  <rect class="st-pave" x="-19" y="-4.2" width="38" height="1.8"/>
  <rect class="st-pave" x="3.7" y="5.4" width="4.6" height="6.4"/>
  <rect class="st-deck" x="${D.x - D.w / 2}" y="${D.z - D.d / 2}" width="${D.w}" height="${D.d}"/>
  <rect class="st-water" x="${P.x - P.w / 2}" y="${P.z - P.d / 2}" width="${P.w}" height="${P.d}" rx="0.2"/>${lanes}
  <rect class="st-water" x="${K.x - K.w / 2}" y="${K.z - K.d / 2}" width="${K.w}" height="${K.d}" rx="0.5"/>
  <circle class="st-play" cx="${L.PLAY.x}" cy="${L.PLAY.z}" r="2.1"/>
  ${rect(CL, CL.w, CL.d, CL.yaw, 'st-club')}${rect(CL, CL.w - 1.4, CL.d - 1.4, CL.yaw, 'st-club-in', ' fill="url(#sp-hatch)"')}
  <text class="st-tl st-tl-c" x="${CL.x}" y="${CL.z + 0.5}">Clubhouse</text>
  <g class="st-trees">${trees}</g>
  <g class="st-towers">${towers}</g>
  <rect class="st-gate" x="${L.GATE.x - 4.8}" y="${L.GATE.z + 1.5}" width="2.4" height="1.6"/>
  ${mpc(P.x - 2.6, P.z + 0.9, P.x - 2.6, 19.0, P.x - 2.2, 19.75, '30 M LAP POOL', 'start')}
  ${mpc(L.PLAY.x, L.PLAY.z + 2.1, L.PLAY.x, 19.0, L.PLAY.x + 0.4, 19.75, 'KIDS\u2019 PLAY', 'start')}
  <g class="st-call"><path d="M-24 -5.5H-26.3"/><circle cx="-24" cy="-5.5" r="0.35"/><text x="-27.1" y="-5.5" transform="rotate(-90 -27.1 -5.5)" text-anchor="start">JOGGING LOOP 460 M</text></g>
  ${mpc(L.GATE.x, S.z1 + 0.4, 22.6, 19.0, 22.9, 19.75, 'MAIN GATE', 'start')}
  <g class="st-north" transform="translate(27 -19)"><circle r="2.2"/><path d="M0 -1.5L0.8 1.2L0 0.6L-0.8 1.2Z"/><text y="-2.8">N</text></g>
  <g class="st-scale" transform="translate(-28.5 -20.6)"><path d="M0 0H16.1M0 -0.5V0.5M8.05 -0.4V0.4M16.1 -0.5V0.5"/><text x="0" y="-1">0</text><text x="8.05" y="-1">25</text><text x="16.1" y="-1">50 M</text></g>
</svg>`;
}

/* ------------------------------------------------------------------ progress tower elevation */
export function renderTowerProgress(floors, done, label) {
  const fh = 1, w = 10, top = 2.4, H = top + floors * fh + 2.6;
  let s = '';
  for (let k = 0; k < floors; k++) {
    const y = top + (floors - 1 - k) * fh;
    const cls = k < done - 1 ? 'tp-done' : k === done - 1 ? 'tp-now' : 'tp-todo';
    s += `<rect class="${cls}" x="0.6" y="${f1(y + 0.08)}" width="${w - 1.2}" height="${f1(fh - 0.16)}" style="--k:${k}"/>`;
  }
  return `<svg class="tp-svg" viewBox="0 0 ${w} ${f1(H)}" preserveAspectRatio="xMidYMax meet" role="img" aria-label="${label}: slab ${done} of ${floors} cast">` +
    `<rect class="tp-roof" x="0" y="${f1(top - 1.2)}" width="${w}" height="0.5"/>` + s +
    `<rect class="tp-lobby" x="1.2" y="${f1(top + floors * fh)}" width="${w - 2.4}" height="1.8"/><path class="tp-ground" d="M-1 ${f1(H - 0.5)}H${w + 1}"/></svg>`;
}
