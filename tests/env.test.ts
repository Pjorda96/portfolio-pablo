import { describe, expect, it } from 'vitest';

import { parseEnv } from '@/env';

describe('parseEnv', () => {
  it('falls back to the local dev server outside production', () => {
    expect(parseEnv({ NODE_ENV: 'development' }).SITE_URL).toBe('http://localhost:3000');
    expect(parseEnv({ NODE_ENV: 'test', SITE_URL: '' }).SITE_URL).toBe('http://localhost:3000');
  });

  it('requires SITE_URL in production', () => {
    expect(() => parseEnv({ NODE_ENV: 'production' })).toThrow(
      /Invalid environment variables:\n {2}- SITE_URL/,
    );
  });

  it('rejects a SITE_URL that is not a URL', () => {
    expect(() => parseEnv({ NODE_ENV: 'production', SITE_URL: 'pablojorda.es' })).toThrow(
      /SITE_URL/,
    );
  });

  it('accepts a valid production origin', () => {
    expect(parseEnv({ NODE_ENV: 'production', SITE_URL: 'https://pablojorda.es' }).SITE_URL).toBe(
      'https://pablojorda.es',
    );
  });

  it('does not validate server-only variables on the client', () => {
    expect(() => parseEnv({ NODE_ENV: 'production' }, { isServer: false })).not.toThrow();
  });
});
