// Kiểm thử chống học vẹt: xáo lựa chọn không làm sai đáp án; vị trí đáp án đúng phân bố đều; phiên sau cho số liệu mới;
// mỗi bài cố định có bộ sinh bao phủ (cảnh báo; STRICT=1 thì thành lỗi).
import { seeded } from '../js/core/rng.js';
import { prepareItem, signature } from '../js/core/variety.js';
import { POOL_SIZE } from '../js/core/pool.js';
import * as practice from '../js/core/practice.js';
import { store } from '../js/core/store.js';
import { mergeColumnGens } from '../js/topics/column-gens.js';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const STRICT = !!process.env.STRICT; const errs = [], warns = [];
const files = fs.readdirSync(path.join(dir, '../js/topics')).filter((f) => /^cd\d\d\.js$/.test(f)).sort();
const topics = []; for (const f of files) topics.push((await import('../js/topics/' + f)).default);
mergeColumnGens(topics);
const sameType = (x, y) => x === y || ((x === 'numpad' || x === 'column') && (y === 'numpad' || y === 'column'));

function ok(it, sh, tag) {
  if (it.type === 'choice' || it.type === 'multi') {
    const a = it.choices.filter((c) => c.correct).map((c) => c.text).sort().join('|'), b = sh.choices.filter((c) => c.correct).map((c) => c.text).sort().join('|');
    if (a !== b) errs.push(tag + ': đáp án đúng đổi sau khi xáo');
    if (it.choices.length !== sh.choices.length) errs.push(tag + ': số lựa chọn đổi');
  } else if (it.type === 'tf' && it.reasons) { if (sh.reasons.filter((r) => r.correct).length !== 1) errs.push(tag + ': tf mất lý do đúng'); }
  else if (it.type === 'order') { const ids = sh.items.map((x) => x.id).sort().join(','), want = it.items.map((x) => x.id).sort().join(','); if (ids !== want) errs.push(tag + ': order mất thẻ'); if (sh.items.length > 1 && sh.items.map((x) => x.id).join(',') === it.answer.join(',')) errs.push(tag + ': order xáo ra đúng thứ tự đáp án'); }
  else if (it.type === 'match') { if (sh.left.length !== it.left.length || sh.right.length !== it.right.length) errs.push(tag + ': match mất ô'); }
  else if (it.type === 'classify') { if (sh.chips.length !== it.chips.length) errs.push(tag + ': classify mất thẻ'); }
}
let n = 0;
for (const t of topics) {
  const fixed = [...t.items, t.variant].filter(Boolean);
  for (const it of fixed) for (let s = 1; s <= 5; s++) { ok(it, prepareItem(it, s), t.id + '#' + it.id); n++; }
  for (const g of t.generators || []) for (let s = 1; s <= POOL_SIZE; s++) { const it = g.make(seeded(s)); ok(it, prepareItem(it, s), t.id + ' ' + g.id); n++; }
  // phân bố vị trí đáp án đúng
  for (const it of fixed.filter((x) => x.type === 'choice')) {
    const cnt = {}; const N = 300; let pinned = it.choices.some((c) => /^(cả hai|tất cả|không có)/i.test(c.text));
    for (let s = 0; s < N; s++) { const sh = prepareItem(it, 1000 + s); const pos = sh.choices.findIndex((c) => c.correct); cnt[pos] = (cnt[pos] || 0) + 1; }
    const k = it.choices.length; if (!pinned) for (let p = 0; p < k; p++) { const f = (cnt[p] || 0) / N; if (f < 0.1 || f > 0.45) errs.push(t.id + '#' + it.id + ': vị trí đáp án lệch (vị trí ' + p + ' = ' + Math.round(f * 100) + '%)'); }
  }
  // bao phủ
  for (const it of fixed) {
    const gens = (t.generators || []).filter((g) => (g.covers || []).includes(it.id));
    if (!gens.length) warns.push(t.id + '#' + it.id + ' (' + it.type + '): chưa có bộ sinh `covers`');
    else if (!gens.some((g) => { try { return sameType(g.make(seeded(1)).type, it.type); } catch (e) { return false; } })) warns.push(t.id + '#' + it.id + ': bộ sinh covers nhưng khác type ' + it.type);
  }
  // độ đa dạng trong khoảng seed
  for (const g of t.generators || []) { const sg = new Set(); for (let s = 1; s <= POOL_SIZE; s++) sg.add(signature(g.make(seeded(s)))); if (sg.size < Math.ceil(POOL_SIZE * 0.9) && !g.lowVariety) warns.push(t.id + ' ' + g.id + ': chỉ ' + sg.size + '/' + POOL_SIZE + ' bài khác nhau trong khoảng seed'); }
  // lời giải nhắc chữ cái đáp án
  for (const it of fixed) for (const s of (it.explain.steps || [])) if (/(đáp án|phương án|chọn) (là )?[A-D]\b/.test(s.text)) warns.push(t.id + '#' + it.id + ': lời giải nhắc chữ cái đáp án: "' + s.text.slice(0, 50) + '"');
}
// mô phỏng phiên: lần 1 = bài chọn lọc, lần 2.. = biến thể mới, không lặp (gen, seed) trong một vòng
store.reset();
for (const t of topics) {
  const q1 = practice.queueFor(t); const nv = q1.filter((x) => x._variant); if (nv.some((x) => x.type !== 'column') || nv.length > 1) errs.push(t.id + ': phiên đầu chỉ được thêm tối đa 1 bài đặt tính (column)');
  store.topic(t.id).tries = 1;
  const seenKey = new Set(); let dup = 0, fixedLeft = 0;
  for (let round = 0; round < 4; round++) { const q = practice.queueFor(t); if (q.length < 5) errs.push(t.id + ': hàng đợi quá ngắn'); q.forEach((x) => { if (!x._variant) fixedLeft++; else { const k = x._gen + ':' + x._seed; if (seenKey.has(k)) dup++; seenKey.add(k); } }); }
  if (dup) errs.push(t.id + ': lặp (bộ sinh, seed) trong 4 phiên liên tiếp: ' + dup);
  if (fixedLeft) warns.push(t.id + ': ' + fixedLeft + '/28 bài vẫn là bài cố định ở phiên sau (thiếu bộ sinh bao phủ)');
}
console.log(`Đã kiểm ${n} lượt xáo/biến thể, ${topics.length} chủ đề.`);
if (warns.length) { console.log((STRICT ? 'LỖI' : 'CẢNH BÁO') + ' (' + warns.length + '):'); warns.slice(0, 60).forEach((w) => console.log(' - ' + w)); if (warns.length > 60) console.log(' … và ' + (warns.length - 60) + ' mục nữa'); }
if (errs.length || (STRICT && warns.length)) { console.log('LỖI (' + errs.length + '):'); errs.forEach((e) => console.log(' - ' + e)); process.exit(1); }
console.log('OK — không có lỗi' + (warns.length ? ' (còn ' + warns.length + ' cảnh báo)' : '') + '.');
