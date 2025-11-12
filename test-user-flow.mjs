import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();

  // Clear any cached data
  await context.clearCookies();

  const page = await context.newPage();

  console.log('Step 1: Loading browse page...');
  await page.goto('http://localhost:3001/browse', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Take initial screenshot
  await page.screenshot({ path: 'user-flow-1-initial.png', fullPage: true });
  console.log('Screenshot 1: Initial browse page');

  console.log('\nStep 2: Clicking View Map button...');
  await page.click('button:has-text("View Map")');
  await page.waitForTimeout(1000);

  // Wait for modal
  await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });
  await page.screenshot({ path: 'user-flow-2-modal-opened.png', fullPage: true });
  console.log('Screenshot 2: Map modal opened');

  console.log('\nStep 3: Clicking on North Terrace area...');
  // Get the SVG
  const svg = await page.locator('.fixed.inset-0 svg[viewBox="0 0 877 655"]');
  const box = await svg.boundingBox();

  if (!box) {
    console.log('ERROR: Could not find SVG');
    await browser.close();
    return;
  }

  // Click center of North Terrace polygon
  const ntX = 200;
  const ntY = 60;
  const screenX = box.x + (ntX / 877) * box.width;
  const screenY = box.y + (ntY / 655) * box.height;

  console.log(`Clicking at screen position: (${screenX.toFixed(2)}, ${screenY.toFixed(2)})`);
  await page.mouse.click(screenX, screenY);
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'user-flow-3-after-click.png', fullPage: true });
  console.log('Screenshot 3: After clicking North Terrace');

  // Check what's displayed
  console.log('\nStep 4: Checking displayed listings...');

  // Get all listing card headers
  const listingHeaders = await page.locator('.bg-gradient-to-r.from-green-100, .bg-gradient-to-r.from-yellow-100').allTextContents();
  console.log(`Found ${listingHeaders.length} listing card headers`);

  // Parse the headers to get area names
  const areas = [];
  for (let i = 0; i < Math.min(listingHeaders.length, 10); i++) {
    const headerText = listingHeaders[i];
    console.log(`Header ${i + 1}: "${headerText}"`);
    if (headerText.includes('North Terrace')) areas.push('North Terrace');
    else if (headerText.includes('South Terrace')) areas.push('South Terrace');
    else if (headerText.includes('V Sections')) areas.push('V Sections');
    else if (headerText.includes('Lower Bowl')) areas.push('Lower Bowl');
  }

  const ntCount = areas.filter(a => a === 'North Terrace').length;
  const vCount = areas.filter(a => a === 'V Sections').length;

  console.log('\n========================================');
  console.log('FINAL RESULT');
  console.log('========================================');
  console.log(`North Terrace listings shown: ${ntCount}`);
  console.log(`V Sections listings shown: ${vCount}`);

  if (vCount > 0) {
    console.log('\n❌ PROBLEM CONFIRMED: V Sections are showing!');
  } else if (ntCount > 0) {
    console.log('\n✅ WORKING CORRECTLY: Only North Terrace showing');
  } else {
    console.log('\n⚠️  No listings shown');
  }

  console.log('\nCheck the screenshots:');
  console.log('  - user-flow-1-initial.png');
  console.log('  - user-flow-2-modal-opened.png');
  console.log('  - user-flow-3-after-click.png');

  await page.waitForTimeout(5000);
  await browser.close();
})();
