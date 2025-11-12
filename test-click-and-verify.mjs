import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 1000 });

  await page.goto('http://localhost:3001/browse');
  await page.waitForTimeout(2000);

  // Check if there's a map visible on the page (not in modal)
  const mapVisible = await page.locator('img[alt="Venue Map"]').first().isVisible();
  console.log('Map visible on page:', mapVisible);

  if (mapVisible) {
    console.log('\nTesting clicks on sidebar map...');

    // Try clicking on section 203
    const img = await page.locator('img[alt="Venue Map"]').first();
    const box = await img.boundingBox();

    if (box) {
      console.log('Image bounding box:', box);

      // Click center of image (should be section 203 area)
      const clickX = box.x + (box.width * 0.5);
      const clickY = box.y + (box.height * 0.48);

      console.log(`Clicking at (${clickX}, ${clickY})`);
      await page.mouse.click(clickX, clickY);
      await page.waitForTimeout(1500);

      const url = page.url();
      console.log('URL after click:', url);

      // Take screenshot
      await page.screenshot({ path: '/tmp/sidebar-click-test.png' });
    }
  }

  console.log('\nNow testing modal map...');
  await page.click('button:has-text("View Map")');
  await page.waitForTimeout(1500);

  // Click on section 203 in modal
  const svg = await page.locator('svg').last();
  const box = await svg.boundingBox();

  if (box) {
    const s203X = box.x + (box.width * (440 / 877));
    const s203Y = box.y + (box.height * (315 / 655));

    console.log(`Clicking section 203 at (${s203X}, ${s203Y})`);
    await page.mouse.click(s203X, s203Y);
    await page.waitForTimeout(1500);

    const url = page.url();
    console.log('URL after modal click:', url);

    // Check if filter is applied
    const filterText = await page.locator('text="Active filters:"').isVisible();
    console.log('Filter section visible:', filterText);

    if (filterText) {
      const activeFilters = await page.locator('[class*="Active filters"]').textContent();
      console.log('Active filters:', activeFilters);
    }

    await page.screenshot({ path: '/tmp/modal-click-test.png' });
  }

  await page.waitForTimeout(3000);
  await browser.close();
})();
