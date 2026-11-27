import { film, reveals, $ } from './kit.js';

film({ section: '#film', canvas: '#film canvas', counts: { d: 72, m: 48 } });
reveals();

// fee comparison: a flat retainer set by complexity, against a percentage fee
const r = $('#aum');
if (r) {
  const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const retainer = (m) => 30000 + Math.round(Math.sqrt(m) * 5200 / 1000) * 1000;   // grows slowly with size
  const draw = () => {
    const m = +r.value, them = m * 10000, us = retainer(m), top = 60 * 10000;
    $('#aum-out').textContent = '$' + m + ' million';
    $('#fee-them').textContent = usd(them); $('#fee-us').textContent = usd(us); $('#fee-save').textContent = usd(them - us);
    $('#bar-them').style.width = Math.max(4, them / top * 100) + '%'; $('#bar-us').style.width = Math.max(4, us / top * 100) + '%';
    $('.save').hidden = them <= us;
  };
  r.addEventListener('input', draw); draw();
}
