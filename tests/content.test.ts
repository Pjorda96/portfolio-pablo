import { describe, expect, it } from 'vitest';

import {
  FAQ_IDS,
  getContent,
  getFaqItems,
  LOCALES,
  SERVICE_IDS,
  type PageMeta,
  type SiteContent,
} from '@/content';
import { getCityCopy } from '@/content/site';

const es = getContent('es');
const en = getContent('en');

/** Shape of a value: object keys, array lengths and leaf types, recursively. */
const shape = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, shape((value as Record<string, unknown>)[key])]),
    );
  }
  return typeof value;
};

/** Every string in the tree, with its path. */
const strings = (value: unknown, path = ''): [string, string][] => {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  }
  return [];
};

/** Every `meta` block ({ title, description }) in the tree, with its path. */
const metas = (value: unknown, path = ''): [string, PageMeta][] => {
  if (Array.isArray(value)) return value.flatMap((v, i) => metas(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => {
      const here = path ? `${path}.${k}` : k;
      const isMeta =
        (k === 'meta' || k === 'notFound') &&
        typeof (v as PageMeta).title === 'string' &&
        typeof (v as PageMeta).description === 'string';
      return [...(isMeta ? [[here, v as PageMeta] as [string, PageMeta]] : []), ...metas(v, here)];
    });
  }
  return [];
};

const FORBIDDEN = [
  'media jornada',
  'tiempo parcial',
  'part-time',
  'part time',
  '€',
  'precio',
  'price',
  'tarifa',
  'Cognizant',
  'Allfunds',
  'everis',
  'NTT',
  'revolucionari',
  'sinergia',
  'synergy',
  '{{EMAIL_CONTACTO}}',
];

describe.each(LOCALES)('content (%s)', (locale) => {
  const content: SiteContent = getContent(locale);
  const all = strings(content);

  it('has a title of at most 60 characters on every page', () => {
    const found = metas(content);
    expect(found.length).toBeGreaterThanOrEqual(10);
    for (const [path, meta] of found) {
      expect(meta.title.length, `${path}.title: "${meta.title}"`).toBeLessThanOrEqual(60);
      expect(meta.title.length, path).toBeGreaterThan(10);
    }
  });

  it('has a meta description of at most 155 characters on every page', () => {
    for (const [path, meta] of metas(content)) {
      expect(meta.description.length, `${path}.description`).toBeLessThanOrEqual(155);
      expect(meta.description.length, path).toBeGreaterThanOrEqual(70);
    }
  });

  it('uses unique titles and descriptions', () => {
    const found = metas(content).map(([, m]) => m);
    expect(new Set(found.map((m) => m.title)).size).toBe(found.length);
    expect(new Set(found.map((m) => m.description)).size).toBe(found.length);
  });

  it.each(FORBIDDEN)('never mentions "%s"', (word) => {
    const hits = all.filter(([, s]) => s.toLowerCase().includes(word.toLowerCase()));
    expect(hits).toEqual([]);
  });

  it('has no empty copy except optional help texts and empty lists', () => {
    const empty = all.filter(([path, s]) => s.trim() === '' && !path.endsWith('.help'));
    expect(empty).toEqual([]);
  });

  it('lists the three services in order and the 4-step home process', () => {
    expect(content.services.items.map((s) => s.id)).toEqual([...SERVICE_IDS]);
    expect(content.home.process.steps).toHaveLength(4);
    for (const s of content.services.items) {
      expect(s.href).toBe(content.meta.routes.services[s.id]);
      expect(s.process.steps).toHaveLength(4);
      expect(s.faq.items.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('has 6 to 10 FAQ items with unique ids, and a resolvable home teaser', () => {
    const ids = content.faq.items.map((f) => f.id);
    expect(ids.length).toBeGreaterThanOrEqual(6);
    expect(ids.length).toBeLessThanOrEqual(10);
    expect(ids).toEqual([...FAQ_IDS]);
    expect(getFaqItems(locale, content.home.faqTeaser.ids)).toHaveLength(
      content.home.faqTeaser.ids.length,
    );
  });

  it('points every call to action at the contact page', () => {
    const ctas = strings(content).filter(([path]) => /cta\.href$/.test(path));
    expect(ctas.length).toBeGreaterThanOrEqual(8);
    for (const [path, href] of ctas) expect(href, path).toBe(content.meta.routes.contact);
  });

  it('only leaves the NIF and address as placeholders', () => {
    const placeholders = new Set(all.flatMap(([, s]) => s.match(/\{\{[A-Z_]+\}\}/g) ?? []));
    expect([...placeholders].sort()).toEqual(['{{DOMICILIO}}', '{{NIF}}']);
  });
});

describe('ES and EN', () => {
  it('have exactly the same structure', () => {
    expect(shape(en)).toEqual(shape(es));
  });

  it('share the same ids', () => {
    expect(en.services.items.map((s) => s.id)).toEqual(es.services.items.map((s) => s.id));
    expect(en.faq.items.map((f) => f.id)).toEqual(es.faq.items.map((f) => f.id));
    expect(en.home.faqTeaser.ids).toEqual(es.home.faqTeaser.ids);
  });

  it('use routes under /en only in English', () => {
    for (const [path, route] of strings(es.meta.routes)) expect(route, path).not.toMatch(/^\/en/);
    for (const [path, route] of strings(en.meta.routes)) expect(route, path).toMatch(/^\/en/);
  });

  it('keep the approved positioning', () => {
    expect(es.meta.jobTitle).toBe('Desarrollador full-stack potenciado por IA');
    expect(en.meta.jobTitle).toBe('AI-powered full-stack developer');
    expect(es.services.items.map((s) => s.name)).toEqual([
      'Desarrollo web a medida',
      'Soluciones con IA',
      'Apps, SaaS y MVPs',
    ]);
    expect(en.services.items.map((s) => s.name)).toEqual([
      'Custom web development',
      'AI solutions',
      'Apps, SaaS & MVPs',
    ]);
    expect(es.services.items[1]?.summary.text).toMatch(
      /^Tú me cuentas el problema; yo lo resuelvo/,
    );
  });
});

describe('Píxel y Papel case study', () => {
  it('presents Pablo as co-founder of a project shared with partners', () => {
    const text = (c: SiteContent) =>
      strings(c.casePixelYPapel)
        .map(([, s]) => s)
        .join(' ')
        .toLowerCase();

    expect(text(es)).toContain('socios');
    expect(text(es)).toContain('cofundador');
    expect(text(en)).toContain('partners');
    expect(text(en)).toContain('co-founder');
    expect(es.home.featuredCase.text).toMatch(/cuatro socios/);
    expect(en.home.featuredCase.text).toMatch(/four partners/);
  });

  it('never claims sole ownership', () => {
    const all = [...strings(es), ...strings(en)].map(([, s]) => s.toLowerCase());
    for (const s of all) {
      expect(s).not.toMatch(
        /mi (proyecto|empresa|producto) píxel|my (project|company|product) píxel/,
      );
    }
  });
});

describe.each(LOCALES)('home city copy (site.ts, %s)', (locale) => {
  const content = getContent(locale);
  const { places } = getCityCopy(locale);

  it('takes its place copy from the content of the same locale', () => {
    expect(places).toHaveLength(6);
    expect(places.find((p) => p.id === 'lab')?.text).toBe(content.services.items[1]?.summary.text);
  });

  it('gives every place a unique fragment id', () => {
    expect(new Set(places.map((p) => p.slug)).size).toBe(places.length);
  });
});
