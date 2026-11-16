import { pick, int, shuffle } from '../core/rng.js';

// ---------- tiện ích ----------
const sh = (name, extra = {}) => ({ kind: 'shape2d', name, ...extra });
function mkChoices(rng, correctText, wrongs, correctExtra = {}) {
  const seen = new Set([correctText]);
  const ws = [];
  for (const w of wrongs) {
    if (seen.has(w.text)) continue;
    seen.add(w.text);
    ws.push({ ...w });
  }
  return shuffle(rng, [{ text: correctText, correct: true, ...correctExtra }, ...ws]);
}

// hình có số trục khác nhau (mỗi số trục có thể có vài hình cùng số trục)
const SHAPE_TABLE = {
  1: [
    { name: 'tam giác cân (không đều)', spec: sh('triangle', { variant: 'isosceles' }) },
    { name: 'trái tim', spec: sh('heart') },
  ],
  2: [
    { name: 'hình chữ nhật (không vuông)', spec: sh('rectangle') },
    { name: 'đồng hồ cát', spec: sh('hourglass') },
  ],
  3: [{ name: 'tam giác đều', spec: sh('triangle', { variant: 'equilateral' }) }],
  4: [{ name: 'hình vuông', spec: sh('square') }],
  5: [{ name: 'ngũ giác đều', spec: sh('pentagon') }],
  6: [{ name: 'lục giác đều', spec: sh('hexagon') }],
};
const POLY = { 3: ['tam giác đều', 'triangle', 'equilateral'], 4: ['hình vuông', 'square'], 5: ['ngũ giác đều', 'pentagon'], 6: ['lục giác đều', 'hexagon'], 8: ['bát giác đều', 'octagon'] };

// ---------- bộ sinh ----------
// g15.1: đa giác đều n cạnh có bao nhiêu trục
const g1 = {
  id: 'g15.1',
  make(rng) {
    const n = pick(rng, [3, 4, 5, 6, 8]);
    const [name, shape, variant] = POLY[n];
    const spec = (extra = {}) => sh(shape, { ...(variant ? { variant } : {}), ...extra });
    const wh = [];
    if (n % 2 === 0) {
      wh.push({ match: String(n / 2), code: 'ĐẾM', why: `Có thể con mới đếm một loại trục. Có ${n / 2} trục đi qua các đỉnh và ${n / 2} trục đi qua điểm chính giữa các cạnh: ${n / 2} + ${n / 2} = ${n}.` });
    } else {
      wh.push({ match: String(n - 1), code: 'ĐẾM', why: `Mỗi đỉnh có một trục đi qua nó và đi qua điểm chính giữa cạnh đối diện. Có ${n} đỉnh nên có ${n} trục.` });
    }
    wh.push({ match: '1', code: 'ĐẾM', why: 'Còn nhiều đường gấp nữa cho hai nửa trùng khít. Con hãy thử gấp qua từng đỉnh.' });
    return {
      id: 'g15.1', src: '[biến thể mới]', type: 'numpad',
      prompt: `Đa giác đều có ${n} cạnh bằng nhau (${name}). Hình này có bao nhiêu trục đối xứng?`,
      visual: spec(),
      hint: 'Với đa giác đều, thử xem số trục có liên quan gì tới số cạnh.',
      slots: [{ label: 'Số trục', answer: String(n), len: String(n).length }],
      suffix: 'trục đối xứng',
      wrongHints: wh,
      explain: {
        steps: [
          { text: `Đa giác đều có ${n} cạnh bằng nhau và ${n} góc bằng nhau.`, visual: spec({ label: true }) },
          { text: `Với đa giác đều, số trục đối xứng bằng số cạnh.`, visual: spec({ axes: ['all'], anim: 'fold' }) },
          { text: `Vậy ${name} có ${n} trục đối xứng. Đáp án là ${n}.`, visual: spec({ axes: ['all'] }) },
        ],
      },
      meta: { n },
    };
  },
  solve(item) { return String(item.meta.n); },
};

// g15.2: hình nào có đúng k trục
const g2 = {
  id: 'g15.2',
  make(rng) {
    const k = int(rng, 1, 6);
    const others = shuffle(rng, [1, 2, 3, 4, 5, 6].filter((x) => x !== k)).slice(0, 3);
    const names = {};
    for (const c of [k, ...others]) names[c] = pick(rng, SHAPE_TABLE[c]);
    const correct = names[k].name;
    const wrongs = others.map((c) => ({
      text: names[c].name, code: 'ĐẾM', visual: names[c].spec,
      why: `${names[c].name[0].toUpperCase() + names[c].name.slice(1)} có ${c} trục, không phải ${k} trục.`,
    }));
    return {
      id: 'g15.2', src: '[biến thể mới]', type: 'choice',
      prompt: `Hình nào dưới đây có đúng ${k} trục đối xứng?`,
      hint: 'Tưởng tượng gấp đôi hình: có mấy đường gấp cho hai nửa trùng khít?',
      layout: 'grid2',
      choices: mkChoices(rng, correct, wrongs, { visual: names[k].spec }),
      explain: {
        steps: [
          { text: `Đếm số đường gấp cho hai nửa trùng khít của từng hình.`, visual: names[k].spec },
          { text: `${correct[0].toUpperCase() + correct.slice(1)} có ${k} trục đối xứng.`, visual: { ...names[k].spec, axes: k === 2 ? ['v', 'h'] : k === 1 ? ['v'] : ['all'], anim: 'fold' } },
          { text: `Các hình còn lại có số trục khác ${k}. Đáp án là ${correct}.` },
        ],
      },
      meta: { k, names: Object.fromEntries(Object.entries(names).map(([c, v]) => [c, v.name])) },
    };
  },
  solve(item) { return item.meta.names[item.meta.k]; },
};

// g15.3: xếp theo số trục
const g3 = {
  id: 'g15.3',
  make(rng) {
    const counts = shuffle(rng, [1, 2, 3, 4, 5, 6]).slice(0, 4);
    const info = counts.map((c) => ({ c, ...pick(rng, SHAPE_TABLE[c]) }));
    const inc = rng.next() < 0.5;
    const sortedIds = info.slice().sort((a, b) => (inc ? a.c - b.c : b.c - a.c)).map((x) => 's' + x.c);
    const rev = sortedIds.slice().reverse();
    let chips;
    do { chips = shuffle(rng, info).map((x) => ({ id: 's' + x.c, text: x.name })); } while (chips.map((c) => c.id).join() === sortedIds.join());
    const txt = info.slice().sort((a, b) => (inc ? a.c - b.c : b.c - a.c)).map((x) => `${x.name} (${x.c})`).join(', ');
    return {
      id: 'g15.3', src: '[biến thể mới]', type: 'order',
      prompt: inc ? 'Xếp các hình theo số trục đối xứng từ ÍT đến NHIỀU (chạm hình ít trục nhất trước).' : 'Xếp các hình theo số trục đối xứng từ NHIỀU đến ÍT (chạm hình nhiều trục nhất trước).',
      hint: 'Đếm số trục của từng hình rồi so sánh.',
      items: chips,
      answer: sortedIds,
      wrongHints: [{ match: rev, code: 'ĐỌC', why: `Đề yêu cầu xếp từ ${inc ? 'ÍT đến NHIỀU' : 'NHIỀU đến ÍT'}. Có thể con đã xếp ngược lại.` }],
      explain: {
        steps: [
          { text: `Đếm số trục. ${info.map((x) => `${x.name[0].toUpperCase() + x.name.slice(1)} có ${x.c} trục`).join('. ')}.` },
          { text: `Xếp từ ${inc ? 'ít đến nhiều' : 'nhiều đến ít'}: ${txt}.` },
        ],
      },
      meta: { counts: info.map((x) => ({ id: 's' + x.c, c: x.c })), inc },
    };
  },
  solve(item) {
    const { counts, inc } = item.meta;
    return counts.slice().sort((a, b) => (inc ? a.c - b.c : b.c - a.c)).map((x) => x.id).join(',');
  },
};

// ---------- chủ đề ----------
export default {
  id: 'cd15', no: 15, day: 5, title: 'Trục đối xứng và hình phẳng', short: 'Đối xứng', icon: '🦋',
  intro: 'Trục đối xứng là đường gấp để hai nửa trùng khít. Đa giác chỉ có cạnh THẲNG.',

  remember: [
    {
      text: 'Trục đối xứng là đường gấp đôi hình sao cho hai nửa trùng khít nhau.',
      visual: sh('rectangle', { axes: ['v'], fold: true, anim: 'fold' }),
    },
    {
      text: 'Đa giác đều có số trục bằng số cạnh: tam giác đều 3, hình vuông 4, lục giác đều 6. Hình chữ nhật (không vuông) có 2 trục; đường chéo KHÔNG phải là trục.',
      visual: sh('square', { axes: ['v', 'h', 'd1', 'd2'] }),
    },
    {
      text: 'Hình phẳng nằm trên mặt giấy, chỉ có chiều dài và chiều rộng. Đa giác là hình phẳng chỉ có các cạnh THẲNG, từ 3 cạnh trở lên. Hình tròn và trái tim không phải đa giác.',
      visual: sh('pentagon', { label: true }),
    },
  ],

  lesson: [
    { text: 'Gấp đôi hình chữ nhật theo đường dọc ở giữa: hai nửa trùng khít. Đó là một trục đối xứng.', visual: sh('rectangle', { axes: ['v'], fold: true, anim: 'fold' }) },
    { text: 'Gấp theo đường ngang ở giữa: cũng trùng khít. Hình chữ nhật có 2 trục.', visual: sh('rectangle', { axes: ['v', 'h'] }) },
    { text: 'Gấp theo đường chéo thì hai nửa KHÔNG trùng khít. Đường chéo của hình chữ nhật KHÔNG phải trục.', mark: 'bad', visual: sh('rectangle', { axes: ['d1'] }) },
    { text: 'Hình vuông thì khác: hai đường chéo cũng là trục. Hình vuông có 4 trục.', visual: sh('square', { axes: ['v', 'h', 'd1', 'd2'] }) },
    { text: 'Đa giác đều có số trục bằng số cạnh: tam giác đều 3 trục, lục giác đều 6 trục.', visual: sh('hexagon', { axes: ['all'] }) },
    { text: 'Hình tròn gấp theo đường nào đi qua tâm cũng trùng khít, nên có vô số trục.', visual: sh('circle', { axes: ['v', 'h', 'd1', 'd2'] }) },
  ],

  items: [
    {
      id: '15.1', src: 'T12 tr.1 C7', type: 'numpad',
      prompt: 'Điền số trục đối xứng của mỗi hình.',
      visual: sh('hexagon'),
      hint: 'Với đa giác đều, số trục liên quan đến số cạnh.',
      slots: [
        { label: 'a) Hình vuông có', answer: '4', len: 1, unit: 'trục' },
        { label: 'b) Lục giác đều có', answer: '6', len: 1, unit: 'trục' },
        { label: 'c) Tam giác đều có', answer: '3', len: 1, unit: 'trục' },
      ],
      wrongHints: [
        { match: '2|6|3', code: 'ĐẾM', why: 'Hình vuông còn có hai đường chéo cũng là trục, ngoài đường dọc và đường ngang: 2 + 2 = 4.' },
        { match: '4|3|3', code: 'ĐẾM', why: 'Lục giác đều có 3 trục qua các đỉnh và 3 trục qua điểm chính giữa các cạnh: 3 + 3 = 6.' },
      ],
      explain: {
        steps: [
          { text: 'Hình vuông có 4 cạnh. Có 1 trục dọc, 1 trục ngang và 2 đường chéo. Vậy có 4 trục.', visual: sh('square', { axes: ['v', 'h', 'd1', 'd2'] }) },
          { text: 'Lục giác đều có 6 cạnh. Có 3 đường gấp đi qua hai đỉnh đối nhau và 3 đường gấp đi qua điểm chính giữa hai cạnh đối nhau. Vậy có 6 trục.', visual: sh('hexagon', { axes: ['all'] }) },
          { text: 'Tam giác đều có 3 cạnh nên có 3 trục.', visual: sh('triangle', { variant: 'equilateral', axes: ['all'] }) },
          { text: 'Với đa giác đều, số trục bằng số cạnh. Đáp án là 4; 6; 3.' },
        ],
      },
    },
    {
      id: '15.2', src: 'S5 Q15', type: 'choice',
      prompt: 'Hình chữ nhật (không phải hình vuông) có bao nhiêu trục đối xứng?',
      visual: sh('rectangle'),
      hint: 'Thử gấp theo đường dọc, đường ngang, rồi đường chéo.',
      choices: [
        { text: '2 trục', correct: true },
        { text: '4 trục', code: 'QUY', why: 'Đường chéo của hình chữ nhật không phải trục: gấp theo đường chéo, hai nửa không trùng khít.' },
        { text: '1 trục', code: 'ĐẾM', why: 'Gấp theo đường dọc được, và gấp theo đường ngang cũng được: còn trục thứ hai.' },
      ],
      explain: {
        steps: [
          { text: 'Gấp theo đường dọc ở giữa: hai nửa trùng khít. Đó là trục thứ nhất.', visual: sh('rectangle', { axes: ['v'], fold: true, anim: 'fold' }) },
          { text: 'Gấp theo đường ngang ở giữa: cũng trùng khít. Đó là trục thứ hai.', visual: sh('rectangle', { axes: ['v', 'h'], fold: true, anim: 'fold' }) },
          { text: 'Gấp theo đường chéo: hai nửa lệch nhau, không trùng khít. Đường chéo KHÔNG phải trục.', mark: 'bad', visual: sh('rectangle', { axes: ['d1'] }) },
          { text: 'Vậy hình chữ nhật có 2 trục. Đáp án là 2 trục.' },
        ],
      },
    },
    {
      id: '15.3', src: 'S5 Q15', type: 'choice',
      prompt: 'Con cắt bỏ hai góc ở hai đầu của một đường chéo hình vuông (hai vết cắt bằng nhau), được hình như trong hình vẽ. Hình mới có bao nhiêu trục đối xứng?',
      visual: sh('custom', { points: [[30, 10], [90, 10], [90, 70], [70, 90], [10, 90], [10, 30]] }),
      hint: 'Tưởng tượng gấp tờ giấy theo từng đường chéo của hình vuông ban đầu.',
      choices: [
        { text: '2 trục', correct: true },
        { text: '1 trục', code: 'ĐẾM', why: 'Gấp theo đường chéo còn lại: hai góc bị cắt cũng úp vào nhau. Hình có thêm một trục nữa.' },
        { text: '4 trục', code: 'QUY', why: 'Gấp theo đường dọc hay ngang thì một góc bị cắt úp vào góc còn nguyên, nên không trùng khít.' },
        { text: '0 trục', code: 'QUY', why: 'Hãy thử gấp theo đường chéo: hai nửa trùng khít, nên hình vẫn có trục.' },
      ],
      explain: {
        steps: [
          { text: 'Hình gốc là hình vuông. Hai góc ở hai đầu của một đường chéo bị cắt bỏ.', visual: sh('custom', { points: [[30, 10], [90, 10], [90, 70], [70, 90], [10, 90], [10, 30]] }) },
          { text: 'Gấp theo đường chéo nối hai góc bị cắt: hai nửa trùng khít (góc cụt này úp đúng góc cụt kia). Đó là trục thứ nhất.', visual: sh('custom', { points: [[30, 10], [90, 10], [90, 70], [70, 90], [10, 90], [10, 30]], axes: [{ x1: 5, y1: 5, x2: 95, y2: 95 }] }) },
          { text: 'Gấp theo đường chéo nối hai góc còn nguyên: cũng trùng khít. Đó là trục thứ hai.', visual: sh('custom', { points: [[30, 10], [90, 10], [90, 70], [70, 90], [10, 90], [10, 30]], axes: [{ x1: 5, y1: 5, x2: 95, y2: 95 }, { x1: 95, y1: 5, x2: 5, y2: 95 }] }) },
          { text: 'Gấp theo đường dọc hoặc ngang thì lệch. Vậy hình có 2 trục. Đáp án là 2 trục.', mark: 'good' },
        ],
      },
    },
    {
      id: '15.4', src: 'T12 tr.1 C1', type: 'multi',
      prompt: 'Chọn TẤT CẢ các câu ĐÚNG.',
      hint: 'Nhớ: đa giác chỉ có cạnh thẳng. Hình tròn là hình phẳng nhưng không có góc vuông.',
      layout: 'list',
      choices: [
        { text: 'Hình phẳng chỉ có chiều dài và chiều rộng.', correct: true },
        { text: 'Mọi hình phẳng đều có một góc vuông.', code: 'QUY', why: 'Hình tròn là hình phẳng nhưng không có góc vuông nào.' },
        { text: 'Đa giác có từ 3 cạnh thẳng trở lên và có một cạnh cong.', code: 'QUY', why: 'Đa giác chỉ có các cạnh thẳng. Hình có cạnh cong thì không phải đa giác.' },
        { text: 'Hình tròn không phải là đa giác.', correct: true },
      ],
      explain: {
        steps: [
          { text: 'Hình phẳng có hai chiều: dài và rộng. Câu này ĐÚNG.', visual: sh('circle'), mark: 'good' },
          { text: 'Hình tròn là hình phẳng mà không có góc vuông, nên câu "mọi hình phẳng đều có góc vuông" là SAI.', mark: 'bad' },
          { text: 'Đa giác chỉ có cạnh thẳng, không có cạnh cong. Câu có "một cạnh cong" là SAI.', visual: sh('pentagon'), mark: 'bad' },
          { text: 'Đường viền hình tròn là đường cong, mà đa giác chỉ có cạnh thẳng. Câu này ĐÚNG. Vậy đáp án là câu 1 và câu 4.', visual: sh('circle'), mark: 'good' },
        ],
      },
    },
    {
      id: '15.5', src: 'T11 C11', type: 'classify',
      prompt: 'Hình nào là đa giác? Xếp mỗi hình vào đúng ô.',
      hint: 'Đa giác chỉ có các cạnh thẳng.',
      chips: [
        { id: 'tg', text: 'tam giác' }, { id: 'thoi', text: 'hình thoi' }, { id: 'lg', text: 'lục giác' },
        { id: 'hinhtron', text: 'hình tròn' }, { id: 'tim', text: 'trái tim' }, { id: 'cn', text: 'hình chữ nhật' },
      ],
      buckets: [{ id: 'dg', text: 'Là đa giác' }, { id: 'kdg', text: 'KHÔNG là đa giác' }],
      answer: { tg: 'dg', thoi: 'dg', lg: 'dg', cn: 'dg', hinhtron: 'kdg', tim: 'kdg' },
      explain: {
        steps: [
          { text: 'Đa giác là hình phẳng chỉ có các cạnh THẲNG, từ 3 cạnh trở lên.', visual: sh('hexagon') },
          { text: 'Tam giác, hình thoi, lục giác, hình chữ nhật đều có toàn cạnh thẳng nên là đa giác.', visual: sh('rhombus'), mark: 'good' },
          { text: 'Hình tròn và trái tim có cạnh cong nên KHÔNG là đa giác. Vậy đáp án là 4 hình đa giác và 2 hình không phải.', visual: sh('heart'), mark: 'bad' },
        ],
      },
    },
    {
      id: '15.6', src: 'S4 Q6', type: 'choice',
      prompt: 'Ghép một hình vuông với một tam giác đều có cạnh bằng cạnh hình vuông, chung một cạnh (như hình ngôi nhà). Hình mới có bao nhiêu cạnh?',
      visual: sh('house'),
      hint: 'Con chỉ đếm các cạnh trên đường viền ngoài.',
      choices: [
        { text: '5 cạnh', correct: true },
        { text: '7 cạnh', code: 'QUY', why: '4 + 3 = 7, nhưng cạnh chung bị che mất, không còn nằm trên đường viền: 7 − 2 = 5.' },
        { text: '6 cạnh', code: 'ĐẾM', why: 'Hãy đếm lại các đoạn trên đường viền ngoài: chỉ có 5 đoạn.' },
      ],
      explain: {
        steps: [
          { text: 'Hình vuông có 4 cạnh, tam giác có 3 cạnh: 4 + 3 = 7 cạnh.', visual: sh('square') },
          { text: 'Hai hình chung một cạnh. Cạnh chung ở bên trong nên không còn trên đường viền. Mỗi hình mất 1 cạnh, nên 7 − 2 = 5.', visual: sh('house') },
          { text: 'Đếm đường viền ngoài của hình ngôi nhà: 5 cạnh, đó là hình ngũ giác. Đáp án là 5 cạnh.', visual: sh('house', { label: true }) },
        ],
      },
    },
  ],

  variant: {
    id: '15.7', src: '[biến thể mới]', type: 'choice',
    prompt: 'Một hình đều có đúng 3 trục đối xứng. Hình đó là:',
    hint: 'Với đa giác đều, số trục bằng số cạnh.',
    layout: 'grid2',
    choices: [
      { text: 'tam giác đều', correct: true, visual: sh('triangle', { variant: 'equilateral' }) },
      { text: 'hình vuông', code: 'ĐẾM', why: 'Hình vuông có 4 cạnh nên có 4 trục.', visual: sh('square') },
      { text: 'hình chữ nhật', code: 'ĐẾM', why: 'Hình chữ nhật (không vuông) có 2 trục: dọc và ngang.', visual: sh('rectangle') },
      { text: 'ngũ giác đều', code: 'ĐẾM', why: 'Ngũ giác đều có 5 cạnh nên có 5 trục.', visual: sh('pentagon') },
    ],
    explain: {
      steps: [
        { text: 'Với đa giác đều, số trục bằng số cạnh. Muốn có 3 trục thì hình phải có 3 cạnh.' },
        { text: 'Hình đều có 3 cạnh là tam giác đều.', visual: sh('triangle', { variant: 'equilateral', axes: ['all'], anim: 'fold' }) },
        { text: 'Hình vuông có 4 trục, hình chữ nhật có 2 trục, ngũ giác đều có 5 trục. Đáp án là tam giác đều.' },
      ],
    },
  },

  generators: [g1, g2, g3],
};
