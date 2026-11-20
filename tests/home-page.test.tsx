import { fireEvent, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { HomePage } from '@/components/pages/home/HomePage';
import { LOCALES } from '@/content';
import { getCityCopy } from '@/content/site';

import { renderWithIntl, withIntl } from './utils/intl';

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => '/',
}));

describe.each(LOCALES)('HomePage (%s)', (locale) => {
  const { hero, places, ui } = getCityCopy(locale);

  it('renders the hero headline as the only level-one heading', () => {
    renderWithIntl(<HomePage locale={locale} />, locale);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(hero.title);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('keeps the brand chip and the menu button over the city', () => {
    renderWithIntl(<HomePage locale={locale} />, locale);

    const banner = screen.getByRole('banner');
    expect(banner).toHaveTextContent('Pablo Jordá');
    expect(within(banner).getByRole('button', { expanded: false })).toBeInTheDocument();
  });

  it('folds the clock controls behind a toggle on phones', () => {
    renderWithIntl(<HomePage locale={locale} />, locale);

    const toggle = screen.getByRole('button', { name: new RegExp(ui.clock.toggle) });
    const controls = document.getElementById(toggle.getAttribute('aria-controls')!)!;
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(controls).toHaveClass('hidden', 'sm:grid');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(controls).not.toHaveClass('hidden');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('links every place from the dock to its section', () => {
    renderWithIntl(<HomePage locale={locale} />, locale);

    const dock = screen.getByRole('navigation', { name: ui.dockLabel });
    for (const p of places) {
      const link = within(dock).getByRole('link', { name: new RegExp(p.landmark) });
      expect(link).toHaveAttribute('href', `#${p.slug}`);
      expect(document.getElementById(p.slug)).toBeInTheDocument();
    }
  });

  describe('server-rendered HTML (no JavaScript, no WebGL)', () => {
    const html = renderToString(withIntl(<HomePage locale={locale} />, locale));
    const doc = new DOMParser().parseFromString(html, 'text/html');

    it('contains the brand, the headline and the value proposition', () => {
      expect(doc.querySelector('h1')?.textContent).toBe(hero.title);
      expect(html).toContain('Pablo Jordá');
      expect(html).toContain(hero.lead);
    });

    it('lands every place of the dock on a section below the city', () => {
      for (const p of places) {
        const target = doc.getElementById(p.slug);
        expect(target, p.slug).not.toBeNull();
        expect(doc.getElementById('lugares')?.contains(target)).toBe(true);
      }
    });

    it('ships no canvas: the city is loaded on the client only', () => {
      expect(doc.querySelector('canvas')).toBeNull();
    });
  });
});

it('localizes the city interface', () => {
  expect(getCityCopy('es').ui.stageLabel).toBe('La ciudad');
  expect(getCityCopy('en').ui.stageLabel).toBe('The city');
  expect(getCityCopy('en').hero.title).toBe('A city of well-built things.');
});
