import { z } from 'zod';

/**
 * Runtime-validated environment.
 *
 * Only `SITE_URL` exists today. Variables for services that are not integrated
 * yet are listed commented out, next to the phase that wires them in; when a
 * service lands, uncomment its lines here, in `.env.example` and in the CI
 * workflows in the same change.
 *
 * `next.config.ts` imports this module, so an invalid environment stops
 * `next dev` and `next build` before anything is compiled.
 */
const DEV_SITE_URL = 'http://localhost:3000';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

// Reserved for the optional service keys below.
// const optional = <T extends z.ZodType>(schema: T) =>
//   z.preprocess(emptyToUndefined, schema.optional());

const createServerSchema = (isProduction: boolean) =>
  z.object({
    // Canonical origin, used for metadataBase, canonical URLs and sitemaps.
    // Required in production; falls back to the dev server elsewhere.
    SITE_URL: z.preprocess(
      emptyToUndefined,
      isProduction ? z.url() : z.url().default(DEV_SITE_URL),
    ),

    // Email (Resend) — contact form, F3
    // RESEND_API_KEY: optional(z.string().startsWith('re_')),
    // CONTACT_TO_EMAIL: optional(z.email()),

    // AI assistant (Anthropic) — F4
    // ANTHROPIC_API_KEY: optional(z.string().startsWith('sk-ant-')),

    // Anti-spam (Cloudflare Turnstile) — F3
    // TURNSTILE_SECRET_KEY: optional(z.string().min(1)),
  });

const clientSchema = z.object({
  // Anti-spam (Cloudflare Turnstile) — F3
  // NEXT_PUBLIC_TURNSTILE_SITE_KEY: optional(z.string().min(1)),
});

export type Env = z.infer<ReturnType<typeof createServerSchema>> & z.infer<typeof clientSchema>;

type EnvSource = Record<string, string | undefined>;

/**
 * Validates `source` and returns the typed environment, or throws one error
 * listing every invalid variable. Exported for tests; app code imports `env`.
 */
export function parseEnv(source: EnvSource, { isServer = true } = {}): Env {
  const isProduction = source.NODE_ENV === 'production';
  const schema = isServer
    ? createServerSchema(isProduction).extend(clientSchema.shape)
    : clientSchema;

  const parsed = schema.safeParse(source);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Invalid environment variables:\n${issues}\nSee .env.example for the expected values.`,
    );
  }

  return parsed.data as Env;
}

/**
 * Next only inlines `NEXT_PUBLIC_*` values that are referenced literally, so
 * `process.env` cannot be passed to the parser wholesale on the client.
 */
const runtimeEnv: EnvSource = {
  NODE_ENV: process.env.NODE_ENV,
  SITE_URL: process.env.SITE_URL,
  // NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
};

// On the client the server-only variables are undefined by design, so only the
// public subset is validated there.
export const env = parseEnv(runtimeEnv, { isServer: typeof window === 'undefined' });
