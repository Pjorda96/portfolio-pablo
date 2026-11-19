import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildCity, buildCitySteps } from '@/components/city/engine/build-city';

/** A 2D context that accepts every call: the facade and glow textures only draw. */
function stub2d(): CanvasRenderingContext2D {
  const gradient = { addColorStop: () => {} };
  return new Proxy({} as CanvasRenderingContext2D, {
    get: (_, key) => (key === 'createRadialGradient' ? () => gradient : () => {}),
    set: () => true,
  });
}

function summary(root: ReturnType<typeof buildCity>['root']) {
  let objects = 0;
  let vertices = 0;
  root.traverse((o) => {
    objects++;
    const geometry = (o as { geometry?: { attributes: { position?: { count: number } } } })
      .geometry;
    vertices += geometry?.attributes.position?.count ?? 0;
  });
  return { objects, vertices };
}

describe('city build', () => {
  beforeEach(() => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(
      () => stub2d() as unknown as null,
    );
  });

  it('splits the work into many short steps', () => {
    const steps = buildCitySteps({ pixelRatio: 1 });
    let count = 0;
    while (!steps.next().done) count++;
    expect(count).toBeGreaterThanOrEqual(20);
  });

  it('builds the same city stepwise as in one go (one seeded stream)', () => {
    const steps = buildCitySteps({ pixelRatio: 1 });
    let r = steps.next();
    while (!r.done) r = steps.next();
    const sliced = r.value;
    const whole = buildCity({ pixelRatio: 1 });

    expect(summary(sliced.root)).toEqual(summary(whole.root));
    expect(Object.keys(sliced.anchors).sort()).toEqual(Object.keys(whole.anchors).sort());
    expect(sliced.pickables.length).toBe(whole.pickables.length);
    sliced.dispose();
    whole.dispose();
  });

  it('applies the renderer’s anisotropy after the build, capped at 8', () => {
    const city = buildCity({ pixelRatio: 1 });
    city.setMaxAnisotropy(16);
    const textures: number[] = [];
    type WithMap = { map?: { anisotropy: number } | null };
    city.root.traverse((o) => {
      const m = (o as { material?: WithMap | WithMap[] }).material;
      for (const mat of Array.isArray(m) ? m : m ? [m] : []) {
        if (mat.map) textures.push(mat.map.anisotropy);
      }
    });
    // The facade atlas (window texture) is the only mip-mapped texture seen at an angle.
    expect(textures).toContain(8);
    city.dispose();
  });
});
