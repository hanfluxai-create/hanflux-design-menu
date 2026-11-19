// Atelier Noor: hand block-print engine. Motifs are vector paths in a [-1, 1] box, printed layer by layer
// (rekh outline, datta fill, gadh accent) with ink irregularity, misregistration and the cloth showing through.

export const INK = {
  bone: '#f3efe8', cloth: '#efe8dc', ink: '#2a2420', madder: '#b65c3a', madderD: '#8e3f27', indigo: '#2e3a6b', indigoD: '#222b52',
  sand: '#d9c7a7', ochre: '#c4964a', kashish: '#6b5a3e'
};

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909), (s >>>= 0) / 4294967296)); }
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };

/* ---------- textures ---------- */
let NOISE = null;
function noiseCanvas() {
  if (NOISE) return NOISE;
  const S = 384, c = mk(S, S), x = c.getContext('2d'), img = x.createImageData(S, S), r = rng(9);
  const P = 48, g = new Float32Array(P * P).map(() => r());
  const vn = (u, v, p) => {
    const xi = Math.floor(u), yi = Math.floor(v), xf = u - xi, yf = v - yi;
    const G = (i, j) => g[((j % p) + p) % p * P + ((i % p) + p) % p];
    const a = xf * xf * (3 - 2 * xf), b = yf * yf * (3 - 2 * yf);
    return (G(xi, yi) * (1 - a) + G(xi + 1, yi) * a) * (1 - b) + (G(xi, yi + 1) * (1 - a) + G(xi + 1, yi + 1) * a) * b;
  };
  for (let y = 0; y < S; y++) for (let xx = 0; xx < S; xx++) {
    const u = xx / S, v = y / S;
    const n = vn(u * 6, v * 6, 6) * 0.5 + vn(u * 24, v * 24, 24) * 0.32 + vn(u * 48, v * 48, 48) * 0.18;
    let a = 0.5 + (n - 0.5) * 1.35 + 0.44;
    if (r() < 0.01) a *= 0.3;
    a = Math.max(0, Math.min(1, a));
    const o = (y * S + xx) * 4; img.data[o] = img.data[o + 1] = img.data[o + 2] = 0; img.data[o + 3] = a * 255;
  }
  x.putImageData(img, 0, 0);
  NOISE = c;
  return c;
}

// woven cloth: warm base, threads, slubs; tileable
export function weave(w, h, base = INK.cloth, seed = 3, opts = {}) {
  const c = mk(w, h), x = c.getContext('2d'), r = rng(seed);
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  const dark = opts.dark ? 'rgba(255,255,255,' : 'rgba(60,40,20,';
  const lite = opts.dark ? 'rgba(0,0,10,' : 'rgba(255,255,255,';
  for (let y = 0; y < h; y += 2) { x.fillStyle = dark + (0.025 + r() * 0.035) + ')'; x.fillRect(0, y, w, 1); }
  for (let xx = 0; xx < w; xx += 2) { x.fillStyle = lite + (0.02 + r() * 0.04) + ')'; x.fillRect(xx, 0, 1, h); }
  const slubs = Math.round(w * h / 900);
  for (let i = 0; i < slubs; i++) { x.fillStyle = (r() < 0.5 ? dark : lite) + (0.05 + r() * 0.07) + ')'; x.fillRect(r() * w, r() * h, 6 + r() * 26, 1 + (r() < 0.2 ? 1 : 0)); }
  const n = noiseCanvas();
  x.globalAlpha = opts.dark ? 0.1 : 0.06; x.globalCompositeOperation = 'multiply';
  for (let yy = 0; yy < h; yy += n.height) for (let xx = 0; xx < w; xx += n.width) x.drawImage(n, xx, yy);
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  return c;
}

/* ---------- motifs ---------- */
const TAU = Math.PI * 2;
function petal(p, cx, cy, ang, len, wid) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const P = (u, v) => [cx + u * ca - v * sa, cy + u * sa + v * ca];
  const a = P(0, 0), b1 = P(len * 0.35, -wid), b2 = P(len * 0.95, -wid * 0.55), tip = P(len, 0), c1 = P(len * 0.95, wid * 0.55), c2 = P(len * 0.35, wid);
  p.moveTo(a[0], a[1]); p.bezierCurveTo(b1[0], b1[1], b2[0], b2[1], tip[0], tip[1]); p.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], a[0], a[1]); p.closePath();
}
function leaf(p, cx, cy, ang, len, wid) { petal(p, cx, cy, ang, len, wid); }
function circ(p, x, y, r) { p.moveTo(x + r, y); p.arc(x, y, r, 0, TAU); p.closePath(); }
function lineTo(p, pts) { p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); }

export const MOTIFS = {
  // Kesar buti: a saffron flower sprig, three blocks
  kesar: {
    layers: ['rekh', 'datta', 'gadh'],
    build() {
      const fl = new Path2D(), cen = new Path2D(), ol = new Path2D(), lv = new Path2D(), lvO = new Path2D(), stem = new Path2D(), dots = new Path2D(), bud = new Path2D();
      const fx = 0, fy = -0.3;
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * TAU / 6; petal(fl, fx, fy, a, 0.46, 0.2); petal(ol, fx, fy, a, 0.46, 0.2); }
      circ(cen, fx, fy, 0.11);
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + TAU / 12 + i * TAU / 6; circ(dots, fx + Math.cos(a) * 0.3, fy + Math.sin(a) * 0.3, 0.028); }
      stem.moveTo(0, 0.16); stem.bezierCurveTo(0.08, 0.38, -0.1, 0.62, 0.02, 0.92);
      leaf(lv, -0.02, 0.5, Math.PI * 1.1, 0.42, 0.15); leaf(lv, 0.02, 0.68, -Math.PI * 0.12, 0.4, 0.14);
      leaf(lvO, -0.02, 0.5, Math.PI * 1.1, 0.42, 0.15); leaf(lvO, 0.02, 0.68, -Math.PI * 0.12, 0.4, 0.14);
      circ(bud, -0.5, -0.62, 0.08); circ(bud, 0.52, -0.6, 0.07); circ(bud, 0.56, 0.22, 0.06); circ(bud, -0.55, 0.12, 0.06);
      const veins = new Path2D();
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * TAU / 6; veins.moveTo(fx + Math.cos(a) * 0.14, fy + Math.sin(a) * 0.14); veins.lineTo(fx + Math.cos(a) * 0.36, fy + Math.sin(a) * 0.36); }
      veins.moveTo(-0.06, 0.52); veins.lineTo(-0.36, 0.38); veins.moveTo(0.06, 0.68); veins.lineTo(0.36, 0.6);
      return {
        rekh(x, col) { x.strokeStyle = col; x.fillStyle = col; x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = 0.045; x.stroke(ol); x.stroke(lvO); x.lineWidth = 0.05; x.stroke(stem); x.lineWidth = 0.022; x.stroke(veins); x.fill(cen); x.fill(dots); },
        datta(x, col) { x.fillStyle = col; x.fill(fl); x.fill(bud); },
        gadh(x, col) { x.fillStyle = col; x.fill(lv); }
      };
    }
  },
  // Anaar: pomegranate with crown and seeds
  anaar: {
    layers: ['rekh', 'datta', 'gadh'],
    build() {
      const body = new Path2D(), crown = new Path2D(), seeds = new Path2D(), leaves = new Path2D(), stem = new Path2D(), ring = new Path2D();
      body.moveTo(0, -0.42); body.bezierCurveTo(0.5, -0.46, 0.66, 0.0, 0.5, 0.36); body.bezierCurveTo(0.36, 0.62, -0.36, 0.62, -0.5, 0.36); body.bezierCurveTo(-0.66, 0.0, -0.5, -0.46, 0, -0.42); body.closePath();
      lineTo(crown, [[-0.2, -0.4], [-0.24, -0.62], [-0.1, -0.5], [0, -0.7], [0.1, -0.5], [0.24, -0.62], [0.2, -0.4]]); crown.closePath();
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const sx = -0.27 + i * 0.18 + (j % 2) * 0.09, sy = -0.12 + j * 0.15; if (Math.hypot(sx, sy - 0.1) < 0.42) { seeds.moveTo(sx + 0.05, sy); seeds.ellipse(sx, sy, 0.05, 0.066, 0.3, 0, TAU); } }
      ring.ellipse(0, 0.08, 0.36, 0.32, 0, 0, TAU);
      stem.moveTo(0, -0.7); stem.quadraticCurveTo(0.06, -0.86, 0.16, -0.92);
      leaf(leaves, 0.1, -0.84, -0.4, 0.42, 0.13); leaf(leaves, 0.06, -0.8, Math.PI + 0.5, 0.36, 0.12);
      return {
        rekh(x, col) { x.strokeStyle = col; x.fillStyle = col; x.lineJoin = 'round'; x.lineCap = 'round'; x.lineWidth = 0.05; x.stroke(body); x.stroke(crown); x.lineWidth = 0.03; x.stroke(ring); x.stroke(leaves); x.lineWidth = 0.045; x.stroke(stem); },
        datta(x, col) { x.fillStyle = col; x.fill(body); x.fill(crown); },
        gadh(x, col) { x.fillStyle = col; x.fill(seeds); x.fill(leaves); }
      };
    }
  },
  // Chameli: a small jasmine buti
  chameli: {
    layers: ['rekh', 'datta'],
    build() {
      const pet = new Path2D(), ol = new Path2D(), c = new Path2D(), lv = new Path2D();
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; petal(pet, 0, -0.12, a, 0.5, 0.24); petal(ol, 0, -0.12, a, 0.5, 0.24); }
      circ(c, 0, -0.12, 0.1);
      leaf(lv, 0.05, 0.3, Math.PI * 0.4, 0.5, 0.13);
      return {
        rekh(x, col) { x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 0.06; x.lineJoin = 'round'; x.stroke(ol); x.fill(c); x.stroke(lv); },
        datta(x, col) { x.fillStyle = col; x.fill(pet); }
      };
    }
  },
  // Jaal: an ogee lattice cell with a four-petal flower, used for dabu (resist) prints
  jaal: {
    layers: ['datta'],
    build() {
      const p = new Path2D();
      const o = new Path2D();
      o.moveTo(0, -1); o.bezierCurveTo(0.42, -0.62, 0.42, -0.36, 1, 0); o.bezierCurveTo(0.42, 0.36, 0.42, 0.62, 0, 1); o.bezierCurveTo(-0.42, 0.62, -0.42, 0.36, -1, 0); o.bezierCurveTo(-0.42, -0.36, -0.42, -0.62, 0, -1); o.closePath();
      for (let i = 0; i < 4; i++) petal(p, 0, 0, i * Math.PI / 2 + Math.PI / 4, 0.36, 0.17);
      circ(p, 0, 0, 0.08);
      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) circ(p, dx * 0.98, dy * 0.98, 0.07);
      return {
        datta(x, col) { x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 0.075; x.stroke(o); x.fill(p); }
      };
    }
  },
  // Bagru: a geometric diamond with a cross and seeds
  bagru: {
    layers: ['rekh', 'datta'],
    build() {
      const d = new Path2D(), inner = new Path2D(), cross = new Path2D(), dots = new Path2D();
      lineTo(d, [[0, -0.9], [0.9, 0], [0, 0.9], [-0.9, 0]]); d.closePath();
      lineTo(inner, [[0, -0.55], [0.55, 0], [0, 0.55], [-0.55, 0]]); inner.closePath();
      cross.moveTo(0, -0.3); cross.lineTo(0, 0.3); cross.moveTo(-0.3, 0); cross.lineTo(0.3, 0);
      for (const [x, y] of [[0, -0.72], [0.72, 0], [0, 0.72], [-0.72, 0]]) circ(dots, x, y, 0.07);
      return {
        rekh(x, col) { x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 0.08; x.lineJoin = 'miter'; x.stroke(d); x.lineWidth = 0.07; x.stroke(cross); x.fill(dots); },
        datta(x, col) { x.fillStyle = col; x.fill(inner); }
      };
    }
  },
  // Phool border: thin rules, a chain of diamonds and seed dots, for hems and cuffs (one repeat per tile)
  lehar: {
    layers: ['rekh', 'datta'],
    build() {
      const rules = new Path2D(), dia = new Path2D(), dots = new Path2D(), inner = new Path2D();
      rules.rect(-1.05, -0.86, 2.1, 0.09); rules.rect(-1.05, 0.77, 2.1, 0.09);
      lineTo(dia, [[0, -0.55], [0.55, 0], [0, 0.55], [-0.55, 0]]); dia.closePath();
      lineTo(inner, [[0, -0.22], [0.22, 0], [0, 0.22], [-0.22, 0]]); inner.closePath();
      circ(dots, -1, 0, 0.12); circ(dots, 1, 0, 0.12); circ(dots, -0.62, -0.6, 0.05); circ(dots, 0.62, -0.6, 0.05); circ(dots, -0.62, 0.6, 0.05); circ(dots, 0.62, 0.6, 0.05);
      return {
        rekh(x, col) { x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 0.08; x.fill(rules); x.stroke(dia); x.fill(dots); },
        datta(x, col) { x.fillStyle = col; x.fill(inner); }
      };
    }
  }
};
const built = {};
export function motif(name) { return built[name] || (built[name] = MOTIFS[name].build()); }

/* ---------- stamping ---------- */
let scratch = null;
export function stamp(ctx, name, layer, cx, cy, size, color, r, opts = {}) {
  const m = motif(name);
  if (!m[layer]) return;
  const s = Math.ceil(size * 1.12);
  if (!scratch || scratch.width < s || scratch.height < s) scratch = mk(Math.max(s, 256), Math.max(s, 256));
  const t = scratch.getContext('2d');
  t.setTransform(1, 0, 0, 1, 0, 0);
  t.globalCompositeOperation = 'source-over';
  t.clearRect(0, 0, s, s);
  t.save();
  t.translate(s / 2, s / 2);
  t.rotate((opts.rot || 0) + (r() - 0.5) * 0.025);
  t.scale(size / 2, size / 2);
  m[layer](t, color);
  t.restore();
  // ink does not take everywhere
  const n = noiseCanvas();
  t.globalCompositeOperation = 'destination-in';
  const ox = -r() * (n.width - Math.min(n.width, s) * 0.5), oy = -r() * (n.height - Math.min(n.height, s) * 0.5);
  const scale = Math.max(1, s / n.width * 1.4);
  t.drawImage(n, ox, oy, n.width * scale, n.height * scale);
  t.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.globalCompositeOperation = opts.mode || 'multiply';
  ctx.globalAlpha = (opts.alpha || 0.92) * (0.9 + r() * 0.1);
  const mis = opts.mis ?? 1.6;
  ctx.drawImage(scratch, 0, 0, s, s, cx - s / 2 + (r() - 0.5) * mis, cy - s / 2 + (r() - 0.5) * mis, s, s);
  ctx.restore();
}

// dabu crackle: thin indigo veins where the mud resist cracked
export function crackle(ctx, x0, y0, w, h, r, color = 'rgba(46,58,107,.55)', count = 30) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 0.7; ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    let x = x0 + r() * w, y = y0 + r() * h, a = r() * TAU;
    ctx.beginPath(); ctx.moveTo(x, y);
    const n = 6 + Math.floor(r() * 10);
    for (let j = 0; j < n; j++) { a += (r() - 0.5) * 1.1; x += Math.cos(a) * 4; y += Math.sin(a) * 4; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.restore();
}

/* ---------- fabrics (tileable pattern tiles) ---------- */
// recipe: base cloth, motif, colors per layer, cell layout (half-drop), optional dabu inversion
export const RECIPES = {
  kesar: { base: INK.cloth, motif: 'kesar', colors: { rekh: INK.ink, datta: INK.madder, gadh: INK.ochre }, cells: 2, size: 0.42 },
  neel: { base: INK.indigo, dark: true, motif: 'jaal', colors: { datta: '#e9e1d2' }, cells: 2, size: 0.5, mode: 'source-over', crack: true },
  dabu: { base: '#2b3766', dark: true, motif: 'chameli', colors: { rekh: '#e6ddcd', datta: '#e6ddcd' }, cells: 3, size: 0.24, mode: 'source-over', crack: true },
  anaar: { base: INK.sand, motif: 'anaar', colors: { rekh: INK.ink, datta: INK.madder, gadh: INK.madderD }, cells: 2, size: 0.4 },
  chameli: { base: INK.cloth, motif: 'chameli', colors: { rekh: INK.ink, datta: '#e4d3b8' }, cells: 3, size: 0.22 },
  bagru: { base: '#d6b98a', motif: 'bagru', colors: { rekh: INK.ink, datta: INK.madder }, cells: 2, size: 0.4 },
  border: { base: INK.madder, dark: true, motif: 'lehar', colors: { rekh: '#efe3cf', datta: '#2a2420' }, cells: 1, size: 1, mode: 'source-over', strip: true }
};

export function fabricTile(key, T = 320, seed = 5) {
  const R = RECIPES[key], r = rng(seed);
  const c = weave(T, T, R.base, seed + 1, { dark: R.dark });
  const x = c.getContext('2d');
  const m = MOTIFS[R.motif];
  const step = T / R.cells, size = T * R.size;
  const pos = [];
  if (R.strip) { pos.push([T / 2, T / 2, 0]); }
  else {
    for (let j = 0; j < R.cells; j++) for (let i = 0; i < R.cells; i++) {
      pos.push([i * step + step / 2, j * step + step / 2, 0]);
      pos.push([i * step, j * step, Math.PI * 0]);
    }
  }
  m.layers.forEach((layer, li) => {
    for (const [px, py, rot] of pos) {
      for (const [dx, dy] of [[0, 0], [T, 0], [-T, 0], [0, T], [0, -T], [T, T], [-T, -T], [T, -T], [-T, T]]) {
        const X = px + dx, Y = py + dy;
        if (X < -size || X > T + size || Y < -size || Y > T + size) continue;
        const rr = rng(Math.floor(px * 13 + py * 7 + seed + li * 101));
        stamp(x, R.motif, layer, X, Y, R.strip ? T : size, R.colors[layer], rr, { mode: R.mode, mis: R.dark ? 1 : 1.8, rot });
      }
    }
  });
  if (R.crack) crackle(x, 0, 0, T, T, r, 'rgba(36,46,92,.5)', Math.round(T * T / 2600));
  return c;
}
