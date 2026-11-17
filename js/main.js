// Ứng dụng: bộ định tuyến + các màn hình
import { store } from './core/store.js';
import { h, clear, renderItem, openExplain, toast, speakerBtn } from './core/ui.js';
import { speak, stop as stopSpeech, status as speechStatus, onStatus } from './core/speech.js';
import { mascotSVG, setMascot, say as mascotSay } from './core/mascot.js';
import { loadVisuals, renderVisual, vctx } from './visuals/index.js';
import { loadTopics } from './topics/index.js';
import * as practice from './core/practice.js';
import { prepareItem } from './core/variety.js';
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
let activeLayout = null;
window.addEventListener('resize', () => activeLayout && activeLayout());

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
function applyEye() {
  const m = store.get().settings.eye || 'auto'; const hr = new Date().getHours();
  const on = m === 'on' || (m === 'auto' && (hr >= 18 || hr < 6));
  document.documentElement.classList.toggle('eye', on);
}
const nextTopic = () => TOPICS.find((t) => !store.topic(t.id).stars);

// ---------- Khung màn hình ----------
function screen(cls, ...kids) { clear(app); hideTabs(); const s = h('div', { class: 'screen ' + cls }, ...kids); app.appendChild(s); window.scrollTo(0, 0); return s; }

// ---------- Thanh điều hướng đáy (neo) ----------
const TABS = [['home', '#/', 'map', 'Hành trình'], ['review', '#/review', 'review', 'Ôn sai'], ['exam', '#/exam', 'exam', 'Đề thử'], ['locker', '#/locker', 'shirt', 'Tủ đồ']];
function hideTabs() { const b = document.getElementById('tabbar'); if (b) b.hidden = true; document.body.classList.remove('has-tabbar'); }
function showTabs(active) {
  const sc = app.firstChild; if (sc) sc.classList.add('has-tabs');
  let bar = document.getElementById('tabbar');
  if (!bar) { bar = h('nav', { id: 'tabbar', class: 'tabbar', 'aria-label': 'Điều hướng chính' }); document.body.appendChild(bar); }
  clear(bar); const wr = store.get().wrong.length;
  TABS.forEach(([id, href, ic, label]) => bar.appendChild(h('a', { class: 'tab' + (id === active ? ' on' : ''), href, 'aria-current': id === active ? 'page' : null }, h('span', { class: 'tab-ic' }, icon(ic, 26), id === 'review' && wr ? h('b', null, String(wr)) : null), h('span', { class: 'tab-l' }, label))));
  bar.hidden = false; document.body.classList.add('has-tabbar');
}
function topbar(title, back) {
  return h('header', { class: 'topbar' },
    back ? h('a', { class: 'btn-icon back', href: back, 'aria-label': 'Quay lại' }, icon('back', 22)) : h('span', { class: 'spacer' }),
    h('h1', null, title), h('span', { class: 'spacer' }));
}

// ---------- Trang chủ ----------
const ISLANDS = { 1: 'Rừng Số', 2: 'Hang Làm Tròn', 3: 'Núi Phép Tính', 4: 'Đảo Bội–Ước', 5: 'Thành Hình Học', 6: 'Đỉnh Thử Thách' };
const coinChip = () => h('span', { class: 'coin-chip', role: 'img', 'aria-label': 'Số xu' }, icon('coin', 22), h('b', null, String(store.get().coins)));
const refreshCoins = () => document.querySelectorAll('.coin-chip b').forEach((b) => { b.textContent = String(store.get().coins); });
const mapOpen = new Set(); // các ngày đang mở trên bản đồ

function hud() {
  const st = store.get(); const li = game.levelInfo(st.xp);
  return h('div', { class: 'hud' },
    h('div', { class: 'hud-dino' }, mascotSVG('idle')),
    h('div', { class: 'hud-mid' }, h('div', { class: 'hud-lv' }, 'Lv ' + li.lv + ' · ' + li.title), h('div', { class: 'xp-bar slim', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': li.pct }, h('i', { style: { width: Math.max(5, li.pct) + '%' } }))),
    coinChip(), h('span', { class: 'pill fire sm', title: 'Chuỗi ngày' }, icon('flame', 18), String(st.streak.count || 1)));
}

function questCard() {
  const qs = game.quests(); const ready = game.chestReady(); const claimed = store.get().quests.chest;
  const done = qs.filter((q) => q.have >= q.need).length;
  const rows = qs.map((q) => {
    const ok = q.have >= q.need;
    return h('div', { class: 'q-row' + (ok ? ' done' : '') }, h('span', { class: 'q-dot' }, ok ? icon('check', 16) : null), h('span', { class: 'q-text' }, q.text), h('span', { class: 'q-prog' }, Math.min(q.have, q.need) + '/' + q.need));
  });
  const action = ready
    ? h('button', { class: 'btn-primary big block pulse', type: 'button', onclick: async () => { const ev = game.claimChest(); if (!ev) return; play('win'); confetti({ n: 40 }); refreshCoins(); await celebrate(ev); viewHome(); } }, icon('chest', 26), 'Mở rương +50 xu')
    : claimed ? h('p', { class: 'q-note' }, 'Con đã mở rương hôm nay rồi. Giỏi lắm!') : null;
  return h('details', { class: 'quests', open: ready ? 'open' : null },
    h('summary', { class: 'q-head' }, h('span', { class: 'q-chest' + (ready ? ' ready' : claimed ? ' open' : '') }, icon('chest', 26)),
      h('span', { class: 'q-title' }, h('b', null, 'Nhiệm vụ hôm nay'), h('span', { class: 'q-segs' }, qs.map((q) => h('i', { class: q.have >= q.need ? 'on' : '' })))),
      h('span', { class: 'q-count' }, done + '/' + qs.length), h('span', { class: 'chev q-chev' }, icon('chev', 20))),
    ...rows, action);
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
function dayBody(specs) {
  const XS = [50, 24, 50, 76]; const NH = 156; let y = 6; const pts = []; const els = [];
  specs.forEach((sp, i) => { sp.x = XS[i % 4]; sp.y = y; els.push(mapNode(sp)); pts.push({ x: sp.x, top: y + 2, bottom: y + 132, done: !!sp.done }); y += NH; });
  const H = y + 4; let segs = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const A = pts[i], B = pts[i + 1], m = (A.bottom + B.top) / 2;
    segs += '<path d="M' + A.x + ' ' + A.bottom + ' C' + A.x + ' ' + m + ' ' + B.x + ' ' + m + ' ' + B.x + ' ' + B.top + '" class="' + (A.done ? 'seg done' : 'seg') + '"/>';
  }
  return h('div', { class: 'mday-b', style: 'height:' + H + 'px' }, h('div', { class: 'map-path', html: '<svg viewBox="0 0 100 ' + H + '" preserveAspectRatio="none" aria-hidden="true">' + segs + '</svg>' }), ...els);
}
function buildMap(today, nt) {
  if (!mapOpen.size) mapOpen.add(nt ? nt.day : 6);
  const wrap = h('div', { class: 'mapx' });
  const section = (d, specs, doneN) => {
    const open = mapOpen.has(d);
    const dots = h('span', { class: 'dot-row' }, specs.map((sp) => h('i', { class: sp.done ? 'on' : '' })));
    const sec = h('section', { class: 'mday' + (open ? ' open' : '') + (d === today ? ' today' : '') });
    const head = h('button', { class: 'mday-h', type: 'button', 'aria-expanded': open ? 'true' : 'false', onclick: () => { const o = !sec.classList.contains('open'); sec.classList.toggle('open', o); head.setAttribute('aria-expanded', o ? 'true' : 'false'); if (o) mapOpen.add(d); else mapOpen.delete(d); } },
      h('span', { class: 'mb-n' }, d === 6 ? icon('flag', 18) : String(d)),
      h('span', { class: 'mday-t' }, h('b', null, (d < 6 ? 'Ngày ' + d + ' · ' : '') + ISLANDS[d]), h('small', null, d === today ? h('span', { class: 'tag' }, 'Hôm nay') : null, d < 6 ? doneN + '/' + specs.length + ' trạm' : 'Ôn sai · đề thử'), dots),
      h('span', { class: 'chev mday-chev' }, icon('chev', 20)));
    sec.append(head, dayBody(specs)); return sec;
  };
  for (let d = 1; d <= 5; d++) {
    const ts = dayOf(d); if (!ts.length) continue;
    const specs = ts.map((t) => { const g = groupOf(t.no); const rec = store.topic(t.id); return { href: '#/topic/' + t.id, inner: topicIcon(t.no, 46), label: 'CĐ' + t.no + ' · ' + (t.short || t.title), stars: rec.stars || 0, done: rec.stars > 0, current: !!nt && nt.id === t.id, vars: '--nc:' + g.c + ';--ns:' + g.soft }; });
    wrap.appendChild(section(d, specs, specs.filter((x) => x.done).length));
  }
  const wr = store.get().wrong.length;
  wrap.appendChild(section(6, [
    { href: '#/review', kind: 'review', inner: icon('review', 34), label: 'Ôn câu sai' + (wr ? ' (' + wr + ')' : ''), vars: '--nc:#EC7468;--ns:#FFE9E5;color:#C24A42' },
    { href: '#/exam', kind: 'boss', inner: icon('exam', 40), label: 'Trận cuối: Đề thử', current: !nt, vars: '--nc:#8B6CF0;--ns:#EEE9FF' }], 0));
  return wrap;
}

function viewHome() {
  const st = store.get(); store.touchDay();
  const sp = speechStatus();
  const today = todayNo();
  const doneN = TOPICS.filter((t) => store.topic(t.id).stars > 0).length;
  const nt = nextTopic();
  const hero = h('a', { class: 'hero cta', href: nt ? '#/topic/' + nt.id : '#/exam' },
    h('div', { class: 'hero-owl' }, mascotSVG(game.chestReady() ? 'cheer' : 'wave')),
    h('div', { class: 'hero-text' }, h('div', { class: 'hello' }, 'Chào con!'), h('div', { class: 'sub' }, nt ? (doneN ? 'Mít chờ con ở trạm tiếp theo:' : 'Mình bắt đầu hành trình nhé:') : 'Con đã đi hết các trạm. Đánh trận cuối nào:'),
      h('div', { class: 'cta-title' }, nt ? 'CĐ' + nt.no + ' · ' + nt.title : 'Trận cuối: Đề thử')),
    h('span', { class: 'cta-go' }, icon('play', 28)));
  const note = (!sp.supported || !sp.hasVietnamese) ? h('div', { class: 'note' }, 'Máy này chưa có giọng đọc tiếng Việt. Con vẫn học được nhờ chữ và hình nhé. Bố mẹ có thể bật giọng tiếng Việt trong Cài đặt → Trợ năng → Nội dung được đọc.') : null;
  const settings = h('details', { class: 'settings' }, h('summary', null, icon('sliders', 22), 'Cài đặt'),
    h('div', { class: 'set-label' }, 'Dịu mắt (ấm màu, bớt chói)'),
    h('div', { class: 'radio-row' }, [['auto', 'Tự động buổi tối'], ['on', 'Luôn bật'], ['off', 'Tắt']].map(([v, t]) => h('label', null, h('input', { type: 'radio', name: 'eye', value: v, checked: (st.settings.eye || 'auto') === v ? 'checked' : null, onchange: () => { store.setSetting('eye', v); applyEye(); } }), h('span', null, t)))),
    h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: st.settings.sound !== false ? 'checked' : null, onchange: (e) => { store.setSetting('sound', e.target.checked); if (e.target.checked) play('correct'); } }), 'Âm thanh vui nhộn'),
    h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: voiceOn() ? 'checked' : null, onchange: (e) => { store.setSetting('voice', e.target.checked); } }), 'Tự động đọc lời giải'),
    h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: vctx.reduced ? 'checked' : null, onchange: (e) => { vctx.reduced = e.target.checked; vctx.lite = e.target.checked; store.setSetting('lite', e.target.checked); } }), 'Giảm hiệu ứng chuyển động'),
    h('button', { class: 'btn-ghost small', type: 'button', onclick: () => { if (confirm('Xoá toàn bộ tiến độ?')) { store.reset(); viewHome(); } } }, 'Xoá tiến độ'));
  screen('home', hud(), note, hero, questCard(),
    h('div', { class: 'map-head' }, h('h2', { class: 'sec' }, 'Hành trình của Mít'), h('span', { class: 'map-count' }, doneN + '/' + TOPICS.length + ' trạm')),
    buildMap(today, nt), settings, h('footer', { class: 'foot' }, 'Chúc con ôn tập vui và thi thật tốt!'));
  showTabs('home');
}

// ---------- Ngày ----------
function viewDay(n) {
  n = Number(n);
  if (n === 6) return viewFinalDay();
  const ts = dayOf(n);
  const list = h('div', { class: 'topics' }, ts.length ? ts.map((t) => topicCard(t)) : h('p', { class: 'note' }, 'Nội dung ngày này đang được chuẩn bị.'));
  screen('dayview', topbar('Ngày ' + n, '#/'), h('p', { class: 'lead' }, DAY_TITLES[n]), list);
  showTabs('home');
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
      h('a', { class: 'tcard', href: '#/review' }, tile('#FFE9E5', '#C24A42', 'review'), h('div', { class: 'tbody' }, h('div', { class: 'tt' }, 'Ôn câu sai'), h('div', { class: 'ts' }, store.get().wrong.length + ' câu đang chờ con')), h('span', { class: 'chev' }, icon('chev', 22))),
      h('a', { class: 'tcard', href: '#/exam' }, tile('#EEE9FF', '#6C4FD0', 'exam'), h('div', { class: 'tbody' }, h('div', { class: 'tt' }, 'Đề thử 20 câu'), h('div', { class: 'ts' }, 'Làm xong mới xem đáp án. Không bị trừ gì cả!')), h('span', { class: 'chev' }, icon('chev', 22)))));
}

// ---------- Tủ đồ & huy hiệu ----------
let lockerTab = 'items';
function viewLocker() {
  const st = store.get(); const eq = st.wardrobe.equipped || {}; const own = game.owned();
  const prev = h('div', { class: 'lk-prev' }, mascotSVG('happy'));
  const items = h('div', { class: 'lk-grid' }, game.ITEMS.map((it) => {
    const has = own.includes(it.id); const on = eq[it.slot] === it.id;
    return h('button', { class: 'lk-item' + (on ? ' on' : '') + (has ? '' : ' locked'), type: 'button', disabled: has ? null : 'disabled', onclick: () => { game.equip(it.id); play('tap'); viewLocker(); } },
      h('div', { class: 'lk-mini' }, mascotSVG('idle', { equip: { [it.slot]: it.id } }), has ? null : h('span', { class: 'lk-lock' }, icon('lock', 26))),
      h('div', { class: 'lk-name' }, it.name), h('div', { class: 'lk-sub' }, has ? (on ? 'Đang mặc' : 'Chạm để mặc') : it.need));
  }));
  const badges = h('div', { class: 'bd-grid' }, game.BADGES.map((b) => {
    const has = (st.badges || []).includes(b.id);
    return h('div', { class: 'bd' + (has ? ' has' : '') }, h('span', { class: 'bd-ic', style: '--bc:' + b.color }, icon(has ? b.icon : 'lock', 28)), h('div', null, h('div', { class: 'bd-n' }, b.name), h('div', { class: 'bd-d' }, b.desc)));
  }));
  const li = game.levelInfo(st.xp);
  const tab = (id, label) => h('button', { class: 'seg-tab' + (lockerTab === id ? ' on' : ''), type: 'button', role: 'tab', 'aria-selected': lockerTab === id ? 'true' : 'false', onclick: () => { lockerTab = id; viewLocker(); } }, label);
  screen('locker', topbar('Tủ đồ của Mít', '#/'),
    h('div', { class: 'lk-top' }, prev, h('div', { class: 'lk-info' }, h('div', { class: 'lv-chip dark' }, 'Lv ' + li.lv + ' · ' + li.title), coinChip(), h('p', { class: 'sub' }, 'Đồ mới mở khoá khi con lên cấp hoặc giỏi ở đề thử.'))),
    h('div', { class: 'seg-tabs', role: 'tablist' }, tab('items', 'Phụ kiện'), tab('badges', 'Huy hiệu ' + (st.badges || []).length + '/' + game.BADGES.length)),
    lockerTab === 'items' ? items : badges);
  showTabs('locker');
}

// ---------- Học chủ đề ----------
function viewTopic(id) {
  const t = TOPICS.find((x) => x.id === id);
  if (!t) return viewHome();
  const rec = store.topic(id);
  const g = groupOf(t.no);
  const rem = t.remember || [];
  const cards = h('div', { class: 'cards', tabindex: '0', 'aria-label': 'Điều cần nhớ, vuốt ngang để xem tiếp' }, rem.map((r, i) =>
    h('div', { class: 'rcard' }, h('div', { class: 'rnum', style: '--g:' + g.c }, i + 1), h('div', { class: 'rbody' }, h('p', null, r.text), r.visual ? h('div', { class: 'rvis' }, renderVisual(r.visual)) : null), speakerBtn(() => r.say || r.text))));
  const dots = h('div', { class: 'cdots', 'aria-hidden': 'true' }, rem.map((_, i) => h('i', { class: i === 0 ? 'on' : '' })));
  const count = h('span', { class: 'ccount' }, '1/' + rem.length);
  const sync = () => { const first = cards.firstChild; if (!first) return; const step = first.offsetWidth + 12; const i = Math.max(0, Math.min(rem.length - 1, Math.round(cards.scrollLeft / step))); [...dots.children].forEach((d, j) => d.classList.toggle('on', j === i)); count.textContent = (i + 1) + '/' + rem.length; };
  cards.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  const goto = (i) => { const first = cards.firstChild; if (first) cards.scrollTo({ left: i * (first.offsetWidth + 12), behavior: vctx.reduced ? 'auto' : 'smooth' }); };
  [...dots.children].forEach((d, i) => d.addEventListener('click', () => goto(i)));
  const ti = topicIcon(t.no, 56); ti.classList.add('big');
  const lessonBtn = (t.lesson && t.lesson.length) ? h('button', { class: 'btn-secondary', type: 'button', onclick: () => { const first = !rec.learned; rec.learned = true; store.save(); const ev = game.onLearned(first); openExplain({ title: 'Bài giảng', steps: t.lesson, voice: voiceOn(), finishLabel: 'Xong', mascot: 'wave', onClose: () => celebrate(ev) }); } }, icon('film', 24), 'Bài giảng') : null;
  screen('topic', topbar('CĐ' + t.no + ' · ' + (t.short || t.title), '#/'),
    h('div', { class: 'thead', style: '--tile:' + g.soft + ';--ink:' + g.ink }, ti, h('div', null, h('div', { class: 'chip-g' }, g.name), h('h2', null, t.title), starsRow(rec.stars || 0, 22))),
    (rec.tries || 0) > 0 ? h('p', { class: 'fresh-note' }, icon('star', 16), 'Mỗi lần luyện là bài mới, số khác. Con cứ thử nhé!') : null,
    h('div', { class: 'sec-row' }, h('h3', { class: 'sec' }, 'Điều cần nhớ'), rem.length > 1 ? dots : null), cards,
    h('div', { class: 'actionbar' }, lessonBtn, h('a', { class: 'btn-primary', href: '#/practice/' + id }, icon('pencil', 24), 'Luyện tập')));
}

// ---------- Phiên luyện tập ----------
function buildTopicQueue(t) { return practice.queueFor(t); }

function startSession(opts) {
  // opts: {title, back, queue, mode: 'practice'|'review'|'exam', onFinish(summary)}
  const S = { queue: opts.queue.slice(), idx: 0, firstTry: 0, total: 0, wrongs: [], results: [], mode: opts.mode || 'practice' };
  const mode = S.mode;
  const wrap = h('div', { class: 'screen practice' });
  clear(app); hideTabs(); app.appendChild(wrap);
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
    const shown = prepareItem(item); // xáo thứ tự lựa chọn/thẻ mỗi lần: không nhớ vị trí đáp án
    window.__cur = shown;
    ctl = renderItem(shown);
    const owlBox = h('div', { class: 'fb-owl' }, mascotSVG('idle'));
    let pendingEv = null;
    function layout() {
      const dock = wrap.querySelector('.np-dock'); const fbh = fb.hidden ? 0 : fb.offsetHeight;
      const dh = dock && getComputedStyle(dock).position === 'fixed' ? dock.offsetHeight : 0;
      wrap.style.setProperty('--dock-h', dh + 'px'); wrap.style.setProperty('--fb-h', fbh + 'px');
      // bàn phím cố định + khung phản hồi chiếm chỗ: tự cuộn để ô đang điền không bị che
      if (dh && !fb.hidden) {
        const cell = wrap.querySelector('.col-grid button.active, .slot.active');
        if (cell) { const r = cell.getBoundingClientRect(); const limit = innerHeight - (parseFloat(getComputedStyle(wrap).getPropertyValue('--bar-h')) || 84) - dh - fbh - 12; if (r.bottom > limit) window.scrollBy({ top: r.bottom - limit + 8, behavior: 'auto' }); }
      }
    }
    activeLayout = layout;
    const fbText = h('div', { class: 'fb-text' });
    const fb = h('div', { class: 'feedback', hidden: true }, owlBox, fbText);
    const btnMain = h('button', { class: 'btn-primary big', type: 'button', disabled: true }, mode === 'exam' ? 'Trả lời' : 'Kiểm tra');
    const btnSide = h('button', { class: 'btn-ghost', type: 'button', hidden: true }, 'Xem vì sao');
    const bar = h('div', { class: 'actionbar' }, btnSide, btnMain);
    ctl.onReady((r) => { if (!locked || phase === 'retry') btnMain.disabled = !r; });
    let phase = 'ask';
    const owl = () => owlBox.firstChild;
    const showFb = (cls, state, title, body) => { fb.hidden = false; fb.className = 'feedback ' + cls; setMascot(owl(), state); clear(fbText); fbText.append(h('b', null, title), body ? h('div', { class: 'fb-why' }, body) : null); requestAnimationFrame(layout); };

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
        if (canSim) { const sim = practice.similarFor(t, item); if (sim) { S.queue.splice(S.idx + 1, 0, sim); } }
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
          showFb('warn', 'encourage', mascotSay('retry'), item.type === 'column' && res.why ? res.why : item.hint ? 'Gợi ý: ' + item.hint : 'Đọc lại đề thật kỹ, rồi chọn lại nhé.');
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
    window.scrollTo(0, 0); requestAnimationFrame(layout);
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
  const items = st.wrong.map((r) => practice.resolveReview(TOPICS, r)).filter(Boolean);
  if (!items.length) {
    const owl = mascotSVG('happy');
    screen('result', topbar('Ôn câu sai', '#/'), h('div', { class: 'res-owl' }, owl), h('h2', { class: 'center' }, 'Không có câu sai nào!'), h('p', { class: 'center sub' }, 'Con hãy luyện thêm các chủ đề rồi quay lại nhé.'), h('a', { class: 'btn-primary big block', href: '#/' }, 'Về trang chủ')), showTabs('review');
    showTabs('review'); return;
  }
  startSession({ mode: 'review', queue: items, back: '#/', onFinish: (sm) => viewResult({ title: 'Ôn câu sai', sm, stars: null, rw: null, back: '#/', again: '#/review' }) });
}

function viewExamIntro() {
  const st = store.get();
  screen('result', topbar('Đề thử', '#/'), h('div', { class: 'res-owl' }, mascotSVG('think')), h('h2', { class: 'center' }, 'Đề thử 20 câu'),
    h('ul', { class: 'rules' }, h('li', null, 'Gồm 20 câu trộn từ các chủ đề đã học.'), h('li', null, 'Làm xong mới xem đáp án và lời giải.'), h('li', null, 'Sai không bị trừ xu hay sao. Con cứ thử nhé!')),
    st.exam.best ? h('p', { class: 'center sub' }, 'Điểm cao nhất của con: ' + st.exam.best + '/20') : null,
    h('a', { class: 'btn-primary big block', href: '#/exam/go' }, 'Bắt đầu'));
  showTabs('exam');
}

function viewExam() {
  const st = store.get(); st.exam.tries++;
  const rng = seeded(Date.now() % 1e9);
  const queue = practice.examQueue(TOPICS, rng);
  if (!queue.length) return viewHome();
  startSession({
    mode: 'exam', queue, back: '#/',
    onFinish: (sm) => {
      const correct = sm.results.filter((r) => r.correct).length;
      st.exam.best = Math.max(st.exam.best || 0, correct); store.save();
      const rw = game.onExamDone(correct);
      viewResult({ title: 'Đề thử', sm, stars: null, rw, back: '#/', again: '#/exam/go', exam: { correct, total: sm.results.length } });
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
  stopSpeech(); applyEye();
  const [, a, b] = (location.hash || '#/').split('/');
  try {
    if (!a) return viewHome();
    if (a === 'day') return viewDay(b);
    if (a === 'topic') return viewTopic(b);
    if (a === 'practice') return viewPractice(b);
    if (a === 'review') return viewReview();
    if (a === 'exam') return b === 'go' ? viewExam() : viewExamIntro();
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
