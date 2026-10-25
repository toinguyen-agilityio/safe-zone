import { ITEM_TYPES, type ItemType } from '../entities/items';

/** The names of the items in Vietnamese. */
export const ITEM_NAMES_VI: Record<ItemType, string> = {
  banhMi: 'Bánh mì',
  sugarcaneJuice: 'Nước mía',
  ammoBox: 'Hộp đạn',
  raincoat: 'Áo mưa',
};

/** The message shown when an item is picked up. */
export function pickupMessage(item: ItemType): string {
  return `Nhặt được: ${ITEM_NAMES_VI[item]}`;
}

/** Every item has a name; used by tests to catch a new item without one. */
export function allItemsNamed(): boolean {
  return ITEM_TYPES.every((type) => ITEM_NAMES_VI[type].length > 0);
}
