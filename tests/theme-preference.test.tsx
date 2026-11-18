import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ThemeSelector } from '@/components/layout/ThemeSelector';
import { themeBootScript } from '@/lib/theme/boot-script';
import { resolveMode, THEME_STORAGE_KEY, writePreference } from '@/lib/theme/preference';
import { uiModeOf } from '@/lib/time-of-day';

import { renderWithIntl } from './utils/intl';

const root = document.documentElement;

afterEach(() => {
  writePreference('auto');
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.localStorage.clear();
  root.removeAttribute('data-mode');
  root.removeAttribute('data-theme');
});

describe('theme preference', () => {
  it('resolves auto from the hour and pins light / dark', () => {
    expect(resolveMode('auto', 13)).toBe(uiModeOf(13));
    expect(resolveMode('auto', 1)).toBe('night');
    expect(resolveMode('light', 1)).toBe('day');
    expect(resolveMode('dark', 13)).toBe('night');
  });

  it.each([
    ['light', 23, 'day'],
    ['dark', 12, 'night'],
  ] as const)('boot script applies a stored %s preference before paint', (pref, hour, mode) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 21, hour, 0));
    window.localStorage.setItem(THEME_STORAGE_KEY, pref);

    new Function(themeBootScript)();

    expect(root.getAttribute('data-theme')).toBe(pref);
    expect(root.getAttribute('data-mode')).toBe(mode);
  });

  it('boot script falls back to auto when storage is unavailable', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 21, 23, 0));
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    new Function(themeBootScript)();

    expect(root.getAttribute('data-theme')).toBe('auto');
    expect(root.getAttribute('data-mode')).toBe('night');
  });

  it('selector persists the choice and applies it to <html>', () => {
    renderWithIntl(<ThemeSelector />, 'es');

    expect(screen.getByRole('group', { name: 'Tema' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Auto' })).toBeChecked();

    fireEvent.click(screen.getByRole('radio', { name: 'Oscuro' }));
    expect(screen.getByRole('radio', { name: 'Oscuro' })).toBeChecked();
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(root.getAttribute('data-mode')).toBe('night');

    fireEvent.click(screen.getByRole('radio', { name: 'Claro' }));
    expect(root.getAttribute('data-mode')).toBe('day');

    // Auto clears the stored value.
    fireEvent.click(screen.getByRole('radio', { name: 'Auto' }));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(root.getAttribute('data-theme')).toBe('auto');
  });

  it('selector still works when storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    renderWithIntl(<ThemeSelector />, 'en');

    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(root.getAttribute('data-mode')).toBe('night');
  });
});
