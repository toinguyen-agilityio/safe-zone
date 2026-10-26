import { Group, Object3D } from 'three';
import { zoneInfo } from '../../src/ai/zone-move';
import { config } from '../../src/config';
import { EventBus } from '../../src/core/events';
import { AiSystem } from '../../src/systems/ai-system';
import { BotSystem } from '../../src/systems/bot-system';
import { spawnBots } from '../../src/systems/bot-spawn';
import { connectDamage } from '../../src/systems/damage-system';
import { KillLog, type KillCause } from '../../src/systems/kill-log';
import { createMotionWorld } from '../../src/systems/player-motion';
import { connectShotResolution, createShotObstacles } from '../../src/systems/shot';
import { ZoneDamageSystem } from '../../src/systems/zone-damage-system';
import { zoneDuration } from '../../src/systems/zone';
import { ZoneSystem } from '../../src/systems/zone-system';
import { getLayout } from '../../src/world/layout';

export interface MatchOptions {
  /** Seconds per step. */
  dt?: number;
  /** The match ends after this many seconds if more than one bot is left. */
  maxSeconds?: number;
  /** A bot counts as stuck at its death if it was stuck within this many seconds before. */
  stuckWindow?: number;
}

export interface Death {
  id: string;
  cause: KillCause;
  /** Who shot it, or null for the flood. */
  killer: string | null;
  /** Seconds into the match. */
  time: number;
  /** It was working its way round an obstacle shortly before it died. */
  stuck: boolean;
}

export interface MatchResult {
  seed: number;
  /** Seconds simulated. */
  duration: number;
  deaths: Death[];
  /** The last bot standing, or null when the time ran out with several left or all died. */
  winner: string | null;
  survivors: string[];
  /** Deaths by cause. */
  causes: Record<KillCause, number>;
}

/**
 * Play a whole match with no renderer and no player: the bots drop in, fight each other and run
 * from the flood, using the real systems on fixed time steps. The same seed gives the same match.
 */
export function runMatch(seed: number, options: MatchOptions = {}): MatchResult {
  const dt = options.dt ?? 0.1;
  const maxSeconds = options.maxSeconds ?? zoneDuration() + 120;
  const stuckWindow = options.stuckWindow ?? 5;

  const layout = getLayout();
  const world = createMotionWorld(layout);
  const events = new EventBus();
  const kills = new KillLog(events);
  const bots = new BotSystem(spawnBots(seed), new Object3D(), world, () => new Group());
  const zone = new ZoneSystem(events, seed);
  const obstacles = createShotObstacles(layout, seed);

  let clock = 0;
  connectShotResolution(events, { obstacles, targets: () => bots.alive });
  connectDamage(events, { entity: (id) => bots.damageable(id), kills, now: () => clock });
  const ai = new AiSystem(
    bots,
    world,
    obstacles,
    () => null,
    seed,
    events,
    () => zoneInfo(zone),
  );
  const flood = new ZoneDamageSystem({
    zone,
    victims: () =>
      bots.alive.map((bot) => ({
        id: bot.id,
        x: bot.x,
        z: bot.z,
        health: bot.health,
        skip: bot.parachuting,
      })),
    kills,
    now: () => clock,
    events,
  });

  const lastStuck = new Map<string, number>();
  const stuckAtDeath = new Map<string, boolean>();
  while (clock < maxSeconds && bots.alive.length > 1) {
    clock += dt;
    zone.update(dt);
    flood.update(dt);
    ai.update(dt);
    for (const bot of bots.alive) if (ai.isStuck(bot)) lastStuck.set(bot.id, clock);
    // Note who was stuck before the dead are taken out of the list.
    for (const bot of bots.alive) {
      if (bot.health.dead) {
        stuckAtDeath.set(bot.id, clock - (lastStuck.get(bot.id) ?? -Infinity) <= stuckWindow);
      }
    }
    bots.update(dt);
  }

  const deaths: Death[] = kills.all.map((kill) => ({
    id: kill.victim,
    cause: kill.cause,
    killer: kill.killer,
    time: kill.time,
    stuck: stuckAtDeath.get(kill.victim) ?? false,
  }));
  const survivors = bots.alive.map((b) => b.id);
  return {
    seed,
    duration: clock,
    deaths,
    winner: survivors.length === 1 ? survivors[0]! : null,
    survivors,
    causes: {
      shot: deaths.filter((d) => d.cause === 'shot').length,
      flood: deaths.filter((d) => d.cause === 'flood').length,
    },
  };
}

/** How many bots start a match. */
export const BOT_COUNT = config.bots.count;
