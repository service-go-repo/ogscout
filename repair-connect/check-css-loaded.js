const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Check all stylesheets loaded
  const stylesheets = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    return sheets.map(sheet => ({
      href: sheet.href,
      rulesCount: sheet.cssRules ? sheet.cssRules.length : 0,
      disabled: sheet.disabled
    }));
  });

  console.log('\n=== STYLESHEETS LOADED ===');
  stylesheets.forEach((sheet, index) => {
    console.log(`\n${index + 1}. ${sheet.href || 'inline'}`);
    console.log(`   Rules: ${sheet.rulesCount}`);
    console.log(`   Disabled: ${sheet.disabled}`);
  });

  // Check if Tailwind CSS classes exist
  const hasResponsiveClasses = await page.evaluate(() => {
    // Get the Tailwind CSS stylesheet
    const sheets = Array.from(document.styleSheets);

    for (const sheet of sheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);

        // Check for @media rules
        const mediaRules = rules.filter(rule => rule.type === CSSRule.MEDIA_RULE);

        for (const mediaRule of mediaRules) {
          const innerRules = Array.from(mediaRule.cssRules || []);
          const responsiveClasses = innerRules.filter(rule =>
            rule.selectorText && (
              rule.selectorText.includes('.lg\\:grid-cols-2') ||
              rule.selectorText.includes('.md\\:grid-cols-') ||
              rule.selectorText.includes('.sm\\:')
            )
          );

          if (responsiveClasses.length > 0) {
            return {
              found: true,
              media: mediaRule.media.mediaText,
              examples: responsiveClasses.slice(0, 3).map(r => r.selectorText)
            };
          }
        }
      } catch (e) {
        // CORS or other error
      }
    }

    return { found: false };
  });

  console.log('\n=== RESPONSIVE CLASSES CHECK ===');
  if (hasResponsiveClasses.found) {
    console.log('✓ Responsive classes FOUND!');
    console.log('Media query:', hasResponsiveClasses.media);
    console.log('Examples:', hasResponsiveClasses.examples);
  } else {
    console.log('✗ Responsive classes NOT FOUND');
  }

  // Check computed style of a grid element
  const gridComputed = await page.evaluate(() => {
    const grid = document.querySelector('.grid');
    if (!grid) return null;

    const computed = window.getComputedStyle(grid);
    const classes = grid.className;

    // Check if lg: classes are present
    const hasLgClass = classes.includes('lg:');

    return {
      classes,
      hasLgClass,
      display: computed.display,
      gridTemplateColumns: computed.gridTemplateColumns,
      width: computed.width
    };
  });

  console.log('\n=== GRID ELEMENT ANALYSIS ===');
  console.log('Classes:', gridComputed?.classes);
  console.log('Has lg: class:', gridComputed?.hasLgClass);
  console.log('Computed grid-template-columns:', gridComputed?.gridTemplateColumns);
  console.log('Width:', gridComputed?.width);

  // Take screenshot
  await page.screenshot({ path: 'css-debug.png', fullPage: true });
  console.log('\nScreenshot saved: css-debug.png');

  await browser.close();
})();
