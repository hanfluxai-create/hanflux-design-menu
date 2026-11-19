// Secondary neon pieces: the OPEN TILL 3 AM sign, six room posters, chaser arrows.
import { neonText, measure } from './neonfont.js';

const r1 = (n) => +n.toFixed(1);
function circle(cx, cy, r) {
  const k = 0.5523 * r;
  return `M${r1(cx)} ${r1(cy - r)}C${r1(cx + k)} ${r1(cy - r)} ${r1(cx + r)} ${r1(cy - k)} ${r1(cx + r)} ${r1(cy)}C${r1(cx + r)} ${r1(cy + k)} ${r1(cx + k)} ${r1(cy + r)} ${r1(cx)} ${r1(cy + r)}C${r1(cx - k)} ${r1(cy + r)} ${r1(cx - r)} ${r1(cy + k)} ${r1(cx - r)} ${r1(cy)}C${r1(cx - r)} ${r1(cy - k)} ${r1(cx - k)} ${r1(cy - r)} ${r1(cx)} ${r1(cy - r)}Z`;
}
function ellipse(cx, cy, rx, ry) {
  const kx = 0.5523 * rx, ky = 0.5523 * ry;
  return `M${r1(cx)} ${r1(cy - ry)}C${r1(cx + kx)} ${r1(cy - ry)} ${r1(cx + rx)} ${r1(cy - ky)} ${r1(cx + rx)} ${r1(cy)}C${r1(cx + rx)} ${r1(cy + ky)} ${r1(cx + kx)} ${r1(cy + ry)} ${r1(cx)} ${r1(cy + ry)}C${r1(cx - kx)} ${r1(cy + ry)} ${r1(cx - rx)} ${r1(cy + ky)} ${r1(cx - rx)} ${r1(cy)}C${r1(cx - rx)} ${r1(cy - ky)} ${r1(cx - kx)} ${r1(cy - ry)} ${r1(cx)} ${r1(cy - ry)}Z`;
}
function centered(str, cx, y, size, tracking = 26, c = 'p', id) {
  const w = measure(str, tracking) * size / 100;
  return { id: id || str, c, d: neonText(str, { x: cx - w / 2, y, size, tracking }).d };
}
function star(cx, cy, r) {
  const k = r * 0.22;
  return `M${cx} ${cy - r}C${cx + k * 0.4} ${cy - k} ${cx + k} ${cy - k * 0.4} ${cx + r} ${cy}C${cx + k} ${cy + k * 0.4} ${cx + k * 0.4} ${cy + k} ${cx} ${cy + r}C${cx - k * 0.4} ${cy + k} ${cx - k} ${cy + k * 0.4} ${cx - r} ${cy}C${cx - k} ${cy - k * 0.4} ${cx - k * 0.4} ${cy - k} ${cx} ${cy - r}Z`;
}

export function openSign() {
  const tubes = [];
  tubes.push({ id: 'frame', c: 'b', d: 'M46 18L514 18C535 18 546 29 546 50L546 250C546 271 535 282 514 282L46 282C25 282 14 271 14 250L14 50C14 29 25 18 46 18Z' });
  const tr = 30, size = 112;
  let x = 280 - (measure('OPEN', tr) * size / 100) / 2;
  for (const ch of 'OPEN') {
    const t = neonText(ch, { x, y: 46, size, tracking: tr });
    tubes.push({ id: 'o' + ch, c: 'p', d: t.d });
    x += t.width + tr * size / 100;
  }
  tubes.push(centered('TILL 3 AM', 280, 192, 50, 28, 'a', 'till'));
  return { vb: [0, 0, 560, 300], tubes, T: 9 };
}

export const POSTERS = {
  bar: () => ({
    vb: [0, 0, 300, 400], T: 7, spill: 'rgba(255,178,46,.3)',
    tubes: [
      { id: 'bowl', c: 'a', d: 'M58 128L242 128C238 186 196 214 150 214C104 214 62 186 58 128Z M150 214L150 290 M104 300Q150 286 196 300' },
      { id: 'line', c: 'a', d: 'M74 150L226 150' },
      { id: 'cherry', c: 'p', d: circle(204, 112, 15) + ' M210 98C218 74 232 62 252 56' },
      centered('BAR', 150, 324, 40, 22, 'b', 'txt'),
    ],
  }),
  booth: () => ({
    vb: [0, 0, 300, 400], T: 7, spill: 'rgba(41,226,255,.3)',
    tubes: [
      { id: 'disc', c: 'b', d: circle(138, 170, 96) + ' ' + circle(138, 170, 66) },
      { id: 'label', c: 'p', d: circle(138, 170, 24) + ' ' + circle(138, 170, 3) },
      { id: 'arm', c: 'a', d: 'M256 58L256 102L206 196L188 204 M246 58L266 58' },
      centered('LIVE', 150, 314, 44, 24, 'p', 'txt'),
    ],
  }),
  floor: () => ({
    vb: [0, 0, 300, 400], T: 6.5, spill: 'rgba(41,226,255,.28)',
    tubes: [
      { id: 'hang', c: 'a', d: 'M150 18L150 82' },
      { id: 'ball', c: 'b', d: circle(150, 166, 84) + ' ' + ellipse(150, 166, 84, 30) + ' ' + ellipse(150, 166, 84, 62) + ' M150 82L150 250 ' + ellipse(150, 166, 42, 84) },
      { id: 'spark', c: 'p', d: star(250, 84, 22) + ' ' + star(54, 240, 16) + ' ' + star(236, 268, 12) },
      centered('DANCE', 150, 314, 40, 22, 'p', 'txt'),
    ],
  }),
  kiss: () => ({
    vb: [0, 0, 300, 400], T: 7, spill: 'rgba(255,43,214,.32)',
    tubes: [
      { id: 'upper', c: 'p', d: 'M46 178C76 140 110 134 150 158C190 134 224 140 254 178C214 190 186 192 150 188C114 192 86 190 46 178Z' },
      { id: 'lower', c: 'p', d: 'M46 178C70 236 112 256 150 256C188 256 230 236 254 178' },
      centered('KISS & TELL', 150, 304, 30, 20, 'a', 'txt'),
    ],
  }),
  eat: () => ({
    vb: [0, 0, 300, 400], T: 7, spill: 'rgba(255,178,46,.3)',
    tubes: [
      { id: 'moon', c: 'a', d: 'M178 64C120 70 82 118 86 174C90 232 140 274 198 268C166 254 142 222 140 180C138 132 156 88 178 64Z' },
      { id: 'stars', c: 'b', d: star(226, 104, 20) + ' ' + star(240, 196, 12) + ' ' + star(62, 92, 10) },
      centered('EAT LATE', 150, 314, 38, 22, 'p', 'txt'),
    ],
  }),
  alley: () => ({
    vb: [0, 0, 300, 400], T: 6.5, spill: 'rgba(41,226,255,.26)',
    tubes: [
      { id: 'trunk', c: 'a', d: 'M146 292C142 240 146 196 162 150 M139 270L153 268 M141 240L155 240 M146 210L160 212 M153 180L166 183' },
      { id: 'fronds', c: 'b', d: 'M164 146C132 116 92 120 66 150 M164 146C196 112 236 116 256 144 M164 146C152 98 120 80 92 82 M164 146C180 98 212 82 238 90 M164 146C166 104 174 76 190 58 M164 146C140 140 112 160 100 190 M164 146C190 142 216 160 228 188' },
      centered('ALLEY', 150, 314, 40, 22, 'p', 'txt'),
    ],
  }),
};

export function arrow(dir = 'right', c = 'a') {
  if (dir === 'down') {
    return {
      vb: [0, 0, 64, 150], T: 5,
      chev: ['M14 8L32 26L50 8', 'M14 40L32 58L50 40', 'M14 72L32 90L50 72'],
      tubes: [{ id: 'head', c, d: 'M32 96L32 140 M14 122L32 140L50 122' }],
    };
  }
  return {
    vb: [0, 0, 150, 56], T: 5,
    chev: ['M6 10L24 28L6 46', 'M34 10L52 28L34 46', 'M62 10L80 28L62 46'],
    tubes: [{ id: 'head', c, d: 'M92 28L140 28 M122 10L140 28L122 46' }],
  };
}
