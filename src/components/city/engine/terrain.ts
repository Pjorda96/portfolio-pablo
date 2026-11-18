import {
  BufferAttribute,
  CircleGeometry,
  Color,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from 'three';

import { smoothstep as ss } from '@/lib/time-of-day';

import type { BuildContext } from './context';
import { COAST, LAKE } from './geography';

/** Ground (city grey fading into huerta greens), the sea and L'Albufera. */
export function buildTerrain(ctx: BuildContext) {
  const waterMat = new MeshStandardMaterial({ color: 0x2c6f8f, roughness: 0.32, metalness: 0.1 });

  const lake = new Mesh(new CircleGeometry(1, 56).rotateX(-Math.PI / 2), waterMat);
  lake.scale.set(LAKE.rx, 1, LAKE.rz);
  lake.position.set(LAKE.x, 0.012, LAKE.z);
  lake.receiveShadow = true;
  ctx.root.add(lake);

  const groundGeo = new PlaneGeometry(COAST + 60, 170, 60, 85)
    .rotateX(-Math.PI / 2)
    .translate((COAST - 60) / 2, 0, 0);
  const p = groundGeo.attributes.position!;
  const c = new Float32Array(p.count * 3);
  const city = new Color('#a39c90');
  const farm = new Color('#87915c');
  const wet = new Color('#8fa268');
  const tmp = new Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const hN = ss(-11.4, -13.2, z + 0.9 * Math.sin(x * 0.33));
    const hW = ss(-16.5, -18.3, x - 0.9 * Math.sin(z * 0.45));
    const r = ss(12.6, 13.8, z - 0.6 * Math.sin(x * 0.4));
    tmp.copy(city).lerp(farm, Math.max(hN, hW)).lerp(wet, r);
    c.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  groundGeo.setAttribute('color', new BufferAttribute(c, 3));
  const ground = new Mesh(
    groundGeo,
    new MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
  );
  ground.receiveShadow = true;
  ctx.root.add(ground);

  const water = new Mesh(new PlaneGeometry(160, 260).rotateX(-Math.PI / 2), waterMat);
  water.position.set(COAST + 80, -0.05, 0);
  water.receiveShadow = true;
  ctx.root.add(water);

  return { waterMat };
}
