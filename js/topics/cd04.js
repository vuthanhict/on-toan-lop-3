import { pick, int, shuffle } from '../core/rng.js';

const f = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const R = (text) => ({ text, correct: true });
const W = (text, code, why) => ({ text, code, why });
const lastNonZero = (rng, lo, hi) => { let x; do { x = int(rng, lo, hi); } while (x % 10 === 0); return x; };
const zeros = (k) => (k === 0 ? 'chưa chữ số 0 nào' : k === 1 ? 'một chữ số 0' : k === 2 ? 'hai chữ số 0' : 'ba chữ số 0');
// "Số này mới thêm/bớt …" (k − 1 chữ số 0 thay vì k)
const fewer = (k, verb) => (k - 1 === 0 ? `Số này chưa ${verb} chữ số 0 nào.` : `Số này mới ${verb} ${zeros(k - 1)}.`);
const kOf = (m) => Math.round(Math.log10(m));

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
// số có tận cùng khác 0 (thường) hoặc đôi khi là bội của 10
const anyNum = (rng, lo, hi, pTen = 0.35) => (rng.next() < pTen ? int(rng, Math.ceil(lo / 10), Math.floor(hi / 10)) * 10 : lastNonZero(rng, lo, hi));
const mTxt = (m) => f(m);

// ---- Viết nháp (vở ô li): thêm / bớt chữ số 0 ở cuối ----
const HL = '#D9480F', FIN = '#4B34A8';
const ZR = (n) => '0'.repeat(n);
// Dòng viết tay: ×  → viết số rồi thêm k số 0 (màu nổi bật);  ÷ → tách k số 0 ở cuối rồi bỏ đi. (÷: a phải có ≥ k số 0 ở cuối)
function zeroLines(a, op, m) {
  const k = kOf(m);
  if (op === '×') return [{ text: `${f(a)} × ${f(m)}`, note: 'đề bài' }, { text: `${a} ${ZR(k)}`, note: `thêm ${k} số 0`, color: HL }, { text: `= ${f(a * m)}`, note: 'kết quả', color: FIN }];
  const rest = String(a).slice(0, String(a).length - k);
  return [{ text: `${f(a)} ÷ ${f(m)}`, note: 'đề bài' }, { text: `${rest} ${ZR(k)}`, note: `${k} số 0 ở cuối`, color: HL }, { text: `= ${f(a / m)}`, note: `bỏ ${k} số 0`, color: FIN }];
}
const zv = (a, op, m, extra) => { const lines = zeroLines(a, op, m); return Object.assign({ kind: 'workout', lines, upto: lines.length, from: 0, anim: 'write' }, extra || {}); };

export default {
  id: 'cd04', no: 4, day: 2, title: 'Nhân, chia với 10 và 100', short: '×÷ 10, 100', icon: '🐻',
  intro: 'Nhân 10 thì mỗi chữ số lên một hàng, chia 10 thì xuống một hàng. Đếm đúng số chữ số 0!',

  remember: [
    { text: 'Nhân với 10 thì thêm một chữ số 0 ở cuối, nhân với 100 thì thêm hai chữ số 0. Chia cho 10 thì bớt một chữ số 0 ở cuối, chia cho 100 thì bớt hai chữ số 0. Số bị chia phải có sẵn các chữ số 0 ở cuối.',
      visual: { kind: 'sequence', items: [47, 470, 4700], arrowLabels: ['× 10', '× 10'], anim: 'reveal' } },
    { text: 'Số 0 ở giữa vẫn phải giữ nguyên. 900 500 ÷ 100 chỉ bớt hai số 0 ở cuối, nên được 9 005.',
      visual: zv(900500, '÷', 100) },
    { text: 'Ô trống thì dùng phép ngược. □ ÷ 10 = 74 thì □ = 74 × 10 = 740.',
      visual: { kind: 'sequence', items: ['?', 74, 740], arrowLabels: ['÷ 10', '× 10'], highlight: [0], anim: 'reveal' } },
    { text: 'Khi làm nháp, con viết số rồi viết thêm các chữ số 0 ở cuối (hoặc gạch bớt đi). Ví dụ 428 × 100: viết 428, thêm 00, được 42 800.',
      visual: zv(428, '×', 100) },
  ],

  lesson: [
    { text: 'Có 4 khối nhỏ (đơn vị). Đây là số 4.',
      visual: { kind: 'blocks3d', ones: 4, caption: true, anim: 'build' } },
    { text: 'Nhân với 10: cứ 10 khối nhỏ ghép thành 1 thanh chục. 4 × 10 = 40, tức là 4 thanh chục. Mỗi chữ số lên một hàng.',
      visual: { kind: 'blocks3d', tens: 4, caption: true, anim: 'build' } },
    { text: 'Nhân với 100: mỗi 10 thanh chục ghép thành 1 tấm trăm. 4 × 100 = 400, tức là 4 tấm trăm.',
      visual: { kind: 'blocks3d', hundreds: 4, caption: true, anim: 'build' } },
    { text: '47 × 10 = 470. Chữ số 4 lên hàng trăm, chữ số 7 lên hàng chục, hàng đơn vị thêm chữ số 0.',
      visual: zv(47, '×', 10) },
    { text: 'Chia thì ngược lại: mỗi chữ số xuống một hàng. 900 500 ÷ 100 = 9 005, chỉ bớt hai số 0 ở cuối, hai số 0 ở giữa vẫn còn.',
      visual: zv(900500, '÷', 100) },
    { text: 'Gặp ô trống: dùng phép ngược. □ ÷ 10 = 74 thì □ = 74 × 10 = 740.',
      visual: { kind: 'sequence', items: ['?', 74], arrowLabels: ['÷ 10'], highlight: [0] } },
  ],

  items: [
    {
      id: '4.1', src: 'T2 tr.1 C4', type: 'choice', layout: 'list',
      prompt: 'Phép tính nào có kết quả SAI?',
      hint: '÷ 10 là bớt một chữ số 0 ở cuối.',
      choices: [
        W('428 × 100 = 42 800', 'ĐỌC', 'Phép này đúng (thêm hai số 0). Đề hỏi phép SAI.'),
        W('46 900 ÷ 100 = 469', 'ĐỌC', 'Phép này đúng (bớt hai số 0). Đề hỏi phép SAI.'),
        W('1 230 × 10 = 12 300', 'ĐỌC', 'Phép này đúng (thêm một số 0). Đề hỏi phép SAI.'),
        R('8 870 ÷ 10 = 88 700'),
      ],
      explain: { steps: [
        { text: 'Kiểm từng phép: 428 × 100 = 42 800 đúng, 46 900 ÷ 100 = 469 đúng, 1 230 × 10 = 12 300 đúng.', mark: 'good' },
        { text: '8 870 ÷ 10 phải bớt một chữ số 0 ở cuối: được 887, không phải 88 700. Kết quả 88 700 là đã THÊM số 0.', mark: 'bad', visual: zv(8870, '÷', 10) },
        { text: 'Vậy phép SAI là 8 870 ÷ 10 = 88 700.', mark: 'good' },
      ] },
    },
    {
      id: '4.2', src: 'T3 tr.1 C1', type: 'choice', layout: 'grid2',
      prompt: '… × 100 = 4 700. Số cần điền vào chỗ trống là số nào?',
      hint: 'Dùng phép ngược: muốn tìm thừa số chưa biết thì chia.',
      choices: [
        W('40', 'QUY', '40 × 100 = 4 000, chưa bằng 4 700. Thử lại bằng phép nhân.'),
        W('470', 'HÀNG', 'Thử lại: 470 × 100 = 47 000, chưa bằng 4 700.'),
        W('70', 'QUY', '70 × 100 = 7 000, chưa bằng 4 700. Thử lại bằng phép nhân.'),
        R('47'),
      ],
      explain: { steps: [
        { text: 'Muốn tìm thừa số chưa biết, mình lấy tích chia cho thừa số đã biết: 4 700 ÷ 100.', visual: { kind: 'sequence', items: ['?', 4700], arrowLabels: ['× 100'], highlight: [0] } },
        { text: '÷ 100 là bớt hai chữ số 0 ở cuối: 4 700 → 47.', visual: zv(4700, '÷', 100) },
        { text: 'Kiểm tra lại: 47 × 100 = 4 700. Vậy đáp án là 47.', mark: 'good' },
      ] },
    },
    {
      id: '4.3', src: 'S5 Q6', type: 'match',
      prompt: 'Nối mỗi phép tính với kết quả của nó. Hai phép có thể nối chung một kết quả.',
      hint: 'Đếm số chữ số 0 được thêm vào hoặc bớt đi.',
      left: [{ id: 'p1', text: '18 × 100' }, { id: 'p2', text: '1 800 ÷ 10' }, { id: 'p3', text: '1 000 × 18' }, { id: 'p4', text: '18 × 10' }],
      right: [{ id: 'r180', text: '180' }, { id: 'r1800', text: '1 800' }, { id: 'r18000', text: '18 000' }],
      pairs: { p1: 'r1800', p2: 'r180', p3: 'r18000', p4: 'r180' },
      explain: { steps: [
        { text: '18 × 100: thêm hai số 0, được 1 800. 18 × 10: thêm một số 0, được 180.', visual: zv(18, '×', 100) },
        { text: '1 800 ÷ 10: bớt một số 0, được 180. Chia thì bớt số 0, không thêm.', visual: zv(1800, '÷', 10) },
        { text: '1 000 × 18 = 18 000 (thêm ba số 0 vào 18).', visual: zv(18, '×', 1000) },
        { text: 'Vậy 18 × 100 nối 1 800, 1 800 ÷ 10 nối 180, 1 000 × 18 nối 18 000, 18 × 10 nối 180.', mark: 'good' },
      ] },
    },
    {
      id: '4.4', src: 'T2 tr.2 C8', type: 'numpad',
      prompt: 'Tìm số cần điền vào ô trống □:\na) □ ÷ 10 = 74\nb) □ × 100 = 6 000\nc) 403 × □ = 4 030\nd) 5 500 ÷ □ = 55',
      hint: 'Dùng phép ngược, và đếm số chữ số 0 bị thêm hoặc bớt.',
      slots: [{ label: 'a)', answer: '740' }, { label: 'b)', answer: '60' }, { label: 'c)', answer: '10' }, { label: 'd)', answer: '100' }],
      wrongHints: [
        { match: '7|60|10|100', code: 'NGƯỢC', why: 'Ở câu a, phải NHÂN 74 với 10 chứ không phải chia: 74 × 10 = 740.' },
        { match: '740|600000|10|100', code: 'NGƯỢC', why: 'Ở câu b, 6 000 ÷ 100 = 60. Tìm thừa số thì phải CHIA, không nhân.' },
        { match: '740|60|100|100', code: 'HÀNG', why: 'Ở câu c, 403 × 100 = 40 300. Từ 403 đến 4 030 chỉ thêm MỘT số 0, nên nhân với 10.' },
        { match: '740|60|10|10', code: 'HÀNG', why: 'Ở câu d, 5 500 bớt hai số 0 mới ra 55, nên chia cho 100.' },
      ],
      explain: { steps: [
        { text: 'a) □ ÷ 10 = 74, ngược lại □ = 74 × 10 = 740.', visual: zv(74, '×', 10) },
        { text: 'b) □ × 100 = 6 000, nên □ = 6 000 ÷ 100 = 60.', visual: zv(6000, '÷', 100) },
        { text: 'c) 403 → 4 030 chỉ thêm một số 0, nên nhân với 10. d) 5 500 → 55 bớt hai số 0, nên chia cho 100.', visual: zv(403, '×', 10) },
        { text: 'Vậy a) 740, b) 60, c) 10, d) 100.', mark: 'good' },
      ] },
    },
    {
      id: '4.5', src: 'S3-C7', type: 'choice', layout: 'grid2',
      prompt: '900 500 ÷ 100 = ?',
      hint: 'Chỉ bớt các chữ số 0 ở cuối số, hai số 0 ở giữa thì sao?',
      visual: { kind: 'place', digits: '900500', groupThousands: true },
      choices: [
        W('9 050', 'HÀNG', 'Chỉ bớt hai chữ số 0 ở CUỐI. Hai chữ số 0 ở giữa vẫn còn nguyên.'),
        R('9 005'),
        W('90 050', 'HÀNG', 'Đó là ÷ 10 (chỉ bớt một số 0). Phép chia này là ÷ 100.'),
        W('9 500', 'HÀNG', 'Có thể con đã bớt nhầm một chữ số 0 ở giữa. Phải bớt hai chữ số 0 ở cuối.'),
      ],
      explain: { steps: [
        { text: '÷ 100 nghĩa là mỗi chữ số xuống hai hàng. 900 500 có hai chữ số 0 ở cuối.', visual: { kind: 'place', digits: '900500', groupThousands: true, highlight: [1, 0] } },
        { text: 'Bớt hai chữ số 0 ở cuối thì còn 9 005. Hai chữ số 0 ở giữa vẫn giữ.', visual: zv(900500, '÷', 100) },
        { text: 'Vậy đáp án là 9 005.', mark: 'good' },
      ] },
    },
    {
      id: '4.6', src: 'S1-C6', type: 'choice', layout: 'grid2',
      prompt: '□ ÷ 10 = 6 010. Số □ là số nào?',
      hint: 'Muốn tìm số bị chia, mình làm phép ngược.',
      choices: [
        W('601', 'NGƯỢC', 'Số 601 là 6 010 ÷ 10. Phải làm phép ngược: 6 010 × 10.'),
        W('601 000', 'HÀNG', 'Đó là 6 010 × 100. Ở đây chỉ ÷ 10 nên nhân với 10 thôi.'),
        R('60 100'),
        W('6 020', 'QUY', 'Không phải cộng 10. Ngược của ÷ 10 là × 10.'),
      ],
      explain: { steps: [
        { text: '□ ÷ 10 = 6 010, nên □ = 6 010 × 10.', visual: { kind: 'sequence', items: ['?', 6010], arrowLabels: ['÷ 10'], highlight: [0] } },
        { text: '× 10 thì thêm một chữ số 0: 6 010 → 60 100.', visual: zv(6010, '×', 10) },
        { text: 'Vậy đáp án là 60 100.', mark: 'good' },
      ] },
    },
  ],

  variant: {
    id: '4.7', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
    prompt: 'Cô Lan có 4 800 cái kẹo, chia đều vào 100 hộp. Mỗi hộp có bao nhiêu cái kẹo?',
    hint: 'Chia đều thì làm phép chia. Chia cho 100 bớt mấy chữ số 0?',
    choices: [
      W('480', 'HÀNG', 'Đó là 4 800 ÷ 10. Chia cho 100 phải bớt hai số 0.'),
      R('48'),
      W('480 000', 'NGƯỢC', 'Chia thì số phải nhỏ lại, không thêm số 0.'),
      W('4 900', 'QUY', 'Đây là bài chia đều, không phải cộng.'),
    ],
    explain: { steps: [
      { text: 'Chia đều 4 800 cái kẹo vào 100 hộp: làm phép chia 4 800 ÷ 100.', visual: { kind: 'sequence', items: [4800, '?'], arrowLabels: ['÷ 100'] } },
      { text: '÷ 100 là bớt hai chữ số 0 ở cuối: 4 800 → 48.', visual: zv(4800, '÷', 100) },
      { text: 'Vậy mỗi hộp có 48 cái kẹo.', mark: 'good' },
    ] },
  },

  generators: [
    {
      // Chọn phép tính SAI / ĐÚNG
      id: 'g4.1', covers: ['4.1'],
      make(rng) {
        const all = [{ op: '×', m: 10 }, { op: '×', m: 100 }, { op: '÷', m: 10 }, { op: '÷', m: 100 }, { op: '×', m: 1000 }, { op: '÷', m: 1000 }];
        const defs = shuffle(rng, all).slice(0, 4);
        const wantWrong = rng.next() < 0.5;
        const wi = int(rng, 0, 3);
        const eqs = defs.map((d, i) => {
          const x = lastNonZero(rng, 12, d.m === 1000 ? 99 : 999);
          const a = d.op === '×' ? x : x * d.m;
          const truth = d.op === '×' ? x * d.m : x;
          const isWrong = wantWrong ? i === wi : i !== wi;
          let shown = truth;
          if (isWrong) shown = d.op === '×' ? pick(rng, [truth * 10, truth / 10]) : pick(rng, [truth * 10, truth * d.m === truth * 10 ? truth * 100 : truth * d.m]);
          return { a, op: d.op, m: d.m, shown, truth };
        });
        const txt = (e) => `${f(e.a)} ${e.op} ${mTxt(e.m)} = ${f(e.shown)}`;
        const E = eqs[wi];
        const kk = (e) => zeros(kOf(e.m));
        const choices = shuffle(rng, eqs.map((e, i) => {
          const isWrongEq = e.shown !== e.truth;
          if (wantWrong) return i === wi ? R(txt(e)) : W(txt(e), 'ĐỌC', `Phép này đúng (${e.op === '×' ? 'thêm' : 'bớt'} ${kk(e)}). Đề hỏi phép SAI.`);
          return i === wi ? R(txt(e)) : W(txt(e), 'HÀNG', `${f(e.a)} ${e.op} ${mTxt(e.m)} phải bằng ${f(e.truth)}, không phải ${f(e.shown)}. ${e.op === '×' ? 'Nhân' : 'Chia'} ${mTxt(e.m)} thì ${e.op === '×' ? 'thêm' : 'bớt'} ${kk(e)}.`);
        }));
        const nmA = pick(rng, NAMES);
        const wrongEq = eqs.find((e) => e.shown !== e.truth);
        return {
          id: 'g4.1', src: '[biến thể mới]', type: 'choice', layout: 'list',
          prompt: wantWrong ? pick(rng, ['Phép tính nào có kết quả SAI?', `${nmA} làm bốn phép tính. Phép tính nào có kết quả SAI?`]) : pick(rng, ['Phép tính nào có kết quả ĐÚNG?', `${nmA} làm bốn phép tính. Phép tính nào có kết quả ĐÚNG?`]),
          hint: '× thêm số 0, ÷ bớt số 0. Đếm xem mỗi phép thêm hoặc bớt mấy số 0.',
          choices, meta: { wantWrong, eqs: eqs.map(({ a, op, m, shown }) => ({ a, op, m, shown })) },
          explain: { steps: [
            { text: 'Kiểm từng phép: × 10 thêm một số 0, × 100 thêm hai số 0, × 1 000 thêm ba số 0. Phép chia thì bớt đúng ngần ấy số 0.' },
            wantWrong
              ? { text: `${f(E.a)} ${E.op} ${mTxt(E.m)} phải bằng ${f(E.truth)}, không phải ${f(E.shown)}.`, mark: 'bad', visual: zv(E.a, E.op, E.m) }
              : { text: `${f(E.a)} ${E.op} ${mTxt(E.m)} = ${f(E.truth)} là đúng. Còn ${f(wrongEq.a)} ${wrongEq.op} ${mTxt(wrongEq.m)} phải bằng ${f(wrongEq.truth)}, không phải ${f(wrongEq.shown)}.`, mark: 'good', visual: zv(E.a, E.op, E.m) },
            { text: `Vậy ${wantWrong ? 'phép SAI' : 'phép ĐÚNG'} là ${txt(E)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) {
        const { wantWrong, eqs } = item.meta;
        const bad = (e) => (e.op === '×' ? e.a * e.m : e.a / e.m) !== e.shown;
        const e = eqs.find((q) => bad(q) === wantWrong);
        return `${f(e.a)} ${e.op} ${mTxt(e.m)} = ${f(e.shown)}`;
      },
    },
    {
      // Tìm số chưa biết trong phép nhân / chia với 10, 100, 1 000
      id: 'g4.2', covers: ['4.2', '4.6'],
      make(rng) {
        const form = pick(rng, ['mul', 'div', 'mulX', 'divX']);
        const m = form === 'mul' || form === 'div' ? pick(rng, [10, 100, 100, 1000]) : pick(rng, [10, 100, 1000]);
        const k = kOf(m);
        const chkMul = (w, N) => `Thử lại: ${f(w)} × ${mTxt(m)} = ${f(w * m)}, chưa bằng ${f(N)}.`;
        let prompt, right, pool, steps, meta;
        if (form === 'mul') {
          const ans = anyNum(rng, 12, 999, 0.45), N = ans * m;
          prompt = `… × ${mTxt(m)} = ${f(N)}. Số cần điền vào chỗ trống là số nào?`;
          right = ans;
          pool = [cand(ans * 10, 'HÀNG', chkMul(ans * 10, N)), cand(ans * 100, 'HÀNG', chkMul(ans * 100, N)),
            cand(N * m, 'NGƯỢC', `Có thể con đã NHÂN ${f(N)} với ${mTxt(m)}. Tìm thừa số chưa biết thì phải CHIA: ${f(N)} ÷ ${mTxt(m)}.`),
            cand(N - m, 'QUY', `Con đã lấy ${f(N)} TRỪ ${mTxt(m)}. Tìm thừa số chưa biết thì phải CHIA: ${f(N)} ÷ ${mTxt(m)}.`),
            cand(Math.floor(ans / 10), 'HÀNG', chkMul(Math.floor(ans / 10), N))];
          if (ans % 10 === 0) pool.push(cand(ans / 10, 'HÀNG', chkMul(ans / 10, N)));
          if (ans % 100 === 0) pool.push(cand(ans / 100, 'HÀNG', chkMul(ans / 100, N)));
          pool = pool.filter((p) => p.v > 0);
          steps = [
            { text: `Muốn tìm thừa số chưa biết, lấy tích chia cho thừa số đã biết: ${f(N)} ÷ ${mTxt(m)}.`, visual: { kind: 'sequence', items: ['?', N], arrowLabels: [`× ${mTxt(m)}`], highlight: [0] } },
            { text: `÷ ${mTxt(m)} là bớt ${zeros(k)} ở cuối: ${f(N)} → ${f(ans)}.`, visual: zv(N, '÷', m, { done: true }) },
            { text: `Kiểm tra lại: ${f(ans)} × ${mTxt(m)} = ${f(N)}. Vậy đáp án là ${f(ans)}.`, mark: 'good' },
          ];
          meta = { form, N, m };
        } else if (form === 'div') {
          const n = anyNum(rng, 12, m === 1000 ? 99 : 999, 0.3), ans = n * m;
          const chk = (w) => (w % m === 0 ? `Thử lại: ${f(w)} ÷ ${mTxt(m)} = ${f(w / m)}, chưa bằng ${f(n)}.` : `Thử lại: ${f(w)} chia ${mTxt(m)} không ra ${f(n)}.`);
          prompt = `… ÷ ${mTxt(m)} = ${f(n)}. Số cần điền vào chỗ trống là số nào?`;
          right = ans;
          pool = [cand(n, 'NGƯỢC', `Phải làm phép ngược: ${f(n)} × ${mTxt(m)}, không phải chia.`), cand(n + m, 'QUY', `Con đã cộng ${f(n)} với ${mTxt(m)}. Số bị chia chưa biết thì phải làm phép ngược: nhân ${f(n)} với ${mTxt(m)}.`),
            cand(ans * 10, 'HÀNG', chk(ans * 10)), cand(ans * 100, 'HÀNG', chk(ans * 100)), cand(n * 10, 'HÀNG', chk(n * 10)), cand(n * 100, 'HÀNG', chk(n * 100)), cand(n * 1000, 'HÀNG', chk(n * 1000))];
          steps = [
            { text: `Số bị chia chưa biết, con làm phép ngược: lấy thương nhân với số chia, ${f(n)} × ${mTxt(m)}.`, visual: { kind: 'sequence', items: ['?', n], arrowLabels: [`÷ ${mTxt(m)}`], highlight: [0] } },
            { text: `× ${mTxt(m)} là thêm ${zeros(k)} vào cuối: ${f(n)} → ${f(ans)}.`, visual: zv(n, '×', m, { done: true }) },
            { text: `Kiểm tra lại: ${f(ans)} ÷ ${mTxt(m)} = ${f(n)}. Vậy đáp án là ${f(ans)}.`, mark: 'good' },
          ];
          meta = { form, n, m };
        } else if (form === 'mulX') {
          const a = lastNonZero(rng, 12, 999), res = a * m;
          prompt = `${f(a)} × … = ${f(res)}. Số cần điền vào chỗ trống là số nào?`;
          right = m;
          pool = [1, 10, 100, 1000, 10000].map((w) => cand(w, 'HÀNG', `Thử lại: ${f(a)} × ${f(w)} = ${f(a * w)}, không phải ${f(res)}.`));
          steps = [
            { text: `So sánh ${f(a)} với ${f(res)}: ${f(res)} nhiều hơn ${zeros(k)} ở cuối.`, visual: { kind: 'sequence', items: [a, res], arrowLabels: ['?'] } },
            { text: `Thêm ${zeros(k)} nghĩa là nhân với ${mTxt(m)}. Kiểm tra: ${f(a)} × ${mTxt(m)} = ${f(res)}.`, visual: zv(a, '×', m) },
            { text: `Vậy đáp án là ${f(m)}.`, mark: 'good' },
          ];
          meta = { form, a, res };
        } else {
          const n = lastNonZero(rng, 12, 999), N = n * m;
          prompt = `${f(N)} ÷ … = ${f(n)}. Số cần điền vào chỗ trống là số nào?`;
          right = m;
          pool = [1, 10, 100, 1000, 10000].map((w) => cand(w, 'HÀNG', `Thử lại: ${f(n)} × ${f(w)} = ${f(n * w)}, chưa bằng ${f(N)}.`));
          steps = [
            { text: `So sánh ${f(N)} với ${f(n)}: đã bớt ${zeros(k)} ở cuối.`, visual: { kind: 'sequence', items: [N, n], arrowLabels: ['?'] } },
            { text: `Bớt ${zeros(k)} nghĩa là chia cho ${mTxt(m)}. Kiểm tra: ${f(N)} ÷ ${mTxt(m)} = ${f(n)}.`, visual: zv(N, '÷', m) },
            { text: `Vậy đáp án là ${f(m)}.`, mark: 'good' },
          ];
          meta = { form, N, n };
        }
        const choices = shuffle(rng, [R(f(right)), ...rankPick(rng, right, pool)]);
        const nmA = pick(rng, NAMES);
        return { id: 'g4.2', src: '[biến thể mới]', type: 'choice', layout: 'grid2', prompt: rng.next() < 0.3 ? `${nmA} làm phép tính bị nhoè một số. ${prompt}` : prompt, hint: 'Dùng phép ngược, và đếm số chữ số 0 được thêm hoặc bớt.', choices, meta, explain: { steps } };
      },
      solve(item) {
        const t = item.meta;
        if (t.form === 'mul') return f(t.N / t.m);
        if (t.form === 'div') return f(t.n * t.m);
        if (t.form === 'mulX') return f(t.res / t.a);
        return f(t.N / t.n);
      },
    },
    {
      // Nhân / chia số có chữ số 0 ở giữa
      id: 'g4.3', covers: ['4.5'],
      make(rng) {
        const m = pick(rng, [10, 100, 100, 1000]);
        const pat = m === 1000 ? 'a0b' : pick(rng, ['a0b', 'a0bc', 'ab0c', 'a00b']);
        const [a, b, c] = [int(rng, 1, 9), int(rng, 1, 9), int(rng, 1, 9)];
        const dgs = { a0b: [a, 0, b], a0bc: [a, 0, b, c], ab0c: [a, b, 0, c], a00b: [a, 0, 0, b] }[pat];
        const x = Number(dgs.join(''));
        const zi = dgs.lastIndexOf(0);
        const sw = dgs.slice(); [sw[zi], sw[zi + 1]] = [sw[zi + 1], sw[zi]];
        const swapped = Number(sw.join(''));
        const noZero = Number(dgs.filter((d) => d !== 0).join(''));
        const k = kOf(m), N = x * m;
        const div = rng.next() < 0.5;
        const hv = dgs.length - 1 - zi; // hàng của chữ số 0 (từ phải)
        let prompt, right, pool, steps;
        if (div) {
          prompt = `${f(N)} ÷ ${mTxt(m)} = ?`;
          right = x;
          pool = [
            cand(swapped, 'HÀNG', 'Chỉ bớt các số 0 ở CUỐI. Số 0 ở giữa vẫn giữ nguyên chỗ của nó.'),
            cand(x * 10, 'HÀNG', k === 1 ? 'Số này chưa bớt chữ số 0 nào. Phải bớt một chữ số 0 ở cuối.' : `${fewer(k, 'bớt')} ÷ ${mTxt(m)} phải bớt ${zeros(k)}.`),
            cand(noZero, 'HÀNG', 'Con đã bớt nhầm chữ số 0 ở giữa. Chỉ bớt chữ số 0 ở cuối.'),
            cand(Math.floor(x / 10), 'HÀNG', 'Con đã bớt cả chữ số cuối của kết quả. Chỉ bớt đúng các chữ số 0 ở cuối số bị chia.'),
            cand(N, 'NGƯỢC', 'Số này chưa bớt chữ số 0 nào. Chia thì số phải nhỏ lại.'),
          ];
          steps = [
            { text: `÷ ${mTxt(m)} là bớt ${zeros(k)} ở cuối số.`, visual: { kind: 'place', digits: String(N), groupThousands: true, highlight: Array.from({ length: k }, (_, i) => i) } },
            { text: `Bớt xong còn ${f(x)}. Số 0 ở giữa vẫn còn nguyên.`, visual: zv(N, '÷', m, { done: true }) },
            { text: `Vậy đáp án là ${f(x)}.`, mark: 'good' },
          ];
        } else {
          prompt = `${f(x)} × ${mTxt(m)} = ?`;
          right = N;
          pool = [
            cand(noZero * m, 'HÀNG', 'Con đã bỏ mất chữ số 0 ở giữa. Chữ số 0 ở giữa vẫn phải giữ lại.'),
            cand(N / 10, 'HÀNG', k === 1 ? 'Số này chưa thêm chữ số 0 nào. Nhân 10 phải thêm một chữ số 0.' : `${fewer(k, 'thêm')} Nhân ${mTxt(m)} phải thêm ${zeros(k)}.`),
            cand(N * 10, 'HÀNG', `Thừa một chữ số 0. × ${mTxt(m)} chỉ thêm ${zeros(k)}.`),
            cand(x, 'NGƯỢC', 'Số này chưa thêm chữ số 0 nào. Nhân thì số phải lớn lên.'),
            cand(swapped * m, 'HÀNG', 'Chữ số 0 ở giữa phải giữ nguyên chỗ, không dời đi.'),
          ];
          steps = [
            { text: `× ${mTxt(m)} là thêm ${zeros(k)} vào cuối số.`, visual: { kind: 'place', digits: String(x), highlight: hv } },
            { text: `Giữ nguyên ${f(x)}, thêm ${zeros(k)} ở cuối: ${f(N)}. Số 0 ở giữa vẫn còn.`, visual: zv(x, '×', m, { done: true }) },
            { text: `Vậy đáp án là ${f(N)}.`, mark: 'good' },
          ];
        }
        const choices = shuffle(rng, [R(f(right)), ...rankPick(rng, right, pool.filter((p) => p.v > 0))]);
        return { id: 'g4.3', src: '[biến thể mới]', type: 'choice', layout: 'grid2', prompt, hint: 'Chỉ thêm hoặc bớt chữ số 0 ở CUỐI số. Số 0 ở giữa giữ nguyên.', choices, meta: { x, m, div }, explain: { steps } };
      },
      solve(item) { const { x, m, div } = item.meta; return f(div ? x : x * m); },
    },
    {
      // Nối phép tính với kết quả
      id: 'g4.4', covers: ['4.3'],
      make(rng) {
        const x = lastNonZero(rng, 2, 99);
        const T = (t) => x * t;
        const tmpl = {
          10: [{ a: x, op: '×', b: 10 }, { a: 10, op: '×', b: x }, { a: x * 100, op: '÷', b: 10 }, { a: x * 1000, op: '÷', b: 100 }],
          100: [{ a: x, op: '×', b: 100 }, { a: 100, op: '×', b: x }, { a: x * 1000, op: '÷', b: 10 }, { a: x * 10000, op: '÷', b: 100 }],
          1000: [{ a: x, op: '×', b: 1000 }, { a: 1000, op: '×', b: x }, { a: x * 10000, op: '÷', b: 10 }, { a: x * 100000, op: '÷', b: 100 }],
        };
        const targets = shuffle(rng, [10, 100, 1000]);
        targets.push(pick(rng, [10, 100, 1000]));
        const used = { 10: [], 100: [], 1000: [] };
        const exprs = targets.map((t, i) => {
          const opts = shuffle(rng, tmpl[t].filter((e) => !used[t].includes(e)));
          const e = opts[0]; used[t].push(e);
          return { id: 'p' + (i + 1), ...e };
        });
        const txt = (e) => `${f(e.a)} ${e.op} ${f(e.b)}`;
        const val = (e) => (e.op === '×' ? e.a * e.b : e.a / e.b);
        const left = exprs.map((e) => ({ id: e.id, text: txt(e) }));
        const right = [10, 100, 1000].map((t) => ({ id: 'r' + T(t), text: f(T(t)) }));
        const pairs = {}; exprs.forEach((e) => { pairs[e.id] = 'r' + val(e); });
        const nmA = pick(rng, NAMES);
        return {
          id: 'g4.4', src: '[biến thể mới]', type: 'match',
          prompt: pick(rng, [
            `${nmA} chọn số ${x} để làm bốn phép tính. Nối mỗi phép tính với kết quả của nó. Hai phép có thể nối chung một kết quả.`,
            `Nối mỗi phép tính với kết quả của nó (các phép tính này làm từ số ${x}). Hai phép có thể nối chung một kết quả.`]),
          hint: 'Đếm số chữ số 0 được thêm vào hoặc bớt đi.',
          left, right, pairs, meta: { x, exprs: exprs.map(({ id, a, op, b }) => ({ id, a, op, b })) },
          explain: { steps: [
            { text: `${f(x)} × 10: thêm một số 0, được ${f(T(10))}. ${f(x)} × 100: thêm hai số 0, được ${f(T(100))}.`, visual: zv(x, '×', 100) },
            { text: `${f(x)} × 1 000 thêm ba số 0, được ${f(T(1000))}. Phép chia thì bớt số 0, không thêm.`, visual: zv(x, '×', 1000) },
            { text: `Vậy ${exprs.map((e) => `${txt(e)} nối ${f(val(e))}`).join(', ')}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const o = {}; item.meta.exprs.forEach((e) => { o[e.id] = 'r' + (e.op === '×' ? e.a * e.b : e.a / e.b); }); return o; },
    },
    {
      // Điền số vào bốn ô trống (a, b, c, d)
      id: 'g4.5', covers: ['4.4'],
      make(rng) {
        const types = shuffle(rng, ['A', 'B', 'C', 'D']);
        const forms = types.map((t) => {
          if (t === 'A') { const m = pick(rng, [10, 100]), n = anyNum(rng, 12, 99, 0.2); return { t, m, n }; }
          if (t === 'B') { const m = pick(rng, [10, 100, 1000]), ans = int(rng, 2, 99); return { t, m, ans }; }
          if (t === 'C') { const m = pick(rng, [10, 100, 1000]), a = lastNonZero(rng, 12, 999); return { t, m, a }; }
          const m = pick(rng, [10, 100, 1000]), n = lastNonZero(rng, 2, 99); return { t, m, n };
        });
        const ansOf = (q) => (q.t === 'A' ? q.n * q.m : q.t === 'B' ? q.ans : q.t === 'C' ? q.m : q.m);
        const line = (q) => (q.t === 'A' ? `□ ÷ ${f(q.m)} = ${f(q.n)}` : q.t === 'B' ? `□ × ${f(q.m)} = ${f(q.ans * q.m)}` : q.t === 'C' ? `${f(q.a)} × □ = ${f(q.a * q.m)}` : `${f(q.n * q.m)} ÷ □ = ${f(q.n)}`);
        const labs = ['a)', 'b)', 'c)', 'd)'];
        const slots = forms.map((q, i) => ({ label: labs[i], answer: String(ansOf(q)) }));
        const wrongHints = [];
        forms.forEach((q, i) => {
          const L = labs[i].replace(')', '');
          const mk = (v, code, why) => { if (v <= 0 || String(v) === slots[i].answer) return; const arr = slots.map((s) => s.answer); arr[i] = String(v); if (!wrongHints.some((w) => w.match === arr.join('|'))) wrongHints.push({ match: arr.join('|'), code, why: `Ở câu ${L}, ${why}` }); };
          if (q.t === 'A') { mk(q.n, 'NGƯỢC', `phải NHÂN ${f(q.n)} với ${f(q.m)} chứ không phải chia: ${f(q.n)} × ${f(q.m)} = ${f(q.n * q.m)}.`); mk(q.n * q.m * 10, 'HÀNG', `thử lại ${f(q.n * q.m * 10)} ÷ ${f(q.m)} = ${f(q.n * q.m * 10 / q.m)}, chưa bằng ${f(q.n)}.`); }
          if (q.t === 'B') { mk(q.ans * q.m * q.m, 'NGƯỢC', `${f(q.ans * q.m)} ÷ ${f(q.m)} = ${f(q.ans)}. Tìm thừa số thì phải CHIA, không nhân.`); mk(q.ans * 10, 'HÀNG', `thử lại ${f(q.ans * 10)} × ${f(q.m)} = ${f(q.ans * 10 * q.m)}, chưa bằng ${f(q.ans * q.m)}. Phải bớt đủ ${zeros(kOf(q.m))}.`); }
          if (q.t === 'C') { mk(q.m * 10, 'HÀNG', `thử lại ${f(q.a)} × ${f(q.m * 10)} = ${f(q.a * q.m * 10)}, chưa bằng ${f(q.a * q.m)}. Chỉ thêm ${zeros(kOf(q.m))}.`); mk(q.m / 10, 'HÀNG', `thử lại ${f(q.a)} × ${f(q.m / 10)} = ${f(q.a * q.m / 10)}, chưa bằng ${f(q.a * q.m)}.`); }
          if (q.t === 'D') { mk(q.m * 10, 'HÀNG', `thử lại ${f(q.n * q.m)} ÷ ${f(q.m * 10)} không ra ${f(q.n)}. Chỉ bớt ${zeros(kOf(q.m))}.`); mk(q.m / 10, 'HÀNG', `thử lại ${f(q.n * q.m)} ÷ ${f(q.m / 10)} = ${f(q.n * 10)}, chưa bằng ${f(q.n)}.`); }
        });
        const expl = (q, i) => {
          const L = labs[i];
          if (q.t === 'A') return { text: `${L} □ ÷ ${f(q.m)} = ${f(q.n)}, ngược lại □ = ${f(q.n)} × ${f(q.m)} = ${f(q.n * q.m)}.`, visual: zv(q.n, '×', q.m) };
          if (q.t === 'B') return { text: `${L} □ × ${f(q.m)} = ${f(q.ans * q.m)}, nên □ = ${f(q.ans * q.m)} ÷ ${f(q.m)} = ${f(q.ans)}.`, visual: zv(q.ans * q.m, '÷', q.m) };
          if (q.t === 'C') return { text: `${L} ${f(q.a)} → ${f(q.a * q.m)} thêm ${zeros(kOf(q.m))}, nên nhân với ${f(q.m)}.`, visual: zv(q.a, '×', q.m) };
          return { text: `${L} ${f(q.n * q.m)} → ${f(q.n)} bớt ${zeros(kOf(q.m))}, nên chia cho ${f(q.m)}.`, visual: zv(q.n * q.m, '÷', q.m) };
        };
        const nmA = pick(rng, NAMES);
        return {
          id: 'g4.5', src: '[biến thể mới]', type: 'numpad',
          prompt: `${rng.next() < 0.4 ? `${nmA} làm bài tập nhưng bị nhoè mất bốn số. ` : ''}Tìm số cần điền vào ô trống □:\n${forms.map((q, i) => `${labs[i]} ${line(q)}`).join('\n')}`,
          hint: 'Dùng phép ngược, và đếm số chữ số 0 bị thêm hoặc bớt.',
          slots, wrongHints, meta: { forms },
          explain: { steps: [...forms.map(expl), { text: `Vậy ${slots.map((s) => `${s.label} ${f(s.answer)}`).join(', ')}.`, mark: 'good' }] },
        };
      },
      solve(item) { return item.meta.forms.map((q) => String(q.t === 'A' ? q.n * q.m : q.t === 'B' ? q.ans : q.m)).join('|'); },
    },
    {
      // Bài toán có lời văn: chia đều / nhân với 10, 100
      id: 'g4.6', covers: ['4.7'],
      make(rng) {
        const kind = pick(rng, ['divN', 'mul', 'divBoxes']);
        const [item, cont] = pick(rng, [['cái kẹo', 'hộp'], ['quả cam', 'giỏ'], ['quyển vở', 'thùng'], ['chiếc bánh', 'khay'], ['quả trứng', 'vỉ'], ['viên bi', 'túi'], ['bông hoa', 'bó'], ['chiếc bút', 'hộp'], ['con tem', 'phong bì'], ['viên gạch', 'xe']]);
        const who = pick(rng, ['Cô Lan', 'Bác Hoa', 'Thầy Nam', 'Mẹ', 'Bà', 'Chú Hùng', 'Cô Mai', 'Bác Bình']);
        const m = pick(rng, [10, 100]);
        const n = m === 10 ? anyNum(rng, 12, 999, 0.3) : anyNum(rng, 12, 99, 0.3);
        const N = n * m, k = kOf(m);
        let prompt, right, pool, steps;
        if (kind === 'mul') {
          right = n * m;
          prompt = `Mỗi ${cont} có ${f(n)} ${item}. ${who} đóng ${f(m)} ${cont} như vậy. Hỏi tất cả có bao nhiêu ${item}?`;
          pool = [cand(n + m, 'QUY', `Đây là bài có mỗi ${cont} bằng nhau, phải làm phép nhân, không phải cộng.`), cand(n, 'ĐỌC', `Đây mới chỉ là số ${item} ở MỘT ${cont}. Đề hỏi tất cả ${f(m)} ${cont}.`),
            cand(right * 10, 'HÀNG', `Nhân ${f(m)} chỉ thêm ${zeros(k)}. Số này thừa một chữ số 0.`), cand(right / 10, 'HÀNG', `Nhân ${f(m)} phải thêm ${zeros(k)}. ${fewer(k, 'thêm')}`),
            cand(right * 100, 'HÀNG', `Nhân ${f(m)} chỉ thêm ${zeros(k)}. Số này thừa hai chữ số 0.`), cand(m, 'ĐỌC', `Đây là số ${cont}, đề hỏi số ${item}.`)];
          steps = [
            { text: `Mỗi ${cont} có ${f(n)} ${item}, có ${f(m)} ${cont} như vậy: làm phép nhân ${f(n)} × ${f(m)}.`, visual: { kind: 'sequence', items: [n, '?'], arrowLabels: [`× ${f(m)}`] } },
            { text: `× ${f(m)} là thêm ${zeros(k)} vào cuối: ${f(n)} → ${f(right)}.`, visual: zv(n, '×', m, { done: true }) },
            { text: `Vậy tất cả có ${f(right)} ${item}.`, mark: 'good' },
          ];
        } else {
          right = n;
          const boxes = kind === 'divBoxes';
          prompt = boxes ? `${who} có ${f(N)} ${item}, xếp vào các ${cont}, mỗi ${cont} ${f(m)} ${item}. Hỏi cần bao nhiêu ${cont}?`
            : `${who} có ${f(N)} ${item}, chia đều vào ${f(m)} ${cont}. Mỗi ${cont} có bao nhiêu ${item}?`;
          const what = boxes ? cont : item;
          pool = [cand(n * 10, 'HÀNG', `Chia ${f(m)} phải bớt ${zeros(k)}. ${fewer(k, 'bớt')}`), cand(N * m, 'NGƯỢC', 'Chia thì số phải nhỏ lại, không thêm số 0.'),
            cand(N + m, 'QUY', boxes ? 'Đây là bài chia, không phải cộng.' : 'Đây là bài chia đều, không phải cộng.'), cand(Math.floor(n / 10), 'HÀNG', `Chia ${f(m)} chỉ bớt ${zeros(k)}. Số này đã bớt thừa một chữ số.`), cand(m, 'ĐỌC', boxes ? `Đây là số ${item} ở mỗi ${cont}, đề hỏi số ${cont}.` : `Đây là số ${cont}, đề hỏi số ${item} ở mỗi ${cont}.`)];
          if (n % 10 === 0) pool.push(cand(n / 10, 'HÀNG', `Chia ${f(m)} chỉ bớt ${zeros(k)}. Số này đã bớt thừa một chữ số 0.`));
          steps = [
            { text: `${boxes ? `Xếp mỗi ${cont} ${f(m)} ${item}` : `Chia đều ${f(N)} ${item} vào ${f(m)} ${cont}`}: làm phép chia ${f(N)} ÷ ${f(m)}.`, visual: { kind: 'sequence', items: [N, '?'], arrowLabels: [`÷ ${f(m)}`] } },
            { text: `÷ ${f(m)} là bớt ${zeros(k)} ở cuối: ${f(N)} → ${f(n)}.`, visual: zv(N, '÷', m, { done: true }) },
            { text: `Vậy ${boxes ? 'cần' : 'mỗi ' + cont + ' có'} ${f(n)} ${what}.`, mark: 'good' },
          ];
        }
        pool = pool.filter((p) => p.v > 0);
        const choices = shuffle(rng, [R(f(right)), ...rankPick(rng, right, pool)]);
        return {
          id: 'g4.6', src: '[biến thể mới]', type: 'choice', layout: 'grid2', prompt,
          hint: kind === 'mul' ? 'Mỗi nhóm bằng nhau, nhiều nhóm thì làm phép nhân. Nhân với 10, 100 thêm mấy chữ số 0?' : 'Chia đều thì làm phép chia. Chia cho 10, 100 bớt mấy chữ số 0?',
          choices, meta: { kind, N, n, m }, explain: { steps },
        };
      },
      solve(item) { const { kind, N, n, m } = item.meta; return f(kind === 'mul' ? n * m : N / m); },
    },
  ],
};
