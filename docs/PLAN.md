# pablojorda.es — Plan del proyecto

> Rediseño completo del portfolio: de CV estático (CRA + Bootstrap, 2021) a una web de servicios
> que capte clientes, con un nivel técnico que sirva por sí mismo de demostración.
> El repositorio es **público** y forma parte del escaparate: el código, el proceso y las decisiones se ven.

## 1. Objetivo

- **Negocio:** que empresas y emprendedores contacten para encargar proyectos.
- **Escaparate:** que la propia web (y su repo) demuestren nivel senior: rendimiento, accesibilidad, SEO, seguridad, animación e IA aplicada.
- **Conversión:** un único CTA, el formulario de contacto. Sin precios públicos.
- **Tono:** profesional independiente, "disponible para nuevos proyectos". No se menciona dedicación parcial ni empleo actual.

## 2. Decisiones tomadas

| Tema      | Decisión                                                                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dominio   | `pablojorda.es` (hoy aparcado en Strato sin HTTPS → DNS a Vercel)                                                                                                                                                        |
| Idiomas   | Español (raíz, sin prefijo) + Inglés (`/en`), slugs traducidos, `hreflang` + `x-default`                                                                                                                                 |
| Servicios | 1) Desarrollo web a medida · 2) Soluciones con IA · 3) Apps / SaaS / MVPs                                                                                                                                                |
| Proyectos | Solo lo que está en producción: **Píxel y Papel** (web comercial + plataforma de bodas). Proyecto de 4 socios: se presenta como cofundador, explicando el papel técnico propio y sin atribuirse el proyecto en exclusiva |
| Precios   | No se muestran                                                                                                                                                                                                           |
| Contacto  | Solo formulario (Resend + Zod + rate limit + anti-spam)                                                                                                                                                                  |
| Foto      | Ilustración/avatar generado a partir de una foto nueva. **Nunca** la foto existente en el repo                                                                                                                           |
| Board     | GitHub Projects, con issues en este repo                                                                                                                                                                                 |
| Repo      | Se desmonta todo lo anterior; se reconstruye desde cero                                                                                                                                                                  |

## 3. Stack propuesto

Misma base probada en attrezzo / pixelypapel / viajapp (coherencia y velocidad), más una capa "wow" propia:

- **Next.js 16** (App Router, RSC, Turbopack, `proxy.ts`) · **React 19** + React Compiler · **TypeScript** strict
- **Tailwind CSS 4** con tokens semánticos y test automático de contraste WCAG
- **next-intl** (`as-needed`) · contenido de casos y servicios en **MDX** tipado
- **Motion** + scroll suave (Lenis) + **View Transitions API** entre páginas, todo con `prefers-reduced-motion`
- **WebGL** ligero en el hero (shader / R3F cargado de forma diferida, fallback estático, sin penalizar LCP)
- **IA real en la web:** asistente "pregúntame sobre mis servicios" con la API de Claude, respuestas basadas solo en el contenido del sitio, streaming, rate limit y coste acotado → demuestra el servicio de soluciones con IA en vivo
- **Resend** + Zod + rate limit + honeypot / Cloudflare Turnstile en el formulario
- **Seguridad:** CSP con nonce, HSTS, COOP/CORP, Permissions-Policy
- **Calidad:** Vitest + Testing Library, Playwright E2E, axe, Lighthouse CI con presupuestos, GitHub Actions, Husky
- **Hosting:** Vercel (región fra1) · Vercel Analytics + Speed Insights

## 4. Mapa del sitio (ES / EN)

| ES                                   | EN                                    | Intención SEO                                  |
| ------------------------------------ | ------------------------------------- | ---------------------------------------------- |
| `/`                                  | `/en`                                 | Marca + "desarrollador web freelance Valencia" |
| `/servicios/desarrollo-web-a-medida` | `/en/services/custom-web-development` | Servicio                                       |
| `/servicios/soluciones-ia`           | `/en/services/ai-solutions`           | Servicio                                       |
| `/servicios/apps-saas-mvp`           | `/en/services/saas-mvp-development`   | Servicio                                       |
| `/proyectos/pixel-y-papel`           | `/en/projects/pixel-y-papel`          | Caso de estudio                                |
| `/sobre-mi`                          | `/en/about`                           | Marca personal / E-E-A-T                       |
| `/preguntas-frecuentes`              | `/en/faq`                             | FAQ (dudas antes de contratar, FAQPage)        |
| `/contacto`                          | `/en/contact`                         | Conversión                                     |
| `/blog` (fase 2, opcional)           | `/en/blog`                            | Long-tail y autoridad                          |
| `/legal/*`                           | `/en/legal/*`                         | Privacidad, cookies, aviso legal               |

**Home:** hero con propuesta de valor + CTA → servicios → caso destacado → proceso (4 pasos) → stack/capacidades → asistente IA → FAQ → CTA final.

## 5. SEO (prioridad alta)

- Metadata centralizada (`lib/seo.ts`): title/description únicos, canonical, hreflang, OG/Twitter coherentes
- **OG dinámicas** por página e idioma (`next/og`)
- **JSON-LD:** `Person` + `ProfessionalService` (areaServed España, `sameAs` LinkedIn/GitHub), `Service` por servicio, `CreativeWork` en el caso, `BreadcrumbList`, `FAQPage`, `WebSite`
- `sitemap.ts` con alternates, `robots.ts`, `llms.txt` para buscadores con IA
- Core Web Vitals objetivo: LCP < 2 s, INP < 150 ms, CLS < 0.05; 100 en Lighthouse SEO/A11y/Best Practices
- Contenido orientado a intención (una página por servicio, FAQ que responde objeciones)
- Lanzamiento: Google Search Console, Bing Webmaster, Google Business Profile, enlaces desde GitHub/LinkedIn/pixelypapel

## 6. Fases

| Fase                     | Contenido                                                                                                         | Quién                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **F0 Fundamentos**       | Limpiar repo (quitar CRA, CVs, `.env`, foto), scaffold Next 16, tooling, CI, proyecto Vercel con previews         | Agente (Sonnet)                |
| **F1 Identidad**         | Dirección de arte propia (distinta de attrezzo y pixelypapel), tipografía, paleta, tokens, monograma/logo, avatar | Claude + tú (validación)       |
| **F2 Contenido**         | Copy ES/EN de servicios, caso Píxel y Papel, sobre mí, FAQ, legal                                                 | Claude redacta, tú revisas     |
| **F3 Páginas**           | Layout, home, servicios, caso, sobre mí, contacto, legal                                                          | Agentes en paralelo por página |
| **F4 Experiencia**       | Hero WebGL, transiciones, animaciones de scroll, asistente IA                                                     | Agente (Opus) + revisión       |
| **F5 SEO y rendimiento** | Metadata, JSON-LD, OG, sitemap, budgets, optimización de imágenes                                                 | Agente + auditoría             |
| **F6 Calidad**           | Tests unitarios/E2E, axe, Lighthouse CI, revisión de seguridad                                                    | Agentes                        |
| **F7 Lanzamiento**       | DNS de pablojorda.es → Vercel, Search Console, analítica, README del repo                                         | Claude + tú (DNS)              |

## 7. Pendiente de ti

1. **Trayectoria 2022–2026:** LinkedIn pide iniciar sesión. Inicia sesión en el navegador integrado o pégame la experiencia.
2. **Foto nueva** para generar el avatar ilustrado.
3. **Permiso de Píxel y Papel:** acordar con los socios qué cifras y capturas se pueden mostrar y cómo se describe tu papel.
4. **Acceso al DNS** de pablojorda.es en Strato (en F7).
5. **Historial del repo:** los CVs en PDF y la foto antigua siguen en el historial público de git; decidir si reescribirlo.
6. **API keys** (Resend, Anthropic) cuando lleguemos a F3/F4.
