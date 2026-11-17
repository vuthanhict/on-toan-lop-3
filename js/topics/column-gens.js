// Bộ sinh bài type:'column' (tập đặt tính) cho cd07 (cộng/trừ), cd08 (nhân), cd11 (chia ngắn).
// Số liệu mới mỗi seed; explain.steps tự điền bằng vcalcSteps / vdivSteps. Chỉ phụ thuộc rng.js và paper.js (chạy được trong Node).
import { int, pick } from '../core/rng.js';
import * as P from '../core/paper.js';

const f = P.fmt;

/* ---------- tiện ích ---------- */
const carriesAdd = (a, b) => P.vcalcMicro('+', a, b).filter((m) => m.kind === 'digit' && m.carry).map((m) => m.col);
const regroups = (a, b) => P.vcalcMicro('−', a, b).filter((m) => m.kind === 'regroup').map((m) => m.col);
const carriesMul = (a, b) => P.vcalcMicro('×', a, b).filter((m) => m.kind === 'digit' && m.carry > 0).map((m) => m.col);
const same = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);
const rnd3 = (rng, lo = 100, hi = 999) => int(rng, lo, hi);

// thử ngẫu nhiên có giới hạn; hết lượt thì dùng cặp dự phòng (đã kiểm tra thoả điều kiện)
function find(sample, ok, fallback) {
  for (let t = 0; t < 800; t++) { const p = sample(); if (ok(p)) return p; }
  return fallback;
}

function colItem(genId, op, a, b, o) {
  let answer, rem, steps;
  if (op === '÷') { answer = String(Math.floor(a / b)); rem = String(a % b); steps = P.vdivSteps(a, b); }
  else { answer = String(P.vcalcResult(op, a, b)); steps = P.vcalcSteps(op, a, b, { check: true }); }
  const it = {
    id: genId, src: '[biến thể mới]', type: 'column', op, a, b, answer,
    prompt: o.prompt, hint: o.hint,
    explain: { steps },
    meta: { op, a, b },
    tags: ['đặt tính'].concat(o.tags || []),
  };
  if (op === '÷') it.rem = rem;
  return it;
}
// solve độc lập: tính lại từ meta
function solveCol(item) {
  const { op, a, b } = item.meta;
  if (op === '+') return String(a + b);
  if (op === '−') return String(a - b);
  if (op === '×') return String(a * b);
  return Math.floor(a / b) + '|' + (a % b);
}

const roundHund = (n) => Math.round(n / 100) * 100;
const roundTen = (n) => Math.round(n / 10) * 10;

/* ---------- lời đề ---------- */
const ADD_T = [
  (a, b) => `Đặt tính rồi tính: ${f(a)} + ${f(b)}.`,
  (a, b) => `Tính ${f(a)} + ${f(b)}. Con đặt tính dọc nhé.`,
  (a, b) => `Con đặt tính dọc rồi tính ${f(a)} + ${f(b)}.`,
];
const SUB_T = [
  (a, b) => `Đặt tính rồi tính: ${f(a)} − ${f(b)}.`,
  (a, b) => `Tính ${f(a)} − ${f(b)}. Con đặt tính dọc nhé.`,
  (a, b) => `Con đặt tính dọc rồi tính ${f(a)} − ${f(b)}.`,
];
const MUL_T = [
  (a, b) => `Đặt tính rồi tính: ${f(a)} × ${b}.`,
  (a, b) => `Tính ${f(a)} × ${b}. Con đặt tính dọc nhé.`,
  (a, b) => `Con đặt tính dọc rồi tính ${f(a)} × ${b}.`,
];
const DIV_T = [
  (a, b) => `Chia ngắn: ${f(a)} ÷ ${b}. Viết thương và số dư (không dư thì viết 0).`,
  (a, b) => `Đặt tính chia ngắn rồi tính ${f(a)} ÷ ${b}. Con viết thương và số dư.`,
  (a, b) => `Tính ${f(a)} ÷ ${b} bằng cách chia ngắn. Viết thương, rồi viết số dư (không dư thì viết 0).`,
];
const HINT_ADD = 'Con cộng từng hàng, bắt đầu từ hàng đơn vị. Được từ 10 trở lên thì viết đơn vị, nhớ 1 sang hàng bên cạnh.';
const HINT_SUB = 'Con trừ từng hàng, bắt đầu từ hàng đơn vị. Số trên bé hơn số dưới thì đổi 1 chục thành 10 đơn vị rồi trừ.';
const HINT_SUB0 = 'Hàng chục là 0 không đổi được. Con đổi dần: 1 trăm thành 10 chục, rồi 1 chục thành 10 đơn vị.';
const HINT_MUL = 'Con nhân từng hàng từ hàng đơn vị. Viết chữ số hàng đơn vị của kết quả, phần chục nhớ sang hàng bên cạnh rồi cộng thêm.';
const HINT_DIV = 'Con chia từ hàng cao nhất. Viết thương lên trên, số dư ghép với chữ số kế. Số dư luôn bé hơn số chia.';

/* ================================================================== */
/*  cd07: cộng, trừ trong phạm vi 1000 có nhóm lại                      */
/* ================================================================== */
const addGen = (id, label, ok, sample, fb, withEst) => ({
  id, covers: ['7.2'],
  make(rng) {
    const [a, b] = find(() => sample(rng), ([x, y]) => x + y <= 999 && ok(x, y), fb);
    let prompt = pick(rng, ADD_T)(a, b);
    if (withEst) { const ra = roundHund(a), rb = roundHund(b); prompt = `Tính ${f(a)} + ${f(b)}. Ước lượng là ${f(ra)} + ${f(rb)} = ${f(ra + rb)}, kết quả đúng phải gần số này.`; }
    return colItem(id, '+', a, b, { prompt, hint: HINT_ADD, tags: [label] });
  },
  solve: solveCol,
});
const subGen = (id, label, ok, sample, fb, hint) => ({
  id, covers: ['7.2'],
  make(rng) {
    const [a, b] = find(() => sample(rng), ([x, y]) => x > y && ok(x, y), fb);
    const prompt = pick(rng, SUB_T)(a, b);
    return colItem(id, '−', a, b, { prompt, hint: hint || HINT_SUB, tags: [label] });
  },
  solve: solveCol,
});

const GC7 = [
  addGen('gc7.1', 'nhớ hai hàng', (a, b) => same(carriesAdd(a, b), [0, 1]),
    (r) => [rnd3(r, 100, 899), rnd3(r, 100, 899)], [526, 195], true),
  addGen('gc7.2', 'nhớ ở hàng đơn vị', (a, b) => same(carriesAdd(a, b), [0]),
    (r) => [rnd3(r), int(r, 0, 1) ? rnd3(r) : int(r, 12, 99)], [234, 158]),
  addGen('gc7.3', 'nhớ ở hàng chục', (a, b) => same(carriesAdd(a, b), [1]),
    (r) => [rnd3(r), int(r, 0, 1) ? rnd3(r) : int(r, 12, 99)], [352, 281]),
  subGen('gc7.4', 'mượn ở hàng đơn vị', (a, b) => same(regroups(a, b), [0]),
    (r) => [rnd3(r, 200, 999), int(r, 0, 1) ? rnd3(r, 100, 899) : int(r, 12, 99)], [624, 238]),
  subGen('gc7.5', 'mượn ở hàng chục', (a, b) => same(regroups(a, b), [1]),
    (r) => [rnd3(r, 200, 999), int(r, 0, 1) ? rnd3(r, 100, 899) : int(r, 12, 99)], [372, 148]),
  subGen('gc7.6', 'mượn hai hàng', (a, b) => same(regroups(a, b), [0, 1]) && b >= 100,
    (r) => [rnd3(r, 200, 999), rnd3(r, 100, 899)], [621, 282]),
  subGen('gc7.7', 'trừ qua số 0', (a, b) => {
    const rg = regroups(a, b);
    return Math.floor(a / 10) % 10 === 0 && rg.includes(0) && b >= 100;
  }, (r) => [int(r, 2, 9) * 100 + int(r, 0, 8), rnd3(r, 100, 899)], [503, 278], HINT_SUB0),
  {
    id: 'gc7.8', covers: ['7.2'], // lời văn: cộng hoặc trừ có nhóm lại ở hàng đơn vị
    make(rng) {
      const plus = int(rng, 0, 1) === 0;
      const names = ['Mai', 'Nam', 'Lan', 'Minh', 'Hà', 'Bảo', 'An', 'Khoa'];
      const n1 = pick(rng, names), who2 = pick(rng, names.filter((x) => x !== n1));
      if (plus) {
        const [a, b] = find(() => [rnd3(rng, 150, 699), rnd3(rng, 120, 299)], ([x, y]) => x + y <= 999 && carriesAdd(x, y).includes(0), [348, 275]);
        const th = pick(rng, [['viên bi', 'viên bi'], ['quyển vở', 'quyển vở'], ['cái kẹo', 'cái kẹo'], ['bông hoa', 'bông hoa']]);
        return colItem('gc7.8', '+', a, b, { prompt: `${n1} có ${a} ${th[0]}, ${who2} có ${b} ${th[1]}. Cả hai có bao nhiêu ${th[1]}? Con đặt tính ${a} + ${b}.`, hint: HINT_ADD, tags: ['lời văn', 'nhớ'] });
      }
      const [a, b] = find(() => [rnd3(rng, 300, 900), rnd3(rng, 101, 299)], ([x, y]) => x > y && regroups(x, y).includes(0), [632, 247]);
      const th = pick(rng, [['trang sách', 'trang'], ['cái bánh', 'cái bánh'], ['quả cam', 'quả cam'], ['bạn nhỏ', 'bạn']]);
      return colItem('gc7.8', '−', a, b, { prompt: `Cửa hàng có ${a} ${th[0]}, đã bán ${b} ${th[0]}. Còn lại bao nhiêu ${th[0]}? Con đặt tính ${a} − ${b}.`, hint: HINT_SUB, tags: ['lời văn', 'mượn'] });
    },
    solve: solveCol,
  },
];

/* ================================================================== */
/*  cd08: nhân số 2–3 chữ số với số 1 chữ số                            */
/* ================================================================== */
const mulGen = (id, label, ok, sample, fb, mkPrompt) => ({
  id, covers: ['8.4'],
  make(rng) {
    const [a, b] = find(() => sample(rng), ([x, y]) => ok(x, y), fb);
    const prompt = mkPrompt ? mkPrompt(rng, a, b) : pick(rng, MUL_T)(a, b);
    return colItem(id, '×', a, b, { prompt, hint: HINT_MUL, tags: [label] });
  },
  solve: solveCol,
});
const zeroMid = (a) => String(a)[1] === '0';

const GC8 = [
  mulGen('gc8.1', 'nhớ hai lần', (a, b) => a * b >= 1000 && carriesMul(a, b).includes(0) && carriesMul(a, b).includes(1),
    (r) => [rnd3(r, 200, 799), int(r, 3, 9)], [614, 8],
    (r, a, b) => { const ra = roundHund(a); return `Tính ${f(a)} × ${b}. Ước lượng ${f(ra)} × ${b} = ${f(ra * b)}, kết quả đúng phải gần số này.`; }),
  mulGen('gc8.2', 'số có hai chữ số, nhớ', (a, b) => carriesMul(a, b).includes(0),
    (r) => [int(r, 12, 99), int(r, 3, 9)], [48, 6]),
  mulGen('gc8.3', 'nhớ liên tiếp ba hàng', (a, b) => same(carriesMul(a, b), [0, 1, 2]),
    (r) => [rnd3(r, 120, 999), int(r, 3, 9)], [368, 7]),
  mulGen('gc8.4', 'số 0 ở giữa', (a, b) => zeroMid(a) && String(a)[2] !== '0' && carriesMul(a, b).includes(0) && a * b < 9999,
    (r) => [int(r, 1, 9) * 100 + int(r, 1, 9), int(r, 3, 9)], [207, 6]),
  mulGen('gc8.5', 'nhớ ở hàng chục', (a, b) => same(carriesMul(a, b), [1]) || same(carriesMul(a, b), [1, 2]),
    (r) => [rnd3(r, 110, 399), int(r, 3, 9)], [231, 4]),
  {
    id: 'gc8.6', covers: ['8.4'], // lời văn
    make(rng) {
      const [a, b] = find(() => [rnd3(rng, 120, 480), int(rng, 3, 9)], ([x, y]) => carriesMul(x, y).length >= 1, [368, 7]);
      const ctx = pick(rng, [
        (x, y) => `Mỗi ngày một nông trại thu ${x} kg cà chua. Hỏi ${y} ngày thu bao nhiêu kg cà chua? Con đặt tính ${x} × ${y}.`,
        (x, y) => `Mỗi thùng có ${x} quả cam. Hỏi ${y} thùng như thế có bao nhiêu quả cam? Con đặt tính ${x} × ${y}.`,
        (x, y) => `Mỗi xe chở ${x} kg gạo. Hỏi ${y} xe chở bao nhiêu kg gạo? Con đặt tính ${x} × ${y}.`,
        (x, y) => `Mỗi bao đựng ${x} quả trứng. Hỏi ${y} bao đựng bao nhiêu quả trứng? Con đặt tính ${x} × ${y}.`,
      ]);
      return colItem('gc8.6', '×', a, b, { prompt: ctx(a, b), hint: HINT_MUL, tags: ['lời văn'] });
    },
    solve: solveCol,
  },
];

/* ================================================================== */
/*  cd11: chia ngắn số 2–3 chữ số cho số 1 chữ số                       */
/* ================================================================== */
const divGen = (id, label, sample, ok, fb, mkPrompt) => ({
  id, covers: ['11.2'],
  make(rng) {
    const [a, b] = find(() => sample(rng), ([x, y]) => ok(x, y), fb);
    const prompt = mkPrompt ? mkPrompt(rng, a, b) : pick(rng, DIV_T)(a, b);
    return colItem(id, '÷', a, b, { prompt, hint: HINT_DIV, tags: [label] });
  },
  solve: solveCol,
});

const GC11 = [
  divGen('gc11.1', 'chia hết, hai chữ số', (r) => { const b = int(r, 2, 9); const q = int(r, 10, Math.floor(99 / b)); return [q * b, b]; },
    (a, b) => a <= 99 && a >= 20 && a % b === 0 && a / b >= 10, [72, 6]),
  divGen('gc11.2', 'có dư, hai chữ số', (r) => { const b = int(r, 2, 9); const q = int(r, 10, Math.floor(98 / b)); return [q * b + int(r, 1, b - 1), b]; },
    (a, b) => a <= 99 && a % b !== 0 && Math.floor(a / b) >= 10, [65, 4]),
  divGen('gc11.3', 'chữ số đầu nhỏ hơn số chia', (r) => { const b = int(r, 3, 9); return [int(r, 10, b * 10 - 1), b]; },
    (a, b) => a >= 10 && a < b * 10 && String(a)[0] < String(b) && Math.floor(a / b) >= 1 && a > b, [45, 7],
    (r, a, b) => `Đặt tính chia ngắn: ${a} ÷ ${b}. Viết thương và số dư (không dư thì viết 0).`),
  divGen('gc11.4', 'ba chữ số, chia hết', (r) => { const b = int(r, 2, 9); const q = int(r, Math.ceil(100 / b), Math.floor(999 / b)); return [q * b, b]; },
    (a, b) => a >= 100 && a <= 999 && a % b === 0, [424, 4]),
  divGen('gc11.5', 'ba chữ số, có dư', (r) => { const b = int(r, 2, 9); const q = int(r, Math.ceil(100 / b), Math.floor(990 / b)); return [q * b + int(r, 1, b - 1), b]; },
    (a, b) => a >= 100 && a <= 999 && a % b !== 0, [538, 6]),
  {
    id: 'gc11.6', covers: ['11.2'], // lời văn: xếp đầy và còn thừa
    make(rng) {
      const [a, b] = find(() => { const b = int(rng, 3, 9); return [int(rng, 25, 99), b]; }, ([x, y]) => x % y !== 0 && Math.floor(x / y) >= 3, [40, 6]);
      const ctx = pick(rng, [
        (x, y) => `Có ${x} cái bánh, mỗi hộp xếp ${y} cái. Xếp được nhiều nhất mấy hộp đầy và còn thừa mấy cái bánh? Con chia ${x} ÷ ${y}: viết thương và số dư.`,
        (x, y) => `Có ${x} quyển vở, chia đều vào các túi, mỗi túi ${y} quyển. Được mấy túi đầy và thừa mấy quyển? Con chia ${x} ÷ ${y}: viết thương và số dư.`,
        (x, y) => `Có ${x} bạn xếp vào các xe, mỗi xe ${y} bạn. Được mấy xe đầy và còn mấy bạn chưa có chỗ? Con chia ${x} ÷ ${y}: viết thương và số dư.`,
        (x, y) => `Có ${x} bông hoa, cắm vào các bình, mỗi bình ${y} bông. Được mấy bình đầy và thừa mấy bông? Con chia ${x} ÷ ${y}: viết thương và số dư.`,
      ]);
      return colItem('gc11.6', '÷', a, b, { prompt: ctx(a, b), hint: HINT_DIV, tags: ['lời văn', 'có dư'] });
    },
    solve: solveCol,
  },
  divGen('gc11.7', 'thương có chữ số 0', (r) => { const b = int(r, 2, 9); const q = int(r, 1, 9) * 100 + int(r, 1, 9); const rem = int(r, 0, 1) ? int(r, 1, b - 1) : 0; return [q * b + rem, b]; },
    (a, b) => a >= 100 && a <= 999 && String(Math.floor(a / b))[1] === '0', [624, 6]),
];

const GENS = { cd07: GC7, cd08: GC8, cd11: GC11 };
export default GENS;

/** Gộp bộ sinh column vào các chủ đề (tại chỗ, an toàn khi gọi nhiều lần). */
export function mergeColumnGens(topics, gens = GENS) {
  (topics || []).forEach((t) => {
    if (!t || !gens[t.id]) return;
    const have = new Set((t.generators || []).map((g) => g.id));
    t.generators = [...(t.generators || []), ...gens[t.id].filter((g) => !have.has(g.id))];
  });
  return topics;
}
