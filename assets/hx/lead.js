/* Hanflux Design Menu · enquiry pop-up.
   After a visitor has spent C.lead.afterSec seconds (visible time, across pages in one visit) it asks
   for a name, an email and the kind of website, and sends them to the Hanflux inbox through FormSubmit.
   Shown once: never again after a send, and not for 3 days after it is closed. */
(function () {
  'use strict';
  var W = window, D = document, C = W.HX_CONFIG || {}, L = C.lead;
  if (!L || !L.on || !L.endpoint) return;
  if (/^\/(agents|w)\//.test(location.pathname)) return;

  var KEY = 'hx-lead', T_KEY = 'hx-lead-t', DAY = 864e5;
  var st = null;
  try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (st && (st.sent || (st.closed && Date.now() - st.closed < 3 * DAY))) return;

  var TYPES = ['Business website', 'Landing page for a launch or campaign', 'Online store', 'Booking site (clinic, salon, restaurant)',
    'Portfolio or personal brand', '3D or immersive showcase', 'Web app or dashboard', 'Not sure yet'];
  var need = Math.max(5, +L.afterSec || 90) * 1000, spent = 0, last = Date.now(), timer;
  try { spent = +sessionStorage.getItem(T_KEY) || 0; } catch (e) {}

  function remember(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function busy() {
    if (D.querySelector('.sheet.open, .overlay-menu.open')) return true;
    var a = D.activeElement;
    return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName));
  }
  function tick() {
    var now = Date.now();
    if (D.visibilityState === 'visible') spent += Math.min(now - last, 2000);
    last = now;
    try { sessionStorage.setItem(T_KEY, String(spent)); } catch (e) {}
    if (spent >= need && !busy()) { clearInterval(timer); show(); }
  }
  timer = setInterval(tick, 1000);

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function offerOn() { return !!(C.offer && C.offer.on && Date.now() < new Date(C.offer.ends).getTime()); }
  function maxOff() {
    var m = 0, t = C.tiers || {};
    Object.keys(t).forEach(function (k) { if (t[k].was) m = Math.max(m, Math.round((1 - t[k].from / t[k].was) * 100)); });
    return m;
  }
  function picks() {
    try {
      var s = JSON.parse(localStorage.getItem('hx-picks-v2') || 'null'), by = {};
      (W.HX_SITES || []).forEach(function (x) { by[x.slug] = x.name; });
      return ((s && s.w) || []).map(function (x) { return by[x] || x; }).join(', ');
    } catch (e) { return ''; }
  }

  var el, lastFocus;
  function build() {
    el = D.createElement('div');
    el.className = 'sheet lead';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'ld-title');
    var off = maxOff();
    el.innerHTML =
      '<div class="scrim" data-ld-close></div>' +
      '<div class="panel">' +
        '<div class="grabber"></div>' +
        '<button class="icon-btn close-x" type="button" data-ld-close aria-label="Close"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" style="stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<div class="ld-form">' +
          (offerOn() && off ? '<span class="off-sticker ld-stk">Launch offer · up to ' + off + '% off</span>' : '<p class="kicker">hanflux ai</p>') +
          '<h2 id="ld-title">Want a site like these?</h2>' +
          '<p class="sub">Leave your name and email. We will send ideas for your website and a fixed quote within 24 hours.</p>' +
          '<form class="fgrid" novalidate>' +
            '<div class="field full"><label for="ld-name">Your name</label><input id="ld-name" name="name" autocomplete="name" required maxlength="80"></div>' +
            '<div class="field full"><label for="ld-email">Email</label><input id="ld-email" name="email" type="email" inputmode="email" autocomplete="email" required maxlength="120"></div>' +
            '<div class="field full"><label for="ld-type">Type of website</label><select id="ld-type" name="type" required><option value="">Choose one</option>' +
              TYPES.map(function (t) { return '<option>' + esc(t) + '</option>'; }).join('') + '</select></div>' +
            '<input class="ld-hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<p class="ld-err full" role="alert" hidden></p>' +
            '<div class="ld-row full"><button class="btn btn-teal" type="submit">Send me ideas and a quote</button><button class="btn btn-ghost" type="button" data-ld-close>Not now</button></div>' +
          '</form>' +
          '<p class="fine">We only use this to reply to you. No spam, never shared.</p>' +
        '</div>' +
        '<div class="ld-done" hidden>' +
          '<span class="ld-tick" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg></span>' +
          '<h2 class="ld-done-t">Thank you.</h2>' +
          '<p class="sub ld-done-p"></p>' +
          '<div class="ld-row"><button class="btn btn-teal" type="button" data-ld-close>Keep browsing</button>' +
          (C.whatsapp ? '<a class="btn btn-ghost" href="https://wa.me/' + esc(C.whatsapp) + '" target="_blank" rel="noopener">WhatsApp us now</a>' : '') + '</div>' +
        '</div>' +
      '</div>';
    D.body.appendChild(el);
    el.addEventListener('click', function (e) { if (e.target.closest('[data-ld-close]')) close(); });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.classList.contains('open')) close(); });
    el.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); send(); });
  }

  function show() {
    if (!el) build();
    lastFocus = D.activeElement;
    el.classList.add('open'); D.documentElement.style.overflow = 'hidden';
    var coarse = W.matchMedia && W.matchMedia('(pointer: coarse)').matches;
    if (!coarse) setTimeout(function () { try { el.querySelector('#ld-name').focus({ preventScroll: true }); } catch (e) {} }, 420);
  }
  function close() {
    if (!el) return;
    if (!el.__sent) remember({ closed: Date.now() });
    el.classList.remove('open'); D.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  function fail(msg) {
    var e = el.querySelector('.ld-err');
    e.innerHTML = msg; e.hidden = false;
  }
  function send() {
    var f = el.querySelector('form'), btn = f.querySelector('[type="submit"]');
    var name = f.elements.name.value.trim(), email = f.elements.email.value.trim(), type = f.elements.type.value;
    el.querySelector('.ld-err').hidden = true;
    if (!name) { f.elements.name.focus(); return fail('Add your name so we know who to reply to.'); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { f.elements.email.focus(); return fail('That email does not look right.'); }
    if (!type) { f.elements.type.focus(); return fail('Pick the kind of website you need.'); }
    btn.disabled = true; btn.textContent = 'Sending…';
    var shortlist = picks();
    var body = {
      name: name, email: email, website_type: type,
      page: location.href, shortlist: shortlist || 'none yet', launch_offer: offerOn() ? 'yes' : 'no',
      _subject: 'Design menu enquiry: ' + type + ' (' + name + ')',
      _replyto: email, _template: 'table', _captcha: 'false', _honey: f.elements._honey.value
    };
    fetch(L.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return { success: r.ok }; }); })
      .then(function (j) {
        if (!(j && (j.success === true || j.success === 'true'))) throw new Error((j && j.message) || 'not sent');
        el.__sent = true; remember({ sent: Date.now() });
        el.querySelector('.ld-form').hidden = true;
        var done = el.querySelector('.ld-done'); done.hidden = false;
        el.querySelector('.ld-done-t').textContent = 'Thank you, ' + name.split(' ')[0] + '.';
        el.querySelector('.ld-done-p').textContent = 'We will email you at ' + email + ' within 24 hours with ideas and a fixed quote.';
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = 'Send me ideas and a quote';
        fail('That did not go through. Please try again' + (C.whatsapp ? ', or <a href="https://wa.me/' + esc(C.whatsapp) + '" target="_blank" rel="noopener">message us on WhatsApp</a>' : '') + '.');
      });
  }
})();
