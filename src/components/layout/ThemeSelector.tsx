'use client';

import { useTranslations } from 'next-intl';
import { useId, useSyncExternalStore } from 'react';

import {
  readPreference,
  subscribePreference,
  THEME_PREFERENCES,
  writePreference,
} from '@/lib/theme/preference';

const serverSnapshot = () => 'auto' as const;

/**
 * Auto (the palette follows the system / browser setting) / Light / Dark. A radio group:
 * arrow keys move between options, as with any native radio set.
 */
export function ThemeSelector({ className = '' }: { className?: string }) {
  const t = useTranslations('Theme');
  const name = useId();
  const current = useSyncExternalStore(subscribePreference, readPreference, serverSnapshot);

  return (
    <fieldset className={`flex items-center gap-2 ${className}`}>
      <legend className="sr-only">{t('label')}</legend>
      <span aria-hidden="true" className="font-mono text-[11px] tracking-[0.12em] uppercase">
        {t('label')}
      </span>
      <div className="flex rounded-full border border-line p-0.5">
        {THEME_PREFERENCES.map((pref) => (
          <label
            key={pref}
            className="cursor-pointer rounded-full px-2.5 py-1 text-xs text-text-muted has-checked:bg-text has-checked:text-ground has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
          >
            <input
              type="radio"
              name={name}
              value={pref}
              checked={current === pref}
              onChange={() => writePreference(pref)}
              className="sr-only"
            />
            {t(pref)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
