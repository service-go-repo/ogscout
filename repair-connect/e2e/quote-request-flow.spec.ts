import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Quote Request Flow with Fixed UX
 *
 * Tests:
 * 1. Complete flow from car selection to workshop quote request
 * 2. Individual workshop quote request from card
 * 3. Individual workshop quote request from profile
 * 4. Quote sent badge persistence across navigation
 * 5. URL hydration and state restoration
 * 6. Browser back/forward navigation
 * 7. Select All + Send Bulk Quotes (unchanged existing flow)
 * 8. Tab sync (requires manual testing with multiple tabs)
 */

test.describe('Quote Request Flow - Fixed UX', () => {
  test.beforeEach(async ({ page }) => {
    // Assume user is logged in (adjust based on your auth setup)
    // You may need to implement login helpers
    await page.goto('/quotations/request');
  });

  test('should complete full quote request flow from car selection', async ({ page }) => {
    // Step 1: Click "New Quote Request" on request page
    await page.getByRole('button', { name: /new quote request/i }).click();

    // Step 2: Car selection modal should appear
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/select a car for quote request/i)).toBeVisible();

    // Step 3: Select first car
    const firstCar = page.locator('[data-testid="car-card"]').first();
    await firstCar.click();

    // Step 4: Click Continue to Workshops
    await page.getByRole('button', { name: /continue to workshops/i }).click();

    // Step 5: Should navigate to workshops page with carId in URL
    await expect(page).toHaveURL(/\/quotations\/workshops\?carId=/);

    // Step 6: Selected car should be displayed
    await expect(page.locator('[data-testid="selected-car-card"]')).toBeVisible();

    // Step 7: Workshop cards should be visible
    const workshopCards = page.locator('[data-testid="workshop-card"]');
    await expect(workshopCards.first()).toBeVisible();
  });

  test('should request quote from individual workshop card', async ({ page }) => {
    // Setup: Navigate directly to workshops page with a car selected
    await setupWithSelectedCar(page);

    // Find first workshop card
    const firstWorkshop = page.locator('[data-testid="workshop-card"]').first();
    const workshopName = await firstWorkshop.locator('[data-testid="workshop-name"]').textContent();

    // Click "Request Quote" button on the card
    const requestQuoteBtn = firstWorkshop.getByRole('button', { name: /request quote/i });
    await requestQuoteBtn.click();

    // Should show success toast
    await expect(page.getByText(/quote request sent/i)).toBeVisible();

    // Badge should appear immediately (optimistic UI)
    await expect(firstWorkshop.getByText(/quote sent/i)).toBeVisible();

    // Button should be disabled
    await expect(requestQuoteBtn).toBeDisabled();
  });

  test('should request quote from workshop profile page', async ({ page }) => {
    // Setup: Navigate to workshops page with car selected
    await setupWithSelectedCar(page);

    // Click on first workshop to visit profile
    const firstWorkshop = page.locator('[data-testid="workshop-card"]').first();
    await firstWorkshop.getByRole('link', { name: /view workshop profile/i }).click();

    // Should navigate to profile page
    await expect(page).toHaveURL(/\/workshops\/[a-zA-Z0-9]+/);

    // Click "Request Quote" button in header
    const requestQuoteBtn = page.getByRole('button', { name: /request quote/i }).first();
    await requestQuoteBtn.click();

    // Should show success toast
    await expect(page.getByText(/quote request sent/i)).toBeVisible();

    // Badge should appear
    await expect(page.getByText(/quote sent/i)).toBeVisible();

    // Navigate back to workshops page
    await page.goBack();

    // Badge should still be visible on the workshop card
    const workshopCard = page.locator('[data-testid="workshop-card"]').first();
    await expect(workshopCard.getByText(/quote sent/i)).toBeVisible();
  });

  test('should preserve quote badge across browser navigation', async ({ page }) => {
    // Send a quote request
    await setupWithSelectedCar(page);
    const firstWorkshop = page.locator('[data-testid="workshop-card"]').first();
    await firstWorkshop.getByRole('button', { name: /request quote/i }).click();
    await expect(firstWorkshop.getByText(/quote sent/i)).toBeVisible();

    // Navigate away
    await page.goto('/quotations');

    // Navigate back
    await page.goBack();

    // Badge should still be present
    await expect(firstWorkshop.getByText(/quote sent/i)).toBeVisible();
  });

  test('should hydrate car from URL on direct navigation', async ({ page }) => {
    // Assume we have a valid car ID
    const carId = await getValidCarId(page);

    // Navigate directly to workshops page with carId in URL
    await page.goto(`/quotations/workshops?carId=${carId}`);

    // Selected car should be displayed
    await expect(page.locator('[data-testid="selected-car-card"]')).toBeVisible();

    // Workshops should be loaded
    await expect(page.locator('[data-testid="workshop-card"]').first()).toBeVisible();
  });

  test('should handle invalid carId in URL gracefully', async ({ page }) => {
    // Navigate with invalid carId
    await page.goto('/quotations/workshops?carId=invalid123');

    // Should redirect to request page
    await expect(page).toHaveURL('/quotations/request');

    // Should show error toast
    await expect(page.getByText(/invalid car selection/i)).toBeVisible();
  });

  test('should require car selection when clicking quote without selected car', async ({ page }) => {
    // Navigate to find workshops page (general search, no car selected)
    await page.goto('/workshops');

    // Click "Request Quote" on first workshop
    const firstWorkshop = page.locator('[data-testid="workshop-card"]').first();
    await firstWorkshop.getByRole('button', { name: /request quote/i }).click();

    // Car selection modal should appear
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/select a car for quote request/i)).toBeVisible();

    // Select a car
    await page.locator('[data-testid="car-card"]').first().click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Quote should be sent automatically after car selection
    await expect(page.getByText(/quote request sent/i)).toBeVisible();
  });

  test('should handle Select All + Send Bulk Quotes (unchanged flow)', async ({ page }) => {
    // Setup: Navigate to workshops page with car selected
    await setupWithSelectedCar(page);

    // Click "Select All" button
    await page.getByRole('button', { name: /select all/i }).click();

    // All workshop cards should be selected (have checkmark indicator)
    const workshopCards = page.locator('[data-testid="workshop-card"]');
    const count = await workshopCards.count();

    // Verify selection summary
    await expect(page.getByText(new RegExp(`${count} workshop(s)? selected`, 'i'))).toBeVisible();

    // Click "Send Quote Requests" button
    await page.getByRole('button', { name: /send quote requests/i }).click();

    // Should show success toast
    await expect(page.getByText(new RegExp(`quote request sent to ${count} workshop`, 'i'))).toBeVisible();

    // Should navigate to quotations page
    await expect(page).toHaveURL('/quotations');
  });

  test('should prevent duplicate quote requests to same workshop', async ({ page }) => {
    await setupWithSelectedCar(page);

    const firstWorkshop = page.locator('[data-testid="workshop-card"]').first();
    const requestQuoteBtn = firstWorkshop.getByRole('button', { name: /request quote/i });

    // Send first request
    await requestQuoteBtn.click();
    await expect(page.getByText(/quote request sent/i)).toBeVisible();

    // Button should be disabled
    await expect(requestQuoteBtn).toBeDisabled();

    // Badge should be visible
    await expect(firstWorkshop.getByText(/quote sent/i)).toBeVisible();

    // Attempting to click again should do nothing
    await requestQuoteBtn.click({ force: true });

    // Should not show duplicate toast
    await expect(page.getByText(/quote request sent/i)).toHaveCount(0);
  });

  test('should allow changing selected car', async ({ page }) => {
    await setupWithSelectedCar(page);

    // Click "Change Car" button
    await page.getByRole('button', { name: /change/i }).click();

    // Should redirect to request page
    await expect(page).toHaveURL('/quotations/request');

    // Selected car should be cleared from store
    // (Check by navigating back and seeing no car selected)
  });

  test('should display accessible quote badge with aria-live', async ({ page }) => {
    await setupWithSelectedCar(page);

    const firstWorkshop = page.locator('[data-testid="workshop-card"]').first();
    await firstWorkshop.getByRole('button', { name: /request quote/i }).click();

    // Badge should have aria-live="polite" for screen readers
    const badge = firstWorkshop.locator('[role="status"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveAttribute('aria-live', 'polite');
  });

  test('should handle network error gracefully with retry option', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/quotations', (route) => {
      route.abort('failed');
    });

    await setupWithSelectedCar(page);

    const firstWorkshop = page.locator('[data-testid="workshop-card"]').first();
    await firstWorkshop.getByRole('button', { name: /request quote/i }).click();

    // Should show error toast with retry option
    await expect(page.getByText(/failed to send quote/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();

    // Badge should not appear (rollback)
    await expect(firstWorkshop.getByText(/quote sent/i)).not.toBeVisible();

    // Button should be enabled again
    const requestQuoteBtn = firstWorkshop.getByRole('button', { name: /request quote/i });
    await expect(requestQuoteBtn).toBeEnabled();
  });
});

/**
 * Helper Functions
 */

async function setupWithSelectedCar(page: Page) {
  // Register a car and navigate to workshops page
  // This is a simplified version - adjust based on your app's flow
  await page.goto('/quotations/request');
  await page.getByRole('button', { name: /new quote request/i }).click();
  await page.locator('[data-testid="car-card"]').first().click();
  await page.getByRole('button', { name: /continue to workshops/i }).click();
  await page.waitForURL(/\/quotations\/workshops\?carId=/);
}

async function getValidCarId(page: Page): Promise<string> {
  // Fetch a valid car ID from the API or DOM
  // This is a placeholder - implement based on your app's setup
  const response = await page.request.get('/api/cars');
  const data = await response.json();
  return data.data[0]._id;
}
