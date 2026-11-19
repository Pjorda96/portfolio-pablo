import type { Metadata, MetadataRoute } from 'next';

import {
  getContent,
  getService,
  LOCALES,
  DEFAULT_LOCALE,
  type Locale,
  type PageMeta,
  type ServiceId,
} from '@/content';
import { env } from '@/env';
import { getPathname } from '@/i18n/navigation';
import { paths, type AppPathname } from '@/i18n/routing';
import { INDEXABLE, isIndexable } from '@/lib/indexing';

export { INDEXABLE, isIndexable };

type RobotsMetadata = NonNullable<Metadata['robots']>;

/** Robots meta of the public pages for a given indexability. */
export const robotsFor = (indexable: boolean): RobotsMetadata =>
  indexable ? { index: true, follow: true } : { index: false, follow: false };

/**
 * Robots meta of every public page: noindex until INDEXABLE is on, and always
 * noindex outside the Vercel production deployment (previews, local builds).
 */
export const robots: RobotsMetadata = robotsFor(isIndexable(INDEXABLE, env.VERCEL_ENV));

/** 404 pages are never indexed, whatever the switch says. */
export const NOT_FOUND_ROBOTS: RobotsMetadata = { index: false, follow: true };

/** `%s · Pablo Jordá`: only for titles that are not complete already. */
export const TITLE_TEMPLATE = `%s · ${getContent(DEFAULT_LOCALE).meta.siteName}`;

/** Public path of an internal pathname in a locale: `('en', '/sobre-mi')` → `/en/about`. */
export const localizedPath = (locale: Locale, pathname: AppPathname): string =>
  getPathname({ locale, href: pathname });

/** Absolute URL on the canonical origin (`SITE_URL`). */
export const absoluteUrl = (path: string, origin: string = env.SITE_URL): string =>
  new URL(path, origin).toString();

/** Absolute public URL of a page in a locale. */
export const pageUrl = (
  locale: Locale,
  pathname: AppPathname,
  origin: string = env.SITE_URL,
): string => absoluteUrl(localizedPath(locale, pathname), origin);

/**
 * Canonical URL plus `hreflang` alternates for every locale and `x-default`
 * (the Spanish page, served at the root).
 */
export function alternatesFor(
  locale: Locale,
  pathname: AppPathname,
  origin: string = env.SITE_URL,
): { canonical: string; languages: Record<string, string> } {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[getContent(l).meta.htmlLang] = pageUrl(l, pathname, origin);
  }
  languages['x-default'] = pageUrl(DEFAULT_LOCALE, pathname, origin);

  return { canonical: pageUrl(locale, pathname, origin), languages };
}

/* ------------------------------------------------------------- page registry */

export type SitePageId =
  | 'home'
  | ServiceId
  | 'casePixelYPapel'
  | 'about'
  | 'faq'
  | 'contact'
  | 'legalNotice'
  | 'legalPrivacy'
  | 'legalCookies';

export interface SitePage {
  id: SitePageId;
  /** Internal pathname: `paths.*` from `@/i18n/routing`. */
  pathname: AppPathname;
  /** `legal` pages go last in sitemaps and llms.txt. */
  group: 'main' | 'legal';
  ogType: 'website' | 'article';
  /** Title and description from the content tree. */
  meta: (locale: Locale) => PageMeta;
  /** Short name of the page: breadcrumbs and llms.txt link text. */
  name: (locale: Locale) => string;
}

const service = (id: ServiceId): SitePage => ({
  id,
  pathname: paths.services[id],
  group: 'main',
  ogType: 'website',
  meta: (l) => getService(l, id).meta,
  name: (l) => getService(l, id).name,
});

const legal = (
  id: 'legalNotice' | 'legalPrivacy' | 'legalCookies',
  doc: 'notice' | 'privacy' | 'cookies',
): SitePage => ({
  id,
  pathname: paths.legal[doc],
  group: 'legal',
  ogType: 'website',
  meta: (l) => getContent(l).legal[doc].meta,
  name: (l) => getContent(l).legal[doc].title,
});

/**
 * Every public page of the site, once. Metadata, JSON-LD, the sitemap and
 * llms.txt all read this list, so a new page is added here and nowhere else.
 */
export const SITE_PAGES = [
  {
    id: 'home',
    pathname: paths.home,
    group: 'main',
    ogType: 'website',
    meta: (l) => getContent(l).home.meta,
    name: (l) => getContent(l).meta.siteName,
  },
  service('web'),
  service('ai'),
  service('apps'),
  {
    id: 'casePixelYPapel',
    pathname: paths.casePixelYPapel,
    group: 'main',
    ogType: 'article',
    meta: (l) => getContent(l).casePixelYPapel.meta,
    name: (l) => getContent(l).casePixelYPapel.hero.title,
  },
  {
    id: 'about',
    pathname: paths.about,
    group: 'main',
    ogType: 'website',
    meta: (l) => getContent(l).about.meta,
    name: (l) => getContent(l).meta.nav.about,
  },
  {
    id: 'faq',
    pathname: paths.faq,
    group: 'main',
    ogType: 'website',
    meta: (l) => getContent(l).faq.meta,
    name: (l) => getContent(l).meta.nav.faq,
  },
  {
    id: 'contact',
    pathname: paths.contact,
    group: 'main',
    ogType: 'website',
    meta: (l) => getContent(l).contact.meta,
    name: (l) => getContent(l).meta.nav.contact,
  },
  legal('legalNotice', 'notice'),
  legal('legalPrivacy', 'privacy'),
  legal('legalCookies', 'cookies'),
] as const satisfies readonly SitePage[];

export const sitePage = (id: SitePageId): SitePage => {
  const page = SITE_PAGES.find((p) => p.id === id);
  if (!page) throw new Error(`Unknown page: ${id}`);
  return page;
};

/* ------------------------------------------------------------------ metadata */

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
 * Open Graph and Twitter basics, robots.
 *
 * No `images`: each page's `opengraph-image` / `twitter-image` file is merged
 * in by Next (file-based metadata takes priority over these objects).
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
      url: alternates.canonical,
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

/** `generateMetadata` body of every page under `src/app/[locale]/`. */
export const metadataFor = (
  locale: Locale,
  id: SitePageId,
  origin: string = env.SITE_URL,
): Metadata => {
  const page = sitePage(id);
  return pageMetadata({
    locale,
    pathname: page.pathname,
    meta: page.meta(locale),
    ogType: page.ogType,
    origin,
  });
};

/** Metadata of the 404 pages: localized title, never indexed, no canonical. */
export const notFoundMetadata = (locale: Locale): Metadata => {
  const { notFound } = getContent(locale).meta;
  return {
    title: { absolute: notFound.title },
    description: notFound.description,
    robots: NOT_FOUND_ROBOTS,
  };
};

/* ------------------------------------------------------- sitemap and robots */

type SitemapEntry = MetadataRoute.Sitemap[number];

/**
 * One sitemap entry per page and locale, each listing its hreflang alternates
 * (both locales plus `x-default`). The 404s and the API are not pages.
 */
export function sitemapEntries(
  lastModified: Date,
  origin: string = env.SITE_URL,
): MetadataRoute.Sitemap {
  return SITE_PAGES.flatMap((page) =>
    LOCALES.map((locale): SitemapEntry => {
      const { canonical, languages } = alternatesFor(locale, page.pathname, origin);
      return {
        url: canonical,
        lastModified,
        changeFrequency: page.group === 'legal' ? 'yearly' : 'monthly',
        priority: page.id === 'home' ? 1 : page.group === 'legal' ? 0.3 : 0.8,
        alternates: { languages },
      };
    }),
  );
}

/**
 * robots.txt: crawling is always allowed (except the API), so crawlers can
 * read the `noindex` of non-indexable deployments; indexing itself is
 * controlled by the robots meta and the `X-Robots-Tag` header.
 */
export const robotsTxt = (origin: string = env.SITE_URL): MetadataRoute.Robots => ({
  rules: { userAgent: '*', allow: '/', disallow: '/api/' },
  sitemap: absoluteUrl('/sitemap.xml', origin),
});
