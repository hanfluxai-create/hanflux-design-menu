// Maison Orré: raymarched liquid-metal sculpture.
// Raw WebGL, one full-screen triangle. Sphere positions are computed on the CPU each frame,
// the GPU only does a bounded sphere-trace of 6 smooth-unioned spheres plus studio lighting.

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';

const FRAG = (steps) => `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec4 uS0; uniform vec4 uS1; uniform vec4 uS2; uniform vec4 uS3; uniform vec4 uS4; uniform vec4 uS5;
uniform float uK;
uniform vec3 uF0;
uniform vec3 uGlow;
uniform vec2 uOff;
uniform float uZoom;
uniform float uFade;
uniform vec3 uBMin;
uniform vec3 uBMax;
uniform vec2 uLight;
uniform float uWob;

float smin(float a, float b, float k){
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}
float sph(vec3 p, vec4 s){ return length(p - s.xyz) - s.w; }
float map(vec3 p){
  float d = sph(p, uS0);
  d = smin(d, sph(p, uS1), uK);
  d = smin(d, sph(p, uS2), uK);
  d = smin(d, sph(p, uS3), uK);
  d = smin(d, sph(p, uS4), uK);
  d = smin(d, sph(p, uS5), uK);
  d += uWob * sin(p.x * 5.0 + uTime * 1.3) * sin(p.y * 4.6 - uTime * 1.05) * sin(p.z * 5.2 + uTime * 0.8);
  return d;
}
vec3 nrm(vec3 p){
  const vec2 e = vec2(0.0016, -0.0016);
  return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}
float box(vec3 r, vec3 c, vec3 u, vec2 hs, float s){
  float f = dot(r, c);
  if (f <= 0.0) return 0.0;
  vec3 q = r / f - c;
  vec3 ax = normalize(cross(u, c));
  vec3 ay = cross(c, ax);
  vec2 l = abs(vec2(dot(q, ax), dot(q, ay)));
  vec2 m = 1.0 - smoothstep(hs - s, hs + s, l);
  return m.x * m.y;
}
vec3 env(vec3 r){
  float a = uLight.x; float ca = cos(a); float sa = sin(a);
  r.xz = mat2(ca, -sa, sa, ca) * r.xz;
  float b = uLight.y; float cb = cos(b); float sb = sin(b);
  r.yz = mat2(cb, -sb, sb, cb) * r.yz;
  float y = r.y;
  vec3 W = vec3(1.0, 0.95, 0.87);
  // dark backdrop, warmer and a little lighter towards the horizon
  vec3 col = mix(vec3(0.060, 0.046, 0.032), vec3(0.006, 0.006, 0.006), smoothstep(0.02, 0.65, y));
  // studio floor sweep: crisp horizon slightly above eye level, bright near the seam, falling into shadow
  float hz = 0.07;
  float fl = smoothstep(hz + 0.015, hz - 0.035, y);
  float fall = exp(-max(hz - y, 0.0) * 4.2);
  vec3 floorC = vec3(0.44, 0.34, 0.22) * (0.10 + 0.90 * fall);
  col = mix(col, floorC, fl);
  // a darker band just under the seam gives the classic chrome double line
  col *= 1.0 - 0.55 * exp(-abs(y - (hz - 0.11)) * 30.0) * fl;
  // thin bright horizon seam
  col += (W * 0.6 + uGlow * 0.9) * exp(-abs(y - hz) * 42.0);
  // key softbox overhead-left, large and bright
  col += W * 8.0 * box(r, normalize(vec3(-0.42, 0.80, 0.42)), vec3(0.0, 1.0, 0.0), vec2(0.55, 0.26), 0.05);
  // tall strip right
  col += W * 5.0 * box(r, normalize(vec3(0.95, 0.12, 0.30)), vec3(0.0, 1.0, 0.0), vec2(0.07, 0.80), 0.03);
  // coloured rim strip back-left
  col += mix(W, uGlow * 2.4, 0.6) * 3.4 * box(r, normalize(vec3(-0.86, 0.06, -0.50)), vec3(0.0, 1.0, 0.0), vec2(0.06, 0.90), 0.03);
  // overhead bar behind
  col += W * 2.2 * box(r, normalize(vec3(0.20, 0.93, -0.32)), vec3(0.0, 0.0, 1.0), vec2(0.70, 0.07), 0.04);
  // wide floor card low in front: a soft specular band along the underside
  col += W * 0.9 * box(r, normalize(vec3(-0.1, -0.62, 0.78)), vec3(0.0, 1.0, 0.0), vec2(0.85, 0.10), 0.12);
  // small front fill card, low and to the right, breaks up the dark front
  col += W * 1.1 * box(r, normalize(vec3(0.45, 0.30, 0.84)), vec3(0.0, 1.0, 0.0), vec2(0.16, 0.10), 0.05);
  return col;
}
void hitS(vec3 ro, vec3 rd, vec4 s, inout float tb, inout vec3 nb){
  vec3 oc = ro - s.xyz;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - s.w * s.w;
  float h = b * b - c;
  if (c > 0.0 && b < 0.0 && h > 0.0) {
    float t = -b - sqrt(h);
    if (t > 0.03 && t < tb) { tb = t; nb = (oc + rd * t) / s.w; }
  }
}
vec3 reflCol(vec3 p, vec3 r){
  float tb = 1e9; vec3 nb = vec3(0.0, 1.0, 0.0);
  hitS(p, r, uS0, tb, nb); hitS(p, r, uS1, tb, nb); hitS(p, r, uS2, tb, nb);
  hitS(p, r, uS3, tb, nb); hitS(p, r, uS4, tb, nb); hitS(p, r, uS5, tb, nb);
  if (tb < 1e8) {
    vec3 r2 = reflect(r, normalize(nb));
    return env(r2) * uF0 * 0.85;
  }
  return env(r);
}
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
vec3 shade(vec3 p, vec3 n, vec3 rd){
  float ndv = clamp(dot(n, -rd), 0.0, 1.0);
  vec3 r = reflect(rd, n);
  vec3 e = reflCol(p + n * 0.012, r);
  vec3 eAvg = vec3(0.16, 0.13, 0.10) + uGlow * 0.22;
  e = mix(e, eAvg, smoothstep(0.32, 0.0, ndv) * 0.75);
  float fr = pow(1.0 - ndv, 5.0);
  vec3 F = uF0 + (1.0 - uF0) * fr;
  vec3 c = e * F;
  vec3 film = 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + ndv * 1.7 + uTime * 0.035));
  c *= mix(vec3(1.0), 0.55 + film * 0.95, 0.26 * (1.0 - ndv));
  c += uF0 * 0.016;
  c = aces(c * 1.08);
  return pow(c, vec3(0.4545));
}
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 q = (uv - uOff) / uZoom;
  vec3 ro = vec3(0.0, 0.0, 6.0);
  vec3 rd = normalize(vec3(q, -2.2));
  vec3 bg = vec3(0.0431, 0.0431, 0.0471);
  float hd = length((uv - uOff) * vec2(0.85, 1.0)) / uZoom;
  bg += uGlow * 0.10 * exp(-hd * hd * 2.0) * uFade;
  vec3 col = bg;
  vec3 inv = 1.0 / rd;
  vec3 t0 = (uBMin - ro) * inv;
  vec3 t1 = (uBMax - ro) * inv;
  vec3 tmn = min(t0, t1);
  vec3 tmx = max(t0, t1);
  float tN = max(max(tmn.x, tmn.y), tmn.z);
  float tF = min(min(tmx.x, tmx.y), tmx.z);
  if (uFade > 0.001 && tF > max(tN, 0.0)) {
    float t = max(tN, 0.0);
    float md = 1e9;
    float tm = t;
    bool hit = false;
    bool exited = false;
    float pxa = 1.0 / (uRes.y * uZoom * 2.2);
    for (int i = 0; i < ${steps}; i++) {
      vec3 p = ro + rd * t;
      float d = map(p);
      if (d < 0.6 * pxa * t) { hit = true; break; }
      float a = d / t;
      if (a < md) { md = a; tm = t; }
      t += d * 0.92;
      if (t > tF) { exited = true; break; }
    }
    float cov = hit ? 1.0 : (exited ? 1.0 - smoothstep(0.6 * pxa, 2.2 * pxa, md) : 1.0 - smoothstep(1.2 * pxa, 3.2 * pxa, md));
    if (cov > 0.0) {
      vec3 p = ro + rd * (hit ? t : tm);
      col = mix(bg, shade(p, nrm(p), rd), cov * uFade);
    }
  }
  col += (hash(gl_FragCoord.xy + fract(uTime * 7.0)) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const easeInOut = (t) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t, 0, 1));
const outBack = (t) => { const c = 1.9; t = clamp(t, 0, 1) - 1; return 1 + (c + 1) * t * t * t + c * t * t; };

// World units visible: at z = 0 the half-height is 6 * 0.5 / 2.2 = 1.3636 / zoom.
export const HALF_H = 6 * 0.5 / 2.2;

export class Liquid {
  constructor(canvas, { lite = false, scale = 0.5 } = {}) {
    this.canvas = canvas;
    this.lite = lite;
    this.scale = scale;
    this.ok = false;
    const opts = { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: false };
    const gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
    if (!gl) return;
    this.gl = gl;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const rname = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    this.software = /swiftshader|llvmpipe|software/i.test(rname);
    this.steps = lite ? 36 : 58;
    if (!this.build()) return;
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.ok = false; }, false);
    canvas.addEventListener('webglcontextrestored', () => { this.build(); this.resize(); }, false);
    this.spheres = Array.from({ length: 6 }, () => [0, 0, 0, 0.3]);
    this.ok = true;
    this.resize();
  }

  build() {
    const gl = this.gl;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT);
    const fs = sh(gl.FRAGMENT_SHADER, FRAG(this.steps));
    if (!vs || !fs) return false;
    const pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs);
    gl.bindAttribLocation(pr, 0, 'p');
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(pr)); return false; }
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.u = {};
    ['uRes', 'uTime', 'uS0', 'uS1', 'uS2', 'uS3', 'uS4', 'uS5', 'uK', 'uF0', 'uGlow', 'uOff', 'uZoom', 'uFade', 'uBMin', 'uBMax', 'uLight', 'uWob']
      .forEach((n) => { this.u[n] = gl.getUniformLocation(pr, n); });
    return true;
  }

  resize() {
    if (!this.gl) return;
    const dprCap = this.lite ? 1.5 : 2;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const w = Math.max(1, this.canvas.clientWidth || window.innerWidth);
    const h = Math.max(1, this.canvas.clientHeight || window.innerHeight);
    const W = Math.max(2, Math.round(w * dpr * this.scale));
    const H = Math.max(2, Math.round(h * dpr * this.scale));
    if (this.canvas.width !== W || this.canvas.height !== H) {
      this.canvas.width = W; this.canvas.height = H;
    }
    this.gl.viewport(0, 0, W, H);
    this.aspect = w / h;
  }

  // ---------- sphere choreography ----------
  // Free-floating sculpture: six spheres on slow, incommensurate orbits so they merge and split.
  sculpt(t, spread, lean) {
    const s = spread;
    return [
      [0.13 * Math.sin(0.31 * t) + lean, 0.10 * Math.sin(0.27 * t + 1.0), 0.05 * Math.sin(0.2 * t), 0.62],
      [0.86 * Math.cos(0.53 * t) * s + lean, 0.52 * Math.sin(0.53 * t) * s, 0.40 * Math.sin(0.53 * t + 0.6) * s, 0.42],
      [-0.92 * Math.sin(0.41 * t + 2.0) * s + lean, 0.74 * Math.cos(0.37 * t + 1.0) * s, 0.32 * Math.cos(0.41 * t) * s, 0.36],
      [0.62 * Math.sin(0.67 * t + 4.0) * s + lean, -0.82 * Math.cos(0.59 * t + 0.5) * s, 0.48 * Math.sin(0.71 * t) * s, 0.30],
      [1.04 * Math.cos(0.29 * t + 3.0) * s + lean, 0.26 * Math.sin(0.83 * t) * s, -0.40 * Math.cos(0.29 * t) * s, 0.23],
      [-0.52 * Math.cos(0.90 * t + 5.0) * s + lean, 1.02 * Math.sin(0.45 * t + 2.0) * s, 0.30 * Math.sin(0.9 * t) * s, 0.17],
    ];
  }

  // Hanging reservoir that grows a drop, necks, lets go; the drop falls to the floor line and is absorbed.
  drip(t, topY, floorY) {
    const T = 3.8;
    const cyc = Math.floor(t / T);
    const ph = (t - cyc * T) / T;
    const yA = topY + 0.16;
    const sway = 0.03 * Math.sin(t * 0.8);
    const A = [sway, yA, 0, 0.64];
    const E = [-0.42 + sway, topY + 0.06, 0.08, 0.40];
    const F = [0.40 + sway, topY + 0.02, -0.06, 0.36];
    const yStart = yA - 0.34;
    const yHang = yA - 0.98;
    const hidden = [sway, yA + 0.05, 0, 0.0];
    let B, C, D;
    if (ph < 0.55) {
      const u = easeInOut(ph / 0.55);
      const cy = mix(yStart, yHang, u);
      C = [sway, cy, 0, mix(0.13, 0.30, u)];
      B = [sway, (yA - 0.56 + cy) * 0.5 + 0.02, 0, mix(0.17, 0.095, u)];
      D = hidden;
    } else if (ph < 0.8) {
      const v = (ph - 0.55) / 0.25;
      const cy = yHang - (yHang - floorY) * v * v;
      C = [sway, cy, 0, 0.30];
      const back = outBack(Math.min(1, v * 2.2));
      B = [sway, mix(yHang + 0.36, yA - 0.5, back), 0, mix(0.095, 0.16, Math.min(1, v * 2))];
      const dv = clamp((v - 0.12) / 0.88, 0, 1);
      D = [sway, mix(yHang + 0.3, floorY + 0.25, dv * dv), 0, 0.075 * Math.sin(Math.min(1, v * 3) * Math.PI * 0.5)];
    } else if (ph < 0.9) {
      const w = (ph - 0.8) / 0.1;
      C = [sway, floorY - 0.18 * w, 0, 0.30 * (1 - w) * (1 - w)];
      B = [sway, yA - 0.5, 0, 0.16];
      D = [sway, floorY + 0.25 - 0.4 * w, 0, 0.075 * (1 - w)];
    } else {
      C = [sway, yStart, 0, 0.0];
      B = [sway, yA - 0.5, 0, 0.16];
      D = hidden;
    }
    this.landCycle = ph >= 0.8 ? cyc : cyc - 1;
    return [A, B, C, D, E, F];
  }

  // state: { time, spread, gather, topY, bottomY, presence, lean }
  update(st) {
    const a = this.sculpt(st.time, st.spread, st.lean);
    const g = smooth(st.gather);
    const pres = st.presence;
    const grow = mix(0.35, 1, smooth(pres)) * st.intro;
    let b = null;
    if (g > 0.001) b = this.drip(st.time, st.topY, st.floorY);
    const min = [1e9, 1e9, 1e9];
    const max = [-1e9, -1e9, -1e9];
    const k = mix(0.52, 0.34, g);
    for (let i = 0; i < 6; i++) {
      const s = this.spheres[i];
      const p = a[i];
      if (b) {
        const q = b[i];
        // stagger the gather a little per sphere so they arrive one after another
        const gi = smooth(clamp(g * 1.35 - i * 0.06, 0, 1));
        s[0] = mix(p[0], q[0], gi); s[1] = mix(p[1], q[1], gi); s[2] = mix(p[2], q[2], gi); s[3] = mix(p[3], q[3], gi);
      } else { s[0] = p[0]; s[1] = p[1]; s[2] = p[2]; s[3] = p[3]; }
      s[3] *= grow;
      const pad = s[3] + k * 0.5 + 0.04;
      for (let j = 0; j < 3; j++) { min[j] = Math.min(min[j], s[j] - pad); max[j] = Math.max(max[j], s[j] + pad); }
    }
    this.k = k;
    this.bmin = min; this.bmax = max;
  }

  render(st) {
    if (!this.ok) return;
    const gl = this.gl, u = this.u;
    gl.uniform2f(u.uRes, this.canvas.width, this.canvas.height);
    gl.uniform1f(u.uTime, st.time);
    const S = this.spheres;
    gl.uniform4f(u.uS0, S[0][0], S[0][1], S[0][2], S[0][3]);
    gl.uniform4f(u.uS1, S[1][0], S[1][1], S[1][2], S[1][3]);
    gl.uniform4f(u.uS2, S[2][0], S[2][1], S[2][2], S[2][3]);
    gl.uniform4f(u.uS3, S[3][0], S[3][1], S[3][2], S[3][3]);
    gl.uniform4f(u.uS4, S[4][0], S[4][1], S[4][2], S[4][3]);
    gl.uniform4f(u.uS5, S[5][0], S[5][1], S[5][2], S[5][3]);
    gl.uniform1f(u.uK, this.k);
    gl.uniform3f(u.uF0, st.f0[0], st.f0[1], st.f0[2]);
    gl.uniform3f(u.uGlow, st.glow[0], st.glow[1], st.glow[2]);
    gl.uniform2f(u.uOff, st.offX, st.offY);
    gl.uniform1f(u.uZoom, st.zoom);
    gl.uniform1f(u.uFade, clamp(st.presence, 0, 1));
    gl.uniform3f(u.uBMin, this.bmin[0], this.bmin[1], this.bmin[2]);
    gl.uniform3f(u.uBMax, this.bmax[0], this.bmax[1], this.bmax[2]);
    gl.uniform2f(u.uLight, st.lightX, st.lightY);
    gl.uniform1f(u.uWob, st.wob);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
