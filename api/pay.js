// Hanflux Design Menu · POST /api/pay/: creates a Razorpay payment link for one order and returns its URL.
// The amount is worked out here from the price book (api/_prices.json, written by tools/build.mjs), never
// taken from the browser. Needs RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the Vercel project settings;
// without them it answers 503 and the order page falls back to "we call you and send the link".
// GET /api/pay/ tells the order page whether online payment is switched on.
const P = require('./_prices.json');

const clean = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

function priceOf(b) {
  const cur = b.cur === 'usd' ? 'usd' : 'inr';
  const site = P.sites[b.design];
  if (!site) return null;
  const tier = P.tiers[site.tier];
  const launch = Date.now() < P.offerEnds;
  let amount = launch ? tier[cur].from : (tier[cur].was || tier[cur].from);
  const addons = (Array.isArray(b.addons) ? b.addons : []).filter((x, i, a) => P.addons[x] && !P.addons[x].monthly && a.indexOf(x) === i).slice(0, 20);
  addons.forEach((x) => { amount += P.addons[x][cur]; });
  const total = amount;
  amount = Math.round(amount * P.upfrontPct / 100);
  return { cur, site, tier, addons, total, amount };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const keyId = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET;
  const ready = !!(keyId && secret);
  if (req.method === 'GET') { res.status(200).json({ ready }); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  const origin = req.headers.origin || '';
  if (origin && origin !== P.site && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) { res.status(403).json({ error: 'wrong origin' }); return; }
  if (!ready) { res.status(503).json({ error: 'online payment is not switched on yet' }); return; }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  b = b || {};
  const p = priceOf(b);
  if (!p) { res.status(400).json({ error: 'unknown design' }); return; }
  const name = clean(b.name, 80), email = clean(b.email, 120), phone = clean(b.phone, 24).replace(/[^\d+]/g, '');
  if (!name || phone.replace(/\D/g, '').length < 8) { res.status(400).json({ error: 'name and phone are needed' }); return; }
  const order = /^HX-\d{6}-\d{4,6}$/.test(b.order || '') ? b.order : 'HX-' + Date.now().toString().slice(-10);
  const body = {
    amount: p.amount * 100, currency: p.cur.toUpperCase(), accept_partial: false,
    reference_id: order,
    description: clean(`Hanflux website: ${p.site.name} (${p.tier.name} plan)` + (p.addons.length ? ` + ${p.addons.length} add-on${p.addons.length > 1 ? 's' : ''}` : ''), 240),
    customer: Object.assign({ name: name, contact: phone }, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? { email: email } : {}),
    notify: { sms: false, email: false }, reminder_enable: false,
    notes: { order_id: order, design: p.site.name, plan: p.tier.name, addons: clean(p.addons.join(', '), 250) || 'none', total: String(p.total) },
    callback_url: P.site + '/order/?paid=1', callback_method: 'get',
    expire_by: Math.floor(Date.now() / 1000) + 7 * 86400
  };
  try {
    const r = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + Buffer.from(keyId + ':' + secret).toString('base64') },
      body: JSON.stringify(body)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.short_url) { res.status(502).json({ error: (j.error && j.error.description) || 'could not create the payment link' }); return; }
    res.status(200).json({ url: j.short_url, amount: p.amount, total: p.total, currency: p.cur.toUpperCase(), order: order });
  } catch (e) {
    res.status(502).json({ error: 'payment service unreachable' });
  }
};
