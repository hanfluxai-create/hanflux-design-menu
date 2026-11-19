// Procedural record covers and roster emblems for Static Bloom Records (2D canvas, drawn once).
const P = { bg: '#070710', blue: '#2b2bff', mag: '#ff3df0', yel: '#fff200', cyan: '#00f0ff', white: '#f4f4ff' };

function rand(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
}

function finish(ctx, S, grain = 16, lines = 0.1) {
  const img = ctx.getImageData(0, 0, S, S);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * grain;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  if (lines > 0) {
    ctx.fillStyle = `rgba(0,0,0,${lines})`;
    for (let y = 0; y < S; y += 3) ctx.fillRect(0, y, S, 1);
  }
}

function text(ctx, str, x, y, size, color, font = 'Archivo Black', align = 'left', base = 'alphabetic') {
  ctx.font = `${size}px "${font}", Impact, sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = base;
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

function fitText(ctx, str, maxW, size, font = 'Archivo Black') {
  ctx.font = `${size}px "${font}", Impact, sans-serif`;
  const w = ctx.measureText(str).width;
  return w > maxW ? size * maxW / w : size;
}

function chip(ctx, S, cat, dark) {
  text(ctx, cat, S * 0.94, S * 0.955, S * 0.055, dark ? 'rgba(7,7,16,.75)' : 'rgba(244,244,255,.8)', 'VT323', 'right');
  text(ctx, 'STATIC BLOOM', S * 0.94, S * 0.08, S * 0.045, dark ? 'rgba(7,7,16,.7)' : 'rgba(244,244,255,.7)', 'VT323', 'right');
}

const COVERS = [
  // 0 Night Receiver: striped sun over a neon grid
  (ctx, S, t, a) => {
    const hz = S * 0.64;
    let g = ctx.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, '#07051f'); g.addColorStop(1, '#6a1478');
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, hz);
    const r = rand(7);
    for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`; ctx.fillRect(r() * S, r() * hz * 0.8, 1.6, 1.6); }
    const sun = document.createElement('canvas'); sun.width = sun.height = S;
    const sc = sun.getContext('2d');
    const cx = S * 0.5, cy = S * 0.52, R = S * 0.25;
    g = sc.createLinearGradient(0, cy - R, 0, cy + R);
    g.addColorStop(0, P.yel); g.addColorStop(0.55, '#ff9a3d'); g.addColorStop(1, P.mag);
    sc.fillStyle = g; sc.beginPath(); sc.arc(cx, cy, R, 0, Math.PI * 2); sc.fill();
    sc.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < 7; k++) { const y = cy + R * (0.02 + k * 0.15); sc.fillRect(0, y, S, R * (0.025 + k * 0.022)); }
    ctx.shadowColor = P.mag; ctx.shadowBlur = S * 0.08;
    ctx.drawImage(sun, 0, 0);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1a0630';
    ctx.beginPath(); ctx.moveTo(0, hz);
    for (let x = 0; x <= S; x += S / 24) ctx.lineTo(x, hz - S * (0.02 + 0.06 * Math.abs(Math.sin(x * 0.021 + 1.2)) * (Math.abs(x - cx) / S + 0.2)));
    ctx.lineTo(S, hz); ctx.fill();
    ctx.fillStyle = '#12021f'; ctx.fillRect(0, hz, S, S - hz);
    ctx.strokeStyle = P.mag; ctx.lineWidth = Math.max(1.5, S * 0.004); ctx.shadowColor = P.mag; ctx.shadowBlur = S * 0.02;
    for (let k = 1; k < 9; k++) { const y = hz + (S - hz) * Math.pow(k / 8, 2.1); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(S, y); ctx.stroke(); }
    for (let k = -8; k <= 8; k++) { ctx.beginPath(); ctx.moveTo(cx + k * S * 0.02, hz); ctx.lineTo(cx + k * S * 0.16, S); ctx.stroke(); }
    ctx.shadowBlur = 0;
    ctx.strokeStyle = P.cyan; ctx.lineWidth = Math.max(1, S * 0.003); ctx.beginPath(); ctx.moveTo(0, hz); ctx.lineTo(S, hz); ctx.stroke();
    const fs = fitText(ctx, t.toUpperCase(), S * 0.84, S * 0.1);
    text(ctx, t.toUpperCase(), S * 0.08, S * 0.17, fs, P.white);
    text(ctx, a.toUpperCase(), S * 0.08, S * 0.245, S * 0.068, P.cyan, 'VT323');
  },
  // 1 Soft Focus: halftone moons
  (ctx, S, t, a) => {
    ctx.fillStyle = '#dcd6ff'; ctx.fillRect(0, 0, S, S);
    const step = S / 30;
    const m1 = [S * 0.56, S * 0.42, S * 0.3], m2 = [S * 0.33, S * 0.6, S * 0.17];
    for (let y = step / 2; y < S; y += step) {
      for (let x = step / 2; x < S; x += step) {
        const off = (Math.round(y / step) % 2) * step * 0.5;
        const xx = x + off;
        const d1 = Math.hypot(xx - m1[0], y - m1[1]) / m1[2];
        let v = Math.max(0, 1 - d1) * 0.95 + 0.1 * (1 - y / S);
        v = Math.min(1, v + Math.max(0, 0.35 - Math.abs(d1 - 1)) * 0.6);
        if (v > 0.03) { ctx.fillStyle = P.blue; ctx.beginPath(); ctx.arc(xx, y, step * 0.5 * Math.sqrt(v), 0, Math.PI * 2); ctx.fill(); }
        const d2 = Math.hypot(xx - m2[0], y - m2[1]) / m2[2];
        const v2 = Math.max(0, 1 - d2);
        if (v2 > 0.02) { ctx.fillStyle = P.mag; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(xx + step * 0.2, y + step * 0.15, step * 0.42 * Math.sqrt(v2), 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
      }
    }
    ctx.fillStyle = '#dcd6ff'; ctx.fillRect(0, S * 0.78, S, S * 0.22);
    const fs = fitText(ctx, t.toUpperCase(), S * 0.84, S * 0.11);
    text(ctx, t.toUpperCase(), S * 0.08, S * 0.885, fs, P.blue);
    text(ctx, a.toUpperCase(), S * 0.08, S * 0.95, S * 0.06, '#c21fb3', 'VT323');
    chip(ctx, S, 'SB-042', true);
  },
  // 2 Rewind Forever: tape reels
  (ctx, S, t, a) => {
    ctx.fillStyle = '#05051a'; ctx.fillRect(0, 0, S, S);
    const reels = [[S * 0.3, S * 0.56], [S * 0.72, S * 0.56]];
    reels.forEach(([x, y], i) => {
      const R = i === 0 ? S * 0.25 : S * 0.17;
      for (let k = 0; k < 26; k++) {
        const rr = R * (1 - k / 30);
        ctx.strokeStyle = k % 3 === 0 ? P.cyan : (k % 2 ? P.blue : '#1b1bd0');
        ctx.globalAlpha = 0.55 + 0.45 * (k / 26);
        ctx.lineWidth = Math.max(1, S * 0.0045);
        ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = P.white; ctx.beginPath(); ctx.arc(x, y, S * 0.07, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#05051a';
      for (let s = 0; s < 6; s++) { const an = s * Math.PI / 3 + i; ctx.beginPath(); ctx.arc(x + Math.cos(an) * S * 0.045, y + Math.sin(an) * S * 0.045, S * 0.012, 0, Math.PI * 2); ctx.fill(); }
      ctx.beginPath(); ctx.arc(x, y, S * 0.02, 0, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = 'rgba(0,240,255,.6)'; ctx.lineWidth = S * 0.006;
    ctx.beginPath(); ctx.moveTo(S * 0.3, S * 0.81); ctx.lineTo(S * 0.72, S * 0.73); ctx.stroke();
    ctx.fillStyle = P.yel;
    const tx = S * 0.5, ty = S * 0.2;
    for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.moveTo(tx - k * S * 0.075 + S * 0.03, ty - S * 0.045); ctx.lineTo(tx - k * S * 0.075 - S * 0.045, ty); ctx.lineTo(tx - k * S * 0.075 + S * 0.03, ty + S * 0.045); ctx.fill(); }
    const fs = fitText(ctx, t.toUpperCase(), S * 0.84, S * 0.1);
    text(ctx, t.toUpperCase(), S * 0.5, S * 0.36, fs, P.yel, 'Archivo Black', 'center');
    text(ctx, a.toUpperCase(), S * 0.5, S * 0.93, S * 0.06, P.cyan, 'VT323', 'center');
  },
  // 3 Tracking Error: torn glitch bars
  (ctx, S, t, a) => {
    const r = rand(31);
    ctx.fillStyle = '#0a0a16'; ctx.fillRect(0, 0, S, S);
    const cols = [P.blue, P.mag, P.yel, P.cyan, '#1a1a33', '#101022', P.white];
    let y = 0;
    while (y < S) {
      const h = S * (0.008 + r() * 0.05);
      const c = cols[Math.floor(r() * r() * cols.length)];
      const off = (r() - 0.5) * S * 0.3;
      ctx.fillStyle = c; ctx.globalAlpha = c === P.white ? 0.5 : 0.85;
      ctx.fillRect(off, y, S * (0.4 + r() * 0.8), h);
      y += h + S * r() * 0.012;
    }
    ctx.globalAlpha = 1;
    const word = t.toUpperCase();
    const fs = fitText(ctx, word, S * 0.88, S * 0.13);
    ctx.save();
    [[P.cyan, -S * 0.012], [P.mag, S * 0.012], [P.white, 0]].forEach(([c, dx]) => text(ctx, word, S * 0.5 + dx, S * 0.55, fs, c, 'Archivo Black', 'center'));
    ctx.restore();
    for (let k = 0; k < 6; k++) {
      const yy = S * (0.44 + r() * 0.16), hh = S * (0.006 + r() * 0.02);
      const slice = ctx.getImageData(0, Math.floor(yy), S, Math.max(1, Math.floor(hh)));
      ctx.putImageData(slice, Math.floor((r() - 0.5) * S * 0.08), Math.floor(yy));
    }
    ctx.fillStyle = 'rgba(7,7,16,.8)'; ctx.fillRect(S * 0.06, S * 0.84, S * 0.52, S * 0.08);
    text(ctx, a.toUpperCase(), S * 0.08, S * 0.9, S * 0.062, P.yel, 'VT323');
  },
  // 4 Overexposed: light leaks
  (ctx, S, t, a) => {
    let g = ctx.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, '#ffb38a'); g.addColorStop(1, '#ffe7a6');
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    ctx.globalCompositeOperation = 'screen';
    [[0.75, 0.25, 0.55, 'rgba(255,255,255,1)'], [0.2, 0.75, 0.5, 'rgba(255,61,240,.9)'], [0.9, 0.85, 0.45, 'rgba(0,240,255,.55)'], [0.35, 0.3, 0.35, 'rgba(255,242,0,.85)']].forEach(([x, y, rr, c]) => {
      const rg = ctx.createRadialGradient(x * S, y * S, 0, x * S, y * S, rr * S);
      rg.addColorStop(0, c); rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, S, S);
    });
    ctx.globalCompositeOperation = 'multiply';
    const vg = ctx.createRadialGradient(S * 0.5, S * 0.5, S * 0.3, S * 0.5, S * 0.5, S * 0.8);
    vg.addColorStop(0, 'rgba(255,255,255,1)'); vg.addColorStop(1, 'rgba(200,60,140,1)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, S, S);
    ctx.globalCompositeOperation = 'source-over';
    // light-leak streaks
    ctx.globalCompositeOperation = 'screen';
    for (let k = 0; k < 3; k++) {
      const lg = ctx.createLinearGradient(0, 0, S, 0);
      lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, k === 1 ? 'rgba(255,242,0,.55)' : 'rgba(255,120,60,.45)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.save(); ctx.translate(S * (0.25 + k * 0.28), 0); ctx.rotate(0.38); ctx.fillStyle = lg; ctx.fillRect(-S * 0.08, -S * 0.2, S * (0.1 + k * 0.05), S * 1.6); ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';
    // film edge with sprocket holes and frame numbers
    ctx.fillStyle = '#1a0d14'; ctx.fillRect(0, 0, S * 0.085, S);
    ctx.fillStyle = '#ffd9b0';
    for (let y = S * 0.02; y < S; y += S * 0.07) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(S * 0.022, y, S * 0.04, S * 0.035, S * 0.006) : ctx.rect(S * 0.022, y, S * 0.04, S * 0.035); ctx.fill(); }
    ctx.save(); ctx.translate(S * 0.11, S * 0.52); ctx.rotate(-Math.PI / 2);
    text(ctx, '24A    25    25A    26', 0, 0, S * 0.04, 'rgba(255,140,40,.85)', 'VT323', 'center');
    ctx.restore();
    ctx.strokeStyle = 'rgba(7,7,16,.9)'; ctx.lineWidth = S * 0.012;
    ctx.beginPath(); ctx.arc(S * 0.72, S * 0.28, S * 0.11, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(7,7,16,.9)'; ctx.beginPath(); ctx.arc(S * 0.72, S * 0.28, S * 0.035, 0, Math.PI * 2); ctx.fill();
    const fs = fitText(ctx, t.toUpperCase(), S * 0.86, S * 0.12);
    text(ctx, t.toUpperCase(), S * 0.14, S * 0.86, Math.min(fs, fitText(ctx, t.toUpperCase(), S * 0.8, S * 0.12)), '#15081f');
    text(ctx, a.toUpperCase(), S * 0.14, S * 0.93, S * 0.06, '#5a1050', 'VT323');
    chip(ctx, S, 'SB-045', true);
  },
  // 5 Vacancy: a motel at night with a neon sign
  (ctx, S, t, a) => {
    let g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, '#05051a'); g.addColorStop(1, '#1a0c3a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    const r = rand(5);
    for (let i = 0; i < 50; i++) { ctx.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.6})`; ctx.fillRect(r() * S, r() * S * 0.45, 1.5, 1.5); }
    const bx = S * 0.08, by = S * 0.56, bw = S * 0.84, bh = S * 0.36;
    ctx.fillStyle = '#0f0f2c'; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#16163f'; ctx.fillRect(bx - S * 0.02, by - S * 0.03, bw + S * 0.04, S * 0.035);
    for (let row = 0; row < 2; row++) {
      for (let c = 0; c < 6; c++) {
        const wx = bx + S * 0.05 + c * S * 0.128, wy = by + S * 0.06 + row * S * 0.15;
        const lit = row === 1 && c === 3;
        if (lit) { ctx.shadowColor = P.yel; ctx.shadowBlur = S * 0.06; }
        ctx.fillStyle = lit ? P.yel : '#232352';
        ctx.fillRect(wx, wy, S * 0.07, S * 0.085);
        ctx.shadowBlur = 0;
      }
    }
    ctx.save();
    ctx.shadowColor = P.mag; ctx.shadowBlur = S * 0.05;
    const letters = 'VACANCY';
    const lx = S * 0.84, ly0 = S * 0.12, step = S * 0.062;
    ctx.fillStyle = '#1a0a24'; ctx.fillRect(lx - S * 0.05, ly0 - S * 0.05, S * 0.1, step * letters.length + S * 0.04);
    for (let i = 0; i < letters.length; i++) text(ctx, letters[i], lx, ly0 + i * step + S * 0.025, S * 0.06, P.mag, 'Archivo Black', 'center');
    ctx.restore();
    text(ctx, 'NO', lx - S * 0.11, ly0 + S * 0.12, S * 0.045, '#3a2050', 'Archivo Black', 'center');
    text(ctx, a.toUpperCase(), S * 0.07, S * 0.13, S * 0.075, P.cyan, 'VT323');
    const fs = fitText(ctx, t.toUpperCase(), S * 0.6, S * 0.09);
    text(ctx, t.toUpperCase(), S * 0.07, S * 0.23, fs, P.white);
  },
];

export function drawCover(canvas, size) {
  const i = parseInt(canvas.dataset.cover, 10) || 0;
  const S = size;
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  COVERS[i](ctx, S, canvas.dataset.title || '', canvas.dataset.artist || '');
  finish(ctx, S, i === 4 ? 22 : 16, i === 1 || i === 4 ? 0.05 : 0.11);
  if (i === 0 || i === 2 || i === 3 || i === 5) chip(ctx, S, 'SB-04' + (i + 1), false);
}

export function drawEmblem(canvas, artist, idx) {
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const r = rand(idx * 97 + 13);
  ctx.fillStyle = '#1d1dd8'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,242,0,.85)'; ctx.lineWidth = 3;
  const shape = idx % 3, cx = W * (0.3 + r() * 0.4), cy = H * 0.48, R = H * (0.26 + r() * 0.1);
  ctx.beginPath();
  if (shape === 0) ctx.arc(cx, cy, R, 0, Math.PI * 2);
  else if (shape === 1) ctx.rect(cx - R, cy - R, R * 2, R * 2);
  else { ctx.moveTo(cx, cy - R); ctx.lineTo(cx + R, cy + R * 0.8); ctx.lineTo(cx - R, cy + R * 0.8); ctx.closePath(); }
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  for (let k = 0; k < 7; k++) ctx.fillRect(0, r() * H, W, 1 + r() * 3);
  const ini = artist.split(' ').filter((w) => w !== 'THE').map((w) => w[0]).join('').slice(0, 2);
  ctx.font = `${H * 0.62}px "VT323", monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff3df0'; ctx.fillText(ini, W / 2 - 4, H * 0.5);
  ctx.fillStyle = '#00f0ff'; ctx.fillText(ini, W / 2 + 4, H * 0.5);
  ctx.fillStyle = '#ffffff'; ctx.fillText(ini, W / 2, H * 0.5);
  ctx.font = `${H * 0.1}px "VT323", monospace`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('AUX 1', 12, H * 0.13);
  ctx.textAlign = 'right';
  ctx.fillText('PLAY ▶', W - 12, H * 0.94);
  ctx.textAlign = 'left';
  ctx.fillText('0:0' + (idx % 10) + ':' + String(10 + idx * 4).slice(-2), 12, H * 0.94);
}

export function emblemStatic(canvas) {
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255; }
  ctx.putImageData(img, 0, 0);
}
