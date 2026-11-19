import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests (`e2e/`) against the production build: `npm run build`
 * first, then `npm run test:e2e` starts `next start` on its own port.
 *
 * The server runs with the contact form's test mailer (CONTACT_TEST_MAILER,
 * src/lib/contact/transport.ts) and without any Resend or Anthropic key, so a
 * test run can never send an email or call the AI assistant's provider.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Phone layout (menu dialog instead of the header navigation). Chromium
      // too: one browser download in CI.
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      // The accessibility sweep is layout-independent enough to run once.
      testIgnore: /a11y\.spec\.ts/,
    },
  ],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: baseURL,
    // Never reuse a server started elsewhere: it may have a real mailer.
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'pipe',
    env: {
      // Required by src/env.ts in production; never contacted.
      SITE_URL: process.env.SITE_URL ?? baseURL,
      CONTACT_TEST_MAILER: '1',
      // Empty values win over any .env.local: never a real email or model call.
      RESEND_API_KEY: '',
      ANTHROPIC_API_KEY: '',
    },
  },
});
