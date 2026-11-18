import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
