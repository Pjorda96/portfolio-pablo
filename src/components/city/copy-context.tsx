'use client';

import { createContext, useContext } from 'react';

import type { CityCopy, Place, PlaceId } from '@/content/site';

const CityCopyContext = createContext<CityCopy | null>(null);

export const CityCopyProvider = CityCopyContext.Provider;

/** Copy of the city in the page's locale, provided by `CityExperience`. */
export function useCityCopy(): CityCopy {
  const copy = useContext(CityCopyContext);
  if (!copy) throw new Error('useCityCopy must be used inside <CityExperience>');
  return copy;
}

// Helpers live here, not in `@/content/site`: importing that module at runtime
// would pull every locale's content into the client bundle.

export const placeIn = (copy: CityCopy, id: PlaceId): Place => {
  const place = copy.places.find((p) => p.id === id);
  if (!place) throw new Error(`Unknown place: ${id}`);
  return place;
};

/** Fills `{landmark}` and `{title}` in the live-region template. */
export const announcePlace = (template: string, place: Place): string =>
  template.replace('{landmark}', place.landmark).replace('{title}', place.title);
