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
const priceFromAll = dual((c) => money(Math.min(...order.map((t) => tierFrom(t, c))), c));
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
const offPct = (t, c) => C.tiers[t][c].was ? Math.round((1 - C.tiers[t][c].from / C.tiers[t][c].was) * 100) : 0;
// "up to X% off" must hold in both currencies: use the smaller of the two maximums
const maxPct = Math.min(...CURS.map((c) => Math.max(...order.map((t) => offPct(t, c)))));
const daysLeft = OFFER ? Math.max(0, Math.floor((new Date(OFFER.ends) - Date.now()) / 864e5)) : 0;
const offerVars = {
  offer_script: OFFER ? `<script>(function(){try{document.documentElement.classList.add(Date.now()<${new Date(OFFER.ends).getTime()}?'has-offer':'offer-over')}catch(e){}})()</script>` : '',
  offer_bar: OFFER ? `<div class="offer-bar" role="region" aria-label="${esc(OFFER.label)}"><a class="ob-in" href="/#plan" data-open-plan><span class="ob-dot" aria-hidden="true"></span><span class="ob-t">Launch prices end ${esc(OFFER.endsLabel)}</span><b data-countdown-days>${daysLeft} days left</b><span class="ob-go" aria-hidden="true">Free plan</span></a></div>` : '',
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
const stageHtml = (s, { id = '', cls = '', eager = false } = {}) => {
  const lz = eager ? 'eager' : 'lazy';
  const img = (k, w, h) => `<img src="/posters/${s.slug}-${k}.webp" alt="" width="${w}" height="${h}" loading="${lz}" decoding="async"${eager && k === 'd' ? ' fetchpriority="high"' : ''}>`;
  const vp = (k, w, h) => `<div class="vp" data-k="${k}"><div class="poster"><div class="pfall"><b>${esc(s.brand)}</b></div>${img(k, w, h)}</div><span class="loading"><i></i>loading live site</span><span class="prog"></span></div>`;
  return `<div class="stage combo${cls}"${id ? ` id="${id}"` : ''} data-stage data-slug="${s.slug}" style="--accent:${s.accent};--frame-bg:${s.bg || '#0b0d13'}">` +
    `<div class="dev-d"><div class="d-bar"><span class="d-dots"><i></i><i></i><i></i></span><span class="d-url">${LOCK}${esc(s.domain || s.slug + '.com')}</span></div>${vp('d', 720, 450)}</div>` +
    `<div class="dev-m">${vp('m', 300, 649)}<span class="isl"></span></div></div>`;
};
// a big price line: the price from 1 Jan above (crossed out during the launch), "from <launch price>" below
const priceBlock = (cls, t, small = 'from') => CURS.map((c) => `<div class="${cls} c-${c}" data-price-block><small>${small}</small>${C.tiers[t][c].was ? `<s class="was">${money(tierWas(t, c), c)}</s> ` : ''}<span class="now">${money(tierFrom(t, c), c)}</span></div>`).join('');
const priceInline = (t) => dual((c) => `${C.tiers[t][c].was ? `<s class="was">${money(tierWas(t, c), c)}</s> ` : ''}<span class="now">${money(tierFrom(t, c), c)}</span>`);
const priceNow = (t) => dual((c) => money(tierFrom(t, c), c));

// ---------- home ----------
const bizChips = C.biz.map((b) => { const n = b.slugs.filter((x) => by[x] && !isEx(by[x])).length; return `<a class="chip" role="listitem" href="/websites/?biz=${b.id}">${esc(b.label)} <span>${n}</span></a>`; }).join('');
const GAL = ['liquid', 'estate', 'glass', 'silk', 'comic', 'gold', 'deco', 'swiss', 'halftone', 'particles', 'neon', 'editorial'].filter((x) => by[x] && !isEx(by[x]));
const galleryHtml = GAL.map((x, i) => { const s = by[x]; return `<a class="gcard" href="/websites/${s.slug}/" style="--accent:${s.accent}" aria-label="${esc(s.name)}, a ${esc(s.industry.toLowerCase())} website, from ${esc(money(tierFrom(s.tier, 'inr'), 'inr'))}">
        ${stageHtml(s, { eager: i < 2 })}
        <span class="gc-type">${esc(s.industry)}</span>
        <b class="gc-name">${esc(s.name)}</b>
        <span class="gc-price">from ${priceNow(s.tier)} <small>· ${esc(kindOf(s.tier))}</small></span>
        <span class="gc-go">See it live${ARROW}</span>
      </a>`; }).join('\n      ');
const compareHtml = `<table class="cmp"><thead><tr><th scope="col"><span class="sr">What you compare</span></th><th scope="col">A typical agency</th><th scope="col">The Hanflux factory</th></tr></thead><tbody>
  <tr><th scope="row">Price for a custom site</th><td>${dual((c) => esc(C.agency[c]))}</td><td><b>from ${priceFromAll}</b></td></tr>
  <tr><th scope="row">Time to launch</th><td>4 to 10 weeks</td><td><b>Within ${C.liveHours} hours</b></td></tr>
  <tr><th scope="row">See it before you buy</th><td>Mock-ups and promises</td><td><b>${nSites} live, working designs</b></td></tr>
  <tr><th scope="row">Checks before launch</th><td>Varies</td><td><b>12-point check, every site</b></td></tr>
</tbody></table>`;
const checksHtml = C.checks.map((x, k) => `<li${k >= 6 ? ' class="more"' : ''}><span class="mono">${pad(k + 1)}</span>${esc(x)}</li>`).join('');
const includedHtml = C.included.map((x) => `<li>${CHECK}<span>${esc(x)}</span></li>`).join('');
const tiersHtml = order.map((t) => {
  const ex = sale.filter((s) => s.tier === t).slice(0, 4);
  return `<article class="tcard t-${t} rv${t === 'flagship' ? ' top' : ''}">
    <p class="tw">${esc(C.tiers[t].tag)}</p>
    <h3 class="tn">${esc(C.tiers[t].name)} <span>· ${esc(kindOf(t))}</span></h3>
    ${priceBlock('tp', t)}
    <p class="t-when offer-only">launch price · ${dual((c) => money(tierWas(t, c), c))} from 1 Jan</p>
    <p class="t-blurb">${esc(C.tiers[t].blurb)}</p>
    <div class="ex">${ex.map((s) => `<a href="/websites/${s.slug}/">${esc(s.name)}</a>`).join('')}</div>
    <a class="lnk go" href="/websites/?tier=${t}">See ${esc(C.tiers[t].name)} designs${ARROW_L}</a></article>`;
}).join('\n');
const addonChip = (a) => `<span class="chip">${esc(a.name)}${C.showPrices ? ' · ' + dual((c) => money(a[c], c) + (a.monthly ? '/month' : '')) : ''}</span>`;
const addonsHtml = C.addons.slice(0, 7).map(addonChip).join('') + C.addons.filter((a) => a.monthly).map(addonChip).join('') + `<a class="chip more" href="/websites/">+${C.addons.length - 8} more on every design</a>`;
const work = [...sale.filter((s) => s.live), ...exs.filter((s) => !WALLED.has(s.slug))];
const workHtml = work.map((s, i) => `<li class="rv"><a class="row" href="/websites/${s.slug}/"><span class="wn">${pad(i + 1)}</span><span class="wt">${esc(s.brand)} <small>${esc(s.industry)} · ${isEx(s) ? 'our own company' : 'client site'}</small></span><span class="wu">${esc(hostOf(s))}</span><span class="wa">${ARROW_L}</span></a></li>`).join('\n');
const TYPES = ['Shop or brand', 'Restaurant, café or bar', 'Clinic, salon or wellness', 'Hotel, travel or events', 'Tech company or startup', 'Services: law, finance, construction', 'School, coaching or NGO', 'Something else'];
const leadTypes = TYPES.map((x) => `<option>${esc(x)}</option>`).join('');
const t0 = C.tiers.essential;
const FAQ = [
  ['Is the price on a design the full price?', `For the design you pick, yes: it is rebuilt with your content and comes with everything in "included in every plan". For example, an Essential site is ${dual((c) => money(t0[c].from, c))} during the launch. Add-ons are extra and you choose them. You get one fixed price in writing before any work starts.`],
  ['Why is it so much cheaper than an agency?', `Agencies usually quote ${dual((c) => esc(C.agency[c]))} for a custom-designed site, because every site is built by hand and you pay for the hours. We built a factory: AI agents do the repetitive work, such as layouts, code, image prep, first drafts and testing, and our team does the parts that need taste and judgement. Fewer hours, same checks, lower price.`],
  ['Will my site look like the demo?', 'Same design and the same quality, with your name, colours, photos and words. Want something different? We can mix two designs, match your current brand, or make a fully custom design.'],
  ['How long does it take?', `${C.liveHours} hours from payment. We call you within ${C.callWithinHours} hours to collect everything we need (your domain, logo, photos and text, and any technical setup), and your site is live on your own domain within ${C.callWithinHours} hours of that call. Before launch you can ask for as many changes as you want.`],
  ['What happens after launch?', 'For 30 days we make small fixes and tweaks for free, like adding a button or changing a link. Bigger changes or a redesign are quoted separately, and our Care plan covers ongoing edits.'],
  ['I am not technical. What do I need to do?', 'Send your logo (or ask us to make one), a few photos and a few lines about your business on WhatsApp. We do the rest, including setting up your web address.'],
  ['Do I need a domain and hosting?', `You need a web address (domain) in your own name, usually ${dual((c) => (c === 'inr' ? 'under ₹1,500' : 'under $20'))} a year. We help you buy it and set everything up. Hosting, backups, updates and small edits each month are covered by our Care plan at ${dual((c) => money(C.addons.find((a) => a.id === 'care')[c], c))} a month.`],
  ['Can you build a backend, custom features or AI?', 'Yes, as a custom order: online ordering and booking backends, dashboards and client portals, AI agents and AI features, and connections to the software you already use. We scope it on a call, give you a fixed price and agree a timeline that fits the work. The 48-hour promise covers websites from the menu.'],
  ['How do I order and pay?', 'Pick a design, tap "Order this design", add any features, answer a few questions about your business and pay securely through Razorpay (UPI, cards or net banking). We call you within 24 hours and start right away.'],
  ['What happens after I ask for the free plan?', 'We reply on WhatsApp within 24 hours with your free plan: the design that fits you best, the pages you need and a fixed price. No payment to ask, no obligation.']
];
const faqHtml = FAQ.map(([q, a], i) => `<details class="qa rv"${i === 0 ? ' open' : ''}><summary><span>${esc(q)}</span><i aria-hidden="true"></i></summary><div class="qa-a"><p>${a}</p></div></details>`).join('\n');
const customList = C.custom.map((x) => `<li>${CHECK}<span>${esc(x)}</span></li>`).join('');
write('index.html', render(T('pages/index.html'), { custom_list: customList, wa_custom: encodeURIComponent('Hi Hanflux, I have a custom project in mind: '), gallery: galleryHtml, biz_chips: bizChips, compare: compareHtml, checks: checksHtml, tiers: tiersHtml, included: includedHtml, addons: addonsHtml, work: workHtml, faq: faqHtml, lead_types: leadTypes, agency: dual((c) => esc(C.agency[c])) }, 'home'));

// ---------- websites ----------
const legend = order.map((t) => `<div class="lg t-${t} tabrule"><span class="lg-n">${esc(C.tiers[t].name)} · ${esc(kindOf(t))}</span>${priceBlock('lg-p', t)}</div>`).join('');
const bizFilters = C.biz.map((b) => `<button type="button" class="chip" data-f="b:${b.id}">${esc(b.label)}</button>`).join('');
const tierFilters = order.slice().reverse().map((t) => `<button type="button" class="chip" data-f="t:${t}">${esc(kindOf(t))}s</button>`).join('');
const saleCard = (s, i) => `    <article class="wcard rv" id="s-${s.slug}" data-slug="${s.slug}" style="--accent:${s.accent}">
      <a class="wc-hit" href="/websites/${s.slug}/" aria-label="${esc(s.name)}: watch it live and see the price"></a>
      <div class="wc-top"><span class="wc-type">${esc(s.industry)}</span>${tierBadge(s.tier)}${s.live || s.origin ? '<span class="tier built">Built by Hanflux</span>' : ''}</div>
      ${stageHtml(s, { eager: i < 1 })}
      <div class="wc-meta">
        <h2 class="wc-name display">${esc(s.name)}</h2>
        <p class="wc-pitch">${esc(s.pitch)}</p>
        <p class="wc-price" data-price-block>from ${priceInline(s.tier)}</p>
      </div>
      <div class="wc-actions">
        <a class="btn btn-teal btn-sm" href="/websites/${s.slug}/">See it live${ARROW}</a>
        <button class="btn btn-ghost btn-sm btn-pick" type="button" data-pick="${s.slug}" aria-pressed="false" aria-label="Save ${esc(s.name)}">${HEART}<span class="lbl">Save</span></button>
      </div>
    </article>`;
const exCard = (s, i) => `    <article class="wcard ex rv" id="s-${s.slug}" data-slug="${s.slug}" data-ex style="--accent:${s.accent}">
      <a class="wc-hit" href="/websites/${s.slug}/" aria-label="${esc(s.name)}: watch it live"></a>
      <div class="wc-top"><span class="wc-type">${esc(s.industry)}</span><span class="tier ex-t">Our own company</span></div>
      ${stageHtml(s)}
      <div class="wc-meta">
        <h2 class="wc-name display">${esc(s.brand)}</h2>
        <p class="wc-pitch">${esc(s.pitch)}</p>
      </div>
      <div class="wc-actions">
        <a class="btn btn-ghost btn-sm" href="/websites/${s.slug}/">See it live${ARROW}</a>
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
        <div><p class="kicker rv">our own work</p><h2 class="display h-lg rv" id="ex-title">Sites we built for<br>our own companies.</h2></div>
        <p class="lede rv">Hanflux and Oraya are our own companies, so these designs stay theirs. Like the level? We make an original one for you, with the same craft and the same checks.</p>
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
        <div class="ex-ref"><span class="mono-h">similar builds</span><b>${esc(C.tiers[s.tier].name)} · ${esc(kindOf(s.tier))}</b><span class="ex-p">from ${priceInline(s.tier)}</span><span class="mono faint">${esc(C.tiers[s.tier].weeks)}</span></div>
        <div class="buy-cta"><button class="btn btn-teal" type="button" data-open-plan data-kind="Fully custom">Get my free plan</button><a class="btn btn-ghost" href="/websites/">Designs you can order</a></div>
        <p class="fine">Fixed price within 24 hours, on WhatsApp. No payment to ask.</p>
      </div>
    </aside>`;
const order2 = [...sale, ...exs];
order2.forEach((s, i) => {
  const prev = order2[(i - 1 + order2.length) % order2.length], next = order2[(i + 1) % order2.length];
  const t = C.tiers[s.tier];
  const host = hostOf(s), ex = isEx(s);
  const vars = {
    slug: s.slug, name: esc(s.name), family: esc(s.family), brand: esc(s.brand), pitch: esc(s.pitch), accent: s.accent,
    type_line: ex ? `${esc(s.industry)} · our own company` : `${esc(s.industry)} · ${esc(kindOf(s.tier))}`,
    badges: ex ? '<span class="tier ex-t">Our own company</span>' : (s.live || s.origin ? '<span class="tier built">Built by Hanflux</span>' : ''),
    ex_q: ex ? '&amp;ex=1' : '',
    stage: stageHtml(s, { id: 'd-stage', cls: ' big', eager: true }),
    meta_desc: ex ? `${esc(s.pitch)} Our own site, shown live as an example of Hanflux work. We design an original site for you at the same level.` : `${esc(s.pitch)} Watch it run live on a phone and a laptop. ${esc(t.name)} plan from ${esc(money(t.inr.from, 'inr'))} in India or ${esc(money(t.usd.from, 'usd'))} outside India. Fixed price, live within ${C.liveHours} hours of payment.`,
    includes: s.includes.map((x, k) => `<li data-n="${pad(k + 1)}">${esc(x)}</li>`).join(''),
    bestfor: s.bestFor.map((x) => `<span class="chip">${esc(x)}</span>`).join(''),
    live_block: s.live && !WALLED.has(s.slug) ? `<div class="block"><div class="live-b"><div><span class="mono-h">${ex ? 'our own site' : 'live client site'}</span><b>${esc(s.brand)} · ${esc(host)}</b></div><a class="btn btn-ghost btn-sm" href="${esc(s.live)}" target="_blank" rel="noopener">Visit the live site${EXT}</a></div></div>` : '',
    note: ex ? `This is our own company's site, shown as an example of what we build. Your site is designed from scratch around your business, at the same level of craft.` : s.origin ? `This was the design of our own site before we moved to a new one. It is now open to order: we rebuild it around your business, your words and your photos.` : s.live ? `This is a real site we built and launched for ${esc(s.brand)}. Your version is designed around your business, in the same style and at the same level of craft.` : `${esc(s.brand)} is a made-up brand we use to show the design. Your site gets your name, colours, words, photos and the pages your business needs.`,
    custom_block: ex ? `<div class="block custom-b"><span class="mono-h">like this level of craft?</span><p class="cb-t">We design something original for your business in the same spirit: your story, your content, the features you need.</p><div class="cb-row"><button class="btn btn-teal btn-sm" type="button" data-open-plan data-kind="Fully custom">Get my free plan</button><a class="btn btn-ghost btn-sm" href="/websites/">See designs you can order</a></div></div>`
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
const designOptions = sale.map((s) => `<button class="o-opt" type="button" data-design="${s.slug}"><img src="/posters/${s.slug}-m.webp" alt="" width="300" height="649" loading="lazy" decoding="async"><span class="oo-n">${esc(s.name)}</span><span class="oo-m">${esc(s.industry)}</span><span class="oo-p">${priceNow(s.tier)} <small>· ${esc(kindOf(s.tier))}</small></span></button>`).join('');
write('order/index.html', render(T('pages/order.html'), { design_options: designOptions, addon_rows: addonRows }, 'order'));

// ---------- agents ----------
// private page behind the PIN gate: it keeps the earlier dark shell (base-dark.css and the -dark partials)
write('agents/index.html', render(T('pages/agents.html'), {}, 'agents', '-dark'));

// ---------- sitemap, robots ----------
const urls = ['/', '/websites/', ...order2.map((s) => `/websites/${s.slug}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${C.site}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /w/\nDisallow: /agents/\nSitemap: ${C.site}/sitemap.xml\n`);

console.log(`built: ${live.length} styles, ${sale.length} for sale + ${exs.length} examples; up to ${maxPct}% off in both currencies`);
if (missing.length) console.log(`not built yet (hidden): ${missing.join(', ')}`);
