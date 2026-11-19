import { z } from 'zod';

/**
 * Runtime-validated environment.
 *
 * `SITE_URL` plus the optional contact form (Resend) and AI assistant
 * (Anthropic) settings. Variables for
 * services that are not integrated yet are listed commented out, next to the
 * phase that wires them in; when a service lands, uncomment its lines here, in
 * `.env.example` and in the CI workflows in the same change.
 *
 * `next.config.ts` imports this module, so an invalid environment stops
 * `next dev` and `next build` before anything is compiled.
 */
const DEV_SITE_URL = 'http://localhost:3000';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

// Optional service keys: an empty value counts as unset.
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(emptyToUndefined, schema.optional());

const createServerSchema = (isProduction: boolean) =>
  z.object({
    // Canonical origin, used for metadataBase, canonical URLs and sitemaps.
    // Required in production; falls back to the dev server elsewhere.
    SITE_URL: z.preprocess(
      emptyToUndefined,
      isProduction ? z.url() : z.url().default(DEV_SITE_URL),
    ),

    // Email (Resend) — contact form, F3. All optional: without the API key the
    // form logs messages in development and reports "temporarily unavailable"
    // in production (see src/lib/contact/submit.ts).
    RESEND_API_KEY: optional(z.string().startsWith('re_')),
    // Sender, `Name <address>` or a bare address on a domain verified in Resend.
    CONTACT_FROM_EMAIL: optional(z.string().min(3)),
    // Inbox that receives the messages; defaults to the owner's email.
    CONTACT_TO_EMAIL: optional(z.email()),
    // Secret that signs the form's anti-spam timestamp. Falls back to a value
    // derived from RESEND_API_KEY, which is stable across instances.
    CONTACT_FORM_SECRET: optional(z.string().min(16)),

    // AI assistant (Anthropic) — F4. Optional: without the key the home
    // assistant shows "temporarily unavailable" and its API answers 503
    // (see src/lib/assistant/handler.ts).
    ANTHROPIC_API_KEY: optional(z.string().startsWith('sk-ant-')),
    // Model the assistant runs on; defaults to claude-opus-5-5. Set it to
    // claude-haiku-5-5 to cut cost.
    ASSISTANT_MODEL: optional(z.string().regex(/^claude-[a-z0-9.-]+$/)),

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
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
  CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  CONTACT_FORM_SECRET: process.env.CONTACT_FORM_SECRET,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ASSISTANT_MODEL: process.env.ASSISTANT_MODEL,
  // NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
};

// On the client the server-only variables are undefined by design, so only the
// public subset is validated there.
export const env = parseEnv(runtimeEnv, { isServer: typeof window === 'undefined' });
