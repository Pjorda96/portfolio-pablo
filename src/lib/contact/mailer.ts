import { Resend } from 'resend';

import type { ContactEmail } from './email';

export interface OutgoingEmail extends ContactEmail {
  from: string;
  to: string;
  replyTo: string;
}

/** Sends one email; resolves to `false` on any delivery error, never throws. */
export type Mailer = (email: OutgoingEmail) => Promise<boolean>;

export function createResendMailer(apiKey: string): Mailer {
  const resend = new Resend(apiKey);
  return async ({ from, to, replyTo, subject, text, html }) => {
    try {
      const { error } = await resend.emails.send({ from, to, replyTo, subject, text, html });
      if (error) {
        console.error('[contact] Resend rejected the message:', error.name, error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('[contact] Resend request failed:', error);
      return false;
    }
  };
}
