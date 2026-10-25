export const combat = {
  magazineSize: 30,
  reloadSeconds: 1.8,
  headMultiplier: 2,
  /** Seconds between two shots while the trigger is held (10 rounds per second). */
  fireIntervalSeconds: 0.1,
  /** Reserve ammo the player starts the match with, on top of the full magazine. */
  startingReserve: 90,
} as const;
