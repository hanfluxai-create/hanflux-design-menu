// Procedural textures for Velvet Ward: brick albedo, wet floor, puddle mask, drifting haze.
// Everything is drawn with canvas 2D primitives (fast), then handed to CSS as blob URLs.

export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function noiseTile(size, seed, alpha = 1) {
  const c = canvas(size, size), g = c.getContext('2d');
  const img = g.createImageData(size, size), d = img.data, r = rng(seed);
  for (let i = 0; i < d.length; i += 4) {
    const v = (r() * 255) | 0;
    d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255 * alpha;
  }
  g.putImageData(img, 0, 0);
  return c;
}

// Running-bond brick wall, seamless in both directions. True-colour albedo (lit by CSS multiply).
export function brickAlbedo({ w = 1024, h = 800, bw = 64, bh = 25, m = 3, seed = 29 } = {}) {
  const c = canvas(w, h), g = c.getContext('2d'), r = rng(seed);
  const strip = canvas(w, bh), s = strip.getContext('2d');
  const drawBrick = (x) => {
    const W = bw - m, H = bh - m;
    const soot = r() < 0.16, pale = r() < 0.08;
    const hue = 6 + r() * 12, sat = 38 + r() * 20;
    let lit = 25 + r() * 11;
    if (soot) lit -= 9;
    if (pale) lit += 7;
    s.save();
    s.translate(x + m / 2, m / 2);
    const j = () => (r() - 0.5) * 1.6;
    s.beginPath();
    s.moveTo(1 + j(), j()); s.lineTo(W - 1 + j(), j()); s.lineTo(W + j(), H / 2 + j());
    s.lineTo(W - 1 + j(), H + j()); s.lineTo(1 + j(), H + j()); s.lineTo(j(), H / 2 + j()); s.closePath();
    s.fillStyle = `hsl(${hue} ${sat}% ${lit}%)`;
    s.fill();
    s.clip();
    const gr = s.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, 'rgba(255,225,205,.22)'); gr.addColorStop(0.18, 'rgba(255,225,205,.04)');
    gr.addColorStop(0.72, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.34)');
    s.fillStyle = gr; s.fillRect(0, 0, W, H);
    for (let k = 0; k < 5; k++) {
      const bx = r() * W, by = r() * H, rr = 4 + r() * 14;
      const rg = s.createRadialGradient(bx, by, 0, bx, by, rr);
      const dark = r() < 0.55;
      rg.addColorStop(0, dark ? 'rgba(20,6,4,.22)' : 'rgba(255,190,160,.12)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      s.fillStyle = rg; s.fillRect(0, 0, W, H);
    }
    for (let k = 0; k < 46; k++) {
      const light = r() < 0.5, a = 0.12 + r() * 0.3;
      s.fillStyle = light ? `rgba(255,210,190,${a * 0.6})` : `rgba(15,4,3,${a})`;
      s.fillRect(r() * W, r() * H, 0.8 + r() * 1.6, 0.8 + r() * 1.4);
    }
    if (pale) {
      const rg = s.createRadialGradient(W * r(), H * 0.7, 0, W * 0.5, H * 0.7, W * 0.6);
      rg.addColorStop(0, 'rgba(235,225,215,.22)'); rg.addColorStop(1, 'rgba(235,225,215,0)');
      s.fillStyle = rg; s.fillRect(0, 0, W, H);
    }
    s.restore();
    const chips = r() < 0.5 ? 1 + (r() * 2 | 0) : 0;
    for (let k = 0; k < chips; k++) {
      const cx = x + m / 2 + (r() < 0.5 ? r() * 6 : W - r() * 6), cy = m / 2 + (r() < 0.5 ? r() * 3 : H - r() * 3);
      s.fillStyle = '#4c4744';
      s.beginPath(); s.moveTo(cx, cy);
      for (let q = 0; q < 5; q++) s.lineTo(cx + (r() - 0.5) * 7, cy + (r() - 0.5) * 5);
      s.closePath(); s.fill();
    }
  };
  const rows = Math.round(h / bh);
  for (let row = 0; row < rows; row++) {
    // mortar bed for this course
    s.fillStyle = '#55504c'; s.fillRect(0, 0, w, bh);
    for (let i = 0; i < 90; i++) {
      const v = 60 + r() * 60 | 0;
      s.fillStyle = `rgba(${v},${v - 4},${v - 8},${0.25 + r() * 0.35})`;
      s.fillRect(r() * w, r() * bh, 1 + r() * 2, 1 + r() * 2);
    }
    for (let x = 0; x < w; x += bw) drawBrick(x);
    const y = row * bh, off = row % 2 ? -bw / 2 : 0;
    g.drawImage(strip, off, y);
    if (off) g.drawImage(strip, off + w, y);
  }
  const n = noiseTile(256, seed + 3, 1);
  g.globalCompositeOperation = 'overlay';
  g.globalAlpha = 0.16;
  g.fillStyle = g.createPattern(n, 'repeat');
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  return c;
}

// Wet concrete floor albedo (very dark), with subtle aggregate and streaks.
export function floorTexture({ w = 1024, h = 256, seed = 5 } = {}) {
  const c = canvas(w, h), g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = '#16121a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) {
    const x = r() * w, y = r() * h, rr = 6 + r() * 40;
    const rg = g.createRadialGradient(x, y, 0, x, y, rr);
    const v = r() < 0.5 ? '255,255,255' : '0,0,0';
    rg.addColorStop(0, `rgba(${v},${0.02 + r() * 0.04})`); rg.addColorStop(1, `rgba(${v},0)`);
    g.fillStyle = rg; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  for (let i = 0; i < 5000; i++) {
    const v = r() < 0.5 ? 255 : 0;
    g.fillStyle = `rgba(${v},${v},${v},${0.04 + r() * 0.08})`;
    g.fillRect(r() * w, r() * h, 1 + r() * 1.5, 1);
  }
  return c;
}

// Puddle mask: white where the floor is wet (reflective). Wide, flat pools read as perspective.
export function puddleMask({ w = 1024, h = 256, seed = 17 } = {}) {
  const c = canvas(w, h), g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(0, 0, w, h); // a faint damp sheen
  const pools = [];
  for (let i = 0; i < 9; i++) pools.push([0.06 + r() * 0.88, 0.12 + r() * 0.7, 0.08 + r() * 0.16, 0.05 + r() * 0.1]);
  pools.push([0.5, 0.18, 0.3, 0.12], [0.42, 0.42, 0.22, 0.1]); // one big pool under the sign
  g.filter = 'blur(4px)';
  for (const [px, py, rx, ry] of pools) {
    // each pool is a cluster of overlapping ellipses with ragged edges
    const n = 5 + (r() * 5 | 0);
    for (let k = 0; k < n; k++) {
      g.fillStyle = `rgba(255,255,255,${0.75 + r() * 0.25})`;
      g.beginPath();
      g.ellipse((px + (r() - 0.5) * rx) * w, (py + (r() - 0.5) * ry) * h, rx * w * (0.35 + r() * 0.45), ry * h * (0.5 + r() * 0.6), (r() - 0.5) * 0.06, 0, Math.PI * 2);
      g.fill();
    }
  }
  g.filter = 'none';
  for (let i = 0; i < 2400; i++) {
    g.fillStyle = `rgba(0,0,0,${0.15 + r() * 0.3})`;
    g.fillRect(r() * w, r() * h, 2 + r() * 8, 1 + r() * 1.5);
  }
  return c;
}

// Haze: soft billows, seamless horizontally, faded top and bottom. Used under a radial mask.
export function hazeTexture({ w = 768, h = 384, seed = 41 } = {}) {
  const c = canvas(w, h), g = c.getContext('2d'), r = rng(seed);
  for (let i = 0; i < 90; i++) {
    const rr = 26 + r() * 90, x = r() * w, y = rr + r() * Math.max(1, h - 2 * rr);
    const warm = r() < 0.6;
    const rg = g.createRadialGradient(x, y, 0, x, y, rr);
    const col = warm ? '255,190,240' : '190,240,255';
    rg.addColorStop(0, `rgba(${col},${0.05 + r() * 0.07})`); rg.addColorStop(0.6, `rgba(${col},${0.02 + r() * 0.03})`); rg.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = rg;
    for (const dx of [-w, 0, w]) g.fillRect(x - rr + dx, y - rr, rr * 2, rr * 2);
  }
  return c;
}

export function toURL(cnv, type = 'image/png', q) {
  return new Promise((res) => cnv.toBlob((b) => res(b ? URL.createObjectURL(b) : cnv.toDataURL()), type, q));
}
