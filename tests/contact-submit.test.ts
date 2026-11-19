import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { issueFormToken, MIN_FILL_MS } from '@/lib/contact/anti-spam';
import { buildContactEmail, escapeHtml } from '@/lib/contact/email';
import { HONEYPOT_FIELD, TOKEN_FIELD } from '@/lib/contact/fields';
import { createResendMailer, type Mailer } from '@/lib/contact/mailer';
import { createMemoryRateLimiter, type RateLimiter } from '@/lib/contact/rate-limit';
import { submitContact, type ContactDeps } from '@/lib/contact/submit';

const send = vi.fn();
vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));

const SECRET = 'a-test-secret-of-some-length';
const T0 = 1_800_000_000_000;
const NOW = T0 + 10_000;

const formData = (overrides: Record<string, string | null> = {}) => {
  const fields: Record<string, string | null> = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    company: 'Analytical <Engines>',
    service: 'apps',
    message: 'Quiero lanzar un MVP <script>alert(1)</script> en tres meses.',
    privacy: 'on',
    locale: 'en',
    [HONEYPOT_FIELD]: '',
    [TOKEN_FIELD]: issueFormToken(SECRET, T0),
    ...overrides,
  };
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) if (value !== null) data.set(key, value);
  return data;
};

let mailer: ReturnType<typeof vi.fn<Mailer>>;
let log: ReturnType<typeof vi.fn<(message: string) => void>>;

const deps = (overrides: Partial<ContactDeps> = {}): ContactDeps => ({
  isProduction: true,
  mailer,
  from: 'Web <onboarding@resend.dev>',
  to: 'owner@example.com',
  tokenSecret: SECRET,
  limiter: createMemoryRateLimiter({ max: 5, windowMs: 600_000, now: () => NOW }),
  ip: '203.0.113.7',
  now: () => NOW,
  log,
  ...overrides,
});

beforeEach(() => {
  mailer = vi.fn<Mailer>().mockResolvedValue(true);
  log = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
  send.mockReset();
});

describe('submitContact', () => {
  it('sends a valid message to the owner, replying to the visitor', async () => {
    const state = await submitContact(formData(), deps());

    expect(state).toEqual({ status: 'success', at: NOW });
    expect(mailer).toHaveBeenCalledOnce();
    const email = mailer.mock.calls[0]![0];
    expect(email).toMatchObject({
      from: 'Web <onboarding@resend.dev>',
      to: 'owner@example.com',
      replyTo: 'ada@example.com',
    });
    expect(email.subject).toContain('Ada Lovelace');
    expect(email.text).toContain('<script>alert(1)</script>');
    expect(email.text).toContain('Idioma de la web: EN');
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(email.html).toContain('Analytical &lt;Engines&gt;');
  });

  it('silently "succeeds" without sending when the honeypot is filled', async () => {
    const state = await submitContact(formData({ [HONEYPOT_FIELD]: 'http://spam' }), deps());
    expect(state.status).toBe('success');
    expect(mailer).not.toHaveBeenCalled();
  });

  it.each([
    ['missing', null],
    ['forged', `${T0}.forged`],
    ['too fast', issueFormToken(SECRET, NOW - MIN_FILL_MS + 1)],
  ])('rejects a %s timing token as spam', async (_label, token) => {
    const state = await submitContact(formData({ [TOKEN_FIELD]: token }), deps());
    expect(state).toMatchObject({ status: 'error', formError: 'spam' });
    expect(mailer).not.toHaveBeenCalled();
  });

  it('returns field errors and the submitted values when invalid', async () => {
    const state = await submitContact(
      formData({ email: 'nope', message: 'corto', privacy: null }),
      deps(),
    );
    expect(state).toMatchObject({
      status: 'error',
      formError: undefined,
      fieldErrors: {
        email: 'emailInvalid',
        message: 'messageTooShort',
        privacy: 'privacyRequired',
      },
      values: { name: 'Ada Lovelace', email: 'nope', message: 'corto', privacy: false },
    });
    expect(mailer).not.toHaveBeenCalled();
  });

  it('rate limits per IP', async () => {
    const limiter = createMemoryRateLimiter({ max: 2, windowMs: 600_000, now: () => NOW });
    const shared = deps({ limiter });
    expect((await submitContact(formData(), shared)).status).toBe('success');
    expect((await submitContact(formData(), shared)).status).toBe('success');
    expect(await submitContact(formData(), shared)).toMatchObject({ formError: 'rateLimited' });
    expect(mailer).toHaveBeenCalledTimes(2);

    // Another visitor is not affected.
    expect((await submitContact(formData(), { ...shared, ip: '198.51.100.2' })).status).toBe(
      'success',
    );
  });

  it.each([
    ['an unknown', 'fr'],
    ['a missing', null],
  ])('tags %s page locale as Spanish', async (_label, locale) => {
    await submitContact(formData({ locale }), deps());
    expect(mailer.mock.calls[0]![0].text).toContain('Idioma de la web: ES');
  });

  it('reports a generic error when the provider fails', async () => {
    mailer.mockResolvedValue(false);
    expect(await submitContact(formData(), deps())).toMatchObject({
      status: 'error',
      formError: 'generic',
    });
  });

  it('never throws', async () => {
    const limiter: RateLimiter = { limit: () => Promise.reject(new Error('store down')) };
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await submitContact(formData(), deps({ limiter }))).toMatchObject({
      formError: 'generic',
    });
  });

  describe('without RESEND_API_KEY', () => {
    it('logs the message and succeeds in development', async () => {
      const state = await submitContact(formData(), deps({ mailer: null, isProduction: false }));
      expect(state.status).toBe('success');
      expect(log).toHaveBeenCalledOnce();
      expect(log.mock.calls[0]![0]).toContain('Reply-To: ada@example.com');
    });

    it('reports "temporarily unavailable" in production', async () => {
      const state = await submitContact(formData(), deps({ mailer: null, isProduction: true }));
      expect(state).toMatchObject({ status: 'error', formError: 'unavailable' });
    });
  });
});

describe('Resend mailer', () => {
  const email = {
    from: 'Web <onboarding@resend.dev>',
    to: 'owner@example.com',
    replyTo: 'ada@example.com',
    subject: 'Hola',
    text: 'texto',
    html: '<p>texto</p>',
  };

  it('sends text and HTML with reply-to', async () => {
    send.mockResolvedValue({ data: { id: 'email_1' }, error: null });
    expect(await createResendMailer('re_test')(email)).toBe(true);
    expect(send).toHaveBeenCalledWith(email);
  });

  it('resolves to false on an API error or a network failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    send.mockResolvedValueOnce({ data: null, error: { name: 'validation_error', message: 'x' } });
    expect(await createResendMailer('re_test')(email)).toBe(false);
    send.mockRejectedValueOnce(new Error('offline'));
    expect(await createResendMailer('re_test')(email)).toBe(false);
  });
});

describe('contact email', () => {
  it('escapes HTML', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    );
  });

  it('keeps header values on one line', () => {
    const { subject } = buildContactEmail(
      {
        name: 'Ada\r\nBcc: victim@example.com',
        email: 'ada@example.com',
        company: '',
        service: 'other',
        message: 'x'.repeat(30),
        privacy: true,
      },
      'es',
    );
    expect(subject).not.toMatch(/[\r\n]/);
    expect(subject).toContain('Otra cosa');
  });
});
