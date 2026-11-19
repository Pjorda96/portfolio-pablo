import { content as en } from './en';
import { content as es } from './es';
import {
  LOCALES,
  type FaqId,
  type IdentifiedFaqItem,
  type Locale,
  type ServiceContent,
  type ServiceId,
  type SiteContent,
} from './types';

export * from './types';
export { owner } from './owner';

const contents: Record<Locale, SiteContent> = { es, en };

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

/** All the copy of the site in one locale. */
export const getContent = (locale: Locale): SiteContent => contents[locale];

export const getService = (locale: Locale, id: ServiceId): ServiceContent => {
  const service = contents[locale].services.items.find((s) => s.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
};

/** FAQ items in the given order, e.g. for the home teaser. */
export const getFaqItems = (locale: Locale, ids: readonly FaqId[]): IdentifiedFaqItem[] =>
  ids.map((id) => {
    const item = contents[locale].faq.items.find((f) => f.id === id);
    if (!item) throw new Error(`Unknown FAQ item: ${id}`);
    return item;
  });
