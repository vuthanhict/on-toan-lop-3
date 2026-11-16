import { pick, int, shuffle } from '../core/rng.js';

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
        points: [{ at: -8 }, { at: -4 }, { at: 0, color: '#FF8A3D' }, { at: 4 }],
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
        points: [{ at: -8 }, { at: -4 }, { at: 0, color: '#FF8A3D', label: '0' }, { at: 4 }],
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
        { text: 'Đi về bên phải số −4 thì cộng 4: −4 + 4 = 0, rồi 4, rồi 8. Không bỏ số 0!', visual: { kind: 'numberline', min: -24, max: 12, step: 4, labelEvery: 4, points: [{ at: -4 }, { at: 0, color: '#FF8A3D' }, { at: 4 }, { at: 8 }], jumps: [{ from: -4, to: 0, label: '+4' }, { from: 0, to: 4, label: '+4' }, { from: 4, to: 8, label: '+4' }], marker: { at: -4, emoji: '🐸' }, anim: 'hop' } },
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
        { text: 'Các số 175, 200, 250 đều gặp trong lúc đếm. Số 235 nằm giữa 225 và 250, ếch nhảy qua mà không đáp xuống.', visual: { kind: 'numberline', min: 200, max: 275, step: 25, labelEvery: 25, points: [{ at: 225 }, { at: 235, hidden: true, color: '#FF5C8A' }, { at: 250 }] } },
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
      id: 'g1.1',
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
        const lo = a + s * (d / 10), hi = a + s * d * 10, rev = a - s * d;
        const choices = shuffle(rng, [
          R(f(right)),
          W(f(rev), 'NGƯỢC', `Đếm ${s > 0 ? 'xuôi là đi lên' : 'ngược là đi xuống'}, nên phải ${s > 0 ? 'cộng' : 'trừ'}, không phải ${s > 0 ? 'trừ' : 'cộng'}.`),
          W(f(lo), 'HÀNG', `Số này ${s > 0 ? 'thêm' : 'bớt'} ${f(d / 10)}, là hàng ${hang(d / 10)}. Đề cho ${f(d)}, là hàng ${hang(d)}.`),
          W(f(hi), 'HÀNG', `Số này ${s > 0 ? 'thêm' : 'bớt'} ${f(d * 10)}, là hàng ${hang(d * 10)}. Đề chỉ cho ${f(d)}, là hàng ${hang(d)}.`),
        ]);
        const k = Math.round(Math.log10(d));
        return {
          id: 'g1.1', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: `Mai đếm ${s > 0 ? 'xuôi, mỗi lần thêm' : 'ngược, mỗi lần bớt'} ${f(d)}, bắt đầu từ ${f(a)}. Số tiếp theo là số nào?`,
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
      id: 'g1.2',
      make(rng) {
        const s = pick(rng, [1, -1]);
        const d = pick(rng, [5, 10, 20, 25, 50]);
        const k = int(rng, 4, 7);
        const a = d * int(rng, k + 1, k + 8);
        const val = (j) => a + s * d * (j - 1);
        const right = val(k);
        const choices = shuffle(rng, [
          R(f(right)),
          W(f(val(k - 1)), 'ĐẾM', `${f(val(k - 1))} mới là số đứng thứ ${k - 1}. Còn phải đếm tiếp thêm một số nữa.`),
          W(f(val(k + 1)), 'ĐẾM', `${f(val(k + 1))} là số đứng thứ ${k + 1}, đã đi quá một bước.`),
          W(f(a - s * d * (k - 1)), 'NGƯỢC', `Dãy này ${s > 0 ? 'cộng thêm' : 'bớt đi'} ${d} mỗi lần nên các số ${s > 0 ? 'lớn' : 'nhỏ'} dần.`),
        ]);
        const early = Array.from({ length: k }, (_, i) => (i === k - 1 ? '?' : val(i + 1)));
        const all = Array.from({ length: k }, (_, i) => val(i + 1));
        return {
          id: 'g1.2', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: `Dãy số bắt đầu từ ${f(a)}, mỗi lần ${s > 0 ? 'thêm' : 'bớt đi'} ${d}. Số đứng thứ ${k} trong dãy là số nào?`,
          hint: 'Viết ra từng số một: thứ nhất, thứ hai, thứ ba…',
          choices, meta: { a, d, s, k },
          explain: { steps: [
            { text: `Số thứ nhất là ${f(a)}. Mỗi lần ${s > 0 ? 'thêm' : 'bớt'} ${d}.`, visual: { kind: 'sequence', items: early, arrowLabels: arrows(k - 1, step(s * d)), highlight: [0] } },
            { text: `Từ số thứ nhất đến số thứ ${k} có ${k - 1} bước nhảy (không phải ${k} bước).`, visual: { kind: 'sequence', items: all, arrowLabels: arrows(k - 1, step(s * d)), anim: 'reveal' } },
            { text: `Vậy đáp án là ${f(right)}.`, mark: 'good', visual: { kind: 'sequence', items: all, arrowLabels: arrows(k - 1, step(s * d)), highlight: [k - 1] } },
          ] },
        };
      },
      solve(item) { const { a, d, s, k } = item.meta; return f(a + s * d * (k - 1)); },
    },
    {
      id: 'g1.3',
      make(rng) {
        const d = int(rng, 2, 10);
        const k = int(rng, 3, 6);
        const desc = rng.next() < 0.4;
        const start = -d * k;
        let terms = Array.from({ length: 8 }, (_, i) => start + i * d);
        if (desc) terms = terms.reverse();
        const blanks = [0, 1, 5, 6, 7];
        const given = [2, 3, 4];
        const sg = desc ? -d : d;
        const lab = ['Số đầu tiên:', 'Số thứ hai:', 'Sau số cuối đã cho:', 'Tiếp theo:', 'Tiếp nữa:'];
        const slots = blanks.map((b, i) => {
          const v = f(terms[b]);
          const s = { label: lab[i], answer: v };
          if (terms[b] < 0) s.allowNeg = true;
          return s;
        });
        const alt = {};
        blanks.forEach((b, i) => { if (terms[b] < 0) alt[i] = [String(terms[b])]; });
        const items = terms.map((t, i) => (blanks.includes(i) ? '?' : t));
        const wrongL = [terms[2] + sg, terms[2] + 2 * sg].map(f);
        const wrongHints = [{ match: [wrongL[0], wrongL[1], f(terms[5]), f(terms[6]), f(terms[7])].join('|'), code: 'NGƯỢC', why: `Các số bên trái ${f(terms[2])} thì phải ${sg > 0 ? 'TRỪ' : 'CỘNG'} ${d}, không phải ${sg > 0 ? 'cộng' : 'trừ'}.` }];
        const lo = Math.min(...terms) - d, hi = Math.max(...terms) + d;
        const nl = (pts, extra = {}) => ({ kind: 'numberline', min: lo, max: hi, step: d, labelEvery: d, points: pts.map((t) => ({ at: t, color: t === 0 ? '#FF8A3D' : undefined })), ...extra });
        const g3 = given.map((i) => terms[i]);
        return {
          id: 'g1.3', src: '[biến thể mới]', type: 'numpad',
          prompt: `Điền năm số còn thiếu vào dãy cách đều:\n${items.map((x) => (x === '?' ? '…' : f(x))).join(', ')}`,
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
      id: 'g1.4',
      make(rng) {
        const a = int(rng, 2, 40), d = int(rng, 2, 9);
        const T = (arr) => arr.map(f).join(', ');
        const eq = [0, 1, 2, 3, 4].map((i) => a + i * d);
        const tri = [a, a + 1, a + 3, a + 6, a + 10];
        const dbl = [a, 2 * a, 4 * a, 8 * a, 16 * a];
        const alt = [a, a + d, a + 2 * d + 2, a + 3 * d + 2, a + 4 * d + 4];
        const choices = shuffle(rng, [
          R(T(eq)),
          W(T(tri), 'QUY', 'Bước nhảy là +1, +2, +3, +4: cứ đổi hoài, không đều.'),
          W(T(dbl), 'QUY', 'Mỗi số gấp đôi số trước (nhân 2), không phải cộng cùng một số.'),
          W(T(alt), 'QUY', `Bước nhảy là +${d}, +${d + 2}, +${d}, +${d + 2}: hai bước đầu đã khác nhau.`),
        ]);
        return {
          id: 'g1.4', src: '[biến thể mới]', type: 'choice', layout: 'list',
          prompt: 'Dãy số nào là dãy CÁCH ĐỀU?',
          hint: 'Tính bước nhảy giữa từng cặp số đứng cạnh nhau, các bước phải bằng nhau.',
          choices, meta: { a, d },
          explain: { steps: [
            { text: 'Dãy cách đều là dãy có mọi bước nhảy bằng nhau. Mình tính bước nhảy giữa từng cặp số đứng cạnh nhau.' },
            { text: `Dãy ${T(eq)} có bước +${d} mãi mãi, nên cách đều.`, mark: 'good', visual: { kind: 'sequence', items: eq, arrowLabels: arrows(4, '+' + d) } },
            { text: `Dãy ${T(tri)} có bước +1, +2, +3, +4, còn các dãy kia cũng có bước đổi, nên không cách đều.`, mark: 'bad', visual: { kind: 'sequence', items: tri, arrowLabels: ['+1', '+2', '+3', '+4'] } },
            { text: `Vậy đáp án là ${T(eq)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { a, d } = item.meta; return [0, 1, 2, 3, 4].map((i) => f(a + i * d)).join(', '); },
    },
    {
      id: 'g1.5',
      make(rng) {
        const n = int(rng, 3, 12);
        const right = n * n;
        const choices = shuffle(rng, [
          R(f(right)),
          W(f(n * (n + 1)), 'QUY', `${n} × ${n + 1} = ${n * (n + 1)}: hai thừa số khác nhau nên chấm chỉ xếp được hình chữ nhật, không phải hình vuông.`),
          W(f(right + 1), 'QUY', `${f(right + 1)} hơn ${right} một đơn vị, không xếp đều thành ${n} hàng ${n} cột được.`),
          W(f(right - 1), 'QUY', `${f(right - 1)} kém ${right} một đơn vị, nên xếp vuông bị thiếu một chấm.`),
        ]);
        return {
          id: 'g1.5', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: 'Số nào là số chính phương? Đó là số xếp chấm tròn được thành hình vuông.',
          hint: 'Xếp được hình vuông thì số hàng bằng số cột, nên số chấm là một số nhân với chính nó.',
          choices, meta: { n },
          explain: { steps: [
            { text: 'Số chính phương xếp được thành hình vuông. Số hàng bằng số cột, nên số chấm là một số nhân với chính nó.' },
            { text: `${n} × ${n} = ${f(right)}, nên ${f(right)} xếp được ${n} hàng, mỗi hàng ${n} chấm.`, visual: n <= 8 ? { kind: 'dots', pattern: 'square', n, shape: 'circle', anim: 'grow' } : { kind: 'array', rows: n, cols: n, showEq: true } },
            { text: `Vậy đáp án là ${f(right)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { return f(item.meta.n * item.meta.n); },
    },
  ],
};
