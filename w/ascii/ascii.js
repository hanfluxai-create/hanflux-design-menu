// Blackline hero: a three.js padlock rendered into a tiny target (2 x 2 texels per character cell),
// classified per cell (luminance ramp, Sobel edge glyphs, scanner sweep, decrypt lens, breach alert),
// then drawn full resolution from a pixel-exact glyph atlas with phosphor glow and scanlines.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// 0-9 ramp, 10-13 edge glyphs, 14-29 hex digits, 30-31 spare
const GLYPHS = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@', '|', '/', '-', '\\',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', '_', 'x'];

const v3 = (h) => new THREE.Vector3(((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255);

const VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const CELL_FRAG = /* glsl */`
precision highp float;
uniform sampler2D tScene;
uniform vec2 uGrid;
uniform float uTime;
uniform float uScan;
uniform float uAlert;
uniform vec3 uLens;
uniform float uAspect;
uniform float uBg;
uniform vec4 uQuiet;
varying vec2 vUv;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
vec3 S(vec2 c) { return texture2D(tScene, (c + 0.5) / uGrid).rgb; }
float lum(vec3 c) { return sqrt(clamp(dot(c, vec3(0.299, 0.587, 0.114)), 0.0, 1.0)); }

void main() {
  vec2 c = floor(gl_FragCoord.xy);
  vec3 s = S(c);
  float L = lum(s);
  float tl = lum(S(c + vec2(-1.0, 1.0))), tc = lum(S(c + vec2(0.0, 1.0))), tr = lum(S(c + vec2(1.0, 1.0)));
  float ml = lum(S(c + vec2(-1.0, 0.0))), mr = lum(S(c + vec2(1.0, 0.0)));
  float bl = lum(S(c + vec2(-1.0, -1.0))), bc = lum(S(c + vec2(0.0, -1.0))), br = lum(S(c + vec2(1.0, -1.0)));
  float gx = (tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl);
  float gy = (tl + 2.0 * tc + tr) - (bl + 2.0 * bc + br);
  float mag = length(vec2(gx, gy));

  float g = 0.0, I = 0.0, mode = 0.0;
  // material ids by hue: red = alert, green = data packet, blue = orbit path, grey = the lock
  bool red = s.r > 0.09 && s.r > s.g * 2.5 && s.r > s.b * 2.5;
  bool pkt = s.g > 0.05 && s.g > s.r * 2.0 && s.g > s.b * 2.0;
  bool orb = s.b > 0.02 && s.b > s.r * 2.0 && s.b > s.g * 2.0;
  bool obj = L > 0.07 && !pkt && !orb;

  if (obj) {
    float Lc = clamp((L - 0.07) / 0.82, 0.0, 1.0);
    g = clamp(floor(Lc * 8.6 + 1.0), 1.0, 9.0);
    I = 0.2 + 0.8 * Lc;
    // edge glyphs only on the silhouette, or on very strong interior creases
    float minN = min(min(min(tl, tc), min(tr, ml)), min(min(mr, bl), min(bc, br)));
    bool sil = minN < 0.07;
    if ((sil && mag > 0.5 && L > 0.22) || (mag > 1.35 && L > 0.25)) {
      float ang = atan(abs(gy), abs(gx));
      if (ang < 0.42) g = 10.0;
      else if (ang > 1.15) g = 12.0;
      else g = (gx * gy > 0.0) ? 13.0 : 11.0;
      I = max(I, 0.66);
    }
  }
  if (pkt) { g = s.g > 0.45 ? 9.0 : 7.0; I = 0.75 + 0.25 * clamp(s.g, 0.0, 1.0); }
  if (orb) { g = s.b > 0.3 ? 2.0 : 1.0; I = 0.34 + 0.4 * clamp(s.b, 0.0, 1.0); }

  // quiet zone behind the headline (x0, y0, x1, y1 in cells) keeps type readable
  float quiet = (c.x > uQuiet.x && c.x < uQuiet.z && c.y > uQuiet.y && c.y < uQuiet.w) ? 0.25 : 1.0;

  if (!obj && !red && !pkt && !orb) {
    vec2 q = c * vec2(0.06 * uAspect * 1.8, 0.06);
    float n = vnoise(q + vec2(uTime * 0.05, -uTime * 0.03)) * 0.65 + vnoise(q * 2.6 - vec2(uTime * 0.06, 0.0)) * 0.35;
    if (n > 0.6) { g = n > 0.7 ? 2.0 : 1.0; I = (0.07 + (n - 0.6) * 0.9) * uBg * quiet; }
    float fl = floor(uTime * 2.5);
    if (hash(c + fl * 17.13) > 0.9986) { g = 14.0 + floor(hash(c * 1.73 + fl) * 16.0); I = 0.26 * uBg * quiet; }
  }

  // scanner sweep, rows counted from the bottom
  float d = c.y - uScan;
  if (abs(d) < 0.5) {
    if (obj) { g = 14.0 + floor(hash(c + floor(uTime * 24.0)) * 16.0); I = 1.0; mode = 0.5; }
    else { g = 3.0; I = 0.36 * quiet; mode = 0.0; }
  } else if (obj && d > 0.0 && d < 10.0) {
    float k = 1.0 - d / 10.0;
    float fl3 = floor(uTime * 16.0);
    if (hash(c + fl3 * 3.1) < k * 0.85) { g = 14.0 + floor(hash(c * 3.1 + fl3) * 16.0); mode = 0.5; I = max(I, 0.55 + 0.45 * k); }
  }

  // pointer decrypt lens
  if (uLens.z > 0.5) {
    float dd = length((c - uLens.xy) * vec2(uAspect, 1.0));
    if (dd < uLens.z) {
      if (obj) { g = 14.0 + floor(hash(c + floor(uTime * 12.0)) * 16.0); mode = 0.5; I = max(I, 0.5 + 0.5 * L); }
      else if (mod(c.x, 3.0) < 0.5 && mod(c.y, 2.0) < 0.5) { g = 1.0; I = 0.3; }
    }
    if (abs(dd - uLens.z) < 0.55) { if (!obj) g = 1.0; I = max(I, 0.5); mode = 0.5; }
  }

  if (red) { mode = 1.0; I = max(I, 0.85); if (g < 1.0) g = 8.0; }
  if (uAlert > 0.01 && obj) {
    float fl2 = floor(uTime * 30.0);
    if (hash(c + fl2) < uAlert * 0.7) { mode = 1.0; g = 14.0 + floor(hash(c * 2.3 + fl2) * 16.0); I = max(I, 0.8); }
  }
  gl_FragColor = vec4(g / 255.0, I, mode, 1.0);
}`;

const OUT_FRAG = /* glsl */`
precision highp float;
uniform sampler2D tCells;
uniform sampler2D tAtlas;
uniform vec2 uCell;
uniform vec2 uGrid;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uPhos;
uniform vec3 uDim;
uniform vec3 uWhite;
uniform vec3 uRed;
uniform vec3 uBgc;
uniform float uScanPx;
uniform float uFade;
varying vec2 vUv;

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 cell = floor(fc / uCell);
  vec2 local = floor(fc - cell * uCell);
  vec4 d = texelFetch(tCells, ivec2(cell), 0);
  float g = floor(d.r * 255.0 + 0.5);
  float I = d.g;
  float mode = d.b;
  vec2 tile = vec2(mod(g, 8.0), floor(g / 8.0));
  ivec2 ap = ivec2(int(tile.x * uCell.x + local.x), int(tile.y * uCell.y + (uCell.y - 1.0 - local.y)));
  vec3 a = texelFetch(tAtlas, ap, 0).rgb;

  vec3 base = mix(uDim, uPhos, smoothstep(0.12, 0.62, I));
  base = mix(base, uWhite, smoothstep(0.86, 1.0, I) * 0.55);
  if (mode > 0.75) base = uRed;
  else if (mode > 0.25) base = mix(uPhos, uWhite, 0.72);
  vec3 col = base * (a.r * (0.32 + 0.9 * I) + a.g * 0.6 * I);

  // phosphor bloom from the blurred cell intensities (linear taps on the tiny cell texture)
  vec2 uv = (fc / uCell) / uGrid;
  vec2 px = 1.0 / uGrid;
  vec4 h0 = texture2D(tCells, uv);
  vec4 h1 = texture2D(tCells, uv + vec2(px.x * 1.6, 0.0)) + texture2D(tCells, uv - vec2(px.x * 1.6, 0.0))
          + texture2D(tCells, uv + vec2(0.0, px.y * 1.3)) + texture2D(tCells, uv - vec2(0.0, px.y * 1.3));
  float halo = h0.g * 0.34 + h1.g * 0.165;
  float redness = clamp((h0.b * 0.4 + h1.b * 0.15) * 1.6 - 0.7, 0.0, 1.0);
  col += mix(uPhos, uRed, redness) * halo * halo * 0.2;

  float sl = 0.84 + 0.16 * sin(fc.y * 6.2831853 / uScanPx);
  col *= sl;
  float roll = smoothstep(0.94, 1.0, sin((fc.y / uRes.y) * 2.4 + uTime * 0.8) * 0.5 + 0.5);
  col *= 1.0 + roll * 0.1;
  vec2 q = fc / uRes;
  float vig = smoothstep(1.32, 0.42, length((q - 0.5) * vec2(1.1, 1.0)));
  col = uBgc + col * vig * uFade;
  gl_FragColor = vec4(col, 1.0);
}`;

const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t) => Math.max(0, Math.min(1, t));

export function createAsciiHero(canvas, host, opts = {}) {
  const mobile = !!opts.mobile;
  const interactive = !!opts.interactive;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false });
  } catch (e) {
    return null;
  }
  if (!renderer.capabilities.isWebGL2) { renderer.dispose(); return null; }
  const DPR = Math.min(window.devicePixelRatio || 1, (mobile || opts.lite) ? 1.5 : 2);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 1);

  // ---------------- 3D padlock ----------------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60);
  camera.position.set(0, 0, 14);

  const rig = new THREE.Group(); scene.add(rig);
  const lock = new THREE.Group(); rig.add(lock);
  lock.position.y = -0.22;

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdfe5e1, roughness: 0.4, metalness: 0.0 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.0 });
  const grooveMat = new THREE.MeshStandardMaterial({ color: 0x4c524e, roughness: 0.7 });
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const BODY = new THREE.Color(0xdfe5e1), STEEL = new THREE.Color(0xffffff), RED = new THREE.Color(0xff2020);

  const body = new THREE.Mesh(new RoundedBoxGeometry(3.0, 2.45, 1.15, 5, 0.32), bodyMat);
  body.position.y = -0.75;
  lock.add(body);
  for (const y of [0.16, -1.66]) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.12, 1.2), grooveMat);
    g.position.y = y; lock.add(g);
  }
  const plate = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.075, 8, 40), plateMat);
  plate.position.set(0, -0.58, 0.6); lock.add(plate);
  const kh = new THREE.Group(); kh.position.set(0, -0.62, 0.585); lock.add(kh);
  const khTop = new THREE.Mesh(new THREE.CircleGeometry(0.22, 28), holeMat); khTop.position.y = 0.1; kh.add(khTop);
  const khSlot = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.5), holeMat); khSlot.position.y = -0.17; kh.add(khSlot);

  const R = 0.98, T = 0.25, YC = 1.28;
  const shackle = new THREE.Group(); shackle.position.set(-R, 0, 0); lock.add(shackle);
  const arc = new THREE.Mesh(new THREE.TorusGeometry(R, T, 18, 56, Math.PI), steelMat);
  arc.position.set(R, YC, 0); shackle.add(arc);
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(T, T, YC - 0.1, 20), steelMat);
  legL.position.set(0, (YC + 0.1) / 2, 0); shackle.add(legL);
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(T, T, YC - 0.42, 20), steelMat);
  legR.position.set(2 * R, (YC + 0.42) / 2, 0); shackle.add(legR);

  // orbit of data packets
  const orbit = new THREE.Group(); orbit.rotation.set(1.36, 0.0, -0.22); rig.add(orbit);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.05, 6, 180), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
  orbit.add(ring);
  const PK = mobile ? 9 : 12;
  const packets = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), new THREE.MeshBasicMaterial({ color: 0x00ff00 }), PK);
  orbit.add(packets);
  const dummy = new THREE.Object3D();

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const key = new THREE.DirectionalLight(0xffffff, 3.4); key.position.set(-4, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 2.4); rim.position.set(5, 2.5, -5); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.7); fill.position.set(4, -3, 5); scene.add(fill);

  // ---------------- post: cells + output ----------------
  const rtOpts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true, stencilBuffer: false, generateMipmaps: false };
  const sceneRT = new THREE.WebGLRenderTarget(4, 4, rtOpts);
  const cellRT = new THREE.WebGLRenderTarget(4, 4, { ...rtOpts, depthBuffer: false });
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadGeo = new THREE.PlaneGeometry(2, 2);

  const cellMat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: CELL_FRAG, depthTest: false, depthWrite: false,
    uniforms: {
      tScene: { value: sceneRT.texture }, uGrid: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 },
      uScan: { value: -999 }, uAlert: { value: 0 }, uLens: { value: new THREE.Vector3(0, 0, 0) },
      uAspect: { value: 0.56 }, uBg: { value: 1 }, uQuiet: { value: new THREE.Vector4(-1, -1, -1, -1) },
    },
  });
  const outMat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: OUT_FRAG, depthTest: false, depthWrite: false,
    uniforms: {
      tCells: { value: cellRT.texture }, tAtlas: { value: null }, uCell: { value: new THREE.Vector2(9, 16) },
      uGrid: { value: new THREE.Vector2(1, 1) }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 },
      uPhos: { value: v3(0x39ff9f) }, uDim: { value: v3(0x1f6b4a) }, uWhite: { value: v3(0xe6fff3) },
      uRed: { value: v3(0xff3b3b) }, uBgc: { value: v3(0x020403) }, uScanPx: { value: 3 }, uFade: { value: 0 },
    },
  });
  const cellScene = new THREE.Scene();
  const cellQuad = new THREE.Mesh(quadGeo, cellMat); cellQuad.frustumCulled = false; cellScene.add(cellQuad);
  const outScene = new THREE.Scene();
  const outQuad = new THREE.Mesh(quadGeo, outMat); outQuad.frustumCulled = false; outScene.add(outQuad);

  let atlasTex = null;
  function buildAtlas(cw, ch) {
    const c = document.createElement('canvas');
    c.width = cw * 8; c.height = ch * 4;
    const x = c.getContext('2d');
    x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
    const fs = Math.min(cw / 0.6, ch * 0.86);
    x.font = `700 ${fs.toFixed(2)}px "JetBrains Mono", ui-monospace, Menlo, monospace`;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.globalCompositeOperation = 'lighter';
    const canFilter = 'filter' in x;
    const blur = Math.max(1, cw * 0.36);
    GLYPHS.forEach((gl, i) => {
      const tx = (i % 8) * cw, ty = Math.floor(i / 8) * ch;
      const cx = tx + cw / 2, cy = ty + ch / 2 + fs * 0.03;
      x.save(); x.beginPath(); x.rect(tx, ty, cw, ch); x.clip();
      x.fillStyle = '#ff0000'; x.fillText(gl, cx, cy);
      if (canFilter) { x.filter = `blur(${blur.toFixed(1)}px)`; x.fillStyle = '#00ff00'; x.fillText(gl, cx, cy); x.filter = 'none'; }
      else { x.fillStyle = '#00aa00'; x.fillText(gl, cx, cy); }
      x.restore();
    });
    if (atlasTex) atlasTex.dispose();
    atlasTex = new THREE.CanvasTexture(c);
    atlasTex.flipY = false;
    atlasTex.minFilter = THREE.NearestFilter; atlasTex.magFilter = THREE.NearestFilter;
    atlasTex.generateMipmaps = false;
    atlasTex.needsUpdate = true;
    outMat.uniforms.tAtlas.value = atlasTex;
  }

  // ---------------- layout ----------------
  let W = 1, H = 1, cw = 9, ch = 16, cols = 1, rows = 1;
  let lockRows = { top: 0, bot: 0 };
  function layout() {
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    W = renderer.domElement.width; H = renderer.domElement.height;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const phone = w < 760;
    cw = Math.max(5, Math.round((phone ? 7 : 9) * DPR));
    ch = Math.max(9, Math.round((phone ? 12 : 16) * DPR));
    cols = Math.ceil(W / cw); rows = Math.ceil(H / ch);
    sceneRT.setSize(cols * 2, rows * 2);
    cellRT.setSize(cols, rows);
    buildAtlas(cw, ch);
    cellMat.uniforms.uGrid.value.set(cols, rows);
    cellMat.uniforms.uAspect.value = cw / ch;
    outMat.uniforms.uGrid.value.set(cols, rows);
    outMat.uniforms.uCell.value.set(cw, ch);
    outMat.uniforms.uRes.value.set(W, H);
    outMat.uniforms.uScanPx.value = Math.max(2, Math.round(3 * DPR));

    // place the lock: right of the headline on desktop, top of the hero on phones
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const halfW = halfH * camera.aspect;
    const pxPerUnit = h / (2 * halfH);
    const vh = Math.min(window.innerHeight || h, h);
    let lockPx, cx, cy;
    if (phone) {
      lockPx = Math.min(vh * 0.33, w * 0.6 * (4.5 / 3.1));
      cx = w * 0.5; cy = (opts.navH || 60) + vh * 0.2 + 22;
    } else {
      lockPx = vh * 0.52;
      cx = w * 0.715; cy = vh * 0.41;
      const maxHalf = (w - cx) * 0.96;
      lockPx = Math.min(lockPx, maxHalf / 2.6 * 4.5);
    }
    const s = lockPx / (4.5 * pxPerUnit);
    rig.scale.setScalar(s);
    rig.position.set((cx / w * 2 - 1) * halfW, (1 - cy / h * 2) * halfH, 0);
    const rowC = rows - (cy * DPR) / ch;
    const halfRows = (lockPx * 0.5 * DPR) / ch;
    lockRows = { top: rowC + halfRows + 3, bot: rowC - halfRows - 3 };
    // quiet zone behind the headline (cells, y from the bottom)
    if (opts.quiet) {
      const q = opts.quiet();
      if (q) cellMat.uniforms.uQuiet.value.set(q.x0 * DPR / cw, rows - q.y1 * DPR / ch, q.x1 * DPR / cw, rows - q.y0 * DPR / ch);
    }
  }

  // ---------------- story: scan, breach, re-lock ----------------
  const st = { scanT0: -1, scanDur: 2.4, breachT0: -1, holdOpen: 3.0 };
  let time = 0;
  function scan(dur = 2.4) { st.scanT0 = time; st.scanDur = dur; }
  function breach() { st.breachT0 = time; }

  const pointer = { x: 0, y: 0, tx: 0, ty: 0, lx: 0, ly: 0, on: 0, ton: 0 };
  if (interactive) {
    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      pointer.lx = (e.clientX - r.left) * DPR / cw;
      pointer.ly = rows - (e.clientY - r.top) * DPR / ch;
      pointer.ton = 1;
    }, { passive: true });
    host.addEventListener('pointerleave', () => { pointer.ton = 0; pointer.tx = 0; pointer.ty = 0; });
  }

  function update(dt) {
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);
    pointer.on += (pointer.ton - pointer.on) * Math.min(1, dt * 5);

    // shackle and keyhole
    let lift = 0, swing = 0, alert = 0, shake = 0;
    if (st.breachT0 >= 0) {
      const b = time - st.breachT0;
      const open = easeOutBack(clamp01(b / 0.38));
      const sw = easeOutCubic(clamp01((b - 0.22) / 0.6));
      const close = easeInOutCubic(clamp01((b - st.holdOpen) / 0.75));
      lift = 0.62 * open * (1 - clamp01((b - st.holdOpen - 0.45) / 0.3));
      swing = -2.2 * sw * (1 - close);
      alert = Math.exp(-b * 2.6) * (b >= 0 ? 1 : 0);
      shake = Math.exp(-b * 6) * 0.06;
      holeMat.color.setHex(b < st.holdOpen + 0.3 ? 0xff1e1e : 0x000000);
      if (b > st.holdOpen + 1.2) st.breachT0 = -1;
    } else {
      holeMat.color.setHex(0x000000);
    }
    shackle.position.y = lift;
    shackle.rotation.y = swing;
    const redAmt = Math.min(1, alert * 1.25);
    bodyMat.color.copy(BODY).lerp(RED, redAmt);
    steelMat.color.copy(STEEL).lerp(RED, redAmt);
    plateMat.color.copy(STEEL).lerp(RED, redAmt);

    lock.rotation.y = Math.sin(time * 0.42) * 0.55 + pointer.x * 0.45 + (Math.random() - 0.5) * shake * 2;
    lock.rotation.x = 0.1 + Math.sin(time * 0.31) * 0.06 + pointer.y * 0.22;
    lock.position.x = (Math.random() - 0.5) * shake;
    orbit.rotation.y = Math.sin(time * 0.2) * 0.15;
    for (let i = 0; i < PK; i++) {
      const a = (i / PK) * Math.PI * 2 + time * 0.5;
      dummy.position.set(Math.cos(a) * 2.4, Math.sin(a) * 2.4, 0);
      dummy.rotation.set(time + i, time * 0.7 + i, 0);
      const sc = 0.75 + 0.35 * Math.sin(i * 1.7 + time * 2.0);
      dummy.scale.setScalar(sc);
      dummy.updateMatrix();
      packets.setMatrixAt(i, dummy.matrix);
    }
    packets.instanceMatrix.needsUpdate = true;

    // uniforms
    let scanRow = -999;
    if (st.scanT0 >= 0) {
      const p = (time - st.scanT0) / st.scanDur;
      if (p >= 0 && p <= 1) scanRow = lockRows.top + (lockRows.bot - lockRows.top) * easeInOutCubic(p);
      else if (p > 1) st.scanT0 = -1;
    }
    cellMat.uniforms.uScan.value = scanRow;
    cellMat.uniforms.uAlert.value = alert;
    cellMat.uniforms.uTime.value = time;
    cellMat.uniforms.uLens.value.set(pointer.lx, pointer.ly, pointer.on > 0.02 ? 7.5 * pointer.on : 0);
    outMat.uniforms.uTime.value = time;
    outMat.uniforms.uFade.value = Math.min(1, outMat.uniforms.uFade.value + dt * 1.6);
  }

  function render() {
    renderer.setRenderTarget(sceneRT); renderer.render(scene, camera);
    renderer.setRenderTarget(cellRT); renderer.render(cellScene, quadCam);
    renderer.setRenderTarget(null); renderer.render(outScene, quadCam);
  }

  // ---------------- loop ----------------
  let visible = true, running = false, last = 0, first = true;
  const frameMs = 1000 / 30;
  function frame(now) {
    if (!visible) { running = false; return; }
    requestAnimationFrame(frame);
    if (!last) last = now;
    const el = now - last;
    if (!first && el < frameMs - 2) return;
    const dt = Math.min(0.1, el / 1000);
    last = now;
    time += dt;
    update(dt);
    render();
    if (first) { first = false; opts.onFirstFrame && opts.onFirstFrame(); }
  }
  function start() { if (!running) { running = true; last = 0; requestAnimationFrame(frame); } }

  layout();
  const ro = new ResizeObserver(() => { layout(); });
  ro.observe(host);
  const io = new IntersectionObserver((ents) => {
    visible = ents[0].isIntersecting;
    if (visible) start();
  }, { rootMargin: '80px' });
  io.observe(host);
  start();

  return { scan, breach, relayout: layout, rebuildAtlas: () => buildAtlas(cw, ch) };
}
