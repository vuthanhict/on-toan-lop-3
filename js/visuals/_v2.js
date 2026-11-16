// Tiện ích dùng chung cho nhóm hình 2 (fraction, measure, geometry, time, misc).
// Không phải visual; chỉ là thư viện nhỏ: tạo SVG, CSS 1 lần, hoạt hình, an toàn lỗi.

export const NS = 'http://www.w3.org/2000/svg';

export const COL = {
  ink: 'var(--c-ink,#2B2A3A)',
  primary: 'var(--c-primary,#4C6FFF)',
  accent: 'var(--c-accent,#FF8A3D)',
  ok: 'var(--c-ok,#2FBF71)',
  warn: 'var(--c-warn,#FFC531)',
  bg: 'var(--c-bg,#FFF8EC)',
  card: 'var(--c-card,#FFFFFF)',
  line: 'var(--c-line,#E7DCC6)',
  soft: 'var(--c-soft,#EEF1FF)',
  mute: '#6B6880',
};
export const PAL = ['#4C6FFF', '#FF8A3D', '#2FBF71', '#B05CFF', '#FFC531', '#FF5C8A', '#22B8CF', '#8D6E63'];

export function pal(ctx, i) {
  const p = ctx && ctx.palette && ctx.palette.length ? ctx.palette : PAL;
  return p[((i % p.length) + p.length) % p.length];
}

let _uid = 0;
export function uid(ctx, p) {
  try { if (ctx && typeof ctx.uid === 'function') return String(ctx.uid()); } catch (e) { /* bỏ qua */ }
  return (p || 'v2') + '-' + (++_uid);
}

const styled = new Set();
export function ensureStyle(id, css) {
  if (styled.has(id) || typeof document === 'undefined') return;
  styled.add(id);
  const s = document.createElement('style');
  s.setAttribute('data-v2', id);
  s.textContent = css;
  document.head.appendChild(s);
}

// Tạo phần tử SVG. attrs.text -> textContent; attrs.style (chuỗi|object); giá trị chứa var( -> đặt qua style
export function el(tag, attrs, children) {
  const n = document.createElementNS(NS, tag);
  if (attrs) {
    for (const k in attrs) {
      const v = attrs[k];
      if (v === undefined || v === null || v === false) continue;
      if (k === 'text') n.textContent = v;
      else if (k === 'style') {
        if (typeof v === 'string') n.setAttribute('style', v);
        else for (const s in v) n.style[s] = v[s];
      } else if ((k === 'fill' || k === 'stroke') && typeof v === 'string' && v.indexOf('var(') >= 0) {
        n.style[k] = v;
      } else n.setAttribute(k, v);
    }
  }
  if (children) for (const c of children) if (c) n.appendChild(c);
  return n;
}

export function svgRoot(w, h, label, cls, maxW) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', `0 0 ${w} ${h}`);
  s.setAttribute('role', 'img');
  s.setAttribute('aria-label', label || 'Hình minh hoạ');
  s.setAttribute('class', cls || '');
  s.setAttribute('xmlns', NS);
  s.style.cssText = `display:block;width:100%;height:auto;max-width:${maxW || 460}px;margin:0 auto;font-family:inherit;overflow:visible`;
  return s;
}

export function failBox(kind, cls) {
  try {
    const s = svgRoot(360, 56, 'Hình không vẽ được', cls || 'v-fail', 460);
    s.appendChild(el('rect', { x: 4, y: 4, width: 352, height: 48, rx: 12, fill: 'none', stroke: COL.line, 'stroke-width': 2, 'stroke-dasharray': '6 5' }));
    s.appendChild(el('text', { x: 180, y: 34, 'text-anchor': 'middle', 'font-size': 14, fill: COL.mute, text: 'không vẽ được' }));
    s.replay = () => {};
    return s;
  } catch (e) {
    const d = document.createElement('div');
    d.setAttribute('role', 'img');
    d.setAttribute('aria-label', 'Hình không vẽ được');
    d.textContent = 'không vẽ được';
    d.replay = () => {};
    return d;
  }
}

export function safe(kind, spec, ctx, fn) {
  try {
    const r = fn(spec || {}, ctx || {});
    if (r) return r;
  } catch (e) {
    if (typeof console !== 'undefined') console.warn('[visual ' + kind + ']', e);
  }
  return failBox(kind);
}

export const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : (v !== '' && v != null && isFinite(Number(v)) ? Number(v) : d));
export const int = (v, d, lo, hi) => {
  let n = Math.round(num(v, d));
  if (lo != null) n = Math.max(lo, n);
  if (hi != null) n = Math.min(hi, n);
  return n;
};
export const arr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);

// Chọn màu chữ (trắng/đen) theo độ sáng nền hex
export function textOn(hex) {
  if (typeof hex !== 'string' || hex[0] !== '#') return COL.ink;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L > 0.62 ? '#2B2A3A' : '#FFFFFF';
}

// Phân số xếp chồng (tử / vạch / mẫu) bằng SVG text, KHÔNG dùng ký tự '/'
export function fracText(parent, cx, cy, top, bottom, size, fill, weight) {
  const s = size || 14;
  const w = Math.max(String(top).length, String(bottom).length) * s * 0.62 + 6;
  const g = el('g', { class: 'v-frac' });
  g.appendChild(el('text', { x: cx, y: cy - 3, 'text-anchor': 'middle', 'font-size': s, 'font-weight': weight || 800, fill: fill || COL.ink, text: String(top) }));
  g.appendChild(el('line', { x1: cx - w / 2, x2: cx + w / 2, y1: cy, y2: cy, stroke: fill || COL.ink, 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
  g.appendChild(el('text', { x: cx, y: cy + s - 0.5, 'text-anchor': 'middle', 'font-size': s, 'font-weight': weight || 800, fill: fill || COL.ink, text: String(bottom) }));
  if (parent) parent.appendChild(g);
  return g;
}

export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function tween(ms, fn) {
  let id = 0, t0 = null, stopped = false;
  const step = (t) => {
    if (stopped) return;
    if (t0 === null) t0 = t;
    const p = Math.min(1, (t - t0) / ms);
    fn(p);
    if (p < 1) id = requestAnimationFrame(step);
  };
  fn(0);
  id = requestAnimationFrame(step);
  return () => { stopped = true; cancelAnimationFrame(id); };
}

export function onAttach(node, fn) {
  const go = () => requestAnimationFrame(() => requestAnimationFrame(fn));
  if (node.isConnected) { go(); return; }
  if (typeof MutationObserver === 'undefined') { go(); return; }
  const mo = new MutationObserver(() => { if (node.isConnected) { mo.disconnect(); go(); } });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => mo.disconnect(), 60000);
}

// Gắn hoạt hình: build(A, T) được gọi khi gắn vào DOM (nếu spec.anim) và mỗi lần replay().
// A(node, keyframes, opts) = Web Animations API (hủy được); T(ms, fn(p)) = tween rAF.
export function setupAnim(root, spec, ctx, build, force) {
  const reduced = !!(ctx && ctx.reduced);
  let live = [];
  const stop = () => {
    live.forEach((a) => { try { if (typeof a === 'function') a(); else a.cancel(); } catch (e) { /* bỏ qua */ } });
    live = [];
  };
  const A = (node, kf, opt) => {
    if (!node || !node.animate) return null;
    const a = node.animate(kf, Object.assign({ duration: 400, easing: 'ease-out', fill: 'backwards' }, opt || {}));
    live.push(a);
    return a;
  };
  const T = (ms, fn) => { const c = tween(ms, fn); live.push(c); return c; };
  const run = () => {
    if (reduced) return;
    stop();
    try { build(A, T); } catch (e) { if (typeof console !== 'undefined') console.warn('[anim]', e); }
  };
  root.replay = run;
  const on = force !== undefined ? force : !!(spec && spec.anim);
  if (on && !reduced) onAttach(root, run);
  return run;
}

// Rút gọn thời lượng so le: tổng ≤ total ms
export function stagger(n, total, perMax) {
  if (n <= 1) return 0;
  return Math.min(perMax || 120, total / (n - 1));
}
