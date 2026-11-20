<p align="center">
  <img src="src/app/icon.svg" width="96" alt="Monograma de Pablo Jordá">
</p>

<h1 align="center">pablojorda.es</h1>

<p align="center"><em>Una ciudad de cosas bien construidas.</em></p>

<p align="center">
  <a href="https://github.com/Pjorda96/portfolio-pablo/actions/workflows/CI.yml"><img src="https://github.com/Pjorda96/portfolio-pablo/actions/workflows/CI.yml/badge.svg?branch=develop" alt="Continuous integration"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/licencia-MIT-blue.svg" alt="Licencia: MIT"></a>
</p>

Web de servicios de **Pablo Jordá**: desarrollo web a medida, integraciones de inteligencia artificial y producto digital (apps, SaaS y MVPs).

El repositorio es público a propósito. Además de la web, es un escaparate técnico: el código, el proceso y las decisiones están a la vista, desde la arquitectura hasta la calidad, la accesibilidad y el rendimiento.

**En producción:** [pablojorda.es](https://pablojorda.es) (versión en [`CHANGELOG.md`](CHANGELOG.md)). Por ahora la web está publicada **sin indexar** hasta el lanzamiento público; lo que falta y los pasos de ese día están en [docs/LANZAMIENTO.md](docs/LANZAMIENTO.md).

## Qué incluye

- **Una ciudad 3D de Valencia** en la portada (Three.js con React Three Fiber). Cada edificio lleva a una sección y la luz sigue la hora del visitante, que también se puede adelantar o fijar. three.js solo se descarga en el cliente y la página funciona entera sin JavaScript ni WebGL.
- **Español e inglés** con next-intl: español en la raíz e inglés en `/en`, con slugs traducidos, `hreflang` y `x-default`. Todo el contenido está tipado en `src/content/` y un test comprueba que los dos idiomas tienen la misma estructura.
- **Formulario de contacto** con Server Actions y Resend, validado con Zod en cliente y servidor y con antispam propio (honeypot, tiempo mínimo firmado y límite por IP).
- **Asistente de IA** que responde sobre los servicios con el contenido de la propia web (Claude, de Anthropic). Las respuestas llegan en streaming y hay límites de uso. Sin `ANTHROPIC_API_KEY` se muestra como no disponible.
- **SEO técnico:** metadatos por página, JSON-LD (`Person`, `ProfessionalService`, `Service`, `FAQPage`…), sitemap, `robots.txt`, `llms.txt` e imágenes Open Graph generadas en el servidor.
- **Medido en cada pull request:** E2E y axe en todas las páginas, y Lighthouse CI con presupuestos de rendimiento y peso.

## Stack

| Área       | Tecnología                                                                           |
| ---------- | ------------------------------------------------------------------------------------ |
| Framework  | [Next.js 16](https://nextjs.org) (App Router, React Server Components, Turbopack)    |
| UI         | React 19 con React Compiler                                                          |
| Lenguaje   | TypeScript en modo estricto (`noUncheckedIndexedAccess`)                             |
| Estilos    | Tailwind CSS 4 con tokens de diseño en CSS (`@theme`)                                |
| 3D         | three.js + React Three Fiber                                                         |
| Idiomas    | next-intl                                                                            |
| Validación | Zod 4 (`zod/mini` en el cliente); variables de entorno validadas al arrancar         |
| Correo     | Resend                                                                               |
| IA         | SDK de Anthropic (Claude)                                                            |
| Tests      | Vitest + Testing Library + jsdom; Playwright + axe-core (E2E y accesibilidad)        |
| Calidad    | ESLint (Next, typescript-eslint, jsx-a11y), Prettier, Husky, lint-staged, commitlint |
| CI         | GitHub Actions, Lighthouse CI y Dependabot                                           |
| Hosting    | Vercel (región `fra1`), con Web Analytics y Speed Insights                           |

## Estructura

```text
.
├── .github/          # Workflows de CI y configuración de Dependabot
├── docs/             # Plan, contenido, lanzamiento, rendimiento, seguridad y versiones
├── scripts/          # Scripts de versionado (Node, sin dependencias)
├── src/
│   ├── app/          # Rutas por idioma, API, sitemap, robots, manifest e iconos
│   ├── components/   # Interfaz: ciudad 3D, páginas, layout, asistente, SEO
│   ├── content/      # Textos tipados por idioma (es/, en/) y datos del titular
│   ├── i18n/         # Rutas traducidas y configuración de next-intl
│   ├── lib/          # Contacto, asistente, SEO, datos estructurados, OG, seguridad
│   ├── proxy.ts      # Idioma y cabeceras de cada petición
│   └── env.ts        # Esquema y validación de variables de entorno
├── e2e/              # Tests E2E y de accesibilidad (Playwright + axe)
└── tests/            # Tests unitarios y de componentes
```

## Desarrollo local

Requisitos: Node.js 24 o superior (ver `.nvmrc`) y npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

La web queda disponible en <http://localhost:3000>.

Ninguna variable es obligatoria en local. Están todas explicadas en [`.env.example`](.env.example):

| Variable                                 | Para qué                                                             |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `SITE_URL`                               | Origen canónico. Obligatoria en producción                           |
| `RESEND_API_KEY`                         | Envío del formulario. Sin ella, en local el mensaje sale por consola |
| `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Remitente y destinatario de los mensajes                             |
| `CONTACT_FORM_SECRET`                    | Firma del antispam. Si falta, se deriva de `RESEND_API_KEY`          |
| `ANTHROPIC_API_KEY`, `ASSISTANT_MODEL`   | Asistente de IA. Sin clave, el asistente aparece como no disponible  |

## Scripts

| Script                   | Descripción                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| `npm run dev`            | Servidor de desarrollo con Turbopack                              |
| `npm run build`          | Build de producción                                               |
| `npm run start`          | Sirve el build de producción                                      |
| `npm run lint`           | ESLint sin advertencias permitidas (`--max-warnings=0`)           |
| `npm run typescript`     | Comprobación de tipos (`tsc --noEmit`)                            |
| `npm run prettier`       | Formatea el código                                                |
| `npm run prettier:check` | Comprueba el formato sin modificar archivos                       |
| `npm run test`           | Ejecuta los tests una vez                                         |
| `npm run test:watch`     | Tests en modo observación                                         |
| `npm run test:coverage`  | Tests con informe de cobertura y umbrales mínimos                 |
| `npm run test:e2e`       | Tests E2E y de accesibilidad sobre el build (requiere `build`)    |
| `npm run lhci`           | Lighthouse CI sobre el build (requiere `build`)                   |
| `npm run verify:quick`   | Tipos, lint, formato, tests y build: lo mismo que comprueba la CI |

## Tests

- **Unitarios y de componentes** (`tests/`, Vitest + Testing Library): validación del formulario,
  antispam, metadata y SEO, utilidades y componentes. `npm run test:coverage` deja el informe en
  `coverage/` (HTML y `json-summary`) y falla por debajo de los umbrales de `vitest.config.mts`.
  En CI el job `verify` lo ejecuta y sube el informe como artefacto `coverage-report`.
- **E2E** (`e2e/`, Playwright, Chromium escritorio y móvil) contra `next build` + `next start`:
  navegación (cabecera, menú, pie y todas las páginas del sitemap), cambio de idioma con slugs
  traducidos, canonical y `hreflang`, y el formulario de contacto (éxito, errores de validación,
  fallo del servidor y token antispam falsificado). Job `e2e` en CI, con el informe de Playwright
  como artefacto.
- **El formulario nunca envía correos en los tests:** el servidor E2E arranca con
  `CONTACT_TEST_MAILER=1` (transporte de pruebas, `src/lib/contact/transport.ts`) y sin claves de
  Resend ni de Anthropic. Esa variable está prohibida con `VERCEL_ENV=production`: la validación
  del entorno detiene el build. El antispam sigue activo: los tests esperan el tiempo mínimo de
  rellenado y dejan vacío el honeypot.
- **Accesibilidad** (`e2e/a11y.spec.ts`): axe en todas las páginas, ES y EN, tema claro y oscuro;
  falla con cualquier infracción `serious` o `critical` (WCAG 2.2 A/AA). Lighthouse CI exige
  además accesibilidad, buenas prácticas y SEO ≥ 0,95 ([docs/PERFORMANCE.md](docs/PERFORMANCE.md)).

Para los E2E en local: `npx playwright install chromium` (una vez), `npm run build` y
`npm run test:e2e` (usa el puerto 3100; otro con `E2E_PORT`).

## Estándares de calidad

- **TypeScript estricto**, incluido `noUncheckedIndexedAccess`.
- **Accesibilidad desde el linter:** el conjunto recomendado completo de `jsx-a11y`, no solo las reglas que trae Next.
- **Entorno validado:** si falta una variable obligatoria o tiene un formato incorrecto, el build se detiene con un mensaje claro.
- **Conventional Commits** verificados con commitlint en cada commit; lint y formato de los archivos modificados con lint-staged.
- **Integración continua:** cada push a `develop` y cada pull request ejecutan tipos, lint, formato, tests y build en GitHub Actions; las pull requests además pasan los E2E con axe y Lighthouse CI.
- **Dependencias al día** con Dependabot, agrupando actualizaciones menores.
- **Cabeceras de seguridad:** CSP estática, HSTS, COOP/CORP y Permissions-Policy, con `npm audit` en cada pull request; detalles en [docs/SECURITY.md](docs/SECURITY.md).

## Documentación

| Documento                             | Contenido                                                        |
| ------------------------------------- | ---------------------------------------------------------------- |
| [PLAN.md](docs/PLAN.md)               | Objetivos, decisiones y fases del proyecto                       |
| [CONTENIDO.md](docs/CONTENIDO.md)     | Textos de la web y criterios de tono                             |
| [PERFORMANCE.md](docs/PERFORMANCE.md) | Presupuestos de rendimiento y Lighthouse CI                      |
| [SECURITY.md](docs/SECURITY.md)       | CSP, cabeceras y decisiones de seguridad                         |
| [VERSIONING.md](docs/VERSIONING.md)   | Versiones por pull request, releases, `CHANGELOG.md` y etiquetas |
| [LANZAMIENTO.md](docs/LANZAMIENTO.md) | Indexación, Search Console, Bing y pasos del día del lanzamiento |

## Ramas y releases

El trabajo entra en `develop` con pull requests que suben una versión `-rc`. Una release es una pull request de `develop` a `master`, que es lo que despliega Vercel en producción; después se etiqueta `vX.Y.Z`. El detalle está en [VERSIONING.md](docs/VERSIONING.md).

## Licencia

[MIT](LICENSE)
