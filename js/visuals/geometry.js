// angle, shape2d, grid — hình học
import { COL, PAL, pal, el, svgRoot, safe, num, int, arr, uid, ensureStyle, setupAnim, easeOut, stagger } from './_v2.js';

const CSS = `
.v-angle text,.v-shape2d text,.v-grid text{font-family:inherit}
`;
const RAD = Math.PI / 180;

/* ------------------------------------------------------------------ angle */
function angleName(d) {
  if (d <= 0) return 'góc không';
  if (d < 90) return 'góc nhọn';
  if (d === 90) return 'góc vuông';
  if (d < 180) return 'góc tù';
  return 'góc bẹt';
}

// Vẽ 1 góc vào ô (cellX, cellY, cellW); trả {update(cur), baseY}
function buildAngle(parent, cellX, cellY, cellW, L, deg, letter, showName, show, color2) {
  const d = Math.max(0, Math.min(180, deg));
  const cosD = Math.cos(d * RAD);
  const minX = Math.min(0, L * cosD);
  const vx = cellX + cellW / 2 - (minX + L) / 2;
  const vy = cellY + 14 + L;
  const sq = show === 'square' || (show !== 'arc' && d === 90);
  const r = Math.min(36, L * 0.36);
  const ss = Math.min(26, L * 0.26);
  const g = el('g', null);
  const sector = el('path', { fill: color2, 'fill-opacity': 0.28, stroke: color2, 'stroke-width': 3.5, 'stroke-linejoin': 'round' });
  const square = el('rect', { x: vx, y: vy - ss, width: ss, height: ss, fill: color2, 'fill-opacity': 0.28, stroke: color2, 'stroke-width': 3.5, 'stroke-linejoin': 'round' });
  const base = el('line', { x1: vx, y1: vy, x2: vx + L, y2: vy, stroke: COL.primary, 'stroke-width': 7, 'stroke-linecap': 'round' });
  const ray = el('line', { x1: vx, y1: vy, stroke: color2, 'stroke-width': 7, 'stroke-linecap': 'round' });
  const dot = el('circle', { cx: vx, cy: vy, r: 6, fill: COL.ink });
  g.appendChild(sector); g.appendChild(square); g.appendChild(base); g.appendChild(ray); g.appendChild(dot);
  parent.appendChild(g);
  let ty = vy + 32;
  if (letter) {
    const lt = el('g', null);
    lt.appendChild(el('circle', { cx: vx, cy: ty - 5, r: 15, fill: '#FFFFFF', stroke: color2, 'stroke-width': 3 }));
    lt.appendChild(el('text', { x: vx, y: ty, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 900, fill: COL.ink, text: String(letter) }));
    g.appendChild(lt);
    ty += 28;
  }
  let nameEl = null;
  if (showName) {
    nameEl = el('text', { x: cellX + cellW / 2, y: ty + 2, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: COL.ink, text: angleName(d) });
    g.appendChild(nameEl);
  }
  const update = (cur) => {
    const a = Math.max(0, Math.min(d, cur));
    ray.setAttribute('x2', vx + L * Math.cos(a * RAD));
    ray.setAttribute('y2', vy - L * Math.sin(a * RAD));
    const full = a >= d - 0.01;
    if (sq) {
      square.style.display = full ? '' : 'none';
      sector.style.display = full ? 'none' : '';
    } else { square.style.display = 'none'; sector.style.display = ''; }
    if (a > 0.5) {
      const ex = vx + r * Math.cos(a * RAD), ey = vy - r * Math.sin(a * RAD);
      sector.setAttribute('d', `M${vx} ${vy}L${vx + r} ${vy}A${r} ${r} 0 ${a > 180 ? 1 : 0} 0 ${ex.toFixed(2)} ${ey.toFixed(2)}Z`);
    } else sector.setAttribute('d', '');
    if (nameEl) nameEl.style.opacity = full ? 1 : 0;
  };
  update(d);
  return { update, deg: d, bottom: ty + 12 };
}

function angle(spec, ctx) {
  let list;
  if (Array.isArray(spec.compare) && spec.compare.length) {
    list = spec.compare.slice(0, 6).map((c, i) => ({ label: c && c.label != null ? c.label : String.fromCharCode(65 + i), deg: num(c && c.deg, 45) }));
  } else {
    list = [{ label: spec.label, deg: num(spec.deg, 45) }];
  }
  list.forEach((c) => { c.deg = Math.max(0, Math.min(180, c.deg)); });
  const n = list.length;
  const showName = !!spec.name;
  const cols = n <= 3 ? n : 2;
  const rowsN = Math.ceil(n / cols);
  const cellW = 360 / cols;
  const L = Math.min(n === 1 ? 118 : 96, (cellW - 18) / 2 / (n <= 3 ? 1 : 1) * 1.0);
  const Lr = Math.max(40, Math.min(L, cellW - 24));
  const cellH = 14 + Lr + (list.some((c) => c.label) ? 30 : 8) + (showName ? 30 : 0) + 18;
  const H = rowsN * cellH + 6;
  const desc = n === 1
    ? `Một góc${spec.label ? ' tên ' + spec.label : ''}, hai cạnh mở ra từ một đỉnh${showName ? ': ' + angleName(list[0].deg) : ''}.`
    : `${n} góc đặt cạnh nhau: ${list.map((c) => 'góc ' + c.label + (showName ? ' ' + angleName(c.deg).replace('góc ', '') : '')).join(', ')}.`;
  const svg = svgRoot(360, H, desc, 'v-angle', 480);
  const cells = list.map((c, i) => {
    const cx = (i % cols) * cellW, cy = Math.floor(i / cols) * cellH + 4;
    const col2 = n === 1 ? COL.accent : pal(ctx, i + 1);
    return buildAngle(svg, cx, cy, cellW, Lr, c.deg, n === 1 ? spec.label : c.label, showName, spec.show, col2);
  });
  ensureStyle('v2-geometry', CSS);
  setupAnim(svg, spec, ctx, (A, T) => {
    T(1500, (p) => {
      const e = easeOut(p);
      cells.forEach((c) => c.update(c.deg * e));
    });
  }, spec.anim === 'open' || !!spec.anim);
  return svg;
}

/* ---------------------------------------------------------------- shape2d */
function regPts(n, r, rot) {
  const p = [];
  for (let i = 0; i < n; i++) { const a = (rot + 360 * i / n) * RAD; p.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]); }
  return p;
}
function regAxes(n, R, rot) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const a = (rot + k * 180 / n) * RAD;
    out.push({ x1: 50 - R * Math.cos(a), y1: 50 - R * Math.sin(a), x2: 50 + R * Math.cos(a), y2: 50 + R * Math.sin(a) });
  }
  return out;
}
function starPts() {
  const p = [];
  for (let i = 0; i < 10; i++) { const a = (-90 + 36 * i) * RAD, r = i % 2 === 0 ? 46 : 19; p.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]); }
  return p;
}
const NAMES = {
  triangle: 'tam giác', square: 'hình vuông', rectangle: 'hình chữ nhật', pentagon: 'hình ngũ giác', hexagon: 'hình lục giác',
  octagon: 'hình bát giác', circle: 'hình tròn', rhombus: 'hình thoi', trapezoid: 'hình thang', parallelogram: 'hình bình hành',
  kite: 'hình cái diều', heart: 'hình trái tim', hourglass: 'hình đồng hồ cát', L: 'hình chữ L', arrow: 'hình mũi tên',
  house: 'hình ngôi nhà', star: 'hình ngôi sao', custom: 'hình vẽ',
};
const TRI = {
  equilateral: [[50, 10], [92, 83], [8, 83]],
  isosceles: [[50, 8], [82, 90], [18, 90]],
  right: [[14, 12], [14, 88], [86, 88]],
  scalene: [[10, 86], [90, 70], [40, 14]],
};
const TRI_NAME = { equilateral: 'tam giác đều', isosceles: 'tam giác cân', right: 'tam giác vuông', scalene: 'tam giác thường' };

function shapeInfo(spec) {
  const name = NAMES[spec.name] ? spec.name : 'custom';
  let pts = null, path = null, all = [], vi = NAMES[name];
  switch (name) {
    case 'triangle': {
      const v = TRI[spec.variant] ? spec.variant : 'isosceles';
      pts = TRI[v]; vi = TRI_NAME[v];
      if (v === 'equilateral') all = pts.map((p, i) => { const a = pts[(i + 1) % 3], b = pts[(i + 2) % 3]; const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; const dx = m[0] - p[0], dy = m[1] - p[1]; return { x1: p[0] - dx * 0.08, y1: p[1] - dy * 0.08, x2: m[0] + dx * 0.08, y2: m[1] + dy * 0.08 }; });
      else if (v === 'isosceles') all = ['v'];
      break;
    }
    case 'square': pts = [[16, 16], [84, 16], [84, 84], [16, 84]]; all = ['v', 'h', 'd1', 'd2']; break;
    case 'rectangle': pts = [[6, 26], [94, 26], [94, 74], [6, 74]]; all = ['v', 'h']; break;
    case 'pentagon': pts = regPts(5, 44, -90); all = regAxes(5, 52, -90); break;
    case 'hexagon': pts = regPts(6, 46, 0); all = regAxes(6, 53, 0); break;
    case 'octagon': pts = regPts(8, 46, -67.5); all = regAxes(8, 53, -67.5); break;
    case 'circle': path = 'M50 6A44 44 0 1 1 49.99 6Z'; all = ['v', 'h', 'd1', 'd2']; break;
    case 'rhombus': pts = [[50, 6], [90, 50], [50, 94], [10, 50]]; all = ['v', 'h']; break;
    case 'trapezoid': pts = [[30, 24], [70, 24], [94, 76], [6, 76]]; all = ['v']; break;
    case 'parallelogram': pts = [[28, 26], [94, 26], [72, 74], [6, 74]]; break;
    case 'kite': pts = [[50, 6], [84, 38], [50, 94], [16, 38]]; all = ['v']; break;
    case 'heart': path = 'M50 88C6 56 4 22 28 14C40 10 48 16 50 24C52 16 60 10 72 14C96 22 94 56 50 88Z'; all = ['v']; break;
    case 'hourglass': pts = [[24, 8], [76, 8], [54, 50], [76, 92], [24, 92], [46, 50]]; all = ['v', 'h']; break;
    case 'L': pts = [[22, 10], [48, 10], [48, 64], [82, 64], [82, 90], [22, 90]]; break;
    case 'arrow': pts = [[6, 36], [56, 36], [56, 14], [94, 50], [56, 86], [56, 64], [6, 64]]; all = ['h']; break;
    case 'house': pts = [[50, 8], [92, 44], [80, 44], [80, 92], [20, 92], [20, 44], [8, 44]]; all = ['v']; break;
    case 'star': pts = starPts(); all = regAxes(5, 52, -90); break;
    default: {
      const p = Array.isArray(spec.points) ? spec.points.filter((q) => Array.isArray(q) && isFinite(q[0]) && isFinite(q[1])) : [];
      pts = p.length >= 3 ? p.map((q) => [Number(q[0]), Number(q[1])]) : [[20, 20], [80, 20], [80, 80], [20, 80]];
    }
  }
  if (spec.name !== 'custom' && Array.isArray(spec.points) && spec.points.length >= 3 && !NAMES[spec.name]) pts = spec.points;
  if (!path) path = 'M' + pts.map((p) => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L') + 'Z';
  // bbox
  let b;
  if (pts) { const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); b = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }
  else if (name === 'circle') b = [6, 6, 94, 94];
  else b = [6, 12, 94, 88];
  return { name, path, pts, bbox: b, all, vi };
}

function axisLine(tok, info) {
  const [x0, y0, x1, y1] = info.bbox;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, e = 7;
  if (tok && typeof tok === 'object') {
    if ([tok.x1, tok.y1, tok.x2, tok.y2].every((v) => isFinite(v))) return [{ x1: +tok.x1, y1: +tok.y1, x2: +tok.x2, y2: +tok.y2 }];
    return [];
  }
  if (tok === 'v') return [{ x1: cx, y1: y0 - e, x2: cx, y2: y1 + e }];
  if (tok === 'h') return [{ x1: x0 - e, y1: cy, x2: x1 + e, y2: cy }];
  if (tok === 'd1') return [{ x1: x0 - e, y1: y0 - e, x2: x1 + e, y2: y1 + e }];
  if (tok === 'd2') return [{ x1: x0 - e, y1: y1 + e, x2: x1 + e, y2: y0 - e }];
  if (tok === 'all') {
    return info.all.flatMap((t) => (typeof t === 'string' ? axisLine(t, info) : [t]));
  }
  return [];
}

function shape2d(spec, ctx) {
  const info = shapeInfo(spec);
  const fillC = typeof spec.fill === 'string' && spec.fill ? spec.fill : 'rgba(76,111,255,.22)';
  const strokeC = COL.primary;
  const tokens = arr(spec.axes);
  const lines = tokens.flatMap((t) => axisLine(t, info));
  const S = 210, ox = (360 - S) / 2, oy = 14;
  const showLabel = !!spec.label;
  const H = S + oy + (showLabel ? 44 : 16);
  const hasAxes = lines.length > 0;
  const label = `${info.vi[0].toUpperCase() + info.vi.slice(1)}${hasAxes ? ', có vẽ ' + (lines.length === 1 ? 'một đường nét đứt (trục đối xứng)' : lines.length + ' đường nét đứt (trục đối xứng)') : ''}.`;
  const svg = svgRoot(360, H, label, 'v-shape2d', 400);
  const id = uid(ctx, 'sh');
  const k = S / 100;
  const root = el('g', { transform: `translate(${ox} ${oy}) scale(${k})` });
  svg.appendChild(root);
  const sw = 2.6;

  // trục gập: ưu tiên dọc, sau đó ngang
  const wantFold = spec.anim === 'fold' || spec.fold === true;
  let foldAxis = null;
  if (wantFold) {
    const vert = lines.find((l) => Math.abs(l.x1 - l.x2) < 0.01);
    const horz = lines.find((l) => Math.abs(l.y1 - l.y2) < 0.01);
    if (vert) foldAxis = { t: 'v', pos: vert.x1 };
    else if (horz) foldAxis = { t: 'h', pos: horz.y1 };
    else if (!hasAxes) foldAxis = { t: 'v', pos: (info.bbox[0] + info.bbox[2]) / 2 };
  }
  const mk = (extra) => el('path', Object.assign({ d: info.path, fill: fillC, stroke: strokeC, 'stroke-width': sw, 'stroke-linejoin': 'round' }, extra));
  let halfB = null, outline = null, fillP = null;
  if (foldAxis) {
    const cidA = id + 'a', cidB = id + 'b';
    const big = 200, p = foldAxis.pos;
    const rA = foldAxis.t === 'v' ? { x: -50, y: -50, width: p + 50, height: big } : { x: -50, y: -50, width: big, height: p + 50 };
    const rB = foldAxis.t === 'v' ? { x: p, y: -50, width: big, height: big } : { x: -50, y: p, width: big, height: big };
    root.appendChild(el('defs', null, [el('clipPath', { id: cidA }, [el('rect', rA)]), el('clipPath', { id: cidB }, [el('rect', rB)])]));
    root.appendChild(el('g', { 'clip-path': `url(#${cidA})` }, [mk()]));
    halfB = el('g', { 'clip-path': `url(#${cidB})` }, [mk()]);
    root.appendChild(halfB);
  } else {
    fillP = mk({ stroke: 'none' });
    outline = mk({ fill: 'none', pathLength: 1 });
    root.appendChild(fillP);
    root.appendChild(outline);
  }
  const axG = el('g', null);
  lines.forEach((l) => axG.appendChild(el('line', { x1: l.x1, y1: l.y1, x2: l.x2, y2: l.y2, stroke: '#EC7468', 'stroke-width': 2.4, 'stroke-dasharray': '5 4.5', 'stroke-linecap': 'round' })));
  root.appendChild(axG);
  if (showLabel) {
    svg.appendChild(el('text', { x: 180, y: oy + S + 30, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 900, fill: COL.ink, text: info.vi[0].toUpperCase() + info.vi.slice(1) }));
  }

  ensureStyle('v2-geometry', CSS);
  setupAnim(svg, spec, ctx, (A) => {
    if (halfB) {
      const v = foldAxis.t === 'v';
      halfB.style.transformOrigin = v ? `${foldAxis.pos}px 0px` : `0px ${foldAxis.pos}px`;
      const sc = v ? 'scaleX(-1)' : 'scaleY(-1)';
      A(halfB, [
        { transform: 'none', opacity: 1, offset: 0, easing: 'ease-in-out' },
        { transform: sc, opacity: 0.7, offset: 0.42 },
        { transform: sc, opacity: 0.7, offset: 0.68, easing: 'ease-in-out' },
        { transform: 'none', opacity: 1, offset: 1 },
      ], { duration: 2400, easing: 'linear' });
    } else if (spec.anim === 'draw' && outline) {
      A(outline, [{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }], { duration: 1300, easing: 'ease-in-out' });
      A(fillP, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1200 });
      A(axG, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 1500 });
    }
  }, spec.anim === 'fold' || spec.anim === 'draw' || !!spec.anim);
  return svg;
}

/* ------------------------------------------------------------------- grid */
function grid(spec, ctx) {
  const cols = int(spec.cols, 8, 1, 24), rows = int(spec.rows, 6, 1, 24);
  const cs = Math.min(40, 320 / cols, 300 / rows);
  const W = cols * cs, Hh = rows * cs;
  const ox = (360 - W) / 2, oy = 14;
  let cells = arr(spec.cells).filter((c) => c && isFinite(c.c) && isFinite(c.r)).map((c) => ({ c: Math.round(c.c), r: Math.round(c.r), color: c.color }));
  // 0-based; tự nhận 1-based nếu có c==cols/r==rows mà không có 0
  const oneBased = cells.length && !cells.some((c) => c.c === 0 || c.r === 0) && cells.some((c) => c.c === cols || c.r === rows);
  if (oneBased) cells = cells.map((c) => ({ c: c.c - 1, r: c.r - 1, color: c.color }));
  cells = cells.filter((c) => c.c >= 0 && c.c < cols && c.r >= 0 && c.r < rows);
  const label = `Lưới ${cols} cột ${rows} hàng, có ${cells.length} ô được tô${spec.axis ? ', có một đường nét đứt (trục đối xứng)' : ''}.`;
  const svg = svgRoot(360, Hh + oy * 2, label, 'v-grid', 440);
  svg.appendChild(el('rect', { x: ox, y: oy, width: W, height: Hh, fill: '#FFFFFF' }));
  const cellEls = [];
  cells.forEach((c) => {
    const r = el('rect', { x: ox + c.c * cs, y: oy + c.r * cs, width: cs, height: cs, fill: c.color || pal(ctx, 0), 'fill-opacity': 0.85 });
    svg.appendChild(r); cellEls.push(r);
  });
  for (let i = 0; i <= cols; i++) svg.appendChild(el('line', { x1: ox + i * cs, x2: ox + i * cs, y1: oy, y2: oy + Hh, stroke: '#B8C1D6', 'stroke-width': i === 0 || i === cols ? 3 : 1.6 }));
  for (let j = 0; j <= rows; j++) svg.appendChild(el('line', { x1: ox, x2: ox + W, y1: oy + j * cs, y2: oy + j * cs, stroke: '#B8C1D6', 'stroke-width': j === 0 || j === rows ? 3 : 1.6 }));
  const ax = spec.axis;
  if (ax) {
    let l = null;
    const e = 8;
    if (ax === 'v') l = [ox + W / 2, oy - e, ox + W / 2, oy + Hh + e];
    else if (ax === 'h') l = [ox - e, oy + Hh / 2, ox + W + e, oy + Hh / 2];
    else if (ax === 'd') l = [ox - e, oy - e, ox + W + e, oy + Hh + e];
    else if (typeof ax === 'object' && ax.x != null) l = [ox + ax.x * cs, oy - e, ox + ax.x * cs, oy + Hh + e];
    else if (typeof ax === 'object' && ax.y != null) l = [ox - e, oy + ax.y * cs, ox + W + e, oy + ax.y * cs];
    if (l) svg.appendChild(el('line', { x1: l[0], y1: l[1], x2: l[2], y2: l[3], stroke: '#EC7468', 'stroke-width': 4, 'stroke-dasharray': '9 7', 'stroke-linecap': 'round' }));
  }
  ensureStyle('v2-geometry', CSS);
  setupAnim(svg, spec, ctx, (A) => {
    const d = stagger(cellEls.length, 1400, 90);
    cellEls.forEach((c, i) => {
      c.style.transformBox = 'fill-box'; c.style.transformOrigin = '50% 50%';
      A(c, [{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: i * d });
    });
  }, spec.anim === 'fill' || !!spec.anim);
  return svg;
}

export default {
  kinds: ['angle', 'shape2d', 'grid'],
  render(spec, ctx) {
    const k = spec && spec.kind;
    return safe(k, spec, ctx, (s, c) => (k === 'angle' ? angle(s, c) : k === 'shape2d' ? shape2d(s, c) : k === 'grid' ? grid(s, c) : null));
  },
};
