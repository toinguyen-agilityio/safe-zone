import { config } from '../config';

export interface AimState {
  /** Right mouse button is held. */
  wantsAim: boolean;
  swimming: boolean;
  parachuting: boolean;
  sprinting: boolean;
}

/** Aiming is allowed wherever shooting is: not while swimming, parachuting or sprinting. */
export function canAim(state: Omit<AimState, 'wantsAim'>): boolean {
  return !state.swimming && !state.parachuting && !state.sprinting;
}

/** Eases between hip fire (0) and fully aimed (1) while the right mouse button is held. */
export class Aim {
  private value = 0;

  /** 0 at the hip, 1 fully aimed; in between while the view moves. */
  get amount(): number {
    return this.value;
  }

  /** True from the moment aiming starts until it is released, for the spread model. */
  get aiming(): boolean {
    return this.target;
  }

  private target = false;

  update(dt: number, state: AimState): void {
    this.target = state.wantsAim && canAim(state);
    const step = dt / config.combat.aim.transitionSeconds;
    this.value = this.target ? Math.min(1, this.value + step) : Math.max(0, this.value - step);
  }
}
