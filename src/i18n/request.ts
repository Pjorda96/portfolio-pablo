import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { buildMessages } from './messages';
import { routing } from './routing';

/** Per-request i18n config, loaded by the next-intl plugin in next.config.ts. */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: buildMessages(locale),
    timeZone: 'Europe/Madrid',
  };
});
