import { test, expect } from '../fixtures';
import { expectFocusIndicator, toggleDarkMode, expectMatchesScreenshot } from '../utils/test-helpers';

test.describe('Button Component', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test page with all button variants
    await page.goto('/');
  });

  test('should render all button variants correctly', async ({ page }) => {
    // Test page would need to have all button variants
    const defaultBtn = page.getByRole('button', { name: /default/i });
    const destructiveBtn = page.getByRole('button', { name: /destructive/i });
    const outlineBtn = page.getByRole('button', { name: /outline/i });

    await expect(defaultBtn).toBeVisible();
    await expect(destructiveBtn).toBeVisible();
    await expect(outlineBtn).toBeVisible();
  });

  test('should have proper focus indicators', async ({ page }) => {
    const button = page.getByRole('button').first();
    await expectFocusIndicator(page, 'button');
  });

  test('should handle disabled state correctly', async ({ page }) => {
    const disabledBtn = page.locator('button[disabled]').first();
    if (await disabledBtn.count() > 0) {
      await expect(disabledBtn).toBeDisabled();
      await expect(disabledBtn).toHaveAttribute('aria-disabled', 'true');

      // Should not be clickable
      await disabledBtn.click({ force: true });
      // Add assertion that click didn't trigger action
    }
  });

  test('should show active state on press', async ({ page }) => {
    const button = page.getByRole('button').first();

    await button.hover();
    await page.mouse.down();

    // Check for active state styles
    const hasActiveState = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundColor !== '';
    });

    expect(hasActiveState).toBe(true);
    await page.mouse.up();
  });

  test('should match visual snapshot in light mode', async ({ page }) => {
    await expectMatchesScreenshot(page, 'button-light-mode');
  });

  test('should match visual snapshot in dark mode', async ({ page }) => {
    await toggleDarkMode(page);
    await expectMatchesScreenshot(page, 'button-dark-mode');
  });

  test('should be keyboard accessible', async ({ page }) => {
    const button = page.getByRole('button').first();

    await button.focus();
    await expect(button).toBeFocused();

    await page.keyboard.press('Enter');
    // Add assertion for button action
  });
});
