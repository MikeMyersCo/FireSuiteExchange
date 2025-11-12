import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Go to browse page
  await page.goto('http://localhost:3001/browse');
  await page.waitForLoadState('networkidle');
  console.log('Loaded browse page');

  // Wait a bit for listings to load
  await page.waitForTimeout(1000);

  // Click "View Map" button
  await page.click('button:has-text("View Map")');
  await page.waitForTimeout(500);
  console.log('Clicked View Map button');

  // Wait for modal to appear
  await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });
  console.log('Modal appeared');

  // Get the SVG element within the modal - use a more specific selector for the venue map SVG
  // The venue map SVG has viewBox="0 0 877 655"
  const svg = await page.locator('.fixed.inset-0 svg[viewBox="0 0 877 655"]');
  await page.waitForTimeout(500);
  const box = await svg.boundingBox();

  if (!box) {
    console.log('Could not find SVG bounding box');
    await browser.close();
    return;
  }

  console.log('SVG bounding box:', box);

  // Test North Terrace click - coordinates in the middle of the north terrace polygon
  const northTerraceTestPoint = { name: 'North Terrace (UNT)', x: 200, y: 60 };

  console.log(`\n=== Testing: ${northTerraceTestPoint.name} ===`);
  console.log(`Clicking at SVG coordinates: (${northTerraceTestPoint.x}, ${northTerraceTestPoint.y})`);

  // Calculate actual screen coordinates
  const screenX = box.x + (northTerraceTestPoint.x / 877) * box.width;
  const screenY = box.y + (northTerraceTestPoint.y / 655) * box.height;

  console.log(`Screen coordinates: (${screenX}, ${screenY})`);

  // Click the area
  await page.mouse.click(screenX, screenY);
  await page.waitForTimeout(1000);

  // Check URL for filter
  const url = page.url();
  const urlParams = new URLSearchParams(url.split('?')[1]);
  const areaFilter = urlParams.get('area');

  console.log(`URL: ${url}`);
  console.log(`Area filter in URL: ${areaFilter || 'none'}`);

  // Check which filter pill is active
  try {
    const filterPills = await page.locator('.bg-green-100, .bg-blue-100, .bg-yellow-100').allTextContents();
    console.log(`Active filter pills: ${JSON.stringify(filterPills)}`);
  } catch (e) {
    console.log('No filter pills found');
  }

  // Check what suite areas are shown in the listings
  await page.waitForTimeout(500);
  const listingAreas = await page.locator('.bg-gradient-to-r p.text-xs.font-bold.text-black').allTextContents();
  console.log(`Listing areas shown: ${JSON.stringify(listingAreas.slice(0, 10))}`); // Show first 10

  // Count how many listings have "North Terrace" vs "V Sections"
  const northTerraceCount = listingAreas.filter(area => area.includes('North Terrace')).length;
  const vSectionsCount = listingAreas.filter(area => area.includes('V Sections')).length;
  const lowerBowlCount = listingAreas.filter(area => area.includes('Lower Bowl')).length;

  console.log(`North Terrace listings: ${northTerraceCount}`);
  console.log(`V Sections listings: ${vSectionsCount}`);
  console.log(`Lower Bowl listings: ${lowerBowlCount}`);

  // Take a screenshot
  await page.screenshot({ path: 'test-north-terrace-click.png', fullPage: true });
  console.log('Screenshot saved as test-north-terrace-click.png');

  // Wait so we can see the result
  await page.waitForTimeout(3000);

  console.log('\n=== Result ===');
  if (northTerraceCount > 0 && vSectionsCount === 0) {
    console.log('✅ SUCCESS: North Terrace click correctly filtered to UNT (only North Terrace listings shown)');
  } else if (vSectionsCount > 0 && northTerraceCount === 0) {
    console.log('❌ FAIL: North Terrace click incorrectly filtered to V sections');
  } else if (vSectionsCount > 0 && northTerraceCount > 0) {
    console.log('❌ FAIL: Both North Terrace and V Sections listings are shown');
  } else {
    console.log(`⚠️  WARNING: No listings shown at all`);
  }

  await browser.close();
})();
