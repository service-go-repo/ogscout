const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: 'production-homepage.png', fullPage: true });

  // Check computed styles
  const bodyStyles = await page.evaluate(() => {
    const body = document.body;
    const computed = window.getComputedStyle(body);
    return {
      fontFamily: computed.fontFamily,
      backgroundColor: computed.backgroundColor,
      color: computed.color,
    };
  });

  console.log('Body styles:', bodyStyles);

  // Check CSS variables
  const cssVars = await page.evaluate(() => {
    const root = document.documentElement;
    const computed = window.getComputedStyle(root);
    return {
      '--background': computed.getPropertyValue('--background'),
      '--foreground': computed.getPropertyValue('--foreground'),
      '--font-sans': computed.getPropertyValue('--font-sans'),
      '--primary': computed.getPropertyValue('--primary'),
    };
  });

  console.log('CSS Variables:', cssVars);

  // Check if fonts are loaded
  const fonts = await page.evaluate(() => {
    return document.fonts.check('1em "DM Sans"');
  });

  console.log('DM Sans loaded:', fonts);

  await browser.close();
})();
