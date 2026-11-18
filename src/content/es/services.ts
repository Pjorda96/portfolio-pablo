import type { ServiceId, ServicesContent } from '../types';
import { meta } from './meta';

const { routes } = meta;

const contactCta = { label: 'Cuéntame tu proyecto', href: routes.contact };

export const services: ServicesContent = {
  title: 'Servicios',
  intro:
    'Tres formas de trabajar juntos. En todas, la IA es mi herramienta para llegar antes; el resultado lo reviso y lo firmo yo.',
  items: [
    /* ------------------------------------------------ desarrollo web a medida */
    {
      id: 'web',
      name: 'Desarrollo web a medida',
      href: routes.services.web,
      meta: {
        title: 'Desarrollo web a medida en Valencia · Pablo Jordá',
        description:
          'Webs y aplicaciones a medida con Next.js y React: rápidas, accesibles y listas para Google. Desarrollador web freelance en Valencia, en remoto.',
      },
      summary: {
        text: 'Webs y aplicaciones con Next.js y React hechas a mano: rápidas, accesibles y preparadas para posicionar en Google desde el primer día.',
        points: [
          'Webs corporativas y landings que convierten',
          'Aplicaciones web y paneles internos',
          'SEO técnico y Core Web Vitals en verde',
        ],
      },
      hero: {
        kicker: 'Desarrollo web a medida',
        title: 'Una web hecha para tu negocio, no adaptada de una plantilla.',
        lead: 'Diseño técnico, desarrollo y puesta en producción de webs y aplicaciones con Next.js, React y TypeScript. Rápidas, accesibles y fáciles de mantener.',
      },
      problem: {
        title: 'Cuándo tiene sentido',
        intro:
          'Una plantilla sirve hasta que deja de servir. Suele notarse en alguno de estos puntos:',
        items: [
          'Tu web tarda en cargar y Google no la muestra donde debería.',
          'Cada cambio pequeño depende de un plugin o de alguien que ya no está.',
          'Necesitas algo que ninguna plantilla hace: un área de clientes, un configurador, un panel interno.',
          'La web no transmite el nivel real de tu negocio.',
        ],
      },
      approach: {
        title: 'Cómo lo abordo',
        paragraphs: [
          'Empiezo por lo que la web tiene que conseguir: que te encuentren, que te entiendan y que te escriban. A partir de ahí defino la arquitectura más sencilla que lo resuelva.',
          'Trabajo con Next.js, React y TypeScript sobre una infraestructura moderna. La IA me ayuda a avanzar más rápido en cada fase; cada entrega pasa por mi revisión, con tests y comprobaciones automáticas.',
        ],
        principles: [
          {
            title: 'Rendimiento de serie',
            text: 'Core Web Vitals en verde como requisito, no como mejora futura.',
          },
          {
            title: 'Accesible para todos',
            text: 'Navegable con teclado, legible y compatible con lectores de pantalla.',
          },
          {
            title: 'SEO técnico desde el inicio',
            text: 'Metadatos, datos estructurados, sitemap y URLs limpias en cada idioma.',
          },
          {
            title: 'Fácil de mantener',
            text: 'Código claro, tipado y documentado, para que cualquier desarrollador pueda continuarlo.',
          },
        ],
      },
      deliverables: {
        title: 'Qué recibes',
        items: [
          {
            title: 'Web o aplicación en producción',
            text: 'Publicada en tu dominio, con HTTPS, analítica respetuosa y copias de seguridad.',
          },
          {
            title: 'Código fuente',
            text: 'En un repositorio a tu nombre, con historial completo y sin dependencias cerradas.',
          },
          {
            title: 'Base SEO completa',
            text: 'Títulos, descripciones, datos estructurados, sitemap y versión multidioma si la necesitas.',
          },
          {
            title: 'Documentación y traspaso',
            text: 'Cómo está construida, cómo se despliega y cómo editar el contenido.',
          },
        ],
      },
      process: {
        title: 'Cómo trabajamos',
        steps: [
          {
            title: 'Conversación inicial',
            text: 'Me cuentas qué necesitas y qué tienes hoy. Resuelvo dudas y detecto riesgos.',
          },
          {
            title: 'Propuesta',
            text: 'Alcance, plazos y entregas por escrito, sin letra pequeña.',
          },
          {
            title: 'Desarrollo por entregas',
            text: 'Ves avances reales cada semana en una URL de pruebas y opinas sobre la marcha.',
          },
          {
            title: 'Lanzamiento',
            text: 'Publicación, revisión de rendimiento y SEO, y acompañamiento en las primeras semanas.',
          },
        ],
      },
      faq: {
        title: 'Preguntas sobre desarrollo web',
        items: [
          {
            question: '¿Podré editar los textos yo mismo?',
            answer:
              'Sí, si lo necesitas. Según el proyecto, conecto un gestor de contenidos sencillo o dejo los textos en archivos fáciles de editar. Lo decidimos en la propuesta.',
          },
          {
            question: '¿Rehaces mi web actual o empiezas de cero?',
            answer:
              'Depende de lo que haya. Reviso la web actual y te digo qué conviene conservar, qué migrar y qué rehacer, cuidando las URLs para no perder posicionamiento.',
          },
          {
            question: '¿Por qué Next.js y no WordPress?',
            answer:
              'Para webs a medida, Next.js da más rendimiento, más seguridad y más libertad de diseño. Si tu caso encaja mejor con otra herramienta, te lo diré.',
          },
        ],
      },
      cta: {
        title: '¿Hablamos de tu web?',
        text: 'Cuéntame qué tienes y qué te falta. Te respondo personalmente con los siguientes pasos.',
        cta: contactCta,
      },
    },

    /* ------------------------------------------------------ soluciones con IA */
    {
      id: 'ai',
      name: 'Soluciones con IA',
      href: routes.services.ai,
      meta: {
        title: 'Soluciones con IA para tu negocio · Pablo Jordá',
        description:
          'Tú me cuentas el problema y yo lo resuelvo apoyándome en la IA: soluciones a medida en menos tiempo, con la calidad revisada por una persona.',
      },
      summary: {
        text: 'Tú me cuentas el problema; yo lo resuelvo apoyándome en la IA. La uso en cada paso, del análisis a la entrega, para llegar antes a una solución sólida y hecha a la medida de tu negocio.',
        points: [
          'Del problema a la solución en mucho menos tiempo',
          'La IA trabaja para mí; tú recibes el resultado',
          'Misma exigencia de calidad, revisada por una persona',
        ],
      },
      hero: {
        kicker: 'Soluciones con IA',
        title: 'Tú me cuentas el problema. Yo lo resuelvo.',
        lead: 'Me apoyo en la IA en cada paso, del análisis al código, las pruebas y la documentación, para llegar antes a una solución sólida. La IA es mi herramienta; tú recibes el resultado, revisado por una persona.',
      },
      problem: {
        title: 'Para qué problemas',
        intro:
          'No hace falta que sepas qué tecnología usar. Basta con que tengas un problema como estos:',
        items: [
          'Un proceso que os cuesta horas cada semana y que debería resolverse solo.',
          'Información repartida entre hojas de cálculo, correos y herramientas que no se hablan.',
          'Un sistema heredado que hay que entender, arreglar o migrar.',
          'Una idea que parecía demasiado lenta o costosa de construir.',
        ],
      },
      approach: {
        title: 'Cómo lo abordo',
        paragraphs: [
          'Primero entiendo el problema y qué significa resolverlo bien para tu negocio. Después elijo la solución más sencilla que funcione, sea una integración, una aplicación o un cambio en lo que ya tienes.',
          'La IA me permite analizar más rápido, explorar alternativas, escribir código y pruebas y documentar sin perder tiempo. Cada pieza que entrego la reviso yo: la responsabilidad del resultado es mía.',
          'Si la mejor solución lleva un modelo de IA dentro del producto, lo integro con criterio: datos protegidos, coste controlado y resultados que se pueden comprobar. Si no hace falta, no lo añado.',
        ],
        principles: [
          {
            title: 'El problema manda',
            text: 'La tecnología se elige al final, cuando ya sabemos qué hay que resolver.',
          },
          {
            title: 'IA como herramienta',
            text: 'Acelera mi trabajo; las decisiones y la revisión son humanas.',
          },
          {
            title: 'Calidad sin atajos',
            text: 'Tests, revisión de código, seguridad y accesibilidad, igual que en cualquier proyecto.',
          },
          {
            title: 'Sin humo',
            text: 'Te digo qué se puede hacer, qué no y qué riesgos tiene cada opción.',
          },
        ],
      },
      deliverables: {
        title: 'Qué recibes',
        items: [
          {
            title: 'Diagnóstico claro',
            text: 'El problema descrito en tu idioma, las opciones posibles y la que recomiendo.',
          },
          {
            title: 'La solución funcionando',
            text: 'En producción y conectada a lo que ya usas, no una demo.',
          },
          {
            title: 'Código y documentación',
            text: 'Tuyos, legibles y con pruebas, para que nadie dependa de una caja negra.',
          },
          {
            title: 'Acompañamiento',
            text: 'Seguimiento tras la entrega y ajustes cuando el uso real lo pida.',
          },
        ],
      },
      process: {
        title: 'Cómo trabajamos',
        steps: [
          {
            title: 'Me cuentas el problema',
            text: 'Con tus palabras, sin tecnicismos. Yo pregunto lo que haga falta.',
          },
          {
            title: 'Diagnóstico y propuesta',
            text: 'Qué voy a construir, cómo sabremos que funciona y en qué plazo.',
          },
          {
            title: 'Construcción acelerada',
            text: 'Avanzo con la IA como apoyo y te enseño resultados desde las primeras semanas.',
          },
          {
            title: 'Entrega y seguimiento',
            text: 'Lo dejo en producción, documentado, y reviso contigo cómo responde en el día a día.',
          },
        ],
      },
      faq: {
        title: 'Preguntas sobre soluciones con IA',
        items: [
          {
            question: '¿Necesito saber algo de inteligencia artificial?',
            answer:
              'No. Tú conoces tu negocio y su problema; la parte técnica, incluida la IA, es cosa mía.',
          },
          {
            question: 'Si la IA hace parte del trabajo, ¿baja la calidad?',
            answer:
              'No. La IA acelera la parte mecánica; el criterio y la revisión son míos. El código pasa los mismos tests, revisiones y controles de seguridad que cualquier otro.',
          },
          {
            question: '¿Qué pasa con mis datos?',
            answer:
              'Solo uso los datos imprescindibles y con proveedores cuyas condiciones impiden usarlos para entrenar modelos. Si hay información sensible, acordamos por escrito cómo se trata antes de empezar.',
          },
        ],
      },
      cta: {
        title: '¿Qué problema quieres quitarte de encima?',
        text: 'Cuéntamelo en unas líneas. Te respondo con cómo lo abordaría y cuáles serían los siguientes pasos.',
        cta: { label: 'Cuéntame el problema', href: routes.contact },
      },
    },

    /* ------------------------------------------------------ apps, saas y mvps */
    {
      id: 'apps',
      name: 'Apps, SaaS y MVPs',
      href: routes.services.apps,
      meta: {
        title: 'Desarrollo de MVP, SaaS y apps · Pablo Jordá',
        description:
          'De la idea a un MVP en producción: cuentas, pagos, panel de administración y app móvil sobre la misma API. Desarrollo de SaaS a medida desde Valencia.',
      },
      summary: {
        text: 'De la idea a una primera versión en producción, con la base lista para crecer.',
        points: [
          'MVPs en semanas, no en meses',
          'Cuentas, pagos y panel de administración',
          'Web y app móvil sobre la misma API',
        ],
      },
      hero: {
        kicker: 'Apps, SaaS y MVPs',
        title: 'De la idea a un producto que la gente ya usa.',
        lead: 'Construyo la primera versión de tu producto, la pongo en manos de usuarios reales y la dejo preparada para crecer sin rehacerla.',
      },
      problem: {
        title: 'Cuándo tiene sentido',
        intro: 'Este servicio encaja si estás en alguno de estos puntos:',
        items: [
          'Tienes una idea validada en conversaciones y necesitas un producto para probarla de verdad.',
          'Te han hablado de meses de desarrollo antes de poder enseñar nada.',
          'Tu prototipo funciona, pero no aguantaría usuarios reales ni pagos.',
          'Necesitas web y app móvil y no quieres mantener dos productos distintos.',
        ],
      },
      approach: {
        title: 'Cómo lo abordo',
        paragraphs: [
          'Un MVP no es una versión pequeña de todo: es la versión completa de lo esencial. Definimos juntos qué tiene que hacer el producto para demostrar que funciona y dejamos el resto para después.',
          'Construyo sobre piezas probadas, como autenticación, pagos y correo, para dedicar el tiempo a lo que hace único tu producto. Con la IA como apoyo, las primeras versiones llegan antes, sin hipotecar la calidad del código.',
        ],
        principles: [
          {
            title: 'Lo esencial, completo',
            text: 'Pocas funciones, bien resueltas, en vez de muchas a medias.',
          },
          {
            title: 'En producción pronto',
            text: 'Usuarios reales cuanto antes: es la única forma de saber qué construir después.',
          },
          {
            title: 'Base para crecer',
            text: 'Arquitectura, tests y despliegue automático desde el primer día.',
          },
          {
            title: 'Medible',
            text: 'Analítica y registros para decidir con datos, no con intuiciones.',
          },
        ],
      },
      deliverables: {
        title: 'Qué recibes',
        items: [
          {
            title: 'Producto en producción',
            text: 'Web, app móvil o ambas, publicadas y listas para tus primeros usuarios.',
          },
          {
            title: 'Lo que todo SaaS necesita',
            text: 'Registro y acceso, roles, pagos y suscripciones, correos y panel de administración.',
          },
          {
            title: 'Infraestructura a tu nombre',
            text: 'Repositorio, hosting y servicios en tus cuentas, con despliegue automático.',
          },
          {
            title: 'Hoja de ruta',
            text: 'Qué construir después, ordenado por impacto y por lo que digan tus usuarios.',
          },
        ],
      },
      process: {
        title: 'Cómo trabajamos',
        steps: [
          {
            title: 'Definir el núcleo',
            text: 'Qué problema resuelve el producto, para quién y qué necesita la primera versión.',
          },
          {
            title: 'Propuesta y plan',
            text: 'Alcance cerrado de la primera versión, plazos y entregas.',
          },
          {
            title: 'Construcción iterativa',
            text: 'Entregas frecuentes en un entorno de pruebas que puedes enseñar a quien quieras.',
          },
          {
            title: 'Lanzamiento y aprendizaje',
            text: 'Salimos a producción, medimos y decidimos juntos la siguiente iteración.',
          },
        ],
      },
      faq: {
        title: 'Preguntas sobre apps, SaaS y MVPs',
        items: [
          {
            question: '¿Cuánto tarda un MVP?',
            answer:
              'Depende del alcance, pero el objetivo es tener una primera versión en producción en semanas, no en meses. En la propuesta te doy un plazo concreto.',
          },
          {
            question: '¿Puedes continuar un producto que ya existe?',
            answer:
              'Sí. Empiezo con una revisión del código y la infraestructura y te cuento qué conviene mantener, mejorar o rehacer antes de seguir añadiendo funciones.',
          },
          {
            question: '¿Haces también la app móvil?',
            answer:
              'Sí. Siempre que encaja, web y app móvil comparten la misma API y la misma lógica, así mantienes un solo producto.',
          },
        ],
      },
      cta: {
        title: '¿Tienes una idea de producto?',
        text: 'Cuéntamela aunque esté verde. Te ayudo a definir qué necesita la primera versión.',
        cta: { label: 'Cuéntame tu idea', href: routes.contact },
      },
    },
  ],
};

export const serviceById = (id: ServiceId) => {
  const service = services.items.find((s) => s.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
};
