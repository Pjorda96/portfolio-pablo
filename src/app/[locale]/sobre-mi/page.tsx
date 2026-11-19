import type { Metadata } from 'next';

import { AboutPage } from '@/components/pages/about/AboutPage';
import { getContent } from '@/content';
import { resolveLocale, type LocaleParams } from '@/i18n/locale';
import { paths } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({
    locale,
    pathname: paths.about,
    meta: getContent(locale).about.meta,
  });
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return <AboutPage locale={locale} content={getContent(locale).about} />;
}
