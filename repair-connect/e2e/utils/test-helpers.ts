import { Page, expect } from '@playwright/test';

/**
 * Wait for Next.js hydration to complete
 */
export async function waitForHydration(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => {
    return (window as any).__NEXT_HYDRATED === true || document.readyState === 'complete';
  }, { timeout: 10000 });
}

/**
 * Toggle dark mode
 */
export async function toggleDarkMode(page: Page) {
  await page.evaluate(() => {
    document.documentElement.classList.toggle('dark');
  });
  await page.waitForTimeout(300); // Wait for transition
}

/**
 * Test component at different viewports
 */
export async function testResponsive(
  page: Page,
  url: string,
  viewports: { width: number; height: number }[]
) {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto(url);
    await waitForHydration(page);
    await expect(page).not.toHaveTitle(/Error/);
  }
}

/**
 * Check for console errors
 */
export async function expectNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  return {
    verify: () => {
      expect(errors).toHaveLength(0);
    }
  };
}

/**
 * Test keyboard navigation
 */
export async function testKeyboardNavigation(page: Page, elements: string[]) {
  for (const selector of elements) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName + (el?.className ? '.' + el.className.split(' ').join('.') : '');
    });
    await expect(page.locator(selector)).toBeFocused();
  }
}

/**
 * Check for proper focus indicators
 */
export async function expectFocusIndicator(page: Page, selector: string) {
  const element = page.locator(selector);
  await element.focus();

  const hasOutline = await element.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return (
      styles.outline !== 'none' ||
      styles.boxShadow !== 'none' ||
      styles.border !== 'none'
    );
  });

  expect(hasOutline).toBe(true);
}

/**
 * Visual regression helper
 */
export async function expectMatchesScreenshot(
  page: Page,
  name: string,
  options?: {
    fullPage?: boolean;
    clip?: { x: number; y: number; width: number; height: number };
  }
) {
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: options?.fullPage,
    clip: options?.clip,
    maxDiffPixels: 100, // Allow small differences
  });
}

/**
 * Test component loading states
 */
export async function testLoadingState(page: Page, triggerAction: () => Promise<void>) {
  const loadingIndicator = page.locator('[role="status"], [aria-busy="true"]');
  await triggerAction();
  await expect(loadingIndicator).toBeVisible();
  await expect(loadingIndicator).toBeHidden({ timeout: 10000 });
}

/**
 * Test error states
 */
export async function testErrorState(
  page: Page,
  triggerAction: () => Promise<void>,
  expectedErrorText?: string
) {
  await triggerAction();
  const errorElement = page.locator('[role="alert"]');
  await expect(errorElement).toBeVisible();

  if (expectedErrorText) {
    await expect(errorElement).toContainText(expectedErrorText);
  }
}
