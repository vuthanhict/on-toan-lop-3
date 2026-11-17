// groups — chia vật vào nhóm (có dư) — Agent hình 1
import { C, FONT, s, num, clamp, fmt, palOf, setupAnim, safe, svgRoot, ensureStyle } from './_v1.js';

const W = 360;
const EMOJI_FONT = `'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif`;

ensureStyle('v-groups-style', `
.v-groups-svg text{font-family:${FONT};font-weight:700;}
.v-groups-svg .v-groups-item{font-family:${EMOJI_FONT};font-weight:400;}
.v-groups-svg .v-groups-pop{transform-box:fill-box;transform-origin:center;}
`);

function containerShape(kind, x, y, w, hgt, tint) {
  const g = s('g', { class: 'v-groups-pop' });
  const stroke = 'rgba(0,0,0,.28)';
  if (kind === 'túi') {
    const d = `M${x + w * 0.24},${y + 14} Q${x - 2},${y + hgt * 0.45} ${x + w * 0.05},${y + hgt - 16} Q${x + w * 0.08},${y + hgt} ${x + w * 0.28},${y + hgt} L${x + w * 0.72},${y + hgt} Q${x + w * 0.92},${y + hgt} ${x + w * 0.95},${y + hgt - 16} Q${x + w + 2},${y + hgt * 0.45} ${x + w * 0.76},${y + 14} Z`;
    g.appendChild(s('path', { d, fill: '#F9C28F', stroke: '#F5893A', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }));
    g.appendChild(s('rect', { x: x + w * 0.26, y: y + 6, width: w * 0.48, height: 13, rx: 6.5, fill: '#F5893A', stroke: '#F5893A', 'stroke-width': 2.5 }));
    g.appendChild(s('path', { d: `M${x + w * 0.5},${y + 8} l-12,-9 v14z M${x + w * 0.5},${y + 8} l12,-9 v14z`, fill: '#F5893A', stroke: '#F5893A', 'stroke-width': 2.5, 'stroke-linejoin': 'round', transform: 'translate(0,-1)' }));
  } else if (kind === 'hộp') {
    g.appendChild(s('rect', { x: x + 2, y: y + 12, width: w - 4, height: hgt - 12, rx: 10, fill: '#FBDF86', stroke: '#F5893A', 'stroke-width': 3.5 }));
    g.appendChild(s('rect', { x, y: y + 2, width: w, height: 18, rx: 8, fill: '#F5893A', stroke: '#F5893A', 'stroke-width': 3.5 }));
  } else if (kind === 'xe') {
    g.appendChild(s('rect', { x: x + 2, y: y + 8, width: w - 4, height: hgt - 20, rx: 10, fill: '#D4DCFD', stroke: '#4F6BED', 'stroke-width': 3.5 }));
    g.appendChild(s('circle', { cx: x + w * 0.24, cy: y + hgt - 8, r: 9, fill: '#263250', stroke: '#FFFFFF', 'stroke-width': 2.5 }));
    g.appendChild(s('circle', { cx: x + w * 0.76, cy: y + hgt - 8, r: 9, fill: '#263250', stroke: '#FFFFFF', 'stroke-width': 2.5 }));
  } else { // đĩa
    g.appendChild(s('ellipse', { cx: x + w / 2, cy: y + hgt - 11, rx: w / 2, ry: 15, fill: '#FFFFFF', stroke: '#8E99B2', 'stroke-width': 3.5 }));
    g.appendChild(s('ellipse', { cx: x + w / 2, cy: y + hgt - 12, rx: w / 2 - 12, ry: 8.5, fill: '#E8EDFF', stroke: '#AEBBFA', 'stroke-width': 2 }));
  }
  void tint; void stroke;
  return g;
}

function renderGroups(spec, ctx) {
  const pal = palOf(ctx);
  const total = clamp(Math.round(num(spec.total, 12)), 0, 60);
  const emoji = typeof spec.emoji === 'string' && spec.emoji.trim() ? spec.emoji.trim() : '🍬';
  const kinds = ['túi', 'hộp', 'đĩa', 'xe'];
  const cont = kinds.includes(spec.container) ? spec.container : 'đĩa';
  const pg = Math.round(num(spec.perGroup, NaN)), gg = Math.round(num(spec.groups, NaN));
  let mode, ng, perG, rem;
  if (pg > 0) { mode = 'per'; perG = pg; ng = Math.floor(total / pg); rem = total % pg; }
  else if (gg > 0) { mode = 'groups'; ng = gg; perG = Math.floor(total / gg); rem = total % gg; }
  else { mode = 'groups'; ng = 2; perG = Math.floor(total / 2); rem = total % 2; }
  const dispNg = Math.min(ng, 12), dispPer = Math.min(perG, 12);
  const showRem = spec.showRemainder !== false;
  const showEq = !!spec.showEq;
  const showCount = !!spec.showCount;

  // bố cục các nhóm
  const colsC = dispNg <= 4 ? Math.max(1, dispNg) : dispNg <= 6 ? 3 : 4;
  const rowsC = Math.ceil(dispNg / colsC) || 0;
  const cellW = (W - 20) / colsC;
  const cw = Math.min(cellW - 10, 112);
  const ir = Math.max(1, dispPer <= 3 ? dispPer : dispPer === 4 ? 2 : dispPer <= 6 ? 3 : 4);
  const es = Math.min(32, (cw - 16) / ir);                          // cỡ ô emoji
  const rowsI = Math.max(1, Math.ceil(dispPer / ir));
  const padT = cont === 'đĩa' ? 6 : cont === 'xe' ? 16 : 24, padB = cont === 'đĩa' ? 26 : cont === 'xe' ? 26 : 10;
  const ch = Math.max(rowsI * es + padT + padB, cw * 0.78);
  const rowGap = showCount ? 36 : 14;
  const topPad = 12;
  const contH = rowsC ? rowsC * ch + (rowsC - 1) * rowGap + (showCount ? 28 : 0) : 0;
  const remH = rem > 0 ? 86 : 0;
  const eqH = showEq ? 46 : 0;
  const H = topPad + contH + (contH && remH ? 12 : 0) + remH + eqH + 10;

  const nameUnit = cont;
  const aria = `${total} ${emoji} chia ` + (mode === 'per' ? `thành các ${nameUnit}, mỗi ${nameUnit} ${perG} cái, được ${ng} ${nameUnit}` : `vào ${ng} ${nameUnit}, mỗi ${nameUnit} ${perG} cái`) +
    (rem > 0 && showRem ? `, còn dư ${rem} cái` : rem === 0 ? ', không dư' : '') + '.';
  const svg = svgRoot(W, H, aria, 'v-groups-svg');

  const boxEls = [];
  const itemEls = []; // {el, order, dx, dy}
  const slots = [];   // [group][slot] = {x,y}
  for (let gI = 0; gI < dispNg; gI++) {
    const rI = Math.floor(gI / colsC), cI = gI % colsC;
    const inRow = Math.min(colsC, dispNg - rI * colsC);
    const rowW = inRow * cellW;
    const gx = 10 + (W - 20 - rowW) / 2 + cI * cellW + (cellW - cw) / 2;
    const gy = topPad + rI * (ch + rowGap + (showCount ? 28 : 0) / Math.max(1, rowsC));
    const col = pal[gI % pal.length];
    const box = containerShape(cont, gx, gy, cw, ch, col);
    svg.appendChild(box);
    boxEls.push(box);
    const gridW = Math.min(dispPer, ir) * es;
    const sx = gx + (cw - gridW) / 2;
    const blockH = rowsI * es;
    const top = cont === 'đĩa' ? gy + ch - padB - blockH + 4 : gy + padT + (ch - padT - padB - blockH) / 2;
    slots[gI] = [];
    for (let k = 0; k < dispPer; k++) {
      const r = Math.floor(k / ir), c = k % ir;
      const rowCount = Math.min(ir, dispPer - r * ir);
      const off = (Math.min(dispPer, ir) - rowCount) * es / 2;
      slots[gI].push({ x: sx + off + (c + 0.5) * es, y: top + (r + 0.5) * es });
    }
    if (showCount) {
      svg.appendChild(s('text', { x: gx + cw / 2, y: gy + ch + 24, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: C.ink }, String(perG)));
    }
  }

  // thứ tự chia
  const order = []; // {g,k}
  if (mode === 'groups') { for (let k = 0; k < dispPer; k++) for (let gI = 0; gI < dispNg; gI++) order.push({ g: gI, k }); }
  else { for (let gI = 0; gI < dispNg; gI++) for (let k = 0; k < dispPer; k++) order.push({ g: gI, k }); }

  const startX = W / 2, startY = -4;
  order.forEach((o, idx) => {
    const p = slots[o.g][o.k];
    const el = s('text', { x: p.x, y: p.y + es * 0.3, 'text-anchor': 'middle', 'font-size': es * 0.95, class: 'v-groups-item v-groups-pop' }, emoji);
    svg.appendChild(el);
    itemEls.push({ el, idx, dx: startX - p.x, dy: startY - (p.y) });
  });

  // phần dư
  let remEls = [];
  let remBox = null;
  if (rem > 0) {
    const ry = topPad + contH + (contH ? 12 : 0);
    const remItems = Math.min(rem, 16);
    const rsz = Math.min(32, (W - 40 - 80) / Math.max(1, remItems));
    if (showRem) {
      remBox = s('g', { class: 'v-groups-pop' });
      remBox.appendChild(s('rect', { x: 8, y: ry, width: W - 16, height: remH - 6, rx: 18, fill: '#FFE9A8', stroke: '#F7BE2C', 'stroke-width': 3, 'stroke-dasharray': '9 6' }));
      remBox.appendChild(s('rect', { x: 22, y: ry + (remH - 6) / 2 - 17, width: 62, height: 34, rx: 17, fill: '#F7BE2C' }));
      remBox.appendChild(s('text', { x: 53, y: ry + (remH - 6) / 2 + 7, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: C.ink }, 'dư ' + rem));
      svg.appendChild(remBox);
    }
    const startRx = showRem ? 100 : (W - remItems * rsz) / 2;
    void startRx;
    const areaW = showRem ? W - 108 - 12 : remItems * rsz;
    const gapR = Math.min(rsz + 4, areaW / remItems);
    const rx0 = showRem ? 100 : startRx;
    for (let k = 0; k < remItems; k++) {
      const px = rx0 + (k + 0.5) * gapR, py = ry + (remH - 6) / 2;
      const el = s('text', { x: px, y: py + rsz * 0.3, 'text-anchor': 'middle', 'font-size': rsz * 0.88, class: 'v-groups-item v-groups-pop' }, emoji);
      svg.appendChild(el);
      itemEls.push({ el, idx: order.length + k, dx: startX - px, dy: startY - py, rem: true });
      remEls.push(el);
    }
  }
  if (showEq) {
    const eqY = H - 10 - 12;
    svg.appendChild(s('text', { x: W / 2, y: eqY, 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 800, fill: C.ink }, `${total} ÷ ${mode === 'per' ? perG : ng} = ${mode === 'per' ? ng : perG}` + (rem ? ` (dư ${rem})` : '')));
  }

  setupAnim(svg, ctx, spec, (A) => {
    boxEls.forEach((b, i) => A(b, [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1)' }], { delay: i * 70, duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' }));
    const n = itemEls.length;
    const step = Math.min(120, 1500 / Math.max(1, n));
    const t0 = 300;
    itemEls.forEach(({ el, idx, dx, dy }) => {
      A(el, [
        { opacity: 0, transform: `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(1.3)` },
        { opacity: 1, transform: `translate(${(dx * 0.5).toFixed(1)}px,${(dy * 0.5 - 22).toFixed(1)}px) scale(1.25)`, offset: 0.4 },
        { opacity: 1, transform: 'translate(0,0) scale(1)' },
      ], { delay: t0 + idx * step, duration: 520, easing: 'cubic-bezier(.4,.1,.3,1)' });
    });
    if (remBox) A(remBox, [{ opacity: 0 }, { opacity: 1 }], { delay: t0 + (n - remEls.length) * step, duration: 300 });
  });
  return svg;
}

export default {
  kinds: ['groups'],
  render: safe('groups', renderGroups),
};
