import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { BotShooter } from './bot-shooting';

const { reactionSeconds } = config.bots;
const dt = 0.05;

/** Run simulated time and return how long it took until the bot could first shoot, or null. */
function timeToFirstShot(shooter: BotShooter, target: string | null, limit = 5): number | null {
  for (let t = dt; t <= limit; t += dt) if (shooter.update(dt, target)) return t;
  return null;
}

describe('BotShooter', () => {
  it('has a reaction delay in the config', () => {
    expect(reactionSeconds).toBeGreaterThan(0);
  });

  it('does not shoot the moment it sees an enemy', () => {
    const shooter = new BotShooter();
    expect(shooter.update(dt, 'player')).toBe(false);
    expect(shooter.update(reactionSeconds / 2, 'player')).toBe(false);
  });

  it('may shoot once the reaction time has passed', () => {
    const shooter = new BotShooter();
    const took = timeToFirstShot(shooter, 'player');
    expect(took).not.toBeNull();
    expect(took!).toBeGreaterThanOrEqual(reactionSeconds - 1e-9);
    expect(took!).toBeLessThan(reactionSeconds + 2 * dt);
  });

  it('keeps shooting while the target stays in sight', () => {
    const shooter = new BotShooter();
    timeToFirstShot(shooter, 'player');
    for (let i = 0; i < 20; i++) expect(shooter.update(dt, 'player')).toBe(true);
  });

  it('never shoots with nobody in sight', () => {
    const shooter = new BotShooter();
    expect(timeToFirstShot(shooter, null)).toBeNull();
    expect(shooter.target).toBeNull();
  });

  it('waits again after losing sight of the enemy', () => {
    const shooter = new BotShooter();
    timeToFirstShot(shooter, 'player');
    shooter.update(dt, null);
    expect(shooter.update(dt, 'player')).toBe(false);
    expect(timeToFirstShot(shooter, 'player')!).toBeGreaterThanOrEqual(reactionSeconds - dt - 1e-9);
  });

  it('waits again when it switches to another enemy', () => {
    const shooter = new BotShooter();
    timeToFirstShot(shooter, 'bot-2');
    expect(shooter.update(dt, 'bot-3')).toBe(false);
    expect(shooter.target).toBe('bot-3');
  });

  it('is not rushed by one long frame that is shorter than the delay', () => {
    const shooter = new BotShooter();
    expect(shooter.update(reactionSeconds - 0.01, 'player')).toBe(false);
    expect(shooter.update(0.01, 'player')).toBe(true);
  });
});
