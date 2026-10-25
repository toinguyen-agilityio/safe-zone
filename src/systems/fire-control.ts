import type { EventBus } from '../core/events';
import type { Player } from '../entities/player';
import type { Weapon } from '../entities/weapon';
import type { Rng } from '../core/rng';
import { applySpread, type Recoil } from './recoil';
import { currentSpread, type SpreadState } from './spread';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** One shot leaving the rifle: where the eyes are and which way they look. */
export interface ShotEvent {
  origin: Vec3;
  /** Unit vector. */
  direction: Vec3;
}

declare module '../core/events' {
  interface EventMap {
    shot: ShotEvent;
  }
}

/** The parts of the input the rifle reads. `Input` fits this. */
export interface FireInput {
  isMouseDown: (button: number) => boolean;
  isDown: (code: string) => boolean;
}

const LEFT_BUTTON = 0;
const RELOAD_KEY = 'KeyR';

/** The way a player looking at `yaw` and `pitch` is facing. Yaw 0 looks toward -z. */
export function lookDirection(yaw: number, pitch: number): Vec3 {
  const flat = Math.cos(pitch);
  return { x: -Math.sin(yaw) * flat, y: Math.sin(pitch), z: -Math.cos(yaw) * flat };
}

/**
 * Reads the left mouse button and R every frame, runs the weapon and emits a `shot` event for
 * each shot. A button that was already down when the mouse got captured (the click that captured
 * it) does not fire: the shooting starts with a new press.
 */
export class FireControl {
  private wasDown = false;
  private armed = false;
  private wasReloadDown = false;

  /**
   * Without the options every shot goes exactly where the player looks. With them, each shot is
   * offset at random inside the spread cone for what the player is doing, and kicks the view.
   */
  constructor(
    private readonly weapon: Weapon,
    private readonly player: Player,
    private readonly input: FireInput,
    private readonly events: EventBus,
    private readonly options: {
      rng?: Rng;
      spreadState?: () => SpreadState;
      recoil?: Recoil;
    } = {},
  ) {}

  /** `locked` is true while the mouse is captured. Returns the shots fired this frame. */
  update(dt: number, locked: boolean): number {
    const down = this.input.isMouseDown(LEFT_BUTTON);
    if (!down) this.armed = false;
    else if (!this.wasDown && locked) this.armed = true;
    this.wasDown = down;

    const reloadDown = this.input.isDown(RELOAD_KEY);
    const reloadPressed = reloadDown && !this.wasReloadDown;
    this.wasReloadDown = reloadDown;

    const result = this.weapon.update(
      dt,
      { fire: locked && this.armed, reload: locked && reloadPressed },
      this.player,
    );

    const { rng, spreadState, recoil } = this.options;
    for (let i = 0; i < result.shots; i++) {
      // The bullet leaves before the kick of this shot lifts the view.
      let direction = lookDirection(this.player.yaw, this.player.pitch);
      if (rng && spreadState) direction = applySpread(direction, currentSpread(spreadState()), rng);
      this.events.emit('shot', {
        origin: { x: this.player.x, y: this.player.y, z: this.player.z },
        direction,
      });
      recoil?.kick(this.player);
    }
    recoil?.update(dt, this.player);
    return result.shots;
  }
}
