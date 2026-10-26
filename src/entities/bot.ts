import { config } from '../config';
import type { Character } from '../physics/hitboxes';
import { Health } from './health';

/** An opponent. It has the shape of a character, so shots can hit it once it is a target. */
export interface Bot extends Character {
  id: string;
  /** A funny Vietnamese name. */
  name: string;
  health: Health;
  /** Direction it faces, like the player's yaw. */
  yaw: number;
  /** Still under the parachute. */
  parachuting: boolean;
}

/** A bot high above (x, z), ready to start its drop with full health. */
export function createBot(index: number, name: string, x: number, z: number): Bot {
  return {
    id: `bot-${index + 1}`,
    name,
    x,
    z,
    feetY: config.player.parachuteStartHeight,
    yaw: Math.atan2(x, z),
    health: new Health(),
    parachuting: true,
  };
}
