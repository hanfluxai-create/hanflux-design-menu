// A monoline block-capital alphabet for bent-glass signage (cap height 100, y down).
// Each glyph: [advance width, path data using absolute M/L/C/Z only].
const G = {
  A: [66, 'M0 100L33 0L66 100M13 62L53 62'],
  B: [56, 'M0 50L0 0L30 0C44 0 52 10 52 25C52 40 44 50 30 50L0 50L0 100L33 100C48 100 56 90 56 75C56 60 48 50 33 50'],
  C: [60, 'M60 17C54 6 45 0 33 0C13 0 0 22 0 50C0 78 13 100 33 100C45 100 54 94 60 83'],
  D: [60, 'M0 0L0 100L24 100C46 100 60 80 60 50C60 20 46 0 24 0Z'],
  E: [48, 'M48 0L0 0L0 100L48 100M0 50L40 50'],
  F: [46, 'M46 0L0 0L0 100M0 50L38 50'],
  G: [64, 'M60 15C54 5 45 0 33 0C13 0 0 22 0 50C0 78 13 100 33 100C51 100 63 87 63 66L63 58L36 58'],
  H: [58, 'M0 0L0 100M58 0L58 100M0 50L58 50'],
  I: [0, 'M0 0L0 100'],
  K: [54, 'M0 0L0 100M54 0L4 58M19 42L54 100'],
  L: [44, 'M0 0L0 100L44 100'],
  M: [76, 'M0 100L0 0L38 66L76 0L76 100'],
  N: [60, 'M0 100L0 0L60 100L60 0'],
  O: [70, 'M35 0C14 0 0 22 0 50C0 78 14 100 35 100C56 100 70 78 70 50C70 22 56 0 35 0Z'],
  P: [52, 'M0 100L0 0L30 0C44 0 52 11 52 26C52 41 44 52 30 52L0 52'],
  R: [54, 'M0 100L0 0L30 0C44 0 52 11 52 26C52 41 44 52 30 52L0 52M28 52L54 100'],
  S: [52, 'M50 14C45 5 37 0 26 0C12 0 2 9 2 24C2 53 52 43 52 74C52 90 41 100 26 100C14 100 5 94 0 84'],
  T: [60, 'M0 0L60 0M30 0L30 100'],
  U: [58, 'M0 0L0 68C0 88 12 100 29 100C46 100 58 88 58 68L58 0'],
  V: [62, 'M0 0L31 100L62 0'],
  W: [92, 'M0 0L21 100L46 28L71 100L92 0'],
  Y: [60, 'M0 0L30 50L60 0M30 50L30 100'],
  0: [56, 'M28 0C11 0 0 21 0 50C0 79 11 100 28 100C45 100 56 79 56 50C56 21 45 0 28 0Z'],
  1: [24, 'M0 20L24 0L24 100'],
  2: [54, 'M3 22C6 8 16 0 28 0C42 0 52 10 52 26C52 46 30 64 0 100L54 100'],
  3: [54, 'M3 13C9 4 17 0 28 0C42 0 51 9 51 24C51 38 41 47 25 47C43 47 54 58 54 74C54 90 42 100 27 100C15 100 6 95 0 86'],
  '&': [62, 'M60 100L14 42C8 34 6 27 6 21C6 8 15 0 27 0C38 0 46 8 46 19C46 32 35 40 22 48C8 57 0 66 0 78C0 92 12 100 27 100C44 100 55 90 62 70'],
  '·': [0, 'M0 46C2 46 4 48 4 50C4 52 2 54 0 54C-2 54 -4 52 -4 50C-4 48 -2 46 0 46Z'],
  ' ': [34, ''],
};

// Lay out a string; returns path data scaled by `size` (cap height in user units) at (x, y top).
export function neonText(str, { x = 0, y = 0, size = 100, tracking = 26 } = {}) {
  const s = size / 100;
  let pen = 0;
  const parts = [];
  for (const ch of str) {
    const g = G[ch] || G[' '];
    if (g[1]) parts.push(g[1].replace(/(-?\d*\.?\d+)\s+(-?\d*\.?\d+)/g, (_, a, b) =>
      `${+(x + (pen + +a) * s).toFixed(1)} ${+(y + +b * s).toFixed(1)}`));
    pen += g[0] + tracking;
  }
  return { d: parts.join(''), width: (pen - tracking) * s };
}

export function measure(str, tracking = 26) {
  let pen = 0;
  for (const ch of str) pen += (G[ch] || G[' '])[0] + tracking;
  return pen - tracking;
}
