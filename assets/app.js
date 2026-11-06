/* Hanflux Design Menu: page behaviour. Hero, menu grid, viewer, filters, shortlist. */
(function () {
  'use strict';
  var S = window.HX_STYLES, H = window.HXStage;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var byN = {}, byId = {};
  S.forEach(function (s, i) { s.i = i; byN[s.n] = s; byId[s.id] = s; });

  var ICON = {
    expand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>'
  };

  /* stage mounting: every stage is drawn at 960 x 540 and scaled to its frame */
  var ro = new ResizeObserver(function (entries) {
    entries.forEach(function (e) {
      var hx = e.target.querySelector('.hx');
      if (hx) hx.style.transform = 'scale(' + (e.contentRect.width / 960) + ')';
    });
  });
  function mount(wrap, stage) {
    wrap.appendChild(stage.root);
    stage.root.style.transform = 'scale(' + (wrap.clientWidth / 960) + ')';
    ro.observe(wrap);
  }

  /* hero: one stage that changes look every scene */
  var HERO = ['persona', 'neon', 'glass', 'mission', 'comic', 'deco', 'particles', 'kinetic', 'industrial', 'ascii'];
  var hi = 0, heroWrap = $('#hero-stage'), heroNow = $('#hero-now');
  function setNow() { var s = byId[HERO[hi]]; heroNow.textContent = s.n + ' · ' + s.name; }
  var hero = H.create(HERO[0], {
    freeze: REDUCED ? 'point' : 'loop',
    onBeat: function (b, st) {
      var prev = st.__prev; st.__prev = b;
      if ((b === 0 && prev === 7) || (b === 4 && prev === 3)) { hi = (hi + 1) % HERO.length; st.setLook(HERO[hi]); setNow(); }
    }
  });
  mount(heroWrap, hero);
  setNow();
  new IntersectionObserver(function (es) { hero.setVisible(es[0].isIntersecting); }).observe(heroWrap);

  /* menu grid */
  var grid = $('#grid');
  grid.innerHTML = S.map(function (s, i) {
    return '<article class="mcard" id="s' + s.n + '" data-n="' + s.n + '" data-cats="' + s.cats.join(' ') + '">' +
      '<div class="thumb"><div class="stage-wrap" data-look="' + s.id + '" data-off="' + ((i % 6) * 1700) + '"></div>' +
      '<span class="num">' + s.n + '</span>' +
      '<button class="thumb-btn" type="button" data-open="' + i + '" aria-label="Preview ' + s.name + ' full screen"><span class="expand">' + ICON.expand + '</span></button></div>' +
      '<div class="meta"><div class="row1"><h3>' + s.name + '</h3><span class="tags">' + s.tags.join(' · ') + '</span></div>' +
      '<p class="desc">' + s.d + '</p><p class="best"><span>Best for</span>' + s.best + '</p>' +
      '<div class="actions"><button class="btn btn-ghost" type="button" data-open="' + i + '">Preview</button>' +
      '<button class="btn btn-pick" type="button" data-pick="' + s.n + '" aria-pressed="false"><span class="ic">' + ICON.plus + '</span><span class="lbl">Shortlist</span></button></div>' +
      '</div></article>';
  }).join('');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var w = e.target;
      if (e.isIntersecting && !w.__stage) {
        w.__stage = H.create(w.getAttribute('data-look'), { offset: +w.getAttribute('data-off') || 0, freeze: REDUCED ? 'point' : 'loop' });
        mount(w, w.__stage);
      }
      if (w.__stage) w.__stage.setVisible(e.isIntersecting);
    });
  }, { rootMargin: '240px 0px' });
  $$('.stage-wrap', grid).forEach(function (w) { io.observe(w); });

  /* shortlist */
  var picks = [];
  try { picks = JSON.parse(localStorage.getItem('hx-shortlist') || '[]').filter(function (n) { return byN[n]; }); } catch (e) { picks = []; }
  var shared = (new URLSearchParams(location.search).get('pick') || '').split(',').map(function (x) { return x.trim(); }).filter(function (n) { return byN[n]; });
  shared.forEach(function (n) { if (picks.indexOf(n) < 0) picks.push(n); });
  function save() { try { localStorage.setItem('hx-shortlist', JSON.stringify(picks)); } catch (e) { /* storage blocked: keep in memory */ } }
  function toggle(n) {
    var i = picks.indexOf(n);
    if (i >= 0) picks.splice(i, 1); else picks.push(n);
    picks.sort(); save(); sync();
  }
  function shareLink() {
    var u = new URL(location.href); u.search = ''; u.hash = '';
    if (picks.length) u.searchParams.set('pick', picks.join(','));
    return u.toString();
  }
  function sync() {
    $$('[data-pick]').forEach(function (b) {
      var on = picks.indexOf(b.getAttribute('data-pick')) >= 0;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var ic = $('.ic', b), lb = $('.lbl', b);
      if (ic) ic.innerHTML = on ? ICON.check : ICON.plus;
      if (lb) lb.textContent = on ? 'Shortlisted' : 'Shortlist';
    });
    $$('#grid .mcard').forEach(function (c) { c.classList.toggle('picked', picks.indexOf(c.getAttribute('data-n')) >= 0); });
    $('#nav-count').textContent = picks.length;
    $('#f-count').textContent = picks.length;
    var bar = $('#bar');
    bar.classList.toggle('show', picks.length > 0);
    $('#bar-list').innerHTML = picks.map(function (n) { return '<span class="chip">' + n + ' ' + byN[n].name + '</span>'; }).join('');
    $('#v-pick').setAttribute('aria-pressed', picks.indexOf(S[cur].n) >= 0 ? 'true' : 'false');
    $('#v-pick .lbl').textContent = picks.indexOf(S[cur].n) >= 0 ? 'Shortlisted' : 'Add to shortlist';
    $('#v-pick .ic').innerHTML = picks.indexOf(S[cur].n) >= 0 ? ICON.check : ICON.plus;
  }

  var toastT;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
  function copyLink() {
    if (!picks.length) { toast('Shortlist a style first'); document.getElementById('menu').scrollIntoView({ behavior: 'smooth' }); return; }
    var link = shareLink();
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = link; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Link copied. Send it to your Hanflux contact.'); } catch (e) { window.prompt('Copy this link', link); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(link).then(function () { toast('Link copied. Send it to your Hanflux contact.'); }, fallback);
    else fallback();
  }

  /* filters */
  var currentFilter = 'all';
  function applyFilter(f) {
    currentFilter = f;
    $$('#filters [data-f]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-f') === f ? 'true' : 'false'); });
    var n = 0;
    $$('#grid .mcard').forEach(function (c) {
      var show = f === 'all' || (f === 'shortlist' ? picks.indexOf(c.getAttribute('data-n')) >= 0 : c.getAttribute('data-cats').split(' ').indexOf(f) >= 0);
      c.hidden = !show; if (show) n++;
    });
    $('#count').textContent = n + (n === 1 ? ' style' : ' styles');
    $('#empty').hidden = n > 0;
  }
  $('#filters').addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (b) applyFilter(b.getAttribute('data-f')); });

  /* viewer */
  var dlg = $('#viewer'), vwrap = $('#v-stage'), vstage = null, cur = 0;
  function fillViewer() {
    var s = S[cur];
    $('#v-num').textContent = s.n;
    $('#v-name').textContent = s.name;
    $('#v-desc').textContent = s.d;
    $('#v-best').textContent = s.best;
    $('#v-tags').textContent = s.tags.join(' · ');
    if (!vstage) { vstage = H.create(s.id, { freeze: REDUCED ? 'point' : 'loop' }); mount(vwrap, vstage); } else vstage.setLook(s.id);
    sync();
  }
  function setBeat(f) {
    $$('#v-beats [data-beat]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-beat') === f ? 'true' : 'false'); });
    if (vstage) vstage.setFreeze(f);
  }
  function openViewer(i) {
    cur = i; fillViewer(); setBeat(REDUCED ? 'point' : 'loop');
    if (!dlg.open) dlg.showModal();
    vstage.setVisible(true);
  }
  function step(d) { cur = (cur + d + S.length) % S.length; fillViewer(); }
  dlg.addEventListener('close', function () { if (vstage) vstage.setVisible(false); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  $('#v-close').addEventListener('click', function () { dlg.close(); });
  $('#v-prev').addEventListener('click', function () { step(-1); });
  $('#v-next').addEventListener('click', function () { step(1); });
  $('#v-beats').addEventListener('click', function (e) { var b = e.target.closest('[data-beat]'); if (b) setBeat(b.getAttribute('data-beat')); });
  $('#v-pick').addEventListener('click', function () { toggle(S[cur].n); });

  /* global clicks */
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]'); if (o) { openViewer(+o.getAttribute('data-open')); return; }
    var p = e.target.closest('[data-pick]'); if (p) { toggle(p.getAttribute('data-pick')); return; }
    if (e.target.closest('[data-copy]')) { copyLink(); return; }
    if (e.target.closest('#bar-clear')) { picks = []; save(); sync(); if (currentFilter === 'shortlist') applyFilter('all'); return; }
    if (e.target.closest('[data-show-picks]')) { applyFilter(picks.length ? 'shortlist' : 'all'); document.getElementById('menu').scrollIntoView({ behavior: 'smooth' }); }
  });

  /* a shortlist shared by link */
  if (shared.length) {
    var sb = $('#shared');
    $('#shared-list').textContent = shared.map(function (n) { return n + ' ' + byN[n].name; }).join(' · ');
    sb.hidden = false;
  }

  sync();
  applyFilter('all');
})();
