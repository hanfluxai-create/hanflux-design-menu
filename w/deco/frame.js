// The hero's art deco frame, generated for the exact viewport. Produces the LEFT half (0..W/2);
// the right door shows the same art mirrored. Pure string output, no DOM.
import { palace, circle } from './palace.js';

const f = (n) => Math.round(n * 10) / 10;
const M = (x, y) => `M${f(x)} ${f(y)}`;
const L = (x, y) => `L${f(x)} ${f(y)}`;
const C = (a, b, c, d, e, g) => `C${f(a)} ${f(b)} ${f(c)} ${f(d)} ${f(e)} ${f(g)}`;
const A = (r, x, y, sweep = 1) => `A${f(r)} ${f(r)} 0 0 ${sweep} ${f(x)} ${f(y)}`;

function steppedBorder(cx, H, m, s, gap = 0) {
  return M(cx - gap, m) + L(m + s * 3, m) + L(m + s * 3, m + s) + L(m + s * 2, m + s) + L(m + s * 2, m + s * 2) + L(m + s, m + s * 2) + L(m + s, m + s * 3) + L(m, m + s * 3) +
    L(m, H - m - s * 3) + L(m + s, H - m - s * 3) + L(m + s, H - m - s * 2) + L(m + s * 2, H - m - s * 2) + L(m + s * 2, H - m - s) + L(m + s * 3, H - m - s) + L(m + s * 3, H - m) + L(cx, H - m);
}

// quarter fan anchored at a corner (x0, y0), opening toward (dx, dy) = (1, 1) or (1, -1)
function fan(x0, y0, R, dy = 1) {
  let d = '';
  for (const r of [R * 0.36, R * 0.62, R * 0.86, R]) d += M(x0 + r, y0) + `A${f(r)} ${f(r)} 0 0 ${dy > 0 ? 1 : 0} ${f(x0)} ${f(y0 + r * dy)}`;
  for (let i = 1; i < 6; i++) {
    const a = (i / 6) * Math.PI / 2;
    d += M(x0 + Math.cos(a) * R * 0.36, y0 + Math.sin(a) * R * 0.36 * dy) + L(x0 + Math.cos(a) * R * 0.86, y0 + Math.sin(a) * R * 0.86 * dy);
  }
  return d;
}

// stylised deco palm: trunk with ring marks and seven arching fronds
export function palm(x, yb, h, lean = 1) {
  const p = { trunk: '', fronds: '' };
  const topX = x + lean * h * 0.12, topY = yb - h * 0.72;
  const w0 = h * 0.035, w1 = h * 0.022;
  p.trunk += M(x - w0, yb) + C(x - w0 + lean * h * 0.02, yb - h * 0.3, topX - w1 - lean * h * 0.02, topY + h * 0.2, topX - w1, topY);
  p.trunk += M(x + w0, yb) + C(x + w0 + lean * h * 0.02, yb - h * 0.3, topX + w1 - lean * h * 0.02, topY + h * 0.2, topX + w1, topY);
  for (let i = 1; i < 11; i++) {
    const t = i / 11, cxp = x + (topX - x) * (t * t * 0.7 + t * 0.3), cyp = yb + (topY - yb) * t, w = w0 + (w1 - w0) * t;
    p.trunk += M(cxp - w, cyp + w * 0.5) + L(cxp, cyp - w * 0.2) + L(cxp + w, cyp + w * 0.5);
  }
  const fr = [[-168, 0.62], [-142, 0.7], [-112, 0.58], [-72, 0.58], [-40, 0.7], [-14, 0.62], [-90, 0.42]];
  for (const [deg, len] of fr) {
    const a = (deg * Math.PI) / 180, L1 = h * len * 0.62;
    const ex = topX + Math.cos(a) * L1, ey = topY + Math.sin(a) * L1 + L1 * 0.55 * Math.abs(Math.cos(a));
    const mx = topX + Math.cos(a) * L1 * 0.5, my = topY + Math.sin(a) * L1 * 0.5 - L1 * 0.18;
    // leaf outline (two curves) + spine
    const nx = -Math.sin(a), ny = Math.cos(a), wd = L1 * 0.13;
    p.fronds += M(topX, topY) + `Q${f(mx + nx * wd)} ${f(my + ny * wd)} ${f(ex)} ${f(ey)}` + `Q${f(mx - nx * wd)} ${f(my - ny * wd)} ${f(topX)} ${f(topY)}`;
    p.fronds += M(topX, topY) + `Q${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}`;
  }
  return p;
}

function sparkle(x, y, r) {
  const k = r * 0.2;
  return M(x, y - r) + `Q${f(x + k)} ${f(y - k)} ${f(x + r)} ${f(y)}` + `Q${f(x + k)} ${f(y + k)} ${f(x)} ${f(y + r)}` + `Q${f(x - k)} ${f(y + k)} ${f(x - r)} ${f(y)}` + `Q${f(x - k)} ${f(y - k)} ${f(x)} ${f(y - r)}Z`;
}

export function heroLayout(W, H) {
  const mobile = W < 700;
  const cx = W / 2;
  const m1 = mobile ? 10 : 22, m2 = mobile ? 17 : 32, s = mobile ? 6 : 9;
  let a, top, bottom;
  if (mobile) {
    a = Math.min(W * 0.36, 168);
    top = 118;
    bottom = top + a * 2.3;
  } else {
    a = Math.min(W * 0.19, H * 0.33, 330);
    top = Math.max(166, H * 0.185);
    bottom = H - 70;
  }
  const spring = top + a;
  const sc = (a * 0.9) / 292; // palace scale
  const water = bottom - (mobile ? a * 0.36 : Math.min(a * 0.42, (bottom - top) * 0.2));
  return { W, H, cx, m1, m2, s, a, top, bottom, spring, sc, water, mobile, domeY: water - 330 * sc };
}

export function heroArt(W, H) {
  const Lr = heroLayout(W, H);
  const { cx, m1, m2, s, a, top, bottom, spring, sc, water, mobile, domeY } = Lr;
  const G = {};
  const add = (k, d) => { G[k] = (G[k] || '') + d; };
  // frame
  const gap = mobile ? 112 : 168;
  add('frame', steppedBorder(cx, H, m1, s, gap));
  add('frame2', steppedBorder(cx, H, m2, s, gap));
  if (gap) {
    // small diamond terminals where the top border breaks for the crest
    for (const y of [(m1 + m2) / 2]) add('frame', M(cx - gap + 2, y) + L(cx - gap + 9, y - 6) + L(cx - gap + 16, y) + L(cx - gap + 9, y + 6) + 'Z');
  }
  const fanR = mobile ? 44 : 78;
  add('fans', mobile ? fan(m2 + s * 3 + 6, H - m2 - s * 3 - 6, fanR, -1) : fan(m2 + s * 3 + 6, m2 + s * 3 + 6, fanR, 1));
  // centre diamonds on the side border
  const my = H / 2;
  add('frame2', M(m2, my - 26) + L(m2 + 9, my) + L(m2, my + 26) + M(m2 + 16, my - 14) + L(m2 + 21, my) + L(m2 + 16, my + 14));
  // arch: three concentric lines
  for (const o of [0, 9, 18]) add(o ? 'arch2' : 'arch', M(cx - a - o, bottom) + L(cx - a - o, spring) + A(a + o, cx, top - o));
  // ziggurat crown enclosing the arch
  const R = a + 30, x0 = cx - a - 36;
  let z = M(x0, bottom) + L(x0, spring - a * 0.1);
  const steps = 4;
  let px = x0, py = spring - a * 0.1;
  for (let i = 1; i <= steps; i++) {
    const nx = x0 + (i / (steps + 0.6)) * (a + 36) * 0.92;
    const ny = Math.min(py, spring - Math.sqrt(Math.max(0, R * R - (cx - nx) * (cx - nx))) - 14);
    z += L(px, ny) + L(nx, ny);
    px = nx; py = ny;
  }
  const crownY = top - (mobile ? 30 : 44);
  z += L(px, crownY) + L(cx, crownY);
  add('crown', z);
  // a second, inner stepped line for weight
  {
    let z2 = M(x0 + 8, bottom) + L(x0 + 8, spring - a * 0.1 + 8);
    let qx = x0 + 8, qy = spring - a * 0.1 + 8;
    for (let i = 1; i <= steps; i++) {
      const nx = x0 + (i / (steps + 0.6)) * (a + 36) * 0.92 + 8;
      const ny = Math.min(qy, spring - Math.sqrt(Math.max(0, R * R - (cx - nx + 8) * (cx - nx + 8))) - 6);
      z2 += L(qx, ny) + L(nx, ny);
      qx = nx; qy = ny;
    }
    z2 += L(qx, crownY + 8) + L(cx, crownY + 8);
    add('crown2', z2);
  }
  if (mobile) {
    const r0 = 20;
    add('crown', M(cx - r0, crownY) + A(r0, cx, crownY - r0) + M(cx - r0 * 0.6, crownY) + A(r0 * 0.6, cx, crownY - r0 * 0.6));
    for (let i = 1; i < 4; i++) { const an = Math.PI + (i / 4) * Math.PI / 2; add('crown', M(cx + Math.cos(an) * r0 * 0.6, crownY + Math.sin(an) * r0 * 0.6) + L(cx + Math.cos(an) * r0, crownY + Math.sin(an) * r0)); }
  } else {
    // small stepped plinth on the axis that the logo crest sits on
    add('crown', M(cx - 46, crownY) + L(cx - 46, crownY - 8) + L(cx - 24, crownY - 8) + L(cx - 24, crownY - 14) + L(cx, crownY - 14));
  }
  // plinth under the arch
  add('base', M(m2 + s * 3, bottom) + L(cx, bottom) + M(x0 - 14, bottom + 7) + L(cx, bottom + 7));
  // sunburst rays from the dome, and halo rings
  const rays = [], rings = [];
  const N = mobile ? 15 : 21;
  for (let i = 1; i <= N; i++) {
    const an = Math.PI + (i / N) * (Math.PI / 2);
    const r1 = a * (i % 2 ? 1.8 : 2.1);
    rays.push(M(cx, domeY) + L(cx + Math.cos(an) * r1, domeY + Math.sin(an) * r1));
  }
  for (const rr of [a * 0.42, a * 0.5, a * 0.72]) rings.push(M(cx - rr, domeY) + A(rr, cx, domeY - rr));
  add('rays', rays.join(''));
  add('rings', rings.join(''));
  // stars
  const st = mobile ? [[0.55, 0.2, 5], [0.78, 0.36, 3.5]] : [[0.5, 0.18, 7], [0.76, 0.3, 4.5], [0.3, 0.42, 4], [0.86, 0.5, 3]];
  st.forEach(([u, v, r]) => add('stars', sparkle(cx - a * u, top + (spring - top) * 0 + (water - top) * v, r)));
  // palace, reflection and water (left half, transformed into place)
  const P = palace();
  // palms flanking the arch
  const ph = mobile ? Math.min(a * 1.15, 190) : Math.min(H * 0.42, 380);
  if (!mobile) {
    const bx = Math.max(m2 + 120, x0 - 190);
    const pl = palm(bx, bottom, ph, 1);
    const pl2 = palm(bx - ph * 0.3, bottom, ph * 0.68, 0.55);
    add('palms', pl.trunk + pl.fronds + pl2.trunk + pl2.fronds);
  } else add('palms', '');
  return { Lr, G, P };
}

// Assemble the half-door SVG markup. stroke: colour or gradient url.
export function heroSVG(W, H, { stroke, mask = false, uid = 'h' } = {}) {
  stroke = stroke || `url(#${uid}-gold)`;
  const { Lr, G, P } = heroArt(W, H);
  const { cx, a, top, bottom, spring, sc, water, mobile, domeY } = Lr;
  const hw = cx;
  const g = (cls, d, extra = '') => `<path class="${cls}" d="${d}"${extra}/>`;
  const archClip = `M${f(cx - a)} ${f(bottom)}L${f(cx - a)} ${f(spring)}A${f(a)} ${f(a)} 0 0 1 ${f(cx)} ${f(top)}L${f(cx)} ${f(bottom)}Z`;
  // silhouette mask hides rays/rings behind the palace
  const sil = [
    [-112, -276, 112, 276], [-282, -205, 282, 205], [-292, -26, 292, 26],
  ].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('') +
    `<ellipse cx="0" cy="-350" rx="76" ry="70"/><rect x="-72" y="-306" width="72" height="40"/><rect x="-288" y="-300" width="34" height="100"/><ellipse cx="-271" cy="-300" rx="20" ry="34"/><ellipse cx="-176" cy="-250" rx="24" ry="48"/><ellipse cx="-100" cy="-316" rx="16" ry="40"/><rect x="-6" y="-450" width="12" height="60"/>`;
  const sw = mobile ? 1 : 1.25;
  const parts = Object.entries(P).filter(([k]) => k !== 'water').map(([k, arr]) => arr.map((d) => `<path class="p-${k}" d="${d}"/>`).join('')).join('');
  const water2 = P.water.join('');
  const defs = `<defs>
    <linearGradient id="${uid}-gold" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${f(hw)}" y2="${f(H)}">
      <stop offset="0" stop-color="#a8822a"/><stop offset=".28" stop-color="#e7c867"/><stop offset=".5" stop-color="#d4af37"/><stop offset=".74" stop-color="#f3dd93"/><stop offset="1" stop-color="#9c7726"/>
    </linearGradient>
    <clipPath id="${uid}-arch"><path d="${archClip}"/></clipPath>
    <mask id="${uid}-sil" maskUnits="userSpaceOnUse" x="0" y="0" width="${f(hw)}" height="${f(H)}"><rect width="${f(hw)}" height="${f(H)}" fill="#fff"/><g transform="translate(${f(cx)} ${f(water)}) scale(${f(sc * 1000) / 1000})" fill="#000">${sil}</g></mask>
    <radialGradient id="${uid}-sky" gradientUnits="userSpaceOnUse" cx="${f(cx)}" cy="${f(domeY)}" r="${f(a * 1.5)}"><stop offset="0" stop-color="#1d5a4a" stop-opacity=".9"/><stop offset=".55" stop-color="#0d3a30" stop-opacity=".6"/><stop offset="1" stop-color="#062019" stop-opacity=".85"/></radialGradient>
    <linearGradient id="${uid}-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <pattern id="${uid}-stripes" width="8" height="${mobile ? 5 : 6}" patternUnits="userSpaceOnUse"><rect width="8" height="${mobile ? 2.6 : 3.2}" fill="#fff"/></pattern>
    <mask id="${uid}-refl" maskUnits="userSpaceOnUse" x="0" y="${f(water)}" width="${f(hw)}" height="${f(bottom - water)}"><rect x="0" y="${f(water)}" width="${f(hw)}" height="${f(bottom - water)}" fill="url(#${uid}-stripes)"/></mask>
  </defs>`;
  const T = (cls, inner) => `<g class="${cls}">${inner}</g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(hw)} ${f(H)}" width="${f(hw)}" height="${f(H)}" preserveAspectRatio="none" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${defs}
  ${T('l-frame', g('d-frame', G.frame) + g('d-frame2', G.frame2, ` stroke-width="${sw * 0.7}"`) + g('d-fans', G.fans, ` stroke-width="${sw * 0.8}"`))}
  ${mask ? '' : `<path class="d-sky" d="${archClip}" fill="url(#${uid}-sky)" stroke="none"/>`}
  ${T('l-arch', g('d-crown', G.crown) + g('d-crown2', G.crown2, ` stroke-width="${sw * 0.6}"`) + g('d-arch2', G.arch2, ` stroke-width="${sw * 0.7}"`) + g('d-arch', G.arch, ` stroke-width="${sw * 1.4}"`) + g('d-base', G.base))}
  <g clip-path="url(#${uid}-arch)">
    <g mask="url(#${uid}-sil)" class="l-sun">${g('d-rays', G.rays, ` stroke-width="${sw * 0.6}" opacity=".75"`)}${g('d-rings', G.rings, ` stroke-width="${sw * 0.7}"`)}</g>
    ${T('l-stars', g('d-stars', G.stars, ` stroke-width="${sw * 0.7}"`))}
    <g class="l-palace" transform="translate(${f(cx)} ${f(water)}) scale(${f(sc * 1000) / 1000})" stroke-width="${f(sw / sc * 100) / 100}">${parts}</g>
    ${mask ? '' : `<g class="l-refl" mask="url(#${uid}-refl)" opacity=".42"><g transform="translate(${f(cx)} ${f(water)}) scale(${f(sc * 1000) / 1000} ${f(-sc * 820) / 1000})" stroke-width="${f(sw / sc * 100) / 100}">${parts}</g></g>`}
    <g class="l-water" transform="translate(${f(cx)} ${f(water)}) scale(${f(sc * 1000) / 1000})" stroke-width="${f(sw * 0.8 / sc * 100) / 100}">${g('d-water', water2)}</g>
  </g>
  ${T('l-palms', g('d-palms', G.palms, ` stroke-width="${sw * 0.9}"`))}
</svg>`;
  return { svg, layout: Lr };
}
