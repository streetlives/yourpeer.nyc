/**
 * Browser-side route interceptions via Playwright's page.route().
 *
 * NOTE: These only intercept requests made in the browser (client components,
 * client-side axios calls, etc.). Server component fetches are handled by the
 * mock HTTP server in tests/mock-server.ts.
 *
 * Usage: call mockBrowserApiRoutes(page) at the start of a test if you need
 * to override specific browser-side API calls (e.g. to test error states).
 */

import { Page } from "@playwright/test";

const MOCK_API = "http://localhost:4000";

/**
 * Redirects all browser-side API calls to the local mock server instead of
 * the real API. This is only needed if a test overrides specific responses.
 */
export async function mockBrowserApiRoutes(page: Page, baseUrl: string) {
  await page.route(`${baseUrl}/**`, (route) => {
    const mockUrl = route.request().url().replace(baseUrl, MOCK_API);
    route.continue({ url: mockUrl });
  });
}
