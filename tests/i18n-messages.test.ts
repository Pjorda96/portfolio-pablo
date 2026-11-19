import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { LOCALES } from '@/content';
import { buildMessages } from '@/i18n/messages';
import { THEME_PREFERENCES } from '@/lib/theme/preference';

const SRC = join(process.cwd(), 'src');

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });

const files = sourceFiles(SRC).map((path) => ({ path, text: readFileSync(path, 'utf8') }));

/** Keys read with `t('key')` in the files that call `useTranslations('Namespace')`. */
const usedKeys = (namespace: string): Set<string> => {
  const keys = new Set<string>();
  const call = new RegExp(`(useTranslations|getTranslations)\\(\\s*'${namespace}'\\s*\\)`);
  for (const { text } of files.filter((f) => call.test(f.text))) {
    for (const match of text.matchAll(/\bt\(\s*'([^']+)'/g)) keys.add(match[1] as string);
  }
  // `ThemeSelector` reads one key per preference: `t(pref)`.
  if (namespace === 'Theme') for (const pref of THEME_PREFERENCES) keys.add(pref);
  return keys;
};

const keysOf = (value: object, prefix = ''): string[] =>
  Object.entries(value).flatMap(([k, v]) =>
    typeof v === 'object' && v ? keysOf(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

describe('next-intl messages', () => {
  const es = buildMessages('es');

  it.each(LOCALES)('has the same keys in %s', (locale) => {
    expect(keysOf(buildMessages(locale)).sort()).toEqual(keysOf(es).sort());
  });

  it.each(LOCALES)('has no empty messages and no ICU syntax in %s', (locale) => {
    for (const key of keysOf(buildMessages(locale))) {
      const [ns, k] = key.split('.') as [keyof typeof es, string];
      const value = (buildMessages(locale)[ns] as Record<string, string>)[k] ?? '';
      expect(value.trim(), key).not.toBe('');
      expect(value, key).not.toMatch(/[{}]/);
    }
  });

  it('has no orphan keys: every message is read by a component', () => {
    for (const [namespace, messages] of Object.entries(es)) {
      const used = usedKeys(namespace);
      for (const key of Object.keys(messages)) {
        expect(used.has(key), `${namespace}.${key} is never used`).toBe(true);
      }
    }
  });

  it('reads no key that does not exist', () => {
    for (const [namespace, messages] of Object.entries(es)) {
      for (const key of usedKeys(namespace)) {
        expect(Object.keys(messages), `${namespace}.${key}`).toContain(key);
      }
    }
  });
});
