const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Inspect body element
  const bodyInfo = await page.evaluate(() => {
    const body = document.body;
    const computed = window.getComputedStyle(body);

    return {
      className: body.className,
      fontFamily: computed.fontFamily,
      fontFamilyRaw: body.style.fontFamily,
      allClasses: body.classList ? Array.from(body.classList) : [],
    };
  });

  console.log('Body element info:', bodyInfo);

  // Check if font-sans class is available
  const fontSansCheck = await page.evaluate(() => {
    const testDiv = document.createElement('div');
    testDiv.className = 'font-sans';
    document.body.appendChild(testDiv);
    const computed = window.getComputedStyle(testDiv);
    const fontFamily = computed.fontFamily;
    document.body.removeChild(testDiv);
    return fontFamily;
  });

  console.log('font-sans class applies:', fontSansCheck);

  // Check CSS rules
  const cssRules = await page.evaluate(() => {
    const rules = [];
    for (let sheet of document.styleSheets) {
      try {
        for (let rule of sheet.cssRules || sheet.rules) {
          if (rule.selectorText && rule.selectorText.includes('font-sans')) {
            rules.push({
              selector: rule.selectorText,
              fontFamily: rule.style.fontFamily,
            });
          }
          if (rule.selectorText === 'body' || rule.selectorText === '.dark body') {
            rules.push({
              selector: rule.selectorText,
              fontFamily: rule.style.fontFamily,
              color: rule.style.color,
              backgroundColor: rule.style.backgroundColor,
            });
          }
        }
      } catch (e) {
        // CORS or other errors
      }
    }
    return rules;
  });

  console.log('Relevant CSS rules:', JSON.stringify(cssRules, null, 2));

  // Check loaded stylesheets
  const stylesheets = await page.evaluate(() => {
    return Array.from(document.styleSheets).map(sheet => ({
      href: sheet.href,
      disabled: sheet.disabled,
      rulesCount: sheet.cssRules?.length || 0,
    }));
  });

  console.log('Loaded stylesheets:', stylesheets);

  await browser.close();
})();
