// Ruvela Residences: a low-poly township built in code.
// Scroll flies the camera from an aerial overview, around Tower A, to floor 14,
// while the light moves from morning to golden dusk.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as L from './layout.js';

const C = (h) => new THREE.Color(h);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

/* ------------------------------------------------------------------ geometry helpers */
function prep(g, color) {
  if (g.index) g = g.toNonIndexed();
  if (g.attributes.uv) g.deleteAttribute('uv');
  if (!g.attributes.normal) g.computeVertexNormals();
  const n = g.attributes.position.count, a = new Float32Array(n * 3), c = color.isColor ? color : C(color);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return g;
}
class Bag {
  constructor() { this.g = []; }
  add(g, color) { const p = prep(g, color); this.g.push(p); return p; }
  box(w, h, d, x, y, z, color, ry = 0) {
    const g = new THREE.BoxGeometry(w, h, d);
    if (ry) g.rotateY(ry);
    g.translate(x, y, z);
    return this.add(g, color);
  }
  build() { return this.g.length ? mergeGeometries(this.g, false) : new THREE.BufferGeometry(); }
}
// Shapes are drawn in plan (x, z); ShapeGeometry lives in XY, so y = -z, then rotate flat.
function flatShape(shape, y, seg = 12) {
  const g = new THREE.ShapeGeometry(shape, seg);
  g.rotateX(-Math.PI / 2);
  g.translate(0, y, 0);
  return g;
}
function rrShape(x0, z0, x1, z1, r) {
  const s = new THREE.Shape(), pts = L.roundRect(x0, z0, x1, z1, r, 6);
  s.moveTo(pts[0][0], -pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], -pts[i][1]);
  s.closePath();
  return s;
}
function rrPath(x0, z0, x1, z1, r) {
  const p = new THREE.Path(), pts = L.roundRect(x0, z0, x1, z1, r, 6).reverse();
  p.moveTo(pts[0][0], -pts[0][1]);
  for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], -pts[i][1]);
  p.closePath();
  return p;
}

/* ------------------------------------------------------------------ textures (all generated, under 1024 px) */
function facadeTextures(seed) {
  const W = 256, H = 512, cw = 32, ch = 32, R = L.rng(seed);
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const map = mk(), em = mk(), g = map.getContext('2d'), e = em.getContext('2d');
  g.fillStyle = '#efe6d8'; g.fillRect(0, 0, W, H);
  e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  const warm = ['#ffd496', '#ffc274', '#ffe4bd', '#ffb35e', '#ffd9a8'];
  for (let fy = 0; fy < 16; fy++) for (let bx = 0; bx < 8; bx++) {
    const x = bx * cw, y = fy * ch;
    const gr = g.createLinearGradient(0, y + 4, 0, y + ch - 4);
    gr.addColorStop(0, '#a9c2cc'); gr.addColorStop(0.55, '#7d9aa6'); gr.addColorStop(1, '#93aeb8');
    g.fillStyle = gr; g.fillRect(x + 3, y + 4, cw - 6, ch - 7);
    g.fillStyle = 'rgba(238,244,246,.45)'; g.fillRect(x + 3, y + ch - 10, cw - 6, 6); // glass balustrade
    g.fillStyle = '#e4dccf'; g.fillRect(x + 15, y + 4, 2, ch - 7);                  // mullion
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 4, y + 5, 5, ch - 16);     // sky glint
    if (R() < 0.4) {
      e.fillStyle = warm[(R() * warm.length) | 0];
      const half = R() < 0.35;
      e.fillRect(x + 3 + (half && R() < 0.5 ? 13 : 0), y + 4, half ? 13 : cw - 6, ch - 7);
      e.fillStyle = '#2a1d10'; e.fillRect(x + 15, y + 4, 2, ch - 7);
    }
  }
  const t1 = new THREE.CanvasTexture(map), t2 = new THREE.CanvasTexture(em);
  for (const t of [t1, t2]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; }
  return [t1, t2];
}
function spriteTex(size, stops) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function cloudTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d'), R = L.rng(77);
  for (let i = 0; i < 26; i++) {
    const x = 40 + R() * 176, y = 58 + (R() - 0.5) * 36 * (1 - Math.abs(x - 128) / 140), r = 16 + R() * 30;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ------------------------------------------------------------------ facade geometry with UVs in bays and floors */
function facadeGeo(w, d, y0, h, uOff) {
  const pos = [], nor = [], uv = [], BAYS = 12; // texture spans 8 bays of 1.5 units
  const hw = w / 2, hd = d / 2;
  const quad = (ax, az, bx, bz, nx, nz, u0) => {
    const len = Math.hypot(bx - ax, bz - az), u1 = u0 + len / BAYS, v0 = y0 / 16, v1 = (y0 + h) / 16;
    const P = [[ax, y0, az], [bx, y0, bz], [bx, y0 + h, bz], [ax, y0 + h, az]], U = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
    for (const i of [0, 1, 2, 0, 2, 3]) { pos.push(...P[i]); nor.push(nx, 0, nz); uv.push(...U[i]); }
  };
  quad(-hw, hd, hw, hd, 0, 1, uOff);
  quad(hw, hd, hw, -hd, 1, 0, uOff + 2 / 8);
  quad(hw, -hd, -hw, -hd, 0, -1, uOff + 5 / 8);
  quad(-hw, -hd, -hw, hd, -1, 0, uOff + 3 / 8);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return g;
}

/* ------------------------------------------------------------------ shaders */
const SKY_VS = /* glsl */`
varying vec3 vDir;
void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SKY_FS = /* glsl */`
uniform vec3 uZen; uniform vec3 uHorS; uniform vec3 uHorA; uniform vec3 uLow; uniform vec3 uSun; uniform vec3 uSunC; uniform float uDisc;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir);
  vec2 s2 = normalize(uSun.xz + vec2(1e-4)), d2 = normalize(d.xz + vec2(1e-4));
  float face = pow(dot(s2, d2) * 0.5 + 0.5, 2.4);
  vec3 hor = mix(uHorA, uHorS, face);
  float h = clamp(d.y, 0.0, 1.0);
  vec3 col = mix(hor, uZen, pow(h, 0.5));
  col = mix(col, uLow, smoothstep(0.0, -0.12, d.y));
  float cs = max(dot(d, normalize(uSun)), 0.0);
  col += uSunC * (pow(cs, 10.0) * 0.22 + pow(cs, 90.0) * 0.35) * (0.6 + 0.4 * face);
  col = mix(col, uSunC * 1.25 + vec3(0.25), smoothstep(0.99955, 0.9998, cs) * uDisc);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
const WATER_VS = /* glsl */`
varying vec3 vW;
void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const WATER_FS = /* glsl */`
uniform float uTime; uniform vec3 uDeep; uniform vec3 uShal; uniform vec3 uSky; uniform vec3 uSun; uniform vec3 uSunC;
varying vec3 vW;
void main(){
  vec2 p = vW.xz * 1.7;
  float a = sin(p.x * 1.3 + uTime * 1.2) * sin(p.y * 1.9 - uTime * 0.9);
  float b = sin((p.x + p.y) * 2.3 - uTime * 1.7) * 0.5;
  vec3 n = normalize(vec3(cos(p.x * 1.3 + uTime * 1.2) * 0.16 + b * 0.12, 1.0, cos(p.y * 1.9 - uTime * 0.9) * 0.16));
  vec3 v = normalize(cameraPosition - vW);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  float c = smoothstep(0.7, 1.0, sin(p.x * 3.3 + (a + b) * 2.4 + uTime) * sin(p.y * 2.9 - (a - b) * 1.9 - uTime * 0.8));
  vec3 col = mix(uDeep, uShal, 0.55 + 0.22 * (a + b));
  col += vec3(0.16, 0.2, 0.2) * c;
  col = mix(col, uSky, 0.18 + fres * 0.55);
  vec3 r = reflect(-normalize(uSun), n);
  col += uSunC * pow(max(dot(r, v), 0.0), 70.0) * 1.6;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/* ------------------------------------------------------------------ time of day */
// t = 0 morning (07:10) ... 1 golden dusk (18:40)
const TOD = [
  { t: 0.0, az: 1.22, el: 0.43, sun: '#ffe0b6', sunI: 3.0, hs: '#d5e6ef', hg: '#cdb996', hI: 1.25, zen: '#73acd6', horS: '#f6efe0', horA: '#e2ecef', low: '#d9d4c4', fog: '#e7ebe5', deep: '#1c7a92', shal: '#6dc6d5', win: 0.0, lamp: 0, cloud: '#ffffff', exp: 1.0 },
  { t: 0.36, az: 0.3, el: 0.98, sun: '#fff4e4', sunI: 3.2, hs: '#d9e9f3', hg: '#cbb894', hI: 1.25, zen: '#5e9fd3', horS: '#e8f1f3', horA: '#dcebf1', low: '#d4d2c6', fog: '#e2ebee', deep: '#167891', shal: '#62c3d6', win: 0.0, lamp: 0, cloud: '#ffffff', exp: 1.0 },
  { t: 0.68, az: -0.88, el: 0.34, sun: '#ffca8c', sunI: 2.8, hs: '#e8dac4', hg: '#c09f7a', hI: 1.05, zen: '#6f95c0', horS: '#f8d19c', horA: '#e9d9cf', low: '#d8c6ad', fog: '#eedbc2', deep: '#1a6d86', shal: '#5fb6c8', win: 0.32, lamp: 0.2, cloud: '#ffe7cf', exp: 1.0 },
  { t: 1.0, az: -1.1, el: 0.12, sun: '#ff9550', sunI: 1.75, hs: '#8392c6', hg: '#6a4a46', hI: 0.78, zen: '#28467a', horS: '#f3a462', horA: '#dcac9c', low: '#8f7a7a', fog: '#c9a094', deep: '#183d5c', shal: '#3d7896', win: 1.6, lamp: 1, cloud: '#f3b2a2', exp: 1.0 }
];
const TODC = TOD.map(k => { const o = { ...k }; for (const key in k) if (typeof k[key] === 'string') o[key] = C(k[key]); return o; });
function sampleTOD(t, out) {
  let i = 0; while (i < TODC.length - 2 && t > TODC[i + 1].t) i++;
  const a = TODC[i], b = TODC[i + 1], f = smooth(clamp((t - a.t) / (b.t - a.t)));
  for (const k in a) {
    if (k === 't') continue;
    if (a[k].isColor) { (out[k] || (out[k] = new THREE.Color())).copy(a[k]).lerp(b[k], f); }
    else out[k] = lerp(a[k], b[k], f);
  }
  return out;
}

/* ------------------------------------------------------------------ camera path */
function homeTarget() {
  const t = L.TOWERS[L.HOME.tower];
  const c = Math.cos(t.yaw), s = Math.sin(t.yaw), lx = -t.w / 2 - 0.1;
  // local (lx, 0) to world with three.js rotation.y
  return { x: t.x + c * lx, y: L.floorY(L.HOME.floor) + 0.5, z: t.z - s * lx, nAz: Math.atan2(-c, s) };
}
function makeKeys(mobile, aspect) {
  const H = homeTarget(), A = L.TOWERS[0];
  const m = mobile;
  const S = (o) => Object.assign({ tx: 0, ty: 8, tz: -3, az: 0.66, el: 0.42, dist: 104, fx: 0.5, fy: 0.5, fov: 30 }, o);
  const K0 = S(m ? { tx: 1.5, ty: 12, tz: -6, az: 0.52, el: 0.13, dist: 108, fy: 0.385, fov: 44 }
                 : { tx: 2, ty: 10.5, tz: -4, az: 0.64, el: 0.21, dist: 80, fx: 0.64, fy: 0.6, fov: 34 });
  const K1 = S(m ? { tx: A.x + 1.5, ty: 15, tz: A.z, az: -0.32, el: 0.07, dist: 66, fy: 0.4, fov: 44 }
                 : { tx: A.x + 3, ty: 14, tz: A.z, az: -0.3, el: 0.1, dist: 58, fx: 0.63, fy: 0.55, fov: 34 });
  const K1b = S({ ...K1, az: K1.az - 0.16, dist: K1.dist * 0.94 });
  const K2 = S(m ? { tx: H.x, ty: H.y, tz: H.z, az: H.nAz + 0.42, el: 0.02, dist: 36, fy: 0.37, fov: 44 }
                 : { tx: H.x, ty: H.y, tz: H.z, az: H.nAz + 0.44, el: 0.03, dist: 30, fx: 0.66, fy: 0.52, fov: 34 });
  const K3 = S(m ? { tx: H.x, ty: H.y + 1.2, tz: H.z, az: H.nAz + 0.24, el: -0.03, dist: 36, fy: 0.27, fov: 44 }
                 : { tx: H.x, ty: H.y + 0.6, tz: H.z, az: H.nAz + 0.22, el: -0.02, dist: 29, fx: 0.75, fy: 0.5, fov: 34 });
  const K3b = S({ ...K3, dist: K3.dist * 0.95 });
  return [[0, K0], [0.04, K0], [0.3, K1], [0.4, K1b], [0.58, K2], [0.66, K2], [0.82, K3], [1, K3b]];
}
function sampleKeys(keys, p, out) {
  let i = 0; while (i < keys.length - 2 && p > keys[i + 1][0]) i++;
  const [p0, a] = keys[i], [p1, b] = keys[i + 1], f = smooth(clamp((p - p0) / Math.max(1e-6, p1 - p0)));
  for (const k in a) out[k] = lerp(a[k], b[k], f);
  return out;
}

/* ------------------------------------------------------------------ world */
function groundHeight(x, z) {
  const HILLS = [[-70, -190, 42, 78], [75, -205, 34, 72], [-195, -75, 32, 64], [200, -60, 26, 62], [0, -300, 60, 120], [-160, 160, 20, 64], [170, 170, 18, 60], [-280, 20, 40, 90], [285, -10, 34, 86], [40, 250, 26, 80]];
  let h = 0;
  for (const [hx, hz, hh, hr] of HILLS) h += hh * Math.exp(-((x - hx) ** 2 + (z - hz) ** 2) / (hr * hr) * 1.6);
  h += (Math.sin(x * 0.045 + 1.3) * Math.cos(z * 0.052) * 4 + Math.sin(x * 0.11 - z * 0.07) * 0.8);
  const r = Math.hypot(x * 0.9, z);
  h *= smooth(clamp((r - 62) / 70));
  const flat = smooth(clamp((Math.abs(z - L.ROAD_Z) - 6) / 26));
  h *= lerp(1, flat, smooth(clamp((190 - Math.abs(x)) / 50)));
  return h;
}

function buildWorld(scene, mats, lite) {
  const R = L.rng(20271203);
  // ground with soft hills (Baner hill rises to the north and west)
  {
    const N = lite ? 64 : 84, S = 1000;
    const g = new THREE.PlaneGeometry(S, S, N, N); g.rotateX(-Math.PI / 2);
    const P = g.attributes.position;
    for (let i = 0; i < P.count; i++) P.setY(i, groundHeight(P.getX(i), P.getZ(i)) - 0.02);
    const ng = g.toNonIndexed(); ng.deleteAttribute('uv'); ng.computeVertexNormals();
    const Q = ng.attributes.position, col = new Float32Array(Q.count * 3);
    const dry = C('#dcd3b2'), green = C('#adbd8d'), deep = C('#8ca277'), urban = C('#e6dfce'), tmp = new THREE.Color();
    for (let i = 0; i < Q.count; i += 3) {
      const x = (Q.getX(i) + Q.getX(i + 1) + Q.getX(i + 2)) / 3, z = (Q.getZ(i) + Q.getZ(i + 1) + Q.getZ(i + 2)) / 3;
      const y = (Q.getY(i) + Q.getY(i + 1) + Q.getY(i + 2)) / 3;
      const n = 0.5 + 0.5 * Math.sin(x * 0.09 + Math.sin(z * 0.05) * 2.0) * Math.cos(z * 0.08 - x * 0.03);
      tmp.copy(dry).lerp(green, clamp(n * 0.9 + y * 0.012));
      tmp.lerp(deep, clamp((y - 10) / 30) * 0.8);
      tmp.lerp(urban, clamp(1 - (Math.hypot(x, z) - 30) / 60) * 0.55);
      for (let k = 0; k < 3; k++) col.set([tmp.r, tmp.g, tmp.b], (i + k) * 3);
    }
    ng.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const ground = new THREE.Mesh(ng, mats.land); ground.receiveShadow = true; scene.add(ground);
  }

  const B = new Bag(); // podium, landscape, clubhouse, roads: one static mesh
  const sand = '#e9dfcd', stone = '#cdbc9d', pave = '#f1e9da', terra = '#b9653c', lawnC = ['#86a35f', '#7a9a56', '#8fab68'], wood = '#b07c55', white = '#f8f4ee';
  const top = L.PODIUM;
  // podium
  {
    const s = rrShape(L.SITE.x0, L.SITE.z0, L.SITE.x1, L.SITE.z1, L.SITE.r);
    const g = new THREE.ExtrudeGeometry(s, { depth: top, bevelEnabled: false, curveSegments: 6 });
    g.rotateX(-Math.PI / 2);
    const p = B.add(g, sand), N = p.attributes.normal, Cc = p.attributes.color, side = C(stone);
    for (let i = 0; i < N.count; i++) if (N.getY(i) < 0.5) Cc.setXYZ(i, side.r, side.g, side.b);
    // a dark ventilation band on the podium wall, read as the car park below
    const band = rrShape(L.SITE.x0 - 0.02, L.SITE.z0 - 0.02, L.SITE.x1 + 0.02, L.SITE.z1 + 0.02, L.SITE.r);
    band.holes.push(rrPath(L.SITE.x0 + 0.2, L.SITE.z0 + 0.2, L.SITE.x1 - 0.2, L.SITE.z1 - 0.2, L.SITE.r - 0.2));
    const bg = new THREE.ExtrudeGeometry(band, { depth: 0.26, bevelEnabled: false, curveSegments: 6 }); bg.rotateX(-Math.PI / 2); bg.translate(0, 0.42, 0);
    B.add(bg, '#8f8270');
  }
  // jogging loop
  {
    const i0 = L.TRACK.inset, i1 = i0 + L.TRACK.width;
    const s = rrShape(L.SITE.x0 + i0, L.SITE.z0 + i0, L.SITE.x1 - i0, L.SITE.z1 - i0, L.SITE.r - i0);
    s.holes.push(rrPath(L.SITE.x0 + i1, L.SITE.z0 + i1, L.SITE.x1 - i1, L.SITE.z1 - i1, L.SITE.r - i1));
    B.add(flatShape(s, top + 0.02), terra);
  }
  // lawns
  L.LAWNS.forEach((l, i) => {
    const s = new THREE.Shape(); s.absellipse(l.x, -l.z, l.rx, l.rz, 0, Math.PI * 2, false, -l.rot);
    B.add(flatShape(s, top + 0.03, 28), lawnC[i % 3]);
  });
  // paths: a cross walk linking the tower forecourts, and a plaza between pool and clubhouse
  B.box(38, 0.06, 1.8, 0, top + 0.035, -3.3, pave);
  B.box(4.6, 0.06, 6.4, 6.0, top + 0.035, 8.6, pave);
  for (const t of L.TOWERS) B.box(t.w + 3.2, 0.07, t.d + 3.4, t.x, top + 0.035, t.z, pave, t.yaw);
  // pool surround, deck, loungers, umbrellas
  const P = L.POOL, K = L.KIDS_POOL, D = L.DECK;
  B.box(P.w + 1.4, 0.1, P.d + 1.3, P.x, top + 0.05, P.z, white);
  B.box(K.w + 1.0, 0.1, K.d + 1.0, K.x, top + 0.05, K.z, white);
  B.box(D.w, 0.12, D.d, D.x, top + 0.06, D.z, wood);
  for (let i = 0; i < 6; i++) B.box(0.5, 0.18, 1.2, D.x - 4.8 + i * 1.9, top + 0.21, D.z + 0.1, white);
  for (let i = 0; i < 3; i++) {
    const x = D.x - 3.9 + i * 3.8, z = D.z + 0.2;
    B.box(0.08, 1.5, 0.08, x, top + 0.85, z, '#6f6558');
    const c = new THREE.ConeGeometry(1.05, 0.38, 8); c.translate(x, top + 1.72, z); B.add(c, i % 2 ? white : terra);
  }
  // kids' play: a slide, a climbing frame and soft mounds
  {
    const p = L.PLAY;
    B.box(0.8, 1.1, 0.8, p.x - 1, top + 0.58, p.z, '#e0a34a');
    B.box(0.5, 0.12, 2.0, p.x - 1, top + 0.62, p.z + 1.25, '#5aa6c4', 0);
    B.box(1.6, 0.9, 1.6, p.x + 1.2, top + 0.48, p.z - 0.6, '#c4553a');
    const d1 = new THREE.SphereGeometry(0.7, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2); d1.translate(p.x + 0.6, top + 0.03, p.z + 1.6); B.add(d1, '#e8c67a');
  }
  // clubhouse: glass ground floor, a white cantilevered upper floor with terracotta louvres, roof pergola
  const CL = L.CLUB;
  {
    const cw = CL.w, cd = CL.d, y = top, rot = CL.yaw;
    const at = (lx, lz) => [CL.x + Math.cos(rot) * lx + Math.sin(rot) * lz, CL.z - Math.sin(rot) * lx + Math.cos(rot) * lz];
    const [ux, uz] = at(0.3, 0.2);
    B.box(cw + 1.3, 1.45, cd + 0.9, ux, y + 1.7 + 0.72, uz, white, rot);
    B.box(cw + 1.6, 0.18, cd + 1.2, ux, y + 3.2, uz, '#efe9df', rot);
    for (let i = 0; i < 11; i++) { const [lx, lz] = at(-cw / 2 - 0.25 + i * ((cw + 1.1) / 10), cd / 2 + 0.75); B.box(0.12, 1.4, 0.14, lx, y + 2.42, lz, terra, rot); }
    for (let i = 0; i < 9; i++) { const [lx, lz] = at(-cw / 2 + 0.6 + i * 1.15, -0.4); B.box(0.12, 0.1, cd - 1.2, lx, y + 3.95, lz, terra, rot); }
    for (const [a, b] of [[-cw / 2 + 0.6, -cd / 2 + 1], [cw / 2 - 0.6, -cd / 2 + 1], [cw / 2 - 0.6, cd / 2 - 1.4], [-cw / 2 + 0.6, cd / 2 - 1.4]]) { const [px, pz] = at(a, b - 0.4); B.box(0.14, 0.75, 0.14, px, y + 3.62, pz, terra, rot); }
    const glass = new THREE.Mesh(new THREE.BoxGeometry(cw, 1.7, cd), mats.glass);
    glass.position.set(CL.x, y + 0.85, CL.z); glass.rotation.y = rot; glass.castShadow = true; glass.receiveShadow = true; scene.add(glass);
  }
  // gatehouse and the drive down to the road
  B.box(2.4, 1.2, 1.6, L.GATE.x - 3.6, 0.6, L.GATE.z + 2.3, white);
  B.box(4.2, 0.04, 6.5, L.GATE.x, 0.02, L.GATE.z + 3.2, '#7d7a74');
  // roads
  B.box(320, 0.04, 5.4, 0, 0.02, L.ROAD_Z, '#76736e');
  B.box(320, 0.05, 1.2, 0, 0.03, L.ROAD_Z - 3.3, '#d9d2c4');
  B.box(320, 0.05, 1.2, 0, 0.03, L.ROAD_Z + 3.3, '#d9d2c4');
  for (let x = -158; x < 160; x += 4.2) B.box(1.6, 0.05, 0.14, x, 0.045, L.ROAD_Z, '#efe9dc');
  B.box(3.6, 0.04, 160, L.ROAD_X, 0.02, L.ROAD_Z - 82, '#7b7873');

  const stat = new THREE.Mesh(B.build(), mats.detail); stat.receiveShadow = true; stat.castShadow = true; scene.add(stat);

  // water (pool + kids' pool share one shader)
  {
    const g1 = new THREE.PlaneGeometry(P.w, P.d); g1.rotateX(-Math.PI / 2); g1.translate(P.x, top + 0.11, P.z);
    const g2 = new THREE.PlaneGeometry(K.w, K.d); g2.rotateX(-Math.PI / 2); g2.translate(K.x, top + 0.11, K.z);
    const w = new THREE.Mesh(mergeGeometries([g1, g2]), mats.water); scene.add(w);
  }

  // context: white massing models around the site, the way architects show a neighbourhood
  {
    const n = lite ? 30 : 54, dummy = new THREE.Object3D(), list = [];
    let guard = 0;
    while (list.length < n && guard++ < 3000) {
      const a = R() * Math.PI * 2, r = 38 + Math.pow(R(), 1.1) * 95;
      const x = Math.cos(a) * r * 1.15, z = Math.sin(a) * r;
      if (groundHeight(x, z) > 0.25 || groundHeight(x + 6, z + 6) > 0.25 || groundHeight(x - 6, z - 6) > 0.25) continue;
      if (Math.abs(z - L.ROAD_Z) < 8 || Math.abs(x - L.ROAD_X) < 6 && z < L.ROAD_Z) continue;
      if (x > L.SITE.x0 - 8 && x < L.SITE.x1 + 8 && z > L.SITE.z0 - 8 && z < L.SITE.z1 + 8) continue;
      const w = 4 + R() * 7, d = 4 + R() * 6, h = R() < 0.16 ? 7 + R() * 6 : 1.6 + R() * 4.2;
      if (list.some(o => Math.abs(o.x - x) < (o.w + w) / 2 + 2 && Math.abs(o.z - z) < (o.d + d) / 2 + 2)) continue;
      list.push({ x, z, w, d, h, yaw: (R() - 0.5) * 0.5 });
    }
    const g = new THREE.BoxGeometry(1, 1, 1); g.translate(0, 0.5, 0);
    const im = new THREE.InstancedMesh(g, mats.context, list.length);
    const tc = new THREE.Color();
    list.forEach((o, i) => {
      const gy = groundHeight(o.x, o.z) - 0.4;
      dummy.position.set(o.x, gy, o.z); dummy.rotation.set(0, o.yaw, 0); dummy.scale.set(o.w, o.h + 0.4, o.d); dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
      im.setColorAt(i, tc.set(['#f7f4ee', '#efeae1', '#f9f7f2', '#ebe5da'][i % 4]));
    });
    im.castShadow = true; im.receiveShadow = true; scene.add(im);
  }

  // trees: on the podium (shared with the site plan) and along the roads
  {
    const trees = L.siteTrees().map(t => ({ ...t, y: top }));
    const extra = lite ? 26 : 56;
    for (let x = -84; x < 90; x += 7.5) { if (Math.abs(x - L.GATE.x) > 5) trees.push({ x: x + R() * 2, z: L.ROAD_Z - 5 + R(), s: 0.8 + R() * 0.4, k: R() < 0.2 ? 1 : 0, y: 0 }); if (!lite || x % 15 < 7) trees.push({ x: x + R() * 3, z: L.ROAD_Z + 5.5 + R(), s: 0.8 + R() * 0.4, k: R() < 0.15 ? 2 : 0, y: 0 }); }
    let guard = 0, added = 0;
    while (added < extra && guard++ < 2000) {
      const x = (R() - 0.5) * 150, z = (R() - 0.5) * 120 - 10;
      if (x > L.SITE.x0 - 2 && x < L.SITE.x1 + 2 && z > L.SITE.z0 - 2 && z < L.SITE.z1 + 2) continue;
      if (Math.abs(z - L.ROAD_Z) < 4.5 || (Math.abs(x - L.ROAD_X) < 3.5 && z < L.ROAD_Z)) continue;
      trees.push({ x, z, s: 0.8 + R() * 0.6, k: R() < 0.12 ? 1 : 0, y: groundHeight(x, z) }); added++;
    }
    const cg = new THREE.IcosahedronGeometry(1, 0), tg = new THREE.CylinderGeometry(0.13, 0.19, 1, 5); tg.translate(0, 0.5, 0);
    const can = new THREE.InstancedMesh(cg, mats.tree, trees.length), trk = new THREE.InstancedMesh(tg, mats.trunk, trees.length);
    const dm = new THREE.Object3D(), tc = new THREE.Color();
    const pal = [['#3f6c49', '#4d7a4b', '#5b8551', '#38614a', '#46734d'], ['#d9663a', '#e27a40', '#cf5a34'], ['#d8b14a', '#e2c15b']];
    trees.forEach((t, i) => {
      const s = t.s, th = 1.1 * s;
      dm.position.set(t.x, t.y, t.z); dm.rotation.set(0, 0, 0); dm.scale.set(1, th, 1); dm.updateMatrix(); trk.setMatrixAt(i, dm.matrix);
      dm.position.set(t.x, t.y + th + 1.0 * s, t.z); dm.rotation.set(R() * 0.5, R() * 6, R() * 0.5); dm.scale.set(1.35 * s, 1.25 * s, 1.35 * s); dm.updateMatrix(); can.setMatrixAt(i, dm.matrix);
      const p = pal[t.k]; can.setColorAt(i, tc.set(p[(R() * p.length) | 0]));
    });
    can.castShadow = trk.castShadow = true; can.receiveShadow = true;
    scene.add(can, trk);
  }
}

function buildTower(t, i, mats) {
  const g = new THREE.Group();
  g.position.set(t.x, L.PODIUM, t.z); g.rotation.y = t.yaw;
  const H = t.floors * L.FLOOR, y0 = L.LOBBY, hw = t.w / 2, hd = t.d / 2;
  const fac = new THREE.Mesh(facadeGeo(t.w, t.d, y0, H, (i * 3) / 8), mats.facade);
  const B = new Bag(), slab = '#fbf8f2', white = '#f6f1e8', terra = '#c46a3c', core = '#e4d9c7';
  for (const [x, z] of [[-hw + 0.35, -hd + 0.35], [hw - 0.35, -hd + 0.35], [hw - 0.35, hd - 0.35], [-hw + 0.35, hd - 0.35]]) B.box(0.5, y0, 0.5, x, y0 / 2, z, white);
  for (let k = 0; k <= t.floors; k++) B.box(t.w + 0.72, 0.14, t.d + 0.72, 0, y0 + k * L.FLOOR, 0, slab);
  for (const fx of [-1.5, 1.5]) B.box(0.3, H + 1.0, 0.95, fx, y0 + (H + 1.0) / 2 - 0.2, hd + 0.2, terra);
  B.box(2.6, H + 0.4, 0.3, 0, y0 + H / 2 + 0.2, -hd - 0.1, core);
  const topY = y0 + H;
  B.box(t.w - 2.8, 1.15, t.d - 2.0, -0.5, topY + 0.6, -0.3, white);
  for (const [x, z] of [[-hw + 0.25, -hd + 0.25], [hw - 0.25, -hd + 0.25], [hw - 0.25, hd - 0.25], [-hw + 0.25, hd - 0.25]]) B.box(0.2, 2.0, 0.2, x, topY + 1.0, z, terra);
  B.box(t.w + 0.6, 0.24, t.d + 0.6, 0, topY + 2.05, 0, terra);
  for (let s = -3; s <= 3; s++) B.box(0.16, 0.14, t.d + 0.2, s * 1.25, topY + 1.86, 0, terra);
  const det = new THREE.Mesh(B.build(), mats.detail);
  const lob = new THREE.Mesh(new THREE.BoxGeometry(t.w - 1.3, y0 - 0.08, t.d - 1.3), mats.glass); lob.position.y = (y0 - 0.08) / 2;
  for (const m of [fac, det, lob]) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
  return g;
}

/* ------------------------------------------------------------------ main */
export function initScene(canvas, opts) {
  const { mobile, lite } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe7ebe5, 70, 520);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.5, 2400);

  const [fMap, fEm] = facadeTextures(14);
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  fMap.anisotropy = fEm.anisotropy = aniso;
  const mats = {
    detail: new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }),
    land: new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }),
    context: new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }),
    tree: new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }),
    trunk: new THREE.MeshLambertMaterial({ color: C('#7a5a43') }),
    facade: new THREE.MeshLambertMaterial({ map: fMap, emissiveMap: fEm, emissive: C('#ffb468'), emissiveIntensity: 0 }),
    glass: new THREE.MeshLambertMaterial({ color: C('#40545b'), emissive: C('#ffb36a'), emissiveIntensity: 0 }),
    water: new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uDeep: { value: C('#1c7a92') }, uShal: { value: C('#6dc6d5') }, uSky: { value: C('#cfe3ee') }, uSun: { value: new THREE.Vector3(0.5, 0.5, 0.5) }, uSunC: { value: C('#fff0d8') } },
      vertexShader: WATER_VS, fragmentShader: WATER_FS
    })
  };

  // sky dome follows the camera
  const skyU = { uZen: { value: C('#73acd6') }, uHorS: { value: C('#f6efe0') }, uHorA: { value: C('#e2ecef') }, uLow: { value: C('#d9d4c4') }, uSun: { value: new THREE.Vector3(0.5, 0.4, 0.5) }, uSunC: { value: C('#ffe0b6') }, uDisc: { value: 1 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), new THREE.ShaderMaterial({ uniforms: skyU, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false, fog: false }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

  // clouds
  const clouds = [];
  {
    const tex = cloudTex(), R = L.rng(9), n = lite ? 5 : 8;
    for (let i = 0; i < n; i++) {
      const m = new THREE.SpriteMaterial({ map: tex, color: 0xffffff, transparent: true, depthWrite: false, fog: false, opacity: 0.9 });
      const s = new THREE.Sprite(m), a = -2.4 + (i / n) * 3.4 + R() * 0.3, r = 420 + R() * 260;
      s.position.set(Math.sin(a) * r, 70 + R() * 70, -Math.cos(a) * r * 0.9 - 40);
      const w = 150 + R() * 140; s.scale.set(w, w * 0.36, 1);
      s.userData = { vx: 0.6 + R() * 0.8, x0: s.position.x };
      s.renderOrder = -5; scene.add(s); clouds.push(s);
    }
  }

  buildWorld(scene, mats, lite);
  const towers = L.TOWERS.map((t, i) => { const g = buildTower(t, i, mats); scene.add(g); return g; });

  // the home that glows: Tower A, floor 14
  const HT = L.TOWERS[L.HOME.tower], hy = L.LOBBY + (L.HOME.floor - 1) * L.FLOOR + 0.5;
  const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(1.0, 0.66, 0.36), transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const band = new THREE.Mesh(new THREE.BoxGeometry(HT.w + 0.08, 0.84, HT.d + 0.08), glowMat); band.position.y = hy; band.renderOrder = 2;
  const edgeMat = new THREE.LineBasicMaterial({ color: C('#fff3dc'), transparent: true, opacity: 0, toneMapped: false });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(HT.w + 0.24, 0.98, HT.d + 0.24)), edgeMat); edges.position.y = hy;
  towers[L.HOME.tower].add(band, edges);
  const H = homeTarget();
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: spriteTex(64, [[0, 'rgba(255,214,150,1)'], [0.35, 'rgba(255,170,90,.45)'], [1, 'rgba(255,140,60,0)']]), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, fog: false, opacity: 0 }));
  halo.position.set(H.x + Math.sin(H.nAz) * 0.8, H.y, H.z + Math.cos(H.nAz) * 0.8); halo.scale.set(13, 4.6, 1); halo.renderOrder = 3; scene.add(halo);
  const glowLight = lite ? null : new THREE.PointLight(C('#ffb874'), 0, 16, 1.6);
  if (glowLight) { glowLight.position.set(H.x + Math.sin(H.nAz) * 2.2, H.y, H.z + Math.cos(H.nAz) * 2.2); scene.add(glowLight); }

  // lamps along paths and the loop, switched on at dusk
  let lamps;
  {
    const pts = [];
    const ring = L.roundRect(L.SITE.x0 + 2.4, L.SITE.z0 + 2.4, L.SITE.x1 - 2.4, L.SITE.z1 - 2.4, L.SITE.r - 2.0, 3);
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4.2));
      for (let k = 0; k < n; k++) pts.push(a[0] + (b[0] - a[0]) * k / n, L.PODIUM + 0.6, a[1] + (b[1] - a[1]) * k / n);
    }
    for (let x = -18; x <= 18; x += 3) pts.push(x, L.PODIUM + 0.6, -2.2);
    for (let x = -84; x < 90; x += 7.5) { pts.push(x, 0.9, L.ROAD_Z - 3.4); pts.push(x + 3.7, 0.9, L.ROAD_Z + 3.4); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    lamps = new THREE.Points(g, new THREE.PointsMaterial({ size: 1.5, map: spriteTex(32, [[0, 'rgba(255,236,200,1)'], [0.3, 'rgba(255,196,120,.7)'], [1, 'rgba(255,170,90,0)']]), color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false, sizeAttenuation: true }));
    scene.add(lamps);
  }

  // traffic on Baner road
  const cars = [], carMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 0.62, 0.78), new THREE.MeshLambertMaterial({ color: 0xffffff }), lite ? 8 : 14);
  {
    const R = L.rng(31), cols = ['#f4f2ee', '#c9ccd0', '#b9433a', '#2b3236', '#d9d4c8', '#5c88a6', '#f4f2ee'];
    for (let i = 0; i < carMesh.count; i++) {
      const dir = i % 2 ? 1 : -1;
      cars.push({ dir, z: L.ROAD_Z + (dir > 0 ? 1.25 : -1.25), off: R() * 300, v: 5 + R() * 3.5 });
      carMesh.setColorAt(i, new THREE.Color(cols[i % cols.length]));
    }
    carMesh.castShadow = false; scene.add(carMesh);
  }

  // lights
  const hemi = new THREE.HemisphereLight(0xd5e6ef, 0xcdb996, 1.2); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe0b6, 3);
  sun.castShadow = true;
  const sm = lite ? 1024 : 2048;
  sun.shadow.mapSize.set(sm, sm);
  Object.assign(sun.shadow.camera, { left: -52, right: 52, top: 52, bottom: -52, near: 1, far: 380 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.05; sun.shadow.radius = lite ? 1.5 : 2.5;
  sun.target.position.set(0, 6, -2);
  scene.add(sun, sun.target);

  // tower labels
  const labels = (opts.labels || []).map((el, i) => ({ el, v: new THREE.Vector3(L.TOWERS[i].x, L.floorY(L.TOWERS[i].floors) + 3.6, L.TOWERS[i].z), on: -1 }));

  /* ---------------- state */
  let W = 1, Hh = 1, keys = makeKeys(mobile, 1);
  const cur = {}, tod = {};
  function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); Hh = Math.max(1, Math.round(r.height));
    renderer.setSize(W, Hh, false);
    cam.aspect = W / Hh;
    keys = makeKeys(mobile, cam.aspect);
  }
  resize();
  window.addEventListener('resize', resize);

  let sp = opts.getProgress ? opts.getProgress() : 0, first = true, last = performance.now(), clock = 0, running = true, raf = 0;
  const lastSun = new THREE.Vector3(9, 9, 9), sunDir = new THREE.Vector3();
  let intro = opts.instant ? 1 : 0, introT0 = 0;
  const tmpV = new THREE.Vector3(), carM = new THREE.Matrix4(), homeScr = { x: 0, y: 0, on: 0 };

  function frame(now) {
    if (!running) { raf = 0; return; }
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.25, Math.max(0, (now - last) / 1000)); last = now; clock += dt;
    const p = opts.getProgress ? opts.getProgress() : 0;
    if (first || Math.abs(p - sp) > 0.35) sp = p; else sp += (p - sp) * (1 - Math.exp(-dt * 5));

    // intro: the towers rise, the camera settles
    if (!opts.instant) {
      if (first) introT0 = now;
      intro = clamp((now - introT0 - 120) / 1900);
    }
    towers.forEach((g, i) => { const e = clamp(intro * 1.35 - i * 0.16); const s = e >= 1 ? 1 : 1 - Math.pow(2, -10 * e); g.scale.y = Math.max(0.002, s); });

    // camera
    sampleKeys(keys, sp, cur);
    const idle = opts.instant ? 0 : (0.7 - 0.45 * clamp(sp / 0.5));
    const az = cur.az + Math.sin(clock * 0.13) * 0.06 * idle;
    const el = cur.el + Math.sin(clock * 0.09 + 1) * 0.012 * idle;
    const dist = cur.dist * (1 + (1 - smooth(intro)) * 0.16);
    cam.fov = cur.fov;
    cam.position.set(cur.tx + dist * Math.sin(az) * Math.cos(el), cur.ty + dist * Math.sin(el), cur.tz + dist * Math.cos(az) * Math.cos(el));
    cam.lookAt(cur.tx, cur.ty, cur.tz);
    cam.setViewOffset(W, Hh, -(cur.fx - 0.5) * W, -(cur.fy - 0.5) * Hh, W, Hh);
    cam.updateProjectionMatrix();
    sky.position.copy(cam.position);

    // light: morning to golden dusk
    const t = smooth(clamp((sp - 0.02) / 0.86));
    sampleTOD(t, tod);
    sunDir.set(Math.sin(tod.az) * Math.cos(tod.el), Math.sin(tod.el), Math.cos(tod.az) * Math.cos(tod.el));
    sun.position.copy(sun.target.position).addScaledVector(sunDir, 170);
    sun.color.copy(tod.sun); sun.intensity = tod.sunI;
    hemi.color.copy(tod.hs); hemi.groundColor.copy(tod.hg); hemi.intensity = tod.hI;
    skyU.uZen.value.copy(tod.zen); skyU.uHorS.value.copy(tod.horS); skyU.uHorA.value.copy(tod.horA); skyU.uLow.value.copy(tod.low);
    skyU.uSun.value.copy(sunDir); skyU.uSunC.value.copy(tod.sun);
    scene.fog.color.copy(tod.fog);
    const wu = mats.water.uniforms;
    wu.uTime.value = clock; wu.uDeep.value.copy(tod.deep); wu.uShal.value.copy(tod.shal); wu.uSky.value.copy(tod.horA).lerp(tod.zen, 0.4); wu.uSun.value.copy(sunDir); wu.uSunC.value.copy(tod.sun);
    mats.facade.emissiveIntensity = tod.win;
    mats.glass.emissiveIntensity = tod.win * 0.9 + 0.05;
    lamps.material.opacity = tod.lamp;
    lamps.visible = tod.lamp > 0.01;
    for (const c of clouds) { c.material.color.copy(tod.cloud); c.position.x = c.userData.x0 + Math.sin(clock * 0.01 * c.userData.vx) * 30 + clock * c.userData.vx * 0.4; }

    // the home glows from stage two
    const gOn = smooth(clamp((sp - 0.44) / 0.16));
    const pulse = 0.88 + Math.sin(clock * 2.2) * 0.12;
    glowMat.opacity = gOn * 0.72 * (0.92 + 0.08 * pulse);
    edgeMat.opacity = gOn;
    halo.material.opacity = gOn * 0.55 * pulse;
    band.visible = edges.visible = halo.visible = gOn > 0.01;
    if (glowLight) glowLight.intensity = gOn * 14 * pulse;

    // traffic
    for (let i = 0; i < cars.length; i++) {
      const c = cars[i], x = ((c.off + clock * c.v) % 300) - 150;
      carMesh.setMatrixAt(i, carM.makeTranslation(c.dir > 0 ? x : -x, 0.33, c.z));
    }
    carMesh.instanceMatrix.needsUpdate = true;

    // shadows only re-render when the sun moved or the towers are rising
    if (sunDir.distanceToSquared(lastSun) > 2e-6 || intro < 1) { renderer.shadowMap.needsUpdate = true; lastSun.copy(sunDir); }

    renderer.render(scene, cam);

    // labels above the towers
    const la = (1 - smooth(clamp((sp - 0.06) / 0.1))) * smooth(clamp((intro - 0.55) / 0.35));
    for (const lb of labels) {
      if (la < 0.02) { if (lb.on !== 0) { lb.el.style.opacity = '0'; lb.el.style.visibility = 'hidden'; lb.on = 0; } continue; }
      tmpV.copy(lb.v).project(cam);
      lb.el.style.transform = 'translate3d(' + ((tmpV.x * 0.5 + 0.5) * W).toFixed(1) + 'px,' + ((-tmpV.y * 0.5 + 0.5) * Hh).toFixed(1) + 'px,0)';
      lb.el.style.opacity = la.toFixed(3);
      if (lb.on !== 1) { lb.el.style.visibility = 'visible'; lb.on = 1; }
    }

    if (opts.onFrame) {
      // where the glowing home sits on screen, so the page can point its floor plan at it
      tmpV.set(H.x, H.y, H.z).project(cam);
      homeScr.x = (tmpV.x * 0.5 + 0.5) * W; homeScr.y = (-tmpV.y * 0.5 + 0.5) * Hh; homeScr.on = gOn;
      opts.onFrame(sp, t, homeScr);
    }
    if (first) { first = false; if (opts.onFirstFrame) opts.onFirstFrame(); }
  }
  raf = requestAnimationFrame(frame);

  // only render while the hero is on screen
  if (opts.root && 'IntersectionObserver' in window) {
    new IntersectionObserver((es) => {
      const vis = es[0].isIntersecting;
      if (vis && !running) { running = true; last = performance.now(); if (!raf) raf = requestAnimationFrame(frame); }
      else if (!vis) running = false;
    }, { rootMargin: '80px 0px' }).observe(opts.root);
  }

  return { resize, progress: () => sp };
}
