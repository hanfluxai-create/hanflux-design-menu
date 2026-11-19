// Novaform particle organism: one Points mesh, six precomputed target shapes, morphed on the GPU.
import * as THREE from 'three';

const TAU = Math.PI * 2;

function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash3(x, y, z) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1440662683);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const a = hash3(xi, yi, zi), b = hash3(xi + 1, yi, zi), c = hash3(xi, yi + 1, zi), d = hash3(xi + 1, yi + 1, zi);
  const e = hash3(xi, yi, zi + 1), f = hash3(xi + 1, yi, zi + 1), g = hash3(xi, yi + 1, zi + 1), h = hash3(xi + 1, yi + 1, zi + 1);
  const x1 = a + (b - a) * u, x2 = c + (d - c) * u, x3 = e + (f - e) * u, x4 = g + (h - g) * u;
  const y1 = x1 + (x2 - x1) * v, y2 = x3 + (x4 - x3) * v;
  return y1 + (y2 - y1) * w;
}
function fbm(x, y, z) {
  let s = 0, a = 0.5, f = 1;
  for (let o = 0; o < 4; o++) { s += a * vnoise(x * f + 17.3, y * f - 4.1, z * f + 9.7); f *= 2.07; a *= 0.5; }
  return s;
}

/* ---------- target shapes (x, y, z, brightness) ---------- */

function makeSphere(N, rnd) {
  const out = new Float32Array(N * 4), R = 2.0;
  const nRing = Math.floor(N * 0.72), nDust = Math.floor(N * 0.2);
  const rings = N > 30000 ? 62 : 38;
  let total = 0;
  const wts = [];
  for (let k = 0; k < rings; k++) { const s = Math.sin(Math.PI * (k + 0.5) / rings); wts.push(s); total += s; }
  let n = 0;
  for (let k = 0; k < rings && n < nRing; k++) {
    const th = Math.PI * (k + 0.5) / rings, cnt = Math.max(8, Math.round(nRing * wts[k] / total));
    for (let j = 0; j < cnt && n < nRing; j++, n++) {
      const ph = (j / cnt) * TAU + k * 0.37 + (rnd() - 0.5) * 0.004, r = R * (1 + (rnd() - 0.5) * 0.01), o = n * 4;
      out[o] = r * Math.sin(th) * Math.cos(ph); out[o + 1] = r * Math.cos(th); out[o + 2] = r * Math.sin(th) * Math.sin(ph); out[o + 3] = 1;
    }
  }
  for (; n < nRing + nDust; n++) {
    const u = rnd() * 2 - 1, th = rnd() * TAU, s = Math.sqrt(1 - u * u), r = R * (1 + (rnd() - 0.5) * 0.12), o = n * 4;
    out[o] = r * s * Math.cos(th); out[o + 1] = r * u; out[o + 2] = r * s * Math.sin(th); out[o + 3] = 0.32;
  }
  for (; n < N; n++) {
    const u = rnd() * 2 - 1, th = rnd() * TAU, s = Math.sqrt(1 - u * u), r = R * 0.62 * Math.pow(rnd(), 0.6), o = n * 4;
    out[o] = r * s * Math.cos(th); out[o + 1] = r * u; out[o + 2] = r * s * Math.sin(th); out[o + 3] = 0.2;
  }
  return out;
}

function makeWave(N, rnd, rows) {
  const out = new Float32Array(N * 4), per = Math.ceil(N / rows);
  for (let i = 0; i < N; i++) {
    const o = i * 4, row = Math.floor(i / per);
    out[o] = (rnd() * 2 - 1) * 4.4;
    out[o + 1] = (rnd() - 0.5) * 0.03;
    out[o + 2] = -2.3 + (row / (rows - 1)) * 4.6 + (rnd() - 0.5) * 0.02;
    out[o + 3] = 0.55 + 0.45 * (row % 3 === 0 ? 1 : 0.6);
  }
  return out;
}

function makeTorus(N, rnd) {
  const out = new Float32Array(N * 4), R = 1.65, r = 0.5;
  for (let i = 0; i < N; i++) {
    const o = i * 4;
    if (i % 16 === 0) { // thin orbit ring
      const u = rnd() * TAU, rr = 2.45 + (rnd() - 0.5) * 0.05;
      out[o] = Math.cos(u) * rr; out[o + 1] = (rnd() - 0.5) * 0.03; out[o + 2] = Math.sin(u) * rr; out[o + 3] = 0.5;
      continue;
    }
    const u = (i / N) * TAU + (rnd() - 0.5) * 0.02;
    let v;
    for (;;) { v = rnd() * TAU; if (rnd() < (R + r * Math.cos(v)) / (R + r)) break; }
    const rr = r * (1 + (rnd() - 0.5) * 0.06);
    out[o] = (R + rr * Math.cos(v)) * Math.cos(u);
    out[o + 1] = rr * Math.sin(v);
    out[o + 2] = (R + rr * Math.cos(v)) * Math.sin(u);
    out[o + 3] = 0.85;
  }
  return out;
}

function makeBars(N, rnd) {
  const out = new Float32Array(N * 4), GX = 9, GZ = 7, sp = 0.5, bw = 0.32, base = -1.35;
  const bars = [];
  let total = 0;
  for (let z = 0; z < GZ; z++) for (let x = 0; x < GX; x++) {
    const trend = (x / (GX - 1)) * 0.65 + (1 - z / (GZ - 1)) * 0.35;
    const h = 0.32 + 2.55 * Math.pow(trend, 1.35) + (hash3(x, z, 3) - 0.5) * 0.55;
    const b = { cx: (x - (GX - 1) / 2) * sp, cz: (z - (GZ - 1) / 2) * sp, h: Math.max(0.22, h) };
    b.wgt = b.h + 0.6; total += b.wgt; bars.push(b);
  }
  let acc = 0; bars.forEach(b => { acc += b.wgt / total; b.cum = acc; });
  const hw = bw / 2;
  for (let i = 0; i < N; i++) {
    const o = i * 4, q = i / N;
    let b = bars[bars.length - 1];
    for (let k = 0; k < bars.length; k++) if (q <= bars[k].cum) { b = bars[k]; break; }
    const f = rnd();
    let x, y, z, br = 1;
    if (f < 0.66) { // vertical edges
      const c = (rnd() * 4) | 0;
      x = b.cx + (c & 1 ? hw : -hw); z = b.cz + (c & 2 ? hw : -hw); y = base + rnd() * b.h;
    } else if (f < 0.9) { // top outline
      const s = rnd() * 4, t = rnd() * 2 - 1, side = s | 0;
      x = b.cx + (side === 0 ? -hw : side === 1 ? hw : t * hw);
      z = b.cz + (side === 2 ? -hw : side === 3 ? hw : t * hw);
      y = base + b.h;
    } else { // faces
      const side = (rnd() * 5) | 0, t = rnd() * 2 - 1;
      if (side === 4) { x = b.cx + t * hw; z = b.cz + (rnd() * 2 - 1) * hw; y = base + b.h; }
      else {
        x = b.cx + (side < 2 ? (side ? hw : -hw) : t * hw);
        z = b.cz + (side >= 2 ? (side === 3 ? hw : -hw) : t * hw);
        y = base + rnd() * b.h;
      }
      br = 0.3;
    }
    out[o] = x; out[o + 1] = y; out[o + 2] = z; out[o + 3] = br;
  }
  return out;
}

function makeGlobe(N, rnd) {
  const out = new Float32Array(N * 4), R = 2.0;
  const nLand = Math.floor(N * 0.6), nSea = Math.floor(N * 0.2), nAir = Math.floor(N * 0.08);
  const nArc = N - nLand - nSea - nAir;
  // land on a Fibonacci lattice: score every lattice point, keep the top third as continents
  const K = Math.round(nLand / 0.34), ga = Math.PI * (3 - Math.sqrt(5));
  const lat = new Float32Array(K * 3), score = new Float32Array(K);
  for (let i = 0; i < K; i++) {
    const y = 1 - ((i + 0.5) / K) * 2, rad = Math.sqrt(1 - y * y), th = ga * i;
    const x = Math.cos(th) * rad, z = Math.sin(th) * rad;
    lat[i * 3] = x; lat[i * 3 + 1] = y; lat[i * 3 + 2] = z;
    score[i] = fbm(x * 1.55, y * 1.55, z * 1.55) - Math.abs(y) * 0.06;
  }
  const sorted = Float32Array.from(score).sort();
  const thr = sorted[Math.max(0, K - nLand)];
  const landDirs = [];
  let n = 0;
  for (let i = 0; i < K && n < nLand; i++) {
    if (score[i] < thr) continue;
    const o = n * 4;
    out[o] = lat[i * 3] * R; out[o + 1] = lat[i * 3 + 1] * R; out[o + 2] = lat[i * 3 + 2] * R; out[o + 3] = 1;
    if (n % 97 === 0) landDirs.push([lat[i * 3], lat[i * 3 + 1], lat[i * 3 + 2]]);
    n++;
  }
  while (n < nLand) { // safety fill
    const u = rnd() * 2 - 1, th = rnd() * TAU, s = Math.sqrt(1 - u * u), o = n * 4;
    out[o] = s * Math.cos(th) * R; out[o + 1] = u * R; out[o + 2] = s * Math.sin(th) * R; out[o + 3] = 0.6; n++;
  }
  for (let i = 0; i < nSea; i++, n++) {
    const u = rnd() * 2 - 1, th = rnd() * TAU, s = Math.sqrt(1 - u * u), o = n * 4;
    out[o] = s * Math.cos(th) * R * 0.995; out[o + 1] = u * R * 0.995; out[o + 2] = s * Math.sin(th) * R * 0.995; out[o + 3] = 0.16;
  }
  for (let i = 0; i < nAir; i++, n++) {
    const u = rnd() * 2 - 1, th = rnd() * TAU, s = Math.sqrt(1 - u * u), rr = R * (1.04 + rnd() * rnd() * 0.16), o = n * 4;
    out[o] = s * Math.cos(th) * rr; out[o + 1] = u * rr; out[o + 2] = s * Math.sin(th) * rr; out[o + 3] = 0.16;
  }
  // flight arcs between "store" clusters, tagged (+2) for pink colouring
  const arcs = 9, per = Math.ceil(nArc / arcs);
  for (let a = 0; a < arcs; a++) {
    const p = landDirs[(a * 7) % landDirs.length], q = landDirs[(a * 13 + 5) % landDirs.length];
    const dot = Math.max(-0.99, Math.min(0.99, p[0] * q[0] + p[1] * q[1] + p[2] * q[2]));
    const om = Math.acos(dot), so = Math.sin(om) || 1;
    for (let k = 0; k < per && n < N; k++, n++) {
      const t = rnd(), s1 = Math.sin((1 - t) * om) / so, s2 = Math.sin(t * om) / so;
      const lift = 1 + Math.sin(Math.PI * t) * (0.12 + om * 0.1);
      const o = n * 4;
      out[o] = (p[0] * s1 + q[0] * s2) * R * lift; out[o + 1] = (p[1] * s1 + q[1] * s2) * R * lift; out[o + 2] = (p[2] * s1 + q[2] * s2) * R * lift;
      out[o + 3] = 2.0 + 0.85;
    }
  }
  return out;
}

function sampleWord(N, rnd, family) {
  const W = 1000, H = 320, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  const word = 'NOVA';
  let fs = 250;
  g.font = `600 ${fs}px ${family}`;
  const track = 0.06;
  const measure = () => [...word].reduce((s, ch) => s + g.measureText(ch).width, 0) + fs * track * (word.length - 1);
  let tw = measure();
  if (tw > W * 0.94) { fs = fs * (W * 0.94) / tw; g.font = `600 ${fs}px ${family}`; tw = measure(); }
  g.fillStyle = '#fff'; g.textBaseline = 'middle';
  let x = (W - tw) / 2;
  for (const ch of word) { g.fillText(ch, x, H / 2 + fs * 0.04); x += g.measureText(ch).width + fs * track; }
  const d = g.getImageData(0, 0, W, H).data, fill = [], edge = [];
  for (let y = 1; y < H - 1; y += 1) for (let x2 = 1; x2 < W - 1; x2 += 1) {
    const i = (y * W + x2) * 4 + 3;
    if (d[i] < 128) continue;
    if (d[i - 4] < 128 || d[i + 4] < 128 || d[i - W * 4] < 128 || d[i + W * 4] < 128) edge.push(x2, y);
    else if ((x2 + y) % 2 === 0) fill.push(x2, y);
  }
  const out = new Float32Array(N * 4), worldW = 7.2, nWord = Math.floor(N * 0.8);
  for (let i = 0; i < N; i++) {
    const o = i * 4;
    if (i < nWord && fill.length) {
      const useEdge = rnd() < 0.5 && edge.length;
      const arr = useEdge ? edge : fill, k = ((rnd() * (arr.length / 2)) | 0) * 2;
      out[o] = ((arr[k] + rnd() - 0.5 - W / 2) / W) * worldW;
      out[o + 1] = -((arr[k + 1] + rnd() - 0.5 - H / 2) / W) * worldW;
      out[o + 2] = (rnd() - 0.5) * 0.12;
      out[o + 3] = useEdge ? 0.95 : 0.6;
    } else {
      const th = rnd() * TAU, r = Math.sqrt(rnd());
      out[o] = Math.cos(th) * r * 6.5; out[o + 1] = Math.sin(th) * r * 3.6; out[o + 2] = (rnd() - 0.5) * 5 - 1; out[o + 3] = 0.12;
    }
  }
  return out;
}

/* ---------- shaders ---------- */

const VERT = /* glsl */`
uniform float uTime, uMorph, uSize, uPR, uScatter, uAspect, uOpacity, uMouseStr, uTanHalf, uScale;
uniform vec2 uMouse;
uniform vec3 uC1, uC2, uC3;
attribute vec4 pA, pB, pC, pD, pE, pF, aRnd;
varying vec3 vCol;
varying float vA;
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
vec3 flow(vec3 p, float t){
  return vec3(
    sin(p.y * 1.7 + t * 0.63) + 0.5 * sin(p.z * 2.9 - t * 0.81),
    sin(p.z * 1.3 + t * 0.52) + 0.5 * sin(p.x * 2.3 + t * 0.74),
    sin(p.x * 1.5 - t * 0.44) + 0.5 * sin(p.y * 2.7 + t * 0.93));
}
void main(){
  float seg = floor(uMorph);
  float f = uMorph - seg;
  float dl = aRnd.x * 0.42;
  float fs = smoothstep(dl, dl + 0.58, f);
  float mm = seg + fs;
  float w0 = max(0.0, 1.0 - abs(mm));
  float w1 = max(0.0, 1.0 - abs(mm - 1.0));
  float w2 = max(0.0, 1.0 - abs(mm - 2.0));
  float w3 = max(0.0, 1.0 - abs(mm - 3.0));
  float w4 = max(0.0, 1.0 - abs(mm - 4.0));
  float w5 = max(0.0, 1.0 - abs(mm - 5.0));
  float t = uTime;

  vec3 a = pA.xyz;
  vec3 an = normalize(a + 1e-4);
  a *= 1.0 + 0.045 * sin(t * 1.15) + 0.07 * sin(an.x * 3.0 + t * 0.8) * sin(an.y * 3.3 - t * 0.65) + 0.03 * sin(an.z * 5.0 + t * 1.3);
  a.xz = rot(t * 0.1) * a.xz;
  a.yz = rot(0.25) * a.yz;

  vec3 b = pB.xyz;
  b.x = mod(b.x + 4.4 + t * (0.32 + aRnd.y * 0.5), 8.8) - 4.4;
  float edge = smoothstep(4.4, 3.2, abs(b.x));
  b.y += 0.36 * sin(b.x * 0.9 - t * 1.1 + b.z * 0.5) + 0.2 * sin(b.z * 1.7 + b.x * 0.5 - t * 0.8) + 0.07 * sin(b.x * 3.7 + t * 1.9);
  b.yz = rot(0.42) * b.yz;
  b.xz = rot(-0.18) * b.xz;

  vec3 c = pC.xyz;
  c.xz = rot(t * 0.22) * c.xz;
  c.yz = rot(1.1 + 0.08 * sin(t * 0.4)) * c.yz;
  c.xy = rot(0.34) * c.xy;

  vec3 d = pD.xyz;
  float grow = smoothstep(0.0, 1.0, w3 * 1.35 - aRnd.w * 0.35);
  d.y = mix(-1.35, d.y, grow);
  d.xz = rot(0.62 + sin(t * 0.12) * 0.25) * d.xz;
  d.yz = rot(0.36) * d.yz;

  vec3 e = pE.xyz;
  float tagE = step(1.5, pE.w);
  float bE = pE.w - 2.0 * tagE;
  e.xz = rot(t * 0.16) * e.xz;
  e.yz = rot(0.38) * e.yz;

  vec3 g = pF.xyz;
  g.y += 0.025 * sin(t * 1.4 + g.x * 1.3);
  g.z += 0.05 * sin(t * 0.9 + g.x * 0.7);

  vec3 p = a * w0 + b * w1 + c * w2 + d * w3 + e * w4 + g * w5;
  float bright = pA.w * w0 + pB.w * w1 * edge + pC.w * w2 + pD.w * w3 + bE * w4 + pF.w * w5;

  float trans = sin(fs * 3.14159265);
  float drift = 0.012 * w0 + 0.075 * w1 + 0.03 * w2 + 0.006 * w3 + 0.012 * w4 + 0.01 * w5;
  float scan = exp(-pow((an.y - sin(t * 0.45) * 0.9) * 7.0, 2.0)) * w0;
  bright *= 1.0 + scan * 1.6;
  p += flow(p * 0.8 + aRnd.yzw * 3.0, t * 0.7) * (drift + trans * 0.4 + uScatter);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 ctr = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float df = clamp((mv.z - ctr.z) / (4.4 * uScale) + 0.5, 0.0, 1.0);
  vec4 cp = projectionMatrix * mv;
  vec2 ndc = cp.xy / cp.w;
  vec2 dv = (ndc - uMouse) * vec2(uAspect, 1.0);
  float dist = length(dv);
  float push = uMouseStr * smoothstep(0.34, 0.0, dist);
  mv.xy += normalize(dv + vec2(1e-4)) * push * 0.32 * (-mv.z) * uTanHalf;
  gl_Position = projectionMatrix * mv;

  float big = step(0.986, aRnd.y);
  float sz = uSize * (0.55 + aRnd.w * 0.9) * (1.0 + big * 1.8);
  gl_PointSize = max(1.0, sz * (0.72 + 0.5 * df) * uPR * (10.0 / -mv.z));

  float h = clamp(p.y * 0.2 + 0.5 + (aRnd.z - 0.5) * 0.28, 0.0, 1.0);
  vec3 col = mix(uC2, uC1, smoothstep(0.22, 0.86, h));
  float pinkness = max(step(0.975, aRnd.z), tagE * w4);
  col = mix(col, uC3, pinkness * 0.9);
  col += push * 0.5 + scan * vec3(0.1, 0.35, 0.4);
  vA = bright * uOpacity * (0.42 + 0.58 * aRnd.y) * (1.0 - big * 0.65) * (0.22 + 0.78 * df);
  vA *= 1.0 + pinkness * 0.5 * sin(t * 3.0 + aRnd.x * 40.0);
  vCol = col;
}`;

const FRAG = /* glsl */`
precision highp float;
varying vec3 vCol;
varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c) * 4.0;
  if (d > 1.0) discard;
  float a = 1.0 - d; a *= a * a;
  float core = exp(-d * 9.0);
  gl_FragColor = vec4(vCol + core * 0.3, a * vA);
}`;

const STAR_VERT = /* glsl */`
uniform float uTime, uPR;
attribute vec2 aR;
varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (0.8 + aR.x * 1.6) * uPR * (14.0 / -mv.z);
  vA = (0.25 + 0.75 * aR.y) * (0.55 + 0.45 * sin(uTime * (0.6 + aR.x * 2.0) + aR.y * 50.0));
}`;
const STAR_FRAG = /* glsl */`
precision highp float;
varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c) * 4.0;
  if (d > 1.0) discard;
  gl_FragColor = vec4(vec3(0.78, 0.84, 1.0), (1.0 - d) * vA * 0.7);
}`;

/* ---------- field ---------- */

export function createField(canvas, { getTarget, lite, mobile, onFirstFrame }) {
  const N = lite ? 18000 : 60000;
  const rnd = mulberry(20260214);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false, depth: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));
  renderer.setClearColor(0x04050b, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const geo = new THREE.BufferGeometry();
  const rndAttr = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    rndAttr[i * 4] = (i / N) * 0.55 + rnd() * 0.45;
    rndAttr[i * 4 + 1] = rnd(); rndAttr[i * 4 + 2] = rnd(); rndAttr[i * 4 + 3] = rnd();
  }
  const sphere = makeSphere(N, rnd);
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  geo.setAttribute('pA', new THREE.BufferAttribute(sphere, 4));
  geo.setAttribute('pB', new THREE.BufferAttribute(makeWave(N, rnd, lite ? 46 : 84), 4));
  geo.setAttribute('pC', new THREE.BufferAttribute(makeTorus(N, rnd), 4));
  geo.setAttribute('pD', new THREE.BufferAttribute(makeBars(N, rnd), 4));
  geo.setAttribute('pE', new THREE.BufferAttribute(makeGlobe(N, rnd), 4));
  const word = new THREE.BufferAttribute(sampleWord(N, rnd, '"Arial Black", "Helvetica Neue", Arial, sans-serif'), 4);
  geo.setAttribute('pF', word);
  geo.setAttribute('aRnd', new THREE.BufferAttribute(rndAttr, 4));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);

  const uniforms = {
    uTime: { value: 0 }, uMorph: { value: 0 }, uSize: { value: lite ? 3.3 : 2.5 },
    uPR: { value: renderer.getPixelRatio() }, uScatter: { value: 0 }, uAspect: { value: 1 },
    uOpacity: { value: 1 }, uMouse: { value: new THREE.Vector2(9, 9) }, uMouseStr: { value: 0 },
    uTanHalf: { value: Math.tan(THREE.MathUtils.degToRad(19)) }, uScale: { value: 1 },
    uC1: { value: new THREE.Color('#5ef2ff') }, uC2: { value: new THREE.Color('#a78bfa') }, uC3: { value: new THREE.Color('#ff6ad5') }
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  // soft halo behind the organism (a cheap bloom)
  const haloMat = new THREE.ShaderMaterial({
    uniforms: { uA: { value: 0.5 }, uC1: uniforms.uC1, uC2: uniforms.uC2, uTime: uniforms.uTime },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'precision highp float; varying vec2 vUv; uniform float uA, uTime; uniform vec3 uC1, uC2; void main(){ vec2 c = vUv - 0.5; float d = length(c) * 2.0; float g = exp(-d * d * 3.2) * (1.0 - smoothstep(0.75, 1.0, d)); vec3 col = mix(uC2, uC1, vUv.y + 0.1 * sin(uTime * 0.5)); gl_FragColor = vec4(col, g * uA); }',
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending
  });
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), haloMat);
  halo.renderOrder = -1;
  scene.add(halo);

  // distant star dust for depth
  const S = lite ? 700 : 1500, sp = new Float32Array(S * 3), sr = new Float32Array(S * 2);
  for (let i = 0; i < S; i++) {
    sp[i * 3] = (rnd() * 2 - 1) * 22; sp[i * 3 + 1] = (rnd() * 2 - 1) * 16; sp[i * 3 + 2] = -6 - rnd() * 22;
    sr[i * 2] = rnd(); sr[i * 2 + 1] = rnd();
  }
  const sgeo = new THREE.BufferGeometry();
  sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  sgeo.setAttribute('aR', new THREE.BufferAttribute(sr, 2));
  const smat = new THREE.ShaderMaterial({ vertexShader: STAR_VERT, fragmentShader: STAR_FRAG, uniforms: { uTime: uniforms.uTime, uPR: uniforms.uPR }, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  const stars = new THREE.Points(sgeo, smat);
  stars.frustumCulled = false;
  scene.add(stars);

  // the word NOVA in the brand face, once it has loaded
  const fam = '"Unbounded", "Arial Black", sans-serif';
  const loadFont = document.fonts && document.fonts.load ? document.fonts.load('600 200px "Unbounded"') : Promise.resolve();
  Promise.race([loadFont, new Promise(r => setTimeout(r, 3500))]).then(() => {
    if (document.fonts && document.fonts.check && !document.fonts.check('600 200px "Unbounded"')) return;
    word.array.set(sampleWord(N, mulberry(77), fam));
    word.needsUpdate = true;
  }).catch(() => {});

  // pointer
  const pointer = { x: 9, y: 9, active: false, last: 0 };
  const finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (finePointer) {
    window.addEventListener('pointermove', e => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointer.active = true; pointer.last = performance.now();
    }, { passive: true });
    document.addEventListener('pointerleave', () => { pointer.active = false; });
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uAspect.value = w / h;
    uniforms.uPR.value = renderer.getPixelRatio();
  }
  resize();
  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });

  const cur = Object.assign({}, getTarget());
  let last = performance.now(), time = 0, first = true, lastScroll = window.scrollY, scatter = 0;
  const mouse = uniforms.uMouse.value;
  const reduced = !!(window.HX && window.HX.reducedMotion);

  function frame(now) {
    const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
    last = now;
    time += dt * (reduced ? 0.25 : 1);
    const tg = getTarget();
    const k = first ? 1 : 1 - Math.exp(-dt * 3.0);
    for (const key in tg) cur[key] += (tg[key] - cur[key]) * k;

    uniforms.uTime.value = time;
    uniforms.uMorph.value = Math.max(0, Math.min(5, cur.m));
    uniforms.uOpacity.value = cur.o;
    points.position.set(cur.x, cur.y, 0);
    points.scale.setScalar(cur.s);
    points.rotation.z = cur.r || 0;
    uniforms.uScale.value = cur.s;
    const mm = uniforms.uMorph.value, bump = k2 => Math.max(0, 1 - Math.abs(mm - k2));
    const hs = cur.s * 5.6;
    halo.position.set(cur.x, cur.y + bump(3) * -0.2, -0.5);
    halo.scale.set(hs * (1 + bump(1) * 0.9 + bump(5) * 1.15), hs * (1 - bump(1) * 0.35 - bump(5) * 0.45), 1);
    haloMat.uniforms.uA.value = cur.o * (0.2 * bump(0) + 0.1 * bump(1) + 0.14 * bump(2) + 0.1 * bump(3) + 0.16 * bump(4) + 0.13 * bump(5));

    const sy = window.scrollY;
    const v = Math.abs(sy - lastScroll) / dt;
    lastScroll = sy;
    scatter += (Math.min(0.22, v / 9000) - scatter) * (1 - Math.exp(-dt * 5));
    uniforms.uScatter.value = scatter;
    stars.position.y = (sy / Math.max(1, document.documentElement.scrollHeight)) * 6;

    const live = pointer.active && now - pointer.last < 2600;
    uniforms.uMouseStr.value += ((live ? 1 : 0) - uniforms.uMouseStr.value) * (1 - Math.exp(-dt * 3));
    mouse.x += (pointer.x - mouse.x) * (1 - Math.exp(-dt * 10));
    mouse.y += (pointer.y - mouse.y) * (1 - Math.exp(-dt * 10));
    camera.position.x += ((finePointer && live ? pointer.x * 0.22 : 0) - camera.position.x) * (1 - Math.exp(-dt * 2));
    camera.position.y += ((finePointer && live ? pointer.y * 0.14 : 0) - camera.position.y) * (1 - Math.exp(-dt * 2));
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    if (first) { first = false; onFirstFrame && onFirstFrame(); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { renderer, resize };
}
