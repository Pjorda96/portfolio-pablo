import { env } from '@/env';

/**
 * Whether the assistant can answer: true when `ANTHROPIC_API_KEY` is set.
 * Read on the server (the home is prerendered at build time); without the key
 * the UI shows its "temporarily unavailable" state instead of the form.
 */
export const isAssistantConfigured = (): boolean => Boolean(env.ANTHROPIC_API_KEY);
