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

// ---- Viết nháp (vở ô li): tách số theo hàng, giá trị chữ số ----
const HL = '#D9480F', FIN = '#4B34A8';
const wkv = (lines, extra) => Object.assign({ kind: 'workout', lines, upto: lines.length, from: 0, anim: 'write' }, extra || {});
// 48 372 = 40 000 + 8 000 + 300 + 70 + 2 : mỗi số hạng một dòng, ghi chú là hàng của chữ số
function splitLines(N) {
  const s = String(N), n = s.length, out = [{ text: f(s), note: 'số cần tách' }]; let first = true;
  [...s].forEach((c, i) => { if (c === '0') return; out.push({ text: `${first ? '= ' : '+ '}${f(Number(c) * 10 ** (n - 1 - i))}`, note: `${c} ${HANG[n - 1 - i]}`, color: HL }); first = false; });
  out.push({ text: `= ${f(s)}`, note: 'cộng lại', color: FIN });
  return out;
}
// giá trị của chữ số ở hàng k (đếm từ phải, k = 0 là hàng đơn vị)
function valueLines(N, k) {
  const s = String(N), d = Number(s[s.length - 1 - k]);
  return [{ text: f(s), note: 'số đã cho' }, { text: `chữ số ${d} ở hàng ${HANG[k]}`, note: 'đếm từ phải', color: HL }, { text: `${d} × ${f(10 ** k)} = ${f(d * 10 ** k)}`, note: 'giá trị', color: FIN }];
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// Các cách viết SAI thường gặp của số "U nghìn" + lớp đơn vị có đúng một chữ số 0 (hàng trăm hoặc hàng chục)
function numWrongs(U, caseA, a, b) {
  const us = String(U), lowerStr = caseA ? '0' + a + b : a + '0' + b, N = Number(us + lowerStr);
  const out = [];
  const add = (v, code, why) => { if (v !== N) out.push({ v, w: W(f(v), code, why) }); };
  add(Number(us + a + b), 'HÀNG', caseA ? 'Hàng trăm bằng 0 nên phải viết chữ số 0: "không trăm".' : '"Linh" nghĩa là hàng chục bằng 0, phải viết chữ số 0.');
  add(Number(us + (caseA ? a + '0' + b : '0' + a + b)), 'HÀNG', caseA ? 'Số 0 phải ở hàng trăm ("không trăm"), không phải hàng chục.' : '"Linh" là 0 ở hàng chục, đứng giữa chữ số hàng trăm và hàng đơn vị.');
  add(Number(us + '0' + lowerStr), 'HÀNG', 'Thừa một chữ số 0. Sau lớp nghìn chỉ có đúng ba chữ số của lớp đơn vị.');
  add(Math.floor(N / 10), 'HÀNG', 'Số này thiếu một chữ số. Lớp đơn vị phải có đủ ba chữ số.');
  add(N * 10, 'HÀNG', 'Số này thừa một chữ số 0 ở cuối. Lớp đơn vị chỉ có ba chữ số.');
  if (a !== b) add(Number(us + (caseA ? '0' + b + a : b + '0' + a)), 'ĐỌC', 'Hai chữ số ở lớp đơn vị bị viết ngược chỗ. Con đọc lại từng chữ số từ trái sang phải.');
  if (U % 10 === 0) add(Number(String(U / 10) + lowerStr), 'HÀNG', `Lớp nghìn là ${U}, không phải ${U / 10}: số này thiếu một chữ số 0.`);
  return out;
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
    { text: 'Khi làm nháp, con tách số theo hàng, mỗi hàng một dòng: 48 372 = 40 000 + 8 000 + 300 + 70 + 2. Giá trị chữ số = chữ số × giá trị hàng.',
      visual: wkv(splitLines('48372')) },
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
      visual: wkv(valueLines('100510', 2)) },
    { text: 'Tách số 48 372 theo hàng: 40 000 + 8 000 + 300 + 70 + 2. Cộng đủ các hàng thì được lại số ban đầu.',
      visual: wkv(splitLines('48372')) },
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
        { text: 'a) 100 510: chữ số 5 đứng ở hàng trăm. Giá trị là 5 × 100 = 500.', visual: wkv(valueLines('100510', 2)) },
        { text: 'b) 140 567: đếm từ phải, 7 đơn vị, 6 chục, 5 trăm, 0 nghìn, 4 chục nghìn. Giá trị là 4 × 10 000 = 40 000.', visual: wkv(valueLines('140567', 4)) },
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
        { text: 'Giá trị đúng của từng chữ số: 4 → 40 000, 8 → 8 000, 3 → 300, 7 → 70, 2 → 2.', visual: wkv(splitLines('48372')) },
        { text: 'Cách thứ hai ghi 30 cho chữ số 3, nhưng chữ số 3 ở hàng trăm phải là 300. Cộng ra chỉ được 48 102.', mark: 'bad', visual: wkv([{ text: 'chữ số 3 ở hàng trăm', note: 'đếm từ phải' }, { text: '3 × 100 = 300', note: 'đúng', color: FIN }, { text: 'không phải 30', note: 'sai', color: HL }]) },
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
        const cand2 = [1, 2, 3, 4, 5].filter((k) => ds[5 - k] !== 0);
        const k = pick(rng, cand2);
        const d = ds[5 - k];
        const N = Number(ds.join(''));
        const v = d * 10 ** k;
        const P = (x) => 10 ** x;
        const pool = [
          cand(d, 'HÀNG', 'Giá trị của chữ số là chữ số nhân giá trị hàng, không phải chính chữ số đó.'),
          cand(d * P(k - 1), 'HÀNG', `Chữ số ${d} đứng ở hàng ${HANG[k]}, không phải hàng ${HANG[k - 1]}.`),
          cand(N % P(k + 1), 'QUY', `Con đã đọc cả các chữ số bên phải. Giá trị chỉ tính riêng chữ số ${d}: ${d} × ${f(P(k))}.`),
          cand(Math.floor(N / P(k)) * P(k), 'QUY', `Con đã đọc cả các chữ số bên trái. Giá trị chỉ tính riêng chữ số ${d}: ${d} × ${f(P(k))}.`),
        ];
        if (k + 1 <= 5) pool.push(cand(d * P(k + 1), 'HÀNG', `Chữ số ${d} đứng ở hàng ${HANG[k]}, không phải hàng ${HANG[k + 1]}.`));
        if (k >= 2) pool.push(cand(d * P(k - 2), 'HÀNG', `Chữ số ${d} đứng ở hàng ${HANG[k]}, không phải hàng ${HANG[k - 2]}.`));
        if (k + 2 <= 5) pool.push(cand(d * P(k + 2), 'HÀNG', `Chữ số ${d} đứng ở hàng ${HANG[k]}, không phải hàng ${HANG[k + 2]}.`));
        const choices = shuffle(rng, [R(f(v)), ...rankPick(rng, v, pool)]);
        const nmA = pick(rng, NAMES);
        return {
          id: 'g3.1', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: pick(rng, [`Chữ số ${d} trong số ${f(N)} có giá trị là bao nhiêu?`, `${nmA} gạch chân chữ số ${d} trong số ${f(N)}. Giá trị của chữ số đó là bao nhiêu?`]),
          hint: 'Đếm hàng từ phải sang: đơn vị, chục, trăm, nghìn…',
          visual: { kind: 'place', digits: String(N), groupThousands: true },
          choices, meta: { N: String(N), k, d },
          explain: { steps: [
            { text: `Đếm hàng từ phải sang: chữ số ${d} đứng ở hàng ${HANG[k]}.`, visual: { kind: 'place', digits: String(N), groupThousands: true, highlight: k } },
            { text: `Giá trị = chữ số × giá trị hàng = ${d} × ${f(10 ** k)} = ${f(v)}.`, visual: wkv(valueLines(N, k), { done: true }) },
            { text: `Vậy đáp án là ${f(v)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { N, k } = item.meta; const digit = Number(N[N.length - 1 - k]); return f(digit * 10 ** k); },
    },
    {
      id: 'g3.2', covers: ['3.3'],
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
        const zi = places[z], nmA = pick(rng, NAMES);
        return {
          id: 'g3.2', src: '[biến thể mới]', type: 'numpad',
          prompt: pick(rng, [`Viết số gồm: ${idxs.map(phrase).join(', ')}.`, `${nmA} nói số của bạn gồm: ${idxs.map(phrase).join(', ')}. Con hãy viết số đó.`]),
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
      // Viết số từ lời đọc ("không trăm", "linh")
      id: 'g3.3', covers: ['3.2'],
      make(rng) {
        const U = int(rng, 10, 999);
        const caseA = rng.next() < 0.5; // A: hàng trăm = 0 ; B: hàng chục = 0
        const a = int(rng, 1, 9), b = int(rng, 1, 9);
        const N = Number(String(U) + (caseA ? '0' + a + b : a + '0' + b));
        const choices = shuffle(rng, [R(f(N)), ...rankPick(rng, N, numWrongs(U, caseA, a, b).map((p) => p))]);
        const zi = caseA ? 2 : 1, nmA = pick(rng, NAMES);
        return {
          id: 'g3.3', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: pick(rng, [`Số "${readVN(N)}" viết là:`, `${nmA} đọc to: "${readVN(N)}". Số ${nmA} vừa đọc viết là:`]),
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
      // Chọn cách tách SAI (đổi chỗ hàng của hai chữ số)
      id: 'g3.4', covers: ['3.5'],
      make(rng) {
        const n = rng.next() < 0.5 ? 5 : 6;
        let ds, i, j;
        for (let t = 0; t < 100; t++) {
          ds = Array.from({ length: n }, () => int(rng, 1, 9));
          i = int(rng, 0, n - 2); j = int(rng, i + 1, n - 1);
          if (ds[i] !== ds[j]) break;
        }
        const N = Number(ds.join(''));
        const pw = (x) => 10 ** (n - 1 - x);
        const terms = ds.map((d, x) => d * pw(x));
        const bad = terms.slice(); bad[i] = ds[i] * pw(j); bad[j] = ds[j] * pw(i);
        const idx = Array.from({ length: n }, (_, x) => x);
        const orders = [idx, idx.slice().reverse(), shuffle(rng, idx)];
        for (let t = 0; t < 30 && (orders[2].join() === orders[0].join() || orders[2].join() === orders[1].join()); t++) orders[2] = shuffle(rng, idx);
        const T = (arr, ord) => ord.map((x) => f(arr[x])).join(' + ');
        const badOrder = pick(rng, [0, 1, 2]);
        const wrongText = T(bad, orders[badOrder]);
        const okWhy = (k) => (k === 1 ? 'Chỉ đảo thứ tự cộng, giá trị từng hàng vẫn đúng. Cách này ĐÚNG, đề hỏi cách SAI.' : k === 2 ? 'Thứ tự cộng đảo lộn nhưng đủ các giá trị. Cách này ĐÚNG, đề hỏi cách SAI.' : 'Cách này ĐÚNG, mà đề hỏi cách SAI.');
        const choices = shuffle(rng, [R(wrongText), ...[0, 1, 2].map((k) => W(T(terms, orders[k]), k === 0 ? 'ĐỌC' : 'QUY', okWhy(k)))]);
        const nmA = pick(rng, NAMES);
        return {
          id: 'g3.4', src: '[biến thể mới]', type: 'choice', layout: 'list',
          prompt: pick(rng, [`Có bốn cách tách số ${f(N)}. Chạm vào cách tách SAI.`, `${nmA} tách số ${f(N)} theo hàng bằng bốn cách. Chạm vào cách tách SAI.`]),
          hint: 'Kiểm tra giá trị của từng hàng xem có khớp với chữ số không.',
          visual: { kind: 'place', digits: String(N), groupThousands: true },
          choices, meta: { ds, i, j, order: orders[badOrder] },
          explain: { steps: [
            { text: `Giá trị đúng của từng chữ số trong ${f(N)}: ${terms.map(f).join(', ')}.`, visual: wkv(splitLines(N)) },
            { text: `Cách tách SAI ghi ${f(bad[i])} cho chữ số ${ds[i]} và ${f(bad[j])} cho chữ số ${ds[j]}. Nhưng chữ số ${ds[i]} ở hàng ${HANG[n - 1 - i]} phải là ${f(terms[i])}, còn chữ số ${ds[j]} ở hàng ${HANG[n - 1 - j]} phải là ${f(terms[j])}.`, mark: 'bad', visual: wkv([i, j].map((x) => ({ text: `${ds[x]} × ${f(pw(x))} = ${f(terms[x])}`, note: `chữ số ${ds[x]} ở hàng ${HANG[n - 1 - x]}`, color: x === i ? FIN : HL }))) },
            { text: `Vậy cách tách SAI là ${wrongText}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) {
        const { ds, i, j, order } = item.meta; const n = ds.length, pw = (x) => 10 ** (n - 1 - x);
        const bad = ds.map((d, x) => d * pw(x)); bad[i] = ds[i] * pw(j); bad[j] = ds[j] * pw(i);
        return order.map((x) => f(bad[x])).join(' + ');
      },
    },
    {
      // Đọc số
      id: 'g3.5', covers: ['3.1'],
      make(rng) {
        const U = int(rng, 10, 999), caseA = rng.next() < 0.5;
        const a = int(rng, 1, 9), b = int(rng, 1, 9);
        const lowerStr = caseA ? '0' + a + b : a + '0' + b, L = Number(lowerStr);
        const N = Number(String(U) + lowerStr);
        const up = group(U, false) + ' nghìn', lowT = group(L, true);
        const right = cap(up + ' ' + lowT);
        const P = [];
        P.push(W(cap(up + ' ' + lowT.replace('không trăm ', '').replace('linh ', '')), 'HÀNG', caseA ? 'Hàng trăm bằng 0, nên phải đọc "không trăm" trước phần còn lại.' : 'Hàng chục bằng 0, nên phải đọc "linh" trước chữ số hàng đơn vị.'));
        P.push(W(cap(String(N).split('').map((c) => DIG[Number(c)]).join(' ')), 'QUY', 'Phải đọc theo hàng và theo lớp (… nghìn …), không đọc từng chữ số rời nhau.'));
        if (caseA && b === 5) P.push(W(right.replace(/lăm$/, 'năm'), 'QUY', 'Chữ số 5 ở hàng đơn vị, đứng sau chữ số hàng chục thì đọc là "lăm".'));
        else if (caseA && a >= 2 && b === 1) P.push(W(right.replace(/mốt$/, 'một'), 'QUY', 'Chữ số 1 ở hàng đơn vị, đứng sau "mươi" thì đọc là "mốt".'));
        else if (a !== b) P.push(W(cap(up + ' ' + group(Number(caseA ? '0' + b + a : b + '0' + a), true)), 'ĐỌC', 'Hai chữ số ở lớp đơn vị đã đọc ngược chỗ. Con đọc lại từng chữ số từ trái sang phải.'));
        const U2 = U % 10 === 9 ? U - 1 : U + 1;
        P.push(W(cap(group(U2, false) + ' nghìn ' + lowT), 'ĐỌC', `Lớp nghìn của số này là ${U}, không phải ${U2}. Con đọc nhầm một chữ số.`));
        P.push(caseA ? W(cap(up + ' ' + lowT.replace('không trăm ', 'không trăm linh ')), 'ĐỌC', 'Hàng chục khác 0 nên không đọc "linh". "Linh" chỉ dùng khi hàng chục bằng 0.')
          : W(cap(up + ' ' + lowT.replace('linh ', 'không mươi ')), 'ĐỌC', 'Không đọc "không mươi". Hàng chục bằng 0 thì đọc là "linh".'));
        const uniq = []; const seen = new Set([right]);
        P.forEach((w) => { if (!seen.has(w.text)) { seen.add(w.text); uniq.push(w); } });
        const choices = shuffle(rng, [R(right), ...shuffle(rng, uniq).slice(0, 3)]);
        const nmA = pick(rng, NAMES);
        return {
          id: 'g3.5', src: '[biến thể mới]', type: 'choice', layout: 'list',
          prompt: pick(rng, [`Số ${f(N)} đọc là:`, `${nmA} muốn đọc to số ${f(N)}. Bạn phải đọc thế nào?`]),
          hint: caseA ? 'Hàng trăm của số này là chữ số nào? Hãy đọc cả hàng đó.' : 'Hàng chục của số này là chữ số nào? Hãy đọc cả hàng đó.',
          visual: { kind: 'place', digits: String(N), groupThousands: true },
          choices, meta: { N },
          explain: { steps: [
            { text: `Tách ba chữ số một: ${U} | ${lowerStr}. Lớp nghìn là ${U}, đọc là ${group(U, false)} nghìn.`, visual: { kind: 'place', digits: String(N), groupThousands: true, highlight: [3, 4, 5].filter((x) => x < String(N).length) } },
            { text: caseA ? `Lớp đơn vị là ${lowerStr}. Hàng trăm bằng 0 nên đọc "không trăm", rồi "${twoDigits(a, b, true)}".` : `Lớp đơn vị là ${lowerStr}. Hàng chục bằng 0 nên đọc "${group(L, true)}".`, visual: { kind: 'place', digits: String(N), groupThousands: true, highlight: [0, 1, 2] } },
            { text: `Vậy đáp án là ${right.toLowerCase()}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { return cap(readVN(item.meta.N)); },
    },
    {
      // Giá trị của chữ số (hai câu a, b)
      id: 'g3.6', covers: ['3.4'],
      make(rng) {
        const pickNum = (len) => {
          let ds;
          do { ds = shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, len); } while (ds[0] === 0);
          const ks = [1, 2, 3, 4, 5].filter((k) => k < len && ds[len - 1 - k] !== 0);
          const k = pick(rng, ks);
          return { N: ds.join(''), k, d: ds[len - 1 - k] };
        };
        const A = pickNum(6), B = pickNum(rng.next() < 0.5 ? 5 : 6);
        const val = (x) => String(x.d * 10 ** x.k);
        const slots = [{ label: 'a)', answer: val(A) }, { label: 'b)', answer: val(B) }];
        const wrongHints = [];
        [A, B].forEach((x, i) => {
          const mk = (v, code, why) => { const arr = slots.map((s) => s.answer); arr[i] = String(v); if (String(v) !== slots[i].answer) wrongHints.push({ match: arr.join('|'), code, why }); };
          const lab = i === 0 ? 'a' : 'b';
          mk(x.d, 'HÀNG', `Ở câu ${lab}, giá trị là chữ số nhân giá trị hàng, không phải chính chữ số ${x.d}.`);
          mk(x.d * 10 ** (x.k - 1), 'HÀNG', `Ở câu ${lab}, chữ số ${x.d} đứng ở hàng ${HANG[x.k]}, không phải hàng ${HANG[x.k - 1]}.`);
          if (x.k + 1 <= 5) mk(x.d * 10 ** (x.k + 1), 'HÀNG', `Ở câu ${lab}, chữ số ${x.d} đứng ở hàng ${HANG[x.k]}, không phải hàng ${HANG[x.k + 1]}.`);
        });
        const ex = (x, lab) => `${lab}) ${f(x.N)}: đếm từ phải, chữ số ${x.d} ở hàng ${HANG[x.k]}. Giá trị là ${x.d} × ${f(10 ** x.k)} = ${f(val(x))}.`;
        return {
          id: 'g3.6', src: '[biến thể mới]', type: 'numpad',
          prompt: `a) Chữ số ${A.d} trong số ${f(A.N)} có giá trị là bao nhiêu?\nb) Chữ số ${B.d} trong số ${f(B.N)} có giá trị là bao nhiêu?`,
          hint: 'Tìm chữ số đứng ở hàng nào, rồi nhân với giá trị hàng.',
          slots, wrongHints, meta: { A, B },
          explain: { steps: [
            { text: ex(A, 'a'), visual: wkv(valueLines(A.N, A.k)) },
            { text: ex(B, 'b'), visual: wkv(valueLines(B.N, B.k)) },
            { text: `Vậy a) ${f(val(A))} và b) ${f(val(B))}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { return [item.meta.A, item.meta.B].map((x) => String(Number(x.N[x.N.length - 1 - x.k]) * 10 ** x.k)).join('|'); },
    },
    {
      // Xếp thẻ số thành số bé nhất / lớn nhất
      id: 'g3.7', covers: ['3.6'],
      make(rng) {
        const n = rng.next() < 0.7 ? 4 : 5;
        const small = rng.next() < 0.6;
        let cards;
        for (let t = 0; t < 100; t++) {
          cards = shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, n);
          if (cards.includes(0) === (rng.next() < (small ? 0.85 : 0.5))) break;
        }
        const asc = cards.slice().sort((x, y) => x - y), desc = asc.slice().reverse();
        const nz = asc.filter((x) => x !== 0);
        const minStr = [nz[0], ...asc.filter((x, i) => !(x === nz[0] && i === asc.indexOf(nz[0])))].join('');
        const maxStr = desc.join('');
        const swap = (s, i) => { const c = s.split(''); [c[i], c[i + 1]] = [c[i + 1], c[i]]; return c.join(''); };
        const pool = [];
        const add = (str, code, why) => { if (str !== (small ? minStr : maxStr)) pool.push({ v: Number(str), w: W(f(str), code, why) }); };
        if (small) {
          if (asc[0] === 0) add(asc.join(''), 'HÀNG', `Số có ${n} chữ số thì chữ số đầu tiên không được là 0.`);
          add(maxStr, 'ĐỌC', 'Đó là số LỚN nhất, đề hỏi số bé nhất.');
          add(swap(minStr, n - 2), 'QUY', `Sau chữ số đầu, con xếp chữ số nhỏ trước, chữ số lớn sau: ${minStr.slice(1).split('').join(', ')} phải xếp theo thứ tự tăng dần.`);
          add(swap(minStr, 1), 'QUY', `Sau chữ số đầu, con xếp chữ số nhỏ trước, chữ số lớn sau: ${minStr.slice(1).split('').join(', ')} phải xếp theo thứ tự tăng dần.`);
          add(nz.length > 1 ? [nz[1], ...asc.filter((x) => x !== nz[1])].join('') : '', 'HÀNG', 'Chữ số hàng cao nhất chưa phải chữ số nhỏ nhất có thể dùng. Con thử chọn chữ số nhỏ hơn.');
        } else {
          add(minStr, 'ĐỌC', 'Đó là số BÉ nhất, đề hỏi số lớn nhất.');
          add(swap(maxStr, n - 2), 'QUY', 'Các chữ số phải xếp từ lớn đến bé. Hai chữ số cuối đang bị xếp ngược.');
          add(swap(maxStr, 0), 'QUY', 'Chữ số hàng cao nhất phải là chữ số lớn nhất. Hai chữ số đầu đang bị xếp ngược.');
          add(asc.join(''), 'ĐỌC', 'Con đã xếp từ bé đến lớn, số này không phải số lớn nhất.');
          add(swap(maxStr, 1), 'QUY', 'Các chữ số phải xếp từ lớn đến bé. Có hai chữ số đang bị xếp ngược.');
        }
        const filtered = pool.filter((p) => p.w.text !== '' && p.w.text !== f(small ? minStr : maxStr));
        const right = Number(small ? minStr : maxStr);
        const choices = shuffle(rng, [R(f(small ? minStr : maxStr)), ...rankPick(rng, right, filtered)]);
        const nmA = pick(rng, NAMES), word = n === 4 ? 'bốn' : 'năm';
        return {
          id: 'g3.7', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: pick(rng, [
            `Có ${word} thẻ số: ${cards.join(', ')}. Dùng cả ${word} thẻ, mỗi thẻ một lần, xếp thành số có ${n} chữ số ${small ? 'BÉ' : 'LỚN'} nhất. Đó là số nào?`,
            `${nmA} có ${word} thẻ số ${cards.join(', ')}. ${nmA} dùng cả ${word} thẻ, mỗi thẻ một lần, để xếp số có ${n} chữ số ${small ? 'BÉ' : 'LỚN'} nhất. Đó là số nào?`]),
          hint: small ? `Số có ${n} chữ số thì chữ số đầu tiên không được là 0.` : 'Chữ số lớn nhất phải đứng ở hàng cao nhất.',
          choices, meta: { cards, small },
          explain: { steps: small ? [
            { text: `Chữ số hàng cao nhất phải khác 0 và càng nhỏ càng tốt, nên chọn ${nz[0]}.`, visual: { kind: 'place', digits: String(nz[0]) + '0'.repeat(n - 1), highlight: n - 1 } },
            { text: `Các thẻ còn lại xếp từ nhỏ đến lớn: ${minStr.slice(1).split('').join(', ')}.`, visual: { kind: 'place', digits: minStr, showValue: true, anim: 'fill' } },
            { text: `Vậy đáp án là ${f(minStr)}.`, mark: 'good' },
          ] : [
            { text: 'Chữ số lớn nhất phải đứng ở hàng cao nhất, rồi đến chữ số lớn thứ hai, cứ thế xuống dần.', visual: { kind: 'place', digits: maxStr, anim: 'fill' } },
            { text: `Xếp từ lớn đến bé: ${desc.join(', ')}.`, visual: { kind: 'place', digits: maxStr, showValue: true } },
            { text: `Vậy đáp án là ${f(maxStr)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) {
        const { cards, small } = item.meta; const asc = cards.slice().sort((x, y) => x - y);
        if (!small) return f(asc.slice().reverse().join(''));
        const i = asc.findIndex((x) => x !== 0); const rest = asc.filter((_, k) => k !== i);
        return f([asc[i], ...rest].join(''));
      },
    },
    {
      // Bạn viết sai số từ lời đọc: tìm số đúng
      id: 'g3.8', covers: ['3.7'],
      make(rng) {
        const U = rng.next() < 0.4 ? int(rng, 1, 9) * 10 : int(rng, 10, 999);
        const caseA = rng.next() < 0.5;
        const a = int(rng, 1, 9), b = int(rng, 1, 9);
        const N = Number(String(U) + (caseA ? '0' + a + b : a + '0' + b));
        const pool = numWrongs(U, caseA, a, b);
        const seen = new Set(); const uniq = pool.filter((p) => (seen.has(p.v) ? false : (seen.add(p.v), true)));
        const bad = pick(rng, uniq);
        const others = shuffle(rng, uniq.filter((p) => p !== bad)).slice(0, 2);
        const nmA = pick(rng, NAMES);
        const badW = W(bad.w.text, bad.w.code, `Đây là số ${nmA} đã viết, và số này chưa đúng. ${bad.w.why}`);
        const choices = shuffle(rng, [R(f(N)), badW, ...others.map((p) => p.w)]);
        const zi = caseA ? 2 : 1;
        return {
          id: 'g3.8', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: `${nmA} viết "${readVN(N)}" thành ${bad.w.text}. Con thấy ${nmA} viết sai. Số viết đúng là số nào?`,
          say: `${nmA} viết ${readVN(N)} thành ${bad.w.text}. Con thấy ${nmA} viết sai. Số viết đúng là số nào?`,
          hint: 'Viết lớp nghìn trước, rồi lớp đơn vị. Chú ý "không trăm" hoặc "linh".',
          choices, meta: { N },
          explain: { steps: [
            { text: `Lớp nghìn: ${readVN(U * 1000).replace(/ nghìn$/, '')} nghìn, viết ${U}.`, visual: { kind: 'place', digits: String(N), groupThousands: true, highlight: [3, 4, 5].filter((i) => i < String(N).length) } },
            { text: caseA ? `Lớp đơn vị: "không trăm ${twoDigits(a, b, true)}" là 0 trăm, ${a} chục, ${b} đơn vị, viết 0${a}${b}.` : `Lớp đơn vị: "${group(a * 100 + b, true)}" là ${a} trăm, 0 chục, ${b} đơn vị, viết ${a}0${b}.`, visual: { kind: 'place', digits: String(N), groupThousands: true, highlight: zi } },
            { text: `Vậy số viết đúng là ${f(N)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { return f(item.meta.N); },
    },
  ],
};
