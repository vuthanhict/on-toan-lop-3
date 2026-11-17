// Service worker đơn giản: ưu tiên mạng, rơi về bộ nhớ đệm khi mất mạng (ôn bài offline).
// Riêng giọng đọc mp3 (/audio/*/*.mp3): cache-first khi chạy, giữ tối đa AUDIO_MAX mục gần nhất, không tải trước.
const CACHE = 'on-toan-3-v1';
const AUDIO_CACHE = 'on-toan-3-audio-v1';
const AUDIO_MAX = 500;
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== AUDIO_CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });

const isAudioClip = (url) => /\/audio\/[^/]+\/[^/]+\.mp3$/.test(url.pathname);

async function trimAudio(cache) {
  const ks = await cache.keys();
  for (let i = 0; i < ks.length - AUDIO_MAX; i++) await cache.delete(ks[i]);   // keys() theo thứ tự thêm vào -> bỏ cũ nhất
}
// Trình phát (nhất là Safari) gửi Range: trả 206 cắt từ bản đầy đủ đã lưu
async function fromFull(req, res) {
  const range = req.headers.get('range');
  if (!range) return res;
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  const buf = await res.clone().arrayBuffer();
  const size = buf.byteLength;
  let start = m && m[1] !== '' ? parseInt(m[1], 10) : 0;
  let end = m && m[2] !== '' ? Math.min(parseInt(m[2], 10), size - 1) : size - 1;
  if (m && m[1] === '' && m[2] !== '') { start = Math.max(0, size - parseInt(m[2], 10)); end = size - 1; }
  if (start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
  return new Response(buf.slice(start, end + 1), { status: 206, statusText: 'Partial Content', headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(end - start + 1), 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes' } });
}
async function audioResponse(req) {
  const cache = await caches.open(AUDIO_CACHE);
  const key = new Request(req.url);            // khoá không kèm Range
  let hit = await cache.match(key);
  if (hit) {   // làm mới thứ tự (gần nhất ở cuối)
    cache.delete(key).then(() => cache.put(key, hit.clone())).catch(() => { });
    return fromFull(req, hit);
  }
  const res = await fetch(key);                 // luôn lấy bản đầy đủ rồi tự cắt Range khi cần
  if (!res.ok) return res;
  await cache.put(key, res.clone());
  trimAudio(cache).catch(() => { });
  return fromFull(req, res);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (isAudioClip(url)) { e.respondWith(audioResponse(req).catch(() => Response.error())); return; }
  e.respondWith(fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))));
});
