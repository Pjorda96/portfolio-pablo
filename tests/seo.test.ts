import { describe, expect, it } from 'vitest';

import { getContent, LOCALES } from '@/content';
import { parseEnv } from '@/env';
import { paths } from '@/i18n/routing';
import { DEPLOYMENT_ENVS } from '@/lib/indexing';
import {
  alternatesFor,
  INDEXABLE,
  isIndexable,
  localizedPath,
  metadataFor,
  notFoundMetadata,
  pageMetadata,
  robots,
  robotsFor,
  SITE_PAGES,
} from '@/lib/seo';

import { forbiddenIn } from './utils/forbidden';

const ORIGIN = 'https://pablojorda.es';

describe('seo helper', () => {
  it('builds the localized public path of a page', () => {
    expect(localizedPath('es', paths.contact)).toBe('/contacto');
    expect(localizedPath('en', paths.contact)).toBe('/en/contact');
    expect(localizedPath('en', paths.legal.notice)).toBe('/en/legal/legal-notice');
  });

  it('sets the canonical URL of the current locale', () => {
    expect(alternatesFor('es', paths.about, ORIGIN).canonical).toBe(
      'https://pablojorda.es/sobre-mi',
    );
    expect(alternatesFor('en', paths.about, ORIGIN).canonical).toBe(
      'https://pablojorda.es/en/about',
    );
  });

  it('lists hreflang alternates for both locales plus x-default (Spanish)', () => {
    const { languages } = alternatesFor('en', paths.services.web, ORIGIN);
    expect(languages).toEqual({
      'es-ES': 'https://pablojorda.es/servicios/desarrollo-web-a-medida',
      en: 'https://pablojorda.es/en/services/custom-web-development',
      'x-default': 'https://pablojorda.es/servicios/desarrollo-web-a-medida',
    });
  });

  it('handles the home in both locales', () => {
    const { canonical, languages } = alternatesFor('en', paths.home, ORIGIN);
    expect(canonical).toBe('https://pablojorda.es/en');
    expect(languages).toMatchObject({
      'es-ES': 'https://pablojorda.es/',
      'x-default': 'https://pablojorda.es/',
    });
  });

  it('returns complete page metadata from the content', () => {
    const meta = getContent('en').about.meta;
    const md = pageMetadata({ locale: 'en', pathname: paths.about, meta, origin: ORIGIN });

    expect(md.title).toEqual({ absolute: meta.title });
    expect(md.description).toBe(meta.description);
    expect(md.openGraph).toMatchObject({
      url: 'https://pablojorda.es/en/about',
      title: meta.title,
      locale: 'en_GB',
      alternateLocale: ['es_ES'],
      siteName: 'Pablo Jordá',
      type: 'website',
    });
    expect(md.robots).toBe(robots);
  });

  it('leaves Open Graph and Twitter images to the file conventions', () => {
    const md = metadataFor('es', 'home', ORIGIN);
    expect(md.openGraph).not.toHaveProperty('images');
    expect(md.twitter).not.toHaveProperty('images');
  });
});

describe('metadata of every page', () => {
  const all = SITE_PAGES.flatMap((page) =>
    LOCALES.map((locale) => ({ page, locale, md: metadataFor(locale, page.id, ORIGIN) })),
  );
  const cases = all.map((c) => [`${c.page.id} (${c.locale})`, c] as const);
  const titleOf = (md: (typeof all)[number]['md']) => (md.title as { absolute: string }).absolute;

  it('covers every routed page in every locale', () => {
    const routed = Object.keys(getContent('es').meta.routes).length;
    // `services` and `legal` group three routes each.
    expect(SITE_PAGES).toHaveLength(routed - 2 + 3 + 3);
    expect(new Set(SITE_PAGES.map((p) => p.pathname)).size).toBe(SITE_PAGES.length);
    expect(all).toHaveLength(SITE_PAGES.length * LOCALES.length);
  });

  it.each(cases)('%s: title ≤ 60 and description 70–160 characters', (_, { md }) => {
    const description = md.description ?? '';
    expect(titleOf(md).length).toBeGreaterThan(10);
    expect(titleOf(md).length).toBeLessThanOrEqual(60);
    expect(description.length).toBeGreaterThanOrEqual(70);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it('uses a unique title and description per page and locale', () => {
    expect(new Set(all.map(({ md }) => titleOf(md))).size).toBe(all.length);
    expect(new Set(all.map(({ md }) => md.description)).size).toBe(all.length);
  });

  it.each(cases)('%s: canonical, hreflang + x-default, OG and Twitter', (_, c) => {
    const { page, locale, md } = c;
    const canonical = new URL(localizedPath(locale, page.pathname), ORIGIN).toString();
    expect(md.alternates?.canonical).toBe(canonical);
    expect(Object.keys(md.alternates?.languages ?? {}).sort()).toEqual([
      'en',
      'es-ES',
      'x-default',
    ]);
    expect(md.alternates?.languages).toMatchObject({
      [getContent(locale).meta.htmlLang]: canonical,
      'x-default': new URL(localizedPath('es', page.pathname), ORIGIN).toString(),
    });
    expect(md.openGraph).toMatchObject({
      url: canonical,
      title: page.meta(locale).title,
      description: page.meta(locale).description,
      locale: getContent(locale).meta.ogLocale,
      type: page.id === 'casePixelYPapel' ? 'article' : 'website',
    });
    expect(md.twitter).toMatchObject({
      card: 'summary_large_image',
      title: page.meta(locale).title,
      description: page.meta(locale).description,
    });
    expect(md.robots).toBe(robots);
    expect(forbiddenIn(JSON.stringify(md))).toEqual([]);
  });

  it.each(LOCALES)('404 (%s) is never indexed and has no canonical', (locale) => {
    const md = notFoundMetadata(locale);
    expect(md.robots).toMatchObject({ index: false });
    expect(md).not.toHaveProperty('alternates');
    expect(md.title).toEqual({ absolute: getContent(locale).meta.notFound.title });
  });
});

describe('indexing', () => {
  it('is switched on since launch, but tests and local builds stay noindex', () => {
    expect(INDEXABLE).toBe(true);
    // No VERCEL_ENV here, as in any local build: never indexable.
    expect(robots).toEqual({ index: false, follow: false });
  });

  // INDEXABLE x VERCEL_ENV: only the switched-on production deployment is indexable.
  it.each([
    [true, 'production', true],
    [true, 'preview', false],
    [true, 'development', false],
    [true, undefined, false],
    [false, 'production', false],
    [false, 'preview', false],
    [false, 'development', false],
    [false, undefined, false],
  ] as const)('INDEXABLE=%s, VERCEL_ENV=%s: indexable %s', (indexable, vercelEnv, expected) => {
    expect(isIndexable(indexable, vercelEnv)).toBe(expected);
    expect(robotsFor(isIndexable(indexable, vercelEnv))).toEqual(
      expected ? { index: true, follow: true } : { index: false, follow: false },
    );
  });

  it('reads VERCEL_ENV from the environment', () => {
    for (const value of DEPLOYMENT_ENVS) {
      expect(parseEnv({ NODE_ENV: 'test', VERCEL_ENV: value }).VERCEL_ENV).toBe(value);
    }
    expect(parseEnv({ NODE_ENV: 'test', VERCEL_ENV: '' }).VERCEL_ENV).toBeUndefined();
    expect(() => parseEnv({ NODE_ENV: 'test', VERCEL_ENV: 'staging' })).toThrow(/VERCEL_ENV/);
  });
});
