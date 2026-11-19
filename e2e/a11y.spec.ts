import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { contact } from '../src/content/es/contact';
import { THEME_STORAGE_KEY } from '../src/lib/theme/preference';
import { ALL_PATHS, menu, pageById } from './pages';

/**
 * axe on every page, in both languages and both palettes, plus the states
 * that only exist after interaction (menu dialog, form errors). The theme is
 * pinned the way a visitor pins it (the stored preference read by the boot
 * script), and the system colour scheme is emulated to match, so `auto`
 * agrees too.
 *
 * Reduced motion: the scroll-driven reveals start semi-transparent, which axe
 * would measure mid-animation; with reduced motion everything is shown as is.
 *
 * Fails on serious and critical violations (WCAG 2.2 A/AA rules and axe best
 * practices).
 */

const THEMES = [
  { name: 'light', mode: 'day', colorScheme: 'light' },
  { name: 'dark', mode: 'night', colorScheme: 'dark' },
] as const;

const BLOCKING = new Set(['serious', 'critical']);

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();

  const report = results.violations
    .filter((v) => BLOCKING.has(v.impact ?? ''))
    .map((v) => ({
      rule: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 5).map((n) => ({ target: n.target, summary: n.failureSummary })),
    }));
  expect(report, JSON.stringify(report, null, 2)).toEqual([]);
}

for (const theme of THEMES) {
  test.describe(`${theme.name} theme`, () => {
    test.use({ colorScheme: theme.colorScheme, reducedMotion: 'reduce' });

    test.beforeEach(async ({ page }) => {
      await page.addInitScript(
        ([key, value]) => {
          try {
            window.localStorage.setItem(key, value);
          } catch {}
        },
        [THEME_STORAGE_KEY, theme.name] as const,
      );
    });

    const open = async (page: Page, path: string) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-mode', theme.mode);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    };

    for (const path of ALL_PATHS) {
      test(`${path} has no serious accessibility violations`, async ({ page }) => {
        await open(page, path);
        await expectNoSeriousViolations(page);
      });
    }

    test('the open menu dialog has no serious violations', async ({ page }) => {
      await open(page, '/');
      await page.getByRole('button', { name: menu.es.open }).click();
      await expect(page.getByRole('dialog', { name: menu.es.title })).toBeVisible();
      await expectNoSeriousViolations(page);
    });

    test('the contact form with errors has no serious violations', async ({ page }) => {
      await open(page, pageById('contact').es);
      await page.getByRole('button', { name: contact.form.submit }).click();
      await expect(page.locator('#contact-name')).toHaveAttribute('aria-invalid', 'true');
      await expectNoSeriousViolations(page);
    });
  });
}
