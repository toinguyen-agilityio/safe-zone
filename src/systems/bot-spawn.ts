import { config } from '../config';
import { createRng } from '../core/rng';
import { createBot, type Bot } from '../entities/bot';
import { pickBotNames } from '../entities/bot-names';
import { stepParachute } from './parachute';
import { resolveLanding } from './landing';
import type { MotionWorld } from './player-motion';

const NO_KEYS = { forward: false, back: false, left: false, right: false, sprint: false };

/**
 * `count` bots over the map at seeded spots, ready to drop. The map is split into four quarters
 * and the bots are dealt out to them in turn, so every quarter gets some and the field is spread.
 */
export function spawnBots(
  seed: number = config.world.defaultSeed,
  count: number = config.bots.count,
): Bot[] {
  const rng = createRng(seed ^ 0xb075);
  const names = pickBotNames(rng, count);
  const half = config.world.mapSize / 2 - config.bots.dropMargin;
  return names.map((name, index) => {
    const quarter = index % 4;
    const east = quarter % 2 === 1;
    const south = quarter >= 2;
    // Each coordinate lies in its own half of the map, away from the middle lines.
    const x = (east ? 1 : -1) * (half * 0.05 + rng.float() * half * 0.95);
    const z = (south ? 1 : -1) * (half * 0.05 + rng.float() * half * 0.95);
    return createBot(index, name, x, z);
  });
}

/**
 * One step of a bot's drop: it falls under the canopy at the steady speed, and on touchdown it
 * is moved out of any house to the nearest free ground. A bot that has landed does not change.
 */
export function stepBotDrop(bot: Bot, world: MotionWorld, dt: number): void {
  if (!bot.parachuting) return;
  const ground = world.groundHeight(bot.x, bot.z, bot.feetY);
  const next = stepParachute(
    { x: bot.x, z: bot.z, feetY: bot.feetY, landed: false },
    NO_KEYS,
    bot.yaw,
    false,
    ground,
    dt,
  );
  bot.x = next.x;
  bot.z = next.z;
  bot.feetY = next.feetY;
  if (!next.landed) return;

  const spot = resolveLanding(next, world.collision);
  bot.x = spot.x;
  bot.z = spot.z;
  bot.feetY = world.groundHeight(spot.x, spot.z, next.feetY);
  bot.parachuting = false;
}
