import { pick, int, shuffle } from '../core/rng.js';

const f = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const R = (text) => ({ text, correct: true });
const W = (text, code, why) => ({ text, code, why });
const HANG = ['đơn vị', 'chục', 'trăm', 'nghìn', 'chục nghìn', 'trăm nghìn'];
const DIG = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

// Đọc số tiếng Việt (đến 999 999) theo cách cô dạy: "không trăm", "linh"
function twoDigits(t, u, hasHigher) {
  if (t === 0) { if (u === 0) return ''; return (hasHigher ? 'linh ' : '') + (u === 4 && hasHigher ? 'tư' : DIG[u]); }
  if (t === 1) return 'mười' + (u === 0 ? '' : u === 5 ? ' lăm' : ' ' + DIG[u]);
  return DIG[t] + ' mươi' + (u === 0 ? '' : u === 1 ? ' mốt' : u === 4 ? ' tư' : u === 5 ? ' lăm' : ' ' + DIG[u]);
}
function group(n, full) {
  const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), u = n % 10;
  const parts = [];
  if (h > 0 || full) parts.push(DIG[h] + ' trăm');
  const rest = twoDigits(t, u, h > 0 || full);
  if (rest) parts.push(rest);
  return parts.join(' ');
}
function readVN(N) {
  const U = Math.floor(N / 1000), L = N % 1000;
  return group(U, false) + ' nghìn' + (L > 0 ? ' ' + group(L, true) : '');
}

export default {
  id: 'cd03', no: 3, day: 1, title: 'Đọc, viết số và giá trị chữ số', short: 'Đọc viết số', icon: '🔢',
  intro: 'Mỗi chữ số đứng đúng hàng của nó. Hàng trống thì viết số 0, đọc là "không trăm" hoặc "linh".',

  remember: [
    { text: 'Số có 6 chữ số thì có 6 hàng. Tách ba chữ số một cho dễ đọc: 180 | 204. Hàng nào trống thì viết chữ số 0.',
      visual: { kind: 'place', digits: '180204', groupThousands: true, anim: 'fill' } },
    { text: 'Hàng trăm bằng 0 thì đọc "không trăm": 21 035 là hai mươi mốt nghìn không trăm ba mươi lăm. Hàng chục bằng 0 thì đọc "linh": 180 204 là một trăm tám mươi nghìn hai trăm linh tư.',
      visual: { kind: 'place', digits: '21035', groupThousands: true, highlight: 2 } },
    { text: 'Giá trị của chữ số = chữ số nhân giá trị hàng. Chữ số 5 ở hàng trăm có giá trị 500, không phải 5.',
      visual: { kind: 'place', digits: '100510', groupThousands: true, highlight: 2, showValue: true } },
  ],

  lesson: [
    { text: 'Cùng xếp khối: 2 khối nghìn, 0 tấm trăm, 3 thanh chục và 5 khối nhỏ. Đó là số 2 035.',
      visual: { kind: 'blocks3d', thousands: 2, hundreds: 0, tens: 3, ones: 5, caption: true, anim: 'build' } },
    { text: 'Mỗi loại khối là một hàng. Không có tấm trăm nào thì hàng trăm phải viết chữ số 0.',
      visual: { kind: 'place', digits: '2035', highlight: 2, showValue: true, anim: 'fill' } },
    { text: 'Số lớn thì tách 3 chữ số một: 21 | 035. Hàng trăm bằng 0 đọc là "không trăm": hai mươi mốt nghìn không trăm ba mươi lăm.',
      visual: { kind: 'place', digits: '21035', groupThousands: true, highlight: 2 } },
    { text: 'Hàng chục bằng 0 đọc là "linh": 180 204 là một trăm tám mươi nghìn hai trăm linh tư.',
      visual: { kind: 'place', digits: '180204', groupThousands: true, highlight: 1 } },
    { text: 'Giá trị của chữ số: chữ số 5 ở hàng trăm thì 5 × 100 = 500.',
      visual: { kind: 'place', digits: '100510', groupThousands: true, highlight: 2, showValue: true } },
    { text: 'Tách số 48 372 theo hàng: 40 000 + 8 000 + 300 + 70 + 2. Cộng đủ các hàng thì được lại số ban đầu.',
      visual: { kind: 'place', digits: '48372', groupThousands: true, showValue: true, anim: 'fill' } },
  ],

  items: [
    {
      id: '3.1', src: 'T2 tr.1 C1', type: 'choice', layout: 'list',
      prompt: 'Số 21 035 đọc là:',
      hint: 'Hàng trăm của số này là chữ số nào? Hãy đọc cả hàng đó.',
      visual: { kind: 'place', digits: '21035', groupThousands: true },
      choices: [
        W('Hai một không ba năm', 'QUY', 'Phải đọc theo hàng (hai mươi mốt nghìn…), không đọc từng chữ số rời nhau.'),
        W('Hai mươi mốt nghìn ba mươi lăm', 'HÀNG', 'Hàng trăm là 0, nên phải đọc "không trăm" trước ba mươi lăm.'),
        R('Hai mươi mốt nghìn không trăm ba mươi lăm'),
        W('Hai mươi mốt nghìn không trăm ba mươi năm', 'QUY', 'Chữ số 5 ở hàng đơn vị, đứng sau chữ số hàng chục thì đọc là "lăm".'),
      ],
      explain: { steps: [
        { text: 'Tách ba chữ số một: 21 | 035. Lớp nghìn là 21, đọc là hai mươi mốt nghìn.', visual: { kind: 'place', digits: '21035', groupThousands: true, highlight: [3, 4] } },
        { text: 'Lớp đơn vị là 035. Hàng trăm bằng 0 nên đọc "không trăm", rồi "ba mươi lăm".', visual: { kind: 'place', digits: '21035', groupThousands: true, highlight: [0, 1, 2] } },
        { text: 'Vậy đáp án là hai mươi mốt nghìn không trăm ba mươi lăm.', mark: 'good' },
      ] },
    },
    {
      id: '3.2', src: 'T2 tr.1 C2', type: 'choice', layout: 'grid2',
      prompt: 'Số "một trăm tám mươi nghìn hai trăm linh tư" viết là:',
      say: 'Số một trăm tám mươi nghìn hai trăm linh tư viết là:',
      hint: 'Viết lớp nghìn trước, rồi lớp đơn vị. "Linh" nghĩa là hàng chục bằng 0.',
      choices: [
        W('18 204', 'HÀNG', 'Thiếu hàng trăm nghìn: "một trăm tám mươi nghìn" là 180 nghìn.'),
        R('180 204'),
        W('180 024', 'HÀNG', '"Hai trăm linh tư" là 2 trăm, 0 chục, 4 đơn vị: viết 204, không phải 024.'),
        W('1 824', 'HÀNG', 'Con đã ghép các chữ số rời nhau. 180 nghìn phải viết 180 000, rồi mới viết 204.'),
      ],
      explain: { steps: [
        { text: 'Lớp nghìn: một trăm tám mươi nghìn là 180 nghìn. Mình viết 180.', visual: { kind: 'place', digits: '180000', groupThousands: true, highlight: [3, 4, 5] } },
        { text: 'Lớp đơn vị: hai trăm linh tư. 2 trăm, "linh" là 0 chục, 4 đơn vị: viết 204.', visual: { kind: 'place', digits: '180204', groupThousands: true, highlight: [0, 1, 2] } },
        { text: 'Vậy đáp án là 180 204.', mark: 'good' },
      ] },
    },
    {
      id: '3.3', src: 'T2 tr.1 C6b', type: 'numpad',
      prompt: 'Viết số gồm: 7 trăm nghìn, 3 đơn vị, 2 chục nghìn, 1 chục, 6 trăm.',
      hint: 'Xếp từng chữ số vào đúng hàng. Hàng nào không được nhắc đến thì viết 0.',
      slots: [{ label: 'Số cần viết:', answer: '720613', len: 6 }],
      wrongHints: [
        { match: '72613', code: 'HÀNG', why: 'Thiếu chữ số 0 ở hàng nghìn. Số có 6 chữ số nên phải đủ 6 hàng.' },
        { match: '73216', code: 'QUY', why: 'Đề không đọc theo thứ tự hàng. Hãy xếp từng số vào đúng hàng, từ trăm nghìn tới đơn vị.' },
      ],
      explain: { steps: [
        { text: 'Xếp vào bảng hàng: 7 trăm nghìn, 2 chục nghìn, 6 trăm, 1 chục, 3 đơn vị.', visual: { kind: 'place', digits: '720613', groupThousands: true, highlight: [5, 4, 2, 1, 0] } },
        { text: 'Đề không nói đến hàng nghìn, nên hàng nghìn là 0.', visual: { kind: 'place', digits: '720613', groupThousands: true, highlight: 3 } },
        { text: 'Vậy số cần viết là 720 613.', mark: 'good' },
      ] },
    },
    {
      id: '3.4', src: 'T2 tr.1–2 C7', type: 'numpad',
      prompt: 'a) Chữ số 5 trong số 100 510 có giá trị là bao nhiêu?\nb) Chữ số 4 trong số 140 567 có giá trị là bao nhiêu?',
      hint: 'Tìm chữ số đứng ở hàng nào, rồi nhân với giá trị hàng.',
      slots: [{ label: 'a)', answer: '500' }, { label: 'b)', answer: '40000' }],
      wrongHints: [
        { match: '5|40000', code: 'HÀNG', why: 'Giá trị là chữ số nhân giá trị hàng, không phải chính chữ số đó.' },
        { match: '50|40000', code: 'HÀNG', why: 'Chữ số 5 đứng ở hàng trăm (100 | 510), không phải hàng chục.' },
        { match: '500|4000', code: 'HÀNG', why: 'Đếm từ phải sang: 7 đơn vị, 6 chục, 5 trăm, 0 nghìn, 4 chục nghìn. Chữ số 4 ở hàng chục nghìn.' },
        { match: '500|400000', code: 'HÀNG', why: 'Chữ số 4 ở hàng chục nghìn, không phải hàng trăm nghìn (hàng trăm nghìn là chữ số 1).' },
      ],
      explain: { steps: [
        { text: 'a) 100 510: chữ số 5 đứng ở hàng trăm. Giá trị là 5 × 100 = 500.', visual: { kind: 'place', digits: '100510', groupThousands: true, highlight: 2, showValue: true } },
        { text: 'b) 140 567: đếm từ phải, 7 đơn vị, 6 chục, 5 trăm, 0 nghìn, 4 chục nghìn. Giá trị là 4 × 10 000 = 40 000.', visual: { kind: 'place', digits: '140567', groupThousands: true, highlight: 4, showValue: true } },
        { text: 'Vậy a) 500 và b) 40 000.', mark: 'good' },
      ] },
    },
    {
      id: '3.5', src: 'S5 Q8', type: 'choice', layout: 'list',
      prompt: 'Có bốn cách tách số 48 372. Chạm vào cách tách SAI.',
      hint: 'Kiểm tra giá trị của từng hàng: 4 chục nghìn, 8 nghìn, 3 trăm, 7 chục, 2 đơn vị.',
      choices: [
        W('40 000 + 8 000 + 300 + 70 + 2', 'ĐỌC', 'Cách này ĐÚNG, mà đề hỏi cách SAI.'),
        R('40 000 + 8 000 + 30 + 70 + 2'),
        W('2 + 70 + 300 + 8 000 + 40 000', 'QUY', 'Chỉ đảo thứ tự cộng, giá trị từng hàng vẫn đúng. Cách này ĐÚNG, đề hỏi cách SAI.'),
        W('300 + 2 + 70 + 40 000 + 8 000', 'QUY', 'Thứ tự cộng đảo lộn nhưng đủ các giá trị. Cách này ĐÚNG, đề hỏi cách SAI.'),
      ],
      explain: { steps: [
        { text: 'Giá trị đúng của từng chữ số: 4 → 40 000, 8 → 8 000, 3 → 300, 7 → 70, 2 → 2.', visual: { kind: 'place', digits: '48372', groupThousands: true, showValue: true } },
        { text: 'Cách thứ hai ghi 30 cho chữ số 3, nhưng chữ số 3 ở hàng trăm phải là 300. Cộng ra chỉ được 48 102.', mark: 'bad' },
        { text: 'Vậy cách tách SAI là 40 000 + 8 000 + 30 + 70 + 2.', mark: 'good' },
      ] },
    },
    {
      id: '3.6', src: 'S3-C3', type: 'choice', layout: 'grid2',
      prompt: 'Có bốn thẻ số: 7, 0, 2, 8. Dùng cả bốn thẻ, mỗi thẻ một lần, xếp thành số có 4 chữ số BÉ nhất. Đó là số nào?',
      hint: 'Số có 4 chữ số thì chữ số đầu tiên không được là 0.',
      choices: [
        W('0 278', 'HÀNG', 'Số có 4 chữ số không bắt đầu bằng 0.'),
        R('2 078'),
        W('2 087', 'QUY', 'Sau 2, 0 rồi chọn chữ số nhỏ trước: 7 rồi mới đến 8.'),
        W('8 720', 'ĐỌC', 'Đó là số LỚN nhất, đề hỏi số bé nhất.'),
      ],
      explain: { steps: [
        { text: 'Chữ số hàng nghìn phải khác 0 và càng nhỏ càng tốt, nên chọn 2 (nhỏ nhất trong 7, 2, 8).', visual: { kind: 'place', digits: '2000', highlight: 3 } },
        { text: 'Rồi đến 0 ở hàng trăm, 7 ở hàng chục, 8 ở hàng đơn vị: nhỏ trước, lớn sau.', visual: { kind: 'place', digits: '2078', showValue: true, anim: 'fill' } },
        { text: 'Vậy đáp án là 2 078.', mark: 'good' },
      ] },
    },
  ],

  variant: {
    id: '3.7', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
    prompt: 'Nam viết "năm mươi nghìn không trăm linh bảy" thành 5 007. Con thấy Nam viết sai. Số viết đúng là số nào?',
    hint: '"Năm mươi nghìn" có hai chữ số ở lớp nghìn.',
    choices: [
      W('5 007', 'HÀNG', '"Năm mươi nghìn" là 50 000, có hai chữ số ở lớp nghìn.'),
      R('50 007'),
      W('50 700', 'HÀNG', '"Linh bảy" là 7 đơn vị (hàng chục là 0), không phải 7 trăm.'),
      W('500 007', 'HÀNG', 'Thừa một chữ số 0: năm mươi nghìn chỉ có 2 chữ số ở lớp nghìn.'),
    ],
    explain: { steps: [
      { text: 'Lớp nghìn: năm mươi nghìn là 50 nghìn, viết 50.', visual: { kind: 'place', digits: '50000', groupThousands: true, highlight: [3, 4] } },
      { text: 'Lớp đơn vị: "không trăm linh bảy" là 0 trăm, 0 chục, 7 đơn vị, viết 007.', visual: { kind: 'place', digits: '50007', groupThousands: true, highlight: [0, 1, 2] } },
      { text: 'Vậy đáp án là 50 007.', mark: 'good' },
    ] },
  },

  generators: [
    {
      id: 'g3.1',
      make(rng) {
        let ds;
        do { ds = shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 6); } while (ds[0] === 0);
        const cand = [2, 3, 4].filter((k) => ds[5 - k] !== 0);
        const k = pick(rng, cand);
        const d = ds[5 - k];
        const N = Number(ds.join(''));
        const v = d * 10 ** k;
        const choices = shuffle(rng, [
          R(f(v)),
          W(f(d), 'HÀNG', 'Giá trị của chữ số là chữ số nhân giá trị hàng, không phải chính chữ số đó.'),
          W(f(d * 10 ** (k - 1)), 'HÀNG', `Chữ số ${d} đứng ở hàng ${HANG[k]}, không phải hàng ${HANG[k - 1]}.`),
          W(f(d * 10 ** (k + 1)), 'HÀNG', `Chữ số ${d} đứng ở hàng ${HANG[k]}, không phải hàng ${HANG[k + 1]}.`),
        ]);
        return {
          id: 'g3.1', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: `Chữ số ${d} trong số ${f(N)} có giá trị là bao nhiêu?`,
          hint: 'Đếm hàng từ phải sang: đơn vị, chục, trăm, nghìn…',
          visual: { kind: 'place', digits: String(N), groupThousands: true },
          choices, meta: { N: String(N), k, d },
          explain: { steps: [
            { text: `Đếm hàng từ phải sang: chữ số ${d} đứng ở hàng ${HANG[k]}.`, visual: { kind: 'place', digits: String(N), groupThousands: true, highlight: k } },
            { text: `Giá trị = chữ số × giá trị hàng = ${d} × ${f(10 ** k)} = ${f(v)}.`, visual: { kind: 'place', digits: String(N), groupThousands: true, highlight: k, showValue: true } },
            { text: `Vậy đáp án là ${f(v)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { N, k, d } = item.meta; const digit = Number(N[N.length - 1 - k]); void d; return f(digit * 10 ** k); },
    },
    {
      id: 'g3.2',
      make(rng) {
        const ds = [];
        for (let i = 0; i < 6; i++) ds.push(int(rng, 1, 9));
        const z = int(rng, 1, 4); // vị trí (từ trái, 1..4) là số 0
        ds[z] = 0;
        const places = [5, 4, 3, 2, 1, 0]; // chỉ số hàng từ phải của ô 0..5 tính từ trái
        const idxs = shuffle(rng, [0, 1, 2, 3, 4, 5].filter((i) => i !== z));
        const phrase = (i) => `${ds[i]} ${HANG[places[i]]}`;
        const answer = ds.join('');
        const omit = ds.filter((_, i) => i !== z).join('');
        const readOrder = idxs.map((i) => ds[i]).join('');
        const wrongHints = [{ match: omit, code: 'HÀNG', why: `Thiếu chữ số 0 ở hàng ${HANG[places[z]]}. Số có 6 chữ số nên phải đủ 6 hàng.` }];
        if (readOrder !== answer && readOrder !== omit) wrongHints.push({ match: readOrder, code: 'QUY', why: 'Con đã viết theo thứ tự đề đọc. Cần xếp từng số vào đúng hàng, từ hàng trăm nghìn tới hàng đơn vị.' });
        const zi = places[z];
        return {
          id: 'g3.2', src: '[biến thể mới]', type: 'numpad',
          prompt: `Viết số gồm: ${idxs.map(phrase).join(', ')}.`,
          hint: 'Xếp từng chữ số vào đúng hàng. Hàng nào không được nhắc đến thì viết 0.',
          slots: [{ label: 'Số cần viết:', answer, len: 6 }],
          wrongHints, meta: { ds, z },
          explain: { steps: [
            { text: `Xếp vào bảng hàng: ${idxs.slice().sort((a, b) => a - b).map(phrase).join(', ')}.`, visual: { kind: 'place', digits: answer, groupThousands: true, highlight: idxs.map((i) => places[i]) } },
            { text: `Đề không nói đến hàng ${HANG[zi]}, nên hàng ${HANG[zi]} là 0.`, visual: { kind: 'place', digits: answer, groupThousands: true, highlight: zi } },
            { text: `Vậy số cần viết là ${f(answer)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { return item.meta.ds.join(''); },
    },
    {
      id: 'g3.3',
      make(rng) {
        const U = int(rng, 10, 999);
        const caseA = rng.next() < 0.5; // A: hàng trăm = 0 ; B: hàng chục = 0
        const a = int(rng, 1, 9), b = int(rng, 1, 9);
        const lowerStr = caseA ? '0' + a + b : a + '0' + b;
        const N = Number(String(U) + lowerStr);
        const noZero = Number(String(U) + (caseA ? '' + a + b : '' + a + b));
        const moved = Number(String(U) + (caseA ? '' + a + '0' + b : '0' + a + b));
        const extra = Number(String(U) + '0' + lowerStr);
        const choices = shuffle(rng, [
          R(f(N)),
          W(f(noZero), 'HÀNG', caseA ? 'Hàng trăm bằng 0 nên phải viết chữ số 0: "không trăm".' : '"Linh" nghĩa là hàng chục bằng 0, phải viết chữ số 0.'),
          W(f(moved), 'HÀNG', caseA ? 'Số 0 phải ở hàng trăm ("không trăm"), không phải hàng chục.' : '"Linh" là 0 ở hàng chục, đứng giữa chữ số hàng trăm và hàng đơn vị.'),
          W(f(extra), 'HÀNG', 'Thừa một chữ số 0. Sau lớp nghìn chỉ có đúng ba chữ số của lớp đơn vị.'),
        ]);
        const zi = caseA ? 2 : 1;
        return {
          id: 'g3.3', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: `Số "${readVN(N)}" viết là:`,
          say: `Số ${readVN(N)} viết là:`,
          hint: 'Viết lớp nghìn trước, rồi lớp đơn vị. Chú ý "không trăm" hoặc "linh".',
          choices, meta: { N },
          explain: { steps: [
            { text: `Lớp nghìn: ${readVN(U * 1000).replace(/ nghìn$/, '')} nghìn, viết ${U}.`, visual: { kind: 'place', digits: String(N), groupThousands: true, highlight: [3, 4, 5].filter((i) => i < String(N).length) } },
            { text: caseA ? `Lớp đơn vị: "không trăm ${twoDigits(a, b, true)}" là 0 trăm, ${a} chục, ${b} đơn vị, viết 0${a}${b}.` : `Lớp đơn vị: "${group(a * 100 + b, true)}" là ${a} trăm, 0 chục, ${b} đơn vị, viết ${a}0${b}.`, visual: { kind: 'place', digits: String(N), groupThousands: true, highlight: zi } },
            { text: `Vậy đáp án là ${f(N)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { return f(item.meta.N); },
    },
    {
      id: 'g3.4',
      make(rng) {
        const ds = [0, 1, 2, 3, 4].map(() => int(rng, 1, 9));
        const N = Number(ds.join(''));
        const terms = ds.map((d, i) => d * 10 ** (4 - i)); // 10000.. 1
        const T = (arr) => arr.map(f).join(' + ');
        const std = terms, rev = terms.slice().reverse();
        let shuf;
        do { shuf = shuffle(rng, terms); } while (T(shuf) === T(std) || T(shuf) === T(rev));
        const j = int(rng, 0, 3);
        const bad = terms.slice();
        bad[j] = pick(rng, [0, 1]) === 0 ? terms[j] / 10 : terms[j] * 10;
        const badOrder = pick(rng, [std, rev, shuf]);
        const badArr = badOrder.map((t) => (t === terms[j] ? bad[j] : t));
        const wrongText = T(badArr);
        const choices = shuffle(rng, [
          R(wrongText),
          W(T(std), 'ĐỌC', 'Cách này ĐÚNG, mà đề hỏi cách SAI.'),
          W(T(rev), 'QUY', 'Chỉ đảo thứ tự cộng, giá trị từng hàng vẫn đúng. Cách này ĐÚNG, đề hỏi cách SAI.'),
          W(T(shuf), 'QUY', 'Thứ tự cộng đảo lộn nhưng đủ các giá trị. Cách này ĐÚNG, đề hỏi cách SAI.'),
        ]);
        return {
          id: 'g3.4', src: '[biến thể mới]', type: 'choice', layout: 'list',
          prompt: `Có bốn cách tách số ${f(N)}. Chạm vào cách tách SAI.`,
          hint: 'Kiểm tra giá trị của từng hàng xem có khớp với chữ số không.',
          choices, meta: { N, terms, j, bad: bad[j], order: badOrder },
          explain: { steps: [
            { text: `Giá trị đúng của từng chữ số trong ${f(N)}: ${terms.map(f).join(', ')}.`, visual: { kind: 'place', digits: String(N), groupThousands: true, showValue: true } },
            { text: `Cách tách SAI ghi ${f(bad[j])} cho chữ số ${ds[j]}, nhưng chữ số ${ds[j]} ở hàng ${HANG[4 - j]} phải là ${f(terms[j])}.`, mark: 'bad' },
            { text: `Vậy cách tách SAI là ${wrongText}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) {
        const { terms, j, bad, order } = item.meta;
        return order.map((t) => (t === terms[j] ? bad : t)).map(f).join(' + ');
      },
    },
  ],
};
