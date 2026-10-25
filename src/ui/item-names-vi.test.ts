import { describe, expect, it } from 'vitest';
import { ITEM_TYPES } from '../entities/items';
import { allItemsNamed, ITEM_NAMES_VI, pickupMessage } from './item-names-vi';

describe('item names in Vietnamese', () => {
  it('names all four items', () => {
    expect(ITEM_TYPES).toHaveLength(4);
    expect(ITEM_NAMES_VI).toEqual({
      banhMi: 'Bánh mì',
      sugarcaneJuice: 'Nước mía',
      ammoBox: 'Hộp đạn',
      raincoat: 'Áo mưa',
    });
    expect(allItemsNamed()).toBe(true);
  });

  it('gives each item a different name', () => {
    expect(new Set(Object.values(ITEM_NAMES_VI)).size).toBe(4);
  });

  it('builds a short pickup message that names the item', () => {
    for (const type of ITEM_TYPES) {
      const message = pickupMessage(type);
      expect(message).toContain(ITEM_NAMES_VI[type]);
      expect(message.length).toBeLessThan(40);
    }
    expect(pickupMessage('banhMi')).toBe('Nhặt được: Bánh mì');
  });
});
