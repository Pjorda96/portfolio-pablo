/**
 * Colour tokens of the site, derived from the "La ciudad" prototype.
 *
 * This module is the source of truth: `src/app/globals.css` declares the same
 * values as `--day-*` / `--night-*` custom properties (a test keeps both in
 * sync) and the contrast test checks every text/background pair against WCAG
 * AA in both themes.
 *
 * The UI follows the city's time of day: the boot script sets
 * `data-mode="day" | "night"` on <html>, which pins `color-scheme`, and the
 * semantic tokens resolve with `light-dark()`. Without JavaScript nothing pins
 * it, so `prefers-color-scheme` decides.
 */

export type ThemeName = 'day' | 'night';

export interface ThemeTokens {
  /** Page background and solid panels. */
  ground: string;
  /** Base colour of the translucent "glass" panels floating over the city. */
  surface: string;
  /** Opacity of the glass panels; contrast is checked at this value. */
  surfaceAlpha: number;
  /** Body and heading text. */
  text: string;
  /** Secondary text. */
  textMuted: string;
  /** Hairlines and panel borders (decorative, not a contrast pair). */
  line: string;
  /** Interactive accent: focus ring, slider, markers. Non-text, 3:1. */
  accent: string;
  /** Accent used for text and filled buttons. 4.5:1. */
  accentStrong: string;
  /** Text on `accentStrong`. */
  accentInk: string;
  /** Silhouette of the static skyline fallback (decorative). */
  skyline: string;
  /** Lit windows of the static skyline fallback (decorative). */
  skylineLight: string;
}

export const themes: Record<ThemeName, ThemeTokens> = {
  day: {
    ground: '#faf6ee',
    surface: '#faf6ee',
    surfaceAlpha: 0.9,
    text: '#1a1f2b',
    textMuted: '#4b5466',
    line: 'rgb(26 31 43 / 0.14)',
    accent: '#c0541c',
    accentStrong: '#a3401a',
    accentInk: '#ffffff',
    skyline: '#b9ae9b',
    skylineLight: '#b9ae9b',
  },
  night: {
    ground: '#0d1222',
    surface: '#0a0e1c',
    surfaceAlpha: 0.82,
    text: '#eef1f8',
    textMuted: '#a9b2c8',
    line: 'rgb(238 241 248 / 0.16)',
    accent: '#ffb067',
    accentStrong: '#ffb067',
    accentInk: '#1a1206',
    skyline: '#1b2240',
    skylineLight: '#ffc477',
  },
};

/** Maps token keys to the CSS custom property that carries them. */
export const cssVarOf: Record<Exclude<keyof ThemeTokens, 'surfaceAlpha'>, string> = {
  ground: '--ground',
  surface: '--surface',
  text: '--text',
  textMuted: '--text-muted',
  line: '--line',
  accent: '--accent',
  accentStrong: '--accent-strong',
  accentInk: '--accent-ink',
  skyline: '--skyline',
  skylineLight: '--skyline-light',
};

export type ContrastLevel = 'text' | 'ui';

export interface ContrastPair {
  name: string;
  foreground: keyof ThemeTokens;
  background: keyof ThemeTokens;
  /** Glass panels are checked composited over pure black and pure white. */
  glass?: boolean;
  level: ContrastLevel;
}

/** Every foreground/background combination the UI actually uses. */
export const contrastPairs: readonly ContrastPair[] = [
  { name: 'text on ground', foreground: 'text', background: 'ground', level: 'text' },
  { name: 'muted text on ground', foreground: 'textMuted', background: 'ground', level: 'text' },
  {
    name: 'accent text on ground',
    foreground: 'accentStrong',
    background: 'ground',
    level: 'text',
  },
  {
    name: 'text on glass',
    foreground: 'text',
    background: 'surface',
    glass: true,
    level: 'text',
  },
  {
    name: 'muted text on glass',
    foreground: 'textMuted',
    background: 'surface',
    glass: true,
    level: 'text',
  },
  {
    name: 'accent text on glass',
    foreground: 'accentStrong',
    background: 'surface',
    glass: true,
    level: 'text',
  },
  {
    name: 'button text on accent',
    foreground: 'accentInk',
    background: 'accentStrong',
    level: 'text',
  },
  { name: 'pressed chip text', foreground: 'ground', background: 'text', level: 'text' },
  { name: 'accent UI on ground', foreground: 'accent', background: 'ground', level: 'ui' },
  {
    name: 'accent UI on glass',
    foreground: 'accent',
    background: 'surface',
    glass: true,
    level: 'ui',
  },
];

export const MIN_CONTRAST: Record<ContrastLevel, number> = { text: 4.5, ui: 3 };
