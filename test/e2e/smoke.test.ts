import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('smoke and a11y', () => {
  test('basic a11y test on a simple HTML page', async ({ page }) => {
    // Navigate to a simple local data URI or we can just mock a page
    await page.setContent(`
      <html lang="en">
        <head>
          <title>Test Page</title>
        </head>
        <body>
          <main>
            <h1>Hello World</h1>
            <button aria-label="Close">X</button>
          </main>
        </body>
      </html>
    `);

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});