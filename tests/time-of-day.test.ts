import { afterEach, describe, expect, it, vi } from 'vitest';

import { themeBootScript } from '@/lib/theme/boot-script';
import {
  colorAt,
  formatHour,
  lerpHex,
  nightFactor,
  phaseOf,
  SKY_STOPS,
  stopSegment,
  SUN_STOPS,
  uiModeOf,
  WATER_STOPS,
  windowsFactor,
  wrapHour,
} from '@/lib/time-of-day';

describe('hour → phase', () => {
  it('is full night around midnight and full day around noon', () => {
    expect(nightFactor(0)).toBe(1);
    expect(nightFactor(3)).toBe(1);
    expect(nightFactor(12)).toBe(0);
    expect(nightFactor(15)).toBe(0);
  });

  it('changes smoothly through dawn and dusk', () => {
    const dawn = nightFactor(6);
    const dusk = nightFactor(18);
    expect(dawn).toBeGreaterThan(0);
    expect(dawn).toBeLessThan(1);
    expect(dusk).toBeCloseTo(dawn, 10);
    // monotonic through the morning
    let prev = 1;
    for (let h = 5; h <= 7.5; h += 0.1) {
      const n = nightFactor(h);
      expect(n).toBeLessThanOrEqual(prev + 1e-12);
      prev = n;
    }
  });

  it('picks the UI palette from the city light', () => {
    expect(uiModeOf(2)).toBe('night');
    expect(uiModeOf(9)).toBe('day');
    expect(uiModeOf(13.5)).toBe('day');
    expect(uiModeOf(19.5)).toBe('night');
    expect(uiModeOf(23)).toBe('night');
  });

  it('names the phases', () => {
    expect(phaseOf(1)).toBe('night');
    expect(phaseOf(6)).toBe('dawn');
    expect(phaseOf(12)).toBe('day');
    expect(phaseOf(18)).toBe('dusk');
  });

  it('dims windows in the small hours only', () => {
    expect(windowsFactor(21)).toBe(1);
    expect(windowsFactor(4)).toBeCloseTo(0.45, 5);
    expect(windowsFactor(8)).toBe(1);
  });

  it('wraps hours into a day', () => {
    expect(wrapHour(24)).toBe(0);
    expect(wrapHour(25.5)).toBe(1.5);
    expect(wrapHour(-1)).toBe(23);
  });
});

describe('colour interpolation', () => {
  it('returns the exact stop colours at stop hours', () => {
    for (const stops of [SKY_STOPS, SUN_STOPS, WATER_STOPS]) {
      for (const [h, hex] of stops.slice(0, -1)) expect(colorAt(stops, h)).toBe(hex);
    }
  });

  it('interpolates between stops', () => {
    expect(stopSegment(SKY_STOPS, 9.75)).toEqual({ from: '#bcd8ea', to: '#9fd0f2', t: 0.5 });
    expect(lerpHex('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(colorAt(SKY_STOPS, 9.75)).toBe(lerpHex('#bcd8ea', '#9fd0f2', 0.5));
  });

  it('closes the loop at midnight', () => {
    for (const stops of [SKY_STOPS, SUN_STOPS, WATER_STOPS]) {
      expect(stops[0]![0]).toBe(0);
      expect(stops.at(-1)![0]).toBe(24);
      expect(stops.at(-1)![1]).toBe(stops[0]![1]);
      expect(colorAt(stops, 24)).toBe(colorAt(stops, 0));
    }
  });

  it('formats the clock', () => {
    expect(formatHour(0)).toBe('00:00');
    expect(formatHour(9.25)).toBe('09:15');
    expect(formatHour(23.999)).toBe('23:59');
  });
});

describe('theme boot script', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.removeAttribute('data-mode');
    document.documentElement.style.removeProperty('--sky');
  });

  for (const [hh, mm] of [
    [0, 0],
    [5, 40],
    [6, 30],
    [12, 0],
    [18, 15],
    [19, 45],
    [23, 59],
  ] as const) {
    it(`matches time-of-day.ts at ${hh}:${String(mm).padStart(2, '0')}`, () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 5, 21, hh, mm));
      new Function(themeBootScript)();

      const h = hh + mm / 60;
      const root = document.documentElement;
      expect(root.getAttribute('data-mode')).toBe(uiModeOf(h));
      expect(root.style.getPropertyValue('--sky')).toBe(colorAt(SKY_STOPS, h));
    });
  }
});
