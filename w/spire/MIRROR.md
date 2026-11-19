# Mirror: spire

- Source: hanfluxai-create/hanflux-ai-portfolio @ 9e7667a (last commit before "The Lattice: replace the Spire city...")
- Mirrored: 2026-11-19
- Total size: 1.7M

## Copied
Full Vite production build (base /w/spire/) of the commit: index.html, JS chunks (three, postprocessing, r3f, react, GSAP SplitText, lazy Scene, DownwardWorld incl. CityWorld city, Filmstrip, Portal), CSS, hero PNG, favicon.

## Kept remote
Fontshare CSS/fonts (api.fontshare.com) stay remote.

## Rewritten / neutralised
- Built with `vite build --base=/w/spire/`; no root-absolute paths remain. No router, no fetches, no analytics, no forms.
- Inserted `<script src="/shared/hx-embed.js"></script>` as first script in head.
- Source patches (src/embed.ts, rebuilt): window.__lenis exposed for the tour; data-tour stops on hero, threshold, filmstrip, loop, build log, stack, metrics, ways-in and portal; HX.ready() fired when the intro finishes.
- Lite/perf: in embed, detect-gpu (CDN benchmark fetch) skipped and a fixed tier used (medium on lite); Act I canvas stops rendering once the descent begins (body.in-act2); lite uses city tier "mobile" (fewer towers, vehicles, drones), DPR 1, half-resolution bloom; embed caps city DPR at 1.25, Portal DPR 1, Act I antialias off.
- Links: mailto, external (X, LinkedIn, GitHub) and /legal clicks are intercepted and show a small inline note in the site's glass/teal style; nothing is sent. Custom cursor hidden in frames.

## Known differences
Fonts need network. Title/meta description keep the original em dash. LLM intent classifier stays off (no key), as in the original.
