import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Form timing token: `<issuedAt>.<hmac>`, rendered into a hidden field when the
 * page is served and checked when the form comes back. A submission is
 * rejected when the token is missing, forged, too old (stale tab, replay) or
 * comes back sooner than a person could fill the form.
 *
 * The HMAC needs a secret shared by every server instance: `CONTACT_FORM_SECRET`,
 * else one derived from `RESEND_API_KEY`, else a fixed development value (only
 * reachable without an API key, when nothing is sent anyway).
 */

/** People need at least this long to fill the form. */
export const MIN_FILL_MS = 3_000;
/** A rendered form stays valid this long. */
export const MAX_TOKEN_AGE_MS = 24 * 60 * 60 * 1000;

const DEV_SECRET = 'pablojorda.es contact form (development only)';

export function resolveTokenSecret({
  formSecret,
  resendApiKey,
}: {
  formSecret?: string;
  resendApiKey?: string;
}): string {
  if (formSecret) return formSecret;
  if (resendApiKey) {
    return createHash('sha256').update(`contact-form-token:${resendApiKey}`).digest('hex');
  }
  return DEV_SECRET;
}

const sign = (payload: string, secret: string) =>
  createHmac('sha256', secret).update(payload).digest('base64url');

export function issueFormToken(secret: string, now = Date.now()): string {
  const issuedAt = String(now);
  return `${issuedAt}.${sign(issuedAt, secret)}`;
}

export type TokenCheck = 'ok' | 'invalid' | 'too-fast' | 'expired';

export function checkFormToken(token: unknown, secret: string, now = Date.now()): TokenCheck {
  if (typeof token !== 'string') return 'invalid';
  const [issuedAt, signature, ...rest] = token.split('.');
  if (!issuedAt || !signature || rest.length > 0 || !/^\d{1,15}$/.test(issuedAt)) {
    return 'invalid';
  }

  const expected = Buffer.from(sign(issuedAt, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return 'invalid';
  }

  const age = now - Number(issuedAt);
  if (age < MIN_FILL_MS) return 'too-fast';
  if (age > MAX_TOKEN_AGE_MS) return 'expired';
  return 'ok';
}

/** True when the honeypot field came back with anything in it. */
export const isHoneypotFilled = (value: unknown): boolean =>
  typeof value === 'string' && value.trim() !== '';
