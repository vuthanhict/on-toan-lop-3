// Tiện ích dùng chung cho các hình của "Agent hình 1"
// (numberline.js, thermo.js, place.js, dots.js, groups.js). Không phải visual.

export const PAL = ['#4F6BED', '#F5893A', '#34B27B', '#8B6CF0', '#F7BE2C', '#EC7468', '#3BB3C4', '#5D6985'];

export const C = {
  primary: 'var(--c-primary,#4F6BED)',
  accent: 'var(--c-accent,#F5893A)',
  ok: 'var(--c-ok,#1F8456)',
  warn: 'var(--c-warn,#EC7468)',
  ink: 'var(--c-ink,#263250)',
  bg: 'var(--c-bg,#FAF6EE)',
  card: 'var(--c-card,#FFFEFB)',
  line: 'var(--c-line,#E8E1D2)',
  soft: 'var(--c-soft,#E8EDFF)',
};

export const FONT = "'Baloo 2','Nunito',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
const SVGNS = 'http://www.w3.org/2000/svg';

/** Chèn <style> đúng 1 lần. */
export function ensureStyle(id, css) {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;
  const st = document.createElement('style');
  st.id = id;
  st.textContent = css;
  document.head.appendChild(st);
}

/** Tạo phần tử SVG: s('rect',{x:1},[children|text]) */
export function s(tag, attrs, kids) {
  const e = document.createElementNS(SVGNS, tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v === undefined || v === null || v === false) continue;
    if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  add(e, kids);
  return e;
}

/** Tạo phần tử HTML. */
export function h(tag, attrs, kids) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v === undefined || v === null || v === false) continue;
    if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k === 'class') e.className = v;
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  add(e, kids);
  return e;
}

function add(e, kids) {
  if (kids === undefined || kids === null) return;
  if (!Array.isArray(kids)) kids = [kids];
  for (const k of kids) {
    if (k === undefined || k === null || k === false) continue;
    if (Array.isArray(k)) add(e, k);
    else e.appendChild(typeof k === 'object' ? k : document.createTextNode(String(k)));
  }
}

export const num = (v, d) => {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v.replace(',', '.').replace('−', '-')) : v;
  return typeof n === 'number' && isFinite(n) ? n : d;
};
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Định dạng số kiểu Việt: dấu − (U+2212), dấu phẩy thập phân, cách nghìn từ 5 chữ số trở lên (hoặc minGroup). */
export function fmt(n, minGroup = 10000) {
  n = Math.round(n * 1e6) / 1e6;
  const neg = n < 0;
  const a = Math.abs(n);
  let [ip, fp] = String(a).split('.');
  if (/e/i.test(ip)) ip = String(Math.round(a));
  if (a >= minGroup) ip = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (neg ? '−' : '') + ip + (fp ? ',' + fp : '');
}
/** Chuỗi chữ số → nhóm 3 từ phải, cách nhau bằng khoảng trắng. */
export function groupDigits(str) {
  return String(str).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
/** Đọc số (cho aria-label): −8 → "âm 8". */
export function say(n) {
  return n < 0 ? 'âm ' + fmt(-n) : fmt(n);
}

/** Màu chữ tương phản trên nền hex. */
export function inkOn(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#FFFFFF';
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  return l > 165 ? '#263250' : '#FFFFFF';
}

export function palOf(ctx) {
  return ctx && Array.isArray(ctx.palette) && ctx.palette.length ? ctx.palette : PAL;
}

/** Chạy fn khi phần tử đã được gắn vào DOM. */
export function onAttach(el, fn) {
  let n = 0;
  const tick = () => {
    if (el.isConnected || ++n > 1500) { fn(); return; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Gắn hoạt hình: build(add) gọi add(node, keyframes, opts) cho từng hiệu ứng.
 * Trạng thái cuối = DOM tĩnh (fill:'backwards'), nên huỷ hoạt hình là về lại trạng thái cuối.
 * Trả el.replay. ctx.reduced → không chạy.
 */
export function setupAnim(el, ctx, spec, build) {
  let list = [];
  const addAnim = (node, kf, opt) => {
    if (!node || !node.animate) return null;
    try {
      const a = node.animate(kf, Object.assign({ fill: 'backwards', easing: 'ease-out', duration: 400 }, opt));
      list.push(a);
      return a;
    } catch (e) { return null; }
  };
  const stop = () => { list.forEach(a => { try { a.cancel(); } catch (e) {} }); list = []; };
  const play = () => {
    stop();
    el.style.visibility = '';
    try { build(addAnim); } catch (e) { /* hoạt hình lỗi thì thôi, hình tĩnh vẫn đúng */ }
  };
  el.replay = () => { if (!(ctx && ctx.reduced)) play(); };
  if (spec && spec.anim && !(ctx && ctx.reduced)) {
    el.style.visibility = 'hidden';
    onAttach(el, play);
  }
}

/** Khung dự phòng khi không vẽ được. */
export function fallback(kind, msg) {
  ensureStyle('v1-fallback-style', `.v-fb{display:flex;align-items:center;justify-content:center;min-height:56px;padding:10px;border:2px dashed ${C.line};border-radius:16px;background:${C.soft};color:${C.ink};font:600 14px/1.3 ${FONT};opacity:.8;text-align:center}`);
  return h('div', { class: 'v-fb', role: 'img', 'aria-label': 'Hình minh hoạ (' + kind + ') không vẽ được' }, 'không vẽ được');
}

/** Bọc render: không bao giờ ném lỗi. */
export function safe(kind, fn) {
  return function (spec, ctx) {
    try {
      spec = spec && typeof spec === 'object' ? spec : {};
      ctx = Object.assign({ reduced: false, lite: false, palette: PAL, uid: (() => { let i = 0; return () => 'v' + (++i) + Math.random().toString(36).slice(2, 6); })() }, ctx || {});
      if (typeof ctx.uid !== 'function') ctx.uid = () => 'v' + Math.random().toString(36).slice(2, 8);
      const el = fn(spec, ctx);
      if (!el) return fallback(kind);
      return el;
    } catch (e) {
      try { console.warn('[visual ' + kind + ']', e); } catch (_) {}
      return fallback(kind);
    }
  };
}

/** Tạo SVG gốc co giãn theo viewBox. */
export function svgRoot(w, hgt, label, cls, extra) {
  return s('svg', Object.assign({
    viewBox: `0 0 ${w} ${hgt}`,
    width: '100%',
    role: 'img',
    'aria-label': label,
    class: cls,
    preserveAspectRatio: 'xMidYMid meet',
    style: { display: 'block', width: '100%', height: 'auto', maxWidth: w * 1.6 + 'px', margin: '0 auto', overflow: 'visible', fontFamily: FONT },
  }, extra || {}));
}

/** Đoạn sóng tam giác ♥ ★ cho các hình chấm. */
export function heartPath(cx, cy, r) {
  const k = r * 1.0;
  return `M${cx},${cy + k * 0.95} C${cx - k * 1.5},${cy - k * 0.1} ${cx - k * 0.7},${cy - k * 1.15} ${cx},${cy - k * 0.35} C${cx + k * 0.7},${cy - k * 1.15} ${cx + k * 1.5},${cy - k * 0.1} ${cx},${cy + k * 0.95}Z`;
}
export function starPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 ? r * 0.45 : r * 1.05;
    pts.push((cx + rr * Math.cos(a)).toFixed(2) + ',' + (cy + rr * Math.sin(a)).toFixed(2));
  }
  return pts.join(' ');
}
