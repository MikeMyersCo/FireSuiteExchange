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

  // Take screenshot of the new venue map
  await page.screenshot({ path: '/tmp/new-venue-map-initial.png' });
  console.log('Screenshot saved to /tmp/new-venue-map-initial.png');

  // Get the SVG element
  const svg = await page.locator('svg').last();
  const box = await svg.boundingBox();

  if (box) {
    console.log('SVG bounding box:', box);

    // Test V101 (left side)
    console.log('\nTesting V101 (left side, should filter to V101-104)...');
    const v101X = box.x + (box.width * (189 / 877));
    const v101Y = box.y + (box.height * (194 / 655));
    await page.mouse.click(v101X, v101Y);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/after-v101-new.png' });
    console.log('Clicked V101');

    // Test V203 (center lower bowl)
    console.log('\nTesting section 203 (center, should filter to Lower Bowl)...');
    const s203X = box.x + (box.width * (420 / 877));
    const s203Y = box.y + (box.height * (320 / 655));
    await page.mouse.click(s203X, s203Y);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/after-203-new.png' });
    console.log('Clicked 203');

    // Test V110 (top center, should be South Terrace)
    console.log('\nTesting V110 (top center, should filter to UST)...');
    const v110X = box.x + (box.width * (474 / 877));
    const v110Y = box.y + (box.height * (141 / 655));
    await page.mouse.click(v110X, v110Y);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/after-v110-new.png' });
    console.log('Clicked V110');

    // Test North Terrace area
    console.log('\nTesting North Terrace area...');
    const ntX = box.x + (box.width * (200 / 877));
    const ntY = box.y + (box.height * (180 / 655));
    await page.mouse.click(ntX, ntY);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/after-north-terrace-new.png' });
    console.log('Clicked North Terrace');
  }

  await page.waitForTimeout(2000);
  await browser.close();
  console.log('\nAll tests complete!');
})();
