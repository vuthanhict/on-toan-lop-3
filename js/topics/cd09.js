import { pick, int, shuffle } from '../core/rng.js';

const R = (text) => ({ text, correct: true });
const W = (text, code, why) => ({ text, code, why });
const NAMES = ['Mai', 'Nam', 'Lan', 'Hà', 'Bình', 'An', 'Chi', 'Minh'];

const bal = (l, lv, r, rv, tilt) => ({
  kind: 'balance',
  left: [{ label: l, value: lv }],
  right: [{ label: r, value: rv }],
  ...(tilt ? { tilt } : {}),
});

export default {
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
    {
      text: 'Cách 1: nhóm 7 × 2 = 14 trước, rồi 14 × 5 = 70. Nhẩm 14 × 5 hơi lâu một chút.',
      visual: { kind: 'table', headers: ['Cách nhóm', 'Còn lại', 'Kết quả'], rows: [['(7 × 2) × 5', '14 × 5', '70'], ['7 × (2 × 5)', '7 × 10', '?']], highlight: [[0, 0], [0, 1], [0, 2]] },
    },
    {
      text: 'Cách 2: nhóm 2 × 5 = 10 trước (một thùng có 10 bút), rồi 7 × 10 = 70. Số tròn chục nên nhẩm rất nhanh.', mark: 'good',
      visual: { kind: 'table', headers: ['Cách nhóm', 'Còn lại', 'Kết quả'], rows: [['(7 × 2) × 5', '14 × 5', '70'], ['7 × (2 × 5)', '7 × 10', '70']], highlight: [[1, 0], [1, 1], [1, 2]] },
    },
    {
      text: 'Hai cách đều ra 70. Mình chỉ được đổi cách nhóm. Nếu đổi dấu thành (7 + 2) × 5 = 45 thì SAI.', mark: 'bad',
      visual: bal('(7 × 2) × 5', 70, '(7 + 2) × 5', 45),
    },
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
      explain: { steps: [
        { text: 'Ước lượng trước: 9 × 6 × 5 gần bằng 10 × 6 × 5 = 300. Kết quả đúng phải ở gần 300.', visual: bal('9 × 6 × 5', 'gần 300', '10 × 6 × 5', 300) },
        { text: 'Mai nhóm 9 × 6 = 54, rồi 54 × 5 = 270. Kết quả gần 300, hợp lí.', mark: 'good', visual: { kind: 'table', headers: ['Bạn', 'Cách làm', 'Kết quả'], rows: [['Mai', '(9 × 6) × 5 = 54 × 5', '270'], ['Nam', '(9 + 6) × 5 = 15 × 5', '75']], highlight: [[0, 1], [0, 2]] } },
        { text: 'Nam đổi 9 × 6 thành 9 + 6 = 15, ra 75. Kết quả quá xa 300 vì Nam đã đổi dấu.', mark: 'bad', visual: { kind: 'table', headers: ['Bạn', 'Cách làm', 'Kết quả'], rows: [['Mai', '(9 × 6) × 5 = 54 × 5', '270'], ['Nam', '(9 + 6) × 5 = 15 × 5', '75']], highlight: [[1, 1], [1, 2]] } },
        { text: 'Vậy Mai làm đúng: mình chỉ đổi cách nhóm, giữ nguyên dấu ×. Nhóm kiểu khác 9 × (6 × 5) = 9 × 30 cũng ra 270.', mark: 'good', visual: bal('(9 × 6) × 5', 270, '9 × (6 × 5)', 270, 'level') },
      ] },
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
      explain: { steps: [
        { text: 'Hai bạn đều ra 180. Nhân ba số, nhóm cách nào cũng được.', visual: bal('(9 × 4) × 5', 180, '9 × (4 × 5)', 180, 'level') },
        { text: 'Na nhóm 9 × 4 = 36, rồi nhân 36 × 5. Nhẩm 36 × 5 hơi lâu.', visual: { kind: 'table', headers: ['Bạn', 'Cách làm', 'Kết quả'], rows: [['Na', '(9 × 4) × 5 = 36 × 5', '180'], ['Lan', '9 × (4 × 5) = 9 × 20', '180']], highlight: [[0, 1]] } },
        { text: 'Lan nhóm 4 × 5 = 20, là số tròn chục. 9 × 20: lấy 9 × 2 = 18, thêm một số 0 được 180.', mark: 'good', visual: { kind: 'table', headers: ['Bạn', 'Cách làm', 'Kết quả'], rows: [['Na', '(9 × 4) × 5 = 36 × 5', '180'], ['Lan', '9 × (4 × 5) = 9 × 20', '180']], highlight: [[1, 1]] } },
        { text: 'Vậy cách của Lan dễ nhẩm hơn.', mark: 'good', visual: { kind: 'array', rows: 4, cols: 5, showEq: true, anim: 'fill' } },
      ] },
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
      explain: { steps: [
        { text: 'Nhóm hai thừa số cuối: 2 × 5 = 10. Ô thứ nhất là 10.', visual: { kind: 'array', rows: 2, cols: 5, showEq: true, anim: 'fill' } },
        { text: 'Còn lại 26 × 10. Nhân với 10 thì viết thêm một số 0: 26 × 10 = 260.', visual: { kind: 'table', headers: ['Phép tính', 'Kết quả'], rows: [['2 × 5', '10'], ['26 × 10', '260']], highlight: [[1, 1]] } },
        { text: 'Kiểm tra bằng cách nhóm khác: 26 × 2 = 52, rồi 52 × 5 = 260. Cũng ra 260.', visual: bal('26 × (2 × 5)', 260, '(26 × 2) × 5', 260, 'level') },
        { text: 'Vậy hai ô là 10 và 260.', mark: 'good' },
      ] },
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
      explain: { steps: [
        { text: 'Nhóm 4 × 6 = 24. Còn lại 24 × 5 = 120.', visual: { kind: 'table', headers: ['Cách nhóm', 'Còn lại', 'Kết quả'], rows: [['Nhóm 4 × 6', '24 × 5', '120'], ['Nhóm 6 × 5', '4 × 30', '120']], highlight: [[0, 1], [0, 2]] } },
        { text: 'Nhóm 6 × 5 = 30. Còn lại 4 × 30 = 120.', visual: { kind: 'table', headers: ['Cách nhóm', 'Còn lại', 'Kết quả'], rows: [['Nhóm 4 × 6', '24 × 5', '120'], ['Nhóm 6 × 5', '4 × 30', '120']], highlight: [[1, 1], [1, 2]] } },
        { text: '4 × 11 = 44 là do đổi 6 × 5 thành 6 + 5 = 11. Cách này SAI vì đã đổi dấu ×.', mark: 'bad' },
        { text: 'Vậy: nhóm 4 × 6 nối với 24 × 5; nhóm 6 × 5 nối với 4 × 30. Cách sau dễ nhẩm hơn vì có số tròn chục 30 (4 × 3 = 12, thêm một chữ số 0).', mark: 'good' },
      ] },
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
      explain: { steps: [
        { text: '28 = 7 × 4, nên 5 × 28 = 5 × 7 × 4. Mình cần chọn cách nhóm.', visual: bal('5 × 28', 140, '5 × 7 × 4', 140, 'level') },
        { text: 'Nhóm 5 × 7 = 35. Còn 35 × 4: 35 × 2 = 70, gấp đôi nữa là 140.', mark: 'good' },
        { text: 'Cách 5 × (7 × 4) quay lại 5 × 28. Cách (5 + 7) × 4 đổi dấu nên SAI.', mark: 'bad' },
        { text: 'Vậy chọn (5 × 7) × 4 = 35 × 4 = 140.', mark: 'good' },
      ] },
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
      explain: { steps: [
        { text: '16 = 8 × 2 nên 16 × 5 = 8 × 2 × 5.', visual: bal('16 × 5', 80, '8 × 2 × 5', 80, 'level') },
        { text: 'Nhóm 2 × 5 = 10, rồi 8 × 10 = 80. Chỉ đổi cách nhóm, giữ dấu ×.', mark: 'good' },
        { text: 'Kiểm tra: 16 × 5 = 10 × 5 + 6 × 5 = 50 + 30 = 80. Hai cách bằng nhau.' },
        { text: 'Vậy cách tính của Mi ĐÚNG và dễ nhẩm vì có 2 × 5 = 10.', mark: 'good' },
      ] },
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
    explain: { steps: [
      { text: 'Nhân ba số có thể nhóm hai số nào trước cũng được. Mình tìm cách ra số tròn chục.', visual: { kind: 'array', rows: 2, cols: 5, emoji: '✏️', showEq: true } },
      { text: '2 × 5 = 10 là số tròn chục. Nhóm xong còn 7 × 10 = 70, nhẩm ngay được.', mark: 'good' },
      { text: 'Cách (7 × 2) × 5 vẫn ra 70 nhưng phải nhẩm 14 × 5. Còn 7 × 7 = 49 là SAI do đổi dấu.', mark: 'bad', visual: bal('(7 × 2) × 5', 70, '7 × (2 + 5)', 49) },
      { text: 'Vậy đáp án là 7 × (2 × 5) = 7 × 10 = 70 chiếc bút.', mark: 'good' },
    ] },
  },

  generators: [
    // g9.1: Ai làm đúng? (một bạn nhóm, một bạn đổi dấu × thành +)
    {
      id: 'g9.1',
      make(rng) {
        const a = int(rng, 3, 9), b = int(rng, 3, 9), c = pick(rng, [3, 4, 5, 6, 7]);
        const [n1, n2] = shuffle(rng, NAMES).slice(0, 2);
        const mulIdx = rng.next() < 0.5 ? 0 : 1;
        const names = [n1, n2];
        const right = names[mulIdx], wrong = names[1 - mulIdx];
        const rowRight = [right, `(${a} × ${b}) × ${c} = ${a * b} × ${c}`, String(a * b * c)];
        const rowWrong = [wrong, `(${a} + ${b}) × ${c} = ${a + b} × ${c}`, String((a + b) * c)];
        const rows = mulIdx === 0 ? [rowRight, rowWrong] : [rowWrong, rowRight];
        const hi = (i) => ({ headers: ['Bạn', 'Cách làm', 'Kết quả'], rows, highlight: [[i, 1], [i, 2]] });
        const choices = shuffle(rng, [
          R(right),
          W(wrong, 'DẤU', `${wrong} đổi ${a} × ${b} thành ${a} + ${b}. Nhưng mình chỉ được đổi cách nhóm, không được đổi dấu phép tính.`),
          W('Cả hai bạn', 'QUY', `Hai kết quả khác nhau (${a * b * c} và ${(a + b) * c}) thì không thể cùng đúng.`),
        ]);
        return {
          id: 'g9.1', src: '[biến thể mới]', type: 'choice',
          prompt: `Tính ${a} × ${b} × ${c}. Hai bạn làm như trong bảng. Ai làm ĐÚNG?`,
          visual: { kind: 'table', headers: ['Bạn', 'Cách làm', 'Kết quả'], rows },
          hint: `Nhìn kĩ dấu giữa số ${a} và số ${b} trong ngoặc của mỗi bạn.`,
          choices, meta: { a, b, c, names, mulIdx },
          explain: { steps: [
            { text: `${right} nhóm ${a} × ${b} = ${a * b}, rồi ${a * b} × ${c} = ${a * b * c}. Giữ nguyên dấu ×.`, mark: 'good', visual: { kind: 'table', ...hi(mulIdx) } },
            { text: `${wrong} đổi ${a} × ${b} thành ${a} + ${b} = ${a + b}, ra ${(a + b) * c}. Vì đổi dấu nên kết quả khác.`, mark: 'bad', visual: { kind: 'table', ...hi(1 - mulIdx) } },
            { text: `Vậy ${right} làm đúng: mình chỉ được đổi cách nhóm, giữ dấu ×. Kiểm tra: ${a} × (${b} × ${c}) = ${a} × ${b * c} = ${a * b * c}.`, mark: 'good', visual: bal(`(${a} × ${b}) × ${c}`, a * b * c, `${a} × (${b} × ${c})`, a * b * c, 'level') },
          ] },
        };
      },
      solve(item) { const { names, mulIdx } = item.meta; return names[mulIdx]; },
    },

    // g9.2: điền 2 ô x × p × q = x × □ = □
    {
      id: 'g9.2',
      make(rng) {
        const [p, q] = pick(rng, [[2, 5], [4, 5], [5, 6], [5, 8]]);
        const x = int(rng, 12, 49);
        const pq = p * q, res = x * pq;
        return {
          id: 'g9.2', src: '[biến thể mới]', type: 'numpad',
          prompt: `Điền hai số còn thiếu:\n${x} × ${p} × ${q} = ${x} × □ = □`,
          hint: 'Nhóm hai thừa số cuối thành một số tròn chục trước.',
          slots: [
            { label: 'Ô thứ nhất:', answer: String(pq) },
            { label: 'Ô thứ hai:', answer: String(res) },
          ],
          wrongHints: [
            { match: `${p + q}|${x * (p + q)}`, code: 'DẤU', why: `${p} × ${q} = ${pq}, không phải ${p} + ${q} = ${p + q}. Nhóm chỉ đổi cách nhân, không đổi dấu.` },
            { match: `${x * p}|${res}`, code: 'QUY', why: `${x} × ${p} = ${x * p} là nhóm hai số đầu. Ở đây ${p} × ${q} đã được nhóm thành một ô, nên ô thứ nhất là ${p} × ${q} = ${pq}.` },
          ],
          meta: { x, p, q },
          explain: { steps: [
            { text: `Nhóm hai thừa số cuối: ${p} × ${q} = ${pq}. Ô thứ nhất là ${pq}.`, visual: { kind: 'array', rows: p, cols: q, showEq: true, anim: 'fill' } },
            { text: `Còn lại ${x} × ${pq}. Lấy ${x} × ${pq / 10} = ${x * pq / 10}, rồi thêm một số 0 được ${res}.`, visual: { kind: 'table', headers: ['Phép tính', 'Kết quả'], rows: [[`${p} × ${q}`, String(pq)], [`${x} × ${pq}`, String(res)]], highlight: [[1, 1]] } },
            { text: `Kiểm tra bằng cách nhóm khác: ${x} × ${p} = ${x * p}, rồi ${x * p} × ${q} = ${res}. Cũng ra ${res}.`, visual: bal(`${x} × (${p} × ${q})`, res, `(${x} × ${p}) × ${q}`, res, 'level') },
            { text: `Vậy hai ô là ${pq} và ${res}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { x, p, q } = item.meta; return `${p * q}|${x * p * q}`; },
    },

    // g9.3: cách của ai thuận tiện hơn?
    {
      id: 'g9.3',
      make(rng) {
        const a = pick(rng, [7, 9, 11, 13, 17, 19]), b = pick(rng, [2, 4, 6, 8]), c = 5;
        const [n1, n2] = shuffle(rng, NAMES).slice(0, 2);
        const names = [n1, n2];
        const convIdx = rng.next() < 0.5 ? 0 : 1;
        const conv = names[convIdx], other = names[1 - convIdx];
        const r = a * b * c, bc = b * c;
        const rowConv = [conv, `${a} × (${b} × ${c}) = ${a} × ${bc}`, String(r)];
        const rowOther = [other, `(${a} × ${b}) × ${c} = ${a * b} × ${c}`, String(r)];
        const rows = convIdx === 0 ? [rowConv, rowOther] : [rowOther, rowConv];
        const hi = (i) => ({ headers: ['Bạn', 'Cách làm', 'Kết quả'], rows, highlight: [[i, 1]] });
        const choices = shuffle(rng, [
          R(conv),
          W(other, 'QUY', `Kết quả hai bạn bằng nhau (${r}). Nhưng nhẩm ${a * b} × ${c} khó hơn nhẩm ${a} × ${bc}.`),
          W('Hai cách như nhau', 'QUY', `Hai cách đều đúng, chỉ khác độ dễ. ${b} × ${c} = ${bc} là số tròn chục nên cách của ${conv} nhẩm nhanh hơn.`),
        ]);
        return {
          id: 'g9.3', src: '[biến thể mới]', type: 'choice',
          prompt: `Tính ${a} × ${b} × ${c}. Hai bạn làm như trong bảng. Cách của bạn nào dễ nhẩm hơn?`,
          visual: { kind: 'table', headers: ['Bạn', 'Cách làm', 'Kết quả'], rows },
          hint: 'Cả hai đều ra cùng một kết quả. Chọn cách có phép nhân ra số tròn chục.',
          choices, meta: { a, b, c, names, convIdx },
          explain: { steps: [
            { text: `Hai bạn đều ra ${r}. Nhân ba số, nhóm cách nào cũng được.`, visual: bal(`(${a} × ${b}) × ${c}`, r, `${a} × (${b} × ${c})`, r, 'level') },
            { text: `${other} nhóm ${a} × ${b} = ${a * b}, rồi ${a * b} × ${c}. Nhẩm ${a * b} × ${c} hơi lâu.`, visual: { kind: 'table', ...hi(1 - convIdx) } },
            { text: `${conv} nhóm ${b} × ${c} = ${bc}, là số tròn chục. ${a} × ${bc}: lấy ${a} × ${bc / 10} = ${a * bc / 10}, thêm một số 0 được ${r}.`, mark: 'good', visual: { kind: 'table', ...hi(convIdx) } },
            { text: `Vậy cách của ${conv} dễ nhẩm hơn.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { names, convIdx } = item.meta; return names[convIdx]; },
    },
  ],
};
