import type { ContactErrorKey, ContactFieldErrors, ContactValues } from './schema';

/** Errors about the whole submission rather than one field. */
export type ContactFormErrorKey =
  Extract<ContactErrorKey, 'rateLimited' | 'spam' | 'generic'> | 'unavailable';

/**
 * Result of the contact Server Action, consumed by `useActionState`. Plain
 * data only: it is serialized to the client (and rendered on the server when
 * the form is posted without JavaScript).
 */
export type ContactFormState =
  | { status: 'idle' }
  | { status: 'success'; at: number }
  | {
      status: 'error';
      /** Distinguishes two identical consecutive failures (refocus the summary). */
      at: number;
      formError?: ContactFormErrorKey;
      fieldErrors: ContactFieldErrors;
      /** What the visitor typed, to refill the form after a round trip. */
      values: ContactValues;
    };

export const initialContactState: ContactFormState = { status: 'idle' };
