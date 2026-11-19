import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';

import './globals.css';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { NotFoundView } from '@/components/pages/not-found/NotFoundView';
import { getContent } from '@/content';
import { notFoundMetadata } from '@/lib/seo';
import { themeBootScript } from '@/lib/theme/boot-script';

import { fontVariables } from './fonts';

export async function generateMetadata(): Promise<Metadata> {
  // Never indexed (noindex even after launch) and without a canonical.
  return notFoundMetadata(await getLocale());
}

/**
 * 404 for every URL that matches no page: `/en/nope`, `/servicios/nada`,
 * `/missing.png`. The proxy tells next-intl the locale of the URL (`/en/...`
 * is English, anything else Spanish), so the page is localized and fully
 * server-rendered with a real 404 status. It is a global-not-found (see
 * next.config.ts) so reading the request here doesn't make every page dynamic;
 * it renders its own document because it bypasses the layouts.
 */
export default async function RootNotFound() {
  const locale = await getLocale();
  const { meta } = getContent(locale);

  return (
    <html lang={meta.htmlLang} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <NextIntlClientProvider>
          <SiteHeader locale={locale} always />
          <main id="contenido" className="flex-1">
            <NotFoundView locale={locale} />
          </main>
          <SiteFooter locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
