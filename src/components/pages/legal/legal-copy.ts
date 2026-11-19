import { legalUi as en } from '@/content/en/legal';
import { legalUi as es, type LegalUi } from '@/content/es/legal';
import type { LegalContent, Locale } from '@/content/types';

const copy: Record<Locale, LegalUi> = { es, en };

/** Legal pages interface copy that `LegalContent` does not hold yet. */
export const getLegalUi = (locale: Locale): LegalUi => copy[locale];

/** A `{{NAME}}` placeholder; the capture keeps the name when splitting. */
export const PLACEHOLDER = /\{\{([^}]+)\}\}/;

/** True while any legal text still contains an unfilled placeholder. */
export const hasPlaceholders = (legal: LegalContent): boolean =>
  PLACEHOLDER.test(JSON.stringify(legal));
