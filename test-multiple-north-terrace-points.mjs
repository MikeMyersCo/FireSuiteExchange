import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Go to browse page
  await page.goto('http://localhost:3001/browse');
  await page.waitForLoadState('networkidle');
  console.log('Loaded browse page');

  // Test multiple points in the North Terrace area
  const testPoints = [
    { name: 'North Terrace Center', x: 200, y: 60 },
    { name: 'North Terrace Left', x: 160, y: 55 },
    { name: 'North Terrace Right', x: 240, y: 65 },
    { name: 'North Terrace Top', x: 200, y: 40 },
    { name: 'North Terrace Bottom', x: 200, y: 80 },
  ];

  for (const point of testPoints) {
    console.log(`\n======================================`);
    console.log(`Testing: ${point.name}`);
    console.log(`SVG coordinates: (${point.x}, ${point.y})`);
    console.log(`======================================`);

    // Click "View Map" button
    await page.click('button:has-text("View Map")');
    await page.waitForTimeout(500);

    // Wait for modal to appear
    await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });

    // Get the SVG element within the modal
    const svg = await page.locator('.fixed.inset-0 svg[viewBox="0 0 877 655"]');
    await page.waitForTimeout(500);
    const box = await svg.boundingBox();

    if (!box) {
      console.log('Could not find SVG bounding box');
      continue;
    }

    // Calculate actual screen coordinates
    const screenX = box.x + (point.x / 877) * box.width;
    const screenY = box.y + (point.y / 655) * box.height;

    // Click the area
    await page.mouse.click(screenX, screenY);
    await page.waitForTimeout(1000);

    // Check what suite areas are shown in the listings
    const listingAreas = await page.locator('.bg-gradient-to-r p.text-xs.font-bold.text-black').allTextContents();

    // Count how many listings
    const northTerraceCount = listingAreas.filter(area => area.includes('North Terrace')).length;
    const vSectionsCount = listingAreas.filter(area => area.includes('V Sections')).length;
    const southTerraceCount = listingAreas.filter(area => area.includes('South Terrace')).length;
    const lowerBowlCount = listingAreas.filter(area => area.includes('Lower Bowl')).length;

    console.log(`Results:`);
    console.log(`  North Terrace: ${northTerraceCount}`);
    console.log(`  V Sections: ${vSectionsCount}`);
    console.log(`  South Terrace: ${southTerraceCount}`);
    console.log(`  Lower Bowl: ${lowerBowlCount}`);

    if (vSectionsCount > 0) {
      console.log(`❌ FAIL: This point shows V Sections!`);
      console.log(`First few listings: ${JSON.stringify(listingAreas.slice(0, 5))}`);
    } else if (northTerraceCount > 0) {
      console.log(`✅ SUCCESS: Shows North Terrace listings`);
    } else {
      console.log(`⚠️  Other listings shown`);
    }

    // Take a screenshot
    await page.screenshot({ path: `test-nt-${point.name.replace(/\s+/g, '-').toLowerCase()}.png` });

    // Close the modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Clear filter
    const clearButton = await page.locator('button:has-text("Clear All")').count();
    if (clearButton > 0) {
      await page.click('button:has-text("Clear All")');
      await page.waitForTimeout(500);
    }
  }

  console.log('\n======================================');
  console.log('All tests complete!');
  console.log('======================================');

  await browser.close();
})();
