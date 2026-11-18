import { screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { CityCopyProvider } from '@/components/city/copy-context';
import { PlaceSheet } from '@/components/city/ui/PlaceSheet';
import { HomePage } from '@/components/pages/home/HomePage';
import { getContent, getFaqItems, LOCALES, SERVICE_IDS } from '@/content';
import { getCityCopy } from '@/content/site';

import { renderWithIntl } from './utils/intl';

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => '/',
}));

const SERVICE_PLACE = { web: 'taller', ai: 'lab', apps: 'puerto' } as const;

describe.each(LOCALES)('home sections (%s)', (locale) => {
  const c = getContent(locale);
  const { home, meta, services } = c;
  const { routes } = meta;
  const render = () => renderWithIntl(<HomePage locale={locale} />, locale);
  const section = (title: string) => screen.getByRole('region', { name: title });

  it('renders every section below the city, each with its h2', () => {
    render();
    for (const title of [
      home.value.title,
      home.services.title,
      home.featuredCase.title,
      home.process.title,
      home.capabilities.title,
      home.faqTeaser.title,
      home.finalCta.title,
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('links each service to its page and names its landmark', () => {
    render();
    const s = section(home.services.title);
    for (const id of SERVICE_IDS) {
      const service = services.items.find((x) => x.id === id)!;
      const card = within(s)
        .getByRole('heading', { level: 3, name: service.name })
        .closest('article')!;
      expect(card).toHaveAttribute('id', home.city.anchors[SERVICE_PLACE[id]]);
      expect(card).toHaveTextContent(home.city.places[SERVICE_PLACE[id]].landmark);
      expect(
        within(card).getByRole('link', { name: `${home.services.linkLabel}: ${service.name}` }),
      ).toHaveAttribute('href', routes.services[id]);
    }
  });

  it('features Píxel y Papel with a link to the case study', () => {
    render();
    const s = section(home.featuredCase.title);
    expect(s).toHaveAttribute('id', home.city.anchors.mercado);
    expect(s).toHaveTextContent(home.featuredCase.text);
    expect(within(s).getByRole('link', { name: home.featuredCase.link.label })).toHaveAttribute(
      'href',
      routes.casePixelYPapel,
    );
  });

  it('shows the four process steps in order', () => {
    render();
    const steps = within(section(home.process.title)).getAllByRole('listitem');
    expect(steps).toHaveLength(4);
    steps.forEach((li, i) => expect(li).toHaveTextContent(home.process.steps[i]!.title));
  });

  it('lists the capabilities by group', () => {
    render();
    const s = section(home.capabilities.title);
    for (const g of home.capabilities.groups) {
      expect(within(s).getByRole('heading', { level: 3, name: g.title })).toBeInTheDocument();
      for (const item of g.items) expect(s).toHaveTextContent(item);
    }
  });

  it('teases a few questions and links to the FAQ page', () => {
    render();
    const s = section(home.faqTeaser.title);
    const items = getFaqItems(locale, home.faqTeaser.ids);
    expect(s.querySelectorAll('details')).toHaveLength(items.length);
    for (const item of items) expect(s).toHaveTextContent(item.question);
    expect(within(s).getByRole('link', { name: home.faqTeaser.link.label })).toHaveAttribute(
      'href',
      routes.faq,
    );
  });

  it('links the about teaser and closes with the contact form as the single CTA', () => {
    render();
    const value = section(home.value.title);
    expect(value).toHaveAttribute('id', home.city.anchors.torre);
    expect(within(value).getByRole('link', { name: meta.nav.about })).toHaveAttribute(
      'href',
      routes.about,
    );
    expect(within(value).getByRole('img', { name: c.about.avatarAlt })).toBeInTheDocument();

    const cta = section(home.finalCta.title);
    expect(cta.closest(`#${home.city.anchors.faro}`)).not.toBeNull();
    expect(within(cta).getByRole('link', { name: home.finalCta.cta.label })).toHaveAttribute(
      'href',
      routes.contact,
    );
  });

  it('never mentions part-time work or prices', () => {
    render();
    const text = document.body.textContent ?? '';
    expect(text).not.toMatch(/part[- ]time|media jornada|€|\bprecio|\bprice/i);
  });
});

describe.each(LOCALES)('city sheet links (%s)', (locale) => {
  const { meta, home } = getContent(locale);
  const copy = getCityCopy(locale);
  const pageLinks = {
    contact: meta.routes.contact,
    places: { lab: { href: meta.routes.services.ai, label: home.services.linkLabel } },
  };

  it('leads to the place page and to the contact form', () => {
    renderWithIntl(
      <CityCopyProvider value={copy}>
        <PlaceSheet
          place="lab"
          open
          headingRef={createRef()}
          pageLinks={pageLinks}
          onClose={() => {}}
          onOpen={() => {}}
        />
      </CityCopyProvider>,
      locale,
    );
    expect(screen.getByRole('link', { name: home.services.linkLabel })).toHaveAttribute(
      'href',
      meta.routes.services.ai,
    );
    expect(screen.getByRole('link', { name: copy.ui.sheet.cta })).toHaveAttribute(
      'href',
      meta.routes.contact,
    );
  });
});
