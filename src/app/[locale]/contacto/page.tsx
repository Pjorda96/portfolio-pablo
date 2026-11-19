import type { Metadata } from 'next';
import { connection } from 'next/server';

import { ContactPage } from '@/components/pages/contact/ContactPage';
import { JsonLd } from '@/components/seo/JsonLd';
import { getContent } from '@/content';
import { resolveLocale, type LocaleParams } from '@/i18n/locale';
import { issueFormToken } from '@/lib/contact/anti-spam';
import { contactConfig } from '@/lib/contact/config';
import { getContactFormUi } from '@/lib/contact/copy';
import { metadataFor } from '@/lib/seo';
import { structuredDataFor } from '@/lib/structured-data';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return metadataFor(await resolveLocale(params), 'contact');
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  // Rendered per request: the form carries a fresh signed timestamp, which the
  // Server Action uses to reject submissions faster than a person can type.
  await connection();
  return (
    <>
      <JsonLd data={structuredDataFor(locale, 'contact')} />
      <ContactPage
        locale={locale}
        content={getContent(locale).contact}
        ui={getContactFormUi(locale)}
        formToken={issueFormToken(contactConfig.tokenSecret)}
      />
    </>
  );
}
