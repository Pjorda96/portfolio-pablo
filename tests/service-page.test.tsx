import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ServicePage } from '@/components/pages/service/ServicePage';
import { getContent, getService, LOCALES, SERVICE_IDS } from '@/content';

import { renderWithIntl } from './utils/intl';

const LANDMARK_PLACE = { web: 'taller', ai: 'lab', apps: 'puerto' } as const;

describe.each(LOCALES)('ServicePage (%s)', (locale) => {
  const { meta, home } = getContent(locale);

  describe.each(SERVICE_IDS)('%s', (id) => {
    const service = getService(locale, id);
    const setup = () => renderWithIntl(<ServicePage locale={locale} service={service} />, locale);

    it('has the hero title as its only h1 and no <main> of its own', () => {
      const { container } = setup();
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(service.hero.title);
      expect(container.querySelector('main')).toBeNull();
    });

    it('renders every body section as a labelled region with its h2', () => {
      setup();
      const h2 = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
      for (const title of [
        service.problem.title,
        service.approach.title,
        service.deliverables.title,
        service.process.title,
        service.faq.title,
        service.cta.title,
      ]) {
        expect(h2).toContain(title);
        expect(screen.getByRole('region', { name: title })).toBeInTheDocument();
      }
    });

    it('lists the problem, the four process steps and the deliverables', () => {
      setup();
      const process = screen.getByRole('region', { name: service.process.title });
      expect(within(process).getAllByRole('listitem')).toHaveLength(4);
      for (const step of service.process.steps) {
        expect(within(process).getByRole('heading', { level: 3, name: step.title })).toBeVisible();
      }
      for (const item of service.problem.items) expect(screen.getByText(item)).toBeInTheDocument();
      for (const item of service.deliverables.items) {
        expect(screen.getByRole('heading', { level: 3, name: item.title })).toBeInTheDocument();
      }
    });

    it('puts each FAQ answer in a native disclosure', () => {
      setup();
      const faq = screen.getByRole('region', { name: service.faq.title });
      const details = faq.querySelectorAll('details');
      expect(details).toHaveLength(service.faq.items.length);
      service.faq.items.forEach((item, i) => {
        expect(details[i]?.querySelector('summary')).toHaveTextContent(item.question);
        expect(details[i]).toHaveTextContent(item.answer);
      });
    });

    it('names its landmark from the home city', () => {
      setup();
      const landmark = home.city.places[LANDMARK_PLACE[id]].landmark;
      expect(screen.getAllByText(new RegExp(landmark)).length).toBeGreaterThan(0);
    });

    it('links the two other services to their localized pages', () => {
      setup();
      for (const other of SERVICE_IDS.filter((o) => o !== id)) {
        const link = screen.getByRole('link', { name: getService(locale, other).name });
        expect(link).toHaveAttribute('href', meta.routes.services[other]);
      }
      expect(screen.queryByRole('link', { name: service.name })).toBeNull();
    });

    it('closes with a CTA to the contact page', () => {
      setup();
      const cta = screen.getByRole('link', { name: service.cta.cta.label });
      expect(cta).toHaveAttribute('href', meta.routes.contact);
    });
  });
});
