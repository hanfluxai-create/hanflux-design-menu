# Premium film templates: how they are built

A premium template is a demo site in `w/<slug>/` whose first screens are a film that the scroll plays, frame by frame,
on a canvas. There is no `<video>` element anywhere, so iPhone Low Power Mode, data saver and autoplay rules cannot
stall it. Read `tools/SPEC.md` first: every content and quality rule there applies. This file adds the film contract.

## Files in a template

- `index.html`, `style.css`, `main.js` (ES module): yours.
- `kit.js`, `kit.css`: copied in by `tools/premium/sync.sh` from `tools/premium/`. Never edit the copies.
- `film/d/001.webp .. 096.webp` (1280x720), `film/m/001.webp .. 096.webp` (540x960, a real vertical cut, not a crop),
  `film/still-d.webp`, `film/still-m.webp` (the first frame). Cut with `tools/premium/encode.sh`.
- A second film for a section lives in its own folder with the same layout (`walk/d`, `walk/m`, ...).
- `img/*.webp`: photographs, always with `width`, `height`, `loading="lazy"`, `decoding="async"` and real alt text.

## Head

```html
<script src="/factory/shared/hx-embed.js"></script>   <!-- first script, always -->
<link rel="preload" as="image" href="./film/still-d.webp" media="(min-aspect-ratio: 85/100)" fetchpriority="high">
<link rel="preload" as="image" href="./film/still-m.webp" media="(max-aspect-ratio: 85/100)" fetchpriority="high">
<link rel="stylesheet" href="./kit.css"><link rel="stylesheet" href="./style.css">
<script type="module" src="./main.js"></script>
```

## Film markup

```html
<section class="film" id="film" data-tour="2600" aria-label="...what the film shows...">
  <div class="film-pin">
    <picture><source media="(max-aspect-ratio: 85/100)" srcset="./film/still-m.webp">
      <img class="film-still" src="./film/still-d.webp" alt="..." fetchpriority="high"></picture>
    <canvas aria-hidden="true"></canvas>
    <div class="film-ui">
      <div class="ch on" data-at="0,0.2"> ...h1, buttons... </div>      <!-- shown while the film is between 0 and 20% -->
      <div class="ch" data-at="0.27,0.47"> ... </div>
      <i data-bar></i>                                                  <!-- optional: kit scales it on X with progress -->
    </div>
  </div>
</section>
```

`kit.css` makes `.film` 360vh tall (320vh on phones) with `.film-pin` sticky and full screen, lays the still and the
canvas over each other with `object-fit: cover`, and fades `[data-at]` blocks in and out (`.on`). Change the height per
film in your own CSS (`#walk { height: 240vh }`). Without JavaScript the still image and the first chapter show; with
`prefers-reduced-motion` the film stays on its first frame and the section collapses to one screen.

## main.js

```js
import { film, reveals, $, $$ } from './kit.js';
film({ section: '#film', counts: { d: 96, m: 96 }, onProgress: (p) => {} });         // hero film, folder ./film/
film({ section: '#walk', counts: { d: 96, m: 96 }, base: './walk/' });               // a section film, loads when near
reveals();   // .rv scroll reveals (style="--d:1" staggers), [data-count] counters, phone menu ([data-menu] + #menu),
             // .nav gets .stuck after the first 24px, form[data-demo] shows its .form-ok instead of sending
```

`film()` calls `HX.ready()` when its first frame is drawn. `onProgress(p)` runs only when progress changes; use it to
move one small element with `transform`, never to set a CSS variable on a big subtree.

## How the film stays smooth (do not undo)

- Frames are fetched and decoded in a worker, coarse to fine; only about two dozen decoded frames are kept in memory.
- One passive scroll listener and one requestAnimationFrame loop for every film on the page. No other scroll listeners:
  use IntersectionObserver or `onProgress`.
- Nothing expensive may sit on top of the moving film or stay fixed over the page: no `backdrop-filter`, no
  `mix-blend-mode`, no CSS `filter`, no big masks, no animated box-shadow. A fixed nav uses a solid or translucent
  colour, not a blur. Animate only `transform` and `opacity`.
- `python3 tools/premium/perf.py <slug>` scrolls the page under a 4x CPU throttle at 390x664 and 1280x800 and prints
  the frames slower than 34 ms. `python3 tools/premium/shots.py <slug>` writes contact sheets to `_qa/<slug>/`.

## Footage rules (prompts live in `tools/premium/prompts.py`)

One continuous take, no cuts, slow steady motion, locked exposure, a centred subject with clean negative space where
the text sits, no text or logos in the picture, audio off. Phones get their own 9:16 generation. About 96 frames per cut.
