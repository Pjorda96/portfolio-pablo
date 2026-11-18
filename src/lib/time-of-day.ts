/**
 * Time-of-day model shared by the 3D city, the HTML UI, the static sky
 * fallback and the pre-paint boot script. Pure functions, no three.js, so it
 * is cheap to import anywhere and easy to test.
 *
 * Hours are decimal (13.5 = 13:30) in the visitor's local time.
 */

export type ColorStops = readonly (readonly [hour: number, hex: string])[];

/** Sky (scene background and fog) through the day. */
export const SKY_STOPS: ColorStops = [
  [0, '#0a1024'],
  [4.5, '#151a38'],
  [6, '#e7a07d'],
  [7.5, '#bcd8ea'],
  [12, '#9fd0f2'],
  [17, '#b9d4e6'],
  [19, '#f0a46e'],
  [20.5, '#4b3d6b'],
  [22, '#121836'],
  [24, '#0a1024'],
];

/** Sun (or moon) light colour. */
export const SUN_STOPS: ColorStops = [
  [0, '#7f93d6'],
  [6, '#ffb08a'],
  [8, '#fff0d8'],
  [12, '#fff6e8'],
  [17, '#ffeccc'],
  [19, '#ff9a5c'],
  [20.5, '#8f86c9'],
  [24, '#7f93d6'],
];

/** Sea and lake colour. */
export const WATER_STOPS: ColorStops = [
  [0, '#0d1f33'],
  [6, '#4e6f8a'],
  [9, '#2a7499'],
  [17, '#2f6b88'],
  [19.5, '#5b4b6b'],
  [21, '#132538'],
  [24, '#0d1f33'],
];

export type UiMode = 'day' | 'night';
export type Phase = 'night' | 'dawn' | 'day' | 'dusk';

export const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Wraps any hour into [0, 24). */
export const wrapHour = (h: number): number => ((h % 24) + 24) % 24;

export const hourFromDate = (d: Date): number => d.getHours() + d.getMinutes() / 60;

/** Sun elevation as sin of its angle: 1 at noon, 0 at 6:00 and 18:00, -1 at midnight. */
export const sunElevation = (h: number): number => Math.sin(((wrapHour(h) - 6) / 12) * Math.PI);

/** 0 in full daylight, 1 at night, smooth through dawn and dusk. */
export const nightFactor = (h: number): number => 1 - smoothstep(-0.12, 0.22, sunElevation(h));

/** Which UI palette goes with the hour: the city's light, not the OS theme. */
export const uiModeOf = (h: number): UiMode => (nightFactor(h) > 0.5 ? 'night' : 'day');

/** Coarse phase of the day, for labels. */
export function phaseOf(h: number): Phase {
  const n = nightFactor(h);
  if (n >= 0.98) return 'night';
  if (n <= 0.02) return 'day';
  return wrapHour(h) < 12 ? 'dawn' : 'dusk';
}

/**
 * Late-night dimming of lit windows: most lights go off between 0:30 and
 * 3:30 and come back from 5:30 to 7:00.
 */
export const windowsFactor = (h: number): number =>
  1 - 0.55 * smoothstep(0.5, 3.5, h) * (1 - smoothstep(5.5, 7, h));

/** The two stops around `h` and the position between them. */
export function stopSegment(stops: ColorStops, h: number): { from: string; to: string; t: number } {
  const hour = wrapHour(h);
  for (let k = 0; k < stops.length - 1; k++) {
    const [a, ca] = stops[k]!;
    const [b, cb] = stops[k + 1]!;
    if (hour >= a && hour <= b) return { from: ca, to: cb, t: (hour - a) / (b - a) };
  }
  const first = stops[0]![1];
  return { from: first, to: first, t: 0 };
}

const parseHex = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const toHex = (rgb: readonly number[]): string =>
  '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');

/** Linear interpolation of two `#rrggbb` colours in sRGB space. */
export function lerpHex(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  return toHex(ca.map((c, i) => c + (cb[i]! - c) * t));
}

/** Colour of a stop list at `h`, interpolated in sRGB (CSS uses it). */
export function colorAt(stops: ColorStops, h: number): string {
  const { from, to, t } = stopSegment(stops, h);
  return lerpHex(from, to, t);
}

/** `HH:MM`, rounding minutes down. */
export function formatHour(h: number): string {
  const hour = wrapHour(h);
  const hh = Math.floor(hour);
  const mm = Math.floor((hour - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
