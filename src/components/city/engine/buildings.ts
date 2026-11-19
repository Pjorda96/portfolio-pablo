import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  Object3D,
  type Material,
} from 'three';

import type { BuildContext, Prism } from './context';
import { Kit } from './kit';
import { FACADE, std } from './materials';

const dummy = new Object3D();
const col = new Color();

/** Unit prism (optionally chamfered) with a facade group and a roof group. */
function prismGeo(c: number): BufferGeometry {
  const pts: [number, number][] =
    c > 0
      ? [
          [0.5 - c, -0.5],
          [0.5, -0.5 + c],
          [0.5, 0.5 - c],
          [0.5 - c, 0.5],
          [-0.5 + c, 0.5],
          [-0.5, 0.5 - c],
          [-0.5, -0.5 + c],
          [-0.5 + c, -0.5],
        ]
      : [
          [0.5, -0.5],
          [0.5, 0.5],
          [-0.5, 0.5],
          [-0.5, -0.5],
        ];
  const pos: number[] = [];
  const nrm: number[] = [];
  const uv: number[] = [];
  let u = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i]!;
    const [x1, z1] = pts[(i + 1) % pts.length]!;
    const len = Math.hypot(x1 - x0, z1 - z0);
    pos.push(x0, 0, z0, x1, 1, z1, x1, 0, z1, x0, 0, z0, x0, 1, z0, x1, 1, z1);
    for (let k = 0; k < 6; k++) nrm.push((z1 - z0) / len, 0, -(x1 - x0) / len);
    uv.push(u, 0, u + len, 1, u + len, 0, u, 0, u, 1, u + len, 1);
    u += len;
  }
  const sides = pos.length / 3;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i]!;
    const [x1, z1] = pts[(i + 1) % pts.length]!;
    pos.push(0, 1, 0, x1, 1, z1, x0, 1, z0);
    nrm.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
    uv.push(0, 0, 0, 0, 0, 0);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  g.addGroup(0, sides, 0);
  g.addGroup(sides, pos.length / 3 - sides, 1);
  return g;
}

/** All prisms of one shape as a single InstancedMesh (facade + roof = 2 draw calls). */
function prismMesh(
  ctx: BuildContext,
  geo: BufferGeometry,
  list: readonly Prism[],
  mats: [Material, Material],
) {
  if (!list.length) return null;
  const { FC, FR, DENS, FLOOR } = FACADE;
  const n = list.length;
  const aUv = new Float32Array(n * 4);
  const aLit = new Float32Array(n);
  const m = new InstancedMesh(geo, mats, n);
  list.forEach((b, k) => {
    dummy.position.set(b.x, 0, b.z);
    dummy.rotation.set(0, b.ry || 0, 0);
    dummy.scale.set(b.w, b.h, b.d);
    dummy.updateMatrix();
    m.setMatrixAt(k, dummy.matrix);
    m.setColorAt(k, col.set(b.c));
    aUv.set(
      [
        ((b.w + b.d) / 2) * (DENS / FC),
        b.h / FLOOR / FR,
        ((ctx.rng.rnd() * FC) | 0) / FC,
        ((ctx.rng.rnd() * FR) | 0) / FR,
      ],
      k * 4,
    );
    aLit[k] = b.lit;
  });
  geo.setAttribute('aUv', new InstancedBufferAttribute(aUv, 4));
  geo.setAttribute('aLit', new InstancedBufferAttribute(aLit, 1));
  m.castShadow = m.receiveShadow = true;
  ctx.root.add(m);
  return m;
}

/** One InstancedMesh for every item of `list`; `place` sets up the shared dummy. */
export function instanced<T extends object>(
  ctx: BuildContext,
  geo: BufferGeometry,
  mat: Material,
  list: readonly T[],
  place: (item: T, dummy: Object3D) => void,
  shadow = true,
): InstancedMesh | null {
  if (!list.length) return null;
  const m = new InstancedMesh(geo, mat, list.length);
  list.forEach((it, k) => {
    place(it, dummy);
    dummy.updateMatrix();
    m.setMatrixAt(k, dummy.matrix);
    const c = (it as { c?: string }).c;
    if (c) m.setColorAt(k, col.set(c));
  });
  m.castShadow = shadow;
  m.receiveShadow = true;
  ctx.root.add(m);
  return m;
}

const GREENS = ['#4e7a3c', '#5b8744', '#46703a', '#62904a', '#557f3f'];

/** Generic buildings, roofs, fields, containers and vegetation, all instanced. */
export function buildInstancedCity(ctx: BuildContext, facade: Material, roof: Material) {
  const { rng, lists, G } = ctx;
  const { rr, rnd, pick } = rng;

  prismMesh(ctx, prismGeo(0), lists.sq, [facade, roof]);
  prismMesh(ctx, prismGeo(0.14), lists.oc, [facade, roof]);

  instanced(
    ctx,
    new ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0),
    std(),
    lists.roofs,
    (r, d) => {
      d.position.set(r.x, r.y, r.z);
      d.rotation.set(0, r.ry, 0);
      d.scale.set(r.w, r.h, r.d);
    },
  );
  instanced(
    ctx,
    new BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
    std({ roughness: 1 }),
    lists.fields,
    (f, d) => {
      d.position.set(f.x, 0, f.z);
      d.rotation.set(0, 0, 0);
      d.scale.set(f.w, 0.02, f.d);
    },
    false,
  );
  instanced(
    ctx,
    new BoxGeometry(0.58, 0.24, 0.26).translate(0, 0.12, 0),
    std({ roughness: 0.7 }),
    lists.containers,
    (c, d) => {
      d.position.set(c.x, c.y, c.z);
      d.rotation.set(0, 0, 0);
      d.scale.set(1, 1, 1);
    },
  );

  const trunks: { x: number; z: number; h: number; r: number; c: string }[] = [];
  const canopies: {
    x: number;
    y: number;
    z: number;
    sx: number;
    sy: number;
    sz: number;
    c: string;
  }[] = [];
  for (const t of lists.trees) {
    if (t.type === 'round') {
      trunks.push({ x: t.x, z: t.z, h: 0.2 * t.s, r: 0.03 * t.s, c: '#6e5a44' });
      canopies.push({
        x: t.x,
        y: 0.32 * t.s,
        z: t.z,
        sx: 0.22 * t.s,
        sy: 0.24 * t.s,
        sz: 0.22 * t.s,
        c: pick(GREENS),
      });
    } else if (t.type === 'pine') {
      trunks.push({ x: t.x, z: t.z, h: 0.46 * t.s, r: 0.028 * t.s, c: '#6b5845' });
      canopies.push({
        x: t.x,
        y: 0.5 * t.s,
        z: t.z,
        sx: 0.32 * t.s,
        sy: 0.12 * t.s,
        sz: 0.32 * t.s,
        c: pick(['#3f6534', '#47703a', '#3b5f30']),
      });
    } else trunks.push({ x: t.x, z: t.z, h: t.h ?? 0.7, r: 0.024 * t.s, c: '#8a7a62' });
  }
  instanced(ctx, new CylinderGeometry(0.7, 1, 1, 5).translate(0, 0.5, 0), std(), trunks, (t, d) => {
    d.position.set(t.x, 0, t.z);
    d.rotation.set(0, 0, 0);
    d.scale.set(t.r, t.h, t.r);
  });
  instanced(ctx, G.ico, std({ flatShading: true }), canopies, (t, d) => {
    d.position.set(t.x, t.y, t.z);
    d.rotation.set(0, (t.x * 7) % 6, 0);
    d.scale.set(t.sx, t.sy, t.sz);
  });
  {
    const pk = new Kit(G);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      pk.add(
        'body',
        G.box,
        i % 2 ? '#5f8d40' : '#6c9846',
        Math.cos(a) * 0.16,
        -0.04,
        Math.sin(a) * 0.16,
        { ry: -a, rz: -0.5, sx: 0.34, sy: 0.02, sz: 0.08 },
      );
    }
    pk.add('body', G.ico, '#6b5f3e', 0, 0, 0, { sx: 0.05, sy: 0.05, sz: 0.05 });
    instanced(
      ctx,
      pk.geometry('body'),
      std({ vertexColors: true, side: DoubleSide }),
      lists.palms,
      (p, d) => {
        d.position.set(p.x, p.y, p.z);
        d.rotation.set(0, (p.x * 13) % 6.28, 0);
        d.scale.setScalar(p.s);
      },
    );
  }
  {
    // Polyhedra are already non-indexed: one colour per face below.
    const g = new IcosahedronGeometry(1, 1);
    const n = g.attributes.position!.count;
    const c = new Float32Array(n * 3);
    const cc = new Color();
    for (let f = 0; f < n / 3; f++) {
      cc.set(rnd() < 0.16 ? '#f08a1c' : pick(['#3f6a32', '#4a7738', '#41702f']));
      for (let v = 0; v < 3; v++) c.set([cc.r, cc.g, cc.b], (f * 3 + v) * 3);
    }
    g.setAttribute('color', new BufferAttribute(c, 3));
    instanced(
      ctx,
      g,
      std({ vertexColors: true, flatShading: true }),
      lists.oranges,
      (o, d) => {
        d.position.set(o.x, o.s * 0.9, o.z);
        d.rotation.set(0, (o.x * 5) % 6, 0);
        d.scale.setScalar(o.s);
      },
      false,
    );
  }
  instanced(
    ctx,
    new ConeGeometry(0.035, 1, 4).translate(0, 0.5, 0),
    std({ color: 0xa59c62 }),
    lists.reeds,
    (r, d) => {
      d.position.set(r.x, 0, r.z);
      d.rotation.set(rr(-0.15, 0.15), 0, rr(-0.15, 0.15));
      d.scale.set(1, r.h, 1);
    },
    false,
  );
  {
    const pk = new Kit(G);
    pk.box('body', '#f4f1ea', 0.012, 0.2, 0.012, 0, 0, 0);
    pk.cone('body', '#ffffff', 0.13, 0.06, 0, 0.18, 0, 8);
    instanced(ctx, pk.geometry('body'), std({ vertexColors: true }), lists.parasols, (p, d) => {
      d.position.set(p.x, 0, p.z);
      d.rotation.set(0, 0, 0);
      d.scale.setScalar(1);
    });
  }
}
