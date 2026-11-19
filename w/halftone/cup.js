// Grain & Ink hero: a three.js cup, saucer, beans and steam shaded in riso-friendly tones,
// then printed through a two-ink halftone (blue screen at 15 deg, red at 75 deg) with
// misregistration, ink grain and a pointer "dot gain" lens. The canvas multiplies onto paper.
import * as THREE from 'three';

const QUAD_VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const HALFTONE_FRAG = /* glsl */`
precision highp float;
uniform sampler2D tScene;
uniform vec2 uRes;
uniform float uCell;
uniform vec2 uMis;
uniform vec3 uLens;
uniform float uLensAmt;
uniform float uTime;
uniform vec3 uInkR;
uniform vec3 uInkB;
uniform float uFade;
varying vec2 vUv;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
vec2 plates(vec3 c) {
  float L = dot(c, vec3(0.299, 0.587, 0.114));
  float W = c.r - c.b;
  float blue = (1.0 - L) * 1.15 - max(W, 0.0) * 1.35 + max(-W, 0.0) * 0.5;
  float red = max(W, 0.0) * 2.1 + (1.0 - L) * 0.3;
  vec2 v = clamp(vec2(red, blue), 0.0, 1.0);
  return clamp((v - 0.08) / 0.92, 0.0, 1.0);
}
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }

float screenCov(vec2 px, float ang, float cell, float which, vec2 off, float gain) {
  mat2 R = rot(ang), Ri = rot(-ang);
  vec2 p = R * (px - off);
  vec2 base = floor(p / cell - 0.5);
  float cov = 0.0;
  for (int j = 0; j < 2; j++) {
    for (int i = 0; i < 2; i++) {
      vec2 center = (base + vec2(float(i), float(j)) + 0.5) * cell;
      vec2 spx = Ri * center + off;
      vec3 col = texture2D(tScene, spx / uRes).rgb;
      vec2 pl = plates(col);
      float v = clamp((which < 0.5 ? pl.x : pl.y) * gain, 0.0, 1.0);
      float r = sqrt(v) * cell * 0.66;
      float d = length(p - center);
      cov = max(cov, smoothstep(r + 0.85, r - 0.85, d) * step(0.02, v));
    }
  }
  return cov;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  float lens = uLensAmt * smoothstep(uLens.z, 0.0, length(px - uLens.xy));
  float gain = 1.0 + lens * 0.9;
  float cell = uCell;
  float covB = screenCov(px, 0.2618, cell, 1.0, vec2(0.0), gain);
  float covR = screenCov(px, 1.309, cell, 0.0, uMis, gain);
  float g1 = vnoise(px * 0.33 + 11.0), g2 = vnoise(px * 0.29 - 5.0);
  covB *= 0.8 + 0.2 * g1;
  covR *= 0.8 + 0.2 * g2;
  covB *= step(0.05, hash(floor(px / 1.6) + 3.7));
  covR *= step(0.05, hash(floor(px / 1.6) + 9.1));
  vec3 col = mix(vec3(1.0), uInkB, covB * 0.94) * mix(vec3(1.0), uInkR, covR * 0.92);
  gl_FragColor = vec4(mix(vec3(1.0), col, uFade), 1.0);
}`;

const TONE_VERT = /* glsl */`
varying vec3 vN;
varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;
const TONE_FRAG = /* glsl */`
precision highp float;
uniform vec3 uLit;
uniform vec3 uShade;
uniform vec3 uL;
uniform float uSpec;
uniform float uRim;
varying vec3 vN;
varying vec3 vV;
void main() {
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  vec3 v = normalize(vV);
  vec3 l = normalize(uL);
  float d = max(dot(n, l), 0.0);
  float t = smoothstep(-0.1, 0.62, d);
  vec3 c = mix(uShade, uLit, t);
  float sp = pow(max(dot(n, normalize(l + v)), 0.0), 48.0) * uSpec;
  float fr = pow(1.0 - max(dot(n, v), 0.0), 2.5);
  c = mix(c, uShade, fr * uRim);
  gl_FragColor = vec4(c + sp, 1.0);
}`;

const STEAM_FRAG = /* glsl */`
precision highp float;
uniform float uTime;
uniform float uSeed;
uniform float uOp;
varying vec2 vUv;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }
void main() {
  float y = vUv.y;
  float x = vUv.x - 0.5;
  float t = uTime * 0.5 + uSeed * 10.0;
  float wig = sin(y * 7.0 - t * 1.8 + uSeed * 3.0) * (0.05 + 0.2 * y) + (vn(vec2(y * 3.0 - t * 0.8, uSeed * 7.0)) - 0.5) * 0.42 * y;
  float d = abs(x - wig);
  float w = 0.022 + 0.085 * y;
  float a = smoothstep(w, w * 0.2, d) * smoothstep(0.0, 0.1, y) * smoothstep(0.95, 0.38, y);
  a *= 0.45 + 0.55 * vn(vec2(x * 6.0 + uSeed, y * 8.0 - t * 1.4));
  gl_FragColor = vec4(0.6, 0.8, 1.0, a * uOp);
}`;

const toneMat = (lit, shade, spec = 0, rim = 0.2) => new THREE.ShaderMaterial({
  vertexShader: TONE_VERT, fragmentShader: TONE_FRAG, side: THREE.DoubleSide,
  uniforms: { uLit: { value: new THREE.Vector3(...lit) }, uShade: { value: new THREE.Vector3(...shade) }, uL: { value: new THREE.Vector3(-0.55, 0.75, 0.55) }, uSpec: { value: spec }, uRim: { value: rim } },
});

function beanGeometry() {
  const g = new THREE.SphereGeometry(1, 24, 18);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const x = v.x * 0.5;
    let y = v.y * 0.3;
    const z = v.z * 0.37;
    if (y > 0) {
      y *= 0.7;
      const gr = Math.exp(-(z * z) / (2 * 0.05 * 0.05));
      y -= 0.17 * gr * (1 - Math.min(1, Math.abs(v.x)) * 0.6);
    }
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}

function lathe(points, seg = 64) {
  return new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), seg);
}

export function createCup(canvas, host, opts = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false });
  } catch (e) { return null; }
  if (!renderer.capabilities.isWebGL2) { renderer.dispose(); return null; }
  const lite = !!opts.lite;
  const DPR = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0xffffff, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  camera.position.set(0, 2.15, 6.4);
  camera.lookAt(0, 0.62, 0);

  const rig = new THREE.Group(); scene.add(rig);
  const cupG = new THREE.Group(); rig.add(cupG);

  const china = toneMat([1, 1, 1], [0.62, 0.7, 0.87], 0.2, 0.16);
  const cup = new THREE.Mesh(lathe([[0, 0], [0.42, 0], [0.5, 0.015], [0.53, 0.05], [0.52, 0.08], [0.58, 0.16], [0.66, 0.32], [0.74, 0.52], [0.8, 0.72], [0.84, 0.9], [0.86, 0.99], [0.855, 1.02], [0.835, 1.03], [0.815, 1.01], [0.8, 0.94], [0.77, 0.86]]), china);
  cup.position.y = 0.085;
  cupG.add(cup);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.78, 48), toneMat([0.26, 0.12, 0.08], [0.07, 0.03, 0.05], 0.55, 0));
  coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.085 + 0.875; cupG.add(coffee);
  const crema = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.78, 48), toneMat([0.86, 0.55, 0.33], [0.5, 0.25, 0.16], 0, 0));
  crema.rotation.x = -Math.PI / 2; crema.position.y = 0.085 + 0.877; cupG.add(crema);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.772, 0.03, 8, 72), toneMat([1, 0.42, 0.32], [0.72, 0.18, 0.2], 0, 0));
  band.rotation.x = -Math.PI / 2; band.position.y = 0.085 + 0.6; cupG.add(band);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.065, 14, 40, Math.PI * 1.3), china);
  handle.position.set(0.88, 0.085 + 0.58, 0);
  handle.rotation.z = -0.65 * Math.PI - 0.12;
  cupG.add(handle);
  const saucer = new THREE.Mesh(lathe([[0, 0], [0.62, 0], [0.66, 0.025], [0.7, 0.03], [1.0, 0.07], [1.22, 0.12], [1.36, 0.17], [1.42, 0.2], [1.43, 0.215], [1.41, 0.225], [1.34, 0.2], [1.15, 0.14], [0.9, 0.1], [0.62, 0.085], [0, 0.085]]), china);
  rig.add(saucer);

  // contact shadow
  const sc = document.createElement('canvas'); sc.width = sc.height = 128;
  const sx = sc.getContext('2d');
  const rg = sx.createRadialGradient(64, 64, 6, 64, 64, 64);
  rg.addColorStop(0, 'rgba(255,255,255,0.55)'); rg.addColorStop(0.5, 'rgba(255,255,255,0.22)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
  sx.fillStyle = rg; sx.fillRect(0, 0, 128, 128);
  const shTex = new THREE.CanvasTexture(sc);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 3.5), new THREE.MeshBasicMaterial({ map: shTex, color: 0x6f84c2, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0.25, -0.005, 0.1);
  rig.add(shadow);

  // beans
  const beanGeo = beanGeometry();
  const beanMat = toneMat([0.94, 0.58, 0.4], [0.18, 0.05, 0.12], 0.3, 0.3);
  const rest = [];
  const restSpots = [[1.75, 0.5], [1.95, 0.95], [1.62, 1.5], [-1.75, 0.7], [-1.95, 1.25], [-1.6, 1.8], [0.4, 1.85], [-0.6, 1.95], [2.15, -0.2], [-2.05, -0.1]];
  restSpots.slice(0, lite ? 7 : 10).forEach(([x, z], i) => {
    const b = new THREE.Mesh(beanGeo, beanMat);
    b.scale.setScalar(0.42);
    b.position.set(x, 0.07, z);
    b.rotation.set(i % 3 === 0 ? Math.PI : 0, i * 1.7, (i % 2 ? 0.25 : -0.2));
    rig.add(b); rest.push(b);
  });
  const fly = [];
  const FLY = lite ? 5 : 7;
  for (let i = 0; i < FLY; i++) {
    const b = new THREE.Mesh(beanGeo, beanMat);
    b.scale.setScalar(0.5 + (i % 3) * 0.06);
    b.userData = { a: (i / FLY) * Math.PI * 2 + 0.4, r: 1.9 + (i % 3) * 0.28, y: 1.35 + ((i * 37) % 10) / 10 * 1.3, s: 0.12 + (i % 4) * 0.03, spin: 0.4 + (i % 3) * 0.25 };
    rig.add(b); fly.push(b);
  }

  // steam
  const steams = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.ShaderMaterial({ vertexShader: QUAD_VERT.replace('gl_Position = vec4(position.xy, 0.0, 1.0);', 'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);'), fragmentShader: STEAM_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uTime: { value: 0 }, uSeed: { value: i * 2.31 + 0.4 }, uOp: { value: [0.62, 0.5, 0.56][i] } } });
    const hgt = [2.3, 2.8, 2.5][i];
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.25, hgt, 1, 1), m);
    s.position.set([-0.28, 0.04, 0.3][i], 1.0 + hgt / 2, -0.05 + i * 0.02);
    rig.add(s); steams.push(s);
  }

  // print pass
  const rtOpts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true, generateMipmaps: false };
  const sceneRT = new THREE.WebGLRenderTarget(4, 4, rtOpts);
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const C = (h) => new THREE.Vector3(((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255);
  const hU = {
    tScene: { value: sceneRT.texture }, uRes: { value: new THREE.Vector2(1, 1) }, uCell: { value: 9 }, uMis: { value: new THREE.Vector2(3, -2) },
    uLens: { value: new THREE.Vector3(-999, -999, 1) }, uLensAmt: { value: 0 }, uTime: { value: 0 },
    uInkR: { value: C(0xe8432e) }, uInkB: { value: C(0x2c5bd6) }, uFade: { value: 0 },
  };
  const hMat = new THREE.ShaderMaterial({ vertexShader: QUAD_VERT, fragmentShader: HALFTONE_FRAG, uniforms: hU, depthTest: false, depthWrite: false });
  const pScene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), hMat); quad.frustumCulled = false; pScene.add(quad);

  // layout: centre the cup inside the zone element
  let W = 1, H = 1, baseCell = 9, cssW = 1, cssH = 1;
  const zone = opts.zone;
  function layout() {
    cssW = Math.max(1, host.clientWidth); cssH = Math.max(1, host.clientHeight);
    renderer.setSize(cssW, cssH, false);
    W = renderer.domElement.width; H = renderer.domElement.height;
    sceneRT.setSize(Math.max(2, Math.round(W * 0.5)), Math.max(2, Math.round(H * 0.5)));
    hU.uRes.value.set(W, H);
    camera.aspect = cssW / cssH;
    const phone = cssW < 760;
    baseCell = Math.round((phone ? 7 : 9) * DPR);
    const hr = host.getBoundingClientRect();
    const zr = zone ? zone.getBoundingClientRect() : { left: hr.left + cssW * 0.5, top: hr.top, width: cssW * 0.5, height: cssH };
    const zx = zr.left - hr.left, zy = zr.top - hr.top;
    const vh = Math.min(window.innerHeight || cssH, cssH);
    let cx, cy, sauPx;
    if (phone) {
      cx = zx + zr.width * 0.5; cy = zy + zr.height * 0.47;
      sauPx = Math.min(zr.width * 0.8, zr.height * 0.95);
    } else {
      cx = zx + zr.width * 0.56; cy = Math.min(zy + zr.height * 0.6, vh * 0.6);
      sauPx = Math.min(zr.width * 0.68, vh * 0.56);
    }
    const d = camera.position.distanceTo(new THREE.Vector3(0, 0.62, 0));
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * d;
    const pxPerUnit = cssH / (2 * halfH);
    rig.scale.setScalar(sauPx / (2.86 * pxPerUnit));
    camera.setViewOffset(cssW, cssH, cssW / 2 - cx, cssH / 2 - cy, cssW, cssH);
    camera.updateProjectionMatrix();
  }

  // input
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, lx: -999, ly: -999, on: 0, ton: 0 };
  if (opts.interactive) {
    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      ptr.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      ptr.lx = (e.clientX - r.left) * DPR; ptr.ly = (r.height - (e.clientY - r.top)) * DPR;
      ptr.ton = 1;
    }, { passive: true });
    host.addEventListener('pointerleave', () => { ptr.ton = 0; ptr.tx = 0; ptr.ty = 0; });
  }
  let scrollP = 0;
  function setScroll(p) { scrollP = Math.max(0, Math.min(1, p)); }

  let time = 0, last = 0, first = true, visible = true, running = false;
  const qInv = new THREE.Quaternion();
  function frame(now) {
    if (!visible) { running = false; return; }
    requestAnimationFrame(frame);
    if (!last) last = now;
    const el = now - last;
    if (!first && el < 31) return;
    const dt = Math.min(0.1, el / 1000);
    last = now; time += dt;
    ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 3);
    ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 3);
    ptr.on += (ptr.ton - ptr.on) * Math.min(1, dt * 4);
    const p = scrollP;
    rig.rotation.y = Math.sin(time * 0.35) * 0.18 + ptr.x * 0.35 + p * 1.1 - 0.35;
    rig.rotation.x = ptr.y * 0.08 + p * 0.25;
    cupG.rotation.y = Math.sin(time * 0.5) * 0.04;
    fly.forEach((b, i) => {
      const u = b.userData;
      const a = u.a + time * u.s;
      const rr = u.r * (1 + p * 0.9);
      b.position.set(Math.cos(a) * rr, u.y + Math.sin(time * 0.8 + i) * 0.12 + p * 0.8, Math.sin(a) * rr * 0.7);
      b.rotation.set(time * u.spin + i, time * u.spin * 0.7 + i * 2, i);
    });
    rig.updateMatrixWorld();
    rig.getWorldQuaternion(qInv).invert();
    steams.forEach((s) => { s.quaternion.copy(qInv).multiply(camera.quaternion); s.material.uniforms.uTime.value = time; });
    // print parameters: dots breathe with time and scroll, the red plate drifts out of register
    const breath = 1 + Math.sin(time * 0.9) * 0.05;
    hU.uCell.value = baseCell * breath * (1 + p * 0.85);
    hU.uMis.value.set((2.6 + p * 11 + Math.sin(time * 0.7) * 0.6) * DPR, (-1.8 - p * 6) * DPR);
    let lx = ptr.lx, ly = ptr.ly, la = ptr.on * 0.85;
    if (!opts.interactive) {
      lx = (cssW * (0.62 + 0.18 * Math.sin(time * 0.31))) * DPR;
      ly = (cssH * (0.48 + 0.16 * Math.sin(time * 0.47 + 1.0))) * DPR;
      la = opts.autoLens ? 0.45 : 0;
    }
    hU.uLens.value.set(lx, ly, 170 * DPR);
    hU.uLensAmt.value = la;
    hU.uTime.value = time;
    hU.uFade.value = Math.min(1, hU.uFade.value + dt * 2.2);
    renderer.setRenderTarget(sceneRT); renderer.render(scene, camera);
    renderer.setRenderTarget(null); renderer.render(pScene, quadCam);
    if (first) { first = false; opts.onFirstFrame && opts.onFirstFrame(); }
  }
  function start() { if (!running) { running = true; last = 0; requestAnimationFrame(frame); } }

  layout();
  const ro = new ResizeObserver(() => layout());
  ro.observe(host);
  if (zone) ro.observe(zone);
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) start(); }, { rootMargin: '60px' }).observe(host);
  start();
  return { setScroll, relayout: layout };
}
