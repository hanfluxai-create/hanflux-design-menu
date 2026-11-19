# Mirror: oraya

- Source: https://orayalabs.ai/
- Mirrored: 2026-11-18
- Total size: 712K

## Copied
index.html, support.js (dc-runtime), vendor/react.js, vendor/react-dom.js, both JPGs.

## Kept remote
Google Fonts, jsdelivr CDN fallbacks used by support.js, cal.com (links only).

## Rewritten / neutralised
Nothing path-related needed (all relative). The demo form already opens cal.com/oraya/30min in a new tab (no backend submit); left as is. No analytics or service worker found.
- Inserted `<script src="/shared/hx-embed.js"></script>` as first script in head.

## Known differences
None known. support.js re-fetches its own page URL, which works from /w/oraya/.
