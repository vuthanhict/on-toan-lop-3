// Ứng dụng: bộ định tuyến + các màn hình
import { store } from './core/store.js';
import { h, clear, renderItem, openExplain, toast, speakerBtn } from './core/ui.js';
import { speak, stop as stopSpeech, status as speechStatus, onStatus } from './core/speech.js';
import { mascotSVG, setMascot, say as mascotSay } from './core/mascot.js';
import { loadVisuals, renderVisual, vctx } from './visuals/index.js';
import { loadTopics, resolveRef, makeSimilar } from './topics/index.js';
import { seeded, shuffle } from './core/rng.js';

const app = document.getElementById('app');
let TOPICS = [];
const startedAt = Date.now();
let restShown = false;

const DAY_TITLES = { 1: 'Số và hàng', 2: 'Nhân chia 10, 100 · Làm tròn · Chẵn lẻ', 3: 'Cộng trừ · Nhân · Kết hợp', 4: 'Bội ước · Chia · Phân số', 5: 'Thang đo · Góc · Đối xứng · Giờ', 6: 'Tổng ôn & đề thử' };
const dayOf = (n) => TOPICS.filter((t) => t.day === n);

function todayNo() {
  const s = store.get(); const a = new Date(s.start + 'T00:00:00'); const b = new Date(); b.setHours(0, 0, 0, 0);
  return Math.max(1, Math.min(6, Math.round((b - a) / 86400000) + 1));
}
function starsStr(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); }
function voiceOn() { return store.get().settings.voice; }

// ---------- Khung màn hình ----------
function screen(cls, ...kids) { clear(app); const s = h('div', { class: 'screen ' + cls }, ...kids); app.appendChild(s); window.scrollTo(0, 0); return s; }
function topbar(title, back) {
  return h('header', { class: 'topbar' },
    back ? h('a', { class: 'btn-icon back', href: back, 'aria-label': 'Quay lại' }, '←') : h('span', { class: 'spacer' }),
    h('h1', null, title), h('span', { class: 'spacer' }));
}

// ---------- Trang chủ ----------
function viewHome() {
  const st = store.get(); store.touchDay();
  const sp = speechStatus();
  const today = todayNo();
  const wrongN = st.wrong.length;
  const owl = mascotSVG('idle');
  const hello = h('div', { class: 'hero' },
    h('div', { class: 'hero-owl' }, owl),
    h('div', { class: 'hero-text' }, h('div', { class: 'hello' }, 'Cùng ôn Toán lớp 3!'), h('div', { class: 'sub' }, 'Ôn thi học kì 1 · thi ngày 27/11'),
      h('div', { class: 'pills' }, h('span', { class: 'pill' }, '⭐ ' + store.totalStars()), h('span', { class: 'pill' }, '🔥 ' + (st.streak.count || 1) + ' ngày'))));
  const note = (!sp.supported || !sp.hasVietnamese) ? h('div', { class: 'note' }, '🔇 Máy này chưa có giọng đọc tiếng Việt. Con vẫn học được nhờ chữ và hình nhé. Bố mẹ có thể bật giọng tiếng Việt trong Cài đặt → Trợ năng → Nội dung được đọc.') : null;
  const days = h('div', { class: 'days' });
  for (let n = 1; n <= 6; n++) {
    const ts = dayOf(n);
    const done = ts.length ? ts.filter((t) => store.topic(t.id).stars > 0).length : 0;
    const el = h('a', { class: 'day' + (n === today ? ' today' : '') + (n === 6 ? ' final' : ''), href: '#/day/' + n },
      h('div', { class: 'day-n' }, n === 6 ? '🏁' : 'Ngày ' + n),
      h('div', { class: 'day-body' }, h('div', { class: 'day-t' }, n === today ? h('span', { class: 'tag' }, 'Hôm nay') : null, DAY_TITLES[n]),
        n === 6 ? h('div', { class: 'day-s' }, 'Ôn câu sai + đề thử 20 câu') : h('div', { class: 'day-s' }, ts.length ? done + '/' + ts.length + ' chủ đề đã luyện' : 'Đang chuẩn bị…')),
      h('span', { class: 'chev' }, '›'));
    days.appendChild(el);
  }
  const quick = h('div', { class: 'quick' },
    h('a', { class: 'qbtn' + (wrongN ? ' hot' : ''), href: '#/review' }, h('span', { class: 'qi' }, '🧩'), h('span', null, 'Ôn câu sai'), h('b', null, wrongN)),
    h('a', { class: 'qbtn', href: '#/exam' }, h('span', { class: 'qi' }, '📝'), h('span', null, 'Đề thử'), h('b', null, st.exam.best ? st.exam.best + '/20' : '')));
  const settings = h('details', { class: 'settings' }, h('summary', null, '⚙️ Cài đặt'),
    h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: voiceOn() ? 'checked' : null, onchange: (e) => { store.setSetting('voice', e.target.checked); } }), ' Tự động đọc lời giải'),
    h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: vctx.reduced ? 'checked' : null, onchange: (e) => { vctx.reduced = e.target.checked; vctx.lite = e.target.checked; store.setSetting('lite', e.target.checked); } }), ' Giảm hiệu ứng chuyển động'),
    h('button', { class: 'btn-ghost small', type: 'button', onclick: () => { if (confirm('Xoá toàn bộ tiến độ?')) { store.reset(); viewHome(); } } }, 'Xoá tiến độ'));
  screen('home', hello, note, h('h2', { class: 'sec' }, 'Lộ trình ôn tập'), days, quick, settings, h('footer', { class: 'foot' }, 'Bám theo tài liệu ôn tập của lớp. Chúc con thi tốt! 🍀'));
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
    h('div', { class: 'ticon' }, t.icon || '📘'),
    h('div', { class: 'tbody' }, h('div', { class: 'tt' }, 'CĐ' + t.no + ' · ' + t.title), h('div', { class: 'ts' }, t.intro || '')),
    h('div', { class: 'tstars ' + (rec.stars ? 'has' : '') }, starsStr(rec.stars || 0)));
}
function viewFinalDay() {
  screen('dayview', topbar('Ngày 6 · Tổng ôn', '#/'), h('p', { class: 'lead' }, 'Không học kiến thức mới. Làm lại câu sai, rồi thử sức với đề 20 câu.'),
    h('div', { class: 'topics' },
      h('a', { class: 'tcard', href: '#/review' }, h('div', { class: 'ticon' }, '🧩'), h('div', { class: 'tbody' }, h('div', { class: 'tt' }, 'Ôn câu sai'), h('div', { class: 'ts' }, store.get().wrong.length + ' câu đang chờ con')), h('div', { class: 'tstars' }, '›')),
      h('a', { class: 'tcard', href: '#/exam' }, h('div', { class: 'ticon' }, '📝'), h('div', { class: 'tbody' }, h('div', { class: 'tt' }, 'Đề thử 20 câu'), h('div', { class: 'ts' }, 'Làm xong mới xem đáp án. Không bị trừ gì cả!')), h('div', { class: 'tstars' }, '›'))));
}

// ---------- Học chủ đề ----------
function viewTopic(id) {
  const t = TOPICS.find((x) => x.id === id);
  if (!t) return viewHome();
  const rec = store.topic(id);
  const cards = h('div', { class: 'cards' }, (t.remember || []).map((r, i) =>
    h('div', { class: 'rcard' }, h('div', { class: 'rnum' }, i + 1), h('div', { class: 'rbody' }, h('p', null, r.text), r.visual ? h('div', { class: 'rvis' }, renderVisual(r.visual)) : null), speakerBtn(() => r.say || r.text))));
  const lessonBtn = (t.lesson && t.lesson.length) ? h('button', { class: 'btn-secondary big', type: 'button', onclick: () => { rec.learned = true; store.save(); openExplain({ title: 'Xem bài giảng', steps: t.lesson, voice: voiceOn(), finishLabel: 'Xong' }); } }, '🎬 Xem bài giảng hoạt hình') : null;
  screen('topic', topbar('CĐ' + t.no + ' · ' + (t.short || t.title), '#/day/' + t.day),
    h('div', { class: 'thead' }, h('div', { class: 'ticon big' }, t.icon || '📘'), h('div', null, h('h2', null, t.title), h('div', { class: 'tstars has' }, starsStr(rec.stars || 0)))),
    h('h3', { class: 'sec' }, 'Điều cần nhớ'), cards, lessonBtn,
    h('a', { class: 'btn-primary big block', href: '#/practice/' + id }, '✏️ Luyện tập'));
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
    return h('header', { class: 'topbar pr' }, h('button', { class: 'btn-icon back', type: 'button', 'aria-label': 'Thoát', onclick: () => { if (confirm('Thoát bài luyện tập?')) { stopSpeech(); location.hash = opts.back || '#/'; } } }, '✕'),
      h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': total, 'aria-valuenow': S.idx }, h('i', { style: { width: Math.round((S.idx / total) * 100) + '%' } })),
      h('span', { class: 'count' }, Math.min(S.idx + 1, total) + '/' + total));
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
      openExplain({ title: 'Vì sao thế nhỉ?', steps, voice: voiceOn(), onClose: () => afterExplain(afterWrong) });
    };
    const afterExplain = (afterWrong) => {
      if (!afterWrong) return;
      phase = 'after';
      ctl.lock && ctl.lock(); ctl.reveal && ctl.reveal();
      const t = item._topic;
      const canSim = mode !== 'exam' && !item._similar && t && (t.generators || []).length;
      showFb('warn', 'think', 'Mình cùng thử một bài giống vậy nhé!', 'Số khác nhưng cách làm y hệt.');
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
          const m = mascotSay('ok');
          showFb('ok', 'happy', m, attempt === 1 ? '' : 'Lần này con làm đúng rồi!');
          if (voiceOn()) speak(m);
          btnMain.textContent = 'Tiếp tục'; btnMain.disabled = false;
          btnSide.hidden = false; btnSide.textContent = 'Xem lời giải'; btnSide.onclick = () => explain(false);
          btnMain.onclick = () => next();
          const mins = (Date.now() - startedAt) / 60000;
          if (mins > 15 && !restShown) { restShown = true; toast('🦉 Con học được 15 phút rồi. Nghỉ mắt một chút nhé!', 5000); }
          return;
        }
        // sai
        if (attempt === 1) {
          phase = 'retry';
          ctl.markWrong(res);
          showFb('warn', 'oops', mascotSay('retry'), item.hint ? '💡 ' + item.hint : 'Đọc lại đề thật kỹ, rồi chọn lại nhé.');
          btnMain.textContent = 'Kiểm tra'; btnMain.disabled = true;
          btnSide.hidden = false; btnSide.textContent = 'Xem vì sao';
          btnSide.onclick = () => { record(false, false); locked = true; phase = 'after'; explain(true); };
          return;
        }
        record(false, false); locked = true; phase = 'after';
        showFb('warn', 'oops', mascotSay('explain'), res.why || '');
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
      viewResult({ title: t.title, sm, stars, back: '#/day/' + t.day, again: '#/practice/' + id });
    },
  });
}

function viewReview() {
  const st = store.get();
  const items = st.wrong.map((r) => resolveRef(TOPICS, r)).filter(Boolean);
  if (!items.length) {
    const owl = mascotSVG('happy');
    return screen('result', topbar('Ôn câu sai', '#/'), h('div', { class: 'res-owl' }, owl), h('h2', { class: 'center' }, 'Không có câu sai nào! 🎉'), h('p', { class: 'center sub' }, 'Con hãy luyện thêm các chủ đề rồi quay lại nhé.'), h('a', { class: 'btn-primary big block', href: '#/' }, 'Về trang chủ'));
  }
  startSession({ mode: 'review', queue: items, back: '#/', onFinish: (sm) => viewResult({ title: 'Ôn câu sai', sm, stars: null, back: '#/', again: '#/review' }) });
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
      viewResult({ title: 'Đề thử', sm, stars: null, back: '#/', again: '#/exam', exam: { correct, total: sm.results.length } });
    },
  });
}

// ---------- Kết quả ----------
function viewResult({ title, sm, stars, back, again, exam }) {
  const owl = mascotSVG(stars === 3 || (exam && exam.correct / exam.total >= 0.8) ? 'cheer' : 'happy');
  const msg = exam ? ('Đúng ' + exam.correct + '/' + exam.total + ' câu') : (stars ? starsStr(stars) : 'Xong rồi!');
  const wrongList = exam ? sm.results.filter((r) => !r.correct) : [];
  const sub = exam ? (wrongList.length ? 'Xem lại các câu chưa đúng để hiểu vì sao nhé.' : 'Con làm đúng hết! Tuyệt vời!') : (sm.total ? 'Đúng ngay lần đầu: ' + sm.firstTry + '/' + sm.total + ' câu' : '');
  const exWrap = wrongList.length ? h('div', { class: 'wlist' }, h('h3', { class: 'sec' }, 'Các câu cần xem lại'), wrongList.map((r, i) => h('button', { class: 'wrow', type: 'button', onclick: () => openExplain({ title: 'Câu ' + (i + 1), steps: [{ text: r.item.prompt, visual: r.item.visual }].concat((r.item.explain && r.item.explain.steps) || []), voice: voiceOn() }) }, h('span', null, (i + 1) + '. ' + (() => { const q = String(r.item.prompt).split('\n')[0]; return q.length > 56 ? q.slice(0, 55) + '…' : q; })()), h('span', { class: 'chev' }, 'Xem vì sao ›')))) : null;
  const mids = !exam && sm.wrongs.length ? h('p', { class: 'center sub' }, 'Có ' + sm.wrongs.length + ' câu được lưu vào "Ôn câu sai" để luyện lại.') : null;
  screen('result', h('div', { class: 'res-owl' }, owl), h('h2', { class: 'center' }, title), h('div', { class: 'res-score ' + (stars ? 'stars' : '') }, msg), h('p', { class: 'center sub' }, sub), mids, exWrap,
    h('a', { class: 'btn-primary big block', href: back }, 'Tiếp tục'), h('a', { class: 'btn-ghost block', href: again }, 'Làm lại'));
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
  window.addEventListener('hashchange', route);
  route();
  window.__app = { TOPICS: () => TOPICS, store };
}
boot();
