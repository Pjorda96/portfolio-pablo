import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  HemisphereLight,
  InstancedMesh,
  Object3D,
  Points,
  PointsMaterial,
  type Texture,
} from 'three';

import type { BuildContext, Vec3 } from './context';
import { LAKE } from './geography';
import { Kit } from './kit';
import { std } from './materials';
import type { CityPath } from './path';

const dummy = new Object3D();

interface Boat {
  moving: boolean;
  // sailing boats circle an ellipse
  cx?: number;
  cz?: number;
  rx?: number;
  rz?: number;
  a?: number;
  w?: number;
  // moored boats
  x?: number;
  z?: number;
  ry?: number;
}

/** Sailing boats offshore, moored boats in the Marina, two on the Albufera. */
export function buildBoats(ctx: BuildContext) {
  const { G, rng } = ctx;
  const { rnd, rr } = rng;
  const kit = new Kit(G);
  kit.box('body', '#f6f4ef', 0.42, 0.08, 0.15, 0, 0, 0);
  kit.add('body', G.cone4, '#f6f4ef', 0.27, 0.04, 0, {
    rz: -Math.PI / 2,
    sx: 0.1,
    sy: 0.14,
    sz: 0.075,
  });
  kit.box('body', '#2d4f6e', 0.43, 0.02, 0.155, 0, 0.06, 0);
  kit.box('body', '#8a8d90', 0.012, 0.62, 0.012, -0.02, 0.08, 0);
  kit.add('body', G.sail, '#f7f3ea', -0.03, 0.14, 0);

  const boats: Boat[] = [];
  (
    [
      [19.2, -3.5, 2.4, 1.4],
      [23, -8.5, 3, 1.6],
      [18.6, 1.2, 1.6, 0.9],
      [25.5, 2.5, 2.2, 1.5],
      [20.5, -12.5, 2.6, 1.4],
      [24.5, -2.2, 1.8, 1.2],
      [27.5, -7, 2.5, 1.8],
      [22.5, 11.5, 1.8, 1.0],
    ] as const
  ).forEach(([cx, cz, rx, rz]) =>
    boats.push({
      cx,
      cz,
      rx,
      rz,
      a: rnd() * 6.28,
      w: rr(0.05, 0.11) * (rnd() < 0.5 ? 1 : -1),
      moving: true,
    }),
  );
  for (let x = 15.2; x <= 18.4; x += 0.8) {
    for (const [z0, z1] of [
      [4.55, 5.35],
      [8.4, 9.25],
    ] as const) {
      for (let z = z0; z <= z1; z += 0.32) {
        for (const sd of [-0.17, 0.17])
          if (rnd() < 0.75) boats.push({ x: x + sd, z, ry: Math.PI / 2, moving: false });
      }
    }
  }
  boats.push(
    { x: LAKE.x - 3, z: LAKE.z - 1.5, ry: 0.5, moving: false },
    { x: LAKE.x + 2.5, z: LAKE.z - 2.2, ry: 2.2, moving: false },
  );

  const mesh = new InstancedMesh(
    kit.geometry('body'),
    std({ vertexColors: true, roughness: 0.6 }),
    boats.length,
  );
  mesh.castShadow = true;
  ctx.root.add(mesh);
  const lightPos = new Float32Array(boats.length * 3);

  function place(t: number) {
    boats.forEach((b, i) => {
      let x = b.x ?? 0;
      let z = b.z ?? 0;
      let ry = b.ry ?? 0;
      let bob = 0;
      if (b.moving) {
        const a = b.a! + t * b.w!;
        x = b.cx! + Math.cos(a) * b.rx!;
        z = b.cz! + Math.sin(a) * b.rz!;
        const tx = -Math.sin(a) * b.rx! * Math.sign(b.w!);
        const tz = Math.cos(a) * b.rz! * Math.sign(b.w!);
        ry = Math.atan2(-tz, tx);
        bob = Math.sin(t * 1.7 + i) * 0.015;
      }
      dummy.position.set(x, -0.02 + bob, z);
      dummy.rotation.set(0, ry, b.moving ? Math.sin(t + i) * 0.04 : 0);
      dummy.scale.setScalar(b.moving ? 1.25 : 0.9);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      lightPos.set([x, b.moving ? 0.82 : 0.58, z], i * 3);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }
  place(0);
  return { place, lightPos };
}

/** Additive glow sprites with a constant on-screen size. */
export function glowPoints(
  ctx: BuildContext,
  positions: Float32Array | readonly Vec3[],
  color: number,
  size: number,
  sprite: Texture,
  pixelRatio: number,
  vertexColors = false,
): Points<BufferGeometry, PointsMaterial> {
  const arr = positions instanceof Float32Array ? positions : new Float32Array(positions.flat());
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(arr, 3));
  const m = new PointsMaterial({
    color,
    size: size * pixelRatio,
    map: sprite,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexColors,
  });
  const p = new Points(g, m);
  p.frustumCulled = false;
  ctx.root.add(p);
  return p;
}

/** Car lights moving along the avenues: white ahead, red behind. */
export function createTraffic(ctx: BuildContext, count = 120) {
  const { AV } = ctx.geo;
  const { rnd, rr } = ctx.rng;
  const paths: CityPath[] = [AV.granVia, AV.port, AV.blasco, AV.ring, AV.bankS, AV.bankN];
  const total = paths.reduce((a, p) => a + p.len, 0);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const cars: { path: CityPath; s: number; v: number }[] = [];
  const col = new Color();
  for (let k = 0; k < count; k++) {
    let r = rnd() * total;
    let path = paths[0]!;
    for (const p of paths) {
      if (r < p.len) {
        path = p;
        break;
      }
      r -= p.len;
    }
    const v = rr(0.5, 1.2) * (rnd() < 0.5 ? 1 : -1);
    cars.push({ path, s: rnd() * path.len, v });
    col.set(v > 0 ? '#fff1d6' : '#ff5a3c');
    colors.set([col.r, col.g, col.b], k * 3);
  }
  function place(dt: number) {
    cars.forEach((c, i) => {
      c.s += c.v * dt;
      if (c.s > c.path.len) c.s -= c.path.len;
      if (c.s < 0) c.s += c.path.len;
      const p = c.path.at(c.s);
      const o = c.v > 0 ? 0.12 : -0.12;
      positions[i * 3] = p.x - p.tz * o;
      positions[i * 3 + 1] = 0.1;
      positions[i * 3 + 2] = p.z + p.tx * o;
    });
  }
  place(0);
  return { positions, colors, place };
}

export function createLights(ctx: BuildContext) {
  const hemi = new HemisphereLight(0xffffff, 0x8a7660, 0.6);
  const sun = new DirectionalLight(0xffffff, 1.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -27,
    right: 27,
    top: 27,
    bottom: -27,
    near: 1,
    far: 140,
  });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  ctx.root.add(hemi, sun, sun.target);
  return { hemi, sun };
}
