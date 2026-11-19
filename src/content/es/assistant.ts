import type { AssistantContent } from '../types';
import { meta } from './meta';

export const assistant: AssistantContent = {
  kicker: 'Demo en vivo · Soluciones con IA',
  title: 'Pregúntame sobre mis servicios.',
  intro:
    'Un asistente de IA que responde solo con lo que cuenta esta web: servicios, forma de trabajar, el caso de Píxel y Papel y las preguntas frecuentes. Es un ejemplo pequeño de lo que puedo construir para tu negocio.',
  suggestions: {
    label: 'Prueba con una de estas preguntas',
    items: [
      '¿Qué tipo de proyectos con IA puedes hacer para mi empresa?',
      '¿Cómo es el proceso de trabajo contigo?',
      '¿Qué hiciste en Píxel y Papel?',
    ],
  },
  form: {
    label: 'Tu pregunta',
    placeholder: 'Por ejemplo: ¿trabajas en remoto?',
    help: 'Hasta 500 caracteres. No incluyas datos personales.',
    submit: 'Preguntar',
    stop: 'Detener',
    reset: 'Nueva conversación',
  },
  conversation: {
    label: 'Conversación con el asistente',
    you: 'Tú',
    assistant: 'Asistente',
    thinking: 'El asistente está escribiendo…',
    truncated: '(Respuesta recortada por longitud.)',
    stopped: '(Respuesta detenida.)',
  },
  limitReached:
    'Has llegado al máximo de preguntas de esta conversación. Empieza una nueva o, mejor aún, cuéntame tu proyecto directamente.',
  disclaimer:
    'Las respuestas las genera una IA a partir del contenido de esta web y pueden contener errores. Para cualquier compromiso, escríbeme.',
  contact: { label: '¿Prefieres hablar conmigo? Cuéntame tu proyecto', href: meta.routes.contact },
  errors: {
    unavailable:
      'El asistente no está disponible temporalmente. Puedes escribirme desde el formulario de contacto y te respondo personalmente.',
    rateLimited:
      'Has hecho muchas preguntas en poco tiempo. Espera unos minutos o escríbeme desde el formulario de contacto.',
    busy: 'El asistente está saturado ahora mismo. Inténtalo de nuevo en un momento.',
    refusal:
      'Prefiero no responder a eso. Pregúntame por mis servicios, mi forma de trabajar o el caso de Píxel y Papel.',
    invalid: 'Escribe una pregunta de hasta 500 caracteres.',
    generic:
      'No he podido responder. Inténtalo de nuevo o escríbeme desde el formulario de contacto.',
  },
};
