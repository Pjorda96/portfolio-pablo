import { getContent, LOCALES, owner, type Locale } from '@/content';
import { env } from '@/env';
import { pageUrl, SITE_PAGES, type SitePage } from '@/lib/seo';

/** Name of a language in that same language, capitalized: `español` → `Español`. */
const languageName = (locale: Locale): string => {
  const name = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
};

const linkLine = (page: SitePage, locale: Locale, origin: string): string =>
  `- [${page.name(locale)}](${pageUrl(locale, page.pathname, origin)}): ${page.meta(locale).description}`;

/**
 * llms.txt (https://llmstxt.org): H1 with the site name, a blockquote summary,
 * then one section of links per language, with the legal pages in the
 * `Optional` section that agents may skip. Built from the content tree.
 */
export function buildLlmsTxt(origin: string = env.SITE_URL): string {
  const es = getContent('es');
  const lines: string[] = [
    `# ${es.meta.siteName}`,
    '',
    `> ${es.home.meta.description}`,
    '',
    ...LOCALES.map((locale) => {
      const { meta } = getContent(locale);
      return `${meta.jobTitle}. ${meta.nav.contact}: ${owner.email}`;
    }),
    '',
  ];

  for (const locale of LOCALES) {
    lines.push(`## ${languageName(locale)}`, '');
    for (const page of SITE_PAGES) {
      if (page.group === 'main') lines.push(linkLine(page, locale, origin));
    }
    lines.push('');
  }

  lines.push('## Optional', '');
  for (const locale of LOCALES) {
    for (const page of SITE_PAGES) {
      if (page.group === 'legal') lines.push(linkLine(page, locale, origin));
    }
  }

  return `${lines.join('\n')}\n`;
}
