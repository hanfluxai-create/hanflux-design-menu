import { FLAVOURS, ROWS, drawAtlas, drawPackshot } from './labels.js';

const HX = window.HX || { embed: false, tour: false, lite: false, device: innerWidth < 760 ? 'mobile' : 'desktop', reducedMotion: false, ready() {}, on() {} };
const { gsap, ScrollTrigger, Draggable, InertiaPlugin } = window;
gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);
const RM = !!HX.reducedMotion;
const LITE = HX.lite || HX.device === 'mobile' || innerWidth < 760;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
const rupee = (n) => '₹' + n.toLocaleString('en-IN');

/* ---------- marquees (announcement + bands) ---------- */
const ann = $('.announce__t'); ann.innerHTML += ann.innerHTML;
const bands = $$('.band__t').map((t, i) => { t.innerHTML += t.innerHTML; return { t, x: 0, w: 0, v: i ? -60 : 46, on: true }; });
bands.forEach((b) => new IntersectionObserver((es) => { b.on = es[0].isIntersecting; }).observe(b.t));

/* ---------- cart + toast ---------- */
let cart = 0;
const cartCount = $('#cartCount'), cartBtn = $('#cartBtn'), toast = $('#toast');
let toastT = 0;
function addToCart(n, msg) {
  cart += n; cartCount.textContent = cart;
  cartBtn.setAttribute('aria-label', `Cart, ${cart} item${cart === 1 ? '' : 's'}`);
  cartCount.classList.remove('bump'); void cartCount.offsetWidth; cartCount.classList.add('bump');
  toast.textContent = msg; toast.classList.add('is-on');
  clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('is-on'), 2200);
}

/* ---------- stage (3D pouch) ---------- */
const stage = $('#stage'), glCanvas = $('#gl'), nowName = $('#nowName');
const switches = $$('.fs');
let pouch = null, stageOn = true, glFailed = false;
function onSwap(i) {
  const f = FLAVOURS[i];
  stage.style.setProperty('--flav', f.color);
  nowName.textContent = f.name;
  switches.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.setAttribute('aria-pressed', String(k === i)); });
}
switches.forEach((b) => b.addEventListener('click', () => {
  const i = +b.dataset.f;
  if (pouch) pouch.request(i); else onSwap(i);
}));
new IntersectionObserver((es) => { stageOn = es[0].isIntersecting; }, { rootMargin: '60px' }).observe(stage);

/* ---------- stickers that wobble and can be peeled around ---------- */
function stickers() {
  $$('[data-sticker]').forEach((el, i) => {
    const base = [-12, 9, -5][i] || 0;
    gsap.set(el, { rotation: base });
    const idle = RM ? null : gsap.to(el, { rotation: base + (i % 2 ? -7 : 7), duration: 1.3 + i * 0.35, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    if (HX.embed) return;
    Draggable.create(el, {
      type: 'x,y', bounds: '.hero', inertia: true, zIndexBoost: true,
      onPress() { idle && idle.pause(); gsap.to(el, { scale: 1.08, duration: 0.2 }); },
      onDrag() { gsap.to(el, { rotation: base + gsap.utils.clamp(-25, 25, this.deltaX * 2.4), duration: 0.3, overwrite: 'auto' }); },
      onRelease() { gsap.to(el, { scale: 1, rotation: base, duration: 0.9, ease: 'elastic.out(1.1, 0.35)', onComplete: () => idle && idle.restart() }); },
    });
  });
}

/* ---------- product cards ---------- */
const shots = {};
function cards() {
  $$('.btn--add').forEach((btn) => btn.addEventListener('click', () => {
    const f = FLAVOURS[+btn.dataset.add];
    addToCart(1, `${f.name} added. ${cart + 1} in your cart.`);
    btn.classList.add('is-added'); btn.innerHTML = 'Added <b aria-hidden="true">✓</b>';
    const shot = btn.closest('.card').querySelector('.shot');
    shot.classList.remove('jump'); void shot.offsetWidth; shot.classList.add('jump');
    setTimeout(() => { btn.classList.remove('is-added'); btn.innerHTML = 'Add <b aria-hidden="true">+</b>'; }, 1400);
  }));
  if (HX.embed) {
    let done = 0;
    ScrollTrigger.create({ trigger: '#cards', start: 'top 70%', end: 'bottom 30%', onToggle: (s) => {
      if (!s.isActive || done > 1) return;
      const b = $$('.btn--add')[done === 0 ? 0 : 3]; done++;
      setTimeout(() => { b.classList.add('is-pressed'); setTimeout(() => { b.classList.remove('is-pressed'); b.click(); }, 160); }, 700);
    } });
  }
}

/* ---------- nutrition ---------- */
function nutrition() {
  const tabs = $$('.ntab');
  const body = $('#nBody'), serve = $('#nServe'), ing = $('#nIng'), head = $('#nPackHead');
  const show = (i) => {
    const f = FLAVOURS[i];
    tabs.forEach((t, k) => { t.classList.toggle('is-on', k === i); t.setAttribute('aria-selected', String(k === i)); });
    serve.textContent = `${f.type === 'PROTEIN CHIPS' ? 'Protein chips' : 'Roasted makhana'} · serving: 1 pack (${f.weight} g)`;
    head.textContent = `Per pack (${f.weight} g)`;
    [...body.rows].forEach((tr, r) => { tr.cells[1].textContent = f.n100[r]; tr.cells[2].textContent = f.np[r]; });
    ing.textContent = f.ing;
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => { touched = true; show(i); }));
  let touched = false, k = 0, vis = false;
  show(0);
  if (HX.embed) {
    new IntersectionObserver((es) => { vis = es[0].isIntersecting; }, { threshold: 0.3 }).observe($('#nlabel'));
    setInterval(() => { if (vis && !touched && !HX.paused) show(++k % 4); }, 2600);
  }
  if (!RM) {
    gsap.fromTo('.never__list li', { '--s': 0 }, { '--s': 1, duration: 0.5, stagger: 0.12, ease: 'power2.out', scrollTrigger: { trigger: '.never', start: 'top 80%' } });
    gsap.fromTo('.bar', { '--s': 0 }, { '--s': 1, duration: 1, stagger: 0.15, ease: 'expo.out', scrollTrigger: { trigger: '.vs', start: 'top 85%' } });
  }
}

/* ---------- build a box ---------- */
const box = { n: [1, 0, 0, 1], imgs: [] };
function builder() {
  const picker = $('#picker');
  picker.innerHTML = FLAVOURS.map((f, i) => `
    <div class="prow" style="--c:${f.color}">
      <div class="prow__img"><img src="${box.imgs[i]}" alt="" width="180" height="215"></div>
      <div><h3>${f.name}</h3><p>${f.type === 'PROTEIN CHIPS' ? 'Protein chips' : 'Roasted makhana'} · ${f.protein} g protein</p></div>
      <div class="step" role="group" aria-label="${f.name} quantity">
        <button type="button" data-d="-1" data-i="${i}" aria-label="Remove one ${f.name}">−</button>
        <output id="q${i}" aria-live="polite">0</output>
        <button type="button" data-d="1" data-i="${i}" aria-label="Add one ${f.name}">+</button>
      </div>
    </div>`).join('');
  const slots = $('#slots');
  slots.innerHTML = Array.from({ length: 6 }, () => '<div class="slot">+</div>').join('');
  picker.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-d]'); if (!b) return;
    userBox = true; change(+b.dataset.i, +b.dataset.d);
  });
  $('#boxSurprise').addEventListener('click', () => { userBox = true; surprise(); });
  $('#boxAdd').addEventListener('click', () => {
    if (total() < 6) return;
    addToCart(6, 'Box of 6 added. Delivery is on us.');
    box.n = [0, 0, 0, 0]; render(-1);
  });
  render(-1);
  if (HX.embed) {
    let vis = false;
    new IntersectionObserver((es) => { vis = es[0].isIntersecting; }, { threshold: 0.35 }).observe($('.builder'));
    let hold = 0;
    setInterval(() => {
      if (!vis || userBox || HX.paused) return;
      if (total() < 6) change(Math.floor(Math.random() * 4), 1);
      else if (++hold % 4 === 0) surprise();
    }, 720);
  }
}
let userBox = false;
const total = () => box.n.reduce((a, b) => a + b, 0);
function change(i, d) {
  if (d > 0 && total() >= 6) { toast.textContent = 'Your box is full. Swap one out first.'; toast.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('is-on'), 1800); return; }
  if (d < 0 && box.n[i] === 0) return;
  box.n[i] += d; render(d > 0 ? i : -1);
}
function surprise() {
  box.n = [0, 0, 0, 0];
  for (let k = 0; k < 6; k++) box.n[Math.floor(Math.random() * 4)]++;
  render(-2);
}
function render(added) {
  const t = total();
  FLAVOURS.forEach((f, i) => {
    $('#q' + i).textContent = box.n[i];
    $(`.step button[data-i="${i}"][data-d="-1"]`).disabled = box.n[i] === 0;
    $(`.step button[data-i="${i}"][data-d="1"]`).disabled = t >= 6;
  });
  const order = []; box.n.forEach((c, i) => { for (let k = 0; k < c; k++) order.push(i); });
  const slots = $$('#slots .slot');
  slots.forEach((s, k) => {
    const i = order[k];
    const was = s.dataset.f;
    if (i === undefined) { s.className = 'slot'; s.innerHTML = '+'; s.removeAttribute('data-f'); s.style.removeProperty('--c'); return; }
    s.className = 'slot is-full'; s.style.setProperty('--c', FLAVOURS[i].light);
    if (was !== String(i)) {
      s.innerHTML = `<img src="${box.imgs[i]}" alt="${FLAVOURS[i].name}">`; s.dataset.f = i;
      if ((added === i || added === -2) && !RM) { s.classList.add('drop'); }
    }
  });
  $('#progBar').style.width = (t / 6) * 100 + '%';
  $('#boxCount').textContent = t === 6 ? 'Box full. Nice picks.' : `${t} of 6 picked`;
  const full = t === 6;
  $('#boxWas').textContent = full ? rupee(894) : '';
  $('#boxPrice').textContent = full ? rupee(799) : rupee(t * 149);
  $('#boxSave').textContent = full ? 'You save ₹95' : '';
  const add = $('#boxAdd');
  add.disabled = !full;
  add.textContent = full ? 'Add box to cart' : `Pick ${6 - t} more`;
  $('#crate').setAttribute('aria-label', `Your box: ${t} of 6 packs picked`);
}

/* ---------- reviews wall ---------- */
function reviews() {
  if (!FINE || HX.embed || innerWidth < 760) return;
  $$('[data-drag]').forEach((el) => {
    const r = parseFloat(getComputedStyle(el).rotate) || 0;
    Draggable.create(el, { type: 'x,y', bounds: '#wall', inertia: true, zIndexBoost: true,
      onPress() { el.classList.add('is-drag'); }, onRelease() { el.classList.remove('is-drag'); } });
  });
}

/* ---------- faq: one open at a time ---------- */
$$('#acc details').forEach((d) => d.addEventListener('toggle', () => { if (d.open) $$('#acc details').forEach((o) => { if (o !== d) o.open = false; }); }));

/* ---------- club ---------- */
$('#club').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('#clubEmail').value.trim();
  $('#clubMsg').textContent = /.+@.+\..+/.test(v) ? 'You are in. Your 10% code, CRUNCH10, is on its way to your inbox.' : 'That email looks a bit soggy. Try again?';
});

/* ---------- menu ---------- */
const burger = $('#burger'), menu = $('#menu');
function setMenu(open) {
  menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', String(!open));
  burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
$$('.menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------- reveals ---------- */
function reveals() {
  if (RM) return;
  gsap.from('.hero__copy > *', { y: 36, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'back.out(1.6)', delay: 0.15 });
  gsap.from('.stage__panel', { scale: 0.9, rotation: -2, opacity: 0, duration: 1, ease: 'back.out(1.4)', delay: 0.2 });
  gsap.from('[data-sticker]', { scale: 0, duration: 0.8, stagger: 0.12, ease: 'back.out(2.4)', delay: 0.7 });
  $$('.sec-head').forEach((h) => gsap.from(h.children, { y: 40, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'back.out(1.5)', scrollTrigger: { trigger: h, start: 'top 88%' } }));
  gsap.from('.card', { y: 70, rotation: (i) => (i % 2 ? 3 : -3), opacity: 0, duration: 0.9, stagger: 0.1, ease: 'back.out(1.4)', scrollTrigger: { trigger: '#cards', start: 'top 85%' } });
  gsap.from('.prow', { x: -40, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'back.out(1.5)', scrollTrigger: { trigger: '#picker', start: 'top 85%' } });
  gsap.from('.rv', { scale: 0.7, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'back.out(2)', scrollTrigger: { trigger: '#wall', start: 'top 80%' } });
}

/* ---------- frame loop ---------- */
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (pouch && stageOn) pouch.frame(RM ? 0 : dt);
  for (const b of bands) {
    if (!b.on || RM) continue;
    if (!b.w) b.w = b.t.scrollWidth / 2;
    b.x += b.v * dt; if (b.x <= -b.w) b.x += b.w; if (b.x > 0) b.x -= b.w;
    b.t.style.transform = `translate3d(${b.x.toFixed(1)}px,0,0)`;
  }
  requestAnimationFrame(loop);
}

/* ---------- boot ---------- */
async function boot() {
  try {
    await Promise.race([Promise.all([document.fonts.load('40px "Archivo Black"'), document.fonts.load('700 20px "Space Grotesk"'), document.fonts.load('500 20px "Space Grotesk"')]), new Promise((r) => setTimeout(r, 2500))]);
  } catch (e) {}
  // artwork, drawn in small chunks
  const atlases = [];
  for (let i = 0; i < FLAVOURS.length; i++) { atlases.push(drawAtlas(FLAVOURS[i])); await nextFrame(); }
  $$('canvas.shot').forEach((c) => { const i = +c.dataset.f; drawPackshot(c, FLAVOURS[i], atlases[i]); shots[i] = c; });
  box.imgs = FLAVOURS.map((f, i) => { const c = document.createElement('canvas'); c.width = 180; c.height = 215; drawPackshot(c, f, atlases[i]); return c.toDataURL('image/png'); });
  await nextFrame();
  builder(); cards(); nutrition(); stickers(); reviews(); reveals();

  try {
    const { createPouch } = await import('./pouch.js');
    pouch = createPouch(glCanvas, atlases, { lite: LITE, onSwap });
    onSwap(0);
    addEventListener('resize', () => pouch && pouch.resize());
    new ResizeObserver(() => pouch && pouch.resize()).observe(glCanvas);
    pouch.frame(0);
  } catch (err) {
    glFailed = true;
    // no WebGL: show the flat packshot instead
    const c = document.createElement('canvas'); c.width = 520; c.height = 620; c.className = 'stage__gl';
    c.style.cssText = 'width:62%;height:auto;left:19%;top:12%;inset:auto;filter:drop-shadow(10px 10px 0 #000)';
    drawPackshot(c, FLAVOURS[0], atlases[0]); glCanvas.replaceWith(c);
  }
  requestAnimationFrame((t) => { last = t; requestAnimationFrame(loop); });
  requestAnimationFrame(() => requestAnimationFrame(() => { HX.ready(); ScrollTrigger.refresh(); }));
}
boot();
