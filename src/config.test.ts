import { describe, expect, it } from 'vitest';
import { config } from './config';

describe('config', () => {
  it('defines world values', () => {
    expect(config.world.mapSize).toBe(640);
    expect(typeof config.world.defaultSeed).toBe('number');
    expect(config.world.maxDt).toBe(0.05);
    expect(config.world.gridCellSize).toBeGreaterThan(0);
    expect(config.world.river.bedDepth).toBeGreaterThan(0);
    expect(config.world.river.waterLevel).toBeLessThan(0);
  });

  it('defines player values', () => {
    expect(config.player).toEqual({
      health: 100,
      armorMax: 60,
      armorBlock: 0.45,
      parachuteStartHeight: 75,
      parachute: { fallSpeed: 6, fastFallSpeed: 20, driftSpeed: 9 },
      radius: 0.4,
      eyeHeight: 1.7,
      spawn: { x: 0, z: 0 },
      swimSpeed: 2.2,
      sprintMultiplier: 1.7,
      gravity: 24,
      jumpSpeed: 7.5,
      climbSpeed: 6,
      fallSpeed: 14,
      walkSpeed: 5,
      lookSensitivity: 0.0022,
      pitchLimitDegrees: 85,
    });
  });

  it('defines combat values', () => {
    expect(config.combat).toEqual({
      magazineSize: 30,
      reloadSeconds: 1.8,
      headMultiplier: 2,
      bodyDamage: 25,
      spread: { standingDegrees: 0.3, movingDegrees: 1.5, airborneDegrees: 4, aimMultiplier: 0.4 },
      recoil: {
        kickDegrees: 0.7,
        maxDegrees: 10,
        recoverDegreesPerSecond: 8,
        recoverDelaySeconds: 0.12,
      },
      aim: { fovDegrees: 35, transitionSeconds: 0.15 },
      maxShotDistance: 400,
      fireIntervalSeconds: 0.1,
      startingReserve: 90,
      hitboxes: {
        legsTop: 0.9,
        torsoTop: 1.5,
        height: 1.8,
        halfWidth: 0.35,
        headHalfWidth: 0.2,
      },
    });
  });

  it('defines bot and ui values', () => {
    expect(config.bots.count).toBe(19);
    expect(config.bots.dropMargin).toBe(20);
    expect(config.bots.walkSpeed).toBe(4);
    expect(config.bots.engageRange).toBe(25);
    expect(config.bots.disengageRange).toBe(30);
    expect(config.bots.reactionSeconds).toBe(0.5);
    expect(config.bots.hitChance).toEqual({
      close: 0.8,
      far: 0.1,
      nearRange: 10,
      farRange: 100,
      runningMultiplier: 0.6,
      airborneMultiplier: 0.4,
    });
    expect(config.bots.fireIntervalSeconds).toBe(0.4);
    expect(config.bots.regionOdds).toEqual({ head: 0.1, torso: 0.6 });
    expect(config.bots.strafeSpeed).toBe(2.5);
    expect(config.bots.strafeTurnSeconds).toEqual({ min: 0.8, max: 2.2 });
    expect(config.bots.zoneWarningSeconds).toBe(20);
    expect(config.bots.arriveDistance).toBe(2);
    expect(config.bots.zoneFightRange).toBe(40);
    expect(config.bots.underFireSeconds).toBe(3);
    expect(config.bots.stuck).toEqual({ progress: 0.5, seconds: 2, longSeconds: 40 });
    expect(config.bots.unstick).toEqual({ probeStep: 0.6 });
    expect(config.bots.avoidSeconds).toBe(15);
    expect(config.bots.wanderSpeed).toBe(1.5);
    expect(config.bots.wanderTurnSeconds).toEqual({ min: 2, max: 5 });
    expect(config.ui.killFeedMax).toBe(5);
    expect(config.ui.bannerSeconds).toBe(4);
  });

  it('defines zone values', () => {
    expect(config.zone.startRadius).toBe(460);
    expect(config.zone.radii).toEqual([230, 130, 68, 30, 6]);
    expect(config.zone.drainStart).toBe(1);
    expect(config.zone.drainEnd).toBe(12);
    expect(config.zone.drainPerSecond).toEqual([1, 3, 6, 9, 12]);
    expect(config.zone.waitSeconds).toHaveLength(5);
    expect(config.zone.shrinkSeconds).toHaveLength(5);
  });

  it('defines loot values', () => {
    expect(config.loot.itemCount).toBe(150);
    expect(config.loot.sidewalkOffset).toEqual({ min: 4.5, max: 6.5 });
    expect(config.loot.pickupRadius).toBe(1.5);
    expect(config.loot.clearance).toBe(1);
    expect(config.loot.minSpacing).toBe(6);
    expect(config.loot.carryLimit).toEqual({ banhMi: 5, sugarcaneJuice: 3, ammo: 180 });
    expect(config.loot.ammoBoxAmount).toBe(30);
    expect(config.loot.raincoatArmor).toBe(60);
    expect(config.loot.healMoveMultiplier).toBe(0.4);
    expect(config.loot.banhMi).toEqual({ healAmount: 30, healSeconds: 2 });
    expect(config.loot.sugarcaneJuice).toEqual({
      healAmount: 15,
      healSeconds: 1.2,
      buffSeconds: 8,
      buffSpeedMultiplier: 1.25,
    });
  });
});
