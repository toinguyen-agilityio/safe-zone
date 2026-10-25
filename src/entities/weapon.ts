import { config } from '../config';

export interface WeaponIntent {
  /** The trigger is held. */
  fire: boolean;
  /** The reload key was pressed this frame. */
  reload: boolean;
}

/** The player states that stop the rifle from firing. */
export interface WeaponCarrier {
  swimming: boolean;
  parachuting: boolean;
  sprinting: boolean;
}

export interface WeaponUpdate {
  /** Shots fired during this update. A very long frame can fire more than one. */
  shots: number;
  /** A reload began during this update. */
  reloadStarted: boolean;
  /** A reload finished during this update. */
  reloadFinished: boolean;
}

export function canFire(carrier: WeaponCarrier): boolean {
  return !carrier.swimming && !carrier.parachuting && !carrier.sprinting;
}

/**
 * The AK-Mia: automatic fire at a fixed rate, a magazine, and a timed reload from reserve ammo.
 * A shot hits instantly (hitscan), so the weapon only decides when a shot happens.
 */
export class Weapon {
  magazine: number;
  reserve: number;
  /** Seconds left in the current reload, or 0 when not reloading. */
  private reloadLeft = 0;
  /** Seconds until the next shot is allowed. Counts down while idle too, never below 0. */
  private cooldown = 0;

  constructor(reserve: number = config.combat.startingReserve) {
    this.magazine = config.combat.magazineSize;
    this.reserve = reserve;
  }

  get reloading(): boolean {
    return this.reloadLeft > 0;
  }

  update(dt: number, intent: WeaponIntent, carrier: WeaponCarrier): WeaponUpdate {
    const result: WeaponUpdate = { shots: 0, reloadStarted: false, reloadFinished: false };
    const { magazineSize, reloadSeconds, fireIntervalSeconds } = config.combat;

    this.cooldown -= dt;

    if (this.reloading) {
      this.reloadLeft -= dt;
      if (this.reloadLeft <= 0) {
        this.reloadLeft = 0;
        const moved = Math.min(magazineSize - this.magazine, this.reserve);
        this.magazine += moved;
        this.reserve -= moved;
        result.reloadFinished = true;
      }
      this.cooldown = Math.max(this.cooldown, 0);
      return result;
    }

    // A reload starts on the key, or by itself when the trigger is pulled on an empty magazine.
    const wantsReload = intent.reload && this.magazine < magazineSize;
    const emptyAndTrying = intent.fire && this.magazine === 0;
    if ((wantsReload || emptyAndTrying) && this.reserve > 0) {
      this.reloadLeft = reloadSeconds;
      this.cooldown = Math.max(this.cooldown, 0);
      result.reloadStarted = true;
      return result;
    }

    if (!(intent.fire && canFire(carrier) && this.magazine > 0)) {
      // Not shooting: time off the trigger is not saved up as extra shots later.
      this.cooldown = Math.max(this.cooldown, 0);
      return result;
    }

    // A long frame can owe more than one shot; the leftover time carries to the next frame.
    while (this.magazine > 0 && this.cooldown <= 0) {
      this.magazine--;
      this.cooldown += fireIntervalSeconds;
      result.shots++;
    }
    if (this.magazine === 0) this.cooldown = Math.max(this.cooldown, 0);
    return result;
  }
}
