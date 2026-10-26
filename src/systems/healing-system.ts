import { config } from '../config';
import type { EventBus } from '../core/events';
import { Healing, type HealItem } from './healing';

/** Key 1 eats a banh mi, key 2 drinks sugarcane juice. */
const KEYS: Record<string, HealItem> = { Digit1: 'banhMi', Digit2: 'sugarcaneJuice' };

export interface HealingContext {
  /** The mouse is captured, so the keys count. */
  locked: boolean;
  /** Shots fired this frame; shooting cancels a heal. */
  shots: number;
  /** The player cannot heal right now: swimming, under the parachute or dead. */
  blocked: boolean;
}

/**
 * Lets the player heal with the number keys. While healing the player moves slowly, and shooting
 * or taking damage cancels the heal and leaves the item unused.
 */
export class HealingSystem {
  private readonly wasDown = new Set<string>();

  constructor(
    readonly healing: Healing,
    private readonly input: { isDown: (code: string) => boolean },
    events: EventBus,
    private readonly playerId: string = 'player',
  ) {
    events.on('damage', (damage) => {
      if (damage.target === this.playerId) this.healing.cancel();
    });
  }

  /** Walking speed multiplier: slow while healing, faster under the juice buff, else 1. */
  get moveMultiplier(): number {
    return this.healing.state === 'idle'
      ? this.healing.speedMultiplier
      : config.loot.healMoveMultiplier;
  }

  /** True while the player is eating or drinking, so sprinting is not allowed. */
  get busy(): boolean {
    return this.healing.state !== 'idle';
  }

  update(dt: number, ctx: HealingContext): void {
    for (const [code, item] of Object.entries(KEYS)) {
      const down = this.input.isDown(code);
      const pressed = down && !this.wasDown.has(code);
      if (down) this.wasDown.add(code);
      else this.wasDown.delete(code);
      if (pressed && ctx.locked && !ctx.blocked) this.healing.start(item);
    }
    if (ctx.shots > 0 || ctx.blocked) this.healing.cancel();
    this.healing.update(dt);
  }
}
