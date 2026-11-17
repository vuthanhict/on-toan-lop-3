// "TẬP ĐẶT TÍNH" — type:'column': bé tự điền từng chữ số kết quả của phép tính đặt dọc trên giấy ô li.
// Item: {type:'column', op:'+'|'−'|'×'|'÷', a, b, answer:'721' (÷: thương), rem?:'3' (÷), prompt, explain, hint?, meta?}
// Điều khiển tương thích makeCtl của ui.js: {el, ready, onReady, submit, markWrong, reveal, lock}.
// Không import ui.js (tránh vòng phụ thuộc): có `h` riêng.
import { icon } from './icons.js';
import { play } from './sfx.js';
import { columnWhyInfo, normOp, NAMES, fmt } from './paper.js';

const el = (tag, attrs, ...kids) => {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style') e.setAttribute('style', v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) { if (c == null || c === false) continue; e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c); }
  return e;
};

const strip0 = (s) => String(s == null ? '' : s).replace(/^0+(?=\d)/, '');
const nameOf = (c) => NAMES[c] || 'hàng ' + c;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const jit = (a, b) => { const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };

/* ------------------------------------------------------------------ */
/*  Phần THUẦN (test được trong Node)                                  */
/* ------------------------------------------------------------------ */

/** Bố cục: + − × → n = số cột chữ số + 1 ô đầu; ÷ → n = số chữ số số bị chia (ô thương). */
export function columnLayout(item) {
  const op = normOp(item.op);
  const A = String(item.a), B = String(item.b), ans = strip0(item.answer);
  if (op === '÷') return { op, n: A.length, cells: A.length, cols: A.length + 3 };
  const D = Math.max(A.length, B.length, ans.length);
  return { op, D, n: D + 1, cells: D + 1, cols: D + 1 };
}

/** vals: ô kết quả TRÁI → PHẢI ('' = trống). Bỏ ô trống/0 ở đầu; báo ô trống lọt giữa. */
function readDigits(vals) {
  const f = vals.findIndex((v) => v !== '' && v !== '0');
  if (f < 0) { const z = vals.lastIndexOf('0'); return { s: z >= 0 ? '0' : '', f: z, gap: -1 }; }
  const tail = vals.slice(f), g = tail.indexOf('');
  return { s: g >= 0 ? '' : tail.join(''), f, gap: g >= 0 ? f + g : -1 };
}

/**
 * Chấm bài. vals: các ô kết quả trái → phải (÷: các ô thương); remVal: ô dư (÷).
 * → {correct, why, code, bad:{k:'res'|'rem', i}|null}   (i = chỉ số ô, trái → phải)
 */
export function gradeColumn(item, vals, remVal) {
  const lay = columnLayout(item), op = lay.op, n = lay.n;
  const ans = strip0(item.answer), a = Number(item.a), b = Number(item.b);
  const bad = (why, code, k, i) => ({ correct: false, why, code, bad: k ? { k, i } : null });
  const rd = readDigits(vals);
  if (rd.gap >= 0) {
    if (op === '÷' && rd.gap === n - 1) return bad(`Chữ số cuối cùng của thương phải viết thẳng trên chữ số ${String(item.a)[n - 1]} (hàng đơn vị) của số bị chia. Con xem lại vị trí các chữ số của thương nhé.`, 'HÀNG', 'res', n - 1);
    if (op === '÷') return bad('Con còn để trống một ô ở giữa các chữ số của thương. Các chữ số của thương viết liền nhau, mỗi chữ số một ô nhé.', 'HÀNG', 'res', rd.gap);
    const c = n - 1 - rd.gap;
    return bad(c === 0 ? 'Con chưa viết chữ số ở hàng đơn vị. Con làm từ phải sang trái, bắt đầu từ hàng đơn vị nhé.' : `Con còn để trống ô ở hàng ${nameOf(c)}. Mỗi hàng cần một chữ số, con viết cho đủ nhé.`, 'HÀNG', 'res', rd.gap);
  }
  if (rd.s === '') return bad('Con chưa viết kết quả. Con điền từng chữ số vào các ô nhé.', 'HÀNG', null);
  let info = null;
  try { info = columnWhyInfo(op, a, b, rd.s); } catch (e) { info = null; }

  if (op !== '÷') {
    if (rd.s === ans) return { correct: true, why: '', code: '', bad: null };
    if (info && !info.ok) return bad(info.why, info.code, 'res', clamp(n - 1 - info.col, 0, n - 1));
    return bad(`Kết quả đúng là ${fmt(ans)}. Con tính lại từng hàng nhé.`, 'ĐẾM', 'res', n - 1);
  }
  // ÷ : thương (trái → phải) + số dư
  const e = n - ans.length;
  if (rd.s !== ans) {
    if (info && !info.ok) return bad(info.why, info.code, 'res', clamp(rd.f + info.col, 0, n - 1));
    return bad(`Thương đúng là ${ans}. Con chia lại từng bước nhé.`, 'ĐẾM', 'res', clamp(rd.f, 0, n - 1));
  }
  if (rd.f !== e) {
    const A = String(item.a);
    let why = `Chữ số đầu tiên của thương phải viết thẳng trên chữ số ${A[e]} (hàng ${nameOf(n - 1 - e)}) của số bị chia.`;
    if (e > 0) why += ` ${A.slice(0, e)} chưa chia được cho ${b}, nên con ghép ${A.slice(0, e + 1)} rồi mới chia.`;
    return bad(why, 'HÀNG', 'res', clamp(rd.f, 0, n - 1));
  }
  const want = Number(item.rem == null ? 0 : item.rem), got = remVal === '' || remVal == null ? 0 : Number(remVal);
  if (want !== got) {
    const q = Number(ans), prod = q * b;
    if (want > 0 && got === 0) return bad(`Thương con làm đúng rồi! Còn thiếu số dư: ${b} × ${q} = ${prod}, ${fmt(a)} − ${prod} = ${want}. Con viết dư ${want} nhé.`, 'ĐV', 'rem', 0);
    if (want === 0) return bad(`Phép chia này chia hết (${q} × ${b} = ${fmt(a)}), nên số dư là 0.`, 'QUY', 'rem', 0);
    if (got >= b) return bad(`Số dư phải bé hơn số chia ${b}. ${fmt(a)} − ${prod} = ${want}, nên dư ${want}.`, 'QUY', 'rem', 0);
    return bad(`Số dư là ${fmt(a)} − ${prod} = ${want}. Con tính lại nhé.`, 'ĐẾM', 'rem', 0);
  }
  return { correct: true, why: '', code: '', bad: null };
}

/* ------------------------------------------------------------------ */
/*  Giao diện                                                          */
/* ------------------------------------------------------------------ */
export function viewColumn(item) {
  const lay = columnLayout(item), op = lay.op, isDiv = op === '÷';
  const n = lay.n;
  const A = String(item.a), B = String(item.b);
  const ans = strip0(item.answer);
  const wantRem = String(item.rem == null ? 0 : item.rem);

  // ---- ô nhập ----
  const fields = []; // {k:'res'|'rem'|'note', i, val, ghost, bad, shown, el, vEl}
  const mk = (k, i, label) => { const f = { k, i, val: '', ghost: '', bad: false, label }; fields.push(f); return f; };
  const results = [];
  for (let i = 0; i < n; i++) {
    const c = n - 1 - i;
    results.push(mk('res', i, isDiv
      ? `Ô thương thứ ${i + 1}, ở phía trên chữ số ${A[i]} của số bị chia`
      : `Ô kết quả hàng ${nameOf(c)}`));
  }
  const remField = isDiv ? mk('rem', 0, 'Ô số dư') : null;
  const notes = [];
  if (!isDiv) for (let i = 1; i < n; i++) notes.push(mk('note', i, `Ô ghi nhớ phía trên hàng ${nameOf(n - 1 - i)} (không chấm điểm)`));
  // thứ tự điền: + − × từ PHẢI sang TRÁI; ÷ từ TRÁI sang PHẢI rồi tới ô dư
  const order = isDiv ? [...results, remField] : results.slice().reverse();

  let active = order[0], locked = false, lastRes = null;
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- dựng lưới ----
  const grid = el('div', { class: 'col-grid ' + (isDiv ? 'div' : 'add') });
  const place = (node, row, col, span) => { node.style.gridRow = String(row); node.style.gridColumn = span ? col + ' / span ' + span : String(col); return node; };
  const stat = (txt, row, col, cls, seed) => place(el('div', { class: 'col-s ' + (cls || ''), 'aria-hidden': 'true', style: `--rot:${(jit(seed, txt.charCodeAt(0)) * 1.6).toFixed(2)}deg` }, txt), row, col);
  const cellBtn = (f, row, col, cls) => {
    const b = el('button', { class: cls, type: 'button' }, el('span', { class: 'col-ghost' }), el('span', { class: 'col-val' }));
    b.addEventListener('click', () => { if (locked) return; active = f; paint(); });
    f.el = b; f.vEl = b.querySelector('.col-val'); f.gEl = b.querySelector('.col-ghost');
    return place(b, row, col);
  };

  if (!isDiv) {
    notes.forEach((f) => grid.appendChild(cellBtn(f, 1, f.i + 1, 'col-note')));
    for (let c = 0; c < A.length; c++) grid.appendChild(stat(A[A.length - 1 - c], 2, n - c, '', c + 1));
    grid.appendChild(stat(op, 3, 1, 'col-op', 7));
    for (let c = 0; c < B.length; c++) grid.appendChild(stat(B[B.length - 1 - c], 3, n - c, '', c + 11));
    grid.appendChild(place(el('div', { class: 'col-rule', 'aria-hidden': 'true' }), 3, 1, n));
    results.forEach((f) => grid.appendChild(cellBtn(f, 4, f.i + 1, 'col-in')));
  } else {
    results.forEach((f) => grid.appendChild(cellBtn(f, 1, f.i + 2, 'col-in')));
    grid.appendChild(place(el('div', { class: 'col-du', 'aria-hidden': 'true' }, 'dư'), 1, n + 2));
    grid.appendChild(cellBtn(remField, 1, n + 3, 'col-in col-rem'));
    grid.appendChild(stat(B, 2, 1, 'col-div', 3));
    for (let i = 0; i < n; i++) grid.appendChild(stat(A[i], 2, i + 2, '', i + 1));
    grid.appendChild(place(el('div', { class: 'col-bus', 'aria-hidden': 'true' }), 2, 2, n));
  }

  const paperLabel = isDiv
    ? `Chia ngắn ${fmt(item.a)} chia ${B}. Điền các chữ số của thương từ trái sang phải, rồi điền số dư.`
    : `Đặt tính dọc: ${fmt(item.a)} ${op === '+' ? 'cộng' : op === '−' ? 'trừ' : 'nhân'} ${fmt(item.b)}. Điền kết quả từng chữ số, từ hàng đơn vị sang trái.`;
  const paper = el('div', { class: 'col-paper', role: 'group', 'aria-label': paperLabel, style: `--n:${lay.cols}` }, grid);
  const cap = el('p', { class: 'col-cap' }, isDiv
    ? 'Con viết thương từ trái sang phải, thẳng trên chữ số đã chia. Ô cuối là số dư (không dư thì viết 0).'
    : 'Con viết kết quả từ phải sang trái, bắt đầu từ hàng đơn vị. Hàng ô nhỏ phía trên để con ghi nhớ.');

  // ---- bàn phím số (dùng lại .np-dock) ----
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
  const pad = el('div', { class: 'numpad' }, keys.map((k) => k
    ? el('button', { class: 'key' + (k === '⌫' ? ' key-del' : ''), type: 'button', 'aria-label': k === '⌫' ? 'Xoá' : k, onclick: () => press(k) }, k === '⌫' ? icon('backspace', 28) : k)
    : el('span', { class: 'key-empty' })));
  const dock = el('div', { class: 'np-dock' }, pad);
  const root = el('div', { class: 'item-body col-root' }, paper, cap, dock);

  // ---- trạng thái ----
  const mainFields = () => (isDiv ? [...results, remField] : results);
  function paint() {
    fields.forEach((f) => {
      const b = f.el; if (!b) return;
      const on = f === active && !locked;
      b.classList.toggle('active', on);
      b.classList.toggle('filled', !!f.val);
      b.classList.toggle('bad', !!f.bad);
      b.classList.toggle('shown', !!f.shown);
      f.vEl.textContent = f.val;
      f.gEl.textContent = f.bad && f.ghost && !f.val ? f.ghost : '';
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      b.setAttribute('aria-label', f.label + (f.val ? ', đã viết ' + f.val : ', đang trống') + (f.bad ? ', con xem lại ô này nhé' : ''));
    });
  }
  function anim(f, cls) {
    if (reduced || !f.el) return;
    const t = cls === 'w' ? f.vEl : f.el, name = cls === 'w' ? 'w' : 'pop';
    t.classList.remove(name); void t.offsetWidth; t.classList.add(name);
  }
  function step(dir) { // dir=+1: ô kế theo thứ tự điền; -1: quay lại
    const i = order.indexOf(active);
    return order[clamp(i + dir, 0, order.length - 1)];
  }
  function press(k) {
    if (locked || !active) return;
    play('tap');
    const f = active;
    if (k === '⌫') {
      if (f.val) { f.val = ''; f.bad = false; f.ghost = ''; }
      else if (f.k !== 'note') { active = step(-1); active.val = ''; active.bad = false; active.ghost = ''; }
    } else if (f.k === 'note') {
      f.val = f.val.length >= 2 ? k : f.val + k;
      anim(f, 'w');
    } else {
      f.val = k; f.bad = false; f.ghost = ''; f.shown = false;
      anim(f, 'pop'); anim(f, 'w');
      active = step(+1);
    }
    paint(); impl.notify && impl.notify();
  }
  function moveHoriz(dx) { // dx=-1 sang trái trên giấy
    const list = isDiv ? order : order.slice().reverse(); // trái → phải theo hình
    const i = list.indexOf(active);
    if (i < 0) return;
    active = list[clamp(i + dx, 0, list.length - 1)]; paint(); if (active.el) active.el.focus({ preventScroll: true });
  }
  root.addEventListener('keydown', (e) => {
    if (locked || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); press(e.key); }
    else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); press('⌫'); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); moveHoriz(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); moveHoriz(1); }
  });

  const impl = {
    locked: false,
    ready: () => results.some((f) => f.val !== ''),
    submit() {
      const vals = results.map((f) => f.val);
      const g = gradeColumn(item, vals, remField ? remField.val : '');
      lastRes = g;
      return { correct: g.correct, why: g.why, code: g.code, chosen: vals.concat(remField ? [remField.val] : []), bad: g.bad };
    },
    markWrong(res) {
      locked = false; impl.locked = false; dock.classList.remove('locked');
      const bad = res && res.bad;
      const target = bad ? (bad.k === 'rem' ? remField : results[bad.i]) : null;
      const old = target ? target.val : '';
      mainFields().forEach((f) => { f.val = ''; f.bad = false; f.ghost = ''; f.shown = false; });
      if (target) { target.bad = true; target.ghost = old; }
      mainFields().forEach((f) => { if (f.el) { f.el.classList.add('shake'); setTimeout(() => f.el.classList.remove('shake'), 500); } });
      active = order[0]; paint(); impl.notify && impl.notify();
    },
    reveal() {
      if (lastRes && lastRes.correct) {
        const filled = order.filter((f) => f.val !== '' && f.k !== 'rem');
        filled.forEach((f, j) => { if (f.el) { f.el.style.setProperty('--d', (reduced ? 0 : j * 0.09) + 's'); f.el.classList.add('ok'); } });
        if (remField && remField.val !== '' && remField.el) remField.el.classList.add('ok');
      } else {
        // sai: hiện đáp án đúng bằng nét cam
        mainFields().forEach((f) => { f.val = ''; f.bad = false; f.ghost = ''; });
        if (isDiv) { const e = n - ans.length; ans.split('').forEach((d, j) => { results[e + j].val = d; results[e + j].shown = true; }); remField.val = wantRem; remField.shown = true; }
        else ans.split('').forEach((d, j) => { const f = results[n - ans.length + j]; f.val = d; f.shown = true; });
      }
      paint();
    },
    lock() { locked = true; impl.locked = true; dock.classList.add('locked'); paint(); },
  };
  paint();

  let readyCb = () => { };
  const ctl = {
    el: root,
    ready: impl.ready,
    onReady(cb) { readyCb = cb; },
    notify() { readyCb(impl.ready()); },
    submit: impl.submit,
    markWrong: impl.markWrong,
    reveal: impl.reveal,
    lock: impl.lock,
  };
  impl.notify = () => ctl.notify();
  return ctl;
}
