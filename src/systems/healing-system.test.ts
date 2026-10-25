import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { EventBus } from '../core/events';
import { Health } from '../entities/health';
import { Inventory } from '../entities/inventory';
import { createPlayer, updatePlayer } from '../entities/player';
import { Healing } from './healing';
import { HealingSystem } from './healing-system';

class FakeInput {
  keys = new Set<string>();
  isDown = (code: string) => this.keys.has(code);
}

function setup() {
  const health = new Health();
  health.damage(60, 'flood');
  const inventory = new Inventory(health);
  for (let i = 0; i < 2; i++) {
    inventory.addItem('banhMi');
    inventory.addItem('sugarcaneJuice');
  }
  const input = new FakeInput();
  const events = new EventBus();
  const healing = new Healing(health, inventory);
  const system = new HealingSystem(healing, input, events);
  const ctx = { locked: true, shots: 0, blocked: false };
  const press = (code: string, seconds = 0.1) => {
    input.keys.add(code);
    system.update(seconds, ctx);
    input.keys.delete(code);
  };
  return { health, inventory, healing, system, events, input, ctx, press };
}

describe('HealingSystem keys', () => {
  it('starts eating on key 1', () => {
    const { healing, press } = setup();
    press('Digit1');
    expect(healing.state).toBe('banhMi');
  });

  it('starts drinking on key 2', () => {
    const { healing, press } = setup();
    press('Digit2');
    expect(healing.state).toBe('sugarcaneJuice');
  });

  it('heals and uses the item when the time is over', () => {
    const { health, inventory, system, press, ctx } = setup();
    press('Digit1');
    for (let t = 0; t < 2.2; t += 0.1) system.update(0.1, ctx);
    expect(health.health).toBe(70);
    expect(inventory.count('banhMi')).toBe(1);
  });

  it('ignores the keys when the mouse is not captured', () => {
    const { healing, input, system, ctx } = setup();
    input.keys.add('Digit1');
    system.update(0.1, { ...ctx, locked: false });
    expect(healing.state).toBe('idle');
  });

  it('starts once per key press, not every frame the key is held', () => {
    const { healing, input, system, ctx, health } = setup();
    input.keys.add('Digit1');
    system.update(0.1, ctx);
    for (let t = 0; t < 3; t += 0.1) system.update(0.1, ctx);
    // Held down for the whole meal: it finished once and did not start a second one.
    expect(healing.state).toBe('idle');
    expect(health.health).toBe(70);
  });
});

describe('moving while healing', () => {
  it('slows the player while eating and drinking', () => {
    const { system, press } = setup();
    expect(system.moveMultiplier).toBe(1);
    press('Digit1');
    expect(system.moveMultiplier).toBe(config.loot.healMoveMultiplier);
    expect(system.busy).toBe(true);
  });

  it('really makes the player walk slower', () => {
    const walk = (speedMultiplier: number) => {
      const player = createPlayer();
      updatePlayer(
        player,
        {
          keys: { forward: true, back: false, left: false, right: false },
          mouseDelta: { x: 0, y: 0 },
          locked: true,
          speedMultiplier,
        },
        1,
      );
      return Math.hypot(player.x - config.player.spawn.x, player.z - config.player.spawn.z);
    };
    expect(walk(0.4)).toBeCloseTo(walk(1) * 0.4);
    expect(walk(1)).toBeCloseTo(config.player.walkSpeed);
  });

  it('gives the speed buff after juice', () => {
    const { system, press, ctx } = setup();
    press('Digit2');
    for (let t = 0; t < 1.5; t += 0.1) system.update(0.1, ctx);
    expect(system.busy).toBe(false);
    expect(system.moveMultiplier).toBe(config.loot.sugarcaneJuice.buffSpeedMultiplier);
  });
});

describe('cancelling', () => {
  it('shooting cancels it and the item is not used', () => {
    const { healing, inventory, health, system, press, ctx } = setup();
    press('Digit1');
    system.update(0.5, { ...ctx, shots: 1 });
    expect(healing.state).toBe('idle');
    for (let t = 0; t < 3; t += 0.1) system.update(0.1, ctx);
    expect(inventory.count('banhMi')).toBe(2);
    expect(health.health).toBe(40);
  });

  it('taking damage cancels it and the item is not used', () => {
    const { healing, inventory, events, system, press, ctx } = setup();
    press('Digit1');
    events.emit('damage', { target: 'player', health: 10, armor: 0, from: null });
    expect(healing.state).toBe('idle');
    for (let t = 0; t < 3; t += 0.1) system.update(0.1, ctx);
    expect(inventory.count('banhMi')).toBe(2);
  });

  it('damage to someone else does not cancel it', () => {
    const { healing, events, press } = setup();
    press('Digit1');
    events.emit('damage', { target: 'bot-1', health: 10, armor: 0, from: null });
    expect(healing.state).toBe('banhMi');
  });

  it('cannot start while swimming, parachuting or dead, and stops if it becomes blocked', () => {
    const { healing, input, system, ctx, press } = setup();
    input.keys.add('Digit1');
    system.update(0.1, { ...ctx, blocked: true });
    input.keys.delete('Digit1');
    system.update(0.1, ctx);
    expect(healing.state).toBe('idle');
    press('Digit1');
    expect(healing.state).toBe('banhMi');
    system.update(0.1, { ...ctx, blocked: true });
    expect(healing.state).toBe('idle');
  });
});
