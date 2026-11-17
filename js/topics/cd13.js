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


// ---------- ngữ cảnh dùng chung cho bộ sinh ----------
const NAMES = ['An', 'Bình', 'Chi', 'Dũng', 'Hà', 'Lan', 'Minh', 'Nam', 'Mai', 'Phúc', 'Quân', 'Thu'];
const LIQ = ['nước', 'sữa', 'nước cam', 'nước chanh', 'nước dừa'];
const VES = { jar: ['bình', 'chai'], beaker: ['cốc đong', 'ca đong'] };
const cap1 = (s) => s[0].toUpperCase() + s.slice(1);
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// ---------- bộ sinh ----------
// g13.1: đọc phân số từ mực nước (bình/cốc 1 lít chia n phần) — bài 13.1
const g1 = {
  id: 'g13.1', covers: ['13.1'],
  make(rng) {
    const n = int(rng, 3, 10);
    let k;
    do { k = int(rng, 1, n - 1); } while (k === n - k);
    const type = pick(rng, ['jar', 'beaker']);
    const ves = pick(rng, VES[type]);
    const Ves = cap1(ves);
    const liq = pick(rng, LIQ);
    const Liq = cap1(liq);
    const name = pick(rng, NAMES);
    const t = int(rng, 0, 2);
    const prompt = t === 0
      ? `${Ves} 1 lít được chia thành các phần bằng nhau (xem hình). ${Liq} dâng lên ${k} phần tính từ đáy. ${Liq} chiếm bao nhiêu phần của ${ves}?`
      : t === 1
        ? `Trong ${ves} 1 lít có ${liq}. ${Ves} được chia thành các phần bằng nhau (xem hình), mực ${liq} cao ${k} phần tính từ đáy. Phân số nào chỉ lượng ${liq} trong ${ves}?`
        : `${name} rót ${liq} vào ${ves} 1 lít. Các vạch chia ${ves} thành những phần bằng nhau (xem hình). ${Liq} dâng lên ${k} phần tính từ đáy. ${Liq} chiếm bao nhiêu phần của ${ves}?`;
    const correct = fr(k, n);
    return {
      id: 'g13.1', src: '[biến thể mới]', type: 'choice',
      prompt,
      visual: { ...jar(n, k), type },
      hint: 'Mẫu số: đếm các khoảng giữa vạch. Tử số: đếm từ đáy lên.',
      choices: mkChoices(rng, correct, [
        { text: fr(k, n + 1), code: 'ĐẾM', why: `Có thể con đã đếm cả ${n + 1} vạch (kể cả hai đầu). Mẫu số là số khoảng bằng nhau: ${n}.` },
        { text: fr(n - k, n), code: 'NGƯỢC', why: `Mình đếm từ đáy lên. Đếm từ miệng ${ves} xuống sẽ ra ${n - k}, không phải ${k}.` },
        { text: fr(k, n - 1), code: 'ĐẾM', why: `${n - 1} là số vạch ở giữa. Mẫu số là số phần bằng nhau: ${n}.` },
      ]),
      explain: {
        steps: [
          { text: `Đếm các KHOẢNG giữa vạch: có ${n} phần bằng nhau. Mẫu số là ${n}.`, visual: { ...jar(n, 0, { labels: 'number' }), type } },
          { text: `Đếm từ đáy lên tới mực ${liq}: ${k} phần có ${liq}. Tử số là ${k}.`, visual: { ...jar(n, k), type, anim: 'fill' } },
          { text: `Vậy ${liq} chiếm ${correct} ${ves}. Đáp án là ${correct}.`, visual: { kind: 'fracshape', den: n, num: k, shape: 'jar', label: true } },
        ],
      },
      meta: { n, k },
    };
  },
  solve(item) { return fr(item.meta.k, item.meta.n); },
};

// g13.2: a) phân số đã có, b) phân số còn thiếu (bình 1 lít, vạch cách nhau step ml) — bài 13.4
const g2 = {
  id: 'g13.2', covers: ['13.4'],
  make(rng) {
    const step = pick(rng, [100, 125, 200, 250]);
    const p = 1000 / step;
    let k;
    do { k = int(rng, 1, p - 1); } while (k === p - k);
    const m = k * step;
    const need = p - k;
    const type = pick(rng, ['jar', 'beaker']);
    const ves = pick(rng, VES[type]);
    const liq = pick(rng, LIQ);
    const Liq = cap1(liq);
    const A = `a) ${fr(k, p)} · b) ${fr(need, p)}`;
    return {
      id: 'g13.2', src: '[biến thể mới]', type: 'choice',
      prompt: `${cap1(ves)} 1 lít (1 000 ml), các vạch cách nhau ${step} ml. ${Liq} đang ở mức ${m} ml.\na) ${Liq} chiếm bao nhiêu phần của ${ves}? Viết bằng phân số.\nb) Cần rót thêm bao nhiêu lít nữa thì ${ves} đầy?`,
      visual: { ...jar(p, k), type },
      hint: `1 000 ml chia cho ${step} ml được mấy phần?`,
      layout: 'list',
      choices: mkChoices(rng, A, [
        { text: `a) ${fr(k, step)} · b) ${fr(need, p)}`, code: 'ĐẾM', why: `1 lít được chia thành ${p} phần, mỗi phần ${step} ml. Mẫu số là ${p}, không phải ${step}.` },
        { text: `a) ${fr(k, p)} · b) ${fr(need, k)}`, code: 'NGƯỢC', why: `Mẫu số vẫn là ${p} (cả ${ves}). Tử số của phần thiếu là ${p} − ${k} = ${need}.` },
        { text: `a) ${fr(need, p)} · b) ${fr(k, p)}`, code: 'NGƯỢC', why: `${k} phần là ${liq} ĐÃ có (câu a). Phần còn thiếu mới là ${need} (câu b).` },
      ]),
      explain: {
        steps: [
          { text: `1 000 ml chia cho ${step} ml được ${p} phần bằng nhau. Mẫu số là ${p}.`, visual: { ...jar(p, 0, { labels: 'number' }), type } },
          { text: `${m} ml là ${m} ÷ ${step} = ${k} phần. Câu a: ${liq} chiếm ${fr(k, p)} lít.`, visual: { ...jar(p, k), type, anim: 'fill' } },
          { text: `Phần còn trống là ${p} − ${k} = ${need} phần. Câu b: cần rót thêm ${fr(need, p)} lít.`, visual: { ...jar(p, k, { pointer: { at: k, label: fr(k, p) } }), type } },
          { text: `Đáp án là ${A}.` },
        ],
      },
      meta: { step, p, k },
    };
  },
  solve(item) {
    const { step, k } = item.meta;
    const parts = 1000 / step;
    return `a) ${fr(k, parts)} · b) ${fr(parts - k, parts)}`;
  },
};

// g13.3: mũi tên (ẩn) chỉ phân số — bình, cốc, thanh, thước — bài 13.2
const g3 = {
  id: 'g13.3', covers: ['13.2'],
  make(rng) {
    const type = pick(rng, ['jar', 'beaker', 'bar', 'ruler']);
    const n = int(rng, 3, 10);
    let k;
    do { k = int(rng, 1, n - 1); } while (k === n - k);
    const mode = int(rng, 0, 2);
    const vertical = type === 'jar' || type === 'beaker';
    const obj = type === 'jar' ? 'bình' : type === 'beaker' ? 'cốc đong' : type === 'bar' ? 'đoạn thẳng' : 'cây thước';
    const start = vertical ? 'đáy' : 'đầu bên trái';
    const wholeTxt = vertical ? `${cap1(obj)} 1 lít` : type === 'bar' ? 'Một đoạn thẳng dài 1' : 'Một cây thước dài 1 mét';
    let prompt;
    if (mode === 0) prompt = `${wholeTxt} chia thành ${n} phần bằng nhau. Mũi tên chỉ vào vạch cách ${start} ${k} phần (xem hình). Mũi tên chỉ bao nhiêu phần của ${obj}? Viết thành phân số.`;
    else if (mode === 1) prompt = `${wholeTxt} chia thành ${n} phần bằng nhau. Mũi tên chỉ vào một vạch (xem hình). Mũi tên chỉ bao nhiêu phần của ${obj}? Viết thành phân số.`;
    else prompt = `${wholeTxt} được chia bằng các vạch (có ${n + 1} vạch, kể cả hai đầu). Mũi tên chỉ vào một vạch (xem hình). Mũi tên chỉ bao nhiêu phần của ${obj}? Viết thành phân số.`;
    const vis = (extra = {}) => (vertical
      ? { ...jar(n, 0), type, ...extra }
      : { kind: 'measure', type, parts: n, showTicks: true, labels: 'none', ...extra });
    const wh = [];
    wh.push({ match: `${k}|${n + 1}`, code: 'ĐẾM', why: `Mẫu số là số khoảng bằng nhau (${n}), không phải số vạch kể cả hai đầu (${n + 1}).` });
    wh.push({ match: `${n - k}|${n}`, code: 'NGƯỢC', why: `Mình đếm từ ${start}, nơi bắt đầu. Có thể con đang đếm từ phía bên kia.` });
    wh.push({ match: `${k}|${n - 1}`, code: 'ĐẾM', why: `${n - 1} là số vạch ở giữa. Mẫu số là số phần bằng nhau: ${n}.` });
    return {
      id: 'g13.3', src: '[biến thể mới]', type: 'numpad',
      prompt,
      visual: vis({ pointer: { at: k, hidden: true } }),
      hint: `Đếm các khoảng, đừng đếm vạch. Đếm từ ${start}.`,
      slots: [
        { label: 'Tử số', answer: String(k), len: 1 },
        { label: 'Mẫu số', answer: String(n), len: String(n).length },
      ],
      prefix: 'Mũi tên chỉ', suffix: `của ${obj}`,
      wrongHints: wh,
      explain: {
        steps: [
          { text: `Đếm các KHOẢNG: có ${n} phần bằng nhau (còn ${n + 1} là số vạch). Mẫu số là ${n}.`, visual: vis({ labels: 'number' }) },
          { text: `Từ ${start} đến mũi tên có ${k} khoảng. Tử số là ${k}.`, visual: vis({ level: k, pointer: { at: k }, anim: 'fill' }) },
          { text: `Vậy mũi tên chỉ ${fr(k, n)} của ${obj}. Đáp án là ${k} và ${n}.`, visual: vis({ pointer: { at: k, label: fr(k, n) } }) },
        ],
      },
      meta: { n, k },
    };
  },
  solve(item) { return `${item.meta.k}|${item.meta.n}`; },
};

// g13.4: cốc đong ml, a) mức hiện tại, b) sau khi rót thêm — bài 13.5
const CUPS = [[3, 100], [3, 50], [4, 50], [4, 100], [5, 50], [5, 100], [6, 50], [6, 100], [8, 25], [8, 50], [10, 50], [10, 100]];
const g4 = {
  id: 'g13.4', covers: ['13.5'],
  make(rng) {
    const [p, step] = pick(rng, CUPS);
    const cap = p * step;
    const ks = [];
    for (let i = 1; i < p; i++) if (gcd(i, p) === 1) ks.push(i);
    const i1 = int(rng, 0, ks.length - 2);
    const i2 = int(rng, i1 + 1, ks.length - 1);
    const k1 = ks[i1], k2 = ks[i2];
    const ves = pick(rng, ['ca đong', 'cốc đong', 'bình nhỏ']);
    const liq = pick(rng, LIQ);
    const Liq = cap1(liq);
    const unit = { full: `${cap} ml` };
    const bk = (level, extra = {}) => ({ kind: 'measure', type: 'beaker', parts: p, level, showTicks: true, labels: 'none', unit, ...extra });
    const A = `a) ${fr(k1, p)} · b) ${fr(k2, p)}`;
    return {
      id: 'g13.4', src: '[biến thể mới]', type: 'choice',
      prompt: `Một ${ves} ${cap} ml, các vạch cách nhau ${step} ml. Trong ${ves} đang có ${k1 * step} ml ${liq}.\na) ${Liq} chiếm mấy phần của ${ves}?\nb) Rót thêm cho ${liq} lên mức ${k2 * step} ml thì chiếm mấy phần của ${ves}?`,
      visual: bk(k1),
      hint: `${cap} ml chia cho ${step} ml được mấy phần?`,
      layout: 'list',
      choices: mkChoices(rng, A, [
        { text: `a) ${fr(k1, p)} · b) ${fr(k1, p)}`, code: 'QUY', why: `${k2 * step} ml nhiều hơn ${k1 * step} ml, nên ${liq} chiếm nhiều phần hơn ${fr(k1, p)} ${ves}.` },
        { text: `a) ${fr(k1, p)} · b) ${fr(k2 - k1, p)}`, code: 'QUY', why: `${fr(k2 - k1, p)} chỉ là phần rót thêm. Câu hỏi là ${liq} trong cả ${ves}: ${k2 * step} ml.` },
        { text: `a) ${fr(k1 + 1, p)} · b) ${fr(k2, p)}`, code: 'ĐẾM', why: `${k1 * step} ml là ${k1} khoảng (mỗi khoảng ${step} ml), không phải ${k1 + 1} khoảng.` },
      ]),
      explain: {
        steps: [
          { text: `${cap} ml, mỗi khoảng ${step} ml nên có ${cap} ÷ ${step} = ${p} phần bằng nhau.`, visual: bk(0, { labels: 'number' }) },
          { text: `${k1 * step} ml là ${k1} phần trong ${p} phần: ${fr(k1, p)} ${ves}.`, visual: bk(k1, { anim: 'fill' }) },
          { text: `${k2 * step} ml là ${k2} phần trong ${p} phần: ${fr(k2, p)} ${ves}.`, visual: bk(k2, { anim: 'fill' }) },
          { text: `Đáp án là ${A}.` },
        ],
      },
      meta: { p, step, k1, k2 },
    };
  },
  solve(item) { const { p, k1, k2 } = item.meta; return `a) ${fr(k1, p)} · b) ${fr(k2, p)}`; },
};

// g13.5: mũi tên có tên chữ chỉ vào vạch cách đáy k phần — bài 13.3
const g5 = {
  id: 'g13.5', covers: ['13.3'],
  make(rng) {
    const n = int(rng, 3, 9);
    let k;
    do { k = int(rng, 1, n - 1); } while (k === n - k);
    const type = pick(rng, ['jar', 'beaker', 'bar', 'ruler']);
    const vertical = type === 'jar' || type === 'beaker';
    const obj = type === 'jar' ? 'bình' : type === 'beaker' ? 'cốc đong' : type === 'bar' ? 'thanh gỗ' : 'cây thước';
    const start = vertical ? 'đáy' : 'đầu bên trái';
    const letter = pick(rng, ['A', 'B', 'C', 'M', 'N', 'P']);
    const whole = vertical ? `${cap1(obj)} 1 lít` : type === 'bar' ? 'Thanh gỗ dài 1 mét' : 'Cây thước dài 1 mét';
    const vis = (extra = {}) => (vertical
      ? { ...jar(n, 0), type, ...extra }
      : { kind: 'measure', type, parts: n, showTicks: true, labels: 'none', ...extra });
    const correct = fr(k, n);
    return {
      id: 'g13.5', src: '[biến thể mới]', type: 'choice',
      prompt: `${whole} chia thành ${n} phần bằng nhau. Mũi tên ${letter} chỉ vào vạch cách ${start} ${k} phần. Mũi tên ${letter} chỉ bao nhiêu phần của ${obj}?`,
      visual: vis({ pointer: { at: k, label: letter } }),
      hint: `Đếm từ ${start}, không đếm từ phía bên kia.`,
      choices: mkChoices(rng, correct, [
        { text: fr(n - k, n), code: 'NGƯỢC', why: `Đếm từ phía bên kia mới ra ${n - k}. Mình đếm từ ${start}: ${k} phần.` },
        { text: fr(k, n - 1), code: 'ĐẾM', why: `${n - 1} là số vạch ở giữa. Số phần bằng nhau của ${obj} là ${n}.` },
        { text: fr(k, n + 1), code: 'ĐẾM', why: `${n + 1} là số vạch kể cả hai đầu. Số phần bằng nhau là ${n}.` },
      ]),
      explain: {
        steps: [
          { text: `${cap1(obj)} có ${n} phần bằng nhau (đếm khoảng). Mẫu số là ${n}.`, visual: vis({ labels: 'number' }) },
          { text: `Từ ${start} lên tới mũi tên ${letter} là ${k} phần. Tử số là ${k}.`, visual: vis({ level: k, pointer: { at: k, label: letter }, anim: 'fill' }) },
          { text: `Mũi tên ${letter} chỉ ${correct} ${obj}. Đáp án là ${correct}.`, visual: { kind: 'fracshape', den: n, num: k, shape: vertical ? 'jar' : 'bar', label: true } },
        ],
      },
      meta: { n, k },
    };
  },
  solve(item) { return fr(item.meta.k, item.meta.n); },
};

// g13.6: nối bình với phân số chỉ mực nước — bài 13.6
const LETTER_SETS = [['A', 'B', 'C', 'D'], ['M', 'N', 'P', 'Q'], ['X', 'Y', 'Z', 'T']];
const g6 = {
  id: 'g13.6', covers: ['13.6'],
  make(rng) {
    const n = int(rng, 4, 10);
    const type = pick(rng, ['jar', 'beaker']);
    const noun = type === 'jar' ? 'bình' : 'cốc đong';
    const cnt = rng.next() < 0.7 || n < 5 ? 3 : 4;
    const letters = pick(rng, LETTER_SETS).slice(0, cnt);
    const ks = shuffle(rng, Array.from({ length: n - 1 }, (_, i) => i + 1)).slice(0, cnt);
    const liq = pick(rng, ['nước', 'sữa', 'nước cam', 'nước chanh']);
    const k0 = pick(rng, ks);
    const useUp = rng.next() < 0.5 && k0 < n - 1;
    const dd = useUp ? n + 1 : n - 1; // mẫu số nhiễu: số vạch / số vạch ở giữa
    const distText = fr(k0, dd);
    const right = ks.map((k) => ({ id: 'f' + k, text: fr(k, n) }));
    right.push({ id: 'x', text: distText });
    const left = letters.map((l, i) => ({ id: l, text: `${cap1(noun)} ${l}`, visual: { ...jar(n, ks[i]), type } }));
    const pairs = {}; letters.forEach((l, i) => { pairs[l] = 'f' + ks[i]; });
    const listTxt = letters.map((l, i) => `${noun} ${l} là ${fr(ks[i], n)}`).join(', ');
    return {
      id: 'g13.6', src: '[biến thể mới]', type: 'match',
      prompt: `${cnt === 3 ? 'Ba' : 'Bốn'} ${noun} ${letters.join(', ')} đều dung tích 1 lít, chia thành ${n} phần bằng nhau. Nối mỗi ${noun} với phân số chỉ mực ${liq}.`,
      hint: 'Mẫu số là số khoảng của cả bình. Đếm từ đáy lên.',
      left, right: shuffle(rng, right), pairs,
      explain: {
        steps: [
          { text: `Mỗi ${noun} có ${n} phần bằng nhau (đếm khoảng), nên mẫu số đều là ${n}.`, visual: { ...jar(n, 0, { labels: 'number' }), type } },
          { text: `Đếm từ đáy lên: ${letters.map((l, i) => `${noun} ${l} có ${ks[i]} phần`).join(', ')}.`, visual: { ...jar(n, ks[0]), type, anim: 'fill' } },
          { text: `Vậy ${listTxt}. Phân số ${distText} không hợp với ${noun} nào, vì ${dd} ${useUp ? 'là số vạch kể cả hai đầu' : 'là số vạch ở giữa'}, không phải số phần.` },
        ],
      },
      meta: { n, ks, letters },
    };
  },
  solve(item) {
    const { ks, letters } = item.meta; const o = {};
    letters.forEach((l, i) => { o[l] = 'f' + ks[i]; });
    return o;
  },
};

// g13.7: rót thêm / uống bớt — cộng, trừ phân số cùng mẫu số trên bình — bài 13.7
const g7 = {
  id: 'g13.7', covers: ['13.7'],
  make(rng) {
    const p = int(rng, 4, 10);
    const add = rng.next() < 0.6;
    let a, b;
    if (add) { a = int(rng, 1, p - 2); b = int(rng, 1, p - a); } else { a = int(rng, 3, p - 1); b = int(rng, 1, a - 1); }
    const r = add ? a + b : a - b;
    const name = pick(rng, NAMES);
    const type = pick(rng, ['jar', 'beaker']);
    const ves = pick(rng, VES[type]);
    const liq = pick(rng, LIQ);
    const txt = (x) => (x === p ? `Đầy ${ves} (${p}/${p} = 1 lít)` : `${fr(x, p)} lít`);
    const correct = txt(r);
    const v = (lv, extra = {}) => ({ ...jar(p, lv, extra), type });
    const prompt = add
      ? `${cap1(ves)} 1 lít chia thành ${p} phần bằng nhau. ${name} rót ${liq} đến ${fr(a, p)} lít, rồi rót thêm ${fr(b, p)} lít nữa. Bây giờ ${ves} có bao nhiêu ${liq}?`
      : `${cap1(ves)} 1 lít chia thành ${p} phần bằng nhau, đang có ${fr(a, p)} lít ${liq}. ${name} uống hết ${fr(b, p)} lít. Trong ${ves} còn lại bao nhiêu ${liq}?`;
    const wrongs = add
      ? [
        { text: `${a + b}/${2 * p} lít`, code: 'QUY', why: `Cộng hai phân số cùng mẫu số thì mình cộng tử số và giữ nguyên mẫu số: ${fr(a, p)} + ${fr(b, p)} = ${fr(a + b, p)}.` },
        { text: a === p - b ? `Chưa đầy ${ves} (${fr(a, p)} lít)` : `${fr(a, p)} lít`, code: 'QUY', why: `${name} còn rót THÊM ${fr(b, p)} lít nữa, nên ${liq} nhiều hơn ${fr(a, p)}.` },
        a !== b && Math.abs(a - b) !== a
          ? { text: `${Math.abs(a - b)}/${p} lít`, code: 'DẤU', why: `Rót thêm là CỘNG chứ không phải trừ: ${a} + ${b} = ${a + b}.` }
          : { text: `${a + b + 1}/${p} lít`, code: 'ĐẾM', why: `${a} phần cộng ${b} phần là ${a + b} phần, không phải ${a + b + 1}.` },
      ]
      : [
        { text: txt(a + b), code: 'DẤU', why: `Uống bớt là TRỪ chứ không phải cộng: ${a} − ${b} = ${a - b}.` },
        { text: `${fr(a, p)} lít`, code: 'QUY', why: `${name} đã uống ${fr(b, p)} lít, nên ${liq} phải ít hơn ${fr(a, p)}.` },
        { text: `${fr(b, p)} lít`, code: 'QUY', why: `${fr(b, p)} lít là phần đã uống. Phần còn lại là ${a} − ${b} = ${a - b} phần.` },
      ];
    return {
      id: 'g13.7', src: '[biến thể mới]', type: 'choice',
      prompt, visual: v(a),
      hint: add ? 'Rót thêm là thêm phần. Các phần đều bằng nhau.' : 'Uống bớt là bớt đi phần. Các phần đều bằng nhau.',
      choices: mkChoices(rng, correct, wrongs),
      explain: {
        steps: [
          { text: `Lúc đầu ${liq} có ${a} phần trong ${p} phần bằng nhau: ${fr(a, p)}.`, visual: v(a, { anim: 'fill' }) },
          { text: add ? `Rót thêm ${fr(b, p)} là thêm ${b} phần: ${a} phần + ${b} phần = ${r} phần.` : `Uống ${fr(b, p)} là bớt ${b} phần: ${a} phần − ${b} phần = ${r} phần.`, visual: v(r, { anim: 'fill' }) },
          { text: `${fr(r, p)} ${r === p ? `là cả ${ves}, bằng 1 lít` : 'lít'}. Đáp án là ${correct}.`, visual: { kind: 'fracshape', den: p, num: r, shape: 'jar', label: true } },
        ],
      },
      meta: { p, a, b, add, ves },
    };
  },
  solve(item) {
    const { p, a, b, add } = item.meta;
    const r = add ? a + b : a - b;
    return r === p ? `Đầy ${item.meta.ves} (${p}/${p} = 1 lít)` : `${r}/${p} lít`;
  },
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

  generators: [g1, g2, g3, g4, g5, g6, g7],
};
