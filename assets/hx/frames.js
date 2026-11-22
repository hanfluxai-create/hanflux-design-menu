/* Hanflux Design Menu · device frames.
   A desktop browser frame and a phone frame for a website design. The frames arrive in the page with
   still posters (the build renders them). This script brings them to life:
   - live: the real site runs inside each frame as a scaled iframe with its auto-tour (laptops and
     desktops, and the big preview on a design page);
   - reel: phones never run live sites inside a scrolling list. The card nearest the middle of the
     screen plays a light reel instead: three screens of the same site cross-fading on the GPU.
   Only a few frames ever run at once, so scrolling stays smooth. */
(function () {
  'use strict';
  var W = window, D = document;
  var DESK = { w: 1280, h: 800 }, MOB = { w: 390, h: 844 };
  var isPhone = (W.matchMedia && W.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 900) || W.innerWidth < 760;
  var weak = isPhone || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  var MAX_LIVE = weak ? 1 : 2;
  var reduce = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ICON_LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  var bySlug = {}; (W.HX_SITES || []).forEach(function (s) { bySlug[s.slug] = s; });

  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // the phone's status bar: 13.6% of the screen width (frames.css --sb); the page starts below it
  var SB = 0.136;
  var ro = new ResizeObserver(function (entries) { entries.forEach(function (e) { fit(e.target); }); });
  function fit(vp) {
    var f = vp.querySelector('iframe'); if (!f) return;
    var spec = vp.__spec, k = vp.clientWidth / spec.w, top = vp.__kind === 'm' ? Math.round(spec.w * SB) : 0;
    f.style.width = spec.w + 'px'; f.style.height = (spec.h - top) + 'px';
    f.style.transform = 'scale(' + k + ')';
  }

  function viewport(spec, site, kind) {
    var vp = el('div', 'vp');
    var poster = el('div', 'poster', '<div class="pfall"><b>' + esc(site.brand) + '</b></div>');
    var img = new Image();
    img.alt = ''; img.decoding = 'async'; img.loading = 'lazy';
    img.src = '/posters/' + site.slug + '-' + kind + '.webp';
    img.onerror = function () { img.remove(); };
    poster.appendChild(img);
    vp.appendChild(poster);
    vp.appendChild(el('span', 'loading', '<i></i>loading live site'));
    vp.appendChild(el('span', 'prog'));
    return vp;
  }
  function prep(vp, spec, kind) { vp.__spec = spec; vp.__kind = kind; ro.observe(vp); return vp; }

  // build a stage from scratch, or adopt the one the page already has
  function build(stage, site, opts) {
    opts = opts || {};
    stage.classList.add('stage');
    stage.__site = site; stage.__opts = opts;
    var vps = stage.querySelectorAll('.vp');
    if (vps.length === 2 && stage.getAttribute('data-slug') === site.slug) {
      stage.__vps = [prep(vps[0], DESK, 'd'), prep(vps[1], MOB, 'm')];
      return stage;
    }
    stage.innerHTML = '';
    stage.setAttribute('data-slug', site.slug);
    stage.__reelLoaded = null; stage.classList.remove('reel-on');
    stage.style.setProperty('--accent', site.accent || '#1587bd');
    stage.style.setProperty('--frame-bg', site.bg || '#0b0d13');
    var d = el('div', 'dev-d');
    d.appendChild(el('div', 'd-bar', '<span class="d-dots"><i></i><i></i><i></i></span><span class="d-url">' + ICON_LOCK + esc(site.domain || (site.slug + '.com')) + '</span>'));
    var vd = prep(viewport(DESK, site, 'd'), DESK, 'd'); d.appendChild(vd);
    var m = el('div', 'dev-m');
    var vm = prep(viewport(MOB, site, 'm'), MOB, 'm');
    var sb = el('span', 'sbar', '<b>9:41</b>'); sb.setAttribute('aria-hidden', 'true');
    sb.style.setProperty('--sb-bg', site.bg || '#0b0d13');
    if (/^#?[0-9a-f]{6}$/i.test(site.bg || '')) { var n = parseInt(site.bg.replace('#', ''), 16); if ((0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255 > 0.62) sb.className += ' lt'; }
    vm.insertBefore(sb, vm.firstChild);
    m.appendChild(vm); m.appendChild(el('span', 'isl'));
    stage.appendChild(d); stage.appendChild(m);
    stage.__vps = [vd, vm];
    return stage;
  }

  /* ---------- live ---------- */
  function srcFor(stage, vp) {
    var site = stage.__site, k = vp.clientWidth / vp.__spec.w, dpr = W.devicePixelRatio || 1;
    var maxDpr = (stage.__opts && stage.__opts.maxDpr) || 1.25;
    var cap = Math.max(0.5, Math.min(maxDpr, k * dpr * 1.05));
    var lite = vp.__kind === 'm' || weak || (stage.__opts && stage.__opts.lite) ? 1 : 0;
    var tour = stage.__tourOff ? 0 : 1;
    return '/w/' + site.slug + '/?embed=1&tour=' + tour + '&v=' + vp.__kind + '&dpr=' + cap.toFixed(2) + '&lite=' + lite;
  }
  function mountVp(stage, vp) {
    if (vp.querySelector('iframe')) return;
    if (vp.offsetParent === null && !stage.__force) return; // hidden (e.g. phone-only view)
    var f = D.createElement('iframe');
    f.setAttribute('title', stage.__site.brand + (vp.__kind === 'd' ? ' on a laptop' : ' on a phone'));
    f.setAttribute('loading', 'eager');
    f.setAttribute('allow', 'autoplay; fullscreen');
    f.setAttribute('tabindex', stage.__interactive ? '0' : '-1');
    if (!stage.__interactive) f.setAttribute('aria-hidden', 'true');
    f.src = srcFor(stage, vp);
    vp.classList.add('mounting');
    vp.appendChild(f);
    fit(vp);
    vp.__mountedAt = Date.now();
    clearTimeout(vp.__fallbackT);
    vp.__fallbackT = setTimeout(function () { vp.classList.remove('mounting'); vp.classList.add('live'); }, 9000);
  }
  function unmountVp(vp) {
    var f = vp.querySelector('iframe');
    if (f) { try { f.src = 'about:blank'; } catch (e) {} f.remove(); }
    clearTimeout(vp.__fallbackT);
    vp.classList.remove('live', 'mounting');
    var p = vp.querySelector('.prog'); if (p) p.style.width = '0';
  }
  function mount(stage) {
    stage.__mounted = true;
    var a = stage.__vps[0], b = stage.__vps[1];
    mountVp(stage, a);
    clearTimeout(stage.__t2);
    var second = function () { a.__onReady = null; clearTimeout(stage.__t2); if (stage.__mounted) mountVp(stage, b); };
    if (!a.querySelector('iframe') || a.classList.contains('live')) second();
    else { a.__onReady = second; stage.__t2 = setTimeout(second, 1200); }
  }
  function unmount(stage) { stage.__mounted = false; clearTimeout(stage.__t2); clearTimeout(stage.__tq); stage.__vps.forEach(function (vp) { vp.__onReady = null; unmountVp(vp); }); }
  function post(stage, msg) {
    (stage.__vps || []).forEach(function (vp) { var f = vp.querySelector('iframe'); if (f && f.contentWindow) { try { f.contentWindow.postMessage(msg, location.origin); } catch (e) {} } });
  }

  // messages from the live sites
  W.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || !e.data.hx) return;
    var frames = D.querySelectorAll('.vp iframe');
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === e.source) {
        var vp = frames[i].parentNode;
        if (e.data.hx === 'ready') { clearTimeout(vp.__fallbackT); vp.classList.remove('mounting'); vp.classList.add('live'); if (vp.__onReady) vp.__onReady(); }
        else if (e.data.hx === 'progress') { var p = vp.querySelector('.prog'); if (p) p.style.width = (Math.max(0, Math.min(1, e.data.p)) * 100).toFixed(1) + '%'; }
        break;
      }
    }
  });

  // pause everything when the tab is hidden
  D.addEventListener('visibilitychange', function () {
    var msg = { hx: D.hidden ? 'pause' : 'play' };
    D.querySelectorAll('.stage').forEach(function (s) { if (s.__mounted) post(s, msg); });
  });

  /* ---------- reel ---------- */
  function reelLoad(stage) {
    if (stage.__reelLoaded) return stage.__reelLoaded;
    var slug = stage.__site.slug, jobs = [];
    stage.__vps.forEach(function (vp) {
      var poster = vp.querySelector('.poster'), ims = [];
      ['2', '3'].forEach(function (n) {
        var im = new Image(); im.alt = ''; im.decoding = 'async'; im.className = 'rf';
        im.src = '/posters/' + slug + '-' + vp.__kind + n + '.webp';
        ims.push(im);
        jobs.push(im.decode ? im.decode().catch(function () { im.__bad = true; }) : new Promise(function (r) { im.onload = r; im.onerror = function () { im.__bad = true; r(); }; }));
      });
      vp.__rf = ims;
    });
    stage.__reelLoaded = Promise.all(jobs).then(function () {
      stage.__vps.forEach(function (vp) {
        var poster = vp.querySelector('.poster');
        if (vp.__rf.some(function (im) { return im.__bad; })) return;
        vp.__rf.forEach(function (im) { poster.appendChild(im); });
        vp.classList.add('has-reel');
      });
    });
    return stage.__reelLoaded;
  }
  function reel(stage, on) {
    stage.__reelWant = !!on;
    if (!on) { stage.classList.remove('reel-on'); return; }
    if (reduce) return;
    reelLoad(stage).then(function () { if (stage.__reelWant) stage.classList.add('reel-on'); });
  }

  /* ---------- scheduling: who is live, who plays a reel ---------- */
  // Cards closest to the screen centre get the turn. New ones only start once scrolling settles.
  var tracked = [], lastScroll = 0, schedT = 0;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.target.__ratio = e.intersectionRatio; });
    schedule();
  }, { threshold: [0, 0.05, 0.25, 0.5, 0.6, 0.75, 1] });
  function schedule() {
    clearTimeout(schedT);
    var idle = isPhone ? 260 : 200, wait = Math.max(50, idle - (Date.now() - lastScroll));
    schedT = setTimeout(apply, wait);
  }
  function centred(list, min) {
    var mid = W.innerHeight / 2, midX = W.innerWidth / 2;
    var c = list.filter(function (s) { return !s.closest('[hidden]') && (s.__ratio || 0) >= min; });
    c.forEach(function (s) { var r = s.getBoundingClientRect(); s.__dist = Math.abs((r.top + r.bottom) / 2 - mid) + Math.abs((r.left + r.right) / 2 - midX) * 0.6; });
    return c.sort(function (a, b) { return a.__dist - b.__dist; });
  }
  function apply() {
    var lives = tracked.filter(function (s) { return s.__mode === 'live'; }), reels = tracked.filter(function (s) { return s.__mode === 'reel'; });
    // reels: one at a time on phones, two on bigger screens
    var rk = centred(reels, isPhone ? 0.55 : 0.4).slice(0, isPhone ? 1 : 2);
    reels.forEach(function (s) { reel(s, rk.indexOf(s) >= 0); });
    // live: free anything that has left the screen, then start the closest ones one after another
    lives.forEach(function (s) { if (s.__mounted && (s.__ratio || 0) < 0.05) unmount(s); });
    var keep = centred(lives, 0.35).slice(0, MAX_LIVE);
    lives.forEach(function (s) {
      if (keep.indexOf(s) >= 0) return;
      if (s.__queued) { clearTimeout(s.__tq); s.__queued = false; }
      if (s.__mounted) unmount(s);
    });
    var delay = 0;
    keep.forEach(function (s) {
      if (s.__mounted || s.__queued) return;
      s.__queued = true;
      s.__tq = setTimeout(function () { s.__queued = false; if (keep.indexOf(s) >= 0 && (s.__ratio || 0) >= 0.05 && !s.__mounted) mount(s); }, delay);
      delay += 650;
    });
  }
  // mode: 'auto' (live on big screens, reel on phones), 'reel' (always a reel) or 'live'
  function observe(stage, mode) {
    stage.__mode = mode === 'reel' || (mode !== 'live' && isPhone) ? 'reel' : 'live';
    tracked.push(stage); io.observe(stage);
  }
  W.addEventListener('scroll', function () { lastScroll = Date.now(); if (tracked.length) schedule(); }, { passive: true });
  // a sideways rail (home page) scrolls on its own: listen there too
  D.addEventListener('scroll', function (e) { if (e.target !== D && tracked.length) { lastScroll = Date.now(); schedule(); } }, { passive: true, capture: true });

  function setTour(stage, on) { stage.__tourOff = !on; post(stage, { hx: 'tour', on: !!on }); }
  function setInteractive(stage, on) {
    stage.__interactive = !!on;
    (stage.__vps || []).forEach(function (vp) { vp.classList.toggle('interactive', !!on); var f = vp.querySelector('iframe'); if (f) { f.setAttribute('tabindex', on ? '0' : '-1'); if (on) f.removeAttribute('aria-hidden'); } });
  }
  function remount(stage) { unmount(stage); mount(stage); }
  // adopt every stage on the page that has a slug
  function adoptAll(sel, mode, opts) {
    var out = [];
    D.querySelectorAll(sel).forEach(function (st) { var s = bySlug[st.getAttribute('data-slug')]; if (!s) return; build(st, s, opts); observe(st, mode); out.push(st); });
    return out;
  }

  W.HXFrames = { build: build, observe: observe, adoptAll: adoptAll, mount: mount, unmount: unmount, remount: remount, post: post, setTour: setTour, setInteractive: setInteractive, refresh: schedule, reel: reel, isPhone: isPhone };
})();
