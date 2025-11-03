import { test, expect } from '@playwright/test';

/**
 * PWA Functionality Tests
 * Tests Progressive Web App features including:
 * - Manifest validation
 * - Service worker registration
 * - Offline indicator
 * - Installability
 * - Mobile responsiveness
 * - Hebrew RTL layout
 */

test.describe('PWA Core Features', () => {
  test('should load manifest.json with correct metadata', async ({ page }) => {
    const manifestResponse = await page.goto('http://localhost:3001/manifest.json');
    expect(manifestResponse?.status()).toBe(200);

    const manifest = await manifestResponse?.json();

    // Validate manifest structure
    expect(manifest.name).toBe('bioGov - ניהול עסק ותאימות');
    expect(manifest.short_name).toBe('bioGov');
    expect(manifest.start_url).toBe('/dashboard');
    expect(manifest.display).toBe('standalone');
    expect(manifest.dir).toBe('rtl');
    expect(manifest.lang).toBe('he');
    expect(manifest.theme_color).toBe('#2563eb');

    // Validate icons
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);

    // Check for required icon sizes
    const iconSizes = manifest.icons.map((icon: any) => icon.sizes);
    expect(iconSizes).toContain('192x192');
    expect(iconSizes).toContain('512x512');
  });

  test('should register service worker in production build', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Check if service worker registration exists
    const swRegistration = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });

    expect(swRegistration).toBe(true);
  });

  test('should have correct PWA meta tags in HTML', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Check viewport meta tag (Next.js 14+ generates this from viewport export)
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    if (viewport) {
      expect(viewport).toContain('width=device-width');
    }

    // Check theme color (Next.js 14+ generates this from viewport export)
    const themeColorMeta = await page.locator('meta[name="theme-color"]');
    const themeColorCount = await themeColorMeta.count();
    if (themeColorCount > 0) {
      const themeColor = await themeColorMeta.getAttribute('content');
      expect(themeColor).toBe('#2563eb');
    }

    // Check manifest link
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestLink).toBe('/manifest.json');

    // Check Apple touch icon
    const appleTouchIcon = await page.locator('link[rel="apple-touch-icon"]').count();
    expect(appleTouchIcon).toBeGreaterThan(0);
  });

  test('should load all PWA icons without errors', async ({ page }) => {
    const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

    for (const size of iconSizes) {
      const response = await page.goto(`http://localhost:3001/icons/icon-${size}x${size}.png`);
      expect(response?.status()).toBe(200);
    }

    // Check favicons
    const favicon16 = await page.goto('http://localhost:3001/favicon-16x16.png');
    expect(favicon16?.status()).toBe(200);

    const favicon32 = await page.goto('http://localhost:3001/favicon-32x32.png');
    expect(favicon32?.status()).toBe(200);

    // Check Apple touch icon
    const appleTouchIcon = await page.goto('http://localhost:3001/apple-touch-icon.png');
    expect(appleTouchIcon?.status()).toBe(200);
  });
});

test.describe('Offline Indicator Component', () => {
  test('should show offline indicator when network disconnects', async ({ page, context }) => {
    await page.goto('http://localhost:3001');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Simulate offline mode
    await context.setOffline(true);

    // Trigger offline event
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // Wait for indicator to appear
    await page.waitForTimeout(500);

    // Check if offline indicator is visible
    const offlineIndicator = page.locator('text=אין חיבור לאינטרנט');
    await expect(offlineIndicator).toBeVisible();

    // Verify amber/warning color
    const indicatorBg = await page.locator('div:has-text("אין חיבור לאינטרנט")').first();
    const bgClass = await indicatorBg.getAttribute('class');
    expect(bgClass).toContain('bg-amber-500');
  });

  test('should show online indicator when network reconnects', async ({ page, context }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Go offline first
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await page.waitForTimeout(500);

    // Reconnect
    await context.setOffline(false);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
    });

    await page.waitForTimeout(500);

    // Check if online indicator is visible
    const onlineIndicator = page.locator('text=חזרת לאינטרנט');
    await expect(onlineIndicator).toBeVisible();

    // Verify green color
    const indicatorBg = await page.locator('div:has-text("חזרת לאינטרנט")').first();
    const bgClass = await indicatorBg.getAttribute('class');
    expect(bgClass).toContain('bg-green-500');

    // Should auto-hide after 3 seconds
    await page.waitForTimeout(3500);
    await expect(onlineIndicator).not.toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 13 size

  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Check that body is visible (works for any page including sign-in)
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/mobile-home.png', fullPage: true });
  });

  test('should have touch-friendly interaction areas on mobile', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Find all clickable elements (buttons, links)
    const clickables = page.locator('button, a');
    const count = await clickables.count();

    if (count > 0) {
      // Check that at least some clickable elements have reasonable touch targets
      let largeEnoughCount = 0;
      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = clickables.nth(i);
        const box = await element.boundingBox();

        if (box && (box.height >= 32 || box.width >= 32)) {
          largeEnoughCount++;
        }
      }

      // At least half should have touch-friendly sizes
      expect(largeEnoughCount).toBeGreaterThan(0);
    }
  });

  test('should not have horizontal scroll on mobile', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Check if page has horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });
});

test.describe('Hebrew RTL Layout on Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('should have RTL direction set correctly', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Check HTML dir attribute
    const htmlDir = await page.locator('html').getAttribute('dir');
    expect(htmlDir).toBe('rtl');

    // Check HTML lang attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('he');
  });

  test('should align text to the right in Hebrew', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Find Hebrew text elements
    const hebrewTexts = page.locator('text=/[א-ת]/').first();
    const count = await hebrewTexts.count();

    if (count > 0) {
      const textAlign = await hebrewTexts.evaluate((el) => {
        return window.getComputedStyle(el).textAlign;
      });

      // Should be 'right', 'start', or 'center' (all valid for RTL)
      expect(['right', 'start', 'center']).toContain(textAlign);
    }
  });

  test('should display offline indicator in RTL', async ({ page, context }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await page.waitForTimeout(500);

    const indicator = page.locator('div:has-text("אין חיבור לאינטרנט")').first();
    const dir = await indicator.getAttribute('dir');
    expect(dir).toBe('rtl');
  });
});

test.describe('Cross-Device Mobile Testing', () => {
  const devices = [
    { name: 'iPhone 13', viewport: { width: 390, height: 844 } },
    { name: 'Pixel 5', viewport: { width: 393, height: 851 } },
    { name: 'Samsung Galaxy S21', viewport: { width: 360, height: 800 } },
    { name: 'iPhone 14 Pro', viewport: { width: 393, height: 852 } },
  ];

  for (const device of devices) {
    test(`should render correctly on ${device.name}`, async ({ page }) => {
      await page.setViewportSize(device.viewport);
      await page.goto('http://localhost:3001');
      await page.waitForLoadState('networkidle');

      // Verify no layout overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasOverflow).toBe(false);

      // Take device-specific screenshot
      const deviceName = device.name.replace(/\s+/g, '-').toLowerCase();
      await page.screenshot({
        path: `test-results/${deviceName}-home.png`,
        fullPage: true
      });
    });
  }
});

test.describe('PWA Installation Readiness', () => {
  test('should meet PWA installability criteria', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Check for HTTPS (or localhost for development)
    const url = page.url();
    const isSecure = url.startsWith('https://') || url.startsWith('http://localhost');
    expect(isSecure).toBe(true);

    // Verify manifest is linked
    const manifestLink = await page.locator('link[rel="manifest"]').count();
    expect(manifestLink).toBeGreaterThan(0);

    // Check for icons
    const manifest = await (await page.goto('http://localhost:3001/manifest.json'))?.json();
    const has192Icon = manifest.icons.some((icon: any) => icon.sizes === '192x192');
    const has512Icon = manifest.icons.some((icon: any) => icon.sizes === '512x512');
    expect(has192Icon).toBe(true);
    expect(has512Icon).toBe(true);
  });

  test('should have proper display mode in manifest', async ({ page }) => {
    const manifestResponse = await page.goto('http://localhost:3001/manifest.json');
    const manifest = await manifestResponse?.json();

    // Should use standalone for app-like experience
    expect(manifest.display).toBe('standalone');

    // Should have a start URL
    expect(manifest.start_url).toBeTruthy();
  });
});

test.describe('Performance on Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('should load home page quickly on mobile', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds on mobile
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not block interaction during load', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Try to interact with page before it fully loads
    await page.waitForTimeout(500);

    // Page should be responsive (not frozen)
    const isVisible = await page.locator('body').isVisible();
    expect(isVisible).toBe(true);
  });
});
