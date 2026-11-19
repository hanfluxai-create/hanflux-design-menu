// Loudmouth: kinetic type engine. Every letter is a live Roboto Flex instance (wdth, wght, YTUC, GRAD).
const HX = window.HX || { embed: false, tour: false, lite: false, device: innerWidth < 760 ? 'mobile' : 'desktop', reducedMotion: false, ready() {}, on() {} };
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

const RM = !!HX.reducedMotion;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches && !HX.embed;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const isMobile = () => innerWidth < 760;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------------- grain ---------------- */
(() => {
  const c = document.createElement('canvas'); c.width = c.height = 180;
  const x = c.getContext('2d'); const d = x.createImageData(180, 180);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0);
  document.documentElement.style.setProperty('--grain', `url(${c.toDataURL('image/png')})`);
})();

/* ---------------- smooth scroll (never inside the menu frame) ---------------- */
let lenis = null;
if (!HX.embed && !RM && FINE && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); if (id.length < 2) return;
  const t = document.querySelector(id); if (!t) return;
  e.preventDefault(); closeMenu();
  if (lenis) lenis.scrollTo(t, { offset: 0, duration: 1.4 }); else t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
}));

/* ---------------- pointer (real on desktop, a drifting ghost inside the menu frame) ---------------- */
const ptr = { x: -9999, y: -9999, last: -1e9 };
addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { ptr.x = e.clientX; ptr.y = e.clientY; ptr.last = performance.now(); } }, { passive: true });
const realPointer = () => FINE && performance.now() - ptr.last < 3500;

/* ---------------- FlexLine: a line of type whose letters ride a wave on real axes ---------------- */
class FlexLine {
  constructor(el, text, o = {}) {
    this.el = el;
    this.o = Object.assign({ amp: 30, wMid: 760, wAmp: 180, yMid: 712, yAmp: 48, speed: 1.45, k: 0.52, phase: 0, gain: 110, R: 240, pw: 62, pg: 300, py: -40, lo: 25, hi: 151, gi: 0, ghost: null }, o);
    this.base = 90; this.target = 0; this.F = 100; this.frame = 0; this.boost = 0;
    this.build(text);
  }
  build(text) {
    this.el.textContent = '';
    this.inner = document.createElement('span');
    this.inner.className = 'hrow__in';
    this.inner.setAttribute('aria-hidden', 'true');
    this.el.appendChild(this.inner);
    this.chars = [...text].map((c) => {
      const s = document.createElement('span');
      s.className = 'fx' + (c === '.' && this.o.redDot ? ' red' : '');
      s.textContent = c === ' ' ? ' ' : c;
      this.inner.appendChild(s);
      return { s, x: -9999, y: -9999 };
    });
  }
  size(F) { this.F = F; this.el.style.fontSize = F.toFixed(2) + 'px'; }
  write(t, px, py) {
    const o = this.o, n = this.chars.length, R = o.R, R2 = R * 0.75;
    for (let i = 0; i < n; i++) {
      const ch = this.chars[i];
      const ph = t * o.speed - (o.gi + i) * o.k + o.phase;
      const s = Math.sin(ph);
      let wd = this.base + o.amp * s;
      let wg = o.wMid + o.wAmp * Math.sin(ph * 0.83 + 1.3);
      let yt = o.yMid - o.yAmp * s;
      if (px > -999) {
        const dx = (px - ch.x) / R, dy = (py - ch.y) / R2;
        const f = Math.exp(-(dx * dx + dy * dy));
        wd += o.pw * f; wg += o.pg * f; yt += o.py * f;
      }
      wd += this.boost;
      // keep counters open: short caps cannot carry the heaviest weights (see the specimen tests)
      yt = clamp(yt, 662, 760);
      wg = clamp(wg, 100, Math.min(940, 868 + (yt - 662) * 1.2));
      ch.s.style.fontVariationSettings = `"wdth" ${clamp(wd, 25, 151).toFixed(1)},"wght" ${wg | 0},"YTUC" ${yt | 0}`;
    }
  }
  read(measure) {
    const w = this.inner.offsetWidth;
    if (this.target > 0) {
      this.base = clamp(this.base + ((this.target - w) / this.target) * this.o.gain, this.o.lo, this.o.hi);
    }
    if (measure) for (const ch of this.chars) { const r = ch.s.getBoundingClientRect(); ch.x = r.left + r.width * 0.5; ch.y = r.top + r.height * 0.5; }
    return w;
  }
  fit(t) {
    if (!(this.target > 0)) return;
    let lo = this.o.lo, hi = this.o.hi;
    for (let k = 0; k < 10; k++) {
      this.base = (lo + hi) * 0.5;
      this.write(t, -9999, -9999);
      if (this.inner.offsetWidth > this.target) hi = this.base; else lo = this.base;
    }
    this.base = (lo + hi) * 0.5;
  }
  rect() { return this.el.getBoundingClientRect(); }
}

/* groups of lines that animate together, only while on screen */
const groups = [];
function addGroup(root, lines, ghost) {
  const g = { root, lines, ghost, on: false };
  new IntersectionObserver((es) => { g.on = es[0].isIntersecting; }, { rootMargin: '80px 0px' }).observe(root);
  groups.push(g);
  return g;
}

/* ---------------- hero ---------------- */
const hero = $('.hero');
const heroInner = $('.hero__inner');
const heroTitle = $('#heroTitle');
const kicker = $('.hero__kicker');
const heroFoot = $('.hero__foot');
let heroLines = [], heroMode = '';
const heroState = { p: 0 };

function buildHero() {
  const mode = isMobile() ? 'm' : 'd';
  if (mode === heroMode) return;
  heroMode = mode;
  const rows = mode === 'd' ? ['WE MAKE BRANDS', 'LOUD.'] : ['WE MAKE', 'BRANDS', 'LOUD.'];
  heroTitle.textContent = '';
  let gi = 0;
  heroLines = rows.map((txt, i) => {
    const el = document.createElement('span');
    el.className = 'hrow';
    heroTitle.appendChild(el);
    const ln = new FlexLine(el, txt, { gi, redDot: true, phase: i * 0.6, amp: i === rows.length - 1 ? 26 : 30 });
    gi += txt.length + 2;
    return ln;
  });
  heroGroup.lines = heroLines;
}
const heroGroup = addGroup(hero, [], 'hero');

function layoutHero() {
  buildHero();
  const W = heroTitle.clientWidth;
  const csI = getComputedStyle(heroInner);
  const availH = heroInner.clientHeight - parseFloat(csI.paddingTop) - parseFloat(csI.paddingBottom) - kicker.offsetHeight - heroFoot.offsetHeight - parseFloat(getComputedStyle(heroFoot).marginTop) - (isMobile() ? 18 : 26);
  const desk = heroMode === 'd';
  const ks = desk ? [0.134, 0.3] : [0.215, 0.262, 0.4];
  let Fs = ks.map((k) => k * W);
  const need = Fs.reduce((a, b) => a + b, 0) * 0.84;
  if (need > availH && availH > 120) { const s = availH / need; Fs = Fs.map((f) => f * s); }
  // ring size follows the layout; on desktop it orbits at the end of the last row
  const rs = desk ? clamp(Fs[1] * 0.74, 170, 300) : 128;
  ringRest = rs;
  ringStage = desk ? Math.min(innerHeight * 0.72, innerWidth * 0.5, 620) : Math.min(innerWidth * 0.86, 360);
  ring.style.setProperty('--rs', ringStage + 'px');
  buildRing(ringStage);
  heroLines.forEach((ln, i) => {
    ln.size(Fs[i]);
    ln.target = desk && i === heroLines.length - 1 ? W - rs - W * 0.03 : W;
    ln.baseTarget = ln.target;
    ln.o.R = Math.max(150, W * 0.17);
    ln.fit(clock.t); ln.read(true);
  });
  // place the ring by its centre (the element is stage-sized and scaled down at rest)
  const ir = heroInner.getBoundingClientRect();
  let cx, cy;
  if (desk) {
    const lr = heroLines[heroLines.length - 1].el.getBoundingClientRect();
    cx = ir.width - parseFloat(csI.paddingRight) - rs * 0.5;
    cy = lr.top - ir.top + lr.height * 0.5;
  } else {
    const kr = kicker.getBoundingClientRect(), tr = heroTitle.getBoundingClientRect();
    cx = ir.width - parseFloat(csI.paddingRight) - rs * 0.5 + 4;
    cy = Math.max(kr.bottom - ir.top + 10 + rs / 2, (kr.bottom + tr.top) / 2 - ir.top);
  }
  ringHome.x = cx; ringHome.y = cy;
  ring.style.left = (cx - ringStage / 2).toFixed(1) + 'px';
  ring.style.top = (cy - ringStage / 2).toFixed(1) + 'px';
}
let ringRest = 200, ringStage = 500;
const ringHome = { x: 0, y: 0 };

/* ---------------- 3D text ring (two faces so the far side reads mirrored and dim) ---------------- */
const ring = $('#ring');
const ringFront = $('.ring__front', ring), ringBack = $('.ring__back', ring);
const RING_TEXT = 'STRATEGY · IDENTITY · MOTION · WEB · ';
let ringBuiltFor = 0;
function buildRing(rs) {
  if (Math.abs(rs - ringBuiltFor) < 2) return;
  ringBuiltFor = rs;
  const chars = [...RING_TEXT];
  const n = chars.length;
  const R = rs * 0.44;
  const fs = (2 * Math.PI * R / n) * 1.04;
  ring.style.setProperty('--rfs', fs.toFixed(1) + 'px');
  ringFront.textContent = ''; ringBack.textContent = '';
  chars.forEach((c, i) => {
    const a = (i / n) * 360;
    const f = document.createElement('span'); f.textContent = c;
    if (c === '·') f.className = 'dot';
    f.style.transform = `rotateY(${a.toFixed(2)}deg) translateZ(${R.toFixed(1)}px)`;
    const b = document.createElement('span'); b.textContent = c;
    b.style.transform = `rotateY(${a.toFixed(2)}deg) translateZ(${R.toFixed(1)}px) rotateY(180deg) scaleX(-1)`;
    ringFront.appendChild(f); ringBack.appendChild(b);
  });
}
let ringAngle = 0, ringOn = true;
new IntersectionObserver((es) => { ringOn = es[0].isIntersecting; }).observe(ring);

/* ---------------- marquees (hero outline type + client bands) ---------------- */
const marquees = [];
function setupMarquee(track, speed, host) {
  const clone = track.innerHTML;
  track.innerHTML = clone + clone;
  const m = { track, speed, x: 0, w: 0, on: true };
  new IntersectionObserver((es) => { m.on = es[0].isIntersecting; }).observe(host);
  marquees.push(m);
  return m;
}
$$('.mq').forEach((el) => setupMarquee($('.mq__t', el), parseFloat(el.dataset.speed), el));
setupMarquee($('.band--acid .band__t'), -46, $('.band--acid'));
setupMarquee($('.band--ink .band__t'), 38, $('.band--ink'));
$$('.band__t').forEach((t) => [...t.children].slice(t.children.length / 2).forEach((c) => c.setAttribute('aria-hidden', 'true')));
function measureMarquees() { marquees.forEach((m) => { m.w = m.track.scrollWidth / 2; }); }

/* ---------------- contact + footer lines ---------------- */
const sayEl = $('#say'), mailEl = $('#mail'), fmarkEl = $('#fmark');
const sayLine = new FlexLine(sayEl, 'SAY HELLO', { amp: 34, wMid: 800, wAmp: 180, speed: 1.6, k: 0.6 });
const mailLine = new FlexLine(mailEl, 'hello@loudmouth.studio', { amp: 16, wMid: 540, wAmp: 150, yAmp: 0, yMid: 712, speed: 1.2, k: 0.42, pw: 50, pg: 360, py: 0, gain: 90 });
const fmarkLine = new FlexLine(fmarkEl, 'LOUDMOUTH', { amp: 28, wMid: 800, wAmp: 160, speed: 0.9, k: 0.5, yAmp: 44 });
addGroup($('.contact'), [sayLine, mailLine], 'contact');
addGroup($('.foot'), [fmarkLine], 'foot');
function layoutLines() {
  const W = $('.contact').clientWidth - 2 * parseFloat(getComputedStyle($('.contact')).paddingLeft);
  const mob = isMobile();
  sayLine.size(W * (mob ? 0.2 : 0.192)); sayLine.target = W; sayLine.o.R = Math.max(140, W * 0.16);
  mailLine.size(W * (mob ? 0.086 : 0.084)); mailLine.target = W; mailLine.o.R = Math.max(110, W * 0.12);
  fmarkLine.size(W * (mob ? 0.17 : 0.168)); fmarkLine.target = W; fmarkLine.o.R = Math.max(140, W * 0.16);
  [sayLine, mailLine, fmarkLine].forEach((l) => { l.fit(clock.t); l.read(true); });
}

/* ---------------- the frame loop ---------------- */
const clock = { t: 0, last: performance.now() };
let scrollV = 0, lastY = scrollY;
function ghostFor(g, t) {
  const r = g.root === hero ? heroTitle.getBoundingClientRect() : g.lines[0].el.getBoundingClientRect();
  if (g.ghost === 'hero') return [r.left + r.width * (0.5 + 0.42 * Math.sin(t * 0.41)), r.top + r.height * (0.52 + 0.4 * Math.sin(t * 0.67 + 0.8))];
  if (g.ghost === 'contact') { const r2 = mailEl.getBoundingClientRect(); return [r.left + r.width * (0.5 + 0.45 * Math.sin(t * 0.5)), r.top + (r2.bottom - r.top) * (0.5 + 0.45 * Math.sin(t * 0.83))]; }
  return [r.left + r.width * (0.5 + 0.45 * Math.sin(t * 0.37)), r.top + r.height * 0.5];
}
function frame(now) {
  const dt = Math.min(0.05, (now - clock.last) / 1000);
  clock.last = now;
  if (!RM) clock.t += dt;
  const t = clock.t;
  const y = scrollY; scrollV += ((y - lastY) / Math.max(dt, 0.001) - scrollV) * 0.12; lastY = y;
  const vBoost = clamp(Math.abs(scrollV) / 900, 0, 3);

  // type: write all, then read all (one layout per frame)
  const live = groups.filter((g) => g.on && g.lines.length);
  const ptrs = live.map((g) => {
    if (realPointer()) return [ptr.x, ptr.y];
    if (RM) return [-9999, -9999];
    return ghostFor(g, t);
  });
  live.forEach((g, gi) => g.lines.forEach((ln) => ln.write(t, ptrs[gi][0], ptrs[gi][1])));
  const measure = (++frameCount % 5) === 0;
  live.forEach((g) => g.lines.forEach((ln) => ln.read(measure)));

  // marquees
  for (const m of marquees) {
    if (!m.on || !m.w) continue;
    m.x += m.speed * (1 + vBoost * 2.2) * dt * (RM ? 0 : 1);
    if (m.x <= -m.w) m.x += m.w; else if (m.x > 0) m.x -= m.w;
    m.track.style.transform = `translate3d(${m.x.toFixed(2)}px,0,0)`;
  }
  // ring
  if (ringOn && !RM) {
    ringAngle = (ringAngle + dt * (26 + vBoost * 110)) % 360;
    const tf = `rotateX(-16deg) rotateZ(-9deg) rotateY(${(-ringAngle).toFixed(2)}deg)`;
    ringFront.style.transform = tf; ringBack.style.transform = tf;
  }
  requestAnimationFrame(frame);
}
let frameCount = 0;

/* ---------------- hero scroll: rows split and slide apart ---------------- */
function heroScroll() {
  if (RM) return;
  ScrollTrigger.create({
    trigger: hero, start: 'top top', end: () => '+=' + Math.round(innerHeight * 1.05), pin: true, pinSpacing: true, scrub: true,
    onUpdate: (st) => { heroState.p = st.progress; applyHeroProgress(); },
    invalidateOnRefresh: true,
  });
}
function applyHeroProgress() {
  const p = heroState.p, e = p * p * (3 - 2 * p);
  const W = innerWidth, H = innerHeight, n = heroLines.length;
  heroLines.forEach((ln, i) => {
    const dir = i % 2 === 0 ? -1 : 1;
    const x = dir * e * W * (1.5 + 0.1 * i);
    const yy = (i - (n - 1) / 2) * e * H * 0.1;
    ln.el.style.transform = `translate3d(${x.toFixed(1)}px,${yy.toFixed(1)}px,0)`;
    ln.boost = e * 40 * (i % 2 ? 1 : 0.6);
    ln.target = (ln.baseTarget || heroTitle.clientWidth) * (1 + e * 0.35);
  });
  heroFoot.style.opacity = kicker.style.opacity = (1 - e * 1.8).toFixed(3);
  heroFoot.style.transform = `translate3d(0,${(-e * 60).toFixed(1)}px,0)`;
  // the ring takes the stage: from its resting spot to the centre, scaling up to its native (crisp) size
  const dx = (heroInner.clientWidth / 2 - ringHome.x) * e;
  const dy = (heroInner.clientHeight / 2 - ringHome.y) * e;
  const s0 = ringRest / ringStage;
  ring.style.transform = `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0) scale(${(s0 + (1 - s0) * e).toFixed(4)})`;
  heroFoot.style.pointerEvents = e > 0.3 ? 'none' : '';
  heroTitle.style.opacity = (1 - Math.max(0, e - 0.75) * 2.4).toFixed(3);
  const so = clamp((e - 0.62) / 0.3, 0, 1);
  stage.style.opacity = so.toFixed(3);
  stage.style.transform = `translate3d(-50%,${((1 - so) * 30).toFixed(1)}px,0)`;
}
const stage = $('#heroStage');

/* ---------------- manifesto: words light up as you read ---------------- */
function splitWords(p) {
  const out = [];
  const walk = (node, hit) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const parts = n.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const s = document.createElement('span'); s.className = 'w'; s.textContent = part;
          if (hit) s.dataset.hit = hit;
          frag.appendChild(s); out.push(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n, n.dataset.hit || 'acid');
    });
  };
  walk(p, null);
  return out;
}
function manifesto() {
  const words = splitWords($('#manifesto'));
  if (RM) { words.forEach((w) => { w.style.color = w.dataset.hit === 'red' ? 'var(--red)' : w.dataset.hit ? 'var(--acid)' : 'var(--paper)'; }); return; }
  const tl = gsap.timeline({ scrollTrigger: { trigger: '#manifesto', start: 'top 88%', end: 'bottom 52%', scrub: 0.4 } });
  words.forEach((w, i) => {
    const hit = w.dataset.hit;
    tl.to(w, { color: hit === 'red' ? '#ff3b1f' : hit ? '#e4ff1a' : '#f5f5f0', duration: 1, ease: 'none' }, i * 0.32);
    if (hit) tl.fromTo(w, { fontVariationSettings: '"wdth" 92,"wght" 520,"GRAD" 0' }, { fontVariationSettings: '"wdth" 92,"wght" 520,"GRAD" 150', duration: 1, ease: 'none' }, i * 0.32);
  });
}

/* ---------------- services: the word under the reading line expands ---------------- */
function services() {
  const items = $$('.svc__item');
  const set = (k) => items.forEach((it, i) => { const on = i === k; it.classList.toggle('is-on', on); $('.svc__row', it).setAttribute('aria-expanded', on); });
  items.forEach((it, i) => {
    $('.svc__row', it).addEventListener('click', () => set(i));
    if (FINE) it.addEventListener('mouseenter', () => set(i));
    ScrollTrigger.create({ trigger: it, start: 'top 58%', end: 'bottom 58%', onToggle: (st) => { if (st.isActive) set(i); } });
  });
}

/* ---------------- work covers ---------------- */
function work() {
  const ps = $$('.proj');
  if (RM) return;
  ps.forEach((p) => p.classList.add('is-hidden'));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove('is-hidden'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  ps.forEach((p) => io.observe(p));
}

/* ---------------- numbers stretch as they count ---------------- */
function numbers() {
  $$('.num').forEach((el) => {
    const to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec || '0', 10), suf = el.dataset.suffix || '';
    const fmt = (v) => v.toFixed(dec) + suf;
    if (RM) { el.textContent = fmt(to); return; }
    const o = { v: 0 };
    el.textContent = fmt(0);
    el.style.fontVariationSettings = '"wdth" 25,"wght" 900';
    ScrollTrigger.create({
      trigger: '.nums__grid', start: 'top 88%', once: true,
      onEnter: () => gsap.to(o, { v: to, duration: 1.8, ease: 'expo.out', onUpdate: () => { el.textContent = fmt(o.v); el.style.fontVariationSettings = `"wdth" ${(25 + 126 * (o.v / to)).toFixed(1)},"wght" 900`; } }),
    });
  });
}

/* ---------------- section reveals ---------------- */
function reveals() {
  if (RM) return;
  gsap.utils.toArray('.sec-head').forEach((h) => gsap.from(h, { opacity: 0, y: 24, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 92%' } }));
  gsap.from('.work__big', { yPercent: 40, opacity: 0, duration: 1.2, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.work__title', start: 'top 90%' } });
  gsap.from('.manifesto__facts li', { y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.manifesto__facts', start: 'top 95%' } });
  gsap.from('.contact__grid > *', { y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.contact__grid', start: 'top 95%' } });
}

/* ---------------- hero intro ---------------- */
function intro() {
  if (RM) return;
  const chars = heroLines.flatMap((l) => l.chars.map((c) => c.s));
  gsap.from(chars, { yPercent: 110, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.035, delay: 0.1 });
  gsap.from([kicker, ...heroFoot.children], { y: 26, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.45 });
  gsap.from(ring.children, { opacity: 0, duration: 1.4, ease: 'power2.out', delay: 0.7 });
}

/* ---------------- nav, menu, clock ---------------- */
const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
function closeMenu() { menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); }
burger.addEventListener('click', () => {
  const open = !menu.classList.contains('is-open');
  menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', String(!open));
  burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
let navY = 0;
function navScroll() {
  const y = scrollY;
  nav.classList.toggle('is-solid', y > innerHeight * 0.85);
  if (!HX.embed) nav.classList.toggle('is-hidden', y > innerHeight * 1.2 && y > navY + 4 && !menu.classList.contains('is-open'));
  if (y < navY - 4) nav.classList.remove('is-hidden');
  navY = y;
}
addEventListener('scroll', navScroll, { passive: true });
const clockEl = $('#clock');
function tickClock() {
  try {
    const s = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }).format(new Date());
    clockEl.textContent = s; clockEl.setAttribute('datetime', s);
  } catch (e) {}
}
tickClock(); setInterval(tickClock, 15000);

/* ---------------- forms ---------------- */
$('#brief').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.currentTarget; const name = (f.name.value || '').trim().split(' ')[0];
  f.classList.add('is-sent');
  $('.brief__ok', f).textContent = `Got it${name ? ', ' + name : ''}. Mara will reply within one working day, at a reasonable volume.`;
});
$('#mini').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('#mini-email').value.trim();
  $('.mini__ok').textContent = /.+@.+\..+/.test(v) ? 'You are on the list. First letter lands on the first Monday.' : 'That email looks a little quiet. Try again?';
});

/* ---------------- cursor + magnetic buttons (desktop only, never in the menu frame) ---------------- */
if (FINE && !RM) {
  document.documentElement.classList.add('has-cursor');
  const cur = $('#cursor'); const cp = { x: -100, y: -100 };
  addEventListener('pointermove', (e) => { cp.x = e.clientX; cp.y = e.clientY; }, { passive: true });
  gsap.ticker.add(() => { cur.style.transform = `translate3d(${cp.x}px,${cp.y}px,0)`; });
  $$('a,button,.proj__cover,.svc__row').forEach((el) => {
    el.addEventListener('mouseenter', () => cur.classList.add('is-big'));
    el.addEventListener('mouseleave', () => cur.classList.remove('is-big'));
  });
  $$('.magnetic').forEach((b) => {
    const xTo = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3.out' }), yTo = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3.out' });
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.28); yTo((e.clientY - r.top - r.height / 2) * 0.35); });
    b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------------- boot ---------------- */
let lastMode = isMobile();
function layoutAll() {
  layoutHero(); layoutLines(); measureMarquees(); applyHeroProgress();
  $('.clients').style.setProperty('--bandh', $('.band--acid').offsetHeight + 'px');
}
function onResize() {
  const m = isMobile();
  if (m !== lastMode) { lastMode = m; heroMode = ''; }
  layoutAll();
  ScrollTrigger.refresh();
}
let rT = 0;
addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(onResize, 160); });

async function boot() {
  try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]); } catch (e) {}
  try { await document.fonts.load('900 100px "Roboto Flex"'); } catch (e) {}
  layoutAll();
  heroScroll(); manifesto(); services(); work(); numbers(); reveals();
  intro();
  navScroll();
  requestAnimationFrame((t) => { clock.last = t; requestAnimationFrame(frame); });
  requestAnimationFrame(() => requestAnimationFrame(() => { HX.ready(); ScrollTrigger.refresh(); }));
  // fonts can settle a beat later: re-fit once more
  setTimeout(() => { layoutAll(); ScrollTrigger.refresh(); }, 900);
}
boot();
