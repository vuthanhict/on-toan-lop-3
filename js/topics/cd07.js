// CĐ7 · Cộng, trừ: ước lượng, số thiếu □ ○ △, tia số
import { pick, int, shuffle, seeded } from '../core/rng.js';

/* ---------- tiện ích dùng riêng trong file ---------- */
const fmt = (n) => {
  const s = String(Math.abs(n));
  const t = s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s;
  return (n < 0 ? '−' : '') + t;
};
const IDS = ['a', 'b', 'c', 'd'];
const PINK = '#FF5C8A', UP = '#FF8A3D', DOWN = '#B05CFF';
const r100 = (x) => Math.round(x / 100) * 100; // làm tròn đến hàng trăm (5 trở lên thì lên)
const r10 = (x) => Math.round(x / 10) * 10;
const dg = (n) => [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];

function buildChoices(rng, right, wrongs) {
  const all = shuffle(rng, [{ text: right, correct: true }, ...wrongs.map((w) => ({ text: w.text, code: w.code, why: w.why }))]);
  return all.map((c, i) => ({ id: IDS[i], ...c }));
}
// lấy tối đa n đáp án nhiễu khác nhau, khác đáp án đúng
function distinct(pool, rightText, n) {
  const seen = new Set([rightText]);
  const out = [];
  for (const w of pool) { if (seen.has(w.text)) continue; seen.add(w.text); out.push(w); if (out.length === n) break; }
  return out;
}

// trục số khoảng [lo, hi] chứa số n, để minh hoạ làm tròn đến hàng trăm
function nlHundred(n) {
  const lo = n - (n % 100), hi = lo + 100, mid = lo + 50;
  const up = n % 100 >= 50;
  return {
    kind: 'numberline', min: lo, max: hi, step: 10, labelEvery: 50,
    points: [{ at: n, label: fmt(n), color: PINK }],
    range: up ? { from: mid, to: hi, color: UP } : { from: lo, to: mid, color: DOWN },
    marker: { at: n, emoji: '🐸' },
  };
}

// tia số cho "làm tròn rồi bù": start -> mid -> end
function nlJump(a, jumps, show, bare) { // jumps: [{to,label}], show: số điểm kết quả đã hiện (0..n); bare: không vẽ dấu ? ở vị trí đáp án
  const vals = [a, ...jumps.map((j) => j.to)];
  const lo = Math.max(0, Math.floor(Math.min(...vals) / 10) * 10 - 10);
  const hi = Math.ceil(Math.max(...vals) / 10) * 10 + 10;
  const js = []; let cur = a;
  jumps.forEach((j, i) => { if (i < show) js.push({ from: cur, to: j.to, label: j.label }); cur = j.to; });
  const points = [{ at: a, label: fmt(a), color: PINK }];
  jumps.forEach((j, i) => { if (i < show) points.push({ at: j.to, label: fmt(j.to), color: i === jumps.length - 1 ? '#2FBF71' : UP }); else if (!bare) points.push({ at: j.to, hidden: true }); });
  return { kind: 'numberline', min: lo, max: hi, step: 10, labelEvery: (hi - lo) / 10 > 10 ? 20 : 10, points, jumps: js, marker: { at: a, emoji: '🐸' }, anim: show ? 'hop' : undefined };
}

/* ----- cộng/trừ đặt dọc có nhớ/mượn (số có 3 chữ số) ----- */
function addCalc(a, b) {
  const [ha, ta, ua] = dg(a), [hb, tb, ub] = dg(b);
  const u = ua + ub, cu = u >= 10 ? 1 : 0, t = ta + tb + cu, ct = t >= 10 ? 1 : 0, h = ha + hb + ct;
  return { ha, ta, ua, hb, tb, ub, u, cu, t, ct, h, ru: u % 10, rt: t % 10 };
}
function subCalc(a, b) {
  const [ha, ta, ua] = dg(a), [hb, tb, ub] = dg(b);
  const bu = ua < ub ? 1 : 0, ru = ua + 10 * bu - ub, t0 = ta - bu, bt = t0 < tb ? 1 : 0, rt = t0 + 10 * bt - tb, rh = ha - bt - hb;
  return { ha, ta, ua, hb, tb, ub, bu, ru, t0, bt, rt, rh };
}
function colTable(op, c, k) { // k = số cột đã tính (0..3)
  const add = op === '+';
  const mark = (v) => (v ? (add ? '1' : '−1') : '');
  const rows = [
    [add ? 'nhớ' : 'mượn', k >= 2 ? mark(add ? c.ct : c.bt) : '', k >= 1 ? mark(add ? c.cu : c.bu) : '', ''],
    ['', c.ha, c.ta, c.ua],
    [op, c.hb, c.tb, c.ub],
    ['=', k >= 3 ? (add ? c.h : c.rh) : '', k >= 2 ? c.rt : '', k >= 1 ? c.ru : ''],
  ].map((r) => r.map(String));
  const hide = [];
  if (k < 3) hide.push([3, 1]);
  if (k < 2) hide.push([3, 2]);
  if (k < 1) hide.push([3, 3]);
  const col = 4 - Math.max(1, k);
  return { kind: 'table', headers: ['', 'Trăm', 'Chục', 'Đơn vị'], rows, hide, highlight: k >= 1 && k <= 3 ? [[1, col], [2, col], [3, col]] : [] };
}
function addSteps(a, b) {
  const c = addCalc(a, b), res = a + b;
  return [
    { text: `Hàng đơn vị: ${c.ua} + ${c.ub} = ${c.u}. ${c.cu ? `Viết ${c.ru}, nhớ 1 sang hàng chục.` : `Viết ${c.ru}.`}`, visual: colTable('+', c, 1) },
    { text: `Hàng chục: ${c.ta} + ${c.tb}${c.cu ? ' + 1 (nhớ)' : ''} = ${c.t}. ${c.ct ? `Viết ${c.rt}, nhớ 1 sang hàng trăm.` : `Viết ${c.rt}.`}`, visual: colTable('+', c, 2) },
    { text: `Hàng trăm: ${c.ha} + ${c.hb}${c.ct ? ' + 1 (nhớ)' : ''} = ${c.h}. Viết ${c.h}.`, visual: colTable('+', c, 3) },
    { text: `Vậy ${fmt(a)} + ${fmt(b)} = ${fmt(res)}. Ước lượng ${fmt(r100(a))} + ${fmt(r100(b))} = ${fmt(r100(a) + r100(b))} cũng gần số này.`, mark: 'good', visual: colTable('+', c, 3) },
  ];
}
function subSteps(a, b) {
  const c = subCalc(a, b), res = a - b;
  return [
    { text: c.bu ? `Hàng đơn vị: ${c.ua} bé hơn ${c.ub}, mượn 1 chục: ${c.ua + 10} − ${c.ub} = ${c.ru}. Hàng chục còn ${c.t0}.` : `Hàng đơn vị: ${c.ua} − ${c.ub} = ${c.ru}.`, visual: colTable('−', c, 1) },
    { text: c.bt ? `Hàng chục: ${c.t0} bé hơn ${c.tb}, mượn 1 trăm: ${c.t0 + 10} − ${c.tb} = ${c.rt}. Hàng trăm còn ${c.ha - 1}.` : `Hàng chục: ${c.t0} − ${c.tb} = ${c.rt}.`, visual: colTable('−', c, 2) },
    { text: `Hàng trăm: ${c.ha - c.bt} − ${c.hb} = ${c.rh}. Viết ${c.rh}.`, visual: colTable('−', c, 3) },
    { text: `Vậy ${fmt(a)} − ${fmt(b)} = ${fmt(res)}. Ước lượng ${fmt(r100(a))} − ${fmt(r100(b))} = ${fmt(r100(a) - r100(b))} cũng gần số này.`, mark: 'good', visual: colTable('−', c, 3) },
  ];
}

/* ---------- bài cố định ---------- */
const items = [
  {
    id: '7.1', src: 'S1-C23', type: 'choice',
    prompt: 'Ước lượng 526 + 195: làm tròn cả hai số đến hàng trăm rồi cộng. Cách nào đúng?',
    visual: { kind: 'sequence', items: ['526', '195', '≈ ?'], arrowLabels: ['+', ''] },
    choices: [
      { id: 'a', text: '500 + 200 = 700', correct: true },
      { id: 'b', text: '600 + 200 = 800', code: 'NỐI-TIẾP', why: '526 làm tròn thành 500, vì chữ số hàng chục là 2 (nhỏ hơn 5).' },
      { id: 'c', text: '500 + 100 = 600', code: 'QUY', why: '195 làm tròn thành 200, vì chữ số hàng chục là 9 (từ 5 trở lên thì lên).' },
      { id: 'd', text: '520 + 190 = 710', code: 'HÀNG', why: 'Có thể con đã làm tròn đến hàng chục. Đề bảo làm tròn đến hàng trăm.' },
    ],
    hint: 'Với mỗi số, nhìn chữ số hàng chục để biết lên hay giữ.',
    explain: {
      steps: [
        { text: '526: chữ số hàng chục là 2, từ 4 trở xuống nên giữ, thành 500.', visual: nlHundred(526) },
        { text: '195: chữ số hàng chục là 9, từ 5 trở lên nên lên, thành 200.', visual: nlHundred(195) },
        { text: 'Cộng hai số đã làm tròn: 500 + 200 = 700. Vậy đáp án là 500 + 200 = 700.', mark: 'good' },
      ],
    },
    tags: ['ước lượng', 'làm tròn'],
  },
  {
    id: '7.2', src: 'S1-C23', type: 'numpad',
    prompt: 'Tính 526 + 195. Ước lượng là 700, kết quả đúng phải gần số này.',
    visual: colTable('+', addCalc(526, 195), 0),
    slots: [{ label: '526 + 195 =', answer: '721', len: 3 }],
    wrongHints: [
      { match: '711', code: 'NHỚ', why: '6 + 5 = 11, viết 1 và nhớ 1 sang hàng chục. Hàng chục phải là 2 + 9 + 1 = 12.' },
      { match: '621', code: 'NHỚ', why: 'Hàng chục được 12, viết 2 và nhớ 1 sang hàng trăm: 5 + 1 + 1 = 7.' },
    ],
    hint: 'Hàng đơn vị và hàng chục đều có nhớ 1.',
    explain: { steps: addSteps(526, 195) },
    tags: ['cộng có nhớ'],
  },
  {
    id: '7.3', src: 'S1-C23', type: 'choice',
    prompt: 'Tính 621 − 282. (Ước lượng 600 − 300 = 300.)',
    visual: colTable('−', subCalc(621, 282), 0),
    choices: [
      { id: 'a', text: '339', correct: true },
      { id: 'b', text: '461', code: 'NHỚ', why: 'Hàng đơn vị 1 bé hơn 2 thì phải mượn 1 chục. Không lấy số lớn trừ số bé theo từng hàng được.' },
      { id: 'c', text: '349', code: 'NHỚ', why: 'Sau khi mượn 1 chục cho hàng đơn vị, hàng chục chỉ còn 1, không còn 2.' },
      { id: 'd', text: '439', code: 'NHỚ', why: 'Hàng chục đã mượn 1 trăm, nên hàng trăm chỉ còn 5 (không phải 6).' },
    ],
    hint: 'Hàng đơn vị: 1 không đủ trừ 2. Hãy mượn 1 chục.',
    explain: {
      steps: [
        { text: 'Ước lượng: 621 gần 600, 282 gần 300. 600 − 300 = 300, nên kết quả phải gần 300.' },
        ...subSteps(621, 282),
      ],
    },
    tags: ['trừ có mượn'],
  },
  {
    id: '7.4', src: 'T3 tr.2 C8', type: 'numpad',
    prompt: 'Tính 48 + 57 trên tia số: nhảy +60 (vì 57 gần 60), rồi nhảy −3.\na) 48 + 60 = ?   b) Kết quả cuối cùng là ?',
    visual: nlJump(48, [{ to: 108, label: '+60' }, { to: 105, label: '−3' }], 0, true),
    slots: [{ label: 'a) 48 + 60 =', answer: '108', len: 3 }, { label: 'b) Kết quả cuối:', answer: '105', len: 3 }],
    hint: '60 nhiều hơn 57 là 3. Cộng thừa 3 thì phải trừ lại 3.',
    explain: {
      steps: [
        { text: '57 gần 60 hơn, nên mình nhảy +60 trước: 48 + 60 = 108.', visual: nlJump(48, [{ to: 108, label: '+60' }, { to: 105, label: '−3' }], 1) },
        { text: '60 nhiều hơn 57 là 3. Mình đã cộng thừa 3, nên phải nhảy lùi −3: 108 − 3 = 105.', visual: nlJump(48, [{ to: 108, label: '+60' }, { to: 105, label: '−3' }], 2) },
        { text: 'Vậy 48 + 57 = 105. Ước lượng 50 + 60 = 110, gần 105.', mark: 'good' },
      ],
    },
    tags: ['tia số', 'tính nhẩm'],
  },
  {
    id: '7.5', src: 'T3 tr.1 C4', type: 'match',
    prompt: 'Mỗi ô □ là MỘT chữ số. Nối phép tính với chữ số điền vào □.',
    left: [
      { id: 'a', text: '67 + □6 = 83' },
      { id: 'b', text: '2□ + 48 = 71' },
      { id: 'c', text: '56 − 1□ = 37' },
      { id: 'd', text: '□3 − 28 = 55' },
    ],
    right: [{ id: 'r1', text: '1' }, { id: 'r3', text: '3' }, { id: 'r9', text: '9' }, { id: 'r8', text: '8' }, { id: 'r5', text: '5' }, { id: 'r19', text: '19' }],
    pairs: { a: 'r1', b: 'r3', c: 'r9', d: 'r8' },
    hint: 'Tìm cả số có □ trước (dùng phép ngược), rồi xem chữ số nào của nó là □.',
    explain: {
      steps: [
        { text: 'a) Số hạng = tổng − số kia: □6 = 83 − 67 = 16. Vậy □ = 1.', visual: { kind: 'sequence', items: ['83', '67', '16'], arrowLabels: ['−', '='], highlight: [2] } },
        { text: 'b) 2□ = 71 − 48 = 23, vậy □ = 3.', visual: { kind: 'sequence', items: ['71', '48', '23'], arrowLabels: ['−', '='], highlight: [2] } },
        { text: 'c) Số trừ = số bị trừ − hiệu: 1□ = 56 − 37 = 19. Ô □ chỉ là MỘT chữ số, nên □ = 9 (không phải 19).', mark: 'bad', visual: { kind: 'sequence', items: ['56', '37', '19'], arrowLabels: ['−', '='], highlight: [2] } },
        { text: 'd) Số bị trừ = hiệu + số trừ: □3 = 55 + 28 = 83, vậy □ = 8. Kết quả: a là 1, b là 3, c là 9, d là 8.', mark: 'good', visual: { kind: 'sequence', items: ['55', '28', '83'], arrowLabels: ['+', '='], highlight: [2] } },
      ],
    },
    tags: ['số thiếu', 'phép ngược'],
  },
  {
    id: '7.6', src: 'T3 tr.1 C6', type: 'numpad',
    prompt: 'Cách tìm số ở hình tròn: lấy số ở hình vuông nhân 2, rồi trừ số ở hình tam giác.\na) Hình vuông là 45, hình tam giác là 15. Số ở hình tròn là bao nhiêu?\nb) Hình vuông là 35, hình tròn là 30. Số ở hình tam giác là bao nhiêu?',
    visual: { kind: 'emoji', text: '🟦 × 2 − 🔺 = 🔵' },
    slots: [{ label: 'a) Hình tròn =', answer: '75', len: 3 }, { label: 'b) Hình tam giác =', answer: '40', len: 3 }],
    hint: 'Bước đầu tiên luôn là nhân đôi số ở hình vuông.',
    explain: {
      steps: [
        { text: 'Cách tìm số ở hình tròn: lấy số ở hình vuông nhân 2, rồi trừ số ở hình tam giác.', visual: { kind: 'emoji', text: '🟦 × 2 − 🔺 = 🔵' } },
        { text: 'a) 45 × 2 = 90, rồi 90 − 15 = 75. Số ở hình tròn là 75.', visual: { kind: 'sequence', items: ['45', '90', '75'], arrowLabels: ['× 2', '− 15'], highlight: [2] } },
        { text: 'b) 35 × 2 = 70. Mình có 70 − △ = 30, nên △ = 70 − 30 = 40 (số trừ = số bị trừ − hiệu).', mark: 'good', visual: { kind: 'sequence', items: ['35', '70', '30'], arrowLabels: ['× 2', '− △'], highlight: [2] } },
      ],
    },
    tags: ['quy luật', 'số thiếu'],
  },
];

const variant = {
  id: '7.7', src: '[biến thể mới]', type: 'choice',
  prompt: '□ + □ + △ = 17. Nếu △ = 5 thì □ bằng bao nhiêu?',
  hint: 'Hai ô □ bằng nhau. Hãy bỏ △ ra khỏi 17 trước.',
  choices: [
    { id: 'a', text: '6', correct: true },
    { id: 'b', text: '12', code: 'QUY', why: 'Có HAI ô □ cùng số. 12 mới là tổng của hai ô □, mỗi ô là một nửa của 12.' },
    { id: 'c', text: '11', code: 'NGƯỢC', why: 'Tổng 17 đã gồm △ = 5 rồi, nên phải TRỪ 5 chứ không cộng 5.' },
    { id: 'd', text: '5', code: 'QUY', why: '5 là số ở △. Ô □ là số khác nhé.' },
  ],
  explain: {
    steps: [
      { text: 'Có △ = 5, nên □ + □ = 17 − 5 = 12.', visual: { kind: 'sequence', items: ['17', '5', '12'], arrowLabels: ['− △', '='], highlight: [2] } },
      { text: 'Hai ô □ bằng nhau, tổng là 12. 6 + 6 = 12 nên □ = 6.', visual: { kind: 'sequence', items: ['6', '6', '12'], arrowLabels: ['+', '='], highlight: [0, 1] } },
      { text: 'Thử lại: 6 + 6 + 5 = 17. Vậy đáp án là 6.', mark: 'good' },
    ],
  },
  tags: ['số thiếu', 'biến thể'],
};

/* ---------- bộ sinh ---------- */
function genAddSub(rng, op) {
  for (let tries = 0; tries < 200; tries++) {
    if (op === '+') {
      const a = int(rng, 120, 800), b = int(rng, 110, 890);
      if (a + b > 999) continue;
      const c = addCalc(a, b);
      if (c.cu || c.ct) return { a, b };
    } else {
      const a = int(rng, 300, 999), b = int(rng, 110, 890);
      if (a - b < 100) continue;
      const c = subCalc(a, b);
      if ((c.bu || c.bt) && c.rh >= 1 && !(c.bu && c.ta === 0)) return { a, b };
    }
  }
  return op === '+' ? { a: 526, b: 195 } : { a: 621, b: 282 };
}

const OPT = { '+': '+ (cộng)', '−': '− (trừ)', '×': '× (nhân)', '÷': '÷ (chia)' };
const apply = (o, a, b) => (o === '+' ? a + b : o === '−' ? (a >= b ? a - b : null) : o === '×' ? a * b : (a % b === 0 ? a / b : null));
const noWhy = (o, a, b) => (o === '−' ? `${a} bé hơn ${b}, không trừ được.` : `${a} không chia hết cho ${b}.`);

const generators = [
  {
    id: 'g7.1', // ước lượng
    make(rng) {
      const op = pick(rng, ['+', '−']);
      let a, b;
      if (op === '+') { a = int(rng, 120, 780); b = int(rng, 110, 799 - 0); b = Math.min(b, 949 - a); if (b < 110) b = 110; }
      else { a = int(rng, 350, 949); b = int(rng, 150, a - 150); }
      const ra = r100(a), rb = r100(b);
      const comb = (x, y) => (op === '+' ? x + y : x - y);
      const right = `${fmt(ra)} ${op} ${fmt(rb)} = ${fmt(comb(ra, rb))}`;
      const flip = (x) => (r100(x) > x ? r100(x) - 100 : r100(x) + 100);
      const da = Math.floor(a / 10) % 10, db = Math.floor(b / 10) % 10;
      const txt = (x, y) => `${fmt(x)} ${op} ${fmt(y)} = ${fmt(comb(x, y))}`;
      const why1 = `${fmt(a)} làm tròn thành ${fmt(ra)}, vì chữ số hàng chục là ${da} (${da >= 5 ? 'từ 5 trở lên thì lên' : 'từ 4 trở xuống thì giữ'}).`;
      const why2 = `${fmt(b)} làm tròn thành ${fmt(rb)}, vì chữ số hàng chục là ${db} (${db >= 5 ? 'từ 5 trở lên thì lên' : 'từ 4 trở xuống thì giữ'}).`;
      const cand = [
        [flip(a), rb, 'QUY', why1],
        [ra, flip(b), 'QUY', why2],
        [r10(a), r10(b), 'HÀNG', 'Có thể con đã làm tròn đến hàng chục. Đề bảo làm tròn đến hàng trăm.'],
        [ra + 100, rb, 'QUY', why1],
        [ra, rb + 100, 'QUY', why2],
        [ra - 100, rb, 'QUY', why1],
        [ra, rb - 100, 'QUY', why2],
      ].filter(([x, y]) => x > 0 && y > 0);
      const rightVal = comb(ra, rb);
      const seenV = new Set([rightVal]);
      const pool = [];
      for (const [x, y, code, why] of cand) {
        const v = comb(x, y);
        if (seenV.has(v)) continue;
        seenV.add(v);
        pool.push({ text: txt(x, y), code, why });
      }
      const wr = distinct(pool, right, 3);
      return {
        id: 'g7.1', src: '[biến thể mới]', type: 'choice',
        prompt: `Ước lượng ${fmt(a)} ${op} ${fmt(b)}: làm tròn cả hai số đến hàng trăm rồi ${op === '+' ? 'cộng' : 'trừ'}. Cách nào đúng?`,
        choices: buildChoices(rng, right, wr),
        hint: 'Với mỗi số, nhìn chữ số hàng chục để biết lên hay giữ.',
        explain: {
          steps: [
            { text: `${fmt(a)}: chữ số hàng chục là ${da}, ${da >= 5 ? 'từ 5 trở lên nên lên' : 'từ 4 trở xuống nên giữ'}, thành ${fmt(ra)}.`, visual: nlHundred(a) },
            { text: `${fmt(b)}: chữ số hàng chục là ${db}, ${db >= 5 ? 'từ 5 trở lên nên lên' : 'từ 4 trở xuống nên giữ'}, thành ${fmt(rb)}.`, visual: nlHundred(b) },
            { text: `${op === '+' ? 'Cộng' : 'Trừ'} hai số đã làm tròn: ${right}. Vậy đáp án là ${right}.`, mark: 'good' },
          ],
        },
        meta: { a, b, op },
      };
    },
    solve(item) {
      const { a, b, op } = item.meta;
      const x = Math.round(a / 100) * 100, y = Math.round(b / 100) * 100;
      return `${fmt(x)} ${op} ${fmt(y)} = ${fmt(op === '+' ? x + y : x - y)}`;
    },
  },
  {
    id: 'g7.2', // cộng/trừ đặt dọc có nhớ/mượn
    make(rng) {
      const op = pick(rng, ['+', '−']);
      const { a, b } = genAddSub(rng, op);
      const res = op === '+' ? a + b : a - b;
      const hints = [];
      if (op === '+') {
        const c = addCalc(a, b);
        if (c.cu) hints.push({ match: String(res - 10), code: 'NHỚ', why: `${c.ua} + ${c.ub} = ${c.u}, viết ${c.ru} và nhớ 1 sang hàng chục. Con nhớ cộng thêm 1 ở hàng chục nhé.` });
        if (c.ct) hints.push({ match: String(res - 100), code: 'NHỚ', why: `Hàng chục được ${c.t}, viết ${c.rt} và nhớ 1 sang hàng trăm. Hàng trăm phải cộng thêm 1.` });
      } else {
        const c = subCalc(a, b);
        if (c.bu) hints.push({ match: String(res + 10), code: 'NHỚ', why: `Hàng đơn vị mượn 1 chục thì hàng chục chỉ còn ${c.t0}. Con nhớ bớt 1 ở hàng chục nhé.` });
        if (c.bt) hints.push({ match: String(res + 100), code: 'NHỚ', why: `Hàng chục mượn 1 trăm thì hàng trăm chỉ còn ${c.ha - 1}. Con nhớ bớt 1 ở hàng trăm nhé.` });
      }
      return {
        id: 'g7.2', src: '[biến thể mới]', type: 'numpad',
        prompt: `Tính ${fmt(a)} ${op} ${fmt(b)}. Ước lượng ${fmt(r100(a))} ${op} ${fmt(r100(b))} = ${fmt(op === '+' ? r100(a) + r100(b) : r100(a) - r100(b))}, kết quả đúng phải gần số này.`,
        visual: colTable(op, op === '+' ? addCalc(a, b) : subCalc(a, b), 0),
        slots: [{ label: `${fmt(a)} ${op} ${fmt(b)} =`, answer: String(res), len: 3 }],
        wrongHints: hints.slice(0, 2),
        hint: op === '+' ? 'Nhớ cộng số nhớ vào hàng bên cạnh.' : 'Khi mượn, hàng bên cạnh phải bớt 1.',
        explain: { steps: op === '+' ? addSteps(a, b) : subSteps(a, b) },
        meta: { a, b, op },
      };
    },
    solve(item) { const { a, b, op } = item.meta; return String(op === '+' ? a + b : a - b); },
  },
  {
    id: 'g7.3', // tia số: làm tròn rồi bù
    make(rng) {
      const op = pick(rng, ['+', '−']);
      const m = int(rng, 3, 6), d = int(rng, 1, 4);
      const b = 10 * m - d;
      const a = op === '+' ? int(rng, 21, 69) : int(rng, 10 * m + 1, 99);
      const s1 = op === '+' ? a + 10 * m : a - 10 * m;
      const fin = op === '+' ? a + b : a - b;
      const sg = op === '+' ? '+' : '−', sgBack = op === '+' ? '−' : '+';
      const jumps = [{ to: s1, label: `${sg}${10 * m}` }, { to: fin, label: `${sgBack}${d}` }];
      return {
        id: 'g7.3', src: '[biến thể mới]', type: 'numpad',
        prompt: `Tính ${a} ${op} ${b} trên tia số: nhảy ${sg}${10 * m} (vì ${b} gần ${10 * m}), rồi nhảy ${sgBack}${d}.\na) ${a} ${op} ${10 * m} = ?   b) Kết quả cuối cùng là ?`,
        visual: nlJump(a, jumps, 0, true),
        slots: [{ label: `a) ${a} ${op} ${10 * m} =`, answer: String(s1), len: 3 }, { label: 'b) Kết quả cuối:', answer: String(fin), len: 3 }],
        hint: `${10 * m} ${op === '+' ? 'nhiều' : 'nhiều'} hơn ${b} là ${d}. Mình ${op === '+' ? 'cộng thừa' : 'trừ thừa'} ${d}, nên phải ${sgBack} lại ${d}.`,
        explain: {
          steps: [
            { text: `${b} gần ${10 * m} hơn, nên mình nhảy ${sg}${10 * m} trước: ${a} ${op} ${10 * m} = ${s1}.`, visual: nlJump(a, jumps, 1) },
            { text: `${10 * m} nhiều hơn ${b} là ${d}. Mình đã ${op === '+' ? 'cộng thừa' : 'trừ thừa'} ${d}, nên phải nhảy ${sgBack}${d}: ${s1} ${sgBack} ${d} = ${fin}.`, visual: nlJump(a, jumps, 2) },
            { text: `Vậy ${a} ${op} ${b} = ${fin}.`, mark: 'good' },
          ],
        },
        meta: { a, b, op },
      };
    },
    solve(item) {
      const { a, b, op } = item.meta;
      const t = Math.ceil(b / 10) * 10;
      return `${op === '+' ? a + t : a - t}|${op === '+' ? a + b : a - b}`;
    },
  },
  {
    id: 'g7.4', // tìm dấu phép tính
    make(rng) {
      let a, b, c, op;
      for (let tries = 0; tries < 100; tries++) {
        op = pick(rng, ['+', '−', '×', '÷']);
        if (op === '+') { a = int(rng, 12, 79); b = int(rng, 11, 70); }
        else if (op === '−') { a = int(rng, 30, 99); b = int(rng, 11, a - 5); }
        else if (op === '×') { a = int(rng, 3, 9); b = int(rng, 3, 9); }
        else { b = int(rng, 3, 9); a = b * int(rng, 3, 9); }
        c = apply(op, a, b);
        if (['+', '−', '×', '÷'].filter((o) => apply(o, a, b) === c).length === 1) break;
      }
      const wrongs = ['+', '−', '×', '÷'].filter((o) => o !== op).map((o) => {
        const r = apply(o, a, b);
        return { text: OPT[o], code: 'DẤU', why: r === null ? `${noWhy(o, a, b)} Nên dấu ${o} không cho kết quả ${c}.` : `${a} ${o} ${b} = ${r}, chưa phải ${c}.` };
      });
      return {
        id: 'g7.4', src: '[ngoài tài liệu]', type: 'choice',
        prompt: `${a} □ ${b} = ${c}. Dấu nào điền vào ô □?`,
        choices: buildChoices(rng, OPT[op], wrongs),
        hint: 'Thử lần lượt từng dấu xem dấu nào cho đúng kết quả.',
        explain: {
          steps: [
            { text: 'Mình thử từng dấu: cộng, trừ, nhân, chia, xem dấu nào ra đúng kết quả.', visual: { kind: 'table', headers: ['Dấu', 'Kết quả', `Bằng ${c}?`], rows: ['+', '−', '×', '÷'].map((o) => [o, apply(o, a, b) === null ? (o === '−' ? 'không trừ được' : 'không chia hết') : `${a} ${o} ${b} = ${apply(o, a, b)}`, apply(o, a, b) === c ? 'Đúng' : 'Chưa']), highlight: [['+', '−', '×', '÷'].indexOf(op)].flatMap((r) => [[r, 0], [r, 1], [r, 2]]) } },
            { text: `Chỉ có ${a} ${op} ${b} = ${c}. Vậy dấu cần điền là ${op}.`, mark: 'good' },
          ],
        },
        meta: { a, b, c },
      };
    },
    solve(item) { const { a, b, c } = item.meta; const hit = ['+', '−', '×', '÷'].find((o) => apply(o, a, b) === c); return OPT[hit]; },
  },
  {
    id: 'g7.5', // số thiếu
    make(rng) {
      const form = pick(rng, ['T1', 'T2', 'T3', 'T4']);
      const sym = pick(rng, ['□', '○', '△']);
      let eq, ans, wrongs, steps, meta;
      if (form === 'T4') {
        const x = int(rng, 4, 19), t = int(rng, 3, 15), T = 2 * x + t;
        eq = `□ + □ + △ = ${T}. Nếu △ = ${t} thì □ bằng bao nhiêu?`;
        ans = x;
        wrongs = [
          { v: T - t, code: 'QUY', why: `${T - t} là tổng của HAI ô □. Mỗi ô □ chỉ bằng một nửa của ${T - t}.` },
          { v: (T + t) / 2, code: 'NGƯỢC', why: `Tổng ${T} đã gồm △ = ${t} rồi, nên phải TRỪ ${t} chứ không cộng.` },
          { v: t, code: 'QUY', why: `${t} là số ở △. Ô □ là số khác nhé.` },
          { v: x + 1, code: 'NHỚ', why: `Con thử lại: ${x + 1} + ${x + 1} + ${t} = ${2 * (x + 1) + t}, chưa bằng ${T}.` },
        ];
        steps = [
          { text: `Có △ = ${t}, nên □ + □ = ${T} − ${t} = ${T - t}.`, visual: { kind: 'sequence', items: [String(T), String(t), String(T - t)], arrowLabels: ['− △', '='], highlight: [2] } },
          { text: `Hai ô □ bằng nhau, tổng là ${T - t}. ${x} + ${x} = ${T - t} nên □ = ${x}.`, visual: { kind: 'sequence', items: [String(x), String(x), String(T - t)], arrowLabels: ['+', '='], highlight: [0, 1] } },
          { text: `Thử lại: ${x} + ${x} + ${t} = ${T}. Vậy đáp án là ${x}.`, mark: 'good' },
        ];
        meta = { form, T, t };
      } else if (form === 'T1') {
        const b = int(rng, 21, 69), x = int(rng, 15, 89 - b < 16 ? 16 : 89 - b), c = x + b;
        eq = `${sym} + ${b} = ${c}. Số ${sym} bằng bao nhiêu?`;
        ans = x;
        wrongs = [
          { v: c + b, code: 'NGƯỢC', why: `Số hạng chưa biết = tổng − số kia, nên phải TRỪ: ${c} − ${b}.` },
          { v: x + 10, code: 'NHỚ', why: `Thử lại: ${x + 10} + ${b} = ${x + 10 + b}, chưa bằng ${c}.` },
          { v: x - 10 > 0 ? x - 10 : x + 20, code: 'NHỚ', why: 'Thử lại bằng phép cộng: số tìm được cộng với số đã cho phải đúng bằng tổng.' },
          { v: b, code: 'QUY', why: `${b} là số đã cho. Số cần tìm là số còn thiếu.` },
        ];
        steps = [
          { text: `${sym} + ${b} = ${c}. Số hạng chưa biết = tổng − số hạng kia.`, visual: { kind: 'sequence', items: [sym, String(b), String(c)], arrowLabels: ['+', '='] } },
          { text: `${sym} = ${c} − ${b} = ${x}.`, visual: { kind: 'sequence', items: [String(c), String(b), String(x)], arrowLabels: ['−', '='], highlight: [2] } },
          { text: `Thử lại: ${x} + ${b} = ${c}. Vậy ${sym} = ${x}.`, mark: 'good' },
        ];
        meta = { form, b, c };
      } else if (form === 'T2') {
        const a = int(rng, 50, 99), x = int(rng, 12, a - 12), c = a - x;
        eq = `${a} − ${sym} = ${c}. Số ${sym} bằng bao nhiêu?`;
        ans = x;
        wrongs = [
          { v: a + c, code: 'NGƯỢC', why: `Số trừ = số bị trừ − hiệu, nên phải TRỪ: ${a} − ${c}.` },
          { v: x + 10, code: 'NHỚ', why: `Thử lại: ${a} − ${x + 10} = ${a - x - 10}, chưa bằng ${c}.` },
          { v: x - 10 > 0 ? x - 10 : x + 20, code: 'NHỚ', why: `Thử lại: ${a} trừ số tìm được phải đúng bằng ${c}.` },
          { v: c, code: 'QUY', why: `${c} là hiệu đã cho. Số cần tìm là số trừ.` },
        ];
        steps = [
          { text: `${a} − ${sym} = ${c}. Số trừ = số bị trừ − hiệu.`, visual: { kind: 'sequence', items: [String(a), sym, String(c)], arrowLabels: ['−', '='] } },
          { text: `${sym} = ${a} − ${c} = ${x}.`, visual: { kind: 'sequence', items: [String(a), String(c), String(x)], arrowLabels: ['−', '='], highlight: [2] } },
          { text: `Thử lại: ${a} − ${x} = ${c}. Vậy ${sym} = ${x}.`, mark: 'good' },
        ];
        meta = { form, a, c };
      } else {
        const b = int(rng, 21, 59), c = int(rng, 14, 60), x = b + c;
        eq = `${sym} − ${b} = ${c}. Số ${sym} bằng bao nhiêu?`;
        ans = x;
        wrongs = [
          { v: c - b > 0 ? c - b : x + 20, code: 'NGƯỢC', why: `Số bị trừ = hiệu + số trừ, nên phải CỘNG: ${c} + ${b}.` },
          { v: x + 10, code: 'NHỚ', why: `Thử lại: ${x + 10} − ${b} = ${x + 10 - b}, chưa bằng ${c}.` },
          { v: x - 10, code: 'NHỚ', why: `Thử lại: ${x - 10} − ${b} = ${x - 10 - b}, chưa bằng ${c}.` },
          { v: b, code: 'QUY', why: `${b} là số trừ đã cho. Số cần tìm là số bị trừ.` },
        ];
        steps = [
          { text: `${sym} − ${b} = ${c}. Số bị trừ = hiệu + số trừ.`, visual: { kind: 'sequence', items: [sym, String(b), String(c)], arrowLabels: ['−', '='] } },
          { text: `${sym} = ${c} + ${b} = ${x}.`, visual: { kind: 'sequence', items: [String(c), String(b), String(x)], arrowLabels: ['+', '='], highlight: [2] } },
          { text: `Thử lại: ${x} − ${b} = ${c}. Vậy ${sym} = ${x}.`, mark: 'good' },
        ];
        meta = { form, b, c };
      }
      const pool = wrongs.map((w) => ({ text: fmt(w.v), code: w.code, why: w.why }));
      const wr = distinct(pool, fmt(ans), 3);
      return {
        id: 'g7.5', src: '[biến thể mới]', type: 'choice',
        prompt: eq,
        choices: buildChoices(rng, fmt(ans), wr),
        hint: 'Dùng phép tính ngược để tìm số thiếu, rồi thử lại.',
        explain: { steps },
        meta,
      };
    },
    solve(item) {
      const m = item.meta;
      for (let x = 0; x <= 400; x++) {
        if (m.form === 'T1' && x + m.b === m.c) return fmt(x);
        if (m.form === 'T2' && m.a - x === m.c) return fmt(x);
        if (m.form === 'T3' && x - m.b === m.c) return fmt(x);
        if (m.form === 'T4' && x + x + m.t === m.T) return fmt(x);
      }
      return 'không có';
    },
  },
];

export default {
  id: 'cd07', no: 7, day: 3, title: 'Cộng, trừ: ước lượng, số thiếu, tia số', short: 'Cộng – trừ', icon: '➕',
  intro: 'Ước lượng trước, tính sau. Nhớ cộng số nhớ (hoặc bớt số mượn) vào hàng bên cạnh. Số thiếu thì dùng phép ngược.',
  remember: [
    { text: 'Ước lượng: làm tròn CẢ HAI số đến cùng một hàng (hàng trăm) rồi cộng hoặc trừ. Kết quả tính đúng phải gần ước lượng.', visual: { kind: 'table', headers: ['Số', 'Làm tròn hàng trăm'], rows: [['526', '500'], ['195', '200'], ['526 + 195 ≈', '500 + 200 = 700']] } },
    { text: 'Có nhớ hoặc mượn ở cả hàng đơn vị và hàng chục. Nhớ xong thì cộng (hoặc bớt đi) ở hàng bên cạnh.', visual: colTable('+', addCalc(526, 195), 3) },
    { text: 'Tìm số còn thiếu thì dùng phép tính ngược. Số hạng chưa biết: lấy tổng trừ số hạng kia. Số bị trừ: lấy hiệu cộng số trừ. Số trừ: lấy số bị trừ trừ đi hiệu.', visual: { kind: 'table', headers: ['Số cần tìm', 'Cách tìm'], rows: [['Số hạng', 'tổng − số kia'], ['Số bị trừ', 'hiệu + số trừ'], ['Số trừ', 'số bị trừ − hiệu']] } },
  ],
  lesson: [
    { text: 'Ước lượng 526 + 195. Làm tròn 526 đến hàng trăm: chữ số hàng chục là 2, nên giữ, thành 500.', visual: nlHundred(526) },
    { text: '195: chữ số hàng chục là 9, nên lên, thành 200. Ước lượng: 500 + 200 = 700.', visual: nlHundred(195) },
    { text: 'Tính thật bằng cách đặt dọc. Hàng đơn vị: 6 + 5 = 11, viết 1 và nhớ 1 sang hàng chục.', visual: colTable('+', addCalc(526, 195), 1) },
    { text: 'Hàng chục: 2 + 9 + 1 = 12, viết 2 nhớ 1. Hàng trăm: 5 + 1 + 1 = 7. Kết quả 721 gần ước lượng 700, rất hợp lí.', visual: colTable('+', addCalc(526, 195), 3) },
    { text: 'Tia số giúp tính nhẩm: 48 + 57 thì nhảy +60 (làm tròn 57 lên 60), rồi nhảy lùi 3. Được 105.', visual: nlJump(48, [{ to: 108, label: '+60' }, { to: 105, label: '−3' }], 2) },
    { text: 'Số thiếu thì dùng phép ngược. ○ + 48 = 71 thì ○ = 71 − 48 = 23. Thử lại: 23 + 48 = 71.', visual: { kind: 'sequence', items: ['71', '48', '23'], arrowLabels: ['−', '='], highlight: [2], anim: 'reveal' } },
  ],
  items,
  variant,
  generators,
};
