import { pick, int, shuffle } from '../core/rng.js';

// ---------- tiện ích ----------
const kindOf = (d) => (d < 90 ? 'nhọn' : d === 90 ? 'vuông' : 'tù');
const kindText = (d) => `góc ${kindOf(d)}`;
const ang = (deg, extra = {}) => ({ kind: 'angle', deg, ...extra });
const cmp = (arr, extra = {}) => ({ kind: 'angle', compare: arr, ...extra });
function mkChoices(rng, correctText, wrongs) {
  const seen = new Set([correctText]);
  const ws = [];
  for (const w of wrongs) {
    if (seen.has(w.text)) continue;
    seen.add(w.text);
    ws.push({ text: w.text, code: w.code, why: w.why });
  }
  return shuffle(rng, [{ text: correctText, correct: true }, ...ws]);
}

// ---------- bộ sinh ----------
// g14.1: phân loại 1 góc đã cho số đo
const g1 = {
  id: 'g14.1',
  make(rng) {
    const r = int(rng, 1, 6);
    let d;
    if (r === 1) d = 90;
    else if (r <= 3) d = int(rng, 4, 17) * 5 + (rng.next() < 0.3 ? 3 : 0); // nhọn
    else d = int(rng, 19, 33) * 5 + (rng.next() < 0.3 ? 2 : 0); // tù
    const kind = kindOf(d);
    const correct = kindText(d);
    const cmpTxt = d < 90 ? 'bé hơn' : d === 90 ? 'đúng bằng' : 'lớn hơn';
    const whyFor = (k) => {
      if (k === 'nhọn') return `Góc nhọn phải bé hơn 90°. ${d}° ${cmpTxt} 90°.`;
      if (k === 'vuông') return `Chỉ góc đúng 90° mới là góc vuông. ${d}° ${cmpTxt} 90°${Math.abs(d - 90) <= 15 ? ', dù nhìn có vẻ gần' : ''}.`;
      return `Góc tù phải lớn hơn 90°. ${d}° ${cmpTxt} 90°.`;
    };
    const wrongs = ['nhọn', 'vuông', 'tù'].filter((k) => k !== kind).map((k) => ({ text: `góc ${k}`, code: 'QUY', why: whyFor(k) }));
    return {
      id: 'g14.1', src: '[biến thể mới]', type: 'choice',
      prompt: `Góc A có số đo ${d}° (xem hình). Đây là góc gì?`,
      visual: ang(d, { label: 'A' }),
      hint: 'So số đo với mốc 90° (góc vuông).',
      choices: mkChoices(rng, correct, wrongs),
      explain: {
        steps: [
          { text: 'Mốc để so sánh là góc vuông 90°. Bé hơn 90° là nhọn, lớn hơn 90° là tù.', visual: cmp([{ label: 'nhọn', deg: 50 }, { label: 'vuông', deg: 90 }, { label: 'tù', deg: 130 }], { name: true }) },
          { text: `${d}° ${d < 90 ? 'bé hơn' : d === 90 ? 'đúng bằng' : 'lớn hơn'} 90°.`, visual: ang(d, { label: 'A', anim: 'open' }) },
          { text: `Vậy góc A là ${correct}. Đáp án là ${correct}.`, visual: ang(d, { label: 'A', name: true }) },
        ],
      },
      meta: { d },
    };
  },
  solve(item) { return kindText(item.meta.d); },
};

// g14.2: xếp thứ tự các góc
const g2 = {
  id: 'g14.2',
  make(rng) {
    const count = int(rng, 4, 5);
    const degs = rng.next() < 0.5 ? [90] : [];
    while (degs.length < count) {
      const d = int(rng, 6, 34) * 5; // 30..170
      if (degs.every((x) => Math.abs(x - d) >= 10)) degs.push(d);
    }
    const list = degs;
    const desc = rng.next() < 0.5;
    const sorted = list.slice().sort((a, b) => (desc ? b - a : a - b));
    const answer = sorted.map((d) => 'a' + d);
    let chips;
    do { chips = shuffle(rng, list).map((d) => ({ id: 'a' + d, text: `Góc ${d}°` })); } while (chips.map((c) => c.id).join() === answer.join());
    const asc = list.slice().sort((a, b) => (desc ? a - b : b - a)).map((d) => 'a' + d);
    const bigSmall = sorted.map((d) => `${d}°`).join(', ');
    return {
      id: 'g14.2', src: '[biến thể mới]', type: 'order',
      prompt: desc ? 'Xếp các góc theo độ lớn từ LỚN đến BÉ (chạm góc lớn nhất trước).' : 'Xếp các góc theo độ lớn từ BÉ đến LỚN (chạm góc bé nhất trước).',
      visual: cmp(list.slice().sort((a, b) => a - b).map((d) => ({ label: `${d}°`, deg: d }))),
      hint: desc ? 'Góc tù lớn hơn góc vuông, góc vuông lớn hơn góc nhọn.' : 'Góc nhọn bé hơn góc vuông, góc vuông bé hơn góc tù.',
      items: chips,
      answer,
      wrongHints: [{ match: asc, code: 'ĐỌC', why: `Đề yêu cầu xếp từ ${desc ? 'LỚN đến BÉ' : 'BÉ đến LỚN'}. Có thể con đã xếp ngược lại.` }],
      explain: {
        steps: [
          { text: 'Phân loại trước: số đo bé hơn 90° là nhọn, lớn hơn 90° là tù (đúng 90° là vuông).', visual: cmp(list.slice().sort((a, b) => a - b).map((d) => ({ label: `${d}°`, deg: d })), { name: true }) },
          { text: `So sánh số đo, xếp ${desc ? 'từ lớn đến bé' : 'từ bé đến lớn'}: ${bigSmall}.` },
          { text: `Đáp án là ${bigSmall}.` },
        ],
      },
      meta: { list, desc },
    };
  },
  solve(item) {
    const { list, desc } = item.meta;
    return list.slice().sort((a, b) => (desc ? b - a : a - b)).map((d) => 'a' + d).join(',');
  },
};

// g14.3: ước lượng số đo của góc vẽ
const g3 = {
  id: 'g14.3',
  make(rng) {
    const acute = rng.next() < 0.5;
    const d = acute ? int(rng, 5, 14) * 5 : int(rng, 22, 31) * 5; // 25..70 hoặc 110..155
    const cand = [];
    for (let c = 15; c <= 170; c += 5) {
      if (Math.abs(c - d) >= 30 && c !== 90) cand.push(c);
    }
    const a = pick(rng, cand);
    const cand2 = cand.filter((c) => Math.abs(c - a) >= 30);
    const b = pick(rng, cand2);
    const why = (c) => {
      const same = kindOf(c) === kindOf(d);
      if (!same) return `${c}° là góc ${kindOf(c)}, nhưng góc A trong hình là góc ${kindOf(d)}.`;
      return c > d ? `${c}° mở rộng hơn góc A trong hình.` : `${c}° mở hẹp hơn góc A trong hình.`;
    };
    const correct = `${d}°`;
    return {
      id: 'g14.3', src: '[biến thể mới]', type: 'choice',
      prompt: `Góc A trong hình là góc ${kindOf(d)}. Số đo nào hợp lí nhất?`,
      visual: ang(d, { label: 'A' }),
      hint: 'So với các mốc 45°, 90°, 135°.',
      choices: mkChoices(rng, correct, [
        { text: `${a}°`, code: 'QUY', why: why(a) },
        { text: `${b}°`, code: 'QUY', why: why(b) },
      ]),
      explain: {
        steps: [
          { text: `Góc A là góc ${kindOf(d)}: ${acute ? 'bé hơn 90°' : 'lớn hơn 90°'}. Loại các số không hợp.`, visual: cmp([{ label: '45°', deg: 45 }, { label: '90°', deg: 90 }, { label: '135°', deg: 135 }]) },
          { text: `Góc A mở ${acute ? 'hẹp' : 'rộng'} gần như ${d}°.`, visual: ang(d, { label: 'A', anim: 'open' }) },
          { text: `Đáp án là ${correct}.` },
        ],
      },
      meta: { d },
    };
  },
  solve(item) { return `${item.meta.d}°`; },
};

// g14.4: kim đồng hồ tạo góc gì
const g4 = {
  id: 'g14.4',
  make(rng) {
    const h = pick(rng, [1, 2, 3, 4, 5, 7, 8, 9, 10, 11]);
    const n = Math.min(h, 12 - h); // số "giờ" giữa hai kim, lấy phía ngắn
    const d = n * 30;
    const correct = kindText(d);
    const whyFor = (k) => `Mỗi khoảng giờ là 30°: ${n} khoảng giờ là ${n} × 30° = ${d}°. ${d}° ${d < 90 ? 'bé hơn' : d === 90 ? 'bằng' : 'lớn hơn'} 90° nên đây là góc ${kindOf(d)}, không phải góc ${k}.`;
    const wrongs = ['nhọn', 'vuông', 'tù'].filter((k) => k !== kindOf(d)).map((k) => ({ text: `góc ${k}`, code: 'QUY', why: whyFor(k) }));
    return {
      id: 'g14.4', src: '[biến thể mới]', type: 'choice',
      prompt: `Lúc ${h} giờ đúng, hai kim đồng hồ tạo thành một góc (lấy góc nhỏ). Đó là góc gì? (Mỗi khoảng giờ trên đồng hồ là 30°.)`,
      visual: { kind: 'clock', h, m: 0 },
      hint: 'Kim phút chỉ số 12. Đếm số giờ giữa hai kim theo đường ngắn.',
      choices: mkChoices(rng, correct, wrongs),
      explain: {
        steps: [
          { text: `Kim phút chỉ số 12, kim giờ chỉ số ${h}. Đi đường ngắn giữa hai kim có ${n} khoảng giờ.`, visual: { kind: 'clock', h, m: 0 } },
          { text: `Mỗi khoảng giờ là 30°, nên góc là ${n} × 30° = ${d}°.`, visual: ang(d, { label: 'O', anim: 'open' }) },
          { text: `${d}° ${d < 90 ? 'bé hơn' : d === 90 ? 'bằng' : 'lớn hơn'} 90°. Đáp án là ${correct}.`, visual: ang(d, { label: 'O', name: true }) },
        ],
      },
      meta: { h },
    };
  },
  solve(item) {
    const h = item.meta.h;
    const d = (h <= 6 ? h : 12 - h) * 30;
    return d < 90 ? 'góc nhọn' : d === 90 ? 'góc vuông' : 'góc tù';
  },
};

// ---------- chủ đề ----------
export default {
  id: 'cd14', no: 14, day: 5, title: 'Góc nhọn, góc vuông, góc tù', short: 'Góc', icon: '📐',
  intro: 'So góc với góc vuông 90°: bé hơn là nhọn, lớn hơn là tù. Cạnh dài hay ngắn không đổi độ lớn của góc.',

  remember: [
    {
      text: 'Góc vuông là 90° (như góc quyển vở, góc êke). Góc nhọn bé hơn 90°. Góc tù lớn hơn 90° (nhưng chưa thẳng).',
      visual: cmp([{ label: 'nhọn', deg: 50 }, { label: 'vuông', deg: 90 }, { label: 'tù', deg: 130 }], { name: true }),
    },
    {
      text: 'Độ lớn của góc là độ MỞ giữa hai cạnh. Cạnh dài hay ngắn không làm góc to hơn.',
      visual: ang(60, { label: 'O', anim: 'open' }),
    },
    {
      text: 'Mốc ước lượng: 45° (nửa góc vuông), 90°, 135°. Xếp từ lớn đến bé: tù, vuông, nhọn.',
      visual: cmp([{ label: '45°', deg: 45 }, { label: '90°', deg: 90 }, { label: '135°', deg: 135 }]),
    },
  ],

  lesson: [
    { text: 'Góc vuông có số đo 90°, giống góc của quyển vở. Mình dùng nó làm mốc.', visual: ang(90, { label: 'O', show: 'square', name: true }) },
    { text: 'Mở hẹp hơn góc vuông thì là góc NHỌN. Ví dụ 50°.', visual: ang(50, { label: 'O', name: true, anim: 'open' }) },
    { text: 'Mở rộng hơn góc vuông nhưng chưa thẳng thì là góc TÙ. Ví dụ 130°.', visual: ang(130, { label: 'O', name: true, anim: 'open' }) },
    { text: 'Cẩn thận hai góc gần 90°: 80° vẫn là góc nhọn, còn 100° là góc tù.', visual: cmp([{ label: '80°', deg: 80 }, { label: '100°', deg: 100 }]) },
    { text: 'Khi ước lượng, con hãy so với ba mốc 45°, 90°, 135°.', visual: cmp([{ label: '45°', deg: 45 }, { label: '90°', deg: 90 }, { label: '135°', deg: 135 }]) },
  ],

  items: [
    {
      id: '14.1', src: 'S4 Q8', type: 'classify',
      prompt: 'Xếp mỗi góc vào đúng ô: góc nhọn, góc vuông hay góc tù.',
      visual: cmp([{ label: '35°', deg: 35 }, { label: '90°', deg: 90 }, { label: '120°', deg: 120 }, { label: '80°', deg: 80 }, { label: '150°', deg: 150 }]),
      hint: 'So từng số với 90°.',
      chips: [
        { id: 'a35', text: '35°' }, { id: 'a90', text: '90°' }, { id: 'a120', text: '120°' },
        { id: 'a80', text: '80°' }, { id: 'a150', text: '150°' },
      ],
      buckets: [{ id: 'nhon', text: 'Góc nhọn' }, { id: 'vuong', text: 'Góc vuông' }, { id: 'tu', text: 'Góc tù' }],
      answer: { a35: 'nhon', a90: 'vuong', a120: 'tu', a80: 'nhon', a150: 'tu' },
      explain: {
        steps: [
          { text: 'Nhớ mốc 90°: bé hơn 90° là nhọn, đúng 90° là vuông, lớn hơn 90° là tù.', visual: cmp([{ label: 'nhọn', deg: 50 }, { label: 'vuông', deg: 90 }, { label: 'tù', deg: 130 }], { name: true }) },
          { text: '35° và 80° đều bé hơn 90° nên là góc nhọn. Dù 80° trông gần vuông, nó vẫn bé hơn 90°.', visual: cmp([{ label: '35°', deg: 35 }, { label: '80°', deg: 80 }]), mark: 'good' },
          { text: '120° và 150° lớn hơn 90° nên là góc tù. Vậy chỉ có 90° là góc vuông: đáp án đã xếp xong.', visual: cmp([{ label: '120°', deg: 120 }, { label: '150°', deg: 150 }]) },
        ],
      },
    },
    {
      id: '14.2', src: 'S4 Q8', type: 'choice',
      prompt: 'Hình vẽ có hai góc: A là góc tù, B là góc nhọn. Chọn số đo hợp lí cho từng góc.',
      visual: cmp([{ label: 'A', deg: 135 }, { label: 'B', deg: 35 }]),
      hint: 'So A và B với góc vuông 90°, rồi với các mốc 45° và 135°.',
      layout: 'list',
      choices: [
        { text: 'A = 135°, B = 35°', correct: true },
        { text: 'A = 175°, B = 35°', code: 'QUY', why: '175° gần góc bẹt (180°), mở rất rộng. Góc A trong hình chỉ hơn góc vuông một đoạn vừa phải.' },
        { text: 'A = 95°, B = 35°', code: 'QUY', why: '95° chỉ hơn góc vuông một chút. Góc A trong hình mở rộng hơn thế.' },
        { text: 'A = 135°, B = 75°', code: 'QUY', why: '75° còn khá gần góc vuông. Góc B trong hình hẹp hơn nhiều, gần nửa góc vuông (45°).' },
      ],
      explain: {
        steps: [
          { text: 'So với 90°: góc A mở rộng hơn nên là góc tù; góc B mở hẹp hơn nên là góc nhọn.', visual: cmp([{ label: 'A', deg: 135 }, { label: 'B', deg: 35 }], { name: true }) },
          { text: 'Góc B gần nửa góc vuông (45°), nên chọn 35°. 75° gần vuông hơn nhiều.', visual: ang(35, { label: 'B' }) },
          { text: 'Góc A hơn vuông một đoạn vừa phải, không sát góc bẹt: 135° hợp lí. 95° hẹp quá, 175° rộng quá.', visual: ang(135, { label: 'A' }) },
          { text: 'Đáp án là A = 135°, B = 35°.' },
        ],
      },
    },
    {
      id: '14.3', src: 'S5 Q20', type: 'order',
      prompt: 'Xếp 5 góc theo độ lớn từ LỚN đến BÉ (chạm góc lớn nhất trước).',
      visual: cmp([{ label: '34°', deg: 34 }, { label: '78°', deg: 78 }, { label: '90°', deg: 90 }, { label: '104°', deg: 104 }, { label: '140°', deg: 140 }]),
      hint: 'Góc tù lớn nhất, rồi đến góc vuông, rồi đến góc nhọn.',
      items: [
        { id: 'a78', text: 'Góc 78°' }, { id: 'a140', text: 'Góc 140°' }, { id: 'a34', text: 'Góc 34°' },
        { id: 'a90', text: 'Góc 90°' }, { id: 'a104', text: 'Góc 104°' },
      ],
      answer: ['a140', 'a104', 'a90', 'a78', 'a34'],
      wrongHints: [
        { match: ['a34', 'a78', 'a90', 'a104', 'a140'], code: 'ĐỌC', why: 'Đề yêu cầu xếp từ LỚN đến BÉ. Có thể con đã xếp từ bé đến lớn.' },
        { match: ['a140', 'a104', 'a78', 'a90', 'a34'], code: 'QUY', why: '78° bé hơn 90° (góc nhọn), nên 90° phải đứng trước 78°.' },
      ],
      explain: {
        steps: [
          { text: 'Phân loại: 140° và 104° là góc tù; 90° là góc vuông; 78° và 34° là góc nhọn.', visual: cmp([{ label: '34°', deg: 34 }, { label: '78°', deg: 78 }, { label: '90°', deg: 90 }, { label: '104°', deg: 104 }, { label: '140°', deg: 140 }], { name: true }) },
          { text: 'Trong hai góc tù: 140° > 104°. Trong hai góc nhọn: 78° > 34°.' },
          { text: 'Xếp từ lớn đến bé: 140°, 104°, 90°, 78°, 34°.' },
        ],
      },
    },
    {
      id: '14.4', src: 'S2-C8', type: 'tf',
      prompt: 'Lan nhìn góc A trong hình và đoán góc đó khoảng 170°. Lan đoán như vậy có hợp lí không? Chọn ĐÚNG hoặc SAI.',
      visual: ang(120, { label: 'A' }),
      hint: 'So góc A với góc vuông và với góc bẹt (180°).',
      answer: false,
      reasons: [
        { text: 'Góc A mở rộng hơn góc vuông một đoạn, còn 170° gần bằng góc bẹt (180°).', correct: true },
        { text: 'Hai cạnh của góc A dài nên góc phải to.', correct: false, code: 'QUY', why: 'Cạnh dài hay ngắn không làm góc to hơn. Chỉ độ mở giữa hai cạnh mới quyết định.' },
        { text: 'Vì 170° lớn hơn 90° nên 170° hợp lí.', correct: false, code: 'QUY', why: 'Góc A đúng là góc tù, nhưng 170° mở gần như thẳng, còn góc A chỉ mở vừa phải.' },
      ],
      whyWrong: 'Ước lượng 170° là quá lớn: 170° gần góc bẹt (180°), còn góc A chỉ hơn góc vuông một đoạn.',
      explain: {
        steps: [
          { text: 'Góc A lớn hơn 90°, nên là góc tù. Lan nói đúng phần này.', visual: cmp([{ label: 'A', deg: 120 }, { label: '90°', deg: 90 }]) },
          { text: 'Nhưng 170° gần góc bẹt (180°), hai cạnh gần như thẳng hàng. Góc A không mở rộng đến thế.', visual: cmp([{ label: 'A', deg: 120 }, { label: '170°', deg: 170 }]), mark: 'bad' },
          { text: 'Vậy Lan đoán chưa hợp lí, câu này SAI. Ước lượng hợp lí hơn là khoảng 120°.' },
        ],
      },
    },
    {
      id: '14.5', src: 'S3-C22', type: 'match',
      prompt: 'Nối mỗi góc với số đo của nó.',
      hint: 'Góc nào có ô vuông ở đỉnh là góc vuông. Còn lại: so với 90°.',
      left: [
        { id: 'A', text: 'Góc A', visual: ang(90, { show: 'square' }) },
        { id: 'B', text: 'Góc B', visual: ang(75) },
        { id: 'C', text: 'Góc C', visual: ang(135) },
        { id: 'D', text: 'Góc D', visual: ang(45) },
      ],
      right: [
        { id: 'r90', text: '90°' }, { id: 'r75', text: '75°' }, { id: 'r135', text: '135°' },
        { id: 'r45', text: '45°' }, { id: 'r110', text: '110°' },
      ],
      pairs: { A: 'r90', B: 'r75', C: 'r135', D: 'r45' },
      explain: {
        steps: [
          { text: 'Góc A có ô vuông ở đỉnh nên là góc vuông: 90°.', visual: ang(90, { label: 'A', show: 'square' }) },
          { text: 'Góc B hơi hẹp hơn góc vuông: 75°. Góc D hẹp bằng nửa góc vuông: 45°.', visual: cmp([{ label: 'B', deg: 75 }, { label: 'D', deg: 45 }]) },
          { text: 'Góc C là góc tù mở rộng: 135°. Vậy A nối với 90°, B nối với 75°, C nối với 135°, D nối với 45°. Số 110° không dùng.', visual: ang(135, { label: 'C' }) },
        ],
      },
    },
    {
      id: '14.6', src: '[biến thể mới]', type: 'multi',
      prompt: 'Chọn TẤT CẢ các góc NHỌN.',
      hint: 'Góc nhọn phải bé hơn góc vuông, tức bé hơn 90°.',
      layout: 'grid2',
      choices: [
        { text: 'Góc A (35°)', correct: true, visual: ang(35, { label: 'A' }) },
        { text: 'Góc B (90°)', code: 'QUY', why: 'Góc B đúng bằng 90°, là góc vuông. Góc nhọn phải bé hơn 90°.', visual: ang(90, { label: 'B', show: 'square' }) },
        { text: 'Góc C (80°)', correct: true, visual: ang(80, { label: 'C' }) },
        { text: 'Góc D (100°)', code: 'QUY', why: 'Góc D là 100°, lớn hơn góc vuông, nên là góc tù.', visual: ang(100, { label: 'D' }) },
      ],
      explain: {
        steps: [
          { text: 'Góc nhọn là góc bé hơn góc vuông. Hãy so từng góc với 90°.', visual: ang(90, { show: 'square' }) },
          { text: 'Góc A (35°) và góc C (80°) bé hơn góc vuông. Góc C hơi gần vuông nhưng vẫn nhọn.', visual: cmp([{ label: 'A', deg: 35 }, { label: 'C', deg: 80 }]), mark: 'good' },
          { text: 'Góc B là góc vuông, góc D (100°) là góc tù. Đáp án là góc A và góc C.', visual: cmp([{ label: 'B', deg: 90 }, { label: 'D', deg: 100 }]) },
        ],
      },
    },
  ],

  variant: {
    id: '14.7', src: '[biến thể mới]', type: 'match',
    prompt: 'Hai kim đồng hồ tạo thành một góc. Nối mỗi giờ với loại góc đúng. (Mỗi khoảng giờ trên đồng hồ là 30°.)',
    hint: 'Từ số 12 đến số chỉ giờ, mỗi khoảng là 30°.',
    left: [
      { id: 'h2', text: '2 giờ', visual: { kind: 'clock', h: 2, m: 0 } },
      { id: 'h3', text: '3 giờ', visual: { kind: 'clock', h: 3, m: 0 } },
      { id: 'h4', text: '4 giờ', visual: { kind: 'clock', h: 4, m: 0 } },
    ],
    right: [
      { id: 'nhon', text: 'góc nhọn' }, { id: 'vuong', text: 'góc vuông' }, { id: 'tu', text: 'góc tù' },
    ],
    pairs: { h2: 'nhon', h3: 'vuong', h4: 'tu' },
    explain: {
      steps: [
        { text: 'Mỗi khoảng giờ trên đồng hồ là 30°. Lúc 2 giờ góc là 2 × 30° = 60°: góc nhọn.', visual: ang(60, { name: true }) },
        { text: 'Lúc 3 giờ góc là 3 × 30° = 90°: góc vuông.', visual: ang(90, { show: 'square', name: true }) },
        { text: 'Lúc 4 giờ góc là 4 × 30° = 120° lớn hơn 90°: góc tù. Vậy 2 giờ nối góc nhọn, 3 giờ nối góc vuông, 4 giờ nối góc tù.', visual: ang(120, { name: true }) },
      ],
    },
  },

  generators: [g1, g2, g3, g4],
};
