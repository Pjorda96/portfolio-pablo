# Contenido (F2): guía de revisión

Todo el copy de la web vive en `src/content/`, en español (`es/`) e inglés (`en/`), con la misma estructura. `tests/content.test.ts` comprueba que ambos idiomas coinciden, que los títulos y descripciones caben en Google y que no aparecen palabras prohibidas (dedicación parcial, precios, empleadores).

| Archivo                 | Qué contiene                                                                |
| ----------------------- | --------------------------------------------------------------------------- |
| `meta.ts`               | Rutas por idioma, navegación, pie y página 404                              |
| `home.ts`               | Hero, ciudad, propuesta de valor, caso destacado, proceso, capacidades, CTA |
| `services.ts`           | Las tres páginas de servicio (problema, enfoque, entregables, proceso, FAQ) |
| `case-pixel-y-papel.ts` | Caso de estudio                                                             |
| `about.ts`              | Sobre mí                                                                    |
| `faq.ts`                | 9 preguntas frecuentes (alimentan el JSON-LD `FAQPage`)                     |
| `legal.ts`              | Aviso legal, privacidad y cookies                                           |
| `contact.ts`            | Página de contacto, etiquetas y errores del formulario, aviso de privacidad |
| `../owner.ts`           | Tus datos identificativos (compartidos por ambos idiomas)                   |
| `../site.ts`            | Adaptador de la ciudad de la home: `getCityCopy(locale)`                    |

## Pendiente de ti

1. **NIF y domicilio.** Rellena `{{NIF}}` y `{{DOMICILIO}}` en `src/content/owner.ts`. Aparecen en el aviso legal y en la política de privacidad. Cuando estén, quita también el `draftNotice` de `legal.ts` (y el test que exige los dos placeholders).
2. **Revisión de los textos legales.** Son un borrador basado en la configuración prevista, no asesoría legal. Comprueba en concreto:
   - Plazo de conservación de los mensajes del formulario (he puesto un año desde el último contacto).
   - Proveedores: Vercel, Resend, Cloudflare Turnstile (si finalmente se usa) y Anthropic (si se activa el asistente de F4). Quita los que no se usen.
   - Sin cookies: desde F3 la detección de idioma y la cookie `NEXT_LOCALE` de next-intl están desactivadas; la URL decide el idioma.
   - Preferencias en `localStorage`: desde F3 se guarda el tema elegido (`pj-theme`: claro u oscuro; «Auto» no guarda nada). La hora de la ciudad no se guarda.
   - Edad mínima de 14 años (LOPDGDD) y fuero de Valencia.
3. **Píxel y Papel.** Los socios han aprobado el caso tal como está: cualitativo, contigo como cofundador y responsable técnico de un proyecto de cuatro socios. No hay cifras ni capturas; se pueden añadir más adelante si los socios las facilitan. El stack listado (Next.js, React, TypeScript, Tailwind, next-intl, PostgreSQL, Vercel) lo he sacado de los repos `pixelypapel` y `wedding`: confírmalo.
4. **Correo publicado.** `pjorda96@gmail.com` aparece en los textos legales, el aviso de privacidad del formulario y el mensaje de error genérico. Si más adelante usas un correo del dominio, cámbialo solo en `owner.ts`.

## Decisiones que conviene que revises

- **Ruta de FAQ nueva.** `/preguntas-frecuentes` y `/en/faq` no estaban en el mapa del sitio del plan. La home muestra 4 preguntas y enlaza ahí. Si prefieres no tener página propia, basta con quitar la ruta y el enlace.
- **Promesas de plazo.** «MVPs en semanas, no en meses» y «una web a medida suele estar en producción en pocas semanas». Ajústalo si no quieres comprometerte con eso.
- **IA dentro del producto.** En Soluciones con IA digo que, si la mejor solución incluye un modelo de IA en el producto, lo integro con criterio, y si no hace falta, no. El mensaje principal sigue siendo que la IA es tu herramienta.
- **Datos y modelos.** En la FAQ de IA afirmo que solo usas proveedores cuyas condiciones impiden entrenar con los datos del cliente. Confírmalo con tu forma real de trabajar.
- **Sectores de experiencia.** Seguros, fintech y blockchain, y software de arquitectura, sin nombres de empresa y sin hablar de empleo actual.
- **Inglés.** Escrito como copy propio, no traducido literal. SEO orientado a «freelance web developer in Spain». Los textos legales en inglés indican que prevalece la versión en español.
- **Home F1.** Cambio de copy: en el Mercado Central, «Caso de estudio completo, próximamente» pasa a «Caso de estudio: contexto, reto y solución». Lo demás de la home se mantiene igual.
- **Interfaz de la ciudad.** Desde F3 los textos de la interfaz 3D (reloj, botones, avisos) están en `home.city.ui` de cada idioma.
