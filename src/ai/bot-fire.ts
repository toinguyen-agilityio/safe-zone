import { config } from '../config';
import type { EventBus } from '../core/events';
import type { Rng } from '../core/rng';
import type { Bot } from '../entities/bot';
import { Weapon } from '../entities/weapon';
import type { HitRegion } from '../physics/hitboxes';
import { damageFor, type HitEvent } from '../systems/shot';
import { hitChance } from './hit-chance';
import { BotShooter } from './bot-shooting';
import type { Combatant } from './targeting';

/** Pick where a hit lands from the configured odds. */
export function rollRegion(rng: Rng): HitRegion {
  const { head, torso } = config.bots.regionOdds;
  const roll = rng.float();
  return roll < head ? 'head' : roll < head + torso ? 'torso' : 'legs';
}

/**
 * One bot's gun. It follows the same weapon rules as the player (magazine, reload, ammo), waits
 * the reaction time before the first shot, and rolls the hit chance for each shot: a miss does
 * nothing, a hit goes out as a `hit` event for the damage system to apply.
 */
export class BotFire {
  readonly weapon = new Weapon();
  private readonly shooter = new BotShooter();
  /** Seconds until the bot may pull the trigger again. */
  private cooldown = 0;

  constructor(
    private readonly rng: Rng,
    private readonly events: EventBus,
  ) {}

  /**
   * Call every frame. `target` is who the bot is fighting, or null; it only shoots while
   * `fighting` is true. Returns how many shots left the gun this frame.
   */
  update(dt: number, bot: Bot, target: Combatant | null, fighting: boolean): number {
    const aimed = fighting ? target : null;
    const mayShoot = this.shooter.update(dt, aimed ? aimed.id : null);
    this.cooldown = Math.max(0, this.cooldown - dt);

    const pull = mayShoot && this.cooldown <= 0;
    const result = this.weapon.update(
      dt,
      { fire: pull, reload: false },
      { swimming: false, parachuting: bot.parachuting, sprinting: false, dead: bot.health.dead },
    );
    if (!aimed || result.shots === 0) return result.shots;

    this.cooldown = config.bots.fireIntervalSeconds;
    const eyeY = bot.feetY + config.player.eyeHeight;
    const dx = aimed.x - bot.x;
    const dz = aimed.z - bot.z;
    const distance = Math.hypot(dx, dz);
    for (let i = 0; i < result.shots; i++) {
      const chance = hitChance({
        distance,
        running: Boolean(aimed.running),
        airborne: Boolean(aimed.airborne),
      });
      if (this.rng.float() >= chance) continue;
      const region = rollRegion(this.rng);
      const hit: HitEvent = {
        target: aimed.id,
        region,
        damage: damageFor(region),
        distance,
        shooter: bot.id,
        origin: { x: bot.x, y: eyeY, z: bot.z },
      };
      this.events.emit('hit', hit);
    }
    return result.shots;
  }
}
