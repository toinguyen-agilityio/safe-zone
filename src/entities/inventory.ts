import { config } from '../config';
import type { Health } from './health';
import { carryLimit, itemAmount, stockOf, type ItemType, type Stock } from './items';

/** What the player carries, with the carry limits: 5 banh mi, 3 juice and 180 rounds. */
export class Inventory {
  private readonly counts: Record<Stock, number> = { banhMi: 0, sugarcaneJuice: 0, ammo: 0 };

  /** `health` is where a raincoat puts its armor. */
  constructor(private readonly health: Health) {}

  count(stock: Stock): number {
    return this.counts[stock];
  }

  /**
   * Take an item if there is room for it. Returns whether it was taken, so a pickup that is
   * refused stays on the ground. A box that only partly fits adds what fits.
   */
  addItem(item: ItemType): boolean {
    const stock = stockOf(item);
    if (stock === null) return this.wearRaincoat();

    const room = carryLimit(stock) - this.counts[stock];
    if (room <= 0) return false;
    this.counts[stock] += Math.min(room, itemAmount(item));
    return true;
  }

  /** Put some of a stock in the bag without picking anything up, for example the starting ammo. Returns how many fit. */
  give(stock: Stock, amount: number): number {
    const fit = Math.max(0, Math.min(amount, carryLimit(stock) - this.counts[stock]));
    this.counts[stock] += fit;
    return fit;
  }

  /** Spend one of a stock, for example when eating. Returns false when there is none. */
  take(stock: Stock, amount = 1): boolean {
    if (this.counts[stock] < amount) return false;
    this.counts[stock] -= amount;
    return true;
  }

  /** A raincoat restores armor toward the maximum, and is left alone when armor is full. */
  private wearRaincoat(): boolean {
    if (this.health.armor >= config.player.armorMax) return false;
    this.health.addArmor(itemAmount('raincoat'));
    return true;
  }
}
