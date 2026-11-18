import type { PlaceId, ServiceId } from '@/content';

/** The landmark that stands for each service in the home city (F1). */
export const SERVICE_PLACE = {
  web: 'taller',
  ai: 'lab',
  apps: 'puerto',
} as const satisfies Record<ServiceId, PlaceId>;

/** Battlements along the top of La Lonja's hall, from x0 to x1 at height y. */
const merlons = (x0: number, x1: number, y: number) => {
  let d = '';
  for (let x = x0; x + 5 <= x1; x += 9) d += `M${x} ${y}h5v-5h-5z`;
  return d;
};

/**
 * Flat silhouettes of the three service landmarks, drawn like the skyline of
 * the city fallback: the building in the text colour, its lit windows in the
 * accent. Purely decorative (`aria-hidden`): the landmark name is always
 * written next to it.
 */
const SHAPES: Record<ServiceId, { body: string; lights: string }> = {
  // La Lonja de la Seda: the crenellated tower and the long gothic hall.
  web: {
    body: `M6 60V12h4V7h5v5h4V7h5v5h4V7h5v5h3v48zM36 60V30h112v30z${merlons(38, 148, 30)}M0 60h154v4H0z`,
    lights:
      'M14 22h4v8h-4zM24 22h4v8h-4zM18 42h6v10h-6zM86 60V48l6-9 6 9v12zM56 38h4v8h-4zM120 38h4v8h-4z',
  },
  // Ciutat de les Arts i les Ciències: the Hemisfèric's eye and the Palau's crest.
  ai: {
    body: 'M8 60c16-26 74-26 90 0zM100 60c-6-30 14-50 46-54-18 14-28 32-26 54zM0 60h154v4H0z',
    lights: 'M46 54a7 7 0 1 0 14 0a7 7 0 1 0-14 0z',
  },
  // La Marina: Veles e Vents' stacked decks on the quay and a sailboat.
  apps: {
    body: 'M22 52h74v-6H22zM14 40h90v-6H14zM22 28h74v-6H22zM32 16h54v-6H32zM30 60V52h4v8zM84 60V52h4v8zM0 60h112v4H0z',
    lights: 'M30 42v-2h58v2zM38 30v-2h42v2zM122 54l13-38v38zM138 54V22l12 32zM116 56h40l-5 6h-30z',
  },
};

export function LandmarkSilhouette({
  service,
  className,
}: {
  service: ServiceId;
  className?: string;
}) {
  const { body, lights } = SHAPES[service];
  return (
    <svg viewBox="0 0 156 64" aria-hidden="true" focusable="false" className={className}>
      <path d={body} className="fill-current" />
      <path d={lights} className="fill-accent" />
    </svg>
  );
}
