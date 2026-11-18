import type { Metadata } from 'next';

import { ContactPage } from '@/components/pages/contact/ContactPage';
import { getContent } from '@/content';
import { resolveLocale, type LocaleParams } from '@/i18n/locale';
import { paths } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({
    locale,
    pathname: paths.contact,
    meta: getContent(locale).contact.meta,
  });
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return <ContactPage locale={locale} content={getContent(locale).contact} />;
}
