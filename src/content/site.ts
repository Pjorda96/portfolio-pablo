/**
 * Copy of the home city, per locale. The text lives in the content trees
 * (`src/content/<locale>/home.ts`, `meta.ts`, `about.ts`); this module only
 * adapts it to the shape the city components use.
 *
 * `CityCopy` is plain, serializable data: the home page (a Server Component)
 * builds it with `getCityCopy(locale)` and hands it to the client city, so
 * the browser only receives the strings of the current locale.
 */

import { getContent } from './index';
import { PLACE_IDS, type CityUi, type Locale, type PlaceId } from './types';

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

export interface CityCopy {
  name: string;
  avatarAlt: string;
  hero: { kicker: string; title: string; lead: string; hint: string };
  placesSection: { title: string; intro: string };
  places: readonly Place[];
  ui: CityUi;
}

export function getCityCopy(locale: Locale): CityCopy {
  const c = getContent(locale);
  const { kicker, title, lead, hint } = c.home.hero;
  return {
    name: c.meta.siteName,
    avatarAlt: c.about.avatarAlt,
    hero: { kicker, title, lead, hint },
    placesSection: { title: c.home.city.title, intro: c.home.city.intro },
    places: PLACE_IDS.map((id) => ({
      id,
      slug: c.home.city.anchors[id],
      ...c.home.city.places[id],
    })),
    ui: c.home.city.ui,
  };
}
