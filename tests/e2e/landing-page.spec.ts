import { test, expect } from '@playwright/test';

test.describe('Fire Suite Exchange Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading and hero section', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: /Fire Suite Exchange/i })).toBeVisible();

    // Check hero text
    await expect(page.getByText(/Ford Amphitheater/i)).toBeVisible();
    await expect(page.getByText(/verified Fire Suite owners/i)).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    // Check navigation links exist
    await expect(page.getByRole('link', { name: 'Browse Listings' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Become a Seller' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  });

  test('should display all three suite area tiles', async ({ page }) => {
    // North Terrace
    await expect(page.getByRole('heading', { name: 'North Terrace' })).toBeVisible();
    await expect(page.getByText('Suites 1-20 • 8 seats each')).toBeVisible();

    // South Terrace
    await expect(page.getByRole('heading', { name: 'South Terrace' })).toBeVisible();

    // Lower Fire Suites
    await expect(page.getByRole('heading', { name: 'Lower Fire Suites' })).toBeVisible();
    await expect(page.getByText('Suites 1-90 • 8 seats each')).toBeVisible();
  });

  test('should have clickable suite area tiles', async ({ page }) => {
    // Click North Terrace tile
    const northTerraceLink = page.getByRole('link', { name: /North Terrace/ });
    await expect(northTerraceLink).toHaveAttribute('href', '/browse?area=NORTH_TERRACE');

    // Click South Terrace tile
    const southTerraceLink = page.getByRole('link', { name: /South Terrace/ });
    await expect(southTerraceLink).toHaveAttribute('href', '/browse?area=SOUTH_TERRACE');

    // Click Lower Fire Suite tile
    const lowerFireLink = page.getByRole('link', { name: /Lower Fire Suites/ });
    await expect(lowerFireLink).toHaveAttribute('href', '/browse?area=LOWER_FIRE');
  });

  test('should display "How It Works" section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'How It Works' })).toBeVisible();

    // Check for all 3 steps
    await expect(page.getByText('Browse Listings')).toBeVisible();
    await expect(page.getByText('Contact Seller')).toBeVisible();
    await expect(page.getByText('Enjoy the Show')).toBeVisible();
  });

  test('should have CTA buttons', async ({ page }) => {
    // Check main CTA buttons
    const browseButton = page.getByRole('link', { name: 'Browse Tickets' }).first();
    await expect(browseButton).toBeVisible();
    await expect(browseButton).toHaveAttribute('href', '/browse');

    const listButton = page.getByRole('link', { name: 'List Your Tickets' }).first();
    await expect(listButton).toBeVisible();
    await expect(listButton).toHaveAttribute('href', '/apply-seller');
  });

  test('should display footer with legal links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check copyright
    await expect(page.getByText(/© 2025 Fire Suite Exchange/i)).toBeVisible();

    // Check legal links
    await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  });

  test('should have proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Fire Suite Exchange/);
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: /Fire Suite Exchange/i })).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: /Fire Suite Exchange/i })).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('heading', { name: /Fire Suite Exchange/i })).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check that links are keyboard accessible
    await page.keyboard.press('Tab');
    const firstFocusable = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON']).toContain(firstFocusable);
  });
});
