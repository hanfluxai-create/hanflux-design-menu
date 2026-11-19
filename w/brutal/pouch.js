// A pillow-pack snack pouch built in code: inflated front and back skins, crimped seals with serrated
// edges, toon shading with a hard glint, and an inverted-hull ink outline (the hard offset shadow is CSS).
import * as THREE from 'three';

const VS = `
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const FS = `
uniform sampler2D map; uniform vec3 uL;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 n = normalize(vN);
  vec3 v = normalize(vV);
  if (dot(n, v) < 0.0) n = -n;
  vec3 base = texture2D(map, vUv).rgb;
  float d = dot(n, uL);
  float tone = d > 0.38 ? 1.0 : (d > -0.1 ? 0.84 : 0.68);
  vec3 col = base * tone;
  vec3 h = normalize(uL + v);
  float s = pow(max(dot(n, h), 0.0), 42.0);
  col = mix(col, vec3(1.0), step(0.5, s) * 0.6);
  float rim = 1.0 - max(dot(n, v), 0.0);
  col *= 1.0 - smoothstep(0.62, 0.98, rim) * 0.2;
  gl_FragColor = vec4(col, 1.0);
}`;
const OVS = `
attribute vec3 aOut; uniform float uW;
void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position + aOut * uW, 1.0); }`;
const OFS = `void main(){ gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }`;

function buildGeometry(nu, nv) {
  const W = 1.5, H = 2.04, Dp = 0.3, sealTop = 0.914, sealBot = 0.066;
  const pos = [], uvs = [], out = [], idx = [];
  const prof = (v) => { const t = Math.min(1, Math.max(0, (v - sealBot) / (sealTop - sealBot))); return Math.pow(Math.sin(Math.PI * t), 0.62); };
  for (let side = 0; side < 2; side++) {
    const sgn = side === 0 ? 1 : -1;
    for (let j = 0; j <= nv; j++) {
      const v = j / nv;
      const pv = prof(v);
      for (let i = 0; i <= nu; i++) {
        const u = (i / nu) * 2 - 1;
        const pu = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.3)), 0.58);
        const z = sgn * Dp * pu * pv;
        const x = u * (W / 2) * (1 - 0.07 * pv * (1 - Math.abs(u) * 0.3));
        let y = (v - 0.5) * H;
        if (j === nv) y += (i % 2 ? 0.045 : 0);
        if (j === 0) y -= (i % 2 ? 0.045 : 0);
        pos.push(x, y, z);
        const tu = (u + 1) / 2;
        uvs.push(side === 0 ? tu * 0.5 : 0.5 + (1 - tu) * 0.5, v);
        // outline push: surface normal is added later; here the in-plane push at the borders
        out.push(i === 0 ? -1 : i === nu ? 1 : 0, j === 0 ? -1 : j === nv ? 1 : 0, 0);
      }
    }
  }
  const row = nu + 1, half = row * (nv + 1);
  for (let side = 0; side < 2; side++) {
    const o = side * half;
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const a = o + j * row + i, b = a + 1, d = a + row, c = d + 1;
      if (side === 0) idx.push(a, b, d, b, c, d); else idx.push(a, d, b, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const n = g.getAttribute('normal');
  for (let k = 0; k < out.length / 3; k++) {
    const ox = out[k * 3] * 1.4, oy = out[k * 3 + 1] * 1.4;
    let ax = n.getX(k) + ox, ay = n.getY(k) + oy, az = n.getZ(k);
    const l = Math.hypot(ax, ay, az) || 1;
    out[k * 3] = ax / l; out[k * 3 + 1] = ay / l; out[k * 3 + 2] = az / l;
  }
  g.setAttribute('aOut', new THREE.Float32BufferAttribute(out, 3));
  return g;
}

export function createPouch(canvas, atlases, { lite = false, onSwap = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, alpha: true, powerPreference: 'high-performance', premultipliedAlpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  camera.position.set(0, 0.12, 6.4);
  camera.lookAt(0, 0, 0);

  const textures = atlases.map((c) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.NoColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
    return t;
  });
  const geo = buildGeometry(lite ? 28 : 46, lite ? 36 : 62);
  const mat = new THREE.ShaderMaterial({ uniforms: { map: { value: textures[0] }, uL: { value: new THREE.Vector3(-0.5, 0.72, 0.62).normalize() } }, vertexShader: VS, fragmentShader: FS });
  const omat = new THREE.ShaderMaterial({ uniforms: { uW: { value: 0.034 } }, vertexShader: OVS, fragmentShader: OFS, side: THREE.BackSide });
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geo, omat));
  group.add(new THREE.Mesh(geo, mat));
  scene.add(group);

  const st = { rot: 0.5, vel: 0.85, auto: 0.85, drag: false, lastX: 0, lastT: 0, cur: 0, pending: -1, autoAdvance: true, t: 0 };
  const TAU = Math.PI * 2;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the pouch the same size relative to the panel height, and fit narrow panels
    camera.position.z = 6.4 * Math.max(1, 0.86 / camera.aspect);
    camera.updateProjectionMatrix();
  }
  function setFlavour(i) { st.cur = i; mat.uniforms.map.value = textures[i]; onSwap(i); }
  function request(i) { if (i === st.cur && st.pending < 0) return; st.pending = i; st.autoAdvance = false; st.vel = Math.max(st.vel, 4.2); }

  function frame(dt) {
    st.t += dt;
    const before = st.rot;
    if (!st.drag) {
      const target = st.pending >= 0 ? 4.2 : st.auto;
      st.vel += (target - st.vel) * Math.min(1, dt * (st.pending >= 0 ? 6 : 1.4));
      st.rot += st.vel * dt;
    }
    // swap the label while the pack is edge-on (back leaving, front arriving)
    const a0 = ((before % TAU) + TAU) % TAU, a1 = ((st.rot % TAU) + TAU) % TAU;
    const crossed = (a0 < 1.5 * Math.PI && a1 >= 1.5 * Math.PI) || (st.rot - before > Math.PI);
    if (crossed && st.rot > before) {
      if (st.pending >= 0) { setFlavour(st.pending); st.pending = -1; }
      else if (st.autoAdvance) setFlavour((st.cur + 1) % textures.length);
    }
    group.rotation.set(0.09 + Math.sin(st.t * 0.8) * 0.05, st.rot, Math.sin(st.t * 0.6) * 0.07);
    group.position.y = Math.sin(st.t * 1.3) * 0.07;
    renderer.render(scene, camera);
  }

  // drag to spin
  canvas.addEventListener('pointerdown', (e) => { st.drag = true; st.lastX = e.clientX; st.lastT = performance.now(); st.autoAdvance = false; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!st.drag) return;
    const now = performance.now(), dx = e.clientX - st.lastX, dtt = Math.max(1, now - st.lastT);
    st.rot += dx * 0.012; st.vel = (dx * 0.012) / (dtt / 1000);
    st.lastX = e.clientX; st.lastT = now;
  });
  const end = () => { st.drag = false; st.vel = Math.max(-8, Math.min(8, st.vel)); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

  resize();
  return { frame, resize, request, get current() { return st.cur; }, renderer };
}
