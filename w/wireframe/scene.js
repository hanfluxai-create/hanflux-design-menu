// Arcline Studio: procedural modernist house drawn with lines, exploded, then filled with light.
import * as THREE from 'three';

// Vertical lift per group when exploded (metres): site, pavilion, slab, upper, roof, roof room, stair, dims
const OFF = [0, 2.3, 4.9, 7.4, 10.3, 13.1, 2.3, 0];
const T_PROFILE = 0, T_SECOND = 1, T_GRID = 2, T_DIM = 3, T_DETAIL = 4;

/* ------------------------------------------------------------------ geometry builder */
class Draft {
  constructor() { this.segs = []; this.solid = []; this.glass = []; this.caster = []; }
  seg(a, b, t = T_PROFILE, g = 0, w = 1.6) { this.segs.push({ a, b, t, g, w, o: 0 }); }
  line(pts, t, g, w, closed) {
    for (let i = 0; i < pts.length - 1; i++) this.seg(pts[i], pts[i + 1], t, g, w);
    if (closed) this.seg(pts[pts.length - 1], pts[0], t, g, w);
  }
  face(pts, n, kind, g, cast = true) {
    const f = { pts, n, kind, g };
    (kind === 1 || kind === 4 ? this.glass : this.solid).push(f);
    if (cast && kind !== 1 && kind !== 3 && kind !== 4) this.caster.push(f);
  }
  box(x0, y0, z0, x1, y1, z1, o = {}) {
    const g = o.g ?? 0, t = o.t ?? T_PROFILE, w = o.w ?? 1.6;
    const c = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
    if (o.edges !== false) {
      const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
      E.forEach(([i, j]) => this.seg(c[i], c[j], t, g, w));
    }
    if (o.faces !== false) {
      const K = o.kinds || {}, d = o.kind ?? 0, skip = o.skip || '';
      const F = {
        ny: [[0, 1, 2, 3], [0, -1, 0]], py: [[4, 5, 6, 7], [0, 1, 0]], nz: [[0, 1, 5, 4], [0, 0, -1]],
        pz: [[3, 2, 6, 7], [0, 0, 1]], nx: [[0, 3, 7, 4], [-1, 0, 0]], px: [[1, 2, 6, 5], [1, 0, 0]]
      };
      for (const k in F) {
        if (skip.includes(k)) continue;
        this.face(F[k][0].map(i => c[i]), F[k][1], K[k] ?? d, g, o.cast !== false);
      }
    }
  }
}

function buildHouse() {
  const D = new Draft();
  // ---------- site grid (fades radially in the shader)
  for (let x = -24; x <= 24; x += 2) D.seg([x, 0, -18], [x, 0, 18], T_GRID, 0, x % 10 === 0 ? 1.1 : 0.75);
  for (let z = -18; z <= 18; z += 2) D.seg([-24, 0, z], [24, 0, z], T_GRID, 0, z % 10 === 0 ? 1.1 : 0.75);

  // ---------- 00 plinth, steps, pool
  D.box(-15, 0, -6.5, 13, 0.45, 6.5, { g: 0, w: 1.8 });
  D.box(-4, 0, 6.5, 0, 0.3, 7.0, { g: 0, w: 1.0, t: T_SECOND });
  D.box(-4, 0, 7.0, 0, 0.15, 7.5, { g: 0, w: 1.0, t: T_SECOND });
  const wy = 0.455;
  D.line([[1.5, wy, 2.2], [12, wy, 2.2], [12, wy, 5.6], [1.5, wy, 5.6]], T_SECOND, 0, 1.1, true);
  D.line([[1.8, wy, 2.5], [11.7, wy, 2.5], [11.7, wy, 5.3], [1.8, wy, 5.3]], T_DETAIL, 0, 0.75, true);
  [[3.0, 3.1, 2.4], [5.6, 3.9, 3.2], [8.4, 4.7, 2.0], [4.2, 4.6, 1.2]].forEach(([x, z, l]) => D.seg([x, wy, z], [x + l, wy, z], T_DETAIL, 0, 0.75));
  D.face([[1.8, wy, 2.5], [11.7, wy, 2.5], [11.7, wy, 5.3], [1.8, wy, 5.3]], [0, 1, 0], 3, 0);
  // paving joints on the plinth, west terrace
  for (let x = -14; x <= -10; x += 1) D.seg([x, 0.452, 3.6], [x, 0.452, 6.5], T_DETAIL, 0, 0.6);

  // ---------- 01 glass pavilion, core, pilotis
  const y0 = 0.45, y1 = 3.65;
  D.box(-9, y0, -4, 5, y1, 3, { g: 1, w: 1.6, kinds: { pz: 1, nx: 1, px: 1 }, skip: 'nypy' });
  for (let x = -9 + 1.4; x < 4.99; x += 1.4) D.seg([x, y0, 3], [x, y1, 3], T_DETAIL, 1, 0.85);
  for (let z = -4 + 1.4; z < 2.99; z += 1.4) { D.seg([-9, y0, z], [-9, y1, z], T_DETAIL, 1, 0.85); D.seg([5, y0, z], [5, y1, z], T_DETAIL, 1, 0.85); }
  D.seg([-9, 3.12, 3], [5, 3.12, 3], T_DETAIL, 1, 0.75);
  D.seg([-9, 3.12, -4], [-9, 3.12, 3], T_DETAIL, 1, 0.75);
  D.seg([5, 3.12, -4], [5, 3.12, 3], T_DETAIL, 1, 0.75);
  D.box(-8.6, y0, -3.7, -5.2, y1 - 0.02, -2.2, { g: 1, t: T_SECOND, w: 1.1 });   // stone core
  D.box(0.4, y0, -1.4, 0.75, 2.5, 1.2, { g: 1, t: T_SECOND, w: 1.0 });            // fireplace wall
  for (const [x, z] of [[8, -3.4], [8, 2.6], [11.5, -3.4], [11.5, 2.6], [-12.6, -4.0], [-12.6, 3.0]]) {
    D.box(x - 0.15, y0, z - 0.15, x + 0.15, y1, z + 0.15, { g: 1, w: 1.15, t: T_SECOND });
  }

  // ---------- 02 slab and terrace balustrade
  D.box(-13, 3.65, -4.4, 15.5, 3.95, 3.4, { g: 2, w: 1.8 });
  const by = 3.95, bh = 1.05;
  const rail = (a, b, n, g, t) => {
    D.seg([a[0], by + bh, a[1]], [b[0], by + bh, b[1]], T_SECOND, g, 0.9);
    D.seg([a[0], by, a[1]], [a[0], by + bh, a[1]], T_DETAIL, g, 0.8);
    D.seg([b[0], by, b[1]], [b[0], by + bh, b[1]], T_DETAIL, g, 0.8);
    D.face([[a[0], by, a[1]], [b[0], by, b[1]], [b[0], by + bh, b[1]], [a[0], by + bh, a[1]]], n, 4, g);
  };
  rail([-12.9, 3.3], [-4, 3.3], [0, 0, 1], 2);
  rail([-12.9, -4.3], [-12.9, -1.0], [-1, 0, 0], 2);
  rail([-12.9, 0.28], [-12.9, 3.3], [-1, 0, 0], 2);

  // ---------- 03 upper volume, ribbon window, glazed end
  const u0 = 3.95, u1 = 7.15;
  D.box(-4, u0, -3.6, 15.5, u1, 3.0, { g: 3, w: 1.9, kinds: { px: 1 }, skip: 'ny' });
  const zf = 3.012;
  D.line([[-2.5, 5, zf], [14, 5, zf], [14, 6.5, zf], [-2.5, 6.5, zf]], T_SECOND, 3, 1.1, true);
  for (let x = -1; x < 13.99; x += 1.5) D.seg([x, 5, zf], [x, 6.5, zf], T_DETAIL, 3, 0.8);
  D.face([[-2.5, 5, zf], [14, 5, zf], [14, 6.5, zf], [-2.5, 6.5, zf]], [0, 0, 1], 1, 3);
  for (let z = -3.6 + 1.1; z < 2.99; z += 1.1) D.seg([15.5, u0, z], [15.5, u1, z], T_DETAIL, 3, 0.8);
  D.seg([15.5, 6.35, -3.6], [15.5, 6.35, 3.0], T_DETAIL, 3, 0.75);
  const xd = -4.012;
  D.line([[xd, u0, -1.6], [xd, 6.4, -1.6], [xd, 6.4, 0.3], [xd, u0, 0.3]], T_SECOND, 3, 1.0, false);
  D.face([[xd, u0, -1.6], [xd, u0, 0.3], [xd, 6.4, 0.3], [xd, 6.4, -1.6]], [-1, 0, 0], 1, 3);

  // ---------- 04 roof plate with roof terrace rail
  D.box(-5, 7.15, -4.4, 16.5, 7.4, 3.8, { g: 4, w: 1.9 });
  D.seg([-5, 7.21, 3.8], [16.5, 7.21, 3.8], T_DETAIL, 4, 0.65);
  D.seg([16.5, 7.21, -4.4], [16.5, 7.21, 3.8], T_DETAIL, 4, 0.65);
  const ry = 7.4;
  D.seg([2.6, ry + 1.05, 3.65], [16.35, ry + 1.05, 3.65], T_SECOND, 4, 0.85);
  D.seg([16.35, ry + 1.05, -4.25], [16.35, ry + 1.05, 3.65], T_SECOND, 4, 0.85);
  for (let x = 2.6; x <= 16.36; x += 2.75) D.seg([x, ry, 3.65], [x, ry + 1.05, 3.65], T_DETAIL, 4, 0.7);
  for (let z = -4.25; z <= 3.66; z += 2.6) D.seg([16.35, ry, z], [16.35, ry + 1.05, z], T_DETAIL, 4, 0.7);
  D.face([[2.6, ry, 3.65], [16.35, ry, 3.65], [16.35, ry + 1.05, 3.65], [2.6, ry + 1.05, 3.65]], [0, 0, 1], 4, 4);
  D.face([[16.35, ry, -4.25], [16.35, ry, 3.65], [16.35, ry + 1.05, 3.65], [16.35, ry + 1.05, -4.25]], [1, 0, 0], 4, 4);

  // ---------- 05 roof pavilion and pergola
  D.box(-3, 7.4, -3.4, 2, 9.8, 0.2, { g: 5, w: 1.6, kinds: { pz: 1, px: 1 }, skip: 'ny' });
  for (let x = -3 + 1.25; x < 1.99; x += 1.25) D.seg([x, 7.4, 0.2], [x, 9.8, 0.2], T_DETAIL, 5, 0.8);
  for (let z = -3.4 + 1.2; z < 0.19; z += 1.2) D.seg([2, 7.4, z], [2, 9.8, z], T_DETAIL, 5, 0.8);
  D.box(-3.5, 9.8, -3.8, 2.6, 10.0, 0.7, { g: 5, w: 1.6 });
  for (const z of [-3.3, 2.5]) {
    D.box(8.73, 7.4, z - 0.07, 8.87, 9.45, z + 0.07, { g: 5, w: 0.9, t: T_SECOND });
    D.box(2.0, 9.45, z - 0.1, 9.0, 9.6, z + 0.1, { g: 5, w: 1.0, t: T_SECOND });
  }
  for (let x = 2.6; x <= 8.75; x += 0.6) D.box(x - 0.04, 9.6, -3.5, x + 0.04, 9.76, 2.7, { g: 5, w: 0.7, t: T_DETAIL });

  // ---------- 06 steel stair to the terrace (20 risers at 175 mm)
  const sx0 = -14.2, sx1 = -13.0, rh = 0.175, tg = 0.28, zb = 5.6;
  for (let i = 0; i < 20; i++) {
    const yA = 0.45 + i * rh, yB = yA + rh, z = zb - i * tg;
    D.seg([sx0, yA, z], [sx0, yB, z], T_SECOND, 6, 1.0);
    D.seg([sx1, yA, z], [sx1, yB, z], T_DETAIL, 6, 0.7);
    D.face([[sx0, yA, z], [sx1, yA, z], [sx1, yB, z], [sx0, yB, z]], [0, 0, 1], 0, 6);
    if (i < 19) {
      D.seg([sx0, yB, z], [sx0, yB, z - tg], T_SECOND, 6, 1.0);
      D.seg([sx1, yB, z], [sx1, yB, z - tg], T_DETAIL, 6, 0.7);
      D.seg([sx0, yB, z], [sx1, yB, z], T_DETAIL, 6, 0.75);
      D.face([[sx0, yB, z], [sx1, yB, z], [sx1, yB, z - tg], [sx0, yB, z - tg]], [0, 1, 0], 0, 6);
    }
  }
  D.seg([sx0, 0.45, zb - 0.55], [sx0, 3.62, 0.28], T_SECOND, 6, 1.0);
  D.seg([sx1, 0.45, zb - 0.55], [sx1, 3.62, 0.28], T_DETAIL, 6, 0.7);
  D.line([[sx0 - 0.05, 1.35, zb], [sx0 - 0.05, 4.85, 0.28], [sx0 - 0.05, 4.85, -1.0]], T_SECOND, 6, 0.9);
  for (let i = 0; i < 20; i += 4) {
    const z = zb - i * tg - tg * 0.5, y = 0.45 + (i + 1) * rh;
    D.seg([sx0 - 0.05, y, z], [sx0 - 0.05, y + 0.9, z], T_DETAIL, 6, 0.7);
  }
  D.box(sx0, 3.65, -1.0, sx1, 3.95, 0.28, { g: 6, w: 1.1, t: T_SECOND });

  // ---------- 07 dimensions (orange)
  const dz = 10.2;
  D.seg([-15, 0, dz], [16.5, 0, dz], T_DIM, 7, 1.0);
  const tick = (x, z) => D.seg([x - 0.32, 0, z + 0.32], [x + 0.32, 0, z - 0.32], T_DIM, 7, 1.5);
  for (const x of [-15, -13, -9, 5, 11.5, 15.5, 16.5]) { tick(x, dz); D.seg([x, 0, dz + 0.55], [x, 0, 7.3], T_DIM, 7, 0.65); }
  const dz2 = 8.6;
  D.seg([11.5, 0, dz2], [15.5, 0, dz2], T_DIM, 7, 1.0); tick(11.5, dz2); tick(15.5, dz2);
  const vx = 19.6, vz = 3.6;
  D.seg([vx, 0, vz], [vx, 10.0, vz], T_DIM, 7, 1.0);
  for (const y of [0, 0.45, 3.95, 7.4, 10.0]) {
    D.seg([vx - 0.3, y - 0.3, vz], [vx + 0.3, y + 0.3, vz], T_DIM, 7, 1.5);
    D.seg([17.1, y, vz], [vx + 0.6, y, vz], T_DIM, 7, 0.65);
  }
  // north point
  const nx = -20, nz = 8.2, nr = 1.25, pts = [];
  for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2; pts.push([nx + Math.cos(a) * nr, 0, nz + Math.sin(a) * nr]); }
  D.line(pts, T_DIM, 7, 0.9);
  D.line([[nx - 0.55, 0, nz + 0.75], [nx, 0, nz - 1.6], [nx + 0.55, 0, nz + 0.75]], T_DIM, 7, 1.2);
  D.seg([nx, 0, nz + 1.6], [nx, 0, nz - 1.6], T_DIM, 7, 0.7);
  return D;
}

function assignOrder(segs) {
  const W = { 0: [0.06, 0.34], 1: [0.22, 0.54], 2: [0.36, 0.58], 3: [0.46, 0.76], 4: [0.6, 0.84], 5: [0.68, 0.92], 6: [0.42, 0.72], 7: [0.74, 0.99] };
  for (const s of segs) {
    let w = s.t === T_GRID ? [0, 0.17] : (s.t === T_DIM ? [0.74, 0.99] : W[s.g]);
    if (s.t === T_DETAIL) w = [w[0] + 0.08, Math.min(1, w[1] + 0.08)];
    const mx = (s.a[0] + s.b[0]) * 0.5, my = (s.a[1] + s.b[1]) * 0.5;
    const u = Math.min(1, Math.max(0, (mx + 24) / 48 * 0.75 + my / 11 * 0.25));
    s.o = w[0] + (w[1] - w[0]) * (u * 0.82 + Math.random() * 0.18);
  }
}

/* ------------------------------------------------------------------ GPU buffers */
function lineGeometry(segs) {
  const n = segs.length, g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0], 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  const S = new Float32Array(n * 3), E = new Float32Array(n * 3), I = new Float32Array(n * 4), R = new Float32Array(n);
  segs.forEach((s, i) => { S.set(s.a, i * 3); E.set(s.b, i * 3); I.set([s.o, s.w, s.t, s.g], i * 4); R[i] = (i * 7.31) % 97.0 + 1.0; });
  g.setAttribute('aStart', new THREE.InstancedBufferAttribute(S, 3));
  g.setAttribute('aEnd', new THREE.InstancedBufferAttribute(E, 3));
  g.setAttribute('aInfo', new THREE.InstancedBufferAttribute(I, 4));
  g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(R, 1));
  g.instanceCount = n;
  return g;
}

function faceGeometry(faces) {
  const pos = [], nor = [], kg = [];
  for (const f of faces) {
    const [a, b, c, d] = f.pts;
    for (const p of [a, b, c, a, c, d]) { pos.push(p[0], p[1], p[2]); nor.push(f.n[0], f.n[1], f.n[2]); kg.push(f.kind, f.g); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('aKG', new THREE.Float32BufferAttribute(kg, 2));
  return g;
}

/* ------------------------------------------------------------------ shaders */
const LINE_VS = /* glsl */`
attribute vec3 aStart; attribute vec3 aEnd; attribute vec4 aInfo; attribute float aSeed;
uniform vec2 uRes; uniform float uPx; uniform float uDraw; uniform float uExplode; uniform float uOffsets[8];
uniform float uSketch; uniform float uSeedPass;
varying float vAlong; varying float vSide; varying float vHW; varying float vLen; varying float vLocal; varying float vType; varying vec3 vWorld;
float h1(float n){ return fract(sin(n) * 43758.5453123); }
void main(){
  float off = uOffsets[int(aInfo.w + 0.5)] * uExplode;
  vec3 s = aStart; vec3 e = aEnd; s.y += off; e.y += off;
  if (uSketch > 0.001 && aInfo.z != 2.0 && aInfo.z != 3.0) {
    vec3 d3 = e - s; float L = length(d3); vec3 dn = d3 / max(L, 1e-4);
    float r1 = h1(aSeed * 1.37 + uSeedPass * 3.1), r2 = h1(aSeed * 2.71 + uSeedPass * 5.3);
    float ov = uSketch * (0.18 + 0.62 * r1) * clamp(L * 0.22, 0.25, 1.0);
    s -= dn * ov * (0.45 + r2); e += dn * ov * (0.45 + r1);
    vec3 j = vec3(h1(aSeed + uSeedPass * 7.0), h1(aSeed * 3.0 + uSeedPass * 11.0), h1(aSeed * 5.0 + uSeedPass * 13.0)) - 0.5;
    s += j * 0.2 * uSketch; e += j.zxy * 0.2 * uSketch;
  }
  vec4 cs = projectionMatrix * viewMatrix * vec4(s, 1.0);
  vec4 ce = projectionMatrix * viewMatrix * vec4(e, 1.0);
  vec2 hs = 0.5 * uRes;
  vec2 ps = cs.xy / cs.w * hs, pe = ce.xy / ce.w * hs;
  vec2 d = pe - ps; float len = length(d);
  vec2 dir = len > 1e-5 ? d / len : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x);
  float hw = 0.5 * aInfo.y * uPx;
  float qw = hw + 1.0;
  float endS = position.y < 0.5 ? -1.0 : 1.0;
  vec4 c = position.y < 0.5 ? cs : ce;
  vec2 offPx = nrm * position.x * qw + dir * endS * hw;
  c.xy += offPx / hs * c.w;
  gl_Position = c;
  vAlong = position.y < 0.5 ? -hw : len + hw;
  vSide = position.x * qw; vHW = hw; vLen = len;
  float dur = 0.15;
  vLocal = clamp((uDraw - aInfo.x * (1.0 - dur)) / dur, 0.0, 1.0);
  vType = aInfo.z;
  vWorld = position.y < 0.5 ? s : e;
}`;

const LINE_FS = /* glsl */`
uniform vec3 uInk; uniform vec3 uGridC; uniform vec3 uDimC; uniform vec3 uTipC; uniform vec3 uSketchC;
uniform float uLineA; uniform float uGridA; uniform float uDimA; uniform float uDetailA;
uniform float uHidden; uniform float uHiddenA; uniform float uDash; uniform float uSketch; uniform float uPx; uniform float uPassA;
varying float vAlong; varying float vSide; varying float vHW; varying float vLen; varying float vLocal; varying float vType; varying vec3 vWorld;
void main(){
  float lim = vLocal * vLen;
  if (vLocal < 0.999 && vAlong > lim) discard;
  float t = vType;
  vec3 col = uInk; float a = uLineA;
  if (t > 1.5 && t < 2.5) {
    if (uHidden > 0.5) discard;
    col = uGridC;
    a = uGridA * (1.0 - smoothstep(9.0, 23.0, length(vWorld.xz - vec2(0.5, 1.0))));
  } else if (t > 2.5 && t < 3.5) { col = uDimC; a = uDimA; }
  else if (t > 3.5) { a *= uDetailA; }
  if (t < 1.5 || t > 3.5) col = mix(col, uSketchC, uSketch);
  float tip = (1.0 - step(0.999, vLocal)) * smoothstep(lim - 34.0 * uPx, lim, vAlong);
  col = mix(col, uTipC, tip);
  a *= clamp(vHW + 0.5 - abs(vSide), 0.0, 1.0);
  if (uHidden > 0.5) {
    a *= uHiddenA;
    if (uDash > 0.5 && mod(vAlong, 8.0 * uPx) > 4.2 * uPx) discard;
  }
  a *= uPassA;
  if (a < 0.004) discard;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`;

const FACE_VS = /* glsl */`
attribute vec2 aKG; uniform float uExplode; uniform float uOffsets[8];
varying vec3 vN; varying vec3 vW; varying float vK;
void main(){
  vec3 p = position; p.y += uOffsets[int(aKG.y + 0.5)] * uExplode;
  vW = p; vN = normal; vK = aKG.x;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;

const FACE_FS = /* glsl */`
uniform vec3 uPaper; uniform vec3 uCard; uniform vec3 uWater; uniform vec3 uSun; uniform float uFill; uniform float uGlow;
varying vec3 vN; varying vec3 vW; varying float vK;
void main(){
  vec3 n = normalize(vN);
  float ndl = clamp(dot(n, uSun), 0.0, 1.0);
  float top = smoothstep(0.5, 0.9, n.y);
  float lit = mix(0.79, 1.0, ndl);
  lit = mix(lit, 1.015, top * 0.7);
  vec3 c = uCard * lit;
  c = mix(c, c * vec3(1.025, 0.985, 0.93), uGlow * ndl * 0.9);
  float ao = smoothstep(0.0, 1.3, vW.y - 0.45);
  c *= mix(1.0, mix(0.93, 1.0, ao), 1.0 - top);
  if (vK > 2.5) c = mix(uWater, uWater * 1.04, smoothstep(2.4, 5.4, vW.z));
  gl_FragColor = vec4(mix(uPaper, c, uFill), 1.0);
  #include <colorspace_fragment>
}`;

const GLASS_FS = /* glsl */`
uniform vec3 uGlassC; uniform vec3 uWarmLo; uniform vec3 uWarmHi; uniform float uFill; uniform float uGlow; uniform float uTime;
varying vec3 vN; varying vec3 vW; varying float vK;
void main(){
  float band = fract((vW.y - 0.45) / 3.5);
  float pool = 0.5 + 0.5 * sin(vW.x * 0.55 + vW.z * 0.4 + 1.3) * sin(vW.x * 0.21 - 0.7);
  vec3 warm = mix(uWarmLo, uWarmHi, smoothstep(0.05, 0.95, band) * 0.85);
  warm = mix(warm, uWarmLo * 1.04, pool * 0.35);
  vec3 col = mix(uGlassC, warm, uGlow);
  float a = 0.26 * uFill * (1.0 - uGlow) + 0.86 * uGlow;
  if (vK > 3.5) { col = mix(uGlassC, vec3(0.86, 0.9, 0.92), 0.5); a = 0.2 * max(uFill, uGlow); }
  if (a < 0.003) discard;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`;

const SHADOW_VS = /* glsl */`
attribute vec2 aKG; uniform float uExplode; uniform float uOffsets[8]; uniform vec3 uDir; uniform float uPlane;
varying vec2 vXZ;
void main(){
  vec3 p = position; p.y += uOffsets[int(aKG.y + 0.5)] * uExplode;
  vec3 q = p - uDir * ((p.y - uPlane) / uDir.y);
  q.y = uPlane + 0.012;
  vXZ = q.xz;
  gl_Position = projectionMatrix * viewMatrix * vec4(q, 1.0);
}`;

const SHADOW_FS = /* glsl */`
uniform float uShadow; uniform vec3 uShadowC; uniform float uInside;
varying vec2 vXZ;
void main(){
  float inPl = step(-15.0, vXZ.x) * step(vXZ.x, 13.0) * step(-6.5, vXZ.y) * step(vXZ.y, 6.5);
  if (uInside > 0.5 && inPl < 0.5) discard;
  if (uInside < 0.5 && inPl > 0.5) discard;
  float a = uShadow * 0.14;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uShadowC, a);
  #include <colorspace_fragment>
}`;

/* ------------------------------------------------------------------ states */
// Every state lists the same keys; scroll blends between them.
const base = {
  explode: 0, fill: 0, glow: 0, shadow: 0, sketch: 0, detail: 1, dims: 1, grid: 1, hiddenA: 0.16, dash: 1, lineA: 1,
  az: -0.62, el: 0.5, zoom: 0.86, tx: 0.8, ty: 4.2, tz: 0, fx: 0.64, fy: 0.42, orbit: 1,
  Ldims: 0, Lplates: 0, Ldetail: 0
};
const S = (o) => Object.assign({}, base, o);

function makeStates(mobile) {
  const m = mobile;
  const H0 = S({ Ldims: 1, az: 0.56, el: 0.47, hiddenA: 0.13, fx: m ? 0.5 : 0.64, fy: m ? 0.31 : 0.37, zoom: m ? 1.0 : 1.02 });
  const H1 = S({ explode: 1, dims: 0, grid: 0.55, hiddenA: 0.1, az: -0.72, el: 0.6, zoom: m ? 1.28 : 1.32, ty: 9.0, fx: m ? 0.44 : 0.56, fy: m ? 0.31 : 0.5, Lplates: 1, orbit: 0.45 });
  const H2 = S({ fill: 1, glow: 1, shadow: 1, dims: 0, grid: 0.45, hiddenA: 0, lineA: 0.72, az: 0.5, el: 0.4, zoom: m ? 1.0 : 1.02, fx: m ? 0.5 : 0.65, fy: m ? 0.31 : 0.39, orbit: 0.6 });
  const P0 = S({ sketch: 1, detail: 0, dims: 0, grid: 0.3, hiddenA: 0.85, dash: 0, lineA: 0.9, az: -0.95, el: 0.42, zoom: m ? 1.02 : 1.0, fx: m ? 0.5 : 0.67, fy: m ? 0.3 : 0.48, orbit: 0.6 });
  const P1 = S({ fill: 1, glow: 0, shadow: 0.55, detail: 0.35, dims: 0, grid: 0.4, hiddenA: 0, lineA: 0.95, az: -0.52, el: 0.56, zoom: m ? 1.02 : 0.98, fx: m ? 0.5 : 0.67, fy: m ? 0.3 : 0.5, orbit: 0.6 });
  const P2 = S({ fill: 0.5, detail: 1, dims: 1, hiddenA: 0.18, az: 0.5, el: 0.24, zoom: m ? 0.72 : 0.64, tx: 10.5, ty: 4.4, tz: 1.8, fx: m ? 0.5 : 0.69, fy: m ? 0.3 : 0.5, Ldetail: 1, orbit: 0.35 });
  const P3 = S({ fill: 1, glow: 1, shadow: 1, dims: 0, grid: 0.5, hiddenA: 0, lineA: 0.72, az: 0.36, el: 0.36, zoom: m ? 1.0 : 0.94, fx: m ? 0.5 : 0.67, fy: m ? 0.3 : 0.5, orbit: 0.7 });
  return {
    hero: [[0, H0], [0.07, H0], [0.36, H1], [0.5, H1], [0.8, H2], [1, H2]],
    process: [[0, P0], [0.14, P0], [0.3, P1], [0.42, P1], [0.58, P2], [0.7, P2], [0.86, P3], [1, P3]]
  };
}

const smooth = (t) => t * t * (3 - 2 * t);
function sample(keys, p, out) {
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1][0]) i++;
  const [p0, a] = keys[i], [p1, b] = keys[i + 1];
  const t = smooth(Math.min(1, Math.max(0, (p - p0) / Math.max(1e-6, p1 - p0))));
  for (const k in a) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

/* ------------------------------------------------------------------ labels projected from 3D */
const LABELS = [
  { set: 'Ldims', g: 7, p: [0.75, 0, 10.2], html: '<b>31 500</b>', cls: 'lb-dim' },
  { set: 'Ldims', g: 7, p: [13.5, 0, 8.6], html: '<b>4 000</b> cantilever', cls: 'lb-dim' },
  { set: 'Ldims', g: 7, p: [19.6, 10.0, 3.6], html: '+10.00', cls: 'lb-lvl' },
  { set: 'Ldims', g: 7, p: [19.6, 7.4, 3.6], html: '+7.40', cls: 'lb-lvl' },
  { set: 'Ldims', g: 7, p: [19.6, 3.95, 3.6], html: '+3.95', cls: 'lb-lvl' },
  { set: 'Ldims', g: 7, p: [19.6, 0.45, 3.6], html: '+0.45', cls: 'lb-lvl' },
  { set: 'Ldims', g: 7, p: [-20, 0, 6.4], html: 'N', cls: 'lb-n' },
  { set: 'Lplates', g: 5, p: [9.0, 9.7, 2.6], html: '<b>05</b><span>Roof room and pergola</span>', cls: 'lb-plate' },
  { set: 'Lplates', g: 4, p: [16.5, 7.3, 3.8], html: '<b>04</b><span>Roof plate, 250 CLT</span>', cls: 'lb-plate' },
  { set: 'Lplates', g: 3, p: [15.5, 5.6, 3.0], html: '<b>03</b><span>Upper volume, lime plaster</span>', cls: 'lb-plate' },
  { set: 'Lplates', g: 2, p: [15.5, 3.8, 3.4], html: '<b>02</b><span>Slab, 300 post-tensioned</span>', cls: 'lb-plate' },
  { set: 'Lplates', g: 1, p: [11.65, 2.2, 2.75], html: '<b>01</b><span>Glass pavilion and pilotis</span>', cls: 'lb-plate' },
  { set: 'Lplates', g: 0, p: [13, 0.3, 6.5], html: '<b>00</b><span>Laterite plinth and pool</span>', cls: 'lb-plate' },
  { set: 'Ldetail', g: 3, p: [15.5, 3.95, 3.0], html: '<b>4.0 m</b> cantilever on steel flitch beams', cls: 'lb-note' },
  { set: 'Ldetail', g: 3, p: [11.0, 6.5, 3.0], html: 'Ribbon window, <b>1 500</b> bays', cls: 'lb-note' },
  { set: 'Ldetail', g: 1, p: [11.5, 1.6, 2.75], html: 'Pilotis <b>300 × 300</b>, fair-faced concrete', cls: 'lb-note' },
  { set: 'Ldetail', g: 4, p: [16.5, 7.4, -0.5], html: 'Roof plate <b>250</b>, 1 000 overhang', cls: 'lb-note' }
];

/* ------------------------------------------------------------------ main */
export function initScene(canvas, opts) {
  const mobile = opts.mobile, lite = opts.lite;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, stencil: true, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(new THREE.Color('#f1f0ec'), 1);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(18, 1, 1, 400);

  const D = buildHouse();
  assignOrder(D.segs);

  const C = (h) => new THREE.Color(h);
  const offsets = { value: OFF.slice() };
  const U = {
    uRes: { value: new THREE.Vector2(1, 1) }, uPx: { value: dpr }, uDraw: { value: opts.instant ? 1 : 0 },
    uExplode: { value: 0 }, uOffsets: offsets, uSketch: { value: 0 },
    uInk: { value: C('#121212') }, uGridC: { value: C('#9a9a94') }, uDimC: { value: C('#ff4d00') }, uTipC: { value: C('#ff4d00') }, uSketchC: { value: C('#5d5c57') },
    uLineA: { value: 1 }, uGridA: { value: 1 }, uDimA: { value: 1 }, uDetailA: { value: 1 }, uHiddenA: { value: 0.16 }, uDash: { value: 1 }
  };
  const lineMat = (extra, cfg) => new THREE.ShaderMaterial({
    uniforms: Object.assign({}, U, extra), vertexShader: LINE_VS, fragmentShader: LINE_FS,
    transparent: true, side: THREE.DoubleSide, ...cfg
  });
  const lg = lineGeometry(D.segs);
  const hiddenLines = new THREE.Mesh(lg, lineMat({ uHidden: { value: 1 }, uSeedPass: { value: 0 }, uPassA: { value: 1 } }, { depthWrite: false, depthFunc: THREE.GreaterDepth }));
  const visLines = new THREE.Mesh(lg, lineMat({ uHidden: { value: 0 }, uSeedPass: { value: 0 }, uPassA: { value: 1 } }, { depthWrite: true }));
  const sketchLines = new THREE.Mesh(lg, lineMat({ uHidden: { value: 0 }, uSeedPass: { value: 1 }, uPassA: { value: 0 } }, { depthWrite: false, depthTest: false }));

  const FU = {
    uExplode: U.uExplode, uOffsets: offsets, uPaper: { value: C('#f1f0ec') }, uCard: { value: C('#fbfaf6') }, uWater: { value: C('#d9dcd6') },
    uSun: { value: new THREE.Vector3(-0.55, 0.78, 0.42).normalize() }, uFill: { value: 0 }, uGlow: { value: 0 },
    uGlassC: { value: C('#c9cdcb') }, uWarmLo: { value: C('#ffc48a') }, uWarmHi: { value: C('#ff7a2c') }, uTime: { value: 0 }
  };
  const solid = new THREE.Mesh(faceGeometry(D.solid), new THREE.ShaderMaterial({
    uniforms: FU, vertexShader: FACE_VS, fragmentShader: FACE_FS, side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: 1.2, polygonOffsetUnits: 2
  }));
  const glass = new THREE.Mesh(faceGeometry(D.glass), new THREE.ShaderMaterial({
    uniforms: FU, vertexShader: FACE_VS, fragmentShader: GLASS_FS, side: THREE.DoubleSide, transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: 1.2, polygonOffsetUnits: 3
  }));
  const SU = { uExplode: U.uExplode, uOffsets: offsets, uDir: { value: new THREE.Vector3(0.62, -0.78, -0.3).normalize() }, uShadow: { value: 0 }, uShadowC: { value: C('#2a2620') } };
  const shadowMat = (plane, inside) => {
    const m = new THREE.ShaderMaterial({
      uniforms: Object.assign({}, SU, { uPlane: { value: plane }, uInside: { value: inside } }),
      vertexShader: SHADOW_VS, fragmentShader: SHADOW_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide
    });
    m.stencilWrite = true; m.stencilRef = 1; m.stencilFunc = THREE.NotEqualStencilFunc; m.stencilZPass = THREE.ReplaceStencilOp;
    return m;
  };
  const casterAll = faceGeometry(D.caster);
  const casterUp = faceGeometry(D.caster.filter(f => f.g !== 0));
  const shadowGround = new THREE.Mesh(casterAll, shadowMat(0.0, 0));
  const shadowPlinth = new THREE.Mesh(casterUp, shadowMat(0.47, 1));

  [solid, shadowGround, shadowPlinth, hiddenLines, visLines, glass, sketchLines].forEach((m, i) => { m.renderOrder = i; m.frustumCulled = false; scene.add(m); });

  // labels
  const lblRoot = opts.labelRoot;
  const labels = LABELS.map(L => {
    const el = document.createElement('div');
    el.className = 'lb ' + L.cls;
    el.innerHTML = '<div class="lb-in">' + L.html + '</div>';
    lblRoot.appendChild(el);
    return Object.assign({ el, v: new THREE.Vector3(), shown: -1 }, L);
  });

  const states = makeStates(mobile);
  const cur = Object.assign({}, states.hero[0][1]);
  const tgt = Object.assign({}, cur);
  let W = 1, H = 1, baseD = 100;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!mobile && !opts.embed) {
    window.addEventListener('pointermove', (e) => { ptr.tx = (e.clientX / W) * 2 - 1; ptr.ty = (e.clientY / H) * 2 - 1; }, { passive: true });
  }

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setSize(W, H, false);
    const v = new THREE.Vector2(); renderer.getDrawingBufferSize(v); U.uRes.value.copy(v);
    cam.aspect = W / H;
    const vf = THREE.MathUtils.degToRad(cam.fov);
    const hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect);
    baseD = 18.5 / Math.sin(Math.min(vf, hf) / 2);
  }
  resize();
  window.addEventListener('resize', resize);

  let drawStart = performance.now() + 150;
  const DRAW_MS = opts.instant ? 1 : 2900;
  let lastMode = 'none', snap = true, first = true, last = performance.now(), clock = 0;
  const tmp = {};

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now; clock += dt;
    const m = opts.getMode();
    if (m.mode === 'none') { snap = true; lastMode = 'none'; return; }
    if (m.mode !== lastMode) snap = true;
    lastMode = m.mode;
    sample(states[m.mode], m.p, tgt);
    if (snap) { Object.assign(cur, tgt); snap = false; }
    else { const k = 1 - Math.exp(-dt * 5.5); for (const key in tgt) cur[key] += (tgt[key] - cur[key]) * k; }

    const dp = Math.min(1, Math.max(0, (now - drawStart) / DRAW_MS));
    U.uDraw.value = dp < 1 ? dp * dp * (3 - 2 * dp) * 1.0 : 1;
    U.uExplode.value = cur.explode;
    U.uSketch.value = cur.sketch;
    U.uLineA.value = cur.lineA; U.uGridA.value = cur.grid; U.uDimA.value = cur.dims; U.uDetailA.value = cur.detail;
    U.uHiddenA.value = cur.hiddenA; U.uDash.value = cur.dash > 0.5 ? 1 : 0;
    sketchLines.material.uniforms.uPassA.value = cur.sketch * 0.42;
    sketchLines.visible = cur.sketch > 0.02;
    FU.uFill.value = cur.fill; FU.uGlow.value = cur.glow; FU.uTime.value = clock;
    SU.uShadow.value = cur.shadow * (1 - cur.explode);
    shadowGround.visible = shadowPlinth.visible = SU.uShadow.value > 0.01;
    glass.visible = cur.fill > 0.01 || cur.glow > 0.01;
    // the sun drifts a little: a slow sun study
    const sa = -0.42 + Math.sin(clock * 0.09) * 0.1;
    FU.uSun.value.set(Math.cos(sa) * 0.78, 0.66, Math.sin(sa) * 0.78).normalize();
    SU.uDir.value.copy(FU.uSun.value).multiplyScalar(-1);

    ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 3); ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 3);
    const az = cur.az + Math.sin(clock * 0.11) * 0.2 * cur.orbit + ptr.x * 0.08;
    const el = cur.el - ptr.y * 0.035;
    const Dd = baseD * cur.zoom;
    cam.position.set(cur.tx + Dd * Math.sin(az) * Math.cos(el), cur.ty + Dd * Math.sin(el), cur.tz + Dd * Math.cos(az) * Math.cos(el));
    cam.near = Math.max(1, Dd - 60); cam.far = Dd + 80;
    cam.lookAt(cur.tx, cur.ty, cur.tz);
    cam.setViewOffset(W, H, -(cur.fx - 0.5) * W, -(cur.fy - 0.5) * H, W, H);
    cam.updateMatrixWorld();

    renderer.render(scene, cam);

    // labels
    for (const L of labels) {
      let a = cur[L.set];
      if (L.set === 'Ldims') a *= Math.min(1, Math.max(0, (U.uDraw.value - 0.82) / 0.16));
      if (a < 0.02) { if (L.shown !== 0) { L.el.style.opacity = '0'; L.el.style.visibility = 'hidden'; L.shown = 0; } continue; }
      L.v.set(L.p[0], L.p[1] + OFF[L.g] * cur.explode, L.p[2]).project(cam);
      const x = (L.v.x * 0.5 + 0.5) * W, y = (-L.v.y * 0.5 + 0.5) * H;
      L.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      const flip = L.cls === 'lb-note' && x > W * 0.66;
      if (flip !== L.flip) { L.flip = flip; L.el.classList.toggle('lb-flip', flip); }
      L.el.style.opacity = a.toFixed(3);
      if (L.shown !== 1) { L.el.style.visibility = 'visible'; L.shown = 1; }
    }
    if (first) { first = false; opts.onFirstFrame && opts.onFirstFrame(); }
  }
  requestAnimationFrame(frame);

  return {
    redraw() { drawStart = performance.now(); },
    resize
  };
}
