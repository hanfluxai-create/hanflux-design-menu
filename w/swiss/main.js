/* Mehra & Rao Advocates: quiet motion on a strict grid */
(function () {
  'use strict';
  var HX = window.HX || { embed: false, tour: false, device: 'desktop', reducedMotion: false, on: function () {}, ready: function () {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  root.classList.add('js');
  var REDUCED = !!HX.reducedMotion;
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, SplitText = window.SplitText;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* smooth scroll */
  var lenis = null;
  if (!HX.embed && !REDUCED && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* menu */
  var menu = $('#menu'), btn = $('#menuBtn');
  function closeMenu() {
    if (!menu.classList.contains('open')) return;
    menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); btn.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  }
  btn.addEventListener('click', function () {
    if (menu.classList.contains('open')) return closeMenu();
    menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); btn.setAttribute('aria-expanded', 'true');
    if (lenis) lenis.stop();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var h = a.getAttribute('href');
      if (h.length < 2) return;
      var el = h === '#top' ? null : $(h);
      e.preventDefault(); closeMenu();
      var y = el ? el.getBoundingClientRect().top + window.scrollY : 0;
      if (lenis) lenis.scrollTo(y, { duration: 1.3 });
      else window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  });

  /* progress hairline + current section in the nav */
  var prog = $('#prog'), navNum = $('#navNum'), navLabel = $('#navLabel');
  var secs = [['#top', '00', 'Index'], ['#practice', '01', 'Practice'], ['#method', '02', 'Method'], ['#partners', '03', 'Partners'], ['#insights', '04', 'Insights'], ['#offices', '05', 'Offices'], ['#consult', '06', 'Consultation']];
  var links = $$('.links a');
  var current = -1;
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4) + ')';
    var y = window.scrollY + window.innerHeight * 0.35, idx = 0;
    for (var i = 0; i < secs.length; i++) { var el = $(secs[i][0]); if (el && el.getBoundingClientRect().top + window.scrollY <= y) idx = i; }
    if (idx !== current) {
      current = idx;
      navNum.textContent = secs[idx][1]; navLabel.textContent = secs[idx][2];
      links.forEach(function (l) { l.classList.toggle('on', l.getAttribute('href') === secs[idx][0]); });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* office hours, in India Standard Time */
  function openStatus() {
    var el = $('#openNow'), dot = $('.live');
    var now = new Date(), ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
    var d = ist.getDay(), m = ist.getHours() * 60 + ist.getMinutes();
    var open = d >= 1 && d <= 5 && m >= 570 && m < 1140;
    if (open) el.textContent = 'Offices open now, until 7:00 PM IST';
    else {
      var next = (d === 5 && m >= 1140) || d === 6 || d === 0 ? 'Monday' : (m < 570 ? 'today' : 'tomorrow');
      el.textContent = 'Offices closed, open ' + next + ' at 9:30 AM IST';
      dot.classList.add('closed');
    }
  }
  openStatus();

  /* counters */
  function count(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var end = parseFloat(el.dataset.count);
    if (REDUCED) { el.textContent = String(end); return; }
    var o = { v: 0 };
    el.textContent = '0';
    gsap.to(o, { v: end, duration: 1.5, ease: 'expo.out', onUpdate: function () { el.textContent = String(Math.round(o.v)); } });
  }

  /* reveals */
  function reveals() {
    gsap.to('.cols-in i', { scaleY: 1, duration: REDUCED ? 0 : 1.5, ease: 'expo.inOut', stagger: { each: 0.045, from: 'start' } });
    $$('[data-split]').forEach(function (el) {
      var lines;
      try { lines = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' }).lines; } catch (e) { lines = [el]; }
      gsap.set(el, { visibility: 'visible' });
      if (REDUCED) return;
      var hero = !!el.closest('#top');
      gsap.from(lines, { yPercent: 105, duration: 1.15, ease: 'expo.out', stagger: 0.1, delay: hero ? 0.25 : 0, scrollTrigger: hero ? null : { trigger: el, start: 'top 90%', once: true } });
    });
    gsap.to($$('#top [data-rise]'), { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: REDUCED ? 0 : 0.6 });
    $$('[data-rise]').forEach(function (el) {
      if (el.closest('#top')) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
    $$('[data-row]').forEach(function (row) {
      gsap.to(row.children, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: row, start: 'top 92%', once: true } });
    });
    ScrollTrigger.batch('.rule-x', {
      start: 'top 94%', once: true,
      onEnter: function (els) { els.forEach(function (e, i) { setTimeout(function () { e.classList.add('in'); }, REDUCED ? 0 : i * 80); }); }
    });
    $$('[data-count]').forEach(function (el) {
      ScrollTrigger.create({ trigger: el, start: 'top 96%', once: true, onEnter: function () { setTimeout(function () { count(el); }, el.closest('#top') ? 700 : 0); } });
    });
  }

  /* consultation form */
  var form = $('#form'), msg = $('.form-msg', form);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = [];
    var name = form.elements.name, email = form.elements.email, text = form.elements.msg, ack = form.elements.ack;
    [name, email, text, ack].forEach(function (f) { f.removeAttribute('aria-invalid'); });
    if (!name.value.trim()) bad.push(name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) bad.push(email);
    if (!text.value.trim()) bad.push(text);
    if (!ack.checked) bad.push(ack);
    if (bad.length) {
      bad.forEach(function (f) { f.setAttribute('aria-invalid', 'true'); });
      msg.className = 'form-msg err';
      msg.textContent = 'Please complete the highlighted fields.';
      bad[0].focus();
      return;
    }
    var office = (form.querySelector('input[name="office"]:checked') || {}).value || 'Bengaluru';
    msg.className = 'form-msg ok';
    msg.textContent = 'Thank you, ' + name.value.trim().split(' ')[0] + '. The ' + (office === 'Either' ? 'Bengaluru' : office) + ' partners’ office will reply within one working day to arrange a conflict check.';
    form.classList.add('sent');
  });

  /* boot */
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 1500); })]).then(function () {
    reveals();
    ScrollTrigger.refresh();
    requestAnimationFrame(function () { HX.ready && HX.ready(); });
  });
  var rz = 0;
  window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { ScrollTrigger.refresh(); }, 200); });
})();
