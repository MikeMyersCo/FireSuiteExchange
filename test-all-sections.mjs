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

  const svg = await page.locator('svg').last();
  const box = await svg.boundingBox();

  if (box) {
    console.log('Testing clickable sections:\n');

    // Test V104 (should be V101-104)
    console.log('1. Testing V104 (top center left)...');
    const v104X = box.x + (box.width * (277 / 877));
    const v104Y = box.y + (box.height * (147 / 655));
    await page.mouse.click(v104X, v104Y);
    await page.waitForTimeout(1000);
    let url = page.url();
    console.log('   Result:', url.includes('V101-104') ? '✓ V101-104 filter' : '✗ Wrong filter');

    // Test section 203 (should be Lower Bowl)
    console.log('2. Testing section 203 (center)...');
    const s203X = box.x + (box.width * (440 / 877));
    const s203Y = box.y + (box.height * (315 / 655));
    await page.mouse.click(s203X, s203Y);
    await page.waitForTimeout(1000);
    url = page.url();
    console.log('   Result:', url.includes('area=L') ? '✓ Lower Bowl filter' : '✗ Wrong filter');

    // Test section 201 (should be Lower Bowl)
    console.log('3. Testing section 201 (left lower)...');
    const s201X = box.x + (box.width * (260 / 877));
    const s201Y = box.y + (box.height * (375 / 655));
    await page.mouse.click(s201X, s201Y);
    await page.waitForTimeout(1000);
    url = page.url();
    console.log('   Result:', url.includes('area=L') ? '✓ Lower Bowl filter' : '✗ Wrong filter');

    // Test V110 (should be South Terrace)
    console.log('4. Testing V110 (top center right)...');
    const v110X = box.x + (box.width * (469 / 877));
    const v110Y = box.y + (box.height * (141 / 655));
    await page.mouse.click(v110X, v110Y);
    await page.waitForTimeout(1000);
    url = page.url();
    console.log('   Result:', url.includes('area=UST') ? '✓ South Terrace filter' : '✗ Wrong filter');

    // Test V106 (should be North Terrace)
    console.log('5. Testing V106 (top center)...');
    const v106X = box.x + (box.width * (341 / 877));
    const v106Y = box.y + (box.height * (143 / 655));
    await page.mouse.click(v106X, v106Y);
    await page.waitForTimeout(1000);
    url = page.url();
    console.log('   Result:', url.includes('area=UNT') ? '✓ North Terrace filter' : '✗ Wrong filter');

    // Test V117 (should be South Terrace)
    console.log('6. Testing V117 (right side)...');
    const v117X = box.x + (box.width * (740 / 877));
    const v117Y = box.y + (box.height * (219 / 655));
    await page.mouse.click(v117X, v117Y);
    await page.waitForTimeout(1000);
    url = page.url();
    console.log('   Result:', url.includes('area=UST') ? '✓ South Terrace filter' : '✗ Wrong filter');

    console.log('\nAll tests complete!');
    await page.screenshot({ path: '/tmp/final-test.png' });
  }

  await page.waitForTimeout(2000);
  await browser.close();
})();
