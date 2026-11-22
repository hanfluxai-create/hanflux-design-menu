# Mirror: hanflux

- Source: https://hanflux.ai/
- Mirrored: 2026-11-18
- Total size: 1.8M

## Copied
All HTML, JS chunks (incl. lazy DownwardWorld, Scene, CameraRig, IntroController, SplitText, tweakpane, heroNav), CSS, hero PNG, favicon.

## Kept remote
Fontshare CSS/fonts (api.fontshare.com) and Cal.com booking embed stay remote.

## Rewritten / neutralised
Root-absolute /assets/..., /favicon.svg and Vite's preload map (return`/`+e) rewritten to /w/hanflux/. Added hx-adapter.js: the site's Lenis leaves window.lenis as a plain object without scrollTo, so the adapter adds one driving native scroll. No analytics or forms found; no service worker.
- Inserted `<script src="/shared/hx-embed.js"></script>` as first script in head.
- Added hx-phone.css (22 Nov 2026), phones only: hides the progress read-out and the Top button, moves Book a call to the top right and Jack in to the bottom right, so no floating control covers headings or the chapter index. The live hanflux.ai still has those overlaps.

## Known differences
Fonts need network. Scrambled-text frames in the QA sheet are the site's own text-scramble animation.
