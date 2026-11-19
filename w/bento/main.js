// Ledgerly · interactions and the living product demo
const HX = window.HX || { embed: false, tour: false, lite: false, device: 'desktop', reducedMotion: false, paused: false, ready() {}, on() {} };
const { gsap, ScrollTrigger, SplitText, TextPlugin } = window;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const isPhone = () => innerWidth < 760;
const finePointer = matchMedia('(pointer:fine)').matches && !HX.embed;
const reduce = !!HX.reducedMotion;
const usd = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MOL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin);
gsap.config({ nullTargetWarn: false });
gsap.ticker.lagSmoothing(0);

/* ---------- smooth scroll, anchors ---------- */
let lenis = null;
if (!HX.embed && !reduce && window.Lenis && finePointer) {
  lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
}
function goTo(el) {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.3 });
  else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: reduce ? 'auto' : 'smooth' });
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); if (id.length < 2) return;
  const el = $(id); if (!el) return;
  e.preventDefault(); closeMenu(); goTo(el);
}));

/* ---------- nav ---------- */
const nav = $('.nav'), menuBtn = $('.nav__menu'), menu = $('#menu'), root = document.documentElement;
function openMenu() { root.classList.add('menu-open'); menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.setAttribute('aria-label', 'Close menu'); menu.setAttribute('aria-hidden', 'false'); lenis && lenis.stop(); }
function closeMenu() { if (!root.classList.contains('menu-open')) return; root.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); menu.setAttribute('aria-hidden', 'true'); lenis && lenis.start(); }
menuBtn.addEventListener('click', () => (root.classList.contains('menu-open') ? closeMenu() : openMenu()));
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 12);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* ---------- dates in the demo ---------- */
const today = new Date();
const due = new Date(today); due.setDate(today.getDate() + 14);
const fmt = (d) => `${MO[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
$('[data-issued]').textContent = fmt(today);
$('[data-due]').textContent = fmt(due);
$('[data-stamp-date]').textContent = `${MO[today.getMonth()].toUpperCase()} ${today.getDate()} · CARD`;
$('[data-month]').textContent = MOL[today.getMonth()];

/* ---------- hero intro ---------- */
$$('.display .hl').forEach((hl) => { const m = document.createElement('span'); m.className = 'lm'; hl.replaceWith(m); m.appendChild(hl); });
function intro() {
  const copy = $$('.hero__copy > *');
  gsap.set('.hero h1', { opacity: 1 });
  if (reduce) { gsap.set([copy, '.demo'], { opacity: 1 }); return; }
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.fromTo('.display .hl', { yPercent: 112 }, { yPercent: 0, duration: 1.3, stagger: 0.08 }, 0.05)
    .fromTo(copy.filter((el) => el.tagName !== 'H1'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.07 }, 0.15)
    .fromTo('.demo', { opacity: 0, y: 46 }, { opacity: 1, y: 0, duration: 1.5 }, 0.2);
}
intro();

/* ---------- 3D tilt: pointer, scroll flatten, ambient sway ---------- */
const tilt = $('.demo__tilt');
const T = { px: 0, py: 0, sx: 0, sy: 0, p: 0 };
if (finePointer && !reduce) addEventListener('pointermove', (e) => { T.px = e.clientX / innerWidth * 2 - 1; T.py = e.clientY / innerHeight * 2 - 1; }, { passive: true });
ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onUpdate: (s) => { T.p = s.progress; } });
gsap.ticker.add((time) => {
  if (reduce) return;
  T.sx += (T.px - T.sx) * 0.06; T.sy += (T.py - T.sy) * 0.06;
  const phone = isPhone(), k = 1 - Math.min(T.p * 1.6, 1);
  const sway = finePointer ? 0 : 1;
  const rx = (phone ? 9 : 7) * k - T.sy * 3 + Math.cos(time * 0.45) * 1.1 * sway;
  const ry = (phone ? 0 : -13) * k + T.sx * 5 + Math.sin(time * 0.38) * (phone ? 1.2 : 2.2) * sway;
  const rz = (phone ? 0 : 1.5) * k;
  tilt.style.transform = `rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) translateY(${(-T.p * 40).toFixed(1)}px)`;
});

/* ---------- the living product demo ---------- */
const demo = (function () {
  const app = $('.app'), sendBtn = $('[data-send]'), sendLabel = $('[data-send-label]'), status = $('.doc .status');
  const lines = $$('[data-line]'), addBtn = $('[data-add]'), stamp = $('[data-stamp]');
  const subEl = $('[data-sub]'), taxEl = $('[data-tax]'), totEl = $('[data-total]');
  const toasts = { sent: $('[data-toast="sent"]'), open: $('[data-toast="open"]'), paid: $('[data-toast="paid"]') };
  const cursor = $('[data-cursor]'), ring = $('.cursor__ring');
  const bal = $('[data-bal]'), balUp = $('[data-bal-up]'), cash = $('[data-cash]');
  const cLine = $('.cash__line'), cArea = $('.cash__area'), cDot = $('.cash__dot');
  const remind = $$('.remind li');
  const ITEMS = [
    { d: 'Brand identity system', q: '1', r: 4800, n: 1 },
    { d: 'Packaging design, 3 SKUs', q: '3', r: 950, n: 3 },
    { d: 'Launch campaign assets', q: '12 h', r: 110, n: 12 }
  ];
  const TAX = 0.08;
  const money = { sub: 8970, bal: 48920.4, cash: 31240 };
  const pts = [[0, 52], [22, 48], [44, 50], [66, 40], [88, 43], [110, 34], [132, 36], [154, 27], [176, 30], [198, 22], [220, 22]];
  const chart = { k: 0 };
  function drawChart() {
    const p = pts.map(([x, y], i) => [x, i >= 9 ? y - chart.k * (i === 10 ? 16 : 7) : y]);
    const d = 'M' + p.map(([x, y]) => `${x} ${y.toFixed(1)}`).join(' L');
    cLine.setAttribute('d', d); cArea.setAttribute('d', d + ' L220 64 L0 64Z');
    cDot.setAttribute('cy', p[10][1].toFixed(1));
  }
  function paintTotals(sub) {
    subEl.textContent = usd(sub); taxEl.textContent = usd(sub * TAX); totEl.textContent = usd(sub * (1 + TAX));
  }
  function setStatus(s, label) { status.dataset.status = s; status.textContent = label; }
  function local(el) {
    let x = el.offsetWidth / 2, y = el.offsetHeight / 2, n = el;
    while (n && n !== tilt) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x, y };
  }
  function resetAll() {
    setStatus('draft', 'Draft');
    sendBtn.classList.remove('is-done'); sendLabel.textContent = 'Send invoice';
    Object.values(toasts).forEach((t) => gsap.set(t, { opacity: 0, y: 10, scale: 0.97 }));
    gsap.set(stamp, { xPercent: -50, yPercent: -50, rotate: -13, opacity: 0, scale: 1 });
    lines.forEach((l, i) => { gsap.set(l, { height: 'auto', opacity: 1 }); l.querySelector('.l-desc').textContent = ITEMS[i].d; });
    paintTotals(8970);
    money.bal = 48920.4; bal.textContent = usd(money.bal); balUp.classList.remove('show');
    money.cash = 31240; cash.textContent = usd(money.cash); chart.k = 0; drawChart();
    remind.forEach((r, i) => r.classList.toggle('done', i === 0));
  }
  let tl = null;
  function build() {
    if (tl) tl.kill();
    resetAll();
    const phone = isPhone();
    const W = app.offsetWidth, H = app.offsetHeight;
    const rest = { x: W * (phone ? 0.8 : 0.86), y: H * (phone ? 0.84 : 0.9) };
    gsap.set(cursor, { x: rest.x - 6, y: rest.y - 4, z: 200, opacity: 1 });
    const to = (el, dx = 0, dy = 0) => { const p = local(el); return { x: p.x - 6 + dx, y: p.y - 4 + dy }; };
    const click = (t, el, at) => {
      t.call(() => { cursor.classList.add('is-press'); el && el.classList.add('is-press'); }, null, at)
        .fromTo(ring, { scale: 0.4, opacity: 0.9 }, { scale: 1.5, opacity: 0, duration: 0.55, ease: 'power2.out' }, at)
        .call(() => { cursor.classList.remove('is-press'); el && el.classList.remove('is-press'); }, null, at + 0.16);
    };
    const toast = (t, el, at) => t.to(el, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, at);
    const tick = (t, obj, key, val, el, at, dur = 1.1) => t.to(obj, { [key]: val, duration: dur, ease: 'power2.out', onUpdate: () => { el.textContent = usd(obj[key]); } }, at);
    tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' }, onComplete: () => { const t = build(); if (demoOn) t.play(); } });
    // A. send the composed invoice
    tl.to(cursor, { ...to(sendBtn, 6, 4), duration: 0.95 }, 0.1);
    click(tl, sendBtn, 1.08);
    tl.call(() => { sendLabel.textContent = 'Sending'; }, null, 1.15)
      .call(() => { sendBtn.classList.add('is-done'); sendLabel.textContent = 'Sent'; setStatus('sent', 'Sent'); }, null, 1.55);
    toast(tl, toasts.sent, 1.6);
    tl.to(cursor, { ...(phone ? { x: W * 0.62, y: H * 0.66 } : to($('.fl--remind .toggle'), 2, 2)), duration: 1.0 }, 2.0);
    tl.call(() => { setStatus('viewed', 'Viewed'); remind[1].classList.add('done'); }, null, 2.55);
    toast(tl, toasts.open, 2.55);
    tl.call(() => { setStatus('paid', 'Paid'); balUp.classList.add('show'); }, null, 3.55);
    toast(tl, toasts.paid, 3.55);
    tl.fromTo(stamp, { opacity: 0, scale: 2.3, rotate: -26 }, { opacity: 1, scale: 1, rotate: -13, duration: 0.32, ease: 'power4.in' }, 3.6)
      .fromTo(app, { scale: 1 }, { scale: 0.992, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 3.92);
    tick(tl, money, 'bal', 48920.4 + 9687.6, bal, 3.7, 1.3);
    tick(tl, money, 'cash', 31240 + 9687.6, cash, 3.75, 1.3);
    tl.to(chart, { k: 1, duration: 1.2, ease: 'power2.out', onUpdate: drawChart }, 3.75);
    tl.to(cursor, { x: rest.x - 6, y: rest.y - 4, duration: 1.1 }, 4.4);
    // B. reset and compose a fresh invoice
    const B = 7.6;
    tl.to(Object.values(toasts), { opacity: 0, y: -8, duration: 0.45, stagger: 0.06, ease: 'power2.in' }, B)
      .to(stamp, { opacity: 0, scale: 0.9, duration: 0.4, ease: 'power2.in' }, B)
      .call(() => { setStatus('draft', 'Draft'); sendBtn.classList.remove('is-done'); sendLabel.textContent = 'Send invoice'; balUp.classList.remove('show'); remind[1].classList.remove('done'); }, null, B + 0.35)
      .to(lines, { height: 0, opacity: 0, duration: 0.45, stagger: 0.06, ease: 'power2.in' }, B + 0.1)
      .to({ v: 8970 }, { v: 0, duration: 0.6, ease: 'power2.in', onUpdate() { paintTotals(this.targets()[0].v); } }, B + 0.15)
      .set(money, { bal: 48920.4, cash: 31240 }, B + 0.6)
      .call(() => { bal.textContent = usd(48920.4); cash.textContent = usd(31240); chart.k = 0; drawChart(); }, null, B + 0.6);
    let at = B + 0.8, sub = 0;
    ITEMS.forEach((it, i) => {
      const l = lines[i], desc = l.querySelector('.l-desc');
      tl.to(cursor, { ...to(addBtn, -10, 2), duration: 0.6 }, at);
      click(tl, addBtn, at + 0.62);
      tl.call(() => { desc.textContent = ''; }, null, at + 0.6)
        .to(l, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power3.out' }, at + 0.68)
        .to(desc, { text: { value: it.d }, duration: 0.55, ease: 'none' }, at + 0.78);
      const from = sub; sub += it.r * it.n;
      tl.to({ v: from }, { v: sub, duration: 0.55, ease: 'power2.out', onUpdate() { paintTotals(this.targets()[0].v); } }, at + 1.0);
      at += 1.35;
    });
    tl.to(cursor, { x: rest.x - 6, y: rest.y - 4, duration: 0.8 }, at + 0.1);
    tl.set({}, {}, at + 1.0);
    return tl;
  }
  return { build, get tl() { return tl; } };
})();

let demoOn = false;
function startDemo() {
  if (reduce) { gsap.set('[data-cursor]', { opacity: 0 }); return; }
  const t = demo.build();
  t.seek(0.2);
  if (demoOn) t.play();
}
ScrollTrigger.create({ trigger: '.demo', start: 'top bottom', end: 'bottom top', onToggle: (s) => { demoOn = s.isActive; const t = demo.tl; if (!t) return; s.isActive ? t.play() : t.pause(); } });
let rsz = 0, lastW = innerWidth;
addEventListener('resize', () => { if (Math.abs(innerWidth - lastW) < 40) return; lastW = innerWidth; clearTimeout(rsz); rsz = setTimeout(startDemo, 220); });

/* ---------- bento micro-animations ---------- */
function bento() {
  const loops = [];
  const mk = (fn) => { const t = gsap.timeline({ repeat: -1, paused: true }); fn(t); loops.push(t); return t; };
  // recurring: a playhead sends and settles each month
  const months = $$('.mo'), head = $('.recur__head');
  const setMonth = (m, s) => { m.classList.toggle('is-sent', s === 'sent'); m.classList.toggle('is-paid', s === 'paid'); m.querySelector('.mo__chip').textContent = s === 'paid' ? 'Paid' : s === 'sent' ? 'Sent' : 'Scheduled'; };
  months.forEach((m, i) => setMonth(m, i < 4 ? 'paid' : i === 4 ? 'sent' : 'sched'));
  mk((t) => {
    t.call(() => months.forEach((m) => { setMonth(m, 'sched'); m.classList.remove('is-now'); }), null, 0);
    months.forEach((m, i) => {
      const at = 0.3 + i * 0.9;
      t.to(head, { x: () => m.offsetLeft + m.offsetWidth / 2, duration: 0.6, ease: 'power2.inOut' }, at)
        .call(() => { months.forEach((x) => x.classList.toggle('is-now', x === m)); setMonth(m, 'sent'); }, null, at + 0.55)
        .call(() => setMonth(m, 'paid'), null, at + 1.3);
    });
    t.call(() => months.forEach((x) => x.classList.remove('is-now')), null, 6.2).set({}, {}, 7.2);
  });
  // payment links: copy, choose a method, pay
  const copy = $('[data-copy]'), copyTxt = copy.querySelector('em'), tabs = $$('.plink__tabs i'), pay = $('[data-pay]'), payTxt = pay.querySelector('span');
  mk((t) => {
    t.call(() => { copy.classList.add('is-ok'); copyTxt.textContent = 'Copied'; }, null, 0.4)
      .call(() => { copy.classList.remove('is-ok'); copyTxt.textContent = 'Copy'; }, null, 2.0);
    [1, 2, 0].forEach((k, i) => t.call(() => tabs.forEach((x, j) => x.classList.toggle('on', j === k)), null, 0.9 + i * 0.5));
    t.call(() => { pay.classList.add('is-paying'); payTxt.textContent = 'Processing'; }, null, 2.6)
      .call(() => { pay.classList.remove('is-paying'); pay.classList.add('is-paid'); payTxt.textContent = 'Paid $2,400.00'; }, null, 3.8)
      .call(() => { pay.classList.remove('is-paid'); payTxt.textContent = 'Pay $2,400.00'; }, null, 6.0).set({}, {}, 6.4);
  });
  // multi-currency: rows light up and convert, the live rate ticks
  const rows = $$('.fx li'), rate = $('[data-rate]'), spark = $('.fx__spark');
  mk((t) => {
    rows.forEach((r, i) => {
      const to = r.querySelector('.fx__to'), end = parseFloat(to.textContent.replace(/[^0-9.]/g, ''));
      t.call(() => rows.forEach((x) => x.classList.toggle('on', x === r)), null, i * 1.05)
        .fromTo({ v: end * 0.6 }, { v: end * 0.6 }, { v: end, duration: 0.7, ease: 'power3.out', onUpdate() { to.textContent = usd(this.targets()[0].v); } }, i * 1.05);
    });
    [1.0879, 1.0891, 1.0886, 1.0897, 1.0884].forEach((v, i) => t.call(() => {
      rate.textContent = `1 EUR = ${v.toFixed(4)} USD`;
      let d = 'M0 20'; for (let x = 12; x <= 120; x += 12) d += ` L${x} ${(6 + Math.abs(Math.sin(x * 0.07 + i * 1.3)) * 14).toFixed(1)}`;
      spark.setAttribute('d', d);
    }, null, i * 1.26));
    t.set({}, {}, rows.length * 1.05 + 0.4);
  });
  // tax reports: bars rise, Q4 breathes
  const bars = $$('.bar i'), donut = $$('.donut circle:not(:first-child)');
  gsap.set(bars, { '--g': 0 });
  ScrollTrigger.create({ trigger: '.t-tax', start: 'top 85%', once: true, onEnter: () => {
    gsap.to(bars, { '--g': 1, duration: 1.1, ease: 'expo.out', stagger: 0.1 });
    donut.forEach((c, i) => { const da = c.getAttribute('stroke-dasharray'); gsap.fromTo(c, { attr: { 'stroke-dasharray': '0 100' } }, { attr: { 'stroke-dasharray': da }, duration: 1.2, delay: 0.3 + i * 0.15, ease: 'power3.out' }); });
  } });
  mk((t) => { t.to(bars[3], { '--g': 1.06, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 1).set({}, {}, 3.4); });
  // expense capture: scan beam, then fields fill in
  const beam = $('.receipt__beam'), fields = $$('.fields li');
  mk((t) => {
    t.call(() => fields.forEach((f) => f.classList.remove('on')), null, 0)
      .fromTo(beam, { y: -40 }, { y: () => $('.receipt').offsetHeight + 4, duration: 1.5, ease: 'power1.inOut' }, 0.2);
    fields.forEach((f, i) => t.call(() => f.classList.add('on'), null, 0.8 + i * 0.32));
    t.set({}, {}, 4.6);
  });
  // client portal: a short exchange, then the open invoice gets paid
  const msgs = $$('.msg'), pst = $('[data-portal-status]');
  mk((t) => {
    t.call(() => { msgs.forEach((m) => m.classList.remove('on')); pst.className = 'pst pst--due'; pst.textContent = 'Due in 5 days'; }, null, 0);
    msgs.forEach((m, i) => t.call(() => m.classList.add('on'), null, 0.5 + i * 1.0));
    t.call(() => { pst.className = 'pst pst--paid'; pst.textContent = 'Paid'; }, null, 3.4).set({}, {}, 6.2);
  });
  if (reduce) {
    months.forEach((m, i) => setMonth(m, i < 4 ? 'paid' : i === 4 ? 'sent' : 'sched'));
    fields.forEach((f) => f.classList.add('on')); msgs.forEach((m) => m.classList.add('on'));
    gsap.set(bars, { '--g': 1 });
    return;
  }
  ScrollTrigger.create({ trigger: '.bento', start: 'top 85%', end: 'bottom top', onToggle: (s) => loops.forEach((t) => (s.isActive ? t.play() : t.pause())) });
}

/* ---------- workflow strip ---------- */
function flow() {
  const rail = $('.flow__rail'), steps = $$('.fstep');
  const paint = (p) => { rail.style.setProperty('--p', p.toFixed(3)); steps.forEach((s, i) => s.classList.toggle('on', p >= i / (steps.length - 1) - 0.02)); };
  paint(0);
  ScrollTrigger.create({ trigger: '.flow__track', start: 'top 78%', end: 'bottom 55%', scrub: 0.4, onUpdate: (s) => paint(s.progress) });
}

/* ---------- pricing toggle ---------- */
function pricing() {
  const btns = $$('.billing button'), pill = $('.billing__pill'), prices = $$('[data-price]');
  const place = (b) => { pill.style.width = b.offsetWidth + 'px'; pill.style.transform = `translateX(${b.offsetLeft - 4}px)`; };
  function set(b, anim) {
    btns.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    place(b);
    const yearly = b.dataset.bill === 'y';
    prices.forEach((p) => {
      const v = +p.dataset[yearly ? 'y' : 'm'], o = { v: parseFloat(p.textContent.replace('$', '')) || v };
      gsap.to(o, { v, duration: anim ? 0.5 : 0, ease: 'power2.out', onUpdate: () => { p.textContent = '$' + Math.round(o.v); } });
      const per = p.parentElement.querySelector('[data-per]');
      per.textContent = yearly ? `per month, billed $${v * 12} yearly` : 'per month';
    });
  }
  btns.forEach((b) => b.addEventListener('click', () => set(b, true)));
  set(btns[0], false);
  addEventListener('resize', () => place(btns.find((b) => b.getAttribute('aria-checked') === 'true')));
  if (HX.embed && !reduce) ScrollTrigger.create({ trigger: '.plans', start: 'top 70%', once: true, onEnter: () => { setTimeout(() => set(btns[1], true), 900); setTimeout(() => set(btns[0], true), 3600); } });
}

/* ---------- FAQ ---------- */
function faq() {
  const items = $$('.acc__item');
  items.forEach((d) => {
    const s = $('summary', d), body = $('.acc__body', d);
    s.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) { gsap.to(body, { height: 0, duration: 0.4, ease: 'power3.inOut', onComplete: () => { d.open = false; body.style.height = ''; ScrollTrigger.refresh(); } }); return; }
      items.forEach((o) => { if (o !== d && o.open) { const b = $('.acc__body', o); gsap.to(b, { height: 0, duration: 0.35, ease: 'power3.inOut', onComplete: () => { o.open = false; b.style.height = ''; } }); } });
      d.open = true;
      gsap.fromTo(body, { height: 0 }, { height: body.scrollHeight, duration: 0.5, ease: 'power3.out', onComplete: () => { body.style.height = ''; ScrollTrigger.refresh(); } });
    });
  });
}

/* ---------- forms (never submit) ---------- */
const okEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
$('.cta__form').addEventListener('submit', (e) => {
  e.preventDefault();
  const inp = e.target.elements.email, msg = $('[data-cta-msg]');
  if (!okEmail(inp.value)) { msg.textContent = 'Add a work email so we can set up your workspace.'; msg.classList.remove('is-ok'); inp.focus(); return; }
  msg.textContent = `You are in. A setup link is on its way to ${inp.value.trim()}.`; msg.classList.add('is-ok');
  inp.value = '';
});
$('.news').addEventListener('submit', (e) => {
  e.preventDefault();
  const inp = e.target.elements.email, msg = $('.news__msg');
  if (!okEmail(inp.value)) { msg.style.color = 'var(--rose)'; msg.textContent = 'That email does not look right yet.'; return; }
  msg.style.color = ''; msg.textContent = 'Subscribed. The next letter lands on the 1st.'; inp.value = '';
});

/* ---------- reveals and counters ---------- */
function reveals() {
  $$('[data-split]').forEach((el) => SplitText.create(el, {
    type: 'lines', mask: 'lines', autoSplit: true,
    onSplit: (self) => gsap.from(self.lines, { yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
  }));
  const items = $$('[data-reveal]');
  gsap.set(items, { opacity: 0, y: 30 });
  ScrollTrigger.batch(items, { start: 'top 92%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.07, overwrite: true, clearProps: 'transform' }) });
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), pre = el.dataset.pre || '', suf = el.dataset.suf || '', o = { v: 0 };
    const out = () => { el.textContent = pre + (dec ? o.v.toFixed(dec) : Math.round(o.v).toLocaleString('en-US')) + suf; };
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: out }) });
  });
}

/* ---------- magnetic CTAs (desktop pointer only) ---------- */
if (finePointer && !reduce) $$('.magnetic').forEach((el) => {
  const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' }), yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
  el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.2); yTo((e.clientY - r.top - r.height / 2) * 0.3); });
  el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
});

/* ---------- boot ---------- */
faq(); pricing(); flow(); bento();
const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1800))]).then(() => {
  reveals();
  startDemo();
  ScrollTrigger.refresh();
  requestAnimationFrame(() => requestAnimationFrame(() => HX.ready()));
});
addEventListener('load', () => ScrollTrigger.refresh());
