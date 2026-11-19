import type { Metadata } from 'next';

import { LegalDocument } from '@/components/pages/legal/LegalDocument';
import { JsonLd } from '@/components/seo/JsonLd';
import { resolveLocale, type LocaleParams } from '@/i18n/locale';
import { metadataFor } from '@/lib/seo';
import { structuredDataFor } from '@/lib/structured-data';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return metadataFor(await resolveLocale(params), 'legalNotice');
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return (
    <>
      <JsonLd data={structuredDataFor(locale, 'legalNotice')} />
      <LegalDocument locale={locale} document="notice" />
    </>
  );
}
