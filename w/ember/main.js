import { film, reveals, $, $$ } from './kit.js';

const heat = $('.temp b i');
film({ section: '#film', counts: { d: 96, m: 96 }, onProgress: (p) => { if (heat) heat.style.transform = `scaleY(${(0.12 + p * 0.88).toFixed(3)})`; } });
reveals();

// the next six open nights (closed on Mondays); the first counter night shows as full
const days = $('[data-days]');
if (days) {
  const wk = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(); let made = 0, html = '';
  while (made < 6) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 1) continue;
    const v = `${wk[d.getDay()]} ${d.getDate()} ${mo[d.getMonth()]}`;
    html += `<label><input type="radio" name="day" value="${v}"${made === 1 ? ' checked' : ''}${made === 0 ? ' disabled' : ''}><span><small>${wk[d.getDay()]}</small>${d.getDate()} ${mo[d.getMonth()]}</span></label>`;
    made++;
  }
  days.innerHTML = html;
}
const out = $('[data-guests]');
$$('[data-step]').forEach((b) => b.addEventListener('click', () => { out.textContent = Math.min(8, Math.max(1, +out.textContent + +b.dataset.step)); }));
const form = $('.booker');
if (form) form.addEventListener('submit', () => {
  const f = new FormData(form), n = +out.textContent;
  $('[data-summary]').textContent = ` ${f.get('day')}, ${f.get('seat')}, ${n} ${n > 1 ? 'guests' : 'guest'}, under ${String(f.get('name')).trim()}.`;
});
