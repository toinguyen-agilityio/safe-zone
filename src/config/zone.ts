export const zone = {
  /** The dry zone before the first phase: wide enough to cover the whole square map. */
  startRadius: 460,
  /** The radius after each phase's shrink. */
  radii: [230, 130, 68, 30, 6],
  drainStart: 1,
  drainEnd: 12,
  waitSeconds: [60, 50, 40, 30, 20],
  shrinkSeconds: [45, 40, 35, 30, 25],
} as const;
