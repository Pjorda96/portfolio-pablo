import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';

import type { Locale } from '@/content';
import { buildMessages } from '@/i18n/messages';

/** Wraps `ui` in the same provider the `[locale]` layout renders. */
export const withIntl = (ui: ReactNode, locale: Locale = 'es') => (
  <NextIntlClientProvider locale={locale} messages={buildMessages(locale)} timeZone="Europe/Madrid">
    {ui}
  </NextIntlClientProvider>
);

export const renderWithIntl = (ui: ReactNode, locale: Locale = 'es') =>
  render(withIntl(ui, locale));
