// Stillwater: full-screen mesh gradient with a refractive breathing orb.
// Raw WebGL, one triangle, rendered at reduced resolution (the field is soft by nature).

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform vec2 uView;
uniform float uTime;
uniform float uScroll;
uniform vec3 uC0; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4;
uniform vec2 uP0; uniform vec2 uP1; uniform vec2 uP2; uniform vec2 uP3; uniform vec2 uP4;
uniform vec4 uOrbA;
uniform vec4 uOrbB;
uniform float uNight;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
float wgt(vec2 w, vec2 p){ vec2 d = w - p; return exp(-dot(d, d) * 3.4); }
vec3 field(vec2 p){
  float t = uTime;
  vec2 q = vec2(fbm(p * 1.15 + vec2(0.0, t * 0.045)), fbm(p * 1.15 + vec2(5.2, 1.3) - vec2(t * 0.035, 0.0)));
  vec2 r = vec2(fbm(p * 1.35 + 2.2 * q + vec2(1.7, 9.2) + t * 0.02), fbm(p * 1.35 + 2.2 * q + vec2(8.3, 2.8) - t * 0.025));
  vec2 w = p + 0.46 * (r - 0.5);
  float w0 = wgt(w, uP0), w1 = wgt(w, uP1), w2 = wgt(w, uP2), w3 = wgt(w, uP3), w4 = wgt(w, uP4);
  float s = w0 + w1 + w2 + w3 + w4 + 1e-4;
  vec3 c = (uC0 * w0 + uC1 * w1 + uC2 * w2 + uC3 * w3 + uC4 * w4) / s;
  c += (r.x - 0.5) * 0.07;
  return c;
}
vec3 glass(vec3 col, vec2 d, float r, float g){
  float z = sqrt(max(1.0 - r * r, 0.0));
  col = mix(col, vec3(1.0), 0.07 + 0.11 * g);
  col += vec3(1.0) * pow(1.0 - z, 3.0) * 0.30;
  vec2 h = d - vec2(-0.36, -0.44);
  col += vec3(1.0) * exp(-dot(h, h) * 12.0) * (0.22 + 0.10 * g);
  col *= 1.0 - 0.07 * smoothstep(-0.2, 0.9, d.y) * z;
  vec2 k = d - vec2(0.28, 0.58);
  col += vec3(1.0, 0.95, 0.9) * exp(-dot(k, k) * 18.0) * 0.12;
  return col;
}
vec3 halo(vec3 col, vec2 d, float r, float g){
  float e = r - 1.0;
  col += vec3(1.0, 0.97, 0.95) * (0.05 + 0.10 * g) * exp(-e * 5.0);
  col *= 1.0 - 0.06 * exp(-pow((e - 0.03) / 0.09, 2.0)) * smoothstep(-0.2, 1.0, d.y / max(r, 0.001));
  return col;
}
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) * (uView / uRes);
  vec2 sp = px;
  vec2 dA = px - uOrbA.xy; float rA = length(dA) / max(uOrbA.z, 1.0);
  vec2 dB = px - uOrbB.xy; float rB = length(dB) / max(uOrbB.z, 1.0);
  if (uOrbA.z > 1.0 && rA < 1.0) { float z = sqrt(1.0 - rA * rA); sp = uOrbA.xy + dA * (0.9 + 0.7 * (1.0 - z)); }
  if (uOrbB.z > 1.0 && rB < 1.0) { float z = sqrt(1.0 - rB * rB); sp = uOrbB.xy + dB * (0.9 + 0.7 * (1.0 - z)); }
  vec2 p = sp / uView.y;
  p.y += uScroll * 0.12;
  vec3 col = field(p);
  if (uOrbA.z > 1.0) { if (rA < 1.0) col = glass(col, dA / uOrbA.z, rA, uOrbA.w); else col = halo(col, dA / uOrbA.z, rA, uOrbA.w); }
  if (uOrbB.z > 1.0) { if (rB < 1.0) col = glass(col, dB / uOrbB.z, rB, uOrbB.w); else col = halo(col, dB / uOrbB.z, rB, uOrbB.w); }
  if (uNight > 0.01) {
    vec2 g = (px + vec2(0.0, uScroll * uView.y * 0.25)) / 30.0;
    vec2 id = floor(g); vec2 f = fract(g) - 0.5;
    float h = hash(id);
    if (h > 0.9) {
      vec2 o = vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5;
      float dd = length(f - o * 0.6);
      float tw = 0.5 + 0.5 * sin(uTime * (0.8 + h * 2.5) + h * 40.0);
      col += vec3(1.0, 0.97, 0.94) * smoothstep(0.11, 0.0, dd) * uNight * (0.35 + 0.65 * tw) * (h - 0.9) * 9.0;
    }
  }
  vec2 uv = gl_FragCoord.xy / uRes;
  col *= 1.0 - 0.06 * dot(uv - 0.5, uv - 0.5);
  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

export class Gradient {
  constructor(canvas, { scale = 0.5, lite = false } = {}) {
    this.canvas = canvas; this.scale = scale; this.lite = lite; this.ok = false;
    const opts = { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: false };
    const gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
    if (!gl) return;
    this.gl = gl;
    if (!this.build()) return;
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.ok = false; }, false);
    canvas.addEventListener('webglcontextrestored', () => { this.ok = this.build(); this.resize(); }, false);
    this.ok = true;
    this.resize();
  }
  build() {
    const gl = this.gl;
    const sh = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    const pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.bindAttribLocation(pr, 0, 'p'); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(pr)); return false; }
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.u = {};
    ['uRes', 'uView', 'uTime', 'uScroll', 'uC0', 'uC1', 'uC2', 'uC3', 'uC4', 'uP0', 'uP1', 'uP2', 'uP3', 'uP4', 'uOrbA', 'uOrbB', 'uNight']
      .forEach((n) => { this.u[n] = gl.getUniformLocation(pr, n); });
    return true;
  }
  resize() {
    if (!this.gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, this.lite ? 1.5 : 2);
    const w = Math.max(1, this.canvas.clientWidth || innerWidth);
    const h = Math.max(1, this.canvas.clientHeight || innerHeight);
    const W = Math.max(2, Math.round(w * dpr * this.scale)), H = Math.max(2, Math.round(h * dpr * this.scale));
    if (this.canvas.width !== W || this.canvas.height !== H) { this.canvas.width = W; this.canvas.height = H; }
    this.gl.viewport(0, 0, W, H);
    this.view = [w, h];
  }
  render(s) {
    if (!this.ok) return;
    const gl = this.gl, u = this.u;
    gl.uniform2f(u.uRes, this.canvas.width, this.canvas.height);
    gl.uniform2f(u.uView, this.view[0], this.view[1]);
    gl.uniform1f(u.uTime, s.time);
    gl.uniform1f(u.uScroll, s.scroll);
    for (let i = 0; i < 5; i++) {
      gl.uniform3f(u['uC' + i], s.colors[i][0], s.colors[i][1], s.colors[i][2]);
      gl.uniform2f(u['uP' + i], s.points[i][0], s.points[i][1]);
    }
    gl.uniform4f(u.uOrbA, s.orbA[0], s.orbA[1], s.orbA[2], s.orbA[3]);
    gl.uniform4f(u.uOrbB, s.orbB[0], s.orbB[1], s.orbB[2], s.orbB[3]);
    gl.uniform1f(u.uNight, s.night);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
