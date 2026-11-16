// clock, timeline, calendar — thời gian
import { COL, PAL, pal, el, svgRoot, safe, num, int, arr, ensureStyle, setupAnim, stagger } from './_v2.js';

const CSS = `
.v-clock text,.v-timeline text,.v-calendar text{font-family:inherit}
.v-clock .v-clock-dig{font-variant-numeric:tabular-nums}
`;

const pad2 = (n) => (n < 10 ? '0' + n : String(n));

/* ------------------------------------------------------------------ clock */
function clock(spec, ctx) {
  const h = int(spec.h, 3, 0, 23), m = int(spec.m, 0, 0, 59);
  const mode = ['analog', 'digital', 'both'].includes(spec.mode) ? spec.mode : 'analog';
  const ampm = !!spec.ampm, show24 = !!spec.show24;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  let digital;
  if (ampm) digital = `${h12}:${pad2(m)}`;
  else if (show24) digital = `${pad2(h)}:${pad2(m)}`;
  else digital = `${h}:${pad2(m)}`;
  const tag = ampm ? (h < 12 ? 'SA' : 'CH') : '';
  const cap24 = show24 ? `${h} giờ ${m} phút` : '';
  const showAnalog = mode !== 'digital';
  const showDigital = mode !== 'analog';
  const label = showAnalog
    ? (showDigital ? `Đồng hồ kim và đồng hồ số chỉ ${h} giờ ${m} phút.` : 'Đồng hồ kim có kim giờ ngắn và kim phút dài.')
    : `Đồng hồ số chỉ ${h} giờ ${m} phút.`;
  const cx = 180, cy = 124, R = 108;
  let H = 0;
  if (showAnalog) H += 2 * R + 16;
  if (showDigital) H += 76;
  if (!showDigital && (tag || cap24)) H += 44;
  else if (showDigital && cap24) H += 34;
  if (!showAnalog) H = Math.max(H, 120);
  const svg = svgRoot(360, H, label, 'v-clock', showAnalog ? 380 : 340);
  let hourG = null, minG = null;
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  let yNext = 8;
  if (showAnalog) {
    const ccy = 8 + R;
    svg.appendChild(el('circle', { cx, cy: ccy, r: R + 4, fill: '#fff', stroke: COL.primary, 'stroke-width': 10 }));
    svg.appendChild(el('circle', { cx, cy: ccy, r: R - 2, fill: 'none', stroke: COL.line, 'stroke-width': 2 }));
    for (let i = 0; i < 60; i++) {
      const a = i * 6 * Math.PI / 180, big = i % 5 === 0;
      const r1 = R - (big ? 14 : 8), r2 = R - 3;
      svg.appendChild(el('line', { x1: cx + r1 * Math.sin(a), y1: ccy - r1 * Math.cos(a), x2: cx + r2 * Math.sin(a), y2: ccy - r2 * Math.cos(a), stroke: big ? COL.ink : '#9A97B0', 'stroke-width': big ? 3.5 : 1.8, 'stroke-linecap': 'round' }));
    }
    for (let i = 1; i <= 12; i++) {
      const a = i * 30 * Math.PI / 180, rr = R - 34;
      svg.appendChild(el('text', { x: cx + rr * Math.sin(a), y: ccy - rr * Math.cos(a) + 8, 'text-anchor': 'middle', 'font-size': 23, 'font-weight': 900, fill: COL.ink, text: String(i) }));
    }
    hourG = el('g', { transform: `rotate(${ha} ${cx} ${ccy})` });
    hourG.appendChild(el('line', { x1: cx, y1: ccy + 8, x2: cx, y2: ccy - (R - 54), stroke: COL.primary, 'stroke-width': 11, 'stroke-linecap': 'round' }));
    minG = el('g', { transform: `rotate(${ma} ${cx} ${ccy})` });
    minG.appendChild(el('line', { x1: cx, y1: ccy + 10, x2: cx, y2: ccy - (R - 22), stroke: COL.accent, 'stroke-width': 6, 'stroke-linecap': 'round' }));
    svg.appendChild(hourG);
    svg.appendChild(minG);
    svg.appendChild(el('circle', { cx, cy: ccy, r: 8, fill: COL.ink }));
    svg.appendChild(el('circle', { cx, cy: ccy, r: 3, fill: '#fff' }));
    svg._cc = [cx, ccy];
    yNext = 2 * R + 20;
  }
  if (showDigital) {
    const w = 190, x = cx - w / 2, y = yNext + (showAnalog ? 0 : 10);
    svg.appendChild(el('rect', { x, y, width: w, height: 62, rx: 16, fill: '#2B2A3A' }));
    svg.appendChild(el('rect', { x: x + 4, y: y + 4, width: w - 8, height: 54, rx: 12, fill: '#1E1D2B', stroke: '#4B4A63', 'stroke-width': 2 }));
    svg.appendChild(el('text', { class: 'v-clock-dig', x: cx - (tag ? 18 : 0), y: y + 45, 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 900, fill: '#7BFFB0', text: digital, style: 'font-family:ui-monospace,Menlo,Consolas,monospace' }));
    if (tag) svg.appendChild(el('text', { x: x + w - 18, y: y + 44, 'text-anchor': 'end', 'font-size': 18, 'font-weight': 900, fill: '#FFC531', text: tag }));
    yNext = y + 62;
  }
  if (cap24 || (!showDigital && tag)) {
    const txt = [!showDigital && tag ? `${h12}:${pad2(m)} ${tag}` : '', cap24].filter(Boolean).join('  ·  ');
    const y = yNext + 28;
    const w = Math.max(110, txt.length * 11 + 28);
    svg.appendChild(el('rect', { x: cx - w / 2, y: y - 22, width: w, height: 34, rx: 17, fill: COL.soft, stroke: COL.line, 'stroke-width': 2 }));
    svg.appendChild(el('text', { x: cx, y: y + 1, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: COL.ink, text: txt }));
  }
  ensureStyle('v2-time', CSS);
  setupAnim(svg, spec, ctx, (A) => {
    if (!hourG || !svg._cc) return;
    const [ox, oy] = svg._cc;
    hourG.style.transformOrigin = `${ox}px ${oy}px`;
    minG.style.transformOrigin = `${ox}px ${oy}px`;
    A(hourG, [{ transform: 'rotate(0deg)' }, { transform: `rotate(${ha}deg)` }], { duration: 1800, easing: 'cubic-bezier(.3,.7,.3,1)' });
    A(minG, [{ transform: 'rotate(0deg)' }, { transform: `rotate(${ma}deg)` }], { duration: 1800, easing: 'cubic-bezier(.3,.7,.3,1)' });
  }, spec.anim === 'tick' || !!spec.anim);
  return svg;
}

/* --------------------------------------------------------------- timeline */
function parseT(s) {
  if (typeof s === 'number') return s * 60;
  const m = /^\s*(\d{1,2})\s*(?:[:hHgG]\s*(\d{1,2})?)?\s*$/.exec(String(s));
  if (!m) return NaN;
  return (+m[1]) * 60 + (m[2] ? +m[2] : 0);
}
const fmtT = (t) => `${Math.floor(t / 60)}:${pad2(Math.round(t % 60))}`;
function fmtDur(d) {
  const h = Math.floor(d / 60), m = Math.round(d % 60);
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

function timeline(spec, ctx) {
  const rows = arr(spec.rows).map((r) => ({ label: r && r.label != null ? String(r.label) : '', a: parseT(r && r.from), b: parseT(r && r.to), color: r && r.color })).filter((r) => isFinite(r.a) && isFinite(r.b));
  if (!rows.length) throw new Error('timeline: không có hàng hợp lệ');
  let lo = Math.min(...rows.map((r) => r.a)), hi = Math.max(...rows.map((r) => r.b));
  let sc0 = spec.scale ? parseT(spec.scale.from) : NaN, sc1 = spec.scale ? parseT(spec.scale.to) : NaN;
  if (!isFinite(sc0)) sc0 = Math.floor(lo / 60) * 60;
  if (!isFinite(sc1)) sc1 = Math.ceil(hi / 60) * 60;
  if (sc1 <= sc0) sc1 = sc0 + 60;
  const showDur = !!spec.showDuration;
  const x0 = 16, W = 328, rowH = 62, top = 34;
  const H = top + rows.length * rowH + 8;
  const label = 'Thời gian biểu: ' + rows.map((r) => `${r.label} từ ${fmtT(r.a)} đến ${fmtT(r.b)}`).join('; ') + '.';
  const svg = svgRoot(360, H, label, 'v-timeline', 480);
  const xOf = (t) => x0 + W * (t - sc0) / (sc1 - sc0);
  // lưới giờ
  const hours = [];
  for (let t = Math.ceil(sc0 / 60) * 60; t <= sc1; t += 60) hours.push(t);
  const stepL = Math.max(1, Math.ceil(46 / (W * 60 / (sc1 - sc0))));
  hours.forEach((t, i) => {
    const x = xOf(t);
    svg.appendChild(el('line', { x1: x, x2: x, y1: 24, y2: H - 4, stroke: COL.line, 'stroke-width': 2, 'stroke-dasharray': '4 5' }));
    if (i % stepL === 0) svg.appendChild(el('text', { x, y: 18, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: COL.mute, text: `${Math.floor(t / 60)}:00` }));
  });
  const bars = [];
  rows.forEach((r, i) => {
    const y = top + i * rowH;
    const col = r.color || pal(ctx, i);
    svg.appendChild(el('text', { x: x0, y: y + 14, 'font-size': 16, 'font-weight': 800, fill: COL.ink, text: r.label }));
    const dur = r.b - r.a;
    const info = `${fmtT(r.a)}–${fmtT(r.b)}` + (showDur ? ` · ${fmtDur(dur)}` : '');
    svg.appendChild(el('text', { x: x0 + W, y: y + 14, 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: COL.mute, text: info }));
    const bx = xOf(r.a), bw = Math.max(8, xOf(r.b) - xOf(r.a));
    svg.appendChild(el('rect', { x: x0, y: y + 22, width: W, height: 24, rx: 12, fill: '#F1EEF7' }));
    const bar = el('rect', { x: bx, y: y + 22, width: bw, height: 24, rx: 12, fill: col, stroke: '#fff', 'stroke-width': 2 });
    svg.appendChild(bar);
    bars.push(bar);
  });
  ensureStyle('v2-time', CSS);
  setupAnim(svg, spec, ctx, (A) => {
    const d = stagger(bars.length, 900, 250);
    bars.forEach((b, i) => {
      b.style.transformBox = 'fill-box'; b.style.transformOrigin = '0% 50%';
      A(b, [{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 600, delay: i * d });
    });
  }, spec.anim === 'draw' || !!spec.anim);
  return svg;
}

/* --------------------------------------------------------------- calendar */
function calendar(spec, ctx) {
  const year = int(spec.year, 2026, 1900, 2200), month = int(spec.month, 11, 1, 12);
  const hl = new Set(arr(spec.highlight).map(Number)), ci = new Set(arr(spec.circle).map(Number));
  const labels = spec.labels && typeof spec.labels === 'object' ? spec.labels : {};
  const hasLabels = Object.keys(labels).length > 0;
  const sun = spec.startOn === 'sun';
  const days = new Date(year, month, 0).getDate();
  const first = new Date(year, month - 1, 1).getDay(); // 0 = CN
  const offset = sun ? first : (first + 6) % 7;
  const weeks = Math.ceil((offset + days) / 7);
  const heads = sun ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const cw = 47, x0 = (360 - cw * 7) / 2, ch = hasLabels ? 58 : 46, top = 76;
  const H = top + weeks * ch + 10;
  const label = `Lịch tháng ${month} năm ${year}, ${days} ngày` + (hl.size ? `, tô sáng ngày ${[...hl].join(', ')}` : '') + (ci.size ? `, khoanh ngày ${[...ci].join(', ')}` : '') + '.';
  const svg = svgRoot(360, H, label, 'v-calendar', 440);
  svg.appendChild(el('rect', { x: x0 - 4, y: 4, width: cw * 7 + 8, height: H - 8, rx: 18, fill: '#fff', stroke: COL.line, 'stroke-width': 3 }));
  svg.appendChild(el('path', { d: `M${x0 - 4} ${22}Q${x0 - 4} 4 ${x0 + 14} 4L${x0 + cw * 7 - 10} 4Q${x0 + cw * 7 + 4} 4 ${x0 + cw * 7 + 4} 22L${x0 + cw * 7 + 4} 38L${x0 - 4} 38Z`, fill: COL.primary }));
  svg.appendChild(el('text', { x: 180, y: 29, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 900, fill: '#fff', text: `Tháng ${month} năm ${year}` }));
  heads.forEach((t, i) => {
    const isSun = t === 'CN';
    svg.appendChild(el('text', { x: x0 + i * cw + cw / 2, y: 64, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: isSun ? '#E0457B' : COL.mute, text: t }));
  });
  const marks = [];
  for (let d = 1; d <= days; d++) {
    const idx = offset + d - 1;
    const col = idx % 7, row = Math.floor(idx / 7);
    const x = x0 + col * cw, y = top + row * ch;
    const isSun = sun ? col === 0 : col === 6;
    const g = el('g', null);
    const nCy = hasLabels ? y + 21 : y + ch / 2 + 1;
    if (hl.has(d)) g.appendChild(el('rect', { x: x + 3, y: y + 3, width: cw - 6, height: ch - 6, rx: 12, fill: '#FFD84D', stroke: COL.accent, 'stroke-width': 2.5 }));
    if (ci.has(d)) g.appendChild(el('circle', { cx: x + cw / 2, cy: nCy, r: 19, fill: 'none', stroke: '#E0457B', 'stroke-width': 4 }));
    g.appendChild(el('text', { x: x + cw / 2, y: nCy + 6, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': hl.has(d) || ci.has(d) ? 900 : 700, fill: isSun ? '#E0457B' : COL.ink, text: String(d) }));
    if (hasLabels && labels[d] != null) g.appendChild(el('text', { x: x + cw / 2, y: y + 49, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: COL.primary, text: String(labels[d]).slice(0, 5) }));
    svg.appendChild(g);
    if (hl.has(d) || ci.has(d)) marks.push(g);
  }
  ensureStyle('v2-time', CSS);
  setupAnim(svg, spec, ctx, (A) => {
    marks.forEach((g, i) => {
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = '50% 50%';
      A(g, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 350, delay: i * 140 });
    });
  }, !!spec.anim);
  return svg;
}

export default {
  kinds: ['clock', 'timeline', 'calendar'],
  render(spec, ctx) {
    const k = spec && spec.kind;
    return safe(k, spec, ctx, (s, c) => (k === 'clock' ? clock(s, c) : k === 'timeline' ? timeline(s, c) : k === 'calendar' ? calendar(s, c) : null));
  },
};
