const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });

  // Test desktop view
  console.log('\n=== TESTING DESKTOP VIEW (1920x1080) ===\n');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewportSize({ width: 1920, height: 1080 });

  await desktopPage.goto('http://localhost:3000');
  await desktopPage.waitForTimeout(2000);

  // Check computed styles on desktop
  const desktopBodyStyles = await desktopPage.evaluate(() => {
    const body = document.body;
    const computed = window.getComputedStyle(body);
    return {
      fontFamily: computed.fontFamily,
      backgroundColor: computed.backgroundColor,
      color: computed.color,
    };
  });

  console.log('Desktop Body styles:', desktopBodyStyles);

  // Check if quotations page shows grid correctly on desktop
  await desktopPage.goto('http://localhost:3000/quotations');
  await desktopPage.waitForTimeout(2000);

  const desktopGridElement = await desktopPage.evaluate(() => {
    const grid = document.querySelector('.grid');
    if (!grid) return null;
    const computed = window.getComputedStyle(grid);
    return {
      display: computed.display,
      gridTemplateColumns: computed.gridTemplateColumns,
    };
  });

  console.log('Desktop Grid styles:', desktopGridElement);

  // Take desktop screenshot
  await desktopPage.screenshot({
    path: 'production-desktop-quotations.png',
    fullPage: true
  });
  console.log('Screenshot saved: production-desktop-quotations.png');

  // Test mobile view
  console.log('\n=== TESTING MOBILE VIEW (375x667) ===\n');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 667 });

  await mobilePage.goto('http://localhost:3000');
  await mobilePage.waitForTimeout(2000);

  const mobileBodyStyles = await mobilePage.evaluate(() => {
    const body = document.body;
    const computed = window.getComputedStyle(body);
    return {
      fontFamily: computed.fontFamily,
      backgroundColor: computed.backgroundColor,
      color: computed.color,
    };
  });

  console.log('Mobile Body styles:', mobileBodyStyles);

  // Check quotations page on mobile
  await mobilePage.goto('http://localhost:3000/quotations');
  await mobilePage.waitForTimeout(2000);

  const mobileGridElement = await mobilePage.evaluate(() => {
    const grid = document.querySelector('.grid');
    if (!grid) return null;
    const computed = window.getComputedStyle(grid);
    return {
      display: computed.display,
      gridTemplateColumns: computed.gridTemplateColumns,
    };
  });

  console.log('Mobile Grid styles:', mobileGridElement);

  // Take mobile screenshot
  await mobilePage.screenshot({
    path: 'production-mobile-quotations.png',
    fullPage: true
  });
  console.log('Screenshot saved: production-mobile-quotations.png');

  // Test tablet view
  console.log('\n=== TESTING TABLET VIEW (768x1024) ===\n');
  const tabletPage = await browser.newPage();
  await tabletPage.setViewportSize({ width: 768, height: 1024 });

  await tabletPage.goto('http://localhost:3000/quotations');
  await tabletPage.waitForTimeout(2000);

  const tabletGridElement = await tabletPage.evaluate(() => {
    const grid = document.querySelector('.grid');
    if (!grid) return null;
    const computed = window.getComputedStyle(grid);
    return {
      display: computed.display,
      gridTemplateColumns: computed.gridTemplateColumns,
    };
  });

  console.log('Tablet Grid styles:', tabletGridElement);

  // Take tablet screenshot
  await tabletPage.screenshot({
    path: 'production-tablet-quotations.png',
    fullPage: true
  });
  console.log('Screenshot saved: production-tablet-quotations.png');

  console.log('\n=== TEST SUMMARY ===\n');
  console.log('Expected grid columns:');
  console.log('- Mobile (375px): 1 column (grid-cols-1)');
  console.log('- Tablet (768px): 2 columns (md:grid-cols-2)');
  console.log('- Desktop (1920px): 3 columns (lg:grid-cols-3)');
  console.log('\nActual grid columns:');
  console.log('- Mobile:', mobileGridElement?.gridTemplateColumns || 'N/A');
  console.log('- Tablet:', tabletGridElement?.gridTemplateColumns || 'N/A');
  console.log('- Desktop:', desktopGridElement?.gridTemplateColumns || 'N/A');

  const mobileCorrect = mobileGridElement?.gridTemplateColumns?.includes('1fr') &&
                        !mobileGridElement?.gridTemplateColumns?.includes(',');
  const tabletCorrect = (tabletGridElement?.gridTemplateColumns?.match(/1fr/g) || []).length === 2;
  const desktopCorrect = (desktopGridElement?.gridTemplateColumns?.match(/1fr/g) || []).length === 3;

  console.log('\n=== RESULTS ===');
  console.log(`Mobile view: ${mobileCorrect ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Tablet view: ${tabletCorrect ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Desktop view: ${desktopCorrect ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Font rendering: ${desktopBodyStyles.fontFamily.includes('DM Sans') ? '✓ PASS' : '✗ FAIL'}`);

  if (mobileCorrect && tabletCorrect && desktopCorrect && desktopBodyStyles.fontFamily.includes('DM Sans')) {
    console.log('\n🎉 ALL TESTS PASSED! Responsive classes are working correctly!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the screenshots for details.');
  }

  await browser.close();
})();
