/**
 * Whether search engines may index the site. Kept free of imports so
 * `next.config.ts` can use it for the `X-Robots-Tag` header.
 */

/**
 * The single switch that opens the site to search engines. Off for now: the
 * site is published on pablojorda.es for a soft launch (Search Console and
 * Bing set up ahead) and turned on at the public launch. Off means noindex on
 * every page plus `X-Robots-Tag`, while robots.txt still allows crawling so
 * search engines can see the noindex. Even when on, only the Vercel
 * production deployment is indexable: previews and local builds never are.
 */
export const INDEXABLE = false;

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
