import type { HomeContent } from '../types';
import { meta } from './meta';
import { serviceById } from './services';

const { routes } = meta;
const web = serviceById('web');
const ai = serviceById('ai');
const apps = serviceById('apps');

export const home: HomeContent = {
  meta: {
    title: 'Pablo Jordá · Desarrollador web freelance en Valencia',
    description:
      'Desarrollador full-stack potenciado por IA en Valencia: desarrollo web a medida, soluciones con IA y MVPs con Next.js. Cuéntame tu proyecto.',
  },
  hero: {
    kicker: 'Desarrollo web · IA · Producto',
    title: 'Una ciudad de cosas bien construidas.',
    lead: 'Soy Pablo Jordá, desarrollador full-stack potenciado por IA en Valencia. Cada edificio de esta ciudad es algo que puedo construir contigo.',
    hint: 'Pulsa un edificio o elige un lugar abajo · arrastra la hora',
    cta: { label: 'Cuéntame tu proyecto', href: routes.contact },
  },
  city: {
    title: 'Lugares de la ciudad',
    intro:
      'Seis lugares de Valencia, seis formas de trabajar juntos: desarrollo web, inteligencia artificial y producto digital.',
    places: {
      taller: {
        landmark: 'La Lonja',
        short: 'Web a medida',
        title: web.name,
        text: web.summary.text,
        points: web.summary.points,
      },
      lab: {
        landmark: 'La Ciudad de las Ciencias',
        short: ai.name,
        title: ai.name,
        text: ai.summary.text,
        points: ai.summary.points,
      },
      puerto: {
        landmark: 'La Marina',
        short: apps.name,
        title: apps.name,
        // The harbour keeps its own line: products set sail from here.
        text: 'De aquí zarpan productos: de la idea a una primera versión en producción, con la base lista para crecer.',
        points: apps.summary.points,
      },
      mercado: {
        landmark: 'El Mercado Central',
        short: 'Proyectos',
        title: 'Proyectos',
        text: 'Productos reales con clientes reales. Píxel y Papel, un proyecto de cuatro socios: webs de boda con confirmación de asistencia, en producción desde 2024.',
        points: [
          'Píxel y Papel · cofundador y responsable técnico',
          'Caso de estudio: contexto, reto y solución',
        ],
      },
      torre: {
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
      faro: {
        landmark: 'El Faro',
        short: 'Contacto',
        title: 'Contacto',
        text: '¿Tienes un proyecto en mente? Cuéntamelo y te respondo con una propuesta concreta.',
        points: ['Formulario breve, sin compromiso', 'Respuesta personal, no automática'],
      },
    },
    anchors: {
      taller: 'desarrollo-web',
      lab: 'soluciones-ia',
      puerto: 'apps-saas-mvp',
      mercado: 'proyectos',
      torre: 'sobre-mi',
      faro: 'contacto',
    },
    ui: {
      skipLink: 'Saltar a los lugares',
      coordinates: '39.4699° N · 0.3763° W · Valencia',
      stageLabel: 'La ciudad',
      dockLabel: 'Lugares de la ciudad',
      clock: {
        label: 'Hora de la ciudad',
        slider: 'Hora del día en la ciudad',
        toggle: 'Cambiar la hora de la ciudad',
        real: 'Hora real',
        play: 'Ver un día entero',
        modes: { real: 'tu hora', play: 'un día en 24 s', manual: 'hora elegida' },
        placeholder: '--:--',
      },
      sheet: {
        cta: 'Cuéntame tu proyecto',
        contactCta: 'Escribirme',
        back: 'Volver a la ciudad',
        announce: '{landmark}: {title}',
      },
      scrollCue: 'Descubre todo lo que hago',
      noWebgl:
        'Tu navegador no puede mostrar la escena 3D. Usa los lugares de abajo para recorrer la ciudad.',
    },
  },
  value: {
    title: 'Lo que construyo, bien construido',
    text: 'Desarrollo web a medida, soluciones con IA y productos digitales para empresas y emprendedores. Trabajo con la IA en cada paso para llegar antes, y reviso cada entrega como si fuera a mantenerla yo durante años.',
    points: [
      {
        title: 'Más rápido',
        text: 'La IA acelera el análisis, el código y las pruebas. Tú ves resultados antes.',
      },
      {
        title: 'Igual de riguroso',
        text: 'Tests, accesibilidad, rendimiento y seguridad. Criterio humano en cada decisión.',
      },
      {
        title: 'Directo conmigo',
        text: 'Hablas con quien construye. Sin intermediarios ni cadenas de correos.',
      },
    ],
  },
  services: {
    title: 'Servicios',
    intro: 'Tres formas de trabajar juntos, según en qué punto esté tu proyecto.',
    linkLabel: 'Ver el servicio',
  },
  featuredCase: {
    kicker: 'Caso destacado',
    title: 'Píxel y Papel',
    text: 'Webs de boda con confirmación de asistencia, en producción desde 2024. Un proyecto de cuatro socios en el que llevo toda la parte técnica.',
    role: 'Cofundador y responsable técnico',
    link: { label: 'Leer el caso', href: routes.casePixelYPapel },
  },
  process: {
    title: 'Cómo trabajamos',
    intro: 'Un proceso corto y claro, el mismo para una web que para un producto completo.',
    steps: [
      {
        title: 'Hablamos',
        text: 'Me cuentas tu proyecto o tu problema. Pregunto, escucho y te digo con sinceridad si encajo.',
      },
      {
        title: 'Propuesta',
        text: 'Alcance, plazos y entregas por escrito. Sabes qué vas a recibir antes de empezar.',
      },
      {
        title: 'Construcción',
        text: 'Entregas frecuentes que puedes ver y probar. La IA me ayuda a avanzar rápido; la revisión es mía.',
      },
      {
        title: 'Lanzamiento y seguimiento',
        text: 'Lo publico, compruebo que todo responde y sigo a tu lado en las semanas siguientes.',
      },
    ],
  },
  capabilities: {
    title: 'Capacidades',
    intro: 'Herramientas probadas en producción, elegidas por lo que aportan a tu proyecto.',
    groups: [
      {
        title: 'Frontend',
        items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Animación y WebGL'],
      },
      {
        title: 'Backend y datos',
        items: ['Node.js', 'APIs REST', 'PostgreSQL', 'Autenticación y pagos', 'Integraciones'],
      },
      {
        title: 'IA aplicada',
        items: [
          'Desarrollo asistido por IA',
          'Integración de modelos de lenguaje',
          'Procesado de documentos y datos',
        ],
      },
      {
        title: 'Calidad',
        items: [
          'Tests automáticos',
          'Accesibilidad (WCAG)',
          'Core Web Vitals',
          'SEO técnico',
          'Seguridad',
        ],
      },
    ],
  },
  faqTeaser: {
    title: 'Preguntas frecuentes',
    intro: 'Lo que suele preguntarse antes de empezar.',
    ids: ['plazos', 'ia', 'propiedad', 'mantenimiento'],
    link: { label: 'Ver todas las preguntas', href: routes.faq },
  },
  finalCta: {
    title: '¿Construimos algo juntos?',
    text: 'Cuéntame qué tienes en mente. Te respondo personalmente con una propuesta concreta.',
    cta: { label: 'Cuéntame tu proyecto', href: routes.contact },
  },
};
