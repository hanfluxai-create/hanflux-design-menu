# Hanflux Design Menu

A client facing menu of 25 live interface styles for AI agents and apps. Every style runs the same
Director Mode choreography: the assistant's face holds the stage, opens the screen you mention and
points at the exact item it is talking about.

Static site, no build step and no dependencies.

```
index.html              page
assets/site.css         page shell (dark, luxury, minimal)
assets/stage.css        the 25 looks (.hx .L-<look>)
assets/stage.js         stage engine: builds a stage and runs the 8 beat loop
assets/styles-data.js   the menu: names, descriptions, tags, filters
assets/app.js           hero, grid, full screen viewer, filters, shortlist link
```

Run it locally with any static server, for example `npx serve .`, then open the printed address.

Shortlist links look like `/?pick=07,12`. Opening one shows the client's picks at the top of the page.

Samples use a demo brand, Aurora. Change `BRAND` in `assets/stage.js` to restyle every sample.
