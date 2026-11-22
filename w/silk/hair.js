// Selvine · before and after portrait, drawn on canvas (no photos).
// The same face, robe and mirror are painted twice; the hair is generated strand by strand:
// frizzy, dull and uneven before, smooth caramel waves with a glossy crown after.

function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const FALL0 = 10; // index of the first point below the ear in every strand

function makeStrands(after) {
  const r = rng(after ? 7 : 19);
  const tbl = Array.from({ length: 512 }, () => r() * 2 - 1);
  const n1 = (x) => {
    const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    const a = tbl[((i % 512) + 512) % 512], b = tbl[(((i + 1) % 512) + 512) % 512];
    return a + (b - a) * u;
  };
  const out = [];
  const N = after ? 150 : 132;
  for (const s of [-1, 1]) {
    for (let k = 0; k < N; k++) {
      const d = Math.min(1, (k + r() * 0.9) / N);
      const vol = after ? 16 : 46;
      const cy = 240 - 4 * d;
      const rx = 77 + (104 + vol * 0.9 - 77) * d;
      const ry = 84 + (124 + vol * 0.55 - 84) * d;
      const pts = [];
      for (let i = 0; i < FALL0; i++) {
        const phi = (i / (FALL0 - 1)) * Math.PI * 0.5;
        let x = 250 + s * rx * Math.sin(phi), y = cy - ry * Math.cos(phi);
        if (!after) {
          const j = (2 + 7 * d) * n1(k * 1.7 + i * 0.9 + (s > 0 ? 100 : 0));
          x += s * Math.abs(j) * 0.6; y -= Math.abs(j) * 0.6 * (1 - i / FALL0);
        }
        pts.push([x, y]);
      }
      const x0 = 250 + s * rx, y0 = cy;
      const len = after ? (226 + d * 64 + r() * 8) : (168 + r() * 140 + d * 30);
      const n2 = 20;
      for (let i = 1; i <= n2; i++) {
        const t = i / n2;
        let y = y0 + t * len;
        let x = x0 + s * Math.sin(t * Math.PI * 0.85) * (6 + d * 30);
        if (after) {
          const amp = (4 + 13 * t) * (0.75 + 0.25 * d);
          x += s * amp * Math.sin(t * 9.4 + d * 0.9);
          x -= s * Math.pow(t, 6) * 10;
        } else {
          const fr = (2 + 24 * Math.pow(t, 1.3)) * (0.45 + 0.9 * d);
          x += s * fr * n1(k * 2.3 + t * 7 + (s > 0 ? 50 : 0)) * 1.1 + s * fr * 0.25;
          y += fr * 0.35 * n1(k * 1.1 + t * 9 + 200);
        }
        pts.push([x, y]);
      }
      out.push({ s, d, pts, light: after && (k % 7 === 3 || k % 11 === 5), y0: pts[0][1], y1: y0 + len });
    }
  }
  return out.sort((a, b) => b.d - a.d);
}

function path(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
  }
  const L = pts[pts.length - 1];
  ctx.lineTo(L[0], L[1]);
  ctx.stroke();
}

function spark(ctx, x, y, r, a) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = '#fff1d2';
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.16, y - r * 0.16, x + r, y);
  ctx.quadraticCurveTo(x + r * 0.16, y + r * 0.16, x, y + r);
  ctx.quadraticCurveTo(x - r * 0.16, y + r * 0.16, x - r, y);
  ctx.quadraticCurveTo(x - r * 0.16, y - r * 0.16, x, y - r);
  ctx.fill();
  ctx.restore();
}

export function paintPortrait(canvas, mode) {
  const after = mode === 'after';
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cw = canvas.clientWidth || 500, ch = canvas.clientHeight || 600;
  canvas.width = Math.max(2, Math.round(cw * dpr));
  canvas.height = Math.max(2, Math.round(ch * dpr));
  const ctx = canvas.getContext('2d');
  const sc = Math.max(canvas.width / 500, canvas.height / 600);
  ctx.setTransform(sc, 0, 0, sc, (canvas.width - 500 * sc) / 2, (canvas.height - 600 * sc) / 2);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  // backdrop and arched mirror
  const g = ctx.createLinearGradient(0, 0, 0, 600);
  if (after) { g.addColorStop(0, '#f6e5dc'); g.addColorStop(1, '#e7c2b4'); } else { g.addColorStop(0, '#e7e2dc'); g.addColorStop(1, '#cec5bd'); }
  ctx.fillStyle = g; ctx.fillRect(-60, -60, 620, 720);
  ctx.beginPath(); ctx.moveTo(84, 660); ctx.lineTo(84, 250); ctx.arc(250, 250, 166, Math.PI, 0); ctx.lineTo(416, 660); ctx.closePath();
  const ag = ctx.createRadialGradient(236, 214, 20, 250, 270, 310);
  if (after) { ag.addColorStop(0, '#fff7f2'); ag.addColorStop(1, '#f0d2c6'); } else { ag.addColorStop(0, '#f0ece8'); ag.addColorStop(1, '#dbd3cc'); }
  ctx.fillStyle = ag; ctx.fill();
  ctx.strokeStyle = after ? 'rgba(201,164,106,.85)' : 'rgba(140,130,120,.45)';
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(68, 660); ctx.lineTo(68, 250); ctx.arc(250, 250, 182, Math.PI, 0); ctx.lineTo(432, 660); ctx.stroke();

  // hair behind the neck
  ctx.fillStyle = after ? '#2a150f' : '#3c3029';
  ctx.beginPath();
  ctx.moveTo(176, 236); ctx.bezierCurveTo(158, 300, 164, 400, 176, 488);
  ctx.lineTo(324, 488); ctx.bezierCurveTo(336, 400, 342, 300, 324, 236);
  ctx.closePath(); ctx.fill();

  // neck and chest
  ctx.fillStyle = '#d9a687';
  ctx.beginPath();
  ctx.moveTo(222, 296); ctx.bezierCurveTo(224, 360, 220, 405, 208, 440);
  ctx.lineTo(250, 562); ctx.lineTo(292, 440);
  ctx.bezierCurveTo(280, 405, 276, 360, 278, 296); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c38b6b';
  ctx.beginPath(); ctx.moveTo(222, 306); ctx.quadraticCurveTo(250, 374, 278, 306); ctx.lineTo(278, 296); ctx.lineTo(222, 296); ctx.closePath(); ctx.fill();

  // salon robe
  const rg = ctx.createLinearGradient(40, 440, 460, 640);
  rg.addColorStop(0, '#bcc8b3'); rg.addColorStop(0.5, '#a5b39c'); rg.addColorStop(1, '#8a9982');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.moveTo(28, 660);
  ctx.bezierCurveTo(38, 540, 96, 486, 170, 468);
  ctx.bezierCurveTo(198, 461, 214, 452, 222, 438);
  ctx.lineTo(250, 550); ctx.lineTo(278, 438);
  ctx.bezierCurveTo(286, 452, 302, 461, 330, 468);
  ctx.bezierCurveTo(404, 486, 462, 540, 472, 660);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.38)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(222, 440); ctx.lineTo(258, 580); ctx.moveTo(278, 440); ctx.lineTo(242, 580); ctx.stroke();

  // face
  const fg = ctx.createRadialGradient(232, 222, 10, 250, 250, 124);
  fg.addColorStop(0, '#edc0a2'); fg.addColorStop(1, '#d49e7e');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(250, 148);
  ctx.bezierCurveTo(296, 148, 326, 184, 326, 234);
  ctx.bezierCurveTo(326, 276, 312, 306, 290, 326);
  ctx.bezierCurveTo(276, 338, 262, 345, 250, 345);
  ctx.bezierCurveTo(238, 345, 224, 338, 210, 326);
  ctx.bezierCurveTo(188, 306, 174, 276, 174, 234);
  ctx.bezierCurveTo(174, 184, 204, 148, 250, 148);
  ctx.fill();
  // brows, closed eyes, lashes
  ctx.strokeStyle = '#3e2519'; ctx.lineWidth = 3.4;
  ctx.beginPath(); ctx.moveTo(204, 224); ctx.quadraticCurveTo(220, 213, 240, 220); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(296, 224); ctx.quadraticCurveTo(280, 213, 260, 220); ctx.stroke();
  ctx.strokeStyle = '#3a2218'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(206, 247); ctx.quadraticCurveTo(222, 257, 238, 247); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(294, 247); ctx.quadraticCurveTo(278, 257, 262, 247); ctx.stroke();
  ctx.lineWidth = 1.5;
  [[209, 249, -4], [215, 252, -3], [222, 253, -1], [229, 252, 1]].forEach(([x, y, dx]) => {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(500 - x, y); ctx.lineTo(500 - x - dx, y + 6); ctx.stroke();
  });
  // nose and lips
  ctx.strokeStyle = 'rgba(140,82,58,.55)'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(252, 238); ctx.quadraticCurveTo(257, 268, 246, 286); ctx.quadraticCurveTo(252, 291, 260, 286); ctx.stroke();
  ctx.fillStyle = after ? '#b95f69' : '#a8716d';
  ctx.beginPath(); ctx.moveTo(229, 314); ctx.quadraticCurveTo(240, 304, 250, 310); ctx.quadraticCurveTo(260, 304, 271, 314); ctx.quadraticCurveTo(250, 334, 229, 314); ctx.fill();
  ctx.strokeStyle = 'rgba(90,30,40,.5)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(231, 314); ctx.quadraticCurveTo(250, 318, 269, 314); ctx.stroke();
  if (after) { ctx.fillStyle = 'rgba(255,230,220,.45)'; ctx.beginPath(); ctx.ellipse(253, 322, 8, 2.6, 0, 0, Math.PI * 2); ctx.fill(); }
  for (const cx of [204, 296]) {
    const b = ctx.createRadialGradient(cx, 286, 2, cx, 286, 28);
    b.addColorStop(0, after ? 'rgba(228,116,106,.36)' : 'rgba(196,124,112,.14)'); b.addColorStop(1, 'rgba(228,116,106,0)');
    ctx.fillStyle = b; ctx.fillRect(cx - 32, 254, 64, 64);
  }

  // hair, strand by strand
  const strands = makeStrands(after);
  ctx.strokeStyle = after ? '#2b1710' : '#3e322a';
  ctx.lineWidth = after ? 7 : 6;
  for (const st of strands) path(ctx, st.pts.slice(0, Math.round(st.pts.length * 0.86)));
  for (const st of strands) {
    const gr = ctx.createLinearGradient(0, st.y0, 0, st.y1);
    if (after) {
      gr.addColorStop(0, '#2c1711'); gr.addColorStop(0.42, '#51301f');
      gr.addColorStop(0.78, st.light ? '#c58b51' : '#9d6b43'); gr.addColorStop(1, st.light ? '#ebbe85' : '#cb9662');
    } else {
      gr.addColorStop(0, '#3a2e27'); gr.addColorStop(0.6, '#5d4c40'); gr.addColorStop(1, '#8e7b67');
    }
    ctx.strokeStyle = gr;
    ctx.lineWidth = after ? 1.6 : 1.25;
    ctx.globalAlpha = after ? 1 : 0.92;
    path(ctx, st.pts);
  }
  ctx.globalAlpha = 1;

  if (after) {
    // glossy crown and light caught on every wave
    ctx.globalCompositeOperation = 'screen';
    for (const st of strands) {
      const mid = 1 - Math.abs(st.d - 0.5) * 2;
      ctx.strokeStyle = `rgba(255,224,190,${(0.18 + 0.36 * mid) * (st.s < 0 ? 1 : 0.8)})`;
      ctx.lineWidth = 1.5;
      path(ctx, st.pts.slice(2, 7));
      ctx.lineWidth = 1.3;
      let run = [];
      for (let i = FALL0; i < st.pts.length; i++) {
        const t = (i - FALL0 + 1) / 20;
        if (Math.cos(t * 9.4 + st.d * 0.9) > 0.72 && t > 0.12) run.push(st.pts[i]);
        else { if (run.length > 1) { ctx.strokeStyle = `rgba(255,214,170,${0.22 + 0.18 * mid})`; path(ctx, run); } run = []; }
      }
      if (run.length > 1) { ctx.strokeStyle = 'rgba(255,214,170,.3)'; path(ctx, run); }
    }
    ctx.globalCompositeOperation = 'source-over';
    spark(ctx, 150, 186, 9, 0.9); spark(ctx, 360, 318, 7, 0.8); spark(ctx, 336, 132, 5, 0.75); spark(ctx, 118, 404, 5, 0.7);
  } else {
    // frizz and flyaways
    const r = rng(99);
    ctx.strokeStyle = '#9b8771'; ctx.lineWidth = 0.85; ctx.globalAlpha = 0.62;
    for (const st of strands) {
      if (st.d < 0.5) continue;
      for (let j = 0; j < 2; j++) {
        const idx = 3 + Math.floor(r() * (st.pts.length - 4));
        let [x, y] = st.pts[idx];
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let q = 0; q < 6; q++) { x += st.s * (2 + r() * 3.5); y += (r() - 0.5) * 7; ctx.lineTo(x, y); }
        ctx.stroke();
      }
    }
    ctx.strokeStyle = '#86735f'; ctx.lineWidth = 0.75; ctx.globalAlpha = 0.55;
    const outer = strands.filter((s) => s.d > 0.85);
    for (let i = 0; i < 48; i++) {
      const st = outer[Math.floor(r() * outer.length)];
      const idx = 2 + Math.floor(r() * (st.pts.length - 3));
      const [x, y] = st.pts[idx];
      const ang = (st.s > 0 ? 0 : Math.PI) + (r() - 0.5) * 1.6 - (idx < FALL0 ? 0.6 * st.s : 0);
      const L = 16 + r() * 34;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(ang + 0.6) * L * 0.6, y + Math.sin(ang + 0.6) * L * 0.6 - 6, x + Math.cos(ang) * L, y + Math.sin(ang) * L);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
