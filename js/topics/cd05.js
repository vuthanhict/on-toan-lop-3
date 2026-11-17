// CĐ5 · Làm tròn số (đến hàng chục, trăm, nghìn, chục nghìn, trăm nghìn)
import { pick, int, shuffle, seeded } from '../core/rng.js';
import { estimateSteps } from '../core/paper.js';

/* ---------- tiện ích dùng riêng trong file ---------- */
const fmt = (n) => {
  const s = String(Math.abs(n));
  const t = s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s;
  return (n < 0 ? '−' : '') + t;
};
const HN = ['đơn vị', 'chục', 'trăm', 'nghìn', 'chục nghìn', 'trăm nghìn']; // theo số mũ của 10
const UP = '#F5893A', DOWN = '#8B6CF0', MID = '#34B27B', PINK = '#EC7468';
const IDS = ['a', 'b', 'c', 'd'];

// làm tròn đến 10^L theo quy tắc: chữ số cần xét >= 5 thì lên
const rnd = (n, L) => { const p = 10 ** L, r = n % p; return n - r + (r * 2 >= p ? p : 0); };
// chữ số ngay bên phải hàng cần làm tròn
const red = (n, L) => Math.floor(n / 10 ** (L - 1)) % 10;
// làm tròn nối tiếp (cách làm SAI): chục -> trăm -> ... -> hàng cần tròn
const succ = (n, L) => { let x = n; for (let k = 1; k <= L; k++) x = rnd(x, k); return x; };

const placeV = (n, hl, extra = {}) => ({ kind: 'place', digits: String(n), highlight: hl, groupThousands: true, anim: 'fill', ...extra });

// trục số đoạn [lo, hi] chứa n
function nlRound(n, L, extra = {}) {
  const p = 10 ** L, lo = n - (n % p), hi = lo + p, mid = lo + p / 2;
  const up = n % p >= p / 2;
  const points = [];
  if (n !== mid) points.push({ at: mid, label: 'giữa', color: MID });
  points.push({ at: n, label: n === mid ? fmt(n) + ' (giữa)' : fmt(n), color: PINK });
  return {
    kind: 'numberline', min: lo, max: hi, step: p / 10, labelEvery: p,
    points,
    range: up ? { from: mid, to: hi, color: UP } : { from: lo, to: mid, color: DOWN },
    marker: { at: n, emoji: '🐸' },
    ...extra,
  };
}

function buildChoices(rng, right, wrongs) {
  const all = shuffle(rng, [{ text: right, correct: true }, ...wrongs.map((w) => ({ text: w.text, code: w.code, why: w.why }))]);
  return all.map((c, i) => ({ id: IDS[i], ...c }));
}

// các đáp án nhiễu "có thật" khi làm tròn n đến hàng 10^L
function roundWrongs(n, L) {
  const right = rnd(n, L), p = 10 ** L, down = n - (n % p), up = down + p, d = red(n, L);
  const pool = [];
  const s = succ(n, L);
  if (s !== right) pool.push({ v: s, code: 'NỐI-TIẾP', why: `Có thể con đã làm tròn lần lượt từng hàng. Con chỉ cần nhìn MỘT chữ số cần xét: ${d}, ngay bên phải hàng ${HN[L]}.` });
  const opp = right === up ? down : up;
  pool.push({ v: opp, code: 'QUY', why: d >= 5 ? `Chữ số cần xét là ${d}, từ 5 trở lên nên phải làm tròn LÊN.` : `Chữ số cần xét là ${d}, từ 4 trở xuống nên giữ nguyên hàng đó (làm tròn xuống).` });
  for (const L2 of [L - 1, L + 1, L - 2, L + 2]) {
    if (L2 < 1 || L2 > 5) continue;
    pool.push({ v: rnd(n, L2), code: 'HÀNG', why: `${fmt(rnd(n, L2))} là làm tròn đến hàng ${HN[L2]}. Đề hỏi hàng ${HN[L]}.` });
  }
  for (const k of [1, -1, 2, -2]) {
    pool.push({ v: right + k * p, code: 'QUY', why: `Số này lệch ${Math.abs(k)} ${HN[L]} so với kết quả đúng. Con hãy xem lại chữ số cần xét ${d}.` });
  }
  const seen = new Set([right]);
  const out = [];
  for (const w of pool) {
    if (w.v <= 0 || seen.has(w.v)) continue;
    seen.add(w.v); out.push(w);
  }
  return out;
}

// sinh số cần làm tròn
function genRound(rng, fixL) {
  const L = fixL ?? int(rng, 1, 5);
  const digits = Math.max(3, Math.min(6, L + 1 + int(rng, 0, 1)));
  const ds = [];
  for (let i = 0; i < digits; i++) ds.push(int(rng, 0, 9));
  ds[0] = int(rng, 1, digits === 6 ? 8 : 9);
  if (L >= 2 && rng.next() < 0.4) { ds[digits - L] = 4; ds[digits - L + 1] = int(rng, 5, 9); }
  let n = Number(ds.join(''));
  if (n % 10 ** L === 0) n += 1;
  return { n, L };
}

function roundSteps(n, L) {
  const right = rnd(n, L), d = red(n, L), isUp = d >= 5;
  const steps = [
    { text: `Làm tròn đến hàng ${HN[L]}: nhìn chữ số ngay bên phải hàng ${HN[L]}. Trong ${fmt(n)}, chữ số cần xét là ${d}, ở hàng ${HN[L - 1]} (chữ số được tô màu).`, visual: placeV(n, [L - 1]) },
    {
      text: isUp
        ? `${d} là từ 5 trở lên nên làm tròn LÊN: hàng ${HN[L]} tăng thêm 1, các chữ số bên phải thành 0.`
        : `${d} là từ 4 trở xuống nên GIỮ hàng ${HN[L]}, các chữ số bên phải thành 0.`,
      visual: nlRound(n, L),
    },
  ];
  if (succ(n, L) !== right) {
    steps.push({ text: `Chỉ nhìn MỘT chữ số cần xét thôi nhé. Làm tròn từng hàng một thì ra ${fmt(succ(n, L))}, là sai.`, mark: 'bad', visual: placeV(n, [L - 1]) });
  }
  steps.push({ text: `Vậy ${fmt(n)} làm tròn đến hàng ${HN[L]} là ${fmt(right)}.`, mark: 'good', visual: nlRound(n, L, { anim: 'hop', jumps: [{ from: n, to: right, label: isUp ? 'lên' : 'xuống' }] }) });
  return steps;
}

/* ---------- bài cố định ---------- */
const items = [
  {
    id: '5.1', src: 'LT p1', type: 'classify',
    prompt: 'Làm tròn đến hàng chục. Chạm một số, rồi chạm ô: số đó làm tròn thành 230 hay 240?',
    visual: { kind: 'numberline', min: 230, max: 240, step: 1, labelEvery: 5, points: [{ at: 231 }, { at: 234 }, { at: 235, label: 'giữa', color: MID }, { at: 238 }] },
    chips: [{ id: 'c231', text: '231' }, { id: 'c234', text: '234' }, { id: 'c235', text: '235' }, { id: 'c238', text: '238' }],
    buckets: [{ id: 'xuong', text: '230 (xuống)' }, { id: 'len', text: '240 (lên)' }],
    answer: { c231: 'xuong', c234: 'xuong', c235: 'len', c238: 'len' },
    hint: 'Nhìn chữ số hàng đơn vị: từ 5 trở lên thì lên.',
    explain: {
      steps: [
        { text: 'Làm tròn đến hàng chục thì nhìn chữ số hàng đơn vị (chữ số cần xét).', visual: placeV(235, [0]) },
        { text: '231 và 234 có chữ số cần xét là 1 và 4. Từ 4 trở xuống thì giữ, thành 230.', visual: { kind: 'numberline', min: 230, max: 240, step: 1, labelEvery: 5, points: [{ at: 231 }, { at: 234 }], range: { from: 230, to: 235, color: DOWN } } },
        { text: '235 và 238 có chữ số cần xét là 5 và 8. Từ 5 trở lên thì lên, thành 240. Số 235 nằm đúng giữa, cũng làm tròn lên.', visual: { kind: 'numberline', min: 230, max: 240, step: 1, labelEvery: 5, points: [{ at: 235, label: 'giữa', color: MID }, { at: 238 }], range: { from: 235, to: 240, color: UP } } },
        { text: 'Vậy 231, 234 thành 230; còn 235, 238 thành 240.', mark: 'good' },
      ],
    },
    tags: ['làm tròn', 'chục'],
  },
  {
    id: '5.2', src: 'S4 Q18', type: 'match',
    prompt: 'Làm tròn số 67 486. Nối mỗi hàng với kết quả đúng.',
    visual: placeV(67486, []),
    left: [
      { id: 'chuc', text: 'Đến hàng chục' },
      { id: 'tram', text: 'Đến hàng trăm' },
      { id: 'nghin', text: 'Đến hàng nghìn' },
      { id: 'chucnghin', text: 'Đến hàng chục nghìn' },
    ],
    right: [
      { id: 'r1', text: '67 490' }, { id: 'r2', text: '67 500' }, { id: 'r3', text: '67 000' },
      { id: 'r4', text: '70 000' }, { id: 'r5', text: '67 480' }, { id: 'r6', text: '68 000' },
    ],
    pairs: { chuc: 'r1', tram: 'r2', nghin: 'r3', chucnghin: 'r4' },
    hint: 'Mỗi hàng chỉ nhìn MỘT chữ số: chữ số ngay bên phải hàng đó.',
    explain: {
      steps: [
        { text: 'Hàng chục: chữ số cần xét là 6 (hàng đơn vị). 6 là từ 5 trở lên nên lên: 67 490.', visual: placeV(67486, [0]) },
        { text: 'Hàng trăm: chữ số cần xét là 8 (hàng chục), lên: 67 500.', visual: placeV(67486, [1]) },
        { text: 'Hàng nghìn: chữ số cần xét là 4 (hàng trăm), giữ: 67 000. Không làm tròn tiếp từ 67 490 hay 67 500 nhé!', mark: 'bad', visual: placeV(67486, [2]) },
        { text: 'Hàng chục nghìn: chữ số cần xét là 7 (hàng nghìn), lên: 70 000. Vậy các kết quả là 67 490, 67 500, 67 000, 70 000.', mark: 'good', visual: placeV(67486, [3]) },
      ],
    },
    tags: ['làm tròn', 'nhiều hàng'],
  },
  {
    id: '5.3', src: 'S1-C25', type: 'choice',
    prompt: 'Làm tròn 298 764 đến hàng chục nghìn. Kết quả là:',
    visual: placeV(298764, [3]),
    choices: [
      { id: 'a', text: '300 000', correct: true },
      { id: 'b', text: '290 000', code: 'QUY', why: 'Chữ số hàng nghìn là 8, từ 5 trở lên nên phải LÊN: 29 chục nghìn thành 30 chục nghìn.' },
      { id: 'c', text: '299 000', code: 'HÀNG', why: '299 000 là làm tròn đến hàng nghìn, chưa phải hàng chục nghìn.' },
      { id: 'd', text: '298 800', code: 'HÀNG', why: '298 800 là làm tròn đến hàng trăm, không phải hàng chục nghìn.' },
    ],
    hint: 'Hàng chục nghìn là chữ số 9. Hãy nhìn chữ số ngay bên phải nó.',
    explain: {
      steps: [
        { text: 'Hàng chục nghìn của 298 764 là chữ số 9. Chữ số cần xét là chữ số ngay bên phải: hàng nghìn, bằng 8.', visual: placeV(298764, [3]) },
        { text: '8 là từ 5 trở lên nên làm tròn LÊN: 29 chục nghìn thành 30 chục nghìn.', visual: nlRound(298764, 4) },
        { text: 'Các chữ số bên phải thành 0. Vậy đáp án là 300 000.', mark: 'good' },
      ],
    },
    tags: ['làm tròn', 'chục nghìn'],
  },
  {
    id: '5.4', src: 'T9 tr.1 C3', type: 'numpad',
    prompt: 'Làm tròn 620 195 đến hàng trăm. Bấm kết quả.',
    visual: placeV(620195, [1]),
    slots: [{ answer: '620200', len: 6 }],
    wrongHints: [
      { match: '620100', code: 'QUY', why: 'Chữ số cần xét là 9 (hàng chục): từ 5 trở lên thì LÊN, 1 trăm thành 2 trăm.' },
      { match: '620000', code: 'HÀNG', why: 'Có thể con đã đổi hai chữ số cuối thành 0 mà chưa xem chữ số cần xét là 9 để biết lên hay giữ.' },
      { match: '620190', code: 'HÀNG', why: 'Số tròn trăm phải có hai chữ số 0 ở cuối. 620 190 chưa phải số tròn trăm.' },
    ],
    hint: 'Hàng trăm là chữ số 1. Chữ số cần xét là chữ số hàng chục.',
    explain: {
      steps: [
        { text: 'Hàng trăm của 620 195 là chữ số 1. Chữ số cần xét là chữ số hàng chục: 9.', visual: placeV(620195, [1]) },
        { text: '9 là từ 5 trở lên nên lên: 1 trăm thành 2 trăm, hai chữ số cuối thành 0.', visual: nlRound(620195, 2) },
        { text: 'Vậy đáp án là 620 200.', mark: 'good' },
      ],
    },
    tags: ['làm tròn', 'trăm'],
  },
  {
    id: '5.5', src: 'T9 tr.1 C3', type: 'tf',
    prompt: 'Bo làm tròn số như trong hình. Bo nói đúng hay sai?',
    say: 'Bo nói: làm tròn 245480 đến hàng chục nghìn được 240000. Bo nói đúng hay sai?',
    visual: { kind: 'bubble', who: 'Bo', emoji: '🧒', text: '245 480 làm tròn đến hàng chục nghìn là 240 000.' },
    answer: false,
    reasons: [
      { text: 'Chữ số hàng nghìn là 5, nên phải lên: 250 000.', correct: true },
      { text: 'Chữ số hàng trăm là 4, nên giữ: 240 000.', correct: false, code: 'HÀNG', why: 'Hàng trăm không phải chữ số cần xét. Đến hàng chục nghìn thì nhìn hàng NGHÌN.' },
      { text: 'Số tròn chục nghìn gần nhất là 245 000.', correct: false, code: 'HÀNG', why: '245 000 là tròn nghìn, chưa phải tròn chục nghìn. Tròn chục nghìn có 4 chữ số 0 ở cuối.' },
    ],
    whyWrong: 'Con thử lại nhé: chữ số cần xét là chữ số hàng nghìn, bằng 5, nên phải làm tròn lên 250 000.',
    hint: 'Làm tròn đến hàng chục nghìn thì phải nhìn chữ số ở hàng nào?',
    explain: {
      steps: [
        { text: 'Chữ số hàng chục nghìn của 245 480 là 4. Chữ số cần xét là chữ số hàng nghìn: 5.', visual: placeV(245480, [3]) },
        { text: '5 là từ 5 trở lên nên lên: 24 chục nghìn thành 25 chục nghìn.', visual: nlRound(245480, 4) },
        { text: 'Kết quả đúng là 250 000, không phải 240 000. Vậy Bo nói SAI.', mark: 'good' },
      ],
    },
    tags: ['làm tròn', 'Đ/S'],
  },
  {
    id: '5.6', src: 'LT p2', type: 'choice',
    prompt: 'Làm tròn 7 349 đến hàng trăm. Kết quả là:',
    visual: { kind: 'numberline', min: 7300, max: 7400, step: 10, labelEvery: 50, points: [{ at: 7349, label: '7 349', color: PINK }], marker: { at: 7349, emoji: '🐸' } },
    choices: [
      { id: 'a', text: '7 300', correct: true },
      { id: 'b', text: '7 400', code: 'NỐI-TIẾP', why: 'Chữ số cần xét là 4 (hàng chục). Chữ số 9 ở hàng đơn vị không cần xét nữa.' },
      { id: 'c', text: '7 350', code: 'HÀNG', why: '7 350 là làm tròn đến hàng chục. Đề hỏi hàng trăm.' },
      { id: 'd', text: '7 000', code: 'HÀNG', why: '7 000 là làm tròn đến hàng nghìn. Đề hỏi hàng trăm.' },
    ],
    hint: 'Hàng trăm là chữ số 3. Chỉ nhìn chữ số ngay bên phải nó.',
    explain: {
      steps: [
        { text: 'Hàng trăm của 7 349 là chữ số 3. Chữ số cần xét là chữ số hàng chục: 4.', visual: placeV(7349, [1]) },
        { text: '4 là từ 4 trở xuống nên giữ. 7 349 nằm gần 7 300 hơn 7 400 (dưới điểm giữa 7 350).', visual: nlRound(7349, 2) },
        { text: 'Chỉ nhìn chữ số 4 ở hàng chục, chữ số 9 không cần xét. Làm tròn từng bước 7 349 → 7 350 → 7 400 là sai.', mark: 'bad', visual: { kind: 'sequence', items: ['7 349', '7 350', '7 400'], arrowLabels: ['làm tròn tiếp', 'làm tròn tiếp'], highlight: [2] } },
        { text: 'Vậy đáp án là 7 300.', mark: 'good' },
      ],
    },
    tags: ['làm tròn', 'trăm', 'nối tiếp'],
  },
];

const variant = {
  id: '5.7', src: '[biến thể mới]', type: 'choice',
  prompt: 'Làm tròn đến hàng nghìn lần lượt hai số 4 499 và 4 500. Kết quả của hai số là:',
  choices: [
    { id: 'a', text: '4 000 và 5 000', correct: true },
    { id: 'b', text: 'Cùng là 4 000', code: 'QUY', why: '4 500 có chữ số hàng trăm là 5, nên phải lên 5 000.' },
    { id: 'c', text: 'Cùng là 5 000', code: 'QUY', why: '4 499 có chữ số hàng trăm là 4, nên giữ 4 000.' },
    { id: 'd', text: '5 000 và 4 000', code: 'ĐỌC', why: 'Có thể con đã đọc ngược thứ tự. Số đầu là 4 499, số sau là 4 500.' },
  ],
  hint: 'Với mỗi số, nhìn chữ số ngay bên phải hàng nghìn.',
  explain: {
    steps: [
      { text: 'Đến hàng nghìn thì nhìn chữ số hàng trăm (chữ số cần xét).', visual: placeV(4499, [2]) },
      { text: '4 499: chữ số cần xét là 4, giữ, được 4 000. 4 500: chữ số cần xét là 5, lên, được 5 000.', visual: { kind: 'numberline', min: 4000, max: 5000, step: 100, labelEvery: 500, points: [{ at: 4499, label: '4 499', color: DOWN }, { at: 4500, label: '4 500', color: UP }] } },
      { text: 'Hai số chỉ hơn kém nhau 1 mà kết quả khác nhau. Vậy đáp án là 4 000 và 5 000.', mark: 'good' },
    ],
  },
  tags: ['làm tròn', 'biên'],
};

/* ---------- bộ sinh ---------- */
const NAMES = ['Bo', 'Mai', 'Nam', 'Lan', 'Hùng', 'Chi', 'Minh', 'An', 'Hoa', 'Tú', 'Linh', 'Khoa', 'Vy', 'Phúc'];
// câu dẫn có ngữ cảnh thật (đôi khi bỏ trống để đề thuần số)
const SCENES = [
  (n) => `Một nhà sách bán được ${fmt(n)} quyển vở.`,
  (n) => `Công viên đón ${fmt(n)} lượt khách trong năm.`,
  (n) => `Trong kho có ${fmt(n)} viên gạch.`,
  (n) => `Trang trại thu được ${fmt(n)} quả trứng.`,
  (n) => `Thư viện trường có ${fmt(n)} cuốn sách.`,
  (n) => `Nhà máy làm ra ${fmt(n)} chiếc áo.`,
  (n) => `Cánh rừng có ${fmt(n)} cây.`,
  (n) => `Bác nông dân thu được ${fmt(n)} kg lúa.`,
  (n) => `Sân vận động có ${fmt(n)} chỗ ngồi.`,
];
const lead = (rng, n) => (rng.next() < 0.5 ? pick(rng, SCENES)(n) + ' ' : '');
const digitAt = (n, k) => Math.floor(n / 10 ** k) % 10;
// chọn k đáp án nhiễu từ pool {v,...}: số đáp án nhỏ hơn đáp án đúng được rút ngẫu nhiên (đáp án đúng không luôn nhỏ nhất/lớn nhất/giữa)
function pickBalanced(rng, right, pool, k = 3) {
  const lo = pool.filter((w) => w.v < right), hi = pool.filter((w) => w.v > right);
  const feas = []; for (let b = 0; b <= k; b++) if (b <= lo.length && k - b <= hi.length) feas.push(b);
  if (!feas.length) return pool.slice(0, k);
  const b = pick(rng, feas);
  return shuffle(rng, [...lo.slice(0, b), ...hi.slice(0, k - b)]);
}
const rulePhrase = (d) => (d >= 5 ? 'từ 5 trở lên nên lên' : 'từ 4 trở xuống nên giữ');
const pairStr = (obj) => Object.keys(obj).sort().map((k) => `${k}:${obj[k]}`).join(',');

const generators = [
  {
    id: 'g5.1', covers: ['5.3', '5.6'], // chọn kết quả làm tròn
    make(rng) {
      const { n, L } = genRound(rng);
      const right = rnd(n, L);
      const wr = pickBalanced(rng, right, roundWrongs(n, L));
      return {
        id: 'g5.1', src: '[biến thể mới]', type: 'choice',
        prompt: `${lead(rng, n)}Làm tròn ${fmt(n)} đến hàng ${HN[L]}. Kết quả là:`,
        visual: placeV(n, [L - 1]),
        choices: buildChoices(rng, fmt(right), wr.map((w) => ({ text: fmt(w.v), code: w.code, why: w.why }))),
        hint: `Hàng ${HN[L]} là chữ số nào? Hãy nhìn chữ số ngay bên phải nó.`,
        explain: { steps: roundSteps(n, L) },
        meta: { n, L },
      };
    },
    solve(item) { const { n, L } = item.meta; const p = 10 ** L; return fmt(Math.round(n / p) * p); },
  },
  {
    id: 'g5.2', covers: ['5.4'], // bấm kết quả làm tròn
    make(rng) {
      const { n, L } = genRound(rng);
      const right = rnd(n, L);
      const wr = roundWrongs(n, L).slice(0, 2);
      return {
        id: 'g5.2', src: '[biến thể mới]', type: 'numpad',
        prompt: `${lead(rng, n)}Làm tròn ${fmt(n)} đến hàng ${HN[L]}. Bấm kết quả.`,
        visual: placeV(n, [L - 1]),
        slots: [{ answer: String(right), len: String(right).length }],
        wrongHints: wr.map((w) => ({ match: String(w.v), code: w.code, why: w.why })),
        hint: `Chữ số cần xét là chữ số ngay bên phải hàng ${HN[L]}.`,
        explain: { steps: roundSteps(n, L) },
        meta: { n, L },
      };
    },
    solve(item) { const { n, L } = item.meta; const p = 10 ** L; return String(Math.round(n / p) * p); },
  },
  {
    id: 'g5.3', covers: ['5.5'], // Đúng/Sai: bạn làm tròn, nêu lý do
    make(rng) {
      const { n, L } = genRound(rng);
      const right = rnd(n, L);
      const wr = roundWrongs(n, L).slice(0, 3);
      const truth = rng.next() < 0.5;
      const m = truth ? right : pick(rng, wr).v;
      const who = pick(rng, NAMES);
      const d = red(n, L), dHere = digitAt(n, L);
      const claim = `${fmt(n)} làm tròn đến hàng ${HN[L]} là ${fmt(m)}.`;
      const reasons = [
        { text: `Chữ số hàng ${HN[L - 1]} là ${d}, ${rulePhrase(d)}: kết quả là ${fmt(right)}.`, correct: true },
        { text: `Nhìn chữ số hàng ${HN[L]} (là ${dHere}) để biết lên hay xuống.`, correct: false, code: 'HÀNG', why: `Chữ số hàng ${HN[L]} là chữ số được làm tròn. Chữ số cần xét là chữ số ngay bên phải nó: hàng ${HN[L - 1]}, bằng ${d}.` },
        L >= 2
          ? { text: `Nhìn chữ số tận cùng ${n % 10} của số đó.`, correct: false, code: 'HÀNG', why: `Chữ số tận cùng chỉ quyết định khi làm tròn đến hàng chục. Đến hàng ${HN[L]} thì nhìn chữ số hàng ${HN[L - 1]}, bằng ${d}.` }
          : { text: `Làm tròn lần lượt từng hàng, được ${fmt(succ(n, L))}.`, correct: false, code: 'NỐI-TIẾP', why: 'Chỉ nhìn MỘT chữ số: chữ số ngay bên phải hàng cần tròn.' },
      ];
      return {
        id: 'g5.3', src: '[biến thể mới]', type: 'tf',
        prompt: `${who} nói: ${claim} ${who} nói đúng hay sai?`,
        visual: { kind: 'bubble', who, emoji: '🧒', text: claim },
        answer: truth,
        reasons: shuffle(rng, reasons),
        whyWrong: `Con thử lại nhé: chữ số cần xét là ${d}, nên ${fmt(n)} làm tròn đến hàng ${HN[L]} là ${fmt(right)}.`,
        hint: `Làm tròn đến hàng ${HN[L]} thì phải nhìn chữ số ở hàng nào?`,
        explain: { steps: roundSteps(n, L).slice(0, -1).concat([{ text: truth ? `${fmt(n)} làm tròn là ${fmt(right)}, đúng như ${who} nói. Vậy ${who} nói ĐÚNG.` : `${fmt(n)} làm tròn là ${fmt(right)}, không phải ${fmt(m)}. Vậy ${who} nói SAI.`, mark: 'good' }]) },
        meta: { n, L, m },
      };
    },
    solve(item) { const { n, L, m } = item.meta; const p = 10 ** L; return String(Math.round(n / p) * p === m); },
  },
  {
    id: 'g5.4', covers: ['5.1'], // phân loại lên / xuống
    make(rng) {
      const L = int(rng, 1, 3);
      const p = 10 ** L, half = p / 2;
      const lo = p * int(rng, 10, 99);
      const lowSide = [], highSide = [];
      for (let o = 1; o < p; o++) (o * 2 >= p ? highSide : lowSide).push(o);
      const lows = new Set(), highs = new Set();
      if (rng.next() < 0.5) { lows.add(half - 1); highs.add(half); } // hai số sát điểm giữa
      while (lows.size < 2) lows.add(pick(rng, lowSide));
      while (highs.size < 2) highs.add(pick(rng, highSide));
      const nums = shuffle(rng, [...lows, ...highs].map((o) => lo + o));
      const chips = nums.map((v) => ({ id: 'c' + v, text: fmt(v) }));
      const answer = {};
      for (const v of nums) answer['c' + v] = rnd(v, L) === lo ? 'xuong' : 'len';
      const who = pick(rng, NAMES);
      return {
        id: 'g5.4', src: '[biến thể mới]', type: 'classify',
        prompt: `${rng.next() < 0.5 ? `${who} làm tròn đến hàng ${HN[L]}. ` : `Làm tròn đến hàng ${HN[L]}. `}Chạm một số, rồi chạm ô: số đó làm tròn thành ${fmt(lo)} hay ${fmt(lo + p)}?`,
        chips,
        buckets: [{ id: 'xuong', text: `${fmt(lo)} (xuống)` }, { id: 'len', text: `${fmt(lo + p)} (lên)` }],
        answer,
        hint: `Nhìn chữ số ngay bên phải hàng ${HN[L]}: từ 5 trở lên thì lên.`,
        explain: {
          steps: [
            { text: `Làm tròn đến hàng ${HN[L]}: nhìn chữ số ngay bên phải hàng ${HN[L]} (chữ số cần xét).`, visual: placeV(nums[0], [L - 1]) },
            { text: `Chữ số cần xét từ 0 đến 4 thì giữ: thành ${fmt(lo)}. Từ 5 đến 9 thì lên: thành ${fmt(lo + p)}.`, visual: nlRound(lo + 1, L) },
            { text: nums.map((v) => `${fmt(v)} → ${fmt(rnd(v, L))}`).join('; ') + '.', mark: 'good' },
          ],
        },
        meta: { lo, L, nums },
      };
    },
    solve(item) {
      const { lo, L, nums } = item.meta; const p = 10 ** L;
      return nums.map((v) => 'c' + v).sort().map((id) => `${id}:${Math.round(Number(id.slice(1)) / p) * p === lo ? 'xuong' : 'len'}`).join(',');
    },
  },
  {
    id: 'g5.5', covers: ['5.2'], // nối: một số làm tròn đến nhiều hàng
    make(rng) {
      let N, Ls, vals;
      for (let tries = 0; tries < 60; tries++) {
        const digits = int(rng, 5, 6);
        N = int(rng, 10 ** (digits - 1) + 1, 10 ** digits - 1);
        const levels = digits === 5 ? [1, 2, 3, 4] : [1, 2, 3, 4, 5];
        Ls = shuffle(rng, levels).slice(0, 4).sort((x, y) => x - y);
        vals = Ls.map((L) => rnd(N, L));
        if (new Set(vals).size === 4 && N % 10 !== 0) break;
      }
      // nhiễu: kết quả của cách làm "nối tiếp" hoặc làm tròn lệch hướng
      const bad = [];
      for (const L of Ls) { const s = succ(N, L); if (!vals.includes(s)) bad.push(s); }
      for (const L of shuffle(rng, Ls)) { const p = 10 ** L, r = rnd(N, L); bad.push(r + p, r - p); }
      const extra = []; for (const v of bad) if (v > 0 && !vals.includes(v) && !extra.includes(v)) extra.push(v);
      const wrongs = extra.slice(0, 2);
      const rightItems = shuffle(rng, [...vals.map((v) => ({ v, ok: true })), ...wrongs.map((v) => ({ v, ok: false }))]).map((r, i) => ({ id: 'r' + (i + 1), text: fmt(r.v), v: r.v, ok: r.ok }));
      const left = Ls.map((L) => ({ id: 'h' + L, text: `Đến hàng ${HN[L]}` }));
      const pairs = {}; Ls.forEach((L, i) => { pairs['h' + L] = rightItems.find((r) => r.v === vals[i]).id; });
      const who = pick(rng, NAMES);
      const firstSucc = Ls.find((L) => succ(N, L) !== rnd(N, L));
      const steps = Ls.map((L, i) => {
        const d = red(N, L);
        let text = `Hàng ${HN[L]}: chữ số cần xét là ${d} (hàng ${HN[L - 1]}), ${rulePhrase(d)}: ${fmt(vals[i])}.`;
        if (L === firstSucc) text += ` Không làm tròn tiếp từ ${fmt(rnd(N, L - 1))} nhé, sẽ ra ${fmt(succ(N, L))}.`;
        const st = { text, visual: placeV(N, [L - 1]) };
        if (i === Ls.length - 1) { st.text += ` Vậy các kết quả là ${vals.map(fmt).join(', ')}.`; st.mark = 'good'; } else if (L === firstSucc) st.mark = 'bad';
        return st;
      });
      return {
        id: 'g5.5', src: '[biến thể mới]', type: 'match',
        prompt: `${who} viết số ${fmt(N)}. Làm tròn số này đến từng hàng, rồi nối mỗi hàng với kết quả đúng.`,
        visual: placeV(N, []),
        left, right: rightItems.map((r) => ({ id: r.id, text: r.text })), pairs,
        hint: 'Mỗi hàng chỉ nhìn MỘT chữ số: chữ số ngay bên phải hàng đó.',
        explain: { steps },
        meta: { N, Ls },
      };
    },
    solve(item) {
      const { N } = item.meta; const out = {};
      for (const l of item.left) {
        const L = Number(l.id.slice(1)), p = 10 ** L, want = fmt(Math.round(N / p) * p);
        out[l.id] = item.right.find((r) => r.text === want).id;
      }
      return pairStr(out);
    },
  },
  {
    id: 'g5.6', covers: ['5.7'], // hai số sát điểm giữa (biên)
    make(rng) {
      const L = int(rng, 1, 4), p = 10 ** L, half = p / 2;
      const lo = p * int(rng, 3, 95), hi = lo + p;
      const form = pick(rng, ['edge', 'edge', 'up', 'down']);
      let a, b;
      if (form === 'edge') { a = lo + half - 1; b = lo + half; }
      else if (form === 'up') { a = lo + half + int(rng, 0, half - 1); do { b = lo + half + int(rng, 0, half - 1); } while (b === a); }
      else { a = lo + int(rng, 1, half - 1); do { b = lo + int(rng, 1, half - 1); } while (b === a); }
      if (rng.next() < 0.5) [a, b] = [b, a];
      const ra = rnd(a, L), rb = rnd(b, L);
      const whyNum = (x) => `${fmt(x)}: chữ số cần xét là ${red(x, L)}, ${rulePhrase(red(x, L))}, được ${fmt(rnd(x, L))}.`;
      const hiNum = rnd(a, L) === hi ? a : b, loNum = hiNum === a ? b : a;
      let right, wrongs;
      if (form === 'edge') {
        right = `${fmt(ra)} và ${fmt(rb)}`;
        wrongs = [
          { text: `Cùng là ${fmt(lo)}`, code: 'QUY', why: whyNum(hiNum) },
          { text: `Cùng là ${fmt(hi)}`, code: 'QUY', why: whyNum(loNum) },
          { text: `${fmt(rb)} và ${fmt(ra)}`, code: 'ĐỌC', why: `Có thể con đã đọc ngược thứ tự. Số đầu là ${fmt(a)}, số sau là ${fmt(b)}.` },
        ];
      } else {
        const same = form === 'up' ? hi : lo, other = form === 'up' ? lo : hi;
        right = `Cùng là ${fmt(same)}`;
        const bothWhy = `Hai số ${fmt(a)} và ${fmt(b)} đều có chữ số cần xét là ${red(a, L)} và ${red(b, L)}, ${form === 'up' ? 'từ 5 trở lên nên đều lên' : 'từ 4 trở xuống nên đều giữ'}: cùng là ${fmt(same)}.`;
        wrongs = [
          { text: `Cùng là ${fmt(other)}`, code: 'QUY', why: whyNum(a) },
          { text: `${fmt(lo)} và ${fmt(hi)}`, code: 'QUY', why: bothWhy },
          { text: `${fmt(hi)} và ${fmt(lo)}`, code: 'QUY', why: bothWhy },
        ];
      }
      return {
        id: 'g5.6', src: '[biến thể mới]', type: 'choice',
        prompt: `Làm tròn đến hàng ${HN[L]} lần lượt hai số ${fmt(a)} và ${fmt(b)}. Kết quả của hai số là:`,
        choices: buildChoices(rng, right, wrongs),
        hint: 'Với mỗi số, nhìn chữ số ngay bên phải hàng cần tròn.',
        explain: {
          steps: [
            { text: `Đến hàng ${HN[L]} thì nhìn chữ số hàng ${HN[L - 1]} (chữ số cần xét).`, visual: placeV(a, [L - 1]) },
            { text: `${whyNum(a)} ${whyNum(b)}`, visual: { kind: 'numberline', min: lo, max: hi, step: p / 10, labelEvery: half, points: [{ at: a, label: fmt(a), color: DOWN }, { at: b, label: fmt(b), color: UP }] } },
            { text: ra === rb ? `Hai số khác nhau nhưng kết quả giống nhau. Vậy đáp án là "${right}".` : `Hai số chỉ hơn kém nhau 1 mà kết quả khác nhau. Vậy đáp án là "${right}".`, mark: 'good' },
          ],
        },
        meta: { L, a, b },
      };
    },
    solve(item) {
      const { L, a, b } = item.meta; const p = 10 ** L;
      const x = Math.round(a / p) * p, y = Math.round(b / p) * p;
      return x === y ? `Cùng là ${fmt(x)}` : `${fmt(x)} và ${fmt(y)}`;
    },
  },
];

export default {
  id: 'cd05', no: 5, day: 2, title: 'Làm tròn số', short: 'Làm tròn', icon: '🎯',
  intro: 'Làm tròn đến hàng nào thì nhìn chữ số ngay bên phải hàng đó. Chữ số ấy từ 5 trở lên thì làm tròn lên, từ 4 trở xuống thì giữ nguyên.',
  remember: [
    { text: 'Làm tròn đến hàng nào thì chỉ nhìn chữ số NGAY BÊN PHẢI hàng đó. Mình gọi nó là chữ số cần xét và tô màu nó trong bảng hàng. Ví dụ: làm tròn 7 349 đến hàng trăm thì nhìn chữ số hàng chục.', visual: placeV(7349, [1]) },
    { text: 'Chữ số cần xét từ 5 đến 9 thì làm tròn LÊN. Chữ số cần xét từ 0 đến 4 thì giữ nguyên hàng đó, tức là làm tròn xuống. Các chữ số bên phải đều thành 0.', visual: nlRound(237, 1) },
    { text: 'Chỉ nhìn MỘT chữ số thôi. 7 349 đến hàng trăm là 7 300, không phải 7 400.', visual: { kind: 'sequence', items: ['7 349', '7 300'], arrowLabels: ['chữ số 4: giữ'], highlight: [1] } },
    { text: 'Cách làm nháp: con làm tròn từng số trước, rồi mới cộng, trừ hay nhân các số đã tròn. Kết quả tính đúng phải gần số ước lượng.', visual: estimateSteps('+', 387, 214).slice(-1)[0].visual },
  ],
  lesson: [
    { text: 'Làm tròn là đổi một số thành số tròn gần nó nhất. Ếch đứng ở 234, số tròn chục nào gần nhất: 230 hay 240?', visual: { kind: 'numberline', min: 230, max: 240, step: 1, labelEvery: 5, points: [{ at: 234, label: '234', color: PINK }], marker: { at: 234, emoji: '🐸' } } },
    { text: 'Từ 234 đến 230 là 4 bước, đến 240 là 6 bước. 234 gần 230 hơn nên làm tròn xuống: 230.', visual: { kind: 'numberline', min: 230, max: 240, step: 1, labelEvery: 5, points: [{ at: 234, label: '234', color: PINK }], marker: { at: 234, emoji: '🐸' }, jumps: [{ from: 234, to: 230, label: '4 bước' }, { from: 234, to: 240, label: '6 bước' }], anim: 'hop' } },
    { text: 'Số 235 cách 230 và 240 đều 5 bước, nằm đúng giữa. Cả lớp thống nhất: số nằm đúng giữa thì làm tròn LÊN, thành 240.', visual: { kind: 'numberline', min: 230, max: 240, step: 1, labelEvery: 5, points: [{ at: 235, label: 'giữa', color: MID }], range: { from: 235, to: 240, color: UP }, marker: { at: 235, emoji: '🐸' }, jumps: [{ from: 235, to: 240, label: 'lên' }], anim: 'hop' } },
    { text: 'Mẹo nhanh: chỉ nhìn chữ số ngay bên phải hàng cần tròn (chữ số cần xét). 0, 1, 2, 3, 4 thì giữ. 5, 6, 7, 8, 9 thì lên.', visual: { kind: 'table', headers: ['Chữ số cần xét', 'Làm gì?'], rows: [['0  1  2  3  4', 'Giữ nguyên (xuống)'], ['5  6  7  8  9', 'Làm tròn LÊN']] } },
    { text: 'Làm tròn 7 349 đến hàng trăm: chữ số cần xét là 4 (hàng chục). 4 thì giữ, hai chữ số cuối thành 0: 7 300.', visual: nlRound(7349, 2) },
    { text: 'Chỉ nhìn một chữ số thôi nhé! Chữ số 9 ở hàng đơn vị không cần xét. Hàng nghìn, hàng chục nghìn, hàng trăm nghìn cũng làm giống như vậy.', mark: 'bad', visual: { kind: 'sequence', items: ['7 349', '7 350', '7 400'], arrowLabels: ['sai', 'sai'], highlight: [2] } },
    // dùng làm tròn để ước lượng (viết nháp từng bước)
    { text: 'Làm tròn còn giúp con ước lượng. Ví dụ 387 + 214: con làm tròn từng số đến hàng trăm trước.', visual: estimateSteps('+', 387, 214)[0].visual },
    ...estimateSteps('+', 387, 214).slice(1).map((st) => Object.assign({}, st)),
  ],
  items,
  variant,
  generators,
};
