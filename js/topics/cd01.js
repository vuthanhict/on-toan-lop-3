import { pick, int, shuffle } from '../core/rng.js';

// ---- Công cụ cho bộ sinh bài (chống đoán mò) ----
const NAMES = ['Mai', 'Nam', 'Lan', 'Hùng', 'Minh', 'An', 'Bình', 'Chi', 'Dũng', 'Hà', 'Khoa', 'Linh', 'Phúc', 'Quân', 'Thảo', 'Việt'];
const cand = (v, code, why) => ({ v, w: W(f(v), code, why) });
// Chọn 3 đáp án nhiễu từ `pool` sao cho đáp án đúng có thứ hạng (bé → lớn) ngẫu nhiên đều: không bao giờ "luôn ở giữa".
function rankPick(rng, right, pool) {
  const seen = new Set([right]);
  const P = pool.filter((p) => (seen.has(p.v) ? false : (seen.add(p.v), true)));
  const lo = shuffle(rng, P.filter((p) => p.v < right)), hi = shuffle(rng, P.filter((p) => p.v > right));
  const ok = [0, 1, 2, 3].filter((r) => lo.length >= r && hi.length >= 3 - r);
  if (!ok.length) return shuffle(rng, P).slice(0, 3).map((p) => p.w);
  const r = pick(rng, ok);
  return [...lo.slice(0, r), ...hi.slice(0, 3 - r)].map((p) => p.w);
}
const isEq = (a) => a.every((x, i) => i === 0 || x - a[i - 1] === a[1] - a[0]);
const stepsOf = (a) => a.slice(1).map((x, i) => step(x - a[i]));
const TL = (a) => a.map(f).join(', ');
const seqVis = (a) => ({ kind: 'sequence', items: a, arrowLabels: stepsOf(a) });
// Dãy 5 số KHÔNG cách đều (mỗi kiểu là một lỗi nhận dạng hay gặp)
const NONEQ = {
  tri: (rng) => { const a = int(rng, 1, 30), c = int(rng, 1, 3); return [a, a + c, a + 2 * c + 1, a + 3 * c + 3, a + 4 * c + 6]; },
  dbl: (rng) => { const a = int(rng, 1, 9); return [a, 2 * a, 4 * a, 8 * a, 16 * a]; },
  tpl: (rng) => { const a = int(rng, 1, 4); return [a, 3 * a, 9 * a, 27 * a, 81 * a]; },
  alt: (rng) => { const a = int(rng, 1, 40), d = int(rng, 2, 9); return [a, a + d, a + 2 * d + 2, a + 3 * d + 2, a + 4 * d + 4]; },
  sq: (rng) => { const n = int(rng, 1, 7); return [0, 1, 2, 3, 4].map((i) => (n + i) ** 2); },
  brk: (rng) => { const a = int(rng, 1, 40), d = int(rng, 3, 9); return [a, a + d, a + 2 * d, a + 3 * d + 2, a + 4 * d]; },
  zig: (rng) => { const a = int(rng, 10, 50), d = int(rng, 2, 9); return [a, a + d, a, a + d, a]; },
};
const NONEQ_KEYS = Object.keys(NONEQ);
function eqSeq(rng) {
  const d = pick(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25]), sg = rng.next() < 0.35 ? -1 : 1;
  const a = sg > 0 ? int(rng, -15, 60) : int(rng, 10, 100);
  return [0, 1, 2, 3, 4].map((i) => a + i * sg * d);
}

const MI = '−';
const f = (n) => (n < 0 ? MI : '') + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const R = (text) => ({ text, correct: true });
const W = (text, code, why) => ({ text, code, why });
const hang = (v) => ({ 1: 'đơn vị', 10: 'chục', 100: 'trăm', 1000: 'nghìn', 10000: 'chục nghìn' }[v]);
const arrows = (n, lab) => Array.from({ length: n }, () => lab);
const step = (d) => (d > 0 ? '+' + f(d) : MI + f(Math.abs(d)));

export default {
  id: 'cd01', no: 1, day: 1, title: 'Dãy số cách đều', short: 'Dãy số', icon: '🐸',
  intro: 'Tìm "bước nhảy" giữa hai số đứng cạnh nhau, rồi nhảy tiếp như chú ếch. Qua số 0 cũng không bỏ sót!',

  remember: [
    { text: 'Lấy số đứng sau trừ số đứng trước là ra bước nhảy. Bước cộng thì đi lên, bước trừ thì đi xuống. Cứ nhảy mãi một bước như vậy.',
      visual: { kind: 'sequence', items: [5, 9, 13, 17, '?'], arrowLabels: ['+4', '+4', '+4', '+4'], anim: 'reveal' } },
    { text: 'Đi qua số 0 vẫn nhảy đúng bước: −8, −4, 0, 4. Đừng bỏ quên số 0!',
      visual: { kind: 'numberline', min: -12, max: 8, step: 1, labelEvery: 4,
        points: [{ at: -8 }, { at: -4 }, { at: 0, color: '#F5893A' }, { at: 4 }],
        jumps: [{ from: -8, to: -4, label: '+4' }, { from: -4, to: 0, label: '+4' }, { from: 0, to: 4, label: '+4' }],
        marker: { at: -8, emoji: '🐸' }, anim: 'hop' } },
    { text: 'Số chính phương là số xếp chấm tròn được thành hình vuông: 1, 4, 9, 16, 25. Mỗi số là một số nhân với chính nó, ví dụ 3 × 3 = 9.',
      visual: { kind: 'dots', pattern: 'seq', ns: [1, 2, 3, 4], colorBy: 'layer', anim: 'grow' } },
  ],

  lesson: [
    { text: 'Chú ếch đứng ở số 3 và nhảy mỗi lần một bước giống nhau: 3 → 7 → 11 → 15. Mỗi lần ếch nhảy thêm 4.',
      visual: { kind: 'numberline', min: 0, max: 20, step: 1, labelEvery: 5,
        points: [{ at: 3 }, { at: 7 }, { at: 11 }, { at: 15 }],
        jumps: [{ from: 3, to: 7, label: '+4' }, { from: 7, to: 11, label: '+4' }, { from: 11, to: 15, label: '+4' }],
        marker: { at: 3, emoji: '🐸' }, anim: 'hop' } },
    { text: 'Muốn biết bước nhảy, lấy số sau trừ số trước: 7 − 3 = 4, 11 − 7 = 4. Bước đều nhau thì dãy này cách đều. Số tiếp theo là 15 + 4 = 19.',
      visual: { kind: 'sequence', items: [3, 7, 11, 15, '?'], arrowLabels: ['+4', '+4', '+4', '+4'], highlight: [4], anim: 'reveal' } },
    { text: 'Đi xuống thì trừ. 100, 90, 80, 70: mỗi lần bớt 10, nên số đứng thứ năm là 60.',
      visual: { kind: 'sequence', items: [100, 90, 80, 70, '?'], arrowLabels: ['−10', '−10', '−10', '−10'], highlight: [4], anim: 'reveal' } },
    { text: 'Qua số 0 thì ếch vẫn nhảy +4: −8, −4, 0, 4. Có số 0 ở giữa, đừng nhảy bỏ qua nó nhé!',
      visual: { kind: 'numberline', min: -12, max: 8, step: 1, labelEvery: 4,
        points: [{ at: -8 }, { at: -4 }, { at: 0, color: '#F5893A', label: '0' }, { at: 4 }],
        jumps: [{ from: -8, to: -4, label: '+4' }, { from: -4, to: 0, label: '+4' }, { from: 0, to: 4, label: '+4' }],
        marker: { at: -8, emoji: '🐸' }, anim: 'hop' } },
    { text: 'Dãy 1, 3, 6, 10: bước nhảy là +2, +3, +4… cứ đổi hoài. Bước không đều nên đây KHÔNG phải dãy cách đều.', mark: 'bad',
      visual: { kind: 'sequence', items: [1, 3, 6, 10, '?'], arrowLabels: ['+2', '+3', '+4', '+5'], anim: 'reveal' } },
    { text: 'Số chính phương là 1, 4, 9, 16, 25. Mỗi số xếp thành hình vuông, ví dụ 3 hàng × 3 cột = 9 chấm.',
      visual: { kind: 'dots', pattern: 'seq', ns: [1, 2, 3, 4, 5], colorBy: 'layer', anim: 'grow' } },
  ],

  items: [
    {
      id: '1.1', src: 'T1 tr.1 C1', type: 'choice', layout: 'grid2',
      prompt: 'Mai đếm xuôi, mỗi lần thêm 100, bắt đầu từ 349. Số tiếp theo là số nào?',
      hint: 'Khi cộng 100, chữ số nào thay đổi?',
      choices: [
        W('359', 'HÀNG', 'Thêm 10 mới làm hàng chục tăng. Thêm 100 là hàng TRĂM tăng 1: 3 thành 4, được 449.'),
        R('449'),
        W('249', 'NGƯỢC', 'Đếm xuôi là đi lên, không phải đi xuống. 249 là số đứng trước 349 một trăm.'),
        W('339', 'HÀNG', '339 là bớt 10. Mình cần thêm 100.'),
      ],
      explain: { steps: [
        { text: 'Đếm xuôi là đi lên. Cách đều 100 nghĩa là mỗi lần cộng thêm 100.', visual: { kind: 'sequence', items: [349, '?'], arrowLabels: ['+100'] } },
        { text: 'Cộng 100 chỉ làm hàng trăm tăng thêm 1: chữ số 3 thành 4. Hàng chục và hàng đơn vị giữ nguyên (49).', visual: { kind: 'place', digits: '349', highlight: 2, showValue: true } },
        { text: 'Vậy đáp án là 449.', mark: 'good', visual: { kind: 'sequence', items: [349, 449], arrowLabels: ['+100'], highlight: [1] } },
      ] },
    },
    {
      id: '1.2', src: 'T1 tr.1 C7', type: 'choice', layout: 'grid2',
      prompt: 'Dãy số bắt đầu từ 100, mỗi lần bớt đi 10. Số đứng thứ năm trong dãy là số nào?',
      hint: 'Viết ra từng số một: thứ nhất, thứ hai, thứ ba…',
      choices: [
        W('90', 'ĐẾM', '90 mới là số đứng thứ hai. Đếm tiếp: 100, 90, 80, 70, 60.'),
        W('70', 'ĐẾM', '70 mới là số đứng thứ tư. Còn phải đếm thêm một số nữa.'),
        W('110', 'NGƯỢC', 'Dãy này bớt đi 10 mỗi lần nên các số nhỏ dần, không tăng lên.'),
        R('60'),
      ],
      explain: { steps: [
        { text: 'Số thứ nhất là 100. Mỗi lần bớt 10.', visual: { kind: 'sequence', items: [100, '?', '?', '?', '?'], arrowLabels: arrows(4, '−10'), highlight: [0] } },
        { text: 'Số thứ hai là 90, thứ ba là 80, thứ tư là 70, thứ năm là 60.', visual: { kind: 'sequence', items: [100, 90, 80, 70, 60], arrowLabels: arrows(4, '−10'), anim: 'reveal' } },
        { text: 'Vậy đáp án là 60.', mark: 'good', visual: { kind: 'sequence', items: [100, 90, 80, 70, 60], arrowLabels: arrows(4, '−10'), highlight: [4] } },
      ] },
    },
    {
      id: '1.3', src: 'S1-C1c', type: 'numpad',
      prompt: 'Điền năm số còn thiếu vào dãy cách đều:\n…, …, −12, −8, −4, …, …, …',
      hint: 'Hai số đứng cạnh nhau hơn kém nhau mấy? Rồi đi tiếp qua cả số 0.',
      visual: { kind: 'sequence', items: ['?', '?', -12, -8, -4, '?', '?', '?'] },
      slots: [
        { label: 'Số đầu tiên:', answer: '−20', allowNeg: true },
        { label: 'Số thứ hai:', answer: '−16', allowNeg: true },
        { label: 'Sau −4:', answer: '0' },
        { label: 'Tiếp theo:', answer: '4' },
        { label: 'Tiếp nữa:', answer: '8' },
      ],
      alt: { 0: ['-20'], 1: ['-16'] },
      wrongHints: [
        { match: '−8|−4|0|4|8', code: 'NGƯỢC', why: 'Các số bên trái −12 thì nhỏ hơn −12, nên phải TRỪ 4: −12 − 4 = −16.' },
        { match: '−20|−16|4|8|12', code: 'ĐẾM', why: 'Giữa −4 và 4 còn số 0. Bước nhảy là 4: −4, 0, 4, 8.' },
      ],
      explain: { steps: [
        { text: 'Đếm trên tia số: từ −12 lên −8 là 4 bước. Vậy bước nhảy là +4.', visual: { kind: 'numberline', min: -24, max: 12, step: 4, labelEvery: 4, points: [{ at: -12 }, { at: -8 }, { at: -4 }], jumps: [{ from: -12, to: -8, label: '+4' }, { from: -8, to: -4, label: '+4' }] } },
        { text: 'Đi về bên trái số −12 thì trừ 4: −12 − 4 = −16, rồi −16 − 4 = −20.', visual: { kind: 'numberline', min: -24, max: 12, step: 4, labelEvery: 4, points: [{ at: -20 }, { at: -16 }, { at: -12 }], jumps: [{ from: -20, to: -16, label: '+4' }, { from: -16, to: -12, label: '+4' }] } },
        { text: 'Đi về bên phải số −4 thì cộng 4: −4 + 4 = 0, rồi 4, rồi 8. Không bỏ số 0!', visual: { kind: 'numberline', min: -24, max: 12, step: 4, labelEvery: 4, points: [{ at: -4 }, { at: 0, color: '#F5893A' }, { at: 4 }, { at: 8 }], jumps: [{ from: -4, to: 0, label: '+4' }, { from: 0, to: 4, label: '+4' }, { from: 4, to: 8, label: '+4' }], marker: { at: -4, emoji: '🐸' }, anim: 'hop' } },
        { text: 'Vậy các số cần điền là −20, −16, 0, 4, 8.', mark: 'good', visual: { kind: 'sequence', items: [-20, -16, -12, -8, -4, 0, 4, 8], arrowLabels: arrows(7, '+4'), highlight: [0, 1, 5, 6, 7] } },
      ] },
    },
    {
      id: '1.4', src: 'T1 tr.1 C3, C4', type: 'classify',
      prompt: 'Chạm một dãy số, rồi chạm ô đúng: dãy đó CÁCH ĐỀU hay KHÔNG cách đều?',
      hint: 'Tính bước nhảy giữa từng cặp số đứng cạnh nhau xem có bằng nhau không.',
      chips: [
        { id: 'a', text: '45, 50, 55, 60, 65' },
        { id: 'b', text: '2, 3, 6, 8, 9' },
        { id: 'c', text: '2, 4, 8, 16, 32' },
        { id: 'd', text: '1, 3, 6, 10, 15' },
        { id: 'e', text: '7, 14, 21, 28, 35' },
      ],
      buckets: [{ id: 'deu', text: 'Cách đều' }, { id: 'khong', text: 'Không cách đều' }],
      answer: { a: 'deu', b: 'khong', c: 'khong', d: 'khong', e: 'deu' },
      explain: { steps: [
        { text: '45, 50, 55, 60, 65 cứ +5 mãi, còn 7, 14, 21, 28, 35 cứ +7 mãi. Bước đều nhau nên hai dãy này cách đều.', mark: 'good', visual: { kind: 'sequence', items: [45, 50, 55, 60, 65], arrowLabels: arrows(4, '+5') } },
        { text: '2, 3, 6, 8, 9 có bước +1, +3, +2, +1 là bước đổi. 2, 4, 8, 16, 32 thì mỗi số gấp đôi số trước, không phải cộng cùng một số.', mark: 'bad', visual: { kind: 'sequence', items: [2, 3, 6, 8, 9], arrowLabels: ['+1', '+3', '+2', '+1'] } },
        { text: '1, 3, 6, 10, 15 có bước +2, +3, +4, +5 tăng dần. Số tiếp theo của 1, 3, 6, 10 là 15, chứ không phải 11 hay 13.', mark: 'bad', visual: { kind: 'sequence', items: [1, 3, 6, 10, 15], arrowLabels: ['+2', '+3', '+4', '+5'] } },
        { text: 'Vậy chỉ có 45…65 và 7…35 là dãy cách đều, ba dãy còn lại thì không.' },
      ] },
    },
    {
      id: '1.5', src: 'T1 tr.2 C8', type: 'choice', layout: 'grid2',
      prompt: 'Dãy cộng 25: 25, 50, 75, 100, 125, … Số nào KHÔNG thuộc dãy này?',
      hint: 'Đếm tiếp từng bước 25 từ 125 và xem số nào không gặp.',
      choices: [
        W('175', 'ĐỌC', '175 THUỘC dãy: 125 + 25 = 150, 150 + 25 = 175. Đề hỏi số KHÔNG thuộc dãy.'),
        W('200', 'ĐỌC', '200 THUỘC dãy: 125, 150, 175, 200. Đề hỏi số KHÔNG thuộc dãy.'),
        R('235'),
        W('250', 'ĐỌC', '250 THUỘC dãy: 225 + 25 = 250. Đề hỏi số KHÔNG thuộc dãy.'),
      ],
      explain: { steps: [
        { text: 'Đếm tiếp từ 125, mỗi lần cộng 25: 150, 175, 200, 225, 250.', visual: { kind: 'numberline', min: 100, max: 275, step: 25, labelEvery: 25, points: [{ at: 125 }, { at: 150 }, { at: 175 }, { at: 200 }, { at: 225 }, { at: 250 }], jumps: [{ from: 125, to: 150, label: '+25' }, { from: 150, to: 175, label: '+25' }, { from: 175, to: 200, label: '+25' }, { from: 200, to: 225, label: '+25' }, { from: 225, to: 250, label: '+25' }], marker: { at: 125, emoji: '🐸' }, anim: 'hop' } },
        { text: 'Các số 175, 200, 250 đều gặp trong lúc đếm. Số 235 nằm giữa 225 và 250, ếch nhảy qua mà không đáp xuống.', visual: { kind: 'numberline', min: 200, max: 275, step: 25, labelEvery: 25, points: [{ at: 225 }, { at: 235, hidden: true, color: '#EC7468' }, { at: 250 }] } },
        { text: 'Vậy số KHÔNG thuộc dãy là 235.', mark: 'good' },
      ] },
    },
    {
      id: '1.6', src: 'T1 tr.1 C5', type: 'match',
      prompt: 'Nối mỗi số với hình chấm xếp thành hình vuông của số đó. Có một hình thừa.',
      hint: 'Đếm số hàng và số cột, hai số bằng nhau thì xếp được hình vuông.',
      left: [{ id: 'n9', text: '9' }, { id: 'n4', text: '4' }, { id: 'n25', text: '25' }],
      right: [
        { id: 'sq5', text: 'Chấm hình sao', visual: { kind: 'dots', pattern: 'square', n: 5, shape: 'star' } },
        { id: 'rc', text: 'Chấm hình trái tim', visual: { kind: 'dots', pattern: 'rect', rows: 3, cols: 4, shape: 'heart' } },
        { id: 'sq3', text: 'Chấm hình tròn', visual: { kind: 'dots', pattern: 'square', n: 3, shape: 'circle' } },
        { id: 'sq2', text: 'Chấm hình vuông', visual: { kind: 'dots', pattern: 'square', n: 2, shape: 'square' } },
      ],
      pairs: { n9: 'sq3', n4: 'sq2', n25: 'sq5' },
      explain: { steps: [
        { text: 'Đếm số hàng và số cột. Xếp được hình vuông khi số hàng bằng số cột: 3 × 3 = 9, 2 × 2 = 4, 5 × 5 = 25.', visual: { kind: 'dots', pattern: 'seq', ns: [2, 3, 5], colorBy: 'layer', anim: 'grow' } },
        { text: 'Hình có 3 hàng, 4 cột không phải hình vuông (3 × 4 = 12), nên hình này bị thừa.', mark: 'bad', visual: { kind: 'dots', pattern: 'rect', rows: 3, cols: 4, shape: 'heart' } },
        { text: 'Vậy 9 nối với hình 3 × 3, 4 nối với hình 2 × 2, 25 nối với hình 5 × 5.', mark: 'good' },
      ] },
    },
  ],

  variant: {
    id: '1.7', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
    prompt: 'Dãy cộng 7: 5, 12, 19, 26, … Số nào THUỘC dãy này?',
    hint: 'Dãy bắt đầu từ 5, nên hãy đếm tiếp từng bước 7.',
    choices: [
      W('50', 'ĐẾM', 'Đếm bước 7 từ 5: 33, 40, 47, 54. Không gặp 50.'),
      R('54'),
      W('56', 'QUY', '56 nằm trong dãy bắt đầu từ 7. Dãy này bắt đầu từ 5 nên không có 56.'),
      W('60', 'ĐẾM', 'Đếm bước 7 từ 5: 47, 54, 61. Không gặp 60.'),
    ],
    explain: { steps: [
      { text: 'Đếm tiếp từ 26, mỗi lần cộng 7: 33, 40, 47, 54, 61.', visual: { kind: 'sequence', items: [5, 12, 19, 26, 33, 40, 47, 54], arrowLabels: arrows(7, '+7'), anim: 'reveal' } },
      { text: 'Có cách nhanh: 54 − 5 = 49, và 49 = 7 × 7. Vậy từ 5 nhảy đúng 7 bước thì tới 54.' },
      { text: 'Vậy đáp án là 54.', mark: 'good' },
    ] },
  },

  generators: [
    {
      id: 'g1.1', covers: ['1.1'],
      make(rng) {
        const s = pick(rng, [1, -1]);
        const d = s > 0 ? pick(rng, [10, 100, 1000]) : pick(rng, [10, 100]);
        let a, right;
        for (let t = 0; t < 60; t++) {
          a = int(rng, 2100, 8999);
          right = a + s * d;
          const A = String(a), B = String(right);
          if (A.length === B.length && A.split('').filter((c, i) => c !== B[i]).length === 1) break;
        }
        const nm = s > 0 ? 'xuôi là đi lên' : 'ngược là đi xuống', vb = s > 0 ? 'thêm' : 'bớt', op = s > 0 ? 'cộng' : 'trừ', opp = s > 0 ? 'trừ' : 'cộng';
        const pool = [
          cand(a - s * d, 'NGƯỢC', `Đếm ${nm}, nên phải ${op}, không phải ${opp}.`),
          cand(a - s * d / 10, 'NGƯỢC', `Số này đi sai chiều và sai hàng. Đếm ${nm}, và ${f(d)} là hàng ${hang(d)}.`),
          cand(a + s * d / 10, 'HÀNG', `Số này ${vb} ${f(d / 10)}, là hàng ${hang(d / 10)}. Đề cho ${f(d)}, là hàng ${hang(d)}.`),
          cand(a + s * d * 10, 'HÀNG', `Số này ${vb} ${f(d * 10)}, là hàng ${hang(d * 10)}. Đề chỉ cho ${f(d)}, là hàng ${hang(d)}.`),
          cand(a + s * d * 100, 'HÀNG', `Số này ${vb} ${f(d * 100)}, nhiều hơn rất nhiều. Đề chỉ cho ${f(d)}.`),
          cand(a + s * d * 2, 'ĐẾM', `Số này ${vb} hai lần ${f(d)}. Đề chỉ nhảy MỘT bước ${f(d)}.`),
        ].filter((p) => p.v > 0);
        const choices = shuffle(rng, [R(f(right)), ...rankPick(rng, right, pool)]);
        const k = Math.round(Math.log10(d)), nmA = pick(rng, NAMES);
        const prompt = pick(rng, [
          `${nmA} đếm ${s > 0 ? 'xuôi, mỗi lần thêm' : 'ngược, mỗi lần bớt'} ${f(d)}, bắt đầu từ ${f(a)}. Số tiếp theo là số nào?`,
          `${nmA} đếm số theo dãy: bắt đầu từ ${f(a)}, cứ ${s > 0 ? 'thêm' : 'bớt'} ${f(d)} một lần. Số đứng ngay sau ${f(a)} là số nào?`,
        ]);
        return {
          id: 'g1.1', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt,
          hint: `${s > 0 ? 'Cộng' : 'Trừ'} ${f(d)} thì chữ số nào thay đổi?`,
          choices, meta: { a, d, s },
          explain: { steps: [
            { text: `Đếm ${s > 0 ? 'xuôi là đi lên, nên cộng' : 'ngược là đi xuống, nên trừ'} ${f(d)} mỗi lần.`, visual: { kind: 'sequence', items: [a, '?'], arrowLabels: [step(s * d)] } },
            { text: `${f(d)} là hàng ${hang(d)}. Chỉ chữ số ở hàng ${hang(d)} ${s > 0 ? 'tăng' : 'giảm'} 1, các hàng khác giữ nguyên.`, visual: { kind: 'place', digits: String(a), highlight: k, showValue: true } },
            { text: `Vậy đáp án là ${f(right)}.`, mark: 'good', visual: { kind: 'sequence', items: [a, right], arrowLabels: [step(s * d)], highlight: [1] } },
          ] },
        };
      },
      solve(item) { const { a, d, s } = item.meta; return f(a + s * d); },
    },
    {
      id: 'g1.2', covers: ['1.2'],
      make(rng) {
        const s = pick(rng, [1, -1]);
        const d = pick(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 50, 100]);
        const k = int(rng, 4, 8);
        const a = int(rng, d * k + 1, d * k + 80);
        const val = (j) => a + s * d * (j - 1);
        const right = val(k);
        const pool = [
          cand(val(k - 1), 'ĐẾM', `${f(val(k - 1))} mới là số đứng thứ ${k - 1}. Còn phải đếm tiếp thêm một số nữa.`),
          cand(val(k + 1), 'ĐẾM', `${f(val(k + 1))} là số đứng thứ ${k + 1}, đã đi quá một bước.`),
          cand(val(k - 2), 'ĐẾM', `${f(val(k - 2))} là số đứng thứ ${k - 2}. Còn phải đếm thêm hai số nữa.`),
          cand(val(k + 2), 'ĐẾM', `${f(val(k + 2))} là số đứng thứ ${k + 2}, đã đi quá hai bước.`),
          cand(a - s * d * (k - 1), 'NGƯỢC', `Dãy này ${s > 0 ? 'cộng thêm' : 'bớt đi'} ${f(d)} mỗi lần nên các số ${s > 0 ? 'lớn' : 'nhỏ'} dần.`),
          cand(d * k, 'QUY', `Con lấy ${f(d)} nhân với ${k}, như thể dãy bắt đầu từ 0. Nhưng dãy này bắt đầu từ ${f(a)}.`),
        ].filter((p) => p.v > 0);
        const choices = shuffle(rng, [R(f(right)), ...rankPick(rng, right, pool)]);
        const early = Array.from({ length: k }, (_, i) => (i === k - 1 ? '?' : val(i + 1)));
        const all = Array.from({ length: k }, (_, i) => val(i + 1));
        const nmA = pick(rng, NAMES), lead = [val(1), val(2), val(3)].map(f).join(', ');
        const verb = s > 0 ? 'thêm' : 'bớt đi';
        const prompt = pick(rng, [
          `Dãy số bắt đầu từ ${f(a)}, mỗi lần ${verb} ${f(d)}. Số đứng thứ ${k} trong dãy là số nào?`,
          `${nmA} xếp các thẻ số: thẻ đầu ghi ${f(a)}, mỗi thẻ sau ${s > 0 ? 'hơn' : 'kém'} thẻ trước ${f(d)}. Thẻ thứ ${k} ghi số nào?`,
          `${nmA} viết dãy ${lead}, … cứ ${verb} ${f(d)} một lần. Số đứng thứ ${k} trong dãy là số nào?`,
        ]);
        return {
          id: 'g1.2', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt,
          hint: 'Viết ra từng số một: thứ nhất, thứ hai, thứ ba…',
          choices, meta: { a, d, s, k },
          explain: { steps: [
            { text: `Số thứ nhất là ${f(a)}. Mỗi lần ${s > 0 ? 'thêm' : 'bớt'} ${f(d)}.`, visual: { kind: 'sequence', items: early, arrowLabels: arrows(k - 1, step(s * d)), highlight: [0] } },
            { text: `Từ số thứ nhất đến số thứ ${k} có ${k - 1} bước nhảy (không phải ${k} bước).`, visual: { kind: 'sequence', items: all, arrowLabels: arrows(k - 1, step(s * d)), anim: 'reveal' } },
            { text: `Vậy đáp án là ${f(right)}.`, mark: 'good', visual: { kind: 'sequence', items: all, arrowLabels: arrows(k - 1, step(s * d)), highlight: [k - 1] } },
          ] },
        };
      },
      solve(item) { const { a, d, s, k } = item.meta; return f(a + s * d * (k - 1)); },
    },
    {
      id: 'g1.3', covers: ['1.3'],
      make(rng) {
        const d = pick(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 50]);
        const k = int(rng, 2, 6);
        const desc = rng.next() < 0.4;
        const start = -d * k;
        let terms = Array.from({ length: 8 }, (_, i) => start + i * d);
        if (desc) terms = terms.reverse();
        const blanks = [0, 1, 5, 6, 7];
        const given = [2, 3, 4];
        const sg = desc ? -d : d;
        const lab = ['Số đầu tiên:', 'Số thứ hai:', 'Sau số cuối đã cho:', 'Tiếp theo:', 'Tiếp nữa:'];
        const slots = blanks.map((b, i) => {
          const s = { label: lab[i], answer: f(terms[b]) };
          if (terms[b] < 0) s.allowNeg = true;
          return s;
        });
        const alt = {};
        blanks.forEach((b, i) => { if (terms[b] < 0) alt[i] = [String(terms[b])]; });
        const items = terms.map((t, i) => (blanks.includes(i) ? '?' : t));
        const wrongL = [terms[2] + sg, terms[2] + 2 * sg].map(f);
        const wrongHints = [{ match: [wrongL[0], wrongL[1], f(terms[5]), f(terms[6]), f(terms[7])].join('|'), code: 'NGƯỢC', why: `Các số bên trái ${f(terms[2])} thì phải ${sg > 0 ? 'TRỪ' : 'CỘNG'} ${d}, không phải ${sg > 0 ? 'cộng' : 'trừ'}.` }];
        const lo = Math.min(...terms) - d, hi = Math.max(...terms) + d;
        const nl = (pts, extra = {}) => ({ kind: 'numberline', min: lo, max: hi, step: d, labelEvery: d, points: pts.map((t) => ({ at: t, color: t === 0 ? '#F5893A' : undefined })), ...extra });
        const g3 = given.map((i) => terms[i]);
        const nmA = pick(rng, NAMES);
        const lead = pick(rng, ['Điền năm số còn thiếu vào dãy cách đều:', `${nmA} viết dãy số cách đều nhưng bị nhoè mất năm số. Con điền giúp bạn nhé:`, `Con tìm năm số còn thiếu trong dãy số cách đều của ${nmA}:`]);
        return {
          id: 'g1.3', src: '[biến thể mới]', type: 'numpad',
          prompt: `${lead}\n${items.map((x) => (x === '?' ? '…' : f(x))).join(', ')}`,
          hint: 'Hai số đứng cạnh nhau hơn kém nhau mấy? Đi tiếp theo cả hai phía và nhớ số 0.',
          visual: { kind: 'sequence', items: items.map((x) => (x === '?' ? '?' : x)) },
          slots, alt, wrongHints, meta: { d, k, desc, terms },
          explain: { steps: [
            { text: `Đếm trên tia số: từ ${f(g3[0])} ${sg > 0 ? 'lên' : 'xuống'} ${f(g3[1])} là ${d} bước. Vậy bước nhảy là ${step(sg)}.`, visual: nl(g3, { jumps: [{ from: g3[0], to: g3[1], label: step(sg) }, { from: g3[1], to: g3[2], label: step(sg) }] }) },
            { text: `Đi về bên trái số ${f(g3[0])} thì ${sg > 0 ? 'trừ' : 'cộng'} ${d}: ${f(terms[1])}, rồi ${f(terms[0])}.`, visual: nl([terms[0], terms[1], ...g3], { jumps: [{ from: terms[0], to: terms[1], label: step(sg) }, { from: terms[1], to: terms[2], label: step(sg) }] }) },
            { text: `Đi về bên phải thì ${sg > 0 ? 'cộng' : 'trừ'} ${d}: ${f(terms[5])}, ${f(terms[6])}, ${f(terms[7])}.${terms.slice(5).includes(0) || terms.slice(0, 2).includes(0) ? ' Có số 0 trong dãy, đừng bỏ qua!' : ''}`, visual: nl(terms, { jumps: [{ from: terms[4], to: terms[5], label: step(sg) }, { from: terms[5], to: terms[6], label: step(sg) }, { from: terms[6], to: terms[7], label: step(sg) }], marker: { at: terms[4], emoji: '🐸' }, anim: 'hop' }) },
            { text: `Vậy các số cần điền là ${blanks.map((b) => f(terms[b])).join(', ')}.`, mark: 'good', visual: { kind: 'sequence', items: terms, arrowLabels: arrows(7, step(sg)), highlight: blanks } },
          ] },
        };
      },
      solve(item) {
        const { d, k, desc } = item.meta;
        const start = -d * k;
        let t = Array.from({ length: 8 }, (_, i) => start + i * d);
        if (desc) t = t.reverse();
        return [0, 1, 5, 6, 7].map((i) => f(t[i])).join('|');
      },
    },
    {
      // Nhận biết dãy cách đều / không cách đều (chọn một dãy)
      id: 'g1.4',
      make(rng) {
        const askEq = rng.next() < 0.5;
        const keys = shuffle(rng, NONEQ_KEYS);
        let seqs, right;
        for (let t = 0; t < 80; t++) {
          if (askEq) { right = eqSeq(rng); seqs = [right, ...keys.slice(0, 3).map((k) => NONEQ[k](rng))]; }
          else { right = NONEQ[keys[0]](rng); seqs = [right, eqSeq(rng), eqSeq(rng), eqSeq(rng)]; }
          if (new Set(seqs.map(TL)).size === 4 && seqs.every((x, i) => (i === 0) === (askEq ? isEq(x) : !isEq(x)) || (askEq ? !isEq(x) : isEq(x)))) break;
        }
        const T = TL;
        const wrongOf = (x) => (askEq
          ? W(T(x), 'QUY', `Bước nhảy là ${stepsOf(x).join(', ')}: các bước không bằng nhau nên chưa phải dãy cách đều.`)
          : W(T(x), 'ĐỌC', `Dãy này có bước ${stepsOf(x)[0]} mãi mãi, nên là dãy CÁCH ĐỀU. Đề hỏi dãy KHÔNG cách đều.`));
        const choices = shuffle(rng, [R(T(right)), ...seqs.slice(1).map(wrongOf)]);
        const other = seqs.slice(1).find((x) => (askEq ? !isEq(x) : isEq(x)));
        const nmA = pick(rng, NAMES);
        return {
          id: 'g1.4', src: '[biến thể mới]', type: 'choice', layout: 'list',
          prompt: askEq ? pick(rng, ['Dãy số nào là dãy CÁCH ĐỀU?', `${nmA} ghi bốn dãy số lên bảng. Dãy nào là dãy CÁCH ĐỀU?`]) : pick(rng, ['Dãy số nào KHÔNG phải dãy cách đều?', `${nmA} ghi bốn dãy số lên bảng. Dãy nào KHÔNG cách đều?`]),
          hint: 'Tính bước nhảy giữa từng cặp số đứng cạnh nhau, các bước phải bằng nhau.',
          choices, meta: { askEq, seqs },
          explain: { steps: [
            { text: 'Dãy cách đều là dãy có mọi bước nhảy bằng nhau. Con tính bước nhảy giữa từng cặp số đứng cạnh nhau.' },
            askEq ? { text: `Dãy ${T(right)} có bước ${stepsOf(right)[0]} mãi mãi, nên cách đều.`, mark: 'good', visual: seqVis(right) }
              : { text: `Dãy ${T(right)} có bước ${stepsOf(right).join(', ')}: không đều.`, mark: 'bad', visual: seqVis(right) },
            askEq ? { text: `Dãy ${T(other)} có bước ${stepsOf(other).join(', ')}: không đều, nên không cách đều.`, mark: 'bad', visual: seqVis(other) }
              : { text: `Dãy ${T(other)} có bước ${stepsOf(other)[0]} mãi mãi, nên cách đều.`, mark: 'good', visual: seqVis(other) },
            { text: `Vậy đáp án là ${T(right)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { askEq, seqs } = item.meta; return TL(seqs.find((x) => isEq(x) === askEq)); },
    },
    {
      // Số chính phương (chọn số xếp được hình vuông / không xếp được)
      id: 'g1.5',
      make(rng) {
        const mode = pick(rng, ['is', 'isnot']);
        const obj = pick(rng, ['viên bi', 'hạt cườm', 'quân cờ', 'chiếc cúc áo', 'viên gạch', 'con tem']);
        const nmA = pick(rng, NAMES);
        if (mode === 'is') {
          const n = int(rng, 3, 12), right = n * n;
          const pool = [
            cand(n * (n + 1), 'QUY', `${n} × ${n + 1} = ${n * (n + 1)}: hai thừa số khác nhau nên chấm chỉ xếp được hình chữ nhật, không phải hình vuông.`),
            cand(n * (n - 1), 'QUY', `${n} × ${n - 1} = ${n * (n - 1)}: hai thừa số khác nhau nên chấm chỉ xếp được hình chữ nhật, không phải hình vuông.`),
            cand(right + 1, 'QUY', `${f(right + 1)} hơn ${right} một đơn vị, nên xếp ${n} hàng ${n} cột thì thừa một chấm.`),
            cand(right - 1, 'QUY', `${f(right - 1)} kém ${right} một đơn vị, nên xếp vuông bị thiếu một chấm.`),
            cand(right + 2, 'QUY', `${f(right + 2)} hơn ${right} hai đơn vị, nên xếp ${n} hàng ${n} cột thì thừa hai chấm.`),
            cand(right - 2, 'QUY', `${f(right - 2)} kém ${right} hai đơn vị, nên xếp vuông bị thiếu hai chấm.`),
          ];
          const choices = shuffle(rng, [R(f(right)), ...rankPick(rng, right, pool)]);
          const nums = choices.map((c) => Number(c.text.replace(/ /g, '')));
          return {
            id: 'g1.5', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
            prompt: pick(rng, ['Số nào là số chính phương? Đó là số xếp chấm tròn được thành hình vuông.', `${nmA} muốn xếp ${obj} thành hình vuông đầy đủ (số hàng bằng số cột, không thừa, không thiếu). ${nmA} có số ${obj} nào dưới đây thì xếp được?`]),
            hint: 'Xếp được hình vuông thì số hàng bằng số cột, nên số chấm là một số nhân với chính nó.',
            choices, meta: { mode, nums },
            explain: { steps: [
              { text: 'Số chính phương xếp được thành hình vuông. Số hàng bằng số cột, nên số chấm là một số nhân với chính nó.' },
              { text: `${n} × ${n} = ${f(right)}, nên ${f(right)} xếp được ${n} hàng, mỗi hàng ${n} chấm.`, visual: n <= 8 ? { kind: 'dots', pattern: 'square', n, shape: 'circle', anim: 'grow' } : { kind: 'array', rows: n, cols: n, showEq: true } },
              { text: `Vậy đáp án là ${f(right)}.`, mark: 'good' },
            ] },
          };
        }
        const ns = shuffle(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).slice(0, 3);
        let v;
        do { v = int(rng, 5, 145); } while (Number.isInteger(Math.sqrt(v)));
        const sq = Math.floor(Math.sqrt(v));
        const choices = shuffle(rng, [R(f(v)), ...ns.map((n) => W(f(n * n), 'ĐỌC', `${n} × ${n} = ${n * n}, nên ${f(n * n)} xếp được hình vuông ${n} hàng ${n} cột. Đề hỏi số KHÔNG xếp được.`))]);
        const nums = [v, ...ns.map((n) => n * n)];
        return {
          id: 'g1.5', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: pick(rng, ['Số nào KHÔNG phải là số chính phương? (Số chính phương là số xếp chấm tròn được thành hình vuông.)', `${nmA} xếp ${obj} thành hình vuông đầy đủ (số hàng bằng số cột). Số ${obj} nào dưới đây KHÔNG xếp được như vậy?`]),
          hint: 'Thử xem số đó có bằng một số nhân với chính nó không.',
          choices, meta: { mode, nums },
          explain: { steps: [
            { text: 'Số chính phương là một số nhân với chính nó. Con thử xem số nào không viết được như vậy.' },
            { text: `${f(v)} nằm giữa ${sq} × ${sq} = ${sq * sq} và ${sq + 1} × ${sq + 1} = ${(sq + 1) * (sq + 1)}, không bằng số nào nhân với chính nó.`, mark: 'bad' },
            { text: `Vậy đáp án là ${f(v)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) {
        const { mode, nums } = item.meta; const isSq = (x) => Number.isInteger(Math.sqrt(x));
        return f(nums.find((x) => isSq(x) === (mode === 'is')));
      },
    },
    {
      // Phân loại dãy: cách đều / không cách đều
      id: 'g1.6', covers: ['1.4'],
      make(rng) {
        const ne = int(rng, 2, 3);
        let seqs;
        for (let t = 0; t < 80; t++) {
          const keys = shuffle(rng, NONEQ_KEYS).slice(0, 5 - ne);
          seqs = shuffle(rng, [...Array.from({ length: ne }, () => eqSeq(rng)), ...keys.map((k) => NONEQ[k](rng))]);
          if (new Set(seqs.map(TL)).size === 5) break;
        }
        const ids = ['a', 'b', 'c', 'd', 'e'];
        const chips = seqs.map((x, i) => ({ id: ids[i], text: TL(x) }));
        const answer = {}; seqs.forEach((x, i) => { answer[ids[i]] = isEq(x) ? 'deu' : 'khong'; });
        const eqs = seqs.filter(isEq), nes = seqs.filter((x) => !isEq(x));
        const nmA = pick(rng, NAMES);
        return {
          id: 'g1.6', src: '[biến thể mới]', type: 'classify',
          prompt: pick(rng, ['Chạm một dãy số, rồi chạm ô đúng: dãy đó CÁCH ĐỀU hay KHÔNG cách đều?', `${nmA} ghi năm dãy số lên bảng. Chạm một dãy số, rồi chạm ô đúng: dãy đó CÁCH ĐỀU hay KHÔNG cách đều?`]),
          hint: 'Tính bước nhảy giữa từng cặp số đứng cạnh nhau xem có bằng nhau không.',
          chips, buckets: [{ id: 'deu', text: 'Cách đều' }, { id: 'khong', text: 'Không cách đều' }], answer,
          meta: { seqs },
          explain: { steps: [
            { text: `${TL(eqs[0])} cứ ${stepsOf(eqs[0])[0]} mãi mãi, ${eqs.length > 1 ? `và ${TL(eqs[1])} cứ ${stepsOf(eqs[1])[0]} mãi mãi. ` : ''}Bước đều nhau nên ${eqs.length > 1 ? 'hai dãy này' : 'dãy này'} cách đều.`, mark: 'good', visual: seqVis(eqs[0]) },
            { text: `${TL(nes[0])} có bước ${stepsOf(nes[0]).join(', ')}: bước cứ đổi, không phải cộng cùng một số.`, mark: 'bad', visual: seqVis(nes[0]) },
            ...(nes.length > 1 ? [{ text: `${TL(nes[1])} có bước ${stepsOf(nes[1]).join(', ')}, cũng không đều.`, mark: 'bad', visual: seqVis(nes[1]) }] : []),
            { text: `Vậy có ${eqs.length} dãy cách đều, còn ${nes.length} dãy không cách đều.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const o = {}; item.meta.seqs.forEach((x, i) => { o['abcde'[i]] = isEq(x) ? 'deu' : 'khong'; }); return o; },
    },
    {
      // Số thuộc / không thuộc dãy cộng d
      id: 'g1.7', covers: ['1.5', '1.7'],
      make(rng) {
        const d = pick(rng, [3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 50]);
        const a = rng.next() < 0.4 ? d : int(rng, 1, d - 1);
        const inSeq = (x) => x >= a && (x - a) % d === 0;
        const term = (j) => a + j * d;
        const mode = pick(rng, ['in', 'out']);
        const nShow = a === d ? 5 : 4;
        const near = () => { const j = int(rng, nShow, nShow + 8), dl = int(rng, 1, d - 1); return term(j) + dl; };
        const whyOut = (v) => {
          const lo = a + Math.floor((v - a) / d) * d;
          return `Đếm bước ${d}: ${f(lo)}, ${f(lo + d)}. Dãy không gặp ${f(v)}.`;
        };
        const mkOut = (v) => (a !== d && v % d === 0
          ? W(f(v), 'QUY', `${f(v)} nằm trong dãy bắt đầu từ ${d}. Dãy này bắt đầu từ ${a}, nên không có ${f(v)}.`)
          : W(f(v), 'ĐẾM', whyOut(v)));
        const mkIn = (v) => W(f(v), 'ĐỌC', `${f(v)} THUỘC dãy: ${f(a)} + ${(v - a) / d} lần ${d} = ${f(v)}. Đề hỏi số KHÔNG thuộc dãy.`);
        let choices, right, nums;
        if (mode === 'in') {
          right = term(int(rng, nShow, nShow + 8));
          const set = new Set();
          for (let t = 0; t < 40 && set.size < 8; t++) { const v = near(); if (!inSeq(v)) set.add(v); }
          if (a !== d) set.add(d * int(rng, 3, 14));
          const pool = [...set].filter((v) => !inSeq(v)).map((v) => ({ v, w: mkOut(v) }));
          choices = [R(f(right)), ...rankPick(rng, right, pool)];
          nums = choices.map((c) => Number(c.text.replace(/ /g, '')));
        } else {
          const js = shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8].map((x) => x + nShow)).slice(0, 3);
          let v; const set = [];
          for (let t = 0; t < 40; t++) set.push(near());
          const pool = set.filter((x) => !inSeq(x)); if (a !== d) pool.push(d * int(rng, 3, 14));
          v = pick(rng, pool);
          right = v;
          choices = [R(f(v)), ...js.map((j) => mkIn(term(j)))];
          nums = [v, ...js.map(term)];
        }
        choices = shuffle(rng, choices);
        const shown = Array.from({ length: nShow }, (_, j) => f(term(j))).join(', ');
        const nmA = pick(rng, NAMES);
        const askIn = mode === 'in';
        const prompt = pick(rng, [
          `Dãy cộng ${d}: ${shown}, … Số nào ${askIn ? 'THUỘC' : 'KHÔNG thuộc'} dãy này?`,
          `${nmA} đếm cách ${d}: ${shown}, … Số nào ${askIn ? 'sẽ' : 'KHÔNG bao giờ'} gặp trong dãy này?`,
        ]);
        const tvis = Array.from({ length: 8 }, (_, j) => term(j));
        const explainTarget = askIn ? right : right;
        return {
          id: 'g1.7', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt,
          hint: `Dãy bắt đầu từ ${f(a)}, nên hãy đếm tiếp từng bước ${d}.`,
          choices, meta: { a, d, mode, nums },
          explain: { steps: [
            { text: `Đếm tiếp, mỗi lần cộng ${d}: ${tvis.slice(0, 7).map(f).join(', ')}…`, visual: { kind: 'sequence', items: tvis, arrowLabels: arrows(7, '+' + d), anim: 'reveal' } },
            askIn
              ? { text: `Có cách nhanh: ${f(right)} − ${f(a)} = ${f(right - a)}, và ${f(right - a)} = ${d} × ${(right - a) / d}. Vậy từ ${f(a)} nhảy đúng ${(right - a) / d} bước thì tới ${f(right)}.` }
              : { text: `${f(explainTarget)} nằm giữa ${f(a + Math.floor((explainTarget - a) / d) * d)} và ${f(a + Math.floor((explainTarget - a) / d) * d + d)}: ếch nhảy qua mà không đáp xuống.`, mark: 'bad' },
            { text: `Vậy đáp án là ${f(right)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { a, d, mode, nums } = item.meta; const inSeq = (x) => x >= a && (x - a) % d === 0; return f(nums.find((x) => inSeq(x) === (mode === 'in'))); },
    },
    {
      // Nối số chính phương với hình chấm xếp vuông
      id: 'g1.8', covers: ['1.6'],
      make(rng) {
        const ns = shuffle(rng, [2, 3, 4, 5, 6, 7]).slice(0, 3).sort((x, y) => x - y);
        const shapes = shuffle(rng, ['circle', 'square', 'star', 'heart']);
        const NAME = { circle: 'Chấm hình tròn', square: 'Chấm hình vuông', star: 'Chấm hình sao', heart: 'Chấm hình trái tim' };
        let rows, cols;
        do { rows = int(rng, 2, 5); cols = int(rng, 2, 7); } while (rows === cols || Number.isInteger(Math.sqrt(rows * cols)));
        const left = ns.map((n) => ({ id: 'n' + n * n, text: String(n * n) }));
        const right = [
          ...ns.map((n, i) => ({ id: 'r' + n, text: NAME[shapes[i]], visual: { kind: 'dots', pattern: 'square', n, shape: shapes[i] } })),
          { id: 'rc', text: NAME[shapes[3]], visual: { kind: 'dots', pattern: 'rect', rows, cols, shape: shapes[3] } },
        ];
        const pairs = {}; ns.forEach((n) => { pairs['n' + n * n] = 'r' + n; });
        const obj = pick(rng, ['viên bi', 'hạt cườm', 'quân cờ', 'chiếc cúc áo', 'viên gạch', 'con tem']);
        const nmA = pick(rng, NAMES);
        return {
          id: 'g1.8', src: '[biến thể mới]', type: 'match',
          prompt: pick(rng, [
            `${nmA} có các số ${left.map((l) => l.text).join(', ')}. Nối mỗi số với hình chấm xếp thành hình vuông của số đó. Có một hình thừa.`,
            `${nmA} xếp ${obj} thành các hình chấm. Nối mỗi số ${left.map((l) => l.text).join(', ')} với hình xếp vuông có đúng số chấm đó. Có một hình thừa.`,
            `Nối mỗi số ${left.map((l) => l.text).join(', ')} với hình chấm xếp thành hình vuông của số đó (hình của ${nmA}). Có một hình thừa.`,
          ]),
          hint: 'Đếm số hàng và số cột, hai số bằng nhau thì xếp được hình vuông.',
          left, right, pairs, meta: { ns },
          explain: { steps: [
            { text: `Đếm số hàng và số cột. Xếp được hình vuông khi số hàng bằng số cột: ${ns.map((n) => `${n} × ${n} = ${n * n}`).join(', ')}.`, visual: { kind: 'dots', pattern: 'seq', ns, colorBy: 'layer', anim: 'grow' } },
            { text: `Hình có ${rows} hàng, ${cols} cột không phải hình vuông (${rows} × ${cols} = ${rows * cols}), nên hình này bị thừa.`, mark: 'bad', visual: { kind: 'dots', pattern: 'rect', rows, cols, shape: shapes[3] } },
            { text: `Vậy ${ns.map((n) => `${n * n} nối với hình ${n} × ${n}`).join(', ')}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const o = {}; item.meta.ns.forEach((n) => { o['n' + n * n] = 'r' + n; }); return o; },
    },
  ],
};
