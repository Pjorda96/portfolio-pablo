import type { Metadata } from 'next';

import { AboutPage } from '@/components/pages/about/AboutPage';
import { JsonLd } from '@/components/seo/JsonLd';
import { getContent } from '@/content';
import { resolveLocale, type LocaleParams } from '@/i18n/locale';
import { metadataFor } from '@/lib/seo';
import { structuredDataFor } from '@/lib/structured-data';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return metadataFor(await resolveLocale(params), 'about');
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return (
    <>
      <JsonLd data={structuredDataFor(locale, 'about')} />
      <AboutPage locale={locale} content={getContent(locale).about} />
    </>
  );
}
