import { pick, int, shuffle } from '../core/rng.js';

const R = (text) => ({ text, correct: true });
const W = (text, code, why) => ({ text, code, why });
const divisorsOf = (n) => { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };
const NAMES = ['Nam', 'Mai', 'Lan', 'Hà', 'Bình', 'An'];

const venn = (aItems, bItems, both, outside) => ({
  kind: 'venn',
  a: { label: 'Bội của 7', items: aItems },
  b: { label: 'Bội của 8', items: bItems },
  both,
  outside,
});

export default {
  id: 'cd10', no: 10, day: 4, title: 'Bội và ước', short: 'Bội – Ước', icon: '🕷️',
  intro: 'Từ 5 × 7 = 35: 35 là bội của 5 và của 7, còn 5 và 7 là ước của 35. Bội của một số là số chia hết cho số đó. Ước của 35 là số mà 35 chia hết cho nó.',

  remember: [
    {
      text: 'Từ 5 × 7 = 35: 35 là bội của 5 và của 7; còn 5 và 7 là ước của 35.',
      visual: { kind: 'array', rows: 5, cols: 7, showEq: true, anim: 'fill' },
    },
    {
      text: 'Ước của một số là số mà số đó chia hết cho nó. Số nào cũng có ước là 1 và chính nó. Tìm ước theo các cặp nhân: 12 = 1 × 12 = 2 × 6 = 3 × 4.',
      visual: { kind: 'factorpairs', n: 12, reveal: true, anim: 'reveal' },
    },
    {
      text: 'Bội của một số là số chia hết cho số đó. Đếm thêm 4 mỗi lần: 4, 8, 12, 16… đó là các bội của 4.',
      visual: { kind: 'grid100', n: 40, mark: [{ multipleOf: 4 }], anim: 'mark' },
    },
  ],

  lesson: [
    {
      text: 'Xem phép nhân 5 × 7 = 35. Xếp 35 ô thành 5 hàng, mỗi hàng 7 ô.',
      visual: { kind: 'array', rows: 5, cols: 7, showEq: true, anim: 'fill' },
    },
    {
      text: 'Ước của 35 là số mà 35 chia hết cho nó. Vì 5 × 7 = 35 nên 5 và 7 là ước của 35.',
      visual: { kind: 'array', rows: 5, cols: 7, groupBy: 'rows', showEq: true },
    },
    {
      text: 'Bội của 5 là số chia hết cho 5. 35 ÷ 5 = 7 và 35 ÷ 7 = 5, đều không dư. Vậy 35 là bội của 5 và của 7.',
      visual: { kind: 'array', rows: 5, cols: 7, groupBy: 'cols', showEq: true },
    },
    {
      text: 'Tìm ước của 12: thử xếp 12 ô thành hình chữ nhật đầy. Có 12 = 1 × 12, 2 × 6, 3 × 4. Số hàng và số cột đều là ước.',
      visual: { kind: 'factorpairs', n: 12, reveal: true, anim: 'reveal' },
    },
    {
      text: 'Các ước của 12 là 1, 2, 3, 4, 6 và 12. Mỗi số này chia 12 đều không dư.', mark: 'good',
      visual: { kind: 'table', headers: ['Chia 12 cho', 'Kết quả'], rows: [['1', '12'], ['2', '6'], ['3', '4'], ['4', '3'], ['6', '2'], ['12', '1']] },
    },
    {
      text: 'Tìm bội của 4: đếm thêm 4 mỗi lần được 4, 8, 12, 16, 20… Các số này chia cho 4 không dư. Bội của 4 luôn là bội của 2, nhưng bội của 2 chưa chắc là bội của 4.',
      visual: { kind: 'grid100', n: 40, mark: [{ multipleOf: 4 }], anim: 'mark' },
    },
  ],

  items: [
    {
      id: '10.1', src: 'SL slide 3', type: 'choice', layout: 'list',
      prompt: 'Có phép nhân 5 × 7 = 35. Chọn câu ĐÚNG.',
      visual: { kind: 'array', rows: 5, cols: 7, showEq: true },
      hint: 'Số nào là tích, số nào là thừa số?',
      choices: [
        R('35 là bội của 5 và 7; 5 và 7 là ước của 35'),
        W('35 là ước của 5 và 7; 5 và 7 là bội của 35', 'NGƯỢC', 'Câu này nói ngược lại. Tích 35 là bội, còn các thừa số 5 và 7 là ước.'),
        W('5 là bội của 7 và 7 là ước của 5', 'QUY', '5 không chia hết cho 7, nên hai số này không là bội hay ước của nhau. Bội và ước ở đây là giữa tích 35 và hai thừa số.'),
      ],
      explain: { steps: [
        { text: 'Xếp 35 ô thành 5 hàng, mỗi hàng 7 ô: 5 × 7 = 35.', visual: { kind: 'array', rows: 5, cols: 7, showEq: true, anim: 'fill' } },
        { text: 'Ước của 35 là số mà 35 chia hết cho nó. 5 × 7 = 35 nên 5 và 7 là ước của 35.', visual: { kind: 'array', rows: 5, cols: 7, groupBy: 'rows', showEq: true } },
        { text: 'Bội của 5 là số chia hết cho 5. 35 ÷ 5 = 7 và 35 ÷ 7 = 5, đều không dư nên 35 là bội của 5 và của 7.', visual: { kind: 'array', rows: 5, cols: 7, groupBy: 'cols', showEq: true } },
        { text: 'Vậy: 35 là bội; 5 và 7 là ước.', mark: 'good' },
      ] },
      tags: ['bội', 'ước'],
    },
    {
      id: '10.2', src: 'T5 tr.1 C3', type: 'classify',
      prompt: 'Chạm số rồi chạm ô: số nào là ước của 36?',
      chips: [1, 2, 3, 4, 5, 6, 8, 9, 12, 18, 24, 36].map((n) => ({ id: 'n' + n, text: String(n) })),
      buckets: [{ id: 'u', text: 'Là ước của 36' }, { id: 'k', text: 'KHÔNG là ước của 36' }],
      answer: { n1: 'u', n2: 'u', n3: 'u', n4: 'u', n5: 'k', n6: 'u', n8: 'k', n9: 'u', n12: 'u', n18: 'u', n24: 'k', n36: 'u' },
      hint: 'Ước của 36 là số chia 36 không dư.',
      explain: { steps: [
        { text: 'Tìm theo cặp nhân: 36 = 1 × 36 = 2 × 18 = 3 × 12 = 4 × 9 = 6 × 6.', visual: { kind: 'factorpairs', n: 36, reveal: true, anim: 'reveal' } },
        { text: 'Mỗi số trong các cặp là một ước của 36: 1, 2, 3, 4, 6, 9, 12, 18, 36.', mark: 'good' },
        { text: '5, 8 và 24 không nằm trong cặp nào. Thử chia: 36 ÷ 5 = 7 dư 1. 36 ÷ 8 = 4 dư 4. 36 ÷ 24 = 1 dư 12. Các phép chia này còn dư nên chúng KHÔNG là ước.', mark: 'bad' },
        { text: 'Vậy có 9 ước. Nhớ: số nào cũng có ước là 1 và chính nó (1 và 36).', mark: 'good' },
      ] },
      tags: ['ước'],
    },
    {
      id: '10.3', src: 'T5 tr.2 C8', type: 'classify',
      prompt: 'Chạm số rồi chạm ô đúng. Có bốn ô: chỉ là bội của 7; chỉ là bội của 8; là bội của cả 7 và 8; không là bội của số nào.',
      chips: [13, 42, 35, 64, 14, 24, 56].map((n) => ({ id: 'n' + n, text: String(n) })),
      buckets: [
        { id: 'b7', text: 'Chỉ bội của 7' },
        { id: 'b8', text: 'Chỉ bội của 8' },
        { id: 'both', text: 'Bội của cả 7 và 8' },
        { id: 'none', text: 'Không là bội của 7 và 8' },
      ],
      answer: { n13: 'none', n42: 'b7', n35: 'b7', n64: 'b8', n14: 'b7', n24: 'b8', n56: 'both' },
      hint: 'Đếm thêm 7 mỗi lần, rồi đếm thêm 8 mỗi lần, xem số nào có mặt.',
      explain: { steps: [
        { text: 'Bội của 7: 7, 14, 21, 28, 35, 42, 49, 56. Trong các số đã cho có 14, 35, 42 và 56.', visual: venn([14, 35, 42], [], [], []) },
        { text: 'Bội của 8: 8, 16, 24, 32, 40, 48, 56, 64. Trong các số đã cho có 24, 56 và 64.', visual: venn([14, 35, 42], [24, 64], [], []) },
        { text: '56 có trong cả hai dãy (56 = 7 × 8), nên đặt ở phần chung của hai vòng.', mark: 'good', visual: venn([14, 35, 42], [24, 64], [56], []) },
        { text: 'Vậy chỉ bội 7: 14, 35, 42; chỉ bội 8: 24, 64; cả hai: 56. Số 13 không có trong dãy nào, đặt ngoài hai vòng.', mark: 'good', visual: venn([14, 35, 42], [24, 64], [56], [13]) },
      ] },
      tags: ['bội', 'Venn'],
    },
    {
      id: '10.4', src: 'P34 B3', type: 'multi',
      prompt: 'Có 36 chiếc ghế, xếp thành các hàng đều nhau. Chọn tất cả các cách xếp đúng 36 ghế (KHÔNG thừa, KHÔNG thiếu).',
      choices: [
        R('4 hàng, mỗi hàng 9 ghế'),
        W('5 hàng, mỗi hàng 7 ghế', 'QUY', '5 × 7 = 35, thiếu 1 ghế. Số hàng và số ghế mỗi hàng đều phải là ước của 36.'),
        R('6 hàng, mỗi hàng 6 ghế'),
        W('7 hàng, mỗi hàng 4 ghế', 'QUY', '7 × 4 = 28, mới được 28 ghế. 7 không là ước của 36.'),
      ],
      hint: 'Nhân số hàng với số ghế mỗi hàng, xem có đủ 36 không.',
      explain: { steps: [
        { text: 'Cách xếp đúng là phép nhân có tích bằng 36. Số hàng và số ghế mỗi hàng đều là ước của 36.', visual: { kind: 'array', rows: 4, cols: 9, showEq: true, anim: 'fill' } },
        { text: '4 × 9 = 36 và 6 × 6 = 36. Hai cách này ĐÚNG.', mark: 'good', visual: { kind: 'array', rows: 6, cols: 6, showEq: true, anim: 'fill' } },
        { text: '5 × 7 = 35 và 7 × 4 = 28, đều khác 36 nên SAI.', mark: 'bad' },
        { text: 'Vậy chọn 4 hàng × 9 ghế và 6 hàng × 6 ghế.', mark: 'good' },
      ] },
      tags: ['ước'],
    },
    {
      id: '10.5', src: 'PÔ tr.2', type: 'match',
      prompt: 'Nối mỗi số với cách gọi đúng khi so với số 12.',
      left: [
        { id: 'n3', text: '3' },
        { id: 'n12', text: '12' },
        { id: 'n36', text: '36' },
        { id: 'n48', text: '48' },
      ],
      right: [
        { id: 'u', text: 'Ước của 12' },
        { id: 'b', text: 'Bội của 12' },
        { id: 'c', text: 'Vừa là ước, vừa là bội của 12' },
      ],
      pairs: { n3: 'u', n12: 'c', n36: 'b', n48: 'b' },
      hint: 'Ước của 12 thì 12 chia hết cho nó. Bội của 12 thì chia hết cho 12.',
      explain: { steps: [
        { text: '3 × 4 = 12, nên 3 là ước của 12 (12 ÷ 3 = 4, không dư).', visual: { kind: 'array', rows: 3, cols: 4, showEq: true } },
        { text: '36 ÷ 12 = 3 và 48 ÷ 12 = 4, đều không dư. Vậy 36 và 48 là bội của 12.', visual: { kind: 'table', headers: ['Số', 'Chia cho 12', 'Kết luận'], rows: [['36', '36 ÷ 12 = 3', 'bội'], ['48', '48 ÷ 12 = 4', 'bội']] } },
        { text: '12 ÷ 12 = 1 và 12 = 12 × 1. Số khác 0 nào cũng vừa là ước vừa là bội của chính nó.', mark: 'good' },
        { text: 'Vậy: 3 là ước; 36 và 48 là bội; 12 vừa là ước vừa là bội.', mark: 'good' },
      ] },
      tags: ['bội', 'ước'],
    },
    {
      id: '10.6', src: 'T5 tr.1 C1', type: 'numpad',
      prompt: 'Tìm số có hai chữ số, có tổng hai chữ số là 9 và là bội của 8.',
      hint: 'Số đó phải đúng với CẢ HAI yêu cầu, không chỉ một yêu cầu.',
      slots: [{ label: 'Số cần tìm:', answer: '72' }],
      wrongHints: [
        { match: '63', code: '1VD', why: 'Tổng chữ số 6 + 3 = 9 là đúng, nhưng 63 ÷ 8 = 7 dư 7, chưa là bội của 8. Số cần tìm phải đúng với cả hai yêu cầu.' },
        { match: '54', code: '1VD', why: 'Tổng chữ số 5 + 4 = 9 là đúng, nhưng 54 ÷ 8 = 6 dư 6, chưa là bội của 8.' },
        { match: '36', code: '1VD', why: 'Tổng chữ số 3 + 6 = 9 là đúng, nhưng 36 ÷ 8 = 4 dư 4, chưa là bội của 8.' },
      ],
      explain: { steps: [
        { text: 'Các số có hai chữ số và tổng chữ số là 9: 18, 27, 36, 45, 54, 63, 72, 81, 90.', visual: { kind: 'sequence', items: [18, 27, 36, 45, 54, 63, 72, 81, 90] } },
        { text: 'Thử chia từng số cho 8: 18, 27, 36, 45, 54, 63 đều chia 8 còn dư.', mark: 'bad' },
        { text: '72 ÷ 8 = 9, không dư. Và 7 + 2 = 9. Số 72 đúng với cả hai yêu cầu.', mark: 'good', visual: { kind: 'sequence', items: [18, 27, 36, 45, 54, 63, 72, 81, 90], highlight: [6] } },
        { text: 'Vậy số cần tìm là 72.', mark: 'good' },
      ] },
      tags: ['bội'],
    },
  ],

  variant: {
    id: '10.7', src: '[biến thể mới]', type: 'tf',
    hint: 'Thử một vài bội của 2: 2, 4, 6, 8… Số nào chia cho 4 còn dư?',
    prompt: 'Nam nói: "Số nào là bội của 2 thì cũng là bội của 4." Nam nói đúng hay SAI?',
    answer: false,
    reasons: [
      { text: 'Sai. Ví dụ 6 là bội của 2 nhưng 6 chia 4 còn dư 2', correct: true },
      { text: 'Sai. Ví dụ 8 là bội của 2 và của 4', correct: false, code: '1VD', why: '8 là bội của cả 2 và 4 nên ví dụ này không làm câu của Nam sai. Muốn cho thấy câu SAI, phải tìm ví dụ làm câu sai.' },
      { text: 'Sai, vì 4 lớn hơn 2', correct: false, code: 'QUY', why: 'Lớn hơn hay nhỏ hơn chưa quyết định bội. Cần tìm một số cụ thể là bội của 2 mà không là bội của 4.' },
    ],
    whyWrong: 'Chiều ngược lại mới đúng: bội của 4 luôn là bội của 2 (vì 4 = 2 × 2). Nhưng bội của 2 chưa chắc là bội của 4, ví dụ 6.',
    explain: { steps: [
      { text: 'Bội của 4 là 4, 8, 12, 16… Các số này đều chia hết cho 2, nên bội của 4 luôn là bội của 2.', visual: { kind: 'venn', a: { label: 'Bội của 2', items: [2, 6, 10] }, b: { label: 'Bội của 4', items: [] }, both: [4, 8, 12] } },
      { text: 'Nhưng chiều ngược lại thì chưa chắc: 6 ÷ 2 = 3 không dư, còn 6 ÷ 4 = 1 dư 2.', mark: 'bad' },
      { text: 'Chỉ cần một ví dụ làm câu SAI là đủ. Ví dụ 8 không làm câu sai, vì 8 là bội của cả hai.' },
      { text: 'Vậy Nam nói SAI: 6 là bội của 2 nhưng không là bội của 4.', mark: 'good' },
    ] },
  },

  generators: [
    // g10.1: Số nào là ước của N?
    {
      id: 'g10.1',
      make(rng) {
        const N = pick(rng, [18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 50, 56, 60, 72]);
        const divs = divisorsOf(N).filter((d) => d > 1 && d < N);
        const d = pick(rng, divs);
        const nonDivs = [];
        for (let x = 3; x < N; x++) if (N % x !== 0) nonDivs.push(x);
        const x1 = pick(rng, nonDivs);
        let x2 = pick(rng, nonDivs);
        let guard = 0;
        while (x2 === x1 && guard++ < 50) x2 = pick(rng, nonDivs);
        if (x2 === x1) x2 = nonDivs.find((v) => v !== x1);
        const m = N * 2;
        const wrongFor = (x) => W(String(x), 'QUY', `${N} ÷ ${x} = ${Math.floor(N / x)} dư ${N % x}. Còn dư nên ${x} KHÔNG là ước của ${N}.`);
        const values = shuffle(rng, [d, m, x1, x2]);
        const choices = values.map((v) => (v === d ? R(String(d)) : v === m ? W(String(m), 'NGƯỢC', `${m} = ${N} × 2 nên ${m} là BỘI của ${N}, không phải ước. Ước của ${N} thì không lớn hơn ${N}.`) : wrongFor(v)));
        return {
          id: 'g10.1', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: `Số nào là ước của ${N}?`,
          hint: `Ước của ${N} là số chia ${N} không dư.`,
          choices, meta: { N, values },
          explain: { steps: [
            { text: `Ước của ${N} là số mà ${N} chia hết cho nó. Hay: ${N} chia cho nó không dư.`, visual: { kind: 'factorpairs', n: N, reveal: true, anim: 'reveal' } },
            { text: `${d} × ${N / d} = ${N}, nên ${d} là ước của ${N}.`, mark: 'good', visual: { kind: 'array', rows: d, cols: N / d, showEq: true } },
            { text: `${m} là bội của ${N} (${N} × 2). ${x1} và ${x2} chia ${N} còn dư, nên chúng không là ước.`, mark: 'bad' },
            { text: `Vậy đáp án là ${d}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { N, values } = item.meta; return String(values.filter((v) => v < N && N % v === 0)[0]); },
    },

    // g10.2: Số nào là bội của n?
    {
      id: 'g10.2',
      make(rng) {
        const n = pick(rng, [4, 6, 8, 9]);
        const kmax = Math.floor(99 / n);
        const k = int(rng, 3, kmax);
        const right = n * k;
        const dv = pick(rng, divisorsOf(n).filter((d) => d > 1 && d < n));
        const r1 = int(rng, 1, n - 1), r2 = int(rng, 1, n - 1);
        const k1 = int(rng, 3, kmax), k2 = int(rng, 3, kmax);
        const v1 = n * k1 + r1;
        let v2 = n * k2 + r2;
        if (v2 === v1) v2 = v1 + n;
        const values = shuffle(rng, [right, dv, v1, v2]);
        const wrongFor = (v) => (v === dv
          ? W(String(v), 'NGƯỢC', `${n} ÷ ${v} = ${n / v}, nên ${v} là ƯỚC của ${n}, nhỏ hơn ${n}. Bội của ${n} là ${n}, ${2 * n}, ${3 * n}…`)
          : W(String(v), 'QUY', `${v} ÷ ${n} = ${Math.floor(v / n)} dư ${v % n}. Còn dư nên ${v} KHÔNG là bội của ${n}.`));
        const choices = values.map((v) => (v === right ? R(String(v)) : wrongFor(v)));
        return {
          id: 'g10.2', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: `Số nào là bội của ${n}?`,
          hint: `Bội của ${n} là số chia cho ${n} không dư.`,
          choices, meta: { n, values },
          explain: { steps: [
            { text: `Bội của ${n} là số chia hết cho ${n}. Đếm thêm ${n} mỗi lần: ${n}, ${2 * n}, ${3 * n}, ${4 * n}…`, visual: { kind: 'grid100', n: Math.min(100, Math.max(40, Math.ceil(right / 10) * 10)), mark: [{ multipleOf: n }], anim: 'mark' } },
            { text: `${right} ÷ ${n} = ${k}, không dư. Vậy ${right} là bội của ${n}.`, mark: 'good' },
            { text: `${dv} là ước của ${n} chứ không phải bội. Hai số còn lại chia ${n} còn dư.`, mark: 'bad' },
            { text: `Vậy đáp án là ${right}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { n, values } = item.meta; return String(values.filter((v) => v % n === 0)[0]); },
    },

    // g10.3: Có bao nhiêu ước?
    {
      id: 'g10.3',
      make(rng) {
        const N = pick(rng, [12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30, 32, 35, 36, 40, 42, 45, 48, 49, 50, 54, 56, 60, 63, 64, 72, 80, 84, 90, 96, 100]);
        const ds = divisorsOf(N);
        const cnt = ds.length;
        const hints = [];
        const add = (v, code, why) => { if (v > 0 && v !== cnt && !hints.some((h) => h.match === String(v))) hints.push({ match: String(v), code, why }); };
        add(cnt - 1, 'QUY', `Còn thiếu một ước. Nhớ số nào cũng có ước 1 và chính nó (1 và ${N}).`);
        add(cnt - 2, 'QUY', `Còn thiếu hai ước. Hãy ghi đủ cả hai ước 1 và ${N}, rồi các cặp nhân còn lại.`);
        add(Math.ceil(cnt / 2), 'QUY', 'Mỗi cặp nhân cho hai ước, trừ cặp có hai số bằng nhau. Con đừng đếm mỗi cặp chỉ một lần.');
        return {
          id: 'g10.3', src: '[biến thể mới]', type: 'numpad',
          prompt: `Số ${N} có tất cả bao nhiêu ước?`,
          hint: `Tìm các cặp nhân bằng ${N}, rồi đếm mọi số trong các cặp.`,
          slots: [{ label: 'Số ước:', answer: String(cnt) }],
          wrongHints: hints, meta: { N },
          explain: { steps: [
            { text: `Tìm các cặp nhân bằng ${N}.`, visual: { kind: 'factorpairs', n: N, reveal: true, anim: 'reveal' } },
            { text: `Mỗi số trong các cặp là một ước: ${ds.join(', ')}.`, mark: 'good' },
            { text: `Đếm được ${cnt} số. Nhớ có cả ước 1 và chính ${N}.`, mark: 'good' },
            { text: `Vậy ${N} có ${cnt} ước.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { N } = item.meta; let c = 0; for (let i = 1; i <= N; i++) if (N % i === 0) c++; return String(c); },
    },

    // g10.4: "Số nào là bội của p thì cũng là bội của q" đúng hay sai?
    {
      id: 'g10.4',
      make(rng) {
        const truePairs = [[4, 2], [6, 3], [6, 2], [8, 4], [9, 3], [10, 5], [12, 6], [12, 4], [8, 2], [15, 5]];
        const falsePairs = [[2, 4], [3, 6], [2, 6], [3, 9], [4, 8], [5, 10], [4, 12], [6, 4], [10, 4], [6, 9]];
        const isTrue = rng.next() < 0.5;
        const [p, q] = pick(rng, isTrue ? truePairs : falsePairs);
        const name = pick(rng, NAMES);
        const common = p * q;
        const reasons = shuffle(rng, isTrue
          ? [
            { text: `Đúng, vì ${p} = ${q} × ${p / q}, nên mỗi bội của ${p} là ${q} nhân với một số`, correct: true },
            { text: `Đúng, vì ${p} là bội của ${p} và cũng là bội của ${q}`, correct: false, code: '1VD', why: 'Một ví dụ chưa đủ để nói "luôn đúng". Cần giải thích vì sao với mọi bội.' },
            { text: `Đúng, vì ${p} lớn hơn ${q}`, correct: false, code: 'QUY', why: `Lớn hơn chưa đủ. Cần ${p} chia hết cho ${q}, tức ${p} = ${q} × ${p / q}.` },
          ]
          : [
            { text: `Sai. Ví dụ ${p} là bội của ${p} nhưng ${p} KHÔNG chia hết cho ${q}`, correct: true },
            { text: `Sai. Ví dụ ${common} là bội của cả ${p} và ${q}`, correct: false, code: '1VD', why: `${common} là bội của cả hai nên ví dụ này không làm câu của ${name} sai. Muốn cho thấy câu SAI, phải tìm ví dụ làm câu sai.` },
            { text: `Sai, vì ${p} ${p > q ? 'lớn' : 'nhỏ'} hơn ${q}`, correct: false, code: 'QUY', why: 'Lớn hơn hay nhỏ hơn chưa quyết định bội. Cần tìm một số cụ thể là bội của số đầu mà không là bội của số sau.' },
          ]);
        return {
          id: 'g10.4', src: '[biến thể mới]', type: 'tf',
          prompt: `${name} nói: "Số nào là bội của ${p} thì cũng là bội của ${q}." ${name} nói đúng hay SAI?`,
          answer: isTrue, reasons,
          whyWrong: isTrue
            ? `${p} = ${q} × ${p / q} nên bội của ${p} (${p}, ${2 * p}, ${3 * p}…) đều là ${q} nhân với một số, tức là bội của ${q}.`
            : `${p} là bội của ${p} nhưng ${p} không chia hết cho ${q}. Nên câu này SAI.`,
          hint: `Thử vài bội của ${p}: ${p}, ${2 * p}, ${3 * p}…`,
          meta: { p, q },
          explain: { steps: [
            { text: `Bội của ${p}: ${p}, ${2 * p}, ${3 * p}, ${4 * p}…`, visual: { kind: 'grid100', n: 60, mark: [{ multipleOf: p }, { multipleOf: q, color: '#FF8A3D' }] } },
            isTrue
              ? { text: `${p} ÷ ${q} = ${p / q}, không dư. Nên ${p} = ${q} × ${p / q}, và mọi bội của ${p} cũng là bội của ${q}.`, mark: 'good' }
              : { text: `${p} không chia hết cho ${q}. Nên ${p} là bội của ${p} mà KHÔNG là bội của ${q}.`, mark: 'bad' },
            { text: isTrue ? `Vậy ${name} nói ĐÚNG.` : `Vậy ${name} nói SAI: một ví dụ làm câu SAI là ${p}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { p, q } = item.meta; return String(p % q === 0); },
    },
  ],
};
