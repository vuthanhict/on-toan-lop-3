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

// ---------- ngữ cảnh dùng chung cho bộ sinh ----------
const cap1 = (s) => s[0].toUpperCase() + s.slice(1);
const NAMES = ['An', 'Bình', 'Chi', 'Dũng', 'Hà', 'Lan', 'Minh', 'Nam', 'Mai', 'Phúc', 'Quân', 'Thu'];
const listVi = (a) => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' và ' + a[a.length - 1]);

// Bảng hình có trục đối xứng: c = số trục; mis = [số đếm nhầm thường gặp, lời giải]; expl = lời giải thích ngắn
const SH = {
  tgd: { name: 'tam giác đều', c: 3, spec: sh('triangle', { variant: 'equilateral' }), mis: [1, 'Tam giác đều có 3 đỉnh, mỗi đỉnh có một trục đi qua nó: 3 trục.'], expl: 'Mỗi đỉnh có một trục đi qua nó và đi qua điểm chính giữa cạnh đối diện' },
  vuong: { name: 'hình vuông', c: 4, spec: sh('square'), mis: [2, 'Hình vuông còn có hai đường chéo cũng là trục, ngoài đường dọc và đường ngang: 2 + 2 = 4.'], expl: 'Có 1 trục dọc, 1 trục ngang và 2 đường chéo' },
  cn: { name: 'hình chữ nhật (không phải hình vuông)', c: 2, spec: sh('rectangle'), mis: [4, 'Đường chéo của hình chữ nhật không phải trục: gấp theo đường chéo, hai nửa không trùng khít.'], expl: 'Chỉ có đường dọc và đường ngang ở giữa là trục, còn đường chéo thì không' },
  thoi: { name: 'hình thoi (không phải hình vuông)', c: 2, spec: sh('rhombus'), mis: [4, 'Hình thoi chỉ có hai đường chéo là trục. Đường dọc, đường ngang qua giữa các cạnh không phải trục.'], expl: 'Hai đường chéo là trục, còn các đường nối điểm chính giữa các cạnh thì không' },
  ng: { name: 'ngũ giác đều', c: 5, spec: sh('pentagon'), mis: [1, 'Ngũ giác đều có 5 đỉnh, mỗi đỉnh có một trục đi qua: 5 trục.'], expl: 'Mỗi đỉnh có một trục đi qua nó' },
  lg: { name: 'lục giác đều', c: 6, spec: sh('hexagon'), mis: [3, 'Lục giác đều có 3 trục qua các đỉnh và 3 trục qua điểm chính giữa các cạnh: 3 + 3 = 6.'], expl: 'Có 3 trục qua các đỉnh đối nhau và 3 trục qua điểm chính giữa các cạnh đối nhau' },
  bg: { name: 'bát giác đều', c: 8, spec: sh('octagon'), mis: [4, 'Bát giác đều có 4 trục qua các đỉnh và 4 trục qua điểm chính giữa các cạnh: 4 + 4 = 8.'], expl: 'Có 4 trục qua các đỉnh đối nhau và 4 trục qua điểm chính giữa các cạnh đối nhau' },
  tgc: { name: 'tam giác cân (không đều)', c: 1, spec: sh('triangle', { variant: 'isosceles' }), mis: [3, 'Chỉ tam giác đều mới có 3 trục. Tam giác cân (không đều) chỉ có trục đi qua đỉnh và điểm giữa đáy.'], expl: 'Chỉ có một trục đi qua đỉnh và điểm chính giữa cạnh đáy' },
  tim: { name: 'trái tim', c: 1, spec: sh('heart'), mis: [2, 'Trái tim chỉ gấp được theo đường dọc ở giữa. Gấp theo đường ngang thì hai nửa không trùng khít.'], expl: 'Chỉ gấp theo đường dọc ở giữa thì hai nửa mới trùng khít' },
  dhc: { name: 'đồng hồ cát', c: 2, spec: sh('hourglass'), mis: [1, 'Đồng hồ cát gấp theo đường dọc được, gấp theo đường ngang cũng được: 2 trục.'], expl: 'Gấp theo đường dọc và gấp theo đường ngang ở giữa đều trùng khít' },
  dieu: { name: 'hình cái diều', c: 1, spec: sh('kite'), mis: [2, 'Hình cái diều chỉ có một trục là đường chéo dài. Đường chéo ngắn không phải trục.'], expl: 'Chỉ gấp theo đường chéo dài thì hai nửa mới trùng khít' },
  htc: { name: 'hình thang cân', c: 1, spec: sh('trapezoid'), mis: [2, 'Hình thang cân chỉ có trục dọc ở giữa. Gấp theo đường ngang thì hai nửa không trùng khít.'], expl: 'Chỉ gấp theo đường dọc ở giữa thì hai nửa mới trùng khít' },
  sao: { name: 'ngôi sao năm cánh', c: 5, spec: sh('star'), mis: [1, 'Ngôi sao năm cánh có 5 trục, mỗi trục đi qua một cánh sao.'], expl: 'Mỗi cánh sao có một trục đi qua nó' },
};
const KEYS = Object.keys(SH);
const byCount = (c) => KEYS.filter((k) => SH[k].c === c);
const axesOf = (k) => ({ ...SH[k].spec, axes: ['all'] });

// ---------- bộ sinh ----------
// g15.1: điền số trục đối xứng của 3 hình — bài 15.1
const g1 = {
  id: 'g15.1', covers: ['15.1'],
  make(rng) {
    const ks = shuffle(rng, KEYS).slice(0, 3);
    const answers = ks.map((k) => SH[k].c);
    const wh = [];
    ks.forEach((k, i) => {
      const w = SH[k].mis[0];
      if (w === answers[i]) return;
      const arr = answers.slice(); arr[i] = w;
      wh.push({ match: arr.join('|'), code: 'ĐẾM', why: SH[k].mis[1] });
    });
    const t = int(rng, 0, 2);
    const prompt = t === 0 ? 'Điền số trục đối xứng của mỗi hình.' : t === 1 ? 'Mỗi hình dưới đây có bao nhiêu trục đối xứng? Điền số vào chỗ trống.' : 'Con hãy đếm và điền số trục đối xứng của từng hình.';
    return {
      id: 'g15.1', src: '[biến thể mới]', type: 'numpad',
      prompt: `${prompt} (${ks.map((k) => SH[k].name.replace(/ \(.*\)/, '')).join(', ')})`,
      visual: SH[ks[1]].spec,
      hint: 'Thử gấp đôi hình: có mấy đường gấp cho hai nửa trùng khít?',
      slots: ks.map((k, i) => ({ label: `${'abc'[i]}) ${cap1(SH[k].name)} có`, answer: String(SH[k].c), len: 1, unit: 'trục' })),
      wrongHints: wh,
      explain: {
        steps: [
          ...ks.map((k) => ({ text: `${cap1(SH[k].name)}: ${SH[k].expl}. Vậy có ${SH[k].c} trục.`, visual: axesOf(k) })),
          { text: `Đáp án là ${answers.join('; ')}.` },
        ],
      },
      meta: { ks },
    };
  },
  solve(item) { return item.meta.ks.map((k) => String(SH[k].c)).join('|'); },
};

// g15.2: hình nào có đúng k trục — bài 15.7
const g2 = {
  id: 'g15.2', covers: ['15.7'],
  make(rng) {
    const k = pick(rng, [1, 2, 3, 4, 5, 6, 8]);
    const kCorrect = pick(rng, byCount(k));
    const others = shuffle(rng, [1, 2, 3, 4, 5, 6, 8].filter((x) => x !== k)).slice(0, 3).map((c) => pick(rng, byCount(c)));
    const correct = SH[kCorrect].name;
    const wrongs = others.map((o) => ({
      text: SH[o].name, code: 'ĐẾM', visual: SH[o].spec,
      why: `${cap1(SH[o].name)} có ${SH[o].c} trục, không phải ${k} trục.`,
    }));
    const t = int(rng, 0, 2);
    const prompt = t === 0 ? `Hình nào dưới đây có đúng ${k} trục đối xứng?` : t === 1 ? `Chọn hình có đúng ${k} trục đối xứng.` : `Một hình có đúng ${k} trục đối xứng. Đó là hình nào trong các hình sau?`;
    return {
      id: 'g15.2', src: '[biến thể mới]', type: 'choice',
      prompt,
      hint: 'Tưởng tượng gấp đôi hình: có mấy đường gấp cho hai nửa trùng khít?',
      layout: 'grid2',
      choices: mkChoices(rng, correct, wrongs, { visual: SH[kCorrect].spec }),
      explain: {
        steps: [
          { text: 'Đếm số đường gấp cho hai nửa trùng khít của từng hình.', visual: SH[kCorrect].spec },
          { text: `${cap1(correct)}: ${SH[kCorrect].expl}. Vậy có ${k} trục.`, visual: { ...axesOf(kCorrect), anim: 'fold' } },
          { text: `${others.map((o) => `${SH[o].name} có ${SH[o].c} trục`).join('; ')}. Đáp án là ${correct}.` },
        ],
      },
      meta: { k, keys: [kCorrect, ...others] },
    };
  },
  solve(item) { const { k, keys } = item.meta; return SH[keys.find((x) => SH[x].c === k)].name; },
};

// g15.3: xếp theo số trục (bài luyện thêm)
const g3 = {
  id: 'g15.3',
  make(rng) {
    const counts = shuffle(rng, [1, 2, 3, 4, 5, 6, 8]).slice(0, 4);
    const info = counts.map((c) => ({ c, name: SH[pick(rng, byCount(c))].name }));
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
          { text: `Đếm số trục. ${info.map((x) => `${cap1(x.name)} có ${x.c} trục`).join('. ')}.` },
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

// g15.4: một hình có bao nhiêu trục — bài 15.2
const g4 = {
  id: 'g15.4', covers: ['15.2'],
  make(rng) {
    const key = pick(rng, KEYS);
    const s = SH[key];
    const c = s.c;
    const cand = [s.mis[0], c + 1, c - 1, c + 2, c * 2, 1, 2, 3, 4].filter((x) => x >= 1 && x !== c);
    const ws = [];
    cand.forEach((x) => { if (!ws.includes(x)) ws.push(x); });
    const head = ws.shift();
    const rest = shuffle(rng, ws.slice(0, 5)).slice(0, 2);
    const wrongs = [head, ...rest].map((w, i) => ({
      text: `${w} trục`, code: i === 0 ? 'QUY' : 'ĐẾM',
      why: i === 0 ? s.mis[1] : w > c ? `Gấp thử từng đường: chỉ có ${c} đường làm hai nửa trùng khít, không tới ${w}.` : `Còn đường gấp khác cũng làm hai nửa trùng khít, nên có nhiều hơn ${w} trục.`,
    }));
    const t = int(rng, 0, 2);
    const prompt = t === 0 ? `${cap1(s.name)} có bao nhiêu trục đối xứng?` : t === 1 ? `Hình trong hình là ${s.name}. Hình đó có bao nhiêu trục đối xứng?` : `Con hãy đếm số trục đối xứng của ${s.name} (xem hình).`;
    return {
      id: 'g15.4', src: '[biến thể mới]', type: 'choice',
      prompt,
      visual: s.spec,
      hint: 'Thử gấp theo đường dọc, đường ngang, rồi đường chéo.',
      choices: mkChoices(rng, `${c} trục`, wrongs),
      explain: {
        steps: [
          { text: 'Gấp đôi hình theo từng đường, xem hai nửa có trùng khít không.', visual: s.spec },
          { text: `${s.expl}. Vậy có ${c} trục.`, visual: { ...axesOf(key), anim: 'fold' } },
          { text: `Đáp án là ${c} trục.` },
        ],
      },
      meta: { key },
    };
  },
  solve(item) { return `${SH[item.meta.key].c} trục`; },
};

// g15.5: cắt góc hình vuông / chữ nhật, đếm trục bằng phép phản xạ — bài 15.3
function cutShape(box, cuts, c) {
  const [x0, y0, x1, y1] = box; const pts = [];
  if (cuts[0]) pts.push([x0, y0 + c], [x0 + c, y0]); else pts.push([x0, y0]);
  if (cuts[1]) pts.push([x1 - c, y0], [x1, y0 + c]); else pts.push([x1, y0]);
  if (cuts[2]) pts.push([x1, y1 - c], [x1 - c, y1]); else pts.push([x1, y1]);
  if (cuts[3]) pts.push([x0 + c, y1], [x0, y1 - c]); else pts.push([x0, y1]);
  return pts;
}
// các đường gấp ứng viên và phép phản xạ qua chúng (tâm hộp)
function symLines(box) {
  const [x0, y0, x1, y1] = box; const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2; const sq = Math.abs((x1 - x0) - (y1 - y0)) < 1e-9;
  const L = [
    { id: 'v', f: ([x, y]) => [2 * cx - x, y] },
    { id: 'h', f: ([x, y]) => [x, 2 * cy - y] },
  ];
  if (sq) { L.push({ id: 'd1', f: ([x, y]) => [cx + (y - cy), cy + (x - cx)] }, { id: 'd2', f: ([x, y]) => [cx - (y - cy), cy - (x - cx)] }); }
  else { L.push({ id: 'd1', f: null }, { id: 'd2', f: null }); }
  return L;
}
function axesList(pts, box) {
  const key = (p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`;
  const set = new Set(pts.map(key));
  return symLines(box).filter((l) => l.f && pts.every((p) => set.has(key(l.f(p))))).map((l) => l.id);
}
const axisName = { v: 'đường dọc ở giữa', h: 'đường ngang ở giữa', d1: 'đường chéo nối góc trên bên trái với góc dưới bên phải', d2: 'đường chéo nối góc trên bên phải với góc dưới bên trái' };
const CUT_PATTERNS = [[1, 0, 0, 0], [1, 1, 0, 0], [1, 0, 1, 0], [1, 1, 1, 1]];
const rot = (a, r) => a.map((_, i) => a[(i + r) % 4]);
const g5 = {
  id: 'g15.5', covers: ['15.3'],
  make(rng) {
    let out = null;
    for (let tries = 0; tries < 60 && !out; tries++) {
      const isSq = rng.next() < 0.7;
      const box = isSq ? [10, 10, 90, 90] : (rng.next() < 0.5 ? [6, 24, 94, 76] : [24, 6, 76, 94]);
      const base = pick(rng, CUT_PATTERNS);
      const cuts = rot(base, int(rng, 0, 3));
      const c = isSq ? int(rng, 12, 28) : int(rng, 10, 18);
      const pts = cutShape(box, cuts, c);
      const ax = axesList(pts, box);
      if (ax.length === 0) continue;
      out = { isSq, box, cuts, c, pts, ax, base };
    }
    const { isSq, box, cuts, c, pts, ax } = out;
    const k = ax.length;
    const wide = box[2] - box[0] > box[3] - box[1];
    const where = ['góc trên bên trái', 'góc trên bên phải', 'góc dưới bên phải', 'góc dưới bên trái'];
    const idx = cuts.map((x, i) => (x ? i : -1)).filter((i) => i >= 0);
    const frame = isSq ? 'hình vuông' : 'hình chữ nhật';
    let desc;
    if (idx.length === 1) desc = `Con cắt bỏ ${where[idx[0]]} của một ${frame}`;
    else if (idx.length === 4) desc = `Con cắt bỏ cả bốn góc của một ${frame} (các vết cắt bằng nhau)`;
    else if ((idx[1] - idx[0]) % 2 === 0) desc = `Con cắt bỏ hai góc ở hai đầu của một đường chéo ${isSq ? 'hình vuông' : 'hình chữ nhật'} (hai vết cắt bằng nhau)`;
    else {
      const topBottom = (idx[0] === 0 && idx[1] === 1) || (idx[0] === 2 && idx[1] === 3);
      desc = isSq ? `Con cắt bỏ hai góc cạnh nhau của một hình vuông (hai vết cắt bằng nhau)` : `Con cắt bỏ hai góc ở hai đầu của một cạnh ${topBottom === wide ? 'dài' : 'ngắn'} của một ${frame} (hai vết cắt bằng nhau, hình không phải hình vuông)`;
    }
    const cx = 50, cy = 50, e = 5;
    const lineOf = (id) => {
      const [x0, y0, x1, y1] = box;
      if (id === 'v') return { x1: cx, y1: y0 - e, x2: cx, y2: y1 + e };
      if (id === 'h') return { x1: x0 - e, y1: cy, x2: x1 + e, y2: cy };
      if (id === 'd1') return { x1: x0 - e, y1: y0 - e, x2: x1 + e, y2: y1 + e };
      return { x1: x1 + e, y1: y0 - e, x2: x0 - e, y2: y1 + e };
    };
    const all = ['v', 'h', 'd1', 'd2'];
    const non = all.filter((x) => !ax.includes(x));
    const shape = (axes) => sh('custom', { points: pts, axes: axes.map(lineOf) });
    const namesOf = (ids) => (ids.includes('d1') && ids.includes('d2') ? [...ids.filter((x) => x === 'v' || x === 'h').map((x) => axisName[x]), 'hai đường chéo'] : ids.map((x) => axisName[x]));
    const wrongCounts = [0, 1, 2, 3, 4].filter((x) => x !== k);
    const picked = shuffle(rng, wrongCounts).slice(0, 3);
    const why = (w) => {
      if (w === 0) return `Hãy thử gấp theo ${axisName[ax[0]]}: hai nửa trùng khít, nên hình vẫn có trục.`;
      if (w > k) return non.length ? `Gấp theo ${axisName[non[0]]} thì hai nửa không trùng khít, nên chỉ có ${k} trục, không phải ${w}.` : `Thử gấp theo từng đường dọc, ngang, chéo: chỉ có ${k} đường làm hai nửa trùng khít, không phải ${w}.`;
      return `Còn đường gấp khác cũng làm hai nửa trùng khít (${ax.map((x) => axisName[x]).join('; ')}), nên không chỉ có ${w} trục.`;
    };
    const correct = `${k} trục`;
    const steps = [
      { text: `Hình gốc là ${frame}, bị cắt bỏ ${idx.length === 4 ? 'cả bốn góc' : `${idx.length} góc`}. Ta thử gấp theo các đường dọc, ngang và chéo.`, visual: shape([]) },
      { text: `Gấp theo ${listVi(namesOf(ax))}: hai nửa trùng khít. Có ${k} trục.`, visual: shape(ax), mark: 'good' },
    ];
    if (non.length) steps.push({ text: `Gấp theo ${listVi(namesOf(non))} thì hai nửa lệch nhau, không phải trục.`, visual: shape(non), mark: 'bad' });
    steps.push({ text: `Vậy hình mới có ${k} trục đối xứng. Đáp án là ${correct}.` });
    return {
      id: 'g15.5', src: '[biến thể mới]', type: 'choice',
      prompt: `${desc}, được hình như trong hình vẽ. Hình mới có bao nhiêu trục đối xứng?`,
      visual: sh('custom', { points: pts }),
      hint: 'Tưởng tượng gấp tờ giấy theo từng đường dọc, ngang và chéo.',
      choices: mkChoices(rng, correct, picked.map((w) => ({ text: `${w} trục`, code: w > k ? 'QUY' : 'ĐẾM', why: why(w) }))),
      explain: { steps },
      meta: { points: pts, box },
    };
  },
  solve(item) { return `${axesList(item.meta.points, item.meta.box).length} trục`; },
};

// g15.6: chọn tất cả các câu đúng về hình phẳng, đa giác, trục đối xứng — bài 15.4
const BANK = {
  plane: { t: 'Hình phẳng chỉ có chiều dài và chiều rộng.', f: ['Mọi hình phẳng đều có một góc vuông.', 'Hình phẳng có cả chiều dài, chiều rộng và chiều cao.'], w: ['Hình tròn là hình phẳng nhưng không có góc vuông nào.', 'Hình phẳng nằm trên mặt giấy, chỉ có chiều dài và chiều rộng.'], v: sh('circle') },
  circ: { t: 'Hình tròn không phải là đa giác.', f: ['Hình tròn là đa giác vì nó khép kín.'], w: ['Đa giác phải có các cạnh thẳng. Đường viền hình tròn là đường cong.'], v: sh('circle') },
  straight: { t: 'Đa giác chỉ có các cạnh thẳng.', f: ['Đa giác có từ 3 cạnh thẳng trở lên và có một cạnh cong.'], w: ['Đa giác chỉ có các cạnh thẳng. Hình có cạnh cong thì không phải đa giác.'], v: sh('pentagon') },
  three: { t: 'Đa giác có từ 3 cạnh trở lên.', f: ['Đa giác có thể chỉ có 2 cạnh.'], w: ['Đa giác có từ 3 cạnh trở lên, ít nhất là tam giác.'], v: sh('triangle', { variant: 'equilateral' }) },
  sq: { t: 'Hình vuông có 4 trục đối xứng.', f: ['Hình vuông chỉ có 2 trục đối xứng.'], w: ['Hình vuông còn có hai đường chéo cũng là trục: 2 + 2 = 4 trục.'], v: sh('square', { axes: ['all'] }) },
  tri: { t: 'Tam giác đều có 3 trục đối xứng.', f: ['Tam giác đều chỉ có 1 trục đối xứng.'], w: ['Mỗi đỉnh của tam giác đều có một trục đi qua nó: 3 trục.'], v: sh('triangle', { variant: 'equilateral', axes: ['all'] }) },
  diag: { t: 'Đường chéo của hình chữ nhật (không phải hình vuông) không phải là trục đối xứng.', f: ['Đường chéo của hình chữ nhật (không phải hình vuông) là trục đối xứng.'], w: ['Gấp theo đường chéo của hình chữ nhật, hai nửa không trùng khít.'], v: sh('rectangle', { axes: ['d1'] }) },
  heart: { t: 'Trái tim không phải là đa giác.', f: ['Trái tim là đa giác.'], w: ['Trái tim có cạnh cong nên không phải đa giác.'], v: sh('heart') },
  hex: { t: 'Lục giác đều có 6 trục đối xứng.', f: ['Lục giác đều có 3 trục đối xứng.'], w: ['Lục giác đều có 3 trục qua các đỉnh và 3 trục qua điểm chính giữa các cạnh: 6 trục.'], v: sh('hexagon', { axes: ['all'] }) },
  rect: { t: 'Hình chữ nhật (không phải hình vuông) có 2 trục đối xứng.', f: ['Hình chữ nhật (không phải hình vuông) có 4 trục đối xứng.'], w: ['Hình chữ nhật chỉ có đường dọc và đường ngang là trục: 2 trục.'], v: sh('rectangle', { axes: ['v', 'h'] }) },
  rhom: { t: 'Hình thoi là đa giác vì có 4 cạnh thẳng.', f: ['Hình thoi không phải là đa giác.'], w: ['Hình thoi có 4 cạnh thẳng nên là đa giác.'], v: sh('rhombus') },
  axisdef: { t: 'Trục đối xứng là đường gấp để hai nửa trùng khít nhau.', f: ['Trục đối xứng là đường chia hình thành hai phần bất kì.'], w: ['Gấp theo trục đối xứng thì hai nửa phải trùng khít nhau.'], v: sh('rectangle', { axes: ['v'], fold: true }) },
  circplane: { t: 'Hình tròn là hình phẳng.', f: ['Hình tròn không phải là hình phẳng.'], w: ['Hình tròn nằm trên mặt giấy, chỉ có chiều dài và chiều rộng, nên là hình phẳng.'], v: sh('circle') },
  pent: { t: 'Ngũ giác đều có 5 trục đối xứng.', f: ['Ngũ giác đều chỉ có 1 trục đối xứng.'], w: ['Mỗi đỉnh của ngũ giác đều có một trục đi qua nó: 5 trục.'], v: sh('pentagon', { axes: ['all'] }) },
};
const BANK_KEYS = Object.keys(BANK);
const g6 = {
  id: 'g15.6', covers: ['15.4'],
  make(rng) {
    const nT = rng.next() < 0.6 ? 2 : 3;
    const gs = shuffle(rng, BANK_KEYS).slice(0, 4);
    const sel = gs.map((g, i) => {
      const b = BANK[g];
      if (i < nT) return { g, ok: true, text: b.t, why: null };
      const j = int(rng, 0, b.f.length - 1);
      return { g, ok: false, text: b.f[j], why: b.w[j] };
    });
    const prompt = pick(rng, ['Chọn TẤT CẢ các câu ĐÚNG.', 'Những câu nào dưới đây ĐÚNG? Chọn tất cả các câu đúng.']);
    const rightOnes = sel.filter((x) => x.ok), wrongOnes = sel.filter((x) => !x.ok);
    const steps = shuffle(rng, sel).map((x) => (x.ok
      ? { text: `"${x.text}" là câu ĐÚNG.`, visual: BANK[x.g].v, mark: 'good' }
      : { text: `"${x.text}" là câu SAI. ${x.why}`, visual: BANK[x.g].v, mark: 'bad' }));
    steps.push({ text: `Vậy các câu đúng là: ${rightOnes.map((x) => `"${x.text}"`).join('; ')}.` });
    return {
      id: 'g15.6', src: '[biến thể mới]', type: 'multi',
      prompt,
      hint: 'Nhớ: đa giác chỉ có cạnh thẳng. Trục đối xứng là đường gấp cho hai nửa trùng khít.',
      layout: 'list',
      choices: shuffle(rng, sel).map((x) => (x.ok ? { text: x.text, correct: true } : { text: x.text, code: 'QUY', why: x.why })),
      explain: { steps },
      meta: { trueGroups: rightOnes.map((x) => x.g), nWrong: wrongOnes.length },
    };
  },
  solve(item) { return item.meta.trueGroups.map((g) => BANK[g].t).sort().join(','); },
};

// g15.7: đa giác hay không phải đa giác — bài 15.5
const POLYS = [
  { id: 'tg', t: 'tam giác', s: sh('triangle', { variant: 'scalene' }) }, { id: 'vuong', t: 'hình vuông', s: sh('square') }, { id: 'cn', t: 'hình chữ nhật', s: sh('rectangle') },
  { id: 'thoi', t: 'hình thoi', s: sh('rhombus') }, { id: 'thang', t: 'hình thang', s: sh('trapezoid') }, { id: 'bhanh', t: 'hình bình hành', s: sh('parallelogram') },
  { id: 'ng', t: 'ngũ giác', s: sh('pentagon') }, { id: 'lg', t: 'lục giác', s: sh('hexagon') }, { id: 'bg', t: 'bát giác', s: sh('octagon') },
  { id: 'nha', t: 'hình ngôi nhà', s: sh('house') }, { id: 'dieu', t: 'hình cái diều', s: sh('kite') }, { id: 'L', t: 'hình chữ L', s: sh('L') }, { id: 'sao', t: 'hình ngôi sao', s: sh('star') },
];
const NONPOLYS = [
  { id: 'tron', t: 'hình tròn', s: sh('circle') }, { id: 'tim', t: 'trái tim', s: sh('heart') }, { id: 'nuatron', t: 'nửa hình tròn', s: null },
  { id: 'bauduc', t: 'hình bầu dục', s: null }, { id: 'quat', t: 'hình quạt', s: null }, { id: 'giot', t: 'hình giọt nước', s: null },
];
const POLY_IDS = new Set(POLYS.map((p) => p.id));
const g7 = {
  id: 'g15.7', covers: ['15.5'],
  make(rng) {
    const nP = rng.next() < 0.55 ? 4 : 3;
    const ps = shuffle(rng, POLYS).slice(0, nP), ns = shuffle(rng, NONPOLYS).slice(0, 6 - nP);
    const chips = shuffle(rng, [...ps, ...ns]).map((x) => ({ id: x.id, text: x.t }));
    const answer = {}; ps.forEach((x) => { answer[x.id] = 'dg'; }); ns.forEach((x) => { answer[x.id] = 'kdg'; });
    const t = int(rng, 0, 2);
    const prompt = t === 0 ? 'Hình nào là đa giác? Xếp mỗi hình vào đúng ô.' : t === 1 ? 'Phân loại các hình sau: đa giác hay không phải đa giác? Xếp mỗi hình vào đúng ô.' : 'Xếp mỗi hình vào đúng ô: là đa giác hoặc KHÔNG là đa giác.';
    const nsVis = ns.find((x) => x.s);
    return {
      id: 'g15.7', src: '[biến thể mới]', type: 'classify',
      prompt,
      hint: 'Đa giác chỉ có các cạnh thẳng.',
      chips, buckets: [{ id: 'dg', text: 'Là đa giác' }, { id: 'kdg', text: 'KHÔNG là đa giác' }], answer,
      explain: {
        steps: [
          { text: 'Đa giác là hình phẳng chỉ có các cạnh THẲNG, từ 3 cạnh trở lên.', visual: ps[0].s },
          { text: `${cap1(listVi(ps.map((x) => x.t)))} có toàn cạnh thẳng nên là đa giác.`, visual: ps[ps.length - 1].s, mark: 'good' },
          { text: `${cap1(listVi(ns.map((x) => x.t)))} có cạnh cong nên KHÔNG là đa giác.`, ...(nsVis ? { visual: nsVis.s } : {}), mark: 'bad' },
        ],
      },
      meta: { ids: [...ps, ...ns].map((x) => x.id) },
    };
  },
  solve(item) { const o = {}; item.meta.ids.forEach((id) => { o[id] = POLY_IDS.has(id) ? 'dg' : 'kdg'; }); return o; },
};

// g15.8: ghép hai đa giác đều chung một cạnh — đếm cạnh (hoặc đỉnh) — bài 15.6
const REG = { 3: ['tam giác đều', 'triangle'], 4: ['hình vuông', 'square'], 5: ['ngũ giác đều', 'pentagon'], 6: ['lục giác đều', 'hexagon'], 8: ['bát giác đều', 'octagon'] };
const regFromEdge = (n) => { // đa giác đều cạnh 1 nằm phía trên cạnh PQ: P=(0,0), Q=(1,0); đỉnh P, Q, ... ngược chiều kim đồng hồ
  const cx = 0.5, cy = 1 / (2 * Math.tan(Math.PI / n)), R = 1 / (2 * Math.sin(Math.PI / n)), a0 = Math.atan2(-cy, -cx);
  return Array.from({ length: n }, (_, k) => [cx + R * Math.cos(a0 + k * 2 * Math.PI / n), cy + R * Math.sin(a0 + k * 2 * Math.PI / n)]);
};
function glue(n1, n2, rot90) {
  const A = regFromEdge(n1), B = regFromEdge(n2).map(([x, y]) => [x, -y]);
  let out = [...A.slice(2), A[0]];
  for (let k = n2 - 1; k >= 2; k--) out.push(B[k]);
  out.push(A[1]);
  out = out.map(([x, y]) => [x, -y]); // y hướng xuống như màn hình
  if (rot90) out = out.map(([x, y]) => [-y, x]);
  const xs = out.map((p) => p[0]), ys = out.map((p) => p[1]);
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys), s = Math.min(88 / w, 88 / h);
  const mx = (Math.max(...xs) + Math.min(...xs)) / 2, my = (Math.max(...ys) + Math.min(...ys)) / 2;
  return out.map(([x, y]) => [+(50 + (x - mx) * s).toFixed(2), +(50 + (y - my) * s).toFixed(2)]);
}
const PAIRS = []; [3, 4, 5, 6, 8].forEach((a) => [3, 4, 5, 6, 8].forEach((b) => { if (!((a - 2) * b + (b - 2) * a === a * b)) PAIRS.push([a, b]); }));
const sidesOf = (n1, n2) => n1 + n2 - 2 - ((n1 - 2) * n2 + (n2 - 2) * n1 === n1 * n2 ? 2 : 0);
const g8 = {
  id: 'g15.8', covers: ['15.6'],
  make(rng) {
    const [n1, n2] = pick(rng, PAIRS);
    const askV = rng.next() < 0.35;
    const w = askV ? 'đỉnh' : 'cạnh';
    const total = n1 + n2, r = total - 2;
    const pts = glue(n1, n2, rng.next() < 0.5);
    const [N1, N2] = [REG[n1][0], REG[n2][0]];
    const same = n1 === n2;
    const t = int(rng, 0, 2);
    const prompt = t === 0 ? `Ghép một ${N1} với một ${N2} có cạnh bằng nhau, chung một cạnh (xem hình). Hình mới có bao nhiêu ${w}?`
      : t === 1 ? `${pick(rng, NAMES)} ghép ${same ? `hai ${N1}` : `một ${N1} và một ${N2}`} có cạnh bằng nhau, chung một cạnh, được hình như trong hình vẽ. Đường viền ngoài của hình mới có bao nhiêu ${w}?`
        : `Hai hình ${same ? `đều là ${N1}` : `là ${N1} và ${N2}`}, cạnh bằng nhau, được ghép chung một cạnh (xem hình). Hình mới có bao nhiêu ${w}?`;
    const correct = `${r} ${w}`;
    const down = r - 1 >= 3 ? r - 1 : r + 1;
    return {
      id: 'g15.8', src: '[biến thể mới]', type: 'choice',
      prompt,
      visual: sh('custom', { points: pts }),
      hint: askV ? 'Hai đỉnh nằm trên cạnh chung được tính chung cho cả hai hình.' : 'Con chỉ đếm các cạnh trên đường viền ngoài.',
      choices: mkChoices(rng, correct, [
        { text: `${total} ${w}`, code: 'QUY', why: askV ? `${n1} + ${n2} = ${total}, nhưng hai đỉnh ở đầu cạnh chung bị tính hai lần: ${total} − 2 = ${r}.` : `${n1} + ${n2} = ${total}, nhưng cạnh chung bị che mất, không còn nằm trên đường viền: mỗi hình mất 1 cạnh, ${total} − 2 = ${r}.` },
        { text: `${total - 1} ${w}`, code: 'ĐẾM', why: `Hãy đếm lại ${askV ? 'các đỉnh' : 'các đoạn'} trên đường viền ngoài: chỉ có ${r}.` },
        { text: `${r + 2 === total ? down : r + 2} ${w}`, code: 'ĐẾM', why: `Hãy đếm lại ${askV ? 'các đỉnh' : 'các đoạn'} trên đường viền ngoài: có ${r}, không phải số này.` },
      ]),
      explain: {
        steps: [
          { text: `${cap1(N1)} có ${n1} ${askV ? 'đỉnh' : 'cạnh'}, ${N2} có ${n2} ${askV ? 'đỉnh' : 'cạnh'}: ${n1} + ${n2} = ${total}.`, visual: sh(REG[n1][1]) },
          { text: askV ? `Hai hình chung một cạnh nên hai đỉnh ở đầu cạnh chung bị tính hai lần. Bớt đi 2: ${total} − 2 = ${r}.` : `Hai hình chung một cạnh. Cạnh chung ở bên trong nên không còn trên đường viền. Mỗi hình mất 1 cạnh, nên ${total} − 2 = ${r}.`, visual: sh('custom', { points: pts }) },
          { text: `Đếm đường viền ngoài của hình mới: ${r} ${w}. Đáp án là ${correct}.`, visual: sh('custom', { points: pts }) },
        ],
      },
      meta: { n1, n2, w },
    };
  },
  solve(item) { const { n1, n2, w } = item.meta; return `${sidesOf(n1, n2)} ${w}`; },
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

  generators: [g1, g2, g3, g4, g5, g6, g7, g8],
};
