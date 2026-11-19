# Mirror: enviroplan

- Source: https://www.enviroplan.in/
- Mirrored: 2026-11-18
- Total size: 16M

## Copied
index.html, image-slot.js, support.js, three videos under 8 MB (living-landscape-a/b, way-forward-a).

## Kept remote
way-forward-b.mp4 (20 MB) kept as absolute URL https://www.enviroplan.in/uploads/way-forward-b.mp4; three.js r128 from cdnjs; Earth textures from threejs.org; Google Fonts.

## Rewritten / neutralised
way-forward-b src made absolute. Added hx-adapter.js: the page scrolls inside #env-scroll (100vh, scroll-snap), so the adapter exposes that container as the page scroller (scrollHeight, scrollY, scrollTo, __lenis.scrollTo) and disables scroll-snap in embed mode. Contact/donate buttons are mailto links only; no forms, analytics or service worker.
- Inserted `<script src="/shared/hx-embed.js"></script>` as first script in head.

## Known differences
Page title is empty on the original too. QA flags aborted video requests (browser cancels range loads), not errors.
