import { film, reveals, $, $$ } from './kit.js';
const HX = window.HX || {};

film({ section: '#film', canvas: '#film canvas', counts: { d: 72, m: 48 } });
reveals();

/* ---------- code tabs and a streamed reply ---------- */
const CODE = {
  py: `<span class="k">from</span> tessera <span class="k">import</span> Tessera

client = <span class="f">Tessera</span>()  <span class="c"># reads TESSERA_API_KEY</span>

stream = client.chat.<span class="f">stream</span>(
    model=<span class="s">"atlas-large"</span>,
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
               <span class="s">"content"</span>: <span class="s">"Summarise this ticket"</span>}],
)
<span class="k">for</span> token <span class="k">in</span> stream:
    <span class="f">print</span>(token, end=<span class="s">""</span>)`,
  ts: `<span class="k">import</span> { Tessera } <span class="k">from</span> <span class="s">"tessera"</span>;

<span class="k">const</span> client = <span class="k">new</span> <span class="f">Tessera</span>(); <span class="c">// reads TESSERA_API_KEY</span>

<span class="k">const</span> stream = <span class="k">await</span> client.chat.<span class="f">stream</span>({
  model: <span class="s">"atlas-large"</span>,
  messages: [{ role: <span class="s">"user"</span>,
               content: <span class="s">"Summarise this ticket"</span> }],
});
<span class="k">for await</span> (<span class="k">const</span> token <span class="k">of</span> stream) {
  process.stdout.<span class="f">write</span>(token);
}`,
  sh: `curl https://api.tessera.dev/v1/chat \\
  -H <span class="s">"Authorization: Bearer $TESSERA_API_KEY"</span> \\
  -H <span class="s">"Content-Type: application/json"</span> \\
  -d <span class="s">'{
    "model": "atlas-large",
    "stream": true,
    "messages": [{
      "role": "user",
      "content": "Summarise this ticket"
    }]
  }'</span>`
};
const REPLY = 'The customer was charged twice for the March invoice. The second charge has been refunded and will reach their card in three to five days. No further action is needed.';
const code = $('[data-code]'), out = $('[data-stream]'), msEl = $('[data-ms]');
let timer = 0;
function stream() {
  clearInterval(timer);
  if (!out) return;
  const words = REPLY.split(' '); let i = 0;
  out.textContent = '';
  if (msEl) msEl.textContent = 34 + Math.floor(Math.random() * 9);
  if (HX.reducedMotion) { out.textContent = REPLY; return; }
  timer = setInterval(() => {
    if (HX.paused) return;
    out.textContent += (i ? ' ' : '') + words[i++];
    if (i >= words.length) { clearInterval(timer); timer = setTimeout(stream, 4200); }
  }, 70);
}
function lang(l) { code.innerHTML = CODE[l]; $$('[data-lang]').forEach((b) => b.setAttribute('aria-selected', b.dataset.lang === l ? 'true' : 'false')); stream(); }
if (code) {
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => lang(b.dataset.lang)));
  code.innerHTML = CODE.py;
  const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); stream(); } }, { threshold: 0.3 });
  io.observe(code);
}

/* ---------- live latency chart ---------- */
const line = $('[data-line]'), area = $('[data-area]');
if (line) {
  const N = 48, pts = Array.from({ length: N }, (_, i) => 38 + Math.sin(i / 3) * 6 + Math.random() * 10);
  const p50 = $('[data-p50]'), p95 = $('[data-p95]'), p99 = $('[data-p99]');
  const draw = () => {
    const d = pts.map((v, i) => `${i ? 'L' : 'M'}${(i / (N - 1) * 600).toFixed(1)} ${(260 - v / 200 * 260).toFixed(1)}`).join('');
    line.setAttribute('d', d); area.setAttribute('d', d + 'L600 260L0 260Z');
  };
  draw();
  let seen = false;
  new IntersectionObserver((es) => { seen = es[0].isIntersecting; }).observe(line);
  if (!HX.reducedMotion) setInterval(() => {
    if (!seen || HX.paused) return;
    const spike = Math.random() < 0.07 ? 50 + Math.random() * 60 : 0;
    pts.push(36 + Math.random() * 12 + spike); pts.shift(); draw();
    const last = pts[N - 1];
    if (!spike) p50.textContent = Math.round(last);
    p95.textContent = 104 + Math.round(Math.random() * 14); p99.textContent = 176 + Math.round(Math.random() * 18);
  }, 900);
}

/* ---------- billing toggle ---------- */
$$('[data-bill]').forEach((b) => b.addEventListener('click', () => {
  $$('[data-bill]').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
  $$('[data-mo]').forEach((el) => { el.textContent = el.dataset[b.dataset.bill]; });
}));
