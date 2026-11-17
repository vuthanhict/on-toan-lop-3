import { pick, int, shuffle } from '../core/rng.js';

const R = (text) => ({ text, correct: true });
const W = (text, code, why) => ({ text, code, why });
const NAMES = ['Mai', 'Nam', 'Lan', 'Hà', 'Bình', 'An', 'Chi', 'Minh', 'Linh', 'Phúc', 'Khoa', 'Thảo', 'Huy', 'Ngọc', 'Tú', 'Vy'];
// cặp thừa số nhân ra số tròn chục (2 × 5 = 10, 4 × 5 = 20 …): dùng để nhóm cho dễ nhẩm
const TENS = [[2, 5], [4, 5], [6, 5], [8, 5]];
// ----- lời giải kiểu vở ô li: các dòng viết nháp nối tiếp (hình workout) -----
const INK = '#4B34A8';
// mỗi nhóm {text, lines:[{text,note?,color?}], mark?}; hình workout hiện dần các dòng, nhóm cuối đánh dấu hoàn chỉnh
const draft = (groups) => {
  const lines = groups.flatMap((g) => g.lines); let n = 0;
  return groups.map((g, i) => {
    const from = n; n += g.lines.length;
    return Object.assign({ text: g.text, visual: Object.assign({ kind: 'workout', lines, upto: n, from, anim: 'write' }, i === groups.length - 1 ? { done: true } : {}) }, g.mark ? { mark: g.mark } : {});
  });
};
const tbl = (rows, highlight) => ({ kind: 'table', headers: ['Bạn', 'Cách làm', 'Kết quả'], rows, ...(highlight ? { highlight } : {}) });

const bal = (l, lv, r, rv, tilt) => ({
  kind: 'balance',
  left: [{ label: l, value: lv }],
  right: [{ label: r, value: rv }],
  ...(tilt ? { tilt } : {}),
});

const topic = {
  id: 'cd09', no: 9, day: 3, title: 'Tính chất kết hợp, nhẩm cho dễ', short: 'Kết hợp', icon: '🎁',
  intro: 'Nhân ba số, nhóm hai số nào trước cũng được. Hãy chọn cách nhóm ra số tròn chục để nhẩm cho nhanh.',

  remember: [
    {
      text: 'Nhân ba số, nhân hai số nào trước cũng được, kết quả vẫn như nhau. Ví dụ (2 × 3) × 4 = 2 × (3 × 4) = 24.',
      visual: { ...bal('(2 × 3) × 4', 24, '2 × (3 × 4)', 24, 'level'), anim: 'tilt' },
    },
    {
      text: 'Chọn cách nhóm ra số tròn chục thì nhẩm nhanh: 2 × 5 = 10, 4 × 5 = 20, 6 × 5 = 30.',
      visual: { kind: 'table', headers: ['Cặp nhân', 'Kết quả'], rows: [['2 × 5', '10'], ['4 × 5', '20'], ['6 × 5', '30']], highlight: [[0, 1], [1, 1], [2, 1]] },
    },
    {
      text: 'Chỉ được đổi cách nhóm, KHÔNG được đổi dấu × thành dấu +. (9 × 6) × 5 = 270, còn (9 + 6) × 5 chỉ bằng 75.',
      visual: bal('(9 × 6) × 5', 270, '(9 + 6) × 5', 75),
    },
    {
      text: 'Cách làm nháp: con viết từng dòng, ghép hai thừa số ra số tròn chục trước. Ví dụ 25 × 4 × 7 = (25 × 4) × 7 = 100 × 7 = 700.',
      visual: { kind: 'workout', lines: [{ text: '25 × 4 × 7', note: 'đề bài' }, { text: '= (25 × 4) × 7', note: 'ghép tròn chục' }, { text: '= 100 × 7', note: '25 × 4 = 100' }, { text: '= 700', note: 'kết quả' }], upto: 4, done: true },
    },
  ],

  lesson: [
    {
      text: 'Mỗi thùng có 2 hộp, mỗi hộp 5 chiếc bút. Một thùng có 2 × 5 = 10 chiếc bút.',
      visual: { kind: 'array', rows: 2, cols: 5, emoji: '✏️', showEq: true, anim: 'fill' },
    },
    {
      text: 'Có 7 thùng. Số bút là 7 × 2 × 5. Mình có hai cách nhóm để tính.',
      visual: { kind: 'table', headers: ['Cách nhóm', 'Còn lại', 'Kết quả'], rows: [['(7 × 2) × 5', '14 × 5', '?'], ['7 × (2 × 5)', '7 × 10', '?']] },
    },
    ...draft([
      { text: 'Cách 1: nhóm 7 × 2 = 14 trước, rồi 14 × 5 = 70. Nhẩm 14 × 5 hơi lâu một chút.', lines: [{ text: '7 × 2 × 5', note: 'đề bài' }, { text: '(7 × 2) × 5 = 14 × 5 = 70', note: 'nhẩm lâu' }] },
      { text: 'Cách 2: nhóm 2 × 5 = 10 trước (một thùng có 10 bút), rồi 7 × 10 = 70. Số tròn chục nên nhẩm rất nhanh.', lines: [{ text: '7 × (2 × 5) = 7 × 10 = 70', note: 'tròn chục: nhanh' }], mark: 'good' },
      { text: 'Hai cách đều ra 70. Con chỉ được đổi cách nhóm. Nếu đổi dấu thành (7 + 2) × 5 = 45 thì SAI.', lines: [{ text: '(7 + 2) × 5 = 9 × 5 = 45', note: 'đổi dấu: SAI' }], mark: 'bad' },
      { text: 'Ghép thừa số tròn chục: 25 × 4 = 100, rồi 100 × 7 = 700. Con viết từng dòng như vậy.', lines: [{ text: '25 × 4 × 7', note: 'đề bài' }, { text: '= (25 × 4) × 7', note: 'ghép tròn chục' }, { text: '= 100 × 7', note: '25 × 4 = 100' }, { text: '= 700', note: 'kết quả' }], mark: 'good' },
    ]),
  ],

  items: [
    {
      id: '9.1', src: 'S1-C9', type: 'choice',
      prompt: 'Tính 9 × 6 × 5. Hai bạn làm như trong bảng. Ai làm ĐÚNG?',
      visual: { kind: 'table', headers: ['Bạn', 'Cách làm', 'Kết quả'], rows: [['Mai', '(9 × 6) × 5 = 54 × 5', '270'], ['Nam', '(9 + 6) × 5 = 15 × 5', '75']] },
      hint: 'Nhìn kĩ dấu giữa số 9 và số 6 trong ngoặc của mỗi bạn.',
      choices: [
        R('Mai'),
        W('Nam', 'DẤU', 'Nam đổi 9 × 6 thành 9 + 6. Nhưng mình chỉ được đổi cách nhóm, không được đổi dấu phép tính.'),
        W('Cả hai bạn', 'QUY', 'Hai kết quả khác nhau (270 và 75) thì không thể cùng đúng. Chỉ một bạn giữ đúng dấu ×.'),
      ],
      explain: { steps: draft([
        { text: 'Ước lượng trước: 9 × 6 × 5 gần bằng 10 × 6 × 5 = 300. Kết quả đúng phải ở gần 300.', lines: [{ text: '9 × 6 × 5 ≈ 10 × 6 × 5 = 300', note: 'ước lượng' }] },
        { text: 'Mai nhóm 9 × 6 = 54, rồi 54 × 5 = 270. Kết quả gần 300, hợp lí.', lines: [{ text: 'Mai: (9 × 6) × 5 = 54 × 5 = 270', note: 'giữ dấu ×' }], mark: 'good' },
        { text: 'Nam đổi 9 × 6 thành 9 + 6 = 15, ra 75. Kết quả quá xa 300 vì Nam đã đổi dấu.', lines: [{ text: 'Nam: (9 + 6) × 5 = 15 × 5 = 75', note: 'đổi dấu: sai' }], mark: 'bad' },
        { text: 'Vậy Mai làm đúng: con chỉ đổi cách nhóm, giữ nguyên dấu ×. Nhóm kiểu khác 9 × (6 × 5) = 9 × 30 cũng ra 270.', lines: [{ text: '9 × (6 × 5) = 9 × 30 = 270', note: 'kiểm tra', color: INK }], mark: 'good' },
      ]) },
      tags: ['kết hợp', 'DẤU'],
    },
    {
      id: '9.2', src: 'S3-C12', type: 'choice',
      prompt: 'Tính 9 × 4 × 5. Hai bạn làm như trong bảng. Cách của bạn nào dễ nhẩm hơn?',
      visual: { kind: 'table', headers: ['Bạn', 'Cách làm', 'Kết quả'], rows: [['Na', '(9 × 4) × 5 = 36 × 5', '180'], ['Lan', '9 × (4 × 5) = 9 × 20', '180']] },
      hint: 'Cả hai đều ra 180. Chọn cách có phép nhân ra số tròn chục.',
      choices: [
        W('Na', 'QUY', 'Kết quả hai bạn bằng nhau (180). Nhưng nhẩm 36 × 5 khó hơn nhẩm 9 × 20.'),
        R('Lan'),
        W('Hai cách như nhau', 'QUY', 'Hai cách đều đúng, chỉ khác độ dễ. 4 × 5 = 20 là số tròn chục nên cách của Lan nhẩm nhanh hơn.'),
      ],
      explain: { steps: draft([
        { text: 'Hai bạn đều ra 180. Nhân ba số, nhóm cách nào cũng được.', lines: [{ text: '9 × 4 × 5', note: 'đề bài' }, { text: 'Na: (9 × 4) × 5 = 36 × 5 = 180' }, { text: 'Lan: 9 × (4 × 5) = 9 × 20 = 180' }] },
        { text: 'Na nhóm 9 × 4 = 36, rồi nhân 36 × 5. Nhẩm 36 × 5 hơi lâu.', lines: [{ text: '36 × 5 = ?', note: 'khó nhẩm' }] },
        { text: 'Lan nhóm 4 × 5 = 20, là số tròn chục. 9 × 20: lấy 9 × 2 = 18, thêm một số 0 được 180.', lines: [{ text: '9 × 20 → 9 × 2 = 18 → 180', note: 'tròn chục: dễ' }], mark: 'good' },
        { text: 'Vậy cách của Lan dễ nhẩm hơn.', lines: [{ text: '→ cách nào thuận tiện? Lan', color: INK }], mark: 'good' },
      ]) },
      tags: ['kết hợp', 'thuận tiện'],
    },
    {
      id: '9.3', src: 'S2-C10', type: 'numpad',
      prompt: 'Điền hai số còn thiếu:\n26 × 2 × 5 = 26 × □ = □',
      hint: 'Nhóm hai thừa số cuối thành một số tròn chục trước.',
      slots: [
        { label: 'Ô thứ nhất:', answer: '10' },
        { label: 'Ô thứ hai:', answer: '260' },
      ],
      wrongHints: [
        { match: '7|182', code: 'DẤU', why: '2 × 5 = 10, không phải 2 + 5 = 7. Nhóm chỉ đổi cách nhân, không đổi dấu.' },
        { match: '52|260', code: 'QUY', why: '26 × 2 = 52 là nhóm hai số đầu. Ở đây 2 × 5 đã được nhóm thành một ô, nên ô thứ nhất là 2 × 5 = 10.' },
      ],
      explain: { steps: draft([
        { text: 'Nhóm hai thừa số cuối: 2 × 5 = 10. Ô thứ nhất là 10.', lines: [{ text: '26 × 2 × 5', note: 'đề bài' }, { text: '= 26 × (2 × 5)', note: 'nhóm 2 × 5' }, { text: '= 26 × 10', note: 'ô thứ nhất: 10' }] },
        { text: 'Còn lại 26 × 10. Nhân với 10 thì viết thêm một số 0: 26 × 10 = 260.', lines: [{ text: '= 260', note: 'ô thứ hai: 260' }] },
        { text: 'Kiểm tra bằng cách nhóm khác: 26 × 2 = 52, rồi 52 × 5 = 260. Cũng ra 260.', lines: [{ text: '(26 × 2) × 5 = 52 × 5 = 260', note: 'kiểm tra' }] },
        { text: 'Vậy hai ô là 10 và 260.', lines: [{ text: 'Hai ô: 10 và 260', color: INK }], mark: 'good' },
      ]) },
      tags: ['kết hợp'],
    },
    {
      id: '9.4', src: 'S4 Q20', type: 'match',
      prompt: 'Tính 4 × 6 × 5. Nối mỗi cách nhóm với phép tính còn lại đúng.',
      left: [
        { id: 'a', text: 'Nhóm 4 × 6 trước' },
        { id: 'b', text: 'Nhóm 6 × 5 trước' },
      ],
      right: [
        { id: 'r1', text: '24 × 5 = 120' },
        { id: 'r2', text: '4 × 30 = 120' },
        { id: 'r3', text: '4 × 11 = 44' },
      ],
      pairs: { a: 'r1', b: 'r2' },
      hint: 'Tính phép nhân trong ngoặc trước rồi xem còn lại phép nào.',
      explain: { steps: draft([
        { text: 'Nhóm 4 × 6 = 24. Còn lại 24 × 5 = 120.', lines: [{ text: '4 × 6 × 5', note: 'đề bài' }, { text: '(4 × 6) × 5 = 24 × 5 = 120', note: 'nhóm 4 × 6' }] },
        { text: 'Nhóm 6 × 5 = 30. Còn lại 4 × 30 = 120.', lines: [{ text: '4 × (6 × 5) = 4 × 30 = 120', note: 'nhóm 6 × 5' }] },
        { text: '4 × 11 = 44 là do đổi 6 × 5 thành 6 + 5 = 11. Cách này SAI vì đã đổi dấu ×.', lines: [{ text: '4 × (6 + 5) = 4 × 11 = 44', note: 'đổi dấu: sai' }], mark: 'bad' },
        { text: 'Vậy: nhóm 4 × 6 nối với 24 × 5; nhóm 6 × 5 nối với 4 × 30. Cách sau dễ nhẩm hơn vì có số tròn chục 30.', lines: [{ text: '→ cách nào thuận tiện? 4 × 30', color: INK }], mark: 'good' },
      ]) },
      tags: ['kết hợp', 'thuận tiện'],
    },
    {
      id: '9.5', src: 'S5 Q11', type: 'choice',
      prompt: 'Muốn tính 5 × 28, mình viết 28 = 7 × 4, được 5 × 7 × 4. Cách nhóm nào ĐÚNG và cho ra phép tính MỚI dễ hơn?',
      hint: 'Cách đúng vẫn giữ dấu ×. Phép tính mới không được giống phép tính ban đầu.',
      choices: [
        R('(5 × 7) × 4 = 35 × 4 = 140'),
        W('5 × (7 × 4) = 5 × 28', 'QUY', 'Nhóm 7 × 4 = 28 lại quay về phép tính cũ 5 × 28, chưa tính thêm được gì.'),
        W('(5 + 7) × 4 = 48', 'DẤU', 'Cách này đổi dấu × thành +, nên ra 48, khác với 140.'),
      ],
      explain: { steps: draft([
        { text: '28 = 7 × 4, nên 5 × 28 = 5 × 7 × 4. Con cần chọn cách nhóm.', lines: [{ text: '5 × 28 = 5 × 7 × 4', note: 'viết 28 = 7 × 4' }] },
        { text: 'Nhóm 5 × 7 = 35. Còn 35 × 4: 35 × 2 = 70, gấp đôi nữa là 140.', lines: [{ text: '(5 × 7) × 4 = 35 × 4 = 140', note: 'đúng, phép mới' }], mark: 'good' },
        { text: 'Cách 5 × (7 × 4) quay lại 5 × 28. Cách (5 + 7) × 4 đổi dấu nên SAI.', lines: [{ text: '5 × (7 × 4) = 5 × 28', note: 'quay lại' }, { text: '(5 + 7) × 4 = 48', note: 'đổi dấu: sai' }], mark: 'bad' },
        { text: 'Vậy đáp án là (5 × 7) × 4 = 35 × 4 = 140.', lines: [{ text: '(5 × 7) × 4 = 35 × 4 = 140', color: INK }], mark: 'good' },
      ]) },
      tags: ['kết hợp'],
    },
    {
      id: '9.6', src: 'T6 C4', type: 'tf',
      prompt: 'Mi tính 16 × 5 như sau: 16 = 8 × 2, rồi 8 × (2 × 5) = 8 × 10 = 80. Cách tính của Mi đúng hay SAI?',
      hint: 'Xem Mi có giữ dấu × và chỉ đổi cách nhóm không.',
      answer: true,
      reasons: [
        { text: 'Đúng, vì 8 × 2 = 16 và chỉ đổi cách nhóm nên kết quả vẫn bằng', correct: true },
        { text: 'Đúng, vì 8 + 2 = 10', correct: false, code: 'DẤU', why: 'Số 10 không phải do 8 + 2 mà do 2 × 5 = 10. Mi đã nhân, không cộng.' },
        { text: 'Đúng, vì đổi dấu × thành + nào cũng được', correct: false, code: 'DẤU', why: 'Không được đổi dấu ×. Cách của Mi đúng vì chỉ đổi cách nhóm.' },
      ],
      whyWrong: 'Cách của Mi đúng: 16 = 8 × 2, nhóm 2 × 5 = 10 thì 8 × 10 = 80. Kiểm tra: 16 × 5 = 10 × 5 + 6 × 5 = 50 + 30 = 80, cùng kết quả.',
      explain: { steps: draft([
        { text: '16 = 8 × 2 nên 16 × 5 = 8 × 2 × 5.', lines: [{ text: '16 × 5 = 8 × 2 × 5', note: 'viết 16 = 8 × 2' }] },
        { text: 'Nhóm 2 × 5 = 10, rồi 8 × 10 = 80. Chỉ đổi cách nhóm, giữ dấu ×.', lines: [{ text: '= 8 × (2 × 5) = 8 × 10 = 80', note: 'giữ dấu ×' }], mark: 'good' },
        { text: 'Kiểm tra: 16 × 5 = 10 × 5 + 6 × 5 = 50 + 30 = 80. Hai cách bằng nhau.', lines: [{ text: '16 × 5 = 50 + 30 = 80', note: 'kiểm tra' }] },
        { text: 'Vậy cách tính của Mi ĐÚNG và dễ nhẩm vì có 2 × 5 = 10.', lines: [{ text: '→ Mi làm ĐÚNG', color: INK }], mark: 'good' },
      ]) },
      tags: ['kết hợp', 'thuận tiện'],
    },
  ],

  variant: {
    id: '9.7', src: '[biến thể mới]', type: 'choice',
    prompt: 'Mỗi thùng có 2 hộp, mỗi hộp 5 chiếc bút. 7 thùng có bao nhiêu chiếc bút? Chọn cách tính 7 × 2 × 5 DỄ NHẨM NHẤT.',
    hint: 'Tìm hai số nhân với nhau ra số tròn chục.',
    choices: [
      W('(7 × 2) × 5 = 14 × 5 = 70', 'QUY', 'Cách này cũng ra 70 nhưng nhẩm chậm hơn. Câu hỏi là cách DỄ NHẨM NHẤT: nhóm 2 × 5 = 10.'),
      R('7 × (2 × 5) = 7 × 10 = 70'),
      W('7 × 7 = 49', 'DẤU', 'Cách này đổi 2 × 5 thành 2 + 5 = 7. Không được đổi dấu ×.'),
    ],
    explain: { steps: draft([
      { text: 'Nhân ba số có thể nhóm hai số nào trước cũng được. Con tìm cách ra số tròn chục.', lines: [{ text: '7 × 2 × 5', note: 'đề bài' }, { text: '(7 × 2) × 5 = 14 × 5 = 70', note: 'nhẩm lâu' }] },
      { text: '2 × 5 = 10 là số tròn chục. Nhóm xong còn 7 × 10 = 70, nhẩm ngay được.', lines: [{ text: '7 × (2 × 5) = 7 × 10 = 70', note: 'tròn chục: nhanh' }], mark: 'good' },
      { text: 'Còn 7 × 7 = 49 là SAI do đổi 2 × 5 thành 2 + 5.', lines: [{ text: '7 × (2 + 5) = 7 × 7 = 49', note: 'đổi dấu: sai' }], mark: 'bad' },
      { text: 'Vậy đáp án là 7 × (2 × 5) = 7 × 10 = 70 chiếc bút.', lines: [{ text: '→ cách nào thuận tiện? 7 × 10', color: INK }], mark: 'good' },
    ]) },
  },

  // Mỗi bộ sinh: `covers` = id bài cố định cùng kỹ năng/cùng type. Số liệu, tên bạn, ngữ cảnh đổi theo seed (1..16).
  generators: [
    // g9.1: Ai làm ĐÚNG / SAI? (một bạn đổi cách nhóm, một bạn đổi dấu × thành +)
    {
      id: 'g9.1', covers: ['9.1'],
      make(rng) {
        const a = int(rng, 3, 9), b = int(rng, 3, 9), c = pick(rng, [3, 4, 5, 6, 7]);
        const names = shuffle(rng, NAMES).slice(0, 2);
        const mulIdx = rng.next() < 0.5 ? 0 : 1;
        const askWrong = rng.next() < 0.4;
        const gR = pick(rng, ['ab', 'bc']), gW = pick(rng, ['ab', 'bc']);
        const T = a * b * c;
        const right = names[mulIdx], wrong = names[1 - mulIdx];
        const cellR = gR === 'ab' ? `(${a} × ${b}) × ${c} = ${a * b} × ${c}` : `${a} × (${b} × ${c}) = ${a} × ${b * c}`;
        const vW = gW === 'ab' ? (a + b) * c : a * (b + c);
        const cellW = gW === 'ab' ? `(${a} + ${b}) × ${c} = ${a + b} × ${c}` : `${a} × (${b} + ${c}) = ${a} × ${b + c}`;
        const swapTxt = gW === 'ab' ? `${a} × ${b} thành ${a} + ${b} = ${a + b}` : `${b} × ${c} thành ${b} + ${c} = ${b + c}`;
        const rowR = [right, cellR, String(T)], rowW = [wrong, cellW, String(vW)];
        const rows = mulIdx === 0 ? [rowR, rowW] : [rowW, rowR];
        const hi = (i) => [[i, 1], [i, 2]];
        const word = askWrong ? 'SAI' : 'ĐÚNG';
        const choices = shuffle(rng, askWrong
          ? [
            R(wrong),
            W(right, 'ĐỌC', `${right} giữ nguyên dấu ×, chỉ đổi cách nhóm nên làm ĐÚNG. Câu hỏi đang tìm bạn làm SAI.`),
            W('Cả hai bạn', 'QUY', `Chỉ ${wrong} đổi dấu ×. ${right} vẫn giữ dấu × nên không sai.`),
          ]
          : [
            R(right),
            W(wrong, 'DẤU', `${wrong} đổi ${swapTxt}. Nhưng mình chỉ được đổi cách nhóm, không được đổi dấu phép tính.`),
            W('Cả hai bạn', 'QUY', `Hai kết quả khác nhau (${T} và ${vW}) thì không thể cùng đúng.`),
          ]);
        const iR = mulIdx, iW = 1 - mulIdx;
        return {
          id: 'g9.1', src: '[biến thể mới]', type: 'choice',
          prompt: `Tính ${a} × ${b} × ${c}. Hai bạn làm như trong bảng. Ai làm ${word}?`,
          visual: tbl(rows),
          hint: `Nhìn kĩ dấu giữa các số trong ngoặc của mỗi bạn.`,
          choices, meta: { a, b, c, names, results: mulIdx === 0 ? [T, vW] : [vW, T], askWrong },
          explain: { steps: draft([
            { text: `${right} nhóm ra ${cellR.split(' = ')[1]}, rồi tính được ${T}. Giữ nguyên dấu ×.`, lines: [{ text: `${a} × ${b} × ${c}`, note: 'đề bài' }, { text: `${right}: ${gR === 'ab' ? `(${a} × ${b}) × ${c}` : `${a} × (${b} × ${c})`} = ${cellR.split(' = ')[1]} = ${T}`, note: 'giữ dấu ×' }], mark: 'good' },
            { text: `${wrong} đổi ${swapTxt}, ra ${vW}. Vì đổi dấu nên kết quả khác ${T}.`, lines: [{ text: `${wrong}: ${cellW} = ${vW}`, note: 'đổi dấu: sai' }], mark: 'bad' },
            { text: askWrong
              ? `Vậy ${wrong} làm SAI vì đã đổi dấu ×. Kiểm tra: ${a} × ${b} × ${c} = ${a * b} × ${c} = ${T}.`
              : `Vậy ${right} làm đúng: con chỉ đổi cách nhóm, giữ dấu ×. Kiểm tra: ${a} × (${b} × ${c}) = ${a} × ${b * c} = ${T}.`, lines: [{ text: `${a} × (${b} × ${c}) = ${a} × ${b * c} = ${T}`, note: 'kiểm tra', color: INK }], mark: 'good' },
          ]) },
        };
      },
      solve(item) { const { a, b, c, names, results, askWrong } = item.meta; const T = a * b * c; return names[results.findIndex((v) => (v === T) !== askWrong)]; },
    },

    // g9.2: điền 2 ô x × p × q = x × □ = □  (cặp tròn chục ở cuối hoặc ở đầu)
    {
      id: 'g9.2', covers: ['9.3'],
      make(rng) {
        const [p, q] = pick(rng, [[2, 5], [5, 2], [4, 5], [5, 4], [6, 5], [5, 6], [8, 5], [5, 8]]);
        const x = int(rng, 12, 49);
        const front = rng.next() < 0.5;
        const pq = p * q, res = x * pq;
        const zero = `${x} × ${pq / 10} = ${x * pq / 10}, rồi thêm một số 0 được ${res}`;
        return {
          id: 'g9.2', src: '[biến thể mới]', type: 'numpad',
          prompt: front ? `Điền hai số còn thiếu:\n${p} × ${q} × ${x} = □ × ${x} = □` : `Điền hai số còn thiếu:\n${x} × ${p} × ${q} = ${x} × □ = □`,
          hint: front ? 'Nhóm hai thừa số đầu thành một số tròn chục trước.' : 'Nhóm hai thừa số cuối thành một số tròn chục trước.',
          slots: [
            { label: 'Ô thứ nhất:', answer: String(pq) },
            { label: 'Ô thứ hai:', answer: String(res) },
          ],
          wrongHints: [
            { match: `${p + q}|${x * (p + q)}`, code: 'DẤU', why: `${p} × ${q} = ${pq}, không phải ${p} + ${q} = ${p + q}. Nhóm chỉ đổi cách nhân, không đổi dấu.` },
            { match: `${front ? x * q : x * p}|${res}`, code: 'QUY', why: `Ở đây ${p} × ${q} đã được nhóm thành một ô, nên ô thứ nhất là ${p} × ${q} = ${pq}.` },
          ],
          meta: { x, p, q, front },
          explain: { steps: draft([
            { text: `Nhóm hai thừa số ${front ? 'đầu' : 'cuối'}: ${p} × ${q} = ${pq}. Ô thứ nhất là ${pq}.`, lines: [{ text: front ? `${p} × ${q} × ${x}` : `${x} × ${p} × ${q}`, note: 'đề bài' }, { text: front ? `= (${p} × ${q}) × ${x}` : `= ${x} × (${p} × ${q})`, note: `nhóm ${p} × ${q}` }, { text: front ? `= ${pq} × ${x}` : `= ${x} × ${pq}`, note: `ô thứ nhất: ${pq}` }] },
            { text: `Còn lại ${front ? `${pq} × ${x}` : `${x} × ${pq}`}. Lấy ${zero}.`, lines: [{ text: `= ${res}`, note: `ô thứ hai: ${res}` }] },
            { text: front
              ? `Kiểm tra bằng cách nhóm khác: ${q} × ${x} = ${q * x}, rồi ${p} × ${q * x} = ${res}. Cũng ra ${res}.`
              : `Kiểm tra bằng cách nhóm khác: ${x} × ${p} = ${x * p}, rồi ${x * p} × ${q} = ${res}. Cũng ra ${res}.`, lines: [{ text: front ? `${p} × (${q} × ${x}) = ${p} × ${q * x} = ${res}` : `(${x} × ${p}) × ${q} = ${x * p} × ${q} = ${res}`, note: 'kiểm tra' }] },
            { text: `Vậy hai ô là ${pq} và ${res}.`, lines: [{ text: `Hai ô: ${pq} và ${res}`, color: INK }], mark: 'good' },
          ]) },
        };
      },
      solve(item) { const { x, p, q } = item.meta; return `${p * q}|${x * p * q}`; },
    },

    // g9.3: cách của ai dễ nhẩm hơn?
    {
      id: 'g9.3', covers: ['9.2'],
      make(rng) {
        const [x, y] = pick(rng, TENS);
        const n = pick(rng, [7, 9, 11, 13, 14, 16, 17, 18, 19, 21, 23]);
        const front = rng.next() < 0.5;
        const names = shuffle(rng, NAMES).slice(0, 2);
        const convIdx = rng.next() < 0.5 ? 0 : 1;
        const conv = names[convIdx], other = names[1 - convIdx];
        const xy = x * y, r = n * xy;
        const expr = front ? `${x} × ${y} × ${n}` : `${n} × ${x} × ${y}`;
        const cellConv = front ? `(${x} × ${y}) × ${n} = ${xy} × ${n}` : `${n} × (${x} × ${y}) = ${n} × ${xy}`;
        const cellOther = front ? `${x} × (${y} × ${n}) = ${x} × ${y * n}` : `(${n} × ${x}) × ${y} = ${n * x} × ${y}`;
        const hard = front ? `${x} × ${y * n}` : `${n * x} × ${y}`;
        const rowConv = [conv, cellConv, String(r)], rowOther = [other, cellOther, String(r)];
        const rows = convIdx === 0 ? [rowConv, rowOther] : [rowOther, rowConv];
        const hi = (i) => [[i, 1]];
        const choices = shuffle(rng, [
          R(conv),
          W(other, 'QUY', `Kết quả hai bạn bằng nhau (${r}). Nhưng nhẩm ${hard} khó hơn nhẩm ${xy} × ${n}.`),
          W('Hai cách như nhau', 'QUY', `Hai cách đều đúng, chỉ khác độ dễ. ${x} × ${y} = ${xy} là số tròn chục nên cách của ${conv} nhẩm nhanh hơn.`),
        ]);
        return {
          id: 'g9.3', src: '[biến thể mới]', type: 'choice',
          prompt: `Tính ${expr}. Hai bạn làm như trong bảng. Cách của bạn nào dễ nhẩm hơn?`,
          visual: tbl(rows),
          hint: 'Cả hai đều ra cùng một kết quả. Chọn cách có phép nhân ra số tròn chục.',
          choices, meta: { n, x, y, front, names, convIdx },
          explain: { steps: draft([
            { text: `Hai bạn đều ra ${r}. Nhân ba số, nhóm cách nào cũng được.`, lines: [{ text: expr, note: 'đề bài' }, { text: `${other}: ${cellOther} = ${r}` }, { text: `${conv}: ${cellConv} = ${r}` }] },
            { text: `${other} nhóm ra ${hard}. Nhẩm phép này hơi lâu.`, lines: [{ text: `${hard} = ?`, note: 'khó nhẩm' }] },
            { text: `${conv} nhóm ${x} × ${y} = ${xy}, là số tròn chục. ${n} × ${xy}: lấy ${n} × ${xy / 10} = ${n * xy / 10}, thêm một số 0 được ${r}.`, lines: [{ text: `${n} × ${xy} → ${n} × ${xy / 10} = ${n * xy / 10} → ${r}`, note: 'tròn chục: dễ' }], mark: 'good' },
            { text: `Vậy đáp án là cách của ${conv}.`, lines: [{ text: `→ cách nào thuận tiện? ${conv}`, color: INK }], mark: 'good' },
          ]) },
        };
      },
      solve(item) { const { names, convIdx } = item.meta; return names[convIdx]; },
    },

    // g9.4: NỐI cách nhóm với phép tính còn lại
    {
      id: 'g9.4', covers: ['9.4'],
      make(rng) {
        const [x, y] = pick(rng, TENS);
        const n = pick(rng, [3, 4, 6, 7, 9, 11, 12]);
        const front = rng.next() < 0.5;
        const [e1, e2, e3] = front ? [x, y, n] : [n, x, y];
        const T = e1 * e2 * e3;
        const swapAB = rng.next() < 0.5;
        const t1 = `${e1 * e2} × ${e3} = ${T}`, t2 = `${e1} × ${e2 * e3} = ${T}`;
        const t3 = swapAB ? `${e1} × ${e2 + e3} = ${e1 * (e2 + e3)}` : `${e1 + e2} × ${e3} = ${(e1 + e2) * e3}`;
        const right = shuffle(rng, [{ id: 'r1', text: t1 }, { id: 'r2', text: t2 }, { id: 'r3', text: t3 }]);
        const lead = pick(rng, ['Tính', 'Con tính']);
        const tail = lead === 'Tính' ? '' : ' bằng hai cách nhóm';
        const xy = x * y;
        const tbl2 = (hl) => ({ kind: 'table', headers: ['Cách nhóm', 'Còn lại', 'Kết quả'], rows: [[`Nhóm ${e1} × ${e2}`, `${e1 * e2} × ${e3}`, String(T)], [`Nhóm ${e2} × ${e3}`, `${e1} × ${e2 * e3}`, String(T)]], highlight: hl });
        return {
          id: 'g9.4', src: '[biến thể mới]', type: 'match',
          prompt: `${lead} ${e1} × ${e2} × ${e3}${tail}. Nối mỗi cách nhóm với phép tính còn lại đúng.`,
          left: [{ id: 'a', text: `Nhóm ${e1} × ${e2} trước` }, { id: 'b', text: `Nhóm ${e2} × ${e3} trước` }],
          right,
          pairs: { a: 'r1', b: 'r2' },
          hint: 'Tính phép nhân trong ngoặc trước rồi xem còn lại phép nào.',
          meta: { e: [e1, e2, e3] },
          explain: { steps: draft([
            { text: `Nhóm ${e1} × ${e2} = ${e1 * e2}. Còn lại ${e1 * e2} × ${e3} = ${T}.`, lines: [{ text: `${e1} × ${e2} × ${e3}`, note: 'đề bài' }, { text: `(${e1} × ${e2}) × ${e3} = ${e1 * e2} × ${e3} = ${T}`, note: `nhóm ${e1} × ${e2}` }] },
            { text: `Nhóm ${e2} × ${e3} = ${e2 * e3}. Còn lại ${e1} × ${e2 * e3} = ${T}.`, lines: [{ text: `${e1} × (${e2} × ${e3}) = ${e1} × ${e2 * e3} = ${T}`, note: `nhóm ${e2} × ${e3}` }] },
            { text: `${t3.split(' = ')[0]} = ${t3.split(' = ')[1]} là do đổi dấu × thành dấu +. Cách này SAI.`, lines: [{ text: swapAB ? `${e1} × (${e2} + ${e3}) = ${t3.split(' = ')[0]} = ${t3.split(' = ')[1]}` : `(${e1} + ${e2}) × ${e3} = ${t3.split(' = ')[0]} = ${t3.split(' = ')[1]}`, note: 'đổi dấu: sai' }], mark: 'bad' },
            { text: `Vậy: nhóm ${e1} × ${e2} nối với ${t1}; nhóm ${e2} × ${e3} nối với ${t2}. Cách có số tròn chục ${xy} nhẩm nhanh hơn.`, lines: [{ text: `→ cách nào thuận tiện? có ${xy}`, color: INK }], mark: 'good' },
          ]) },
        };
      },
      solve(item) {
        const [e1, e2, e3] = item.meta.e; const T = e1 * e2 * e3;
        const find = (t) => item.right.find((r) => r.text === t).id;
        return { a: find(`${e1 * e2} × ${e3} = ${T}`), b: find(`${e1} × ${e2 * e3} = ${T}`) };
      },
    },

    // g9.5: viết một thừa số thành tích, chọn cách nhóm ĐÚNG và dễ nhẩm hơn
    {
      id: 'g9.5', covers: ['9.5'],
      make(rng) {
        const [p, a] = pick(rng, [[5, 2], [5, 4], [5, 6], [5, 8], [25, 4]]);
        const b = int(rng, 3, 9);
        const q = a * b, pa = p * a;
        const front = rng.next() < 0.5;
        const [e1, e2, e3] = front ? [p, a, b] : [b, a, p];
        const T = p * q;
        const abTxt = front ? `${a} × ${b}` : `${b} × ${a}`, paTxt = front ? `${p} × ${a}` : `${a} × ${p}`;
        const good = front ? `(${e1} × ${e2}) × ${e3} = ${pa} × ${e3} = ${T}` : `${e1} × (${e2} × ${e3}) = ${e1} × ${pa} = ${T}`;
        const back = front ? `${e1} × (${e2} × ${e3}) = ${e1} × ${q} = ${T}` : `(${e1} × ${e2}) × ${e3} = ${q} × ${e3} = ${T}`;
        const plus1 = front ? `(${e1} + ${e2}) × ${e3} = ${e1 + e2} × ${e3} = ${(e1 + e2) * e3}` : `${e1} × (${e2} + ${e3}) = ${e1} × ${e2 + e3} = ${e1 * (e2 + e3)}`;
        const plus2 = front ? `(${e1} × ${e2}) + ${e3} = ${pa} + ${e3} = ${pa + e3}` : `${e1} + (${e2} × ${e3}) = ${e1} + ${pa} = ${e1 + pa}`;
        const choices = shuffle(rng, [
          R(good),
          W(back, 'QUY', `Cách này nhóm ${abTxt} = ${q} lại, quay về phép tính cũ ${front ? `${p} × ${q}` : `${q} × ${p}`}, chưa tính thêm được gì.`),
          W(plus1, 'DẤU', `Cách này đổi dấu × thành +, nên ra ${front ? (e1 + e2) * e3 : e1 * (e2 + e3)}, khác ${T}.`),
          W(plus2, 'DẤU', `Cách này đổi một phép nhân thành phép cộng, nên ra ${front ? pa + e3 : e1 + pa}, khác ${T}.`),
        ]);
        return {
          id: 'g9.5', src: '[biến thể mới]', type: 'choice', layout: 'list',
          prompt: front
            ? `Muốn tính ${p} × ${q}, mình viết ${q} = ${a} × ${b}, được ${p} × ${a} × ${b}. Cách nhóm nào ĐÚNG và cho phép tính MỚI dễ nhẩm hơn?`
            : `Muốn tính ${q} × ${p}, mình viết ${q} = ${b} × ${a}, được ${b} × ${a} × ${p}. Cách nhóm nào ĐÚNG và cho phép tính MỚI dễ nhẩm hơn?`,
          hint: 'Cách đúng vẫn giữ dấu ×. Phép tính mới không được giống phép tính ban đầu.',
          choices, meta: { p, a, b, front },
          explain: { steps: draft([
            { text: `${q} = ${abTxt}, nên ${front ? `${p} × ${q} = ${p} × ${a} × ${b}` : `${q} × ${p} = ${b} × ${a} × ${p}`}. Con cần chọn cách nhóm.`, lines: [{ text: `${front ? `${p} × ${q}` : `${q} × ${p}`} = ${e1} × ${e2} × ${e3}`, note: `viết ${q} = ${abTxt}` }] },
            { text: `Nhóm ${paTxt} = ${pa}, là số tròn chục hoặc tròn trăm. Còn ${front ? `${pa} × ${b}` : `${b} × ${pa}`} = ${T}.`, lines: [{ text: good, note: 'đúng, phép mới' }], mark: 'good' },
            { text: `Cách nhóm ${abTxt} quay lại phép tính cũ. Các cách có dấu + thì SAI vì đã đổi dấu ×.`, lines: [{ text: back.split(' = ').slice(0, 2).join(' = '), note: 'quay lại' }, { text: plus1.split(' = ').slice(0, 2).join(' = '), note: 'đổi dấu: sai' }], mark: 'bad' },
            { text: `Vậy đáp án là ${good}.`, lines: [{ text: good, color: INK }], mark: 'good' },
          ]) },
        };
      },
      solve(item) {
        const { p, a, b, front } = item.meta; const T = p * a * b, pa = p * a;
        return front ? `(${p} × ${a}) × ${b} = ${pa} × ${b} = ${T}` : `${b} × (${a} × ${p}) = ${b} × ${pa} = ${T}`;
      },
    },

    // g9.6: Cách tính của bạn đúng hay SAI? (đúng / đổi dấu / tách sai)
    {
      id: 'g9.6', covers: ['9.6'],
      make(rng) {
        const name = pick(rng, NAMES);
        const roll = rng.next();
        const kind = roll < 0.5 ? 'T' : roll < 0.75 ? 'A' : 'B';
        let a, b, c, m, g = 0;
        do {
          const [x] = pick(rng, TENS);
          b = int(rng, 3, 9);
          if (rng.next() < 0.5) { c = x; m = 5; } else { c = 5; m = x; }
          a = b * c; g++;
        } while ((a < 12 || a % 10 === 0) && g < 60);
        const cm = c * m, total = a * m;
        const cc = kind === 'B' ? c + 1 : c;
        const claim = kind === 'A' ? `${b} × (${c} + ${m}) = ${b} × ${c + m} = ${b * (c + m)}` : `${b} × (${cc} × ${m}) = ${b} × ${cc * m} = ${b * cc * m}`;
        const tens = a - (a % 10), ones = a % 10;
        const isTrue = kind === 'T';
        const reasons = shuffle(rng, kind === 'T'
          ? [
            { text: `Đúng, vì ${b} × ${c} = ${a} và chỉ đổi cách nhóm`, correct: true },
            { text: `Đúng, vì ${c} + ${m} cũng bằng ${c} × ${m}`, correct: false, code: 'DẤU', why: `${c} + ${m} = ${c + m} còn ${c} × ${m} = ${cm}. Số ${cm} là do nhân, không phải do cộng.` },
            { text: 'Đúng, vì đổi dấu × thành + nào cũng được', correct: false, code: 'DẤU', why: `Không được đổi dấu ×. Cách của ${name} đúng vì chỉ đổi cách nhóm.` },
          ]
          : kind === 'A'
            ? [
              { text: `Sai, vì ${c} + ${m} khác ${c} × ${m}`, correct: true },
              { text: `Sai, vì ${a} không bằng ${b} × ${c}`, correct: false, code: 'QUY', why: `${b} × ${c} = ${a}, nên chỗ tách này đúng. Chỗ sai nằm ở bước sau: ${name} đổi dấu × thành +.` },
              { text: `Sai, vì phải nhân thẳng ${a} × ${m}`, correct: false, code: 'QUY', why: 'Tách thành tích rồi nhóm lại vẫn được, miễn là giữ dấu ×. Mình chỉ không được đổi dấu.' },
            ]
            : [
              { text: `Sai, vì ${b} × ${cc} = ${b * cc}, không phải ${a}`, correct: true },
              { text: `Sai, vì ${cc} × ${m} không ra số tròn chục`, correct: false, code: 'QUY', why: `Nhóm ra số tròn chục chỉ giúp nhẩm dễ hơn, không bắt buộc. Chỗ sai là ${b} × ${cc} = ${b * cc}, không phải ${a}.` },
              { text: 'Sai, vì không được đổi cách nhóm', correct: false, code: 'QUY', why: `Đổi cách nhóm là được. Chỗ chưa đúng là tách ${a} = ${b} × ${cc}.` },
            ]);
        const bal1 = bal(`${a} × ${m}`, total, `${b} × ${c} × ${m}`, total, 'level');
        const L0 = { text: `${a} × ${m}`, note: 'đề bài' };
        const good1 = { text: `${a} × ${m} = ${b} × ${c} × ${m}`, note: `viết ${a} = ${b} × ${c}` };
        const steps = kind === 'T'
          ? draft([
            { text: `${a} = ${b} × ${c} nên ${a} × ${m} = ${b} × ${c} × ${m}.`, lines: [L0, good1] },
            { text: `Nhóm ${c} × ${m} = ${cm}, rồi ${b} × ${cm} = ${total}. Chỉ đổi cách nhóm, giữ dấu ×.`, lines: [{ text: `= ${b} × (${c} × ${m}) = ${b} × ${cm} = ${total}`, note: 'giữ dấu ×' }], mark: 'good' },
            { text: `Kiểm tra: ${a} × ${m} = ${tens} × ${m} + ${ones} × ${m} = ${tens * m} + ${ones * m} = ${total}. Hai cách bằng nhau.`, lines: [{ text: `${a} × ${m} = ${tens * m} + ${ones * m} = ${total}`, note: 'kiểm tra' }] },
            { text: `Vậy cách tính của ${name} ĐÚNG và dễ nhẩm vì có ${c} × ${m} = ${cm}.`, lines: [{ text: `→ ${name} làm ĐÚNG`, color: INK }], mark: 'good' },
          ])
          : kind === 'A'
            ? draft([
              { text: `${a} = ${b} × ${c} nên ${a} × ${m} = ${b} × ${c} × ${m}. Chỗ tách này đúng.`, lines: [L0, good1] },
              { text: `${name} nhóm ${c} + ${m} = ${c + m}, ra ${b * (c + m)}. Đã đổi dấu × thành + nên kết quả khác ${total}.`, lines: [{ text: `${b} × (${c} + ${m}) = ${b} × ${c + m} = ${b * (c + m)}`, note: 'đổi dấu: sai' }], mark: 'bad' },
              { text: `Cách đúng: ${c} × ${m} = ${cm}, rồi ${b} × ${cm} = ${total}.`, lines: [{ text: `${b} × (${c} × ${m}) = ${b} × ${cm} = ${total}`, note: 'cách đúng' }], mark: 'good' },
              { text: `Vậy cách tính của ${name} SAI vì đã đổi dấu ×.`, lines: [{ text: `→ ${name} làm SAI`, color: INK }], mark: 'good' },
            ])
            : draft([
              { text: `${name} tách ${a} = ${b} × ${cc}. Nhưng ${b} × ${cc} = ${b * cc}, không phải ${a}.`, lines: [L0, { text: `${a} = ${b} × ${cc}? ${b} × ${cc} = ${b * cc}`, note: 'tách sai' }], mark: 'bad' },
              { text: `Tách đúng phải là ${a} = ${b} × ${c}.`, lines: [good1] },
              { text: `Cách đúng: ${c} × ${m} = ${cm}, rồi ${b} × ${cm} = ${total}, không phải ${b * cc * m}.`, lines: [{ text: `= ${b} × (${c} × ${m}) = ${b} × ${cm} = ${total}`, note: 'cách đúng' }], mark: 'good' },
              { text: `Vậy cách tính của ${name} SAI vì tách chưa đúng.`, lines: [{ text: `→ ${name} làm SAI`, color: INK }], mark: 'good' },
            ]);
        return {
          id: 'g9.6', src: '[biến thể mới]', type: 'tf',
          prompt: `${name} tính ${a} × ${m} như sau: ${a} = ${b} × ${cc}, rồi ${claim}. Cách tính của ${name} đúng hay SAI?`,
          hint: `Xem ${name} có giữ dấu × và tách đúng không.`,
          answer: isTrue, reasons,
          whyWrong: isTrue
            ? `Cách của ${name} đúng: ${a} = ${b} × ${c}, nhóm ${c} × ${m} = ${cm} thì ${b} × ${cm} = ${total}. Kiểm tra: ${tens * m} + ${ones * m} = ${total}.`
            : kind === 'A'
              ? `${name} đổi ${c} × ${m} thành ${c} + ${m} nên ra ${b * (c + m)}. Cách đúng cho ${total}.`
              : `${b} × ${cc} = ${b * cc} chứ không phải ${a}, nên kết quả ${b * cc * m} sai. Cách đúng cho ${total}.`,
          meta: { a, b, cc, m, op: kind === 'A' ? '+' : '×', val: kind === 'A' ? b * (c + m) : b * cc * m },
          explain: { steps },
        };
      },
      solve(item) { const { a, b, cc, m, op, val } = item.meta; return String(op === '×' && b * cc === a && val === a * m); },
    },

    // g9.7: lời văn, chọn cách tính 3 thừa số DỄ NHẨM NHẤT
    {
      id: 'g9.7', covers: ['9.7'],
      make(rng) {
        const ctx = pick(rng, [
          { big: 'thùng', mid: 'hộp', cls: 'chiếc', thing: 'bút', emo: '✏️' },
          { big: 'rổ', mid: 'túi', cls: 'quả', thing: 'cam', emo: '🍊' },
          { big: 'kệ', mid: 'ngăn', cls: 'quyển', thing: 'truyện', emo: '📚' },
          { big: 'hộp to', mid: 'gói', cls: 'viên', thing: 'kẹo', emo: '🍬' },
          { big: 'khay', mid: 'hàng', cls: 'cái', thing: 'bánh', emo: '🧁' },
          { big: 'giá', mid: 'ngăn', cls: 'chiếc', thing: 'cốc', emo: '🥛' },
        ]);
        const [x, y] = pick(rng, TENS);
        const n = pick(rng, [3, 4, 6, 7, 8, 9].filter((v) => v !== x));
        const xy = x * y, T = n * xy;
        const good = `${n} × (${x} × ${y}) = ${n} × ${xy} = ${T}`;
        const choices = shuffle(rng, [
          W(`(${n} × ${x}) × ${y} = ${n * x} × ${y} = ${T}`, 'QUY', `Cách này cũng ra ${T} nhưng nhẩm chậm hơn. Câu hỏi là cách DỄ NHẨM NHẤT: nhóm ${x} × ${y} = ${xy}.`),
          R(good),
          W(`${n} × (${x} + ${y}) = ${n} × ${x + y} = ${n * (x + y)}`, 'DẤU', `Cách này đổi ${x} × ${y} thành ${x} + ${y} = ${x + y}. Không được đổi dấu ×.`),
        ]);
        return {
          id: 'g9.7', src: '[biến thể mới]', type: 'choice',
          prompt: `Mỗi ${ctx.big} có ${x} ${ctx.mid}, mỗi ${ctx.mid} ${y} ${ctx.cls} ${ctx.thing}. ${n} ${ctx.big} có bao nhiêu ${ctx.cls} ${ctx.thing}? Chọn cách tính ${n} × ${x} × ${y} DỄ NHẨM NHẤT.`,
          hint: 'Tìm hai số nhân với nhau ra số tròn chục.',
          choices, meta: { n, x, y },
          explain: { steps: draft([
            { text: 'Nhân ba số có thể nhóm hai số nào trước cũng được. Con tìm cách ra số tròn chục.', lines: [{ text: `${n} × ${x} × ${y}`, note: 'đề bài' }, { text: `(${n} × ${x}) × ${y} = ${n * x} × ${y} = ${T}`, note: 'nhẩm lâu' }] },
            { text: `${x} × ${y} = ${xy} là số tròn chục. Nhóm xong còn ${n} × ${xy} = ${T}, nhẩm ngay được.`, lines: [{ text: good, note: 'tròn chục: nhanh' }], mark: 'good' },
            { text: `Còn ${n * (x + y)} là SAI do đổi ${x} × ${y} thành ${x} + ${y}.`, lines: [{ text: `${n} × (${x} + ${y}) = ${n} × ${x + y} = ${n * (x + y)}`, note: 'đổi dấu: sai' }], mark: 'bad' },
            { text: `Vậy đáp án là ${good} ${ctx.cls} ${ctx.thing}.`, lines: [{ text: `→ cách nào thuận tiện? ${n} × ${xy}`, color: INK }], mark: 'good' },
          ]) },
        };
      },
      solve(item) { const { n, x, y } = item.meta; return `${n} × (${x} × ${y}) = ${n} × ${x * y} = ${n * x * y}`; },
    },
  ],
};

// "Làm nóng" bộ số ngẫu nhiên: các seed liền kề cho số đầu tiên gần nhau, nên bỏ vài số đầu để bài khác hẳn nhau.
topic.generators.forEach((g) => { const mk = g.make; g.make = (rng) => { rng.next(); rng.next(); rng.next(); return mk(rng); }; });
export default topic;
