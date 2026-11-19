import { getContent, isLocale, LOCALES, SERVICE_IDS, type Locale, type ServiceId } from '@/content';

import { getOgCopy, type OgPage } from './copy';
import { renderOgImage } from './render';

/**
 * Building blocks of the `opengraph-image.tsx` / `twitter-image.tsx` files
 * under `src/app/[locale]/`. Each file is a thin wrapper:
 *
 *   export const alt = ogImageAlt('about');
 *   export const size = OG_SIZE;
 *   export const contentType = OG_CONTENT_TYPE;
 *   export const generateStaticParams = ogStaticParams;
 *   export default ogImage('about');
 *
 * Image routes are route handlers: they do not inherit the layout's
 * `generateStaticParams`, so each file exports its own (one entry per
 * locale) and Next prerenders both PNGs at build time. That rules out
 * `generateImageMetadata` (its generated static params drop `[locale]`, so
 * the images would only be rendered on the first request), and with it a
 * per-locale `alt`: the `alt` export is one string for both locales.
 */

const isService = (page: OgPage): page is ServiceId =>
  (SERVICE_IDS as readonly string[]).includes(page);

const toLocale = (value: string | undefined): Locale => (value && isLocale(value) ? value : 'es');

/** `generateStaticParams` of every image route: both locales. */
export const ogStaticParams = () => LOCALES.map((locale) => ({ locale }));

/** Distinct values, in locale order, joined with ` / `. */
const both = (values: string[]) => [...new Set(values)].join(' / ');

/**
 * `alt` of an image route, shared by both locales because the export cannot
 * read `[locale]`: the kicker and title of each locale (said once when they
 * match), all from the content tree.
 */
export function ogImageAlt(page: OgPage): string {
  const copies = LOCALES.map((locale) => getOgCopy(locale, page));
  const site = getContent(LOCALES[0]).meta.siteName;
  return `${site} · ${both(copies.map((c) => c.kicker))}: ${both(copies.map((c) => c.title))}`;
}

export function ogImage(page: OgPage) {
  return async function Image({ params }: { params: Promise<{ locale: string }> }) {
    const locale = toLocale((await params).locale);
    const { kicker, title, subtitle, landmark } = getOgCopy(locale, page);
    return renderOgImage({
      kicker,
      title,
      subtitle,
      landmark,
      service: isService(page) ? page : undefined,
      siteName: getContent(locale).meta.siteName,
    });
  };
}
