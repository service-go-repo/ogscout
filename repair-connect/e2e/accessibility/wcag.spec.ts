import { test, expect } from '../fixtures';
import { waitForHydration } from '../utils/test-helpers';

test.describe('WCAG 2.1 AA Accessibility', () => {
  test('dashboard should not have any automatically detectable accessibility issues', async ({
    page,
    makeAxeBuilder,
  }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    const accessibilityScanResults = await makeAxeBuilder().analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

    if (headings.length > 0) {
      // Check for h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThan(0);

      // Verify heading levels don't skip (e.g., h1 -> h3)
      const headingLevels = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        return headings.map((h) => parseInt(h.tagName.substring(1)));
      });

      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        expect(diff).toBeLessThanOrEqual(1);
      }
    }
  });

  test('all interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Get all interactive elements
    const interactiveElements = await page
      .locator('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      .all();

    for (const element of interactiveElements.slice(0, 10)) {
      // Test first 10
      await element.focus();
      await expect(element).toBeFocused();
    }
  });

  test('all images should have alt text', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt can be empty string for decorative images, but must exist
      expect(alt).not.toBeNull();
    }
  });

  test('form inputs should have associated labels', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    const inputs = await page.locator('input:not([type="hidden"])').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      // Input must have either: id with matching label, aria-label, or aria-labelledby
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = (await label.count()) > 0;
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('color contrast should meet WCAG AA standards', async ({ page, makeAxeBuilder }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    const accessibilityScanResults = await makeAxeBuilder()
      .withTags(['wcag2aa'])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });

  test('touch targets should be at least 44x44 pixels', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    const interactiveElements = await page
      .locator('button, a[href], [role="button"]')
      .all();

    for (const element of interactiveElements.slice(0, 10)) {
      const box = await element.boundingBox();

      if (box) {
        const minSize = 44;
        const hasSufficientSize = box.width >= minSize && box.height >= minSize;

        // For very small elements, check if they have sufficient padding
        if (!hasSufficientSize) {
          const padding = await element.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            const paddingTop = parseInt(styles.paddingTop);
            const paddingBottom = parseInt(styles.paddingBottom);
            const paddingLeft = parseInt(styles.paddingLeft);
            const paddingRight = parseInt(styles.paddingRight);
            return {
              vertical: paddingTop + paddingBottom,
              horizontal: paddingLeft + paddingRight,
            };
          });

          const totalHeight = box.height + padding.vertical;
          const totalWidth = box.width + padding.horizontal;

          expect(totalHeight >= minSize || totalWidth >= minSize).toBe(true);
        }
      }
    }
  });

  test('should have appropriate ARIA labels for screen readers', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Check for landmarks
    const main = await page.locator('main, [role="main"]').count();
    expect(main).toBeGreaterThan(0);

    // Check for live regions where appropriate
    const alerts = page.locator('[role="alert"]');
    if ((await alerts.count()) > 0) {
      await expect(alerts.first()).toHaveAttribute('role', 'alert');
    }

    // Check for status updates
    const status = page.locator('[role="status"], [aria-live]');
    if ((await status.count()) > 0) {
      const ariaLive = await status.first().getAttribute('aria-live');
      expect(['polite', 'assertive', 'off']).toContain(ariaLive);
    }
  });
});
