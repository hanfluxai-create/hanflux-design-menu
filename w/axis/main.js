import { film, reveals, $, $$ } from './kit.js';

// hero film: the rail under it marks which ring is coming into line
const rail = $('.rail');
let step = 0;
film({ section: '#film', counts: { d: 96, m: 96 }, onProgress: (p) => {
  const i = p < 0.2 ? 0 : p < 0.4 ? 1 : p < 0.6 ? 2 : p < 0.8 ? 3 : 4;
  if (i !== step && rail) { step = i; rail.dataset.i = i; }
} });
reveals();

// ring diagrams only turn while their section is on screen
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('live', e.isIntersecting)));
  $$('[data-live]').forEach((el) => io.observe(el));
}

// fee calculator
const calc = $('[data-calc]');
if (calc) {
  const size = $('#size'), ent = $('[data-ent]'), xb = $('[data-xb]');
  const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const scale = (el, k) => { el.style.transform = `scaleX(${Math.max(0.02, Math.min(1, k)).toFixed(4)})`; };
  const run = () => {
    const m = +size.value, n = +ent.textContent;
    const ours = 48000 + ((m - 10) / 10) * 4000 + Math.max(0, n - 2) * 3000 + (xb.checked ? 12000 : 0);
    const theirs = m * 10000, top = Math.max(ours, theirs);
    const label = `$${m} million`;
    $('[data-size]').textContent = label;
    size.setAttribute('aria-valuetext', label);
    size.style.setProperty('--v', ((m - 10) / 290 * 100).toFixed(2) + '%');
    $('[data-ours]').textContent = usd(ours);
    $('[data-theirs]').textContent = usd(theirs);
    $('[data-quarter]').textContent = usd(ours / 4);
    scale($('[data-bar-ours]'), ours / top);
    scale($('[data-bar-theirs]'), theirs / top);
  };
  size.addEventListener('input', run);
  xb.addEventListener('change', run);
  $$('[data-step]', calc).forEach((b) => b.addEventListener('click', () => {
    ent.textContent = Math.min(12, Math.max(1, +ent.textContent + +b.dataset.step));
    run();
  }));
  // the bars grow from nothing the first time the calculator is seen
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.3 });
    io.observe(calc);
    $('[data-size]').textContent = '$50 million';
  } else run();
}

// the next three weekdays, one slot each
const slots = $('[data-slots]');
if (slots) {
  const wk = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const times = ['10:00 am', '2:30 pm', '4:00 pm'];
  const d = new Date(); let html = '', made = 0;
  while (made < 3) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const day = `${wk[d.getDay()].slice(0, 3)} ${d.getDate()} ${mo[d.getMonth()]}`;
    html += `<label><input type="radio" name="slot" value="${wk[d.getDay()]} ${d.getDate()} ${mo[d.getMonth()]} at ${times[made]} ET"${made ? '' : ' checked'}><span><small>${day}</small>${times[made]}</span></label>`;
    made++;
  }
  slots.innerHTML = html;
}

// the success note repeats what was chosen
const form = $('.booker');
if (form) form.addEventListener('submit', () => {
  const f = new FormData(form);
  const name = String(f.get('name') || '').trim().split(/\s+/)[0];
  const topic = { 'Tax': 'tax', 'Succession': 'succession', 'A sale': 'a sale', 'Not sure yet': 'whatever is on your mind' }[f.get('topic')] || 'your plans';
  $('[data-summary]').textContent = `Thank you${name ? ', ' + name : ''}. A partner will call on ${f.get('slot')} to talk about ${topic}, and will confirm at ${f.get('email')}.`;
});
