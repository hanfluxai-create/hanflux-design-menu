// Prism: a stainless-steel card with a thin-film holographic finish, built and shaded in code.
import * as THREE from 'three';

const W = 8.56, H = 5.4, R = 0.318, T = 0.07, BEV = 0.006;
const ZF = T / 2 + BEV + 0.0025;
const TEX_W = 1024, TEX_H = 646;

function roundedShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/* ---------- canvas art (R = emboss height, G = ink, B = pattern / stripe) ---------- */
function spaced(g, text, x, y, track) {
  for (const ch of text) { g.fillText(ch, x, y); x += g.measureText(ch).width + track; }
  return x;
}
function drawFront(c, fam) {
  const g = c.getContext('2d');
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#000'; g.fillRect(0, 0, TEX_W, TEX_H);
  g.globalCompositeOperation = 'lighter';
  // B: fine guilloche waves etched into the film
  g.strokeStyle = 'rgba(0,0,255,0.5)'; g.lineWidth = 1;
  for (let k = 0; k < 26; k++) {
    g.beginPath();
    for (let x = 0; x <= TEX_W; x += 8) {
      const y = 70 + k * 22 + Math.sin(x * 0.012 + k * 0.45) * 16 + Math.sin(x * 0.031 - k) * 5;
      x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
  }
  g.textBaseline = 'alphabetic';
  // G = ink, R = a soft bevel under the ink
  const both = (fn) => { g.filter = 'blur(2px)'; g.fillStyle = g.strokeStyle = 'rgb(200,0,0)'; fn(); g.filter = 'none'; g.fillStyle = g.strokeStyle = 'rgb(0,255,0)'; fn(); };
  both(() => { g.font = `700 64px ${fam}`; spaced(g, 'PRISM', 74, 126, 22); });
  both(() => { g.font = `600 22px ${fam}`; spaced(g, 'STEEL', 846, 116, 7); });
  both(() => { g.lineWidth = 6; g.lineCap = 'round'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(296, 290, 13 + i * 14, -0.75, 0.75); g.stroke(); } });
  both(() => { g.font = `500 46px ${fam}`; spaced(g, '\u2022\u2022\u2022\u2022  0742', 74, 488, 7); });
  both(() => { g.font = `600 28px ${fam}`; spaced(g, 'AANYA KAPOOR', 76, 566, 6); });
  both(() => { g.font = `500 15px ${fam}`; spaced(g, 'MEMBER SINCE', 646, 538, 4); g.font = `600 26px ${fam}`; spaced(g, '2026', 646, 570, 4); });
  both(() => { g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); g.moveTo(914, 490); g.lineTo(956, 566); g.lineTo(872, 566); g.closePath(); g.stroke(); });
  g.filter = 'none';
  g.globalCompositeOperation = 'source-over';
}
function drawBack(c, fam) {
  const g = c.getContext('2d');
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#000'; g.fillRect(0, 0, TEX_W, TEX_H);
  g.globalCompositeOperation = 'lighter';
  // B: magnetic stripe band
  g.fillStyle = 'rgb(0,0,255)'; g.fillRect(0, 54, TEX_W, 96);
  // G: holo ink headline
  g.fillStyle = 'rgb(0,255,0)';
  g.font = `700 150px ${fam}`;
  spaced(g, '3% back', 70, 368, -4);
  g.font = `600 64px ${fam}`;
  spaced(g, 'on everything.', 76, 452, -1);
  // R: etched small print
  g.fillStyle = 'rgb(255,0,0)';
  g.font = `700 30px ${fam}`;
  spaced(g, 'PRISM', 76, 572, 10);
  g.font = `500 20px ${fam}`;
  spaced(g, 'AANYA KAPOOR', 76, 222, 5);
  spaced(g, 'prismcard.co', 800, 572, 2);
  g.filter = 'none';
  g.globalCompositeOperation = 'source-over';
}
function drawChip() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 200;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 256, 200);
  g.strokeStyle = '#fff'; g.lineWidth = 5; g.lineJoin = 'round';
  const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); g.stroke(); };
  rr(14, 14, 228, 172, 26);
  rr(92, 58, 72, 84, 14);
  g.beginPath();
  g.moveTo(14, 70); g.lineTo(92, 70); g.moveTo(14, 130); g.lineTo(92, 130);
  g.moveTo(164, 70); g.lineTo(242, 70); g.moveTo(164, 130); g.lineTo(242, 130);
  g.moveTo(128, 14); g.lineTo(128, 58); g.moveTo(128, 142); g.lineTo(128, 186);
  g.stroke();
  return c;
}

/* ---------- shaders ---------- */
const COMMON = /* glsl */`
vec3 pal(float t){
  t = fract(t) * 4.0;
  vec3 a = vec3(0.478, 0.941, 1.0), b = vec3(0.694, 0.549, 1.0), c = vec3(1.0, 0.541, 0.847), d = vec3(1.0, 0.886, 0.541);
  vec3 col = mix(a, b, smoothstep(0.0, 1.0, t));
  col = mix(col, c, smoothstep(1.0, 2.0, t));
  col = mix(col, d, smoothstep(2.0, 3.0, t));
  return mix(col, a, smoothstep(3.0, 4.0, t));
}
float box(vec2 p, vec2 c, vec2 s, float soft){ vec2 d = abs(p - c) - s; return 1.0 - smoothstep(0.0, soft, max(d.x, d.y)); }
uniform float uKeyX;
vec3 env(vec3 r){
  vec2 a = vec2(atan(r.x, r.z), asin(clamp(r.y, -1.0, 1.0)));
  vec3 col = mix(vec3(0.012, 0.014, 0.02), vec3(0.075, 0.085, 0.11), smoothstep(-0.7, 0.9, r.y));
  col += vec3(1.0, 0.97, 0.94) * 2.6 * box(a, vec2(-0.62 + uKeyX, 0.42), vec2(0.3, 0.17), 0.12);
  col += vec3(0.8, 0.88, 1.0) * 1.5 * box(a, vec2(0.86 + uKeyX * 0.5, 0.1), vec2(0.09, 0.5), 0.08);
  col += vec3(1.0, 0.92, 0.98) * 0.55 * box(a, vec2(0.1, -0.62), vec2(0.7, 0.07), 0.15);
  col += vec3(0.6, 0.7, 1.0) * 0.25 * box(a, vec2(2.6, 0.2), vec2(0.5, 0.4), 0.4);
  col += vec3(0.86, 0.9, 1.0) * 1.15 * smoothstep(0.5, 0.95, r.y);
  return col;
}
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
`;

const FILM_VERT = /* glsl */`
varying vec2 vUv; varying vec3 vWPos; varying vec3 vN; varying vec3 vTx; varying vec3 vTy;
uniform float uFlip;
void main(){
  vUv = vec2(position.x / ${W.toFixed(2)} + 0.5, position.y / ${H.toFixed(2)} + 0.5);
  if (uFlip > 0.5) vUv.x = 1.0 - vUv.x;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWPos = wp.xyz;
  mat3 m = mat3(modelMatrix);
  vN = normalize(m * vec3(0.0, 0.0, 1.0));
  vTx = normalize(m * vec3(uFlip > 0.5 ? -1.0 : 1.0, 0.0, 0.0));
  vTy = normalize(m * vec3(0.0, 1.0, 0.0));
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FILM_FRAG = /* glsl */`
precision highp float;
uniform sampler2D uTex; uniform float uTime, uSweep, uBack;
varying vec2 vUv; varying vec3 vWPos; varying vec3 vN; varying vec3 vTx; varying vec3 vTy;
${COMMON}
void main(){
  vec4 tx = texture2D(uTex, vUv);
  vec2 px = vec2(1.6 / ${TEX_W}.0, 1.6 / ${TEX_H}.0);
  float hx = texture2D(uTex, vUv + vec2(px.x, 0.0)).r - texture2D(uTex, vUv - vec2(px.x, 0.0)).r;
  float hy = texture2D(uTex, vUv + vec2(0.0, px.y)).r - texture2D(uTex, vUv - vec2(0.0, px.y)).r;
  vec3 n = normalize(vN - (vTx * hx + vTy * hy) * (uBack > 0.5 ? 0.0 : 0.6));
  if (!gl_FrontFacing) n = -vN;
  vec3 V = normalize(cameraPosition - vWPos);
  vec3 Rf = reflect(-V, n);
  float ndv = clamp(dot(n, V), 0.0, 1.0);
  vec3 e = env(Rf);
  float lum = dot(e, vec3(0.3, 0.5, 0.2));
  float nz = vnoise(vUv * vec2(4.5, 3.0) + uTime * 0.04) * 0.6 + vnoise(vUv * vec2(11.0, 7.0) - uTime * 0.03) * 0.25;
  float hue = ndv * 1.8 + n.x * 1.25 + n.y * 0.7 + vUv.x * 0.85 + vUv.y * 0.35 + nz * 0.6 + tx.b * 0.06
            + sin((vUv.x * 2.2 - vUv.y * 1.3 + n.x * 0.8) * 6.2831) * 0.12;
  vec2 luv = vec2(0.5 + n.x * 1.6 + uKeyX, 0.5 + n.y * 1.4);
  float hl = exp(-dot((vUv - luv) * vec2(1.6, 1.0), (vUv - luv) * vec2(1.6, 1.0)) * 3.2);
  vec3 holo = pal(hue);
  float fres = pow(1.0 - ndv, 2.5);
  float sweep = exp(-pow((vUv.x * 0.85 + (1.0 - vUv.y) * 0.5 - uSweep) / 0.075, 2.0));
  vec3 col;
  float bevel = length(vec2(hx, hy));
  if (!gl_FrontFacing) {
    col = vec3(0.03, 0.033, 0.045) + e * 0.07 + holo * 0.05;
  } else if (uBack < 0.5) {
    float sp = smoothstep(0.0, 1.6, lum);
    vec3 film = holo * (0.6 + 0.42 * sp) * (0.9 + 0.1 * sin(vUv.x * 9.0 - vUv.y * 5.0 + nz * 3.0));
    film = mix(film, film * 1.18 + 0.05, fres * 0.6);
    film *= (0.74 + 0.42 * hl) * (0.9 + tx.b * 0.16);
    film += vec3(1.0) * pow(hl, 4.0) * 0.16;
    film += e * 0.05;
    vec3 ink = vec3(0.05, 0.055, 0.072) + e * 0.035 + holo * 0.035;
    col = mix(film, ink, smoothstep(0.3, 0.8, tx.g) * 0.94);
    col += e * bevel * 0.5;
    col += (vec3(0.5) + holo * 0.6) * sweep * 0.8;
  } else {
    vec3 steel = vec3(0.05, 0.055, 0.07) + e * 0.22 + holo * fres * 0.25;
    float brush = hash(vec2(floor(vUv.y * 420.0), 3.0)) * 0.08;
    steel *= 0.92 + brush;
    col = mix(steel, vec3(0.015, 0.016, 0.02) + e * 0.05, tx.b * 0.92);
    vec3 hink = holo * (0.88 + 0.3 * smoothstep(0.0, 1.5, lum)) * (0.85 + 0.3 * hl);
    col = mix(col, hink, smoothstep(0.2, 0.7, tx.g));
    vec3 silver = vec3(0.62, 0.65, 0.7) + e * 0.25;
    col = mix(col, silver, smoothstep(0.35, 0.8, tx.r) * 0.9);
    col += (vec3(0.35) + holo * 0.5) * sweep * 0.55;
  }
  // glitter
  vec2 gp = vUv * vec2(330.0, 208.0);
  vec2 id = floor(gp), fp = fract(gp) - 0.5;
  float r1 = hash(id), r2 = hash(id + 17.3), r3 = hash(id + 41.7);
  vec3 gn = normalize(n + (vTx * (r2 - 0.5) + vTy * (r3 - 0.5)) * 0.9);
  float sp = pow(max(dot(reflect(-V, gn), normalize(vec3(-0.5 + uKeyX * 0.4, 0.45, 0.75))), 0.0), 70.0);
  float dotm = smoothstep(0.42, 0.0, length(fp));
  col += (vec3(1.0) + holo) * sp * dotm * step(0.78, r1) * (uBack < 0.5 ? 1.5 : 0.22) * (0.6 + 0.4 * sin(uTime * 3.0 + r1 * 30.0));
  gl_FragColor = vec4(col, 1.0);
}`;

const STEEL_VERT = /* glsl */`
varying vec3 vWPos; varying vec3 vN; varying vec3 vL;
void main(){
  vL = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWPos = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const STEEL_FRAG = /* glsl */`
precision highp float;
uniform vec3 uTint; uniform float uTime;
uniform sampler2D uPat; uniform float uUsePat;
varying vec3 vWPos; varying vec3 vN; varying vec3 vL;
${COMMON}
void main(){
  vec3 n = normalize(vN);
  vec3 V = normalize(cameraPosition - vWPos);
  vec3 e = env(reflect(-V, n));
  float brush = 0.9 + hash(vec2(floor(vL.y * 260.0 + vL.z * 40.0), 7.0)) * 0.16;
  vec3 col = (vec3(0.05) + e * 0.85) * uTint * brush;
  if (uUsePat > 0.5) {
    col = (vec3(0.32, 0.27, 0.18) + e * 0.7) * uTint;
    vec2 uv = vec2(vL.x / 1.15 + 0.5, vL.y / 0.9 + 0.5);
    float l = texture2D(uPat, uv).r;
    col *= 1.0 - l * 0.65;
    col += uTint * 0.08;
  }
  gl_FragColor = vec4(col, 1.0);
}`;

const BG_VERT = /* glsl */`varying vec2 vUv; void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const BG_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform vec2 uCard; uniform float uAng, uBeam, uAspect, uTime, uGlow;
${COMMON}
void main(){
  vec2 uv = vUv;
  vec2 p = (uv - uCard) * vec2(uAspect, 1.0);
  vec2 q = (uv - 0.5) * vec2(uAspect, 1.0);
  vec3 col = mix(vec3(0.07, 0.08, 0.108), vec3(0.043, 0.051, 0.071), smoothstep(0.05, 0.75, length(p * vec2(0.8, 1.0))));
  col = mix(col, vec3(0.043, 0.051, 0.071), smoothstep(0.55, 1.0, length(q) / max(1.0, uAspect * 0.62)));
  float glow = exp(-dot(p, p) * 3.2) * uGlow;
  col += mix(vec3(0.38, 0.3, 0.62), vec3(0.2, 0.42, 0.55), uv.y) * glow * 0.3;
  vec2 dir = vec2(cos(uAng), sin(uAng));
  float along = dot(p, dir), across = dot(p, vec2(-dir.y, dir.x));
  float spread = 0.035 + max(along, 0.0) * 0.26;
  float t = across / spread;
  float beam = exp(-t * t * 1.6) * smoothstep(0.05, 0.35, along) * exp(-max(along, 0.0) * 1.05);
  beam *= 0.85 + 0.15 * sin(uTime * 0.7 + along * 6.0);
  col += pal(t * 0.3 + 0.55 + uTime * 0.02) * beam * uBeam * 1.25;
  float g = hash(uv * 900.0 + fract(uTime) * 13.0);
  col += (g - 0.5) * 0.018;
  gl_FragColor = vec4(col, 1.0);
}`;

/* ---------- scene ---------- */
export function createCard(canvas, opts) {
  const { lite, getState, onFirstFrame } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));
  renderer.setClearColor(0x0b0d12, 1);
  renderer.autoClear = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 200);
  camera.position.set(0, 0, 24);

  const fam = '"Space Grotesk", "Helvetica Neue", Arial, sans-serif';
  const frontC = document.createElement('canvas'); frontC.width = TEX_W; frontC.height = TEX_H;
  const backC = document.createElement('canvas'); backC.width = TEX_W; backC.height = TEX_H;
  drawFront(frontC, fam); drawBack(backC, fam);
  const frontT = new THREE.CanvasTexture(frontC), backT = new THREE.CanvasTexture(backC);
  [frontT, backT].forEach(t => { t.anisotropy = 4; t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; });
  const chipT = new THREE.CanvasTexture(drawChip());
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load(`700 60px "Space Grotesk"`), document.fonts.load(`500 40px "Space Grotesk"`), document.fonts.load(`600 40px "Space Grotesk"`)]).then(() => {
      drawFront(frontC, fam); drawBack(backC, fam); frontT.needsUpdate = true; backT.needsUpdate = true;
    }).catch(() => {});
  }

  const shared = { uTime: { value: 0 }, uSweep: { value: -1 }, uKeyX: { value: 0 } };
  const shape = roundedShape(W, H, R);
  const faceGeo = new THREE.ShapeGeometry(shape, 14);
  const mkFilm = (tex, back) => new THREE.ShaderMaterial({
    vertexShader: FILM_VERT, fragmentShader: FILM_FRAG, side: THREE.DoubleSide,
    uniforms: { uTex: { value: tex }, uTime: shared.uTime, uSweep: shared.uSweep, uKeyX: shared.uKeyX, uBack: { value: back ? 1 : 0 }, uFlip: { value: 0 } }
  });
  const mkSteel = (tint, pat) => new THREE.ShaderMaterial({
    vertexShader: STEEL_VERT, fragmentShader: STEEL_FRAG,
    uniforms: { uTint: { value: new THREE.Color(tint) }, uTime: shared.uTime, uKeyX: shared.uKeyX, uPat: { value: pat || chipT }, uUsePat: { value: pat ? 1 : 0 } }
  });

  const card = new THREE.Group();
  scene.add(card);

  const film = new THREE.Mesh(faceGeo, mkFilm(frontT, false));
  film.position.z = ZF;
  const coreGeo = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 2, curveSegments: 14 });
  coreGeo.translate(0, 0, -T / 2);
  const core = new THREE.Mesh(coreGeo, mkSteel('#c9cfdb'));
  const back = new THREE.Mesh(faceGeo, mkFilm(backT, true));
  back.rotation.y = Math.PI;
  back.position.z = -ZF;

  const chipLayer = new THREE.Group();
  const chipGeo = new THREE.ShapeGeometry(roundedShape(1.15, 0.9, 0.13), 8);
  const chip = new THREE.Mesh(chipGeo, mkSteel('#d9b878', chipT));
  chip.position.set(-2.72, 0.32, ZF + 0.004);
  chipLayer.add(chip);
  // NFC antenna: a rounded loop, only visible when the card comes apart
  const loopPts = roundedShape(W - 0.9, H - 0.9, 0.3).getPoints(24).map(p => new THREE.Vector3(p.x, p.y, ZF + 0.002));
  const coilPts = [];
  for (let k = 0; k < 3; k++) roundedShape(1.6 + k * 0.22, 1.3 + k * 0.22, 0.2).getPoints(8).forEach(p => coilPts.push(new THREE.Vector3(p.x - 2.72, p.y + 0.32, ZF + 0.002)));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x9ff4ff, transparent: true, opacity: 0, depthWrite: false });
  const loop = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(loopPts), lineMat);
  const coil = new THREE.Line(new THREE.BufferGeometry().setFromPoints(coilPts), lineMat);
  chipLayer.add(loop, coil);

  card.add(core, film, back, chipLayer);

  // background light leak
  const bgMat = new THREE.ShaderMaterial({
    vertexShader: BG_VERT, fragmentShader: BG_FRAG, depthWrite: false, depthTest: false,
    uniforms: { uCard: { value: new THREE.Vector2(0.7, 0.5) }, uAng: { value: -2.6 }, uBeam: { value: 0.32 }, uAspect: { value: 1 }, uTime: shared.uTime, uGlow: { value: 1 }, uKeyX: shared.uKeyX }
  });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
  bg.frustumCulled = false; bg.renderOrder = -10;
  scene.add(bg);

  // label anchors (local, per layer) and projection helpers
  const anchors = [
    { obj: film, p: new THREE.Vector3(W / 2 - 0.2, H / 2 - 1.0, 0) },
    { obj: chipLayer, p: new THREE.Vector3(W / 2 - 0.45, 0.4, ZF) },
    { obj: core, p: new THREE.Vector3(W / 2, -0.3, T / 2) },
    { obj: back, p: new THREE.Vector3(-(W / 2 - 0.2), -(H / 2 - 1.0), 0) }
  ];
  const tmp = new THREE.Vector3();
  function project(i) {
    const a = anchors[i];
    tmp.copy(a.p);
    a.obj.localToWorld(tmp);
    tmp.project(camera);
    return { x: (tmp.x * 0.5 + 0.5) * size.w, y: (-tmp.y * 0.5 + 0.5) * size.h };
  }

  const size = { w: 1, h: 1 };
  function resize() {
    size.w = canvas.clientWidth || window.innerWidth; size.h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(size.w, size.h, false);
    camera.aspect = size.w / size.h;
    camera.updateProjectionMatrix();
    bgMat.uniforms.uAspect.value = size.w / size.h;
  }
  resize();
  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });

  const cur = Object.assign({}, getState(0));
  let last = performance.now(), time = 0, first = true, running = true, rafId = 0;
  const v3 = new THREE.Vector3();
  function frame(now) {
    if (!running) { rafId = 0; return; }
    const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
    last = now; time += dt;
    const tg = getState(time);
    const k = first ? 1 : 1 - Math.exp(-dt * 4.2);
    for (const key in tg) cur[key] += (tg[key] - cur[key]) * k;

    shared.uTime.value = time;
    const cyc = (time % 5.2) / 1.7;
    shared.uSweep.value = cyc < 1 ? -0.35 + cyc * 2.1 : 3;
    shared.uKeyX.value = Math.sin(time * 0.35) * 0.12;

    card.position.set(cur.x, cur.y + Math.sin(time * 0.9) * 0.06 * (1 - cur.ex), 0);
    card.scale.setScalar(cur.s);
    card.rotation.set(cur.rx, cur.ry, cur.rz, 'XYZ');
    const ex = cur.ex;
    const sp = cur.sp || 1;
    film.position.z = ZF + ex * 1.9 * sp;
    chipLayer.position.z = ex * 0.95 * sp;
    back.position.z = -ZF - ex * 1.75 * sp;
    lineMat.opacity = Math.min(1, ex * 1.6) * 0.9;

    card.updateMatrixWorld();
    v3.set(0, 0, 0); card.localToWorld(v3); v3.project(camera);
    bgMat.uniforms.uCard.value.set(v3.x * 0.5 + 0.5, v3.y * 0.5 + 0.5);
    bgMat.uniforms.uAng.value = -2.45 + cur.ry * 0.35 + cur.rz * 0.6;
    bgMat.uniforms.uBeam.value = cur.beam;
    bgMat.uniforms.uGlow.value = 0.8 + ex * 0.4;

    renderer.render(scene, camera);
    opts.onFrame && opts.onFrame(cur, project);
    if (first) { first = false; onFirstFrame && onFirstFrame(); }
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return {
    setRunning(on) {
      if (on === running) return;
      running = on;
      if (on) { last = performance.now(); rafId = requestAnimationFrame(frame); }
    }
  };
}
