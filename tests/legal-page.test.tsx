import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LegalDocument, renderPlaceholders } from '@/components/pages/legal/LegalDocument';
import { hasPlaceholders } from '@/components/pages/legal/legal-copy';
import { getContent, LOCALES } from '@/content';

describe('LegalDocument', () => {
  it.each(LOCALES)('renders every section of the three documents (%s)', (locale) => {
    const { legal } = getContent(locale);
    for (const document of ['notice', 'privacy', 'cookies'] as const) {
      const { unmount } = render(<LegalDocument locale={locale} document={document} />);
      const page = legal[document];
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(page.title);
      expect(screen.getByText(page.updated)).toBeInTheDocument();
      const headings = screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent);
      for (const section of page.sections) expect(headings).toContain(section.title);
      unmount();
    }
  });

  it('shows placeholders as a "pending" marker, never as raw braces', () => {
    const { container } = render(<LegalDocument locale="es" document="notice" />);
    expect(container.textContent).not.toMatch(/\{\{|\}\}/);
    const markers = container.querySelectorAll('mark[data-placeholder]');
    expect([...markers].map((mark) => mark.getAttribute('data-placeholder'))).toEqual([
      'NIF',
      'DOMICILIO',
    ]);
    expect(markers[0]).toHaveTextContent('pendiente');
  });

  it('shows the draft notice while the owner data is incomplete', () => {
    const { legal } = getContent('en');
    expect(hasPlaceholders(legal)).toBe(true);
    render(<LegalDocument locale="en" document="cookies" />);
    expect(screen.getByRole('note')).toHaveTextContent(legal.draftNotice);
  });

  it('renders the cookie table with a caption and header scopes', () => {
    const { table } = getContent('es').legal.cookies;
    render(<LegalDocument locale="es" document="cookies" />);
    const cookies = screen.getByRole('table', { name: table.caption });
    const columns = within(cookies).getAllByRole('columnheader');
    expect(columns.map((th) => th.textContent)).toEqual([
      table.headers.name,
      table.headers.provider,
      table.headers.purpose,
      table.headers.duration,
      table.headers.kind,
    ]);
    for (const th of columns) expect(th).toHaveAttribute('scope', 'col');
    const rowHeaders = within(cookies).getAllByRole('rowheader');
    expect(rowHeaders.map((th) => th.textContent)).toEqual(table.rows.map((row) => row.name));
    for (const th of rowHeaders) expect(th).toHaveAttribute('scope', 'row');
  });

  it('has no cookie table outside the cookie policy', () => {
    render(<LegalDocument locale="es" document="privacy" />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('links to the other two legal documents in the same locale', () => {
    render(<LegalDocument locale="en" document="privacy" />);
    const nav = screen.getByRole('navigation', { name: 'Other legal texts' });
    const links = within(nav)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    const { routes } = getContent('en').meta;
    expect(links).toEqual([routes.legal.notice, routes.legal.cookies]);
  });
});

describe('renderPlaceholders', () => {
  it('leaves plain text untouched', () => {
    expect(renderPlaceholders('Titular: Pablo Jordá', 'pendiente')).toBe('Titular: Pablo Jordá');
  });
});
