// Hand-inked smash burger, built from layered SVG: heavy offset ink, clipped cel shading,
// halftone dots in the shadows, crispy lace on the patties and drippy cheese. Pure strings.
const f = (n) => Math.round(n * 10) / 10;
export function rng(seed) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const INK = '#111';

// Catmull-Rom through points -> cubic path
export function smooth(pts, closed = true, t = 1) {
  const n = pts.length;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  const P = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6 * t)} ${f(p1[1] + (p2[1] - p0[1]) / 6 * t)} ${f(p2[0] - (p3[0] - p1[0]) / 6 * t)} ${f(p2[1] - (p3[1] - p1[1]) / 6 * t)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}

let CID = 0;
// one inked shape: offset ink, base fill with outline, clipped shading layers
function inked(d, base, { ink = 5, off = [3, 4], shade = [], line = INK, extra = '' } = {}) {
  const id = 'bc' + (++CID);
  return `<g>
    <path d="${d}" fill="${INK}" transform="translate(${off[0]} ${off[1]})"/>
    <clipPath id="${id}"><path d="${d}"/></clipPath>
    <path d="${d}" fill="${base}"/>
    <g clip-path="url(#${id})">${shade.join('')}${extra}</g>
    <path d="${d}" fill="none" stroke="${line}" stroke-width="${ink}" stroke-linejoin="round" stroke-linecap="round"/>
  </g>`;
}

// bumpy band with crispy ends (patty side view)
function pattyPath(x0, x1, yt, yb, seed, lace = 1) {
  const r = rng(seed), top = [], bot = [];
  const n = Math.round((x1 - x0) / 14);
  for (let i = 0; i <= n; i++) {
    const x = x0 + 18 + (i / n) * (x1 - x0 - 36);
    top.push([x, yt + (r() - 0.5) * 7 - Math.sin((i / n) * Math.PI) * 3]);
  }
  // right crispy end: jagged lace
  const cy = (yt + yb) / 2, h = (yb - yt) / 2;
  const right = [];
  for (let i = 0; i <= 8; i++) {
    const a = -Math.PI / 2 + (i / 8) * Math.PI;
    const spike = i % 2 ? 1 + (6 + r() * 14) * lace / 30 : 1;
    right.push([x1 - 18 + Math.cos(a) * (22 + r() * 6) * spike, cy + Math.sin(a) * h * (0.95 + r() * 0.1)]);
  }
  for (let i = n; i >= 0; i--) {
    const x = x0 + 18 + (i / n) * (x1 - x0 - 36);
    bot.push([x, yb + (r() - 0.5) * 8 + Math.sin((i / n) * Math.PI) * 2]);
  }
  const left = [];
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI / 2 + (i / 8) * Math.PI;
    const spike = i % 2 ? 1 + (6 + r() * 14) * lace / 30 : 1;
    left.push([x0 + 18 + Math.cos(a) * (22 + r() * 6) * spike, cy + Math.sin(a) * h * (0.95 + r() * 0.1)]);
  }
  return smooth([...top, ...right, ...bot, ...left], true, 0.85);
}
function patty(x0, x1, yt, yb, seed) {
  const d = pattyPath(x0, x1, yt, yb, seed);
  const r = rng(seed + 9);
  let crust = '', specks = '', sear = '';
  // caramelised crust streaks on the side
  for (let i = 0; i < 16; i++) {
    const x = x0 + 30 + r() * (x1 - x0 - 60), y = yt + 8 + r() * (yb - yt - 16), w = 14 + r() * 26;
    crust += `M${f(x)} ${f(y)}q${f(w / 2)} ${f(-3 - r() * 4)} ${f(w)} ${f(r() * 3)}`;
  }
  for (let i = 0; i < 40; i++) specks += `<circle cx="${f(x0 + 20 + r() * (x1 - x0 - 40))}" cy="${f(yt + 4 + r() * (yb - yt - 8))}" r="${f(1 + r() * 2.2)}" fill="${r() < 0.5 ? '#2a1206' : '#c46a35'}"/>`;
  for (let i = 0; i < 5; i++) { const x = x0 + 60 + i * (x1 - x0 - 120) / 4 + (r() - 0.5) * 20; sear += `<path d="M${f(x)} ${f(yt + 6)}l${f(-10 + r() * 6)} ${f(yb - yt - 14)}" stroke="#3a1a0a" stroke-width="4" stroke-linecap="round" opacity=".55"/>`; }
  return inked(d, '#6e3518', {
    ink: 5,
    shade: [
      `<path d="M${x0 - 30} ${f(yt + (yb - yt) * 0.55)}C${f(x0 + 120)} ${f(yb - 4)} ${f(x1 - 120)} ${f(yb - 6)} ${x1 + 30} ${f(yt + (yb - yt) * 0.5)}V${yb + 30}H${x0 - 30}Z" fill="#4a210c"/>`,
      `<path d="M${x0 - 30} ${f(yt + (yb - yt) * 0.55)}C${f(x0 + 120)} ${f(yb - 4)} ${f(x1 - 120)} ${f(yb - 6)} ${x1 + 30} ${f(yt + (yb - yt) * 0.5)}V${yb + 30}H${x0 - 30}Z" fill="url(#dotsDark)" opacity=".55"/>`,
      `<path d="M${x0 + 30} ${yt + 2}C${f(x0 + 150)} ${yt - 8} ${f(x1 - 150)} ${yt - 8} ${x1 - 30} ${yt + 2}L${x1 - 40} ${yt + 12}C${f(x1 - 160)} ${yt + 6} ${f(x0 + 160)} ${yt + 6} ${x0 + 40} ${yt + 12}Z" fill="#a4552a"/>`,
      `<path d="${crust}" fill="none" stroke="#b8622f" stroke-width="3.2" stroke-linecap="round"/>`,
      sear, specks,
    ],
  });
}
// melted cheese slice with drips and drooping corners
function cheese(x0, x1, y, seed, drips) {
  const r = rng(seed);
  let d = `M${x0 + 10} ${y - 6}L${x1 - 10} ${y - 6}`;
  // right corner flap
  d += `C${x1 + 8} ${y - 2} ${x1 + 14} ${y + 10} ${x1 + 6} ${y + 26}C${x1 + 2} ${y + 36} ${x1 - 12} ${y + 34} ${x1 - 16} ${y + 22}`;
  let x = x1 - 16;
  const ds = drips.slice().sort((a, b) => b[0] - a[0]);
  for (const [dx, len, w] of ds) {
    const xc = x0 + (x1 - x0) * dx;
    d += `C${f(x - 10)} ${y + 14} ${f(xc + w + 8)} ${y + 12} ${f(xc + w)} ${y + 16}`;
    d += `C${f(xc + w + 2)} ${f(y + len * 0.6)} ${f(xc + w)} ${f(y + len)} ${f(xc)} ${f(y + len + 2)}C${f(xc - w)} ${f(y + len)} ${f(xc - w - 1)} ${f(y + len * 0.6)} ${f(xc - w)} ${y + 16}`;
    x = xc - w;
  }
  d += `C${f(x - 12)} ${y + 12} ${x0 + 30} ${y + 14} ${x0 + 18} ${y + 22}C${x0 + 12} ${y + 34} ${x0 - 4} ${y + 34} ${x0 - 6} ${y + 22}C${x0 - 10} ${y + 10} ${x0 - 4} ${y - 4} ${x0 + 10} ${y - 6}Z`;
  let glints = '';
  for (const [dx, len, w] of drips) { const xc = x0 + (x1 - x0) * dx; glints += `<path d="M${f(xc - w * 0.35)} ${y + 18}V${f(y + len - 4)}" stroke="#fff6c4" stroke-width="${f(Math.max(2, w * 0.35))}" stroke-linecap="round"/>`; }
  return inked(d, '#ffbe1a', {
    ink: 4.5, off: [2.5, 3.5],
    shade: [
      `<path d="M${x0 - 20} ${y + 8}H${x1 + 30}V${y + 80}H${x0 - 20}Z" fill="#f59a0c"/>`,
      `<path d="M${x0 - 20} ${y + 8}H${x1 + 30}V${y + 80}H${x0 - 20}Z" fill="url(#dotsOrange)" opacity=".6"/>`,
      `<path d="M${x0 + 20} ${y - 2}H${x1 - 20}V${y + 6}H${x0 + 20}Z" fill="#ffe27a"/>`,
      glints,
    ],
  });
}
function lettuce(x0, x1, y, seed) {
  const r = rng(seed);
  const pts = [[x0 + 20, y - 8]];
  pts.push([x1 - 20, y - 8]);
  // right curl
  pts.push([x1 + 14, y - 2], [x1 + 24, y + 14], [x1 + 8, y + 26]);
  let x = x1;
  while (x > x0 + 10) {
    const w = 20 + r() * 18, dep = 12 + r() * 14;
    pts.push([x - w * 0.5, y + 14 + dep * (0.6 + r() * 0.5)]);
    pts.push([x - w, y + 10 + r() * 6]);
    x -= w;
  }
  pts.push([x0 - 8, y + 26], [x0 - 26, y + 12], [x0 - 12, y - 4]);
  const d = smooth(pts, true, 0.9);
  let veins = '';
  for (let i = 0; i < 12; i++) { const vx = x0 + 30 + i * (x1 - x0 - 60) / 11; veins += `M${f(vx)} ${y - 2}q${f(4 + r() * 6)} ${f(10 + r() * 6)} ${f(-2 + r() * 8)} ${f(20 + r() * 10)}`; }
  return inked(d, '#7cd13f', {
    ink: 4.5, off: [2.5, 3.5],
    shade: [
      `<path d="M${x0 - 40} ${y + 12}H${x1 + 40}V${y + 70}H${x0 - 40}Z" fill="#43a024"/>`,
      `<path d="M${x0} ${y - 6}H${x1}V${y + 2}H${x0}Z" fill="#c4f27a"/>`,
      `<path d="${veins}" fill="none" stroke="#b9ee70" stroke-width="2.6" stroke-linecap="round"/>`,
    ],
  });
}
function tomato(x0, x1, y) {
  const d = `M${x0} ${y}C${x0 + 30} ${y - 10} ${x1 - 30} ${y - 10} ${x1} ${y}C${x1 + 16} ${y + 6} ${x1 + 14} ${y + 22} ${x1 - 6} ${y + 24}C${x1 - 80} ${y + 30} ${x0 + 80} ${y + 30} ${x0 + 6} ${y + 24}C${x0 - 14} ${y + 22} ${x0 - 16} ${y + 6} ${x0} ${y}Z`;
  let seeds = '';
  for (let i = 0; i < 9; i++) { const sx = x0 + 30 + i * (x1 - x0 - 60) / 8; seeds += `<ellipse cx="${f(sx)}" cy="${y + 12}" rx="5" ry="3.2" fill="#ffd34a" stroke="${INK}" stroke-width="1.5"/>`; }
  return inked(d, '#e8331f', {
    ink: 4.5, off: [2, 3],
    shade: [
      `<path d="M${x0 - 20} ${y + 15}H${x1 + 20}V${y + 40}H${x0 - 20}Z" fill="#b51f12"/>`,
      `<path d="M${x0 + 16} ${y + 5}C${x0 + 80} ${y + 2} ${x1 - 80} ${y + 2} ${x1 - 16} ${y + 5}L${x1 - 18} ${y + 19}C${x1 - 80} ${y + 23} ${x0 + 80} ${y + 23} ${x0 + 18} ${y + 19}Z" fill="#ff7a5c"/>`,
      seeds,
      `<path d="M${x0 + 30} ${y - 1}C${x0 + 70} ${y - 6} ${x0 + 110} ${y - 6} ${x0 + 140} ${y - 4}" stroke="#ffd1c4" stroke-width="3" stroke-linecap="round" fill="none"/>`,
    ],
  });
}
function onion(x0, x1, y) {
  const d = `M${x0} ${y}C${x0 + 60} ${y - 8} ${x1 - 60} ${y - 8} ${x1} ${y}L${x1 - 4} ${y + 9}C${x1 - 60} ${y + 3} ${x0 + 60} ${y + 3} ${x0 + 4} ${y + 9}Z`;
  return inked(d, '#c4569a', { ink: 3.5, off: [1.5, 2], shade: [`<path d="M${x0} ${y + 4}H${x1}V${y + 12}H${x0}Z" fill="#8f2f6e"/>`] });
}
function jalapenos(x0, x1, y, seed) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < 5; i++) {
    const cx = i < 2 ? x0 + 4 + i * 30 : i < 4 ? x1 - 4 - (i - 2) * 30 : (x0 + x1) / 2 + 150, cy = y + (r() - 0.5) * 6 + (i === 4 ? 6 : 0);
    s += `<g transform="rotate(${f((r() - 0.5) * 30)} ${f(cx)} ${f(cy)})"><ellipse cx="${f(cx)}" cy="${f(cy)}" rx="17" ry="7" fill="#3f9b2a" stroke="${INK}" stroke-width="3.2"/><ellipse cx="${f(cx)}" cy="${f(cy)}" rx="9" ry="3.4" fill="#c9ef8a" stroke="${INK}" stroke-width="1.5"/><circle cx="${f(cx - 3)}" cy="${f(cy)}" r="1.6" fill="#fff"/><circle cx="${f(cx + 3)}" cy="${f(cy)}" r="1.6" fill="#fff"/></g>`;
  }
  return s;
}
function bunTop(x0, x1, yb, h, seed, seeds = 22) {
  const cx = (x0 + x1) / 2, w = (x1 - x0) / 2;
  const d = `M${x0} ${yb}C${x0 - 4} ${f(yb - h * 0.62)} ${f(cx - w * 0.62)} ${f(yb - h)} ${cx} ${f(yb - h)}C${f(cx + w * 0.62)} ${f(yb - h)} ${x1 + 4} ${f(yb - h * 0.62)} ${x1} ${yb}C${f(cx + w * 0.6)} ${yb + 16} ${f(cx - w * 0.6)} ${yb + 16} ${x0} ${yb}Z`;
  const r = rng(seed);
  let sd = '';
  const placed = [];
  let tries = 0;
  while (placed.length < seeds && tries < 600) {
    tries++;
    const u = r() * 2 - 1, v = r();
    const x = cx + u * w * 0.82, ycap = yb - h * Math.sqrt(Math.max(0, 1 - (u * 0.95) ** 2));
    const y = ycap + 18 + v * (yb - ycap - 46);
    if (y > yb - 26 || placed.some(([px, py]) => Math.hypot(px - x, py - y) < 34)) continue;
    placed.push([x, y]);
    const a = (r() - 0.5) * 110;
    sd += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><path d="M-9 0C-9 -5 -3 -6 0 -6C5 -6 10 -3 10 0C10 3 5 6 0 6C-3 6 -9 5 -9 0Z" fill="#111" transform="translate(1.4 2)"/><path d="M-9 0C-9 -5 -3 -6 0 -6C5 -6 10 -3 10 0C10 3 5 6 0 6C-3 6 -9 5 -9 0Z" fill="#fff4d2" stroke="${INK}" stroke-width="2.4"/><path d="M-4 -2.5C-1 -3.5 3 -3.5 5 -2" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>`;
  }
  return inked(d, '#f4a23c', {
    ink: 5.5, off: [4, 5],
    shade: [
      `<path d="M${x0 - 20} ${f(yb - h * 0.34)}C${f(cx - w * 0.3)} ${f(yb - h * 0.12)} ${f(cx + w * 0.4)} ${f(yb - h * 0.18)} ${x1 + 30} ${f(yb - h * 0.62)}V${yb + 30}H${x0 - 20}Z" fill="#cf6e22"/>`,
      `<path d="M${x0 - 20} ${f(yb - h * 0.34)}C${f(cx - w * 0.3)} ${f(yb - h * 0.12)} ${f(cx + w * 0.4)} ${f(yb - h * 0.18)} ${x1 + 30} ${f(yb - h * 0.62)}V${yb + 30}H${x0 - 20}Z" fill="url(#dotsBun)" opacity=".7"/>`,
      `<path d="M${x0 - 10} ${yb - 12}C${f(cx - w * 0.5)} ${yb + 4} ${f(cx + w * 0.5)} ${yb + 4} ${x1 + 10} ${yb - 12}V${yb + 30}H${x0 - 10}Z" fill="#9c4a15"/>`,
      `<path d="M${f(cx - w * 0.78)} ${f(yb - h * 0.52)}C${f(cx - w * 0.62)} ${f(yb - h * 0.9)} ${f(cx - w * 0.2)} ${f(yb - h * 1.0)} ${f(cx + w * 0.12)} ${f(yb - h * 0.96)}C${f(cx - w * 0.18)} ${f(yb - h * 0.86)} ${f(cx - w * 0.5)} ${f(yb - h * 0.72)} ${f(cx - w * 0.66)} ${f(yb - h * 0.42)}Z" fill="#ffd27a"/>`,
      `<path d="M${f(cx - w * 0.5)} ${f(yb - h * 0.84)}C${f(cx - w * 0.38)} ${f(yb - h * 0.93)} ${f(cx - w * 0.22)} ${f(yb - h * 0.96)} ${f(cx - w * 0.08)} ${f(yb - h * 0.96)}" stroke="#fff8e6" stroke-width="7" stroke-linecap="round" fill="none"/>`,
      `<circle cx="${f(cx - w * 0.68)}" cy="${f(yb - h * 0.58)}" r="5" fill="#fff8e6"/>`,
    ],
    extra: sd,
  });
}
function bunHeel(x0, x1, yt, h) {
  const cx = (x0 + x1) / 2, w = (x1 - x0) / 2;
  const d = `M${x0} ${yt + 8}C${x0} ${yt} ${x0 + 14} ${yt - 2} ${x0 + 30} ${yt - 2}L${x1 - 30} ${yt - 2}C${x1 - 14} ${yt - 2} ${x1} ${yt} ${x1} ${yt + 8}C${x1 + 2} ${f(yt + h * 0.7)} ${f(cx + w * 0.7)} ${yt + h} ${cx} ${yt + h}C${f(cx - w * 0.7)} ${yt + h} ${x0 - 2} ${f(yt + h * 0.7)} ${x0} ${yt + 8}Z`;
  return inked(d, '#f4a23c', {
    ink: 5.5, off: [4, 5],
    shade: [
      `<path d="M${x0 - 10} ${yt - 6}H${x1 + 10}V${yt + 12}H${x0 - 10}Z" fill="#ffd994"/>`,
      `<path d="M${x0 - 10} ${yt + 12}H${x1 + 10}V${yt + 18}H${x0 - 10}Z" fill="#c76a22"/>`,
      `<path d="M${x0 - 20} ${f(yt + h * 0.5)}C${f(cx - w * 0.4)} ${f(yt + h * 0.62)} ${f(cx + w * 0.4)} ${f(yt + h * 0.46)} ${x1 + 20} ${f(yt + h * 0.2)}V${yt + h + 20}H${x0 - 20}Z" fill="#cf6e22"/>`,
      `<path d="M${x0 - 20} ${f(yt + h * 0.5)}C${f(cx - w * 0.4)} ${f(yt + h * 0.62)} ${f(cx + w * 0.4)} ${f(yt + h * 0.46)} ${x1 + 20} ${f(yt + h * 0.2)}V${yt + h + 20}H${x0 - 20}Z" fill="url(#dotsBun)" opacity=".7"/>`,
      `<path d="M${x0 + 30} ${f(yt + h * 0.42)}C${x0 + 40} ${f(yt + h * 0.62)} ${x0 + 70} ${f(yt + h * 0.72)} ${x0 + 100} ${f(yt + h * 0.76)}" stroke="#ffd27a" stroke-width="6" stroke-linecap="round" fill="none"/>`,
    ],
  });
}
function sauce(x0, x1, y) {
  const d = `M${x0} ${y}C${x0 + 80} ${y - 6} ${x1 - 80} ${y - 6} ${x1} ${y}C${x1 - 6} ${y + 8} ${x1 - 30} ${y + 6} ${x1 - 40} ${y + 10}C${x1 - 44} ${y + 26} ${x1 - 58} ${y + 26} ${x1 - 60} ${y + 10}C${x0 + 140} ${y + 8} ${x0 + 120} ${y + 9} ${x0 + 110} ${y + 12}C${x0 + 106} ${y + 22} ${x0 + 94} ${y + 22} ${x0 + 92} ${y + 12}C${x0 + 40} ${y + 10} ${x0 + 10} ${y + 8} ${x0} ${y}Z`;
  return inked(d, '#ff7a3d', { ink: 3.5, off: [1.5, 2], shade: [`<path d="M${x0} ${y + 5}H${x1}V${y + 30}H${x0}Z" fill="#e2551f"/>`] });
}

export function defs() {
  return `<defs>
    <pattern id="dotsDark" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="3.5" cy="3.5" r="1.7" fill="#1a0a03"/></pattern>
    <pattern id="dotsOrange" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="3.5" cy="3.5" r="1.6" fill="#d9700a"/></pattern>
    <pattern id="dotsBun" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="4" cy="4" r="1.9" fill="#8f3f10"/></pattern>
    <pattern id="dotsInk" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="4.5" cy="4.5" r="2.4" fill="#111"/></pattern>
  </defs>`;
}

// The full burger: returns ordered layers [{name, svg}] (bottom first), drawn on a 600x600 board.
export function burger({ patties = 2, spicy = false, veg = false, seed = 7, seeds = 22 } = {}) {
  const L = [];
  const g = (name, svg) => L.push({ name, svg });
  g('shadow', `<ellipse cx="302" cy="${patties > 1 ? 548 : 520}" rx="228" ry="20" fill="url(#dotsInk)" opacity=".55"/>`);
  const heelY = patties > 1 ? 466 : 440;
  g('heel', bunHeel(112, 488, heelY, 80));
  g('sauce', sauce(120, 480, heelY - 2));
  g('lettuce', lettuce(96, 504, heelY - 26, seed + 3));
  let y = heelY - 30;
  const pc = veg ? ['#7f8f2c', '#5d6b1c'] : null;
  for (let i = 0; i < patties; i++) {
    const yt = y - 60, yb = y;
    let p = patty(92 + i * 4, 508 - i * 6, yt, yb, seed + 11 * (i + 1));
    if (veg) p = p.replace(/#6e3518/g, '#c9862c').replace(/#4a210c/g, '#94561a').replace(/#a4552a/g, '#e8b04a').replace(/#b8622f/g, '#f0c25e').replace(/#c46a35/g, '#5fae2e').replace(/#2a1206/g, '#3d8a22').replace(/#3a1a0a/g, '#7a4210').replace(/url\(#dotsDark\)/g, 'url(#dotsOrange)');
    g('patty' + i, p);
    g('cheese' + i, cheese(114 + i * 6, 486 - i * 6, yt + 2, seed + 21 * (i + 1), i % 2 ? [[0.22, 48, 9], [0.58, 66, 11], [0.86, 40, 8]] : [[0.16, 42, 8], [0.4, 74, 11], [0.72, 54, 10]]));
    y = yt + 6;
  }
  g('tomato', tomato(140, 462, y - 18));
  g('onion', onion(156, 444, y - 26));
  if (spicy) g('jala', jalapenos(96, 504, y - 10, seed + 5));
  g('crown', bunTop(104, 496, y - 22, 176, seed + 2, seeds));
  if (spicy) g('band', `<g><path d="M120 ${y - 112}C220 ${y - 138} 380 ${y - 138} 480 ${y - 112}L476 ${y - 92}C380 ${y - 116} 220 ${y - 116} 124 ${y - 92}Z" fill="#e63223" stroke="#111" stroke-width="5" stroke-linejoin="round"/><path d="M476 ${y - 104}L530 ${y - 128}L522 ${y - 96}L548 ${y - 84}L490 ${y - 92}Z" fill="#e63223" stroke="#111" stroke-width="4.5" stroke-linejoin="round"/><circle cx="300" cy="${y - 113}" r="11" fill="#fff" stroke="#111" stroke-width="3.5"/><circle cx="300" cy="${y - 113}" r="4.5" fill="#e63223"/></g>`);
  return L;
}
export function burgerSVG(opts = {}, attrs = '') {
  const L = burger(opts);
  return `<svg viewBox="0 0 600 600" ${attrs}>${defs()}${L.map((l) => `<g class="b-layer" data-layer="${l.name}">${l.svg}</g>`).join('')}</svg>`;
}
