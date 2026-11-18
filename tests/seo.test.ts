import { describe, expect, it } from 'vitest';

import { getContent } from '@/content';
import { paths } from '@/i18n/routing';
import { alternatesFor, INDEXABLE, localizedPath, pageMetadata, robots } from '@/lib/seo';

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

  it('keeps the site out of search engines until launch (F7)', () => {
    expect(INDEXABLE).toBe(false);
    expect(robots).toEqual({ index: false, follow: false });
  });
});
