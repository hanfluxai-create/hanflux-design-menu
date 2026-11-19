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
  examples: ['hanflux', 'oraya', 'oraya-film', 'oraya-classic', 'oraya-dealership'],
  // Enquiry pop-up after this many seconds on the menu. Name, email and website type go to the inbox
  // below through FormSubmit (the first enquiry sends a one-time "Activate Form" email to that inbox).
  lead: { on: true, afterSec: 90, endpoint: 'https://formsubmit.co/ajax/hanfluxai@gmail.com' },

  currency: { code: 'USD', symbol: '$' },
  showPrices: true,

  // Launch offer: real end date, real regular prices. When it ends, the site shows the regular ("was") prices on its own.
  offer: {
    on: true,
    label: 'Launch offer',
    ends: '2026-12-31T23:59:59+05:30',
    endsLabel: '31 Dec',
    note: 'Launch prices apply to projects booked by 31 December 2026. Regular prices apply after that.'
  },

  tiers: {
    essential: { name: 'Essential', from: 1500, was: 2500, weeks: '1 to 2 weeks', blurb: 'A fast, beautiful site of up to 5 pages, mobile-first, with contact and WhatsApp built in.' },
    growth:    { name: 'Growth',    from: 3500, was: 5500, weeks: '2 to 4 weeks', blurb: 'Up to 10 pages with editable content, booking or a shop, SEO setup and the integrations you need.' },
    signature: { name: 'Signature', from: 6500, was: 9900, weeks: '3 to 5 weeks', blurb: 'Custom motion design: scroll stories, animated type and illustration, built to make people stop.' },
    flagship:  { name: 'Flagship',  from: 10000, was: 15000, weeks: '4 to 8 weeks', blurb: 'Immersive WebGL and 3D, custom shaders and scroll-driven scenes, tuned to run smoothly on phones.' }
  },

  addons: [
    { id: 'booking',    name: 'Online booking and calendar sync', from: 400,  desc: 'Clients pick a slot and it lands in your Google or Outlook calendar, with reminders by email and WhatsApp.' },
    { id: 'whatsapp',   name: 'WhatsApp chat and auto-reply',      from: 150,  desc: 'One tap from your site to your WhatsApp, with a greeting and quick replies ready.' },
    { id: 'newsletter', name: 'Newsletter and welcome emails',    from: 350,  desc: 'Sign-up forms, a designed email template and an automatic welcome series.' },
    { id: 'leads',      name: 'Lead automation and CRM',          from: 600,  desc: 'Every enquiry lands in your CRM or Google Sheet, alerts you instantly and gets a reply within a minute.' },
    { id: 'aichat',     name: 'AI chat assistant',                from: 900,  desc: 'Answers visitors around the clock from your own content, captures leads and books calls.' },
    { id: 'voice',      name: 'AI voice receptionist',            from: 1500, desc: 'Answers your phone 24/7, books appointments and hands hot calls to you.' },
    { id: 'payments',   name: 'Payments and checkout',            from: 500,  desc: 'Cards, UPI and wallets, with invoices and receipts sent automatically.' },
    { id: 'store',      name: 'Online store',                     from: 1500, desc: 'Catalogue, cart, checkout, stock and order emails for up to 100 products.' },
    { id: 'cms',        name: 'Blog and editable pages',          from: 600,  desc: 'Change text, photos and posts yourself, no developer needed.' },
    { id: 'language',   name: 'Second language',                  from: 500,  desc: 'Your site in another language, such as Hindi or Spanish, with a switcher.' },
    { id: 'seo',        name: 'SEO and analytics launch pack',    from: 450,  desc: 'Technical SEO, Search Console, analytics and a speed pass before launch.' },
    { id: 'copy',       name: 'Copywriting',                      from: 600,  desc: 'Every page written for you, in your voice, built to convert.' },
    { id: 'brand',      name: 'Logo and brand kit',               from: 800,  desc: 'Logo, colours, type and a one-page brand guide.' },
    { id: 'care',       name: 'Care plan',                        from: 150, monthly: true, desc: 'Hosting, backups, updates, uptime checks and small edits every month.' }
  ]
};

/* Fonts used by the AI agent interface looks (loaded only where a live agent stage runs). */
window.HX_AGENT_FONTS = 'https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600&family=JetBrains+Mono:wght@400;600&family=Instrument+Serif:ital@0;1&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Big+Shoulders+Display:wght@500;800&family=DM+Mono:wght@400;500&family=Space+Mono:wght@400;700&family=Hanken+Grotesk:wght@300;500&family=Sora:wght@300;600&family=Syne:wght@500;800&family=Chakra+Petch:wght@400;600&family=Tilt+Neon&family=Rajdhani:wght@500;700&family=Major+Mono+Display&family=IBM+Plex+Mono:wght@400;600&family=Outfit:wght@300;500;700&family=Anton&family=Archivo:wght@500;800&family=Lexend:wght@300;600&family=Fredoka:wght@400;600&family=Plus+Jakarta+Sans:wght@400;700&family=Bangers&family=Comic+Neue:wght@700&family=Oswald:wght@500;700&family=VT323&family=Bricolage+Grotesque:wght@400;800&family=Jost:wght@400;700&family=Press+Start+2P&family=Architects+Daughter&family=Limelight&family=Poiret+One&family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&display=swap';
