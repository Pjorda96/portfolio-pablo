import { render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';
import { hero, places } from '@/content/site';

describe('HomePage', () => {
  it('renders the hero headline as the only level-one heading', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(hero.title);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('wraps the content in a main landmark', () => {
    render(<HomePage />);

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('links every place from the dock to its section', () => {
    render(<HomePage />);

    const dock = screen.getByRole('navigation', { name: 'Lugares de la ciudad' });
    for (const p of places) {
      const link = within(dock).getByRole('link', { name: new RegExp(p.landmark) });
      expect(link).toHaveAttribute('href', `#${p.slug}`);
      expect(document.getElementById(p.slug)).toBeInTheDocument();
    }
  });
});

describe('server-rendered HTML (no JavaScript, no WebGL)', () => {
  const html = renderToString(<HomePage />);
  const doc = new DOMParser().parseFromString(html, 'text/html');

  it('contains the brand, the headline and the value proposition', () => {
    expect(doc.querySelector('h1')?.textContent).toBe(hero.title);
    expect(html).toContain('Pablo Jordá');
    expect(html).toContain(hero.lead);
  });

  it('contains all six places as headed articles with their copy', () => {
    const articles = doc.querySelectorAll('#lugares article');
    expect(articles).toHaveLength(6);

    for (const p of places) {
      const article = doc.getElementById(p.slug);
      expect(article?.tagName).toBe('ARTICLE');
      expect(article?.querySelector('h3')?.textContent).toBe(p.title);
      expect(article?.textContent).toContain(p.landmark);
      expect(article?.textContent).toContain(p.text);
      for (const point of p.points) expect(article?.textContent).toContain(point);
    }
  });

  it('ships no canvas: the city is loaded on the client only', () => {
    expect(doc.querySelector('canvas')).toBeNull();
  });
});
