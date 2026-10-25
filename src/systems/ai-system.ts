import { createRng } from '../core/rng';
import { BotBrain } from '../ai/bot-brain';
import { pickTarget, type Combatant } from '../ai/targeting';
import type { Bot } from '../entities/bot';
import type { BoxQuery, RayBox } from '../physics/raycast';
import type { BotSystem } from './bot-system';
import type { MotionWorld } from './player-motion';

/** Seconds between a bot's looks around for a target; in between it keeps the one it has. */
const RETARGET_SECONDS = 0.25;

interface BotMind {
  brain: BotBrain;
  target: Combatant | null;
  retargetLeft: number;
}

/**
 * Runs every living bot's brain each frame: it picks the nearest enemy in sight (the player or
 * another bot), moves toward it with the brain, and keeps its feet on the ground.
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
      const lost =
        mind.target?.dead || (mind.target && !this.stillThere(mind.target, alive, player));
      if (mind.retargetLeft <= 0 || lost) {
        // Stagger the looks so the bots do not all search in the same frame.
        mind.retargetLeft = RETARGET_SECONDS + (index % 5) * 0.01;
        const candidates: Combatant[] = player ? [player, ...alive] : [...alive];
        mind.target = pickTarget(bot, candidates, this.obstacles);
      }

      // Follow the target where it is now, not where it was when it was picked.
      const current = mind.target && this.positionOf(mind.target, alive, player);
      mind.brain.update(bot, current ?? null, this.world.collision, dt);
      bot.feetY = this.world.groundHeight(bot.x, bot.z, bot.feetY);
    }
  }

  private mindOf(bot: Bot): BotMind {
    let mind = this.minds.get(bot.id);
    if (!mind) {
      const seed = this.seed ^ (this.minds.size * 0x9e3779b1);
      mind = { brain: new BotBrain(createRng(seed)), target: null, retargetLeft: 0 };
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
