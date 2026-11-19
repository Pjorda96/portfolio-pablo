import { getContent, getService, type Locale, type PlaceId, type ServiceId } from '@/content';

/**
 * Pure part of the Open Graph images: which copy each page shows, in which
 * locale, and how long titles and subtitles are fitted into 1200×630. No
 * Next.js APIs here, so it can be unit tested in any environment.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

/** Pages with their own social image. */
export const OG_PAGES = [
  'home',
  'web',
  'ai',
  'apps',
  'case',
  'about',
  'faq',
  'contact',
  'notice',
  'privacy',
  'cookies',
] as const;
export type OgPage = (typeof OG_PAGES)[number];

export interface OgCopy {
  /** Mono label above the title: the section or service name. */
  kicker: string;
  /** Big display title. */
  title: string;
  /** One short line under the title. */
  subtitle: string;
  /** Landmark of the city lit in the accent colour, if the page has one. */
  landmark: PlaceId | null;
  /** `og:image:alt` / `twitter:image:alt`. */
  alt: string;
}

/** Landmark of the home city that stands for each service / section. */
const SERVICE_PLACE: Record<ServiceId, PlaceId> = { web: 'taller', ai: 'lab', apps: 'puerto' };

/** Wording around the copy in the alt text (image chrome, not page copy). */
const ALT: Record<Locale, (copy: Omit<OgCopy, 'alt'>, site: string) => string> = {
  es: (c, site) =>
    `${site} · ${c.kicker}: «${c.title}», sobre el perfil nocturno de Valencia. pablojorda.es`,
  en: (c, site) =>
    `${site} · ${c.kicker}: “${c.title}”, over the Valencia skyline at night. pablojorda.es`,
};

export const SUBTITLE_MAX_CHARS = 180;

/** First sentence of a paragraph (keeps the full text if it has only one). */
export function firstSentence(text: string): string {
  const match = /^.+?[.!?](?=\s|$)/u.exec(text.trim());
  return (match ? match[0] : text).trim();
}

/** Cuts `text` to at most `max` characters at a word boundary, with an ellipsis. */
export function clampText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = (lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.·–—-]+$/u, '');
  return `${base}…`;
}

/** Copy of the social image of `page` in `locale`, all from the content tree. */
export function getOgCopy(locale: Locale, page: OgPage): OgCopy {
  const c = getContent(locale);
  const site = c.meta.siteName;

  const base = ((): Omit<OgCopy, 'alt'> => {
    switch (page) {
      case 'home':
        return {
          kicker: c.home.hero.kicker,
          title: c.home.hero.title,
          subtitle: firstSentence(c.home.hero.lead),
          landmark: null,
        };
      case 'web':
      case 'ai':
      case 'apps': {
        const s = getService(locale, page);
        return {
          kicker: s.hero.kicker,
          title: s.hero.title,
          subtitle: firstSentence(s.hero.lead),
          landmark: SERVICE_PLACE[page],
        };
      }
      case 'case':
        return {
          kicker: c.casePixelYPapel.hero.kicker,
          title: c.casePixelYPapel.hero.title,
          subtitle: c.casePixelYPapel.hero.lead,
          landmark: 'mercado',
        };
      case 'about':
        return {
          kicker: c.about.hero.kicker,
          title: c.about.hero.title,
          subtitle: firstSentence(c.about.hero.lead),
          landmark: 'torre',
        };
      case 'faq':
        return {
          kicker: c.faq.hero.kicker,
          title: c.faq.hero.title,
          subtitle: firstSentence(c.faq.hero.lead),
          landmark: null,
        };
      case 'contact':
        return {
          kicker: c.contact.hero.kicker,
          title: c.contact.hero.title,
          subtitle: firstSentence(c.contact.hero.lead),
          landmark: 'faro',
        };
      case 'notice':
      case 'privacy':
      case 'cookies': {
        const legal = c.legal[page];
        return {
          kicker: c.meta.footer.legalLabel,
          title: legal.title,
          subtitle: firstSentence(legal.meta.description),
          landmark: null,
        };
      }
    }
  })();

  const copy = { ...base, subtitle: clampText(base.subtitle, SUBTITLE_MAX_CHARS) };
  return { ...copy, alt: ALT[locale](copy, site) };
}

/* ------------------------------------------------------------ text fitting */

/** Width available to the title block, in px. */
export const TITLE_MAX_WIDTH = 1040;
/** Font sizes tried for the title, largest first. */
export const TITLE_SIZES = [84, 74, 64, 56] as const;
/** Last resort for very long titles, clamped to `TITLE_MAX_LINES`. */
export const TITLE_MIN_SIZE = 50;
export const TITLE_MAX_LINES = 3;

/**
 * Approximate advance of Syne 700 (at the title's -2% tracking) per
 * character, in em, by glyph class. Calibrated on the rendered images, with
 * ~5% to spare so the estimate wraps a little earlier than the renderer.
 */
const SYNE_SCALE = 1.12;
const charEm = (ch: string): number => {
  if (ch === ' ') return 0.28 * SYNE_SCALE;
  if (/[ijlt.,;:’'!|rfí]/u.test(ch)) return 0.32 * SYNE_SCALE;
  if (/[mwMW]/.test(ch)) return 0.9 * SYNE_SCALE;
  if (/\p{Lu}/u.test(ch)) return 0.72 * SYNE_SCALE;
  return 0.6 * SYNE_SCALE;
};
const textEm = (text: string) => [...text].reduce((sum, ch) => sum + charEm(ch), 0);

/** Greedy word wrap with estimated glyph widths: the line count of `text`. */
export function estimateLines(text: string, fontSize: number, maxWidth = TITLE_MAX_WIDTH): number {
  const lineEm = maxWidth / fontSize;
  const spaceEm = charEm(' ');
  let lines = 1;
  let current = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const em = textEm(word);
    if (current === 0) current = em;
    else if (current + spaceEm + em <= lineEm) current += spaceEm + em;
    else {
      lines += 1;
      current = em;
    }
    // A single word longer than a line spills onto extra lines.
    while (current > lineEm) {
      lines += 1;
      current -= lineEm;
    }
  }
  return lines;
}

/**
 * Largest title size that keeps the title within two lines; longer titles
 * drop to `TITLE_MIN_SIZE` and are clamped to three lines by the renderer.
 */
export function fitTitle(title: string): { fontSize: number; lines: number } {
  for (const fontSize of TITLE_SIZES) {
    const lines = estimateLines(title, fontSize);
    if (lines <= 2) return { fontSize, lines };
  }
  return {
    fontSize: TITLE_MIN_SIZE,
    lines: Math.min(estimateLines(title, TITLE_MIN_SIZE), TITLE_MAX_LINES),
  };
}
