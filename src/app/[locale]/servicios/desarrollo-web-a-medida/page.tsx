import type { Metadata } from 'next';

import { ServicePage } from '@/components/pages/service/ServicePage';
import { JsonLd } from '@/components/seo/JsonLd';
import { getService } from '@/content';
import { resolveLocale, type LocaleParams } from '@/i18n/locale';
import { metadataFor } from '@/lib/seo';
import { structuredDataFor } from '@/lib/structured-data';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return metadataFor(await resolveLocale(params), 'web');
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return (
    <>
      <JsonLd data={structuredDataFor(locale, 'web')} />
      <ServicePage locale={locale} service={getService(locale, 'web')} />
    </>
  );
}
