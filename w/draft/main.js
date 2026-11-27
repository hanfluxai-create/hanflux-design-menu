import { film, reveals, $, $$ } from './kit.js';

const lvl = $('[data-lvl]');
film({ section: '#film', counts: { d: 96, m: 96 }, onProgress: (p) => { if (lvl) lvl.style.transform = `translate3d(0, ${((1 - p) * 100).toFixed(2)}%, 0)`; } });
film({ section: '#walk', counts: { d: 96, m: 96 }, base: './walk/' });
reveals();

const f1 = (v) => v.toFixed(1);
const sqft = (w, h) => (Math.round(w * h * 10.764 / 5) * 5).toLocaleString('en-IN');

/* ---------- the plan: villa type B, metres, north up ---------- */
// room: [name, label on the drawing, x, y, w, h, note, kind]   kind: o = open to the sky, v = void, p = pool
const FLOORS = [
  { name: 'Ground floor', sheet: 'A-201', pick: 0,
    rooms: [
      ['Living room', 'Living', 5.2, 5, 9.2, 8, 'Double height, with the glass wall on the sea side and the court on the west.'],
      ['Dining', 'Dining', 14.4, 5, 5.2, 8, 'Seats twelve, open to the living room and straight out to the deck.'],
      ['Kitchen', 'Kitchen', 14.4, 0, 5.2, 5, 'Stone island, teak joinery and a window to the entry garden.'],
      ['Entry hall', 'Entry', 8, 0, 3.6, 5, 'A 1.2 metre teak door, then a straight view through the house to the sea.'],
      ['Stair', 'Stair', 11.6, 0, 2.8, 5, 'Two flights in folded steel and teak, lit from a roof light above.'],
      ['Bedroom 1', 'Bed 1', 2.6, 0, 5.4, 5, 'The garden bedroom. It opens on to the planted court.'],
      ['Bath 1', 'Bath 1', 0, 0, 2.6, 2.8, 'Walk-in shower in honed limestone.'],
      ['Wardrobe 1', 'Robe', 0, 2.8, 2.6, 2.2, 'Walk-in wardrobe in oiled teak.'],
      ['Bedroom 2', 'Bed 2', 19.6, 5, 4.4, 5.2, 'Morning light from the east, a few steps from the pool deck.'],
      ['Bath 2', 'Bath 2', 19.6, 10.2, 4.4, 2.8, 'A stone bath set beside a tall window slot.'],
      ['Utility', 'Utility', 19.6, 0, 4.4, 2.6, 'Laundry, water treatment and the home system rack.'],
      ['Pantry', 'Pantry', 19.6, 2.6, 4.4, 2.4, 'A working pantry, so the main kitchen stays clear.'],
      ['Garden court', 'Court', 0, 5, 5.2, 8, 'Open to the sky and walled on two sides, planted with frangipani.', 'o'],
      ['Pool deck', 'Pool deck', 5.2, 13, 18.8, 3.5, 'Flamed limestone, level with the living room floor.', 'o'],
      ['Lap pool', 'Lap pool', 7.2, 17.2, 14, 4, 'Fourteen metres long, 1.35 metres deep, with a dark stone lining.', 'p']
    ],
    doors: [['h', 9.2, 0, 1, 1.2], ['v', 8, 3.7, -1], ['v', 2.6, 1.8, -1], ['v', 2.6, 3.7, 1], ['v', 19.6, 1, 1], ['v', 19.6, 3.4, 1], ['v', 19.6, 5.6, 1], ['h', 20.4, 10.2, 1]],
    gaps: [[8.7, 5, 10.9, 5], [11.6, 0.7, 11.6, 4.3], [15.3, 5, 18.7, 5], [14.4, 5.9, 14.4, 12.1]],
    glass: [[5.7, 13, 13.9, 13], [14.9, 13, 19.1, 13], [5.2, 6, 5.2, 12], [3, 5, 4.8, 5], [4.2, 0, 7.2, 0], [15.4, 0, 18.6, 0], [0.8, 0, 1.8, 0], [20.8, 0, 22.8, 0], [24, 6, 24, 9.2], [24, 11.2, 24, 12.2]],
    fit: [[15.5, 3.3, 3, 1], [14.7, 0.35, 4.6, 0.6], [16.3, 9.9, 1.4, 2.6], [7.4, 10, 4.8, 1], [7.4, 7.8, 1, 2.2], [5.6, 0.35, 2.1, 1.8], [21.5, 8.2, 2.2, 1.8], [22.9, 10.6, 0.8, 1.9]]
  },
  { name: 'Upper floor', sheet: 'A-202', pick: 0,
    rooms: [
      ['Master bedroom', 'Master', 14.4, 6.6, 6.4, 6.4, 'Bedroom 3. A full glass front and its own terrace over the pool.'],
      ['Master bath', 'M. bath', 20.8, 8.4, 3.2, 4.6, 'Twin basins, a stone bath and a window slot to the east.'],
      ['Master dressing', 'Dress', 20.8, 5, 3.2, 3.4, 'A dressing room between the bedroom and the bath.'],
      ['Gallery', 'Gallery', 5.2, 5, 15.6, 1.6, 'A glass-edged bridge that looks down into the living room.'],
      ['Void over living', 'Void', 5.2, 6.6, 9.2, 6.4, 'Open to the living room below, under the teak ceiling.', 'v'],
      ['Landing', 'Landing', 8, 0, 3.6, 5, 'A reading corner at the head of the stair.'],
      ['Stair', 'Stair', 11.6, 0, 2.8, 5, 'Two flights in folded steel and teak, lit from a roof light above.'],
      ['Bedroom 4', 'Bed 4', 2.6, 0, 5.4, 5, 'Looks over the garden court to the hill behind.'],
      ['Bath 4', 'Bath 4', 0, 0, 2.6, 2.8, 'Walk-in shower in honed limestone.'],
      ['Wardrobe 4', 'Robe', 0, 2.8, 2.6, 2.2, 'Walk-in wardrobe in oiled teak.'],
      ['Bedroom 5', 'Bed 5', 14.4, 0, 5.2, 5, 'A quiet north room, often used as a study.'],
      ['Bath 5', 'Bath 5', 19.6, 0, 4.4, 2.6, 'Shower room with a high window.'],
      ['Wardrobe 5', 'Robe', 19.6, 2.6, 4.4, 2.4, 'Walk-in wardrobe in oiled teak.'],
      ['Master terrace', 'Terrace', 14.4, 13, 9.6, 2, 'Shaded by the 2.4 metre teak soffit, facing the sunset.', 'o']
    ],
    doors: [['v', 8, 3.7, -1], ['v', 2.6, 1.8, -1], ['v', 2.6, 3.7, 1], ['h', 15, 5, -1], ['v', 19.6, 1, 1], ['v', 19.6, 3.4, 1], ['h', 16, 6.6, 1], ['v', 20.8, 7.2, 1], ['v', 20.8, 9.4, 1]],
    gaps: [[8.7, 5, 10.9, 5], [11.6, 0.7, 11.6, 4.3]],
    glass: [[5.5, 6.6, 14.1, 6.6], [5.7, 13, 13.9, 13], [5.2, 7.2, 5.2, 12.4], [14.9, 13, 20.3, 13], [4.2, 0, 7.2, 0], [15.4, 0, 18.6, 0], [20.8, 0, 22.8, 0], [0.8, 0, 1.8, 0], [24, 10, 24, 11.6]],
    fit: [[5.6, 0.35, 2.1, 1.8], [17.2, 0.35, 2.1, 1.8], [14.8, 8.7, 2.2, 2.2], [21.4, 11.9, 1.9, 0.8]],
    below: [[0, 5, 5.2, 8], [5.2, 13, 18.8, 3.5], [7.2, 17.2, 14, 4]]
  }
];

const planSvg = $('#plan-svg');
if (planSvg) {
  const S = 16, OX = 36, OY = 30, X = (v) => +(OX + v * S).toFixed(1), Y = (v) => +(OY + v * S).toFixed(1);
  const rect = (r, cls, extra = '') => `<rect class="${cls}" x="${X(r[0])}" y="${Y(r[1])}" width="${(r[2] * S).toFixed(1)}" height="${(r[3] * S).toFixed(1)}"${extra}/>`;
  const seg = (a, cls) => `<path class="${cls}" d="M${X(a[0])} ${Y(a[1])}L${X(a[2])} ${Y(a[3])}"/>`;
  const door = ([o, x, y, s, w = 0.9]) => {
    const cut = o === 'h' ? [x, y, x + w, y] : [x, y, x, y + w];
    const leaf = o === 'h' ? [x, y, x, y + s * w] : [x, y, x + s * w, y];
    const sweep = o === 'h' ? (s > 0 ? 0 : 1) : (s > 0 ? 1 : 0);
    return seg(cut, 'cut') + `<path class="door" d="M${X(leaf[0])} ${Y(leaf[1])}L${X(leaf[2])} ${Y(leaf[3])}A${w * S} ${w * S} 0 0 ${sweep} ${X(cut[2])} ${Y(cut[3])}"/>`;
  };
  const stair = (r) => {
    let d = '';
    for (let y = r[1] + 0.7; y < r[1] + r[3] - 0.6; y += 0.29) d += `M${X(r[0] + 0.25)} ${Y(y)}H${X(r[0] + r[2] - 0.25)}`;
    d += `M${X(r[0] + r[2] / 2)} ${Y(r[1] + 0.7)}V${Y(r[1] + r[3] - 0.7)}`;
    return `<path class="fit" d="${d}"/>`;
  };
  const dims = (xs, ys, depth) => {
    let s = `<path class="dimline" d="M${X(xs[0])} ${OY - 14}H${X(xs[xs.length - 1])}M${OX - 16} ${Y(ys[0])}V${Y(ys[ys.length - 1])}`;
    xs.forEach((x) => { s += `M${X(x) - 3} ${OY - 11}l6 -6M${X(x)} ${OY - 19}v10`; });
    ys.forEach((y) => { s += `M${OX - 19} ${Y(y) + 3}l6 -6M${OX - 21} ${Y(y)}h10`; });
    s += '"/>';
    for (let i = 1; i < xs.length; i++) s += `<text class="dimt" x="${(X(xs[i - 1]) + X(xs[i])) / 2}" y="${OY - 18}" text-anchor="middle">${f1(xs[i] - xs[i - 1])}</text>`;
    for (let i = 1; i < ys.length; i++) { const cy = (Y(ys[i - 1]) + Y(ys[i])) / 2; s += `<text class="dimt" x="${OX - 20}" y="${cy}" text-anchor="middle" transform="rotate(-90 ${OX - 20} ${cy})">${f1(ys[i] - ys[i - 1])}</text>`; }
    return s;
  };
  planSvg.innerHTML = '<defs><pattern id="water" width="10" height="6" patternUnits="userSpaceOnUse"><path d="M0 3q2.5 -2 5 0t5 0" class="wave"/></pattern></defs>' + FLOORS.map((F, fi) => {
    const walled = F.rooms.filter((r) => !r[7] || r[7] === 'v');
    let s = `<g class="floor" data-f="${fi}"${fi ? ' hidden' : ''}>`;
    (F.below || []).forEach((r) => { s += rect(r.concat(), 'below'); });
    F.rooms.forEach((r, i) => { s += rect(r.slice(2, 6), 'rm' + (r[7] ? ' k-' + r[7] : ''), `${r[7] === 'p' ? ' fill="url(#water)"' : ''} data-i="${i}" tabindex="0" role="button" aria-label="${r[0]}, ${f1(r[4])} by ${f1(r[5])} metres"`); });
    F.rooms.forEach((r) => { if (r[7] === 'v') { const q = r.slice(2, 6); s += `<path class="voidx" d="M${X(q[0])} ${Y(q[1])}L${X(q[0] + q[2])} ${Y(q[1] + q[3])}M${X(q[0] + q[2])} ${Y(q[1])}L${X(q[0])} ${Y(q[1] + q[3])}"/>`; } });
    s += '<g class="walls">' + walled.map((r) => rect(r.slice(2, 6), 'w1')).join('') + walled.map((r) => rect(r.slice(2, 6), 'w2')).join('') + '</g>';
    s += F.gaps.map((g) => seg(g, 'cut')).join('') + F.glass.map((g) => seg(g, 'cut') + seg(g, 'glass')).join('') + F.doors.map(door).join('');
    s += F.fit.map((r) => rect(r, 'fit')).join('') + stair([11.6, 0, 2.8, 5]);
    F.rooms.forEach((r, i) => {
      const cx = X(r[2] + r[4] / 2), cy = Y(r[3] + r[5] / 2), big = r[4] >= 4 && r[5] >= 3.4;
      s += `<text class="lab" data-l="${i}" x="${cx}" y="${cy + (big ? -1 : 2.5)}" text-anchor="middle">${r[1]}${big ? `<tspan class="ld" x="${cx}" dy="9.5">${f1(r[4])} × ${f1(r[5])}</tspan>` : ''}</text>`;
    });
    s += dims([0, 2.6, 8, 11.6, 14.4, 19.6, 24], [0, 5, 13]);
    s += `<text class="sheetno" x="${OX}" y="397"><tspan class="hi">${F.sheet}</tspan>  ${F.name} · Type B</text>`;
    s += `<g class="bar" transform="translate(${X(24) - 80} 393)"><path d="M0 0h80M0 -3v6M32 -3v6M80 -3v6"/><text x="0" y="-6">0</text><text x="32" y="-6" text-anchor="middle">2</text><text x="80" y="-6" text-anchor="end">5 m</text></g>`;
    return s + '</g>';
  }).join('');

  const out = (k) => $(`[data-r="${k}"]`), chips = $('[data-rooms]'), tabs = $$('[data-floor]');
  let fl = 0;
  const pick = (i) => {
    const F = FLOORS[fl], r = F.rooms[i]; F.pick = i;
    $$(`.floor[data-f="${fl}"] .on`, planSvg).forEach((e) => e.classList.remove('on'));
    $$(`.floor[data-f="${fl}"] [data-i="${i}"], .floor[data-f="${fl}"] [data-l="${i}"]`, planSvg).forEach((e) => e.classList.add('on'));
    out('floor').textContent = `${F.name} · ${F.sheet}`; out('name').textContent = r[0];
    out('dim').textContent = `${f1(r[4])} × ${f1(r[5])} m`; out('area').textContent = `${sqft(r[4], r[5])} sq ft`; out('note').textContent = r[6];
    $$('button', chips).forEach((b, k) => b.setAttribute('aria-pressed', k === i ? 'true' : 'false'));
  };
  const floor = (n) => {
    fl = n;
    $$('.floor', planSvg).forEach((g, k) => { if (k === n) g.removeAttribute('hidden'); else g.setAttribute('hidden', ''); });
    tabs.forEach((t, k) => t.setAttribute('aria-selected', k === n ? 'true' : 'false'));
    chips.innerHTML = FLOORS[n].rooms.map((r, i) => `<button type="button" data-i="${i}">${r[0]}</button>`).join('');
    pick(FLOORS[n].pick);
  };
  tabs.forEach((t, k) => t.addEventListener('click', () => floor(k)));
  const hit = (e) => { const t = e.target.closest('[data-i]'); if (t) pick(+t.dataset.i); };
  planSvg.addEventListener('click', hit); chips.addEventListener('click', hit);
  planSvg.addEventListener('pointerover', (e) => { if (e.pointerType === 'mouse') hit(e); });
  planSvg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(e); } });
  floor(0);
}

/* ---------- the hill: eleven plots on three terraces ---------- */
// plot: [plot sq ft, built-up sq ft, bedrooms, price in Cr, status]   a = available, r = reserved, s = sold
const PLOTS = [
  [9000, 5200, 4, 14.5, 'a'], [9400, 5200, 4, 15.2, 's'], [9800, 5600, 4, 16.1, 'r'],
  [10200, 5600, 4, 16.8, 's'], [10600, 6100, 4, 17.9, 'a'], [11000, 6100, 5, 18.6, 's'], [11500, 6500, 5, 19.4, 'r'],
  [12200, 6900, 5, 20.8, 'a'], [13000, 6900, 5, 21.9, 's'], [13800, 7400, 5, 23.2, 'r'], [14500, 7400, 5, 24.6, 'a']
];
const ROWS = [
  { name: 'Upper terrace', y: 66, d: 82, x: 146, w: 104, n: 3, note: 'Highest on the hill, with the longest view over the roofs below.' },
  { name: 'Middle terrace', y: 204, d: 92, x: 66, w: 110, n: 4, note: 'Between the two lanes, a storey above the row in front.' },
  { name: 'Lower terrace', y: 352, d: 104, x: 54, w: 118, n: 4, note: 'First row above the cove, with a private path to the beach.' }
];
const STATUS = { a: 'Available', r: 'Reserved', s: 'Sold' };
const hillSvg = $('#hill-svg');
if (hillSvg) {
  const bow = (x) => 26 * Math.sin(Math.PI * x / 600);
  const wave = (y0, k, amp, x0 = -10, x1 = 610) => { let d = ''; for (let x = x0; x <= x1; x += 20) d += `${d ? 'L' : 'M'}${x} ${(y0 + bow(x) * k + amp * Math.sin(x / 70 + y0)).toFixed(1)}`; return d; };
  const lane = (y0, a, b) => { let d = ''; const st = a < b ? 20 : -20; for (let x = a; st > 0 ? x <= b : x >= b; x += st) d += `L${x} ${(y0 + bow(x)).toFixed(1)}`; return d; };
  const road = `M-10 96Q30 150 60 ${(178 + bow(60)).toFixed(1)}${lane(178, 80, 540)}C604 186 604 320 540 ${(324 + bow(540)).toFixed(1)}${lane(324, 520, 60)}`;
  let s = '<defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v7" class="hatch"/></pattern><pattern id="swell" width="26" height="12" patternUnits="userSpaceOnUse"><path d="M2 6h12" class="swell"/></pattern></defs>';
  const coast = wave(512, 1.2, 7);
  s += `<path class="sea" d="${coast}L610 610L-10 610Z"/><path class="seah" fill="url(#swell)" d="${coast}L610 610L-10 610Z"/><path class="coast" d="${coast}"/>`;
  for (let i = 0; i < 13; i++) s += `<path class="cont${i % 4 === 1 ? ' major' : ''}" d="${wave(22 + i * 38, 0.5 + i * 0.05, 5)}"/>`;
  [[56, '38 m'], [208, '26 m'], [360, '12 m']].forEach(([y, t]) => { s += `<text class="elev" x="6" y="${y}">${t}</text>`; });
  s += '<g class="trees">' + [[40, 40, 7], [86, 30, 5], [118, 118, 6], [500, 62, 7], [532, 96, 5], [560, 40, 6], [22, 250, 6], [44, 290, 5], [566, 392, 6], [580, 432, 5], [30, 430, 6], [96, 494, 5], [150, 486, 7], [236, 500, 5], [420, 506, 6], [480, 492, 5], [546, 486, 7]].map(([x, y, r]) => `<circle cx="${x}" cy="${(y + bow(x)).toFixed(1)}" r="${r}"/>`).join('') + '</g>';
  s += `<path class="road1" d="${road}"/><path class="road2" d="${road}"/><circle class="road1 end" cx="56" cy="${(324 + bow(56)).toFixed(1)}" r="11"/>`;
  s += `<path class="path" d="M300 ${(456 + bow(300)).toFixed(1)}Q296 486 318 ${(512 + bow(318) * 1.2).toFixed(1)}"/>`;
  let n = 0;
  ROWS.forEach((R, ri) => {
    for (let k = 0; k < R.n; k++, n++) {
      const x0 = R.x + k * (R.w + 7), x1 = x0 + R.w, P = PLOTS[n], id = String(n + 1).padStart(2, '0');
      const pt = (x, y) => `${x.toFixed(1)} ${(y + bow(x)).toFixed(1)}`;
      const cx = (x0 + x1) / 2, cy = R.y + R.d / 2 + bow(cx), hw = R.w * 0.3, hh = R.d * 0.24;
      s += `<g class="plot s-${P[4]}" data-n="${n}" data-row="${ri}" tabindex="0" role="button" aria-label="Plot ${id}, ${STATUS[P[4]]}, ${P[2]} bedrooms">`
        + `<path class="lot"${P[4] === 'r' ? ' fill="url(#hatch)"' : ''} d="M${pt(x0, R.y)}L${pt(x1, R.y)}L${pt(x1, R.y + R.d)}L${pt(x0, R.y + R.d)}Z"/>`
        + `<rect class="house" x="${(cx - hw).toFixed(1)}" y="${(cy - hh - 4).toFixed(1)}" width="${(hw * 2).toFixed(1)}" height="${(hh * 2).toFixed(1)}"/>`
        + `<rect class="lap" x="${(cx - hw * 0.7).toFixed(1)}" y="${(cy + hh + 3).toFixed(1)}" width="${(hw * 1.4).toFixed(1)}" height="5"/>`
        + `<text x="${cx.toFixed(1)}" y="${(cy + 2).toFixed(1)}" text-anchor="middle">${id}</text></g>`;
    }
  });
  s += '<text class="note" x="20" y="88">Gate</text><text class="note" x="300" y="578" text-anchor="middle">Arabian Sea</text><text class="note" x="338" y="508">Cove</text>';
  s += '<g class="north" transform="translate(40 550)"><path d="M0 14V-14M-5 -6L0 -14L5 -6"/><text y="30" text-anchor="middle">N</text></g>';
  s += '<g class="bar" transform="translate(476 584)"><path d="M0 0h100M0 -3v6M50 -3v6M100 -3v6"/><text x="0" y="-7">0</text><text x="50" y="-7" text-anchor="middle">25</text><text x="100" y="-7" text-anchor="end">50 m</text></g>';
  hillSvg.innerHTML = s;

  const set = (k, v) => { $(`[data-p="${k}"]`).textContent = v; };
  const hold = $('[data-hold]'), box = hold.closest('.info');
  let cur = 7;
  const open = () => PLOTS.map((p, i) => (p[4] === 'a' ? String(i + 1).padStart(2, '0') : '')).filter(Boolean);
  const pick = (i) => {
    cur = i; const P = PLOTS[i], g = $(`.plot[data-n="${i}"]`, hillSvg), R = ROWS[+g.dataset.row], id = String(i + 1).padStart(2, '0');
    $$('.plot.on', hillSvg).forEach((e) => e.classList.remove('on')); g.classList.add('on');
    box.dataset.s = P[4];
    set('n', id); set('row', R.name); set('status', STATUS[P[4]]);
    set('plot', `${P[0].toLocaleString('en-IN')} sq ft`); set('built', `${P[1].toLocaleString('en-IN')} sq ft`); set('beds', P[2]);
    set('price', P[4] === 's' ? 'Sold' : `₹${P[3].toFixed(1)} Cr`);
    set('note', P[4] === 'a' ? R.note : `This plot is ${P[4] === 's' ? 'sold' : 'reserved'}. Plots ${open().join(', ').replace(/, (\d+)$/, ' and $1')} are open today.`);
    hold.textContent = P[4] === 'a' ? 'Hold this plot' : 'Ask about open plots';
  };
  const hit = (e) => { const t = e.target.closest('.plot'); if (t) pick(+t.dataset.n); };
  hillSvg.addEventListener('click', hit);
  hillSvg.addEventListener('pointerover', (e) => { if (e.pointerType === 'mouse') hit(e); });
  hillSvg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(e); } });
  pick(cur);

  // "Hold this plot" carries the choice into the visit form
  const held = $('[data-held]');
  const keep = (id) => { if (!held) return; held.hidden = !id; held.dataset.plot = id || ''; $('b', held).textContent = id || ''; };
  hold.addEventListener('click', () => {
    const P = PLOTS[cur]; if (P[4] !== 'a') return keep('');
    keep(String(cur + 1).padStart(2, '0'));
    const v = $(`input[name="villa"][value="${P[2]} bedroom"]`); if (v) v.checked = true;
  });
  const un = $('[data-unhold]'); if (un) un.addEventListener('click', () => keep(''));
}

/* ---------- the visit form ---------- */
const wk = $('[data-weekends]');
if (wk) {
  const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(); d.setDate(d.getDate() + 3);
  while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
  let html = '';
  for (let i = 0; i < 4; i++) {
    const v = `${d.getDate()} ${mo[d.getMonth()]}`;
    html += `<label><input type="radio" name="weekend" value="Saturday ${v}"${i === 1 ? ' checked' : ''}><span><small>Sat, Sun</small>${v}</span></label>`;
    d.setDate(d.getDate() + 7);
  }
  wk.innerHTML = html;
}
const form = $('form.book');
if (form) form.addEventListener('submit', () => {
  const f = new FormData(form), name = String(f.get('name') || '').trim().split(/\s+/)[0], plot = ($('[data-held]', form) || {}).dataset?.plot;
  $('[data-ok-title]', form).textContent = name ? `Thank you, ${name}.` : 'Thank you.';
  $('[data-ok]', form).textContent = `We have pencilled you in for the weekend of ${f.get('weekend')} to see a ${f.get('villa')} villa${plot ? `, with plot ${plot} held for you until then` : ''}. We will confirm the boat time on WhatsApp within one working day.`;
});
