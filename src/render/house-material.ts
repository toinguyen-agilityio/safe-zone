import { MeshStandardMaterial } from 'three';
import { config } from '../config';

const WINDOW_COLOR = [0.16, 0.26, 0.38] as const;
const WINDOW_MIX = 0.85;

const { windows } = config.world;

/** 1 inside a window, 0 on the wall. Depends only on world position, so it never stretches. */
export function windowMask(u: number, v: number): number {
  const fu = u / windows.periodX - Math.floor(u / windows.periodX);
  const fv = v / windows.periodY - Math.floor(v / windows.periodY);
  const inU = Math.abs(fu - 0.5) <= windows.widthFraction / 2;
  const inV = Math.abs(fv - 0.5) <= windows.heightFraction / 2;
  return inU && inV && v >= windows.minHeight ? 1 : 0;
}

const glsl = (n: number) => n.toFixed(4);

const MASK_GLSL = /* glsl */ `
  float windowWall = 1.0 - step(0.5, abs(vHouseNormal.y));
  vec2 windowUV = abs(vHouseNormal.x) > abs(vHouseNormal.z)
    ? vec2(vHouseWorld.z, vHouseWorld.y)
    : vec2(vHouseWorld.x, vHouseWorld.y);
  vec2 windowCell = fract(windowUV / vec2(${glsl(windows.periodX)}, ${glsl(windows.periodY)}));
  vec2 windowDist = abs(windowCell - 0.5);
  float windowMask = windowWall
    * step(windowDist.x, ${glsl(windows.widthFraction / 2)})
    * step(windowDist.y, ${glsl(windows.heightFraction / 2)})
    * step(${glsl(windows.minHeight)}, windowUV.y);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(${WINDOW_COLOR.map(glsl).join(', ')}), windowMask * ${glsl(WINDOW_MIX)});
`;

const VARYINGS = 'varying vec3 vHouseWorld;\nvarying vec3 vHouseNormal;';

/** Adds the window pattern to a material's shaders. Exported so a test can inspect the result. */
export function addWindowPattern(shader: { vertexShader: string; fragmentShader: string }): void {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>\n${VARYINGS}`)
    .replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      vec4 houseWorld = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        houseWorld = instanceMatrix * houseWorld;
      #endif
      vHouseWorld = (modelMatrix * houseWorld).xyz;
      vHouseNormal = normalize(mat3(modelMatrix) * objectNormal);`,
    );
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>\n${VARYINGS}`)
    .replace('#include <color_fragment>', `#include <color_fragment>\n${MASK_GLSL}`);
}

/** Wall material for all houses. Per-instance colours still apply under the windows. */
export function createHouseMaterial(): MeshStandardMaterial {
  const material = new MeshStandardMaterial({ color: 0xffffff });
  material.onBeforeCompile = addWindowPattern;
  return material;
}
