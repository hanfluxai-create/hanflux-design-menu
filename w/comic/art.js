// Comic art kit for Boom Burger: bursts, speed lines, fries, shake, food truck, origin panels.
import { rng, smooth, defs as burgerDefs, burger } from './burger.js';
const f = (n) => Math.round(n * 10) / 10;
const INK = '#111';

export function burstPath(cx, cy, r1, r2, n = 14, seed = 1) {
  const r = rng(seed); const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 ? r2 * (0.9 + r() * 0.2) : r1 * (0.86 + r() * 0.28);
    pts.push(`${f(cx + Math.cos(a) * rad)} ${f(cy + Math.sin(a) * rad * 0.82)}`);
  }
  return 'M' + pts.join('L') + 'Z';
}
export function burstSVG(text, { fill = '#ffd400', color = '#e63223', stroke = INK, w = 320, h = 220, seed = 3, size = 64, rot = -8, n = 13 } = {}) {
  const d = burstPath(w / 2, h / 2, w * 0.48, w * 0.3, n, seed);
  return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true" class="burst-svg">
    <path d="${d}" fill="${INK}" transform="translate(6 7)"/>
    <path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>
    <g transform="rotate(${rot} ${w / 2} ${h / 2})"><text x="${w / 2}" y="${h / 2 + size * 0.36}" text-anchor="middle" font-family="Bangers, Impact, sans-serif" font-size="${size}" letter-spacing="2" fill="${color}" stroke="${INK}" stroke-width="6" paint-order="stroke" stroke-linejoin="round">${text}</text></g>
  </svg>`;
}
export function speedLines(cx, cy, n = 64, r0 = 200, r1 = 900, seed = 9, color = INK) {
  const r = rng(seed); let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.05, w = 0.006 + r() * 0.014, s = r0 * (0.75 + r() * 0.6);
    d += `M${f(cx + Math.cos(a - w) * r1)} ${f(cy + Math.sin(a - w) * r1)}L${f(cx + Math.cos(a) * s)} ${f(cy + Math.sin(a) * s)}L${f(cx + Math.cos(a + w) * r1)} ${f(cy + Math.sin(a + w) * r1)}Z`;
  }
  return `<path d="${d}" fill="${color}"/>`;
}

function inkd(d, fill, sw = 4.5, off = [3, 4], inner = '') {
  return `<path d="${d}" fill="${INK}" transform="translate(${off[0]} ${off[1]})"/><path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>${inner}`;
}

export function friesSVG(attrs = '') {
  const r = rng(12); let fries = '';
  const sticks = [[200, 150, -14], [228, 128, -6], [256, 118, 2], [284, 122, 8], [312, 134, 14], [214, 176, -20], [298, 160, 18], [242, 150, -2], [270, 146, 6], [340, 170, 22], [186, 196, -26]];
  for (const [x, y, a] of sticks) {
    const h = 130 + r() * 30;
    fries += `<g transform="rotate(${a} ${x} ${y + h})"><path d="M${x - 11} ${y}h22v${h}h-22z" fill="${INK}" transform="translate(3 3)"/><path d="M${x - 11} ${y}h22v${h}h-22z" fill="#ffc93a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M${x + 3} ${y + 2}h7v${h - 4}h-7z" fill="#f09a1a"/><path d="M${x - 7} ${y + 8}v${f(h * 0.5)}" stroke="#fff3c2" stroke-width="3" stroke-linecap="round"/><path d="M${x - 11} ${y}h22v10h-22z" fill="#e0861c"/></g>`;
  }
  const boat = 'M120 290L408 290L380 446C378 456 370 462 360 462L168 462C158 462 150 456 148 446Z';
  const sauceD = 'M168 232C200 214 236 236 262 222C290 208 320 230 350 218C372 210 380 226 368 238C350 256 330 246 316 262C312 286 300 290 296 270C290 252 270 262 252 268C236 300 222 300 222 276C222 262 200 262 186 260C164 258 152 244 168 232Z';
  return `<svg viewBox="0 0 520 520" ${attrs}>${burgerDefs()}
    <ellipse cx="266" cy="482" rx="180" ry="16" fill="url(#dotsInk)" opacity=".5"/>
    ${fries}
    ${inkd(sauceD, '#ffbe1a', 4, [2, 3], '<path d="M200 236C230 228 250 240 270 232" stroke="#fff3b0" stroke-width="5" stroke-linecap="round" fill="none"/>')}
    <g>${[[214, 246], [300, 238], [256, 252]].map(([x, y], i) => `<g transform="rotate(${i * 30 - 20} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="15" ry="7" fill="#3f9b2a" stroke="${INK}" stroke-width="3"/><ellipse cx="${x}" cy="${y}" rx="8" ry="3" fill="#c9ef8a"/></g>`).join('')}</g>
    ${inkd(boat, '#e63223', 5.5, [4, 5], `<path d="M150 300h240l-4 22h-232z" fill="#ff5a3d"/><path d="M200 330h24v118h-24zM262 330h24v118h-24zM324 330h24v118h-24z" fill="#fff7e3"/><path d="M178 446h180l2 -12h-184z" fill="#b51f12" opacity=".6"/>`)}
    <path d="${boat}" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/>
  </svg>`;
}

export function shakeSVG(attrs = '') {
  const glass = 'M150 170L370 170L346 430C344 446 334 456 318 456L202 456C186 456 176 446 174 430Z';
  return `<svg viewBox="0 0 520 520" ${attrs}>${burgerDefs()}
    <ellipse cx="262" cy="486" rx="150" ry="14" fill="url(#dotsInk)" opacity=".5"/>
    <path d="M232 130L300 20L322 30L262 140Z" fill="${INK}" transform="translate(3 4)"/>
    <path d="M232 130L300 20L322 30L262 140Z" fill="#fff7e3" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M248 104L306 12M258 116L312 26" stroke="#e63223" stroke-width="7"/>
    ${inkd('M140 176C120 160 136 130 166 136C164 104 204 94 222 116C232 82 290 82 300 114C320 96 362 106 358 134C390 132 400 166 376 178C362 190 156 192 140 176Z', '#fffaf0', 5, [3, 4], '<path d="M166 160C190 150 220 158 240 150C260 142 290 152 316 146" stroke="#e8dcc0" stroke-width="5" stroke-linecap="round" fill="none"/>')}
    <circle cx="270" cy="96" r="22" fill="${INK}" transform="translate(3 4)"/><circle cx="270" cy="96" r="22" fill="#e63223" stroke="${INK}" stroke-width="4.5"/><circle cx="262" cy="88" r="6" fill="#ff9a8a"/>
    <path d="M272 74C276 50 290 36 306 30" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    ${inkd(glass, '#ff8fb0', 5.5, [4, 5], `<path d="M150 170H380V230H150Z" fill="#ffb3c8"/><path d="M180 260L340 260L330 456H190Z" fill="#f2678f"/><path d="M180 260L340 260L330 456H190Z" fill="url(#dotsOrange)" opacity=".18"/><path d="M178 196L198 430" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".85"/><path d="M206 196L214 260" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>`)}
    <path d="M200 456h120v14c0 6-6 10-12 10h-96c-6 0-12-4-12-10z" fill="#ffd400" stroke="${INK}" stroke-width="4.5"/>
  </svg>`;
}

export function truckSVG(attrs = '', { night = false, queue = false } = {}) {
  const body = 'M60 120C60 104 72 92 88 92L420 92C432 92 440 98 444 108L470 160L536 178C552 182 560 194 560 210L560 300C560 312 552 318 540 318L72 318C64 318 60 312 60 304Z';
  const wheel = (x) => `<circle cx="${x}" cy="318" r="44" fill="${INK}"/><circle cx="${x}" cy="318" r="36" fill="#2b2b2b" stroke="${INK}" stroke-width="4"/><circle cx="${x}" cy="318" r="16" fill="#cfcfcf" stroke="${INK}" stroke-width="4"/><circle cx="${x - 5}" cy="313" r="4" fill="#fff"/>`;
  let awn = '';
  for (let i = 0; i < 8; i++) awn += `<path d="M${120 + i * 30} 128h30v34c0 8-6 14-15 14s-15-6-15-14z" fill="${i % 2 ? '#fff7e3' : '#e63223'}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
  const people = queue ? [[610, '#00a8e8'], [660, '#e63223'], [705, '#3f9b2a']].map(([x, c], i) => `<g><circle cx="${x}" cy="${222 - i * 4}" r="20" fill="#f1c39a" stroke="${INK}" stroke-width="4"/><path d="M${x - 26} 330C${x - 26} 270 ${x - 18} 246 ${x} 246C${x + 18} 246 ${x + 26} 270 ${x + 26} 330Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M${x - 8} ${218 - i * 4}h4M${x + 6} ${218 - i * 4}h4" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></g>`).join('') : '';
  return `<svg viewBox="0 0 ${queue ? 760 : 620} 380" ${attrs}>${burgerDefs()}
    ${night ? `<path d="M0 0H760V380H0Z" fill="none"/>` : ''}
    <ellipse cx="310" cy="364" rx="270" ry="12" fill="url(#dotsInk)" opacity=".55"/>
    ${inkd(body, '#ffd400', 6, [6, 7], `<path d="M60 236H560V262H60Z" fill="#e63223"/><path d="M60 262H560V318H60Z" fill="#f2b705"/><path d="M60 262H560V318H60Z" fill="url(#dotsOrange)" opacity=".35"/><path d="M88 100H400" stroke="#fff6a8" stroke-width="7" stroke-linecap="round"/>`)}
    <path d="M454 120L478 172L536 186V214H454Z" fill="#9fe3ff" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M466 132L480 166" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    <rect x="112" y="128" width="248" height="96" rx="6" fill="#2a1a12" stroke="${INK}" stroke-width="4.5"/>
    <rect x="128" y="150" width="70" height="60" rx="4" fill="#fff7e3" stroke="${INK}" stroke-width="3"/>
    <path d="M138 166h50M138 180h40M138 194h46" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="262" cy="186" r="22" fill="#f1c39a" stroke="${INK}" stroke-width="4"/><path d="M240 176C240 160 284 160 284 176Z" fill="#fff" stroke="${INK}" stroke-width="3.5"/><path d="M254 186h4M268 186h4M256 196q6 5 12 0" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>
    <rect x="320" y="196" width="36" height="12" rx="3" fill="#e63223" stroke="${INK}" stroke-width="3"/>
    ${awn}
    <path d="M112 224H364V232H112Z" fill="${INK}"/>
    <text x="310" y="294" text-anchor="middle" font-family="Bangers, Impact, sans-serif" font-size="34" letter-spacing="2" fill="#fff7e3" stroke="${INK}" stroke-width="6" paint-order="stroke">BOOM BURGER</text>
    <circle cx="546" cy="236" r="10" fill="#fff6a8" stroke="${INK}" stroke-width="3.5"/>
    ${wheel(160)}${wheel(468)}
    ${people}
  </svg>`;
}

// four little scenes for the origin strip, each 400x300
export const ORIGIN = [
  () => { // the griddle in a home kitchen
    const b = burger({ patties: 1, seed: 21, seeds: 0 }).find((l) => l.name === 'patty0').svg;
    return `<svg viewBox="0 0 400 300" aria-hidden="true">${burgerDefs()}
      <path d="M0 0H400V300H0Z" fill="#00a8e8"/>
      <path d="M0 0H400V300H0Z" fill="url(#dotsInk)" opacity=".12"/>
      <path d="M40 220H360L344 262H56Z" fill="#2b2b2b" stroke="#111" stroke-width="6" stroke-linejoin="round"/>
      <path d="M40 210H360V226H40Z" fill="#555" stroke="#111" stroke-width="5"/>
      <g transform="translate(-40 -150) scale(0.75)">${b}</g>
      <path d="M150 40L290 150" stroke="#111" stroke-width="16" stroke-linecap="round"/><path d="M150 40L290 150" stroke="#8a5a2b" stroke-width="9" stroke-linecap="round"/>
      <path d="M262 132L330 180L300 214L232 166Z" fill="#cfcfcf" stroke="#111" stroke-width="6" stroke-linejoin="round"/>
      <path d="M80 120c-10-16 10-26 0-42M120 112c-10-16 10-26 0-42M340 110c-10-16 10-26 0-42" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>
    </svg>`;
  },
  () => { // friends, then friends of friends
    const head = (x, y, c, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 120C-40 60 -26 44 0 44C26 44 40 60 40 120Z" fill="${c}" stroke="#111" stroke-width="5" stroke-linejoin="round"/><circle cx="0" cy="10" r="30" fill="#f1c39a" stroke="#111" stroke-width="5"/><path d="M-10 6h4M8 6h4" stroke="#111" stroke-width="4" stroke-linecap="round"/><path d="M-10 20q10 10 22 0" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
    return `<svg viewBox="0 0 400 300" aria-hidden="true">${burgerDefs()}
      <path d="M0 0H400V300H0Z" fill="#ffd400"/><path d="M0 0H400V300H0Z" fill="url(#dotsOrange)" opacity=".35"/>
      ${head(70, 170, '#e63223', 0.9)}${head(160, 150, '#00a8e8')}${head(250, 165, '#3f9b2a', 0.92)}${head(336, 180, '#111', 0.85)}
      <g><path d="M30 26H190V86H120L100 108L104 86H30Z" fill="#fff" stroke="#111" stroke-width="5" stroke-linejoin="round"/><text x="110" y="66" text-anchor="middle" font-family="Bangers, Impact" font-size="30" fill="#111">ONE MORE!</text></g>
      <g><path d="M214 20H384V80H330L318 104L312 80H214Z" fill="#fff" stroke="#111" stroke-width="5" stroke-linejoin="round"/><text x="299" y="60" text-anchor="middle" font-family="Bangers, Impact" font-size="22" fill="#e63223">WHO MADE THIS?!</text></g>
    </svg>`;
  },
  () => `<svg viewBox="0 0 400 300" aria-hidden="true">${burgerDefs()}
      <path d="M0 0H400V300H0Z" fill="#e63223"/><path d="M0 0H400V300H0Z" fill="url(#dotsDark)" opacity=".18"/>
      ${speedLines(200, 150, 40, 140, 420, 4, 'rgba(255,255,255,.18)')}
      <g transform="translate(36 42) scale(.54)">${truckSVG().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>
      <path d="M300 40l40 -24 8 14 -40 24z" fill="#ffd400" stroke="#111" stroke-width="5" stroke-linejoin="round"/><path d="M302 44l-20 34" stroke="#111" stroke-width="8" stroke-linecap="round"/>
      <path d="M352 70c10 4 14 14 6 20M366 52c14 6 20 20 8 30" stroke="#ffd400" stroke-width="5" fill="none" stroke-linecap="round"/>
    </svg>`,
  () => `<svg viewBox="0 0 400 300" aria-hidden="true">${burgerDefs()}
      <path d="M0 0H400V300H0Z" fill="#14123a"/>
      <path d="M330 34C312 38 302 56 310 74C318 88 336 92 350 84C334 82 322 70 324 54C326 46 328 40 330 34Z" fill="#ffd400" stroke="#111" stroke-width="4"/>
      ${[[40, 40], [90, 70], [150, 30], [220, 56], [270, 24]].map(([x, y]) => `<path d="M${x} ${y - 6}l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z" fill="#fff7e3"/>`).join('')}
      <path d="M0 96Q100 130 200 104T400 100" fill="none" stroke="#111" stroke-width="3"/>
      ${[30, 80, 130, 180, 230, 280, 330, 380].map((x, i) => `<circle cx="${x}" cy="${f(108 + Math.sin(i) * 8)}" r="7" fill="${i % 2 ? '#ffd400' : '#e63223'}" stroke="#111" stroke-width="3"/>`).join('')}
      <g transform="translate(6 120) scale(.5)">${truckSVG('', { queue: true }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>
      <path d="M0 290H400V300H0Z" fill="#111"/>
    </svg>`,
];
