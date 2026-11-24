/* Hanflux Design Menu: business settings. Edit prices, contacts and add-ons here. */
window.HX_CONFIG = {
  brand: 'Hanflux AI',
  site: 'https://hanflux.ai/factory',
  base: '/factory',
  // Where requests go. WhatsApp number in international format, digits only.
  whatsapp: '919234660000',
  whatsappLabel: '+91 92346 60000',
  email: 'hanfluxai@gmail.com',
  cal: 'https://cal.com/chitraksh-mayank-lhab1f/15min',
  // Optional lead inbox. Fill in to save every request to Supabase as well (insert-only anon key).
  supabase: null, // { url: 'https://xxxx.supabase.co', anonKey: '...', table: 'design_menu_leads' }
  // Our own sites (Hanflux and Oraya). Shown as examples of our work, never for sale.
  examples: ['hanflux'],
  // Live sites that sit behind a login wall: no outside link to them, and not used as proof.
  walled: [],
  // Every form (free plan, quote request, pop-up) also posts here through FormSubmit, so a lead is
  // saved even when the visitor never presses send in WhatsApp. The first post sends a one-time
  // "Activate Form" email to this inbox; until that is clicked, FormSubmit does not deliver.
  // Every form posts to /factory/api/lead/ (saved in the private Vercel Blob lead store) and is emailed to
  // chitrakshmayank3@gmail.com through Web3Forms (web3: its public access key; the server also has it as
  // WEB3FORMS_KEY and emails from there if the browser could not).
  lead: { on: true, afterSec: 60, api: '/factory/api/lead/', web3: 'da0c043a-a759-4088-b057-1267a5532613', notify: 'chitrakshmayank3@gmail.com' },

  // Prices are shown in rupees to visitors in India and in US dollars to everyone else
  // (they can switch). Clients outside India always pay more than clients in India.
  currencies: {
    inr: { code: 'INR', symbol: '₹', locale: 'en-IN', label: 'India (₹)' },
    usd: { code: 'USD', symbol: '$', locale: 'en-US', label: 'Outside India ($)' }
  },
  // kept for older scripts
  currency: { code: 'USD', symbol: '$' },
  showPrices: true,

  // One flat price for every design (and for a custom design at the same level), hosting included.
  // Real, dated price steps: the site moves to the next price on its own when a step ends.
  //   launch week  ₹40,000 / $555   until 3 Dec 2026
  //   launch offer ₹60,000 / $830   until 31 Dec 2026
  //   regular      ₹80,000 / $1,110 from 1 Jan 2027
  pricing: {
    regular: { inr: 80000, usd: 1110 },
    stages: [
      { id: 'week', label: 'Launch week', ends: '2026-12-03T23:59:59+05:30', endsLabel: '3 Dec', inr: 40000, usd: 555 },
      { id: 'month', label: 'Launch offer', ends: '2026-12-31T23:59:59+05:30', endsLabel: '31 Dec', inr: 60000, usd: 830 }
    ]
  },
  // filled in below from pricing: the step that applies right now
  offer: null,

  // Hosting is included up to the free hosting tier's traffic (about 25,000+ visits a month).
  hosting: { gb: 100, requests: '1 million', visits: '25,000+' },

  // A typical agency quote for a custom-designed site, used only as a comparison.
  agency: { inr: '₹1 to 5 lakh', usd: '$3,000 to $10,000+' },

  // Every site goes live within 48 hours of payment: we call within 24 hours to collect the details
  // (domain, logo, photos, text, any technical setup), and the site is live on the client's own domain
  // within 24 hours of that call.
  liveHours: 48, callWithinHours: 24,

  // Ordering (/order/): the client picks a design and add-ons, answers a few questions about the business,
  // then pays. online: the order page asks /api/pay/ for a Razorpay payment link for the exact amount
  // (switched on once RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in the Vercel project). Optional
  // fallback: a fixed Razorpay payment page per currency. With neither, the order is placed without paying
  // online: we call within 24 hours and send the link. Building starts once payment is in.
  // upfrontPct: share of the total paid to start (100 = full price).
  payment: {
    online: true,
    razorpay: { inr: '', usd: '' },
    upfrontPct: 100
  },

  // Design styles. Every style is the same flat price (prices are filled in below from pricing).
  tiers: {
    essential: { name: 'Minimal', kind: 'Minimal site', tag: 'Clean and fast', weeks: 'Live within 48 hours',
      blurb: 'Clean, fast and made for phones, with a contact form, WhatsApp button and Google Maps built in.' },
    growth: { name: 'Business', kind: 'Business site', tag: 'Editable pages', weeks: 'Live within 48 hours',
      blurb: 'Pages you can edit yourself, Google setup, and room to add booking, a blog or a shop.' },
    signature: { name: 'Animated', kind: 'Animated site', tag: 'Motion design', weeks: 'Live within 48 hours',
      blurb: 'Custom motion: scroll stories, animated text and illustrations that make people stop and look.' },
    flagship: { name: '3D', kind: '3D site', tag: 'Immersive 3D', weeks: 'Live within 48 hours',
      blurb: 'Immersive 3D scenes and effects, tuned to run smoothly on phones. For launches and luxury brands.' }
  },

  // In every plan, whichever design is picked.
  included: [
    'Your chosen design, rebuilt with your name, logo, colours, photos and words',
    'Made for phones first, tested on iPhone and Android',
    'WhatsApp button, contact form and Google Maps',
    'Google basics: page titles, descriptions and a sitemap',
    'Secure HTTPS, set up on your own web address',
    'Hosting included, up to 100 GB of traffic a month (about 25,000+ visits)',
    'The 12-point launch check, with the report',
    'As many changes as you want before launch',
    '30 days of small fixes after launch, like a new button or a changed link'
  ],

  // The 12-point launch check every site passes before it goes live.
  checks: [
    'Tested on iPhone and Android screens',
    'Tested on laptop and desktop browsers',
    'Page speed checked with Google Lighthouse',
    'Secure HTTPS on your web address',
    'Security headers switched on',
    'Every form sent, received and spam-protected',
    'Every link and button clicked',
    'Images compressed so pages load fast',
    'Google basics: titles, descriptions, sitemap',
    'Link previews checked for WhatsApp and social',
    'Readable text and easy-to-tap buttons',
    'Backups and version history'
  ],

  // Business types for the "find a design for your business" filters.
  biz: [
    { id: 'shops', label: 'Shops and brands', slugs: ['gold', 'liquid', 'brutal', 'editorial', 'halftone', 'comic', 'holo'] },
    { id: 'food', label: 'Food and cafés', slugs: ['comic', 'halftone', 'neon', 'pixel', 'brutal'] },
    { id: 'health', label: 'Salons, clinics, wellness', slugs: ['silk', 'glass', 'mesh', 'swiss'] },
    { id: 'property', label: 'Real estate and builders', slugs: ['estate', 'blueprint', 'wireframe'] },
    { id: 'travel', label: 'Hotels, travel, events', slugs: ['deco', 'flap', 'neon', 'vhs'] },
    { id: 'tech', label: 'Tech and startups', slugs: ['particles', 'holo', 'iso', 'bento', 'ascii', 'clay', 'mesh'] },
    { id: 'services', label: 'Services and B2B', slugs: ['swiss', 'blueprint', 'wireframe', 'kinetic', 'bento', 'iso'] },
    { id: 'learn', label: 'Schools and coaching', slugs: ['bauhaus', 'clay'] }
  ],

  // Custom orders: anything beyond a website from the menu. Scoped on a call, quoted separately,
  // with its own timeline (the 48-hour promise covers websites from the menu).
  custom: [
    'iPhone and Android apps, designed and built to order',
    'Web apps, client portals and admin dashboards',
    'Branded HTML emails, newsletters and order emails',
    'AI agents, AI chat and voice, connections to your CRM or ERP'
  ],

  // What the design factory makes. Websites have a flat price; the rest is quoted after a short call.
  services: [
    { id: 'web', name: 'Websites', line: 'Pick a live design. Yours in 48 hours.', price: 'flat' },
    { id: 'apps', name: 'Mobile and web apps', line: 'iPhone, Android and web apps, designed to order.', inr: 150000, usd: 6000 },
    { id: 'emails', name: 'HTML emails', line: 'Branded newsletters, welcome and order emails.', inr: 18000, usd: 600 },
    { id: 'dash', name: 'Dashboards', line: 'See orders, bookings and leads in one place.', inr: 45000, usd: 1800 },
    { id: 'brand', name: 'Brand and logo', line: 'Logo, colours, type and a brand guide.', inr: 20000, usd: 800 },
    { id: 'ai', name: 'AI chat and voice', line: 'Answers customers 24/7 and books them in.', inr: 35000, usd: 1200 }
  ],

  // Add-ons: inr/usd is the one-time setup, mo the monthly fee (starts at launch). Running costs that
  // grow with use (AI usage beyond fair use, call minutes, WhatsApp and SMS fees) are billed at cost.
  addons: [
    { id: 'dashboard',  name: 'Orders and admin dashboard',       inr: 45000, usd: 1800, mo: { inr: 3000, usd: 99 },  desc: 'Log in to see every order, booking and lead, change status, export to Excel and add your team.' },
    { id: 'alerts',     name: 'Order and admin alerts',           inr: 18000, usd: 600,  mo: { inr: 1500, usd: 49 },  desc: 'Branded emails to customers for every order and booking, instant email and WhatsApp alerts to you. WhatsApp and SMS fees at cost.' },
    { id: 'store',      name: 'Online store',                     inr: 60000, usd: 2000, mo: { inr: 3000, usd: 99 },  desc: 'Catalogue, cart, checkout, stock and order emails for up to 100 products.' },
    { id: 'booking',    name: 'Online booking and calendar',      inr: 15000, usd: 450,  mo: { inr: 1000, usd: 29 },  desc: 'Clients pick a slot and it lands in your Google or Outlook calendar, with reminders.' },
    { id: 'payments',   name: 'Payments (UPI, cards, Stripe)',    inr: 12000, usd: 450,  desc: 'UPI, cards and wallets at checkout through Razorpay or Stripe, with receipts sent automatically.' },
    { id: 'aichat',     name: 'AI chat assistant',                inr: 35000, usd: 1200, mo: { inr: 4000, usd: 150 }, desc: 'Answers visitors around the clock from your own content, captures leads and books calls. Fair use included.' },
    { id: 'voice',      name: 'AI voice receptionist',            inr: 75000, usd: 2500, mo: { inr: 12000, usd: 300 }, desc: 'Answers your phone 24/7, books appointments and passes hot calls to you. Call minutes billed at cost.' },
    { id: 'leads',      name: 'Lead automation and CRM',          inr: 25000, usd: 900,  mo: { inr: 2500, usd: 99 },  desc: 'Every enquiry lands in your CRM or Google Sheet, alerts you instantly and gets a reply within a minute.' },
    { id: 'whatsapp',   name: 'WhatsApp auto-reply',              inr: 15000, usd: 500,  mo: { inr: 1500, usd: 49 },  desc: 'Instant greeting and quick replies on the WhatsApp Business API. Meta message fees at cost.' },
    { id: 'emails',     name: 'Branded HTML emails',              inr: 18000, usd: 600,  desc: 'Three designed email templates (welcome, order, newsletter) that look right in Gmail, Outlook and Apple Mail.' },
    { id: 'seo',        name: 'SEO and Google Business setup',    inr: 15000, usd: 500,  desc: 'Keyword research, Search Console, your Google Business Profile and analytics, set up and checked.' },
    { id: 'copy',       name: 'Copywriting',                      inr: 15000, usd: 500,  desc: 'Up to 8 pages written for you, in your voice, built to turn visitors into enquiries.' },
    { id: 'brand',      name: 'Logo and brand kit',               inr: 20000, usd: 800,  desc: 'Logo, colours, fonts and a one-page brand guide.' },
    { id: 'cms',        name: 'Blog and editable pages',          inr: 12000, usd: 400,  desc: 'Change text, photos and posts yourself, no developer needed.' },
    { id: 'language',   name: 'Second language',                  inr: 12000, usd: 400,  desc: 'Your site in another language, such as Hindi or Spanish, with a switcher.' },
    { id: 'care',       name: 'Care plan',                        inr: 0,     usd: 0,    mo: { inr: 4000, usd: 149 }, desc: 'Monthly edits, updates, uptime checks and priority support after the 30 free days.' }
  ]
};

/* The price step that applies right now (works the same in the browser and in the build). */
(function (C) {
  var P = C.pricing, now = Date.now(), st = null;
  for (var i = 0; i < P.stages.length; i++) if (now < Date.parse(P.stages[i].ends)) { st = P.stages[i]; C.stageIndex = i; break; }
  if (!st) C.stageIndex = P.stages.length;
  C.stage = st;
  C.offer = st ? { on: true, label: st.label, ends: st.ends, endsLabel: st.endsLabel,
    note: st.label + ' price for orders paid by ' + st.endsLabel + '. Then the price moves to the next step on its own, up to ' + C.currencies.inr.symbol + P.regular.inr.toLocaleString('en-IN') + ' / $' + P.regular.usd.toLocaleString('en-US') + ' from 1 January 2027.' } : { on: false };
  ['inr', 'usd'].forEach(function (c) {
    Object.keys(C.tiers).forEach(function (t) { C.tiers[t][c] = { from: st ? st[c] : P.regular[c], was: P.regular[c] }; });
  });
})(window.HX_CONFIG);

/* Fonts used by the AI agent interface looks (loaded only where a live agent stage runs). */
window.HX_AGENT_FONTS = 'https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600&family=JetBrains+Mono:wght@400;600&family=Instrument+Serif:ital@0;1&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Big+Shoulders+Display:wght@500;800&family=DM+Mono:wght@400;500&family=Space+Mono:wght@400;700&family=Hanken+Grotesk:wght@300;500&family=Sora:wght@300;600&family=Syne:wght@500;800&family=Chakra+Petch:wght@400;600&family=Tilt+Neon&family=Rajdhani:wght@500;700&family=Major+Mono+Display&family=IBM+Plex+Mono:wght@400;600&family=Outfit:wght@300;500;700&family=Anton&family=Archivo:wght@500;800&family=Lexend:wght@300;600&family=Fredoka:wght@400;600&family=Plus+Jakarta+Sans:wght@400;700&family=Bangers&family=Comic+Neue:wght@700&family=Oswald:wght@500;700&family=VT323&family=Bricolage+Grotesque:wght@400;800&family=Jost:wght@400;700&family=Press+Start+2P&family=Architects+Daughter&family=Limelight&family=Poiret+One&family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&display=swap';
