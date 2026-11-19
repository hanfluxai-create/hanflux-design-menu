// Tiny axonometric engine: convex primitives -> hidden-line SVG drawings (painter's order via topological sort).
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

function view(az, el) {
  const V = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];
  const R = [Math.cos(az), 0, -Math.sin(az)];
  const U = cross(V, R);
  return { V, R, U, p: (P) => [dot(P, R), -dot(P, U), dot(P, V)] };
}

function hull(pts) {
  const p = pts.map(q => [q[0], q[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  up.pop(); lo.pop();
  return lo.concat(up);
}
function overlap(A, B) {
  for (const P of [A, B]) {
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length];
      const nx = b[1] - a[1], ny = a[0] - b[0];
      let amin = Infinity, amax = -Infinity, bmin = Infinity, bmax = -Infinity;
      for (const q of A) { const d = q[0] * nx + q[1] * ny; amin = Math.min(amin, d); amax = Math.max(amax, d); }
      for (const q of B) { const d = q[0] * nx + q[1] * ny; bmin = Math.min(bmin, d); bmax = Math.max(bmax, d); }
      const tol = 1e-4 * Math.hypot(nx, ny);
      if (amax <= bmin + tol || bmax <= amin + tol) return false;
    }
  }
  return true;
}

/* ---------------------------------------------------------------- model */
class Model {
  constructor(o = {}) {
    this.prims = []; this.ground = []; this.notes = [];
    this.L = nrm(o.light || [0.62, -0.75, -0.32]);       // direction light travels
    this.Lh = nrm([-this.L[0], 0, -this.L[2]]);            // horizontal direction towards the light
  }
  add(p) { this.prims.push(p); return p; }
  box(min, max, o = {}) { return this.add({ kind: 'box', min, max, style: o.style || 'solid', deco: o.deco || {}, cast: o.cast !== false, on: o.on, recv: !!o.recv }); }
  prism(cx, cz, r, n, y0, y1, o = {}) {
    return this.add({ kind: 'prism', cx, cz, r, n, y0, y1, min: [cx - r, y0, cz - r], max: [cx + r, y1, cz + r], courses: o.courses || 0, door: o.door, open: o.open, cast: o.cast !== false, on: o.on });
  }
  vault(cx, r, y0, z0, z1, n, o = {}) {
    return this.add({ kind: 'vault', cx, r, y0, z0, z1, n, min: [cx - r, y0, z0], max: [cx + r, y0 + r, z1], lunette: o.lunette, cast: o.cast !== false, on: o.on });
  }
  wedge(min, max, yF, yB, o = {}) { // mono-pitch roof: top at yF on +z edge, yB on -z edge
    return this.add({ kind: 'wedge', min, max: [max[0], Math.max(yF, yB), max[2]], y0: min[1], yF, yB, cast: o.cast !== false, on: o.on, deco: o.deco || {} });
  }
  tree(x, y, z, h, r, o = {}) { return this.add({ kind: 'tree', x, y, z, h, r, tall: o.tall, min: [x - r, y, z - r], max: [x + r, y + h, z + r], cast: true, on: o.on }); }
  palm(x, y, z, h, lean) { return this.add({ kind: 'palm', x, y, z, h, lean, min: [x - 2.6, y, z - 2.6], max: [x + 2.6, y + h + 1, z + 2.6], cast: false }); }
  bush(x, y, z, r) { return this.add({ kind: 'bush', x, y, z, r, min: [x - r, y, z - r], max: [x + r, y + r * 1.6, z + r], cast: false }); }
  person(x, y, z) { return this.add({ kind: 'person', x, y, z, min: [x - 0.25, y, z - 0.25], max: [x + 0.25, y + 1.75, z + 0.25], cast: false }); }
  gline(pts, cls = 'dt', y = 0) { this.ground.push({ t: 'line', pts: pts.map(p => p.length === 3 ? p : [p[0], y, p[1]]), cls }); }
  gpoly(pts, cls, y = 0) { this.ground.push({ t: 'poly', pts: pts.map(p => p.length === 3 ? p : [p[0], y, p[1]]), cls }); }
  dim(a, b, off, label) { this.notes.push({ t: 'dim', a, b, off, label }); }
  north(x, z, r) { this.notes.push({ t: 'north', x, z, r }); }
}

// face-local helpers: (u, v) on a box face -> 3D
function faceMap(b, key) {
  const [x0, y0, z0] = b.min, [x1, y1, z1] = b.max;
  switch (key) {
    case 'pz': return (u, v) => [u, v, z1];
    case 'nz': return (u, v) => [u, v, z0];
    case 'px': return (u, v) => [x1, v, u];
    case 'nx': return (u, v) => [x0, v, u];
    case 'py': return (u, v) => [u, y1, v];
    default: return (u, v) => [u, v, z1];
  }
}
export const deco = {
  rect: (u0, v0, u1, v1, cls = 'sc', fill) => ({ pts: [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], closed: true, cls, fill }),
  line: (pts, cls = 'dt') => ({ pts, cls }),
  vlines: (u0, u1, step, v0, v1, cls = 'dt') => { const out = []; for (let u = u0 + step; u < u1 - 1e-6; u += step) out.push({ pts: [[u, v0], [u, v1]], cls }); return out; },
  hlines: (v0, v1, step, u0, u1, cls = 'dt') => { const out = []; for (let v = v0 + step; v < v1 - 1e-6; v += step) out.push({ pts: [[u0, v], [u1, v]], cls }); return out; },
  wave: (u0, u1, v, amp, wl, cls = 'dt') => { const pts = []; for (let u = u0; u <= u1 + 1e-6; u += wl / 8) pts.push([u, v + Math.sin((u - u0) / wl * Math.PI * 2) * amp]); return { pts, cls }; }
};

/* ---------------------------------------------------------------- render */
export function renderAxo(model, opts) {
  const vw = view(opts.az ?? -0.62, opts.el ?? 0.5);
  const VW = opts.w || 1000, VH = opts.h || 750, pad = opts.pad ?? 56;
  const L = model.L, Lh = model.Lh;
  const items = [];   // {d:[[x,y]...]|null, closed, cls, extra, kind:'path'|'circle'|'text'}
  const P = (q) => vw.p(q);
  const push = (pts3, cls, closed = false, extra = '', fill) => { items.push({ pts: pts3.map(P), cls, closed, extra, fill }); };
  const push2 = (pts2, cls, closed = false, extra = '') => { items.push({ pts: pts2, cls, closed, extra }); };

  const tone = (n, style) => {
    if (style === 'ghost') return 'fgh';
    if (n[1] > 0.5) return style === 'water' ? 'fw' : 'ft';
    if (style === 'glass') return 'fg';
    if (style === 'earth') return 'fe';
    const d = n[0] * Lh[0] + n[2] * Lh[2];
    return d > 0.62 ? 'fl' : (d > 0.18 ? 'fm' : 'fs');
  };
  const shadowPoly = (pts3, planeY) => {
    const proj = pts3.filter(p => p[1] >= planeY - 1e-6).map(p => { const t = (p[1] - planeY) / -L[1]; return [p[0] + L[0] * t, p[2] + L[2] * t]; });
    if (proj.length < 3) return null;
    return hull(proj).map(([x, z]) => [x, planeY, z]);
  };
  const corners = (mn, mx) => [[mn[0], mn[1], mn[2]], [mx[0], mn[1], mn[2]], [mx[0], mn[1], mx[2]], [mn[0], mn[1], mx[2]], [mn[0], mx[1], mn[2]], [mx[0], mx[1], mn[2]], [mx[0], mx[1], mx[2]], [mn[0], mx[1], mx[2]]];

  // ---- ground layer
  for (const g of model.ground) push(g.pts, g.cls, g.t === 'poly');
  // ---- ground shadows
  for (const pr of model.prims) {
    if (!pr.cast || pr.on) continue;
    const s = castShadow(pr, 0);
    if (s) push(s, 'sh', true);
  }
  function castShadow(pr, planeY) {
    if (pr.kind === 'tree' || pr.kind === 'palm') {
      const cy = pr.kind === 'palm' ? pr.h : pr.h * 0.7, rr = pr.kind === 'palm' ? 2.2 : pr.r;
      const t = (pr.y + cy - planeY) / -L[1];
      const cx = pr.x + (pr.kind === 'palm' ? pr.lean[0] : 0) + L[0] * t, cz = pr.z + (pr.kind === 'palm' ? pr.lean[1] : 0) + L[2] * t;
      const pts = []; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; pts.push([cx + Math.cos(a) * rr, planeY, cz + Math.sin(a) * rr * 0.9]); }
      return pts;
    }
    if (pr.kind === 'prism') {
      const pts = []; for (let i = 0; i < pr.n; i++) { const a = i / pr.n * Math.PI * 2; pts.push([pr.cx + Math.cos(a) * pr.r, pr.y0, pr.cz + Math.sin(a) * pr.r], [pr.cx + Math.cos(a) * pr.r, pr.y1, pr.cz + Math.sin(a) * pr.r]); }
      return shadowPoly(pts, planeY);
    }
    if (pr.kind === 'vault') {
      const pts = []; for (let i = 0; i <= pr.n; i++) { const a = i / pr.n * Math.PI; for (const z of [pr.z0, pr.z1]) pts.push([pr.cx + Math.cos(a) * pr.r, pr.y0 + Math.sin(a) * pr.r, z]); }
      return shadowPoly(pts, planeY);
    }
    return shadowPoly(corners(pr.min, pr.max), planeY);
  }

  // ---- sort primitives back to front
  const prims = model.prims;
  prims.forEach(p => { p.hull = hull(corners(p.min, p.max).map(P)); p.depth = P([(p.min[0] + p.max[0]) / 2, (p.min[1] + p.max[1]) / 2, (p.min[2] + p.max[2]) / 2])[2]; });
  const n = prims.length, adj = Array.from({ length: n }, () => []), indeg = new Array(n).fill(0);
  const behind = (A, B) => {
    for (let k = 0; k < 3; k++) {
      if (Math.abs(vw.V[k]) < 1e-6) continue;
      if (A.max[k] <= B.min[k] + 1e-6) return vw.V[k] > 0 ? 1 : -1;
      if (B.max[k] <= A.min[k] + 1e-6) return vw.V[k] > 0 ? -1 : 1;
    }
    return A.depth < B.depth ? 1 : -1;
  };
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    if (!overlap(prims[i].hull, prims[j].hull)) continue;
    const r = behind(prims[i], prims[j]);
    if (r === 1) { adj[i].push(j); indeg[j]++; } else { adj[j].push(i); indeg[i]++; }
  }
  const done = new Array(n).fill(false), order = [];
  for (let c = 0; c < n; c++) {
    let pick = -1;
    for (let i = 0; i < n; i++) if (!done[i] && indeg[i] === 0 && (pick < 0 || prims[i].depth < prims[pick].depth)) pick = i;
    if (pick < 0) { for (let i = 0; i < n; i++) if (!done[i] && (pick < 0 || prims[i].depth < prims[pick].depth)) pick = i; }
    done[pick] = true; order.push(prims[pick]);
    for (const j of adj[pick]) indeg[j]--;
  }

  // ---- emit primitives
  const V = vw.V;
  let clipN = 0; const clips = [];
  for (const pr of order) {
    if (pr.kind === 'box') emitBox(pr);
    else if (pr.kind === 'prism') emitPrism(pr);
    else if (pr.kind === 'vault') emitVault(pr);
    else if (pr.kind === 'wedge') emitWedge(pr);
    else if (pr.kind === 'tree') emitTree(pr);
    else if (pr.kind === 'palm') emitPalm(pr);
    else if (pr.kind === 'bush') emitBush(pr);
    else if (pr.kind === 'person') emitPerson(pr);
    if (pr.recv) {
      // shadows of everything standing on this receiver, clipped to its top face
      const top = [[pr.min[0], pr.max[1], pr.min[2]], [pr.max[0], pr.max[1], pr.min[2]], [pr.max[0], pr.max[1], pr.max[2]], [pr.min[0], pr.max[1], pr.max[2]]];
      const id = (opts.id || 'ax') + '-c' + (clipN++);
      clips.push({ id, pts: top.map(P) });
      for (const o of prims) if (o.on === pr && o.cast) { const s = castShadow(o, pr.max[1]); if (s) push(s, 'sh', true, 'clip-path="url(#' + id + ')"'); }
    }
  }

  function emitFace(pts3, nrm3, style, decos, keyMap) {
    push(pts3, 'pf ' + tone(nrm3, style), true);
    if (decos) for (const d of [].concat(decos)) {
      if (Array.isArray(d)) { d.forEach(x => emitDeco(x, keyMap)); continue; }
      emitDeco(d, keyMap);
    }
  }
  function emitDeco(d, map) {
    const pts = d.pts.map(([u, v]) => map(u, v));
    push(pts, d.cls + (d.fill ? ' ' + d.fill : ''), !!d.closed);
  }
  function emitBox(b) {
    const [x0, y0, z0] = b.min, [x1, y1, z1] = b.max;
    const F = [
      ['py', [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], [0, 1, 0]],
      ['pz', [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1]],
      ['nz', [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], [0, 0, -1]],
      ['px', [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], [1, 0, 0]],
      ['nx', [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0]]
    ];
    for (const [k, pts, n3] of F) {
      if (dot(n3, V) <= 1e-6) continue;
      const style = (b.style === 'glass' && k === 'py') ? 'solid' : b.style;
      emitFace(pts, n3, style, b.deco[k], faceMap(b, k));
    }
  }
  function emitWedge(w) {
    const [x0, , z0] = w.min, [x1, , z1] = w.max, y0 = w.y0, yF = w.yF, yB = w.yB;
    const topN = nrm([0, z1 - z0, yB - yF]);
    const F = [
      [[[x0, yB, z0], [x1, yB, z0], [x1, yF, z1], [x0, yF, z1]], topN],
      [[[x0, y0, z1], [x1, y0, z1], [x1, yF, z1], [x0, yF, z1]], [0, 0, 1]],
      [[[x0, y0, z0], [x1, y0, z0], [x1, yB, z0], [x0, yB, z0]], [0, 0, -1]],
      [[[x1, y0, z0], [x1, y0, z1], [x1, yF, z1], [x1, yB, z0]], [1, 0, 0]],
      [[[x0, y0, z0], [x0, y0, z1], [x0, yF, z1], [x0, yB, z0]], [-1, 0, 0]]
    ];
    F.forEach(([pts, n3], i) => {
      if (dot(n3, V) <= 1e-6) return;
      push(pts, 'pf ' + tone(n3, 'solid'), true);
      if (i === 0) for (let x = x0 + 0.6; x < x1 - 0.3; x += 0.6) push([[x, yB, z0], [x, yF, z1]], 'dt');
    });
  }
  function emitPrism(c) {
    const ring = (y, r = c.r) => { const out = []; for (let i = 0; i < c.n; i++) { const a = (i + 0.5) / c.n * Math.PI * 2; out.push([c.cx + Math.cos(a) * r, y, c.cz + Math.sin(a) * r]); } return out; };
    const lo = ring(c.y0), hi = ring(c.y1);
    const vis = [];
    for (let i = 0; i < c.n; i++) {
      const j = (i + 1) % c.n, a = (i + 1) / c.n * Math.PI * 2;
      const n3 = [Math.cos(a), 0, Math.sin(a)];
      vis[i] = dot(n3, V) > 1e-6;
      if (!vis[i]) continue;
      const d = n3[0] * Lh[0] + n3[2] * Lh[2];
      const shade = Math.round(236 - (1 - (d + 1) / 2) * 24);
      push([lo[i], lo[j], hi[j], hi[i]], 'sp fc', true, '', 'rgb(' + shade + ',' + (shade - 2) + ',' + (shade - 7) + ')');
      if (c.courses) for (let y = c.y0 + c.courses; y < c.y1 - 0.05; y += c.courses) {
        push([[lo[i][0], y, lo[i][2]], [lo[j][0], y, lo[j][2]]], 'dt');
      }
    }
    // silhouette verticals and bottom
    for (let i = 0; i < c.n; i++) {
      const j = (i + 1) % c.n;
      if (vis[i] !== vis[j]) push([lo[j], hi[j]], 'pf');
      if (vis[i]) push([lo[i], lo[j]], 'pf');
    }
    if (c.door) { // opening on the facet facing the viewer most
      let best = 0, bd = -2;
      for (let i = 0; i < c.n; i++) { const a = (i + 1) / c.n * Math.PI * 2; const dd = Math.cos(a) * V[0] + Math.sin(a) * V[2]; if (dd > bd) { bd = dd; best = i; } }
      const j = (best + 1) % c.n, m = (t, y) => [lo[best][0] + (lo[j][0] - lo[best][0]) * t, y, lo[best][2] + (lo[j][2] - lo[best][2]) * t];
      const arch = [m(0.2, c.y0)];
      for (let k = 0; k <= 10; k++) { const a = Math.PI - k / 10 * Math.PI; arch.push(m(0.5 + Math.cos(a) * 0.3, c.y0 + c.door + Math.sin(a) * 0.42)); }
      arch.push(m(0.8, c.y0));
      push(arch, 'sc fd', true);
    }
    push(hi, 'pf ft', true);
    if (c.open) push(ring(c.y1, c.r * c.open), 'sc fd', true);
  }
  function emitVault(v) {
    const pt = (a, z) => [v.cx + Math.cos(a) * v.r, v.y0 + Math.sin(a) * v.r, z];
    const vis = [];
    for (let i = 0; i < v.n; i++) {
      const a0 = i / v.n * Math.PI, a1 = (i + 1) / v.n * Math.PI, am = (a0 + a1) / 2;
      const n3 = [Math.cos(am), Math.sin(am), 0];
      vis[i] = dot(n3, V) > 1e-6;
      if (!vis[i]) continue;
      const d = n3[0] * Lh[0] + n3[1] * 0.55;
      const shade = Math.round(246 - (1 - Math.min(1, Math.max(0, d + 0.2))) * 22);
      push([pt(a0, v.z0), pt(a1, v.z0), pt(a1, v.z1), pt(a0, v.z1)], 'sf fc', true, '', 'rgb(' + shade + ',' + (shade - 2) + ',' + (shade - 6) + ')');
    }
    for (let i = 0; i <= v.n; i++) {
      const a = i / v.n * Math.PI, prev = i > 0 ? vis[i - 1] : false, next = i < v.n ? vis[i] : false;
      if (prev !== next) push([pt(a, v.z0), pt(a, v.z1)], 'pf');
    }
    push([pt(Math.PI / 2, v.z0 + 0.6), pt(Math.PI / 2, v.z1 - 0.6)], 'sc');
    if (dot([0, 0, 1], V) > 0) {
      const arc = []; for (let i = 0; i <= v.n; i++) arc.push(pt(i / v.n * Math.PI, v.z1));
      push(arc, 'pf fm', true);
      if (v.lunette) {
        const r2 = v.r * 0.72, c0 = [v.cx, v.y0, v.z1], ln = [];
        for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI; ln.push([v.cx + Math.cos(a) * r2, v.y0 + Math.sin(a) * r2, v.z1]); }
        push(ln, 'sc fg', true);
        for (let k = 1; k < 6; k++) { const a = k / 6 * Math.PI; push([c0, [v.cx + Math.cos(a) * r2, v.y0 + Math.sin(a) * r2, v.z1]], 'dt'); }
      }
    }
  }
  function emitTree(t) {
    const base = P([t.x, t.y, t.z]), top = P([t.x, t.y + t.h * (t.tall ? 0.62 : 0.5), t.z]), c = P([t.x, t.y + t.h * 0.72, t.z]);
    push2([base, top], 'sc');
    const ry = t.tall ? t.r * 1.9 : t.r * 0.92, pts = [];
    for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; const wob = 1 + 0.045 * Math.sin(a * 7 + t.x); pts.push([c[0] + Math.cos(a) * t.r * wob, c[1] + Math.sin(a) * ry * wob]); }
    push2(pts, 'pf ftr', true);
    for (let k = 0; k < 3; k++) {
      const a0 = 0.6 + k * 1.7 + t.z * 0.1, rr = t.r * (0.42 + k * 0.14), arc = [];
      for (let i = 0; i <= 8; i++) { const a = a0 + i / 8 * 1.3; arc.push([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr * (ry / t.r)]); }
      push2(arc, 'dt');
    }
  }
  function emitPalm(p) {
    const base = P([p.x, p.y, p.z]), tip = P([p.x + p.lean[0], p.y + p.h, p.z + p.lean[1]]);
    const mid = [(base[0] + tip[0]) / 2 + (tip[0] - base[0]) * 0.25, (base[1] + tip[1]) / 2];
    items.push({ raw: 'M' + f(base[0]) + ' ' + f(base[1]) + 'Q' + f(mid[0]) + ' ' + f(mid[1]) + ' ' + f(tip[0]) + ' ' + f(tip[1]), cls: 'pf nofill', bb: [base, tip] });
    for (let k = 0; k < 9; k++) {
      const a = k / 9 * Math.PI * 2 + 0.3, len = 2.4 + ((k * 7) % 3) * 0.35;
      const end = P([p.x + p.lean[0] + Math.cos(a) * len, p.y + p.h - 1.7 - (k % 3) * 0.35, p.z + p.lean[1] + Math.sin(a) * len]);
      const ctl = P([p.x + p.lean[0] + Math.cos(a) * len * 0.62, p.y + p.h + 0.55, p.z + p.lean[1] + Math.sin(a) * len * 0.62]);
      items.push({ raw: 'M' + f(tip[0]) + ' ' + f(tip[1]) + 'Q' + f(ctl[0]) + ' ' + f(ctl[1]) + ' ' + f(end[0]) + ' ' + f(end[1]), cls: 'sc nofill', bb: [end, ctl] });
    }
  }
  function emitBush(b) {
    const c = P([b.x, b.y + b.r * 0.8, b.z]), pts = [];
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; pts.push([c[0] + Math.cos(a) * b.r, c[1] + Math.sin(a) * b.r * 0.85]); }
    push2(pts, 'sc ftr', true);
  }
  function emitPerson(p) {
    const b = P([p.x, p.y, p.z]), t = P([p.x, p.y + 1.75, p.z]), h = b[1] - t[1], w = h * 0.13;
    const hr = h * 0.075, hx = t[0], hy = t[1] + hr;
    const body = [[hx - w, t[1] + h * 0.2], [hx + w, t[1] + h * 0.2], [hx + w * 0.75, t[1] + h * 0.58], [hx + w * 0.55, b[1]], [hx + w * 0.08, b[1]], [hx, t[1] + h * 0.62], [hx - w * 0.08, b[1]], [hx - w * 0.55, b[1]], [hx - w * 0.75, t[1] + h * 0.58]];
    push2(body, 'pp', true);
    const head = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; head.push([hx + Math.cos(a) * hr, hy + Math.sin(a) * hr]); }
    push2(head, 'pp', true);
  }

  // ---- notes (orange)
  for (const nt of model.notes) {
    if (nt.t === 'dim') {
      const off = nt.off, a = [nt.a[0], 0, nt.a[1] + off], b = [nt.b[0], 0, nt.b[1] + off];
      push([[nt.a[0], 0, nt.a[1] + 0.6], [nt.a[0], 0, nt.a[1] + off + 0.6]], 'dm');
      push([[nt.b[0], 0, nt.b[1] + 0.6], [nt.b[0], 0, nt.b[1] + off + 0.6]], 'dm');
      push([a, b], 'dm');
      for (const q of [a, b]) push([[q[0] - 0.4, 0, q[2] + 0.4], [q[0] + 0.4, 0, q[2] - 0.4]], 'dm dk');
      const m = P([(a[0] + b[0]) / 2, 0, (a[2] + b[2]) / 2]), pa = P(a), pb = P(b);
      const ang = Math.atan2(pb[1] - pa[1], pb[0] - pa[0]) * 180 / Math.PI;
      items.push({ text: nt.label, x: m[0], y: m[1], ang, cls: 'dmt' });
    } else if (nt.t === 'north') {
      const pts = []; for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; pts.push([nt.x + Math.cos(a) * nt.r, 0, nt.z + Math.sin(a) * nt.r]); }
      push(pts, 'dm', true);
      push([[nt.x - nt.r * 0.45, 0, nt.z + nt.r * 0.6], [nt.x, 0, nt.z - nt.r * 1.35], [nt.x + nt.r * 0.45, 0, nt.z + nt.r * 0.6]], 'dm');
      const tp = P([nt.x, 0, nt.z - nt.r * 1.85]);
      items.push({ text: 'N', x: tp[0], y: tp[1], ang: 0, cls: 'dmt' });
    }
  }

  // ---- fit and stringify
  let mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity;
  for (const it of items) for (const q of (it.pts || it.bb || [])) { mnx = Math.min(mnx, q[0]); mny = Math.min(mny, q[1]); mxx = Math.max(mxx, q[0]); mxy = Math.max(mxy, q[1]); }
  const s = Math.min((VW - pad * 2) / (mxx - mnx), (VH - pad * 2) / (mxy - mny));
  const ox = (VW - (mxx - mnx) * s) / 2 - mnx * s, oy = (VH - (mxy - mny) * s) / 2 - mny * s + (opts.dy || 0);
  const T = (q) => [q[0] * s + ox, q[1] * s + oy];
  function f(v) { return (Math.round(v * 10) / 10).toString(); }
  function pathD(pts, closed, raw) {
    const q = raw ? pts.map(p => [p[0], p[1]]) : pts;
    let d = '';
    q.forEach((p, i) => { const t = raw ? p : T(p); d += (i ? 'L' : 'M') + f(t[0]) + ' ' + f(t[1]); });
    return d + (closed ? 'Z' : '');
  }
  const total = items.length;
  const hid = (opts.id || 'ax') + '-h';
  const span = opts.span || 1200;
  let out = '';
  items.forEach((it, i) => {
    const delay = Math.round(i / total * span);
    if (it.text) {
      const t = T([it.x, it.y]);
      let ang = it.ang; if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
      out += '<text class="' + it.cls + '" style="--d:' + delay + 'ms" transform="translate(' + f(t[0]) + ' ' + f(t[1]) + ') rotate(' + f(ang) + ')" text-anchor="middle" dy="-7">' + it.text + '</text>';
      return;
    }
    let d;
    if (it.raw) d = it.raw.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (m0, a, b) => { const t = T([+a, +b]); return f(t[0]) + ' ' + f(t[1]); });
    else d = pathD(it.pts.map(p => [p[0] * s + ox, p[1] * s + oy]), it.closed, true);
    const pat = '';
    if (!it.fill && / fs\b/.test(' ' + it.cls)) it.fill = 'url(#' + hid + ')';
    if (!it.fill && / fe\b/.test(' ' + it.cls)) it.fill = 'url(#' + hid + 'e)';
    out += '<path class="' + it.cls + '" d="' + d + '" pathLength="1" style="--d:' + delay + 'ms' + (it.fill ? ';fill:' + it.fill : '') + '"' + pat + (it.extra ? ' ' + it.extra : '') + '/>';
  });
  const defs = '<defs><pattern id="' + hid + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#dcd8cf"/><line x1="0" y1="0" x2="0" y2="7" stroke="#121212" stroke-opacity=".28" stroke-width="1.1"/></pattern>' +
    '<pattern id="' + hid + 'e" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="#e6e2d8"/><circle cx="2" cy="2" r=".9" fill="#121212" fill-opacity=".35"/><circle cx="6.5" cy="6" r=".7" fill="#121212" fill-opacity=".3"/></pattern>' +
    clips.map(c => '<clipPath id="' + c.id + '"><path d="' + pathD(c.pts.map(T), true, true) + '"/></clipPath>').join('') + '</defs>';
  return '<svg class="axo" viewBox="0 0 ' + VW + ' ' + VH + '" role="img" aria-label="' + (opts.label || 'Axonometric drawing') + '">' + defs + out + '</svg>';
}

/* ---------------------------------------------------------------- the four projects */
export function casaLumen() {
  const M = new Model();
  for (let i = 0; i < 4; i++) M.gline(Array.from({ length: 40 }, (_, k) => { const x = -19 + k * 1.0; return [x, 11.2 + i * 1.3 + Math.sin(k * 0.7 + i) * 0.22]; }), 'dt');
  const pl = M.box([-15, 0, -6.5], [13, 0.45, 6.5], {
    recv: true, deco: {
      py: [deco.rect(1.5, 2.2, 12, 5.6, 'sc', 'fw'), deco.rect(1.8, 2.5, 11.7, 5.3, 'dt'), deco.line([[3, 3.2], [5.4, 3.2]]), deco.line([[6, 4.2], [9.4, 4.2]]), deco.line([[4.2, 4.8], [6.0, 4.8]]),
      ...deco.vlines(-15, -9.4, 1, 3.6, 6.5)]
    }
  });
  M.box([-4, 0, 6.5], [0, 0.3, 7.0]); M.box([-4, 0, 7.0], [0, 0.15, 7.5]);
  M.box([-9, 0.45, -4], [5, 3.65, 3], { style: 'glass', on: pl, deco: { pz: [...deco.vlines(-9, 5, 1.4, 0.45, 3.65), deco.line([[-9, 3.12], [5, 3.12]]), deco.line([[-6.4, 1.2], [-5.6, 2.4]], 'rf'), deco.line([[-5.9, 1.0], [-5.3, 1.9]], 'rf')], nx: [...deco.vlines(-4, 3, 1.4, 0.45, 3.65)] } });
  for (const [x, z] of [[8, -3.4], [8, 2.6], [11.5, -3.4], [11.5, 2.6], [-12.6, -4.0], [-12.6, 3.0]]) M.box([x - 0.15, 0.45, z - 0.15], [x + 0.15, 3.65, z + 0.15], { on: pl });
  M.box([-13, 3.65, -4.4], [15.5, 3.95, 3.4], { on: pl });
  M.box([-4, 3.95, -3.6], [15.5, 7.15, 3.0], { on: pl, deco: { pz: [deco.rect(-2.5, 5, 14, 6.5, 'sc', 'fg'), ...deco.vlines(-2.5, 14, 1.5, 5, 6.5)], nx: [deco.rect(-1.6, 3.95, 0.3, 6.4, 'sc', 'fg')] } });
  M.box([-5, 7.15, -4.4], [16.5, 7.4, 3.8], { on: pl });
  M.box([-3, 7.4, -3.4], [2, 9.8, 0.2], { on: pl, style: 'glass', deco: { pz: deco.vlines(-3, 2, 1.25, 7.4, 9.8), nx: deco.vlines(-3.4, 0.2, 1.2, 7.4, 9.8) } });
  M.box([-3.5, 9.8, -3.8], [2.6, 10.0, 0.7], { on: pl });
  for (const z of [-3.3, 2.5]) { M.box([8.73, 7.4, z - 0.07], [8.87, 9.45, z + 0.07], { on: pl }); M.box([2.0, 9.45, z - 0.1], [9.0, 9.6, z + 0.1], { on: pl }); }
  for (let x = 2.6; x <= 8.75; x += 0.6) M.box([x - 0.04, 9.6, -3.5], [x + 0.04, 9.76, 2.7], { on: pl });
  for (let i = 0; i < 19; i++) M.box([-14.2, 0.45, 5.6 - (i + 1) * 0.28], [-13.0, 0.45 + (i + 1) * 0.175, 5.6 - i * 0.28], { on: pl, cast: i % 3 === 0 });
  M.box([-14.2, 0.45, -1.0], [-13.0, 3.95, 0.28], { on: pl });
  M.palm(-18.5, 0, 3.5, 8.5, [1.2, -0.4]); M.palm(16.5, 0, 8.5, 7.2, [-0.8, 0.6]); M.palm(-17.5, 0, -4.5, 9.4, [0.6, 0.8]);
  M.person(-8, 3.95, 1.6); M.person(6.4, 0.45, 1.2);
  M.dim([-15, 6.5], [16.5, 6.5], 2.6, '31 500');
  M.north(-19.5, 9.5, 1.2);
  return M;
}

export function longHouse() {
  const M = new Model();
  const A = M.box([-26, 0, -9], [-8, 2.4, 9], { recv: true, style: 'earth', deco: { py: [deco.wave(-26, -8, 4.6, 0.35, 6), deco.wave(-26, -8, 6.6, 0.3, 7), deco.wave(-26, -8, -6.5, 0.3, 6.5)] } });
  const B = M.box([-8, 0, -9], [10, 1.2, 9], { recv: true, style: 'earth', deco: { py: [deco.wave(-8, 10, 4.8, 0.3, 6), deco.wave(-8, 10, 7.0, 0.35, 7.5), deco.wave(-8, 10, -6.4, 0.3, 6)] } });
  const C = M.box([10, 0, -9], [26, 0.15, 9], { recv: true, deco: { py: [deco.wave(10, 26, 5.2, 0.3, 6), deco.wave(10, 26, 7.4, 0.3, 6.6), deco.wave(10, 26, -6.0, 0.3, 6)] } });
  const bar = (x0, x1, y, on, doorAt) => {
    const lv = deco.vlines(x0, x1, 0.4, y, y + 3.2).filter(l => Math.abs(l.pts[0][0] - doorAt) > 0.9);
    M.box([x0, y, -3], [x1, y + 3.2, 3], { on, deco: { pz: [...lv, deco.rect(doorAt - 0.8, y, doorAt + 0.8, y + 2.4, 'sc', 'fg'), deco.line([[x0, y + 0.3], [x1, y + 0.3]], 'sc')], nx: [deco.rect(-1.5, y + 0.9, 1.5, y + 2.6, 'sc', 'fg'), ...deco.vlines(-1.5, 1.5, 0.75, y + 0.9, y + 2.6)] } });
    M.wedge([x0, y + 3.2, -3.6], [x1, 0, 3.6], y + 3.45, y + 4.5, { on });
  };
  bar(-22, -8, 2.4, A, -15); bar(-8, 10, 1.2, B, 1); bar(10, 24, 0.15, C, 17);
  for (let x = -24; x <= -10; x += 2.2) { M.bush(x, 2.4, 5.4, 0.55); M.bush(x + 1.1, 2.4, 7.4, 0.55); }
  for (let x = -6; x <= 8; x += 2.2) { M.bush(x, 1.2, 5.6, 0.55); M.bush(x + 1.1, 1.2, 7.6, 0.55); }
  for (let x = 12; x <= 24; x += 2.2) { M.bush(x, 0.15, 5.8, 0.55); }
  M.tree(-25, 2.4, -7, 12, 1.6, { tall: true, on: A }); M.tree(-4, 1.2, -7.5, 13, 1.7, { tall: true, on: B }); M.tree(14, 0.15, -7.2, 11.5, 1.6, { tall: true, on: C }); M.tree(23.5, 0.15, 7.8, 10, 1.5, { tall: true, on: C });
  M.person(3.5, 1.2, 4.2);
  M.dim([-22, 3], [24, 3], 6.5, '46 000');
  M.north(-24, 11.5, 1.2);
  return M;
}

export function kilnPavilion() {
  const M = new Model();
  const pz = M.box([-14, 0, -10], [14, 0.2, 10], { recv: true, deco: { py: [...deco.vlines(-14, 14, 2, -10, 10), ...deco.hlines(-10, 10, 2, -14, 14)] } });
  M.prism(-6, -3, 2.2, 18, 0.2, 5.6, { courses: 0.45, door: 2.2, open: 0.72, on: pz });
  M.prism(1.2, -4.6, 2.8, 20, 0.2, 6.8, { courses: 0.45, door: 2.4, open: 0.75, on: pz });
  M.prism(7, 1.6, 2.0, 16, 0.2, 4.8, { courses: 0.45, door: 2.1, open: 0.7, on: pz });
  M.prism(-1.8, 4.2, 1.6, 14, 0.2, 3.7, { courses: 0.45, open: 0.66, on: pz });
  for (const x of [-11.6, 0, 11.6]) for (const z of [-7.6, 7.6]) M.box([x - 0.13, 0.2, z - 0.13], [x + 0.13, 7.4, z + 0.13], { on: pz });
  M.box([-12.6, 7.4, -8.6], [12.6, 7.62, 8.6], { style: 'ghost', cast: false, deco: { py: [...deco.vlines(-12.6, 12.6, 2.1, -8.6, 8.6), ...deco.hlines(-8.6, 8.6, 2.15, -12.6, 12.6)] } });
  M.tree(-12, 0.2, 8.6, 5.2, 2.2, { on: pz }); M.tree(12.4, 0.2, -8.4, 5.6, 2.4, { on: pz }); M.tree(11.8, 0.2, 8.8, 4.8, 2.0, { on: pz });
  M.person(-3.6, 0.2, 1.0); M.person(3.8, 0.2, 5.2);
  M.dim([-14, 10], [14, 10], 2.2, '28 000');
  M.north(-16.5, 13, 1.1);
  return M;
}

export function arcLibrary() {
  const M = new Model();
  const g = M.box([-31, 0, -14], [31, 0.3, 18], { recv: true, deco: { py: [...deco.hlines(10.4, 18, 1.5, -31, 31)] } });
  M.box([-25, 0.3, -10], [25, 4.8, 10], {
    on: g, deco: {
      pz: [deco.rect(-23, 0.9, 23, 4.2, 'sc', 'fg'), ...deco.vlines(-23, 23, 2, 0.9, 4.2), deco.rect(-2.2, 0.3, 2.2, 3.4, 'sc', 'fd')],
      nx: [...[-7, -3, 1, 5].map(z => deco.rect(z - 0.5, 1.2, z + 0.5, 4.0, 'sc', 'fg'))]
    }
  });
  for (let i = 0; i < 5; i++) M.vault(-20 + i * 10, 5, 4.8, -10, 10, 14, { lunette: true, on: g });
  M.box([-16, 0.3, 11.6], [16, 0.38, 14.6], { style: 'water', on: g, cast: false, deco: { py: [deco.line([[-12, 12.6], [-6, 12.6]]), deco.line([[2, 13.4], [9, 13.4]]), deco.line([[-4, 13.9], [0, 13.9]])] } });
  M.tree(-27.5, 0.3, 13.5, 8, 2.4, { on: g }); M.tree(27.5, 0.3, 13.8, 8.5, 2.5, { on: g }); M.tree(-27.8, 0.3, -11.5, 9, 2.6, { on: g }); M.tree(28, 0.3, -11.2, 8, 2.3, { on: g });
  M.person(-4.5, 0.3, 11.0); M.person(3.6, 0.3, 10.8); M.person(-20, 0.3, 15.8);
  M.dim([-25, 18], [25, 18], 1.6, '50 000');
  M.north(-29, 21.5, 1.4);
  return M;
}
