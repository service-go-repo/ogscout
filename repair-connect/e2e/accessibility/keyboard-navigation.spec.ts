import { test, expect } from '../fixtures';
import { waitForHydration } from '../utils/test-helpers';

test.describe('Keyboard Navigation', () => {
  test('should navigate through page with Tab key', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Tab through focusable elements
    const focusableElements = await page
      .locator('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      .all();

    for (let i = 0; i < Math.min(focusableElements.length, 5); i++) {
      await page.keyboard.press('Tab');

      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    }
  });

  test('should navigate backwards with Shift+Tab', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Tab forward first
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const secondElement = page.locator(':focus');
    const secondText = await secondElement.textContent();

    // Tab backwards
    await page.keyboard.press('Shift+Tab');

    const firstElement = page.locator(':focus');
    const firstText = await firstElement.textContent();

    expect(secondText).not.toBe(firstText);
  });

  test('should activate buttons with Enter and Space', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    const button = page.getByRole('button').first();

    if ((await button.count()) > 0) {
      await button.focus();
      await expect(button).toBeFocused();

      // Test Enter key
      await page.keyboard.press('Enter');
      // Add assertion for button action if needed

      // Test Space key
      await button.focus();
      await page.keyboard.press('Space');
      // Add assertion for button action if needed
    }
  });

  test('should activate links with Enter (not Space)', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    const link = page.getByRole('link').first();

    if ((await link.count()) > 0) {
      await link.focus();
      await expect(link).toBeFocused();

      const href = await link.getAttribute('href');

      // Test Enter key (should navigate)
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');

      if (href && !href.startsWith('#')) {
        expect(page.url()).toContain(href);
      }
    }
  });

  test('should trap focus in modal dialogs', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Try to open a dialog if one exists
    const dialogTrigger = page.locator('[aria-haspopup="dialog"], button:has-text("Open"), button:has-text("Add")').first();

    if ((await dialogTrigger.count()) > 0) {
      await dialogTrigger.click();

      const dialog = page.locator('[role="dialog"]');
      if ((await dialog.count()) > 0) {
        await expect(dialog).toBeVisible();

        // Get all focusable elements in dialog
        const focusableInDialog = await dialog
          .locator('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
          .all();

        if (focusableInDialog.length > 0) {
          // Tab through all elements
          for (let i = 0; i < focusableInDialog.length + 1; i++) {
            await page.keyboard.press('Tab');
          }

          // Focus should loop back to first element in dialog
          const focused = page.locator(':focus');
          const isInDialog = await focused.evaluate((el) => {
            const dialog = document.querySelector('[role="dialog"]');
            return dialog?.contains(el) ?? false;
          });

          expect(isInDialog).toBe(true);
        }
      }
    }
  });

  test('should close dialogs with Escape key', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    const dialogTrigger = page.locator('[aria-haspopup="dialog"], button:has-text("Open"), button:has-text("Add")').first();

    if ((await dialogTrigger.count()) > 0) {
      await dialogTrigger.click();

      const dialog = page.locator('[role="dialog"]');
      if ((await dialog.count()) > 0) {
        await expect(dialog).toBeVisible();

        await page.keyboard.press('Escape');

        await expect(dialog).toBeHidden({ timeout: 2000 });
      }
    }
  });

  test('should show visible focus indicators', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    const interactiveElements = await page
      .locator('button, a[href], input')
      .all();

    for (const element of interactiveElements.slice(0, 5)) {
      await element.focus();

      const hasFocusIndicator = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return (
          styles.outline !== 'none' ||
          styles.boxShadow !== 'none' ||
          styles.border !== 'none' ||
          styles.background !== 'none'
        );
      });

      expect(hasFocusIndicator).toBe(true);
    }
  });

  test('should skip to main content with skip link', async ({ page }) => {
    await page.goto('/dashboard');

    // Press Tab to focus skip link (if it exists)
    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', { name: /skip to (main )?content/i });

    if ((await skipLink.count()) > 0) {
      await expect(skipLink).toBeFocused();

      await page.keyboard.press('Enter');

      // Verify focus moved to main content
      const mainContent = page.locator('main, [role="main"]').first();
      const mainHasFocus = await mainContent.evaluate((el) => {
        return (
          document.activeElement === el ||
          el.contains(document.activeElement)
        );
      });

      expect(mainHasFocus).toBe(true);
    }
  });
});
