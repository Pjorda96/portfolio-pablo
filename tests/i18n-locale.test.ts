import { beforeEach, describe, expect, it, vi } from 'vitest';

import { localeParams, resolveLocale } from '@/i18n/locale';

const mocks = vi.hoisted(() => ({
  setRequestLocale: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('next-intl/server', () => ({ setRequestLocale: mocks.setRequestLocale }));
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  notFound: mocks.notFound,
}));

beforeEach(() => {
  mocks.setRequestLocale.mockClear();
  mocks.notFound.mockClear();
});

describe('localeParams', () => {
  it('generates one static param per locale', () => {
    expect(localeParams()).toEqual([{ locale: 'es' }, { locale: 'en' }]);
  });
});

describe('resolveLocale', () => {
  it.each(['es', 'en'])('accepts %s and enables static rendering for it', async (locale) => {
    await expect(resolveLocale(Promise.resolve({ locale }))).resolves.toBe(locale);
    expect(mocks.setRequestLocale).toHaveBeenCalledWith(locale);
    expect(mocks.notFound).not.toHaveBeenCalled();
  });

  it.each(['fr', 'ES', '', 'favicon.ico'])('answers 404 for %j', async (locale) => {
    await expect(resolveLocale(Promise.resolve({ locale }))).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mocks.notFound).toHaveBeenCalledOnce();
    expect(mocks.setRequestLocale).not.toHaveBeenCalled();
  });
});
