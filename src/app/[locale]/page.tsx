import type { Metadata } from 'next';

import { HomePage } from '@/components/pages/home/HomePage';
import { JsonLd } from '@/components/seo/JsonLd';
import { resolveLocale, type LocaleParams } from '@/i18n/locale';
import { metadataFor } from '@/lib/seo';
import { structuredDataFor } from '@/lib/structured-data';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return metadataFor(await resolveLocale(params), 'home');
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return (
    <>
      <JsonLd data={structuredDataFor(locale, 'home')} />
      <HomePage locale={locale} />
    </>
  );
}
