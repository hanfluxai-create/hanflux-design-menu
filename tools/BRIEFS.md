# Style briefs

Each brief: the style family it represents, the tier it sells at, the fictional brand, art direction, the signature moment,
and the sections. You own the details: push past the brief wherever it makes the site better. Tiers: Essential (fast, clean),
Growth (multi-section business site), Signature (custom motion design), Flagship (immersive WebGL/3D, the $10k tier).

---

## particles · Particles · Flagship
**Brand:** Novaform (novaform.ai), AI demand forecasting for retailers and supply chains. USD.
**Look:** deep space `#04050b`, electric cyan `#5ef2ff`, violet `#a78bfa`, hot pink `#ff6ad5` sparingly, text `#e8ecff`. Display "Unbounded" (600), body "Inter".
**Signature:** a GPU particle field (about 60k points desktop, 18k lite) in a custom ShaderMaterial. Precompute several target shapes as position attributes and morph between them with scroll: a breathing sphere (hero) → a flowing wave field (data stream) → rising bar-city (forecast) → a ring torus → the word NOVA sampled from a canvas → a dotted globe (land/sea from procedural noise). Curl-noise drift, pointer repulsion, additive soft round sprites, color by position. It reads as one living organism.
**Copy hero:** "See next quarter before it happens." Sub: Novaform turns sales, stock and weather signals into forecasts your team can act on. "94.2% forecast accuracy across 1,800 stores." CTAs: Book a demo, Watch it predict.
**Sections:** nav · hero · fictional client wordmarks marquee (Kestrel Foods, Halden & Co, Mirapath, Orbit Grocers, Sunline Pharmacy, Vantage Home) · "How it works" pinned 3 steps Ingest / Learn / Act, each with its own particle shape · live dashboard mock in HTML/SVG (forecast line drawing itself with a confidence band, KPI tiles counting up: stockouts −31%, waste −18%, margin +4.6 pts) · feature bento (6 cards) · testimonial from a fictional VP Supply Chain · pricing (Starter $499/mo, Growth $1,490/mo, Enterprise custom) · final CTA where particles form NOVA · footer.

## liquid · Liquid morph · Flagship
**Brand:** Maison Orré (maisonorre.com), niche perfume house, Paris and Jaipur. USD.
**Look:** black `#0b0b0c`, champagne `#efe3d3`, amber `#c98a3a`, rose gold `#d9a68a`. Display "Cormorant Garamond" (italic for the big words), body "Jost".
**Signature:** a full-screen raymarched liquid-metal sculpture: 4 to 6 SDF spheres with smooth-union, slowly merging and splitting, shaded with a procedural studio environment (soft boxes, gradient horizon), Fresnel, a faint thin-film sheen. Render at half resolution (always) and upscale; fewer steps in lite. Scroll changes its tint per scent and finally gathers it into a single falling drop.
**Copy hero:** "Scent, poured like liquid gold." Sub: Three extraits, distilled in small batches between Paris and Jaipur. CTAs: Discover the scents, Order a discovery set.
**Sections:** nav · hero · the three scents as a pinned horizontal sequence (Saffron Noir: saffron, black tea, smoked vetiver; Oud Lumière: oud, rose absolute, amber; Néroli Bleu: neroli, sea salt, white musk), each with a notes pyramid (top, heart, base), 50 ml extrait $185, and the sculpture shifting to that scent's color · "The atelier" story with numbers (72-hour maceration, 11 artisans, 400 bottles per batch) · ingredients drifting in a slow 3D carousel (SVG botanical line drawings) · discovery set product card ($38, 3 x 2 ml) with Add to bag (demo state) · 3 client words · newsletter "The Maison letter" · footer.

## holo · Holographic · Flagship
**Brand:** Prism (prismcard.co), a stainless-steel cashback card. USD. Mark the footer fine print: "Sample product, not a real financial offer."
**Look:** graphite `#0b0d12`, holo spectrum `#7af0ff` `#b18cff` `#ff8ad8` `#ffe28a`, white `#f5f7ff`. Display "Space Grotesk", body "Inter".
**Signature:** a 3D card (rounded box, real card proportions 85.6 x 54) with a thin-film iridescence shader driven by view angle plus noise, glitter sparkle, embossed details from a canvas texture (PRISM wordmark, chip, "•••• 0742", cardholder AANYA KAPOOR). It tilts with the pointer and scroll, a light sweep crosses it, then on scroll it flips to the back ("3% back on everything") and separates into exploded layers with labels (holo film, 18 g steel core, chip).
**Copy hero:** "The card that pays you back in light." Sub: Up to 3% back on everything. 18 g stainless steel. No annual fee. CTA: Join the waitlist.
**Sections:** nav · hero · three big benefits with counters · app section with two phone mockups built in HTML/CSS (spend ring chart, rewards feed) · security (biometric lock, virtual cards, instant freeze) · compare table Prism vs typical card · 3 member quotes · FAQ accordion · waitlist CTA with a live-feeling counter ("48,210 people ahead of you") · footer with fine print.

## neon · Neon glow · Signature
**Brand:** Velvet Ward (velvetward.in), cocktail bar and club in Bandra, Mumbai. INR.
**Look:** black `#07030b`, hot pink `#ff2bd6`, electric blue `#29e2ff`, amber `#ffb22e`, dark brick `#2a1416`. Neon script for the sign (e.g. "Yellowtail" or "Pacifico" drawn as SVG strokes), body "Outfit".
**Signature:** a photoreal neon sign built in SVG/CSS: tube stroke with a white-hot core, layered colored glow, mounting clips, a flicker on start-up (random tubes catch late), glow spilling on a brick wall (procedural canvas texture) and reflecting on a wet floor below. A second sign "OPEN TILL 3 AM" and neon arrows light up as you scroll. Subtle haze drifting.
**Copy hero:** the sign says Velvet Ward. Line: "Cocktails after dark. Bandra, Mumbai." CTAs: Reserve a table, See tonight's lineup.
**Sections:** nav · hero sign · "Tonight and this week" lineup (6 nights with DJ or act names you invent, genre, entry ₹1,500 couples, guest list button) · signature cocktails (6 cards with neon line icons, e.g. Bandra Sour ₹750, Velvet Old Fashioned ₹950, Monsoon Spritz ₹690, Kokum Collins ₹720, Midnight Espresso ₹780, zero-proof Rose Static ₹450) · the room (neon poster gallery made in CSS/SVG) · private events · reserve a table form (date chips, party size, time) · location and hours (stylized SVG street map) · footer.

## wireframe · Wireframe 3D · Flagship
**Brand:** Arcline Studio (arcline.studio), architecture practice in Bengaluru and Lisbon. No prices.
**Look:** paper `#f1f0ec`, ink `#121212`, signal orange `#ff4d00`, grey `#9a9a94`. "Inter Tight" for display and body, "IBM Plex Mono" for labels and dimensions.
**Signature:** a three.js modernist house generated in code (cantilevered volumes, pilotis, a stair, a glass curtain-wall grid, roof plates) drawn with crisp lines (EdgesGeometry / LineSegments) that draw themselves in on load, with a slow orbit and dimension ticks on a grid floor. Scroll explodes it into floor plates (an exploded axonometric), then fills the volumes with light shaded faces: "From line to light".
**Copy hero:** "Buildings drawn with light." Sub: Arcline designs homes, libraries and pavilions that sit lightly on their land. CTA: See the work, Start a project.
**Sections:** nav · hero · selected work, 4 projects (Casa Lumen, Goa; The Long House, Coorg; Kiln Pavilion, Lisbon; Arc Library, Pune) each with a generated SVG line drawing in axonometric (no extra WebGL contexts), location, year, area · process pinned (Sketch, Model, Detail, Build) driving the hero model · approach / principles · studio (3 fictional partners with monogram marks) · recognition written generically ("Shortlisted, regional design biennale 2025") · contact with a project inquiry form · footer.

## glass · Glassmorphism · Growth
**Brand:** Lumen Dental (lumendental.in), premium dental clinic in Indiranagar, Bengaluru. INR.
**Look:** light. Background `#f4fbfb`, aqua `#7fe3da`, lilac `#c9b8ff`, teal `#0aa79a`, navy text `#0f1d2e`, glass white `rgba(255,255,255,.55)` with backdrop blur. Display "Outfit", body "Inter".
**Signature:** soft aurora blobs drifting behind layered frosted-glass panels, and a few floating 3D glass forms (three.js MeshPhysicalMaterial with transmission: smooth pebbles and one stylized tooth form built from a rounded lathe or blended spheres) refracting the colors. A glass booking card in the hero: "Next free slots today: 4:30 PM, 5:15 PM, 6:00 PM" as selectable chips.
**Copy hero:** "Calm, modern dentistry." Sub: Painless care, transparent prices and evening slots, five minutes from Indiranagar metro. CTAs: Book a visit, WhatsApp us.
**Sections:** nav · hero · treatments (glass cards: Clear aligners from ₹65,000; Teeth whitening ₹8,500; Implants from ₹38,000; Root canal from ₹6,500; Kids dentistry; Smile makeover) · "Your first visit, step by step" timeline · doctors (3 fictional dentists with gradient monogram avatars, no photos) · reviews carousel (4.9 rating, fictional patients) · transparent pricing table and EMI note · booking widget (week calendar with slots) · FAQ · footer with hours, address, stylized SVG map.

## kinetic · Kinetic type · Signature
**Brand:** Loudmouth (loudmouth.studio), branding and motion agency. USD.
**Look:** black `#0b0b0b`, acid `#e4ff1a`, off-white `#f5f5f0`, red `#ff3b1f` for small hits. "Roboto Flex" variable (animate `wdth` and `wght` axes) for display, "Inter" body.
**Signature:** a giant headline "WE MAKE BRANDS LOUD." whose letters breathe, stretch and squash on their width and weight axes in waves, react to the pointer, then split into rows that slide apart on scroll. Behind it, outline-text marquees run in opposite directions. A rotating CSS 3D text ring: STRATEGY · IDENTITY · MOTION · WEB ·.
**Sections:** nav · hero · manifesto paragraph highlighted word by word on scroll · services as 4 huge words that expand and reveal a line of detail · selected work list (6 fictional projects with color-block covers made from typography; scroll reveals each) · numbers (counting) · client marquee (fictional names) · "SAY HELLO" contact with a giant email address · footer.

## iso · Isometric · Flagship
**Brand:** Cargoflow (cargoflow.io), logistics and shipment-tracking SaaS. USD.
**Look:** pale sky `#f3f6ff`, navy `#0b1b3f`, coral `#ff6a4d`, mint `#2ed3a5`, sky `#7cc4ff`, sand `#ffd79a`. Display "Sora", body "Inter".
**Signature:** a three.js orthographic isometric diorama on a floating base: a warehouse with roll-up doors, stacked containers, a gantry crane lifting a container, trucks driving road loops, a delivery van, conveyor boxes, a drone; soft shadows; pastel low-poly. Label pins pop up ("Shipment CF-20931 · on time"). Scroll pans the camera across three zones (warehouse, port with a ship, city delivery) in sync with the feature sections.
**Copy hero:** "Every box, every mile, one live map." Sub: Cargoflow tracks shipments across 120+ carriers and tells you about delays before your customers do. CTAs: Start free, Book a demo.
**Sections:** nav · hero · trusted-by wordmarks (fictional) · three features synced to the diorama zones · live tracking dashboard in HTML/SVG (map with animated routes, ETA cards) · integrations grid (generic chips: ERP, WMS, Storefronts, 120+ carriers, Webhooks, API) · metrics · testimonial · pricing (Starter $299/mo, Scale $899/mo, Enterprise) · CTA · footer.

## clay · Clay 3D · Signature
**Brand:** Doodle Labs (doodlelabs.app), coding and STEM app for kids 6 to 12. INR.
**Look:** cream `#fff4e6`, tomato `#ff6b4a`, sun `#ffc94a`, sky `#6ec6ff`, grass `#6fd38a`, ink `#2b2340`. Display "Fredoka", body "Nunito".
**Signature:** a three.js clay world: soft rounded primitives (rounded boxes, blobs, a torus, stars, capsules) and a friendly robot built from rounded parts with blinking eyes, high-roughness materials with a subtle fingerprint/noise normal map, soft shadows, warm pastel light. Shapes bob with springy motion and get nudged by the pointer; the robot waves. On scroll the shapes tumble into a staircase "learning path".
**Copy hero:** "Where kids build the future, one block at a time." Sub: Bite-size coding, robotics and maths adventures. 15 minutes a day. CTAs: Start a free week, See the courses.
**Sections:** nav · hero · how it works (3 clay cards) · courses (Code Quest 6 to 8, Robot Builders 8 to 10, Math Magic 6 to 12, Space Lab 9 to 12; lessons count, skills) · parent dashboard preview built in HTML · parents' words · pricing (Monthly ₹499, Yearly ₹3,999 with "2 kids free") · "Get the app" with generic iPhone / Android buttons (no store logos) · FAQ · footer.

## ascii · ASCII art · Signature
**Brand:** Blackline (blackline.sec), cybersecurity firm: penetration testing and a 24/7 SOC. USD.
**Look:** near-black `#050706`, phosphor `#39ff9f`, dim `#1f6b4a`, alert red `#ff3b3b`, white `#e6fff3`. "JetBrains Mono" throughout, "Space Grotesk" for the largest headings if needed.
**Signature:** a three.js object (a shield or padlock built from primitives, slowly rotating, pointer-reactive) rendered to a target and converted live into ASCII by a shader with a glyph atlas (" .:-=+*#%@"), in phosphor with scanlines and bloom-like glow. A terminal intro types `blackline scan --target acme-retail.com` and streams findings.
**Copy hero:** "We break in before they do." Sub: Offensive security and round-the-clock monitoring for teams that can't afford a bad Monday. CTAs: Book a pentest, Talk to the SOC.
**Sections:** nav · hero · services as terminal panes (Penetration testing, 24/7 SOC, Incident response, Cloud hardening) · live threat feed (auto-scrolling log with timestamps and severity colors) next to an ASCII world map with blinking attack points · stats (median response 11 min, 4.2 B events triaged a day) · case study · standards row (ISO 27001, SOC 2 Type II, OWASP as plain text) · "Under attack? 24/7 hotline +1 (415) 555-0199" · footer.

## mesh · Gradient mesh · Growth
**Brand:** Stillwater (stillwater.app), meditation and sleep app. USD.
**Look:** palettes that drift from dawn (`#ffb199` `#ffd6a5`) to day (`#69c6d9` `#b8e0d2`) to dusk (`#b8a1ff` `#ff9fb2`) to night (`#1b1a3a` `#3b3a75`). Display "Instrument Serif" (italic accents), body "Inter".
**Signature:** a full-screen WebGL mesh gradient (domain-warped noise, 4 to 5 animated color points, fine film grain) whose palette moves from dawn to night as you scroll. A breathing orb (soft glass circle) guides a 4-7-8 breath with "Breathe in, hold, breathe out" captions.
**Copy hero:** "Find your still point." Sub: Guided breathing, sleep stories and focus sessions that fit a busy day. CTAs: Try 7 days free, Listen to a sample.
**Sections:** nav · hero · interactive breathing exercise · programs (Sleep stories, Deep focus, Calm the noise, Kids wind-down) · app screens as 2 HTML phone mockups · "12 minutes a day" stats · listeners' words · pricing (Free, Premium $59.99/yr) · download CTA (generic buttons) · footer.

## comic · Comic book · Signature
**Brand:** Boom Burger (boomburger.in), smash-burger joint and food truck in Pune. INR.
**Look:** yellow `#ffd400`, red `#e63223`, cyan `#00a8e8`, ink `#111`, paper `#fff7e3`. Display "Bangers", body "Archivo" (bubbles can use "Comic Neue").
**Signature:** a comic page: thick ink panels, halftone dot fields, speed lines, and a big illustrated burger in SVG (bun with sesame, smashed patty with crispy edges, melting cheese drip, lettuce, tomato, bold outlines, cel shading) that assembles layer by layer with "SMASH!" and "KA-BOOM!" bursts popping in. Panels slide in like turning pages.
**Copy hero:** "Smashed. Stacked. Legendary." Sub: Hand-smashed patties, toasted brioche, sauce we won't tell you about. CTAs: Order now, Find the truck.
**Sections:** nav · hero page · menu as comic cards (The Boom ₹249, Double Trouble ₹349, Spicy Shinobi ₹299, Veg Smash ₹219, Loaded fries ₹179, Thick shakes ₹199) with Add buttons and a cart count · "Our origin story" 4-panel strip with captions · truck schedule (Koregaon Park, Baner, Viman Nagar, FC Road by day) · reviews as speech bubbles · order CTA (generic "Order for delivery", "Pick up") · footer.

## flap · Split-flap · Signature
**Brand:** Northbound (northbound.travel), curated small-group trips. USD.
**Look:** charcoal `#121212`, flap black `#1c1c1c`, warm white `#f3efe6`, signal yellow `#ffc400`, grey `#8a8a8a`. "Space Mono" for the board, "DM Serif Display" for headlines, "Inter" body.
**Signature:** a real-feeling split-flap departures board: every character a cell with top and bottom halves flipping in CSS 3D (with the slight shadow and the half-step), cycling random characters before landing. Rows like `09:40 KYOTO JP 9 NIGHTS BOARDING`, `11:15 LISBON PT 7 NIGHTS ON TIME`, `13:05 REYKJAVIK IS 6 NIGHTS GATE 4`. Every few seconds a row re-flaps to a new trip. On load the board first spells WHERE TO NEXT?
**Sections:** nav · hero board · curated trips (6 cards with poster art you generate in SVG: sun discs, mountains, sea lines, strong type; price on a mini flap "$2,480 / 9 nights") · how it works · trip builder (choose a vibe and month, a result row flaps in) · travellers' words · "The Departures Letter" newsletter · footer.

## vhs · Retro VHS · Signature
**Brand:** Static Bloom Records (staticbloom.fm), indie label and summer festival. USD.
**Look:** black `#070710`, VHS blue `#2b2bff`, magenta `#ff3df0`, yellow `#fff200`, cyan `#00f0ff`. "VT323" for on-screen display text, "Archivo Black" display.
**Signature:** a WebGL CRT/VHS pass over a procedural synthwave scene (striped sun, moving grid floor, mountain silhouettes): chromatic aberration, scanlines, rolling tracking bands, tape wobble, noise, vignette, with an OSD (`PLAY ▶ SP 00:03:17`, `CH 03`). Section changes glitch through a burst of static like changing channels.
**Copy hero:** "Static Bloom Summer 2026." Sub: Three days, two stages, forty artists. August 14 to 16. CTAs: Get tickets, New releases.
**Sections:** nav · hero · lineup in huge stacked type (invented artist names) · new releases (6 album cards with cover art you generate procedurally) · tour dates table with ticket buttons · artist roster · shop (vinyl $32, cassette $14, tee $28) · newsletter · footer.

## halftone · Halftone · Growth
**Brand:** Grain & Ink (grainandink.coffee), specialty coffee roaster and café in Bengaluru. INR.
**Look:** newsprint `#f2ede1`, ink `#151515`, coffee `#6b3f22`, riso red `#e8432e`, riso blue `#2c5bd6`. Display "Fraunces", body and labels "Space Grotesk".
**Signature:** a three.js coffee cup with saucer, beans and curling steam, rendered through a halftone post-process in two misregistered riso inks (red and blue on newsprint), dot size breathing with scroll and the pointer. An editorial headline overlaps it like a zine cover.
**Copy hero:** "Roasted on Tuesday. In your cup by Thursday." Sub: Single-origin beans from Indian estates and beyond, roasted weekly in Bengaluru. CTAs: Shop beans, Visit the café.
**Sections:** nav · hero · origins (Chikmagalur Estate, Ethiopia Guji, Colombia Huila with tasting notes and roast bars) · subscription (every 2 weeks, ₹950 per 250 g, pause anytime) · cafés (Indiranagar, Jayanagar with hours) · pour-over brew guide in steps with timings · zine-style reviews · footer.

## bauhaus · Bauhaus · Growth
**Brand:** Formhaus (formhaus.school), online design school. USD.
**Look:** paper `#f0e9dc`, red `#d7261e`, blue `#1f4e9e`, yellow `#f2c230`, black `#111`. "Archivo Black" display, "Archivo" body.
**Signature:** a geometric composition (circles, half circles, triangles, bars) on a visible grid that rearranges itself into the letters F O R M and back into a poster, with GSAP choreography; shapes ease with weight and lean toward the pointer.
**Copy hero:** "Form follows you." Sub: Live cohorts in typography, colour and product design, taught by working designers. CTAs: Browse courses, Apply now.
**Sections:** nav · hero · courses as primary-color blocks (Typography, Colour Theory, Product Design, Motion Basics) · "Learn by making": a wall of generative Bauhaus posters drawn on canvas (new compositions every few seconds) · faculty (3 fictional, monogram shapes) · cohort calendar · pricing ($390 per course, $1,290 all access) · admissions CTA · footer.

## pixel · Pixel art · Signature
**Brand:** Pixelforge Arcade (pixelforge.gg), gaming café and esports lounge in Hyderabad. INR.
**Look:** night `#140b2e`, purple `#3a1d6e`, green `#3dff8a`, pink `#ff5fa2`, gold `#ffd34d`, white. "Press Start 2P" for headings, "Rubik" for body text.
**Signature:** a canvas pixel-art world drawn in code with crisp nearest-neighbour scaling: a night skyline with lit windows, twinkling stars, a moon, and a character sprite (drawn from small pixel arrays) running across parallax layers and collecting coins. HUD on top (`1UP 004200  HI 099999`, coins), PRESS START blinking. Scroll moves the character through levels; each section opens with a level banner (LEVEL 2: THE RIGS).
**Copy hero:** "Level up your weekend." Sub: 40 high-refresh battle stations, a console lounge and tournaments every Friday. CTAs: Book a station, This week's tournaments.
**Sections:** nav · hero · the rigs (generic specs: 240 Hz screens, top-tier GPUs, mechanical keyboards) · prices (₹120 per hour, night pass ₹599, squad of 5 ₹499 per hour) · tournaments bracket in pixel style · snacks and drinks menu · book a station form · footer.

## blueprint · Blueprint · Growth
**Brand:** Keystone Build (keystonebuild.co), construction and engineering contractor in Pune. No prices (quote form).
**Look:** blueprint blue `#0b3d91` with deep `#0a2f6f`, line white `#e6f0ff`, cyan `#7fd4ff`, safety yellow `#ffcc00`. "Barlow Condensed" display, "Barlow" body, "IBM Plex Mono" for dimensions and labels.
**Signature:** a technical drawing in SVG of a mid-rise building elevation with dimension lines, grid bubbles, section markers and a title block (drawing KB-2026-014, scale 1:100) that draws itself line by line, then gains hatching; a crosshair follows the pointer with live coordinates. On scroll the elevation becomes a plan, then a three.js line model of the structure.
**Copy hero:** "Built to the line." Sub: Commercial, residential and industrial projects delivered on time across Maharashtra since 2004. CTAs: Get a quote, See projects.
**Sections:** nav · hero drawing · services (Commercial, Residential, Industrial, Infrastructure) with line icons · projects (4 cards, each toggling blueprint to a flat illustrated render you draw in SVG) · numbers (2.4 M sq ft delivered, 900 days without a lost-time incident) · process timeline (Survey, Design, Approvals, Build, Handover) · safety · quote request form · footer.

## deco · Art deco · Signature
**Brand:** The Gilded Palms (gildedpalms.in), heritage luxury hotel on Lake Pichola, Udaipur. INR.
**Look:** emerald `#0f3d33`, deep `#0a2a23`, gold `#d4af37`, champagne `#f6efe0`, black. Deco display "Poiret One" or "Limelight", body "Cormorant Garamond", small caps labels "Josefin Sans".
**Signature:** an art deco frame of gold: sunburst rays drawing outward, stepped arches, symmetrical ornaments, palm motifs, with a shimmer sweeping the gold. In the centre, a gold line illustration of the palace hotel (arches, domes, a lake reflection) drawn in SVG. On scroll, the frame opens like a pair of doors into the next section.
**Copy hero:** "An era of grace on Lake Pichola." Sub: Forty-two suites, a lakeside terrace and a century of stories. CTAs: Reserve your stay, Plan a wedding.
**Sections:** nav · hero · suites (cards in deco arches with line-art rooms, from ₹38,000 per night) · dining (the Terrace, the Gold Bar) · spa · weddings and celebrations · gallery of deco posters you design in SVG · reservation widget (date range, guests) · footer.

## brutal · Neo-brutalism · Growth
**Brand:** CRUNCH CO. (crunchco.in), roasted makhana and protein chips, a D2C snack brand. INR.
**Look:** cream `#fffbf0`, black `#000`, pink `#ff90e8`, yellow `#ffc900`, green `#23a094`, orange `#ff7a1a`. Thick black borders, hard offset shadows. "Archivo Black" display, "Space Grotesk" body.
**Signature:** a giant snack pouch (three.js pouch shape or CSS 3D with a label you draw on canvas) spinning in the hero, draggable stickers ("NEW!", "12 g PROTEIN", "BAKED NOT FRIED") that wobble, a marquee band, chunky buttons that press down.
**Copy hero:** "Snacks that slap. Labels that don't lie." Sub: Roasted makhana and protein chips, baked not fried, no palm oil. CTAs: Shop flavours, Build a box.
**Sections:** nav · hero · flavours (Peri Peri, Pudina Punch, Cheese and Herb, Salted Caramel; ₹149 each with Add buttons and a live cart count) · nutrition facts table · "Build a box of 6" picker with price updating · reviews as stickers · FAQ · footer.

## editorial · Editorial luxury · Growth
**Brand:** Atelier Noor (ateliernoor.com), slow-fashion label of hand block-printed clothing from Jaipur. INR.
**Look:** bone `#f3efe8`, ink `#161412`, madder `#b65c3a`, indigo `#2e3a6b`, sand `#d9c7a7`. Display "Bodoni Moda" (high contrast), body "Inter".
**Signature:** editorial typography at magazine scale, with hand block-print motifs generated in code (repeating floral and geometric blocks stamped onto fabric with a pressing animation, slight ink irregularity). Garments are shown as elegant flat-lay illustrations in SVG filled with those prints.
**Copy hero:** "Printed by hand. Worn for years." Sub: Natural dyes, hand-carved blocks and small runs from our Sanganer workshop. CTAs: Shop the collection, The craft.
**Sections:** nav · hero · new collection (6 pieces, e.g. Kesar kurta ₹6,800, Neel wrap dress ₹8,900, Dabu linen shirt ₹5,400) · "From block to cloth" craft steps · lookbook spreads · the workshop story · stores and shipping · newsletter · footer.

## bento · Bento SaaS · Growth
**Brand:** Ledgerly (ledgerly.app), invoicing and accounting for freelancers and small agencies. USD.
**Look:** white `#fbfbfd`, ink `#0d0f14`, indigo `#5b5bf7`, mint `#2ad49b`, cloud `#eef0f5`. "Geist" (Google Fonts) display and body, "Geist Mono" for numbers.
**Signature:** a crisp product UI built in HTML/CSS floating with gentle 3D tilt: an invoice gets composed, sent, opened and stamped Paid, while numbers tick and a cursor glides through the flow. Then a bento grid where every tile has its own micro-animation.
**Copy hero:** "Get paid. Skip the paperwork." Sub: Send polished invoices in seconds, chase late payments automatically, and see your cash flow at a glance. CTAs: Start free, See a demo.
**Sections:** nav · hero · bento grid (recurring invoices, payment links, multi-currency, tax-ready reports, expense capture, client portal) · workflow strip · numbers · customer words · pricing (Free, Pro $12/mo, Team $29/mo) · FAQ · final CTA · footer.

## swiss · Swiss minimal · Essential
**Brand:** Mehra & Rao Advocates (mehrarao.law), corporate law firm in Bengaluru and Mumbai.
**Look:** white `#ffffff`, black `#0b0b0b`, red `#e10600` as the only accent, grey `#6b6b6b`. "Inter Tight" for everything, strict 12-column grid, numbered sections.
**Signature:** restraint done perfectly: a strict typographic grid where hairlines draw in, numbers count, headings rise line by line, practice areas reveal as you scroll. Fast, quiet, confident, no WebGL. This is the Essential tier showcase: proof that simple can feel expensive.
**Copy hero:** "Counsel for companies that move fast." Sub: Corporate, venture and disputes practice for founders, funds and boards. CTA: Request a consultation.
**Sections:** nav · hero · practice areas (Corporate and M&A, Startups and Venture Capital, Disputes and Arbitration, IP and Technology, Employment, Real Estate) · how we work · partners (4 fictional, monogram marks) · insights (3 dated articles with titles you write) · offices · consultation form · footer that includes this disclaimer: "As per the rules of the Bar Council of India, this website is for information only and is not an advertisement or solicitation."
