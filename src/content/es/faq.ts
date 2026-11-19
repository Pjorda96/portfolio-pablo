import type { FaqContent } from '../types';
import { meta } from './meta';

/** Answers are plain text so they can feed `FAQPage` JSON-LD unchanged. */
export const faq: FaqContent = {
  meta: {
    title: 'Preguntas frecuentes · Pablo Jordá',
    description:
      'Plazos, proceso, mantenimiento, comunicación, propiedad del código y trabajo en remoto: respuestas claras antes de empezar tu proyecto web.',
  },
  hero: {
    kicker: 'Preguntas frecuentes',
    title: 'Antes de empezar',
    lead: 'Las dudas más habituales sobre cómo trabajo. Si la tuya no está, pregúntamela directamente.',
  },
  items: [
    {
      id: 'plazos',
      question: '¿Cuánto tarda un proyecto?',
      answer:
        'Depende del alcance. Una web a medida suele estar en producción en pocas semanas y un MVP en semanas, no en meses. Tras la primera conversación te doy un plazo concreto por escrito.',
    },
    {
      id: 'proceso',
      question: '¿Cómo es el proceso de trabajo?',
      answer:
        'Cuatro pasos: hablamos de tu proyecto, te envío una propuesta con alcance, plazos y entregas, construyo con entregas frecuentes que puedes ver y probar, y lo publicamos con seguimiento posterior.',
    },
    {
      id: 'ia',
      question: '¿Qué significa que trabajes potenciado por IA?',
      answer:
        'Que uso la IA como herramienta en cada fase: análisis, código, pruebas y documentación. Me permite entregar antes. Las decisiones y la revisión final son siempre mías, con el mismo nivel de calidad.',
    },
    {
      id: 'comunicacion',
      question: '¿Cómo nos comunicamos durante el proyecto?',
      answer:
        'Directamente conmigo. Acordamos un canal, normalmente correo y videollamadas puntuales, y recibes avances cada semana en una URL de pruebas donde puedes ver el trabajo real.',
    },
    {
      id: 'remoto',
      question: '¿Trabajas en remoto?',
      answer:
        'Sí. Trabajo desde Valencia con clientes de cualquier lugar, en español o en inglés. Si estás cerca y lo prefieres, podemos vernos en persona en algún momento clave.',
    },
    {
      id: 'propiedad',
      question: '¿De quién es el código?',
      answer:
        'Tuyo. Al terminar, el código, el repositorio, el dominio y los servicios quedan a tu nombre, con documentación para que cualquier desarrollador pueda continuarlo.',
    },
    {
      id: 'mantenimiento',
      question: '¿Qué pasa después del lanzamiento?',
      answer:
        'Te acompaño en las semanas siguientes para resolver cualquier ajuste. Si quieres, acordamos un mantenimiento continuo: actualizaciones, seguridad, mejoras y nuevas funciones.',
    },
    {
      id: 'proyecto-existente',
      question: '¿Puedes trabajar sobre un proyecto que ya existe?',
      answer:
        'Sí. Empiezo revisando el código y la infraestructura, te cuento qué está bien, qué conviene mejorar y qué riesgos hay, y a partir de ahí decidimos cómo seguir.',
    },
    {
      id: 'primer-paso',
      question: '¿Cuál es el primer paso?',
      answer:
        'Rellenar el formulario de contacto con unas líneas sobre tu proyecto o tu problema. Te respondo personalmente para concertar una primera conversación, sin compromiso.',
    },
  ],
  cta: {
    title: '¿Te queda alguna duda?',
    text: 'Pregúntamela directamente. Te respondo yo, no un sistema automático.',
    cta: { label: 'Escríbeme', href: meta.routes.contact },
  },
};
