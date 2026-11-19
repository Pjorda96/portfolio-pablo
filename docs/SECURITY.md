# Seguridad: CSP y cabeceras

Todas las cabeceras salen de `headers()` en [`next.config.ts`](../next.config.ts), que las toma de
[`src/lib/security/csp.ts`](../src/lib/security/csp.ts) (módulo puro, con tests en
[`tests/security-csp.test.ts`](../tests/security-csp.test.ts)). Se aplican a todas las rutas,
también a ficheros sin HTML (`llms.txt`, imágenes, `sitemap.xml`...).

## Por qué la CSP es estática (sin nonce)

Un nonce tiene que ser distinto en cada respuesta, así que obliga a renderizar **todas** las páginas
en cada petición. La web está prerenderizada a propósito (solo `/contacto`, `/api/assistant` y el
404 son dinámicos), de modo que la CSP se fija en el build y no lleva nonce.

### `'unsafe-inline'` en `script-src`: inevitable sin nonce

Comprobado sobre un build de producción:

- Next escribe el _payload_ RSC de cada página como varios `<script>self.__next_f.push(...)</script>`
  en línea (cuatro en la home). Su contenido cambia con cada página y cada build, y la cabecera se
  calcula antes de renderizar las páginas, así que no se pueden listar por hash.
- Con un hash en `script-src`, el navegador **ignora** `'unsafe-inline'`. Probado: con el hash del
  script de tema y sin `'unsafe-inline'` efectivo, el script de tema se ejecuta pero los scripts RSC
  se bloquean y la página no se hidrata. Con `'strict-dynamic'` es peor: también bloquea los chunks
  de `/_next/static`, que el HTML carga con `<script src>` del propio parser.
- Por eso la política **no lleva hashes** (un test lo vigila) y el script de tema
  (`src/lib/theme/boot-script.ts`) va cubierto por `'unsafe-inline'`.
- El SRI experimental de Next (`experimental.sri`) solo añade `integrity` a los chunks externos;
  no elimina los scripts en línea, así que no permite quitar `'unsafe-inline'` y no se activa.
- Los `<script type="application/ld+json">` (JSON-LD) no se ejecutan: la CSP no los bloquea ni
  genera violaciones.

Para compensar, el resto de la política es estricta: nada de terceros (todo `'self'`), sin
`'unsafe-eval'` en producción, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`,
`frame-ancestors 'none'` y sin `<style>` en línea. El riesgo que queda es una inyección de HTML con
`<script>` en línea; el contenido es estático y propio, y React escapa todo lo que pinta.

Si algún día hiciera falta quitar `'unsafe-inline'`, el camino es el nonce: `proxy.ts` genera uno
por petición (la guía de Next en `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`)
y todas las páginas pasan a dinámicas.

### Zod sin `new Function`

Zod 4 compila los validadores con `new Function` y lo comprueba con una llamada dentro de un
`try/catch`. Sin `'unsafe-eval'`, esa comprobación dispara igualmente un `securitypolicyviolation`
en el navegador (el formulario de contacto valida en cliente). [`src/lib/zod.ts`](../src/lib/zod.ts)
activa `jitless` y ESLint obliga a importar `z` desde ahí, nunca desde `'zod'`.

## La política

Producción (`VERCEL_ENV=production`):

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
style-src-elem 'self'; style-src-attr 'unsafe-inline'; connect-src 'self';
img-src 'self' data: blob:; font-src 'self'; worker-src 'self'; frame-src 'none';
object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
manifest-src 'self'; upgrade-insecure-requests
```

| Directiva                   | Por qué                                                                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `script-src`                | Ver arriba. `'unsafe-eval'` solo con `next dev` (React lo usa para depurar).                                                                                                                                                         |
| `style-src-elem 'self'`     | Hojas de estilo solo del sitio; ningún `<style>` en línea en producción.                                                                                                                                                             |
| `style-src-attr`            | React pinta atributos `style="..."` en el HTML del servidor.                                                                                                                                                                         |
| `style-src`                 | Respaldo para navegadores sin las directivas `-elem`/`-attr`.                                                                                                                                                                        |
| `connect-src 'self'`        | El asistente (`/api/assistant`) y la Server Action del formulario. Vercel Web Analytics y Speed Insights cargan sus scripts y envían sus datos a `/_vercel/...`: mismo origen, ya cubierto. Solo se montan en despliegues de Vercel. |
| `img-src data: blob:`       | Placeholders de `next/image` (`data:`) y texturas de canvas/WebGL (`blob:`).                                                                                                                                                         |
| `worker-src 'self'`         | three.js trabaja en el hilo principal; ningún worker `blob:` ni de terceros.                                                                                                                                                         |
| `upgrade-insecure-requests` | Solo en despliegues de Vercel (HTTPS). En `next start` local por http rompería los propios recursos.                                                                                                                                 |

Desarrollo (`next dev`) añade `'unsafe-eval'` a `script-src` y `'unsafe-inline'` a `style-src-elem`
(overlay de errores y HMR).

### Previews de Vercel

En las previews (`VERCEL_ENV=preview`) Vercel inyecta su barra de herramientas (comentarios,
feedback) desde `vercel.live`. La política de las previews la permite, y solo ahí:

- `script-src`, `style-src`, `frame-src`: `https://vercel.live`
- `style-src-elem`: `'unsafe-inline' https://vercel.live`
- `connect-src`: `https://vercel.live wss://ws-us3.pusher.com`
- `img-src`: `https://vercel.live https://vercel.com`
- `font-src`: `https://vercel.live https://assets.vercel.com`

Producción no lleva nada de esto. Las previews no son públicas ni indexables, y la barra es útil
para revisar.

## Cabeceras

| Cabecera                       | Valor                                                                | Dónde                                                                 |
| ------------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `Content-Security-Policy`      | La de arriba                                                         | Todas las rutas                                                       |
| `Strict-Transport-Security`    | `max-age=63072000; includeSubDomains; preload`                       | Solo producción                                                       |
| `Cross-Origin-Opener-Policy`   | `same-origin`                                                        | Todas                                                                 |
| `Cross-Origin-Resource-Policy` | `same-origin`                                                        | Todas, salvo la fila de abajo                                         |
| `Cross-Origin-Resource-Policy` | `cross-origin`                                                       | Imágenes OG/Twitter, `icon.svg`, `apple-icon`, `manifest.webmanifest` |
| `Permissions-Policy`           | Cámara, micrófono, geolocalización, pagos, USB... denegados          | Todas                                                                 |
| `Referrer-Policy`              | `strict-origin-when-cross-origin`                                    | Todas                                                                 |
| `X-Content-Type-Options`       | `nosniff`                                                            | Todas                                                                 |
| `X-Frame-Options`              | `DENY` (redundante con `frame-ancestors`, para navegadores antiguos) | Todas                                                                 |
| `X-Robots-Tag`                 | `noindex`                                                            | Mientras no sea indexable                                             |

- **HSTS** solo en producción: con `preload` es difícil de deshacer, y `*.vercel.app` ya está en la
  lista de precarga. Antes de enviar el dominio a [hstspreload.org](https://hstspreload.org)
  hay que confirmar que **todos** los subdominios de `pablojorda.es` sirven HTTPS.
- **CORP `cross-origin`** en las imágenes sociales y los iconos: las redes sociales las descargan
  desde su servidor (ahí CORP no aplica), pero algunas vistas previas las cargan desde el
  navegador en otro origen, y `same-origin` las bloquearía.

## Cómo se comprueba

- `npm run test`: la política y las cabeceras por entorno.
- `npm audit --omit=dev --audit-level=high` en el job `verify` de cada pull request.
- A mano, tras `npm run build && npm run start`: `curl -I http://localhost:3000/` para ver las
  cabeceras, y la consola del navegador sin violaciones de CSP en la home (con la ciudad 3D montada),
  una página de servicio, `/contacto` (enviando datos inválidos), el cambio de tema y de idioma.
- En la preview de Vercel: [securityheaders.com](https://securityheaders.com) y
  [Mozilla Observatory](https://developer.mozilla.org/en-US/observatory). La nota esperada es
  **A** (no A+): ambos penalizan `'unsafe-inline'` en `script-src`.
