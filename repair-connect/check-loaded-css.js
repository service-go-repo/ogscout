const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  await page.goto('http://localhost:3000/quotations');
  await page.waitForTimeout(3000);

  // Get all loaded stylesheets
  const stylesheets = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    return sheets.map(sheet => ({
      href: sheet.href,
      rulesCount: sheet.cssRules ? sheet.cssRules.length : 0,
      disabled: sheet.disabled
    }));
  });

  console.log('\n=== LOADED STYLESHEETS ===');
  stylesheets.forEach((sheet, index) => {
    console.log(`\n${index + 1}. ${sheet.href || 'inline'}`);
    console.log(`   Rules: ${sheet.rulesCount}`);
    console.log(`   Disabled: ${sheet.disabled}`);
  });

  // Check if the grid element has the correct classes
  const gridInfo = await page.evaluate(() => {
    const grid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
    if (!grid) {
      return { found: false };
    }

    const computed = window.getComputedStyle(grid);
    return {
      found: true,
      classes: grid.className,
      display: computed.display,
      gridTemplateColumns: computed.gridTemplateColumns,
    };
  });

  console.log('\n=== GRID ELEMENT ===');
  if (gridInfo.found) {
    console.log('Grid found!');
    console.log('Classes:', gridInfo.classes);
    console.log('Computed display:', gridInfo.display);
    console.log('Computed grid-template-columns:', gridInfo.gridTemplateColumns);
  } else {
    console.log('Grid element not found!');
  }

  await browser.close();
})();
