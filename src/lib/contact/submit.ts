import { isLocale } from '@/content';
import { DEFAULT_LOCALE, type Locale } from '@/content/types';

import { checkFormToken, isHoneypotFilled } from './anti-spam';
import { buildContactEmail } from './email';
import { HONEYPOT_FIELD, TOKEN_FIELD } from './fields';
import type { Mailer } from './mailer';
import type { RateLimiter } from './rate-limit';
import { readContactValues, validateContact, type ContactFieldErrors } from './schema';
import type { ContactFormErrorKey, ContactFormState } from './state';

export interface ContactDeps {
  isProduction: boolean;
  /** `null` when no email provider is configured (no `RESEND_API_KEY`). */
  mailer: Mailer | null;
  from: string;
  to: string;
  tokenSecret: string;
  limiter: RateLimiter;
  ip: string;
  now?: () => number;
  log?: (message: string) => void;
}

/**
 * Everything the contact form does with a submission, free of Next.js APIs so
 * it can be tested directly. Never throws: every outcome is a state the form
 * can show. Nothing is stored; the message only travels by email.
 *
 * Order: honeypot → timing token → validation → rate limit → send.
 */
export async function submitContact(
  formData: FormData,
  deps: ContactDeps,
): Promise<ContactFormState> {
  const now = deps.now?.() ?? Date.now();
  const values = readContactValues(formData);
  const fail = (
    formError: ContactFormErrorKey | undefined,
    fieldErrors: ContactFieldErrors = {},
  ): ContactFormState => ({ status: 'error', at: now, formError, fieldErrors, values });

  try {
    // Bots that fill the invisible field get a success they cannot tell apart
    // from the real thing, so they do not adapt.
    if (isHoneypotFilled(formData.get(HONEYPOT_FIELD))) return { status: 'success', at: now };

    if (checkFormToken(formData.get(TOKEN_FIELD), deps.tokenSecret, now) !== 'ok') {
      return fail('spam');
    }

    const result = validateContact(values);
    if (!result.success) return fail(undefined, result.errors);

    const { success: allowed } = await deps.limiter.limit(`contact:${deps.ip}`);
    if (!allowed) return fail('rateLimited');

    const localeValue = formData.get('locale');
    const locale: Locale =
      typeof localeValue === 'string' && isLocale(localeValue) ? localeValue : DEFAULT_LOCALE;
    const email = buildContactEmail(result.data, locale);

    if (!deps.mailer) {
      if (deps.isProduction) {
        (deps.log ?? console.error)('[contact] RESEND_API_KEY is not set: message not sent.');
        return fail('unavailable');
      }
      (deps.log ?? console.warn)(
        `[contact] RESEND_API_KEY is not set; development mode, message not sent:\n` +
          `To: ${deps.to}\nReply-To: ${result.data.email}\nSubject: ${email.subject}\n\n${email.text}`,
      );
      return { status: 'success', at: now };
    }

    const sent = await deps.mailer({
      ...email,
      from: deps.from,
      to: deps.to,
      replyTo: result.data.email,
    });
    return sent ? { status: 'success', at: now } : fail('generic');
  } catch (error) {
    console.error('[contact] Unexpected error:', error);
    return fail('generic');
  }
}
