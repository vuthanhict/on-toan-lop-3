import { pick, int, shuffle } from '../core/rng.js';
import { vdivSteps, vdivMicro } from '../core/paper.js';

const R = (text) => ({ text, correct: true });
const W = (text, code, why) => ({ text, code, why });
const fr = (n, d) => `${n}/${d}`;
const NAMES = ['Lan', 'Mai', 'Nam', 'Hà', 'Bình', 'An', 'Chi', 'Minh', 'Linh', 'Phúc', 'Khoa', 'Thảo', 'Huy', 'Ngọc', 'Tú', 'Vy'];

// ----- lời giải kiểu vở ô li (hình nháp từ core/paper.js): chia (vdiv) rồi nhân, viết từng dòng (workout) -----
const gp = (t) => (t == null ? t : t.replace(/(?<!\d)(\d)(\d{3})(?!\d)/g, '$1 $2'));
const lc = (x) => (/^[A-ZÀ-Ỵ]/.test(x) ? x[0].toLowerCase() + x.slice(1) : x);
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
const INK = '#4B34A8';
// mỗi nhóm {text, lines:[{text,note?,color?}], mark?}; hình workout hiện dần các dòng, nhóm cuối đánh dấu hoàn chỉnh
const draft = (groups) => {
  const lines = groups.flatMap((g) => g.lines); let n = 0;
  return groups.map((g, i) => {
    const from = n; n += g.lines.length;
    return Object.assign({ text: g.text, visual: Object.assign({ kind: 'workout', lines, upto: n, from, anim: 'write' }, i === groups.length - 1 ? { done: true } : {}) }, g.mark ? { mark: g.mark } : {});
  });
};
// phân số của một số = chia cho mẫu số rồi nhân với tử số: hai nhóm dòng viết nháp (tag = 'a) ' nếu có nhiều phần)
const partGroups = (tag, k, n, N, u) => {
  const m = N / n, ans = m * k;
  return [
    { text: `${tag}1/${n} của ${N} ${u}: chia ${N} thành ${n} phần bằng nhau, ${N} ÷ ${n} = ${m} ${u}.`, lines: [{ text: `${tag}${k}/${n} của ${N} ${u}`, note: 'đề bài' }, { text: `${N} ÷ ${n} = ${m} ${u}`, note: `1/${n} của ${N}` }] },
    { text: `${k}/${n} là ${k} phần như vậy: ${m} × ${k} = ${ans} ${u}.`, lines: [{ text: `${m} × ${k} = ${ans} ${u}`, note: `${k}/${n} của ${N}` }], mark: 'good' },
  ];
};
// một phần: hình fracshape → chia (chia ngắn nếu số lớn) → nhân với tử số
const fracOfSteps = (N, n, k, u, final) => {
  const m = N / n, ans = m * k;
  const intro = { text: `${k}/${n} của ${N} ${u}: chia ${N} ${u} thành ${n} phần bằng nhau, rồi lấy ${k} phần.`, visual: { kind: 'fracshape', den: n, num: k, shape: 'bar', label: true, anim: 'fill' } };
  const div = N > 50 && n <= 9
    ? tidy(vdivSteps(N, n, { maxSteps: 4 })).map((st) => { const o = Object.assign({}, st); delete o.mark; return o; })
    : draft([{ text: `Chia cho mẫu số: ${N} ÷ ${n} = ${m} ${u}. Đó là 1/${n} của ${N} ${u}.`, lines: [{ text: `${k}/${n} của ${N} ${u}`, note: 'đề bài' }, { text: `${N} ÷ ${n} = ${m} ${u}`, note: `1/${n} của ${N}` }] }]);
  const tail = draft([{ text: `Nhân với tử số: ${m} × ${k} = ${ans} ${u}. ${final}`, lines: [{ text: `${N} ÷ ${n} = ${m}`, note: 'chia mẫu số' }, { text: `${m} × ${k} = ${ans} ${u}`, note: 'nhân tử số', color: INK }], mark: 'good' }]);
  return [intro, ...div, ...tail];
};

// Ngữ cảnh "hai bên lấy phân số của hai số khác nhau" (tiền / dây / gạo). Số đo tiền tính theo nghìn đồng.
const BAG_CTX = [
  { key: 'Túi', noun: 'túi', verb: 'có', adj: 'nhiều tiền hơn', ask: 'Túi nào nhiều tiền hơn?', head: 'Số tiền', fmt: (v) => `${v} 000 đồng` },
  { key: 'Sợi dây', noun: 'sợi dây', verb: 'dài', adj: 'dài hơn', ask: 'Sợi dây nào dài hơn?', head: 'Độ dài', fmt: (v) => `${v} m` },
  { key: 'Bao gạo', noun: 'bao gạo', verb: 'nặng', adj: 'nặng hơn', ask: 'Bao gạo nào nặng hơn?', head: 'Khối lượng', fmt: (v) => `${v} kg` },
];
// Bên có phân số lớn hơn (1/p) khi thì chứa nhiều hơn, khi thì ít hơn → không có "mẹo" chọn theo phân số.
function bagSetup(rng) {
  const ctx = pick(rng, BAG_CTX);
  const p = int(rng, 2, 5), q = p + int(rng, 1, 3);
  const y = int(rng, 5, 12), diff = int(rng, 1, 4);
  const bigIdx = rng.next() < 0.5 ? 0 : 1;
  const moreBig = rng.next() < 0.5;
  const x = moreBig ? y + diff : y - diff;
  const bags = [null, null];
  bags[bigIdx] = { den: p, total: p * x };
  bags[1 - bigIdx] = { den: q, total: q * y };
  const nm = ['A', 'B'];
  const amt = (i) => bags[i].total / bags[i].den;
  const more = amt(0) > amt(1) ? 0 : 1;
  const table = (show, hl) => ({ kind: 'table', headers: [ctx.key, 'Phân số', ctx.head], rows: bags.map((b, i) => [nm[i], `1/${b.den} của ${ctx.fmt(b.total)}`, show ? ctx.fmt(amt(i)) : '?']), ...(hl ? { highlight: hl } : {}) });
  // lời giải viết nháp: hai dòng đề, chia từng bên, rồi kết luận (finalText/finalLine)
  const draftSteps = (finalText, finalLine) => draft([
    { text: `So sánh 1/${p} và 1/${q} chỉ dùng được khi lấy phân số của cùng một số. Ở đây hai số khác nhau, nên phải tính ra.`, lines: bags.map((b, i) => ({ text: `${ctx.key} ${nm[i]}: 1/${b.den} của ${ctx.fmt(b.total)}`, note: i === 0 ? 'hai số khác nhau' : '' })) },
    { text: `${ctx.key} A: ${ctx.fmt(bags[0].total)} ÷ ${bags[0].den} = ${ctx.fmt(amt(0))}.`, lines: [{ text: `${ctx.fmt(bags[0].total)} ÷ ${bags[0].den} = ${ctx.fmt(amt(0))}`, note: `${ctx.noun} A` }] },
    { text: `${ctx.key} B: ${ctx.fmt(bags[1].total)} ÷ ${bags[1].den} = ${ctx.fmt(amt(1))}.`, lines: [{ text: `${ctx.fmt(bags[1].total)} ÷ ${bags[1].den} = ${ctx.fmt(amt(1))}`, note: `${ctx.noun} B` }] },
    { text: finalText, lines: [{ text: finalLine, color: INK }], mark: 'good' },
  ]);
  return { ctx, p, q, bags, nm, amt, more, less: 1 - more, cap: ctx.key, table, draftSteps };
}
const moneyTable = (rows, highlight) => ({ kind: 'table', headers: ['Túi', 'Phân số', 'Số tiền'], rows, ...(highlight ? { highlight } : {}) });

const topic = {
  id: 'cd12', no: 12, day: 4, title: 'Phân số: hình, so sánh, của một số', short: 'Phân số', icon: '🍕',
  intro: 'Phân số có tử số ở trên và mẫu số ở dưới. Mẫu số càng lớn thì mỗi phần càng nhỏ. Muốn tìm phân số của một số: chia cho mẫu số rồi nhân với tử số.',

  remember: [
    {
      text: 'Phân số 1/4 nghĩa là chia thành 4 phần BẰNG NHAU, lấy 1 phần. Tử số là 1 thì mẫu số càng lớn, phân số càng bé: 1/2 > 1/3 > 1/4. Cùng mẫu số thì tử số lớn hơn là phân số lớn hơn: 5/6 > 2/6.',
      visual: { kind: 'fracwall', rows: 6, highlight: [{ row: 2 }, { row: 3 }, { row: 4 }], compare: [2, 4], anim: 'slide' },
    },
    {
      text: 'Muốn tìm 3/4 của 12: lấy 12 chia 4 được 3, rồi nhân với 3 được 9. Phân số cũng là phép chia: 3 ÷ 4 = 3/4.',
      visual: { kind: 'fracset', total: 12, den: 4, num: 3, emoji: '🍎', anim: 'group' },
    },
    {
      text: 'Hai túi tiền lấy phân số của hai số khác nhau thì phải tính ra số tiền mới so sánh được.',
      visual: moneyTable([['A', '1/3 của 24 000 đồng', '8 000 đồng'], ['B', '1/4 của 40 000 đồng', '10 000 đồng']], [[1, 2]]),
    },
    {
      text: 'Cách làm nháp: phân số của một số thì chia cho mẫu số rồi nhân với tử số. Ví dụ 3/4 của 12: 12 ÷ 4 = 3, rồi 3 × 3 = 9.',
      visual: { kind: 'workout', lines: [{ text: '3/4 của 12', note: 'đề bài' }, { text: '12 ÷ 4 = 3', note: 'chia mẫu số' }, { text: '3 × 3 = 9', note: 'nhân tử số' }], upto: 3, done: true },
    },
  ],

  lesson: [
    {
      text: 'Tường phân số: hàng 4 chia thành 4 viên bằng nhau, mỗi viên là 1/4. Hàng trên cùng là cả tường: 1.',
      visual: { kind: 'fracwall', rows: 6, highlight: [{ row: 4 }], anim: 'slide' },
    },
    {
      text: 'Đặt viên 1/3 cạnh viên 1/4: viên 1/3 dài hơn. Mẫu số càng lớn thì chia càng nhiều phần, mỗi phần càng bé. Vậy 1/3 > 1/4.',
      visual: { kind: 'fracwall', rows: 6, highlight: [{ row: 3 }, { row: 4 }], compare: [3, 4] },
    },
    {
      text: 'Cùng mẫu số 6: lấy 5 viên thì dài hơn lấy 2 viên. Cùng mẫu số thì tử số lớn hơn là phân số lớn hơn: 5/6 > 2/6.',
      visual: { kind: 'fracwall', rows: 6, highlight: [{ row: 6, cells: 5 }] },
    },
    {
      text: '3/4 của 12 quả táo: chia 12 quả thành 4 nhóm bằng nhau, mỗi nhóm 12 ÷ 4 = 3 quả. Lấy 3 nhóm: 3 × 3 = 9 quả.',
      visual: { kind: 'fracset', total: 12, den: 4, num: 3, emoji: '🍎', anim: 'group' },
    },
    {
      text: 'Con viết nháp: chia cho mẫu số trước, rồi nhân với tử số.',
      visual: { kind: 'workout', lines: [{ text: '3/4 của 12', note: 'đề bài' }, { text: '12 ÷ 4 = 3', note: 'chia mẫu số' }, { text: '3 × 3 = 9', note: 'nhân tử số' }], upto: 3, done: true },
    },
    {
      text: 'Số lớn hơn thì con chia ngắn. 5/6 của 84 m: 84 ÷ 6 = 14 m, rồi 14 × 5 = 70 m.',
      visual: { kind: 'vdiv', a: 84, b: 6, upto: vdivMicro(84, 6).length },
    },
    {
      text: 'Chia đều 3 cái bánh cho 4 bạn: mỗi bạn được 3 ÷ 4 = 3/4 cái bánh. Phân số là phép chia: tử số là số bánh, mẫu số là số bạn.',
      visual: { kind: 'fracshape', den: 4, num: 3, shape: 'rect', label: true, anim: 'fill' },
    },
    ...draft([
      { text: 'So sánh 1/3 của 24 000 đồng và 1/4 của 40 000 đồng: không thể chỉ nhìn 1/3 > 1/4. Phải tính tiền.', lines: [{ text: 'A: 24 000 ÷ 3 = 8 000 đồng', note: 'túi A' }, { text: 'B: 40 000 ÷ 4 = 10 000 đồng', note: 'túi B' }] },
      { text: 'Vậy túi B nhiều tiền hơn.', lines: [{ text: '10 000 > 8 000 → túi B', color: INK }], mark: 'good' },
    ]),
  ],

  items: [
    {
      id: '12.1', src: 'S1-C10', type: 'choice', layout: 'grid2',
      prompt: 'Trong các phân số 1/2, 1/3, 1/5, 1/6, phân số nào BÉ nhất?',
      hint: 'Chia nhiều phần hơn thì mỗi phần to hơn hay bé hơn?',
      choices: [
        W('1/2', 'QUY', 'Mẫu 2 nghĩa là chỉ chia 2 phần nên mỗi phần to nhất. 1/2 là phân số LỚN nhất trong các số này.'),
        W('1/3', 'QUY', 'Chia 3 phần thì mỗi phần vẫn to hơn khi chia 6 phần.'),
        W('1/5', 'QUY', 'Chia 5 phần thì mỗi phần vẫn to hơn khi chia 6 phần, nên 1/5 chưa bé nhất.'),
        R('1/6'),
      ],
      explain: { steps: [
        { text: 'Trên tường phân số, hàng 2 có 2 viên 1/2, hàng 6 có 6 viên 1/6.', visual: { kind: 'fracwall', rows: 6, highlight: [{ row: 2 }, { row: 6 }], anim: 'slide' } },
        { text: 'Cùng chia một cái bánh: chia càng nhiều phần thì mỗi phần càng bé.', visual: { kind: 'fracwall', rows: 6, highlight: [{ row: 2 }, { row: 3 }, { row: 5 }, { row: 6 }], compare: [2, 6] } },
        { text: 'Vậy viên 1/6 ngắn nhất. Phân số bé nhất là 1/6.', mark: 'good' },
      ] },
      tags: ['so sánh'],
    },
    {
      id: '12.2', src: 'S4 Q5', type: 'order',
      prompt: 'Xếp các phân số theo thứ tự GIẢM dần (từ lớn đến bé). Chạm lần lượt từng phân số.',
      items: [
        { id: 'p8', text: '1/8' },
        { id: 'p3', text: '1/3' },
        { id: 'p11', text: '1/11' },
        { id: 'p6', text: '1/6' },
      ],
      answer: ['p3', 'p6', 'p8', 'p11'],
      wrongHints: [
        { match: ['p11', 'p8', 'p6', 'p3'], code: 'QUY', why: 'Đây là xếp TĂNG dần, và đã coi mẫu số lớn là phân số lớn. Mẫu càng lớn thì phân số càng bé.' },
      ],
      hint: 'Tử số đều là 1. Mẫu số bé thì phân số lớn.',
      explain: { steps: [
        { text: 'Các phân số đều có tử số 1: mẫu số càng bé thì phân số càng lớn.', visual: { kind: 'fracwall', rows: 11, highlight: [{ row: 3 }, { row: 6 }, { row: 8 }, { row: 11 }] } },
        { text: 'Mẫu số từ bé đến lớn là 3, 6, 8, 11. Nên phân số từ lớn đến bé là 1/3, 1/6, 1/8, 1/11.' },
        { text: 'Vậy 1/3 > 1/6 > 1/8 > 1/11.', mark: 'good' },
      ] },
      tags: ['so sánh'],
    },
    {
      id: '12.3', src: 'S1-C13', type: 'numpad',
      prompt: 'Tìm phân số của một số:\na) 3/4 của 80 m là bao nhiêu mét?\nb) 2/8 của 64 kg là bao nhiêu ki-lô-gam?',
      hint: 'Chia cho mẫu số trước, rồi nhân với tử số.',
      slots: [
        { label: 'a)', answer: '60', unit: 'm' },
        { label: 'b)', answer: '16', unit: 'kg' },
      ],
      wrongHints: [
        { match: '20|8', code: 'QUY', why: 'Mới tìm được 1/4 và 1/8 (một phần). Còn phải nhân với tử số: ô a) nhân 3, ô b) nhân 2.' },
        { match: '240|128', code: 'NGƯỢC', why: 'Con thử chia số đó cho mẫu số trước nhé, rồi mới nhân với tử số.' },
        { match: '60|8', code: 'QUY', why: 'Ô a) đúng. Ô b) mới tìm được 1/8 là 8 kg; 2/8 là 2 phần, nên nhân thêm 2.' },
        { match: '20|16', code: 'QUY', why: 'Ô b) đúng. Ô a) mới tìm được 1/4 là 20 m; 3/4 là 3 phần, nên nhân thêm 3.' },
      ],
      explain: { steps: draft([
        ...partGroups('a) ', 3, 4, 80, 'm'),
        ...partGroups('b) ', 2, 8, 64, 'kg'),
        { text: 'Vậy a) 60 m; b) 16 kg. Nhớ: chia cho mẫu số trước, rồi nhân với tử số.', lines: [{ text: 'a) 60 m    b) 16 kg', color: INK }], mark: 'good' },
      ]) },
      tags: ['của một số'],
    },
    {
      id: '12.4', src: 'S4 Q4', type: 'tf',
      prompt: 'Túi A có 1/3 của 24 000 đồng, túi B có 1/4 của 40 000 đồng. Nam nói: "Túi A nhiều tiền hơn vì 1/3 > 1/4." Nam nói đúng hay SAI?',
      answer: false,
      visual: moneyTable([['A', '1/3 của 24 000 đồng', '?'], ['B', '1/4 của 40 000 đồng', '?']]),
      hint: 'Hai túi lấy phân số của hai số khác nhau. Con thử tính ra số tiền.',
      reasons: [
        { text: 'Sai. Túi A có 8 000 đồng, túi B có 10 000 đồng, nên B nhiều hơn', correct: true },
        { text: 'Sai, vì 24 000 đồng bé hơn 40 000 đồng', correct: false, code: 'QUY', why: 'Kết luận trùng nhưng cách nghĩ chưa chắc. Ví dụ 1/2 của 24 000 đồng là 12 000 đồng, lớn hơn 1/4 của 40 000 đồng là 10 000 đồng. Phải tính ra số tiền.' },
        { text: 'Sai, vì 1/4 lớn hơn 1/3', correct: false, code: 'QUY', why: '1/3 vẫn lớn hơn 1/4. Chỗ chưa đúng là hai túi lấy từ hai số khác nhau (24 000 đồng và 40 000 đồng) nên phải tính số tiền.' },
      ],
      whyWrong: '1/3 > 1/4 chỉ dùng được khi cùng lấy phân số của MỘT số. Ở đây hai số khác nhau (24 000 đồng và 40 000 đồng). Nên phải tính ra tiền: túi A có 8 000 đồng, túi B có 10 000 đồng.',
      explain: { steps: draft([
        { text: 'So sánh 1/3 và 1/4 chỉ đúng khi lấy phân số của cùng một số. Ở đây hai số khác nhau nên phải tính tiền.', lines: [{ text: 'Túi A: 1/3 của 24 000 đồng', note: 'hai số khác nhau' }, { text: 'Túi B: 1/4 của 40 000 đồng' }] },
        { text: 'Túi A: 24 000 ÷ 3 = 8 000, được 8 000 đồng.', lines: [{ text: '24 000 ÷ 3 = 8 000 đồng', note: 'túi A' }] },
        { text: 'Túi B: 40 000 ÷ 4 = 10 000, được 10 000 đồng.', lines: [{ text: '40 000 ÷ 4 = 10 000 đồng', note: 'túi B' }] },
        { text: 'Vậy 10 000 đồng > 8 000 đồng: túi B nhiều tiền hơn, Nam nói SAI.', lines: [{ text: '10 000 > 8 000 → túi B nhiều hơn', color: INK }], mark: 'good' },
      ]) },
      tags: ['so sánh', 'của một số'],
    },
    {
      id: '12.5', src: '[ngoài tài liệu]', type: 'choice', layout: 'grid2',
      prompt: 'Hình nào đã tô đúng 3/4? Chạm vào hình đó.',
      hint: 'Đếm số phần bằng nhau và số phần được tô.',
      choices: [
        { text: '', correct: true, visual: { kind: 'fracshape', den: 4, num: 3, shape: 'rect', cut: 'equal' } },
        { text: '', code: 'QUY', why: 'Hình này chia 4 phần KHÔNG bằng nhau. Phân số chỉ đúng khi các phần bằng nhau.', visual: { kind: 'fracshape', den: 4, num: 3, shape: 'rect', cut: 'unequal' } },
        { text: '', code: 'ĐẾM', why: 'Hình này chia 3 phần và tô cả 3 phần: đó là 3/3, cả hình, không phải 3/4.', visual: { kind: 'fracshape', den: 3, num: 3, shape: 'rect', cut: 'equal' } },
        { text: '', code: 'ĐẾM', why: 'Hình này chỉ tô 1 trong 4 phần bằng nhau: đó là 1/4.', visual: { kind: 'fracshape', den: 4, num: 1, shape: 'rect', cut: 'equal' } },
      ],
      explain: { steps: [
        { text: 'Muốn có 3/4: chia hình thành 4 phần BẰNG NHAU rồi tô 3 phần.', visual: { kind: 'fracshape', den: 4, num: 3, shape: 'rect', label: true, anim: 'fill' } },
        { text: 'Hình chia 4 phần không bằng nhau thì không viết 3/4 được.', mark: 'bad', visual: { kind: 'fracshape', den: 4, num: 3, shape: 'rect', cut: 'unequal' } },
        { text: 'Vậy đáp án là hình chia 4 phần bằng nhau và tô 3 phần. Hình chia 3 phần tô cả 3 là 3/3 (cả hình), hình chỉ tô 1 phần trong 4 là 1/4.', mark: 'good' },
      ] },
      tags: ['hình'],
    },
    {
      id: '12.6', src: '[ngoài tài liệu]', type: 'choice',
      prompt: 'Chia đều 3 cái bánh cho 4 bạn. Mỗi bạn được bao nhiêu phần cái bánh?',
      hint: 'Phân số là phép chia: số bánh chia cho số bạn.',
      choices: [
        R('3/4 cái bánh'),
        W('4/3 cái bánh', 'NGƯỢC', 'Tử số là số bánh (3), mẫu số là số bạn (4). 4/3 là hơn 1 cái, mà chỉ có 3 cái bánh cho 4 bạn thì mỗi bạn chưa được 1 cái.'),
        W('1/4 cái bánh', 'QUY', 'Mỗi bạn lấy 1 phần của mỗi cái bánh, tức là 3 phần chứ không phải 1 phần.'),
      ],
      explain: { steps: [
        { text: 'Chia mỗi cái bánh thành 4 phần bằng nhau, mỗi phần là 1/4 cái.', visual: { kind: 'fracshape', den: 4, num: 1, shape: 'rect', label: true } },
        { text: 'Mỗi bạn lấy 1 phần của mỗi cái bánh: được 3 phần, mỗi phần 1/4, tức là 3/4 cái.', visual: { kind: 'fracshape', den: 4, num: 3, shape: 'rect', label: true, anim: 'fill' } },
        { text: 'Phân số là phép chia: 3 ÷ 4 = 3/4.', mark: 'good' },
        { text: 'Vậy mỗi bạn được 3/4 cái bánh.', mark: 'good' },
      ] },
      tags: ['phân số là phép chia'],
    },
  ],

  variant: {
    id: '12.7', src: '[biến thể mới]', type: 'choice',
    prompt: 'Túi A có 1/2 của 12 000 đồng, túi B có 1/3 của 30 000 đồng. Túi nào nhiều tiền hơn?',
    visual: moneyTable([['A', '1/2 của 12 000 đồng', '?'], ['B', '1/3 của 30 000 đồng', '?']]),
    hint: 'Hai túi lấy phân số của hai số khác nhau. Con hãy tính ra số tiền.',
    choices: [
      W('Túi A', 'QUY', '1/2 > 1/3 nhưng 12 000 đồng và 30 000 đồng là hai số khác nhau, nên phải tính ra tiền mới so sánh được.'),
      R('Túi B'),
      W('Bằng nhau', 'NHỚ', '12 000 ÷ 2 = 6 000 và 30 000 ÷ 3 = 10 000. Hai số tiền khác nhau.'),
    ],
    explain: { steps: draft([
      { text: 'So sánh 1/2 và 1/3 chỉ dùng khi lấy phân số của cùng một số. Ở đây hai số khác nhau nên phải tính tiền.', lines: [{ text: 'Túi A: 1/2 của 12 000 đồng', note: 'hai số khác nhau' }, { text: 'Túi B: 1/3 của 30 000 đồng' }] },
      { text: 'Túi A: 12 000 ÷ 2 = 6 000 đồng.', lines: [{ text: '12 000 ÷ 2 = 6 000 đồng', note: 'túi A' }] },
      { text: 'Túi B: 30 000 ÷ 3 = 10 000 đồng.', lines: [{ text: '30 000 ÷ 3 = 10 000 đồng', note: 'túi B' }] },
      { text: 'Vậy đáp án là Túi B: 10 000 đồng > 6 000 đồng, nên túi B nhiều tiền hơn.', lines: [{ text: '10 000 > 6 000 → Túi B', color: INK }], mark: 'good' },
    ]) },
  },

  // Mỗi bộ sinh: `covers` = id bài cố định cùng kỹ năng/cùng type. Số liệu, tên bạn, ngữ cảnh đổi theo seed (1..16).
  generators: [
    // g12.1: k/n của N
    {
      id: 'g12.1', covers: ['12.3'],
      make(rng) {
        const n = pick(rng, [3, 4, 5, 6, 8, 10]);
        const m = int(rng, 2, 12);
        const k = int(rng, 2, n - 1);
        const N = n * m;
        const { u, full } = pick(rng, [{ u: 'm', full: 'mét' }, { u: 'kg', full: 'ki-lô-gam' }, { u: 'l', full: 'lít' }]);
        const ans = m * k;
        const hints = [];
        const add = (v, code, why) => { if (!hints.some((h) => h.match === String(v)) && v !== ans) hints.push({ match: String(v), code, why }); };
        add(m, 'QUY', `Mới tìm được 1/${n} của ${N} là ${m}. ${fr(k, n)} là ${k} phần, nên nhân thêm ${k}.`);
        add(N * n, 'NGƯỢC', `Con thử chia ${N} cho mẫu số ${n} trước nhé, rồi mới nhân với tử số.`);
        add(N * k, 'NGƯỢC', `Con thử chia ${N} cho mẫu số ${n} trước nhé, rồi mới nhân với ${k}.`);
        return {
          id: 'g12.1', src: '[biến thể mới]', type: 'numpad',
          prompt: `${fr(k, n)} của ${N} ${u} là bao nhiêu ${full}?`,
          hint: 'Chia cho mẫu số trước, rồi nhân với tử số.',
          slots: [{ label: `${fr(k, n)} của ${N} ${u} =`, answer: String(ans), unit: u }],
          wrongHints: hints, meta: { n, m, k, N },
          explain: { steps: fracOfSteps(N, n, k, u, `Vậy ${fr(k, n)} của ${N} ${u} là ${ans} ${u}.`) },
        };
      },
      solve(item) { const { n, k, N } = item.meta; return String((N / n) * k); },
    },

    // g12.2: so sánh phân số tử số 1 (lớn nhất / bé nhất)
    {
      id: 'g12.2', covers: ['12.1'],
      make(rng) {
        const pool = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const dens = shuffle(rng, pool).slice(0, 4).sort((x, y) => x - y);
        const largest = rng.next() < 0.5;
        const mn = dens[0], mx = dens[3];
        const target = largest ? mn : mx;
        const choices = shuffle(rng, dens.map((d) => {
          if (d === target) return R(fr(1, d));
          if (d === (largest ? mx : mn)) {
            return largest
              ? W(fr(1, d), 'QUY', `Mẫu ${d} chia ra ${d} phần nên mỗi phần rất nhỏ. Mẫu càng lớn thì phân số càng bé, nên 1/${d} là bé nhất chứ không phải lớn nhất.`)
              : W(fr(1, d), 'QUY', `Mẫu ${d} chỉ chia ${d} phần nên mỗi phần to nhất. 1/${d} là phân số LỚN nhất chứ không phải bé nhất.`);
          }
          return largest
            ? W(fr(1, d), 'QUY', `Còn phân số lớn hơn: 1/${mn} có mẫu bé hơn nên mỗi phần to hơn 1/${d}.`)
            : W(fr(1, d), 'QUY', `Còn phân số bé hơn: 1/${mx} có mẫu lớn hơn nên mỗi phần bé hơn 1/${d}.`);
        }));
        const word = largest ? 'LỚN nhất' : 'BÉ nhất';
        return {
          id: 'g12.2', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: `Trong các phân số ${dens.map((d) => fr(1, d)).join(', ')}, phân số nào ${word}?`,
          hint: 'Chia nhiều phần hơn thì mỗi phần to hơn hay bé hơn?',
          choices, meta: { dens, largest },
          explain: { steps: [
            { text: 'Các phân số đều có tử số 1. Mẫu số càng lớn thì chia càng nhiều phần, mỗi phần càng bé.', visual: { kind: 'fracwall', rows: mx, highlight: dens.map((d) => ({ row: d })) } },
            { text: `Mẫu số từ bé đến lớn: ${dens.join(', ')}. Nên từ lớn đến bé là ${dens.map((d) => fr(1, d)).join(' > ')}.`, visual: { kind: 'fracwall', rows: mx, highlight: dens.map((d) => ({ row: d })), compare: [mn, mx] } },
            { text: `Vậy phân số ${word} là ${fr(1, target)}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { dens, largest } = item.meta; return fr(1, largest ? Math.min(...dens) : Math.max(...dens)); },
    },

    // g12.3: so sánh hai túi tiền / hai sợi dây / hai bao gạo (choice) — bên có phân số lớn hơn khi thì nhiều hơn, khi thì ít hơn
    {
      id: 'g12.3', covers: ['12.7'],
      make(rng) {
        const S = bagSetup(rng);
        const { ctx, bags, nm, more, less, p, q } = S;
        const choices = shuffle(rng, [
          R(`${ctx.key} ${nm[more]}`),
          W(`${ctx.key} ${nm[less]}`, 'QUY', `Hai ${ctx.noun} lấy phân số của hai số khác nhau (${ctx.fmt(bags[0].total)} và ${ctx.fmt(bags[1].total)}) nên không thể chỉ nhìn phân số. Tính ra: ${ctx.noun} ${nm[less]} ${ctx.verb} ${ctx.fmt(S.amt(less))}, ${ctx.noun} ${nm[more]} ${ctx.verb} ${ctx.fmt(S.amt(more))}.`),
          W('Bằng nhau', 'NHỚ', `${ctx.fmt(bags[0].total)} chia ${bags[0].den} được ${ctx.fmt(S.amt(0))}; ${ctx.fmt(bags[1].total)} chia ${bags[1].den} được ${ctx.fmt(S.amt(1))}. Hai số khác nhau.`),
        ]);
        return {
          id: 'g12.3', src: '[biến thể mới]', type: 'choice',
          prompt: `${S.cap} A ${ctx.verb} 1/${bags[0].den} của ${ctx.fmt(bags[0].total)}, ${ctx.noun} B ${ctx.verb} 1/${bags[1].den} của ${ctx.fmt(bags[1].total)}. ${ctx.ask}`,
          visual: S.table(false),
          hint: 'Hai bên lấy phân số của hai số khác nhau. Con hãy tính ra số đo.',
          choices, meta: { bags, key: ctx.key },
          explain: { steps: S.draftSteps(`Vậy đáp án là ${ctx.key} ${nm[more]} (${ctx.fmt(S.amt(more))} so với ${ctx.fmt(S.amt(less))}).`, `${ctx.fmt(S.amt(more))} > ${ctx.fmt(S.amt(less))} → ${ctx.key} ${nm[more]}`) },
        };
      },
      solve(item) { const { bags } = item.meta; const x = bags[0].total / bags[0].den, y = bags[1].total / bags[1].den; return x === y ? 'Bằng nhau' : `${item.meta.key} ${x > y ? 'A' : 'B'}`; },
    },

    // g12.4: chia đều m cái bánh cho n bạn
    {
      id: 'g12.4', covers: ['12.6'],
      make(rng) {
        let m, n, guard = 0;
        do { m = int(rng, 2, 6); n = int(rng, m + 1, 9); guard++; } while (n === m * m && guard < 50);
        const name = pick(rng, ['Lan', 'Mai', 'Nam', 'Hà']);
        const [obj, cnt] = pick(rng, [['cái bánh', 'cái bánh'], ['quả cam', 'quả cam'], ['tờ giấy màu', 'tờ giấy']]);
        const choices = shuffle(rng, [
          R(`${m}/${n} ${cnt}`),
          W(`${n}/${m} ${cnt}`, 'NGƯỢC', `Tử số là số ${cnt} (${m}), mẫu số là số bạn (${n}). ${n}/${m} lớn hơn 1, mà chỉ có ${m} ${cnt} cho ${n} bạn thì mỗi bạn chưa được 1.`),
          W(`1/${n} ${cnt}`, 'QUY', `Mỗi bạn lấy 1 phần của mỗi ${cnt}, tức là ${m} phần chứ không phải 1 phần.`),
          W(`1/${m} ${cnt}`, 'NGƯỢC', `${m} là số ${cnt}, còn số bạn là ${n}. Mẫu số phải là số bạn chia: ${n}.`),
        ]);
        return {
          id: 'g12.4', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: `${name} chia đều ${m} ${obj} cho ${n} bạn. Mỗi bạn được bao nhiêu phần ${cnt}?`,
          hint: `Phân số là phép chia: ${m} ÷ ${n}.`,
          choices, meta: { m, n, cnt },
          explain: { steps: [
            { text: `Chia mỗi ${cnt} thành ${n} phần bằng nhau, mỗi phần là 1/${n}.`, visual: { kind: 'fracshape', den: n, num: 1, shape: 'rect', label: true } },
            { text: `Mỗi bạn lấy 1 phần của mỗi ${cnt}: được ${m} phần, mỗi phần 1/${n}, tức là ${m}/${n} ${cnt}.`, visual: { kind: 'fracshape', den: n, num: m, shape: 'rect', label: true, anim: 'fill' } },
            { text: `Phân số là phép chia: ${m} ÷ ${n} = ${m}/${n}.`, mark: 'good' },
            { text: `Vậy mỗi bạn được ${m}/${n} ${cnt}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { m, n, cnt } = item.meta; return `${m}/${n} ${cnt}`; },
    },

    // g12.5: HAI ô — phân số của một số (khác đơn vị)
    {
      id: 'g12.5', covers: ['12.3'],
      make(rng) {
        const UN = [{ u: 'm', full: 'mét' }, { u: 'kg', full: 'ki-lô-gam' }, { u: 'l', full: 'lít' }, { u: 'cm', full: 'xăng-ti-mét' }];
        const [ua, ub] = shuffle(rng, UN).slice(0, 2);
        const mk = () => { const n = pick(rng, [3, 4, 5, 6, 8, 10]); const m = int(rng, 2, 12); const k = int(rng, 2, n - 1); return { n, m, k, N: n * m, ans: m * k }; };
        const A = mk(); let B = mk(); let g = 0;
        while ((B.n === A.n && B.k === A.k && B.m === A.m) && g++ < 20) B = mk();
        const hints = [];
        const add = (match, why) => { if (match !== `${A.ans}|${B.ans}` && !hints.some((h) => h.match === match)) hints.push({ match, code: 'QUY', why }); };
        add(`${A.m}|${B.m}`, `Mới tìm được một phần (1/${A.n} và 1/${B.n}). Còn phải nhân với tử số: ô a) nhân ${A.k}, ô b) nhân ${B.k}.`);
        add(`${A.ans}|${B.m}`, `Ô a) đúng. Ô b) mới tìm được 1/${B.n} là ${B.m} ${ub.u}; ${B.k}/${B.n} là ${B.k} phần, nên nhân thêm ${B.k}.`);
        add(`${A.m}|${B.ans}`, `Ô b) đúng. Ô a) mới tìm được 1/${A.n} là ${A.m} ${ua.u}; ${A.k}/${A.n} là ${A.k} phần, nên nhân thêm ${A.k}.`);
        add(`${A.N * A.k}|${B.N * B.k}`, 'Con thử chia số đó cho mẫu số trước nhé, rồi mới nhân với tử số.');
        return {
          id: 'g12.5', src: '[biến thể mới]', type: 'numpad',
          prompt: `Tìm phân số của một số:\na) ${A.k}/${A.n} của ${A.N} ${ua.u} là bao nhiêu ${ua.full}?\nb) ${B.k}/${B.n} của ${B.N} ${ub.u} là bao nhiêu ${ub.full}?`,
          hint: 'Chia cho mẫu số trước, rồi nhân với tử số.',
          slots: [{ label: 'a)', answer: String(A.ans), unit: ua.u }, { label: 'b)', answer: String(B.ans), unit: ub.u }],
          wrongHints: hints, meta: { A: { n: A.n, k: A.k, N: A.N }, B: { n: B.n, k: B.k, N: B.N } },
          explain: { steps: draft([
            ...partGroups('a) ', A.k, A.n, A.N, ua.u),
            ...partGroups('b) ', B.k, B.n, B.N, ub.u),
            { text: `Vậy a) ${A.ans} ${ua.u}; b) ${B.ans} ${ub.u}. Nhớ: chia cho mẫu số trước, rồi nhân với tử số.`, lines: [{ text: `a) ${A.ans} ${ua.u}    b) ${B.ans} ${ub.u}`, color: INK }], mark: 'good' },
          ]) },
        };
      },
      solve(item) { const { A, B } = item.meta; return `${(A.N / A.n) * A.k}|${(B.N / B.n) * B.k}`; },
    },

    // g12.6: XẾP THỨ TỰ phân số (tử số 1, hoặc cùng mẫu số), tăng dần/giảm dần
    {
      id: 'g12.6', covers: ['12.2'],
      make(rng) {
        const family = rng.next() < 0.6 ? 'unit' : 'same';
        const desc = rng.next() < 0.6;
        const cnt = rng.next() < 0.7 ? 4 : 5;
        let fr;
        if (family === 'unit') fr = shuffle(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).slice(0, cnt).map((d) => ({ id: 'p' + d, num: 1, den: d }));
        else { const d = int(rng, 6, 12); fr = shuffle(rng, Array.from({ length: d - 1 }, (_, i) => i + 1)).slice(0, cnt).map((k) => ({ id: 'p' + k, num: k, den: d })); }
        const val = (f) => f.num / f.den;
        const sorted = fr.slice().sort((x, y) => (desc ? val(y) - val(x) : val(x) - val(y)));
        const rev = sorted.slice().reverse();
        const word = desc ? 'GIẢM dần (từ lớn đến bé)' : 'TĂNG dần (từ bé đến lớn)';
        const list = (arr) => arr.map((f) => `${f.num}/${f.den}`).join(', ');
        const dMax = Math.max(...fr.map((f) => f.den));
        const steps = family === 'unit'
          ? [
            { text: 'Các phân số đều có tử số 1: mẫu số càng bé thì phân số càng lớn.', visual: { kind: 'fracwall', rows: dMax, highlight: fr.map((f) => ({ row: f.den })) } },
            { text: `Mẫu số từ bé đến lớn là ${fr.map((f) => f.den).sort((x, y) => x - y).join(', ')}. Nên từ lớn đến bé là ${list(fr.slice().sort((x, y) => val(y) - val(x)))}.` },
            { text: `Vậy xếp ${desc ? 'giảm dần' : 'tăng dần'}: ${list(sorted)}.`, mark: 'good' },
          ]
          : [
            { text: `Các phân số đều có mẫu số ${fr[0].den}: tử số càng lớn thì phân số càng lớn.`, visual: { kind: 'fracshape', den: fr[0].den, num: Math.max(...fr.map((f) => f.num)), shape: 'bar', label: true } },
            { text: `Tử số từ bé đến lớn là ${fr.map((f) => f.num).sort((x, y) => x - y).join(', ')}. Nên từ bé đến lớn là ${list(fr.slice().sort((x, y) => val(x) - val(y)))}.` },
            { text: `Vậy xếp ${desc ? 'giảm dần' : 'tăng dần'}: ${list(sorted)}.`, mark: 'good' },
          ];
        return {
          id: 'g12.6', src: '[biến thể mới]', type: 'order',
          prompt: `Xếp các phân số theo thứ tự ${word}. Chạm lần lượt từng phân số.`,
          items: fr.map((f) => ({ id: f.id, text: `${f.num}/${f.den}` })),
          answer: sorted.map((f) => f.id),
          wrongHints: [{ match: rev.map((f) => f.id), code: 'QUY', why: family === 'unit' ? `Đây là xếp ngược lại: con đã coi mẫu số lớn là phân số lớn. Mẫu càng lớn thì phân số càng bé, nên cần xếp ${desc ? 'giảm' : 'tăng'} dần.` : `Đây là xếp ngược lại. Cùng mẫu số thì tử số lớn hơn là phân số lớn hơn, nên cần xếp ${desc ? 'giảm' : 'tăng'} dần.` }],
          hint: family === 'unit' ? 'Tử số đều là 1. Mẫu số bé thì phân số lớn.' : 'Mẫu số đều bằng nhau. Tử số lớn thì phân số lớn.',
          meta: { fr: fr.map((f) => ({ id: f.id, num: f.num, den: f.den })), desc },
          explain: { steps },
        };
      },
      solve(item) { const { fr, desc } = item.meta; return fr.slice().sort((x, y) => (desc ? y.num / y.den - x.num / x.den : x.num / x.den - y.num / y.den)).map((f) => f.id).join(','); },
    },

    // g12.7: ĐÚNG/SAI — so sánh hai túi/dây/bao lấy phân số của hai số khác nhau
    {
      id: 'g12.7', covers: ['12.4'],
      make(rng) {
        const S = bagSetup(rng);
        const { ctx, bags, nm, more, less } = S;
        const name = pick(rng, NAMES);
        const claimIdx = rng.next() < 0.5 ? 0 : 1;
        const other = 1 - claimIdx;
        const isTrue = claimIdx === more;
        const pre = isTrue ? 'Đúng' : 'Sai';
        const tX = bags[claimIdx].total, tY = bags[other].total;
        const dX = bags[claimIdx].den, dY = bags[other].den;
        const pv = (sh, lg) => (rng.next() < 0.5 ? sh : lg);
        const whyBoth = `Hai ${ctx.noun} lấy phân số của hai số khác nhau (${ctx.fmt(tX)} và ${ctx.fmt(tY)}), nên không thể chỉ so sánh phân số hay số ban đầu. Phải tính ra: ${ctx.noun} ${nm[claimIdx]} ${ctx.verb} ${ctx.fmt(S.amt(claimIdx))}, ${ctx.noun} ${nm[other]} ${ctx.verb} ${ctx.fmt(S.amt(other))}.`;
        const reasons = shuffle(rng, [
          { text: pv(`${pre}. Tính ra: ${ctx.fmt(S.amt(claimIdx))} và ${ctx.fmt(S.amt(other))}`, `${pre}. ${S.cap} ${nm[claimIdx]} ${ctx.verb} ${ctx.fmt(S.amt(claimIdx))}, ${ctx.noun} ${nm[other]} ${ctx.verb} ${ctx.fmt(S.amt(other))}`), correct: true },
          { text: pv(`${pre}, vì 1/${dX} ${dX < dY ? 'lớn hơn' : 'bé hơn'} 1/${dY}`, `${pre}, vì phân số 1/${dX} ${dX < dY ? 'lớn hơn' : 'bé hơn'} phân số 1/${dY}`), correct: false, code: 'QUY', why: whyBoth },
          { text: pv(`${pre}, vì ${ctx.fmt(tX)} ${tX > tY ? 'lớn hơn' : 'bé hơn'} ${ctx.fmt(tY)}`, `${pre}, vì số ban đầu ${ctx.fmt(tX)} ${tX > tY ? 'lớn hơn' : 'bé hơn'} ${ctx.fmt(tY)}`), correct: false, code: 'QUY', why: whyBoth },
        ]);
        return {
          id: 'g12.7', src: '[biến thể mới]', type: 'tf',
          prompt: `${S.cap} A ${ctx.verb} 1/${bags[0].den} của ${ctx.fmt(bags[0].total)}, ${ctx.noun} B ${ctx.verb} 1/${bags[1].den} của ${ctx.fmt(bags[1].total)}. ${name} nói: "${S.cap} ${nm[claimIdx]} ${ctx.adj} ${ctx.noun} ${nm[other]}." ${name} nói đúng hay SAI?`,
          answer: isTrue, reasons,
          visual: S.table(false),
          hint: 'Hai bên lấy phân số của hai số khác nhau. Con thử tính ra số đo.',
          whyWrong: whyBoth,
          meta: { bags, claimIdx },
          explain: { steps: S.draftSteps(isTrue ? `Vậy ${name} nói ĐÚNG: ${ctx.noun} ${nm[more]} ${ctx.adj} (${ctx.fmt(S.amt(more))} > ${ctx.fmt(S.amt(less))}).` : `Vậy ${name} nói SAI: ${ctx.noun} ${nm[more]} mới ${ctx.adj} (${ctx.fmt(S.amt(more))} > ${ctx.fmt(S.amt(less))}).`, `${ctx.fmt(S.amt(more))} > ${ctx.fmt(S.amt(less))} → ${ctx.noun} ${nm[more]} ${ctx.adj}`) },
        };
      },
      solve(item) { const { bags, claimIdx } = item.meta; const a = bags.map((b) => b.total / b.den); return String(a[claimIdx] > a[1 - claimIdx]); },
    },

    // g12.8: CHỌN HÌNH tô đúng k/n (mỗi lựa chọn là một hình khác loại)
    {
      id: 'g12.8', covers: ['12.5'],
      make(rng) {
        const n = int(rng, 3, 9), k = int(rng, 1, n - 1);
        const specs = [];
        const key = (s) => `${s.den}/${s.num}/${s.cut}`;
        const push = (s) => { if (!specs.some((x) => key(x) === key(s)) && !(s.den === n && s.num === k && s.cut === 'equal')) specs.push(s); };
        const cand = [
          { den: n, num: k, cut: 'unequal', code: 'QUY', why: 'Hình này chia các phần KHÔNG bằng nhau. Phân số chỉ đúng khi các phần bằng nhau.' },
          { den: n + 1 <= 10 ? n + 1 : n - 1, num: k, cut: 'equal', code: 'ĐẾM', why: `Hình này chia ${n + 1 <= 10 ? n + 1 : n - 1} phần bằng nhau và tô ${k} phần, nên là ${k}/${n + 1 <= 10 ? n + 1 : n - 1}, không phải ${k}/${n}.` },
          { den: n, num: k + 1 < n ? k + 1 : k - 1, cut: 'equal', code: 'ĐẾM', why: `Hình này chia ${n} phần bằng nhau nhưng tô ${k + 1 < n ? k + 1 : k - 1} phần, nên là ${k + 1 < n ? k + 1 : k - 1}/${n}.` },
          { den: n, num: n - k, cut: 'equal', code: 'ĐẾM', why: `Hình này chia ${n} phần bằng nhau và tô ${n - k} phần, nên là ${n - k}/${n}. Con hãy đếm số phần được tô.` },
        ];
        cand.forEach((c) => { if (!specs.some((x) => key(x) === key(c)) && !(c.den === n && c.num === k && c.cut === 'equal')) specs.push(c); });
        const wrongs = specs.slice(0, 3);
        const shapes = shuffle(rng, [['rect', 'Hình chữ nhật'], ['circle', 'Hình tròn'], ['bar', 'Thanh ngang'], ['jar', 'Bình nước']]);
        const all = shuffle(rng, [{ den: n, num: k, cut: 'equal', ok: true }, ...wrongs]);
        const choices = all.map((s, i) => {
          const visual = { kind: 'fracshape', den: s.den, num: s.num, shape: shapes[i][0], cut: s.cut };
          return s.ok ? { text: shapes[i][1], correct: true, visual } : { text: shapes[i][1], code: s.code, why: s.why, visual };
        });
        const sh = (i) => shapes[i][0];
        const okShape = shapes[all.findIndex((s) => s.ok)][0];
        const lead = pick(rng, [`Hình nào đã tô đúng ${k}/${n}? Chạm vào hình đó.`, `Con hãy chọn hình đã tô ${k}/${n}.`, `Hình nào thể hiện phân số ${k}/${n}? Chạm vào hình đó.`]);
        return {
          id: 'g12.8', src: '[biến thể mới]', type: 'choice', layout: 'grid2',
          prompt: lead,
          hint: 'Đếm số phần bằng nhau và số phần được tô.',
          choices, meta: { n, k },
          explain: { steps: [
            { text: `Muốn có ${k}/${n}: chia hình thành ${n} phần BẰNG NHAU rồi tô ${k} phần.`, visual: { kind: 'fracshape', den: n, num: k, shape: okShape, label: true, anim: 'fill' } },
            { text: `Hình chia các phần không bằng nhau thì không viết ${k}/${n} được. Hình chia số phần khác ${n}, hoặc tô số phần khác ${k}, cũng không đúng.`, mark: 'bad', visual: { kind: 'fracshape', den: n, num: k, shape: 'rect', cut: 'unequal' } },
            { text: `Vậy đáp án là ${shapes[all.findIndex((x) => x.ok)][1]}: hình chia ${n} phần bằng nhau và tô ${k} phần.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { n, k } = item.meta; return item.choices.find((c) => c.visual.den === n && c.visual.num === k && c.visual.cut !== 'unequal').text; },
    },
  ],
};

// "Làm nóng" bộ số ngẫu nhiên: các seed liền kề cho số đầu tiên gần nhau, nên bỏ vài số đầu để bài khác hẳn nhau.
topic.generators.forEach((g) => { const mk = g.make; g.make = (rng) => { rng.next(); rng.next(); rng.next(); return mk(rng); }; });
export default topic;
