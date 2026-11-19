import { vi } from 'vitest';

import type { AssistantClient } from '@/lib/assistant/handler';
import { readEvents, type AssistantEvent } from '@/lib/assistant/protocol';

/** A `content_block_delta` text event, as the SDK stream yields it. */
export const textDelta = (text: string) => ({
  type: 'content_block_delta',
  index: 0,
  delta: { type: 'text_delta', text },
});

interface FakeStreamOptions {
  texts?: string[];
  stopReason?: string;
  /** Thrown after the texts, as the SDK does when the request fails. */
  error?: unknown;
}

/** Stand-in for the SDK's `BetaMessageStream`: iterable, `finalMessage()`, `abort()`. */
export function fakeStream({ texts = [], stopReason = 'end_turn', error }: FakeStreamOptions) {
  return {
    async *[Symbol.asyncIterator]() {
      yield { type: 'message_start' };
      for (const t of texts) yield textDelta(t);
      if (error) throw error;
      yield { type: 'message_delta', delta: { stop_reason: stopReason } };
    },
    finalMessage: async () => ({ stop_reason: stopReason, content: [] }),
    abort: vi.fn(),
  };
}

export function fakeClient(options: FakeStreamOptions = {}) {
  const stream = vi.fn(() => fakeStream(options));
  const client = { beta: { messages: { stream } } } as unknown as AssistantClient;
  return { client, stream };
}

/** Every event of a response body. */
export async function collect(response: Response): Promise<AssistantEvent[]> {
  const events: AssistantEvent[] = [];
  if (!response.body) return events;
  for await (const event of readEvents(response.body)) events.push(event);
  return events;
}

export const postJson = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
