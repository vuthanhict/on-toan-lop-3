// venn, grid100, balance, table, factorpairs, bubble, emoji
import { COL, PAL, pal, el, svgRoot, safe, num, int, arr, textOn, ensureStyle, setupAnim, stagger } from './_v2.js';

const CSS = `
.v-venn text,.v-grid100 text,.v-balance text,.v-factorpairs text{font-family:inherit}
.v-table-wrap{width:100%;max-width:480px;margin:0 auto;overflow-x:auto;-webkit-overflow-scrolling:touch}
.v-table-t{width:100%;border-collapse:separate;border-spacing:0;font-size:17px;font-weight:700;color:var(--c-ink,#263250);background:#FFFFFF;border:3px solid var(--c-line,#E8E1D2);border-radius:16px;overflow:hidden}
.v-table-t th{background:var(--c-primary,#4F6BED);color:#FFFFFF;font-size:16px;font-weight:900;padding:10px 8px;text-align:center;border-right:2px solid rgba(255,255,255,.35)}
.v-table-t th:last-child{border-right:0}
.v-table-t td{padding:10px 8px;text-align:center;border-top:2px solid var(--c-line,#E8E1D2);border-right:2px solid var(--c-line,#E8E1D2);min-width:44px}
.v-table-t td:last-child{border-right:0}
.v-table-t tbody tr:nth-child(even) td{background:var(--c-soft,#E8EDFF)}
.v-table-t td.v-table-hl{background:#FBDF86!important;box-shadow:inset 0 0 0 3px var(--c-accent,#F5893A)}
.v-table-q{display:inline-block;min-width:34px;padding:2px 10px;border-radius:10px;border:3px dashed var(--c-accent,#F5893A);color:var(--c-accent,#F5893A);font-weight:900;background:#FFFFFF}
.v-bubble-root{display:flex;align-items:flex-start;gap:12px;width:100%;max-width:480px;margin:0 auto;font-family:inherit;color:var(--c-ink,#263250)}
.v-bubble-who{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:64px}
.v-bubble-av{width:58px;height:58px;border-radius:50%;background:var(--c-soft,#E8EDFF);border:3px solid var(--c-primary,#4F6BED);display:flex;align-items:center;justify-content:center;font-size:32px;line-height:1}
.v-bubble-name{font-size:15px;font-weight:900}
.v-bubble-txt{position:relative;flex:1 1 auto;background:#FFFFFF;border:3px solid var(--c-primary,#4F6BED);border-radius:20px;padding:12px 14px;font-size:18px;line-height:1.45;font-weight:600;margin-top:6px}
.v-bubble-txt::before{content:"";position:absolute;left:-11px;top:16px;width:16px;height:16px;background:#FFFFFF;border-left:3px solid var(--c-primary,#4F6BED);border-bottom:3px solid var(--c-primary,#4F6BED);transform:rotate(45deg)}
.v-emoji-root{width:100%;text-align:center;font-size:44px;line-height:1.3;letter-spacing:.06em;word-break:break-word;font-family:inherit}
`;

/* ------------------------------------------------------------------- venn */
function placeIn(cx, cy, n, cols, dx, dyMax, h) {
  const rows = Math.ceil(n / cols);
  const dy = Math.min(dyMax, (h || 150) / Math.max(1, rows));
  const out = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const inRow = Math.min(cols, n - r * cols);
    out.push([cx + (c - (inRow - 1) / 2) * dx, cy + (r - (rows - 1) / 2) * dy]);
  }
  return out;
}

function venn(spec, ctx) {
  const A = spec.a && typeof spec.a === 'object' ? spec.a : { label: 'A', items: [] };
  const B = spec.b && typeof spec.b === 'object' ? spec.b : { label: 'B', items: [] };
  const both = arr(spec.both), outside = arr(spec.outside);
  const hide = new Set(arr(spec.hide).map(String));
  const bothS = new Set(both.map(String));
  const aOnly = arr(A.items).filter((v) => !bothS.has(String(v)));
  const bOnly = arr(B.items).filter((v) => !bothS.has(String(v)));
  const colA = A.color || pal(ctx, 0), colB = B.color || pal(ctx, 1);
  const show = (v) => (hide.has(String(v)) ? 'ô trống' : String(v));
  const label = `Sơ đồ Venn. Vòng ${A.label || 'A'}: ${aOnly.map(show).join(', ') || 'không có số riêng'}. Vòng ${B.label || 'B'}: ${bOnly.map(show).join(', ') || 'không có số riêng'}. Phần chung: ${both.map(show).join(', ') || 'trống'}.` + (outside.length ? ` Ngoài hai vòng: ${outside.map(show).join(', ')}.` : '');
  const svg = svgRoot(360, 276, label, 'v-venn', 480);
  svg.appendChild(el('rect', { x: 4, y: 4, width: 352, height: 268, rx: 18, fill: '#FFFFFF', stroke: COL.line, 'stroke-width': 3 }));
  const c1 = 130, c2 = 230, cy = 150, r = 88;
  svg.appendChild(el('circle', { cx: c1, cy, r, fill: colA, 'fill-opacity': 0.3, stroke: colA, 'stroke-width': 4 }));
  svg.appendChild(el('circle', { cx: c2, cy, r, fill: colB, 'fill-opacity': 0.3, stroke: colB, 'stroke-width': 4 }));
  svg.appendChild(el('text', { x: 100, y: 38, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: COL.ink, text: A.label || '' }));
  svg.appendChild(el('text', { x: 260, y: 38, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: COL.ink, text: B.label || '' }));
  const groups = [];
  const chip = (g, x, y, v) => {
    const q = hide.has(String(v));
    const t = q ? '?' : String(v);
    const w = Math.max(32, t.length * 13 + 14);
    const c = el('g', null);
    c.appendChild(el('rect', { x: x - w / 2, y: y - 15, width: w, height: 30, rx: 10, fill: '#FFFFFF', stroke: q ? COL.accent : 'rgba(43,42,58,.28)', 'stroke-width': q ? 3 : 2, 'stroke-dasharray': q ? '5 3' : '' }));
    c.appendChild(el('text', { x, y: y + 7, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 900, fill: q ? COL.accent : COL.ink, text: t }));
    g.appendChild(c);
  };
  const region = (items, cx, cols, dx) => {
    const g = el('g', null);
    placeIn(cx, cy + 4, items.length, cols, dx, 36, 150).forEach((p, i) => chip(g, p[0], p[1], items[i]));
    svg.appendChild(g); groups.push(g);
  };
  region(aOnly, 90, aOnly.length <= 3 ? 1 : aOnly.length <= 8 ? 2 : 3, 44);
  region(both, 180, both.length <= 4 ? 1 : 2, 40);
  region(bOnly, 270, bOnly.length <= 3 ? 1 : bOnly.length <= 8 ? 2 : 3, 44);
  const spots = [[28, 76], [332, 76], [28, 224], [332, 224], [28, 150], [332, 150], [180, 252], [98, 252], [262, 252], [180, 58]];
  const og = el('g', null);
  outside.forEach((v, i) => { const p = spots[i % spots.length]; chip(og, p[0], p[1], v); });
  svg.appendChild(og); groups.push(og);
  ensureStyle('v2-misc', CSS);
  setupAnim(svg, spec, ctx, (Aw) => {
    groups.forEach((g, gi) => {
      Array.from(g.children).forEach((c, i) => {
        c.style.transformBox = 'fill-box'; c.style.transformOrigin = '50% 50%';
        Aw(c, [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 350, delay: gi * 450 + i * 90 });
      });
    });
  }, spec.anim === 'sort' || !!spec.anim);
  return svg;
}

/* --------------------------------------------------------------- grid100 */
function grid100(spec, ctx) {
  const n = int(spec.n, 100, 1, 200);
  const marks = arr(spec.mark).filter((m) => m && num(m.multipleOf, 0) > 0).map((m, i) => ({ k: int(m.multipleOf, 2, 1), color: m.color || pal(ctx, i + 1) }));
  const circles = new Set(arr(spec.circle).map(Number));
  const hide = new Set(arr(spec.hide).map(Number));
  const cs = 33, x0 = 15, y0 = 10;
  const rows = Math.ceil(n / 10);
  const H = rows * cs + y0 * 2;
  const label = `Bảng số từ 1 đến ${n}, mỗi hàng 10 số` + (marks.length ? '; ' + marks.map((m) => `các bội của ${m.k} được tô màu`).join(', ') : '') + (hide.size ? `; có ${hide.size} ô ẩn dấu ?` : '') + '.';
  const svg = svgRoot(360, H, label, 'v-grid100', 480);
  const painted = [];
  for (let v = 1; v <= n; v++) {
    const i = v - 1, c = i % 10, r = Math.floor(i / 10);
    const x = x0 + c * cs, y = y0 + r * cs;
    const ms = marks.filter((m) => v % m.k === 0);
    const g = el('g', null);
    g.appendChild(el('rect', { x, y, width: cs, height: cs, fill: '#FFFFFF', stroke: '#B8C1D6', 'stroke-width': 1.6 }));
    const q = hide.has(v);
    if (ms.length && !q) {
      const f = el('rect', { x: x + 1, y: y + 1, width: cs - 2, height: cs - 2, fill: ms[0].color, 'fill-opacity': 0.6 });
      g.appendChild(f);
      for (let j = 1; j < ms.length; j++) g.appendChild(el('rect', { x: x + 4 + (j - 1) * 3, y: y + 4 + (j - 1) * 3, width: cs - 8 - (j - 1) * 6, height: cs - 8 - (j - 1) * 6, rx: 4, fill: 'none', stroke: ms[j].color, 'stroke-width': 3 }));
      painted.push(f);
    }
    g.appendChild(el('text', { x: x + cs / 2, y: y + cs / 2 + 5.5, 'text-anchor': 'middle', 'font-size': v >= 100 ? 14 : 15, 'font-weight': ms.length ? 900 : 700, fill: q ? COL.accent : COL.ink, text: q ? '?' : String(v) }));
    if (q) g.appendChild(el('rect', { x: x + 2, y: y + 2, width: cs - 4, height: cs - 4, rx: 6, fill: 'none', stroke: COL.accent, 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }));
    if (circles.has(v)) g.appendChild(el('circle', { cx: x + cs / 2, cy: y + cs / 2, r: cs / 2 - 1.5, fill: 'none', stroke: '#EC7468', 'stroke-width': 3.5 }));
    svg.appendChild(g);
  }
  ensureStyle('v2-misc', CSS);
  setupAnim(svg, spec, ctx, (A) => {
    const d = stagger(painted.length, 1900, 80);
    painted.forEach((f, i) => A(f, [{ opacity: 0 }, { opacity: 0.6 }], { duration: 250, delay: i * d }));
  }, spec.anim === 'mark' || !!spec.anim);
  return svg;
}

/* ---------------------------------------------------------------- balance */
function hash(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.codePointAt(0)) | 0; return Math.abs(h); }

function balance(spec, ctx) {
  const L = arr(spec.left).filter((x) => x && typeof x === 'object'), R = arr(spec.right).filter((x) => x && typeof x === 'object');
  const sum = (a) => a.reduce((s, x) => s + num(x.value, NaN), 0);
  let tilt = ['left', 'right', 'level'].includes(spec.tilt) ? spec.tilt : null;
  if (!tilt) {
    const sl = sum(L), sr = sum(R);
    tilt = isFinite(sl) && isFinite(sr) ? (sl > sr ? 'left' : sl < sr ? 'right' : 'level') : 'level';
  }
  const theta = 13;
  const phiF = tilt === 'left' ? -theta : tilt === 'right' ? theta : 0; // phi>0: bên phải thấp hơn
  const Lb = 112, pY = 66, px = 180;
  const perRow = 3, cs = 40;
  const rowsOf = (a) => Math.max(1, Math.ceil(a.length / perRow));
  const rowsMax = Math.max(rowsOf(L), rowsOf(R));
  const S = 36 + rowsMax * 44;
  const maxDrop = Lb * Math.sin(theta * Math.PI / 180);
  const H = pY + maxDrop + S + 18 + 44;
  const itemTxt = (a) => a.map((x) => (x.label != null ? x.label : x.value != null ? x.value : x.emoji || '')).join(', ');
  const label = `Cân đĩa. ${tilt === 'level' ? 'Hai bên thăng bằng' : tilt === 'left' ? 'Bên trái nặng hơn, đĩa trái thấp xuống' : 'Bên phải nặng hơn, đĩa phải thấp xuống'}. Đĩa trái: ${itemTxt(L) || 'trống'}. Đĩa phải: ${itemTxt(R) || 'trống'}.`;
  const svg = svgRoot(360, H, label, 'v-balance', 440);
  // chân đế
  svg.appendChild(el('rect', { x: px - 7, y: pY, width: 14, height: H - pY - 20, rx: 5, fill: '#5D6985' }));
  svg.appendChild(el('path', { d: `M${px - 56} ${H - 6}Q${px - 50} ${H - 26} ${px - 20} ${H - 26}L${px + 20} ${H - 26}Q${px + 50} ${H - 26} ${px + 56} ${H - 6}Z`, fill: '#5D6985', stroke: COL.ink, 'stroke-width': 3, 'stroke-linejoin': 'round' }));
  const endPos = (side, phi) => { const a = phi * Math.PI / 180; return side < 0 ? [px - Lb * Math.cos(a), pY - Lb * Math.sin(a)] : [px + Lb * Math.cos(a), pY + Lb * Math.sin(a)]; };
  // đòn cân (vẽ nằm ngang, xoay bằng transform)
  const beam = el('g', { transform: `rotate(${phiF} ${px} ${pY})` });
  beam.appendChild(el('line', { x1: px - Lb, y1: pY, x2: px + Lb, y2: pY, stroke: COL.ink, 'stroke-width': 9, 'stroke-linecap': 'round' }));
  beam.appendChild(el('circle', { cx: px - Lb, cy: pY, r: 7, fill: COL.warn, stroke: COL.ink, 'stroke-width': 3 }));
  beam.appendChild(el('circle', { cx: px + Lb, cy: pY, r: 7, fill: COL.warn, stroke: COL.ink, 'stroke-width': 3 }));
  svg.appendChild(beam);

  const mkPan = (items, side) => {
    const [ex, ey] = endPos(side, phiF);
    const cols = Math.max(1, Math.min(perRow, items.length));
    const pw = Math.max(86, cols * cs + 14);
    const pxc = side < 0 ? px - Lb : px + Lb;
    const top = ey + S;
    const g = el('g', null);
    g.appendChild(el('line', { x1: ex, y1: ey, x2: pxc - pw / 2 + 4, y2: top, stroke: '#5D6985', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
    g.appendChild(el('line', { x1: ex, y1: ey, x2: pxc + pw / 2 - 4, y2: top, stroke: '#5D6985', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
    items.forEach((it, i) => {
      const r = Math.floor(i / perRow), c = i % perRow;
      const inRow = Math.min(perRow, items.length - r * perRow);
      const x = pxc + (c - (inRow - 1) / 2) * cs;
      const yb = top - 3 - r * 44; // đáy ô
      const txt = it.label != null ? String(it.label) : it.value != null ? String(it.value) : '';
      const h = hash(txt || it.emoji || i);
      if (it.emoji) {
        g.appendChild(el('text', { x, y: yb - (txt ? 17 : 8), 'text-anchor': 'middle', 'font-size': 28, text: it.emoji }));
        if (txt) g.appendChild(el('text', { x, y: yb, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 900, fill: COL.ink, text: txt }));
      } else {
        const col = pal(ctx, h % PAL.length), tc = textOn(col);
        const sh = h % 3, sz = 38;
        if (sh === 0) g.appendChild(el('rect', { x: x - sz / 2, y: yb - sz, width: sz, height: sz, rx: 8, fill: col, stroke: COL.ink, 'stroke-width': 2.5 }));
        else if (sh === 1) g.appendChild(el('circle', { cx: x, cy: yb - sz / 2, r: sz / 2, fill: col, stroke: COL.ink, 'stroke-width': 2.5 }));
        else g.appendChild(el('path', { d: `M${x} ${yb - sz}L${x + sz / 2} ${yb}L${x - sz / 2} ${yb}Z`, fill: col, stroke: COL.ink, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
        g.appendChild(el('text', { x, y: yb - (sh === 2 ? 6 : sz / 2 - 6), 'text-anchor': 'middle', 'font-size': txt.length > 3 ? 14 : 18, 'font-weight': 900, fill: tc, text: txt }));
      }
    });
    g.appendChild(el('path', { d: `M${pxc - pw / 2} ${top}H${pxc + pw / 2}Q${pxc + pw / 2 - 8} ${top + 18} ${pxc} ${top + 18}Q${pxc - pw / 2 + 8} ${top + 18} ${pxc - pw / 2} ${top}Z`, fill: '#FBDF86', stroke: COL.ink, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }));
    svg.appendChild(g);
    return g;
  };
  const gl = mkPan(L, -1), gr = mkPan(R, 1);
  svg.appendChild(el('circle', { cx: px, cy: pY, r: 11, fill: COL.accent, stroke: COL.ink, 'stroke-width': 3.5 }));

  ensureStyle('v2-misc', CSS);
  setupAnim(svg, spec, ctx, (A) => {
    const phis = [0, phiF * 1.22, phiF * 0.9, phiF];
    const offs = [0, 0.5, 0.74, 1];
    beam.style.transformOrigin = `${px}px ${pY}px`;
    A(beam, phis.map((p, i) => ({ transform: `rotate(${p}deg)`, offset: offs[i] })), { duration: 1700, easing: 'ease-in-out' });
    [[gl, -1], [gr, 1]].forEach(([g, side]) => {
      const f = endPos(side, phiF);
      A(g, phis.map((p, i) => { const e = endPos(side, p); return { transform: `translate(${(e[0] - f[0]).toFixed(2)}px,${(e[1] - f[1]).toFixed(2)}px)`, offset: offs[i] }; }), { duration: 1700, easing: 'ease-in-out' });
    });
  }, spec.anim === 'tilt' || !!spec.anim);
  return svg;
}

/* ------------------------------------------------------------------ table */
function table(spec, ctx) {
  const headers = arr(spec.headers).map(String);
  const rows = arr(spec.rows).map((r) => arr(r));
  const hide = new Set(arr(spec.hide).filter(Array.isArray).map((p) => p[0] + ',' + p[1]));
  const hl = new Set(arr(spec.highlight).filter(Array.isArray).map((p) => p[0] + ',' + p[1]));
  ensureStyle('v2-misc', CSS);
  const wrap = document.createElement('div');
  wrap.className = 'v-table-wrap';
  wrap.setAttribute('role', 'img');
  const parts = rows.map((r, ri) => r.map((c, ci) => `${headers[ci] || 'cột ' + (ci + 1)}: ${hide.has(ri + ',' + ci) ? 'ô trống' : c}`).join(', '));
  wrap.setAttribute('aria-label', 'Bảng số liệu. ' + parts.map((p, i) => `Hàng ${i + 1}: ${p}.`).join(' '));
  const t = document.createElement('table');
  t.className = 'v-table-t';
  t.setAttribute('aria-hidden', 'true');
  if (headers.length) {
    const th = document.createElement('thead'), tr = document.createElement('tr');
    headers.forEach((h) => { const c = document.createElement('th'); c.textContent = h; tr.appendChild(c); });
    th.appendChild(tr); t.appendChild(th);
  }
  const tb = document.createElement('tbody');
  rows.forEach((r, ri) => {
    const tr = document.createElement('tr');
    const n = Math.max(r.length, headers.length);
    for (let ci = 0; ci < n; ci++) {
      const td = document.createElement('td');
      const key = ri + ',' + ci;
      if (hide.has(key)) { const q = document.createElement('span'); q.className = 'v-table-q'; q.textContent = '?'; td.appendChild(q); }
      else td.textContent = r[ci] == null ? '' : String(r[ci]);
      if (hl.has(key)) td.classList.add('v-table-hl');
      tr.appendChild(td);
    }
    tb.appendChild(tr);
  });
  t.appendChild(tb);
  wrap.appendChild(t);
  wrap.replay = () => {};
  return wrap;
}

/* ------------------------------------------------------------ factorpairs */
function factorpairs(spec, ctx) {
  const n = int(spec.n, 12, 1, 144);
  const pairs = [];
  for (let a = 1; a * a <= n; a++) if (n % a === 0) pairs.push([a, n / a]);
  const label = `Các cách xếp ${n} chấm thành mảng: ` + pairs.map(([a, b]) => `${a} hàng ${b} cột`).join('; ') + '.';
  // bố cục dòng chảy
  const cards = pairs.map(([a, b], i) => {
    const half = b <= 9;
    const cw = half ? 168 : 344;
    const ds = Math.min(16, (cw - 20) / b);
    const ch = 32 + a * ds + 14;
    return { a, b, half, cw, ds, ch, i };
  });
  let x = 8, y = 6, rowH = 0;
  cards.forEach((c) => {
    if (x + c.cw > 352 + 0.1 && x > 8) { x = 8; y += rowH + 8; rowH = 0; }
    c.x = x; c.y = y; x += c.cw + 8; rowH = Math.max(rowH, c.ch);
    if (!c.half) { x = 8; y += rowH + 8; rowH = 0; }
  });
  const H = y + rowH + 6;
  const svg = svgRoot(360, H, label, 'v-factorpairs', 480);
  const gs = [];
  cards.forEach((c) => {
    const col = pal(ctx, c.i);
    const g = el('g', null);
    g.appendChild(el('rect', { x: c.x, y: c.y, width: c.cw, height: c.ch, rx: 14, fill: '#FFFFFF', stroke: COL.line, 'stroke-width': 3 }));
    const t = el('text', { x: c.x + c.cw / 2, y: c.y + 24, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 900, fill: COL.ink });
    [[String(c.a), COL.accent], [' × ', COL.ink], [String(c.b), COL.primary], [' = ' + n, COL.ink]].forEach(([s, f]) => {
      const ts = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      ts.textContent = s; ts.setAttribute('style', `fill:${f}`);
      t.appendChild(ts);
    });
    g.appendChild(t);
    const dw = c.b * c.ds, dx0 = c.x + (c.cw - dw) / 2, dy0 = c.y + 36;
    for (let r = 0; r < c.a; r++) for (let k = 0; k < c.b; k++) {
      g.appendChild(el('circle', { cx: dx0 + k * c.ds + c.ds / 2, cy: dy0 + r * c.ds + c.ds / 2, r: Math.max(1.5, c.ds * 0.38), fill: r % 2 === 0 ? COL.accent : COL.primary, 'fill-opacity': 0.9 }));
    }
    svg.appendChild(g); gs.push(g);
  });
  ensureStyle('v2-misc', CSS);
  setupAnim(svg, spec, ctx, (A) => {
    const d = stagger(gs.length, 1500, 350);
    gs.forEach((g, i) => {
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = '50% 50%';
      A(g, [{ opacity: 0, transform: 'scale(.85)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: i * d });
    });
  }, spec.anim === 'reveal' || !!spec.anim);
  return svg;
}

/* ----------------------------------------------------------------- bubble */
function bubble(spec, ctx) {
  ensureStyle('v2-misc', CSS);
  const who = spec.who != null ? String(spec.who) : '';
  const text = spec.text != null ? String(spec.text) : '';
  const emoji = typeof spec.emoji === 'string' && spec.emoji ? spec.emoji : '🧒';
  const root = document.createElement('div');
  root.className = 'v-bubble-root';
  root.setAttribute('role', 'img');
  root.setAttribute('aria-label', `${who || 'Bạn nhỏ'} nói: ${text}`);
  const w = document.createElement('div'); w.className = 'v-bubble-who';
  const av = document.createElement('div'); av.className = 'v-bubble-av'; av.textContent = emoji;
  const nm = document.createElement('div'); nm.className = 'v-bubble-name'; nm.textContent = who;
  w.appendChild(av); w.appendChild(nm);
  const t = document.createElement('div'); t.className = 'v-bubble-txt'; t.textContent = text;
  root.appendChild(w); root.appendChild(t);
  root.replay = () => {};
  return root;
}

/* ------------------------------------------------------------------ emoji */
function emoji(spec, ctx) {
  ensureStyle('v2-misc', CSS);
  const text = spec.text != null ? String(spec.text) : '';
  const d = document.createElement('div');
  d.className = 'v-emoji-root';
  d.setAttribute('role', 'img');
  d.setAttribute('aria-label', 'Hình biểu tượng: ' + text);
  d.textContent = text;
  d.replay = () => {};
  return d;
}

export default {
  kinds: ['venn', 'grid100', 'balance', 'table', 'factorpairs', 'bubble', 'emoji'],
  render(spec, ctx) {
    const k = spec && spec.kind;
    const fn = { venn, grid100, balance, table, factorpairs, bubble, emoji }[k];
    return safe(k, spec, ctx, (s, c) => (fn ? fn(s, c) : null));
  },
};
