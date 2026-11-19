import { describe, expect, it } from 'vitest';

import {
  buildCsp,
  CROSS_ORIGIN_SOURCES,
  cspDirectives,
  permissionsPolicy,
  securityHeaderRules,
  securityHeaders,
  type SecurityTarget,
} from '@/lib/security/csp';
import { z } from '@/lib/zod';

const LOCAL: SecurityTarget = { dev: false };
const DEV: SecurityTarget = { dev: true };
const PREVIEW: SecurityTarget = { dev: false, vercelEnv: 'preview' };
const PRODUCTION: SecurityTarget = { dev: false, vercelEnv: 'production' };
const ALL = [LOCAL, DEV, PREVIEW, PRODUCTION];

const header = (target: SecurityTarget, key: string) =>
  securityHeaders(target).find((h) => h.key === key)?.value;

describe('Content-Security-Policy', () => {
  it('serializes the production policy', () => {
    expect(buildCsp(PRODUCTION)).toBe(
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "style-src-elem 'self'",
        "style-src-attr 'unsafe-inline'",
        "connect-src 'self'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "worker-src 'self'",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "manifest-src 'self'",
        'upgrade-insecure-requests',
      ].join('; '),
    );
  });

  it.each(ALL)('locks down plugins, base, forms and framing (%o)', (target) => {
    const d = cspDirectives(target);
    expect(d['default-src']).toEqual(["'self'"]);
    expect(d['object-src']).toEqual(["'none'"]);
    expect(d['base-uri']).toEqual(["'self'"]);
    expect(d['form-action']).toEqual(["'self'"]);
    expect(d['frame-ancestors']).toEqual(["'none'"]);
  });

  it.each(ALL)('never mixes hashes or nonces with unsafe-inline (%o)', (target) => {
    // A hash or nonce makes browsers ignore 'unsafe-inline', which would block
    // Next's inline RSC payload on every static page.
    const scripts = cspDirectives(target)['script-src'] ?? [];
    expect(scripts).toContain("'unsafe-inline'");
    expect(scripts.some((s) => /^'(sha\d+|nonce)-/.test(s))).toBe(false);
    expect(scripts).not.toContain("'strict-dynamic'");
  });

  it("allows 'unsafe-eval' only in development", () => {
    expect(cspDirectives(DEV)['script-src']).toContain("'unsafe-eval'");
    for (const target of [LOCAL, PREVIEW, PRODUCTION]) {
      expect(buildCsp(target)).not.toContain('unsafe-eval');
    }
  });

  it('allows inline <style> elements only in development and on previews', () => {
    expect(cspDirectives(PRODUCTION)['style-src-elem']).toEqual(["'self'"]);
    expect(cspDirectives(LOCAL)['style-src-elem']).toEqual(["'self'"]);
    expect(cspDirectives(DEV)['style-src-elem']).toContain("'unsafe-inline'");
    expect(cspDirectives(PREVIEW)['style-src-elem']).toContain("'unsafe-inline'");
  });

  it('upgrades insecure requests only on HTTPS deployments', () => {
    expect(buildCsp(PRODUCTION)).toContain('upgrade-insecure-requests');
    expect(buildCsp(PREVIEW)).toContain('upgrade-insecure-requests');
    expect(buildCsp(LOCAL)).not.toContain('upgrade-insecure-requests');
    expect(buildCsp(DEV)).not.toContain('upgrade-insecure-requests');
  });

  it('allows the Vercel Toolbar on previews only', () => {
    const preview = cspDirectives(PREVIEW);
    expect(preview['script-src']).toContain('https://vercel.live');
    expect(preview['connect-src']).toContain('wss://ws-us3.pusher.com');
    expect(preview['frame-src']).toEqual(['https://vercel.live']);
    for (const target of [LOCAL, DEV, PRODUCTION]) {
      expect(buildCsp(target)).not.toContain('vercel');
      expect(cspDirectives(target)['frame-src']).toEqual(["'none'"]);
    }
  });

  it('keeps every source same-origin outside previews', () => {
    for (const target of [LOCAL, DEV, PRODUCTION]) {
      expect(buildCsp(target)).not.toMatch(/https?:|wss?:/);
    }
  });
});

describe('security headers', () => {
  it.each(ALL)('sends the baseline headers everywhere (%o)', (target) => {
    expect(header(target, 'Content-Security-Policy')).toBe(buildCsp(target));
    expect(header(target, 'Cross-Origin-Opener-Policy')).toBe('same-origin');
    expect(header(target, 'Cross-Origin-Resource-Policy')).toBe('same-origin');
    expect(header(target, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(header(target, 'X-Content-Type-Options')).toBe('nosniff');
    expect(header(target, 'X-Frame-Options')).toBe('DENY');
    expect(header(target, 'Permissions-Policy')).toBe(permissionsPolicy());
  });

  it('denies powerful features in the Permissions-Policy', () => {
    for (const feature of ['camera', 'microphone', 'geolocation', 'payment', 'usb']) {
      expect(permissionsPolicy()).toContain(`${feature}=()`);
    }
  });

  it('sends HSTS (two years, subdomains, preload) in production only', () => {
    expect(header(PRODUCTION, 'Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains; preload',
    );
    for (const target of [LOCAL, DEV, PREVIEW]) {
      expect(header(target, 'Strict-Transport-Security')).toBeUndefined();
    }
  });

  it('lets other origins load the social images and icons', () => {
    const rules = securityHeaderRules(PRODUCTION);
    expect(rules[0]?.source).toBe('/:path*');
    // Later rules override the same key, so the exceptions come after.
    const exceptions = rules.slice(1);
    expect(exceptions.map((r) => r.source)).toEqual([...CROSS_ORIGIN_SOURCES]);
    for (const rule of exceptions) {
      expect(rule.headers).toEqual([
        { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
      ]);
    }
  });
});

describe('zod under the CSP', () => {
  it('runs jitless, so it never probes `new Function` (no unsafe-eval)', () => {
    expect(z.config().jitless).toBe(true);
    expect(z.object({ a: z.string() }).parse({ a: 'ok' })).toEqual({ a: 'ok' });
  });
});
