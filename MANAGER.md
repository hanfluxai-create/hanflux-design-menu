# Hanflux Design Menu: manager handbook

You look after https://hanflux.ai/factory, the Hanflux Design Factory sales site. hanflux.ai proxies /factory/* to this project (rewrites in the hanflux-ai-portfolio repo's vercel.json). Every URL in this repo carries the /factory prefix and this project's vercel.json maps /factory/* back to the files. Old hanflux-design-menu.vercel.app page links redirect to hanflux.ai/factory.

Pricing (Nov 2026): one flat price for every design, hosting included, in dated steps (`pricing` in data/config.js): ₹40,000 / $555 until 3 Dec, ₹60,000 / $830 until 31 Dec, ₹80,000 / $1,110 from 1 Jan 2027. The head script sets html.ps0/ps1/ps2 so static pages switch on their own. Add-ons have a setup fee plus a monthly fee (`mo`).

Leads: every form posts from the browser to Web3Forms (emails the owner's personal inbox; key in config `lead.web3` and env WEB3FORMS_KEY) and to /factory/api/lead/, which saves each lead in the private Vercel Blob store `hanflux-factory-leads` (leads/<date>/*.json). Web3Forms' free plan refuses server-side sends, so set RESEND_API_KEY to add a server-side email fallback. FormSubmit is no longer used.

Older notes below say "website factory" and four plans; the flat price above replaces them. People open the link from WhatsApp groups on a phone, watch real working website designs, pick one, add features, order and pay. The owner (Chitraksh, Hanflux AI) texts you changes. You make each change, check it, push it live, confirm it live, and reply in one or two lines with the link. Make the change he asked for and nothing extra.

## 1. Start of a session

- Repo: GitHub `hanfluxai-create/hanflux-design-menu`, branch `main`. A push to `main` deploys to production on Vercel in about a minute (Vercel project `hanflux-design-menu`, id `prj_QMx8yzAYc9YGYfzGpJZ2gA8p46M9`, team `team_jLXbHJ5VmNG2lFaSWkeoiTEO`).
- If the repo is not in the workspace: `add_repo` (owner `hanfluxai-create`, repo `hanflux-design-menu`, access `push`), clone it as the tool says, then `register_repo_root`.
- Every tool uses `/home/claude/hdm`: `ln -sfn <clone path> /home/claude/hdm` if it does not exist.
- `cd /home/claude/hdm && node tools/build.mjs` must finish without "unfilled tokens".
- Local copy for checks: `python3 -m http.server 8811 --directory /home/claude/hdm` (run in the background). There is no `/api/` locally, so the order page ends in call-back mode there.
- Playwright and Chromium are preinstalled (`/opt/pw-browsers`). Chromium needs `--use-angle=swiftshader --enable-unsafe-swiftshader` for WebGL; the tools already pass them.

## 2. How every change goes

1. Edit the source, never the built HTML: `data/config.js`, `data/sites.js`, `tools/pages/*.html`, `tools/partials/*.html`, `assets/hx/*.css|js`, `api/*.js`.
2. `node tools/build.mjs` (writes `index.html`, `websites/`, `order/`, `api/_prices.json`, sitemap). The built files are committed; Vercel serves them as they are.
3. Check: `python3 tools/check/sweep.py http://127.0.0.1:8811 quick` (or without `quick` for all pages). Take screenshots of what changed at 390x844 and 1190x760 and look at them with Read. For anything priced, look at both currencies (`?cur=inr` and `?cur=usd`).
4. Commit and push:
   `git add -A && git -c user.name="Hanflux AI" -c user.email="hanfluxai@gmail.com" commit -m "<plain summary>"` (end the message with the attribution lines your session gives you), then `git -c push.negotiate=true push origin main`.
5. Confirm live after 60 to 90 seconds: fetch the changed page and find the change (Vercel MCP `list_deployments` if a deploy seems stuck).
6. Reply: what changed, where, the link. Short.

## 3. File map

- `data/config.js`: contacts (WhatsApp, cal.com link), currencies, launch offer, the four plans with INR and USD prices, what every plan includes, the 12 launch checks, business-type filters (`biz`), custom orders, payment settings, add-ons, lead endpoint.
- `data/sites.js`: the designs, one JSON line each, in menu order (`slug, name, family, brand, domain, industry, tier, tags, accent, bg, pitch, bestFor, includes, tech`). `examples` in config marks our own sites (shown as our work, not for sale).
- `tools/build.mjs`: renders every page. The home gallery picks are the `GAL` array near the top.
- `tools/pages/`: `index.html` (home), `websites.html` (menu), `detail.html` (one design), `order.html` (ordering), `agents.html`. `tools/partials/`: head, nav, foot, buy card (`buy-aside.html`), phone buy bar.
- `assets/hx/`: `base.css` (shared, buttons, currency, sticky bar), `home.css`, `websites.css`, `detail.css`, `frames.css` (device frames, iPhone island, reels), `order.css`; `shell.js` (currency, saved designs, countdown, sticky bar), `lead.js` (free plan form and pop-up), `frames.js` (live preview and reel scheduler), `home.js`, `websites.js`, `detail.js`, `order.js`.
- `api/pay.js` (creates the Razorpay payment link), `api/verify.js` (checks Razorpay's signature), `api/_prices.json` (price book written by the build; the server charges from this, never from the browser).
- `w/<slug>/`: the live demo sites. `posters/`: first-screen posters and reel frames per design, plus `posters/top.json` (the colour along the top of each phone poster; the phone frame's status bar takes it, as Safari does).
- `w/hanflux/` is a mirror of the owner's own site hanflux.ai (a compiled bundle, not our source). Its phone fixes live in `w/hanflux/hx-phone.css` (see `MIRROR.md`). The real hanflux.ai still has those phone overlaps.
- `tools/SPEC.md` (the contract for building a demo), `tools/BRIEFS.md` (design briefs), `tools/qa.py`, `tools/posters.py`, `tools/reels.py`, `tools/og.py` + `tools/og.html` (link preview image), `tools/check/` (sweep, perf, scrollperf, orderflow, phone).

## 4. What the site promises (keep every page consistent with this)

- Live within 48 hours of payment: we call within 24 hours to collect the domain, logo, photos, text and any technical details, and the site is live on the client's own domain within 24 hours of that call.
- Building starts only after payment. The price is fixed before any work begins.
- As many changes as they want before launch. After launch, 30 days of small fixes (a new button, a changed calendar link), not redesigns.
- Custom orders (backends for orders, bookings or payments; custom features, dashboards, portals; AI agents, chat and voice; CRM, ERP and app connections) are scoped on a call, quoted separately and have their own timeline. They are outside the 48-hour promise.
- Free website plan: the visitor leaves name, WhatsApp and business type; within 24 hours we WhatsApp the design that fits, the pages they need and the fixed price.
- Prices: rupees for visitors in India (time zone Asia/Kolkata or an `-IN` language), US dollars elsewhere, switchable. Dollar prices are always higher than rupee prices. Rupees in round amounts.
- Launch prices until 31 Dec 2026, 23:59 IST; from 1 Jan 2027 the site shows the higher "was" prices on its own.

| Plan | What | Launch INR | From 1 Jan | Launch USD | From 1 Jan |
|---|---|---|---|---|---|
| Essential | Simple site, up to 5 pages | ₹40,000 | ₹50,000 | $600 | $750 |
| Growth | Business site, up to 10 pages | ₹55,000 | ₹70,000 | $850 | $1,100 |
| Signature | Animated site | ₹75,000 | ₹95,000 | $1,200 | $1,500 |
| Flagship | 3D site | ₹95,000 | ₹1,20,000 | $1,600 | $2,000 |

- Agency comparison, always labelled as a typical quote: ₹1 to 5 lakh, $3,000 to $10,000+.
- No fake scarcity, no countdown except the real offer end date, no refund promises, no invented reviews, client logos or numbers.

## 5. Writing rules

- Plain English for a business owner who has never seen the site, reading on a phone. Lead with the outcome (a website for their business, live in 48 hours, at a fixed price).
- One main action per screen: "Get my free website plan" on the home page, "Order this design" on a design page. Do not add competing buttons.
- Design names (Glass, Liquid Chrome) always sit next to the business they suit (dental clinic, perfume house).
- No em dashes in any visible copy.

## 6. Phones stay smooth (do not break these)

- Lists never run live sites on phones. The card nearest the middle plays a reel (poster plus `-d2/-d3/-m2/-m3.webp` frames cross-fading on the GPU). Desktops run at most two live cards.
- A design page on a phone shows one phone frame. A reel plays until the visitor pauses for 1.8 seconds, then the live site starts.
- Posters are rendered into the HTML. A new design needs `python3 tools/posters.py <slug>` (also updates `posters/top.json`) and `python3 tools/reels.py <slug>`.
- The phone frame is a real iPhone: status bar (9:41, signal, wifi, battery) with the Dynamic Island in it, and the site starting below it. `frames.js` gives live phone frames the same offset (`SB`, 13.6% of the width).
- On phones the offer bar and header slide away while reading down and return on any scroll up (`hdr-off` on `<html>`, set in `shell.js`). On a design page the preview comes first, the controls under it.
- After layout or script changes, measure against live with `tools/check/scrollperf.py` and `tools/check/perf.py`; their headers hold the reference numbers. Do not ship a regression.
- Look at real phone engines too: `tools/check/phone.py webkit 393 659 iphone <paths>` (iPhone Safari size) and `tools/check/phone.py chromium 360 640 android <paths>`, then read the sheets.

## 7. Payments and leads

- `/order/` (4 steps: design and features, business, contact, review and pay) POSTs to `/api/pay/`, which creates a Razorpay payment link for the exact amount from `api/_prices.json`. Razorpay sends the client back to `/order/?paid=1`; `/api/verify/` checks the signature and a "PAID" lead is posted.
- Needs `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in the Vercel project's Production environment, then a redeploy. Until then `GET /api/pay/` returns `{"ready":false}` and orders are placed in call-back mode (we call within 24 hours and send the link).
- Never ask the owner to paste keys or secrets in chat; he adds them in Vercel himself. Dollar payments need international payments switched on in his Razorpay account.
- The Razorpay connector, if present, is read-only: use it to confirm a payment or list payment links.
- Leads: every form posts to FormSubmit (`lead.endpoint` in config) and offers WhatsApp to `+91 92346 60000`. FormSubmit only delivers after its one-time "Activate Form" email has been clicked in the inbox.

## 8. Recipes

- Price or add-on change: `tiers` or `addons` in config. Keep dollars above rupees. Build, then check home, menu, a design page and `/order/` in both currencies.
- WhatsApp number, calendar link: top of config.
- Offer end date: `offer.ends`, `offer.endsLabel`, `offer.note`.
- Menu order: order of lines in `data/sites.js`. Home gallery: `GAL` in `tools/build.mjs`. Business filters: `biz` in config.
- New design: build `w/<slug>/` to `tools/SPEC.md` (shared runtime, `HX.ready()`, `data-tour`, phone budget), pass `python3 tools/qa.py <slug>`, add its line to `data/sites.js` and a `biz` group, run posters and reels, build, sweep, push.
- Remove a design: its `sites.js` line, `w/<slug>/`, `websites/<slug>/`, `posters/<slug>*`, and every mention in `biz` and `GAL`; build, sweep, push.
- Link preview image: `python3 tools/og.py <laptop slug> <phone slug> <phone slug> 0` writes `assets/hx/og.png` (now `estate gold silk`). WhatsApp caches previews per link, so a new image shows on newly shared links.

## 9. Gotchas

- `data/config.js` contains the inbox address: read and edit it with the Read and Edit tools only, never `cat` or `grep` it in Bash (a privacy hook blocks that). Exclude it from repo-wide searches (`--exclude=config.js`).
- Git pathspec exclusions use `':(exclude)path'`.
- `vercel.json` sets `trailingSlash: true`: link to `/websites/glass/`, with the slash.
- One Chromium at a time: qa, posters, reels and `tools/check/*` share the lock `/tmp/hx-chromium.lock`.
- `_qa/` and `node_modules/` are git-ignored.
- Never push the Oraya AI repository to its `main`; it is a different project.
- `/agents/` is the older AI agent interface menu behind a PIN gate. Leave it alone unless asked.

## 10. Waiting on the owner (as of 22 Nov 2026)

1. FormSubmit: send one test lead from the site, then click "Activate Form" in the inbox.
2. Razorpay: add the Live API keys to the Vercel project (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`), then redeploy.
3. Razorpay: switch on international payments for dollar orders.
4. Confirm the published promises: the 12-point check report, unlimited changes before launch, 30 days of small fixes, live in 48 hours, the free plan within 24 hours.

## 11. The designs, in menu order (data/sites.js)

| # | slug | Name | Plan | Brand | Business |
|---|---|---|---|---|---|
| 1 | particles | Particle Field | flagship | Novaform | AI forecasting platform |
| 2 | liquid | Liquid Chrome | flagship | Maison Orré | Niche perfume house |
| 3 | estate | Golden Hour | flagship | Ruvela Residences | Residential developer, Pune |
| 4 | hanflux | Lattice | flagship (example, not for sale) | Hanflux AI | Our own studio site |
| 5 | holo | Holographic | flagship | Prism | Metal cashback card |
| 6 | gold | Solitaire | signature | Varelle | Jewellery house, Jaipur and Mumbai |
| 7 | neon | Neon Nights | signature | Velvet Ward | Cocktail bar and club, Mumbai |
| 8 | glass | Glass | growth | Lumen Dental | Premium dental clinic |
| 9 | silk | Satin Ribbon | signature | Selvine Salon & Spa | Salon and spa, Hyderabad |
| 10 | vhs | Retro VHS | signature | Static Bloom | Record label and festival |
| 11 | iso | Isometric | flagship | Cargoflow | Logistics software |
| 12 | deco | Art Deco | signature | The Gilded Palms | Heritage luxury hotel |
| 13 | pixel | Pixel Quest | signature | Pixelforge Arcade | Gaming café and esports lounge |
| 14 | comic | Comic Book | signature | Boom Burger | Smash-burger joint and food truck |
| 15 | kinetic | Kinetic Type | signature | Loudmouth | Branding and motion agency |
| 16 | clay | Clay 3D | signature | Doodle Labs | Coding app for kids |
| 17 | ascii | ASCII Terminal | signature | Blackline | Cybersecurity firm |
| 18 | mesh | Gradient Mesh | growth | Stillwater | Meditation and sleep app |
| 19 | wireframe | Wireframe 3D | flagship | Arcline Studio | Architecture practice |
| 20 | halftone | Halftone | growth | Grain & Ink | Coffee roaster and café |
| 21 | flap | Split-Flap | signature | Northbound | Curated travel |
| 22 | bauhaus | Bauhaus | growth | Formhaus | Online design school |
| 23 | bento | Bento | growth | Ledgerly | Invoicing software |
| 24 | blueprint | Blueprint | growth | Keystone Build | Construction and engineering |
| 25 | editorial | Editorial | growth | Atelier Noor | Block-printed fashion label |
| 26 | brutal | Neo-Brutal | growth | CRUNCH CO. | D2C snack brand |
| 27 | swiss | Swiss Minimal | essential | Mehra & Rao | Corporate law firm |
