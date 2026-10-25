export interface MapPoint {
  x: number;
  z: number;
}

export interface Pixel {
  x: number;
  y: number;
}

/**
 * Where a world position lands on the minimap. The player is at `center` and the way the player
 * looks is up the screen, so the map turns with the view. `scale` is pixels per world unit.
 * Yaw 0 looks toward -z, so forward is (-sin yaw, -cos yaw) and right is (cos yaw, -sin yaw).
 */
export function toMinimap(
  pos: MapPoint,
  player: MapPoint,
  yaw: number,
  scale: number,
  center: Pixel = { x: 0, y: 0 },
): Pixel {
  const dx = pos.x - player.x;
  const dz = pos.z - player.z;
  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  const forward = -sin * dx - cos * dz;
  const right = cos * dx - sin * dz;
  // Screen y grows downward, so "ahead" is a smaller y.
  return { x: center.x + right * scale, y: center.y - forward * scale };
}
