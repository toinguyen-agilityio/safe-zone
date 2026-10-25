import { AmbientLight, DirectionalLight, Group } from 'three';
import { config } from '../config';
import { generateHouses } from '../world/houses';
import type { Layout } from '../world/types';
import { buildGround } from './ground';
import { buildHouses } from './houses';
import { buildRiver } from './river';

/** The single place render tasks add their parts of the world. */
export function buildWorldScene(layout: Layout): Group {
  const root = new Group();
  root.name = 'world';

  root.add(new AmbientLight(0xffffff, 0.7));
  const sun = new DirectionalLight(0xffffff, 1.6);
  sun.position.set(150, 300, 100);
  root.add(sun);

  root.add(buildGround(layout));
  root.add(buildRiver(layout));
  root.add(buildHouses(generateHouses(layout, config.world.defaultSeed).houses));
  return root;
}
