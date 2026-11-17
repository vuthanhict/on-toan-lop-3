// Lưu tiến độ: localStorage, có dự phòng bộ nhớ khi bị chặn
const KEY = 'toan3-hk1-v1';
let mem = null;
function todayStr() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

function blank() {
  return { v: 2, topics: {}, wrong: [], streak: { last: '', count: 0 }, settings: { voice: true, lite: false, sound: true, eye: 'auto' }, exam: { best: 0, tries: 0 }, start: todayStr(), seed: Math.floor(Math.random() * 1e6),
    seen: {}, coins: 0, xp: 0, badges: [], wardrobe: { equipped: {} }, quests: { date: '', correct: 0, topics: 0, learned: 0, chest: false, noted: [] },
    stats: { correct: 0, first: 0, bestCombo: 0, fixed: 0, learned: 0 } };
}
function merge(base, saved) {
  // gộp nông từng nhánh để bản lưu cũ vẫn có các trường game mới
  const out = Object.assign({}, base, saved);
  for (const k of ['settings', 'stats', 'quests', 'wardrobe', 'exam', 'streak']) out[k] = Object.assign({}, base[k], saved[k] || {});
  if (!out.wardrobe.equipped) out.wardrobe.equipped = {};
  return out;
}
function load() {
  if (mem) return mem;
  try { const raw = localStorage.getItem(KEY); mem = raw ? merge(blank(), JSON.parse(raw)) : blank(); }
  catch (e) { mem = blank(); }
  return mem;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { } }

export const store = {
  get() { return load(); },
  save,
  touchDay() {
    const s = load(); const t = todayStr();
    if (s.streak.last === t) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const ys = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
    s.streak.count = s.streak.last === ys ? s.streak.count + 1 : 1;
    s.streak.last = t; save();
  },
  topic(id) { const s = load(); return s.topics[id] || (s.topics[id] = { stars: 0, done: 0, best: 0, tries: 0, learned: false }); },
  setSetting(k, v) { load().settings[k] = v; save(); },
  addWrong(ref) {
    const s = load(); const k = JSON.stringify(ref);
    if (!s.wrong.some((w) => JSON.stringify(w) === k)) s.wrong.push(ref); save();
  },
  clearWrong(ref) {
    const s = load(); const k = JSON.stringify(ref);
    s.wrong = s.wrong.filter((w) => JSON.stringify(w) !== k); save();
  },
  totalStars() { const s = load(); return Object.values(s.topics).reduce((a, t) => a + (t.stars || 0), 0); },
  reset() { mem = blank(); save(); },
  exportCode() { try { return btoa(unescape(encodeURIComponent(JSON.stringify(load())))); } catch (e) { return ''; } },
  importCode(code) { try { mem = merge(blank(), JSON.parse(decodeURIComponent(escape(atob(code.trim()))))); save(); return true; } catch (e) { return false; } },
};
