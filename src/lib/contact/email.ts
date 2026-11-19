import type { Locale } from '@/content/types';

import type { ContactInput, ProjectType } from './schema';

/** The email the owner receives for each message, in plain text and HTML. */
export interface ContactEmail {
  subject: string;
  text: string;
  html: string;
}

/** Labels of the project types in the owner's inbox (Spanish). */
const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  web: 'Desarrollo web a medida',
  ai: 'Soluciones con IA',
  apps: 'Apps, SaaS y MVPs',
  other: 'Otra cosa',
};

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);

/** Line breaks and control characters out of a one-line header value. */
const oneLine = (value: string) => value.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();

export function buildContactEmail(input: ContactInput, locale: Locale): ContactEmail {
  const service = PROJECT_TYPE_LABELS[input.service];
  const rows: [string, string][] = [
    ['Nombre', oneLine(input.name)],
    ['Correo', oneLine(input.email)],
    ['Empresa o proyecto', oneLine(input.company) || '—'],
    ['Qué necesita', service],
    ['Idioma de la web', locale.toUpperCase()],
  ];

  const subject = `Contacto web: ${oneLine(input.name)} · ${service}`.slice(0, 200);

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Mensaje:',
    input.message,
    '',
    '— Enviado desde el formulario de contacto de pablojorda.es. Responde a este correo para contestar.',
  ].join('\n');

  const html = `<!doctype html>
<html lang="es">
<body style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.5;color:#1a1f2b">
<table role="presentation" cellpadding="4" style="border-collapse:collapse">
${rows
  .map(
    ([label, value]) =>
      `<tr><th scope="row" align="left" style="padding-right:12px;color:#4b5466">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`,
  )
  .join('\n')}
</table>
<h2 style="font-size:16px;margin:20px 0 8px">Mensaje</h2>
<p style="white-space:pre-wrap;margin:0">${escapeHtml(input.message)}</p>
<hr style="border:0;border-top:1px solid #ddd;margin:24px 0">
<p style="font-size:13px;color:#4b5466;margin:0">Enviado desde el formulario de contacto de pablojorda.es. Responde a este correo para contestar.</p>
</body>
</html>`;

  return { subject, text, html };
}
