/**
 * Every user-facing string of the home page lives here, so the copy can be
 * extracted into next-intl message files later without hunting through
 * components. Spanish only for now.
 */

export const PLACE_IDS = ['taller', 'lab', 'puerto', 'mercado', 'torre', 'faro'] as const;

/** Internal id of a clickable landmark in the city. */
export type PlaceId = (typeof PLACE_IDS)[number];

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
  name: 'Pablo Jordá',
  domain: 'pablojorda.es',
  coordinates: '39.4699° N · 0.3763° W · Valencia',
  skipLink: 'Saltar a los lugares',
  footer: 'Hecho a mano en Valencia.',
  avatarAlt: 'Retrato ilustrado de Pablo Jordá',
} as const;

export const hero = {
  kicker: 'Desarrollo web · IA · Producto',
  title: 'Una ciudad de cosas bien construidas.',
  lead: 'Soy Pablo Jordá, desarrollador full-stack potenciado por IA en Valencia. Cada edificio de esta ciudad es algo que puedo construir contigo.',
  hint: 'Pulsa un edificio o elige un lugar abajo · arrastra la hora',
} as const;

export const placesSection = {
  title: 'Lugares de la ciudad',
  intro:
    'Seis lugares de Valencia, seis formas de trabajar juntos: desarrollo web, inteligencia artificial y producto digital.',
} as const;

export const places: readonly Place[] = [
  {
    id: 'taller',
    slug: 'desarrollo-web',
    landmark: 'La Lonja',
    short: 'Web a medida',
    title: 'Desarrollo web a medida',
    text: 'Webs y aplicaciones con Next.js y React hechas a mano: rápidas, accesibles y preparadas para posicionar en Google desde el primer día.',
    points: [
      'Webs corporativas y landings que convierten',
      'Aplicaciones web y paneles internos',
      'SEO técnico y Core Web Vitals en verde',
    ],
  },
  {
    id: 'lab',
    slug: 'soluciones-ia',
    landmark: 'La Ciudad de las Ciencias',
    short: 'Soluciones con IA',
    title: 'Soluciones con IA',
    text: 'Tú me cuentas el problema; yo lo resuelvo apoyándome en la IA. La uso en cada paso, del análisis a la entrega, para llegar antes a una solución sólida y hecha a la medida de tu negocio.',
    points: [
      'Del problema a la solución en mucho menos tiempo',
      'La IA trabaja para mí; tú recibes el resultado',
      'Misma exigencia de calidad, revisada por una persona',
    ],
  },
  {
    id: 'puerto',
    slug: 'apps-saas-mvp',
    landmark: 'La Marina',
    short: 'Apps, SaaS y MVPs',
    title: 'Apps, SaaS y MVPs',
    text: 'De aquí zarpan productos: de la idea a una primera versión en producción, con la base lista para crecer.',
    points: [
      'MVPs en semanas, no en meses',
      'Cuentas, pagos y panel de administración',
      'Web y app móvil sobre la misma API',
    ],
  },
  {
    id: 'mercado',
    slug: 'proyectos',
    landmark: 'El Mercado Central',
    short: 'Proyectos',
    title: 'Proyectos',
    text: 'Productos reales con clientes reales. Píxel y Papel, un proyecto de cuatro socios: webs de boda con confirmación de asistencia, en producción desde 2024.',
    points: [
      'Píxel y Papel · cofundador y responsable técnico',
      'Caso de estudio completo, próximamente',
    ],
  },
  {
    id: 'torre',
    slug: 'sobre-mi',
    landmark: 'El Micalet',
    short: 'Sobre mí',
    title: 'Sobre mí',
    text: 'Desarrollador full-stack potenciado por IA, con más de 7 años construyendo aplicaciones web para seguros, fintech y arquitectura. Hoy uso la IA en cada fase del trabajo para entregar antes sin rebajar la calidad.',
    points: [
      'Desarrollo potenciado por IA: más rápido, igual de riguroso',
      'React, Next.js, TypeScript y Node.js',
      'Calidad medible: tests, accesibilidad y rendimiento',
      'En remoto, en español e inglés',
    ],
  },
  {
    id: 'faro',
    slug: 'contacto',
    landmark: 'El Faro',
    short: 'Contacto',
    title: 'Contacto',
    text: '¿Tienes un proyecto en mente? Cuéntamelo y te respondo con una propuesta concreta.',
    points: ['Formulario breve, sin compromiso', 'Respuesta personal, no automática'],
  },
];

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
