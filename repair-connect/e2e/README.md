# E2E Test Suite

Comprehensive end-to-end testing for RepairConnect using Playwright and Axe for accessibility testing.

## Test Structure

```
e2e/
├── accessibility/          # WCAG 2.1 AA compliance tests
│   ├── wcag.spec.ts       # Automated accessibility scans
│   └── keyboard-navigation.spec.ts  # Keyboard navigation tests
├── components/            # Component-level tests
│   ├── button.spec.ts
│   └── card.spec.ts
├── flows/                 # User flow tests
│   ├── dashboard.spec.ts
│   └── navigation.spec.ts
├── visual/                # Visual regression & theme tests
│   ├── dark-mode.spec.ts
│   └── responsive.spec.ts
├── utils/                 # Test utilities
│   └── test-helpers.ts
└── fixtures.ts            # Custom Playwright fixtures

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### With UI Mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Specific Test Suites
```bash
# Accessibility tests only
npm run test:accessibility

# Visual regression tests
npm run test:visual

# User flow tests
npm run test:flows
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### View Test Report
```bash
npm run test:e2e:report
```

## Test Configuration

Tests are configured in `playwright.config.ts` with:
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Viewports**: Desktop (1024px), Tablet (768px), Mobile (375px), Large (1440px)
- **Base URL**: http://localhost:3000
- **Retries**: 2 on CI, 0 locally
- **Reporters**: HTML, List, JSON

## Key Features

### Accessibility Testing
- Automated WCAG 2.1 AA compliance checks using @axe-core/playwright
- Keyboard navigation validation
- Touch target size verification (44x44px minimum)
- Color contrast testing
- ARIA label validation
- Focus indicator verification

### Visual Regression
- Screenshot comparison across all viewports
- Dark mode testing with contrast verification
- Component visual state testing

### Responsive Testing
- Mobile (375px), Tablet (768px), Desktop (1024px), Large (1440px)
- No horizontal overflow validation
- Touch-friendly target verification
- Layout adaptation testing

### Component Tests
- Button: Focus indicators, disabled states, active states
- Card: Structure, overflow handling, spacing consistency
- Input/Select: Error states, focus behavior
- Dialog: Focus trap, keyboard shortcuts

### Flow Tests
- Dashboard: Loading states, error handling, empty states
- Navigation: Page transitions, state persistence, back navigation

## Writing New Tests

### Basic Test Structure
\`\`\`typescript
import { test, expect } from '../fixtures';
import { waitForHydration } from '../utils/test-helpers';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    await waitForHydration(page);

    // Your test assertions
    await expect(page.locator('selector')).toBeVisible();
  });
});
\`\`\`

### Accessibility Test
\`\`\`typescript
test('should have no a11y violations', async ({ page, makeAxeBuilder }) => {
  await page.goto('/path');
  const results = await makeAxeBuilder().analyze();
  expect(results.violations).toEqual([]);
});
\`\`\`

### Visual Regression Test
\`\`\`typescript
import { expectMatchesScreenshot } from '../utils/test-helpers';

test('should match snapshot', async ({ page }) => {
  await page.goto('/path');
  await expectMatchesScreenshot(page, 'test-name');
});
\`\`\`

## Utilities

### Test Helpers (`utils/test-helpers.ts`)
- `waitForHydration(page)` - Wait for Next.js to hydrate
- `toggleDarkMode(page)` - Toggle dark mode
- `testResponsive(page, url, viewports)` - Test multiple viewports
- `expectNoConsoleErrors(page)` - Check for console errors
- `testKeyboardNavigation(page, elements)` - Test tab navigation
- `expectFocusIndicator(page, selector)` - Verify focus styles
- `expectMatchesScreenshot(page, name, options)` - Visual regression
- `testLoadingState(page, action)` - Test loading indicators
- `testErrorState(page, action, expectedText)` - Test error messages

### Fixtures (`fixtures.ts`)
- `makeAxeBuilder()` - Axe accessibility testing
- `authenticatedPage` - Pre-authenticated page context

## CI/CD Integration

Tests automatically run on CI with:
- Parallel execution disabled
- 2 retries per test
- Screenshot/video capture on failure
- JSON report generation

## Best Practices

1. **Always use `waitForHydration()`** after navigation
2. **Use semantic selectors** (getByRole, getByLabel) over CSS selectors
3. **Test user behavior**, not implementation details
4. **Keep tests focused** - one assertion per test when possible
5. **Use fixtures** for common setup (authentication, theme)
6. **Avoid hard waits** - use Playwright's auto-waiting
7. **Test accessibility** as you build features
8. **Update snapshots** carefully - review visual changes

## Troubleshooting

### Tests timing out
- Check `waitForHydration()` is called
- Increase timeout in playwright.config.ts
- Check for network errors in test output

### Screenshot mismatches
- Run `npx playwright test --update-snapshots` to update
- Review diff in HTML report
- Check for dynamic content (dates, random IDs)

### Accessibility failures
- Review Axe violations in test output
- Use `--debug` mode to inspect element
- Check ARIA labels and roles

## Test Coverage

Current coverage includes:
- ✅ 6 core UI components (Button, Card, Input, Select, Dialog, Skeleton)
- ✅ Dashboard page with all states
- ✅ Navigation flows
- ✅ WCAG 2.1 AA compliance
- ✅ Dark mode support
- ✅ 4 responsive breakpoints
- ✅ Keyboard navigation
- ✅ Touch target sizes
- ✅ Color contrast
- ✅ Loading/Error/Empty states

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Axe Accessibility Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
