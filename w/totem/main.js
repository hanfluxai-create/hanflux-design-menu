import { film, reveals, $, $$ } from './kit.js';

// the "stack" indicator: one more piece lights up as each discipline lands on the plinth
const steps = $$('.stack li'), marks = [0.2, 0.41, 0.61, 0.81];
let lit = -1;
film({
  section: '#film', canvas: '#film canvas', counts: { d: 96, m: 96 },
  onProgress: (p) => {
    let n = 0; for (const m of marks) if (p >= m) n++;
    if (n === lit) return; lit = n;
    steps.forEach((li, i) => { li.classList.toggle('lit', i < n); li.classList.toggle('cur', i === n - 1); });
  },
});
reveals();

// the brief form: nothing is sent, the reply just repeats what was asked for
const form = $('.brief');
if (form) form.addEventListener('submit', () => {
  const f = new FormData(form), first = String(f.get('name') || '').trim().split(/\s+/)[0];
  $('[data-who]', form).textContent = first ? ', ' + first : '';
  $('[data-summary]', form).textContent = `You asked about ${f.get('type')} with a budget of ${f.get('budget')}. I will read it properly and write back within two working days.`;
});
