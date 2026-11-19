/* Hanflux Design Menu · websites menu: live cards, filters, shortlist, quote bar. */
(function () {
  'use strict';
  var D = document, W = window, S = W.HX_SITES || [], F = W.HXFrames, X = W.HXShell, C = W.HX_CONFIG;
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var by = {}; S.forEach(function (s) { by[s.slug] = s; });
  var cards = $$('.wcard');

  // live frames
  cards.forEach(function (card) {
    var site = by[card.getAttribute('data-slug')]; if (!site) return;
    var st = $('[data-stage]', card);
    F.build(st, site);
    F.observe(st);
    var mo = new MutationObserver(function () { card.classList.toggle('is-live', !!st.querySelector('.vp.live')); });
    mo.observe(st, { subtree: true, attributes: true, attributeFilter: ['class'] });
  });

  // shortlist buttons
  function syncPicks() {
    $$('[data-pick]').forEach(function (b) {
      var on = X.hasSite(b.getAttribute('data-pick'));
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var l = $('.lbl', b); if (l) l.textContent = on ? 'Shortlisted' : 'Shortlist';
    });
    cards.forEach(function (c) { c.classList.toggle('picked', X.hasSite(c.getAttribute('data-slug'))); });
    $$('[data-pick-wcount]').forEach(function (e) { e.textContent = X.store.w.length; });
    var n = X.store.w.length + X.store.a.length, bar = $('#qbar');
    bar.classList.toggle('show', n > 0);
    $('#qb-n').textContent = n + (n === 1 ? ' design shortlisted' : ' designs shortlisted');
    var e = X.estimate();
    $('#qb-est').textContent = C.showPrices && e.total ? 'from ' + X.money(e.total) + (e.monthly ? ' + ' + X.money(e.monthly) + '/mo' : '') : 'Send them for a fixed quote';
    if (curF === 'picks') apply('picks');
  }
  D.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pick]'); if (!b) return;
    e.preventDefault(); X.toggleSite(b.getAttribute('data-pick'));
  });
  X.onChange(syncPicks);

  // filters
  var curF = 'all';
  function match(card, f) {
    if (card.classList.contains('ccard')) return f === 'all';
    var s = by[card.getAttribute('data-slug')]; if (!s) return false;
    if (f === 'all') return true;
    if (f === 'picks') return X.hasSite(s.slug);
    if (f === 'live') return !!s.live;
    if (f.indexOf('t:') === 0) return s.tier === f.slice(2);
    if (f.indexOf('g:') === 0) return s.tags.indexOf(f.slice(2)) >= 0;
    if (f === 'shared') return X.sharedW.indexOf(s.slug) >= 0;
    return true;
  }
  function apply(f) {
    curF = f;
    $$('#filters [data-f]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-f') === f ? 'true' : 'false'); });
    var n = 0;
    cards.forEach(function (c) { var show = match(c, f); c.hidden = !show; if (show && !c.classList.contains('ccard')) n++; });
    $('#w-count').textContent = n + (n === 1 ? ' design' : ' designs');
    $('#w-empty').hidden = n > 0;
    F.refresh();
  }
  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('[data-f]'); if (!b) return;
    apply(b.getAttribute('data-f'));
    var top = $('#grid').getBoundingClientRect().top + W.scrollY - (W.innerWidth < 860 ? 120 : 130);
    if (W.scrollY > top) W.scrollTo({ top: top, behavior: 'smooth' });
  });

  // a shortlist shared by link
  if (X.sharedW.length) {
    $('#shared').hidden = false;
    $('#shared-list').textContent = X.sharedW.map(function (s) { return by[s].name; }).join(' · ');
    $('#shared-show').addEventListener('click', function () { apply('shared'); });
    apply('shared');
  }
  // deep links: ?tier=flagship or ?f=live
  var q = new URLSearchParams(location.search);
  if (q.get('tier')) apply('t:' + q.get('tier'));
  else if (q.get('f')) apply(q.get('f'));

  syncPicks();
})();
