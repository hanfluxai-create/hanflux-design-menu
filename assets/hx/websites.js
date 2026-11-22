/* Hanflux Design Menu · the design menu: cards, filters by business and plan, saved designs. */
(function () {
  'use strict';
  var D = document, W = window, S = W.HX_SITES || [], F = W.HXFrames, X = W.HXShell, C = W.HX_CONFIG;
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var by = {}; S.forEach(function (s) { by[s.slug] = s; });
  var BIZ = {}; (C.biz || []).forEach(function (b) { BIZ[b.id] = b; });
  var cards = $$('.wcard'), gcards = $$('#grid .wcard');

  // frames: live on big screens, light reels on phones
  cards.forEach(function (card) {
    var site = by[card.getAttribute('data-slug')]; if (!site) return;
    var st = $('[data-stage]', card); if (!st) return;
    F.build(st, site, { lite: true });
    F.observe(st, 'auto');
    var mo = new MutationObserver(function () { card.classList.toggle('is-live', !!st.querySelector('.vp.live') || st.classList.contains('reel-on')); });
    mo.observe(st, { subtree: true, attributes: true, attributeFilter: ['class'] });
  });

  // save buttons
  function syncPicks() {
    $$('[data-pick]').forEach(function (b) {
      var on = X.hasSite(b.getAttribute('data-pick'));
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var l = $('.lbl', b); if (l) l.textContent = on ? 'Saved' : 'Save';
    });
    cards.forEach(function (c) { c.classList.toggle('picked', X.hasSite(c.getAttribute('data-slug'))); });
    $$('[data-pick-wcount]').forEach(function (e) { e.textContent = X.store.w.length; });
    if (curF === 'picks') apply('picks');
  }
  D.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pick]'); if (!b) return;
    e.preventDefault(); X.toggleSite(b.getAttribute('data-pick'));
  });
  X.onChange(syncPicks);

  // filters
  var curF = 'all';
  var LABEL = { picks: 'your saved designs', shared: 'the designs shared with you' };
  function match(card, f) {
    if (card.classList.contains('ccard')) return f === 'all';
    var s = by[card.getAttribute('data-slug')]; if (!s) return false;
    if (f === 'all') return true;
    if (f === 'picks') return X.hasSite(s.slug);
    if (f === 'live') return !!s.live;
    if (f.indexOf('t:') === 0) return s.tier === f.slice(2);
    if (f.indexOf('b:') === 0) return !!BIZ[f.slice(2)] && BIZ[f.slice(2)].slugs.indexOf(s.slug) >= 0;
    if (f === 'shared') return X.sharedW.indexOf(s.slug) >= 0;
    return true;
  }
  function label(f) {
    if (LABEL[f]) return LABEL[f];
    if (f.indexOf('b:') === 0 && BIZ[f.slice(2)]) return BIZ[f.slice(2)].label.toLowerCase();
    if (f.indexOf('t:') === 0 && C.tiers[f.slice(2)]) return C.tiers[f.slice(2)].name + ' plan: ' + C.tiers[f.slice(2)].kind.toLowerCase() + 's';
    return '';
  }
  function apply(f) {
    curF = f;
    $$('#filters [data-f]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-f') === f ? 'true' : 'false'); });
    var n = 0;
    gcards.forEach(function (c) { var show = match(c, f); c.hidden = !show; if (show && !c.classList.contains('ccard')) n++; });
    $('#w-count').textContent = n + (n === 1 ? ' design' : ' designs');
    $('#w-empty').hidden = n > 0;
    var now = $('#f-now');
    if (now) { now.hidden = f === 'all'; $('#f-now-t').textContent = f === 'all' ? '' : 'Showing ' + n + (n === 1 ? ' design' : ' designs') + ' for ' + label(f) + '.'; }
    F.refresh();
  }
  function jump() {
    var top = $('#grid').getBoundingClientRect().top + W.scrollY - (W.innerWidth < 860 ? 120 : 130);
    if (W.scrollY > top) W.scrollTo({ top: top, behavior: 'smooth' });
  }
  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('[data-f]'); if (!b) return;
    apply(b.getAttribute('data-f'));
    b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    jump();
  });
  D.addEventListener('click', function (e) { if (e.target.closest('[data-f-reset]')) { apply('all'); jump(); } });

  // a shortlist shared by link
  if (X.sharedW.length) {
    $('#shared').hidden = false;
    $('#shared-list').textContent = X.sharedW.map(function (s) { return by[s].name; }).join(' · ');
    $('#shared-show').addEventListener('click', function () { apply('shared'); });
    apply('shared');
  }
  // deep links: ?biz=food, ?tier=flagship or ?f=picks
  var q = new URLSearchParams(location.search);
  if (q.get('biz') && BIZ[q.get('biz')]) apply('b:' + q.get('biz'));
  else if (q.get('tier') && C.tiers[q.get('tier')]) apply('t:' + q.get('tier'));
  else if (q.get('f')) apply(q.get('f'));
  if (curF !== 'all') { var on = $('#filters [aria-pressed="true"]'); if (on) on.scrollIntoView({ block: 'nearest', inline: 'center' }); }

  syncPicks();
})();
