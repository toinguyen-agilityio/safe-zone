export const player = {
  health: 100,
  armorMax: 60,
  armorBlock: 0.45,
  parachuteStartHeight: 75,
  /** Radius of the circle the player occupies on the ground. */
  radius: 0.4,
  /** Height of the eyes above the ground. */
  eyeHeight: 1.7,
  /** Where the player stands before the parachute drop exists: a street crossing. */
  spawn: { x: 0, z: 0 },
  /** Fastest the feet rise, going up a ramp or stepping up, in units per second. */
  climbSpeed: 6,
  /** Fastest the feet drop, for example off the bank into the river, in units per second. */
  fallSpeed: 14,
  /** Walking speed in world units per second. */
  walkSpeed: 5,
  /** Radians of turn per pixel of mouse movement. */
  lookSensitivity: 0.0022,
  /** Looking straight up or down is limited to this many degrees from level. */
  pitchLimitDegrees: 85,
} as const;
