import { pick, int, shuffle } from '../core/rng.js';

const MI = '−';
const f = (n) => (n < 0 ? MI : '') + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const R = (text) => ({ text, correct: true });
const W = (text, code, why) => ({ text, code, why });
const deg = (n) => f(n) + ' °C';
const th = (level, items, extra = {}) => ({ kind: 'thermo', min: -10, max: 10, step: 2, level, items, ...extra });
// Thành phố lạnh (có thể âm độ). Hà Nội và Đà Lạt chỉ dùng khi nhiệt độ dương, từ 5 °C trở lên.
const COLD = ['Sa Pa', 'Mát-xcơ-va', 'Xơ-un', 'Ô-xlô', 'Tô-ki-ô', 'Pa-ri', 'Hen-xin-ki', 'Am-xtéc-đam', 'Béc-lin', 'Bắc Kinh'];
const WARM_ONLY = ['Hà Nội', 'Đà Lạt'];
function twoCities(rng, tw) {
  const nc = pick(rng, COLD);
  const nw = pick(rng, [...COLD, ...(tw >= 5 ? WARM_ONLY : [])].filter((c) => c !== nc));
  return [nw, nc];
}

// ---- Công cụ cho bộ sinh bài (chống đoán mò) ----
const NAMES = ['Mai', 'Nam', 'Lan', 'Hùng', 'Minh', 'An', 'Bình', 'Chi', 'Dũng', 'Hà', 'Khoa', 'Linh', 'Phúc', 'Quân', 'Thảo', 'Việt'];
const candD = (v, code, why) => ({ v, w: W(deg(v), code, why) });
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
const thS = (sc, level, items, extra = {}) => ({ kind: 'thermo', min: sc.min, max: sc.max, step: sc.step, level, items, ...extra });
const idOf = (v) => (v < 0 ? 'm' : 'p') + Math.abs(v);
const WARM_C = ['Hà Nội', 'Huế', 'Đà Nẵng', 'Cần Thơ', 'Nha Trang', 'Hải Phòng', 'Vinh', 'Băng Cốc'];
const COOL_C = ['Tô-ki-ô', 'Xơ-un', 'Pa-ri', 'Béc-lin', 'Bắc Kinh', 'Sa Pa', 'Đà Lạt', 'Mát-xcơ-va'];
const TIMES = [['Buổi sáng', 'buổi trưa'], ['Lúc 6 giờ sáng', 'lúc 10 giờ sáng'], ['Đêm qua', 'sáng nay'], ['Chiều hôm qua', 'tối hôm qua']];
// 4–5 nhiệt độ khác nhau (có ít nhất 2 số âm và 1 số không âm)
function fewTemps(rng, n) {
  for (let t = 0; t < 300; t++) {
    const v = shuffle(rng, [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, n);
    if (v.filter((x) => x < 0).length >= 2 && v.filter((x) => x >= 0).length >= 1) return v;
  }
  return [-7, -2, 0, 5].slice(0, n);
}

export default {
  id: 'cd02', no: 2, day: 1, title: 'Số âm và nhiệt độ', short: 'Số âm', icon: '🌡️',
  intro: 'Dưới 0 là lạnh, càng thấp càng lạnh. Muốn biết "hơn bao nhiêu độ", hãy nhảy qua số 0.',

  remember: [
    { text: 'Số âm là số bé hơn 0, viết thêm dấu − ở phía trước. Trên tia số, đi sang trái thì số càng bé: −8, −5, 0, 1.',
      visual: { kind: 'numberline', min: -9, max: 2, step: 1, labelEvery: 1, points: [{ at: -8 }, { at: -5 }, { at: 0, color: '#F5893A' }, { at: 1 }], range: { from: -9, to: 0, color: '#4F6BED' } } },
    { text: 'Nhiệt độ: số lớn hơn thì ấm hơn. Vì thế −7 °C lạnh hơn 2 °C.',
      visual: th(2, [{ label: 'Mát-xcơ-va', value: -7 }, { label: 'Bắc Kinh', value: 2 }], { anim: 'rise' }) },
    { text: 'Muốn biết hơn nhau mấy độ, hãy đếm qua số 0. Từ −7 lên 0 là 7 độ, từ 0 lên 2 là 2 độ nữa. Tất cả là 9 độ.',
      visual: { kind: 'numberline', min: -8, max: 3, step: 1, labelEvery: 1, points: [{ at: -7 }, { at: 0, color: '#F5893A' }, { at: 2 }], jumps: [{ from: -7, to: 0, label: '+7' }, { from: 0, to: 2, label: '+2' }], marker: { at: -7, emoji: '🐸' }, anim: 'hop' } },
  ],

  lesson: [
    { text: 'Nhìn nhiệt kế: vạch 0 °C là chỗ nước bắt đầu đóng băng. Phía trên 0 là ấm, phía dưới 0 là lạnh.',
      visual: th(0, [{ label: 'Nước đóng băng', value: 0 }], { anim: 'rise' }) },
    { text: 'Nhiệt độ 6 °C: cột thủy ngân dâng cao hơn vạch 0, trời khá ấm.',
      visual: th(6, [{ label: '6 °C', value: 6 }], { anim: 'rise' }) },
    { text: 'Nhiệt độ −4 °C: thủy ngân tụt xuống dưới vạch 0. Mình viết dấu − phía trước và đọc là "âm bốn".',
      visual: th(-4, [{ label: '−4 °C', value: -4 }], { anim: 'rise' }) },
    { text: 'Trên tia số, số bên phải thì lớn hơn. Nên −4 < 0 < 6, và −4 bé hơn cả −2.',
      visual: { kind: 'numberline', min: -6, max: 7, step: 1, labelEvery: 1, points: [{ at: -4 }, { at: -2 }, { at: 0, color: '#F5893A' }, { at: 6 }] } },
    { text: 'Hơn nhau bao nhiêu độ? Ếch nhảy từ −3 lên 0 hết 3 bước, rồi lên 2 hết thêm 2 bước. Tất cả là 5 độ.',
      visual: { kind: 'numberline', min: -4, max: 3, step: 1, labelEvery: 1, points: [{ at: -3 }, { at: 0, color: '#F5893A' }, { at: 2 }], jumps: [{ from: -3, to: 0, label: '+3' }, { from: 0, to: 2, label: '+2' }], marker: { at: -3, emoji: '🐸' }, anim: 'hop' } },
    { text: 'Buổi sáng −3 °C, trưa tăng 5 độ: lên 0 mất 3 độ, còn 2 độ nữa nên lên 2 °C.',
      visual: th(2, [{ label: 'Sáng', value: -3 }, { label: 'Trưa', value: 2 }], { anim: 'rise' }) },
  ],

  items: [
    {
      id: '2.1', src: 'T1 tr.2 C10', type: 'choice', layout: 'list',
      prompt: 'Sắp xếp các số 0, −5, 1, −8 theo thứ tự TĂNG dần (từ bé đến lớn). Cách nào đúng?',
      hint: 'Số nằm càng bên trái trên tia số thì càng bé.',
      choices: [
        W('1, 0, −5, −8', 'ĐỌC', 'Đây là xếp GIẢM dần (từ lớn đến bé). Đề yêu cầu tăng dần.'),
        W('−5, −8, 0, 1', 'DẤU', '−8 bé hơn −5, vì −8 nằm xa số 0 hơn về phía bên trái.'),
        R('−8, −5, 0, 1'),
        W('0, −5, 1, −8', 'ĐỌC', 'Đây chính là thứ tự đề cho, chưa được sắp xếp.'),
      ],
      explain: { steps: [
        { text: 'Số âm nằm bên trái số 0. Càng xa 0 về bên trái thì càng bé: −8 nằm xa nhất nên bé nhất.', visual: { kind: 'numberline', min: -9, max: 2, step: 1, labelEvery: 1, points: [{ at: -8 }, { at: -5 }, { at: 0, color: '#F5893A' }, { at: 1 }] } },
        { text: 'Tăng dần là đọc từ trái sang phải trên tia số: −8, rồi −5, rồi 0, rồi 1.', visual: { kind: 'sequence', items: [-8, -5, 0, 1], arrowLabels: ['<', '<', '<'], anim: 'reveal' } },
        { text: 'Vậy đáp án là −8, −5, 0, 1.', mark: 'good' },
      ] },
    },
    {
      id: '2.2', src: 'T1 tr.2 C11', type: 'choice', layout: 'grid2',
      prompt: 'Mức nhiệt nào lạnh hơn 0 °C đúng 3 độ?',
      hint: 'Lạnh hơn thì thủy ngân phải đi lên hay đi xuống?',
      visual: th(0, [{ label: '0 °C', value: 0 }]),
      choices: [
        W('3 °C', 'DẤU', '3 °C ấm hơn 0 °C là 3 độ. Lạnh hơn thì phải xuống dưới số 0.'),
        R('−3 °C'),
        W('2 °C', 'DẤU', 'Số dương nghĩa là ấm hơn 0 °C.'),
        W('−2 °C', 'ĐẾM', 'Từ 0 xuống −2 mới có 2 độ. Cần xuống đủ 3 độ.'),
      ],
      explain: { steps: [
        { text: 'Lạnh hơn thì nhiệt độ đi xuống, dưới vạch 0.', visual: th(0, [{ label: '0 °C', value: 0 }]) },
        { text: 'Xuống 3 độ: 0 → −1 → −2 → −3.', visual: { kind: 'numberline', min: -4, max: 1, step: 1, labelEvery: 1, points: [{ at: 0, color: '#F5893A' }, { at: -3 }], jumps: [{ from: 0, to: -1, label: '−1' }, { from: -1, to: -2, label: '−1' }, { from: -2, to: -3, label: '−1' }], marker: { at: 0, emoji: '🐸' }, anim: 'hop' } },
        { text: 'Vậy đáp án là −3 °C.', mark: 'good', visual: th(-3, [{ label: '−3 °C', value: -3 }]) },
      ] },
    },
    {
      id: '2.3', src: 'T2 tr.2 C10', type: 'order',
      prompt: 'Xếp các nhiệt độ từ LẠNH nhất đến ấm nhất (tăng dần). Chạm lần lượt từng nhiệt độ.',
      hint: 'Thủy ngân càng thấp trên nhiệt kế thì càng lạnh.',
      visual: th(undefined, [{ label: 'A', value: 8 }, { label: 'B', value: 0 }, { label: 'C', value: -2 }, { label: 'D', value: -7 }]),
      items: [{ id: 't8', text: '8 °C' }, { id: 't0', text: '0 °C' }, { id: 'tm2', text: '−2 °C' }, { id: 'tm7', text: '−7 °C' }],
      answer: ['tm7', 'tm2', 't0', 't8'],
      wrongHints: [
        { match: ['t8', 't0', 'tm2', 'tm7'], code: 'ĐỌC', why: 'Đây là xếp từ ấm đến lạnh. Tăng dần là từ bé đến lớn, bắt đầu từ lạnh nhất.' },
        { match: ['tm2', 'tm7', 't0', 't8'], code: 'DẤU', why: '−7 nằm thấp hơn −2 trên nhiệt kế, nên −7 lạnh hơn và phải đứng trước.' },
      ],
      explain: { steps: [
        { text: 'Nhìn nhiệt kế: −7 °C thấp nhất nên lạnh nhất. 8 °C cao nhất nên ấm nhất.', visual: th(-7, [{ label: '−7 °C', value: -7 }, { label: '−2 °C', value: -2 }, { label: '0 °C', value: 0 }, { label: '8 °C', value: 8 }]) },
        { text: 'Hai số âm: −7 thấp hơn −2. Rồi đến 0, rồi đến 8.', visual: { kind: 'sequence', items: [-7, -2, 0, 8], arrowLabels: ['<', '<', '<'], anim: 'reveal' } },
        { text: 'Vậy thứ tự đúng là −7 °C, −2 °C, 0 °C, 8 °C.', mark: 'good' },
      ] },
    },
    {
      id: '2.4', src: 'S1-C8', type: 'tf', answer: false,
      prompt: 'Hôm nay Bắc Kinh 2 °C, Mát-xcơ-va −7 °C. Nam nói: "Bắc Kinh lạnh hơn Mát-xcơ-va 5 độ." Nam nói đúng hay sai?',
      hint: 'Số nào lớn hơn thì thành phố đó ấm hơn.',
      visual: { kind: 'bubble', who: 'Nam', text: 'Bắc Kinh lạnh hơn Mát-xcơ-va 5 độ.', emoji: '🧒' },
      reasons: [
        { text: 'Bắc Kinh ấm hơn Mát-xcơ-va 9 độ', correct: true },
        { text: 'Bắc Kinh ấm hơn Mát-xcơ-va 5 độ', code: 'DẤU', why: 'Con mới tính 7 − 2 = 5, như thể −7 là 7. Nhưng −7 nằm dưới số 0, nên phải đếm qua số 0: 7 + 2.' },
        { text: 'Mát-xcơ-va ấm hơn Bắc Kinh 9 độ', code: 'NGƯỢC', why: 'Số 9 đúng rồi, nhưng nói ngược chiều: 2 lớn hơn −7 nên Bắc Kinh mới là nơi ấm hơn.' },
      ],
      whyWrong: '2 lớn hơn −7, nên Bắc Kinh ấm hơn Mát-xcơ-va. Nam nói "lạnh hơn" là chưa đúng chiều.',
      explain: { steps: [
        { text: '2 °C lớn hơn −7 °C, nên Bắc Kinh ấm hơn. Nam nói "lạnh hơn" là chưa đúng.', visual: th(2, [{ label: 'Mát-xcơ-va', value: -7 }, { label: 'Bắc Kinh', value: 2 }]) },
        { text: 'Đếm số độ hơn: từ −7 lên 0 là 7 độ, từ 0 lên 2 là 2 độ nữa.', visual: { kind: 'numberline', min: -8, max: 3, step: 1, labelEvery: 1, points: [{ at: -7 }, { at: 0, color: '#F5893A' }, { at: 2 }], jumps: [{ from: -7, to: 0, label: '+7' }, { from: 0, to: 2, label: '+2' }], marker: { at: -7, emoji: '🐸' }, anim: 'hop' } },
        { text: 'Vậy Nam nói sai. Bắc Kinh ấm hơn Mát-xcơ-va 7 + 2 = 9 độ.', mark: 'good' },
      ] },
    },
    {
      id: '2.5', src: 'S1-C27d', type: 'tf', answer: false,
      prompt: 'Tô-ki-ô 13 °C, Hà Nội 26 °C. Hùng nói: "Tô-ki-ô ấm hơn Hà Nội 13 độ." Hùng nói đúng hay sai?',
      hint: 'Thành phố nào có số lớn hơn thì ấm hơn.',
      visual: { kind: 'bubble', who: 'Hùng', text: 'Tô-ki-ô ấm hơn Hà Nội 13 độ.', emoji: '🧒' },
      whyWrong: 'Số 13 thì đúng, nhưng Hùng nói ngược chiều. 26 lớn hơn 13 nên Hà Nội mới là nơi ấm hơn.',
      explain: { steps: [
        { text: '26 lớn hơn 13, nên Hà Nội ấm hơn Tô-ki-ô, không phải ngược lại.', visual: { kind: 'numberline', min: 0, max: 30, step: 1, labelEvery: 5, points: [{ at: 13 }, { at: 26 }], jumps: [{ from: 13, to: 26, label: '+13' }] } },
        { text: 'Ấm hơn bao nhiêu độ: 26 − 13 = 13 độ.' },
        { text: 'Vậy Hùng nói sai: Hà Nội ấm hơn Tô-ki-ô 13 độ.', mark: 'good' },
      ] },
    },
    {
      id: '2.6', src: '[biến thể mới]', type: 'numpad',
      prompt: 'Buổi sáng nhiệt độ là −3 °C. Buổi trưa nhiệt độ tăng thêm 5 độ. Nhiệt độ buổi trưa là bao nhiêu độ C?',
      hint: 'Từ −3 lên tới 0 mất mấy độ? Còn thừa mấy độ nữa?',
      visual: th(-3, [{ label: 'Sáng', value: -3 }]),
      slots: [{ label: 'Buổi trưa:', answer: '2', unit: '°C', allowNeg: true }],
      wrongHints: [
        { match: '−8', code: 'NGƯỢC', why: 'Tăng nghĩa là đi LÊN, không phải đi xuống.' },
        { match: '8', code: 'DẤU', why: 'Con nhớ giữ dấu âm: −3 nằm dưới số 0.' },
        { match: '−2', code: 'DẤU', why: '5 − 3 = 2, và mình đã vượt qua số 0, nên kết quả là số dương.' },
      ],
      explain: { steps: [
        { text: 'Từ −3 lên tới 0 mất 3 độ.', visual: { kind: 'numberline', min: -4, max: 4, step: 1, labelEvery: 1, points: [{ at: -3 }, { at: 0, color: '#F5893A' }], jumps: [{ from: -3, to: 0, label: '+3' }], marker: { at: -3, emoji: '🐸' }, anim: 'hop' } },
        { text: 'Còn 5 − 3 = 2 độ nữa thì lên từ 0 tới 2.', visual: { kind: 'numberline', min: -4, max: 4, step: 1, labelEvery: 1, points: [{ at: -3 }, { at: 0, color: '#F5893A' }, { at: 2 }], jumps: [{ from: -3, to: 0, label: '+3' }, { from: 0, to: 2, label: '+2' }] } },
        { text: 'Vậy nhiệt độ buổi trưa là 2 °C.', mark: 'good', visual: th(2, [{ label: 'Sáng', value: -3 }, { label: 'Trưa', value: 2 }]) },
      ] },
    },
  ],

  variant: {
    id: '2.7', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
    prompt: 'Bốn ngày có nhiệt độ −4 °C, 3 °C, −9 °C, 0 °C. Ngày nào lạnh thứ hai, tức là lạnh ngay sau ngày lạnh nhất?',
    hint: 'Xếp bốn nhiệt độ từ lạnh đến ấm trước.',
    choices: [
      W('−9 °C', 'ĐỌC', 'Đó là ngày lạnh NHẤT. Đề hỏi ngày lạnh thứ hai.'),
      R('−4 °C'),
      W('0 °C', 'DẤU', '0 °C ấm hơn −4 °C, nên đứng sau −4 °C.'),
      W('3 °C', 'DẤU', '3 °C là ngày ấm nhất.'),
    ],
    explain: { steps: [
      { text: 'Xếp từ lạnh đến ấm: −9, −4, 0, 3.', visual: th(undefined, [{ label: '−9', value: -9 }, { label: '−4', value: -4 }, { label: '0', value: 0 }, { label: '3', value: 3 }]) },
      { text: 'Ngày lạnh nhất là −9 °C. Ngày lạnh thứ hai là số đứng ngay sau nó: −4 °C.', visual: { kind: 'sequence', items: [-9, -4, 0, 3], highlight: [1] } },
      { text: 'Vậy đáp án là −4 °C.', mark: 'good' },
    ] },
  },

  generators: [
    {
      id: 'g2.1', covers: ['2.1'],
      make(rng) {
        for (let tries = 0; tries < 200; tries++) {
          const pool = shuffle(rng, [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
          const nums = pool.slice(0, 4);
          if (nums.filter((x) => x < 0).length < 2 || nums.filter((x) => x >= 0).length < 1) continue;
          const asc = rng.next() < 0.6;
          const sorted = nums.slice().sort((x, y) => (asc ? x - y : y - x));
          const opp = sorted.slice().reverse();
          const byAbs = nums.slice().sort((x, y) => (asc ? Math.abs(x) - Math.abs(y) : Math.abs(y) - Math.abs(x)));
          const orig = nums.slice();
          const key = (a) => a.join(',');
          if (new Set([key(sorted), key(opp), key(byAbs), key(orig)]).size < 4) continue;
          const T = (a) => a.map(f).join(', ');
          const choices = shuffle(rng, [
            R(T(sorted)),
            W(T(opp), 'ĐỌC', `Đây là xếp ${asc ? 'GIẢM' : 'TĂNG'} dần. Đề yêu cầu ${asc ? 'tăng' : 'giảm'} dần.`),
            W(T(byAbs), 'DẤU', 'Con đã so sánh như số không có dấu. Số âm càng xa 0 thì càng bé.'),
            W(T(orig), 'ĐỌC', 'Đây chính là thứ tự đề cho, chưa được sắp xếp.'),
          ]);
          const lo = Math.min(...nums) - 1, hi = Math.max(...nums) + 1;
          return {
            id: 'g2.1', src: '[biến thể mới]', type: 'choice', layout: 'list',
            prompt: `Sắp xếp các số ${T(nums)} theo thứ tự ${asc ? 'TĂNG dần (từ bé đến lớn)' : 'GIẢM dần (từ lớn đến bé)'}. Cách nào đúng?`,
            hint: 'Số nằm càng bên trái trên tia số thì càng bé.',
            choices, meta: { nums, asc },
            explain: { steps: [
              { text: 'Số âm nằm bên trái số 0, càng xa 0 càng bé. Số dương nằm bên phải.', visual: { kind: 'numberline', min: lo, max: hi, step: 1, labelEvery: 1, points: nums.map((x) => ({ at: x, color: x === 0 ? '#F5893A' : undefined })) } },
              { text: `${asc ? 'Tăng dần là đọc từ trái sang phải' : 'Giảm dần là đọc từ phải sang trái'} trên tia số.`, visual: { kind: 'sequence', items: sorted, arrowLabels: arrowsOf(3, asc ? '<' : '>'), anim: 'reveal' } },
              { text: `Vậy đáp án là ${T(sorted)}.`, mark: 'good' },
            ] },
          };
        }
        throw new Error('g2.1 không sinh được');
      },
      solve(item) {
        const { nums, asc } = item.meta;
        return nums.slice().sort((x, y) => (asc ? x - y : y - x)).map(f).join(', ');
      },
    },
    {
      id: 'g2.2',
      make(rng) {
        for (let tries = 0; tries < 200; tries++) {
          const tw = int(rng, 1, 9), tc = -int(rng, 1, 9);
          const diff = tw - tc, amt = Math.abs(tw - Math.abs(tc));
          if (amt === 0 || amt === diff) continue;
          const [nw, nc] = twoCities(rng, tw);
          const order = rng.next() < 0.5;
          const left = order ? [nw, tw] : [nc, tc], right = order ? [nc, tc] : [nw, tw];
          const choices = shuffle(rng, [
            R(`${nw} ấm hơn ${diff} độ`),
            W(`${nc} ấm hơn ${diff} độ`, 'NGƯỢC', `Số độ ${diff} đúng, nhưng nói ngược chiều: ${f(tw)} lớn hơn ${f(tc)} nên ${nw} mới ấm hơn.`),
            W(`${nw} ấm hơn ${amt} độ`, 'DẤU', `Con mới tính ${Math.max(tw, Math.abs(tc))} − ${Math.min(tw, Math.abs(tc))} = ${amt}, như thể ${f(tc)} là ${Math.abs(tc)}. Nhưng ${f(tc)} nằm dưới số 0, nên phải đếm qua số 0: ${Math.abs(tc)} + ${tw}.`),
            W(`${nc} ấm hơn ${amt} độ`, 'DẤU', `Con coi ${f(tc)} như ${Math.abs(tc)}, và cũng nói ngược chiều. ${f(tw)} lớn hơn ${f(tc)} nên ${nw} ấm hơn.`),
          ]);
          return {
            id: 'g2.2', src: '[biến thể mới]', type: 'choice', layout: 'list',
            prompt: `${left[0]} ${deg(left[1])}, ${right[0]} ${deg(right[1])}. Thành phố nào ấm hơn, và ấm hơn bao nhiêu độ?`,
            hint: 'Đếm số độ từ nhiệt độ thấp lên nhiệt độ cao, đi qua số 0.',
            choices, meta: { tw, tc, nw, nc },
            explain: { steps: [
              { text: `${f(tw)} lớn hơn ${f(tc)} nên ${nw} ấm hơn ${nc}.`, visual: th(tw, [{ label: nc, value: tc }, { label: nw, value: tw }]) },
              { text: `Đếm độ: từ ${f(tc)} lên 0 là ${Math.abs(tc)} độ, từ 0 lên ${tw} là ${tw} độ nữa.`, visual: { kind: 'numberline', min: tc - 1, max: tw + 1, step: 1, labelEvery: 1, points: [{ at: tc }, { at: 0, color: '#F5893A' }, { at: tw }], jumps: [{ from: tc, to: 0, label: '+' + Math.abs(tc) }, { from: 0, to: tw, label: '+' + tw }], marker: { at: tc, emoji: '🐸' }, anim: 'hop' } },
              { text: `Vậy ${nw} ấm hơn ${nc} ${Math.abs(tc)} + ${tw} = ${diff} độ.`, mark: 'good' },
            ] },
          };
        }
        throw new Error('g2.2');
      },
      solve(item) { const { tw, tc, nw } = item.meta; return `${nw} ấm hơn ${tw + Math.abs(tc)} độ`; },
    },
    {
      id: 'g2.3',
      make(rng) {
        const up = rng.next() < 0.5;
        let s, c;
        if (up) { s = -int(rng, 2, 9); c = int(rng, -s + 1, -s + 9); } else { s = int(rng, 2, 9); c = int(rng, s + 1, s + 9); }
        const dsig = up ? c : -c;
        const right = s + dsig;
        const pool = up
          ? [candD(s - dsig, 'NGƯỢC', 'Tăng là đi LÊN, không phải đi xuống.'),
            candD(Math.abs(s) + c, 'DẤU', `Con nhớ giữ dấu âm: ${f(s)} nằm dưới số 0.`),
            candD(-right, 'DẤU', `${c} − ${Math.abs(s)} = ${right} và mình đã vượt qua số 0, nên kết quả là số dương.`),
            candD(c, 'ĐẾM', `Đây chỉ là số độ tăng thêm. Con phải bắt đầu từ ${f(s)} rồi mới tăng.`),
            candD(right + 1, 'ĐẾM', 'Con đếm lệch một độ. Từ vạch 0 phải đếm đủ số độ còn lại.'),
            candD(right - 1, 'ĐẾM', 'Con đếm lệch một độ. Từ vạch 0 phải đếm đủ số độ còn lại.'),
            candD(s, 'ĐỌC', 'Đây là nhiệt độ lúc đầu. Đề hỏi nhiệt độ sau khi đã tăng.')]
          : [candD(s + c, 'NGƯỢC', 'Giảm là đi XUỐNG, không phải đi lên.'),
            candD(-right, 'DẤU', `${c} − ${s} = ${-right}, nhưng mình đã xuống qua số 0, nên kết quả là số âm.`),
            candD(-(s + c), 'DẤU', `${s} nằm TRÊN số 0 nên giảm là ${s} − ${c}, không phải −${s} − ${c}.`),
            candD(-c, 'ĐẾM', `Đây chỉ là số độ giảm. Con phải bắt đầu từ ${f(s)} rồi mới giảm.`),
            candD(right + 1, 'ĐẾM', 'Con đếm lệch một độ. Từ vạch 0 phải đếm đủ số độ còn lại.'),
            candD(right - 1, 'ĐẾM', 'Con đếm lệch một độ. Từ vạch 0 phải đếm đủ số độ còn lại.'),
            candD(s, 'ĐỌC', 'Đây là nhiệt độ lúc đầu. Đề hỏi nhiệt độ sau khi đã giảm.')];
        const choices = shuffle(rng, [R(deg(right)), ...rankPick(rng, right, pool)]);
        const lo = Math.min(s, right) - 1, hi = Math.max(s, right) + 1;
        const [t0, t1] = pick(rng, TIMES), city = pick(rng, COLD);
        return {
          id: 'g2.3', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: `${t0} ở ${city}, nhiệt độ là ${deg(s)}. Đến ${t1}, nhiệt độ ${up ? 'tăng' : 'giảm'} thêm ${c} độ. Nhiệt độ lúc đó là bao nhiêu?`,
          hint: `${up ? 'Tăng' : 'Giảm'} nghĩa là đi ${up ? 'lên' : 'xuống'}. Đi tới vạch 0 mất mấy độ?`,
          choices, meta: { s, c, up },
          explain: { steps: [
            { text: `Từ ${f(s)} ${up ? 'lên' : 'xuống'} tới 0 mất ${Math.abs(s)} độ.`, visual: { kind: 'numberline', min: lo, max: hi, step: 1, labelEvery: 1, points: [{ at: s }, { at: 0, color: '#F5893A' }], jumps: [{ from: s, to: 0, label: (up ? '+' : MI) + Math.abs(s) }], marker: { at: s, emoji: '🐸' }, anim: 'hop' } },
            { text: `Còn ${c} − ${Math.abs(s)} = ${c - Math.abs(s)} độ nữa, ${up ? 'đi lên' : 'đi xuống'} tới ${f(right)}.`, visual: { kind: 'numberline', min: lo, max: hi, step: 1, labelEvery: 1, points: [{ at: s }, { at: 0, color: '#F5893A' }, { at: right }], jumps: [{ from: s, to: 0, label: (up ? '+' : MI) + Math.abs(s) }, { from: 0, to: right, label: (up ? '+' : MI) + Math.abs(right) }] } },
            { text: `Vậy nhiệt độ lúc đó là ${deg(right)}.`, mark: 'good', visual: th(right, [{ label: 'Trước', value: s }, { label: 'Sau', value: right }]) },
          ] },
        };
      },
      solve(item) { const { s, c, up } = item.meta; return deg(s + (up ? c : -c)); },
    },
    {
      // Đọc nhiệt kế (nhiều thang chia)
      id: 'g2.4',
      make(rng) {
        const sc = pick(rng, [
          { min: -10, max: 10, step: 2, vals: [-8, -6, -4, -2, 2, 4, 6, 8] },
          { min: -20, max: 20, step: 5, vals: [-15, -10, -5, 5, 10, 15] },
          { min: -12, max: 12, step: 3, vals: [-9, -6, -3, 3, 6, 9] },
          { min: -30, max: 30, step: 10, vals: [-20, -10, 10, 20] },
        ]);
        const t = pick(rng, sc.vals), st = sc.step;
        const inR = (v) => v >= sc.min && v <= sc.max;
        const lab = `Mỗi vạch có ghi số cách nhau ${st} độ. Đọc theo số ghi trên vạch.`;
        const pool = [
          candD(-t, 'DẤU', `Nhìn lại: thủy ngân ${t > 0 ? 'ở TRÊN' : 'ở DƯỚI'} vạch 0, nên nhiệt độ là số ${t > 0 ? 'dương' : 'âm'}.`),
          candD(t + st, 'ĐẾM', 'Con đọc lệch một vạch. ' + lab),
          candD(t - st, 'ĐẾM', 'Con đọc lệch một vạch. ' + lab),
          candD(t + 2 * st, 'ĐẾM', 'Con đọc lệch hai vạch. ' + lab),
          candD(t - 2 * st, 'ĐẾM', 'Con đọc lệch hai vạch. ' + lab),
          candD(t + 1, 'ĐẾM', 'Thủy ngân dừng đúng ở vạch có ghi số. ' + lab),
          candD(t - 1, 'ĐẾM', 'Thủy ngân dừng đúng ở vạch có ghi số. ' + lab),
        ].filter((p) => inR(p.v) && p.v !== 0);
        const choices = shuffle(rng, [R(deg(t)), ...rankPick(rng, t, pool)]);
        const city = pick(rng, COLD), nmA = pick(rng, NAMES);
        return {
          id: 'g2.4', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: pick(rng, ['Nhìn nhiệt kế. Thủy ngân đang chỉ bao nhiêu độ?', `Nhiệt kế đặt ngoài trời ở ${city}. Thủy ngân đang chỉ bao nhiêu độ?`, `${nmA} đọc nhiệt kế ở ${city}. Con xem giúp bạn: thủy ngân chỉ bao nhiêu độ?`]),
          hint: 'Thủy ngân ở trên hay ở dưới vạch 0?',
          visual: { kind: 'thermo', min: sc.min, max: sc.max, step: st, items: [{ label: '?', value: t }], showValue: false },
          choices, meta: { t },
          explain: { steps: [
            { text: `Thủy ngân ${t > 0 ? 'ở trên' : 'ở dưới'} vạch 0, nên nhiệt độ là số ${t > 0 ? 'dương' : 'âm'}.`, visual: thS(sc, t, undefined) },
            { text: `Đếm từ vạch 0 ${t > 0 ? 'lên' : 'xuống'}, mỗi vạch ${st} độ: cột thủy ngân dừng ở ${f(t)}.`, visual: thS(sc, t, [{ label: deg(t), value: t }]) },
            { text: `Vậy nhiệt độ là ${deg(t)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { return deg(item.meta.t); },
    },
    {
      // Đúng/Sai: hai thành phố, một âm một dương (50% đúng)
      id: 'g2.5', covers: ['2.4'],
      make(rng) {
        for (let tries = 0; tries < 200; tries++) {
          const tw = int(rng, 1, 9), tc = -int(rng, 1, 9);
          const diff = tw - tc, amt = Math.abs(tw - Math.abs(tc));
          if (amt === 0 || amt === diff) continue;
          const [nw, nc] = twoCities(rng, tw);
          const truth = rng.next() < 0.5;
          const kind = truth ? pick(rng, ['warm', 'cold']) : pick(rng, ['revWarm', 'revCold', 'amtWarm', 'amtCold']);
          const stm = { warm: [nw, 'ấm', diff], cold: [nc, 'lạnh', diff], revWarm: [nc, 'ấm', diff], revCold: [nw, 'lạnh', diff], amtWarm: [nw, 'ấm', amt], amtCold: [nc, 'lạnh', amt] }[kind];
          const other = stm[0] === nw ? nc : nw;
          const text = `${stm[0]} ${stm[1]} hơn ${other} ${stm[2]} độ.`;
          const subjWarm = stm[0] === nw;
          const speaker = pick(rng, NAMES);
          const reasons = shuffle(rng, [
            { text: `${nw} ấm hơn ${nc} ${diff} độ`, correct: true },
            { text: `${nc} ấm hơn ${nw} ${diff} độ`, code: 'NGƯỢC', why: `${f(tw)} lớn hơn ${f(tc)}, nên ${nw} mới là nơi ấm hơn.` },
            { text: `${nw} ấm hơn ${nc} ${amt} độ`, code: 'DẤU', why: `Con mới tính ${Math.max(tw, Math.abs(tc))} − ${Math.min(tw, Math.abs(tc))} = ${amt}, như thể ${f(tc)} là ${Math.abs(tc)}. Nhưng ${f(tc)} nằm dưới số 0, nên phải đếm qua số 0: ${Math.abs(tc)} + ${tw} = ${diff}.` },
          ]);
          const whyWrong = truth ? `Con thử đếm lại: từ ${f(tc)} lên 0 là ${Math.abs(tc)}, từ 0 lên ${tw} thêm ${tw}, được ${diff} độ. Lời nói này đúng.`
            : kind.startsWith('amt') ? `Con đếm qua số 0: từ ${f(tc)} lên 0 là ${Math.abs(tc)}, từ 0 lên ${tw} thêm ${tw}, được ${diff} độ, không phải ${amt} độ.`
              : `${f(tw)} lớn hơn ${f(tc)}, nên ${nw} ấm hơn ${nc} ${diff} độ. Bạn trong đề nói ngược chiều.`;
          return {
            id: 'g2.5', src: '[biến thể mới]', type: 'tf', answer: truth,
            prompt: `${nw} ${deg(tw)}, ${nc} ${deg(tc)}. ${speaker} nói: "${text}" ${speaker} nói đúng hay sai?`,
            hint: 'Số nào lớn hơn thì ấm hơn. Rồi đếm số độ qua số 0.',
            visual: { kind: 'bubble', who: speaker, text, emoji: '🧒' },
            reasons, whyWrong,
            meta: { tw, tc, subjWarm, verb: stm[1], n: stm[2] },
            explain: { steps: [
              { text: `${f(tw)} lớn hơn ${f(tc)}, nên ${nw} ấm hơn ${nc}, và ${nc} lạnh hơn ${nw}.`, visual: th(tw, [{ label: nc, value: tc }, { label: nw, value: tw }]) },
              { text: `Đếm số độ: từ ${f(tc)} lên 0 là ${Math.abs(tc)}, từ 0 lên ${tw} là ${tw}. Tổng ${Math.abs(tc)} + ${tw} = ${diff} độ.`, visual: { kind: 'numberline', min: tc - 1, max: tw + 1, step: 1, labelEvery: 1, points: [{ at: tc }, { at: 0, color: '#F5893A' }, { at: tw }], jumps: [{ from: tc, to: 0, label: '+' + Math.abs(tc) }, { from: 0, to: tw, label: '+' + tw }] } },
              { text: truth ? `Vậy ${speaker} nói đúng.` : `Vậy ${speaker} nói sai: ${nw} ấm hơn ${nc} ${diff} độ.`, mark: 'good' },
            ] },
          };
        }
        throw new Error('g2.5');
      },
      solve(item) { const { tw, tc, subjWarm, verb, n } = item.meta; return String((verb === 'ấm') === subjWarm && n === tw - tc); },
    },
    {
      // Nhiệt độ ấm hơn / lạnh hơn một mức cho trước đúng n độ
      id: 'g2.6', covers: ['2.2'],
      make(rng) {
        for (let tries = 0; tries < 300; tries++) {
          const X = rng.next() < 0.2 ? 0 : int(rng, -8, 8), n = int(rng, 2, 9), warmer = rng.next() < 0.5;
          const right = X + (warmer ? n : -n);
          if (right < -10 || right > 10) continue;
          if (X !== 0 && !((X < 0 && right > 0) || (X > 0 && right < 0)) && rng.next() < 0.7) continue;
          const word = warmer ? 'ấm' : 'lạnh', opp = warmer ? 'lạnh' : 'ấm', go = warmer ? 'lên' : 'xuống';
          const miss = (v) => `Từ ${deg(X)} ${go} tới ${deg(v)} mới được ${Math.abs(v - X)} độ. Cần đủ ${n} độ.`;
          const pool = [];
          if (X === 0) pool.push(candD(-right, 'DẤU', `${deg(-right)} ${opp} hơn 0 °C là ${n} độ. ${warmer ? 'Ấm' : 'Lạnh'} hơn thì phải ${go} ${warmer ? 'trên' : 'dưới'} số 0.`));
          else {
            pool.push(candD(X + (warmer ? -n : n), 'NGƯỢC', `${deg(X + (warmer ? -n : n))} ${opp} hơn ${deg(X)} là ${n} độ. Đề hỏi ${word} hơn.`));
            pool.push(candD(-right, 'DẤU', `Con đã đổi dấu của kết quả. Từ ${deg(X)} đi ${go} ${n} độ thì tới ${deg(right)}, không phải ${deg(-right)}.`));
            pool.push(candD(warmer ? n : -n, 'ĐẾM', `Số này cách 0 °C đúng ${n} độ. Đề cho ${deg(X)}, nên con phải bắt đầu đếm từ ${f(X)}.`));
          }
          pool.push(candD(right + 1, 'ĐẾM', miss(right + 1)), candD(right - 1, 'ĐẾM', miss(right - 1)), candD(right + 2, 'ĐẾM', miss(right + 2)), candD(right - 2, 'ĐẾM', miss(right - 2)));
          const choices = shuffle(rng, [R(deg(right)), ...rankPick(rng, right, pool)]);
          const nmA = pick(rng, NAMES);
          const jumps = Array.from({ length: n }, (_, i) => ({ from: X + (warmer ? i : -i), to: X + (warmer ? i + 1 : -i - 1), label: warmer ? '+1' : MI + '1' }));
          const lo = Math.min(X, right) - 1, hi = Math.max(X, right) + 1;
          return {
            id: 'g2.6', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
            prompt: pick(rng, [`Mức nhiệt nào ${word} hơn ${deg(X)} đúng ${n} độ?`, `Nhiệt kế của ${nmA} đang chỉ ${deg(X)}. Mức nhiệt nào ${word} hơn mức đó đúng ${n} độ?`]),
            hint: `${warmer ? 'Ấm' : 'Lạnh'} hơn thì thủy ngân phải đi lên hay đi xuống?`,
            visual: th(X, [{ label: deg(X), value: X }]),
            choices, meta: { X, n, warmer },
            explain: { steps: [
              { text: `${warmer ? 'Ấm' : 'Lạnh'} hơn thì nhiệt độ đi ${go}${X === 0 ? ', ' + (warmer ? 'lên trên' : 'xuống dưới') + ' vạch 0' : ''}.`, visual: th(X, [{ label: deg(X), value: X }]) },
              { text: `Đi ${go} ${n} độ, mỗi lần một độ, bắt đầu từ ${f(X)}${X !== 0 && ((X < 0 && right > 0) || (X > 0 && right < 0)) ? ' và đi qua số 0' : ''}.`, visual: { kind: 'numberline', min: lo, max: hi, step: 1, labelEvery: 1, points: [{ at: X, color: X === 0 ? '#F5893A' : undefined }, { at: right }], jumps, marker: { at: X, emoji: '🐸' }, anim: 'hop' } },
              { text: `Vậy đáp án là ${deg(right)}.`, mark: 'good', visual: th(right, [{ label: deg(X), value: X }, { label: deg(right), value: right }]) },
            ] },
          };
        }
        throw new Error('g2.6');
      },
      solve(item) { const { X, n, warmer } = item.meta; return deg(X + (warmer ? n : -n)); },
    },
    {
      // Xếp thứ tự nhiệt độ
      id: 'g2.7', covers: ['2.3'],
      make(rng) {
        const nVals = rng.next() < 0.55 ? 4 : 5;
        const vals = fewTemps(rng, nVals), asc = rng.next() < 0.6;
        const sorted = vals.slice().sort((x, y) => (asc ? x - y : y - x));
        const byAbs = vals.slice().sort((x, y) => (asc ? Math.abs(x) - Math.abs(y) : Math.abs(y) - Math.abs(x)));
        const rev = sorted.slice().reverse();
        const key = (a) => a.join(',');
        const wrongHints = [];
        wrongHints.push({ match: rev.map(idOf), code: 'ĐỌC', why: asc ? 'Đây là xếp từ ấm đến lạnh. Tăng dần là từ bé đến lớn, bắt đầu từ lạnh nhất.' : 'Đây là xếp từ lạnh đến ấm. Giảm dần là từ lớn đến bé, bắt đầu từ ấm nhất.' });
        if (key(byAbs) !== key(sorted) && key(byAbs) !== key(rev)) wrongHints.push({ match: byAbs.map(idOf), code: 'DẤU', why: 'Con đã so sánh như số không có dấu. Số âm càng xa 0 thì càng lạnh, tức là càng bé.' });
        const T = (a) => a.map(deg).join(', ');
        const [t0] = pick(rng, [['Sáng nay'], ['Hôm qua'], ['Đêm qua'], ['Hôm nay']]), nmA = pick(rng, NAMES);
        const ctx = pick(rng, [`${t0}, ${nmA} ghi lại nhiệt độ ở ${nVals} nơi.`, `${nmA} đọc nhiệt độ ở ${nVals} thành phố.`]);
        return {
          id: 'g2.7', src: '[biến thể mới]', type: 'order',
          prompt: `${ctx} ${asc ? 'Xếp các nhiệt độ từ LẠNH nhất đến ấm nhất (tăng dần)' : 'Xếp các nhiệt độ từ ẤM nhất đến lạnh nhất (giảm dần)'}. Chạm lần lượt từng nhiệt độ.`,
          hint: 'Thủy ngân càng thấp trên nhiệt kế thì càng lạnh.',
          visual: th(undefined, vals.map((v) => ({ label: deg(v), value: v }))),
          items: vals.map((v) => ({ id: idOf(v), text: deg(v) })),
          answer: sorted.map(idOf), wrongHints, meta: { vals, asc },
          explain: { steps: [
            { text: `Nhìn nhiệt kế: ${deg(Math.min(...vals))} thấp nhất nên lạnh nhất. ${deg(Math.max(...vals))} cao nhất nên ấm nhất.`, visual: th(Math.min(...vals), vals.slice().sort((x, y) => x - y).map((v) => ({ label: deg(v), value: v }))) },
            { text: 'Các số âm: số nào xa 0 hơn thì bé hơn. Rồi đến 0 và các số dương.', visual: { kind: 'sequence', items: vals.slice().sort((x, y) => x - y), arrowLabels: arrowsOf(nVals - 1, '<'), anim: 'reveal' } },
            { text: `Vậy thứ tự đúng là ${T(sorted)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { vals, asc } = item.meta; return vals.slice().sort((x, y) => (asc ? x - y : y - x)).map(idOf).join(','); },
    },
    {
      // Đúng/Sai: hai nhiệt độ dương, ai ấm hơn và hơn bao nhiêu độ (50% đúng)
      id: 'g2.8', covers: ['2.5'],
      make(rng) {
        for (let tries = 0; tries < 200; tries++) {
          const tw = int(rng, 22, 34), tc = int(rng, 6, 19), diff = tw - tc;
          const nw = pick(rng, WARM_C), nc = pick(rng, COOL_C);
          const sum = tw + tc, off = pick(rng, [diff + 1, diff - 1, diff + 2, diff - 2]);
          const truth = rng.next() < 0.5;
          const kind = truth ? pick(rng, ['warm', 'cold']) : pick(rng, ['revWarm', 'revCold', 'sumWarm', 'offCold']);
          const stm = { warm: [nw, 'ấm', diff], cold: [nc, 'lạnh', diff], revWarm: [nc, 'ấm', diff], revCold: [nw, 'lạnh', diff], sumWarm: [nw, 'ấm', sum], offCold: [nc, 'lạnh', off] }[kind];
          const other = stm[0] === nw ? nc : nw;
          const text = `${stm[0]} ${stm[1]} hơn ${other} ${stm[2]} độ.`;
          const speaker = pick(rng, NAMES);
          const reasons = shuffle(rng, [
            { text: `${nw} ấm hơn ${nc} ${diff} độ`, correct: true },
            { text: `${nc} ấm hơn ${nw} ${diff} độ`, code: 'NGƯỢC', why: `${tw} lớn hơn ${tc}, nên ${nw} mới là nơi ấm hơn.` },
            { text: `${nw} ấm hơn ${nc} ${sum} độ`, code: 'QUY', why: `Con đã cộng hai nhiệt độ: ${tw} + ${tc} = ${sum}. Hỏi hơn kém bao nhiêu độ thì phải TRỪ: ${tw} − ${tc} = ${diff}.` },
          ]);
          const whyWrong = truth ? `Con thử trừ lại: ${tw} − ${tc} = ${diff} độ, và ${tw} lớn hơn ${tc}. Lời nói này đúng.`
            : kind.startsWith('rev') ? `Số ${diff} thì đúng, nhưng nói ngược chiều. ${tw} lớn hơn ${tc} nên ${nw} mới là nơi ấm hơn.`
              : `Hơn kém nhau bao nhiêu độ thì lấy số lớn TRỪ số bé: ${tw} − ${tc} = ${diff} độ, không phải ${stm[2]} độ.`;
          return {
            id: 'g2.8', src: '[biến thể mới]', type: 'tf', answer: truth,
            prompt: `${nc} ${deg(tc)}, ${nw} ${deg(tw)}. ${speaker} nói: "${text}" ${speaker} nói đúng hay sai?`,
            hint: 'Thành phố nào có số lớn hơn thì ấm hơn. Rồi lấy số lớn trừ số bé.',
            visual: { kind: 'bubble', who: speaker, text, emoji: '🧒' },
            reasons, whyWrong,
            meta: { tw, tc, subjWarm: stm[0] === nw, verb: stm[1], n: stm[2] },
            explain: { steps: [
              { text: `${tw} lớn hơn ${tc}, nên ${nw} ấm hơn ${nc}, và ${nc} lạnh hơn ${nw}.`, visual: { kind: 'numberline', min: Math.max(0, tc - 4), max: tw + 3, step: 1, labelEvery: 5, points: [{ at: tc }, { at: tw }], jumps: [{ from: tc, to: tw, label: '+' + diff }] } },
              { text: `Ấm hơn bao nhiêu độ: ${tw} − ${tc} = ${diff} độ.` },
              { text: truth ? `Vậy ${speaker} nói đúng.` : `Vậy ${speaker} nói sai: ${nw} ấm hơn ${nc} ${diff} độ.`, mark: 'good' },
            ] },
          };
        }
        throw new Error('g2.8');
      },
      solve(item) { const { tw, tc, subjWarm, verb, n } = item.meta; return String((verb === 'ấm') === subjWarm && n === tw - tc); },
    },
    {
      // Nhập số: nhiệt độ sau khi tăng / giảm
      id: 'g2.9', covers: ['2.6'],
      make(rng) {
        const up = rng.next() < 0.5;
        let s, c;
        if (up) { s = -int(rng, 2, 9); c = int(rng, -s + 1, -s + 9); } else { s = int(rng, 2, 9); c = int(rng, s + 1, s + 9); }
        const dsig = up ? c : -c, right = s + dsig;
        const hintsRaw = up
          ? [[s - c, 'NGƯỢC', 'Tăng nghĩa là đi LÊN, không phải đi xuống.'], [Math.abs(s) + c, 'DẤU', `Con nhớ giữ dấu âm: ${f(s)} nằm dưới số 0.`], [-right, 'DẤU', `${c} − ${Math.abs(s)} = ${right} và mình đã vượt qua số 0, nên kết quả là số dương.`]]
          : [[s + c, 'NGƯỢC', 'Giảm nghĩa là đi XUỐNG, không phải đi lên.'], [-right, 'DẤU', `${c} − ${s} = ${-right} và mình đã xuống qua số 0, nên kết quả là số âm.`], [-(s + c), 'DẤU', `${s} nằm TRÊN số 0 nên giảm là ${s} − ${c}, không phải −${s} − ${c}.`]];
        const seenM = new Set([f(right)]);
        const wrongHints = hintsRaw.filter(([v]) => (seenM.has(f(v)) ? false : (seenM.add(f(v)), true))).map(([v, code, why]) => ({ match: f(v), code, why }));
        const [t0, t1] = pick(rng, TIMES), city = pick(rng, COLD);
        const lo = Math.min(s, right) - 1, hi = Math.max(s, right) + 1;
        return {
          id: 'g2.9', src: '[biến thể mới]', type: 'numpad',
          prompt: `${t0} ở ${city}, nhiệt độ là ${deg(s)}. Đến ${t1}, nhiệt độ ${up ? 'tăng' : 'giảm'} thêm ${c} độ. Nhiệt độ lúc đó là bao nhiêu độ C?`,
          hint: `Từ ${f(s)} ${up ? 'lên' : 'xuống'} tới 0 mất mấy độ? Còn thừa mấy độ nữa?`,
          visual: th(s, [{ label: t0, value: s }]),
          slots: [{ label: 'Lúc đó:', answer: f(right), unit: '°C', allowNeg: true }],
          alt: right < 0 ? { 0: [String(right)] } : undefined,
          wrongHints, meta: { s, c, up },
          explain: { steps: [
            { text: `Từ ${f(s)} ${up ? 'lên' : 'xuống'} tới 0 mất ${Math.abs(s)} độ.`, visual: { kind: 'numberline', min: lo, max: hi, step: 1, labelEvery: 1, points: [{ at: s }, { at: 0, color: '#F5893A' }], jumps: [{ from: s, to: 0, label: (up ? '+' : MI) + Math.abs(s) }], marker: { at: s, emoji: '🐸' }, anim: 'hop' } },
            { text: `Còn ${c} − ${Math.abs(s)} = ${c - Math.abs(s)} độ nữa thì ${up ? 'lên' : 'xuống'} từ 0 tới ${f(right)}.`, visual: { kind: 'numberline', min: lo, max: hi, step: 1, labelEvery: 1, points: [{ at: s }, { at: 0, color: '#F5893A' }, { at: right }], jumps: [{ from: s, to: 0, label: (up ? '+' : MI) + Math.abs(s) }, { from: 0, to: right, label: (up ? '+' : MI) + Math.abs(right) }] } },
            { text: `Vậy nhiệt độ lúc đó là ${deg(right)}.`, mark: 'good', visual: th(right, [{ label: 'Trước', value: s }, { label: 'Sau', value: right }]) },
          ] },
        };
      },
      solve(item) { const { s, c, up } = item.meta; return f(s + (up ? c : -c)); },
    },
    {
      // Nhiệt độ thứ hai (lạnh / ấm) trong một nhóm
      id: 'g2.10', covers: ['2.7'],
      make(rng) {
        for (let tries = 0; tries < 300; tries++) {
          const n = rng.next() < 0.5 ? 4 : 5;
          const vals = fewTemps(rng, n);
          if (new Set(vals.map(Math.abs)).size < n) continue;
          const asc = vals.slice().sort((x, y) => x - y);
          const noun = pick(rng, ['ngày', 'thành phố', 'nơi']);
          const asks = [{ idx: 0, name: 'lạnh nhất', long: 'lạnh nhất' }, { idx: 1, name: 'lạnh thứ hai', long: `lạnh thứ hai, tức là lạnh ngay sau ${noun} lạnh nhất` }, { idx: n - 1, name: 'ấm nhất', long: 'ấm nhất' }, { idx: n - 2, name: 'ấm thứ hai', long: `ấm thứ hai, tức là ấm ngay sau ${noun} ấm nhất` }];
          const ask = pick(rng, asks);
          const right = asc[ask.idx];
          const absAsc = vals.slice().sort((x, y) => Math.abs(x) - Math.abs(y) || x - y);
          const absAns = absAsc[ask.idx];
          if (absAns === right) continue;
          const rankName = (u) => { const i = asc.indexOf(u); return i === 0 ? 'lạnh nhất' : i === 1 ? 'lạnh thứ hai' : i === n - 1 ? 'ấm nhất' : i === n - 2 ? 'ấm thứ hai' : 'ở giữa (thứ ba)'; };
          const nounS = noun === 'thành phố' ? 'Thành phố' : noun === 'ngày' ? 'Ngày' : 'Nơi';
          const others = shuffle(rng, vals.filter((u) => u !== right && u !== absAns));
          const wr = [W(deg(absAns), 'DẤU', `Con đã so sánh như số không có dấu. Số âm càng xa 0 thì càng lạnh, nên ${deg(absAns)} là ${noun} ${rankName(absAns)}.`),
            ...others.slice(0, 2).map((u) => W(deg(u), 'ĐỌC', `${deg(u)} là ${noun} ${rankName(u)}. Đề hỏi ${noun} ${ask.name}.`))];
          const choices = shuffle(rng, [R(deg(right)), ...wr]);
          const sortedT = asc.map(f).join(', ');
          return {
            id: 'g2.10', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
            prompt: `${n === 4 ? 'Bốn' : 'Năm'} ${noun} có nhiệt độ ${vals.map(deg).join(', ')}. ${nounS} nào ${ask.long}?`,
            hint: `Xếp ${n === 4 ? 'bốn' : 'năm'} nhiệt độ từ lạnh đến ấm trước.`,
            choices, meta: { vals, idx: ask.idx },
            explain: { steps: [
              { text: `Xếp từ lạnh đến ấm: ${sortedT}.`, visual: th(undefined, asc.map((v) => ({ label: f(v), value: v }))) },
              { text: `${nounS} ${ask.name} là số đứng thứ ${ask.idx + 1} trong dãy vừa xếp: ${deg(right)}.`, visual: { kind: 'sequence', items: asc, highlight: [ask.idx] } },
              { text: `Vậy đáp án là ${deg(right)}.`, mark: 'good' },
            ] },
          };
        }
        throw new Error('g2.10');
      },
      solve(item) { const { vals, idx } = item.meta; return deg(vals.slice().sort((x, y) => x - y)[idx]); },
    },
  ],
};

function arrowsOf(n, lab) { return Array.from({ length: n }, () => lab); }
