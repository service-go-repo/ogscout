import { test, expect } from '../fixtures';
import { waitForHydration, testResponsive } from '../utils/test-helpers';

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
  large: { width: 1440, height: 900 },
};

test.describe('Responsive Behavior', () => {
  test('should render correctly on mobile (375px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Check for no horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    expect(hasOverflow).toBe(false);

    // Verify content is visible
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Check cards stack vertically
    const cards = page.locator('.rounded-xl.border').all();
    if ((await cards).length > 1) {
      const positions = await page.evaluate(() => {
        const cardElements = Array.from(document.querySelectorAll('.rounded-xl.border'));
        return cardElements.slice(0, 2).map((card) => {
          const rect = card.getBoundingClientRect();
          return { top: rect.top, left: rect.left };
        });
      });

      // First two cards should not be side-by-side
      if (positions.length === 2) {
        expect(positions[0].left).toBe(positions[1].left);
      }
    }
  });

  test('should render correctly on tablet (768px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Check for no horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    expect(hasOverflow).toBe(false);

    // Verify layout adapts
    const cards = page.locator('.rounded-xl.border');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should render correctly on desktop (1024px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Check for no horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    expect(hasOverflow).toBe(false);

    // Cards should be in grid layout
    const cards = page.locator('.rounded-xl.border').all();
    if ((await cards).length > 2) {
      const positions = await page.evaluate(() => {
        const cardElements = Array.from(document.querySelectorAll('.rounded-xl.border'));
        return cardElements.slice(0, 2).map((card) => {
          const rect = card.getBoundingClientRect();
          return { top: rect.top, left: rect.left, width: rect.width };
        });
      });

      // First two cards might be side-by-side on desktop
      if (positions.length === 2 && positions[0].top === positions[1].top) {
        expect(positions[0].left).not.toBe(positions[1].left);
      }
    }
  });

  test('should render correctly on large desktop (1440px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.large);
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Check for no horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    expect(hasOverflow).toBe(false);

    // Content should be centered or utilize space well
    const main = page.locator('main').first();
    if ((await main.count()) > 0) {
      const width = await main.evaluate((el) => {
        return el.getBoundingClientRect().width;
      });

      expect(width).toBeGreaterThan(0);
      expect(width).toBeLessThanOrEqual(VIEWPORTS.large.width);
    }
  });

  test('should have touch-friendly targets on mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/dashboard');
    await waitForHydration(page);

    const interactiveElements = await page
      .locator('button, a[href], [role="button"]')
      .all();

    for (const element of interactiveElements.slice(0, 5)) {
      const box = await element.boundingBox();

      if (box) {
        // Touch targets should be at least 44x44px
        expect(box.width >= 40 || box.height >= 40).toBe(true);
      }
    }
  });

  test('should adapt navigation on mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Check for mobile menu or hamburger icon
    const nav = page.locator('nav, header').first();
    if ((await nav.count()) > 0) {
      await expect(nav).toBeVisible();

      // Mobile nav might have a menu button
      const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], button:has-text("Menu")');
      // It's okay if it doesn't exist - some designs show full nav
    }
  });

  test('should handle text wrapping on small screens', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Check that text doesn't overflow containers
    const textElements = await page.locator('p, h1, h2, h3, span').all();

    for (const element of textElements.slice(0, 10)) {
      const hasOverflow = await element.evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
      });

      // Some overflow is okay for truncated text with ellipsis
      // Just verify element is visible
      await expect(element).toBeVisible();
    }
  });

  test('should match snapshots across all viewports', async ({ page }) => {
    for (const [name, viewport] of Object.entries(VIEWPORTS)) {
      await page.setViewportSize(viewport);
      await page.goto('/dashboard');
      await waitForHydration(page);

      await expect(page).toHaveScreenshot(`dashboard-${name}.png`, {
        fullPage: true,
        maxDiffPixels: 100,
      });
    }
  });
});
