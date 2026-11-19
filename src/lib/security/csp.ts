/**
 * Content Security Policy and security headers, served from `next.config.ts`
 * `headers()`. Pure and free of `@/` imports so the config can load it.
 *
 * The CSP is static (no nonce): a nonce would force every page into dynamic
 * rendering, and the site is prerendered on purpose. The price is
 * `'unsafe-inline'` in `script-src`: Next streams the RSC payload of every
 * page as inline `self.__next_f.push(...)` scripts whose content changes per
 * page and per build, so they cannot be listed by hash in a header computed
 * before the pages are rendered, and a hash in `script-src` would make the
 * browser ignore `'unsafe-inline'` and block them. See docs/SECURITY.md.
 */

/** Where the response is served; decides the dev and Vercel extras. */
export type SecurityTarget = {
  /** `next dev`: React needs `eval` for its debugging aids. */
  dev: boolean;
  /** `VERCEL_ENV`; undefined for local builds (`next start`). */
  vercelEnv?: 'production' | 'preview' | 'development' | undefined;
};

type Directives = Record<string, readonly string[]>;

/** Vercel Toolbar (comments, feedback) injected on preview deployments. */
const VERCEL_LIVE = 'https://vercel.live';
const VERCEL_TOOLBAR: Directives = {
  'script-src': [VERCEL_LIVE],
  'style-src': [VERCEL_LIVE],
  // The toolbar injects its own <style> elements.
  'style-src-elem': ["'unsafe-inline'", VERCEL_LIVE],
  'connect-src': [VERCEL_LIVE, 'wss://ws-us3.pusher.com'],
  'img-src': [VERCEL_LIVE, 'https://vercel.com'],
  'font-src': [VERCEL_LIVE, 'https://assets.vercel.com'],
  'frame-src': [VERCEL_LIVE],
};

/** Served over HTTPS: a Vercel deployment, never `next dev` or `next start`. */
const isDeployed = ({ dev, vercelEnv }: SecurityTarget) =>
  !dev && (vercelEnv === 'production' || vercelEnv === 'preview');

export function cspDirectives(target: SecurityTarget): Directives {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    // 'unsafe-inline': Next's inline RSC payload and the theme boot script
    // (see the module comment). 'unsafe-eval' only in development.
    'script-src': ["'self'", "'unsafe-inline'", ...(target.dev ? ["'unsafe-eval'"] : [])],
    // Styles: stylesheets only from the site (`style-src-elem`), while React's
    // server-rendered `style="..."` attributes stay allowed (`style-src-attr`).
    // `style-src` is the fallback for browsers without the split directives.
    // Development keeps inline <style> for the Next dev overlay and HMR.
    'style-src': ["'self'", "'unsafe-inline'"],
    'style-src-elem': ["'self'", ...(target.dev ? ["'unsafe-inline'"] : [])],
    'style-src-attr': ["'unsafe-inline'"],
    // Same origin covers the assistant's fetch, the contact Server Action and
    // Vercel Analytics/Speed Insights (scripts and beacons under /_vercel).
    'connect-src': ["'self'"],
    // data: for next/image blur placeholders, blob: for canvas/WebGL textures.
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    // three.js runs on the main thread; no blob: or third-party workers.
    'worker-src': ["'self'"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'manifest-src': ["'self'"],
  };

  if (!target.dev && target.vercelEnv === 'preview') {
    for (const [name, sources] of Object.entries(VERCEL_TOOLBAR)) {
      const current = directives[name] ?? [];
      directives[name] = [...current.filter((s) => s !== "'none'"), ...sources];
    }
  }

  // Valueless directive; only where the site is served over HTTPS (a local
  // `next start` over http would have its own assets upgraded and broken).
  if (isDeployed(target)) directives['upgrade-insecure-requests'] = [];

  return directives;
}

export function serializeCsp(directives: Directives): string {
  return Object.entries(directives)
    .map(([name, sources]) => [name, ...sources].join(' '))
    .join('; ');
}

export const buildCsp = (target: SecurityTarget): string => serializeCsp(cspDirectives(target));

/** Features the site never uses, denied to the page and every frame. */
export const DENIED_FEATURES = [
  'accelerometer',
  'autoplay',
  'bluetooth',
  'browsing-topics',
  'camera',
  'display-capture',
  'geolocation',
  'gyroscope',
  'hid',
  'idle-detection',
  'magnetometer',
  'microphone',
  'midi',
  'payment',
  'publickey-credentials-get',
  'serial',
  'usb',
  'xr-spatial-tracking',
] as const;

export const permissionsPolicy = (): string =>
  DENIED_FEATURES.map((feature) => `${feature}=()`).join(', ');

export type Header = { key: string; value: string };

/** Headers for every route. */
export function securityHeaders(target: SecurityTarget): Header[] {
  const headers: Header[] = [
    { key: 'Content-Security-Policy', value: buildCsp(target) },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
    { key: 'Permissions-Policy', value: permissionsPolicy() },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
  ];
  // Production only: a preload-listed HSTS is hard to undo, and previews live
  // on *.vercel.app, which is already HSTS-preloaded.
  if (!target.dev && target.vercelEnv === 'production') {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    });
  }
  return headers;
}

/**
 * Files other sites may load in the browser: social images, icons and the
 * manifest. Social networks fetch og:image server-side (CORP does not apply),
 * but previews rendered in a browser (chat apps, embeds) load them
 * cross-origin, which `same-origin` would block.
 */
export const CROSS_ORIGIN_SOURCES = [
  '/:path*/:image(opengraph-image|twitter-image)',
  '/icon.svg',
  '/apple-icon',
  '/manifest.webmanifest',
] as const;

/** `next.config.ts` `headers()` entries; later entries override earlier ones. */
export function securityHeaderRules(target: SecurityTarget) {
  return [
    { source: '/:path*', headers: securityHeaders(target) },
    ...CROSS_ORIGIN_SOURCES.map((source) => ({
      source,
      headers: [{ key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' }],
    })),
  ];
}
