# Rendimiento: presupuestos de Core Web Vitals

Presupuestos del sitio y cómo se vigilan. Se miden en laboratorio con
Lighthouse **móvil** (throttling simulado: 4G lenta y CPU ×4), que es el peor
caso razonable para una web de captación que se abre desde el móvil.

## Presupuestos

| Métrica                   | Presupuesto (falla en CI) | Objetivo (aviso) | Por qué                                                                       |
| ------------------------- | ------------------------- | ---------------- | ----------------------------------------------------------------------------- |
| LCP                       | ≤ 2,5 s                   | ≤ 1,8 s          | Umbral «bueno» de Google; el LCP es texto del servidor, sin excusa para más.  |
| CLS                       | ≤ 0,1                     | ≤ 0,01 (meta 0)  | Imágenes con dimensiones y fuentes con _fallback_ ajustado: no debe moverse.  |
| TBT (proxy de INP)        | ≤ 300 ms                  | ≤ 200 ms         | El INP necesita interacción real; en laboratorio se vigila el bloqueo de CPU. |
| INP (campo)               | ≤ 200 ms (p75)            | —                | Se comprueba con datos reales (CrUX / Search Console), no en CI.              |
| JS (transferido)          | ≤ 225 KB                  | —                | React + Next ≈ 120 KB; deja margen al código propio sin cargar three.js.      |
| Fuentes (transferido)     | ≤ 130 KB                  | —                | Tres familias variables, solo subconjunto latino.                             |
| Peso total (carga)        | ≤ 425 KB                  | —                | Página de texto + avatar; la ciudad 3D no cuenta (llega después).             |
| Puntuación de rendimiento | —                         | ≥ 90             | Resumen; las métricas de arriba son las que mandan.                           |

## Cómo se comprueba

- **CI**: job `lighthouse` en `.github/workflows/PR.yml`. Compila, arranca
  `next start -p 3400` y pasa Lighthouse CI (`lighthouserc.json`) sobre `/`,
  `/sobre-mi`, `/servicios/soluciones-ia` y `/en`: 3 pasadas por URL, se
  evalúa la mediana. Los presupuestos son `error` y los objetivos `warn`.
  **No es un check requerido**: los tiempos de laboratorio varían entre
  runners y no debe volver inestable `verify`. Los informes quedan como
  artefacto `lighthouse-reports`.
- **Local**: `npm run build && npm run lhci` (informes en `.lighthouseci/`).
- Para añadir categorías (p. ej. accesibilidad en F6-03) basta con ampliar
  `onlyCategories` y las aserciones de `lighthouserc.json`.

## Decisiones que sostienen los números

- **La ciudad 3D no compite con la carga.** El _chunk_ de three.js (~250 KB
  gzip) se pide tras `load`, en la primera interacción (puntero, toque, rueda,
  scroll, teclado) o a los 4 s si no la hay, y siempre en un momento ocioso
  (`src/components/city/schedule.ts`). Mientras tanto se ve el cielo estático.
- **Se construye a trozos.** La geometría se genera paso a paso
  (`buildCitySteps`) cediendo el hilo principal cada ~12 ms
  (`scheduler.yield()` o `setTimeout`), y los _shaders_ se compilan en paralelo
  (`compileAsync`, `KHR_parallel_shader_compile`) antes de arrancar el bucle.
  Con la ciudad montándose dentro de la medición, el TBT de la home baja de
  ~2,1 s a ~0,33 s.
- **_Pixel ratio_ limitado**: 2 en escritorio y 1,5 en táctil.
- **Fuentes** con `next/font`: autoalojadas, `display: swap` y _fallback_ con
  métricas ajustadas (`size-adjust`), sin saltos de maquetación. JetBrains Mono
  no se precarga (solo etiquetas).
- **Imágenes** con `next/image` e importación estática (ancho y alto
  declarados, `sizes` ajustado y _placeholder_ borroso). Formato de origen
  WebP; se recomienda servir AVIF además (`images.formats` en `next.config.ts`).

## Nota sobre versiones de Lighthouse

Lighthouse CI usa Lighthouse 13, cuyo modelo simulado da LCP de ~0,8–0,9 s en
estas páginas. Lighthouse 12 estima ~3,1–3,3 s para las mismas páginas porque
suma toda la descarga temprana de JS y fuentes; el LCP observado sin
throttling es ~0,2 s. Al comparar números, usa siempre la misma versión.
