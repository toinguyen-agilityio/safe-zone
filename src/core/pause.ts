/** Whether the simulation is paused. Rendering keeps going; only updates stop. */
export class Pause {
  private isPaused = false;

  get paused(): boolean {
    return this.isPaused;
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  toggle(): boolean {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }
}

/**
 * Run every update with the frame's time step, unless the game is paused. Because the loop keeps
 * ticking while paused, the first step after resuming is a normal one, not a long jump.
 * Returns how many updates ran.
 */
export function runUpdates(
  updates: readonly ((dt: number) => void)[],
  dt: number,
  pause: Pause,
): number {
  if (pause.paused) return 0;
  for (const update of updates) update(dt);
  return updates.length;
}
