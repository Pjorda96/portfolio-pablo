import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { JsonLd } from '@/components/seo/JsonLd';
import { getContent, getService, LOCALES, owner, SERVICE_IDS, type Locale } from '@/content';
import { localizedPath, SITE_PAGES, type SitePageId } from '@/lib/seo';
import {
  entityIds,
  serializeJsonLd,
  structuredDataFor,
  type BreadcrumbListLd,
  type CreativeWorkLd,
  type FAQPageLd,
  type ServiceLd,
  type StructuredGraph,
  type StructuredNode,
  type StructuredType,
} from '@/lib/structured-data';

import { forbiddenIn } from './utils/forbidden';

const ORIGIN = 'https://pablojorda.es';

const EXPECTED: Record<SitePageId, StructuredType[]> = {
  home: ['WebSite', 'Person', 'ProfessionalService'],
  web: ['Service', 'FAQPage', 'BreadcrumbList'],
  ai: ['Service', 'FAQPage', 'BreadcrumbList'],
  apps: ['Service', 'FAQPage', 'BreadcrumbList'],
  casePixelYPapel: ['CreativeWork', 'BreadcrumbList'],
  about: ['Person', 'BreadcrumbList'],
  faq: ['FAQPage', 'BreadcrumbList'],
  contact: ['BreadcrumbList'],
  legalNotice: ['BreadcrumbList'],
  legalPrivacy: ['BreadcrumbList'],
  legalCookies: ['BreadcrumbList'],
};

const nodeOf = <T extends StructuredNode>(g: StructuredGraph, type: T['@type']): T => {
  const node = g['@graph'].find((n) => n['@type'] === type);
  if (!node) throw new Error(`No ${type} node`);
  return node as T;
};

/** Every string value in a JSON tree. */
const strings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
};

const cases = SITE_PAGES.flatMap((page) =>
  LOCALES.map((locale) => [`${page.id} (${locale})`, page.id, locale] as const),
);

describe.each(cases)('JSON-LD of %s', (_, id: SitePageId, locale: Locale) => {
  const data = structuredDataFor(locale, id, ORIGIN);
  const json = serializeJsonLd(data);

  it('emits the expected schema.org types in one @graph', () => {
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@graph'].map((n) => n['@type'])).toEqual(EXPECTED[id]);
  });

  it('is valid JSON that round-trips', () => {
    expect(JSON.parse(json)).toEqual(JSON.parse(JSON.stringify(data)));
    expect(json).not.toContain('<');
  });

  it('uses absolute URLs on SITE_URL and no forbidden words or placeholders', () => {
    const urls = strings(data['@graph']).filter((s) => /^https?:/.test(s));
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      // The only external URL is the Píxel y Papel product itself.
      if (url.startsWith(ORIGIN)) continue;
      expect(url).toBe(getContent(locale).casePixelYPapel.link.href);
    }
    expect(forbiddenIn(json)).toEqual([]);
    expect(json).not.toMatch(/streetAddress|offers|priceRange/);
  });

  if (id !== 'home') {
    it('has a breadcrumb Home → page with absolute, localized URLs', () => {
      const crumbs = nodeOf<BreadcrumbListLd>(data, 'BreadcrumbList').itemListElement;
      const page = SITE_PAGES.find((p) => p.id === id)!;
      expect(crumbs.map((c) => c.position)).toEqual([1, 2]);
      expect(crumbs[0]).toMatchObject({
        name: getContent(locale).meta.siteName,
        item: new URL(localizedPath(locale, '/'), ORIGIN).toString(),
      });
      expect(crumbs[1]).toMatchObject({
        name: page.name(locale),
        item: new URL(localizedPath(locale, page.pathname), ORIGIN).toString(),
      });
    });
  }
});

describe.each(LOCALES)('JSON-LD content (%s)', (locale) => {
  it('home: WebSite, Person and ProfessionalService linked by @id', () => {
    const g = structuredDataFor(locale, 'home', ORIGIN);
    const ids = entityIds(ORIGIN);
    const [site, person, business] = g['@graph'] as [
      Extract<StructuredNode, { '@type': 'WebSite' }>,
      Extract<StructuredNode, { '@type': 'Person' }>,
      Extract<StructuredNode, { '@type': 'ProfessionalService' }>,
    ];
    expect(site.publisher).toEqual({ '@id': ids.person });
    expect(site.inLanguage).toBe(getContent(locale).meta.htmlLang);
    expect(person).toMatchObject({
      '@id': ids.person,
      name: owner.name,
      email: owner.email,
      jobTitle: getContent(locale).meta.jobTitle,
      knowsLanguage: ['es', 'en'],
      address: { addressLocality: 'Valencia', addressCountry: 'ES' },
    });
    expect(business).toMatchObject({ '@id': ids.business, founder: { '@id': ids.person } });
    expect(business.areaServed.map((a) => a['@type'])).toEqual(['Country', 'City']);
  });

  it.each(SERVICE_IDS)('service %s: provider is the ProfessionalService, no prices', (id) => {
    const service = nodeOf<ServiceLd>(structuredDataFor(locale, id, ORIGIN), 'Service');
    expect(service.name).toBe(getService(locale, id).name);
    expect(service.provider['@id']).toBe(entityIds(ORIGIN).business);
    expect(service).not.toHaveProperty('offers');
  });

  it.each(SERVICE_IDS)('service %s: FAQPage equals the FAQ shown on the page', (id) => {
    const faq = nodeOf<FAQPageLd>(structuredDataFor(locale, id, ORIGIN), 'FAQPage');
    expect(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(
      getService(locale, id).faq.items.map((i) => [i.question, i.answer]),
    );
  });

  it('FAQ page: FAQPage equals the visible FAQ, in order', () => {
    const faq = nodeOf<FAQPageLd>(structuredDataFor(locale, 'faq', ORIGIN), 'FAQPage');
    expect(faq.inLanguage).toBe(getContent(locale).meta.htmlLang);
    expect(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(
      getContent(locale).faq.items.map((i) => [i.question, i.answer]),
    );
  });

  it('Píxel y Papel: the organization is the creator, Pablo a contributor with his role', () => {
    const work = nodeOf<CreativeWorkLd>(
      structuredDataFor(locale, 'casePixelYPapel', ORIGIN),
      'CreativeWork',
    );
    const content = getContent(locale);
    expect(work.creator).toEqual({
      '@type': 'Organization',
      name: 'Píxel y Papel',
      url: content.casePixelYPapel.link.href,
    });
    expect(work.contributor).toMatchObject({
      '@type': 'Role',
      roleName: content.home.featuredCase.role,
      contributor: { '@id': entityIds(ORIGIN).person },
    });
    expect(work).not.toHaveProperty('author');
    expect(work.inLanguage).toBe(content.meta.htmlLang);
  });
});

describe('<JsonLd />', () => {
  it('renders a parseable application/ld+json script', () => {
    const data = structuredDataFor('es', 'faq', ORIGIN);
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script?.textContent ?? '')).toEqual(JSON.parse(JSON.stringify(data)));
  });

  it('escapes < so no string can close the script tag', () => {
    const data = structuredDataFor('es', 'contact', ORIGIN);
    const hostile = {
      ...data,
      '@graph': [{ ...data['@graph'][0], name: '</script><script>alert(1)</script>' }],
    } as unknown as StructuredGraph;
    const json = serializeJsonLd(hostile);
    expect(json).not.toContain('</script>');
    expect(JSON.parse(json)['@graph'][0].name).toBe('</script><script>alert(1)</script>');
  });
});
