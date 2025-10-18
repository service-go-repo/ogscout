const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });

  // Test desktop view
  console.log('\n=== TESTING DESKTOP VIEW (1920x1080) ===\n');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewportSize({ width: 1920, height: 1080 });

  await desktopPage.goto('http://localhost:3000');
  await desktopPage.waitForTimeout(3000);

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

  // Check for any grid elements on homepage
  const desktopGrids = await desktopPage.evaluate(() => {
    const grids = Array.from(document.querySelectorAll('.grid'));
    return grids.map(grid => {
      const computed = window.getComputedStyle(grid);
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        classes: grid.className,
      };
    });
  });

  console.log('Desktop Grid elements found:', desktopGrids.length);
  if (desktopGrids.length > 0) {
    console.log('First grid:', desktopGrids[0]);
  }

  // Take desktop screenshot
  await desktopPage.screenshot({
    path: 'test-desktop-homepage.png',
    fullPage: true
  });
  console.log('Screenshot saved: test-desktop-homepage.png');

  // Test mobile view
  console.log('\n=== TESTING MOBILE VIEW (375x667) ===\n');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 667 });

  await mobilePage.goto('http://localhost:3000');
  await mobilePage.waitForTimeout(3000);

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

  const mobileGrids = await mobilePage.evaluate(() => {
    const grids = Array.from(document.querySelectorAll('.grid'));
    return grids.map(grid => {
      const computed = window.getComputedStyle(grid);
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        classes: grid.className,
      };
    });
  });

  console.log('Mobile Grid elements found:', mobileGrids.length);
  if (mobileGrids.length > 0) {
    console.log('First grid:', mobileGrids[0]);
  }

  // Take mobile screenshot
  await mobilePage.screenshot({
    path: 'test-mobile-homepage.png',
    fullPage: true
  });
  console.log('Screenshot saved: test-mobile-homepage.png');

  // Test tablet view
  console.log('\n=== TESTING TABLET VIEW (768x1024) ===\n');
  const tabletPage = await browser.newPage();
  await tabletPage.setViewportSize({ width: 768, height: 1024 });

  await tabletPage.goto('http://localhost:3000');
  await tabletPage.waitForTimeout(3000);

  const tabletGrids = await tabletPage.evaluate(() => {
    const grids = Array.from(document.querySelectorAll('.grid'));
    return grids.map(grid => {
      const computed = window.getComputedStyle(grid);
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        classes: grid.className,
      };
    });
  });

  console.log('Tablet Grid elements found:', tabletGrids.length);
  if (tabletGrids.length > 0) {
    console.log('First grid:', tabletGrids[0]);
  }

  // Take tablet screenshot
  await tabletPage.screenshot({
    path: 'test-tablet-homepage.png',
    fullPage: true
  });
  console.log('Screenshot saved: test-tablet-homepage.png');

  // Check if responsive classes are working by testing a specific element with responsive classes
  console.log('\n=== CHECKING RESPONSIVE CLASS APPLICATION ===\n');

  // Check if DM Sans font is loaded
  const fontLoaded = await desktopPage.evaluate(() => {
    return document.fonts.check('1em "DM Sans"');
  });

  console.log('DM Sans font loaded:', fontLoaded);

  // Get all stylesheets and check for responsive classes
  const cssInfo = await desktopPage.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    let hasMediaQueries = false;
    let hasResponsiveClasses = false;

    for (const sheet of sheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        for (const rule of rules) {
          if (rule.type === CSSRule.MEDIA_RULE) {
            hasMediaQueries = true;
            const mediaRules = Array.from(rule.cssRules || []);
            for (const mediaRule of mediaRules) {
              if (mediaRule.selectorText && (
                mediaRule.selectorText.includes('.md\\:') ||
                mediaRule.selectorText.includes('.lg\\:') ||
                mediaRule.selectorText.includes('.sm\\:')
              )) {
                hasResponsiveClasses = true;
                break;
              }
            }
          }
          if (hasResponsiveClasses) break;
        }
      } catch (e) {
        // Skip CORS-blocked stylesheets
      }
      if (hasResponsiveClasses) break;
    }

    return { hasMediaQueries, hasResponsiveClasses };
  });

  console.log('CSS Info:', cssInfo);

  console.log('\n=== RESULTS ===');
  console.log(`Media queries present: ${cssInfo.hasMediaQueries ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Responsive classes present: ${cssInfo.hasResponsiveClasses ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Font DM Sans loaded: ${fontLoaded ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Font rendering: ${desktopBodyStyles.fontFamily.includes('DM Sans') ? '✓ PASS' : '✗ FAIL'}`);

  if (cssInfo.hasMediaQueries && cssInfo.hasResponsiveClasses && fontLoaded) {
    console.log('\n🎉 RESPONSIVE CSS IS WORKING! Media queries and responsive classes are present!');
  } else {
    console.log('\n⚠️ Issues detected. Check the screenshots and logs for details.');
  }

  await browser.close();
})();
