/**
 * Strings of the F1 home (the city). The copy itself lives in the Spanish
 * content tree (`src/content/es/`), the single source of truth shared with the
 * future pages; this module only adapts it to the shape the city components
 * use. The city's own interface strings (`ui`) stay here until F3 localises
 * the home.
 */

import { content as es } from './es';
import { PLACE_IDS, type PlaceId } from './types';

export { PLACE_IDS, type PlaceId };

export interface Place {
  id: PlaceId;
  /** Fragment id of the place's section on the page. */
  slug: string;
  /** The landmark that stands for the section in the city. */
  landmark: string;
  /** Section name: the label of the dock button and the pin. */
  short: string;
  /** What the section is about; the article heading. */
  title: string;
  text: string;
  points: readonly string[];
}

export const site = {
  name: es.meta.siteName,
  domain: 'pablojorda.es',
  coordinates: '39.4699° N · 0.3763° W · Valencia',
  skipLink: 'Saltar a los lugares',
  footer: es.meta.footer.tagline,
  avatarAlt: es.about.avatarAlt,
} as const;

export const hero = {
  kicker: es.home.hero.kicker,
  title: es.home.hero.title,
  lead: es.home.hero.lead,
  hint: es.home.hero.hint,
} as const;

export const placesSection = {
  title: es.home.city.title,
  intro: es.home.city.intro,
} as const;

/** Fragment ids of the places' sections on the home page. */
const PLACE_SLUGS: Record<PlaceId, string> = {
  taller: 'desarrollo-web',
  lab: 'soluciones-ia',
  puerto: 'apps-saas-mvp',
  mercado: 'proyectos',
  torre: 'sobre-mi',
  faro: 'contacto',
};

export const places: readonly Place[] = PLACE_IDS.map((id) => ({
  id,
  slug: PLACE_SLUGS[id],
  ...es.home.city.places[id],
}));

export const ui = {
  stageLabel: 'La ciudad',
  dockLabel: 'Lugares de la ciudad',
  clock: {
    label: 'Hora de la ciudad',
    slider: 'Hora del día en la ciudad',
    real: 'Hora real',
    play: 'Ver un día entero',
    modes: { real: 'tu hora', play: 'un día en 24 s', manual: 'hora elegida' },
    placeholder: '--:--',
  },
  sheet: {
    cta: 'Cuéntame tu proyecto',
    contactCta: 'Escribirme',
    back: 'Volver a la ciudad',
    announce: (landmark: string, title: string) => `${landmark}: ${title}`,
  },
  placeLink: 'Ver en la ciudad',
  scrollCue: 'Descubre todo lo que hago',
  noWebgl:
    'Tu navegador no puede mostrar la escena 3D. Usa los lugares de abajo para recorrer la ciudad.',
} as const;

export const placeById = (id: PlaceId): Place => {
  const place = places.find((p) => p.id === id);
  if (!place) throw new Error(`Unknown place: ${id}`);
  return place;
};
