#!/usr/bin/env node
// Hanflux Design Menu · static build: renders pages from tools/pages + tools/partials and data/*.js.
// Usage: node tools/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const T = (p) => fs.readFileSync(path.join(ROOT, 'tools', p), 'utf8');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['data/config.js', 'data/sites.js', 'assets/agents/styles-data.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx);
const C = ctx.window.HX_CONFIG, SITES = ctx.window.HX_SITES, LOOKS = ctx.window.HX_STYLES || [];
const AGENT_FONTS = ctx.window.HX_AGENT_FONTS || '';
const V = Date.now().toString(36);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const ARROW = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const ARROW_L = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.4A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.5c0 5.8-7.5 10.4-7.5 10.4z"/></svg>';
const EXT = '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" style="stroke:currentColor;fill:none;stroke-width:2"><path d="M14 5h5v5M19 5l-8 8M10 5H5v14h14v-5"/></svg>';
const LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
const WA_IC = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="fill:currentColor;stroke:none"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.9 9.9 0 0 0 12.04 2zm5.8 14.16c-.24.69-1.42 1.32-1.96 1.37-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.61.47.24.56.79 1.92.86 2.06.07.14.11.3.02.48-.09.18-.14.3-.27.46l-.41.48c-.14.14-.28.29-.12.56.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.14.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.58.75 1.85.88.27.14.45.2.52.32.07.11.07.66-.17 1.35z"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';

// ---------- money: every price exists in rupees (India) and dollars (everyone else) ----------
const CURS = ['inr', 'usd'];
const money = (n, cur) => { const c = C.currencies[cur]; return c.symbol + Math.round(n).toLocaleString(c.locale); };
// one inline price per currency; CSS shows the visitor's currency only
const dual = (fn) => CURS.map((c) => `<span class="c-${c}">${fn(c)}</span>`).join('');
const tierFrom = (t, c) => C.tiers[t][c].from, tierWas = (t, c) => C.tiers[t][c].was || C.tiers[t][c].from;
const order = ['essential', 'growth', 'signature', 'flagship'];
// flat price in dated steps: one span per step, the head script shows the step that applies now (html.ps0, ps1, ...)
const PR = C.pricing, NST = PR.stages.length;
const stepVal = (k, c) => (k < NST ? PR.stages[k][c] : PR.regular[c]);
const steps = (fn) => Array.from({ length: NST + 1 }, (_, k) => `<span class="st st${k}">${fn(k)}</span>`).join('');
const flatNow = (c) => steps((k) => money(stepVal(k, c), c));
// the ladder: every higher step crossed out, then the price now
const ladder = (c, full = true) => steps((k) => { const was = []; for (let j = NST; j > k; j--) { if (full || j === NST) was.push(`<s class="was">${money(stepVal(j, c), c)}</s>`); } return (was.length ? was.join(' ') + ' ' : '') + `<span class="now">${money(stepVal(k, c), c)}</span>`; });
const stepLabel = steps((k) => (k < NST ? esc(PR.stages[k].label) : 'Regular price'));
const stepEnds = steps((k) => (k < NST ? 'ends ' + esc(PR.stages[k].endsLabel) : 'from 1 Jan 2027'));
const priceFromAll = dual(flatNow);
const curSwitch = (cls = '') => `<div class="cur-switch${cls}" role="group" aria-label="Show prices for"><button type="button" data-cur="inr">India ₹</button><button type="button" data-cur="usd">Outside India $</button></div>`;

// only list styles whose demo folder exists
const live = SITES.filter((s) => fs.existsSync(path.join(ROOT, 'w', s.slug, 'index.html')));
const missing = SITES.filter((s) => !live.includes(s)).map((s) => s.slug);
const EX = new Set(C.examples || []);
const WALLED = new Set(C.walled || []);
const isEx = (s) => EX.has(s.slug);
const sale = live.filter((s) => !isEx(s));   // designs a client can order
const exs = live.filter(isEx);               // our own sites: examples, not for sale
const nSites = sale.length;
const by = Object.fromEntries(live.map((s) => [s.slug, s]));
const hostOf = (s) => (s.live ? s.live.replace(/^https?:\/\//, '').replace(/\/$/, '') : s.domain || '');
const kindOf = (t) => C.tiers[t].kind;

// ---------- launch offer ----------
const OFFER = C.offer && C.offer.on ? C.offer : null;
const offPct = (t, c) => Math.round((1 - PR.stages[0][c] / PR.regular[c]) * 100);
// "up to X% off" must hold in both currencies: use the smaller of the two maximums
const maxPct = Math.min(...CURS.map((c) => Math.max(...order.map((t) => offPct(t, c)))));
const daysLeft = OFFER ? Math.max(0, Math.floor((new Date(OFFER.ends) - Date.now()) / 864e5)) : 0;
const offerVars = {
  offer_script: `<script>(function(){var d=document.documentElement;try{var n=Date.now(),e=[${PR.stages.map((x) => new Date(x.ends).getTime()).join(',')}],k=0;while(k<e.length&&n>=e[k])k++;d.classList.add('ps'+k,k<e.length?'has-offer':'offer-over')}catch(e){d.classList.add('ps0','has-offer')}try{var t=localStorage.getItem('hx-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))d.classList.add('dark')}catch(e){}})()</script>`,
  offer_bar: (() => {
    const item = `<span class="ob-i"><span class="ob-dot" aria-hidden="true"></span>${stepLabel}: any design ${dual((c) => ladder(c, false))}</span>` +
      `<span class="ob-i"><b>${steps((k) => (k < NST ? 'Ends ' + esc(PR.stages[k].endsLabel) : 'Hosting included'))}</b> <b data-countdown-days>${daysLeft} days left</b></span>` +
      `<span class="ob-i">Hosting included</span><span class="ob-i">Live in 48 hours</span><span class="ob-i">Apps, emails and dashboards to order</span>`;
    return `<div class="offer-bar" role="region" aria-label="Current offer"><a class="ob-in" href="/factory/#pricing"><span class="ob-track">${item}${item.replace(/data-countdown-days/g, 'data-countdown-days aria-hidden="true"')}</span></a></div>`;
  })(),
  step_label: stepLabel, step_ends: stepEnds,
  offer_note: OFFER ? esc(OFFER.note) : '', offer_ends: `${daysLeft} days`, off_max: maxPct + '%', off_num: maxPct
};
// currency (and phone) class on <html> before first paint, so prices never flash in the wrong currency
const curScript = `<script>(function(){var d=document.documentElement,c='inr';try{var q=new URLSearchParams(location.search).get('cur'),s=localStorage.getItem('hx-cur');if(q==='inr'||q==='usd'){c=q;localStorage.setItem('hx-cur',c)}else if(s==='inr'||s==='usd'){c=s}else{var tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){}c=/^Asia\\/(Kolkata|Calcutta)$/.test(tz)||/-IN$/i.test(navigator.language||'')?'inr':'usd'}}catch(e){}d.classList.add('cur-'+c);try{if((matchMedia('(pointer: coarse)').matches&&Math.min(screen.width,screen.height)<900)||innerWidth<760)d.classList.add('is-phone')}catch(e){}})()</script>`;

const waHello = encodeURIComponent('Hi Hanflux, I saw your design menu and I would like a website for my business.');
const partial = (name, cur) => {
  let h = T(`partials/${name}.html`);
  h = h.replace(/\{\{cur:(\w+)\}\}/g, (_, k) => (k === cur ? ' aria-current="page"' : ''));
  return h;
};
function render(tpl, vars, cur, suffix = '') {
  let h = tpl.replace('{{head}}', partial('head' + suffix)).replace('{{nav}}', partial('nav' + suffix, cur)).replace('{{foot}}', partial('foot' + suffix));
  const all = { ...offerVars, cur_script: curScript, cur_switch: curSwitch(), n_ex: exs.length, wa: C.whatsapp, wa_label: esc(C.whatsappLabel), wa_hello: waHello, wa_ic: WA_IC, v: V, n_sites: nSites, n_agents: LOOKS.length, agent_fonts: esc(AGENT_FONTS), price_from: priceFromAll, arrow: ARROW, arrow_l: ARROW_L, ...vars };
  h = h.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in all ? String(all[k]) : m));
  const left = h.match(/\{\{[^}]+\}\}/g);
  if (left) throw new Error('unfilled tokens: ' + [...new Set(left)].join(', '));
  return h;
}
const write = (rel, html) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, html); };
const tierBadge = (t) => `<span class="tier tier-${t}">${esc(kindOf(t))}</span>`;

// the device frames, rendered into the page with their still posters (frames.js brings them to life)
const PLAY = '<span class="play-badge" aria-hidden="true"><i><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></i>Tap to watch live</span>';
// Phone status bar (time, signal, wifi, battery). Like Safari, it takes the colour at the top of the page:
// posters/top.json holds that colour per design (written by tools/posters.py).
const TOP = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'posters/top.json'), 'utf8')); } catch (e) { return {}; } })();
const lum = (hex) => { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return 0; const n = parseInt(m[1], 16); return (0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255; };
const SB_ICONS = '<i><svg viewBox="0 0 18 12"><rect x="0" y="8" width="3.2" height="4" rx=".8"/><rect x="4.9" y="5.6" width="3.2" height="6.4" rx=".8"/><rect x="9.8" y="3" width="3.2" height="9" rx=".8"/><rect x="14.7" y="0" width="3.2" height="12" rx=".8"/></svg>' +
  '<svg viewBox="0 0 16 12"><path d="M8 2.2c2.5 0 4.7.9 6.4 2.5l1.3-1.4C13.6 1.3 10.9.2 8 .2S2.4 1.3.3 3.3l1.3 1.4C3.3 3.1 5.5 2.2 8 2.2zm0 3.7c1.4 0 2.7.5 3.7 1.4l1.3-1.4C11.6 4.7 9.9 4 8 4s-3.6.7-5 1.9l1.3 1.4c1-.9 2.3-1.4 3.7-1.4zm0 3.6c.5 0 .9.2 1.3.5L8 11.8 6.7 10c.4-.3.8-.5 1.3-.5z"/></svg>' +
  '<svg viewBox="0 0 27 12"><rect x=".6" y=".6" width="22.6" height="10.8" rx="3.3" fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="1.1"/><rect x="2.3" y="2.3" width="17.4" height="7.4" rx="1.9"/><path d="M24.6 4.1v3.8c.8-.3 1.4-1 1.4-1.9s-.6-1.6-1.4-1.9z" opacity=".45"/></svg></i>';
const sbar = (s) => { const c = TOP[s.slug] || s.bg || '#0b0d13'; return `<span class="sbar${lum(c) > 0.62 ? ' lt' : ''}" style="--sb-bg:${c}" aria-hidden="true"><b>9:41</b>${SB_ICONS}</span>`; };
const LSTATE = '<div class="lstate" aria-hidden="true"><span class="ls-wait"><i></i>Real website · loads in a moment</span><span class="ls-load"><i></i>Loading the live website<em></em></span><span class="ls-live"><i></i>Live · touch and scroll it</span></div>';
const stageHtml = (s, { id = '', cls = '', eager = false, badge = false, state = false } = {}) => {
  const lz = eager ? 'eager' : 'lazy';
  const img = (k, w, h) => `<img src="/factory/posters/${s.slug}-${k}.webp" alt="" width="${w}" height="${h}" loading="${lz}" decoding="async"${eager && k === 'd' ? ' fetchpriority="high"' : ''}>`;
  const vp = (k, w, h) => `<div class="vp" data-k="${k}"><div class="poster"><div class="pfall"><b>${esc(s.brand)}</b></div>${img(k, w, h)}</div><span class="loading"><i></i>loading live site</span><span class="prog"></span></div>`;
  return `<div class="stage combo${cls}"${id ? ` id="${id}"` : ''} data-stage data-slug="${s.slug}" style="--accent:${s.accent};--frame-bg:${s.bg || '#0b0d13'}">` +
    `<div class="dev-d"><div class="d-bar"><span class="d-dots"><i></i><i></i><i></i></span><span class="d-url">${LOCK}${esc(s.domain || s.slug + '.com')}</span></div>${vp('d', 720, 450)}</div>` +
    `<div class="dev-m">${vp('m', 300, 649).replace('<div class="poster">', sbar(s) + '<div class="poster">')}<span class="isl"></span>${state ? LSTATE : ''}</div>${badge ? PLAY : ''}</div>`;
};
// a big price line: the price from 1 Jan above (crossed out during the launch), "from <launch price>" below
const priceBlock = (cls, t, small = 'flat') => CURS.map((c) => `<div class="${cls} c-${c}" data-price-block><small>${small}</small>${ladder(c)}</div>`).join('');
const priceInline = (t) => dual((c) => ladder(c, false));
const priceNow = (t) => dual(flatNow);

// ---------- home ----------
const bizChips = C.biz.map((b) => { const n = b.slugs.filter((x) => by[x] && !isEx(by[x])).length; return `<a class="chip" role="listitem" href="/factory/websites/?biz=${b.id}">${esc(b.label)} <span>${n}</span></a>`; }).join('');
const GAL = ['liquid', 'estate', 'glass', 'silk', 'comic', 'gold', 'deco', 'swiss', 'halftone', 'particles', 'neon', 'editorial'].filter((x) => by[x] && !isEx(by[x]));
const galleryHtml = GAL.map((x, i) => { const s = by[x]; return `<a class="gcard" href="/factory/websites/${s.slug}/" style="--accent:${s.accent}" aria-label="${esc(s.name)}, a ${esc(s.industry.toLowerCase())} website, from ${esc(money(tierFrom(s.tier, 'inr'), 'inr'))}">
        ${stageHtml(s, { eager: i < 2, badge: true })}
        <span class="gc-type">${esc(s.industry)}</span>
        <b class="gc-name">${esc(s.name)}</b>
        <span class="gc-price">from ${priceNow(s.tier)} <small>· ${esc(kindOf(s.tier))}</small></span>
        <span class="gc-go">See it live${ARROW}</span>
      </a>`; }).join('\n      ');
const compareHtml = `<table class="cmp"><thead><tr><th scope="col"><span class="sr">What you compare</span></th><th scope="col">A typical agency</th><th scope="col">The Hanflux design factory</th></tr></thead><tbody>
  <tr><th scope="row">Price for a custom-looking site</th><td>${dual((c) => esc(C.agency[c]))}</td><td><b>${priceFromAll} flat</b></td></tr>
  <tr><th scope="row">Hosting</th><td>Extra, every month</td><td><b>Included</b></td></tr>
  <tr><th scope="row">Time to launch</th><td>4 to 10 weeks</td><td><b>Within ${C.liveHours} hours</b></td></tr>
  <tr><th scope="row">See it before you buy</th><td>Mock-ups and promises</td><td><b>${nSites} live, working designs</b></td></tr>
  <tr><th scope="row">Checks before launch</th><td>Varies</td><td><b>12-point check, every site</b></td></tr>
</tbody></table>`;
const checksHtml = C.checks.map((x, k) => `<li${k >= 6 ? ' class="more"' : ''}><span class="mono">${pad(k + 1)}</span>${esc(x)}</li>`).join('');
const includedHtml = C.included.map((x) => `<li>${CHECK}<span>${esc(x)}</span></li>`).join('');
// the price steps, as a timeline: past steps fade, the one that applies now glows
const ladderSteps = [...PR.stages.map((x, k) => ({ k, label: x.label, when: 'until ' + x.endsLabel, v: (c) => x[c] })), { k: NST, label: 'Regular price', when: 'from 1 Jan 2027', v: (c) => PR.regular[c] }]
  .map((x) => `<li class="lad lad${x.k}"><span class="lad-l">${esc(x.label)}</span><b>${dual((c) => money(x.v(c), c))}</b><span class="lad-w">${esc(x.when)}</span></li>`).join('');
const tiersHtml = `<article class="flat-card rv">
    <div class="fc-main">
      <p class="kicker dotk">${stepLabel}</p>
      <h3 class="display fc-h">One flat price.<br>Any design.</h3>
      ${priceBlock('fc-price', 'flagship', 'flat')}
      <p class="fc-ends">${stepEnds} · <b data-countdown>${offerVars.offer_ends}</b> left · hosting included</p>
      <p class="fc-p">Minimal, business, animated or full 3D: every design in the menu is the same price, and so is a custom design at the same level. Your name, logo, photos and words, live on your own domain.</p>
      <div class="cta"><a class="btn btn-teal" href="/factory/websites/">Pick my design${ARROW}</a><button class="btn btn-ghost" type="button" data-open-plan>Get my free website plan</button></div>
    </div>
    <ol class="ladder" aria-label="Price steps">${ladderSteps}</ol>
  </article>`;
const addonCard = (a) => `<li class="ao-card"><b>${esc(a.name)}</b><span class="ao-p">${dual((c) => (a[c] ? money(a[c], c) : '') + (a[c] && a.mo ? ' <i>+</i> ' : '') + (a.mo ? money(a.mo[c], c) + '<small>/mo</small>' : ''))}</span><span class="ao-d">${esc(a.desc)}</span></li>`;
const servicesHtml = C.services.map((x, k) => `<li class="svc svc-${x.id} rv"><span class="svc-n mono">${pad(k + 1)}</span><b>${esc(x.name)}</b><span class="svc-l">${esc(x.line)}</span><span class="svc-p">${x.price === 'flat' ? `${priceFromAll} flat` : `from ${dual((c) => money(x[c], c))}`}</span></li>`).join('');
const addonsHtml = `<ul class="ao-grid">${C.addons.map(addonCard).join('')}</ul>`;
// a 3D design running live in a phone frame: proof that these are real websites, not pictures
const wk = by.liquid || sale[0];
const workHtml = wk ? `<div class="wk-card rv">
        <div class="wk-copy">
          <p class="kicker dotk">not a screenshot</p>
          <h2 class="display h-md" id="work-title">Real 3D. Real websites.<br>Running on your phone.</h2>
          <p class="lede">This is ${esc(wk.name)}, a ${esc(wk.industry.toLowerCase())} site, running live inside the phone. Every design in the menu is a working website like this one. Give a design a second or two to load, then scroll it yourself.</p>
          <a class="btn btn-ghost" href="/factory/websites/${wk.slug}/">Open it full screen${ARROW}</a>
        </div>
        <div class="wk-ph">${stageHtml(wk, { cls: ' only-m', id: 'wk-stage', state: true })}</div>
      </div>` : '';
const TYPES = ['Shop or brand', 'Restaurant, café or bar', 'Clinic, salon or wellness', 'Hotel, travel or events', 'Tech company or startup', 'Services: law, finance, construction', 'School, coaching or NGO', 'Something else'];
const leadTypes = TYPES.map((x) => `<option>${esc(x)}</option>`).join('');
const FAQ = [
  ['Is it really one price for every design?', `Yes. Any design in the menu, minimal or full 3D, is ${priceFromAll} right now, hosting included. A custom design at the same level costs the same. Add-ons are extra and you choose them. You get one fixed price in writing before any work starts.`],
  ['Why does the price go up?', `These are dated launch prices. ${dual((c) => money(PR.stages[0][c], c))} until ${esc(PR.stages[0].endsLabel)}, then ${dual((c) => money(PR.stages[1][c], c))} until ${esc(PR.stages[1].endsLabel)}, then the regular ${dual((c) => money(PR.regular[c], c))} from 1 January 2027. The price that applies is the one on the day you pay.`],
  ['What does hosting include?', `Fast global hosting with HTTPS, up to ${C.hosting.gb} GB of traffic and ${esc(C.hosting.requests)} requests a month: about ${esc(C.hosting.visits)} visits, more than most small businesses get. If your site grows past that, we move it to a bigger plan and pass the cost on at cost. Your domain name is separate, usually ${dual((c) => (c === 'inr' ? 'under ₹1,500' : 'under $20'))} a year, and we help you buy it in your own name.`],
  ['Why is it so much cheaper than an agency?', `Agencies usually quote ${dual((c) => esc(C.agency[c]))} for a custom-designed site, because every site is built by hand and you pay for the hours. We built a design factory: AI agents do the repetitive work, such as layouts, code, image prep, first drafts and testing, and our designers do the parts that need taste and judgement. Fewer hours, same checks, lower price.`],
  ['Will my site look like the demo?', 'Same design and the same quality, with your name, colours, photos and words. Want something different? We can mix two designs, match your current brand, or make a fully custom design at the same price.'],
  ['How long does it take?', `${C.liveHours} hours from payment. We call you within ${C.callWithinHours} hours to collect everything we need (your domain, logo, photos and text), and your site is live on your own domain within ${C.callWithinHours} hours of that call. Before launch you can ask for as many changes as you want.`],
  ['Why do add-ons have a monthly fee?', 'A chatbot, a dashboard, order alerts or a store keep running after launch: servers, databases, AI usage, email and WhatsApp sending, and our team keeping them working. The setup fee pays for building it; the monthly fee keeps it running. Costs that grow with use, like call minutes or WhatsApp message fees, are billed at cost.'],
  ['Do you make apps, emails and other design work?', 'Yes. We are a design partner, not only a website shop: iPhone and Android apps, web apps and client portals, admin dashboards, branded HTML emails and newsletters, logos and brand kits, AI chat and voice. Apps and custom software are quoted after a short call, with their own timeline.'],
  ['What happens after launch?', 'For 30 days we make small fixes and tweaks for free, like adding a button or changing a link. After that, the Care plan covers monthly edits, or we quote bigger changes separately.'],
  ['How do I order and pay?', 'Pick a design, tap "Order this design", add any features, answer a few questions about your business and pay securely through Razorpay (UPI, cards or net banking). We call you within 24 hours and start right away.']
];
const faqHtml = FAQ.map(([q, a], i) => `<details class="qa rv"${i === 0 ? ' open' : ''}><summary><span>${esc(q)}</span><i aria-hidden="true"></i></summary><div class="qa-a"><p>${a}</p></div></details>`).join('\n');
const customList = C.custom.map((x) => `<li>${CHECK}<span>${esc(x)}</span></li>`).join('');
write('index.html', render(T('pages/index.html'), { services: servicesHtml, custom_list: customList, step_label: stepLabel, step_ends: stepEnds, ladder_hero: dual((c) => ladder(c)), off_week: maxPct, wa_custom: encodeURIComponent('Hi Hanflux, I have a custom project in mind: '), gallery: galleryHtml, biz_chips: bizChips, compare: compareHtml, checks: checksHtml, tiers: tiersHtml, included: includedHtml, addons: addonsHtml, work: workHtml, faq: faqHtml, lead_types: leadTypes, agency: dual((c) => esc(C.agency[c])) }, 'home'));

// ---------- websites ----------
const legend = `<div class="lg lg-flat tabrule"><span class="lg-n">${stepLabel} · any design · hosting included · ${stepEnds}</span>${priceBlock('lg-p', 'flagship', 'flat')}</div>`;
const bizFilters = C.biz.map((b) => `<button type="button" class="chip" data-f="b:${b.id}">${esc(b.label)}</button>`).join('');
const tierFilters = order.slice().reverse().map((t) => `<button type="button" class="chip" data-f="t:${t}">${esc(kindOf(t))}s</button>`).join('');
const saleCard = (s, i) => `    <article class="wcard rv" id="s-${s.slug}" data-slug="${s.slug}" style="--accent:${s.accent}">
      <a class="wc-hit" href="/factory/websites/${s.slug}/" aria-label="${esc(s.name)}: watch it live and see the price"></a>
      <div class="wc-top"><span class="wc-type">${esc(s.industry)}</span>${tierBadge(s.tier)}${s.live || s.origin ? '<span class="tier built">Built by Hanflux</span>' : ''}</div>
      ${stageHtml(s, { eager: i < 1, badge: true })}
      <div class="wc-meta">
        <h2 class="wc-name display">${esc(s.name)}</h2>
        <p class="wc-pitch">${esc(s.pitch)}</p>
        <p class="wc-price" data-price-block>from ${priceInline(s.tier)}</p>
      </div>
      <div class="wc-actions">
        <a class="btn btn-teal btn-sm" href="/factory/websites/${s.slug}/">See it live${ARROW}</a>
        <button class="btn btn-ghost btn-sm btn-pick" type="button" data-pick="${s.slug}" aria-pressed="false" aria-label="Save ${esc(s.name)}">${HEART}<span class="lbl">Save</span></button>
      </div>
    </article>`;
const exCard = (s, i) => `    <article class="wcard ex rv" id="s-${s.slug}" data-slug="${s.slug}" data-ex style="--accent:${s.accent}">
      <a class="wc-hit" href="/factory/websites/${s.slug}/" aria-label="${esc(s.name)}: watch it live"></a>
      <div class="wc-top"><span class="wc-type">${esc(s.industry)}</span><span class="tier ex-t">Our own company</span></div>
      ${stageHtml(s, { badge: true })}
      <div class="wc-meta">
        <h2 class="wc-name display">${esc(s.brand)}</h2>
        <p class="wc-pitch">${esc(s.pitch)}</p>
      </div>
      <div class="wc-actions">
        <a class="btn btn-ghost btn-sm" href="/factory/websites/${s.slug}/">See it live${ARROW}</a>
        <button class="btn btn-teal btn-sm" type="button" data-open-plan data-kind="Fully custom">Get one like it</button>
      </div>
    </article>`;
const cards = sale.map(saleCard).join('\n');
const exCards = exs.map(exCard).join('\n');
const customCard = (n) => `    <article class="wcard ccard rv" data-custom="${n}">
      <div class="cc-in">
        <p class="kicker">${n === 1 ? 'not seeing your style?' : 'still deciding?'}</p>
        <h2 class="display cc-t">${n === 1 ? 'Mix designs, match your brand,<br>or go fully custom.' : 'Tell us your business.<br>We pick three designs for you.'}</h2>
        <p class="cc-p">${n === 1 ? 'The glow of one design and the layout of another, your current brand made sharper, or something nobody has seen. Same factory, same checks.' : 'Send your name, WhatsApp number and type of business. Within 24 hours you get the three designs that fit you best and a fixed price. Free.'}</p>
        <div class="wc-actions"><button class="btn btn-teal btn-sm" type="button" data-open-plan${n === 1 ? ' data-kind="Fully custom"' : ''}>${n === 1 ? 'Ask for a custom design' : 'Get my free plan'}</button><a class="btn btn-ghost btn-sm" href="https://wa.me/${C.whatsapp}?text=${encodeURIComponent(n === 1 ? 'Hi Hanflux, I would like a custom website design.' : 'Hi Hanflux, please suggest designs for my business. My business is: ')}" target="_blank" rel="noopener">WhatsApp us</a></div>
      </div>
    </article>`;
const parts = cards.split('\n    <article class="wcard rv"');
const withCustom = parts.slice(0, 6).join('\n    <article class="wcard rv"') + '\n' + customCard(1) + '\n    <article class="wcard rv"' + parts.slice(6).join('\n    <article class="wcard rv"') + '\n' + customCard(2);
const exSection = exs.length ? `<section class="w-ex section" id="our-work" aria-labelledby="ex-title">
    <div class="wrap">
      <div class="sec-head">
        <div><p class="kicker rv">our own work</p><h2 class="display h-lg rv" id="ex-title">Our own site,<br>made in the same factory.</h2></div>
        <p class="lede rv">hanflux.ai is our own site, so its design stays ours. Like the level? We make an original one for you, with the same craft and the same checks.</p>
      </div>
      <div class="w-grid ex-grid">
${exCards}
      </div>
    </div>
  </section>` : '';
const waHelp = encodeURIComponent('Hi Hanflux, I need a website. My business is: ');
write('websites/index.html', render(T('pages/websites.html'), { legend, cards: withCustom, examples: exSection, wa_help: waHelp, biz_filters: bizFilters, tier_filters: tierFilters }, 'websites'));

// ---------- detail pages ----------
const addonRows = C.addons.map((a) => `<li><input type="checkbox" id="ao-${a.id}" value="${a.id}"><label for="ao-${a.id}"><span class="box">${CHECK}</span><span class="an">${esc(a.name)}</span><span class="ap" data-price-block>+${dual((c) => money(a[c], c) + (a.monthly ? '/mo' : ''))}</span><span class="ad">${esc(a.desc)}</span></label></li>`).join('');
const inclShort = ['Your design, rebuilt with your name, photos and words', 'Live on your own domain within 48 hours of payment', 'Made for phones, tested on iPhone and Android', 'The 12-point launch check', 'As many changes as you want before launch', '30 days of small fixes after launch'].map((x) => `<li>${CHECK}<span>${esc(x)}</span></li>`).join('');
const saleAside = T('partials/buy-aside.html');
const saleBuybar = T('partials/buybar.html');
const exAside = (s) => `<aside class="d-buy" id="buy" aria-label="About this example">
      <div class="buy-card ex-card">
        <div class="buy-top"><span class="tier ex-t">Our own company</span><span class="mono faint">example</span></div>
        <h3 class="ex-h display">Want a site like this?</h3>
        <p class="buy-blurb">This one belongs to our own company. We design an original site for your business at the same level of craft, with your content and the features you need.</p>
        <div class="ex-ref"><span class="mono-h">similar builds</span><b>${esc(C.tiers[s.tier].name)} · ${esc(kindOf(s.tier))}</b><span class="ex-p">from ${priceInline(s.tier)}</span></div>
        <div class="buy-cta"><button class="btn btn-teal" type="button" data-open-plan data-kind="Fully custom">Get my free plan</button><a class="btn btn-ghost" href="/factory/websites/">Designs you can order</a></div>
        <p class="fine">Free. We WhatsApp you a fixed price within ${C.callWithinHours} hours.</p>
      </div>
    </aside>`;
const order2 = [...sale, ...exs];
order2.forEach((s, i) => {
  const prev = order2[(i - 1 + order2.length) % order2.length], next = order2[(i + 1) % order2.length];
  const t = C.tiers[s.tier];
  const host = hostOf(s), ex = isEx(s);
  const vars = {
    slug: s.slug, name: esc(s.name), family: esc(s.family), brand: esc(s.brand), pitch: esc(s.pitch), accent: s.accent,
    type_line: ex ? `example of our work · ${esc(host)}` : `${esc(s.industry)} · ${esc(kindOf(s.tier))}`,
    badges: ex ? '' : (s.live || s.origin ? '<span class="tier built">Built by Hanflux</span>' : ''),
    steps: (ex ? [['Get your free plan', `Tell us about your business. Within ${C.callWithinHours} hours we WhatsApp you the design that fits, the pages you need and a fixed price.`],
      ['Order and pay', 'Pick a design from the menu or ask for an original one, add features and pay securely.'],
      ['Live on your own domain', `Menu designs go live within ${C.liveHours} hours of payment. An original design gets a timeline we agree with you.`]]
      : [['Order and pay', 'Tap "Order this design", add features, answer a few questions and pay securely.'],
        [`We call you within ${C.callWithinHours} hours`, 'To collect your domain, logo, photos, text and any technical details.'],
        [`Live within ${C.liveHours} hours`, `Built, checked 12 ways and live on your own domain, ${C.liveHours} hours from payment.`]])
      .map((x, k) => `<li class="tabrule"><span>${pad(k + 1)}</span><b>${esc(x[0])}</b><p>${esc(x[1])}</p></li>`).join(''),
    ex_q: ex ? '&amp;ex=1' : '',
    stage: stageHtml(s, { id: 'd-stage', cls: ' big', eager: true, state: true }),
    meta_desc: ex ? `${esc(s.pitch)} Our own site, shown live as an example of Hanflux work. We design an original site for you at the same level.` : `${esc(s.pitch)} Watch it run live on a phone and a laptop. One flat price for any design, hosting included: ${esc(money(t.inr.from, 'inr'))} in India or ${esc(money(t.usd.from, 'usd'))} outside India. Live within ${C.liveHours} hours of payment.`,
    includes: s.includes.map((x, k) => `<li data-n="${pad(k + 1)}">${esc(x)}</li>`).join(''),
    bestfor: s.bestFor.map((x) => `<span class="chip">${esc(x)}</span>`).join(''),
    live_block: s.live && !WALLED.has(s.slug) ? `<div class="block"><div class="live-b"><div><span class="mono-h">${ex ? 'our own site' : 'live client site'}</span><b>${esc(s.brand)} · ${esc(host)}</b></div><a class="btn btn-ghost btn-sm" href="${esc(s.live)}" target="_blank" rel="noopener">Visit the live site${EXT}</a></div></div>` : '',
    note: ex ? `This is our own company's site, shown as an example of what we build. Your site is designed from scratch around your business, at the same level of craft.` : s.origin ? `This was the design of our own site before we moved to a new one. It is now open to order: we rebuild it around your business, your words and your photos.` : s.live ? `This is a real site we built and launched for ${esc(s.brand)}. Your version is designed around your business, in the same style and at the same level of craft.` : `${esc(s.brand)} is a made-up brand we use to show the design. Your site gets your name, colours, words, photos and the pages your business needs.`,
    custom_block: ex ? ''
      : `<div class="block custom-b"><span class="mono-h">not exactly this?</span><p class="cb-t">We can mix it with another design, match it to your current brand, or make something only you have.</p><div class="cb-row"><button class="btn btn-ghost btn-sm" type="button" data-open-plan data-kind="Mix designs">Mix it with another design</button><button class="btn btn-ghost btn-sm" type="button" data-open-plan data-kind="Fully custom">Ask for a custom design</button></div></div>`,
    tier: s.tier, tier_name: esc(t.name), tier_kind: esc(kindOf(s.tier)), weeks: esc(t.weeks), tier_blurb: esc(t.blurb),
    price_block: priceBlock('buy-price', s.tier), price_now: priceNow(s.tier), incl_short: inclShort,
    addon_rows: addonRows, cur_switch: curSwitch(), wa: C.whatsapp, wa_ask: encodeURIComponent(`Hi Hanflux, I have a question about the ${s.name} design.`),
    prev_slug: prev.slug, prev_name: esc(prev.name), next_slug: next.slug, next_name: esc(next.name)
  };
  const fillT = (tpl) => tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? String(vars[k]) : k in offerVars ? String(offerVars[k]) : m));
  vars.aside = ex ? exAside(s) : fillT(saleAside);
  vars.buybar = ex ? `<div class="buybar" id="buybar"><div class="buybar-in"><div class="bb-txt"><span class="mono faint">our own company · example</span><b>Want one like it?</b></div><button class="btn btn-teal btn-sm" type="button" data-open-plan data-kind="Fully custom">Free plan</button></div></div>` : fillT(saleBuybar);
  write(`websites/${s.slug}/index.html`, render(T('pages/detail.html'), vars, 'websites'));
});

// ---------- order ----------
const designOptions = sale.map((s) => `<button class="o-opt" type="button" data-design="${s.slug}"><img src="/factory/posters/${s.slug}-m.webp" alt="" width="300" height="649" loading="lazy" decoding="async"><span class="oo-n">${esc(s.name)}</span><span class="oo-m">${esc(s.industry)}</span><span class="oo-p">${priceNow(s.tier)} <small>· ${esc(kindOf(s.tier))}</small></span></button>`).join('');
write('order/index.html', render(T('pages/order.html'), { design_options: designOptions, addon_rows: addonRows }, 'order'));

// ---------- price book for the payment endpoint (api/pay.js): the server never trusts a price from the browser ----------
fs.writeFileSync(path.join(ROOT, 'api/_prices.json'), JSON.stringify({
  site: C.site, upfrontPct: Math.max(1, Math.min(100, +(C.payment || {}).upfrontPct || 100)),
  regular: C.pricing.regular, stages: C.pricing.stages.map((s) => ({ id: s.id, ends: new Date(s.ends).getTime(), inr: s.inr, usd: s.usd })),
  tiers: Object.fromEntries(order.map((t) => [t, { name: C.tiers[t].name }])),
  sites: Object.fromEntries(sale.map((s) => [s.slug, { name: s.name, tier: s.tier }])),
  addons: Object.fromEntries(C.addons.map((a) => [a.id, { inr: a.inr, usd: a.usd, mo: a.mo || null }]))
}, null, 1) + '\n');

// ---------- agents ----------
// private page behind the PIN gate: it keeps the earlier dark shell (base-dark.css and the -dark partials)
write('agents/index.html', render(T('pages/agents.html'), {}, 'agents', '-dark'));

// ---------- sitemap, robots ----------
const urls = ['/', '/websites/', ...order2.map((s) => `/websites/${s.slug}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${C.site}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /w/\nDisallow: /agents/\nSitemap: ${C.site}/sitemap.xml\n`);

console.log(`built: ${live.length} styles, ${sale.length} for sale + ${exs.length} examples; up to ${maxPct}% off in both currencies`);
if (missing.length) console.log(`not built yet (hidden): ${missing.join(', ')}`);
