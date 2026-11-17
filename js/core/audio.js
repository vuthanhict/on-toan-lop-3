// Phát mp3 giọng đọc thu sẵn (audio/<2 ký tự đầu>/<khoá>.mp3). Một phần tử Audio dùng chung; manifest tải một lần.
// Đường dẫn tương đối theo vị trí tệp này -> chạy được ở thư mục con của GitHub Pages.
const hasDom = typeof document !== 'undefined' && typeof Audio !== 'undefined';
const BASE = new URL('../../audio/', import.meta.url);

let keys = null;          // Set các khoá có tệp; null = chưa tải xong
let manifestP = null;
let meta = { voice: '', engine: '' };

export function loadManifest() {
  if (manifestP) return manifestP;
  manifestP = (typeof fetch === 'function' ? fetch(new URL('manifest.json', BASE), { cache: 'no-cache' }) : Promise.reject(new Error('no fetch')))
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('manifest ' + r.status))))
    .then((m) => { keys = new Set(Array.isArray(m && m.keys) ? m.keys : []); meta = { voice: (m && m.voice) || '', engine: (m && m.engine) || '' }; return true; })
    .catch(() => { keys = new Set(); return false; });
  return manifestP;
}
export const manifestLoaded = () => keys !== null;
export const hasClip = (key) => !!key && !!keys && keys.has(key);
export const clipsAvailable = () => !!keys && keys.size > 0;
export const clipInfo = () => meta;
export const clipUrl = (key) => new URL(key.slice(0, 2) + '/' + key + '.mp3', BASE).href;

let el = null, unlocked = null, cur = null;
function audioEl() { if (!el && hasDom) { el = new Audio(); el.preload = 'auto'; } return el; }

// WAV im lặng ~0,05 s để "mở khoá" phần tử Audio trong cử chỉ chạm đầu tiên (iOS/Safari)
const SILENT = 'data:audio/wav;base64,UklGRkQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';
function unlock() {
  const a = audioEl(); if (!a || unlocked) return;
  unlocked = new Promise((resolve) => {
    const prev = a.src;
    try {
      a.src = SILENT; a.muted = true;
      const done = () => { a.muted = false; resolve(); };
      const p = a.play();
      if (p && p.then) p.then(() => { a.pause(); done(); }, done); else done();
    } catch (e) { a.muted = false; resolve(); }
    void prev;
  });
}
if (hasDom) {
  document.addEventListener('pointerdown', unlock, { once: true, capture: true });
  loadManifest();
}

function finish(rec, ok) { if (cur === rec) cur = null; if (rec && !rec.done) { rec.done = true; rec.resolve(ok); } }

// Phát một tệp theo khoá. Trả Promise<boolean>: true = phát hết; false = bị dừng / lỗi / không phát được.
export function playClip(key, opts = {}) {
  const a = audioEl();
  if (!a || !key) return Promise.resolve(false);
  stopClip();
  return new Promise((resolve) => {
    const rec = { resolve, done: false };
    cur = rec;
    Promise.resolve(unlocked).then(() => {
      if (cur !== rec) return finish(rec, false);
      a.onended = () => finish(rec, true);
      a.onerror = () => finish(rec, false);
      a.src = clipUrl(key);
      a.playbackRate = opts.rate || 1.0;
      a.currentTime = 0;
      const p = a.play();
      if (p && p.catch) p.catch(() => finish(rec, false));
    });
  });
}
export function stopClip() {
  const rec = cur; cur = null;
  if (el) { try { el.onended = el.onerror = null; el.pause(); } catch (e) { } }
  if (rec && !rec.done) { rec.done = true; rec.resolve(false); }
}
export const clipPlaying = () => !!cur;
