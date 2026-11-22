/* Hanflux Design Menu · home: the design rail plays light reels (no live sites), so the page stays fast. */
(function () {
  'use strict';
  var F = window.HXFrames;
  if (F) F.adoptAll('#g-rail [data-stage]', 'reel', { lite: true });
  var more = document.querySelector('[data-checks-all]');
  if (more) more.addEventListener('click', function () { document.getElementById('checks').classList.add('all'); });
})();
