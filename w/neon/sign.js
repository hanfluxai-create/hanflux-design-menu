// Bent-glass neon in SVG: unlit glass, white-hot core, coloured body, layered halo,
// mounting clips, plus a flicker engine that can drive any number of mirrored layers.
const NS = 'http://www.w3.org/2000/svg';
export const PAL = {
  p: { glow: '#ff2bd6', tube: '#ff62e6', core: '#fff2fd', glass: 'rgba(255,210,244,.2)' },
  b: { glow: '#29e2ff', tube: '#72eeff', core: '#f2feff', glass: 'rgba(196,244,255,.2)' },
  a: { glow: '#ffb22e', tube: '#ffcf68', core: '#fff8ea', glass: 'rgba(255,232,196,.2)' },
};

export function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

let UID = 0;

// Build one neon piece. tubes: [{id, c, d}]; vb: [x, y, w, h]; T: tube width in user units.
export function buildNeon(host, { vb, tubes, T = 14, label, clips = 0, quality = 1, halo = 1, glass = true, cls = '' }) {
  const uid = 'n' + (++UID);
  const [x, y, w, h] = vb;
  const svg = el('svg', { viewBox: vb.join(' '), class: 'neon ' + cls, role: 'img', 'aria-label': label || '', preserveAspectRatio: 'xMidYMid meet' });
  if (!label) svg.setAttribute('aria-hidden', 'true');
  const defs = el('defs', {}, svg);
  const fx = x - w * 0.3, fy = y - h * 0.3, fw = w * 1.6, fh = h * 1.6;
  const filt = (id, sd) => {
    const f = el('filter', { id, filterUnits: 'userSpaceOnUse', x: fx, y: fy, width: fw, height: fh, 'color-interpolation-filters': 'sRGB' }, defs);
    el('feGaussianBlur', { stdDeviation: sd }, f);
  };
  filt(uid + 'H', T * 1.8 * quality);
  filt(uid + 'G', T * 0.5);
  filt(uid + 'C', T * 0.07);
  filt(uid + 'S', T * 0.35);
  const ids = [];
  tubes.forEach((t) => { el('path', { id: `${uid}-${t.id}`, d: t.d }, defs); ids.push(t.id); });
  const href = (t) => `#${uid}-${t.id}`;
  const use = (t, attrs, parent) => { const u = el('use', attrs, parent); u.setAttribute('href', href(t)); return u; };

  // unlit glass, with a faint shadow on the wall and a specular line
  const off = el('g', { class: 'neon__off' }, svg);
  if (glass) tubes.forEach((t) => {
    use(t, { stroke: 'rgba(0,0,0,.6)', 'stroke-width': T * 1.1, transform: `translate(${T * 0.5} ${T * 0.85})`, filter: `url(#${uid}S)`, class: 'neon__shadow' }, off);
    use(t, { stroke: PAL[t.c].glass, 'stroke-width': T }, off);
    use(t, { stroke: 'rgba(255,255,255,.22)', 'stroke-width': T * 0.22, transform: `translate(${-T * 0.16} ${-T * 0.2})` }, off);
  });
  const lit = el('g', { class: 'neon__lit' }, svg);
  const hw = el('g', { class: 'neon__hw' }, svg);
  const glow = el('g', { class: 'neon__glow' }, svg);
  const L = {}, H = {};
  tubes.forEach((t) => {
    const P = PAL[t.c];
    const g = el('g', { 'data-t': t.id }, lit);
    use(t, { stroke: P.tube, 'stroke-width': T }, g);
    use(t, { stroke: P.core, 'stroke-width': T * 0.46, filter: `url(#${uid}C)` }, g);
    const g2 = el('g', { 'data-t': t.id }, glow);
    if (halo) use(t, { stroke: P.glow, 'stroke-width': T * 2.4, filter: `url(#${uid}H)`, opacity: 0.62 * halo }, g2);
    use(t, { stroke: P.glow, 'stroke-width': T * 1.4, filter: `url(#${uid}G)`, opacity: 0.9 }, g2);
    L[t.id] = g; H[t.id] = g2;
  });
  host.appendChild(svg);
  // mounting clips, spaced along each tube
  if (clips > 0) {
    tubes.forEach((t) => {
      const p = svg.getElementById ? svg.querySelector(`#${uid}-${t.id}`) : null;
      if (!p || !p.getTotalLength) return;
      const len = p.getTotalLength();
      const n = Math.max(1, Math.round(len / clips));
      for (let i = 0; i < n; i++) {
        const s = ((i + 0.5) / n) * len;
        const a = p.getPointAtLength(Math.max(0, s - 2)), b = p.getPointAtLength(Math.min(len, s + 2));
        const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
        const c = p.getPointAtLength(s);
        const g = el('g', { transform: `translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${ang.toFixed(1)})` }, hw);
        el('rect', { x: -T * 0.42, y: -T * 1.25, width: T * 0.84, height: T * 2.5, rx: T * 0.22, fill: 'rgba(14,10,16,.92)', stroke: 'rgba(255,255,255,.16)', 'stroke-width': T * 0.08 }, g);
        el('rect', { x: -T * 0.42, y: -T * 0.2, width: T * 0.84, height: T * 0.4, fill: 'rgba(255,255,255,.08)' }, g);
      }
    });
  }
  const set = (id, v) => {
    if (L[id]) L[id].style.opacity = v;
    if (H[id]) H[id].style.opacity = v;
  };
  ids.forEach((id) => set(id, 0));
  return { svg, uid, ids, set, href: (id) => `#${uid}-${id}`, L, H };
}

// Keyframe flicker engine: play(id, [[dtMs, value], ...]) and it applies values on time.
export class Flicker {
  constructor(apply) { this.apply = apply; this.seq = new Map(); this.val = new Map(); this.raf = 0; this.tick = this.tick.bind(this); }
  play(id, frames, delay = 0) {
    let t = performance.now() + delay;
    this.seq.set(id, frames.map(([dt, v]) => [(t += dt), v]));
    if (!this.raf) this.raf = requestAnimationFrame(this.tick);
  }
  now(id, v) { this.seq.delete(id); this.set(id, v); }
  set(id, v) { if (this.val.get(id) !== v) { this.val.set(id, v); this.apply(id, v); } }
  get(id) { return this.val.get(id) || 0; }
  tick(now) {
    this.raf = 0;
    for (const [id, list] of this.seq) {
      let v = null;
      while (list.length && list[0][0] <= now) v = list.shift()[1];
      if (v !== null) this.set(id, v);
      if (!list.length) this.seq.delete(id);
    }
    if (this.seq.size) this.raf = requestAnimationFrame(this.tick);
  }
}

export const IGNITE = [[0, 0.85], [40, 0], [60, 1], [55, 0], [130, 1]];
export const IGNITE_SOFT = [[0, 0.5], [70, 0], [90, 1]];
export const SPUTTER = [[0, 0.22], [60, 0], [170, 0.38], [50, 0], [260, 0.18], [40, 0.5], [70, 0], [380, 0.3], [60, 0], [200, 1], [45, 0.55], [55, 1]];
export const SPUTTER_SHORT = [[0, 0.3], [60, 0], [140, 0.45], [50, 0], [180, 1], [40, 0.5], [50, 1]];
export const GLITCHES = [
  [[0, 0], [45, 1], [60, 0.2], [55, 1]],
  [[0, 0.35], [70, 1]],
  [[0, 0], [90, 0.7], [40, 0], [120, 1]],
];
