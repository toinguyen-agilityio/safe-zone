import { Group } from 'three';
import type { BuildingLandmarkId, LandmarkSpec } from '../../world/landmarks';

/** A landmark file default-exports one of these. Later landmark tasks only add a new file. */
export interface LandmarkBuilder {
  id: BuildingLandmarkId;
  /** Builds the landmark around its own origin; the registry moves it onto its footprint. */
  build: (spec: LandmarkSpec) => Group;
}

const modules = import.meta.glob<{ default: LandmarkBuilder }>('./*.landmark.ts', { eager: true });

const builders = new Map<BuildingLandmarkId, LandmarkBuilder>();
for (const module of Object.values(modules)) builders.set(module.default.id, module.default);

export function registeredLandmarks(): BuildingLandmarkId[] {
  return [...builders.keys()];
}

/** One group per landmark that has a builder, placed on its footprint. */
export function buildLandmarks(specs: LandmarkSpec[]): Group {
  const root = new Group();
  root.name = 'landmarks';
  for (const spec of specs) {
    const builder = builders.get(spec.id);
    if (!builder) continue;
    const group = builder.build(spec);
    group.name = `landmark-${spec.id}`;
    group.position.set(spec.footprint.cx, 0, spec.footprint.cz);
    root.add(group);
  }
  return root;
}
