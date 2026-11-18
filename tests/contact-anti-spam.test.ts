import { describe, expect, it } from 'vitest';

import {
  checkFormToken,
  isHoneypotFilled,
  issueFormToken,
  MAX_TOKEN_AGE_MS,
  MIN_FILL_MS,
  resolveTokenSecret,
} from '@/lib/contact/anti-spam';
import { clientIp, createMemoryRateLimiter } from '@/lib/contact/rate-limit';

const SECRET = 'a-test-secret-of-some-length';
const T0 = 1_800_000_000_000;

describe('form timing token', () => {
  it('accepts a token returned after the minimum fill time', () => {
    const token = issueFormToken(SECRET, T0);
    expect(checkFormToken(token, SECRET, T0 + MIN_FILL_MS)).toBe('ok');
    expect(checkFormToken(token, SECRET, T0 + 60_000)).toBe('ok');
  });

  it('rejects a form submitted faster than a person can fill it', () => {
    const token = issueFormToken(SECRET, T0);
    expect(checkFormToken(token, SECRET, T0 + 500)).toBe('too-fast');
    expect(checkFormToken(token, SECRET, T0 + MIN_FILL_MS - 1)).toBe('too-fast');
  });

  it('rejects stale tokens', () => {
    const token = issueFormToken(SECRET, T0);
    expect(checkFormToken(token, SECRET, T0 + MAX_TOKEN_AGE_MS + 1)).toBe('expired');
  });

  it('rejects missing, malformed and forged tokens', () => {
    const token = issueFormToken(SECRET, T0);
    const later = T0 + 10_000;
    expect(checkFormToken(null, SECRET, later)).toBe('invalid');
    expect(checkFormToken('', SECRET, later)).toBe('invalid');
    expect(checkFormToken('abc', SECRET, later)).toBe('invalid');
    expect(checkFormToken(`${token}.extra`, SECRET, later)).toBe('invalid');
    expect(checkFormToken(token, 'another-secret-entirely', later)).toBe('invalid');
    // Backdating the timestamp breaks the signature.
    const [, signature] = token.split('.');
    expect(checkFormToken(`${T0 - 60_000}.${signature}`, SECRET, later)).toBe('invalid');
  });

  it('derives a stable secret from the configuration', () => {
    expect(resolveTokenSecret({ formSecret: 'explicit-secret-value' })).toBe(
      'explicit-secret-value',
    );
    const derived = resolveTokenSecret({ resendApiKey: 're_123' });
    expect(derived).toBe(resolveTokenSecret({ resendApiKey: 're_123' }));
    expect(derived).not.toContain('re_123');
    expect(resolveTokenSecret({})).toMatch(/development/);
  });
});

describe('honeypot', () => {
  it('is only tripped by a non-empty value', () => {
    expect(isHoneypotFilled(null)).toBe(false);
    expect(isHoneypotFilled('')).toBe(false);
    expect(isHoneypotFilled('   ')).toBe(false);
    expect(isHoneypotFilled('https://spam.example')).toBe(true);
  });
});

describe('in-memory sliding window rate limiter', () => {
  it('allows `max` requests per window and key', async () => {
    let now = T0;
    const limiter = createMemoryRateLimiter({ max: 5, windowMs: 600_000, now: () => now });

    for (let i = 0; i < 5; i++) {
      expect((await limiter.limit('1.1.1.1')).success).toBe(true);
      now += 1_000;
    }
    const blocked = await limiter.limit('1.1.1.1');
    expect(blocked).toMatchObject({ success: false, remaining: 0, resetAt: T0 + 600_000 });

    // Other keys are independent.
    expect((await limiter.limit('2.2.2.2')).success).toBe(true);
  });

  it('slides: requests leave the window one by one', async () => {
    let now = T0;
    const limiter = createMemoryRateLimiter({ max: 2, windowMs: 10_000, now: () => now });
    await limiter.limit('ip');
    now += 5_000;
    await limiter.limit('ip');
    expect((await limiter.limit('ip')).success).toBe(false);

    now = T0 + 10_000; // the first request has left the window
    expect((await limiter.limit('ip')).success).toBe(true);
    expect((await limiter.limit('ip')).success).toBe(false);
  });

  it('bounds the number of tracked keys', async () => {
    const limiter = createMemoryRateLimiter({
      max: 1,
      windowMs: 60_000,
      maxKeys: 2,
      now: () => T0,
    });
    await limiter.limit('a');
    await limiter.limit('b');
    await limiter.limit('c'); // evicts `a`
    expect((await limiter.limit('a')).success).toBe(true);
    expect((await limiter.limit('c')).success).toBe(false);
  });
});

describe('clientIp', () => {
  it('prefers the first x-forwarded-for address, then x-real-ip', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe(
      '203.0.113.7',
    );
    expect(clientIp(new Headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2');
    expect(clientIp(new Headers())).toBe('unknown');
  });
});
