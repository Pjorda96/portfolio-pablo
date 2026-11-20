# Lanzamiento

La web está publicada en `https://pablojorda.es` desde la release 0.2.0, pero **sin indexar**. Este documento recoge cómo está preparado todo y qué hacer el día del lanzamiento público.

## Estado actual

| Pieza                 | Estado                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Indexación            | Apagada: `INDEXABLE = false` en [`src/lib/indexing.ts`](../src/lib/indexing.ts). Todas las páginas llevan `noindex` y todas las respuestas `X-Robots-Tag: noindex`. |
| `robots.txt`          | Permite rastrear (`Allow: /`, salvo `/api/`) y enlaza al sitemap. Hace falta para que los buscadores lean el `noindex`.                                             |
| Google Search Console | Propiedad de dominio `pablojorda.es` verificada por DNS (registro TXT en Strato). Sitemap `https://pablojorda.es/sitemap.xml` enviado.                              |
| Bing Webmaster Tools  | Sitio `https://pablojorda.es/` verificado por DNS (CNAME en Strato). Sitemap enviado.                                                                               |
| Analytics             | Vercel Web Analytics y Speed Insights en el código. Hay que activarlos en el panel del proyecto en Vercel para ver datos.                                           |

Mientras la indexación esté apagada, Search Console y Bing mostrarán las páginas como **excluidas por `noindex`**. Es lo esperado.

## Registros DNS que no hay que borrar

Están en Strato, en _Dominios › pablojorda.es › DNS › Registros TXT y CNAME_. Si se borran, se pierde la verificación.

| Tipo  | Nombre                                               | Valor                        | Para                   |
| ----- | ---------------------------------------------------- | ---------------------------- | ---------------------- |
| TXT   | `pablojorda.es`                                      | `google-site-verification=…` | Google Search Console  |
| CNAME | `503fe508094440c9c1c93f4a774ae5bd.pablojorda.es`     | `verify.bing.com.`           | Bing Webmaster Tools   |
| TXT   | `resend._domainkey.web.pablojorda.es`                | Clave DKIM de Resend         | Formulario de contacto |
| CNAME | `rsend.web.pablojorda.es` / `send.web.pablojorda.es` | `*.forge.rmta.net.`          | Formulario de contacto |

El MX (`smtp.rzone.de`) y el correo de Strato no dependen de ninguno de ellos.

## Antes del lanzamiento

- [ ] NIF y domicilio en [`src/content/owner.ts`](../src/content/owner.ts): el aviso legal y la privacidad los muestran como «pendiente».
- [ ] Revisar los textos legales (cabecera de [`src/content/es/legal.ts`](../src/content/es/legal.ts)).
- [ ] Activar Web Analytics y Speed Insights en el panel de Vercel.
- [ ] Opcional: `ANTHROPIC_API_KEY` en Vercel para activar el asistente de IA.

## El día del lanzamiento

1. **Encender la indexación.** En una rama desde `develop`, poner `INDEXABLE = true` en `src/lib/indexing.ts` y ajustar el test de `tests/seo.test.ts` que comprueba el valor. PR a `develop` (sube la versión) y release a `master` como indica [VERSIONING.md](VERSIONING.md).
2. **Comprobar producción** una vez desplegada:
   ```bash
   curl -sI https://pablojorda.es/ | grep -i x-robots-tag   # no debe salir nada
   curl -s https://pablojorda.es/ | grep -o '<meta name="robots"[^>]*>'   # index, follow
   ```
3. **Google Search Console** (`sc-domain:pablojorda.es`):
   - _Sitemaps_: volver a enviar `https://pablojorda.es/sitemap.xml`.
   - _Inspección de URLs_: pedir la indexación de `/`, `/en`, las tres páginas de servicios y `/contacto`.
   - En los días siguientes, revisar _Indexación de páginas_: las URLs deben pasar de «Excluida por la etiqueta noindex» a «Indexada».
4. **Bing Webmaster Tools**:
   - _Sitemaps_: volver a enviar el sitemap.
   - _URL Submission_: enviar las mismas URLs principales.
5. **Validar los datos estructurados** con la [prueba de resultados enriquecidos](https://search.google.com/test/rich-results) y el [validador de Schema.org](https://validator.schema.org/) en la home, un servicio, la FAQ y el caso de estudio.
6. **Perfil de empresa de Google** (#68) y enlaces desde LinkedIn y la web de Píxel y Papel (#70), si no están ya.

## Volver a apagar la indexación

Poner `INDEXABLE = false` y publicar. Para retirar algo ya indexado con urgencia, usar además _Retirada de URLs_ en Search Console.
