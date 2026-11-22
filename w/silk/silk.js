// Selvine Salon & Spa · flowing satin.
// One fixed WebGL canvas behind the page. A finely subdivided plane is displaced in the vertex
// shader (domain-warped sine folds plus simplex noise) and lit with an anisotropic satin shader
// (Kajiya-Kay style fibre highlights, a softer shifted lobe and a grazing sheen). The same mesh can
// fold into a twisting two-tone ribbon. Colour and shape are driven by the page scroll; the loop
// only runs while a section that shows the silk is on screen.
import * as THREE from 'three';

const HX = window.HX || { lite: false, embed: false, device: 'desktop', reducedMotion: false, ready() {}, on() {} };
const C = (h) => new THREE.Color(h);

// [shadow, mid, sheen] per mood
const PAL = {
  plum: [C('#12060c'), C('#4b2137'), C('#f2cf9f')],
  blush: [C('#a56b5f'), C('#ecc5b9'), C('#fff5ef')],
  sage: [C('#4f5e4a'), C('#a6b49d'), C('#f5f8ee')],
  gold: [C('#6a4a20'), C('#caa56b'), C('#fff3d4')],
  pearl: [C('#a39282'), C('#efe5d9'), C('#ffffff')]
};
const ORDER = ['plum', 'blush', 'sage', 'gold', 'pearl'];

const NOISE = /* glsl */`
vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x){ return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v){
  const vec4 K = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, K.yy));
  vec2 x0 = v - i + dot(i, K.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + K.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * K.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}`;

const VERT = /* glsl */`
uniform float uTime;
uniform float uFold;
uniform float uScroll;
uniform float uFlow;
uniform vec2 uSize;
uniform vec4 uPtr;
uniform vec3 uRA;
uniform vec3 uRB;
uniform vec3 uRPerp;
uniform vec4 uRib;
uniform float uRDepth;
uniform float uRPhase;
uniform float uEps;
varying vec3 vPos;
varying vec3 vN;
varying vec3 vT;
varying float vFold;
varying float vH;
${NOISE}
// the draped sheet: long diagonal folds that meander, a cross fold and a fine ripple
float H(vec2 p){
  float t = uTime;
  vec2 ps = p + vec2(0.0, uScroll);
  vec2 w = vec2(snoise(ps * 0.26 + vec2(t * 0.030, -t * 0.021)), snoise(ps * 0.26 + vec2(4.7 - t * 0.026, 2.1 + t * 0.018)));
  vec2 q = ps + w * 0.85;
  float a = dot(q, vec2(0.92, 0.39));
  float b = dot(q, vec2(-0.45, 0.89));
  float h = 0.30 * sin(a * 1.30 + t * 0.28);
  h += 0.14 * sin(b * 2.30 - t * 0.36 + 1.7);
  h += 0.045 * sin(a * 4.1 + b * 1.3 + t * 0.55);
  h += uFlow * 0.07 * sin(p.y * 2.2 + p.x * 0.6 - t * 1.6);
  vec2 d = p - uPtr.xy;
  float r2 = dot(d, d);
  h += uPtr.z * 0.22 * exp(-r2 * 2.0);
  h += uPtr.w * 0.05 * exp(-r2 * 0.8) * sin(sqrt(r2) * 8.0 - t * 4.0);
  return h;
}
vec3 sheetP(vec2 st){ vec2 p = (st - 0.5) * uSize; return vec3(p, H(p)); }
vec3 centre(float s){
  vec3 c = mix(uRA, uRB, s);
  float ph = s * uRib.y + uRPhase;
  c += uRPerp * (uRib.x * sin(ph));
  c.z += uRDepth * sin(ph * 0.8 + 1.1);
  return c;
}
// the ribbon: a sinuous centre line, a twisting cross direction and a light flutter
vec3 ribbonP(vec2 st){
  float s = st.x;
  vec3 c = centre(s);
  vec3 T = normalize(centre(s + 0.004) - c);
  vec3 side = normalize(cross(vec3(0.0, 0.0, 1.0), T));
  vec3 up = cross(T, side);
  float th = 0.5 + s * uRib.w * 6.2831853 + uTime * 0.28 + 0.55 * sin(s * 4.0 + uTime * 0.33);
  vec3 W = cos(th) * side + sin(th) * up;
  vec3 p = c + W * ((st.y - 0.5) * uRib.z);
  p += up * 0.016 * sin(s * 34.0 - uTime * 1.8);
  return p;
}
float foldAt(vec2 st){
  float f = clamp(uFold * 1.45 - (1.0 - st.x) * 0.45, 0.0, 1.0);
  return f * f * (3.0 - 2.0 * f);
}
vec3 P(vec2 st){
  if (uFold <= 0.0) return sheetP(st);
  if (uFold >= 1.0) return ribbonP(st);
  float f = foldAt(st);
  vec3 p = mix(sheetP(st), ribbonP(st), f);
  p.z += sin(f * 3.14159) * 0.42;
  return p;
}
void main(){
  vec2 st = uv;
  vec3 p = P(st);
  vec3 du = P(st + vec2(uEps, 0.0)) - p;
  vec3 dv = P(st + vec2(0.0, uEps)) - p;
  vN = normalize(cross(du, dv));
  vT = normalize(du);
  vPos = p;
  vFold = (uFold <= 0.0) ? 0.0 : ((uFold >= 1.0) ? 1.0 : foldAt(st));
  vH = p.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const FRAG = /* glsl */`
uniform vec3 uShadow;
uniform vec3 uMid;
uniform vec3 uSheen;
uniform vec3 uBShadow;
uniform vec3 uBMid;
uniform vec3 uBSheen;
uniform vec3 uLight;
uniform float uBroad;
uniform vec4 uCalm;
uniform vec2 uHalf;
varying vec3 vPos;
varying vec3 vN;
varying vec3 vT;
varying float vFold;
varying float vH;
void main(){
  vec3 N = normalize(vN);
  bool front = gl_FrontFacing;
  if (!front) N = -N;
  vec3 V = normalize(cameraPosition - vPos);
  vec3 T = normalize(vT - N * dot(N, vT));
  vec3 L = normalize(uLight);
  float ndl = dot(N, L);
  float wrap = clamp((ndl + 0.5) / 1.5, 0.0, 1.0);
  wrap = wrap * wrap * (3.0 - 2.0 * wrap);
  vec3 Hv = normalize(L + V);
  // fibre highlight: brightest where the half vector is perpendicular to the warp threads
  float th = dot(T, Hv);
  float s1 = pow(sqrt(max(1.0 - th * th, 0.0)), 70.0) * smoothstep(-0.15, 0.45, ndl);
  vec3 T2 = normalize(T + N * 0.3);
  float th2 = dot(T2, Hv);
  float s2 = pow(sqrt(max(1.0 - th2 * th2, 0.0)), 22.0) * smoothstep(-0.3, 0.6, ndl);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float rim = pow(1.0 - ndv, 3.0);
  bool back = (!front) && vFold > 0.5;
  vec3 cS = back ? uBShadow : uShadow;
  vec3 cM = back ? uBMid : uMid;
  vec3 cH = back ? uBSheen : uSheen;
  vec2 q = vPos.xy / uHalf;
  float shine = smoothstep(-0.75, 0.65, dot(q, uCalm.xy));
  float cs = uCalm.z * (1.0 - vFold);
  float k = mix(1.0 - cs, 1.0 + cs * 0.55, shine);
  vec3 col = mix(cS, cM, wrap);
  col += cH * s1 * 0.9 * k;
  col += mix(cM, cH, 0.5) * s2 * uBroad * k;
  col += cH * rim * 0.11 * (0.4 + 0.6 * wrap);
  col *= mix(mix(0.80, 1.05, smoothstep(-0.34, 0.34, vH)), 1.0, vFold);
  gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
  #include <colorspace_fragment>
  gl_FragColor.rgb += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
}`;

const smooth = (a, b, x) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ state: () => {serv:number, ribbon:boolean, fold:number}, onFirstFrame?: () => void }} opts
 */
export function initSilk(canvas, opts) {
  const lite = !!HX.lite;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, alpha: false, powerPreference: 'high-performance', stencil: false });
  } catch (e) { return null; }
  if (!renderer.getContext()) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
  // the full-screen sheet is soft, so phones draw it at half resolution; the ribbon has crisp
  // edges but covers few pixels, so it gets a sharper buffer
  const basePR = lite ? dpr * 0.5 : dpr;
  const ribbonPR = lite ? dpr * 0.9 : dpr;
  let govScale = 1, ribbonMode = false;
  renderer.setPixelRatio(basePR);
  renderer.setClearColor(C('#f7f1ea'), 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);
  camera.position.set(0, 0, 5);

  const U = {
    uTime: { value: 7 }, uFold: { value: 0 }, uScroll: { value: 0 }, uFlow: { value: 0 },
    uSize: { value: new THREE.Vector2(8, 5) }, uPtr: { value: new THREE.Vector4(0, 0, 0, 0) },
    uRA: { value: new THREE.Vector3() }, uRB: { value: new THREE.Vector3() }, uRPerp: { value: new THREE.Vector3(1, 0, 0) },
    uRib: { value: new THREE.Vector4(0.2, 7, 0.5, 1.4) }, uRDepth: { value: 0.4 }, uRPhase: { value: 0 }, uEps: { value: 0.0016 },
    uShadow: { value: PAL.plum[0].clone() }, uMid: { value: PAL.plum[1].clone() }, uSheen: { value: PAL.plum[2].clone() },
    uBShadow: { value: PAL.gold[0].clone() }, uBMid: { value: PAL.gold[1].clone() }, uBSheen: { value: PAL.gold[2].clone() },
    uLight: { value: new THREE.Vector3(-0.55, 0.72, 0.62) }, uBroad: { value: 0.2 }, uCalm: { value: new THREE.Vector4(1, 0, 0.5, 0) }, uHalf: { value: new THREE.Vector2(1, 1) }
  };
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide });
  const isPortrait = (w, h) => w <= 760 || (w <= 1080 && w < h);
  let mesh = null, portrait = isPortrait(innerWidth, innerHeight);

  function build() {
    const aspect = Math.max(0.4, Math.min(2.6, (canvas.clientWidth || innerWidth) / Math.max(1, canvas.clientHeight || innerHeight)));
    const sy = lite ? 64 : 120;
    const sx = Math.max(lite ? 96 : 150, Math.round(sy * Math.max(aspect, 0.62) * 1.15));
    const geo = new THREE.PlaneGeometry(1, 1, sx, sy);
    geo.deleteAttribute('normal');
    if (mesh) { mesh.geometry.dispose(); mesh.geometry = geo; } else { mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; scene.add(mesh); }
  }

  let visW = 1, visH = 1;
  const A = new THREE.Vector3(), B = new THREE.Vector3();
  function layout() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    const was = portrait;
    portrait = isPortrait(w, h);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    visW = visH * camera.aspect;
    U.uSize.value.set(visW * 1.5, visH * 1.5);
    U.uHalf.value.set(visW * 0.5, visH * 0.5);
    // type sits on the left on wide screens and at the bottom on phones: keep the sheen on the open side
    if (portrait) U.uCalm.value.set(0.25, 0.97, 0.5, 0); else U.uCalm.value.set(0.97, 0.22, 0.5, 0);
    if (!portrait) {
      // a tall ribbon falling through the right third, clear of the booking form
      A.set(0.31 * visW, 0.84 * visH, 0); B.set(0.16 * visW, -0.84 * visH, 0);
      U.uRib.value.set(0.06 * visW, Math.PI * 2 * 1.05, 0.2 * visH, 1.1);
      U.uRDepth.value = 0.45;
    } else {
      // a long diagonal ribbon across the top of the phone screen
      A.set(-0.9 * visW, 0.20 * visH, 0); B.set(0.9 * visW, 0.31 * visH, 0);
      U.uRib.value.set(0.05 * visH, Math.PI * 2 * 1.0, 0.1 * visH, 1.05);
      U.uRDepth.value = 0.3;
    }
    U.uRA.value.copy(A); U.uRB.value.copy(B);
    const dir = B.clone().sub(A).normalize();
    U.uRPerp.value.set(-dir.y, dir.x, 0);
    if (was !== portrait || !mesh) build();
  }
  build();
  layout();

  // palette from the page state
  function palette(st) {
    if (st.ribbon) {
      U.uShadow.value.copy(PAL.plum[0]); U.uMid.value.copy(PAL.plum[1]); U.uSheen.value.copy(PAL.plum[2]);
      return;
    }
    const x = Math.min(Math.max(st.serv || 0, 0), 1) * (ORDER.length - 1);
    const i = Math.min(Math.floor(x), ORDER.length - 2);
    const f = smooth(0.2, 0.8, x - i);
    const a = PAL[ORDER[i]], b = PAL[ORDER[i + 1]];
    U.uShadow.value.lerpColors(a[0], b[0], f);
    U.uMid.value.lerpColors(a[1], b[1], f);
    U.uSheen.value.lerpColors(a[2], b[2], f);
  }

  // pointer: a soft hand under the silk (desktop only), a slow phantom breeze in the menu frame
  const ptr = { x: 0.35, y: 0.05, tx: 0.35, ty: 0.05, k: 0, tk: 0, rip: 0, live: false };
  const fine = !HX.embed && matchMedia('(pointer:fine)').matches;
  if (fine) {
    addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth * 2 - 1, ny = -(e.clientY / innerHeight) * 2 + 1;
      const sp = Math.hypot(nx - ptr.tx, ny - ptr.ty);
      ptr.tx = nx; ptr.ty = ny; ptr.live = true; ptr.tk = 1;
      ptr.rip = Math.min(1.2, ptr.rip + sp * 6);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { ptr.tk = 0; });
  }

  let active = true, running = false, first = true, last = performance.now(), time = 7, lastY = scrollY, flow = 0;
  let still = false, lastStillY = -1e9, lastStillAt = 0, seen = 0, samples = [], stepped = 0;
  const reduce = !!HX.reducedMotion;

  function govern(gap) {
    if (first || still) return;
    if (++seen <= 3) return;
    samples.push(gap);
    if (samples.length < 8) return;
    samples.sort((a, b) => a - b);
    const med = samples[4]; samples = [];
    if (med > 150) { still = true; govScale = 1; applyPR(); }
    else if (med > 36 && stepped < 2) { stepped++; govScale = stepped === 1 ? 0.72 : 0.5; applyPR(); }
  }
  function applyPR() {
    renderer.setPixelRatio(Math.max(0.35, (ribbonMode ? ribbonPR : basePR) * govScale));
    layout();
    lastStillY = -1e9;
  }

  function frame(now) {
    if (!active) { running = false; return; }
    const gap = now - last; last = now;
    govern(gap);
    const dt = Math.min(gap / 1000, 0.05);
    const y = scrollY;
    if (still && !first) {
      // very slow renderer: redraw when the page moves, never more than every 300 ms
      if (Math.abs(y - lastStillY) < 3 || now - lastStillAt < 300) { requestAnimationFrame(frame); return; }
      lastStillY = y; lastStillAt = now;
    }
    const vh = innerHeight || 1;
    const vel = (y - lastY) / Math.max(dt, 1 / 120) / vh; lastY = y;
    flow += (Math.min(Math.abs(vel), 2.5) - flow) * 0.06;
    if (!reduce) time += dt * (0.85 + flow * 0.8);
    // pointer smoothing
    if (!ptr.live) { // phantom breeze
      ptr.tx = 0.38 + 0.3 * Math.sin(time * 0.19); ptr.ty = 0.02 + 0.32 * Math.sin(time * 0.13 + 1.2); ptr.tk = HX.embed ? 0.55 : 0.35;
    }
    ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
    ptr.k += (ptr.tk - ptr.k) * 0.04; ptr.rip *= 0.95;
    const st = opts.state();
    const fd = st.fold || 0;
    if ((!ribbonMode && fd > 0.6) || (ribbonMode && fd < 0.4)) { ribbonMode = !ribbonMode; applyPR(); }
    palette(st);
    U.uTime.value = time;
    U.uScroll.value = (y / vh) * 0.38;
    U.uFlow.value = flow;
    U.uFold.value = Math.min(Math.max(st.fold || 0, 0), 1);
    U.uRPhase.value = time * 0.22 + (y / vh) * 0.9;
    U.uPtr.value.set(ptr.x * visW * 0.5, ptr.y * visH * 0.5, ptr.k, Math.min(ptr.rip, 1));
    const ang = Math.sin((y / vh) * 0.55) * 0.22;
    U.uLight.value.set(-0.55 + ang + (ptr.live ? ptr.x * 0.18 : 0), 0.72 + (ptr.live ? ptr.y * 0.12 : 0), 0.62);
    renderer.render(scene, camera);
    if (first) {
      first = false;
      try { opts.onFirstFrame && opts.onFirstFrame(); } catch (e) {}
    }
    requestAnimationFrame(frame);
  }
  function start() { if (active && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
  function setActive(v) { active = !!v; if (active) start(); }

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); active = false; }, false);
  canvas.addEventListener('webglcontextrestored', () => { active = true; start(); }, false);
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); if (still) lastStillY = -1e9; }, 120); });

  let compiled = false;
  const go = () => { if (compiled) return; compiled = true; start(); };
  try {
    const pr = renderer.compileAsync ? renderer.compileAsync(scene, camera) : null;
    if (pr && pr.then) { pr.then(go, go); setTimeout(go, 5000); } else go();
  } catch (e) { go(); }

  return { setActive, layout, renderer, kick: () => { lastStillY = -1e9; } };
}
