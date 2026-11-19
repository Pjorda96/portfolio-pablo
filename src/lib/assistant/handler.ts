import {
  APIConnectionError,
  APIError,
  APIUserAbortError,
  AuthenticationError,
  OverloadedError,
  PaymentRequiredError,
  PermissionDeniedError,
  RateLimitError,
  ServiceUnavailableError,
} from '@anthropic-ai/sdk';
import type Anthropic from '@anthropic-ai/sdk';

import type { RateLimiter } from '@/lib/contact/rate-limit';

import { ASSISTANT_MAX_TOKENS, BODY_MAX_BYTES, FALLBACK_BETA, FALLBACK_MODELS } from './config';
import {
  ASSISTANT_CONTENT_TYPE,
  encodeEvent,
  type AssistantDoneReason,
  type AssistantErrorCode,
  type AssistantEvent,
} from './protocol';
import { assistantRequestSchema } from './schema';
import { buildSystemPrompt } from './system-prompt';

/** The slice of the Anthropic client the assistant uses (easy to fake in tests). */
export interface AssistantClient {
  beta: { messages: Pick<Anthropic['beta']['messages'], 'stream'> };
}

export interface AssistantLimit {
  name: string;
  limiter: RateLimiter;
  /** Counted per client IP, or once for every visitor together. */
  perIp: boolean;
}

export interface AssistantDeps {
  /** `null` when `ANTHROPIC_API_KEY` is not configured. */
  client: AssistantClient | null;
  model: string;
  /** Checked in order; each counts the request under its own key. */
  limits: readonly AssistantLimit[];
  ip: string;
  now?: () => number;
  /** Receives operational errors; never message content. */
  log?: (message: string) => void;
}

const encoder = new TextEncoder();

const HEADERS = {
  'Content-Type': ASSISTANT_CONTENT_TYPE,
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

/** A rejected request: one `error` event with a matching status. */
const reject = (status: number, code: AssistantErrorCode, extra: Record<string, string> = {}) =>
  new Response(encodeEvent({ type: 'error', code }), {
    status,
    headers: { ...HEADERS, ...extra },
  });

/** Maps an SDK error to what the visitor is told. Most specific first. */
export function errorCodeFor(error: unknown): AssistantErrorCode {
  if (
    error instanceof RateLimitError ||
    error instanceof OverloadedError ||
    error instanceof ServiceUnavailableError
  ) {
    return 'busy';
  }
  if (
    error instanceof AuthenticationError ||
    error instanceof PermissionDeniedError ||
    error instanceof PaymentRequiredError
  ) {
    return 'unavailable';
  }
  return 'generic';
}

/** Error class and status only: SDK messages may echo parts of the request. */
const describeError = (error: unknown) => {
  if (error instanceof APIConnectionError) return error.constructor.name;
  if (error instanceof APIError) return `${error.constructor.name} (${error.status ?? '-'})`;
  return error instanceof Error ? error.name : 'unknown error';
};

const doneReason = (stopReason: string | null): AssistantDoneReason =>
  stopReason === 'refusal' ? 'refusal' : stopReason === 'max_tokens' ? 'max_tokens' : 'end';

/**
 * `POST /api/assistant`, free of Next.js APIs so it can be tested directly.
 *
 * Order: availability → origin → body size → validation → rate limits →
 * stream. Nothing is stored and message content is never logged.
 */
export async function handleAssistantRequest(
  request: Request,
  deps: AssistantDeps,
): Promise<Response> {
  const log = deps.log ?? console.error;
  const now = deps.now ?? Date.now;

  if (!deps.client) return reject(503, 'unavailable');

  // Browsers mark requests sent from other sites; the API serves this one only.
  if (request.headers.get('sec-fetch-site') === 'cross-site') return reject(403, 'invalid');

  if (Number(request.headers.get('content-length') ?? 0) > BODY_MAX_BYTES) {
    return reject(413, 'invalid');
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > BODY_MAX_BYTES) return reject(413, 'invalid');
    body = JSON.parse(text);
  } catch {
    return reject(400, 'invalid');
  }

  const parsed = assistantRequestSchema.safeParse(body);
  if (!parsed.success) return reject(400, 'invalid');
  const { locale, messages } = parsed.data;

  for (const { name, limiter, perIp } of deps.limits) {
    const result = await limiter.limit(
      perIp ? `assistant:${name}:${deps.ip}` : `assistant:${name}`,
    );
    if (!result.success) {
      const retryAfter = Math.max(1, Math.ceil((result.resetAt - now()) / 1000));
      return reject(429, 'rateLimited', { 'Retry-After': String(retryAfter) });
    }
  }

  const stream = deps.client.beta.messages.stream(
    {
      model: deps.model,
      max_tokens: ASSISTANT_MAX_TOKENS,
      // Stable per locale: the cached prefix of every request.
      system: [
        { type: 'text', text: buildSystemPrompt(locale), cache_control: { type: 'ephemeral' } },
      ],
      messages,
      output_config: { effort: 'low' },
      // Server-side refusal fallback, on the models that support it.
      ...(FALLBACK_MODELS.includes(deps.model)
        ? { betas: [FALLBACK_BETA], fallbacks: 'default' as const }
        : {}),
    },
    { signal: request.signal },
  );

  let open = true;
  const answer = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AssistantEvent) => {
        if (open) controller.enqueue(encoder.encode(encodeEvent(event)));
      };
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            send({ type: 'text', text: event.delta.text });
          }
        }
        const final = await stream.finalMessage();
        send({ type: 'done', reason: doneReason(final.stop_reason) });
      } catch (error) {
        // An abort means the visitor left or pressed stop: nobody to tell.
        if (!(error instanceof APIUserAbortError) && open) {
          log(`[assistant] ${describeError(error)}`);
          send({ type: 'error', code: errorCodeFor(error) });
        }
      } finally {
        if (open) {
          open = false;
          controller.close();
        }
      }
    },
    cancel() {
      open = false;
      stream.abort();
    },
  });

  return new Response(answer, { status: 200, headers: HEADERS });
}
