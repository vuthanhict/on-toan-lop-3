// dots (mẫu chấm) + array (mảng hàng×cột) — Agent hình 1
import { C, FONT, s, num, clamp, fmt, palOf, inkOn, setupAnim, safe, svgRoot, ensureStyle, heartPath, starPoints } from './_v1.js';

const W = 360;
const EMOJI_FONT = `'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif`;

ensureStyle('v-dots-style', `
.v-dots-svg text,.v-array-svg text{font-family:${FONT};font-weight:700;}
.v-dots-svg .v-dots-pop,.v-array-svg .v-array-pop{transform-box:fill-box;transform-origin:center;}
`);

function shapeEl(shape, cx, cy, r, color, extra) {
  const base = Object.assign({ fill: color, stroke: 'rgba(0,0,0,.18)', 'stroke-width': 1.5, class: 'v-dots-pop' }, extra || {});
  switch (shape) {
    case 'square': return s('rect', Object.assign({ x: cx - r, y: cy - r, width: 2 * r, height: 2 * r, rx: r * 0.28 }, base));
    case 'heart': return s('path', Object.assign({ d: heartPath(cx, cy + r * 0.05, r * 0.82) }, base, { 'stroke-linejoin': 'round' }));
    case 'star': return s('polygon', Object.assign({ points: starPoints(cx, cy + r * 0.05, r * 1.02) }, base, { 'stroke-linejoin': 'round' }));
    default: return s('circle', Object.assign({ cx, cy, r }, base));
  }
}

// ------------------------------------------------------------------- dots
function renderDots(spec, ctx) {
  const pal = palOf(ctx);
  const pattern = ['square', 'rect', 'triangle', 'seq'].includes(spec.pattern) ? spec.pattern : (Array.isArray(spec.ns) ? 'seq' : (spec.rows || spec.cols ? 'rect' : 'square'));
  const shape = ['circle', 'square', 'heart', 'star'].includes(spec.shape) ? spec.shape : 'circle';
  const grow = spec.anim === 'grow';
  const layered = spec.colorBy === 'layer' || (pattern === 'seq' && spec.colorBy !== 'none');
  const toInt = (v, d, a, b) => clamp(Math.round(num(v, d)), a, b);

  // danh sách chấm: {x,y,r,color,grp}  (toạ độ theo hệ ô, chưa nhân tỉ lệ)
  const groups = []; // mỗi nhóm = 1 hình (square trong seq) -> {dots:[{c,r,layer}], cols, rows, caption, label}
  let captionText = '', captionParts = null;
  if (pattern === 'square') {
    const n = toInt(spec.n, 4, 1, 14);
    const dots = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) dots.push({ c, r, layer: Math.max(r, c) });
    groups.push({ dots, cols: n, rows: n, n });
    captionText = `${n} × ${n} = ${n * n}`;
    if (layered && n <= 9) captionParts = Array.from({ length: n }, (_, i) => 2 * i + 1);
  } else if (pattern === 'rect') {
    const rows = toInt(spec.rows, 3, 1, 12), cols = toInt(spec.cols, 4, 1, 14);
    const dots = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) dots.push({ c, r, layer: r });
    groups.push({ dots, cols, rows });
    captionText = `${rows} × ${cols} = ${rows * cols}`;
  } else if (pattern === 'triangle') {
    const n = toInt(spec.n, 4, 1, 12);
    const dots = [];
    for (let r = 0; r < n; r++) for (let c = 0; c <= r; c++) dots.push({ c: c + (n - 1 - r) / 2, r, layer: r });
    groups.push({ dots, cols: n, rows: n, tri: true });
    const tn = n * (n + 1) / 2;
    captionText = n <= 6 ? Array.from({ length: n }, (_, i) => i + 1).join(' + ') + ' = ' + tn : `1 + 2 + … + ${n} = ${tn}`;
  } else {
    let ns = (Array.isArray(spec.ns) ? spec.ns : [1, 2, 3]).map(v => toInt(v, 1, 1, 12)).slice(0, 8);
    if (!ns.length) ns = [1, 2, 3];
    ns.forEach(n => {
      const dots = [];
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) dots.push({ c, r, layer: Math.max(r, c) });
      groups.push({ dots, cols: n, rows: n, n, label: String(n * n) });
    });
  }

  // bố cục
  const gapG = pattern === 'seq' ? 12 : 0;
  const totalCols = groups.reduce((a, g) => a + g.cols, 0);
  const maxRows = Math.max(...groups.map(g => g.rows));
  const padX = 14;
  const cs = Math.min(40, (W - 2 * padX - gapG * (groups.length - 1)) / totalCols, 260 / maxRows);
  const rad = cs * 0.38;
  const gridW = totalCols * cs + gapG * (groups.length - 1);
  const x0 = (W - gridW) / 2;
  const topPad = 14;
  const gridH = maxRows * cs;
  const hasLabel = groups.some(g => g.label);
  const capH = (captionText ? 40 : 0) + (captionParts ? 40 : 0) + (hasLabel ? 34 : 0);
  const H = topPad + gridH + 10 + capH + 8;

  const aria = pattern === 'seq'
    ? `Dãy hình vuông chấm: ${groups.map(g => `${g.n}×${g.n} = ${g.n * g.n} chấm`).join('; ')}.`
    : pattern === 'triangle' ? `Hình tam giác chấm gồm ${groups[0].rows} hàng: ${captionText}.`
      : `Hình ${pattern === 'square' ? 'vuông' : 'chữ nhật'} chấm: ${captionText}.`;
  const svg = svgRoot(W, H, aria, 'v-dots-svg');

  const layerEls = []; // [{layer, groupIdx, els:[]}]
  let gx = x0;
  groups.forEach((g, gi) => {
    const baseY = topPad + (maxRows - g.rows) * cs; // dóng đáy
    const gW = g.cols * cs;
    const byLayer = new Map();
    g.dots.forEach(d => {
      const cx = gx + (d.c + 0.5) * cs, cy = baseY + (d.r + 0.5) * cs;
      const col = layered ? pal[d.layer % pal.length] : (pattern === 'seq' ? pal[gi % pal.length] : pal[0]);
      const el = shapeEl(shape, cx, cy, rad, col);
      svg.appendChild(el);
      if (!byLayer.has(d.layer)) byLayer.set(d.layer, []);
      byLayer.get(d.layer).push(el);
    });
    [...byLayer.keys()].sort((a, b) => a - b).forEach(L => layerEls.push({ L, gi, els: byLayer.get(L) }));
    if (g.label) {
      svg.appendChild(s('text', { x: gx + gW / 2, y: topPad + gridH + 8 + 26, 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: C.ink }, g.label));
    }
    gx += gW + gapG;
  });

  let yy = topPad + gridH + 10;
  if (hasLabel) yy += 34;
  const captionEls = [];
  if (captionParts) {
    // 1 + 3 + 5 + ... theo màu từng lớp
    const parts = captionParts;
    const fsz = 22;
    const widths = parts.map(p => String(p).length * 13 + 8);
    const sepW = 22;
    const tot = widths.reduce((a, b) => a + b, 0) + sepW * (parts.length - 1);
    let xx = (W - tot) / 2;
    const g = s('g', { class: 'v-dots-cap' });
    parts.forEach((p, i) => {
      if (i) { g.appendChild(s('text', { x: xx + sepW / 2, y: yy + 27, 'text-anchor': 'middle', 'font-size': fsz, 'font-weight': 800, fill: C.ink }, '+')); xx += sepW; }
      g.appendChild(s('rect', { x: xx, y: yy + 6, width: widths[i], height: 28, rx: 14, fill: pal[i % pal.length] }));
      g.appendChild(s('text', { x: xx + widths[i] / 2, y: yy + 27, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: inkOn(pal[i % pal.length]) }, String(p)));
      xx += widths[i];
    });
    svg.appendChild(g);
    captionEls.push(g);
    yy += 40;
  }
  if (captionText) {
    const t = s('text', { x: W / 2, y: yy + 28, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: C.ink }, captionText);
    svg.appendChild(t);
    captionEls.push(t);
  }

  setupAnim(svg, ctx, spec, (A) => {
    const L = layerEls.length;
    const step = Math.min(0.42, 1.9 / Math.max(1, L));
    layerEls.forEach((le, idx) => {
      const base = idx * step * 1000;
      const isNew = grow && layered; // lớp mới nảy mạnh hơn
      le.els.forEach((el, k) => {
        A(el, [{ opacity: 0, transform: 'scale(0.1)' }, { opacity: 1, transform: `scale(${isNew ? 1.35 : 1.15})`, offset: 0.7 }, { opacity: 1, transform: 'scale(1)' }],
          { delay: base + k * Math.min(55, 260 / le.els.length), duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      });
    });
    captionEls.forEach((el, i) => A(el, [{ opacity: 0 }, { opacity: 1 }], { delay: Math.min(2000, L * step * 1000 + 100 + i * 150), duration: 350 }));
  });
  return svg;
}

// ------------------------------------------------------------------ array
function renderArray(spec, ctx) {
  const pal = palOf(ctx);
  const rows = clamp(Math.round(num(spec.rows, 3)), 1, 12);
  const cols = clamp(Math.round(num(spec.cols, 4)), 1, 14);
  const groupBy = spec.groupBy === 'rows' || spec.groupBy === 'cols' ? spec.groupBy : null;
  const showEq = !!spec.showEq;
  const emoji = typeof spec.emoji === 'string' && spec.emoji.trim() ? spec.emoji.trim() : '';
  const hlRaw = num(spec.highlight, NaN);
  const hl = isFinite(hlRaw) ? clamp(Math.round(hlRaw), 0, rows) : rows;

  const leftM = showEq ? 62 : 14;
  const rightM = 14;
  const topM = showEq ? 34 : 12;
  const cs = Math.min(46, (W - leftM - rightM) / cols, 270 / rows);
  const gridW = cols * cs, gridH = rows * cs;
  const x0 = leftM + (W - leftM - rightM - gridW) / 2;
  const prod = rows * cols;
  const eqH = showEq ? (groupBy ? 84 : 50) : 0;
  const H = topM + gridH + 10 + eqH + 6;

  const aria = `Mảng ${rows} hàng, ${cols} cột` + (showEq ? `: ${rows} × ${cols} = ${prod}` : '') + (groupBy ? `, tô màu theo ${groupBy === 'rows' ? 'hàng' : 'cột'}` : '') + '.';
  const svg = svgRoot(W, H, aria, 'v-array-svg');
  const colorOf = (r, c) => groupBy === 'rows' ? pal[r % pal.length] : groupBy === 'cols' ? pal[c % pal.length] : pal[0];

  if (groupBy) {
    const n = groupBy === 'rows' ? rows : cols;
    for (let i = 0; i < n; i++) {
      const col = pal[i % pal.length];
      const attr = groupBy === 'rows'
        ? { x: x0 - 3, y: topM + i * cs + 2, width: gridW + 6, height: cs - 4 }
        : { x: x0 + i * cs + 2, y: topM - 3, width: cs - 4, height: gridH + 6 };
      svg.appendChild(s('rect', Object.assign({ rx: Math.min(14, cs / 2 - 2), fill: col, opacity: 0.2, stroke: col, 'stroke-width': 2 }, attr)));
    }
  }
  const items = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cx = x0 + (c + 0.5) * cs, cy = topM + (r + 0.5) * cs;
    const lit = r < hl;
    let el;
    if (emoji) {
      el = s('text', { x: cx, y: cy + cs * 0.27, 'text-anchor': 'middle', 'font-size': cs * 0.78, class: 'v-array-pop', opacity: lit ? 1 : 0.3, style: { fontFamily: EMOJI_FONT, fontWeight: 400 } }, emoji);
    } else {
      el = s('circle', { cx, cy, r: cs * 0.36, fill: colorOf(r, c), stroke: 'rgba(0,0,0,.18)', 'stroke-width': 1.5, class: 'v-array-pop', opacity: lit ? 1 : 0.3 });
    }
    svg.appendChild(el);
    items.push({ el, r, c });
  }
  const labelEls = [];
  if (showEq) {
    const lt = s('text', { x: x0 + gridW / 2, y: topM - 12, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: C.ink }, `${cols} cột`);
    const ll = s('text', { x: 8, y: topM + gridH / 2 + 5, 'font-size': 16, 'font-weight': 800, fill: C.ink }, `${rows} hàng`);
    svg.appendChild(lt); svg.appendChild(ll);
    labelEls.push(lt, ll);
  }
  const eqEls = [];
  if (showEq) {
    let y = topM + gridH + 10;
    const eq = s('text', { x: W / 2, y: y + 34, 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 800, fill: C.ink }, `${rows} × ${cols} = ${prod}`);
    svg.appendChild(eq); eqEls.push(eq);
    if (groupBy) {
      const n = groupBy === 'rows' ? rows : cols, v = groupBy === 'rows' ? cols : rows;
      const txt = n <= 6 ? Array.from({ length: n }, () => v).join(' + ') + ' = ' + prod : `${n} nhóm ${v} = ${prod}`;
      const t2 = s('text', { x: W / 2, y: y + 72, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: C.ink, opacity: 0.85 }, txt);
      svg.appendChild(t2); eqEls.push(t2);
    }
  }

  setupAnim(svg, ctx, spec, (A) => {
    const byCol = groupBy === 'cols';
    const groupsN = byCol ? cols : rows;
    const perG = byCol ? rows : cols;
    const gstep = Math.min(0.3, 1.8 / groupsN);
    const istep = Math.min(0.05, gstep / Math.max(1, perG) * 1.2);
    items.forEach(({ el, r, c }) => {
      const gi = byCol ? c : r, ii = byCol ? r : c;
      const lit = r < hl;
      A(el, [{ opacity: 0, transform: 'scale(.1)' }, { opacity: lit ? 1 : 0.3, transform: 'scale(1)' }], { delay: (gi * gstep + ii * istep) * 1000, duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    });
    labelEls.forEach(el => A(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 }));
    eqEls.forEach((el, i) => A(el, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { delay: Math.min(2000, groupsN * gstep * 1000 + 150 + i * 250), duration: 400 }));
  });
  return svg;
}

export default {
  kinds: ['dots', 'array'],
  render(spec, ctx) {
    const kind = spec && spec.kind === 'array' ? 'array' : 'dots';
    return safe(kind, kind === 'array' ? renderArray : renderDots)(spec, ctx);
  },
};
