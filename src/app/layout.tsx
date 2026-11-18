import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

import { env } from '@/env';
import { themeBootScript } from '@/lib/theme/boot-script';
import { themes } from '@/lib/theme/tokens';

import { fontVariables } from './fonts';

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: {
    default: 'Pablo Jordá — Desarrollo web, IA y producto',
    template: '%s · Pablo Jordá',
  },
  description:
    'Desarrollo web a medida, integraciones de inteligencia artificial y producto digital.',
  applicationName: 'pablojorda.es',
  // Placeholder while the site is under construction.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: themes.day.ground },
    { media: '(prefers-color-scheme: dark)', color: themes.night.ground },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // The boot script sets data-mode and --sky on <html> before first paint.
    <html lang="es" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
