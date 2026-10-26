/** Seconds as m:ss, for example 65 becomes "1:05". Partial seconds count as a whole one. */
export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds - 1e-9));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}
