/** Average frames per second over a period. */
export function averageFps(frames: number, seconds: number): number {
  return seconds > 0 ? frames / seconds : 0;
}

/**
 * Frame times of a whole run, to give the average frame rate and the 1 percent low: the frame rate
 * of the slowest hundredth of the frames, which is what a player feels as stutter.
 */
export class FrameStats {
  private readonly times: number[] = [];
  private total = 0;

  constructor(private readonly maxFrames = 100_000) {}

  /** Add one frame that took `seconds`. Frames that took no time are ignored. */
  record(seconds: number): void {
    if (!(seconds > 0)) return;
    if (this.times.length >= this.maxFrames) this.total -= this.times.shift()!;
    this.times.push(seconds);
    this.total += seconds;
  }

  get frames(): number {
    return this.times.length;
  }

  /** Frames per second over everything recorded. */
  get averageFps(): number {
    return averageFps(this.times.length, this.total);
  }

  /** Frames per second of the slowest 1 percent of the frames (at least one frame). */
  get onePercentLowFps(): number {
    if (this.times.length === 0) return 0;
    const slowest = [...this.times].sort((a, b) => b - a);
    const count = Math.max(1, Math.ceil(slowest.length / 100));
    const worst = slowest.slice(0, count);
    return averageFps(
      worst.length,
      worst.reduce((sum, t) => sum + t, 0),
    );
  }

  reset(): void {
    this.times.length = 0;
    this.total = 0;
  }
}

/** True when the page URL has an `fps` query parameter, e.g. `?fps`. */
export function isFpsRequested(search: string): boolean {
  return new URLSearchParams(search).has('fps');
}

/** Counts frames from the loop's time steps and refreshes the label about once a second. */
export class FpsMeter {
  private frames = 0;
  private elapsed = 0;
  /** Every frame since the meter started, for the 1 percent low. */
  readonly stats = new FrameStats();

  constructor(
    private readonly label: { textContent: string | null },
    private readonly intervalSeconds = 1,
  ) {}

  update(dt: number): void {
    this.stats.record(dt);
    this.frames++;
    this.elapsed += dt;
    if (this.elapsed >= this.intervalSeconds) {
      const now = Math.round(averageFps(this.frames, this.elapsed));
      this.label.textContent = `${now} FPS · 1% low ${Math.round(this.stats.onePercentLowFps)}`;
      this.frames = 0;
      this.elapsed = 0;
    }
  }
}

/** Adds a corner label and returns a meter for it, or null when `?fps` is absent. */
export function createFpsMeter(search: string, parent: HTMLElement): FpsMeter | null {
  if (!isFpsRequested(search)) return null;
  const label = document.createElement('div');
  label.style.cssText =
    'position:fixed;top:8px;left:8px;padding:2px 6px;background:rgba(0,0,0,.6);' +
    'color:#fff;font:12px monospace;pointer-events:none;z-index:10';
  label.textContent = '… FPS';
  parent.appendChild(label);
  return new FpsMeter(label);
}
