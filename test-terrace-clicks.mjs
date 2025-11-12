import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Go to browse page
  await page.goto('http://localhost:3001/browse');
  await page.waitForLoadState('networkidle');

  // Click "View Map" button
  await page.click('button:has-text("View Map")');
  await page.waitForTimeout(1000);

  // Wait for modal to appear
  await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });

  // Get the SVG element within the modal
  const svg = await page.locator('.fixed.inset-0 svg').first();
  await page.waitForTimeout(500);
  const box = await svg.boundingBox();

  if (!box) {
    console.log('Could not find SVG bounding box');
    await browser.close();
    return;
  }

  console.log('SVG bounding box:', box);

  // Test clicks in different areas
  const testAreas = [
    { name: 'North Terrace Area (should be UNT)', x: 200, y: 90 },
    { name: 'Left V Section Area (should be V)', x: 180, y: 170 },
    { name: 'South Terrace Area (should be UST)', x: 680, y: 90 },
    { name: 'Right V Section Area (should be V)', x: 680, y: 170 },
    { name: 'Lower Bowl (should be L)', x: 300, y: 360 },
  ];

  for (const area of testAreas) {
    console.log(`\n=== Testing: ${area.name} ===`);
    console.log(`Clicking at SVG coordinates: (${area.x}, ${area.y})`);

    // Calculate actual screen coordinates
    const screenX = box.x + (area.x / 877) * box.width;
    const screenY = box.y + (area.y / 655) * box.height;

    console.log(`Screen coordinates: (${screenX}, ${screenY})`);

    // Click the area
    await page.mouse.click(screenX, screenY);
    await page.waitForTimeout(500);

    // Check URL for filter
    const url = page.url();
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const areaFilter = urlParams.get('area');

    console.log(`Area filter in URL: ${areaFilter || 'none'}`);

    // Check the active filter pill
    const filterPill = await page.locator('.bg-green-100, .bg-blue-100').textContent().catch(() => 'none');
    console.log(`Active filter: ${filterPill}`);

    // Take a screenshot
    await page.screenshot({ path: `test-click-${area.name.replace(/\s+/g, '-').toLowerCase()}.png` });

    // Close the modal by clicking the close button or pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Clear filter if it exists
    const clearButton = await page.locator('button:has-text("Clear All")').count();
    if (clearButton > 0) {
      await page.click('button:has-text("Clear All")');
      await page.waitForTimeout(300);
    }

    // Re-open map for next test
    if (area !== testAreas[testAreas.length - 1]) {
      await page.click('button:has-text("View Map")');
      await page.waitForTimeout(500);
      await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });
    }
  }

  console.log('\n=== Testing complete! ===');
  console.log('Check the screenshots to see which areas were selected.');

  await browser.close();
})();
