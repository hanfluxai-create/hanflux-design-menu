// Varelle · faceted stones built from real cutting planes, and a single-pass diamond shader.
// Each stone is the intersection of half-spaces (57 for a round brilliant). The same planes
// build the mesh and drive the shader, which traces light inside the stone: refraction in,
// total internal reflection off the pavilion, dispersion on the way out. No transmission pass.
import * as THREE from 'three';

const D = Math.PI / 180;

/* ---------- girdle outlines in the XZ plane ---------- */
function ellipse(a, b, n = 96) {
  const p = [];
  for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; p.push([a * Math.cos(t), b * Math.sin(t)]); }
  return p;
}
function superellipse(a, b, e, n = 128) {
  const p = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    p.push([a * Math.sign(c) * Math.pow(Math.abs(c), 2 / e), b * Math.sign(s) * Math.pow(Math.abs(s), 2 / e)]);
  }
  return p;
}
function octagon(hx, hz, cut) {
  return [[hx, -hz + cut], [hx, hz - cut], [hx - cut, hz], [-hx + cut, hz], [-hx, hz - cut], [-hx, -hz + cut], [-hx + cut, -hz], [hx - cut, -hz]];
}
export function support(pts, a) {
  const c = Math.cos(a), s = Math.sin(a);
  let m = -1e9;
  for (const p of pts) { const v = p[0] * c + p[1] * s; if (v > m) m = v; }
  return m;
}
export function radial(pts, a) {
  const dx = Math.cos(a), dz = Math.sin(a);
  let best = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const ex = x1 - x0, ez = z1 - z0, den = dx * ez - dz * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = (x0 * ez - z0 * ex) / den, u = (x0 * dz - z0 * dx) / den;
    if (t > 0 && u >= -1e-6 && u <= 1 + 1e-6) best = Math.max(best, t);
  }
  return best;
}

/* ---------- cutting schemes ---------- */
function crown(P, a, s, r, y) { const ss = Math.sin(s), cs = Math.cos(s); P.push([ss * Math.cos(a), cs, ss * Math.sin(a), r * ss + y * cs]); }
function pav(P, a, s, r, y) { const ss = Math.sin(s), cs = Math.cos(s); P.push([ss * Math.cos(a), -cs, ss * Math.sin(a), r * ss - y * cs]); }

// Round brilliant layout (table, 8 stars, 8 bezels, 16 upper girdle, 8 pavilion mains, 16 lower girdle)
function brilliant(pts) {
  const P = [], g = 0.012, t = 0.56;
  const cA = 34.5 * D, sA = 21.5 * D, uA = 39.5 * D, pA = 40.8 * D, lA = 41.9 * D;
  const hc = (1 - t) * Math.tan(cA), yT = g + hc;
  P.push([0, 1, 0, yT]);
  for (let k = 0; k < 8; k++) {
    const a = k * 45 * D, as = a + 22.5 * D;
    crown(P, a, cA, support(pts, a), g);
    crown(P, as, sA, (support(pts, as) - (1 - t)) * Math.cos(22.5 * D), yT);
    pav(P, a, pA, support(pts, a), -g);
    for (const o of [11.25, 33.75]) {
      const ag = a + o * D;
      crown(P, ag, uA, support(pts, ag), g);
      pav(P, ag, lA, support(pts, ag), -g);
    }
  }
  return P;
}
// Step cut (emerald): three crown steps, table, three pavilion steps meeting at a keel
function stepCut(pts) {
  const P = [], g = 0.014, az = [];
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    let nx = z1 - z0, nz = -(x1 - x0);
    if (nx * (x0 + x1) + nz * (z0 + z1) < 0) { nx = -nx; nz = -nz; }
    az.push(Math.atan2(nz, nx));
  }
  let y = g, ins = 0;
  for (const [w, s] of [[0.085, 44], [0.085, 31], [0.08, 19]]) {
    for (const a of az) crown(P, a, s * D, support(pts, a) - ins, y);
    y += w * Math.tan(s * D); ins += w;
  }
  P.push([0, 1, 0, y]);
  y = -g; ins = 0;
  for (const [w, s] of [[0.11, 58], [0.15, 47], [0.2, 37]]) {
    for (const a of az) pav(P, a, s * D, support(pts, a) - ins, y);
    y -= w * Math.tan(s * D); ins += w;
  }
  return P;
}

/* ---------- polyhedron from half-spaces ---------- */
function clip(poly, n, d) {
  const out = [];
  for (let k = 0; k < poly.length; k++) {
    const a = poly[k], b = poly[(k + 1) % poly.length];
    const da = n.dot(a) - d, db = n.dot(b) - d;
    if (da <= 1e-9) out.push(a);
    if ((da < -1e-9 && db > 1e-9) || (da > 1e-9 && db < -1e-9)) out.push(a.clone().lerp(b, da / (da - db)));
  }
  return out;
}
function polyhedron(planes) {
  const V = THREE.Vector3;
  const N = planes.map(p => new V(p[0], p[1], p[2]));
  const Dd = planes.map((p, i) => p[3] / N[i].length());
  N.forEach(n => n.normalize());
  const faces = [];
  for (let i = 0; i < planes.length; i++) {
    const n = N[i], d = Dd[i];
    const t1 = new V().crossVectors(Math.abs(n.y) > 0.9 ? new V(1, 0, 0) : new V(0, 1, 0), n).normalize();
    const t2 = new V().crossVectors(n, t1);
    const c = n.clone().multiplyScalar(d);
    let poly = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([u, v]) => c.clone().addScaledVector(t1, u * 6).addScaledVector(t2, v * 6));
    for (let j = 0; j < planes.length && poly.length > 2; j++) if (j !== i) poly = clip(poly, N[j], Dd[j]);
    const q = [];
    for (const p of poly) if (!q.length || p.distanceToSquared(q[q.length - 1]) > 1e-10) q.push(p);
    if (q.length > 2 && q[0].distanceToSquared(q[q.length - 1]) < 1e-10) q.pop();
    if (q.length < 3) continue;
    let area = 0;
    const cen = new V();
    for (let k = 1; k < q.length - 1; k++) {
      const e1 = new V().subVectors(q[k], q[0]), e2 = new V().subVectors(q[k + 1], q[0]);
      const a = new V().crossVectors(e1, e2).length() / 2;
      area += a;
      cen.addScaledVector(new V().add(q[0]).add(q[k]).add(q[k + 1]).divideScalar(3), a);
    }
    if (area < 2e-5) continue;
    cen.divideScalar(area);
    faces.push({ n, d, q, area, c: cen });
  }
  return faces;
}

const SHAPE_DEFS = {
  round: { scheme: brilliant, outline: ellipse(1, 1), prongs: [30, 90, 150, 210, 270, 330] },
  oval: { scheme: brilliant, outline: ellipse(0.8, 1.22), prongs: [30, 90, 150, 210, 270, 330] },
  cushion: { scheme: brilliant, outline: superellipse(0.97, 0.97, 3.2), prongs: [45, 135, 225, 315] },
  princess: { scheme: brilliant, outline: [[0.88, -0.88], [0.88, 0.88], [-0.88, 0.88], [-0.88, -0.88]], prongs: [45, 135, 225, 315] },
  emerald: { scheme: stepCut, outline: octagon(0.74, 1.06, 0.2), prongs: [45, 135, 225, 315] }
};

function volumeOf(faces) {
  let v = 0;
  for (const f of faces) for (let k = 1; k < f.q.length - 1; k++) v += f.q[0].dot(new THREE.Vector3().crossVectors(f.q[k], f.q[k + 1])) / 6;
  return v;
}

let ROUND_VOL = 0;
const cache = {};
// Returns a stone normalised to the volume of a unit round brilliant (girdle radius 1).
export function buildStone(name) {
  if (cache[name]) return cache[name];
  const def = SHAPE_DEFS[name] || SHAPE_DEFS.round;
  if (!ROUND_VOL) ROUND_VOL = volumeOf(polyhedron(brilliant(SHAPE_DEFS.round.outline)));
  let faces = polyhedron(def.scheme(def.outline));
  const k = Math.cbrt(ROUND_VOL / volumeOf(faces));
  const pos = [], nor = [];
  let ymin = 0, ymax = 0, xmax = 0, zmax = 0;
  faces.forEach(f => {
    f.q.forEach(p => p.multiplyScalar(k));
    f.c.multiplyScalar(k); f.d *= k; f.area *= k * k;
    for (const p of f.q) { ymin = Math.min(ymin, p.y); ymax = Math.max(ymax, p.y); xmax = Math.max(xmax, Math.abs(p.x)); zmax = Math.max(zmax, Math.abs(p.z)); }
    for (let i = 1; i < f.q.length - 1; i++) {
      for (const p of [f.q[0], f.q[i], f.q[i + 1]]) { pos.push(p.x, p.y, p.z); nor.push(f.n.x, f.n.y, f.n.z); }
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.computeBoundingSphere();
  const outline = def.outline.map(([x, z]) => [x * k, z * k]);
  const st = {
    name, geo, outline, prongs: def.prongs.map(a => a * D),
    planes: faces.map(f => new THREE.Vector4(f.n.x, f.n.y, f.n.z, f.d)),
    crown: faces.filter(f => f.n.y > 0.12).map(f => ({ c: f.c, n: f.n, area: f.area })),
    plan: faces.filter(f => f.n.y > 1e-3).map(f => f.q.map(p => [p.x, p.z])),
    ymin, ymax, xmax, zmax
  };
  cache[name] = st;
  return st;
}
export const SHAPE_NAMES = Object.keys(SHAPE_DEFS);
export function outlineOf(name) { return SHAPE_DEFS[name].outline; }

/* ---------- procedural jewellery studio (shared by the metal PMREM, the stone and the glints) ---------- */
function frame(x, y, z) {
  const c = new THREE.Vector3(x, y, z).normalize();
  const t1 = new THREE.Vector3().crossVectors(Math.abs(c.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0), c).normalize();
  const t2 = new THREE.Vector3().crossVectors(c, t1);
  const f = v => `vec3(${v.x.toFixed(4)},${v.y.toFixed(4)},${v.z.toFixed(4)})`;
  return `${f(c)},${f(t1)},${f(t2)}`;
}
export const ENV = /* glsl */`
float vpnl(vec3 d, vec3 c, vec3 t1, vec3 t2, vec2 sz, float sf){
  float z = dot(d, c);
  if (z <= 0.06) return 0.0;
  vec2 q = abs(vec2(dot(d, t1), dot(d, t2)) / z) - sz;
  return 1.0 - smoothstep(-sf, sf, max(q.x, q.y));
}
vec3 env(vec3 d){
  float y = d.y;
  vec3 col = mix(vec3(0.010, 0.009, 0.008), vec3(0.15, 0.13, 0.11), smoothstep(-0.2, 0.95, y));
  col += vec3(0.07, 0.05, 0.03) * smoothstep(0.15, -0.7, y);
  col += vec3(1.0, 0.96, 0.9) * 7.5 * vpnl(d, ${frame(-0.62, 0.58, 0.52)}, vec2(0.58, 0.3), 0.05);
  col += vec3(0.93, 0.96, 1.0) * 5.5 * vpnl(d, ${frame(0.94, 0.12, 0.18)}, vec2(0.07, 0.95), 0.02);
  col += vec3(1.0, 0.94, 0.86) * 4.5 * vpnl(d, ${frame(-0.9, 0.05, -0.42)}, vec2(0.06, 0.85), 0.02);
  col += vec3(1.0, 0.98, 0.95) * 3.4 * vpnl(d, ${frame(0.05, 1.0, 0.08)}, vec2(1.1, 0.14), 0.04);
  col += vec3(1.0, 0.9, 0.78) * 2.6 * vpnl(d, ${frame(0.25, 0.42, -0.9)}, vec2(0.6, 0.2), 0.06);
  col += vec3(0.85, 0.9, 1.0) * 1.6 * vpnl(d, ${frame(0.55, 0.3, 0.8)}, vec2(0.16, 0.42), 0.05);
  float az = atan(d.z, d.x);
  float tent = smoothstep(0.8, 0.93, cos(az * 7.0 + 0.5)) * smoothstep(-0.3, 0.05, y) * smoothstep(0.8, 0.5, y);
  col += vec3(1.0, 0.97, 0.92) * 3.0 * tent;
  col += vec3(1.0, 0.9, 0.76) * 1.5 * smoothstep(-0.5, -0.9, y);
  return col;
}`;

/* ---------- the diamond material ---------- */
const MAXP = 64;
const STONE_VERT = /* glsl */`
varying vec3 vPos; varying vec3 vNrm;
void main(){
  vPos = position; vNrm = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const STONE_FRAG = /* glsl */`
uniform vec4 uPl[${MAXP}];
uniform int uN;
uniform vec3 uCam;
uniform mat3 uRot;
uniform float uIor, uDisp, uGain;
uniform vec3 uTint;
varying vec3 vPos; varying vec3 vNrm;
${ENV}
vec3 envO(vec3 d){
  vec3 w = normalize(uRot * d);
  vec3 e = env(w);
  e = e * e / (e + 0.22);
  return e * mix(vec3(1.0), uTint, smoothstep(-0.1, -0.6, w.y));
}
float fres(float c, float f0){ return f0 + (1.0 - f0) * pow(1.0 - clamp(c, 0.0, 1.0), 5.0); }
void main(){
  vec3 N = normalize(vNrm);
  vec3 V = normalize(vPos - uCam);
  float f0 = pow((uIor - 1.0) / (uIor + 1.0), 2.0);
  float F = fres(-dot(V, N), f0);
  vec3 col = envO(reflect(V, N)) * F;
  vec3 Dd = refract(V, N, 1.0 / uIor);
  vec3 P = vPos;
  float thr = 1.0 - F;
  for (int b = 0; b < BOUNCES; b++) {
    float tmin = 100.0; vec3 nh = vec3(0.0, -1.0, 0.0);
    for (int i = 0; i < uN; i++) {
      vec4 pl = uPl[i];
      float den = dot(pl.xyz, Dd);
      if (den > 1e-4) {
        float t = (pl.w - dot(pl.xyz, P)) / den;
        if (t < tmin) { tmin = t; nh = pl.xyz; }
      }
    }
    P += Dd * max(tmin, 0.0);
    vec3 dg = refract(Dd, -nh, uIor);
    if (dot(dg, dg) > 0.0) {
      float Fi = fres(dot(dg, nh), f0);
      vec3 dr = refract(Dd, -nh, uIor - uDisp);
      vec3 db = refract(Dd, -nh, uIor + uDisp);
      vec3 e = vec3(envO(dot(dr, dr) > 0.0 ? dr : dg).r, envO(dg).g, envO(dot(db, db) > 0.0 ? db : dg).b);
      col += e * thr * (1.0 - Fi);
      thr *= Fi;
    }
    Dd = reflect(Dd, nh);
  }
  col += envO(Dd) * thr * 0.4;
  gl_FragColor = vec4(col * uGain, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function stoneMaterial(lite) {
  const pl = [];
  for (let i = 0; i < MAXP; i++) pl.push(new THREE.Vector4(0, 1, 0, 10));
  return new THREE.ShaderMaterial({
    defines: { BOUNCES: lite ? 3 : 5 },
    uniforms: {
      uPl: { value: pl }, uN: { value: 0 }, uCam: { value: new THREE.Vector3() }, uRot: { value: new THREE.Matrix3() },
      uIor: { value: 2.42 }, uDisp: { value: 0.04 }, uGain: { value: 1.2 }, uTint: { value: new THREE.Color(1, 0.8, 0.5) }
    },
    vertexShader: STONE_VERT, fragmentShader: STONE_FRAG
  });
}
export function applyStone(mat, st) {
  const pl = mat.uniforms.uPl.value;
  for (let i = 0; i < MAXP; i++) {
    const s = st.planes[i];
    if (s) pl[i].copy(s); else pl[i].set(0, 1, 0, 10);
  }
  mat.uniforms.uN.value = Math.min(MAXP, st.planes.length);
}
