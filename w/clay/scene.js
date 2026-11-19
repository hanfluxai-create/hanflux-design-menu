// Doodle Labs: the clay world. One renderer: hero stage + one-off clay icon renders for the cards.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const HX = window.HX || { lite: false, device: 'desktop', embed: false, ready() {}, on() {} };
const isPhone = () => innerWidth < 760;
const LITE = !!HX.lite || HX.device === 'mobile' || innerWidth < 760;

const PAL = {
  white: 0xfff8ee, tomato: 0xff6b4a, sun: 0xffc94a, sky: 0x6ec6ff, grass: 0x6fd38a,
  ink: 0x2b2340, lilac: 0xb9a8ff, peach: 0xffb48c, pink: 0xff9fb1, deepSky: 0x4aa8ea
};

let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

/* ---------- clay surface: fingerprints, dents and grain baked into a normal map ---------- */
function clayNormalMap(S) {
  const P = 32;
  const grid = new Float32Array(P * P);
  for (let i = 0; i < grid.length; i++) grid[i] = rnd();
  const vnoise = (x, y, p) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const g = (i, j) => grid[(((j % p) + p) % p) * P + (((i % p) + p) % p)];
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return (g(xi, yi) * (1 - u) + g(xi + 1, yi) * u) * (1 - v) + (g(xi, yi + 1) * (1 - u) + g(xi + 1, yi + 1) * u) * v;
  };
  const prints = [];
  for (let i = 0; i < 5; i++) prints.push({ x: rnd() * S, y: rnd() * S, r: S * (0.16 + rnd() * 0.12), f: (2 * Math.PI) / (S * 0.011), sx: 0.7 + rnd() * 0.5, a: rnd() * Math.PI });
  const dents = [];
  for (let i = 0; i < 14; i++) dents.push({ x: rnd() * S, y: rnd() * S, r: S * (0.02 + rnd() * 0.05), d: 0.4 + rnd() * 0.6 });
  const h = new Float32Array(S * S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S;
      let n = vnoise(u * 4, v * 4, 4) * 0.55 + vnoise(u * 8, v * 8, 8) * 0.3 + vnoise(u * 32, v * 32, 32) * 0.18;
      let fp = 0;
      for (const p of prints) {
        let dx = x - p.x, dy = y - p.y;
        dx -= S * Math.round(dx / S); dy -= S * Math.round(dy / S);
        const ca = Math.cos(p.a), sa = Math.sin(p.a);
        const rx = (dx * ca - dy * sa) * p.sx, ry = dx * sa + dy * ca;
        const d = Math.hypot(rx, ry);
        if (d < p.r) {
          const w = 1 - smooth(d / p.r);
          fp += (0.5 + 0.5 * Math.sin(d * p.f + n * 5.0)) * w;
        }
      }
      let dent = 0;
      for (const q of dents) {
        let dx = x - q.x, dy = y - q.y;
        dx -= S * Math.round(dx / S); dy -= S * Math.round(dy / S);
        const d2 = (dx * dx + dy * dy) / (q.r * q.r);
        if (d2 < 4) dent -= Math.exp(-d2 * 1.6) * q.d;
      }
      h[y * S + x] = n * 0.9 + fp * 0.35 + dent * 0.5;
    }
  }
  const data = new Uint8Array(S * S * 4);
  const k = 2.4;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const l = h[y * S + ((x - 1 + S) % S)], r = h[y * S + ((x + 1) % S)];
      const t = h[((y - 1 + S) % S) * S + x], b = h[((y + 1) % S) * S + x];
      let nx = (l - r) * k, ny = (b - t) * k, nz = 1;
      const len = Math.hypot(nx, ny, nz);
      const i = (y * S + x) * 4;
      data[i] = (nx / len * 0.5 + 0.5) * 255;
      data[i + 1] = (ny / len * 0.5 + 0.5) * 255;
      data[i + 2] = (nz / len * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/* ---------- geometry helpers: hand-made lumps + smooth normals by position ---------- */
function lump(geo, amp = 0.012, f = 2.6) {
  const pos = geo.attributes.position, nor = geo.attributes.normal;
  const o = rnd() * 10;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const n = Math.sin(x * f + o + 1.7 * Math.sin(y * f * 0.8)) * Math.sin(y * f * 1.1 + 1.3 * Math.sin(z * f * 0.9 + o)) * Math.sin(z * f * 0.7 + x * 0.6);
    pos.setXYZ(i, x + nor.getX(i) * n * amp, y + nor.getY(i) * n * amp, z + nor.getZ(i) * n * amp);
  }
  pos.needsUpdate = true;
  return smoothNormals(geo);
}
function smoothNormals(geo) {
  const pos = geo.attributes.position, idx = geo.index, n = pos.count;
  const map = new Map(), kIdx = new Int32Array(n);
  let k = 0;
  for (let i = 0; i < n; i++) {
    const key = Math.round(pos.getX(i) * 2e3) + ',' + Math.round(pos.getY(i) * 2e3) + ',' + Math.round(pos.getZ(i) * 2e3);
    let id = map.get(key);
    if (id === undefined) { id = k++; map.set(key, id); }
    kIdx[i] = id;
  }
  const acc = new Float32Array(k * 3);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), ab = new THREE.Vector3(), cb = new THREE.Vector3();
  const tris = idx ? idx.count / 3 : n / 3;
  for (let t = 0; t < tris; t++) {
    const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
    a.fromBufferAttribute(pos, i0); b.fromBufferAttribute(pos, i1); c.fromBufferAttribute(pos, i2);
    cb.subVectors(c, b); ab.subVectors(a, b); cb.cross(ab);
    for (const i of [i0, i1, i2]) { const j = kIdx[i] * 3; acc[j] += cb.x; acc[j + 1] += cb.y; acc[j + 2] += cb.z; }
  }
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const j = kIdx[i] * 3, x = acc[j], y = acc[j + 1], z = acc[j + 2], l = Math.hypot(x, y, z) || 1;
    out[i * 3] = x / l; out[i * 3 + 1] = y / l; out[i * 3 + 2] = z / l;
  }
  geo.setAttribute('normal', new THREE.BufferAttribute(out, 3));
  return geo;
}
const GEO = {
  box: (w, h, d, r = 0.2) => lump(new RoundedBoxGeometry(w, h, d, LITE ? 4 : 6, r), 0.014, 2.2),
  cap: (r, len) => lump(new THREE.CapsuleGeometry(r, len, 10, 28), 0.008, 3.2),
  ball: (r) => lump(new THREE.SphereGeometry(r, 36, 24), Math.min(0.012, r * 0.05), 3.2),
  torus: (R, r) => lump(new THREE.TorusGeometry(R, r, 24, 64), 0.012, 3),
  blob(r) {
    const g = new THREE.SphereGeometry(r, 48, 32);
    const p = g.attributes.position, o = rnd() * 6;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) / r, y = p.getY(i) / r, z = p.getZ(i) / r;
      const n = 1 + 0.13 * Math.sin(x * 2.1 + o) * Math.sin(y * 2.4 + o * 0.5) + 0.09 * Math.sin(z * 3.1 + y * 1.3 + o) + 0.04 * Math.sin(x * 5.3 + z * 4.1);
      p.setXYZ(i, x * r * n, y * r * n * 0.92, z * r * n);
    }
    return smoothNormals(g);
  },
  extrude(shape, depth, bevel) {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.9, bevelSegments: LITE ? 5 : 7, curveSegments: 6, steps: 1 });
    g.center();
    return smoothNormals(g);
  },
  star(R = 0.6) {
    const s = new THREE.Shape(), N = 160, r = R * 0.52;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2 + Math.PI / 2;
      const k = Math.pow(0.5 + 0.5 * Math.cos(5 * (a - Math.PI / 2)), 1.5);
      const rr = r + (R - r) * k;
      i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    return GEO.extrude(s, R * 0.16, R * 0.2);
  },
  gear(R = 0.55) {
    const s = new THREE.Shape(), N = 240, teeth = 8;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const t = clamp(Math.sin(a * teeth) * 2.6, -1, 1) * 0.5 + 0.5;
      const rr = R * 0.78 + R * 0.22 * t;
      i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    const hole = new THREE.Path();
    hole.absarc(0, 0, R * 0.3, 0, Math.PI * 2, true);
    s.holes.push(hole);
    return GEO.extrude(s, R * 0.22, R * 0.1);
  },
  heart(R = 0.5) {
    const s = new THREE.Shape(), N = 160;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3), y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      i ? s.lineTo(x * R / 16, y * R / 16) : s.moveTo(x * R / 16, y * R / 16);
    }
    return GEO.extrude(s, R * 0.25, R * 0.22);
  },
  tri(R = 0.5) {
    const s = new THREE.Shape(), N = 120;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2 + Math.PI / 2;
      const k = Math.pow(0.5 + 0.5 * Math.cos(3 * (a - Math.PI / 2)), 1.2);
      const rr = R * (0.55 + 0.45 * k);
      i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    return GEO.extrude(s, R * 0.2, R * 0.2);
  },
  lathe(points, seg = 48) {
    return smoothNormals(new THREE.LatheGeometry(points.map((p) => new THREE.Vector2(p[0], p[1])), seg));
  }
};

/* ---------- materials ---------- */
let NORMAL;
const matCache = new Map();
function clay(hex, opts = {}) {
  const key = hex + JSON.stringify(opts);
  if (matCache.has(key)) return matCache.get(key);
  const col = new THREE.Color(hex);
  const m = new THREE.MeshPhysicalMaterial({
    color: col, roughness: opts.rough ?? 0.6, metalness: 0,
    sheen: 0.55, sheenRoughness: 0.55, sheenColor: col.clone().lerp(new THREE.Color(0xffffff), 0.55),
    normalMap: NORMAL, normalScale: new THREE.Vector2(opts.ns ?? 0.32, opts.ns ?? 0.32)
  });
  matCache.set(key, m);
  return m;
}
const glow = (hex) => new THREE.MeshBasicMaterial({ color: hex, toneMapped: false });

function mesh(geo, mat, cast = true) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = false;
  return m;
}

/* ---------- Pip, the robot ---------- */
function makeRobot() {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const white = clay(PAL.white), sky = clay(PAL.sky), tomato = clay(PAL.tomato), sun = clay(PAL.sun), ink = clay(PAL.ink, { rough: 0.5 });

  const footGeo = GEO.box(0.44, 0.24, 0.56, 0.11);
  const legGeo = GEO.cap(0.14, 0.2);
  const feet = [];
  for (const sx of [-1, 1]) {
    const leg = mesh(legGeo, ink); leg.position.set(sx * 0.25, 0.42, 0); body.add(leg);
    const foot = mesh(footGeo, tomato); foot.position.set(sx * 0.27, 0.13, 0.06); body.add(foot); feet.push(foot);
  }
  const torso = new THREE.Group(); torso.position.y = 0.6; body.add(torso);
  const chest = mesh(GEO.box(1.08, 0.92, 0.82, 0.32), sky); chest.position.y = 0.42; torso.add(chest);
  const plate = mesh(GEO.box(0.62, 0.42, 0.12, 0.12), white); plate.position.set(0, 0.42, 0.4); torso.add(plate);
  const btnCols = [PAL.tomato, PAL.sun, PAL.grass];
  btnCols.forEach((c, i) => { const b = mesh(GEO.ball(0.065), clay(c), false); b.position.set(-0.16 + i * 0.16, 0.42, 0.47); b.scale.z = 0.6; torso.add(b); });

  const arms = [];
  for (const sx of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(sx * 0.6, 0.72, 0); torso.add(sh);
    const ball = mesh(GEO.ball(0.15), white); sh.add(ball);
    const arm = mesh(GEO.cap(0.12, 0.34), white); arm.position.y = -0.3; sh.add(arm);
    const hand = mesh(GEO.ball(0.17), sun); hand.position.y = -0.6; sh.add(hand);
    sh.rotation.z = sx * 0.28;
    arms.push(sh);
  }
  const head = new THREE.Group(); head.position.y = 0.98; torso.add(head);
  const neck = mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.2, 24), ink); neck.position.y = -0.04; head.add(neck);
  const skull = mesh(GEO.box(1.56, 1.16, 1.12, 0.44), white); skull.position.y = 0.6; head.add(skull);
  const screenMat = new THREE.MeshPhysicalMaterial({ color: 0x241c3a, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.18, metalness: 0 });
  const screen = mesh(GEO.box(1.22, 0.8, 0.22, 0.2), screenMat, false); screen.position.set(0, 0.6, 0.5); head.add(screen);
  const eyeMat = glow(0x9ff3ff);
  const eyes = new THREE.Group(); eyes.position.set(0, 0.67, 0.62); head.add(eyes);
  const eyeGeo = new THREE.CapsuleGeometry(0.085, 0.12, 6, 16);
  for (const sx of [-1, 1]) { const e = new THREE.Mesh(eyeGeo, eyeMat); e.position.x = sx * 0.24; e.scale.z = 0.4; eyes.add(e); }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.028, 10, 32, Math.PI), eyeMat);
  smile.rotation.z = Math.PI; smile.position.set(0, 0.47, 0.615); smile.scale.z = 0.5; head.add(smile);
  const cheekMat = glow(0xff8d86);
  for (const sx of [-1, 1]) { const ch = new THREE.Mesh(new THREE.CircleGeometry(0.075, 24), cheekMat); ch.position.set(sx * 0.42, 0.5, 0.613); ch.scale.y = 0.7; head.add(ch); }
  for (const sx of [-1, 1]) {
    const ear = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 32), tomato); ear.rotation.z = Math.PI / 2; ear.position.set(sx * 0.82, 0.6, 0); head.add(ear);
    const nub = mesh(GEO.ball(0.08), sun, false); nub.position.set(sx * 0.92, 0.6, 0); head.add(nub);
  }
  const antenna = new THREE.Group(); antenna.position.set(0, 1.16, 0); head.add(antenna);
  const stick = mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.36, 12), ink); stick.position.y = 0.16; antenna.add(stick);
  const bulb = mesh(GEO.ball(0.14), sun); bulb.position.y = 0.4; antenna.add(bulb);
  return { root, body, torso, head, eyes, arms, antenna, feet };
}

/* ---------- the floating island ---------- */
function makeIsland(R = 2.7) {
  const g = new THREE.Group();
  const t = 0.34, er = 0.16;
  const prof = [[0.001, 0]];
  for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + (i / 8) * Math.PI / 2; prof.push([R - er + Math.cos(a) * er, er + Math.sin(a) * er]); }
  for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI / 2; prof.push([R - er + Math.cos(a) * er, t - er + Math.sin(a) * er]); }
  prof.push([0.001, t]);
  const top = mesh(lump(GEO.lathe(prof, 64), 0.02, 1.4), clay(PAL.grass, { ns: 0.38 }));
  top.position.y = -t; top.receiveShadow = true; g.add(top);
  const under = [];
  for (let i = 0; i <= 14; i++) { const a = (i / 14) * Math.PI / 2; under.push([Math.max(0.0001, Math.cos(a) * (R - 0.12)), -Math.sin(a) * 1.25]); }
  under.reverse();
  const rock = mesh(lump(GEO.lathe(under, 56), 0.05, 1.6), clay(PAL.peach, { ns: 0.45 }));
  rock.position.y = -t + 0.02; g.add(rock);
  // a tiny tree and some tufts for charm
  const tree = new THREE.Group(); tree.position.set(-1.75, 0, -0.95);
  const trunk = mesh(GEO.cap(0.09, 0.42), clay(PAL.peach)); trunk.position.y = 0.3; tree.add(trunk);
  const crown = mesh(GEO.blob(0.42), clay(PAL.grass)); crown.position.y = 0.86; tree.add(crown);
  const crown2 = mesh(GEO.blob(0.28), clay(0x8fe0a4)); crown2.position.set(0.22, 1.12, 0.08); tree.add(crown2);
  g.add(tree);
  const tufts = [[1.9, 0.9, 0x8fe0a4], [-1.1, 1.75, PAL.sun], [1.4, -1.6, PAL.pink], [-2.1, 0.3, PAL.white]];
  for (const [x, z, c] of tufts) {
    const f = mesh(GEO.ball(0.1), clay(c), false); f.position.set(x, 0.09, z); f.scale.y = 0.75; g.add(f);
    const f2 = mesh(GEO.ball(0.07), clay(c), false); f2.position.set(x + 0.14, 0.06, z + 0.05); g.add(f2);
  }
  return { group: g, tree };
}

/* ---------- layouts: hero float spots and learning-path treads, desktop and phone ---------- */
function layout(phone) {
  if (!phone) {
    const treads = Array.from({ length: 6 }, (_, i) => [1.3 + i * 1.35, 0.55 + i * 0.64, 0.8 - i * 0.35]);
    return {
      cam: { hero: { pos: [0.6, 2.7, 16.2], tgt: [0.2, 1.75, 0], fov: 30, off: [-0.19, 0.0] }, path: { pos: [2.6, 8.2, 20.6], tgt: [4.1, 2.9, -0.2], fov: 30, off: [0, 0.075] } },
      floats: [
        [-2.1, 3.95, -1.0], [2.7, 4.05, -1.3], [-2.0, 1.55, 0.4], [3.05, 1.3, 0.2], [0.95, 4.75, -2.4], [-1.0, 5.05, -3.0],
        [2.2, 2.25, 1.25], [-1.85, 2.75, 1.35], [3.3, 3.15, -2.2], [-2.55, 0.25, -1.2], [1.7, 0.6, 2.0], [-0.95, 4.45, 0.2], [3.55, 0.35, -0.9]
      ],
      treads,
      star: [treads[5][0] + 1.35, treads[5][1] + 2.55, treads[5][2] + 0.1],
      deco: [[3.2, 5.0, -2.6], [6.6, 6.2, -2.9], [10.4, 2.4, -1.6], [-3.3, 2.4, -2.0], [8.6, 0.2, 1.0], [4.4, -0.2, 1.6], [1.6, 3.6, -2.2]],
      label: { side: 1, dx: 0.82, dy: -0.02, dz: 0.3 }
    };
  }
  const treads = Array.from({ length: 6 }, (_, i) => [(i % 2 ? 0.82 : -0.82), 0.8 + i * 0.86, 0.4 - 0.3 * i]);
  return {
    cam: { hero: { pos: [0, 3.0, 20.8], tgt: [0, 1.35, 0], fov: 36, off: [0, 0.27] }, path: { pos: [0, 9.4, 24.5], tgt: [0, 3.9, -0.6], fov: 36, off: [0, 0.13] } },
    floats: [
      [-2.15, 2.9, -0.6], [2.15, 3.15, -1.0], [-2.3, 1.15, 0.4], [2.3, 1.0, 0.3], [1.35, 3.5, -2.4], [-1.3, 3.6, -2.6],
      [1.75, 2.05, 1.0], [-1.6, 2.3, 1.1], [2.65, 0.15, -1.6], [-2.6, 0.1, -1.0], [1.3, 0.45, 1.8], [-0.95, 3.85, -1.2], [2.75, 2.0, 0.2]
    ],
    treads,
    star: [-0.75, treads[5][1] + 2.35, treads[5][2] + 0.2],
    deco: [[2.35, 0.1, 0.7], [-2.4, 0.35, 0.5], [-0.2, 2.2, -3.2], [0.5, 4.6, -3.4], [-2.2, -0.7, 1.3], [2.2, -0.9, 1.1], [-0.1, 6.9, -3.6]],
    label: { side: 0, outer: true, dx: 0.8, dy: 0.0, dz: 0.3 }
  };
}

/* ---------- main stage ---------- */
export function startClay({ canvas, stage, overlay }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !LITE, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
    HX.ready();
    return null;
  }
  const maxDpr = LITE ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  let soft = false;
  try {
    const gl = renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '';
    soft = /swiftshader|llvmpipe|software|basic render/i.test(String(name));
  } catch (e) {}

  NORMAL = clayNormalMap(LITE ? 256 : 512);
  NORMAL.repeat.set(1.5, 1.5);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.55;

  const hemi = new THREE.HemisphereLight(0xfff3e2, 0xffc9a6, 1.35);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0dc, 2.3);
  key.position.set(5, 11, 8);
  key.castShadow = true;
  const sm = LITE || soft ? 512 : 1024;
  key.shadow.mapSize.set(sm, sm);
  key.shadow.radius = LITE || soft ? 5 : 9;
  key.shadow.blurSamples = LITE || soft ? 8 : 16;
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.02;
  const sc = key.shadow.camera;
  sc.left = -9; sc.right = 13; sc.top = 11; sc.bottom = -7; sc.near = 1; sc.far = 40;
  key.target.position.set(2, 0, -0.5);
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xcfe9ff, 0.9);
  rim.position.set(-8, 6, -6);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);

  // world
  const world = new THREE.Group();
  scene.add(world);
  const island = makeIsland();
  world.add(island.group);
  const robot = makeRobot();
  world.add(robot.root);

  // shadow catcher under everything (soft shadow on the page)
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ color: 0x5a3d2b, opacity: 0.12 }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = -2.4; catcher.receiveShadow = true;
  world.add(catcher);

  // the shapes: six building blocks (they become the treads) and friends
  const treadCols = [PAL.sun, PAL.tomato, PAL.sky, PAL.grass, PAL.lilac, PAL.sun];
  const shapes = [];
  const addShape = (geo, col, kind, i) => {
    const m = mesh(geo, clay(col));
    const s = { mesh: m, kind, i, off: new THREE.Vector3(), vel: new THREE.Vector3(), spin: new THREE.Vector3(), wob: new THREE.Vector3(),
      phase: rnd() * 6.28, rot: new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6), rv: new THREE.Vector3((rnd() - 0.5) * 0.5, (rnd() - 0.5) * 0.6, (rnd() - 0.5) * 0.4), pop: 0 };
    world.add(m);
    shapes.push(s);
    return s;
  };
  for (let i = 0; i < 6; i++) {
    const s = addShape(GEO.box(1.42, 0.48, 1.18, 0.2), treadCols[i], 'tread', i);
    s.mesh.receiveShadow = true;
  }
  const decoDefs = [
    [GEO.star(0.62), PAL.sun, 'star'], [GEO.torus(0.36, 0.17), PAL.tomato, 'torus'], [GEO.gear(0.52), PAL.sky, 'gear'],
    [GEO.blob(0.42), PAL.grass, 'blob'], [GEO.blob(0.3), PAL.pink, 'blob'], [GEO.cap(0.2, 0.55), PAL.lilac, 'cap'], [GEO.heart(0.42), PAL.tomato, 'heart']
  ];
  decoDefs.forEach(([g, c, k], j) => { const s = addShape(g, c, k, j); s.face = k === 'star' || k === 'heart' || k === 'gear'; });
  const star = shapes.find((s) => s.kind === 'star');

  // path breadcrumbs (little clay dots that appear behind Pip)
  const crumbs = [];
  const crumbGeo = GEO.ball(0.07);
  const crumbMat = clay(PAL.white);
  for (let i = 0; i < 6 * 3; i++) { const c = mesh(crumbGeo, crumbMat, false); c.scale.setScalar(0.0001); world.add(c); crumbs.push(c); }

  const iconRoot = new THREE.Group();
  iconRoot.visible = false;
  scene.add(iconRoot);

  // overlay hooks
  const labels = [...overlay.querySelectorAll('[data-step]')];
  const bubble = overlay.querySelector('[data-bubble]');

  // state
  let L = layout(isPhone());
  let W = 1, H = 1, visible = true, running = true, progress = 0, t0 = performance.now(), last = t0;
  const pointer = new THREE.Vector2(0, 0), pointerWorld = new THREE.Vector3(999, 999, 0), ray = new THREE.Raycaster();
  let pointerActive = false, lookX = 0, lookY = 0, hopBoost = 0;
  const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3();
  const tmpV = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion(), tmpE = new THREE.Euler();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    L = layout(isPhone());
    camera.updateProjectionMatrix();
  }

  function stageProgress() {
    const r = stage.getBoundingClientRect();
    const len = r.height - innerHeight;
    return len > 0 ? clamp(-r.top / len) : 0;
  }

  function hopTargets() {
    const pts = [[0, 0, 0.45]];
    L.treads.forEach(([x, y, z]) => pts.push([x, y + 0.24, z + 0.18]));
    return pts;
  }

  function update(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    progress = stageProgress();
    const p = progress;
    const phone = isPhone();

    // camera: hero framing to learning-path framing
    const cp = smooth(clamp((p - 0.04) / 0.36));
    const A = L.cam.hero, B = L.cam.path;
    camPos.set(lerp(A.pos[0], B.pos[0], cp), lerp(A.pos[1], B.pos[1], cp), lerp(A.pos[2], B.pos[2], cp));
    camTgt.set(lerp(A.tgt[0], B.tgt[0], cp), lerp(A.tgt[1], B.tgt[1], cp), lerp(A.tgt[2], B.tgt[2], cp));
    camPos.x += Math.sin(t * 0.25) * 0.25 + lookX * 0.35;
    camPos.y += Math.sin(t * 0.31) * 0.12 + lookY * 0.2;
    camera.position.copy(camPos);
    camera.lookAt(camTgt);
    camera.fov = lerp(A.fov, B.fov, cp);
    const ox = lerp(A.off[0], B.off[0], cp), oy = lerp(A.off[1], B.off[1], cp);
    camera.setViewOffset(W, H, ox * W, -oy * H, W, H);
    camera.updateProjectionMatrix();

    // pointer in world
    lookX = lerp(lookX, pointerActive ? pointer.x : Math.sin(t * 0.4) * 0.3, 0.05);
    lookY = lerp(lookY, pointerActive ? pointer.y : 0, 0.05);
    if (pointerActive) {
      ray.setFromCamera(pointer, camera);
      plane.normal.copy(camera.getWorldDirection(tmpV)).negate();
      plane.constant = -plane.normal.dot(camTgt);
      ray.ray.intersectPlane(plane, pointerWorld);
    }

    // shapes
    const appear = clamp((t - 0.15) / 1.6);
    shapes.forEach((s, k) => {
      const isTread = s.kind === 'tread';
      const fl = L.floats[k % L.floats.length];
      const bob = Math.sin(t * 1.3 + s.phase) * 0.14;
      if (s.face) {
        s.rot.set(0.18 * Math.sin(t * 0.7 + s.phase), 0.55 * Math.sin(t * 0.45 + s.phase), 0.16 * Math.sin(t * 0.9 + s.phase));
      } else {
        s.rot.x += s.rv.x * dt; s.rot.y += s.rv.y * dt; s.rot.z += s.rv.z * dt;
      }
      // where it lives on the learning path
      let target, tq;
      const start = isTread ? 0.1 + s.i * 0.055 : 0.16 + s.i * 0.04;
      const q = smooth(clamp((p - start) / 0.3));
      if (isTread) {
        const tr = L.treads[s.i];
        target = tmpV.set(tr[0], tr[1], tr[2]);
        tmpE.set(0, phone ? 0 : -0.35, 0);
        tq = tmpQ2.setFromEuler(tmpE);
      } else if (s === star) {
        target = tmpV.set(L.star[0], L.star[1] + Math.sin(t * 2) * 0.1, L.star[2]);
        tmpE.set(0, t * 1.4, 0);
        tq = tmpQ2.setFromEuler(tmpE);
      } else {
        const d = L.deco[s.i % L.deco.length];
        target = tmpV.set(d[0], d[1] + bob * 0.8, d[2]);
        tmpE.copy(s.rot);
        tq = tmpQ2.setFromEuler(tmpE);
      }
      const fx = fl[0], fy = fl[1] + bob, fz = fl[2];
      const arc = Math.sin(Math.PI * q) * (isTread ? 1.4 : 0.8);
      let px = lerp(fx, target.x, q), py = lerp(fy, target.y, q) + arc, pz = lerp(fz, target.z, q);
      if (isTread) py += Math.sin(t * 1.6 + s.phase) * 0.03 * q;

      // springs: pointer nudge
      if (pointerActive) {
        const dx = px + s.off.x - pointerWorld.x, dy = py + s.off.y - pointerWorld.y, dz = pz + s.off.z - pointerWorld.z;
        const d = Math.hypot(dx, dy, dz);
        const R = 1.9;
        if (d < R) {
          const f = (1 - d / R) * 26 * dt;
          s.vel.x += (dx / d) * f; s.vel.y += (dy / d) * f; s.vel.z += (dz / d) * f * 0.5;
          s.spin.x += dy * f * 0.6; s.spin.y += dx * f * 0.6;
        }
      }
      s.vel.addScaledVector(s.off, -38 * dt);
      s.vel.multiplyScalar(Math.exp(-5.2 * dt));
      s.off.addScaledVector(s.vel, dt);
      s.spin.addScaledVector(s.wob, -30 * dt);
      s.spin.multiplyScalar(Math.exp(-4.5 * dt));
      s.wob.addScaledVector(s.spin, dt);

      s.mesh.position.set(px + s.off.x, py + s.off.y, pz + s.off.z);
      tmpE.copy(s.rot);
      tmpQ.setFromEuler(tmpE);
      tmpQ.slerp(tq, q);
      // tumble while flying
      const tumble = Math.sin(Math.PI * q) * (isTread ? 2.4 : 1.6) * (s.i % 2 ? 1 : -1);
      tmpQ2.setFromAxisAngle(tmpV.set(0.4, 0.2, 1).normalize(), tumble);
      tmpQ.multiply(tmpQ2);
      tmpE.set(s.wob.x * 0.3, s.wob.y * 0.3, 0);
      tmpQ.multiply(tmpQ2.setFromEuler(tmpE));
      s.mesh.quaternion.copy(tmpQ);
      // pop-in on load, squash on landing
      const pa = clamp((appear - k * 0.045) / 0.4);
      const popS = pa <= 0 ? 0.0001 : easeOutBack(pa);
      const land = isTread ? Math.max(0, 1 - Math.abs(q - 0.97) / 0.06) : 0;
      s.mesh.scale.set(popS * (1 + land * 0.12), popS * (1 - land * 0.18), popS * (1 + land * 0.12));
    });

    // Pip
    const R = robot;
    const pts = hopTargets();
    const climb = clamp((p - 0.4) / 0.56) * (pts.length - 1);
    const seg = Math.min(pts.length - 2, Math.floor(climb));
    const u = climb - seg;
    const a = pts[seg], b = pts[seg + 1];
    const hopH = 1.05 + Math.abs(b[1] - a[1]) * 0.6;
    const uu = smooth(u);
    const inHop = climb > 0 && climb < pts.length - 1 && u > 0.001 && u < 0.999;
    let rx = lerp(a[0], b[0], uu), ry = lerp(a[1], b[1], uu) + Math.sin(Math.PI * u) * hopH, rz = lerp(a[2], b[2], uu);
    if (climb >= pts.length - 1) { rx = b[0]; ry = b[1]; rz = b[2]; }
    // entrance: drop in with a bounce
    const enter = clamp((t - 0.1) / 1.1);
    const drop = enter < 1 ? (1 - easeOutBack(enter)) * 3.5 : 0;
    hopBoost = Math.max(0, hopBoost - dt * 2.2);
    const tapHop = Math.sin(Math.PI * clamp(1 - hopBoost)) * 0.7 * (hopBoost > 0 ? 1 : 0);
    R.root.position.set(rx, ry + drop + tapHop, rz);
    const travelYaw = Math.atan2(b[0] - a[0], (b[2] - a[2]) + 0.0001);
    const faceCam = phone ? 0 : -0.18 * cp;
    R.root.rotation.y = inHop ? lerp(faceCam, travelYaw * 0.6, Math.sin(Math.PI * u)) : faceCam + lookX * 0.15;
    const squash = inHop ? (u < 0.12 ? 1 - (0.12 - u) * 1.4 : u > 0.88 ? 1 - (u - 0.88) * 1.4 : 1 + Math.sin(Math.PI * u) * 0.06) : 1 + Math.sin(t * 2.6) * 0.012;
    R.body.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
    R.body.position.y = inHop ? 0 : Math.abs(Math.sin(t * 2.6)) * 0.02;
    // head looks toward the pointer, tilts like it's listening
    R.head.rotation.y = lerp(R.head.rotation.y, lookX * 0.45, 0.08);
    R.head.rotation.x = lerp(R.head.rotation.x, -lookY * 0.18, 0.08);
    R.head.rotation.z = Math.sin(t * 0.9) * 0.06;
    // wave: on entrance, then every few seconds, and at the top of the path
    const waveCycle = (t % 6.5);
    const waving = (t < 3.8 && t > 0.9) || waveCycle < 1.8 || p > 0.97;
    const wv = waving ? 1 : 0;
    R.arms.waveAmt = lerp(R.arms.waveAmt || 0, wv, 0.08);
    const wa = R.arms.waveAmt;
    const armR = R.arms[1], armL = R.arms[0];
    if (inHop) {
      armR.rotation.z = lerp(armR.rotation.z, 2.2, 0.2); armL.rotation.z = lerp(armL.rotation.z, -2.2, 0.2);
    } else {
      armR.rotation.z = lerp(0.28, 2.55 + Math.sin(t * 9) * 0.38, wa);
      armR.rotation.x = Math.sin(t * 9) * 0.1 * wa;
      armL.rotation.z = -0.28 - Math.sin(t * 2.6) * 0.05 - (p > 0.97 ? Math.sin(t * 9 + 1) * 0.0 : 0);
    }
    // antenna spring
    R.antenna.rotation.z = Math.sin(t * 6.5) * 0.08 * (inHop ? 3 : 1) + R.head.rotation.y * -0.2;
    R.antenna.rotation.x = Math.cos(t * 5.1) * 0.05;
    // blink
    const bc = (t + 0.4) % 4.2;
    const blink = bc < 0.13 ? Math.abs(Math.cos((bc / 0.13) * Math.PI)) : (bc > 0.3 && bc < 0.43 && Math.floor(t / 4.2) % 3 === 1 ? Math.abs(Math.cos(((bc - 0.3) / 0.13) * Math.PI)) : 1);
    R.eyes.scale.y = Math.max(0.08, blink);

    // breadcrumbs behind Pip
    crumbs.forEach((c, i) => {
      const sgi = Math.floor(i / 3), f = ((i % 3) + 1) / 4;
      const A2 = pts[sgi], B2 = pts[sgi + 1];
      if (!B2) { c.scale.setScalar(0.0001); return; }
      const h2 = 1.05 + Math.abs(B2[1] - A2[1]) * 0.6;
      const reached = climb - sgi - f;
      const sc2 = reached > 0 ? Math.min(1, reached * 6) : 0;
      c.position.set(lerp(A2[0], B2[0], smooth(f)), lerp(A2[1], B2[1], smooth(f)) + Math.sin(Math.PI * f) * h2 + 0.3, lerp(A2[2], B2[2], smooth(f)));
      c.scale.setScalar(Math.max(0.0001, sc2));
    });

    catcher.material.opacity = 0.12 * (1 - cp);
    // island drifts very slightly
    island.group.position.y = Math.sin(t * 0.8) * 0.04;
    island.tree.rotation.z = Math.sin(t * 1.4) * 0.03;

    renderer.render(scene, camera);
    placeOverlay(p, t, phone, climb);
  }

  // HTML labels pinned to 3D positions
  const proj = new THREE.Vector3();
  function toScreen(x, y, z) {
    proj.set(x, y, z).project(camera);
    return [(proj.x * 0.5 + 0.5) * W, (-proj.y * 0.5 + 0.5) * H];
  }
  function placeOverlay(p, t, phone, climb) {
    stage.style.setProperty('--p', p.toFixed(4));
    const ph = p > 0.12 ? 'path' : 'hero';
    if (overlay.dataset.phase !== ph) overlay.dataset.phase = ph;
    labels.forEach((el, i) => {
      const tr = L.treads[i], lb = L.label;
      const side = lb.side || (lb.outer ? (tr[0] < 0 ? -1 : 1) : (tr[0] < 0 ? 1 : -1));
      const [sx, sy] = toScreen(tr[0] + side * lb.dx, tr[1] + lb.dy, tr[2] + lb.dz);
      const tf = side < 0 ? 'translate(-100%, -50%)' : 'translate(0, -50%)';
      const landP = 0.1 + i * 0.055 + 0.28;
      const vis = clamp((p - landP) / 0.06);
      const reached = climb >= i + 1 - 0.05;
      el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) ${tf} scale(${(0.85 + vis * 0.15).toFixed(3)})`;
      el.style.opacity = vis.toFixed(3);
      el.classList.toggle('is-reached', reached);
    });
    if (bubble) {
      const hp = robot.root.position;
      const [bx, by] = phone ? toScreen(hp.x + 0.45, hp.y + 3.05, hp.z) : toScreen(hp.x + 0.55, hp.y + 3.25, hp.z);
      const bv = clamp((t - 1.3) / 0.5) * (1 - clamp(p / 0.08));
      bubble.style.transform = `translate3d(${bx.toFixed(1)}px, ${by.toFixed(1)}px, 0) translate(${phone ? '-12%' : '0'}, -100%) scale(${(0.6 + 0.4 * easeOutBack(clamp(bv))).toFixed(3)})`;
      bubble.style.opacity = bv.toFixed(3);
    }
  }

  // loop with visibility gating
  const iconQueue = [];
  let iconWait = 0;
  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    if (iconQueue.length && ++iconWait > 3) renderOneIcon(iconQueue.shift());
    if (!visible) return;
    update(now);
  }
  const io = new IntersectionObserver((ents) => { visible = ents[0].isIntersecting; }, { rootMargin: '80px' });
  io.observe(stage);

  // pointer
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    pointerActive = true;
  };
  if (!HX.embed) {
    stage.addEventListener('pointermove', onMove, { passive: true });
    stage.addEventListener('pointerleave', () => { pointerActive = false; pointerWorld.set(999, 999, 0); });
    stage.addEventListener('pointerdown', (e) => {
      onMove(e);
      shapes.forEach((s) => { s.vel.y += 1.4 + rnd(); s.spin.x += (rnd() - 0.5) * 6; s.spin.y += (rnd() - 0.5) * 6; });
      if (progress < 0.05) hopBoost = 1;
    }, { passive: true });
  }
  window.addEventListener('resize', resize);

  resize();
  // warm up shaders, then draw the first frame
  renderer.compile(scene, camera);
  update(performance.now());
  requestAnimationFrame(() => { HX.ready(); });
  requestAnimationFrame(loop);

  // clay icons: queued at load, one per frame inside the main loop, before the hero render overwrites the buffer
  const iconCam = new THREE.PerspectiveCamera(26, 1, 0.1, 60);
  const ibox = new THREE.Box3(), isph = new THREE.Sphere(), ibuf = new THREE.Vector2(), isz = new THREE.Vector2();
  function renderOneIcon(cv) {
    const make = ICONS[cv.dataset.icon];
    if (!make) return;
    renderer.getDrawingBufferSize(ibuf);
    const dpr = renderer.getPixelRatio();
    const S = Math.floor(Math.min(cv.width, ibuf.x, ibuf.y));
    world.visible = false; iconRoot.visible = true;
    const g = make();
    iconRoot.add(g);
    ibox.setFromObject(g); ibox.getBoundingSphere(isph);
    const dist = isph.radius / Math.sin(THREE.MathUtils.degToRad(iconCam.fov / 2));
    iconCam.position.set(isph.center.x, isph.center.y + dist * 0.14, isph.center.z + dist);
    iconCam.lookAt(isph.center);
    iconCam.aspect = 1; iconCam.updateProjectionMatrix();
    renderer.setScissorTest(true);
    renderer.setScissor(0, 0, S / dpr, S / dpr);
    renderer.setViewport(0, 0, S / dpr, S / dpr);
    renderer.render(scene, iconCam);
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(renderer.domElement, 0, ibuf.y - S, S, S, 0, 0, cv.width, cv.height);
    cv.classList.add('is-drawn');
    iconRoot.remove(g);
    world.visible = true; iconRoot.visible = false;
    renderer.getSize(isz);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, isz.x, isz.y);
  }
  function renderIcons(targets) { targets.forEach((t) => iconQueue.push(t)); }

  return { renderer, scene, renderIcons };
}

/* ---------- clay icons for the cards (rendered once into 2D canvases) ---------- */
const ICONS = {
  flag() {
    const g = new THREE.Group();
    const hill = mesh(GEO.blob(0.9), clay(PAL.grass)); hill.scale.set(1.25, 0.55, 1.05); hill.position.y = -0.55; g.add(hill);
    const pole = mesh(GEO.cap(0.06, 1.5), clay(PAL.white)); pole.position.set(0, 0.55, 0); g.add(pole);
    const shape = new THREE.Shape(); shape.moveTo(0, 0.32); shape.quadraticCurveTo(0.45, 0.42, 0.85, 0.12); shape.quadraticCurveTo(0.45, -0.02, 0, -0.28); shape.lineTo(0, 0.32);
    const flag = mesh(GEO.extrude(shape, 0.06, 0.07), clay(PAL.tomato)); flag.position.set(0.42, 1.0, 0); g.add(flag);
    const knob = mesh(GEO.ball(0.11), clay(PAL.sun)); knob.position.set(0, 1.36, 0); g.add(knob);
    const st = mesh(GEO.star(0.32), clay(PAL.sun)); st.position.set(-0.75, 0.75, 0.2); st.rotation.set(0.2, 0.4, 0.3); g.add(st);
    g.rotation.y = -0.35;
    return g;
  },
  blocks() {
    const g = new THREE.Group();
    const cols = [PAL.sky, PAL.sun, PAL.tomato];
    cols.forEach((c, i) => {
      const b = mesh(GEO.box(1.5, 0.42, 0.9, 0.17), clay(c)); b.position.set((i - 1) * 0.28, i * 0.47 - 0.45, 0); g.add(b);
      const nub = mesh(GEO.box(0.32, 0.14, 0.5, 0.06), clay(c)); nub.position.set((i - 1) * 0.28 - 0.35, i * 0.47 - 0.45 + 0.24, 0); g.add(nub);
      const dot = mesh(GEO.ball(0.08), clay(PAL.white)); dot.position.set((i - 1) * 0.28 + 0.4, i * 0.47 - 0.45, 0.46); dot.scale.z = 0.5; g.add(dot);
      const bar = mesh(GEO.cap(0.05, 0.38), clay(PAL.white)); bar.rotation.z = Math.PI / 2; bar.position.set((i - 1) * 0.28 - 0.05, i * 0.47 - 0.45, 0.46); bar.scale.z = 0.5; g.add(bar);
    });
    g.rotation.set(0.35, -0.5, 0);
    return g;
  },
  trophy() {
    const g = new THREE.Group();
    const cup = mesh(GEO.lathe([[0.001, 0], [0.3, 0.02], [0.52, 0.2], [0.62, 0.55], [0.64, 0.86], [0.58, 0.9], [0.5, 0.62], [0.001, 0.6]], 48), clay(PAL.sun));
    cup.position.y = 0.05; g.add(cup);
    for (const sx of [-1, 1]) { const h = mesh(GEO.torus(0.2, 0.06), clay(PAL.sun)); h.position.set(sx * 0.62, 0.55, 0); h.rotation.y = Math.PI / 2; g.add(h); }
    const stem = mesh(GEO.cap(0.1, 0.25), clay(PAL.sun)); stem.position.y = -0.12; g.add(stem);
    const base = mesh(GEO.box(0.78, 0.26, 0.6, 0.1), clay(PAL.tomato)); base.position.y = -0.42; g.add(base);
    const st = mesh(GEO.star(0.26), clay(PAL.white)); st.position.set(0, 1.25, 0); g.add(st);
    g.rotation.set(0.25, 0.3, 0);
    return g;
  },
  code() {
    const g = new THREE.Group();
    const bar = (len, c, x, y, rz) => { const m = mesh(GEO.cap(0.12, len), clay(c)); m.position.set(x, y, 0); m.rotation.z = rz; g.add(m); };
    bar(0.5, PAL.tomato, -0.72, 0.2, -0.9); bar(0.5, PAL.tomato, -0.72, -0.2, 0.9);
    bar(1.15, PAL.sun, 0, 0, -0.42);
    bar(0.5, PAL.sky, 0.72, 0.2, 0.9); bar(0.5, PAL.sky, 0.72, -0.2, -0.9);
    const cube = mesh(GEO.box(0.42, 0.42, 0.42, 0.12), clay(PAL.grass)); cube.position.set(0.55, -0.72, 0.3); cube.rotation.set(0.5, 0.6, 0.2); g.add(cube);
    g.rotation.set(0.2, -0.35, 0);
    return g;
  },
  robot() {
    const g = new THREE.Group();
    const r = makeRobot();
    r.root.scale.setScalar(0.62); r.root.position.y = -1.35;
    r.arms[1].rotation.z = 2.5; r.head.rotation.z = 0.12;
    g.add(r.root);
    const gear = mesh(GEO.gear(0.42), clay(PAL.sun)); gear.position.set(-0.9, 0.55, -0.6); gear.rotation.set(0.1, 0.5, 0.3); g.add(gear);
    g.rotation.y = 0.32;
    return g;
  },
  math() {
    const g = new THREE.Group();
    const p1 = mesh(GEO.cap(0.15, 0.8), clay(PAL.grass)); g.add(p1);
    const p2 = mesh(GEO.cap(0.15, 0.8), clay(PAL.grass)); p2.rotation.z = Math.PI / 2; g.add(p2);
    const div = new THREE.Group(); div.position.set(0.95, 0.55, -0.3);
    const d1 = mesh(GEO.cap(0.1, 0.5), clay(PAL.sky)); d1.rotation.z = Math.PI / 2; div.add(d1);
    const d2 = mesh(GEO.ball(0.12), clay(PAL.sky)); d2.position.y = 0.3; div.add(d2);
    const d3 = mesh(GEO.ball(0.12), clay(PAL.sky)); d3.position.y = -0.3; div.add(d3);
    g.add(div);
    const x1 = new THREE.Group(); x1.position.set(-0.9, -0.6, 0.2); x1.rotation.z = Math.PI / 4;
    const xa = mesh(GEO.cap(0.1, 0.45), clay(PAL.tomato)); x1.add(xa); const xb = mesh(GEO.cap(0.1, 0.45), clay(PAL.tomato)); xb.rotation.z = Math.PI / 2; x1.add(xb);
    g.add(x1);
    const ball = mesh(GEO.ball(0.2), clay(PAL.sun)); ball.position.set(0.8, -0.65, 0.3); g.add(ball);
    g.rotation.set(0.25, -0.3, 0.05);
    return g;
  },
  pipwave() {
    const g = new THREE.Group();
    const r = makeRobot();
    r.root.position.y = -1.5;
    r.arms[1].rotation.z = 2.6; r.arms[1].rotation.x = 0.15;
    r.arms[0].rotation.z = -0.35;
    r.head.rotation.set(0.05, -0.25, 0.14);
    g.add(r.root);
    const st = mesh(GEO.star(0.34), clay(PAL.sun)); st.position.set(1.25, 1.6, 0.2); st.rotation.set(0.1, -0.3, 0.25); g.add(st);
    const st2 = mesh(GEO.star(0.2), clay(PAL.tomato)); st2.position.set(-1.25, 1.0, 0.1); st2.rotation.set(0, 0.3, -0.2); g.add(st2);
    const h = mesh(GEO.heart(0.26), clay(PAL.pink)); h.position.set(1.1, -0.2, 0.4); h.rotation.set(0, -0.3, 0.2); g.add(h);
    g.rotation.y = -0.18;
    return g;
  },
  rocket() {
    const g = new THREE.Group();
    const r = new THREE.Group(); r.rotation.z = -0.55; g.add(r);
    const body = mesh(GEO.lathe([[0.001, -0.75], [0.3, -0.7], [0.4, -0.3], [0.42, 0.2], [0.34, 0.55], [0.001, 0.62]], 48), clay(PAL.white)); r.add(body);
    const nose = mesh(GEO.lathe([[0.001, 0.5], [0.3, 0.52], [0.22, 0.78], [0.001, 0.98]], 40), clay(PAL.tomato)); r.add(nose);
    const win = mesh(GEO.torus(0.15, 0.05), clay(PAL.tomato)); win.position.set(0, 0.12, 0.38); r.add(win);
    const glass = mesh(GEO.ball(0.13), clay(PAL.sky)); glass.position.set(0, 0.12, 0.35); glass.scale.z = 0.5; r.add(glass);
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.42, -0.2); s.quadraticCurveTo(0.46, -0.5, 0.3, -0.55); s.lineTo(0, -0.38); s.lineTo(0, 0);
      const fin = mesh(GEO.extrude(s, 0.05, 0.05), clay(PAL.tomato)); const a = (i / 3) * Math.PI * 2 + 0.4;
      fin.position.set(Math.sin(a) * 0.38, -0.42, Math.cos(a) * 0.38); fin.rotation.y = a - Math.PI / 2; r.add(fin);
    }
    const flame = mesh(GEO.blob(0.2), clay(PAL.sun)); flame.position.y = -0.92; flame.scale.set(1, 1.5, 1); r.add(flame);
    const planet = mesh(GEO.ball(0.36), clay(PAL.lilac)); planet.position.set(0.9, 0.75, -0.5); g.add(planet);
    const ring = mesh(GEO.torus(0.55, 0.05), clay(PAL.sun)); ring.position.copy(planet.position); ring.rotation.set(1.2, 0.3, 0.2); g.add(ring);
    const st = mesh(GEO.star(0.18), clay(PAL.sun)); st.position.set(-0.85, 0.8, 0); g.add(st);
    return g;
  }
};
