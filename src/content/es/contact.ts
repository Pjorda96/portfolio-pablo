import { owner } from '../owner';
import type { ContactContent } from '../types';
import { meta } from './meta';

const CONTACT_EMAIL = owner.email;

export const contact: ContactContent = {
  meta: {
    title: 'Contacto · Cuéntame tu proyecto · Pablo Jordá',
    description:
      'Cuéntame tu proyecto web, tu idea de producto o el problema que quieres resolver. Te respondo personalmente con los siguientes pasos.',
  },
  hero: {
    kicker: 'Contacto',
    title: 'Cuéntame tu proyecto.',
    lead: 'Unas líneas bastan: qué necesitas, en qué punto estás y qué te gustaría conseguir. Te respondo personalmente, no un sistema automático.',
  },
  nextSteps: {
    title: 'Qué pasa después',
    items: [
      'Leo tu mensaje y te respondo personalmente.',
      'Si encaja, concertamos una primera conversación sin compromiso.',
      'Te envío una propuesta con alcance, plazos y entregas por escrito.',
    ],
  },
  form: {
    title: 'Formulario de contacto',
    requiredHint: 'Los campos marcados con * son obligatorios.',
    optional: '(opcional)',
    fields: {
      name: {
        label: 'Nombre',
        placeholder: 'Tu nombre',
        help: '',
      },
      email: {
        label: 'Correo electrónico',
        placeholder: 'tu@empresa.com',
        help: 'Solo lo uso para responderte.',
      },
      company: {
        label: 'Empresa o proyecto',
        placeholder: 'Nombre de tu empresa o proyecto',
        help: '',
      },
      service: {
        label: '¿Qué necesitas?',
        placeholder: 'Elige una opción',
        help: 'Si no lo tienes claro, elige «Otra cosa» y lo vemos juntos.',
        options: {
          web: 'Desarrollo web a medida',
          ai: 'Soluciones con IA',
          apps: 'Apps, SaaS y MVPs',
          other: 'Otra cosa',
        },
      },
      message: {
        label: 'Tu proyecto',
        placeholder: 'Qué necesitas, en qué punto estás y qué te gustaría conseguir.',
        help: 'Entre 20 y 5000 caracteres. No hace falta que sea técnico.',
      },
      privacy: {
        label: 'He leído y acepto la política de privacidad.',
        linkLabel: 'Leer la política de privacidad',
      },
    },
    submit: 'Enviar mensaje',
    sending: 'Enviando…',
    success: {
      title: 'Mensaje enviado. ¡Gracias!',
      text: 'Lo he recibido y te responderé personalmente en cuanto lo lea.',
    },
    errors: {
      nameRequired: 'Escribe tu nombre.',
      emailRequired: 'Escribe tu correo electrónico.',
      emailInvalid: 'Revisa el correo: parece que falta algo, como la @ o el dominio.',
      serviceRequired: 'Elige qué necesitas, aunque sea «Otra cosa».',
      messageTooShort: 'Cuéntame un poco más: al menos 20 caracteres.',
      messageTooLong: 'El mensaje es demasiado largo: máximo 5000 caracteres.',
      privacyRequired: 'Necesito que aceptes la política de privacidad para poder responderte.',
      rateLimited:
        'Has enviado varios mensajes seguidos. Espera unos minutos y vuelve a intentarlo.',
      spam: 'No he podido verificar el envío. Recarga la página y vuelve a intentarlo.',
      generic: `No se ha podido enviar el mensaje. Inténtalo de nuevo en unos minutos o escríbeme a ${CONTACT_EMAIL}.`,
    },
  },
  privacyNotice: {
    title: 'Información básica sobre protección de datos',
    items: [
      { label: 'Responsable', text: 'Pablo Jordá.' },
      {
        label: 'Finalidad',
        text: 'Responder a tu mensaje y, si lo pides, enviarte una propuesta.',
      },
      {
        label: 'Legitimación',
        text: 'Tu consentimiento y la aplicación de medidas precontractuales.',
      },
      {
        label: 'Destinatarios',
        text: 'Resend (envío de correo) y Vercel (alojamiento), que pueden tratar datos fuera de la UE con las garantías del RGPD.',
      },
      {
        label: 'Derechos',
        text: `Acceso, rectificación, supresión, oposición, limitación y portabilidad, escribiendo a ${CONTACT_EMAIL}.`,
      },
    ],
    link: { label: 'Política de privacidad completa', href: meta.routes.legal.privacy },
  },
};
