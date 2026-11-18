/**
 * Seeded Park–Miller generator. The whole city is generated from one stream,
 * so builders must consume it in the same order as the prototype to produce
 * the same city.
 */
export interface Rng {
  /** Uniform in (0, 1). */
  rnd(): number;
  /** Uniform in [a, b). */
  rr(a: number, b: number): number;
  pick<T>(list: readonly T[]): T;
}

export function createRng(seed = 11): Rng {
  let state = seed;
  const rnd = () => (state = (state * 16807) % 2147483647) / 2147483647;
  return {
    rnd,
    rr: (a, b) => a + (b - a) * rnd(),
    pick: <T>(list: readonly T[]) => list[(rnd() * list.length) | 0] as T,
  };
}
