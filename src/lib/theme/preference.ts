import type { UiMode } from '@/lib/time-of-day';

/**
 * Theme preference of the visitor: follow the system / browser setting
 * (`auto`, the default, via `prefers-color-scheme`) or pin the day / night
 * palette. The city's sky keeps following the hour either way. Persisted in localStorage; every
 * access is guarded because storage can be blocked or unavailable.
 *
 * The boot script (`boot-script.ts`) applies it before first paint and sets
 * `data-theme` (the preference) and `data-mode` (the resolved palette) on
 * <html>. This module keeps both in sync afterwards.
 */

export const THEME_PREFERENCES = ['auto', 'light', 'dark'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export const THEME_STORAGE_KEY = 'pj-theme';

const isPreference = (value: unknown): value is ThemePreference =>
  (THEME_PREFERENCES as readonly unknown[]).includes(value);

/** Palette for a preference; `auto` follows the system colour scheme. */
export const resolveMode = (pref: ThemePreference, systemDark: boolean): UiMode =>
  pref === 'light' ? 'day' : pref === 'dark' ? 'night' : systemDark ? 'night' : 'day';

const DARK_QUERY = '(prefers-color-scheme: dark)';

const darkQuery = (): MediaQueryList | null =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(DARK_QUERY)
    : null;

/** Whether the system / browser asks for a dark colour scheme. */
export const systemPrefersDark = (): boolean => darkQuery()?.matches ?? false;

/** Last known preference: storage is read once, and a blocked write still sticks. */
let current: ThemePreference | null = null;

export function readPreference(): ThemePreference {
  if (current) return current;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    current = isPreference(stored) ? stored : 'auto';
  } catch {
    current = 'auto';
  }
  return current;
}

const listeners = new Set<() => void>();

export function subscribePreference(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab changed it.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_STORAGE_KEY && e.key !== null) return;
    current = null;
    applyPreference();
    listener();
  };
  window.addEventListener('storage', onStorage);
  // The system switched between light and dark while the page is open.
  const query = darkQuery();
  const onScheme = () => {
    applyPreference();
    listener();
  };
  query?.addEventListener('change', onScheme);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
    query?.removeEventListener('change', onScheme);
  };
}

/** Writes `data-theme` and `data-mode` on <html> for the current preference. */
export function applyPreference(pref: ThemePreference = readPreference()): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', pref);
  const mode = resolveMode(pref, systemPrefersDark());
  if (root.getAttribute('data-mode') !== mode) root.setAttribute('data-mode', mode);
}

export function writePreference(pref: ThemePreference): void {
  current = pref;
  try {
    if (pref === 'auto') window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Storage blocked: the choice still applies to this page view.
  }
  applyPreference(pref);
  for (const l of listeners) l();
}
