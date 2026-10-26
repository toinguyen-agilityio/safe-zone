import { describe, expect, it } from 'vitest';
import { getLayout } from '../world/layout';
import { buildWorldScene } from './world-scene';

describe('buildWorldScene', () => {
  const root = buildWorldScene(getLayout());
  const names: string[] = [];
  root.traverse((o) => names.push(o.name));

  it('contains a ground group with grass', () => {
    expect(names).toContain('ground');
    expect(names).toContain('grass');
  });

  it('draws one street mesh per street', () => {
    expect(names.filter((n) => n === 'street')).toHaveLength(getLayout().streets.length);
  });

  it('draws lane markings for both street directions', () => {
    expect(names.filter((n) => n === 'markings')).toHaveLength(2);
  });
});
