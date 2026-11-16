// Hiệu ứng: pháo giấy, xu bay vào ví, nảy số
import { vctx } from '../visuals/index.js';

const COLORS = ['#FF5A5F', '#FFC531', '#4C6FFF', '#16A765', '#8B5CF6', '#22B8CF', '#FF8A3D'];
export function confetti({ x = innerWidth / 2, y = innerHeight * 0.38, n = 30 } = {}) {
  if (vctx.reduced) return;
  for (let i = 0; i < n; i++) {
    const el = document.createElement('i'); el.className = 'cf';
    const w = 7 + Math.random() * 7, hgt = 9 + Math.random() * 9;
    el.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${hgt}px;background:${COLORS[i % COLORS.length]};${Math.random() < 0.3 ? 'border-radius:50%' : ''}`;
    document.body.appendChild(el);
    const ang = (-90 + (Math.random() - 0.5) * 150) * Math.PI / 180, dist = 110 + Math.random() * 230;
    const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist, rot = (Math.random() - 0.5) * 900;
    const a = el.animate([
      { transform: 'translate(0,0) rotate(0)', opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) rotate(${rot}deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx * 1.15}px,${dy + 300}px) rotate(${rot * 1.6}deg)`, opacity: 0 },
    ], { duration: 1200 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' });
    a.onfinish = () => el.remove();
  }
}

export function bump(el) {
  if (!el || vctx.reduced || !el.animate) return;
  el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.28)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(.3,1.5,.5,1)' });
}

// chữ "+10" có xu bay từ vị trí `from` vào ví (.coin-chip) rồi nảy ví
export function flyReward(fromEl, text) {
  const chip = document.querySelector('.coin-chip');
  const r = fromEl ? fromEl.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
  const el = document.createElement('div'); el.className = 'fly'; el.textContent = text;
  el.style.left = x0 + 'px'; el.style.top = y0 + 'px';
  document.body.appendChild(el);
  if (vctx.reduced || !el.animate) { setTimeout(() => { el.remove(); bump(chip); }, 600); return; }
  const c = chip ? chip.getBoundingClientRect() : null;
  const dx = c ? c.left + c.width / 2 - x0 : 0, dy = c ? c.top + c.height / 2 - y0 : -120;
  el.animate([
    { transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 },
    { transform: 'translate(-50%,-90%) scale(1.15)', opacity: 1, offset: 0.25 },
    { transform: 'translate(-50%,-90%) scale(1)', opacity: 1, offset: 0.55 },
    { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.55)`, opacity: 0.2 },
  ], { duration: 950, easing: 'cubic-bezier(.4,.1,.3,1)' }).onfinish = () => { el.remove(); bump(chip); };
}
