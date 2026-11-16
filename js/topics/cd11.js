import { pick, int, shuffle } from '../core/rng.js';

const R = (text) => ({ text, correct: true });
const W = (text, code, why) => ({ text, code, why });
const qr = (q, r) => (r ? `${q} dư ${r}` : String(q));

// bảng tách "tròn chục + phần còn lại"
const splitTable = (rows, highlight) => ({ kind: 'table', headers: ['Tách', 'Phép chia', 'Kết quả'], rows, ...(highlight ? { highlight } : {}) });

export default {
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
        { text: 'Tách 70 = 50 + 20. Có 50 ÷ 5 = 10 và 20 ÷ 5 = 4.', visual: { kind: 'table', headers: ['Tách', 'Chia 5', 'Kết quả'], rows: [['50', '50 ÷ 5', '10'], ['20', '20 ÷ 5', '4'], ['Gộp', '10 + 4', '14']] } },
        { text: 'Còn 15 × 5 = 75, 16 × 5 = 80 (nhiều quá) và 13 × 5 = 65 (thiếu), nên không đúng.', mark: 'bad' },
        { text: 'Vậy mỗi dãy có 14 cái ghế. Kiểm tra: 14 × 5 = 70.', mark: 'good' },
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
        { text: 'Ước lượng: 60 ÷ 6 = 10, nên kết quả hơn 10 một chút.', visual: splitTable([['60', '60 ÷ 6', '10'], ['?', '?', '?'], ['Gộp', '?', '?']], [[0, 0], [0, 1], [0, 2]]) },
        { text: 'Còn lại 72 − 60 = 12. 12 ÷ 6 = 2.', visual: splitTable([['60', '60 ÷ 6', '10'], ['12', '12 ÷ 6', '2'], ['Gộp', '?', '?']], [[1, 0], [1, 1], [1, 2]]) },
        { text: 'Gộp lại 10 + 2 = 12. Kiểm tra: 12 × 6 = 72.', mark: 'good', visual: splitTable([['60', '60 ÷ 6', '10'], ['12', '12 ÷ 6', '2'], ['Gộp', '10 + 2', '12']], [[2, 1], [2, 2]]) },
        { text: 'Vậy 72 ÷ 6 = 12.', mark: 'good' },
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
        { text: 'Tìm số lớn nhất nhân với 4 mà không vượt quá 65: 16 × 4 = 64.', visual: { kind: 'table', headers: ['Phép tính', 'Kết quả'], rows: [['16 × 4', '64'], ['17 × 4', '68 (quá 65)']], highlight: [[0, 1]] } },
        { text: '65 − 64 = 1. Còn thừa 1, bé hơn số chia 4 nên dừng lại.', visual: { kind: 'numberline', min: 60, max: 66, step: 1, labelEvery: 1, jumps: [{ from: 64, to: 65, label: 'dư 1' }], points: [{ at: 64, label: '16 × 4' }, { at: 65 }] } },
        { text: 'Kiểm tra: 16 × 4 + 1 = 65. Đúng!', mark: 'good' },
        { text: 'Vậy 65 ÷ 4 = 16 dư 1.', mark: 'good' },
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
        { text: '6 × 6 = 36 không vượt 40, còn 7 × 6 = 42 vượt 40. Nên xếp đầy được 6 hộp.' },
        { text: '40 − 36 = 4. Thừa 4 cái bánh, bé hơn 6 nên không đủ xếp thêm hộp đầy.', mark: 'good' },
        { text: 'Vậy xếp đầy được 6 hộp, thừa 4 cái bánh.', mark: 'good' },
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
        { text: '69 ÷ 5 = 13 dư 4. 13 túi đầy chỉ đựng được 13 × 5 = 65 chiếc.', visual: { kind: 'groups', total: 69, perGroup: 5, emoji: '✏️', container: 'túi', showRemainder: true } },
        { text: 'Còn 4 chiếc bút chưa có túi. Cần thêm 1 túi để đựng 4 chiếc này.' },
        { text: '13 + 1 = 14. Cần 14 túi, không phải 13.', mark: 'good' },
        { text: 'Vậy Nga nói SAI: để xếp hết cần 14 túi.', mark: 'good' },
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
        { text: 'Chia từng số cho 6. 45 ÷ 6 = 7 dư 3 (7 × 6 = 42).', visual: { kind: 'table', headers: ['Số', 'Thương', 'Dư'], rows: [['45', '7', '3'], ['56', '?', '?'], ['74', '?', '?'], ['93', '?', '?']], highlight: [[0, 2]] } },
        { text: '56 ÷ 6 = 9 dư 2 (9 × 6 = 54). 74 ÷ 6 = 12 dư 2 (12 × 6 = 72).', mark: 'good', visual: { kind: 'table', headers: ['Số', 'Thương', 'Dư'], rows: [['45', '7', '3'], ['56', '9', '2'], ['74', '12', '2'], ['93', '?', '?']], highlight: [[1, 2], [2, 2]] } },
        { text: '93 ÷ 6 = 15 dư 3 (15 × 6 = 90). Số dư là 3, KHÔNG phải 2.', mark: 'bad', visual: { kind: 'table', headers: ['Số', 'Thương', 'Dư'], rows: [['45', '7', '3'], ['56', '9', '2'], ['74', '12', '2'], ['93', '15', '3']], highlight: [[3, 2]] } },
        { text: 'Vậy các số có số dư là 2 là 56 và 74.', mark: 'good' },
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
      { text: '45 ÷ 7 = 6 dư 3. 6 xe chở được 6 × 7 = 42 người.', visual: { kind: 'groups', total: 45, perGroup: 7, emoji: '🧒', container: 'xe', showRemainder: true, anim: 'distribute' } },
      { text: 'Còn 3 người chưa có xe. Số dư không bỏ đi được, phải thêm 1 xe để chở nốt.' },
      { text: 'Vậy cần 6 + 1 = 7 xe.', mark: 'good' },
    ] },
  },

  generators: [
    // g11.1: a ÷ b có dư
    {
      id: 'g11.1',
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
          explain: { steps: [
            { text: `Tìm số lớn nhất nhân với ${b} mà không vượt quá ${a}: ${q} × ${b} = ${q * b}.`, visual: { kind: 'table', headers: ['Phép tính', 'Kết quả'], rows: [[`${q} × ${b}`, String(q * b)], [`${q + 1} × ${b}`, `${(q + 1) * b} (quá ${a})`]], highlight: [[0, 1]] } },
            { text: `${a} − ${q * b} = ${r}. Số dư ${r} bé hơn số chia ${b} nên dừng lại.` },
            { text: `Kiểm tra: ${q} × ${b} + ${r} = ${a}. Đúng!`, mark: 'good' },
            { text: `Vậy ${a} ÷ ${b} = ${q} dư ${r}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { a, b } = item.meta; return qr(Math.floor(a / b), a % b); },
    },

    // g11.2: xếp đầy được mấy hộp, thừa mấy
    {
      id: 'g11.2',
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
            { text: `${q} × ${b} = ${q * b} không vượt ${a}, còn ${q + 1} × ${b} = ${(q + 1) * b} vượt ${a}. Nên xếp đầy được ${q} ${box}.` },
            { text: `${a} − ${q * b} = ${r}. Thừa ${r} ${cls}, bé hơn ${b} nên không đủ xếp thêm một ${box} đầy.`, mark: 'good' },
            { text: `Vậy xếp đầy được ${q} ${box}, thừa ${r} ${cls}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { a, b, box, w } = item.meta; return `${Math.floor(a / b)} ${box}, thừa ${a % b} ${w}`; },
    },

    // g11.3: cần mấy hộp để xếp HẾT
    {
      id: 'g11.3',
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
            { text: `${a} ÷ ${b} = ${q} dư ${r}. ${q} ${box} ${verb} được ${q} × ${b} = ${q * b}.`, visual: { kind: 'groups', total: a, perGroup: b, container: box, showRemainder: true, anim: 'distribute' } },
            { text: `Còn ${r} chưa có chỗ. Số dư không bỏ đi được, phải thêm 1 ${box}.` },
            { text: `Vậy cần ${q} + 1 = ${q + 1} ${box}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { a, b, box } = item.meta; return `${Math.ceil(a / b)} ${box}`; },
    },

    // g11.4: chia hết (tách tròn chục)
    {
      id: 'g11.4',
      make(rng) {
        const b = int(rng, 3, 9);
        let q = int(rng, 10, Math.floor(99 / b));
        if (q % 10 === 0) q += 1;
        const a = q * b;
        const m = Math.floor(q / 10), k = q % 10;
        const big = m * 10 * b;
        const hints = [];
        const add = (v, code, why) => { if (!hints.some((h) => h.match === String(v))) hints.push({ match: String(v), code, why }); };
        add(m * 10, 'QUY', `${big} ÷ ${b} = ${m * 10} mới chia được ${big}. Còn phần còn lại ${a - big}, chia tiếp được ${k}.`);
        add(q - 1, 'NHỚ', `${q - 1} × ${b} = ${(q - 1) * b}, chưa đủ ${a}. Hãy kiểm lại bằng phép nhân.`);
        add(q + 1, 'NHỚ', `${q + 1} × ${b} = ${(q + 1) * b}, vượt quá ${a}. Hãy kiểm lại bằng phép nhân.`);
        return {
          id: 'g11.4', src: '[biến thể mới]', type: 'numpad',
          prompt: `Tính: ${a} ÷ ${b} = □`,
          hint: `Ước lượng trước: ${big} ÷ ${b} bằng bao nhiêu? Rồi xem còn lại phần nào.`,
          slots: [{ label: `${a} ÷ ${b} =`, answer: String(q) }],
          wrongHints: hints, meta: { a, b },
          explain: { steps: [
            { text: `Tách ${a} = ${big} + ${a - big}. ${big} ÷ ${b} = ${m * 10}.`, visual: splitTable([[String(big), `${big} ÷ ${b}`, String(m * 10)], [String(a - big), `${a - big} ÷ ${b}`, String(k)], ['Gộp', `${m * 10} + ${k}`, String(q)]], [[0, 0], [0, 1], [0, 2]]) },
            { text: `Còn lại ${a} − ${big} = ${a - big}. ${a - big} ÷ ${b} = ${k}.`, visual: splitTable([[String(big), `${big} ÷ ${b}`, String(m * 10)], [String(a - big), `${a - big} ÷ ${b}`, String(k)], ['Gộp', `${m * 10} + ${k}`, String(q)]], [[1, 0], [1, 1], [1, 2]]) },
            { text: `Gộp lại ${m * 10} + ${k} = ${q}. Kiểm tra: ${q} × ${b} = ${a}.`, mark: 'good' },
            { text: `Vậy ${a} ÷ ${b} = ${q}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { a, b } = item.meta; return String(a / b); },
    },
  ],
};
