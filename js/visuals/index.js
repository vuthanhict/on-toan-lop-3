// Registry hình minh hoạ: nạp mọi tệp trong visuals/, bỏ qua tệp thiếu/lỗi
const FILES = ['numberline', 'thermo', 'place', 'dots', 'groups', 'fraction', 'measure', 'geometry', 'time', 'misc'];
const kinds = new Map();
let loaded = null;
let uidN = 0;
export const vctx = {
  reduced: typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  lite: false,
  palette: ['#4F6BED', '#F5893A', '#34B27B', '#8B6CF0', '#F7BE2C', '#EC7468', '#3BB3C4', '#5D6985'],
  uid() { return 'v' + (++uidN); },
};

export function loadVisuals() {
  if (loaded) return loaded;
  loaded = Promise.all(FILES.map((f) => import('./' + f + '.js').then((m) => {
    const mod = m.default;
    if (mod && mod.kinds) mod.kinds.forEach((k) => kinds.set(k, mod));
  }).catch((e) => { console.warn('visual file missing/failed:', f, e && e.message); }))).then(() => kinds);
  return loaded;
}
export function hasKind(k) { return kinds.has(k); }
export function knownKinds() { return [...kinds.keys()]; }

export function renderVisual(spec) {
  const wrap = document.createElement('div');
  wrap.className = 'visual';
  if (!spec || !spec.kind) return wrap;
  const mod = kinds.get(spec.kind);
  if (!mod) { wrap.className = 'visual visual-missing'; wrap.textContent = ''; return wrap; }
  try {
    const el = mod.render(spec, vctx);
    if (el) {
      wrap.appendChild(el); wrap.replay = () => { if (el.replay) el.replay(); };
      // lưới an toàn: nếu hoạt hình chưa kịp bắt đầu (tab nền, rAF bị chậm) thì vẫn hiện hình tĩnh
      setTimeout(() => { if (el.style && el.style.visibility === 'hidden') el.style.visibility = ''; }, 1500);
    }
  } catch (e) {
    console.warn('visual error', spec.kind, e);
    wrap.className = 'visual visual-missing';
  }
  return wrap;
}
