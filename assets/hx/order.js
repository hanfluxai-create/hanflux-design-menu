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
  // online payment: /api/pay/ makes a Razorpay link for the exact amount (only once the keys are set in Vercel)
  var online = false;
  if (PAY.online && W.fetch) fetch('/api/pay/', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (j) { online = !!(j && j.ready); if (S.step === 4) go(4); }).catch(function () {});
  function canPay(t) { return t.fixed && (online || !!payLink()); }

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
    $('#o-pay').innerHTML = canPay(t)
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
    if (n === 4) { renderReview(); nx.textContent = canPay(t) ? 'Pay ' + money(t.now) : 'Place my order'; }
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
    var t = totals(), f = S.f, id = orderId(), nx = $('[data-next]');
    var design = t.s ? t.s.name + ' (' + C.tiers[t.s.tier].name + ' plan)' : 'help me choose';
    var addons = t.list.map(function (x) { return x.a.name + ' ' + money(x.p) + (x.a.monthly ? '/mo' : ''); }).join(', ') || 'none';
    var lead = function (payment, extra) {
      return W.HXLead && W.HXLead.post(Object.assign({
        order_id: id, name: f.name, whatsapp: f.phone, email: f.email, best_time_to_call: S.call,
        business: f.business, what_they_do: f.what, city: f.city, current_site: f.current_site || 'none', social: f.social || 'none',
        logo: S.logo || 'not said', domain: S.domain === 'I have one' ? (f.domain_name || 'has one') : (S.domain || 'not said'), pages: S.pages.join(', '),
        custom_order: (S.custom || []).join(', ') || 'none', design: design, addons: addons,
        total: t.fixed ? money(t.total) : 'to confirm on the call', pay_now: t.fixed ? money(t.now) : 'after the call', monthly: t.mo ? money(t.mo) + '/mo' : 'none',
        payment: payment, notes: f.notes || '', source: 'order page', _honey: form.elements._honey.value
      }, extra || {}), 'NEW ORDER ' + id + ': ' + (f.name || '') + ' · ' + design + ' · ' + (t.fixed ? money(t.total) : 'price on call'));
    };
    var waText = ['Hi Hanflux, I just placed order ' + id + '.', '', 'Design: ' + design, 'Add-ons: ' + addons, 'Total: ' + (t.fixed ? money(t.total) : 'to confirm'), '', 'Business: ' + f.business + ', ' + f.city, 'Name: ' + f.name, 'WhatsApp: ' + f.phone].join('\n');
    var remember = function () {
      S.placed = { id: id, at: Date.now() };
      try { localStorage.removeItem(KEY); localStorage.setItem('hx-lead', JSON.stringify({ sent: Date.now(), via: 'order' })); localStorage.setItem('hx-last-order', JSON.stringify({ id: id, name: f.name, phone: f.phone, design: design, total: t.fixed ? money(t.total) : '' })); } catch (e) {}
    };
    var finish = function (mode, link) { remember(); showDone(mode, { id: id, name: f.name, phone: f.phone, amount: t.fixed ? money(t.now) : '', link: link, wa: waText }); };
    // 1. online: the server makes a Razorpay link for the exact amount, and the client goes straight to it
    if (t.fixed && online) {
      nx.disabled = true; nx.textContent = 'Opening secure payment…';
      fetch('/api/pay/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: id, design: t.s.slug, addons: t.list.map(function (x) { return x.a.id; }), cur: X.cur(), name: f.name, phone: f.phone, email: f.email }) })
        .then(function (r) { return r.json().then(function (j) { return r.ok && j.url ? j : Promise.reject(j); }); })
        .then(function (j) {
          remember();
          var goPay = function () { location.href = j.url; };
          Promise.resolve(lead('Razorpay link sent to the client', { razorpay_link: j.url })).then(goPay, goPay);
          setTimeout(goPay, 2500);
        })
        .catch(function () { nx.disabled = false; lead('online link failed: send the Razorpay link after the call'); finish(payLink() ? 'link' : 'call', payLink()); });
      return;
    }
    // 2. a fixed payment page, if one is set; 3. otherwise we call and send the link
    var link = t.fixed ? payLink() : '';
    if (link) W.open(link, '_blank', 'noopener');
    lead(link ? 'Razorpay page opened' : 'send the Razorpay link after the call');
    finish(link ? 'link' : 'call', link);
  }
  function showDone(mode, o) {
    $$('.ostep').forEach(function (s) { s.hidden = true; });
    $('.o-head').hidden = true; $('#o-bar').hidden = true; err.hidden = true;
    var done = $('#o-done'); done.hidden = false;
    $('#o-id').textContent = 'order ' + o.id;
    var first = (o.name || '').split(' ')[0];
    var hrs = C.callWithinHours || 24, live = C.liveHours || 48;
    var T = {
      paid: ['Payment received. Thank you' + (first ? ', ' + first : '') + '.', 'We call you on ' + o.phone + ' within ' + hrs + ' hours to collect your domain, logo, photos and text. Your site is live within ' + live + ' hours of your payment. Your receipt is on its way by email.'],
      check: ['Thank you' + (first ? ', ' + first : '') + '.', 'We are confirming your payment with Razorpay and will call you on ' + o.phone + ' within ' + hrs + ' hours. If you paid, you also get a receipt by email.'],
      link: ['Thank you, ' + first + '. Now finish paying.', 'The Razorpay payment page opened in a new tab. Enter ' + o.amount + ' and your order number ' + o.id + '. Once you pay, we call you on ' + o.phone + ' within ' + hrs + ' hours.'],
      call: ['Order placed. Thank you, ' + first + '.', 'We call you on ' + o.phone + ' within ' + hrs + ' hours to confirm everything and send your secure payment link. Building starts once payment is in, and your site is live within ' + live + ' hours of payment.']
    }[mode];
    $('#o-done-t').textContent = T[0];
    $('#o-done-p').textContent = T[1];
    var again = $('#o-pay-again'); again.hidden = !(mode === 'link' && o.link); if (o.link) again.href = o.link;
    $('#o-wa').href = 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(o.wa || ('Hi Hanflux, about my order ' + o.id + '.'));
    W.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // back from Razorpay: /order/?paid=1&razorpay_... (the server checks the signature)
  if (q.get('paid') === '1') {
    var last = {}; try { last = JSON.parse(localStorage.getItem('hx-last-order') || '{}') || {}; } catch (e) {}
    var ref = q.get('razorpay_payment_link_reference_id') || last.id || '';
    $$('.ostep').forEach(function (s) { s.hidden = true; }); $('#o-bar').hidden = true;
    fetch('/api/verify/' + location.search, { cache: 'no-store' }).then(function (r) { return r.json(); }).catch(function () { return { ok: false }; }).then(function (j) {
      showDone(j.ok ? 'paid' : 'check', { id: ref, name: last.name || '', phone: last.phone || 'your number', wa: 'Hi Hanflux, I just paid for order ' + ref + '.' });
      if (j.ok && W.HXLead) W.HXLead.post({ order_id: ref, name: last.name, whatsapp: last.phone, design: last.design, total: last.total, payment_id: q.get('razorpay_payment_id'), status: 'PAID (signature verified)', source: 'order page' }, 'PAID ' + ref + ': ' + (last.name || '') + ' · ' + (last.total || ''));
      if (history.replaceState) history.replaceState(null, '', '/order/');
    });
    return;
  }

  function renderAll() { renderPick(); renderSum(); syncChips(); if (S.step === 4) renderReview(); go(S.step); }
  X.onChange(function () { renderPick(); renderSum(); if (S.step === 4) renderReview(); var nx = $('[data-next]'); if (S.step === 4) { var t = totals(); nx.textContent = canPay(t) ? 'Pay ' + money(t.now) : 'Place my order'; } });
  if (S.logo === 'No, make one for me') $('#o-logo-hint').hidden = false;
  renderAll();
  W.scrollTo(0, 0);
})();
