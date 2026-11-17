// Luật chơi: xu, XP, cấp độ, combo, huy hiệu, nhiệm vụ trong ngày, phụ kiện cho Mít.
// Nguyên tắc: thưởng cho làm đúng và nỗ lực; sai không bị trừ gì; không có đồng hồ hay mất mạng.
import { store } from './store.js';

export const TITLES = ['Tập sự', 'Thám hiểm nhí', 'Chiến binh Toán', 'Siêu nhân Toán', 'Nhà vô địch'];
export function levelInfo(xp) {
  let lv = 1, need = 60, rest = xp || 0;
  while (rest >= need) { rest -= need; lv++; need = 60 * lv; }
  return { lv, into: rest, need, pct: Math.round((rest / need) * 100), title: TITLES[Math.min(lv - 1, TITLES.length - 1)] };
}

let TOPICS = [];
export function setTopics(t) { TOPICS = t || []; }

const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

function ctxNow() {
  const s = store.get();
  const recs = TOPICS.map((t) => store.topic(t.id));
  const dayDone = (n) => { const ts = TOPICS.filter((t) => t.day === n); return ts.length > 0 && ts.every((t) => store.topic(t.id).stars > 0); };
  return {
    lv: levelInfo(s.xp).lv, stats: s.stats, examBest: s.exam.best || 0,
    anyDone: recs.some((r) => r.stars > 0), perfect: recs.some((r) => r.stars >= 3), dayDone,
  };
}

export const ITEMS = [
  { id: 'glasses', slot: 'face', name: 'Kính râm', need: 'Đạt cấp 2', test: (c) => c.lv >= 2 },
  { id: 'band', slot: 'head', name: 'Băng đô ninja', need: 'Đạt cấp 3', test: (c) => c.lv >= 3 },
  { id: 'cape', slot: 'back', name: 'Áo choàng siêu nhân', need: 'Đạt cấp 4', test: (c) => c.lv >= 4 },
  { id: 'medal', slot: 'neck', name: 'Huy chương vàng', need: 'Đạt cấp 5 hoặc đề thử đúng 16/20', test: (c) => c.lv >= 5 || c.examBest >= 16 },
];
export const BADGES = [
  { id: 'first', name: 'Khởi hành', desc: 'Luyện xong chủ đề đầu tiên', icon: 'flag', color: '#4F6BED', test: (c) => c.anyDone },
  { id: 'combo5', name: 'Chuỗi 5', desc: 'Đúng liên tiếp 5 câu', icon: 'flame', color: '#F5893A', test: (c) => c.stats.bestCombo >= 5 },
  { id: 'combo10', name: 'Chuỗi 10', desc: 'Đúng liên tiếp 10 câu', icon: 'flame', color: '#EC7468', test: (c) => c.stats.bestCombo >= 10 },
  { id: 'perfect', name: 'Hoàn hảo', desc: 'Được 3 sao ở một chủ đề', icon: 'star', color: '#F7BE2C', test: (c) => c.perfect },
  { id: 'detective', name: 'Thám tử', desc: 'Sửa đúng 5 câu sai', icon: 'review', color: '#218B5C', test: (c) => c.stats.fixed >= 5 },
  { id: 'd1', name: 'Hết Ngày 1', desc: 'Luyện xong mọi chủ đề Ngày 1', icon: 'check', color: '#3BB3C4', test: (c) => c.dayDone(1) },
  { id: 'd3', name: 'Hết Ngày 3', desc: 'Luyện xong mọi chủ đề Ngày 3', icon: 'check', color: '#8B6CF0', test: (c) => c.dayDone(3) },
  { id: 'd5', name: 'Hết Ngày 5', desc: 'Luyện xong mọi chủ đề Ngày 5', icon: 'check', color: '#EC7468', test: (c) => c.dayDone(5) },
  { id: 'exam', name: 'Thử sức', desc: 'Làm một đề thử', icon: 'exam', color: '#8B6CF0', test: (c) => c.examBest > 0 },
  { id: 'champ', name: 'Nhà vô địch', desc: 'Đề thử đúng từ 16/20', icon: 'trophy', color: '#F7BE2C', test: (c) => c.examBest >= 16 },
];

// ---- combo (trong phiên) ----
let combo = 0;
export const getCombo = () => combo;
export const resetCombo = () => { combo = 0; };

// ---- nhiệm vụ trong ngày ----
function qState() {
  const q = store.get().quests;
  if (q.date !== todayStr()) Object.assign(q, { date: todayStr(), correct: 0, topics: 0, learned: 0, chest: false, noted: [] });
  return q;
}
export function quests() {
  const q = qState();
  return [
    { id: 'learn', text: 'Xem 1 bài giảng hoạt hình', have: q.learned, need: 1 },
    { id: 'correct', text: 'Làm đúng 10 câu', have: q.correct, need: 10 },
    { id: 'topic', text: 'Luyện xong 1 chủ đề', have: q.topics, need: 1 },
  ];
}
export const chestReady = () => quests().every((x) => x.have >= x.need) && !qState().chest;
export function claimChest() {
  const s = store.get(); const q = qState(); if (q.chest || !quests().every((x) => x.have >= x.need)) return null;
  q.chest = true; s.coins += 50; const lvUp = addXp(20); store.save();
  return { coins: 50, xp: 20, levelUp: lvUp, ...evaluate(), quests: [] };
}
function newQuestsDone() {
  const q = qState(); const out = [];
  for (const x of quests()) if (x.have >= x.need && !q.noted.includes(x.id)) { q.noted.push(x.id); out.push(x); }
  return out;
}

// ---- thưởng ----
function addXp(n) {
  const s = store.get(); const before = levelInfo(s.xp).lv; s.xp += n; const after = levelInfo(s.xp).lv; return after > before ? after : 0;
}
function evaluate() {
  const s = store.get(); const c = ctxNow(); const out = { badges: [], items: [] };
  for (const b of BADGES) if (!s.badges.includes(b.id) && b.test(c)) { s.badges.push(b.id); out.badges.push(b); }
  const owned = s.wardrobe.owned || (s.wardrobe.owned = []);
  for (const it of ITEMS) if (!owned.includes(it.id) && it.test(c)) { owned.push(it.id); out.items.push(it); }
  return out;
}
const finish = (base) => { const ev = evaluate(); const qd = newQuestsDone(); store.save(); return { ...base, ...ev, quests: qd }; };

/** kind: 'first' | 'second' | 'similar'; mode: 'practice' | 'review' */
export function onCorrect(kind, mode = 'practice') {
  const s = store.get(); qState();
  combo++; s.stats.bestCombo = Math.max(s.stats.bestCombo, combo);
  const base = kind === 'first' ? 10 : kind === 'similar' ? 8 : 5;
  const bonus = combo >= 3 ? Math.min(6, (combo - 2) * 2) : 0;
  s.coins += base + bonus; const lvUp = addXp(base);
  s.stats.correct++; if (kind === 'first') s.stats.first++; if (mode === 'review') s.stats.fixed++;
  qState().correct++;
  return finish({ coins: base + bonus, xp: base, bonus, combo, levelUp: lvUp });
}
export const onWrong = () => { combo = 0; };
export function onTopicDone(stars) {
  const s = store.get(); qState().topics++;
  const c = [0, 20, 30, 40][stars] || 20; s.coins += c; const lvUp = addXp(c);
  return finish({ coins: c, xp: c, levelUp: lvUp, combo: 0 });
}
export function onExamDone(correct) {
  const s = store.get(); const c = correct * 2; s.coins += c; const lvUp = addXp(c);
  return finish({ coins: c, xp: c, levelUp: lvUp, combo: 0 });
}
export function onLearned(first = true) {
  // nhiệm vụ ngày luôn được tính; xu chỉ thưởng lần đầu xem bài giảng đó (không cày)
  const s = store.get(); qState().learned++; s.stats.learned++;
  const c = first ? 3 : 0; s.coins += c; const lvUp = first ? addXp(5) : 0;
  return finish({ coins: c, xp: first ? 5 : 0, levelUp: lvUp, combo: 0 });
}

// ---- tủ đồ ----
export const owned = () => (store.get().wardrobe.owned || []);
export function equip(id) {
  const it = ITEMS.find((x) => x.id === id); if (!it || !owned().includes(id)) return false;
  const e = store.get().wardrobe.equipped; if (e[it.slot] === id) delete e[it.slot]; else e[it.slot] = id;
  store.save(); return true;
}
