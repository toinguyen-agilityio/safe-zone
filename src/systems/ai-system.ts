import { config } from '../config';
import { createRng } from '../core/rng';
import type { EventBus } from '../core/events';
import { BotBrain } from '../ai/bot-brain';
import { BotFire } from '../ai/bot-fire';
import { ZoneMover, type ZoneInfo } from '../ai/zone-move';
import { pickTarget, type Combatant } from '../ai/targeting';
import type { Bot } from '../entities/bot';
import type { BoxQuery, RayBox } from '../physics/raycast';
import type { BotSystem } from './bot-system';
import type { MotionWorld } from './player-motion';

/** Seconds between a bot's looks around for a target; in between it keeps the one it has. */
const RETARGET_SECONDS = 0.25;

interface BotMind {
  brain: BotBrain;
  fire: BotFire;
  mover: ZoneMover;
  /** An enemy this bot could not reach, ignored until `avoidLeft` runs out. */
  avoid: string | null;
  avoidLeft: number;
  target: Combatant | null;
  retargetLeft: number;
}

/**
 * Runs every living bot's brain each frame: it picks the nearest enemy in sight (the player or
 * another bot), moves toward it with the brain, shoots at it once engaged, and keeps its feet
 * on the ground.
 */
export class AiSystem {
  private readonly minds = new Map<string, BotMind>();

  constructor(
    private readonly bots: BotSystem,
    private readonly world: MotionWorld,
    private readonly obstacles: BoxQuery<RayBox> | readonly RayBox[],
    /** The player as an enemy, or null when there is none. */
    private readonly player: () => Combatant | null,
    private readonly seed: number,
    /** Where the bots' hits go, for the damage system. */
    private readonly events: EventBus,
    /** What the zone is doing, so bots can walk into the next dry zone; none means they do not. */
    private readonly zone: () => ZoneInfo | null = () => null,
  ) {}

  /** The brain's current mode for a bot, for tests and debugging. */
  modeOf(bot: Bot): string {
    return this.minds.get(bot.id)?.brain.mode ?? 'idle';
  }

  update(dt: number): void {
    const alive = this.bots.alive;
    const player = this.player();
    for (const [index, bot] of alive.entries()) {
      if (bot.parachuting) continue;
      const mind = this.mindOf(bot);

      mind.retargetLeft -= dt;
      mind.avoidLeft = Math.max(0, mind.avoidLeft - dt);
      if (mind.avoidLeft === 0) mind.avoid = null;
      const lost =
        mind.target?.dead || (mind.target && !this.stillThere(mind.target, alive, player));
      if (mind.retargetLeft <= 0 || lost) {
        // Stagger the looks so the bots do not all search in the same frame.
        mind.retargetLeft = RETARGET_SECONDS + (index % 5) * 0.01;
        const candidates: Combatant[] = (player ? [player, ...alive] : [...alive]).filter(
          (c) => c.id !== mind.avoid,
        );
        mind.target = pickTarget(bot, candidates, this.obstacles);
      }

      // Follow the target where it is now, not where it was when it was picked.
      const current = mind.target && this.positionOf(mind.target, alive, player);
      const goal = mind.mover.update(bot, this.zone(), this.world.collision);
      mind.brain.update(bot, current ?? null, this.world.collision, dt, goal);
      mind.fire.update(dt, bot, current ?? null, mind.brain.mode === 'engage');
      this.handleGiveUp(mind);
      bot.feetY = this.world.groundHeight(bot.x, bot.z, bot.feetY);
    }
  }

  /** A bot stuck for too long drops its goal: a new destination, or someone else to fight. */
  private handleGiveUp(mind: BotMind): void {
    const gaveUp = mind.brain.takeGiveUp();
    if (gaveUp === 'destination') {
      mind.mover.reroll();
    } else if (gaveUp === 'target' && mind.target) {
      mind.avoid = mind.target.id;
      mind.avoidLeft = config.bots.avoidSeconds;
      mind.target = null;
      mind.retargetLeft = 0;
    }
  }

  private mindOf(bot: Bot): BotMind {
    let mind = this.minds.get(bot.id);
    if (!mind) {
      const seed = this.seed ^ (this.minds.size * 0x9e3779b1);
      mind = {
        brain: new BotBrain(createRng(seed)),
        fire: new BotFire(createRng(seed ^ 0xf17e), this.events),
        mover: new ZoneMover(createRng(seed ^ 0x20ee)),
        avoid: null,
        avoidLeft: 0,
        target: null,
        retargetLeft: 0,
      };
      this.minds.set(bot.id, mind);
    }
    return mind;
  }

  private positionOf(
    target: Combatant,
    alive: readonly Bot[],
    player: Combatant | null,
  ): Combatant | null {
    if (player && target.id === player.id) return player;
    return alive.find((b) => b.id === target.id) ?? null;
  }

  private stillThere(target: Combatant, alive: readonly Bot[], player: Combatant | null): boolean {
    return this.positionOf(target, alive, player) !== null;
  }
}
