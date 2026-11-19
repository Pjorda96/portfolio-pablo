import { owner } from '../owner';
import type { LegalContent } from '../types';

/*
 * REVIEW BY THE OWNER BEFORE LAUNCH. Draft written from the planned setup
 * (Vercel hosting + Web Analytics/Speed Insights, Resend for the contact
 * form, optional Cloudflare Turnstile and the F4 AI assistant). It is not
 * legal advice: check it against the final implementation and fill
 * `{{NIF}}` and `{{DOMICILIO}}` in `src/content/owner.ts`.
 */

const holder = [
  `Titular: ${owner.name}`,
  `NIF: ${owner.nif}`,
  `Domicilio: ${owner.address}`,
  `Correo electrónico: ${owner.email}`,
  `Sitio web: ${owner.domain}`,
];

export const legal: LegalContent = {
  draftNotice:
    'Texto en revisión: algunos datos identificativos del titular están pendientes de completar.',

  /* ------------------------------------------------------------ aviso legal */
  notice: {
    meta: {
      title: 'Aviso legal · Pablo Jordá',
      description:
        'Aviso legal de pablojorda.es: datos del titular, condiciones de uso, propiedad intelectual y legislación aplicable.',
    },
    title: 'Aviso legal',
    updated: 'Última actualización: noviembre de 2026',
    sections: [
      {
        title: 'Titular del sitio web',
        paragraphs: [
          'En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), estos son los datos del titular de este sitio web:',
        ],
        items: holder,
      },
      {
        title: 'Objeto',
        paragraphs: [
          'Este sitio web presenta los servicios profesionales de desarrollo web, soluciones con IA y desarrollo de producto digital que ofrece su titular, y permite contactar con él a través de un formulario.',
        ],
        items: [],
      },
      {
        title: 'Condiciones de uso',
        paragraphs: [
          'El acceso a este sitio web es libre y gratuito. Al navegar por él aceptas usarlo de forma lícita, sin dañar su funcionamiento ni los derechos de terceros, y sin enviar a través del formulario contenidos ilícitos, ofensivos o publicidad no solicitada.',
        ],
        items: [],
      },
      {
        title: 'Propiedad intelectual e industrial',
        paragraphs: [
          'Los textos, ilustraciones, logotipo y diseño de este sitio pertenecen a su titular. No se permite su reproducción con fines comerciales sin autorización previa.',
          'El código fuente del sitio es público y se distribuye bajo licencia MIT, en los términos indicados en su repositorio. Las marcas y nombres de terceros que aparecen en el sitio, incluida Píxel y Papel, pertenecen a sus respectivos titulares.',
        ],
        items: [],
      },
      {
        title: 'Responsabilidad',
        paragraphs: [
          'El titular trabaja para que la información del sitio sea correcta y esté actualizada, pero no garantiza la ausencia de errores ni la disponibilidad ininterrumpida del servicio.',
          'Los enlaces a sitios de terceros se ofrecen solo como referencia. El titular no controla ni se responsabiliza de sus contenidos.',
        ],
        items: [],
      },
      {
        title: 'Legislación aplicable y jurisdicción',
        paragraphs: [
          'Este aviso legal se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de Valencia, salvo que la normativa aplicable establezca otro fuero, como el del domicilio del consumidor.',
        ],
        items: [],
      },
    ],
  },

  /* ------------------------------------------------------------- privacidad */
  privacy: {
    meta: {
      title: 'Política de privacidad · Pablo Jordá',
      description:
        'Cómo trata pablojorda.es tus datos personales: responsable, finalidades, base jurídica, proveedores, conservación y cómo ejercer tus derechos.',
    },
    title: 'Política de privacidad',
    updated: 'Última actualización: noviembre de 2026',
    sections: [
      {
        title: 'Responsable del tratamiento',
        paragraphs: [
          'De acuerdo con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), el responsable del tratamiento de tus datos es:',
        ],
        items: holder,
      },
      {
        title: 'Qué datos trato',
        paragraphs: ['Solo trato los datos necesarios para atenderte:'],
        items: [
          'Datos del formulario de contacto: nombre, correo electrónico, empresa o proyecto (opcional), tipo de servicio y el mensaje que escribas.',
          'Datos técnicos de la conexión, como la dirección IP, usados de forma temporal para la seguridad del sitio y para evitar envíos abusivos.',
          'Estadísticas de visitas agregadas y anónimas, obtenidas sin cookies.',
        ],
      },
      {
        title: 'Finalidades y base jurídica',
        paragraphs: [],
        items: [
          'Responder a tus consultas y, si lo pides, preparar una propuesta: tu consentimiento (art. 6.1.a RGPD) y la aplicación de medidas precontractuales a petición tuya (art. 6.1.b RGPD).',
          'Proteger el sitio y el formulario frente a abusos y spam: interés legítimo del titular (art. 6.1.f RGPD).',
          'Conocer de forma agregada cómo se usa el sitio para mejorarlo: interés legítimo del titular (art. 6.1.f RGPD), sin identificar a los visitantes.',
        ],
      },
      {
        title: 'Conservación',
        paragraphs: [
          'Conservo los mensajes del formulario mientras gestiono tu consulta y, como máximo, un año desde el último contacto, salvo que iniciemos una relación profesional: en ese caso, se conservan durante los plazos que exija la ley. Los datos técnicos de seguridad se eliminan en un plazo breve.',
        ],
        items: [],
      },
      {
        title: 'Destinatarios y proveedores',
        paragraphs: [
          'No cedo tus datos a terceros, salvo obligación legal. Para prestar el servicio me apoyo en estos proveedores, que actúan como encargados del tratamiento:',
        ],
        items: [
          'Vercel Inc. (Estados Unidos): alojamiento del sitio y estadísticas anónimas de uso y rendimiento.',
          'Resend (Estados Unidos): envío por correo electrónico de los mensajes del formulario.',
          'Cloudflare, Inc. (Estados Unidos): verificación antispam del formulario, si está activa.',
          'Anthropic (Estados Unidos): solo si usas el asistente de IA del sitio, para generar sus respuestas a partir de lo que escribas.',
        ],
      },
      {
        title: 'Transferencias internacionales',
        paragraphs: [
          'Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En esos casos, las transferencias se amparan en el Marco de Privacidad de Datos UE-EE. UU. o en cláusulas contractuales tipo aprobadas por la Comisión Europea.',
        ],
        items: [],
      },
      {
        title: 'Tus derechos',
        paragraphs: [
          `Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, y retirar tu consentimiento en cualquier momento, escribiendo a ${owner.email}.`,
          'Si consideras que el tratamiento no se ajusta a la normativa, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).',
        ],
        items: [],
      },
      {
        title: 'Seguridad y menores',
        paragraphs: [
          'Aplico medidas técnicas y organizativas adecuadas para proteger tus datos, como conexión cifrada (HTTPS) y acceso restringido.',
          'Este sitio no está dirigido a menores de 14 años. Si eres menor de esa edad, no envíes datos a través del formulario.',
        ],
        items: [],
      },
      {
        title: 'Cambios en esta política',
        paragraphs: [
          'Puedo actualizar esta política para adaptarla a cambios legales o del sitio. La fecha de la última actualización figura al principio.',
        ],
        items: [],
      },
    ],
  },

  /* ---------------------------------------------------------------- cookies */
  cookies: {
    meta: {
      title: 'Política de cookies · Pablo Jordá',
      description:
        'pablojorda.es no usa cookies publicitarias ni de seguimiento. Qué almacenamiento técnico usa el sitio y cómo puedes gestionarlo.',
    },
    title: 'Política de cookies',
    updated: 'Última actualización: noviembre de 2026',
    sections: [
      {
        title: 'Qué son las cookies',
        paragraphs: [
          'Las cookies y tecnologías similares, como el almacenamiento local del navegador, son pequeños archivos o datos que un sitio web guarda en tu dispositivo para recordar información entre visitas.',
        ],
        items: [],
      },
      {
        title: 'Qué usa este sitio',
        paragraphs: [
          'Este sitio no instala cookies: ni publicitarias, ni de seguimiento, ni de redes sociales. Solo guarda en tu navegador las preferencias que tú mismo eliges:',
        ],
        items: [
          'Almacenamiento local (localStorage) para recordar preferencias de visualización, como el tema o la hora de la ciudad.',
        ],
      },
      {
        title: 'Estadísticas sin cookies',
        paragraphs: [
          'Para saber de forma agregada qué páginas se visitan y cómo de rápido cargan, uso Vercel Web Analytics y Speed Insights. Funcionan sin cookies y sin identificar a los visitantes ni seguirlos entre sitios.',
        ],
        items: [],
      },
      {
        title: 'Por qué no ves un aviso de cookies',
        paragraphs: [
          'Según el artículo 22.2 de la LSSI-CE, el almacenamiento estrictamente necesario o solicitado expresamente por ti no requiere consentimiento. Si en el futuro se añade alguna cookie que sí lo requiera, se te pedirá permiso antes de instalarla.',
        ],
        items: [],
      },
      {
        title: 'Cómo gestionarlas',
        paragraphs: [
          'Puedes ver, bloquear o borrar las cookies y el almacenamiento local desde la configuración de tu navegador. Si lo haces, el sitio seguirá funcionando, pero no recordará tus preferencias.',
        ],
        items: [],
      },
    ],
    table: {
      caption: 'Cookies y almacenamiento que usa pablojorda.es',
      headers: {
        name: 'Nombre',
        provider: 'Titular',
        purpose: 'Finalidad',
        duration: 'Duración',
        kind: 'Tipo',
      },
      rows: [
        {
          name: 'Preferencias de visualización',
          provider: 'pablojorda.es',
          purpose: 'Recordar el tema o la hora de la ciudad que elijas',
          duration: 'Hasta que lo borres',
          kind: 'Almacenamiento local (preferencias)',
        },
        {
          name: 'Vercel Web Analytics y Speed Insights',
          provider: 'Vercel Inc.',
          purpose: 'Estadísticas agregadas de visitas y rendimiento',
          duration: 'No guarda nada en tu dispositivo',
          kind: 'Analítica sin cookies',
        },
      ],
    },
  },
};

/**
 * Interface copy of the legal pages not covered by `LegalContent` yet.
 * TODO: move into `LegalContent` (src/content/types.ts).
 */
export const legalUi = {
  /** Shown instead of a `{{…}}` placeholder the owner has not filled yet. */
  pending: 'pendiente',
  /** Heading of the links to the other legal texts. */
  related: 'Otros textos legales',
};

export type LegalUi = typeof legalUi;
