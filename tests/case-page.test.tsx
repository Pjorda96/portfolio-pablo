import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CasePixelYPapelPage } from '@/components/pages/case-pixel-y-papel/CasePixelYPapelPage';
import { getContent, LOCALES } from '@/content';

import { renderWithIntl } from './utils/intl';

describe.each(LOCALES)('CasePixelYPapelPage (%s)', (locale) => {
  const { meta, casePixelYPapel: c } = getContent(locale);
  const setup = () => renderWithIntl(<CasePixelYPapelPage locale={locale} content={c} />, locale);

  it('has the project name as its only h1 and no <main> of its own', () => {
    const { container } = setup();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(c.hero.title);
    expect(container.querySelector('main')).toBeNull();
  });

  it('tells the case in labelled sections, in order', () => {
    setup();
    const h2 = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(h2).toEqual([
      c.context.title,
      c.challenge.title,
      c.solution.title,
      c.role.title,
      c.result.title,
      c.stack.title,
      c.cta.title,
    ]);
    for (const title of h2) {
      expect(screen.getByRole('region', { name: title ?? '' })).toBeInTheDocument();
    }
  });

  it('presents Pablo as co-founder and tech lead of a four-partner project', () => {
    const { container } = setup();
    const facts = container.querySelector('dl');
    expect(facts).not.toBeNull();
    for (const fact of c.facts) {
      expect(within(facts as HTMLElement).getByText(fact.label).tagName).toBe('DT');
      expect(within(facts as HTMLElement).getByText(fact.value).tagName).toBe('DD');
    }
    for (const p of c.role.paragraphs) expect(screen.getByText(p)).toBeInTheDocument();
  });

  it('shows the stack as a list of chips', () => {
    setup();
    for (const item of c.stack.items) expect(screen.getByText(item).tagName).toBe('LI');
  });

  it('links the live product in a new tab, safely and announced', () => {
    setup();
    const links = screen.getAllByRole('link', { name: new RegExp(c.link.label) });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute('href', 'https://www.pixelypapel.com/');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link.querySelector('.sr-only')?.textContent).toMatch(/\S/);
    }
  });

  it('closes with a CTA to the contact page', () => {
    setup();
    const cta = screen.getByRole('link', { name: c.cta.cta.label });
    expect(cta).toHaveAttribute('href', meta.routes.contact);
  });

  it('stays qualitative: no metrics, only the launch year', () => {
    const { container } = setup();
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/%/);
    expect(text).not.toMatch(/\d\s*(k|K|M|x|×)\b/);
    for (const number of text.match(/\d+/g) ?? []) expect(number).toMatch(/^20\d\d$/);
  });

  it('renders no gallery until there are images', () => {
    const { container } = setup();
    expect(container.querySelector('figure')).toBeNull();
    expect(screen.queryByRole('img')).toBeNull();
  });
});

it('renders a gallery with alt text when images are provided', () => {
  const c = getContent('es').casePixelYPapel;
  const src = { src: '/shot.png', width: 1200, height: 800 };
  renderWithIntl(
    <CasePixelYPapelPage
      locale="es"
      content={c}
      gallery={[{ src, alt: 'Web de un evento', caption: 'Una web de evento' }]}
    />,
    'es',
  );
  expect(screen.getByRole('region', { name: 'Galería' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Web de un evento' })).toBeInTheDocument();
  expect(screen.getByText('Una web de evento').tagName).toBe('FIGCAPTION');
});
