# Hanflux Design Menu

Live at https://hanflux-design-menu.vercel.app

- `/` home, `/websites/` live website menu, `/websites/<slug>/` one design with pricing, `/agents/` AI agent interfaces.
- `/w/<slug>/` the live demo sites shown inside the device frames (each loads `/shared/hx-embed.js` for the auto-tour).
- `data/config.js` contacts, tiers, add-ons and prices. `data/sites.js` the website styles and their order.
- `node tools/build.mjs` renders the pages from `tools/pages` and `tools/partials` after any data or template change.
- `python3 tools/posters.py [slug]` refreshes the still posters; `python3 tools/qa.py <slug>` checks a demo on desktop and phone.
