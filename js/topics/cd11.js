import { pick, int, shuffle } from '../core/rng.js';
import { vdivSteps, vdivMicro } from '../core/paper.js';

const R = (text) => ({ text, correct: true });
const W = (text, code, why) => ({ text, code, why });
const qr = (q, r) => (r ? `${q} dư ${r}` : String(q));
const NAMES = ['Lan', 'Mai', 'Nam', 'Hà', 'Bình', 'An', 'Chi', 'Minh', 'Linh', 'Phúc', 'Khoa', 'Thảo', 'Huy', 'Ngọc', 'Tú', 'Vy'];

// bảng tách "tròn chục + phần còn lại"
const splitTable = (rows, highlight) => ({ kind: 'table', headers: ['Tách', 'Phép chia', 'Kết quả'], rows, ...(highlight ? { highlight } : {}) });
// ----- lời giải kiểu vở ô li (hình nháp từ core/paper.js): chia ngắn → viết nháp số dư / kết quả -----
const gp = (t) => (t == null ? t : t.replace(/(?<!\d)(\d)(\d{3})(?!\d)/g, '$1 $2'));
const lc = (x) => (/^[A-ZÀ-Ỵ]/.test(x) ? x[0].toLowerCase() + x.slice(1) : x);
// rút gọn lời cho đủ ≤ 2 câu: bỏ câu mà hình đã cho thấy, còn dài thì nối các câu bằng dấu chấm phẩy
function concise(t) {
  if (!t) return t;
  let ss = t.split(/(?<=\.)\s+/);
  if (ss.length > 2) ss = ss.filter((x) => !/^(Viết \d+ nhỏ phía trên|Kẻ vạch ngang)/.test(x));
  if (ss.length > 2) {
    let best = 1, gap = 1e9;
    for (let k = 1; k < ss.length; k++) { const d = Math.abs(ss.slice(0, k).join(' ').length - ss.slice(k).join(' ').length); if (d < gap) { gap = d; best = k; } }
    const join = (arr) => arr.map((x, i) => (i ? lc(x) : x).replace(/\.$/, '')).join('; ') + '.';
    ss = [join(ss.slice(0, best)), join(ss.slice(best))];
  }
  return ss.join(' ');
}
const tidy = (steps) => steps.map((st) => { const o = Object.assign({}, st, { text: gp(concise(st.text)) }); if (st.say) o.say = gp(concise(st.say)); return o; });
// các bước chia ngắn (hình vdiv); bước cuối "Vậy a ÷ b = …" được đánh dấu tốt
const divSteps = (a, b, maxSteps = 4) => { const st = tidy(vdivSteps(a, b, { maxSteps })); st[st.length - 1] = Object.assign({}, st[st.length - 1], { mark: 'good' }); return st; };
// các bước "viết nháp": mỗi nhóm {text, lines:[{text,note?,color?}], mark?}; hình workout hiện dần các dòng
const INK = '#4B34A8';
const draft = (groups) => {
  const lines = groups.flatMap((g) => g.lines); let n = 0;
  return groups.map((g, i) => {
    const from = n; n += g.lines.length;
    return Object.assign({ text: g.text, visual: Object.assign({ kind: 'workout', lines, upto: n, from, anim: 'write' }, i === groups.length - 1 ? { done: true } : {}) }, g.mark ? { mark: g.mark } : {});
  });
};
// lời văn có dư mà phải xếp HẾT: số dư không bỏ đi được → thêm 1 hộp (final = câu kết luận)
const needMore = (a, b, box, unit, final) => {
  const q = Math.floor(a / b), r = a % b;
  return draft([
    { text: `Con viết: ${a} ÷ ${b} = ${q} dư ${r}. Còn dư ${r} ${unit} nên cần thêm 1 ${box}.`, lines: [{ text: `${a} ÷ ${b} = ${q} dư ${r}`, note: 'phép chia' }, { text: `dư ${r} → thêm 1 ${box}`, note: 'số dư không bỏ đi' }] },
    { text: `${q} + 1 = ${q + 1}. ${final}`, lines: [{ text: `${q} + 1 = ${q + 1} ${box}`, note: 'kết quả', color: INK }], mark: 'good' },
  ]);
};
// chọn các số theo số dư: mỗi số một dòng viết nháp
const remLine = (v, b, r) => ({ text: `${v} ÷ ${b} = ${Math.floor(v / b)} dư ${v % b}`, note: v % b === r ? (r === 0 ? 'chia hết: đúng' : `dư ${r}: đúng`) : `dư ${v % b}: không đúng` });
const multiRemSteps = (nums, b, r) => {
  const ok = nums.filter((v) => v % b === r).sort((x, y) => x - y);
  const okTxt = `${ok.slice(0, -1).join(', ')} và ${ok[ok.length - 1]}`;
  const w = (v) => `${v} ÷ ${b} = ${Math.floor(v / b)} dư ${v % b}`;
  return draft([
    { text: `Chia từng số cho ${b}, tìm số dư. ${w(nums[0])}.`, lines: [remLine(nums[0], b, r)] },
    { text: `${nums.slice(1).map(w).join('; ')}.`, lines: nums.slice(1).map((v) => remLine(v, b, r)) },
    { text: `Các số có số dư ${r === 0 ? '0 (chia hết)' : `là ${r}`}: ${ok.join(', ')}. Vậy đáp án là: ${okTxt}.`, lines: [{ text: `Chọn: ${ok.join(', ')}`, note: 'đáp án', color: INK }], mark: 'good' },
  ]);
};

const topic = {
  id: 'cd11', no: 11, day: 4, title: 'Chia, số dư và bài toán lời văn', short: 'Chia & dư', icon: '🍬',
  intro: 'Chia xong thì kiểm tra bằng phép nhân. Có dư thì số dư luôn bé hơn số chia. Cần xếp HẾT mà còn dư thì thêm một hộp.',

  remember: [
    {
      text: 'Chia xong thì kiểm tra bằng phép nhân: 70 ÷ 5 = 14 vì 14 × 5 = 70. Mẹo chia nhanh: tách số bị chia thành hai phần dễ chia. Ví dụ 84 ÷ 6: tách 84 = 60 + 24. Có 60 ÷ 6 = 10 và 24 ÷ 6 = 4, nên 84 ÷ 6 = 14.',
      visual: { kind: 'array', rows: 5, cols: 14, groupBy: 'rows', showEq: true },
    },
    {
      text: 'Phép chia có dư thì số dư luôn NHỎ HƠN số chia. Muốn thử lại: lấy thương nhân với số chia, rồi cộng số dư. Ví dụ 13 ÷ 3 = 4 dư 1, vì 4 × 3 + 1 = 13.',
      visual: { kind: 'numberline', min: 0, max: 13, step: 1, labelEvery: 1, jumps: [{ from: 0, to: 3, label: '+3' }, { from: 3, to: 6, label: '+3' }, { from: 6, to: 9, label: '+3' }, { from: 9, to: 12, label: '+3' }, { from: 12, to: 13, label: 'dư 1' }], marker: { at: 0, emoji: '🐸' }, anim: 'hop' },
    },
    {
      text: 'Hỏi "xếp ĐẦY được mấy hộp, còn thừa mấy" thì trả lời cả thương và số dư. Hỏi "cần mấy hộp để xếp HẾT" mà còn dư thì phải thêm một hộp.',
      visual: { kind: 'groups', total: 23, perGroup: 5, container: 'hộp', emoji: '🍬', showRemainder: true, anim: 'distribute' },
    },
    {
      text: 'Cách làm nháp: chia từ trái sang phải, chia hàng chục trước. Dư thì ghép với chữ số kế.',
      visual: { kind: 'vdiv', a: 84, b: 6, upto: vdivMicro(84, 6).length },
    },
  ],

  lesson: [
    {
      text: 'Cách 1: trừ dần. Tính 15 ÷ 3 bằng cách trừ 3 liên tục: 15 − 3 − 3 − 3 − 3 − 3 = 0. Trừ 5 lần, nên 15 ÷ 3 = 5.',
      visual: { kind: 'numberline', min: 0, max: 15, step: 1, labelEvery: 3, jumps: [{ from: 15, to: 12, label: '−3' }, { from: 12, to: 9, label: '−3' }, { from: 9, to: 6, label: '−3' }, { from: 6, to: 3, label: '−3' }, { from: 3, to: 0, label: '−3' }], marker: { at: 15, emoji: '🐸' }, anim: 'hop' },
    },
    {
      text: 'Cách 2: cộng dần (có dư). Tính 13 ÷ 3: cộng thêm 3 mỗi lần, gần 13 nhất mà không vượt. Được 3, 6, 9, 12 là 4 lần. Còn 1 nữa mới tới 13. Vậy 13 ÷ 3 = 4 dư 1.',
      visual: { kind: 'numberline', min: 0, max: 13, step: 1, labelEvery: 1, jumps: [{ from: 0, to: 3, label: '+3' }, { from: 3, to: 6, label: '+3' }, { from: 6, to: 9, label: '+3' }, { from: 9, to: 12, label: '+3' }, { from: 12, to: 13, label: 'dư 1' }], marker: { at: 0, emoji: '🐸' }, anim: 'hop' },
    },
    {
      text: 'Cách 3: dùng bảng nhân. Tính 63 ÷ 9: nhớ 7 × 9 = 63, nên 63 ÷ 9 = 7.',
      visual: { kind: 'array', rows: 7, cols: 9, showEq: true, anim: 'fill' },
    },
    {
      text: 'Cách 4: tách số. Tính 84 ÷ 4: tách 84 = 80 + 4. Có 80 ÷ 4 = 20 và 4 ÷ 4 = 1. Gộp lại 20 + 1 = 21.',
      visual: splitTable([['80', '80 ÷ 4', '20'], ['4', '4 ÷ 4', '1'], ['Gộp', '20 + 1', '21']]),
    },
    {
      text: 'Cách 5: chia đôi hai lần. Tính 120 ÷ 4: 120 ÷ 2 = 60, rồi 60 ÷ 2 = 30. Vậy 120 ÷ 4 = 30.',
      visual: { kind: 'sequence', items: [120, 60, 30], arrowLabels: ['÷ 2', '÷ 2'], anim: 'reveal' },
    },
    {
      text: 'Cách 6: tách ra số tròn chục. Tính 84 ÷ 6: số tròn chục chia hết cho 6 và gần 84 nhất là 60. Tách 84 = 60 + 24. Có 60 ÷ 6 = 10 và 24 ÷ 6 = 4. Gộp lại 10 + 4 = 14.',
      visual: splitTable([['60', '60 ÷ 6', '10'], ['24', '24 ÷ 6', '4'], ['Gộp', '10 + 4', '14']]),
    },
    ...divSteps(95, 4).slice(1).map((st, i) => (i === 0 ? Object.assign({}, st, { text: 'Cách 7, chia ngắn 95 ÷ 4, viết nháp từ trái sang phải: ' + lc(st.text) }) : st)),
  ],

  items: [
    {
      id: '11.1', src: 'T11 tr.1 C3', type: 'choice', layout: 'grid2',
      prompt: 'Mai xếp 70 cái ghế thành 5 dãy đều nhau. Mỗi dãy có bao nhiêu cái ghế?',
      hint: 'Thử nhân từng đáp án với 5 xem có ra 70 không.',
      choices: [
        W('16 cái', 'NHỚ', '16 × 5 = 80, nhiều hơn 70 ghế. Hãy kiểm lại bằng phép nhân.'),
        W('15 cái', 'NHỚ', '15 × 5 = 75, vẫn nhiều hơn 70 ghế một chút.'),
        R('14 cái'),
        W('13 cái', 'NHỚ', '13 × 5 = 65, mới được 65 ghế nên còn thiếu.'),
      ],
      explain: { steps: [
        { text: 'Chia đều 70 ghế cho 5 dãy: 70 ÷ 5. Mình tìm số nhân với 5 được 70.', visual: { kind: 'array', rows: 5, cols: 14, groupBy: 'rows', showEq: true } },
        ...divSteps(70, 5),
        { text: 'Các đáp án 16, 15 và 13 nhân với 5 đều không ra 70. Vậy đáp án là 14 cái ghế, kiểm tra: 14 × 5 = 70.', mark: 'good' },
      ] },
      tags: ['chia'],
    },
    {
      id: '11.2', src: 'PCH tr.1', type: 'numpad',
      prompt: 'Tính: 72 ÷ 6 = □',
      hint: 'Ước lượng trước: 60 ÷ 6 bằng bao nhiêu? Rồi xem còn lại phần nào.',
      slots: [{ label: '72 ÷ 6 =', answer: '12' }],
      wrongHints: [
        { match: '10', code: 'QUY', why: '60 ÷ 6 = 10 mới chia được 60. Còn lại 72 − 60 = 12, chia thêm được 2 lần 6 nữa.' },
        { match: '11', code: 'NHỚ', why: '11 × 6 = 66, chưa đủ 72. Hãy thử kiểm bằng phép nhân.' },
        { match: '13', code: 'NHỚ', why: '13 × 6 = 78, vượt quá 72. Hãy thử kiểm bằng phép nhân.' },
      ],
      explain: { steps: [
        { text: 'Ước lượng: 60 ÷ 6 = 10, nên kết quả hơn 10 một chút.' },
        ...divSteps(72, 6),
      ] },
      tags: ['chia'],
    },
    {
      id: '11.3', src: 'T11 tr.1 C1', type: 'choice', layout: 'grid2',
      prompt: 'Tính 65 ÷ 4.',
      hint: 'Tìm số lớn nhất nhân 4 mà không vượt quá 65, rồi xem còn dư mấy.',
      choices: [
        R('16 dư 1'),
        W('16', 'ĐV', 'Còn dư 1 nên phải ghi "dư 1". 16 × 4 = 64, mà 65 − 64 = 1.'),
        W('15 dư 5', 'QUY', 'Số dư 5 lớn hơn số chia 4, nên còn chia thêm được một lần nữa: 15 dư 5 thành 16 dư 1.'),
        W('17 dư 1', 'NHỚ', '17 × 4 = 68, lớn hơn 65. Thương đã quá lớn.'),
      ],
      explain: { steps: [
        ...divSteps(65, 4),
      ] },
      tags: ['chia', 'số dư'],
    },
    {
      id: '11.4', src: 'T11 tr.1 C5', type: 'choice',
      prompt: 'Lan có 40 cái bánh, mỗi hộp xếp 6 cái. Xếp ĐẦY được mấy hộp và còn thừa mấy cái bánh?',
      hint: 'Chia 40 cho 6, nhớ trả lời cả thương và số dư.',
      choices: [
        R('6 hộp, thừa 4 cái'),
        W('7 hộp, thừa 2 cái', 'QUY', 'Hộp thứ 7 chưa đầy: 7 × 6 = 42 lớn hơn 40 cái bánh.'),
        W('6 hộp, thừa 6 cái', 'NHỚ', '6 × 6 = 36, mà 40 − 36 = 4. Thừa 4 cái chứ không phải 6.'),
        W('4 hộp', 'ĐV', '4 là số bánh còn thừa, không phải số hộp.'),
      ],
      explain: { steps: [
        { text: 'Chia 40 cái bánh vào các hộp, mỗi hộp 6 cái.', visual: { kind: 'groups', total: 40, perGroup: 6, emoji: '🧁', container: 'hộp', showRemainder: true, anim: 'distribute' } },
        ...divSteps(40, 6),
        ...draft([{ text: 'Con viết: 40 ÷ 6 = 6 dư 4. Thừa 4 cái bánh, bé hơn 6 nên không đủ xếp thêm hộp đầy. Vậy xếp đầy được 6 hộp, thừa 4 cái bánh.', lines: [{ text: '40 ÷ 6 = 6 dư 4', note: 'phép chia' }, { text: 'xếp đầy 6 hộp, thừa 4 cái', note: 'kết quả', color: INK }], mark: 'good' }]),
      ] },
      tags: ['lời văn', 'số dư'],
    },
    {
      id: '11.5', src: 'T11 tr.1 C6', type: 'tf',
      prompt: 'Nga có 69 chiếc bút chì, mỗi túi đựng 5 chiếc. Nga nói: "Cần 13 túi để xếp HẾT bút chì." Nga nói đúng hay SAI?',
      answer: false,
      hint: 'Chia 69 cho 5 và xem còn dư không.',
      reasons: [
        { text: 'Sai. 69 ÷ 5 = 13 dư 4, 4 chiếc còn lại cần thêm 1 túi nên cần 14 túi', correct: true },
        { text: 'Sai, vì chỉ cần 12 túi', correct: false, code: 'NGƯỢC', why: '12 túi chỉ đựng được 12 × 5 = 60 chiếc, ít hơn 69. Ít túi thì không đủ chỗ.' },
        { text: 'Sai, vì cần 17 túi (13 + 4)', correct: false, code: 'QUY', why: '4 chiếc dư chỉ cần thêm MỘT túi, vì mỗi túi đựng được tới 5 chiếc.' },
      ],
      whyWrong: '69 ÷ 5 = 13 dư 4. 13 túi chỉ đựng 13 × 5 = 65 chiếc, còn 4 chiếc chưa có túi. Phải thêm 1 túi, nên cần 14 túi.',
      explain: { steps: [
        { text: 'Chia 69 chiếc bút chì vào các túi, mỗi túi 5 chiếc.', visual: { kind: 'groups', total: 69, perGroup: 5, emoji: '✏️', container: 'túi', showRemainder: true } },
        ...divSteps(69, 5),
        ...needMore(69, 5, 'túi', 'chiếc bút', 'Vậy Nga nói SAI: để xếp hết cần 14 túi.'),
      ] },
      tags: ['lời văn', 'số dư'],
    },
    {
      id: '11.6', src: 'T11 tr.1 C4', type: 'multi',
      prompt: 'Số nào khi chia cho 6 có số dư là 2? Chọn tất cả các số đúng.',
      choices: [
        W('45', 'QUY', '45 ÷ 6 = 7 dư 3 (7 × 6 = 42). Số dư là 3, không phải 2.'),
        R('56'),
        R('74'),
        W('93', 'QUY', '93 ÷ 6 = 15 dư 3 (15 × 6 = 90). Số dư là 3, không phải 2.'),
      ],
      hint: 'Con kiểm từng số, đừng dừng ở số đầu tiên.',
      explain: { steps: [
        ...multiRemSteps([45, 56, 74, 93], 6, 2),
      ] },
      tags: ['số dư'],
    },
  ],

  variant: {
    id: '11.7', src: '[biến thể mới]', type: 'choice',
    prompt: '45 người đi tham quan, mỗi xe chở được 7 người. Cần ít nhất mấy xe để chở HẾT?',
    hint: 'Chia 45 cho 7. Nếu còn người thì sao?',
    choices: [
      R('7 xe'),
      W('6 xe', 'QUY', '6 xe chỉ chở được 6 × 7 = 42 người, còn 3 người chưa có xe.'),
      W('3 xe', 'ĐV', '3 là số người còn dư, không phải số xe.'),
      W('8 xe', 'QUY', 'Thừa một xe: 7 xe đã chở được 7 × 7 = 49 người, đủ cho 45 người.'),
    ],
    explain: { steps: [
      { text: '45 người, mỗi xe chở 7 người. Cần ít nhất mấy xe để chở HẾT?', visual: { kind: 'groups', total: 45, perGroup: 7, emoji: '🧒', container: 'xe', showRemainder: true, anim: 'distribute' } },
      ...divSteps(45, 7),
      ...needMore(45, 7, 'xe', 'người', 'Vậy đáp án là 7 xe.'),
    ] },
  },

  // Mỗi bộ sinh: `covers` = id bài cố định cùng kỹ năng/cùng type. Số liệu, tên bạn, ngữ cảnh đổi theo seed (1..16).
  generators: [
    // g11.1: a ÷ b có dư
    {
      id: 'g11.1', covers: ['11.3'],
      make(rng) {
        const b = int(rng, 3, 9);
        const r = int(rng, 1, b - 1);
        const q = int(rng, 4, Math.floor((99 - r) / b));
        const a = q * b + r;
        const choices = shuffle(rng, [
          R(qr(q, r)),
          W(String(q), 'ĐV', `Còn dư ${r} nên phải ghi "dư ${r}". ${q} × ${b} = ${q * b}, mà ${a} − ${q * b} = ${r}.`),
          W(qr(q - 1, r + b), 'QUY', `Số dư ${r + b} không bé hơn số chia ${b}, nên còn chia thêm được một lần nữa: ${q - 1} dư ${r + b} thành ${q} dư ${r}.`),
          W(qr(q + 1, r), 'NHỚ', `${q + 1} × ${b} = ${(q + 1) * b}, lớn hơn ${a}. Thương đã quá lớn.`),
        ]);
        return {
          id: 'g11.1', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: `Tính ${a} ÷ ${b}.`,
          hint: `Tìm số lớn nhất nhân ${b} mà không vượt quá ${a}, rồi xem còn dư mấy.`,
          choices, meta: { a, b },
          explain: { steps: divSteps(a, b) },
        };
      },
      solve(item) { const { a, b } = item.meta; return qr(Math.floor(a / b), a % b); },
    },

    // g11.2: xếp đầy được mấy hộp, thừa mấy
    {
      id: 'g11.2', covers: ['11.4'],
      make(rng) {
        const [cls, noun, box, emoji] = pick(rng, [['cái', 'bánh', 'hộp', '🧁'], ['viên', 'kẹo', 'túi', '🍬'], ['quả', 'cam', 'đĩa', '🍊'], ['chiếc', 'bút chì', 'hộp', '✏️']]);
        const name = pick(rng, ['Lan', 'Mai', 'Nam', 'Hà', 'Bình', 'An']);
        const b = int(rng, 4, 9);
        const r = int(rng, 1, b - 1);
        const q = int(rng, 3, Math.floor((99 - r) / b));
        const a = q * b + r;
        const Box = box[0].toUpperCase() + box.slice(1);
        const choices = shuffle(rng, [
          R(`${q} ${box}, thừa ${r} ${cls}`),
          W(`${q + 1} ${box}, thừa ${b - r} ${cls}`, 'QUY', `${Box} thứ ${q + 1} chưa đầy: ${q + 1} × ${b} = ${(q + 1) * b}, lớn hơn ${a}.`),
          W(`${q - 1} ${box}, thừa ${r + b} ${cls}`, 'QUY', `Thừa ${r + b} ${cls} thì còn đủ xếp thêm một ${box} đầy nữa (${b} ${cls}). Số thừa phải bé hơn ${b}.`),
          W(`${q} ${box}`, 'ĐV', `Còn thừa ${r} ${cls} nữa. Phải trả lời đủ cả số ${box} và số ${cls} thừa.`),
        ]);
        return {
          id: 'g11.2', src: '[biến thể mới]', type: 'choice',
          prompt: `${name} có ${a} ${cls} ${noun}, mỗi ${box} xếp ${b} ${cls}. Xếp ĐẦY được mấy ${box} và còn thừa mấy ${cls}?`,
          hint: `Chia ${a} cho ${b}, nhớ trả lời cả thương và số dư.`,
          choices, meta: { a, b, box, w: cls },
          explain: { steps: [
            { text: `Chia ${a} ${cls} ${noun} vào các ${box}, mỗi ${box} ${b} ${cls}.`, visual: { kind: 'groups', total: a, perGroup: b, emoji, container: box, showRemainder: true, anim: 'distribute' } },
            ...divSteps(a, b),
            ...draft([{ text: `Con viết: ${a} ÷ ${b} = ${q} dư ${r}. Thừa ${r} ${cls}, bé hơn ${b} nên không đủ xếp thêm một ${box} đầy. Vậy xếp đầy được ${q} ${box}, thừa ${r} ${cls}.`, lines: [{ text: `${a} ÷ ${b} = ${q} dư ${r}`, note: 'phép chia' }, { text: `xếp đầy ${q} ${box}, thừa ${r} ${cls}`, note: 'kết quả', color: INK }], mark: 'good' }]),
          ] },
        };
      },
      solve(item) { const { a, b, box, w } = item.meta; return `${Math.floor(a / b)} ${box}, thừa ${a % b} ${w}`; },
    },

    // g11.3: cần mấy hộp để xếp HẾT
    {
      id: 'g11.3', covers: ['11.7'],
      make(rng) {
        const [who, box] = pick(rng, [['người đi tham quan', 'xe'], ['chiếc bút chì', 'túi'], ['quyển truyện', 'hộp'], ['quả cam', 'đĩa']]);
        const b = int(rng, 4, 9);
        let r, q, a;
        let guard = 0;
        do {
          r = int(rng, 1, b - 1);
          q = int(rng, 3, Math.floor((99 - r) / b));
          a = q * b + r;
          guard++;
        } while ([q, q + 1, q + 2].includes(r) && guard < 100);
        const unit = (n) => `${n} ${box}`;
        const verb = box === 'xe' ? 'chở' : 'chứa';
        const choices = shuffle(rng, [
          R(unit(q + 1)),
          W(unit(q), 'QUY', `${q} ${box} chỉ ${verb} được ${q} × ${b} = ${q * b}, còn ${r} chưa có chỗ. Số dư không bỏ đi được.`),
          W(unit(q + 2), 'QUY', `Thừa một ${box}: ${q + 1} ${box} đã đủ chỗ ${(q + 1) * b} cho ${a}.`),
          W(unit(r), 'ĐV', `${r} là số còn dư, không phải số ${box}.`),
        ]);
        return {
          id: 'g11.3', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: `Có ${a} ${who}, mỗi ${box} ${verb} được ${b}. Cần ít nhất mấy ${box} để ${verb} HẾT?`,
          hint: `Chia ${a} cho ${b}. Nếu còn dư thì sao?`,
          choices, meta: { a, b, box },
          explain: { steps: [
            { text: `Chia ${a} ${who} vào các ${box}, mỗi ${box} ${verb} được ${b}.`, visual: { kind: 'groups', total: a, perGroup: b, container: box, showRemainder: true, anim: 'distribute' } },
            ...divSteps(a, b),
            ...needMore(a, b, box, who, `Vậy đáp án là ${q + 1} ${box}.`),
          ] },
        };
      },
      solve(item) { const { a, b, box } = item.meta; return `${Math.ceil(a / b)} ${box}`; },
    },

    // g11.4: chia hết (tách tròn chục) — phép tính trần hoặc lời văn chia đều
    {
      id: 'g11.4', covers: ['11.2'],
      make(rng) {
        let a = 0, b = 0, g = 0;
        for (; g < 300; g++) {
          a = int(rng, 24, 99);
          const bs = [2, 3, 4, 5, 6, 7, 8, 9].filter((x) => a % x === 0 && a / x >= 12 && (a / x) % 10 !== 0);
          if (bs.length) { b = pick(rng, bs); break; }
        }
        const q = a / b;
        const m = Math.floor(q / 10), k = q % 10;
        const big = m * 10 * b;
        const word = rng.next() < 0.55;
        const ctx = pick(rng, [
          { act: (x, y, n) => `${n} có ${x} viên bi, chia đều cho ${y} bạn`, ask: 'Mỗi bạn được bao nhiêu viên bi?', lab: 'Mỗi bạn:', unit: 'viên' },
          { act: (x, y, n) => `${n} xếp ${x} quyển vở vào ${y} hộp đều nhau`, ask: 'Mỗi hộp có bao nhiêu quyển vở?', lab: 'Mỗi hộp:', unit: 'quyển' },
          { act: (x, y, n) => `${n} trồng ${x} cây thành ${y} hàng đều nhau`, ask: 'Mỗi hàng có bao nhiêu cây?', lab: 'Mỗi hàng:', unit: 'cây' },
          { act: (x, y, n) => `${n} chia đều ${x} cái kẹo vào ${y} túi`, ask: 'Mỗi túi có bao nhiêu cái kẹo?', lab: 'Mỗi túi:', unit: 'cái' },
          { act: (x, y, n) => `Lớp của ${n} xếp ${x} bạn thành ${y} hàng đều nhau`, ask: 'Mỗi hàng có bao nhiêu bạn?', lab: 'Mỗi hàng:', unit: 'bạn' },
          { act: (x, y, n) => `${n} đổ đều ${x} lít nước vào ${y} can`, ask: 'Mỗi can có bao nhiêu lít nước?', lab: 'Mỗi can:', unit: 'l' },
        ]);
        const name = pick(rng, NAMES);
        const hints = [];
        const add = (v, code, why) => { if (v > 0 && v !== q && !hints.some((h) => h.match === String(v))) hints.push({ match: String(v), code, why }); };
        add(m * 10, 'QUY', `${big} ÷ ${b} = ${m * 10} mới chia được ${big}. Còn phần còn lại ${a - big}, chia tiếp được ${k}.`);
        add(q - 1, 'NHỚ', `${q - 1} × ${b} = ${(q - 1) * b}, chưa đủ ${a}. Hãy kiểm lại bằng phép nhân.`);
        add(q + 1, 'NHỚ', `${q + 1} × ${b} = ${(q + 1) * b}, vượt quá ${a}. Hãy kiểm lại bằng phép nhân.`);
        add(a - b, 'DẤU', `${a} − ${b} = ${a - b} là phép trừ. Chia đều thì mình dùng phép chia: ${a} ÷ ${b}.`);
        return {
          id: 'g11.4', src: '[biến thể mới]', type: 'numpad',
          prompt: word ? `${ctx.act(a, b, name)}. ${ctx.ask}` : `Tính: ${a} ÷ ${b} = □`,
          hint: `Ước lượng trước: ${big} ÷ ${b} bằng bao nhiêu? Rồi xem còn lại phần nào.`,
          slots: [word ? { label: ctx.lab, answer: String(q), unit: ctx.unit } : { label: `${a} ÷ ${b} =`, answer: String(q) }],
          wrongHints: hints, meta: { a, b, word },
          explain: { steps: divSteps(a, b) },
        };
      },
      solve(item) { const { a, b } = item.meta; return String(a / b); },
    },

    // g11.5: lời văn chia đều (không dư): mỗi nhóm có bao nhiêu / xếp được mấy nhóm — 4 lựa chọn số
    {
      id: 'g11.5', covers: ['11.1'],
      make(rng) {
        let a = 0, d = 0, g = 0;
        for (; g < 300; g++) {
          a = int(rng, 36, 99);
          const ds = [3, 4, 5, 6, 7, 8, 9].filter((x) => a % x === 0 && a / x >= 10 && (a / x) % 10 !== 0);
          if (ds.length) { d = pick(rng, ds); break; }
        }
        const Q = a / d;
        const m = Math.floor(Q / 10), k = Q % 10, big = m * 10 * d;
        const askPer = rng.next() < 0.6;
        const name = pick(rng, NAMES);
        const ctx = pick(rng, [
          { obj: 'cái ghế', unit: 'cái', grp: 'dãy', act: (x, y) => `xếp ${x} cái ghế thành ${y} dãy đều nhau`, per: (x, q) => `có ${x} cái ghế, mỗi dãy xếp ${q} cái ghế` },
          { obj: 'quyển vở', unit: 'quyển', grp: 'túi', act: (x, y) => `chia đều ${x} quyển vở vào ${y} túi`, per: (x, q) => `có ${x} quyển vở, mỗi túi đựng ${q} quyển vở` },
          { obj: 'cây xoài', unit: 'cây', grp: 'hàng', act: (x, y) => `trồng ${x} cây xoài thành ${y} hàng đều nhau`, per: (x, q) => `có ${x} cây xoài, mỗi hàng trồng ${q} cây` },
          { obj: 'chiếc bút', unit: 'chiếc', grp: 'hộp', act: (x, y) => `xếp đều ${x} chiếc bút vào ${y} hộp`, per: (x, q) => `có ${x} chiếc bút, mỗi hộp xếp ${q} chiếc` },
          { obj: 'viên bi', unit: 'viên', grp: 'lọ', act: (x, y) => `chia đều ${x} viên bi vào ${y} lọ`, per: (x, q) => `có ${x} viên bi, mỗi lọ đựng ${q} viên` },
          { obj: 'bông hoa', unit: 'bông', grp: 'bình', act: (x, y) => `cắm đều ${x} bông hoa vào ${y} bình`, per: (x, q) => `có ${x} bông hoa, mỗi bình cắm ${q} bông` },
        ]);
        // askPer: số bị chia a, chia cho d nhóm → mỗi nhóm Q.  Ngược lại: mỗi nhóm có Q vật, tìm số nhóm d.
        const ans = askPer ? Q : d;
        const divisor = askPer ? d : Q;
        const unitWord = askPer ? ctx.unit : ctx.grp;
        const pool = [
          { v: ans + 1, code: 'NHỚ', why: `${ans + 1} × ${divisor} = ${(ans + 1) * divisor}, lớn hơn ${a}. Hãy thử lại bằng phép nhân.` },
          { v: ans - 1, code: 'NHỚ', why: `${ans - 1} × ${divisor} = ${(ans - 1) * divisor}, chưa đủ ${a}. Hãy thử lại bằng phép nhân.` },
          { v: a - divisor, code: 'DẤU', why: `${a} − ${divisor} = ${a - divisor} là phép trừ. Chia đều thì mình dùng phép chia: ${a} ÷ ${divisor}.` },
          { v: ans + 10, code: 'HÀNG', why: `${ans + 10} × ${divisor} = ${(ans + 10) * divisor}, nhiều hơn ${a}. Con kiểm lại hàng chục của thương nhé.` },
          { v: ans - 10, code: 'HÀNG', why: `${ans - 10} × ${divisor} = ${(ans - 10) * divisor}, ít hơn ${a} nhiều. Con kiểm lại hàng chục của thương nhé.` },
          { v: ans + 2, code: 'NHỚ', why: `${ans + 2} × ${divisor} = ${(ans + 2) * divisor}, lớn hơn ${a}. Hãy thử lại bằng phép nhân.` },
        ].filter((o, i, arr) => o.v > 0 && o.v !== ans && arr.findIndex((x) => x.v === o.v) === i);
        const wrongs = shuffle(rng, pool).slice(0, 3);
        const choices = shuffle(rng, [R(`${ans} ${unitWord}`), ...wrongs.map((o) => W(`${o.v} ${unitWord}`, o.code, o.why))]);
        return {
          id: 'g11.5', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: askPer
            ? `${name} ${ctx.act(a, d)}. Mỗi ${ctx.grp} có bao nhiêu ${ctx.obj}?`
            : `${name} ${ctx.per(a, Q)}. Xếp được mấy ${ctx.grp}?`,
          hint: `Thử nhân từng đáp án với ${divisor} xem có ra ${a} không.`,
          choices, meta: { a, d, askPer, unitWord },
          explain: { steps: [
            { text: askPer ? `Chia đều ${a} ${ctx.obj} cho ${d} ${ctx.grp}: ${a} ÷ ${d}. Mình tìm số nhân với ${d} được ${a}.` : `Mỗi ${ctx.grp} có ${Q} ${ctx.obj}. Số ${ctx.grp} là ${a} ÷ ${Q}. Mình tìm số nhân với ${Q} được ${a}.`, visual: { kind: 'array', rows: askPer ? d : Q, cols: askPer ? Q : d, groupBy: 'rows', showEq: true } },
            ...(askPer
              ? divSteps(a, d)
              : draft([
                { text: `Con thử nhân với ${Q}: ${d - 1} × ${Q} = ${(d - 1) * Q}, chưa đủ; ${d} × ${Q} = ${a}, vừa đúng.`, lines: [{ text: `${a} ÷ ${Q} = ?`, note: 'đề bài' }, { text: `${d - 1} × ${Q} = ${(d - 1) * Q}`, note: 'thử: chưa đủ' }, { text: `${d} × ${Q} = ${a}`, note: 'đúng rồi' }] },
                { text: `Vậy ${a} ÷ ${Q} = ${d}.`, lines: [{ text: `${a} ÷ ${Q} = ${d}`, note: 'kết quả', color: INK }] },
              ])),
            { text: `${wrongs.map((o) => `${o.v} × ${divisor} = ${o.v * divisor}`).join('; ')}, đều khác ${a} nên không đúng. Vậy đáp án là ${ans} ${unitWord}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { a, d, askPer, unitWord } = item.meta; return `${askPer ? a / d : d} ${unitWord}`; },
    },

    // g11.6: CHỌN NHIỀU — số nào chia cho b có số dư r (hoặc chia hết cho b)
    {
      id: 'g11.6', covers: ['11.6'],
      make(rng) {
        const b = int(rng, 4, 9);
        const zero = rng.next() < 0.25;
        const r = zero ? 0 : int(rng, 1, b - 1);
        const nOk = rng.next() < 0.5 ? 2 : 3;
        const okVals = [];
        let g = 0;
        while (okVals.length < nOk && g++ < 200) { const v = b * int(rng, 3, Math.floor((99 - r) / b)) + r; if (v >= 20 && !okVals.includes(v)) okVals.push(v); }
        const bad = [];
        g = 0;
        while (bad.length < 4 - nOk && g++ < 300) {
          const rr = (r + int(rng, 1, b - 1)) % b;
          const v = b * int(rng, 3, Math.floor(98 / b)) + rr;
          if (v >= 20 && v <= 99 && v % b !== r && !okVals.includes(v) && !bad.includes(v)) bad.push(v);
        }
        const nums = shuffle(rng, [...okVals, ...bad]);
        const choices = nums.map((v) => (v % b === r
          ? R(String(v))
          : W(String(v), 'QUY', `${v} ÷ ${b} = ${Math.floor(v / b)} dư ${v % b} (${Math.floor(v / b)} × ${b} = ${Math.floor(v / b) * b}). ${r === 0 ? `Còn dư ${v % b} nên ${v} không chia hết cho ${b}` : `Số dư là ${v % b}, không phải ${r}`}.`)));
        const rowOf = (v) => [String(v), String(Math.floor(v / b)), String(v % b)];
        const tbl = (n, hi) => ({ kind: 'table', headers: ['Số', 'Thương', 'Dư'], rows: nums.map((v, i) => (i < n ? rowOf(v) : [String(v), '?', '?'])), ...(hi ? { highlight: hi } : {}) });
        const okIdx = nums.map((v, i) => (v % b === r ? i : -1)).filter((i) => i >= 0);
        const okSorted = nums.filter((v) => v % b === r).sort((x, y) => x - y);
        const want = r === 0 ? 'chia hết cho ' + b : `chia cho ${b} có số dư là ${r}`;
        return {
          id: 'g11.6', src: '[biến thể mới]', type: 'multi',
          prompt: `Số nào ${want}? Chọn tất cả các số đúng.`,
          choices,
          hint: 'Con kiểm từng số, đừng dừng ở số đầu tiên.',
          meta: { b, r, nums },
          explain: { steps: multiRemSteps(nums, b, r) },
        };
      },
      solve(item) { const { b, r, nums } = item.meta; return nums.filter((v) => v % b === r).map(String).sort().join(','); },
    },

    // g11.7: Đúng/Sai — "cần ... để xếp HẾT" (số dư phải thêm một túi/hộp)
    {
      id: 'g11.7', covers: ['11.5'],
      make(rng) {
        const name = pick(rng, NAMES);
        const ctx = pick(rng, [
          { obj: 'chiếc bút chì', unit: 'chiếc', box: 'túi', emo: '✏️' },
          { obj: 'quả cam', unit: 'quả', box: 'đĩa', emo: '🍊' },
          { obj: 'cái bánh', unit: 'cái', box: 'hộp', emo: '🧁' },
          { obj: 'viên kẹo', unit: 'viên', box: 'túi', emo: '🍬' },
          { obj: 'quyển truyện', unit: 'quyển', box: 'hộp', emo: '📚' },
          { obj: 'bạn học sinh', unit: 'bạn', box: 'xe', emo: '🧒' },
        ]);
        const { unit, box } = ctx;
        rng.next();
        const roll = rng.next();
        const kind = roll < 0.5 ? 'T' : roll < 0.75 ? 'F' : 'O';
        const b = int(rng, 4, 9), r = int(rng, 2, b - 1), q = int(rng, 3, Math.floor((99 - r) / b));
        const a = q * b + r;
        const claim = kind === 'T' ? q + 1 : kind === 'F' ? q : q + r;
        const pv = (sh, lg) => (rng.next() < 0.5 ? sh : lg); // mỗi lý do chọn ngẫu nhiên bản ngắn/dài để độ dài không lộ đáp án
        const verb = box === 'xe' ? `mỗi ${box} chở được ${b} ${unit}` : `mỗi ${box} đựng ${b} ${unit}`;
        const hold = box === 'xe' ? 'chở' : 'đựng';
        const reasons = shuffle(rng, kind === 'T'
          ? [
            { text: pv(`Đúng, vì ${r} ${unit} dư cần thêm 1 ${box}`, `Đúng, vì ${r} ${unit} còn lại phải có thêm 1 ${box} để ${hold}`), correct: true },
            { text: pv(`Đúng, vì ${a} ÷ ${b} chia hết, không dư`, `Đúng, vì ${a} ÷ ${b} = ${q}, nên ${q} ${box} là vừa đủ, không dư`), correct: false, code: 'QUY', why: `${a} ÷ ${b} = ${q} dư ${r}, còn dư ${r}. Số dư cần thêm 1 ${box}.` },
            { text: pv(`Đúng, vì mỗi ${unit} dư cần 1 ${box} nữa`, `Đúng, vì ${r} ${unit} còn lại cần thêm ${r} ${box}, mỗi ${unit} một ${box}`), correct: false, code: 'QUY', why: `Mỗi ${box} ${hold} được tới ${b} ${unit}, nên ${r} ${unit} còn lại chỉ cần thêm MỘT ${box}.` },
          ]
          : kind === 'F'
            ? [
              { text: pv(`Sai, vì ${r} ${unit} dư cần thêm 1 ${box}`, `Sai, vì ${r} ${unit} còn lại phải có thêm 1 ${box} để ${hold}`), correct: true },
              { text: pv(`Sai, vì chỉ cần ${q - 1} ${box} thôi`, `Sai, vì chỉ cần ${q - 1} ${box} là đủ chỗ cho ${a} ${unit}`), correct: false, code: 'NGƯỢC', why: `${q - 1} ${box} chỉ ${hold} được ${(q - 1) * b} ${unit}, ít hơn ${a}. Ít ${box} thì không đủ chỗ.` },
              { text: pv(`Sai, vì cần ${q + r} ${box} mới đủ`, `Sai, vì cần ${q + r} ${box}, tức là ${q} + ${r} ${box}`), correct: false, code: 'QUY', why: `${r} ${unit} dư chỉ cần thêm MỘT ${box}, vì mỗi ${box} ${hold} được tới ${b} ${unit}.` },
            ]
            : [
              { text: pv(`Sai, vì ${r} ${unit} dư chỉ cần thêm 1 ${box}`, `Sai, vì ${r} ${unit} còn lại chỉ cần thêm 1 ${box} nữa là đủ`), correct: true },
              { text: pv(`Sai, vì chỉ cần ${q} ${box} là đủ`, `Sai, vì chỉ cần ${q} ${box}, số ${unit} dư bỏ đi được`), correct: false, code: 'QUY', why: `${q} ${box} đầy chỉ ${hold} được ${q * b} ${unit}, còn ${r} ${unit} chưa có chỗ. Số dư không bỏ đi được.` },
              { text: pv(`Sai, vì cần ${q + 2} ${box} mới đủ`, `Sai, vì cần ${q + 2} ${box} mới đủ chỗ cho ${unit}`), correct: false, code: 'QUY', why: `${q + 1} ${box} đã đủ chỗ cho ${(q + 1) * b} ${unit}, mà chỉ có ${a} ${unit}. Thêm nữa là thừa.` },
            ]);
        const isTrue = kind === 'T';
        const vis = { kind: 'groups', total: a, perGroup: b, emoji: ctx.emo, container: box, showRemainder: true };
        const steps = [
          { text: `Chia ${a} ${ctx.obj} vào các ${box}, mỗi ${box} ${hold} được ${b} ${unit}.`, visual: vis },
          ...divSteps(a, b),
          ...needMore(a, b, box, unit, isTrue ? `Vậy ${name} nói ĐÚNG: để xếp hết cần ${q + 1} ${box}.` : `Vậy ${name} nói SAI: để xếp hết cần ${q + 1} ${box}, không phải ${claim}.`),
        ];
        return {
          id: 'g11.7', src: '[biến thể mới]', type: 'tf',
          prompt: `${name} có ${a} ${ctx.obj}, ${verb}. ${name} nói: "Cần ${claim} ${box} để xếp HẾT." ${name} nói đúng hay SAI?`,
          answer: isTrue, reasons,
          hint: `Chia ${a} cho ${b} và xem còn dư không.`,
          whyWrong: `${a} ÷ ${b} = ${q} dư ${r}. ${q} ${box} chỉ ${box === 'xe' ? 'chở' : 'đựng'} được ${q * b} ${unit}, còn ${r} ${unit} chưa có chỗ. Phải thêm 1 ${box}, nên cần ${q + 1} ${box}.`,
          meta: { a, b, claim },
          explain: { steps },
        };
      },
      solve(item) { const { a, b, claim } = item.meta; return String(Math.ceil(a / b) === claim); },
    },
  ],
};

// "Làm nóng" bộ số ngẫu nhiên: các seed liền kề cho số đầu tiên gần nhau, nên bỏ vài số đầu để bài khác hẳn nhau.
topic.generators.forEach((g) => { const mk = g.make; g.make = (rng) => { rng.next(); rng.next(); rng.next(); return mk(rng); }; });
export default topic;
