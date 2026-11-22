// Varelle · the solitaire: PBR metal band in a procedural studio, a traced brilliant-cut stone,
// glints, gold dust. One renderer; the canvas moves between the hero stage and the ring builder.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ENV, buildStone, stoneMaterial, applyStone, radial } from './gem.js';

export const METAL_COL = {
  y: new THREE.Color().setRGB(1.0, 0.7, 0.32),
  r: new THREE.Color().setRGB(0.98, 0.55, 0.43),
  p: new THREE.Color().setRGB(0.8, 0.8, 0.79)
};
const ORDER = ['y', 'r', 'p'];
const RIN = 0.86, BAND_TOP = 1.085, CLEAR = 0.035, BASE_R = 0.34, RING_CY = 0.24, BOUND_R = 1.36;
const TAN = Math.tan(14 * Math.PI / 180);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/* ---------- band ---------- */
function bandPoint(th, ph) {
  const a = Math.atan2(Math.sin(th), Math.cos(th));
  const near = Math.exp(-(a * a) / 0.38);
  const thick = 0.16 + 0.065 * near, half = 0.108 + 0.014 * near;
  const c = Math.cos(ph), s = Math.sin(ph), e = c > 0 ? 2.3 : 3.4;
  const u = Math.sign(c) * Math.pow(Math.abs(c), 2 / e), v = Math.sign(s) * Math.pow(Math.abs(s), 2 / e);
  const rr = RIN + thick * (0.5 + 0.5 * u);
  return [Math.sin(th) * rr, Math.cos(th) * rr, v * half, RIN + thick * 0.5];
}
function bandNormal(th, ph) {
  const e = 1e-3;
  const a = bandPoint(th - e, ph), b = bandPoint(th + e, ph), c = bandPoint(th, ph - e), d = bandPoint(th, ph + e), p = bandPoint(th, ph);
  const t1 = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const t2 = new THREE.Vector3(d[0] - c[0], d[1] - c[1], d[2] - c[2]);
  const n = new THREE.Vector3().crossVectors(t1, t2).normalize();
  const out = new THREE.Vector3(p[0] - Math.sin(th) * p[3], p[1] - Math.cos(th) * p[3], p[2]);
  if (n.dot(out) < 0) n.negate();
  return n;
}
function bandGeo(seg, prof) {
  const pos = [], nor = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const th = (i / seg) * Math.PI * 2;
    for (let j = 0; j <= prof; j++) {
      const ph = (j / prof) * Math.PI * 2;
      const p = bandPoint(th, ph), n = bandNormal(th, ph);
      pos.push(p[0], p[1], p[2]); nor.push(n.x, n.y, n.z);
    }
  }
  const w = prof + 1;
  for (let i = 0; i < seg; i++) for (let j = 0; j < prof; j++) {
    const a = i * w + j, b = (i + 1) * w + j;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  const n0 = new THREE.Vector3(), tri = new THREE.Triangle(), A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  // make sure the winding faces outward
  A.fromBufferAttribute(g.attributes.position, idx[0]); B.fromBufferAttribute(g.attributes.position, idx[1]); C.fromBufferAttribute(g.attributes.position, idx[2]);
  tri.set(A, B, C).getNormal(n0);
  if (n0.dot(new THREE.Vector3().fromBufferAttribute(g.attributes.normal, idx[0])) < 0) {
    for (let k = 0; k < idx.length; k += 3) { const t = idx[k + 1]; idx[k + 1] = idx[k + 2]; idx[k + 2] = t; }
    g.setIndex(idx);
  }
  return g;
}

/* ---------- head: prongs, gallery rails, seat ---------- */
function headGeo(st, lite) {
  const geos = [], Dp = -st.ymin, ts = lite ? 14 : 28, rs = lite ? 6 : 10;
  for (const az of st.prongs) {
    const rho = radial(st.outline, az), cx = Math.cos(az), cz = Math.sin(az);
    const pt = (r, y) => new THREE.Vector3(cx * r, y, cz * r);
    const curve = new THREE.CatmullRomCurve3([pt(0.16, -Dp - 0.32), pt(0.42 * rho, -Dp * 0.8), pt(0.74 * rho, -Dp * 0.42), pt(1.045 * rho, -0.02), pt(0.9 * rho, 0.1)], false, 'centripetal');
    geos.push(new THREE.TubeGeometry(curve, ts, 0.072, rs, false));
    const tip = new THREE.SphereGeometry(0.085, rs + 2, rs);
    tip.translate(0.9 * rho * cx, 0.1, 0.9 * rho * cz);
    geos.push(tip);
  }
  for (const [f, y] of [[0.79, -0.3], [0.47, -0.72 * Dp]]) {
    const pts = [];
    for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2, r = radial(st.outline, a) * f; pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r)); }
    geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), lite ? 48 : 96, 0.05, Math.max(5, rs - 2), true));
  }
  const seat = new THREE.CylinderGeometry(0.2, 0.15, 0.16, rs + 4);
  seat.translate(0, -Dp - 0.33, 0);
  geos.push(seat);
  geos.forEach(g => { if (g.attributes.uv) g.deleteAttribute('uv'); });
  return mergeGeometries(geos);
}

/* ---------- shaders ---------- */
const BG_VERT = 'varying vec2 vUv; void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const BG_FRAG = /* glsl */`
uniform vec3 uA, uB, uC; uniform vec2 uSpot; uniform float uAsp, uSpotR;
varying vec2 vUv;
float h21(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
void main(){
  vec2 q = (vUv - uSpot) * vec2(uAsp, 1.0);
  float r = length(q * vec2(0.85, 1.0)) / uSpotR;
  vec3 col = mix(uA, uB, smoothstep(0.0, 1.0, r));
  col = mix(col, uC, smoothstep(0.7, 0.0, vUv.y) * 0.55 * smoothstep(0.25, 1.1, r));
  vec2 s = vUv * vec2(uAsp, 1.0);
  float n = vn(s * 2.5) * 0.6 + vn(s * 8.0) * 0.4;
  col *= 0.92 + 0.13 * n;
  col *= 1.0 - smoothstep(0.75, 1.5, length((vUv - 0.5) * vec2(uAsp, 1.0))) * 0.35;
  col += (h21(gl_FragCoord.xy) - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}`;
const GLINT_VERT = /* glsl */`
attribute vec3 aN; attribute float aSeed; attribute float aSize; attribute float aB;
uniform float uTime, uPx, uOn, uBurst;
varying float vI; varying float vSeed;
${ENV}
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec3 n = normalize(mat3(modelMatrix) * aN);
  vec3 V = normalize(wp.xyz - cameraPosition);
  float facing = -dot(V, n);
  float lum = dot(env(reflect(V, n)), vec3(0.3, 0.55, 0.15));
  float tw = 0.6 + 0.4 * sin(uTime * (1.6 + aSeed * 2.4) + aSeed * 37.0);
  float ei = smoothstep(1.8, 5.2, lum) * smoothstep(0.08, 0.35, facing) * tw;
  float burst = pow(max(0.0, sin(uTime * (0.45 + aSeed * 0.7) + aSeed * 61.0)), 40.0) * smoothstep(0.02, 0.3, facing) * aB * uBurst;
  vI = max(ei, burst) * uOn;
  vSeed = aSeed;
  vec4 mv = viewMatrix * wp;
  gl_Position = projectionMatrix * mv;
  float sc = length(modelMatrix[0].xyz);
  gl_PointSize = vI > 0.02 ? min(aSize * sc * uPx * (0.45 + 0.55 * vI) * (1.0 + 0.45 * burst) / -mv.z, 150.0) : 0.0;
}`;
const GLINT_FRAG = /* glsl */`
varying float vI; varying float vSeed;
void main(){
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float core = exp(-dot(p, p) * 30.0);
  float ray = exp(-abs(p.x) * 38.0) * (1.0 - smoothstep(0.0, 1.0, abs(p.y))) + exp(-abs(p.y) * 38.0) * (1.0 - smoothstep(0.0, 1.0, abs(p.x)));
  vec2 q = vec2(p.x + p.y, p.x - p.y) * 0.7071;
  float ray2 = (exp(-abs(q.x) * 50.0) * (1.0 - smoothstep(0.0, 0.55, abs(q.y))) + exp(-abs(q.y) * 50.0) * (1.0 - smoothstep(0.0, 0.55, abs(q.x)))) * 0.4;
  float a = (core * 1.3 + ray + ray2) * vI;
  vec3 tint = mix(vec3(1.0, 0.95, 0.86), vec3(0.88, 0.93, 1.0), fract(vSeed * 7.31));
  gl_FragColor = vec4(tint * a, 1.0);
}`;
const DUST_VERT = /* glsl */`
attribute float aSeed; attribute float aKind;
uniform float uTime, uPx, uAng, uFleck; uniform vec3 uCen;
varying float vA; varying vec3 vC;
vec3 spec(float h){ return clamp(abs(fract(h + vec3(0.0, 0.667, 0.333)) * 6.0 - 3.0) - 1.0, 0.0, 1.0); }
void main(){
  vec3 p = position;
  float size;
  if (aKind < 0.5) {
    p.y = mod(p.y + uTime * (0.035 + aSeed * 0.05) + 3.2, 6.4) - 3.2;
    p.x += sin(uTime * 0.27 + aSeed * 21.0) * 0.18;
    vA = (0.1 + 0.3 * aSeed) * smoothstep(3.2, 2.2, abs(p.y));
    vC = mix(vec3(1.0, 0.74, 0.38), vec3(1.0, 0.92, 0.78), fract(aSeed * 5.3));
    size = 0.04 + 0.09 * fract(aSeed * 3.7);
  } else {
    float a = aSeed * 6.2831 + uAng * (0.35 + fract(aSeed * 13.0) * 0.5);
    float rr = 0.55 + fract(aSeed * 7.7) * 0.75;
    p = uCen + vec3(cos(a) * rr * 2.3, sin(a) * rr * 1.25, -2.6);
    float tw = pow(max(0.0, sin(uAng * (1.3 + fract(aSeed * 3.1) * 2.0) + aSeed * 40.0)), 8.0);
    vA = tw * uFleck;
    vC = spec(fract(aSeed * 9.1)) * 0.9 + 0.1;
    size = 0.05 + 0.04 * fract(aSeed * 2.3);
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = vA > 0.01 ? min(size * uPx / -mv.z, 40.0) : 0.0;
}`;
const DUST_FRAG = /* glsl */`
varying float vA; varying vec3 vC;
void main(){
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = dot(p, p);
  float a = smoothstep(1.0, 0.0, d) * (0.55 + 0.45 * exp(-d * 6.0)) * vA;
  gl_FragColor = vec4(vC * a, 1.0);
}`;

/* ---------- scene ---------- */
export function createRing(canvas, o) {
  const lite = !!o.lite;
  // probe first: without WebGL2 we throw quietly and the page shows its line-art fallback
  const gl = canvas.getContext('webgl2', { alpha: false, depth: true, stencil: false, antialias: !lite, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
  if (!gl) throw new Error('WebGL2 unavailable');
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: !lite, alpha: false, powerPreference: 'high-performance' });
  let dprCap = lite ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x0d0b0a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 60);

  // studio environment, prefiltered once for the metal
  const pmrem = new THREE.PMREMGenerator(renderer);
  const skyScene = new THREE.Scene();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(20, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `varying vec3 vD; ${ENV} void main(){ gl_FragColor = vec4(env(normalize(vD)), 1.0); }`
  }));
  skyScene.add(sky);
  const envRT = pmrem.fromScene(skyScene, 0, 0.1, 50, { size: lite ? 128 : 256 });
  scene.environment = envRT.texture;
  pmrem.dispose(); sky.geometry.dispose(); sky.material.dispose();

  // metal with a travelling light line when the alloy changes
  const MU = { uColA: { value: METAL_COL.y.clone() }, uColB: { value: METAL_COL.y.clone() }, uMix: { value: 0 }, uGlow: { value: 0 } };
  const metal = new (lite ? THREE.MeshStandardMaterial : THREE.MeshPhysicalMaterial)({ color: 0xffffff, metalness: 1, roughness: 0.1, envMapIntensity: 1.3 });
  metal.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, MU);
    sh.vertexShader = 'varying float vSwY;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vSwY = (modelMatrix * vec4(transformed, 1.0)).y;');
    sh.fragmentShader = 'uniform vec3 uColA; uniform vec3 uColB; uniform float uMix; uniform float uGlow; varying float vSwY;\n' + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
        float swc = clamp((vSwY + 1.15) / 2.8, 0.0, 1.0);
        float swf = uMix * 1.3 - 0.15;
        diffuseColor.rgb = mix(uColB, uColA, smoothstep(swf - 0.05, swf + 0.05, swc));`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += mix(uColB, vec3(1.0), 0.4) * exp(-pow((swc - swf) / 0.03, 2.0)) * uGlow * 2.4;`);
  };

  const ring = new THREE.Group();
  scene.add(ring);
  const band = new THREE.Mesh(bandGeo(lite ? 150 : 240, lite ? 20 : 30), metal);
  ring.add(band);
  const head = new THREE.Group();
  ring.add(head);
  const prongs = new THREE.Mesh(new THREE.BufferGeometry(), metal);
  const stoneMat = stoneMaterial(lite);
  const stone = new THREE.Mesh(new THREE.BufferGeometry(), stoneMat);
  head.add(prongs, stone);

  // glints: crown facets of the stone plus a few points on the band
  const shared = { uTime: { value: 0 }, uPx: { value: 800 }, uOn: { value: 1 }, uBurst: { value: 1 } };
  const glintMat = new THREE.ShaderMaterial({ vertexShader: GLINT_VERT, fragmentShader: GLINT_FRAG, uniforms: shared, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  function glintPoints(list, burst) {
    const g = new THREE.BufferGeometry(), pos = [], nn = [], seed = [], size = [], bb = [];
    list.forEach(e => { pos.push(e.p.x, e.p.y, e.p.z); nn.push(e.n.x, e.n.y, e.n.z); seed.push(e.seed); size.push(e.size); bb.push(burst); });
    g.setAttribute('aB', new THREE.Float32BufferAttribute(bb, 1));
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aN', new THREE.Float32BufferAttribute(nn, 3));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
    g.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
    const pts = new THREE.Points(g, glintMat);
    pts.frustumCulled = false; pts.renderOrder = 10;
    return pts;
  }
  let rnd = 7;
  const rand = () => { rnd = (rnd * 16807) % 2147483647; return rnd / 2147483647; };
  const bandList = [];
  for (let i = 0; i < (lite ? 8 : 14); i++) {
    const th = (rand() - 0.5) * 3.6, ph = (rand() - 0.5) * 1.3;
    const p = bandPoint(th, ph);
    bandList.push({ p: new THREE.Vector3(p[0], p[1], p[2]), n: bandNormal(th, ph), seed: rand(), size: 0.2 + rand() * 0.16 });
  }
  ring.add(glintPoints(bandList, 0.35));
  let stoneGlints = null;

  // gold dust and the stone's fire thrown on the velvet
  const nDust = lite ? 28 : 64, nFleck = 0;
  const dg = new THREE.BufferGeometry(), dp = [], ds = [], dk = [];
  for (let i = 0; i < nDust + nFleck; i++) {
    dp.push((rand() - 0.5) * 9, (rand() - 0.5) * 6.4, -4.5 + rand() * 5.5);
    ds.push(rand()); dk.push(i < nDust ? 0 : 1);
  }
  dg.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
  dg.setAttribute('aSeed', new THREE.Float32BufferAttribute(ds, 1));
  dg.setAttribute('aKind', new THREE.Float32BufferAttribute(dk, 1));
  const DU = { uTime: shared.uTime, uPx: shared.uPx, uAng: { value: 0 }, uFleck: { value: 0.8 }, uCen: { value: new THREE.Vector3(0, RING_CY, 0) } };
  const dust = new THREE.Points(dg, new THREE.ShaderMaterial({ vertexShader: DUST_VERT, fragmentShader: DUST_FRAG, uniforms: DU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  dust.frustumCulled = false; dust.renderOrder = 5;
  scene.add(dust);

  // velvet backdrop
  const BG = {
    uA: { value: new THREE.Color() }, uB: { value: new THREE.Color() }, uC: { value: new THREE.Color() },
    uSpot: { value: new THREE.Vector2(0.7, 0.5) }, uAsp: { value: 1 }, uSpotR: { value: 0.8 }
  };
  const setBg = (a, b, c) => { BG.uA.value.setRGB(...a); BG.uB.value.setRGB(...b); BG.uC.value.setRGB(...c); };
  const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: BG_VERT, fragmentShader: BG_FRAG, uniforms: BG, depthTest: false, depthWrite: false }));
  bgQuad.frustumCulled = false; bgQuad.renderOrder = -10;
  scene.add(bgQuad);

  /* ----- configuration ----- */
  let shape = null, carat = 1, st = null;
  const headCache = {};
  function setShape(name) {
    if (shape === name) return;
    shape = name;
    st = buildStone(name);
    stone.geometry = st.geo;
    applyStone(stoneMat, st);
    prongs.geometry = headCache[name] || (headCache[name] = headGeo(st, lite));
    if (stoneGlints) { head.remove(stoneGlints); stoneGlints.geometry.dispose(); }
    const list = st.crown.filter(() => rand() > 0.3).map(f => ({ p: f.c.clone().addScaledVector(f.n, 0.015), n: f.n, seed: rand(), size: 0.65 + rand() * 0.6 }));
    stoneGlints = glintPoints(list, 1);
    head.add(stoneGlints);
    setCarat(carat);
  }
  function setCarat(c) {
    carat = c;
    const k = BASE_R * Math.cbrt(c);
    head.scale.setScalar(k);
    head.position.y = BAND_TOP + CLEAR - st.ymin * k;
  }
  const stoneY = () => head.position.y + (st.ymin + st.ymax) * 0.35 * head.scale.x;

  // metal state: A -> B with a travelling line
  const mixCol = new THREE.Color();
  function metalState(a, b, t) {
    MU.uColA.value.copy(METAL_COL[a]); MU.uColB.value.copy(METAL_COL[b]);
    MU.uMix.value = t; MU.uGlow.value = a === b ? 0 : Math.sin(Math.PI * clamp(t, 0, 1));
    mixCol.copy(METAL_COL[a]).lerp(METAL_COL[b], t);
    stoneMat.uniforms.uTint.value.copy(mixCol).lerp(new THREE.Color(1, 1, 1), 0.45);
  }
  let build = { metal: 'y', shape: 'round', carat: 1, view: 'ring' };
  let mt = { from: 'y', to: 'y', t: 1 };

  /* ----- views ----- */
  let view = null;
  const size = { w: 1, h: 1 };
  let lastKey = '';
  function resize() {
    const p = canvas.parentElement;
    size.w = Math.max(1, (p && p.clientWidth) || window.innerWidth);
    size.h = Math.max(1, (p && p.clientHeight) || window.innerHeight);
    const key = size.w + 'x' + size.h + '@' + renderer.getPixelRatio();
    if (key === lastKey) return;
    lastKey = key;
    renderer.setSize(size.w, size.h, false);
    camera.aspect = size.w / size.h;
    BG.uAsp.value = camera.aspect;
    shared.uPx.value = renderer.getPixelRatio() * size.h / (2 * TAN);
  }
  function attach(name, el) {
    if (canvas.parentElement !== el) {
      if (ro) { ro.disconnect(); ro.observe(el); }
      el.insertBefore(canvas, el.firstChild);
    } else if (ro && !view) ro.observe(el);
    view = name;
    if (name === 'hero') { setShape('round'); setCarat(1.5); setBg([0.17, 0.115, 0.07], [0.051, 0.043, 0.039], [0.059, 0.165, 0.133]); }
    else { setShape(build.shape); setCarat(build.carat); setBg([0.11, 0.24, 0.19], [0.035, 0.085, 0.07], [0.05, 0.13, 0.1]); }
    resize();
    if (running) renderOnce();
  }
  const ro = window.ResizeObserver ? new ResizeObserver(() => { resize(); if (running) renderOnce(); }) : null;
  window.addEventListener('resize', () => resize());

  /* ----- choreography ----- */
  // hero keys: p, zoom (0 ring, 1 stone), elev, shiftX, shiftY, metal index
  const KD = [[0, 0, 0.3, 0.4, -0.05, 0], [0.12, 0, 0.3, 0.4, -0.05, 0], [0.26, 0, 0.32, 0.4, -0.04, 1], [0.4, 0, 0.32, 0.4, -0.04, 1],
    [0.53, 0, 0.34, -0.4, -0.04, 2], [0.64, 0, 0.34, -0.4, -0.04, 2], [0.86, 1, 0.8, 0.3, 0.06, 2], [1, 1, 0.86, 0.3, 0.06, 2]];
  const KM = [[0, 0, 0.3, 0, 0.36, 0], [0.12, 0, 0.3, 0, 0.36, 0], [0.26, 0, 0.32, 0, 0.36, 1], [0.4, 0, 0.32, 0, 0.36, 1],
    [0.53, 0, 0.34, 0, 0.36, 2], [0.64, 0, 0.34, 0, 0.36, 2], [0.86, 1, 0.8, 0, 0.34, 2], [1, 1, 0.86, 0, 0.34, 2]];
  const hs = { zoom: 0, elev: 0, sx: 0, sy: 0, m: 0 };
  function heroKeys(p, stacked) {
    const K = stacked ? KM : KD;
    let i = 1;
    while (i < K.length - 1 && p > K[i][0]) i++;
    const a = K[i - 1], b = K[i], t = sstep(a[0], b[0], p);
    hs.zoom = lerp(a[1], b[1], t); hs.elev = lerp(a[2], b[2], t); hs.sx = lerp(a[3], b[3], t); hs.sy = lerp(a[4], b[4], t); hs.m = lerp(a[5], b[5], t);
    return hs;
  }
  function fitRing(mode) {
    const asp = camera.aspect;
    if (mode === 'stack') return Math.max(BOUND_R / (0.86 * asp * TAN), BOUND_R / (0.44 * TAN));
    if (mode === 'build') return BOUND_R / ((o.stacked() ? 0.7 : 0.8) * Math.min(1, asp) * TAN);
    return Math.max(BOUND_R / (0.84 * TAN), BOUND_R / (0.44 * asp * TAN));
  }
  function fitStone(mode) {
    const r = head.scale.x * 1.05, asp = camera.aspect;
    if (mode === 'stack') return Math.max(r / (0.6 * asp * TAN), r / (0.36 * TAN));
    if (mode === 'build') return r / (0.52 * Math.min(1, asp) * TAN);
    return Math.max(r / (0.44 * TAN), r / (0.3 * asp * TAN));
  }

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (o.fine) window.addEventListener('pointermove', e => { pointer.tx = (e.clientX / window.innerWidth) * 2 - 1; pointer.ty = (e.clientY / window.innerHeight) * 2 - 1; }, { passive: true });
  let yaw = 0.55, dragV = 0, dragIdle = 9, zoomB = 0;
  const camS = { dist: 7, elev: 0.2, ty: RING_CY, sx: 0, sy: 0 };
  const tmpV = new THREE.Vector3(), rotM = new THREE.Matrix4();

  function update(dt, time) {
    const stacked = o.stacked();
    let zoom, elev, sx, sy, spinK = 1;
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3); pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);
    if (view === 'hero') {
      const p = o.heroP();
      const k = heroKeys(p, stacked);
      zoom = k.zoom; elev = k.elev; sx = k.sx; sy = k.sy;
      const m = clamp(k.m, 0, 2), i0 = Math.min(1, Math.floor(m));
      metalState(ORDER[i0], ORDER[Math.min(2, i0 + 1)], clamp(m - i0, 0, 1));
      spinK = 1 - zoom * 0.55;
      ring.rotation.x = o.fine ? pointer.y * 0.08 * (1 - zoom) : 0;
      yaw += dt * spinK * (0.14 + 0.34 * Math.pow(Math.abs(Math.sin(yaw)), 1.5)) * (o.reduced ? 0 : 1);
      ring.rotation.y = yaw + p * Math.PI * 1.2 + (o.fine ? pointer.x * 0.3 * (1 - zoom) : 0);
      DU.uFleck.value = 0.7 + zoom * 0.5;
      shared.uBurst.value = 1 - zoom * 0.65;
    } else {
      zoomB += ((build.view === 'stone' ? 1 : 0) - zoomB) * Math.min(1, dt * 3.2);
      zoom = zoomB; elev = lerp(0.42, 0.95, zoom); sx = 0; sy = stacked ? -0.02 - zoom * 0.06 : 0.0;
      if (mt.t < 1) mt.t = Math.min(1, mt.t + dt / 1.2);
      metalState(mt.from, mt.to, mt.t);
      dragIdle += dt;
      yaw += dragV * dt;
      dragV *= Math.pow(0.04, dt);
      if (dragIdle > 2.2 && !o.reduced) yaw += dt * (0.16 + 0.3 * Math.pow(Math.abs(Math.sin(yaw)), 1.5)) * (1 - zoom * 0.5);
      ring.rotation.x = 0;
      ring.rotation.y = yaw;
      DU.uFleck.value = 0.55;
      shared.uBurst.value = 0.8 - zoom * 0.45;
    }
    const mode = view === 'hero' ? (stacked ? 'stack' : 'wide') : 'build';
    const dR = fitRing(mode), dS = fitStone(mode);
    camS.dist = dR * Math.pow(dS / dR, zoom);
    camS.elev = elev; camS.ty = lerp(RING_CY, stoneY(), zoom); camS.sx = sx; camS.sy = sy;
    const ce = Math.cos(camS.elev), se = Math.sin(camS.elev);
    camera.position.set(0, camS.ty + se * camS.dist, ce * camS.dist);
    camera.lookAt(0, camS.ty, 0);
    camera.updateProjectionMatrix();
    camera.projectionMatrix.elements[8] = -camS.sx;
    camera.projectionMatrix.elements[9] = -camS.sy;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

    scene.updateMatrixWorld();
    tmpV.copy(camera.position); stone.worldToLocal(tmpV);
    stoneMat.uniforms.uCam.value.copy(tmpV);
    rotM.extractRotation(stone.matrixWorld);
    stoneMat.uniforms.uRot.value.setFromMatrix4(rotM);

    tmpV.set(0, camS.ty, 0).project(camera);
    BG.uSpot.value.set(tmpV.x * 0.5 + 0.5, tmpV.y * 0.5 + 0.5);
    BG.uSpotR.value = lerp(0.82, 1.05, zoom);
    DU.uCen.value.set(0, camS.ty, 0);
    DU.uAng.value = ring.rotation.y;
    shared.uTime.value = time;
  }

  /* ----- loop ----- */
  let running = false, raf = 0, last = 0, time = 0, first = true, slow = 0, frames = 0;
  function renderOnce() {
    update(0.016, time);
    renderer.render(scene, camera);
  }
  function frame(now) {
    if (!running) { raf = 0; return; }
    const dt = Math.min(0.25, Math.max(0.001, (now - last) / 1000));
    last = now; time += dt;
    update(dt, time);
    renderer.render(scene, camera);
    if (first) { first = false; o.onFirstFrame && o.onFirstFrame(); }
    // phones: step resolution down if frames are consistently slow
    if (lite && ++frames > 20) {
      slow = slow * 0.9 + (dt > 0.05 ? 1 : 0) * 0.1;
      if (slow > 0.6 && dprCap > 1.01) { dprCap = Math.max(1, dprCap - 0.25); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap)); resize(); slow = 0; frames = 0; }
    }
    raf = requestAnimationFrame(frame);
  }
  return {
    attach,
    get view() { return view; },
    setRunning(on) {
      if (on === running) return;
      running = on;
      if (on) { last = performance.now(); raf = requestAnimationFrame(frame); }
    },
    setBuild(b) {
      const prev = build.metal;
      build = Object.assign({}, build, b);
      if (b.metal && b.metal !== prev) { mt = { from: mt.t < 1 ? mt.to : prev, to: b.metal, t: 0 }; }
      if (view === 'builder') { if (b.shape) setShape(b.shape); if (b.carat) setCarat(b.carat); }
    },
    drag(dx) { dragV = clamp(dragV + dx * 0.012, -9, 9); yaw += dx * 0.009; dragIdle = 0; },
    stoneMM(name, c) { const s = buildStone(name), k = (6.4 / (2 * buildStone('round').xmax)) * Math.cbrt(c); return [s.xmax * 2 * k, s.zmax * 2 * k]; }
  };
}
