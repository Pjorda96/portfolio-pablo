/**
 * Shape of the site's copy. Every locale under `src/content/<locale>/` fills
 * the same `SiteContent`, and `tests/content.test.ts` checks that both trees
 * have exactly the same structure (keys, list lengths, ids).
 *
 * Only plain data lives here: no JSX, no Next.js APIs. Pages pick what they
 * need through `getContent(locale)` in `src/content/index.ts`.
 */

export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Default locale: served at the root, without a prefix. */
export const DEFAULT_LOCALE = 'es' satisfies Locale;

export const PLACE_IDS = ['taller', 'lab', 'puerto', 'mercado', 'torre', 'faro'] as const;
/** Internal id of a clickable landmark in the home city. */
export type PlaceId = (typeof PLACE_IDS)[number];

export const SERVICE_IDS = ['web', 'ai', 'apps'] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export const FAQ_IDS = [
  'plazos',
  'proceso',
  'ia',
  'comunicacion',
  'remoto',
  'propiedad',
  'mantenimiento',
  'proyecto-existente',
  'primer-paso',
] as const;
export type FaqId = (typeof FAQ_IDS)[number];

/** `<title>` (≤ 60 chars, complete, no template) and meta description (≤ 155 chars). */
export interface PageMeta {
  title: string;
  description: string;
}

export interface Link {
  label: string;
  href: string;
}

/** Closing block of a page: always points at the contact form. */
export interface CtaBlock {
  title: string;
  text: string;
  cta: Link;
}

export interface PageHero {
  kicker: string;
  title: string;
  lead: string;
}

export interface TitledText {
  title: string;
  text: string;
}

export interface Section {
  title: string;
  paragraphs: readonly string[];
}

export interface FaqItem {
  question: string;
  /** Plain text: it feeds `FAQPage` JSON-LD as is. */
  answer: string;
}

export interface IdentifiedFaqItem extends FaqItem {
  id: FaqId;
}

/* ------------------------------------------------------------------ meta */

export interface Routes {
  home: string;
  services: Record<ServiceId, string>;
  casePixelYPapel: string;
  about: string;
  faq: string;
  contact: string;
  legal: {
    notice: string;
    privacy: string;
    cookies: string;
  };
}

export interface MetaContent {
  locale: Locale;
  /** BCP 47 tag for `<html lang>` and `og:locale`. */
  htmlLang: string;
  ogLocale: string;
  siteName: string;
  /** Short role line used in JSON-LD (`Person.jobTitle`) and the footer. */
  jobTitle: string;
  routes: Routes;
  nav: {
    label: string;
    services: string;
    projects: string;
    about: string;
    faq: string;
    contact: string;
    /** The single call to action of the header: always the contact page. */
    cta: string;
    /** Accessible name of the link back to the home page (monogram + name). */
    home: string;
  };
  /** Mobile menu (and the menu button of the floating chip on the home). */
  menu: { open: string; close: string; title: string };
  languageSwitch: { label: string; target: string };
  /** Theme selector: follow the city's hour, or pin day / night. */
  theme: { label: string; auto: string; light: string; dark: string };
  skipLink: string;
  footer: {
    tagline: string;
    legalLabel: string;
    notice: string;
    privacy: string;
    cookies: string;
  };
  notFound: PageMeta & { text: string; back: string };
  /** Error boundary (`error.tsx`): unexpected failures, with a retry. */
  error: { title: string; text: string; retry: string; back: string };
}

/* ------------------------------------------------------------------ home */

export interface CityPlace {
  /** The landmark that stands for the section in the city. */
  landmark: string;
  /** Section name: the label of the dock button and the pin. */
  short: string;
  title: string;
  text: string;
  points: readonly string[];
}

export interface CityUi {
  /** Skip link that jumps over the 3D stage to the places' sections. */
  skipLink: string;
  coordinates: string;
  stageLabel: string;
  dockLabel: string;
  clock: {
    label: string;
    slider: string;
    real: string;
    play: string;
    modes: { real: string; play: string; manual: string };
    placeholder: string;
  };
  sheet: {
    cta: string;
    contactCta: string;
    back: string;
    /** Live-region text when a place opens; `{landmark}` and `{title}` are replaced. */
    announce: string;
  };
  scrollCue: string;
  noWebgl: string;
}

export interface HomeContent {
  meta: PageMeta;
  hero: PageHero & { hint: string; cta: Link };
  /** Copy of the 3D city section (F1 home). */
  city: {
    title: string;
    intro: string;
    places: Record<PlaceId, CityPlace>;
    /** Fragment id of each place's section on the home page. */
    anchors: Record<PlaceId, string>;
    /** Interface of the city: clock, dock, detail sheet, notices. */
    ui: CityUi;
  };
  value: {
    title: string;
    text: string;
    points: readonly TitledText[];
  };
  services: {
    title: string;
    intro: string;
    linkLabel: string;
  };
  featuredCase: {
    kicker: string;
    title: string;
    text: string;
    role: string;
    link: Link;
  };
  process: {
    title: string;
    intro: string;
    steps: readonly TitledText[];
  };
  capabilities: {
    title: string;
    intro: string;
    groups: readonly { title: string; items: readonly string[] }[];
  };
  faqTeaser: {
    title: string;
    intro: string;
    ids: readonly FaqId[];
    link: Link;
  };
  finalCta: CtaBlock;
}

/* -------------------------------------------------------------- services */

export interface ServiceContent {
  id: ServiceId;
  /** Exact service name. */
  name: string;
  href: string;
  meta: PageMeta;
  /** Card copy for the home and the city. */
  summary: {
    text: string;
    points: readonly string[];
  };
  hero: PageHero;
  problem: {
    title: string;
    intro: string;
    items: readonly string[];
  };
  approach: {
    title: string;
    paragraphs: readonly string[];
    principles: readonly TitledText[];
  };
  deliverables: {
    title: string;
    items: readonly TitledText[];
  };
  process: {
    title: string;
    steps: readonly TitledText[];
  };
  faq: {
    title: string;
    items: readonly FaqItem[];
  };
  cta: CtaBlock;
}

export interface ServicesContent {
  title: string;
  intro: string;
  items: readonly ServiceContent[];
}

/* ------------------------------------------------------------------ case */

export interface CaseStudyContent {
  meta: PageMeta;
  hero: PageHero;
  /** Short summary for cards (home, city). */
  summary: string;
  facts: readonly { label: string; value: string }[];
  context: Section;
  challenge: Section & { items: readonly string[] };
  solution: Section & { items: readonly TitledText[] };
  role: Section;
  result: Section;
  stack: { title: string; items: readonly string[] };
  /** Public link to the product. */
  link: Link;
  cta: CtaBlock;
}

/* ----------------------------------------------------------------- about */

export interface AboutContent {
  meta: PageMeta;
  hero: PageHero;
  avatarAlt: string;
  intro: readonly string[];
  experience: {
    title: string;
    text: string;
    sectors: readonly TitledText[];
  };
  specialties: {
    title: string;
    items: readonly string[];
  };
  quality: {
    title: string;
    intro: string;
    items: readonly TitledText[];
  };
  working: {
    title: string;
    items: readonly string[];
  };
  cta: CtaBlock;
}

/* ------------------------------------------------------------------- faq */

export interface FaqContent {
  meta: PageMeta;
  hero: PageHero;
  items: readonly IdentifiedFaqItem[];
  cta: CtaBlock;
}

/* ----------------------------------------------------------------- legal */

export interface LegalSection {
  title: string;
  paragraphs: readonly string[];
  items: readonly string[];
}

export interface CookieRow {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  kind: string;
}

export interface LegalPage {
  meta: PageMeta;
  title: string;
  updated: string;
  sections: readonly LegalSection[];
}

export interface LegalContent {
  /**
   * Shown on every legal page until the owner has filled the placeholders
   * (`{{NIF}}`, `{{DOMICILIO}}`) and reviewed the text.
   */
  draftNotice: string;
  notice: LegalPage;
  privacy: LegalPage;
  cookies: LegalPage & {
    table: {
      caption: string;
      headers: CookieRow;
      rows: readonly CookieRow[];
    };
  };
}

/* --------------------------------------------------------------- contact */

export interface FormField {
  label: string;
  placeholder: string;
  help: string;
}

export interface ContactContent {
  meta: PageMeta;
  hero: PageHero;
  nextSteps: {
    title: string;
    items: readonly string[];
  };
  form: {
    title: string;
    requiredHint: string;
    optional: string;
    fields: {
      name: FormField;
      email: FormField;
      company: FormField;
      service: FormField & { options: Record<ServiceId | 'other', string> };
      message: FormField;
      privacy: { label: string; linkLabel: string };
    };
    submit: string;
    sending: string;
    success: { title: string; text: string };
    errors: {
      nameRequired: string;
      emailRequired: string;
      emailInvalid: string;
      serviceRequired: string;
      messageTooShort: string;
      messageTooLong: string;
      privacyRequired: string;
      rateLimited: string;
      spam: string;
      generic: string;
    };
  };
  /** First-layer data protection notice under the form (RGPD art. 13). */
  privacyNotice: {
    title: string;
    items: readonly { label: string; text: string }[];
    link: Link;
  };
}

/* ------------------------------------------------------------------ root */

export interface SiteContent {
  meta: MetaContent;
  home: HomeContent;
  services: ServicesContent;
  casePixelYPapel: CaseStudyContent;
  about: AboutContent;
  faq: FaqContent;
  legal: LegalContent;
  contact: ContactContent;
}
