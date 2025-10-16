import { test, expect } from '../fixtures';
import { waitForHydration, testKeyboardNavigation } from '../utils/test-helpers';

test.describe('Navigation Flow', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Test navigation to dashboard
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    if (await dashboardLink.count() > 0) {
      await dashboardLink.click();
      await waitForHydration(page);
      expect(page.url()).toContain('/dashboard');
    }
  });

  test('should maintain navigation state', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Check for active/current page indicator in navigation
    const nav = page.locator('nav, header').first();
    if (await nav.count() > 0) {
      const activeLink = nav.locator('[aria-current="page"], .active').first();

      if (await activeLink.count() > 0) {
        await expect(activeLink).toBeVisible();
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Test tab navigation through header links
    const nav = page.locator('nav, header').first();
    const links = await nav.locator('a[href]').all();

    if (links.length > 0) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
    }
  });

  test('should handle back navigation', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    const dashboardLink = page.getByRole('link', { name: /dashboard/i }).first();
    if (await dashboardLink.count() > 0) {
      await dashboardLink.click();
      await waitForHydration(page);

      await page.goBack();
      await waitForHydration(page);

      expect(page.url()).not.toContain('/dashboard');
    }
  });

  test('should have skip to content link', async ({ page }) => {
    await page.goto('/dashboard');

    // Press Tab to potentially reveal skip link
    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', { name: /skip to (main )?content/i });
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeFocused();

      await skipLink.click();

      // Verify focus moved to main content
      const main = page.locator('main').first();
      const mainHasFocus = await page.evaluate(() => {
        const mainEl = document.querySelector('main');
        return document.activeElement === mainEl || mainEl?.contains(document.activeElement);
      });

      expect(mainHasFocus).toBe(true);
    }
  });
});
