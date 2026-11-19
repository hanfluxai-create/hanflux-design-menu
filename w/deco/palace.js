// Gold line palace on Lake Pichola. Pure geometry (no DOM): returns path data for the LEFT half
// (x from -W to 0, waterline at y = 0, up is negative). The right half is a mirror.
const f = (n) => Math.round(n * 10) / 10;
const M = (x, y) => `M${f(x)} ${f(y)}`;
const L = (x, y) => `L${f(x)} ${f(y)}`;
const C = (a, b, c, d, e, g) => `C${f(a)} ${f(b)} ${f(c)} ${f(d)} ${f(e)} ${f(g)}`;

// Cusped (multifoil) arch opening: base at yb, straight jambs of height h, pointed top made of small lobes.
export function cusped(cx, yb, w, h, lobes = 5, half = false) {
  const r = w / 2, ys = yb - h, apex = ys - r * 1.05;
  // control points of a slightly pointed arch: from left spring to apex
  const pts = [];
  const N = lobes * 2;
  for (let i = 0; i <= N; i++) {
    const t = i / N; // 0 at left spring, 1 at right spring
    const a = Math.PI * (1 - t);
    let x = cx + Math.cos(a) * r, y = ys - Math.sin(a) * r * 1.05;
    // sharpen toward the apex
    const k = 1 - Math.abs(t - 0.5) * 2;
    y -= k * k * r * 0.18;
    pts.push([x, y]);
  }
  let d = M(cx - r, yb) + L(cx - r, ys);
  const end = half ? N / 2 : N;
  for (let i = 0; i < end; i += 1) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    // lobe bulges inward (toward the arch centre)
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const vx = cx - mx, vy = (ys + r * 0.2) - my, vl = Math.hypot(vx, vy) || 1;
    const b = Math.hypot(x1 - x0, y1 - y0) * 0.42;
    d += `Q${f(mx + vx / vl * b)} ${f(my + vy / vl * b)} ${f(x1)} ${f(y1)}`;
  }
  if (!half) d += L(cx + r, yb);
  return d;
}

// Onion dome sitting on (cx, yb) with half-width w and height h; left half only when half=true.
export function dome(cx, yb, w, h, half = false) {
  let d = M(cx - w, yb) + C(cx - w * 1.18, yb - h * 0.38, cx - w * 0.62, yb - h * 0.7, cx - w * 0.08, yb - h * 0.95) + L(cx, yb - h);
  if (!half) d += L(cx + w * 0.08, yb - h * 0.95) + C(cx + w * 0.62, yb - h * 0.7, cx + w * 1.18, yb - h * 0.38, cx + w, yb);
  return d;
}

// A chhatri (domed pavilion on pillars) centred on cx, standing on yb.
export function chhatri(cx, yb, w, ph, dh) {
  const parts = [];
  parts.push(M(cx - w - 4, yb) + L(cx + w + 4, yb)); // plinth
  parts.push(M(cx - w, yb) + L(cx - w, yb - ph) + M(cx + w, yb) + L(cx + w, yb - ph) + M(cx - w * 0.33, yb) + L(cx - w * 0.33, yb - ph) + M(cx + w * 0.33, yb) + L(cx + w * 0.33, yb - ph));
  parts.push(M(cx - w - 6, yb - ph) + L(cx + w + 6, yb - ph) + M(cx - w - 3, yb - ph - 4) + L(cx + w + 3, yb - ph - 4)); // chhajja
  parts.push(dome(cx, yb - ph - 4, w * 0.92, dh));
  parts.push(M(cx, yb - ph - 4 - dh) + L(cx, yb - ph - 4 - dh - dh * 0.32));
  parts.push(circle(cx, yb - ph - 4 - dh - dh * 0.12, Math.max(1.6, w * 0.12)));
  return parts.join(' ');
}

export function circle(cx, cy, r) {
  const k = 0.5523 * r;
  return M(cx, cy - r) + C(cx + k, cy - r, cx + r, cy - k, cx + r, cy) + C(cx + r, cy + k, cx + k, cy + r, cx, cy + r) + C(cx - k, cy + r, cx - r, cy + k, cx - r, cy) + C(cx - r, cy - k, cx - k, cy - r, cx, cy - r) + 'Z';
}

// Jharokha: projecting balcony with three cusped openings and a curved bangaldar roof.
export function jharokha(cx, yb, w, h) {
  const p = [];
  p.push(M(cx - w / 2 - 6, yb) + L(cx + w / 2 + 6, yb) + M(cx - w / 2 - 4, yb + 4) + L(cx + w / 2 + 4, yb + 4));
  // brackets
  for (const s of [-1, 1]) p.push(M(cx + s * (w / 2 + 2), yb + 4) + C(cx + s * (w / 2 + 2), yb + 12, cx + s * (w / 2 - 6), yb + 16, cx + s * (w / 2 - 10), yb + 16));
  p.push(M(cx - 4, yb + 4) + L(cx - 4, yb + 12) + L(cx + 4, yb + 12) + L(cx + 4, yb + 4));
  // openings
  const ow = (w - 8) / 3;
  for (let i = 0; i < 3; i++) p.push(cusped(cx - w / 2 + 4 + ow / 2 + i * ow, yb - 2, ow - 3, h * 0.42, 3));
  p.push(M(cx - w / 2, yb) + L(cx - w / 2, yb - h) + M(cx + w / 2, yb) + L(cx + w / 2, yb - h));
  // bangaldar roof
  p.push(M(cx - w / 2 - 7, yb - h) + C(cx - w / 4, yb - h - 15, cx + w / 4, yb - h - 15, cx + w / 2 + 7, yb - h));
  p.push(M(cx - w / 2 - 4, yb - h - 4) + C(cx - w / 4, yb - h - 19, cx + w / 4, yb - h - 19, cx + w / 2 + 4, yb - h - 4));
  p.push(M(cx, yb - h - 15) + L(cx, yb - h - 24) + circle(cx, yb - h - 26, 2));
  return p.join(' ');
}

// The palace, grouped for staged drawing. Units: half-width 280, height to finial ~440.
export function palace() {
  const g = { water: [], plinth: [], ground: [], first: [], roof: [], centre: [], domes: [], detail: [] };
  // ghats down to the water at the centre
  for (let i = 1; i <= 4; i++) g.plinth.push(M(-70 + i * 6, -i * 5) + L(0, -i * 5));
  g.plinth.push(M(-292, 0) + L(0, 0));
  g.plinth.push(M(-288, 0) + L(-288, -22) + L(-46, -22) + M(-288, -22) + L(-288, -26) + L(0, -26));
  // ground floor arcade
  g.ground.push(M(-276, -26) + L(-276, -112));
  [-250, -204, -158, -112].forEach((x) => g.ground.push(cusped(x, -30, 32, 46, 5)));
  g.ground.push(cusped(-64, -30, 26, 40, 3));
  g.ground.push(cusped(0, -26, 56, 58, 7, true));
  // cornice with dentils
  g.first.push(M(-292, -112) + L(0, -112) + M(-296, -118) + L(0, -118));
  let dent = '';
  for (let x = -288; x < -4; x += 9) dent += M(x, -112) + L(x, -107);
  g.detail.push(dent);
  // first floor
  g.first.push(M(-272, -118) + L(-272, -198));
  g.first.push(jharokha(-226, -132, 44, 46));
  g.first.push(jharokha(-138, -132, 44, 46));
  [-182, -94].forEach((x) => g.first.push(cusped(x, -134, 18, 30, 3)));
  g.first.push(jharokha(0, -138, 64, 52));
  // wing parapet with kangura merlons
  g.roof.push(M(-282, -198) + L(-112, -198) + M(-282, -203) + L(-112, -203));
  let mer = '';
  for (let x = -280; x < -116; x += 10) mer += M(x, -203) + L(x, -208) + L(x + 4, -213) + L(x + 8, -208) + L(x + 8, -203);
  g.detail.push(mer);
  // corner tower and chhatris on the wing
  g.roof.push(M(-284, -112) + L(-284, -246) + M(-258, -203) + L(-258, -246) + M(-290, -246) + L(-252, -246));
  g.domes.push(chhatri(-271, -246, 14, 30, 34));
  g.domes.push(chhatri(-176, -203, 17, 30, 36));
  // central block
  g.centre.push(M(-112, -118) + L(-112, -270));
  [-84, -40].forEach((x) => g.centre.push(cusped(x, -210, 22, 36, 5)));
  g.centre.push(cusped(0, -212, 30, 44, 5, true));
  g.centre.push(M(-120, -270) + L(0, -270) + M(-124, -276) + L(0, -276));
  let mer2 = '';
  for (let x = -120; x < -4; x += 10) mer2 += M(x, -276) + L(x, -281) + L(x + 4, -286) + L(x + 8, -281) + L(x + 8, -276);
  g.detail.push(mer2);
  // corner chhatris on the centre block
  g.domes.push(chhatri(-100, -276, 11, 26, 28));
  // drum and great dome
  g.centre.push(M(-66, -276) + L(-66, -300) + M(-72, -300) + L(0, -300) + M(-70, -305) + L(0, -305));
  let ribs = '';
  for (let x = -58; x < 0; x += 12) ribs += cusped(x, -280, 8, 12, 3);
  g.detail.push(ribs);
  g.domes.push(dome(0, -305, 66, 104, true));
  g.domes.push(M(0, -409) + L(0, -446));
  g.domes.push(circle(0, -420, 4.5) + ' ' + circle(0, -432, 3.2));
  // lotus petals at the dome base
  let pet = '';
  for (let x = -60; x < 0; x += 15) pet += M(x, -305) + C(x + 2, -315, x + 9, -318, x + 12, -312);
  g.detail.push(pet);
  // water: long calm ripple strokes, staggered
  let rip = '';
  for (let i = 0; i < 9; i++) {
    const y = 14 + i * 13;
    const off = (i % 3) * 26;
    rip += M(-310 + off, y) + L(-210 + off, y) + M(-176 + off, y) + L(-96 + off, y) + M(-62 + off, y) + L(-12 + off * 0.3, y);
  }
  g.water.push(rip);
  return g;
}
