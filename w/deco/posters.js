// Six art deco travel posters for the gallery, flat colour in the house palette.
import { dome, cusped, circle } from './palace.js';

const f = (n) => Math.round(n * 10) / 10;
const M = (x, y) => `M${f(x)} ${f(y)}`;
const L = (x, y) => `L${f(x)} ${f(y)}`;
const C = (a, b, c, d, e, g) => `C${f(a)} ${f(b)} ${f(c)} ${f(d)} ${f(e)} ${f(g)}`;
const Q = (a, b, c, d) => `Q${f(a)} ${f(b)} ${f(c)} ${f(d)}`;
const E = '#0f3d33', D = '#0a2a23', G = '#d4af37', G2 = '#e9cf7a', CH = '#f6efe0', K = '#0b0b0a', T = '#c4693f', N = '#14243b';

function wedge(cx, cy, r, a0, a1) {
  return M(cx, cy) + L(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r) + `A${r} ${r} 0 0 1 ${f(cx + Math.cos(a1) * r)} ${f(cy + Math.sin(a1) * r)}Z`;
}
function sunburst(cx, cy, r, n, col, a0 = Math.PI, a1 = 2 * Math.PI) {
  let d = '';
  for (let i = 0; i < n; i += 2) d += wedge(cx, cy, r, a0 + (i / n) * (a1 - a0), a0 + ((i + 1) / n) * (a1 - a0));
  return `<path d="${d}" fill="${col}"/>`;
}
// filled palace silhouette (full width), base at (cx, yb), scale s
function palaceSil(cx, yb, s, col) {
  let d = M(cx - 150 * s, yb) + L(cx - 150 * s, yb - 46 * s) + L(cx - 140 * s, yb - 46 * s) + L(cx - 140 * s, yb - 74 * s) + L(cx - 60 * s, yb - 74 * s) + L(cx - 60 * s, yb - 110 * s) + L(cx - 34 * s, yb - 110 * s);
  d += C(cx - 38 * s, yb - 140 * s, cx - 14 * s, yb - 162 * s, cx, yb - 172 * s) + L(cx, yb - 190 * s) + L(cx + 2 * s, yb - 172 * s);
  d += C(cx + 14 * s, yb - 162 * s, cx + 38 * s, yb - 140 * s, cx + 34 * s, yb - 110 * s) + L(cx + 60 * s, yb - 110 * s) + L(cx + 60 * s, yb - 74 * s) + L(cx + 140 * s, yb - 74 * s) + L(cx + 140 * s, yb - 46 * s) + L(cx + 150 * s, yb - 46 * s) + L(cx + 150 * s, yb) + 'Z';
  let ch = '';
  for (const x of [-130, -96, 96, 130]) ch += dome(cx + x * s, yb - 74 * s, 10 * s, 20 * s) + 'Z' + M(cx + (x - 8) * s, yb - 74 * s) + L(cx + (x + 8) * s, yb - 74 * s) + L(cx + (x + 8) * s, yb - 66 * s) + L(cx + (x - 8) * s, yb - 66 * s) + 'Z';
  for (const x of [-48, 48]) ch += dome(cx + x * s, yb - 110 * s, 8 * s, 18 * s) + 'Z';
  return `<path d="${d}${ch}" fill="${col}"/>`;
}
function windows(cx, yb, s, col) {
  let d = '';
  for (let i = -6; i <= 6; i++) d += cusped(cx + i * 21 * s, yb - 8 * s, 11 * s, 16 * s, 3) + 'Z';
  for (let i = -2; i <= 2; i++) d += cusped(cx + i * 20 * s, yb - 80 * s, 9 * s, 14 * s, 3) + 'Z';
  return `<path d="${d}" fill="${col}"/>`;
}
function bands(x, y, w, n, gap, h, col) {
  let d = '';
  for (let i = 0; i < n; i++) d += `M${x} ${f(y + i * gap)}h${w}v${h}h-${w}Z`;
  return `<path d="${d}" fill="${col}"/>`;
}
function title(main, sub, fg, line = G) {
  return `<g font-family="'Poiret One', 'Josefin Sans', sans-serif" text-anchor="middle">
    <path d="M40 348H260M40 352H260" stroke="${line}" stroke-width="1"/>
    <text x="150" y="380" font-size="${main.length > 12 ? 22 : 25}" letter-spacing="2" fill="${fg}"${main.length > 11 ? ' textLength="232" lengthAdjust="spacingAndGlyphs"' : ''}>${main}</text>
    <text x="150" y="402" font-size="9.5" letter-spacing="4" fill="${line}" font-family="'Josefin Sans', sans-serif"${sub.length > 22 ? ' textLength="226" lengthAdjust="spacingAndGlyphs"' : ''}>${sub}</text>
  </g>`;
}
function frame(col) {
  return `<rect x="10" y="10" width="280" height="400" fill="none" stroke="${col}" stroke-width="1.2"/><rect x="16" y="16" width="268" height="388" fill="none" stroke="${col}" stroke-width=".6"/>`;
}

export const POSTERS = [
  {
    key: 'pichola', label: 'Poster: Lake Pichola at sunset, the palace before a golden sunburst',
    svg: () => `<rect width="300" height="420" fill="${D}"/>
      <linearGradient id="pp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${E}"/><stop offset="1" stop-color="#1f5c4c"/></linearGradient>
      <rect x="0" y="0" width="300" height="250" fill="url(#pp-sky)"/>
      ${sunburst(150, 236, 260, 36, 'rgba(212,175,55,.22)')}
      <circle cx="150" cy="150" r="74" fill="${G}"/><circle cx="150" cy="150" r="62" fill="${G2}"/>
      ${palaceSil(150, 250, 0.96, K)}${windows(150, 250, 0.96, G)}
      <rect x="0" y="250" width="300" height="94" fill="${D}"/>
      ${bands(70, 258, 160, 7, 11, 3, G)}${bands(40, 262, 40, 5, 12, 2, 'rgba(212,175,55,.5)')}${bands(220, 266, 40, 5, 12, 2, 'rgba(212,175,55,.5)')}
      ${frame(G)}${title('LAKE PICHOLA', 'UDAIPUR · RAJASTHAN', CH)}`,
  },
  {
    key: 'goldbar', label: 'Poster: The Gold Bar, a gold coupe glass before a deco fan',
    svg: () => `<rect width="300" height="420" fill="${K}"/>
      ${sunburst(150, 300, 300, 30, '#1b1a14')}
      <path d="M150 300m-130 0a130 130 0 0 1 260 0" fill="none" stroke="${G}" stroke-width="2"/>
      <path d="M150 300m-112 0a112 112 0 0 1 224 0" fill="none" stroke="${G}" stroke-width="1"/>
      <path d="M86 128H214C210 178 184 204 150 204C116 204 90 178 86 128Z" fill="${G}"/>
      <path d="M96 140H204C200 172 180 192 150 192C120 192 100 172 96 140Z" fill="${G2}"/>
      <rect x="147" y="203" width="6" height="94" fill="${G}"/><path d="M112 306Q150 290 188 306Z" fill="${G}"/>
      <circle cx="186" cy="116" r="12" fill="${T}"/><path d="M190 105C196 84 210 72 228 66" stroke="${G}" stroke-width="2" fill="none"/>
      ${frame(G)}${title('THE GOLD BAR', 'COCKTAILS · JAZZ · LATE', G2)}`,
  },
  {
    key: 'monsoon', label: 'Poster: Monsoon season, a peacock fanning its tail in the rain',
    svg: () => {
      let tail = '', eyes = '', rain = '';
      for (let i = 0; i < 13; i++) {
        const a = Math.PI + 0.12 + (i / 12) * (Math.PI - 0.24);
        const x = 150 + Math.cos(a) * 118, y = 262 + Math.sin(a) * 118;
        tail += M(150, 262) + L(x, y) + ' ';
        eyes += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="13" ry="17" transform="rotate(${f((a * 180) / Math.PI + 90)} ${f(x)} ${f(y)})" fill="${G}"/><ellipse cx="${f(x)}" cy="${f(y)}" rx="6" ry="8" transform="rotate(${f((a * 180) / Math.PI + 90)} ${f(x)} ${f(y)})" fill="${N}"/>`;
      }
      for (let i = 0; i < 26; i++) { const x = (i * 37) % 300, y = (i * 53) % 330; rain += M(x, y) + L(x - 8, y + 26); }
      return `<rect width="300" height="420" fill="${E}"/>
      <path d="${rain}" stroke="rgba(246,239,224,.25)" stroke-width="1.4"/>
      <path d="M32 262A118 118 0 0 1 268 262Z" fill="${D}"/>
      <path d="${tail}" stroke="${G}" stroke-width="1"/>${eyes}
      <path d="M150 300C136 296 132 278 140 262C146 248 144 230 138 220C134 212 140 204 148 206C158 208 160 220 156 232C152 246 156 262 164 272C172 284 166 300 150 300Z" fill="#1d6f86"/>
      <path d="M140 210L132 206L141 214Z" fill="${G}"/><circle cx="146" cy="212" r="2" fill="${CH}"/>
      <path d="M146 206L142 192M148 206L150 191M150 207L157 194" stroke="${G}" stroke-width="1.2"/>
      <rect x="0" y="300" width="300" height="44" fill="${D}"/>${bands(40, 310, 220, 3, 10, 2, 'rgba(212,175,55,.6)')}
      ${frame(G)}${title('MONSOON SEASON', 'JULY TO SEPTEMBER', CH)}`;
    },
  },
  {
    key: 'boat', label: 'Poster: Arrive by boat under a crescent moon',
    svg: () => `<rect width="300" height="420" fill="${N}"/>
      <path d="M216 52C190 58 178 84 190 108C200 126 224 130 240 118C218 116 202 98 206 78C208 66 212 58 216 52Z" fill="${G2}"/>
      ${[[50, 60], [90, 120], [130, 44], [250, 170], [70, 180], [180, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${CH}"/>`).join('')}
      ${palaceSil(150, 214, 0.55, '#0c1626')}
      <rect x="0" y="214" width="300" height="130" fill="#0d1a2c"/>
      <path d="M60 262C90 290 210 290 240 262L250 248L50 248Z" fill="${G}"/>
      <path d="M118 248V214M182 248V214M110 214Q150 196 190 214Z" fill="none" stroke="${G}" stroke-width="2"/>
      <path d="M118 214H182V248H118Z" fill="rgba(212,175,55,.25)"/>
      ${[80, 104, 196, 220].map((x) => `<circle cx="${x}" cy="238" r="4" fill="${G2}"/><circle cx="${x}" cy="238" r="9" fill="rgba(233,207,122,.25)"/>`).join('')}
      ${bands(80, 292, 140, 4, 10, 2, 'rgba(233,207,122,.55)')}
      ${frame(G)}${title('ARRIVE BY BOAT', 'FROM LAL GHAT JETTY', CH)}`,
  },
  {
    key: 'terrace', label: 'Poster: Sunset on the terrace between two palms',
    svg: () => {
      const palm = (x, s, flip) => {
        let d = M(x - 4 * s, 344) + C(x - 2 * s, 280, x + 10 * s * flip, 220, x + 18 * s * flip, 180) + L(x + 24 * s * flip, 182) + C(x + 16 * s * flip, 222, x + 6 * s, 282, x + 6 * s, 344) + 'Z';
        const tx = x + 21 * s * flip, ty = 180;
        for (const [dx, dy] of [[-70, 20], [-58, -14], [-24, -40], [20, -40], [56, -12], [70, 22]]) {
          const ex = tx + dx * s, ey = ty + dy * s;
          d += M(tx, ty) + Q((tx + ex) / 2, Math.min(ty, ey) - 22 * s, ex, ey) + Q((tx + ex) / 2, Math.min(ty, ey) - 4 * s, tx, ty) + 'Z';
        }
        return `<path d="${d}" fill="${K}"/>`;
      };
      return `<linearGradient id="pt-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26453b"/><stop offset=".55" stop-color="${T}"/><stop offset="1" stop-color="${G2}"/></linearGradient>
      <rect width="300" height="420" fill="url(#pt-sky)"/>
      <circle cx="150" cy="236" r="64" fill="${G2}"/>${bands(80, 220, 140, 6, 12, 4, '#d58a52')}
      <rect x="0" y="262" width="300" height="82" fill="${E}"/>
      ${bands(30, 272, 240, 6, 11, 2, 'rgba(233,207,122,.45)')}
      ${palm(52, 1, 1)}${palm(248, 0.86, -1)}
      <path d="M0 330H300V420H0Z" fill="${K}"/>
      ${frame(CH)}${title('THE TERRACE', 'SUNSET · DINNER · LANTERNS', CH, CH)}`;
    },
  },
  {
    key: 'lotus', label: 'Poster: The Lotus Court spa, an emerald lotus on still water',
    svg: () => {
      const petal = (ang, len, w, col) => {
        const a = (ang - 90) * Math.PI / 180, cx = 150, by = 250;
        const ex = cx + Math.cos(a) * len, ey = by + Math.sin(a) * len, nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
        const mx = cx + Math.cos(a) * len * 0.55, my = by + Math.sin(a) * len * 0.55;
        return `<path d="${M(cx, by)}${Q(mx + nx, my + ny, ex, ey)}${Q(mx - nx, my - ny, cx, by)}Z" fill="${col}"/>`;
      };
      return `<rect width="300" height="420" fill="${CH}"/>
      ${sunburst(150, 250, 220, 40, 'rgba(212,175,55,.18)')}
      ${[150, 120, 90, 60].map((r, i) => `<ellipse cx="150" cy="268" rx="${r}" ry="${r * 0.2}" fill="none" stroke="${i % 2 ? G : E}" stroke-width="1.2"/>`).join('')}
      ${petal(-80, 96, 24, '#1f5c4c')}${petal(80, 96, 24, '#1f5c4c')}${petal(-52, 120, 28, '#174d40')}${petal(52, 120, 28, '#174d40')}${petal(-24, 136, 30, E)}${petal(24, 136, 30, E)}${petal(0, 150, 32, D)}
      <path d="M150 116V240" stroke="${G}" stroke-width="1"/>
      ${frame(E)}${title('THE LOTUS COURT', 'SPA · HAMMAM · YOGA', D, G)}`;
    },
  },
];

export function posterSVG(p) {
  return `<svg viewBox="0 0 300 420" role="img" aria-label="${p.label}">${p.svg()}</svg>`;
}
