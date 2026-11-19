// Lumen Dental hero: aurora backdrop + real refractive glass forms (MeshPhysicalMaterial transmission).
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const HX = window.HX || { lite: false, device: 'desktop', embed: false, ready() {}, on() {} };

/* ---------------- signed distance helpers (tooth) ---------------- */
const sqrt = Math.sqrt, max = Math.max, min = Math.min, abs = Math.abs;
function smin(a, b, k) { const h = max(k - abs(a - b), 0) / k; return min(a, b) - h * h * k * 0.25; }
function smax(a, b, k) { return -smin(-a, -b, k); }
function sdSphere(x, y, z, r) { return sqrt(x * x + y * y + z * z) - r; }
function sdRoundBox(x, y, z, bx, by, bz, r) {
  const qx = abs(x) - bx + r, qy = abs(y) - by + r, qz = abs(z) - bz + r;
  const ox = max(qx, 0), oy = max(qy, 0), oz = max(qz, 0);
  return sqrt(ox * ox + oy * oy + oz * oz) + min(max(qx, qy, qz), 0) - r;
}
function sdEllipsoid(x, y, z, rx, ry, rz) {
  const ax = x / rx, ay = y / ry, az = z / rz;
  const bx = x / (rx * rx), by = y / (ry * ry), bz = z / (rz * rz);
  const k0 = sqrt(ax * ax + ay * ay + az * az), k1 = max(sqrt(bx * bx + by * by + bz * bz), 1e-6);
  return k0 * (k0 - 1) / k1;
}
function sdTaper(x, y, z, ax, ay, az, bx, by, bz, r1, r2) {
  const px = x - ax, py = y - ay, pz = z - az, dx = bx - ax, dy = by - ay, dz = bz - az;
  const h = min(max((px * dx + py * dy + pz * dz) / (dx * dx + dy * dy + dz * dz), 0), 1);
  const qx = px - dx * h, qy = py - dy * h, qz = pz - dz * h;
  return sqrt(qx * qx + qy * qy + qz * qz) - (r1 + (r2 - r1) * h);
}
// A stylised molar: soft crown with four cusps and a fissure, a cervical neck and two tapering roots.
function toothSDF(x, y, z) {
  let d = sdRoundBox(x, y - 0.34, z, 0.57, 0.30, 0.50, 0.27);
  d = smin(d, sdSphere(x - 0.25, y - 0.60, z - 0.21, 0.255), 0.15);
  d = smin(d, sdSphere(x + 0.25, y - 0.60, z - 0.21, 0.255), 0.15);
  d = smin(d, sdSphere(x - 0.26, y - 0.57, z + 0.22, 0.245), 0.15);
  d = smin(d, sdSphere(x + 0.26, y - 0.57, z + 0.22, 0.245), 0.15);
  d = smax(d, -sdEllipsoid(x, y - 0.90, z, 0.10, 0.16, 0.46), 0.10);
  d = smax(d, -sdEllipsoid(x, y - 0.90, z, 0.46, 0.15, 0.09), 0.10);
  d = smin(d, sdRoundBox(x, y + 0.02, z, 0.45, 0.17, 0.41, 0.17), 0.17);
  d = smin(d, sdTaper(x, y, z, 0.25, -0.02, 0.0, 0.33, -1.02, 0.05, 0.28, 0.075), 0.17);
  d = smin(d, sdTaper(x, y, z, -0.25, -0.02, 0.0, -0.30, -0.98, -0.04, 0.28, 0.075), 0.17);
  return d;
}

/* ---------------- surface nets mesher ---------------- */
function surfaceNets(sdf, lo, hi, cell) {
  const nx = Math.ceil((hi[0] - lo[0]) / cell) + 1, ny = Math.ceil((hi[1] - lo[1]) / cell) + 1, nz = Math.ceil((hi[2] - lo[2]) / cell) + 1;
  const N = nx * ny * nz, field = new Float32Array(N);
  let n = 0;
  for (let k = 0; k < nz; k++) { const z = lo[2] + k * cell;
    for (let j = 0; j < ny; j++) { const y = lo[1] + j * cell;
      for (let i = 0; i < nx; i++) field[n++] = sdf(lo[0] + i * cell, y, z); } }
  const sxy = nx * ny;
  const cid = new Int32Array(N).fill(-1);
  const verts = [];
  const co = [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1];
  const ep = [0, 1, 2, 3, 4, 5, 6, 7, 0, 2, 1, 3, 4, 6, 5, 7, 0, 4, 1, 5, 2, 6, 3, 7];
  const v = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const base = i + nx * j + sxy * k;
    let neg = 0;
    for (let c = 0; c < 8; c++) { v[c] = field[base + co[c * 3] + nx * co[c * 3 + 1] + sxy * co[c * 3 + 2]]; if (v[c] < 0) neg++; }
    if (neg === 0 || neg === 8) continue;
    let sx = 0, sy = 0, sz = 0, cnt = 0;
    for (let e = 0; e < 12; e++) {
      const a = ep[e * 2], b = ep[e * 2 + 1], va = v[a], vb = v[b];
      if ((va < 0) === (vb < 0)) continue;
      const t = va / (va - vb);
      sx += co[a * 3] + (co[b * 3] - co[a * 3]) * t;
      sy += co[a * 3 + 1] + (co[b * 3 + 1] - co[a * 3 + 1]) * t;
      sz += co[a * 3 + 2] + (co[b * 3 + 2] - co[a * 3 + 2]) * t;
      cnt++;
    }
    cid[base] = verts.length / 3;
    verts.push(lo[0] + (i + sx / cnt) * cell, lo[1] + (j + sy / cnt) * cell, lo[2] + (k + sz / cnt) * cell);
  }
  const idx = [];
  const quad = (a, b, c, d, flip) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; if (flip) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d); };
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const p = i + nx * j + sxy * k, f0 = field[p] < 0;
    if (f0 !== (field[p + 1] < 0)) quad(cid[p - nx - sxy], cid[p - sxy], cid[p], cid[p - nx], !f0);
    if (f0 !== (field[p + nx] < 0)) quad(cid[p - 1 - sxy], cid[p - 1], cid[p], cid[p - sxy], !f0);
    if (f0 !== (field[p + sxy] < 0)) quad(cid[p - 1 - nx], cid[p - nx], cid[p], cid[p - 1], !f0);
  }
  // project to the surface and take normals from the field gradient
  const P = new Float32Array(verts), Nn = new Float32Array(P.length), e = cell * 0.5;
  for (let q = 0; q < P.length; q += 3) {
    let x = P[q], y = P[q + 1], z = P[q + 2];
    for (let it = 0; it < 2; it++) {
      const d = sdf(x, y, z);
      let gx = sdf(x + e, y, z) - sdf(x - e, y, z), gy = sdf(x, y + e, z) - sdf(x, y - e, z), gz = sdf(x, y, z + e) - sdf(x, y, z - e);
      const gl = sqrt(gx * gx + gy * gy + gz * gz) || 1; gx /= gl; gy /= gl; gz /= gl;
      x -= gx * d; y -= gy * d; z -= gz * d;
      Nn[q] = gx; Nn[q + 1] = gy; Nn[q + 2] = gz;
    }
    P[q] = x; P[q + 1] = y; P[q + 2] = z;
  }
  // make the winding agree with the outward normal
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2];
    const wx = P[c] - P[a], wy = P[c + 1] - P[a + 1], wz = P[c + 2] - P[a + 2];
    const cx = uy * wz - uz * wy, cy = uz * wx - ux * wz, cz = ux * wy - uy * wx;
    if (cx * (Nn[a] + Nn[b] + Nn[c]) + cy * (Nn[a + 1] + Nn[b + 1] + Nn[c + 1]) + cz * (Nn[a + 2] + Nn[b + 2] + Nn[c + 2]) < 0) { const s = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = s; }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(Nn, 3));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return g;
}

/* ---------------- pebbles ---------------- */
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function pebble(seed, sx, sy, sz, detail) {
  let g = new THREE.IcosahedronGeometry(1, detail);
  g.deleteAttribute('normal'); g.deleteAttribute('uv');
  g = mergeVertices(g);
  const r = rng(seed), a = r() * 6, b = r() * 6, c = r() * 6, p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 1 + 0.055 * Math.sin(x * 2.2 + a) * Math.sin(y * 1.9 + b) + 0.04 * Math.sin(z * 2.6 + c + x * 1.3);
    p.setXYZ(i, x * sx * k, y * sy * k, z * sz * k);
  }
  g.computeVertexNormals();
  return g;
}

/* ---------------- aurora backdrop ---------------- */
// 1) the soft noise aurora is fragment-heavy: rendered at half resolution into a target
// 2) a cheap full-resolution composite adds the crisp halo, rings, shadows and the calm mask
const quadVert = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`;
const auroraFrag = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uTime, uMobile;
uniform vec2 uRes, uPointer;
uniform vec3 cBase, cAqua, cLilac, cTeal, cSky, cWhite;
vec2 h2(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return -1.0 + 2.0*fract(sin(p)*43758.5453); }
float gn(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(dot(h2(i),f), dot(h2(i+vec2(1,0)),f-vec2(1,0)),u.x), mix(dot(h2(i+vec2(0,1)),f-vec2(0,1)), dot(h2(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y); }
float fbm(vec2 p){ float s=0.0, a=0.55; for(int i=0;i<3;i++){ s+=a*gn(p); p=p*2.02+vec2(1.7,9.2); a*=0.5; } return s; }
float blob(vec2 p, vec2 c, float r){ vec2 d=p-c; return exp(-dot(d,d)/(r*r)); }
void main(){
  float asp = uRes.x / uRes.y;
  vec2 p = vec2((vUv.x-0.5)*asp, vUv.y-0.5);
  float t = uTime;
  vec2 F = mix(vec2(0.26*asp, 0.06), vec2(0.06*asp, 0.27), uMobile) + uPointer * vec2(0.03, 0.02);
  vec2 q = p + 0.16*vec2(fbm(p*1.3 + vec2(t*0.035, -t*0.02)), fbm(p*1.3 + vec2(-t*0.03, t*0.025) + 5.2));
  float S = mix(1.0, 0.72, uMobile);
  vec3 col = cBase;
  col = mix(col, cAqua, 0.95*blob(q, F + S*vec2(0.10 + 0.05*sin(t*0.11), 0.12 + 0.04*cos(t*0.13)), 0.42*S));
  col = mix(col, cLilac, 0.92*blob(q, F + S*vec2(0.30 + 0.06*cos(t*0.09), -0.22 + 0.05*sin(t*0.12)), 0.40*S));
  col = mix(col, cSky, 0.55*blob(q, F + S*vec2(-0.30 + 0.06*cos(t*0.07), 0.24 + 0.04*sin(t*0.09)), 0.34*S));
  col = mix(col, cTeal, 0.62*blob(q, F + S*vec2(-0.14 + 0.05*sin(t*0.15+1.0), -0.12 + 0.05*cos(t*0.1)), 0.20*S));
  col = mix(col, cLilac*0.92 + cAqua*0.08, 0.55*blob(q, F + S*vec2(0.36, 0.30), 0.22*S));
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float yc = F.y + S*(0.30 - 0.22*fi) + 0.06*sin(q.x*2.4 + t*0.21 + fi*2.1) + 0.04*sin(q.x*5.3 - t*0.17 + fi);
    float band = exp(-pow((q.y - yc)/(S*(0.035 + 0.012*fi)), 2.0));
    float rays = 0.55 + 0.45*gn(vec2(q.x*26.0 + fi*7.0, q.y*2.0 - t*0.12));
    float fade = smoothstep(-0.95*asp, -0.05*asp, q.x - F.x + 0.6*asp);
    vec3 rc = mix(cAqua, cLilac, smoothstep(-0.3, 0.5, q.x - F.x + 0.15*fi));
    col = mix(col, mix(rc, cWhite, 0.3), band * rays * 0.7 * fade);
  }
  gl_FragColor = vec4(col, 1.0);
}`;
const compFrag = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D tAurora;
uniform float uTime, uMobile;
uniform vec2 uRes;
uniform vec3 cBase, cWhite, cLilac;
uniform vec4 uObj[6];
uniform vec3 uFocus;
void main(){
  float asp = uRes.x / uRes.y;
  vec2 uv = vUv;
  vec2 p = vec2((uv.x-0.5)*asp, uv.y-0.5);
  vec3 col = texture2D(tAurora, uv).rgb;
  // halo disc behind the tooth: crisp edge so the glass visibly bends it
  vec2 oc = vec2((uFocus.x-0.5)*asp, uFocus.y-0.5);
  float R = uFocus.z;
  vec2 od2 = p - oc;
  float od = length(od2);
  float disc = 1.0 - smoothstep(R - 0.004, R + 0.004, od);
  float gdir = clamp(0.5 + (od2.x*0.62 - od2.y*0.78)/(2.0*R), 0.0, 1.0);
  vec3 orb = mix(mix(vec3(0.21,0.77,0.71), cWhite, 0.18), mix(cLilac, vec3(0.52,0.79,1.0), 0.15), gdir);
  orb = mix(orb, cWhite, 0.45*exp(-dot(od2 - vec2(-0.32*R, 0.36*R), od2 - vec2(-0.32*R, 0.36*R))/(R*R*0.18)));
  col = mix(col, orb, disc*0.9);
  col = mix(col, cWhite, exp(-pow((od - R)/0.0045, 2.0))*0.75);
  col = mix(col, cWhite, exp(-pow((od - R*1.3)/0.0026, 2.0))*0.45);
  col = mix(col, cLilac, exp(-pow((od - R*1.62)/0.0022, 2.0))*0.35);
  // soft caustic shadows below the floating glass
  for (int i = 0; i < 6; i++) {
    vec4 o = uObj[i];
    if (o.w <= 0.0) continue;
    vec2 c = vec2((o.x-0.5)*asp, o.y-0.5) + vec2(0.30, -1.05)*o.z;
    vec2 d = p - c; d.y *= 2.6;
    col = mix(col, col*vec3(0.84,0.92,0.95), exp(-dot(d,d)/(o.z*o.z*0.42))*0.30*o.w);
    vec2 d2 = p - (c + vec2(-0.06, 0.03)*o.z); d2.y *= 2.6;
    col += vec3(0.38,0.34,0.30)*exp(-dot(d2,d2)/(o.z*o.z*0.05))*0.22*o.w;
  }
  // keep the copy side calm
  float m = mix(smoothstep(-0.05, 0.62, uv.x) * smoothstep(-0.02, 0.22, uv.y), smoothstep(0.44, 0.86, uv.y), uMobile);
  col = mix(cBase, col, clamp(m + 0.10, 0.0, 1.0));
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)) + uTime)*43758.5453) - 0.5) * 0.008;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

/* ---------------- pastel studio environment (bright rims, no dark room) ---------------- */
function studioEnv(renderer) {
  const env = new THREE.Scene();
  const C = (h, k = 1) => new THREE.Color(h).multiplyScalar(k);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(20, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { cTop: { value: C('#ffffff', 0.95) }, cHi: { value: C('#dcf5f1') }, cBand: { value: C('#58c8bc') }, cLow: { value: C('#a490ff') }, cBot: { value: C('#ebe5ff') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `varying vec3 vP; uniform vec3 cTop, cHi, cBand, cLow, cBot;
      void main(){ vec3 d = normalize(vP); float h = d.y;
        vec3 c = mix(cBand, cHi, smoothstep(0.02, 0.35, h));
        c = mix(c, cTop, smoothstep(0.35, 0.95, h));
        c = mix(c, cLow, smoothstep(0.0, -0.3, h));
        c = mix(c, cBot, smoothstep(-0.3, -0.95, h));
        c *= 0.92 + 0.08 * sin(atan(d.z, d.x) * 3.0);
        gl_FragColor = vec4(c, 1.0); }`
  }));
  env.add(dome);
  const box = (w, h, x, y, z, k, tint = '#ffffff') => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: C(tint, k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  };
  box(9, 4, -6, 9, 6, 12);
  box(1.1, 12, -9, 0, 7, 9, '#f4fffd');
  box(1.1, 12, 10, 0, 5, 7, '#f7f4ff');
  box(12, 1.4, 0, -2, 12, 3, '#f6f2ff');
  box(4, 4, -10, -2, -6, 2, '#e4fffb');
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(env, 0.025).texture;
  pm.dispose();
  return tex;
}

/* ---------------- scene ---------------- */
export function initHero(canvas, host) {
  const mobile = innerWidth < 760 || HX.device === 'mobile';
  const isLite = !!HX.lite;               // menu phone frames and low-power cases
  const lite = isLite || mobile;           // lighter geometry for small screens
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !HX.lite, alpha: false, powerPreference: 'high-performance', stencil: false });
  } catch (e) { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isLite ? 1.25 : mobile ? 1.5 : 1.75));
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.0;
  if ('transmissionResolutionScale' in renderer) renderer.transmissionResolutionScale = isLite ? 0.4 : mobile ? 0.5 : 0.66;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.set(0, 0, 10);

  scene.environment = studioEnv(renderer);
  scene.environmentIntensity = 1.0;
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-3, 5, 6); scene.add(key);

  const C = (h) => new THREE.Color(h);
  const auroraU = {
    uTime: { value: 0 }, uMobile: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uPointer: { value: new THREE.Vector2() },
    cBase: { value: C('#f4fbfb') }, cAqua: { value: C('#7fe3da') }, cLilac: { value: C('#c9b8ff') },
    cTeal: { value: C('#16b3a5') }, cSky: { value: C('#bfe6ff') }, cWhite: { value: C('#ffffff') }
  };
  const auroraRT = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: false, stencilBuffer: false });
  const auroraScene = new THREE.Scene();
  const flatCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const auroraQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: auroraU, vertexShader: quadVert, fragmentShader: auroraFrag, depthWrite: false, depthTest: false }));
  auroraQuad.frustumCulled = false; auroraScene.add(auroraQuad);
  const bgU = {
    tAurora: { value: auroraRT.texture }, uTime: auroraU.uTime, uMobile: auroraU.uMobile, uRes: auroraU.uRes,
    cBase: auroraU.cBase, cWhite: auroraU.cWhite, cLilac: auroraU.cLilac,
    uObj: { value: Array.from({ length: 6 }, () => new THREE.Vector4()) },
    uFocus: { value: new THREE.Vector3(0.7, 0.6, 0.2) },
    uPointer: auroraU.uPointer, uScroll: { value: 0 }
  };
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: bgU, vertexShader: quadVert, fragmentShader: compFrag, depthWrite: false, depthTest: false }));
  bg.frustumCulled = false; bg.renderOrder = -10;
  scene.add(bg);

  const glass = (tint, dist, extra = {}) => new THREE.MeshPhysicalMaterial(Object.assign({
    color: 0xffffff, metalness: 0, roughness: 0.035, transmission: 1, thickness: 1.3, ior: 1.5,
    dispersion: isLite ? 0 : mobile ? 2 : 4.5, iridescence: isLite ? 0.3 : 0.42, iridescenceIOR: 1.3, iridescenceThicknessMinimum: 160, iridescenceThicknessMaximum: 620,
    specularIntensity: 1, envMapIntensity: 1.0,
    attenuationColor: new THREE.Color(tint), attenuationDistance: dist
  }, extra));

  // the tooth
  const t0 = performance.now();
  const toothGeo = surfaceNets(toothSDF, [-0.92, -1.16, -0.86], [0.92, 1.02, 0.86], isLite ? 0.052 : lite ? 0.042 : 0.034);
  const meshMs = performance.now() - t0;
  const tooth = new THREE.Mesh(toothGeo, glass('#d3f6f1', 5.5, { thickness: 1.55, iridescence: 0.5 }));
  const toothPivot = new THREE.Group(); toothPivot.add(tooth); scene.add(toothPivot);

  const det = isLite ? 8 : lite ? 12 : 16;
  const items = [
    { mesh: tooth, pivot: toothPivot, size: 2.12, kind: 'tooth' },
    { mesh: new THREE.Mesh(pebble(11, 1, 0.56, 0.84, det), glass('#b5efe8', 3.2)), size: 2, kind: 'pebble' },
    { mesh: new THREE.Mesh(pebble(29, 1, 0.62, 0.78, det), glass('#dcd1ff', 2.6)), size: 2, kind: 'pebble' },
    { mesh: new THREE.Mesh(pebble(47, 1, 0.7, 0.86, det), glass('#eefcff', 6)), size: 2, kind: 'pebble' },
    { mesh: new THREE.Mesh(new THREE.SphereGeometry(1, lite ? 32 : 48, lite ? 24 : 36), glass('#ffffff', 6, { thickness: 0.9 })), size: 2, kind: 'drop' },
    { mesh: new THREE.Mesh(pebble(83, 1, 0.6, 0.9, lite ? 8 : 12), glass('#cfeeff', 2.2)), size: 2, kind: 'pebble' }
  ];
  items.forEach((it, i) => {
    if (!it.pivot) { it.pivot = new THREE.Group(); it.pivot.add(it.mesh); scene.add(it.pivot); }
    const r = rng(100 + i * 7);
    it.phase = r() * Math.PI * 2; it.spin = (r() - 0.5) * 0.5; it.rx = r() * Math.PI; it.rz = (r() - 0.5) * 0.8;
    it.mesh.rotation.set(it.rx, r() * Math.PI, it.rz);
    it.base = new THREE.Vector3(); it.scale = 1; it.par = 0;
  });

  // layouts in NDC with sizes as a fraction of the visible height
  const LD = [
    { x: 0.42, y: 0.15, z: 0, s: 0.53, par: 0.55 },
    { x: 0.83, y: -0.50, z: -0.8, s: 0.24, par: 0.95 },
    { x: 0.12, y: -0.66, z: 0.6, s: 0.12, par: 1.25 },
    { x: 0.86, y: 0.50, z: -1.6, s: 0.14, par: 0.75 },
    { x: 0.17, y: 0.52, z: 1.0, s: 0.06, par: 1.45 },
    { x: 0.66, y: 0.70, z: 0.2, s: 0.065, par: 1.1 }
  ];
  const LM = [
    { x: 0.12, y: 0.53, z: 0, s: 0.29, par: 0.5 },
    { x: -0.66, y: 0.40, z: -0.6, s: 0.12, par: 0.9 },
    { x: 0.84, y: 0.21, z: 0.4, s: 0.085, par: 1.2 },
    { x: -0.28, y: 0.79, z: -1.2, s: 0.07, par: 0.7 },
    { x: 0.72, y: 0.80, z: 0.8, s: 0.035, par: 1.4 },
    { x: -0.80, y: 0.70, z: 0.2, s: 0, par: 1 }
  ];

  let W = 1, H = 1, isMobile = mobile, visH = 1;
  function layout() {
    W = host.clientWidth || innerWidth;
    H = canvas.clientHeight || innerHeight;
    isMobile = W < 760;
    renderer.setSize(W, H, false);
    const pr = renderer.getPixelRatio();
    auroraRT.setSize(Math.max(2, Math.round(W * pr * 0.5)), Math.max(2, Math.round(H * pr * 0.5)));
    camera.aspect = W / H; camera.updateProjectionMatrix();
    bgU.uRes.value.set(W, H); bgU.uMobile.value = isMobile ? 1 : 0;
    const L = isMobile ? LM : LD;
    items.forEach((it, i) => {
      const c = L[i];
      const dist = camera.position.z - c.z;
      const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist, vw = vh * camera.aspect;
      it.base.set(c.x * vw / 2, c.y * vh / 2, c.z);
      it.scale = (c.s * vh) / it.size;
      it.par = c.par; it.vh = vh;
      it.pivot.visible = c.s > 0 && !(isLite && (i === 3 || i === 4 || i === 5));
      it.pivot.scale.setScalar(Math.max(it.scale, 0.0001));
    });
    visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const f = L[0];
    focus.set(f.x * 0.5 + 0.5 + (isMobile ? 0.0 : 0.012), f.y * 0.5 + 0.5 + (isMobile ? 0.004 : 0.02), f.s * (isMobile ? 0.6 : 0.56));
  }
  const focus = new THREE.Vector3();
  layout();

  // pointer (desktop only, never in the menu frame)
  const ptr = new THREE.Vector2(), ptrS = new THREE.Vector2();
  if (!HX.embed && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', (e) => { ptr.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); }, { passive: true });
  }

  let visible = true, running = false, last = performance.now(), time = 8, first = true, frameNo = 0, stillAt = 0;
  const still = !!HX.reducedMotion;
  const v3 = new THREE.Vector3();
  // performance governor: step resolution down on slow GPUs, settle on a still frame on very slow ones
  const basePR = renderer.getPixelRatio();
  let samples = [], stepped = 0, still2 = false, lastStill = 0;
  let seen = 0;
  function govern(gap) {
    if (first || still2) return;
    if (++seen <= 2) return; // ignore warm-up frames
    samples.push(gap);
    if (samples.length < 6) return;
    samples.sort((x, y) => x - y);
    const med = samples[3]; samples = [];
    if (med > 160) { still2 = true; lastStill = -1e6; renderer.setPixelRatio(basePR); layout(); }
    else if (med > 34 && stepped < 2) { stepped++; renderer.setPixelRatio(Math.max(0.75, basePR * (stepped === 1 ? 0.75 : 0.55))); layout(); }
  }
  function frame(now) {
    if (!visible) { running = false; return; }
    const gap = now - last;
    govern(gap);
    const dt = Math.min(gap / 1000, 0.05); last = now;
    if (still2) {
      // very slow renderer: redraw only when the hero scroll position changes, at most every 1.5 s
      const sy = window.scrollY || 0;
      if (Math.abs(sy - lastStill) < 4 || now - stillAt < 1500) { requestAnimationFrame(frame); return; }
      lastStill = sy; stillAt = now;
    }
    if (!still) time += dt;
    ptrS.lerp(ptr, 0.06);
    const heroH = host.offsetHeight || H;
    const s = Math.min(Math.max((window.scrollY || 0) / heroH, 0), 1.2);
    bgU.uTime.value = time; bgU.uScroll.value = s; bgU.uPointer.value.copy(ptrS);
    bgU.uFocus.value.set(focus.x - ptrS.x * 0.004, focus.y + s * 0.28 - ptrS.y * 0.004, focus.z);
    items.forEach((it, i) => {
      const bob = Math.sin(time * 0.62 + it.phase) * 0.035 * it.vh;
      const px = -ptrS.x * 0.10 * (1 + it.base.z * 0.4), py = -ptrS.y * 0.07 * (1 + it.base.z * 0.4);
      it.pivot.position.set(it.base.x + px, it.base.y + bob + py + s * it.par * visH * 0.55, it.base.z);
      if (it.kind === 'tooth') {
        it.mesh.rotation.y = 0.55 + time * 0.22 + ptrS.x * 0.35 + s * 1.4;
        it.mesh.rotation.x = 0.16 + Math.sin(time * 0.45) * 0.07 - ptrS.y * 0.18 + s * 0.3;
        it.mesh.rotation.z = -0.13 + Math.sin(time * 0.31) * 0.05;
      } else {
        it.mesh.rotation.y += dt * (0.12 + it.spin * 0.3);
        it.mesh.rotation.x = it.rx + Math.sin(time * 0.3 + it.phase) * 0.25 + s * 0.8;
      }
      // project for the soft shadows in the backdrop
      const u = bgU.uObj.value[i];
      if (it.pivot.visible) {
        v3.copy(it.pivot.position).project(camera);
        const rad = (L()[i].s * 0.5) * (it.kind === 'tooth' ? 0.78 : 0.9);
        u.set(v3.x * 0.5 + 0.5, v3.y * 0.5 + 0.5, rad, it.kind === 'tooth' ? 1.0 : 0.8);
      } else u.set(0, 0, 0, 0);
    });
    if (first || !(isLite && (++frameNo & 1))) {
      renderer.setRenderTarget(auroraRT);
      renderer.render(auroraScene, flatCam);
      renderer.setRenderTarget(null);
    }
    renderer.render(scene, camera);
    if (first) {
      first = false;
      requestAnimationFrame(() => { host.classList.add('gl-on'); try { HX.ready(); } catch (e) {} });
    }
    requestAnimationFrame(frame);
  }
  const L = () => (isMobile ? LM : LD);
  function start() { if (!running && visible) { running = true; last = performance.now(); requestAnimationFrame(frame); } }

  const io = new IntersectionObserver((ents) => { visible = ents[0].isIntersecting; if (visible && compiled) start(); }, { rootMargin: '80px 0px' });
  let rt = 0, compiled = false;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });
  // compile shaders off the main thread where supported, so the page intro never stalls
  const go = () => { if (compiled) return; compiled = true; io.observe(host); start(); };
  try {
    const pr = renderer.compileAsync ? renderer.compileAsync(scene, camera) : null;
    if (pr && pr.then) { pr.then(go, go); setTimeout(go, 6000); } else go();
  } catch (e) { go(); }
  return { meshMs, renderer };
}
