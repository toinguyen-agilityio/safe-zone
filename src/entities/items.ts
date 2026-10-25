import { config } from '../config';

/** Everything that can lie on a sidewalk. */
export const ITEM_TYPES = ['banhMi', 'sugarcaneJuice', 'ammoBox', 'raincoat'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

/** What the player carries in the bag: heals are counted, ammo is rounds. */
export type Stock = 'banhMi' | 'sugarcaneJuice' | 'ammo';

/** Which stock an item adds to; a raincoat is worn at once, so it has none. */
export function stockOf(item: ItemType): Stock | null {
  switch (item) {
    case 'banhMi':
      return 'banhMi';
    case 'sugarcaneJuice':
      return 'sugarcaneJuice';
    case 'ammoBox':
      return 'ammo';
    case 'raincoat':
      return null;
  }
}

/** How much one pickup of this item adds: one heal, a box of rounds, or the raincoat's armor. */
export function itemAmount(item: ItemType): number {
  switch (item) {
    case 'banhMi':
    case 'sugarcaneJuice':
      return 1;
    case 'ammoBox':
      return config.loot.ammoBoxAmount;
    case 'raincoat':
      return config.loot.raincoatArmor;
  }
}

/** The most of each stock the player can carry. */
export function carryLimit(stock: Stock): number {
  const limits = config.loot.carryLimit;
  return stock === 'banhMi'
    ? limits.banhMi
    : stock === 'sugarcaneJuice'
      ? limits.sugarcaneJuice
      : limits.ammo;
}
