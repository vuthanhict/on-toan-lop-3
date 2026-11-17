// Giọng đọc tiếng Việt: ưu tiên mp3 thu sẵn (audio.js), dự phòng speechSynthesis của trình duyệt.
// toSpoken/numberToWords nằm ở spoken.js (thuần, chạy được trong Node) và được xuất lại ở đây để giữ nguyên chữ ký cũ.
import { toSpoken, numberToWords } from './spoken.js';
import { speechKey } from './speechkey.js';
import { loadManifest, manifestLoaded, hasClip, clipsAvailable, playClip, stopClip } from './audio.js';
export { toSpoken, numberToWords };

// ---- speechSynthesis ----
const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
let viVoice = null, voicesChecked = false, listeners = new Set();

function pickVoice() {
  if (!synth) return null;
  const vs = synth.getVoices() || [];
  const vi = vs.filter((v) => /^vi/i.test(v.lang) || /vietnam/i.test(v.name));
  voicesChecked = vs.length > 0;
  if (!vi.length) return null;
  return vi.find((v) => /linh|google|natural|premium|enhanced/i.test(v.name)) || vi[0];
}
if (synth) {
  viVoice = pickVoice();
  synth.addEventListener && synth.addEventListener('voiceschanged', () => { viVoice = pickVoice(); listeners.forEach((f) => f(status())); });
}
export function status() { return { supported: !!synth, hasVietnamese: !!viVoice, voiceName: viVoice ? viVoice.name : '', clips: clipsAvailable() }; }
export function onStatus(f) { listeners.add(f); return () => listeners.delete(f); }
loadManifest().then(() => listeners.forEach((f) => f(status())));   // manifest tải xong -> báo cho giao diện (clips:true)

let token = 0;
export function stop() { token++; stopClip(); if (synth) try { synth.cancel(); } catch (e) { } }

// đọc bằng speechSynthesis (dự phòng)
function speakSynth(plain, opts, my) {
  if (!plain || !synth) return Promise.resolve(false);
  if (!viVoice) viVoice = pickVoice();
  if (!viVoice) return Promise.resolve(false);
  const chunks = plain.split(/(?<=[.!?])\s+/).filter(Boolean);
  return new Promise((resolve) => {
    let i = 0;
    const next = () => {
      if (my !== token) return resolve(false);
      if (i >= chunks.length) return resolve(true);
      const u = new SpeechSynthesisUtterance(chunks[i++]);
      u.voice = viVoice; u.lang = viVoice.lang || 'vi-VN';
      u.rate = opts.rate || 0.92; u.pitch = opts.pitch || 1.08;
      u.onend = next; u.onerror = () => resolve(false);
      try { synth.speak(u); } catch (e) { resolve(false); }
    };
    // iOS đôi khi bị treo hàng đợi
    try { synth.resume(); } catch (e) { }
    next();
  });
}

// đọc 1 đoạn; trả Promise<boolean>: true = đọc xong, false = bị dừng / không đọc được.
// Có mp3 thu sẵn (theo khoá) -> phát mp3; không có (hoặc mp3 lỗi) -> speechSynthesis.
export function speak(text, opts = {}) {
  stop();
  const my = token;
  const plain = toSpoken(text);
  if (!plain) return Promise.resolve(false);
  const go = () => {
    if (my !== token) return false;
    const key = speechKey(text);
    if (hasClip(key)) {
      return playClip(key, { rate: opts.clipRate || 1.0 }).then((ok) => {
        if (ok || my !== token) return ok;
        return speakSynth(plain, opts, my);      // mp3 lỗi/chặn tự phát -> giọng trình duyệt
      });
    }
    return speakSynth(plain, opts, my);
  };
  // manifest thường đã sẵn sàng; nếu chưa, chờ (đã bắt đầu tải từ khi nạp module)
  if (manifestLoaded()) return Promise.resolve(go());
  return loadManifest().then(go);
}
