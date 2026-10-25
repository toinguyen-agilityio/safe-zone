export interface GameLoopOptions {
  /** Largest time step in seconds; longer gaps are clamped to it. */
  maxDt: number;
  update: (dt: number) => void;
  render: () => void;
}

/** Fixed-cap time step. The caller supplies timestamps so tests can inject a clock. */
export class GameLoop {
  private lastMs: number | null = null;

  constructor(private readonly options: GameLoopOptions) {}

  tick(nowMs: number): void {
    const gap = this.lastMs === null ? 0 : (nowMs - this.lastMs) / 1000;
    this.lastMs = nowMs;
    this.options.update(Math.min(Math.max(gap, 0), this.options.maxDt));
    this.options.render();
  }

  /** Forget the previous timestamp so the next tick does not see a long gap (tab switch). */
  resetClock(): void {
    this.lastMs = null;
  }
}
