import { pick, int, shuffle } from '../core/rng.js';

const R = (text) => ({ text, correct: true });
const W = (text, code, why) => ({ text, code, why });
const divisorsOf = (n) => { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };
const NAMES = ['Nam', 'Mai', 'Lan', 'Hà', 'Bình', 'An', 'Chi', 'Minh', 'Linh', 'Phúc', 'Khoa', 'Thảo', 'Huy', 'Ngọc', 'Tú', 'Vy'];
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// các cặp (điều kiện về chữ số, m) mà chỉ có đúng MỘT số có hai chữ số thoả cả "chữ số" lẫn "là bội của m"
const uniqueCombos = (prop, ts, ms) => {
  const out = [];
  ts.forEach((t) => ms.forEach((m) => {
    const hit = []; for (let n = 10; n <= 99; n++) if (prop(Math.floor(n / 10), n % 10) === t && n % m === 0) hit.push(n);
    if (hit.length === 1 && hit[0] % 10 !== 0) out.push([t, m, hit[0]]);
  }));
  return out;
};
const COMBO_SUM = uniqueCombos((a, b) => a + b, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], [3, 4, 5, 6, 7, 8, 9]);
const COMBO_DIFF = uniqueCombos((a, b) => a - b, [1, 2, 3, 4, 5, 6, 7, 8], [3, 4, 5, 6, 7, 8, 9]);

const vennPQ = (p, q, aItems, bItems, both, outside) => ({
  kind: 'venn',
  a: { label: `Bội của ${p}`, items: aItems },
  b: { label: `Bội của ${q}`, items: bItems },
  both,
  outside,
});

const venn = (aItems, bItems, both, outside) => ({
  kind: 'venn',
  a: { label: 'Bội của 7', items: aItems },
  b: { label: 'Bội của 8', items: bItems },
  both,
  outside,
});

const topic = {
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

  // Mỗi bộ sinh: `covers` = id bài cố định cùng kỹ năng/cùng type. Số liệu, tên bạn, ngữ cảnh đổi theo seed (1..16).
  generators: [
    // g10.1: Số nào là ước của N? / Số nào KHÔNG là ước của N?
    {
      id: 'g10.1', covers: ['10.1'],
      make(rng) {
        const N = pick(rng, [18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 64, 70, 72, 80, 84, 90, 96]);
        const divs = divisorsOf(N).filter((d) => d > 1 && d < N);
        const nonDivs = []; for (let x = 3; x < N; x++) if (N % x !== 0) nonDivs.push(x);
        const takeNon = (k) => shuffle(rng, nonDivs).slice(0, k);
        const askNot = rng.next() < 0.4;
        const mulN = N * pick(rng, [2, 3]);
        let d = 0, odd = 0, three = [], values;
        if (!askNot) {
          d = pick(rng, divs);
          const others = rng.next() < 0.6 ? [...takeNon(2), mulN] : takeNon(3);
          values = shuffle(rng, [d, ...others]);
        } else {
          three = shuffle(rng, divs).slice(0, 3);
          odd = rng.next() < 0.4 ? mulN : takeNon(1)[0];
          values = shuffle(rng, [...three, odd]);
        }
        const nonWhy = (v) => (v > N && v % N === 0
          ? `${v} = ${N} × ${v / N} nên ${v} là BỘI của ${N}, không phải ước. Ước của ${N} thì không lớn hơn ${N}.`
          : `${N} ÷ ${v} = ${Math.floor(N / v)} dư ${N % v}. Còn dư nên ${v} KHÔNG là ước của ${N}.`);
        const choices = values.map((v) => {
          if (!askNot) return v === d ? R(String(v)) : W(String(v), v > N ? 'NGƯỢC' : 'QUY', nonWhy(v));
          return v === odd ? R(String(v)) : W(String(v), 'ĐỌC', `${N} ÷ ${v} = ${N / v}, không dư nên ${v} LÀ ước của ${N}. Câu hỏi đang tìm số KHÔNG là ước.`);
        });
        const steps = !askNot
          ? [
            { text: `Ước của ${N} là số mà ${N} chia hết cho nó. Hay: ${N} chia cho nó không dư.`, visual: { kind: 'factorpairs', n: N, reveal: true, anim: 'reveal' } },
            { text: `${d} × ${N / d} = ${N}, nên ${d} là ước của ${N}.`, mark: 'good', visual: { kind: 'array', rows: d, cols: N / d, showEq: true } },
            { text: `Các số còn lại chia ${N} còn dư, hoặc lớn hơn ${N} (là bội chứ không phải ước), nên chúng không là ước.`, mark: 'bad' },
            { text: `Vậy đáp án là ${d}.`, mark: 'good' },
          ]
          : [
            { text: `Ước của ${N} là số mà ${N} chia hết cho nó. Mình thử chia ${N} cho từng số.`, visual: { kind: 'factorpairs', n: N, reveal: true, anim: 'reveal' } },
            { text: `${three.map((v) => `${N} ÷ ${v} = ${N / v}`).join('; ')}. Ba số này chia hết nên đều là ước.`, mark: 'good' },
            { text: odd > N ? `${odd} = ${N} × ${odd / N} là bội của ${N}, không là ước.` : `${N} ÷ ${odd} = ${Math.floor(N / odd)} dư ${N % odd}. Còn dư nên ${odd} không là ước.`, mark: 'bad' },
            { text: `Vậy đáp án là ${odd}.`, mark: 'good' },
          ];
        return {
          id: 'g10.1', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: askNot ? `Số nào KHÔNG là ước của ${N}?` : `Số nào là ước của ${N}?`,
          hint: `Ước của ${N} là số chia ${N} không dư.`,
          choices, meta: { N, values, askNot },
          explain: { steps },
        };
      },
      solve(item) { const { N, values, askNot } = item.meta; return String(values.find((v) => (N % v === 0) !== askNot)); },
    },

    // g10.2: Số nào là bội của n? / Số nào KHÔNG là bội của n?
    {
      id: 'g10.2', covers: ['10.1'],
      make(rng) {
        const n = pick(rng, [3, 4, 5, 6, 7, 8, 9]);
        const kmax = Math.floor(99 / n);
        const askNot = rng.next() < 0.4;
        const mults = (k) => shuffle(rng, Array.from({ length: kmax - 2 }, (_, i) => i + 3)).slice(0, k).map((x) => n * x);
        const nonMul = (k) => { const out = []; let g = 0; while (out.length < k && g++ < 80) { const v = n * int(rng, 3, kmax) + int(rng, 1, n - 1); if (!out.includes(v)) out.push(v); } return out; };
        const dv = pick(rng, divisorsOf(n).filter((x) => x < n));
        let right = 0, odd = 0, three = [], values;
        if (!askNot) {
          right = mults(1)[0];
          const extra = rng.next() < 0.5 ? [dv, ...nonMul(2)] : nonMul(3);
          values = shuffle(rng, [right, ...extra]);
        } else {
          three = mults(3);
          odd = rng.next() < 0.4 ? dv : nonMul(1)[0];
          values = shuffle(rng, [...three, odd]);
        }
        const gridN = (v) => Math.min(100, Math.max(40, Math.ceil(v / 10) * 10));
        const nonWhy = (v) => (v < n
          ? `${n} ÷ ${v} = ${n / v}, nên ${v} là ƯỚC của ${n}, nhỏ hơn ${n}. Bội của ${n} là ${n}, ${2 * n}, ${3 * n}…`
          : `${v} ÷ ${n} = ${Math.floor(v / n)} dư ${v % n}. Còn dư nên ${v} KHÔNG là bội của ${n}.`);
        const choices = values.map((v) => {
          if (!askNot) return v === right ? R(String(v)) : W(String(v), v < n ? 'NGƯỢC' : 'QUY', nonWhy(v));
          return v === odd ? R(String(v)) : W(String(v), 'ĐỌC', `${v} ÷ ${n} = ${v / n}, không dư nên ${v} LÀ bội của ${n}. Câu hỏi đang tìm số KHÔNG là bội.`);
        });
        const steps = !askNot
          ? [
            { text: `Bội của ${n} là số chia hết cho ${n}. Đếm thêm ${n} mỗi lần: ${n}, ${2 * n}, ${3 * n}, ${4 * n}…`, visual: { kind: 'grid100', n: gridN(right), mark: [{ multipleOf: n }], anim: 'mark' } },
            { text: `${right} ÷ ${n} = ${right / n}, không dư. Vậy ${right} là bội của ${n}.`, mark: 'good' },
            { text: `${values.filter((v) => v !== right).map((v) => (v < n ? `${v} là ước của ${n}` : `${v} ÷ ${n} dư ${v % n}`)).join('; ')}. Các số này không là bội.`, mark: 'bad' },
            { text: `Vậy đáp án là ${right}.`, mark: 'good' },
          ]
          : [
            { text: `Bội của ${n} là số chia hết cho ${n}. Mình thử chia từng số cho ${n}.`, visual: { kind: 'grid100', n: gridN(Math.max(...values)), mark: [{ multipleOf: n }], anim: 'mark' } },
            { text: `${three.map((v) => `${v} ÷ ${n} = ${v / n}`).join('; ')}. Ba số này chia hết nên đều là bội.`, mark: 'good' },
            { text: odd < n ? `${odd} là ước của ${n}, nhỏ hơn ${n} nên không là bội.` : `${odd} ÷ ${n} = ${Math.floor(odd / n)} dư ${odd % n}. Còn dư nên ${odd} không là bội.`, mark: 'bad' },
            { text: `Vậy đáp án là ${odd}.`, mark: 'good' },
          ];
        return {
          id: 'g10.2', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: askNot ? `Số nào KHÔNG là bội của ${n}?` : `Số nào là bội của ${n}?`,
          hint: `Bội của ${n} là số chia cho ${n} không dư.`,
          choices, meta: { n, values, askNot },
          explain: { steps },
        };
      },
      solve(item) { const { n, values, askNot } = item.meta; return String(values.find((v) => (v % n === 0) !== askNot)); },
    },

    // g10.3: Có bao nhiêu ước của N? / Có bao nhiêu bội của n từ 1 đến M?
    {
      id: 'g10.3', covers: ['10.6'],
      make(rng) {
        const mode = rng.next() < 0.5 ? 'uoc' : 'boi';
        const hints = [];
        const add = (v, code, why, ans) => { if (v > 0 && v !== ans && !hints.some((h) => h.match === String(v))) hints.push({ match: String(v), code, why }); };
        if (mode === 'uoc') {
          let N, g = 0;
          do { N = int(rng, 12, 99); g++; } while (divisorsOf(N).length < 4 && g < 100);
          const ds = divisorsOf(N), cnt = ds.length;
          add(cnt - 1, 'QUY', `Còn thiếu một ước. Nhớ số nào cũng có ước 1 và chính nó (1 và ${N}).`, cnt);
          add(cnt - 2, 'QUY', `Còn thiếu hai ước. Hãy ghi đủ cả hai ước 1 và ${N}, rồi các cặp nhân còn lại.`, cnt);
          add(Math.ceil(cnt / 2), 'QUY', 'Mỗi cặp nhân cho hai ước, trừ cặp có hai số bằng nhau. Con đừng đếm mỗi cặp chỉ một lần.', cnt);
          return {
            id: 'g10.3', src: '[biến thể mới]', type: 'numpad',
            prompt: `Số ${N} có tất cả bao nhiêu ước?`,
            hint: `Tìm các cặp nhân bằng ${N}, rồi đếm mọi số trong các cặp.`,
            slots: [{ label: 'Số ước:', answer: String(cnt) }],
            wrongHints: hints, meta: { mode, N },
            explain: { steps: [
              { text: `Tìm các cặp nhân bằng ${N}.`, visual: { kind: 'factorpairs', n: N, reveal: true, anim: 'reveal' } },
              { text: `Mỗi số trong các cặp là một ước: ${ds.join(', ')}.`, mark: 'good' },
              { text: `Đếm được ${cnt} số. Nhớ có cả ước 1 và chính ${N}.`, mark: 'good' },
              { text: `Vậy ${N} có ${cnt} ước.`, mark: 'good' },
            ] },
          };
        }
        const n = int(rng, 5, 9);
        let M, g2 = 0;
        do { M = int(rng, 30, 80); g2++; } while (M % n === 0 && g2 < 100);
        const cnt = Math.floor(M / n);
        const list = Array.from({ length: Math.min(cnt, 6) }, (_, i) => n * (i + 1)).join(', ') + (cnt > 6 ? `, …, ${n * cnt}` : '');
        add(cnt + 1, 'QUY', `${n} × ${cnt + 1} = ${n * (cnt + 1)} đã lớn hơn ${M}, nên không đếm. Bội lớn nhất không vượt ${M} là ${n * cnt}.`, cnt);
        add(cnt - 1, 'QUY', `Con đếm thiếu một bội. ${n} × ${cnt} = ${n * cnt} vẫn nhỏ hơn ${M}, nên cũng được tính.`, cnt);
        add(n * cnt, 'ĐV', `${n * cnt} là bội lớn nhất không vượt ${M}, không phải số lượng bội. Con hãy đếm xem có bao nhiêu bội.`, cnt);
        return {
          id: 'g10.3', src: '[biến thể mới]', type: 'numpad',
          prompt: `Có bao nhiêu số là bội của ${n} trong khoảng từ 1 đến ${M}?`,
          hint: `Đếm thêm ${n} mỗi lần: ${n}, ${2 * n}, ${3 * n}… cho tới khi vượt ${M}.`,
          slots: [{ label: 'Số bội:', answer: String(cnt) }],
          wrongHints: hints, meta: { mode, n, M },
          explain: { steps: [
            { text: `Bội của ${n} là ${list}. Đếm thêm ${n} mỗi lần.`, visual: { kind: 'grid100', n: Math.min(100, Math.ceil(M / 10) * 10), mark: [{ multipleOf: n }], anim: 'mark' } },
            { text: `${M} ÷ ${n} = ${cnt} dư ${M % n}. Bội lớn nhất không vượt ${M} là ${n} × ${cnt} = ${n * cnt}.`, mark: 'good' },
            { text: `${n} × ${cnt + 1} = ${n * (cnt + 1)} lớn hơn ${M} nên không đếm.`, mark: 'bad' },
            { text: `Vậy có ${cnt} số là bội của ${n} trong khoảng từ 1 đến ${M}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) {
        const m = item.meta;
        if (m.mode === 'uoc') { let c = 0; for (let i = 1; i <= m.N; i++) if (m.N % i === 0) c++; return String(c); }
        let c = 0; for (let v = 1; v <= m.M; v++) if (v % m.n === 0) c++; return String(c);
      },
    },

    // g10.4: "Số nào là bội (ước) của p thì cũng là bội (ước) của q" — đúng hay sai?
    {
      id: 'g10.4', covers: ['10.7'],
      make(rng) {
        const family = rng.next() < 0.5 ? 'boi' : 'uoc';
        const bT = [[4, 2], [6, 3], [6, 2], [8, 4], [9, 3], [10, 5], [12, 6], [12, 4], [8, 2], [15, 5], [10, 2], [14, 7], [16, 8], [18, 9], [20, 5], [20, 10]];
        const bF = [[3, 6], [2, 6], [3, 9], [4, 8], [5, 10], [4, 12], [6, 4], [10, 4], [6, 9], [3, 12], [5, 15], [4, 6], [6, 8], [9, 6], [8, 6], [10, 6]];
        const uT = [[2, 4], [3, 6], [3, 9], [4, 8], [5, 10], [2, 6], [4, 12], [6, 12], [5, 15], [7, 14], [6, 18], [8, 24], [9, 18], [10, 30], [4, 20], [3, 15]];
        const uF = [[4, 2], [6, 3], [9, 3], [8, 4], [10, 5], [12, 8], [10, 4], [9, 6], [12, 9], [15, 10], [6, 4], [14, 6], [18, 12], [8, 6], [6, 9], [12, 10]];
        const isTrue = rng.next() < 0.5;
        const [p, q] = pick(rng, family === 'boi' ? (isTrue ? bT : bF) : (isTrue ? uT : uF));
        const name = pick(rng, NAMES);
        const bigger = p > q ? 'lớn' : 'nhỏ';
        const w = family === 'boi' ? 'bội' : 'ước';
        let reasons, whyWrong, steps, hint, counter = 0, common = 0;
        if (family === 'boi') {
          common = p * q / gcd(p, q);
          const k = p / q, useLong = rng.next() < 0.5;
          reasons = isTrue
            ? [
              { text: useLong ? `Đúng, vì ${p} = ${q} × ${k}, nên bội của ${p} cũng là bội của ${q}` : `Đúng, vì ${p} = ${q} × ${k}`, correct: true },
              { text: `Đúng, vì ${p} là bội của ${p} và cũng là bội của ${q}`, correct: false, code: '1VD', why: 'Một ví dụ chưa đủ để nói "luôn đúng". Cần giải thích vì sao với mọi bội.' },
              { text: `Đúng, vì ${p} lớn hơn ${q}`, correct: false, code: 'QUY', why: `Lớn hơn chưa đủ. Cần ${p} chia hết cho ${q}, tức ${p} = ${q} × ${k}.` },
            ]
            : [
              { text: useLong ? `Sai. Ví dụ ${p} là bội của ${p} nhưng ${p} không chia hết cho ${q}` : `Sai. Ví dụ ${p} là bội của ${p} mà không là bội của ${q}`, correct: true },
              { text: `Sai. Ví dụ ${common} là bội của cả ${p} và ${q}`, correct: false, code: '1VD', why: `${common} là bội của cả hai nên ví dụ này không làm câu của ${name} sai. Muốn cho thấy câu SAI, phải tìm ví dụ làm câu sai.` },
              { text: `Sai, vì ${p} ${bigger} hơn ${q} nên bội của ${p} không là bội của ${q}`, correct: false, code: 'QUY', why: 'Lớn hơn hay nhỏ hơn chưa quyết định bội. Cần tìm một số cụ thể là bội của số đầu mà không là bội của số sau.' },
            ];
          whyWrong = isTrue
            ? `${p} = ${q} × ${p / q} nên bội của ${p} (${p}, ${2 * p}, ${3 * p}…) đều là ${q} nhân với một số, tức là bội của ${q}.`
            : `${p} là bội của ${p} nhưng ${p} không chia hết cho ${q}. Nên câu này SAI.`;
          hint = `Thử vài bội của ${p}: ${p}, ${2 * p}, ${3 * p}…`;
          steps = [
            { text: `Bội của ${p}: ${p}, ${2 * p}, ${3 * p}, ${4 * p}…`, visual: { kind: 'grid100', n: 60, mark: [{ multipleOf: p }, { multipleOf: q, color: '#F5893A' }] } },
            isTrue
              ? { text: `${p} ÷ ${q} = ${p / q}, không dư. Nên ${p} = ${q} × ${p / q}, và mọi bội của ${p} cũng là bội của ${q}.`, mark: 'good' }
              : { text: `${p < q ? `${p} nhỏ hơn ${q}` : `${p} ÷ ${q} = ${Math.floor(p / q)} dư ${p % q}`}, nên ${p} không chia hết cho ${q}. Vậy ${p} là bội của ${p} mà KHÔNG là bội của ${q}.`, mark: 'bad' },
            { text: isTrue ? `Vậy ${name} nói ĐÚNG.` : `Vậy ${name} nói SAI: một ví dụ làm câu SAI là ${p}.`, mark: 'good' },
          ];
        } else {
          const dp = divisorsOf(p), dq = divisorsOf(q);
          common = gcd(p, q);
          counter = dp.find((d) => q % d !== 0) || 0;
          const k = q / p, useLong = rng.next() < 0.5;
          reasons = isTrue
            ? [
              { text: useLong ? `Đúng, vì ${q} = ${p} × ${k}, nên ước của ${p} cũng là ước của ${q}` : `Đúng, vì ${q} = ${p} × ${k}`, correct: true },
              { text: `Đúng, vì ${p} là ước của ${p} và cũng là ước của ${q}`, correct: false, code: '1VD', why: 'Một ví dụ chưa đủ để nói "luôn đúng". Cần giải thích vì sao với mọi ước.' },
              { text: `Đúng, vì ${q} lớn hơn ${p}`, correct: false, code: 'QUY', why: `Lớn hơn chưa đủ. Cần ${q} chia hết cho ${p}, tức ${q} = ${p} × ${k}.` },
            ]
            : [
              { text: useLong ? `Sai. Ví dụ ${counter} là ước của ${p} nhưng ${counter} không là ước của ${q}` : `Sai. Ví dụ ${counter} là ước của ${p} mà không là ước của ${q}`, correct: true },
              { text: `Sai. Ví dụ ${common} là ước của cả ${p} và ${q}`, correct: false, code: '1VD', why: `${common} là ước của cả hai nên ví dụ này không làm câu của ${name} sai. Muốn cho thấy câu SAI, phải tìm ví dụ làm câu sai.` },
              { text: `Sai, vì ${p} ${bigger} hơn ${q} nên ước của ${p} không là ước của ${q}`, correct: false, code: 'QUY', why: 'Lớn hơn hay nhỏ hơn chưa quyết định ước. Cần tìm một số cụ thể là ước của số đầu mà không là ước của số sau.' },
            ];
          whyWrong = isTrue
            ? `${q} = ${p} × ${q / p}. Mỗi ước của ${p} chia hết ${p}, mà ${p} chia hết ${q}, nên ước của ${p} cũng là ước của ${q}.`
            : `${counter} là ước của ${p} (${p} ÷ ${counter} = ${p / counter}) nhưng ${q} ÷ ${counter} = ${Math.floor(q / counter)} dư ${q % counter}. Nên câu này SAI.`;
          hint = `Viết các ước của ${p} và các ước của ${q} rồi so sánh.`;
          steps = [
            { text: `Ước của ${p}: ${dp.join(', ')}. Ước của ${q}: ${dq.join(', ')}.`, visual: { kind: 'table', headers: ['Số', 'Các ước'], rows: [[String(p), dp.join(', ')], [String(q), dq.join(', ')]] } },
            isTrue
              ? { text: `Mọi ước của ${p} đều có trong các ước của ${q}, vì ${q} = ${p} × ${q / p}.`, mark: 'good' }
              : { text: `${counter} là ước của ${p} nhưng không có trong các ước của ${q} (${q} ÷ ${counter} dư ${q % counter}).`, mark: 'bad' },
            { text: isTrue ? `Vậy ${name} nói ĐÚNG.` : `Vậy ${name} nói SAI: một ví dụ làm câu SAI là ${counter}.`, mark: 'good' },
          ];
        }
        return {
          id: 'g10.4', src: '[biến thể mới]', type: 'tf',
          prompt: `${name} nói: "Số nào là ${w} của ${p} thì cũng là ${w} của ${q}." ${name} nói đúng hay SAI?`,
          answer: isTrue, reasons: shuffle(rng, reasons), whyWrong, hint,
          meta: { family, p, q },
          explain: { steps },
        };
      },
      solve(item) { const { family, p, q } = item.meta; return String(family === 'boi' ? p % q === 0 : q % p === 0); },
    },

    // g10.5: Có phép nhân a × b = P. Chọn câu ĐÚNG / SAI về bội và ước
    {
      id: 'g10.5', covers: ['10.1'],
      make(rng) {
        const [a, b] = pick(rng, [[3, 5], [3, 7], [4, 5], [4, 7], [5, 6], [5, 7], [5, 8], [6, 7], [7, 8], [7, 9], [4, 9], [3, 8], [6, 5], [8, 9], [9, 5], [9, 7]]);
        const P = a * b;
        const st = (rel, x, y) => ({ rel, x, y, text: rel === 'boi' ? `${x} là bội của ${y}` : `${x} là ước của ${y}` });
        const T = [st('boi', P, a), st('boi', P, b), st('uoc', a, P), st('uoc', b, P)];
        const F = [st('boi', a, P), st('boi', b, P), st('uoc', P, a), st('uoc', P, b), st('uoc', a, b), st('boi', b, a)];
        const askWrong = rng.next() < 0.4;
        const rev = (s) => (s.rel === 'boi' ? s.y === P : s.x === P);
        const whyFalse = (s) => (rev(s)
          ? `Câu này nói ngược. ${a} × ${b} = ${P} nên ${P} là bội của ${a} và ${b}; còn ${a} và ${b} là ước của ${P}.`
          : s.rel === 'boi'
            ? (s.x < s.y ? `${s.x} nhỏ hơn ${s.y}, nên ${s.x} không là bội của ${s.y}. Bội của ${s.y} là ${s.y}, ${2 * s.y}, ${3 * s.y}…` : `${s.x} ÷ ${s.y} = ${Math.floor(s.x / s.y)} dư ${s.x % s.y}. Còn dư nên ${s.x} không là bội của ${s.y}.`)
            : (s.x > s.y ? `${s.x} lớn hơn ${s.y}, nên ${s.x} không là ước của ${s.y}. Ước của một số không lớn hơn số đó.` : `${s.y} ÷ ${s.x} = ${Math.floor(s.y / s.x)} dư ${s.y % s.x}. Còn dư nên ${s.x} không là ước của ${s.y}.`));
        const whyTrue = (s) => `Câu này ĐÚNG vì ${a} × ${b} = ${P}${s.rel === 'boi' ? ` (${P} ÷ ${s.y} = ${P / s.y}, không dư)` : ` (${s.y} ÷ ${s.x} = ${s.y / s.x}, không dư)`}. Câu hỏi đang tìm câu SAI.`;
        const rightS = askWrong ? pick(rng, F) : pick(rng, T);
        const wrongPool = askWrong ? shuffle(rng, T.filter((s) => s !== rightS)).slice(0, 3) : shuffle(rng, F.filter((s) => s !== rightS)).slice(0, 3);
        const stmts = shuffle(rng, [rightS, ...wrongPool]);
        const choices = stmts.map((s) => (s === rightS ? R(s.text) : askWrong ? W(s.text, 'ĐỌC', whyTrue(s)) : W(s.text, rev(s) ? 'NGƯỢC' : 'QUY', whyFalse(s))));
        const steps = [
          { text: `Xếp ${P} ô thành ${a} hàng, mỗi hàng ${b} ô: ${a} × ${b} = ${P}.`, visual: { kind: 'array', rows: a, cols: b, showEq: true, anim: 'fill' } },
          { text: `Tích ${P} là bội của ${a} và của ${b} (${P} ÷ ${a} = ${b}; ${P} ÷ ${b} = ${a}). Còn ${a} và ${b} là ước của ${P}.`, mark: 'good', visual: { kind: 'array', rows: a, cols: b, groupBy: 'rows', showEq: true } },
          { text: askWrong ? `Câu nói ngược lại, hoặc nói ${a} chia hết cho ${b} (hay ngược lại) là SAI vì ${Math.max(a, b)} ÷ ${Math.min(a, b)} còn dư.` : `Các câu nói ngược (số nhỏ là bội của tích) hoặc nói ${a} và ${b} chia hết cho nhau đều SAI.`, mark: 'bad' },
          { text: `Vậy đáp án là: ${rightS.text}.`, mark: 'good' },
        ];
        return {
          id: 'g10.5', src: '[biến thể mới]', type: 'choice', layout: 'list',
          prompt: `Có phép nhân ${a} × ${b} = ${P}. Chọn câu ${askWrong ? 'SAI' : 'ĐÚNG'}.`,
          visual: { kind: 'array', rows: a, cols: b, showEq: true },
          hint: 'Số nào là tích, số nào là thừa số?',
          choices, meta: { a, b, askWrong, stmts: stmts.map((s) => ({ text: s.text, rel: s.rel, x: s.x, y: s.y })) },
          explain: { steps },
        };
      },
      solve(item) {
        const { askWrong, stmts } = item.meta;
        const truth = (s) => (s.rel === 'boi' ? s.x % s.y === 0 : s.y % s.x === 0);
        return stmts.find((s) => truth(s) !== askWrong).text;
      },
    },

    // g10.6: PHÂN LOẠI: ước của N / bội của n (hai ô)
    {
      id: 'g10.6', covers: ['10.2'],
      make(rng) {
        const mode = rng.next() < 0.55 ? 'uoc' : 'boi';
        let nums, K, prompt, yesText, noText, steps;
        if (mode === 'uoc') {
          const N = pick(rng, [24, 30, 36, 40, 42, 48, 54, 56, 60, 72]);
          K = N;
          const D = divisorsOf(N);
          const nd = int(rng, 5, 6);
          const dv = shuffle(rng, D).slice(0, nd);
          const non = []; for (let x = 3; x < N - 1; x++) if (N % x !== 0) non.push(x);
          let nn = shuffle(rng, non).slice(0, 10 - nd);
          if (N * 2 <= 99 && rng.next() < 0.5) nn = [N * 2, ...nn.slice(1)];
          nums = [...dv, ...nn].sort((x, y) => x - y);
          prompt = `Chạm số rồi chạm ô: số nào là ước của ${N}?`;
          yesText = `Là ước của ${N}`; noText = `KHÔNG là ước của ${N}`;
          const yes = nums.filter((v) => N % v === 0), no = nums.filter((v) => N % v !== 0);
          steps = [
            { text: `Tìm theo cặp nhân: ${D.filter((d) => d * d <= N).map((d) => `${N} = ${d} × ${N / d}`).join('; ')}.`, visual: { kind: 'factorpairs', n: N, reveal: true, anim: 'reveal' } },
            { text: `Các ước của ${N}: ${D.join(', ')}. Trong các số đã cho: ${yes.join(', ')} là ước.`, mark: 'good' },
            { text: `${no.slice(0, 3).map((v) => (v > N ? `${v} lớn hơn ${N}, là bội của ${N}` : `${N} ÷ ${v} = ${Math.floor(N / v)} dư ${N % v}`)).join('; ')}. Các số không chia hết (hoặc lớn hơn ${N}) KHÔNG là ước.`, mark: 'bad' },
            { text: `Vậy ước của ${N}: ${yes.join(', ')}. Không là ước: ${no.join(', ')}. Nhớ: số nào cũng có ước là 1 và chính nó.`, mark: 'good' },
          ];
        } else {
          const n = int(rng, 3, 9);
          K = n;
          const ks = shuffle(rng, Array.from({ length: Math.min(12, Math.floor(99 / n)) - 1 }, (_, i) => i + 2));
          const yes = ks.slice(0, 5).map((k) => n * k);
          const no = [];
          let g = 0;
          while (no.length < 5 && g++ < 200) { const v = n * int(rng, 2, Math.floor(99 / n) - 1) + int(rng, 1, n - 1); if (!yes.includes(v) && !no.includes(v) && v <= 99) no.push(v); }
          nums = [...yes, ...no].sort((x, y) => x - y);
          prompt = `Chạm số rồi chạm ô: số nào là bội của ${n}?`;
          yesText = `Là bội của ${n}`; noText = `KHÔNG là bội của ${n}`;
          const yy = nums.filter((v) => v % n === 0), nn2 = nums.filter((v) => v % n !== 0);
          steps = [
            { text: `Bội của ${n} là số chia hết cho ${n}. Đếm thêm ${n} mỗi lần: ${n}, ${2 * n}, ${3 * n}, ${4 * n}…`, visual: { kind: 'grid100', n: Math.min(100, Math.ceil(Math.max(...nums) / 10) * 10), mark: [{ multipleOf: n }], anim: 'mark' } },
            { text: `${yy.map((v) => `${v} ÷ ${n} = ${v / n}`).slice(0, 4).join('; ')}… Các số này chia hết nên là bội.`, mark: 'good' },
            { text: `${nn2.slice(0, 3).map((v) => `${v} ÷ ${n} = ${Math.floor(v / n)} dư ${v % n}`).join('; ')}… Còn dư nên KHÔNG là bội.`, mark: 'bad' },
            { text: `Vậy bội của ${n}: ${yy.join(', ')}. Không là bội: ${nn2.join(', ')}.`, mark: 'good' },
          ];
        }
        const isYes = (v) => (mode === 'uoc' ? K % v === 0 : v % K === 0);
        return {
          id: 'g10.6', src: '[biến thể mới]', type: 'classify',
          prompt,
          chips: nums.map((v) => ({ id: 'n' + v, text: String(v) })),
          buckets: [{ id: 'y', text: yesText }, { id: 'k', text: noText }],
          answer: Object.fromEntries(nums.map((v) => ['n' + v, isYes(v) ? 'y' : 'k'])),
          hint: mode === 'uoc' ? `Ước của ${K} là số chia ${K} không dư.` : `Bội của ${K} là số chia cho ${K} không dư.`,
          meta: { mode, K, nums },
          explain: { steps },
        };
      },
      solve(item) { const { mode, K, nums } = item.meta; const o = {}; nums.forEach((v) => { o['n' + v] = (mode === 'uoc' ? K % v === 0 : v % K === 0) ? 'y' : 'k'; }); return o; },
    },

    // g10.7: PHÂN LOẠI bốn ô theo bội của hai số
    {
      id: 'g10.7', covers: ['10.3'],
      make(rng) {
        const [p, q] = pick(rng, [[2, 3], [3, 4], [4, 5], [3, 5], [4, 6], [5, 6], [6, 8], [7, 8], [2, 5], [3, 7], [6, 9], [4, 10], [5, 7], [3, 8]]);
        const L = p * q / gcd(p, q);
        const rangeN = []; for (let v = 6; v <= 99; v++) rangeN.push(v);
        const both = rangeN.filter((v) => v % L === 0), onlyP = rangeN.filter((v) => v % p === 0 && v % q !== 0), onlyQ = rangeN.filter((v) => v % q === 0 && v % p !== 0), none = rangeN.filter((v) => v % p !== 0 && v % q !== 0);
        const nb = both.length >= 2 && rng.next() < 0.4 ? 2 : 1;
        const cb = shuffle(rng, both).slice(0, nb), cP = shuffle(rng, onlyP).slice(0, 2), cQ = shuffle(rng, onlyQ).slice(0, 2), cN = shuffle(rng, none).slice(0, 2);
        const nums = [...cb, ...cP, ...cQ, ...cN].sort((x, y) => x - y);
        const cls = (v) => (v % p === 0 && v % q === 0 ? 'both' : v % p === 0 ? 'bp' : v % q === 0 ? 'bq' : 'none');
        const sorted = (arr) => arr.slice().sort((x, y) => x - y);
        return {
          id: 'g10.7', src: '[biến thể mới]', type: 'classify',
          prompt: `Chạm số rồi chạm ô đúng. Có bốn ô: chỉ là bội của ${p}; chỉ là bội của ${q}; là bội của cả ${p} và ${q}; không là bội của số nào.`,
          chips: nums.map((v) => ({ id: 'n' + v, text: String(v) })),
          buckets: [
            { id: 'bp', text: `Chỉ bội của ${p}` },
            { id: 'bq', text: `Chỉ bội của ${q}` },
            { id: 'both', text: `Bội của cả ${p} và ${q}` },
            { id: 'none', text: `Không là bội của ${p} và ${q}` },
          ],
          answer: Object.fromEntries(nums.map((v) => ['n' + v, cls(v)])),
          hint: `Đếm thêm ${p} mỗi lần, rồi đếm thêm ${q} mỗi lần, xem số nào có mặt.`,
          meta: { p, q, nums },
          explain: { steps: [
            { text: `Bội của ${p} trong các số đã cho: ${sorted([...cb, ...cP]).join(', ')}.`, visual: vennPQ(p, q, sorted([...cb, ...cP]), [], [], []) },
            { text: `Bội của ${q} trong các số đã cho: ${sorted([...cb, ...cQ]).join(', ')}.`, visual: vennPQ(p, q, cP, cQ, [], []) },
            { text: `${cb.join(', ')} có trong cả hai dãy (${cb.map((v) => `${v} ÷ ${p} = ${v / p}, ${v} ÷ ${q} = ${v / q}`).join('; ')}), nên đặt ở phần chung của hai vòng.`, mark: 'good', visual: vennPQ(p, q, cP, cQ, cb, []) },
            { text: `Vậy chỉ bội ${p}: ${sorted(cP).join(', ')}; chỉ bội ${q}: ${sorted(cQ).join(', ')}; cả hai: ${cb.join(', ')}. Số ${sorted(cN).join(', ')} không có trong dãy nào, đặt ngoài hai vòng.`, mark: 'good', visual: vennPQ(p, q, cP, cQ, cb, cN) },
          ] },
        };
      },
      solve(item) { const { p, q, nums } = item.meta; const o = {}; nums.forEach((v) => { o['n' + v] = v % p === 0 && v % q === 0 ? 'both' : v % p === 0 ? 'bp' : v % q === 0 ? 'bq' : 'none'; }); return o; },
    },

    // g10.8: CHỌN NHIỀU: các cách xếp đúng N đồ vật thành các hàng đều nhau
    {
      id: 'g10.8', covers: ['10.4'],
      make(rng) {
        const ctx = pick(rng, [
          { thing: 'ghế', grp: 'hàng', each: 'ghế', pre: 'chiếc ghế' },
          { thing: 'cây', grp: 'hàng', each: 'cây', pre: 'cây' },
          { thing: 'bạn học sinh', grp: 'hàng', each: 'bạn', pre: 'bạn học sinh' },
          { thing: 'viên gạch', grp: 'hàng', each: 'viên', pre: 'viên gạch' },
          { thing: 'chậu hoa', grp: 'dãy', each: 'chậu', pre: 'chậu hoa' },
          { thing: 'quyển sách', grp: 'chồng', each: 'quyển', pre: 'quyển sách' },
          { thing: 'chiếc bàn', grp: 'dãy', each: 'bàn', pre: 'chiếc bàn' },
        ]);
        const N = pick(rng, [24, 30, 36, 40, 42, 48, 56, 60, 72]);
        const pairs = []; for (let r = 2; r <= 12; r++) if (N % r === 0 && N / r <= 20 && r <= N / r) pairs.push([r, N / r]);
        const nOk = rng.next() < 0.5 ? 2 : 3;
        const okPairs = shuffle(rng, pairs).slice(0, Math.min(nOk, pairs.length)).map(([r, c]) => (rng.next() < 0.5 ? [r, c] : [c, r]));
        const bad = []; let g = 0;
        while (bad.length < 4 - okPairs.length && g++ < 300) {
          const r = int(rng, 3, 11), c = int(rng, 3, 11), d = r * c - N;
          const key = [r, c].sort((x, y) => x - y).join('x');
          if (d !== 0 && Math.abs(d) <= 9 && ![...okPairs, ...bad].some(([a2, b2]) => [a2, b2].sort((x, y) => x - y).join('x') === key)) bad.push([r, c]);
        }
        const txt = ([r, c]) => `${r} ${ctx.grp}, mỗi ${ctx.grp} ${c} ${ctx.each}`;
        const opts = shuffle(rng, [...okPairs.map(([r, c]) => ({ r, c, ok: true })), ...bad.map(([r, c]) => ({ r, c, ok: false }))]);
        const choices = opts.map((o) => {
          const d = o.r * o.c - N;
          return o.ok ? R(txt([o.r, o.c])) : W(txt([o.r, o.c]), 'QUY', `${o.r} × ${o.c} = ${o.r * o.c}, ${d < 0 ? `mới được ${o.r * o.c}, còn thiếu ${-d}` : `nhiều hơn ${N} là ${d}`} ${ctx.each}. Số ${ctx.grp} và số ${ctx.each} mỗi ${ctx.grp} đều phải là ước của ${N}.`);
        });
        const okTxt = okPairs.map(([r, c]) => `${r} × ${c} = ${N}`).join('; ');
        return {
          id: 'g10.8', src: '[biến thể mới]', type: 'multi',
          prompt: `Có ${N} ${ctx.pre}, xếp thành các ${ctx.grp} đều nhau. Chọn tất cả các cách xếp đúng ${N} ${ctx.each} (KHÔNG thừa, KHÔNG thiếu).`,
          choices,
          hint: `Nhân số ${ctx.grp} với số ${ctx.each} mỗi ${ctx.grp}, xem có đủ ${N} không.`,
          meta: { N, opts: opts.map((o) => ({ r: o.r, c: o.c, text: txt([o.r, o.c]) })) },
          explain: { steps: [
            { text: `Cách xếp đúng là phép nhân có tích bằng ${N}. Số ${ctx.grp} và số ${ctx.each} mỗi ${ctx.grp} đều là ước của ${N}.`, visual: { kind: 'array', rows: okPairs[0][0], cols: okPairs[0][1], showEq: true, anim: 'fill' } },
            { text: `${okTxt}. ${okPairs.length === 2 ? 'Hai cách này' : 'Ba cách này'} ĐÚNG.`, mark: 'good' },
            { text: `${bad.map(([r, c]) => `${r} × ${c} = ${r * c}`).join('; ')}, ${bad.length > 1 ? 'đều khác' : 'khác'} ${N} nên SAI.`, mark: 'bad' },
            { text: `Vậy đáp án là: ${okPairs.map((p2) => txt(p2)).join('; ')}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { N, opts } = item.meta; return opts.filter((o) => o.r * o.c === N).map((o) => o.text).sort().join(','); },
    },

    // g10.9: NỐI số với cách gọi (ước / bội / vừa ước vừa bội / không) so với m
    {
      id: 'g10.9', covers: ['10.5'],
      make(rng) {
        const m = pick(rng, [12, 15, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 56, 60]);
        const d = pick(rng, divisorsOf(m).filter((x) => x > 1 && x < m));
        const ks = shuffle(rng, [2, 3, 4, 5]);
        const withNone = rng.next() < 0.5;
        const vals = [d, m, m * ks[0]];
        let xKind;
        if (withNone) {
          const cand = []; for (let x = 4; x <= 2 * m; x++) if (m % x !== 0 && x % m !== 0 && !vals.includes(x)) cand.push(x);
          vals.push(pick(rng, cand)); xKind = 'z';
        } else { vals.push(m * ks[1]); xKind = 'b'; }
        const kindOf = (v) => (v === m ? 'c' : v < m && m % v === 0 ? 'u' : v > m && v % m === 0 ? 'b' : 'z');
        const sortedVals = vals.slice().sort((x, y) => x - y);
        const right = [{ id: 'u', text: `Ước của ${m}` }, { id: 'b', text: `Bội của ${m}` }, { id: 'c', text: `Vừa là ước, vừa là bội của ${m}` }];
        if (withNone) right.push({ id: 'z', text: `Không là ước, không là bội của ${m}` });
        const left = shuffle(rng, vals.map((v) => ({ id: 'n' + v, text: String(v) })));
        const zv = withNone ? vals[3] : 0;
        return {
          id: 'g10.9', src: '[biến thể mới]', type: 'match',
          prompt: `Nối mỗi số trong các số ${sortedVals.join(', ')} với cách gọi đúng khi so với số ${m}.`,
          left, right: shuffle(rng, right),
          pairs: Object.fromEntries(vals.map((v) => ['n' + v, kindOf(v)])),
          hint: `Ước của ${m} thì ${m} chia hết cho nó. Bội của ${m} thì chia hết cho ${m}.`,
          meta: { m, vals },
          explain: { steps: [
            { text: `${d} × ${m / d} = ${m}, nên ${d} là ước của ${m} (${m} ÷ ${d} = ${m / d}, không dư).`, visual: { kind: 'array', rows: d, cols: m / d, showEq: true } },
            { text: `${vals.filter((v) => kindOf(v) === 'b').map((v) => `${v} ÷ ${m} = ${v / m}`).join('; ')}, đều không dư. Vậy ${vals.filter((v) => kindOf(v) === 'b').join(' và ')} là bội của ${m}.`, visual: { kind: 'table', headers: ['Số', 'Chia cho ' + m, 'Kết luận'], rows: vals.filter((v) => kindOf(v) === 'b').map((v) => [String(v), `${v} ÷ ${m} = ${v / m}`, 'bội']) } },
            { text: withNone ? `${zv} không chia hết cho ${m} (${zv} ÷ ${m} dư ${zv % m}) và ${m} cũng không chia hết cho ${zv} (${m} ÷ ${zv} dư ${m % zv}), nên ${zv} không là ước, không là bội.` : `${m} ÷ ${m} = 1 và ${m} = ${m} × 1. Số khác 0 nào cũng vừa là ước vừa là bội của chính nó.`, mark: 'good' },
            { text: `Vậy: ${d} là ước; ${vals.filter((v) => kindOf(v) === 'b').join(' và ')} là bội; ${m} vừa là ước vừa là bội${withNone ? `; ${zv} không là ước, không là bội` : ''}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { m, vals } = item.meta; const o = {}; vals.forEach((v) => { o['n' + v] = v === m ? 'c' : v < m && m % v === 0 ? 'u' : v > m && v % m === 0 ? 'b' : 'z'; }); return o; },
    },

    // g10.10: NUMPAD: số có hai chữ số thoả hai điều kiện (tổng/hiệu chữ số và là bội của m)
    {
      id: 'g10.10', covers: ['10.6'],
      make(rng) {
        const fam = rng.next() < 0.55 ? 'sum' : 'diff';
        const combos = fam === 'sum' ? COMBO_SUM : COMBO_DIFF;
        const [t, m, ans] = pick(rng, combos);
        const word = pick(rng, ['là bội của', 'chia hết cho']);
        const prop = (n) => (fam === 'sum' ? Math.floor(n / 10) + (n % 10) : Math.floor(n / 10) - (n % 10));
        const propTxt = (n) => (fam === 'sum' ? `${Math.floor(n / 10)} + ${n % 10} = ${prop(n)}` : `${Math.floor(n / 10)} − ${n % 10} = ${prop(n)}`);
        const cands = []; for (let n = 10; n <= 99; n++) if (prop(n) === t) cands.push(n);
        const failMul = cands.filter((n) => n % m !== 0);
        const mulOnly = []; for (let n = 10; n <= 99; n++) if (n % m === 0 && prop(n) !== t) mulOnly.push(n);
        const hints = [];
        shuffle(rng, failMul).slice(0, 3).forEach((n) => hints.push({ match: String(n), code: '1VD', why: `${propTxt(n)} là đúng, nhưng ${n} ÷ ${m} = ${Math.floor(n / m)} dư ${n % m}, chưa ${word === 'là bội của' ? `là bội của ${m}` : `chia hết cho ${m}`}. Số cần tìm phải đúng với cả hai yêu cầu.` }));
        shuffle(rng, mulOnly).slice(0, 2).forEach((n) => hints.push({ match: String(n), code: '1VD', why: `${n} ÷ ${m} = ${n / m}, không dư, nhưng ${propTxt(n)} chứ không bằng ${t}. Số cần tìm phải đúng với cả hai yêu cầu.` }));
        const cond1 = fam === 'sum' ? `có tổng hai chữ số là ${t}` : `có chữ số hàng chục lớn hơn chữ số hàng đơn vị ${t} đơn vị`;
        const idx = cands.indexOf(ans);
        return {
          id: 'g10.10', src: '[biến thể mới]', type: 'numpad',
          prompt: `Tìm số có hai chữ số, ${cond1} và ${word} ${m}.`,
          hint: 'Số đó phải đúng với CẢ HAI yêu cầu, không chỉ một yêu cầu.',
          slots: [{ label: 'Số cần tìm:', answer: String(ans) }],
          wrongHints: hints, meta: { fam, t, m },
          explain: { steps: [
            { text: `Các số có hai chữ số và ${fam === 'sum' ? `tổng chữ số là ${t}` : `chữ số hàng chục hơn chữ số hàng đơn vị ${t}`}: ${cands.join(', ')}.`, visual: { kind: 'sequence', items: cands } },
            { text: `Thử chia từng số cho ${m}: ${failMul.slice(0, 4).map((n) => `${n} dư ${n % m}`).join('; ')}${failMul.length > 4 ? ' …' : ''}. Các số này chưa ${word === 'là bội của' ? `là bội của ${m}` : `chia hết cho ${m}`}.`, mark: 'bad' },
            { text: `${ans} ÷ ${m} = ${ans / m}, không dư. Và ${propTxt(ans)}. Số ${ans} đúng với cả hai yêu cầu.`, mark: 'good', visual: { kind: 'sequence', items: cands, highlight: [idx] } },
            { text: `Vậy số cần tìm là ${ans}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) {
        const { fam, t, m } = item.meta; const r = [];
        for (let n = 10; n <= 99; n++) { const a = Math.floor(n / 10), b = n % 10; if ((fam === 'sum' ? a + b : a - b) === t && n % m === 0) r.push(n); }
        return String(r[0]);
      },
    },
  ],
};

// "Làm nóng" bộ số ngẫu nhiên: các seed liền kề cho số đầu tiên gần nhau, nên bỏ vài số đầu để bài khác hẳn nhau.
topic.generators.forEach((g) => { const mk = g.make; g.make = (rng) => { rng.next(); rng.next(); rng.next(); return mk(rng); }; });
export default topic;
