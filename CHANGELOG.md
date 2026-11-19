# Changelog

Las versiones y cómo se publican están descritas en [docs/VERSIONING.md](docs/VERSIONING.md).

## 0.2.0

Primera versión de la web de servicios: pablojorda.es pasa de CV a web para captar clientes, en español y en inglés. Se publica sin indexar hasta el lanzamiento público.

### Features

- Identidad visual con una ciudad 3D de Valencia que cambia con la hora del día, monograma y tema claro, oscuro o automático.
- Contenido en español e inglés: inicio, tres servicios (desarrollo web a medida, soluciones con IA y apps, SaaS y MVPs), caso de estudio de Píxel y Papel, sobre mí, preguntas frecuentes y textos legales.
- Rutas traducidas con next-intl: español en la raíz e inglés en `/en`, con selector de idioma y 404 propia.
- Formulario de contacto con validación accesible, antispam y envío por Resend.
- Transiciones entre páginas y animaciones al hacer scroll, respetando la preferencia de movimiento reducido.
- Asistente de IA sobre el contenido de la web, con streaming y límites de uso. Desactivado hasta configurar la clave de la API.
- Metadata por página e idioma, JSON-LD, sitemap, robots.txt, llms.txt e imágenes para redes sociales.
- CSP estática y cabeceras de seguridad.
- Vercel Web Analytics y Speed Insights, sin cookies.
- Enlaces a GitHub y LinkedIn en el pie y en «Sobre mí».

### Bug Fixes

- El tema automático sigue el modo claro u oscuro del sistema.
- El icono de Apple ya no da 404.
- La web no se indexa hasta el lanzamiento público.

### Performance Improvements

- La ciudad 3D se monta sin bloquear la carga de la página.
- El formulario de contacto carga Zod Mini en lugar de Zod completo.

## 0.1.0

### Features

- Proyecto base con Next.js 16 (App Router, Turbopack), React 19 con React Compiler, TypeScript estricto y Tailwind CSS 4.
- Validación de variables de entorno con Zod al arrancar y al compilar.
- Herramientas de calidad: ESLint (con `jsx-a11y`), Prettier, Vitest con Testing Library, Husky, lint-staged y commitlint.
- Integración continua con GitHub Actions y actualizaciones con Dependabot.
- Despliegue en Vercel (región `fra1`).
