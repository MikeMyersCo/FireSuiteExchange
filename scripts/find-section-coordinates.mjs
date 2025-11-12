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

  // Add visible overlays to debug clickable areas
  await page.evaluate(() => {
    // Make all SVG elements visible with semi-transparent colors
    const rects = document.querySelectorAll('svg rect');
    rects.forEach((rect, index) => {
      rect.setAttribute('fill', 'rgba(255, 0, 0, 0.3)');
      rect.setAttribute('stroke', 'red');
      rect.setAttribute('stroke-width', '2');
    });

    const polygons = document.querySelectorAll('svg polygon');
    polygons.forEach((polygon, index) => {
      polygon.setAttribute('fill', 'rgba(0, 0, 255, 0.3)');
      polygon.setAttribute('stroke', 'blue');
      polygon.setAttribute('stroke-width', '2');
    });
  });

  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/debug-clickable-areas.png', fullPage: false });
  console.log('Screenshot with visible overlays saved to /tmp/debug-clickable-areas.png');

  // Now let's click around and log coordinates
  const svg = await page.locator('svg').last();
  const box = await svg.boundingBox();

  if (box) {
    console.log('\nSVG bounding box:', box);
    console.log('Image dimensions in viewBox: 877 x 655');
    console.log('\nClick around the map. Press Ctrl+C to exit.');

    // Add click listener to log coordinates
    await page.evaluate(() => {
      document.addEventListener('click', (e) => {
        const svg = document.querySelector('svg:last-of-type');
        const box = svg.getBoundingClientRect();
        const viewBoxWidth = 877;
        const viewBoxHeight = 655;

        const relativeX = e.clientX - box.left;
        const relativeY = e.clientY - box.top;

        const viewBoxX = Math.round((relativeX / box.width) * viewBoxWidth);
        const viewBoxY = Math.round((relativeY / box.height) * viewBoxHeight);

        console.log(`Clicked at screen (${e.clientX}, ${e.clientY}) -> SVG viewBox (${viewBoxX}, ${viewBoxY})`);
      });
    });

    page.on('console', msg => {
      if (msg.text().includes('viewBox')) {
        console.log(msg.text());
      }
    });
  }

  // Keep browser open for manual clicking
  await page.waitForTimeout(120000); // Wait 2 minutes
  await browser.close();
})();
