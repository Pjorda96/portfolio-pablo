import { config } from 'zod/mini';

/**
 * Zod Mini, configured for the site's CSP. Import it from here, never from
 * 'zod' (ESLint enforces it). The schemas run in the browser too, and Mini
 * imported by name tree-shakes to a fraction of full Zod (/contacto loses
 * ~68 KB gzip of JS: 285 → 218 KB).
 *
 * Zod 4 compiles object parsers with `new Function` when it can, and probes
 * for it with a `new Function` call caught in a try/catch. Without
 * `'unsafe-eval'` in the CSP the probe still fires a `securitypolicyviolation`
 * in the browser (the contact form and the assistant parse on the client).
 * `jitless` skips both the probe and the compiled parsers.
 */
config({ jitless: true });

// Re-exported module by module (not as a `z` object) so the bundler can drop
// what the schemas don't use: import it as `import * as z from '@/lib/zod'`.
export * from 'zod/mini';
