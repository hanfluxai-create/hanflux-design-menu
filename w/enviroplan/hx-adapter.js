/* Mirror adapter: this page scrolls inside #env-scroll (100vh, scroll-snap) instead of the window.
   Expose that container to the embed tour (and QA) as if it were the page scroller. */
(function () {
  var de = document.documentElement;
  function sc() { return document.getElementById('env-scroll'); }
  var q = new URLSearchParams(location.search);
  var embed = q.get('embed') === '1' || window.self !== window.top;
  if (embed) {
    var st = document.createElement('style');
    st.textContent = '#env-scroll{scroll-snap-type:none!important;scroll-behavior:auto!important}';
    document.head.appendChild(st);
  }
  Object.defineProperty(de, 'scrollHeight', { configurable: true, get: function () { var s = sc(); return s ? s.scrollHeight : document.body.scrollHeight; } });
  Object.defineProperty(window, 'scrollY', { configurable: true, get: function () { var s = sc(); return s ? s.scrollTop : 0; } });
  window.scrollTo = function (a, b) {
    var y = typeof a === 'object' && a ? a.top : b; var s = sc();
    if (s && typeof y === 'number') s.scrollTop = y;
  };
  window.__lenis = { scrollTo: function (y) { var s = sc(); if (s) s.scrollTop = y; } };
})();
