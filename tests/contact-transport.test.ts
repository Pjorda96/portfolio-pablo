import { describe, expect, it, vi } from 'vitest';

import { parseEnv } from '@/env';
import type { OutgoingEmail } from '@/lib/contact/mailer';
import {
  createTestMailer,
  selectContactMailer,
  TEST_MAILER_FAIL_MARKER,
} from '@/lib/contact/transport';

const send = vi.fn();
vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));

const email = (text: string): OutgoingEmail => ({
  from: 'Web <onboarding@resend.dev>',
  to: 'owner@example.com',
  replyTo: 'ada@example.com',
  subject: 'Contacto web: Ada',
  text,
  html: '<p>…</p>',
});

describe('createTestMailer', () => {
  it('accepts a message without sending anything', async () => {
    const log = vi.fn();
    await expect(createTestMailer(log)(email('Hola, quiero una web.'))).resolves.toBe(true);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('accepted, nothing sent'));
    expect(send).not.toHaveBeenCalled();
  });

  it('reports a delivery failure for messages with the failure marker', async () => {
    const log = vi.fn();
    const result = await createTestMailer(log)(
      email(`Falla, por favor ${TEST_MAILER_FAIL_MARKER}`),
    );
    expect(result).toBe(false);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('rejected'));
  });
});

describe('selectContactMailer', () => {
  it('has no mailer without a Resend key or the test mailer', () => {
    expect(selectContactMailer({})).toBeNull();
  });

  it('uses Resend when there is a key', async () => {
    send.mockResolvedValueOnce({ error: null });
    const mailer = selectContactMailer({ resendApiKey: 're_123' });
    await expect(mailer?.(email('Hola'))).resolves.toBe(true);
    expect(send).toHaveBeenCalledTimes(1);
    send.mockClear();
  });

  it('prefers the test mailer over a Resend key, so tests never send email', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mailer = selectContactMailer({
      resendApiKey: 're_123',
      testMailer: true,
      vercelEnv: 'preview',
    });
    await expect(mailer?.(email('Hola'))).resolves.toBe(true);
    expect(send).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('refuses the test mailer on the production deployment', () => {
    expect(() => selectContactMailer({ testMailer: true, vercelEnv: 'production' })).toThrow(
      /production/,
    );
  });
});

describe('CONTACT_TEST_MAILER in the environment', () => {
  const base = { NODE_ENV: 'production', SITE_URL: 'https://pablojorda.es' };

  it('is off unless set to 1', () => {
    expect(parseEnv(base).CONTACT_TEST_MAILER).toBe(false);
    expect(parseEnv({ ...base, CONTACT_TEST_MAILER: '' }).CONTACT_TEST_MAILER).toBe(false);
    expect(parseEnv({ ...base, CONTACT_TEST_MAILER: '0' }).CONTACT_TEST_MAILER).toBe(false);
    expect(parseEnv({ ...base, CONTACT_TEST_MAILER: '1' }).CONTACT_TEST_MAILER).toBe(true);
  });

  it('rejects values other than 0 and 1', () => {
    expect(() => parseEnv({ ...base, CONTACT_TEST_MAILER: 'yes' })).toThrow(/CONTACT_TEST_MAILER/);
  });

  it('is allowed on local builds and previews', () => {
    expect(() =>
      parseEnv({ ...base, CONTACT_TEST_MAILER: '1', VERCEL_ENV: 'preview' }),
    ).not.toThrow();
  });

  it('stops a production deployment that enables it', () => {
    expect(() => parseEnv({ ...base, CONTACT_TEST_MAILER: '1', VERCEL_ENV: 'production' })).toThrow(
      /CONTACT_TEST_MAILER: not allowed when VERCEL_ENV is production/,
    );
  });
});
