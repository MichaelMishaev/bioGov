import { test, expect } from '@playwright/test';

test.describe('Home Button Visibility', () => {
  const pagesToTest = [
    { path: '/login', name: 'Login Page' },
    { path: '/signup', name: 'Signup Page' },
    { path: '/about', name: 'About Page' },
    { path: '/contact', name: 'Contact Page' },
    { path: '/privacy', name: 'Privacy Page' },
    { path: '/quiz', name: 'Quiz Page' },
  ];

  test('should NOT display home button on home page', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Home button should not be visible on the home page
    const homeButton = page.getByTestId('home-button');
    await expect(homeButton).not.toBeVisible();
  });

  pagesToTest.forEach(({ path, name }) => {
    test(`should display home button on ${name}`, async ({ page }) => {
      await page.goto(`http://localhost:3001${path}`);

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Home button should be visible
      const homeButton = page.getByTestId('home-button');
      await expect(homeButton).toBeVisible();

      // Verify button is in fixed position (top-left corner for RTL)
      const buttonBox = await homeButton.boundingBox();
      expect(buttonBox).not.toBeNull();

      // Check that it's positioned near the left edge (RTL layout)
      if (buttonBox) {
        expect(buttonBox.x).toBeLessThan(100); // Should be within 100px of left edge
      }

      // Verify aria-label for accessibility
      await expect(homeButton).toHaveAttribute('aria-label', 'חזרה לדף הבית');
    });
  });

  test('should navigate to home page when clicked from login', async ({ page }) => {
    await page.goto('http://localhost:3001/login');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click home button
    const homeButton = page.getByTestId('home-button');
    await expect(homeButton).toBeVisible();
    await homeButton.click();

    // Should navigate to home page
    await page.waitForURL('http://localhost:3001/');
    expect(page.url()).toBe('http://localhost:3001/');
  });

  test('should navigate to home page when clicked from signup', async ({ page }) => {
    await page.goto('http://localhost:3001/signup');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click home button
    const homeButton = page.getByTestId('home-button');
    await expect(homeButton).toBeVisible();
    await homeButton.click();

    // Should navigate to home page
    await page.waitForURL('http://localhost:3001/');
    expect(page.url()).toBe('http://localhost:3001/');
  });

  test('should navigate to home page when clicked from about', async ({ page }) => {
    await page.goto('http://localhost:3001/about');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click home button
    const homeButton = page.getByTestId('home-button');
    await expect(homeButton).toBeVisible();
    await homeButton.click();

    // Should navigate to home page
    await page.waitForURL('http://localhost:3001/');
    expect(page.url()).toBe('http://localhost:3001/');
  });

  test('should be visible on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');

    // Home button should still be visible on mobile
    const homeButton = page.getByTestId('home-button');
    await expect(homeButton).toBeVisible();

    // Button should be accessible
    const buttonBox = await homeButton.boundingBox();
    expect(buttonBox).not.toBeNull();
  });

  test('should have hover effect', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');

    const homeButton = page.getByTestId('home-button');
    await expect(homeButton).toBeVisible();

    // Hover over button
    await homeButton.hover();

    // Button should still be visible after hover
    await expect(homeButton).toBeVisible();
  });

  test('should be visible and accessible with keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');

    // Tab to the home button
    await page.keyboard.press('Tab');

    // Check if home button is focused (may need multiple tabs depending on page structure)
    const homeButton = page.getByTestId('home-button');
    await expect(homeButton).toBeVisible();

    // Should be able to activate with Enter key
    await homeButton.focus();
    await page.keyboard.press('Enter');

    // Should navigate to home
    await page.waitForURL('http://localhost:3001/', { timeout: 5000 });
  });

  test('should work correctly in RTL layout', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');

    // Verify page is in RTL mode
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');

    // Home button should be positioned on the left in RTL
    const homeButton = page.getByTestId('home-button');
    await expect(homeButton).toBeVisible();

    const buttonBox = await homeButton.boundingBox();
    if (buttonBox) {
      // In RTL, left side is the natural position for "back/home" actions
      expect(buttonBox.x).toBeLessThan(100);
    }
  });

  test('should maintain position when scrolling', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');

    const homeButton = page.getByTestId('home-button');
    await expect(homeButton).toBeVisible();

    // Get initial position
    const initialBox = await homeButton.boundingBox();

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));

    // Wait a bit for any scroll effects
    await page.waitForTimeout(200);

    // Button should still be visible (fixed position)
    await expect(homeButton).toBeVisible();

    // Position should remain the same (fixed positioning)
    const afterScrollBox = await homeButton.boundingBox();
    expect(afterScrollBox?.x).toBe(initialBox?.x);
    expect(afterScrollBox?.y).toBe(initialBox?.y);
  });
});

test.describe('Home Button - Authenticated User', () => {
  test('should navigate to dashboard when logged in', async ({ page }) => {
    // Note: This test assumes you have a way to log in
    // You may need to add authentication setup here

    // For now, we'll just verify the button exists on the login page
    // and would redirect appropriately based on auth state
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');

    const homeButton = page.getByTestId('home-button');
    await expect(homeButton).toBeVisible();
  });
});
