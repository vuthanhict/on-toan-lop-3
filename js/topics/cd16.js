import { pick, int, shuffle } from '../core/rng.js';

// Toàn bộ chủ đề này tự soạn: [ngoài tài liệu]
const SRC = '[ngoài tài liệu]';

// ---------- tiện ích ----------
const tm = (h, m) => `${h}:${String(m).padStart(2, '0')}`; // dạng 14:05 cho hình
const fmtT = (h, m) => (m ? `${h} giờ ${m} phút` : `${h} giờ`); // thời điểm
const fmtD = (h, m) => (h && m ? `${h} giờ ${m} phút` : h ? `${h} giờ` : `${m} phút`); // khoảng thời gian
const fromMin = (t) => [Math.floor(t / 60), t % 60];
const clock = (h, m, extra = {}) => ({ kind: 'clock', h, m, ...extra });
const tl = (rows, extra = {}) => ({ kind: 'timeline', rows, ...extra });
// ----- lời giải kiểu VỞ NHÁP: mỗi bước thêm một dòng viết tay (visual workout) -----
// items: [{ t: lời giải thích (xưng "con"), line: { text, note? } }]
function workSteps(items, title) {
  const lines = items.map((x) => x.line);
  return items.map((x, i) => ({
    text: x.t,
    visual: { kind: 'workout', lines, upto: i + 1, ...(title ? { title } : {}), ...(i === items.length - 1 ? { done: true } : {}) },
  }));
}
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
const buoiOf = (H) => (H < 12 ? 'sáng' : H === 12 ? 'trưa' : H <= 18 ? 'chiều' : 'tối');

// ---------- ngữ cảnh dùng chung cho bộ sinh ----------
const NAMES = ['An', 'Bình', 'Chi', 'Dũng', 'Hà', 'Lan', 'Minh', 'Nam', 'Mai', 'Phúc', 'Quân', 'Thu'];
const cap1 = (s) => s[0].toUpperCase() + s.slice(1);
const h12of = (H) => (H % 12 === 0 ? 12 : H % 12);
// thời điểm kiểu 12 giờ có buổi: 14,30 -> "2 giờ 30 phút chiều"
const t12 = (H, m = 0) => `${h12of(H)} giờ${m ? ` ${m} phút` : ''} ${buoiOf(H)}`;
// thời điểm kiểu 24 giờ: 14,30 -> "14 giờ 30 phút"
const t24 = (H, m = 0) => fmtT(H, m);
const minOf = (h, m) => h * 60 + m;

// ----- khung bài "khoảng thời gian giữa hai thời điểm" (dùng chung g16.3, g16.9, g16.11) -----
const SCEN = [
  (P1, P2, n) => ({ row: 'Làm bài', q: `${n} bắt đầu làm bài lúc ${P1} và làm xong lúc ${P2}. ${n} làm bài trong bao lâu?` }),
  (P1, P2, n) => ({ row: 'Học vẽ', q: `Buổi học vẽ của lớp bắt đầu lúc ${P1} và kết thúc lúc ${P2}. Buổi học vẽ kéo dài bao lâu?`}),
  (P1, P2, n) => ({ row: 'Tàu chạy', q: `Tàu rời ga lúc ${P1} và đến nơi lúc ${P2}. Hành trình dài bao lâu?`}),
  (P1, P2, n) => ({ row: 'Chiếu phim', q: `Bộ phim bắt đầu chiếu lúc ${P1} và hết phim lúc ${P2}. Bộ phim dài bao lâu?`}),
  (P1, P2, n) => ({ row: 'Đọc truyện', q: `${n} bắt đầu đọc truyện lúc ${P1} và đọc xong lúc ${P2}. ${n} đọc truyện trong bao lâu?` }),
  (P1, P2, n) => ({ row: 'Cắm trại', q: `Đoàn cắm trại xuất phát lúc ${P1} và về đến trường lúc ${P2}. Chuyến đi kéo dài bao lâu?`}),
];
function durationItem(rng, id, h1, m1, h2, m2, P, extraSteps = []) {
  const total = minOf(h2, m2) - minOf(h1, m1);
  const [dh, dm] = fromMin(total);
  const name = pick(rng, NAMES);
  const sc = pick(rng, SCEN)(P(h1, m1), P(h2, m2), name);
  const correct = fmtD(dh, dm);
  const scale = { from: tm(h1, 0), to: tm(h2 + 1, 0) };
  const row = { label: sc.row, from: tm(h1, m1), to: tm(h2, m2) };
  const cands = [];
  if (m2 < m1) {
    cands.push({ text: fmtD(h2 - h1, m1 - m2), code: 'QUY', why: `Có thể con trừ riêng giờ: ${h2} − ${h1} = ${h2 - h1}, rồi trừ riêng phút: ${m1} − ${m2} = ${m1 - m2}. Nhưng phút lúc kết thúc (${m2}) bé hơn phút lúc bắt đầu (${m1}), nên phải mượn 1 giờ.` });
    cands.push({ text: fmtD(dh + 1, dm), code: 'QUY', why: `Có thể con quên mượn giờ. ${dm} phút lấy từ 1 giờ, nên số giờ phải là ${dh}, không phải ${dh + 1}.` });
    cands.push({ text: fmtD(dh, m1 - m2), code: 'QUY', why: `Số giờ đúng rồi. Nhưng phút phải là 60 − ${m1} + ${m2} = ${dm}, không phải ${m1 - m2}.` });
  } else {
    cands.push({ text: fmtD(dh + 1, dm), code: 'ĐẾM', why: `Có thể con đếm thừa 1 giờ. ${h2} − ${h1} = ${dh} giờ${dm ? `, rồi cộng ${dm} phút` : ''}.` });
    if (dm > 0) cands.push({ text: fmtD(dh, 0), code: 'ĐẾM', why: `Số giờ đúng rồi. Còn phải cộng thêm ${dm} phút nữa.` });
    if (dh > 0 && dm > 0) cands.push({ text: fmtD(0, dm), code: 'ĐẾM', why: `Có thể con mới tính phần phút. Còn ${dh} giờ nữa phải cộng vào.` });
    if (m1 > 0 && m1 + m2 < 60) cands.push({ text: fmtD(dh, m1 + m2), code: 'DẤU', why: `Phút phải TRỪ: ${m2} − ${m1} = ${dm}, không phải cộng ${m1} + ${m2}.` });
    if (dh >= 2) cands.push({ text: fmtD(dh - 1, dm), code: 'ĐẾM', why: `Hãy đếm lại số giờ: ${h2} − ${h1} = ${dh} giờ, không phải ${dh - 1} giờ.` });
  }
  const fillers = [10, 5, 15, 20, 25].filter((x) => dm + x < 60).map((x) => ({ text: fmtD(dh, dm + x), code: 'QUY', why: `Hãy đếm lại phút theo từng chặng. Phút đúng là ${dm}, không phải ${dm + x}.` }));
  const seenTxt = new Set([correct]); const wf = [];
  [...shuffle(rng, cands), ...fillers].forEach((w) => { if (!seenTxt.has(w.text) && wf.length < 3) { seenTxt.add(w.text); wf.push(w); } });
  // các chặng giải (vở nháp)
  const T = (h, m) => tm(h, m);
  const items = [...extraSteps];
  let hrs, mins; const a = 60 - m1;
  if (m1 > 0) {
    hrs = h2 - h1 - 1; mins = a + m2;
    items.push({ t: `Từ ${T(h1, m1)} đến giờ tròn kế tiếp là ${T(h1 + 1, 0)}. Con lấy 60 − ${m1} = ${a} phút.`, line: { text: `${T(h1, m1)} đến ${T(h1 + 1, 0)} là ${a} phút`, note: 'đến giờ tròn' } });
    if (hrs > 0) items.push({ t: `Từ ${T(h1 + 1, 0)} con nhảy từng giờ tròn đến ${T(h2, 0)}: được ${hrs} giờ.`, line: { text: `${T(h1 + 1, 0)} đến ${T(h2, 0)} là ${hrs} giờ`, note: 'nhảy từng giờ' } });
  } else {
    hrs = h2 - h1; mins = m2;
    items.push({ t: `Từ ${T(h1, 0)} đến ${T(h2, 0)} là ${hrs} giờ.`, line: { text: `${T(h1, 0)} đến ${T(h2, 0)} là ${hrs} giờ`, note: 'nhảy từng giờ' } });
  }
  if (m2 > 0) items.push({ t: `Từ ${T(h2, 0)} đến ${T(h2, m2)} là ${m2} phút.`, line: { text: `${T(h2, 0)} đến ${T(h2, m2)} là ${m2} phút`, note: 'phần phút lẻ' } });
  if (m1 > 0 && m2 > 0) items.push({ t: `Con cộng các phút: ${a} + ${m2} = ${mins} phút.`, line: { text: `${a} + ${m2} = ${mins} phút`, note: 'cộng phút' } });
  if (mins >= 60) items.push({ t: `${mins} phút nhiều hơn 60, con đổi 60 phút thành 1 giờ${mins > 60 ? `: còn ${mins - 60} phút` : ''}.`, line: { text: `${mins} phút = ${fmtD(1, mins - 60)}`, note: '60 phút = 1 giờ' } });
  const minTxt = mins >= 60 ? fmtD(1, mins - 60) : `${mins} phút`;
  if (hrs > 0 && mins > 0) items.push({ t: `Con ghép giờ và phút: ${hrs} giờ + ${minTxt}. Đáp án là ${correct}.`, line: { text: `${hrs} giờ + ${minTxt} = ${correct}`, note: 'cộng lại', color: '#1F8A4C' } });
  else { const last = items[items.length - 1]; last.t += ` Đáp án là ${correct}.`; last.line = { ...last.line, color: '#1F8A4C' }; }
  const steps = workSteps(items);
  return {
    id, src: SRC, type: 'choice',
    prompt: sc.q,
    visual: tl([row], { scale }),
    hint: 'Đếm theo ba chặng: từ giờ bắt đầu lên giờ tròn kế tiếp, rồi nhảy từng giờ tròn, rồi cộng thêm số phút lẻ.',
    choices: mkChoices(rng, correct, wf),
    explain: { steps },
    meta: { h1, m1, h2, m2 },
  };
}
const solveDuration = (item) => { const { h1, m1, h2, m2 } = item.meta; const [dh, dm] = fromMin(minOf(h2, m2) - minOf(h1, m1)); return fmtD(dh, dm); };
// chọn giờ bắt đầu (h1:m1) và thời lượng sao cho giờ kết thúc nằm trong [lo, hi]
function pickSpan(rng, h1lo, h1hi, durLo, durHi, endMax) {
  for (let k = 0; k < 100; k++) {
    const h1 = int(rng, h1lo, h1hi), m1 = 5 * int(rng, 0, 11), dur = 5 * int(rng, durLo / 5, durHi / 5);
    const end = minOf(h1, m1) + dur;
    if (end <= endMax * 60 + 55) { const [h2, m2] = fromMin(end); if (h2 > h1 && !(m2 === 0 && h2 - h1 <= 1) && !(m1 === 0 && m2 === 0)) return [h1, m1, h2, m2]; }
  }
  return [8, 40, 10, 5];
}

// ---------- bộ sinh ----------
// g16.1: đổi giữa cách đọc 12 giờ (có buổi) và 24 giờ
const g1 = {
  id: 'g16.1',
  make(rng) {
    const evening = rng.next() < 0.5;
    const X = evening ? int(rng, 7, 11) : int(rng, 1, 5);
    const buoi = evening ? 'tối' : 'chiều';
    const H = X + 12;
    const mode = int(rng, 0, 3);
    if (mode === 3) {
      // 24 giờ -> 12 giờ có buổi
      const correct = `${X} giờ ${buoi}`;
      const cand = [X + 1, X + 2, X - 1, X - 2, X + 3].filter((v) => v >= 1 && v <= 12 && v !== X);
      const wrongs = [
        { text: `${X} giờ sáng`, code: 'QUY', why: `${H} giờ là sau 12 giờ trưa, nên là buổi ${buoi}, không phải buổi sáng.` },
        { text: `${cand[0]} giờ ${buoi}`, code: 'QUY', why: `Phải trừ 12: ${H} − 12 = ${X}, không phải ${cand[0]}.` },
        { text: `${cand[1]} giờ ${buoi}`, code: 'QUY', why: `Phải trừ 12: ${H} − 12 = ${X}, không phải ${cand[1]}.` },
      ];
      return {
        id: 'g16.1', src: SRC, type: 'choice',
        prompt: `${H} giờ (cách đọc 24 giờ) là mấy giờ ${buoi}?`,
        visual: clock(H, 0),
        hint: 'Từ 13 giờ trở đi, lấy số giờ trừ đi 12.',
        choices: mkChoices(rng, correct, wrongs),
        explain: {
          steps: [
            { text: `Từ 13 giờ trở đi, mình trừ đi 12 để đọc theo kiểu 12 giờ: ${H} − 12 = ${X}.`, visual: clock(H, 0, { mode: 'both', show24: true, ampm: true }) },
            { text: `${H} giờ là buổi ${buoi}, nên đọc là ${X} giờ ${buoi}.` },
            { text: `Vậy ${H} giờ là ${correct}. Đáp án là ${correct}.` },
          ],
        },
        meta: { X, buoi, mode: 'to12' },
      };
    }
    const correct = `${H} giờ`;
    const name = pick(rng, NAMES);
    const prompt = mode === 0 ? `${X} giờ ${buoi} viết theo cách đọc 24 giờ là mấy giờ?`
      : mode === 1 ? `Đồng hồ điện tử đặt kiểu 24 giờ. Lúc ${X} giờ ${buoi}, đồng hồ hiện số giờ là mấy?`
        : `${name} xem chương trình ti vi bắt đầu lúc ${X} giờ ${buoi}. Theo cách đọc 24 giờ, đó là mấy giờ?`;
    return {
      id: 'g16.1', src: SRC, type: 'choice',
      prompt,
      visual: clock(H, 0, { ampm: true }),
      hint: 'Buổi chiều và tối: lấy số giờ cộng thêm 12.',
      choices: mkChoices(rng, correct, [
        { text: `${X} giờ`, code: 'QUY', why: `${X} giờ là buổi sáng. Buổi ${buoi} phải cộng thêm 12 giờ.` },
        { text: `${X + 10} giờ`, code: 'QUY', why: `Phải cộng 12, không phải 10: ${X} + 12 = ${H}.` },
        { text: `${X + 13} giờ`, code: 'QUY', why: `Cộng thừa 1: ${X} + 12 = ${H}, không phải ${X + 13}.` },
      ]),
      explain: {
        steps: [
          { text: 'Buổi sáng thì cách đọc 24 giờ giống cách đọc 12 giờ. Từ 1 giờ chiều trở đi, mình cộng thêm 12.', visual: clock(X, 0, { mode: 'both', show24: true }) },
          { text: `${X} giờ ${buoi}: ${X} + 12 = ${H}.`, visual: clock(H, 0, { mode: 'both', show24: true, ampm: true }) },
          { text: `Vậy ${X} giờ ${buoi} là ${H} giờ. Đáp án là ${correct}.` },
        ],
      },
      meta: { X, buoi, mode: 'to24' },
    };
  },
  solve(item) { const { X, buoi, mode } = item.meta; return mode === 'to12' ? `${X} giờ ${buoi}` : `${X + 12} giờ`; },
};

// g16.2: đổi giờ - phút (một ô hoặc hai ô)
const g2 = {
  id: 'g16.2', covers: ['16.3'],
  make(rng) {
    const formA = rng.next() < 0.5;
    const name = pick(rng, NAMES);
    const ti = int(rng, 0, 2);
    if (formA) {
      const q = int(rng, 1, 4), r = 5 * int(rng, 1, 11);
      const N = 60 * q + r;
      const [eh, em] = fromMin(8 * 60 + N);
      const wh = [];
      const q2 = Math.floor(N / 100), r2 = N % 100;
      if (!(q2 === q && r2 === r)) wh.push({ match: `${q2}|${r2}`, code: 'QUY', why: `1 giờ có 60 phút, không phải 100 phút. Mình lấy từng 60 phút ra đổi thành giờ.` });
      if (q >= 2) wh.push({ match: `${q - 1}|${r + 60}`, code: 'QUY', why: `Chưa đổi hết: ${r + 60} phút vẫn còn đổi được thêm 1 giờ nữa (60 phút).` });
      wh.push({ match: `${q}|${N - 60 * q + 10}`, code: 'QUY', why: `Phút còn lại là ${N} − ${q * 60} = ${r}, con hãy tính lại.` });
      const prompt = ti === 0 ? `Đổi ${N} phút ra giờ và phút.` : ti === 1 ? `Bộ phim dài ${N} phút. Hỏi bộ phim dài mấy giờ mấy phút?` : `${name} đi xe ${N} phút mới đến nơi. Đổi ${N} phút ra giờ và phút.`;
      return {
        id: 'g16.2', src: SRC, type: 'numpad',
        prompt,
        hint: '1 giờ = 60 phút. Lấy từng 60 phút ra đổi thành giờ.',
        slots: [
          { label: `${N} phút =`, answer: String(q), len: 1, unit: 'giờ' },
          { label: 'và', answer: String(r), len: String(r).length, unit: 'phút' },
        ],
        wrongHints: wh,
        explain: {
          steps: workSteps([
            ...Array.from({ length: q }, (_, i) => ({
              t: i === 0 ? `Cứ 60 phút là 1 giờ. Con lấy ra 60 phút: ${N} − 60 = ${N - 60}.` : `Con lấy tiếp 60 phút nữa: ${N - 60 * i} − 60 = ${N - 60 * (i + 1)}.`,
              line: { text: `${N - 60 * i} − 60 = ${N - 60 * (i + 1)}`, note: `${i + 1} giờ` },
            })),
            { t: `Con đã lấy ra ${q} lần 60 phút, tức ${q} giờ, còn lại ${r} phút. Đáp án là ${q} giờ ${r} phút.`, line: { text: `${N} phút = ${q} giờ ${r} phút`, note: 'ghép lại', color: '#1F8A4C' } },
          ]),
        },
        meta: { form: 'A', N },
      };
    }
    const a = int(rng, 1, 4);
    const b = 5 * int(rng, 1, 11);
    const tot = a * 60 + b;
    const [eh, em] = fromMin(8 * 60 + tot);
    const wh = [
      { match: String(a * 100 + b), code: 'QUY', why: `1 giờ có 60 phút, không phải 100 phút. ${a} giờ = ${a * 60} phút.` },
      { match: String(a * 60), code: 'QUY', why: `Có thể con mới đổi phần giờ. Còn ${b} phút nữa phải cộng vào.` },
    ];
    const prompt = ti === 0 ? `Đổi ${a} giờ ${b} phút ra phút.` : ti === 1 ? `${name} đọc sách ${a} giờ ${b} phút. Hỏi ${name} đọc sách bao nhiêu phút?` : `Chuyến đi mất ${a} giờ ${b} phút. Đổi ra phút.`;
    return {
      id: 'g16.2', src: SRC, type: 'numpad',
      prompt,
      hint: '1 giờ = 60 phút.',
      slots: [{ label: `${a} giờ ${b} phút =`, answer: String(tot), len: String(tot).length, unit: 'phút' }],
      wrongHints: wh,
      explain: {
        steps: workSteps([
          { t: `1 giờ = 60 phút, nên con nhân ${a} với 60.`, line: { text: `${a} giờ = ${a} × 60 = ${a * 60} phút`, note: 'đổi giờ' } },
          { t: `Con cộng thêm ${b} phút: ${a * 60} + ${b} = ${tot} phút.`, line: { text: `${a * 60} + ${b} = ${tot} phút`, note: 'cộng phút' } },
          { t: `Vậy ${a} giờ ${b} phút = ${tot} phút. Đáp án là ${tot} phút.`, line: { text: `${a} giờ ${b} phút = ${tot} phút`, note: 'ghép lại', color: '#1F8A4C' } },
        ]),
      },
      meta: { form: 'B', a, b },
    };
  },
  solve(item) {
    const mt = item.meta;
    if (mt.form === 'A') return `${Math.floor(mt.N / 60)}|${mt.N % 60}`;
    return String(mt.a * 60 + mt.b);
  },
};

// g16.3: khoảng thời gian trong buổi sáng (kiểu 12 giờ) — bài 16.4, 16.7
const g3 = {
  id: 'g16.3', covers: ['16.4', '16.7'],
  make(rng) {
    const [h1, m1, h2, m2] = pickSpan(rng, 6, 9, 45, 215, 11);
    const item = durationItem(rng, 'g16.3', h1, m1, h2, m2, (h, m) => t12(h, m));
    return item;
  },
  solve: solveDuration,
};

// g16.4: giờ kết thúc = giờ bắt đầu + thời lượng — bài 16.5
const g4 = {
  id: 'g16.4', covers: ['16.5'],
  make(rng) {
    const h = int(rng, 13, 19);
    const dh = int(rng, 1, 3);
    let m, dm;
    do { m = pick(rng, [10, 15, 20, 30, 40, 45, 50]); dm = pick(rng, [15, 20, 30, 40, 45, 50]); } while (m + dm < 60);
    const s = m + dm; // 60..109
    const H = h + dh;
    const r = s - 60;
    const correct = fmtT(H + 1, r);
    const thing = pick(rng, ['Bộ phim', 'Buổi biểu diễn', 'Trận bóng', 'Buổi học vẽ', 'Buổi văn nghệ', 'Giờ bơi']);
    const sub = Math.abs(m - dm);
    const wrongs = [
      sub !== r
        ? { text: fmtT(H, sub), code: 'DẤU', why: `Phút phải CỘNG, không phải trừ: ${m} + ${dm} = ${s} phút = 1 giờ ${r} phút.` }
        : { text: fmtT(H, m), code: 'QUY', why: `Có thể con mới cộng giờ rồi chép nguyên ${m} phút. Còn phải cộng thêm ${dm} phút: ${m} + ${dm} = ${s} phút = 1 giờ ${r} phút.` },
      { text: fmtT(H, r), code: 'QUY', why: `Có thể con quên cộng thêm 1 giờ khi đổi 60 phút. ${m} + ${dm} = ${s} phút = 1 giờ ${r} phút.` },
      { text: fmtT(H + 1, m), code: 'QUY', why: `Cộng thừa: sau khi đổi 60 phút thành 1 giờ, còn lại ${r} phút, không phải ${m} phút.` },
    ];
    const t = int(rng, 0, 1);
    return {
      id: 'g16.4', src: SRC, type: 'choice',
      prompt: t === 0 ? `${thing} bắt đầu lúc ${fmtT(h, m)} và kéo dài ${fmtD(dh, dm)}. ${thing} kết thúc lúc mấy giờ?` : `${thing} diễn ra từ ${fmtT(h, m)}, thời gian kéo dài ${fmtD(dh, dm)}. Hỏi ${thing.toLowerCase()} kết thúc lúc mấy giờ?`,
      visual: clock(h, m, { mode: 'both', show24: true }),
      hint: 'Cộng giờ trước, cộng phút sau. Nếu phút từ 60 trở lên thì đổi ra giờ.',
      choices: mkChoices(rng, correct, wrongs),
      explain: {
        steps: workSteps([
          { t: `Con cộng giờ trước: ${h} giờ + ${dh} giờ = ${H} giờ.`, line: { text: `${h} giờ + ${dh} giờ = ${H} giờ`, note: 'cộng giờ' } },
          { t: `Rồi cộng phút: ${m} phút + ${dm} phút = ${s} phút.`, line: { text: `${m} + ${dm} = ${s} phút`, note: 'cộng phút' } },
          { t: `${s} phút nhiều hơn 60, con đổi 60 phút thành 1 giờ${r ? `: còn ${r} phút` : ''}.`, line: { text: `${s} phút = ${fmtD(1, r)}`, note: '60 phút = 1 giờ' } },
          { t: `Con cộng lại: ${H} giờ + ${fmtD(1, r)}. Đáp án là ${correct}.`, line: { text: `${H} giờ + ${fmtD(1, r)} = ${correct}`, note: 'cộng lại', color: '#1F8A4C' } },
        ]),
      },
      meta: { h, m, dh, dm },
    };
  },
  solve(item) {
    const { h, m, dh, dm } = item.meta;
    const total = h * 60 + m + dh * 60 + dm;
    const [eh, em] = fromMin(total);
    return fmtT(eh, em);
  },
};

// g16.5: Đúng/Sai về đổi giờ 12 <-> 24 giờ (có buổi)
const g5 = {
  id: 'g16.5',
  make(rng) {
    rng.next(); rng.next(); // xáo luồng ngẫu nhiên để 16 seed đầu cân bằng Đúng/Sai
    const truth = rng.next() < 0.5;
    const mode = int(rng, 1, 2);
    const name = pick(rng, NAMES);
    const ti = int(rng, 0, 2);
    let stmt, ans, wrongWhy, rightK, H, K, buoi, X, H2;
    if (mode === 1) {
      // "H giờ là K giờ buổi."
      const evening = rng.next() < 0.5;
      H = evening ? int(rng, 19, 22) : int(rng, 13, 16);
      rightK = H - 12; const rightB = buoiOf(H);
      if (truth) { K = rightK; buoi = rightB; } else {
        const kind = int(rng, 0, 2);
        if (kind === 0) { K = rightK; buoi = 'sáng'; } else if (kind === 1) { K = H - 10; buoi = rightB; } else { K = H - 13; buoi = rightB; }
      }
      ans = K === rightK && buoi === rightB;
      stmt = `${H} giờ là ${K} giờ ${buoi}.`;
      wrongWhy = ans ? `${H} − 12 = ${rightK}, nên ${H} giờ đúng là ${rightK} giờ ${rightB}.` : buoi !== rightB ? `${H} giờ là ${rightK} giờ ${rightB}. Còn ${K} giờ ${buoi} là một giờ khác, vì ${H} giờ là buổi ${rightB}.` : `${H} − 12 = ${rightK}, không phải ${K}. ${H} giờ là ${rightK} giờ ${rightB}.`;
    } else {
      // "X giờ buổi là H2 giờ."
      const evening = rng.next() < 0.5;
      X = evening ? int(rng, 7, 11) : int(rng, 1, 5);
      buoi = evening ? 'tối' : 'chiều';
      const rightH = X + 12;
      H2 = truth ? rightH : pick(rng, [X, X + 10, X + 11, X + 13].filter((v) => v !== rightH));
      ans = H2 === rightH;
      stmt = `${X} giờ ${buoi} là ${H2} giờ.`;
      wrongWhy = ans ? `${X} + 12 = ${rightH}, nên ${X} giờ ${buoi} đúng là ${rightH} giờ.` : `${X} giờ ${buoi} là ${X} + 12 = ${rightH} giờ, không phải ${H2} giờ.`;
    }
    const prompt = ti === 0 ? `Câu này ĐÚNG hay SAI? "${stmt}"` : ti === 1 ? `${name} nói: "${stmt}" Bạn ${name} nói ĐÚNG hay SAI?` : `Đọc câu sau rồi chọn ĐÚNG hoặc SAI: "${stmt}"`;
    const hh = mode === 1 ? H : X + 12;
    return {
      id: 'g16.5', src: SRC, type: 'tf',
      prompt,
      visual: clock(mode === 1 ? H : X + 12, 0),
      hint: mode === 1 ? 'Từ 13 giờ trở đi, lấy số giờ trừ đi 12.' : 'Buổi chiều và tối: lấy số giờ cộng thêm 12.',
      answer: ans,
      whyWrong: wrongWhy,
      explain: {
        steps: mode === 1
          ? [
            { text: `Đổi từ cách đọc 24 giờ về cách đọc 12 giờ: lấy ${H} − 12 = ${rightK}.`, visual: clock(H, 0, { mode: 'both', show24: true, ampm: true }) },
            { text: `${H} giờ là ${rightK} giờ ${buoiOf(H)}.` },
            { text: ans ? `Câu đã cho đúng ${rightK} giờ ${buoiOf(H)}, nên câu này ĐÚNG.` : `Câu đã cho là "${stmt}", không khớp, nên câu này SAI.` },
          ]
          : [
            { text: `Buổi ${buoi} thì cộng thêm 12: ${X} + 12 = ${X + 12}.`, visual: clock(X + 12, 0, { mode: 'both', show24: true, ampm: true }) },
            { text: `${X} giờ ${buoi} là ${X + 12} giờ.` },
            { text: ans ? `Câu đã cho nói ${H2} giờ, đúng ${X + 12} giờ, nên câu này ĐÚNG.` : `Câu đã cho nói ${H2} giờ, không khớp ${X + 12} giờ, nên câu này SAI.` },
          ],
      },
      meta: { mode, H, K, buoi, X, H2 },
    };
  },
  solve(item) {
    const { mode, H, K, buoi, X, H2 } = item.meta;
    if (mode === 1) return String(K === H - 12 && buoi === buoiOf(H));
    return String(H2 === X + 12);
  },
};

// g16.6: nối giờ trong ngày với cách đọc 24 giờ — bài 16.1
const g6 = {
  id: 'g16.6', covers: ['16.1'],
  make(rng) {
    const Xs = int(rng, 1, 11), Xc = int(rng, 1, 5), Xt = int(rng, 7, 11);
    const lefts = [
      { id: 'a', text: `${Xs} giờ sáng`, H: Xs }, { id: 'b', text: '12 giờ trưa', H: 12 },
      { id: 'c', text: `${Xc} giờ chiều`, H: Xc + 12 }, { id: 'd', text: `${Xt} giờ tối`, H: Xt + 12 },
    ];
    const used = new Set(lefts.map((l) => l.H));
    const pool = [13, 14, 15, 16, 17, 19, 20, 21, 22, 23].filter((v) => !used.has(v));
    const dist = shuffle(rng, pool).slice(0, 2);
    const right = [...lefts.map((l) => ({ id: 'r' + l.H, text: `${l.H} giờ` })), ...dist.map((v) => ({ id: 'r' + v, text: `${v} giờ` }))];
    const pairs = {}; lefts.forEach((l) => { pairs[l.id] = 'r' + l.H; });
    const list = lefts.map((l) => l.text).join(', ');
    const t = int(rng, 0, 2);
    const prompt = t === 0 ? `Nối mỗi giờ trong ngày (${list}) với cách đọc 24 giờ.` : t === 1 ? `Nối mỗi giờ sau (${list}) với cách đọc theo 24 giờ.` : `Đổi các giờ trong ngày (${list}) sang cách đọc 24 giờ bằng cách nối.`;
    return {
      id: 'g16.6', src: SRC, type: 'match',
      prompt,
      hint: 'Từ 1 giờ chiều trở đi, lấy số giờ cộng thêm 12.',
      left: lefts.map((l) => ({ id: l.id, text: l.text })), right: shuffle(rng, right), pairs,
      explain: {
        steps: [
          { text: `Buổi sáng và 12 giờ trưa thì hai cách đọc giống nhau. Vậy ${Xs} giờ sáng là ${Xs} giờ, 12 giờ trưa là 12 giờ.`, visual: clock(Xs, 0, { mode: 'both', show24: true }) },
          { text: `Buổi chiều và buổi tối thì cộng thêm 12. ${Xc} giờ chiều là ${Xc} + 12 = ${Xc + 12} giờ.`, visual: clock(Xc + 12, 0, { mode: 'both', show24: true, ampm: true }) },
          { text: `${Xt} giờ tối là ${Xt} + 12 = ${Xt + 12} giờ.`, visual: clock(Xt + 12, 0, { mode: 'both', show24: true, ampm: true }) },
          { text: `Còn hai số ${dist[0]} giờ và ${dist[1]} giờ là cách đọc của giờ khác, nên không dùng.`, mark: 'bad' },
          { text: `Vậy đáp án là ${lefts.map((l) => `${l.H} giờ`).join(', ')}.`, mark: 'good' },
        ],
      },
      meta: { Hs: lefts.map((l) => l.H) },
    };
  },
  solve(item) { const o = {}; item.meta.Hs.forEach((H, i) => { o['abcd'[i]] = 'r' + H; }); return o; },
};

// g16.7: đọc đồng hồ kim — bài 16.2
const g7 = {
  id: 'g16.7', covers: ['16.2'],
  make(rng) {
    const h = int(rng, 1, 12), m = 5 * int(rng, 0, 11);
    const correct = fmtT(h, m);
    const nx = h % 12 + 1;
    const cand = [];
    if (m > 0) cand.push({ text: fmtT(h, m / 5), code: 'QUY', why: `Hai số cạnh nhau trên đồng hồ cách nhau 5 phút. Kim dài chỉ số ${m / 5} là ${m / 5} × 5 = ${m} phút, không phải ${m / 5} phút.` });
    cand.push({ text: fmtT(m === 0 ? 12 : m / 5, (h % 12) * 5), code: 'NGƯỢC', why: 'Kim ngắn chỉ giờ, kim dài chỉ phút. Có thể con đã đọc ngược hai kim.' });
    cand.push({ text: fmtT(nx, m), code: 'QUY', why: `Kim ngắn mới qua số ${h}, chưa tới số ${nx}, nên giờ vẫn là ${h}.` });
    if (m > 0 && 60 - m !== m) cand.push({ text: fmtT(h, 60 - m), code: 'ĐẾM', why: `Kim dài chỉ số ${m / 5}: đếm từ số 12 theo chiều kim đồng hồ, ${m / 5} × 5 = ${m} phút, không phải đếm ngược.` });
    if (m === 0) cand.push({ text: fmtT(h, 12), code: 'QUY', why: 'Kim dài chỉ số 12 nghĩa là 0 phút (giờ tròn), không phải 12 phút.' });
    const wrongs = shuffle(rng, cand.filter((c) => c.text !== correct)).slice(0, 3);
    const name = pick(rng, NAMES);
    const t = int(rng, 0, 2);
    const prompt = t === 0 ? 'Đồng hồ trong hình chỉ mấy giờ?' : t === 1 ? `${name} nhìn đồng hồ treo tường. Đồng hồ chỉ mấy giờ?` : 'Con hãy đọc giờ trên đồng hồ trong hình.';
    return {
      id: 'g16.7', src: SRC, type: 'choice',
      prompt,
      visual: clock(h, m),
      hint: 'Kim ngắn chỉ giờ, kim dài chỉ phút. Hai số cạnh nhau cách nhau 5 phút.',
      choices: mkChoices(rng, correct, wrongs),
      explain: {
        steps: [
          { text: `Kim ngắn ${m === 0 ? `chỉ đúng số ${h}` : `đã qua số ${h} và chưa tới số ${nx}`}. Vậy là ${h} giờ.`, visual: clock(h, m, { anim: 'tick' }) },
          { text: m === 0 ? 'Kim dài chỉ số 12, tức là 0 phút (giờ tròn).' : `Kim dài chỉ số ${m / 5}. Hai số cạnh nhau cách nhau 5 phút, nên ${m / 5} × 5 = ${m} phút.`, visual: clock(h, m, { mode: 'both' }) },
          { text: `Vậy đồng hồ chỉ ${correct}. Đáp án là ${correct}.` },
        ],
      },
      meta: { h, m },
    };
  },
  solve(item) { return fmtT(item.meta.h, item.meta.m); },
};

// g16.8: đổi đơn vị hai câu (giờ -> phút; phút -> giờ và phút) — bài 16.3
const g8 = {
  id: 'g16.8', covers: ['16.3'],
  make(rng) {
    const X = int(rng, 1, 5);
    const q = int(rng, 1, 4), r = 5 * int(rng, 1, 11);
    const N = 60 * q + r;
    const prompt = `Đổi đơn vị.\na) ${X} giờ bằng bao nhiêu phút?\nb) ${N} phút bằng bao nhiêu giờ và bao nhiêu phút?`;
    const wh = [
      { match: `${X * 100}|${q}|${r}`, code: 'QUY', why: `1 giờ có 60 phút, không phải 100 phút. ${X} giờ = ${X} × 60 = ${X * 60} phút.` },
      { match: `${X * 60}|${Math.floor(N / 100)}|${N % 100}`, code: 'QUY', why: `${N} phút không đổi theo 100. Lấy từng 60 phút ra: được ${q} giờ và còn ${r} phút.` },
    ];
    if (q >= 2) wh.push({ match: `${X * 60}|${q - 1}|${r + 60}`, code: 'QUY', why: `Chưa đổi hết: ${r + 60} phút vẫn còn đổi được thêm 1 giờ (60 phút).` });
    return {
      id: 'g16.8', src: SRC, type: 'numpad',
      prompt,
      hint: '1 giờ = 60 phút. Ở câu b, lấy 60 phút ra từng lần.',
      slots: [
        { label: `a) ${X} giờ =`, answer: String(X * 60), len: String(X * 60).length, unit: 'phút' },
        { label: `b) ${N} phút =`, answer: String(q), len: 1, unit: 'giờ' },
        { label: 'và', answer: String(r), len: String(r).length, unit: 'phút' },
      ],
      wrongHints: wh,
      explain: {
        steps: workSteps([
          { t: `Câu a: 1 giờ = 60 phút, nên con nhân ${X} với 60.`, line: { text: `a) ${X} giờ = ${X} × 60 = ${X * 60} phút`, note: 'đổi giờ' } },
          ...Array.from({ length: q }, (_, i) => ({
            t: i === 0 ? `Câu b: con lấy ra 60 phút (1 giờ): ${N} − 60 = ${N - 60}.` : `Con lấy tiếp 60 phút nữa: ${N - 60 * i} − 60 = ${N - 60 * (i + 1)}.`,
            line: { text: `${N - 60 * i} − 60 = ${N - 60 * (i + 1)}`, note: `${i + 1} giờ` },
          })),
          { t: `Đã lấy ra ${q} lần 60 phút, còn ${r} phút. Đáp án là a) ${X * 60} phút; b) ${q} giờ ${r} phút.`, line: { text: `b) ${N} phút = ${q} giờ ${r} phút`, note: 'ghép lại', color: '#1F8A4C' } },
        ]),
      },
      meta: { X, q, r },
    };
  },
  solve(item) { const { X, q, r } = item.meta; return `${X * 60}|${q}|${r}`; },
};

// g16.9: khoảng thời gian, giờ kiểu 24 giờ — bài 16.4
const g9 = {
  id: 'g16.9', covers: ['16.4'],
  make(rng) {
    const [h1, m1, h2, m2] = pickSpan(rng, 12, 19, 30, 200, 22);
    return durationItem(rng, 'g16.9', h1, m1, h2, m2, (h, m) => t24(h, m));
  },
  solve: solveDuration,
};

// g16.10: xếp các thời điểm trong cùng một ngày — bài 16.6
const g10 = {
  id: 'g16.10', covers: ['16.6'],
  make(rng) {
    const poolH = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22];
    const Hs = shuffle(rng, poolH).slice(0, 4);
    const items = Hs.map((H) => {
      const m = pick(rng, [0, 0, 0, 15, 30, 45]);
      let text;
      if (H < 12) text = `${t12(H, m)}`;
      else if (H === 12) text = m ? `12 giờ ${m} phút trưa` : (rng.next() < 0.5 ? '12 giờ trưa' : '12 giờ');
      else text = rng.next() < 0.5 ? t24(H, m) : t12(H, m);
      return { id: 't' + minOf(H, m), text, key: minOf(H, m), H, m };
    });
    const early = rng.next() < 0.6;
    const sorted = items.slice().sort((a, b) => (early ? a.key - b.key : b.key - a.key));
    const answer = sorted.map((x) => x.id);
    let chips;
    do { chips = shuffle(rng, items).map((x) => ({ id: x.id, text: x.text })); } while (chips.map((c) => c.id).join() === answer.join());
    const wrongHints = [{ match: answer.slice().reverse(), code: 'ĐỌC', why: `Đề yêu cầu xếp từ ${early ? 'SỚM đến MUỘN' : 'MUỘN đến SỚM'}. Có thể con đã xếp ngược lại.` }];
    const lead = (x) => parseInt(x.text, 10);
    const naive = items.slice().sort((a, b) => (early ? lead(a) - lead(b) : lead(b) - lead(a))).map((x) => x.id);
    if (naive.join() !== answer.join() && naive.join() !== answer.slice().reverse().join()) wrongHints.push({ match: naive, code: 'QUY', why: 'Có thể con xếp theo các số đứng đầu. Nhưng giờ chiều và giờ tối phải đổi ra cách đọc 24 giờ (cộng 12) mới so được.' });
    const conv = (x) => `${x.text} = ${t24(x.H, x.m)}`;
    return {
      id: 'g16.10', src: SRC, type: 'order',
      prompt: early ? 'Xếp các thời điểm trong CÙNG MỘT NGÀY từ SỚM đến MUỘN (chạm thời điểm sớm nhất trước).' : 'Xếp các thời điểm trong CÙNG MỘT NGÀY từ MUỘN đến SỚM (chạm thời điểm muộn nhất trước).',
      hint: 'Đổi hết về cách đọc 24 giờ rồi so sánh.',
      items: chips, answer, wrongHints,
      explain: {
        steps: [
          { text: `Đổi hết về cách đọc 24 giờ: ${items.slice().sort((a, b) => a.key - b.key).map(conv).join('; ')}.`, visual: clock(sorted[0].H, sorted[0].m, { mode: 'both', show24: true }) },
          { text: `So sánh các giờ: ${items.slice().sort((a, b) => a.key - b.key).map((x) => t24(x.H, x.m)).join(' < ')}.` },
          { text: `Từ ${early ? 'sớm đến muộn' : 'muộn đến sớm'}: ${sorted.map((x) => x.text).join(', ')}.` },
        ],
      },
      meta: { keys: items.map((x) => ({ id: x.id, key: x.key })), early },
    };
  },
  solve(item) { const { keys, early } = item.meta; return keys.slice().sort((a, b) => (early ? a.key - b.key : b.key - a.key)).map((x) => x.id).join(','); },
};

// g16.11: khoảng thời gian từ buổi sáng đến buổi chiều — bài 16.7
const g11 = {
  id: 'g16.11', covers: ['16.7'],
  make(rng) {
    const h1 = int(rng, 6, 11), m1 = 5 * int(rng, 0, 11);
    const X = int(rng, 1, 5), m2 = 5 * int(rng, 0, 11);
    const h2 = X + 12;
    const conv = { t: `Con đổi ${X} giờ chiều sang cách đọc 24 giờ: cộng thêm 12.`, line: { text: `${X} giờ chiều = ${X} + 12 = ${h2} giờ`, note: 'đổi 24 giờ' } };
    return durationItem(rng, 'g16.11', h1, m1, h2, m2, (h, m) => t12(h, m), [conv]);
  },
  solve: solveDuration,
};

// ---------- chủ đề ----------
export default {
  id: 'cd16', no: 16, day: 5, title: 'Thời gian: giờ, phút, thời gian biểu', short: 'Thời gian', icon: '⏰',
  intro: '1 giờ có 60 phút. 1 ngày có 24 giờ. Từ 1 giờ chiều trở đi, lấy số giờ buổi chiều cộng thêm 12 để ra cách đọc 24 giờ.',

  remember: [
    {
      text: '1 giờ có 60 phút. 1 ngày có 24 giờ. 1 tuần có 7 ngày. Kim ngắn chỉ giờ, kim dài chỉ phút.',
      visual: clock(9, 0, { mode: 'both' }),
    },
    {
      text: 'Buổi sáng thì cách đọc 24 giờ giống cách đọc 12 giờ. Từ 1 giờ chiều trở đi, cộng thêm 12: 3 giờ chiều là 15 giờ, 8 giờ tối là 20 giờ. 12 giờ đêm là 24 giờ, cũng gọi là 0 giờ.',
      visual: clock(15, 0, { mode: 'both', show24: true, ampm: true }),
    },
    {
      text: 'Muốn biết khoảng thời gian, lấy giờ kết thúc trừ giờ bắt đầu. Cứ đủ 60 phút thì đổi thành 1 giờ.',
      visual: tl([{ label: 'Học bài', from: '14:00', to: '15:30' }], { scale: { from: '13:00', to: '16:00' }, showDuration: true }),
    },
    {
      text: 'Cách làm nháp: tính từng chặng, đến giờ tròn trước, rồi cộng phần còn lại. Đủ 60 phút thì đổi thành 1 giờ.',
      visual: { kind: 'workout', lines: [{ text: '8:40 đến 9:00 là 20 phút', note: 'đến giờ tròn' }, { text: '9:00 đến 9:35 là 35 phút', note: 'phần còn lại' }, { text: '20 + 35 = 55 phút', note: 'cộng lại' }], upto: 3, done: true },
    },
  ],

  lesson: [
    { text: 'Kim ngắn chỉ giờ, kim dài chỉ phút. Kim dài chỉ số 6, mà hai số cạnh nhau cách nhau 5 phút, nên 6 × 5 = 30 phút. Đồng hồ này chỉ 3 giờ 30 phút.', visual: clock(3, 30, { mode: 'both', anim: 'tick' }) },
    { text: 'Một ngày có 24 giờ, kim giờ đi hai vòng đồng hồ. Buổi sáng từ 1 giờ đến 12 giờ thì hai cách đọc giống nhau.', visual: clock(9, 0, { mode: 'both', show24: true, ampm: true }) },
    { text: 'Buổi chiều và buổi tối thì mình cộng thêm 12. 3 giờ chiều là 3 + 12 = 15 giờ.', visual: clock(15, 0, { mode: 'both', show24: true, ampm: true, anim: 'tick' }) },
    { text: '8 giờ tối là 8 + 12 = 20 giờ. Còn 12 giờ đêm là 24 giờ, cũng gọi là 0 giờ.', visual: clock(20, 0, { mode: 'both', show24: true, ampm: true }) },
    { text: 'Tính khoảng thời gian: học bài từ 14 giờ đến 15 giờ 30 phút. Từ 14 giờ đến 15 giờ là 1 giờ, thêm 30 phút nữa. Vậy học 1 giờ 30 phút.', visual: tl([{ label: 'Học bài', from: '14:00', to: '15:30' }], { scale: { from: '13:00', to: '16:00' }, showDuration: true, anim: 'draw' }) },
    { text: 'Đổi đơn vị: 150 phút = 60 + 60 + 30, tức là 2 giờ 30 phút.', visual: tl([{ label: '150 phút', from: '8:00', to: '10:30' }], { scale: { from: '8:00', to: '11:00' }, showDuration: true }) },
    { text: 'Con ghi nháp từng chặng: 8:40 đến 9:00 là 20 phút, rồi 9:00 đến 9:35 là 35 phút. Cộng lại: 20 + 35 = 55 phút.', visual: { kind: 'workout', lines: [{ text: '8:40 đến 9:00 là 20 phút', note: 'đến giờ tròn' }, { text: '9:00 đến 9:35 là 35 phút', note: 'phần còn lại' }, { text: '20 + 35 = 55 phút', note: 'cộng lại' }], upto: 3 } },
    { text: 'Cộng giờ phút: khi phút nhiều hơn 60 thì đổi 60 phút thành 1 giờ. 1 giờ 45 phút + 30 phút = 1 giờ 75 phút = 2 giờ 15 phút.', visual: { kind: 'workout', lines: [{ text: '1 giờ 45 phút + 30 phút' }, { text: '= 1 giờ 75 phút', note: '45 + 30 = 75' }, { text: '= 2 giờ 15 phút', note: '60 phút = 1 giờ' }], upto: 3 } },
  ],

  items: [
    {
      id: '16.1', src: SRC, type: 'match',
      prompt: 'Nối mỗi giờ trong ngày với cách đọc 24 giờ.',
      hint: 'Từ 1 giờ chiều trở đi, lấy số giờ cộng thêm 12.',
      left: [
        { id: 'a', text: '9 giờ sáng' }, { id: 'b', text: '12 giờ trưa' },
        { id: 'c', text: '3 giờ chiều' }, { id: 'd', text: '8 giờ tối' },
      ],
      right: [
        { id: 'r9', text: '9 giờ' }, { id: 'r12', text: '12 giờ' }, { id: 'r15', text: '15 giờ' },
        { id: 'r20', text: '20 giờ' }, { id: 'r13', text: '13 giờ' }, { id: 'r18', text: '18 giờ' },
      ],
      pairs: { a: 'r9', b: 'r12', c: 'r15', d: 'r20' },
      explain: {
        steps: [
          { text: 'Buổi sáng và 12 giờ trưa thì hai cách đọc giống nhau. Vậy 9 giờ sáng là 9 giờ, 12 giờ trưa là 12 giờ.', visual: clock(9, 0, { mode: 'both', show24: true }) },
          { text: 'Buổi chiều và buổi tối thì cộng thêm 12. 3 giờ chiều là 3 + 12 = 15 giờ.', visual: clock(15, 0, { mode: 'both', show24: true, ampm: true }) },
          { text: '8 giờ tối là 8 + 12 = 20 giờ.', visual: clock(20, 0, { mode: 'both', show24: true, ampm: true }) },
          { text: 'Còn hai số 13 giờ và 18 giờ là cách đọc của 1 giờ chiều và 6 giờ chiều, nên không dùng.', mark: 'bad' },
          { text: 'Vậy đáp án là 9 giờ, 12 giờ, 15 giờ, 20 giờ.', mark: 'good' },
        ],
      },
    },
    {
      id: '16.2', src: SRC, type: 'choice',
      prompt: 'Đồng hồ trong hình chỉ mấy giờ?',
      visual: clock(3, 30),
      hint: 'Kim ngắn chỉ giờ, kim dài chỉ phút. Hai số cạnh nhau cách nhau 5 phút.',
      choices: [
        { text: '3 giờ 30 phút', correct: true },
        { text: '3 giờ 6 phút', code: 'QUY', why: 'Hai số cạnh nhau trên đồng hồ cách nhau 5 phút. Kim dài chỉ số 6 là 6 × 5 = 30 phút, không phải 6 phút.' },
        { text: '6 giờ 15 phút', code: 'NGƯỢC', why: 'Kim ngắn chỉ giờ, kim dài chỉ phút. Có thể con đã đọc ngược hai kim.' },
        { text: '4 giờ 30 phút', code: 'QUY', why: 'Kim ngắn mới qua số 3, chưa tới số 4, nên giờ vẫn là 3.' },
      ],
      explain: {
        steps: [
          { text: 'Kim ngắn đã qua số 3 và chưa tới số 4. Vậy là 3 giờ.', visual: clock(3, 30, { anim: 'tick' }) },
          { text: 'Kim dài chỉ số 6. Hai số cạnh nhau cách nhau 5 phút, nên 6 × 5 = 30 phút.', visual: clock(3, 30, { mode: 'both' }) },
          { text: 'Vậy đồng hồ chỉ 3 giờ 30 phút. Đáp án là 3 giờ 30 phút.' },
        ],
      },
    },
    {
      id: '16.3', src: SRC, type: 'numpad',
      prompt: 'Đổi đơn vị.\na) 2 giờ bằng bao nhiêu phút?\nb) 150 phút bằng bao nhiêu giờ và bao nhiêu phút?',
      hint: '1 giờ = 60 phút. Ở câu b, lấy 60 phút ra từng lần.',
      slots: [
        { label: 'a) 2 giờ =', answer: '120', len: 3, unit: 'phút' },
        { label: 'b) 150 phút =', answer: '2', len: 1, unit: 'giờ' },
        { label: 'và', answer: '30', len: 2, unit: 'phút' },
      ],
      wrongHints: [
        { match: '200|2|30', code: 'QUY', why: '1 giờ có 60 phút, không phải 100 phút. 2 giờ = 2 × 60 = 120 phút.' },
        { match: '120|1|50', code: 'QUY', why: '150 phút không đổi theo 100. Lấy 60 phút ra: 150 − 60 = 90, 90 − 60 = 30. Được 2 giờ và còn 30 phút.' },
      ],
      explain: {
        steps: workSteps([
          { t: 'Câu a: 1 giờ = 60 phút, nên con nhân 2 với 60.', line: { text: 'a) 2 giờ = 2 × 60 = 120 phút', note: 'đổi giờ' } },
          { t: 'Câu b: con lấy ra 60 phút (1 giờ): 150 − 60 = 90.', line: { text: '150 − 60 = 90', note: '1 giờ' } },
          { t: 'Con lấy tiếp 60 phút nữa: 90 − 60 = 30.', line: { text: '90 − 60 = 30', note: '2 giờ' } },
          { t: 'Đã lấy ra 2 lần 60 phút, còn lại 30 phút. Đáp án là a) 120 phút; b) 2 giờ 30 phút.', line: { text: 'b) 150 phút = 2 giờ 30 phút', note: 'ghép lại', color: '#1F8A4C' } },
        ]),
      },
    },
    {
      id: '16.4', src: SRC, type: 'choice',
      prompt: 'An bắt đầu học bài lúc 14 giờ và dừng lúc 15 giờ 30 phút để đi chơi. An học bài trong bao lâu?',
      visual: tl([{ label: 'Học bài', from: '14:00', to: '15:30' }, { label: 'Đi chơi', from: '15:30', to: '16:30', color: '#34B27B' }], { scale: { from: '13:00', to: '17:00' } }),
      hint: 'Đếm từ 14 giờ tới giờ tròn kế tiếp, rồi thêm phần phút.',
      choices: [
        { text: '1 giờ 30 phút', correct: true },
        { text: '1 giờ 50 phút', code: 'QUY', why: 'Từ 14 giờ đến 15 giờ là 1 giờ, từ 15 giờ đến 15 giờ 30 phút là 30 phút. Không phải 50 phút.' },
        { text: '30 phút', code: 'ĐẾM', why: 'Có thể con mới tính phần phút. Từ 14 giờ đến 15 giờ còn có 1 giờ nữa.' },
      ],
      explain: {
        steps: workSteps([
          { t: 'Từ 14 giờ đến 15 giờ là 1 giờ.', line: { text: '14:00 đến 15:00 là 1 giờ', note: 'nhảy từng giờ' } },
          { t: 'Từ 15 giờ đến 15 giờ 30 phút là thêm 30 phút.', line: { text: '15:00 đến 15:30 là 30 phút', note: 'phần phút lẻ' } },
          { t: 'Con cộng lại: 1 giờ + 30 phút. Vậy An học bài 1 giờ 30 phút. Đáp án là 1 giờ 30 phút.', line: { text: '1 giờ + 30 phút = 1 giờ 30 phút', note: 'cộng lại', color: '#1F8A4C' } },
        ]),
      },
    },
    {
      id: '16.5', src: SRC, type: 'choice',
      prompt: 'Bộ phim bắt đầu lúc 19 giờ 15 phút và kéo dài 1 giờ 45 phút. Phim kết thúc lúc mấy giờ?',
      visual: clock(19, 15, { mode: 'both', show24: true }),
      hint: 'Cộng giờ trước, cộng phút sau. 60 phút đổi thành 1 giờ.',
      choices: [
        { text: '21 giờ', correct: true },
        { text: '20 giờ 45 phút', code: 'NHỚ', why: 'Có thể con mới cộng 1 giờ rồi chép 45 phút. 15 phút của giờ bắt đầu cũng phải cộng: 15 + 45 = 60 phút = 1 giờ, được 21 giờ.' },
        { text: '20 giờ', code: 'QUY', why: 'Có thể con quên cộng phút: 15 + 45 = 60 phút, tức 1 giờ nữa.' },
        { text: '21 giờ 15 phút', code: 'QUY', why: 'Cộng thừa 15 phút: sau khi 60 phút đổi thành 1 giờ thì không còn phút lẻ.' },
      ],
      explain: {
        steps: workSteps([
          { t: 'Con cộng giờ trước: 19 giờ + 1 giờ = 20 giờ.', line: { text: '19 giờ + 1 giờ = 20 giờ', note: 'cộng giờ' } },
          { t: 'Rồi cộng phút: 15 phút + 45 phút = 60 phút.', line: { text: '15 + 45 = 60 phút', note: 'cộng phút' } },
          { t: '60 phút bằng 1 giờ tròn, con đổi ra giờ.', line: { text: '60 phút = 1 giờ', note: '60 phút = 1 giờ' } },
          { t: 'Con cộng lại: 20 giờ + 1 giờ = 21 giờ. Đáp án là 21 giờ.', line: { text: '20 giờ + 1 giờ = 21 giờ', note: 'cộng lại', color: '#1F8A4C' } },
        ]),
      },
    },
    {
      id: '16.6', src: SRC, type: 'order',
      prompt: 'Xếp các thời điểm trong CÙNG MỘT NGÀY từ SỚM đến MUỘN (chạm thời điểm sớm nhất trước).',
      hint: 'Đổi hết về cách đọc 24 giờ rồi so sánh.',
      items: [
        { id: 'e19', text: '7 giờ tối' }, { id: 'h14', text: '14 giờ' },
        { id: 's9', text: '9 giờ sáng' }, { id: 't12', text: '12 giờ trưa' },
      ],
      answer: ['s9', 't12', 'h14', 'e19'],
      wrongHints: [
        { match: ['e19', 's9', 't12', 'h14'], code: 'QUY', why: 'Có thể con xếp theo các số 7, 9, 12, 14. Nhưng 7 giờ tối là 19 giờ, muộn nhất trong ngày.' },
      ],
      explain: {
        steps: [
          { text: 'Đổi hết về cách đọc 24 giờ. 9 giờ sáng là 9 giờ. 12 giờ trưa là 12 giờ.', visual: clock(9, 0, { mode: 'both', show24: true }) },
          { text: '7 giờ tối là 7 + 12 = 19 giờ. Còn 14 giờ thì giữ nguyên.', visual: clock(19, 0, { mode: 'both', show24: true, ampm: true }) },
          { text: 'So sánh: 9 giờ, 12 giờ, 14 giờ, 19 giờ.' },
          { text: 'Từ sớm đến muộn: 9 giờ sáng, 12 giờ trưa, 14 giờ, 7 giờ tối.' },
        ],
      },
    },
  ],

  variant: {
    id: '16.7', src: SRC, type: 'choice',
    prompt: 'Tàu rời ga lúc 8 giờ 40 phút sáng và đến nơi lúc 2 giờ chiều. Hành trình dài bao lâu?',
    visual: tl([{ label: 'Tàu chạy', from: '8:40', to: '14:00' }], { scale: { from: '8:00', to: '15:00' } }),
    hint: 'Đổi 2 giờ chiều ra cách đọc 24 giờ, rồi đếm từ 8 giờ 40 phút.',
    choices: [
      { text: '5 giờ 20 phút', correct: true },
      { text: '6 giờ 20 phút', code: 'QUY', why: '14 − 8 = 6, nhưng chưa tính đến 40 phút của 8 giờ 40 phút. Từ 8 giờ 40 phút đến 9 giờ chỉ có 20 phút.' },
      { text: '5 giờ 40 phút', code: 'QUY', why: 'Từ 8 giờ 40 phút đến 9 giờ chỉ có 20 phút, không phải 40 phút.' },
      { text: '6 giờ 40 phút', code: 'QUY', why: 'Có thể con giữ nguyên 40 phút của 8 giờ 40 phút. Nhưng từ 8 giờ 40 phút tới 9 giờ chỉ có 20 phút.' },
    ],
    explain: {
      steps: workSteps([
        { t: 'Con đổi 2 giờ chiều sang cách đọc 24 giờ: cộng thêm 12.', line: { text: '2 giờ chiều = 2 + 12 = 14 giờ', note: 'đổi 24 giờ' } },
        { t: 'Từ 8 giờ 40 phút đến giờ tròn kế tiếp là 9 giờ. Con lấy 60 − 40 = 20 phút.', line: { text: '8:40 đến 9:00 là 20 phút', note: 'đến giờ tròn' } },
        { t: 'Từ 9 giờ đến 14 giờ là 5 giờ.', line: { text: '9:00 đến 14:00 là 5 giờ', note: 'nhảy từng giờ' } },
        { t: 'Con cộng lại: 5 giờ + 20 phút. Đáp án là 5 giờ 20 phút.', line: { text: '5 giờ + 20 phút = 5 giờ 20 phút', note: 'cộng lại', color: '#1F8A4C' } },
      ]),
    },
  },

  generators: [g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11],
};
