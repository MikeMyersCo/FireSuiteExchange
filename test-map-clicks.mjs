import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 1000 });

  await page.goto('http://localhost:3001/browse');
  await page.waitForTimeout(2000);

  console.log('Opening venue map modal...');
  await page.click('button:has-text("View Map")');
  await page.waitForTimeout(1500);

  // Try to click on different areas of the map
  console.log('Attempting to click on section 203 (center)...');

  // Get the SVG element
  const svg = await page.locator('svg').last();
  const box = await svg.boundingBox();

  if (box) {
    console.log('SVG bounding box:', box);

    // Click in the center area where 203 should be (around coordinates 295,160 in viewBox)
    const clickX = box.x + (box.width * (295 / 592));
    const clickY = box.y + (box.height * (160 / 420));

    console.log(`Clicking at screen position: (${clickX}, ${clickY})`);
    await page.mouse.click(clickX, clickY);
    await page.waitForTimeout(1000);

    // Check if the URL or page changed
    const url = page.url();
    console.log('Current URL:', url);

    // Take screenshot
    await page.screenshot({ path: '/tmp/after-click.png' });
    console.log('Screenshot saved to /tmp/after-click.png');
  }

  await page.waitForTimeout(3000);
  await browser.close();
})();
