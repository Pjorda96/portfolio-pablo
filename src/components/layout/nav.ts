import { SERVICE_IDS, getContent, getService, type Locale } from '@/content';
import { paths, type AppPathname } from '@/i18n/routing';

export interface NavItem {
  href: AppPathname;
  label: string;
}

export interface SiteNav {
  label: string;
  services: { label: string; items: NavItem[] };
  links: NavItem[];
  cta: NavItem;
  home: { href: AppPathname; label: string };
}

/** Main navigation of the site in a locale: plain, serializable data for header and menu. */
export function getSiteNav(locale: Locale): SiteNav {
  const { nav } = getContent(locale).meta;
  return {
    label: nav.label,
    services: {
      label: nav.services,
      items: SERVICE_IDS.map((id) => ({
        href: paths.services[id],
        label: getService(locale, id).name,
      })),
    },
    links: [
      { href: paths.casePixelYPapel, label: nav.projects },
      { href: paths.about, label: nav.about },
      { href: paths.faq, label: nav.faq },
    ],
    cta: { href: paths.contact, label: nav.cta },
    home: { href: paths.home, label: nav.home },
  };
}
