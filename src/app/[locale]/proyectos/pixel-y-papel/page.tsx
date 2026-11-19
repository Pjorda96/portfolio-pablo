import type { Metadata } from 'next';

import { CasePixelYPapelPage } from '@/components/pages/case-pixel-y-papel/CasePixelYPapelPage';
import { getContent } from '@/content';
import { resolveLocale, type LocaleParams } from '@/i18n/locale';
import { paths } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({
    locale,
    pathname: paths.casePixelYPapel,
    meta: getContent(locale).casePixelYPapel.meta,
    ogType: 'article',
  });
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return <CasePixelYPapelPage locale={locale} content={getContent(locale).casePixelYPapel} />;
}
