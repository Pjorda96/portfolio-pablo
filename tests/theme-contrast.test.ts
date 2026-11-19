import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { composite, contrastRatio } from '@/lib/theme/contrast';
import {
  contrastPairs,
  cssVarOf,
  MIN_CONTRAST,
  themes,
  type ThemeName,
  type ThemeTokens,
} from '@/lib/theme/tokens';

const THEMES = Object.keys(themes) as ThemeName[];

/** Colours a glass panel can end up on: composited over black and white backdrops. */
function backgroundsFor(theme: ThemeTokens, key: keyof ThemeTokens, glass?: boolean): string[] {
  const color = theme[key] as string;
  if (!glass) return [color];
  return ['#000000', '#ffffff'].map((backdrop) => composite(color, theme.surfaceAlpha, backdrop));
}

describe('colour tokens meet WCAG AA', () => {
  for (const name of THEMES) {
    const theme = themes[name];

    describe(`${name} theme`, () => {
      for (const pair of contrastPairs) {
        it(`${pair.name} ≥ ${MIN_CONTRAST[pair.level]}:1`, () => {
          const fg = theme[pair.foreground] as string;
          for (const bg of backgroundsFor(theme, pair.background, pair.glass)) {
            const ratio = contrastRatio(fg, bg);
            expect(
              ratio,
              `${name}: ${pair.name} (${fg} on ${bg}) is ${ratio.toFixed(2)}:1`,
            ).toBeGreaterThanOrEqual(MIN_CONTRAST[pair.level]);
          }
        });
      }
    });
  }
});

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
    expect(contrastRatio('#ffffff', '#ffffff')).toBe(1);
  });
});

describe('globals.css stays in sync with tokens.ts', () => {
  const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

  /** Custom properties declared inside the block that follows `marker`. */
  function declarations(marker: string): Record<string, string> {
    const start = css.indexOf(marker);
    expect(start, `missing block ${marker}`).toBeGreaterThanOrEqual(0);
    const open = css.indexOf('{', start);
    const close = css.indexOf('}', open);
    const body = css.slice(open + 1, close);
    return Object.fromEntries(
      [...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]),
    );
  }

  for (const name of THEMES) {
    it(`declares every ${name} token`, () => {
      const vars = declarations(`/* tokens:${name} */`);
      const theme = themes[name];
      for (const [key, cssVar] of Object.entries(cssVarOf)) {
        const themed = `--${name}-${cssVar.slice(2)}`;
        expect(vars[themed], themed).toBe(theme[key as keyof typeof cssVarOf]);
      }
      expect(vars[`--${name}-surface-alpha`]).toBe(String(theme.surfaceAlpha));
    });
  }
});
