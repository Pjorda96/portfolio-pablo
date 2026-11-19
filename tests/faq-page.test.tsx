import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FaqPage } from '@/components/pages/faq/FaqPage';
import { FAQ_IDS, getContent, LOCALES } from '@/content';

import { renderWithIntl } from './utils/intl';

describe.each(LOCALES)('FaqPage (%s)', (locale) => {
  const { faq, meta } = getContent(locale);
  const render = () => renderWithIntl(<FaqPage locale={locale} content={faq} />, locale);

  it('has a single h1', () => {
    render();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(faq.hero.title);
  });

  it('renders every question as a closed disclosure with its own anchor', () => {
    render();
    expect(document.querySelectorAll('details')).toHaveLength(FAQ_IDS.length);
    for (const item of faq.items) {
      const details = document.getElementById(item.id);
      expect(details?.tagName).toBe('DETAILS');
      expect(details).not.toHaveAttribute('open');
      expect(details?.querySelector('summary')).toHaveTextContent(item.question);
      expect(details).toHaveTextContent(item.answer);
    }
  });

  it('opens a question from its summary', () => {
    render();
    const first = faq.items[0]!;
    const details = document.getElementById(first.id) as HTMLDetailsElement;
    fireEvent.click(screen.getByText(first.question));
    expect(details.open).toBe(true);
  });

  it('opens the question named in the URL fragment', () => {
    window.location.hash = '';
    render();
    const target = faq.items[3]!;
    act(() => {
      window.location.hash = `#${target.id}`;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect((document.getElementById(target.id) as HTMLDetailsElement).open).toBe(true);
    window.location.hash = '';
  });

  it('closes with a link to the contact page', () => {
    render();
    expect(screen.getByRole('link', { name: faq.cta.cta.label })).toHaveAttribute(
      'href',
      meta.routes.contact,
    );
  });
});
