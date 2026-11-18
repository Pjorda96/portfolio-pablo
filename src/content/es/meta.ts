import type { MetaContent } from '../types';

export const meta = {
  locale: 'es',
  htmlLang: 'es-ES',
  ogLocale: 'es_ES',
  siteName: 'Pablo Jordá',
  jobTitle: 'Desarrollador full-stack potenciado por IA',
  routes: {
    home: '/',
    services: {
      web: '/servicios/desarrollo-web-a-medida',
      ai: '/servicios/soluciones-ia',
      apps: '/servicios/apps-saas-mvp',
    },
    casePixelYPapel: '/proyectos/pixel-y-papel',
    about: '/sobre-mi',
    // Not in the PLAN.md sitemap yet: the full FAQ, fed to FAQPage JSON-LD.
    faq: '/preguntas-frecuentes',
    contact: '/contacto',
    legal: {
      notice: '/legal/aviso-legal',
      privacy: '/legal/privacidad',
      cookies: '/legal/cookies',
    },
  },
  nav: {
    label: 'Navegación principal',
    services: 'Servicios',
    projects: 'Proyectos',
    about: 'Sobre mí',
    faq: 'Preguntas frecuentes',
    contact: 'Contacto',
  },
  languageSwitch: { label: 'Cambiar idioma', target: 'English' },
  skipLink: 'Saltar al contenido',
  footer: {
    tagline: 'Hecho a mano en Valencia.',
    legalLabel: 'Información legal',
    notice: 'Aviso legal',
    privacy: 'Privacidad',
    cookies: 'Cookies',
  },
  notFound: {
    title: 'Página no encontrada · Pablo Jordá',
    description:
      'Esta calle no existe en la ciudad. Vuelve al inicio para ver servicios y proyectos.',
    text: 'Esta calle no existe en la ciudad. Puede que el enlace esté mal o que la página se haya movido.',
    back: 'Volver al inicio',
  },
} as const satisfies MetaContent;
