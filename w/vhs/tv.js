// Static Bloom TV: a procedural synthwave scene (rendered small, like a real tape) played back
// through a VHS pass: YIQ chroma smear, luma edge enhancement, tape wobble, tracking band,
// head-switching noise, dropouts, scanlines and channel-change static.
import * as THREE from 'three';

const VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const SCENE_FRAG = /* glsl */`
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uHorizon;
uniform float uSunY;
uniform float uSunR;
uniform float uSunX;
uniform float uSunAmt;
uniform float uSpeed;
uniform float uBright;
uniform float uBlue;
uniform float uBars;
uniform float uStars;
uniform float uMount;
uniform float uBeams;
uniform float uWarm;
uniform float uNight;
uniform vec3 uSkyTop;
uniform vec3 uSkyHor;
uniform vec3 uGrid;
varying vec2 vUv;

float hash1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float hash2(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float n1(float x) { float i = floor(x), f = fract(x); return mix(hash1(i), hash1(i + 1.0), f * f * (3.0 - 2.0 * f)); }
float mfbm(float x) { return 0.55 * n1(x) + 0.28 * n1(x * 2.13 + 3.1) + 0.17 * n1(x * 4.37 + 7.7); }

vec3 bars(vec2 uv) {
  float i = floor(uv.x * 7.0);
  if (uv.y > 0.32) {
    if (i < 1.0) return vec3(0.75);
    if (i < 2.0) return vec3(0.75, 0.75, 0.0);
    if (i < 3.0) return vec3(0.0, 0.75, 0.75);
    if (i < 4.0) return vec3(0.0, 0.75, 0.0);
    if (i < 5.0) return vec3(0.75, 0.0, 0.75);
    if (i < 6.0) return vec3(0.75, 0.0, 0.0);
    return vec3(0.0, 0.0, 0.75);
  }
  if (uv.y > 0.24) {
    if (i < 1.0) return vec3(0.0, 0.0, 0.75);
    if (i > 1.5 && i < 2.5) return vec3(0.75, 0.0, 0.75);
    if (i > 3.5 && i < 4.5) return vec3(0.0, 0.75, 0.75);
    if (i > 5.5) return vec3(0.75);
    return vec3(0.07);
  }
  if (uv.x < 0.18) return vec3(0.0, 0.13, 0.3);
  if (uv.x < 0.36) return vec3(1.0);
  if (uv.x < 0.54) return vec3(0.2, 0.0, 0.42);
  return vec3(0.07);
}

void main() {
  vec2 uv = vUv;
  float asp = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - 0.5) * asp, uv.y);
  float h = uHorizon;
  float sr = uSunR * clamp(asp / 1.25, 0.62, 1.0);
  vec3 col;
  if (p.y >= h) {
    float t = clamp((p.y - h) / max(1.0 - h, 0.001), 0.0, 1.0);
    col = mix(uSkyHor, uSkyTop, pow(t, 0.5));
    vec2 sp = p * 70.0;
    float rnd = hash2(floor(sp));
    if (rnd > 0.982) {
      float tw = 0.55 + 0.45 * sin(uTime * (2.0 + rnd * 4.0) + rnd * 60.0);
      col += vec3(0.9, 0.92, 1.0) * smoothstep(0.17, 0.0, length(fract(sp) - 0.5)) * tw * uStars * smoothstep(0.08, 0.5, t);
    }
    vec2 sc = vec2(uSunX, h + uSunY);
    float d = length(p - sc);
    float sy = (p.y - sc.y) / sr;
    vec3 sunDay = mix(vec3(1.0, 0.24, 0.94), vec3(1.0, 0.95, 0.0), smoothstep(-0.9, 0.7, sy));
    vec3 sunNight = mix(vec3(0.33, 0.2, 1.0), vec3(1.0, 0.3, 0.92), smoothstep(-0.9, 0.8, sy));
    vec3 sunCol = mix(sunDay, sunNight, uNight);
    sunCol = mix(sunCol, vec3(1.0, 0.55, 0.75), uWarm * 0.5);
    float disk = smoothstep(sr, sr - 0.003, d);
    float stripes = 1.0;
    if (sy < 0.3) {
      float k = fract(sy * 6.5 + uTime * 0.16);
      float gap = mix(0.05, 0.55, clamp((0.3 - sy) / 1.3, 0.0, 1.0));
      stripes = smoothstep(gap - 0.035, gap + 0.035, k);
    }
    col += sunCol * 0.32 * exp(-max(d - sr, 0.0) * 9.0) * uSunAmt;
    col += sunCol * 0.1 * exp(-max(d - sr, 0.0) * 3.0) * uSunAmt;
    col = mix(col, sunCol, disk * stripes * uSunAmt);
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      vec2 o = vec2((-0.66 + fi * 0.44) * min(asp, 1.7), h);
      float a = 1.5708 + sin(uTime * (0.33 + fi * 0.07) + fi * 1.9) * 0.55;
      vec2 dir = vec2(cos(a), sin(a));
      vec2 rel = p - o;
      float along = dot(rel, dir);
      float perp = abs(rel.x * dir.y - rel.y * dir.x);
      float w = 0.006 + along * 0.05;
      float beam = smoothstep(w, 0.0, perp) * step(0.0, along) * exp(-along * 1.5);
      vec3 bc = mod(fi, 2.0) < 1.0 ? vec3(0.0, 0.94, 1.0) : vec3(1.0, 0.24, 0.94);
      col += bc * beam * 0.26 * uBeams;
    }
    float x = p.x;
    float side = smoothstep(sr * 0.55, sr * 0.55 + 0.5, abs(x - uSunX));
    float mh1 = h + uMount * (0.03 + 0.14 * mfbm(x * 2.1 + 11.0) * (0.3 + 0.7 * side));
    if (p.y < mh1) {
      float k = (mh1 - p.y) / max(mh1 - h, 0.001);
      col = mix(vec3(0.2, 0.06, 0.34), vec3(0.06, 0.02, 0.15), k);
      col += vec3(1.0, 0.24, 0.94) * 0.55 * exp(-(mh1 - p.y) * 240.0);
    }
    float mh2 = h + uMount * (0.012 + 0.085 * mfbm(x * 3.4 - 4.0) * side);
    if (p.y < mh2) {
      col = vec3(0.03, 0.01, 0.08);
      col += vec3(0.0, 0.94, 1.0) * 0.9 * exp(-(mh2 - p.y) * 300.0);
      float wf = abs(fract(x * 16.0) - 0.5);
      col += vec3(0.0, 0.94, 1.0) * 0.1 * smoothstep(0.05, 0.0, wf);
    }
  } else {
    float dy = h - p.y;
    float z = 0.5 / max(dy, 0.0005);
    vec2 g = vec2(p.x * z * 4.0, z + uTime * uSpeed);
    vec2 gw = fwidth(g);
    vec2 gd = abs(fract(g + 0.5) - 0.5) / max(gw, vec2(1e-4));
    float line = 1.0 - min(min(gd.x, gd.y) / 1.5, 1.0);
    float fog = exp(-z * 0.06);
    col = mix(vec3(0.05, 0.0, 0.12), vec3(0.1, 0.0, 0.2), smoothstep(0.0, 0.4, dy));
    col += uGrid * line * (0.16 + 0.9 * fog);
    float refl = exp(-abs(p.x - uSunX) * 4.0) * exp(-dy * 2.0) * uSunAmt;
    col += vec3(1.0, 0.3, 0.8) * refl * 0.5 * (0.55 + 0.45 * sin(z * 5.0 - uTime * 3.0));
  }
  col += vec3(1.0, 0.35, 0.9) * exp(-abs(p.y - h) * 120.0) * 0.85;
  col += vec3(1.0, 0.25, 0.85) * exp(-abs(p.y - h) * 12.0) * 0.12;
  col = mix(col, bars(uv), uBars);
  col = mix(col, vec3(0.17, 0.17, 1.0) * 0.92 + (hash2(uv * uRes + uTime) - 0.5) * 0.04, uBlue);
  col *= uBright;
  gl_FragColor = vec4(col, 1.0);
}`;

const VHS_FRAG = /* glsl */`
precision highp float;
uniform sampler2D tScene;
uniform vec2 uRes;
uniform float uTime;
uniform float uStatic;
uniform float uGlitch;
uniform float uRoll;
uniform float uScan;
varying vec2 vUv;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float hash1(float n) { return fract(sin(n * 91.345) * 47453.5453); }
float n1(float x) { float i = floor(x), f = fract(x); return mix(hash1(i), hash1(i + 1.0), f * f * (3.0 - 2.0 * f)); }
vec3 rgb2yiq(vec3 c) { return vec3(dot(c, vec3(0.299, 0.587, 0.114)), dot(c, vec3(0.596, -0.274, -0.322)), dot(c, vec3(0.211, -0.523, 0.312))); }
vec3 yiq2rgb(vec3 c) { return vec3(c.x + 0.956 * c.y + 0.621 * c.z, c.x - 0.272 * c.y - 0.647 * c.z, c.x - 1.106 * c.y + 1.703 * c.z); }

void main() {
  vec2 uv = vUv;
  uv.y = fract(uv.y + uRoll);
  float ln = floor(uv.y * 480.0);
  float t = uTime;
  float wob = (n1(ln * 0.11 + t * 9.0) - 0.5) * 0.0016 + sin(uv.y * 22.0 + t * 2.3) * 0.0006;
  float bandPos = fract(t * 0.045);
  float band = smoothstep(0.05, 0.0, abs(uv.y - bandPos));
  wob += band * (hash(vec2(ln, floor(t * 30.0))) - 0.5) * 0.018 * (0.4 + uGlitch);
  wob += uGlitch * step(0.68, n1(ln * 0.05 + t * 40.0)) * (hash(vec2(ln * 0.3, floor(t * 20.0))) - 0.5) * 0.07;
  float hs = smoothstep(0.028, 0.0, uv.y);
  wob += hs * (0.01 + 0.03 * hash(vec2(ln, floor(t * 24.0))));
  vec2 suv = vec2(uv.x + wob, uv.y);

  float px = 1.0 / uRes.x;
  vec3 c0 = texture2D(tScene, suv).rgb;
  float Y = rgb2yiq(c0).x;
  float Yb = (rgb2yiq(texture2D(tScene, suv - vec2(2.5 * px, 0.0)).rgb).x + rgb2yiq(texture2D(tScene, suv + vec2(2.5 * px, 0.0)).rgb).x) * 0.5;
  Y = Y + (Y - Yb) * 0.55;
  vec2 IQ = vec2(0.0);
  for (int i = -CHROMA; i <= CHROMA; i++) {
    IQ += rgb2yiq(texture2D(tScene, suv + vec2(float(i) * CW - 0.0045, 0.0)).rgb).yz;
  }
  IQ /= float(CHROMA * 2 + 1);
  IQ *= 1.22;
  vec3 col = yiq2rgb(vec3(Y, IQ));
  col.r = mix(col.r, texture2D(tScene, suv + vec2(0.0028, 0.0)).r, 0.3);

  float grain = hash(uv * uRes + fract(t * 61.0) * 100.0) - 0.5;
  col += grain * 0.075;
  float fl = floor(t * 15.0);
  float drop = step(0.9965, hash(vec2(ln, fl)));
  col += drop * smoothstep(0.07, 0.0, abs(uv.x - hash(vec2(ln + 7.0, fl)))) * 0.8;
  col += band * (hash(uv * uRes * 0.5 + t) - 0.5) * 0.3;
  col = mix(col, vec3(hash(vec2(ln, t))) * 0.75, hs * 0.55);
  col *= 0.8 + 0.2 * sin(gl_FragCoord.y * 6.2831853 / uScan);
  col = col * 0.93 + 0.022;
  if (uStatic > 0.001) {
    float sn = hash(floor(gl_FragCoord.xy * 0.5) + fract(t * 37.0) * 91.0);
    float rollbar = 0.7 + 0.3 * sin(uv.y * 8.0 - t * 26.0);
    col = mix(col, vec3(sn * rollbar), uStatic);
  }
  vec2 q = vUv - 0.5;
  col *= 1.0 - dot(q, q) * 0.85;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

// channel looks: everything a section needs to feel like a different broadcast
export const CHANNELS = {
  '03': { horizon: 0.34, sunY: 0.085, sunR: 0.19, sunX: 0, sunAmt: 1, speed: 0.55, bright: 1, blue: 0, bars: 0, stars: 1, mount: 1, beams: 1, warm: 0, night: 0, skyTop: 0x06061a, skyHor: 0x4f1470, grid: 0xff3df0 },
  '04': { horizon: 0.8, sunY: 0.09, sunR: 0.15, sunX: 0, sunAmt: 0.9, speed: 1.6, bright: 0.55, blue: 0, bars: 0, stars: 0.6, mount: 0.7, beams: 0.6, warm: 0, night: 1, skyTop: 0x0b0620, skyHor: 0x4a1270, grid: 0x00f0ff },
  '05': { horizon: 0.16, sunY: 0.52, sunR: 0.11, sunX: 0.42, sunAmt: 0.8, speed: 0.25, bright: 0.45, blue: 0, bars: 0, stars: 1.7, mount: 0.55, beams: 0, warm: 0, night: 1, skyTop: 0x03030c, skyHor: 0x26104d, grid: 0x2b2bff },
  '06': { horizon: 0.44, sunY: 0.0, sunR: 0.2, sunX: 0, sunAmt: 0.7, speed: 2.4, bright: 0.45, blue: 0, bars: 0, stars: 1.2, mount: 1.2, beams: 0.35, warm: 0, night: 1, skyTop: 0x040410, skyHor: 0x1d0f4a, grid: 0x00f0ff },
  '07': { horizon: 0.37, sunY: 0.15, sunR: 0.24, sunX: 0, sunAmt: 1, speed: 0.55, bright: 1, blue: 1, bars: 0, stars: 0, mount: 1, beams: 0, warm: 0, night: 0, skyTop: 0x06061a, skyHor: 0x5b1677, grid: 0xff3df0 },
  '08': { horizon: 0.37, sunY: 0.15, sunR: 0.24, sunX: 0, sunAmt: 1, speed: 0.55, bright: 0.24, blue: 0, bars: 1, stars: 0, mount: 1, beams: 0, warm: 0, night: 0, skyTop: 0x06061a, skyHor: 0x5b1677, grid: 0xff3df0 },
  '09': { horizon: 0.3, sunY: 0.06, sunR: 0.26, sunX: -0.3, sunAmt: 1, speed: 0.35, bright: 0.7, blue: 0, bars: 0, stars: 0.5, mount: 0.9, beams: 0.5, warm: 0.6, night: 0.7, skyTop: 0x12124f, skyHor: 0xb02a8c, grid: 0xff3df0 },
};

export function createTV(canvas, opts = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false, depth: false });
  } catch (e) { return null; }
  const lite = !!opts.lite;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const outScale = lite ? 0.62 : 0.85;
  renderer.setPixelRatio(Math.min(dpr, lite ? 1.5 : 1.25) * outScale);
  const sceneScale = lite ? 0.42 : 0.5;

  const sceneRT = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, generateMipmaps: false });
  sceneRT.texture.wrapS = THREE.ClampToEdgeWrapping;
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geo = new THREE.PlaneGeometry(2, 2);

  const C = (h) => new THREE.Vector3(((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255);
  const sceneU = {
    uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uHorizon: { value: 0.37 }, uSunY: { value: 0.15 }, uSunR: { value: 0.24 },
    uSunX: { value: 0 }, uSunAmt: { value: 1 }, uSpeed: { value: 0.55 }, uBright: { value: 1 }, uBlue: { value: 0 }, uBars: { value: 0 },
    uStars: { value: 1 }, uMount: { value: 1 }, uBeams: { value: 1 }, uWarm: { value: 0 }, uNight: { value: 0 },
    uSkyTop: { value: C(0x06061a) }, uSkyHor: { value: C(0x5b1677) }, uGrid: { value: C(0xff3df0) },
  };
  const sceneMat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: SCENE_FRAG, uniforms: sceneU, depthTest: false, depthWrite: false });
  const vhsU = {
    tScene: { value: sceneRT.texture }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 },
    uStatic: { value: 0 }, uGlitch: { value: 0 }, uRoll: { value: 0 }, uScan: { value: 3 },
  };
  const vhsMat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: VHS_FRAG, uniforms: vhsU, depthTest: false, depthWrite: false,
    defines: { CHROMA: lite ? 2 : 3, CW: lite ? '0.0052' : '0.0036' },
  });
  const sScene = new THREE.Scene(); const q1 = new THREE.Mesh(geo, sceneMat); q1.frustumCulled = false; sScene.add(q1);
  const vScene = new THREE.Scene(); const q2 = new THREE.Mesh(geo, vhsMat); q2.frustumCulled = false; vScene.add(q2);

  function apply(ch) {
    const c = CHANNELS[ch]; if (!c) return;
    sceneU.uHorizon.value = c.horizon; sceneU.uSunY.value = c.sunY; sceneU.uSunR.value = c.sunR; sceneU.uSunX.value = c.sunX;
    sceneU.uSunAmt.value = c.sunAmt; sceneU.uSpeed.value = c.speed; sceneU.uBright.value = c.bright; sceneU.uBlue.value = c.blue;
    sceneU.uBars.value = c.bars; sceneU.uStars.value = c.stars; sceneU.uMount.value = c.mount; sceneU.uBeams.value = c.beams; sceneU.uWarm.value = c.warm;
    sceneU.uNight.value = c.night || 0;
    if (opts.mobile && ch === '03') { sceneU.uHorizon.value = 0.33; sceneU.uSunY.value = 0.075; }
    sceneU.uSkyTop.value.copy(C(c.skyTop)); sceneU.uSkyHor.value.copy(C(c.skyHor)); sceneU.uGrid.value.copy(C(c.grid));
  }

  let W = 1, H = 1;
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    W = renderer.domElement.width; H = renderer.domElement.height;
    const sw = Math.max(64, Math.round(w * sceneScale * Math.min(dpr, 1.25))), sh = Math.max(48, Math.round(h * sceneScale * Math.min(dpr, 1.25)));
    sceneRT.setSize(sw, sh);
    sceneU.uRes.value.set(sw, sh);
    vhsU.uRes.value.set(W, H);
    vhsU.uScan.value = Math.max(2, Math.round(3 * renderer.getPixelRatio()));
  }

  // static bursts and glitches
  let staticT = -1, pending = null, glitchT = -1, glitchDur = 0.3;
  function burst(next) {
    staticT = 0; pending = next;
  }
  function glitch(d = 0.3) { glitchT = 0; glitchDur = d; }

  let time = 0, last = 0, first = true, running = false;
  const frameMs = 1000 / 30;
  function frame(now) {
    requestAnimationFrame(frame);
    if (!last) last = now;
    const el = now - last;
    if (!first && el < frameMs - 2) return;
    const dt = Math.min(0.1, el / 1000);
    last = now;
    time += dt;
    // static envelope: up in 60 ms, hold, decay
    let st = 0, roll = 0;
    if (staticT >= 0) {
      staticT += dt;
      const a = staticT;
      st = a < 0.06 ? a / 0.06 : a < 0.2 ? 1 : Math.max(0, 1 - (a - 0.2) / 0.26);
      roll = a < 0.46 ? Math.sin(a / 0.46 * Math.PI) * 0.12 : 0;
      if (pending && a >= 0.1) { apply(pending); pending = null; }
      if (a > 0.5) staticT = -1;
    }
    let gl = 0;
    if (glitchT >= 0) {
      glitchT += dt;
      gl = Math.max(0, 1 - glitchT / glitchDur);
      if (glitchT > glitchDur) glitchT = -1;
    }
    sceneU.uTime.value = time;
    vhsU.uTime.value = time;
    vhsU.uStatic.value = Math.max(st * 0.92, opts.boot ? Math.max(0, 1 - time / 0.45) : 0);
    vhsU.uRoll.value = roll;
    vhsU.uGlitch.value = gl;
    renderer.setRenderTarget(sceneRT); renderer.render(sScene, cam);
    renderer.setRenderTarget(null); renderer.render(vScene, cam);
    if (first) { first = false; opts.onFirstFrame && opts.onFirstFrame(); }
  }

  apply('03');
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(frame);
  return { burst, glitch, apply, get time() { return time; } };
}
