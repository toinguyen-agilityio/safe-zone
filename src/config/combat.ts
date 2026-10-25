export const combat = {
  magazineSize: 30,
  reloadSeconds: 1.8,
  headMultiplier: 2,
  /** Damage of one rifle bullet to the torso or the legs. A head shot does this times the head multiplier. */
  bodyDamage: 25,
  /** How far a bullet can stray from where the rifle points, in degrees, by what the player is doing. */
  spread: {
    standingDegrees: 0.3,
    movingDegrees: 1.5,
    airborneDegrees: 4,
    /** Aiming down the sights multiplies the spread by this, so it shrinks. */
    aimMultiplier: 0.4,
  },
  /** The rifle kicks the view up with each shot and settles back after the trigger is released. */
  recoil: {
    kickDegrees: 0.7,
    /** The view never climbs more than this far above where it started. */
    maxDegrees: 10,
    recoverDegreesPerSecond: 8,
    /** Seconds after the last shot before the view starts to settle. */
    recoverDelaySeconds: 0.12,
  },
  /** A shot reaches this far. */
  maxShotDistance: 400,
  /** Seconds between two shots while the trigger is held (10 rounds per second). */
  fireIntervalSeconds: 0.1,
  /** Reserve ammo the player starts the match with, on top of the full magazine. */
  startingReserve: 90,
  /** A character is three stacked boxes, measured up from the feet. */
  hitboxes: {
    /** The legs run from the feet to here. */
    legsTop: 0.9,
    /** The torso runs from the legs to here; the head runs from here to the top. */
    torsoTop: 1.5,
    height: 1.8,
    halfWidth: 0.35,
    headHalfWidth: 0.2,
  },
} as const;
