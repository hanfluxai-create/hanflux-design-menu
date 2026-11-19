/* Hanflux Design Menu · AI agent interfaces: hero, live grid, viewer, filters, shared shortlist. */
(function boot() {
  'use strict';
  // the agent menu is private for now: wait for the PIN gate
  if (document.documentElement.classList.contains('pin-locked')) { window.addEventListener('hx-unlock', boot, { once: true }); return; }
  var S = window.HX_STYLES, H = window.HXStage, X = window.HXShell;
  if (!S || !H) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var byId = {}; S.forEach(function (s, i) { s.i = i; byId[s.id] = s; });
  var ICON = {
    expand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.4A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.5c0 5.8-7.5 10.4-7.5 10.4z"/></svg>'
  };

  // every stage is drawn at 960 x 540 and scaled to its frame
  var ro = new ResizeObserver(function (entries) { entries.forEach(function (e) { var hx = e.target.querySelector('.hx'); if (hx) hx.style.transform = 'scale(' + (e.contentRect.width / 960) + ')'; }); });
  function mount(wrap, stage) { wrap.appendChild(stage.root); stage.root.style.transform = 'scale(' + (wrap.clientWidth / 960) + ')'; ro.observe(wrap); }

  // hero
  var HERO = ['theatre', 'neon', 'glass', 'mission', 'deco', 'particles', 'kinetic', 'industrial', 'holo', 'liquid'].filter(function (x) { return byId[x]; });
  var hi = 0, heroWrap = $('#hero-stage'), heroNow = $('#hero-now');
  function setNow() { var s = byId[HERO[hi]]; heroNow.textContent = s.n + ' · ' + s.name; }
  var hero = H.create(HERO[0], { freeze: REDUCED ? 'point' : 'loop', onBeat: function (b, st) { var prev = st.__prev; st.__prev = b; if ((b === 0 && prev === 7) || (b === 4 && prev === 3)) { hi = (hi + 1) % HERO.length; st.setLook(HERO[hi]); setNow(); } } });
  mount(heroWrap, hero); setNow();
  new IntersectionObserver(function (es) { hero.setVisible(es[0].isIntersecting); }).observe(heroWrap);

  // grid
  var grid = $('#grid');
  grid.innerHTML = S.map(function (s, i) {
    return '<article class="mcard rv" id="' + s.id + '" data-id="' + s.id + '" data-cats="' + s.cats.join(' ') + '">' +
      '<div class="thumb"><div class="stage-wrap" data-look="' + s.id + '" data-off="' + ((i % 6) * 1700) + '"></div><span class="num">' + s.n + '</span>' +
      '<button class="thumb-btn" type="button" data-open="' + i + '" aria-label="Preview ' + s.name + ' full size"><span class="expand">' + ICON.expand + '</span></button></div>' +
      '<div class="meta"><div class="row1"><h3>' + s.name + '</h3><span class="tags">' + s.tags.join(' · ') + '</span></div>' +
      '<p class="desc">' + s.d + '</p><p class="best"><span>best for</span>' + s.best + '</p>' +
      '<div class="actions"><button class="btn btn-ghost btn-sm" type="button" data-open="' + i + '">Preview</button>' +
      '<button class="btn btn-ghost btn-sm btn-pick" type="button" data-apick="' + s.id + '" aria-pressed="false">' + ICON.heart + '<span class="lbl">Shortlist</span></button></div></div></article>';
  }).join('');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var w = e.target;
      if (e.isIntersecting && !w.__stage) { w.__stage = H.create(w.getAttribute('data-look'), { offset: +w.getAttribute('data-off') || 0, freeze: REDUCED ? 'point' : 'loop' }); mount(w, w.__stage); }
      if (w.__stage) w.__stage.setVisible(e.isIntersecting);
    });
  }, { rootMargin: '200px 0px' });
  $$('.stage-wrap', grid).forEach(function (w) { io.observe(w); });
  // reveal the cards (they were added after the shell looked for them)
  var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { threshold: 0.05 });
  $$('.mcard', grid).forEach(function (c) { rio.observe(c); });

  // shortlist (shared with the website menu)
  var cur = 0;
  function sync() {
    $$('[data-apick]').forEach(function (b) { var on = X.hasAgent(b.getAttribute('data-apick')); b.setAttribute('aria-pressed', on ? 'true' : 'false'); var l = $('.lbl', b); if (l) l.textContent = on ? 'Shortlisted' : 'Shortlist'; });
    $$('#grid .mcard').forEach(function (c) { c.classList.toggle('picked', X.hasAgent(c.getAttribute('data-id'))); });
    $('#f-count').textContent = X.store.a.length;
    var vp = $('#v-pick'), on = X.hasAgent(S[cur].id);
    vp.setAttribute('aria-pressed', on ? 'true' : 'false'); $('.lbl', vp).textContent = on ? 'Shortlisted' : 'Shortlist';
    if (curF === 'shortlist') apply('shortlist');
  }
  X.onChange(sync);

  // filters
  var curF = 'all';
  function apply(f) {
    curF = f;
    $$('#filters [data-f]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-f') === f ? 'true' : 'false'); });
    var n = 0;
    $$('#grid .mcard').forEach(function (c) {
      var show = f === 'all' || (f === 'shortlist' ? X.hasAgent(c.getAttribute('data-id')) : c.getAttribute('data-cats').split(' ').indexOf(f) >= 0);
      c.hidden = !show; if (show) n++;
    });
    $('#count').textContent = n + (n === 1 ? ' style' : ' styles');
    $('#empty').hidden = n > 0;
  }
  $('#filters').addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (b) apply(b.getAttribute('data-f')); });

  // viewer
  var dlg = $('#viewer'), vwrap = $('#v-stage'), vstage = null;
  function fill() {
    var s = S[cur];
    $('#v-num').textContent = s.n; $('#v-name').textContent = s.name; $('#v-desc').textContent = s.d; $('#v-best').textContent = s.best; $('#v-tags').textContent = s.tags.join(' · ');
    if (!vstage) { vstage = H.create(s.id, { freeze: REDUCED ? 'point' : 'loop' }); mount(vwrap, vstage); } else vstage.setLook(s.id);
    sync();
  }
  function setBeat(f) { $$('#v-beats [data-beat]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-beat') === f ? 'true' : 'false'); }); if (vstage) vstage.setFreeze(f); }
  function open(i) { cur = i; fill(); setBeat(REDUCED ? 'point' : 'loop'); if (!dlg.open) dlg.showModal(); vstage.setVisible(true); }
  function step(d) { cur = (cur + d + S.length) % S.length; fill(); }
  dlg.addEventListener('close', function () { if (vstage) vstage.setVisible(false); });
  dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); } });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  $('#v-close').addEventListener('click', function () { dlg.close(); });
  $('#v-prev').addEventListener('click', function () { step(-1); });
  $('#v-next').addEventListener('click', function () { step(1); });
  $('#v-beats').addEventListener('click', function (e) { var b = e.target.closest('[data-beat]'); if (b) setBeat(b.getAttribute('data-beat')); });
  $('#v-pick').addEventListener('click', function () { X.toggleAgent(S[cur].id); });
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]'); if (o) { open(+o.getAttribute('data-open')); return; }
    var p = e.target.closest('[data-apick]'); if (p) { X.toggleAgent(p.getAttribute('data-apick')); }
  });

  // deep link from a website page: /agents/#glass opens that look
  var h = (location.hash || '').slice(1);
  if (h && byId[h]) { setTimeout(function () { var c = document.getElementById(h); if (c) c.scrollIntoView({ block: 'center' }); open(byId[h].i); }, 400); }

  sync(); apply('all');
})();
