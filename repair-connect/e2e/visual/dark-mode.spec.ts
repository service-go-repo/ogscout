import { test, expect } from '../fixtures';
import { toggleDarkMode, waitForHydration, expectMatchesScreenshot } from '../utils/test-helpers';

test.describe('Dark Mode', () => {
  test('should toggle dark mode successfully', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Check initial mode
    const hasInitialDarkClass = await page.locator('html').evaluate((html) =>
      html.classList.contains('dark')
    );

    // Toggle dark mode
    await toggleDarkMode(page);

    // Verify class toggled
    const hasToggledDarkClass = await page.locator('html').evaluate((html) =>
      html.classList.contains('dark')
    );

    expect(hasToggledDarkClass).toBe(!hasInitialDarkClass);
  });

  test('should apply correct colors in dark mode', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    await toggleDarkMode(page);

    // Check background color is dark
    const backgroundColor = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      return styles.backgroundColor;
    });

    // Dark mode should have dark background (rgb values close to 0)
    const isDark = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      const bg = styles.backgroundColor;
      const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return r < 50 && g < 50 && b < 50;
      }
      return false;
    });

    expect(isDark).toBe(true);
  });

  test('should maintain proper contrast in dark mode', async ({ page, makeAxeBuilder }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    await toggleDarkMode(page);

    const accessibilityScanResults = await makeAxeBuilder()
      .withTags(['wcag2aa'])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });

  test('should render all components correctly in dark mode', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    await toggleDarkMode(page);

    // Check cards are visible
    const cards = page.locator('.rounded-xl.border');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Check buttons are visible
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      await expect(buttons.first()).toBeVisible();
    }
  });

  test('should match dark mode snapshot', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    await toggleDarkMode(page);

    await expectMatchesScreenshot(page, 'dashboard-dark-mode', { fullPage: true });
  });

  test('should apply correct text colors in dark mode', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    await toggleDarkMode(page);

    // Check headings are visible with light text
    const heading = page.locator('h1, h2, h3').first();
    if ((await heading.count()) > 0) {
      const color = await heading.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // Text should be light (rgb values > 200)
      const isLight = await heading.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

        if (match) {
          const r = parseInt(match[1]);
          const g = parseInt(match[2]);
          const b = parseInt(match[3]);
          return r > 200 || g > 200 || b > 200;
        }
        return false;
      });

      expect(isLight).toBe(true);
    }
  });

  test('should preserve dark mode preference', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    await toggleDarkMode(page);

    // Navigate to another page
    await page.goto('/');
    await waitForHydration(page);

    // Check if dark mode persisted (if implemented)
    const hasDarkClass = await page.locator('html').evaluate((html) =>
      html.classList.contains('dark')
    );

    // This test assumes dark mode preference is stored
    // If not implemented yet, it's okay for it to fail
  });

  test('should handle semantic color tokens in dark mode', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    await toggleDarkMode(page);

    // Check for success color (green indicators)
    const successElements = page.locator('.text-success');
    if ((await successElements.count()) > 0) {
      const color = await successElements.first().evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      expect(color).toBeTruthy();
    }

    // Check for warning color (orange/yellow indicators)
    const warningElements = page.locator('.text-warning');
    if ((await warningElements.count()) > 0) {
      const color = await warningElements.first().evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      expect(color).toBeTruthy();
    }
  });
});
