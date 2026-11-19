import type { Locale } from '@/content';

/**
 * Interface strings of the service template that the content trees do not
 * carry (they hold the copy of each service, not the template's chrome).
 */
export const serviceLabels: Record<
  Locale,
  { city: string; related: string; relatedIntro: string; relatedLink: string }
> = {
  es: {
    city: 'Valencia',
    related: 'Otros servicios',
    relatedIntro: 'Otras formas de trabajar juntos, con la misma forma de hacer las cosas.',
    relatedLink: 'Ver servicio',
  },
  en: {
    city: 'Valencia',
    related: 'Other services',
    relatedIntro: 'Other ways to work together, built with the same care.',
    relatedLink: 'See service',
  },
};
