import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Validates the environment as soon as Next loads its config, so `next dev`
// and `next build` stop with a readable list of invalid variables.
import { env } from './src/env';
import { INDEXABLE, isIndexable } from './src/lib/indexing';
import { securityHeaderRules } from './src/lib/security/csp';

const nextConfig: NextConfig = {
  // The React Compiler memoizes components and hooks on its own. It is a
  // top-level flag since Next 16 and needs `babel-plugin-react-compiler` as a
  // devDependency: a missing plugin is a build failure, not a silent no-op.
  reactCompiler: true,
  poweredByHeader: false,
  images: {
    // AVIF first (smaller), WebP fallback; the sources are WebP.
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Unmatched URLs get app/global-not-found.tsx, outside the normal render
    // tree. A root not-found.tsx would read the request (for its locale) inside
    // every route's tree and force all pages into dynamic rendering.
    globalNotFound: true,
  },
  async headers() {
    // Static CSP and security headers on every route (src/lib/security/csp.ts,
    // docs/SECURITY.md). No nonce, so every page stays prerendered.
    const rules = securityHeaderRules({
      dev: process.env.NODE_ENV === 'development',
      vercelEnv: env.VERCEL_ENV,
    });
    // Belt and braces on top of the robots meta of every page: nothing served
    // by a preview, a local build or production before launch (INDEXABLE off)
    // may be indexed, including files without HTML (llms.txt, images...).
    if (isIndexable(INDEXABLE, env.VERCEL_ENV)) return rules;
    return [...rules, { source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] }];
  },
};

// Points next-intl at the per-request config (locale + messages).
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
