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

## Known differences
Fonts need network. Scrambled-text frames in the QA sheet are the site's own text-scramble animation.
