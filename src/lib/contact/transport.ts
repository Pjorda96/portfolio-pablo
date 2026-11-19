import type { DeploymentEnv } from '@/lib/indexing';

import { createResendMailer, type Mailer } from './mailer';

/**
 * Which mailer the contact form uses. The end-to-end tests (Playwright,
 * `e2e/`) run the production build with `CONTACT_TEST_MAILER=1`, so a submitted
 * form never reaches Resend: the test mailer accepts every message, except
 * those whose text contains `TEST_MAILER_FAIL_MARKER`, which it reports as a
 * delivery failure (the form's server error path).
 *
 * The test mailer can never run on the production deployment: the variable is
 * rejected there by `parseEnv` (the build stops) and again here.
 */

/** A message containing this fails to "send" with the test mailer. */
export const TEST_MAILER_FAIL_MARKER = '[e2e:fail]';

export function createTestMailer(log: (message: string) => void = console.warn): Mailer {
  return async ({ to, replyTo, subject, text }) => {
    const ok = !text.includes(TEST_MAILER_FAIL_MARKER);
    log(
      `[contact] Test mailer (CONTACT_TEST_MAILER): message ${ok ? 'accepted' : 'rejected'}, ` +
        `nothing sent. To: ${to} · Reply-To: ${replyTo} · Subject: ${subject}`,
    );
    return ok;
  };
}

interface MailerSettings {
  resendApiKey?: string;
  /** `CONTACT_TEST_MAILER`: set only by the end-to-end tests. */
  testMailer?: boolean;
  vercelEnv?: DeploymentEnv;
}

/**
 * The test mailer when asked for (it wins over a Resend key, so a test run
 * never sends a real email), else Resend when there is a key, else none.
 */
export function selectContactMailer({
  resendApiKey,
  testMailer = false,
  vercelEnv,
}: MailerSettings): Mailer | null {
  if (testMailer) {
    if (vercelEnv === 'production') {
      throw new Error('CONTACT_TEST_MAILER cannot be enabled on the production deployment.');
    }
    return createTestMailer();
  }
  return resendApiKey ? createResendMailer(resendApiKey) : null;
}
