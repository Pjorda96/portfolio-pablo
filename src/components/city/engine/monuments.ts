import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Mesh,
  MeshStandardMaterial,
  Shape,
  ShapeGeometry,
  type MeshStandardMaterialParameters,
} from 'three';

import { DARK, type BuildContext } from './context';
import { crenel, crenelRing } from './kit';

/** Decorative monuments: merged into one mesh per material, not clickable. */
export function buildMonuments(ctx: BuildContext) {
  const { monu, G, geo, rng } = ctx;
  const monument = (fn: () => void, pad = 0.05) => {
    const m = monu.mark();
    fn();
    geo.addExcl(monu.bounds(m), pad);
  };

  // Torres de Serranos: gate on the Turia
  monument(() =>
    monu.at(-3.55, -5.75, 0, () => {
      const S = '#d4b98f';
      const SD = '#bd9f76';
      monu.box('body', S, 0.85, 1.15, 0.8, 0, 0, 0);
      [-0.62, 0.62].forEach((x) => {
        monu.cyl('body', S, 0.44, 1.5, x, 0, 0, 6, { ry: Math.PI / 6 });
        crenelRing(monu, SD, x, 1.5, 0, 0.42, 10);
      });
      monu.box('body', SD, 0.95, 0.1, 0.85, 0, 1.15, 0);
      crenel(monu, SD, 0, 1.25, 0, 0.85, 0.8);
      monu.add('glow', G.vault, DARK, 0, 0.38, -0.41, { sx: 0.2, sy: 0.2, sz: 0.03 });
      monu.box('glow', DARK, 0.4, 0.38, 0.03, 0, 0, -0.41);
      monu.box('glow', DARK, 0.5, 0.25, 0.03, 0, 0.7, 0.41);
    }),
  );
  // Torres de Quart: west gate
  monument(() =>
    monu.at(-9.65, -2.0, Math.PI / 2, () => {
      const S = '#c6a87f';
      const SD = '#ae916b';
      monu.box('body', S, 0.8, 1.05, 0.8, 0, 0, 0);
      [-0.62, 0.62].forEach((x) => {
        monu.cyl('body', S, 0.45, 1.38, x, 0, 0, 14);
        crenelRing(monu, SD, x, 1.38, 0, 0.43, 11);
      });
      crenel(monu, SD, 0, 1.05, 0, 0.8, 0.8);
      monu.add('glow', G.vault, DARK, 0, 0.36, -0.41, { sx: 0.19, sy: 0.19, sz: 0.03 });
      monu.box('glow', DARK, 0.38, 0.36, 0.03, 0, 0, -0.41);
    }),
  );
  // Basílica de la Virgen (blue dome) behind the cathedral
  monument(() =>
    monu.at(-3.95, -4.45, 0, () => {
      monu.box('body', '#e9dcc2', 0.75, 0.6, 0.6, 0, 0, 0);
      monu.cyl('body', '#e9dcc2', 0.26, 0.22, 0, 0.6, 0, 8, { ry: Math.PI / 8 });
      monu.dome('shiny', '#2f78a8', 0.26, 0.26, 0, 0.82, 0, 8, { ry: Math.PI / 8 });
      monu.cone('body', '#e9dcc2', 0.05, 0.14, 0, 1.06, 0, 6);
    }),
  );
  // Santa Catalina hexagonal tower
  monument(
    () =>
      monu.at(-4.05, -1.05, 0, () => {
        monu.cyl('body', '#d8c19a', 0.17, 1.75, 0, 0, 0, 6);
        monu.cyl('glow', DARK, 0.175, 0.18, 0, 1.45, 0, 6);
        monu.cyl('body', '#c7ab84', 0.2, 0.05, 0, 1.75, 0, 6);
        monu.cyl('body', '#d8c19a', 0.12, 0.28, 0, 1.8, 0, 6);
        monu.cone('body', '#c7ab84', 0.12, 0.2, 0, 2.08, 0, 6);
      }),
    0.05,
  );
  // church domes with blue glazed tiles, the old town's skyline signature
  (
    [
      [-7.85, -3.55, 0.24],
      [-2.2, -1.95, 0.2],
      [-1.6, 0.6, 0.22],
      [-7.4, 1.6, 0.2],
    ] as const
  ).forEach(([x, z, r]) =>
    monument(
      () =>
        monu.at(x, z, rng.rr(0, 1), () => {
          monu.box('body', '#e6d3b0', r * 2.4, 0.55, r * 2.0, 0, 0, 0);
          monu.cyl('body', '#efe2c8', r, 0.2, 0, 0.55, 0, 8, { ry: Math.PI / 8 });
          monu.dome(
            'shiny',
            rng.pick(['#2f78a8', '#2d6f9a', '#3a86a6']),
            r,
            r * 1.05,
            0,
            0.75,
            0,
            8,
            {
              ry: Math.PI / 8,
            },
          );
          monu.cone('body', '#efe2c8', r * 0.25, r * 0.6, 0, 0.75 + r, 0, 6);
          monu.box('body', '#e6d3ad', 0.16, 0.95, 0.16, r * 1.3, 0, -r * 0.9);
        }),
      0.05,
    ),
  );
  // Plaza del Ayuntamiento: City Hall with its clock tower
  monument(() =>
    monu.at(-5.5, 1.5, -Math.PI / 2, () => {
      const W = '#ece1ca';
      monu.box('body', W, 1.9, 0.9, 0.7, 0, 0, 0);
      monu.box('body', W, 0.5, 0.5, 0.5, 0, 0.9, -0.05);
      monu.cyl('body', W, 0.2, 0.2, 0, 1.4, -0.05, 8);
      monu.dome('shiny', '#3a7fae', 0.2, 0.24, 0, 1.6, -0.05, 8);
      monu.cone('body', '#3d3a36', 0.03, 0.3, 0, 1.82, -0.05, 6);
      monu.add('glow', G.disc, '#f3e7c9', 0, 1.17, -0.31, {
        rx: Math.PI / 2,
        sx: 0.12,
        sy: 0.02,
        sz: 0.12,
      });
      [-0.82, 0.82].forEach((x) => {
        monu.box('body', W, 0.32, 1.1, 0.32, x, 0, -0.2);
        monu.dome('shiny', '#3a7fae', 0.16, 0.18, x, 1.1, -0.2, 8);
      });
      for (let i = 0; i < 7; i++)
        monu.box('glow', DARK, 0.12, 0.22, 0.02, -0.6 + i * 0.2, 0.45, -0.36);
    }),
  );
  // Estació del Nord (modernista, orange accents) and the Plaza de Toros next to it
  monument(() =>
    monu.at(-5.1, 4.6, 0, () => {
      const O = '#c98b55';
      const Wt = '#f1e6d0';
      const OR = '#e2762b';
      monu.box('body', O, 2.0, 0.72, 0.38, 0, 0, -0.45);
      monu.box('body', Wt, 2.02, 0.05, 0.4, 0, 0.72, -0.45);
      monu.box('shiny', OR, 2.02, 0.05, 0.4, 0, 0.44, -0.45);
      monu.box('body', O, 0.72, 1.0, 0.4, 0, 0, -0.45);
      monu.add('body', G.vault, O, 0, 1.0, -0.45, { sx: 0.36, sy: 0.3, sz: 0.4 });
      monu.add('glow', G.vault, DARK, 0, 0.5, -0.66, { sx: 0.22, sy: 0.22, sz: 0.02 });
      monu.box('glow', DARK, 0.44, 0.5, 0.02, 0, 0, -0.66);
      [-0.95, 0.95].forEach((x) => {
        monu.box('body', O, 0.26, 1.05, 0.42, x, 0, -0.45);
        monu.cone('shiny', OR, 0.17, 0.32, x, 1.05, -0.45, 4, { ry: Math.PI / 4 });
      });
      [-0.3, 0.3].forEach((x) => monu.cone('shiny', OR, 0.06, 0.28, x, 1.0, -0.45, 6));
      for (let i = 0; i < 8; i++) {
        const x = -0.8 + i * 0.229;
        if (Math.abs(x) < 0.4) continue;
        monu.box('glow', DARK, 0.12, 0.26, 0.02, x, 0.12, -0.66);
      }
      monu.add('body', G.vault, '#8e969b', 0, 0, 0.55, { sx: 0.75, sy: 0.55, sz: 1.6 });
    }),
  );
  monument(() =>
    monu.at(-3.2, 4.75, 0, () => {
      monu.cyl('body', '#b8683f', 0.88, 0.6, 0, 0, 0, 24);
      monu.cyl('glow', '#3a2a22', 0.89, 0.1, 0, 0.12, 0, 24);
      monu.cyl('glow', '#3a2a22', 0.89, 0.1, 0, 0.36, 0, 24);
      monu.cyl('body', '#efe4d2', 0.905, 0.03, 0, 0.58, 0, 24);
      monu.cyl('body', '#c79a6b', 0.78, 0.02, 0, 0.6, 0, 24);
      monu.cyl('body', '#b68457', 0.65, 0.02, 0, 0.61, 0, 24);
      monu.cyl('body', '#e4c690', 0.5, 0.02, 0, 0.62, 0, 24);
    }),
  );
}

/** Paved plazas and the Plaza del Ayuntamiento, reserved before houses are placed. */
export function buildPlazas(ctx: BuildContext) {
  const { decor, G, geo } = ctx;
  const plazaDisc = (x: number, z: number, r: number, c = '#ddd3c2') => {
    decor.add('body', G.disc, c, x, 0.01, z, { sx: r, sy: 0.02, sz: r });
    geo.exclCircle(x, z, r * 0.85);
  };
  plazaDisc(-4.65, -1.55, 0.62);
  plazaDisc(-4.7, -4.3, 0.55);
  plazaDisc(-6.45, -1.88, 0.5);
  plazaDisc(-2.0, -3.55, 0.38);
  plazaDisc(-6.8, -4.6, 0.35);

  const tri = [
    [-5.05, 0.1],
    [-3.15, 0.45],
    [-4.85, 3.1],
  ] as const;
  const sh = new Shape();
  tri.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
  const plaza = new ShapeGeometry(sh).rotateX(-Math.PI / 2);
  decor.add('body', plaza, '#ddd3c2', 0, 0.012, 0);
  plaza.dispose();
  decor.cyl('body', '#cfc4b0', 0.34, 0.06, -4.45, 0, 1.25, 24);
  decor.cyl('shiny', '#4f9fc4', 0.28, 0.07, -4.45, 0, 1.25, 24);
  geo.exclCircle(-4.4, 1.2, 0.9);
}

/** The Turia gardens: lawn, paths, retaining walls, the pond and the bridges. */
export function buildTuriaGardens(ctx: BuildContext) {
  const { geo, decor, monu, G, root, lists } = ctx;
  const { turia, turiaHalf, sCAC, sWest } = geo;

  const pathOff = (s: number, side: number) =>
    side * 0.5 * turiaHalf(s) + 0.14 * Math.sin(s * 0.55 + (side > 0 ? 0 : 1.7));

  function ribbonGeo(s0: number, s1: number, offFn: (s: number) => [number, number], y: number) {
    const pos: number[] = [];
    let prev: [number[], number[]] | null = null;
    for (let i = 0; i < turia.P.length; i++) {
      const s = turia.L[i]!;
      if (s < s0 || s > s1) {
        prev = null;
        continue;
      }
      const p = turia.P[i]!;
      const t = turia.T[i]!;
      const [o0, o1] = offFn(s);
      const a = [p.x - t.z * o0, y, p.z + t.x * o0];
      const b = [p.x - t.z * o1, y, p.z + t.x * o1];
      if (prev) pos.push(...prev[0], ...prev[1], ...a, ...prev[1], ...b, ...a);
      prev = [a, b];
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.setAttribute(
      'normal',
      new Float32BufferAttribute(
        pos.map((_, i) => (i % 3 === 1 ? 1 : 0)),
        3,
      ),
    );
    return g;
  }

  function wallGeo(side: number, y0: number, y1: number) {
    const pos: number[] = [];
    let prev: [number, number] | null = null;
    for (let i = 0; i < turia.P.length; i++) {
      const p = turia.P[i]!;
      const t = turia.T[i]!;
      const o = side * (turiaHalf(turia.L[i]!) + 0.2);
      const x = p.x - t.z * o;
      const z = p.z + t.x * o;
      if (prev) {
        pos.push(
          prev[0],
          y0,
          prev[1],
          x,
          y0,
          z,
          x,
          y1,
          z,
          prev[0],
          y0,
          prev[1],
          x,
          y1,
          z,
          prev[0],
          y1,
          prev[1],
        );
      }
      prev = [x, z];
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  }

  const flat = (g: BufferGeometry, color: number, extra: MeshStandardMaterialParameters = {}) => {
    const m = new Mesh(g, new MeshStandardMaterial({ color, roughness: 1, ...extra }));
    m.receiveShadow = true;
    root.add(m);
    return m;
  };

  flat(
    ribbonGeo(0, Infinity, (s) => [-turiaHalf(s), turiaHalf(s)], 0.015),
    0x86a865,
  );
  flat(
    ribbonGeo(0, Infinity, (s) => [turiaHalf(s), turiaHalf(s) + 0.24], 0.03),
    0xd5c8ad,
  );
  flat(
    ribbonGeo(0, Infinity, (s) => [-turiaHalf(s) - 0.24, -turiaHalf(s)], 0.03),
    0xd5c8ad,
  );
  [1, -1].forEach((side) =>
    flat(
      ribbonGeo(0, sCAC - 1.0, (s) => [pathOff(s, side) - 0.08, pathOff(s, side) + 0.08], 0.022),
      0xdccca6,
    ),
  );
  [1, -1].forEach((side) => flat(wallGeo(side, 0, 0.13), 0xc9b99a, { side: DoubleSide }));

  // the pond in the Parc de Capçalera
  {
    const p = turia.at(sWest);
    const ry = Math.atan2(-p.tz, p.tx);
    decor.add('body', G.disc, '#cdbf9f', p.x, 0.02, p.z, { sx: 1.45, sy: 0.03, sz: 0.62, ry });
    decor.add('shiny', G.disc, '#4c94b0', p.x, 0.03, p.z, { sx: 1.35, sy: 0.03, sz: 0.52, ry });
  }

  // bridges: stone arches, the Exposició "peineta"
  function stoneBridge(L: number) {
    const S = '#d8c6a2';
    const SD = '#c4ad86';
    const n = Math.max(3, Math.round(L / 0.62));
    const span = L / n;
    monu.box('body', S, L, 0.12, 0.52, 0, 0.32, 0);
    monu.box('body', SD, L, 0.08, 0.05, 0, 0.44, 0.235);
    monu.box('body', SD, L, 0.08, 0.05, 0, 0.44, -0.235);
    for (let i = 0; i <= n; i++) monu.box('body', S, 0.14, 0.32, 0.5, -L / 2 + i * span, 0, 0);
    for (let i = 0; i < n; i++) {
      monu.add('body', G.arch, SD, -L / 2 + (i + 0.5) * span, 0, 0, {
        sx: span / 2,
        sy: 0.3,
        sz: 3.2,
      });
    }
  }
  function modernBridge(L: number) {
    monu.box('body', '#f2f3f0', L, 0.1, 0.58, 0, 0.34, 0);
    monu.add('body', G.archThin, '#f6f7f4', 0, 0.44, -0.12, {
      sx: (L / 2) * 0.82,
      sy: 0.85,
      rx: -0.42,
    });
  }
  (
    [
      [-7.4, -7.5, 0],
      [-3.55, -7.6, 0],
      [-1.9, -7.4, 0],
      [0.7, -6.6, 0],
      [2.75, -4.4, 1],
      [4.8, -0.4, 0],
      [5.9, 2.5, 0],
    ] as const
  ).forEach(([bx, bz, modern]) => {
    const n = turia.near(bx, bz);
    const L = 2 * turiaHalf(n.s) + 0.75;
    lists.bridgeS.push(n.s);
    monu.at(n.px, n.pz, Math.atan2(-n.tx, -n.tz), () =>
      modern ? modernBridge(L) : stoneBridge(L),
    );
    for (let x = -L / 2 + 0.2; x < L / 2; x += 0.55) {
      for (const z of [-0.27, 0.27]) {
        lists.lampPts.push([n.px - n.tz * x - n.tx * z, 0.55, n.pz + n.tx * x - n.tz * z]);
      }
    }
  });

  return { pathOff };
}
