/** Average frames per second over a period. */
export function averageFps(frames: number, seconds: number): number {
  return seconds > 0 ? frames / seconds : 0;
}

/** True when the page URL has an `fps` query parameter, e.g. `?fps`. */
export function isFpsRequested(search: string): boolean {
  return new URLSearchParams(search).has('fps');
}

/** Counts frames from the loop's time steps and refreshes the label about once a second. */
export class FpsMeter {
  private frames = 0;
  private elapsed = 0;

  constructor(
    private readonly label: { textContent: string | null },
    private readonly intervalSeconds = 1,
  ) {}

  update(dt: number): void {
    this.frames++;
    this.elapsed += dt;
    if (this.elapsed >= this.intervalSeconds) {
      this.label.textContent = `${Math.round(averageFps(this.frames, this.elapsed))} FPS`;
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
