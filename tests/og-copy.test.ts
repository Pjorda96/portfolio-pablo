import { describe, expect, it } from 'vitest';

import { getContent, getService, LOCALES } from '@/content';
import {
  clampText,
  estimateLines,
  firstSentence,
  fitTitle,
  getOgCopy,
  OG_PAGES,
  SUBTITLE_MAX_CHARS,
  TITLE_MIN_SIZE,
  TITLE_SIZES,
} from '@/lib/og/copy';

describe('getOgCopy', () => {
  it('takes kicker and title from the content tree', () => {
    for (const locale of LOCALES) {
      const c = getContent(locale);
      expect(getOgCopy(locale, 'home')).toMatchObject({
        kicker: c.home.hero.kicker,
        title: c.home.hero.title,
      });
      expect(getOgCopy(locale, 'ai')).toMatchObject({
        kicker: getService(locale, 'ai').hero.kicker,
        title: getService(locale, 'ai').hero.title,
        landmark: 'lab',
      });
      expect(getOgCopy(locale, 'case').title).toBe(c.casePixelYPapel.hero.title);
      expect(getOgCopy(locale, 'about').title).toBe(c.about.hero.title);
      expect(getOgCopy(locale, 'privacy')).toMatchObject({
        kicker: c.meta.footer.legalLabel,
        title: c.legal.privacy.title,
      });
    }
  });

  it('gives every page a non-empty, localized copy and alt', () => {
    for (const page of OG_PAGES) {
      const es = getOgCopy('es', page);
      const en = getOgCopy('en', page);
      for (const copy of [es, en]) {
        expect(copy.kicker).not.toBe('');
        expect(copy.title).not.toBe('');
        expect(copy.subtitle.length).toBeGreaterThan(0);
        expect(copy.subtitle.length).toBeLessThanOrEqual(SUBTITLE_MAX_CHARS);
        expect(copy.alt).toContain(copy.title);
        expect(copy.alt).toContain('Pablo Jordá');
      }
      expect(es.alt).not.toBe(en.alt);
    }
    expect(getOgCopy('es', 'home').alt).toContain('Valencia');
    expect(getOgCopy('en', 'home').alt).toContain('skyline');
  });

  it('keeps the brief: no prices, Píxel y Papel as a four-partner project', () => {
    for (const locale of LOCALES) {
      for (const page of OG_PAGES) {
        const { kicker, title, subtitle, alt } = getOgCopy(locale, page);
        expect(`${kicker} ${title} ${subtitle} ${alt}`).not.toMatch(/€|\$|\bEUR\b|precio|price/i);
      }
    }
    expect(getOgCopy('es', 'case').subtitle).toMatch(/cuatro socios/);
    expect(getOgCopy('en', 'case').subtitle).toMatch(/four partners/);
  });
});

describe('text helpers', () => {
  it('firstSentence keeps the first sentence only', () => {
    expect(firstSentence('Una frase. Otra más.')).toBe('Una frase.');
    expect(firstSentence('Sin punto final')).toBe('Sin punto final');
    expect(firstSentence('Next.js y React. Y más.')).toBe('Next.js y React.');
  });

  it('clampText cuts at a word boundary with an ellipsis', () => {
    expect(clampText('corto', 10)).toBe('corto');
    const out = clampText('una frase bastante larga que no cabe, nada', 30);
    expect(out.length).toBeLessThanOrEqual(30);
    expect(out).toBe('una frase bastante larga que…');
  });

  it('estimateLines wraps greedily by words', () => {
    expect(estimateLines('corto', 84)).toBe(1);
    expect(estimateLines('palabra '.repeat(40), 84)).toBeGreaterThan(3);
  });
});

describe('fitTitle', () => {
  it('fits every real title in two lines at one of the display sizes', () => {
    for (const locale of LOCALES) {
      for (const page of OG_PAGES) {
        const { title } = getOgCopy(locale, page);
        const fit = fitTitle(title);
        expect(TITLE_SIZES as readonly number[]).toContain(fit.fontSize);
        expect(fit.lines).toBeLessThanOrEqual(2);
      }
    }
  });

  it('prefers the largest size for short titles', () => {
    expect(fitTitle('Hola, soy Pablo.').fontSize).toBe(TITLE_SIZES[0]);
  });

  it('drops very long titles to the minimum size, clamped to three lines', () => {
    const fit = fitTitle(
      'Un título larguísimo que no debería existir nunca en el contenido porque no cabría de ninguna manera en una imagen social',
    );
    expect(fit.fontSize).toBe(TITLE_MIN_SIZE);
    expect(fit.lines).toBe(3);
  });
});
