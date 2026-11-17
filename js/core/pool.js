// Khoảng seed cố định cho bài sinh: mp3 thu sẵn khớp với đúng các seed này (xem CONTRACT.md Phụ lục A, B)
export const POOL_SIZE = 10;
export const poolSeeds = () => Array.from({ length: POOL_SIZE }, (_, i) => i + 1);
