import {
  AdditiveBlending,
  Box3,
  ConeGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';

import type { PlaceId } from '@/content/site';

import { DARK, type BuildContext } from './context';
import { crenel, Kit } from './kit';
import { matSet } from './materials';

export interface Landmarks {
  groups: Record<PlaceId, Group>;
  /** World position of each landmark's pin. */
  anchors: Record<PlaceId, Vector3>;
  /** Meshes that respond to hover and click. */
  pickables: Mesh[];
  /** Rotating light beam of the lighthouse. */
  beam: Group;
  beamMaterial: MeshBasicMaterial;
}

/**
 * The six clickable landmarks, one per section of the site. A generator: it
 * yields after each landmark so the caller can split the work (see
 * `buildCitySteps`).
 */
export function* buildLandmarks(ctx: BuildContext): Generator<void, Landmarks> {
  const { G, geo, root } = ctx;
  const groups = {} as Record<PlaceId, Group>;
  const anchors = {} as Record<PlaceId, Vector3>;
  const pickables: Mesh[] = [];

  function landmark(
    id: PlaceId,
    x: number,
    z: number,
    ry: number,
    up: string,
    upK: number,
    glow: string,
    glowK: number,
    build: (k: Kit) => Vector3,
  ): Group {
    const g = new Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    const k = new Kit(G);
    const anchor = build(k);
    const set = matSet(id, up, upK, glow, glowK);
    ctx.matSets.push(set);
    k.build(g, set.mats);
    root.add(g);
    g.updateMatrixWorld(true);
    g.traverse((o) => {
      if (o instanceof Mesh) {
        o.userData.place = id;
        pickables.push(o);
      }
    });
    groups[id] = g;
    anchors[id] = g.localToWorld(anchor.clone());
    if (id !== 'lab') geo.addExcl(new Box3().setFromObject(g), 0.05);
    return g;
  }

  // El Micalet + la Catedral (Sobre mí)
  landmark('torre', -3.3, -3.25, 0, '#ffb070', 0.17, '#ffcf8a', 1.6, (k) => {
    const S = '#dcc7a1';
    const SD = '#c7ab84';
    const R = '#cdb592';
    const o8 = { ry: Math.PI / 8 };
    k.box('body', S, 2.5, 0.95, 0.95, 0, 0, 0);
    k.add('body', G.gable, R, 0, 0.95, 0, { ry: Math.PI / 2, sx: 0.97, sy: 0.26, sz: 2.5 });
    for (let i = 0; i < 6; i++) {
      const x = -1.05 + i * 0.42;
      k.box('body', SD, 0.12, 0.78, 0.16, x, 0, 0.55);
      k.box('body', SD, 0.12, 0.78, 0.16, x, 0, -0.55);
    }
    k.box('body', S, 0.85, 0.9, 1.75, 0.35, 0, 0);
    k.add('body', G.gable, R, 0.35, 0.9, 0, { sx: 0.87, sy: 0.24, sz: 1.75 });
    // cimborrio (octagonal lantern over the crossing)
    k.cyl('body', S, 0.4, 0.62, 0.35, 0.95, 0, 8, o8);
    k.cyl('glow', DARK, 0.41, 0.2, 0.35, 1.2, 0, 8, o8);
    k.cyl('body', SD, 0.45, 0.07, 0.35, 1.57, 0, 8, o8);
    k.cone('body', R, 0.4, 0.2, 0.35, 1.64, 0, 8, o8);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      k.cone('body', SD, 0.035, 0.24, 0.35 + Math.cos(a) * 0.43, 1.6, Math.sin(a) * 0.43, 4);
    }
    // apse to the east, door to the west
    k.add('body', G.halfCyl, S, 1.25, 0.42, 0, { sx: 0.48, sy: 0.84, sz: 0.48 });
    k.add('body', G.halfCone, R, 1.25, 0.93, 0, { sx: 0.48, sy: 0.18, sz: 0.48 });
    k.box('glow', DARK, 0.03, 0.42, 0.3, -1.26, 0, 0);
    // the Micalet: octagonal Gothic bell tower with its iron bell frame
    k.at(-1.5, 0.78, 0, () => {
      k.cyl('body', S, 0.42, 2.45, 0, 0, 0, 8, o8);
      [0.85, 1.65].forEach((y) => k.cyl('body', SD, 0.45, 0.06, 0, y, 0, 8, o8));
      k.cyl('body', S, 0.43, 0.55, 0, 2.45, 0, 8, o8);
      k.cyl('glow', DARK, 0.44, 0.34, 0, 2.53, 0, 8, o8);
      k.cyl('body', SD, 0.47, 0.09, 0, 3.0, 0, 8, o8);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        k.box('body', SD, 0.07, 0.12, 0.07, Math.cos(a) * 0.42, 3.09, Math.sin(a) * 0.42, {
          ry: -a,
        });
      }
      for (const [dx, dz] of [
        [-0.1, -0.1],
        [0.1, -0.1],
        [-0.1, 0.1],
        [0.1, 0.1],
      ] as const) {
        k.box('body', '#5a534b', 0.035, 0.32, 0.035, dx, 3.09, dz);
      }
      k.cone('body', '#5a534b', 0.18, 0.2, 0, 3.41, 0, 4, { ry: Math.PI / 4 });
      k.cyl('glow', DARK, 0.05, 0.1, 0, 3.17, 0, 8);
    });
    return new Vector3(-1.5, 3.75, 0.78);
  });

  yield;

  // El Mercado Central (Proyectos)
  landmark('mercado', -6.6, -0.7, 0, '#ffb070', 0.16, '#ffd08a', 1.6, (k) => {
    const W = '#e6d4b2';
    const BR = '#b9714a';
    const BL = '#2f86b3';
    const Z = '#7f98a4';
    const IN = '#2b3340';
    const o8 = { ry: Math.PI / 8 };
    k.box('body', W, 2.7, 0.7, 1.75, 0, 0, 0);
    k.box('body', BR, 2.72, 0.12, 1.77, 0, 0.48, 0);
    k.box('shiny', BL, 2.74, 0.06, 1.79, 0, 0.64, 0);
    k.add('body', G.gable, Z, 0.62, 0.7, 0, { ry: Math.PI / 2, sx: 1.75, sy: 0.38, sz: 1.46 });
    k.add('body', G.gable, Z, -1.0, 0.7, 0, { ry: Math.PI / 2, sx: 1.75, sy: 0.38, sz: 0.7 });
    k.box('glow', IN, 1.3, 0.05, 0.16, 0.62, 1.06, 0);
    // main dome
    k.cyl('body', W, 0.55, 0.34, -0.35, 0.7, 0, 8, o8);
    k.cyl('glow', IN, 0.56, 0.13, -0.35, 0.8, 0, 8, o8);
    k.cyl('body', BR, 0.58, 0.05, -0.35, 1.04, 0, 8, o8);
    k.dome('shiny', BL, 0.55, 0.55, -0.35, 1.08, 0, 8, o8);
    k.cyl('body', W, 0.12, 0.18, -0.35, 1.6, 0, 8);
    k.cone('shiny', BL, 0.14, 0.16, -0.35, 1.78, 0, 8);
    k.box('body', '#3d3a36', 0.02, 0.25, 0.02, -0.35, 1.92, 0);
    k.box('shiny', '#3f9a5a', 0.13, 0.05, 0.03, -0.35, 2.15, 0);
    // fish-market dome
    k.cyl('body', W, 0.33, 0.24, 0.98, 0.7, 0, 8, o8);
    k.cyl('glow', IN, 0.34, 0.1, 0.98, 0.78, 0, 8, o8);
    k.dome('shiny', BL, 0.33, 0.32, 0.98, 0.94, 0, 8, o8);
    k.cone('shiny', BL, 0.07, 0.14, 0.98, 1.25, 0, 8);
    // modernista portal (faces south)
    k.box('body', W, 0.78, 1.05, 0.28, -0.35, 0, 0.82);
    k.add('body', G.vault, W, -0.35, 1.05, 0.82, { sx: 0.39, sy: 0.39, sz: 0.28 });
    k.add('glow', G.vault, IN, -0.35, 0.64, 0.965, { sx: 0.25, sy: 0.25, sz: 0.02 });
    k.box('glow', IN, 0.5, 0.64, 0.02, -0.35, 0, 0.965);
    k.box('shiny', BL, 0.8, 0.06, 0.3, -0.35, 0.98, 0.82);
    for (const x of [-1.15, 0.25, 0.75, 1.2]) k.box('glow', IN, 0.22, 0.3, 0.02, x, 0.14, 0.885);
    for (let i = 0; i < 5; i++) k.box('glow', IN, 0.22, 0.3, 0.02, -1.1 + i * 0.55, 0.14, -0.885);
    return new Vector3(-0.35, 2.35, 0);
  });

  yield;

  // La Lonja de la Seda (Desarrollo web a medida)
  landmark('taller', -6.5, -3.1, 0, '#ffb070', 0.17, '#ffc778', 1.6, (k) => {
    const S = '#d9c29b';
    const SD = '#c0a47c';
    k.box('body', S, 1.5, 1.05, 1.0, -0.5, 0, 0);
    crenel(k, SD, -0.5, 1.05, 0, 1.5, 1.0);
    k.box('body', S, 0.58, 1.6, 0.58, 0.42, 0, -0.1);
    crenel(k, SD, 0.42, 1.6, -0.1, 0.58, 0.58);
    k.box('body', S, 0.95, 0.82, 0.92, 1.15, 0, 0.02);
    crenel(k, SD, 1.15, 0.82, 0.02, 0.95, 0.92);
    [-0.95, -0.5, -0.05].forEach((x) => k.box('glow', DARK, 0.14, 0.5, 0.02, x, 0.32, 0.51));
    k.box('glow', DARK, 0.26, 0.42, 0.02, -0.5, 0, 0.51);
    k.box('glow', DARK, 0.2, 0.38, 0.02, 0.42, 0, 0.2);
    [0.85, 1.15, 1.45].forEach((x) => k.box('glow', DARK, 0.12, 0.22, 0.02, x, 0.42, 0.485));
    k.box('glow', DARK, 0.02, 0.5, 0.14, -1.255, 0.32, 0);
    // Patio de los Naranjos
    k.box('body', '#7c9a52', 1.0, 0.03, 0.55, 1.0, 0, -0.78);
    for (let i = 0; i < 4; i++) {
      k.add('body', G.ico, '#4f7a35', 0.62 + i * 0.25, 0.2, -0.78, { sx: 0.1, sy: 0.1, sz: 0.1 });
      k.add('body', G.ico, '#e58a2a', 0.65 + i * 0.25, 0.27, -0.72, {
        sx: 0.025,
        sy: 0.025,
        sz: 0.025,
      });
    }
    k.box('body', S, 1.0, 0.25, 0.04, 1.0, 0, -1.06);
    return new Vector3(0.42, 1.95, -0.1);
  });

  yield;

  // La Ciudad de las Artes y las Ciencias, on the old riverbed (Soluciones con IA)
  const cacN = geo.turia.near(10.1, 7.06);
  landmark(
    'lab',
    cacN.px,
    cacN.pz,
    Math.atan2(-cacN.tz, cacN.tx),
    '#8fc2ff',
    0.38,
    '#cfe8ff',
    1.1,
    (k) => {
      const CW = '#f5f7f8';
      const WATER = '#3f9cc6';
      k.box('body', '#e7e6e0', 9.0, 0.04, 3.9, 0.3, 0, 0.15);
      k.box('glow', WATER, 3.3, 0.025, 0.55, 0.9, 0.04, 0.45);
      k.box('glow', WATER, 1.1, 0.025, 0.8, -3.15, 0.04, 0.35);
      // Museu de les Ciències: glass body, white rib skeleton, peaked gables
      const MX = 0.9;
      const MZ = -0.4;
      k.box('body', '#e4e8ea', 3.4, 0.08, 1.3, MX, 0.04, MZ);
      k.box('glow', '#7fa3b8', 3.0, 0.78, 0.76, MX, 0.1, MZ);
      k.box('body', CW, 3.1, 0.06, 1.0, MX, 1.05, MZ - 0.04);
      for (let i = 0; i < 14; i++) {
        const x = MX - 1.45 + i * (2.9 / 13);
        k.beam('body', CW, [x, 0.1, MZ + 0.62], [x, 1.0, MZ + 0.42], 0.07);
        k.beam('body', CW, [x, 1.0, MZ + 0.42], [x, 1.17, MZ - 0.12], 0.06);
        if (i % 2 === 0) k.beam('body', CW, [x, 0.1, MZ - 0.62], [x, 1.08, MZ - 0.38], 0.08);
      }
      [MX - 1.62, MX + 1.62].forEach((x) =>
        k.add('body', G.gable, CW, x, 0.1, MZ, { ry: Math.PI / 2, sx: 1.25, sy: 1.4, sz: 0.14 }),
      );
      // L'Hemisfèric: the eye over its pool
      const HX = -1.95;
      const HZ = 0.45;
      k.add('glow', G.disc, WATER, HX, 0.045, HZ, { sx: 1.65, sy: 0.02, sz: 0.92 });
      k.add('body', G.almond, CW, HX, 0.06, HZ, { sx: 1.05, sy: 0.46, sz: 0.56 });
      k.add('body', G.archThin, '#e3e8ea', HX, 0.06, HZ, { sx: 1.05, sy: 0.5, sz: 1.2 });
      k.add('glow', G.sph, '#6f93a8', HX, 0.06, HZ + 0.33, { sx: 0.42, sy: 0.17, sz: 0.12 });
      // Palau de les Arts: helmet shells + the plume
      const PX = -4.15;
      k.box('body', '#e4e8ea', 2.1, 0.08, 1.3, PX, 0.04, 0);
      k.add('glow', G.sph, '#8aa6b8', PX, 0.5, 0, { sx: 0.95, sy: 0.45, sz: 0.42 });
      k.add('body', G.sph, CW, PX, 0.42, 0.4, { sx: 1.15, sy: 0.5, sz: 0.1 });
      k.add('body', G.sph, CW, PX, 0.42, -0.4, { sx: 1.15, sy: 0.5, sz: 0.1 });
      k.add('body', G.plume, CW, PX - 0.25, 0.3, 0, { sx: 1.15, sy: 1.05 });
      // L'Umbracle: white arches over a garden walk
      k.box('body', '#5f8f4a', 5.8, 0.07, 0.42, 0.15, 0.04, 1.55);
      for (let i = 0; i < 22; i++) {
        k.add('body', G.arch, CW, -2.7 + i * 0.27, 0.05, 1.55, {
          ry: Math.PI / 2,
          sx: 0.32,
          sy: 0.44,
          sz: 0.32,
        });
      }
      k.box('body', CW, 5.9, 0.03, 0.04, 0.15, 0.47, 1.55);
      // Pont de l'Assut de l'Or
      const AX = 3.0;
      k.box('body', CW, 0.45, 0.07, 4.9, AX, 0.33, 0);
      k.box('body', CW, 0.04, 0.07, 4.9, AX - 0.2, 0.4, 0);
      k.box('body', CW, 0.04, 0.07, 4.9, AX + 0.2, 0.4, 0);
      k.beam('body', CW, [AX, 0.33, -2.05], [AX, 3.05, -2.9], 0.14, 0.2);
      for (let i = 0; i < 6; i++) {
        k.beam('body', '#dfe4e8', [AX, 2.95, -2.86], [AX, 0.42, -1.4 + i * 0.62], 0.018);
      }
      // L'Àgora
      k.add('shiny', G.sph, '#3c6f97', 4.15, 0.05, -0.1, { sx: 0.75, sy: 0.6, sz: 0.42 });
      k.add('body', G.archThin, CW, 4.15, 0.05, -0.1, { sx: 0.78, sy: 0.63, sz: 4 });
      return new Vector3(MX, 1.85, MZ);
    },
  );

  yield;

  // La Marina: Veles e Vents on its quay (Apps, SaaS y MVPs)
  landmark('puerto', 15.9, 6.8, 0, '#ffe2bd', 0.22, '#ffd08a', 1.6, (k) => {
    const Q = '#c9c3b6';
    const Wt = '#f7f6f2';
    k.box('body', Q, 2.8, 0.14, 1.6, 0.2, 0, 0);
    k.box('glow', '#33414f', 0.9, 0.3, 0.66, 0.3, 0.14, 0);
    (
      [
        [1.5, 1.05, 0],
        [1.7, 1.15, 0.18],
        [1.5, 1.08, -0.14],
        [1.32, 0.98, 0.22],
      ] as const
    ).forEach(([w, d, dx], i) => {
      const y = 0.44 + i * 0.32;
      k.box('body', Wt, w, 0.07, d, 0.3 + dx, y, 0.02 * i);
      if (i < 3)
        k.box('glow', '#33414f', w * 0.7, 0.25, d * 0.64, 0.3 + dx * 0.5, y + 0.07, 0.02 * i);
    });
    k.box('body', Wt, 0.05, 0.3, 0.05, 0.9, 1.47, 0.3);
    k.box('body', Wt, 0.05, 0.3, 0.05, -0.2, 1.47, -0.3);
    return new Vector3(0.3, 1.95, 0);
  });

  yield;

  // El Faro on the breakwater (Contacto)
  const faro = landmark('faro', 21.9, 7.0, 0, '#ffe2bd', 0.18, '#fff1c2', 2.2, (k) => {
    k.box('body', '#a9a49a', 1.0, 0.2, 1.0, 0, 0, 0);
    for (let i = 0; i < 5; i++) {
      k.cyl('body', i % 2 ? '#c23b2a' : '#f5f3ee', 0.26 - i * 0.02, 0.42, 0, 0.2 + i * 0.42, 0, 14);
    }
    k.cyl('body', '#2f2f2f', 0.24, 0.05, 0, 2.3, 0, 14);
    k.cyl('glow', '#3a3a3a', 0.15, 0.24, 0, 2.35, 0, 12);
    k.cone('body', '#2b2b2b', 0.19, 0.22, 0, 2.59, 0, 12);
    k.box('body', '#f1ece2', 0.4, 0.3, 0.35, 0.32, 0.2, 0.22);
    return new Vector3(0, 2.95, 0);
  });

  const beamMaterial = new MeshBasicMaterial({
    color: 0xfff2c6,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
    fog: false,
  });
  const bm = new Mesh(new ConeGeometry(1.1, 11, 24, 1, true), beamMaterial);
  bm.geometry.translate(0, -5.5, 0);
  bm.rotation.z = Math.PI / 2;
  const beam = new Group();
  beam.position.set(0, 2.47, 0);
  beam.add(bm);
  faro.add(beam);

  return { groups, anchors, pickables, beam, beamMaterial };
}
