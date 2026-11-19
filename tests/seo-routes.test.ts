import { describe, expect, it } from 'vitest';

import { buildLlmsTxt } from '@/app/llms.txt/llms';
import { getContent, LOCALES, owner } from '@/content';
import { localizedPath, robotsTxt, SITE_PAGES, sitemapEntries } from '@/lib/seo';

import { forbiddenIn } from './utils/forbidden';

const ORIGIN = 'https://pablojorda.es';
const url = (path: string) => new URL(path, ORIGIN).toString();

describe('sitemap', () => {
  const built = new Date('2026-11-19T00:00:00Z');
  const entries = sitemapEntries(built, ORIGIN);

  it('lists every page in every locale, once', () => {
    expect(entries).toHaveLength(SITE_PAGES.length * LOCALES.length);
    expect(new Set(entries.map((e) => e.url)).size).toBe(entries.length);
    for (const page of SITE_PAGES) {
      for (const locale of LOCALES) {
        expect(entries.map((e) => e.url)).toContain(url(localizedPath(locale, page.pathname)));
      }
    }
  });

  it('gives each entry its hreflang alternates (es-ES, en, x-default) and lastModified', () => {
    for (const page of SITE_PAGES) {
      const es = url(localizedPath('es', page.pathname));
      const en = url(localizedPath('en', page.pathname));
      const pair = entries.filter((e) => e.url === es || e.url === en);
      expect(pair).toHaveLength(2);
      for (const entry of pair) {
        expect(entry.alternates?.languages).toEqual({ 'es-ES': es, en, 'x-default': es });
        expect(entry.lastModified).toBe(built);
      }
    }
  });

  it('excludes the 404 and the API', () => {
    expect(entries.some((e) => /\/api\/|not-found|404/.test(e.url))).toBe(false);
  });
});

describe('robots.txt', () => {
  it('allows crawling (so the noindex can be read), hides the API and links the sitemap', () => {
    expect(robotsTxt(ORIGIN)).toEqual({
      rules: { userAgent: '*', allow: '/', disallow: '/api/' },
      sitemap: 'https://pablojorda.es/sitemap.xml',
    });
  });
});

describe('llms.txt', () => {
  const text = buildLlmsTxt(ORIGIN);

  it('follows the llmstxt.org structure', () => {
    const lines = text.split('\n');
    expect(lines[0]).toBe(`# ${getContent('es').meta.siteName}`);
    expect(lines[2]).toBe(`> ${getContent('es').home.meta.description}`);
    expect(text.match(/^# /gm)).toHaveLength(1);
    expect(text).toMatch(/^## Español$/m);
    expect(text).toMatch(/^## English$/m);
    expect(text).toMatch(/^## Optional$/m);
    expect(text).toContain(owner.email);
  });

  it('links every page in both locales with its description', () => {
    for (const page of SITE_PAGES) {
      for (const locale of LOCALES) {
        const href = url(localizedPath(locale, page.pathname));
        expect(text).toContain(
          `- [${page.name(locale)}](${href}): ${page.meta(locale).description}`,
        );
      }
    }
  });

  it('puts the legal pages in the Optional section only', () => {
    const optionalAt = text.indexOf('## Optional');
    for (const page of SITE_PAGES.filter((p) => p.group === 'legal')) {
      for (const locale of LOCALES) {
        expect(text.indexOf(url(localizedPath(locale, page.pathname)))).toBeGreaterThan(optionalAt);
      }
    }
  });

  it('has no forbidden words or placeholders', () => {
    expect(forbiddenIn(text)).toEqual([]);
  });
});
