export const player = {
  health: 100,
  armorMax: 60,
  armorBlock: 0.45,
  parachuteStartHeight: 75,
  /** Radians of turn per pixel of mouse movement. */
  lookSensitivity: 0.0022,
  /** Looking straight up or down is limited to this many degrees from level. */
  pitchLimitDegrees: 85,
} as const;
