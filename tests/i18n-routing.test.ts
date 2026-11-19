import { describe, expect, it } from 'vitest';

import { getContent, LOCALES, type Locale } from '@/content';
import { getPathname } from '@/i18n/navigation';
import { paths, routing, type AppPathname } from '@/i18n/routing';

/** Every route of a content tree, flattened: `[['services.web', '/servicios/...'], ...]`. */
const routesOf = (locale: Locale): [string, string][] => {
  const flat = (value: unknown, path: string): [string, string][] =>
    typeof value === 'string'
      ? [[path, value]]
      : Object.entries(value as object).flatMap(([k, v]) => flat(v, path ? `${path}.${k}` : k));
  return flat(getContent(locale).meta.routes, '');
};

const es = routesOf('es');
const en = Object.fromEntries(routesOf('en'));
const internal = Object.fromEntries(routesOf('es')) as Record<string, AppPathname>;

describe('locale routing', () => {
  it('serves Spanish at the root and English under /en', () => {
    expect(routing.locales).toEqual(['es', 'en']);
    expect(routing.defaultLocale).toBe('es');
    expect(routing.localePrefix).toBe('as-needed');
  });

  it('has one pathname per content route, keyed by its Spanish URL', () => {
    expect(Object.keys(routing.pathnames).sort()).toEqual(es.map(([, route]) => route).sort());
  });

  it.each(es)('resolves %s to its public URL in both locales', (key, esRoute) => {
    const href = internal[key] as AppPathname;
    expect(getPathname({ locale: 'es', href })).toBe(esRoute);
    expect(getPathname({ locale: 'en', href })).toBe(en[key]);
  });

  it('exposes typed internal pathnames for links and metadata', () => {
    expect(paths.home).toBe('/');
    expect(paths.about).toBe('/sobre-mi');
    expect(paths.services.ai).toBe('/servicios/soluciones-ia');
    expect(getPathname({ locale: 'en', href: paths.services.ai })).toBe(
      '/en/services/ai-solutions',
    );
    expect(getPathname({ locale: 'en', href: paths.faq })).toBe('/en/faq');
    expect(getPathname({ locale: 'en', href: paths.home })).toBe('/en');
  });

  it('gives every page distinct public URLs per locale', () => {
    for (const locale of LOCALES) {
      const urls = es.map(([key]) => getPathname({ locale, href: internal[key] as AppPathname }));
      expect(new Set(urls).size, locale).toBe(urls.length);
    }
  });
});
