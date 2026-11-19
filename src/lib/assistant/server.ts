import Anthropic from '@anthropic-ai/sdk';

import { env } from '@/env';
import { createMemoryRateLimiter } from '@/lib/contact/rate-limit';

import {
  ASSISTANT_DAILY_LIMIT,
  ASSISTANT_GLOBAL_LIMIT,
  ASSISTANT_RATE_LIMIT,
  DEFAULT_ASSISTANT_MODEL,
} from './config';
import type { AssistantDeps, AssistantLimit } from './handler';

/**
 * Server wiring of the assistant: the Anthropic client (only when the key is
 * set; it never reaches the browser) and the rate limiters. Module-level, so
 * they live as long as the server instance; the in-memory limits are per
 * instance and best effort (see src/lib/contact/rate-limit.ts).
 */
const client = env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 30_000 })
  : null;

const limits: readonly AssistantLimit[] = [
  { name: 'burst', limiter: createMemoryRateLimiter(ASSISTANT_RATE_LIMIT), perIp: true },
  { name: 'daily', limiter: createMemoryRateLimiter(ASSISTANT_DAILY_LIMIT), perIp: true },
  { name: 'global', limiter: createMemoryRateLimiter(ASSISTANT_GLOBAL_LIMIT), perIp: false },
];

export const assistantDeps = (ip: string): AssistantDeps => ({
  client,
  model: env.ASSISTANT_MODEL ?? DEFAULT_ASSISTANT_MODEL,
  limits,
  ip,
});
