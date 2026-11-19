// Keystone Build · technical drawings generated in code (shared building data for elevation, plan and 3D)
export const BLD = {
  gx: [0, 7.2, 14.4, 21.6, 28.8, 36],             // grid A..F (m)
  gz: [0, 6, 12, 18, 24],                          // grid 1..5 (m)
  lv: [0, 4.5, 8.1, 11.7, 15.3, 18.9, 22.5, 26.1, 29.7],
  parapet: 30.9, coreTop: 33.9,
  core: [14.4, 9, 21.6, 15]                        // x0, z0, x1, z1
};
const GXL = ['A', 'B', 'C', 'D', 'E', 'F'];
const f1 = (v) => (Math.round(v * 10) / 10).toString();

/* ------------------------------------------------------------------ tiny SVG emitter with draw order */
class Sheet {
  constructor() { this.els = []; this.n = 0; }
  // kind: 'p' path drawn by dash, 'g' grid/center line (scale reveal), 't' text, 'h' hatch fill, 'f' solid fill
  add(kind, attrs, inner, order) { this.els.push({ kind, attrs, inner, order: order ?? this.n }); this.n++; }
  path(d, cls, order) { this.add('p', { d, class: cls }, null, order); }
  line(x1, y1, x2, y2, cls, order) { this.path('M' + f1(x1) + ' ' + f1(y1) + 'L' + f1(x2) + ' ' + f1(y2), cls, order); }
  rect(x, y, w, h, cls, order) { this.path('M' + f1(x) + ' ' + f1(y) + 'h' + f1(w) + 'v' + f1(h) + 'h' + f1(-w) + 'Z', cls, order); }
  circle(cx, cy, r, cls, order) { this.path('M' + f1(cx - r) + ' ' + f1(cy) + 'a' + r + ' ' + r + ' 0 1 0 ' + f1(2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + f1(-2 * r) + ' 0', cls, order); }
  grid(x1, y1, x2, y2, cls, order) { this.add('g', { d: 'M' + f1(x1) + ' ' + f1(y1) + 'L' + f1(x2) + ' ' + f1(y2), class: cls }, null, order); }
  text(x, y, s, cls, order, extra = '') { this.add('t', { x: f1(x), y: f1(y), class: cls }, s, order, extra); if (extra) this.els[this.els.length - 1].extra = extra; }
  hatch(d, cls, order) { this.add('h', { d, class: cls }, null, order); }
  render(span, total) {
    const maxO = Math.max(...this.els.map(e => e.order));
    return this.els.map(e => {
      const delay = Math.round(e.order / maxO * span);
      const st = ' style="--d:' + delay + 'ms"';
      const at = Object.entries(e.attrs).map(([k, v]) => k + '="' + v + '"').join(' ');
      if (e.kind === 't') return '<text ' + at + st + (e.extra || '') + '>' + e.inner + '</text>';
      if (e.kind === 'p') return '<path ' + at + ' pathLength="1"' + st + '/>';
      return '<path ' + at + st + '/>';
    }).join('');
  }
}

/* ------------------------------------------------------------------ south elevation, 1:100 */
export function elevationSVG() {
  const K = 20, X0 = 120, GY = 762;
  const X = (m) => X0 + m * K, Y = (m) => GY - m * K;
  const S = new Sheet();
  const { gx, lv } = BLD;
  let o = 0;
  // grid + levels (centre lines)
  gx.forEach((x, i) => { S.grid(X(x), Y(-0.4), X(x), 52, 'cl', o + i); });
  o += 6;
  lv.forEach((l, i) => S.grid(54, Y(l), 914, Y(l), 'cl lvl', o + i));
  S.grid(54, Y(BLD.parapet), 914, Y(BLD.parapet), 'cl lvl', o + 9);
  o += 10;
  // ground + building outline
  S.line(30, GY, 970, GY, 'l1', o++);
  S.path('M' + X(0) + ' ' + GY + 'V' + Y(BLD.parapet) + 'H' + X(36) + 'V' + GY, 'l1', o++);
  S.rect(X(14.4), Y(BLD.coreTop), 7.2 * K, (BLD.coreTop - BLD.parapet) * K, 'l1', o++);
  // slab bands
  for (let i = 1; i < lv.length; i++) { S.line(X(0), Y(lv[i]) - 3, X(36), Y(lv[i]) - 3, 'l2', o); S.line(X(0), Y(lv[i]) + 3, X(36), Y(lv[i]) + 3, 'l2', o); o++; }
  // pilasters at grid lines
  gx.forEach((x, i) => {
    if (i === 0 || i === gx.length - 1) return;
    S.line(X(x) - 6, Y(lv[1]) + 3, X(x) - 6, Y(BLD.parapet), 'l2', o); S.line(X(x) + 6, Y(lv[1]) + 3, X(x) + 6, Y(BLD.parapet), 'l2', o);
  });
  o++;
  // curtain wall: 4 panels per bay, transom at sill height
  for (let f = 1; f < lv.length - 1; f++) {
    const yb = Y(lv[f]) - 3, yt = Y(lv[f + 1]) + 3;
    for (let b = 0; b < 5; b++) {
      const xa = X(gx[b]) + (b === 0 ? 4 : 6), xb = X(gx[b + 1]) - (b === 4 ? 4 : 6), w = (xb - xa) / 4;
      for (let k = 1; k < 4; k++) S.line(xa + k * w, yb, xa + k * w, yt, 'l3', o + f * 0.6 + b * 0.1);
      S.line(xa, yb - 20, xb, yb - 20, 'l3', o + f * 0.6 + b * 0.1);
    }
  }
  o += 6;
  // ground floor: double height lobby glazing, entrance doors, canopy, signage
  for (let b = 0; b < 5; b++) {
    const xa = X(gx[b]) + 6, xb = X(gx[b + 1]) - 6, w = (xb - xa) / 3;
    for (let k = 1; k < 3; k++) S.line(xa + k * w, GY, xa + k * w, Y(lv[1]) + 3, 'l3', o);
    S.line(xa, Y(3.2), xb, Y(3.2), 'l3', o);
  }
  S.rect(X(15.4), Y(2.6), 5.2 * K, 2.6 * K, 'l2', o + 1);
  S.line(X(18), Y(2.6), X(18), GY, 'l3', o + 1);
  S.rect(X(13.6), Y(3.75), 8.8 * K, 0.35 * K, 'l1', o + 2);
  o += 3;
  // parapet coping, roof core louvres
  S.line(X(0) - 4, Y(BLD.parapet), X(36) + 4, Y(BLD.parapet), 'l1', o);
  for (let k = 1; k < 8; k++) S.line(X(15.0), Y(BLD.parapet) - k * 7, X(21.0), Y(BLD.parapet) - k * 7, 'l3', o + 0.5);
  S.rect(X(16.4), Y(BLD.coreTop) + 10, 3.2 * K, 1.6 * K, 'l3', o + 1);
  o += 2;
  // scale: trees, person, car
  const tree = (cx, r) => { S.line(cx, GY, cx, GY - 3.2 * K, 'l3', o); S.circle(cx, GY - 3.2 * K - r, r, 'l3', o); S.circle(cx - r * 0.35, GY - 3.2 * K - r * 1.1, r * 0.45, 'l3', o + 0.3); };
  tree(70, 34); tree(X(38.2), 38);
  S.path('M' + X(9.6) + ' ' + GY + 'l6 -34 l6 34 M' + (X(9.6) + 6) + ' ' + (GY - 34) + 'v-18 m-9 8 h18 M' + (X(9.6) + 6) + ' ' + (GY - 60) + 'm-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0', 'l3 yel', o);
  S.path('M' + X(24.2) + ' ' + (GY - 6) + 'h86 q4 -2 2 -16 l-14 -4 l-12 -14 h-38 l-16 14 h-12 q-6 2 -6 14 Z M' + (X(24.2) + 18) + ' ' + GY + 'a8 8 0 1 0 16 0 M' + (X(24.2) + 62) + ' ' + GY + 'a8 8 0 1 0 16 0', 'l3', o);
  o += 1;
  // hatching: earth, core, parapet, slab bands, pilasters
  S.hatch('M30 ' + GY + 'H970V' + (GY + 22) + 'H30Z', 'hatch h-earth', o);
  S.hatch('M' + X(14.4) + ' ' + Y(BLD.coreTop) + 'h' + (7.2 * K) + 'v' + ((BLD.coreTop - BLD.parapet) * K) + 'h' + (-7.2 * K) + 'Z', 'hatch h-45', o);
  S.hatch('M' + X(0) + ' ' + Y(BLD.parapet) + 'H' + X(36) + 'V' + (Y(lv[8]) - 3) + 'H' + X(0) + 'Z', 'hatch h-45', o);
  for (let i = 1; i < lv.length; i++) S.hatch('M' + X(0) + ' ' + (Y(lv[i]) - 3) + 'H' + X(36) + 'V' + (Y(lv[i]) + 3) + 'H' + X(0) + 'Z', 'hatch h-solid', o);
  gx.forEach((x, i) => { if (i > 0 && i < gx.length - 1) S.hatch('M' + (X(x) - 6) + ' ' + (Y(lv[1]) + 3) + 'H' + (X(x) + 6) + 'V' + Y(BLD.parapet) + 'H' + (X(x) - 6) + 'Z', 'hatch h-dots', o); });
  o += 1;
  // dimensions: vertical string (left) and horizontal string (bottom)
  const dx1 = 84, dx2 = 40;
  S.line(dx1, GY, dx1, Y(BLD.parapet), 'dim', o);
  lv.concat([BLD.parapet]).forEach((l) => S.line(dx1 - 6, Y(l) + 6, dx1 + 6, Y(l) - 6, 'dim tk', o));
  for (let i = 0; i < lv.length - 1; i++) S.text(dx1 - 9, (Y(lv[i]) + Y(lv[i + 1])) / 2, Math.round((lv[i + 1] - lv[i]) * 1000).toString(), 'tx dimt', o + 1, ' transform="rotate(-90 ' + (dx1 - 9) + ' ' + f1((Y(lv[i]) + Y(lv[i + 1])) / 2) + ')" text-anchor="middle"');
  S.line(dx2, GY, dx2, Y(BLD.parapet), 'dim', o);
  S.line(dx2 - 6, GY + 6, dx2 + 6, GY - 6, 'dim tk', o); S.line(dx2 - 6, Y(BLD.parapet) + 6, dx2 + 6, Y(BLD.parapet) - 6, 'dim tk', o);
  S.text(dx2 - 9, (GY + Y(BLD.parapet)) / 2, '30 900', 'tx dimt', o + 1, ' transform="rotate(-90 ' + (dx2 - 9) + ' ' + f1((GY + Y(BLD.parapet)) / 2) + ')" text-anchor="middle"');
  const dy1 = GY + 44, dy2 = GY + 82;
  S.line(X(0), dy1, X(36), dy1, 'dim', o);
  gx.forEach((x) => { S.line(X(x) - 6, dy1 + 6, X(x) + 6, dy1 - 6, 'dim tk', o); S.line(X(x), GY + 26, X(x), dy1 + 10, 'dim', o); });
  for (let b = 0; b < 5; b++) S.text((X(gx[b]) + X(gx[b + 1])) / 2, dy1 - 7, '7 200', 'tx dimt', o + 1, ' text-anchor="middle"');
  S.line(X(0), dy2, X(36), dy2, 'dim', o);
  S.line(X(0) - 6, dy2 + 6, X(0) + 6, dy2 - 6, 'dim tk', o); S.line(X(36) - 6, dy2 + 6, X(36) + 6, dy2 - 6, 'dim tk', o);
  S.text((X(0) + X(36)) / 2, dy2 - 7, '36 000', 'tx dimt', o + 1, ' text-anchor="middle"');
  o += 2;
  // grid bubbles + level markers
  gx.forEach((x, i) => { S.circle(X(x), 34, 15, 'l2 bub', o); S.text(X(x), 39.5, GXL[i], 'tx bubt', o + 0.5, ' text-anchor="middle"'); });
  const names = ['GF', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'ROOF'];
  lv.forEach((l, i) => {
    S.path('M' + 868 + ' ' + (Y(l) - 9) + 'l8 9 l8 -9Z', 'l3 lvm', o);
    S.text(888, Y(l) - 3, (l === 0 ? '±0.00' : '+' + l.toFixed(2)) + ' ' + names[i], 'tx lvt', o + 0.5);
  });
  o += 1;
  // section marker A-A at +12.90 (a cut through level 3: the plan that follows)
  const sy = Y(12.9);
  S.path('M' + 40 + ' ' + sy + 'H' + 104 + 'M' + 896 + ' ' + sy + 'H' + 958, 'l2 yel', o);
  S.path('M' + 104 + ' ' + sy + 'H' + 896, 'sec', o);
  for (const cx of [26, 972]) { S.circle(cx, sy, 14, 'l2 yel', o + 0.5); S.line(cx - 14, sy, cx + 14, sy, 'l3 yel', o + 0.5); S.text(cx, sy - 3, 'A', 'tx sect', o + 1, ' text-anchor="middle"'); S.text(cx, sy + 10, '015', 'tx sect2', o + 1, ' text-anchor="middle"'); }
  o += 1;
  // annotations with leaders
  const note = (x1, y1, x2, y2, txt, anchor = 'start') => { S.path('M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + 'h' + (anchor === 'start' ? 14 : -14), 'l3 lead', o); S.circle(x1, y1, 2.6, 'l3 lead dotf', o); S.text(x2 + (anchor === 'start' ? 18 : -18), y2 + 4, txt, 'tx note', o + 0.5, ' text-anchor="' + anchor + '"'); };
  note(X(31.5), Y(17), 1002, Y(19.6), 'UNITISED CURTAIN WALL');
  note(X(28.8), Y(24), 1002, Y(25.6), 'RCC FRAME, M40');
  note(X(19.5), Y(32.6), 1002, Y(33.2), 'LIFT AND STAIR CORE');
  note(X(21.8), Y(3.6), 1002, Y(5.6), 'STEEL CANOPY');
  return '<svg class="dwg dwg-elev" viewBox="0 0 1180 880" role="img" aria-label="South elevation of Riverline Offices, eight storeys on a 7.2 metre structural grid, with dimensions, grid bubbles and a section marker">' + DEFS + S.render(2600) + '</svg>';
}

/* ------------------------------------------------------------------ typical floor plan (level 3) */
export const PLAN = { K: 20, X0: 120, Z0: 192 };
export function planSVG() {
  const { K, X0, Z0 } = PLAN;
  const X = (m) => X0 + m * K, Z = (m) => Z0 + m * K;
  const S = new Sheet();
  const { gx, gz, core } = BLD;
  let o = 0;
  gx.forEach((x, i) => S.grid(X(x), Z(-2.4), X(x), Z(26.4), 'cl', o + i * 0.3));
  gz.forEach((z, i) => S.grid(X(-2.4), Z(z), X(38.4), Z(z), 'cl', o + i * 0.3));
  o += 2;
  // envelope: double line with mullion ticks
  S.rect(X(-0.45), Z(-0.45), 36.9 * K, 24.9 * K, 'l1', o); S.rect(X(-0.2), Z(-0.2), 36.4 * K, 24.4 * K, 'l3', o);
  for (let x = 1.65; x < 36; x += 1.65) { S.line(X(x), Z(-0.45), X(x), Z(-0.2), 'l3', o + 0.5); S.line(X(x), Z(24.2), X(x), Z(24.45), 'l3', o + 0.5); }
  for (let z = 1.65; z < 24; z += 1.65) { S.line(X(-0.45), Z(z), X(-0.2), Z(z), 'l3', o + 0.5); S.line(X(36.2), Z(z), X(36.45), Z(z), 'l3', o + 0.5); }
  o += 1;
  // columns
  gx.forEach(x => gz.forEach(z => { if (x > core[0] - 0.1 && x < core[2] + 0.1 && z > core[1] && z < core[3]) return; S.hatch('M' + (X(x) - 6) + ' ' + (Z(z) - 6) + 'h12v12h-12Z', 'col', o); S.rect(X(x) - 6, Z(z) - 6, 12, 12, 'l2', o); }));
  o += 1;
  // core: walls with hatch, two lifts, stair, shaft
  const [cx0, cz0, cx1, cz1] = core;
  S.hatch('M' + X(cx0) + ' ' + Z(cz0) + 'H' + X(cx1) + 'V' + Z(cz1) + 'H' + X(cx0) + 'Z M' + (X(cx0) + 6) + ' ' + (Z(cz0) + 6) + 'V' + (Z(cz1) - 6) + 'H' + (X(cx1) - 6) + 'V' + (Z(cz0) + 6) + 'Z', 'hatch h-45 core', o);
  S.rect(X(cx0), Z(cz0), (cx1 - cx0) * K, (cz1 - cz0) * K, 'l1', o); S.rect(X(cx0) + 6, Z(cz0) + 6, (cx1 - cx0) * K - 12, (cz1 - cz0) * K - 12, 'l2', o);
  for (let i = 0; i < 2; i++) { const lx = X(cx0) + 10 + i * 46; S.rect(lx, Z(cz0) + 10, 40, 40, 'l3', o + 0.4); S.path('M' + lx + ' ' + (Z(cz0) + 10) + 'l40 40M' + (lx + 40) + ' ' + (Z(cz0) + 10) + 'l-40 40', 'l3', o + 0.4); }
  const sx = X(cx0) + 104, sz = Z(cz0) + 10;
  S.rect(sx, sz, 30, 96, 'l3', o + 0.6);
  for (let k = 1; k < 9; k++) S.line(sx, sz + k * 10.6, sx + 30, sz + k * 10.6, 'l3', o + 0.6);
  S.path('M' + (sx + 15) + ' ' + (sz + 88) + 'V' + (sz + 12) + 'm-5 8l5 -8l5 8', 'l3 yel', o + 0.7);
  S.rect(X(cx0) + 10, Z(cz0) + 62, 86, 44, 'l3', o + 0.6);
  o += 1;
  // partitions: meeting rooms on the east bays, WCs beside the core
  S.path('M' + X(28.8) + ' ' + Z(0.2) + 'V' + Z(12) + 'H' + X(36.2), 'l2', o);
  S.line(X(32.4), Z(0.2), X(32.4), Z(12), 'l2', o);
  S.path('M' + X(28.8) + ' ' + Z(8.2) + 'a24 24 0 0 1 24 24', 'l3 swing', o + 0.3); S.line(X(28.8), Z(8.2), X(28.8) + 24, Z(8.2), 'l3', o + 0.3);
  S.path('M' + X(32.4) + ' ' + Z(8.2) + 'a24 24 0 0 1 24 24', 'l3 swing', o + 0.3);
  S.path('M' + X(cx0) + ' ' + Z(cz1) + 'V' + Z(19.5) + 'H' + X(cx1) + 'V' + Z(cz1), 'l2', o + 0.5);
  S.line(X(18), Z(cz1), X(18), Z(19.5), 'l2', o + 0.5);
  o += 1;
  // furniture: workstation clusters in the open office
  const desks = (x, z) => { for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) S.rect(X(x) + c * 30, Z(z) + r * 26, 28, 22, 'l3 furn', o); };
  desks(1.6, 2); desks(8.8, 2); desks(1.6, 14.6); desks(8.8, 14.6); desks(22.6, 14.6); desks(29.4, 14.6); desks(1.6, 8.4); desks(22.6, 2.6);
  o += 1;
  // labels
  S.text(X(7.2), Z(12.4), 'OPEN OFFICE · 1 412 m²', 'tx room', o, ' text-anchor="middle"');
  S.text(X(30.6), Z(6.4), 'MEETING', 'tx room sm', o, ' text-anchor="middle"');
  S.text(X(34.2), Z(6.4), 'MEETING', 'tx room sm', o, ' text-anchor="middle"');
  S.text(X(16.2), Z(17.6), 'WC', 'tx room sm', o, ' text-anchor="middle"'); S.text(X(19.8), Z(17.6), 'WC', 'tx room sm', o, ' text-anchor="middle"');
  S.text(X(18), Z(8.3), 'LIFT LOBBY', 'tx room sm', o, ' text-anchor="middle"');
  o += 1;
  // dims
  const dz = Z(-3.6);
  S.line(X(0), dz, X(36), dz, 'dim', o);
  gx.forEach(x => S.line(X(x) - 6, dz + 6, X(x) + 6, dz - 6, 'dim tk', o));
  for (let b = 0; b < 5; b++) S.text((X(gx[b]) + X(gx[b + 1])) / 2, dz - 7, '7 200', 'tx dimt', o + 0.5, ' text-anchor="middle"');
  const dx = X(-3.6);
  S.line(dx, Z(0), dx, Z(24), 'dim', o);
  gz.forEach(z => S.line(dx - 6, Z(z) + 6, dx + 6, Z(z) - 6, 'dim tk', o));
  for (let b = 0; b < 4; b++) S.text(dx - 8, (Z(gz[b]) + Z(gz[b + 1])) / 2, '6 000', 'tx dimt', o + 0.5, ' transform="rotate(-90 ' + (dx - 8) + ' ' + f1((Z(gz[b]) + Z(gz[b + 1])) / 2) + ')" text-anchor="middle"');
  // bubbles
  gx.forEach((x, i) => { S.circle(X(x), Z(-5.6), 14, 'l2 bub', o + 1); S.text(X(x), Z(-5.6) + 5, GXL[i], 'tx bubt', o + 1.3, ' text-anchor="middle"'); });
  gz.forEach((z, i) => { S.circle(X(-5.8), Z(z), 14, 'l2 bub', o + 1); S.text(X(-5.8), Z(z) + 5, String(i + 1), 'tx bubt', o + 1.3, ' text-anchor="middle"'); });
  // north point
  const nx = X(39.6), nz = Z(22);
  S.circle(nx, nz, 18, 'l3', o + 1.5); S.path('M' + nx + ' ' + (nz - 26) + 'l-8 30 l8 -6 l8 6Z', 'l2 yel', o + 1.5); S.text(nx, nz - 30, 'N', 'tx bubt', o + 1.6, ' text-anchor="middle"');
  return '<svg class="dwg dwg-plan" viewBox="0 0 1000 880" role="img" aria-label="Typical floor plan of Riverline Offices with structural grid, columns, central core, meeting rooms and open office">' + DEFS + S.render(2000) + '</svg>';
}

const DEFS = '<defs>' +
  '<pattern id="pt-45" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#e6f0ff" stroke-opacity=".55" stroke-width="1"/></pattern>' +
  '<pattern id="pt-earth" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="14" stroke="#e6f0ff" stroke-opacity=".5" stroke-width="1"/><circle cx="7" cy="7" r="1" fill="#e6f0ff" fill-opacity=".5"/></pattern>' +
  '<pattern id="pt-dots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r=".8" fill="#e6f0ff" fill-opacity=".45"/></pattern>' +
  '</defs>';

/* ------------------------------------------------------------------ project cards: blueprint and render from one shape list */
// shape: [type, geometry, renderFill, lineClass]; type: r (x,y,w,h), p (d), c (cx,cy,r)
function card(shapes, extraBp, extraRd, label) {
  const geo = (s) => s[0] === 'r' ? 'M' + s[1][0] + ' ' + s[1][1] + 'h' + s[1][2] + 'v' + s[1][3] + 'h' + -s[1][2] + 'Z' : s[0] === 'c' ? 'M' + (s[1][0] - s[1][2]) + ' ' + s[1][1] + 'a' + s[1][2] + ' ' + s[1][2] + ' 0 1 0 ' + 2 * s[1][2] + ' 0a' + s[1][2] + ' ' + s[1][2] + ' 0 1 0 ' + -2 * s[1][2] + ' 0' : s[1];
  const n = shapes.length;
  let bp = '', rd = '';
  shapes.forEach((s, i) => {
    const d = geo(s);
    if (s[2]) rd += '<path d="' + d + '" fill="' + s[2] + '"' + (s[4] ? ' stroke="' + s[4] + '" stroke-width="1.2"' : '') + '/>';
    if (s[3] !== null) bp += '<path d="' + d + '" class="' + (s[3] || 'b2') + '" pathLength="1" style="--d:' + Math.round(i / n * 1100) + 'ms"/>';
  });
  return '<svg class="pj" viewBox="0 0 600 400" role="img" aria-label="' + label + '"><g class="rd">' + extraRd + rd + '</g><g class="bp">' + bp + extraBp + '</g><path class="scanline" d="M0 0V400"/></svg>';
}
const SKY = '<defs><linearGradient id="sky-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3fb"/><stop offset="1" stop-color="#e7f4ff"/></linearGradient></defs><rect width="600" height="400" fill="url(#sky-g)"/><circle cx="510" cy="74" r="30" fill="#fff2b3"/>';
const GROUND = (y, col = '#cfd6cc') => '<rect y="' + y + '" width="600" height="' + (400 - y) + '" fill="' + col + '"/>';
const treeR = (x, y, r, c = '#5fb37f') => '<rect x="' + (x - 3) + '" y="' + (y - r * 1.2) + '" width="6" height="' + r * 1.2 + '" fill="#8a6a4a"/><circle cx="' + x + '" cy="' + (y - r * 1.4) + '" r="' + r + '" fill="' + c + '"/><circle cx="' + (x - r * 0.4) + '" cy="' + (y - r * 1.6) + '" r="' + r * 0.55 + '" fill="#7cc795"/>';
const treeB = (x, y, r) => '<path class="b3" pathLength="1" d="M' + x + ' ' + y + 'v' + (-r * 1.2) + '"/><path class="b3" pathLength="1" d="M' + (x - r) + ' ' + (y - r * 1.4) + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0"/>';

export function projectSVG(key) {
  const S = [];
  if (key === 'office') {
    const x0 = 160, w = 280, gy = 340, fh = 30;
    S.push(['r', [x0, gy - 8 * fh - 34, w, 8 * fh + 34], '#e8e2d6', 'b1']);
    for (let f = 1; f < 8; f++) for (let b = 0; b < 5; b++) S.push(['r', [x0 + 6 + b * 55.6, gy - 34 - f * fh + 5, 46, fh - 9], f % 2 ? '#7fb3e3' : '#8cbde8', 'b3']);
    S.push(['r', [x0 + 6, gy - 30, w - 12, 30], '#5d93c8', 'b2']);
    S.push(['r', [x0 + 110, gy - 30, 60, 30], '#2f5f93', 'b2']);
    S.push(['r', [x0 + 96, gy - 38, 88, 6], '#ffcc00', 'b1']);
    S.push(['r', [x0 + 104, gy - 8 * fh - 60, 72, 26], '#d9d2c5', 'b1']);
    S.push(['r', [x0 - 6, gy - 8 * fh - 40, w + 12, 8], '#cfc7b8', 'b1']);
    return card(S, treeB(110, gy, 22) + treeB(492, gy, 26) + dimBp(x0, gy + 26, x0 + w, '36 000') + gridBp([x0, x0 + 56, x0 + 112, x0 + 168, x0 + 224, x0 + 280], gy, 50),
      SKY + GROUND(gy) + treeR(110, gy, 22) + treeR(492, gy, 26) + '<rect x="0" y="' + gy + '" width="600" height="6" fill="#b9c2b6"/>', 'Riverline Offices: blueprint elevation and rendered view');
  }
  if (key === 'resi') {
    const gy = 346;
    const tower = (x, w, floors) => {
      S.push(['r', [x, gy - floors * 17 - 14, w, floors * 17 + 14], '#f2ece2', 'b1']);
      for (let f = 0; f < floors; f++) {
        S.push(['r', [x - 6, gy - 14 - f * 17 - 4, w + 12, 4], '#ffffff', 'b2']);
        for (let c = 0; c < 4; c++) S.push(['r', [x + 8 + c * (w - 16) / 4, gy - 14 - f * 17 - 15, (w - 16) / 4 - 8, 10], '#86b9e6', 'b3']);
      }
      S.push(['r', [x + w * 0.3, gy - floors * 17 - 34, w * 0.4, 20], '#e1d8ca', 'b1']);
    };
    tower(140, 120, 14); tower(330, 120, 12);
    S.push(['r', [110, gy - 22, 380, 22], '#d6cdbf', 'b1']);
    S.push(['r', [270, gy - 22, 60, 22], '#5d93c8', 'b2']);
    return card(S, treeB(80, gy, 20) + treeB(520, gy, 24) + dimBp(110, gy + 26, 490, '58 400') + gridBp([140, 260, 330, 450], gy, 30),
      SKY + GROUND(gy, '#c9d6c3') + treeR(80, gy, 20) + treeR(520, gy, 24) + treeR(300, gy + 2, 12, '#6cbf8c'), 'Saanvi Heights: blueprint elevation and rendered view of two residential towers');
  }
  if (key === 'ind') {
    const gy = 330, x0 = 60, w = 480;
    S.push(['r', [x0, gy - 96, w, 96], '#e4e9ef', 'b1']);
    let d = 'M' + x0 + ' ' + (gy - 96);
    for (let i = 0; i < 8; i++) { const xa = x0 + i * 60; d += 'L' + (xa + 46) + ' ' + (gy - 128) + 'L' + (xa + 46) + ' ' + (gy - 96) + 'L' + (xa + 60) + ' ' + (gy - 96); }
    S.push(['p', d + 'Z', '#cfd6df', 'b1']);
    for (let i = 0; i < 8; i++) S.push(['p', 'M' + (x0 + i * 60 + 46) + ' ' + (gy - 128) + 'v32', '#9cc6ea', 'b3', '#9cc6ea']);
    for (let i = 0; i < 6; i++) S.push(['r', [x0 + 30 + i * 76, gy - 62, 48, 62], '#b9c4d2', 'b2']);
    for (let i = 0; i < 6; i++) S.push(['p', 'M' + (x0 + 30 + i * 76) + ' ' + (gy - 50) + 'h48M' + (x0 + 30 + i * 76) + ' ' + (gy - 38) + 'h48M' + (x0 + 30 + i * 76) + ' ' + (gy - 26) + 'h48M' + (x0 + 30 + i * 76) + ' ' + (gy - 14) + 'h48', null, 'b3']);
    S.push(['r', [x0, gy - 100, w, 4], '#ffcc00', 'b2']);
    S.push(['r', [x0 + 40, gy + 12, 96, 30], '#ffffff', 'b2']); S.push(['r', [x0 + 136, gy + 18, 26, 24], '#2f5f93', 'b2']);
    S.push(['r', [x0 + 270, gy + 12, 96, 30], '#ffcc00', 'b2']); S.push(['r', [x0 + 366, gy + 18, 26, 24], '#2f5f93', 'b2']);
    return card(S, dimBp(x0, gy + 60, x0 + w, '186 000'),
      SKY + GROUND(gy, '#d2d6d2') + '<rect y="' + (gy + 6) + '" width="600" height="44" fill="#9aa3a8"/><path d="M0 ' + (gy + 28) + 'H600" stroke="#fff" stroke-width="2" stroke-dasharray="16 14"/>', 'Chakan Logistics Park: blueprint elevation and rendered view of a sawtooth roof warehouse');
  }
  // bridge
  const dy = 196;
  S.push(['p', 'M20 ' + dy + 'H580V' + (dy + 18) + 'H20Z', '#d8d2c6', 'b1']);
  S.push(['p', 'M20 ' + (dy + 18) + 'H580', null, 'b2']);
  for (const px of [210, 390]) S.push(['p', 'M' + (px - 14) + ' ' + (dy + 18) + 'L' + (px - 20) + ' 330H' + (px + 20) + 'L' + (px + 14) + ' ' + (dy + 18) + 'Z', '#cfc8ba', 'b1']);
  for (let x = 30; x < 580; x += 22) S.push(['p', 'M' + x + ' ' + dy + 'v-14', null, 'b3']);
  S.push(['p', 'M20 ' + (dy - 14) + 'H580', null, 'b2']);
  for (const lx of [110, 300, 490]) S.push(['p', 'M' + lx + ' ' + (dy - 14) + 'v-46h12', '#7a8794', 'b3', '#7a8794']);
  S.push(['p', 'M0 ' + (dy + 30) + 'L20 ' + (dy + 30) + 'L20 ' + dy + 'H0Z', '#bfb6a6', 'b2']);
  S.push(['p', 'M580 ' + (dy + 30) + 'L600 ' + (dy + 30) + 'V' + dy + 'H580Z', '#bfb6a6', 'b2']);
  return card(S, '<path class="b3" pathLength="1" d="M0 300 Q 150 292 300 300 T 600 300"/><path class="b3" pathLength="1" d="M40 318 Q 190 310 340 318 T 600 316"/>' + dimBp(20, 360, 580, '180 000'),
    SKY + '<path d="M0 230 Q120 214 210 236 L240 400 H0Z" fill="#c4cfb9"/><path d="M600 228 Q480 212 390 236 L360 400 H600Z" fill="#c4cfb9"/><rect y="290" width="600" height="110" fill="#6fb3e0"/><path d="M0 300 Q 150 292 300 300 T 600 300" stroke="#bfe3fa" stroke-width="3" fill="none"/><path d="M40 318 Q 190 310 340 318 T 600 316" stroke="#bfe3fa" stroke-width="2" fill="none"/><rect y="372" width="600" height="28" fill="#5aa2d2"/>',
    'Indrayani River Bridge: blueprint elevation and rendered view of a three span bridge');
}
function dimBp(x1, y, x2, label) {
  return '<path class="b3 dm" pathLength="1" d="M' + x1 + ' ' + y + 'H' + x2 + 'M' + (x1 - 5) + ' ' + (y + 5) + 'l10 -10M' + (x2 - 5) + ' ' + (y + 5) + 'l10 -10"/><text class="pjt" x="' + (x1 + x2) / 2 + '" y="' + (y - 6) + '" text-anchor="middle">' + label + '</text>';
}
function gridBp(xs, gy, top) {
  return xs.map((x, i) => '<path class="b3 gl" pathLength="1" d="M' + x + ' ' + (gy + 8) + 'V' + (top + 16) + '"/><circle class="gb" cx="' + x + '" cy="' + top + '" r="10"/><text class="pjt" x="' + x + '" y="' + (top + 4) + '" text-anchor="middle">' + 'ABCDEF'[i] + '</text>').join('');
}
