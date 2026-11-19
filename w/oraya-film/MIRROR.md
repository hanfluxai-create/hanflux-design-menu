# Mirror: oraya-film

- Source: https://oraya-audit.vercel.app/
- Mirrored: 2026-11-18
- Total size: 17M

## Copied
index.html, assets (app.css, site.js, world.js, three.module.min.js), all 172 film frames (film/f000-f171.webp) and the 5 loop clips (mp4, webm, webp). Frames are same-origin on that host, not Blob, and small, so they were copied.

## Kept remote
Google Fonts, jsdelivr Lenis script, cal.com links.

## Rewritten / neutralised
Removed the /api/qa diagnostics beacons (index.html, world.js). Disabled the lead webhook send and the Cal.com inline embed on form submit (shows local note plus the 'Open the booking page' link to cal.com). Lenis is not started when HX.embed is true (native scroll drives the tour). Analytics (GTM/GA4/Meta pixel) only load when ORAYA_CONFIG ids are set; none are, so nothing fires.
- Inserted `<script src="/shared/hx-embed.js"></script>` as first script in head.

## Known differences
Form step 2 shows a local note instead of the live calendar.
