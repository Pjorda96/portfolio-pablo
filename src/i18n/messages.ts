import { getContent, type Locale } from '@/content';

/**
 * next-intl messages are a projection of the content trees, never a second
 * source of copy: only the strings that Client Components without props need
 * (the mobile menu, the theme and language switchers, the error boundary).
 * Server Components read `getContent(locale)` directly.
 *
 * tests/i18n-messages.test.ts checks that both locales have the same keys and
 * that every key is used somewhere in `src/` (no orphans).
 */
export function buildMessages(locale: Locale) {
  const { menu, theme, languageSwitch, error } = getContent(locale).meta;
  return {
    Menu: { open: menu.open, close: menu.close, title: menu.title },
    Theme: { label: theme.label, auto: theme.auto, light: theme.light, dark: theme.dark },
    LocaleSwitcher: { label: languageSwitch.label, target: languageSwitch.target },
    Error: { title: error.title, text: error.text, retry: error.retry, back: error.back },
  };
}

export type Messages = ReturnType<typeof buildMessages>;

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
