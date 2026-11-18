import type { Group } from 'three';

import type { Geography } from './geography';
import type { GeometryLibrary, Kit } from './kit';
import type { MatSet } from './materials';
import type { Rng } from './rng';

export type Vec3 = [number, number, number];

/** A building prism instance. */
export interface Prism {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  ry: number;
  c: string;
  /** How many of its windows are lit at night (0 = dark). */
  lit: number;
}

export interface Roof {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  y: number;
  ry: number;
  c: string;
}

export type TreeType = 'round' | 'pine' | 'palm';

export interface Tree {
  x: number;
  z: number;
  type: TreeType;
  s: number;
  h?: number;
}

/** Everything the builders share while the city is generated. */
export interface BuildContext {
  rng: Rng;
  G: GeometryLibrary;
  root: Group;
  geo: Geography;
  /** Decorative monuments (merged, warm uplight, not clickable). */
  monu: Kit;
  /** Ground decoration: plazas, quays, farmhouses. */
  decor: Kit;
  matSets: MatSet[];
  lists: {
    sq: Prism[];
    oc: Prism[];
    roofs: Roof[];
    trees: Tree[];
    palms: { x: number; y: number; z: number; s: number }[];
    oranges: { x: number; z: number; s: number }[];
    fields: { x: number; z: number; w: number; d: number; c: string }[];
    reeds: { x: number; z: number; h: number }[];
    parasols: { x: number; z: number; c: string }[];
    containers: { x: number; y: number; z: number; c: string }[];
    lampPts: Vec3[];
    parkLampPts: Vec3[];
    bridgeS: number[];
  };
}

export function addTree(ctx: BuildContext, x: number, z: number, type: TreeType, s = 1) {
  if (type === 'palm') {
    const h = ctx.rng.rr(0.55, 0.85) * s;
    ctx.lists.trees.push({ x, z, type, h, s });
    ctx.lists.palms.push({ x, y: h, z, s });
  } else ctx.lists.trees.push({ x, z, type, s });
}

export const DARK = '#3a3128';
