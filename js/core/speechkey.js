// Khoá âm thanh = cyrb53(toSpoken(text)) dạng base36. THUẦN: chạy cả Node (công cụ thu âm) lẫn trình duyệt.
// Khoá tính trên chữ ĐÃ chuẩn hoá để đọc, nên các khác biệt chỉ ở khoảng trắng/ký hiệu cùng nghĩa sẽ dùng chung một tệp.
import { toSpoken } from './spoken.js';

// cyrb53 (public domain, bryc) — băm 53 bit, đủ ít va chạm cho vài chục nghìn câu.
export function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507); h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// khoá của một văn bản (chưa chuẩn hoá). Văn bản rỗng -> ''
export function speechKey(text) {
  const spoken = toSpoken(text);
  if (!spoken) return '';
  return cyrb53(spoken).toString(36).padStart(11, '0');
}
// khoá của câu ĐÃ là lời đọc (dùng cho công cụ khi đã có toSpoken)
export function keyOfSpoken(spoken) { return spoken ? cyrb53(spoken).toString(36).padStart(11, '0') : ''; }
