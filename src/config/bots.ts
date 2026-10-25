export const bots = {
  count: 19,
  /** Bots start their drop at least this far from the map edge. */
  dropMargin: 20,
  /** Walking speed of a bot chasing a target, in units per second (the player walks at 5). */
  walkSpeed: 4,
  /** A bot stops this close to its target and fights from there. */
  engageRange: 25,
  /** Once engaged, the target must get this far away before the bot chases again. */
  disengageRange: 30,
  /** Seconds a bot waits after first seeing an enemy before it may shoot. */
  reactionSeconds: 0.5,
  /** Chance that a bot's shot hits: best up close, worst far away, less against a moving target. */
  hitChance: {
    /** At or inside `nearRange`. */
    close: 0.8,
    /** At or beyond `farRange`. */
    far: 0.1,
    nearRange: 10,
    farRange: 100,
    /** Multiplies the chance when the target is sprinting. */
    runningMultiplier: 0.6,
    /** Multiplies the chance when the target is jumping or falling. */
    airborneMultiplier: 0.4,
  },
  /** A bot pulls the trigger this often while fighting, slower than the player's automatic fire. */
  fireIntervalSeconds: 0.4,
  /** Where a bot's hits land: this share on the head, this on the torso, the rest on the legs. */
  regionOdds: { head: 0.1, torso: 0.6 },
  /** A fighting bot sidesteps at this speed, in units per second. */
  strafeSpeed: 2.5,
  /** Seconds between a strafing bot's changes of direction (min, max). */
  strafeTurnSeconds: { min: 0.8, max: 2.2 },
  /** With nobody in sight a bot ambles around at this speed. */
  wanderSpeed: 1.5,
  /** Seconds between a wandering bot's changes of direction (min, max). */
  wanderTurnSeconds: { min: 2, max: 5 },
} as const;
