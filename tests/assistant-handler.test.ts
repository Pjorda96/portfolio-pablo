import {
  APIConnectionError,
  AuthenticationError,
  BadRequestError,
  OverloadedError,
  RateLimitError,
} from '@anthropic-ai/sdk';
import { describe, expect, it, vi } from 'vitest';

import {
  ASSISTANT_MAX_TOKENS,
  DEFAULT_ASSISTANT_MODEL,
  FALLBACK_BETA,
} from '@/lib/assistant/config';
import { errorCodeFor, handleAssistantRequest, type AssistantDeps } from '@/lib/assistant/handler';
import { ASSISTANT_CONTENT_TYPE } from '@/lib/assistant/protocol';
import { buildSystemPrompt } from '@/lib/assistant/system-prompt';
import { createMemoryRateLimiter } from '@/lib/contact/rate-limit';

import { collect, fakeClient, postJson } from './utils/assistant';

const question = { locale: 'es', messages: [{ role: 'user', content: '¿Trabajas en remoto?' }] };

const deps = (overrides: Partial<AssistantDeps> = {}): AssistantDeps => ({
  client: fakeClient({ texts: ['Sí, ', 'en remoto.'] }).client,
  model: DEFAULT_ASSISTANT_MODEL,
  limits: [],
  ip: '203.0.113.7',
  log: vi.fn(),
  ...overrides,
});

const firstParams = (stream: ReturnType<typeof fakeClient>['stream']) =>
  (stream.mock.calls[0] as unknown as [Record<string, unknown>])[0];

describe('handleAssistantRequest', () => {
  it('streams the answer as NDJSON text events and a final done', async () => {
    const res = await handleAssistantRequest(postJson(question), deps());
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe(ASSISTANT_CONTENT_TYPE);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await collect(res)).toEqual([
      { type: 'text', text: 'Sí, ' },
      { type: 'text', text: 'en remoto.' },
      { type: 'done', reason: 'end' },
    ]);
  });

  it('sends the cached system prompt, the history and the cost caps to the API', async () => {
    const { client, stream } = fakeClient({ texts: ['ok'] });
    const body = {
      locale: 'en',
      messages: [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello!' },
        { role: 'user', content: 'Do you work remotely?' },
      ],
    };
    await collect(await handleAssistantRequest(postJson(body), deps({ client })));
    expect(stream).toHaveBeenCalledOnce();
    const params = firstParams(stream);
    expect(params).toMatchObject({
      model: 'claude-opus-5-5',
      max_tokens: ASSISTANT_MAX_TOKENS,
      output_config: { effort: 'low' },
      system: [
        { type: 'text', text: buildSystemPrompt('en'), cache_control: { type: 'ephemeral' } },
      ],
      messages: body.messages,
      betas: [FALLBACK_BETA],
      fallbacks: 'default',
    });
    expect(params).not.toHaveProperty('thinking');
    expect(params).not.toHaveProperty('temperature');
  });

  it('does not ask for a fallback on models without one (Haiku)', async () => {
    const { client, stream } = fakeClient({ texts: ['ok'] });
    await collect(
      await handleAssistantRequest(postJson(question), deps({ client, model: 'claude-haiku-5-5' })),
    );
    const params = firstParams(stream);
    expect(params.model).toBe('claude-haiku-5-5');
    expect(params).not.toHaveProperty('fallbacks');
    expect(params).not.toHaveProperty('betas');
  });

  it('answers 503 "unavailable" without an API key, before reading the body', async () => {
    const res = await handleAssistantRequest(postJson('not even json'), deps({ client: null }));
    expect(res.status).toBe(503);
    expect(await collect(res)).toEqual([{ type: 'error', code: 'unavailable' }]);
  });

  it('reports a refusal as such (the UI shows a polite message)', async () => {
    const { client } = fakeClient({ texts: [], stopReason: 'refusal' });
    const res = await handleAssistantRequest(postJson(question), deps({ client }));
    expect(await collect(res)).toEqual([{ type: 'done', reason: 'refusal' }]);
  });

  it('flags an answer cut at the token cap', async () => {
    const { client } = fakeClient({ texts: ['Largo…'], stopReason: 'max_tokens' });
    const events = await collect(
      await handleAssistantRequest(postJson(question), deps({ client })),
    );
    expect(events.at(-1)).toEqual({ type: 'done', reason: 'max_tokens' });
  });

  it.each([
    ['not json', 400],
    [{ locale: 'es', messages: [] }, 400],
    [{ locale: 'xx', messages: question.messages }, 400],
    [{ locale: 'es', messages: [{ role: 'user', content: 'a'.repeat(501) }] }, 400],
    [{ locale: 'es', messages: [{ role: 'user', content: 'a'.repeat(40_000) }] }, 413],
  ])('rejects invalid input %#', async (body, status) => {
    const { client, stream } = fakeClient();
    const res = await handleAssistantRequest(postJson(body), deps({ client }));
    expect(res.status).toBe(status);
    expect(await collect(res)).toEqual([{ type: 'error', code: 'invalid' }]);
    expect(stream).not.toHaveBeenCalled();
  });

  it('rejects requests sent from other sites', async () => {
    const res = await handleAssistantRequest(
      postJson(question, { 'sec-fetch-site': 'cross-site' }),
      deps(),
    );
    expect(res.status).toBe(403);
  });

  it('rate limits per IP and answers 429 with Retry-After', async () => {
    const now = () => 1_000_000;
    const limits = [
      {
        name: 'burst',
        limiter: createMemoryRateLimiter({ max: 2, windowMs: 60_000, now }),
        perIp: true,
      },
    ];
    const { client, stream } = fakeClient({ texts: ['ok'] });
    const ask = (ip: string) =>
      handleAssistantRequest(postJson(question), deps({ client, limits, ip, now }));

    expect((await ask('198.51.100.1')).status).toBe(200);
    expect((await ask('198.51.100.1')).status).toBe(200);
    const limited = await ask('198.51.100.1');
    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBe('60');
    expect(await collect(limited)).toEqual([{ type: 'error', code: 'rateLimited' }]);
    // Another visitor is not affected.
    expect((await ask('198.51.100.2')).status).toBe(200);
    expect(stream).toHaveBeenCalledTimes(3);
  });

  it('applies a global limit shared by every visitor', async () => {
    const limits = [
      {
        name: 'global',
        limiter: createMemoryRateLimiter({ max: 1, windowMs: 60_000 }),
        perIp: false,
      },
    ];
    const ask = (ip: string) => handleAssistantRequest(postJson(question), deps({ limits, ip }));
    expect((await ask('a')).status).toBe(200);
    expect((await ask('b')).status).toBe(429);
  });

  it('turns an API failure into an error event and logs no message content', async () => {
    const log = vi.fn();
    const error = new RateLimitError(429, undefined, 'rate limited', new Headers());
    const { client } = fakeClient({ texts: ['Parcial'], error });
    const events = await collect(
      await handleAssistantRequest(postJson(question), deps({ client, log })),
    );
    expect(events).toEqual([
      { type: 'text', text: 'Parcial' },
      { type: 'error', code: 'busy' },
    ]);
    expect(log).toHaveBeenCalledOnce();
    expect(String(log.mock.calls[0]?.[0])).toContain('RateLimitError (429)');
    expect(String(log.mock.calls[0]?.[0])).not.toContain('remoto');
  });
});

describe('errorCodeFor', () => {
  it('maps the SDK error classes to what the visitor is told', () => {
    const headers = new Headers();
    expect(errorCodeFor(new RateLimitError(429, undefined, 'x', headers))).toBe('busy');
    expect(errorCodeFor(new OverloadedError(529, undefined, 'x', headers))).toBe('busy');
    expect(errorCodeFor(new AuthenticationError(401, undefined, 'x', headers))).toBe('unavailable');
    expect(errorCodeFor(new BadRequestError(400, undefined, 'x', headers))).toBe('generic');
    expect(errorCodeFor(new APIConnectionError({ message: 'x' }))).toBe('generic');
    expect(errorCodeFor(new Error('x'))).toBe('generic');
  });
});
