import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';

import '../globals.css';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { getContent } from '@/content';
import { env } from '@/env';
import { localeParams, resolveLocale, type LocaleParams } from '@/i18n/locale';
import { robots, TITLE_TEMPLATE } from '@/lib/seo';
import { themeBootScript } from '@/lib/theme/boot-script';
import { themes } from '@/lib/theme/tokens';

import { fontVariables } from '../fonts';

/** Both locales are generated at build time; any other first segment is a 404. */
export const generateStaticParams = localeParams;
export const dynamicParams = false;

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { meta, home } = getContent(locale);
  return {
    metadataBase: new URL(env.SITE_URL),
    title: { default: home.meta.title, template: TITLE_TEMPLATE },
    description: home.meta.description,
    applicationName: meta.siteName,
    robots,
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: themes.day.ground },
    { media: '(prefers-color-scheme: dark)', color: themes.night.ground },
  ],
};

/** Target of the skip link. */
const MAIN_ID = 'contenido';

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: ReactNode }) {
  const locale = await resolveLocale(params);
  const { meta } = getContent(locale);

  return (
    // The boot script sets data-theme, data-mode and --sky on <html> before first paint.
    // data-scroll-behavior: Next turns the CSS smooth scroll off while it scrolls to the
    // top of a new page, so only in-page anchors glide.
    <html
      lang={meta.htmlLang}
      className={fontVariables}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <NextIntlClientProvider>
          <a
            href={`#${MAIN_ID}`}
            className="sr-only z-50 glass px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          >
            {meta.skipLink}
          </a>
          <SiteHeader locale={locale} />
          <main id={MAIN_ID} tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
