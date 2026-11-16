// Âm thanh ngắn tổng hợp bằng Web Audio (không cần tệp âm thanh). Tôn trọng cài đặt "sound".
import { store } from './store.js';

let ctx = null;
function ac() {
  if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { ctx = new C(); } catch (e) { return null; } }
  if (ctx.state === 'suspended') ctx.resume().catch(() => { });
  return ctx;
}
function tone(c, f, t0, dur, type = 'triangle', vol = 0.14, slideTo = 0) {
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03);
}
const N = { c5: 523.25, d5: 587.33, e5: 659.25, g5: 783.99, a5: 880, c6: 1046.5, e6: 1318.5, g6: 1568, g4: 392, a4: 440, e4: 329.63 };
const SEQ = {
  tap: [[N.e5, 0, 0.05, 'triangle', 0.06]],
  correct: [[N.e5, 0, 0.1, 'triangle', 0.15], [N.a5, 0.09, 0.2, 'triangle', 0.15]],
  coin: [[N.e6, 0, 0.07, 'square', 0.045], [N.g6, 0.07, 0.14, 'square', 0.045]],
  wrong: [[330, 0, 0.14, 'sine', 0.12, 250], [250, 0.12, 0.2, 'sine', 0.1, 200]],
  combo: [[N.c5, 0, 0.08], [N.e5, 0.08, 0.08], [N.g5, 0.16, 0.08], [N.c6, 0.24, 0.22]],
  win: [[N.c5, 0, 0.12], [N.e5, 0.12, 0.12], [N.g5, 0.24, 0.12], [N.c6, 0.36, 0.14], [N.g5, 0.5, 0.1], [N.c6, 0.6, 0.34]],
  levelup: [[N.c5, 0, 0.1], [N.d5, 0.1, 0.1], [N.e5, 0.2, 0.1], [N.g5, 0.3, 0.1], [N.c6, 0.4, 0.12], [N.e6, 0.52, 0.34]],
  badge: [[N.g5, 0, 0.1], [N.c6, 0.1, 0.1], [N.e6, 0.2, 0.3]],
  oops: [[N.g4, 0, 0.1, 'sine', 0.1], [N.e4, 0.12, 0.18, 'sine', 0.1]],
};
export function play(name) {
  try {
    if (!store.get().settings.sound) return;
    const c = ac(); if (!c) return;
    (SEQ[name] || []).forEach(([f, t, d, type, vol, slide]) => tone(c, f, t, d, type || 'triangle', vol || 0.14, slide || 0));
  } catch (e) { /* âm thanh hỏng thì thôi */ }
}
