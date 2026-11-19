import type { AboutContent } from '../types';
import { meta } from './meta';

export const about: AboutContent = {
  meta: {
    title: 'Sobre mí · Pablo Jordá, desarrollador full-stack',
    description:
      'Desarrollador full-stack potenciado por IA en Valencia, con más de 7 años en seguros, fintech y arquitectura. Cómo trabajo y qué me importa.',
  },
  hero: {
    kicker: 'Sobre mí',
    title: 'Hola, soy Pablo.',
    lead: 'Desarrollador full-stack potenciado por IA, en Valencia. Construyo webs, aplicaciones y productos digitales, y uso la IA en cada paso para entregarlos antes sin rebajar la calidad.',
  },
  avatarAlt: 'Retrato ilustrado de Pablo Jordá',
  intro: [
    'Llevo más de 7 años construyendo aplicaciones web de principio a fin: interfaces, APIs, bases de datos y la infraestructura que las mantiene en marcha.',
    'Hoy trabajo con empresas y emprendedores que tienen un problema concreto o una idea que llevar a producción. Tú pones el conocimiento de tu negocio; yo, la parte técnica completa.',
    'La IA es mi herramienta de trabajo diaria. Me ayuda a analizar, programar, probar y documentar mucho más rápido. Lo que no cambia es el criterio: cada decisión y cada línea entregada pasan por mi revisión.',
  ],
  profiles: { label: 'También me encuentras en' },
  experience: {
    title: 'Experiencia',
    text: 'He trabajado en sectores donde los errores cuestan caro y la calidad no es negociable:',
    sectors: [
      {
        title: 'Seguros',
        text: 'Aplicaciones con reglas de negocio complejas, muchos datos y usuarios que dependen de ellas a diario.',
      },
      {
        title: 'Fintech y blockchain',
        text: 'Productos financieros donde la seguridad, la trazabilidad y la fiabilidad son el punto de partida.',
      },
      {
        title: 'Software de arquitectura',
        text: 'Herramientas técnicas para profesionales exigentes, con interfaces ricas y mucho detalle.',
      },
    ],
  },
  specialties: {
    title: 'Especialidades',
    items: [
      'Desarrollo full-stack con React, Next.js, TypeScript y Node.js',
      'Desarrollo potenciado por IA, con revisión humana en cada entrega',
      'Productos SaaS y MVPs: cuentas, pagos y paneles de administración',
      'Rendimiento web y SEO técnico',
      'Accesibilidad y diseño de interfaces',
    ],
  },
  quality: {
    title: 'Cómo trabajo',
    intro: 'Ir rápido solo sirve si lo que se entrega aguanta. Por eso hay cosas que no negocio:',
    items: [
      {
        title: 'Tests',
        text: 'Pruebas automáticas en lo que importa, para cambiar el código sin miedo.',
      },
      {
        title: 'Accesibilidad',
        text: 'Interfaces que funcionan con teclado y lector de pantalla, con contraste suficiente.',
      },
      {
        title: 'Rendimiento',
        text: 'Páginas que cargan rápido en cualquier móvil, medidas con datos reales.',
      },
      {
        title: 'Seguridad',
        text: 'Buenas prácticas desde el diseño: datos protegidos, dependencias al día y cabeceras seguras.',
      },
    ],
  },
  working: {
    title: 'Trabajemos juntos',
    items: [
      'En remoto, desde Valencia, con clientes de cualquier lugar',
      'En español y en inglés',
      'Comunicación directa conmigo, sin intermediarios',
      'Avances visibles cada semana',
    ],
  },
  cta: {
    title: '¿Te encaja mi forma de trabajar?',
    text: 'Cuéntame tu proyecto y vemos juntos cómo abordarlo.',
    cta: { label: 'Escríbeme', href: meta.routes.contact },
  },
};
