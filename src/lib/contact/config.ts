import { owner } from '@/content/owner';
import { env } from '@/env';

import { resolveTokenSecret } from './anti-spam';
import type { Mailer } from './mailer';
import { CONTACT_RATE_LIMIT, createMemoryRateLimiter, type RateLimiter } from './rate-limit';
import { selectContactMailer } from './transport';

/** Resend's shared test sender, usable until pablojorda.es is verified there. */
export const DEFAULT_FROM_EMAIL = 'Web pablojorda.es <onboarding@resend.dev>';

export const contactConfig = {
  isProduction: process.env.NODE_ENV === 'production',
  from: env.CONTACT_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
  to: env.CONTACT_TO_EMAIL ?? owner.email,
  tokenSecret: resolveTokenSecret({
    formSecret: env.CONTACT_FORM_SECRET,
    resendApiKey: env.RESEND_API_KEY,
  }),
};

export const contactMailer: Mailer | null = selectContactMailer({
  resendApiKey: env.RESEND_API_KEY,
  testMailer: env.CONTACT_TEST_MAILER,
  vercelEnv: env.VERCEL_ENV,
});

/**
 * Module-level, so it lives as long as the server instance. Swap for a
 * durable `RateLimiter` (e.g. Upstash) to share the limit across instances.
 */
export const contactLimiter: RateLimiter = createMemoryRateLimiter(CONTACT_RATE_LIMIT);
