/** Highest canvas pixel ratio on desktop-class screens. */
export const MAX_DPR = 2;
/** Phones and tablets: their 3x screens would triple the fragment work for little gain. */
export const MAX_DPR_COARSE = 1.5;

/**
 * Pixel ratio of the city canvas: the device's, capped. A fixed number (not
 * R3F's `[min, max]` range) so the glow sprites, sized in device pixels at
 * build time, match the renderer.
 */
export function canvasPixelRatio(devicePixelRatio: number, coarsePointer: boolean): number {
  const dpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  return Math.min(Math.max(dpr, 1), coarsePointer ? MAX_DPR_COARSE : MAX_DPR);
}
