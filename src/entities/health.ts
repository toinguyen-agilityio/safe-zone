import { config } from '../config';

/** Gun damage is partly absorbed by armor; flood damage goes straight to health. */
export type DamageKind = 'gun' | 'flood';

/** What a hit did, after armor. */
export interface DamageResult {
  /** Taken off health. */
  health: number;
  /** Taken off armor. */
  armor: number;
  /** This hit brought health to 0. */
  killed: boolean;
}

/** Health 100 plus armor that blocks 45 percent of gun damage until its points run out. */
export class Health {
  health: number = config.player.health;
  armor = 0;

  get dead(): boolean {
    return this.health <= 0;
  }

  /** Put on armor, up to the most that can be carried. */
  addArmor(points: number): void {
    this.armor = Math.min(config.player.armorMax, this.armor + Math.max(0, points));
  }

  damage(amount: number, kind: DamageKind): DamageResult {
    if (this.dead || amount <= 0) return { health: 0, armor: 0, killed: false };

    // Armor soaks up its share, but never more points than it has left.
    const absorbed = kind === 'gun' ? Math.min(this.armor, amount * config.player.armorBlock) : 0;
    const taken = Math.min(this.health, amount - absorbed);
    this.armor -= absorbed;
    this.health -= taken;
    return { health: taken, armor: absorbed, killed: this.dead };
  }
}
