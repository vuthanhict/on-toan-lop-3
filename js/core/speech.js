// Giọng đọc tiếng Việt: chuẩn hoá văn bản (toSpoken) + speechSynthesis
const D = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function group3(n, lead) {
  // n: 0..999 ; lead: đây có phải nhóm đầu tiên (không đọc "không trăm")
  const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), u = n % 10;
  const out = [];
  if (h > 0 || !lead) {
    if (h > 0 || n > 0) out.push(D[h] + ' trăm');
  }
  if (t === 0) {
    if (u > 0) { if (h > 0 || !lead) out.push('linh'); out.push(D[u]); }
  } else if (t === 1) {
    out.push('mười');
    if (u === 5) out.push('lăm'); else if (u > 0) out.push(D[u]);
  } else {
    out.push(D[t] + ' mươi');
    if (u === 1) out.push('mốt'); else if (u === 4) out.push('tư'); else if (u === 5) out.push('lăm'); else if (u > 0) out.push(D[u]);
  }
  return out.join(' ');
}

export function numberToWords(num) {
  if (num === 0) return 'không';
  const units = ['', ' nghìn', ' triệu', ' tỷ'];
  const parts = [];
  let n = Math.abs(num), idx = 0;
  const groups = [];
  while (n > 0) { groups.push(n % 1000); n = Math.floor(n / 1000); }
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g === 0) continue;
    const lead = i === groups.length - 1;
    parts.push(group3(g, lead) + units[i]);
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

const DEN = { 2:'hai',3:'ba',4:'tư',5:'năm',6:'sáu',7:'bảy',8:'tám',9:'chín',10:'mười' };
const UNIT = { km:'ki-lô-mét', kg:'ki-lô-gam', ml:'mi-li-lít', cm:'xăng-ti-mét', mm:'mi-li-mét', dm:'đê-xi-mét', hm:'héc-tô-mét', g:'gam', m:'mét', l:'lít', h:'giờ', 'phút':'phút' };
const LETTER = { a:'a', b:'bê', c:'xê', d:'đê', e:'e', g:'giê', h:'hát', i:'i', k:'ca', l:'e-lờ', m:'mờ', n:'nờ', o:'o', p:'pê', q:'cu', r:'e-rờ', s:'ét-xì', t:'tê', u:'u', v:'vê', x:'ích-xì', y:'i-gờ-rếc' };
const words = (n) => numberToWords(Number(n));
// đọc chữ số có số 0 đứng đầu: 035 -> "không trăm ba mươi lăm", 007 -> "không trăm linh bảy", 07 -> "không bảy"
function leadZero(tok) {
  const n = Number(tok);
  if (tok.length === 3) return 'không trăm ' + (n < 10 ? 'linh ' + D[n] : words(n));
  return tok.split('').map((c) => D[+c]).join(' ');
}
const ord = (w, n) => (n === 1 ? 'nhất' : n === 4 ? 'tư' : words(n));

export function toSpoken(text) {
  let s = String(text == null ? '' : text);
  s = s.replace(/[\u00a0\u202f]/g, ' ');
  // 1. xuống dòng -> ngắt câu (để a) b) c) không dính nhau)
  s = s.replace(/\s*\n+\s*/g, (m, off, str) => (/[.!?:;,]$/.test(str.slice(0, off)) ? ' ' : '. '));
  // 2. tiền tệ
  s = s.replace(/\$\s*(\d[\d ]*\d|\d)/g, '$1 đô la').replace(/(\d)\s*đ(?![\p{L}])/gu, '$1 đồng');
  // 3. gộp dấu cách nghìn (an toàn: không ăn số khác, chịu được nhiều nhóm)
  s = s.replace(/(?<![\d])\d{1,3}(?: \d{3})+(?!\d)/g, (m) => m.replace(/ /g, ''));
  // 4. giờ:phút  14:00 | 7:05 | 15:30
  s = s.replace(/(?<!\d)(\d{1,2}):([0-5]\d)(?!\d)/g, (m, h, mi) => words(h) + ' giờ' + (mi === '00' ? '' : ' ' + (mi[0] === '0' ? words(mi[1]) : words(mi)) + ' phút'));
  s = s.replace(/(\d)\s+:\s+(\d)/g, '$1 chia $2');
  // 5. đơn vị đo
  s = s.replace(/(\d)\s*°C/g, '$1 độ xê').replace(/°C/g, ' độ xê').replace(/°/g, ' độ');
  s = s.replace(/(\d)\s*(km|cm|mm|dm|hm|m)\s*(²|2(?!\d))/g, (m, d, u) => d + ' ' + UNIT[u] + ' vuông');
  s = s.replace(/(\d)\s*(km|kg|ml|cm|mm|dm|hm|g|m|l|h|phút)(?![\p{L}\d])/gu, (m, d, u) => d + ' ' + UNIT[u]);
  s = s.replace(/(?<![\p{L}\d])(km|kg|ml|cm|mm|dm)(?![\p{L}\d])/gu, (m, u) => UNIT[u]);   // đơn vị đứng một mình: "bao nhiêu kg"
  s = s.replace(/(\d)\s*%/g, '$1 phần trăm').replace(/(\d)\s*D(?![\p{L}\d])/gu, '$1 chiều');   // 2D -> hai chiều
  // 6. gạch đứng ngăn lớp "21 | 035" -> ngắt hơi
  s = s.replace(/\s*\|\s*/g, ', ');
  // 7. số thập phân 52.7 | 1,5, rồi số có chữ số 0 đứng đầu 035 / 007
  s = s.replace(/(\d+)[.,](\d+)(?!\d)/g, (m, i, f) => words(i) + ' phẩy ' + (f[0] === '0' ? f.split('').map((c) => D[+c]).join(' ') : words(f)));
  s = s.replace(/(?<![\d.,])0\d+(?![\d:])/g, (m) => leadZero(m));
  // 8. ngày/tháng  27/11/2026, ngày 5/11, 27/11 (tử > 12). KHÔNG đụng 1/11, 1/12 (phân số)
  s = s.replace(/(?<!\d)(\d{1,2})\/(\d{1,2})\/(\d{4})(?!\d)/g, (m, d, mo, y) => `ngày ${words(d)} tháng ${mo === '4' ? 'tư' : words(mo)} năm ${words(y)}`);
  s = s.replace(/(ngày|mùng)\s+(\d{1,2})\/(\d{1,2})(?!\d)/gi, (m, w, d, mo) => `${w} ${words(d)} tháng ${mo === '4' ? 'tư' : words(mo)}`);
  s = s.replace(/(?<![\d/])(1[3-9]|2\d|3[01])\/(1[0-2]|[1-9])(?![\d/])/g, (m, d, mo) => `${words(d)} tháng ${mo === '4' ? 'tư' : words(mo)}`);
  // 9. dấu âm / trừ (làm TRƯỚC phân số và trước khi đổi số -> chữ)
  s = s.replace(/\(\s*(−?\d[\d ]*)\s*\)/g, ' $1 ');                 // (−12), (9): bỏ ngoặc quanh một số để "trừ" nối liền với số
  //   9a. trừ nhị phân
  s = s.replace(/([\d)□○△●a-zA-Z])\s+−\s+(?=[\d(□○△●a-zA-Z−])/g, '$1 trừ ');
  s = s.replace(/(\d|\))\s+-\s+(?=[\d(])/g, '$1 trừ ');                 // gạch nối ASCII có khoảng trắng = trừ
  //   9b. bước nhảy: "nhảy −60", "mỗi lần −10" => trừ
  s = s.replace(/(nhảy|bước nhảy( là)?|bước( là)?|mỗi lần|thêm|lùi)\s*−(?=\d)/gi, '$1 trừ ');
  //   9c. số âm
  s = s.replace(/(^|[\s(:,;=<>+×÷])−(?=\d)/g, '$1âm ');
  // 10. khoảng "45…65", "8–10 giờ", "A–90°"
  s = s.replace(/(\d)\s*…\s*(\d)/g, '$1 đến $2');
  s = s.replace(/(\d)\s*–\s*(\d)/g, '$1 đến $2').replace(/\s*[–—]\s*/g, ', ');
  // 11. thứ tự: thứ 1 -> thứ nhất, thứ 4 -> thứ tư, tháng 4 -> tháng tư, hạng 1 -> hạng nhất
  s = s.replace(/\b(thứ|hạng|Thứ|Hạng)\s+(\d{1,2})(?!\d)/g, (m, w, n) => `${w} ${ord(w, +n)}`);
  s = s.replace(/\b(tháng|Tháng)\s+(\d{1,2})(?!\d)/g, (m, w, n) => `${w} ${+n === 4 ? 'tư' : words(n)}`);
  // 12. phân số: số/số, chữ/chữ, số/chữ
  s = s.replace(/(\d+)\s*\/\s*(\d+)/g, (m, a, b) => words(a) + ' phần ' + (DEN[+b] || words(b)));
  s = s.replace(/(?<![\p{L}\d])([a-z])\/([a-z])(?![\p{L}\d])/gu, (m, a, b) => (LETTER[a] || a) + ' phần ' + (LETTER[b] || b));
  s = s.replace(/(\d+)\/([a-z])(?![\p{L}])/g, (m, a, b) => words(a) + ' phần ' + (LETTER[b] || b));
  // 13. phép tính & ký hiệu
  s = s.replace(/×/g, ' nhân ').replace(/÷/g, ' chia ').replace(/\+/g, ' cộng ').replace(/=/g, ' bằng ');
  s = s.replace(/≤/g, ' bé hơn hoặc bằng ').replace(/≥/g, ' lớn hơn hoặc bằng ').replace(/≈/g, ' gần bằng ').replace(/≠/g, ' khác ');
  s = s.replace(/</g, ' bé hơn ').replace(/>/g, ' lớn hơn ');
  s = s.replace(/−/g, ' trừ ');                                       // còn sót: "dấu −"
  s = s.replace(/[→·]/g, ', ').replace(/[↔⇒]/g, ', ');
  // 14. ô trống / hình giữ chỗ / dấu hỏi / dấu chấm lửng
  s = s.replace(/(trống)\s*[□▢]/g, '$1').replace(/([Ôô])\s*[□▢]/g, '$1 trống').replace(/[□▢●]/g, ' ô trống ').replace(/○/g, ' hình tròn ').replace(/△/g, ' hình tam giác ').replace(/★/g, ' ngôi sao ');
  s = s.replace(/(=|\blà|bằng)\s*\?/g, '$1 bao nhiêu?').replace(/(^|[\s,])\?(?=[\s,.]|$)/g, '$1 số cần tìm');
  const blanks = (s.match(/(^|[\s,:(])(…+|\.{3,})(?=[\s,.:?×÷+=)]|$)/g) || []).length;   // số "chỗ trống" độc lập
  s = s.replace(/(\p{L}|\d)(…+|\.{3,})(?=(\s+\p{Lu}|[.?!]|$))/gu, '$1, và cứ thế.');       // "25… Các chấm" -> hết dãy
  s = s.replace(/(\p{L}|\d)(…+|\.{3,})/gu, '$1,');                                          // "+4… cứ đổi" -> chỉ ngắt hơi
  s = s.replace(/(^|[\s,:(])(…+|\.{3,})(?=([\s,.:?×÷+=)]|$))/g, (m, p, e, _x, off, str) => {
    const cont = blanks < 2 && /^\s*([.?!]|\p{Lu}|$)/u.test(str.slice(off + m.length));
    return p + (cont ? ' và cứ thế. ' : ' chỗ trống ');
  });
  // 15. nhãn câu "a)" "b)" và chữ cái đơn lẻ
  s = s.replace(/(^|[.:?!]\s+)([a-d])\)(?=\s)/g, '$1câu $2,');
  s = s.replace(/(?<![\p{L}\d])([a-gkmnpqxy])(?![\p{L}\d])/gu, (m, c) => LETTER[c] || m);
  s = s.replace(/(?<![\p{L}\d])([B-DG-HK-NP-QX-Y])(?![\p{L}\d])/gu, (m, c) => LETTER[c.toLowerCase()] || m); // Túi B -> bê, điểm C -> xê, D -> đê
  s = s.replace(/(?<![\p{L}\d])([A-Z])(\d+)(?![\p{L}\d])/gu, '$1 $2');
  // 15b. tên hình gồm nhiều chữ cái: tam giác ABC -> đánh vần từng chữ
  s = s.replace(/(giác|nhật|vuông|thoi|hành|thang|góc|đoạn|thẳng)\s+([A-Z]{2,5})(?![\p{L}])/gu, (m, w, n) => w + ' ' + [...n].map((c) => LETTER[c.toLowerCase()] || c).join(' '));
  // 16. CHỮ HOA nhấn mạnh -> chữ thường (tránh bị đánh vần)
  s = s.replace(/(?<![\p{L}])\p{Lu}{2,}(?![\p{L}])/gu, (m) => m.toLowerCase());
  // 17. số -> chữ
  s = s.replace(/\d+/g, (m) => (m.length > 12 ? m.split('').map((c) => D[+c]).join(' ') : words(m)));
  s = s.replace(/[*_`#]/g, '').replace(/[()\[\]{}]/g, ', ');
  s = s.replace(/\s+/g, ' ').replace(/\s+([,.!?])/g, '$1').replace(/,\s*,+/g, ',').replace(/,\s*([.!?])/g, '$1').replace(/:\s*,/g, ':').replace(/^[,\s]+/, '').trim();
  return s;
}

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
export function status() { return { supported: !!synth, hasVietnamese: !!viVoice, voiceName: viVoice ? viVoice.name : '' }; }
export function onStatus(f) { listeners.add(f); return () => listeners.delete(f); }

let token = 0;
export function stop() { token++; if (synth) try { synth.cancel(); } catch (e) { } }

// đọc 1 đoạn; trả Promise khi đọc xong (hoặc ngay lập tức nếu không có giọng)
export function speak(text, opts = {}) {
  stop();
  const my = token;
  const plain = toSpoken(text);
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
