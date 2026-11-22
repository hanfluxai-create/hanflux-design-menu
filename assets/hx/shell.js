/* Hanflux Design Menu · shell: nav, currency, shortlist, quote sheet, sticky bar, toast, reveals. */
(function () {
  'use strict';
  var W = window, D = document, C = W.HX_CONFIG, SITES = W.HX_SITES || [], LOOKS = W.HX_STYLES || [];
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var bySlug = {}; SITES.forEach(function (s, i) { s.i = i; bySlug[s.slug] = s; });
  var byLook = {}; LOOKS.forEach(function (s) { byLook[s.id] = s; });
  var TIER_ORDER = ['essential', 'growth', 'signature', 'flagship'];
  var ICON = {
    x: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" style="stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    wa: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="fill:currentColor;stroke:none"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.9 9.9 0 0 0 12.04 2zm5.8 14.16c-.24.69-1.42 1.32-1.96 1.37-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.61.47.24.56.79 1.92.86 2.06.07.14.11.3.02.48-.09.18-.14.3-.27.46l-.41.48c-.14.14-.28.29-.12.56.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.14.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.58.75 1.85.88.27.14.45.2.52.32.07.11.07.66-.17 1.35z"/></svg>'
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- currency: rupees for India, dollars for everyone else ---------- */
  function cur() { return D.documentElement.classList.contains('cur-usd') ? 'usd' : 'inr'; }
  function money(n, c) {
    var k = (C.currencies || {})[c || cur()] || { symbol: '$', locale: 'en-US' };
    return k.symbol + Math.round(n).toLocaleString(k.locale);
  }
  var OFFER_END = C.offer && C.offer.on ? new Date(C.offer.ends).getTime() : 0;
  function offerOn() { return !!OFFER_END && Date.now() < OFFER_END; }
  function tierPrice(t, c) { var x = C.tiers[t][c || cur()]; return offerOn() ? x.from : (x.was || x.from); }
  function tierRegular(t, c) { var x = C.tiers[t][c || cur()]; return x.was || x.from; }
  function addonPrice(a, c) { return +a[c || cur()] || 0; }
  function minFrom(c) { return Math.min.apply(null, TIER_ORDER.map(function (t) { return tierPrice(t, c); })); }

  /* ---------- shortlist store ---------- */
  var KEY = 'hx-picks-v2';
  var EXS = C.examples || [];
  function isEx(s) { return EXS.indexOf(s) >= 0; }           // our own sites: examples, never for sale
  var AGENTS_ON = /^\/agents\//.test(location.pathname);       // the agent menu is private for now
  var store = { w: [], a: [], add: [], primary: null };
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw) store = Object.assign(store, raw); } catch (e) {}
  store.w = (store.w || []).filter(function (s) { return bySlug[s] && !isEx(s); });
  store.add = (store.add || []).filter(function (id) { return C.addons.some(function (a) { return a.id === id; }); });
  if (isEx(store.primary)) store.primary = null;
  if (!AGENTS_ON) store.a = [];
  var qs = new URLSearchParams(location.search), sharedW = [], sharedA = [];
  (qs.get('w') || '').split(',').forEach(function (s) { s = s.trim(); if (bySlug[s] && !isEx(s)) { sharedW.push(s); if (store.w.indexOf(s) < 0) store.w.push(s); } });
  if (AGENTS_ON) (qs.get('a') || qs.get('pick') || '').split(',').forEach(function (s) { s = s.trim(); if (s && (byLook[s] || /^[a-z-]+$/.test(s))) { sharedA.push(s); if (store.a.indexOf(s) < 0) store.a.push(s); } });
  (qs.get('add') || '').split(',').forEach(function (s) { s = s.trim(); if (s && store.add.indexOf(s) < 0 && C.addons.some(function (a) { return a.id === s; })) store.add.push(s); });
  var listeners = [];
  function emit() { listeners.forEach(function (fn) { try { fn(store); } catch (e) {} }); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} emit(); syncNav(); }
  function toggleIn(list, v) { var i = list.indexOf(v); if (i >= 0) list.splice(i, 1); else list.push(v); return i < 0; }

  function setCur(c) {
    if (c !== 'inr' && c !== 'usd') return;
    var h = D.documentElement; h.classList.remove('cur-inr', 'cur-usd'); h.classList.add('cur-' + c);
    try { localStorage.setItem('hx-cur', c); } catch (e) {}
    syncCur(); emit();
  }
  function syncCur() { var c = cur(); $$('[data-cur]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cur') === c ? 'true' : 'false'); }); }

  var api = W.HXShell = {
    store: store, sites: SITES, bySlug: bySlug, money: money, esc: esc, offerOn: offerOn, tierPrice: tierPrice, tierRegular: tierRegular, addonPrice: addonPrice, cur: cur, setCur: setCur, minFrom: minFrom,
    onChange: function (fn) { listeners.push(fn); },
    hasSite: function (s) { return store.w.indexOf(s) >= 0; },
    isExample: isEx,
    toggleSite: function (s) { if (isEx(s)) { toast('Our own sites are examples, not for sale'); return false; } var on = toggleIn(store.w, s); if (!on && store.primary === s) store.primary = null; save(); toast(on ? 'Saved. Find it under "Saved" or in the bar below' : 'Removed from your saved designs'); return on; },
    hasAgent: function (id) { return store.a.indexOf(id) >= 0; },
    toggleAgent: function (id) { var on = toggleIn(store.a, id); save(); toast(on ? 'Added to your shortlist' : 'Removed from your shortlist'); return on; },
    hasAddon: function (id) { return store.add.indexOf(id) >= 0; },
    toggleAddon: function (id) { toggleIn(store.add, id); save(); },
    setPrimary: function (s) { if (isEx(s)) return; store.primary = s; if (s && store.w.indexOf(s) < 0) store.w.unshift(s); save(); },
    estimate: estimate, openRequest: openRequest, closeRequest: closeRequest, toast: toast, shareLink: shareLink, copyShare: copyShare,
    sharedW: sharedW, sharedA: sharedA
  };

  function primarySite() {
    if (store.primary && bySlug[store.primary]) return bySlug[store.primary];
    var best = null;
    store.w.forEach(function (s) { var x = bySlug[s]; if (x && (!best || TIER_ORDER.indexOf(x.tier) > TIER_ORDER.indexOf(best.tier))) best = x; });
    return best;
  }
  function estimate(c) {
    c = c || cur();
    var p = primarySite();
    var base = p ? tierPrice(p.tier, c) : 0, reg = p ? tierRegular(p.tier, c) : 0, once = 0, monthly = 0;
    store.add.forEach(function (id) { var a = C.addons.filter(function (x) { return x.id === id; })[0]; if (!a) return; if (a.monthly) monthly += addonPrice(a, c); else once += addonPrice(a, c); });
    if (!p && store.a.length) { base = reg = c === 'inr' ? 100000 : 2000; } // an agent interface on its own (private menu)
    return { site: p, base: base, regular: reg + once, addons: once, monthly: monthly, total: base + once, saving: Math.max(0, reg - base), cur: c };
  }
  function shareLink() {
    var u = new URL(C.site + '/websites/');
    if (store.w.length) u.searchParams.set('w', store.w.join(','));
    if (store.a.length) u.searchParams.set('a', store.a.join(','));
    if (store.add.length) u.searchParams.set('add', store.add.join(','));
    return u.toString();
  }
  function copyShare() {
    var link = shareLink();
    function done() { toast('Link copied'); }
    function fallback() {
      var ta = D.createElement('textarea'); ta.value = link; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
      D.body.appendChild(ta); ta.select(); try { D.execCommand('copy'); done(); } catch (e) { toast(link); } ta.remove();
    }
    if (navigator.clipboard && W.isSecureContext) navigator.clipboard.writeText(link).then(done, fallback); else fallback();
  }

  var KINDS = ['This design, my content', 'Mix designs', 'Match my brand', 'Fully custom'];
  var kind = KINDS[0];
  api.setKind = function (k) { if (KINDS.indexOf(k) >= 0) kind = k; };

  /* ---------- launch offer countdown ---------- */
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function tickOffer() {
    var left = OFFER_END - Date.now();
    if (left <= 0) { D.documentElement.classList.remove('has-offer'); D.documentElement.classList.add('offer-over'); return false; }
    var d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60, sec = Math.floor(left / 1e3) % 60;
    var txt = d > 0 ? d + 'd ' + pad2(h) + 'h ' + pad2(m) + 'm' : pad2(h) + ':' + pad2(m) + ':' + pad2(sec);
    $$('[data-countdown]').forEach(function (e) { if (e.textContent !== txt) e.textContent = txt; });
    var days = d > 1 ? d + ' days left' : d === 1 ? '1 day left' : 'last day';
    $$('[data-countdown-days]').forEach(function (e) { if (e.textContent !== days) e.textContent = days; });
    $$('[data-cd]').forEach(function (e) { var u = e.getAttribute('data-cd'), v = pad2(u === 'd' ? d : u === 'h' ? h : u === 'm' ? m : sec); if (e.textContent !== v) e.textContent = v; });
    return true;
  }
  function initOffer() {
    if (!OFFER_END) { D.documentElement.classList.remove('has-offer'); return; }
    if (tickOffer()) { var t = setInterval(function () { if (D.hidden) return; if (!tickOffer()) clearInterval(t); }, 1000); }
  }

  /* ---------- toast ---------- */
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = D.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); D.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  /* ---------- nav ---------- */
  function syncNav() {
    var n = store.w.length + store.a.length;
    $$('[data-pick-count]').forEach(function (e) { e.textContent = n; });
    $$('.pick-pill').forEach(function (e) { e.classList.toggle('has', n > 0); });
    renderQbar();
  }
  function initNav() {
    var nav = $('.nav');
    if (nav) {
      // solid bar after the first few pixels, and a spectrum line that tracks how far down the page you are
      var prog = $('.nav-prog', nav), tick = 0, wasSolid = null, max = 0;
      var measure = function () { max = D.documentElement.scrollHeight - W.innerHeight; };
      var paint = function () {
        tick = 0;
        var y = W.scrollY, solid = y > 8;
        if (solid !== wasSolid) { wasSolid = solid; nav.classList.toggle('solid', solid); }
        if (prog) prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
      };
      var onS = function () { if (!tick) tick = requestAnimationFrame(paint); };
      W.addEventListener('scroll', onS, { passive: true });
      W.addEventListener('resize', function () { measure(); onS(); }, { passive: true });
      W.addEventListener('load', measure);
      if ('ResizeObserver' in W) new ResizeObserver(measure).observe(D.body);
      measure(); paint();
    }
    var om = $('.overlay-menu');
    $$('[data-menu-open]').forEach(function (b) { b.addEventListener('click', function () { om.classList.add('open'); D.body.style.overflow = 'hidden'; }); });
    $$('[data-menu-close], .overlay-menu nav a, .overlay-menu .om-foot a, .overlay-menu .om-foot button').forEach(function (b) { b.addEventListener('click', function () { om.classList.remove('open'); D.body.style.overflow = ''; }); });
    D.addEventListener('click', function (e) {
      var r = e.target.closest('[data-open-request]');
      if (r) { e.preventDefault(); openRequest({ primary: r.getAttribute('data-open-request') || null, kind: r.getAttribute('data-kind-pick') || null }); return; }
      var c = e.target.closest('[data-cur]');
      if (c) { e.preventDefault(); setCur(c.getAttribute('data-cur')); return; }
      if (e.target.closest('[data-cur-toggle]')) { e.preventDefault(); setCur(cur() === 'inr' ? 'usd' : 'inr'); }
    });
    syncNav(); syncCur();
  }

  /* ---------- sticky bar (home and the website menu) ---------- */
  var qbar = null, qbarHidden = 0;
  function renderQbar() {
    if (!qbar) return;
    var n = store.w.length, e = estimate();
    var t = $('#qb-n', qbar), s = $('#qb-est', qbar), g = $('#qb-go', qbar);
    if (n) {
      t.textContent = n + (n === 1 ? ' design saved' : ' designs saved');
      s.textContent = C.showPrices && e.total ? money(e.total) + (e.monthly ? ' + ' + money(e.monthly) + '/mo' : '') + ' · live in ' + (C.liveHours || 48) + ' hours' : 'Order in a few minutes';
      g.textContent = 'Order';
    } else {
      t.textContent = 'From ' + money(minFrom());
      s.textContent = 'fixed price · live in ' + (C.liveHours || 48) + ' hours';
      g.textContent = 'Free plan';
    }
  }
  function initQbar() {
    qbar = $('#qbar'); if (!qbar) return;
    var go = $('#qb-go', qbar);
    go.addEventListener('click', function () { if (store.w.length) location.href = '/order/'; else if (W.HXLead) W.HXLead.open({ source: 'sticky bar' }); });
    // stay out of the way of the big forms and the footer
    var blockers = $$('#plan, .final, .foot, .w-help');
    if ('IntersectionObserver' in W && blockers.length) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (x) { x.target.__on = x.isIntersecting; }); qbarHidden = blockers.filter(function (b) { return b.__on; }).length; paintQ(); }, { threshold: 0.12 });
      blockers.forEach(function (b) { io.observe(b); });
    }
    var tk = 0;
    var paintQ = function () { tk = 0; qbar.classList.toggle('show', W.scrollY > W.innerHeight * 0.6 && !qbarHidden); };
    W.addEventListener('scroll', function () { if (!tk) tk = requestAnimationFrame(paintQ); }, { passive: true });
    renderQbar(); paintQ();
    api.onChange(renderQbar);
  }

  /* ---------- quote sheet ---------- */
  var sheet;
  function buildSheet() {
    sheet = D.createElement('div');
    sheet.className = 'sheet'; sheet.id = 'request';
    sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-labelledby', 'rq-title');
    sheet.innerHTML =
      '<div class="scrim" data-close></div>' +
      '<div class="panel">' +
        '<div class="grabber"></div>' +
        '<button class="icon-btn close-x" type="button" data-close aria-label="Close">' + ICON.x + '</button>' +
        '<div class="rq-form-wrap">' +
        '<p class="kicker">free · within 24 hours</p>' +
        '<h2 id="rq-title">Get your fixed price</h2>' +
        '<p class="sub">Tell us where to reach you. We reply on WhatsApp within 24 hours with a fixed price. No payment now.</p>' +
        '<div class="picks-list" id="rq-picks"></div>' +
        '<form id="rq-form" class="fgrid" novalidate>' +
          '<div class="field"><label for="rq-name">Your name</label><input id="rq-name" name="name" autocomplete="name" required maxlength="80"></div>' +
          '<div class="field"><label for="rq-phone">WhatsApp number</label><input id="rq-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="24" placeholder="+91 98xxx xxxxx"></div>' +
          '<div class="field full"><label for="rq-biz">Your business <span class="opt">name or type</span></label><input id="rq-biz" name="business" autocomplete="organization" maxlength="120"></div>' +
          '<div class="field full"><p class="flbl">What do you want?</p><div class="addon-picks" id="rq-kind" role="radiogroup" aria-label="What do you want">' + KINDS.map(function (k, i) { return '<button type="button" class="chip" role="radio" data-kind="' + k + '" aria-pressed="' + (i === 0) + '" aria-checked="' + (i === 0) + '">' + k + '</button>'; }).join('') + '</div></div>' +
          '<div class="field full"><p class="flbl">Add features <span class="opt">optional</span></p><div class="addon-picks" id="rq-addons"></div></div>' +
          '<div class="est full" id="rq-est"></div>' +
          '<div class="field full"><label for="rq-email">Email <span class="opt">optional</span></label><input id="rq-email" name="email" type="email" inputmode="email" autocomplete="email" maxlength="120"></div>' +
          '<div class="field full"><label for="rq-notes">Anything else? <span class="opt">optional</span></label><textarea id="rq-notes" name="notes" maxlength="1500" placeholder="Pages you need, your Instagram, sites you like"></textarea></div>' +
          '<input class="ld-hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<p class="ld-err full" role="alert" hidden></p>' +
          '<div class="send-row full">' +
            '<button class="btn btn-wa" type="submit" data-via="whatsapp">' + ICON.wa + 'Send on WhatsApp</button>' +
            '<button class="btn btn-ghost" type="button" data-via="form">Just send it, call me back</button>' +
          '</div>' +
        '</form>' +
        '<p class="fine">Your details go only to Hanflux AI. Prices are confirmed in your fixed quote before any work begins.</p>' +
        '</div>' +
        '<div class="ld-done rq-done" hidden><span class="ld-tick" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg></span><h2 class="ld-done-t">Thank you.</h2><p class="sub ld-done-p"></p><div class="ld-row"><button class="btn btn-teal" type="button" data-close>Keep browsing</button><a class="btn btn-wa rq-wa" href="#" target="_blank" rel="noopener">' + ICON.wa + 'Send on WhatsApp</a></div></div>' +
      '</div>';
    D.body.appendChild(sheet);
    sheet.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) { closeRequest(); return; }
      var rm = e.target.closest('[data-rm-w]'); if (rm) { api.toggleSite(rm.getAttribute('data-rm-w')); renderSheet(); return; }
      var ra = e.target.closest('[data-rm-a]'); if (ra) { api.toggleAgent(ra.getAttribute('data-rm-a')); renderSheet(); return; }
      var ad = e.target.closest('[data-addon]'); if (ad) { api.toggleAddon(ad.getAttribute('data-addon')); renderSheet(); return; }
      var kd = e.target.closest('[data-kind]'); if (kd) { kind = kd.getAttribute('data-kind'); syncKind(); return; }
      if (e.target.closest('[data-via="form"]')) { send('form'); }
    });
    $('#rq-form', sheet).addEventListener('submit', function (e) { e.preventDefault(); send('whatsapp'); });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.classList.contains('open')) closeRequest(); });
    api.onChange(function () { if (sheet.classList.contains('open')) renderSheet(); });
  }
  function syncKind() { $$('[data-kind]', sheet).forEach(function (x) { var on = x.getAttribute('data-kind') === kind; x.setAttribute('aria-pressed', on); x.setAttribute('aria-checked', on); }); }
  function renderSheet() {
    var picks = $('#rq-picks', sheet);
    var html = store.w.map(function (s) { var x = bySlug[s]; return '<span class="pchip"><i style="background:' + esc(x.accent) + '"></i>' + esc(x.name) + ' <span class="faint">· ' + esc(x.industry || x.brand) + '</span><button type="button" data-rm-w="' + esc(s) + '" aria-label="Remove ' + esc(x.name) + '">' + ICON.x + '</button></span>'; }).join('') +
      store.a.map(function (id) { var x = byLook[id]; var nm = x ? x.name : id; return '<span class="pchip"><i style="background:linear-gradient(135deg,#27f2c0,#7c5cff)"></i>AI agent: ' + esc(nm) + '<button type="button" data-rm-a="' + esc(id) + '" aria-label="Remove ' + esc(nm) + '">' + ICON.x + '</button></span>'; }).join('');
    picks.innerHTML = html || '<p class="picks-empty">No design picked yet. That is fine: send this and we suggest the best one, or <a class="teal" href="/websites/">look at the designs</a> first.</p>';
    $('#rq-addons', sheet).innerHTML = C.addons.map(function (a) {
      return '<button type="button" class="chip" data-addon="' + a.id + '" aria-pressed="' + api.hasAddon(a.id) + '">' + esc(a.name) + (C.showPrices ? ' · ' + money(addonPrice(a)) + (a.monthly ? '/mo' : '') : '') + '</button>';
    }).join('');
    var e = estimate(), est = $('#rq-est', sheet);
    if (C.showPrices && (e.site || store.add.length || store.a.length)) {
      est.hidden = false;
      est.innerHTML = '<div><div class="lbl">' + (e.site ? esc(C.tiers[e.site.tier].name) + ' plan · ' + esc(C.tiers[e.site.tier].weeks) : 'Estimate') + '</div>' +
        '<div class="lbl" style="margin-top:4px">' + (store.add.length ? store.add.length + ' add-on' + (store.add.length > 1 ? 's' : '') : 'No add-ons yet') + '</div></div>' +
        '<div class="amt">' + (offerOn() && e.saving ? '<s class="was" style="font-size:.55em;margin-right:8px">' + money(e.regular) + '</s>' : '') + 'from ' + money(e.total) + (e.monthly ? '<small>+ ' + money(e.monthly) + '/mo</small>' : '') + (offerOn() && e.saving ? '<div class="offer-note" style="margin-top:6px;font-size:11px">launch price · you save ' + money(e.saving) + '</div>' : '') + '</div>';
    } else est.hidden = true;
  }
  var lastFocus;
  function openRequest(opts) {
    opts = opts || {};
    if (!sheet) buildSheet();
    if (opts.primary && bySlug[opts.primary] && !isEx(opts.primary)) api.setPrimary(opts.primary);
    if (!opts.kind && opts.primary && isEx(opts.primary)) opts.kind = 'Fully custom';
    $('.rq-form-wrap', sheet).hidden = false; $('.rq-done', sheet).hidden = true;
    renderSheet();
    if (opts.kind && KINDS.indexOf(opts.kind) >= 0) { kind = opts.kind; }
    syncKind();
    lastFocus = D.activeElement;
    sheet.classList.add('open'); D.documentElement.style.overflow = 'hidden';
    var coarse = W.matchMedia && W.matchMedia('(pointer: coarse)').matches;
    setTimeout(function () { var f = $('#rq-name', sheet); if (f && !coarse) f.focus({ preventScroll: true }); }, 450);
    if (location.hash !== '#request') history.replaceState(null, '', location.pathname + location.search + '#request');
  }
  function closeRequest() {
    if (!sheet) return;
    sheet.classList.remove('open'); D.documentElement.style.overflow = '';
    if (location.hash === '#request') history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  function compose() {
    var f = $('#rq-form', sheet), v = function (n) { return (f.elements[n] && f.elements[n].value || '').trim(); };
    var e = estimate(), lines = [];
    lines.push('Hi Hanflux, I would like a fixed price for my website.');
    lines.push('I want: ' + kind + '.');
    if (store.w.length) {
      var p = e.site;
      lines.push('');
      lines.push('Design: ' + (p ? p.name + ' (' + C.tiers[p.tier].name + ' plan)' : ''));
      var others = store.w.filter(function (s) { return !p || s !== p.slug; }).map(function (s) { return bySlug[s].name; });
      if (others.length) lines.push('Also liked: ' + others.join(', '));
    }
    if (store.a.length) lines.push('AI agent look: ' + store.a.map(function (id) { return byLook[id] ? byLook[id].name : id; }).join(', '));
    if (store.add.length) lines.push('Add-ons: ' + store.add.map(function (id) { var a = C.addons.filter(function (x) { return x.id === id; })[0]; return a ? a.name : id; }).join(', '));
    if (C.showPrices && (e.site || store.add.length)) lines.push('Menu estimate: from ' + money(e.total) + (e.monthly ? ' + ' + money(e.monthly) + '/mo' : '') + (offerOn() && e.saving ? ' (launch price)' : ''));
    lines.push('');
    if (v('name')) lines.push('Name: ' + v('name'));
    if (v('business')) lines.push('Business: ' + v('business'));
    if (v('phone')) lines.push('WhatsApp: ' + v('phone'));
    if (v('email')) lines.push('Email: ' + v('email'));
    if (v('notes')) lines.push('Notes: ' + v('notes'));
    lines.push('');
    lines.push('My picks: ' + shareLink());
    return { text: lines.join('\n'), fields: { name: v('name'), business: v('business'), phone: v('phone'), email: v('email'), notes: v('notes'), honey: v('_honey') }, est: e };
  }
  function fail(msg, field) {
    var er = $('.ld-err', sheet); er.textContent = msg; er.hidden = false;
    if (field) { field.focus(); field.style.borderColor = '#d75088'; setTimeout(function () { field.style.borderColor = ''; }, 2400); }
  }
  function send(via) {
    var f = $('#rq-form', sheet), c = compose(), digits = c.fields.phone.replace(/\D/g, '');
    $('.ld-err', sheet).hidden = true;
    if (!c.fields.name) return fail('Add your name so we know who to reply to.', $('#rq-name', sheet));
    if (via === 'form' && digits.length < 8 && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.fields.email)) return fail('Add your WhatsApp number (or an email) so we can send your price.', $('#rq-phone', sheet));
    if (digits && digits.length < 8) return fail('That number looks too short. Add the country code, like +91.', $('#rq-phone', sheet));
    saveLead(c, via);
    var e = c.est, wa = 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(c.text);
    if (W.HXLead) W.HXLead.post({
      name: c.fields.name, whatsapp: c.fields.phone, email: c.fields.email, business: c.fields.business, wants: kind,
      design: e.site ? e.site.name + ' (' + C.tiers[e.site.tier].name + ')' : 'not picked yet',
      also_liked: store.w.filter(function (s) { return !e.site || s !== e.site.slug; }).map(function (s) { return bySlug[s].name; }).join(', ') || 'none',
      addons: store.add.join(', ') || 'none', estimate: C.showPrices && (e.site || store.add.length) ? 'from ' + money(e.total) + (e.monthly ? ' + ' + money(e.monthly) + '/mo' : '') : 'n/a',
      notes: c.fields.notes, sent_via: via === 'whatsapp' ? 'WhatsApp + form' : 'form only', source: 'quote sheet', _honey: c.fields.honey
    }, 'Quote request: ' + c.fields.name + (e.site ? ' · ' + e.site.name : ''));
    try { localStorage.setItem('hx-lead', JSON.stringify({ sent: Date.now(), via: via })); } catch (er) {}
    if (via === 'whatsapp') {
      W.open(wa, '_blank', 'noopener');
      toast('Opening WhatsApp with your request');
    }
    $('.rq-form-wrap', sheet).hidden = true;
    var done = $('.rq-done', sheet); done.hidden = false;
    $('.ld-done-t', done).textContent = 'Thank you, ' + c.fields.name.split(' ')[0] + '.';
    $('.ld-done-p', done).textContent = via === 'whatsapp' ? 'Press send in WhatsApp and we will reply within 24 hours with your fixed price.' : 'We will get back to you within 24 hours with your fixed price. Want it faster? Send it on WhatsApp too.';
    $('.rq-wa', done).href = wa;
    $('.rq-wa', done).hidden = via === 'whatsapp';
  }
  function saveLead(c, via) {
    var sb = C.supabase; if (!sb || !sb.url || !sb.anonKey) return;
    try {
      fetch(sb.url.replace(/\/$/, '') + '/rest/v1/' + (sb.table || 'design_menu_leads'), {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json', apikey: sb.anonKey, Authorization: 'Bearer ' + sb.anonKey, Prefer: 'return=minimal' },
        body: JSON.stringify({ name: c.fields.name, business: c.fields.business, phone: c.fields.phone, email: c.fields.email, notes: c.fields.notes,
          websites: store.w, agents: store.a, addons: store.add, primary_site: c.est.site ? c.est.site.slug : null, estimate: c.est.total, currency: c.est.cur, monthly: c.est.monthly, via: via, page: location.pathname, message: c.text })
      }).catch(function () {});
    } catch (e) {}
  }

  /* ---------- reveals ---------- */
  function initReveals() {
    var els = $$('.rv');
    if (els.length) {
      if (!('IntersectionObserver' in W)) els.forEach(function (e) { e.classList.add('in'); });
      else {
        // things that arrive together come in one after another
        var io = new IntersectionObserver(function (es) {
          var k = 0;
          es.forEach(function (e) {
            if (!e.isIntersecting) return;
            var t = e.target; t.style.transitionDelay = Math.min(k++, 5) * 60 + 'ms';
            t.classList.add('in'); io.unobserve(t);
            setTimeout(function () { t.style.transitionDelay = ''; }, 1200);
          });
        }, { rootMargin: '0px 0px -4% 0px', threshold: 0.04 });
        els.forEach(function (e) { io.observe(e); });
      }
    }
    initCounts();
  }
  // numbers marked data-count run up to their value once, when first seen
  function initCounts() {
    var els = $$('[data-count]'); if (!els.length) return;
    var reduce = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in W)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, to = +el.getAttribute('data-count') || 0, t0 = 0, dur = 1300 + Math.min(600, to * 12);
        if (to < 2) return;
        el.textContent = '0';
        var step = function (now) {
          if (!t0) t0 = now;
          var u = Math.min(1, (now - t0) / dur), v = 1 - Math.pow(1 - u, 4);
          el.textContent = String(Math.round(to * v));
          if (u < 1) requestAnimationFrame(step);
        };
        setTimeout(function () { requestAnimationFrame(step); }, 700);
      });
    }, { threshold: 0.4 });
    els.forEach(function (e) { io.observe(e); });
  }

  function init() {
    initNav(); initReveals(); initOffer(); initQbar();
    $$('[data-copy-share]').forEach(function (b) { b.addEventListener('click', copyShare); });
    if (location.hash === '#request') setTimeout(function () { openRequest({ primary: D.body.getAttribute('data-slug') || null }); }, 300);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();
