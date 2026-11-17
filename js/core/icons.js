// Bộ icon thống nhất (SVG nét tròn) + icon chủ đề theo nhóm màu
const UI = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  replay: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>',
  speaker: '<path d="M4 10v4h3.5l5 4V6l-5 4H4z" fill="currentColor"/><path d="M16 9.2a4 4 0 0 1 0 5.6"/><path d="M18.8 6.4a8 8 0 0 1 0 11.2"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
  film: '<rect x="3.5" y="5" width="17" height="14" rx="3.5"/><path d="M10.5 9.2v5.6l4.6-2.8z" fill="currentColor"/>',
  pencil: '<path d="M4 20l1-4.5L16.5 4a2 2 0 0 1 3 3L8 18.5z"/><path d="M14.5 6l3.5 3.5"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  review: '<path d="M4 6h12M4 12h8M4 18h6"/><path d="M15 15.5l2.2 2.2L21 13.5"/>',
  exam: '<rect x="5" y="3.5" width="14" height="17" rx="3"/><path d="M9 9h6M9 13h6M9 17h3"/>',
  flag: '<path d="M6 21V4M6 5h11l-2.5 4 2.5 4H6"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>',
  star: '<path d="M12 3.2l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.7 6.6 19.7l1.2-6L3.3 9.5l6.1-.7z" fill="currentColor" stroke-linejoin="round"/>',
  flame: '<path d="M12.5 2.5c.4 3 2 4.3 3.6 6.2 1.4 1.7 2.4 3.4 2.4 5.6a6.5 6.5 0 0 1-13 0c0-2.2 1-3.9 2.3-5.3.2 1.3.8 2.2 1.8 2.8-.2-3.5 0-7.2 2.9-9.3z" fill="currentColor"/><path d="M12 21a3.2 3.2 0 0 1-3.2-3.2c0-1.8 1.4-2.8 2.2-4 .3 1 .9 1.5 1.5 1.9 1 .7 2.7 1.1 2.7 3.5A3.2 3.2 0 0 1 12 21z" fill="#F9C28F" stroke="none"/>',
  backspace: '<path d="M21 6H9.5L3 12l6.5 6H21a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/>',
  coin: '<circle cx="12" cy="12" r="9.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="6.7" fill="none" stroke="#FFFFFF" stroke-opacity=".6" stroke-width="1.8"/><path d="M12 8.2l1.2 2.5 2.7.3-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.3z" fill="#FFFFFF" stroke="none"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z" fill="currentColor"/><path d="M8 6H5v1.2A3 3 0 0 0 8 10M16 6h3v1.2a3 3 0 0 1-3 2.8M12 13v4M8.5 20h7"/>',
  lock: '<rect x="6" y="11" width="12" height="9" rx="2.6"/><path d="M8.6 11V8.2a3.4 3.4 0 0 1 6.8 0V11"/>',
  chest: '<rect x="3.5" y="9" width="17" height="11" rx="2.6"/><path d="M3.5 9V8a4.5 4.5 0 0 1 4.5-4.5h8A4.5 4.5 0 0 1 20.5 8v1M12 12v3"/><circle cx="12" cy="14.5" r="1.3" fill="currentColor"/>',
  shirt: '<path d="M8.5 4L3 7l2 4.2 3-1.2V20h8V10l3 1.2L21 7l-5.5-3a3.6 3.6 0 0 1-7 0z"/>',
  sound: '<path d="M4 10v4h3.5l5 4V6l-5 4H4z" fill="currentColor"/><path d="M16 9.2a4 4 0 0 1 0 5.6"/>',
  mute: '<path d="M4 10v4h3.5l5 4V6l-5 4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  gift: '<rect x="4" y="10" width="16" height="10" rx="2.5"/><path d="M3 10h18V7H3zM12 7v13"/><path d="M12 7C10.5 3.5 7 4 7 6s3 1 5 1zm0 0c1.5-3.5 5-3 5-1s-3 1-5 1z"/>',
  map: '<path d="M9 4L3 6.5v13L9 17l6 3 6-2.5v-13L15 7z"/><path d="M9 4v13M15 7v13"/>',
  home: '<path d="M4 11l8-7 8 7M6 10v9h12v-9"/>',
};
export function icon(name, size = 24, cls = '') {
  const s = document.createElement('span');
  s.className = 'ic ' + cls;
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${UI[name] || ''}</svg>`;
  return s;
}

// Nhóm màu chủ đề: số · phép tính · bội-ước-phân số · hình-đo
export const GROUPS = {
  so: { name: 'Số và hàng', c: '#4F6BED', mid: '#AEBBFA', soft: '#E8EDFF', ink: '#2A3A9E' },
  tinh: { name: 'Phép tính', c: '#34B27B', mid: '#98DDBB', soft: '#E1F5EC', ink: '#145C3C' },
  boc: { name: 'Bội, ước, phân số', c: '#8B6CF0', mid: '#C5B6F8', soft: '#EEE9FF', ink: '#4B34A8' },
  hinh: { name: 'Hình và đo', c: '#F5893A', mid: '#F9C28F', soft: '#FFEBD8', ink: '#8F4A10' },
};
const GROUP_OF = { 1: 'so', 2: 'so', 3: 'so', 4: 'so', 5: 'so', 6: 'so', 7: 'tinh', 8: 'tinh', 9: 'tinh', 11: 'tinh', 10: 'boc', 12: 'boc', 13: 'boc', 14: 'hinh', 15: 'hinh', 16: 'hinh' };
export function groupOf(no) { return GROUPS[GROUP_OF[no] || 'so']; }

const T = {
  1: '<rect x="5" y="28" width="10" height="13" rx="3" fill="var(--ic2)"/><rect x="19" y="20" width="10" height="21" rx="3" fill="var(--ic2)"/><rect x="33" y="11" width="10" height="30" rx="3" fill="var(--ic)"/><path d="M8 20c5-9 14-12 24-12" stroke="var(--ink)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M29 4l5 4-5 4" stroke="var(--ink)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  2: '<rect x="19" y="5" width="10" height="28" rx="5" fill="var(--ic2)"/><circle cx="24" cy="36" r="8" fill="var(--ic)"/><rect x="22" y="15" width="4" height="21" rx="2" fill="var(--ic)"/><path d="M33 11h5M33 17h7M33 23h5" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/>',
  3: '<rect x="3" y="12" width="13" height="24" rx="4" fill="var(--ic)"/><rect x="17.5" y="12" width="13" height="24" rx="4" fill="var(--ic2)"/><rect x="32" y="12" width="13" height="24" rx="4" fill="var(--ic)"/><g font-family="Baloo 2,Nunito,sans-serif" font-weight="800" font-size="19" text-anchor="middle"><text x="9.5" y="31" fill="#FFFFFF">1</text><text x="24" y="31" fill="var(--ink)">2</text><text x="38.5" y="31" fill="#FFFFFF">3</text></g>',
  4: '<rect x="3" y="10" width="42" height="28" rx="11" fill="var(--ic)"/><text x="24" y="31" text-anchor="middle" font-family="Baloo 2,Nunito,sans-serif" font-weight="800" font-size="19" fill="#FFFFFF">×10</text>',
  5: '<path d="M5 33h38" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><path d="M8 28v10M24 28v10M40 28v10" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><circle cx="17" cy="14" r="6" fill="var(--ic)"/><path d="M20 21c3 2 4 5 4 8" stroke="var(--ic)" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M20 27l4 4 4-4" stroke="var(--ic)" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  6: '<rect x="5" y="6" width="26" height="14" rx="7" fill="var(--ic2)"/><circle cx="12" cy="13" r="4.5" fill="var(--ic)"/><circle cx="24" cy="13" r="4.5" fill="var(--ic)"/><circle cx="10" cy="35" r="4.5" fill="var(--ic)"/><circle cx="22" cy="35" r="4.5" fill="var(--ic)"/><circle cx="36" cy="35" r="4.5" fill="var(--ink)"/>',
  7: '<circle cx="15" cy="24" r="12" fill="var(--ic)"/><circle cx="33" cy="24" r="12" fill="var(--ic2)"/><path d="M15 18v12M9 24h12" stroke="#FFFFFF" stroke-width="3.4" stroke-linecap="round"/><path d="M27 24h12" stroke="var(--ink)" stroke-width="3.4" stroke-linecap="round"/>',
  8: '<g fill="var(--ic)"><circle cx="9" cy="11" r="4"/><circle cx="20" cy="11" r="4"/><circle cx="31" cy="11" r="4"/><circle cx="42" cy="11" r="4" fill="var(--ic2)"/><circle cx="9" cy="24" r="4"/><circle cx="20" cy="24" r="4"/><circle cx="31" cy="24" r="4"/><circle cx="42" cy="24" r="4" fill="var(--ic2)"/><circle cx="9" cy="37" r="4"/><circle cx="20" cy="37" r="4"/><circle cx="31" cy="37" r="4"/><circle cx="42" cy="37" r="4" fill="var(--ic2)"/></g>',
  9: '<path d="M15 6C8 14 8 34 15 42M33 6c7 8 7 28 0 36" stroke="var(--ic)" stroke-width="5.5" fill="none" stroke-linecap="round"/><circle cx="19" cy="24" r="3.6" fill="var(--ic2)"/><circle cx="29" cy="24" r="3.6" fill="var(--ic2)"/><path d="M22.5 24h3" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>',
  10: '<circle cx="18" cy="24" r="14" fill="var(--ic)" opacity=".85"/><circle cx="31" cy="24" r="14" fill="var(--ic2)" opacity=".9"/><path d="M24.5 12.5a14 14 0 0 1 0 23 14 14 0 0 1 0-23z" fill="var(--ink)" opacity=".35"/>',
  11: '<rect x="5" y="5" width="38" height="38" rx="12" fill="var(--ic)"/><circle cx="24" cy="14" r="3.6" fill="#FFFFFF"/><path d="M13 24h22" stroke="#FFFFFF" stroke-width="4.2" stroke-linecap="round"/><circle cx="24" cy="34" r="3.6" fill="#FFFFFF"/>',
  12: '<circle cx="24" cy="25" r="18" fill="var(--ic2)"/><path d="M24 25V7a18 18 0 0 1 18 18z" fill="var(--ic)"/><path d="M24 25L11.3 37.7M24 25h18M24 25V7" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/><path d="M24 25L11.3 12.3" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>',
  13: '<rect x="12" y="5" width="24" height="39" rx="7" fill="var(--ic2)"/><path d="M12 25h24v12a7 7 0 0 1-7 7H19a7 7 0 0 1-7-7z" fill="var(--ic)"/><path d="M7 14h5M7 25h5M7 36h5" stroke="var(--ink)" stroke-width="2.8" stroke-linecap="round"/>',
  14: '<path d="M7 39h35M7 39L33 9" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M23 39a16 16 0 0 0-6-12.5L7 39z" fill="var(--ic)" opacity=".9"/><path d="M26 39a19 19 0 0 0-7.5-15" stroke="var(--ic)" stroke-width="3.6" fill="none" stroke-linecap="round"/>',
  15: '<path d="M24 5L24 43 6 43z" fill="var(--ic)"/><path d="M24 5L24 43 42 43z" fill="var(--ic2)"/><path d="M24 2v44" stroke="var(--ink)" stroke-width="2.8" stroke-dasharray="4 4" stroke-linecap="round"/>',
  16: '<circle cx="24" cy="25" r="18" fill="var(--ic2)" stroke="var(--ic)" stroke-width="4.5"/><path d="M24 25V13M24 25l8 5" stroke="var(--ink)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="25" r="2.6" fill="var(--ink)"/><path d="M14 4l-4 4M34 4l4 4" stroke="var(--ic)" stroke-width="3.4" stroke-linecap="round"/>',
};
export function topicIcon(no, size = 44) {
  const g = groupOf(no);
  const s = document.createElement('span');
  s.className = 'ticon';
  s.style.setProperty('--ic', g.c); s.style.setProperty('--ic2', g.mid); s.style.setProperty('--ink', g.ink); s.style.setProperty('--tile', g.soft);
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = `<svg viewBox="0 0 48 48" width="${size}" height="${size}">${T[no] || ''}</svg>`;
  return s;
}
