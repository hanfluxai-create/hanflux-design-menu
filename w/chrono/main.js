import { film, reveals, $, $$ } from './kit.js';

film({ section: '#film', canvas: '#film canvas', counts: { d: 72, m: 48 } });
reveals();

// minute ticks around the movement drawing
const ticks = $('.mv-art .ticks');
if (ticks) {
  let d = '';
  for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2, r1 = i % 5 ? 168 : 160, r2 = 174; d += `M${(200 + Math.sin(a) * r1).toFixed(1)} ${(200 - Math.cos(a) * r1).toFixed(1)}L${(200 + Math.sin(a) * r2).toFixed(1)} ${(200 - Math.cos(a) * r2).toFixed(1)}`; }
  ticks.innerHTML = `<path d="${d}"/>`;
}

// bag (a demo: nothing is ordered)
const bag = [], count = $('[data-bag]'), note = $('[data-bag-note]');
$$('[data-add]').forEach((b) => b.addEventListener('click', () => {
  const card = b.closest('[data-product]'), name = card.dataset.product, i = bag.indexOf(name);
  if (i < 0) { bag.push(name); b.textContent = 'In your bag'; b.classList.add('added'); } else { bag.splice(i, 1); b.textContent = 'Add to bag'; b.classList.remove('added'); }
  count.textContent = bag.length; count.classList.remove('bump'); void count.offsetWidth; count.classList.add('bump');
  note.innerHTML = bag.length ? `<b>${bag.join(', ')}</b> ${bag.length > 1 ? 'are' : 'is'} in your bag. Free insured shipping worldwide.` : 'Free insured shipping worldwide. Pay in full or in three parts.';
}));
