/* Hanflux Design Menu · home: featured live website and the live agent stage. */
(function () {
  'use strict';
  var D = document, W = window, S = W.HX_SITES || [], F = W.HXFrames;
  var by = {}; S.forEach(function (s) { by[s.slug] = s; });
  var FEAT = ['particles', 'liquid', 'glass', 'neon', 'deco', 'iso'].filter(function (s) { return by[s]; });

  // door 1: one live website, switchable
  var stageEl = D.getElementById('feat-stage'), pick = D.getElementById('feat-pick');
  if (stageEl && F && FEAT.length) {
    var cur = FEAT[0];
    pick.innerHTML = FEAT.map(function (s) {
      return '<button type="button" class="chip" data-feat="' + s + '" aria-pressed="' + (s === cur) + '"><i style="background:' + by[s].accent + '"></i>' + by[s].name + '</button>';
    }).join('');
    F.build(stageEl, by[cur]);
    var near = false;
    new IntersectionObserver(function (es) {
      var vis = es[0].isIntersecting;
      if (vis && !near) { near = true; F.mount(stageEl); }
      else if (!vis && near) { near = false; F.unmount(stageEl); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.25 }).observe(stageEl);
    pick.addEventListener('click', function (e) {
      var b = e.target.closest('[data-feat]'); if (!b) return;
      var s = b.getAttribute('data-feat'); if (s === cur) return;
      cur = s;
      pick.querySelectorAll('[data-feat]').forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-feat') === s ? 'true' : 'false'); });
      F.unmount(stageEl); F.build(stageEl, by[s]); if (near) F.mount(stageEl);
    });
  }

  // door 2: the Director Mode stage, loaded only when it comes near
  var aiWrap = D.getElementById('ai-stage'), aiNow = D.getElementById('ai-now');
  if (aiWrap) {
    var loaded = false;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting || loaded) return;
      loaded = true; io.disconnect();
      var fonts = D.createElement('link'); fonts.rel = 'stylesheet'; fonts.href = W.HX_AGENT_FONTS || ''; if (fonts.href) D.head.appendChild(fonts);
      var css = D.createElement('link'); css.rel = 'stylesheet'; css.href = '/assets/agents/stage.css'; D.head.appendChild(css);
      load('/assets/agents/stage.js', function () { load('/assets/agents/styles-data.js', start); });
    }, { rootMargin: '300px 0px' });
    io.observe(aiWrap);
  }
  function load(src, cb) { var s = D.createElement('script'); s.src = src; s.onload = cb; D.head.appendChild(s); }
  function start() {
    var H = W.HXStage, LS = W.HX_STYLES || []; if (!H || !LS.length) return;
    var by2 = {}; LS.forEach(function (s) { by2[s.id] = s; });
    var LOOP = ['theatre', 'neon', 'glass', 'mission', 'deco', 'particles', 'kinetic', 'industrial', 'holo', 'liquid'].filter(function (x) { return by2[x]; });
    var i = 0;
    function now() { var s = by2[LOOP[i]]; aiNow.textContent = s.n + ' · ' + s.name; }
    var st = H.create(LOOP[0], {
      onBeat: function (b, x) { var prev = x.__prev; x.__prev = b; if ((b === 0 && prev === 7) || (b === 4 && prev === 3)) { i = (i + 1) % LOOP.length; x.setLook(LOOP[i]); now(); } }
    });
    aiWrap.appendChild(st.root);
    var fit = function () { st.root.style.transform = 'scale(' + (aiWrap.clientWidth / 960) + ')'; };
    fit(); new ResizeObserver(fit).observe(aiWrap); now();
    new IntersectionObserver(function (es) { st.setVisible(es[0].isIntersecting); }).observe(aiWrap);
  }
})();
