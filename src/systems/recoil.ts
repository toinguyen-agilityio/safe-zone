import { config } from '../config';
import type { Rng } from '../core/rng';
import { pitchLimit } from './look';

const DEGREES = Math.PI / 180;

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * The kick of the rifle. Each shot raises the view a little; once the trigger is released the view
 * settles back down by the amount the kicks added, so it ends up where the player was aiming.
 */
export class Recoil {
  /** How much of the player's pitch is recoil right now, in radians. */
  private applied = 0;
  /** Seconds since the last shot. */
  private sinceShot = Infinity;

  get amount(): number {
    return this.applied;
  }

  /** Kick the view up for one shot. */
  kick(player: { pitch: number }): void {
    const { kickDegrees, maxDegrees } = config.combat.recoil;
    const room = Math.max(0, maxDegrees * DEGREES - this.applied);
    const add = Math.min(kickDegrees * DEGREES, room, pitchLimit() - player.pitch);
    if (add > 0) {
      this.applied += add;
      player.pitch += add;
    }
    this.sinceShot = 0;
  }

  /** Let the view settle back once the shooting has stopped for a moment. */
  update(dt: number, player: { pitch: number }): void {
    const { recoverDegreesPerSecond, recoverDelaySeconds } = config.combat.recoil;
    this.sinceShot += dt;
    if (this.sinceShot <= recoverDelaySeconds || this.applied <= 0) return;
    const back = Math.min(this.applied, recoverDegreesPerSecond * DEGREES * dt);
    this.applied -= back;
    player.pitch -= back;
  }
}

/**
 * A direction picked at random inside a cone around `direction`, `spread` radians wide at most.
 * The picks are even across the cone's disc, not bunched at the middle. Needs a unit vector.
 */
export function applySpread(direction: Vec3, spread: number, rng: Rng): Vec3 {
  if (spread <= 0) return direction;
  const angle = spread * Math.sqrt(rng.float());
  const around = rng.float() * Math.PI * 2;

  // Two vectors at right angles to the direction to swing it toward.
  const helper = Math.abs(direction.y) < 0.99 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
  const side = normalize(cross(direction, helper));
  const up = cross(side, direction);

  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const swing = { x: Math.cos(around), y: Math.sin(around) };
  return normalize({
    x: direction.x * cos + (side.x * swing.x + up.x * swing.y) * sin,
    y: direction.y * cos + (side.y * swing.x + up.y * swing.y) * sin,
    z: direction.z * cos + (side.z * swing.x + up.z * swing.y) * sin,
  });
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}
