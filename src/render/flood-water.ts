import { DoubleSide, Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from 'three';
import { config } from '../config';
import type { ZoneCircle } from '../systems/zone-system';

/** How high the water stands above the road: shallow enough that the houses stand out of it. */
export const WATER_HEIGHT = 0.4;
/** The water fades in over this width at the edge of the dry zone. */
export const EDGE_WIDTH = 1.5;

const vertexShader = /* glsl */ `
  varying vec2 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec2 uCenter;
  uniform float uRadius;
  uniform float uTime;
  varying vec2 vWorld;
  void main() {
    float d = distance(vWorld, uCenter);
    // Inside the dry zone there is no water.
    if (d < uRadius) discard;
    float edge = smoothstep(uRadius, uRadius + ${EDGE_WIDTH.toFixed(2)}, d);
    float ripple = 0.5 + 0.5 * sin(vWorld.x * 0.9 + uTime * 1.6) * sin(vWorld.y * 0.8 - uTime * 1.2);
    vec3 deep = vec3(0.10, 0.32, 0.45);
    vec3 shallow = vec3(0.28, 0.55, 0.62);
    gl_FragColor = vec4(mix(deep, shallow, ripple * 0.5), 0.78 * edge);
  }
`;

/** The values the shader needs for a zone circle, as plain numbers so they can be tested. */
export function floodUniforms(zone: ZoneCircle): { center: [number, number]; radius: number } {
  return { center: [zone.center.x, zone.center.z], radius: zone.radius };
}

export interface FloodWater {
  mesh: Mesh;
  /** Follow the zone: call every frame with the current circle and the time in seconds. */
  update: (zone: ZoneCircle, timeSeconds: number) => void;
}

/** A water plane over the whole map and beyond; the shader leaves the dry zone clear. */
export function createFloodWater(): FloodWater {
  const size = config.world.mapSize + 2 * config.world.edgePadding;
  const geometry = new PlaneGeometry(size, size, 1, 1);
  geometry.rotateX(-Math.PI / 2);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    uniforms: {
      uCenter: { value: new Vector2(0, 0) },
      uRadius: { value: config.zone.startRadius },
      uTime: { value: 0 },
    },
  });
  const mesh = new Mesh(geometry, material);
  mesh.name = 'flood-water';
  mesh.position.y = WATER_HEIGHT;
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;

  return {
    mesh,
    update(zone, timeSeconds) {
      const { center, radius } = floodUniforms(zone);
      material.uniforms.uCenter!.value.set(center[0], center[1]);
      material.uniforms.uRadius!.value = radius;
      material.uniforms.uTime!.value = timeSeconds;
    },
  };
}
