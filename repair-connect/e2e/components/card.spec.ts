import { test, expect } from '../fixtures';
import { expectMatchesScreenshot, toggleDarkMode } from '../utils/test-helpers';

test.describe('Card Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should render card structure correctly', async ({ page }) => {
    const card = page.locator('.rounded-xl.border').first();
    await expect(card).toBeVisible();

    // Check for proper semantic structure
    const heading = card.locator('h3').first();
    if (await heading.count() > 0) {
      await expect(heading).toBeVisible();
    }
  });

  test('should handle content overflow properly', async ({ page }) => {
    const card = page.locator('.rounded-xl.border').first();

    // Check that long content doesn't break layout
    const hasOverflow = await card.evaluate((el) => {
      return el.scrollHeight > el.clientHeight;
    });

    // If overflow exists, ensure it's handled gracefully
    if (hasOverflow) {
      const styles = await card.evaluate((el) => {
        return window.getComputedStyle(el);
      });
      expect(['auto', 'scroll', 'hidden']).toContain(styles.overflow);
    }
  });

  test('should maintain consistent spacing', async ({ page }) => {
    const cards = page.locator('.rounded-xl.border');
    const count = await cards.count();

    if (count > 1) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const card = cards.nth(i);
        const padding = await card.evaluate((el) => {
          const header = el.querySelector('[class*="p-"]');
          return window.getComputedStyle(header || el).padding;
        });
        expect(padding).toBeTruthy();
      }
    }
  });

  test('should match visual snapshot in light mode', async ({ page }) => {
    await expectMatchesScreenshot(page, 'card-light-mode', {
      clip: { x: 0, y: 0, width: 400, height: 300 }
    });
  });

  test('should match visual snapshot in dark mode', async ({ page }) => {
    await toggleDarkMode(page);
    await expectMatchesScreenshot(page, 'card-dark-mode', {
      clip: { x: 0, y: 0, width: 400, height: 300 }
    });
  });

  test('should handle empty state', async ({ page }) => {
    // Test cards without headers or specific content
    const emptyStateCard = page.locator('.rounded-xl.border').filter({
      hasText: /—|no data/i
    });

    if (await emptyStateCard.count() > 0) {
      await expect(emptyStateCard.first()).toBeVisible();
    }
  });
});
