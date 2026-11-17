// Mít — chú khủng long nhỏ đi thám hiểm (linh vật). SVG nhiều bộ phận: đổi cảm xúc bằng class, đeo phụ kiện.
import { store } from './store.js';

export const LINES = {
  ok: ['Đúng rồi! Giỏi quá!', 'Chuẩn luôn!', 'Con làm được rồi!', 'Hay lắm, bạn nhỏ!', 'Mít giơ tay khen con!', 'Tuyệt cú mèo!'],
  combo: ['Liên tiếp luôn! Quá đỉnh!', 'Cháy quá! Cứ thế nào!', 'Con đang bay cao rồi!'],
  retry: ['Chưa đúng, không sao đâu. Cố lên nào!', 'Gần đúng rồi, nghĩ thêm chút nữa!', 'Mít tin con làm được!'],
  explain: ['Để Mít chỉ cho con nhé.', 'Mình cùng xem từng bước nào.', 'Ai cũng có lúc nhầm. Xem vì sao nhé!'],
  hello: ['Chào con! Mình cùng thám hiểm nào!', 'Sẵn sàng chưa? Đi thôi!'],
  rest: ['Con học được một lúc rồi. Nghỉ mắt một chút nhé!'],
  levelup: ['Lên cấp rồi! Con giỏi quá!'],
};
export function say(kind) { const a = LINES[kind] || ['']; return a[Math.floor(Math.random() * a.length)]; }

export const STATES = ['idle', 'wave', 'happy', 'cheer', 'proud', 'think', 'encourage', 'wow', 'sleepy', 'win'];

const SVG = `
<svg viewBox="0 -26 160 196" role="img" aria-label="Mít, chú khủng long" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="mt-body" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#66DFA2"/><stop offset="1" stop-color="#38BE80"/></radialGradient>
  </defs>
  <ellipse class="m-shadow" cx="80" cy="162" rx="42" ry="6" fill="rgba(35,48,73,.14)"/>
  <g class="m-all">
    <!-- áo choàng (phía sau) -->
    <g class="acc acc-cape"><path d="M40 108 Q80 116 120 108 L152 164 Q80 144 8 164 Z" fill="#EC7468"/><path d="M40 108 Q80 120 120 108 L128 128 Q80 138 32 128Z" fill="#C9524A" opacity=".5"/></g>
    <!-- đuôi -->
    <g class="m-tail">
      <path d="M116 134 C146 140 160 118 152 94 C150 110 138 120 118 118 Z" fill="#2FA872"/>
      <path d="M140 124 l8 -6 -2 11z M148 108 l8 -4 -4 11z" fill="#F5893A"/>
    </g>
    <g class="m-body">
      <!-- chân -->
      <g class="m-feet"><ellipse cx="60" cy="154" rx="19" ry="10" fill="#2FA872"/><ellipse cx="100" cy="154" rx="19" ry="10" fill="#2FA872"/>
        <path d="M50 158v-4M58 160v-5M66 158v-4M90 158v-4M98 160v-5M106 158v-4" stroke="#1F8458" stroke-width="2.4" stroke-linecap="round"/></g>
      <!-- thân + đầu -->
      <ellipse cx="80" cy="98" rx="56" ry="58" fill="url(#mt-body)"/>
      <ellipse cx="80" cy="130" rx="32" ry="24" fill="#E9FAF1"/>
      <path d="M58 122h44M62 132h36M68 142h24" stroke="#CDEFDD" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>
      <!-- huy chương -->
      <g class="acc acc-medal"><path d="M68 122 L80 140 L92 122" fill="none" stroke="#4F6BED" stroke-width="5.5" stroke-linejoin="round"/><circle cx="80" cy="146" r="10" fill="#F7BE2C" stroke="#D9A00F" stroke-width="2.5"/><path d="M80 139.5l2.6 5 5.4.7-4 3.7 1 5.4-5-2.6-5 2.6 1-5.4-4-3.7 5.4-.7z" fill="#fff" opacity=".95"/></g>
      <!-- tay trái -->
      <g class="m-arm-l"><ellipse cx="26" cy="122" rx="10" ry="16" fill="#2FA872" transform="rotate(18 26 122)"/><circle cx="21" cy="136" r="5" fill="#1F8458" opacity=".0"/></g>
      <!-- tay phải -->
      <g class="m-arm-r"><ellipse cx="134" cy="122" rx="10" ry="16" fill="#2FA872" transform="rotate(-18 134 122)"/><ellipse class="m-thumb" cx="143" cy="134" rx="4.5" ry="7" fill="#2FA872" transform="rotate(-24 143 134)"/></g>

      <!-- mặt -->
      <ellipse cx="40" cy="102" rx="9" ry="6" fill="#F6A9A0" class="m-cheek"/><ellipse cx="120" cy="102" rx="9" ry="6" fill="#F6A9A0" class="m-cheek"/>
      <!-- mũi dài kiểu khủng long -->
      <ellipse cx="80" cy="106" rx="27" ry="18" fill="#A6EBC8"/>
      <circle cx="71" cy="99" r="2.6" fill="#1F8458"/><circle cx="89" cy="99" r="2.6" fill="#1F8458"/>
      <!-- mắt -->
      <g class="m-eyes e-normal"><ellipse cx="58" cy="78" rx="16" ry="18" fill="#fff"/><ellipse cx="102" cy="78" rx="16" ry="18" fill="#fff"/>
        <g class="m-pupils"><circle cx="60" cy="81" r="10" fill="#263250"/><circle cx="100" cy="81" r="10" fill="#263250"/><circle cx="64" cy="76" r="3.6" fill="#fff"/><circle cx="104" cy="76" r="3.6" fill="#fff"/><circle cx="57" cy="85" r="1.8" fill="#fff" opacity=".8"/><circle cx="97" cy="85" r="1.8" fill="#fff" opacity=".8"/></g></g>
      <g class="m-eyes e-happy"><path d="M43 82 Q58 62 73 82" stroke="#263250" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M87 82 Q102 62 117 82" stroke="#263250" stroke-width="6" fill="none" stroke-linecap="round"/></g>
      <g class="m-eyes e-wow"><ellipse cx="58" cy="78" rx="17" ry="20" fill="#fff"/><ellipse cx="102" cy="78" rx="17" ry="20" fill="#fff"/><circle cx="58" cy="79" r="6.5" fill="#263250"/><circle cx="102" cy="79" r="6.5" fill="#263250"/><circle cx="60" cy="76" r="2.4" fill="#fff"/><circle cx="104" cy="76" r="2.4" fill="#fff"/></g>
      <g class="m-eyes e-sleepy"><path d="M43 80 Q58 90 73 80" stroke="#263250" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="M87 80 Q102 90 117 80" stroke="#263250" stroke-width="5.5" fill="none" stroke-linecap="round"/></g>
      <g class="m-brows"><path d="M42 58 L72 66" stroke="#17593A" stroke-width="5.5" stroke-linecap="round"/><path d="M118 58 L88 66" stroke="#17593A" stroke-width="5.5" stroke-linecap="round"/></g>
      <!-- miệng -->
      <path class="m-mouth m-smile" d="M64 112 Q80 124 96 112" stroke="#17593A" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g class="m-mouth m-grin"><path d="M62 110 Q80 138 98 110 Z" fill="#8A2E28" stroke="#17593A" stroke-width="3" stroke-linejoin="round"/><path d="M66 111 Q80 118 94 111 L92 114 Q80 120 68 114Z" fill="#fff"/><ellipse cx="80" cy="124" rx="9" ry="5.5" fill="#F28B82"/></g>
      <ellipse class="m-mouth m-oh" cx="80" cy="117" rx="7" ry="9" fill="#8A2E28" stroke="#17593A" stroke-width="3"/>
      <path class="m-mouth m-flat" d="M68 115 Q80 117 92 114" stroke="#17593A" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path class="m-mouth m-sleep" d="M72 114 Q80 119 88 114" stroke="#17593A" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- kính râm -->
      <g class="acc acc-glasses"><rect x="36" y="64" width="40" height="28" rx="12" fill="#263250"/><rect x="84" y="64" width="40" height="28" rx="12" fill="#263250"/><path d="M76 74h8" stroke="#263250" stroke-width="4"/><path d="M42 70l12-2M90 70l12-2" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/></g>
      <!-- mũ lưỡi trai -->
      <g class="m-cap"><path d="M36 58 Q38 18 80 16 Q122 18 124 58 Q80 48 36 58Z" fill="#4F6BED"/>
        <path d="M36 58 Q80 48 124 58 Q132 68 118 68 Q80 58 42 68 Q28 68 36 58Z" fill="#3A52C4"/>
        <path d="M80 26l3 6.3 6.9.9-5 4.8 1.2 6.8-6.1-3.3-6.1 3.3 1.2-6.8-5-4.8 6.9-.9z" fill="#fff"/></g>
      <!-- băng đô ninja -->
      <g class="acc acc-band"><path d="M30 56 Q80 42 130 56 L130 70 Q80 56 30 70Z" fill="#EC7468"/><path d="M122 62 l24 -8 -6 12 12 6 -26 2z" fill="#C9524A"/><path d="M70 56 l20 -2 0 12 -20 2z" fill="#E1E6F0"/><path d="M76 59l8-.8M76 63l8-.8" stroke="#8E99B2" stroke-width="1.6"/></g>
    </g>
  </g>
  <!-- hiệu ứng -->
  <g class="fx fx-q"><circle cx="128" cy="-6" r="15" fill="#fff" stroke="#4F6BED" stroke-width="3.5"/><text x="128" y="0" text-anchor="middle" font-size="22" font-weight="800" fill="#4F6BED" font-family="Baloo 2,Nunito,system-ui,sans-serif">?</text></g>
  <g class="fx fx-bulb"><circle cx="132" cy="-4" r="13" fill="#FBDF86" stroke="#D9A00F" stroke-width="3"/><path d="M127 8h10M129 12h6" stroke="#D9A00F" stroke-width="3" stroke-linecap="round"/><path d="M132 -24v-6M116 -18l-4 -4M148 -18l4 -4M112 -4h-6M152 -4h6" stroke="#F7BE2C" stroke-width="3" stroke-linecap="round"/></g>
  <g class="fx fx-stars" fill="#F7BE2C"><path d="M20 20l3 6.4 7 .8-5.2 4.8 1.4 6.9-6.2-3.4-6.2 3.4 1.4-6.9L10 27.2l7-.8z"/><path d="M142 10l2.4 5 5.4.7-4 3.7 1 5.3-4.8-2.6-4.8 2.6 1-5.3-4-3.7 5.4-.7z"/><path d="M146 52l1.8 3.7 4 .5-3 2.8.8 4-3.6-2-3.6 2 .8-4-3-2.8 4-.5z"/><path d="M14 56l1.8 3.7 4 .5-3 2.8.8 4-3.6-2-3.6 2 .8-4-3-2.8 4-.5z"/></g>
  <g class="fx fx-spark" stroke="#F7BE2C" stroke-width="4" stroke-linecap="round"><path d="M146 46l8-4M148 60l9 0M144 74l8 5"/></g>
  <g class="fx fx-zzz" fill="#5D6985" font-family="Baloo 2,Nunito,system-ui,sans-serif" font-weight="800"><text x="118" y="14" font-size="22">Z</text><text x="134" y="-4" font-size="17">z</text><text x="146" y="-16" font-size="13">z</text></g>
  <g class="fx fx-trophy"><path d="M66 -24h28v14a14 14 0 0 1-28 0z" fill="#F7BE2C" stroke="#D9A00F" stroke-width="3"/><path d="M66 -20h-9a8 8 0 0 0 9 12M94 -20h9a8 8 0 0 1-9 12" fill="none" stroke="#D9A00F" stroke-width="3"/><path d="M80 4v8M72 14h16" stroke="#D9A00F" stroke-width="4" stroke-linecap="round"/></g>
</svg>`;

export function mascotSVG(state = 'idle', opts = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'dino dino-' + state;
  wrap.innerHTML = SVG;
  applyEquip(wrap, opts.equip || (store.get().wardrobe && store.get().wardrobe.equipped) || {});
  return wrap;
}
export function applyEquip(el, equip = {}) {
  const on = (cls, v) => el.classList.toggle(cls, !!v);
  on('has-cape', equip.back === 'cape'); on('has-glasses', equip.face === 'glasses');
  on('has-band', equip.head === 'band'); on('has-medal', equip.neck === 'medal');
}
export function setMascot(el, state) {
  if (!el) return;
  el.className = el.className.replace(/dino-(idle|wave|happy|cheer|proud|think|encourage|wow|sleepy|win)/g, '').trim() + ' dino-' + state;
}
