// Cú Mít — linh vật đồng hành (SVG, đổi trạng thái bằng class)
export const LINES = {
  ok: ['Đúng rồi! Giỏi quá!', 'Chuẩn luôn!', 'Tuyệt vời, con làm được rồi!', 'Hay lắm!', 'Cú Mít vỗ cánh tặng con!'],
  retry: ['Chưa đúng, nhưng không sao đâu. Thử lại nhé!', 'Gần đúng rồi, nghĩ thêm chút nữa nào!', 'Mình cùng nhìn lại nhé!'],
  explain: ['Để Cú Mít chỉ cho con nhé.', 'Mình xem từng bước thôi nào.', 'Ai cũng có lúc nhầm, xem vì sao nhé.'],
  hello: ['Chào con! Hôm nay mình ôn một chút nhé.', 'Cùng ôn Toán nào!'],
  rest: ['Con học được một lúc rồi. Nghỉ mắt một chút nhé!'],
};
export function say(kind) { const a = LINES[kind] || ['']; return a[Math.floor(Math.random() * a.length)]; }

export function mascotSVG(state = 'idle') {
  const wrap = document.createElement('div');
  wrap.className = 'owl owl-' + state;
  wrap.innerHTML = `
<svg viewBox="0 0 120 120" role="img" aria-label="Cú Mít" xmlns="http://www.w3.org/2000/svg">
  <g class="owl-body">
    <ellipse cx="60" cy="112" rx="26" ry="4" fill="rgba(0,0,0,.10)"/>
    <path d="M26 40 L34 18 L48 34 Z M94 40 L86 18 L72 34 Z" fill="#E88A1A"/>
    <ellipse cx="60" cy="66" rx="40" ry="44" fill="#FFB84D"/>
    <ellipse cx="60" cy="82" rx="26" ry="26" fill="#FFE8B0"/>
    <g class="owl-wing-l"><ellipse cx="22" cy="72" rx="10" ry="22" fill="#F29A24" transform="rotate(10 22 72)"/></g>
    <g class="owl-wing-r"><ellipse cx="98" cy="72" rx="10" ry="22" fill="#F29A24" transform="rotate(-10 98 72)"/></g>
    <circle cx="44" cy="52" r="16" fill="#fff"/><circle cx="76" cy="52" r="16" fill="#fff"/>
    <g class="owl-eyes"><circle class="pupil" cx="46" cy="53" r="8" fill="#26324B"/><circle class="pupil" cx="74" cy="53" r="8" fill="#26324B"/>
      <circle cx="49" cy="50" r="2.6" fill="#fff"/><circle cx="77" cy="50" r="2.6" fill="#fff"/></g>
    <g class="owl-brows"><path d="M30 34 L54 38" stroke="#7A4A0E" stroke-width="4" stroke-linecap="round"/><path d="M90 34 L66 38" stroke="#7A4A0E" stroke-width="4" stroke-linecap="round"/></g>
    <path d="M60 60 L53 70 L67 70 Z" fill="#FF7A1A"/>
    <path class="owl-smile" d="M50 76 Q60 84 70 76" stroke="#7A4A0E" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g class="owl-cheeks"><circle cx="30" cy="66" r="5" fill="#FF8FA3" opacity=".7"/><circle cx="90" cy="66" r="5" fill="#FF8FA3" opacity=".7"/></g>
    <path d="M46 108 l-4 6 M54 108 l-2 7 M66 108 l2 7 M74 108 l4 6" stroke="#E88A1A" stroke-width="4" stroke-linecap="round"/>
    <g class="owl-sweat"><path d="M100 30 q6 10 0 14 q-6 -4 0 -14z" fill="#7CC8FF"/></g>
    <g class="owl-q"><text x="88" y="20" font-size="22" font-weight="800" fill="#4C6FFF" font-family="system-ui">?</text></g>
    <g class="owl-stars"><text x="6" y="22" font-size="16">⭐</text><text x="94" y="18" font-size="16">✨</text></g>
  </g>
</svg>`;
  return wrap;
}
export function setMascot(el, state) {
  if (!el) return;
  el.className = el.className.replace(/owl-(idle|happy|think|oops|cheer)/g, '').trim() + ' owl-' + state;
}
