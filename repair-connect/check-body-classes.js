const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Get body element info
  const bodyInfo = await page.evaluate(() => {
    const body = document.body;
    return {
      className: body.className,
      classList: Array.from(body.classList),
      innerHTML: body.innerHTML.substring(0, 500), // First 500 chars
    };
  });

  console.log('Body className:', bodyInfo.className);
  console.log('Body classList:', bodyInfo.classList);
  console.log('\nFirst 500 chars of body HTML:', bodyInfo.innerHTML);

  // Check viewport
  const viewport = await page.evaluate(() => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
    };
  });

  console.log('\nViewport:', viewport);

  // Check if responsive classes are working
  const responsiveTest = await page.evaluate(() => {
    const div = document.createElement('div');
    div.className = 'hidden md:block';
    document.body.appendChild(div);
    const computed = window.getComputedStyle(div);
    const display = computed.display;
    document.body.removeChild(div);
    return { display, windowWidth: window.innerWidth };
  });

  console.log('\nResponsive test (hidden md:block):', responsiveTest);

  await browser.close();
})();
