// numberline + sequence — Agent hình 1
import { C, PAL, FONT, s, num, clamp, fmt, say, palOf, inkOn, setupAnim, safe, svgRoot, ensureStyle } from './_v1.js';

const W = 360;

ensureStyle('v-numberline-style', `
.v-numberline-svg text,.v-sequence-svg text{font-family:${FONT};font-weight:700;}
.v-numberline-svg .v-numberline-pop,.v-sequence-svg .v-sequence-pop{transform-box:fill-box;transform-origin:center;}
`);

const estW = (str, fs) => {
  let w = 0;
  for (const ch of String(str)) w += (ch === ' ' ? 0.3 : /[0-9]/.test(ch) ? 0.56 : /[−\-+×÷]/.test(ch) ? 0.62 : 0.6) * fs;
  return w;
};

// ---------------------------------------------------------------- numberline
function renderNumberline(spec, ctx) {
  const pal = palOf(ctx);
  let min = num(spec.min, 0), max = num(spec.max, min + 10);
  if (min > max) [min, max] = [max, min];
  if (max === min) max = min + 1;
  const range = max - min;
  let step = num(spec.step, 1);
  if (!(step > 0)) step = 1;
  if (range / step > 240) step = Math.ceil(range / 200 / step) * step;
  let labelEvery = num(spec.labelEvery, step);
  if (!(labelEvery > 0)) labelEvery = step;
  if (labelEvery < step) labelEvery = step;

  const points = Array.isArray(spec.points) ? spec.points.filter(p => p && isFinite(num(p.at, NaN))) : [];
  const jumps = Array.isArray(spec.jumps) ? spec.jumps.filter(j => j && isFinite(num(j.from, NaN)) && isFinite(num(j.to, NaN))) : [];
  const rangeSpec = spec.range && isFinite(num(spec.range.from, NaN)) && isFinite(num(spec.range.to, NaN)) ? spec.range : null;
  const hop = spec.anim === 'hop' && jumps.length > 0;
  let marker = spec.marker && isFinite(num(spec.marker.at, NaN)) ? { at: num(spec.marker.at), emoji: spec.marker.emoji || '🐸' } : null;
  if (!marker && hop) marker = { at: num(jumps[jumps.length - 1].to), emoji: '🐸' };

  const padX = 28;
  const x = v => padX + (v - min) / range * (W - 2 * padX);
  const pxPerStep = (W - 2 * padX) * step / range;

  // chiều cao vùng trên (cung nhảy + marker)
  const levels = [];
  const spanOf = j => Math.abs(num(j.to) - num(j.from));
  jumps.forEach((j, i) => {
    const a = Math.min(num(j.from), num(j.to)), b = Math.max(num(j.from), num(j.to));
    let lv = 0;
    for (let q = 0; q < jumps.length; q++) {
      if (q === i) continue;
      const a2 = Math.min(num(jumps[q].from), num(jumps[q].to)), b2 = Math.max(num(jumps[q].from), num(jumps[q].to));
      if (a < b2 - 1e-9 && a2 < b - 1e-9 && (spanOf(jumps[q]) < spanOf(j) || (spanOf(jumps[q]) === spanOf(j) && q < i))) lv++;
    }
    levels[i] = lv;
  });
  const hts = jumps.map((j, i) => clamp(Math.abs(x(num(j.to)) - x(num(j.from))) * 0.42, 24, 62) + levels[i] * 30);
  const arcH = j => hts[jumps.indexOf(j)] || 30;
  let topH = 30;
  if (jumps.length) topH = Math.max(...hts) + 40;
  if (marker) topH = Math.max(topH, 52);
  if (rangeSpec) topH = Math.max(topH, 30);
  const axisY = topH + 8;

  // nhãn số
  const hiddenVals = new Set(points.filter(p => p.hidden).map(p => +num(p.at).toFixed(6)));
  const labelOf = v => fmt(v);
  let fs = 16;
  let maxW = 0;
  for (let v = Math.ceil(min / labelEvery - 1e-9) * labelEvery, c = 0; v <= max + 1e-9 && c < 400; v += labelEvery, c++) {
    maxW = Math.max(maxW, estW(labelOf(+v.toFixed(6)), fs));
  }
  const pxPerLabel = (W - 2 * padX) * labelEvery / range;
  const need = (maxW + 8) / pxPerLabel;
  let k = 1;
  for (const cand of [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]) { k = cand; if (cand >= need) break; }
  const labStep = labelEvery * k;
  const isLab = v => Math.abs(Math.round(v / labStep) * labStep - v) < 1e-7 * Math.max(1, Math.abs(v));

  // giá trị bắt buộc có nhãn
  const forced = new Map();
  const forceVal = (v, col) => { if (v >= min - 1e-9 && v <= max + 1e-9) forced.set(+v.toFixed(6), col); };
  points.forEach((p, i) => { if (!p.hidden) forceVal(num(p.at), p.color || pal[i % pal.length]); });
  jumps.forEach((j) => { forceVal(num(j.from)); forceVal(num(j.to)); });
  if (marker && spec.marker) forceVal(marker.at);

  // chiều cao tổng: dưới trục có hàng nhãn số + hàng nhãn điểm
  const labelRowY = axisY + 32;
  const hasPointLabels = points.some(p => p.label || p.hidden);
  const bottomH = hasPointLabels ? 104 : 50;
  const H = axisY + bottomH;

  const ariaParts = [`Trục số từ ${say(min)} đến ${say(max)}, mỗi vạch cách ${fmt(step)}`];
  points.forEach(p => ariaParts.push(p.hidden ? 'một điểm chưa biết (dấu ?)' : `điểm ${p.label ? p.label + ' ' : ''}tại ${say(num(p.at))}`));
  jumps.forEach(j => ariaParts.push(`nhảy từ ${say(num(j.from))} đến ${say(num(j.to))}${j.label ? ' (' + j.label + ')' : ''}`));
  if (rangeSpec) ariaParts.push(`đoạn tô từ ${say(num(rangeSpec.from))} đến ${say(num(rangeSpec.to))}`);
  const svg = svgRoot(W, H, ariaParts.join('; ') + '.', 'v-numberline-svg');

  // đoạn tô
  if (rangeSpec) {
    const a = clamp(Math.min(num(rangeSpec.from), num(rangeSpec.to)), min, max);
    const b = clamp(Math.max(num(rangeSpec.from), num(rangeSpec.to)), min, max);
    const col = rangeSpec.color || pal[2];
    svg.appendChild(s('rect', { x: x(a), y: axisY - 11, width: Math.max(2, x(b) - x(a)), height: 22, rx: 11, fill: col, opacity: 0.38 }));
  }
  // trục
  svg.appendChild(s('line', { x1: padX - 14, y1: axisY, x2: W - padX + 14, y2: axisY, stroke: C.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }));
  svg.appendChild(s('path', { d: `M${W - padX + 8},${axisY - 7} L${W - padX + 18},${axisY} L${W - padX + 8},${axisY + 7}`, fill: 'none', stroke: C.ink, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  svg.appendChild(s('path', { d: `M${padX - 8},${axisY - 7} L${padX - 18},${axisY} L${padX - 8},${axisY + 7}`, fill: 'none', stroke: C.ink, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));

  // vạch + nhãn
  const tickG = s('g'), labG = s('g');
  const placed = []; // vùng nhãn đã đặt [x0,x1]
  const putLabel = (v, col, bold) => {
    const t = labelOf(v);
    const w = estW(t, fs);
    const cx = x(v);
    placed.push([cx - w / 2, cx + w / 2]);
    labG.appendChild(s('text', {
      x: cx, y: labelRowY, 'text-anchor': 'middle', 'font-size': bold ? fs + 1 : fs,
      fill: col || C.ink, 'font-weight': bold ? 800 : 700,
    }, t));
  };
  const nT = Math.round(range / step);
  const forcedList = [...forced.entries()].sort((a, b) => a[0] - b[0]);
  const forcedBoxes = forcedList.map(([v]) => { const w = estW(labelOf(v), fs); return [x(v) - w / 2 - 12, x(v) + w / 2 + 12]; });
  for (let i = 0; i <= nT; i++) {
    const v = +(min + i * step).toFixed(6);
    const major = isLab(v);
    const cx = x(v);
    const isForced = forced.has(v);
    if (major || isForced || pxPerStep >= 6) {
      const len = major || isForced ? 11 : 6;
      tickG.appendChild(s('line', { x1: cx, y1: axisY - len, x2: cx, y2: axisY + len, stroke: C.ink, 'stroke-width': major || isForced ? 3 : 2, 'stroke-linecap': 'round', opacity: major || isForced ? 1 : 0.55 }));
    }
    if (hiddenVals.has(v)) continue;
    if (isForced) continue;
    if (major) {
      const w = estW(labelOf(v), fs);
      const box = [cx - w / 2, cx + w / 2];
      if (forcedBoxes.some(b => box[1] + 6 > b[0] && box[0] - 6 < b[1])) continue;
      putLabel(v, C.ink, false);
    }
  }
  forcedList.forEach(([v, col]) => putLabel(v, col || C.ink, true));
  svg.appendChild(tickG);
  svg.appendChild(labG);

  // điểm
  const ptG = s('g');
  points.forEach((p, i) => {
    const v = num(p.at);
    if (v < min - 1e-9 || v > max + 1e-9) return;
    const col = p.color || pal[i % pal.length];
    const cx = x(v);
    const g = s('g', { class: 'v-numberline-pop' });
    g.appendChild(s('circle', { cx, cy: axisY, r: 10, fill: p.hidden ? '#FFFFFF' : col, stroke: p.hidden ? col : '#FFFFFF', 'stroke-width': p.hidden ? 3.5 : 3.5, 'stroke-dasharray': p.hidden ? '5 4' : null }));
    if (!p.hidden) g.appendChild(s('circle', { cx, cy: axisY, r: 12.5, fill: 'none', stroke: col, 'stroke-width': 2 }));
    if (p.label || p.hidden) {
      const txt = p.hidden ? '?' : String(p.label);
      const w = Math.max(30, estW(txt, 17) + 16);
      const by = axisY + 58;
      g.appendChild(s('path', { d: `M${cx},${axisY + 42} L${cx},${by - 2}`, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': '2 4', 'stroke-linecap': 'round' }));
      g.appendChild(s('rect', { x: cx - w / 2, y: by - 2, width: w, height: 30, rx: 15, fill: p.hidden ? '#FFE9A8' : col, stroke: p.hidden ? col : 'none', 'stroke-width': 2.5, 'stroke-dasharray': p.hidden ? '5 4' : null }));
      g.appendChild(s('text', { x: cx, y: by + 20, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: p.hidden ? C.ink : inkOn(col) }, txt));
    }
    ptG.appendChild(g);
  });
  svg.appendChild(ptG);

  // cung nhảy
  const arcG = s('g');
  const arcEls = [];
  jumps.forEach((j, i) => {
    const f = num(j.from), t = num(j.to);
    const x1 = x(clamp(f, min, max)), x2 = x(clamp(t, min, max));
    const hh = arcH(j);
    const y0 = axisY - 13;
    const dir = t >= f ? 1 : -1;
    const col = dir > 0 ? '#F5893A' : '#8B6CF0';
    const g = s('g');
    const d = `M${x1},${y0} C${x1},${y0 - hh * 1.33} ${x2},${y0 - hh * 1.33} ${x2},${y0 - 2}`;
    const path = s('path', { d, fill: 'none', stroke: col, 'stroke-width': 4, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': '1 1' });
    g.appendChild(path);
    g.appendChild(s('path', { d: `M${x2 - 7},${y0 - 11} L${x2},${y0 + 1} L${x2 + 7},${y0 - 11}`, fill: 'none', stroke: col, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    const lab = j.label != null && j.label !== '' ? String(j.label).replace(/-/g, '−') : '';
    let labEl = null;
    if (lab) {
      const w = Math.max(38, estW(lab, 17) + 16);
      const cx = (x1 + x2) / 2, cy = y0 - hh * 0.99 - 3;
      labEl = s('g');
      labEl.appendChild(s('rect', { x: cx - w / 2, y: cy - 14, width: w, height: 26, rx: 13, fill: '#FFFFFF', stroke: col, 'stroke-width': 3 }));
      labEl.appendChild(s('text', { x: cx, y: cy + 5, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: C.ink }, lab));
      g.appendChild(labEl);
    }
    arcEls.push({ g, path, labEl, j, hh });
    arcG.appendChild(g);
  });
  svg.appendChild(arcG);

  // marker
  let mk = null;
  const mkX = marker ? x(clamp(marker.at, min, max)) : 0;
  const mkY = axisY - 15;
  if (marker) {
    mk = s('g');
    mk.appendChild(s('ellipse', { cx: mkX, cy: axisY - 11, rx: 13, ry: 4, fill: '#263250', opacity: 0.14 }));
    mk.appendChild(s('text', { x: mkX, y: mkY, 'text-anchor': 'middle', 'font-size': 32, style: { fontFamily: `'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif` } }, marker.emoji));
    svg.appendChild(mk);
  }

  // hoạt hình
  setupAnim(svg, ctx, spec, (A) => {
    const total = hop ? 2.3 : 1.2;
    if (hop) {
      const n = arcEls.length;
      const per = Math.min(0.7, 1.9 / n);
      arcEls.forEach((a, i) => {
        const d0 = 0.3 + i * per;
        A(a.path, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { delay: d0 * 1000, duration: per * 800, easing: 'ease-in-out' });
        if (a.labEl) A(a.labEl, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { delay: (d0 + per * 0.4) * 1000, duration: 300 });
        A(a.g, [{ opacity: 0 }, { opacity: 1 }], { delay: d0 * 1000, duration: 80 });
      });
      if (mk) {
        const first = num(jumps[0].from);
        const kf = [];
        const t0 = 0.3, T = 0.3 + n * per + 0.15;
        const push = (t, dx, dy) => kf.push({ offset: clamp(t / T, 0, 1), transform: `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px)` });
        const base = mkX;
        push(0, x(clamp(first, min, max)) - base, 0);
        push(t0, x(clamp(first, min, max)) - base, 0);
        arcEls.forEach((a, i) => {
          const x1 = x(clamp(num(a.j.from), min, max)) - base, x2 = x(clamp(num(a.j.to), min, max)) - base;
          const ts = t0 + i * per;
          for (let q = 1; q <= 10; q++) {
            const u = q / 10;
            push(ts + u * per * 0.86, x1 + (x2 - x1) * u, -4 * a.hh * 0.78 * u * (1 - u));
          }
          push(ts + per, x2, 0);
        });
        push(T, 0, 0);
        // đảm bảo offset tăng dần
        let last = -1;
        kf.forEach(k => { if (k.offset <= last) k.offset = Math.min(1, last + 0.0001); last = k.offset; });
        kf[kf.length - 1].offset = 1;
        A(mk, kf, { duration: T * 1000, easing: 'linear' });
      }
    } else {
      arcEls.forEach((a, i) => {
        A(a.path, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { delay: i * 250, duration: 500 });
        if (a.labEl) A(a.labEl, [{ opacity: 0 }, { opacity: 1 }], { delay: i * 250 + 300, duration: 300 });
      });
      if (mk) A(mk, [{ transform: 'translateY(-14px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 500 });
    }
    [...ptG.children].forEach((g, i) => A(g, [{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1)' }], { delay: 150 + i * 160, duration: 350, easing: 'cubic-bezier(.34,1.56,.64,1)' }));
    void total;
  });
  return svg;
}

// ------------------------------------------------------------------ sequence
function renderSequence(spec, ctx) {
  const pal = palOf(ctx);
  const raw = Array.isArray(spec.items) ? spec.items : [];
  const items = (raw.length ? raw : ['?']).slice(0, 24).map(v => typeof v === 'number' ? fmt(v) : String(v == null ? '?' : v).replace(/^-(?=\d)/, '−'));
  const labels = Array.isArray(spec.arrowLabels) ? spec.arrowLabels.map(l => l == null ? '' : String(l).replace(/-/g, '−')) : [];
  const hl = new Set(Array.isArray(spec.highlight) ? spec.highlight : (typeof spec.highlight === 'number' ? [spec.highlight] : []));
  const hasArrowLab = labels.some(Boolean);
  const gap = hasArrowLab ? Math.max(40, ...labels.map(l => estW(l, 15) + 20)) : 30;
  const cellH = 50, fs = 22;
  const widths = items.map(t => Math.max(46, estW(t, fs) + 22));
  const usable = W - 16;

  // chia hàng
  const rows = [];
  let cur = [], curW = 0;
  items.forEach((t, i) => {
    const w = widths[i];
    const need = cur.length ? gap + w : w;
    if (cur.length && curW + need > usable) { rows.push(cur); cur = []; curW = 0; }
    curW += cur.length ? gap + w : w;
    cur.push(i);
  });
  if (cur.length) rows.push(cur);

  const topPad = hasArrowLab ? 26 : 10;
  const rowGap = hasArrowLab ? 70 : 48;
  const H = topPad + rows.length * cellH + (rows.length - 1) * rowGap + 14;

  const svg = svgRoot(W, H, 'Dãy số: ' + items.map(t => t === '?' ? 'chưa biết' : t).join(', ') + '.', 'v-sequence-svg');
  const defs = s('defs');
  const mid = ctx.uid();
  defs.appendChild(s('marker', { id: mid, viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse', markerUnits: 'strokeWidth' },
    s('path', { d: 'M1,1 L8,5 L1,9', fill: 'none', stroke: C.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })));
  svg.appendChild(defs);

  const cellEls = [], arrowEls = [];
  const pos = [];
  rows.forEach((row, ri) => {
    const rowW = row.reduce((a, i, q) => a + widths[i] + (q ? gap : 0), 0);
    let cx0 = (W - rowW) / 2;
    const top = topPad + ri * (cellH + rowGap);
    row.forEach((i, q) => {
      pos[i] = { x: cx0, w: widths[i], top };
      cx0 += widths[i] + gap;
    });
  });

  items.forEach((t, i) => {
    const p = pos[i];
    const q = t === '?';
    const hi = hl.has(i);
    const g = s('g', { class: 'v-sequence-pop' });
    const col = hi ? pal[1] : pal[0];
    g.appendChild(s('rect', { x: p.x, y: p.top + 4, width: p.w, height: cellH, rx: 14, fill: '#263250', opacity: 0.08 }));
    g.appendChild(s('rect', {
      x: p.x, y: p.top, width: p.w, height: cellH, rx: 14,
      fill: q ? '#FFE9A8' : (hi ? '#FFDDBD' : '#FFFFFF'),
      stroke: q ? pal[4] : col, 'stroke-width': 3.5, 'stroke-dasharray': q ? '7 5' : null,
    }));
    g.appendChild(s('text', { x: p.x + p.w / 2, y: p.top + cellH / 2 + 8, 'text-anchor': 'middle', 'font-size': q ? 28 : fs, 'font-weight': 800, fill: q ? '#D96A1C' : C.ink }, t));
    svg.appendChild(g);
    cellEls.push(g);
  });
  items.forEach((t, i) => {
    if (i === items.length - 1) return;
    const a = pos[i], b = pos[i + 1];
    const lab = labels[i] || '';
    const g = s('g', { class: 'v-sequence-pop' });
    if (a.top === b.top) {
      const x1 = a.x + a.w + 5, x2 = b.x - 5, y = a.top + cellH / 2;
      g.appendChild(s('line', { x1, y1: y, x2, y2: y, stroke: C.ink, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'marker-end': `url(#${mid})` }));
      if (lab) {
        const w = Math.max(30, estW(lab, 16) + 12);
        g.appendChild(s('rect', { x: (x1 + x2) / 2 - w / 2, y: y - 36, width: w, height: 24, rx: 12, fill: '#E1F5EC', stroke: pal[2], 'stroke-width': 2.5 }));
        g.appendChild(s('text', { x: (x1 + x2) / 2, y: y - 18, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: C.ink }, lab));
      }
    } else {
      // xuống hàng: đường gấp khúc
      const x1 = a.x + a.w / 2, y1 = a.top + cellH + 6, x2 = b.x + b.w / 2, y2 = b.top - 6;
      const ym = y1 + 22;
      g.appendChild(s('path', { d: `M${x1},${y1} L${x1},${ym} L${x2},${ym} L${x2},${y2}`, fill: 'none', stroke: C.ink, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'marker-end': `url(#${mid})` }));
      if (lab) {
        const w = Math.max(30, estW(lab, 16) + 12);
        g.appendChild(s('rect', { x: (x1 + x2) / 2 - w / 2, y: ym - 13, width: w, height: 24, rx: 12, fill: '#E1F5EC', stroke: pal[2], 'stroke-width': 2.5 }));
        g.appendChild(s('text', { x: (x1 + x2) / 2, y: ym + 5, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: C.ink }, lab));
      }
    }
    svg.appendChild(g);
    arrowEls.push(g);
  });

  setupAnim(svg, ctx, spec, (A) => {
    const n = items.length;
    const step = Math.min(0.4, 2.0 / Math.max(1, n));
    cellEls.forEach((g, i) => A(g, [{ opacity: 0, transform: 'scale(.55)' }, { opacity: 1, transform: 'scale(1)' }], { delay: i * step * 1000, duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' }));
    arrowEls.forEach((g, i) => A(g, [{ opacity: 0, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'translateX(0)' }], { delay: (i * step + step * 0.55) * 1000, duration: 300 }));
  });
  return svg;
}

export default {
  kinds: ['numberline', 'sequence'],
  render(spec, ctx) {
    const kind = spec && spec.kind === 'sequence' ? 'sequence' : 'numberline';
    return safe(kind, kind === 'sequence' ? renderSequence : renderNumberline)(spec, ctx);
  },
};
