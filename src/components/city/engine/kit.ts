import {
  Box3,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  ExtrudeGeometry,
  IcosahedronGeometry,
  Matrix4,
  Mesh,
  Quaternion,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  Color,
  type Material,
  type Object3D,
} from 'three';

import type { Point2 } from './path';

export const UP = new Vector3(0, 1, 0);

function shapeGeo(pts: readonly Point2[], depth: number): ExtrudeGeometry {
  const sh = new Shape();
  pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
  return new ExtrudeGeometry(sh, { depth, bevelEnabled: false });
}

/** Unit primitives every builder scales and places. */
export function createGeometryLibrary() {
  const almond = new SphereGeometry(1, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const p = almond.attributes.position!;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    p.setZ(i, p.getZ(i) * (1 - 0.62 * x * x));
  }
  almond.computeVertexNormals();

  return {
    box: new BoxGeometry(1, 1, 1),
    cyl6: new CylinderGeometry(1, 1, 1, 6),
    cyl8: new CylinderGeometry(1, 1, 1, 8),
    cyl12: new CylinderGeometry(1, 1, 1, 12),
    cyl14: new CylinderGeometry(1, 1, 1, 14),
    cyl24: new CylinderGeometry(1, 1, 1, 24),
    cone4: new ConeGeometry(1, 1, 4),
    cone6: new ConeGeometry(1, 1, 6),
    cone8: new ConeGeometry(1, 1, 8),
    cone12: new ConeGeometry(1, 1, 12),
    dome8: new SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    dome16: new SphereGeometry(1, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    sph: new SphereGeometry(1, 18, 10),
    ico: new IcosahedronGeometry(1, 0),
    halfCyl: new CylinderGeometry(1, 1, 1, 10, 1, false, 0, Math.PI),
    halfCone: new ConeGeometry(1, 1, 10, 1, false, 0, Math.PI),
    vault: new CylinderGeometry(1, 1, 1, 12, 1, false, 0, Math.PI)
      .rotateX(Math.PI / 2)
      .rotateZ(Math.PI / 2),
    arch: new TorusGeometry(1, 0.07, 4, 12, Math.PI),
    archThin: new TorusGeometry(1, 0.045, 4, 18, Math.PI),
    plume: new TorusGeometry(1, 0.07, 4, 20, 2.1).scale(1, 1, 3.4),
    gable: shapeGeo(
      [
        [-0.5, 0],
        [0.5, 0],
        [0, 1],
      ],
      1,
    ).translate(0, 0, -0.5),
    sail: shapeGeo(
      [
        [0, 0],
        [0, 0.5],
        [-0.26, 0],
      ],
      0.008,
    ),
    disc: new CylinderGeometry(1, 1, 1, 28),
    almond,
  };
}

export type GeometryLibrary = ReturnType<typeof createGeometryLibrary>;
type CylSeg = 6 | 8 | 12 | 14 | 24;
type ConeSeg = 4 | 6 | 8 | 12;
type DomeSeg = 8 | 16;

/** Merges non-indexed geometries that carry position, normal and color. */
export function mergeGeos(list: readonly BufferGeometry[]): BufferGeometry {
  let n = 0;
  for (const g of list) n += g.attributes.position!.count;
  const out = new BufferGeometry();
  for (const name of ['position', 'normal', 'color'] as const) {
    const arr = new Float32Array(n * 3);
    let o = 0;
    for (const g of list) {
      const attr = g.attributes[name]!;
      arr.set(attr.array as Float32Array, o);
      o += attr.count * 3;
    }
    out.setAttribute(name, new BufferAttribute(arr, 3));
  }
  out.computeBoundingBox();
  out.computeBoundingSphere();
  return out;
}

export type PartKind = 'body' | 'shiny' | 'glow' | 'blink';

export interface PartOptions {
  q?: Quaternion;
  rx?: number;
  ry?: number;
  rz?: number;
  sx?: number;
  sy?: number;
  sz?: number;
}

const _m4 = new Matrix4();
const _q = new Quaternion();
const _e = new Euler();
const _v = new Vector3();
const _s = new Vector3();
const _c = new Color();

/**
 * Collects transformed, vertex-coloured copies of primitives and merges them
 * into one mesh per material kind: a whole landmark costs a handful of draw
 * calls however many parts it has.
 */
export class Kit {
  readonly parts: Partial<Record<PartKind, BufferGeometry[]>> = {};
  readonly all: BufferGeometry[] = [];
  readonly frame = new Matrix4();

  constructor(private readonly G: GeometryLibrary) {}

  add(
    kind: PartKind,
    geo: BufferGeometry,
    color: string,
    x: number,
    y: number,
    z: number,
    o: PartOptions = {},
  ): BufferGeometry {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    for (const k of Object.keys(g.attributes)) {
      if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    }
    if (o.q) _q.copy(o.q);
    else _q.setFromEuler(_e.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0));
    _m4.compose(_v.set(x, y, z), _q, _s.set(o.sx ?? 1, o.sy ?? 1, o.sz ?? 1));
    g.applyMatrix4(_m4);
    g.applyMatrix4(this.frame);
    const n = g.attributes.position!.count;
    const arr = new Float32Array(n * 3);
    _c.set(color);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = _c.r;
      arr[i * 3 + 1] = _c.g;
      arr[i * 3 + 2] = _c.b;
    }
    g.setAttribute('color', new BufferAttribute(arr, 3));
    (this.parts[kind] ??= []).push(g);
    this.all.push(g);
    return g;
  }

  box(
    kind: PartKind,
    c: string,
    w: number,
    h: number,
    d: number,
    x: number,
    y0: number,
    z: number,
    o: PartOptions = {},
  ) {
    return this.add(kind, this.G.box, c, x, y0 + h / 2, z, { ...o, sx: w, sy: h, sz: d });
  }

  cyl(
    kind: PartKind,
    c: string,
    r: number,
    h: number,
    x: number,
    y0: number,
    z: number,
    seg: CylSeg = 8,
    o: PartOptions = {},
  ) {
    return this.add(kind, this.G[`cyl${seg}`], c, x, y0 + h / 2, z, { ...o, sx: r, sy: h, sz: r });
  }

  cone(
    kind: PartKind,
    c: string,
    r: number,
    h: number,
    x: number,
    y0: number,
    z: number,
    seg: ConeSeg = 8,
    o: PartOptions = {},
  ) {
    return this.add(kind, this.G[`cone${seg}`], c, x, y0 + h / 2, z, { ...o, sx: r, sy: h, sz: r });
  }

  dome(
    kind: PartKind,
    c: string,
    r: number,
    hy: number,
    x: number,
    y0: number,
    z: number,
    seg: DomeSeg = 8,
    o: PartOptions = {},
  ) {
    return this.add(kind, this.G[`dome${seg}`], c, x, y0, z, { ...o, sx: r, sy: hy, sz: r });
  }

  /** A box stretched between two points. */
  beam(
    kind: PartKind,
    c: string,
    a: readonly [number, number, number],
    b: readonly [number, number, number],
    t: number,
    t2?: number,
  ) {
    const A = new Vector3(...a);
    const B = new Vector3(...b);
    const d = B.clone().sub(A);
    const L = d.length();
    const q = new Quaternion().setFromUnitVectors(UP, d.normalize());
    const m = A.add(B).multiplyScalar(0.5);
    return this.add(kind, this.G.box, c, m.x, m.y, m.z, { q, sx: t, sy: L, sz: t2 ?? t });
  }

  /** Runs `fn` with parts placed relative to (x, z) rotated by `ry`. */
  at(x: number, z: number, ry: number, fn: () => void) {
    const prev = this.frame.clone();
    this.frame.multiply(
      new Matrix4().makeTranslation(x, 0, z).multiply(new Matrix4().makeRotationY(ry)),
    );
    fn();
    this.frame.copy(prev);
  }

  mark(): number {
    return this.all.length;
  }

  bounds(from: number): Box3 {
    const b = new Box3();
    for (let i = from; i < this.all.length; i++) {
      const g = this.all[i]!;
      g.computeBoundingBox();
      b.union(g.boundingBox!);
    }
    return b;
  }

  geometry(kind: PartKind): BufferGeometry {
    return mergeGeos(this.parts[kind] ?? []);
  }

  build(parent: Object3D, mats: Record<PartKind, Material>): Mesh[] {
    const meshes: Mesh[] = [];
    for (const [kind, list] of Object.entries(this.parts) as [PartKind, BufferGeometry[]][]) {
      const m = new Mesh(mergeGeos(list), mats[kind]);
      m.castShadow = m.receiveShadow = true;
      parent.add(m);
      meshes.push(m);
    }
    return meshes;
  }
}

/** Gothic merlons along a rectangle. */
export function crenel(
  k: Kit,
  c: string,
  cx: number,
  y: number,
  cz: number,
  w: number,
  d: number,
  s = 0.085,
  step = 0.18,
) {
  const nx = Math.max(2, Math.round(w / step));
  const nz = Math.max(2, Math.round(d / step));
  for (let i = 0; i <= nx; i++) {
    const x = cx - w / 2 + s / 2 + ((w - s) * i) / nx;
    k.box('body', c, s, s * 1.5, s, x, y, cz - d / 2 + s / 2);
    k.box('body', c, s, s * 1.5, s, x, y, cz + d / 2 - s / 2);
  }
  for (let j = 1; j < nz; j++) {
    const z = cz - d / 2 + s / 2 + ((d - s) * j) / nz;
    k.box('body', c, s, s * 1.5, s, cx - w / 2 + s / 2, y, z);
    k.box('body', c, s, s * 1.5, s, cx + w / 2 - s / 2, y, z);
  }
}

/** Merlons around a ring. */
export function crenelRing(
  k: Kit,
  c: string,
  cx: number,
  y: number,
  cz: number,
  r: number,
  n: number,
  s = 0.08,
) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    k.box(
      'body',
      c,
      s,
      s * 1.5,
      s,
      cx + Math.cos(a) * (r - s / 2),
      y,
      cz + Math.sin(a) * (r - s / 2),
      { ry: -a },
    );
  }
}

/** Disposes every geometry of the library. */
export function disposeLibrary(G: GeometryLibrary) {
  for (const g of Object.values(G)) g.dispose();
}
