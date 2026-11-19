import type { Metadata } from 'next';
import { connection } from 'next/server';

import { ContactPage } from '@/components/pages/contact/ContactPage';
import { getContent } from '@/content';
import { resolveLocale, type LocaleParams } from '@/i18n/locale';
import { paths } from '@/i18n/routing';
import { issueFormToken } from '@/lib/contact/anti-spam';
import { contactConfig } from '@/lib/contact/config';
import { getContactFormUi } from '@/lib/contact/copy';
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
  // Rendered per request: the form carries a fresh signed timestamp, which the
  // Server Action uses to reject submissions faster than a person can type.
  await connection();
  return (
    <ContactPage
      locale={locale}
      content={getContent(locale).contact}
      ui={getContactFormUi(locale)}
      formToken={issueFormToken(contactConfig.tokenSecret)}
    />
  );
}
