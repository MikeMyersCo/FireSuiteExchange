import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 1000 });

  await page.goto('http://localhost:3001/browse');
  await page.waitForTimeout(2000);

  console.log('\n=== MANUAL TEST MODE ===');
  console.log('1. Opening the View Map modal...');
  await page.click('button:has-text("View Map")');
  await page.waitForTimeout(2000);

  console.log('2. Browser is now open - try clicking on different sections');
  console.log('3. Watch the URL and Active filters to see if they change');
  console.log('4. Press Ctrl+C in terminal when done\n');

  // Add console logging in the browser
  await page.evaluate(() => {
    // Log all clicks on the SVG
    const svg = document.querySelector('svg:last-of-type');
    if (svg) {
      svg.addEventListener('click', (e) => {
        console.log('%c CLICK DETECTED on SVG', 'background: green; color: white; font-weight: bold');
        console.log('Target:', e.target);
        console.log('TagName:', e.target.tagName);
      });
    }

    // Also check if clicks are reaching the elements
    document.querySelectorAll('rect, polygon').forEach((el, idx) => {
      el.addEventListener('click', (e) => {
        console.log(`%c ${e.target.tagName} #${idx} CLICKED`, 'background: blue; color: white; font-weight: bold');
        e.stopPropagation();
      });
    });
  });

  // Forward console messages
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  // Keep open for 2 minutes
  await page.waitForTimeout(120000);
  await browser.close();
})();
