import { film, reveals, $, $$ } from './kit.js';

const scale = $('[data-scale]'), elev = $('[data-elev]');
film({ section: '#film', canvas: '#film canvas', counts: { d: 72, m: 48 }, onProgress(p) {
  if (scale) scale.textContent = '1 : ' + Math.round(500 - p * 400);
  if (elev) elev.textContent = Math.round(120 - p * 84);
} });
reveals();

/* ---------- floor plans: [name, x, y, w, h, size, cls] on a 640 x 420 sheet ---------- */
const TYPES = {
  cliff: { name: 'The Cliff', line: 'The largest plan, on the six plots at the edge. A double-height living room opens straight onto the pool.', bed: '5, all en suite', area: '7,800 sq ft', plot: '1,150 sq m', pool: '38 m infinity edge', price: 'From ₹16.8 Cr', dim: '38 m',
    rooms: [['Infinity pool', 40, 30, 560, 64, '38 x 4.5 m', 'pool'], ['Living room', 190, 110, 240, 150, '9.6 x 6.2 m'], ['Dining', 440, 110, 160, 96, '6.4 x 4.0 m'], ['Kitchen', 440, 216, 160, 84, '6.4 x 3.4 m'], ['Main suite', 40, 110, 140, 130, '6.8 x 5.1 m'], ['Study', 40, 250, 140, 70, '5.6 x 2.8 m'], ['Suite 2', 190, 270, 115, 110, '4.6 x 4.4 m'], ['Suite 3', 315, 270, 115, 110, '4.6 x 4.4 m'], ['Entry court', 440, 310, 160, 70, '6.4 x 2.8 m'], ['Garage', 40, 330, 140, 50, '5.6 x 5.8 m']] },
  court: { name: 'The Court', line: 'Wrapped around a planted courtyard, so every room has light from two sides and the sea from one.', bed: '4, all en suite', area: '6,300 sq ft', plot: '940 sq m', pool: '24 m lap pool', price: 'From ₹13.9 Cr', dim: '24 m',
    rooms: [['Lap pool', 120, 30, 400, 56, '24 x 3.6 m', 'pool'], ['Living room', 120, 100, 220, 120, '8.8 x 4.8 m'], ['Dining', 350, 100, 170, 120, '6.8 x 4.8 m'], ['Courtyard', 240, 232, 160, 110, '6.4 x 4.4 m', 'pool'], ['Main suite', 60, 232, 170, 110, '6.8 x 4.4 m'], ['Kitchen', 410, 232, 170, 70, '6.8 x 2.8 m'], ['Suite 2', 410, 312, 170, 78, '6.8 x 3.1 m'], ['Suite 3', 60, 352, 170, 38, '6.8 x 3.0 m'], ['Entry', 240, 352, 160, 38, '6.4 x 2.2 m']] },
  point: { name: 'The Point', line: 'A compact plan on the highest plots. Fewer rooms, the same view, and the roof terrace is yours alone.', bed: '4, all en suite', area: '5,400 sq ft', plot: '780 sq m', pool: '18 m plunge pool', price: 'From ₹11.5 Cr', dim: '18 m',
    rooms: [['Plunge pool', 170, 36, 300, 54, '18 x 3.2 m', 'pool'], ['Living and dining', 150, 104, 340, 130, '13.6 x 5.2 m'], ['Kitchen', 370, 246, 120, 90, '4.8 x 3.6 m'], ['Main suite', 150, 246, 210, 90, '8.4 x 3.6 m'], ['Suite 2', 150, 346, 165, 44, '6.6 x 3.4 m'], ['Suite 3', 325, 346, 165, 44, '6.6 x 3.4 m']] }
};
const floor = $('#floor'), NS = 'http://www.w3.org/2000/svg';
function drawPlan(key) {
  const t = TYPES[key]; if (!floor || !t) return;
  let h = '';
  t.rooms.forEach((r, i) => {
    const [n, x, y, w, hh, size, cls] = r;
    h += `<rect class="${cls || ''}" style="--i:${i}" x="${x}" y="${y}" width="${w}" height="${hh}" data-n="${n}" data-s="${size}" tabindex="0"><title>${n}, ${size}</title></rect>`;
    if (hh >= 44) h += `<text x="${x + w / 2}" y="${y + hh / 2 + 4}">${n}</text>`;
  });
  const p = t.rooms[0];
  h += `<path class="dimline" d="M${p[1]} ${p[2] - 14}h${p[3]}M${p[1]} ${p[2] - 20}v12M${p[1] + p[3]} ${p[2] - 20}v12"/><text class="dimtxt" x="${p[1] + p[3] / 2}" y="${p[2] - 19}">${t.dim}</text>`;
  floor.innerHTML = h;
  pick(floor.querySelectorAll('rect')[1]);
  $('[data-t-name]').textContent = t.name; $('[data-t-line]').textContent = t.line;
  ['bed', 'area', 'plot', 'pool', 'price'].forEach((k) => { $(`[data-t-${k}]`).textContent = t[k]; });
}
function pick(r) {
  if (!r) return;
  $$('rect', floor).forEach((x) => x.classList.toggle('on', x === r));
  $('[data-room]').textContent = r.dataset.n; $('[data-size]').textContent = r.dataset.s;
}
if (floor) {
  ['pointerover', 'click', 'focusin'].forEach((ev) => floor.addEventListener(ev, (e) => { if (e.target.tagName === 'rect') pick(e.target); }));
  $$('[data-type]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-type]').forEach((x) => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
    drawPlan(b.dataset.type);
  }));
  drawPlan('cliff');
}

/* ---------- masterplan: fourteen plots along the headland ---------- */
const master = $('#master');
if (master) {
  const info = { open: 'Available', held: 'On hold', sold: 'Sold' };
  // no, type, state, price, line
  const P = [[1, 'point', 'sold'], [2, 'point', 'sold'], [3, 'court', 'open', '₹13.9 Cr', 'Second row, north end. Sea view over the clubhouse lawn.'], [4, 'court', 'sold'], [5, 'cliff', 'sold'], [6, 'cliff', 'held', '₹17.4 Cr', 'Front row. Held until the end of the month.'], [7, 'cliff', 'open', '₹18.2 Cr', 'Front row, centre of the headland. Uninterrupted sea view.'], [8, 'cliff', 'open', '₹17.9 Cr', 'Front row, beside the beach path. The longest pool on the estate.'], [9, 'cliff', 'sold'], [10, 'cliff', 'sold'], [11, 'court', 'open', '₹14.6 Cr', 'Second row, south end. Mature banyan in the courtyard.'], [12, 'court', 'held', '₹14.2 Cr', 'Second row. Held for a returning buyer.'], [13, 'point', 'open', '₹11.5 Cr', 'Highest plot on the estate. Roof terrace with a full circle view.'], [14, 'point', 'sold']];
  let h = '<path class="sea" d="M0 0H900V150C760 120 640 200 520 170C380 136 230 210 0 160Z"/>';
  for (let i = 0; i < 5; i++) h += `<path class="contour" d="M0 ${190 + i * 62}C230 ${240 + i * 62} 380 ${166 + i * 62} 520 ${200 + i * 62}C640 ${230 + i * 62} 760 ${150 + i * 62} 900 ${180 + i * 62}"/>`;
  h += '<path class="road" d="M900 470C700 450 560 440 450 400C330 356 200 380 60 330"/><text class="lbl" x="450" y="92">Arabian Sea</text><text class="lbl" x="800" y="498">Estate road</text><text class="lbl" x="450" y="505">Clubhouse</text><rect class="contour" x="405" y="440" width="90" height="46"/>';
  const front = [5, 6, 7, 8, 9, 10], back = [3, 4, 11, 12], top = [1, 2, 13, 14];
  const pos = {};
  front.forEach((n, i) => { pos[n] = [130 + i * 112, 196 + Math.sin(i * 1.1) * 14, 92, 70]; });
  back.forEach((n, i) => { pos[n] = [200 + i * 136, 300 + Math.cos(i) * 8, 100, 62]; });
  top.forEach((n, i) => { pos[n] = [i < 2 ? 40 + i * 84 : 690 + (i - 2) * 84, 300 + (i % 2) * 22, 72, 58]; });
  P.forEach(([n, type, st]) => {
    const [x, y, w, hh] = pos[n], lab = String(n).padStart(2, '0');
    h += `<g tabindex="0" role="button" aria-label="Villa ${lab}, ${TYPES[type].name}, ${info[st]}" data-no="${n}"><rect class="plot ${st}" x="${x}" y="${y}" width="${w}" height="${hh}" transform="rotate(${(n % 3 - 1) * 3} ${x + w / 2} ${y + hh / 2})"/><text x="${x + w / 2}" y="${y + hh / 2 + 4}">${lab}</text></g>`;
  });
  master.innerHTML = h;
  const show = (g) => {
    const row = P.find((r) => r[0] === +g.dataset.no); if (!row) return;
    const [n, type, st, price, line] = row, lab = String(n).padStart(2, '0');
    $$('g', master).forEach((x) => { x.classList.toggle('sel', x === g); x.firstChild.classList.toggle('on', x === g); });
    $('[data-p-no]').textContent = `Villa ${lab} · ${info[st]}`;
    $('[data-p-type]').textContent = TYPES[type].name;
    $('[data-p-line]').textContent = st === 'sold' ? 'This villa has been sold. Tap a highlighted plot to see what is open.' : line;
    $('[data-p-price]').textContent = st === 'sold' ? 'Sold' : price;
    const cta = $('[data-p-cta]'); cta.textContent = st === 'sold' ? 'Ask about a similar villa' : `Enquire about Villa ${lab}`;
  };
  master.addEventListener('click', (e) => { const g = e.target.closest('g[data-no]'); if (g) show(g); });
  master.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { const g = e.target.closest('g[data-no]'); if (g) { e.preventDefault(); show(g); } } });
  show(master.querySelector('g[data-no="7"]'));
}
