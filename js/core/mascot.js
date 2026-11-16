// Cú Mít — linh vật đồng hành (SVG, đổi trạng thái bằng class)
export const LINES = {
  ok: ['Đúng rồi! Giỏi quá!', 'Chuẩn luôn!', 'Tuyệt vời, con làm được rồi!', 'Hay lắm!', 'Cú Mít vỗ cánh khen con!'],
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
<svg viewBox="0 0 120 124" role="img" aria-label="Cú Mít" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="60" cy="118" rx="28" ry="4.5" fill="rgba(38,50,75,.12)"/>
  <g class="owl-body">
    <!-- chân -->
    <path d="M47 108v6M55 109v6M65 109v6M73 108v6" stroke="#F08A1C" stroke-width="4.5" stroke-linecap="round"/>
    <!-- cánh -->
    <g class="owl-wing-l"><path d="M24 62c-9 6-12 22-6 34 6-1 13-8 15-20z" fill="#F29A24"/></g>
    <g class="owl-wing-r"><path d="M96 62c9 6 12 22 6 34-6-1-13-8-15-20z" fill="#F29A24"/></g>
    <!-- thân + bụng -->
    <path d="M60 30c-22 0-38 16-38 40 0 22 16 38 38 38s38-16 38-38c0-24-16-40-38-40z" fill="#FFB84D"/>
    <path d="M60 66c-15 0-25 11-25 25 0 10 10 17 25 17s25-7 25-17c0-14-10-25-25-25z" fill="#FFEBBF"/>
    <path d="M47 84q4 4 8 0M59 84q4 4 8 0M53 94q4 4 8 0" stroke="#F6C978" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <!-- mắt -->
    <circle cx="44" cy="58" r="17" fill="#fff"/><circle cx="76" cy="58" r="17" fill="#fff"/>
    <g class="owl-eyes">
      <circle class="pupil" cx="45" cy="59" r="9" fill="#26324B"/><circle class="pupil" cx="75" cy="59" r="9" fill="#26324B"/>
      <circle cx="48.5" cy="55.5" r="3.2" fill="#fff"/><circle cx="78.5" cy="55.5" r="3.2" fill="#fff"/>
    </g>
    <g class="owl-eyes-happy"><path d="M33 61q11-15 22 0M65 61q11-15 22 0" stroke="#26324B" stroke-width="5" fill="none" stroke-linecap="round"/></g>
    <g class="owl-brows-worry"><path d="M30 38l20 5M90 38l-20 5" stroke="#8A5410" stroke-width="4" stroke-linecap="round"/></g>
    <!-- mỏ + miệng -->
    <path d="M60 68l-7 9q7 5 14 0z" fill="#FF7A1A"/>
    <path class="owl-smile" d="M51 82q9 7 18 0" stroke="#8A5410" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path class="owl-frown" d="M52 85q8-5 16 0" stroke="#8A5410" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g class="owl-cheeks"><circle cx="29" cy="73" r="6" fill="#FF8FA3" opacity=".65"/><circle cx="91" cy="73" r="6" fill="#FF8FA3" opacity=".65"/></g>
    <!-- mũ cử nhân -->
    <path d="M42 30v9q18 9 36 0v-9q-18 7-36 0z" fill="#3652D9"/>
    <path d="M60 11L97 24 60 37 23 24z" fill="#4C6FFF"/>
    <path d="M60 11L97 24 60 37" fill="none" stroke="#3652D9" stroke-width="1.5" opacity=".5"/>
    <path d="M90 26v13" stroke="#FFC531" stroke-width="3" stroke-linecap="round"/><circle cx="90" cy="42" r="3.6" fill="#FFC531"/>
    <circle cx="60" cy="24" r="3" fill="#FFC531"/>
    <!-- hiệu ứng -->
    <g class="owl-sweat"><path d="M101 44q7 10 0 15-7-5 0-15z" fill="#7CC8FF"/></g>
    <g class="owl-q"><circle cx="100" cy="14" r="12" fill="#fff" stroke="#4C6FFF" stroke-width="3"/><text x="100" y="20" text-anchor="middle" font-size="17" font-weight="800" fill="#4C6FFF" font-family="Baloo 2,Nunito,system-ui,sans-serif">?</text></g>
    <g class="owl-stars" fill="#FFC531"><path d="M10 22l2.6 5.4 5.9.7-4.3 4 1.1 5.8L10 35l-5.3 2.9 1.1-5.8-4.3-4 5.9-.7z"/><path d="M108 8l1.9 4 4.4.5-3.2 3 .8 4.3-3.9-2.1-3.9 2.1.8-4.3-3.2-3 4.4-.5z"/></g>
  </g>
</svg>`;
  return wrap;
}
export function setMascot(el, state) {
  if (!el) return;
  el.className = el.className.replace(/owl-(idle|happy|think|oops|cheer)/g, '').trim() + ' owl-' + state;
}
