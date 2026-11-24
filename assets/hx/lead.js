/* Hanflux Design Menu · leads: the free website plan.
   - HXLead.post(data): saves any enquiry to the Hanflux inbox through FormSubmit (in the background).
   - HXLead.open(): the "free website plan" sheet: name, WhatsApp number, type of business.
   - Forms marked data-lead-form (the one on the home page) work the same way inline.
   - After C.lead.afterSec seconds of visible time in one visit, the sheet opens once by itself.
     Never again after a send, and not for 3 days after it is closed. */
(function () {
  'use strict';
  var W = window, D = document, C = W.HX_CONFIG || {}, L = C.lead || {};
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var KEY = 'hx-lead', T_KEY = 'hx-lead-t', DAY = 864e5;
  var TYPES = ['Shop or brand', 'Restaurant, café or bar', 'Clinic, salon or wellness', 'Hotel, travel or events', 'Tech company or startup', 'Services: law, finance, construction', 'School, coaching or NGO', 'Something else'];
  var WA_IC = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="fill:currentColor;stroke:none"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.9 9.9 0 0 0 12.04 2zm5.8 14.16c-.24.69-1.42 1.32-1.96 1.37-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.61.47.24.56.79 1.92.86 2.06.07.14.11.3.02.48-.09.18-.14.3-.27.46l-.41.48c-.14.14-.28.29-.12.56.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.14.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.58.75 1.85.88.27.14.45.2.52.32.07.11.07.66-.17 1.35z"/></svg>';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cur() { return D.documentElement.classList.contains('cur-usd') ? 'usd' : 'inr'; }
  function offerOn() { return !!(C.offer && C.offer.on && Date.now() < new Date(C.offer.ends).getTime()); }
  function remember(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function state() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function picks() {
    try {
      var s = JSON.parse(localStorage.getItem('hx-picks-v2') || 'null'), by = {};
      (W.HX_SITES || []).forEach(function (x) { by[x.slug] = x.name; });
      return ((s && s.w) || []).map(function (x) { return by[x] || x; }).join(', ');
    } catch (e) { return ''; }
  }

  /* ---------- save an enquiry: emailed from the browser (Web3Forms) and saved on our server ---------- */
  // 1. Web3Forms emails it to the owner straight from the browser (its access key is public by design).
  // 2. /factory/api/lead/ saves it in the private lead store, and emails it from the server if step 1 failed.
  // The visitor sees "thank you" once the email went out; if it could not (an ad blocker, say), the lead is
  // still saved and the visitor is asked to send it on WhatsApp too, so the owner hears about it either way.
  function j(r) { return r.json().catch(function () { return { success: r.ok }; }); }
  function post(data, subject) {
    if (data && data._honey) return Promise.resolve(true); // a bot filled the hidden field
    var body = { _subject: subject || ('Website lead: ' + (data.name || 'new enquiry')) };
    Object.keys(data || {}).forEach(function (k) { if (k !== '_honey' && data[k] != null && data[k] !== '') body[k] = data[k]; });
    body.page = location.href; body.prices_in = cur().toUpperCase(); body.offer = offerOn() ? (C.offer.label || 'yes') : 'no';
    if (data.email) body.replyto = data.email;
    var mail = Promise.resolve(false);
    if (L.web3) {
      try {
        var wb = { access_key: L.web3, subject: body._subject, from_name: 'Hanflux Design Factory' };
        Object.keys(body).forEach(function (k) { if (k.charAt(0) !== '_') wb[k] = body[k]; });
        mail = fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(wb) })
          .then(j).then(function (x) { return !!(x && x.success); }).catch(function () { return false; });
      } catch (e) {}
    }
    return mail.then(function (emailed) {
      body.emailed = emailed;
      if (!L.api) return emailed;
      return fetch(L.api, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(j).then(function () { return emailed; }).catch(function () { return emailed; });
    });
  }

  function waText(d) {
    var l = ['Hi Hanflux, I would like my free website plan.', '', 'Name: ' + d.name, 'Business: ' + d.type];
    if (d.kind) l.push('I want: ' + d.kind);
    var p = picks(); if (p) l.push('Designs I liked: ' + p);
    return l.join('\n');
  }

  /* ---------- a lead form: inline or in the sheet ---------- */
  function bind(form, opts) {
    var wrap = opts.wrap || form.parentNode;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, err = $('.ld-err', form), btn = $('[type="submit"]', form);
      var name = (f.name.value || '').trim(), phone = (f.phone.value || '').trim(), type = f.type.value, digits = phone.replace(/\D/g, '');
      err.hidden = true;
      var bad = function (msg, el) { err.textContent = msg; err.hidden = false; el.focus(); };
      if (!name) return bad('Add your name so we know who to reply to.', f.name);
      if (digits.length < 8) return bad('Add your WhatsApp number, with the country code (like +91).', f.phone);
      if (!type) return bad('Pick the kind of business you have.', f.type);
      btn.disabled = true; var label = btn.textContent; btn.textContent = 'Sending…';
      var d = { name: name, phone: phone, type: type, kind: opts.kind ? opts.kind() : '' };
      post({ name: name, whatsapp: phone, business_type: type, wants: d.kind || 'free website plan', liked_designs: picks() || 'none yet', source: opts.source || 'form', _honey: f._honey ? f._honey.value : '' },
        'Free plan request: ' + name + ' · ' + type).then(function (ok) {
        remember({ sent: Date.now() });
        btn.disabled = false; btn.textContent = label;
        form.hidden = true;
        var done = $('.ld-done', wrap); done.hidden = false;
        var first = name.split(' ')[0];
        $('.ld-done-t', done).textContent = ok ? 'Thank you, ' + first + '.' : 'Almost done, ' + first + '.';
        $('.ld-done-p', done).textContent = ok ? 'We will WhatsApp you at ' + phone + ' within 24 hours with your free plan and a fixed price.' : 'Tap below to send it to us on WhatsApp. It takes one tap, and we reply within 24 hours.';
        var wa = $('.ld-wa', done);
        if (wa) { wa.href = 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(waText(d)); wa.lastChild.textContent = ok ? 'Also send it on WhatsApp' : 'Send it on WhatsApp'; }
      });
    });
  }

  /* ---------- the sheet ---------- */
  var el, lastFocus, kindNow = '';
  function build() {
    el = D.createElement('div');
    el.className = 'sheet lead';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'ld-title');
    el.innerHTML =
      '<div class="scrim" data-ld-close></div>' +
      '<div class="panel">' +
        '<div class="grabber"></div>' +
        '<button class="icon-btn close-x" type="button" data-ld-close aria-label="Close"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" style="stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<div class="ld-wrap">' +
          (offerOn() ? '<span class="off-sticker ld-stk">launch prices end ' + esc(C.offer.endsLabel) + '</span>' : '<p class="kicker">hanflux ai</p>') +
          '<h2 id="ld-title">Get your free website plan</h2>' +
          '<p class="sub">Within 24 hours we WhatsApp you the design that fits your business, the pages you need and a fixed price. Free, no obligation.</p>' +
          '<form class="fgrid" novalidate>' +
            '<div class="field full"><label for="ld-name">Your name</label><input id="ld-name" name="name" autocomplete="name" required maxlength="80"></div>' +
            '<div class="field full"><label for="ld-phone">WhatsApp number</label><input id="ld-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="24" placeholder="+91 98xxx xxxxx"></div>' +
            '<div class="field full"><label for="ld-type">Your business</label><select id="ld-type" name="type" required><option value="">Choose one</option>' +
              TYPES.map(function (t) { return '<option>' + esc(t) + '</option>'; }).join('') + '</select></div>' +
            '<input class="ld-hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<p class="ld-err full" role="alert" hidden></p>' +
            '<div class="ld-row full"><button class="btn btn-teal" type="submit">Send me my free plan</button></div>' +
          '</form>' +
          '<p class="fine">Takes 20 seconds. Your details go only to Hanflux AI. Prefer to chat? <a class="teal" href="https://wa.me/' + esc(C.whatsapp) + '" target="_blank" rel="noopener">WhatsApp us</a>.</p>' +
          '<div class="ld-done" hidden>' +
            '<span class="ld-tick" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg></span>' +
            '<h2 class="ld-done-t">Thank you.</h2>' +
            '<p class="sub ld-done-p"></p>' +
            '<div class="ld-row"><a class="btn btn-wa ld-wa" href="#" target="_blank" rel="noopener">' + WA_IC + '<span>Also send it on WhatsApp</span></a><button class="btn btn-ghost" type="button" data-ld-close>Keep browsing</button></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    D.body.appendChild(el);
    el.addEventListener('click', function (e) { if (e.target.closest('[data-ld-close]')) close(); });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.classList.contains('open')) close(); });
    var form = $('form', el);
    bind(form, { wrap: $('.ld-wrap', el), source: 'free plan sheet', kind: function () { return kindNow; } });
    form.addEventListener('submit', function () { el.__sent = true; });
  }
  function open(opts) {
    opts = opts || {};
    if (!el) build();
    kindNow = opts.kind || '';
    var form = $('form', el);
    if (!el.__sent) { form.hidden = false; $('.ld-done', el).hidden = true; }
    lastFocus = D.activeElement;
    el.classList.add('open'); D.documentElement.style.overflow = 'hidden';
    var coarse = W.matchMedia && W.matchMedia('(pointer: coarse)').matches;
    if (!coarse) setTimeout(function () { try { $('#ld-name', el).focus({ preventScroll: true }); } catch (e) {} }, 420);
  }
  function close() {
    if (!el) return;
    var s = state();
    if (!(s && s.sent)) remember({ closed: Date.now() });
    el.classList.remove('open'); D.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }

  W.HXLead = { open: open, post: post };

  function init() {
    // every "free plan" button
    D.addEventListener('click', function (e) {
      var b = e.target.closest('[data-open-plan]'); if (!b) return;
      e.preventDefault(); open({ kind: b.getAttribute('data-kind') || '' });
    });
    // inline forms
    $$('form[data-lead-form]').forEach(function (f) { bind(f, { source: 'home page form' }); });

    // the timed pop-up
    if (!L.on || !L.api || /^(\/factory)?\/(agents|w|order)\//.test(location.pathname)) return;
    var st = state(), force = /[?&]lead=now\b/.test(location.search);   // add ?lead=now to test the pop-up
    if (!force && st && (st.sent || (st.closed && Date.now() - st.closed < 3 * DAY))) return;
    var need = Math.max(5, +L.afterSec || 60) * 1000, spent = 0, last = Date.now(), timer;
    try { spent = +sessionStorage.getItem(T_KEY) || 0; } catch (e) {}
    if (force) need = 0;
    var busy = function () {
      if (D.querySelector('.sheet.open, .overlay-menu.open')) return true;
      var a = D.activeElement;
      return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName));
    };
    timer = setInterval(function () {
      var now = Date.now();
      if (D.visibilityState === 'visible') spent += Math.min(now - last, 2000);
      last = now;
      try { sessionStorage.setItem(T_KEY, String(spent)); } catch (e) {}
      var s2 = state(); if (s2 && s2.sent) { clearInterval(timer); return; }
      if (spent >= need && !busy()) { clearInterval(timer); open({}); }
    }, 1000);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();
