import { pick, int, shuffle } from '../core/rng.js';

// ---------- tiện ích ----------
const fr = (a, b) => `${a}/${b}`;
const jar = (parts, level, extra = {}) => ({
  kind: 'measure', type: 'jar', parts, level, showTicks: true, labels: 'none', unit: { full: '1 lít' }, ...extra,
});
// ghép đáp án đúng + nhiễu (loại trùng), trộn bằng rng
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
const g1 = {
  id: 'g13.1',
  make(rng) {
    const n = int(rng, 3, 10);
    let k;
    do { k = int(rng, 1, n - 1); } while (k === n - k);
    const type = pick(rng, ['jar', 'beaker']);
    const vis = { ...jar(n, k), type };
    const ves = type === 'jar' ? 'bình' : 'cốc';
    const Ves = type === 'jar' ? 'Bình' : 'Cốc';
    const correct = fr(k, n);
    return {
      id: 'g13.1', src: '[biến thể mới]', type: 'choice',
      prompt: `${Ves} 1 lít được chia thành các phần bằng nhau (xem hình). Nước dâng lên ${k} phần tính từ đáy. Nước chiếm bao nhiêu phần của ${ves}?`,
      visual: vis,
      hint: 'Mẫu số: đếm các khoảng giữa vạch. Tử số: đếm từ đáy lên.',
      choices: mkChoices(rng, correct, [
        { text: fr(k, n + 1), code: 'ĐẾM', why: `Có thể con đã đếm cả ${n + 1} vạch (kể cả hai đầu). Mẫu số là số khoảng bằng nhau: ${n}.` },
        { text: fr(n - k, n), code: 'NGƯỢC', why: `Mình đếm từ đáy lên. Đếm từ miệng ${ves} xuống sẽ ra ${n - k}, không phải ${k}.` },
        { text: fr(k, n - 1), code: 'ĐẾM', why: `${n - 1} là số vạch ở giữa. Mẫu số là số phần bằng nhau: ${n}.` },
      ]),
      explain: {
        steps: [
          { text: `Đếm các KHOẢNG giữa vạch: có ${n} phần bằng nhau. Mẫu số là ${n}.`, visual: jar(n, 0, { type, labels: 'number' }) },
          { text: `Đếm từ đáy lên tới mực nước: ${k} phần có nước. Tử số là ${k}.`, visual: { ...jar(n, k), type, anim: 'fill' } },
          { text: `Vậy nước chiếm ${correct} ${ves}. Đáp án là ${correct}.`, visual: { kind: 'fracshape', den: n, num: k, shape: 'jar', label: true } },
        ],
      },
      meta: { n, k },
    };
  },
  solve(item) { return fr(item.meta.k, item.meta.n); },
};

const g2 = {
  id: 'g13.2',
  make(rng) {
    const step = pick(rng, [100, 125, 200, 250]);
    const p = 1000 / step;
    let k;
    do { k = int(rng, 1, p - 1); } while (k === p - k);
    const m = k * step;
    const need = p - k;
    const correct = fr(need, p);
    return {
      id: 'g13.2', src: '[biến thể mới]', type: 'choice',
      prompt: `Bình 1 lít (1 000 ml), các vạch cách nhau ${step} ml. Nước đang ở mức ${m} ml. Cần rót thêm bao nhiêu lít nữa thì bình đầy?`,
      visual: jar(p, k),
      hint: 'Cả bình là mấy phần? Nước đã chiếm mấy phần?',
      choices: mkChoices(rng, correct, [
        { text: fr(k, p), code: 'NGƯỢC', why: `${fr(k, p)} là phần nước ĐÃ có. Câu hỏi là phần còn THIẾU: ${p} − ${k} = ${need}.` },
        { text: fr(need, p + 1), code: 'ĐẾM', why: `Mẫu số là số khoảng: ${p}, không phải ${p + 1} (số vạch kể cả hai đầu).` },
        { text: fr(need, p - 1), code: 'ĐẾM', why: `${p - 1} là số vạch ở giữa. Mẫu số vẫn là ${p} phần bằng nhau.` },
      ]),
      explain: {
        steps: [
          { text: `1 000 ml chia cho ${step} ml được ${p} phần. Cả bình là ${p}/${p} lít.`, visual: jar(p, 0, { labels: 'number' }) },
          { text: `Nước ${m} ml là ${m} ÷ ${step} = ${k} phần, tức ${fr(k, p)} lít.`, visual: { ...jar(p, k), anim: 'fill' } },
          { text: `Phần còn trống là ${p} − ${k} = ${need} phần. Đáp án là ${correct} lít.`, visual: jar(p, k, { pointer: { at: k, label: fr(k, p) } }) },
        ],
      },
      meta: { step, p, k },
    };
  },
  solve(item) {
    const { step, k } = item.meta;
    const parts = 1000 / step;
    return fr(parts - k, parts);
  },
};

const g3 = {
  id: 'g13.3',
  make(rng) {
    const n = int(rng, 3, 8);
    let k;
    do { k = int(rng, 1, n - 1); } while (k === n - k);
    const type = pick(rng, ['bar', 'ruler']);
    const wh = [];
    if (n + 1 !== k) wh.push({ match: `${k}|${n + 1}`, code: 'ĐẾM', why: `Mẫu số là số khoảng (${n}), không phải số vạch kể cả hai đầu (${n + 1}).` });
    wh.push({ match: `${n - k}|${n}`, code: 'NGƯỢC', why: `Mình đếm từ đầu bên trái, nơi bắt đầu của thước. Có thể con đang đếm từ đầu bên phải.` });
    wh.push({ match: `${k}|${n - 1}`, code: 'ĐẾM', why: `${n - 1} là số vạch ở giữa. Mẫu số là số phần bằng nhau: ${n}.` });
    return {
      id: 'g13.3', src: '[biến thể mới]', type: 'numpad',
      prompt: `Một đoạn thẳng dài 1 được chia thành các phần bằng nhau (có ${n + 1} vạch, kể cả hai đầu). Mũi tên chỉ bao nhiêu phần của cả đoạn thẳng? Viết thành phân số.`,
      visual: { kind: 'measure', type, parts: n, pointer: { at: k, hidden: true }, showTicks: true, labels: 'none' },
      hint: 'Đếm các khoảng, đừng đếm vạch. Đếm từ đầu bên trái.',
      slots: [
        { label: 'Tử số', answer: String(k), len: 1 },
        { label: 'Mẫu số', answer: String(n), len: String(n).length },
      ],
      prefix: 'Mũi tên chỉ', suffix: 'của đoạn thẳng',
      wrongHints: wh,
      explain: {
        steps: [
          { text: `Đếm các KHOẢNG: có ${n} phần bằng nhau (còn ${n + 1} là số vạch). Mẫu số là ${n}.`, visual: { kind: 'measure', type, parts: n, showTicks: true, labels: 'number' } },
          { text: `Từ đầu bên trái đến mũi tên có ${k} khoảng. Tử số là ${k}.`, visual: { kind: 'measure', type, parts: n, level: k, pointer: { at: k }, showTicks: true, labels: 'none', anim: 'fill' } },
          { text: `Vậy mũi tên chỉ ${fr(k, n)} của đoạn thẳng. Đáp án là ${k} và ${n}.`, visual: { kind: 'measure', type, parts: n, pointer: { at: k, label: fr(k, n) }, showTicks: true, labels: 'none' } },
        ],
      },
      meta: { n, k },
    };
  },
  solve(item) { return `${item.meta.k}|${item.meta.n}`; },
};

// ---------- chủ đề ----------
export default {
  id: 'cd13', no: 13, day: 5, title: 'Phân số trên bình và thước', short: 'Bình, thước', icon: '🥛',
  intro: 'Đếm KHOẢNG (phần bằng nhau) để biết mẫu số; đếm từ đáy lên để biết tử số.',

  remember: [
    {
      text: 'Mẫu số là số phần bằng nhau. Hãy đếm các KHOẢNG giữa các vạch, đừng đếm số vạch.',
      visual: jar(5, 0, { labels: 'number' }),
    },
    {
      text: 'Tử số là số phần tính từ ĐÁY lên tới mực nước (hoặc mũi tên).',
      visual: jar(5, 4, { anim: 'fill' }),
    },
    {
      text: 'Vạch trên cùng là cả bình: 5/5 = 1 lít. Phần còn trống bằng cả bình trừ phần đã có: 5 − 4 = 1 phần, tức là 1/5.',
      visual: jar(5, 4, { pointer: { at: 4, label: '4/5' } }),
    },
  ],

  lesson: [
    { text: 'Đây là bình 1 lít. Trên bình có các vạch chia.', visual: jar(4, 0) },
    { text: 'Đếm các KHOẢNG giữa vạch: một, hai, ba, bốn. Bình có 4 phần bằng nhau. Mẫu số là 4.', visual: jar(4, 0, { labels: 'number', anim: 'fill' }) },
    { text: 'Nước dâng từ đáy lên: một, hai, ba. Có 3 phần có nước. Tử số là 3.', visual: jar(4, 3, { anim: 'fill' }) },
    { text: 'Nước chiếm 3/4 bình. Phần còn trống là 1 phần, tức 1/4. Thêm 1/4 nữa là bình đầy.', visual: jar(4, 3, { pointer: { at: 3, label: '3/4' } }) },
    { text: 'Cẩn thận: bình có 3 vạch ở giữa, nhưng 3 KHÔNG phải mẫu số. Mẫu số là số khoảng: 4.', mark: 'bad', visual: jar(4, 3) },
  ],

  items: [
    {
      id: '13.1', src: 'S5 Q13', type: 'choice',
      prompt: 'Bình 1 lít được chia thành các phần bằng nhau (xem hình). Nước dâng lên 4 phần tính từ đáy. Nước chiếm bao nhiêu phần của bình?',
      visual: jar(5, 4),
      hint: 'Mẫu số: đếm các khoảng giữa vạch. Tử số: đếm từ đáy lên.',
      choices: [
        { text: '4/5', correct: true },
        { text: '4/6', code: 'ĐẾM', why: 'Có thể con đã đếm cả 6 vạch (kể cả hai đầu). Mẫu số là số khoảng bằng nhau: 5.' },
        { text: '1/5', code: 'NGƯỢC', why: 'Mình đếm từ đáy lên. Đếm từ miệng bình xuống mới ra 1.' },
        { text: '4/4', code: 'ĐẾM', why: '4 là số vạch ở giữa. Mẫu số là số phần bằng nhau: 5.' },
      ],
      explain: {
        steps: [
          { text: 'Đếm các KHOẢNG giữa vạch: 1, 2, 3, 4, 5. Bình có 5 phần bằng nhau, nên mẫu số là 5.', visual: jar(5, 0, { labels: 'number' }) },
          { text: 'Đếm từ đáy lên tới mực nước: 1, 2, 3, 4. Có 4 phần có nước, nên tử số là 4.', visual: jar(5, 4, { anim: 'fill' }) },
          { text: 'Vậy nước chiếm 4/5 bình. Đáp án là 4/5.', visual: { kind: 'fracshape', den: 5, num: 4, shape: 'jar', label: true } },
        ],
      },
    },
    {
      id: '13.2', src: 'S5 Q13', type: 'numpad',
      prompt: 'Bình 1 lít chia thành 5 phần bằng nhau. Mũi tên chỉ vào vạch cách đáy 1 phần. Mũi tên chỉ bao nhiêu phần của bình?',
      visual: jar(5, 0, { pointer: { at: 1, hidden: true } }),
      hint: 'Mẫu số: số khoảng của cả bình. Tử số: số khoảng từ đáy đến mũi tên.',
      slots: [
        { label: 'Tử số', answer: '1', len: 1 },
        { label: 'Mẫu số', answer: '5', len: 1 },
      ],
      prefix: 'Mũi tên chỉ', suffix: 'của bình',
      wrongHints: [
        { match: '1|4', code: 'ĐẾM', why: 'Mẫu số là số phần (khoảng) bằng nhau: 5. Số 4 là số vạch ở giữa.' },
        { match: '4|5', code: 'NGƯỢC', why: 'Mình đếm từ đáy lên. Mũi tên chỉ vào khoảng thứ nhất từ đáy.' },
        { match: '1|6', code: 'ĐẾM', why: 'Có thể con đã đếm cả vạch. Hãy đếm khoảng: có 5 phần.' },
      ],
      explain: {
        steps: [
          { text: 'Đếm khoảng của cả bình: 1, 2, 3, 4, 5. Mẫu số là 5.', visual: jar(5, 0, { labels: 'number' }) },
          { text: 'Từ đáy lên tới mũi tên chỉ có 1 khoảng. Tử số là 1.', visual: jar(5, 1, { pointer: { at: 1 }, anim: 'fill' }) },
          { text: 'Mũi tên chỉ 1/5 của bình. Đáp án là 1/5.', visual: { kind: 'fracshape', den: 5, num: 1, shape: 'jar', label: true } },
        ],
      },
    },
    {
      id: '13.3', src: 'S4 Q9', type: 'choice',
      prompt: 'Bình 1 lít chia thành 4 phần bằng nhau. Mũi tên A chỉ vào vạch cách đáy 3 phần. Mũi tên A chỉ bao nhiêu phần của bình?',
      visual: jar(4, 0, { pointer: { at: 3, label: 'A' } }),
      hint: 'Đếm từ đáy lên, không đếm từ miệng bình xuống.',
      choices: [
        { text: '3/4', correct: true },
        { text: '1/4', code: 'NGƯỢC', why: 'Đếm từ miệng bình xuống mới ra 1. Mình đếm từ đáy lên: 3 phần.' },
        { text: '3/3', code: 'ĐẾM', why: '3 là số vạch ở giữa. Số phần bằng nhau của bình là 4.' },
      ],
      explain: {
        steps: [
          { text: 'Bình có 4 phần bằng nhau (đếm khoảng). Mẫu số là 4.', visual: jar(4, 0, { labels: 'number' }) },
          { text: 'Từ đáy lên tới mũi tên A là 3 phần. Tử số là 3.', visual: jar(4, 3, { pointer: { at: 3, label: 'A' }, anim: 'fill' }) },
          { text: 'Mũi tên A chỉ 3/4 bình. Đáp án là 3/4.', visual: { kind: 'fracshape', den: 4, num: 3, shape: 'jar', label: true } },
        ],
      },
    },
    {
      id: '13.4', src: 'S3-C17', type: 'choice',
      prompt: 'Bình 1 lít (1 000 ml), các vạch cách nhau 100 ml. Nước đang ở mức 700 ml.\na) Nước chiếm bao nhiêu phần của bình? Viết bằng phân số.\nb) Cần rót thêm bao nhiêu lít nữa thì bình đầy?',
      visual: jar(10, 7),
      hint: '1 000 ml chia cho 100 ml được mấy phần?',
      layout: 'list',
      choices: [
        { text: 'a) 7/10 · b) 3/10', correct: true },
        { text: 'a) 7/100 · b) 3/10', code: 'ĐẾM', why: '1 lít được chia thành 10 phần, mỗi phần 100 ml. Mẫu số là 10, không phải 100.' },
        { text: 'a) 7/10 · b) 3/7', code: 'NGƯỢC', why: 'Mẫu số vẫn là 10 (cả bình). Tử số của phần thiếu là 10 − 7 = 3.' },
        { text: 'a) 3/10 · b) 7/10', code: 'NGƯỢC', why: '7 phần là nước ĐÃ có (câu a). Phần còn thiếu mới là 3 (câu b).' },
      ],
      explain: {
        steps: [
          { text: '1 000 ml chia cho 100 ml được 10 phần bằng nhau. Mẫu số là 10.', visual: jar(10, 0, { labels: 'number' }) },
          { text: '700 ml là 7 phần. Câu a: nước chiếm 7/10 lít.', visual: jar(10, 7, { anim: 'fill' }) },
          { text: 'Phần còn trống là 10 − 7 = 3 phần. Câu b: cần rót thêm 3/10 lít.', visual: jar(10, 7, { pointer: { at: 7, label: '7/10' } }) },
          { text: 'Đáp án là a) 7/10 · b) 3/10.' },
        ],
      },
    },
    {
      id: '13.5', src: 'S2-C21', type: 'choice',
      prompt: 'Một cái ca đong 200 ml, các vạch cách nhau 50 ml. Trong ca đang có 100 ml.\na) Nước chiếm mấy phần của ca?\nb) Rót thêm cho nước lên mức 150 ml thì chiếm mấy phần của ca?',
      visual: { kind: 'measure', type: 'beaker', parts: 4, level: 2, showTicks: true, labels: 'none', unit: { full: '200 ml' } },
      hint: '200 ml chia cho 50 ml được mấy phần?',
      layout: 'list',
      choices: [
        { text: 'a) 1/2 · b) 3/4', correct: true },
        { text: 'a) 1/2 · b) 1/2', code: 'QUY', why: '150 ml nhiều hơn 100 ml, nên nước chiếm nhiều phần hơn một nửa ca.' },
        { text: 'a) 1/2 · b) 1/4', code: 'QUY', why: '1/4 chỉ là 50 ml rót thêm. Câu hỏi là nước trong cả ca: 150 ml.' },
        { text: 'a) 1/4 · b) 3/4', code: 'ĐẾM', why: '100 ml là 2 khoảng (mỗi khoảng 50 ml), tức 2/4 = 1/2 ca, không phải 1 khoảng.' },
      ],
      explain: {
        steps: [
          { text: 'Ca 200 ml, mỗi khoảng 50 ml nên có 200 ÷ 50 = 4 phần bằng nhau.', visual: { kind: 'measure', type: 'beaker', parts: 4, level: 0, showTicks: true, labels: 'number', unit: { full: '200 ml' } } },
          { text: '100 ml là 2 phần trong 4 phần: 2/4, tức một nửa ca: 1/2.', visual: { kind: 'measure', type: 'beaker', parts: 4, level: 2, showTicks: true, labels: 'none', unit: { full: '200 ml' }, anim: 'fill' } },
          { text: '150 ml là 3 phần trong 4 phần: 3/4 ca.', visual: { kind: 'measure', type: 'beaker', parts: 4, level: 3, showTicks: true, labels: 'none', unit: { full: '200 ml' }, anim: 'fill' } },
          { text: 'Đáp án là a) 1/2 · b) 3/4.' },
        ],
      },
    },
    {
      id: '13.6', src: '[biến thể mới]', type: 'match',
      prompt: 'Ba bình 1 lít đều chia thành 8 phần bằng nhau. Nối mỗi bình với phân số chỉ mực nước.',
      hint: 'Mẫu số là số khoảng của cả bình. Đếm từ đáy lên.',
      left: [
        { id: 'A', text: 'Bình A', visual: jar(8, 5) },
        { id: 'B', text: 'Bình B', visual: jar(8, 3) },
        { id: 'C', text: 'Bình C', visual: jar(8, 7) },
      ],
      right: [
        { id: 'f53', text: '5/8' },
        { id: 'f33', text: '3/8' },
        { id: 'f73', text: '7/8' },
        { id: 'f57', text: '5/7' },
      ],
      pairs: { A: 'f53', B: 'f33', C: 'f73' },
      explain: {
        steps: [
          { text: 'Mỗi bình có 8 phần bằng nhau (đếm khoảng), nên mẫu số đều là 8.', visual: jar(8, 0, { labels: 'number' }) },
          { text: 'Đếm từ đáy lên: bình A có 5 phần nước, bình B có 3 phần, bình C có 7 phần.', visual: jar(8, 5, { anim: 'fill' }) },
          { text: 'Vậy A là 5/8, B là 3/8, C là 7/8. Phân số 5/7 không hợp với bình nào, vì 7 là số vạch ở giữa, không phải số phần.' },
        ],
      },
    },
  ],

  variant: {
    id: '13.7', src: '[biến thể mới]', type: 'choice',
    prompt: 'Bình 1 lít chia thành 4 phần bằng nhau. An rót nước đến 3/4 lít, rồi rót thêm 1/4 lít nữa. Bây giờ bình có bao nhiêu nước?',
    visual: jar(4, 3),
    hint: 'Rót thêm là thêm phần. Các phần đều bằng nhau (1/4 lít).',
    choices: [
      { text: 'Đầy bình (4/4 = 1 lít)', correct: true },
      { text: '4/8 lít', code: 'QUY', why: 'Cộng hai phân số cùng mẫu số thì mình cộng tử số và giữ nguyên mẫu số: 3/4 + 1/4 = 4/4.' },
      { text: '3/4 lít', code: 'QUY', why: 'An còn rót THÊM 1/4 lít nữa, nên nước nhiều hơn 3/4.' },
    ],
    explain: {
      steps: [
        { text: 'Lúc đầu nước có 3 phần trong 4 phần bằng nhau: 3/4.', visual: jar(4, 3, { anim: 'fill' }) },
        { text: 'Rót thêm 1/4 là thêm 1 phần nữa: 3 phần + 1 phần = 4 phần.', visual: jar(4, 4, { anim: 'fill' }) },
        { text: '4/4 là cả bình, bằng 1 lít. Đáp án là Đầy bình (4/4 = 1 lít).', visual: { kind: 'fracshape', den: 4, num: 4, shape: 'jar', label: true } },
      ],
    },
  },

  generators: [g1, g2, g3],
};
