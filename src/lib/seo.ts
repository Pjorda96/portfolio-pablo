import type { Metadata } from 'next';

import { getContent, LOCALES, DEFAULT_LOCALE, type Locale, type PageMeta } from '@/content';
import { env } from '@/env';
import { getPathname } from '@/i18n/navigation';
import type { AppPathname } from '@/i18n/routing';

/**
 * The single switch that opens the site to search engines. It stays `false`
 * (noindex, nofollow on every page) until launch in F7.
 */
export const INDEXABLE = false;

export const robots: NonNullable<Metadata['robots']> = INDEXABLE
  ? { index: true, follow: true }
  : { index: false, follow: false };

/** `%s · Pablo Jordá`: only for titles that are not complete already. */
export const TITLE_TEMPLATE = `%s · ${getContent(DEFAULT_LOCALE).meta.siteName}`;

/** Public path of an internal pathname in a locale: `('en', '/sobre-mi')` → `/en/about`. */
export const localizedPath = (locale: Locale, pathname: AppPathname): string =>
  getPathname({ locale, href: pathname });

/** Absolute URL on the canonical origin (`SITE_URL`). */
export const absoluteUrl = (path: string, origin: string = env.SITE_URL): string =>
  new URL(path, origin).toString();

/**
 * Canonical URL plus `hreflang` alternates for every locale and `x-default`
 * (the Spanish page, served at the root).
 */
export function alternatesFor(
  locale: Locale,
  pathname: AppPathname,
  origin: string = env.SITE_URL,
): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[getContent(l).meta.htmlLang] = absoluteUrl(localizedPath(l, pathname), origin);
  }
  languages['x-default'] = absoluteUrl(localizedPath(DEFAULT_LOCALE, pathname), origin);

  return {
    canonical: absoluteUrl(localizedPath(locale, pathname), origin),
    languages,
  };
}

interface PageMetadataInput {
  locale: Locale;
  /** Internal pathname of the page: `paths.*` from `@/i18n/routing`. */
  pathname: AppPathname;
  /** Title (complete, ≤ 60 chars) and description from the content tree. */
  meta: PageMeta;
  /** `article` for the case study; `website` otherwise. */
  ogType?: 'website' | 'article';
  origin?: string;
}

/**
 * Metadata of a page: title, description, canonical, hreflang + x-default,
 * Open Graph and Twitter basics, robots. Every `generateMetadata` under
 * `src/app/[locale]/` returns this, optionally spread with extras.
 */
export function pageMetadata({
  locale,
  pathname,
  meta,
  ogType = 'website',
  origin = env.SITE_URL,
}: PageMetadataInput): Metadata {
  const site = getContent(locale).meta;
  const alternates = alternatesFor(locale, pathname, origin);

  return {
    // Content titles are complete ("Sobre mí · Pablo Jordá"): no template.
    title: { absolute: meta.title },
    description: meta.description,
    alternates,
    openGraph: {
      type: ogType,
      url: alternates.canonical as string,
      siteName: site.siteName,
      title: meta.title,
      description: meta.description,
      locale: site.ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => getContent(l).meta.ogLocale),
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
    robots,
  };
}
