import { config } from '../config';
import type { Health } from '../entities/health';
import type { Inventory } from '../entities/inventory';

export type HealItem = 'banhMi' | 'sugarcaneJuice';
export type HealState = 'idle' | HealItem;

/** What finishing a heal did, or null while nothing finished. */
export interface HealResult {
  item: HealItem;
  /** Health actually gained, never past the full health. */
  healed: number;
}

/**
 * Eating a banh mi or drinking sugarcane juice. It takes time, and the item is only used up when
 * the time is over: cancelling half way leaves it in the bag and heals nothing. Juice also gives a
 * speed buff for a while. One thing at a time.
 */
export class Healing {
  private current: HealItem | null = null;
  private left = 0;
  private buffLeft = 0;

  constructor(
    private readonly health: Health,
    private readonly inventory: Inventory,
  ) {}

  get state(): HealState {
    return this.current ?? 'idle';
  }

  /** How far through the heal, from 0 to 1; 0 when idle. */
  get progress(): number {
    if (!this.current) return 0;
    return 1 - this.left / config.loot[this.current].healSeconds;
  }

  /** Walking speed multiplier: above 1 while the juice buff lasts. */
  get speedMultiplier(): number {
    return this.buffLeft > 0 ? config.loot.sugarcaneJuice.buffSpeedMultiplier : 1;
  }

  get buffed(): boolean {
    return this.buffLeft > 0;
  }

  /**
   * Begin eating or drinking. Refused (false) when something is already being used, the item is
   * not in the bag, the player is dead or their health is already full.
   */
  start(item: HealItem): boolean {
    if (this.current || this.health.dead) return false;
    if (this.inventory.count(item) < 1) return false;
    if (this.health.health >= config.player.health) return false;
    this.current = item;
    this.left = config.loot[item].healSeconds;
    return true;
  }

  /** Stop before it is done: nothing is healed and the item stays in the bag. */
  cancel(): void {
    this.current = null;
    this.left = 0;
  }

  update(dt: number): HealResult | null {
    this.buffLeft = Math.max(0, this.buffLeft - dt);
    if (!this.current) return null;
    // Dying in the middle of a meal ends it.
    if (this.health.dead) {
      this.cancel();
      return null;
    }

    this.left -= dt;
    if (this.left > 0) return null;

    const item = this.current;
    this.cancel();
    if (!this.inventory.take(item)) return null;
    const healed = this.health.heal(config.loot[item].healAmount);
    if (item === 'sugarcaneJuice') this.buffLeft = config.loot.sugarcaneJuice.buffSeconds;
    return { item, healed };
  }
}
