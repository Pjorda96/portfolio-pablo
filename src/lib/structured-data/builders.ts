import {
  getContent,
  getService,
  LOCALES,
  owner,
  type FaqItem,
  type Locale,
  type ServiceId,
} from '@/content';
import { env } from '@/env';
import { paths } from '@/i18n/routing';
import { pageUrl, sitePage, type SitePageId } from '@/lib/seo';

import type {
  BreadcrumbListLd,
  CreativeWorkLd,
  FAQPageLd,
  PersonLd,
  PlaceLd,
  PostalAddressLd,
  ProfessionalServiceLd,
  ProfessionalServiceRefLd,
  ServiceLd,
  WebSiteLd,
} from './types';

/*
 * Builders of the schema.org nodes. Every string comes from the content tree;
 * the only data written here is where Pablo works from, at city level (no
 * street address: `owner.address` is private and not filled yet).
 */

const ADDRESS: PostalAddressLd = {
  '@type': 'PostalAddress',
  addressLocality: 'Valencia',
  addressRegion: 'Comunitat Valenciana',
  addressCountry: 'ES',
};

/** Spain (its name in the page's language) and Valencia. */
const areaServed = (locale: Locale): readonly PlaceLd[] => [
  {
    '@type': 'Country',
    name: new Intl.DisplayNames([locale], { type: 'region' }).of(ADDRESS.addressCountry) ?? 'ES',
  },
  { '@type': 'City', name: ADDRESS.addressLocality },
];

const KNOWS_LANGUAGE: readonly string[] = LOCALES;

/** Stable, language-neutral ids of the entities shared by every page. */
export const entityIds = (origin: string = env.SITE_URL) => ({
  person: new URL('/#person', origin).toString(),
  business: new URL('/#business', origin).toString(),
});

const htmlLang = (locale: Locale) => getContent(locale).meta.htmlLang;

export function personNode(locale: Locale, origin: string = env.SITE_URL): PersonLd {
  const { meta, about } = getContent(locale);
  return {
    '@type': 'Person',
    '@id': entityIds(origin).person,
    name: owner.name,
    url: pageUrl(locale, paths.home, origin),
    jobTitle: meta.jobTitle,
    description: about.meta.description,
    email: owner.email,
    address: ADDRESS,
    knowsLanguage: KNOWS_LANGUAGE,
    knowsAbout: about.specialties.items,
    mainEntityOfPage: pageUrl(locale, paths.about, origin),
  };
}

export function professionalServiceNode(
  locale: Locale,
  origin: string = env.SITE_URL,
): ProfessionalServiceLd {
  const { meta, home } = getContent(locale);
  return {
    '@type': 'ProfessionalService',
    '@id': entityIds(origin).business,
    name: meta.siteName,
    url: pageUrl(locale, paths.home, origin),
    description: home.meta.description,
    email: owner.email,
    address: ADDRESS,
    areaServed: areaServed(locale),
    knowsLanguage: KNOWS_LANGUAGE,
    founder: { '@id': entityIds(origin).person },
  };
}

const professionalServiceRef = (
  locale: Locale,
  origin: string = env.SITE_URL,
): ProfessionalServiceRefLd => ({
  '@type': 'ProfessionalService',
  '@id': entityIds(origin).business,
  name: getContent(locale).meta.siteName,
  url: pageUrl(locale, paths.home, origin),
});

export function webSiteNode(locale: Locale, origin: string = env.SITE_URL): WebSiteLd {
  const { meta, home } = getContent(locale);
  const url = pageUrl(locale, paths.home, origin);
  return {
    '@type': 'WebSite',
    '@id': `${url}#website`,
    url,
    name: meta.siteName,
    description: home.meta.description,
    inLanguage: meta.htmlLang,
    publisher: { '@id': entityIds(origin).person },
  };
}

export function serviceNode(
  locale: Locale,
  id: ServiceId,
  origin: string = env.SITE_URL,
): ServiceLd {
  const service = getService(locale, id);
  const url = pageUrl(locale, paths.services[id], origin);
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: service.name,
    serviceType: service.name,
    description: service.hero.lead,
    url,
    provider: professionalServiceRef(locale, origin),
    areaServed: areaServed(locale),
  };
}

/**
 * The Píxel y Papel product. It belongs to the four-partner organization
 * (`creator`); Pablo appears as a contributor with his role, never as the
 * sole author.
 */
export function caseStudyNode(locale: Locale, origin: string = env.SITE_URL): CreativeWorkLd {
  const { casePixelYPapel: c, home } = getContent(locale);
  const pageHref = pageUrl(locale, paths.casePixelYPapel, origin);
  return {
    '@type': 'CreativeWork',
    '@id': `${pageHref}#work`,
    name: c.hero.title,
    description: c.summary,
    abstract: c.hero.lead,
    url: c.link.href,
    mainEntityOfPage: pageHref,
    inLanguage: htmlLang(locale),
    creator: { '@type': 'Organization', name: c.hero.title, url: c.link.href },
    contributor: {
      '@type': 'Role',
      roleName: home.featuredCase.role,
      contributor: { '@type': 'Person', '@id': entityIds(origin).person, name: owner.name },
    },
    keywords: c.stack.items.join(', '),
  };
}

/** Home → page. Inner pages hang directly from the home (no index pages). */
export function breadcrumbNode(
  locale: Locale,
  id: Exclude<SitePageId, 'home'>,
  origin: string = env.SITE_URL,
): BreadcrumbListLd {
  const home = sitePage('home');
  const page = sitePage(id);
  const url = pageUrl(locale, page.pathname, origin);
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: home.name(locale),
        item: pageUrl(locale, home.pathname, origin),
      },
      { '@type': 'ListItem', position: 2, name: page.name(locale), item: url },
    ],
  };
}

/** FAQPage from the exact question/answer pairs the page shows. */
export function faqPageNode(
  locale: Locale,
  id: SitePageId,
  items: readonly FaqItem[],
  origin: string = env.SITE_URL,
): FAQPageLd {
  const page = sitePage(id);
  const url = pageUrl(locale, page.pathname, origin);
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    url,
    name: page.meta(locale).title,
    inLanguage: htmlLang(locale),
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
