# pablojorda.es

[![Continuous integration](https://github.com/Pjorda96/portfolio-pablo/actions/workflows/CI.yml/badge.svg?branch=develop)](https://github.com/Pjorda96/portfolio-pablo/actions/workflows/CI.yml)
[![Licencia: MIT](https://img.shields.io/badge/licencia-MIT-blue.svg)](LICENSE)

Web de servicios de **Pablo Jordá**: desarrollo web a medida, integraciones de inteligencia artificial y producto digital (apps, SaaS y MVPs).

El repositorio es público a propósito. Además de la web, es un escaparate técnico: el código, el proceso y las decisiones están a la vista, desde la arquitectura hasta la calidad, la accesibilidad y el rendimiento.

> **Estado:** en construcción. La fase actual y las siguientes están en el [plan del proyecto](docs/PLAN.md) y en el [tablero de GitHub Projects](https://github.com/users/Pjorda96/projects/13).

## Stack

| Área       | Tecnología                                                                           |
| ---------- | ------------------------------------------------------------------------------------ |
| Framework  | [Next.js 16](https://nextjs.org) (App Router, React Server Components, Turbopack)    |
| UI         | React 19 con React Compiler                                                          |
| Lenguaje   | TypeScript en modo estricto (`noUncheckedIndexedAccess`)                             |
| Estilos    | Tailwind CSS 4 con tokens de diseño en CSS (`@theme`)                                |
| Validación | Zod 4 (variables de entorno validadas al arrancar y al compilar)                     |
| Tests      | Vitest + Testing Library + jsdom; Playwright + axe-core (E2E y accesibilidad)        |
| Calidad    | ESLint (Next, typescript-eslint, jsx-a11y), Prettier, Husky, lint-staged, commitlint |
| CI         | GitHub Actions + Dependabot                                                          |
| Hosting    | Vercel (región `fra1`)                                                               |

## Estructura

```text
.
├── .github/          # Workflows de CI y configuración de Dependabot
├── docs/             # Plan y documentación del proyecto
├── src/
│   ├── app/          # Rutas (App Router), layout raíz y estilos globales
│   ├── components/   # Componentes de interfaz
│   ├── content/      # Contenido tipado (servicios, casos)
│   ├── lib/          # Utilidades y lógica compartida
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

Las versiones (release candidates por pull request, `CHANGELOG.md` y etiquetas) siguen el esquema descrito en [docs/VERSIONING.md](docs/VERSIONING.md).

La web está publicada sin indexar hasta el lanzamiento público: lo que está preparado (Search Console, Bing, DNS) y los pasos de ese día están en [docs/LANZAMIENTO.md](docs/LANZAMIENTO.md).

## Estándares de calidad

- **TypeScript estricto**, incluido `noUncheckedIndexedAccess`.
- **Accesibilidad desde el linter:** el conjunto recomendado completo de `jsx-a11y`, no solo las reglas que trae Next.
- **Entorno validado:** si falta una variable obligatoria o tiene un formato incorrecto, el build se detiene con un mensaje claro.
- **Conventional Commits** verificados con commitlint en cada commit; lint y formato de los archivos modificados con lint-staged.
- **Integración continua:** cada push a `develop` y cada pull request ejecutan tipos, lint, formato, tests y build en GitHub Actions; las pull requests además pasan los E2E con axe y Lighthouse CI.
- **Dependencias al día** con Dependabot, agrupando actualizaciones menores.
- **Cabeceras de seguridad:** CSP estática, HSTS, COOP/CORP y Permissions-Policy, con `npm audit` en cada pull request; detalles en [docs/SECURITY.md](docs/SECURITY.md).

## Licencia

[MIT](LICENSE)
