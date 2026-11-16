// thermo — nhiệt kế dọc (Agent hình 1)
import { C, FONT, s, num, clamp, fmt, say, palOf, inkOn, setupAnim, safe, svgRoot, ensureStyle } from './_v1.js';

const W = 360;

ensureStyle('v-thermo-style', `
.v-thermo-svg text{font-family:${FONT};font-weight:700;}
.v-thermo-svg .v-thermo-merc{transform-box:fill-box;transform-origin:50% 100%;}
.v-thermo-svg .v-thermo-card{transform-box:fill-box;transform-origin:0% 50%;}
`);

const estW = (str, fs) => {
  let w = 0;
  for (const ch of String(str)) w += (ch === ' ' ? 0.3 : /[0-9]/.test(ch) ? 0.56 : 0.6) * fs;
  return w;
};

function renderThermo(spec, ctx) {
  const pal = palOf(ctx);
  let min = num(spec.min, -10), max = num(spec.max, 10);
  if (min > max) [min, max] = [max, min];
  if (max === min) max = min + 1;
  let step = num(spec.step, 1);
  if (!(step > 0)) step = 1;
  const range = max - min;
  if (range / step > 120) step = Math.ceil(range / 100 / step) * step;
  const units = range / step;

  const items = (Array.isArray(spec.items) ? spec.items : []).filter(it => it && isFinite(num(it.value, NaN))).slice(0, 8);
  const showValue = spec.showValue !== false;
  let level = num(spec.level, NaN);
  const explicitLevel = isFinite(level);
  if (!explicitLevel) level = items.length === 1 ? num(items[0].value) : (min <= 0 && max >= 0 ? 0 : min);
  level = clamp(level, min, max);

  const per = clamp(300 / units, 12, 28);
  const plotH = units * per;
  const yTop = 40;
  const yBot = yTop + plotH;
  const tx = 104;                       // tâm ống
  const bulbR = 24, bulbY = yBot + 22;
  const H = bulbY + bulbR + 16;
  const y = v => yBot - (v - min) / range * plotH;

  const aria = `Nhiệt kế từ ${say(min)} đến ${say(max)} độ C` + (explicitLevel ? `, cột thuỷ ngân ở ${say(level)} độ` : '') +
    (items.length ? '; ' + items.map(it => `${it.label || ''} ${say(num(it.value))} độ C`).join(', ') : '') + '.';
  const svg = svgRoot(W, H, aria, 'v-thermo-svg');

  // nền vùng âm / dương
  const y0 = y(clamp(0, min, max));
  if (min < 0) svg.appendChild(s('rect', { x: 0, y: max < 0 ? yTop - 14 : y0, width: W, height: yBot + 26 - (max < 0 ? yTop - 14 : y0), rx: 0, fill: '#E3F2FF', opacity: 0.8 }));
  if (max > 0) svg.appendChild(s('rect', { x: 0, y: yTop - 14, width: W, height: (min < 0 ? y0 : yBot + 26) - (yTop - 14), fill: '#FFF1DA', opacity: 0.75 }));
  const emo = { style: { fontFamily: `'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif` }, 'text-anchor': 'middle' };
  if (min < 0) svg.appendChild(s('text', Object.assign({ x: 22, y: Math.min(yBot - 4, (Math.max(y0, yTop) + yBot) / 2 + 8), 'font-size': 22 }, emo), '❄'));
  if (max > 0) svg.appendChild(s('text', Object.assign({ x: 22, y: Math.max(yTop + 14, (yTop + Math.min(y0, yBot)) / 2 + 8), 'font-size': 22 }, emo), '☀'));

  svg.appendChild(s('text', { x: tx, y: 22, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: C.ink }, '°C'));

  // ống thuỷ tinh
  const tw = 28;
  const glass = (fill, stroke, sw) => {
    const g = s('g');
    g.appendChild(s('rect', { x: tx - tw / 2, y: yTop - 14, width: tw, height: yBot - yTop + 14 + 24, rx: tw / 2, fill, stroke, 'stroke-width': sw }));
    g.appendChild(s('circle', { cx: tx, cy: bulbY, r: bulbR, fill, stroke, 'stroke-width': sw }));
    return g;
  };
  svg.appendChild(glass('#B9C2D8', '#B9C2D8', 8));
  svg.appendChild(glass('#FFFFFF', 'none', 0));

  // vạch chia
  let fs = 16;
  const nT = Math.round(units);
  const labGap = Math.max(1, Math.ceil(19 / (per)));
  const isLab = i => i % labGap === 0;
  for (let i = 0; i <= nT; i++) {
    const v = +(min + i * step).toFixed(6);
    const yy = y(v);
    const lab = isLab(i) || Math.abs(v) < 1e-9;
    const isZero = Math.abs(v) < 1e-9;
    svg.appendChild(s('line', { x1: tx - tw / 2 - (lab ? 12 : 7), y1: yy, x2: tx - tw / 2 + 2, y2: yy, stroke: isZero ? C.ink : '#5B5870', 'stroke-width': isZero ? 3.5 : lab ? 2.5 : 1.8, 'stroke-linecap': 'round' }));
    if (lab && !(labGap > 1 && !isZero && Math.abs(yy - y(0)) < 17 && min < 0 && max > 0)) {
      svg.appendChild(s('text', { x: tx - tw / 2 - 17, y: yy + 5.5, 'text-anchor': 'end', 'font-size': fs, 'font-weight': isZero ? 800 : 700, fill: C.ink }, fmt(v, 100000)));
    }
  }
  if (min < 0 && max > 0) {
    svg.appendChild(s('line', { x1: tx - tw / 2 - 2, y1: y0, x2: W - 6, y2: y0, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '2 6', 'stroke-linecap': 'round', opacity: 0.55 }));
  }

  // thuỷ ngân
  const merc = s('g', { class: 'v-thermo-merc' });
  const mc = '#FF4D6D';
  const ly = y(level);
  merc.appendChild(s('rect', { x: tx - 7, y: ly, width: 14, height: bulbY - ly, fill: mc }));
  merc.appendChild(s('circle', { cx: tx, cy: ly, r: 7, fill: mc }));
  svg.appendChild(s('circle', { cx: tx, cy: bulbY, r: bulbR - 6, fill: mc }));
  svg.appendChild(merc);
  svg.appendChild(s('ellipse', { cx: tx - 2.5, cy: bulbY - 6, rx: 4, ry: 7, fill: '#fff', opacity: 0.45 }));

  let levelPill = null;
  if (explicitLevel) {
    const t = fmt(level, 100000) + '°';
    const w = estW(t, 17) + 18;
    levelPill = s('g', { class: 'v-thermo-card' });
    levelPill.appendChild(s('path', { d: `M${tx + tw / 2 + 2},${ly} l12,-9 v18z`, fill: mc }));
    levelPill.appendChild(s('rect', { x: tx + tw / 2 + 12, y: ly - 14, width: w, height: 28, rx: 14, fill: mc }));
    levelPill.appendChild(s('text', { x: tx + tw / 2 + 12 + w / 2, y: ly + 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: '#fff' }, t));
  }

  // thẻ gắn cạnh
  const cardEls = [];
  if (items.length) {
    const cardX = 176, cardW = W - cardX - 8, cardH = 36, gapMin = 6;
    const arr = items.map((it, i) => ({ it, i, v: num(it.value), yv: y(clamp(num(it.value), min, max)) })).sort((a, b) => a.yv - b.yv);
    // đẩy tránh chồng
    arr.forEach((o, k) => { o.yc = o.yv; if (k && o.yc < arr[k - 1].yc + cardH + gapMin) o.yc = arr[k - 1].yc + cardH + gapMin; });
    for (let k = arr.length - 1; k >= 0; k--) {
      const maxY = yBot + 14 - (arr.length - 1 - k) * (cardH + gapMin);
      if (arr[k].yc > maxY) arr[k].yc = maxY;
    }
    arr.forEach(o => {
      const col = o.it.color || pal[o.i % pal.length];
      const g = s('g', { class: 'v-thermo-card' });
      const ink = inkOn(col);
      g.appendChild(s('path', { d: `M${tx + tw / 2},${o.yv} H${cardX - 26} L${cardX - 8},${o.yc}`, fill: 'none', stroke: col, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '1 6' }));
      g.appendChild(s('circle', { cx: tx + tw / 2 - 1, cy: o.yv, r: 5.5, fill: col, stroke: '#fff', 'stroke-width': 2 }));
      g.appendChild(s('rect', { x: cardX - 8, y: o.yc - cardH / 2, width: cardW + 8, height: cardH, rx: 12, fill: col }));
      const lab = String(o.it.label == null ? '' : o.it.label);
      const vt = fmt(o.v, 100000) + '°C';
      const lfs = estW(lab, 16) + estW(vt, 16) + 24 > cardW ? 14 : 16;
      g.appendChild(s('text', { x: cardX + 2, y: o.yc + 5.5, 'font-size': lfs, 'font-weight': 700, fill: ink }, lab));
      if (showValue) g.appendChild(s('text', { x: W - 16, y: o.yc + 5.5, 'text-anchor': 'end', 'font-size': 17, 'font-weight': 800, fill: ink }, vt));
      svg.appendChild(g);
      cardEls.push(g);
    });
  }
  if (levelPill) svg.appendChild(levelPill);

  setupAnim(svg, ctx, spec, (A) => {
    A(merc, [{ transform: 'scaleY(0.001)' }, { transform: 'scaleY(1)' }], { duration: 1500, easing: 'cubic-bezier(.3,.7,.3,1)' });
    cardEls.forEach((g, i) => A(g, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { delay: 900 + i * 200, duration: 350, easing: 'cubic-bezier(.34,1.56,.64,1)' }));
    if (levelPill) A(levelPill, [{ opacity: 0 }, { opacity: 1 }], { delay: 1300, duration: 300 });
  });
  return svg;
}

export default {
  kinds: ['thermo'],
  render: safe('thermo', renderThermo),
};
