// Soạn bài cho phiên luyện tập: lần đầu = bài chọn lọc theo tài liệu; các lần sau = biến thể số liệu mới.
// "Ôn câu sai" luôn cho một BIẾN THỂ cùng kỹ năng, không bao giờ phát lại đúng bài đã làm.
import { store } from './store.js';
import { seeded, shuffle } from './rng.js';
import { POOL_SIZE } from './pool.js';
import { signature } from './variety.js';

const seenOf = (genId) => { const s = store.get(); s.seen = s.seen || {}; return s.seen[genId] || (s.seen[genId] = []); };

// Chọn seed CHƯA dùng trong khoảng 1..POOL_SIZE (mp3 thu sẵn khớp); hết thì bắt đầu vòng mới, tránh 4 seed gần nhất.
export function nextSeed(genId, avoid = []) {
  const seen = seenOf(genId);
  let free = []; for (let i = 1; i <= POOL_SIZE; i++) if (!seen.includes(i) && !avoid.includes(i)) free.push(i);
  if (!free.length) { const keep = seen.slice(-4); seen.length = 0; keep.forEach((k) => seen.push(k)); for (let i = 1; i <= POOL_SIZE; i++) if (!seen.includes(i) && !avoid.includes(i)) free.push(i); }
  if (!free.length) free = [1 + Math.floor(Math.random() * POOL_SIZE)];
  return free[Math.floor(Math.random() * free.length)];
}
function markSeen(genId, seed) { const s = seenOf(genId); if (!s.includes(seed)) s.push(seed); store.save(); }

const copyFixed = (t, it) => Object.assign({}, it, { _ref: { t: t.id, i: it.id }, _topic: t });

function makeFrom(t, gen, ref) {
  const seed = nextSeed(gen.id); const it = gen.make(seeded(seed)); markSeen(gen.id, seed);
  it._gen = gen.id; it._seed = seed; it._topic = t; it._ref = ref; it._variant = true;
  return it;
}
const fixedOf = (t, id) => [...(t.items || []), ...(t.variant ? [t.variant] : [])].find((x) => x.id === id);

// Biến thể cùng kỹ năng của bài cố định `id`: ưu tiên bộ sinh có `covers` chứa id, rồi bộ sinh cùng `type`.
export function variantFor(t, id, { avoidGen } = {}) {
  const gens = t.generators || []; const fx = fixedOf(t, id);
  let pool = gens.filter((g) => (g.covers || []).includes(id));
  if (!pool.length && fx) pool = gens.filter((g) => { try { return g.make(seeded(1)).type === fx.type; } catch (e) { return false; } });
  if (avoidGen && pool.length > 1) pool = pool.filter((g) => g.id !== avoidGen);
  if (!pool.length) return null;
  const g = pool[Math.floor(Math.random() * pool.length)];
  return makeFrom(t, g, { t: t.id, i: id });
}

// Bài "tương tự" sau khi xem lời giải
export function similarFor(t, item) {
  const id = (item._ref && item._ref.i) || item.id;
  const v = variantFor(t, id, { avoidGen: item._gen });
  if (v) { v._similar = true; return v; }
  const gens = t.generators || []; if (!gens.length) return null;
  const g = gens[Math.floor(Math.random() * gens.length)];
  const it = makeFrom(t, g, { t: t.id, g: g.id }); it._similar = true; return it;
}

// Hàng đợi một chủ đề. Lần đầu: bài chọn lọc theo tài liệu; từ lần 2: biến thể mới (không trùng dấu vân tay).
export function queueFor(t, { forceFixed = false } = {}) {
  const fixed = [...(t.items || []).slice(0, 6), ...(t.variant ? [t.variant] : [])];
  const tries = (store.topic(t.id).tries || 0);
  if (forceFixed || tries === 0) {
    const q0 = fixed.map((it) => copyFixed(t, it));
    // chủ đề có phép tính đặt dọc: thêm 1 bài "tập đặt tính" ở cuối phiên đầu để bé làm quen cách viết nháp
    const cg = (t.generators || []).filter((g) => { try { return g.make(seeded(1)).type === 'column'; } catch (e) { return false; } });
    if (cg.length && !forceFixed) q0.push(makeFrom(t, cg[Math.floor(Math.random() * cg.length)], { t: t.id, i: (cg[0].covers || [])[0] || fixed[0].id }));
    return q0;
  }
  const used = new Set(); const out = [];
  fixed.forEach((it) => {
    let v = null;
    for (let k = 0; k < 4 && !v; k++) { const c = variantFor(t, it.id); if (c && !used.has(signature(c))) v = c; }
    if (v) { used.add(signature(v)); out.push(v); } else out.push(copyFixed(t, it));
  });
  return out;
}

// "Ôn câu sai": mỗi mục là {t,i} (bài cố định) hoặc {t,g,s} (bài sinh) → luôn trả về BIẾN THỂ mới; `_ref` giữ tham chiếu gốc để xoá khỏi danh sách khi đúng.
export function resolveReview(topics, ref) {
  const t = topics.find((x) => x.id === ref.t); if (!t) return null;
  if (ref.i) { const v = variantFor(t, ref.i); if (v) { v._ref = ref; return v; } const fx = fixedOf(t, ref.i); return fx ? Object.assign(copyFixed(t, fx), { _ref: ref }) : null; }
  if (ref.g) { const g = (t.generators || []).find((x) => x.id === ref.g); if (!g) return null; const it = makeFrom(t, g, ref); return it; }
  return null;
}

// Đề thử: mỗi chủ đề một biến thể mới (ưu tiên), thêm các chủ đề nặng.
export function examQueue(topics, rng) {
  const q = [];
  topics.forEach((t) => {
    const ids = [...(t.items || []), ...(t.variant ? [t.variant] : [])].map((x) => x.id);
    const id = ids[Math.floor(rng.next() * ids.length)];
    const v = id ? variantFor(t, id) : null;
    if (v) q.push(v); else if (id) q.push(copyFixed(t, fixedOf(t, id)));
  });
  shuffle(rng, topics.filter((t) => [3, 7, 10, 11, 12].includes(t.no))).forEach((t) => {
    if (q.length >= 20) return; const ids = [...(t.items || [])].map((x) => x.id); const v = variantFor(t, ids[Math.floor(rng.next() * ids.length)]); if (v) q.push(v);
  });
  return shuffle(rng, q).slice(0, 20);
}
