/* Hanflux Design Menu · the signal bloom.
   The circuit traces that radiate from the lotus on the Capabilities Brief, drawn live on a 2D canvas:
   they grow out on load, carry signals to their nodes, lean toward the pointer and rest when off screen.

   <canvas class="bloom" data-bloom data-anchor=".lotus">            full bloom around an element
   <canvas class="bloom" data-bloom data-cx=".8" data-cy="1.05" data-a0="180" data-a1="360" data-tone="dark">   a fan
   Options (data-*): anchor, cx, cy (fractions of the canvas), rx, ry (outer radii, fractions of width / height),
   ri (inner radius in px), a0, a1 (degrees), n (traces), seed, tone (light | dark), scroll (1: retract while leaving),
   still (1: draw the finished bloom once, no motion). */
(function () {
  'use strict';
  var W = window, D = document;
  var reduce = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = W.matchMedia && W.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TAU = Math.PI * 2;
  var LIGHT = [[0, '#1587bd'], [.22, '#1e4c86'], [.4, '#293a77'], [.55, '#653080'], [.68, '#a23e8c'], [.8, '#d75088'], [.92, '#ec7847'], [1, '#f88e23']];
  var DARK = [[0, '#3db8ee'], [.22, '#5b93ee'], [.4, '#8583f5'], [.55, '#b074ea'], [.68, '#dd6ac6'], [.8, '#f56ea4'], [.92, '#ff9461'], [1, '#ffab45']];

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function outExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function outBack(t) { var c = 2.2, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; }
  function ell(rx, ry, c, s) { return (rx * ry) / Math.sqrt(ry * ry * c * c + rx * rx * s * s); }
  function wrap(a) { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; }

  var all = [], px = -1e5, py = -1e5, pointerAt = 0;
  if (fine) W.addEventListener('pointermove', function (e) { px = e.clientX; py = e.clientY; pointerAt = performance.now(); }, { passive: true });

  function Bloom(cv) {
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var o = cv.dataset, dark = o.tone === 'dark';
    var anchor = o.anchor ? (cv.parentNode.querySelector(o.anchor) || D.querySelector(o.anchor)) : null;
    var A0 = (+(o.a0 || 0)) * Math.PI / 180, A1 = (+(o.a1 || 360)) * Math.PI / 180;
    var full = Math.abs(A1 - A0) >= TAU - .001;
    var N = +(o.n || 84), rand = rng(+(o.seed || 11));
    var retract = o.scroll === '1', still = reduce || o.still === '1';
    var paper = dark ? '#1a1b45' : '#ffffff';
    var T = [], i;
    for (i = 0; i < N; i++) {
      var f = full ? i / N : i / (N - 1), step = (A1 - A0) / N;
      var L = .36 + .64 * Math.pow(rand(), .8);
      if (i % 4 === 0) L = Math.max(L, .84 + rand() * .16);
      if (i % 4 === 2) L = Math.min(L, .46 + rand() * .22);
      var jog = rand() < .78;
      T.push({
        th: A0 + (A1 - A0) * f + (rand() - .5) * step * .62,
        L: L, g: 1 + rand() * .16,
        a: .12 + rand() * .36, phi: jog ? (rand() < .5 ? -1 : 1) * (.5 + rand() * .36) : 0, j: .07 + rand() * .09,
        ph: rand() * TAU, nr: .86 + rand() * .32, born: rand() * .34, ex: 0, cool: 0,
        p: new Float32Array(8), len: new Float32Array(4), n: 2, tot: 0, ux: 0, uy: 0
      });
    }
    var w = 0, h = 0, dpr = 1, cx = 0, cy = 0, rxi = 0, ryi = 0, rxo = 0, ryo = 0, lw = 1.1, nodeR = 3.2, grad = null, k = 1;
    var pulses = [], pings = [], queue = [], t0 = 0, last = 0, raf = 0, visible = false, started = false, nextWave = 0, nextRand = 0;
    var parX = 0, parY = 0, cache = null, cacheOk = false, anyEx = false;

    function layout() {
      var r = cv.getBoundingClientRect();
      w = Math.max(2, r.width); h = Math.max(2, r.height);
      dpr = Math.min(W.devicePixelRatio || 1, 2);
      var bw = Math.round(w * dpr), bh = Math.round(h * dpr);
      if (cv.width !== bw || cv.height !== bh) { cv.width = bw; cv.height = bh; }
      if (anchor) {
        var a = anchor.getBoundingClientRect();
        var aw = anchor.offsetWidth || a.width, ah = anchor.offsetHeight || a.height;
        cx = a.left + a.width / 2 - r.left; cy = a.top + a.height / 2 - r.top;
        // the anchor floats a few pixels: lock the centre to its resting place
        if (anchor.offsetParent) { var pr = anchor.offsetParent.getBoundingClientRect(); cx = pr.left + anchor.offsetLeft + aw / 2 - r.left; cy = pr.top + anchor.offsetTop + ah / 2 - r.top; }
        rxi = aw * .69; ryi = ah * .76;
        ryo = o.ry ? +o.ry * h : Math.min(cy, h - cy) - 10;
        rxo = o.rx ? +o.rx * w : Math.min(Math.min(cx, w - cx) - 12, ryo * (w > 900 ? 1.52 : 1.3));
        if (o.rx && !o.ry) ryo = Math.min(ryo, rxo / 1.2);
      } else {
        cx = +(o.cx || .5) * w; cy = +(o.cy || .5) * h;
        rxi = ryi = +(o.ri || 40);
        rxo = +(o.rx || .5) * w; ryo = +(o.ry || .5) * h;
      }
      rxo = Math.max(rxo, rxi + 30); ryo = Math.max(ryo, ryi + 30);
      k = clamp(Math.min(rxo, ryo * 1.2) / 240, .72, 1.25);
      lw = (dark ? 1.15 : 1.1) * (k < .9 ? .92 : 1); nodeR = 3.3 * clamp(k, .8, 1.1);
      grad = ctx.createLinearGradient(cx - rxo, 0, cx + rxo, 0);
      (dark ? DARK : LIGHT).forEach(function (s) { grad.addColorStop(s[0], s[1]); });
      cacheOk = false;
    }

    function build() {
      for (var i = 0; i < N; i++) {
        var tr = T[i], th = tr.th, c = Math.cos(th), s = Math.sin(th);
        var Ri = ell(rxi, ryi, c, s) * tr.g, Ro = ell(rxo, ryo, c, s);
        var len = Math.max(10, (Ro - Ri) * tr.L * (1 + .07 * tr.ex));
        var x0 = cx + c * Ri, y0 = cy + s * Ri, p = tr.p;
        tr.ux = c; tr.uy = s;
        p[0] = x0; p[1] = y0;
        if (tr.phi) {
          var l1 = len * tr.a, l2 = len * tr.j, cp = Math.cos(tr.phi), sp = Math.sin(tr.phi);
          var vx = c * cp - s * sp, vy = s * cp + c * sp;
          var l3 = Math.max(4, len - l1 - l2 * cp);
          p[2] = x0 + c * l1; p[3] = y0 + s * l1;
          p[4] = p[2] + vx * l2; p[5] = p[3] + vy * l2;
          p[6] = p[4] + c * l3; p[7] = p[5] + s * l3;
          tr.len[0] = l1; tr.len[1] = l2; tr.len[2] = l3; tr.n = 4; tr.tot = l1 + l2 + l3;
        } else {
          p[2] = x0 + c * len; p[3] = y0 + s * len;
          tr.len[0] = len; tr.n = 2; tr.tot = len;
        }
        // pointer parallax: the tips travel further than the roots
        if (parX || parY) {
          for (var q = 0; q < tr.n; q++) {
            var dx = p[q * 2] - cx, dy = p[q * 2 + 1] - cy, d = Math.sqrt(dx * dx + dy * dy) / Math.max(rxo, 1);
            p[q * 2] += parX * (.25 + d); p[q * 2 + 1] += parY * (.25 + d);
          }
        }
      }
    }
    // add the stretch [a, b] (in px along the trace) to the current path
    function seg(tr, a, b) {
      if (b <= a) return;
      var p = tr.p, acc = 0, begun = false;
      for (var q = 0; q < tr.n - 1; q++) {
        var l = tr.len[q], s0 = acc, s1 = acc + l; acc = s1;
        if (s1 < a) continue;
        if (s0 > b) break;
        var x0 = p[q * 2], y0 = p[q * 2 + 1], x1 = p[q * 2 + 2], y1 = p[q * 2 + 3];
        var f0 = clamp((a - s0) / l, 0, 1), f1 = clamp((b - s0) / l, 0, 1);
        if (!begun) { ctx.moveTo(x0 + (x1 - x0) * f0, y0 + (y1 - y0) * f0); begun = true; }
        ctx.lineTo(x0 + (x1 - x0) * f1, y0 + (y1 - y0) * f1);
      }
    }
    function at(tr, d, out) {
      var p = tr.p, acc = 0;
      for (var q = 0; q < tr.n - 1; q++) {
        var l = tr.len[q];
        if (d <= acc + l || q === tr.n - 2) { var f = clamp((d - acc) / l, 0, 1); out[0] = p[q * 2] + (p[q * 2 + 2] - p[q * 2]) * f; out[1] = p[q * 2 + 1] + (p[q * 2 + 3] - p[q * 2 + 1]) * f; return; }
        acc += l;
      }
    }
    function emit(i, inward) { if (pulses.length < 60) pulses.push({ i: i, d: 0, v: 150 + Math.random() * 130, inw: !!inward, len: 20 + Math.random() * 22 }); }
    function wave(now, from) {
      var a0 = from == null ? Math.random() * TAU : from;
      for (var i = 0; i < N; i++) if (i % 3 === 0 || Math.random() < .12) queue.push({ i: i, at: now + Math.abs(wrap(T[i].th - a0)) * 420 + Math.random() * 120 });
    }
    // traces, their nodes and the pointer response
    function paintBloom(c, intro, now, dt, out, near, pa, pd) {
      var i, tr, g, any = false;
      c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = grad; c.fillStyle = paper;
      c.lineWidth = lw; c.beginPath();
      var keep = ctx; ctx = c;
      for (i = 0; i < N; i++) {
        tr = T[i]; g = outExpo(clamp((intro - .15 - tr.born) / 1.25, 0, 1));
        tr.grow = g;
        if (g > 0) seg(tr, 0, tr.tot * g);
        var target = 0;
        if (near && pd > .12 && pd < 1.5) { var da = Math.abs(wrap(Math.atan2(tr.uy / ryo, tr.ux / rxo) - pa)); if (da < .34) target = Math.pow(1 - da / .34, 1.5); }
        var before = tr.ex; tr.ex += (target - tr.ex) * Math.min(1, dt * (target > tr.ex ? 9 : 3.2));
        if (tr.ex < .002) tr.ex = 0; else any = true;
        if (g >= 1 && before < .55 && tr.ex >= .55 && now > tr.cool) { tr.cool = now + 900; emit(i); }
      }
      c.stroke();
      // excited traces glow a little heavier
      for (i = 0; i < N; i++) { tr = T[i]; if (tr.ex > .02 && tr.grow >= 1) { c.globalAlpha = (1 - out) * tr.ex * .85; c.lineWidth = lw + 1; c.beginPath(); seg(tr, 0, tr.tot); c.stroke(); } }
      c.globalAlpha = 1 - out;
      // nodes
      c.lineWidth = lw; c.beginPath();
      for (i = 0; i < N; i++) {
        tr = T[i]; var ns = still ? 1 : clamp((intro - 1.05 - tr.born) / .5, 0, 1); if (ns <= 0) { tr.rr = 0; continue; }
        var rr = nodeR * tr.nr * outBack(ns) * (1 + tr.ex * .35), e = (tr.n - 1) * 2;
        tr.nx = tr.p[e] + tr.ux * rr; tr.ny = tr.p[e + 1] + tr.uy * rr; tr.rr = rr;
        c.moveTo(tr.nx + rr, tr.ny); c.arc(tr.nx, tr.ny, rr, 0, TAU);
      }
      c.fill(); c.stroke();
      // nodes under the pointer fill with colour
      c.fillStyle = grad;
      for (i = 0; i < N; i++) { tr = T[i]; if (tr.ex > .03 && tr.rr) { c.globalAlpha = (1 - out) * tr.ex; c.beginPath(); c.arc(tr.nx, tr.ny, tr.rr * .55, 0, TAU); c.fill(); } }
      c.globalAlpha = 1 - out;
      ctx = keep; anyEx = any;
    }
    function paintCache() {
      if (!cache) cache = D.createElement('canvas');
      if (cache.width !== cv.width || cache.height !== cv.height) { cache.width = cv.width; cache.height = cv.height; }
      var c = cache.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h); c.globalAlpha = 1;
      for (var i = 0; i < N; i++) T[i].ex = 0;
      build();
      paintBloom(c, 9, 0, 0, 0, false, 0, 0);
      cacheOk = true;
    }
    var tmp = [0, 0];

    function frame(now) {
      raf = 0;
      if (!visible || D.hidden) return;
      if (!started) { started = true; t0 = now; last = now; nextWave = now + 3200; nextRand = now + 1900; }
      var dt = Math.min(64, now - last) / 1000; last = now;
      var t = (now - t0) / 1000;
      var r = cv.getBoundingClientRect();
      var out = retract ? clamp(-r.top / Math.max(1, r.height * .9), 0, 1) : 0;

      // pointer: parallax and excitement
      var lx = px - r.left, ly = py - r.top, near = fine && now - pointerAt < 4000 && lx > -80 && ly > -80 && lx < w + 80 && ly < h + 80;
      var tx = 0, ty = 0, pa = 0, pd = 0;
      if (near) {
        tx = clamp((lx - cx) / Math.max(rxo, 1), -1.4, 1.4) * -7; ty = clamp((ly - cy) / Math.max(ryo, 1), -1.4, 1.4) * -6;
        pa = Math.atan2((ly - cy) / ryo, (lx - cx) / rxo); pd = Math.sqrt(Math.pow((lx - cx) / rxo, 2) + Math.pow((ly - cy) / ryo, 2));
      }
      parX += (tx - parX) * Math.min(1, dt * 4); parY += (ty - parY) * Math.min(1, dt * 4);
      if (Math.abs(parX) < .01 && !tx) parX = 0; if (Math.abs(parY) < .01 && !ty) parY = 0;

      var i, tr, g, intro = still ? 9 : t;
      var moving = intro < 2.3 || near || parX !== 0 || parY !== 0 || anyEx || still;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1 - out;
      if (!moving) {
        // at rest: the grown bloom is one cached picture, only the signals are drawn each frame
        if (!cacheOk) paintCache();
        ctx.drawImage(cache, 0, 0, w, h);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = grad;
      } else {
        build();
        paintBloom(ctx, intro, now, dt, out, near, pa, pd);
      }

      if (!still && intro > 1.7) {
        // schedule signals
        if (now > nextRand) { nextRand = now + 420 + Math.random() * 700; emit(Math.floor(Math.random() * N), Math.random() < .22); }
        if (now > nextWave) { nextWave = now + 7600 + Math.random() * 3000; wave(now); }
        for (i = queue.length - 1; i >= 0; i--) if (now >= queue[i].at) { emit(queue[i].i); queue.splice(i, 1); }
        // signals: a short bright dash that runs the trace (one path for the halo, one for the core, one for the heads)
        if (dark) ctx.globalCompositeOperation = 'lighter';
        for (i = pulses.length - 1; i >= 0; i--) {
          var pu = pulses[i]; tr = T[pu.i]; pu.d += pu.v * dt;
          if (pu.d - pu.len > tr.tot) { pulses.splice(i, 1); if (!pu.inw) pings.push({ i: pu.i, t: now }); continue; }
          var head = pu.inw ? tr.tot - pu.d : pu.d, tail = pu.inw ? head + pu.len : head - pu.len;
          pu.a = clamp(Math.min(head, tail), 0, tr.tot); pu.b = clamp(Math.max(head, tail), 0, tr.tot); pu.h = clamp(head, 0, tr.tot);
        }
        if (pulses.length) {
          ctx.beginPath(); for (i = 0; i < pulses.length; i++) { pu = pulses[i]; if (pu.b - pu.a >= .5) seg(T[pu.i], pu.a, pu.b); }
          ctx.globalAlpha = (1 - out) * (dark ? .22 : .16); ctx.lineWidth = lw + 5; ctx.stroke();
          ctx.globalAlpha = 1 - out; ctx.lineWidth = lw + 1.3; ctx.stroke();
          ctx.fillStyle = grad; ctx.beginPath();
          for (i = 0; i < pulses.length; i++) { pu = pulses[i]; if (pu.b - pu.a < .5) continue; at(T[pu.i], pu.h, tmp); ctx.moveTo(tmp[0] + lw + 1.1, tmp[1]); ctx.arc(tmp[0], tmp[1], lw + 1.1, 0, TAU); }
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        // a node answers when its signal lands
        for (i = pings.length - 1; i >= 0; i--) {
          var pg = pings[i], u = (now - pg.t) / 800; tr = T[pg.i];
          if (u >= 1 || !tr.rr) { pings.splice(i, 1); continue; }
          var eo = 1 - Math.pow(1 - u, 3);
          ctx.globalAlpha = (1 - out) * (1 - u) * .55; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(tr.nx, tr.ny, tr.rr + eo * 7, 0, TAU); ctx.stroke();
          ctx.globalAlpha = (1 - out) * Math.max(0, 1 - u * 2.2); ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(tr.nx, tr.ny, tr.rr * .62, 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      if (!cv.__on) { cv.__on = true; cv.classList.add('on'); }
      if (!still) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && visible && !D.hidden) raf = requestAnimationFrame(frame); }

    layout();
    if ('ResizeObserver' in W) { var ro = new ResizeObserver(function () { layout(); kick(); }); ro.observe(cv); if (anchor) ro.observe(anchor); }
    else W.addEventListener('resize', function () { layout(); kick(); });
    if (anchor && anchor.tagName === 'IMG' && !anchor.complete) anchor.addEventListener('load', function () { layout(); kick(); });
    if ('IntersectionObserver' in W) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) { last = performance.now(); kick(); } }, { rootMargin: '80px 0px' }).observe(cv);
    else { visible = true; kick(); }
    D.addEventListener('visibilitychange', function () { if (!D.hidden) { last = performance.now(); kick(); } });
    this.wave = function (from) { if (started && !still) wave(performance.now(), from); };
  }

  function init() {
    Array.prototype.forEach.call(D.querySelectorAll('canvas[data-bloom]'), function (cv) { try { all.push(new Bloom(cv)); } catch (e) {} });
    // primary calls to action send a wave through the bloom
    if (fine) Array.prototype.forEach.call(D.querySelectorAll('[data-bloom-wave]'), function (b) {
      var lastT = 0;
      b.addEventListener('pointerenter', function () { var n = performance.now(); if (n - lastT < 1600) return; lastT = n; all.forEach(function (x) { if (x.wave) x.wave(Math.PI / 2); }); });
    });
  }
  W.HXBloom = { wave: function () { all.forEach(function (x) { if (x.wave) x.wave(); }); } };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();
