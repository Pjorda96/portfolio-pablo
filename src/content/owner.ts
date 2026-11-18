/**
 * Identification data of the site owner, shared by both locales (legal pages,
 * contact). `{{…}}` values are placeholders the owner must fill before launch;
 * see docs/CONTENIDO.md.
 */
export const owner = {
  name: 'Pablo Jordá',
  nif: '{{NIF}}',
  address: '{{DOMICILIO}}',
  email: 'pjorda96@gmail.com',
  domain: 'pablojorda.es',
  url: 'https://pablojorda.es',
} as const;
