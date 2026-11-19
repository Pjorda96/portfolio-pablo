import { expect, test, type Page } from '@playwright/test';

import { ALL_PATHS, footer, menu, nav, pageById } from './pages';

const h1 = (page: Page) => page.getByRole('heading', { level: 1 });

test.describe('every page', () => {
  test('the sitemap lists exactly the pages of both languages', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const xml = await response.text();
    const listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => new URL(match[1] ?? '').pathname,
    );
    expect(listed.toSorted()).toEqual(ALL_PATHS.toSorted());
  });

  for (const path of ALL_PATHS) {
    test(`${path} answers 200 with its h1`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(h1(page)).toHaveCount(1);
      await expect(h1(page)).toBeVisible();
      expect(await page.title()).not.toBe('');
    });
  }

  test('an unknown URL is a 404 page with its h1', async ({ page }) => {
    const response = await page.goto('/esta-calle-no-existe');
    expect(response?.status()).toBe(404);
    await expect(h1(page)).toBeVisible();
  });
});

test.describe('header navigation', () => {
  test('desktop header links reach every main page', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Below lg the header navigation collapses into the menu dialog.');
    const about = pageById('about');
    await page.goto(about.es);
    const header = page.getByRole('banner').getByRole('navigation', { name: nav.es.label });

    // Services disclosure → each service page.
    for (const id of ['services.web', 'services.ai', 'services.apps']) {
      const target = pageById(id).es;
      await header.getByRole('button', { name: nav.es.services }).click();
      await header.locator(`a[href="${target}"]`).click();
      await expect(page).toHaveURL(target);
      await expect(h1(page)).toBeVisible();
    }

    for (const [label, id] of [
      [nav.es.projects, 'casePixelYPapel'],
      [nav.es.about, 'about'],
      [nav.es.faq, 'faq'],
    ] as const) {
      await header.getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(pageById(id).es);
      await expect(h1(page)).toBeVisible();
    }

    await page.getByRole('banner').getByRole('link', { name: nav.es.cta }).click();
    await expect(page).toHaveURL(pageById('contact').es);

    await page.getByRole('banner').getByRole('link', { name: nav.es.home }).click();
    await expect(page).toHaveURL('/');
  });

  test('the menu dialog navigates and closes', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: menu.es.open });
    await toggle.click();
    const dialog = page.getByRole('dialog', { name: menu.es.title });
    await expect(dialog).toBeVisible();

    // Escape closes it and gives focus back to the toggle.
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(toggle).toBeFocused();

    await toggle.click();
    await dialog.getByRole('link', { name: nav.es.about, exact: true }).click();
    await expect(page).toHaveURL(pageById('about').es);
    await expect(h1(page)).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('the menu works on the English pages too', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'The desktop header has no menu toggle on inner pages.');
    await page.goto(pageById('faq').en);
    await page.getByRole('button', { name: menu.en.open }).click();
    const dialog = page.getByRole('dialog', { name: menu.en.title });
    await dialog.getByRole('link', { name: nav.en.cta }).click();
    await expect(page).toHaveURL(pageById('contact').en);
  });
});

test.describe('footer', () => {
  for (const locale of ['es', 'en'] as const) {
    test(`legal links (${locale})`, async ({ page }) => {
      await page.goto(pageById('about')[locale]);
      const legal = page.getByRole('contentinfo').getByRole('navigation', {
        name: footer[locale].legalLabel,
      });
      for (const [label, id] of [
        [footer[locale].notice, 'legal.notice'],
        [footer[locale].privacy, 'legal.privacy'],
        [footer[locale].cookies, 'legal.cookies'],
      ] as const) {
        await legal.getByRole('link', { name: label, exact: true }).click();
        await expect(page).toHaveURL(pageById(id)[locale]);
        await expect(h1(page)).toBeVisible();
      }
    });
  }
});
