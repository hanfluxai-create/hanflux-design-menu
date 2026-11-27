import { film, reveals, $, $$ } from './kit.js';

film({ section: '#film', canvas: '#film canvas', counts: { d: 72, m: 48 } });
reveals();

// a package button preselects that package in the form
$$('[data-pack]').forEach((b) => b.addEventListener('click', () => {
  const r = $(`.opts input[value="${b.dataset.pack}"]`); if (r) r.checked = true;
}));
