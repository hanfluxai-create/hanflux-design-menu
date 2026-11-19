// Keystone Build: structural line model that starts aligned to the SVG plan, then rises floor by floor.
import * as THREE from 'three';
import { BLD } from './drawing.js';

const VS = /* glsl */`
attribute vec3 aStart; attribute vec3 aEnd; attribute vec4 aInfo;
uniform vec2 uRes; uniform float uPx; uniform float uGrow; uniform float uWide;
varying float vSide; varying float vHW; varying float vA; varying float vT;
void main(){
  vec3 s = aStart, e = aEnd;
  float lo = min(s.y, e.y);
  float a = clamp((uGrow - lo) / 0.9, 0.0, 1.0);
  s.y = min(s.y, max(uGrow, lo)); e.y = min(e.y, max(uGrow, lo));
  vec4 cs = projectionMatrix * viewMatrix * vec4(s, 1.0), ce = projectionMatrix * viewMatrix * vec4(e, 1.0);
  vec2 hs = 0.5 * uRes, ps = cs.xy / cs.w * hs, pe = ce.xy / ce.w * hs, d = pe - ps;
  float len = length(d); vec2 dir = len > 1e-5 ? d / len : vec2(1.0, 0.0), nrm = vec2(-dir.y, dir.x);
  float hw = 0.5 * (aInfo.x + uWide) * uPx, qw = hw + 1.0;
  vec4 c = position.y < 0.5 ? cs : ce;
  c.xy += (nrm * position.x * qw + dir * (position.y < 0.5 ? -hw : hw)) / hs * c.w;
  gl_Position = c; vSide = position.x * qw; vHW = hw; vA = a; vT = aInfo.y;
}`;
const FS = /* glsl */`
uniform vec3 uWhite; uniform vec3 uCyan; uniform vec3 uYellow; uniform float uAlpha; uniform float uGlow;
varying float vSide; varying float vHW; varying float vA; varying float vT;
void main(){
  vec3 col = vT < 0.5 ? uWhite : (vT < 1.5 ? uCyan : uYellow);
  float cov = uGlow > 0.5 ? (1.0 - smoothstep(0.0, vHW + 1.0, abs(vSide))) * 0.16 : clamp(vHW + 0.5 - abs(vSide), 0.0, 1.0);
  float a = cov * vA * uAlpha * (vT > 0.5 && vT < 1.5 ? 0.55 : 1.0);
  if (a < 0.004) discard;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`;

function buildSegs() {
  const S = [], add = (a, b, w, t) => S.push([a, b, w, t]);
  const { gx, gz, lv, core, parapet, coreTop } = BLD;
  const inCore = (x, z) => x > core[0] - 0.1 && x < core[2] + 0.1 && z > core[1] && z < core[3];
  gx.forEach(x => add([x, 0, -2.4], [x, 0, 26.4], 1.0, 1));
  gz.forEach(z => add([-2.4, 0, z], [38.4, 0, z], 1.0, 1));
  gx.forEach(x => gz.forEach(z => {
    if (inCore(x, z)) return;
    const r = 0.3;
    add([x - r, 0, z - r], [x + r, 0, z - r], 1.2, 0); add([x + r, 0, z - r], [x + r, 0, z + r], 1.2, 0);
    add([x + r, 0, z + r], [x - r, 0, z + r], 1.2, 0); add([x - r, 0, z + r], [x - r, 0, z - r], 1.2, 0);
    add([x, 0, z], [x, lv[lv.length - 1], z], 2.0, 0);
  }));
  for (let i = 1; i < lv.length; i++) {
    const y = lv[i];
    gz.forEach(z => add([0, y, z], [36, y, z], i === lv.length - 1 ? 1.6 : 1.2, 0));
    gx.forEach(x => add([x, y, 0], [x, y, 24], i === lv.length - 1 ? 1.6 : 1.2, 0));
    for (const [o, yy, w] of [[0.45, y, 1.6], [0.45, y - 0.3, 0.9]]) {
      add([-o, yy, -o], [36 + o, yy, -o], w, 0); add([36 + o, yy, -o], [36 + o, yy, 24 + o], w, 0);
      add([36 + o, yy, 24 + o], [-o, yy, 24 + o], w, 0); add([-o, yy, 24 + o], [-o, yy, -o], w, 0);
    }
  }
  const [cx0, cz0, cx1, cz1] = core;
  for (const [x, z] of [[cx0, cz0], [cx1, cz0], [cx1, cz1], [cx0, cz1]]) add([x, 0, z], [x, coreTop, z], 2.2, 2);
  const ring = (y, w, t) => { add([cx0, y, cz0], [cx1, y, cz0], w, t); add([cx1, y, cz0], [cx1, y, cz1], w, t); add([cx1, y, cz1], [cx0, y, cz1], w, t); add([cx0, y, cz1], [cx0, y, cz0], w, t); };
  ring(0, 1.6, 2); lv.forEach(y => ring(y, 1.2, 2)); ring(coreTop, 1.8, 2);
  add([cx0 + 2.4, 0, cz0], [cx0 + 2.4, coreTop, cz0], 1.0, 2); add([cx0 + 4.8, 0, cz0], [cx0 + 4.8, coreTop, cz0], 1.0, 2);
  for (const [x, z] of [[-0.45, -0.45], [36.45, -0.45], [36.45, 24.45], [-0.45, 24.45]]) add([x, lv[lv.length - 1], z], [x, parapet, z], 1.4, 0);
  add([-0.45, parapet, -0.45], [36.45, parapet, -0.45], 1.4, 0); add([36.45, parapet, -0.45], [36.45, parapet, 24.45], 1.4, 0);
  add([36.45, parapet, 24.45], [-0.45, parapet, 24.45], 1.4, 0); add([-0.45, parapet, 24.45], [-0.45, parapet, -0.45], 1.4, 0);
  return S;
}

export function initModel(canvas, opts) {
  const lite = opts.lite;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
  renderer.setPixelRatio(dpr); renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 600);
  const segs = buildSegs(), n = segs.length;
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0], 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  const A = new Float32Array(n * 3), B = new Float32Array(n * 3), I = new Float32Array(n * 4);
  segs.forEach(([a, b, w, t], i) => { A.set(a, i * 3); B.set(b, i * 3); I.set([w, t, 0, 0], i * 4); });
  g.setAttribute('aStart', new THREE.InstancedBufferAttribute(A, 3));
  g.setAttribute('aEnd', new THREE.InstancedBufferAttribute(B, 3));
  g.setAttribute('aInfo', new THREE.InstancedBufferAttribute(I, 4));
  g.instanceCount = n;
  const U = {
    uRes: { value: new THREE.Vector2(1, 1) }, uPx: { value: dpr }, uGrow: { value: 0 }, uAlpha: { value: 1 },
    uWhite: { value: new THREE.Color('#e6f0ff') }, uCyan: { value: new THREE.Color('#7fd4ff') }, uYellow: { value: new THREE.Color('#ffcc00') }
  };
  const mk = (glow) => new THREE.Mesh(g, new THREE.ShaderMaterial({
    uniforms: Object.assign({}, U, { uGlow: { value: glow }, uWide: { value: glow ? 7 : 0 } }), vertexShader: VS, fragmentShader: FS,
    transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending
  }));
  const glowM = mk(1), lineM = mk(0);
  if (!lite) scene.add(glowM);
  scene.add(lineM);
  [glowM, lineM].forEach(m => { m.frustumCulled = false; });

  let W = 1, H = 1;
  function resize() {
    const r = canvas.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    const v = new THREE.Vector2(); renderer.getDrawingBufferSize(v); U.uRes.value.copy(v);
  }
  resize(); window.addEventListener('resize', resize);

  const tmp = new THREE.Vector3(), mat = new THREE.Matrix4();
  // state: { t (0 top-down aligned to plan .. 1 axonometric), grow (0..1), alpha, spin }
  function render(st) {
    const map = opts.planMap();                           // screen px of plan origin + px per metre
    const ppmTop = map.ppm, ppmAxo = Math.min(H / 62, W / (opts.mobile ? 60 : 82));
    const t = st.t, e = t * t * (3 - 2 * t);
    const cTop = new THREE.Vector3((W / 2 - map.ox) / ppmTop, 0, (H / 2 - map.oy) / ppmTop);
    const cAxo = new THREE.Vector3(18, 14, 12);
    const target = cTop.clone().lerp(cAxo, e);
    const az = -0.72 * e + st.spin, el = THREE.MathUtils.degToRad(90 - 58 * e);
    const ppm = ppmTop + (ppmAxo - ppmTop) * e;
    const fx = 0.5 + (opts.fx - 0.5) * e, fy = 0.5 + (opts.fy - 0.5) * e;
    const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    const r = new THREE.Vector3(Math.cos(az), 0, -Math.sin(az)), u = new THREE.Vector3().crossVectors(dir, r);
    mat.makeBasis(r, u, dir); cam.quaternion.setFromRotationMatrix(mat);
    cam.position.copy(target).addScaledVector(dir, 200);
    const hw = W / 2 / ppm, hh = H / 2 / ppm;
    cam.left = -hw; cam.right = hw; cam.top = hh; cam.bottom = -hh;
    cam.setViewOffset(W, H, -(fx - 0.5) * W, -(fy - 0.5) * H, W, H);
    cam.updateMatrixWorld();
    U.uGrow.value = st.grow * (BLD.coreTop + 1);
    U.uAlpha.value = st.alpha;
    renderer.render(scene, cam);
    // project label anchors
    if (opts.onProject) opts.onProject((p) => { tmp.set(p[0], p[1], p[2]).project(cam); return [(tmp.x * 0.5 + 0.5) * W, (-tmp.y * 0.5 + 0.5) * H]; });
  }
  return { render, resize };
}
