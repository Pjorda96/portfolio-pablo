import { Vector3, type Group } from 'three';

import { addTree, DARK, type BuildContext } from './context';
import { COAST, huertaN, huertaW, inLake, LAKE, OT, rural, visible } from './geography';
import { mkPath, type CityPath } from './path';

const OLD_WALLS = [
  '#efe2c8',
  '#e9d2a4',
  '#f3ead9',
  '#e3c58f',
  '#ddb98e',
  '#f0dcb4',
  '#e8cfb8',
  '#f2e6cf',
  '#e6c9a0',
];
const ROOFS = ['#b5603b', '#a9573a', '#c06e48', '#9e5235', '#b86a4a', '#a8623f'];
const BLOCK_WALLS = [
  '#efe6d6',
  '#e8d6b5',
  '#f2eee6',
  '#e3cfa9',
  '#eadccd',
  '#dcc6a6',
  '#f0e2c2',
  '#e6d2bf',
  '#f1dfb8',
  '#e9d9bd',
];
const CABANYAL = [
  '#e9d9c0',
  '#cfe0e3',
  '#e8c9b5',
  '#d7e4cf',
  '#f1e3b8',
  '#cdd7ea',
  '#efd2c7',
  '#f3efe6',
];
const TOWER = ['#e9ecee', '#dfe6ea', '#efe9df', '#d9dfe3', '#e6e1d6'];

/**
 * Places every generic building, field, tree and lamp of the city into the
 * context lists, district by district. Nothing is drawn here: the lists
 * become instanced meshes later.
 */
export function placeDistricts(
  ctx: BuildContext,
  opts: { cacGroup: Group; pathOff: (s: number, side: number) => number },
) {
  const { rng, geo, decor, G, lists } = ctx;
  const { rr, rnd, pick } = rng;
  const { AV, turia, turiaHalf, turiaInfo, isTuria, blocked, exclCircle, sCAC, sWest } = geo;
  const {
    sq,
    oc,
    roofs,
    oranges,
    fields,
    reeds,
    parasols,
    containers,
    lampPts,
    parkLampPts,
    bridgeS,
  } = lists;

  // Ciutat Vella: dense, low, irregular, terracotta roofs, narrow lanes
  const OLD_STREETS = (
    [
      [
        [-9.3, -2.5],
        [-7.9, -3.75],
        [-6.2, -4.05],
        [-4.7, -4.25],
      ],
      [
        [-3.6, -5.1],
        [-4.3, -4.5],
      ],
      [
        [-4.75, -1.85],
        [-4.95, -0.4],
        [-5.0, 0.2],
      ],
      [
        [-4.3, -1.5],
        [-2.4, -1.35],
        [-0.3, -1.1],
      ],
      [
        [-9.2, -1.7],
        [-7.95, -1.15],
        [-7.2, -1.7],
      ],
      [
        [-6.0, -1.9],
        [-5.3, -2.0],
        [-4.95, -1.9],
      ],
      [
        [-2.6, -2.1],
        [-1.0, -2.7],
        [-0.4, -3.4],
      ],
      [
        [-7.2, -4.3],
        [-7.4, -5.6],
      ],
      [
        [-5.6, -4.2],
        [-5.9, -5.7],
      ],
      [
        [-2.0, -0.7],
        [-2.6, 0.9],
        [-3.2, 1.6],
      ],
      [
        [-8.6, 0.2],
        [-7.2, 0.6],
        [-5.9, 0.9],
      ],
      [
        [-2.9, -4.5],
        [-1.6, -5.0],
      ],
    ] as const
  ).map((pts) => mkPath(pts));
  for (let gx = OT.x - OT.r; gx <= OT.x + OT.r; gx += 0.47) {
    for (let gz = OT.z - OT.r; gz <= OT.z + OT.r; gz += 0.47) {
      const x = gx + rr(-0.07, 0.07);
      const z = gz + rr(-0.07, 0.07);
      const a = Math.atan2(z - OT.z, x - OT.x);
      if (Math.hypot(x - OT.x, z - OT.z) > OT.r - 0.1 + 0.2 * Math.sin(a * 5)) continue;
      if (
        isTuria(x, z, 0.4) ||
        blocked(x, z, 0.1) ||
        OLD_STREETS.some((p) => p.near(x, z).d < 0.17) ||
        rnd() < 0.04
      ) {
        continue;
      }
      const ry = 0.35 * Math.sin(x * 0.55 + z * 0.3) + 0.25 * Math.cos(z * 0.7) + rr(-0.06, 0.06);
      const w = rr(0.34, 0.44);
      const d = rr(0.34, 0.44);
      const h = rr(0.34, 0.78);
      sq.push({ x, z, w, d, h, ry, c: pick(OLD_WALLS), lit: rnd() < 0.15 ? 0 : rr(0.25, 1.05) });
      if (rnd() < 0.82)
        roofs.push({ x, z, w: w + 0.05, d: d + 0.05, h: rr(0.12, 0.2), y: h, ry, c: pick(ROOFS) });
    }
  }

  // Eixample / Russafa / Extramurs: chamfered blocks on the rotated grid of the Gran Vía
  const parkSquare = (x: number, z: number, ry: number) => {
    decor.box('body', '#8aab66', 1.1, 0.02, 1.1, x, 0, z, { ry });
    for (let i = 0; i < 5; i++)
      addTree(ctx, x + rr(-0.4, 0.4), z + rr(-0.4, 0.4), rnd() < 0.3 ? 'palm' : 'round');
  };
  {
    const th = 0.71;
    const ca = Math.cos(th);
    const sa = Math.sin(th);
    const P = 1.7;
    const ox = 3.36 + (ca * P) / 2;
    const oz = 0.2 + (sa * P) / 2;
    for (let i = -18; i <= 18; i++) {
      for (let j = -18; j <= 18; j++) {
        let x = ox + (i * ca - j * sa) * P;
        let z = oz + (i * sa + j * ca) * P;
        if (!visible(x, z) || x > 12.1) continue;
        const t = turiaInfo(x, z);
        if (t.off < 0 || t.d < t.half + 1.0) continue;
        const dOld = Math.hypot(x - OT.x, z - OT.z);
        if (dOld < 6.3) continue;
        if (rural(x, z) || huertaW(x, z) || blocked(x, z, 0.6) || AV.port.near(x, z).d < 0.95)
          continue;
        let w = 1.22;
        const gv = AV.granVia.near(x, z);
        if (gv.d < 1.0) {
          w -= 0.22;
          const sg = Math.sign((x - gv.px) * ca + (z - gv.pz) * sa);
          x += ca * 0.11 * sg;
          z += sa * 0.11 * sg;
        }
        if (rnd() < 0.05) {
          parkSquare(x, z, -th);
          continue;
        }
        let h = dOld < 10 ? rr(1.05, 1.65) : rr(0.85, 1.4);
        if (rnd() < 0.05) h += rr(0.6, 1.2);
        oc.push({
          x,
          z,
          ry: -th,
          w: w + rr(-0.04, 0.04),
          d: 1.22 + rr(-0.04, 0.04),
          h,
          c: pick(BLOCK_WALLS),
          lit: rnd() < 0.08 ? 0 : rr(0.45, 1.2),
        });
        if (rnd() < 0.4) {
          const cx = (rnd() < 0.5 ? -1 : 1) * 0.26;
          const cz = (rnd() < 0.5 ? -1 : 1) * 0.28;
          sq.push({
            x: x + cx * ca - cz * sa,
            z: z + cx * sa + cz * ca,
            ry: -th,
            w: 0.5,
            d: 0.5,
            h: h + rr(0.2, 0.5),
            c: pick(BLOCK_WALLS),
            lit: rr(0.4, 1.1),
          });
        }
      }
    }
  }

  // north of the Turia: grid along Blasco Ibáñez, towers in Campanar and Av. de Francia
  exclCircle(0.2, -9.7, 1.6);
  decor.add('body', G.disc, '#8aab66', 0.2, 0.005, -9.7, { sx: 1.7, sy: 0.02, sz: 1.5 });
  for (let i = 0; i < 26; i++) {
    const a = rnd() * 6.28;
    const r = Math.sqrt(rnd()) * 1.35;
    addTree(
      ctx,
      0.2 + Math.cos(a) * r * 1.1,
      -9.7 + Math.sin(a) * r,
      rnd() < 0.25 ? 'palm' : rnd() < 0.5 ? 'pine' : 'round',
    );
  }
  {
    const th = 0.125;
    const ca = Math.cos(th);
    const sa = Math.sin(th);
    const P = 1.6;
    const ox = 3.1 - (sa * P) / 2;
    const oz = -6.6 + (ca * P) / 2;
    for (let i = -22; i <= 22; i++) {
      for (let j = -14; j <= 14; j++) {
        let x = ox + (i * ca - j * sa) * P;
        let z = oz + (i * sa + j * ca) * P;
        if (!visible(x, z) || x > 12.15) continue;
        const t = turiaInfo(x, z);
        if (t.off > 0 || t.d < t.half + 0.95) continue;
        if (huertaN(x, z) || huertaW(x, z) || blocked(x, z, 0.6) || AV.port.near(x, z).d < 0.95)
          continue;
        if (x > 10.4 && z > -7.6 && z < 3.6) continue;
        let d = 1.15;
        const bl = AV.blasco.near(x, z);
        if (bl.d < 1.0) {
          d -= 0.2;
          const sg = Math.sign(bl.off);
          x += -sa * 0.1 * sg;
          z += ca * 0.1 * sg;
        }
        const nw = x < -8.5;
        const fr = x > 7.4 && x < 11 && z > -0.5 && z < 4.8;
        if ((nw && rnd() < 0.38) || (fr && rnd() < 0.45)) {
          const n = rnd() < 0.5 ? 1 : 2;
          for (let q = 0; q < n; q++) {
            const dx = n === 1 ? 0 : q ? 0.3 : -0.3;
            sq.push({
              x: x + dx * ca,
              z: z + dx * sa + rr(-0.15, 0.15),
              ry: -th,
              w: 0.55,
              d: 0.55,
              h: rr(2.5, 4.3),
              c: pick(TOWER),
              lit: rr(0.6, 1.3),
            });
          }
          continue;
        }
        if (rnd() < 0.05) {
          parkSquare(x, z, -th);
          continue;
        }
        oc.push({
          x,
          z,
          ry: -th,
          w: 1.15 + rr(-0.05, 0.05),
          d: d + rr(-0.05, 0.05),
          h: rr(0.85, 1.45),
          c: pick(BLOCK_WALLS),
          lit: rnd() < 0.08 ? 0 : rr(0.45, 1.2),
        });
      }
    }
  }

  // El Cabanyal: long rows of low, colourful fishermen's houses
  for (const rx of [10.75, 11.2, 11.85, 12.3]) {
    let z = -7.4;
    let k = 0;
    while (z < 3.4) {
      if (k % 9 === 8) {
        z += 0.45;
        k++;
        continue;
      }
      const d = rr(0.28, 0.36);
      if (!blocked(rx, z, 0.1) && AV.port.near(rx, z).d > 0.5) {
        sq.push({
          x: rx,
          z: z + d / 2,
          ry: 0,
          w: 0.4,
          d: d - 0.03,
          h: rr(0.26, 0.5),
          c: pick(CABANYAL),
          lit: rnd() < 0.2 ? 0 : rr(0.3, 1),
        });
      }
      z += d;
      k++;
    }
  }

  // the huerta: orange groves, fields and alquerías
  for (let x = -34; x < 12; x += 2.1) {
    for (let z = -34; z < 14; z += 2.1) {
      const cx = x + rr(-0.15, 0.15);
      const cz = z + rr(-0.15, 0.15);
      if (
        !(huertaN(cx, cz - 1) || huertaW(cx - 1, cz)) ||
        !visible(cx, cz) ||
        isTuria(cx, cz, 1.3) ||
        rural(cx, cz)
      )
        continue;
      const r = rnd();
      if (r < 0.58) {
        fields.push({ x: cx, z: cz, w: 1.85, d: 1.85, c: '#8f7d56' });
        const s0 = rr(0.15, 0.19);
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            oranges.push({
              x: cx - 0.6 + i * 0.4 + rr(-0.03, 0.03),
              z: cz - 0.6 + j * 0.4 + rr(-0.03, 0.03),
              s: s0 * rr(0.9, 1.1),
            });
          }
        }
      } else if (r < 0.9) {
        fields.push({
          x: cx,
          z: cz,
          w: 1.85,
          d: 1.85,
          c: pick(['#8fae5a', '#a7b866', '#7c9a4c', '#b9a86a', '#93a95c']),
        });
      } else {
        decor.at(cx, cz, rr(-0.3, 0.3), () => {
          decor.box('body', '#f3efe6', 0.55, 0.34, 0.38, 0, 0, 0);
          decor.add('body', G.gable, '#b5603b', 0, 0.34, 0, {
            ry: Math.PI / 2,
            sx: 0.44,
            sy: 0.22,
            sz: 0.6,
          });
        });
        addTree(ctx, cx + 0.55, cz + 0.3, 'round');
        addTree(ctx, cx - 0.45, cz + 0.45, 'palm');
        fields.push({ x: cx, z: cz, w: 1.85, d: 1.85, c: '#9aa865' });
      }
    }
  }

  // south: rice paddies, L'Albufera with reeds and barracas
  (
    [
      [-1.5, 16.4],
      [0.3, 16.7],
      [7.4, 16.5],
    ] as const
  ).forEach(([x, z]) => {
    exclCircle(x, z, 0.5);
    decor.at(x, z, 0.15, () => {
      decor.box('body', '#f6f3ec', 0.46, 0.26, 0.32, 0, 0, 0);
      decor.add('body', G.gable, '#7d6a48', 0, 0.26, 0, {
        ry: Math.PI / 2,
        sx: 0.38,
        sy: 0.42,
        sz: 0.52,
      });
      decor.box('body', '#f6f3ec', 0.02, 0.1, 0.02, 0.27, 0.64, 0);
      decor.box('body', '#f6f3ec', 0.02, 0.02, 0.07, 0.27, 0.7, 0);
      decor.box('glow', DARK, 0.1, 0.16, 0.02, 0, 0, 0.165);
    });
  });
  for (let x = -34; x < 14; x += 1.6) {
    for (let z = 13; z < 30; z += 1.1) {
      const cx = x + rr(-0.1, 0.1);
      const cz = z;
      if (
        !rural(cx, cz - 0.4) ||
        inLake(cx, cz, 1.08) ||
        !visible(cx, cz) ||
        blocked(cx, cz, 0.3) ||
        cx > COAST - 1.2
      )
        continue;
      fields.push({
        x: cx,
        z: cz,
        w: 1.45,
        d: 0.95,
        c: pick(['#7fae5a', '#93bd66', '#6f9f86', '#86b0a0', '#9cc06a']),
      });
    }
  }
  for (let a = 0; a < Math.PI * 2; a += 0.025) {
    const k = rr(0.96, 1.05);
    const x = LAKE.x + Math.cos(a) * LAKE.rx * k;
    const z = LAKE.z + Math.sin(a) * LAKE.rz * k;
    if (!visible(x, z) || x > COAST - 1) continue;
    for (let q = 0; q < 4; q++)
      reeds.push({ x: x + rr(-0.25, 0.25), z: z + rr(-0.2, 0.2), h: rr(0.18, 0.34) });
  }
  for (let i = 0; i < 5; i++) {
    const cx = LAKE.x + rr(-6, 6);
    const cz = LAKE.z + rr(-2.6, -1);
    for (let q = 0; q < 26; q++)
      reeds.push({ x: cx + rr(-0.5, 0.5), z: cz + rr(-0.25, 0.25), h: rr(0.15, 0.3) });
  }

  // ---------- coast: Malvarrosa, the Marina, the port ----------
  decor.box('body', '#e8d6aa', 1.6, 0.03, 44, 13.8, 0, -18.35);
  decor.box('body', '#e8d6aa', 1.6, 0.03, 30, 13.8, 0, 31);
  decor.box('body', '#f2f6f5', 0.08, 0.02, 44, 14.62, 0, -18.35);
  decor.box('body', '#e9e1cf', 0.45, 0.025, 30, 12.78, 0, -11.5);
  for (let z = -22; z < 3.4; z += 0.75) {
    addTree(ctx, 12.78 + 0.18, z, 'palm', 0.9);
    lampPts.push([12.6, 0.3, z + 0.35]);
  }
  for (let i = 0; i < 46; i++) {
    const z = rr(-20, 2.8);
    if (visible(13.9, z))
      parasols.push({
        x: rr(13.4, 14.3),
        z,
        c: pick(['#e2762b', '#2f86b3', '#f4f1ea', '#d94b3d', '#f2c14e', '#3b8a5a']),
      });
  }
  const Q = '#c9c3b6';
  decor.box('body', Q, 5.2, 0.14, 0.8, 17.2, 0, 4.05); // north quay
  decor.box('body', Q, 4.2, 0.14, 0.65, 16.7, 0, 9.68); // south marina quay
  decor.box('body', Q, 6.0, 0.14, 5.6, 17.6, 0, 13.4); // container terminal
  decor.box('body', '#d9d3c6', 2.0, 0.02, 6.0, 13.6, 0, 7.6); // port esplanade
  (
    [
      [13.75, 5.7],
      [13.75, 8.3],
    ] as const
  ).forEach(([x, z]) => {
    decor.box('body', '#f1ebdf', 0.75, 0.42, 1.6, x, 0, z);
    decor.add('body', G.vault, '#9aa3a8', x, 0.42, z, { sx: 0.37, sy: 0.18, sz: 1.6 });
  });
  {
    const a = [19.6, 4.0] as const;
    const b = [21.9, 6.6] as const;
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const L = Math.hypot(dx, dz);
    const ry = Math.atan2(-dz, dx);
    decor.box('body', '#77736c', L, 0.18, 0.75, (a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2, { ry });
    decor.box('body', '#bdb7aa', L, 0.24, 0.32, (a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2, { ry });
    for (let t = 0.1; t < 1; t += 0.12) lampPts.push([a[0] + dx * t, 0.45, a[1] + dz * t]);
  }
  for (let x = 15.2; x <= 18.4; x += 0.8) {
    decor.box('body', '#b9b2a4', 0.08, 0.06, 0.95, x, 0, 4.95);
    decor.box('body', '#b9b2a4', 0.08, 0.06, 0.9, x, 0, 8.9);
  }
  for (const z of [11.4, 12.8, 14.2, 15.6]) {
    decor.at(20.1, z, 0, () => {
      (
        [
          [-0.35, -0.3],
          [0.35, -0.3],
          [-0.35, 0.3],
          [0.35, 0.3],
        ] as const
      ).forEach(([dx, dz]) => decor.box('body', '#d9572b', 0.07, 1.45, 0.07, dx, 0.14, dz));
      decor.box('body', '#d9572b', 0.82, 0.1, 0.72, 0, 1.55, 0);
      decor.box('body', '#2d6fa3', 3.2, 0.08, 0.1, 0.6, 1.85, 0);
      decor.box('body', '#d9572b', 0.3, 0.25, 0.3, -0.1, 1.65, 0);
      decor.box('blink', '#400000', 0.06, 0.06, 0.06, 2.15, 1.93, 0);
    });
  }
  for (let x = 15.2; x <= 19.3; x += 0.64) {
    for (let z = 11.0; z <= 15.8; z += 0.3) {
      if (rnd() < 0.15 || Math.abs(z - 13.4) < 0.2) continue;
      const n = 1 + ((rnd() * 3) | 0);
      for (let q = 0; q < n; q++) {
        containers.push({
          x,
          y: 0.14 + q * 0.25,
          z,
          c: pick(['#c2452d', '#2f6f9f', '#e0a530', '#3b8a5a', '#d9d4c8', '#7b4a8a', '#c96f2c']),
        });
      }
    }
  }

  // ---------- street trees, park trees ----------
  const alongAvenue = (
    path: CityPath,
    s0: number,
    step: number,
    off: number,
    type: 'round' | 'palm',
    scale: number,
  ) => {
    for (let s = s0; s < path.len; s += step) {
      const p = path.at(s);
      for (const o of [-off, off]) addTree(ctx, p.x - p.tz * o, p.z + p.tx * o, type, scale);
    }
  };
  alongAvenue(AV.granVia, 0.3, 0.55, 0.22, 'round', 0.8);
  alongAvenue(AV.blasco, 0.3, 0.6, 0.25, 'round', 0.8);
  alongAvenue(AV.port, 0.4, 0.7, 0.28, 'palm', 0.75);
  for (let s = 0.5; s < sCAC - 1.0; s += 0.3) {
    const p = turia.at(s);
    const h = turiaHalf(s);
    if (!visible(p.x, p.z)) continue;
    for (let k = 0; k < 2; k++) {
      const off = rr(-h + 0.22, h - 0.22);
      if (Math.abs(off - opts.pathOff(s, 1)) < 0.2 || Math.abs(off - opts.pathOff(s, -1)) < 0.2)
        continue;
      if (bridgeS.some((b) => Math.abs(b - s) < 0.5)) continue;
      if (Math.abs(s - sWest) < 1.6 && Math.abs(off) < 0.75) continue;
      const r = rnd();
      addTree(
        ctx,
        p.x - p.tz * off,
        p.z + p.tx * off,
        r < 0.45 ? 'round' : r < 0.73 ? 'pine' : 'palm',
        rr(0.85, 1.15),
      );
    }
    if (((s * 10) | 0) % 8 === 0) {
      for (const side of [1, -1]) {
        const o = opts.pathOff(s, side) + 0.14 * side;
        parkLampPts.push([p.x - p.tz * o, 0.22, p.z + p.tx * o]);
      }
    }
  }
  for (let x = -2.6; x <= 2.7; x += 0.55) {
    for (const z of [1.98, -1.35]) {
      if (z < 0 && (x < -0.5 || x > 2.4)) continue;
      const w = opts.cacGroup.localToWorld(new Vector3(x, 0, z));
      addTree(ctx, w.x, w.z, 'palm', 0.85);
    }
  }
  // old-town plazas
  (
    [
      [-4.65, -1.55],
      [-4.7, -4.3],
      [-6.45, -1.88],
      [-2.0, -3.55],
    ] as const
  ).forEach(([x, z]) => {
    addTree(ctx, x + 0.3, z + 0.25, 'round', 0.8);
    addTree(ctx, x - 0.3, z - 0.2, 'palm', 0.8);
  });

  // ---------- lamps ----------
  const lampsAlong = (path: CityPath, step: number, off: readonly number[], y = 0.28) => {
    for (let s = step / 2; s < path.len; s += step) {
      const p = path.at(s);
      for (const o of off) {
        const x = p.x - p.tz * o;
        const z = p.z + p.tx * o;
        if (visible(x, z) && !isTuria(x, z, -0.05)) lampPts.push([x, y, z]);
      }
    }
  };
  lampsAlong(AV.ring, 0.55, [-0.3, 0.3]);
  lampsAlong(AV.granVia, 0.55, [-0.36, 0.36]);
  lampsAlong(AV.port, 0.55, [-0.36, 0.36]);
  lampsAlong(AV.blasco, 0.55, [-0.36, 0.36]);
  lampsAlong(AV.bankS, 0.6, [-0.22]);
  lampsAlong(AV.bankN, 0.6, [0.22]);
  OLD_STREETS.forEach((p) => lampsAlong(p, 0.55, [0], 0.2));
}
