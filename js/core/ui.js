// UI dùng chung + các kiểu tương tác (chọn / chạm / bấm số — không gõ chữ)
import { renderVisual, vctx } from '../visuals/index.js';
import { speak } from './speech.js';
import { icon } from './icons.js';
import { mascotSVG } from './mascot.js';
import { play } from './sfx.js';

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) { if (c == null || c === false) continue; el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c); }
  return el;
}
export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

const LETTERS = 'ABCDEFGH';
const PAL = vctx.palette;
const norm = (s) => String(s == null ? '' : s).replace(/\s+/g, '').replace(/[-–]/g, '−');

export function speakerBtn(getText, cls = '') {
  return h('button', { class: 'btn-icon speaker ' + cls, type: 'button', 'aria-label': 'Nghe đọc', onclick: (e) => { e.stopPropagation(); speak(getText()); } }, icon('speaker', 22));
}

function promptBlock(item) {
  const box = h('div', { class: 'prompt' });
  const lines = String(item.prompt || '').split('\n');
  const txt = h('div', { class: 'prompt-text' }, lines.map((l) => h('p', null, l)));
  box.append(txt, speakerBtn(() => item.say || item.prompt));
  return box;
}

// ===== Điều khiển chung =====
function makeCtl(item, root, impl) {
  let readyCb = () => { };
  const ctl = {
    el: root,
    ready: impl.ready,
    onReady(cb) { readyCb = cb; },
    notify() { readyCb(impl.ready()); },
    submit: impl.submit,
    markWrong: impl.markWrong || (() => { }),
    reveal: impl.reveal || (() => { }),
    lock: impl.lock || (() => { }),
  };
  impl.notify = () => ctl.notify();
  return ctl;
}

// ===== choice / multi =====
function viewChoice(item) {
  const multi = item.type === 'multi';
  const sel = new Set();
  const dead = new Set();
  const list = h('div', { class: 'choices ' + (item.layout === 'list' ? 'list' : (item.choices || []).every((c) => String(c.text).length <= 14 && !c.visual) ? 'grid2' : 'list') });
  const btns = (item.choices || []).map((c, i) => {
    c._id = c.id || String(i);
    const b = h('button', { class: 'choice', type: 'button', 'data-id': c._id, 'aria-pressed': 'false' },
      h('span', { class: 'badge' }, LETTERS[i]),
      h('span', { class: 'ctext' }, c.visual ? renderVisual(c.visual) : null, c.text ? h('span', null, c.text) : null));
    b.addEventListener('click', () => {
      if (b.disabled || impl.locked) return; play('tap');
      if (multi) { if (sel.has(c._id)) sel.delete(c._id); else sel.add(c._id); }
      else { sel.clear(); sel.add(c._id); }
      btns.forEach((x, j) => { const on = sel.has(item.choices[j]._id); x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
      impl.notify();
    });
    list.appendChild(b); return b;
  });
  const root = h('div', { class: 'item-body' }, list);
  const impl = {
    locked: false,
    ready: () => sel.size > 0,
    submit() {
      const chosen = item.choices.filter((c) => sel.has(c._id));
      if (!multi) {
        const c = chosen[0];
        return { correct: !!c.correct, why: c.why || '', code: c.code || '', chosen: [c._id] };
      }
      const need = item.choices.filter((c) => c.correct).map((c) => c._id);
      const ok = need.length === sel.size && need.every((id) => sel.has(id));
      let why = '';
      if (!ok) {
        const bad = chosen.find((c) => !c.correct);
        why = bad ? (bad.why || '') : 'Con còn thiếu một đáp án đúng nữa. Xem lại từng đáp án nhé!';
      }
      return { correct: ok, why, code: '', chosen: [...sel] };
    },
    markWrong(info) {
      impl.locked = false;
      (info.chosen || []).forEach((id) => {
        const i = item.choices.findIndex((c) => c._id === id);
        if (i >= 0 && !item.choices[i].correct) { btns[i].classList.add('wrong'); if (!multi) { btns[i].disabled = true; dead.add(id); } }
      });
      sel.clear(); btns.forEach((x) => { x.classList.remove('on'); if (multi) x.classList.remove('wrong'); });
      impl.notify();
    },
    reveal() {
      item.choices.forEach((c, i) => { if (c.correct) btns[i].classList.add('right'); });
    },
    lock() { impl.locked = true; btns.forEach((b) => (b.disabled = true)); },
  };
  return makeCtl(item, root, impl);
}

// ===== tf (Đúng/Sai + lý do) =====
function viewTF(item) {
  let ans = null, rsel = null;
  const reasons = item.reasons || [];
  const row = h('div', { class: 'tf-row' });
  const bT = h('button', { class: 'choice tf', type: 'button' }, icon('check', 28), 'Đúng');
  const bF = h('button', { class: 'choice tf', type: 'button' }, icon('close', 28), 'Sai');
  row.append(bT, bF);
  const rbox = h('div', { class: 'choices list reasons', hidden: true });
  const rtitle = h('div', { class: 'sub', hidden: true }, 'Vì sao? Chọn lý do đúng:');
  const rbtns = reasons.map((r, i) => {
    r._id = String(i);
    const b = h('button', { class: 'choice', type: 'button' }, h('span', { class: 'badge' }, LETTERS[i]), h('span', { class: 'ctext' }, h('span', null, r.text)));
    b.addEventListener('click', () => { if (impl.locked || b.disabled) return; rsel = i; rbtns.forEach((x, j) => x.classList.toggle('on', j === i)); impl.notify(); });
    rbox.appendChild(b); return b;
  });
  const pick = (v) => {
    if (impl.locked) return; ans = v; bT.classList.toggle('on', v === true); bF.classList.toggle('on', v === false);
    if (reasons.length) { rbox.hidden = false; rtitle.hidden = false; }
    impl.notify();
  };
  bT.addEventListener('click', () => pick(true)); bF.addEventListener('click', () => pick(false));
  const root = h('div', { class: 'item-body' }, row, rtitle, rbox);
  const impl = {
    locked: false,
    ready: () => ans !== null && (!reasons.length || rsel !== null),
    submit() {
      const ansOk = ans === !!item.answer;
      if (!ansOk) return { correct: false, why: item.whyWrong || 'Đọc lại câu nói và thử kiểm tra bằng ví dụ nhé.', code: '', chosen: [ans] };
      if (reasons.length) { const r = reasons[rsel]; return { correct: !!r.correct, why: r.why || '', code: r.code || '', chosen: [ans, rsel] }; }
      return { correct: true, why: '', code: '', chosen: [ans] };
    },
    markWrong() { impl.locked = false; ans = null; rsel = null; bT.classList.remove('on'); bF.classList.remove('on'); rbtns.forEach((x) => x.classList.remove('on')); rbox.hidden = true; rtitle.hidden = true; impl.notify(); },
    lock() { impl.locked = true; [bT, bF, ...rbtns].forEach((b) => (b.disabled = true)); },
  };
  return makeCtl(item, root, impl);
}

// ===== numpad =====
function viewNumpad(item) {
  const slots = item.slots || [];
  const vals = slots.map(() => '');
  let active = 0;
  const slotEls = slots.map((s, i) => {
    const el = h('button', { class: 'slot', type: 'button', onclick: () => { if (!impl.locked) { active = i; paint(); } } },
      s.label ? h('span', { class: 'slot-label' }, s.label) : null,
      h('span', { class: 'slot-val' }), s.unit ? h('span', { class: 'slot-unit' }, s.unit) : null);
    return el;
  });
  const slotBox = h('div', { class: 'slots' + (slots.length >= 3 ? ' many' : '') }, item.prefix ? h('span', { class: 'slot-fix' }, item.prefix) : null, slotEls, item.suffix ? h('span', { class: 'slot-fix' }, item.suffix) : null);
  const allowNeg = slots.some((s) => s.allowNeg || String(s.answer).includes('−') || String(s.answer).includes('-'));
  const maxLen = (i) => slots[i].len || Math.min(8, String(slots[i].answer).replace(/[−-]/, '').length + 2);
  function paint() {
    slotEls.forEach((el, i) => { el.classList.toggle('active', i === active && !impl.locked); el.querySelector('.slot-val').textContent = vals[i] || ' '; el.classList.toggle('filled', !!vals[i]); });
  }
  const press = (k) => {
    if (impl.locked) return; play('tap');
    let v = vals[active];
    if (k === '⌫') v = v.slice(0, -1);
    else if (k === '−') { v = v.startsWith('−') ? v.slice(1) : '−' + v; }
    else if (v.replace('−', '').length < maxLen(active)) v += k;
    vals[active] = v;
    const autoLen = slots[active].len || String(slots[active].answer).replace(/[−-]/, '').length;
    if (k !== '⌫' && k !== '−' && v.replace('−', '').length >= autoLen && active < slots.length - 1) active++;
    paint(); impl.notify();
  };
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', allowNeg ? '−' : '', '0', '⌫'];
  const pad = h('div', { class: 'numpad' }, keys.map((k) => k ? h('button', { class: 'key' + (k === '⌫' ? ' key-del' : ''), type: 'button', 'aria-label': k === '⌫' ? 'Xoá' : k, onclick: () => press(k) }, k === '⌫' ? icon('backspace', 28) : k) : h('span', { class: 'key-empty' })));
  const root = h('div', { class: 'item-body' }, slotBox, pad);
  const impl = {
    locked: false,
    ready: () => vals.every((v) => v.length > 0 && v !== '−'),
    submit() {
      const joined = vals.map(norm).join('|');
      const okAll = slots.every((s, i) => {
        const v = norm(vals[i]); const accept = [s.answer, ...((item.alt && item.alt[i]) || [])].map(norm); return accept.includes(v);
      });
      let why = '', code = '';
      if (!okAll) {
        const hint = (item.wrongHints || []).find((w) => norm(w.match) === joined || vals.map(norm).includes(norm(w.match)));
        if (hint) { why = hint.why || ''; code = hint.code || ''; }
      }
      return { correct: okAll, why, code, chosen: vals.slice() };
    },
    markWrong() { impl.locked = false; slotEls.forEach((e) => e.classList.add('shake')); setTimeout(() => slotEls.forEach((e) => e.classList.remove('shake')), 500); vals.fill(''); active = 0; paint(); impl.notify(); },
    lock() { impl.locked = true; paint(); },
  };
  paint();
  return makeCtl(item, root, impl);
}

// ===== order =====
function viewOrder(item) {
  const items = item.items || [];
  const seq = [];
  const pool = h('div', { class: 'chips pool' });
  const seqBox = h('div', { class: 'seq' });
  function paint() {
    clear(seqBox); clear(pool);
    items.forEach((_, i) => {
      const id = seq[i];
      const it = items.find((x) => x.id === id);
      seqBox.appendChild(h('button', { class: 'seq-slot' + (it ? ' filled' : ''), type: 'button', onclick: () => { if (it && !impl.locked) { seq.splice(i, 1); paint(); impl.notify(); } } }, h('span', { class: 'seq-n' }, i + 1), it ? h('span', { class: 'seq-t' }, it.text) : ''));
    });
    items.filter((x) => !seq.includes(x.id)).forEach((x) => pool.appendChild(h('button', { class: 'chip', type: 'button', onclick: () => { if (!impl.locked && seq.length < items.length) { seq.push(x.id); paint(); impl.notify(); } } }, x.text)));
  }
  const root = h('div', { class: 'item-body' }, h('div', { class: 'sub' }, 'Chạm lần lượt theo thứ tự:'), seqBox, pool,
    h('button', { class: 'btn-ghost small', type: 'button', onclick: () => { if (!impl.locked) { seq.length = 0; paint(); impl.notify(); } } }, 'Xếp lại'));
  const impl = {
    locked: false,
    ready: () => seq.length === items.length,
    submit() {
      const ok = seq.join(',') === (item.answer || []).join(',');
      let why = '', code = '';
      if (!ok) { const hint = (item.wrongHints || []).find((w) => (w.match || []).join(',') === seq.join(',')); if (hint) { why = hint.why || ''; code = hint.code || ''; } }
      return { correct: ok, why, code, chosen: seq.slice() };
    },
    markWrong() { impl.locked = false; seq.length = 0; paint(); impl.notify(); },
    lock() { impl.locked = true; },
  };
  paint();
  return makeCtl(item, root, impl);
}

// ===== match =====
function viewMatch(item) {
  const L = item.left || [], R = item.right || [];
  const map = {}; let selL = null;
  const multiRight = new Set(Object.values(item.pairs || {})).size < L.length; // nhiều ô trái cùng nối một ô phải
  const colL = h('div', { class: 'mcol' }), colR = h('div', { class: 'mcol' });
  function cell(x, side) { return h('button', { class: 'mcell', type: 'button', 'data-id': x.id }, x.visual ? renderVisual(x.visual) : null, x.text ? h('span', null, x.text) : null); }
  const lEls = L.map((x) => { const b = cell(x, 'l'); b.addEventListener('click', () => { if (impl.locked) return; if (map[x.id] != null) { delete map[x.id]; selL = null; } else selL = selL === x.id ? null : x.id; paint(); impl.notify(); }); colL.appendChild(b); return b; });
  const rEls = R.map((x) => { const b = cell(x, 'r'); b.addEventListener('click', () => { if (impl.locked || selL == null) return; if (!multiRight && Object.values(map).includes(x.id)) return; map[selL] = x.id; selL = null; paint(); impl.notify(); }); colR.appendChild(b); return b; });
  function paint() {
    const keys = Object.keys(map);
    lEls.forEach((b, i) => { const id = L[i].id; const k = keys.indexOf(id); b.classList.toggle('sel', selL === id); b.style.borderColor = k >= 0 ? PAL[k % PAL.length] : ''; b.style.background = k >= 0 ? PAL[k % PAL.length] + '22' : ''; });
    rEls.forEach((b, i) => { const id = R[i].id; const lk = keys.find((x) => map[x] === id); const k = lk ? keys.indexOf(lk) : -1; b.style.borderColor = k >= 0 ? PAL[k % PAL.length] : ''; b.style.background = k >= 0 ? PAL[k % PAL.length] + '22' : ''; });
  }
  const root = h('div', { class: 'item-body' }, h('div', { class: 'sub' }, 'Chạm một ô bên trái, rồi chạm ô bên phải để nối.'), h('div', { class: 'match' }, colL, colR));
  const impl = {
    locked: false,
    ready: () => L.every((x) => map[x.id] != null),
    submit() {
      const ok = L.every((x) => map[x.id] === item.pairs[x.id]);
      const badL = L.find((x) => map[x.id] !== item.pairs[x.id]);
      return { correct: ok, why: ok ? '' : (item.whyWrong || (badL && badL.why) || ''), code: '', chosen: Object.assign({}, map) };
    },
    markWrong() { impl.locked = false; Object.keys(map).forEach((k) => delete map[k]); selL = null; paint(); impl.notify(); },
    lock() { impl.locked = true; },
  };
  return makeCtl(item, root, impl);
}

// ===== classify =====
function viewClassify(item) {
  const chips = item.chips || [], buckets = item.buckets || [];
  const place = {}; let sel = null;
  const pool = h('div', { class: 'chips pool' });
  const bEls = buckets.map((b) => ({ b, el: h('div', { class: 'bucket' }, h('div', { class: 'bucket-t' }, b.text), h('div', { class: 'bucket-in' })) }));
  function paint() {
    clear(pool);
    chips.filter((c) => place[c.id] == null).forEach((c) => pool.appendChild(h('button', { class: 'chip' + (sel === c.id ? ' sel' : ''), type: 'button', onclick: () => { if (!impl.locked) { sel = sel === c.id ? null : c.id; paint(); } } }, c.text)));
    bEls.forEach(({ b, el }) => {
      const inn = el.querySelector('.bucket-in'); clear(inn);
      chips.filter((c) => place[c.id] === b.id).forEach((c) => inn.appendChild(h('button', { class: 'chip placed', type: 'button', onclick: (e) => { e.stopPropagation(); if (!impl.locked) { delete place[c.id]; paint(); impl.notify(); } } }, c.text)));
      el.classList.toggle('target', sel != null);
    });
  }
  bEls.forEach(({ b, el }) => el.addEventListener('click', () => { if (impl.locked || sel == null) return; place[sel] = b.id; sel = null; paint(); impl.notify(); }));
  const root = h('div', { class: 'item-body' }, h('div', { class: 'sub' }, 'Chạm một thẻ, rồi chạm ô đúng.'), pool, h('div', { class: 'buckets' }, bEls.map((x) => x.el)));
  const impl = {
    locked: false,
    ready: () => chips.every((c) => place[c.id] != null),
    submit() { const ok = chips.every((c) => place[c.id] === item.answer[c.id]); return { correct: ok, why: ok ? '' : (item.whyWrong || ''), code: '', chosen: Object.assign({}, place) }; },
    markWrong() { impl.locked = false; Object.keys(place).forEach((k) => delete place[k]); sel = null; paint(); impl.notify(); },
    lock() { impl.locked = true; },
  };
  paint();
  return makeCtl(item, root, impl);
}

export function renderItem(item) {
  const views = { choice: viewChoice, multi: viewChoice, tf: viewTF, numpad: viewNumpad, order: viewOrder, match: viewMatch, classify: viewClassify };
  const body = (views[item.type] || viewChoice)(item);
  const card = h('div', { class: 'item' },
    h('div', { class: 'item-q' }, promptBlock(item), item.visual ? h('div', { class: 'item-visual' }, renderVisual(item.visual)) : null),
    h('div', { class: 'item-a' }, body.el));
  body.card = card; body.el = card; body._body = null;
  const ctl = body; ctl.el = card;
  return ctl;
}

// ===== Trình giải thích từng bước =====
export function openExplain({ title = 'Vì sao thế nhỉ?', steps, voice = true, onClose, finishLabel = 'Đã hiểu', mascot = null }) {
  const ov = h('div', { class: 'sheet-ov', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
  const sheet = h('div', { class: 'sheet' });
  const vis = h('div', { class: 'sheet-visual' });
  const textBox = h('div', { class: 'sheet-text' });
  const dots = h('div', { class: 'dots' });
  const btnPrev = h('button', { class: 'btn-ghost', type: 'button' }, icon('back', 22), 'Trước');
  const btnNext = h('button', { class: 'btn-primary', type: 'button' });
  const btnSay = h('button', { class: 'btn-icon', type: 'button', 'aria-label': 'Nghe' }, icon('speaker', 24));
  const btnReplay = h('button', { class: 'btn-icon', type: 'button', 'aria-label': 'Xem lại hoạt hình' }, icon('replay', 24));
  const btnX = h('button', { class: 'btn-icon close', type: 'button', 'aria-label': 'Đóng' }, icon('close', 22));
  sheet.append(h('div', { class: 'sheet-head' }, h('div', { class: 'sh-left' }, mascot ? h('div', { class: 'sheet-dino' }, mascotSVG(mascot)) : null, h('h3', null, title)), btnX), h('div', { class: 'sheet-grid' }, vis, h('div', { class: 'sheet-side' }, textBox, h('div', { class: 'sheet-tools' }, btnSay, btnReplay), dots)), h('div', { class: 'sheet-nav' }, btnPrev, btnNext));
  ov.appendChild(sheet);
  let i = 0, visEl = null;
  const stepsOk = (steps || []).filter(Boolean);
  function show(n, speakIt) {
    i = Math.max(0, Math.min(stepsOk.length - 1, n));
    const s = stepsOk[i];
    clear(textBox); textBox.className = 'sheet-text ' + (s.mark ? 'mark-' + s.mark : '');
    textBox.appendChild(h('div', { class: 'step-n' }, 'Bước ' + (i + 1) + '/' + stepsOk.length));
    textBox.appendChild(h('p', null, s.text));
    clear(vis); visEl = null;
    if (s.visual) { visEl = renderVisual(s.visual); vis.appendChild(visEl); vis.hidden = false; } else vis.hidden = true;
    sheet.classList.toggle('no-visual', !s.visual);
    btnReplay.hidden = !s.visual;
    clear(dots); stepsOk.forEach((_, j) => dots.appendChild(h('span', { class: 'dot' + (j === i ? ' on' : j < i ? ' past' : '') })));
    btnPrev.disabled = i === 0;
    clear(btnNext); if (i === stepsOk.length - 1) btnNext.append(icon('check', 24), finishLabel); else btnNext.append('Tiếp', icon('chev', 22));
    if (speakIt && voice) speak(s.say || s.text);
  }
  const close = () => { speak(''); ov.remove(); document.body.classList.remove('no-scroll'); document.removeEventListener('keydown', onKey); onClose && onClose(); };
  const onKey = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') btnNext.click(); if (e.key === 'ArrowLeft') btnPrev.click(); };
  btnPrev.onclick = () => show(i - 1, true);
  btnNext.onclick = () => { if (i >= stepsOk.length - 1) close(); else show(i + 1, true); };
  btnSay.onclick = () => speak(stepsOk[i].say || stepsOk[i].text);
  btnReplay.onclick = () => { if (visEl && visEl.replay) visEl.replay(); else show(i, false); };
  btnX.onclick = close;
  document.addEventListener('keydown', onKey);
  document.body.appendChild(ov); document.body.classList.add('no-scroll');
  requestAnimationFrame(() => ov.classList.add('open'));
  if (stepsOk.length) show(0, true);
  return { close };
}

export function toast(msg, ms = 2400) {
  const t = h('div', { class: 'toast', role: 'status' }, msg);
  document.body.appendChild(t); requestAnimationFrame(() => t.classList.add('on'));
  setTimeout(() => { t.classList.remove('on'); setTimeout(() => t.remove(), 300); }, ms);
}
