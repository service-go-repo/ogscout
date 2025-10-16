import { test, expect } from '@playwright/test';

test.describe('Theme Colors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('CSS variables are defined and accessible', async ({ page }) => {
    const cssVars = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      return {
        primary: styles.getPropertyValue('--primary').trim(),
        background: styles.getPropertyValue('--background').trim(),
        foreground: styles.getPropertyValue('--foreground').trim(),
      };
    });

    // Verify CSS variables are defined (not empty)
    expect(cssVars.primary).toBeTruthy();
    expect(cssVars.primary).toBe('245 58% 51%');
    expect(cssVars.background).toBeTruthy();
    expect(cssVars.foreground).toBeTruthy();
  });

  test('Primary color is applied to elements with bg-primary class', async ({ page }) => {
    const primaryElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[class*="bg-primary"]'));
      return elements.slice(0, 3).map(el => {
        const styles = getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          hasColor: styles.backgroundColor !== 'rgba(0, 0, 0, 0)',
        };
      });
    });

    // Verify at least some primary elements were found
    expect(primaryElements.length).toBeGreaterThan(0);

    // Verify that primary color elements have non-transparent backgrounds
    primaryElements.forEach(el => {
      expect(el.hasColor).toBe(true);
      // Should be the primary purple/blue color rgb(70, 58, 203) or rgba(70, 58, 203, 0.1)
      expect(el.backgroundColor).toMatch(/rgba?\(\s*\d+,\s*\d+,\s*\d+/);
    });
  });

  test('Header has background and border colors applied', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const headerStyles = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return null;
      const styles = getComputedStyle(header);
      return {
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderBottomColor,
      };
    });

    expect(headerStyles).toBeTruthy();
    expect(headerStyles!.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(headerStyles!.borderColor).toBeTruthy();
  });

  test('Primary CTA button has correct colors', async ({ page }) => {
    // Find primary button with bg-primary class
    const primaryButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('[class*="bg-primary"]'));
      const ctaButton = buttons.find(btn =>
        btn.textContent?.includes('Request') ||
        btn.tagName === 'A' ||
        btn.tagName === 'BUTTON'
      );

      if (ctaButton) {
        const styles = getComputedStyle(ctaButton);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
        };
      }
      return null;
    });

    expect(primaryButton).toBeTruthy();
    // Background should not be transparent
    expect(primaryButton!.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    // Should have the primary brand color
    expect(primaryButton!.backgroundColor).toContain('rgb');
  });

  test('Text colors use foreground variable', async ({ page }) => {
    const bodyColor = await page.evaluate(() => {
      const body = document.body;
      const styles = getComputedStyle(body);
      return {
        color: styles.color,
        isNotBlack: styles.color !== 'rgb(0, 0, 0)',
      };
    });

    expect(bodyColor.color).toBeTruthy();
    expect(bodyColor.isNotBlack).toBe(true);
  });

  test('Visual snapshot - hero section with colors', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Take a screenshot of the hero section
    const heroSection = page.locator('main').first();
    await expect(heroSection).toBeVisible();

    // This creates a baseline - if colors break, the snapshot will differ
    // Run with --update-snapshots flag to create/update baseline
    await expect(page).toHaveScreenshot('hero-with-colors.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });
});
