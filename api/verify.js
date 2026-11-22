// Hanflux Design Menu · GET /api/verify/: checks the signature Razorpay adds when it sends a client back
// to /order/?paid=1 after paying, so the page only says "payment received" for a genuine payment.
const crypto = require('crypto');
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const q = req.query || {};
  const parts = [q.razorpay_payment_link_id, q.razorpay_payment_link_reference_id, q.razorpay_payment_link_status, q.razorpay_payment_id];
  if (!secret || parts.some((x) => !x) || !q.razorpay_signature) { res.status(200).json({ ok: false }); return; }
  const want = crypto.createHmac('sha256', secret).update(parts.join('|')).digest('hex');
  const got = String(q.razorpay_signature);
  const ok = want.length === got.length && crypto.timingSafeEqual(Buffer.from(want), Buffer.from(got)) && q.razorpay_payment_link_status === 'paid';
  res.status(200).json({ ok: ok, order: ok ? String(q.razorpay_payment_link_reference_id) : null });
};
