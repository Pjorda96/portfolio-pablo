import { hourFromDate, uiModeOf, type UiMode } from '@/lib/time-of-day';

/**
 * Theme preference of the visitor: follow the city's hour (`auto`, the
 * default) or pin the day / night palette. Persisted in localStorage; every
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

/** Palette for a preference; `auto` follows the hour (the city's or the visitor's). */
export const resolveMode = (pref: ThemePreference, hour: number): UiMode =>
  pref === 'light' ? 'day' : pref === 'dark' ? 'night' : uiModeOf(hour);

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
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/**
 * Hour that `auto` follows. The home city registers its clock here so the
 * palette tracks the city's hour; elsewhere it is the visitor's local time.
 */
let autoHour: () => number = () => hourFromDate(new Date());

export function setAutoHourSource(source: (() => number) | null): void {
  autoHour = source ?? (() => hourFromDate(new Date()));
}

/** Writes `data-theme` and `data-mode` on <html> for the current preference. */
export function applyPreference(pref: ThemePreference = readPreference()): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', pref);
  const mode = resolveMode(pref, autoHour());
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
