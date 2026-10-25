export const loot = {
  itemCount: 150,
  /** Items lie on the street edge, this far from the street's centre line (min, max). */
  sidewalkOffset: { min: 4.5, max: 6.5 },
  /** Walking this close to an item picks it up. */
  pickupRadius: 1.5,
  /** Items keep at least this far from houses, landmarks, the river and each other. */
  clearance: 1,
  minSpacing: 6,
  carryLimit: { banhMi: 5, sugarcaneJuice: 3, ammo: 180 },
  /** Rounds in one ammo box. */
  ammoBoxAmount: 30,
  /** Armor points a raincoat gives, up to the most that can be worn. */
  raincoatArmor: 60,
  /** Walking speed multiplier while eating or drinking. */
  healMoveMultiplier: 0.4,
  banhMi: { healAmount: 30, healSeconds: 2 },
  sugarcaneJuice: {
    healAmount: 15,
    healSeconds: 1.2,
    buffSeconds: 8,
    /** Speed multiplier while the buff lasts. */
    buffSpeedMultiplier: 1.25,
  },
} as const;
