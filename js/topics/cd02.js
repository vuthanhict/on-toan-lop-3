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
      id: 'g2.1',
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
        if (up) { s = -int(rng, 2, 8); c = int(rng, -s + 1, -s + 8); } else { s = int(rng, 2, 8); c = int(rng, s + 1, s + 8); }
        const dsig = up ? c : -c;
        const right = s + dsig;
        const wrongs = up
          ? [W(deg(s - dsig), 'NGƯỢC', 'Tăng là đi LÊN, không phải đi xuống.'), W(deg(Math.abs(s) + c), 'DẤU', `Con nhớ giữ dấu âm: ${f(s)} nằm dưới số 0.`), W(deg(-right), 'DẤU', `${c} − ${Math.abs(s)} = ${right} và mình đã vượt qua số 0, nên kết quả là số dương.`)]
          : [W(deg(s + c), 'NGƯỢC', 'Giảm là đi XUỐNG, không phải đi lên.'), W(deg(-right), 'DẤU', `${c} − ${s} = ${-right}, nhưng mình đã xuống qua số 0, nên kết quả là số âm.`), W(deg(-(s + c)), 'DẤU', `${s} nằm TRÊN số 0 nên giảm là ${s} − ${c}, không phải −${s} − ${c}.`)];
        const choices = shuffle(rng, [R(deg(right)), ...wrongs]);
        const lo = Math.min(s, right) - 1, hi = Math.max(s, right) + 1;
        return {
          id: 'g2.3', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: `Buổi sáng nhiệt độ là ${deg(s)}. Buổi trưa nhiệt độ ${up ? 'tăng' : 'giảm'} thêm ${c} độ. Nhiệt độ buổi trưa là bao nhiêu?`,
          hint: `${up ? 'Tăng' : 'Giảm'} nghĩa là đi ${up ? 'lên' : 'xuống'}. Đi tới vạch 0 mất mấy độ?`,
          choices, meta: { s, c, up },
          explain: { steps: [
            { text: `Từ ${f(s)} ${up ? 'lên' : 'xuống'} tới 0 mất ${Math.abs(s)} độ.`, visual: { kind: 'numberline', min: lo, max: hi, step: 1, labelEvery: 1, points: [{ at: s }, { at: 0, color: '#F5893A' }], jumps: [{ from: s, to: 0, label: (up ? '+' : MI) + Math.abs(s) }], marker: { at: s, emoji: '🐸' }, anim: 'hop' } },
            { text: `Còn ${c} − ${Math.abs(s)} = ${c - Math.abs(s)} độ nữa, ${up ? 'đi lên' : 'đi xuống'} tới ${f(right)}.`, visual: { kind: 'numberline', min: lo, max: hi, step: 1, labelEvery: 1, points: [{ at: s }, { at: 0, color: '#F5893A' }, { at: right }], jumps: [{ from: s, to: 0, label: (up ? '+' : MI) + Math.abs(s) }, { from: 0, to: right, label: (up ? '+' : MI) + Math.abs(right) }] } },
            { text: `Vậy nhiệt độ buổi trưa là ${deg(right)}.`, mark: 'good', visual: th(right, [{ label: 'Sáng', value: s }, { label: 'Trưa', value: right }]) },
          ] },
        };
      },
      solve(item) { const { s, c, up } = item.meta; return deg(s + (up ? c : -c)); },
    },
    {
      id: 'g2.4',
      make(rng) {
        const t = pick(rng, [-8, -6, -4, -2, 2, 4, 6, 8]);
        const choices = shuffle(rng, [
          R(deg(t)),
          W(deg(-t), 'DẤU', `Nhìn lại: thủy ngân ${t > 0 ? 'ở TRÊN' : 'ở DƯỚI'} vạch 0, nên nhiệt độ là số ${t > 0 ? 'dương' : 'âm'}.`),
          W(deg(t + 1), 'ĐẾM', 'Mỗi vạch có ghi số cách nhau 2 độ. Đọc theo số ghi trên vạch.'),
          W(deg(t - 1), 'ĐẾM', 'Mỗi vạch có ghi số cách nhau 2 độ. Đọc theo số ghi trên vạch.'),
        ]);
        return {
          id: 'g2.4', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: 'Nhìn nhiệt kế. Thủy ngân đang chỉ bao nhiêu độ?',
          hint: 'Thủy ngân ở trên hay ở dưới vạch 0?',
          visual: { kind: 'thermo', min: -10, max: 10, step: 2, items: [{ label: '?', value: t }], showValue: false },
          choices, meta: { t },
          explain: { steps: [
            { text: `Thủy ngân ${t > 0 ? 'ở trên' : 'ở dưới'} vạch 0, nên nhiệt độ là số ${t > 0 ? 'dương' : 'âm'}.`, visual: th(t, undefined) },
            { text: `Đếm từ vạch 0 ${t > 0 ? 'lên' : 'xuống'}: cột thủy ngân dừng ở ${f(t)}.`, visual: th(t, [{ label: deg(t), value: t }]) },
            { text: `Vậy nhiệt độ là ${deg(t)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { return deg(item.meta.t); },
    },
    {
      id: 'g2.5',
      make(rng) {
        for (let tries = 0; tries < 200; tries++) {
          const tw = int(rng, 1, 9), tc = -int(rng, 1, 9);
          const diff = tw - tc, amt = Math.abs(tw - Math.abs(tc));
          if (amt === 0 || amt === diff) continue;
          const [nw, nc] = twoCities(rng, tw);
          const kind = pick(rng, ['ok', 'dir', 'amt']);
          const stmt = kind === 'ok' ? `${nw} ấm hơn ${nc} ${diff} độ.` : kind === 'dir' ? `${nc} ấm hơn ${nw} ${diff} độ.` : `${nw} ấm hơn ${nc} ${amt} độ.`;
          const speaker = pick(rng, ['Nam', 'Lan', 'Hùng', 'Mai', 'Minh']);
          const reasons = shuffle(rng, [
            { text: `${nw} ấm hơn ${nc} ${diff} độ`, correct: true },
            { text: `${nc} ấm hơn ${nw} ${diff} độ`, code: 'NGƯỢC', why: `${f(tw)} lớn hơn ${f(tc)}, nên ${nw} mới là nơi ấm hơn.` },
            { text: `${nw} ấm hơn ${nc} ${amt} độ`, code: 'DẤU', why: `Con mới tính ${Math.max(tw, Math.abs(tc))} − ${Math.min(tw, Math.abs(tc))} = ${amt}, như thể ${f(tc)} là ${Math.abs(tc)}. Nhưng ${f(tc)} nằm dưới số 0, nên phải đếm qua số 0: ${Math.abs(tc)} + ${tw} = ${diff}.` },
          ]);
          return {
            id: 'g2.5', src: '[biến thể mới]', type: 'tf', answer: kind === 'ok',
            prompt: `${nw} ${deg(tw)}, ${nc} ${deg(tc)}. ${speaker} nói: "${stmt}" ${speaker} nói đúng hay sai?`,
            hint: 'Số nào lớn hơn thì ấm hơn. Rồi đếm số độ qua số 0.',
            visual: { kind: 'bubble', who: speaker, text: stmt, emoji: '🧒' },
            reasons,
            whyWrong: kind === 'ok' ? `Con thử đếm lại: từ ${f(tc)} lên 0 là ${Math.abs(tc)}, lên ${tw} thêm ${tw}, được ${diff} độ. Lời nói này đúng.` : `${f(tw)} lớn hơn ${f(tc)}, nên ${nw} ấm hơn ${nc} ${diff} độ. Bạn trong đề nói chưa đúng chỗ này.`,
            meta: { mk: kind },
            explain: { steps: [
              { text: `${f(tw)} lớn hơn ${f(tc)}, nên ${nw} ấm hơn ${nc}.`, visual: th(tw, [{ label: nc, value: tc }, { label: nw, value: tw }]) },
              { text: `Đếm số độ: từ ${f(tc)} lên 0 là ${Math.abs(tc)}, từ 0 lên ${tw} là ${tw}. Tổng ${Math.abs(tc)} + ${tw} = ${diff} độ.`, visual: { kind: 'numberline', min: tc - 1, max: tw + 1, step: 1, labelEvery: 1, points: [{ at: tc }, { at: 0, color: '#F5893A' }, { at: tw }], jumps: [{ from: tc, to: 0, label: '+' + Math.abs(tc) }, { from: 0, to: tw, label: '+' + tw }] } },
              { text: kind === 'ok' ? `Vậy ${speaker} nói đúng.` : `Vậy ${speaker} nói sai: ${nw} ấm hơn ${nc} ${diff} độ.`, mark: 'good' },
            ] },
          };
        }
        throw new Error('g2.5');
      },
      solve(item) { return String(item.meta.mk === 'ok'); },
    },
  ],
};

function arrowsOf(n, lab) { return Array.from({ length: n }, () => lab); }
