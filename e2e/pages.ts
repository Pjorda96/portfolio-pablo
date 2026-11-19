import { meta as en } from '../src/content/en/meta';
import { meta as es } from '../src/content/es/meta';

/**
 * Every public page in both languages, from the routes of the content trees
 * (the same source the i18n routing and `SITE_PAGES` use). The navigation
 * spec also checks this list against the sitemap.
 */
export interface PagePair {
  id: string;
  es: string;
  en: string;
}

type Routes = typeof es.routes | typeof en.routes;

const flatten = (routes: Routes, prefix = ''): [string, string][] =>
  Object.entries(routes).flatMap(([key, value]) =>
    typeof value === 'string'
      ? [[`${prefix}${key}`, value] as [string, string]]
      : flatten(value as Routes, `${prefix}${key}.`),
  );

const enRoutes = new Map(flatten(en.routes));

export const PAGES: PagePair[] = flatten(es.routes).map(([id, esPath]) => {
  const enPath = enRoutes.get(id);
  if (!enPath) throw new Error(`No English route for ${id}`);
  return { id, es: esPath, en: enPath };
});

export const ALL_PATHS: string[] = PAGES.flatMap((page) => [page.es, page.en]);

export const pageById = (id: string): PagePair => {
  const page = PAGES.find((p) => p.id === id);
  if (!page) throw new Error(`Unknown page: ${id}`);
  return page;
};

export const nav = { es: es.nav, en: en.nav };
export const footer = { es: es.footer, en: en.footer };
export const languageSwitch = { es: es.languageSwitch, en: en.languageSwitch };
export const menu = { es: es.menu, en: en.menu };
export const htmlLang = { es: es.htmlLang, en: en.htmlLang };
