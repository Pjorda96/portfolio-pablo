import { expect, test, type Page } from '@playwright/test';

import { contact as en, contactFormUi as enUi } from '../src/content/en/contact';
import { contact as es, contactFormUi as esUi } from '../src/content/es/contact';
import { MIN_FILL_MS } from '../src/lib/contact/anti-spam';
import { TEST_MAILER_FAIL_MARKER } from '../src/lib/contact/transport';
import { pageById } from './pages';

/**
 * The contact form against the production build. The server runs with the
 * test mailer (playwright.config.ts): nothing is ever sent. The anti-spam
 * checks stay on: the tests leave the honeypot empty and wait out the minimum
 * fill time like a person would.
 */

const copy = { es: { form: es.form, ui: esUi }, en: { form: en.form, ui: enUi } };
type Locale = keyof typeof copy;

const field = (page: Page, name: string) => page.locator(`#contact-${name}`);

/**
 * Opens the form with a client IP of its own: the rate limit (5 per IP and
 * 10 minutes) counts per test, not across the whole run.
 */
async function openForm(page: Page, locale: Locale) {
  const ip = `198.51.100.${Math.floor(Math.random() * 254) + 1}`;
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': `${ip}, 10.0.0.1` });
  await page.goto(pageById('contact')[locale]);
  const renderedAt = Date.now();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  return renderedAt;
}

async function fillValid(page: Page, message: string) {
  await field(page, 'name').fill('Ada Lovelace');
  await field(page, 'email').fill('ada@example.com');
  await field(page, 'company').fill('Analytical Engines');
  await field(page, 'service').selectOption('web');
  await field(page, 'message').fill(message);
  await field(page, 'privacy').check();
}

/** The signed token rejects submissions sent faster than a person types. */
async function waitMinimumFillTime(page: Page, renderedAt: number) {
  const left = renderedAt + MIN_FILL_MS + 500 - Date.now();
  if (left > 0) await page.waitForTimeout(left);
}

const submit = (page: Page, locale: Locale) =>
  page.getByRole('button', { name: copy[locale].form.submit }).click();

/** Counts the form posts that reach the server (Server Action requests). */
function countPosts(page: Page) {
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST') posts.push(request.url());
  });
  return posts;
}

for (const locale of ['es', 'en'] as const) {
  const { form, ui } = copy[locale];

  test.describe(`contact form (${locale})`, () => {
    test('sends a valid message', async ({ page }) => {
      const renderedAt = await openForm(page, locale);
      await fillValid(page, 'Quiero una web a medida para mi estudio de arquitectura.');
      await waitMinimumFillTime(page, renderedAt);
      await submit(page, locale);

      const success = page.getByRole('heading', { name: form.success.title });
      await expect(success).toBeVisible();
      await expect(success).toBeFocused();
      await expect(page.getByRole('status')).toContainText(form.success.text);
      await expect(page.locator('form')).toHaveCount(0);
    });

    test('shows the client validation errors without posting', async ({ page }) => {
      await openForm(page, locale);
      const posts = countPosts(page);
      await submit(page, locale);

      const summary = page.getByRole('group', { name: ui.errorSummary });
      await expect(summary).toBeVisible();
      await expect(summary).toBeFocused();
      for (const key of [
        'nameRequired',
        'emailRequired',
        'serviceRequired',
        'messageTooShort',
        'privacyRequired',
      ] as const) {
        await expect(summary.getByRole('link', { name: form.errors[key] })).toBeVisible();
      }
      for (const name of ['name', 'email', 'service', 'message', 'privacy']) {
        await expect(field(page, name)).toHaveAttribute('aria-invalid', 'true');
      }
      await expect(field(page, 'company')).not.toHaveAttribute('aria-invalid', 'true');
      // Each error is announced with its field.
      await expect(field(page, 'email')).toHaveAccessibleDescription(
        new RegExp(form.errors.emailRequired.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      );

      // Fixing some fields leaves only the remaining errors.
      await field(page, 'name').fill('Ada');
      await field(page, 'email').fill('ada@');
      await field(page, 'message').fill('Muy corto');
      await submit(page, locale);
      await expect(summary.getByRole('link', { name: form.errors.emailInvalid })).toBeVisible();
      await expect(summary.getByRole('link', { name: form.errors.messageTooShort })).toBeVisible();
      await expect(summary.getByRole('link', { name: form.errors.nameRequired })).toHaveCount(0);

      // A summary link takes the visitor to the field.
      await summary.getByRole('link', { name: form.errors.emailInvalid }).click();
      await expect(page).toHaveURL(/#contact-email$/);

      expect(posts).toEqual([]);
    });
  });
}

test.describe('contact form, server errors', () => {
  test('a delivery failure keeps the values and explains what to do', async ({ page }) => {
    const { form, ui } = copy.es;
    const renderedAt = await openForm(page, 'es');
    const message = `Este mensaje simula un fallo del proveedor de correo ${TEST_MAILER_FAIL_MARKER}.`;
    await fillValid(page, message);
    await waitMinimumFillTime(page, renderedAt);
    await submit(page, 'es');

    const summary = page.getByRole('group', { name: ui.errorSummary });
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary).toContainText(form.errors.generic);
    await expect(page.getByRole('heading', { name: form.success.title })).toHaveCount(0);
    // Nothing the visitor typed is lost.
    await expect(field(page, 'name')).toHaveValue('Ada Lovelace');
    await expect(field(page, 'email')).toHaveValue('ada@example.com');
    await expect(field(page, 'message')).toHaveValue(message);
  });

  test('a forged anti-spam token is rejected by the server', async ({ page }) => {
    const { form, ui } = copy.en;
    const renderedAt = await openForm(page, 'en');
    await fillValid(page, 'I would like a custom website for my architecture studio.');
    await page
      .locator('input[name="formToken"]')
      .evaluate((input: HTMLInputElement) => (input.value = `${Date.now() - 60_000}.forged`));
    await waitMinimumFillTime(page, renderedAt);
    await submit(page, 'en');

    const summary = page.getByRole('group', { name: ui.errorSummary });
    await expect(summary).toContainText(form.errors.spam);
    await expect(page.getByRole('heading', { name: form.success.title })).toHaveCount(0);
  });
});
