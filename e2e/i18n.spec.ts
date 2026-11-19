import { expect, test, type Page } from '@playwright/test';

import { htmlLang, languageSwitch, pageById, PAGES } from './pages';

const pathOf = (href: string | null) => (href ? new URL(href).pathname : null);

/** The footer's language link (present on every page, any viewport). */
const footerSwitch = (page: Page, target: 'es' | 'en') =>
  page.getByRole('contentinfo').locator(`a[hreflang="${target}"]`);

test.describe('language switch', () => {
  for (const { id, es, en } of PAGES) {
    test(`${es} ⇄ ${en}`, async ({ page }) => {
      await page.goto(es);
      await expect(page.locator('html')).toHaveAttribute('lang', htmlLang.es);

      const toEnglish = footerSwitch(page, 'en');
      await expect(toEnglish).toHaveAttribute('href', en);
      await expect(toEnglish).toContainText(languageSwitch.es.target);
      await toEnglish.click();
      await expect(page).toHaveURL(en);
      await expect(page.locator('html')).toHaveAttribute('lang', htmlLang.en);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      const toSpanish = footerSwitch(page, 'es');
      await expect(toSpanish, `${id}: back link`).toHaveAttribute('href', es);
      await toSpanish.click();
      await expect(page).toHaveURL(es);
      await expect(page.locator('html')).toHaveAttribute('lang', htmlLang.es);
    });
  }
});

test.describe('canonical and hreflang', () => {
  for (const { es, en } of PAGES) {
    for (const [locale, path] of [
      ['es', es],
      ['en', en],
    ] as const) {
      test(`${path}`, async ({ page }) => {
        await page.goto(path);
        const head = page.locator('head');
        expect(pathOf(await head.locator('link[rel="canonical"]').getAttribute('href'))).toBe(path);

        const alternate = (lang: string) =>
          head.locator(`link[rel="alternate"][hreflang="${lang}"]`).getAttribute('href');
        expect(pathOf(await alternate(htmlLang.es))).toBe(es);
        expect(pathOf(await alternate(htmlLang.en))).toBe(en);
        expect(pathOf(await alternate('x-default'))).toBe(es);

        await expect(page.locator('html')).toHaveAttribute('lang', htmlLang[locale]);
        // Previews and local builds are never indexable.
        await expect(head.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      });
    }
  }
});

test.describe('non-canonical URLs', () => {
  test('/es/... redirects to the Spanish page at the root', async ({ page }) => {
    const about = pageById('about');
    await page.goto(`/es${about.es}`);
    await expect(page).toHaveURL(about.es);
  });

  test('a Spanish slug under /en redirects to the English slug', async ({ page }) => {
    const service = pageById('services.ai');
    await page.goto(`/en${service.es}`);
    await expect(page).toHaveURL(service.en);
    await expect(page.locator('html')).toHaveAttribute('lang', htmlLang.en);
  });

  test('an English slug without /en redirects to the Spanish page', async ({ page }) => {
    const about = pageById('about');
    await page.goto(about.en.replace(/^\/en/, ''));
    await expect(page).toHaveURL(about.es);
    await expect(page.locator('html')).toHaveAttribute('lang', htmlLang.es);
  });

  test('the 404 page links to the other language', async ({ page }) => {
    await page.goto('/en/no-such-street');
    await expect(footerSwitch(page, 'es')).toHaveAttribute('href', '/no-such-street');
  });
});
