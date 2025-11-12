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

  // Take screenshot of the relabeled map
  await page.screenshot({ path: '/tmp/relabeled-venue-map.png' });
  console.log('Screenshot saved to /tmp/relabeled-venue-map.png');

  // Test clicking on different V-sections
  const svg = await page.locator('svg').last();
  const box = await svg.boundingBox();

  if (box) {
    console.log('SVG bounding box:', box);

    // Test V101 (first section, left side)
    console.log('\nTesting V101 (should filter to V101-104)...');
    const v101X = box.x + (box.width * (210 / 592));
    const v101Y = box.y + (box.height * (61 / 420));
    await page.mouse.click(v101X, v101Y);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/after-v101-click.png' });
    console.log('Clicked V101, screenshot saved');

    // Test V109 (last in North Terrace group)
    console.log('\nTesting V109 (should filter to UNT)...');
    const v109X = box.x + (box.width * (386 / 592));
    const v109Y = box.y + (box.height * (61 / 420));
    await page.mouse.click(v109X, v109Y);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/after-v109-click.png' });
    console.log('Clicked V109, screenshot saved');

    // Test Lower Suite 203
    console.log('\nTesting section 203 (should filter to Lower Bowl)...');
    const s203X = box.x + (box.width * (295 / 592));
    const s203Y = box.y + (box.height * (174 / 420));
    await page.mouse.click(s203X, s203Y);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/after-203-click.png' });
    console.log('Clicked 203, screenshot saved');
  }

  await page.waitForTimeout(2000);
  await browser.close();
  console.log('\nAll tests complete!');
})();
