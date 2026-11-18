import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import type { Locale } from '@/content';

import { routing } from './routing';

/** `params` of every page and layout under `src/app/[locale]/`. */
export interface LocaleParams {
  params: Promise<{ locale: string }>;
}

/** One entry per locale, for `generateStaticParams`. */
export const localeParams = () => routing.locales.map((locale) => ({ locale }));

/**
 * Validates the `[locale]` segment and enables static rendering for it. Call
 * it first in every page, layout and `generateMetadata` under `[locale]`.
 */
export async function resolveLocale(params: LocaleParams['params']): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}
