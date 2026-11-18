import { CatmullRomCurve3, Vector3, type Box3 } from 'three';

import { smoothstep as ss } from '@/lib/time-of-day';

import { mkPath, type CityPath, type NearestPoint, type Point2 } from './path';

/** Geography of Valencia: 1 unit ≈ 200 m, compressed towards the sea. */

export const COAST = 14.6;

const TURIA_CTRL: readonly Point2[] = [
  [-34, -5.6],
  [-24, -6.1],
  [-17, -6.7],
  [-12, -7.1],
  [-8, -7.5],
  [-4, -7.6],
  [-0.6, -7.1],
  [1.9, -5.6],
  [3.6, -3.2],
  [4.8, -0.4],
  [5.7, 2.3],
  [6.9, 4.6],
  [8.5, 5.83],
  [10.1, 7.06],
  [11.75, 8.33],
  [13.6, 9.75],
];

/** Ciutat Vella. */
export const OT = { x: -4.8, z: -1.6, r: 5.0 } as const;
/** L'Albufera. */
export const LAKE = { x: 3.5, z: 21.8, rx: 10.5, rz: 4.4 } as const;

export const huertaN = (x: number, z: number) => z < -12.4 + 0.9 * Math.sin(x * 0.33);
export const huertaW = (x: number, z: number) => x < -17.5 + 0.9 * Math.sin(z * 0.45);
export const rural = (x: number, z: number) => z > 13.2 + 0.6 * Math.sin(x * 0.4);
export const inLake = (x: number, z: number, k = 1) =>
  ((x - LAKE.x) / (LAKE.rx * k)) ** 2 + ((z - LAKE.z) / (LAKE.rz * k)) ** 2 < 1;
/** Whether a ground point can be on screen from the home view. */
export const visible = (x: number, z: number) => {
  const r = x * 0.954 - z * 0.299 - 2.7;
  const u = -(x * 0.299 + z * 0.954) * 0.546 + 0.51;
  return r > -36 && r < 32 && u > -30 && u < 34;
};

interface Rect {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

export function createGeography() {
  const turia = mkPath(
    new CatmullRomCurve3(
      TURIA_CTRL.map(([x, z]) => new Vector3(x, 0, z)),
      false,
      'centripetal',
    )
      .getSpacedPoints(360)
      .map((v) => [v.x, v.z] as const),
  );
  const sCAC = turia.near(6.4, 4.0).s;
  const sWest = turia.near(-15, -6.8).s;
  /** Half width of the old riverbed at arc length `s`. */
  const turiaHalf = (s: number) =>
    1.25 + 0.95 * ss(sCAC - 1.8, sCAC + 0.4, s) + 0.4 * (1 - ss(sWest - 1.5, sWest + 1.5, s));
  const turiaInfo = (x: number, z: number): NearestPoint & { half: number } => {
    const n = turia.near(x, z);
    return { ...n, half: turiaHalf(n.s) };
  };
  const isTuria = (x: number, z: number, pad = 0) => {
    const n = turiaInfo(x, z);
    return n.d < n.half + pad;
  };

  // Areas reserved by landmarks, monuments and plazas before houses are placed.
  const excl: Rect[] = [];
  const addExcl = (b: Box3, pad = 0) =>
    excl.push({ x0: b.min.x - pad, x1: b.max.x + pad, z0: b.min.z - pad, z1: b.max.z + pad });
  const exclCircle = (x: number, z: number, r: number) =>
    excl.push({ x0: x - r, x1: x + r, z0: z - r, z1: z + r });
  const blocked = (x: number, z: number, pad = 0) =>
    excl.some((e) => x > e.x0 - pad && x < e.x1 + pad && z > e.z0 - pad && z < e.z1 + pad);

  // ---------- avenues ----------
  const ringPts = (() => {
    const fw: Point2[] = [];
    const bw: Point2[] = [];
    const R = 5.35;
    const a0 = Math.PI / 2;
    for (let a = a0; a < a0 + Math.PI; a += 0.04) {
      const x = OT.x + Math.cos(a) * R;
      const z = OT.z + Math.sin(a) * R;
      if (isTuria(x, z, 0.25)) break;
      fw.push([x, z]);
    }
    for (let a = a0 - 0.04; a > a0 - Math.PI; a -= 0.04) {
      const x = OT.x + Math.cos(a) * R;
      const z = OT.z + Math.sin(a) * R;
      if (isTuria(x, z, 0.25)) break;
      bw.push([x, z]);
    }
    return bw.reverse().concat(fw);
  })();
  const bankPath = (side: number) =>
    mkPath(
      turia.P.map((p, i) => {
        const t = turia.T[i]!;
        const h = (turiaHalf(turia.L[i]!) + 0.45) * side;
        return [p.x - t.z * h, p.z + t.x * h] as const;
      }),
    );
  const AV: Record<'ring' | 'granVia' | 'port' | 'blasco' | 'paseo' | 'bankS' | 'bankN', CityPath> =
    {
      ring: mkPath(ringPts),
      granVia: mkPath([
        [3.36, 0.2],
        [-1.56, 6.36],
        [-3.0, 8.0],
      ]),
      port: mkPath([
        [6.24, -0.97],
        [14.3, 3.9],
      ]),
      blasco: mkPath([
        [3.1, -6.6],
        [12.5, -5.4],
      ]),
      paseo: mkPath([
        [12.78, -26],
        [12.78, 3.5],
      ]),
      bankS: bankPath(1),
      bankN: bankPath(-1),
    };

  return { turia, sCAC, sWest, turiaHalf, turiaInfo, isTuria, addExcl, exclCircle, blocked, AV };
}

export type Geography = ReturnType<typeof createGeography>;
