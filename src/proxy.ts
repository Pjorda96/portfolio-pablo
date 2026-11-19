import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

/**
 * Locale routing: serves Spanish at the root and English under `/en`,
 * rewrites translated slugs to their internal (Spanish) folders and redirects
 * non-canonical URLs (`/es/...`, `/en/servicios/...`) to the canonical one.
 */
export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals, Vercel internals, files
  // with an extension (icons, images, manifest, robots...), the generated
  // apple-icon (no extension either) and the generated social images:
  // `og:image` points at their internal `/es/...` / `/en/...` paths, which
  // must be served as is, never redirected to the root.
  matcher: '/((?!api|_next|_vercel|.*\\..*|apple-icon|.*/opengraph-image|.*/twitter-image).*)',
};
