import type { Rng } from '../core/rng';

/**
 * Cartoon-style Vietnamese jokes for the bots. They are made up for the game: no real brands,
 * no real people, no officials.
 */
export const BOT_NAMES: readonly string[] = [
  'Anh Ba Xe Ôm',
  'Chị Hai Bánh Xèo',
  'Bác Tư Bán Vé Số',
  'Cô Năm Mì Quảng',
  'Chú Sáu Cà Phê Muối',
  'Ông Bảy Chạy Sô',
  'Bà Tám Hóng Chuyện',
  'Cậu Út Ngủ Gật',
  'Thím Chín Rau Muống',
  'Dượng Mười Ba Hoa',
  'Anh Hai Lúa Miền Trung',
  'Chị Ba Chợ Cồn',
  'Bé Tí Nón Lá',
  'Cu Tèo Đi Lạc',
  'Cô Lan Nem Lụi',
  'Chú Tám Câu Cá',
  'Bác Hùng Nón Rách',
  'Anh Tú Lười Biếng',
  'Chị Mai Tóp Mỡ',
  'Ông Năm Râu Dài',
  'Bà Bảy Bún Mắm',
  'Thằng Cò Hay Quên',
  'Cô Bống Bánh Tráng',
  'Anh Sơn Cầu Rồng Phun',
  'Chị Hạnh Bánh Bèo',
  'Chú Hai Ăn Mì Quảng Hoài',
  'Cậu Ba Ngáo Ngơ',
  'Dì Tư Quạt Mo',
] as const;

/**
 * `count` different names from the list, chosen with the seeded generator so the same seed
 * always gives the same bots. Partial Fisher-Yates shuffle: no name is picked twice.
 */
export function pickBotNames(rng: Rng, count: number): string[] {
  if (count > BOT_NAMES.length) {
    throw new Error(`Only ${BOT_NAMES.length} bot names exist, ${count} were asked for`);
  }
  const pool = [...BOT_NAMES];
  const picked: string[] = [];
  for (let i = 0; i < count; i++) {
    const j = rng.int(i, pool.length - 1);
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
    picked.push(pool[i]!);
  }
  return picked;
}
