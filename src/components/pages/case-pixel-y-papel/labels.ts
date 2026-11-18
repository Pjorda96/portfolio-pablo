import type { Locale } from '@/content';

/** Interface strings of the case study template that the content tree does not carry. */
export const caseLabels: Record<Locale, { newTab: string; gallery: string }> = {
  es: { newTab: '(se abre en una pestaña nueva)', gallery: 'Galería' },
  en: { newTab: '(opens in a new tab)', gallery: 'Gallery' },
};
