// CRUNCH CO. pouch artwork, drawn in code. One atlas per flavour: front label (left half), back label (right half).
export const FLAVOURS = [
  { id: 'peri', name: 'Peri Peri', lines: ['PERI', 'PERI'], type: 'PROTEIN CHIPS', color: '#ff7a1a', light: '#ffd9bd', ink: '#000', weight: 60, protein: 12, kind: 'chips', icon: 'chilli',
    ing: 'Pea protein crisps (68%), rice flour, rice bran oil, peri peri seasoning (red chilli, paprika, garlic, onion, lemon powder, rock salt), oregano.',
    n100: ['452 kcal', '20.0 g', '56.2 g', '2.1 g', '15.8 g', '2.4 g', '0 g', '6.4 g', '612 mg'], np: ['271 kcal', '12.0 g', '33.7 g', '1.3 g', '9.5 g', '1.4 g', '0 g', '3.8 g', '367 mg'] },
  { id: 'pudina', name: 'Pudina Punch', lines: ['PUDINA', 'PUNCH'], type: 'ROASTED MAKHANA', color: '#23a094', light: '#c5ebe5', ink: '#000', weight: 70, protein: 7, kind: 'makhana', icon: 'mint',
    ing: 'Roasted makhana (fox nuts, 82%), rice bran oil, mint, dried lime, black salt, cumin, green chilli.',
    n100: ['418 kcal', '10.1 g', '64.5 g', '1.2 g', '12.4 g', '1.9 g', '0 g', '7.9 g', '488 mg'], np: ['293 kcal', '7.1 g', '45.2 g', '0.8 g', '8.7 g', '1.3 g', '0 g', '5.5 g', '342 mg'] },
  { id: 'cheese', name: 'Cheese and Herb', lines: ['CHEESE', '& HERB'], type: 'PROTEIN CHIPS', color: '#ffc900', light: '#ffecae', ink: '#000', weight: 60, protein: 12, kind: 'chips', icon: 'cheese',
    ing: 'Pea protein crisps (66%), rice flour, rice bran oil, cheese powder (milk), oregano, basil, garlic, rock salt.',
    n100: ['459 kcal', '20.4 g', '54.8 g', '3.0 g', '16.6 g', '3.1 g', '0 g', '6.1 g', '640 mg'], np: ['275 kcal', '12.2 g', '32.9 g', '1.8 g', '10.0 g', '1.9 g', '0 g', '3.7 g', '384 mg'] },
  { id: 'caramel', name: 'Salted Caramel', lines: ['SALTED', 'CARAMEL'], type: 'ROASTED MAKHANA', color: '#ff90e8', light: '#ffd9f6', ink: '#000', weight: 70, protein: 6, kind: 'makhana', icon: 'caramel',
    ing: 'Roasted makhana (fox nuts, 78%), jaggery caramel (jaggery, butter), rice bran oil, sea salt, vanilla.',
    n100: ['436 kcal', '9.2 g', '68.9 g', '14.6 g', '13.0 g', '2.2 g', '0 g', '7.1 g', '262 mg'], np: ['305 kcal', '6.4 g', '48.2 g', '10.2 g', '9.1 g', '1.5 g', '0 g', '5.0 g', '183 mg'] },
];
export const ROWS = ['Energy', 'Protein', 'Carbohydrate', 'of which sugars', 'Total fat', 'Saturated fat', 'Trans fat', 'Dietary fibre', 'Sodium'];

const D = "'Archivo Black', 'Arial Black', sans-serif";
const B = "'Space Grotesk', system-ui, sans-serif";
const CREAM = '#fffbf0';
const LW = 5;

function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
function fitFont(ctx, text, family, maxW, start) { let s = start; ctx.font = `${s}px ${family}`; while (ctx.measureText(text).width > maxW && s > 10) { s -= 2; ctx.font = `${s}px ${family}`; } return s; }
function wrap(ctx, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = '', yy = y;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lh; } else line = t; }
  if (line) ctx.fillText(line, x, yy);
  return yy;
}
function crimp(ctx, x, y, w, h, base) {
  ctx.fillStyle = base; ctx.fillRect(x, y, w, h);
  for (let i = 0; i < w; i += 9) { ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(x + i, y, 3, h); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(x + i + 4, y, 2, h); }
}
function halftone(ctx, w, h, col, step, r) {
  ctx.fillStyle = col;
  for (let y = 0; y < h; y += step) for (let x = (y / step) % 2 ? step / 2 : 0; x < w; x += step) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
}

/* ---- little illustrations, thick outlines ---- */
function chip(ctx, x, y, s, rot, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-40, 26); ctx.quadraticCurveTo(-46, -10, -6, -36); ctx.quadraticCurveTo(30, -44, 46, -6); ctx.quadraticCurveTo(52, 30, 8, 36); ctx.quadraticCurveTo(-26, 42, -40, 26); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = LW / s; ctx.strokeStyle = '#000'; ctx.stroke();
  ctx.lineWidth = 3 / s; ctx.beginPath(); ctx.moveTo(-22, 10); ctx.quadraticCurveTo(0, -4, 26, 4); ctx.stroke();
  ctx.fillStyle = 'rgba(160,40,10,.55)'; [[-14, -14], [14, -18], [24, 16], [-6, 18], [4, -2]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 3.4, 0, 7); ctx.fill(); });
  ctx.restore();
}
function puff(ctx, x, y, r, seed) {
  const R = rng(seed); ctx.save(); ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i <= 14; i++) { const a = (i / 14) * Math.PI * 2, rr2 = r * (0.86 + R() * 0.2); i ? ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2) : ctx.moveTo(Math.cos(a) * rr2, Math.sin(a) * rr2); }
  ctx.closePath(); ctx.fillStyle = '#fff3d6'; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = '#000'; ctx.stroke();
  ctx.fillStyle = '#8a5a2b'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc((R() - 0.5) * r, (R() - 0.5) * r, 2 + R() * 3, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.32, r * 0.18, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fill();
  ctx.restore();
}
function chilli(ctx, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-6, -40); ctx.bezierCurveTo(26, -34, 30, 10, 4, 52); ctx.bezierCurveTo(-2, 60, -10, 56, -8, 46); ctx.bezierCurveTo(4, 16, -2, -14, -20, -30); ctx.closePath();
  ctx.fillStyle = '#e8361b'; ctx.fill(); ctx.lineWidth = LW / s; ctx.strokeStyle = '#000'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-14, -36); ctx.quadraticCurveTo(-18, -56, -4, -62); ctx.lineWidth = 7 / s; ctx.strokeStyle = '#000'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-14, -36); ctx.quadraticCurveTo(-18, -56, -4, -62); ctx.lineWidth = 3.5 / s; ctx.strokeStyle = '#2f8f3a'; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(6, -14, 3, 9, 0.3, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill();
  ctx.restore();
}
function leaf(ctx, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, -44); ctx.quadraticCurveTo(34, -10, 0, 44); ctx.quadraticCurveTo(-34, -10, 0, -44); ctx.closePath();
  ctx.fillStyle = '#4cc36a'; ctx.fill(); ctx.lineWidth = LW / s; ctx.strokeStyle = '#000'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(0, 38); ctx.lineWidth = 3 / s; ctx.stroke();
  for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(0, k * 12); ctx.lineTo(12, k * 12 - 10); ctx.moveTo(0, k * 12); ctx.lineTo(-12, k * 12 - 10); ctx.stroke(); }
  ctx.restore();
}
function cheese(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-56, 30); ctx.lineTo(54, 30); ctx.lineTo(54, -6); ctx.lineTo(-56, -30); ctx.closePath();
  ctx.fillStyle = '#ffd84a'; ctx.fill(); ctx.lineWidth = LW / s; ctx.strokeStyle = '#000'; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-56, -30); ctx.lineTo(54, -6); ctx.lineTo(62, -14); ctx.lineTo(-48, -38); ctx.closePath(); ctx.fillStyle = '#ffe98f'; ctx.fill(); ctx.stroke();
  [[-20, 6, 9], [16, 14, 7], [32, -2, 5], [-36, 18, 5]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(a, b, r, 0, 7); ctx.fillStyle = '#e0a800'; ctx.fill(); ctx.lineWidth = 3 / s; ctx.stroke(); });
  ctx.restore();
}
function drizzle(ctx, x, y, w) {
  ctx.save(); ctx.lineCap = 'round';
  for (const [lw, col] of [[16, '#000'], [10, '#a8541c']]) {
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 1; i <= 8; i++) ctx.quadraticCurveTo(x + (i - 0.5) * w / 8, y + (i % 2 ? -26 : 26), x + i * w / 8, y);
    ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2.5;
  [[x + 30, y - 40], [x + w - 40, y + 34], [x + w * 0.5, y - 46], [x + w * 0.3, y + 40]].forEach(([a, b]) => { ctx.beginPath(); ctx.rect(a, b, 11, 11); ctx.fill(); ctx.stroke(); });
}

/* ---- front label ---- */
function front(ctx, f) {
  const W = 576, H = 768;
  ctx.fillStyle = f.color; ctx.fillRect(0, 0, W, H);
  halftone(ctx, W, H, 'rgba(0,0,0,.07)', 16, 2.4);
  crimp(ctx, 0, 0, W, 66, f.color); crimp(ctx, 0, H - 50, W, 50, f.color);
  // tear line
  ctx.setLineDash([12, 9]); ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.moveTo(30, 88); ctx.lineTo(W - 30, 88); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#000'; ctx.font = `700 15px ${B}`; ctx.textAlign = 'right'; ctx.fillText('TEAR HERE', W - 34, 80);
  // brand bar
  rr(ctx, 40, 106, W - 80, 86, 18); ctx.fillStyle = '#000'; ctx.fill();
  ctx.fillStyle = CREAM; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; fitFont(ctx, 'CRUNCH CO.', D, W - 140, 60); ctx.fillText('CRUNCH CO.', W / 2, 151);
  // type pill
  ctx.font = `700 22px ${B}`; const tw = ctx.measureText(f.type).width + 44;
  rr(ctx, W / 2 - tw / 2, 212, tw, 44, 22); ctx.fillStyle = CREAM; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#000'; ctx.stroke();
  ctx.fillStyle = '#000'; ctx.fillText(f.type, W / 2, 235);
  // flavour name: cream type with ink outline and hard offset shadow
  f.lines.forEach((ln, i) => {
    const y = 330 + i * 104;
    const s = fitFont(ctx, ln, D, W - 96, 116);
    ctx.font = `${s}px ${D}`;
    ctx.fillStyle = '#000'; ctx.fillText(ln, W / 2 + 7, y + 7);
    ctx.lineWidth = 10; ctx.strokeStyle = '#000'; ctx.lineJoin = 'round'; ctx.strokeText(ln, W / 2, y);
    ctx.fillStyle = CREAM; ctx.fillText(ln, W / 2, y);
  });
  // illustration
  const cy = 548;
  if (f.kind === 'chips') {
    chip(ctx, 200, cy + 30, 1.25, -0.4, '#f0c27a'); chip(ctx, 300, cy + 6, 1.35, 0.25, '#f5cf8c'); chip(ctx, 390, cy + 40, 1.15, 0.7, '#ecb86a');
  } else {
    [[190, cy + 34, 40, 3], [262, cy + 4, 46, 7], [338, cy + 30, 42, 11], [404, cy + 2, 36, 19], [230, cy + 82, 34, 23], [310, cy + 80, 38, 29]].forEach(([x, y, r, s]) => puff(ctx, x, y, r, s));
  }
  if (f.icon === 'chilli') { chilli(ctx, 116, cy - 6, 1.1, -0.5); chilli(ctx, 470, cy + 2, 0.95, 0.6); }
  if (f.icon === 'mint') { leaf(ctx, 120, cy + 6, 0.95, -0.7); leaf(ctx, 466, cy + 36, 0.85, 0.8); leaf(ctx, 448, cy - 40, 0.7, 0.2); }
  if (f.icon === 'cheese') { cheese(ctx, 140, cy - 18, 0.9); leaf(ctx, 470, cy + 10, 0.75, 0.6); leaf(ctx, 496, cy - 30, 0.55, -0.3); }
  if (f.icon === 'caramel') drizzle(ctx, 150, cy - 62, 290);
  // badges
  ctx.textBaseline = 'middle';
  ctx.beginPath(); ctx.arc(92, 664, 52, 0, 7); ctx.fillStyle = '#ffc900'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.stroke();
  ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.font = `34px ${D}`; ctx.fillText(f.protein + 'g', 92, 654); ctx.font = `700 15px ${B}`; ctx.fillText('PROTEIN', 92, 684);
  rr(ctx, 168, 636, 196, 56, 12); ctx.fillStyle = '#000'; ctx.fill();
  ctx.fillStyle = CREAM; ctx.font = `19px ${D}`; ctx.fillText('BAKED NOT', 266, 655); ctx.fillText('FRIED', 266, 678);
  ctx.fillStyle = '#000'; ctx.textAlign = 'right'; ctx.font = `40px ${D}`; ctx.fillText(f.weight + ' g', W - 44, 660);
  ctx.font = `700 14px ${B}`; ctx.fillText('NET WT · ₹149', W - 44, 690);
  // inner frame
  ctx.lineWidth = 6; ctx.strokeStyle = '#000'; rr(ctx, 18, 98, W - 36, H - 160, 26); ctx.stroke();
}

/* ---- back label ---- */
function back(ctx, f) {
  const W = 576, H = 768;
  ctx.fillStyle = CREAM; ctx.fillRect(0, 0, W, H);
  crimp(ctx, 0, 0, W, 66, f.color); crimp(ctx, 0, H - 50, W, 50, f.color);
  ctx.fillStyle = f.color; ctx.fillRect(0, 66, W, 92); ctx.fillRect(0, 66, W, 4);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 156, W, 5);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `40px ${D}`; ctx.fillText('THE WHOLE TRUTH', 34, 112);
  // table
  const x0 = 34, x1 = W - 34, top = 186;
  ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.strokeRect(x0, top, x1 - x0, 352);
  ctx.font = `26px ${D}`; ctx.fillText('NUTRITION', x0 + 16, top + 30);
  ctx.font = `700 14px ${B}`; ctx.textAlign = 'right'; ctx.fillText('PER 100 g', x1 - 150, top + 32); ctx.fillText(`PER PACK (${f.weight} g)`, x1 - 14, top + 32);
  ctx.fillRect(x0, top + 52, x1 - x0, 6);
  ROWS.forEach((r, i) => {
    const y = top + 82 + i * 31;
    const sub = r === 'of which sugars' || r === 'Saturated fat' || r === 'Trans fat';
    if (i === 1) { ctx.fillStyle = '#ffc900'; ctx.fillRect(x0 + 3, y - 15, x1 - x0 - 6, 30); ctx.fillStyle = '#000'; }
    ctx.textAlign = 'left'; ctx.font = `${i === 0 ? '700 19px' : sub ? '500 16px' : '700 17px'} ${B}`; ctx.fillText(r, x0 + (sub ? 34 : 16), y);
    ctx.textAlign = 'right'; ctx.font = `700 17px ${B}`; ctx.fillText(f.n100[i], x1 - 150, y); ctx.fillText(f.np[i], x1 - 14, y);
    if (i < ROWS.length - 1) { ctx.fillRect(x0 + 10, y + 15, x1 - x0 - 20, i === 0 ? 4 : 1.5); }
  });
  // ingredients
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = `20px ${D}`; ctx.fillText('INGREDIENTS', 34, 576);
  ctx.font = `500 16px ${B}`; wrap(ctx, f.ing, 34, 602, W - 68, 21);
  // badges + barcode
  const tags = ['NO PALM OIL', 'NO MAIDA', 'BAKED'];
  let tx = 34; ctx.font = `700 14px ${B}`; ctx.textBaseline = 'middle';
  tags.forEach((t) => { const w = ctx.measureText(t).width + 26; rr(ctx, tx, 662, w, 32, 8); ctx.fillStyle = '#000'; ctx.fill(); ctx.fillStyle = CREAM; ctx.fillText(t, tx + 13, 678); tx += w + 8; });
  const R = rng(f.weight * 7 + f.protein);
  let bx = W - 150; ctx.fillStyle = '#000';
  while (bx < W - 36) { const w = 1 + Math.floor(R() * 4); if (R() > 0.35) ctx.fillRect(bx, 650, w, 46); bx += w + 1 + Math.floor(R() * 2); }
  ctx.font = `600 12px ${B}`; ctx.textAlign = 'left'; ctx.fillText('crunchco.in · Made in Pune · Best within 6 months', 34, 708);
}

export function drawAtlas(f) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 768;
  const ctx = c.getContext('2d');
  const sx = 512 / 576;
  ctx.save(); ctx.scale(sx, 1); front(ctx, f); ctx.restore();
  ctx.save(); ctx.translate(512, 0); ctx.scale(sx, 1); back(ctx, f); ctx.restore();
  return c;
}

// flat illustrated packshot (for cards, picker rows and box slots)
export function drawPackshot(canvas, f, atlas) {
  const ctx = canvas.getContext('2d'); const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const k = W / 360;
  ctx.save(); ctx.scale(k, k);
  const x0 = 46, x1 = 304, y0 = 24, y1 = 392, teeth = 15;
  const path = () => {
    ctx.beginPath(); ctx.moveTo(x0, y0);
    for (let i = 1; i <= teeth; i++) ctx.lineTo(x0 + (x1 - x0) * (i - 0.5) / teeth, y0 - 7), ctx.lineTo(x0 + (x1 - x0) * i / teeth, y0);
    ctx.lineTo(x1, y0 + 46); ctx.quadraticCurveTo(x1 - 12, (y0 + y1) / 2, x1, y1 - 40); ctx.lineTo(x1, y1);
    for (let i = teeth - 1; i >= 0; i--) ctx.lineTo(x0 + (x1 - x0) * (i + 0.5) / teeth, y1 + 7), ctx.lineTo(x0 + (x1 - x0) * i / teeth, y1);
    ctx.lineTo(x0, y1 - 40); ctx.quadraticCurveTo(x0 + 12, (y0 + y1) / 2, x0, y0 + 46); ctx.closePath();
  };
  ctx.save(); ctx.translate(11, 11); path(); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  ctx.save(); path(); ctx.clip();
  ctx.drawImage(atlas, 0, 0, 512, 768, x0 - 6, y0 - 8, (x1 - x0) + 12, (y1 - y0) + 16);
  let g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, 'rgba(0,0,0,.22)'); g.addColorStop(0.12, 'rgba(255,255,255,.18)'); g.addColorStop(0.26, 'rgba(255,255,255,0)'); g.addColorStop(0.72, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.28)');
  ctx.fillStyle = g; ctx.fillRect(x0, y0 - 10, x1 - x0, y1 - y0 + 20);
  ctx.fillStyle = 'rgba(255,255,255,.34)'; ctx.beginPath(); ctx.moveTo(x0 + 34, y0 + 60); ctx.lineTo(x0 + 58, y0 + 60); ctx.lineTo(x0 + 40, y1 - 60); ctx.lineTo(x0 + 22, y1 - 60); ctx.closePath(); ctx.fill();
  ctx.restore();
  path(); ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.strokeStyle = '#000'; ctx.stroke();
  ctx.restore();
}
