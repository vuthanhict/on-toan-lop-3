// LOGIC THUẦN cho "viết nháp từng bước" (vở ô li, mực tím). Không DOM — chạy được trong Node.
// Phương pháp của lớp: gộp – tách – NHÓM LẠI (đổi 1 chục thành 10 đơn vị...), chia ngắn, tách theo hàng, ước lượng.
// Ký hiệu phép tính: '+', '−' (U+2212), '×', '÷' (chấp nhận thêm '-', '*', 'x', ':').

export const NAMES = ['đơn vị', 'chục', 'trăm', 'nghìn', 'chục nghìn', 'trăm nghìn'];

/** Viết số: từ 5 chữ số trở lên có dấu cách nghìn (21 035); số âm dùng '−'. */
export function fmt(n) {
  n = Math.round(Number(n) || 0);
  const s = String(Math.abs(n));
  const t = s.length > 4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s;
  return (n < 0 ? '−' : '') + t;
}

export function normOp(op) {
  const o = String(op).trim();
  if (o === '+') return '+';
  if (o === '-' || o === '−' || o === '–' || o === '—') return '−';
  if (o === '*' || o === 'x' || o === 'X' || o === '×' || o === '·') return '×';
  if (o === ':' || o === '÷' || o === '/') return '÷';
  throw new RangeError('Phép tính không hỗ trợ: ' + op);
}

function toInt(v, max, what) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > max) throw new RangeError((what || 'Số') + ' phải là số tự nhiên từ 0 đến ' + max + ': ' + v);
  return n;
}
/** Chữ số từ phải sang trái: 358 → [8,5,3]. */
export const dr = (n) => String(n).split('').reverse().map(Number);
const nm = (c) => NAMES[c] || 'hàng ' + c;

/* ================================================================== */
/*  Bước nhỏ: + − ×                                                    */
/* ================================================================== */
// Mỗi bước nhỏ: {kind, col, digit?, carry?, changes?, text, say, group, ...số liệu phụ}
//  kind: 'digit' (viết chữ số kết quả ở cột col) · 'carry' (viết số nhớ/nhóm lại nhỏ phía trên cột col)
//        'regroup' (trừ: đổi 1 hàng cao thành 10 hàng thấp; changes:[{col,from,to}], gạch số cũ, viết số mới)
//        'lead' (viết chữ số đầu của kết quả ở cột mới) · 'skip' (số 0 ở đầu, không viết)
//  group: cột đang tính (0 = đơn vị) — dùng để gộp thành bước giải thích.

export function vcalcMicro(op, a, b) {
  op = normOp(op);
  if (op === '÷') throw new RangeError('Phép chia dùng vdivSteps');
  a = toInt(a, 9999, 'Số thứ nhất');
  b = toInt(b, 9999, 'Số thứ hai');
  if (op === '+') return microAdd(a, b);
  if (op === '−') return microSub(a, b);
  if (b > 9) throw new RangeError('Phép nhân dọc: số nhân phải có 1 chữ số (dùng partialMulSteps cho nhiều chữ số)');
  return microMul(a, b);
}

function microAdd(a, b) {
  const A = dr(a), B = dr(b), n = Math.max(A.length, B.length), out = [];
  let carry = 0;
  for (let c = 0; c < n; c++) {
    const da = c < A.length ? A[c] : null, db = c < B.length ? B[c] : null;
    const cin = carry;
    const sum = (da || 0) + (db || 0) + cin;
    const dg = sum % 10, co = sum >= 10 ? 1 : 0, last = c === n - 1;
    let t;
    if (da !== null && db !== null) {
      t = cin ? `Hàng ${nm(c)}: ${da} + ${db} = ${da + db}, thêm ${cin} ${nm(c)} vừa nhóm lại là ${sum}.` : `Hàng ${nm(c)}: ${da} + ${db} = ${sum}.`;
    } else if (cin) {
      t = `Hàng ${nm(c)}: ${da === null ? db : da} + ${cin} = ${sum}.`;
    } else {
      t = `Hàng ${nm(c)}: hạ ${da === null ? db : da} xuống.`;
    }
    if (co) t += ` ${sum} ${nm(c)} = 1 ${nm(c + 1)} + ${dg} ${nm(c)}. Viết ${dg}${last ? '' : ', nhóm lại 1 ' + nm(c + 1)}.`;
    else if (da !== null && db !== null || cin) t += ` Viết ${dg}.`;
    out.push({ kind: 'digit', col: c, digit: dg, carry: co, da, db, cin, sum, text: t, say: t, group: c });
    if (co) {
      if (!last) {
        const u = `Viết 1 nhỏ phía trên hàng ${nm(c + 1)}.`;
        out.push({ kind: 'carry', col: c + 1, digit: 1, text: u, say: u, group: c });
      } else {
        const u = `Còn 1 ${nm(c + 1)}: viết 1 ở hàng ${nm(c + 1)}.`;
        out.push({ kind: 'lead', col: c + 1, digit: 1, text: u, say: u, group: c });
      }
    }
    carry = co;
  }
  return out;
}

function microSub(a, b) {
  if (a < b) throw new RangeError('Phép trừ dọc cần số bị trừ ≥ số trừ: ' + a + ' − ' + b);
  const A = dr(a), B = dr(b), n = A.length, out = [];
  const cur = A.slice(), lent = new Array(n).fill(false);
  const resLen = String(a - b).length;
  for (let c = 0; c < n; c++) {
    const db = c < B.length ? B[c] : null, bb = db || 0;
    let regrouped = false;
    if (cur[c] < bb) {
      let j = c + 1;
      while (cur[j] === 0) j++;
      const changes = [];
      changes.push({ col: j, from: cur[j], to: cur[j] - 1 });
      cur[j] -= 1; lent[j] = true;
      for (let k = j - 1; k > c; k--) { changes.push({ col: k, from: 0, to: 9 }); cur[k] = 9; lent[k] = true; }
      const from = cur[c];
      cur[c] += 10;
      changes.push({ col: c, from, to: cur[c] });
      const segs = [];
      for (let k = j; k > c; k--) segs.push(`1 ${nm(k)} thành 10 ${nm(k - 1)}`);
      let t = `Hàng ${nm(c)}: ${from} không đủ trừ ${bb}. `;
      if (j === c + 1) t += `Con đổi ${segs[0]}. `;
      else t += `Hàng ${nm(c + 1)} là 0, nên con đổi dần: ${segs.join(', rồi ')}. `;
      t += `Hàng ${nm(c)} có 10 + ${from} = ${cur[c]}.`;
      out.push({ kind: 'regroup', col: c, changes, top: cur[c], text: t, say: t, group: c });
      regrouped = true;
    }
    const top = cur[c], d = top - bb;
    if (c >= resLen) {
      const t = `Hàng ${nm(c)}: ${top} − ${bb} = 0. Số 0 ở đầu không cần viết.`;
      out.push({ kind: 'skip', col: c, digit: 0, top, bot: bb, text: t, say: t, group: c });
      continue;
    }
    let t;
    if (db === null) {
      t = lent[c] ? `Hàng ${nm(c)} còn ${top}, hạ xuống: viết ${top}.` : `Hàng ${nm(c)}: hạ ${top} xuống.`;
    } else if (lent[c] && !regrouped) {
      t = `Hàng ${nm(c)} còn ${top}: ${top} − ${bb} = ${d}. Viết ${d}.`;
    } else {
      t = `Hàng ${nm(c)}: ${top} − ${bb} = ${d}. Viết ${d}.`;
    }
    out.push({ kind: 'digit', col: c, digit: d, top, bot: bb, orig: A[c], lent: lent[c], regrouped, text: t, say: t, group: c });
  }
  return out;
}

function microMul(a, b) {
  const A = dr(a), n = A.length, out = [];
  const resLen = String(a * b).length;
  let carry = 0;
  for (let c = 0; c < n; c++) {
    const cin = carry, p = A[c] * b, prod = p + cin;
    const dg = prod % 10, co = Math.floor(prod / 10), last = c === n - 1;
    if (c >= resLen) {
      const t = `Hàng ${nm(c)}: ${A[c]} × ${b} = 0. Số 0 ở đầu không cần viết.`;
      out.push({ kind: 'skip', col: c, digit: 0, text: t, say: t, group: c });
      continue;
    }
    let t = cin ? `Hàng ${nm(c)}: ${A[c]} × ${b} = ${p}, thêm ${cin} vừa nhớ là ${prod}.` : `Hàng ${nm(c)}: ${A[c]} × ${b} = ${prod}.`;
    if (co) t += ` ${prod} ${nm(c)} = ${co} ${nm(c + 1)} + ${dg} ${nm(c)}. Viết ${dg}, nhớ ${co}.`;
    else t += ` Viết ${dg}.`;
    out.push({ kind: 'digit', col: c, digit: dg, carry: co, da: A[c], b, cin, prod, text: t, say: t, group: c });
    if (co) {
      if (!last) {
        const u = `Viết ${co} nhỏ phía trên hàng ${nm(c + 1)}.`;
        out.push({ kind: 'carry', col: c + 1, digit: co, text: u, say: u, group: c });
      } else {
        const u = `Còn ${co} ${nm(c + 1)}: viết ${co} ở hàng ${nm(c + 1)}.`;
        out.push({ kind: 'lead', col: c + 1, digit: co, text: u, say: u, group: c });
      }
    }
    carry = co;
  }
  return out;
}

export function vcalcResult(op, a, b) {
  op = normOp(op);
  return op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : Math.floor(a / b);
}

/* ================================================================== */
/*  Các bước giải thích                                                */
/* ================================================================== */
function groupMicro(micro) {
  const groups = [];
  let cum = 0;
  for (const m of micro) {
    let g = groups[groups.length - 1];
    if (!g || g.group !== m.group) { g = { group: m.group, items: [], upto: 0, from: cum }; groups.push(g); }
    g.items.push(m); cum++; g.upto = cum;
  }
  return groups;
}
function mergeGroups(groups, maxBody) {
  const gs = groups.map((g) => ({ group: g.group, items: g.items.slice(), upto: g.upto, from: g.from }));
  while (gs.length > maxBody && gs.length > 1) {
    const y = gs.pop(), x = gs.pop();
    gs.push({ group: y.group, items: x.items.concat(y.items), upto: y.upto, from: x.from });
  }
  return gs;
}

/**
 * Các bước giải thích đặt tính dọc (+ − ×).
 * opts: {maxSteps=6, check=false, anim='write', setup=true}
 * → [{text, say, visual:{kind:'vcalc', op, a, b, upto:k, anim}}]; bước cuối có visual.done=true.
 */
export function vcalcSteps(op, a, b, opts) {
  opts = opts || {};
  op = normOp(op);
  const micro = vcalcMicro(op, a, b);
  const res = vcalcResult(op, a, b);
  const anim = opts.anim === undefined ? 'write' : opts.anim;
  const vis = (upto, extra) => Object.assign({ kind: 'vcalc', op, a, b, upto }, anim ? { anim } : {}, extra || {});
  const steps = [];
  const maxSteps = opts.maxSteps || 6;
  if (opts.setup !== false) {
    const t = op === '×'
      ? `Đặt tính: viết ${fmt(a)}, rồi viết ${b} ngay dưới hàng đơn vị. Kẻ vạch ngang. Con làm từ phải sang trái.`
      : `Đặt tính: viết ${fmt(a)}, rồi viết ${fmt(b)} ngay dưới, các chữ số cùng hàng thẳng cột. Kẻ vạch ngang. Con làm từ phải sang trái.`;
    steps.push({ text: t, say: t, visual: vis(0, { from: 0 }) });
  }
  const groups = mergeGroups(groupMicro(micro), maxSteps - (opts.setup !== false ? 1 : 0) - 1);
  for (const g of groups) {
    const t = g.items.map((m) => m.text).join(' ');
    steps.push({ text: t, say: g.items.map((m) => m.say).join(' '), visual: vis(g.upto, { from: g.from }) });
  }
  let fin = `Đọc kết quả: ${fmt(res)}. Vậy ${fmt(a)} ${op} ${fmt(b)} = ${fmt(res)}.`;
  if (opts.check) {
    if (op === '+') fin += ` Thử lại: ${fmt(res)} − ${fmt(b)} = ${fmt(a)}.`;
    else if (op === '−') fin += ` Thử lại: ${fmt(res)} + ${fmt(b)} = ${fmt(a)}.`;
    else fin += ` Thử lại: ${fmt(res)} ÷ ${b} = ${fmt(a)}.`;
  }
  steps.push({ text: fin, say: fin, visual: vis(micro.length, { done: true, from: 0 }) });
  return steps;
}

/* ================================================================== */
/*  Chia ngắn                                                          */
/* ================================================================== */
// Bước nhỏ chia ngắn. i = chỉ số chữ số từ TRÁI. kind:
//  'join'  chữ số đầu nhỏ hơn số chia → ghép với chữ số kế (không viết thương)
//  'quot'  viết chữ số thương phía trên chữ số i
//  'carry' viết số dư nhỏ trước chữ số i+1 (col = i+1 ở dạng chỉ số từ trái)
//  'rem'   viết "dư r" ở cuối (chỉ khi còn dư)
export function vdivMicro(a, b) {
  a = toInt(a, 9999, 'Số bị chia');
  b = toInt(b, 9, 'Số chia');
  if (b < 1) throw new RangeError('Số chia phải ≥ 1');
  const D = String(a).split('').map(Number), n = D.length, out = [];
  let rem = 0, started = false;
  for (let i = 0; i < n; i++) {
    const d = D[i], c = n - 1 - i, cur = rem * 10 + d;
    if (!started && cur < b && i < n - 1) {
      const t = `${d} ${nm(c)} chưa chia được cho ${b}, vì ${d} < ${b}.`;
      out.push({ kind: 'join', i, digit: d, cur, text: t, say: t, group: i + 1 });
      rem = cur;
      continue;
    }
    started = true;
    const q = Math.floor(cur / b), r = cur % b;
    let t = '';
    if (rem > 0) t += `Ghép ${rem} ${nm(c + 1)} với ${d} ${nm(c)} được ${cur} ${nm(c)}. `;
    else if (i === 0 && n > 1) t += `Chia hàng ${nm(c)} trước. `;
    t += `${cur} ${nm(c)} ÷ ${b} = ${q}${r ? `, dư ${r}` : (i < n - 1 ? ', không dư' : '')}. Viết ${q} lên trên chữ số ${d}.`;
    out.push({ kind: 'quot', i, digit: q, cur, q, r, text: t, say: t, group: i === 0 ? 0 : i });
    if (i < n - 1) {
      if (r > 0) {
        const nx = D[i + 1];
        const u = `Dư ${r} ${nm(c)}: viết ${r} nhỏ trước chữ số ${nx}, ghép thành ${r * 10 + nx}.`;
        out.push({ kind: 'carry', i: i + 1, digit: r, r, text: u, say: u, group: i === 0 ? 0 : i });
      }
    } else if (r > 0) {
      const u = `Còn dư ${r}. Con viết: dư ${r}.`;
      out.push({ kind: 'rem', i, digit: r, r, text: u, say: u, group: i });
    }
    rem = r;
  }
  return out;
}

/** Các bước chia ngắn (a ≤ 999 khuyến nghị, b 1 chữ số). visual:{kind:'vdiv', a, b, upto:k} */
export function vdivSteps(a, b, opts) {
  opts = opts || {};
  const micro = vdivMicro(a, b);
  const q = Math.floor(a / b), r = a % b;
  const anim = opts.anim === undefined ? 'write' : opts.anim;
  const vis = (upto, extra) => Object.assign({ kind: 'vdiv', a, b, upto }, anim ? { anim } : {}, extra || {});
  const steps = [];
  const t0 = `Đặt tính chia ngắn: viết ${b} bên trái, ${fmt(a)} bên phải. Thương viết phía trên. Con chia từ hàng cao nhất.`;
  steps.push({ text: t0, say: t0, visual: vis(0, { from: 0 }) });
  const groups = mergeGroups(groupMicro(micro), (opts.maxSteps || 6) - 2);
  for (const g of groups) {
    steps.push({ text: g.items.map((m) => m.text).join(' '), say: g.items.map((m) => m.say).join(' '), visual: vis(g.upto, { from: g.from }) });
  }
  const fin = `Đọc thương từ trái sang phải: ${q}${r ? `, dư ${r}` : ''}. Vậy ${fmt(a)} ÷ ${b} = ${q}${r ? ` dư ${r}` : ''}. Thử lại: ${q} × ${b}${r ? ` + ${r}` : ''} = ${fmt(a)}.`;
  steps.push({ text: fin, say: fin, visual: vis(micro.length, { done: true, from: 0 }) });
  return steps;
}

/* ================================================================== */
/*  Tách theo hàng rồi nhân từng phần (workout)                        */
/* ================================================================== */
function splitParts(n) {
  const D = dr(n), parts = [];
  for (let c = D.length - 1; c >= 0; c--) if (D[c] !== 0) parts.push(D[c] * Math.pow(10, c));
  return parts.length ? parts : [0];
}
const wv = (lines, upto, from, extra) => Object.assign({ kind: 'workout', lines, upto, from, anim: 'write' }, extra || {});

/** Tách a theo hàng, nhân từng phần với b (1 chữ số), cộng lại. */
export function partialMulSteps(a, b) {
  a = toInt(a, 9999, 'Số bị nhân');
  b = toInt(b, 9, 'Số nhân');
  const parts = splitParts(a), total = a * b;
  const prods = parts.map((p) => p * b);
  const lines = [
    { text: `${fmt(a)} × ${b}`, note: 'đề bài' },
    { text: `= (${parts.join(' + ')}) × ${b}`, note: 'tách theo hàng' },
  ];
  prods.forEach((x, i) => lines.push({ text: `${fmt(parts[i])} × ${b} = ${fmt(x)}`, note: i === 0 ? 'nhân từng phần' : '' }));
  const sumLines = [];
  if (prods.length > 1) {
    let acc = prods[0];
    for (let i = 1; i < prods.length; i++) {
      const s = acc + prods[i];
      sumLines.push({ text: `${fmt(acc)} + ${fmt(prods[i])} = ${fmt(s)}`, note: i === 1 ? 'cộng lại' : '' });
      acc = s;
    }
  }
  lines.push(...sumLines);
  lines.push({ text: `${fmt(a)} × ${b} = ${fmt(total)}`, note: 'kết quả', color: '#4B34A8' });
  const n1 = 2, n2 = n1 + parts.length, n3 = n2 + sumLines.length, n4 = lines.length;
  const t1 = `Con tách ${fmt(a)} theo hàng: ${fmt(a)} = ${parts.map(fmt).join(' + ')}.`;
  const t2 = `Nhân từng phần với ${b}: ${parts.map((p, i) => `${fmt(p)} × ${b} = ${fmt(prods[i])}`).join('; ')}.`;
  const steps = [
    { text: t1, say: t1, visual: wv(lines, n1, 0) },
    { text: t2, say: t2, visual: wv(lines, n2, n1) },
  ];
  if (sumLines.length) {
    const t3 = `Cộng các phần lại: ${sumLines.map((l) => l.text).join('; ')}.`;
    steps.push({ text: t3, say: t3, visual: wv(lines, n3, n2) });
  }
  const t4 = `Vậy ${fmt(a)} × ${b} = ${fmt(total)}.`;
  steps.push({ text: t4, say: t4, visual: wv(lines, n4, n3, { done: true }) });
  return steps;
}

/* ================================================================== */
/*  Ước lượng                                                          */
/* ================================================================== */
/** Làm tròn: ≥1000 → nghìn, ≥100 → trăm, ≥10 → chục, còn lại giữ nguyên. Trả {v, place, name}. */
export function roundTo(n) {
  const place = n >= 1000 ? 1000 : n >= 100 ? 100 : n >= 10 ? 10 : 1;
  const v = place === 1 ? n : Math.floor((n + place / 2) / place) * place;
  const name = place === 1000 ? 'nghìn' : place === 100 ? 'trăm' : place === 10 ? 'chục' : 'đơn vị';
  return { v, place, name };
}

/** Ước lượng → tính chính xác → so sánh. op ∈ + − × ÷ . visual:{kind:'workout', lines, upto} */
export function estimateSteps(op, a, b) {
  op = normOp(op);
  a = toInt(a, 9999, 'Số thứ nhất');
  b = toInt(b, op === '÷' ? 9 : 9999, 'Số thứ hai');
  if (op === '÷') return estimateDiv(a, b);
  if (op === '−' && a < b) throw new RangeError('Cần a ≥ b');
  const ra = roundTo(a), rb = roundTo(b);
  const est = op === '+' ? ra.v + rb.v : op === '−' ? ra.v - rb.v : ra.v * rb.v;
  const exact = vcalcResult(op, a, b);
  const rounding = [];
  if (ra.v !== a) rounding.push({ text: `${fmt(a)} ≈ ${fmt(ra.v)}`, note: `làm tròn đến hàng ${ra.name}` });
  if (rb.v !== b && op !== '×') rounding.push({ text: `${fmt(b)} ≈ ${fmt(rb.v)}`, note: `làm tròn đến hàng ${rb.name}` });
  const useB = op === '×' ? b : rb.v;
  const diff = Math.abs(exact - est);
  const near = diff <= Math.max(est, 1) * 0.3;
  const rel = exact === est ? 'bằng' : exact > est ? 'lớn hơn' : 'nhỏ hơn';
  const lines = [{ text: `${fmt(a)} ${op} ${fmt(b)}`, note: 'đề bài' }];
  lines.push(...rounding);
  lines.push({ text: `${fmt(ra.v)} ${op} ${fmt(useB)} = ${fmt(est)}`, note: 'ước lượng' });
  lines.push({ text: `${fmt(a)} ${op} ${fmt(b)} = ${fmt(exact)}`, note: 'tính chính xác' });
  lines.push({ text: `${fmt(exact)} ≈ ${fmt(est)}`, note: near ? 'gần ước lượng, hợp lý' : 'lệch nhiều, con tính lại', color: '#4B34A8' });
  const k0 = 1, k1 = 1 + rounding.length, k2 = k1 + 1, k3 = k2 + 1, k4 = k3 + 1;
  const steps = [];
  if (rounding.length) {
    const t = `Con làm tròn trước: ${rounding.map((l) => l.text).join('; ')}.`;
    steps.push({ text: t, say: t, visual: wv(lines, k1, 0) });
  }
  const te = `Ước lượng: ${fmt(ra.v)} ${op} ${fmt(useB)} = ${fmt(est)}. Kết quả sẽ gần ${fmt(est)}.`;
  steps.push({ text: te, say: te, visual: wv(lines, k2, rounding.length ? k1 : 0) });
  const tc = `Tính chính xác: ${fmt(a)} ${op} ${fmt(b)} = ${fmt(exact)}.`;
  steps.push({ text: tc, say: tc, visual: wv(lines, k3, k2) });
  const tk = near
    ? `So sánh: ${fmt(exact)} ${rel === 'bằng' ? 'bằng' : rel + ' một chút so với'} ${fmt(est)}. Kết quả hợp lý.`
    : `So sánh: ${fmt(exact)} khác ${fmt(est)} nhiều. Con thử tính lại nhé.`;
  steps.push({ text: tk, say: tk, visual: wv(lines, k4, k3, { done: true }) });
  void k0;
  return steps;
}

function cmpDiv(a, b, q) {
  if (a < 10 * b) return `${q} < 10`;
  const k = (Math.floor(a / (10 * b)) * 10 * b) / b;
  return a === k * b ? `${q} = ${k}` : `${q} > ${k}`;
}

function estimateDiv(a, b) {
  if (b < 1) throw new RangeError('Số chia phải ≥ 1');
  const q = Math.floor(a / b), r = a % b;
  const lines = [{ text: `${fmt(a)} ÷ ${b}`, note: 'đề bài' }];
  let te;
  if (a >= 10 * b) {
    const m = Math.floor(a / (10 * b)) * 10 * b, k = m / b;
    lines.push({ text: `${fmt(m)} ÷ ${b} = ${fmt(k)}`, note: 'số tròn chục gần nhất' });
    lines.push({ text: a === m ? `${fmt(a)} ÷ ${b} = ${fmt(k)}` : `${fmt(a)} ÷ ${b} > ${fmt(k)}`, note: 'ước lượng' });
    te = a === m ? `Ước lượng: ${fmt(m)} ÷ ${b} = ${fmt(k)}. Vì ${fmt(a)} = ${fmt(m)} nên kết quả là ${fmt(k)}.` : `Ước lượng: ${fmt(m)} ÷ ${b} = ${fmt(k)}. Vì ${fmt(a)} > ${fmt(m)} nên ${fmt(a)} ÷ ${b} > ${fmt(k)}.`;
  } else {
    lines.push({ text: `10 × ${b} = ${10 * b}`, note: 'số tròn chục' });
    lines.push({ text: `${fmt(a)} < ${10 * b}, nên < 10`, note: 'ước lượng' });
    te = `Ước lượng: 10 × ${b} = ${10 * b}. Vì ${fmt(a)} < ${10 * b} nên ${fmt(a)} ÷ ${b} < 10.`;
  }
  lines.push({ text: `${fmt(a)} ÷ ${b} = ${q}${r ? ` dư ${r}` : ''}`, note: 'tính chính xác' });
  const cmpTxt = cmpDiv(a, b, q);
  lines.push({ text: cmpTxt, note: 'khớp ước lượng', color: '#4B34A8' });
  const tc = `Tính chính xác: ${fmt(a)} ÷ ${b} = ${q}${r ? ` dư ${r}` : ''}.`;
  const tk = `So sánh: ${cmpTxt}. Kết quả khớp với ước lượng.`;
  return [
    { text: te, say: te, visual: wv(lines, 3, 0) },
    { text: tc, say: tc, visual: wv(lines, 4, 3) },
    { text: tk, say: tk, visual: wv(lines, 5, 4, { done: true }) },
  ];
}

/* ================================================================== */
/*  Giải thích lỗi theo cột (bài 'column')                             */
/* ================================================================== */
/**
 * Phân tích đáp án bé nhập cho bài đặt tính dọc.
 * entered: chuỗi chữ số kết quả (căn phải theo hàng; ÷: các chữ số thương từ trái sang phải).
 * → {ok, col, name, expected, got, code, why}. Đúng → {ok:true, why:''}.
 */
export function columnWhyInfo(op, a, b, entered) {
  op = normOp(op);
  const ent = String(entered == null ? '' : entered).replace(/[^0-9]/g, '');
  if (op === '÷') return divWhy(a, b, ent);
  const res = String(vcalcResult(op, toInt(a, 9999), toInt(b, 9999)));
  if (ent === res) return { ok: true, col: -1, name: '', expected: '', got: '', code: '', why: '' };
  const micro = vcalcMicro(op, a, b);
  const digitAt = (c) => micro.find((m) => (m.kind === 'digit' || m.kind === 'lead') && m.col === c);
  const total = Math.max(res.length, ent.length);
  for (let c = 0; c < total; c++) {
    const e = c < res.length ? res[res.length - 1 - c] : null;
    const g = c < ent.length ? ent[ent.length - 1 - c] : null;
    if (e === g) continue;
    const base = { ok: false, col: c, name: nm(c), expected: e, got: g };
    if (e === null) return Object.assign(base, { code: 'HÀNG', why: `Kết quả chỉ có ${res.length} chữ số. Hàng ${nm(c)} không cần viết thêm số.` });
    const m = digitAt(c);
    const ge = Number(g), ee = Number(e);
    if (g === null) {
      const why = m ? `Con còn thiếu chữ số ở hàng ${nm(c)}. ${m.say}` : `Con còn thiếu chữ số ở hàng ${nm(c)}.`;
      return Object.assign(base, { code: 'HÀNG', why });
    }
    let code = 'ĐẾM', why;
    if (!m) why = `Hàng ${nm(c)} phải viết ${e}.`;
    else if (op === '+') {
      if (m.kind === 'lead') { code = 'NHỚ'; why = `Hàng ${nm(c)}: còn 1 ${nm(c)} được nhóm lại từ hàng ${nm(c - 1)}, nên viết 1.`; }
      else if (m.cin === 1 && ge === (m.sum + 9) % 10) { code = 'NHỚ'; why = `Con quên cộng thêm 1 ${nm(c)} vừa nhóm lại từ hàng ${nm(c - 1)}. ${m.say}`; }
      else if (m.cin === 0 && ge === (m.sum + 1) % 10 && c > 0) { code = 'NHỚ'; why = `Hàng ${nm(c - 1)} không nhóm lại, nên không cộng thêm 1. ${m.say}`; }
      else if (m.sum >= 10 && ge === Math.floor(m.sum / 10)) { code = 'NHỚ'; why = `Con viết số chục thay vì số đơn vị. ${m.say}`; }
      else why = `Con tính lại nhé. ${m.say}`;
    } else if (op === '−') {
      if (m.lent && ge === (ee + 1) % 10) { code = 'NHỚ'; why = `Hàng ${nm(c)} lúc đầu là ${m.orig}, nhưng đã đổi 1 cho hàng bên phải nên chỉ còn ${m.orig - 1}. Con nhớ trừ phần đã đổi. ${m.say}`; }
      else if (m.orig < m.bot && ge === m.bot - m.orig) { code = 'NGƯỢC'; why = `${m.orig} không đủ trừ ${m.bot}, con không lấy ${m.bot} − ${m.orig}. Phải đổi 1 ${nm(c + 1)} thành 10 ${nm(c)}. ${m.say}`; }
      else if (m.regrouped && ge === (ee + 9) % 10) { code = 'NHỚ'; why = `Sau khi đổi, hàng ${nm(c)} có ${m.top}, không phải ${m.orig}. ${m.say}`; }
      else why = `Con tính lại nhé. ${m.say}`;
    } else {
      if (m.kind === 'lead') { code = 'NHỚ'; why = `Hàng ${nm(c)}: số nhớ ${m.digit} được viết xuống, nên viết ${m.digit}.`; }
      else if (m.cin > 0 && ge === (m.da * m.b) % 10) { code = 'NHỚ'; why = `Con quên cộng thêm ${m.cin} đã nhớ. ${m.say}`; }
      else if (m.carry > 0 && ge === m.carry) { code = 'NHỚ'; why = `Con viết số nhớ thay vì chữ số hàng ${nm(c)}. ${m.say}`; }
      else why = `Con tính lại nhé. ${m.say}`;
    }
    return Object.assign(base, { code, why });
  }
  return { ok: false, col: 0, name: nm(0), expected: res, got: ent, code: 'ĐẾM', why: `Kết quả đúng là ${fmt(res)}.` };
}

function divWhy(a, b, ent) {
  a = toInt(a, 9999, 'Số bị chia'); b = toInt(b, 9, 'Số chia');
  const q = String(Math.floor(a / b));
  if (ent === q) return { ok: true, col: -1, name: '', expected: '', got: '', code: '', why: '' };
  const micro = vdivMicro(a, b).filter((m) => m.kind === 'quot');
  const D = String(a).length;
  const first = D - q.length; // chỉ số chữ số của a ứng với chữ số thương đầu tiên
  for (let k = 0; k < Math.max(q.length, ent.length); k++) {
    const e = k < q.length ? q[k] : null, g = k < ent.length ? ent[k] : null;
    if (e === g) continue;
    const m = micro.find((x) => x.i === first + k);
    const base = { ok: false, col: k, name: m ? nm(D - 1 - m.i) : '', expected: e, got: g };
    if (e === null) return Object.assign(base, { code: 'HÀNG', why: `Thương chỉ có ${q.length} chữ số.` });
    if (g === null) return Object.assign(base, { code: 'HÀNG', why: `Con còn thiếu chữ số thương. ${m ? m.say : ''}` });
    return Object.assign(base, { code: 'ĐẾM', why: m ? `Con chia lại nhé. ${m.say}` : `Chữ số này phải là ${e}.` });
  }
  return { ok: false, col: 0, name: '', expected: q, got: ent, code: 'ĐẾM', why: `Thương đúng là ${q}.` };
}

/** Lời giải thích lỗi theo cột (chuỗi; '' nếu đúng). */
export function columnWhy(op, a, b, entered) {
  return columnWhyInfo(op, a, b, entered).why;
}
