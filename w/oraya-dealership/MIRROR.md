# Mirror: oraya-dealership

- Source: the /dealership page of the OrayaAI repo (acaef74): public/dealership/ rebuilt from a copy of dealership-src/
- Mirrored: 2026-11-19
- Total size: 820K (film is shared from /w/oraya-classic/film/)

## Copied
index.html, assets/os.js (rebuilt with node dealership-src/build.mjs, three.js included), og.jpg.

## Kept remote
Google Fonts, plain links to cal.com/oraya/30min and orayalabs.ai (new tab), mailto links.

## Rewritten / neutralised
- Inserted `<script src="/shared/hx-embed.js"></script>` as first script in head; HX.ready() after boot; HX.lite forces the low render tier.
- Asset paths rewritten to /w/oraya-dealership/assets/os.js; film paths to /w/oraya-classic/film/ (720p file for HD and SD).
- Voice removed from the source: no ConsoleUI, no WebSocket, no probe fetch, no feedback endpoint, no getUserMedia, no team/localStorage mode. Every talk button and tel: link (and the film end card's talk button) shows a small inline note: "Live voice runs on the real site. In your build, this button starts a call with your AI agent." The status chip reads "Voice preview". Supabase preconnect and canonical link removed.
- No analytics, pixels or service workers exist in the page.

## Known differences
- The page's own copy still mentions calling +1 (925) 940-4462 and live agents; that is Oraya's text, left unchanged. QA flagged no text issues.
- The walk-in intro plays on first load in each frame.
