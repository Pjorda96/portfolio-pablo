// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { collect, fakeStream, postJson } from './utils/assistant';

const mocks = vi.hoisted(() => ({
  env: {} as Record<string, string | undefined>,
  stream: vi.fn(),
  clientOptions: vi.fn(),
}));

vi.mock('@/env', () => ({ env: mocks.env }));

// The real SDK module (error classes included) with a fake client.
vi.mock('@anthropic-ai/sdk', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  class FakeAnthropic {
    beta = { messages: { stream: mocks.stream } };
    constructor(options: unknown) {
      mocks.clientOptions(options);
    }
  }
  return { ...actual, default: FakeAnthropic, Anthropic: FakeAnthropic };
});

const question = { locale: 'en', messages: [{ role: 'user', content: 'Do you work remotely?' }] };

/** Imports the route afresh, so it reads the current mocked env. */
const loadRoute = async () => {
  vi.resetModules();
  return import('@/app/api/assistant/route');
};

describe('POST /api/assistant', () => {
  beforeEach(() => {
    for (const key of Object.keys(mocks.env)) delete mocks.env[key];
    mocks.stream.mockReset();
    mocks.clientOptions.mockReset();
  });
  afterEach(() => vi.restoreAllMocks());

  it('runs on Node.js', async () => {
    const route = await loadRoute();
    expect(route.runtime).toBe('nodejs');
  });

  it('degrades to 503 "unavailable" when ANTHROPIC_API_KEY is not set', async () => {
    const { POST } = await loadRoute();
    const res = await POST(postJson(question));
    expect(res.status).toBe(503);
    expect(await collect(res)).toEqual([{ type: 'error', code: 'unavailable' }]);
    expect(mocks.clientOptions).not.toHaveBeenCalled();
    expect(mocks.stream).not.toHaveBeenCalled();
  });

  it('streams the answer with the key set, on the configured model', async () => {
    mocks.env.ANTHROPIC_API_KEY = 'sk-ant-test';
    mocks.env.ASSISTANT_MODEL = 'claude-haiku-5-5';
    mocks.stream.mockImplementation(() => fakeStream({ texts: ['Yes, ', 'remotely.'] }));
    const { POST } = await loadRoute();

    const res = await POST(postJson(question, { 'x-forwarded-for': '192.0.2.1' }));
    expect(res.status).toBe(200);
    expect(await collect(res)).toEqual([
      { type: 'text', text: 'Yes, ' },
      { type: 'text', text: 'remotely.' },
      { type: 'done', reason: 'end' },
    ]);
    expect(mocks.clientOptions).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'sk-ant-test' }),
    );
    expect(mocks.stream.mock.calls[0]?.[0]).toMatchObject({ model: 'claude-haiku-5-5' });
  });

  it('passes a refusal on as a "refusal" end', async () => {
    mocks.env.ANTHROPIC_API_KEY = 'sk-ant-test';
    mocks.stream.mockImplementation(() => fakeStream({ stopReason: 'refusal' }));
    const { POST } = await loadRoute();
    expect(await collect(await POST(postJson(question)))).toEqual([
      { type: 'done', reason: 'refusal' },
    ]);
    expect(mocks.stream.mock.calls[0]?.[0]).toMatchObject({
      model: 'claude-opus-5-5',
      fallbacks: 'default',
    });
  });

  it('rate limits a burst from one IP', async () => {
    mocks.env.ANTHROPIC_API_KEY = 'sk-ant-test';
    mocks.stream.mockImplementation(() => fakeStream({ texts: ['ok'] }));
    const { POST } = await loadRoute();
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      const res = await POST(postJson(question, { 'x-forwarded-for': '192.0.2.9' }));
      statuses.push(res.status);
      await collect(res);
    }
    expect(statuses.slice(0, 10).every((s) => s === 200)).toBe(true);
    expect(statuses[10]).toBe(429);
  });
});
