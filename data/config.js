/* Hanflux Design Menu: business settings. Edit prices, contacts and add-ons here. */
window.HX_CONFIG = {
  brand: 'Hanflux AI',
  site: 'https://hanflux-design-menu.vercel.app',
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
  lead: { on: true, afterSec: 60, endpoint: 'https://formsubmit.co/ajax/hanfluxai@gmail.com' },

  // Prices are shown in rupees to visitors in India and in US dollars to everyone else
  // (they can switch). Clients outside India always pay more than clients in India.
  currencies: {
    inr: { code: 'INR', symbol: '₹', locale: 'en-IN', label: 'India (₹)' },
    usd: { code: 'USD', symbol: '$', locale: 'en-US', label: 'Outside India ($)' }
  },
  // kept for older scripts
  currency: { code: 'USD', symbol: '$' },
  showPrices: true,

  // Launch offer: real end date, real prices from 1 Jan 2027 ("was"). When it ends, the site shows the "was" prices on its own.
  offer: {
    on: true,
    label: 'Launch prices',
    ends: '2026-12-31T23:59:59+05:30',
    endsLabel: '31 Dec',
    note: 'Launch prices apply to projects booked by 31 December 2026. From 1 January 2027 the higher price applies.'
  },

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

  tiers: {
    essential: { name: 'Essential', kind: 'Simple site', tag: 'Up to 5 pages', weeks: 'Live within 48 hours',
      inr: { from: 40000, was: 50000 }, usd: { from: 600, was: 750 },
      blurb: 'Clean, fast and made for phones, with a contact form, WhatsApp button and Google Maps built in.' },
    growth: { name: 'Growth', kind: 'Business site', tag: 'Up to 10 pages', weeks: 'Live within 48 hours',
      inr: { from: 55000, was: 70000 }, usd: { from: 850, was: 1100 },
      blurb: 'Pages you can edit yourself, Google setup, and room to add booking, a blog or a shop.' },
    signature: { name: 'Signature', kind: 'Animated site', tag: 'Motion design', weeks: 'Live within 48 hours',
      inr: { from: 75000, was: 95000 }, usd: { from: 1200, was: 1500 },
      blurb: 'Custom motion: scroll stories, animated text and illustrations that make people stop and look.' },
    flagship: { name: 'Flagship', kind: '3D site', tag: 'Immersive 3D', weeks: 'Live within 48 hours',
      inr: { from: 95000, was: 120000 }, usd: { from: 1600, was: 2000 },
      blurb: 'Immersive 3D scenes and effects, tuned to run smoothly on phones. For launches and luxury brands.' }
  },

  // In every plan, whichever design is picked.
  included: [
    'Your chosen design, rebuilt with your name, logo, colours, photos and words',
    'Made for phones first, tested on iPhone and Android',
    'WhatsApp button, contact form and Google Maps',
    'Google basics: page titles, descriptions and a sitemap',
    'Secure HTTPS, set up on your own web address',
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
    'Backends to take orders, bookings or payments',
    'Custom features, dashboards and client portals',
    'AI agents, AI chat and voice, AI features',
    'Connections to your CRM, ERP, billing or apps'
  ],

  addons: [
    { id: 'whatsapp',   name: 'WhatsApp auto-reply',              inr: 2000,  usd: 50,  desc: 'A greeting and quick replies on your WhatsApp, so every enquiry from the site gets an instant answer.' },
    { id: 'booking',    name: 'Online booking and calendar',      inr: 6000,  usd: 150, desc: 'Clients pick a slot and it lands in your Google or Outlook calendar, with reminders by email and WhatsApp.' },
    { id: 'payments',   name: 'Payments (UPI and cards)',          inr: 6000,  usd: 150, desc: 'UPI, cards and wallets at checkout, with receipts sent automatically.' },
    { id: 'store',      name: 'Online store',                     inr: 15000, usd: 400, desc: 'Catalogue, cart, checkout, stock and order emails for up to 100 products.' },
    { id: 'aichat',     name: 'AI chat assistant',                inr: 12000, usd: 300, desc: 'Answers visitors around the clock from your own content, captures leads and books calls. AI usage billed at cost.' },
    { id: 'voice',      name: 'AI voice receptionist',            inr: 20000, usd: 500, desc: 'Answers your phone 24/7, books appointments and passes hot calls to you. Call minutes billed at cost.' },
    { id: 'leads',      name: 'Lead automation and CRM',          inr: 8000,  usd: 200, desc: 'Every enquiry lands in your CRM or Google Sheet, alerts you instantly and gets a reply within a minute.' },
    { id: 'seo',        name: 'SEO and Google Business pack',     inr: 6000,  usd: 150, desc: 'Keyword research, Google Search Console, your Google Business Profile and analytics, set up and checked.' },
    { id: 'copy',       name: 'Copywriting',                      inr: 6000,  usd: 150, desc: 'Every page written for you, in your voice, built to turn visitors into enquiries.' },
    { id: 'brand',      name: 'Logo and brand kit',               inr: 8000,  usd: 200, desc: 'Logo, colours, fonts and a one-page brand guide.' },
    { id: 'cms',        name: 'Blog and editable pages',          inr: 6000,  usd: 150, desc: 'Change text, photos and posts yourself, no developer needed.' },
    { id: 'language',   name: 'Second language',                  inr: 6000,  usd: 150, desc: 'Your site in another language, such as Hindi or Spanish, with a switcher.' },
    { id: 'newsletter', name: 'Newsletter and welcome emails',    inr: 5000,  usd: 120, desc: 'Sign-up forms, a designed email template and an automatic welcome series.' },
    { id: 'care',       name: 'Care plan',                        inr: 1500,  usd: 40, monthly: true, desc: 'Hosting, backups, updates, uptime checks and small edits every month.' }
  ]
};

/* Fonts used by the AI agent interface looks (loaded only where a live agent stage runs). */
window.HX_AGENT_FONTS = 'https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600&family=JetBrains+Mono:wght@400;600&family=Instrument+Serif:ital@0;1&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Big+Shoulders+Display:wght@500;800&family=DM+Mono:wght@400;500&family=Space+Mono:wght@400;700&family=Hanken+Grotesk:wght@300;500&family=Sora:wght@300;600&family=Syne:wght@500;800&family=Chakra+Petch:wght@400;600&family=Tilt+Neon&family=Rajdhani:wght@500;700&family=Major+Mono+Display&family=IBM+Plex+Mono:wght@400;600&family=Outfit:wght@300;500;700&family=Anton&family=Archivo:wght@500;800&family=Lexend:wght@300;600&family=Fredoka:wght@400;600&family=Plus+Jakarta+Sans:wght@400;700&family=Bangers&family=Comic+Neue:wght@700&family=Oswald:wght@500;700&family=VT323&family=Bricolage+Grotesque:wght@400;800&family=Jost:wght@400;700&family=Press+Start+2P&family=Architects+Daughter&family=Limelight&family=Poiret+One&family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&display=swap';
