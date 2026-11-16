// fracwall, fracshape, fracset — hình phân số
import { COL, PAL, pal, el, svgRoot, safe, num, int, arr, textOn, fracText, uid, ensureStyle, setupAnim, stagger } from './_v2.js';

const CSS = `
.v-fracwall,.v-fracshape,.v-fracset{-webkit-user-select:none;user-select:none}
.v-fracwall text,.v-fracshape text,.v-fracset text{font-family:inherit}
`;

// 12 màu cho 12 hàng tường (tự chọn, dễ phân biệt)
const WALL = ['#E8447E', '#D6334F', '#F0503C', '#F27A2A', '#F5A524', '#E3C21F', '#9BD43B', '#3FCB5C', '#22C792', '#3CCFC4', '#4AA8F2', '#A55DE8'];

/* ---------------------------------------------------------------- fracwall */
function fracwall(spec, ctx) {
  const rows = int(spec.rows, 6, 1, 12);
  const hl = arr(spec.highlight).filter((h) => h && h.row >= 1 && h.row <= rows)
    .map((h) => ({ row: int(h.row, 1, 1, rows), cells: int(h.cells, 1, 1, int(h.row, 1, 1, rows)) }));
  const cmp = Array.isArray(spec.compare) ? spec.compare.map((r) => int(r, 1, 1, rows)).slice(0, 2) : [];
  // so sánh: tự tô 1 ô cho hàng chưa có highlight
  cmp.forEach((r) => { if (!hl.find((h) => h.row === r)) hl.push({ row: r, cells: 1 }); });
  const hlBy = {};
  hl.forEach((h) => { hlBy[h.row] = h.cells; });
  const hasHL = hl.length > 0;

  const x0 = 6, W = 348;
  const rowH = rows <= 6 ? 46 : rows <= 9 ? 40 : 38, gap = 3;
  const H = rows * (rowH + gap) + 10;
  const parts = hl.map((h) => `hàng ${h.row} tô ${h.cells} ô`);
  const label = `Tường phân số ${rows} hàng: hàng 1 là cả thanh, hàng k chia thành k phần bằng nhau.` +
    (parts.length ? ' Đang chỉ ' + parts.join(', ') + '.' : '') +
    (cmp.length === 2 ? ` So sánh hàng ${cmp[0]} và hàng ${cmp[1]}.` : '');
  const svg = svgRoot(360, H, label, 'v-fracwall', 480);
  const rowGs = [];
  for (let r = 1; r <= rows; r++) {
    const y = 5 + (r - 1) * (rowH + gap);
    const col = WALL[(r - 1) % WALL.length];
    const tc = textOn(col);
    const g = el('g', { class: 'v-fracwall-row' });
    const cw = W / r;
    const nh = hlBy[r] || 0;
    for (let i = 0; i < r; i++) {
      const on = !hasHL || i < nh;
      const cell = el('g', { opacity: on ? 1 : (hlBy[r] ? 0.42 : 0.3) });
      const rx = r === 1 ? 10 : (i === 0 || i === r - 1 ? 8 : 3);
      cell.appendChild(el('rect', {
        x: x0 + i * cw + 1, y, width: cw - 2, height: rowH, rx,
        fill: col, stroke: (hasHL && i < nh) ? COL.ink : '#fff', 'stroke-width': (hasHL && i < nh) ? 3 : 2,
      }));
      const cx = x0 + i * cw + cw / 2, cy = y + rowH / 2;
      if (r === 1) {
        cell.appendChild(el('text', { x: cx, y: cy + 8, 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 900, fill: tc, text: '1' }));
      } else {
        fracText(cell, cx, cy, 1, r, 14, tc, 800);
      }
      g.appendChild(cell);
    }
    svg.appendChild(g);
    rowGs.push(g);
  }
  // vạch dọc so sánh
  if (cmp.length) {
    const rMin = Math.min(...cmp), rMax = Math.max(...cmp);
    const yTop = 5 + (rMin - 1) * (rowH + gap) - 4;
    const yBot = 5 + (rMax - 1) * (rowH + gap) + rowH + 4;
    const xs = cmp.map((r) => x0 + W * (hlBy[r] || 1) / r);
    const same = cmp.length === 2 && Math.abs(xs[0] - xs[1]) < 0.5;
    const lines = [];
    (same ? [xs[0]] : xs).forEach((x, i) => {
      const l = el('g', { class: 'v-fracwall-cmp' });
      l.appendChild(el('line', { x1: x, x2: x, y1: yTop, y2: yBot, stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round' }));
      l.appendChild(el('line', { x1: x, x2: x, y1: yTop, y2: yBot, stroke: i === 0 ? COL.ink : '#B05CFF', 'stroke-width': 3.5, 'stroke-dasharray': '7 6', 'stroke-linecap': 'round' }));
      svg.appendChild(l);
      lines.push(l);
    });
    svg._cmp = lines;
  }

  ensureStyle('v2-fraction', CSS);
  setupAnim(svg, spec, ctx, (A) => {
    const d = stagger(rowGs.length, 700, 90);
    rowGs.forEach((g, i) => A(g, [{ transform: 'translateX(-60px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 450, delay: i * d, easing: 'cubic-bezier(.2,.9,.3,1)' }));
    (svg._cmp || []).forEach((l) => A(l, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 900 }));
  }, spec.anim === 'slide' || !!spec.anim);
  return svg;
}

/* --------------------------------------------------------------- fracshape */
// Vị trí các vạch chia (0..1): đều hoặc KHÔNG đều
function bounds(den, unequal) {
  const b = [0];
  if (!unequal || den < 2) {
    for (let i = 1; i <= den; i++) b.push(i / den);
    return b;
  }
  const w = [];
  for (let i = 0; i < den; i++) w.push((i % 2 === 0 ? 0.55 : 1.45) * (1 + 0.18 * (i % 3)));
  const s = w.reduce((a, c) => a + c, 0);
  let acc = 0;
  for (let i = 0; i < den; i++) { acc += w[i]; b.push(acc / s); }
  b[den] = 1;
  return b;
}

function sectorPath(cx, cy, r, a0, a1) {
  const p = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${cx} ${cy}L${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z`;
}

function fracshape(spec, ctx) {
  const den = int(spec.den, 4, 1, 24);
  const nm = int(spec.num, 1, 0, den);
  const shape = ['rect', 'circle', 'bar', 'jar'].includes(spec.shape) ? spec.shape : 'rect';
  const unequal = spec.cut === 'unequal';
  const showLabel = !!spec.label;
  const fillCol = pal(ctx, 0);
  const b = bounds(den, unequal);
  const id = uid(ctx, 'fs');
  const kindVi = { rect: 'hình chữ nhật', circle: 'hình tròn', bar: 'thanh', jar: 'bình' }[shape];
  const label = `${kindVi[0].toUpperCase() + kindVi.slice(1)} chia thành ${den} phần ${unequal ? 'KHÔNG bằng nhau' : 'bằng nhau'}, tô ${nm} phần.`;
  const W = 360;
  const areaW = showLabel ? 250 : 340, ax = showLabel ? 12 : 10;
  let H, svg;
  const base = [], fills = [], outlines = [];

  if (shape === 'rect' || shape === 'bar') {
    const h = shape === 'rect' ? 110 : 46;
    H = shape === 'rect' ? 150 : 90;
    svg = svgRoot(W, H, label, 'v-fracshape', 440);
    const y = (H - h) / 2, x = ax + 4, w = areaW - 8;
    const rx = shape === 'bar' ? 14 : 12;
    const cid = id + 'c';
    const defs = el('defs', null, [el('clipPath', { id: cid }, [el('rect', { x, y, width: w, height: h, rx })])]);
    svg.appendChild(defs);
    const g = el('g', { 'clip-path': `url(#${cid})` });
    g.appendChild(el('rect', { x, y, width: w, height: h, fill: '#fff' }));
    for (let i = 0; i < den; i++) {
      if (i < nm) {
        const r = el('rect', { x: x + w * b[i], y, width: w * (b[i + 1] - b[i]) + 0.5, height: h, fill: fillCol });
        g.appendChild(r); fills.push(r);
      }
    }
    svg.appendChild(g);
    for (let i = 1; i < den; i++) {
      const l = el('line', { x1: x + w * b[i], x2: x + w * b[i], y1: y, y2: y + h, stroke: COL.ink, 'stroke-width': 3, 'stroke-linecap': 'round' });
      svg.appendChild(l);
    }
    svg.appendChild(el('rect', { x, y, width: w, height: h, rx, fill: 'none', stroke: COL.ink, 'stroke-width': 4 }));
    svg._mid = [x + w + 40, H / 2];
  } else if (shape === 'circle') {
    H = 190;
    svg = svgRoot(W, H, label, 'v-fracshape', 400);
    const cx = showLabel ? 128 : 180, cy = 95, r = 82;
    const a0 = -Math.PI / 2;
    if (den === 1) {
      svg.appendChild(el('circle', { cx, cy, r, fill: '#fff' }));
      if (nm >= 1) { const c = el('circle', { cx, cy, r, fill: fillCol }); svg.appendChild(c); fills.push(c); }
      svg.appendChild(el('circle', { cx, cy, r, fill: 'none', stroke: COL.ink, 'stroke-width': 4 }));
    } else {
      svg.appendChild(el('circle', { cx, cy, r, fill: '#fff' }));
      for (let i = 0; i < nm; i++) {
        const p = el('path', { d: sectorPath(cx, cy, r, a0 + b[i] * Math.PI * 2, a0 + b[i + 1] * Math.PI * 2), fill: fillCol });
        svg.appendChild(p); fills.push(p);
      }
      for (let i = 0; i < den; i++) {
        svg.appendChild(el('line', { x1: cx, y1: cy, x2: cx + r * Math.cos(a0 + b[i] * Math.PI * 2), y2: cy + r * Math.sin(a0 + b[i] * Math.PI * 2), stroke: COL.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }));
      }
      svg.appendChild(el('circle', { cx, cy, r, fill: 'none', stroke: COL.ink, 'stroke-width': 4 }));
    }
    svg._mid = [cx + r + 48, cy];
  } else { // jar
    H = 220;
    svg = svgRoot(W, H, label, 'v-fracshape', 380);
    const cxm = showLabel ? 125 : 180, bw = 120;
    const x = cxm - bw / 2, yT = 34, yB = 202, h = yB - yT;
    const body = `M${x} ${yT}L${x} ${yB - 22}Q${x} ${yB} ${x + 22} ${yB}L${x + bw - 22} ${yB}Q${x + bw} ${yB} ${x + bw} ${yB - 22}L${x + bw} ${yT}Z`;
    const cid = id + 'c';
    svg.appendChild(el('defs', null, [el('clipPath', { id: cid }, [el('path', { d: body })])]));
    svg.appendChild(el('path', { d: body, fill: '#fff' }));
    const g = el('g', { 'clip-path': `url(#${cid})` });
    for (let i = 0; i < nm; i++) {
      const y1 = yB - h * b[i + 1], y0 = yB - h * b[i];
      const r = el('rect', { x: x - 2, y: y1, width: bw + 4, height: y0 - y1 + 0.5, fill: fillCol, 'fill-opacity': 0.85 });
      g.appendChild(r); fills.push(r);
    }
    svg.appendChild(g);
    for (let i = 1; i < den; i++) {
      const y = yB - h * b[i];
      svg.appendChild(el('line', { x1: x, x2: x + bw, y1: y, y2: y, stroke: COL.ink, 'stroke-width': 3 }));
    }
    svg.appendChild(el('path', { d: body, fill: 'none', stroke: COL.ink, 'stroke-width': 4, 'stroke-linejoin': 'round' }));
    svg.appendChild(el('rect', { x: x - 6, y: yT - 10, width: bw + 12, height: 12, rx: 6, fill: '#fff', stroke: COL.ink, 'stroke-width': 4 }));
    svg._mid = [x + bw + 62, (yT + yB) / 2];
  }

  if (showLabel) {
    const [lx, ly] = svg._mid;
    fracText(svg, Math.min(lx, 318), ly, nm, den, 30, COL.primary, 900);
  }

  ensureStyle('v2-fraction', CSS);
  setupAnim(svg, spec, ctx, (A) => {
    const d = stagger(fills.length, 1200, 260);
    fills.forEach((f, i) => {
      if (shape === 'jar') f.style.transformBox = 'fill-box', f.style.transformOrigin = '50% 100%';
      A(f, shape === 'jar' ? [{ transform: 'scaleY(0)', opacity: 0 }, { transform: 'none', opacity: 1 }] : [{ opacity: 0 }, { opacity: 1 }],
        { duration: 400, delay: i * d });
    });
  }, spec.anim === 'fill' || !!spec.anim);
  return svg;
}

/* ---------------------------------------------------------------- fracset */
function fracset(spec, ctx) {
  const total = int(spec.total, 12, 1, 60);
  const den = int(spec.den, 4, 1, 12);
  const nm = int(spec.num, 1, 0, den);
  const emoji = typeof spec.emoji === 'string' && spec.emoji ? spec.emoji : '🍎';
  const g = Math.max(1, Math.ceil(total / den)); // số vật mỗi nhóm
  const label = `${total} vật chia thành ${den} nhóm bằng nhau, mỗi nhóm ${g} vật. Tô ${nm} nhóm: phân số ${nm} phần ${den} của ${total}.`;
  const gcols = den <= 4 ? den : den <= 8 ? Math.ceil(den / 2) : 4;
  const grows = Math.ceil(den / gcols);
  const padX = 10, gapX = 10, gapY = 10;
  const gw = (360 - padX * 2 - gapX * (gcols - 1)) / gcols;
  // cỡ emoji và số cột trong 1 nhóm
  let ic = Math.min(g, Math.max(1, Math.floor((gw - 12) / 24)));
  if (g > 3) ic = Math.min(ic, Math.ceil(Math.sqrt(g * 1.6)));
  const irows = Math.ceil(g / ic);
  const es = Math.min(30, (gw - 12) / ic);
  const gh = irows * es + 14;
  const capH = 56;
  const H = padX + grows * gh + (grows - 1) * gapY + capH + 4;
  const svg = svgRoot(360, H, label, 'v-fracset', 460);
  const boxes = [], hiBoxes = [], items = [];
  for (let k = 0; k < den; k++) {
    const gx = padX + (k % gcols) * (gw + gapX);
    const gy = padX + Math.floor(k / gcols) * (gh + gapY);
    const on = k < nm;
    const grp = el('g', null);
    const box = el('rect', { x: gx, y: gy, width: gw, height: gh, rx: 14, fill: on ? 'rgba(255,197,49,.38)' : 'rgba(255,255,255,.7)', stroke: on ? COL.accent : '#9A97B0', 'stroke-width': on ? 4 : 2.5, 'stroke-dasharray': on ? '' : '7 6' });
    grp.appendChild(box);
    boxes.push(box); if (on) hiBoxes.push(box);
    for (let j = 0; j < g; j++) {
      const idx = k * g + j;
      if (idx >= total) break;
      const cx = gx + (gw - ic * es) / 2 + (j % ic) * es + es / 2;
      const cy = gy + 7 + Math.floor(j / ic) * es + es / 2;
      const t = el('text', { x: cx, y: cy + es * 0.34, 'text-anchor': 'middle', 'font-size': es * 0.95, text: emoji });
      grp.appendChild(t); items.push(t);
    }
    svg.appendChild(grp);
  }
  const cy = H - capH / 2;
  fracText(svg, 150, cy - 2, nm, den, 24, COL.primary, 900);
  svg.appendChild(el('text', { x: 186, y: cy + 9, 'font-size': 18, 'font-weight': 800, fill: COL.ink, text: `của ${total}` }));

  ensureStyle('v2-fraction', CSS);
  setupAnim(svg, spec, ctx, (A) => {
    const d = stagger(boxes.length, 900, 200);
    boxes.forEach((b, i) => {
      b.style.transformBox = 'fill-box'; b.style.transformOrigin = '50% 50%';
      A(b, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 350, delay: i * d });
    });
    hiBoxes.forEach((b, i) => A(b, [{ fill: 'rgba(255,255,255,.7)', stroke: '#9A97B0', strokeWidth: 2.5 }, { fill: 'rgba(255,197,49,.38)', stroke: 'var(--c-accent,#FF8A3D)', strokeWidth: 4 }],
      { duration: 400, delay: 1000 + i * 150, fill: 'both' }));
  }, spec.anim === 'group' || !!spec.anim);
  return svg;
}

export default {
  kinds: ['fracwall', 'fracshape', 'fracset'],
  render(spec, ctx) {
    const k = spec && spec.kind;
    return safe(k, spec, ctx, (s, c) => {
      if (k === 'fracwall') return fracwall(s, c);
      if (k === 'fracshape') return fracshape(s, c);
      if (k === 'fracset') return fracset(s, c);
      return null;
    });
  },
};
