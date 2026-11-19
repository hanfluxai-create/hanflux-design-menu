// Northbound travel posters: one series, six places, drawn in code (flat shapes, sun discs, sea lines, strong type).
const SERIF = "'DM Serif Display', Georgia, serif";
const MONO = "'Space Mono', ui-monospace, monospace";

function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const seaLines = (y0, y1, color, op, seed, w = 300) => {
  const r = rnd(seed); let out = '';
  for (let y = y0; y < y1; y += 7 + r() * 5) {
    let x = -10 + r() * 30;
    while (x < w) { const len = 18 + r() * 70; out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${len.toFixed(1)}" height="${(1 + r() * 1.3).toFixed(2)}" rx="1" fill="${color}" opacity="${op}"/>`; x += len + 8 + r() * 26; }
  }
  return out;
};

function frame(id, art, o, stamp) {
  const vb = stamp ? '0 0 300 312' : '0 0 300 400';
  const head = stamp ? `<text x="282" y="298" text-anchor="end" font-family="${MONO}" font-weight="700" font-size="30" fill="${o.light}">${o.value}</text>` :
    `<text x="22" y="34" font-family="${MONO}" font-weight="700" font-size="9" letter-spacing="2.4" fill="${o.mark}">NORTHBOUND</text>
     <text x="278" y="34" text-anchor="end" font-family="${MONO}" font-weight="700" font-size="9" letter-spacing="1.6" fill="${o.mark}">NO. ${o.num}</text>
     <rect x="0" y="312" width="300" height="88" fill="${o.band}"/>
     <text x="20" y="366" font-family="${SERIF}" font-size="50" fill="${o.light}" letter-spacing="-0.5">${o.name}</text>
     <text x="22" y="388" font-family="${MONO}" font-weight="700" font-size="8.6" letter-spacing="2.2" fill="${o.accent}">${o.sub}</text>
     <circle cx="268" cy="356" r="13" fill="none" stroke="${o.accent}" stroke-width="1.4"/><path d="M268 346l4.6 14.4-4.6-3-4.6 3z" fill="${o.accent}"/>`;
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs><clipPath id="c-${id}"><rect width="300" height="312"/></clipPath>${o.defs || ''}</defs><g clip-path="url(#c-${id})">${art}</g>${head}</svg>`;
}

function kyoto(id, stamp) {
  let pag = '';
  let y = 298;
  for (let i = 0; i < 5; i++) {
    const w = 58 - i * 8, rw = w + 30, cx = 92;
    pag += `<rect x="${cx - w / 2}" y="${y - 15}" width="${w}" height="15" fill="#1f1d1b"/>`;
    pag += `<path d="M${cx - rw / 2 - 5} ${y - 13} Q${cx - rw / 2 + 4} ${y - 17} ${cx - rw / 2 + 8} ${y - 23} H${cx + rw / 2 - 8} Q${cx + rw / 2 - 4} ${y - 17} ${cx + rw / 2 + 5} ${y - 13} Z" fill="#1f1d1b"/>`;
    if (i < 4) pag += `<rect x="${cx - w / 2 + 6}" y="${y - 11}" width="${w - 12}" height="3" fill="#d9573b" opacity=".55"/>`;
    y -= 24;
  }
  pag += `<rect x="90.6" y="${y - 38}" width="2.8" height="42" fill="#1f1d1b"/>`;
  for (let k = 0; k < 5; k++) pag += `<rect x="86.5" y="${y - 30 + k * 5}" width="11" height="2" rx="1" fill="#1f1d1b"/>`;
  const leaves = [[214, 236, 0.9, 20], [238, 262, 0.7, -30], [190, 270, 0.6, 50], [256, 228, 0.55, 10], [230, 290, 0.8, -60]]
    .map(([x, yy, s, r]) => `<path transform="translate(${x} ${yy}) rotate(${r}) scale(${s})" d="M0-12 3-4 11-6 6 1 9 9 1 5-4 12-4 4-12 3-6-3-11-6-3-4Z" fill="#b5371f"/>`).join('');
  const art = `<rect width="300" height="312" fill="#f1e4cf"/>
    <circle cx="198" cy="132" r="66" fill="#d9573b"/>
    <path d="M0 214 Q48 182 96 204 T196 190 T300 206 V312 H0Z" fill="#e8bea6"/>
    <path d="M0 246 Q70 214 132 238 T262 226 T300 232 V312 H0Z" fill="#c9907f"/>
    <path d="M0 270 Q90 252 170 266 T300 262 V312 H0Z" fill="#9e6a62"/>
    ${pag}
    <rect x="0" y="296" width="300" height="16" fill="#1f1d1b"/>
    ${leaves}`;
  return frame(id, art, { name: 'Kyoto', sub: 'JAPAN · 9 NIGHTS · NOVEMBER', num: '01', band: '#1f1d1b', light: '#f1e4cf', accent: '#e8836a', mark: '#7a4b3f', value: '84' }, stamp);
}

function lisbon(id, stamp) {
  const houses = [];
  const r = rnd(7);
  const cols = ['#f3efe6', '#e9a48f', '#f6d9a6', '#f3efe6', '#d9573b', '#f3efe6', '#9fc3c0'];
  for (let i = 0; i < 9; i++) {
    const x = -6 + i * 23, base = 236 - Math.max(0, 140 - x) * 0.42 + r() * 4;
    const w = 22, h = 28 + r() * 22;
    const c = cols[i % cols.length];
    houses.push(`<rect x="${x}" y="${(base - h).toFixed(1)}" width="${w}" height="${(h + 80).toFixed(1)}" fill="${c}"/>`);
    houses.push(`<path d="M${x - 2} ${(base - h).toFixed(1)} L${x + w / 2} ${(base - h - 10).toFixed(1)} L${x + w + 2} ${(base - h).toFixed(1)}Z" fill="#b5371f"/>`);
    for (let k = 0; k < 2; k++) houses.push(`<rect x="${x + 4 + k * 9}" y="${(base - h + 9).toFixed(1)}" width="5" height="7" fill="#1f3550" opacity=".75"/>`);
  }
  const art = `<rect width="300" height="312" fill="#f7d9b9"/>
    <rect y="0" width="300" height="70" fill="#f4cba6"/>
    <circle cx="236" cy="112" r="46" fill="#ffc400"/>
    <rect y="226" width="300" height="86" fill="#2f6f73"/>
    ${seaLines(236, 306, '#e8f1ea', 0.55, 3)}
    <rect x="236" y="202" width="5" height="26" fill="#1f3550"/><path d="M226 204h26l-13-26z" fill="#f3efe6"/>
    ${houses.join('')}
    <g transform="translate(96 176) rotate(-11)">
      <rect x="0" y="0" width="86" height="36" rx="7" fill="#ffc400"/>
      <rect x="0" y="26" width="86" height="10" rx="2" fill="#d9573b"/>
      ${[0, 1, 2, 3, 4].map((k) => `<rect x="${7 + k * 16}" y="7" width="11" height="12" rx="2" fill="#1f3550"/>`).join('')}
      <path d="M40 0 L52 -16 M52 -16 L60 -16" stroke="#1f1d1b" stroke-width="2" fill="none"/>
      <circle cx="18" cy="38" r="4" fill="#1f1d1b"/><circle cx="68" cy="38" r="4" fill="#1f1d1b"/>
    </g>`;
  return frame(id, art, { name: 'Lisbon', sub: 'PORTUGAL · 7 NIGHTS · MAY', num: '02', band: '#173b44', light: '#f7d9b9', accent: '#ffc400', mark: '#a0623e', value: '62' }, stamp);
}

function reykjavik(id, stamp) {
  const r = rnd(11);
  let stars = '';
  for (let i = 0; i < 34; i++) stars += `<circle cx="${(r() * 300).toFixed(1)}" cy="${(r() * 150).toFixed(1)}" r="${(0.5 + r() * 1.1).toFixed(2)}" fill="#f3efe6" opacity="${(0.35 + r() * 0.6).toFixed(2)}"/>`;
  const defs = `<linearGradient id="au-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fe3b5" stop-opacity="0"/><stop offset=".55" stop-color="#6fe3b5" stop-opacity=".85"/><stop offset="1" stop-color="#2bb3a3" stop-opacity="0"/></linearGradient>
    <linearGradient id="av-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9b86e8" stop-opacity="0"/><stop offset=".6" stop-color="#9b86e8" stop-opacity=".55"/><stop offset="1" stop-color="#6fe3b5" stop-opacity="0"/></linearGradient>
    <filter id="bl-${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5"/></filter>`;
  const art = `<rect width="300" height="312" fill="#0f1b2c"/>${stars}
    <g filter="url(#bl-${id})">
      <path d="M-20 60 C40 20 90 120 150 70 S250 30 320 80 L320 150 C250 100 200 170 150 130 S40 120 -20 150Z" fill="url(#av-${id})"/>
      <path d="M-20 92 C50 50 100 150 160 104 S260 70 320 112 L320 186 C250 150 210 200 160 168 S50 160 -20 190Z" fill="url(#au-${id})"/>
    </g>
    <path d="M0 214 L34 178 L56 196 L92 150 L120 184 L150 166 L182 196 L214 158 L246 190 L272 172 L300 186 V246 H0Z" fill="#070b12"/>
    <path d="M92 150 L102 162 L96 162 L86 158Z M214 158 L224 170 L208 168Z" fill="#cfe0ea" opacity=".85"/>
    <rect y="238" width="300" height="74" fill="#132338"/>
    ${seaLines(244, 308, '#6fe3b5', 0.32, 5)}
    <rect x="202" y="222" width="22" height="16" fill="#b5371f"/><path d="M199 223 L213 212 L227 223Z" fill="#f3efe6"/><rect x="209" y="228" width="6" height="6" fill="#ffc400"/>`;
  return frame(id, art, { name: 'Reykjavik', sub: 'ICELAND · 6 NIGHTS · FEBRUARY', num: '03', band: '#070b12', light: '#e8f5ee', accent: '#6fe3b5', mark: '#6fe3b5', value: '95', defs }, stamp);
}

function cactus(x, base, s, c) {
  return `<g transform="translate(${x} ${base}) scale(${s})" fill="${c}">
    <rect x="-9" y="-96" width="18" height="96" rx="9"/>
    <path d="M-9 -44 H-22 a8 8 0 0 1 -8 -8 V-70 a7 7 0 0 1 14 0 V-58 H-9Z"/>
    <path d="M9 -56 H22 a8 8 0 0 0 8 -8 V-84 a7 7 0 0 0 -14 0 V-70 H9Z"/></g>`;
}
function oaxaca(id, stamp) {
  const flags = ['#2f6f73', '#ffc400', '#d9573b', '#f3efe6', '#8f2d4f'];
  let bunting = '<path d="M-5 58 Q150 92 305 58" stroke="#5a1f33" stroke-width="1.4" fill="none"/>';
  for (let i = 0; i < 11; i++) {
    const t = i / 10, x = -5 + t * 310, y = 58 + 4 * 34 * t * (1 - t) * 0.5 * 2;
    bunting += `<path d="M${x - 9} ${y} L${x + 9} ${y} L${x} ${y + 17}Z" fill="${flags[i % flags.length]}"/>`;
  }
  const art = `<rect width="300" height="312" fill="#f6cdb8"/>
    <rect y="120" width="300" height="192" fill="#f2b3a1"/>
    <circle cx="150" cy="236" r="104" fill="#ff8c42"/>
    <circle cx="150" cy="236" r="78" fill="#ffa25f"/>
    <path d="M0 240 Q90 204 162 228 T300 222 V312 H0Z" fill="#c9496f"/>
    <path d="M0 272 Q110 246 190 266 T300 258 V312 H0Z" fill="#8f2d4f"/>
    ${cactus(72, 282, 1.05, '#2e5e4e')}${cactus(238, 280, 0.66, '#2e5e4e')}${cactus(196, 286, 0.42, '#24493d')}
    ${bunting}`;
  return frame(id, art, { name: 'Oaxaca', sub: 'MEXICO · 8 NIGHTS · MARCH', num: '04', band: '#5a1f33', light: '#f6cdb8', accent: '#ff8c42', mark: '#8f2d4f', value: '70' }, stamp);
}

function patagonia(id, stamp) {
  const art = `<rect width="300" height="312" fill="#d7e6ea"/>
    <circle cx="70" cy="86" r="30" fill="#f7f7f2" opacity=".8"/>
    <path d="M0 220 L40 160 L64 186 L96 104 L118 150 L142 70 L166 140 L188 112 L214 176 L240 132 L270 186 L300 170 V250 H0Z" fill="#46535c"/>
    <path d="M96 104 L104 126 L96 122 L88 128Z M142 70 L153 104 L142 98 L131 106Z M188 112 L196 132 L186 128Z M240 132 L248 150 L238 146Z" fill="#f7f7f2"/>
    <path d="M0 230 L54 196 L90 222 L130 200 L176 226 L222 204 L262 226 L300 214 V256 H0Z" fill="#33424c"/>
    <rect y="244" width="300" height="68" fill="#3d8c95"/>
    ${seaLines(250, 308, '#d7eef0', 0.6, 9)}
    <path d="M0 290 Q70 270 140 284 T300 276 V312 H0Z" fill="#1f3550"/>
    <g transform="translate(214 272)" fill="#1f3550"><circle cx="0" cy="-22" r="4"/><rect x="-3.5" y="-17" width="7" height="14" rx="2"/><rect x="2" y="-16" width="6" height="10" rx="2" fill="#d9573b"/><rect x="-3" y="-4" width="2.6" height="10"/><rect x="0.6" y="-4" width="2.6" height="10"/><rect x="-9" y="-20" width="1.6" height="26" transform="rotate(-12)"/></g>`;
  return frame(id, art, { name: 'Patagonia', sub: 'ARGENTINA · 12 NIGHTS · JANUARY', num: '05', band: '#1f3550', light: '#e6f1f3', accent: '#8fd0d8', mark: '#46535c', value: '120' }, stamp);
}

function marrakesh(id, stamp) {
  const arch = 'M86 312 V196 C62 168 70 98 150 88 C230 98 238 168 214 196 V312 Z';
  const defs = `<clipPath id="ar-${id}"><path d="${arch}"/></clipPath>`;
  let diamonds = '';
  for (let i = 0; i < 9; i++) diamonds += `<path d="M${22 + i * 32} 56 l7 -7 7 7 -7 7z" fill="#f3e3c3" opacity=".8"/>`;
  const palm = `<g transform="translate(184 300)" fill="#2e4f43"><path d="M-2 0 C-1 -40 2 -70 6 -96 L10 -96 C6 -70 4 -40 4 0Z"/>
    ${[[-60, 0.9], [-25, 1], [10, 1], [45, 0.95], [-95, 0.8], [80, 0.8]].map(([a, s]) => `<path transform="translate(8 -96) rotate(${a}) scale(${s})" d="M0 0 C10 -6 26 -6 40 4 C26 0 12 2 0 4Z"/>`).join('')}</g>`;
  const art = `<rect width="300" height="312" fill="#b5462b"/>
    ${diamonds}
    <path d="M78 312 V194 C52 164 60 88 150 78 C240 88 248 164 222 194 V312 Z" fill="#f3e3c3"/>
    <g clip-path="url(#ar-${id})">
      <rect width="300" height="312" fill="#f6d7a7"/>
      <circle cx="150" cy="176" r="40" fill="#c4532f"/>
      <path d="M60 236 Q120 206 180 226 T260 214 V312 H60Z" fill="#e3a05a"/>
      <path d="M60 262 Q140 236 200 254 T260 248 V312 H60Z" fill="#cf7a3e"/>
      <path d="M60 286 Q130 270 190 282 T260 278 V312 H60Z" fill="#a8432a"/>
      ${palm}
    </g>
    <rect x="0" y="300" width="300" height="12" fill="#8f2d23"/>`;
  return frame(id, art, { name: 'Marrakesh', sub: 'MOROCCO · 7 NIGHTS · APRIL', num: '06', band: '#5e2416', light: '#f3e3c3', accent: '#f0b366', mark: '#f3e3c3', value: '57', defs }, stamp);
}

const MAKERS = { kyoto, lisbon, reykjavik, oaxaca, patagonia, marrakesh };
let uid = 0;
export function poster(name, stamp = false) { const f = MAKERS[name]; return f ? f(name + '-' + (++uid), stamp) : ''; }

export function barcode(seed) {
  const r = rnd(seed); let x = 0, bars = '';
  while (x < 116) { const w = 1 + Math.floor(r() * 3.2); if (r() > 0.38) bars += `<rect x="${x}" y="0" width="${w}" height="40" fill="#121212"/>`; x += w + (r() > 0.5 ? 1 : 2); }
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 40' preserveAspectRatio='none'>${bars.replace(/"/g, "'")}</svg>`)}")`;
}
