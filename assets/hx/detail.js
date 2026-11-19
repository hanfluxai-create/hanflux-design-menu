/* Hanflux Design Menu · style detail: big live preview, view switch, tour toggle, add-ons, estimate. */
(function () {
  'use strict';
  var D = document, W = window, F = W.HXFrames, X = W.HXShell, C = W.HX_CONFIG;
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var slug = D.body.getAttribute('data-slug'), site = X.bySlug[slug];
  if (!site) return;
  if (!C.showPrices) D.documentElement.classList.add('hide-prices');

  // live stage
  var st = $('#d-stage');
  F.build(st, site, { maxDpr: 1.6 });
  var mounted = false;
  new IntersectionObserver(function (es) {
    var v = es[0].isIntersecting;
    if (v && !mounted) { mounted = true; F.mount(st); }
    else if (!v && mounted) { F.post(st, { hx: 'pause' }); }
    else if (v && mounted) { F.post(st, { hx: 'play' }); }
  }, { threshold: 0.15 }).observe(st);

  // view switch
  $$('.seg [data-view]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-view');
      $$('.seg [data-view]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      st.classList.toggle('combo', v === 'both');
      st.classList.toggle('only-d', v === 'd');
      st.classList.toggle('only-m', v === 'm');
      if (mounted) { st.__force = true; F.mount(st); st.__force = false; }
    });
  });

  // auto tour on/off: off makes the frames scrollable by hand
  var tb = $('[data-tour-toggle]'), hint = $('#d-hint');
  tb.addEventListener('click', function () {
    var on = tb.getAttribute('aria-pressed') !== 'true';
    tb.setAttribute('aria-pressed', on ? 'true' : 'false');
    $('span', tb).textContent = on ? 'Auto tour' : 'Auto tour off';
    F.setTour(st, on);
    F.setInteractive(st, !on);
    hint.textContent = on ? 'auto tour is on · switch it off to scroll the site yourself' : 'scroll inside the frames to explore · switch auto tour back on any time';
  });

  // add-ons and estimate
  function renderEst() {
    var base = X.tierPrice(site.tier), reg = X.tierRegular(site.tier), on = X.offerOn();
    var once = 0, mo = 0, n = 0;
    C.addons.forEach(function (a) { if (X.hasAddon(a.id)) { n++; if (a.monthly) mo += a.from; else once += a.from; } });
    $$('#d-addons input').forEach(function (i) { i.checked = X.hasAddon(i.value); });
    var amt = (on && reg > base ? '<s class="was" style="font-size:.55em;margin-right:8px">' + X.money(reg + once) + '</s>' : '') + 'from ' + X.money(base + once) + (mo ? '<small>+ ' + X.money(mo) + '/mo</small>' : '');
    $('#d-est-amt').innerHTML = amt;
    $('#d-est-sub').textContent = C.tiers[site.tier].name + ' design' + (n ? ' + ' + n + ' add-on' + (n > 1 ? 's' : '') : ', no add-ons yet');
    $('#bb-amt').innerHTML = (on && reg > base ? '<s class="was" style="font:500 12px var(--font-body);margin-right:6px">' + X.money(reg + once) + '</s>' : '') + 'from ' + X.money(base + once) + (mo ? ' <span class="faint" style="font:500 12px var(--font-body)">+ ' + X.money(mo) + '/mo</span>' : '');
  }
  $('#d-addons').addEventListener('change', function (e) { if (e.target.matches('input')) { X.toggleAddon(e.target.value); } });
  $('#d-addons').addEventListener('click', function (e) { if (e.target.closest('[data-more-addons]')) $('#d-addons').classList.add('open'); });
  if (C.addons.some(function (a, k) { return k >= 6 && X.hasAddon(a.id); })) $('#d-addons').classList.add('open');

  // shortlist + request
  function syncPick() {
    $$('[data-pick]').forEach(function (b) { var on = X.hasSite(b.getAttribute('data-pick')); b.setAttribute('aria-pressed', on ? 'true' : 'false'); var l = $('.lbl', b); if (l) l.textContent = on ? 'Shortlisted' : 'Shortlist'; });
  }
  D.addEventListener('click', function (e) {
    var p = e.target.closest('[data-pick]'); if (p) { X.toggleSite(p.getAttribute('data-pick')); return; }
    if (e.target.closest('#d-request, [data-request-this]')) X.openRequest({ primary: slug });
  });
  X.onChange(function () { syncPick(); renderEst(); });
  syncPick(); renderEst();

  // mobile buy bar appears once the price card is out of view
  var bar = $('#buybar'), buy = $('#buy');
  new IntersectionObserver(function (es) { bar.classList.toggle('show', !es[0].isIntersecting && W.scrollY > 300); }, { threshold: 0 }).observe(buy);
  W.addEventListener('scroll', function () { if (W.scrollY < 300) bar.classList.remove('show'); }, { passive: true });

  // keyboard: arrows go to the previous / next design
  D.addEventListener('keydown', function (e) {
    if (e.target.closest('input, textarea, select') || D.querySelector('.sheet.open')) return;
    if (e.key === 'ArrowRight') { var n = $('.d-next'); if (n) location.href = n.href; }
    if (e.key === 'ArrowLeft') { var p = $('.d-prev'); if (p) location.href = p.href; }
  });
})();
