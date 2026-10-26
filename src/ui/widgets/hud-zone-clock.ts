import { formatTime } from '../format-time';
import type { UiContext } from '../mount';
import './hud-zone-clock.css';

export interface ClockView {
  time: string;
  label: string;
  shrinking: boolean;
}

/** What the zone clock shows: time to the next change, with a Vietnamese label. */
export function clockView(zone: {
  phase: number;
  stage: 'wait' | 'shrink' | 'done';
  stageLeft: number;
}): ClockView {
  if (zone.stage === 'done') {
    return { time: '0:00', label: 'Vùng cuối cùng', shrinking: false };
  }
  const waiting = zone.stage === 'wait';
  return {
    time: formatTime(zone.stageLeft),
    label: waiting
      ? `Giai đoạn ${zone.phase} - nước dâng sau`
      : `Giai đoạn ${zone.phase} - vùng thu hẹp`,
    shrinking: !waiting,
  };
}

export function mount(ctx: UiContext): () => void {
  const panel = document.createElement('div');
  panel.className = 'hud-zone-clock';
  const time = document.createElement('div');
  time.className = 'hud-zone-clock-time';
  const label = document.createElement('div');
  label.className = 'hud-zone-clock-label';
  panel.append(time, label);
  ctx.root.appendChild(panel);

  let last = '';
  let frame = 0;
  const refresh = () => {
    if (ctx.zone) {
      const view = clockView(ctx.zone);
      const key = `${view.time}|${view.label}`;
      if (key !== last) {
        last = key;
        time.textContent = view.time;
        label.textContent = view.label;
        panel.classList.toggle('hud-zone-clock-shrinking', view.shrinking);
      }
    }
    frame = requestAnimationFrame(refresh);
  };
  frame = requestAnimationFrame(refresh);

  return () => {
    cancelAnimationFrame(frame);
    panel.remove();
  };
}
