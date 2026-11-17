// "Viết nháp từng bước": vcalc (đặt tính dọc + − ×), vdiv (chia ngắn), workout (các dòng viết tay nối tiếp).
// Nền vở ô li, mực tím, chữ số viết tay vào ô cố định (text-anchor=middle) nên luôn thẳng cột.
// Logic số nằm ở ../core/paper.js (thuần, test được trong Node).
import { s, ensureStyle, setupAnim, fallback } from './_v1.js';
import * as P from '../core/paper.js';

const INK = '#4B34A8';      // mực tím đậm (chữ số)
const INK2 = '#6C4FD0';     // mực tím vừa (số nhớ nhỏ, nét kẻ)
const ORANGE = '#F5893A';   // khung nổi bật bước đang làm
const ORANGE_E = '#B24A0E'; // chú thích bên lề
const PAPER = '#FFFEFB';    // giấy kem
const GRID = '#D4DCFD';     // kẻ ô xanh nhạt
const HAND = "'Patrick Hand','Baloo 2','Nunito',system-ui,sans-serif";
const W = 360, G = 22, CW = 44; // chiều rộng khung, ô li, ô chữ số (2 ô li)
const SMALL = 20;               // cỡ chữ số nhỏ (nhớ / số mới)

const CSS = `.v-paper{display:block;width:100%;height:auto;max-width:420px;margin:0 auto;overflow:visible;font-family:${HAND};-webkit-user-select:none;user-select:none}
.v-paper text{font-family:${HAND};font-weight:400}`;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const intv = (v, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? n : d; };
// nhiễu nhỏ, cố định theo (a,b) — để nét chữ có vẻ viết tay nhưng vẫn thẳng cột
const jit = (a, b) => { const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };

/* ------------------------------------------------------------------ */
/*  Khung chung: nền giấy ô li + sổ đăng ký các phần tử để hoạt hình   */
/* ------------------------------------------------------------------ */
function makeSvg(h, label) {
  ensureStyle('v-paper-style', CSS);
  try { if (typeof document !== 'undefined' && document.fonts && document.fonts.load) document.fonts.load(`36px 'Patrick Hand'`).catch(() => {}); } catch (e) { /* bỏ qua */ }
  const svg = s('svg', { viewBox: `0 0 ${W} ${h}`, role: 'img', 'aria-label': label, class: 'v-paper', xmlns: 'http://www.w3.org/2000/svg', preserveAspectRatio: 'xMidYMid meet' });
  svg.appendChild(s('rect', { x: 1.5, y: 1.5, width: W - 3, height: h - 3, rx: 14, fill: PAPER, stroke: '#C5CFF5', 'stroke-width': 2 }));
  let d = '';
  for (let x = G; x < W - 1; x += G) d += `M${x} 3V${h - 3}`;
  for (let y = G; y < h - 1; y += G) d += `M3 ${y}H${W - 3}`;
  svg.appendChild(s('path', { d, stroke: GRID, 'stroke-width': 1.3, fill: 'none' }));
  return svg;
}

function Pen(svg) {
  const items = []; // {node, idx, type}
  const api = {
    items,
    layer: (idx, type) => { const g = s('g', null); svg.appendChild(g); items.push({ node: g, idx, type: type || 'text' }); return g; },
    text(str, x, y, size, fill, idx, o) {
      o = o || {};
      const outer = s('g', null);
      const t = s('text', { x, y, 'text-anchor': o.anchor || 'middle', 'font-size': size, fill, 'text-rendering': 'geometricPrecision' });
      t.textContent = str;
      if (o.rot) t.setAttribute('transform', `rotate(${o.rot} ${x} ${y - size * 0.3})`);
      outer.appendChild(t);
      (o.parent || svg).appendChild(outer);
      items.push({ node: outer, idx, type: 'text' });
      return t;
    },
    line(x1, y1, x2, y2, stroke, w, idx, o) {
      o = o || {};
      const len = Math.hypot(x2 - x1, y2 - y1);
      const ln = s('line', { x1, y1, x2, y2, stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-dasharray': len + 0.5, 'stroke-dashoffset': 0, 'data-len': len });
      svg.appendChild(ln);
      items.push({ node: ln, idx, type: 'line', len });
      return ln;
    },
    add(node, idx, type) { svg.appendChild(node); items.push({ node, idx, type: type || 'text' }); return node; },
  };
  return api;
}

// hoạt hình "viết": chữ hiện dần từ trái sang phải, nét gạch được kẻ ra
function makeBuild(items, from, ctx) {
  return (A) => {
    const all = items.filter((it) => (it.idx < 0 ? from <= 0 : it.idx >= from)).sort((x, y) => x.idx - y.idx);
    const rects = all.filter((it) => it.type === 'rect'), todo = all.filter((it) => it.type !== 'rect');
    const n = todo.length;
    if (!n) { rects.forEach((it) => A(it.node, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 })); return; }
    const gap = clamp(2000 / n, 55, 340);
    let t = 0, lastIdx = -99;
    todo.forEach((it) => {
      if (it.idx !== lastIdx && lastIdx !== -99) t += gap; // mỗi bước nhỏ cách nhau
      else if (it.idx === lastIdx) t += gap * 0.45;
      lastIdx = it.idx;
      if (it.type === 'line') {
        A(it.node, [{ strokeDashoffset: it.len + 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1 }], { duration: 280, delay: t, easing: 'ease-out', fill: 'backwards' });
      } else {
        A(it.node, [{ opacity: 0, clipPath: 'inset(-10% 100% -10% -10%)', transform: 'translateY(-3px)' }, { opacity: 1, clipPath: 'inset(-10% -10% -10% -10%)', transform: 'translateY(0)' }], { duration: 340, delay: t });
      }
    });
    rects.forEach((it) => A(it.node, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: t + 120 }));
  };
}

function hlRect(pen, x, y, w, h) {
  const r = s('rect', { x, y, width: w, height: h, rx: 10, fill: ORANGE, 'fill-opacity': 0.13, stroke: ORANGE, 'stroke-width': 2.6 });
  pen.add(r, -2, 'rect');
  return r;
}

/* ------------------------------------------------------------------ */
/*  vcalc — đặt tính dọc                                               */
/* ------------------------------------------------------------------ */
const OPW = { '+': 'cộng', '−': 'trừ', '×': 'nhân' };

function opShape(pen, op, cx, cy, r) {
  const st = { stroke: INK, 'stroke-width': 3.6, 'stroke-linecap': 'round', fill: 'none' };
  const g = s('g', null);
  if (op === '+') { g.appendChild(s('path', Object.assign({ d: `M${cx - r} ${cy}H${cx + r}M${cx} ${cy - r}V${cy + r}` }, st))); }
  else if (op === '−') { g.appendChild(s('path', Object.assign({ d: `M${cx - r} ${cy}H${cx + r}` }, st))); }
  else if (op === '×') { const q = r * 0.8; g.appendChild(s('path', Object.assign({ d: `M${cx - q} ${cy - q}L${cx + q} ${cy + q}M${cx + q} ${cy - q}L${cx - q} ${cy + q}` }, st))); }
  else { g.appendChild(s('path', Object.assign({ d: `M${cx - r} ${cy}H${cx + r}` }, st))); g.appendChild(s('circle', { cx, cy: cy - r * 0.95, r: 2.6, fill: INK })); g.appendChild(s('circle', { cx, cy: cy + r * 0.95, r: 2.6, fill: INK })); }
  pen.add(g, -1, 'text');
}

function vcalc(spec, ctx) {
  let op, a, b, micro, res;
  try {
    op = P.normOp(spec.op || '+');
    a = clamp(intv(spec.a, 0), 0, 9999); b = clamp(intv(spec.b, 0), 0, 9999);
    micro = P.vcalcMicro(op, a, b);
    res = P.vcalcResult(op, a, b);
  } catch (e) { return fallback('vcalc'); }
  const N = micro.length;
  const show = spec.show === 'problem' || spec.show === 'work' ? spec.show : 'full';
  const upto = show === 'problem' ? 0 : clamp(intv(spec.upto, N), 0, N);
  const done = spec.done === true || (spec.done === undefined && upto >= N && spec.upto === undefined && show === 'full');
  const showRes = show === 'full';

  const resStr = String(res);
  const nd = Math.max(String(a).length, String(b).length, resStr.length);
  const cols = nd + 1;
  const offX = Math.round(((W - cols * CW) / 2) / G) * G;
  const xr = offX + cols * CW;
  const cx = (c) => xr - (c + 0.5) * CW;
  const Y_MARK = 22 + 17, Y_A = 44 + 33, Y_B = 88 + 33, Y_RULE = 132, Y_R = 132 + 33;
  const H = 198;
  const names = ['đơn vị', 'chục', 'trăm', 'nghìn', 'chục nghìn'];
  let label = `Đặt tính dọc: ${P.fmt(a)} ${OPW[op]} ${P.fmt(b)}.`;
  if (show === 'full' && upto >= N) label += ` Kết quả ${P.fmt(res)}.`;
  else if (upto > 0) { const m = micro[upto - 1]; label += ` Đã làm đến hàng ${names[m.col] || ''}.`; }
  const svg = makeSvg(H, label);
  const pen = Pen(svg);

  // khung nổi bật bước đang làm
  const from = spec.from !== undefined ? clamp(intv(spec.from, 0), 0, N) : (upto > 0 && upto < N ? upto - 1 : 0);
  if (upto > 0 && !done) {
    let lo = 99, hi = -1;
    for (let i = Math.min(from, upto - 1); i < upto; i++) { const c = micro[i].col; lo = Math.min(lo, c); hi = Math.max(hi, c); }
    if (hi >= 0) hlRect(pen, cx(hi) - CW / 2 + 2, 24, (hi - lo + 1) * CW - 4, 152);
  } else if (done && showRes) {
    hlRect(pen, cx(resStr.length - 1) - CW / 2 + 1, Y_RULE + 3, resStr.length * CW - 2, 44);
  }

  // trạng thái từ các bước nhỏ đã làm
  const hist = {}, carries = [], outs = [];
  for (let i = 0; i < upto; i++) {
    const m = micro[i];
    if (m.kind === 'regroup') m.changes.forEach((ch) => { (hist[ch.col] = hist[ch.col] || []).push({ v: ch.to, idx: i }); });
    else if (m.kind === 'carry') carries.push({ col: m.col, v: m.digit, idx: i });
    else if (m.kind === 'digit' || m.kind === 'lead') outs.push({ col: m.col, v: m.digit, idx: i });
  }
  const dstr = (n) => String(n);
  const rot = (c, k) => +(jit(c + k * 7, k) * 1.8).toFixed(2);

  // số thứ nhất (a), số thứ hai (b), dấu phép tính, vạch kẻ
  const A = dstr(a), B = dstr(b);
  for (let c = 0; c < A.length; c++) {
    const ch = A[A.length - 1 - c];
    pen.text(ch, cx(c), Y_A + jit(c, 1) * 1.2, 36, INK, -1, { rot: rot(c, 1) });
    if (hist[c]) pen.line(cx(c) - 13, Y_A - 4, cx(c) + 13, Y_A - 25, INK, 3, hist[c][0].idx);
  }
  for (let c = 0; c < B.length; c++) pen.text(B[B.length - 1 - c], cx(c), Y_B + jit(c, 2) * 1.2, 36, INK, -1, { rot: rot(c, 2) });
  opShape(pen, op, offX + CW / 2, Y_B - 13, 11);
  pen.line(offX + 4, Y_RULE, xr - 2, Y_RULE, INK2, 3.2, -1);

  // số mới viết nhỏ phía trên (nhóm lại khi trừ: số cũ gạch bỏ rồi viết số mới)
  Object.keys(hist).forEach((k) => {
    const c = Number(k), list = hist[c];
    const w = (v) => String(v).length * 10.5;
    const total = list.reduce((acc, it) => acc + w(it.v), 0) + (list.length - 1) * 5;
    let x = cx(c) - total / 2;
    list.forEach((it, j) => {
      const wi = w(it.v), mid = x + wi / 2;
      pen.text(String(it.v), mid, Y_MARK, SMALL, INK2, it.idx, { rot: rot(c, 3 + j) });
      if (j < list.length - 1) pen.line(mid - wi / 2 - 1, Y_MARK - 4, mid + wi / 2 + 1, Y_MARK - 11, INK2, 2, it.idx);
      x += wi + 5;
    });
  });
  // số nhớ (+, ×)
  carries.forEach((cr) => pen.text(String(cr.v), cx(cr.col) - 11, Y_MARK, SMALL, INK2, cr.idx, { rot: rot(cr.col, 5) }));
  // chữ số kết quả
  if (showRes) outs.forEach((o) => pen.text(String(o.v), cx(o.col), Y_R + jit(o.col, 4) * 1.2, 36, INK, o.idx, { rot: rot(o.col, 4) }));

  const build = makeBuild(pen.items, spec.from !== undefined ? from : (spec.anim && (upto >= N || upto === 0) ? 0 : from), ctx);
  setupAnim(svg, ctx, spec, build);
  return svg;
}

/* ------------------------------------------------------------------ */
/*  vdiv — chia ngắn (xe buýt)                                         */
/* ------------------------------------------------------------------ */
function vdiv(spec, ctx) {
  let a, b, micro;
  try {
    a = clamp(intv(spec.a, 0), 0, 9999); b = clamp(intv(spec.b, 1), 1, 9);
    micro = P.vdivMicro(a, b);
  } catch (e) { return fallback('vdiv'); }
  const N = micro.length;
  const upto = clamp(intv(spec.upto, N), 0, N);
  const done = spec.done === true || (spec.done === undefined && spec.upto === undefined);
  const D = String(a).split('');
  const n = D.length, q = Math.floor(a / b), r = a % b;
  const extra = r > 0 ? 2 : 0;
  const cols = 1 + n + extra;
  const offX = Math.round(((W - cols * CW) / 2) / G) * G;
  const cxd = (i) => offX + CW + (i + 0.5) * CW;      // tâm cột chữ số thứ i của số bị chia (từ trái)
  const barX = offX + CW;
  const Y_TOP = 66, Y_Q = 61, Y_D = 66 + 33, H = 154;
  let label = `Chia ngắn: ${P.fmt(a)} chia ${b}, thương viết phía trên.`;
  if (upto >= N && spec.upto === undefined || done && upto >= N) label += ` Thương ${q}${r ? `, dư ${r}` : ''}.`;
  else if (upto > 0) label += ` Đã chia đến chữ số thứ ${micro[upto - 1].i + 1}.`;
  const svg = makeSvg(H, label);
  const pen = Pen(svg);

  const from = spec.from !== undefined ? clamp(intv(spec.from, 0), 0, N) : (upto > 0 && upto < N ? upto - 1 : 0);
  if (upto > 0 && !done) {
    let lo = 99, hi = -1;
    for (let k = Math.min(from, upto - 1); k < upto; k++) {
      const m = micro[k];
      if (m.kind === 'join') { lo = Math.min(lo, m.i); hi = Math.max(hi, m.i + 1); }
      else { lo = Math.min(lo, m.i); hi = Math.max(hi, m.i); }
    }
    if (hi >= 0) hlRect(pen, cxd(lo) - CW / 2 + 2, 24, (hi - lo + 1) * CW - 4, 90);
  } else if (done && upto >= N) {
    const first = n - String(q).length;
    hlRect(pen, cxd(first) - CW / 2 + 2, 24, (n - first) * CW - 4, 42);
  }

  // số chia, thanh dọc, đường kẻ ngang
  pen.text(String(b), offX + CW / 2 + 2, Y_D + jit(b, 1) * 1.2, 36, INK, -1, { rot: +(jit(b, 3) * 1.8).toFixed(2) });
  pen.line(barX + 2, Y_TOP - 3, barX + 2, Y_TOP + 50, INK, 3.4, -1);
  pen.line(barX + 2, Y_TOP, barX + n * CW + 4, Y_TOP, INK, 3.4, -1);
  D.forEach((ch, i) => pen.text(ch, cxd(i), Y_D + jit(i, 6) * 1.2, 36, INK, -1, { rot: +(jit(i, 7) * 1.8).toFixed(2) }));

  for (let k = 0; k < upto; k++) {
    const m = micro[k];
    if (m.kind === 'quot') pen.text(String(m.q), cxd(m.i), Y_Q + jit(m.i, 8) * 1.2, 36, INK, k, { rot: +(jit(m.i, 9) * 1.8).toFixed(2) });
    else if (m.kind === 'carry') pen.text(String(m.r), cxd(m.i) - 19, Y_TOP + 21, SMALL, INK2, k);
    else if (m.kind === 'join') {
      const x1 = cxd(m.i) - 11, x2 = cxd(m.i + 1) + 11, y = Y_D + 9;
      const path = s('path', { d: `M${x1} ${y}Q${(x1 + x2) / 2} ${y + 14} ${x2} ${y}`, stroke: ORANGE_E, 'stroke-width': 2.8, fill: 'none', 'stroke-linecap': 'round' });
      pen.add(path, k, 'text');
    } else if (m.kind === 'rem') {
      pen.text(`dư ${m.r}`, barX + n * CW + 10, Y_Q, 30, INK, k, { anchor: 'start' });
    }
  }
  const build = makeBuild(pen.items, spec.from !== undefined ? from : (spec.anim && (upto >= N || upto === 0) ? 0 : from), ctx);
  setupAnim(svg, ctx, spec, build);
  return svg;
}

/* ------------------------------------------------------------------ */
/*  workout — các dòng viết tay nối tiếp                               */
/* ------------------------------------------------------------------ */
const estW = (str, size) => String(str).length * size * 0.38;

function workout(spec, ctx) {
  const lines = (Array.isArray(spec.lines) ? spec.lines : []).map((l) => (typeof l === 'string' ? { text: l } : l || {})).filter((l) => l.text != null);
  if (!lines.length) return fallback('workout');
  const N = lines.length;
  const show = spec.show === 'problem' ? 'problem' : 'full';
  const upto = show === 'problem' ? Math.min(1, N) : clamp(intv(spec.upto, N), 0, N);
  const done = spec.done === true;
  const from = spec.from !== undefined ? clamp(intv(spec.from, 0), 0, N) : (upto > 0 && upto < N ? upto - 1 : 0);
  const title = spec.title ? String(spec.title) : '';

  // bố cục dòng: ghi chú ở bên phải; nếu chật thì xuống dòng dưới
  const PADX = 14, FS = 30, NS = 18, avail = W - PADX * 2;
  let y = G; // đỉnh hàng hiện tại
  const rows = [];
  if (title) { rows.push({ title: true, y, h: 44 }); y += 44; }
  lines.slice(0, upto).forEach((l, i) => {
    let fs = FS;
    const tw0 = estW(l.text, FS);
    if (tw0 > avail) fs = Math.max(19, Math.floor(FS * avail / tw0));
    const tw = estW(l.text, fs), nw = l.note ? estW(l.note, NS) : 0;
    const below = !!l.note && tw + nw + 26 > avail;
    rows.push({ i, y, h: below ? 66 : 44, fs, below, l });
    y += below ? 66 : 44;
  });
  const H = Math.max(110, y + G);
  const Hr = Math.ceil(H / G) * G;
  const label = (title ? title + '. ' : 'Viết nháp: ') + lines.slice(0, upto).map((l) => l.text + (l.note ? ` (${l.note})` : '')).join('; ');
  const svg = makeSvg(Hr, label);
  const pen = Pen(svg);

  const cur = rows.filter((r) => !r.title && r.i >= from && r.i < upto);
  if (cur.length && !done) {
    const y0 = cur[0].y + 2, y1 = cur[cur.length - 1].y + cur[cur.length - 1].h - 2;
    hlRect(pen, 8, y0, W - 16, y1 - y0);
  } else if (done && rows.length) {
    const lr = rows[rows.length - 1];
    hlRect(pen, 8, lr.y + 2, W - 16, lr.h - 4);
  }
  rows.forEach((r) => {
    if (r.title) {
      pen.text(title, PADX + 2, r.y + 31, 26, ORANGE_E, -1, { anchor: 'start' });
      pen.line(PADX, r.y + 38, Math.min(W - PADX, PADX + estW(title, 26) + 8), r.y + 38, ORANGE_E, 2.4, -1);
      return;
    }
    const isCur = r.i >= from && r.i < upto;
    const col = r.l.color || (isCur ? INK : INK2);
    pen.text(r.l.text, PADX + 2, r.y + 32 + jit(r.i, 1), r.fs, col, r.i, { anchor: 'start', rot: +(jit(r.i, 2) * 0.6).toFixed(2) });
    if (r.l.note) {
      if (r.below) pen.text(r.l.note, W - PADX, r.y + 58, NS, ORANGE_E, r.i, { anchor: 'end' });
      else pen.text(r.l.note, W - PADX, r.y + 31, NS, ORANGE_E, r.i, { anchor: 'end' });
    }
  });
  const build = makeBuild(pen.items, spec.from !== undefined ? from : (spec.anim && (upto >= N || upto === 0) ? 0 : from), ctx);
  setupAnim(svg, ctx, spec, build);
  return svg;
}

export default {
  kinds: ['vcalc', 'vdiv', 'workout'],
  render(spec, ctx) {
    spec = spec || {};
    switch (spec.kind) {
      case 'vdiv': return vdiv(spec, ctx);
      case 'workout': return workout(spec, ctx);
      default: return vcalc(spec, ctx);
    }
  },
};
