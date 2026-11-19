# Mirror: oraya-classic

- Source: https://legacy.orayalabs.ai/ (OrayaAI repo main at commit acaef74, built from a working copy)
- Mirrored: 2026-11-19
- Total size: 19M (film folder 18M, shared with oraya-dealership)

## Copied
Vite production build with base /w/oraya-classic/ (index.html, hashed JS/CSS chunks incl. three.js). One film copy for both mirrors in film/: oraya-film-720.mp4, poster, thumb, teaser mp4 and teaser jpg. The 38 MB 1080p file is not shipped; the HD and SD film paths both point at the 720p file.

## Kept remote
Google Fonts (Inter, Poppins), plain links to cal.com/oraya/30min (new tab), mailto links.

## Rewritten / neutralised
- Inserted `<script src="/shared/hx-embed.js"></script>` as first script in head. HX.ready() is called after the scene's first frame.
- BrowserRouter basename from import.meta.env.BASE_URL; unknown paths render the landing page. Film manifest paths are prefixed with BASE_URL at runtime.
- Lenis is not started when HX.embed is true; otherwise the instance is exposed as window.__lenis. HX.lite halves particle and star counts.
- Cal.com inline embed and floating button removed (replaced by a note and a plain link). PopupBanner is not rendered when HX.embed is true.
- Stripe buy links removed: pricing buttons show an inline "checkout runs on the real site" note.
- AdminLoginModal: hardcoded credential check and redirect to the dashboard removed; the form shows an inline note. /portal replaced by a stub page (real client names and dashboard links dropped). Google OAuth / calendar integrations page deleted (was unrouted). No Gemini, analytics, pixels or service workers are present in the bundle.

## Known differences
- Classic has no browser voice agent (the voice agents live only on /dealership).
- The 60 s popup banner can appear when the page is opened outside a frame (its button is a mailto).
- QA lists one aborted request (the film mp4 idle preload cancelled when the frame closed); it is not an error.
- Note for Oraya: the upstream repo's AdminLoginModal.tsx holds two admin emails and a shared password in plain source; none of it is shipped here.
