// Hanflux Design Factory · POST /api/lead/: every form on the site lands here.
// 1. The lead is saved first, in the project's private Vercel Blob store (leads/<date>/<time>.json),
//    so it is never lost even if an email service is down.
// 2. If the browser could not email it already (Web3Forms, sent from the visitor's browser), this
//    function emails it: Web3Forms from the server, then FormSubmit as a last resort.
// GET /api/lead/ answers { ok, store } so a check can see the endpoint is alive.
const NOTIFY = 'chitrakshmayank3@gmail.com';
const W3_KEY = process.env.WEB3FORMS_KEY || '';
const clean = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, ' ').trim().slice(0, n);

async function emailIt(lead) {
  const subject = clean(lead._subject || ('New lead: ' + (lead.name || 'website enquiry')), 140);
  const fields = Object.fromEntries(Object.entries(lead).filter(([k]) => !k.startsWith('_') && k !== 'emailed'));
  if (W3_KEY) {
    try {
      const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ access_key: W3_KEY, subject, from_name: 'Hanflux Design Factory' }, fields)) });
      const j = await r.json().catch(() => ({}));
      if (j && j.success) return 'web3forms';
    } catch (e) { /* try the next one */ }
  }
  try {
    const r = await fetch('https://formsubmit.co/ajax/' + NOTIFY, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.assign({ _subject: subject, _template: 'table', _captcha: 'false' }, fields)) });
    const j = await r.json().catch(() => ({}));
    if (j && (j.success === true || j.success === 'true')) return 'formsubmit';
  } catch (e) { /* nothing else to try */ }
  return '';
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') { res.status(200).json({ ok: true, store: !!process.env.BLOB_READ_WRITE_TOKEN, email: !!W3_KEY }); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  b = b && typeof b === 'object' ? b : {};
  if (b._honey) { res.status(200).json({ ok: true }); return; } // a bot filled the hidden field
  const lead = {};
  Object.keys(b).slice(0, 40).forEach((k) => { if (/^[\w-]{1,40}$/.test(k) && k !== '_honey') lead[k] = clean(b[k], 1500); });
  if (!lead.name && !lead.whatsapp && !lead.phone && !lead.email) { res.status(400).json({ error: 'empty lead' }); return; }
  const now = new Date();
  lead.received_at = now.toISOString();
  lead.ip_country = clean(req.headers['x-vercel-ip-country'], 4);
  lead.ip_city = clean(decodeURIComponent(req.headers['x-vercel-ip-city'] || ''), 60);
  let saved = false;
  try {
    const { put } = await import('@vercel/blob');
    const id = now.toISOString().replace(/[:.]/g, '-') + '-' + Math.random().toString(36).slice(2, 8);
    await put(`leads/${now.toISOString().slice(0, 10)}/${id}.json`, JSON.stringify(lead, null, 1), { access: 'private', contentType: 'application/json', addRandomSuffix: false });
    saved = true;
  } catch (e) { console.error('lead save failed', e && e.message); }
  let emailed = b.emailed === true || b.emailed === 'true' ? 'browser' : '';
  if (!emailed) emailed = await emailIt(lead);
  console.log('lead', JSON.stringify({ saved, emailed, name: lead.name, source: lead.source }));
  res.status(saved || emailed ? 200 : 502).json({ ok: !!(saved || emailed), saved, emailed: !!emailed });
};
