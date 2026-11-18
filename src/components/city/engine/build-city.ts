import {
  BufferAttribute,
  Color,
  Fog,
  Group,
  type Material,
  Mesh,
  Points,
  Texture,
  Vector3,
  type InstancedMesh,
  type Scene,
} from 'three';

import type { PlaceId } from '@/content/site';
import {
  nightFactor,
  smoothstep,
  stopSegment,
  SKY_STOPS,
  sunElevation,
  SUN_STOPS,
  windowsFactor,
  WATER_STOPS,
  wrapHour,
  type ColorStops,
} from '@/lib/time-of-day';

import { buildInstancedCity } from './buildings';
import type { BuildContext } from './context';
import { placeDistricts } from './districts';
import { buildBoats, createLights, createTraffic, glowPoints } from './effects';
import { createGeography } from './geography';
import { createGeometryLibrary, disposeLibrary, Kit } from './kit';
import { buildLandmarks } from './landmarks';
import { createFacadeMaterials, createGlowSprite, matSet, uniformsOf } from './materials';
import { buildMonuments, buildPlazas, buildTuriaGardens } from './monuments';
import { createRng } from './rng';
import { buildTerrain } from './terrain';

export interface CityOptions {
  /** Renderer pixel ratio: glow sprites have a fixed on-screen size. */
  pixelRatio: number;
  maxAnisotropy: number;
}

export interface CityModel {
  root: Group;
  /** World position of each landmark's pin. */
  anchors: Record<PlaceId, Vector3>;
  pickables: Mesh[];
  /** Ground point the camera centres on. */
  center: Vector3;
  /** Adds the city to a scene (background, fog, root). */
  attach(scene: Scene): void;
  detach(scene: Scene): void;
  /** Lighting, sky, water and night lights for a local hour. */
  applyHour(hour: number): void;
  /** Moving parts: traffic, boats, lighthouse, crane beacons. */
  animate(elapsed: number, dt: number): void;
  setHover(id: PlaceId | null): void;
  /** Tone-mapping exposure for the current hour (a touch brighter at night). */
  exposure(): number;
  /** Frees every GPU resource the city created. */
  dispose(): void;
}

const _c1 = new Color();
const _c2 = new Color();

/** three.js lerp of a stop list (linear working space, like the prototype). */
function stopColor(stops: ColorStops, h: number, out: Color): Color {
  const { from, to, t } = stopSegment(stops, h);
  return out.copy(_c1.set(from)).lerp(_c2.set(to), t);
}

/**
 * Generates the whole city. Builders run in the prototype's order because
 * they share one seeded random stream.
 */
export function buildCity({ pixelRatio, maxAnisotropy }: CityOptions): CityModel {
  const G = createGeometryLibrary();
  const root = new Group();
  root.name = 'city';
  const ctx: BuildContext = {
    rng: createRng(11),
    G,
    root,
    geo: createGeography(),
    monu: new Kit(G),
    decor: new Kit(G),
    matSets: [],
    lists: {
      sq: [],
      oc: [],
      roofs: [],
      trees: [],
      palms: [],
      oranges: [],
      fields: [],
      reeds: [],
      parasols: [],
      containers: [],
      lampPts: [],
      parkLampPts: [],
      bridgeS: [],
    },
  };
  const center = new Vector3(2.8, 0, 0.1);

  const landmarks = buildLandmarks(ctx);
  buildMonuments(ctx);
  buildPlazas(ctx);
  const { pathOff } = buildTuriaGardens(ctx);
  const { facade, roof } = createFacadeMaterials(ctx.rng, maxAnisotropy);
  placeDistricts(ctx, { cacGroup: landmarks.groups.lab, pathOff });
  buildInstancedCity(ctx, facade, roof);
  const boats = buildBoats(ctx);
  const { waterMat } = buildTerrain(ctx);

  const monuSet = matSet(null, '#ffae68', 0.12, '#ffcf8a', 1.4);
  const decorSet = matSet(null, '#000000', 0, '#ffd08a', 1.3);
  ctx.matSets.push(monuSet, decorSet);
  ctx.monu.build(root, monuSet.mats);
  ctx.decor.build(root, decorSet.mats);

  const sprite = createGlowSprite();
  const lamps = glowPoints(ctx, ctx.lists.lampPts, 0xffc06a, 9, sprite, pixelRatio);
  const parkLamps = glowPoints(ctx, ctx.lists.parkLampPts, 0xffd59a, 7, sprite, pixelRatio);
  const boatLights = glowPoints(ctx, boats.lightPos, 0xfff0c8, 6, sprite, pixelRatio);
  const traffic = createTraffic(ctx);
  const cars = glowPoints(ctx, traffic.positions, 0xffffff, 5, sprite, pixelRatio, true);
  cars.geometry.setAttribute('color', new BufferAttribute(traffic.colors, 3));

  const { hemi, sun } = createLights(ctx);

  const fog = new Fog(0x9fd0ef, 50, 112);
  const sky = new Color();
  const white = new Color('#ffffff');
  const dir = new Vector3();
  let night = 0;
  let toneExposure = 1;

  function applyHour(h: number) {
    const hour = wrapHour(h);
    const elev = sunElevation(hour);
    const ang = ((hour - 6) / 12) * Math.PI;
    night = nightFactor(hour);
    stopColor(SKY_STOPS, hour, sky);
    fog.color.copy(sky);
    const isDay = elev > -0.05;
    if (isDay) dir.set(Math.cos(ang) * 24, Math.max(elev, 0.07) * 24, 13);
    else dir.set(8, 22, 10);
    sun.position.copy(center).add(dir);
    sun.target.position.copy(center);
    sun.target.updateMatrixWorld();
    stopColor(SUN_STOPS, hour, sun.color);
    sun.intensity = isDay ? 0.35 + 2.0 * smoothstep(-0.05, 0.5, elev) : 0.45;
    hemi.intensity = 0.38 + 0.5 * (1 - night);
    hemi.color.copy(sky).lerp(white, 0.5);
    stopColor(WATER_STOPS, hour, waterMat.color);
    facade.emissiveIntensity = night * 1.35 * windowsFactor(hour);
    for (const s of ctx.matSets) {
      const u = night * s.upK;
      for (const k of ['body', 'shiny', 'glow'] as const)
        uniformsOf(s.mats[k]).uUp.value.copy(s.up).multiplyScalar(u);
      s.mats.glow.emissiveIntensity = night * s.glowK;
    }
    lamps.material.opacity = night;
    parkLamps.material.opacity = night * 0.9;
    boatLights.material.opacity = night;
    cars.material.opacity = 0.1 + night * 0.9;
    landmarks.beamMaterial.opacity = night * 0.2;
    toneExposure = 0.95 + night * 0.15;
  }

  function animate(t: number, dt: number) {
    landmarks.beam.rotation.y = t * 0.9;
    traffic.place(dt);
    cars.geometry.getAttribute('position').needsUpdate = true;
    boats.place(t);
    boatLights.geometry.getAttribute('position').needsUpdate = true;
    const on = (Math.sin(t * 3) > 0 ? 1 : 0) * (0.4 + night * 1.6);
    for (const s of ctx.matSets) s.mats.blink.emissiveIntensity = on;
  }

  let hovered: PlaceId | null = null;
  function setHover(id: PlaceId | null) {
    if (id === hovered) return;
    hovered = id;
    for (const s of ctx.matSets) {
      if (!s.place) continue;
      for (const k of ['body', 'shiny', 'glow'] as const) {
        uniformsOf(s.mats[k]).uHover.value.set(s.place === id ? 0x553311 : 0);
      }
    }
  }

  let prevBackground: Scene['background'] = null;
  let prevFog: Scene['fog'] = null;

  return {
    root,
    anchors: landmarks.anchors,
    pickables: landmarks.pickables,
    center,
    attach(scene) {
      prevBackground = scene.background;
      prevFog = scene.fog;
      scene.background = sky;
      scene.fog = fog;
      scene.add(root);
    },
    detach(scene) {
      scene.remove(root);
      scene.background = prevBackground;
      scene.fog = prevFog;
    },
    applyHour,
    animate,
    setHover,
    exposure: () => toneExposure,
    dispose() {
      const materials = new Set<Material>();
      const textures = new Set<Texture>([sprite]);
      root.traverse((o) => {
        if (o instanceof Mesh || o instanceof Points) {
          o.geometry.dispose();
          for (const m of Array.isArray(o.material) ? o.material : [o.material]) materials.add(m);
          if ((o as InstancedMesh).isInstancedMesh) (o as InstancedMesh).dispose();
        }
      });
      for (const m of materials) {
        for (const value of Object.values(m)) if (value instanceof Texture) textures.add(value);
        m.dispose();
      }
      for (const t of textures) t.dispose();
      disposeLibrary(G);
      sun.shadow.map?.dispose();
    },
  };
}
