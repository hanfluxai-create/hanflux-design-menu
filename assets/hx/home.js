/* Hanflux Design Menu · home: the design rail plays light reels (no live sites), so the page stays fast. */
(function () {
  'use strict';
  var F = window.HXFrames;
  if (F) F.adoptAll('#g-rail [data-stage]', 'reel', { lite: true });
  // the proof card: a 3D design running live inside a phone, on every screen size
  if (F) F.adoptAll('#wk-stage', 'live', { lite: true });
  var more = document.querySelector('[data-checks-all]');
  if (more) more.addEventListener('click', function () { document.getElementById('checks').classList.add('all'); });
})();
