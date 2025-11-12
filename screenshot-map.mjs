import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 1000 });

  await page.goto('http://localhost:3001/browse');
  await page.waitForTimeout(2000);

  // Click View Map button
  await page.click('button:has-text("View Map")');
  await page.waitForTimeout(1500);

  // Take screenshot
  await page.screenshot({ path: '/tmp/venue-map-styled.png' });
  console.log('Screenshot saved to /tmp/venue-map-styled.png');

  await browser.close();
})();
