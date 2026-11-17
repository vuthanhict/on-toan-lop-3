// place (bảng hàng) + blocks3d (khối 3D) — Agent hình 1
import { C, PAL, FONT, h, s, num, clamp, fmt, groupDigits, palOf, inkOn, setupAnim, safe, svgRoot, ensureStyle } from './_v1.js';

const W = 360;

const ROW_NAMES = ['Đơn vị', 'Chục', 'Trăm', 'Nghìn', 'Chục nghìn', 'Trăm nghìn', 'Triệu', 'Chục triệu', 'Trăm triệu'];
const CLASS_NAMES = ['Lớp đơn vị', 'Lớp nghìn', 'Lớp triệu'];

ensureStyle('v-place-style', `
.v-place-svg text{font-family:${FONT};font-weight:700;}
.v-place-svg .v-place-pop{transform-box:fill-box;transform-origin:center;}
`);

const estW = (str, fs) => {
  let w = 0;
  for (const ch of String(str)) w += (ch === ' ' ? 0.3 : /[0-9]/.test(ch) ? 0.56 : 0.58) * fs;
  return w;
};

function renderPlace(spec, ctx) {
  const pal = palOf(ctx);
  let digits = String(spec.digits == null ? '' : spec.digits).replace(/[^0-9]/g, '');
  if (!digits) digits = '0';
  if (digits.length > 9) digits = digits.slice(-9);
  const n = digits.length;
  const labels = Array.isArray(spec.labels) ? spec.labels : [];
  const nameOf = i => (labels[i] != null && labels[i] !== '') ? String(labels[i]) : ROW_NAMES[i] || '';
  let hl = spec.highlight;
  hl = Array.isArray(hl) ? hl.map(Number) : (hl === undefined || hl === null ? [] : [Number(hl)]);
  hl = hl.filter(v => isFinite(v));
  const hasHl = hl.length > 0;
  const hide = new Set((Array.isArray(spec.hideDigits) ? spec.hideDigits : (spec.hideDigits === undefined ? [] : [spec.hideDigits])).map(Number));
  const showValue = !!spec.showValue;
  const grouping = spec.groupThousands !== false && n > 3;

  const gapC = 4, gapG = grouping ? 12 : 0;
  const groupsCount = grouping ? Math.ceil(n / 3) : 1;
  const extra = grouping ? (groupsCount - 1) * gapG : 0;
  const cw = Math.min(62, (W - 12 - extra - (n - 1) * gapC) / n);
  const total = n * cw + (n - 1) * gapC + extra;
  const x0 = (W - total) / 2;
  const xs = [];
  {
    let xx = x0;
    for (let i = n - 1; i >= 0; i--) {
      xs[i] = xx;
      xx += cw + gapC;
      if (grouping && i % 3 === 0 && i > 0) xx += gapG - gapC + 0;
    }
  }

  const rowGroupH = grouping ? 30 : 0;
  const yGroup = 6;
  const yHead = yGroup + rowGroupH + (grouping ? 4 : 0);
  const headH = 46;
  const yDig = yHead + headH + 6;
  const digH = 66;
  const yVal = yDig + digH + 6;
  const valH = 34;
  const H = (showValue ? yVal + valH : yDig + digH) + 10;

  const readNum = groupDigits(digits.replace(/^0+(?=\d)/, ''));
  const aria = `Bảng hàng của số ${readNum}` + (hasHl ? ', nhấn mạnh hàng ' + hl.map(i => nameOf(i).toLowerCase()).join(', ') : '') +
    '. Từ trái sang phải: ' + [...digits].map((d, k) => `${hide.has(n - 1 - k) ? 'ô trống' : d} ${nameOf(n - 1 - k).toLowerCase()}`).join(', ') + '.';
  const svg = svgRoot(W, H, aria, 'v-place-svg');

  // nhãn lớp
  if (grouping) {
    for (let g = 0; g < groupsCount; g++) {
      const iLo = g * 3, iHi = Math.min(n - 1, g * 3 + 2);
      const xl = xs[iHi], xr = xs[iLo] + cw;
      const lbl = CLASS_NAMES[g] || '';
      const needW = estW(lbl, 15) + 20;
      let bx = xl, bw = xr - xl;
      if (bw < needW) { bx = Math.max(2, xr - needW); bw = xr - bx; }
      svg.appendChild(s('rect', { x: bx, y: yGroup, width: bw, height: rowGroupH - 4, rx: 12, fill: pal[g % pal.length], opacity: 0.2 }));
      svg.appendChild(s('text', { x: bx + bw / 2, y: yGroup + 19, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: C.ink }, CLASS_NAMES[g] || ''));
      if (g > 0) {
        const vx = xr + gapG / 2 + gapC / 2 - 0.5 + 0;
        void vx;
      }
    }
    // vạch ngăn lớp
    for (let g = 1; g < groupsCount; g++) {
      const i = g * 3; // cột đơn vị đầu của lớp trái
      const vx = xs[i] + cw + (gapG + gapC) / 2 - gapC / 2 + 0;
      svg.appendChild(s('line', { x1: vx, y1: yHead - 2, x2: vx, y2: (showValue ? yVal + valH : yDig + digH) + 2, stroke: C.ink, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': '1 7', opacity: 0.55 }));
    }
  }

  const cols = [];
  for (let i = 0; i < n; i++) {
    const d = digits[n - 1 - i];
    const col = pal[i % pal.length];
    const isHl = hl.includes(i);
    const dim = hasHl && !isHl;
    const x = xs[i];
    const g = s('g');
    const gHead = s('g', { opacity: dim ? 0.55 : 1 });
    // đầu cột
    gHead.appendChild(s('rect', { x, y: yHead, width: cw, height: headH, rx: 12, fill: col, opacity: isHl ? 1 : 0.22 }));
    const nm = nameOf(i);
    const fsH = cw < 48 ? 14 : 15;
    const tcol = isHl ? inkOn(col) : C.ink;
    if (nm.length <= 6 || !nm.includes(' ')) {
      gHead.appendChild(s('text', { x: x + cw / 2, y: yHead + headH / 2 + 5.5, 'text-anchor': 'middle', 'font-size': fsH, 'font-weight': 800, fill: tcol }, nm));
    } else {
      const k = nm.lastIndexOf(' ');
      gHead.appendChild(s('text', { x: x + cw / 2, y: yHead + 19, 'text-anchor': 'middle', 'font-size': fsH, 'font-weight': 800, fill: tcol }, nm.slice(0, k)));
      gHead.appendChild(s('text', { x: x + cw / 2, y: yHead + 37, 'text-anchor': 'middle', 'font-size': fsH, 'font-weight': 800, fill: tcol }, nm.slice(k + 1)));
    }
    g.appendChild(gHead);
    // ô chữ số
    const cell = s('g', { class: 'v-place-pop', opacity: dim ? 0.7 : 1 });
    const hidden = hide.has(i);
    cell.appendChild(s('rect', { x, y: yDig + 3, width: cw, height: digH, rx: 14, fill: '#263250', opacity: 0.08 }));
    cell.appendChild(s('rect', {
      x, y: yDig, width: cw, height: digH, rx: 14,
      fill: hidden ? '#FFE9A8' : (isHl ? col : '#FFFFFF'),
      stroke: hidden ? pal[4] : col, 'stroke-width': isHl ? 5 : 3.5, 'stroke-dasharray': hidden ? '7 5' : null,
    }));
    cell.appendChild(s('text', {
      x: x + cw / 2, y: yDig + digH / 2 + 13, 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 800,
      fill: hidden ? '#D96A1C' : (isHl ? inkOn(col) : C.ink),
    }, hidden ? '?' : d));
    g.appendChild(cell);
    // giá trị
    let valEl = null;
    if (showValue) {
      valEl = s('g', { opacity: dim ? 0.6 : 1 });
      const v = hidden ? '?' : (d === '0' ? '0' : groupDigits(d + '0'.repeat(i)));
      valEl.appendChild(s('rect', { x, y: yVal, width: cw, height: valH, rx: 11, fill: isHl ? col : '#FFFFFF', stroke: col, 'stroke-width': 2.5, opacity: isHl ? 1 : 1 }));
      valEl.appendChild(s('text', { x: x + cw / 2, y: yVal + valH / 2 + 5.2, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: isHl ? inkOn(col) : C.ink, 'letter-spacing': v.length > 6 ? '-0.4' : '0' }, v));
      g.appendChild(valEl);
    }
    svg.appendChild(g);
    cols.push({ g, cell, head: gHead, valEl, i });
  }
  // nhịp nhẹ cho cột nhấn mạnh
  setupAnim(svg, ctx, spec, (A) => {
    const step = Math.min(0.32, 1.7 / n);
    cols.forEach((c, k) => {
      A(c.head, [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'translateY(0)' }], { delay: k * step * 1000, duration: 280 });
      A(c.cell, [{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1)' }], { delay: (k * step + 0.1) * 1000, duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      if (c.valEl) A(c.valEl, [{ opacity: 0 }, { opacity: 1 }], { delay: (k * step + 0.35) * 1000, duration: 300 });
    });
  });
  return svg;
}

// ------------------------------------------------------------------ blocks3d
const TYPES = [
  { key: 'thousands', name: 'nghìn', val: 1000, ci: 3 },
  { key: 'hundreds', name: 'trăm', val: 100, ci: 2 },
  { key: 'tens', name: 'chục', val: 10, ci: 1 },
  { key: 'ones', name: 'đơn vị', val: 1, ci: 0 },
];

ensureStyle('v-blocks3d-style', `
.v-blocks3d{position:relative;width:100%;max-width:520px;margin:0 auto;font-family:${FONT};color:${C.ink};
  touch-action:pan-y;user-select:none;-webkit-user-select:none;--rx:-22deg;--ry:-30deg;}
.v-blocks3d-row{display:flex;align-items:center;gap:6px;padding:8px 8px;border-radius:18px;margin:4px 0;}
.v-blocks3d-cap{flex:0 0 70px;text-align:center;line-height:1.1}
.v-blocks3d-cap b{display:block;font-size:30px;font-weight:800}
.v-blocks3d-cap span{display:block;font-size:15px;font-weight:700}
.v-blocks3d-area{flex:1 1 auto;display:flex;flex-wrap:wrap;justify-content:center;align-content:center;gap:0;min-width:0}
.v-blocks3d-cell{position:relative;perspective:520px;perspective-origin:50% 40%;flex:0 0 auto;display:flex;align-items:center;justify-content:center}
.v-blocks3d-drop{transform-style:preserve-3d;position:relative;width:0;height:0}
.v-blocks3d-tilt{transform-style:preserve-3d;transform:rotateX(var(--rx,-22deg));position:absolute;left:0;top:0}
.v-blocks3d-sway{transform-style:preserve-3d;position:absolute;left:0;top:0;transform:rotateY(var(--ry,-30deg))}
.v-blocks3d.v-b3-spin .v-blocks3d-sway{animation:v-blocks3d-sway 6s ease-in-out infinite alternate;animation-delay:var(--dl,0s)}
.v-blocks3d.v-b3-drag .v-blocks3d-sway{animation-play-state:paused}
@keyframes v-blocks3d-sway{from{transform:rotateY(calc(var(--ry,-30deg) - 28deg))}to{transform:rotateY(calc(var(--ry,-30deg) + 28deg))}}
.v-blocks3d-box{transform-style:preserve-3d;position:absolute;left:0;top:0;width:0;height:0}
.v-blocks3d-f{position:absolute;left:0;top:0;box-sizing:border-box;border-radius:2px;
  border:1.5px solid rgba(0,0,0,.28);backface-visibility:visible;}
.v-blocks3d-grid .v-blocks3d-f,.v-blocks3d-flat .v-blocks3d-g{
  background-image:linear-gradient(var(--sh,transparent),var(--sh,transparent)),
   linear-gradient(rgba(255,255,255,.7) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(255,255,255,.7) 1.5px,transparent 1.5px);
  background-size:100% 100%,var(--gx,10%) var(--gy,10%),var(--gx,10%) var(--gy,10%);}
.v-blocks3d-flat .v-blocks3d-g{position:relative;box-sizing:border-box;border:2px solid rgba(0,0,0,.25);border-radius:5px;}
.v-blocks3d-hint{display:block;text-align:center;font-size:14px;font-weight:700;opacity:.65;margin:2px 0 0}
.v-blocks3d-total{display:block;text-align:center;font-size:26px;font-weight:800;margin:6px 0 2px}
.v-blocks3d-pop{display:inline-block}
@media (prefers-reduced-motion:reduce){.v-blocks3d.v-b3-spin .v-blocks3d-sway{animation:none}}
`);

function css3dOK() {
  try { return typeof CSS !== 'undefined' && CSS.supports && CSS.supports('transform-style', 'preserve-3d') && CSS.supports('perspective', '100px'); } catch (e) { return false; }
}

// dựng một hộp 3D (6 mặt) kích thước w×hgt×d; kiểu lưới nếu grid
function box3d(w, hgt, d, color, gridMode) {
  const wrap = h('div', { class: 'v-blocks3d-box' + (gridMode ? ' v-blocks3d-grid' : '') });
  const mk = (cw, ch, tf, shade, grid) => {
    const f = h('div', { class: 'v-blocks3d-f' });
    f.style.width = cw + 'px';
    f.style.height = ch + 'px';
    f.style.marginLeft = -cw / 2 + 'px';
    f.style.marginTop = -ch / 2 + 'px';
    f.style.transform = tf;
    f.style.backgroundColor = color;
    f.style.setProperty('--sh', shade);
    if (grid) { f.style.setProperty('--gx', grid[0]); f.style.setProperty('--gy', grid[1]); }
    else f.style.backgroundImage = `linear-gradient(${shade},${shade})`;
    return f;
  };
  const g = gridMode;
  // gx,gy: lưới lặp (mỗi ô = 10%)
  wrap.appendChild(mk(w, hgt, `translateZ(${d / 2}px)`, 'rgba(255,255,255,0)', g && g.front));
  wrap.appendChild(mk(w, hgt, `rotateY(180deg) translateZ(${d / 2}px)`, 'rgba(0,0,0,.28)', g && g.front));
  wrap.appendChild(mk(d, hgt, `rotateY(90deg) translateZ(${w / 2}px)`, 'rgba(0,0,0,.2)', g && g.side));
  wrap.appendChild(mk(d, hgt, `rotateY(-90deg) translateZ(${w / 2}px)`, 'rgba(0,0,0,.2)', g && g.side));
  wrap.appendChild(mk(w, d, `rotateX(90deg) translateZ(${hgt / 2}px)`, 'rgba(255,255,255,.28)', g && g.top));
  wrap.appendChild(mk(w, d, `rotateX(-90deg) translateZ(${hgt / 2}px)`, 'rgba(0,0,0,.35)', g && g.top));
  return wrap;
}

function renderBlocks(spec, ctx) {
  const pal = palOf(ctx);
  const cnt = {};
  TYPES.forEach(t => { cnt[t.key] = clamp(Math.round(num(spec[t.key], 0)), 0, 9); });
  let active = TYPES.filter(t => cnt[t.key] > 0);
  if (!active.length) active = [TYPES[3]];
  const totalVal = TYPES.reduce((a, t) => a + cnt[t.key] * t.val, 0);
  const caption = !!spec.caption;
  const use3d = !ctx.lite && css3dOK();

  const root = h('div', {
    class: 'v-blocks3d' + (use3d && !ctx.reduced ? ' v-b3-spin' : ''),
    role: 'img',
    'aria-label': `Khối ${use3d ? '3D ' : ''}biểu diễn số ${fmt(totalVal, 1000)}: ` +
      (TYPES.filter(t => cnt[t.key]).map(t => `${cnt[t.key]} ${t.name === 'đơn vị' ? 'đơn vị' : t.name}`).join(', ') || 'không có khối') + '.',
  });

  const AW = 240;           // bề rộng vùng khối
  const dropEls = [];
  const rowEls = [];

  active.forEach((t, ri) => {
    const k = cnt[t.key];
    const col = pal[t.ci % pal.length];
    const row = h('div', { class: 'v-blocks3d-row' });
    row.style.background = col + '1F';
    const cap = h('div', { class: 'v-blocks3d-cap' });
    if (caption) {
      cap.appendChild(h('b', { style: { color: C.ink } }, String(k)));
      cap.appendChild(h('span', {}, t.name));
    } else {
      cap.style.flexBasis = '4px';
    }
    row.appendChild(cap);
    const area = h('div', { class: 'v-blocks3d-area' });

    // kích thước mỗi khối
    let cols, S, cellW, cellH;
    if (t.key === 'thousands' || t.key === 'hundreds') {
      cols = k <= 4 ? k : k <= 6 ? 3 : k <= 8 ? 4 : 5;
      S = Math.min(56, Math.floor(AW / cols / 1.4));
      cellW = Math.floor(S * 1.4); cellH = Math.floor(S * 1.5);
    } else if (t.key === 'tens') {
      cols = Math.min(k, 9);
      S = 54; cellW = Math.min(30, Math.floor(AW / cols)); cellH = 74;
    } else {
      cols = Math.min(k, 9);
      S = 14; cellW = Math.min(30, Math.floor(AW / cols)); cellH = 34;
    }
    area.style.width = cellW * cols + 'px';
    area.style.flex = '0 0 auto';
    area.style.margin = '0 auto';

    for (let q = 0; q < k; q++) {
      const cell = h('div', { class: 'v-blocks3d-cell' });
      cell.style.width = cellW + 'px';
      cell.style.height = cellH + 'px';
      let piece;
      if (use3d) {
        const drop = h('div', { class: 'v-blocks3d-drop' });
        const tilt = h('div', { class: 'v-blocks3d-tilt' });
        const sway = h('div', { class: 'v-blocks3d-sway' });
        sway.style.setProperty('--dl', -((ri * 3 + q) % 7) * 0.45 + 's');
        let bx;
        if (t.key === 'thousands') bx = box3d(S, S, S, col, { front: ['10%', '10%'], side: ['10%', '10%'], top: ['10%', '10%'] });
        else if (t.key === 'hundreds') bx = box3d(S, S, Math.max(8, S / 7), col, { front: ['10%', '10%'], side: ['100%', '10%'], top: ['10%', '100%'] });
        else if (t.key === 'tens') bx = box3d(10, S, 10, col, { front: ['100%', '10%'], side: ['100%', '10%'], top: ['100%', '100%'] });
        else bx = box3d(S, S, S, col, null);
        sway.appendChild(bx); tilt.appendChild(sway); drop.appendChild(tilt);
        piece = drop;
        cell.appendChild(drop);
        // gốc toạ độ ở giữa ô
      } else {
        const flat = h('div', { class: 'v-blocks3d-flat' });
        const g = h('div', { class: 'v-blocks3d-g' });
        g.style.background = col;
        g.style.setProperty('--sh', 'rgba(255,255,255,0)');
        if (t.key === 'thousands' || t.key === 'hundreds') {
          g.style.width = g.style.height = S + 'px';
          if (t.key === 'thousands') { g.style.boxShadow = `5px 5px 0 ${col}, 5px 5px 0 2px rgba(0,0,0,.25)`; }
          g.style.setProperty('--gx', '10%'); g.style.setProperty('--gy', '10%');
          g.style.backgroundImage = `linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0)),linear-gradient(rgba(255,255,255,.7) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(255,255,255,.7) 1.5px,transparent 1.5px)`;
          g.style.backgroundSize = '100% 100%,10% 10%,10% 10%';
          if (t.key === 'hundreds') g.style.opacity = '0.95';
        } else if (t.key === 'tens') {
          g.style.width = '13px'; g.style.height = S + 'px';
          g.style.backgroundImage = `linear-gradient(rgba(255,255,255,.75) 1.5px,transparent 1.5px)`;
          g.style.backgroundSize = '100% 10%';
        } else {
          g.style.width = g.style.height = '15px'; g.style.borderRadius = '4px';
        }
        flat.appendChild(g);
        piece = flat;
        cell.appendChild(flat);
      }
      area.appendChild(cell);
      dropEls.push({ el: piece, ri, q });
    }
    row.appendChild(area);
    root.appendChild(row);
    rowEls.push({ row, cap });
  });

  if (caption) {
    const tt = h('span', { class: 'v-blocks3d-total' }, '= ' + fmt(totalVal, 1000));
    root.appendChild(tt);
  }
  if (use3d) root.appendChild(h('span', { class: 'v-blocks3d-hint' }, 'Chạm và kéo để xoay'));

  // kéo/chạm để xoay (gắn trên chính phần tử, không toàn cục)
  if (use3d) {
    let drag = null, ry = -30, rx = -22;
    const apply = () => { root.style.setProperty('--ry', ry + 'deg'); root.style.setProperty('--rx', rx + 'deg'); };
    root.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, y: e.clientY, ry, rx, moved: false };
    });
    root.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        root.classList.add('v-b3-drag');
        try { root.setPointerCapture(e.pointerId); } catch (_) {}
      }
      ry = drag.ry + dx * 0.7;
      rx = clamp(drag.rx + dy * 0.4, -70, 5);
      apply();
    });
    const end = () => { if (drag && drag.moved) root.classList.remove('v-b3-drag'); drag = null; };
    root.addEventListener('pointerup', end);
    root.addEventListener('pointercancel', end);
    root.style.touchAction = 'pan-y';
  }

  setupAnim(root, ctx, spec, (A) => {
    const nA = active.length;
    dropEls.forEach(({ el, ri, q }) => {
      const delay = ri * 520 + q * Math.min(70, 400 / Math.max(1, cnt[active[ri].key]));
      A(el, [{ opacity: 0, transform: 'translateY(-70px)' }, { opacity: 1, transform: 'translateY(6px)', offset: 0.7 }, { opacity: 1, transform: 'translateY(0)' }], { delay, duration: 520, easing: 'cubic-bezier(.3,.8,.4,1)' });
    });
    rowEls.forEach(({ cap }, ri) => A(cap, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { delay: ri * 520 + 120, duration: 350, easing: 'cubic-bezier(.34,1.56,.64,1)' }));
    void nA;
  });
  return root;
}

export default {
  kinds: ['place', 'blocks3d'],
  render(spec, ctx) {
    const kind = spec && spec.kind === 'blocks3d' ? 'blocks3d' : 'place';
    return safe(kind, kind === 'blocks3d' ? renderBlocks : renderPlace)(spec, ctx);
  },
};
