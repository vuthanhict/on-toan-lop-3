import { pick, int, shuffle } from '../core/rng.js';

const R = (text) => ({ text, correct: true });
const W = (text, code, why) => ({ text, code, why });
const fr = (n, d) => `${n}/${d}`;
const moneyTable = (rows, highlight) => ({ kind: 'table', headers: ['Túi', 'Phân số', 'Số tiền'], rows, ...(highlight ? { highlight } : {}) });

export default {
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
      text: 'Chia đều 3 cái bánh cho 4 bạn: mỗi bạn được 3 ÷ 4 = 3/4 cái bánh. Phân số là phép chia: tử số là số bánh, mẫu số là số bạn.',
      visual: { kind: 'fracshape', den: 4, num: 3, shape: 'rect', label: true, anim: 'fill' },
    },
    {
      text: 'So sánh 1/3 của 24 000 đồng và 1/4 của 40 000 đồng: không thể chỉ nhìn 1/3 > 1/4. Phải tính tiền: 8 000 đồng và 10 000 đồng. Vậy túi B nhiều tiền hơn.',
      visual: moneyTable([['A', '1/3 của 24 000 đồng', '8 000 đồng'], ['B', '1/4 của 40 000 đồng', '10 000 đồng']], [[1, 2]]),
    },
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
      explain: { steps: [
        { text: 'a) 1/4 của 80 m: chia 80 thành 4 phần bằng nhau, 80 ÷ 4 = 20 m.', visual: { kind: 'fracshape', den: 4, num: 1, shape: 'bar', label: true, anim: 'fill' } },
        { text: '3/4 là 3 phần như vậy: 20 × 3 = 60 m.', mark: 'good', visual: { kind: 'fracshape', den: 4, num: 3, shape: 'bar', label: true } },
        { text: 'b) 1/8 của 64 kg: 64 ÷ 8 = 8 kg. 2/8 là 2 phần: 8 × 2 = 16 kg.', mark: 'good', visual: { kind: 'fracshape', den: 8, num: 2, shape: 'bar', label: true } },
        { text: 'Vậy a) 60 m; b) 16 kg. Nhớ: chia cho mẫu số trước, rồi nhân với tử số.', mark: 'good' },
      ] },
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
      explain: { steps: [
        { text: 'So sánh 1/3 và 1/4 chỉ đúng khi lấy phân số của cùng một số. Ở đây hai số khác nhau nên phải tính tiền.', visual: moneyTable([['A', '1/3 của 24 000 đồng', '?'], ['B', '1/4 của 40 000 đồng', '?']]) },
        { text: 'Túi A: 24 000 ÷ 3 = 8 000, được 8 000 đồng.', visual: moneyTable([['A', '1/3 của 24 000 đồng', '8 000 đồng'], ['B', '1/4 của 40 000 đồng', '?']], [[0, 2]]) },
        { text: 'Túi B: 40 000 ÷ 4 = 10 000, được 10 000 đồng.', visual: moneyTable([['A', '1/3 của 24 000 đồng', '8 000 đồng'], ['B', '1/4 của 40 000 đồng', '10 000 đồng']], [[1, 2]]) },
        { text: 'Vậy 10 000 đồng > 8 000 đồng: túi B nhiều tiền hơn, Nam nói SAI.', mark: 'good' },
      ] },
      tags: ['so sánh', 'của một số'],
    },
    {
      id: '12.5', src: '[ngoài tài liệu]', type: 'choice', layout: 'grid2',
      prompt: 'Hình nào đã tô đúng 3/4? Chạm vào hình đó.',
      hint: 'Đếm số phần bằng nhau và số phần được tô.',
      choices: [
        { text: 'Hình A', correct: true, visual: { kind: 'fracshape', den: 4, num: 3, shape: 'rect', cut: 'equal' } },
        { text: 'Hình B', code: 'QUY', why: 'Hình B chia 4 phần KHÔNG bằng nhau. Phân số chỉ đúng khi các phần bằng nhau.', visual: { kind: 'fracshape', den: 4, num: 3, shape: 'rect', cut: 'unequal' } },
        { text: 'Hình C', code: 'ĐẾM', why: 'Hình C chia 3 phần và tô cả 3 phần: đó là 3/3, cả hình, không phải 3/4.', visual: { kind: 'fracshape', den: 3, num: 3, shape: 'rect', cut: 'equal' } },
        { text: 'Hình D', code: 'ĐẾM', why: 'Hình D chỉ tô 1 trong 4 phần bằng nhau: đó là 1/4.', visual: { kind: 'fracshape', den: 4, num: 1, shape: 'rect', cut: 'equal' } },
      ],
      explain: { steps: [
        { text: 'Muốn có 3/4: chia hình thành 4 phần BẰNG NHAU rồi tô 3 phần.', visual: { kind: 'fracshape', den: 4, num: 3, shape: 'rect', label: true, anim: 'fill' } },
        { text: 'Hình B chia 4 phần không bằng nhau nên không viết 3/4 được.', mark: 'bad', visual: { kind: 'fracshape', den: 4, num: 3, shape: 'rect', cut: 'unequal' } },
        { text: 'Vậy hình A đã tô 3/4. Hình C là 3/3 (cả hình), hình D chỉ là 1/4.', mark: 'good' },
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
    explain: { steps: [
      { text: 'Túi A: 12 000 ÷ 2 = 6 000 đồng. Túi B: 30 000 ÷ 3 = 10 000 đồng.', visual: moneyTable([['A', '1/2 của 12 000 đồng', '6 000 đồng'], ['B', '1/3 của 30 000 đồng', '10 000 đồng']]) },
      { text: '1/2 > 1/3 chỉ dùng khi lấy phân số của cùng một số. Ở đây hai số khác nhau nên phải so sánh số tiền: 10 000 đồng > 6 000 đồng.', mark: 'bad' },
      { text: 'Vậy túi B nhiều tiền hơn.', mark: 'good', visual: moneyTable([['A', '1/2 của 12 000 đồng', '6 000 đồng'], ['B', '1/3 của 30 000 đồng', '10 000 đồng']], [[1, 2]]) },
    ] },
  },

  generators: [
    // g12.1: k/n của N
    {
      id: 'g12.1',
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
          explain: { steps: [
            { text: `1/${n} của ${N}: chia ${N} thành ${n} phần bằng nhau, ${N} ÷ ${n} = ${m}.`, visual: { kind: 'fracshape', den: n, num: 1, shape: 'bar', label: true, anim: 'fill' } },
            { text: `${fr(k, n)} là ${k} phần như vậy: ${m} × ${k} = ${ans}.`, visual: { kind: 'fracshape', den: n, num: k, shape: 'bar', label: true } },
            { text: `Vậy ${fr(k, n)} của ${N} ${u} là ${ans} ${u}.`, mark: 'good' },
          ] },
        };
      },
      solve(item) { const { n, k, N } = item.meta; return String((N / n) * k); },
    },

    // g12.2: so sánh phân số tử số 1 (lớn nhất / bé nhất)
    {
      id: 'g12.2',
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

    // g12.3: so sánh hai túi tiền
    {
      id: 'g12.3',
      make(rng) {
        const p = int(rng, 2, 5), q = p + int(rng, 1, 3);
        const a = int(rng, 4, 12), b = a + int(rng, 1, 6);
        // số tiền tính theo nghìn đồng: túi có phân số lớn (1/p) chứa a nghìn; túi có phân số bé (1/q) chứa b nghìn (nhiều hơn)
        const bigIdx = rng.next() < 0.5 ? 0 : 1;
        const bags = [null, null];
        bags[bigIdx] = { den: p, total: p * a };
        bags[1 - bigIdx] = { den: q, total: q * b };
        const nm = ['A', 'B'];
        const amt = (i) => bags[i].total / bags[i].den;
        const moreIdx = 1 - bigIdx;
        const mo = (v) => `${v} 000 đồng`; // số tiền tính theo nghìn đồng
        const rows = (show) => bags.map((bg, i) => [nm[i], `1/${bg.den} của ${mo(bg.total)}`, show ? mo(amt(i)) : '?']);
        const choices = shuffle(rng, [
          R(`Túi ${nm[moreIdx]}`),
          W(`Túi ${nm[bigIdx]}`, 'QUY', `1/${p} > 1/${q}, nhưng hai túi lấy từ hai số khác nhau (${mo(bags[0].total)} và ${mo(bags[1].total)}). Tính ra: túi ${nm[bigIdx]} có ${mo(a)}, túi ${nm[moreIdx]} có ${mo(b)}.`),
          W('Bằng nhau', 'NHỚ', `${mo(bags[0].total)} chia ${bags[0].den} được ${mo(amt(0))}; ${mo(bags[1].total)} chia ${bags[1].den} được ${mo(amt(1))}. Hai số tiền khác nhau.`),
        ]);
        return {
          id: 'g12.3', src: '[biến thể mới]', type: 'choice',
          prompt: `Túi A có 1/${bags[0].den} của ${mo(bags[0].total)}, túi B có 1/${bags[1].den} của ${mo(bags[1].total)}. Túi nào nhiều tiền hơn?`,
          visual: { kind: 'table', headers: ['Túi', 'Phân số', 'Số tiền'], rows: rows(false) },
          hint: 'Hai túi lấy phân số của hai số khác nhau. Con hãy tính ra số tiền.',
          choices, meta: { bags },
          explain: { steps: [
            { text: `So sánh 1/${p} và 1/${q} chỉ dùng được khi lấy phân số của cùng một số. Ở đây hai số khác nhau, nên phải tính tiền.`, visual: { kind: 'table', headers: ['Túi', 'Phân số', 'Số tiền'], rows: rows(false) } },
            { text: `Túi A: ${mo(bags[0].total)} ÷ ${bags[0].den} = ${mo(amt(0))}. Túi B: ${mo(bags[1].total)} ÷ ${bags[1].den} = ${mo(amt(1))}.`, visual: { kind: 'table', headers: ['Túi', 'Phân số', 'Số tiền'], rows: rows(true) } },
            { text: `Vậy túi ${nm[moreIdx]} nhiều tiền hơn (${mo(amt(moreIdx))} > ${mo(amt(bigIdx))}).`, mark: 'good', visual: { kind: 'table', headers: ['Túi', 'Phân số', 'Số tiền'], rows: rows(true), highlight: [[moreIdx, 2]] } },
          ] },
        };
      },
      solve(item) { const { bags } = item.meta; const x = bags[0].total / bags[0].den, y = bags[1].total / bags[1].den; return x === y ? 'Bằng nhau' : (x > y ? 'Túi A' : 'Túi B'); },
    },

    // g12.4: chia đều m cái bánh cho n bạn
    {
      id: 'g12.4',
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
  ],
};
