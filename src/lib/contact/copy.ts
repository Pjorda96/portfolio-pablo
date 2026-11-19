import { contactFormUi as en } from '@/content/en/contact';
import { contactFormUi as es, type ContactFormUi } from '@/content/es/contact';
import type { Locale } from '@/content/types';

const copy: Record<Locale, ContactFormUi> = { es, en };

/** Contact form interface copy that `ContactContent` does not hold yet. */
export const getContactFormUi = (locale: Locale): ContactFormUi => copy[locale];
