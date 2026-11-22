# Hanflux Design Menu

Live at https://hanflux-design-menu.vercel.app: the Hanflux AI "website factory". Prospects watch real, working website designs on their phone, pick one, add features and order. Every site goes live on the client's own domain within 48 hours of payment.

## Pages
- `/` home: the offer (live in 48 hours, from the launch price in INR or USD, compared with a typical agency quote), a swipeable design rail grouped by business type, how it works, the website factory and its 12-point launch check, prices, custom orders, the free website plan form, FAQ, sticky bar on phones.
- `/websites/` the design menu, filtered by business type or plan. `/websites/<slug>/` one design: live preview (Phone / Laptop / Both, full screen, auto-scroll switch), price card with add-ons and "Order this design".
- `/order/` ordering in four steps: design and features, the business, contact, review and pay. Progress is kept in the browser.
- `/agents/` private AI agent interface menu behind a PIN gate (older dark shell).
- `/w/<slug>/` the live demo sites. Each loads `/shared/hx-embed.js` first (embed, auto-tour, `HX.lite`).
- `/api/pay/` POST creates a Razorpay payment link for one order; the amount comes from `api/_prices.json` (written by the build), never from the browser. GET returns `{ ready }`. `/api/verify/` checks Razorpay's signature when a client comes back from paying. Both need `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in the Vercel project; without them the order page places the order and says we call and send the link.

## Data
- `data/config.js`: contacts, currencies (INR for visitors in India, USD elsewhere, switchable), launch offer (ends 31 Dec 2026, real "from 1 Jan" prices), plans with INR and USD prices, add-ons, what every plan includes, the 12 launch checks, business groups for the filters, custom orders, payment settings, our own example sites, the lead endpoint (FormSubmit).
- `data/sites.js`: the designs, in menu order.

## Build, check, ship
- `node tools/build.mjs` renders every page and `api/_prices.json` from `tools/pages`, `tools/partials` and `data/*.js`. Run it after any data or template change.
- `python3 tools/posters.py <slug>` makes the first-screen posters; `python3 tools/reels.py <slug>` makes reel frames 2 and 3 (phones play these instead of live sites).
- `python3 tools/qa.py <slug>` checks a demo on desktop and phone. `python3 tools/og.py <laptop> <phoneA> <phoneB> 0` renders the link preview image.
- Push to `main`: Vercel deploys to production.

## Why phones stay smooth
- Lists never run live sites on phones: the card nearest the middle plays a reel (three screens cross-fading on the GPU). Desktops run at most two live cards.
- A design page on a phone shows one phone frame, first thing under the title. A reel plays until the visitor pauses, then the live site starts.
- Posters are rendered into the HTML (no script needed to see them), images load lazily, assets are cached.
- The phone frame is drawn like a real iPhone: status bar with the Dynamic Island, the site starting below it.
- On phones the top bars slide away while reading down and return on scroll up.

## Checks
- `tools/check/sweep.py` every page on phone and laptop sizes; `tools/check/phone.py` screens in the iPhone (WebKit) and Android engines; `tools/check/perf.py` and `scrollperf.py` load and scroll speed on a slow phone; `tools/check/orderflow.py` the whole order flow.
- `MANAGER.md` is the handbook for making changes.
