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
const money = (n) => C.currency.symbol + Math.round(n).toLocaleString('en-US');
const pad = (n) => String(n).padStart(2, '0');
const lookName = (id) => (LOOKS.find((l) => l.id === id) || {}).name || id;
const ARROW = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.4A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.5c0 5.8-7.5 10.4-7.5 10.4z"/></svg>';
const EXT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M10 5H5v14h14v-5"/></svg>';

// only list styles whose demo folder exists
const live = SITES.filter((s) => fs.existsSync(path.join(ROOT, 'w', s.slug, 'index.html')));
const missing = SITES.filter((s) => !live.includes(s)).map((s) => s.slug);
const EX = new Set(C.examples || []);
const isEx = (s) => EX.has(s.slug);
const sale = live.filter((s) => !isEx(s));   // designs a client can order
const exs = live.filter(isEx);               // our own sites: examples, not for sale
const nSites = sale.length;
const hostOf = (s) => (s.live ? s.live.replace(/^https?:\/\//, '').replace(/\/$/, '') : s.domain || '');

const partial = (name, cur) => {
  let h = T(`partials/${name}.html`);
  h = h.replace(/\{\{cur:(\w+)\}\}/g, (_, k) => (k === cur ? ' aria-current="page"' : ''));
  return h;
};
function render(tpl, vars, cur, suffix = '') {
  let h = tpl.replace('{{head}}', partial('head' + suffix)).replace('{{nav}}', partial('nav' + suffix, cur)).replace('{{foot}}', partial('foot' + suffix));
  const all = { ...offerVars, n_ex: exs.length, wa: C.whatsapp, wa_label: esc(C.whatsappLabel), v: V, n_sites: nSites, n_agents: LOOKS.length, agent_fonts: esc(AGENT_FONTS), from_min: money(Math.min(...Object.values(C.tiers).map((t) => t.from))), ...vars };
  h = h.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in all ? String(all[k]) : m));
  const left = h.match(/\{\{[^}]+\}\}/g);
  if (left) throw new Error('unfilled tokens: ' + [...new Set(left)].join(', '));
  return h;
}
const write = (rel, html) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, html); };
const tierBadge = (t) => `<span class="tier tier-${t}">${esc(C.tiers[t].name)}</span>`;
const OFFER = C.offer && C.offer.on ? C.offer : null;
const offPct = (t) => C.tiers[t].was ? Math.round((1 - C.tiers[t].from / C.tiers[t].was) * 100) : 0;
const maxPct = Math.max(...Object.keys(C.tiers).map(offPct));
const priceHtml = (t, cls = '') => C.tiers[t].was ? `<s class="was${cls}">${money(C.tiers[t].was)}</s> <span class="now">${money(C.tiers[t].from)}</span>` : `<span class="amt">${money(C.tiers[t].from)}</span>`;
const daysLeft = OFFER ? Math.max(0, Math.ceil((new Date(OFFER.ends) - Date.now()) / 864e5)) : 0;
const offerItems = OFFER ? [OFFER.label, `Up to ${maxPct}% off every website`, `Ends ${OFFER.endsLabel}`, 'Fixed quote in 24 hours', 'Custom designs welcome', 'Mix any styles you like'] : [];
const offerVars = {
  offer_script: OFFER ? `<script>(function(){try{document.documentElement.classList.add(Date.now()<${new Date(OFFER.ends).getTime()}?'has-offer':'offer-over')}catch(e){}})()</script>` : '',
  offer_bar: OFFER ? `<div class="offer-bar" role="region" aria-label="${esc(OFFER.label)}"><div class="track" aria-hidden="true">${offerItems.map((x) => `<span>${esc(x)}</span>`).join('').repeat(4)}</div><span class="sr">${esc(OFFER.label)}: up to ${maxPct}% off every website until ${esc(OFFER.endsLabel)}.</span><a class="ob-cta" href="#request" data-open-request>ends in <b data-countdown>${daysLeft} days</b></a></div>` : '',
  offer_note: OFFER ? esc(OFFER.note) : '', offer_ends: `${daysLeft} days`, off_max: maxPct + '%', off_num: maxPct
};

// ---------- home ----------
const order = ['essential', 'growth', 'signature', 'flagship'];
const tiersHtml = order.map((t, i) => {
  const ex = sale.filter((s) => s.tier === t).slice(0, 4);
  return `<article class="tcard t-${t} rv${t === 'flagship' ? ' top' : ''}">
    <p class="tw">${esc(C.tiers[t].weeks)}</p>
    <h3 class="tn">${esc(C.tiers[t].name)}</h3>
    <div class="tp" data-price-block><small>from</small>${priceHtml(t, ' tp-was')}</div>
    ${C.tiers[t].was ? `<span class="off-sticker t-stk offer-only">${offPct(t)}% off · launch</span>` : ''}
    <p>${esc(C.tiers[t].blurb)}</p>
    <div class="ex">${ex.map((s) => `<a href="/websites/${s.slug}/">${esc(s.name)}</a>`).join('')}</div>
    <a class="lnk go" href="/websites/?tier=${t}">See ${esc(C.tiers[t].name)} designs${ARROW.replace('class="ic" ', '')}</a></article>`;
}).join('\n');
const addonsHtml = C.addons.slice(0, 8).map((a) => `<span class="chip">${esc(a.name)}${C.showPrices ? ' · ' + money(a.from) + (a.monthly ? '/mo' : '') : ''}</span>`).join('') + (C.addons.length > 8 ? `<a class="chip" href="/websites/">+${C.addons.length - 8} more on every design</a>` : '');
const work = [...exs, ...sale.filter((s) => s.live)];
const workHtml = work.map((s, i) => `<li class="rv"><a class="row" href="/websites/${s.slug}/"><span class="wn">${pad(i + 1)}</span><span class="wt">${esc(s.brand)} <small>${esc(s.industry)} · ${isEx(s) ? `“${esc(s.name)}” · example, not for sale` : `client site · in the menu as “${esc(s.name)}”`}</small></span><span class="wu">${esc(hostOf(s))}</span><span class="wa">${ARROW.replace('class="ic" ', '')}</span></a></li>`).join('\n');
const waHello = encodeURIComponent('Hi Hanflux, I saw your design menu and I would like to talk about a website.');
write('index.html', render(T('pages/index.html'), { tiers: tiersHtml, addons: addonsHtml, work: workHtml, wa_hello: waHello, offer_label: OFFER ? esc(OFFER.label) : '', offer_ends_label: OFFER ? esc(OFFER.endsLabel) : '', flag_was: money(C.tiers.flagship.was || C.tiers.flagship.from), flag_now: money(C.tiers.flagship.from), ess_was: money(C.tiers.essential.was || C.tiers.essential.from), ess_now: money(C.tiers.essential.from) }, 'home'));

// ---------- websites ----------
const legend = order.map((t) => `<div class="lg t-${t} tabrule"><span class="lg-n">${esc(C.tiers[t].name)}</span><span class="lg-p" data-price-block><small>from</small>${priceHtml(t)}</span></div>`).join('');
const saleCard = (s, i) => `    <article class="wcard rv" id="s-${s.slug}" data-slug="${s.slug}" style="--accent:${s.accent}">
      <a class="wc-hit" href="/websites/${s.slug}/" aria-label="${esc(s.name)}: open the live preview and pricing"></a>
      <div class="wc-top"><span class="wc-n mono">${pad(i + 1)}</span>${tierBadge(s.tier)}${s.live || s.origin ? '<span class="tier built">Built by Hanflux</span>' : ''}<span class="wc-from mono" data-price-block>from ${priceHtml(s.tier)}</span><span class="wc-live mono"><i class="dot"></i>live</span></div>
      <div class="stage combo" data-stage></div>
      <div class="wc-meta">
        <h2 class="wc-name display">${esc(s.name)}</h2>
        <p class="wc-brand">${s.live ? `<span class="lv">${esc(hostOf(s))}</span>` : s.origin ? esc(s.origin) : `${esc(s.brand)} sample`} · ${esc(s.industry)}</p>
        <p class="wc-pitch">${esc(s.pitch)}</p>
      </div>
      <div class="wc-actions">
        <button class="btn btn-ghost btn-sm btn-pick" type="button" data-pick="${s.slug}" aria-pressed="false">${HEART}<span class="lbl">Shortlist</span></button>
        <a class="btn btn-teal btn-sm" href="/websites/${s.slug}/">View live${ARROW}</a>
      </div>
    </article>`;
const exCard = (s, i) => `    <article class="wcard ex rv" id="s-${s.slug}" data-slug="${s.slug}" data-ex style="--accent:${s.accent}">
      <a class="wc-hit" href="/websites/${s.slug}/" aria-label="${esc(s.name)}: open the live preview"></a>
      <div class="wc-top"><span class="wc-n mono">${pad(i + 1)}</span><span class="tier ex-t">Our work</span><span class="nfs mono">example · not for sale</span><span class="wc-live mono"><i class="dot"></i>live</span></div>
      <div class="stage combo" data-stage></div>
      <div class="wc-meta">
        <h2 class="wc-name display">${esc(s.name)}</h2>
        <p class="wc-brand"><span class="lv">${esc(hostOf(s))}</span> · ${esc(s.industry)}</p>
        <p class="wc-pitch">${esc(s.pitch)}</p>
      </div>
      <div class="wc-actions">
        <a class="btn btn-ghost btn-sm" href="/websites/${s.slug}/">See it live${ARROW}</a>
        <button class="btn btn-teal btn-sm" type="button" data-open-request data-kind-pick="Something fully custom">Get one made for you</button>
      </div>
    </article>`;
const cards = sale.map(saleCard).join('\n');
const exCards = exs.map(exCard).join('\n');
const customCard = (n) => `    <article class="wcard ccard rv" data-custom="${n}">
      <div class="cc-in">
        <p class="kicker">${n === 1 ? 'not seeing your style?' : 'still deciding?'}</p>
        <h2 class="display cc-t">${n === 1 ? 'These are examples.<br>Yours is made for you.' : 'Mix them. Match your brand.<br>Or go fully custom.'}</h2>
        <p class="cc-p">${n === 1 ? 'Take any design as it is, blend two or three together, match the brand or app you already have, or ask for something nobody has seen yet.' : 'Tell us what you like from any of these designs and what your business needs. We will come back with a tailored concept and a fixed quote within 24 hours.'}</p>
        <div class="cc-kinds"><span class="chip">This design, my content</span><span class="chip">Mix designs</span><span class="chip">Match my brand or UI</span><span class="chip">Fully custom</span></div>
        <div class="wc-actions"><button class="btn btn-teal btn-sm" type="button" data-open-request data-kind-pick="${n === 1 ? 'Something fully custom' : 'Mix two or more designs'}">${n === 1 ? 'Ask for a custom design' : 'Describe your mix'}</button><a class="btn btn-ghost btn-sm" href="https://wa.me/${C.whatsapp}?text=${encodeURIComponent('Hi Hanflux, I would like a custom website design.')}" target="_blank" rel="noopener">WhatsApp us</a></div>
      </div>
    </article>`;
const waHelp = encodeURIComponent('Hi Hanflux, I need a website. My business is: ');
const parts = cards.split('\n    <article class="wcard rv"');
const withCustom = parts.slice(0, 6).join('\n    <article class="wcard rv"') + '\n' + customCard(1) + '\n    <article class="wcard rv"' + parts.slice(6).join('\n    <article class="wcard rv"') + '\n' + customCard(2);
const exSection = exs.length ? `<section class="w-ex section" id="our-work" aria-labelledby="ex-title">
    <div class="wrap">
      <div class="sec-head">
        <div><p class="kicker rv">our own work</p><h2 class="display h-lg rv" id="ex-title">Built for our own brands.<br>Shown, never sold.</h2></div>
        <p class="lede rv">Hanflux and Oraya are our own companies. Their sites are here so you can see our craft running live. They are examples, not designs for sale. Like what you see? We design something original for you at the same level.</p>
      </div>
      <div class="w-grid ex-grid">
${exCards}
      </div>
    </div>
  </section>` : '';
write('websites/index.html', render(T('pages/websites.html'), { legend, cards: withCustom, examples: exSection, wa_help: waHelp }, 'websites'));

// ---------- detail pages ----------
const addonRows = C.addons.map((a, k) => `<li${k >= 6 ? ' class="more"' : ''}><input type="checkbox" id="ao-${a.id}" value="${a.id}"><label for="ao-${a.id}"><span class="box"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg></span><span class="an">${esc(a.name)}</span><span class="ap" data-price-block>+${money(a.from)}${a.monthly ? '/mo' : ''}</span><span class="ad">${esc(a.desc)}</span></label></li>`).join('') + (C.addons.length > 6 ? `<li class="more-btn"><button type="button" class="btn btn-ghost btn-xs" data-more-addons>Show ${C.addons.length - 6} more add-ons</button></li>` : '');
const saleAside = T('partials/buy-aside.html');
const saleBuybar = T('partials/buybar.html');
const exAside = (s) => `<aside class="d-buy" id="buy" aria-label="About this example">
      <div class="buy-card ex-card">
        <div class="buy-top"><span class="tier ex-t">Our work</span><span class="mono faint">example · not for sale</span></div>
        <h3 class="ex-h display">Want a site like this?</h3>
        <p class="buy-blurb">This one belongs to us. We design an original site for your brand at the same level of craft, with your content and the features you need.</p>
        <div class="ex-ref" data-price-block><span class="mono-h">similar builds</span><b>${esc(C.tiers[s.tier].name)} tier</b><span class="ex-p">from ${C.tiers[s.tier].was ? `<s class="was">${money(C.tiers[s.tier].was)}</s> ` : ''}<span class="now">${money(C.tiers[s.tier].from)}</span></span><span class="mono faint">${esc(C.tiers[s.tier].weeks)}</span></div>
        <div class="buy-cta"><button class="btn btn-teal" type="button" data-open-request data-kind-pick="Something fully custom">Ask for a custom design</button><a class="btn btn-ghost" href="/websites/">Designs you can order</a></div>
        <p class="fine">Fixed quote within 24 hours. No payment to ask.</p>
      </div>
    </aside>`;
const order2 = [...sale, ...exs];
order2.forEach((s, i) => {
  const prev = order2[(i - 1 + order2.length) % order2.length], next = order2[(i + 1) % order2.length];
  const t = C.tiers[s.tier];
  const host = hostOf(s), ex = isEx(s);
  const vars = {
    slug: s.slug, name: esc(s.name), family: esc(s.family), family_lc: esc(s.family.toLowerCase()), brand: esc(s.brand), pitch: esc(s.pitch), accent: s.accent,
    n: pad(i + (ex ? 1 - sale.length : 1)), sample_line: ex ? 'our own site · example' : s.origin ? esc(s.origin.toLowerCase()) : s.live ? 'live client work' : esc(s.brand.toLowerCase()) + ' sample',
    badges: (ex ? '<span class="tier ex-t">Our work</span><span class="chip nfs">example · not for sale</span>' : tierBadge(s.tier) + (s.live || s.origin ? '<span class="tier built">Built by Hanflux</span>' : '')) + `<span class="chip"><i class="dot live"></i>live on desktop and phone</span>`,
    ex_q: ex ? '&amp;ex=1' : '',
    meta_desc: ex ? `${esc(s.pitch)} Our own site, shown live as an example of Hanflux work. Not for sale: we design an original site for you at the same level.` : s.origin ? `${esc(s.pitch)} Watch it run live on desktop and phone, add features and get a fixed quote.` : `${esc(s.pitch)} Watch the ${esc(s.brand)} sample run live on desktop and phone, add features and get a fixed quote.`,
    includes: s.includes.map((x, k) => `<li data-n="${pad(k + 1)}">${esc(x)}</li>`).join(''),
    bestfor: s.bestFor.map((x) => `<span class="chip">${esc(x)}</span>`).join(''),
    tech: s.tech.map((x) => `<span class="chip">${esc(x)}</span>`).join(''),
    live_block: s.live ? `<div class="block"><div class="live-b"><div><span class="mono-h">${ex ? 'our own site' : 'live client work'}</span><b>${esc(s.brand)} · ${esc(host)}</b></div><a class="btn btn-ghost btn-sm" href="${esc(s.live)}" target="_blank" rel="noopener">Visit the live site<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M10 5H5v14h14v-5"/></svg></a></div></div>` : '',
    note: ex ? `This is our own site, shown as an example of what we build. It is not for sale. Your site is designed from scratch around your brand, at the same level of craft.` : s.origin ? `This was the design of our own site before we moved on to a new one. It is now open to order: we rebuild it around your brand, your words and your content, at the same level of craft.` : s.live ? `This is a real site we built and shipped for ${esc(s.brand)}. Your version is designed from scratch around your brand, in the same style and at the same level of craft.` : `${esc(s.brand)} is a sample brand we made up to show the style. Your site gets your name, colours, words, photos and the sections your business needs.`,
    custom_block: ex ? `<div class="block custom-b"><span class="mono-h">like this level of craft?</span><p class="cb-t">We will design something original for your brand in the same spirit: your story, your content, the features you need.</p><div class="cb-row"><button class="btn btn-teal btn-sm" type="button" data-open-request data-kind-pick="Something fully custom">Ask for a custom design</button><a class="btn btn-ghost btn-sm" href="/websites/">See designs you can order</a></div></div>`
      : `<div class="block custom-b"><span class="mono-h">not exactly this?</span><p class="cb-t">This is one example. We can mix it with another style, match it to your brand or current site, or design something only you have.</p><div class="cb-row"><button class="btn btn-ghost btn-sm" type="button" data-open-request="${s.slug}" data-kind-pick="Mix two or more designs">Mix it with another style</button><button class="btn btn-ghost btn-sm" type="button" data-open-request data-kind-pick="Something fully custom">Ask for a custom design</button></div></div>`,
    tier: s.tier, tier_name: esc(t.name), weeks: esc(t.weeks), price: money(t.from), was_price: money(t.was || t.from), off_pct: offPct(s.tier) + '%', tier_blurb: esc(t.blurb),
    addon_rows: addonRows,
    prev_slug: prev.slug, prev_name: esc(prev.name), next_slug: next.slug, next_name: esc(next.name)
  };
  const fillT = (tpl) => tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? String(vars[k]) : k in offerVars ? String(offerVars[k]) : m));
  vars.aside = ex ? exAside(s) : fillT(saleAside);
  vars.buybar = ex ? `<div class="buybar" id="buybar"><div class="buybar-in"><div class="bb-txt"><span class="mono faint">our work · example</span><b>Not for sale</b></div><button class="btn btn-teal btn-sm" type="button" data-open-request data-kind-pick="Something fully custom">Get one made</button></div></div>` : fillT(saleBuybar);
  write(`websites/${s.slug}/index.html`, render(T('pages/detail.html'), vars, 'websites'));
});

// ---------- agents ----------
// private page behind the PIN gate: it keeps the earlier dark shell (base-dark.css and the -dark partials)
write('agents/index.html', render(T('pages/agents.html'), {}, 'agents', '-dark'));

// ---------- sitemap, robots ----------
const urls = ['/', '/websites/', ...order2.map((s) => `/websites/${s.slug}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${C.site}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /w/\nDisallow: /agents/\nSitemap: ${C.site}/sitemap.xml\n`);

console.log(`built: ${live.length} styles, ${sale.length} for sale + ${exs.length} examples (${live.map((s) => s.slug).join(', ')})`);
if (missing.length) console.log(`not built yet (hidden): ${missing.join(', ')}`);
