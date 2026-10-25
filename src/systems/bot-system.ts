import { Group, type Object3D } from 'three';
import type { Bot } from '../entities/bot';
import { buildBotModel, updateBotModel } from '../render/bot-model';
import { spawnBots, stepBotDrop } from './bot-spawn';
import type { Damageable } from './damage-system';
import type { MotionWorld } from './player-motion';

/** Owns the bots of the match: they drop, land and are drawn, and the dead leave the update list. */
export class BotSystem {
  private readonly models = new Map<string, Group>();
  private living: Bot[];

  constructor(
    readonly all: readonly Bot[],
    private readonly scene: Object3D,
    private readonly world: MotionWorld,
    buildModel: (bot: Bot) => Group = (bot) => buildBotModel(bot),
  ) {
    this.living = [...all];
    for (const bot of all) {
      const model = buildModel(bot);
      updateBotModel(model, bot);
      this.models.set(bot.id, model);
      scene.add(model);
    }
  }

  /** Make the bots for a match from the seed and add them to the scene. */
  static create(seed: number, scene: Object3D, world: MotionWorld): BotSystem {
    return new BotSystem(spawnBots(seed), scene, world);
  }

  /** The bots still in the match, which shots can hit. */
  get alive(): readonly Bot[] {
    return this.living;
  }

  /** A bot as something that can take damage, found by id; dead and unknown ids give nothing. */
  damageable(id: string): Damageable | undefined {
    const bot = this.living.find((b) => b.id === id);
    return bot && { id: bot.id, health: bot.health };
  }

  update(dt: number): void {
    for (const bot of this.living) {
      stepBotDrop(bot, this.world, dt);
      const model = this.models.get(bot.id);
      if (model) updateBotModel(model, bot);
    }
    // A dead bot is taken out of the list and its model off the scene.
    const dead = this.living.filter((b) => b.health.dead);
    if (dead.length === 0) return;
    this.living = this.living.filter((b) => !b.health.dead);
    for (const bot of dead) {
      const model = this.models.get(bot.id);
      if (model) this.scene.remove(model);
      this.models.delete(bot.id);
    }
  }
}
