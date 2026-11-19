# Hanflux Design Menu: build spec for live website demos

You are building sample websites for the **Hanflux Design Menu**, a sales page where prospective
clients watch live websites (in a desktop frame and a phone frame at the same time, auto-scrolling)
and pick the style they want Hanflux to build for them. Each demo must be good enough that a
business owner wants to buy it on sight: Awwwards "Site of the Day" quality, not a template.

Read this whole file, then your briefs in `/home/claude/hdm/tools/BRIEFS.md` (only the slugs you were given).

## Where things go

- Your demo lives in `/home/claude/hdm/w/<slug>/`:
  - `index.html`: real content markup (headings, copy, nav, footer are in the HTML, not injected by JS)
  - `style.css`
  - `main.js` (ES module). Split into more modules if useful (`scene.js`, `shaders.js`...).
  - optional `assets/` for anything you generate (SVG, small textures). No external image hotlinks.
- Shared, already in place (do not edit):
  - `/shared/hx-embed.js`: embed and auto-tour runtime. **Must be the first script in `<head>`**:
    `<script src="/shared/hx-embed.js"></script>`
  - `/vendor/three/three.module.min.js` (three r187) and `/vendor/three/addons/...` (examples/jsm)
  - `/vendor/gsap/gsap.min.js` plus `ScrollTrigger`, `SplitText`, `Flip`, `DrawSVGPlugin`, `MorphSVGPlugin`,
    `ScrambleTextPlugin`, `CustomEase`, `MotionPathPlugin`, `Observer`, `TextPlugin`, `InertiaPlugin`, `Draggable` (`.min.js`, UMD globals). GSAP is free for commercial use.
  - `/vendor/lenis/lenis.min.js` and `lenis.css` (optional)
- Use absolute paths for shared files (`/vendor/...`, `/shared/...`) and relative paths for your own (`./style.css`).

Head template (adapt):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script src="/shared/hx-embed.js"></script>
<title>Brand · short tagline</title>
<meta name="description" content="...">
<meta name="theme-color" content="#......">
<link rel="icon" href="data:image/svg+xml,...">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=...&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./style.css">
<script type="importmap">{"imports":{"three":"/vendor/three/three.module.min.js","three/addons/":"/vendor/three/addons/"}}</script>
<script src="/vendor/gsap/gsap.min.js" defer></script>
<script src="/vendor/gsap/ScrollTrigger.min.js" defer></script>
<script type="module" src="./main.js"></script>
</head>
```

Fonts: Google Fonts or Fontshare (`https://api.fontshare.com/v2/css?f[]=...`), at most 2 to 3 families, `display=swap`.

## The runtime you get: `window.HX`

`hx-embed.js` defines `window.HX` before your code runs:

- `HX.embed`: true inside a menu frame. Hide custom cursors, cookie banners, intro gates and anything needing a click. The page must start animating on its own.
- `HX.tour`: true when the menu auto-scrolls the page. The tour glides from stop to stop and loops.
- `HX.lite`: true for phone frames and low-power cases. Cut particle counts, raymarch steps, shadow-map size and post-processing roughly in half.
- `HX.device`: `'desktop'` or `'mobile'`.
- `HX.ready()`: call once your first frame is drawn (after the WebGL scene renders, or after fonts for pure HTML/CSS). The menu reveals the live frame on this signal.
- `HX.on('pause' | 'play', fn)`: the menu pauses offscreen frames. `requestAnimationFrame` callbacks are held automatically while paused, so a normal rAF loop needs no extra work.
- `window.devicePixelRatio` may be capped by the menu (`?dpr=`). Always use `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`.
- If you use Lenis, do **not** start it when `HX.embed` is true. Otherwise set `window.__lenis = lenis`.

Tour stops: put `data-tour` on the elements where the tour should pause (hero, each major section start).
`data-tour="2600"` sets the dwell in ms (default 1700). Pinned or scrubbed sequences: put `data-tour` on the pin start; the tour then scrolls through the pin at a steady speed, which plays the scrubbed animation. Make sure the frame at every stop looks great, because that's what people see longest.

Test the tour yourself at `/w/<slug>/?embed=1&tour=1`.

## Content rules (hard)

1. **No placeholders, ever.** No lorem ipsum, no "Your text here", no grey boxes, no "Image", no empty sections, no broken images, no visible JSON or template syntax, no `undefined` or `NaN`. Write real, specific, persuasive copy for the fictional brand in your brief: product names, prices, hours, menus, plans, FAQs.
2. **No em dashes (—) anywhere in visible copy**, and no spaced en dashes used as dashes. Use commas, colons, full stops or parentheses. The QA script flags them.
3. Brands, people, reviews and numbers are fictional. Every demo footer carries one subtle line:
   `Sample site designed by Hanflux AI. Brand, people and content are fictional.`
   Do not name real companies, real publications, real awards or real people. Do not use real brand logos.
   Use generic wording ("all major cards", "UPI", "Google Calendar" is fine as a plain-text integration name only when the brief says so).
4. Phone numbers: US style must use 555-01xx (e.g. +1 (415) 555-0142). For India, show WhatsApp and booking buttons instead of a number. Emails use the brief's fictional domain.
5. No stock photos and no external image URLs (the photo service is not available). All visuals are made by you: WebGL/three.js, SVG, canvas, CSS. Treat this as the point: custom visuals are what clients pay for. Product shots (bottles, cards, packs, cups) are 3D or illustrated.
6. Forms never submit anywhere: `preventDefault()`, then show a friendly inline success state. No `alert()`, `confirm()` or `prompt()`.
7. Copy is English. Currency per brief. Indian prices use the ₹ sign and Indian digit grouping (₹1,49,000 only when above a lakh; ₹38,000 is fine).

## Design quality bar

- One unmistakable signature moment in the first viewport (the brief names it). It must read even at thumbnail size: bold shapes, strong contrast, motion.
- Real art direction: a clear type scale (display, heading, body, label), a spacing system, intentional grid, considered color. No default-looking Bootstrap sections. Every section has a reason to exist and a visual idea.
- Motion with purpose: GSAP ScrollTrigger reveals (split-line headings, staggered cards, parallax, counters, pinned sequences). Ease with `power3`/`expo`. Nothing janky, nothing that blocks reading.
- Micro-interactions: hover states, pressed states, focus rings, magnetic buttons on desktop only.
- **Phone is a first-class layout, not a squeeze.** Design for 390 x 844: type with `clamp()`, nav collapses to a menu button with a full-screen overlay, horizontal sequences become vertical or swipeable, tap targets at least 44 px, no sideways scrolling ever, safe-area padding.
- Accessibility: semantic landmarks, alt text or aria-labels on visuals, decent contrast, visible focus, `prefers-reduced-motion` respected when not embedded (`HX.reducedMotion`).
- 6 to 9 sections, roughly 6 to 10 screen heights on desktop. A nav, a hero, the industry sections the brief lists, a strong final call to action, and a full footer.

## Performance budget (the menu runs your page inside small frames, often two at once, on phones)

- One WebGL renderer per page, at most. `antialias` only when cheap. `powerPreference: 'high-performance'`.
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`. In `HX.lite`, cap at 1.5 and halve heavy counts.
- Stop rendering a canvas when it's offscreen (IntersectionObserver) unless it's a fixed background used by every section.
- Fragment-heavy effects (raymarching, full-screen noise) render to a half-resolution target in `HX.lite` or always if heavy.
- Generated textures under 1024 px. No video files. Your own JS under about 150 KB unminified. First viewport visible within about 1.5 s on a laptop.
- Never block the main thread with heavy synchronous generation (precompute in chunks or keep it small).
- No `console.error`, no uncaught errors, no 404s.

## QA (do this before you report back)

Run: `python3 /home/claude/hdm/tools/qa.py <slug>` (it serves the folder, opens desktop 1440x900 and phone 390x844 in
headless Chromium with software WebGL, captures 8 scroll positions each, checks errors, sideways overflow, broken images,
placeholder words and em dashes, and checks the tour moves). Then look at `/home/claude/hdm/_qa/<slug>/sheet.jpg` with the
Read tool (desktop row on top, phone row below). Fix everything and re-run until the report is clean and the sheet looks
premium in every frame. Software WebGL is slow and a bit softer than a real GPU, so judge composition, not frame rate.
Only one Chromium runs at a time across all builders (a lock), so the script may wait for its turn.

Also open a single position at higher resolution when you need detail: write a tiny Playwright snippet or reuse the PNGs in
`/home/claude/hdm/_qa/<slug>/` (`d_00.png` ... desktop, `m_00.png` ... phone).

## Report back

When all your slugs are done, reply with, per slug: brand, the signature effect, sections, anything you could not do, and the final QA
line (errors, flags, tour px). Keep it short. Do not edit anything outside your own `w/<slug>/` folders.
