// Cargoflow: a floating isometric logistics island. Warehouse, port and city, all procedural.
import * as THREE from 'three';

const C = (h) => new THREE.Color(h);
const PAL = {
  navy: C('#0b1b3f'), navy2: C('#24365f'), coral: C('#ff6a4d'), mint: C('#2ed3a5'), sky: C('#7cc4ff'), sand: C('#ffd79a'),
  white: C('#ffffff'), wall: C('#f7f9ff'), conc: C('#eef2fb'), asph: C('#dbe2f3'), road: C('#c8d1ea'), grass: C('#c4efdc'),
  grass2: C('#a9e6c9'), sandDk: C('#f3bf72'), sandMd: C('#ffd79a'), glass: C('#a9d6ff'), dark: C('#2b3654'), panel: C('#2d4a8a'),
  door: C('#d3dcf0'), roofG: C('#e4e9f6'), tree: C('#57d9a8'), tree2: C('#7be0b8'), trunk: C('#c98f5a'), boot: C('#ff6a4d')
};
const PLAIN = [0.5, 0.93];

/* ------------------------------------------------------------------ merged geometry builder */
class Geo {
  constructor() { this.p = []; this.n = []; this.c = []; this.u = []; }
  quad(a, b, c, d, n, col, uv) {
    const P = [a, b, c, a, c, d], U = uv ? [uv[0], uv[1], uv[2], uv[0], uv[2], uv[3]] : null;
    for (let i = 0; i < 6; i++) { const q = P[i]; this.p.push(q[0], q[1], q[2]); this.n.push(n[0], n[1], n[2]); this.c.push(col.r, col.g, col.b); const t = U ? U[i] : PLAIN; this.u.push(t[0], t[1]); }
  }
  tri(a, b, c, col) {
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    for (const q of [a, b, c]) { this.p.push(q[0], q[1], q[2]); this.n.push(n[0] / l, n[1] / l, n[2] / l); this.c.push(col.r, col.g, col.b); this.u.push(PLAIN[0], PLAIN[1]); }
  }
  // axis-aligned box; o.top / o.side colours; o.ribs: 'x' | 'z' | 'all' (vertical ribs along length); o.door: horizontal ribs
  box(x0, y0, z0, x1, y1, z1, col, o = {}) {
    const top = o.top || col, side = o.side || col, k = o.rib || 2.2;
    const rv = (len) => [[0, 0.02], [len * k / 16, 0.02], [len * k / 16, 0.78], [0, 0.78]];
    const dv = (len, h) => [[0, 0.02], [0, 0.78], [h * k / 16, 0.78], [h * k / 16, 0.02]];
    const uvFor = (axisLen, h, ribbed) => ribbed ? (o.door ? dv(axisLen, h) : rv(axisLen, h)) : null;
    const dx = x1 - x0, dz = z1 - z0, dy = y1 - y0;
    const rx = o.ribs === 'x' || o.ribs === 'all' || o.door, rz = o.ribs === 'z' || o.ribs === 'all' || o.door;
    if (!o.noTop) this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], top);
    if (o.bottom) this.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], side);
    this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], o.front || side, uvFor(dx, dy, rx));
    this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], side, uvFor(dx, dy, rx));
    this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], o.right || side, uvFor(dz, dy, rz));
    this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], side, uvFor(dz, dy, rz));
  }
  // centred box helper
  cbox(cx, y0, cz, w, h, d, col, o) { this.box(cx - w / 2, y0, cz - d / 2, cx + w / 2, y0 + h, cz + d / 2, col, o); }
  // any three.js geometry with a transform
  geom(g, col, m, colTop) {
    const gg = g.index ? g.toNonIndexed() : g;
    if (m) gg.applyMatrix4(m);
    gg.computeVertexNormals();
    const P = gg.attributes.position.array, N = gg.attributes.normal.array;
    for (let i = 0; i < P.length; i += 3) {
      this.p.push(P[i], P[i + 1], P[i + 2]); this.n.push(N[i], N[i + 1], N[i + 2]);
      const cc = colTop && N[i + 1] > 0.6 ? colTop : col;
      this.c.push(cc.r, cc.g, cc.b); this.u.push(PLAIN[0], PLAIN[1]);
    }
  }
  // triangular prism roof along x (ridge parallel to x) or z
  gable(x0, y0, z0, x1, y1, z1, col, along = 'x', colEnd) {
    const e = colEnd || col;
    if (along === 'x') {
      const zm = (z0 + z1) / 2;
      this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, zm], [x0, y1, zm], nrm([0, z1 - zm, y1 - y0]), col);
      this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, zm], [x1, y1, zm], nrm([0, z1 - zm, -(y1 - y0)]), col);
      this.tri([x1, y0, z1], [x1, y0, z0], [x1, y1, zm], e);
      this.tri([x0, y0, z0], [x0, y0, z1], [x0, y1, zm], e);
    } else {
      const xm = (x0 + x1) / 2;
      this.quad([x1, y0, z1], [x1, y0, z0], [xm, y1, z0], [xm, y1, z1], nrm([y1 - y0, x1 - xm, 0]), col);
      this.quad([x0, y0, z0], [x0, y0, z1], [xm, y1, z1], [xm, y1, z0], nrm([-(y1 - y0), x1 - xm, 0]), col);
      this.tri([x0, y0, z1], [x1, y0, z1], [xm, y1, z1], e);
      this.tri([x1, y0, z0], [x0, y0, z0], [xm, y1, z0], e);
    }
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
    g.computeBoundingSphere();
    return g;
  }
}
function nrm(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
const M4 = () => new THREE.Matrix4();
const TRS = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) => M4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new THREE.Vector3(sx, sy, sz));

/* ------------------------------------------------------------------ textures (generated) */
function ribTexture() {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128;
  const x = cv.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 128, 128);
  const tones = [255, 255, 252, 246, 232, 222, 236, 250];
  for (let i = 0; i < 128; i++) { const t = tones[i % 8]; x.fillStyle = 'rgb(' + t + ',' + t + ',' + Math.min(255, t + 3) + ')'; x.fillRect(i, 26, 1, 102); }
  const tx = new THREE.CanvasTexture(cv);
  tx.wrapS = THREE.RepeatWrapping; tx.wrapT = THREE.ClampToEdgeWrapping; tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
  return tx;
}
function windowTexture() {
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
  const x = cv.getContext('2d');
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, 64, 64);
  x.fillStyle = '#b9cdf3'; x.fillRect(12, 14, 40, 30);
  x.fillStyle = '#d7e4fb'; x.fillRect(12, 14, 40, 12);
  x.fillStyle = '#97b0e3'; x.fillRect(12, 14, 40, 3);
  x.fillStyle = '#eef3ff'; x.fillRect(10, 44, 44, 3);
  const tx = new THREE.CanvasTexture(cv);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
  return tx;
}
function waterTexture() {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
  const x = cv.getContext('2d');
  const g = x.createLinearGradient(0, 0, 256, 256); g.addColorStop(0, '#8fd0ff'); g.addColorStop(1, '#75bff9');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const px = (i * 97) % 256, py = (i * 61) % 256, l = 14 + (i * 13) % 26;
    x.lineWidth = 2 + (i % 3);
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + l / 2, py - 3, px + l, py); x.stroke();
  }
  const tx = new THREE.CanvasTexture(cv);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.colorSpace = THREE.SRGBColorSpace; tx.repeat.set(3, 1.2);
  return tx;
}
function blobTexture() {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128;
  const x = cv.getContext('2d');
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, 'rgba(11,27,63,.55)'); g.addColorStop(0.55, 'rgba(11,27,63,.22)'); g.addColorStop(1, 'rgba(11,27,63,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cv);
}

/* ------------------------------------------------------------------ the island */
function islandShape(notch) {
  const r = 3.2, pts = [];
  const arc = (cx, cz, a0) => { for (let i = 0; i <= 5; i++) { const a = a0 + i / 5 * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } };
  // walk in x/z; converted to shape space (sx = x, sy = -z)
  arc(-30 + r, -20 + r, Math.PI);            // back-left corner
  arc(30 - r, -20 + r, Math.PI * 1.5);       // back-right
  arc(30 - r, 20 - r, 0);                    // front-right
  if (notch) { pts.push([24, 20], [24, 9], [-6, 9], [-6, 20]); }
  arc(-30 + r, 20 - r, Math.PI / 2);         // front-left
  return new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
}
function extrude(G, shape, y0, y1, colTop, colSide) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false, curveSegments: 1 });
  const m = M4().makeRotationX(-Math.PI / 2); m.premultiply(M4().makeTranslation(0, y0, 0));
  G.geom(g, colSide, m, colTop);
}

// a road ribbon following a closed curve
function ribbon(G, curve, width, y, col, n = 220) {
  const pts = curve.getSpacedPoints(n);
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[i + 1];
    const t = new THREE.Vector3().subVectors(b, a).normalize(), s = new THREE.Vector3(-t.z, 0, t.x).multiplyScalar(width / 2);
    const ta = curve.getTangentAt(i / n), tb = curve.getTangentAt(Math.min(1, (i + 1) / n));
    const sa = new THREE.Vector3(-ta.z, 0, ta.x).normalize().multiplyScalar(width / 2), sb = new THREE.Vector3(-tb.z, 0, tb.x).normalize().multiplyScalar(width / 2);
    void s;
    G.quad([a.x - sa.x, y, a.z - sa.z], [b.x - sb.x, y, b.z - sb.z], [b.x + sb.x, y, b.z + sb.z], [a.x + sa.x, y, a.z + sa.z], [0, 1, 0], col);
  }
}
function dashes(G, curve, y, col, n = 120) {
  for (let i = 0; i < n; i += 2) {
    const a = curve.getPointAt(i / n), b = curve.getPointAt((i + 0.9) / n);
    const t = new THREE.Vector3().subVectors(b, a).normalize(), s = new THREE.Vector3(-t.z, 0, t.x).multiplyScalar(0.07);
    G.quad([a.x - s.x, y, a.z - s.z], [b.x - s.x, y, b.z - s.z], [b.x + s.x, y, b.z + s.z], [a.x + s.x, y, a.z + s.z], [0, 1, 0], col);
  }
}

const CONT_COLS = ['coral', 'mint', 'sky', 'sand', 'navy2', 'white', 'coral', 'sky', 'mint', 'sand'];
function container(G, cx, y0, cz, along = 'x', colName) {
  const col = PAL[colName] || colName, L = 3.5, W = 1.28, H = 1.32;
  if (along === 'x') G.box(cx - L / 2, y0, cz - W / 2, cx + L / 2, y0 + H, cz + W / 2, col, { ribs: 'all', rib: 5.2, top: col.clone().lerp(PAL.white, 0.18) });
  else G.box(cx - W / 2, y0, cz - L / 2, cx + W / 2, y0 + H, cz + L / 2, col, { ribs: 'all', rib: 5.2, top: col.clone().lerp(PAL.white, 0.18) });
}
function tree(G, x, z, s = 1, y = 0) {
  G.cbox(x, y, z, 0.26 * s, 0.9 * s, 0.26 * s, PAL.trunk);
  const ico = new THREE.IcosahedronGeometry(0.95 * s, 0);
  G.geom(ico, (x * 7 + z * 3) % 2 > 1 ? PAL.tree : PAL.tree2, TRS(x, y + 1.55 * s, z, (x + z) * 0.7, 1, 1.15, 1));
}

function buildWorld(lite) {
  const G = new Geo(), W = new Geo();   // G: main material, W: facades with windows
  // ---- base strata
  const full = islandShape(false), land = islandShape(true);
  extrude(G, full, -7.2, -4.4, PAL.sandDk, PAL.sandDk);
  extrude(G, full, -4.4, -1.5, PAL.sandMd, PAL.sandMd);
  extrude(G, land, -1.5, 0, PAL.conc, C('#e9eefb'));
  // ---- zone floors (decals)
  G.box(-29.4, 0, -6.4, -0.6, 0.02, 3.6, PAL.asph, { noTop: false });                  // warehouse yard
  G.box(-6, 0, 3.8, 24, 0.02, 8.95, C('#e6ebf8'));                                     // port apron
  G.box(1.6, 0, -19.2, 29.2, 0.02, 3.2, C('#f1f4fc'));                                 // city pavement
  G.box(-29.6, 0, -19.6, -26.6, 0.03, -7.2, PAL.grass);                                // left lawn
  G.box(8.2, 0.02, -8.6, 20.2, 0.05, -4.9, PAL.grass);                                 // park
  G.box(-29.6, 0, 9.2, -7.0, 0.03, 19.6, PAL.grass);                                   // lighthouse lawn
  // apron paint
  for (let x = -4; x < 23; x += 4.2) G.box(x, 0.02, 5.0, x + 3.6, 0.035, 5.12, PAL.sand);
  for (let x = -27.5; x < -2; x += 3.5) G.box(x, 0.02, -4.6, x + 0.1, 0.035, -1.4, PAL.white);

  // ---- roads
  const loop = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-25, 0, 1.6), new THREE.Vector3(0, 0, 1.6), new THREE.Vector3(24, 0, 1.6), new THREE.Vector3(27.1, 0, -1.2),
    new THREE.Vector3(27.1, 0, -9), new THREE.Vector3(27.1, 0, -15.8), new THREE.Vector3(24, 0, -18.3), new THREE.Vector3(0, 0, -18.3),
    new THREE.Vector3(-24, 0, -18.3), new THREE.Vector3(-27.6, 0, -15.6), new THREE.Vector3(-27.6, 0, -8), new THREE.Vector3(-27.6, 0, -1.4)
  ], true, 'catmullrom', 0.12);
  ribbon(G, loop, 2.0, 0.04, PAL.road);
  dashes(G, loop, 0.06, PAL.white, 160);
  const vanLoop = new THREE.CatmullRomCurve3([
    new THREE.Vector3(6.2, 0, -3), new THREE.Vector3(14, 0, -3), new THREE.Vector3(21.8, 0, -3), new THREE.Vector3(22.8, 0, -4.4),
    new THREE.Vector3(22.8, 0, -13.6), new THREE.Vector3(21.6, 0, -15), new THREE.Vector3(7.2, 0, -15), new THREE.Vector3(5.6, 0, -13.6), new THREE.Vector3(5.6, 0, -4.2)
  ], true, 'catmullrom', 0.15);
  ribbon(G, vanLoop, 1.5, 0.045, PAL.road);
  dashes(G, vanLoop, 0.065, PAL.white, 90);

  // ---- warehouse
  const wx0 = -25, wx1 = -9, wz0 = -17, wz1 = -7, wh = 5.6;
  G.box(wx0, 0, wz0, wx1, wh, wz1, PAL.wall, { noTop: true, ribs: 'all', rib: 3.2 });
  G.box(wx0, 4.75, wz1, wx1, 5.15, wz1 + 0.04, PAL.coral);
  G.box(wx1, 4.75, wz0, wx1 + 0.04, 5.15, wz1, PAL.coral);
  for (let i = 0; i < 5; i++) {            // sawtooth roof, slopes face +x
    const xa = wx0 + i * 3.2, xb = xa + 3.2, yl = wh, yh = wh + 1.5;
    G.quad([xa, yh, wz1], [xb, yl, wz1], [xb, yl, wz0], [xa, yh, wz0], nrm([1.5, 3.2, 0]), PAL.roofG);
    G.quad([xa, yl, wz0], [xa, yl, wz1], [xa, yh, wz1], [xa, yh, wz0], [-1, 0, 0], PAL.glass);
    G.tri([xa, yl, wz1], [xb, yl, wz1], [xa, yh, wz1], PAL.wall);
    G.tri([xb, yl, wz0], [xa, yl, wz0], [xa, yh, wz0], PAL.wall);
    // solar panels on the slope
    for (let k = 0; k < 4; k++) {
      const zc = wz0 + 1.3 + k * 2.4;
      const m = TRS(xa + 1.6, (yl + yh) / 2 + 0.06, zc, 0, 1, 1, 1, 0, -Math.atan2(1.5, 3.2));
      G.geom(new THREE.BoxGeometry(2.7, 0.08, 2.0), PAL.panel, m, C('#3a5fae'));
    }
  }
  G.box(wx0 - 0.05, wh, wz0 - 0.05, wx1 + 0.05, wh + 0.12, wz0 + 0.12, PAL.wall);
  // dock platform, canopy, doors
  G.box(wx0, 0, wz1, wx1, 0.6, wz1 + 1.2, C('#e3e9f7'));
  G.box(wx0 - 0.2, 4.1, wz1, wx1 + 0.2, 4.28, wz1 + 1.9, PAL.white);
  const doorX = [-22.5, -19, -15.5, -12];
  doorX.forEach((x, i) => {
    if (i !== 1) G.box(x - 1.2, 0.6, wz1 + 0.01, x + 1.2, 3.7, wz1 + 0.06, PAL.door, { door: true, rib: 4.5 });
    else G.box(x - 1.2, 0.6, wz1 + 0.005, x + 1.2, 3.7, wz1 + 0.012, C('#3a4769'));
    G.box(x - 1.32, 3.7, wz1 + 0.01, x + 1.32, 3.85, wz1 + 0.1, PAL.navy2);
    G.box(x - 1.45, 0.6, wz1 + 1.18, x - 1.2, 1.2, wz1 + 1.3, PAL.dark);
    G.box(x + 1.2, 0.6, wz1 + 1.18, x + 1.45, 1.2, wz1 + 1.3, PAL.dark);
  });
  // side door for the conveyor + wall sign
  G.box(wx1, 0.4, -10.6, wx1 + 0.06, 2.6, -8.9, PAL.door, { door: true, rib: 4.5 });
  G.box(wx1, 2.9, -15.6, wx1 + 0.06, 4.2, -11.6, PAL.navy);
  G.box(wx1 + 0.06, 3.3, -15.2, wx1 + 0.08, 3.8, -14.6, PAL.coral);
  G.box(wx1 + 0.06, 3.3, -14.3, wx1 + 0.08, 3.8, -12.1, PAL.white);
  // parked trucks at doors 1 and 3
  for (const [x, col] of [[-22.5, PAL.navy], [-15.5, PAL.coral]]) {
    G.box(x - 0.66, 0.62, wz1 + 1.25, x + 0.66, 2.0, wz1 + 4.9, col === PAL.navy ? PAL.sand : PAL.sky, { ribs: 'all', rib: 5.2 });
    G.box(x - 0.55, 0.35, wz1 + 1.3, x + 0.55, 0.62, wz1 + 6.3, PAL.dark);
    G.box(x - 0.66, 0.5, wz1 + 5.0, x + 0.66, 2.0, wz1 + 6.35, col);
    G.box(x - 0.6, 1.4, wz1 + 6.34, x + 0.6, 1.85, wz1 + 6.38, PAL.glass);
    for (const z of [wz1 + 2.0, wz1 + 2.9, wz1 + 5.6]) { G.box(x - 0.72, 0, z - 0.3, x - 0.5, 0.6, z + 0.3, PAL.dark); G.box(x + 0.5, 0, z - 0.3, x + 0.72, 0.6, z + 0.3, PAL.dark); }
  }
  // office + cars
  W.box(-29.2, 0, -5.4, -25.8, 3.6, -1.6, C('#f4f7ff'), { noTop: true });
  G.box(-29.35, 3.6, -5.55, -25.65, 3.85, -1.45, PAL.navy2);
  G.box(-28.6, 3.85, -4.6, -27.6, 4.4, -3.6, PAL.white);
  [[-29, -9.2, PAL.coral], [-29, -11.3, PAL.sky], [-29, -13.4, PAL.white], [-29, -15.5, PAL.mint]].forEach(([x, z, col]) => {
    G.box(x - 0.55, 0.12, z - 0.9, x + 0.55, 0.62, z + 0.9, col);
    G.box(x - 0.45, 0.62, z - 0.5, x + 0.45, 0.98, z + 0.4, PAL.glass, { top: col });
  });
  // container stacks + conveyor frame
  const stack = [[3, 2, 1, 2], [2, 3, 2, 1]];
  let ci = 0;
  for (let col = 0; col < 2; col++) for (let row = 0; row < 4; row++) {
    const h = lite ? Math.min(2, stack[col][row]) : stack[col][row];
    for (let t = 0; t < h; t++) container(G, -5.1 + col * 3.75, t * 1.33, -16.3 + row * 1.36, 'x', CONT_COLS[(ci++ * 3 + row) % CONT_COLS.length]);
  }
  G.box(-9, 0.95, -10.1, -3.6, 1.05, -9.4, PAL.dark);
  for (let x = -8.6; x < -3.6; x += 1.4) { G.box(x, 0, -10.05, x + 0.12, 0.95, -9.95, PAL.navy2); G.box(x, 0, -9.55, x + 0.12, 0.95, -9.45, PAL.navy2); }
  G.box(-3.6, 0.25, -11.2, -0.2, 2.1, -8.3, PAL.white, { ribs: 'all', rib: 4.6 });       // box truck body
  G.box(-0.2, 0.25, -11.1, 1.1, 1.6, -8.4, PAL.mint);
  G.box(1.08, 0.95, -11.0, 1.12, 1.45, -8.5, PAL.glass);

  // ---- port: quay furniture, crane frame, lighthouse
  for (let x = -5; x < 24; x += 3) G.cbox(x, 0, 8.6, 0.34, 0.45, 0.34, PAL.dark);
  [[14.5, 5.9, 'z', 'mint'], [16, 5.9, 'z', 'coral'], [17.5, 5.9, 'z', 'sand'], [16, 5.9, 'z', 'navy2', 1.33], [21, 6.4, 'x', 'sky'], [21, 6.4, 'x', 'white', 1.33]].forEach(([x, z, a, c, y]) => container(G, x, y || 0, z, a, c));
  const cr = { x: 7.4, z0: 4.6, z1: 8.4 };
  for (const lx of [cr.x - 1.6, cr.x + 1.6]) for (const lz of [cr.z0, cr.z1]) G.cbox(lx, 0, lz, 0.42, 8.6, 0.42, PAL.coral, { top: PAL.coral });
  G.box(cr.x - 1.8, 0, cr.z0 - 0.35, cr.x + 1.8, 0.45, cr.z1 + 0.35, PAL.navy2, { top: PAL.navy2 });
  for (const lz of [cr.z0, cr.z1]) G.box(cr.x - 1.8, 7.6, lz - 0.25, cr.x + 1.8, 8.6, lz + 0.25, PAL.coral);
  for (const lx of [cr.x - 1.6, cr.x + 1.6]) {
    G.box(lx - 0.25, 8.6, 0.6, lx + 0.25, 9.3, 19.4, PAL.coral, { top: C('#ff8a71') });         // boom girders
  }
  for (let z = 1; z < 19.5; z += 2.2) G.box(cr.x - 1.6, 8.75, z, cr.x + 1.6, 8.95, z + 0.2, PAL.coral);
  G.box(cr.x - 1.5, 9.3, 1.0, cr.x + 1.5, 10.8, 4.2, PAL.white, { top: C('#e8edf9') });           // machinery house
  G.box(cr.x - 1.2, 10.2, 1.02, cr.x + 1.2, 10.5, 1.05, PAL.navy2);
  G.cbox(cr.x - 1.4, 9.3, 6.3, 0.3, 4.4, 0.3, PAL.coral); G.cbox(cr.x + 1.4, 9.3, 6.3, 0.3, 4.4, 0.3, PAL.coral);
  G.box(cr.x - 1.6, 13.5, 6.0, cr.x + 1.6, 13.8, 6.6, PAL.coral);
  for (const lx of [cr.x - 1.4, cr.x + 1.4]) {
    const a = new THREE.Vector3(lx, 13.6, 6.3), b = new THREE.Vector3(lx, 9.3, 18.6), mid = a.clone().add(b).multiplyScalar(0.5), len = a.distanceTo(b);
    G.geom(new THREE.BoxGeometry(0.14, len, 0.14), PAL.white, TRS(mid.x, mid.y, mid.z, 0, 1, 1, 1, Math.atan2(b.z - a.z, a.y - b.y), 0));
    const c2 = new THREE.Vector3(lx, 9.3, 1.0), m2 = a.clone().add(c2).multiplyScalar(0.5), l2 = a.distanceTo(c2);
    G.geom(new THREE.BoxGeometry(0.14, l2, 0.14), PAL.white, TRS(m2.x, m2.y, m2.z, 0, 1, 1, 1, Math.atan2(c2.z - a.z, a.y - c2.y), 0));
  }
  // lighthouse
  const lh = new THREE.CylinderGeometry(0.55, 0.8, 4.2, 10);
  G.geom(lh, PAL.white, TRS(-9.6, 2.1, 17.4));
  G.geom(new THREE.CylinderGeometry(0.62, 0.66, 0.7, 10), PAL.coral, TRS(-9.6, 2.6, 17.4));
  G.geom(new THREE.CylinderGeometry(0.5, 0.5, 0.8, 10), PAL.sky, TRS(-9.6, 4.6, 17.4));
  G.geom(new THREE.ConeGeometry(0.75, 0.8, 10), PAL.coral, TRS(-9.6, 5.4, 17.4));
  G.box(-12.2, 0.02, 14.8, -7.1, 0.06, 15.4, PAL.white);

  // ---- city
  const bld = (x0, z0, x1, z1, h, tint, roof) => {
    W.box(x0, 0, z0, x1, h, z1, tint, { noTop: true });
    G.box(x0 - 0.08, h, z0 - 0.08, x1 + 0.08, h + 0.22, z1 + 0.08, roof || PAL.roofG, { top: C('#f2f5fd') });
    return h + 0.22;
  };
  let h;
  h = bld(8, -13.2, 11.6, -9.6, 9.2, C('#eef4ff'));
  G.box(8.6, h, -12.6, 9.8, h + 0.7, -11.4, PAL.white); G.geom(new THREE.CylinderGeometry(0.5, 0.5, 1.1, 10), PAL.sky, TRS(10.8, h + 0.55, -10.4));
  h = bld(12.4, -13.2, 16, -9.6, 6.4, C('#fff3e3'), PAL.sand);
  G.box(13, h, -12.6, 14.2, h + 0.5, -11.8, PAL.white); G.box(14.6, h, -12.6, 15.4, h + 0.5, -11.8, PAL.white);
  h = bld(16.8, -13.2, 20.4, -9.6, 4.6, C('#ffe9e3'), PAL.coral);
  G.box(17.4, h, -12.4, 19.8, h + 0.08, -10.2, PAL.mint);
  bld(23.8, -15.6, 26.4, -11.4, 7.4, C('#eaf9f3'), PAL.mint);
  bld(23.8, -10.4, 26.4, -6.2, 5.2, C('#eef4ff'), PAL.sky);
  bld(2.4, -12.6, 5.2, -8.4, 2.6, C('#ffffff'), PAL.navy2);
  G.geom(new THREE.CylinderGeometry(1.0, 1.0, 0.06, 20), PAL.mint, TRS(3.8, 2.84, -10.5));
  G.geom(new THREE.CylinderGeometry(0.7, 0.7, 0.07, 20), PAL.navy2, TRS(3.8, 2.85, -10.5));
  // pitched houses along the front street
  const roofC = [PAL.coral, PAL.sky, PAL.sand, PAL.mint, PAL.coral, PAL.navy2];
  [7.6, 10.4, 13.2, 16, 18.8, 21.6].forEach((x, i) => {
    W.box(x - 1.05, 0, -1.9, x + 1.05, 1.7, -0.1, C(i % 2 ? '#fff7ec' : '#f4f8ff'), { noTop: true, winScale: 1.25 });
    G.gable(x - 1.25, 1.7, -2.1, x + 1.25, 2.75, 0.1, roofC[i], 'x', PAL.white);
    G.box(x - 0.3, 0, -0.12, x + 0.3, 1.0, -0.06, PAL.navy2);
  });
  // park trees + street trees + left lawn trees
  [[9.6, -7.6], [12.4, -6.1], [15.2, -7.7], [18.4, -6.2], [19.4, -7.9]].forEach(([x, z]) => tree(G, x, z, 0.95, 0.05));
  G.box(10.6, 0.05, -7.4, 14.2, 0.08, -6.4, C('#9fd9f7'));
  [[-28.4, -9.0], [-28.4, -12.4], [-28.5, -16.2], [-12.5, 12.0], [-17, 13.6], [-21.5, 12.4], [-26, 14.6], [-25, 10.8], [-15, 17.6], [-20.5, 17.8], [28.2, 1.2], [27.9, -18.6], [2.6, -6.4], [2.6, -2.4], [25.4, -2.6]].forEach(([x, z], i) => tree(G, x, z, 0.8 + (i % 3) * 0.12));
  return { G, W, loop, vanLoop, crane: cr };
}

/* ------------------------------------------------------------------ moving things */
function vehicleGeo(kind, col, cargo) {
  const G = new Geo();
  if (kind === 'truck') {
    G.box(-0.55, 0.35, -2.6, 0.55, 0.62, 2.4, PAL.dark);
    G.box(-0.66, 0.62, -2.75, 0.66, 2.02, 0.95, cargo, { ribs: 'all', rib: 5.2, top: cargo.clone().lerp(PAL.white, 0.2) });
    G.box(-0.66, 0.5, 1.1, 0.66, 2.0, 2.45, col, { top: col.clone().lerp(PAL.white, 0.15) });
    G.box(-0.6, 1.35, 2.44, 0.6, 1.85, 2.49, PAL.glass);
    G.box(-0.67, 1.4, 1.5, 0.67, 1.8, 2.2, PAL.glass, { noTop: true });
    for (const z of [-2.1, -1.3, 1.75]) { G.box(-0.74, 0, z - 0.3, -0.5, 0.6, z + 0.3, PAL.dark); G.box(0.5, 0, z - 0.3, 0.74, 0.6, z + 0.3, PAL.dark); }
  } else if (kind === 'van') {
    G.box(-0.62, 0.3, -1.3, 0.62, 1.55, 0.9, PAL.white, { top: C('#f1f4fb') });
    G.box(-0.62, 0.3, 0.9, 0.62, 1.15, 1.5, PAL.white);
    G.box(-0.58, 1.15, 0.9, 0.58, 1.5, 1.2, PAL.glass, { top: PAL.white });
    G.box(-0.63, 0.78, -1.3, 0.63, 0.95, 1.5, PAL.coral, { noTop: true });
    for (const z of [-0.85, 1.05]) { G.box(-0.7, 0, z - 0.26, -0.48, 0.52, z + 0.26, PAL.dark); G.box(0.48, 0, z - 0.26, 0.7, 0.52, z + 0.26, PAL.dark); }
  }
  return G.build();
}

function shipGroup(lite) {
  const G = new Geo();
  const x0 = -2.2, x1 = 16.6, z0 = 11.1, z1 = 16.7, yb = -0.9, yt = 1.5, zm = (z0 + z1) / 2;
  G.box(x0, yb, z0, x1, -0.42, z1, PAL.coral, { noTop: true });
  G.box(x0, -0.42, z0, x1, yt, z1, PAL.navy, { top: C('#d9e1f2') });
  G.box(x0, yt - 0.18, z0 - 0.01, x1, yt, z1 + 0.01, PAL.white, { noTop: true });
  // bow
  const bx = 20.2;
  G.quad([x1, yb, z1], [bx, yb, zm], [bx, yt + 0.3, zm], [x1, yt, z1], nrm([z1 - zm, 0, bx - x1]), PAL.navy);
  G.quad([bx, yb, zm], [x1, yb, z0], [x1, yt, z0], [bx, yt + 0.3, zm], nrm([zm - z0, 0, -(bx - x1)]), PAL.navy);
  G.tri([x1, yt, z0], [x1, yt, z1], [bx, yt + 0.3, zm], C('#d9e1f2'));
  G.quad([x1, yb, z1], [bx - 0.5, yb, zm + 0.1], [bx - 0.5, -0.42, zm + 0.1], [x1, -0.42, z1], nrm([z1 - zm, 0, bx - x1]), PAL.coral);
  // superstructure + funnel
  G.box(-1.8, yt, z0 + 0.5, 1.4, yt + 4.4, z1 - 0.5, PAL.white, { top: C('#eef2fb') });
  G.box(-1.85, yt + 3.4, z0 + 0.45, 1.45, yt + 3.9, z1 - 0.45, PAL.navy2, { noTop: true });
  G.box(-1.9, yt + 4.4, z0 + 0.2, 1.5, yt + 4.6, z1 - 0.2, PAL.white);
  G.box(-1.4, yt + 4.6, zm - 0.6, 0.0, yt + 6.2, zm + 0.6, PAL.coral, { top: PAL.navy });
  // deck containers
  let k = 0;
  const tiers = [[2, 3, 3, 2], [3, 3, 2, 3], [2, 3, 3, 3], [1, 2, 2, 2]];
  for (let b = 0; b < 4; b++) for (let r = 0; r < 4; r++) {
    const n = lite ? Math.min(2, tiers[b][r]) : tiers[b][r];
    if (b === 1 && r === 2) continue;   // the slot the crane fills
    for (let t = 0; t < n; t++) container(G, 3.8 + b * 3.6, yt + t * 1.33, z0 + 0.75 + r * 1.36, 'x', CONT_COLS[(k++ * 7 + b + r) % CONT_COLS.length]);
  }
  return G.build();
}

function craneParts() {
  const T = new Geo();
  T.box(-0.9, -0.5, -0.65, 0.9, 0.1, 0.65, PAL.navy2, { top: PAL.white });
  const S = new Geo();
  S.box(-1.85, -0.18, -0.68, 1.85, 0, 0.68, PAL.sand, { top: PAL.sand });
  const K = new Geo();
  container(K, 0, -1.32, 0, 'x', 'mint');
  return { trolley: T.build(), spreader: S.build(), box: K.build() };
}

function rtgGeo() {
  const G = new Geo();
  for (const z of [-18.2, -10.4]) {
    for (const x of [-1.1, 1.1]) G.box(x - 0.2, 0, z - 0.2, x + 0.2, 5.8, z + 0.2, PAL.mint, { top: PAL.mint });
    G.box(-1.3, 0, z - 0.35, 1.3, 0.5, z + 0.35, PAL.navy2);
  }
  G.box(-1.3, 5.8, -18.4, -0.9, 6.4, -10.2, PAL.mint);
  G.box(0.9, 5.8, -18.4, 1.3, 6.4, -10.2, PAL.mint);
  G.box(-1.3, 5.8, -18.6, 1.3, 7.1, -17.6, PAL.white, { top: C('#e8edf9') });
  G.box(-0.7, 5.3, -14.9, 0.7, 6.0, -13.7, PAL.navy2);
  return G.build();
}

function droneGeo() {
  const G = new Geo();
  G.box(-0.3, -0.1, -0.3, 0.3, 0.12, 0.3, PAL.white);
  G.geom(new THREE.BoxGeometry(1.9, 0.07, 0.12), PAL.navy2, TRS(0, 0.06, 0, Math.PI / 4));
  G.geom(new THREE.BoxGeometry(1.9, 0.07, 0.12), PAL.navy2, TRS(0, 0.06, 0, -Math.PI / 4));
  for (const [x, z] of [[0.67, 0.67], [-0.67, 0.67], [0.67, -0.67], [-0.67, -0.67]]) G.cbox(x, 0.06, z, 0.12, 0.16, 0.12, PAL.dark);
  G.box(-0.24, -0.82, -0.24, 0.24, -0.38, 0.24, PAL.sand);
  G.box(-0.02, -0.38, -0.02, 0.02, -0.1, 0.02, PAL.dark);
  return G.build();
}
function cloudGeo(seed) {
  const G = new Geo();
  const puffs = [[0, 0, 0, 1.6], [1.6, -0.2, 0.3, 1.2], [-1.5, -0.3, -0.2, 1.1], [0.6, 0.6, -0.5, 1.0], [-0.4, -0.2, 1.0, 0.9]];
  puffs.forEach(([x, y, z, r], i) => G.geom(new THREE.IcosahedronGeometry(r, 0), PAL.white, TRS(x, y, z, seed + i, 1.2, 0.8, 1)));
  return G.build();
}

/* ------------------------------------------------------------------ camera states */
const ZONES = {
  overview: { tx: 1.5, ty: 0, tz: -1, zoom: 1.0 },
  ware: { tx: -14.5, ty: 1.5, tz: -8.5, zoom: 2.05 },
  port: { tx: 8.5, ty: 2.5, tz: 10.5, zoom: 1.95 },
  city: { tx: 15, ty: 2.5, tz: -8.5, zoom: 2.15 }
};
function st(z, o) { return Object.assign({ fx: 0.5, fy: 0.5, pTruck: 0, pShip: 0, pVan: 0, pDock: 0, pCrane: 0, pHold: 0, pDrone: 0, pHouse: 0 }, ZONES[z], o); }
function makeStates(m) {
  const O = st('overview', { fx: m ? 0.5 : 0.69, fy: m ? 0.715 : 0.5, zoom: m ? 1.1 : 0.96, pTruck: 1, pShip: 1, pVan: 1 });
  const A = st('ware', { fx: m ? 0.5 : 0.675, fy: m ? 0.3 : 0.5, zoom: m ? 1.75 : 1.72, pDock: 1, pTruck: 1 });
  const B = st('port', { fx: m ? 0.5 : 0.675, fy: m ? 0.3 : 0.53, zoom: m ? 1.7 : 1.68, pShip: 1, pCrane: 1, pHold: 1 });
  const Cc = st('city', { fx: m ? 0.5 : 0.675, fy: m ? 0.3 : 0.53, zoom: m ? 1.8 : 1.8, pVan: 1, pDrone: 1, pHouse: 1 });
  return {
    hero: [[0, O], [0.38, O], [1, A]],
    features: [[0, A], [0.2, A], [0.4, B], [0.58, B], [0.78, Cc], [1, Cc]]
  };
}
const ease = (t) => t * t * (3 - 2 * t);
function sample(keys, p, out) {
  let i = 0; while (i < keys.length - 2 && p > keys[i + 1][0]) i++;
  const [p0, a] = keys[i], [p1, b] = keys[i + 1];
  const t = ease(Math.min(1, Math.max(0, (p - p0) / Math.max(1e-6, p1 - p0))));
  for (const k in a) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

/* ------------------------------------------------------------------ main */
export function initScene(canvas, opts) {
  const lite = opts.lite, mobile = opts.mobile;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 400);

  // lights: cool sky fill, warm sun from screen-left so shadows fall to the right
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c6ef, 1.55));
  const sun = new THREE.DirectionalLight(0xfff6ea, 1.75);
  sun.position.set(-26, 46, 30); sun.target.position.set(0, 0, 0);
  sun.castShadow = true;
  const sm = lite ? 1024 : 2048;
  sun.shadow.mapSize.set(sm, sm);
  Object.assign(sun.shadow.camera, { left: -44, right: 44, top: 40, bottom: -40, near: 10, far: 120 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04; sun.shadow.radius = lite ? 2 : 3;
  scene.add(sun, sun.target);

  const ribs = ribTexture(), wins = windowTexture(), water = waterTexture();
  const world = buildWorld(lite);
  const island = new THREE.Group(); scene.add(island);
  const matMain = new THREE.MeshLambertMaterial({ vertexColors: true, map: ribs });
  const mainMesh = new THREE.Mesh(world.G.build(), matMain);
  mainMesh.castShadow = mainMesh.receiveShadow = true;
  island.add(mainMesh);
  // facades: rebuild UVs so windows tile per bay
  const wg = world.W.build();
  {
    const P = wg.attributes.position.array, N = wg.attributes.normal.array, U = wg.attributes.uv.array;
    for (let i = 0, j = 0; i < P.length; i += 3, j += 2) {
      const nx = Math.abs(N[i]), nz = Math.abs(N[i + 2]);
      const along = nx > 0.5 ? P[i + 2] : P[i];
      U[j] = along / 1.55; U[j + 1] = P[i + 1] / 1.45 + 0.08;
      void nz;
    }
    wg.attributes.uv.needsUpdate = true;
  }
  const facade = new THREE.Mesh(wg, new THREE.MeshLambertMaterial({ vertexColors: true, map: wins }));
  facade.castShadow = facade.receiveShadow = true;
  island.add(facade);

  // water
  const wtop = new THREE.Mesh(new THREE.PlaneGeometry(30, 11.05), new THREE.MeshLambertMaterial({ map: water, color: 0xffffff }));
  wtop.rotation.x = -Math.PI / 2; wtop.position.set(9, -0.45, 14.475); wtop.receiveShadow = true; island.add(wtop);
  const wsideG = new Geo();
  wsideG.quad([-6, -1.5, 20], [24, -1.5, 20], [24, -0.45, 20], [-6, -0.45, 20], [0, 0, 1], C('#5bb3f5'));
  const wside = new THREE.Mesh(wsideG.build(), new THREE.MeshLambertMaterial({ vertexColors: true, map: ribs })); island.add(wside);

  // island shadow
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(78, 58), new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, opacity: 0.9 }));
  blob.rotation.x = -Math.PI / 2; blob.position.set(0, -13, 0); scene.add(blob);

  // ship
  const ship = new THREE.Mesh(shipGroup(lite), matMain); ship.castShadow = ship.receiveShadow = true; island.add(ship);
  // crane moving parts
  const cp = craneParts();
  const trolley = new THREE.Mesh(cp.trolley, matMain), spreader = new THREE.Mesh(cp.spreader, matMain), cbox = new THREE.Mesh(cp.box, matMain);
  [trolley, spreader, cbox].forEach(m => { m.castShadow = true; island.add(m); });
  const cableG = new THREE.BufferGeometry(); cableG.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(24), 3));
  const cables = new THREE.LineSegments(cableG, new THREE.LineBasicMaterial({ color: 0x24365f })); island.add(cables);
  // RTG
  const rtg = new THREE.Mesh(rtgGeo(), matMain); rtg.castShadow = true; island.add(rtg);
  // trucks on the loop, van on the block, drone above
  const trucks = [[PAL.navy, PAL.sand, 0.02, 'CF-20931'], [PAL.coral, PAL.white, 0.36, 'CF-20944'], [PAL.mint, PAL.sky, 0.68, 'CF-20958']].map(([c, k, o, id]) => {
    const m = new THREE.Mesh(vehicleGeo('truck', c, k), matMain); m.castShadow = true; island.add(m); return { m, o, id, u: o };
  });
  let pinTruck = 0;
  const van = new THREE.Mesh(vehicleGeo('van'), matMain); van.castShadow = true; island.add(van);
  const drone = new THREE.Mesh(droneGeo(), matMain); drone.castShadow = true; island.add(drone);
  const rotorG = new THREE.BoxGeometry(0.9, 0.02, 0.09);
  const rotors = [[0.67, 0.67], [-0.67, 0.67], [0.67, -0.67], [-0.67, -0.67]].map(([x, z]) => { const r = new THREE.Mesh(rotorG, new THREE.MeshLambertMaterial({ color: 0x24365f })); r.position.set(x, 0.17, z); drone.add(r); return r; });
  const dshadow = new THREE.Mesh(new THREE.CircleGeometry(0.9, 16), new THREE.MeshBasicMaterial({ color: 0x0b1b3f, transparent: true, opacity: 0.14, depthWrite: false }));
  dshadow.rotation.x = -Math.PI / 2; island.add(dshadow);
  // conveyor parcels
  const parcels = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.34, 0.42), new THREE.MeshLambertMaterial({ color: 0xe9b874 }), 6);
  parcels.castShadow = true; island.add(parcels);
  // rolling door
  const doorM = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.1, 0.05), new THREE.MeshLambertMaterial({ color: 0xd3dcf0 }));
  doorM.geometry.translate(0, -1.55, 0); doorM.position.set(-19, 3.7, -6.96); island.add(doorM);
  // clouds
  const clouds = lite ? [] : [[-20, 17, -8, 0.0], [10, 19, -16, 1.7], [24, 16, 6, 3.1]].map(([x, y, z, s]) => {
    const m = new THREE.Mesh(cloudGeo(s), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.94 }));
    m.position.set(x, y, z); m.userData.x0 = x; m.userData.s = s; scene.add(m); return m;
  });

  // pins
  const PINS = [
    { key: 'pTruck', html: '<i class="pd ok"></i><b>CF-20931</b><span>On time · ETA 16:40</span>', get: (v) => v.copy(trucks[pinTruck].m.position).add(V3(0, 3.2, 0)) },
    { key: 'pShip', html: '<i class="pd sky"></i><b>Maren Star</b><span>Berth 2 · unloading 412 TEU</span>', get: (v) => v.set(14.6, 5.6, 13.9) },
    { key: 'pVan', html: '<i class="pd ok"></i><b>Van 12</b><span>3 stops left · 14 min</span>', get: (v) => v.copy(van.position).add(V3(0, 2.4, 0)) },
    { key: 'pDock', html: '<i class="pd sand"></i><b>Dock 4</b><span>38 pallets scanned</span>', get: (v) => v.set(-12, 4.6, -6.6) },
    { key: 'pCrane', html: '<i class="pd ok"></i><b>CFLU 448210</b><span>Loaded · bay 06</span>', get: (v) => v.copy(cbox.position).add(V3(0, 0.6, 0)) },
    { key: 'pHold', html: '<i class="pd warn"></i><b>CF-21004</b><span>Customs hold · 6 h, customer notified</span>', get: (v) => v.set(21, 3.4, 6.4) },
    { key: 'pDrone', html: '<i class="pd coral"></i><b>Drone D-04</b><span>Drop in 2 min</span>', get: (v) => v.copy(drone.position).add(V3(0, 1.1, 0)) },
    { key: 'pHouse', html: '<i class="pd ok"></i><b>Delivered</b><span>Photo proof · 10:42</span>', get: (v) => v.set(21.6, 3.3, -1) }
  ];
  const pinEls = PINS.map(P => {
    const el = document.createElement('div'); el.className = 'pin';
    el.innerHTML = '<div class="pin-in">' + P.html + '</div><i class="pin-stem"></i>';
    opts.pinRoot.appendChild(el);
    return Object.assign({ el, v: new THREE.Vector3(), shown: false }, P);
  });
  function V3(x, y, z) { return new THREE.Vector3(x, y, z); }

  // state
  const states = makeStates(mobile);
  const cur = Object.assign({}, states.hero[0][1]), tgt = Object.assign({}, cur);
  let W = 1, H = 1, fitH = 72;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!mobile && !opts.embed) window.addEventListener('pointermove', (e) => { ptr.tx = e.clientX / W * 2 - 1; ptr.ty = e.clientY / H * 2 - 1; }, { passive: true });
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setSize(W, H, false);
    const aspect = W / H;
    fitH = Math.max(70, 82 / aspect);
  }
  resize(); window.addEventListener('resize', resize);

  const dir = new THREE.Vector3(1, 0.86, 1).normalize();
  let first = true, snap = true, lastMode = '', last = performance.now(), t = 0, intro = opts.instant ? 1 : 0;
  const introStart = performance.now() + 120;
  const tmpV = new THREE.Vector3(), qY = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);

  function placeOnCurve(mesh, curve, u, lift = 0) {
    curve.getPointAt(u, tmpV); mesh.position.set(tmpV.x, lift, tmpV.z);
    const tg = curve.getTangentAt(u);
    mesh.rotation.y = Math.atan2(tg.x, tg.z);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now; t += dt;
    const m = opts.getMode();
    if (m.mode === 'none') { snap = true; lastMode = 'none'; return; }
    if (m.mode !== lastMode) snap = true; lastMode = m.mode;
    sample(states[m.mode], m.p, tgt);
    if (snap) { Object.assign(cur, tgt); snap = false; }
    else { const k = 1 - Math.exp(-dt * 10); for (const key in tgt) cur[key] += (tgt[key] - cur[key]) * k; }

    // intro: the island floats up into place
    const ip = Math.min(1, Math.max(0, (now - introStart) / 1500)); intro = 1 - Math.pow(1 - ip, 3);
    island.position.y = (1 - intro) * -10 + Math.sin(t * 0.7) * 0.28;
    blob.material.opacity = 0.9 * intro;
    blob.scale.setScalar(1 + Math.sin(t * 0.7) * 0.01);

    // animate the world
    trucks.forEach((tr) => { tr.u = (tr.o + t * 0.0105) % 1; placeOnCurve(tr.m, world.loop, tr.u, 0.04); });
    const onFront = (u) => u > 0.03 && u < 0.37;
    if (!onFront(trucks[pinTruck].u)) {
      const nx = trucks.findIndex(tr => onFront(tr.u));
      if (nx >= 0 && nx !== pinTruck) { pinTruck = nx; const b = pinEls[0].el.querySelector('b'); if (b) b.textContent = trucks[nx].id; pinEls[0].shown = false; pinEls[0].el.classList.remove('on'); }
    }
    placeOnCurve(van, world.vanLoop, (t * 0.024) % 1, 0.05);
    ship.position.y = Math.sin(t * 0.9) * 0.07; ship.rotation.x = Math.sin(t * 0.6) * 0.006;
    rtg.position.x = -3.35 + Math.sin(t * 0.22) * 2.4;
    // drone: a lazy figure eight over the city
    const da = t * 0.32, dx = 14 + Math.sin(da) * 7.5, dz = -8.6 + Math.sin(da * 2) * 3.6, dy = 10.5 + Math.sin(t * 1.3) * 0.25;
    drone.position.set(dx, dy, dz);
    drone.rotation.y = Math.atan2(Math.cos(da) * 7.5, Math.cos(da * 2) * 7.2);
    drone.rotation.z = Math.cos(da) * 0.08;
    rotors.forEach((r, i) => { r.rotation.y = t * 40 * (i % 2 ? 1 : -1); });
    dshadow.position.set(dx, 0.09, dz);
    // conveyor parcels slide out of the side door into the box truck
    const dm = new THREE.Matrix4();
    for (let i = 0; i < 6; i++) {
      const u = ((t * 0.16 + i / 6) % 1);
      dm.makeTranslation(-9.0 + u * 5.2, 1.22, -9.75); parcels.setMatrixAt(i, dm);
    }
    parcels.instanceMatrix.needsUpdate = true;
    doorM.scale.y = 0.15 + 0.85 * (0.5 + 0.5 * Math.cos(t * 0.5));
    water.offset.x = (t * 0.012) % 1; water.offset.y = (t * 0.006) % 1;
    clouds.forEach(c => { c.position.x = ((c.userData.x0 + t * 0.6 + 40) % 80) - 40; c.position.y += Math.sin(t * 0.5 + c.userData.s) * 0.002; });

    // crane cycle: load the mint box from the quay to the ship, then back (12 s each way)
    const cyc = (t % 24) / 24, phase = cyc < 0.5 ? cyc * 2 : (cyc - 0.5) * 2, out = cyc < 0.5;
    const zQ = 6.5, zS = 11.1 + 0.75 + 2 * 1.36, yQ = 1.32, yS = 1.5 + 1.32, yTop = 7.6;
    const from = out ? [zQ, yQ] : [zS, yS], to = out ? [zS, yS] : [zQ, yQ];
    let tz, sy, carry;
    const seg = (a, b) => Math.min(1, Math.max(0, (phase - a) / (b - a)));
    if (phase < 0.12) { tz = from[0]; sy = yTop + (from[1] - yTop) * ease(seg(0, 0.12)); carry = false; }
    else if (phase < 0.25) { tz = from[0]; sy = from[1] + (yTop - from[1]) * ease(seg(0.12, 0.25)); carry = true; }
    else if (phase < 0.6) { tz = from[0] + (to[0] - from[0]) * ease(seg(0.25, 0.6)); sy = yTop; carry = true; }
    else if (phase < 0.74) { tz = to[0]; sy = yTop + (to[1] - yTop) * ease(seg(0.6, 0.74)); carry = true; }
    else if (phase < 0.86) { tz = to[0]; sy = to[1] + (yTop - to[1]) * ease(seg(0.74, 0.86)); carry = false; }
    else { tz = to[0] + (from[0] - to[0]) * ease(seg(0.86, 1)) * 0; sy = yTop; carry = false; }
    const cx = world.crane.x;
    trolley.position.set(world.crane.x, 8.6, tz);
    spreader.position.set(cx, sy + (carry ? 0 : 0), tz);
    if (carry) cbox.position.set(cx, sy, tz);
    else cbox.position.set(cx, (phase < 0.12 ? from[1] : to[1]), phase < 0.12 ? from[0] : to[0]);
    const cpos = cables.geometry.attributes.position.array;
    [[-1.4, -0.5], [1.4, -0.5], [-1.4, 0.5], [1.4, 0.5]].forEach(([ox, oz], i) => {
      cpos.set([world.crane.x + ox * 0.35, 8.1, tz + oz * 0.6, cx + ox, sy, tz + oz * 0.9], i * 6);
    });
    cables.geometry.attributes.position.needsUpdate = true;

    // camera
    ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 3); ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 3);
    const yaw = Math.sin(t * 0.08) * 0.03 + ptr.x * 0.035, d = dir.clone().applyAxisAngle(up, yaw);
    const T = tmpV.set(cur.tx, cur.ty, cur.tz);
    cam.position.copy(T).addScaledVector(d, 120); cam.lookAt(T);
    const aspect = W / H, hh = fitH / 2, hw = hh * aspect;
    cam.left = -hw; cam.right = hw; cam.top = hh; cam.bottom = -hh; cam.zoom = cur.zoom;
    cam.near = 1; cam.far = 320;
    cam.setViewOffset(W, H, -(cur.fx - 0.5) * W, -(cur.fy - 0.5) * H, W, H);
    cam.updateMatrixWorld();

    renderer.render(scene, cam);

    // pins
    for (const P of pinEls) {
      let a = cur[P.key] * intro;
      if (P.key === 'pTruck' && !onFront(trucks[pinTruck].u)) a = 0;
      const show = a > 0.5;
      if (show !== P.shown) { P.shown = show; P.el.classList.toggle('on', show); }
      if (a < 0.02) continue;
      P.get(P.v); P.v.y += island.position.y; P.v.project(cam);
      const x = (P.v.x * 0.5 + 0.5) * W, y = (-P.v.y * 0.5 + 0.5) * H;
      P.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    }
    if (first) { first = false; opts.onFirstFrame && opts.onFirstFrame(); }
  }
  requestAnimationFrame(frame);
  return { resize };
}
