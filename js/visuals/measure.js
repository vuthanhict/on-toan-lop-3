// measure — bình/cốc/thước/thanh có vạch chia đều
import { COL, el, svgRoot, safe, num, int, fracText, uid, ensureStyle, setupAnim } from './_v2.js';

const CSS = `.v-measure text{font-family:inherit}`;
const WATER = '#4F6BED';

function parseFrac(s) {
  const m = /^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(String(s));
  return m ? [m[1], m[2]] : null;
}

// nhãn tại vạch i
function tickLabel(i, parts, mode, unitFull) {
  if (mode === 'none') return null;
  if (i === 0) return { t: '0' };
  if (i === parts) return { t: unitFull || '1' };
  if (mode === 'number') return { t: String(i) };
  return { f: [i, parts] };
}

function measure(spec, ctx) {
  const type = ['jar', 'beaker', 'ruler', 'bar'].includes(spec.type) ? spec.type : 'jar';
  const parts = int(spec.parts, 5, 1, 20);
  const levelRaw = spec.level === undefined || spec.level === null ? 0 : num(spec.level, 0);
  const level = Math.max(0, Math.min(parts, levelRaw));
  const labelMode = ['fraction', 'number', 'none'].includes(spec.labels) ? spec.labels : 'fraction';
  const unitFull = spec.unit && typeof spec.unit.full === 'string' ? spec.unit.full : '';
  const showTicks = spec.showTicks !== false;
  const ptr = spec.pointer && typeof spec.pointer === 'object' ? spec.pointer : null;
  const ptrAt = ptr ? Math.max(0, Math.min(parts, num(ptr.at, 0))) : 0;
  const vertical = type === 'jar' || type === 'beaker';
  const nameVi = { jar: 'Bình', beaker: 'Cốc đong', ruler: 'Thước', bar: 'Thanh' }[type];
  const label = `${nameVi} chia thành ${parts} phần bằng nhau` + (level ? `, đã tô ${level} phần` : '') +
    (ptr ? (ptr.hidden ? `, mũi tên chỉ vạch ? (chưa biết)` : `, mũi tên chỉ vạch ${ptrAt} phần ${parts}`) : '') + '.';
  const id = uid(ctx, 'ms');
  let svg, fillEl = null, ptrEl = null, vertAnim = vertical;

  const drawPointerLabel = (g, x, y) => {
    if (ptr.hidden) {
      g.appendChild(el('rect', { x: x - 20, y: y - 22, width: 40, height: 44, rx: 10, fill: '#FFFFFF', stroke: COL.accent, 'stroke-width': 3, 'stroke-dasharray': '6 4' }));
      g.appendChild(el('text', { x, y: y + 9, 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 900, fill: COL.accent, text: '?' }));
      return;
    }
    const custom = ptr.label !== undefined && ptr.label !== null && ptr.label !== '' ? String(ptr.label) : null;
    const fr = custom ? parseFrac(custom) : null;
    if (fr) fracText(g, x, y, fr[0], fr[1], 20, COL.ink, 900);
    else if (custom) g.appendChild(el('text', { x, y: y + 7, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 900, fill: COL.ink, text: custom }));
    else if (ptrAt === 0) g.appendChild(el('text', { x, y: y + 7, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 900, fill: COL.ink, text: '0' }));
    else if (ptrAt === parts) g.appendChild(el('text', { x, y: y + 7, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 900, fill: COL.ink, text: unitFull || '1' }));
    else fracText(g, x, y, Number.isInteger(ptrAt) ? ptrAt : ptrAt, parts, 20, COL.ink, 900);
  };

  if (vertical) {
    const H = 300, yT = 46, yB = 268, hh = yB - yT;
    svg = svgRoot(360, H, label, 'v-measure', 400);
    const cx = ptr ? 150 : 170;
    const hw = type === 'jar' ? 56 : 46;
    const x = cx - hw, x2 = cx + hw;
    const yOf = (v) => yB - hh * v / parts;
    const R = type === 'jar' ? 26 : 8;
    const body = `M${x} ${yT}L${x} ${yB - R}Q${x} ${yB} ${x + R} ${yB}L${x2 - R} ${yB}Q${x2} ${yB} ${x2} ${yB - R}L${x2} ${yT}Z`;
    const cid = id + 'c';
    svg.appendChild(el('defs', null, [el('clipPath', { id: cid }, [el('path', { d: body })])]));
    svg.appendChild(el('path', { d: body, fill: 'rgba(160,200,255,.16)' }));
    if (level > 0) {
      const g = el('g', { 'clip-path': `url(#${cid})` });
      fillEl = el('g', null);
      fillEl.appendChild(el('rect', { x: x - 2, y: yOf(level), width: hw * 2 + 4, height: yB - yOf(level) + 4, fill: WATER, 'fill-opacity': 0.78 }));
      fillEl.appendChild(el('rect', { x: x - 2, y: yOf(level), width: hw * 2 + 4, height: 6, fill: '#FFFFFF', 'fill-opacity': 0.35 }));
      g.appendChild(fillEl);
      svg.appendChild(g);
    }
    // vạch chia (bên trái, kéo ra ngoài)
    if (showTicks) {
      for (let i = 0; i <= parts; i++) {
        const y = yOf(i);
        const end = i === 0 || i === parts;
        svg.appendChild(el('line', { x1: x - 10, x2: x + (end ? 16 : 22), y1: y, y2: y, stroke: COL.ink, 'stroke-width': end ? 4 : 3, 'stroke-linecap': 'round' }));
      }
    }
    // nhãn: thưa bớt nếu chật
    const gapY = hh / parts;
    const need = labelMode === 'fraction' ? 36 : 20;
    const stepL = Math.max(1, Math.ceil(need / gapY));
    for (let i = 0; i <= parts; i++) {
      if (!(i === 0 || i === parts || i % stepL === 0)) continue;
      if (i !== 0 && i !== parts && parts - i < stepL * 0.6) continue;
      const tl = tickLabel(i, parts, labelMode, unitFull);
      if (!tl) continue;
      const y = yOf(i);
      if (tl.f) fracText(svg, x - 28, y, tl.f[0], tl.f[1], 15, COL.ink, 800);
      else svg.appendChild(el('text', { x: x - 14, y: y + 5, 'text-anchor': 'end', 'font-size': 16, 'font-weight': 800, fill: COL.ink, text: tl.t }));
    }
    svg.appendChild(el('path', { d: body, fill: 'none', stroke: COL.ink, 'stroke-width': 4.5, 'stroke-linejoin': 'round' }));
    if (type === 'jar') {
      svg.appendChild(el('rect', { x: x - 6, y: yT - 12, width: hw * 2 + 12, height: 14, rx: 7, fill: '#FFFFFF', stroke: COL.ink, 'stroke-width': 4.5 }));
    } else {
      svg.appendChild(el('path', { d: `M${x - 10} ${yT - 8}L${x} ${yT}`, stroke: COL.ink, 'stroke-width': 4.5, 'stroke-linecap': 'round', fill: 'none' }));
    }
    if (ptr) {
      const y = yOf(ptrAt);
      ptrEl = el('g', null);
      const ax2 = x2 + 62, ax1 = x2 + 8;
      ptrEl.appendChild(el('line', { x1: ax2, x2: ax1 + 6, y1: y, y2: y, stroke: COL.accent, 'stroke-width': 5, 'stroke-linecap': 'round' }));
      ptrEl.appendChild(el('path', { d: `M${ax1} ${y}L${ax1 + 16} ${y - 11}L${ax1 + 16} ${y + 11}Z`, fill: COL.accent, stroke: COL.accent, 'stroke-width': 3, 'stroke-linejoin': 'round' }));
      drawPointerLabel(ptrEl, ax2 + 34, y);
      svg.appendChild(ptrEl);
    }
  } else {
    // ngang: thước / thanh
    const x0 = 30, W = 300;
    const barH = type === 'bar' ? 48 : 46;
    const yBar = ptr ? 78 : 36;
    const H = yBar + barH + 62;
    svg = svgRoot(360, H, label, 'v-measure', 460);
    const xOf = (v) => x0 + W * v / parts;
    const rx = type === 'bar' ? 14 : 6;
    const cid = id + 'c';
    svg.appendChild(el('defs', null, [el('clipPath', { id: cid }, [el('rect', { x: x0, y: yBar, width: W, height: barH, rx })])]));
    svg.appendChild(el('rect', { x: x0, y: yBar, width: W, height: barH, rx, fill: type === 'ruler' ? '#FFF3CF' : '#FFFEFB' }));
    if (level > 0) {
      const g = el('g', { 'clip-path': `url(#${cid})` });
      fillEl = el('rect', { x: x0, y: type === 'ruler' ? yBar + barH * 0.45 : yBar, width: W * level / parts, height: type === 'ruler' ? barH * 0.55 : barH, fill: type === 'ruler' ? '#F7BE2C' : '#4F6BED', 'fill-opacity': type === 'ruler' ? 0.9 : 0.85 });
      g.appendChild(fillEl);
      svg.appendChild(g);
    }
    for (let i = 0; i <= parts; i++) {
      const xx = xOf(i);
      const end = i === 0 || i === parts;
      if (type === 'ruler') {
        if (showTicks) svg.appendChild(el('line', { x1: xx, x2: xx, y1: yBar, y2: yBar + (end ? 26 : 18), stroke: COL.ink, 'stroke-width': end ? 4 : 3, 'stroke-linecap': 'round' }));
      } else if (i > 0 && i < parts && showTicks) {
        svg.appendChild(el('line', { x1: xx, x2: xx, y1: yBar, y2: yBar + barH, stroke: COL.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }));
      }
    }
    svg.appendChild(el('rect', { x: x0, y: yBar, width: W, height: barH, rx, fill: 'none', stroke: COL.ink, 'stroke-width': 4.5 }));
    // nhãn dưới
    const gapX = W / parts;
    const need = labelMode === 'fraction' ? 30 : 20;
    const stepL = Math.max(1, Math.ceil(need / gapX));
    for (let i = 0; i <= parts; i++) {
      if (!(i === 0 || i === parts || i % stepL === 0)) continue;
      if (i !== 0 && i !== parts && parts - i < stepL * 0.6) continue;
      const tl = tickLabel(i, parts, labelMode, unitFull);
      if (!tl) continue;
      const xx = xOf(i), y = yBar + barH + 26;
      if (tl.f) fracText(svg, xx, y, tl.f[0], tl.f[1], 15, COL.ink, 800);
      else svg.appendChild(el('text', { x: xx, y: y + 5, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: COL.ink, text: tl.t }));
    }
    if (ptr) {
      const xx = xOf(ptrAt);
      ptrEl = el('g', null);
      const ay1 = yBar - 6, ay0 = yBar - 34;
      ptrEl.appendChild(el('line', { x1: xx, x2: xx, y1: ay0, y2: ay1 - 6, stroke: COL.accent, 'stroke-width': 5, 'stroke-linecap': 'round' }));
      ptrEl.appendChild(el('path', { d: `M${xx} ${ay1 + 2}L${xx - 11} ${ay1 - 14}L${xx + 11} ${ay1 - 14}Z`, fill: COL.accent, stroke: COL.accent, 'stroke-width': 3, 'stroke-linejoin': 'round' }));
      drawPointerLabel(ptrEl, Math.max(24, Math.min(336, xx)), ay0 - 16);
      svg.appendChild(ptrEl);
    }
    vertAnim = false;
  }

  ensureStyle('v2-measure', CSS);
  setupAnim(svg, spec, ctx, (A) => {
    if (fillEl) {
      fillEl.style.transformBox = 'fill-box';
      fillEl.style.transformOrigin = vertAnim ? '50% 100%' : '0% 50%';
      A(fillEl, [{ transform: vertAnim ? 'scaleY(0)' : 'scaleX(0)' }, { transform: 'none' }], { duration: 1300, easing: 'cubic-bezier(.3,.7,.3,1)' });
    }
    if (ptrEl) A(ptrEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 1300 });
  }, spec.anim === 'fill' || !!spec.anim);
  return svg;
}

export default {
  kinds: ['measure'],
  render(spec, ctx) {
    return safe('measure', spec, ctx, measure);
  },
};
