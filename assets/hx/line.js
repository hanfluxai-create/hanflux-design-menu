/* Hanflux Design Factory · the factory film. The scroll plays a film frame by frame on a canvas.
   No <video> anywhere, so iPhone Low Power Mode, data saver and autoplay rules cannot stop it.
   One passive scroll listener; frames load coarse-to-fine so scrubbing works after the first few arrive. */
(function () {
  'use strict';
  var W = window, D = document, R = D.documentElement;
  var line = D.getElementById('line'); if (!line) return;
  var mq = W.matchMedia ? W.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  if (mq.matches || !R.classList.contains('ln-js')) return;

  var chs = [].slice.call(line.querySelectorAll('.ln-ch')), stops = [].slice.call(line.querySelectorAll('.ln-stop'));
  var bar = line.querySelector('.ln-bar'), tagN = line.querySelector('.ln-tag-n'), tagT = line.querySelector('.ln-tag-t');
  var NAMES = ['Your brief', 'Design', 'Build', '12 checks', 'Live'], N = chs.length;
  var top = 0, span = 1, cur = -1, p = 0, tick = 0, inside = null;

  // ---- film ----
  var film = line.querySelector('.ln-film'), cv = film && film.querySelector('canvas'), ctx = cv && cv.getContext && cv.getContext('2d', { alpha: false });
  var total = film ? +film.getAttribute('data-n') || 0 : 0, imgs = [], ready = [], shownF = -1, pos = 0, raf = 0;
  var portrait = W.matchMedia('(max-width: 899px) and (orientation: portrait)').matches;
  var base = film ? film.getAttribute(portrait ? 'data-m' : 'data-d') : '';
  var conn = navigator.connection || {}, lean = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  function src(i) { var n = String(i + 1); while (n.length < 3) n = '0' + n; return base + n + '.webp'; }
  function nearest(i) { if (ready[i]) return i; for (var d = 1; d < total; d++) { if (i - d >= 0 && ready[i - d]) return i - d; if (i + d < total && ready[i + d]) return i + d; } return -1; }
  function draw(i) {
    var k = nearest(i); if (k < 0 || k === shownF) return; var im = imgs[k];
    if (cv.width !== im.naturalWidth) { cv.width = im.naturalWidth; cv.height = im.naturalHeight; }
    ctx.drawImage(im, 0, 0); shownF = k; if (!cv.classList.contains('on')) cv.classList.add('on');
  }
  function settle() {
    raf = 0; var want = p * (total - 1), d = want - pos;
    pos = Math.abs(d) < 0.4 ? want : pos + d * 0.22;
    draw(Math.round(pos));
    if (pos !== want) raf = requestAnimationFrame(settle);
  }
  function loadFrames() {
    if (!ctx || !total || !base) return;
    var order = [], seen = {}, steps = lean ? [8] : [16, 8, 4, 2, 1];
    steps.forEach(function (s) { for (var i = 0; i < total; i += s) if (!seen[i]) { seen[i] = 1; order.push(i); } });
    if (!seen[total - 1]) order.push(total - 1);
    var at = 0, live = 0, MAX = 4;
    (function next() {
      while (live < MAX && at < order.length) (function (i) {
        live++; var im = new Image(); im.decoding = 'async';
        im.onload = function () { imgs[i] = im; ready[i] = 1; live--; if (!raf) raf = requestAnimationFrame(settle); if (Math.abs(i - Math.round(pos)) < 3) shownF = -1; next(); };
        im.onerror = function () { live--; next(); };
        im.src = src(i);
      })(order[at++]);
    })();
  }

  // ---- stations ----
  function measure() { var r = line.getBoundingClientRect(); top = r.top + W.scrollY; span = Math.max(1, r.height - W.innerHeight); }
  function setCh(i) {
    if (i === cur) return;
    for (var k = 0; k < N; k++) { chs[k].classList.toggle('on', k === i); chs[k].classList.toggle('up', k < i); if (stops[k]) stops[k].classList.toggle('on', k <= i); }
    if (tagN) tagN.textContent = '0' + (i + 1); if (tagT) tagT.textContent = NAMES[i] || '';
    cur = i;
  }
  function paint() {
    tick = 0;
    var y = W.scrollY - top, q = y / span; if (q < 0) q = 0; else if (q > 1) q = 1;
    var now = y > -W.innerHeight * 0.5 && y < span + W.innerHeight * 0.35;
    if (now !== inside) { inside = now; R.classList.toggle('ln-in', now && y < span); }
    if (q === p && cur >= 0) return;
    p = q;
    setCh(Math.min(N - 1, Math.floor(q * N + 0.02)));
    if (bar) bar.style.transform = 'scaleX(' + (0.04 + q * 0.96).toFixed(4) + ')';
    if (ctx && !raf) raf = requestAnimationFrame(settle);
  }
  function onScroll() { if (!tick) tick = requestAnimationFrame(paint); }

  stops.forEach(function (b, i) { b.addEventListener('click', function () { measure(); W.scrollTo({ top: Math.round(top + span * (i / N) + (i ? span / N * 0.12 : 0)), behavior: 'smooth' }); }); });
  W.addEventListener('scroll', onScroll, { passive: true });
  W.addEventListener('resize', function () { measure(); p = -1; onScroll(); }, { passive: true });
  W.addEventListener('load', function () { measure(); p = -1; onScroll(); });
  measure(); paint();
  if (D.readyState === 'complete') loadFrames(); else W.addEventListener('load', function () { setTimeout(loadFrames, 150); });
})();
