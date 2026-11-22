/* Hanflux Design Menu · design page: the live preview (one phone frame on phones), add-ons, estimate. */
(function () {
  'use strict';
  var D = document, W = window, F = W.HXFrames, X = W.HXShell, C = W.HX_CONFIG;
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var slug = D.body.getAttribute('data-slug'), site = X.bySlug[slug];
  if (!site) return;
  if (!C.showPrices) D.documentElement.classList.add('hide-prices');

  // live stage: phones run just the phone frame (one site, not two); bigger screens show both
  var st = $('#d-stage');
  F.build(st, site, { maxDpr: F.isPhone ? 1.25 : 1.6 });
  var view = F.isPhone ? 'm' : 'both';
  function setView(v) {
    view = v;
    $$('.seg [data-view]').forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-view') === v ? 'true' : 'false'); });
    st.classList.toggle('combo', v === 'both');
    st.classList.toggle('only-d', v === 'd');
    st.classList.toggle('only-m', v === 'm');
    st.classList.add('vset');
  }
  setView(view);
  var mounted = false;
  function start() {
    if (mounted) return; mounted = true;
    if (view === 'both') F.mount(st);
    else { st.__force = false; F.mount(st); }
  }
  // On phones the live site starts only once the visitor pauses on it (no scrolling for a moment), and a
  // light reel plays until then, so booting a whole website never competes with scrolling.
  var seen = false, calmT = 0;
  function calm() {
    clearTimeout(calmT);
    if (mounted || !seen) return;
    calmT = setTimeout(function () { if (seen && !mounted) { F.reel(st, false); start(); } }, F.isPhone ? 1800 : 0);
  }
  if (F.isPhone) {
    W.addEventListener('scroll', calm, { passive: true });
    W.addEventListener('touchstart', function () { clearTimeout(calmT); }, { passive: true });
    W.addEventListener('touchend', calm, { passive: true });
  }
  new IntersectionObserver(function (es) {
    var e = es[0], v = e.isIntersecting && e.intersectionRatio >= (F.isPhone ? 0.5 : 0.15);
    seen = v;
    if (v && !mounted) {
      if (F.isPhone) { F.reel(st, true); calm(); }
      else if ('requestIdleCallback' in W) requestIdleCallback(start, { timeout: 900 }); else setTimeout(start, 300);
    }
    else if (!v && mounted) { F.post(st, { hx: 'pause' }); }
    else if (v && mounted) { F.post(st, { hx: 'play' }); }
    if (!v) clearTimeout(calmT);
  }, { threshold: [0, 0.15, 0.5, 0.8] }).observe(st);

  // view switch: only the frames on screen run
  $$('.seg [data-view]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-view'); if (v === view) return;
      setView(v);
      if (!mounted) return;
      st.__vps.forEach(function (vp) { var on = v === 'both' || vp.__kind === v; if (!on && vp.querySelector('iframe')) { vp.classList.remove('live', 'mounting'); var f = vp.querySelector('iframe'); try { f.src = 'about:blank'; } catch (e) {} f.remove(); } });
      F.mount(st);
    });
  });

  // auto-scroll on/off: off makes the frames scrollable by hand
  var tb = $('[data-tour-toggle]'), hint = $('#d-hint');
  tb.addEventListener('click', function () {
    var on = tb.getAttribute('aria-pressed') !== 'true';
    tb.setAttribute('aria-pressed', on ? 'true' : 'false');
    F.setTour(st, on);
    F.setInteractive(st, !on);
    hint.lastChild.textContent = on ? 'This is the real, working site. Turn auto-scroll off to scroll it yourself, or open it full screen.' : 'Scroll inside the frame to explore. Turn auto-scroll back on any time.';
  });

  // a one-time nudge towards "Open full screen", once the live site is running
  var fs = $('.btn-fs');
  if (fs && !F.isPhone) {
    var seenCoach = false; try { seenCoach = !!sessionStorage.getItem('hx-coach'); } catch (e) {}
    if (!seenCoach) setTimeout(function () { fs.classList.add('coach-on'); try { sessionStorage.setItem('hx-coach', '1'); } catch (e) {} setTimeout(function () { fs.classList.remove('coach-on'); }, 5200); }, 4200);
  }

  // add-ons and estimate (our own sites are examples: no price card)
  var hasBuy = !!$('#d-addons');
  function renderEst() {
    if (!hasBuy) return;
    var base = X.tierPrice(site.tier), reg = X.tierRegular(site.tier), on = X.offerOn();
    var once = 0, mo = 0, n = 0;
    C.addons.forEach(function (a) { if (X.hasAddon(a.id)) { n++; if (a.monthly) mo += X.addonPrice(a); else once += X.addonPrice(a); } });
    $$('#d-addons input').forEach(function (i) { i.checked = X.hasAddon(i.value); });
    var amt = (on && reg > base ? '<s class="was" style="font-size:.55em;margin-right:8px">' + X.money(reg + once) + '</s>' : '') + 'from ' + X.money(base + once) + (mo ? '<small>+ ' + X.money(mo) + '/mo</small>' : '');
    $('#d-est-amt').innerHTML = amt;
    $('#d-est-sub').textContent = C.tiers[site.tier].name + ' plan' + (n ? ' + ' + n + ' add-on' + (n > 1 ? 's' : '') : ', no add-ons yet');
    var bb = $('#bb-amt'); if (bb) bb.innerHTML = 'from ' + X.money(base + once) + (mo ? ' <span class="faint" style="font:500 12px var(--font-body)">+ ' + X.money(mo) + '/mo</span>' : '');
  }
  if (hasBuy) {
    $('#d-addons').addEventListener('change', function (e) { if (e.target.matches('input')) { X.toggleAddon(e.target.value); } });
    if (C.addons.some(function (a) { return X.hasAddon(a.id); })) { var w = $('#ao-wrap'); if (w) w.open = true; }
  }

  // save + request
  function syncPick() {
    $$('[data-pick]').forEach(function (b) { var on = X.hasSite(b.getAttribute('data-pick')); b.setAttribute('aria-pressed', on ? 'true' : 'false'); var l = $('.lbl', b); if (l) l.textContent = on ? 'Saved' : 'Save'; });
  }
  D.addEventListener('click', function (e) {
    var p = e.target.closest('[data-pick]'); if (p) { X.toggleSite(p.getAttribute('data-pick')); return; }
    if (e.target.closest('[data-request-this]')) X.openRequest({ primary: slug });
  });
  X.onChange(function () { syncPick(); renderEst(); });
  syncPick(); renderEst();

  // phone buy bar: shows once the price card is out of view, steps aside at the end of the page
  // (more designs and the footer), so it never covers the last buttons and links
  var bar = $('#buybar'), buy = $('#buy');
  if (bar && buy) {
    var buyVis = true, endVis = false, ends = $$('.d-more, .foot');
    var upd = function () { bar.classList.toggle('show', !buyVis && !endVis && W.scrollY > 300); };
    new IntersectionObserver(function (es) { buyVis = es[0].isIntersecting; upd(); }, { threshold: 0 }).observe(buy);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.__vis = e.isIntersecting; });
      endVis = ends.some(function (x) { return x.__vis; }); upd();
    }, { threshold: 0 });
    ends.forEach(function (x) { io.observe(x); });
    W.addEventListener('scroll', function () { if (W.scrollY < 300) bar.classList.remove('show'); }, { passive: true });
  }

  // keyboard: arrows go to the previous / next design
  D.addEventListener('keydown', function (e) {
    if (e.target.closest('input, textarea, select') || D.querySelector('.sheet.open')) return;
    if (e.key === 'ArrowRight') { var n = $('.d-next'); if (n) location.href = n.href; }
    if (e.key === 'ArrowLeft') { var p = $('.d-prev'); if (p) location.href = p.href; }
  });
})();
