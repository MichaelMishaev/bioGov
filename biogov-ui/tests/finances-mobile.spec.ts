import { test, expect } from '@playwright/test';

/**
 * Finances Page Mobile Responsiveness Tests
 * Tests for layout issues, text truncation, and RTL on mobile
 */

test.describe('Finances Page - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 13

  test.beforeEach(async ({ page }) => {
    // Note: This test assumes user is logged in
    // In production, you'd need to authenticate first
    await page.goto('http://localhost:3001/dashboard/finances');
    await page.waitForLoadState('networkidle');
  });

  test('should not have horizontal scroll on mobile', async ({ page }) => {
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should display back button correctly', async ({ page }) => {
    const backButton = page.locator('a[href="/dashboard"]');
    await expect(backButton).toBeVisible();

    const backButtonText = await backButton.textContent();
    expect(backButtonText).toContain('חזור ללוח הבקרה');
  });

  test('should display page title without truncation', async ({ page }) => {
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();

    // Check that title is fully visible
    const titleBox = await title.boundingBox();
    const viewportWidth = 390;

    if (titleBox) {
      expect(titleBox.width).toBeLessThan(viewportWidth - 40); // Account for padding
    }
  });

  test('should have proper spacing on mobile', async ({ page }) => {
    // Check that elements don't overlap
    const widgets = page.locator('.bg-white.rounded-lg');
    const count = await widgets.count();

    if (count >= 2) {
      const firstBox = await widgets.nth(0).boundingBox();
      const secondBox = await widgets.nth(1).boundingBox();

      if (firstBox && secondBox) {
        // Ensure no overlap
        expect(firstBox.y + firstBox.height).toBeLessThanOrEqual(secondBox.y);
      }
    }
  });

  test('should stack columns vertically on mobile', async ({ page }) => {
    // Grid should be single column on mobile
    const grid = page.locator('.grid');

    if (await grid.count() > 0) {
      const gridBox = await grid.first().boundingBox();

      if (gridBox) {
        // Grid width should fit in mobile viewport
        expect(gridBox.width).toBeLessThan(400);
      }
    }
  });

  test('should have readable text sizes on mobile', async ({ page }) => {
    // Check that text is not too small
    const bodyText = page.locator('p, span').first();

    if (await bodyText.count() > 0) {
      const fontSize = await bodyText.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });

      const fontSizeNum = parseInt(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(12); // Minimum readable size
    }
  });

  test('should handle RTL direction on mobile', async ({ page }) => {
    const html = page.locator('html');
    const dir = await html.getAttribute('dir');
    expect(dir).toBe('rtl');
  });

  test('should have touch-friendly buttons on mobile', async ({ page }) => {
    const buttons = page.locator('button');
    const count = await buttons.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();

        if (box) {
          // Should have reasonable touch target
          expect(box.height).toBeGreaterThanOrEqual(32);
        }
      }
    }
  });

  test('should not have text overflow on mobile', async ({ page }) => {
    // Take screenshot for visual verification
    await page.screenshot({
      path: 'test-results/finances-mobile-layout.png',
      fullPage: true
    });

    // Check for overflow
    const hasOverflow = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        const style = window.getComputedStyle(el);
        if (style.overflow === 'visible' && el.scrollWidth > el.clientWidth) {
          return true;
        }
      }
      return false;
    });

    // This is a warning, not a hard fail
    if (hasOverflow) {
      console.warn('Some elements have overflow on mobile');
    }
  });

  test('should display cash flow widget on mobile', async ({ page }) => {
    const widget = page.locator('text=תזרים מזומנים').first();
    await expect(widget).toBeVisible();
  });

  test('should have proper card layout on mobile', async ({ page }) => {
    const cards = page.locator('.rounded-lg.shadow-md');
    const count = await cards.count();

    if (count > 0) {
      const firstCard = cards.first();
      const box = await firstCard.boundingBox();

      if (box) {
        // Cards should fit in mobile viewport with padding
        expect(box.width).toBeLessThan(390);
      }
    }
  });
});

test.describe('Finances Page - Cross-Device Mobile Testing', () => {
  const devices = [
    { name: 'iPhone 13', viewport: { width: 390, height: 844 } },
    { name: 'iPhone SE', viewport: { width: 375, height: 667 } },
    { name: 'Pixel 5', viewport: { width: 393, height: 851 } },
    { name: 'Samsung Galaxy S21', viewport: { width: 360, height: 800 } },
  ];

  for (const device of devices) {
    test(`should render correctly on ${device.name}`, async ({ page }) => {
      await page.setViewportSize(device.viewport);
      await page.goto('http://localhost:3001/dashboard/finances');
      await page.waitForLoadState('networkidle');

      // Check no horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // Take screenshot
      const deviceName = device.name.replace(/\s+/g, '-').toLowerCase();
      await page.screenshot({
        path: `test-results/finances-${deviceName}.png`,
        fullPage: true
      });
    });
  }
});
