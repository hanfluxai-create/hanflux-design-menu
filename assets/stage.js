/* Hanflux Director Mode stage engine. One choreography, 25 looks. No dependencies.
   Beats: 0 listen, 1 speak, 2 open projects, 3 point, 4 listen, 5 speak, 6 open settings, 7 point. */
(function () {
  'use strict';

  var BRAND = 'Aurora';
  var LOOKS = ['persona', 'theatre', 'mission', 'industrial', 'editorial', 'particles', 'liquid', 'holo', 'neon', 'wireframe',
    'glass', 'kinetic', 'iso', 'clay', 'ascii', 'mesh', 'comic', 'flap', 'vhs', 'halftone', 'bauhaus', 'pixel', 'blueprint', 'deco', 'brutal'];
  var D = [1500, 1700, 1000, 3300, 1500, 1500, 1000, 3000];
  var LOOP = D.reduce(function (a, b) { return a + b; }, 0);
  var T0 = Date.now();

  var CAP = [
    ['You', 'What needs my attention?'],
    [BRAND, 'One draft is ready for you. Let me show you.'],
    [BRAND, 'Your projects.'],
    [BRAND, 'Website Redesign. The new homepage passed review. Say approve it.'],
    ['You', 'Keep your answers shorter.'],
    [BRAND, 'Done. Here’s where that lives.'],
    [BRAND, 'Settings, conversation.'],
    [BRAND, 'Response length. Now short.']
  ];
  var PROJECTS = [
    { name: 'Support Agent', meta: 'live · 24/7 · voice', s: '214 chats answered today', pct: 70 },
    { name: 'Website Redesign', meta: 'draft · needs review', s: 'Draft ready · review passed', pct: 100, tg: 1 },
    { name: 'Lead Gen Engine', meta: 'running · outbound', s: 'Running · phase 2 of 4', pct: 50 },
    { name: 'Invoice Automation', meta: 'queued · finance', s: 'Queued · starts in 20s', pct: 12 },
    { name: 'Sales Dashboard', meta: 'running · analytics', s: 'Syncing data', pct: 82 },
    { name: 'New project', meta: 'add', s: 'Say: start a project', pct: 0, gh: 1 }
  ];
  var SETTINGS = [
    { k: 'Audio', t: 'Voice', v: 'Aria' },
    { k: 'Microphone', t: 'Hands-free', v: 'On', tog: 'y' },
    { k: 'Answers', t: 'Response length', v: 'Medium', tg: 1 },
    { k: 'Timing', t: 'Reply delay', v: '0.9 s' },
    { k: 'Microphone', t: 'Interruptions', v: 'On', tog: 'y' }
  ];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function rep(n, f) { var s = ''; for (var i = 1; i <= n; i++) s += f(i); return s; }

  function markup() {
    var cards = PROJECTS.map(function (p) {
      return '<div class="it card' + (p.tg ? ' tg' : '') + (p.gh ? ' ghost' : '') + '"><span class="t">' + esc(p.name) + '</span><span class="m">' + esc(p.meta) +
        '</span><span class="s">' + esc(p.s) + '</span><span class="bar"><i style="width:' + p.pct + '%"></i></span></div>';
    }).join('');
    var rows = SETTINGS.map(function (r) {
      return '<div class="it row' + (r.tg ? ' tg' : '') + '"><span class="m">' + esc(r.k) + '</span><span class="t">' + esc(r.t) + '</span><span class="v"' +
        (r.tg ? ' data-v' : '') + '>' + esc(r.v) + '</span><span class="tog ' + (r.tog || 'n') + '"></span></div>';
    }).join('');
    return '<div class="hx" aria-hidden="true">' +
      '<div class="bg"></div><div class="bg2"></div>' +
      '<div class="deco">' + rep(8, function (i) { return '<i class="d' + i + '"></i>'; }) + '</div>' +
      '<div class="hud"><span class="brand">' + BRAND.toUpperCase() + '</span><span class="amb"><span><i class="gd"></i>2 running</span><em>1 needs you</em><span>Usage 42%</span></span></div>' +
      '<div class="panel"><div class="ph"><span class="pt" data-pt></span><span class="pm" data-pm></span></div><div class="grid">' + cards + '</div><div class="list">' + rows + '</div></div>' +
      '<div class="spot" data-spot></div><div class="hl" data-hl></div>' +
      '<svg class="lead" viewBox="0 0 960 540"><path data-lead d="M0 0"></path></svg>' +
      '<div class="face"><div class="fx">' + rep(10, function (i) { return '<i class="f' + i + '"></i>'; }) +
      '<div class="dots" data-dots></div><div class="word" data-word></div><pre class="asc" data-asc></pre></div></div>' +
      '<div class="ptr" data-ptr><i class="p1"></i><i class="p2"></i><i class="p3"></i><b class="pl" data-pl></b></div>' +
      '<div class="cap"><span class="who" data-who></span><span class="say" data-say></span></div>' +
      '</div>';
  }

  var dotCache = {};
  function dotsHTML(look) {
    if (dotCache[look] !== undefined) return dotCache[look];
    var out = [], i, r, c;
    function dot(cls, st) { out.push('<i class="' + cls + '" style="' + st + '"></i>'); }
    if (look === 'particles') {
      var N = 170;
      for (i = 0; i < N; i++) {
        var y = 1 - 2 * (i + 0.5) / N, rr = Math.sqrt(1 - y * y), th = i * 2.39996;
        var x = Math.cos(th) * rr, z = Math.sin(th) * rr;
        dot('p', 'transform:rotateY(' + (Math.atan2(x, z) * 57.2958).toFixed(1) + 'deg) rotateX(' + (-Math.asin(y) * 57.2958).toFixed(1) +
          'deg) translateZ(84px);animation-delay:-' + ((i * 0.37) % 3).toFixed(2) + 's');
      }
    } else if (look === 'wireframe') {
      for (i = 0; i < 6; i++) dot('mer', 'transform:rotateY(' + (i * 30) + 'deg)');
      [-60, -32, 0, 32, 60].forEach(function (h) {
        var rad = Math.sqrt(84 * 84 - h * h);
        dot('par', 'width:' + (2 * rad).toFixed(1) + 'px;height:' + (2 * rad).toFixed(1) + 'px;margin:-' + rad.toFixed(1) + 'px 0 0 -' + rad.toFixed(1) +
          'px;transform:rotateX(90deg) translateZ(' + h + 'px)');
      });
    } else if (look === 'halftone') {
      var L = [-0.5, -0.62, 0.6], ln = Math.sqrt(L[0] * L[0] + L[1] * L[1] + L[2] * L[2]);
      for (r = 0; r < 21; r++) for (c = 0; c < 21; c++) {
        var dx = (c - 10) * 9, dy = (r - 10) * 9, d = Math.sqrt(dx * dx + dy * dy);
        if (d > 92) continue;
        var nx = dx / 92, ny = dy / 92, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        var sh = Math.max(0, (nx * L[0] + ny * L[1] + nz * L[2]) / ln), s = 1.6 + 7.4 * (1 - sh);
        dot('h', 'left:' + (100 + dx - s / 2).toFixed(1) + 'px;top:' + (100 + dy - s / 2).toFixed(1) + 'px;width:' + s.toFixed(1) + 'px;height:' + s.toFixed(1) +
          'px;animation-delay:' + (d / 92 * 0.7).toFixed(2) + 's');
      }
    } else if (look === 'industrial') {
      for (r = 0; r < 13; r++) for (c = 0; c < 13; c++) {
        var ex = c - 6, ey = r - 6;
        if (ex * ex + ey * ey > 40) continue;
        var cls = 'led';
        if ((r === 4 || r === 5) && (c === 4 || c === 8)) cls = 'led on';
        if ((r === 8 || r === 9) && c >= 3 && c <= 9) cls = 'led mo';
        dot(cls, 'left:' + (100 + ex * 13 - 4) + 'px;top:' + (100 + ey * 13 - 4) + 'px;animation-delay:' + (Math.abs(ex) * 0.09 + (r === 9 ? 0.05 : 0)).toFixed(2) + 's');
      }
    } else if (look === 'pixel') {
      var M = ['.......aa.......', '.......aa.......', '...hhhhhhhhhh...', '..hhhhhhhhhhhh..', '.hhhhhhhhhhhhhh.', '.hheeehhhheeehh.', '.hhepehhhhepehh.',
        '.hheeehhhheeehh.', '.hhhhhhhhhhhhhh.', '.hchhhhhhhhhhch.', '.hhhhmmmmmmhhhh.', '.hhhhhmmmmhhhhh.', '..hhhhhhhhhhhh..', '...hhhhhhhhhh...'];
      for (r = 0; r < M.length; r++) for (c = 0; c < 16; c++) {
        var ch = M[r].charAt(c);
        if (ch !== '.') dot('x' + ch, 'left:' + (20 + c * 10) + 'px;top:' + (26 + r * 10) + 'px');
      }
    }
    dotCache[look] = out.join('');
    return dotCache[look];
  }

  function pad7(s) { s = s.toUpperCase().slice(0, 7); while (s.length < 7) s += ' '; return s; }
  function flapWord(b) {
    if (b === 0 || b === 4) return 'LISTEN ';
    if (b === 3 || b === 7) return 'POINT  ';
    if (b === 2 || b === 6) return 'SCENE  ';
    return 'SPEAKS ';
  }
  function wordHTML(look) {
    var s = '';
    if (look === 'kinetic') {
      var w = BRAND.toUpperCase(), start = 100 - w.length * 14;
      for (var i = 0; i < w.length; i++) s += '<i class="kl" style="left:' + (start + i * 28) + 'px;animation-delay:' + (i * 0.09).toFixed(2) + 's">' + w.charAt(i) + '</i>';
    } else if (look === 'flap') {
      var t = pad7(BRAND) + flapWord(0);
      for (var j = 0; j < 14; j++) {
        var row = j < 7 ? 0 : 1, col = j % 7;
        s += '<i class="fl' + (row ? ' r2' : '') + '" style="left:' + (2 + col * 28) + 'px;top:' + (row ? 104 : 50) + 'px;animation-delay:' + (col * 0.06).toFixed(2) + 's">' + esc(t.charAt(j)) + '</i>';
      }
    }
    return s;
  }

  function asciiFrame(t, spk) {
    var rows = [], a = t * 0.16, amp = spk ? 0.25 + 0.75 * Math.abs(Math.sin(t * 0.9) * Math.sin(t * 0.37 + 1)) : 0.08;
    var ramp = ' .:-=+*#%@', lx = Math.cos(a), lz = Math.sin(a) * 0.6 + 0.8, ly = -0.45, ll = Math.sqrt(lx * lx + ly * ly + lz * lz);
    for (var r = 0; r < 15; r++) {
      var line = '';
      for (var c = 0; c < 34; c++) {
        var x = (c - 16.5) / 16.5, y = (r - 7) / 7, q = x * x + y * y;
        if (q > 1) { line += ' '; continue; }
        var z = Math.sqrt(1 - q), sh = Math.max(0, (x * lx + y * ly + z * lz) / ll);
        var ch = ramp.charAt(Math.min(9, Math.floor(sh * 9.99)));
        if ((Math.pow(x + 0.36, 2) + Math.pow(y + 0.28, 2) * 0.5 < 0.018) || (Math.pow(x - 0.36, 2) + Math.pow(y + 0.28, 2) * 0.5 < 0.018)) ch = ' ';
        if (Math.abs(y - 0.42) < 0.08 + amp * 0.12 && Math.abs(x) < 0.18 + amp * 0.22) ch = Math.abs(y - 0.42) < 0.07 ? ' ' : '_';
        line += ch;
      }
      rows.push(line);
    }
    return rows.join('\n');
  }

  var all = [];

  function Stage(look, opts) {
    opts = opts || {};
    var t = document.createElement('template');
    t.innerHTML = markup();
    this.root = t.content.firstChild;
    var q = this.root.querySelector.bind(this.root);
    this.r = {
      pt: q('[data-pt]'), pm: q('[data-pm]'), spot: q('[data-spot]'), hl: q('[data-hl]'), lead: q('[data-lead]'), ptr: q('[data-ptr]'),
      pl: q('[data-pl]'), who: q('[data-who]'), say: q('[data-say]'), dots: q('[data-dots]'), word: q('[data-word]'), asc: q('[data-asc]'), v: q('[data-v]')
    };
    this.freeze = opts.freeze || 'loop';
    this.offset = opts.offset || 0;
    this.onBeat = opts.onBeat || null;
    this.visible = true;
    this.af = 0;
    this.b = -1;
    this.setLook(look || 'persona');
    all.push(this);
  }
  Stage.prototype.setLook = function (look) {
    this.look = look;
    this.r.dots.innerHTML = dotsHTML(look);
    this.r.word.innerHTML = wordHTML(look);
    this.r.asc.textContent = look === 'ascii' ? asciiFrame(this.af, true) : '';
    this.b = -1;
    this.apply(this.beat());
  };
  Stage.prototype.setFreeze = function (f) { this.freeze = f || 'loop'; this.b = -1; this.apply(this.beat()); };
  Stage.prototype.setVisible = function (v) {
    this.visible = !!v;
    this.root.classList.toggle('paused', !this.visible);
    if (this.visible) { this.b = -1; this.apply(this.beat()); }
  };
  Stage.prototype.beat = function () {
    if (this.freeze === 'face') return 1;
    if (this.freeze === 'scene') return 2;
    if (this.freeze === 'point') return 3;
    var t = ((Date.now() - T0 + this.offset) % LOOP + LOOP) % LOOP, acc = 0;
    for (var i = 0; i < 8; i++) { acc += D[i]; if (t < acc) return i; }
    return 0;
  };
  Stage.prototype.apply = function (b) {
    if (b === this.b) return;
    this.b = b;
    var on = b === 2 || b === 3 || b === 6 || b === 7, pt = b === 3 || b === 7, ls = b === 0 || b === 4, isP = b >= 1 && b <= 4;
    this.root.className = 'hx L-' + this.look + ' b' + b + ' k' + (b % 2) + (on ? ' on' : '') + (pt ? ' pt' : '') + (ls ? ' ls' : ' spk') +
      (isP ? ' sc-p' : ' sc-s') + (this.visible ? '' : ' paused');
    var r = this.r, T = isP ? { x: 480, y: 190 } : { x: 760, y: 256 };
    r.pt.textContent = isP ? 'Projects' : 'Settings';
    r.pm.textContent = isP ? '5 projects · 2 running · 1 needs you' : 'Conversation · Voice';
    r.who.textContent = CAP[b][0];
    r.say.textContent = CAP[b][1];
    r.pl.textContent = isP ? 'Website Redesign' : 'Response length';
    r.v.textContent = (pt && !isP) ? 'Short' : 'Medium';
    r.ptr.style.left = (pt ? T.x : (on ? 90 : 480)) + 'px';
    r.ptr.style.top = (pt ? T.y : (on ? 466 : 250)) + 'px';
    var hl = isP ? [349, 130, 262, 120] : [72, 234, 816, 44];
    r.hl.style.cssText = 'left:' + hl[0] + 'px;top:' + hl[1] + 'px;width:' + hl[2] + 'px;height:' + hl[3] + 'px';
    r.lead.setAttribute('d', isP ? 'M 118 452 C 220 452 300 330 362 252' : 'M 118 452 C 320 452 560 360 640 280');
    r.spot.style.background = 'radial-gradient(circle at ' + T.x + 'px ' + T.y + 'px, transparent var(--s1, 90px), var(--spc, rgba(0,0,0,.85)) var(--s2, 210px))';
    if (this.look === 'flap') {
      var w = flapWord(b), tiles = r.word.children;
      for (var j = 0; j < 7 && tiles[7 + j]; j++) tiles[7 + j].textContent = w.charAt(j);
    }
    if (this.onBeat) this.onBeat(b, this);
  };
  Stage.prototype.tick = function () {
    if (!this.visible || !this.root.isConnected) return;
    this.apply(this.beat());
    if (this.look === 'ascii') {
      this.af++;
      this.r.asc.textContent = asciiFrame(this.af, !(this.b === 0 || this.b === 4));
    }
  };
  Stage.prototype.destroy = function () {
    var i = all.indexOf(this);
    if (i >= 0) all.splice(i, 1);
    if (this.root.parentNode) this.root.parentNode.removeChild(this.root);
  };

  setInterval(function () { for (var i = 0; i < all.length; i++) all[i].tick(); }, 120);

  window.HXStage = {
    BRAND: BRAND, LOOKS: LOOKS, LOOP: LOOP,
    create: function (look, opts) { return new Stage(look, opts); }
  };
})();
