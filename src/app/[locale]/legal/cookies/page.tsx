import type { Metadata } from 'next';

import { LegalDocument } from '@/components/pages/legal/LegalDocument';
import { getContent } from '@/content';
import { resolveLocale, type LocaleParams } from '@/i18n/locale';
import { paths } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({
    locale,
    pathname: paths.legal.cookies,
    meta: getContent(locale).legal.cookies.meta,
  });
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return <LegalDocument locale={locale} document="cookies" />;
}
