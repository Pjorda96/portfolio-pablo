import { defineRouting } from 'next-intl/routing';

import { meta as en } from '@/content/en/meta';
import { meta as es } from '@/content/es/meta';
import { DEFAULT_LOCALE, LOCALES } from '@/content/types';

/**
 * Locale routing of the site, derived from the routes in the content trees
 * (`src/content/{es,en}/meta.ts`), so a slug lives in exactly one place.
 *
 * - Spanish is served at the root, English under `/en` (`as-needed`).
 * - The *internal* pathname of every page is its Spanish URL: it is the folder
 *   under `src/app/[locale]/` and the `href` typed `Link`s take. The proxy
 *   rewrites `/en/services/ai-solutions` to `/en/servicios/soluciones-ia`.
 */

/** English public URL without the `/en` prefix, which next-intl adds itself. */
const unprefixed = (route: string): string => route.replace(/^\/en(?=\/|$)/, '') || '/';

const localized = <Es extends string>(esRoute: Es, enRoute: string) => ({
  es: esRoute,
  en: unprefixed(enRoute),
});

const { routes: r } = es;
const { routes: e } = en;

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  // A session cookie (`NEXT_LOCALE`), set only when the visitor switches
  // language; documented in the cookie policy.
  pathnames: {
    '/': '/',
    [r.services.web]: localized(r.services.web, e.services.web),
    [r.services.ai]: localized(r.services.ai, e.services.ai),
    [r.services.apps]: localized(r.services.apps, e.services.apps),
    [r.casePixelYPapel]: localized(r.casePixelYPapel, e.casePixelYPapel),
    [r.about]: localized(r.about, e.about),
    [r.faq]: localized(r.faq, e.faq),
    [r.contact]: localized(r.contact, e.contact),
    [r.legal.notice]: localized(r.legal.notice, e.legal.notice),
    [r.legal.privacy]: localized(r.legal.privacy, e.legal.privacy),
    [r.legal.cookies]: localized(r.legal.cookies, e.legal.cookies),
  },
});

export type AppPathname = keyof typeof routing.pathnames;

/**
 * Internal pathnames by page, typed as literals: `paths.about` is
 * `'/sobre-mi'`. Use them as `href` of `Link` from `@/i18n/navigation` and as
 * `pathname` of `pageMetadata()`.
 */
export const paths = {
  home: '/',
  services: r.services,
  casePixelYPapel: r.casePixelYPapel,
  about: r.about,
  faq: r.faq,
  contact: r.contact,
  legal: r.legal,
} as const satisfies Record<string, AppPathname | Record<string, AppPathname>>;
