import * as z from '@/lib/zod';

import { SERVICE_IDS, type ContactContent } from '@/content/types';

/**
 * Contact form schema, shared by the client (instant inline errors) and the
 * Server Action (the only check that counts). Issue messages are keys of
 * `contact.form.errors`, so each side translates them with the copy of the
 * page's locale and the schema stays locale-free.
 */

export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 5000;
export const NAME_MAX = 120;
export const COMPANY_MAX = 160;
export const EMAIL_MAX = 254;

export const PROJECT_TYPES = [...SERVICE_IDS, 'other'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

/** Field names, in the order they appear in the form (and the error summary). */
export const CONTACT_FIELDS = [
  'name',
  'email',
  'company',
  'service',
  'message',
  'privacy',
] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export type ContactErrorKey = keyof ContactContent['form']['errors'];

/** Form values as text, as they travel in `FormData` and back to the form. */
export type ContactValues = Record<Exclude<ContactField, 'privacy'>, string> & {
  privacy: boolean;
};

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

/** `FormData` → plain values. Unknown or repeated fields are ignored. */
export function readContactValues(formData: FormData): ContactValues {
  return {
    name: text(formData.get('name')),
    email: text(formData.get('email')),
    company: text(formData.get('company')),
    service: text(formData.get('service')),
    message: text(formData.get('message')),
    // A checked checkbox submits `on`; an unchecked one submits nothing.
    privacy: formData.get('privacy') !== null,
  };
}

const message = (key: ContactErrorKey) => ({ error: key });

export const contactSchema = z.object({
  name: z
    .string()
    .check(
      z.trim(),
      z.minLength(1, message('nameRequired')),
      z.maxLength(NAME_MAX, message('nameRequired')),
    ),
  email: z.pipe(
    z
      .string()
      .check(
        z.trim(),
        z.minLength(1, message('emailRequired')),
        z.maxLength(EMAIL_MAX, message('emailInvalid')),
      ),
    z.email(message('emailInvalid')),
  ),
  company: z.string().check(z.trim(), z.maxLength(COMPANY_MAX, message('generic'))),
  service: z.enum(PROJECT_TYPES, message('serviceRequired')),
  message: z
    .string()
    .check(
      z.trim(),
      z.minLength(MESSAGE_MIN, message('messageTooShort')),
      z.maxLength(MESSAGE_MAX, message('messageTooLong')),
    ),
  privacy: z.literal(true, message('privacyRequired')),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactFieldErrors = Partial<Record<ContactField, ContactErrorKey>>;

export type ContactValidation =
  { success: true; data: ContactInput } | { success: false; errors: ContactFieldErrors };

/** Validates the values and keeps the first error of each field. */
export function validateContact(values: ContactValues): ContactValidation {
  const parsed = contactSchema.safeParse(values);
  if (parsed.success) return { success: true, data: parsed.data };

  const errors: ContactFieldErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as ContactField;
    errors[field] ??= issue.message as ContactErrorKey;
  }
  return { success: false, errors };
}
