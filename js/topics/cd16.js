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

// ---------- bộ sinh ----------
// g16.1: X giờ chiều/tối viết theo 24 giờ
const g1 = {
  id: 'g16.1',
  make(rng) {
    const evening = rng.next() < 0.5;
    const X = evening ? int(rng, 7, 10) : int(rng, 1, 5);
    const buoi = evening ? 'tối' : 'chiều';
    const H = X + 12;
    const correct = `${H} giờ`;
    return {
      id: 'g16.1', src: SRC, type: 'choice',
      prompt: `${X} giờ ${buoi} viết theo cách đọc 24 giờ là mấy giờ?`,
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
      meta: { X, buoi },
    };
  },
  solve(item) { return `${item.meta.X + 12} giờ`; },
};

// g16.2: đổi giờ - phút
const g2 = {
  id: 'g16.2',
  make(rng) {
    const formA = rng.next() < 0.5;
    if (formA) {
      // N phút = ? giờ ? phút
      let N;
      do { N = int(rng, 7, 23) * 10; } while (N % 60 === 0);
      const q = Math.floor(N / 60), r = N % 60;
      const [eh, em] = fromMin(8 * 60 + N);
      const wh = [];
      const q2 = Math.floor(N / 100), r2 = N % 100;
      if (!(q2 === q && r2 === r)) wh.push({ match: `${q2}|${r2}`, code: 'QUY', why: `1 giờ có 60 phút, không phải 100 phút. ${N} − 60 = ${N - 60}; còn phải đổi tiếp cho đến khi dưới 60 phút.` });
      if (q >= 2) wh.push({ match: `${q}|${N - 60 * (q - 1)}`, code: 'QUY', why: `Chưa đổi hết: ${N - 60 * (q - 1)} phút vẫn còn đổi được thêm 1 giờ.` });
      return {
        id: 'g16.2', src: SRC, type: 'numpad',
        prompt: `Đổi ${N} phút ra giờ và phút.`,
        hint: '1 giờ = 60 phút. Lấy từng 60 phút ra đổi thành giờ.',
        slots: [
          { label: `${N} phút =`, answer: String(q), len: 1, unit: 'giờ' },
          { label: 'và', answer: String(r), len: String(r).length, unit: 'phút' },
        ],
        wrongHints: wh,
        explain: {
          steps: [
            { text: `Cứ 60 phút là 1 giờ. Trong ${N} phút có ${q} lần 60 phút: ${q} × 60 = ${q * 60}.`, visual: tl([{ label: `${q} giờ`, from: tm(8, 0), to: tm(8 + q, 0) }], { scale: { from: '8:00', to: tm(eh + (em ? 1 : 0), 0) }, showDuration: true }) },
            { text: `Phút còn lại: ${N} − ${q * 60} = ${r} phút.`, visual: tl([{ label: `${q} giờ`, from: tm(8, 0), to: tm(8 + q, 0) }, { label: `${r} phút`, from: tm(8 + q, 0), to: tm(eh, em), color: '#F5893A' }], { scale: { from: '8:00', to: tm(eh + (em ? 1 : 0), 0) }, showDuration: true }) },
            { text: `Vậy ${N} phút = ${q} giờ ${r} phút.` },
          ],
        },
        meta: { form: 'A', N },
      };
    }
    // a giờ b phút = ? phút
    const a = int(rng, 1, 3);
    const b = pick(rng, [10, 15, 20, 30, 40, 45, 50]);
    const tot = a * 60 + b;
    const [eh, em] = fromMin(8 * 60 + tot);
    const wh = [
      { match: String(a * 100 + b), code: 'QUY', why: `1 giờ có 60 phút, không phải 100 phút. ${a} giờ = ${a * 60} phút.` },
      { match: String(a * 60), code: 'QUY', why: `Có thể con mới đổi phần giờ. Còn ${b} phút nữa phải cộng vào.` },
    ];
    return {
      id: 'g16.2', src: SRC, type: 'numpad',
      prompt: `Đổi ${a} giờ ${b} phút ra phút.`,
      hint: '1 giờ = 60 phút.',
      slots: [{ label: `${a} giờ ${b} phút =`, answer: String(tot), len: String(tot).length, unit: 'phút' }],
      wrongHints: wh,
      explain: {
        steps: [
          { text: `${a} giờ = ${a} × 60 = ${a * 60} phút.`, visual: tl([{ label: `${a} giờ`, from: tm(8, 0), to: tm(8 + a, 0) }], { scale: { from: '8:00', to: tm(eh + (em ? 1 : 0), 0) }, showDuration: true }) },
          { text: `Cộng thêm ${b} phút: ${a * 60} + ${b} = ${tot} phút.`, visual: tl([{ label: `${a} giờ`, from: tm(8, 0), to: tm(8 + a, 0) }, { label: `${b} phút`, from: tm(8 + a, 0), to: tm(eh, em), color: '#F5893A' }], { scale: { from: '8:00', to: tm(eh + (em ? 1 : 0), 0) }, showDuration: true }) },
          { text: `Vậy ${a} giờ ${b} phút = ${tot} phút.` },
        ],
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

// g16.3: khoảng thời gian giữa hai thời điểm
const g3 = {
  id: 'g16.3',
  make(rng) {
    const h1 = int(rng, 6, 8);
    const dh = int(rng, 1, 2);
    let m1, m2;
    do { m1 = pick(rng, [35, 40, 45, 50, 55]); m2 = pick(rng, [5, 10, 15, 20, 25]); } while (m1 - m2 === 30);
    const h2 = h1 + dh + 1; // ≤ 11
    const dm = 60 - m1 + m2;
    const correct = fmtD(dh, dm);
    const row = { label: 'Làm bài', from: tm(h1, m1), to: tm(h2, m2) };
    const scale = { from: tm(h1, 0), to: tm(h2 + 1, 0) };
    const wrongs = [
      { text: fmtD(dh + 1, m1 - m2), code: 'QUY', why: `Có thể con trừ riêng giờ: ${h2} − ${h1} = ${h2 - h1}. Rồi trừ riêng phút: ${m1} − ${m2} = ${m1 - m2}. Nhưng phút lúc làm xong (${m2}) bé hơn phút lúc bắt đầu (${m1}), nên phải mượn 1 giờ.` },
      { text: fmtD(dh + 1, dm), code: 'QUY', why: `Có thể con quên mượn giờ. ${dm} phút lấy từ 1 giờ, nên số giờ phải là ${dh}, không phải ${dh + 1}.` },
      { text: fmtD(dh, m1 - m2), code: 'QUY', why: `Số giờ đúng rồi. Nhưng phút phải là 60 − ${m1} + ${m2} = ${dm}, không phải ${m1 - m2}.` },
    ];
    return {
      id: 'g16.3', src: SRC, type: 'choice',
      prompt: `Lan bắt đầu làm bài lúc ${fmtT(h1, m1)} sáng và làm xong lúc ${fmtT(h2, m2)} sáng. Lan làm bài trong bao lâu?`,
      visual: tl([row], { scale }),
      hint: 'Đếm theo ba chặng: từ giờ bắt đầu lên giờ tròn kế tiếp, rồi nhảy từng giờ tròn, rồi cộng thêm số phút lẻ.',
      choices: mkChoices(rng, correct, wrongs),
      explain: {
        steps: [
          { text: `Từ ${fmtT(h1, m1)} đến ${fmtT(h1 + 1, 0)} là ${60 - m1} phút.`, visual: tl([{ label: 'Bước 1', from: tm(h1, m1), to: tm(h1 + 1, 0) }], { scale, showDuration: true }) },
          { text: `Từ ${fmtT(h1 + 1, 0)} đến ${fmtT(h2, 0)} là ${dh} giờ.`, visual: tl([{ label: 'Bước 1', from: tm(h1, m1), to: tm(h1 + 1, 0) }, { label: 'Bước 2', from: tm(h1 + 1, 0), to: tm(h2, 0), color: '#F5893A' }], { scale, showDuration: true }) },
          { text: `Từ ${fmtT(h2, 0)} đến ${fmtT(h2, m2)} là ${m2} phút. Cộng các phút: ${60 - m1} + ${m2} = ${dm}.`, visual: tl([row], { scale, showDuration: true }) },
          { text: `Vậy Lan làm bài ${correct}. Đáp án là ${correct}.` },
        ],
      },
      meta: { h1, m1, h2, m2 },
    };
  },
  solve(item) {
    const { h1, m1, h2, m2 } = item.meta;
    const t = (h2 * 60 + m2) - (h1 * 60 + m1);
    const [dh, dm] = fromMin(t);
    return fmtD(dh, dm);
  },
};

// g16.4: giờ kết thúc = giờ bắt đầu + thời lượng
const g4 = {
  id: 'g16.4',
  make(rng) {
    const h = int(rng, 13, 18);
    const dh = int(rng, 1, 3);
    let m, dm;
    do { m = pick(rng, [10, 15, 20, 30, 40, 45, 50]); dm = pick(rng, [15, 20, 30, 40, 45, 50]); } while (m + dm < 60);
    const s = m + dm; // 60..109
    const H = h + dh;
    const r = s - 60;
    const correct = fmtT(H + 1, r);
    const thing = pick(rng, ['Bộ phim', 'Buổi biểu diễn', 'Trận bóng', 'Buổi học vẽ']);
    const sub = Math.abs(m - dm);
    const wrongs = [
      sub !== r
        ? { text: fmtT(H, sub), code: 'DẤU', why: `Phút phải CỘNG, không phải trừ: ${m} + ${dm} = ${s} phút = 1 giờ ${r} phút.` }
        : { text: fmtT(H, m), code: 'QUY', why: `Có thể con mới cộng giờ rồi chép nguyên ${m} phút. Còn phải cộng thêm ${dm} phút: ${m} + ${dm} = ${s} phút = 1 giờ ${r} phút.` },
      { text: fmtT(H, r), code: 'QUY', why: `Có thể con quên cộng thêm 1 giờ khi đổi 60 phút. ${m} + ${dm} = ${s} phút = 1 giờ ${r} phút.` },
      { text: fmtT(H + 1, m), code: 'QUY', why: `Cộng thừa: sau khi đổi 60 phút thành 1 giờ, còn lại ${r} phút, không phải ${m} phút.` },
    ];
    return {
      id: 'g16.4', src: SRC, type: 'choice',
      prompt: `${thing} bắt đầu lúc ${fmtT(h, m)} và kéo dài ${fmtD(dh, dm)}. ${thing} kết thúc lúc mấy giờ?`,
      visual: clock(h, m, { mode: 'both', show24: true }),
      hint: 'Cộng giờ trước, cộng phút sau. Nếu phút từ 60 trở lên thì đổi ra giờ.',
      choices: mkChoices(rng, correct, wrongs),
      explain: {
        steps: [
          { text: `Cộng giờ: ${h} giờ + ${dh} giờ = ${H} giờ. Bây giờ là ${fmtT(H, m)}.`, visual: clock(H, m, { mode: 'both', show24: true }) },
          { text: `Cộng phút: ${m} + ${dm} = ${s} phút. ${s} phút = 1 giờ ${r} phút.`, visual: tl([{ label: 'Kéo dài', from: tm(h, m), to: tm(H + 1, r) }], { scale: { from: tm(h, 0), to: tm(H + 2, 0) }, showDuration: true }) },
          { text: `Vậy ${thing.toLowerCase()} kết thúc lúc ${correct}.`, visual: clock(H + 1, r, { mode: 'both', show24: true }) },
        ],
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

// g16.5: Đúng/Sai về giờ 24
const g5 = {
  id: 'g16.5',
  make(rng) {
    const evening = rng.next() < 0.5;
    const H = evening ? int(rng, 19, 22) : int(rng, 13, 16);
    const mode = int(rng, 1, 3);
    let K, buoi;
    if (mode === 1) { K = H - 12; buoi = buoiOf(H); }
    else if (mode === 2 && !evening) { K = H - 10; buoi = buoiOf(H); }
    else { K = H - 12; buoi = 'sáng'; }
    const rightK = H - 12, rightB = buoiOf(H);
    const ans = K === rightK && buoi === rightB;
    return {
      id: 'g16.5', src: SRC, type: 'tf',
      prompt: `Câu này ĐÚNG hay SAI? "${H} giờ là ${K} giờ ${buoi}."`,
      visual: clock(H, 0),
      hint: 'Từ 13 giờ trở đi, lấy số giờ trừ đi 12.',
      answer: ans,
      whyWrong: ans
        ? `${H} − 12 = ${rightK}, nên ${H} giờ đúng là ${rightK} giờ ${rightB}.`
        : buoi !== rightB
          ? `${H} giờ là ${rightK} giờ ${rightB}. Còn ${K} giờ ${buoi} là một giờ khác, vì ${H} giờ là buổi ${rightB}.`
          : `${H} − 12 = ${rightK}, không phải ${K}. ${H} giờ là ${rightK} giờ ${rightB}.`,
      explain: {
        steps: [
          { text: `Đổi từ cách đọc 24 giờ về cách đọc 12 giờ: lấy ${H} − 12 = ${rightK}.`, visual: clock(H, 0, { mode: 'both', show24: true, ampm: true }) },
          { text: `${H} giờ là ${rightK} giờ ${rightB}.` },
          { text: ans ? `Câu đã cho đúng ${rightK} giờ ${rightB}, nên câu này ĐÚNG.` : `Câu đã cho là "${H} giờ là ${K} giờ ${buoi}", không khớp, nên câu này SAI.` },
        ],
      },
      meta: { H, K, buoi },
    };
  },
  solve(item) {
    const { H, K, buoi } = item.meta;
    const bo = H < 12 ? 'sáng' : H === 12 ? 'trưa' : H <= 18 ? 'chiều' : 'tối';
    return String(K === H - 12 && buoi === bo);
  },
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
  ],

  lesson: [
    { text: 'Kim ngắn chỉ giờ, kim dài chỉ phút. Kim dài chỉ số 6, mà hai số cạnh nhau cách nhau 5 phút, nên 6 × 5 = 30 phút. Đồng hồ này chỉ 3 giờ 30 phút.', visual: clock(3, 30, { mode: 'both', anim: 'tick' }) },
    { text: 'Một ngày có 24 giờ, kim giờ đi hai vòng đồng hồ. Buổi sáng từ 1 giờ đến 12 giờ thì hai cách đọc giống nhau.', visual: clock(9, 0, { mode: 'both', show24: true, ampm: true }) },
    { text: 'Buổi chiều và buổi tối thì mình cộng thêm 12. 3 giờ chiều là 3 + 12 = 15 giờ.', visual: clock(15, 0, { mode: 'both', show24: true, ampm: true, anim: 'tick' }) },
    { text: '8 giờ tối là 8 + 12 = 20 giờ. Còn 12 giờ đêm là 24 giờ, cũng gọi là 0 giờ.', visual: clock(20, 0, { mode: 'both', show24: true, ampm: true }) },
    { text: 'Tính khoảng thời gian: học bài từ 14 giờ đến 15 giờ 30 phút. Từ 14 giờ đến 15 giờ là 1 giờ, thêm 30 phút nữa. Vậy học 1 giờ 30 phút.', visual: tl([{ label: 'Học bài', from: '14:00', to: '15:30' }], { scale: { from: '13:00', to: '16:00' }, showDuration: true, anim: 'draw' }) },
    { text: 'Đổi đơn vị: 150 phút = 60 + 60 + 30, tức là 2 giờ 30 phút.', visual: tl([{ label: '150 phút', from: '8:00', to: '10:30' }], { scale: { from: '8:00', to: '11:00' }, showDuration: true }) },
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
        steps: [
          { text: 'Câu a: 1 giờ = 60 phút nên 2 giờ = 2 × 60 = 120 phút.', visual: tl([{ label: '2 giờ', from: '8:00', to: '10:00' }], { scale: { from: '8:00', to: '11:00' }, showDuration: true }) },
          { text: 'Câu b: 150 − 60 = 90, rồi 90 − 60 = 30. Đã lấy ra 2 lần 60 phút (2 giờ), còn lại 30 phút.', visual: tl([{ label: '2 giờ', from: '8:00', to: '10:00' }, { label: '30 phút', from: '10:00', to: '10:30', color: '#F5893A' }], { scale: { from: '8:00', to: '11:00' }, showDuration: true }) },
          { text: 'Đáp án là a) 120 phút; b) 2 giờ 30 phút.' },
        ],
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
        steps: [
          { text: 'Từ 14 giờ đến 15 giờ là 1 giờ.', visual: tl([{ label: 'Học bài', from: '14:00', to: '15:00' }], { scale: { from: '13:00', to: '17:00' }, showDuration: true }) },
          { text: 'Từ 15 giờ đến 15 giờ 30 phút là thêm 30 phút.', visual: tl([{ label: 'Học bài', from: '14:00', to: '15:30' }], { scale: { from: '13:00', to: '17:00' }, showDuration: true, anim: 'draw' }) },
          { text: 'Vậy An học bài 1 giờ 30 phút. Đáp án là 1 giờ 30 phút.' },
        ],
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
        steps: [
          { text: 'Cộng 1 giờ: 19 giờ 15 phút + 1 giờ = 20 giờ 15 phút.', visual: clock(20, 15, { mode: 'both', show24: true }) },
          { text: 'Cộng 45 phút: 15 + 45 = 60 phút, tức là 1 giờ tròn.', visual: tl([{ label: 'Phim', from: '19:15', to: '21:00' }], { scale: { from: '19:00', to: '22:00' }, showDuration: true }) },
          { text: '20 giờ + 1 giờ = 21 giờ. Đáp án là 21 giờ.', visual: clock(21, 0, { mode: 'both', show24: true }) },
        ],
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
      steps: [
        { text: '2 giờ chiều = 2 + 12 = 14 giờ.', visual: clock(14, 0, { mode: 'both', show24: true, ampm: true }) },
        { text: 'Từ 8 giờ 40 phút đến 9 giờ là 20 phút.', visual: tl([{ label: 'Đoạn 1', from: '8:40', to: '9:00' }], { scale: { from: '8:00', to: '15:00' }, showDuration: true }) },
        { text: 'Từ 9 giờ đến 14 giờ là 5 giờ.', visual: tl([{ label: 'Đoạn 1', from: '8:40', to: '9:00' }, { label: 'Đoạn 2', from: '9:00', to: '14:00', color: '#F5893A' }], { scale: { from: '8:00', to: '15:00' }, showDuration: true }) },
        { text: 'Cộng lại: 5 giờ 20 phút. Đáp án là 5 giờ 20 phút.' },
      ],
    },
  },

  generators: [g1, g2, g3, g4, g5],
};
