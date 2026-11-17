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

// ---------- ngữ cảnh dùng chung cho bộ sinh ----------
const NAMES = ['An', 'Bình', 'Chi', 'Dũng', 'Hà', 'Lan', 'Minh', 'Nam', 'Mai', 'Phúc', 'Quân', 'Thu'];
const LETTERS = ['A', 'B', 'C', 'D', 'M', 'N', 'P', 'Q'];
const R = (a, b, step = 1) => { const o = []; for (let x = a; x <= b; x += step) o.push(x); return o; };
const cap1 = (s) => s[0].toUpperCase() + s.slice(1);
const cmpWord = (d) => (d < 90 ? 'bé hơn' : d === 90 ? 'đúng bằng' : 'lớn hơn');
const sqSpec = (d) => (d === 90 ? { show: 'square' } : {});
// danh sách "a, b và c"
const listVi = (a) => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' và ' + a[a.length - 1]);

// ---------- bộ sinh ----------
// g14.1: phân loại 1 góc đã cho số đo
const g1 = {
  id: 'g14.1',
  make(rng) {
    const r = int(rng, 1, 6);
    const trap = rng.next() < 0.3;
    let d;
    if (r === 1) d = 90;
    else if (r <= 3) d = trap ? int(rng, 76, 89) : int(rng, 12, 72); // nhọn
    else d = trap ? int(rng, 91, 106) : int(rng, 108, 168); // tù
    const L = pick(rng, LETTERS);
    const name = pick(rng, NAMES);
    const kind = kindOf(d);
    const correct = kindText(d);
    const cmpTxt = cmpWord(d);
    const whyFor = (k) => {
      if (k === 'nhọn') return `Góc nhọn phải bé hơn 90°. ${d}° ${cmpTxt} 90°.`;
      if (k === 'vuông') return `Chỉ góc đúng 90° mới là góc vuông. ${d}° ${cmpTxt} 90°${Math.abs(d - 90) <= 15 ? ', dù nhìn có vẻ gần' : ''}.`;
      return `Góc tù phải lớn hơn 90°. ${d}° ${cmpTxt} 90°.`;
    };
    const wrongs = ['nhọn', 'vuông', 'tù'].filter((k) => k !== kind).map((k) => ({ text: `góc ${k}`, code: 'QUY', why: whyFor(k) }));
    const t = int(rng, 0, 2);
    const prompt = t === 0 ? `Góc ${L} có số đo ${d}° (xem hình). Đây là góc gì?`
      : t === 1 ? `${name} đo góc ${L} bằng thước đo độ và được ${d}°. Góc ${L} là góc gì?`
        : `Góc ${L} trong hình có số đo ${d}°. Con hãy cho biết đó là góc nhọn, góc vuông hay góc tù?`;
    return {
      id: 'g14.1', src: '[biến thể mới]', type: 'choice',
      prompt,
      visual: ang(d, { label: L, ...sqSpec(d) }),
      hint: 'So số đo với mốc 90° (góc vuông).',
      choices: mkChoices(rng, correct, wrongs),
      explain: {
        steps: [
          { text: 'Mốc để so sánh là góc vuông 90°. Bé hơn 90° là nhọn, lớn hơn 90° là tù.', visual: cmp([{ label: 'nhọn', deg: 50 }, { label: 'vuông', deg: 90 }, { label: 'tù', deg: 130 }], { name: true }) },
          { text: `${d}° ${cmpTxt} 90°.`, visual: ang(d, { label: L, anim: 'open' }) },
          { text: `Vậy góc ${L} là ${correct}. Đáp án là ${correct}.`, visual: ang(d, { label: L, name: true }) },
        ],
      },
      meta: { d },
    };
  },
  solve(item) { return kindText(item.meta.d); },
};

// g14.2: xếp thứ tự các góc — bài 14.3
const g2 = {
  id: 'g14.2', covers: ['14.3'],
  make(rng) {
    const count = rng.next() < 0.6 ? 5 : 4;
    const list = [];
    const okAdd = (d) => list.every((x) => Math.abs(x - d) >= 10);
    if (rng.next() < 0.5) list.push(90);
    if (rng.next() < 0.7) { for (let k = 0; k < 20 && list.length < 2; k++) { const t = rng.next() < 0.5 ? int(rng, 76, 88) : int(rng, 92, 106); if (okAdd(t)) list.push(t); } }
    while (list.length < count) { const d = int(rng, 20, 170); if (okAdd(d)) list.push(d); }
    const desc = rng.next() < 0.5;
    const sorted = list.slice().sort((a, b) => (desc ? b - a : a - b));
    const answer = sorted.map((d) => 'a' + d);
    let chips;
    do { chips = shuffle(rng, list).map((d) => ({ id: 'a' + d, text: `Góc ${d}°` })); } while (chips.map((c) => c.id).join() === answer.join());
    const asc = list.slice().sort((a, b) => (desc ? a - b : b - a)).map((d) => 'a' + d);
    const bigSmall = sorted.map((d) => `${d}°`).join(', ');
    const wrongHints = [{ match: asc, code: 'ĐỌC', why: `Đề yêu cầu xếp từ ${desc ? 'LỚN đến BÉ' : 'BÉ đến LỚN'}. Có thể con đã xếp ngược lại.` }];
    const i90 = sorted.indexOf(90);
    if (i90 >= 0 && i90 < sorted.length - 1) {
      const sw = sorted.slice(); [sw[i90], sw[i90 + 1]] = [sw[i90 + 1], sw[i90]];
      const o = sw[i90];
      wrongHints.push({ match: sw.map((d) => 'a' + d), code: 'QUY', why: `${Math.min(o, 90)}° bé hơn ${Math.max(o, 90)}°, nên phải đứng đúng chỗ: ${bigSmall}.` });
    }
    const sortedAsc = list.slice().sort((a, b) => a - b);
    const nh = sortedAsc.filter((d) => d < 90), tu = sortedAsc.filter((d) => d > 90);
    return {
      id: 'g14.2', src: '[biến thể mới]', type: 'order',
      prompt: desc ? `Xếp ${count} góc theo độ lớn từ LỚN đến BÉ (chạm góc lớn nhất trước).` : `Xếp ${count} góc theo độ lớn từ BÉ đến LỚN (chạm góc bé nhất trước).`,
      visual: cmp(sortedAsc.map((d) => ({ label: `${d}°`, deg: d }))),
      hint: desc ? 'Góc tù lớn hơn góc vuông, góc vuông lớn hơn góc nhọn.' : 'Góc nhọn bé hơn góc vuông, góc vuông bé hơn góc tù.',
      items: chips,
      answer,
      wrongHints,
      explain: {
        steps: [
          { text: `Phân loại trước: ${nh.length ? `${listVi(nh.map((d) => d + '°'))} bé hơn 90° là góc nhọn` : 'không có góc nhọn'}${tu.length ? `; ${listVi(tu.map((d) => d + '°'))} lớn hơn 90° là góc tù` : ''}${list.includes(90) ? '; 90° là góc vuông' : ''}.`, visual: cmp(sortedAsc.map((d) => ({ label: `${d}°`, deg: d })), { name: true }) },
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

// g14.3: ước lượng số đo của góc vẽ — bài 14.2
const g3 = {
  id: 'g14.3', covers: ['14.2'],
  make(rng) {
    const acute = rng.next() < 0.5;
    const d = acute ? int(rng, 5, 14) * 5 : int(rng, 22, 31) * 5; // 25..70 hoặc 110..155
    const L = pick(rng, LETTERS);
    const cand = [];
    for (let c = 15; c <= 170; c += 5) {
      if (Math.abs(c - d) >= 30 && c !== 90) cand.push(c);
    }
    const a = pick(rng, cand);
    const cand2 = cand.filter((c) => Math.abs(c - a) >= 30);
    const b = pick(rng, cand2);
    const why = (c) => {
      const same = kindOf(c) === kindOf(d);
      if (!same) return `${c}° là góc ${kindOf(c)}, nhưng góc ${L} trong hình là góc ${kindOf(d)}.`;
      return c > d ? `${c}° mở rộng hơn góc ${L} trong hình.` : `${c}° mở hẹp hơn góc ${L} trong hình.`;
    };
    const correct = `${d}°`;
    return {
      id: 'g14.3', src: '[biến thể mới]', type: 'choice',
      prompt: `Góc ${L} trong hình là góc ${kindOf(d)}. Số đo nào hợp lí nhất?`,
      visual: ang(d, { label: L }),
      hint: 'So với các mốc 45°, 90°, 135°.',
      choices: mkChoices(rng, correct, [
        { text: `${a}°`, code: 'QUY', why: why(a) },
        { text: `${b}°`, code: 'QUY', why: why(b) },
      ]),
      explain: {
        steps: [
          { text: `Góc ${L} là góc ${kindOf(d)}: ${acute ? 'bé hơn 90°' : 'lớn hơn 90°'}. Loại các số không hợp.`, visual: cmp([{ label: '45°', deg: 45 }, { label: '90°', deg: 90 }, { label: '135°', deg: 135 }]) },
          { text: `Góc ${L} mở ${acute ? 'hẹp' : 'rộng'} gần như ${d}°.`, visual: ang(d, { label: L, anim: 'open' }) },
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
    const name = pick(rng, NAMES);
    const whyFor = (k) => `Mỗi khoảng giờ là 30°: ${n} khoảng giờ là ${n} × 30° = ${d}°. ${d}° ${cmpWord(d)} 90° nên đây là góc ${kindOf(d)}, không phải góc ${k}.`;
    const wrongs = ['nhọn', 'vuông', 'tù'].filter((k) => k !== kindOf(d)).map((k) => ({ text: `góc ${k}`, code: 'QUY', why: whyFor(k) }));
    const t = int(rng, 0, 2);
    const prompt = t === 0 ? `Lúc ${h} giờ đúng, hai kim đồng hồ tạo thành một góc (lấy góc nhỏ). Đó là góc gì? (Mỗi khoảng giờ trên đồng hồ là 30°.)`
      : t === 1 ? `${name} nhìn đồng hồ lúc ${h} giờ đúng. Hai kim tạo thành góc nhỏ gì? (Mỗi khoảng giờ trên đồng hồ là 30°.)`
        : `Đồng hồ chỉ ${h} giờ đúng. Góc nhỏ giữa kim giờ và kim phút là góc nhọn, góc vuông hay góc tù? (Mỗi khoảng giờ là 30°.)`;
    return {
      id: 'g14.4', src: '[biến thể mới]', type: 'choice',
      prompt,
      visual: { kind: 'clock', h, m: 0 },
      hint: 'Kim phút chỉ số 12. Đếm số giờ giữa hai kim theo đường ngắn.',
      choices: mkChoices(rng, correct, wrongs),
      explain: {
        steps: [
          { text: `Kim phút chỉ số 12, kim giờ chỉ số ${h}. Đi đường ngắn giữa hai kim có ${n} khoảng giờ.`, visual: { kind: 'clock', h, m: 0 } },
          { text: `Mỗi khoảng giờ là 30°, nên góc là ${n} × 30° = ${d}°.`, visual: ang(d, { label: 'O', anim: 'open', ...sqSpec(d) }) },
          { text: `${d}° ${cmpWord(d)} 90°. Đáp án là ${correct}.`, visual: ang(d, { label: 'O', name: true }) },
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

// g14.5: phân loại nhiều góc vào 3 ô — bài 14.1
const BUCKETS = [{ id: 'nhon', text: 'Góc nhọn' }, { id: 'vuong', text: 'Góc vuông' }, { id: 'tu', text: 'Góc tù' }];
const bucketOf = (d) => (d < 90 ? 'nhon' : d === 90 ? 'vuong' : 'tu');
const g5 = {
  id: 'g14.5', covers: ['14.1'],
  make(rng) {
    const withRight = rng.next() < 0.8;
    const [na, no] = withRight ? pick(rng, [[2, 2], [1, 3], [3, 1], [2, 2]]) : pick(rng, [[2, 3], [3, 2]]);
    const degs = withRight ? [90] : [];
    const free = (d) => degs.every((x) => Math.abs(x - d) >= 5);
    const trapAcute = rng.next() < 0.5;
    // một góc "bẫy" gần 90°
    for (let k = 0; k < 30; k++) { const t = trapAcute ? int(rng, 76, 89) : int(rng, 91, 106); if (free(t)) { degs.push(t); break; } }
    const need = (kind) => degs.filter((d) => bucketOf(d) === kind).length;
    const add = (kind, lo, hi, total) => { for (let k = 0; k < 200 && need(kind) < total; k++) { const d = int(rng, lo, hi); if (free(d)) degs.push(d); } };
    add('nhon', 15, 72, na);
    add('tu', 108, 168, no);
    const sortedAsc = degs.slice().sort((a, b) => a - b);
    const chips = shuffle(rng, degs).map((d) => ({ id: 'a' + d, text: `${d}°` }));
    const answer = {}; degs.forEach((d) => { answer['a' + d] = bucketOf(d); });
    const name = pick(rng, NAMES);
    const t = int(rng, 0, 2);
    const prompt = t === 0 ? 'Xếp mỗi góc vào đúng ô: góc nhọn, góc vuông hay góc tù.'
      : t === 1 ? `${name} đo được các góc như hình. Hãy xếp mỗi góc vào đúng loại.`
        : 'Mỗi góc dưới đây thuộc loại nào? Xếp vào đúng ô.';
    const nh = sortedAsc.filter((d) => d < 90), tu = sortedAsc.filter((d) => d > 90), vu = sortedAsc.filter((d) => d === 90);
    const steps = [
      { text: 'Nhớ mốc 90°: bé hơn 90° là nhọn, đúng 90° là vuông, lớn hơn 90° là tù.', visual: cmp([{ label: 'nhọn', deg: 50 }, { label: 'vuông', deg: 90 }, { label: 'tù', deg: 130 }], { name: true }) },
    ];
    if (nh.length) steps.push({ text: `${listVi(nh.map((d) => d + '°'))} đều bé hơn 90° nên là góc nhọn.${nh.some((d) => d >= 76) ? ` Dù ${nh[nh.length - 1]}° trông gần vuông, nó vẫn bé hơn 90°.` : ''}`, visual: cmp(nh.map((d) => ({ label: `${d}°`, deg: d }))), mark: 'good' });
    if (tu.length) steps.push({ text: `${listVi(tu.map((d) => d + '°'))} đều lớn hơn 90° nên là góc tù.${tu.some((d) => d <= 106) ? ` ${tu[0]}° chỉ hơn 90° một chút nhưng vẫn là góc tù.` : ''}`, visual: cmp(tu.map((d) => ({ label: `${d}°`, deg: d }))) });
    steps.push({ text: vu.length ? 'Chỉ có 90° là góc vuông. Vậy các góc đã xếp xong.' : 'Trong các góc này không có góc nào đúng 90°, nên ô góc vuông để trống.' });
    return {
      id: 'g14.5', src: '[biến thể mới]', type: 'classify',
      prompt,
      visual: cmp(sortedAsc.map((d) => ({ label: `${d}°`, deg: d }))),
      hint: 'So từng số với 90°.',
      chips, buckets: BUCKETS, answer,
      explain: { steps },
      meta: { degs },
    };
  },
  solve(item) { const o = {}; item.meta.degs.forEach((d) => { o['a' + d] = bucketOf(d); }); return o; },
};

// g14.6: chọn số đo hợp lí cho hai góc (A, B) cho trước loại — bài 14.2
const PAIR_KINDS = [['tù', 'nhọn'], ['nhọn', 'tù'], ['vuông', 'nhọn'], ['tù', 'vuông'], ['nhọn', 'vuông']];
const LETTER_PAIRS = [['A', 'B'], ['M', 'N'], ['P', 'Q'], ['X', 'Y']];
const degOfKind = (rng, k) => (k === 'nhọn' ? int(rng, 6, 15) * 5 : k === 'tù' ? int(rng, 21, 32) * 5 : 90);
function wrongsFor(rng, k, d, L) {
  if (k === 'vuông') {
    return {
      far: { c: 80, why: `Góc ${L} là góc vuông nên phải đúng 90°. 80° bé hơn 90°.` },
      cross: { c: 100, why: `Góc ${L} là góc vuông nên phải đúng 90°. 100° lớn hơn 90°.` },
    };
  }
  const range = k === 'nhọn' ? R(15, 80, 5) : R(100, 175, 5);
  const far = pick(rng, range.filter((c) => Math.abs(c - d) >= 35));
  const crossRange = k === 'nhọn' ? [105, 115, 125, 135, 145] : [35, 45, 55, 65];
  const cross = pick(rng, crossRange);
  return {
    far: { c: far, why: far > d ? `${far}° mở rộng hơn nhiều so với góc ${L} trong hình.` : `${far}° mở hẹp hơn nhiều so với góc ${L} trong hình.` },
    cross: { c: cross, why: `${cross}° là góc ${kindOf(cross)}, nhưng góc ${L} là góc ${k}.` },
  };
}
const g6 = {
  id: 'g14.6', covers: ['14.2'],
  make(rng) {
    const [kA, kB] = pick(rng, PAIR_KINDS);
    const [LA, LB] = pick(rng, LETTER_PAIRS);
    const dA = degOfKind(rng, kA), dB = degOfKind(rng, kB);
    const wA = wrongsFor(rng, kA, dA, LA), wB = wrongsFor(rng, kB, dB, LB);
    const txt = (a, b) => `${LA} = ${a}°, ${LB} = ${b}°`;
    const correct = txt(dA, dB);
    const wrongs = [
      { text: txt(wA.far.c, dB), code: 'QUY', why: wA.far.why },
      { text: txt(dA, wB.far.c), code: 'QUY', why: wB.far.why },
      kA !== 'vuông' ? { text: txt(wA.cross.c, dB), code: 'QUY', why: wA.cross.why } : { text: txt(dA, wB.cross.c), code: 'QUY', why: wB.cross.why },
      kA !== 'vuông' && kB !== 'vuông' ? { text: txt(dA, wB.cross.c), code: 'QUY', why: wB.cross.why } : { text: txt(wA.cross.c, dB), code: 'QUY', why: wA.cross.why },
    ];
    return {
      id: 'g14.6', src: '[biến thể mới]', type: 'choice',
      prompt: `Hình vẽ có hai góc: ${LA} là góc ${kA}, ${LB} là góc ${kB}. Chọn số đo hợp lí cho từng góc.`,
      visual: cmp([{ label: LA, deg: dA, ...sqSpec(dA) }, { label: LB, deg: dB, ...sqSpec(dB) }]),
      hint: 'So hai góc với góc vuông 90°, rồi với các mốc 45° và 135°.',
      layout: 'list',
      choices: mkChoices(rng, correct, wrongs),
      explain: {
        steps: [
          { text: `So với 90°: góc ${LA} là góc ${kA}, góc ${LB} là góc ${kB}.`, visual: cmp([{ label: LA, deg: dA, ...sqSpec(dA) }, { label: LB, deg: dB, ...sqSpec(dB) }], { name: true }) },
          { text: `Góc ${LA} mở ${kA === 'nhọn' ? 'hẹp hơn' : kA === 'tù' ? 'rộng hơn' : 'đúng bằng'} góc vuông, hợp với ${dA}°.`, visual: ang(dA, { label: LA, ...sqSpec(dA) }) },
          { text: `Góc ${LB} mở ${kB === 'nhọn' ? 'hẹp hơn' : kB === 'tù' ? 'rộng hơn' : 'đúng bằng'} góc vuông, hợp với ${dB}°.`, visual: ang(dB, { label: LB, ...sqSpec(dB) }) },
          { text: `Đáp án là ${correct}.` },
        ],
      },
      meta: { LA, LB, dA, dB },
    };
  },
  solve(item) { const { LA, LB, dA, dB } = item.meta; return `${LA} = ${dA}°, ${LB} = ${dB}°`; },
};

// g14.7: Đúng/Sai — bạn đoán số đo góc — bài 14.4
const g7 = {
  id: 'g14.7', covers: ['14.4'],
  make(rng) {
    const acute = rng.next() < 0.5;
    const d = acute ? int(rng, 5, 14) * 5 : int(rng, 22, 31) * 5;
    const L = pick(rng, LETTERS);
    const name = pick(rng, NAMES);
    const good = rng.next() < 0.5;
    const crossFalse = rng.next() < 0.45;
    let g;
    if (good) {
      do { g = d + pick(rng, [-10, -5, 5, 10]); } while (kindOf(g) !== kindOf(d));
    } else if (crossFalse) {
      g = acute ? pick(rng, [105, 115, 125, 135, 150, 160]) : pick(rng, [20, 30, 40, 50, 60, 70]);
    } else {
      const range = acute ? R(15, 80, 5) : R(100, 175, 5);
      g = pick(rng, range.filter((c) => Math.abs(c - d) >= 35));
    }
    const kd = kindOf(d), kg = kindOf(g);
    const ans = Math.abs(g - d) <= 10 && kd === kg;
    const reasonRight = good
      ? `Góc ${L} là góc ${kd} và mở rộng gần bằng ${g}°.`
      : kd !== kg ? `Góc ${L} là góc ${kd}, còn ${g}° là góc ${kg}.` : `${g}° mở ${g > d ? 'rộng' : 'hẹp'} hơn nhiều so với góc ${L} trong hình.`;
    const reasons = shuffle(rng, [
      { text: reasonRight, correct: true },
      { text: `Hai cạnh của góc ${L} dài nên góc phải to.`, correct: false, code: 'QUY', why: 'Cạnh dài hay ngắn không làm góc to hơn. Chỉ độ mở giữa hai cạnh mới quyết định.' },
      { text: `Vì ${g}° là số đo của một góc thật, nên đoán thế nào cũng hợp lí.`, correct: false, code: 'QUY', why: 'Số đo hợp lí phải hợp với độ mở của góc trong hình, không phải số đo nào cũng được.' },
    ]);
    const t = int(rng, 0, 1);
    return {
      id: 'g14.7', src: '[biến thể mới]', type: 'tf',
      prompt: (t === 0 ? `${name} nhìn góc ${L} trong hình và đoán góc đó khoảng ${g}°. ${name} đoán như vậy có hợp lí không?` : `Trong hình có góc ${L}. ${name} nói: "Góc ${L} khoảng ${g}°." Lời của ${name} có hợp lí không?`) + ' Chọn ĐÚNG hoặc SAI.',
      visual: ang(d, { label: L }),
      hint: `So góc ${L} với góc vuông, rồi với các mốc 45° và 135°.`,
      answer: ans,
      reasons,
      whyWrong: ans ? `${g}° gần với độ mở của góc ${L} (${kd}), nên đoán như vậy là hợp lí.` : `Ước lượng ${g}° chưa hợp lí: góc ${L} là góc ${kd}, mở khoảng ${d}°.`,
      explain: {
        steps: [
          { text: `Góc ${L} ${d < 90 ? 'bé hơn' : 'lớn hơn'} 90°, nên là góc ${kd}.`, visual: cmp([{ label: L, deg: d }, { label: '90°', deg: 90 }]) },
          { text: ans ? `Góc ${L} mở khoảng ${d}°, còn ${g}° rất gần như vậy.` : kd !== kg ? `${g}° là góc ${kg}, mở khác hẳn góc ${L}.` : `${g}° ${g > d ? 'rộng' : 'hẹp'} hơn nhiều: góc ${L} chỉ khoảng ${d}°.`, visual: cmp([{ label: L, deg: d }, { label: `${g}°`, deg: g }]), mark: ans ? 'good' : 'bad' },
          { text: ans ? `Vậy ${name} đoán hợp lí, câu này ĐÚNG.` : `Vậy ${name} đoán chưa hợp lí, câu này SAI. Số hợp lí hơn là khoảng ${d}°.` },
        ],
      },
      meta: { d, g },
    };
  },
  solve(item) { const { d, g } = item.meta; return String(Math.abs(g - d) <= 10 && kindOf(g) === kindOf(d)); },
};

// g14.8: nối góc với số đo — bài 14.5
const MATCH_POOL = [25, 30, 40, 45, 55, 60, 70, 75, 90, 105, 110, 120, 130, 135, 145, 150, 160];
const g8 = {
  id: 'g14.8', covers: ['14.5'],
  make(rng) {
    let degs;
    for (let k = 0; k < 200; k++) {
      const cand = shuffle(rng, MATCH_POOL).slice(0, 5);
      const ok = cand.every((a, i) => cand.every((b, j) => i === j || Math.abs(a - b) >= 20));
      if (ok) { degs = cand; break; }
    }
    if (!degs) degs = [30, 60, 90, 120, 150];
    const [LA] = [pick(rng, LETTER_SETS4)];
    const lefts = degs.slice(0, 4);
    const dist = degs[4];
    const left = lefts.map((d, i) => ({ id: LA[i], text: `Góc ${LA[i]}`, visual: ang(d, sqSpec(d)) }));
    const right = shuffle(rng, degs.map((d) => ({ id: 'r' + d, text: `${d}°` })));
    const pairs = {}; lefts.forEach((d, i) => { pairs[LA[i]] = 'r' + d; });
    const sortedList = degs.slice().sort((a, b) => a - b).map((d) => `${d}°`).join(', ');
    const nhs = lefts.map((d, i) => ({ d, L: LA[i] })).filter((x) => x.d < 90).sort((a, b) => a.d - b.d);
    const tus = lefts.map((d, i) => ({ d, L: LA[i] })).filter((x) => x.d > 90).sort((a, b) => a.d - b.d);
    const vu = lefts.map((d, i) => ({ d, L: LA[i] })).filter((x) => x.d === 90);
    const steps = [];
    steps.push({ text: vu.length ? `Góc ${vu[0].L} có ô vuông ở đỉnh nên là góc vuông: 90°. Các góc còn lại so với 90°.` : 'So từng góc với góc vuông 90°: góc hẹp hơn là góc nhọn, rộng hơn là góc tù.', visual: ang(vu.length ? 90 : 60, { label: vu.length ? vu[0].L : undefined, ...(vu.length ? { show: 'square' } : {}) }) });
    if (nhs.length) steps.push({ text: `Các góc nhọn, từ hẹp đến rộng: ${nhs.map((x) => `góc ${x.L} là ${x.d}°`).join(', ')}.`, visual: cmp(nhs.map((x) => ({ label: x.L, deg: x.d }))) });
    if (tus.length) steps.push({ text: `Các góc tù, từ hẹp đến rộng: ${tus.map((x) => `góc ${x.L} là ${x.d}°`).join(', ')}.`, visual: cmp(tus.map((x) => ({ label: x.L, deg: x.d }))) });
    steps.push({ text: `Vậy ${lefts.map((d, i) => `góc ${LA[i]} nối với ${d}°`).join(', ')}. Số ${dist}° không dùng.` });
    return {
      id: 'g14.8', src: '[biến thể mới]', type: 'match',
      prompt: `Nối mỗi góc với số đo của nó (các số đo cho sẵn: ${sortedList}).`,
      hint: 'Góc nào có ô vuông ở đỉnh là góc vuông. Còn lại: so với 90°.',
      left, right, pairs,
      explain: { steps },
      meta: { degs, letters: LA },
    };
  },
  solve(item) { const { degs, letters } = item.meta; const o = {}; for (let i = 0; i < 4; i++) o[letters[i]] = 'r' + degs[i]; return o; },
};
const LETTER_SETS4 = [['A', 'B', 'C', 'D'], ['M', 'N', 'P', 'Q'], ['E', 'F', 'G', 'H']];

// g14.9: chọn tất cả các góc nhọn / góc tù — bài 14.6
const g9 = {
  id: 'g14.9', covers: ['14.6'],
  make(rng) {
    const target = rng.next() < 0.5 ? 'nhọn' : 'tù';
    const nC = rng.next() < 0.6 ? 2 : 3;
    const free = (arr, d) => arr.every((x) => Math.abs(x - d) >= 8);
    const list = []; // {d, ok}
    const ds = () => list.map((x) => x.d);
    const farSide = (t) => (t === 'nhọn' ? [15, 85] : [95, 170]);
    const near = (t) => (t === 'nhọn' ? [78, 89] : [91, 104]);
    const oppo = target === 'nhọn' ? 'tù' : 'nhọn';
    const addOne = (kind, lo, hi, ok) => { for (let k = 0; k < 100; k++) { const d = int(rng, lo, hi); if (free(ds(), d)) { list.push({ d, ok }); return; } } };
    // đúng
    if (rng.next() < 0.6) addOne(target, ...near(target), true);
    while (list.length < nC) addOne(target, ...(target === 'nhọn' ? [15, 72] : [108, 168]), true);
    // sai
    const nW = 4 - nC;
    if (rng.next() < 0.75 || nW === 1) list.push({ d: 90, ok: false });
    while (list.length < 4) addOne(oppo, ...(oppo === 'nhọn' ? [15, 72] : [108, 168]), false);
    const sh2 = shuffle(rng, list);
    const letters = shuffle(rng, ['A', 'B', 'C', 'D']);
    const items = sh2.map((x, i) => ({ ...x, L: letters[i] })).sort((a, b) => a.L.localeCompare(b.L));
    const txt = (x) => `Góc ${x.L} (${x.d}°)`;
    const word = target === 'nhọn' ? 'bé' : 'lớn';
    const prompts = target === 'nhọn'
      ? ['Chọn TẤT CẢ các góc NHỌN.', 'Những góc nào bé hơn góc vuông? Chọn tất cả các góc đó.']
      : ['Chọn TẤT CẢ các góc TÙ.', 'Những góc nào lớn hơn góc vuông? Chọn tất cả các góc đó.'];
    const rightOnes = items.filter((x) => x.ok), wrongOnes = items.filter((x) => !x.ok);
    return {
      id: 'g14.9', src: '[biến thể mới]', type: 'multi',
      prompt: pick(rng, prompts),
      hint: `Góc ${target} phải ${word} hơn góc vuông, tức ${word} hơn 90°.`,
      layout: 'grid2',
      choices: items.map((x) => (x.ok
        ? { text: txt(x), correct: true, visual: ang(x.d, { label: x.L }) }
        : {
          text: txt(x), code: 'QUY', visual: ang(x.d, { label: x.L, ...sqSpec(x.d) }),
          why: x.d === 90 ? `Góc ${x.L} đúng bằng 90°, là góc vuông. Góc ${target} phải ${word} hơn 90°.` : `Góc ${x.L} là ${x.d}°, ${x.d < 90 ? 'bé' : 'lớn'} hơn góc vuông, nên là góc ${kindOf(x.d)}.`,
        })),
      explain: {
        steps: [
          { text: `Góc ${target} là góc ${word} hơn góc vuông. Hãy so từng góc với 90°.`, visual: ang(90, { show: 'square' }) },
          { text: `${cap1(listVi(rightOnes.map((x) => `góc ${x.L} (${x.d}°)`)))} đều ${word} hơn 90°${rightOnes.some((x) => Math.abs(x.d - 90) <= 12) ? ', dù có góc trông gần vuông' : ''}.`, visual: cmp(rightOnes.map((x) => ({ label: x.L, deg: x.d }))), mark: 'good' },
          { text: `${cap1(listVi(wrongOnes.map((x) => `góc ${x.L} (${x.d}°)`)))} không phải góc ${target}. Đáp án là ${listVi(rightOnes.map((x) => `góc ${x.L}`))}.`, visual: cmp(wrongOnes.map((x) => ({ label: x.L, deg: x.d }))) },
        ],
      },
      meta: { target, items: items.map((x) => ({ d: x.d, L: x.L })) },
    };
  },
  solve(item) {
    const { target, items } = item.meta;
    return items.filter((x) => (target === 'nhọn' ? x.d < 90 : x.d > 90)).map((x) => `Góc ${x.L} (${x.d}°)`).sort().join(',');
  },
};

// g14.10: nối giờ đúng với loại góc tạo bởi hai kim — bài 14.7
const g10 = {
  id: 'g14.10', covers: ['14.7'],
  make(rng) {
    const hn = pick(rng, [1, 2, 10, 11]), hv = pick(rng, [3, 9]), ht = pick(rng, [4, 5, 7, 8]);
    const hs = shuffle(rng, [hn, hv, ht]);
    const use24 = rng.next() < 0.35;
    const lab = (h) => (use24 ? `${h + 12} giờ` : `${h} giờ`);
    const left = hs.map((h) => ({ id: 'h' + h, text: lab(h), visual: { kind: 'clock', h: use24 ? h + 12 : h, m: 0 } }));
    const kindId = (h) => { const d = Math.min(h, 12 - h) * 30; return d < 90 ? 'nhon' : d === 90 ? 'vuong' : 'tu'; };
    const right = [{ id: 'nhon', text: 'góc nhọn' }, { id: 'vuong', text: 'góc vuông' }, { id: 'tu', text: 'góc tù' }];
    const pairs = {}; hs.forEach((h) => { pairs['h' + h] = kindId(h); });
    const list = hs.slice().sort((a, b) => a - b).map(lab).join(', ');
    const t = int(rng, 0, 3);
    const prompt = t === 3 ? `Hai kim đồng hồ chỉ các giờ đúng: ${list}. Mỗi lúc, hai kim tạo thành góc loại nào? Nối giờ với loại góc. (Mỗi khoảng giờ là 30°.)`
      : t === 0 ? `Hai kim đồng hồ tạo thành một góc. Nối mỗi giờ (${list}) với loại góc đúng. (Mỗi khoảng giờ trên đồng hồ là 30°.)`
      : t === 1 ? `Lúc ${list}, kim giờ và kim phút tạo thành một góc nhỏ. Nối mỗi giờ với loại góc đúng. (Mỗi khoảng giờ là 30°.)`
        : `Nối mỗi giờ đúng (${list}) với loại góc mà hai kim đồng hồ tạo thành. (Mỗi khoảng giờ trên đồng hồ là 30°.)`;
    const order = hs.slice().sort((a, b) => Math.min(a, 12 - a) - Math.min(b, 12 - b));
    const vis = (h) => ang(Math.min(h, 12 - h) * 30, { name: true });
    return {
      id: 'g14.10', src: '[biến thể mới]', type: 'match',
      prompt,
      hint: 'Từ số 12 đến số chỉ giờ, mỗi khoảng là 30°.',
      left, right, pairs,
      explain: {
        steps: order.map((h, i) => {
          const n = Math.min(h, 12 - h), d = n * 30;
          return { text: `Lúc ${lab(h)}: ${n} khoảng giờ giữa hai kim, ${n} × 30° = ${d}° ${d === 90 ? 'đúng bằng' : d < 90 ? 'bé hơn' : 'lớn hơn'} 90°: góc ${kindOf(d)}.${i === order.length - 1 ? ` Vậy ${order.map((x) => `${lab(x)} nối góc ${kindOf(Math.min(x, 12 - x) * 30)}`).join(', ')}.` : ''}`, visual: vis(h) };
        }),
      },
      meta: { hs },
    };
  },
  solve(item) {
    const o = {};
    item.meta.hs.forEach((h) => { const d = Math.min(h, 12 - h) * 30; o['h' + h] = d < 90 ? 'nhon' : d === 90 ? 'vuong' : 'tu'; });
    return o;
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

  generators: [g1, g2, g3, g4, g5, g6, g7, g8, g9, g10],
};
