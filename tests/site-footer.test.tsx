import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { getContent, LOCALES, owner } from '@/content';

import { renderWithIntl } from './utils/intl';

// The language switcher in the footer reads the current (internal) pathname.
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => '/',
}));

describe.each(LOCALES)('SiteFooter (%s)', (locale) => {
  it('links to the owner profiles in a new tab, marked as rel="me"', () => {
    renderWithIntl(<SiteFooter locale={locale} />, locale);
    const list = screen.getByRole('list', { name: getContent(locale).meta.footer.profilesLabel });
    const links = within(list).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      owner.profiles.github,
      owner.profiles.linkedin,
    ]);
    for (const a of links) {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a.getAttribute('rel')).toMatch(/\bme\b/);
    }
  });
});
