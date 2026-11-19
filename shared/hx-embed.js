/*!
 * Hanflux Design Menu: embed and tour runtime for live website demos.
 * Load this as the FIRST script in <head> (classic script, not a module):
 *   <script src="/shared/hx-embed.js"></script>
 *
 * URL params (all optional):
 *   embed=1   page is inside a menu frame (hides scrollbars, pauses on request)
 *   tour=1    auto-scroll through the page, loop forever
 *   dpr=0.7   caps window.devicePixelRatio (so WebGL renders fewer pixels in small frames)
 *   lite=1    phone or low-power frame: demos should lower particle counts etc.
 *   v=d|m     which frame this is (desktop or phone)
 *
 * Exposes window.HX = { embed, tour, lite, device, dpr, paused, on(evt, fn), ready() }.
 * Demos may call HX.ready() when their first frame is drawn (otherwise load is used).
 * Optional markup hints: data-tour="2400" on an element makes it a tour stop
 * with that dwell time in ms; data-tour-skip on a section removes it.
 */
(function () {
  'use strict';
  var w = window, d = document;
  var q = new URLSearchParams(location.search);
  var embed = q.get('embed') === '1' || (w.self !== w.top && q.get('embed') !== '0');
  var tour = q.get('tour') === '1';
  var lite = q.get('lite') === '1';
  var device = q.get('v') === 'm' ? 'mobile' : (q.get('v') === 'd' ? 'desktop' : (w.innerWidth < 760 ? 'mobile' : 'desktop'));
  var dprCap = parseFloat(q.get('dpr'));
  var listeners = {};
  var HX = w.HX = {
    embed: embed, tour: tour, lite: lite, device: device,
    reducedMotion: !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches) && !embed,
    dpr: w.devicePixelRatio || 1,
    paused: false,
    on: function (evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); },
    emit: function (evt, data) { (listeners[evt] || []).forEach(function (fn) { try { fn(data); } catch (e) {} }); },
    ready: function () { markReady(); }
  };

  // 1. Cap device pixel ratio before any renderer reads it.
  if (dprCap > 0 && dprCap < (w.devicePixelRatio || 1)) {
    try { Object.defineProperty(w, 'devicePixelRatio', { get: function () { return dprCap; }, configurable: true }); } catch (e) {}
    HX.dpr = dprCap;
  }

  // 2. Embed styling: no scrollbars, no custom cursors leaking, no text selection.
  if (embed) {
    var st = d.createElement('style');
    st.textContent = 'html{scrollbar-width:none;-ms-overflow-style:none}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none;width:0;height:0}' +
      'html,body{-webkit-user-select:none;user-select:none;overscroll-behavior:none}.hx-hide-in-embed{display:none!important}';
    (d.head || d.documentElement).appendChild(st);
    d.documentElement.classList.add('hx-embed', 'hx-' + device);
    if (lite) d.documentElement.classList.add('hx-lite');
  }

  // 3. Pausable animation frames: while paused, callbacks wait instead of running.
  var nativeRAF = w.requestAnimationFrame.bind(w);
  var nativeCAF = w.cancelAnimationFrame.bind(w);
  var held = [], heldId = 1e9, heldMap = {};
  w.requestAnimationFrame = function (cb) {
    if (!HX.paused) return nativeRAF(cb);
    var id = ++heldId; heldMap[id] = cb; held.push(id); return id;
  };
  w.cancelAnimationFrame = function (id) {
    if (heldMap[id]) { delete heldMap[id]; return; }
    nativeCAF(id);
  };
  var videosWerePlaying = [];
  function pause() {
    if (HX.paused) return;
    HX.paused = true;
    videosWerePlaying = [].slice.call(d.querySelectorAll('video')).filter(function (v) { return !v.paused; });
    videosWerePlaying.forEach(function (v) { try { v.pause(); } catch (e) {} });
    HX.emit('pause');
  }
  function play() {
    if (!HX.paused) return;
    HX.paused = false;
    var ids = held; held = [];
    ids.forEach(function (id) { var cb = heldMap[id]; delete heldMap[id]; if (cb) nativeRAF(cb); });
    videosWerePlaying.forEach(function (v) { try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} });
    videosWerePlaying = [];
    HX.emit('play');
    if (tourOn) kick();
  }
  HX.pause = pause; HX.play = play;

  // 4. Messages from the menu frame.
  function post(msg) { if (w.parent && w.parent !== w) { try { w.parent.postMessage(msg, location.origin); } catch (e) {} } }
  w.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || typeof e.data !== 'object' || !e.data.hx) return;
    var m = e.data;
    if (m.hx === 'pause') pause();
    else if (m.hx === 'play') play();
    else if (m.hx === 'tour') { setTour(!!m.on); }
    else if (m.hx === 'restart') { restartTour(); }
  });

  // 5. Ready signal (first frame drawn, or load + a short settle).
  var isReady = false;
  function markReady() {
    if (isReady) return; isReady = true;
    d.documentElement.classList.add('hx-ready');
    post({ hx: 'ready', h: d.documentElement.scrollHeight });
    HX.emit('ready');
    if (tourOn) setTimeout(startTour, 900);
  }
  w.addEventListener('load', function () {
    var fontsReady = d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve();
    fontsReady.then(function () { setTimeout(markReady, 1200); });
  });
  setTimeout(markReady, 6500); // never wait forever

  // 6. The tour: glide section to section, dwell, loop.
  var tourOn = tour;
  var stops = [], stopIdx = 0, leg = null, dwellUntil = 0, interactUntil = 0, running = false;
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function maxScroll() { return Math.max(0, d.documentElement.scrollHeight - w.innerHeight); }
  function curY() { return w.scrollY || d.documentElement.scrollTop || 0; }
  function scrollToY(y) {
    var L = w.__lenis || w.lenis;
    if (L && typeof L.scrollTo === 'function') { try { L.scrollTo(y, { immediate: true, force: true }); return; } catch (e) {} }
    w.scrollTo(0, y);
  }
  function collectStops() {
    var vh = w.innerHeight, max = maxScroll();
    var els = [].slice.call(d.querySelectorAll('[data-tour]'));
    var explicit = els.length > 0;
    if (!explicit) {
      els = [].slice.call(d.querySelectorAll('header, section, footer, [data-section]')).filter(function (el) {
        if (el.hasAttribute('data-tour-skip')) return false;
        var p = el.parentElement;
        while (p && p !== d.body) { if (/^(SECTION|HEADER|FOOTER)$/.test(p.tagName) || p.hasAttribute('data-section')) return false; p = p.parentElement; }
        var r = el.getBoundingClientRect();
        return r.height > 40 && getComputedStyle(el).display !== 'none';
      });
    }
    var list = [{ y: 0, dwell: 2600 }];
    els.forEach(function (el) {
      var y = Math.round(el.getBoundingClientRect().top + curY());
      var off = parseFloat(el.getAttribute('data-tour-offset') || '0') * vh;
      y = Math.min(max, Math.max(0, y + off));
      var dw = parseFloat(el.getAttribute('data-tour')) || 1700;
      list.push({ y: y, dwell: dw });
    });
    list.push({ y: max, dwell: 2200 });
    list.sort(function (a, b) { return a.y - b.y; });
    var out = [];
    list.forEach(function (s) {
      var last = out[out.length - 1];
      if (last && s.y - last.y < vh * 0.42) { last.dwell = Math.max(last.dwell, s.dwell); return; }
      out.push(s);
    });
    if (out.length && out[out.length - 1].y < max - 4) out.push({ y: max, dwell: 2200 });
    return out;
  }
  function speed() { return w.innerHeight * (device === 'mobile' ? 0.62 : 0.72); } // px per second
  function nextLeg(now) {
    if (stopIdx >= stops.length - 1) {
      // back to the top, quickly, then start again
      leg = { from: curY(), to: 0, t0: now, dur: 1700, back: true };
      return;
    }
    var from = curY(), to = stops[stopIdx + 1].y;
    var dist = Math.abs(to - from);
    leg = { from: from, to: to, t0: now, dur: Math.max(950, Math.min(9000, dist / speed() * 1000)) };
  }
  function tick(now) {
    if (!tourOn) { running = false; return; }
    if (HX.paused) { running = false; return; }
    if (now < interactUntil) { requestAnimationFrame(tick); return; }
    if (!leg) {
      if (now < dwellUntil) { requestAnimationFrame(tick); return; }
      nextLeg(now);
    }
    var t = Math.min(1, (now - leg.t0) / leg.dur);
    var y = leg.from + (leg.to - leg.from) * easeInOut(t);
    scrollToY(y);
    var max = maxScroll();
    post({ hx: 'progress', p: max > 0 ? y / max : 0 });
    if (t >= 1) {
      if (leg.back) { stops = collectStops(); stopIdx = 0; dwellUntil = now + (stops[0] ? stops[0].dwell : 2400); }
      else { stopIdx++; dwellUntil = now + (stops[stopIdx] ? stops[stopIdx].dwell : 1600); }
      leg = null;
    }
    requestAnimationFrame(tick);
  }
  function kick() { if (!running && tourOn && isReady) { running = true; requestAnimationFrame(tick); } }
  function startTour() {
    stops = collectStops();
    var y = curY();
    stopIdx = 0;
    for (var i = 0; i < stops.length; i++) { if (stops[i].y <= y + 2) stopIdx = i; }
    dwellUntil = performance.now() + (stopIdx === 0 ? stops[0].dwell : 600);
    leg = null;
    kick();
  }
  function restartTour() { scrollToY(0); leg = null; stopIdx = 0; dwellUntil = performance.now() + 1800; stops = collectStops(); kick(); }
  function setTour(on) { tourOn = on; if (on) startTour(); }
  HX.setTour = setTour; HX.restartTour = restartTour;
  w.addEventListener('resize', function () { if (tourOn) { stops = collectStops(); } });

  // A visitor scrolling or touching a live frame takes over for a few seconds.
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(function (ev) {
    w.addEventListener(ev, function () {
      if (!tourOn) return;
      interactUntil = performance.now() + 7000; leg = null;
      post({ hx: 'interact' });
      setTimeout(function () { if (tourOn && performance.now() >= interactUntil) startTour(); }, 7100);
    }, { passive: true });
  });

  // 7. Opened full screen from the menu: a small way back, plus "choose this design".
  if (!embed && q.get('from') === 'menu') {
    w.addEventListener('DOMContentLoaded', function () {
      var slug = (location.pathname.match(/\/w\/([^/]+)/) || [])[1] || '';
      var bar = d.createElement('div');
      bar.setAttribute('data-hx-chip', '');
      bar.innerHTML = '<a href="/websites/' + slug + '/" aria-label="Back to the Hanflux design menu">&#8592; Design menu</a>' +
        '<a class="hx-go" href="/websites/' + slug + '/#request">Choose this design</a>';
      var css = d.createElement('style');
      css.textContent = '[data-hx-chip]{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483646;display:flex;gap:6px;padding:6px;border-radius:999px;' +
        'background:rgba(8,10,16,.72);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4);border:1px solid rgba(255,255,255,.14);' +
        'box-shadow:0 10px 40px rgba(0,0,0,.35);font:500 13px/1 system-ui,-apple-system,Segoe UI,sans-serif;letter-spacing:.01em}' +
        '[data-hx-chip] a{color:#eef0f6;text-decoration:none;padding:10px 14px;border-radius:999px;white-space:nowrap}' +
        '[data-hx-chip] a:hover{background:rgba(255,255,255,.08)}[data-hx-chip] .hx-go{background:#27f2c0;color:#05060a;font-weight:600}[data-hx-chip] .hx-go:hover{background:#5ff7d2}';
      d.head.appendChild(css); d.body.appendChild(bar);
    });
  }
})();
