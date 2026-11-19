import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LocaleSwitcher, otherLocale } from '@/components/layout/LocaleSwitcher';
import { getContent, type Locale } from '@/content';

import { renderWithIntl } from './utils/intl';

const navigation = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => navigation.pathname,
}));

/** Every route of a content tree, flattened to `[key, url]`. */
const routesOf = (locale: Locale): [string, string][] => {
  const flat = (value: unknown, path: string): [string, string][] =>
    typeof value === 'string'
      ? [[path, value]]
      : Object.entries(value as object).flatMap(([k, v]) => flat(v, path ? `${path}.${k}` : k));
  return flat(getContent(locale).meta.routes, '');
};

const enRoutes = Object.fromEntries(routesOf('en'));
const counterparts = routesOf('es').map(([key, es]) => ({ key, es, en: enRoutes[key] as string }));

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    navigation.pathname = '/';
  });

  it('targets the other locale', () => {
    expect(otherLocale('es')).toBe('en');
    expect(otherLocale('en')).toBe('es');
  });

  it.each(counterparts)('links $es to $en', ({ es, en }) => {
    navigation.pathname = es;
    renderWithIntl(<LocaleSwitcher />, 'es');

    const link = screen.getByRole('link', { name: /English/ });
    expect(link).toHaveAttribute('href', en);
    expect(link).toHaveAttribute('hreflang', 'en');
    expect(link).toHaveAccessibleName('Cambiar idioma: English');
  });

  // Towards the default locale the link is the canonical bare URL, never the
  // `/es/...` form the proxy would only redirect (there is no locale cookie).
  it.each(counterparts)('links $en back to $es', ({ es }) => {
    // `usePathname` gives the internal (Spanish) pathname on every locale.
    navigation.pathname = es;
    renderWithIntl(<LocaleSwitcher />, 'en');

    const link = screen.getByRole('link', { name: /Español/ });
    expect(link).toHaveAttribute('href', es);
    expect(link).toHaveAttribute('hreflang', 'es');
  });
});
