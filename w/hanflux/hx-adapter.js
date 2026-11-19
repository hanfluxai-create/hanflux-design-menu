/* Mirror adapter: the site's Lenis build leaves window.lenis as a plain info object (no scrollTo).
   Give the embed runtime / QA a working scrollTo that drives the native window scroll. */
(function () {
  var real = null;
  var shim = {
    scrollTo: function (y) { window.scrollTo(0, typeof y === 'number' ? y : 0); },
    get __real() { return real; }
  };
  var cur = window.lenis;
  Object.defineProperty(window, 'lenis', {
    configurable: true,
    get: function () { return cur; },
    set: function (v) { cur = v; if (cur && typeof cur === 'object' && typeof cur.scrollTo !== 'function') cur.scrollTo = shim.scrollTo; }
  });
  window.lenis = cur || {};
})();
