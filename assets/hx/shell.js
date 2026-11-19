/* Hanflux Design Menu · shell: nav, shortlist, request sheet, estimate, toast, reveals. */
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
    wa: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="fill:currentColor;stroke:none"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.9 9.9 0 0 0 12.04 2zm5.8 14.16c-.24.69-1.42 1.32-1.96 1.37-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.61.47.24.56.79 1.92.86 2.06.07.14.11.3.02.48-.09.18-.14.3-.27.46l-.41.48c-.14.14-.28.29-.12.56.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.14.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.58.75 1.85.88.27.14.45.2.52.32.07.11.07.66-.17 1.35z"/></svg>',
    mail: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    cal: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>'
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function money(n) { return C.currency.symbol + Math.round(n).toLocaleString('en-US'); }
  var OFFER_END = C.offer && C.offer.on ? new Date(C.offer.ends).getTime() : 0;
  function offerOn() { return !!OFFER_END && Date.now() < OFFER_END; }
  function tierPrice(t) { var x = C.tiers[t]; return offerOn() ? x.from : (x.was || x.from); }
  function tierRegular(t) { var x = C.tiers[t]; return x.was || x.from; }

  /* ---------- shortlist store ---------- */
  var KEY = 'hx-picks-v2';
  var store = { w: [], a: [], add: [], primary: null };
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw) store = Object.assign(store, raw); } catch (e) {}
  store.w = (store.w || []).filter(function (s) { return bySlug[s]; });
  var qs = new URLSearchParams(location.search), sharedW = [], sharedA = [];
  (qs.get('w') || '').split(',').forEach(function (s) { s = s.trim(); if (bySlug[s]) { sharedW.push(s); if (store.w.indexOf(s) < 0) store.w.push(s); } });
  (qs.get('a') || qs.get('pick') || '').split(',').forEach(function (s) { s = s.trim(); if (s && (byLook[s] || /^[a-z-]+$/.test(s))) { sharedA.push(s); if (store.a.indexOf(s) < 0) store.a.push(s); } });
  (qs.get('add') || '').split(',').forEach(function (s) { s = s.trim(); if (s && store.add.indexOf(s) < 0 && C.addons.some(function (a) { return a.id === s; })) store.add.push(s); });
  var listeners = [];
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} listeners.forEach(function (fn) { try { fn(store); } catch (e) {} }); syncNav(); }
  function toggleIn(list, v) { var i = list.indexOf(v); if (i >= 0) list.splice(i, 1); else list.push(v); return i < 0; }

  var api = W.HXShell = {
    store: store, sites: SITES, bySlug: bySlug, money: money, esc: esc, offerOn: offerOn, tierPrice: tierPrice, tierRegular: tierRegular,
    onChange: function (fn) { listeners.push(fn); },
    hasSite: function (s) { return store.w.indexOf(s) >= 0; },
    toggleSite: function (s) { var on = toggleIn(store.w, s); if (!on && store.primary === s) store.primary = null; save(); toast(on ? 'Added to your shortlist' : 'Removed from your shortlist'); return on; },
    hasAgent: function (id) { return store.a.indexOf(id) >= 0; },
    toggleAgent: function (id) { var on = toggleIn(store.a, id); save(); toast(on ? 'Added to your shortlist' : 'Removed from your shortlist'); return on; },
    hasAddon: function (id) { return store.add.indexOf(id) >= 0; },
    toggleAddon: function (id) { toggleIn(store.add, id); save(); },
    setPrimary: function (s) { store.primary = s; if (s && store.w.indexOf(s) < 0) store.w.unshift(s); save(); },
    estimate: estimate, openRequest: openRequest, closeRequest: closeRequest, toast: toast, shareLink: shareLink, copyShare: copyShare,
    sharedW: sharedW, sharedA: sharedA
  };

  function primarySite() {
    if (store.primary && bySlug[store.primary]) return bySlug[store.primary];
    var best = null;
    store.w.forEach(function (s) { var x = bySlug[s]; if (x && (!best || TIER_ORDER.indexOf(x.tier) > TIER_ORDER.indexOf(best.tier))) best = x; });
    return best;
  }
  function estimate() {
    var p = primarySite();
    var base = p ? tierPrice(p.tier) : 0, reg = p ? tierRegular(p.tier) : 0, once = 0, monthly = 0;
    store.add.forEach(function (id) { var a = C.addons.filter(function (x) { return x.id === id; })[0]; if (!a) return; if (a.monthly) monthly += a.from; else once += a.from; });
    if (!p && store.a.length) { base = 2500; reg = 2500; } // an agent interface on its own
    return { site: p, base: base, regular: reg + once, addons: once, monthly: monthly, total: base + once, saving: Math.max(0, reg - base) };
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

  var KINDS = ['This design, my content', 'Mix two or more designs', 'Match my brand or current UI', 'Something fully custom'];
  var kind = KINDS[0];
  api.setKind = function (k) { if (KINDS.indexOf(k) >= 0) kind = k; };

  /* ---------- launch offer countdown ---------- */
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function tickOffer() {
    var left = OFFER_END - Date.now();
    if (left <= 0) { D.documentElement.classList.remove('has-offer'); D.documentElement.classList.add('offer-over'); return false; }
    var d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60, sec = Math.floor(left / 1e3) % 60;
    $$('[data-countdown]').forEach(function (e) { e.textContent = d > 0 ? d + 'd ' + pad2(h) + 'h ' + pad2(m) + 'm' : pad2(h) + ':' + pad2(m) + ':' + pad2(sec); });
    $$('[data-cd]').forEach(function (e) { var u = e.getAttribute('data-cd'); e.textContent = pad2(u === 'd' ? d : u === 'h' ? h : u === 'm' ? m : sec); });
    return true;
  }
  function initOffer() {
    if (!OFFER_END) { D.documentElement.classList.remove('has-offer'); return; }
    if (tickOffer()) { var t = setInterval(function () { if (!tickOffer()) clearInterval(t); }, 1000); }
  }

  /* ---------- toast ---------- */
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = D.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); D.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* ---------- nav ---------- */
  function syncNav() {
    var n = store.w.length + store.a.length;
    $$('[data-pick-count]').forEach(function (e) { e.textContent = n; });
    $$('.pick-pill').forEach(function (e) { e.classList.toggle('has', n > 0); });
  }
  function initNav() {
    var nav = $('.nav');
    if (nav) {
      var onS = function () { nav.classList.toggle('solid', W.scrollY > 8); };
      W.addEventListener('scroll', onS, { passive: true }); onS();
    }
    var om = $('.overlay-menu');
    $$('[data-menu-open]').forEach(function (b) { b.addEventListener('click', function () { om.classList.add('open'); D.body.style.overflow = 'hidden'; }); });
    $$('[data-menu-close], .overlay-menu nav a').forEach(function (b) { b.addEventListener('click', function () { om.classList.remove('open'); D.body.style.overflow = ''; }); });
    $$('[data-open-request]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); openRequest({ primary: b.getAttribute('data-open-request') || null, kind: b.getAttribute('data-kind-pick') || null }); }); });
    syncNav();
  }

  /* ---------- request sheet ---------- */
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
        '<p class="kicker">request a build</p>' +
        '<h2 id="rq-title">Get your fixed quote</h2>' +
        '<p class="sub">Send your picks. We reply within 24 hours with a fixed price and timeline. No payment now.</p>' +
        '<div class="picks-list" id="rq-picks"></div>' +
        '<p class="kicker plain" style="color:var(--ink-dim);margin:6px 0 10px">what would you like?</p>' +
        '<div class="addon-picks" id="rq-kind" role="radiogroup" aria-label="Kind of design">' + KINDS.map(function (k, i) { return '<button type="button" class="chip" role="radio" data-kind="' + k + '" aria-pressed="' + (i === 0) + '" aria-checked="' + (i === 0) + '">' + k + '</button>'; }).join('') + '</div>' +
        '<p class="kicker plain" style="color:var(--ink-dim);margin:14px 0 10px">add-ons</p>' +
        '<div class="addon-picks" id="rq-addons"></div>' +
        '<div class="est" id="rq-est"></div>' +
        '<form id="rq-form" class="fgrid" novalidate>' +
          '<div class="field"><label for="rq-name">Your name</label><input id="rq-name" name="name" autocomplete="name" required></div>' +
          '<div class="field"><label for="rq-biz">Business or current website</label><input id="rq-biz" name="business" autocomplete="organization"></div>' +
          '<div class="field"><label for="rq-phone">WhatsApp or phone</label><input id="rq-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel"></div>' +
          '<div class="field"><label for="rq-email">Email</label><input id="rq-email" name="email" type="email" inputmode="email" autocomplete="email"></div>' +
          '<div class="field"><label for="rq-time">When do you need it?</label><select id="rq-time" name="timeline"><option>As soon as possible</option><option>In 2 to 4 weeks</option><option>In 1 to 2 months</option><option>Just exploring</option></select></div>' +
          '<div class="field"><label for="rq-budget">Budget</label><select id="rq-budget" name="budget"><option>Not sure yet</option><option>Under $2,000</option><option>$2,000 to $5,000</option><option>$5,000 to $10,000</option><option>$10,000 or more</option></select></div>' +
          '<div class="field full"><label for="rq-notes">Anything we should know?</label><textarea id="rq-notes" name="notes" placeholder="Pages you need, your industry, links you like"></textarea></div>' +
          '<div class="send-row full">' +
            '<button class="btn btn-wa" type="submit" data-via="whatsapp">' + ICON.wa + 'Send on WhatsApp</button>' +
            '<div class="alt"><button class="btn btn-ghost" type="button" data-via="email">' + ICON.mail + 'Email it</button>' +
            '<a class="btn btn-ghost" href="' + esc(C.cal) + '" target="_blank" rel="noopener">' + ICON.cal + 'Book 15 min</a></div>' +
          '</div>' +
        '</form>' +
        '<p class="fine">We reply from ' + esc(C.whatsappLabel) + ' or ' + esc(C.email) + '. Prices are starting points; your quote is fixed before work begins.</p>' +
      '</div>';
    D.body.appendChild(sheet);
    sheet.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) { closeRequest(); return; }
      var rm = e.target.closest('[data-rm-w]'); if (rm) { api.toggleSite(rm.getAttribute('data-rm-w')); renderSheet(); return; }
      var ra = e.target.closest('[data-rm-a]'); if (ra) { api.toggleAgent(ra.getAttribute('data-rm-a')); renderSheet(); return; }
      var ad = e.target.closest('[data-addon]'); if (ad) { api.toggleAddon(ad.getAttribute('data-addon')); renderSheet(); return; }
      var kd = e.target.closest('[data-kind]'); if (kd) { kind = kd.getAttribute('data-kind'); $$('[data-kind]', sheet).forEach(function (b) { var on = b === kd; b.setAttribute('aria-pressed', on); b.setAttribute('aria-checked', on); }); return; }
      var via = e.target.closest('[data-via="email"]'); if (via) { send('email'); }
    });
    $('#rq-form', sheet).addEventListener('submit', function (e) { e.preventDefault(); send('whatsapp'); });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.classList.contains('open')) closeRequest(); });
  }
  function renderSheet() {
    var picks = $('#rq-picks', sheet);
    var html = store.w.map(function (s) { var x = bySlug[s]; return '<span class="pchip"><i style="background:' + esc(x.accent) + '"></i>' + esc(x.name) + ' <span class="faint">· ' + esc(x.brand) + '</span><button type="button" data-rm-w="' + esc(s) + '" aria-label="Remove ' + esc(x.name) + '">' + ICON.x + '</button></span>'; }).join('') +
      store.a.map(function (id) { var x = byLook[id]; var nm = x ? x.name : id; return '<span class="pchip"><i style="background:linear-gradient(135deg,#27f2c0,#7c5cff)"></i>AI agent: ' + esc(nm) + '<button type="button" data-rm-a="' + esc(id) + '" aria-label="Remove ' + esc(nm) + '">' + ICON.x + '</button></span>'; }).join('');
    picks.innerHTML = html || '<p class="picks-empty">No designs picked yet. You can still send a request, or <a class="teal" href="/websites/">browse the websites</a> first.</p>';
    $('#rq-addons', sheet).innerHTML = C.addons.map(function (a) {
      return '<button type="button" class="chip" data-addon="' + a.id + '" aria-pressed="' + api.hasAddon(a.id) + '">' + esc(a.name) + (C.showPrices ? ' · ' + money(a.from) + (a.monthly ? '/mo' : '') : '') + '</button>';
    }).join('');
    var e = estimate(), est = $('#rq-est', sheet);
    if (C.showPrices && (e.site || store.add.length || store.a.length)) {
      est.hidden = false;
      est.innerHTML = '<div><div class="lbl">' + (e.site ? esc(C.tiers[e.site.tier].name) + ' tier · ' + esc(C.tiers[e.site.tier].weeks) : 'Estimate') + '</div>' +
        '<div class="lbl" style="margin-top:4px">' + (store.add.length ? store.add.length + ' add-on' + (store.add.length > 1 ? 's' : '') : 'No add-ons yet') + '</div></div>' +
        '<div class="amt">' + (offerOn() && e.saving ? '<s class="was" style="font-size:.55em;margin-right:8px">' + money(e.regular) + '</s>' : '') + 'from ' + money(e.total) + (e.monthly ? '<small>+ ' + money(e.monthly) + '/mo</small>' : '') + (offerOn() && e.saving ? '<div class="offer-note" style="margin-top:6px;font-size:11px">launch price · you save ' + money(e.saving) + '</div>' : '') + '</div>';
    } else est.hidden = true;
  }
  var lastFocus;
  function openRequest(opts) {
    opts = opts || {};
    if (!sheet) buildSheet();
    if (opts.primary && bySlug[opts.primary]) api.setPrimary(opts.primary);
    renderSheet();
    if (opts.kind && KINDS.indexOf(opts.kind) >= 0) { kind = opts.kind; $$('[data-kind]', sheet).forEach(function (x) { var on = x.getAttribute('data-kind') === kind; x.setAttribute('aria-pressed', on); x.setAttribute('aria-checked', on); }); }
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
    lines.push('Hi Hanflux, I would like a quote.');
    lines.push('I want: ' + kind + '.');
    if (store.w.length) {
      var p = e.site;
      lines.push('');
      lines.push('Website design: ' + (p ? p.name + ' (' + p.brand + ' sample, ' + C.tiers[p.tier].name + ')' : ''));
      var others = store.w.filter(function (s) { return !p || s !== p.slug; }).map(function (s) { return bySlug[s].name; });
      if (others.length) lines.push('Also liked: ' + others.join(', '));
    }
    if (store.a.length) lines.push('AI agent look: ' + store.a.map(function (id) { return byLook[id] ? byLook[id].name : id; }).join(', '));
    if (store.add.length) lines.push('Add-ons: ' + store.add.map(function (id) { var a = C.addons.filter(function (x) { return x.id === id; })[0]; return a ? a.name : id; }).join(', '));
    if (C.showPrices && (e.site || store.add.length)) lines.push('Menu estimate: from ' + money(e.total) + (e.monthly ? ' + ' + money(e.monthly) + '/mo' : '') + (offerOn() && e.saving ? ' (launch price, regular ' + money(e.regular) + ')' : ''));
    lines.push('');
    if (v('name')) lines.push('Name: ' + v('name'));
    if (v('business')) lines.push('Business: ' + v('business'));
    if (v('phone')) lines.push('Phone: ' + v('phone'));
    if (v('email')) lines.push('Email: ' + v('email'));
    lines.push('Timeline: ' + v('timeline'));
    if (v('budget') && v('budget') !== 'Not sure yet') lines.push('Budget: ' + v('budget'));
    if (v('notes')) lines.push('Notes: ' + v('notes'));
    lines.push('');
    lines.push('My picks: ' + shareLink());
    return { text: lines.join('\n'), fields: { name: v('name'), business: v('business'), phone: v('phone'), email: v('email'), timeline: v('timeline'), budget: v('budget'), notes: v('notes') }, est: e };
  }
  function send(via) {
    var f = $('#rq-form', sheet), name = $('#rq-name', sheet);
    if (!name.value.trim()) { name.focus(); name.style.borderColor = '#ff3d7f'; toast('Add your name so we know who to reply to'); setTimeout(function () { name.style.borderColor = ''; }, 2400); return; }
    var c = compose();
    saveLead(c, via);
    if (via === 'whatsapp') {
      W.open('https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(c.text), '_blank', 'noopener');
    } else {
      W.location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('Website quote request' + (c.est.site ? ': ' + c.est.site.name : '')) + '&body=' + encodeURIComponent(c.text);
    }
    toast(via === 'whatsapp' ? 'Opening WhatsApp with your request' : 'Opening your email app');
  }
  function saveLead(c, via) {
    var sb = C.supabase; if (!sb || !sb.url || !sb.anonKey) return;
    try {
      fetch(sb.url.replace(/\/$/, '') + '/rest/v1/' + (sb.table || 'design_menu_leads'), {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json', apikey: sb.anonKey, Authorization: 'Bearer ' + sb.anonKey, Prefer: 'return=minimal' },
        body: JSON.stringify({ name: c.fields.name, business: c.fields.business, phone: c.fields.phone, email: c.fields.email, timeline: c.fields.timeline, budget: c.fields.budget, notes: c.fields.notes,
          websites: store.w, agents: store.a, addons: store.add, primary_site: c.est.site ? c.est.site.slug : null, estimate_usd: c.est.total, monthly_usd: c.est.monthly, via: via, page: location.pathname, message: c.text })
      }).catch(function () {});
    } catch (e) {}
  }

  /* ---------- reveals ---------- */
  function initReveals() {
    var els = $$('.rv'); if (!els.length) return;
    if (!('IntersectionObserver' in W)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  function init() {
    initNav(); initReveals(); initOffer();
    $$('[data-copy-share]').forEach(function (b) { b.addEventListener('click', copyShare); });
    if (location.hash === '#request') setTimeout(function () { openRequest({ primary: D.body.getAttribute('data-slug') || null }); }, 300);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();
