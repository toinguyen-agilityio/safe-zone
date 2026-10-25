import { config } from '../config';

export interface MoveKeys {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
}

export interface Velocity {
  x: number;
  z: number;
}

/** Which movement keys are down, read from any `isDown(code)` source such as `Input`. */
export function readMoveKeys(input: { isDown: (code: string) => boolean }): MoveKeys {
  return {
    forward: input.isDown('KeyW'),
    back: input.isDown('KeyS'),
    left: input.isDown('KeyA'),
    right: input.isDown('KeyD'),
  };
}

/**
 * Walking velocity on the ground plane. Yaw 0 looks toward -z and a positive yaw turns left,
 * as in three.js, so forward is (-sin yaw, -cos yaw) and right is (cos yaw, -sin yaw).
 * Diagonal movement is normalized so it is not faster than walking straight.
 */
export function walkVelocity(
  keys: MoveKeys,
  yaw: number,
  speed: number = config.player.walkSpeed,
): Velocity {
  const ahead = (keys.forward ? 1 : 0) - (keys.back ? 1 : 0);
  const side = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  if (ahead === 0 && side === 0) return { x: 0, z: 0 };

  const length = Math.hypot(ahead, side);
  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  const forwardX = -sin;
  const forwardZ = -cos;
  const rightX = cos;
  const rightZ = -sin;
  return {
    x: ((forwardX * ahead + rightX * side) / length) * speed,
    z: ((forwardZ * ahead + rightZ * side) / length) * speed,
  };
}
