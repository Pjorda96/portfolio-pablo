import type { Metadata } from 'next';

import { FaqPage } from '@/components/pages/faq/FaqPage';
import { getContent } from '@/content';
import { resolveLocale, type LocaleParams } from '@/i18n/locale';
import { paths } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({
    locale,
    pathname: paths.faq,
    meta: getContent(locale).faq.meta,
  });
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return <FaqPage locale={locale} content={getContent(locale).faq} />;
}
