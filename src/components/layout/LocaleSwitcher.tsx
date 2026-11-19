'use client';

import { useLocale, useTranslations } from 'next-intl';
import NextLink from 'next/link';

import { LOCALES } from '@/content/types';
import { getPathname, usePathname } from '@/i18n/navigation';
import type { AppPathname } from '@/i18n/routing';

/** The locale that is not the current one (the site has exactly two). */
export const otherLocale = (locale: string) => LOCALES.find((l) => l !== locale) ?? LOCALES[0];

/**
 * Link to the same page in the other language. `usePathname` returns the
 * internal pathname (`/sobre-mi`) and `getPathname` its public URL in that
 * language (`/en/about` ↔ `/sobre-mi`). There is no locale detection or
 * cookie (see routing.ts): the URL alone decides the language.
 *
 * Not next-intl's `Link` with `locale`: towards Spanish it renders `/es/...`
 * so a locale cookie can be set on the way, which here is only a redirect to
 * the canonical bare URL. This links to the canonical URL directly.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations('LocaleSwitcher');
  const target = otherLocale(useLocale());
  // On a 404 the pathname is not one of the known pages; it is still localized.
  const pathname = usePathname() as AppPathname;
  const href = getPathname({ locale: target, href: pathname });

  return (
    <NextLink href={href} hrefLang={target} className={className}>
      <span className="sr-only">{t('label')}:</span> <span lang={target}>{t('target')}</span>
    </NextLink>
  );
}
