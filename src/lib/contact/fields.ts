/**
 * Names of the anti-spam form fields, shared by the form and the server.
 * Kept apart from `anti-spam.ts`, which uses `node:crypto` and must not reach
 * the client bundle.
 */

/**
 * Honeypot: a text field people never see (visually hidden, `aria-hidden`,
 * out of the tab order, autocomplete off) and bots tend to fill. A plausible
 * name makes naive bots more likely to fill it.
 */
export const HONEYPOT_FIELD = 'website';

/** Signed timestamp of when the form was rendered. */
export const TOKEN_FIELD = 'formToken';
