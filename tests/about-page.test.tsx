import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AboutPage } from '@/components/pages/about/AboutPage';
import { getContent, LOCALES } from '@/content';

import { renderWithIntl } from './utils/intl';

describe.each(LOCALES)('AboutPage (%s)', (locale) => {
  const { about, meta } = getContent(locale);
  const render = () => renderWithIntl(<AboutPage locale={locale} content={about} />, locale);

  it('has a single h1 and the portrait with its alt text', () => {
    render();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(about.hero.title);
    expect(screen.getByRole('img', { name: about.avatarAlt })).toBeInTheDocument();
  });

  it('positions him as an AI-powered full-stack developer with 7+ years', () => {
    render();
    const text = document.body.textContent ?? '';
    expect(text).toMatch(
      locale === 'es' ? /full-stack potenciado por IA/ : /AI-powered full-stack/,
    );
    expect(text).toMatch(/7/);
    for (const p of about.intro) expect(text).toContain(p);
  });

  it('renders experience by sector, how he works, specialties and working together', () => {
    render();
    const experience = screen.getByRole('region', { name: about.experience.title });
    for (const s of about.experience.sectors) {
      expect(within(experience).getByRole('heading', { level: 3, name: s.title })).toBeVisible();
    }
    const quality = screen.getByRole('region', { name: about.quality.title });
    expect(within(quality).getAllByRole('listitem')).toHaveLength(about.quality.items.length);
    const specialties = screen.getByRole('region', { name: about.specialties.title });
    for (const item of about.specialties.items) expect(specialties).toHaveTextContent(item);
    const working = screen.getByRole('region', { name: about.working.title });
    for (const item of about.working.items) expect(working).toHaveTextContent(item);
  });

  it('closes with a link to the contact page', () => {
    render();
    expect(screen.getByRole('link', { name: about.cta.cta.label })).toHaveAttribute(
      'href',
      meta.routes.contact,
    );
  });

  it('never mentions part-time work, employers or prices', () => {
    render();
    expect(document.body.textContent).not.toMatch(/part[- ]time|media jornada|€|\bprecio|\bprice/i);
  });
});
