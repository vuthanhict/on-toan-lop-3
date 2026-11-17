// Kiểm thử toàn bộ chủ đề: cấu trúc bài, bộ sinh bài (solve độc lập) và hình dùng trong bài
// Chạy: node site/tests/test-gen.mjs [soSeed=500]
import { seeded } from '../js/core/rng.js';
import { toSpoken } from '../js/core/speech.js';
import { mergeColumnGens } from '../js/topics/column-gens.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const SEEDS = Number(process.argv[2] || 500);
const KINDS = new Set('numberline sequence thermo place blocks3d dots array groups fracwall fracshape fracset measure angle shape2d grid clock timeline calendar venn grid100 balance table factorpairs bubble emoji vcalc vdiv workout'.split(' '));
const TYPES = new Set(['choice', 'multi', 'tf', 'numpad', 'order', 'match', 'classify', 'column']);
const errs = []; let nItems = 0, nGen = 0;
const err = (m) => { if (errs.length < 80) errs.push(m); else if (errs.length === 80) errs.push('… (còn nhiều lỗi nữa)'); };

function visualOk(v, where) {
  if (!v) return;
  if (!KINDS.has(v.kind)) err(`${where}: visual kind lạ "${v.kind}"`);
}
function checkText(s, where) {
  if (s == null) return;
  if (/undefined|NaN|\[object|-0(?!\d)/.test(String(s))) err(`${where}: chuỗi có "undefined/NaN/-0": ${String(s).slice(0, 60)}`);
}
function checkItem(it, where) {
  nItems++;
  if (!it || !TYPES.has(it.type)) return err(`${where}: type lạ ${it && it.type}`);
  if (!it.prompt) err(`${where}: thiếu prompt`);
  checkText(it.prompt, where); visualOk(it.visual, where);
  const steps = it.explain && it.explain.steps;
  if (!steps || !steps.length) err(`${where}: thiếu explain.steps`);
  else steps.forEach((s, i) => { if (!s.text) err(`${where}: step ${i} thiếu text`); checkText(s.text, where + ` step${i}`); visualOk(s.visual, where + ` step${i}`); });
  if (it.type === 'choice' || it.type === 'multi') {
    const cs = it.choices || [];
    if (cs.length < 2) err(`${where}: <2 lựa chọn`);
    const right = cs.filter((c) => c.correct);
    if (it.type === 'choice' && right.length !== 1) err(`${where}: cần đúng 1 đáp án đúng, có ${right.length}`);
    if (it.type === 'multi' && right.length < 2) err(`${where}: multi cần ≥2 đáp án đúng`);
    const texts = cs.map((c) => String(c.text) + '|' + (c.visual ? JSON.stringify(c.visual) : ''));
    if (new Set(texts).size !== texts.length) err(`${where}: có đáp án trùng nhau`);
    cs.forEach((c, i) => { checkText(c.text, where + ` ch${i}`); if (!c.correct && !c.why) err(`${where}: đáp án sai "${c.text}" thiếu why`); if (!c.correct && !c.code) err(`${where}: đáp án sai "${c.text}" thiếu code`); visualOk(c.visual, where); });
  }
  if (it.type === 'tf') { if (typeof it.answer !== 'boolean') err(`${where}: tf thiếu answer boolean`); if (it.reasons && it.reasons.filter((r) => r.correct).length !== 1) err(`${where}: tf cần đúng 1 lý do đúng`); }
  if (it.type === 'numpad') { if (!it.slots || !it.slots.length) err(`${where}: numpad thiếu slots`); else it.slots.forEach((s, i) => { if (s.answer == null || s.answer === '') err(`${where}: slot ${i} thiếu answer`); }); }
  if (it.type === 'column') {
    const OPS = ['+', '−', '×', '÷'];
    if (!OPS.includes(it.op)) err(`${where}: column op lạ "${it.op}"`);
    else if (!Number.isInteger(it.a) || !Number.isInteger(it.b) || it.a < 0 || it.b < 0) err(`${where}: column a/b không phải số tự nhiên`);
    else {
      if (!/^\d+$/.test(String(it.answer))) err(`${where}: column answer phải là chuỗi chữ số: ${it.answer}`);
      else if (it.op === '÷') {
        if (it.b < 2 || it.b > 9) err(`${where}: column ÷ số chia phải 2..9`);
        const rem = it.rem == null ? 0 : Number(it.rem);
        if (it.rem != null && !/^\d+$/.test(String(it.rem))) err(`${where}: column rem phải là chuỗi chữ số`);
        if (rem >= it.b) err(`${where}: column số dư ${rem} ≥ số chia ${it.b}`);
        if (Number(it.answer) * it.b + rem !== it.a) err(`${where}: column ÷ sai: ${it.a} ÷ ${it.b} ≠ ${it.answer} dư ${rem}`);
      } else {
        const want = it.op === '+' ? it.a + it.b : it.op === '−' ? it.a - it.b : it.a * it.b;
        if (String(want) !== String(it.answer)) err(`${where}: column ${it.a} ${it.op} ${it.b} = ${want} ≠ answer ${it.answer}`);
        if (it.op === '−' && it.a < it.b) err(`${where}: column trừ cần a ≥ b`);
        if (it.op === '×' && it.b > 9) err(`${where}: column × số nhân phải 1 chữ số`);
        if (String(it.answer).length > 4 && it.op !== '×') err(`${where}: column kết quả quá lớn`);
      }
    }
  }
  if (it.type === 'order') { const ids = (it.items || []).map((x) => x.id); if (!it.answer || it.answer.length !== ids.length || it.answer.some((a) => !ids.includes(a))) err(`${where}: order answer không khớp items`); }
  if (it.type === 'match') { for (const l of it.left || []) { if (!(l.id in (it.pairs || {}))) err(`${where}: match thiếu pairs cho ${l.id}`); else if (!(it.right || []).some((r) => r.id === it.pairs[l.id])) err(`${where}: pairs trỏ tới right không tồn tại`); } }
  if (it.type === 'classify') { for (const c of it.chips || []) { if (!(c.id in (it.answer || {}))) err(`${where}: classify thiếu answer cho ${c.id}`); else if (!(it.buckets || []).some((b) => b.id === it.answer[c.id])) err(`${where}: classify answer sai bucket`); } }
  // lời đọc không được rỗng
  if (!toSpoken(it.say || it.prompt)) err(`${where}: lời đọc rỗng`);
}
function answerOf(it) {
  if (it.type === 'choice') return it.choices.find((c) => c.correct).text;
  if (it.type === 'multi') return it.choices.filter((c) => c.correct).map((c) => c.text).sort().join(',');
  if (it.type === 'tf') return String(it.answer);
  if (it.type === 'numpad') return it.slots.map((s) => s.answer).join('|');
  if (it.type === 'column') return it.answer + (it.rem != null ? '|' + it.rem : '');
  if (it.type === 'order') return it.answer.join(',');
  return canon(it.pairs || it.answer);
}
function canon(o) { if (o && typeof o === 'object') return '{' + Object.keys(o).sort().map((k) => k + ':' + o[k]).join(',') + '}'; return String(o); }
function canonSol(v) { return typeof v === 'object' && v ? canon(v) : String(v); }
const warns = [];

const files = fs.readdirSync(path.join(dir, '../js/topics')).filter((f) => /^cd\d\d\.js$/.test(f)).sort();
const ids = new Set();
for (const f of files) {
  let t;
  try { t = (await import('../js/topics/' + f)).default; } catch (e) { err(`${f}: không nạp được: ${e.message}`); continue; }
  mergeColumnGens([t]);
  const W = f;
  if (!t.id || !t.title) err(`${W}: thiếu id/title`);
  if ((t.remember || []).length < 2) err(`${W}: remember < 2`);
  (t.remember || []).forEach((r, i) => { visualOk(r.visual, `${W} remember${i}`); if (!r.text) err(`${W}: remember ${i} thiếu text`); });
  (t.lesson || []).forEach((s, i) => { visualOk(s.visual, `${W} lesson${i}`); if (!s.text) err(`${W}: lesson ${i} thiếu text`); });
  if (!t.lesson || t.lesson.length < 2) err(`${W}: lesson < 2 bước`);
  const all = [...(t.items || []), ...(t.variant ? [t.variant] : [])];
  if (all.length < 4) err(`${W}: chỉ có ${all.length} bài`);
  for (const it of all) { if (ids.has(it.id)) err(`${W}: trùng id ${it.id}`); ids.add(it.id); checkItem(it, `${W} #${it.id}`); }
  if ((t.generators || []).length < 2) err(`${W}: <2 generators`);
  for (const g of t.generators || []) {
    nGen++;
    let seen = new Set();
    for (let s = 1; s <= SEEDS; s++) {
      let it; try { it = g.make(seeded(s)); } catch (e) { err(`${W} ${g.id} seed ${s}: make lỗi ${e.message}`); break; }
      checkItem(it, `${W} ${g.id} seed ${s}`);
      let sol; try { sol = g.solve(it); } catch (e) { err(`${W} ${g.id} seed ${s}: solve lỗi ${e.message}`); break; }
      let exp; try { exp = answerOf(it); } catch (e) { err(`${W} ${g.id} seed ${s}: không lấy được đáp án`); break; }
      const solS = canonSol(sol).replace(/^\{|\}$/g,'').split(',').sort().join(','), expS = String(exp).replace(/^\{|\}$/g,'').split(',').sort().join(',');
      if (solS !== expS && String(sol) !== String(exp)) { err(`${W} ${g.id} seed ${s}: solve="${sol}" ≠ đáp án trong bài="${exp}" | ${String(it.prompt).slice(0, 70)}`); break; }
      seen.add(it.prompt + JSON.stringify(it.choices ? it.choices.map((c) => c.text) : it.slots || it.items || it.chips || null) + JSON.stringify(it.visual || null));
      if (errs.length > 60) break;
    }
    if (seen.size < Math.min(8, SEEDS / 4)) warns.push(`${W} ${g.id}: ít biến thể (${seen.size} khác nhau/${SEEDS} seed)`);
  }
}
if (warns.length) { console.log('CẢNH BÁO (' + warns.length + '):'); warns.forEach((w) => console.log(' - ' + w)); }
console.log(`Chủ đề: ${files.length}, bài kiểm tra: ${nItems}, generator: ${nGen}`);
if (errs.length) { console.log('LỖI (' + errs.length + '):'); errs.forEach((e) => console.log(' - ' + e)); process.exit(1); }
console.log('OK — không có lỗi.');
