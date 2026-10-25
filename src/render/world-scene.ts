import { AmbientLight, DirectionalLight, Group } from 'three';
import type { Layout } from '../world/types';
import { buildGround } from './ground';
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
  return root;
}
