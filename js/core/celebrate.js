// Popup chúc mừng: lên cấp, huy hiệu mới, mở khoá phụ kiện, nhắc nghỉ. Có pháo giấy + âm thanh.
import { h, toast } from './ui.js';
import { mascotSVG } from './mascot.js';
import { icon } from './icons.js';
import { confetti } from './fx.js';
import { play } from './sfx.js';
import { TITLES, equip } from './game.js';

export function mascotPopup({ state = 'cheer', title, text, content, buttons, equipPreview, sound, burst = true }) {
  return new Promise((resolve) => {
    const ov = h('div', { class: 'pop-ov', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
    const close = (v) => { ov.classList.remove('open'); setTimeout(() => ov.remove(), 200); document.body.classList.remove('no-scroll'); resolve(v); };
    const btns = (buttons || [{ label: 'Tuyệt vời!', value: 'ok', primary: true }]).map((b) => h('button', { class: b.primary === false ? 'btn-ghost' : 'btn-primary big', type: 'button', onclick: () => close(b.value) }, b.label));
    ov.appendChild(h('div', { class: 'pop' }, h('div', { class: 'pop-dino' }, mascotSVG(state, equipPreview ? { equip: equipPreview } : undefined)), h('h2', null, title), text ? h('p', { class: 'pop-text' }, text) : null, content || null, h('div', { class: 'pop-btns' }, btns)));
    document.body.appendChild(ov); document.body.classList.add('no-scroll');
    requestAnimationFrame(() => ov.classList.add('open'));
    if (sound) play(sound);
    if (burst) setTimeout(() => confetti({ y: innerHeight * 0.33, n: 38 }), 180);
  });
}

// ev: kết quả từ game.js (levelUp, badges, items, quests)
export async function celebrate(ev) {
  if (!ev) return;
  (ev.quests || []).forEach((q, i) => setTimeout(() => { toast('Xong nhiệm vụ: ' + q.text, 3200); play('badge'); }, 300 + i * 400));
  if (ev.levelUp) {
    await mascotPopup({ state: 'win', sound: 'levelup', title: 'Lên cấp ' + ev.levelUp + '!', text: 'Danh hiệu mới: ' + TITLES[Math.min(ev.levelUp - 1, TITLES.length - 1)],
      content: h('div', { class: 'pop-lv' }, 'Lv ' + ev.levelUp) });
  }
  for (const b of ev.badges || []) {
    await mascotPopup({ state: 'proud', sound: 'badge', title: 'Huy hiệu mới!', text: b.name + ' · ' + b.desc,
      content: h('div', { class: 'pop-badge', style: '--bc:' + b.color }, icon(b.icon, 44)) });
  }
  for (const it of ev.items || []) {
    const r = await mascotPopup({ state: 'cheer', sound: 'badge', title: 'Đồ mới cho Mít!', text: it.name, equipPreview: { [it.slot]: it.id },
      buttons: [{ label: 'Mặc ngay', value: 'equip', primary: true }, { label: 'Để sau', value: 'later', primary: false }] });
    if (r === 'equip') equip(it.id);
  }
}
