import type { PlaceId, ServiceId } from '@/content';

/**
 * Vector data of the social images: the flat Valencia skyline of the static
 * city fallback (`src/components/city/ui/SkyFallback.tsx`, viewBox 1200×300)
 * and the service landmarks of `LandmarkSilhouette.tsx` (viewBox 156×64).
 * Those components draw with Tailwind classes, which the image renderer does
 * not understand, so the paths are mirrored here as plain data.
 */

export const SKYLINE_VIEWBOX = { width: 1200, height: 300 } as const;

export const SKYLINE_BODY: readonly string[] = [
  // ground, wider than the fallback's: the image shows the skyline a little
  // smaller, centred, so it runs past both edges of the viewBox
  'M-200 264h1600v36h-1600z',
  // extra old town roofs to the west (image only)
  'M-128 268v-28h48v28zM-72 268v-42h38v42zM-26 268v-24h58v24z',
  // old town roofs
  'M40 268v-38h46v-16h40v54zM150 268v-30l22-14 22 14v30zM205 268v-44h52v44zM600 268v-36h44v-12h38v48zM700 268v-30h60v30z',
  // Micalet and the cathedral
  'M296 268V96h6v-8h30v8h6v172z',
  'M306 88V70h22v18zM312 70l5-12 5 12z',
  'M338 268v-62l58-22 58 22v62z',
  'M380 184v-18h32v18z',
  // Mercado Central
  'M466 268v-56h150v56z',
  'M500 212a32 32 0 0 1 64 0z',
  'M528 180v-14h8v14z',
  'M580 212a18 18 0 0 1 36 0z',
  // Ciudad de las Artes y las Ciencias
  'M770 268c20-30 120-30 140 0z',
  'M930 268v-44l12-20 10 20 10-26 10 26 10-20 10 20 10-26 10 26v44z',
  'M800 268c-10-60 40-96 80-104-30 26-50 60-48 104z',
  // the port and El Faro
  'M1040 268v-6h160v6z',
  'M1092 262v-104l4-6h12l4 6v104z',
  'M1094 152v-14h16v14zM1096 138l6-10 6 10z',
];

type Rect = readonly [x: number, y: number, w: number, h: number];

/** Lit windows, grouped by the landmark of the home city they belong to. */
export const SKYLINE_LIGHTS: Record<PlaceId | 'other', readonly Rect[]> = {
  taller: [
    [-60, 236, 8, 12],
    [54, 240, 8, 12],
    [216, 236, 8, 12],
    [236, 244, 8, 12],
  ],
  torre: [
    [314, 74, 6, 10],
    [384, 170, 24, 10],
  ],
  mercado: [
    [480, 230, 10, 14],
    [590, 230, 10, 14],
    [612, 240, 8, 12],
  ],
  lab: [[950, 238, 60, 8]],
  faro: [[1096, 141, 12, 9]],
  puerto: [[1046, 264, 148, 2]],
  other: [],
};

/** Horizontal centre of each landmark in the skyline, for the accent glow. */
export const SKYLINE_ANCHOR_X: Record<PlaceId, number> = {
  taller: 150,
  torre: 317,
  mercado: 541,
  lab: 860,
  puerto: 1120,
  faro: 1102,
};

/** Battlements along the top of La Lonja's hall, from x0 to x1 at height y. */
const merlons = (x0: number, x1: number, y: number) => {
  let d = '';
  for (let x = x0; x + 5 <= x1; x += 9) d += `M${x} ${y}h5v-5h-5z`;
  return d;
};

export const LANDMARK_VIEWBOX = { width: 156, height: 64 } as const;

/** Service landmarks: the building and its lit windows (`LandmarkSilhouette`). */
export const LANDMARKS: Record<ServiceId, { body: string; lights: string }> = {
  web: {
    body: `M6 60V12h4V7h5v5h4V7h5v5h4V7h5v5h3v48zM36 60V30h112v30z${merlons(38, 148, 30)}M0 60h154v4H0z`,
    lights:
      'M14 22h4v8h-4zM24 22h4v8h-4zM18 42h6v10h-6zM86 60V48l6-9 6 9v12zM56 38h4v8h-4zM120 38h4v8h-4z',
  },
  ai: {
    body: 'M8 60c16-26 74-26 90 0zM100 60c-6-30 14-50 46-54-18 14-28 32-26 54zM0 60h154v4H0z',
    lights: 'M46 54a7 7 0 1 0 14 0a7 7 0 1 0-14 0z',
  },
  apps: {
    body: 'M22 52h74v-6H22zM14 40h90v-6H14zM22 28h74v-6H22zM32 16h54v-6H32zM30 60V52h4v8zM84 60V52h4v8zM0 60h112v4H0z',
    lights: 'M30 42v-2h58v2zM38 30v-2h42v2zM122 54l13-38v38zM138 54V22l12 32zM116 56h40l-5 6h-30z',
  },
};
