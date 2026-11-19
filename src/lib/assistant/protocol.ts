import type { AssistantErrors } from '@/content/types';

/**
 * Wire format of `POST /api/assistant`: newline-delimited JSON (NDJSON), one
 * event per line. A successful answer is a series of `text` events and one
 * `done`; a failure is an `error` event, on its own with a 4xx/5xx status when
 * the request is rejected up front, or after some text if it fails mid-way.
 */

export type AssistantErrorCode = keyof AssistantErrors;

/** Why the answer ended: naturally, at the token cap, or declined. */
export type AssistantDoneReason = 'end' | 'max_tokens' | 'refusal';

export type AssistantEvent =
  | { type: 'text'; text: string }
  | { type: 'done'; reason: AssistantDoneReason }
  | { type: 'error'; code: AssistantErrorCode };

export const ASSISTANT_CONTENT_TYPE = 'application/x-ndjson; charset=utf-8';

export const encodeEvent = (event: AssistantEvent): string => `${JSON.stringify(event)}\n`;

const ERROR_CODES = new Set<string>([
  'unavailable',
  'rateLimited',
  'busy',
  'refusal',
  'invalid',
  'generic',
] satisfies AssistantErrorCode[]);
const DONE_REASONS = new Set<string>(['end', 'max_tokens', 'refusal']);

/** Parses one line; unknown or malformed lines are ignored (`null`). */
export function parseEvent(line: string): AssistantEvent | null {
  if (!line.trim()) return null;
  try {
    const value: unknown = JSON.parse(line);
    if (!value || typeof value !== 'object') return null;
    const event = value as Record<string, unknown>;
    if (event.type === 'text' && typeof event.text === 'string') {
      return { type: 'text', text: event.text };
    }
    if (
      event.type === 'done' &&
      typeof event.reason === 'string' &&
      DONE_REASONS.has(event.reason)
    ) {
      return { type: 'done', reason: event.reason as AssistantDoneReason };
    }
    if (event.type === 'error' && typeof event.code === 'string' && ERROR_CODES.has(event.code)) {
      return { type: 'error', code: event.code as AssistantErrorCode };
    }
  } catch {
    // Not JSON: ignore.
  }
  return null;
}

/** Reads the events of a response body as they arrive. */
export async function* readEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<AssistantEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const event = parseEvent(line);
        if (event) yield event;
      }
    }
    const last = parseEvent(buffer + decoder.decode());
    if (last) yield last;
  } finally {
    reader.releaseLock();
  }
}

/** Error to show when a failed response carries no readable event. */
export function errorCodeForStatus(status: number): AssistantErrorCode {
  if (status === 503) return 'unavailable';
  if (status === 429) return 'rateLimited';
  if (status === 400 || status === 413 || status === 422) return 'invalid';
  return 'generic';
}
