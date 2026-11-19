/**
 * Limits and defaults of the AI assistant, shared by the API route and the
 * chat UI. They bound the cost of every request (question length, history
 * length, output tokens) and of every visitor (rate limits).
 */

/** Model used when `ASSISTANT_MODEL` is not set. */
export const DEFAULT_ASSISTANT_MODEL = 'claude-opus-5-5';

/**
 * Models that take the server-side refusal fallback (`fallbacks: "default"`).
 * Haiku has none, so the parameter is not sent there.
 */
export const FALLBACK_MODELS: readonly string[] = ['claude-opus-5-5'];
export const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

/** Output cap per answer (thinking included): a short Q&A, not an essay. */
export const ASSISTANT_MAX_TOKENS = 800;

/** Characters per question. */
export const QUESTION_MAX = 500;
/** Characters per previous answer sent back as history. */
export const ANSWER_MAX = 4000;
/** Questions per conversation; the UI offers a new conversation after that. */
export const MAX_QUESTIONS = 5;
/** History plus the new question: user/assistant pairs and a final user turn. */
export const MAX_MESSAGES = MAX_QUESTIONS * 2 - 1;
/** Request body size, a generous bound over the limits above. */
export const BODY_MAX_BYTES = 32 * 1024;

const MINUTE = 60 * 1000;

/** Per IP: a burst limit and a daily cap. */
export const ASSISTANT_RATE_LIMIT = { max: 10, windowMs: 10 * MINUTE } as const;
export const ASSISTANT_DAILY_LIMIT = { max: 40, windowMs: 24 * 60 * MINUTE } as const;
/** Every visitor together, per server instance: a ceiling on the hourly spend. */
export const ASSISTANT_GLOBAL_LIMIT = { max: 300, windowMs: 60 * MINUTE } as const;

/** Endpoint of the route handler (`src/app/api/assistant/route.ts`). */
export const ASSISTANT_ENDPOINT = '/api/assistant';
