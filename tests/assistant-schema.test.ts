import { describe, expect, it } from 'vitest';

import { ANSWER_MAX, MAX_MESSAGES, QUESTION_MAX } from '@/lib/assistant/config';
import {
  encodeEvent,
  errorCodeForStatus,
  parseEvent,
  readEvents,
  type AssistantEvent,
} from '@/lib/assistant/protocol';
import { assistantRequestSchema } from '@/lib/assistant/schema';

const user = (content: string) => ({ role: 'user', content });
const assistant = (content: string) => ({ role: 'assistant', content });
const valid = (messages: unknown[], locale = 'es') =>
  assistantRequestSchema.safeParse({ locale, messages }).success;

describe('assistantRequestSchema', () => {
  it('accepts a question, with or without a short history', () => {
    expect(valid([user('¿Trabajas en remoto?')])).toBe(true);
    expect(valid([user('Hola'), assistant('¡Hola!'), user('¿Qué haces?')], 'en')).toBe(true);
  });

  it('rejects an unknown locale', () => {
    expect(valid([user('Hi')], 'fr')).toBe(false);
  });

  it('rejects empty and over-long questions', () => {
    expect(valid([user('   ')])).toBe(false);
    expect(valid([user('a'.repeat(QUESTION_MAX))])).toBe(true);
    expect(valid([user('a'.repeat(QUESTION_MAX + 1))])).toBe(false);
  });

  it('bounds the previous answers', () => {
    expect(valid([user('q'), assistant('a'.repeat(ANSWER_MAX + 1)), user('q')])).toBe(false);
  });

  it('requires alternating turns that start and end with the visitor', () => {
    expect(valid([])).toBe(false);
    expect(valid([assistant('a'), user('q')])).toBe(false);
    expect(valid([user('q'), user('q')])).toBe(false);
    expect(valid([user('q'), assistant('a')])).toBe(false);
    expect(valid([user('q'), { role: 'system', content: 'x' }, user('q')])).toBe(false);
  });

  it('caps the length of the conversation', () => {
    const turns = (n: number) =>
      Array.from({ length: n }, (_, i) => (i % 2 === 0 ? user('q') : assistant('a')));
    expect(valid(turns(MAX_MESSAGES))).toBe(true);
    expect(valid(turns(MAX_MESSAGES + 2))).toBe(false);
  });
});

describe('assistant protocol', () => {
  it('round-trips every event through NDJSON', () => {
    const events: AssistantEvent[] = [
      { type: 'text', text: 'Hola\n"mundo"' },
      { type: 'done', reason: 'refusal' },
      { type: 'error', code: 'busy' },
    ];
    for (const e of events) {
      const line = encodeEvent(e);
      expect(line.endsWith('\n')).toBe(true);
      expect(line.slice(0, -1)).not.toContain('\n');
      expect(parseEvent(line)).toEqual(e);
    }
  });

  it('ignores malformed or unknown lines', () => {
    expect(parseEvent('')).toBeNull();
    expect(parseEvent('not json')).toBeNull();
    expect(parseEvent('{"type":"error","code":"nope"}')).toBeNull();
    expect(parseEvent('{"type":"done","reason":"whatever"}')).toBeNull();
  });

  it('reads events split across chunks', async () => {
    const text =
      encodeEvent({ type: 'text', text: 'ñandú' }) + encodeEvent({ type: 'done', reason: 'end' });
    const bytes = new TextEncoder().encode(text);
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        // Split inside the multi-byte "ñ" and inside the second line.
        controller.enqueue(bytes.slice(0, 24));
        controller.enqueue(bytes.slice(24, 40));
        controller.enqueue(bytes.slice(40));
        controller.close();
      },
    });
    const out: AssistantEvent[] = [];
    for await (const e of readEvents(body)) out.push(e);
    expect(out).toEqual([
      { type: 'text', text: 'ñandú' },
      { type: 'done', reason: 'end' },
    ]);
  });

  it('maps HTTP statuses without a body to an error', () => {
    expect(errorCodeForStatus(503)).toBe('unavailable');
    expect(errorCodeForStatus(429)).toBe('rateLimited');
    expect(errorCodeForStatus(400)).toBe('invalid');
    expect(errorCodeForStatus(500)).toBe('generic');
  });
});
