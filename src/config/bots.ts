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
  /** With nobody in sight a bot ambles around at this speed. */
  wanderSpeed: 1.5,
  /** Seconds between a wandering bot's changes of direction (min, max). */
  wanderTurnSeconds: { min: 2, max: 5 },
} as const;
