/**
 * "PJ" monogram drawn as city blocks on a 32-unit grid: the P is a block with
 * a courtyard, the J a tower whose top is a lit window in Valencian orange.
 *
 * Single source for the React component, the generated apple-icon and the
 * static `src/app/icon.svg` (a test keeps that file in sync).
 */
export const MONOGRAM = {
  size: 32,
  radius: 7,
  background: '#1a1f2b',
  ink: '#faf6ee',
  accent: '#e07034',
  rects: [
    // P: stem, top, bowl side, middle (leaves a 3×3 courtyard)
    { x: 7, y: 7, w: 4, h: 18, tone: 'ink' },
    { x: 11, y: 7, w: 7, h: 4, tone: 'ink' },
    { x: 14, y: 11, w: 4, h: 3, tone: 'ink' },
    { x: 11, y: 14, w: 7, h: 4, tone: 'ink' },
    // J: lit window, tower, hook
    { x: 21, y: 7, w: 4, h: 4, tone: 'accent' },
    { x: 21, y: 12, w: 4, h: 13, tone: 'ink' },
    { x: 14, y: 21, w: 7, h: 4, tone: 'ink' },
  ],
} as const;

export type MonogramRect = (typeof MONOGRAM.rects)[number];
