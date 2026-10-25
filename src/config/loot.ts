export const loot = {
  itemCount: 150,
  carryLimit: { banhMi: 5, sugarcaneJuice: 3, ammo: 180 },
  /** Rounds in one ammo box. */
  ammoBoxAmount: 30,
  /** Armor points a raincoat gives, up to the most that can be worn. */
  raincoatArmor: 60,
  banhMi: { healAmount: 30, healSeconds: 2 },
  sugarcaneJuice: { healAmount: 15, healSeconds: 1.2, buffSeconds: 8 },
} as const;
