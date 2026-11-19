// Pixelforge Arcade: the pixel world. Everything is drawn at low resolution and scaled by whole numbers.
import { PAL, FONT, sprite } from './sprites.js';

const HX = window.HX || { lite: false, device: 'desktop', embed: false, ready() {}, on() {} };
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (x, y) => (BAYER[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; };
const mod = (a, n) => ((a % n) + n) % n;

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909), (s >>>= 0) / 4294967296)); }

/* ---------- tiny drawing kit ---------- */
function kit(x) {
  const k = {
    rect(px, py, w, h, c) { x.fillStyle = c; x.fillRect(Math.round(px), Math.round(py), w, h); },
    px(px, py, c) { x.fillStyle = c; x.fillRect(Math.round(px), Math.round(py), 1, 1); },
    disc(cx, cy, r, c) {
      x.fillStyle = c;
      for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(r * r - dy * dy + r * 0.8)); x.fillRect(Math.round(cx - dx), Math.round(cy + dy), dx * 2 + 1, 1); }
    },
    dither(px, py, w, h, c, dens) {
      x.fillStyle = c;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const gx = Math.round(px) + i, gy = Math.round(py) + j; if (bay(gx, gy) < dens) x.fillRect(gx, gy, 1, 1); }
    },
    text(str, px, py, c, glow) {
      let cx = Math.round(px);
      for (const ch of str.toUpperCase()) {
        const g = FONT[ch] || FONT[' '];
        for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) {
          if (g[j * 3 + i] === '1') {
            if (glow) { x.fillStyle = glow; x.fillRect(cx + i - 1, py + j, 3, 1); x.fillRect(cx + i, py + j - 1, 1, 3); }
          }
        }
        for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (g[j * 3 + i] === '1') { x.fillStyle = c; x.fillRect(cx + i, py + j, 1, 1); }
        cx += 4;
      }
    },
    tw: (str) => str.length * 4 - 1,
    spr(name, px, py, flip) { x.drawImage(sprite(name, flip), Math.round(px), Math.round(py)); }
  };
  return k;
}

/* ---------- palettes ---------- */
const NIGHT = [[0, '#07031a'], [0.3, '#0e0726'], [0.52, '#140b2e'], [0.72, '#24124a'], [0.86, '#3a1d6e'], [1, '#55288f']];
const DAWN = [[0, '#1a1145'], [0.3, '#3a2a7a'], [0.52, '#7a3f8f'], [0.7, '#c4557f'], [0.85, '#ff8a5c'], [1, '#ffd36a']];

export function startWorld(canvas, hooks = {}) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const K = kit(ctx);
  let S = 4, W = 320, H = 200, GY = 170, CX = 90;
  let sky = null, dawnSky = null, far = null, mid = null, ground = null, moonC = null;
  let stars = [], clouds = [], windowsLit = [], antennas = [];
  const FARW = 520, MIDW = 760, GTW = 32;

  /* ---- static layers ---- */
  function genSky(stops) {
    const c = mk(W, H), x = c.getContext('2d'), img = x.createImageData(W, H);
    const cs = stops.map(([t, h]) => [t, hex(h)]);
    const horizon = GY / H;
    for (let y = 0; y < H; y++) {
      const t = Math.min(1, (y / H) / horizon);
      let i = 0; while (i < cs.length - 2 && t > cs[i + 1][0]) i++;
      const f = (t - cs[i][0]) / (cs[i + 1][0] - cs[i][0]);
      for (let xx = 0; xx < W; xx++) {
        const col = f > bay(xx, y) ? cs[i + 1][1] : cs[i][1];
        const o = (y * W + xx) * 4; img.data[o] = col[0]; img.data[o + 1] = col[1]; img.data[o + 2] = col[2]; img.data[o + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);
    return c;
  }
  function genMoon() {
    const R = S === 4 ? 12 : 10, c = mk(R * 2 + 14, R * 2 + 14), x = c.getContext('2d'), k = kit(x), o = R + 7;
    // glow ring, dithered
    for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) {
      const d = Math.hypot(xx - o, y - o);
      if (d > R + 0.5 && d < R + 6) { const dens = (1 - (d - R) / 6) * 0.55; if (bay(xx, y) < dens) { x.fillStyle = d < R + 3 ? '#5a3a8e' : '#3f2670'; x.fillRect(xx, y, 1, 1); } }
    }
    k.disc(o, o, R, '#fff3c4');
    k.disc(o + 3, o + 3, R - 3, '#fff3c4');
    // terminator shade
    for (let y = -R; y <= R; y++) for (let xx = -R; xx <= R; xx++) {
      if (xx * xx + y * y <= R * R && (xx + 4) * (xx + 4) + (y + 3) * (y + 3) > (R + 1) * (R + 1)) { x.fillStyle = '#e3c27a'; x.fillRect(o + xx, o + y, 1, 1); }
    }
    [[-4, -3, 3], [3, 2, 2], [-1, 5, 2], [5, -5, 1], [-6, 3, 1]].forEach(([dx, dy, r]) => { k.disc(o + dx, o + dy, r, '#ecd89c'); k.px(o + dx - r + 1, o + dy - r + 1, '#fffbe6'); });
    return c;
  }
  function genFar() {
    const c = mk(FARW, H), x = c.getContext('2d'), k = kit(x), r = rng(7);
    const base = GY + 1, col = '#1d0f42', hi = '#2a1658';
    // distant glass towers
    for (let i = 0; i < 9; i++) {
      const w = 10 + Math.floor(r() * 14), h = 30 + Math.floor(r() * (S === 4 ? 44 : 56)), px = Math.floor(r() * (FARW - w));
      k.rect(px, base - h, w, h, '#1a0d3c'); k.rect(px, base - h, 1, h, '#26144f');
      for (let wy = base - h + 3; wy < base - 4; wy += 4) for (let wx = px + 2; wx < px + w - 2; wx += 3) if (r() < 0.16) k.px(wx, wy, r() < 0.6 ? '#5b2d9e' : '#8f6ad8');
      if (r() < 0.5) { k.rect(px + Math.floor(w / 2), base - h - 6, 1, 6, '#26144f'); }
    }
    // Deccan boulder piles
    const piles = [[40, 1], [170, 0.8], [250, 1.2], [430, 0.9]];
    piles.forEach(([px, s]) => {
      const rr = [[0, 0, 9], [12, -2, 11], [24, 1, 8], [7, -12, 7], [17, -15, 6], [30, -6, 6]];
      rr.forEach(([dx, dy, rad]) => { k.disc(px + dx * s, base - 6 + dy * s, Math.round(rad * s), col); });
      rr.forEach(([dx, dy, rad]) => { const R2 = Math.round(rad * s); k.rect(px + dx * s - R2 * 0.4, base - 6 + dy * s - R2 + 1, Math.max(1, Math.round(R2 * 0.6)), 1, hi); });
    });
    // Charminar silhouette
    const cx = 340, cw = 34, top = base - 34;
    k.rect(cx, top + 6, cw, 34, col);
    [[cx - 2], [cx + cw - 2]].forEach(([mx]) => {
      k.rect(mx, top - 18, 4, 58, col);
      k.rect(mx - 1, top - 2, 6, 2, hi); k.rect(mx - 1, top - 12, 6, 2, hi);
      k.disc(mx + 1.5, top - 20, 2, col); k.px(mx + 1, top - 24, col); k.px(mx + 2, top - 24, col);
    });
    for (let a = 0; a < 3; a++) { const ax = cx + 6 + a * 9; k.rect(ax, top + 18, 5, 22, '#140a33'); k.disc(ax + 2, top + 18, 2, '#140a33'); }
    k.rect(cx + 2, top + 4, cw - 4, 2, hi);
    k.rect(cx + 8, top + 1, cw - 16, 3, col);
    // ground haze line
    k.rect(0, base - 1, FARW, 2, '#24124a');
    return c;
  }
  function genMid() {
    const c = mk(MIDW, H), x = c.getContext('2d'), k = kit(x), r = rng(19);
    const base = GY + 1;
    windowsLit = []; antennas = [];
    let px = 0;
    const maxH = Math.min(Math.round(GY * 0.42), 96);
    while (px < MIDW - 20) {
      const w = 26 + Math.floor(r() * 34), h = 26 + Math.floor(Math.pow(r(), 1.3) * (maxH - 26)), gap = r() < 0.45 ? 8 + Math.floor(r() * 26) : 0;
      if (px + w > MIDW) break;
      const body = ['#2b1655', '#33195f', '#26124d', '#2f1659'][Math.floor(r() * 4)];
      k.rect(px, base - h, w, h, body);
      k.rect(px, base - h, 1, h, '#3f2474');
      k.rect(px, base - h, w, 1, '#46297e');
      // windows
      const ww = 2, wh = 3;
      for (let wy = base - h + 5; wy < base - 6; wy += 6) {
        for (let wx = px + 3; wx < px + w - 3; wx += 5) {
          const lit = r() < 0.3;
          const colr = lit ? (r() < 0.62 ? '#ffd34d' : r() < 0.5 ? '#ff5fa2' : '#6ff3ff') : '#1c0d3a';
          k.rect(wx, wy, ww, wh, colr);
          if (lit && colr === '#ffd34d') k.px(wx, wy, '#fff1b0');
          if (r() < 0.06) windowsLit.push({ x: wx, y: wy, c: lit ? '#1c0d3a' : '#ffd34d', on: lit, t: r() * 8, p: 2 + r() * 6 });
        }
      }
      // rooftop details
      const roll = r();
      if (roll < 0.35) { const tx = px + 4 + Math.floor(r() * (w - 14)); k.rect(tx, base - h - 7, 8, 6, '#3d2670'); k.rect(tx, base - h - 8, 8, 1, '#56388f'); k.rect(tx + 1, base - h - 1, 1, 1, '#3d2670'); k.rect(tx + 6, base - h - 1, 1, 1, '#3d2670'); }
      else if (roll < 0.7) { const ax = px + 3 + Math.floor(r() * (w - 6)); const ah = 8 + Math.floor(r() * 10); k.rect(ax, base - h - ah, 1, ah, '#4b3384'); antennas.push({ x: ax, y: base - h - ah - 1, p: r() * 3 }); }
      else if (roll < 0.85 && w > 34) { const bx = px + 4; k.rect(bx, base - h - 12, w - 8, 10, '#1a0d33'); k.rect(bx, base - h - 12, w - 8, 1, '#ff5fa2'); k.rect(bx, base - h - 3, w - 8, 1, '#b8306f'); k.text(['GG', 'LVL UP', 'PLAY', '1UP'][Math.floor(r() * 4)].slice(0, Math.floor((w - 12) / 4)), bx + 3, base - h - 10, '#6ff3ff'); k.rect(bx + 3, base - h - 2, 1, 2, '#4b3384'); k.rect(bx + w - 12, base - h - 2, 1, 2, '#4b3384'); }
      px += w + gap;
    }
    return c;
  }
  function genGround() {
    const c = mk(GTW, H - GY), x = c.getContext('2d'), k = kit(x), h = H - GY;
    k.rect(0, 0, GTW, h, '#2a1457');
    k.rect(0, 0, GTW, 1, '#a988ff');
    k.rect(0, 1, GTW, 2, '#6b44c4');
    k.rect(0, 3, GTW, 1, '#160828');
    for (let row = 0; row * 7 + 4 < h; row++) {
      const y = 4 + row * 7, off = row % 2 ? 8 : 0;
      k.rect(0, y + 6, GTW, 1, '#1b0c3d');
      for (let bx = -16 + off; bx < GTW; bx += 16) { k.rect(bx + 15, y, 1, 6, '#1b0c3d'); k.rect(bx + 1, y, 13, 1, '#35196a'); }
    }
    k.dither(0, Math.max(4, h - 18), GTW, 18, '#140a30', 0.5);
    return c;
  }

  /* ---- props by level ---- */
  const LEVEL_PROPS = {
    1: ['arcade', 'lamp', 'tree', 'neonOpen', 'lamp', 'bench', 'tree', 'neonGG'],
    2: ['billboard', 'tower', 'lamp', 'billboard', 'neonGG', 'tower'],
    3: ['shop', 'lamp', 'neonPass', 'tree', 'shop'],
    4: ['arena', 'bunting', 'crowd', 'trophy', 'bunting', 'crowd'],
    5: ['chai', 'lamp', 'rolls', 'tree', 'chai', 'neonChai'],
    6: ['arcade', 'lamp', 'neonBook', 'tree'],
    7: ['lamp', 'tree', 'bench']
  };
  const PROP_W = { arcade: 104, lamp: 12, tree: 16, neonOpen: 24, neonGG: 18, bench: 18, billboard: 40, tower: 18, shop: 46, neonPass: 48, arena: 96, bunting: 54, crowd: 56, trophy: 22, chai: 50, rolls: 46, neonChai: 28, neonBook: 36 };
  let props = [], coins = [], bugs = [], parts = [], nextProp = 40, nextCoin = 140, nextBug = 380, dash = 0, started = false;
  let level = 1, levelQueue = 0, propIdx = 0;
  const rr = rng(42);

  function drawProp(p, sx, t) {
    const g = GY, k = K;
    switch (p.type) {
      case 'lamp': {
        k.rect(sx + 2, g - 36, 2, 36, '#5e5878'); k.rect(sx + 2, g - 36, 1, 36, '#a39cc2');
        k.rect(sx + 2, g - 37, 8, 2, '#5e5878'); k.rect(sx + 7, g - 36, 5, 3, '#2a2440'); k.rect(sx + 8, g - 33, 3, 1, '#ffd34d');
        for (let j = 0; j < 30; j++) { const half = Math.floor(j * 0.42) + 1; k.dither(sx + 9 - half, g - 32 + j, half * 2 + 1, 1, '#ffd34d', 0.12 + (j / 30) * 0.08); }
        k.dither(sx - 6, g - 1, 30, 1, '#ffe08a', 0.5);
        k.rect(sx + 1, g - 2, 4, 2, '#3d3657');
        break;
      }
      case 'tree': {
        k.rect(sx + 4, g - 6, 8, 6, '#8a5a3c'); k.rect(sx + 4, g - 6, 8, 1, '#b8743a');
        k.rect(sx + 7, g - 14, 2, 8, '#5c3624');
        k.disc(sx + 8, g - 20, 7, '#1d5e47'); k.disc(sx + 6, g - 22, 4, '#2a7d5c'); k.px(sx + 4, g - 24, '#3aa877'); k.px(sx + 5, g - 25, '#3aa877');
        break;
      }
      case 'bench': {
        k.rect(sx, g - 7, 18, 2, '#8a5a3c'); k.rect(sx, g - 11, 18, 2, '#8a5a3c'); k.rect(sx + 1, g - 5, 1, 5, '#5c3624'); k.rect(sx + 16, g - 5, 1, 5, '#5c3624');
        break;
      }
      case 'neonOpen': case 'neonGG': case 'neonChai': case 'neonPass': case 'neonBook': {
        const txt = { neonOpen: 'OPEN', neonGG: 'GG', neonChai: 'CHAI', neonPass: 'NIGHT', neonBook: 'BOOK' }[p.type];
        const col = { neonOpen: '#ff5fa2', neonGG: '#3dff8a', neonChai: '#ffd34d', neonPass: '#6ff3ff', neonBook: '#3dff8a' }[p.type];
        const tw = K.tw(txt), bw = tw + 8, by = g - 32;
        k.rect(sx + Math.floor(bw / 2) - 1, by + 11, 2, 21, '#4b3384');
        k.rect(sx, by, bw, 11, '#160828'); k.rect(sx, by, bw, 1, '#4b3384'); k.rect(sx, by + 10, bw, 1, '#4b3384');
        const flick = (Math.sin(t * 13 + p.seed * 7) > 0.96) ? 0 : 1;
        if (flick) K.text(txt, sx + 4, by + 3, col, col === '#3dff8a' ? 'rgba(61,255,138,.28)' : col === '#ff5fa2' ? 'rgba(255,95,162,.28)' : col === '#ffd34d' ? 'rgba(255,211,77,.28)' : 'rgba(111,243,255,.28)');
        else K.text(txt, sx + 4, by + 3, '#3a2a5a');
        break;
      }
      case 'arcade': {
        const w = 104, h = 74, top = g - h;
        k.rect(sx, top, w, h, '#2e1a5c'); k.rect(sx, top, w, 1, '#56388f'); k.rect(sx, top, 1, h, '#3f2474');
        // big sign
        const sign = 'PIXELFORGE', tw = K.tw(sign) * 2 + 1;
        k.rect(sx + 8, top - 18, w - 16, 16, '#160828'); k.rect(sx + 8, top - 18, w - 16, 1, '#3dff8a'); k.rect(sx + 8, top - 3, w - 16, 1, '#14b45c');
        const on = Math.sin(t * 2.1 + 1) > -0.95;
        let lx = sx + Math.floor((w - tw) / 2);
        for (const ch of sign) {
          const gph = FONT[ch];
          for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (gph[j * 3 + i] === '1') {
            ctx.fillStyle = 'rgba(61,255,138,.25)'; ctx.fillRect(lx + i * 2 - 1, top - 15 + j * 2 - 1, 4, 4);
          }
          for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (gph[j * 3 + i] === '1') { ctx.fillStyle = on ? '#b8ffd6' : '#3dff8a'; ctx.fillRect(lx + i * 2, top - 15 + j * 2, 2, 2); }
          lx += 8;
        }
        k.rect(sx + 14, top - 2, 1, 2, '#4b3384'); k.rect(sx + w - 15, top - 2, 1, 2, '#4b3384');
        // awning
        for (let i = 0; i < w - 8; i += 6) { k.rect(sx + 4 + i, top + 8, 3, 5, '#3dff8a'); k.rect(sx + 7 + i, top + 8, 3, 5, '#160828'); }
        k.rect(sx + 4, top + 13, w - 8, 1, '#14b45c');
        // windows with screens
        [[sx + 6, 34], [sx + w - 40, 34]].forEach(([wx, ww], wi) => {
          k.rect(wx, top + 20, ww, 30, '#0c0620'); k.rect(wx, top + 20, ww, 1, '#56388f');
          for (let m = 0; m < 3; m++) {
            const mx = wx + 3 + m * 11, cols = ['#6ff3ff', '#ff5fa2', '#3dff8a'];
            k.rect(mx, top + 26, 9, 7, '#160828'); k.rect(mx + 1, top + 27, 7, 5, cols[(m + wi) % 3]);
            const scan = Math.floor((t * 6 + m * 2) % 5); k.rect(mx + 1, top + 27 + scan, 7, 1, '#ffffff');
            k.rect(mx + 4, top + 33, 1, 2, '#3d3657');
            k.rect(mx + 2, top + 38, 5, 5, '#1d0f40'); k.disc(mx + 4, top + 37, 2, '#1d0f40');
          }
          k.rect(wx, top + 44, ww, 6, '#1a0d33');
        });
        // door
        const dx = sx + 44;
        k.rect(dx, top + 26, 16, h - 26, '#160828'); k.rect(dx - 1, top + 25, 18, 1, '#ff5fa2'); k.rect(dx - 1, top + 25, 1, h - 25, '#ff5fa2'); k.rect(dx + 16, top + 25, 1, h - 25, '#ff5fa2');
        k.rect(dx + 2, top + 30, 12, 6, '#2a1457'); K.text('OPEN', dx + 1, top + 31, '#ffd34d');
        k.dither(dx - 8, g - 1, 32, 1, '#ff5fa2', 0.55);
        break;
      }
      case 'billboard': {
        k.rect(sx + 18, g - 26, 3, 26, '#5e5878'); k.rect(sx + 18, g - 26, 1, 26, '#a39cc2');
        k.rect(sx, g - 50, 40, 26, '#5e5878'); k.rect(sx + 2, g - 48, 36, 22, '#0c0620');
        const msgs = ['240HZ', '1 MS', 'GG WP'], m = msgs[Math.floor(t / 2.2 + p.seed) % 3];
        K.text(m, sx + 20 - Math.floor(K.tw(m) / 2), g - 42, '#6ff3ff', 'rgba(111,243,255,.22)');
        for (let i = 0; i < 36; i += 2) k.px(sx + 2 + i, g - 30, (Math.floor(t * 8) + i) % 6 < 3 ? '#ff5fa2' : '#3dff8a');
        k.rect(sx + 2, g - 48 + Math.floor((t * 20) % 22), 36, 1, 'rgba(255,255,255,.12)');
        break;
      }
      case 'tower': {
        k.rect(sx, g - 30, 16, 30, '#1e1a33'); k.rect(sx, g - 30, 16, 1, '#5e5878'); k.rect(sx + 2, g - 27, 12, 20, '#0c0620');
        [g - 24, g - 15].forEach((fy, i) => {
          const hue = ['#ff5fa2', '#3dff8a', '#6ff3ff', '#ffd34d'][(Math.floor(t * 3) + i) % 4];
          k.disc(sx + 8, fy, 3, hue); k.disc(sx + 8, fy, 1, '#0c0620');
          if (Math.floor(t * 12) % 2) { k.px(sx + 8, fy - 3, '#0c0620'); k.px(sx + 8, fy + 3, '#0c0620'); } else { k.px(sx + 5, fy, '#0c0620'); k.px(sx + 11, fy, '#0c0620'); }
        });
        k.rect(sx + 3, g - 5, 4, 1, '#3dff8a');
        k.dither(sx - 4, g - 1, 24, 1, '#6ff3ff', 0.4);
        break;
      }
      case 'shop': {
        const w = 46, h = 36, top = g - h;
        k.rect(sx, top, w, h, '#33195f'); k.rect(sx, top, w, 1, '#56388f');
        for (let i = 0; i < w; i += 6) { k.rect(sx + i, top - 6, 3, 6, '#ffd34d'); k.rect(sx + i + 3, top - 6, 3, 6, '#ff5fa2'); }
        k.rect(sx + 4, top + 6, w - 8, 18, '#0c0620');
        k.spr('coin' + (1 + Math.floor(t * 6) % 3), sx + 8, top + 11);
        K.text('X99', sx + 18, top + 13, '#ffd34d');
        k.rect(sx + 4, top + 26, w - 8, 2, '#5c3624');
        break;
      }
      case 'arena': {
        const w = 96, h = 58, top = g - h;
        k.rect(sx, top, w, h, '#1e1040'); k.rect(sx, top, w, 1, '#56388f');
        for (let i = 0; i < 4; i++) { const ang = Math.sin(t * 1.2 + i * 1.7) * 14; for (let j = 0; j < 40; j++) { const bw = 1 + Math.floor(j / 6); k.dither(sx + 12 + i * 24 + Math.round(ang * j / 40) - bw, top - 40 + j, bw * 2 + 1, 1, '#ffd34d', 0.1); } }
        k.rect(sx + 8, top + 8, w - 16, 20, '#0c0620'); k.rect(sx + 8, top + 8, w - 16, 1, '#ff5fa2');
        K.text('FINALS', sx + 48 - Math.floor(K.tw('FINALS') / 2), top + 12, '#ffd34d', 'rgba(255,211,77,.25)');
        K.text('FRI 8PM', sx + 48 - Math.floor(K.tw('FRI 8PM') / 2), top + 20, '#6ff3ff');
        for (let i = 0; i < 6; i++) k.rect(sx + 6 + i * 15, top + 34, 9, h - 34, '#160828');
        break;
      }
      case 'bunting': {
        k.rect(sx, g - 30, 2, 30, '#5e5878'); k.rect(sx + 52, g - 30, 2, 30, '#5e5878');
        const cols = ['#ff5fa2', '#3dff8a', '#ffd34d', '#6ff3ff'];
        for (let i = 0; i < 10; i++) {
          const fx = sx + 3 + i * 5, sag = Math.round(Math.sin((i / 9) * Math.PI) * 5), fy = g - 29 + sag;
          k.px(fx, fy - 1, '#a39cc2'); k.px(fx + 1, fy - 1, '#a39cc2');
          const c = cols[i % 4]; k.rect(fx, fy, 3, 1, c); k.rect(fx, fy + 1, 2, 1, c); k.px(fx, fy + 2, c);
        }
        break;
      }
      case 'crowd': {
        for (let i = 0; i < 9; i++) {
          const hx = sx + 2 + i * 6, bob = Math.round(Math.max(0, Math.sin(t * 7 + i * 1.3)) * 2), hy = g - 11 - bob;
          k.rect(hx, hy + 4, 5, 7 + bob, '#160828'); k.disc(hx + 2, hy + 1, 2, '#160828');
          if ((i + Math.floor(t * 2)) % 4 === 0) { k.rect(hx - 1, hy - 4, 1, 6, '#160828'); k.px(hx - 1, hy - 5, ['#3dff8a', '#ff5fa2', '#ffd34d'][i % 3]); }
        }
        break;
      }
      case 'trophy': {
        k.rect(sx + 2, g - 12, 18, 12, '#4a3bb8'); k.rect(sx + 2, g - 12, 18, 1, '#7b6cf0');
        k.spr('trophy', sx + 3, g - 28 - Math.round(Math.sin(t * 3) * 1));
        if (Math.floor(t * 5) % 3 === 0) k.px(sx + 16, g - 26, '#ffffff');
        break;
      }
      case 'chai': case 'rolls': {
        const w = 46, top = g - 20;
        k.rect(sx + 2, top, w - 4, 14, '#8a5a3c'); k.rect(sx + 2, top, w - 4, 1, '#b8743a'); k.rect(sx + 2, top + 13, w - 4, 1, '#5c3624');
        for (let i = 0; i < w; i += 6) { k.rect(sx + i, top - 16, 3, 5, p.type === 'chai' ? '#ff5fa2' : '#3dff8a'); k.rect(sx + i + 3, top - 16, 3, 5, '#ffffff'); }
        k.rect(sx + 2, top - 11, 1, 11, '#5e5878'); k.rect(sx + w - 3, top - 11, 1, 11, '#5e5878');
        k.disc(sx + 10, g - 4, 3, '#2a2440'); k.disc(sx + 36, g - 4, 3, '#2a2440'); k.px(sx + 10, g - 4, '#a39cc2'); k.px(sx + 36, g - 4, '#a39cc2');
        const label = p.type === 'chai' ? 'CHAI 40' : 'ROLLS';
        k.rect(sx + 6, top + 3, K.tw(label) + 4, 7, '#160828'); K.text(label, sx + 8, top + 4, '#ffd34d');
        if (p.type === 'chai') {
          k.rect(sx + 34, top - 6, 7, 6, '#a39cc2'); k.rect(sx + 41, top - 5, 2, 2, '#a39cc2'); k.rect(sx + 35, top - 7, 5, 1, '#5e5878');
          for (let s2 = 0; s2 < 3; s2++) { const ph = (t * 0.8 + s2 / 3) % 1; k.px(sx + 37 + Math.round(Math.sin(ph * 6 + s2) * 1.5), top - 9 - Math.floor(ph * 12), ph < 0.7 ? '#e8e0ff' : '#8f6ad8'); }
        } else {
          k.rect(sx + 30, top - 3, 12, 3, '#2a2440'); k.dither(sx + 30, top - 6, 12, 3, '#ff9a3d', 0.4 + 0.2 * Math.sin(t * 9));
        }
        break;
      }
    }
  }

  function spawn(t) {
    const right = wx + W + 60;
    while (nextProp < right) {
      const list = LEVEL_PROPS[level] || LEVEL_PROPS[1];
      let type = list[propIdx % list.length];
      if (levelQueue) { type = list[0]; levelQueue = 0; propIdx = 0; }
      propIdx++;
      props.push({ type, x: nextProp, seed: rr() * 10 });
      nextProp += PROP_W[type] + 14 + Math.floor(rr() * 34);
    }
    while (nextCoin < right) {
      const pattern = rr();
      const n = 3 + Math.floor(rr() * 3);
      for (let i = 0; i < n; i++) {
        const f = n > 1 ? i / (n - 1) : 0;
        const hgt = pattern < 0.55 ? 14 + Math.sin(f * Math.PI) * 18 : 10;
        coins.push({ x: nextCoin + i * 11, y: GY - 8 - hgt, got: 0 });
      }
      nextCoin += n * 11 + 60 + Math.floor(rr() * 90);
    }
    while (nextBug < right) {
      let ok = !coins.some((c) => Math.abs(c.x - nextBug) < 26 && !c.got);
      if (ok) bugs.push({ x: nextBug, dead: 0 });
      nextBug += 160 + Math.floor(rr() * 200);
    }
    const left = wx - 140;
    props = props.filter((p) => p.x + (PROP_W[p.type] || 40) > left);
    coins = coins.filter((c) => c.x > left && c.got < 1);
    bugs = bugs.filter((b) => b.x > left && b.dead < 1);
  }

  /* ---- player ---- */
  const me = { y: 0, vy: 0, ground: true, dist: 0, land: 0 };
  let score = 4200, coinCount = 0, wx = 0, speed = 26, boost = 0, lastScroll = scrollY, dawn = 0, tPrev = performance.now(), t0 = tPrev, frames = 0;

  function seedHero() {
    if (started) return; started = true;
    if (W < 200) {
      props.push({ type: 'lamp', x: Math.round(W * 0.08), seed: 2 });
      props.push({ type: 'tree', x: Math.round(W * 0.62), seed: 1 });
      nextProp = Math.round(W * 0.62) + 40; propIdx = 1;
    } else {
      props.push({ type: 'tree', x: Math.round(W * 0.04), seed: 1 });
      props.push({ type: 'lamp', x: Math.round(W * 0.16), seed: 2 });
      props.push({ type: 'neonGG', x: Math.round(W * 0.47), seed: 4 });
      props.push({ type: 'arcade', x: Math.round(W * 0.64), seed: 3 });
      nextProp = Math.round(W * 0.64) + 104 + 20; propIdx = 1;
    }
  }
  function resize() {
    const vw = innerWidth, vh = innerHeight;
    S = vw < 760 ? 3 : 4;
    W = Math.ceil(vw / S); H = Math.ceil(vh / S);
    GY = H - (vw < 760 ? 38 : 30);
    CX = Math.round(W * (vw < 760 ? 0.26 : 0.3));
    canvas.width = W; canvas.height = H;
    canvas.style.width = W * S + 'px'; canvas.style.height = H * S + 'px';
    ctx.imageSmoothingEnabled = false;
    sky = genSky(NIGHT); dawnSky = genSky(DAWN); far = genFar(); mid = genMid(); ground = genGround(); moonC = genMoon();
    const r = rng(3);
    stars = Array.from({ length: Math.round(W * GY / 260) }, () => ({ x: Math.floor(r() * W * 2), y: Math.floor(r() * GY * 0.72), k: r(), p: r() * 6.28, s: 0.6 + r() * 2.4 }));
    clouds = Array.from({ length: 3 }, (_, i) => ({ x: r() * W, y: 10 + Math.floor(r() * GY * 0.3), w: 24 + Math.floor(r() * 26), sp: 1.5 + r() * 2 }));
    me.y = GY;
  }

  function cloud(cx, cy, w) {
    const k = K;
    k.rect(cx + 6, cy - 2, w - 18, 1, '#3d2873');
    k.rect(cx, cy, w, 2, '#2c1b5c');
    k.rect(cx + 10, cy + 2, w - 14, 1, '#24164e');
    k.rect(cx + w * 0.4, cy - 4, w * 0.3, 2, '#2c1b5c'); k.rect(cx + w * 0.4, cy - 4, w * 0.3, 1, '#3d2873');
  }

  function frame(now) {
    const dt = Math.max(0, Math.min(0.05, (now - tPrev) / 1000)); tPrev = now;
    const t = (now - t0) / 1000;
    // scroll gives the runner a boost
    const sy = scrollY, sv = Math.abs(sy - lastScroll) / Math.max(dt, 0.001); lastScroll = sy;
    boost += (Math.min(260, sv * 0.14) - boost) * Math.min(1, dt * 6);
    dash = Math.max(0, dash - dt);
    const v = (level === 1 ? 18 : speed) + boost + dash * 300;
    wx += v * dt; me.dist += v * dt;
    spawn(t);

    // physics + simple auto-play
    if (me.ground) {
      const bug = bugs.find((b) => !b.dead && b.x - wx - CX > 4 && b.x - wx - CX < 10 + v * 0.16);
      const coin = coins.find((c) => !c.got && c.x - wx - CX > -2 && c.x - wx - CX < 12 + v * 0.12 && c.y < GY - 22);
      if (bug || coin) {
        const want = coin ? Math.max(20, GY - coin.y - 4) : 24;
        me.vy = -Math.sqrt(2 * 560 * want); me.ground = false;
      }
    } else {
      me.vy += 560 * dt; me.y += me.vy * dt;
      if (me.y >= GY) { me.y = GY; me.vy = 0; me.ground = true; me.land = 0.18; for (let i = 0; i < 3; i++) parts.push({ x: wx + CX + 4 + i * 3, y: GY - 1, vx: -10 - i * 8, vy: -8 - i * 4, life: 0.35, c: '#8f6ad8' }); }
    }
    me.land = Math.max(0, me.land - dt);
    const box = { x: wx + CX + 3, y: me.y - 18, w: 10, h: 18 };
    coins.forEach((c) => {
      if (!c.got && c.x < box.x + box.w && c.x + 8 > box.x && c.y < box.y + box.h && c.y + 8 > box.y) {
        c.got = 0.001; score += 100; coinCount++;
        for (let i = 0; i < 5; i++) parts.push({ x: c.x + 4, y: c.y + 4, vx: (i - 2) * 18, vy: -30 - i * 6, life: 0.4, c: i % 2 ? '#ffd34d' : '#ffffff' });
        hooks.onScore && hooks.onScore(score, coinCount);
      }
    });
    bugs.forEach((b) => {
      b.x -= 7 * dt;
      if (!b.dead && me.vy > 0 && b.x < box.x + box.w && b.x + 9 > box.x && GY - 8 < box.y + box.h) { b.dead = 0.001; me.vy = -150; score += 200; hooks.onScore && hooks.onScore(score, coinCount); }
      if (b.dead) b.dead += dt * 2.5;
    });
    coins.forEach((c) => { if (c.got) c.got += dt * 3; });
    parts.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 120 * dt; p.life -= dt; });
    parts = parts.filter((p) => p.life > 0);

    /* ---- draw ---- */
    ctx.globalAlpha = 1;
    ctx.drawImage(sky, 0, 0);
    if (dawn > 0.001) { ctx.globalAlpha = Math.min(1, dawn); ctx.drawImage(dawnSky, 0, 0); ctx.globalAlpha = 1; }
    // stars
    const starFade = 1 - Math.min(1, dawn * 1.3);
    if (starFade > 0) {
      for (const s of stars) {
        const x = mod(s.x - wx * 0.015, W * 2); if (x >= W) continue;
        const tw = Math.sin(t * s.s + s.p);
        if (s.k > 0.93) {
          if (tw > 0.2) { K.px(x, s.y, '#ffffff'); if (tw > 0.75) { K.px(x - 1, s.y, '#b9a8ff'); K.px(x + 1, s.y, '#b9a8ff'); K.px(x, s.y - 1, '#b9a8ff'); K.px(x, s.y + 1, '#b9a8ff'); } }
        } else if (tw > (s.k < 0.6 ? -0.4 : 0.1) && starFade > s.k * 0.6) K.px(x, s.y, s.k < 0.45 ? '#6f5aa8' : s.k < 0.8 ? '#c9c2ff' : '#ffd34d');
      }
    }
    // moon (sets at dawn), sun rises
    const mx = Math.round(W * (S === 4 ? 0.78 : 0.7)), my = Math.round(GY * (S === 4 ? 0.2 : 0.16) + dawn * GY * 0.9);
    if (dawn < 0.98) ctx.drawImage(moonC, mx - moonC.width / 2, my - moonC.height / 2);
    if (dawn > 0.02) {
      const sr = S === 4 ? 16 : 14, sx = Math.round(W * 0.5), syy = Math.round(GY + sr - dawn * (sr * 4.4));
      K.disc(sx, syy, sr + 3, 'rgba(255,211,77,.35)');
      K.disc(sx, syy, sr, '#ffd34d');
      for (let i = 0; i < 4; i++) K.rect(sx - sr, syy + 2 + i * 4, sr * 2 + 1, 1 + (i > 1 ? 1 : 0), '#ff9a3d');
    }
    // clouds
    clouds.forEach((c) => { const x = mod(c.x - t * c.sp - wx * 0.04, W + 80) - 60; cloud(x, c.y, c.w); });
    // far + mid parallax
    const fo = -mod(wx * 0.1, FARW); ctx.drawImage(far, Math.round(fo), 0); if (fo + FARW < W) ctx.drawImage(far, Math.round(fo + FARW), 0);
    const mo = -mod(wx * 0.33, MIDW); ctx.drawImage(mid, Math.round(mo), 0); if (mo + MIDW < W) ctx.drawImage(mid, Math.round(mo + MIDW), 0);
    for (const w of windowsLit) {
      const on = Math.sin(t / w.p * 6.28 + w.t) > 0.3;
      if (!on) continue;
      for (const base of [mo, mo + MIDW]) { const x = Math.round(base + w.x); if (x > -3 && x < W) K.rect(x, w.y, 2, 3, w.c); }
    }
    for (const a of antennas) { if (Math.sin(t * 3 + a.p) > 0.4) for (const base of [mo, mo + MIDW]) { const x = Math.round(base + a.x); if (x >= 0 && x < W) K.px(x, a.y, '#ff4a4a'); } }
    // dawn tints the city
    if (dawn > 0.01) { ctx.globalAlpha = dawn * 0.25; ctx.fillStyle = '#ff8a5c'; ctx.fillRect(0, 0, W, GY); ctx.globalAlpha = 1; }
    // street props
    for (const p of props) { const sx = Math.round(p.x - wx); if (sx < W + 4 && sx + (PROP_W[p.type] || 40) > -4) drawProp(p, sx, t); }
    // ground
    const go = -mod(wx, GTW);
    for (let x = Math.round(go); x < W; x += GTW) ctx.drawImage(ground, x, GY);
    // coins
    const cf = ['coin1', 'coin2', 'coin3', 'coin2'];
    coins.forEach((c) => {
      const sx = Math.round(c.x - wx);
      if (sx < -10 || sx > W) return;
      if (c.got) { const s2 = Math.round(c.got * 6); K.px(sx + 3, c.y - s2, '#ffffff'); K.px(sx + 6, c.y - s2 + 2, '#ffd34d'); return; }
      const fi = mod(Math.floor(t * 8 + c.x * 0.05), 4);
      K.spr(cf[fi], sx + (fi === 2 ? 0 : 0), c.y + Math.round(Math.sin(t * 4 + c.x) * 1), fi === 3);
    });
    // bugs
    bugs.forEach((b) => {
      const sx = Math.round(b.x - wx);
      if (sx < -12 || sx > W) return;
      if (b.dead) { K.rect(sx, GY - 2, 9, 2, '#b8306f'); return; }
      K.spr(Math.floor(t * 6) % 2 ? 'bug1' : 'bug2', sx, GY - 8);
    });
    // player
    const runF = ['run1', 'run2', 'run3', 'run4'][mod(Math.floor(me.dist / 7), 4)];
    const fname = me.ground ? (me.land > 0.1 ? 'idle1' : runF) : 'jump';
    K.dither(CX + 2, GY - 1, 12, 1, '#0c0620', me.ground ? 0.9 : 0.4);
    K.spr(fname, CX, Math.round(me.y) - 20 + (me.ground && me.land > 0.1 ? 1 : 0));
    // speed lines when boosting
    if (boost > 60) { for (let i = 0; i < 3; i++) K.rect(CX - 8 - ((Math.floor(t * 40) + i * 5) % 12), Math.round(me.y) - 14 + i * 5, 5, 1, 'rgba(255,255,255,.55)'); }
    // particles
    parts.forEach((p) => K.px(Math.round(p.x - wx), Math.round(p.y), p.c));
    frames++;
    if (frames === 2) { HX.ready(); hooks.onReady && hooks.onReady(); }
  }

  let running = true;
  function loop(now) { if (!running) return; frame(now); requestAnimationFrame(loop); }
  resize();
  seedHero();
  addEventListener('resize', () => { const old = W; resize(); if (W !== old) { props = []; coins = []; bugs = []; nextProp = wx + 10; nextCoin = wx + 120; nextBug = wx + 300; } });
  requestAnimationFrame(loop);

  return {
    setLevel(n) {
      if (n === level) return;
      level = n; levelQueue = 1; propIdx = 0;
      props = props.filter((p) => p.x < wx + W - 8);
      nextProp = Math.max(wx + W + 6, props.reduce((m, p) => Math.max(m, p.x + (PROP_W[p.type] || 40) + 10), 0));
      dash = 1.15;
    },
    setDawn(f) { dawn = f; },
    get score() { return score; }
  };
}

/* paint sprites into small canvases sprinkled through the page */
export function paintSprites(root = document) {
  root.querySelectorAll('canvas[data-sprite]').forEach((cv) => {
    const s = sprite(cv.dataset.sprite, cv.hasAttribute('data-flip'));
    cv.width = s.width; cv.height = s.height;
    const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(s, 0, 0);
  });
}
