// Gold line illustrations for The Gilded Palms: suite interiors, venues, lotus, boat, crest.
import { cusped, dome, chhatri, circle } from './palace.js';

const f = (n) => Math.round(n * 10) / 10;
const M = (x, y) => `M${f(x)} ${f(y)}`;
const L = (x, y) => `L${f(x)} ${f(y)}`;
const C = (a, b, c, d, e, g) => `C${f(a)} ${f(b)} ${f(c)} ${f(d)} ${f(e)} ${f(g)}`;
const Q = (a, b, c, d) => `Q${f(a)} ${f(b)} ${f(c)} ${f(d)}`;
const rect = (x, y, w, h) => M(x, y) + L(x + w, y) + L(x + w, y + h) + L(x, y + h) + 'Z';
const line = (x1, y1, x2, y2) => M(x1, y1) + L(x2, y2);
const arcTop = (cx, cy, r) => M(cx - r, cy) + `A${f(r)} ${f(r)} 0 0 1 ${f(cx + r)} ${f(cy)}`;

// mini palace silhouette in line (for windows and views)
function miniPalace(cx, yb, s) {
  let d = M(cx - 60 * s, yb) + L(cx + 60 * s, yb);
  d += M(cx - 56 * s, yb) + L(cx - 56 * s, yb - 20 * s) + L(cx + 56 * s, yb - 20 * s) + L(cx + 56 * s, yb);
  d += M(cx - 22 * s, yb - 20 * s) + L(cx - 22 * s, yb - 34 * s) + L(cx + 22 * s, yb - 34 * s) + L(cx + 22 * s, yb - 20 * s);
  d += dome(cx, yb - 34 * s, 15 * s, 24 * s);
  d += M(cx, yb - 58 * s) + L(cx, yb - 66 * s);
  d += dome(cx - 44 * s, yb - 20 * s, 7 * s, 12 * s) + dome(cx + 44 * s, yb - 20 * s, 7 * s, 12 * s);
  for (let i = -3; i <= 3; i++) if (i) d += cusped(cx + i * 14 * s, yb - 2 * s, 7 * s, 8 * s, 3);
  return d;
}
function ripples(x0, x1, y0, n, gap) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const y = y0 + i * gap, o = (i % 2) * 14;
    d += M(x0 + o, y) + L(x0 + (x1 - x0) * 0.42 + o, y) + M(x0 + (x1 - x0) * 0.55 + o, y) + L(x1 - 6 + o * 0.2, y);
  }
  return d;
}
function floorInlay(y0, y1, vx = 150) {
  let d = line(10, y0, 290, y0);
  for (const x of [-60, 0, 60, 120, 180, 240, 300, 360]) d += M(vx + (x - vx) * 0.32, y0) + L(x, y1);
  d += line(0, y0 + (y1 - y0) * 0.45, 300, y0 + (y1 - y0) * 0.45);
  return d;
}
function fanHead(cx, yb, r, n = 9) {
  let d = arcTop(cx, yb, r) + arcTop(cx, yb, r * 0.62) + line(cx - r, yb, cx + r, yb);
  for (let i = 1; i < n; i++) { const a = Math.PI + (i / n) * Math.PI; d += M(cx + Math.cos(a) * r * 0.62, yb + Math.sin(a) * r * 0.62) + L(cx + Math.cos(a) * r, yb + Math.sin(a) * r); }
  return d;
}
function lamp(x, yb, h) {
  return line(x, yb, x, yb - h * 0.55) + M(x - h * 0.28, yb - h * 0.55) + L(x + h * 0.28, yb - h * 0.55) + L(x + h * 0.16, yb - h) + L(x - h * 0.16, yb - h) + 'Z' + line(x - h * 0.2, yb, x + h * 0.2, yb);
}
function lantern(x, y, s) {
  return line(x, 0, x, y) + M(x - 8 * s, y + 4 * s) + L(x + 8 * s, y + 4 * s) + L(x + 12 * s, y + 18 * s) + L(x + 6 * s, y + 30 * s) + L(x - 6 * s, y + 30 * s) + L(x - 12 * s, y + 18 * s) + 'Z' + line(x - 12 * s, y + 18 * s, x + 12 * s, y + 18 * s) + line(x, y + 30 * s, x, y + 38 * s) + line(x - 4 * s, y + 4 * s, x, y) + line(x + 4 * s, y + 4 * s, x, y);
}
function drape(x, y0, y1, dir) {
  return M(x, y0) + C(x + dir * 18, y0 + (y1 - y0) * 0.35, x + dir * 4, y0 + (y1 - y0) * 0.7, x + dir * 22, y1) + M(x + dir * 9, y0) + C(x + dir * 24, y0 + (y1 - y0) * 0.4, x + dir * 14, y0 + (y1 - y0) * 0.75, x + dir * 30, y1);
}

export const ROOMS = {
  lake() {
    const p = [];
    p.push(floorInlay(300, 360));
    p.push(cusped(150, 194, 116, 62, 9) + cusped(150, 194, 104, 56, 9) + line(86, 194, 214, 194) + line(82, 200, 218, 200));
    p.push(miniPalace(150, 164, 0.6) + ripples(100, 204, 170, 3, 7));
    p.push(drape(80, 70, 204, 1) + drape(220, 70, 204, -1));
    p.push(fanHead(150, 252, 50, 7));
    p.push(rect(64, 252, 172, 34) + line(64, 266, 236, 266) + M(80, 252) + C(100, 240, 130, 240, 140, 252) + M(160, 252) + C(170, 240, 200, 240, 220, 252) + line(70, 286, 70, 298) + line(230, 286, 230, 298));
    p.push(rect(26, 262, 30, 36) + rect(244, 262, 30, 36) + lamp(41, 262, 34) + lamp(259, 262, 34));
    return p;
  },
  jharokha() {
    const p = [];
    p.push(floorInlay(304, 360));
    p.push(M(40, 96) + C(100, 64, 200, 64, 260, 96) + M(46, 104) + C(102, 74, 198, 74, 254, 104) + line(150, 70, 150, 58) + circle(150, 54, 3));
    p.push(line(52, 104, 52, 236) + line(248, 104, 248, 236));
    for (const x of [86, 150, 214]) p.push(cusped(x, 224, 52, 84, 7));
    p.push(ripples(64, 236, 196, 3, 8) + M(130, 184) + Q(150, 194, 170, 184) + line(150, 184, 150, 168) + M(150, 168) + L(162, 180));
    p.push(rect(48, 236, 204, 18) + M(48, 236) + C(48, 224, 66, 224, 66, 236) + M(234, 236) + C(234, 224, 252, 224, 252, 236) + rect(92, 220, 34, 16) + rect(174, 220, 34, 16) + M(109, 222) + L(118, 228) + L(109, 234) + L(100, 228) + 'Z' + M(191, 222) + L(200, 228) + L(191, 234) + L(182, 228) + 'Z');
    p.push(line(48, 254, 48, 300) + line(252, 254, 252, 300));
    p.push(rect(104, 276, 92, 10) + line(112, 286, 112, 302) + line(188, 286, 188, 302) + M(132, 276) + C(128, 262, 152, 258, 154, 268) + L(160, 264) + M(134, 268) + L(126, 264) + M(168, 276) + L(168, 268) + L(178, 268) + L(178, 276));
    p.push(lantern(150, 26, 0.9));
    return p;
  },
  maharani() {
    const p = [];
    p.push(floorInlay(304, 360));
    // chandelier
    p.push(line(150, 0, 150, 30) + M(110, 44) + C(120, 58, 180, 58, 190, 44) + M(124, 34) + C(132, 44, 168, 44, 176, 34) + line(110, 44, 124, 34) + line(190, 44, 176, 34));
    for (const x of [114, 132, 150, 168, 186]) p.push(line(x, 48, x, 58) + circle(x, 61, 2.2));
    // canopy bed
    p.push(line(66, 110, 66, 298) + line(234, 110, 234, 298) + line(92, 124, 92, 250) + line(208, 124, 208, 250));
    p.push(line(60, 110, 240, 110) + line(66, 118, 234, 118));
    let sc = '';
    for (let x = 66; x < 234; x += 21) sc += M(x, 118) + Q(x + 10.5, 134, x + 21, 118);
    p.push(sc);
    p.push(drape(66, 118, 260, 1) + drape(234, 118, 260, -1));
    p.push(fanHead(150, 214, 58, 7));
    p.push(rect(78, 214, 144, 44) + line(78, 232, 222, 232) + M(94, 214) + C(104, 200, 136, 200, 144, 214) + M(156, 214) + C(164, 200, 196, 200, 206, 214) + M(78, 246) + C(120, 238, 180, 254, 222, 244));
    p.push(rect(240, 268, 30, 30) + lamp(255, 268, 30) + rect(30, 268, 30, 30) + lamp(45, 268, 30));
    return p;
  },
  palms() {
    const p = [];
    // colonnade with a cusped arch to the lake
    p.push(line(40, 250, 260, 250) + line(40, 86, 260, 86) + line(40, 94, 260, 94));
    p.push(rect(48, 94, 16, 156) + rect(236, 94, 16, 156));
    p.push(cusped(150, 250, 150, 112, 11));
    p.push(miniPalace(150, 214, 0.55) + ripples(84, 216, 222, 3, 8));
    // plunge pool in perspective
    p.push(M(56, 270) + L(244, 270) + L(272, 336) + L(28, 336) + 'Z' + M(66, 278) + L(234, 278) + L(258, 328) + L(42, 328) + 'Z');
    p.push(ripples(70, 230, 292, 3, 11));
    // potted palm, left
    p.push(M(16, 300) + L(48, 300) + L(42, 330) + L(22, 330) + 'Z' + M(32, 300) + C(30, 270, 28, 240, 34, 210));
    for (const [ex, ey] of [[4, 214], [10, 186], [36, 176], [62, 192], [68, 222]]) p.push(M(34, 210) + Q((34 + ex) / 2, Math.min(210, ey) - 16, ex, ey) + M(34, 210) + Q((34 + ex) / 2 + 4, Math.min(210, ey) - 6, ex, ey));
    // lounger, right
    p.push(M(214, 300) + L(278, 300) + L(278, 306) + L(214, 306) + 'Z' + M(262, 300) + L(286, 272) + M(222, 306) + L(222, 318) + M(270, 306) + L(270, 318));
    return p;
  },
};

export function roomSVG(key, label) {
  const parts = ROOMS[key]();
  return `<svg viewBox="0 0 300 360" role="img" aria-label="${label}" fill="none" stroke="url(#gold-v)" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">${parts.map((d) => `<path d="${d}"/>`).join('')}</svg>`;
}

// venue vignettes
export function terraceSVG() {
  const p = [];
  p.push(line(0, 230, 400, 230) + ripples(20, 380, 244, 6, 11));
  p.push(miniPalace(260, 222, 1.05));
  p.push(circle(108, 150, 34) + circle(108, 150, 44));
  for (let i = 0; i < 12; i++) { const a = Math.PI + (i / 11) * Math.PI; p.push(M(108 + Math.cos(a) * 52, 150 + Math.sin(a) * 52) + L(108 + Math.cos(a) * 72, 150 + Math.sin(a) * 72)); }
  // balustrade in the foreground
  let b = line(0, 300, 400, 300) + line(0, 308, 400, 308) + line(0, 352, 400, 352);
  for (let x = 14; x < 400; x += 26) b += M(x, 308) + C(x - 7, 318, x - 7, 330, x, 336) + C(x + 7, 330, x + 7, 318, x, 308) + line(x, 336, x, 352);
  p.push(b);
  // string of lanterns
  p.push(M(0, 40) + Q(200, 110, 400, 40));
  for (const t of [0.15, 0.35, 0.55, 0.75, 0.92]) {
    const x = t * 400, y = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 110 + t * t * 40;
    p.push(M(x - 6, y + 4) + L(x + 6, y + 4) + L(x + 8, y + 16) + L(x, y + 24) + L(x - 8, y + 16) + 'Z' + line(x, y, x, y + 4));
  }
  return p;
}
export function barSVG() {
  const p = [];
  // fan of rays behind a coupe
  for (let i = 0; i <= 16; i++) { const a = Math.PI + (i / 16) * Math.PI; p.push(M(200 + Math.cos(a) * 126, 210 + Math.sin(a) * 126) + L(200 + Math.cos(a) * 178, 210 + Math.sin(a) * 178)); }
  p.push(arcTop(200, 210, 182) + arcTop(200, 210, 192) + arcTop(200, 210, 122));
  p.push(M(126, 120) + L(274, 120) + C(270, 168, 236, 192, 200, 192) + C(164, 192, 130, 168, 126, 120) + 'Z' + M(138, 136) + L(262, 136));
  p.push(line(200, 192, 200, 286) + M(160, 296) + Q(200, 280, 240, 296));
  p.push(circle(246, 108, 11) + M(250, 98) + C(256, 78, 268, 66, 284, 60));
  // bar counter
  p.push(line(0, 300, 400, 300) + line(0, 310, 400, 310) + line(0, 352, 400, 352));
  for (let x = 20; x < 400; x += 40) p.push(line(x, 310, x, 352) + M(x + 8, 322) + L(x + 20, 331) + L(x + 32, 322));
  // glints
  p.push(M(92, 74) + L(92, 94) + M(82, 84) + L(102, 84) + M(318, 150) + L(318, 166) + M(310, 158) + L(326, 158));
  return p;
}
export function lotusSVG() {
  const p = [];
  const cx = 200, by = 236;
  for (const r of [70, 110, 150, 190]) p.push(M(cx - r, by + 18) + `A${r} ${r * 0.22} 0 0 0 ${cx + r} ${by + 18}` + M(cx - r, by + 18) + `A${r} ${r * 0.22} 0 0 1 ${cx + r} ${by + 18}`);
  // petals: centre, two pairs, outer pair
  const petal = (ang, len, w) => {
    const a = (ang - 90) * Math.PI / 180, ex = cx + Math.cos(a) * len, ey = by + Math.sin(a) * len;
    const nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
    const mx = cx + Math.cos(a) * len * 0.55, my = by + Math.sin(a) * len * 0.55;
    return M(cx, by) + Q(mx + nx, my + ny, ex, ey) + Q(mx - nx, my - ny, cx, by) + M(cx + Math.cos(a) * len * 0.2, by + Math.sin(a) * len * 0.2) + L(cx + Math.cos(a) * len * 0.8, by + Math.sin(a) * len * 0.8);
  };
  p.push(petal(0, 150, 34));
  p.push(petal(-28, 140, 30) + petal(28, 140, 30));
  p.push(petal(-58, 122, 28) + petal(58, 122, 28));
  p.push(petal(-84, 96, 24) + petal(84, 96, 24));
  for (let i = 0; i < 15; i++) { const a = Math.PI + (i / 14) * Math.PI; p.push(M(cx + Math.cos(a) * 172, by - 30 + Math.sin(a) * 172) + L(cx + Math.cos(a) * 196, by - 30 + Math.sin(a) * 196)); }
  return p;
}
export function boatSVG() {
  const p = [];
  // hull
  p.push(M(40, 200) + C(80, 236, 320, 236, 360, 200) + L(372, 182) + M(40, 200) + L(26, 178) + M(54, 210) + C(110, 240, 290, 240, 346, 210));
  p.push(M(26, 178) + C(18, 168, 22, 156, 32, 154) + C(40, 154, 42, 164, 36, 170));
  p.push(M(372, 182) + C(386, 170, 386, 154, 376, 150));
  p.push(line(60, 196, 340, 196));
  // canopy pavilion on deck
  p.push(chhatri(200, 196, 58, 58, 52));
  p.push(line(96, 196, 96, 150) + line(304, 196, 304, 150) + M(96, 150) + Q(200, 128, 304, 150));
  // lanterns along the rail
  for (const x of [70, 120, 280, 330]) p.push(line(x, 196, x, 178) + M(x - 5, 178) + L(x + 5, 178) + L(x + 6, 170) + L(x, 164) + L(x - 6, 170) + 'Z');
  // oars and water
  p.push(line(120, 214, 96, 262) + line(280, 214, 304, 262));
  p.push(ripples(10, 390, 248, 5, 10));
  // moon
  p.push(M(338, 34) + C(312, 40, 300, 66, 312, 90) + C(322, 108, 346, 112, 362, 100) + C(340, 98, 324, 80, 328, 60) + C(330, 48, 334, 40, 338, 34) + 'Z');
  return p;
}
export function vignette(parts, vb = '0 0 400 360', label = '') {
  return `<svg viewBox="${vb}" role="img" aria-label="${label}" fill="none" stroke="url(#gold-v)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${parts.map((d) => `<path d="${d}"/>`).join('')}</svg>`;
}

// the crest: a palm rising from a half sunburst
export function crestPaths() {
  let d = M(4, 40) + L(44, 40) + M(10, 40) + `A14 14 0 0 1 38 40`;
  for (let i = 1; i < 6; i++) { const a = Math.PI + (i / 6) * Math.PI; d += M(24 + Math.cos(a) * 17, 40 + Math.sin(a) * 17) + L(24 + Math.cos(a) * 22, 40 + Math.sin(a) * 22); }
  d += M(24, 40) + C(24, 32, 25, 24, 26, 16);
  d += M(26, 16) + Q(16, 10, 9, 18) + M(26, 16) + Q(36, 10, 43, 18) + M(26, 16) + Q(20, 4, 12, 4) + M(26, 16) + Q(32, 4, 40, 4) + M(26, 16) + Q(26, 6, 27, 0);
  return d;
}
