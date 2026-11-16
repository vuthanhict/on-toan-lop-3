// Bộ sinh số ngẫu nhiên có seed (mulberry32) — dùng cho bộ sinh bài biến thể
export function seeded(seed = 1) {
  let a = (seed >>> 0) || 1;
  return {
    next() {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}
export function int(rng, a, b) { return a + Math.floor(rng.next() * (b - a + 1)); }
export function pick(rng, arr) { return arr[Math.floor(rng.next() * arr.length)]; }
export function shuffle(rng, arr) {
  const x = arr.slice();
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(rng.next() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
}
