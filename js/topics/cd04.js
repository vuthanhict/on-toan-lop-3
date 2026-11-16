import { pick, int, shuffle } from '../core/rng.js';

const f = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const R = (text) => ({ text, correct: true });
const W = (text, code, why) => ({ text, code, why });
const lastNonZero = (rng, lo, hi) => { let x; do { x = int(rng, lo, hi); } while (x % 10 === 0); return x; };
const zeros = (k) => (k === 1 ? 'một chữ số 0' : 'hai chữ số 0');

export default {
  id: 'cd04', no: 4, day: 2, title: 'Nhân, chia với 10 và 100', short: '×÷ 10, 100', icon: '🐻',
  intro: 'Nhân 10 thì mỗi chữ số lên một hàng, chia 10 thì xuống một hàng. Đếm đúng số chữ số 0!',

  remember: [
    { text: 'Nhân với 10 thì thêm một chữ số 0 ở cuối, nhân với 100 thì thêm hai chữ số 0. Chia cho 10 thì bớt một chữ số 0 ở cuối, chia cho 100 thì bớt hai chữ số 0. Số bị chia phải có sẵn các chữ số 0 ở cuối.',
      visual: { kind: 'sequence', items: [47, 470, 4700], arrowLabels: ['× 10', '× 10'], anim: 'reveal' } },
    { text: 'Số 0 ở giữa vẫn phải giữ nguyên. 900 500 ÷ 100 chỉ bớt hai số 0 ở cuối, nên được 9 005.',
      visual: { kind: 'sequence', items: [900500, 9005], arrowLabels: ['÷ 100'], anim: 'reveal' } },
    { text: 'Ô trống thì dùng phép ngược. □ ÷ 10 = 74 thì □ = 74 × 10 = 740.',
      visual: { kind: 'sequence', items: ['?', 74, 740], arrowLabels: ['÷ 10', '× 10'], highlight: [0], anim: 'reveal' } },
  ],

  lesson: [
    { text: 'Có 4 khối nhỏ (đơn vị). Đây là số 4.',
      visual: { kind: 'blocks3d', ones: 4, caption: true, anim: 'build' } },
    { text: 'Nhân với 10: cứ 10 khối nhỏ ghép thành 1 thanh chục. 4 × 10 = 40, tức là 4 thanh chục. Mỗi chữ số lên một hàng.',
      visual: { kind: 'blocks3d', tens: 4, caption: true, anim: 'build' } },
    { text: 'Nhân với 100: mỗi 10 thanh chục ghép thành 1 tấm trăm. 4 × 100 = 400, tức là 4 tấm trăm.',
      visual: { kind: 'blocks3d', hundreds: 4, caption: true, anim: 'build' } },
    { text: '47 × 10 = 470. Chữ số 4 lên hàng trăm, chữ số 7 lên hàng chục, hàng đơn vị thêm chữ số 0.',
      visual: { kind: 'place', digits: '470', highlight: [2, 1, 0], showValue: true, anim: 'fill' } },
    { text: 'Chia thì ngược lại: mỗi chữ số xuống một hàng. 900 500 ÷ 100 = 9 005, chỉ bớt hai số 0 ở cuối, hai số 0 ở giữa vẫn còn.',
      visual: { kind: 'sequence', items: [900500, 9005], arrowLabels: ['÷ 100'], anim: 'reveal' } },
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
        { text: '8 870 ÷ 10 phải bớt một chữ số 0 ở cuối: được 887, không phải 88 700. Kết quả 88 700 là đã THÊM số 0.', mark: 'bad', visual: { kind: 'sequence', items: [8870, 887], arrowLabels: ['÷ 10'], anim: 'reveal' } },
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
        { text: '÷ 100 là bớt hai chữ số 0 ở cuối: 4 700 → 47.', visual: { kind: 'sequence', items: [4700, 47], arrowLabels: ['÷ 100'], anim: 'reveal' } },
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
        { text: '18 × 100: thêm hai số 0, được 1 800. 18 × 10: thêm một số 0, được 180.', visual: { kind: 'sequence', items: [18, 180, 1800], arrowLabels: ['× 10', '× 10'], anim: 'reveal' } },
        { text: '1 800 ÷ 10: bớt một số 0, được 180. Chia thì bớt số 0, không thêm.', visual: { kind: 'sequence', items: [1800, 180], arrowLabels: ['÷ 10'] } },
        { text: '1 000 × 18 = 18 000 (thêm ba số 0 vào 18).' },
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
        { text: 'a) □ ÷ 10 = 74, ngược lại □ = 74 × 10 = 740.', visual: { kind: 'sequence', items: ['?', 74, 740], arrowLabels: ['÷ 10', '× 10'], highlight: [0] } },
        { text: 'b) □ × 100 = 6 000, nên □ = 6 000 ÷ 100 = 60.', visual: { kind: 'sequence', items: [60, 6000], arrowLabels: ['× 100'] } },
        { text: 'c) 403 → 4 030 chỉ thêm một số 0, nên nhân với 10. d) 5 500 → 55 bớt hai số 0, nên chia cho 100.', visual: { kind: 'sequence', items: [403, 4030], arrowLabels: ['× 10'] } },
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
        { text: 'Bớt hai chữ số 0 ở cuối thì còn 9 005. Hai chữ số 0 ở giữa vẫn giữ.', visual: { kind: 'sequence', items: [900500, 9005], arrowLabels: ['÷ 100'], anim: 'reveal' } },
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
        { text: '× 10 thì thêm một chữ số 0: 6 010 → 60 100.', visual: { kind: 'sequence', items: [6010, 60100], arrowLabels: ['× 10'], anim: 'reveal' } },
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
      { text: '÷ 100 là bớt hai chữ số 0 ở cuối: 4 800 → 48.', visual: { kind: 'sequence', items: [4800, 48], arrowLabels: ['÷ 100'], anim: 'reveal' } },
      { text: 'Vậy mỗi hộp có 48 cái kẹo.', mark: 'good' },
    ] },
  },

  generators: [
    {
      id: 'g4.1',
      make(rng) {
        const defs = shuffle(rng, [{ op: '×', m: 10 }, { op: '×', m: 100 }, { op: '÷', m: 10 }, { op: '÷', m: 100 }]);
        const wi = int(rng, 0, 3);
        const eqs = defs.map((d, i) => {
          const x = lastNonZero(rng, 12, 999);
          const a = d.op === '×' ? x : x * d.m;
          const truth = d.op === '×' ? x * d.m : x;
          let shown = truth;
          if (i === wi) shown = d.op === '×' ? pick(rng, [truth * 10, truth / 10]) : truth * 10;
          return { a, op: d.op, m: d.m, shown, truth };
        });
        const txt = (e) => `${f(e.a)} ${e.op} ${e.m} = ${f(e.shown)}`;
        const E = eqs[wi];
        const choices = shuffle(rng, eqs.map((e, i) => (i === wi ? R(txt(e)) : W(txt(e), 'ĐỌC', `Phép này đúng (${e.op === '×' ? 'thêm' : 'bớt'} ${zeros(e.m === 10 ? 1 : 2)}). Đề hỏi phép SAI.`))));
        return {
          id: 'g4.1', src: '[biến thể mới]', type: 'choice', layout: 'list',
          prompt: 'Phép tính nào có kết quả SAI?',
          hint: `${'×'} thêm số 0, ${'÷'} bớt số 0. Đếm xem mỗi phép thêm hoặc bớt mấy số 0.`,
          choices, meta: { eqs: eqs.map(({ a, op, m, shown }) => ({ a, op, m, shown })) },
          explain: { steps: [
            { text: 'Kiểm từng phép: ×10 thêm một số 0, ×100 thêm hai số 0, ÷10 bớt một số 0, ÷100 bớt hai số 0.' },
            { text: `${f(E.a)} ${E.op} ${E.m} phải bằng ${f(E.truth)}, không phải ${f(E.shown)}.`, mark: 'bad', visual: { kind: 'sequence', items: [E.a, E.truth], arrowLabels: [`${E.op} ${E.m}`], anim: 'reveal' } },
            { text: `Vậy phép SAI là ${txt(E)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) {
        for (const e of item.meta.eqs) {
          const truth = e.op === '×' ? e.a * e.m : e.a / e.m;
          if (truth !== e.shown) return `${f(e.a)} ${e.op} ${e.m} = ${f(e.shown)}`;
        }
        return '?';
      },
    },
    {
      id: 'g4.2',
      make(rng) {
        const form = pick(rng, ['mul', 'div', 'mulX', 'divX']);
        const m = pick(rng, [10, 100]);
        const k = m === 10 ? 1 : 2;
        let prompt, right, wrongs, steps, meta;
        if (form === 'mul') {
          const ans = lastNonZero(rng, 12, 999), N = ans * m;
          const nm = N * m;
          const third = [ans * 100, ans * 1000, ans * 10000].find((v) => v !== ans * 10 && v !== nm);
          const chk = (w) => W(f(w), 'HÀNG', `Thử lại: ${f(w)} × ${m} = ${f(w * m)}, chưa bằng ${f(N)}.`);
          prompt = `… × ${m} = ${f(N)}. Số cần điền vào chỗ trống là số nào?`;
          right = ans;
          wrongs = [chk(ans * 10), W(f(nm), 'NGƯỢC', `Có thể con đã NHÂN ${f(N)} với ${m}. Tìm thừa số chưa biết thì phải CHIA: ${f(N)} ÷ ${m}.`), chk(third)];
          steps = [
            { text: `Muốn tìm thừa số chưa biết, lấy tích chia cho thừa số đã biết: ${f(N)} ÷ ${m}.`, visual: { kind: 'sequence', items: ['?', N], arrowLabels: [`× ${m}`], highlight: [0] } },
            { text: `÷ ${m} là bớt ${zeros(k)} ở cuối: ${f(N)} → ${f(ans)}.`, visual: { kind: 'sequence', items: [N, ans], arrowLabels: [`÷ ${m}`], anim: 'reveal' } },
            { text: `Kiểm tra lại: ${f(ans)} × ${m} = ${f(N)}. Vậy đáp án là ${f(ans)}.`, mark: 'good' },
          ];
          meta = { form, N, m };
        } else if (form === 'div') {
          const n = lastNonZero(rng, 12, 999), ans = n * m;
          const third = m === 100 ? n * 10 : n * 1000;
          const chk = (w) => W(f(w), 'HÀNG', w % m === 0 ? `Thử lại: ${f(w)} ÷ ${m} = ${f(w / m)}, chưa bằng ${f(n)}.` : `Thử lại: ${f(w)} chia ${m} còn dư, không bằng ${f(n)}.`);
          prompt = `… ÷ ${m} = ${f(n)}. Số cần điền vào chỗ trống là số nào?`;
          right = ans;
          wrongs = [W(f(n), 'NGƯỢC', `Phải làm phép ngược: ${f(n)} × ${m}, không phải chia.`), chk(ans * 10), chk(third)];
          steps = [
            { text: `Số bị chia chưa biết, mình làm phép ngược: lấy thương nhân với số chia, ${f(n)} × ${m}.`, visual: { kind: 'sequence', items: ['?', n], arrowLabels: [`÷ ${m}`], highlight: [0] } },
            { text: `× ${m} là thêm ${zeros(k)} vào cuối: ${f(n)} → ${f(ans)}.`, visual: { kind: 'sequence', items: [n, ans], arrowLabels: [`× ${m}`], anim: 'reveal' } },
            { text: `Kiểm tra lại: ${f(ans)} ÷ ${m} = ${f(n)}. Vậy đáp án là ${f(ans)}.`, mark: 'good' },
          ];
          meta = { form, n, m };
        } else if (form === 'mulX') {
          const a = lastNonZero(rng, 12, 999), res = a * m;
          prompt = `${f(a)} × … = ${f(res)}. Số cần điền vào chỗ trống là số nào?`;
          right = m;
          wrongs = [10, 100, 1000, 10000].filter((v) => v !== m).slice(0, 3).map((w) => W(f(w), 'HÀNG', `Thử lại: ${f(a)} × ${f(w)} = ${f(a * w)}, không phải ${f(res)}.`));
          steps = [
            { text: `So sánh ${f(a)} với ${f(res)}: ${f(res)} nhiều hơn ${zeros(k)} ở cuối.`, visual: { kind: 'sequence', items: [a, res], arrowLabels: ['?'] } },
            { text: `Thêm ${zeros(k)} nghĩa là nhân với ${m}. Kiểm tra: ${f(a)} × ${m} = ${f(res)}.`, visual: { kind: 'sequence', items: [a, res], arrowLabels: [`× ${m}`], anim: 'reveal' } },
            { text: `Vậy đáp án là ${m}.`, mark: 'good' },
          ];
          meta = { form, a, res };
        } else {
          const n = lastNonZero(rng, 12, 999), N = n * m;
          prompt = `${f(N)} ÷ … = ${f(n)}. Số cần điền vào chỗ trống là số nào?`;
          right = m;
          wrongs = [10, 100, 1000, 10000].filter((v) => v !== m).slice(0, 3).map((w) => W(f(w), 'HÀNG', `Thử lại: ${f(n)} × ${f(w)} = ${f(n * w)}, chưa bằng ${f(N)}.`));
          steps = [
            { text: `So sánh ${f(N)} với ${f(n)}: đã bớt ${zeros(k)} ở cuối.`, visual: { kind: 'sequence', items: [N, n], arrowLabels: ['?'] } },
            { text: `Bớt ${zeros(k)} nghĩa là chia cho ${m}. Kiểm tra: ${f(N)} ÷ ${m} = ${f(n)}.`, visual: { kind: 'sequence', items: [N, n], arrowLabels: [`÷ ${m}`], anim: 'reveal' } },
            { text: `Vậy đáp án là ${m}.`, mark: 'good' },
          ];
          meta = { form, N, n };
        }
        const choices = shuffle(rng, [R(f(right)), ...wrongs]);
        return { id: 'g4.2', src: '[biến thể mới]', type: 'choice', layout: 'grid2', prompt, hint: 'Dùng phép ngược, và đếm số chữ số 0 được thêm hoặc bớt.', choices, meta, explain: { steps } };
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
      id: 'g4.3',
      make(rng) {
        const z = int(rng, 1, 2);
        const [a, b, c] = [int(rng, 1, 9), int(rng, 1, 9), int(rng, 1, 9)];
        const dg = z === 1 ? [a, 0, b, c] : [a, b, 0, c];
        const x = Number(dg.join(''));
        const k = int(rng, 1, 2), m = 10 ** k;
        const swapped = Number((z === 1 ? [a, b, 0, c] : [a, b, c, 0]).join(''));
        const noZero = Number([a, b, c].join(''));
        const div = rng.next() < 0.5;
        let prompt, right, wrongs, steps;
        const zi = 3 - z;
        if (div) {
          const N = x * m;
          prompt = `${f(N)} ÷ ${m} = ?`;
          right = x;
          wrongs = [
            W(f(swapped), 'HÀNG', 'Chỉ bớt các số 0 ở CUỐI. Số 0 ở giữa vẫn giữ nguyên chỗ của nó.'),
            W(f(x * 10), 'HÀNG', k === 1 ? 'Số này chưa bớt chữ số 0 nào. Phải bớt một chữ số 0 ở cuối.' : 'Số này mới bớt một chữ số 0. ÷ 100 phải bớt hai chữ số 0.'),
            W(f(noZero), 'HÀNG', 'Con đã bớt nhầm chữ số 0 ở giữa. Chỉ bớt chữ số 0 ở cuối.'),
          ];
          steps = [
            { text: `÷ ${m} là bớt ${zeros(k)} ở cuối số.`, visual: { kind: 'place', digits: String(N), groupThousands: true, highlight: k === 1 ? [0] : [1, 0] } },
            { text: `Bớt xong còn ${f(x)}. Số 0 ở giữa vẫn còn nguyên.`, visual: { kind: 'sequence', items: [N, x], arrowLabels: [`÷ ${m}`], anim: 'reveal' } },
            { text: `Vậy đáp án là ${f(x)}.`, mark: 'good' },
          ];
        } else {
          const N = x * m;
          prompt = `${f(x)} × ${m} = ?`;
          right = N;
          wrongs = [
            W(f(noZero * m), 'HÀNG', 'Con đã bỏ mất chữ số 0 ở giữa. Chữ số 0 ở giữa vẫn phải giữ lại.'),
            W(f(N / 10), 'HÀNG', k === 1 ? 'Số này chưa thêm chữ số 0 nào. Nhân 10 phải thêm một chữ số 0.' : 'Số này mới thêm một chữ số 0. Nhân 100 phải thêm hai chữ số 0.'),
            W(f(N * 10), 'HÀNG', `Thừa một chữ số 0. × ${m} chỉ thêm ${zeros(k)}.`),
          ];
          steps = [
            { text: `× ${m} là thêm ${zeros(k)} vào cuối số.`, visual: { kind: 'place', digits: String(x), highlight: zi } },
            { text: `Giữ nguyên ${f(x)}, thêm ${zeros(k)} ở cuối: ${f(N)}. Số 0 ở giữa vẫn còn.`, visual: { kind: 'sequence', items: [x, N], arrowLabels: [`× ${m}`], anim: 'reveal' } },
            { text: `Vậy đáp án là ${f(N)}.`, mark: 'good' },
          ];
        }
        const choices = shuffle(rng, [R(f(right)), ...wrongs]);
        return { id: 'g4.3', src: '[biến thể mới]', type: 'choice', layout: 'grid2', prompt, hint: 'Chỉ thêm hoặc bớt chữ số 0 ở CUỐI số. Số 0 ở giữa giữ nguyên.', choices, meta: { x, m, div }, explain: { steps } };
      },
      solve(item) { const { x, m, div } = item.meta; return f(div ? x : x * m); },
    },
  ],
};
