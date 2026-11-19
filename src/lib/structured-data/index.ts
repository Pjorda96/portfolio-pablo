import { getContent, getService, type Locale, type ServiceId } from '@/content';
import { env } from '@/env';
import type { SitePageId } from '@/lib/seo';

import {
  breadcrumbNode,
  caseStudyNode,
  faqPageNode,
  personNode,
  professionalServiceNode,
  serviceNode,
  webSiteNode,
} from './builders';
import { SCHEMA_CONTEXT, type StructuredGraph, type StructuredNode } from './types';

export * from './builders';
export * from './types';

const graph = (nodes: readonly StructuredNode[]): StructuredGraph => ({
  '@context': SCHEMA_CONTEXT,
  '@graph': nodes,
});

const servicePage = (locale: Locale, id: ServiceId, origin: string) => [
  serviceNode(locale, id, origin),
  // The service page shows its own FAQ: mark up exactly those questions.
  faqPageNode(locale, id, getService(locale, id).faq.items, origin),
  breadcrumbNode(locale, id, origin),
];

/**
 * JSON-LD of each page:
 * - home: WebSite + Person + ProfessionalService
 * - about: Person + BreadcrumbList
 * - services: Service (provider → the ProfessionalService) + FAQPage + BreadcrumbList
 * - Píxel y Papel: CreativeWork + BreadcrumbList
 * - FAQ: FAQPage + BreadcrumbList
 * - contact and legal pages: BreadcrumbList
 */
export function structuredDataFor(
  locale: Locale,
  id: SitePageId,
  origin: string = env.SITE_URL,
): StructuredGraph {
  switch (id) {
    case 'home':
      return graph([
        webSiteNode(locale, origin),
        personNode(locale, origin),
        professionalServiceNode(locale, origin),
      ]);
    case 'about':
      return graph([personNode(locale, origin), breadcrumbNode(locale, id, origin)]);
    case 'web':
    case 'ai':
    case 'apps':
      return graph(servicePage(locale, id, origin));
    case 'casePixelYPapel':
      return graph([caseStudyNode(locale, origin), breadcrumbNode(locale, id, origin)]);
    case 'faq':
      return graph([
        faqPageNode(locale, id, getContent(locale).faq.items, origin),
        breadcrumbNode(locale, id, origin),
      ]);
    case 'contact':
    case 'legalNotice':
    case 'legalPrivacy':
    case 'legalCookies':
      return graph([breadcrumbNode(locale, id, origin)]);
  }
}

/**
 * JSON for a `<script type="application/ld+json">`: `<` escaped as `<`
 * (as the Next.js JSON-LD guide recommends) so no string can close the tag.
 */
export const serializeJsonLd = (data: StructuredGraph): string =>
  JSON.stringify(data).replace(/</g, '\\u003c');
