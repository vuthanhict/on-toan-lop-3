// CĐ6 · Số chẵn, số lẻ (Đ/S có giải thích)
import { pick, int, shuffle, seeded } from '../core/rng.js';

/* ---------- tiện ích dùng riêng trong file ---------- */
const fmt = (n) => {
  const s = String(Math.abs(n));
  const t = s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s;
  return (n < 0 ? '−' : '') + t;
};
const IDS = ['a', 'b', 'c', 'd'];
const BLUE = '🔵', ORANGE = '🟠';
const par = (n) => (n % 2 === 0 ? 'chẵn' : 'lẻ');
const oddCount = (arr) => arr.filter((x) => x % 2 !== 0).length;
const parOfCount = (k) => (k % 2 === 0 ? 'chẵn' : 'lẻ');

const placeV = (n, hl) => ({ kind: 'place', digits: String(n), highlight: hl, groupThousands: true, anim: 'fill' });
const ruleTable = () => ({ kind: 'table', headers: ['Phép tính', 'Kết quả'], rows: [['chẵn ± chẵn', 'chẵn'], ['lẻ ± lẻ', 'chẵn'], ['chẵn ± lẻ', 'lẻ']] });
const lastDigitTable = () => ({ kind: 'table', headers: ['Chữ số tận cùng', 'Số đó là'], rows: [['0  2  4  6  8', 'chẵn'], ['1  3  5  7  9', 'lẻ']] });
// n chấm xếp thành từng đôi: "🔵🔵 🔵🔵 🔵"
const pairs = (n, e) => { const out = []; for (let i = 0; i < n; i += 2) out.push(i + 1 < n ? e + e : e); return out.join(' '); };

function buildChoices(rng, right, wrongs) {
  const all = shuffle(rng, [{ text: right, correct: true }, ...wrongs.map((w) => ({ text: w.text, code: w.code, why: w.why }))]);
  return all.map((c, i) => ({ id: IDS[i], ...c }));
}

// số ngẫu nhiên [lo, hi] có tính chẵn/lẻ cho trước
function numPar(rng, lo, hi, odd) {
  let x = int(rng, lo, hi);
  if ((x % 2 !== 0) !== odd) x += x + 1 <= hi ? 1 : -1;
  return x;
}

/* ---------- bài cố định ---------- */
const items = [
  {
    id: '6.1', src: 'T4 tr.1 C1', type: 'choice',
    prompt: 'Dãy nào gồm TOÀN số chẵn?',
    choices: [
      { id: 'a', text: '2; 36; 74; 10; 103', code: 'QUY', why: '103 có chữ số tận cùng là 3 nên là số lẻ. Dãy này có một số lẻ lẫn vào.' },
      { id: 'b', text: '89; 0; 28; 16; 74', code: 'QUY', why: '89 tận cùng là 9 nên là số lẻ. (Số 0 thì là số chẵn nhé.)' },
      { id: 'c', text: '15; 19; 17; 11; 33', code: 'QUY', why: 'Dãy này toàn số lẻ: tận cùng 5, 9, 7, 1, 3.' },
      { id: 'd', text: '100; 22; 94; 78; 36', correct: true },
    ],
    hint: 'Chỉ nhìn chữ số tận cùng của từng số.',
    explain: {
      steps: [
        { text: 'Số chẵn có chữ số tận cùng là 0, 2, 4, 6 hoặc 8. Mình chỉ nhìn chữ số cuối.', visual: lastDigitTable() },
        { text: 'Dãy 2; 36; 74; 10; 103 có 103 (tận cùng 3, lẻ). Dãy 89; 0; 28; 16; 74 có 89 (tận cùng 9, lẻ). Dãy 15; 19; 17; 11; 33 toàn số lẻ.', mark: 'bad', visual: placeV(103, [0]) },
        { text: 'Dãy 100; 22; 94; 78; 36 có chữ số tận cùng là 0, 2, 4, 8, 6, đều chẵn. Vậy đáp án là dãy 100; 22; 94; 78; 36.', mark: 'good' },
      ],
    },
    tags: ['chẵn lẻ', 'tận cùng'],
  },
  {
    id: '6.2', src: 'T4 tr.1 C3', type: 'classify',
    prompt: 'Xếp các số vào đúng ô. Chạm một số, rồi chạm ô SỐ CHẴN hoặc SỐ LẺ.',
    chips: [234, 189, 2000, 8751, 972, 58, 93, 155, 1206, 17].map((v) => ({ id: 'n' + v, text: fmt(v) })),
    buckets: [{ id: 'chan', text: 'Số chẵn' }, { id: 'le', text: 'Số lẻ' }],
    answer: { n234: 'chan', n189: 'le', n2000: 'chan', n8751: 'le', n972: 'chan', n58: 'chan', n93: 'le', n155: 'le', n1206: 'chan', n17: 'le' },
    hint: 'Số 2 000 và 1 206 kết thúc bằng 0 và 6, đó là số chẵn. Chỉ nhìn chữ số cuối!',
    explain: {
      steps: [
        { text: 'Chỉ nhìn chữ số tận cùng. 0, 2, 4, 6, 8 là chẵn; 1, 3, 5, 7, 9 là lẻ.', visual: lastDigitTable() },
        { text: '8 751 tận cùng là 1 nên lẻ (đừng nhìn chữ số 8 ở đầu). 1 206 tận cùng là 6 nên chẵn.', mark: 'bad', visual: placeV(8751, [0]) },
        { text: 'Chẵn: 234, 2 000, 972, 58, 1 206. Lẻ: 189, 8 751, 93, 155, 17.', mark: 'good' },
      ],
    },
    tags: ['chẵn lẻ', 'phân loại'],
  },
  {
    id: '6.3', src: 'T4 tr.1 C4', type: 'multi',
    prompt: 'Không cần tính kết quả, chỉ đếm số lẻ. Chọn tất cả phép tính có kết quả là số CHẴN.',
    choices: [
      { id: 'a', text: '212 − 84', correct: true },
      { id: 'b', text: '108 + 213', code: 'QUY', why: 'Chỉ có 1 số lẻ (213) nên kết quả là số lẻ (321).' },
      { id: 'c', text: '416 − 197', code: 'QUY', why: 'Chỉ có 1 số lẻ (197) nên kết quả là số lẻ (219).' },
      { id: 'd', text: '318 + 186 + 442', correct: true },
      { id: 'e', text: '735 − 525 − 105', code: 'QUY', why: 'Cả ba số đều lẻ. 3 số lẻ thì kết quả là số lẻ (105).' },
    ],
    hint: 'Đếm xem trong mỗi phép tính có bao nhiêu số lẻ: 0 hoặc 2 thì chẵn; 1 hoặc 3 thì lẻ.',
    explain: {
      steps: [
        { text: 'Cộng hay trừ đều như nhau: đếm số lẻ. Có 0 hoặc 2 số lẻ thì kết quả chẵn; có 1 hoặc 3 số lẻ thì kết quả lẻ.', visual: ruleTable() },
        { text: '212 − 84: không có số lẻ nào. 318 + 186 + 442: cũng không có số lẻ. Hai phép này cho số chẵn (128 và 946).', visual: { kind: 'sequence', items: ['318', '186', '442'], arrowLabels: ['+', '+'] } },
        { text: '108 + 213 và 416 − 197 có 1 số lẻ; 735 − 525 − 105 có 3 số lẻ. Cả ba cho số lẻ.', mark: 'bad', visual: { kind: 'sequence', items: ['735', '525', '105'], arrowLabels: ['−', '−'], highlight: [0, 1, 2] } },
        { text: 'Vậy chọn 212 − 84 và 318 + 186 + 442.', mark: 'good' },
      ],
    },
    tags: ['chẵn lẻ', 'đếm số lẻ'],
  },
  {
    id: '6.4', src: 'T4 tr.2 C8', type: 'tf',
    prompt: 'Hà nói như trong hình. Hà nói đúng hay sai?',
    say: 'Hà nói: tổng của 9 với một số bất kì luôn là số lẻ. Hà nói đúng hay sai?',
    visual: { kind: 'bubble', who: 'Hà', emoji: '👧', text: 'Tổng của 9 với một số bất kì luôn là số lẻ.' },
    answer: false,
    reasons: [
      { text: 'Ví dụ 9 + 1 = 10, mà 10 là số chẵn.', correct: true },
      { text: 'Vì 9 là số lẻ nên cộng với số nào cũng được số lẻ.', correct: false, code: 'QUY', why: 'Còn phải xem số cộng thêm là chẵn hay lẻ. Lẻ + chẵn = lẻ, nhưng lẻ + lẻ = chẵn.' },
      { text: 'Ví dụ 9 + 2 = 11, mà 11 là số lẻ.', correct: false, code: '1VD', why: '11 vẫn là số lẻ nên ví dụ này không làm câu sai. Phải tìm ví dụ cho kết quả chẵn.' },
      { text: 'Ví dụ 9 + 4 = 13, đúng là số lẻ nên câu đúng.', correct: false, code: '1VD', why: 'Một ví dụ đúng chưa đủ để chắc chắn câu đó luôn đúng. Muốn nói SAI thì cần một ví dụ làm câu sai.' },
    ],
    whyWrong: 'Con thử cộng 9 với một số lẻ, ví dụ 9 + 1, xem kết quả là chẵn hay lẻ nhé.',
    hint: 'Thử cộng 9 với vài số khác nhau xem kết quả có luôn là số lẻ không.',
    explain: {
      steps: [
        { text: 'Chữ "luôn luôn" nghĩa là lúc nào cũng đúng. Chỉ cần một ví dụ làm câu sai là đủ để nói SAI.', visual: { kind: 'bubble', who: 'Hà', emoji: '👧', text: 'Tổng của 9 với một số bất kì luôn là số lẻ.' } },
        { text: 'Thử 9 + 1: 9 là lẻ, 1 là lẻ, hai bạn lẻ ghép thành đôi. Kết quả 10 là số chẵn.', visual: { kind: 'groups', total: 10, perGroup: 2, emoji: BLUE, container: 'hộp', showRemainder: true, anim: 'distribute' } },
        { text: 'Ví dụ 9 + 1 = 10 làm câu của Hà sai. Vậy Hà nói SAI.', mark: 'good' },
      ],
    },
    tags: ['chẵn lẻ', 'Đ/S', 'phản ví dụ'],
  },
  {
    id: '6.5', src: 'S2-C2', type: 'classify',
    prompt: 'Mỗi câu dưới đây ĐÚNG hay SAI? Chạm một câu, rồi chạm ô Đúng hoặc Sai.',
    chips: [
      { id: 'a', text: 'a) Cộng ba số lẻ có thể được kết quả 100.' },
      { id: 'b', text: 'b) Tổng của hai số lẻ là số chẵn.' },
      { id: 'c', text: 'c) Tổng của ba số chẵn luôn là số chẵn.' },
      { id: 'd', text: 'd) Hiệu của hai số lẻ luôn là số lẻ.' },
    ],
    buckets: [{ id: 'dung', text: 'Đúng' }, { id: 'sai', text: 'Sai' }],
    answer: { a: 'sai', b: 'dung', c: 'dung', d: 'sai' },
    hint: 'Đếm số lẻ trong phép tính: 1 hoặc 3 số lẻ thì kết quả lẻ; 0 hoặc 2 số lẻ thì kết quả chẵn.',
    explain: {
      steps: [
        { text: 'a) Ba số lẻ cộng lại: 3 số lẻ thì kết quả là số lẻ, không thể là 100 (số chẵn). Câu a SAI.', visual: { kind: 'emoji', text: `${pairs(3, BLUE)} + ${pairs(3, ORANGE)} + ${pairs(3, '🟢')} → còn 1 bạn lẻ` } },
        { text: 'b) Hai số lẻ: hai bạn lẻ ghép thành đôi nên tổng chẵn. Câu b ĐÚNG. c) Ba số chẵn: không có số lẻ nào nên tổng chẵn. Câu c ĐÚNG.', visual: ruleTable() },
        { text: 'd) Hiệu hai số lẻ cũng chẵn, ví dụ 9 − 3 = 6. Câu d SAI.', mark: 'bad', visual: { kind: 'sequence', items: ['9', '3', '6'], arrowLabels: ['−', '='], highlight: [2] } },
        { text: 'Vậy a Sai, b Đúng, c Đúng, d Sai.', mark: 'good' },
      ],
    },
    tags: ['chẵn lẻ', 'Đ/S'],
  },
  {
    id: '6.6', src: 'T4 tr.2 C5', type: 'choice',
    prompt: 'Cộng bốn số lẻ bất kì. Tổng đó có chia hết cho 5 không?',
    choices: [
      { id: 'a', text: 'luôn luôn', code: '1VD', why: 'Con mới thấy ví dụ 1 + 3 + 5 + 1 = 10. Thử 1 + 1 + 1 + 1 = 4, số này không chia hết cho 5.' },
      { id: 'b', text: 'có lúc có, có lúc không', correct: true },
      { id: 'c', text: 'không bao giờ', code: '1VD', why: 'Thử 1 + 3 + 5 + 1 = 10, số 10 chia hết cho 5. Vậy có lúc chia hết.' },
    ],
    hint: 'Hãy thử hai ví dụ khác nhau: một ví dụ chia hết cho 5 và một ví dụ không.',
    explain: {
      steps: [
        { text: 'Muốn biết tổng có chia hết cho 5 hay không, mình thử vài ví dụ.', visual: { kind: 'table', headers: ['Bốn số lẻ', 'Tổng', 'Chia hết cho 5?'], rows: [['1 + 3 + 5 + 1', '10', 'Có'], ['1 + 1 + 1 + 1', '4', 'Không']] } },
        { text: '10 chia hết cho 5 (có lúc chia hết). 4 không chia hết cho 5 (có lúc không).', mark: 'good' },
        { text: 'Có lúc có, có lúc không, nên đáp án là "có lúc có, có lúc không".', mark: 'good' },
      ],
    },
    tags: ['chẵn lẻ', 'chia hết cho 5'],
  },
];

const variant = {
  id: '6.7', src: '[biến thể mới]', type: 'choice',
  prompt: 'Không cần tính! 90 − 13 − 27 − 5 là số chẵn hay số lẻ?',
  hint: 'Đếm xem trong phép tính có bao nhiêu số lẻ.',
  choices: [
    { id: 'a', text: 'Số lẻ', correct: true },
    { id: 'b', text: 'Số chẵn', code: 'QUY', why: 'Đếm số lẻ: 13, 27, 5 là 3 số lẻ. 3 số lẻ thì kết quả là số lẻ.' },
    { id: 'c', text: 'Số chẵn, vì 90 là số chẵn', code: 'QUY', why: 'Phải đếm TẤT CẢ số lẻ trong phép tính, không chỉ nhìn số đầu tiên.' },
  ],
  explain: {
    steps: [
      { text: 'Đếm số lẻ trong phép tính: 13, 27 và 5. Có 3 số lẻ (90 là chẵn).', visual: { kind: 'sequence', items: ['90', '13', '27', '5'], arrowLabels: ['−', '−', '−'], highlight: [1, 2, 3] } },
      { text: '3 số lẻ thì kết quả là số lẻ. Tính thử: 90 − 13 − 27 − 5 = 45, đúng là số lẻ.', mark: 'good' },
    ],
  },
  tags: ['chẵn lẻ', 'biến thể'],
};

/* ---------- bộ sinh ---------- */
function termsText(terms, ops) {
  let s = fmt(terms[0]);
  for (let i = 1; i < terms.length; i++) s += ` ${ops[i - 1]} ${fmt(terms[i])}`;
  return s;
}
function evalExpr(terms, ops) {
  let v = terms[0];
  for (let i = 1; i < terms.length; i++) v = ops[i - 1] === '+' ? v + terms[i] : v - terms[i];
  return v;
}
function genExpr(rng, wantOdd) { // wantOdd: số lượng số lẻ mong muốn
  const oddPos = shuffle(rng, [0, 1, 2]).slice(0, wantOdd);
  const terms = [];
  for (let i = 0; i < 3; i++) {
    const isOdd = oddPos.includes(i);
    terms.push(i === 0 ? numPar(rng, 400, 999, isOdd) : numPar(rng, 11, 199, isOdd));
  }
  const ops = [pick(rng, ['+', '−']), pick(rng, ['+', '−'])];
  return { terms, ops };
}

const NAMES = ['Hà', 'Mai', 'Nam', 'Lan', 'Hùng', 'Bo', 'Minh', 'An', 'Hoa', 'Tú', 'Linh', 'Khoa', 'Vy', 'Phúc'];
const WORDK = { 2: 'hai', 3: 'ba', 4: 'bốn' };
const opp = (x) => (x === 'chẵn' ? 'lẻ' : 'chẵn');
const pairStr = (obj) => Object.keys(obj).sort().map((k) => `${k}:${obj[k]}`).join(',');
const lastD = (n) => n % 10;
// biểu thức n số hạng, đúng k số lẻ; số đầu lớn để kết quả luôn dương
function mkExpr(rng, n, k) {
  const oddPos = shuffle(rng, [...Array(n).keys()]).slice(0, k);
  const terms = [];
  for (let i = 0; i < n; i++) { const o = oddPos.includes(i); terms.push(i === 0 ? numPar(rng, 600, 999, o) : numPar(rng, 11, 170, o)); }
  const ops = []; for (let i = 1; i < n; i++) ops.push(pick(rng, ['+', '−']));
  return { terms, ops };
}
const oddList = (terms) => { const o = terms.filter((x) => x % 2 !== 0); return o.length ? o.map(fmt).join(', ') : ''; };
const oddSeqVisual = (terms, ops) => ({ kind: 'sequence', items: terms.map(fmt), arrowLabels: ops, highlight: terms.map((x, i) => (x % 2 !== 0 ? i : -1)).filter((i) => i >= 0) });
// kiểm tra "luôn luôn / có lúc / không bao giờ" bằng cách thử mọi cặp/bộ số trong tập mẫu
function classifyDiv(parts, op, d, samples) {
  const pool = (p) => samples.filter((x) => (x % 2 === 0) === (p === 'chẵn'));
  let yes = 0, no = 0, exYes = null, exNo = null;
  const rec = (vals) => {
    const v = op === '+' ? vals.reduce((a, b) => a + b, 0) : vals.reduce((a, b) => a - b);
    if (v <= 0) return;
    const txt = vals.join(` ${op} `) + ' = ' + v;
    if (v % d === 0) { yes++; if (!exYes) exYes = txt; } else { no++; if (!exNo) exNo = txt; }
  };
  const walk = (i, acc) => { if (i === parts.length) return rec(acc); for (const x of pool(parts[i])) walk(i + 1, [...acc, x]); };
  walk(0, []);
  return { kind: yes && !no ? 'luon' : !yes && no ? 'khong' : 'co', exYes, exNo };
}
const DIV_TEXT = { luon: 'luôn luôn', co: 'có lúc có, có lúc không', khong: 'không bao giờ' };

const generators = [
  {
    id: 'g6.1', covers: ['6.7'],
    make(rng) {
      const target = pick(rng, ['chẵn', 'lẻ']);
      const goodCounts = target === 'chẵn' ? [0, 2] : [1, 3];
      const badCounts = target === 'chẵn' ? [1, 3] : [0, 2];
      let exprs;
      for (let tries = 0; tries < 50; tries++) {
        exprs = [genExpr(rng, pick(rng, goodCounts)), genExpr(rng, pick(rng, badCounts)), genExpr(rng, pick(rng, badCounts)), genExpr(rng, pick(rng, badCounts))];
        const texts = exprs.map((e) => termsText(e.terms, e.ops));
        if (new Set(texts).size === 4) break;
      }
      const toW = (e) => {
        const odds = e.terms.filter((x) => x % 2 !== 0);
        const k = odds.length, res = evalExpr(e.terms, e.ops);
        return { text: termsText(e.terms, e.ops), code: 'QUY', why: `Phép này có ${k} số lẻ${k ? ' (' + odds.map(fmt).join(', ') + ')' : ''} nên kết quả là số ${parOfCount(k)} (${fmt(res)}), không phải số ${target}.` };
      };
      const good = exprs[0];
      const goodK = oddCount(good.terms);
      return {
        id: 'g6.1', src: '[biến thể mới]', type: 'choice',
        prompt: `Không cần tính! Phép tính nào có kết quả là số ${target.toUpperCase()}?`,
        choices: buildChoices(rng, termsText(good.terms, good.ops), exprs.slice(1).map(toW)),
        hint: 'Đếm số lẻ trong từng phép tính: 0 hoặc 2 số lẻ thì chẵn; 1 hoặc 3 số lẻ thì lẻ.',
        explain: {
          steps: [
            { text: 'Cộng hay trừ đều giống nhau: đếm số lẻ. 0 hoặc 2 số lẻ thì kết quả chẵn; 1 hoặc 3 số lẻ thì kết quả lẻ.', visual: ruleTable() },
            { text: 'Đếm số lẻ trong từng phép. ' + exprs.map((e) => `${termsText(e.terms, e.ops)} có ${oddCount(e.terms)} số lẻ.`).join(' '), visual: { kind: 'sequence', items: good.terms.map(String), arrowLabels: good.ops, highlight: good.terms.map((x, i) => (x % 2 !== 0 ? i : -1)).filter((i) => i >= 0) } },
            { text: `Phép ${termsText(good.terms, good.ops)} có ${goodK} số lẻ nên kết quả là số ${target} (tính thử: ${fmt(evalExpr(good.terms, good.ops))}).`, mark: 'good' },
          ],
        },
        meta: { target, exprs: shuffle(rng, exprs.map((e) => ({ terms: e.terms, ops: e.ops }))) },
      };
    },
    solve(item) {
      const { target, exprs } = item.meta;
      const hit = exprs.filter((e) => (e.terms.filter((x) => x % 2 === 1).length % 2 === 0 ? 'chẵn' : 'lẻ') === target);
      return termsText(hit[0].terms, hit[0].ops);
    },
  },
  {
    id: 'g6.2', covers: ['6.4'], // Đúng/Sai: khẳng định về chẵn/lẻ, có lý do
    make(rng) {
      const who = pick(rng, NAMES);
      const r = rng.next();
      const form = r < 0.3 ? 'expr' : r < 0.55 ? 'last' : r < 0.85 ? 'rule' : 'any';
      const truth = rng.next() < 0.5;
      let text, answer, reasons, whyWrong, steps, meta;
      if (form === 'expr') {
        const n = pick(rng, [3, 3, 4]), c = int(rng, 0, n);
        const e = mkExpr(rng, n, c), expr = termsText(e.terms, e.ops), val = evalExpr(e.terms, e.ops);
        const actual = parOfCount(c), claim = truth ? actual : opp(actual);
        text = `${expr} có kết quả là số ${claim}.`; answer = truth;
        const t0 = e.terms[0], tn = e.terms[n - 1];
        reasons = [
          { text: `Đếm số lẻ: có ${c} số lẻ${c ? ` (${oddList(e.terms)})` : ''} nên kết quả là số ${actual}.`, correct: true },
          { text: `Kết quả cùng loại với số đầu tiên (${fmt(t0)} là số ${par(t0)}).`, correct: false, code: 'QUY', why: 'Phải đếm TẤT CẢ số lẻ trong phép tính, không chỉ nhìn số đầu.' },
          { text: `Nhìn số cuối cùng: ${fmt(tn)} là số ${par(tn)} nên kết quả cũng vậy.`, correct: false, code: 'QUY', why: 'Phải đếm số lẻ của TẤT CẢ các số, không chỉ nhìn số cuối.' },
        ];
        whyWrong = `Con thử đếm số lẻ trong phép tính nhé: có ${c} số lẻ thì kết quả là số ${actual}.`;
        steps = [
          { text: 'Cộng hay trừ đều giống nhau: đếm số lẻ. 0, 2 hoặc 4 số lẻ thì kết quả chẵn; 1 hoặc 3 số lẻ thì kết quả lẻ.', visual: ruleTable() },
          { text: `Trong ${expr} có ${c} số lẻ${c ? ': ' + oddList(e.terms) : ''}. Vậy kết quả là số ${actual} (tính thử: ${fmt(val)}).`, visual: oddSeqVisual(e.terms, e.ops) },
          { text: truth ? `Kết quả đúng là số ${claim}, như ${who} nói. Vậy ${who} nói ĐÚNG.` : `Kết quả là số ${actual}, không phải số ${claim}. Vậy ${who} nói SAI.`, mark: 'good' },
        ];
        meta = { form, terms: e.terms, ops: e.ops, claim };
      } else if (form === 'last') {
        let N;
        do { N = int(rng, 100, 9999); } while (par(Math.floor(N / 10 ** (String(N).length - 1))) === par(N) && rng.next() < 0.6);
        const sN = String(N), first = Number(sN[0]), tens = Number(sN[sN.length - 2]);
        const actual = par(N), claim = truth ? actual : opp(actual);
        text = `Số ${fmt(N)} là số ${claim}.`; answer = truth;
        reasons = [
          { text: `Chữ số tận cùng của ${fmt(N)} là ${lastD(N)}, nên đó là số ${actual}.`, correct: true },
          { text: `Chữ số đầu tiên là ${first}, nên ${fmt(N)} là số ${par(first)}.`, correct: false, code: 'QUY', why: 'Chẵn hay lẻ chỉ nhìn chữ số TẬN CÙNG, không nhìn chữ số đầu tiên.' },
          { text: `Chữ số hàng chục là ${tens}, nên ${fmt(N)} là số ${par(tens)}.`, correct: false, code: 'QUY', why: 'Hàng chục không quyết định. Chỉ nhìn chữ số TẬN CÙNG (hàng đơn vị).' },
        ];
        whyWrong = `Con thử nhìn chữ số tận cùng của ${fmt(N)} nhé: đó là ${lastD(N)}, nên đây là số ${actual}.`;
        steps = [
          { text: 'Chỉ nhìn chữ số tận cùng. 0, 2, 4, 6, 8 là chẵn; 1, 3, 5, 7, 9 là lẻ.', visual: lastDigitTable() },
          { text: `${fmt(N)} có chữ số tận cùng là ${lastD(N)}, nên là số ${actual}. Các chữ số khác không quan trọng.`, visual: placeV(N, [0]) },
          { text: truth ? `Đúng là số ${claim}. Vậy ${who} nói ĐÚNG.` : `${fmt(N)} là số ${actual}, không phải số ${claim}. Vậy ${who} nói SAI.`, mark: 'good' },
        ];
        meta = { form, N, claim };
      } else if (form === 'rule') {
        const p = pick(rng, ['chẵn', 'lẻ']), k = pick(rng, [2, 3, 4]);
        const op = k === 2 ? pick(rng, ['Tổng', 'Hiệu']) : 'Tổng';
        const cnt = p === 'lẻ' ? k : 0, actual = parOfCount(cnt), claim = truth ? actual : opp(actual);
        text = `${op} của ${WORDK[k]} số ${p} luôn là số ${claim}.`; answer = truth;
        const mk = () => (p === 'lẻ' ? numPar(rng, 11, 49, true) : numPar(rng, 10, 48, false));
        const xs = [mk(), mk() + 2, mk() + 4, mk() + 6].slice(0, k).map((v, i) => (p === 'lẻ' ? v + (v % 2 === 0 ? 1 : 0) : v + (v % 2 !== 0 ? 1 : 0)));
        const sign = op === 'Tổng' ? '+' : '−';
        const ex = k === 2 && op === 'Hiệu' ? `${Math.max(...xs)} − ${Math.min(...xs)} = ${Math.abs(xs[0] - xs[1])}` : `${xs.join(' + ')} = ${xs.reduce((a, b) => a + b, 0)}`;
        reasons = [
          { text: `Đếm số lẻ: có ${cnt} số lẻ nên kết quả luôn là số ${actual}.`, correct: true },
          { text: `Thử một ví dụ (${ex}) thấy hợp là đủ để chắc chắn.`, correct: false, code: '1VD', why: 'Một ví dụ đúng thì chưa đủ để chắc chắn câu đó luôn đúng. Mình cần dùng quy tắc đếm số lẻ.' },
          { text: `Đếm tất cả các số: có ${k} số nên kết quả là số ${par(k)}.`, correct: false, code: 'QUY', why: `Chỉ đếm các số LẺ, không đếm tất cả các số. Ở đây có ${cnt} số lẻ.` },
        ];
        whyWrong = `Con thử đếm số lẻ trong phép tính nhé: có ${cnt} số lẻ thì kết quả là số ${actual}.`;
        steps = [
          { text: `Cộng hay trừ đều giống nhau: đếm số lẻ. Có ${cnt} số lẻ nên kết quả là số ${actual}.`, visual: ruleTable() },
          { text: `Ví dụ ${ex}: đúng là số ${actual}.` },
          { text: truth ? `Kết quả luôn là số ${claim}. Vậy ${who} nói ĐÚNG.` : `Kết quả luôn là số ${actual}, không phải số ${claim}. Vậy ${who} nói SAI.`, mark: 'good' },
        ];
        meta = { form, p, k, op, claim, sign };
      } else {
        const claim = pick(rng, ['chẵn', 'lẻ']), sub = rng.next() < 0.4;
        const N = int(rng, 11, 99);
        let y1 = 1, y2 = 1;
        const val = (y) => (sub ? N - y : N + y), sg = sub ? '−' : '+';
        for (let y = 1; y <= 9; y++) if (par(val(y)) !== claim) { y1 = y; break; }
        for (let y = 1; y <= 9; y++) if (par(val(y)) === claim) { y2 = y; break; }
        text = sub ? `${N} trừ đi một số bất kì (nhỏ hơn ${N}) luôn được số ${claim}.` : `Tổng của ${N} với một số bất kì luôn là số ${claim}.`;
        answer = false;
        reasons = [
          { text: `Ví dụ ${N} ${sg} ${y1} = ${val(y1)}, mà ${val(y1)} là số ${par(val(y1))}.`, correct: true },
          { text: `Vì ${N} là số ${par(N)} nên ${sub ? 'trừ' : 'cộng'} với số nào cũng được số ${claim}.`, correct: false, code: 'QUY', why: `Còn phải xem số ${sub ? 'trừ đi' : 'cộng thêm'} là chẵn hay lẻ. Hai trường hợp cho kết quả khác nhau.` },
          { text: `Ví dụ ${N} ${sg} ${y2} = ${val(y2)}, đúng là số ${claim} nên câu đúng.`, correct: false, code: '1VD', why: 'Một ví dụ đúng chưa đủ để chắc chắn câu đó luôn đúng. Muốn nói SAI thì cần một ví dụ làm câu sai.' },
        ];
        whyWrong = `Con thử ${sub ? 'trừ' : 'cộng'} ${N} với ${y1} xem kết quả là chẵn hay lẻ nhé.`;
        steps = [
          { text: 'Chữ "luôn" nghĩa là lúc nào cũng đúng. Chỉ cần một ví dụ làm câu sai là đủ để nói SAI.' },
          { text: `Thử ${N} ${sg} ${y1}: ${N} là số ${par(N)}, ${y1} là số ${par(y1)}. Kết quả ${val(y1)} là số ${par(val(y1))}, không phải số ${claim}.`, visual: { kind: 'sequence', items: [String(N), String(y1), String(val(y1))], arrowLabels: [sg, '='], highlight: [2] } },
          { text: `Ví dụ ${N} ${sg} ${y1} = ${val(y1)} làm câu sai. Vậy ${who} nói SAI.`, mark: 'good' },
        ];
        meta = { form, N, claim, sub };
      }
      return {
        id: 'g6.2', src: '[biến thể mới]', type: 'tf',
        prompt: `${who} nói: ${text} ${who} nói đúng hay sai?`,
        visual: { kind: 'bubble', who, emoji: '🧒', text },
        answer,
        reasons: shuffle(rng, reasons),
        whyWrong,
        hint: 'Muốn biết chẵn hay lẻ: nhìn chữ số tận cùng, hoặc đếm số lẻ trong phép tính.',
        explain: { steps },
        meta,
      };
    },
    solve(item) {
      const m = item.meta;
      if (m.form === 'expr') return String(par(evalExpr(m.terms, m.ops)) === m.claim);
      if (m.form === 'last') return String(par(m.N) === m.claim);
      if (m.form === 'rule') {
        const base = m.p === 'lẻ' ? [1, 3, 5, 7, 9, 11, 13, 15] : [2, 4, 6, 8, 10, 12, 14, 16];
        let all = true;
        const check = (vals) => { const v = m.op === 'Tổng' ? vals.reduce((a, b) => a + b, 0) : vals[0] - vals[1]; if (par(Math.abs(v)) !== m.claim) all = false; };
        const walk = (i, acc) => { if (i === m.k) return check(acc); for (const x of base) walk(i + 1, [...acc, x]); };
        walk(0, []);
        return String(all);
      }
      let all = true; // 'any': thử mọi số y từ 1 đến 20
      for (let y = 1; y <= 20; y++) if (par(m.sub ? m.N - y : m.N + y) !== m.claim) all = false;
      return String(all);
    },
  },
  {
    id: 'g6.3', covers: ['6.2'],
    make(rng) {
      let nums;
      for (let t = 0; t < 30; t++) {
        const set = new Set();
        while (set.size < 6) set.add(pick(rng, [int(rng, 10, 99), int(rng, 100, 999), int(rng, 1000, 9999), int(rng, 100, 999), int(rng, 10, 99)]));
        nums = [...set];
        const e = nums.filter((x) => x % 2 === 0).length;
        if (e >= 2 && e <= 4) break;
      }
      const answer = {};
      nums.forEach((v) => { answer['n' + v] = v % 2 === 0 ? 'chan' : 'le'; });
      const tricky = nums.find((v) => String(v).length >= 3 && Number(String(v)[0]) % 2 !== v % 2) ?? nums[0];
      return {
        id: 'g6.3', src: '[biến thể mới]', type: 'classify',
        prompt: 'Xếp các số vào đúng ô. Chạm một số, rồi chạm ô SỐ CHẴN hoặc SỐ LẺ.',
        chips: nums.map((v) => ({ id: 'n' + v, text: fmt(v) })),
        buckets: [{ id: 'chan', text: 'Số chẵn' }, { id: 'le', text: 'Số lẻ' }],
        answer,
        hint: 'Chỉ nhìn chữ số tận cùng của mỗi số.',
        explain: {
          steps: [
            { text: 'Chỉ nhìn chữ số tận cùng. 0, 2, 4, 6, 8 là chẵn; 1, 3, 5, 7, 9 là lẻ.', visual: lastDigitTable() },
            { text: `Ví dụ ${fmt(tricky)} tận cùng là ${tricky % 10} nên là số ${par(tricky)}. Các chữ số khác không quan trọng.`, visual: placeV(tricky, [0]) },
            { text: `Chẵn: ${nums.filter((v) => v % 2 === 0).map(fmt).join(', ') || 'không có'}. Lẻ: ${nums.filter((v) => v % 2 !== 0).map(fmt).join(', ') || 'không có'}.`, mark: 'good' },
          ],
        },
        meta: { nums },
      };
    },
    solve(item) { return item.meta.nums.map((v) => 'n' + v).sort().map((id) => `${id}:${Number(id.slice(1)) % 2 === 0 ? 'chan' : 'le'}`).join(','); },
  },
  {
    id: 'g6.4', covers: ['6.1'],
    make(rng) {
      const odd = rng.next() < 0.5;
      const target = odd ? 'lẻ' : 'chẵn';
      const row = (intruders) => {
        const set = new Set();
        const pos = shuffle(rng, [0, 1, 2, 3, 4]).slice(0, intruders);
        const arr = [];
        for (let i = 0; i < 5; i++) {
          const wantOdd = pos.includes(i) ? !odd : odd;
          let v, guard = 0;
          do { v = numPar(rng, 1, pick(rng, [20, 99, 150]), wantOdd); guard++; } while (set.has(v) && guard < 30);
          set.add(v); arr.push(v);
        }
        return { arr, intruder: pos.map((i) => arr[i]) };
      };
      let rows;
      for (let t = 0; t < 30; t++) {
        rows = [row(0), row(1), row(1), row(2)];
        if (new Set(rows.map((r) => r.arr.join('; '))).size === 4) break;
      }
      const toW = (r) => ({ text: r.arr.join('; '), code: 'QUY', why: `${r.intruder.map(fmt).join(' và ')} tận cùng là ${r.intruder.map((v) => v % 10).join(' và ')}, là số ${odd ? 'chẵn' : 'lẻ'}. Dãy này có số ${odd ? 'chẵn' : 'lẻ'} lẫn vào.` });
      return {
        id: 'g6.4', src: '[biến thể mới]', type: 'choice',
        prompt: `Dãy nào gồm TOÀN số ${target}?`,
        choices: buildChoices(rng, rows[0].arr.join('; '), rows.slice(1).map(toW)),
        hint: 'Chỉ nhìn chữ số tận cùng của từng số.',
        explain: {
          steps: [
            { text: `Số ${target} có chữ số tận cùng là ${odd ? '1, 3, 5, 7, 9' : '0, 2, 4, 6, 8'}. Mình chỉ nhìn chữ số cuối.`, visual: lastDigitTable() },
            { text: `Ba dãy còn lại đều có số ${odd ? 'chẵn' : 'lẻ'} lẫn vào, ví dụ ${rows[1].intruder[0]} tận cùng ${rows[1].intruder[0] % 10}.`, mark: 'bad', visual: placeV(rows[1].intruder[0], [0]) },
            { text: `Dãy ${rows[0].arr.join('; ')} có chữ số cuối đều là số ${target}. Vậy đó là đáp án.`, mark: 'good' },
          ],
        },
        meta: { target, rows: shuffle(rng, rows.map((r) => r.arr)) },
      };
    },
    solve(item) {
      const { target, rows } = item.meta;
      const want = target === 'lẻ' ? 1 : 0;
      return rows.find((r) => r.every((v) => v % 2 === want)).join('; ');
    },
  },
  {
    id: 'g6.5', covers: ['6.3'], // chọn nhiều: các phép tính có kết quả chẵn/lẻ
    make(rng) {
      const target = pick(rng, ['chẵn', 'lẻ']);
      const nGood = pick(rng, [2, 2, 3]);
      const validCounts = (n, want) => [0, 1, 2, 3, 4].filter((c) => c <= n && parOfCount(c) === want);
      let list;
      for (let tries = 0; tries < 60; tries++) {
        list = [];
        for (let i = 0; i < 5; i++) {
          const good = i < nGood, n = pick(rng, [2, 3, 3, 4]);
          const cs = validCounts(n, good ? target : opp(target));
          list.push({ ...mkExpr(rng, n, pick(rng, cs)), good });
        }
        if (new Set(list.map((e) => termsText(e.terms, e.ops))).size === 5) break;
      }
      const all = shuffle(rng, list);
      const txtOf = (e) => termsText(e.terms, e.ops);
      const goods = all.filter((e) => e.good);
      return {
        id: 'g6.5', src: '[biến thể mới]', type: 'multi',
        prompt: `Không cần tính kết quả, chỉ đếm số lẻ. Chọn tất cả phép tính có kết quả là số ${target.toUpperCase()}.`,
        choices: all.map((e, i) => {
          const c = e.terms.filter((x) => x % 2 !== 0).length, val = evalExpr(e.terms, e.ops);
          return e.good
            ? { id: 'abcde'[i], text: txtOf(e), correct: true }
            : { id: 'abcde'[i], text: txtOf(e), code: 'QUY', why: `Có ${c} số lẻ${c ? ` (${oddList(e.terms)})` : ''} nên kết quả là số ${parOfCount(c)} (${fmt(val)}), không phải số ${target}.` };
        }),
        hint: 'Đếm xem trong mỗi phép tính có bao nhiêu số lẻ: 0, 2 hoặc 4 thì chẵn; 1 hoặc 3 thì lẻ.',
        explain: {
          steps: [
            { text: 'Cộng hay trừ đều như nhau: đếm số lẻ. Có 0, 2 hoặc 4 số lẻ thì kết quả chẵn; có 1 hoặc 3 số lẻ thì kết quả lẻ.', visual: ruleTable() },
            { text: `Các phép cho số ${target}: ${goods.map((e) => `${txtOf(e)} (${e.terms.filter((x) => x % 2 !== 0).length} số lẻ, ra ${fmt(evalExpr(e.terms, e.ops))})`).join('; ')}.`, visual: oddSeqVisual(goods[0].terms, goods[0].ops) },
            { text: `Các phép còn lại cho số ${opp(target)}, nên không chọn.`, mark: 'bad' },
            { text: `Vậy chọn ${goods.map(txtOf).join('; ')}.`, mark: 'good' },
          ],
        },
        meta: { target, exprs: all.map((e) => ({ terms: e.terms, ops: e.ops })) },
      };
    },
    solve(item) {
      const { target, exprs } = item.meta;
      return exprs.filter((e) => par(evalExpr(e.terms, e.ops)) === target).map((e) => termsText(e.terms, e.ops)).sort().join(',');
    },
  },
  {
    id: 'g6.6', covers: ['6.5'], // phân loại: bốn câu Đúng hay Sai
    make(rng) {
      const kinds = shuffle(rng, ['sum', 'can', 'num', 'expr']);
      const stm = kinds.map((kind) => {
        const truth = rng.next() < 0.5;
        if (kind === 'sum') {
          const p = pick(rng, ['chẵn', 'lẻ']), k = pick(rng, [2, 3, 4]);
          const op = k === 2 ? pick(rng, ['Tổng', 'Hiệu']) : 'Tổng';
          const actual = parOfCount(p === 'lẻ' ? k : 0), claim = truth ? actual : opp(actual);
          return { kind, p, k, op, claim, text: `${op} của ${WORDK[k]} số ${p} luôn là số ${claim}.` };
        }
        if (kind === 'can') {
          const k = pick(rng, [2, 3]);
          const N = numPar(rng, 20, 300, truth ? k % 2 === 1 : k % 2 === 0);
          return { kind, k, N, text: `Cộng ${WORDK[k]} số lẻ có thể được kết quả ${N}.` };
        }
        if (kind === 'num') {
          const N = int(rng, 100, 9999), actual = par(N), claim = truth ? actual : opp(actual);
          return { kind, N, claim, text: `Số ${fmt(N)} là số ${claim}.` };
        }
        const n = pick(rng, [3, 4]), c = int(rng, 0, n), e = mkExpr(rng, n, c), actual = parOfCount(c), claim = truth ? actual : opp(actual);
        return { kind, terms: e.terms, ops: e.ops, claim, text: `${termsText(e.terms, e.ops)} là số ${claim}.` };
      });
      const truthOf = (m) => {
        if (m.kind === 'sum') return parOfCount(m.p === 'lẻ' ? m.k : 0) === m.claim;
        if (m.kind === 'can') return m.N % 2 === m.k % 2;
        if (m.kind === 'num') return par(m.N) === m.claim;
        return par(evalExpr(m.terms, m.ops)) === m.claim;
      };
      if (stm.every((m) => truthOf(m) === truthOf(stm[0]))) { // luôn có cả câu Đúng lẫn câu Sai
        const m = stm[int(rng, 0, 3)];
        if (m.kind === 'can') m.N += 1, m.text = `Cộng ${WORDK[m.k]} số lẻ có thể được kết quả ${m.N}.`;
        else { m.claim = opp(m.claim); m.text = m.text.replace(/số (chẵn|lẻ)\.$/, `số ${m.claim}.`); }
      }
      const why = (m) => {
        const ok = truthOf(m) ? 'ĐÚNG' : 'SAI';
        if (m.kind === 'sum') { const cnt = m.p === 'lẻ' ? m.k : 0; return `"${m.text}" Có ${cnt} số lẻ nên kết quả luôn là số ${parOfCount(cnt)}. Câu này ${ok}.`; }
        if (m.kind === 'can') return `"${m.text}" ${WORDK[m.k]} số lẻ cộng lại ra số ${parOfCount(m.k)}, mà ${m.N} là số ${par(m.N)}. Câu này ${ok}.`;
        if (m.kind === 'num') return `"${m.text}" Chữ số tận cùng là ${lastD(m.N)}, nên đó là số ${par(m.N)}. Câu này ${ok}.`;
        const c = m.terms.filter((x) => x % 2 !== 0).length; return `"${m.text}" Có ${c} số lẻ nên kết quả là số ${parOfCount(c)}. Câu này ${ok}.`;
      };
      const chips = stm.map((m, i) => ({ id: 's' + (i + 1), text: m.text }));
      const answer = {}; stm.forEach((m, i) => { answer['s' + (i + 1)] = truthOf(m) ? 'dung' : 'sai'; });
      return {
        id: 'g6.6', src: '[biến thể mới]', type: 'classify',
        prompt: 'Mỗi câu dưới đây ĐÚNG hay SAI? Chạm một câu, rồi chạm ô Đúng hoặc Sai.',
        chips,
        buckets: [{ id: 'dung', text: 'Đúng' }, { id: 'sai', text: 'Sai' }],
        answer,
        hint: 'Đếm số lẻ trong phép tính: 1 hoặc 3 số lẻ thì kết quả lẻ; 0, 2 hoặc 4 số lẻ thì kết quả chẵn. Số chẵn hay lẻ chỉ nhìn chữ số tận cùng.',
        explain: {
          steps: [
            { text: 'Cộng hay trừ đều giống nhau: đếm số lẻ. Có 0, 2 hoặc 4 số lẻ thì kết quả chẵn; có 1 hoặc 3 số lẻ thì kết quả lẻ.', visual: ruleTable() },
            { text: why(stm[0]) },
            { text: why(stm[1]) },
            { text: why(stm[2]) + ' ' + why(stm[3]), mark: 'good' },
          ],
        },
        meta: { stm },
      };
    },
    solve(item) {
      const out = {};
      item.meta.stm.forEach((m, i) => {
        let t;
        if (m.kind === 'sum') { // thử mọi bộ số mẫu
          const base = m.p === 'lẻ' ? [1, 3, 5, 7, 9, 11] : [2, 4, 6, 8, 10, 12];
          t = true;
          const walk = (j, acc) => { if (j === m.k) { const v = m.op === 'Tổng' ? acc.reduce((a, b) => a + b, 0) : Math.abs(acc[0] - acc[1]); if (par(v) !== m.claim) t = false; return; } for (const x of base) walk(j + 1, [...acc, x]); };
          walk(0, []);
        } else if (m.kind === 'can') { // k − 1 số lẻ nhỏ nhất (1) rồi xem số lẻ cuối còn lại có hợp lệ không
          const last = m.N - (m.k - 1); t = last >= 1 && last % 2 === 1;
        } else if (m.kind === 'num') t = par(m.N) === m.claim;
        else t = par(evalExpr(m.terms, m.ops)) === m.claim;
        out['s' + (i + 1)] = t ? 'dung' : 'sai';
      });
      return pairStr(out);
    },
  },
  {
    id: 'g6.7', covers: ['6.6'], // luôn luôn / có lúc / không bao giờ chia hết
    make(rng) {
      const want = pick(rng, ['luon', 'co', 'khong']);
      const scen = [];
      for (const p of ['lẻ', 'chẵn']) for (const k of [2, 3, 4]) scen.push({ parts: Array(k).fill(p), op: '+', desc: `cộng ${WORDK[k]} số ${p} bất kì`, noun: 'Tổng' });
      scen.push({ parts: ['chẵn', 'lẻ'], op: '+', desc: 'cộng một số chẵn với một số lẻ bất kì', noun: 'Tổng' });
      for (const [p, q] of [['lẻ', 'lẻ'], ['lẻ', 'chẵn'], ['chẵn', 'lẻ'], ['chẵn', 'chẵn']]) scen.push({ parts: [p, q], op: '−', desc: `lấy một số ${p} bất kì trừ đi một số ${q} bất kì (số bị trừ lớn hơn)`, noun: 'Hiệu' });
      const samples = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
      const cands = [];
      for (const sc of scen) for (const d of [2, 5, 10]) { const r = classifyDiv(sc.parts, sc.op, d, samples); if (r.kind === want) cands.push({ sc, d, r }); }
      const { sc, d, r } = pick(rng, cands);
      const who = pick(rng, NAMES);
      const right = DIV_TEXT[want];
      const wrongTexts = Object.keys(DIV_TEXT).filter((k) => k !== want);
      const wrongs = wrongTexts.map((k) => {
        if (k === 'luon') return { text: DIV_TEXT.luon, code: '1VD', why: `Thử ${r.exNo}: số này không chia hết cho ${d}, nên không phải lúc nào cũng chia hết.` };
        if (k === 'khong') return { text: DIV_TEXT.khong, code: '1VD', why: `Thử ${r.exYes}: số này chia hết cho ${d}, nên không phải không bao giờ.` };
        return { text: DIV_TEXT.co, code: '1VD', why: want === 'luon' ? `Con thử ${r.exYes}: chia hết cho ${d}. Đếm số lẻ thì thấy kết quả luôn chia hết cho ${d}, không có ví dụ nào không chia hết.` : `Con thử ${r.exNo}: không chia hết cho ${d}. Đếm số lẻ thì thấy kết quả luôn là số lẻ, nên không bao giờ chia hết cho ${d}.` };
      });
      const cntOdd = sc.parts.filter((x) => x === 'lẻ').length;
      const resPar = parOfCount(cntOdd);
      const tbl = [];
      if (r.exYes) tbl.push([r.exYes.split(' = ')[0], r.exYes.split(' = ')[1], 'Có']);
      if (r.exNo) tbl.push([r.exNo.split(' = ')[0], r.exNo.split(' = ')[1], 'Không']);
      const steps = [
        { text: `Muốn biết ${sc.noun.toLowerCase()} có chia hết cho ${d} không, mình thử vài ví dụ.`, visual: { kind: 'table', headers: [sc.noun, 'Kết quả', `Chia hết cho ${d}?`], rows: tbl } },
        { text: want === 'co' ? `Có ví dụ chia hết cho ${d} (${r.exYes}), có ví dụ không chia hết (${r.exNo}).` : `Đếm số lẻ: có ${cntOdd} số lẻ nên kết quả luôn là số ${resPar}. ${want === 'luon' ? `Số ${resPar} này luôn chia hết cho ${d}.` : `Số chia hết cho ${d} phải là số chẵn, mà kết quả luôn là số lẻ.`}`, mark: want === 'co' ? undefined : 'good' },
        { text: `Vậy đáp án là "${right}".`, mark: 'good' },
      ];
      return {
        id: 'g6.7', src: '[biến thể mới]', type: 'choice',
        prompt: `${who} ${sc.desc}. ${sc.noun} đó có chia hết cho ${d} không?`,
        choices: buildChoices(rng, right, wrongs),
        hint: 'Hãy thử hai ví dụ khác nhau, hoặc đếm xem có bao nhiêu số lẻ.',
        explain: { steps },
        meta: { parts: sc.parts, op: sc.op, d },
      };
    },
    solve(item) {
      const { parts, op, d } = item.meta;
      const samples = []; for (let i = 1; i <= 21; i++) samples.push(i);
      return DIV_TEXT[classifyDiv(parts, op, d, samples).kind];
    },
  },
  {
    id: 'g6.8', covers: ['6.7'], // chẵn hay lẻ: không cần tính
    make(rng) {
      const n = pick(rng, [3, 4, 4]), c = int(rng, 0, n);
      const e = mkExpr(rng, n, c);
      const first = e.terms[0];
      // số đầu có thể nhỏ như bài mẫu
      const expr = termsText(e.terms, e.ops), actual = parOfCount(c), val = evalExpr(e.terms, e.ops);
      const right = `Số ${actual}`;
      const wrongs = [{ text: `Số ${opp(actual)}`, code: 'QUY', why: `Đếm số lẻ: ${c ? oddList(e.terms) + ` là ${c} số lẻ` : 'không có số lẻ nào'}. ${c} số lẻ thì kết quả là số ${actual}.` }];
      const lastT = e.terms[n - 1];
      const alt = [];
      if (par(first) !== actual) alt.push({ text: `Số ${par(first)}, vì ${fmt(first)} là số ${par(first)}`, code: 'QUY', why: 'Phải đếm TẤT CẢ số lẻ trong phép tính, không chỉ nhìn số đầu tiên.' });
      if (par(lastT) !== actual) alt.push({ text: `Số ${par(lastT)}, vì ${fmt(lastT)} là số ${par(lastT)}`, code: 'QUY', why: 'Phải đếm TẤT CẢ số lẻ trong phép tính, không chỉ nhìn số cuối cùng.' });
      if (actual === 'chẵn' && e.ops.includes('−')) alt.push({ text: 'Số lẻ, vì có phép trừ', code: 'QUY', why: 'Cộng hay trừ đều giống nhau về chẵn lẻ: chỉ cần đếm số lẻ trong phép tính.' });
      alt.push({ text: 'Phải tính ra kết quả mới biết', code: 'QUY', why: 'Không cần tính: chỉ đếm số lẻ trong phép tính là biết kết quả chẵn hay lẻ.' });
      wrongs.push(alt.length > 1 && rng.next() < 0.85 ? pick(rng, alt.slice(0, -1)) : alt[alt.length - 1]);
      return {
        id: 'g6.8', src: '[biến thể mới]', type: 'choice',
        prompt: `Không cần tính! ${expr} là số chẵn hay số lẻ?`,
        choices: buildChoices(rng, right, wrongs),
        hint: 'Đếm xem trong phép tính có bao nhiêu số lẻ.',
        explain: {
          steps: [
            { text: `Đếm số lẻ trong phép tính: ${c ? oddList(e.terms) + ` (${c} số lẻ)` : 'không có số lẻ nào'}.`, visual: oddSeqVisual(e.terms, e.ops) },
            { text: `${c} số lẻ thì kết quả là số ${actual}. Tính thử: ${expr} = ${fmt(val)}, đúng là số ${actual}. Vậy đáp án là "${right}".`, mark: 'good' },
          ],
        },
        meta: { terms: e.terms, ops: e.ops },
      };
    },
    solve(item) { return 'Số ' + par(evalExpr(item.meta.terms, item.meta.ops)); },
  },
];

export default {
  id: 'cd06', no: 6, day: 2, title: 'Số chẵn, số lẻ', short: 'Chẵn – lẻ', icon: '🧑‍🤝‍🧑',
  intro: 'Chẵn là xếp thành đôi vừa hết, lẻ là thừa một bạn. Cộng hay trừ chỉ cần đếm số lẻ trong phép tính.',
  remember: [
    { text: 'Chỉ nhìn chữ số TẬN CÙNG. Chẵn là 0, 2, 4, 6, 8 (kể cả số 0 và 2 000). Lẻ là 1, 3, 5, 7, 9.', visual: lastDigitTable() },
    { text: 'Chẵn + chẵn = chẵn. Lẻ + lẻ = chẵn. Chẵn + lẻ = lẻ. Phép trừ cũng giống vậy: cứ đếm số lẻ.', visual: ruleTable() },
    { text: 'Muốn chứng tỏ một câu là sai, chỉ cần tìm một ví dụ không đúng. Muốn chắc chắn câu đó luôn đúng thì một ví dụ chưa đủ, phải dùng quy tắc.', visual: { kind: 'bubble', who: 'Hà', emoji: '👧', text: 'Tổng của 9 với một số bất kì luôn là số lẻ.' } },
  ],
  lesson: [
    { text: 'Xếp các bạn thành từng đôi. 8 bạn xếp được 4 đôi, vừa hết. Số 8 là số CHẴN.', visual: { kind: 'groups', total: 8, perGroup: 2, emoji: BLUE, container: 'hộp', showRemainder: true, anim: 'distribute' } },
    { text: '7 bạn xếp được 3 đôi và còn thừa 1 bạn đứng lẻ. Số 7 là số LẺ.', visual: { kind: 'groups', total: 7, perGroup: 2, emoji: BLUE, container: 'hộp', showRemainder: true, anim: 'distribute' } },
    { text: 'Số lớn thì mình chỉ nhìn chữ số tận cùng. 8 751 tận cùng là 1 nên là số lẻ. 2 000 tận cùng là 0 nên là số chẵn.', visual: placeV(8751, [0]) },
    { text: 'Chẵn + chẵn: các đôi ghép với các đôi, vẫn vừa hết. 4 + 2 = 6 là số chẵn.', visual: { kind: 'emoji', text: `${pairs(4, BLUE)} + ${pairs(2, ORANGE)} = ${pairs(4, BLUE)} ${pairs(2, ORANGE)}` } },
    { text: 'Lẻ + lẻ: hai bạn đứng lẻ nắm tay nhau thành một đôi. 3 + 5 = 8 là số chẵn.', visual: { kind: 'emoji', text: `${pairs(3, BLUE)} + ${pairs(5, ORANGE)} = ${BLUE}${BLUE} ${BLUE}${ORANGE} ${ORANGE}${ORANGE} ${ORANGE}${ORANGE}` } },
    { text: 'Chẵn + lẻ: vẫn còn một bạn lẻ nên kết quả là số lẻ. Trừ cũng giống vậy. Nhớ: đếm số lẻ, 0 hoặc 2 thì chẵn, 1 hoặc 3 thì lẻ.', visual: ruleTable() },
  ],
  items,
  variant,
  generators,
};
