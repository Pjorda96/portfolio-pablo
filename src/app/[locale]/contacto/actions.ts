'use server';

import { headers } from 'next/headers';

import { contactConfig, contactLimiter, contactMailer } from '@/lib/contact/config';
import { clientIp } from '@/lib/contact/rate-limit';
import type { ContactFormState } from '@/lib/contact/state';
import { submitContact } from '@/lib/contact/submit';

/**
 * Contact form Server Action. Works as a plain `<form action>` post without
 * JavaScript and as the action of `useActionState` with it.
 */
export async function sendContactMessage(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const ip = clientIp(await headers());
  return submitContact(formData, {
    ...contactConfig,
    mailer: contactMailer,
    limiter: contactLimiter,
    ip,
  });
}
