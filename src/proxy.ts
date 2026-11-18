import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

/**
 * Locale routing: serves Spanish at the root and English under `/en`,
 * rewrites translated slugs to their internal (Spanish) folders and redirects
 * non-canonical URLs (`/es/...`, `/en/servicios/...`) to the canonical one.
 */
export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals, Vercel internals and files
  // with an extension (icons, images, manifest, robots...).
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
