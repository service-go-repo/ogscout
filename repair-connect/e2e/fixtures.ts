import { test as base, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type TestFixtures = {
  makeAxeBuilder: () => AxeBuilder;
  authenticatedPage: Page;
};

/**
 * Extended Playwright test with custom fixtures
 */
export const test = base.extend<TestFixtures>({
  /**
   * Axe accessibility testing fixture
   * Usage: const results = await makeAxeBuilder().analyze();
   */
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('#webpack-dev-server-client-overlay');
    await use(makeAxeBuilder);
  },

  /**
   * Authenticated page fixture for testing protected routes
   * Automatically logs in before each test
   */
  authenticatedPage: async ({ page }, use) => {
    // TODO: Implement authentication logic once auth is set up
    // For now, just pass through the page
    await use(page);
  },
});

export { expect } from '@playwright/test';
