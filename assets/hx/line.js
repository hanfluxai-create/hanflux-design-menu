/* Hanflux Design Factory · the factory line. One passive scroll listener, one frame callback, transform and opacity only.
   Phones never decode video: the window shows stills that pan and cross-fade. Laptops scrub the film with the scroll. */
(function () {
  'use strict';
  var W = window, D = document, R = D.documentElement;
  var line = D.getElementById('line'); if (!line) return;
  var mq = W.matchMedia ? W.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  if (mq.matches || !R.classList.contains('ln-js')) return;

  var chs = [].slice.call(line.querySelectorAll('.ln-ch')), stops = [].slice.call(line.querySelectorAll('.ln-stop'));
  var bar = line.querySelector('.ln-bar'), media = line.querySelector('.ln-media');
  var frames = [].slice.call(line.querySelectorAll('.ln-f')), pans = media ? [].slice.call(media.children) : [];
  var tagN = line.querySelector('.ln-tag-n'), tagT = line.querySelector('.ln-tag-t');
  var NAMES = ['Your brief', 'Design', 'Build', '12 checks', 'Live'], N = chs.length;
  var film = line.querySelector('video.ln-film'), filmOn = false, filmT = 0;
  var top = 0, span = 1, cur = -1, p = 0, shown = -1, tick = 0, inside = null;

  function measure() { var r = line.getBoundingClientRect(); top = r.top + W.scrollY; span = Math.max(1, r.height - W.innerHeight); }
  function setCh(i) {
    if (i === cur) return;
    for (var k = 0; k < N; k++) { chs[k].classList.toggle('on', k === i); chs[k].classList.toggle('up', k < i); if (stops[k]) stops[k].classList.toggle('on', k <= i); }
    if (frames.length > 1) { var f = Math.min(frames.length - 1, Math.round(i * (frames.length - 1) / (N - 1))); frames.forEach(function (el, k) { el.classList.toggle('on', k === f); }); }
    if (tagN) tagN.textContent = '0' + (i + 1); if (tagT) tagT.textContent = NAMES[i] || '';
    cur = i;
  }
  function paint() {
    tick = 0;
    var y = W.scrollY - top, q = y / span; if (q < 0) q = 0; else if (q > 1) q = 1;
    var now = y > -W.innerHeight * 0.5 && y < span + W.innerHeight * 0.35;
    if (now !== inside) { inside = now; R.classList.toggle('ln-in', now && y < span); }
    if (!now && shown === q) return;
    p = q; shown = q;
    setCh(Math.min(N - 1, Math.floor(q * N + 0.02)));
    if (bar) bar.style.transform = 'scaleX(' + (0.04 + q * 0.96).toFixed(4) + ')';
    if (!filmOn) { var x = (6 - q * 12).toFixed(3), s = (1.02 + q * 0.06).toFixed(4); for (var k = 0; k < pans.length; k++) if (pans[k] !== film) pans[k].style.transform = 'translate3d(' + x + '%,0,0) scale(' + s + ')'; }
  }
  function onScroll() { if (!tick) tick = requestAnimationFrame(paint); }

  stops.forEach(function (b, i) { b.addEventListener('click', function () { measure(); W.scrollTo({ top: Math.round(top + span * (i / N) + (i ? span / N * 0.12 : 0)), behavior: 'smooth' }); }); });
  W.addEventListener('scroll', onScroll, { passive: true });
  W.addEventListener('resize', function () { measure(); onScroll(); }, { passive: true });
  W.addEventListener('load', function () { measure(); onScroll(); });
  measure(); paint();

  // the film: laptops only, never on data saver, fetched whole so every seek is instant
  var conn = navigator.connection || {};
  var roomy = W.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)').matches && !conn.saveData && !/(^|-)2g$/.test(conn.effectiveType || '');
  if (film && roomy && film.getAttribute('data-src') && W.fetch && W.URL) {
    var start = function () {
      fetch(film.getAttribute('data-src')).then(function (r) { if (!r.ok) throw 0; return r.blob(); }).then(function (b) {
        film.src = URL.createObjectURL(b); film.muted = true; film.playsInline = true; film.load();
        film.addEventListener('loadeddata', function () {
          var d = film.duration || 0; if (!d || !isFinite(d)) return;
          filmOn = true; filmT = p * (d - 0.05); try { film.currentTime = filmT; } catch (e) {}
          film.classList.add('ready');
          (function loop() {
            var want = p * (d - 0.05); filmT += (want - filmT) * 0.16;
            if (inside && !film.seeking && Math.abs(film.currentTime - filmT) > 0.03) { try { film.currentTime = filmT; } catch (e) {} }
            requestAnimationFrame(loop);
          })();
        }, { once: true });
      }).catch(function () {});
    };
    if (D.readyState === 'complete') setTimeout(start, 600); else W.addEventListener('load', function () { setTimeout(start, 600); });
  }
})();
