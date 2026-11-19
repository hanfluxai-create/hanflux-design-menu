// Formhaus: a 15-shape composition on an 8 x 8 grid that rearranges between
// Bauhaus poster studies and the letters F O / R M. Shapes are unit primitives
// centred on their own origin; every state is just x, y, rotation, scale and fill.

const NS = 'http://www.w3.org/2000/svg';
const C = { red: '#d7261e', blue: '#1f4e9e', yellow: '#f2c230', black: '#111111', paper: '#f0e9dc' };

const GEOM = {
  rect: '<rect x="-0.5" y="-0.5" width="1" height="1"/>',
  circle: '<circle r="1"/>',
  half: '<path d="M-1 0 A1 1 0 0 1 1 0 Z"/>',
  tri: '<path d="M0 -0.5 L0.5 0.5 L-0.5 0.5 Z"/>',
  rtri: '<path d="M-0.5 -0.5 L0.5 0.5 L-0.5 0.5 Z"/>',
};

// [type, letters, posterA, posterB]; each state: [x, y, rot, sx, sy, fill]
const SHAPES = [
  ['rect',   [85, 200, 0, 70, 300, C.black],    [430, 460, 38, 60, 840, C.black],    [400, 400, 0, 40, 800, C.black]],    // F stem
  ['rect',   [200, 85, 0, 300, 70, C.red],      [330, 712, 0, 540, 30, C.black],     [400, 118, 0, 640, 46, C.red]],      // F top
  ['rect',   [165, 205, 0, 230, 70, C.blue],    [118, 380, 0, 76, 560, C.yellow],    [400, 690, 0, 640, 18, C.black]],    // F middle
  ['circle', [600, 200, 0, 150, 150, C.yellow], [682, 636, 0, 118, 118, C.blue],     [400, 400, 0, 150, 150, C.yellow]],  // O outer
  ['circle', [600, 200, 0, 58, 58, C.paper],    [682, 636, 0, 44, 44, C.paper],      [400, 400, 0, 68, 68, C.red]],       // O counter
  ['rect',   [85, 600, 0, 70, 300, C.black],    [560, 70, 0, 420, 20, C.black],      [118, 560, 0, 70, 300, C.yellow]],   // R stem
  ['half',   [120, 560, 90, 110, 110, C.red],   [248, 800, 0, 150, 150, C.blue],     [200, 0, 180, 120, 120, C.red]],     // R bowl
  ['rtri',   [210, 655, 0, 180, 190, C.blue],   [150, 128, 0, 120, 120, C.red],      [690, 690, 0, 220, 220, C.black]],   // R leg
  ['rect',   [485, 600, 0, 70, 300, C.black],   [300, 214, 0, 74, 74, C.black],      [690, 150, 45, 84, 84, C.black]],    // M left
  ['rect',   [715, 600, 0, 70, 300, C.black],   [760, 430, 0, 10, 520, C.black],     [112, 250, 0, 10, 300, C.blue]],     // M right
  ['tri',    [600, 545, 180, 160, 190, C.yellow], [588, 470, -15, 170, 150, C.yellow], [612, 300, 180, 128, 112, C.yellow]], // M middle
  ['circle', [400, 400, 0, 15, 15, C.red],      [470, 318, 0, 244, 244, C.red],      [400, 400, 0, 262, 262, C.blue]],    // sun
  ['rect',   [400, 400, 0, 800, 3, C.black],    [400, 766, 0, 760, 3, C.black],      [400, 782, 0, 800, 3, C.black]],     // hairline
  ['rect',   [400, 400, 0, 3, 800, C.black],    [36, 400, 0, 3, 720, C.black],       [782, 400, 0, 3, 800, C.black]],     // hairline v
  ['tri',    [772, 772, 0, 26, 26, C.black],    [90, 722, 0, 44, 40, C.black],       [80, 80, 0, 64, 60, C.red]],         // accent
];
// draw order: the sun and hairlines sit behind everything
const Z = [11, 12, 13, 6, 2, 5, 0, 1, 3, 4, 7, 8, 9, 10, 14];

export class Composition {
  constructor(svg, { onState } = {}) {
    this.svg = svg;
    this.onState = onState || (() => {});
    this.layer = svg.querySelector('#shapes');
    this.grid = svg.querySelector('#grid');
    this.ptr = { x: 400, y: 400, real: false, t: 0 };
    this.buildGrid();
    this.shapes = SHAPES.map((d, i) => {
      const g = document.createElementNS(NS, 'g');
      const el = document.createElementNS(NS, 'g');
      el.innerHTML = GEOM[d[0]];
      g.appendChild(el);
      const s = { type: d[0], states: { L: d[1], A: d[2], B: d[3] }, g, el, p: null, lean: 0, ox: 0, oy: 0, fill: '' };
      const a = d[2];
      s.p = { x: a[0], y: a[1] - 1000, r: a[2] + (i % 2 ? 40 : -40), sx: a[3], sy: a[4], fill: a[5] };
      return s;
    });
    Z.forEach((i) => this.layer.appendChild(this.shapes[i].g));
    this.render();
  }

  buildGrid() {
    const g = this.grid;
    let html = '';
    for (let i = 0; i <= 8; i++) {
      const v = i * 100;
      const strong = i === 0 || i === 8 || i === 4 ? ' gx' : '';
      html += `<line class="gl${strong}" x1="${v}" y1="0" x2="${v}" y2="800"/><line class="gl${strong}" x1="0" y1="${v}" x2="800" y2="${v}"/>`;
    }
    'ABCDEFGH'.split('').forEach((c, i) => { html += `<text x="${i * 100 + 50}" y="-14" text-anchor="middle">${c}</text>`; });
    for (let i = 0; i < 8; i++) html += `<text x="-16" y="${i * 100 + 55}" text-anchor="middle">${i + 1}</text>`;
    g.innerHTML = html;
  }

  drawGrid(gsap) {
    const lines = [...this.grid.querySelectorAll('line')];
    lines.forEach((l) => { l.setAttribute('pathLength', '1'); l.style.strokeDasharray = '1'; l.style.strokeDashoffset = '1'; });
    gsap.to(lines, { strokeDashoffset: 0, duration: 1.1, ease: 'power3.inOut', stagger: { each: 0.025, from: 'center' } });
    gsap.from(this.grid.querySelectorAll('text'), { opacity: 0, duration: 0.6, stagger: 0.03, delay: 0.4 });
  }

  // move every shape to state key, staggered, with weight
  go(key, gsap, { dur = 1.3, each = 0.04, ease = 'weight', seed = 1 } = {}) {
    const order = this.shapes.map((_, i) => i);
    let s = seed * 9301 + 49297;
    for (let i = order.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    order.forEach((idx, k) => {
      const sh = this.shapes[idx];
      const t = sh.states[key];
      let r = t[2];
      while (r - sh.p.r > 180) r -= 360;
      while (r - sh.p.r < -180) r += 360;
      gsap.to(sh.p, { x: t[0], y: t[1], r, sx: t[3], sy: t[4], fill: t[5], duration: dur, ease, delay: k * each, overwrite: true });
    });
    this.onState(key);
  }

  setPointer(x, y, real) { this.ptr.x = x; this.ptr.y = y; this.ptr.real = real; }

  tick(dt, t) {
    if (!this.ptr.real) {
      this.ptr.x = 400 + 330 * Math.sin(t * 0.45);
      this.ptr.y = 400 + 260 * Math.sin(t * 0.31 + 1.2);
    }
    const k = 1 - Math.exp(-dt * 6);
    for (const sh of this.shapes) {
      const p = sh.p;
      const dx = this.ptr.x - p.x, dy = this.ptr.y - p.y;
      const dist = Math.hypot(dx, dy) + 1;
      const infl = Math.min(1, 220 / dist);
      const size = Math.max(p.sx, p.sy);
      const heavy = size > 600 ? 0 : 1 / (1 + size / 420);
      const tl = Math.max(-9, Math.min(9, dx * 0.03)) * infl * heavy;
      sh.lean += (tl - sh.lean) * k;
      sh.ox += ((dx / dist) * 16 * infl * heavy - sh.ox) * k;
      sh.oy += ((dy / dist) * 16 * infl * heavy - sh.oy) * k;
    }
    this.render();
  }

  render() {
    for (const sh of this.shapes) {
      const p = sh.p;
      sh.g.setAttribute('transform', `translate(${(p.x + sh.ox).toFixed(2)} ${(p.y + sh.oy).toFixed(2)}) rotate(${(p.r + sh.lean).toFixed(3)})`);
      sh.el.setAttribute('transform', `scale(${p.sx.toFixed(3)} ${p.sy.toFixed(3)})`);
      if (p.fill !== sh.fill) { sh.fill = p.fill; sh.el.setAttribute('fill', p.fill); }
    }
  }
}
