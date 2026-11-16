// CĐ8 · Nhân với số có 1 chữ số, bài toán có lời văn (Ước lượng → Phép tính → Kết luận)
import { pick, int, shuffle, seeded } from '../core/rng.js';

/* ---------- tiện ích dùng riêng trong file ---------- */
const fmt = (n) => {
  const s = String(Math.abs(n));
  const t = s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s;
  return (n < 0 ? '−' : '') + t;
};
const IDS = ['a', 'b', 'c', 'd', 'e', 'f'];
const HN = ['đơn vị', 'chục', 'trăm'];
const est = (a) => { const u = a >= 100 ? 100 : 10; return Math.round(a / u) * u; };

function buildChoices(rng, right, wrongs) {
  const all = shuffle(rng, [{ text: right, correct: true }, ...wrongs.map((w) => ({ text: w.text, code: w.code, why: w.why }))]);
  return all.map((c, i) => ({ id: IDS[i], ...c }));
}
function distinct(pool, rightText, n) {
  const seen = new Set([rightText]);
  const out = [];
  for (const w of pool) { if (seen.has(w.text)) continue; seen.add(w.text); out.push(w); if (out.length === n) break; }
  return out;
}

/* ----- nhân dọc có nhớ ----- */
function mulCalc(a, b) {
  const ds = String(a).split('').reverse().map(Number);
  const ps = [], carries = [];
  let c = 0;
  for (let i = 0; i < ds.length; i++) { const p = ds[i] * b + c; ps.push(p); c = Math.floor(p / 10); carries.push(c); }
  return { ds, n: ds.length, ps, carries };
}
// mô phỏng cách làm SAI: fix = {i, forget:true} bỏ qua số nhớ ở hàng i, hoặc {i, delta} nhớ lệch delta
function mulSim(a, b, fix) {
  const ds = String(a).split('').reverse().map(Number);
  let carry = 0;
  const out = [];
  for (let i = 0; i < ds.length; i++) {
    let cin = carry;
    if (fix && fix.i === i) cin = fix.forget ? 0 : carry + fix.delta;
    const p = ds[i] * b + cin;
    if (i === ds.length - 1) out.push(String(p)); else { out.push(String(p % 10)); carry = Math.floor(p / 10); }
  }
  const last = out.pop();
  return Number(last + out.reverse().join(''));
}
function mulTable(a, b, k) { // k = số hàng đã tính
  const m = mulCalc(a, b), n = m.n, prod = a * b, res = String(prod), L = res.length;
  const row0 = ['nhớ', '', '', '', ''], row1 = ['', '', '', '', ''], row2 = ['×', '', '', '', String(b)], row3 = ['=', '', '', '', ''];
  for (let i = 0; i < n; i++) row1[4 - i] = String(m.ds[i]);
  for (let i = 0; i < Math.min(k, n - 1); i++) if (m.carries[i] > 0) row0[4 - (i + 1)] = String(m.carries[i]);
  const hide = [];
  for (let j = 0; j < L; j++) {
    if (k >= n || j < k) row3[4 - j] = res[L - 1 - j]; else hide.push([3, 4 - j]);
  }
  const col = 4 - Math.max(0, k - 1);
  return { kind: 'table', headers: ['', 'Nghìn', 'Trăm', 'Chục', 'Đơn vị'], rows: [row0, row1, row2, row3], hide, highlight: k >= 1 && k <= n ? [[1, col], [3, col], [2, 4]] : [] };
}
function mulSteps(a, b) {
  const m = mulCalc(a, b), n = m.n, prod = a * b;
  const steps = [];
  for (let i = 0; i < n; i++) {
    const d = m.ds[i], cin = i ? m.carries[i - 1] : 0, p = m.ps[i];
    const last = i === n - 1;
    const tail = last || p < 10 ? `Viết ${p}.` : `Viết ${p % 10}, nhớ ${Math.floor(p / 10)}.`;
    steps.push({ text: `Hàng ${HN[i]}: ${d} × ${b}${cin ? ` + ${cin} (nhớ)` : ''} = ${p}. ${tail}`, visual: mulTable(a, b, i + 1) });
  }
  steps.push({ text: `Vậy ${fmt(a)} × ${b} = ${fmt(prod)}. Ước lượng ${fmt(est(a))} × ${b} = ${fmt(est(a) * b)} gần số này nên hợp lí.`, mark: 'good', visual: mulTable(a, b, n) });
  return steps;
}
// lập bảng theo hàng
function splitTable(a, b, hideTens) {
  const [h, t, u] = [Math.floor(a / 100), Math.floor(a / 10) % 10, a % 10];
  return {
    kind: 'table', headers: ['', 'Trăm', 'Chục', 'Đơn vị'],
    rows: [[fmt(a), String(h * 100), String(t * 10), String(u)], [`× ${b}`, `${h * 100} × ${b}`, `${t * 10} × ${b}`, `${u} × ${b}`], ['bằng', fmt(h * 100 * b), fmt(t * 10 * b), fmt(u * b)]],
    hide: hideTens ? [[2, 2]] : [],
  };
}
const wordTable = (rows) => ({ kind: 'table', headers: ['Bước', 'Việc làm'], rows });

/* ---------- bài cố định ---------- */
const items = [
  {
    id: '8.1', src: 'T6 tr.1 C2', type: 'choice',
    prompt: 'Tích của 48 và 6 là:',
    choices: [
      { id: 'a', text: '288', correct: true },
      { id: 'b', text: '248', code: 'NHỚ', why: '8 × 6 = 48, viết 8 và nhớ 4. Hàng chục: 4 × 6 = 24, thêm 4 là 28. Con nhớ cộng số nhớ nhé.' },
      { id: 'c', text: '268', code: 'NHỚ', why: 'Số nhớ là 4 (từ 48), không phải 2. Hàng chục: 24 + 4 = 28.' },
      { id: 'd', text: '284', code: 'QUY', why: 'Hai chữ số bị đảo chỗ rồi. Hàng chục phải ra 28 và hàng đơn vị là 8: 288.' },
    ],
    hint: 'Tích là kết quả của phép nhân. Nhớ cộng số nhớ vào hàng chục.',
    explain: {
      steps: [
        { text: 'Tích là kết quả của phép nhân. Tìm tích của 48 và 6 tức là tính 48 × 6.' },
        ...mulSteps(48, 6),
      ],
    },
    tags: ['nhân', 'tích'],
  },
  {
    id: '8.2', src: 'T6 tr.2 C6', type: 'choice',
    prompt: 'Lập bảng 235 × 3: 600 + ● + 15 = ? Chọn số ở ● và kết quả phép nhân.',
    visual: splitTable(235, 3, true),
    choices: [
      { id: 'a', text: '● = 90; tổng = 705', correct: true },
      { id: 'b', text: '● = 60; tổng = 675', code: 'HÀNG', why: '30 × 3 = 90, không phải 60. Chữ số hàng chục là 3.' },
      { id: 'c', text: '● = 90; tổng = 105', code: 'QUY', why: '105 mới chỉ là 90 + 15. Tổng phải cộng cả ba ô: 600 + 90 + 15.' },
      { id: 'd', text: '● = 90; tổng = 695', code: 'QUY', why: 'Ô cuối là 5 × 3 = 15, không phải 5. Chữ số 5 cũng phải nhân với 3.' },
    ],
    hint: 'Ô ở giữa là hàng chục: 30 × 3.',
    explain: {
      steps: [
        { text: 'Tách 235 = 200 + 30 + 5, rồi nhân từng phần với 3.', visual: { kind: 'place', digits: '235', showValue: true, highlight: [0, 1, 2], anim: 'fill' } },
        { text: '200 × 3 = 600; 30 × 3 = 90; 5 × 3 = 15. Vậy ● = 90.', visual: splitTable(235, 3, false) },
        { text: 'Cộng lại: 600 + 90 + 15 = 705. Vậy đáp án là ● = 90 và tổng = 705.', mark: 'good', visual: wordTable([['Trăm', '200 × 3 = 600'], ['Chục', '30 × 3 = 90'], ['Đơn vị', '5 × 3 = 15'], ['Cộng', '600 + 90 + 15 = 705']]) },
      ],
    },
    tags: ['nhân', 'lập bảng'],
  },
  {
    id: '8.3', src: 'T6 tr.1 C3', type: 'multi',
    prompt: 'Chọn tất cả phép nhân có tích bằng 3 200.',
    choices: [
      { id: 'a', text: '900 × 3', code: 'QUY', why: '900 × 3 = 2 700, không phải 3 200.' },
      { id: 'b', text: '800 × 4', correct: true },
      { id: 'c', text: '1 600 × 2', correct: true },
      { id: 'd', text: '400 × 8', correct: true },
      { id: 'e', text: '32 × 100', correct: true },
      { id: 'f', text: '32 × 1 000', code: 'HÀNG', why: '32 × 1 000 = 32 000. Thừa một chữ số 0, nhân 100 mới là 3 200.' },
    ],
    hint: 'Tính tích của từng phép, đừng dừng ở phép đầu tiên tìm được.',
    explain: {
      steps: [
        { text: 'Tính từng phép: 800 × 4 = 3 200; 1 600 × 2 = 3 200; 400 × 8 = 3 200. Cả ba đều đúng.', visual: wordTable([['800 × 4', '8 × 4 = 32, thêm hai số 0: 3 200'], ['1 600 × 2', '16 × 2 = 32, thêm hai số 0: 3 200'], ['400 × 8', '4 × 8 = 32, thêm hai số 0: 3 200']]) },
        { text: '32 × 100 = 3 200 (thêm hai chữ số 0). Còn 32 × 1 000 = 32 000, thừa một chữ số 0.', mark: 'bad' },
        { text: '900 × 3 = 2 700, không bằng 3 200. Vậy chọn 800 × 4, 1 600 × 2, 400 × 8 và 32 × 100.', mark: 'good' },
      ],
    },
    tags: ['nhân', 'nhiều đáp án'],
  },
  {
    id: '8.4', src: 'T6 tr.2 C7c', type: 'numpad',
    prompt: 'Tính 614 × 8. Ước lượng 600 × 8 = 4 800, kết quả đúng phải gần số này.',
    visual: mulTable(614, 8, 0),
    slots: [{ label: '614 × 8 =', answer: '4912', len: 4 }],
    wrongHints: [
      { match: '4882', code: 'NHỚ', why: '4 × 8 = 32, viết 2 nhớ 3. Hàng chục: 1 × 8 = 8, thêm nhớ 3 là 11, không phải 8.' },
      { match: '4812', code: 'NHỚ', why: 'Hàng chục 11 viết 1 nhớ 1. Hàng trăm: 6 × 8 = 48, thêm nhớ 1 là 49.' },
    ],
    hint: 'Hàng đơn vị: 4 × 8 = 32, viết 2 nhớ 3.',
    explain: { steps: mulSteps(614, 8) },
    tags: ['nhân', 'nhân dọc'],
  },
  {
    id: '8.5', src: 'T6 tr.2 C8', type: 'order',
    prompt: 'Một nông trại mỗi ngày thu 368 kg cà chua. Hỏi 7 ngày thu bao nhiêu kg cà chua?\nXếp các bước giải theo đúng thứ tự (chạm bước làm trước).',
    items: [
      { id: 'calc', text: 'Phép tính: 368 × 7 = 2 576' },
      { id: 'ans', text: 'Kết luận: 7 ngày thu 2 576 kg cà chua' },
      { id: 'est', text: 'Ước lượng: 400 × 7 = 2 800' },
    ],
    answer: ['est', 'calc', 'ans'],
    wrongHints: [
      { match: ['calc', 'est', 'ans'], code: 'QUY', why: 'Ước lượng đi TRƯỚC để sau này con kiểm tra kết quả có hợp lí không.' },
      { match: ['est', 'ans', 'calc'], code: 'QUY', why: 'Phải tính xong rồi mới kết luận được. Kết luận luôn đứng cuối cùng.' },
    ],
    hint: 'Bước nào giúp kiểm tra kết quả sau cùng?',
    explain: {
      steps: [
        { text: 'Bước 1 – Ước lượng: làm tròn 368 thành 400, rồi 400 × 7 = 2 800.', visual: wordTable([['Ước lượng', '400 × 7 = 2 800'], ['Phép tính', '…'], ['Kết luận', '…']]) },
        { text: 'Bước 2 – Phép tính: mỗi ngày bằng nhau nên NHÂN. 368 × 7 = 2 576.', visual: mulTable(368, 7, 3) },
        { text: 'Bước 3 – Kết luận có đơn vị: 7 ngày thu 2 576 kg cà chua. Số này gần 2 800 nên hợp lí.', mark: 'good', visual: wordTable([['Ước lượng', '400 × 7 = 2 800'], ['Phép tính', '368 × 7 = 2 576'], ['Kết luận', '7 ngày thu 2 576 kg cà chua']]) },
      ],
    },
    tags: ['lời văn', 'ước lượng – tính – kết luận'],
  },
  {
    id: '8.6', src: 'T6 tr.2 C8', type: 'choice',
    prompt: 'Một nông trại mỗi ngày thu 368 kg cà chua. 7 ngày thu bao nhiêu kg? Chọn câu kết luận ĐẦY ĐỦ (có đơn vị).',
    choices: [
      { id: 'a', text: '7 ngày thu 2 576 kg', correct: true },
      { id: 'b', text: '7 ngày thu 375 kg', code: 'NGƯỢC', why: 'Mỗi ngày thu số kg bằng nhau, 7 ngày thì NHÂN, không phải cộng 368 + 7.' },
      { id: 'c', text: '7 ngày thu 2 526 kg', code: 'NHỚ', why: '8 × 7 = 56, viết 6 nhớ 5. Hàng chục: 6 × 7 = 42, thêm nhớ 5 là 47. Số nhớ phải cộng vào hàng chục.' },
      { id: 'd', text: '7 ngày thu 2 576', code: 'ĐV', why: 'Số đúng rồi, nhưng kết luận cần có đơn vị: 2 576 kg.' },
    ],
    hint: 'Mỗi ngày bằng nhau thì dùng phép nhân. Đừng quên đơn vị.',
    explain: {
      steps: [
        { text: 'Mỗi ngày thu 368 kg, thu 7 ngày: dùng phép nhân 368 × 7.', visual: wordTable([['Mỗi ngày', 'thu 368 kg cà chua'], ['7 ngày', '368 × 7 = ?']]) },
        { text: '368 × 7 = 2 576. Ước lượng 400 × 7 = 2 800 gần số này.', visual: mulTable(368, 7, 3) },
        { text: 'Kết luận phải có đơn vị: 7 ngày thu 2 576 kg. Vậy đáp án là "7 ngày thu 2 576 kg".', mark: 'good' },
      ],
    },
    tags: ['lời văn', 'đơn vị'],
  },
];

const variant = {
  id: '8.7', src: '[biến thể mới]', type: 'choice',
  prompt: 'Một cái máy nhân mọi số với 7. Máy trả ra số 924. Số đã cho vào máy là số nào?',
  visual: { kind: 'sequence', items: ['?', '924'], arrowLabels: ['× 7'] },
  hint: 'Muốn tìm số ban đầu thì làm phép tính ngược.',
  choices: [
    { id: 'a', text: '132', correct: true },
    { id: 'b', text: '6 468', code: 'NGƯỢC', why: 'Có thể con đã nhân thêm 7 lần nữa. Đi ngược lại của × 7 thì phải CHIA cho 7.' },
    { id: 'c', text: '917', code: 'NGƯỢC', why: 'Đi ngược của × 7 là ÷ 7, không phải − 7.' },
    { id: 'd', text: '931', code: 'NGƯỢC', why: 'Đi ngược của × 7 là ÷ 7, không phải + 7.' },
  ],
  explain: {
    steps: [
      { text: 'Máy nhân 7 ra 924. Muốn tìm số ban đầu, mình đi ngược lại: chia 924 cho 7.', visual: { kind: 'sequence', items: ['?', '924'], arrowLabels: ['× 7'] } },
      { text: '924 ÷ 7 = 132.', visual: { kind: 'sequence', items: ['924', '132'], arrowLabels: ['÷ 7'], highlight: [1] } },
      { text: 'Thử lại: 132 × 7 = 924. Vậy đáp án là 132.', mark: 'good' },
    ],
  },
  tags: ['phép ngược', 'biến thể'],
};

/* ---------- bộ sinh ---------- */
function genMul(rng, digits3 = true) {
  for (let tries = 0; tries < 200; tries++) {
    const a = digits3 ? int(rng, 112, 698) : int(rng, 23, 98);
    const b = int(rng, 3, 9);
    if (a % 10 === 0) continue;
    const m = mulCalc(a, b);
    if (m.carries.slice(0, m.n - 1).some((c) => c > 0)) return { a, b };
  }
  return { a: 614, b: 8 };
}

const CONTEXTS = [
  { q: (a, b) => `Một nông trại mỗi ngày thu ${fmt(a)} kg cà chua. Hỏi ${b} ngày thu được bao nhiêu kg cà chua?`, unit: 'kg', concl: (b, p) => `${b} ngày thu ${fmt(p)} kg cà chua` },
  { q: (a, b) => `Mỗi thùng có ${fmt(a)} quả cam. Hỏi ${b} thùng như vậy có bao nhiêu quả cam?`, unit: 'quả', concl: (b, p) => `${b} thùng có ${fmt(p)} quả cam` },
  { q: (a, b) => `Mỗi giá sách có ${fmt(a)} cuốn sách. Hỏi ${b} giá sách như vậy có bao nhiêu cuốn sách?`, unit: 'cuốn', concl: (b, p) => `${b} giá sách có ${fmt(p)} cuốn sách` },
  { q: (a, b) => `Mỗi chuyến xe chở ${fmt(a)} kg gạo. Hỏi ${b} chuyến xe chở được bao nhiêu kg gạo?`, unit: 'kg', concl: (b, p) => `${b} chuyến xe chở ${fmt(p)} kg gạo` },
  { q: (a, b) => `Mỗi lớp trồng ${fmt(a)} cây. Hỏi ${b} lớp như vậy trồng được bao nhiêu cây?`, unit: 'cây', concl: (b, p) => `${b} lớp trồng ${fmt(p)} cây` },
];

const generators = [
  {
    id: 'g8.1', // tích có nhớ: chọn đáp án
    make(rng) {
      const { a, b } = genMul(rng, rng.next() < 0.7);
      const m = mulCalc(a, b), n = m.n, prod = a * b;
      const pool = [];
      for (let i = 1; i < n; i++) {
        const c = m.carries[i - 1];
        if (c > 0) pool.push({ text: fmt(mulSim(a, b, { i, forget: true })), code: 'NHỚ', why: `Ở hàng ${HN[i]}, có thể con đã quên cộng số nhớ ${c} từ hàng ${HN[i - 1]}.` });
      }
      for (let i = 1; i < n; i++) {
        const c = m.carries[i - 1];
        pool.push({ text: fmt(mulSim(a, b, { i, delta: 1 })), code: 'NHỚ', why: `Số nhớ từ hàng ${HN[i - 1]} là ${c}, không phải ${c + 1}.` });
        if (c > 0) pool.push({ text: fmt(mulSim(a, b, { i, delta: -1 })), code: 'NHỚ', why: `Số nhớ từ hàng ${HN[i - 1]} là ${c}, không phải ${c - 1}.` });
      }
      pool.push({ text: fmt(est(a) * b), code: 'QUY', why: `${fmt(est(a) * b)} mới là kết quả ước lượng (làm tròn ${fmt(a)} thành ${fmt(est(a))}). Cần tính đúng ${fmt(a)} × ${b}.` });
      pool.push({ text: fmt(prod + 100), code: 'NHỚ', why: 'Con thử đặt tính nhân dọc lại, nhớ cộng số nhớ vào hàng bên cạnh.' });
      const wr = distinct(pool, fmt(prod), 3);
      return {
        id: 'g8.1', src: '[biến thể mới]', type: 'choice',
        prompt: `Tích của ${fmt(a)} và ${b} là:`,
        visual: mulTable(a, b, 0),
        choices: buildChoices(rng, fmt(prod), wr),
        hint: 'Nhân từng hàng từ phải sang trái, nhớ cộng số nhớ.',
        explain: { steps: mulSteps(a, b) },
        meta: { a, b },
      };
    },
    solve(item) { const { a, b } = item.meta; return fmt(a * b); },
  },
  {
    id: 'g8.2', // lời văn: ước lượng + tính
    make(rng) {
      const ci = int(rng, 0, CONTEXTS.length - 1);
      const ctx = CONTEXTS[ci];
      const { a, b } = genMul(rng, true);
      const prod = a * b, e = est(a) * b;
      return {
        id: 'g8.2', src: '[biến thể mới]', type: 'numpad',
        prompt: `${ctx.q(a, b)}\nBấm số cho hai bước: ước lượng (làm tròn ${fmt(a)} đến hàng trăm) và phép tính.`,
        slots: [
          { label: `Ước lượng ${fmt(est(a))} × ${b} =`, answer: String(e), len: String(e).length },
          { label: `Phép tính ${fmt(a)} × ${b} =`, answer: String(prod), len: String(prod).length, unit: ctx.unit },
        ],
        hint: 'Mỗi nhóm bằng nhau thì dùng phép nhân. Ước lượng trước, tính sau.',
        explain: {
          steps: [
            { text: `Ước lượng: làm tròn ${fmt(a)} đến hàng trăm thành ${fmt(est(a))}. ${fmt(est(a))} × ${b} = ${fmt(e)}.`, visual: wordTable([['Ước lượng', `${fmt(est(a))} × ${b} = ${fmt(e)}`], ['Phép tính', '…'], ['Kết luận', '…']]) },
            { text: `Phép tính: các nhóm bằng nhau nên NHÂN. Tách ${fmt(a)} theo hàng, nhân từng phần rồi cộng.`, visual: splitTable(a, b, false) },
            { text: `${fmt(a)} × ${b} = ${fmt(prod)}. Kết quả gần ước lượng ${fmt(e)}, rất hợp lí.`, visual: mulTable(a, b, mulCalc(a, b).n) },
            { text: `Kết luận (có đơn vị): ${ctx.concl(b, prod)}.`, mark: 'good', visual: wordTable([['Ước lượng', `${fmt(est(a))} × ${b} = ${fmt(e)}`], ['Phép tính', `${fmt(a)} × ${b} = ${fmt(prod)}`], ['Kết luận', ctx.concl(b, prod)]]) },
          ],
        },
        meta: { a, b },
      };
    },
    solve(item) {
      const { a, b } = item.meta;
      const u = 100;
      return `${Math.round(a / u) * u * b}|${a * b}`;
    },
  },
  {
    id: 'g8.3', // phép ngược
    make(rng) {
      const form = pick(rng, ['nghi', 'may']);
      const b = int(rng, 3, 9);
      const x = int(rng, 52, 480);
      const P = x * b;
      let prompt, visual, wrongs, steps;
      if (form === 'nghi') {
        prompt = `Minh nghĩ một số, chia số đó cho ${b} được ${fmt(x)}. Số Minh nghĩ là số nào?`;
        visual = { kind: 'sequence', items: ['?', fmt(x)], arrowLabels: [`÷ ${b}`] };
        wrongs = [
          { v: x + b, code: 'NGƯỢC', why: `Số cần tìm là số bị chia. Muốn tìm số bị chia thì lấy thương NHÂN số chia, không phải cộng.` },
          { v: x, code: 'ĐỌC', why: `${fmt(x)} là thương (kết quả sau khi chia), chưa phải số Minh nghĩ.` },
          { v: x - b, code: 'NGƯỢC', why: 'Muốn tìm số bị chia thì lấy thương NHÂN số chia, không phải trừ.' },
          { v: P + 10, code: 'NHỚ', why: `Con nhân đúng hướng rồi, nhưng kết quả còn lệch. Thử lại ${fmt(x)} × ${b} bằng cách nhân dọc.` },
        ];
        steps = [
          { text: `Minh chia số đó cho ${b} được ${fmt(x)}. Muốn tìm số bị chia, mình lấy thương nhân với số chia.`, visual },
          { text: `${fmt(x)} × ${b} = ${fmt(P)}.`, visual: mulTable(x, b, mulCalc(x, b).n) },
          { text: `Thử lại: ${fmt(P)} ÷ ${b} = ${fmt(x)}. Vậy số Minh nghĩ là ${fmt(P)}.`, mark: 'good' },
        ];
        return {
          id: 'g8.3', src: '[biến thể mới]', type: 'choice', prompt, visual,
          choices: buildChoices(rng, fmt(P), distinct(wrongs.map((w) => ({ text: fmt(w.v), code: w.code, why: w.why })), fmt(P), 3)),
          hint: 'Phép ngược của phép chia là phép nhân.',
          explain: { steps }, meta: { form, b, x },
        };
      }
      prompt = `Một cái máy nhân mọi số với ${b}. Máy trả ra số ${fmt(P)}. Số đã cho vào máy là số nào?`;
      visual = { kind: 'sequence', items: ['?', fmt(P)], arrowLabels: [`× ${b}`] };
      wrongs = [
        { v: P * b, code: 'NGƯỢC', why: `Có thể con đã nhân thêm ${b} lần nữa. Đi ngược lại của × ${b} thì phải CHIA cho ${b}.` },
        { v: P - b, code: 'NGƯỢC', why: `Đi ngược của × ${b} là ÷ ${b}, không phải − ${b}.` },
        { v: P + b, code: 'NGƯỢC', why: `Đi ngược của × ${b} là ÷ ${b}, không phải + ${b}.` },
        { v: x + 10, code: 'NHỚ', why: `Thử lại bằng phép nhân: ${fmt(x + 10)} × ${b} có bằng ${fmt(P)} không?` },
      ];
      steps = [
        { text: `Máy nhân ${b} ra ${fmt(P)}. Muốn tìm số ban đầu, mình đi ngược lại: chia ${fmt(P)} cho ${b}.`, visual },
        { text: `${fmt(P)} ÷ ${b} = ${fmt(x)}.`, visual: { kind: 'sequence', items: [fmt(P), fmt(x)], arrowLabels: [`÷ ${b}`], highlight: [1] } },
        { text: `Thử lại: ${fmt(x)} × ${b} = ${fmt(P)}. Vậy đáp án là ${fmt(x)}.`, mark: 'good' },
      ];
      return {
        id: 'g8.3', src: '[biến thể mới]', type: 'choice', prompt, visual,
        choices: buildChoices(rng, fmt(x), distinct(wrongs.map((w) => ({ text: fmt(w.v), code: w.code, why: w.why })), fmt(x), 3)),
        hint: 'Muốn đi ngược của phép nhân thì dùng phép chia.',
        explain: { steps }, meta: { form, b, x },
      };
    },
    solve(item) {
      const { form, b, x } = item.meta;
      // dữ kiện: 'nghi' có thương x, số chia b -> đáp án x*b ; 'may' có tích x*b -> đáp án tích/b
      if (form === 'nghi') return fmt(x * b);
      return fmt((x * b) / b);
    },
  },
  {
    id: 'g8.4', // nhiều đáp án: tích bằng T
    make(rng) {
      const t = pick(rng, [12, 16, 18, 24, 32, 36, 48]);
      const T = t * 100;
      const ds = [2, 3, 4, 6, 8, 9].filter((d) => T % d === 0);
      const sd = shuffle(rng, ds);
      const good = [[T / sd[0], sd[0]], [T / sd[1], sd[1]], [t, 100]];
      const txt = (x, y) => `${fmt(x)} × ${fmt(y)}`;
      const goodTexts = good.map(([x, y]) => txt(x, y));
      const cand = [];
      for (const d of sd) {
        cand.push({ x: T / d, y: d + 1, code: 'QUY' });
        cand.push({ x: T / d + 100, y: d, code: 'QUY' });
        if (d - 1 >= 2) cand.push({ x: T / d, y: d - 1, code: 'QUY' });
      }
      const seenT = new Set(goodTexts), seenTxt = new Set(), pickBad = [];
      const bads = [{ x: t, y: 1000, code: 'HÀNG' }];
      seenTxt.add(txt(t, 1000));
      for (const w of shuffle(rng, cand)) {
        const k = txt(w.x, w.y);
        if (seenT.has(k) || seenTxt.has(k) || w.x * w.y === T) continue;
        seenTxt.add(k); bads.push(w);
        if (bads.length === 3) break;
      }
      const all = shuffle(rng, [...good.map(([x, y]) => ({ x, y, ok: true })), ...bads.map((w) => ({ ...w, ok: false }))]);
      return {
        id: 'g8.4', src: '[biến thể mới]', type: 'multi',
        prompt: `Chọn tất cả phép nhân có tích bằng ${fmt(T)}.`,
        choices: all.map((c, i) => c.ok
          ? { id: IDS[i], text: txt(c.x, c.y), correct: true }
          : { id: IDS[i], text: txt(c.x, c.y), code: c.code, why: c.code === 'HÀNG' ? `${txt(c.x, c.y)} = ${fmt(c.x * c.y)}. Thừa một chữ số 0, nhân 100 mới ra ${fmt(T)}.` : `${txt(c.x, c.y)} = ${fmt(c.x * c.y)}, không phải ${fmt(T)}.` }),
        hint: 'Tính tích của từng phép, đừng dừng ở phép đầu tiên tìm được.',
        explain: {
          steps: [
            { text: `Tính từng phép nhân, nhớ thêm các chữ số 0 ở cuối.`, visual: wordTable(all.map((c) => [txt(c.x, c.y), `= ${fmt(c.x * c.y)}`])) },
            { text: `Các phép bằng ${fmt(T)}: ${good.map(([x, y]) => txt(x, y)).join('; ')}.`, mark: 'good' },
            { text: `Các phép còn lại cho tích khác ${fmt(T)} nên không chọn.`, mark: 'bad' },
          ],
        },
        meta: { T, exprs: all.map((c) => ({ x: c.x, y: c.y })) },
      };
    },
    solve(item) {
      const { T, exprs } = item.meta;
      return exprs.filter((e) => e.x * e.y === T).map((e) => `${fmt(e.x)} × ${fmt(e.y)}`).sort().join(',');
    },
  },
  {
    id: 'g8.5', // lập bảng theo hàng
    make(rng) {
      let a, b;
      do { a = int(rng, 112, 698); b = int(rng, 2, 9); } while (Math.floor(a / 10) % 10 === 0 || a % 10 === 0);
      const h = Math.floor(a / 100), t = Math.floor(a / 10) % 10, u = a % 10;
      const p1 = h * 100 * b, p2 = t * 10 * b, p3 = u * b, tot = a * b;
      const right = `● = ${fmt(p2)}; tổng = ${fmt(tot)}`;
      const pool = [
        { text: `● = ${fmt(t * b)}; tổng = ${fmt(p1 + t * b + p3)}`, code: 'HÀNG', why: `${t}0 × ${b} = ${fmt(p2)}, không phải ${fmt(t * b)}. Chữ số ${t} ở hàng chục, giá trị là ${t * 10}.` },
        { text: `● = ${fmt(p2)}; tổng = ${fmt(p2 + p3)}`, code: 'QUY', why: `${fmt(p2 + p3)} mới là ${fmt(p2)} + ${fmt(p3)}. Tổng phải cộng cả ba ô: ${fmt(p1)} + ${fmt(p2)} + ${fmt(p3)}.` },
        { text: `● = ${fmt(p2)}; tổng = ${fmt(p1 + p2 + u)}`, code: 'QUY', why: `Ô cuối là ${u} × ${b} = ${fmt(p3)}, không phải ${u}. Chữ số ${u} cũng phải nhân với ${b}.` },
      ];
      return {
        id: 'g8.5', src: '[biến thể mới]', type: 'choice',
        prompt: `Lập bảng ${a} × ${b}: ${fmt(p1)} + ● + ${fmt(p3)} = ? Chọn số ở ● và kết quả phép nhân.`,
        visual: splitTable(a, b, true),
        choices: buildChoices(rng, right, distinct(pool, right, 3)),
        hint: `Ô ở giữa là hàng chục: ${t * 10} × ${b}.`,
        explain: {
          steps: [
            { text: `Tách ${a} = ${h * 100} + ${t * 10} + ${u}, rồi nhân từng phần với ${b}.`, visual: { kind: 'place', digits: String(a), showValue: true, highlight: [0, 1, 2], anim: 'fill' } },
            { text: `${h * 100} × ${b} = ${fmt(p1)}; ${t * 10} × ${b} = ${fmt(p2)}; ${u} × ${b} = ${fmt(p3)}. Vậy ● = ${fmt(p2)}.`, visual: splitTable(a, b, false) },
            { text: `Cộng lại: ${fmt(p1)} + ${fmt(p2)} + ${fmt(p3)} = ${fmt(tot)}. Vậy đáp án là ${right}.`, mark: 'good' },
          ],
        },
        meta: { a, b },
      };
    },
    solve(item) {
      const { a, b } = item.meta;
      const digs = String(a).split('').map(Number);
      const parts = digs.map((d, i) => d * 10 ** (digs.length - 1 - i) * b);
      return `● = ${fmt(parts[1])}; tổng = ${fmt(parts.reduce((x, y) => x + y, 0))}`;
    },
  },
];

export default {
  id: 'cd08', no: 8, day: 3, title: 'Nhân với số có 1 chữ số, bài toán có lời văn', short: 'Nhân & lời văn', icon: '✖️',
  intro: 'Nhân từng hàng rồi cộng, nhớ cộng số nhớ. Bài toán lời văn: Ước lượng, Phép tính, rồi Kết luận có đơn vị.',
  remember: [
    { text: 'Thuộc bảng nhân thì tính rất nhanh. Kết quả của phép nhân gọi là tích. Muốn tìm số bị chia (phép chia hết), lấy thương nhân với số chia.', visual: { kind: 'array', rows: 4, cols: 6, showEq: true, groupBy: 'rows', anim: 'fill' } },
    { text: 'Nhân từng hàng rồi cộng lại: 235 × 3 = 600 + 90 + 15 = 705. Hoặc nhân dọc và nhớ cộng số nhớ vào hàng sau.', visual: splitTable(235, 3, false) },
    { text: 'Bài lời văn: Ước lượng (làm tròn thừa số), Phép tính, rồi Kết luận có ĐƠN VỊ. Kết quả phải gần ước lượng.', visual: wordTable([['Ước lượng', '400 × 7 = 2 800'], ['Phép tính', '368 × 7 = 2 576'], ['Kết luận', '7 ngày thu 2 576 kg']]) },
  ],
  lesson: [
    { text: 'Phép nhân là cộng nhiều lần: 3 hàng, mỗi hàng 4 quả. 4 + 4 + 4 = 3 × 4 = 12. Kết quả của phép nhân gọi là TÍCH.', visual: { kind: 'array', rows: 3, cols: 4, emoji: '🍎', showEq: true, groupBy: 'rows', anim: 'fill' } },
    { text: 'Số lớn thì tách theo hàng: 235 = 200 + 30 + 5. Nhân từng phần với 3: 200 × 3 = 600, 30 × 3 = 90, 5 × 3 = 15.', visual: splitTable(235, 3, false) },
    { text: 'Cộng các kết quả lại: 600 + 90 + 15 = 705. Vậy 235 × 3 = 705.', visual: wordTable([['Trăm', '200 × 3 = 600'], ['Chục', '30 × 3 = 90'], ['Đơn vị', '5 × 3 = 15'], ['Cộng', '600 + 90 + 15 = 705']]) },
    { text: 'Có cách ngắn hơn là nhân dọc 368 × 7. Hàng đơn vị: 8 × 7 = 56, viết 6 nhớ 5.', visual: mulTable(368, 7, 1) },
    { text: 'Hàng chục: 6 × 7 = 42, thêm 5 là 47, viết 7 nhớ 4. Hàng trăm: 3 × 7 = 21, thêm 4 là 25. Vậy 368 × 7 = 2 576.', visual: mulTable(368, 7, 3) },
    { text: 'Bài lời văn: mỗi ngày thu 368 kg, 7 ngày thu bao nhiêu? Ước lượng, tính, rồi kết luận có đơn vị.', visual: wordTable([['Ước lượng', '400 × 7 = 2 800'], ['Phép tính', '368 × 7 = 2 576'], ['Kết luận', '7 ngày thu 2 576 kg cà chua']]) },
  ],
  items,
  variant,
  generators,
};
