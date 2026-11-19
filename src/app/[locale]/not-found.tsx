import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

import { NotFoundView } from '@/components/pages/not-found/NotFoundView';
import { getContent } from '@/content';
import { robots } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const { notFound } = getContent(await getLocale()).meta;
  return { title: { absolute: notFound.title }, description: notFound.description, robots };
}

/**
 * `notFound()` called by a page under a locale (e.g. a missing entry once
 * pages load data). Unknown URLs never reach this file: they match no route
 * and get `app/global-not-found.tsx`, localized from the proxy's locale.
 */
export default async function LocaleNotFound() {
  return <NotFoundView locale={await getLocale()} />;
}
