'use client';

import { useLocale, useTranslations } from 'next-intl';

import { LOCALES } from '@/content/types';
import { Link, usePathname } from '@/i18n/navigation';
import type { AppPathname } from '@/i18n/routing';

/** The locale that is not the current one (the site has exactly two). */
export const otherLocale = (locale: string) => LOCALES.find((l) => l !== locale) ?? LOCALES[0];

/**
 * Link to the same page in the other language. `usePathname` returns the
 * internal pathname (`/sobre-mi`) and `Link` with `locale` renders its public
 * URL in that language (`/en/about` ↔ `/sobre-mi`). There is no locale
 * detection or cookie (see routing.ts): the URL alone decides the language.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations('LocaleSwitcher');
  const target = otherLocale(useLocale());
  // On a 404 the pathname is not one of the known pages; Link still prefixes it.
  const pathname = usePathname() as AppPathname;

  return (
    <Link href={pathname} locale={target} hrefLang={target} className={className}>
      <span className="sr-only">{t('label')}:</span> <span lang={target}>{t('target')}</span>
    </Link>
  );
}
