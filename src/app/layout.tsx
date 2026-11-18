import type { ReactNode } from 'react';

/**
 * Pass-through root layout. The document (`<html lang>`, fonts, theme boot
 * script) is rendered by `[locale]/layout.tsx`, which knows the language;
 * `not-found.tsx` next to this file renders its own document for every URL
 * that matches no page.
 */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
