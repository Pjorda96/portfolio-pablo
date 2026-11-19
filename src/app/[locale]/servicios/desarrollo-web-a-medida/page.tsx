import type { Metadata } from 'next';

import { ServicePage } from '@/components/pages/service/ServicePage';
import { getService } from '@/content';
import { resolveLocale, type LocaleParams } from '@/i18n/locale';
import { paths } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({
    locale,
    pathname: paths.services.web,
    meta: getService(locale, 'web').meta,
  });
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return <ServicePage locale={locale} service={getService(locale, 'web')} />;
}
