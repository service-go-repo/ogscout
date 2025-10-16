import { test, expect } from '../fixtures';
import { waitForHydration, expectNoConsoleErrors, testLoadingState } from '../utils/test-helpers';

test.describe('Dashboard Flow', () => {
  test('should load dashboard successfully', async ({ page }) => {
    const errorChecker = await expectNoConsoleErrors(page);

    await page.goto('/dashboard');
    await waitForHydration(page);

    // Check for main dashboard elements
    await expect(page).toHaveTitle(/Dashboard|RepairConnect/i);
    await expect(page.locator('h1, h2').first()).toBeVisible();

    errorChecker.verify();
  });

  test('should display stat cards', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Check for stat cards
    const cards = page.locator('.rounded-xl.border');
    const count = await cards.count();

    expect(count).toBeGreaterThan(0);

    // Verify at least one card has content
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();

    // Check for number/stat display
    const statValue = firstCard.locator('.text-2xl').first();
    if (await statValue.count() > 0) {
      await expect(statValue).toBeVisible();
    }
  });

  test('should handle loading state', async ({ page }) => {
    // Slow down network to see loading state
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 500);
    });

    await page.goto('/dashboard');

    // Check for skeleton loaders
    const skeleton = page.locator('.animate-pulse').first();
    if (await skeleton.count() > 0) {
      await expect(skeleton).toBeVisible();
    }

    await waitForHydration(page);

    // Verify content loaded
    await expect(page.locator('.text-2xl').first()).toBeVisible();
  });

  test('should handle error state gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await page.goto('/dashboard');
    await waitForHydration(page);

    // Check for error message
    const errorAlert = page.locator('[role="alert"]');
    if (await errorAlert.count() > 0) {
      await expect(errorAlert).toBeVisible();
      await expect(errorAlert).toContainText(/error/i);
    }
  });

  test('should navigate to stat details on card click', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Find clickable card link
    const cardLink = page.locator('a').filter({ has: page.locator('.rounded-xl.border') }).first();

    if (await cardLink.count() > 0) {
      const href = await cardLink.getAttribute('href');
      await cardLink.click();

      await page.waitForLoadState('networkidle');

      // Verify navigation occurred
      expect(page.url()).toContain(href || '');
    }
  });

  test('should display empty states correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Check for empty state indicators (— or "No data")
    const emptyStates = page.locator('text=/—|no data|all caught up/i');

    if (await emptyStates.count() > 0) {
      const firstEmpty = emptyStates.first();
      await expect(firstEmpty).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Check that content is visible and not overflowing
    const cards = page.locator('.rounded-xl.border');
    const firstCard = cards.first();

    await expect(firstCard).toBeVisible();

    // Verify no horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    expect(hasOverflow).toBe(false);
  });
});
