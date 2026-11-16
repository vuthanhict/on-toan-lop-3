// Ứng dụng: bộ định tuyến + các màn hình
import { store } from './core/store.js';
import { h, clear, renderItem, openExplain, toast, speakerBtn } from './core/ui.js';
import { speak, stop as stopSpeech, status as speechStatus, onStatus } from './core/speech.js';
import { mascotSVG, setMascot, say as mascotSay } from './core/mascot.js';
import { loadVisuals, renderVisual, vctx } from './visuals/index.js';
import { loadTopics, resolveRef, makeSimilar } from './topics/index.js';
import { seeded, shuffle } from './core/rng.js';
import { icon, topicIcon, groupOf } from './core/icons.js';
import * as game from './core/game.js';
import { play } from './core/sfx.js';
import { confetti, flyReward } from './core/fx.js';
import { celebrate, mascotPopup } from './core/celebrate.js';

const app = document.getElementById('app');
let TOPICS = [];
const startedAt = Date.now();
let restShown = false;

const DAY_TITLES = { 1: 'Số và hàng', 2: 'Nhân chia 10, 100 · Làm tròn · Chẵn lẻ', 3: 'Cộng trừ · Nhân · Kết hợp', 4: 'Bội ước · Chia · Phân số', 5: 'Thang đo · Góc · Đối xứng · Giờ', 6: 'Tổng ôn và đề thử' };
const dayOf = (n) => TOPICS.filter((t) => t.day === n);

function todayNo() {
  const s = store.get(); const a = new Date(s.start + 'T00:00:00'); const b = new Date(); b.setHours(0, 0, 0, 0);
  return Math.max(1, Math.min(6, Math.round((b - a) / 86400000) + 1));
}
function starsRow(n, size = 20) {
  const w = h('span', { class: 'stars-row', role: 'img', 'aria-label': n + ' trên 3 sao' });
  for (let i = 0; i < 3; i++) { const s = icon('star', size); if (i < n) s.classList.add('on'); w.appendChild(s); }
  return w;
}
function voiceOn() { return store.get().settings.voice; }
const nextTopic = () => TOPICS.find((t) => !store.topic(t.id).stars);

// ---------- Khung màn hình ----------
function screen(cls, ...kids) { clear(app); const s = h('div', { class: 'screen ' + cls }, ...kids); app.appendChild(s); window.scrollTo(0, 0); return s; }
function topbar(title, back) {
  return h('header', { class: 'topbar' },
    back ? h('a', { class: 'btn-icon back', href: back, 'aria-label': 'Quay lại' }, icon('back', 22)) : h('span', { class: 'spacer' }),
    h('h1', null, title), h('span', { class: 'spacer' }));
}

// ---------- Trang chủ ----------
const ISLANDS = { 1: 'Rừng Số', 2: 'Hang Làm Tròn', 3: 'Núi Phép Tính', 4: 'Đảo Bội–Ước', 5: 'Thành Hình Học', 6: 'Đỉnh Thử Thách' };
const coinChip = () => h('span', { class: 'coin-chip', role: 'img', 'aria-label': 'Số xu' }, icon('coin', 22), h('b', null, String(store.get().coins)));
const refreshCoins = () => document.querySelectorAll('.coin-chip b').forEach((b) => { b.textContent = String(store.get().coins); });

function questCard() {
  const qs = game.quests(); const ready = game.chestReady(); const claimed = store.get().quests.chest;
  const rows = qs.map((q) => {
    const ok = q.have >= q.need;
    return h('div', { class: 'q-row' + (ok ? ' done' : '') }, h('span', { class: 'q-dot' }, ok ? icon('check', 16) : null), h('span', { class: 'q-text' }, q.text), h('span', { class: 'q-prog' }, Math.min(q.have, q.need) + '/' + q.need));
  });
  const action = ready
    ? h('button', { class: 'btn-primary big block pulse', type: 'button', onclick: async () => { const ev = game.claimChest(); if (!ev) return; play('win'); confetti({ n: 40 }); refreshCoins(); await celebrate(ev); viewHome(); } }, icon('chest', 26), 'Mở rương +50 xu')
    : claimed ? h('p', { class: 'q-note' }, 'Con đã mở rương hôm nay rồi. Giỏi lắm!') : null;
  return h('div', { class: 'quests' }, h('div', { class: 'q-head' }, h('h3', null, 'Nhiệm vụ hôm nay'), h('span', { class: 'q-chest' + (ready ? ' ready' : claimed ? ' open' : '') }, icon('chest', 28))), ...rows, action);
}

function mapNode(o) {
  const circle = h('span', { class: 'n-circle' }, o.inner);
  const kids = [circle];
  if (o.done) kids.push(h('span', { class: 'n-check' }, icon('check', 14)));
  if (o.current) kids.push(h('span', { class: 'n-dino ' + (o.x > 55 ? 'l' : 'r') }, mascotSVG('wave')));
  const stars = o.stars != null ? starsRow(o.stars, 15) : null;
  return h('a', { class: 'node' + (o.done ? ' done' : '') + (o.current ? ' current' : '') + (o.kind ? ' ' + o.kind : ''), href: o.href, style: 'left:' + o.x + '%;top:' + o.y + 'px;' + (o.vars || '') },
    h('span', { class: 'n-wrap' }, ...kids), stars, h('span', { class: 'n-label' }, o.label));
}
function buildMap(today) {
  const XS = [50, 24, 50, 76]; const BH = 62, NH = 164;
  const nt = nextTopic(); const els = []; const pts = []; let y = 4;
  const banner = (n) => { els.push(h('div', { class: 'mbanner' + (n === today ? ' today' : ''), style: 'top:' + y + 'px' }, h('span', { class: 'mb-n' }, n === 6 ? icon('flag', 18) : String(n)), h('span', { class: 'mb-t' }, (n < 6 ? 'Ngày ' + n + ' · ' : '') + ISLANDS[n]), n === today ? h('span', { class: 'tag' }, 'Hôm nay') : null)); y += BH; };
  const place = (spec) => { const x = XS[pts.length % 4]; spec.x = x; spec.y = y; els.push(mapNode(spec)); pts.push({ x, top: y + 2, bottom: y + 138, done: !!spec.done }); y += NH; };
  for (let d = 1; d <= 5; d++) {
    const ts = dayOf(d); if (!ts.length) continue;
    banner(d);
    ts.forEach((t) => {
      const g = groupOf(t.no); const rec = store.topic(t.id);
      place({ href: '#/topic/' + t.id, inner: topicIcon(t.no, 46), label: 'CĐ' + t.no + ' · ' + (t.short || t.title), stars: rec.stars || 0, done: rec.stars > 0, current: !!nt && nt.id === t.id, vars: '--nc:' + g.c + ';--ns:' + g.soft });
    });
  }
  banner(6);
  const wr = store.get().wrong.length;
  place({ href: '#/review', kind: 'review', inner: icon('review', 34), label: 'Ôn câu sai' + (wr ? ' (' + wr + ')' : ''), vars: '--nc:#E8761A;--ns:#FFF0DE' });
  place({ href: '#/exam', kind: 'boss', inner: icon('exam', 40), label: 'Trận cuối: Đề thử', current: !nt, vars: '--nc:#7B4DE8;--ns:#EFE8FF' });
  const H = y + 6;
  let segs = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const A = pts[i], B = pts[i + 1], m = (A.bottom + B.top) / 2;
    segs += '<path d="M' + A.x + ' ' + A.bottom + ' C' + A.x + ' ' + m + ' ' + B.x + ' ' + m + ' ' + B.x + ' ' + B.top + '" class="' + (A.done ? 'seg done' : 'seg') + '"/>';
  }
  const svg = h('div', { class: 'map-path', html: '<svg viewBox="0 0 100 ' + H + '" preserveAspectRatio="none" aria-hidden="true">' + segs + '</svg>' });
  return h('div', { class: 'map', style: 'height:' + H + 'px' }, svg, ...els);
}

function viewHome() {
  const st = store.get(); store.touchDay();
  const sp = speechStatus();
  const today = todayNo();
  const wrongN = st.wrong.length;
  const doneN = TOPICS.filter((t) => store.topic(t.id).stars > 0).length;
  const li = game.levelInfo(st.xp);
  const hero = h('div', { class: 'hero' },
    h('div', { class: 'hero-owl' }, mascotSVG(game.chestReady() ? 'cheer' : 'wave')),
    h('div', { class: 'hero-text' }, h('div', { class: 'hello' }, 'Chào con!'),
      h('div', { class: 'lv-chip' }, 'Lv ' + li.lv + ' · ' + li.title),
      h('div', { class: 'xp-bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': li.pct }, h('i', { style: { width: Math.max(4, li.pct) + '%' } }), h('span', null, li.into + '/' + li.need + ' XP')),
      h('div', { class: 'pills' }, coinChip(), h('span', { class: 'pill fire' }, icon('flame', 20), (st.streak.count || 1) + ' ngày'))));
  const nt = nextTopic();
  const next = nt
    ? h('a', { class: 'next', href: '#/topic/' + nt.id }, topicIcon(nt.no), h('div', { class: 'next-body' }, h('div', { class: 'next-label' }, doneN ? 'Trạm tiếp theo' : 'Bắt đầu hành trình'), h('div', { class: 'next-title' }, 'CĐ' + nt.no + ' · ' + nt.title)), h('span', { class: 'next-go' }, icon('play', 26)))
    : h('a', { class: 'next', href: '#/exam' }, h('span', { class: 'ticon', style: '--tile:#EFE8FF;color:#7B4DE8' }, icon('exam', 28)), h('div', { class: 'next-body' }, h('div', { class: 'next-label' }, 'Con đã đi hết các trạm'), h('div', { class: 'next-title' }, 'Đánh trận cuối: Đề thử')), h('span', { class: 'next-go' }, icon('play', 26)));
  const note = (!sp.supported || !sp.hasVietnamese) ? h('div', { class: 'note' }, 'Máy này chưa có giọng đọc tiếng Việt. Con vẫn học được nhờ chữ và hình nhé. Bố mẹ có thể bật giọng tiếng Việt trong Cài đặt → Trợ năng → Nội dung được đọc.') : null;
  const tile = (href, ic, label, badge, cls) => h('a', { class: 'qtile ' + (cls || ''), href }, h('span', { class: 'qi' }, icon(ic, 26)), h('span', { class: 'ql' }, label), badge ? h('b', null, badge) : null);
  const quick = h('div', { class: 'quick3' },
    tile('#/review', 'review', 'Ôn câu sai', wrongN || null, wrongN ? 'hot' : ''),
    tile('#/exam', 'exam', 'Đề thử', st.exam.best ? st.exam.best + '/20' : null, 'exam'),
    tile('#/locker', 'shirt', 'Tủ đồ', (st.badges || []).length || null, 'locker'));
  const settings = h('details', { class: 'settings' }, h('summary', null, icon('sliders', 22), 'Cài đặt'),
    h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: st.settings.sound !== false ? 'checked' : null, onchange: (e) => { store.setSetting('sound', e.target.checked); if (e.target.checked) play('correct'); } }), 'Âm thanh vui nhộn'),
    h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: voiceOn() ? 'checked' : null, onchange: (e) => { store.setSetting('voice', e.target.checked); } }), 'Tự động đọc lời giải'),
    h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: vctx.reduced ? 'checked' : null, onchange: (e) => { vctx.reduced = e.target.checked; vctx.lite = e.target.checked; store.setSetting('lite', e.target.checked); } }), 'Giảm hiệu ứng chuyển động'),
    h('button', { class: 'btn-ghost small', type: 'button', onclick: () => { if (confirm('Xoá toàn bộ tiến độ?')) { store.reset(); viewHome(); } } }, 'Xoá tiến độ'));
  screen('home', hero, note, next, questCard(), quick,
    h('div', { class: 'map-head' }, h('h2', { class: 'sec' }, 'Hành trình của Mít'), h('span', { class: 'map-count' }, doneN + '/' + TOPICS.length + ' trạm')),
    buildMap(today), settings, h('footer', { class: 'foot' }, 'Chúc con ôn tập vui và thi thật tốt!'));
}

// ---------- Ngày ----------
function viewDay(n) {
  n = Number(n);
  if (n === 6) return viewFinalDay();
  const ts = dayOf(n);
  const list = h('div', { class: 'topics' }, ts.length ? ts.map((t) => topicCard(t)) : h('p', { class: 'note' }, 'Nội dung ngày này đang được chuẩn bị.'));
  screen('dayview', topbar('Ngày ' + n, '#/'), h('p', { class: 'lead' }, DAY_TITLES[n]), list);
}
function topicCard(t) {
  const rec = store.topic(t.id);
  return h('a', { class: 'tcard', href: '#/topic/' + t.id },
    topicIcon(t.no),
    h('div', { class: 'tbody' }, h('div', { class: 'tt' }, 'CĐ' + t.no + ' · ' + t.title), h('div', { class: 'ts' }, t.intro || '')),
    starsRow(rec.stars || 0, 18));
}
function viewFinalDay() {
  const tile = (bg, fg, ic) => h('span', { class: 'ticon', style: '--tile:' + bg + ';color:' + fg }, icon(ic, 28));
  screen('dayview', topbar('Ngày 6 · Tổng ôn', '#/'), h('p', { class: 'lead' }, 'Không học kiến thức mới. Làm lại câu sai, rồi thử sức với đề 20 câu.'),
    h('div', { class: 'topics' },
      h('a', { class: 'tcard', href: '#/review' }, tile('#FFF0DE', '#E8761A', 'review'), h('div', { class: 'tbody' }, h('div', { class: 'tt' }, 'Ôn câu sai'), h('div', { class: 'ts' }, store.get().wrong.length + ' câu đang chờ con')), h('span', { class: 'chev' }, icon('chev', 22))),
      h('a', { class: 'tcard', href: '#/exam' }, tile('#EFE8FF', '#7B4DE8', 'exam'), h('div', { class: 'tbody' }, h('div', { class: 'tt' }, 'Đề thử 20 câu'), h('div', { class: 'ts' }, 'Làm xong mới xem đáp án. Không bị trừ gì cả!')), h('span', { class: 'chev' }, icon('chev', 22)))));
}

// ---------- Tủ đồ & huy hiệu ----------
function viewLocker() {
  const st = store.get(); const eq = st.wardrobe.equipped || {}; const own = game.owned();
  const prev = h('div', { class: 'lk-prev' }, mascotSVG('happy'));
  const items = h('div', { class: 'lk-grid' }, game.ITEMS.map((it) => {
    const has = own.includes(it.id); const on = eq[it.slot] === it.id;
    const mini = mascotSVG('idle', { equip: { [it.slot]: it.id } });
    return h('button', { class: 'lk-item' + (on ? ' on' : '') + (has ? '' : ' locked'), type: 'button', disabled: has ? null : 'disabled',
      onclick: () => { game.equip(it.id); play('tap'); viewLocker(); } },
      h('div', { class: 'lk-mini' }, mini, has ? null : h('span', { class: 'lk-lock' }, icon('lock', 26))),
      h('div', { class: 'lk-name' }, it.name), h('div', { class: 'lk-sub' }, has ? (on ? 'Đang mặc' : 'Chạm để mặc') : it.need));
  }));
  const badges = h('div', { class: 'bd-grid' }, game.BADGES.map((b) => {
    const has = (st.badges || []).includes(b.id);
    return h('div', { class: 'bd' + (has ? ' has' : '') }, h('span', { class: 'bd-ic', style: '--bc:' + b.color }, icon(has ? b.icon : 'lock', 28)), h('div', null, h('div', { class: 'bd-n' }, b.name), h('div', { class: 'bd-d' }, b.desc)));
  }));
  const li = game.levelInfo(st.xp);
  screen('locker', topbar('Tủ đồ của Mít', '#/'),
    h('div', { class: 'lk-top' }, prev, h('div', { class: 'lk-info' }, h('div', { class: 'lv-chip dark' }, 'Lv ' + li.lv + ' · ' + li.title), coinChip(), h('p', { class: 'sub' }, 'Đồ mới mở khoá khi con lên cấp hoặc giỏi ở đề thử.'))),
    h('h2', { class: 'sec' }, 'Phụ kiện'), items,
    h('h2', { class: 'sec' }, 'Huy hiệu · ' + (st.badges || []).length + '/' + game.BADGES.length), badges);
}

// ---------- Học chủ đề ----------
function viewTopic(id) {
  const t = TOPICS.find((x) => x.id === id);
  if (!t) return viewHome();
  const rec = store.topic(id);
  const g = groupOf(t.no);
  const cards = h('div', { class: 'cards' }, (t.remember || []).map((r, i) =>
    h('div', { class: 'rcard' }, h('div', { class: 'rnum', style: '--g:' + g.c }, i + 1), h('div', { class: 'rbody' }, h('p', null, r.text), r.visual ? h('div', { class: 'rvis' }, renderVisual(r.visual)) : null), speakerBtn(() => r.say || r.text))));
  const ti = topicIcon(t.no, 56); ti.classList.add('big');
  const lessonBtn = (t.lesson && t.lesson.length) ? h('button', { class: 'btn-secondary', type: 'button', onclick: () => { const first = !rec.learned; rec.learned = true; store.save(); const ev = game.onLearned(first); openExplain({ title: 'Bài giảng', steps: t.lesson, voice: voiceOn(), finishLabel: 'Xong', mascot: 'wave', onClose: () => celebrate(ev) }); } }, icon('film', 24), 'Bài giảng') : null;
  screen('topic', topbar('CĐ' + t.no + ' · ' + (t.short || t.title), '#/day/' + t.day),
    h('div', { class: 'thead', style: '--tile:' + g.soft + ';--ink:' + g.ink }, ti, h('div', null, h('div', { class: 'chip-g' }, g.name), h('h2', null, t.title), starsRow(rec.stars || 0, 22))),
    h('h3', { class: 'sec' }, 'Điều cần nhớ'), cards,
    h('div', { class: 'actionbar' }, lessonBtn, h('a', { class: 'btn-primary', href: '#/practice/' + id }, icon('pencil', 24), 'Luyện tập')));
}

// ---------- Phiên luyện tập ----------
function buildTopicQueue(t) {
  const q = [...(t.items || []).slice(0, 6)];
  if (t.variant) q.push(t.variant);
  return q.map((it) => Object.assign({}, it, { _ref: { t: t.id, i: it.id }, _topic: t }));
}

function startSession(opts) {
  // opts: {title, back, queue, mode: 'practice'|'review'|'exam', onFinish(summary)}
  const S = { queue: opts.queue.slice(), idx: 0, firstTry: 0, total: 0, wrongs: [], results: [], mode: opts.mode || 'practice' };
  const mode = S.mode;
  const wrap = h('div', { class: 'screen practice' });
  clear(app); app.appendChild(wrap);
  let ctl, attempt, locked;

  function header() {
    const total = S.queue.length;
    return h('header', { class: 'topbar pr' }, h('button', { class: 'btn-icon back', type: 'button', 'aria-label': 'Thoát', onclick: () => { if (confirm('Thoát bài luyện tập?')) { stopSpeech(); location.hash = opts.back || '#/'; } } }, icon('close', 22)),
      h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': total, 'aria-valuenow': S.idx }, h('i', { style: { width: Math.round((S.idx / total) * 100) + '%' } }), h('span', { class: 'ptext' }, Math.min(S.idx + 1, total) + '/' + total)),
      mode === 'exam' ? h('span', { class: 'spacer' }) : coinChip());
  }

  function next() { S.idx++; renderCur(); }

  function finish() {
    stopSpeech();
    const summary = { total: S.total, firstTry: S.firstTry, wrongs: S.wrongs, results: S.results };
    opts.onFinish(summary);
  }

  function renderCur() {
    if (S.idx >= S.queue.length) return finish();
    const item = S.queue[S.idx];
    attempt = 0; locked = false;
    window.__cur = item;
    ctl = renderItem(item);
    const owlBox = h('div', { class: 'fb-owl' }, mascotSVG('idle'));
    let pendingEv = null;
    const fbText = h('div', { class: 'fb-text' });
    const fb = h('div', { class: 'feedback', hidden: true }, owlBox, fbText);
    const btnMain = h('button', { class: 'btn-primary big', type: 'button', disabled: true }, mode === 'exam' ? 'Trả lời' : 'Kiểm tra');
    const btnSide = h('button', { class: 'btn-ghost', type: 'button', hidden: true }, 'Xem vì sao');
    const bar = h('div', { class: 'actionbar' }, btnSide, btnMain);
    ctl.onReady((r) => { if (!locked || phase === 'retry') btnMain.disabled = !r; });
    let phase = 'ask';
    const owl = () => owlBox.firstChild;
    const showFb = (cls, state, title, body) => { fb.hidden = false; fb.className = 'feedback ' + cls; setMascot(owl(), state); clear(fbText); fbText.append(h('b', null, title), body ? h('div', { class: 'fb-why' }, body) : null); };

    const explain = (afterWrong) => {
      const steps = (item.explain && item.explain.steps) || [];
      stopSpeech();
      if (!steps.length) { toast('Bài này chưa có lời giải.'); return afterExplain(afterWrong); }
      openExplain({ title: 'Vì sao thế nhỉ?', steps, voice: voiceOn(), mascot: 'wow', onClose: () => afterExplain(afterWrong) });
    };
    const afterExplain = (afterWrong) => {
      if (!afterWrong) return;
      phase = 'after';
      ctl.lock && ctl.lock(); ctl.reveal && ctl.reveal();
      const t = item._topic;
      const canSim = mode !== 'exam' && !item._similar && t && (t.generators || []).length;
      showFb('warn', 'think', 'Mình thử một bài giống vậy nhé!', 'Số khác nhưng cách làm y hệt. Đúng là có xu đó!');
      btnMain.disabled = false; btnMain.textContent = canSim ? 'Làm bài tương tự' : 'Tiếp tục';
      btnSide.hidden = false; btnSide.textContent = 'Xem lại lời giải';
      btnSide.onclick = () => explain(false);
      btnMain.onclick = () => {
        if (canSim) { const sim = makeSimilar(t, S.idx); if (sim) { S.queue.splice(S.idx + 1, 0, sim); } }
        next();
      };
    };

    const record = (correct, first) => {
      S.total += item._similar ? 0 : 1;
      if (correct && first && !item._similar) S.firstTry++;
      S.results.push({ item, correct, first });
      if (!correct) { S.wrongs.push(item); if (item._ref) store.addWrong(item._ref); }
      else if (item._ref && (mode === 'review' || !first)) { if (mode === 'review') store.clearWrong(item._ref); }
    };

    btnMain.onclick = () => {
      if (phase === 'ask' || phase === 'retry') {
        const res = ctl.submit();
        if (mode === 'exam') { record(res.correct, true); S.results[S.results.length - 1].res = res; return next(); }
        attempt++;
        if (res.correct) {
          phase = 'done'; locked = true; ctl.lock(); ctl.reveal && ctl.reveal();
          record(true, attempt === 1);
          const ev = game.onCorrect(item._similar ? 'similar' : attempt === 1 ? 'first' : 'second', mode);
          pendingEv = ev;
          play('correct'); setTimeout(() => play('coin'), 170); if (ev.combo >= 3) setTimeout(() => play('combo'), 330);
          refreshCoins();
          flyReward(ctl.el.querySelector('.choice.right, .slot.active, .slot, .item-q'), '+' + ev.coins);
          if (ev.combo >= 3) confetti({ y: innerHeight * 0.55, n: 18 });
          const m = ev.combo >= 3 ? mascotSay('combo') : mascotSay('ok');
          const chips = h('span', { class: 'rw' }, h('span', { class: 'rw-chip' }, icon('coin', 16), '+' + ev.coins + ' xu'), ev.combo >= 3 ? h('span', { class: 'rw-chip fire' }, icon('flame', 16), 'Combo x' + ev.combo) : null, attempt > 1 ? h('span', { class: 'rw-note' }, 'Lần này con làm đúng rồi!') : null);
          showFb('ok', ev.combo >= 3 ? 'cheer' : 'happy', m, chips);
          if (voiceOn()) speak(m);
          btnMain.textContent = 'Tiếp tục'; btnMain.disabled = false;
          btnSide.hidden = false; btnSide.textContent = 'Xem lời giải'; btnSide.onclick = () => explain(false);
          btnMain.onclick = async () => { btnMain.disabled = true; await celebrate(pendingEv); next(); };
          const mins = (Date.now() - startedAt) / 60000;
          if (mins > 15 && !restShown) { restShown = true; mascotPopup({ state: 'sleepy', title: 'Nghỉ mắt một chút nhé', text: 'Con đã học 15 phút rồi. Nhìn ra xa 20 giây, uống ngụm nước rồi mình học tiếp!', burst: false, buttons: [{ label: 'Con nghỉ xong rồi', value: 'ok' }] }); }
          return;
        }
        // sai
        if (attempt === 1) {
          phase = 'retry';
          ctl.markWrong(res); game.onWrong(); play('oops');
          showFb('warn', 'encourage', mascotSay('retry'), item.hint ? 'Gợi ý: ' + item.hint : 'Đọc lại đề thật kỹ, rồi chọn lại nhé.');
          btnMain.textContent = 'Kiểm tra'; btnMain.disabled = true;
          btnSide.hidden = false; btnSide.textContent = 'Xem vì sao';
          btnSide.onclick = () => { record(false, false); locked = true; phase = 'after'; game.onWrong(); explain(true); };
          return;
        }
        record(false, false); locked = true; phase = 'after'; game.onWrong(); play('oops');
        showFb('warn', 'wow', mascotSay('explain'), res.why || '');
        explain(true);
      }
    };
    btnSide.onclick = () => { };
    const main = h('main', { class: 'pr-main' }, ctl.el);
    clear(wrap);
    wrap.append(header(), main, fb, bar);
    window.scrollTo(0, 0);
  }
  renderCur();
}

function viewPractice(id) {
  const t = TOPICS.find((x) => x.id === id);
  if (!t) return viewHome();
  const queue = buildTopicQueue(t);
  if (!queue.length) { return screen('topic', topbar(t.title, '#/topic/' + id), h('p', { class: 'note' }, 'Chủ đề này chưa có bài.')); }
  startSession({
    mode: 'practice', queue, back: '#/topic/' + id,
    onFinish: (sm) => {
      const rec = store.topic(id); const pct = sm.total ? sm.firstTry / sm.total : 0;
      const stars = pct >= 0.85 ? 3 : pct >= 0.6 ? 2 : 1;
      rec.stars = Math.max(rec.stars || 0, stars); rec.tries = (rec.tries || 0) + 1; rec.best = Math.max(rec.best || 0, sm.firstTry); store.save();
      const rw = game.onTopicDone(stars);
      viewResult({ title: t.title, sm, stars, rw, back: '#/home', again: '#/practice/' + id });
    },
  });
}

function viewReview() {
  const st = store.get();
  const items = st.wrong.map((r) => resolveRef(TOPICS, r)).filter(Boolean);
  if (!items.length) {
    const owl = mascotSVG('happy');
    return screen('result', topbar('Ôn câu sai', '#/'), h('div', { class: 'res-owl' }, owl), h('h2', { class: 'center' }, 'Không có câu sai nào!'), h('p', { class: 'center sub' }, 'Con hãy luyện thêm các chủ đề rồi quay lại nhé.'), h('a', { class: 'btn-primary big block', href: '#/' }, 'Về trang chủ'));
  }
  startSession({ mode: 'review', queue: items, back: '#/', onFinish: (sm) => viewResult({ title: 'Ôn câu sai', sm, stars: null, rw: null, back: '#/', again: '#/review' }) });
}

function viewExam() {
  const st = store.get(); st.exam.tries++;
  const rng = seeded(Date.now() % 1e9);
  const q = [];
  TOPICS.forEach((t) => {
    const pool = [...(t.items || []), ...(t.variant ? [t.variant] : [])];
    let it;
    if ((t.generators || []).length && rng.next() < 0.6) { it = makeSimilar(t, Math.floor(rng.next() * 1000)); if (it) it._similar = false; }
    if (!it && pool.length) { const base = pool[Math.floor(rng.next() * pool.length)]; it = Object.assign({}, base, { _ref: { t: t.id, i: base.id }, _topic: t }); }
    if (it) q.push(it);
  });
  const heavy = shuffle(rng, TOPICS.filter((t) => [3, 7, 10, 11, 12].includes(t.no)));
  heavy.forEach((t) => { if (q.length < 20) { const it = makeSimilar(t, 777); if (it) { it._similar = false; q.push(it); } } });
  const queue = shuffle(rng, q).slice(0, 20);
  if (!queue.length) return viewHome();
  startSession({
    mode: 'exam', queue, back: '#/',
    onFinish: (sm) => {
      const correct = sm.results.filter((r) => r.correct).length;
      st.exam.best = Math.max(st.exam.best || 0, correct); store.save();
      const rw = game.onExamDone(correct);
      viewResult({ title: 'Đề thử', sm, stars: null, rw, back: '#/', again: '#/exam', exam: { correct, total: sm.results.length } });
    },
  });
}

// ---------- Kết quả ----------
function viewResult({ title, sm, stars, back, again, exam, rw }) {
  const big = stars === 3 || (exam && exam.correct / exam.total >= 0.8);
  const owl = mascotSVG(big ? 'win' : stars === 2 ? 'cheer' : stars === 1 ? 'proud' : 'happy');
  const msg = exam ? ('Đúng ' + exam.correct + '/' + exam.total + ' câu') : (stars ? '' : 'Xong rồi!');
  const wrongList = exam ? sm.results.filter((r) => !r.correct) : [];
  const sub = exam ? (wrongList.length ? 'Xem lại các câu chưa đúng để hiểu vì sao nhé.' : 'Con làm đúng hết! Tuyệt vời!') : (sm.total ? 'Đúng ngay lần đầu: ' + sm.firstTry + '/' + sm.total + ' câu' : '');
  const exWrap = wrongList.length ? h('div', { class: 'wlist' }, h('h3', { class: 'sec' }, 'Các câu cần xem lại'), wrongList.map((r, i) => h('button', { class: 'wrow', type: 'button', onclick: () => openExplain({ title: 'Câu ' + (i + 1), steps: [{ text: r.item.prompt, visual: r.item.visual }].concat((r.item.explain && r.item.explain.steps) || []), voice: voiceOn() }) }, h('span', null, (i + 1) + '. ' + (() => { const q = String(r.item.prompt).split('\n')[0]; return q.length > 56 ? q.slice(0, 55) + '…' : q; })()), h('span', { class: 'more' }, 'Xem vì sao', icon('chev', 16))))) : null;
  const mids = !exam && sm.wrongs.length ? h('p', { class: 'center sub' }, 'Có ' + sm.wrongs.length + ' câu được lưu vào "Ôn câu sai" để luyện lại.') : null;
  screen('result', h('div', { class: 'res-owl' }, owl), h('h2', { class: 'center' }, stars ? ['', 'Cố gắng tốt!', 'Giỏi lắm!', 'Tuyệt vời!'][stars] : title), stars ? h('p', { class: 'center sub' }, title) : null, (stars ? (() => { const r = h('div', { class: 'res-stars' }); for (let i = 0; i < 3; i++) { const si = icon('star', 52); if (i < stars) si.classList.add('on'); r.appendChild(si); } return r; })() : h('div', { class: 'res-score' }, msg)), h('p', { class: 'center sub' }, sub), rw && (rw.coins || rw.xp) ? h('div', { class: 'rw-row' }, h('span', { class: 'rw-chip big' }, icon('coin', 22), '+' + rw.coins + ' xu'), h('span', { class: 'rw-chip big xp' }, icon('star', 20), '+' + rw.xp + ' XP')) : null, mids, exWrap,
    h('a', { class: 'btn-primary big block', href: back === '#/home' ? '#/' : back }, 'Tiếp tục'), h('a', { class: 'btn-ghost big block', href: again }, 'Làm lại'));
  if (big || stars >= 2) { play('win'); setTimeout(() => confetti({ y: innerHeight * 0.3, n: 44 }), 250); } else play('badge');
  if (rw) setTimeout(() => celebrate(rw), 900);
}

// ---------- Bộ định tuyến ----------
function route() {
  stopSpeech();
  const [, a, b] = (location.hash || '#/').split('/');
  try {
    if (!a) return viewHome();
    if (a === 'day') return viewDay(b);
    if (a === 'topic') return viewTopic(b);
    if (a === 'practice') return viewPractice(b);
    if (a === 'review') return viewReview();
    if (a === 'exam') return viewExam();
    if (a === 'locker') return viewLocker();
    return viewHome();
  } catch (e) {
    console.error(e);
    screen('home', h('div', { class: 'note' }, 'Có lỗi nhỏ: ' + (e && e.message)), h('a', { class: 'btn-primary big block', href: '#/' }, 'Về trang chủ'));
  }
}

async function boot() {
  const lite = store.get().settings.lite;
  if (lite) { vctx.lite = true; vctx.reduced = true; }
  const mem = navigator.deviceMemory;
  if (mem && mem <= 2) vctx.lite = true;
  app.appendChild(h('div', { class: 'loading' }, 'Đang chuẩn bị…'));
  await loadVisuals();
  TOPICS = await loadTopics();
  game.setTopics(TOPICS);
  window.addEventListener('hashchange', route);
  route();
  window.__app = { TOPICS: () => TOPICS, store };
}
boot();
