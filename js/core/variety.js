// Chống học vẹt (phần thuần): xáo thứ tự lựa chọn/thẻ mỗi lần hiển thị, giữ đúng đáp án.
import { seeded, shuffle } from './rng.js';

// lựa chọn kiểu "Cả hai…/Tất cả…/Không có…" luôn đứng cuối
const PIN = /^(cả hai|cả ba|cả bốn|tất cả|không (có )?(cái|bạn|phép|số|hình|câu|ý|cách)?\s?nào|không đúng|không phải|đều đúng|đều sai)/i;

export function shuffleChoices(rng, arr) {
  const pinned = arr.filter((c) => PIN.test(String(c.text || '')));
  const rest = arr.filter((c) => !PIN.test(String(c.text || '')));
  return [...shuffle(rng, rest), ...pinned];
}
const clone = (arr) => (arr || []).map((x) => Object.assign({}, x));

// Trả về BẢN SAO bài đã xáo (không sửa bài gốc).
export function prepareItem(item, seed) {
  const rng = seeded(seed == null ? Math.floor(Math.random() * 1e9) : seed);
  const it = Object.assign({}, item);
  if (item.type === 'choice' || item.type === 'multi') it.choices = shuffleChoices(rng, clone(item.choices));
  else if (item.type === 'tf' && item.reasons) it.reasons = shuffle(rng, clone(item.reasons));
  else if (item.type === 'order') {
    let items = shuffle(rng, clone(item.items)); let k = 0;
    const same = (a) => a.map((x) => x.id).join(',') === (item.answer || []).join(',');
    while (same(items) && items.length > 1 && k++ < 8) items = shuffle(rng, clone(item.items));
    it.items = items;
  } else if (item.type === 'match') { it.left = shuffle(rng, clone(item.left)); it.right = shuffle(rng, clone(item.right)); }
  else if (item.type === 'classify') it.chips = shuffle(rng, clone(item.chips));
  return it;
}

// Dấu vân tay bài (để loại trùng trong một phiên)
export function signature(it) {
  const lr = it.left ? it.left.map((x) => x.text).join('|') + '~' + (it.right || []).map((x) => x.text).join('|') : '';
  const body = lr || (it.choices ? it.choices.map((c) => c.text).join('|') : it.slots ? it.slots.map((s) => s.answer).join('|') : it.items ? it.items.map((x) => x.text).join('|') : it.chips ? it.chips.map((x) => x.text).join('|') : '');
  return String(it.prompt) + '#' + body;
}
