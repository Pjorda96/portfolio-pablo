/** Polylines on the ground plane (x = east, z = south). */

export type Point2 = readonly [x: number, z: number];

export interface PathSample {
  x: number;
  z: number;
  /** Unit tangent. */
  tx: number;
  tz: number;
}

export interface NearestPoint {
  /** Distance to the path. */
  d: number;
  /** Arc length of the nearest point. */
  s: number;
  px: number;
  pz: number;
  tx: number;
  tz: number;
  /** Signed lateral offset (positive to the left of the direction of travel). */
  off: number;
}

export interface CityPath {
  P: readonly { x: number; z: number }[];
  /** Cumulative length at each point. */
  L: readonly number[];
  /** Smoothed unit tangent at each point. */
  T: readonly { x: number; z: number }[];
  len: number;
  at(s: number): PathSample;
  near(x: number, z: number): NearestPoint;
}

export function mkPath(pts: readonly Point2[]): CityPath {
  const P = pts.map(([x, z]) => ({ x, z }));
  const L = [0];
  const T: { x: number; z: number }[] = [];
  for (let i = 1; i < P.length; i++) {
    L.push(L[i - 1]! + Math.hypot(P[i]!.x - P[i - 1]!.x, P[i]!.z - P[i - 1]!.z));
  }
  for (let i = 0; i < P.length; i++) {
    const a = P[Math.max(0, i - 1)]!;
    const b = P[Math.min(P.length - 1, i + 1)]!;
    const l = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    T.push({ x: (b.x - a.x) / l, z: (b.z - a.z) / l });
  }
  const len = L[L.length - 1]!;

  const at = (arc: number): PathSample => {
    const s = Math.max(0, Math.min(len, arc));
    let lo = 1;
    let hi = P.length - 1;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (L[m]! < s) lo = m + 1;
      else hi = m;
    }
    const a = P[lo - 1]!;
    const b = P[lo]!;
    const seg = L[lo]! - L[lo - 1]! || 1;
    const t = (s - L[lo - 1]!) / seg;
    return {
      x: a.x + (b.x - a.x) * t,
      z: a.z + (b.z - a.z) * t,
      tx: (b.x - a.x) / seg,
      tz: (b.z - a.z) / seg,
    };
  };

  const near = (x: number, z: number): NearestPoint => {
    let best: NearestPoint = { d: Infinity, s: 0, px: 0, pz: 0, tx: 1, tz: 0, off: 0 };
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1]!;
      const b = P[i]!;
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const l2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2));
      const px = a.x + dx * t;
      const pz = a.z + dz * t;
      const d = Math.hypot(x - px, z - pz);
      if (d < best.d) {
        const l = Math.sqrt(l2);
        const tx = dx / l;
        const tz = dz / l;
        best = { d, s: L[i - 1]! + t * l, px, pz, tx, tz, off: (x - px) * -tz + (z - pz) * tx };
      }
    }
    return best;
  };

  return { P, L, T, len, at, near };
}
