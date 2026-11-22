/* Hanflux Design Menu · ordering: design and features, the business, contact, review and pay.
   Progress is kept in this browser, so a client can leave and come back. Every placed order goes to the
   Hanflux inbox (FormSubmit) and can also be sent on WhatsApp. Payment runs on the Razorpay page set in
   data/config.js; without one, the order is placed and the payment link is sent after the call. */
(function () {
  'use strict';
  var W = window, D = document, C = W.HX_CONFIG, X = W.HXShell, SITES = W.HX_SITES || [];
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var esc = X.esc, money = X.money;
  var by = {}; SITES.forEach(function (s) { by[s.slug] = s; });
  var EXS = C.examples || [];
  var PAY = C.payment || {}, KEY = 'hx-order-v1';
  var form = $('#o-form'), err = $('.o-err');

  var S = { step: 1, design: null, f: {}, logo: '', domain: '', call: 'Any time', pages: ['Home', 'Contact'], custom: [] };
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && !raw.placed) S = Object.assign(S, raw); } catch (e) {}
  var q = new URLSearchParams(location.search);
  if (q.get('d') && (by[q.get('d')] && EXS.indexOf(q.get('d')) < 0 || q.get('d') === 'suggest')) { S.design = q.get('d'); S.step = 1; }
  if (!S.design) S.design = X.store.primary || X.store.w[0] || null;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  /* ---------- prices ---------- */
  function site() { return S.design && by[S.design] ? by[S.design] : null; }
  function totals() {
    var s = site(), base = s ? X.tierPrice(s.tier) : 0, reg = s ? X.tierRegular(s.tier) : 0, once = 0, mo = 0, list = [];
    C.addons.forEach(function (a) { if (X.hasAddon(a.id)) { var p = X.addonPrice(a); list.push({ a: a, p: p }); if (a.monthly) mo += p; else once += p; } });
    var total = base + once, pct = Math.max(1, Math.min(100, +PAY.upfrontPct || 100));
    return { s: s, base: base, reg: reg, once: once, mo: mo, list: list, total: total, now: Math.round(total * pct / 100), pct: pct, fixed: !!s };
  }
  function payLink() { var l = (PAY.razorpay || {})[X.cur()]; return l && /^https:\/\//.test(l) ? l : ''; }

  /* ---------- step 1: the design ---------- */
  function renderPick() {
    var s = site(), el = $('#o-pick');
    if (S.design === 'suggest') {
      el.innerHTML = '<div class="o-card o-card-s"><div class="oc-txt"><span class="oc-k">not sure yet</span><b>Help me choose</b><span class="oc-p">We suggest the best design on the call and confirm the price before you pay.</span></div></div>';
    } else if (s) {
      var t = C.tiers[s.tier];
      el.innerHTML = '<div class="o-card"><img src="/posters/' + s.slug + '-m.webp" alt="" width="300" height="649" decoding="async"><div class="oc-txt"><span class="oc-k">' + esc(s.industry) + ' · ' + esc(t.kind) + '</span><b>' + esc(s.name) + '</b>' +
        '<span class="oc-p">' + (X.offerOn() && t[X.cur()].was ? '<s class="was">' + money(X.tierRegular(s.tier)) + '</s> ' : '') + '<span class="now">' + money(X.tierPrice(s.tier)) + '</span> <span class="faint">· ' + esc(t.name) + ' plan</span></span>' +
        '<a class="lnk" href="/websites/' + s.slug + '/" target="_blank" rel="noopener">Watch it live</a></div></div>';
    } else {
      el.innerHTML = '<p class="o-sub">Pick the design you want below.</p>';
      $('#o-list').hidden = false;
    }
    $('[data-change]').hidden = !(s || S.design === 'suggest') || !$('#o-list').hidden;
    $$('#o-list [data-design]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-design') === S.design ? 'true' : 'false'); });
  }
  D.addEventListener('click', function (e) {
    var c = e.target.closest('[data-change]'); if (c) { $('#o-list').hidden = false; c.hidden = true; return; }
    var b = e.target.closest('#o-list [data-design]');
    if (b) { S.design = b.getAttribute('data-design'); if (S.design !== 'suggest') X.setPrimary(S.design); $('#o-list').hidden = true; save(); renderAll(); $('#o-pick').scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  });
  $('#d-addons').addEventListener('change', function (e) { if (e.target.matches('input')) X.toggleAddon(e.target.value); });

  /* ---------- step 2 and 3: chips and fields ---------- */
  function syncChips() {
    $$('[data-radio]').forEach(function (g) { var k = g.getAttribute('data-radio'); $$('[data-v]', g).forEach(function (b) { b.setAttribute('aria-pressed', S[k] === b.getAttribute('data-v') ? 'true' : 'false'); }); });
    $$('[data-multi]').forEach(function (g) { var list = S[g.getAttribute('data-multi')] || []; $$('[data-v]', g).forEach(function (b) { b.setAttribute('aria-pressed', list.indexOf(b.getAttribute('data-v')) >= 0 ? 'true' : 'false'); }); });
    $('#o-custom-hint').hidden = !(S.custom && S.custom.length);
    $('#o-domain').hidden = S.domain !== 'I have one';
  }
  D.addEventListener('click', function (e) {
    var b = e.target.closest('[data-radio] [data-v]');
    if (b) {
      var k = b.closest('[data-radio]').getAttribute('data-radio'); S[k] = b.getAttribute('data-v');
      if (k === 'logo') { var want = S.logo === 'No, make one for me'; if (want !== X.hasAddon('brand')) X.toggleAddon('brand'); $('#o-logo-hint').hidden = !want; }
      syncChips(); save(); return;
    }
    var m = e.target.closest('[data-multi] [data-v]');
    if (m) { var key = m.closest('[data-multi]').getAttribute('data-multi'); S[key] = S[key] || []; var v = m.getAttribute('data-v'), i = S[key].indexOf(v); if (i >= 0) S[key].splice(i, 1); else S[key].push(v); syncChips(); save(); }
  });
  form.addEventListener('input', function (e) { if (e.target.name && e.target.name !== '_honey') { S.f[e.target.name] = e.target.value; save(); } });
  Object.keys(S.f).forEach(function (k) { var i = form.elements[k]; if (i && i.type !== 'checkbox') i.value = S.f[k]; });

  /* ---------- summary (side panel, bottom bar, review) ---------- */
  function summaryHtml(t) {
    var rows = [];
    if (t.s) rows.push(['<b>' + esc(t.s.name) + '</b><small>' + esc(C.tiers[t.s.tier].name) + ' plan · ' + esc(C.tiers[t.s.tier].kind) + '</small>', money(t.base)]);
    else if (S.design === 'suggest') rows.push(['<b>Design: help me choose</b><small>confirmed on the call</small>', '']);
    t.list.forEach(function (x) { rows.push([esc(x.a.name), money(x.p) + (x.a.monthly ? '/mo' : '')]); });
    var h = '<p class="kicker">your order</p>' + (rows.length ? '<ul class="os-rows">' + rows.map(function (r) { return '<li><span>' + r[0] + '</span><span>' + r[1] + '</span></li>'; }).join('') + '</ul>' : '<p class="o-sub">No design picked yet.</p>');
    if (t.fixed) {
      h += '<div class="os-tot"><span>Total' + (X.offerOn() ? ' <small>launch price</small>' : '') + '</span><b>' + money(t.total) + '</b></div>';
      if (t.mo) h += '<p class="os-mo">+ ' + money(t.mo) + ' a month for the Care plan, from launch</p>';
      if (t.pct < 100) h += '<p class="os-mo">Pay ' + t.pct + '% now to start: <b>' + money(t.now) + '</b>. The rest before launch.</p>';
      if (X.offerOn() && t.reg > t.base) h += '<p class="os-save">You save ' + money(t.reg - t.base) + ' with launch prices, for orders by ' + esc(C.offer.endsLabel) + '.</p>';
    }
    h += '<p class="os-time">Live within ' + (C.liveHours || 48) + ' hours of payment.</p>';
    return h;
  }
  function renderSum() {
    var t = totals();
    $('#o-sum').innerHTML = summaryHtml(t);
    $('#ob-amt').textContent = t.fixed ? money(t.total) : 'on the call';
    $$('#d-addons input').forEach(function (i) { i.checked = X.hasAddon(i.value); });
  }
  function renderReview() {
    var t = totals(), f = S.f, link = payLink();
    var rows = [
      ['Business', esc(f.business || '') + (f.city ? ', ' + esc(f.city) : '')],
      ['What you do', esc(f.what || '')],
      ['Current site', esc(f.current_site || 'none')],
      ['Logo', esc(S.logo || 'not said')],
      ['Domain', esc(S.domain === 'I have one' && f.domain_name ? f.domain_name : S.domain || 'not said')],
      ['Pages', esc(S.pages.join(', ') || 'we suggest')],
      ['Custom order', esc((S.custom || []).join(', ') || 'none')],
      ['Contact', esc(f.name || '') + ' · ' + esc(f.phone || '') + ' · ' + esc(f.email || '')],
      ['Call me', esc(S.call)]
    ];
    $('#o-review').innerHTML = '<div class="o-rev-sum">' + summaryHtml(t) + '<button class="lnk" type="button" data-go="1">Change design or features</button></div>' +
      '<dl class="o-rev">' + rows.map(function (r, i) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>' +
      '<div class="o-rev-edit"><button class="lnk" type="button" data-go="2">Edit business</button><button class="lnk" type="button" data-go="3">Edit contact</button></div>';
    $('#o-pay').innerHTML = t.fixed && link
      ? '<p class="op-h">Pay <b>' + money(t.now) + '</b> to start' + (t.pct < 100 ? ' (' + t.pct + '% of ' + money(t.total) + ')' : '') + '</p><p class="op-s">Secure payment by Razorpay: UPI, cards or net banking. The payment page opens in a new tab.</p>'
      : '<p class="op-h">' + (t.fixed ? 'Place your order now, pay after our call' : 'Place your order, we confirm the price on the call') + '</p><p class="op-s">We call you within ' + (C.callWithinHours || 24) + ' hours to confirm everything and send your secure Razorpay payment link. Building starts once payment is in.</p>';
    if (S.custom && S.custom.length) $('#o-pay').innerHTML += '<p class="op-s op-c">Custom work (' + esc(S.custom.join(', ')) + ') is scoped on the call and priced separately, with its own timeline.</p>';
  }
  D.addEventListener('click', function (e) { var g = e.target.closest('[data-go]'); if (g) go(+g.getAttribute('data-go')); });

  /* ---------- steps ---------- */
  var TITLES = { 1: 'Pick your design.', 2: 'Tell us about your business.', 3: 'Where do we reach you?', 4: 'Review and pay.' };
  function fail(msg, el) { err.textContent = msg; err.hidden = false; if (el) { el.focus(); el.classList.add('bad'); setTimeout(function () { el.classList.remove('bad'); }, 2600); } return false; }
  function valid(n) {
    err.hidden = true;
    var f = form.elements, v = function (k) { return (f[k].value || '').trim(); };
    if (n === 1 && !S.design) { $('#o-list').hidden = false; return fail('Pick a design first, or choose "Not sure yet".'); }
    if (n === 2) {
      if (!v('business')) return fail('Add your business name.', f.business);
      if (!v('what')) return fail('Tell us in a line what your business does.', f.what);
      if (!v('city')) return fail('Add your city and country.', f.city);
    }
    if (n === 3) {
      if (!v('name')) return fail('Add your name.', f.name);
      if (v('phone').replace(/\D/g, '').length < 8) return fail('Add your WhatsApp number, with the country code (like +91).', f.phone);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))) return fail('That email does not look right. We send your receipt there.', f.email);
    }
    return true;
  }
  function go(n) {
    S.step = n; save();
    $$('.ostep').forEach(function (s) { s.hidden = +s.getAttribute('data-step') !== n; });
    $$('.o-prog li').forEach(function (li) { var p = +li.getAttribute('data-p'); li.classList.toggle('done', p < n); if (p === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    $('#o-title').textContent = TITLES[n];
    $('[data-back]').hidden = n === 1;
    var nx = $('[data-next]'), t = totals();
    if (n === 4) { renderReview(); nx.textContent = t.fixed && payLink() ? 'Pay ' + money(t.now) : 'Place my order'; }
    else nx.textContent = 'Continue';
    err.hidden = true;
    var top = $('.o-head').getBoundingClientRect().top + W.scrollY - 70;
    if (W.scrollY > top) W.scrollTo({ top: top, behavior: 'smooth' });
  }
  $('[data-next]').addEventListener('click', function () {
    if (!valid(S.step)) return;
    if (S.step < 4) { go(S.step + 1); return; }
    place();
  });
  $('[data-back]').addEventListener('click', function () { if (S.step > 1) go(S.step - 1); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  /* ---------- placing the order ---------- */
  function orderId() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return 'HX-' + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  function place() {
    for (var k = 1; k <= 3; k++) if (!valid(k)) { go(k); valid(k); return; }
    var t = totals(), f = S.f, link = t.fixed ? payLink() : '', id = orderId();
    var payWin = link ? W.open(link, '_blank', 'noopener') : null; // open at once, inside the tap, so it is not blocked
    var design = t.s ? t.s.name + ' (' + C.tiers[t.s.tier].name + ' plan)' : 'help me choose';
    var addons = t.list.map(function (x) { return x.a.name + ' ' + money(x.p) + (x.a.monthly ? '/mo' : ''); }).join(', ') || 'none';
    W.HXLead && W.HXLead.post({
      order_id: id, name: f.name, whatsapp: f.phone, email: f.email, best_time_to_call: S.call,
      business: f.business, what_they_do: f.what, city: f.city, current_site: f.current_site || 'none', social: f.social || 'none',
      logo: S.logo || 'not said', domain: S.domain === 'I have one' ? (f.domain_name || 'has one') : (S.domain || 'not said'), pages: S.pages.join(', '),
      custom_order: (S.custom || []).join(', ') || 'none', design: design, addons: addons, total: t.fixed ? money(t.total) : 'to confirm on the call', pay_now: t.fixed ? money(t.now) : 'after the call', monthly: t.mo ? money(t.mo) + '/mo' : 'none',
      payment: link ? 'Razorpay page opened' : 'send the Razorpay link after the call', notes: f.notes || '', source: 'order page', _honey: form.elements._honey.value
    }, 'NEW ORDER ' + id + ': ' + (f.name || '') + ' · ' + design + ' · ' + (t.fixed ? money(t.total) : 'price on call'));
    S.placed = { id: id, at: Date.now() }; save();
    try { localStorage.removeItem(KEY); localStorage.setItem('hx-lead', JSON.stringify({ sent: Date.now(), via: 'order' })); } catch (e) {}

    var wa = ['Hi Hanflux, I just placed order ' + id + '.', '', 'Design: ' + design, 'Add-ons: ' + addons, 'Total: ' + (t.fixed ? money(t.total) : 'to confirm'), '', 'Business: ' + f.business + ', ' + f.city, 'Name: ' + f.name, 'WhatsApp: ' + f.phone].join('\n');
    $$('.ostep').forEach(function (s) { s.hidden = true; });
    $('.o-head').hidden = true; $('#o-bar').hidden = true; err.hidden = true;
    var done = $('#o-done'); done.hidden = false;
    $('#o-id').textContent = 'order ' + id;
    var first = (f.name || '').split(' ')[0];
    $('#o-done-t').textContent = link ? 'Thank you, ' + first + '. Now finish paying.' : 'Order placed. Thank you, ' + first + '.';
    $('#o-done-p').textContent = link
      ? 'The Razorpay payment page opened in a new tab for ' + money(t.now) + '. Once you pay, you get a receipt by email, and we call you on ' + f.phone + ' within ' + (C.callWithinHours || 24) + ' hours to start.'
      : 'We call you on ' + f.phone + ' within ' + (C.callWithinHours || 24) + ' hours to confirm everything and send your secure payment link. Building starts once payment is in, and your site is live within ' + (C.liveHours || 48) + ' hours of payment.';
    var again = $('#o-pay-again'); if (link) { again.href = link; again.hidden = false; again.textContent = payWin ? 'Open the payment page again' : 'Open the payment page'; }
    $('#o-wa').href = 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(wa);
    W.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderAll() { renderPick(); renderSum(); syncChips(); if (S.step === 4) renderReview(); go(S.step); }
  X.onChange(function () { renderPick(); renderSum(); if (S.step === 4) renderReview(); var nx = $('[data-next]'); if (S.step === 4) { var t = totals(); nx.textContent = t.fixed && payLink() ? 'Pay ' + money(t.now) : 'Place my order'; } });
  if (S.logo === 'No, make one for me') $('#o-logo-hint').hidden = false;
  renderAll();
  W.scrollTo(0, 0);
})();
