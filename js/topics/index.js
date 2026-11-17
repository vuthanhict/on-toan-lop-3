// Registry chủ đề: cd01..cd16
import { seeded } from '../core/rng.js';
export const TOPIC_IDS = Array.from({ length: 16 }, (_, i) => 'cd' + String(i + 1).padStart(2, '0'));
let cache = null;
export function loadTopics() {
  if (cache) return cache;
  cache = Promise.all(TOPIC_IDS.map((id) => import('./' + id + '.js').then((m) => m.default).catch((e) => { console.warn('topic missing', id, e && e.message); return null; })))
    .then((list) => list.filter(Boolean).sort((a, b) => a.no - b.no))
    // gộp bộ sinh bài 'column' (tập đặt tính) vào các chủ đề
    .then((list) => import('./column-gens.js').then((m) => { m.mergeColumnGens(list); return list; }).catch((e) => { console.warn('column-gens missing', e && e.message); return list; }));
  return cache;
}

// Tham chiếu bài: {t:topicId, i:itemId} (bài cố định) hoặc {t, g:genId, s:seed} (bài sinh)
export function resolveRef(topics, ref) {
  const t = topics.find((x) => x.id === ref.t);
  if (!t) return null;
  if (ref.g) {
    const gen = (t.generators || []).find((g) => g.id === ref.g);
    if (!gen) return null;
    const it = gen.make(seeded(ref.s));
    it._ref = ref; it._topic = t;
    return it;
  }
  const all = [...(t.items || []), ...(t.variant ? [t.variant] : [])];
  const it = all.find((x) => x.id === ref.i);
  if (!it) return null;
  return Object.assign({}, it, { _ref: ref, _topic: t });
}
export function makeSimilar(topic, avoidSeedBase = 0) {
  const gens = topic.generators || [];
  if (!gens.length) return null;
  const s = Math.floor(Math.random() * 1e6) + avoidSeedBase;
  const gen = gens[s % gens.length];
  const it = gen.make(seeded(s));
  it._ref = { t: topic.id, g: gen.id, s }; it._topic = topic; it._similar = true;
  return it;
}
