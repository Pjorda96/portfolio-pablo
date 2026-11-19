import { z } from 'zod';

/**
 * Zod, configured for the site's CSP. Import `z` from here, never from 'zod'
 * (ESLint enforces it).
 *
 * Zod 4 compiles object parsers with `new Function` when it can, and probes
 * for it with a `new Function` call caught in a try/catch. Without
 * `'unsafe-eval'` in the CSP the probe still fires a `securitypolicyviolation`
 * in the browser (the contact form and the assistant parse on the client).
 * `jitless` skips both the probe and the compiled parsers.
 */
z.config({ jitless: true });

export { z };
