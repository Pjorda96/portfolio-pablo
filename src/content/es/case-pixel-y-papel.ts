import type { CaseStudyContent } from '../types';
import { meta } from './meta';

/*
 * Case study approved by the Píxel y Papel partners as written: qualitative,
 * Pablo as co-founder and technical lead of a four-partner project, never as
 * sole owner. No figures and no screenshots yet: add them only if the
 * partners provide them (see docs/CONTENIDO.md).
 */
export const casePixelYPapel: CaseStudyContent = {
  meta: {
    title: 'Píxel y Papel: caso de estudio · Pablo Jordá',
    description:
      'Webs de boda con confirmación de asistencia, en producción desde 2024. Cómo construí la plataforma como cofundador y responsable técnico.',
  },
  hero: {
    kicker: 'Caso de estudio',
    title: 'Píxel y Papel',
    lead: 'Invitaciones digitales y webs de boda con confirmación de asistencia. Un proyecto de cuatro socios, en producción desde 2024, en el que soy cofundador y responsable técnico.',
  },
  summary:
    'Webs de boda con confirmación de asistencia, en producción desde 2024. Un proyecto de cuatro socios en el que llevo toda la parte técnica.',
  facts: [
    { label: 'Proyecto', value: 'Invitaciones digitales y webs de evento' },
    { label: 'Mi papel', value: 'Cofundador y responsable técnico' },
    { label: 'Equipo', value: 'Cuatro socios' },
    { label: 'Estado', value: 'En producción desde 2024' },
  ],
  context: {
    title: 'Contexto',
    paragraphs: [
      'Píxel y Papel nace de cuatro socios con una idea común: que cada pareja tenga una web de boda cuidada, con su propia invitación digital y una forma sencilla de saber quién viene.',
      'El proyecto une diseño, atención a las parejas y tecnología. Mi parte, como cofundador, es la tecnología: decidir cómo se construye, construirlo y mantenerlo en marcha.',
    ],
  },
  challenge: {
    title: 'El reto',
    paragraphs: [
      'Cada boda es distinta, pero el producto tenía que ser uno. Había que dar a cada pareja una web propia y personalizada sin convertir cada encargo en un desarrollo nuevo.',
    ],
    items: [
      'Webs únicas para cada evento, con su diseño y sus textos, sobre una sola plataforma.',
      'Confirmación de asistencia fácil para invitados de todas las edades, desde el móvil.',
      'Un panel para gestionar invitados y respuestas sin depender de nadie.',
      'Varios idiomas, buen rendimiento y una base fiable para un día que no se repite.',
    ],
  },
  solution: {
    title: 'La solución',
    paragraphs: [
      'Diseñé y construí dos piezas que trabajan juntas: la web comercial, que presenta el servicio, y la plataforma que da vida a cada evento.',
    ],
    items: [
      {
        title: 'Una web por evento',
        text: 'Cada evento tiene su propia dirección y su propia web, generada desde la misma plataforma y personalizada con su diseño y su contenido.',
      },
      {
        title: 'Confirmación de asistencia',
        text: 'Los invitados responden en unos pocos pasos desde cualquier dispositivo, sin crear cuentas.',
      },
      {
        title: 'Panel de gestión',
        text: 'Lista de invitados, respuestas y detalles del evento en un mismo lugar.',
      },
      {
        title: 'Base técnica sólida',
        text: 'Next.js y TypeScript, varios idiomas, base de datos gestionada y despliegue automático, con atención al rendimiento y la accesibilidad.',
      },
    ],
  },
  role: {
    title: 'Mi papel',
    paragraphs: [
      'Soy uno de los cuatro socios fundadores y el responsable técnico del proyecto. Me encargo de la arquitectura, el desarrollo de la web comercial y de la plataforma, la infraestructura y el mantenimiento.',
      'El producto es de los cuatro: las decisiones de negocio, el diseño y la relación con las parejas se trabajan en equipo. Mi aportación es que la tecnología esté a la altura de ese trabajo.',
    ],
  },
  result: {
    title: 'El resultado',
    paragraphs: [
      'Píxel y Papel está en producción desde 2024 y acompaña a parejas reales en uno de los días más importantes de su vida.',
      'La plataforma permite crear cada nueva web de evento sin empezar de cero, y la base técnica nos deja seguir añadiendo funciones y tipos de evento con tranquilidad.',
    ],
  },
  stack: {
    title: 'Tecnología',
    items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'next-intl', 'PostgreSQL', 'Vercel'],
  },
  link: { label: 'Visitar Píxel y Papel', href: 'https://www.pixelypapel.com/' },
  cta: {
    title: '¿Tienes un producto en mente?',
    text: 'Puedo ayudarte a llevarlo a producción con la misma base técnica. Cuéntame tu idea.',
    cta: { label: 'Cuéntame tu proyecto', href: meta.routes.contact },
  },
};
