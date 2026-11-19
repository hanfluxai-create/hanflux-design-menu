/* Hanflux Design Menu · live device frames.
   Builds a desktop browser frame and a phone frame for a website style, and mounts the real site
   inside each as a scaled iframe running its auto-tour. Only a few frames run at once: the ones
   nearest the middle of the screen. Everything else shows a still poster. */
(function () {
  'use strict';
  var W = window, D = document;
  var DESK = { w: 1280, h: 800 }, MOB = { w: 390, h: 844 };
  var isPhone = (W.matchMedia && W.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 900) || W.innerWidth < 760;
  var weak = isPhone || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  var MAX_LIVE = isPhone ? 1 : 3;
  var ICON_LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var ro = new ResizeObserver(function (entries) { entries.forEach(function (e) { fit(e.target); }); });
  function fit(vp) {
    var f = vp.querySelector('iframe'); if (!f) return;
    var spec = vp.__spec, k = vp.clientWidth / spec.w;
    f.style.width = spec.w + 'px'; f.style.height = spec.h + 'px';
    f.style.transform = 'scale(' + k + ')';
  }

  function viewport(spec, site, kind) {
    var vp = el('div', 'vp');
    vp.__spec = spec; vp.__kind = kind;
    var poster = el('div', 'poster');
    poster.innerHTML = '<div class="pfall"><b>' + esc(site.brand) + '</b></div>';
    var img = new Image();
    img.alt = ''; img.decoding = 'async'; img.loading = 'lazy';
    img.src = '/posters/' + site.slug + '-' + kind + '.webp';
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center';
    img.onerror = function () { img.remove(); };
    poster.appendChild(img);
    vp.appendChild(poster);
    vp.appendChild(el('span', 'loading', '<i></i>loading live site'));
    vp.appendChild(el('span', 'prog'));
    ro.observe(vp);
    return vp;
  }

  function build(stage, site, opts) {
    opts = opts || {};
    stage.innerHTML = '';
    stage.classList.add('stage');
    stage.style.setProperty('--accent', site.accent || '#27f2c0');
    stage.style.setProperty('--frame-bg', site.bg || '#0b0d13');
    stage.__site = site; stage.__opts = opts;
    var d = el('div', 'dev-d');
    var bar = el('div', 'd-bar', '<span class="d-dots"><i></i><i></i><i></i></span><span class="d-url">' + ICON_LOCK + esc(site.domain || (site.slug + '.com')) + '</span>');
    d.appendChild(bar);
    var vd = viewport(DESK, site, 'd'); d.appendChild(vd);
    var m = el('div', 'dev-m');
    var vm = viewport(MOB, site, 'm'); m.appendChild(vm); m.appendChild(el('span', 'isl'));
    stage.appendChild(d); stage.appendChild(m);
    stage.__vps = [vd, vm];
    return stage;
  }

  function srcFor(stage, vp) {
    var site = stage.__site, k = vp.clientWidth / vp.__spec.w, dpr = W.devicePixelRatio || 1;
    var maxDpr = (stage.__opts && stage.__opts.maxDpr) || 1.25;
    var cap = Math.max(0.5, Math.min(maxDpr, k * dpr * 1.05));
    var lite = vp.__kind === 'm' || weak ? 1 : 0;
    var tour = stage.__tourOff ? 0 : 1;
    return '/w/' + site.slug + '/?embed=1&tour=' + tour + '&v=' + vp.__kind + '&dpr=' + cap.toFixed(2) + '&lite=' + lite;
  }

  function mountVp(stage, vp) {
    if (vp.querySelector('iframe')) return;
    if (vp.offsetParent === null && !stage.__force) return; // hidden (e.g. phone-only view)
    var f = D.createElement('iframe');
    f.setAttribute('title', stage.__site.brand + (vp.__kind === 'd' ? ' on desktop' : ' on a phone'));
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
  function mount(stage) { stage.__mounted = true; stage.__vps.forEach(function (vp) { mountVp(stage, vp); }); }
  function unmount(stage) { stage.__mounted = false; stage.__vps.forEach(unmountVp); }
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
        if (e.data.hx === 'ready') { clearTimeout(vp.__fallbackT); vp.classList.remove('mounting'); vp.classList.add('live'); }
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

  // automatic policy for lists of cards: the frames closest to the screen centre run live
  var tracked = [];
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.target.__ratio = e.intersectionRatio; e.target.__rect = e.boundingClientRect; });
    schedule();
  }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });
  var schedT = 0;
  function schedule() { clearTimeout(schedT); schedT = setTimeout(apply, isPhone ? 260 : 160); }
  function apply() {
    var vh = W.innerHeight, mid = vh / 2;
    var cands = tracked.filter(function (s) { return !s.closest('[hidden]') && (s.__ratio || 0) >= (isPhone ? 0.55 : 0.3); });
    cands.forEach(function (s) { var r = s.getBoundingClientRect(); s.__dist = Math.abs((r.top + r.bottom) / 2 - mid); });
    cands.sort(function (a, b) { return a.__dist - b.__dist; });
    var keep = cands.slice(0, MAX_LIVE);
    tracked.forEach(function (s) {
      var want = keep.indexOf(s) >= 0;
      if (want && !s.__mounted) mount(s);
      else if (!want && s.__mounted) {
        if ((s.__ratio || 0) < 0.05) unmount(s);       // fully away: free it now
        else if (keep.length >= MAX_LIVE) unmount(s);    // over budget: free it
      }
    });
  }
  function observe(stage) { tracked.push(stage); io.observe(stage); }
  W.addEventListener('scroll', function () { if (!isPhone) return; schedule(); }, { passive: true });

  function setTour(stage, on) { stage.__tourOff = !on; post(stage, { hx: 'tour', on: !!on }); }
  function setInteractive(stage, on) {
    stage.__interactive = !!on;
    (stage.__vps || []).forEach(function (vp) { vp.classList.toggle('interactive', !!on); var f = vp.querySelector('iframe'); if (f) { f.setAttribute('tabindex', on ? '0' : '-1'); if (on) f.removeAttribute('aria-hidden'); } });
  }
  function remount(stage) { unmount(stage); mount(stage); }

  W.HXFrames = { build: build, observe: observe, mount: mount, unmount: unmount, remount: remount, post: post, setTour: setTour, setInteractive: setInteractive, refresh: schedule, isPhone: isPhone };
})();
