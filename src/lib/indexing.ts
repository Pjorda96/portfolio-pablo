/**
 * Whether search engines may index the site. Kept free of imports so
 * `next.config.ts` can use it for the `X-Robots-Tag` header.
 */

/**
 * The single switch that opens the site to search engines: on since the
 * launch (F7). Only the Vercel production deployment is indexable; previews
 * and local builds never are. Set it back to `false` to take the whole site
 * out of search engines (noindex on every page and `X-Robots-Tag`).
 */
export const INDEXABLE = true;

/** `VERCEL_ENV` as Vercel sets it; undefined outside Vercel. */
export type DeploymentEnv = 'production' | 'preview' | 'development';

export const DEPLOYMENT_ENVS = ['production', 'preview', 'development'] as const;

/**
 * Indexable only when the switch is on AND this is the production deployment.
 * Previews ("las previews no se indexan"), local builds and any build without
 * `VERCEL_ENV` stay out of search engines.
 */
export const isIndexable = (
  indexable: boolean,
  deploymentEnv: DeploymentEnv | undefined,
): boolean => indexable && deploymentEnv === 'production';
