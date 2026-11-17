// Kiểm thử logic "viết nháp từng bước" (js/core/paper.js). Chạy: node tests/test-paper.mjs
import * as P from '../js/core/paper.js';

let fails = 0, checks = 0;
const failMsgs = [];
function ok(cond, msg) {
  checks++;
  if (!cond) { fails++; if (failMsgs.length < 40) failMsgs.push(msg); }
}
const BAD = /NaN|undefined|null|\[object|Infinity/;
const cleanText = (s) => typeof s === 'string' && s.length > 0 && !BAD.test(s);

// PRNG có hạt giống (mulberry32)
let seed = 20260101;
function rnd() {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const ri = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
const pickOne = (arr) => arr[ri(0, arr.length - 1)];
const f = P.fmt;
const drv = P.dr;

/* ---------- mô phỏng bước nhỏ ---------- */
function simAdd(a, b) {
  const micro = P.vcalcMicro('+', a, b);
  const res = {}, marks = {};
  const A = drv(a), B = drv(b);
  let carry = 0;
  for (const m of micro) {
    ok(cleanText(m.say) && cleanText(m.text), `+ text ${a}+${b}`);
    if (m.kind === 'digit') {
      const sum = (A[m.col] || 0) + (B[m.col] || 0) + carry;
      ok(m.digit === sum % 10, `+ digit ${a}+${b} col${m.col}`);
      ok(m.say.includes(String(m.digit)) && (m.sum === sum), `+ say ${a}+${b} col${m.col}`);
      ok(m.say.includes(f(sum)) || (m.da === null || m.db === null) && !m.cin, `+ say sum ${a}+${b} col${m.col}: ${m.say}`);
      res[m.col] = m.digit; carry = sum >= 10 ? 1 : 0;
    } else if (m.kind === 'carry') { marks[m.col] = m.digit; ok(m.digit === 1 && carry === 1, `+ carry ${a}+${b}`); }
    else if (m.kind === 'lead') { res[m.col] = m.digit; ok(m.digit === 1 && carry === 1, `+ lead ${a}+${b}`); }
  }
  const cols = Object.keys(res).map(Number);
  const s = cols.sort((x, y) => y - x).map((c) => res[c]).join('');
  ok(s === String(a + b), `+ kết quả ${a}+${b} = ${a + b}, mô phỏng ${s}`);
  ok(cols.length === String(a + b).length && cols[cols.length - 1] === 0, `+ đủ cột ${a}+${b}`);
}

function simSub(a, b) {
  const micro = P.vcalcMicro('−', a, b);
  const A = drv(a), B = drv(b);
  const cur = A.slice(), res = {};
  const value = () => cur.reduce((acc, d, i) => acc + d * Math.pow(10, i), 0);
  let lastCol = -1;
  for (const m of micro) {
    ok(cleanText(m.say), `− text ${a}−${b}`);
    ok(m.col >= lastCol, `− thứ tự cột ${a}−${b}`); lastCol = Math.max(lastCol, m.col);
    if (m.kind === 'regroup') {
      const c = m.col, bb = B[c] || 0;
      ok(cur[c] < bb, `− chỉ nhóm lại khi không đủ trừ ${a}−${b}`);
      for (const ch of m.changes) { ok(cur[ch.col] === ch.from, `− from ${a}−${b} col${ch.col}`); cur[ch.col] = ch.to; }
      ok(value() === a, `− giá trị được giữ khi nhóm lại ${a}−${b}: ${value()}`);
      ok(cur[c] >= bb && cur[c] <= 18, `− sau nhóm lại đủ trừ ${a}−${b}`);
      ok(m.say.includes('10 +') && m.say.includes(String(cur[c])), `− say regroup ${a}−${b}`);
      ok(m.changes.every((ch) => ch.to >= 0 && ch.to <= 18), `− changes ${a}−${b}`);
    } else if (m.kind === 'digit') {
      const bb = B[m.col] || 0;
      ok(cur[m.col] - bb === m.digit && m.digit >= 0 && m.digit <= 9, `− digit ${a}−${b} col${m.col}`);
      ok(m.say.includes(String(m.digit)), `− say digit ${a}−${b}`);
      res[m.col] = m.digit;
    } else if (m.kind === 'skip') {
      ok(cur[m.col] - (B[m.col] || 0) === 0, `− skip ${a}−${b}`);
    }
  }
  const cols = Object.keys(res).map(Number).sort((x, y) => y - x);
  ok(cols.map((c) => res[c]).join('') === String(a - b), `− kết quả ${a}−${b} = ${a - b}`);
}

function simMul(a, b) {
  const micro = P.vcalcMicro('×', a, b);
  const A = drv(a), res = {};
  let carry = 0;
  for (const m of micro) {
    ok(cleanText(m.say), `× text ${a}×${b}`);
    if (m.kind === 'digit') {
      const prod = A[m.col] * b + carry;
      ok(m.digit === prod % 10 && m.carry === Math.floor(prod / 10) && m.prod === prod, `× digit ${a}×${b} col${m.col}`);
      ok(m.say.includes(f(prod)) && m.say.includes(`Viết ${m.digit}`), `× say ${a}×${b}: ${m.say}`);
      if (m.carry) ok(m.say.includes(`nhớ ${m.carry}`) || m.kind !== 'digit', `× nhớ ${a}×${b}`);
      res[m.col] = m.digit; carry = Math.floor(prod / 10);
    } else if (m.kind === 'carry') ok(m.digit === carry, `× carry ${a}×${b}`);
    else if (m.kind === 'lead') { res[m.col] = m.digit; ok(m.digit === carry, `× lead ${a}×${b}`); }
  }
  const cols = Object.keys(res).map(Number).sort((x, y) => y - x);
  ok(cols.map((c) => res[c]).join('') === String(a * b), `× kết quả ${a}×${b} = ${a * b}`);
}

const VALID_KINDS = new Set(['vcalc', 'vdiv', 'workout']);
function checkSteps(steps, kind, finalHas, label, maxN) {
  ok(Array.isArray(steps) && steps.length >= 2 && steps.length <= (maxN || 7), `${label}: số bước ${steps && steps.length}`);
  let prev = -1;
  steps.forEach((s, i) => {
    ok(cleanText(s.text) && cleanText(s.say), `${label}: text bước ${i}`);
    ok(s.visual && VALID_KINDS.has(s.visual.kind) && s.visual.kind === kind, `${label}: kind bước ${i}`);
    const u = s.visual && s.visual.upto;
    ok(Number.isInteger(u) && u >= 0, `${label}: upto nguyên ≥0 bước ${i}`);
    ok(u >= prev, `${label}: upto không giảm bước ${i}`);
    if (i > 0) ok(u > prev || (i === steps.length - 1), `${label}: upto tăng bước ${i} (${prev}→${u})`);
    const fr = s.visual && s.visual.from;
    ok(fr === undefined || (Number.isInteger(fr) && fr >= 0 && fr <= u), `${label}: from hợp lệ bước ${i} (${fr}/${u})`);
    if (i > 0 && i < steps.length - 1 && fr !== undefined) ok(fr === prev, `${label}: from = upto bước trước, bước ${i} (${fr} vs ${prev})`);
    prev = u;
  });
  const last = steps[steps.length - 1];
  ok(last.visual.done === true, `${label}: bước cuối done`);
  ok(last.text.includes(finalHas), `${label}: bước cuối chứa "${finalHas}": ${last.text}`);
}

function testVcalc(op, a, b) {
  const res = op === '+' ? a + b : op === '−' ? a - b : a * b;
  if (op === '+') simAdd(a, b); else if (op === '−') simSub(a, b); else simMul(a, b);
  const steps = P.vcalcSteps(op, a, b);
  checkSteps(steps, 'vcalc', f(res), `vcalcSteps ${a}${op}${b}`, 6);
  const micro = P.vcalcMicro(op, a, b);
  ok(steps[steps.length - 1].visual.upto === micro.length, `vcalc upto cuối = số bước nhỏ ${a}${op}${b}`);
  ok(steps[0].visual.upto === 0 && steps[0].visual.op === op && steps[0].visual.a === a && steps[0].visual.b === b, `vcalc bước 0 ${a}${op}${b}`);
  // cấu hình op ASCII
  if (rnd() < 0.01) ok(P.vcalcSteps(op === '−' ? '-' : op === '×' ? '*' : op, a, b).length === steps.length, 'op ASCII');
}

function testVdiv(a, b) {
  const q = Math.floor(a / b), r = a % b;
  const micro = P.vdivMicro(a, b);
  const D = String(a).split('').map(Number);
  let rem = 0, qs = '', started = false, finalR = 0;
  for (const m of micro) {
    ok(cleanText(m.say), `÷ text ${a}÷${b}`);
    if (m.kind === 'join') {
      ok(!started && m.digit < b && m.i === 0, `÷ join ${a}÷${b}`);
      rem = rem * 10 + D[m.i];
    } else if (m.kind === 'quot') {
      const cur = rem * 10 + D[m.i];
      started = true;
      ok(m.cur === cur && cur === m.q * b + m.r && m.r < b && m.q <= 9, `÷ quot ${a}÷${b} i${m.i}`);
      ok(m.say.includes(`${cur}`) && m.say.includes(`Viết ${m.q}`), `÷ say ${a}÷${b}: ${m.say}`);
      qs += String(m.q); rem = m.r; finalR = m.r;
    } else if (m.kind === 'carry') {
      ok(m.r === rem && m.r > 0 && m.say.includes(String(m.r * 10 + D[m.i])), `÷ carry ${a}÷${b}: ${m.say}`);
    } else if (m.kind === 'rem') ok(m.r === r && m.say.includes(String(r)), `÷ rem ${a}÷${b}`);
  }
  ok(Number(qs) === q && qs.length === String(q).length || (q === 0 && qs === '0'), `÷ thương ${a}÷${b}: ${qs}`);
  ok(finalR === r, `÷ dư ${a}÷${b}`);
  ok((micro.some((m) => m.kind === 'rem')) === (r > 0), `÷ có bước dư ${a}÷${b}`);
  if (D[0] < b && D.length > 1) ok(micro[0].kind === 'join', `÷ chữ số đầu < số chia ${a}÷${b}`);
  const steps = P.vdivSteps(a, b);
  checkSteps(steps, 'vdiv', `${q}${r ? ' dư ' + r : ''}`, `vdivSteps ${a}÷${b}`, 6);
  ok(steps[steps.length - 1].visual.upto === micro.length, `vdiv upto cuối ${a}÷${b}`);
  ok(steps[steps.length - 1].text.includes(`${q} × ${b}${r ? ' + ' + r : ''} = ${f(a)}`), `vdiv thử lại ${a}÷${b}`);
}

// kiểm tra các dòng "x op y = z" trong workout
function checkWorkoutLines(lines, label) {
  const re = /^([\d ]+) ([+−×÷]) ([\d ]+) = ([\d ]+)(?: dư (\d+))?$/;
  lines.forEach((l) => {
    ok(cleanText(l.text) && (l.note === undefined || typeof l.note === 'string'), `${label}: dòng ${JSON.stringify(l)}`);
    const m = re.exec(l.text);
    if (m) {
      const x = Number(m[1].replace(/ /g, '')), y = Number(m[3].replace(/ /g, '')), z = Number(m[4].replace(/ /g, ''));
      const v = m[2] === '+' ? x + y : m[2] === '−' ? x - y : m[2] === '×' ? x * y : Math.floor(x / y);
      ok(v === z, `${label}: sai số học "${l.text}"`);
      if (m[5] !== undefined) ok(x % y === Number(m[5]), `${label}: dư sai "${l.text}"`);
    }
  });
}

function testPartial(a, b) {
  const steps = P.partialMulSteps(a, b);
  checkSteps(steps, 'workout', f(a * b), `partialMul ${a}×${b}`, 6);
  const lines = steps[0].visual.lines;
  checkWorkoutLines(lines, `partialMul ${a}×${b}`);
  ok(steps[steps.length - 1].visual.upto === lines.length, `partialMul upto cuối ${a}×${b}`);
  ok(lines[lines.length - 1].text === `${f(a)} × ${b} = ${f(a * b)}`, `partialMul dòng cuối ${a}×${b}`);
  // các phần cộng lại bằng a
  const m = /\(([^)]*)\)/.exec(lines[1].text);
  ok(m && m[1].split(' + ').reduce((s, x) => s + Number(x.replace(/ /g, '')), 0) === a, `partialMul tách ${a}`);
  steps.forEach((s) => ok(s.visual.lines === lines || JSON.stringify(s.visual.lines) === JSON.stringify(lines), 'partialMul lines nhất quán'));
}

function testEstimate(op, a, b) {
  const steps = P.estimateSteps(op, a, b);
  const exact = op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : Math.floor(a / b);
  checkSteps(steps, 'workout', f(exact), `estimate ${a}${op}${b}`, 6);
  const lines = steps[0].visual.lines;
  checkWorkoutLines(lines, `estimate ${a}${op}${b}`);
  ok(steps[steps.length - 1].visual.upto === lines.length, `estimate upto cuối ${a}${op}${b}`);
  ok(lines.some((l) => l.text.startsWith(`${f(a)} ${op} ${f(b)} = ${f(exact)}`)), `estimate có dòng chính xác ${a}${op}${b}`);
  if (op !== '÷') {
    const ra = P.roundTo(a).v, rb = P.roundTo(b).v;
    ok(Math.abs(ra - a) <= P.roundTo(a).place / 2 && ra % P.roundTo(a).place === 0, `làm tròn ${a}`);
    ok(Math.abs(rb - b) <= P.roundTo(b).place / 2, `làm tròn ${b}`);
  }
}

function testColumnWhy(op, a, b) {
  const res = String(op === '+' ? a + b : op === '−' ? a - b : a * b);
  ok(P.columnWhy(op, a, b, res) === '', `columnWhy đúng → rỗng ${a}${op}${b}`);
  // đổi 1 chữ số ngẫu nhiên
  const pos = ri(0, res.length - 1);
  let nd = String(ri(0, 9));
  if (nd === res[pos]) nd = String((Number(nd) + 1) % 10);
  const wrong = res.slice(0, pos) + nd + res.slice(pos + 1);
  if (wrong !== res) {
    const info = P.columnWhyInfo(op, a, b, wrong);
    ok(info.ok === false && cleanText(info.why), `columnWhy sai ${a}${op}${b}→${wrong}`);
    ok(info.col === res.length - 1 - pos, `columnWhy cột sai đầu tiên ${a}${op}${b}→${wrong}: ${info.col}`);
    ok(info.expected === res[pos] && info.got === nd, `columnWhy expected/got ${a}${op}${b}`);
  }
  // thiếu chữ số
  if (res.length > 1) {
    const info = P.columnWhyInfo(op, a, b, res.slice(1));
    ok(info.ok === false && info.col === res.length - 1 && cleanText(info.why), `columnWhy thiếu ${a}${op}${b}`);
  }
}

/* ---------- ca khó cố định ---------- */
const hardAdd = [[358, 467], [234, 151], [999, 1], [9999, 9999], [5, 5], [0, 0], [0, 7], [95, 5], [999, 999], [1000, 9000], [4999, 5001], [66, 7], [8, 9992], [908, 92], [199, 1]];
const hardSub = [[503, 278], [300, 128], [826, 457], [1000, 1], [100, 99], [1000, 999], [9000, 1], [7000, 6999], [5, 5], [0, 0], [400, 400], [503, 498], [305, 99], [1010, 11], [9999, 1], [800, 7], [1200, 345], [4000, 1234], [101, 2], [100, 1]];
const hardMul = [[214, 3], [368, 7], [999, 9], [9999, 9], [0, 5], [5, 0], [300, 3], [105, 8], [1000, 9], [96, 5], [5, 5], [123, 1], [909, 9], [250, 4], [499, 2]];
const hardDiv = [[84, 6], [95, 4], [434, 7], [5, 7], [0, 3], [100, 5], [806, 4], [700, 7], [999, 9], [999, 1], [47, 8], [65, 4], [91, 7], [72, 6], [56, 4], [120, 8], [305, 6], [1002, 7], [9999, 9], [10, 9], [9, 9], [17, 3], [630, 9], [201, 2]];
for (const [a, b] of hardAdd) { testVcalc('+', a, b); testColumnWhy('+', a, b); }
for (const [a, b] of hardSub) { testVcalc('−', a, b); testColumnWhy('−', a, b); }
for (const [a, b] of hardMul) { testVcalc('×', a, b); testColumnWhy('×', a, b); }
for (const [a, b] of hardDiv) testVdiv(a, b);
for (const [a, b] of [[214, 3], [368, 7], [305, 8], [300, 3], [96, 5], [1234, 4], [7, 7], [0, 5]]) testPartial(a, b);
for (const [o, a, b] of [['+', 516, 372], ['−', 472, 128], ['×', 368, 7], ['÷', 56, 4], ['÷', 72, 6], ['÷', 91, 7], ['÷', 28, 4], ['÷', 13, 3], ['+', 45, 38], ['−', 503, 278], ['+', 3, 4], ['×', 96, 5], ['÷', 8, 9], ['+', 999, 999], ['−', 1000, 1]]) testEstimate(o, a, b);

/* ---------- lỗi tham số phải ném RangeError ---------- */
for (const fn of [() => P.vcalcMicro('−', 5, 9), () => P.vcalcMicro('×', 5, 12), () => P.vcalcMicro('+', -1, 3), () => P.vcalcMicro('+', 10000, 3), () => P.vdivMicro(10, 0), () => P.vdivMicro(10, 10), () => P.vcalcMicro('?', 1, 2)]) {
  let threw = false;
  try { fn(); } catch (e) { threw = e instanceof RangeError; }
  ok(threw, 'phải ném RangeError');
}

/* ---------- 20 000 phép tính ngẫu nhiên có kiểm soát ---------- */
const N = 20000;
const rnum = (maxDigits) => {
  const d = ri(1, maxDigits), mode = ri(0, 5);
  const hi = Math.pow(10, d) - 1;
  if (mode === 0) return hi;                                      // toàn 9
  if (mode === 1) return ri(1, 9) * Math.pow(10, d - 1);          // tròn (300)
  if (mode === 2) return d >= 3 ? ri(1, 9) * Math.pow(10, d - 1) + ri(0, 9) : ri(0, hi); // có 0 giữa (503)
  return ri(Math.pow(10, d - 1) * (d > 1 ? 1 : 0), hi);
};
let cnt = { '+': 0, '−': 0, '×': 0, '÷': 0, est: 0, pm: 0 };
for (let t = 0; t < N; t++) {
  const kind = t % 10;
  if (kind <= 2) { // cộng
    const maxD = rnd() < 0.7 ? 3 : 4;
    const a = rnum(maxD), b = rnum(maxD);
    testVcalc('+', a, b); cnt['+']++;
    if (t % 7 === 0) testColumnWhy('+', a, b);
  } else if (kind <= 5) { // trừ
    const maxD = rnd() < 0.7 ? 3 : 4;
    let a = rnum(maxD), b = rnum(maxD);
    if (a < b) [a, b] = [b, a];
    if (rnd() < 0.3) { a = ri(1, 9) * Math.pow(10, ri(2, 3)) + (rnd() < 0.5 ? 0 : ri(0, 9)); b = ri(1, Math.max(1, a)); }
    testVcalc('−', a, b); cnt['−']++;
    if (t % 7 === 0) testColumnWhy('−', a, b);
  } else if (kind <= 7) { // nhân
    const a = rnum(rnd() < 0.7 ? 3 : 4), b = ri(1, 9);
    testVcalc('×', a, b); cnt['×']++;
    if (t % 10 === 6) testPartial(rnd() < 0.8 ? Math.min(a, 999) : a, b), cnt.pm++;
    if (t % 7 === 0) testColumnWhy('×', a, b);
  } else if (kind === 8) { // chia
    const b = ri(2, 9);
    let a = rnd() < 0.85 ? ri(10, 999) : ri(0, 9999);
    if (rnd() < 0.3) a = ri(1, b - 1) * Math.pow(10, ri(1, 2)) + ri(0, 99); // chữ số đầu < số chia
    if (a > 9999) a = 9999;
    testVdiv(a, b); cnt['÷']++;
  } else { // ước lượng
    const op = pickOne(['+', '−', '×', '÷']);
    let a, b;
    if (op === '÷') { b = ri(2, 9); a = ri(b, 99); }
    else if (op === '×') { a = ri(2, 999); b = ri(2, 9); }
    else { a = ri(1, 999); b = ri(1, 999); if (op === '−' && a < b) [a, b] = [b, a]; }
    testEstimate(op, a, b); cnt.est++;
  }
}

console.log(`Kiểm tra: ${checks} điều kiện, ${N} phép tính ngẫu nhiên + ca khó`, JSON.stringify(cnt));
if (fails) {
  console.log(`THẤT BẠI: ${fails} lỗi. Mẫu:`);
  failMsgs.forEach((m) => console.log('  - ' + m));
  process.exit(1);
}
console.log('XANH — mọi kiểm tra đạt.');
