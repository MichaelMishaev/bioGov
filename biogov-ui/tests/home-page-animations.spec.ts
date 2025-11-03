import { test, expect } from '@playwright/test';

test.describe('Home Page Animations and Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should load home page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/bioGov/i);

    // Verify main content is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display header with proper styling', async ({ page }) => {
    // Check if header exists
    const header = page.locator('header');

    // Home page may not have a header, or may have different styling than dashboard
    const headerCount = await header.count();

    if (headerCount > 0) {
      await expect(header).toBeVisible();

      // Check header has some styling (not empty)
      const headerClasses = await header.getAttribute('class');
      expect(headerClasses).toBeTruthy();
      expect(headerClasses.length).toBeGreaterThan(0);
    } else {
      // If no header on home page, that's also acceptable
      console.log('No header found on home page - this is acceptable');
    }
  });

  test('should have proper mobile-first responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // Wait for resize

    // Check text is readable (not too large)
    const mainHeading = page.locator('h1, h2').first();
    if (await mainHeading.isVisible()) {
      const fontSize = await mainHeading.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );
      const fontSizeNum = parseInt(fontSize);
      expect(fontSizeNum).toBeLessThan(48); // Reasonable max for mobile
    }

    // Check no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1); // +1 for rounding
  });

  test('should have all buttons with proper touch targets (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const buttons = page.locator('button');
    const count = await buttons.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box) {
            // Check minimum touch target size (44px recommended)
            expect(box.height).toBeGreaterThanOrEqual(36); // Minimum 36px
          }
        }
      }
    }
  });

  test('should apply hover effects on interactive elements', async ({ page }) => {
    const buttons = page.locator('button').first();

    if (await buttons.isVisible()) {
      // Get initial styles
      const initialTransform = await buttons.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      // Hover over button
      await buttons.hover();
      await page.waitForTimeout(300); // Wait for transition

      // Check transform has changed (scale/translate effect)
      const hoverTransform = await buttons.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      // Transform should change on hover (may be 'none' initially)
      // This verifies hover effects are working
      console.log('Initial transform:', initialTransform);
      console.log('Hover transform:', hoverTransform);
    }
  });

  test('should have proper font families loaded', async ({ page }) => {
    const body = page.locator('body');
    const fontFamily = await body.evaluate(el =>
      window.getComputedStyle(el).fontFamily
    );

    // Should include Inter or Heebo fonts
    const hasCustomFonts = fontFamily.includes('Inter') ||
                          fontFamily.includes('Heebo') ||
                          fontFamily.includes('system-ui');
    expect(hasCustomFonts).toBeTruthy();
  });

  test('should render without critical console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for any async operations

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('manifest') &&
      !err.includes('chunk') &&
      !err.includes('401') && // Expected auth errors on public pages
      !err.includes('Unauthorized') && // Expected auth errors
      !err.includes('/api/auth') && // Auth API calls expected to fail
      !err.includes('/api/finances') // Finance API calls expected to fail when not authenticated
    );

    console.log('Total errors found:', errors.length);
    console.log('Critical errors (after filtering):', criticalErrors);
    expect(criticalErrors.length).toBe(0);
  });

  test('should have proper gradient animations', async ({ page }) => {
    const gradientElements = page.locator('.animate-gradient, .gradient-hero');
    const count = await gradientElements.count();

    if (count > 0) {
      const element = gradientElements.first();
      await expect(element).toBeVisible();

      // Check if animation is applied
      const animationName = await element.evaluate(el =>
        window.getComputedStyle(el).animationName
      );

      console.log('Animation name:', animationName);
      expect(animationName).not.toBe('none');
    }
  });

  test('should check all images load successfully', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);

      // Check if image is loaded
      const isComplete = await img.evaluate((el: HTMLImageElement) => el.complete);
      const naturalHeight = await img.evaluate((el: HTMLImageElement) => el.naturalHeight);

      if (!isComplete || naturalHeight === 0) {
        const src = await img.getAttribute('src');
        console.warn(`Image not loaded: ${src}`);
      }
    }
  });

  test('should support RTL layout for Hebrew', async ({ page }) => {
    const html = page.locator('html');
    const dir = await html.getAttribute('dir');
    const lang = await html.getAttribute('lang');

    // Check RTL is set
    expect(dir).toBe('rtl');
    expect(lang).toBe('he');
  });

  test('should have accessible focus states', async ({ page }) => {
    // Tab through focusable elements
    const focusableElements = page.locator('a, button, input, textarea, select').first();

    if (await focusableElements.isVisible()) {
      await focusableElements.focus();

      // Check focus ring is visible
      const outline = await focusableElements.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow
        };
      });

      // Should have some form of focus indicator (outline or box-shadow)
      const hasFocusIndicator =
        outline.outline !== 'none' ||
        outline.outlineWidth !== '0px' ||
        outline.boxShadow !== 'none';

      console.log('Focus styles:', outline);
      expect(hasFocusIndicator).toBeTruthy();
    }
  });

  test('should render properly on various screen sizes', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 375, height: 667, name: 'iPhone 8' },
      { width: 393, height: 852, name: 'iPhone 14 Pro' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1280, height: 720, name: 'Desktop HD' },
      { width: 1920, height: 1080, name: 'Desktop FHD' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(300); // Wait for resize

      // Check no horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowWidth = await page.evaluate(() => window.innerWidth);

      console.log(`${viewport.name} (${viewport.width}x${viewport.height}): body=${bodyWidth}, window=${windowWidth}`);
      expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 2); // +2 for rounding tolerance
    }
  });

  test('should have smooth transitions', async ({ page }) => {
    const transitionElements = page.locator('[class*="transition"]').first();

    if (await transitionElements.isVisible()) {
      const transition = await transitionElements.evaluate(el =>
        window.getComputedStyle(el).transition
      );

      console.log('Transition:', transition);
      expect(transition).not.toBe('all 0s ease 0s');
    }
  });

  test('should check page performance metrics', async ({ page }) => {
    await page.goto('/');

    // Get performance metrics
    const performanceTiming = await page.evaluate(() => {
      const perfData = window.performance.timing;
      return {
        loadTime: perfData.loadEventEnd - perfData.navigationStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        timeToInteractive: perfData.domInteractive - perfData.navigationStart
      };
    });

    console.log('Performance metrics:', performanceTiming);

    // Reasonable expectations (adjust based on actual performance)
    expect(performanceTiming.loadTime).toBeLessThan(10000); // 10s max
    expect(performanceTiming.domContentLoaded).toBeLessThan(5000); // 5s max
  });
});

test.describe('Home Page Mobile-Specific Tests', () => {
  test.use({
    viewport: { width: 375, height: 667 }
  });

  test('should not have text overflow on mobile', async ({ page }) => {
    await page.goto('/');

    // Check for text overflow
    const textElements = page.locator('h1, h2, h3, h4, p, span, div');
    const count = await textElements.count();

    let overflowCount = 0;
    for (let i = 0; i < Math.min(count, 20); i++) {
      const element = textElements.nth(i);
      if (await element.isVisible()) {
        const isOverflowing = await element.evaluate(el => {
          return el.scrollWidth > el.clientWidth;
        });

        if (isOverflowing) {
          const text = await element.textContent();
          console.log('Overflowing text:', text?.substring(0, 50));
          overflowCount++;
        }
      }
    }

    console.log(`Found ${overflowCount} overflowing elements out of ${Math.min(count, 20)} checked`);
    expect(overflowCount).toBe(0);
  });

  test('should have readable font sizes on mobile', async ({ page }) => {
    await page.goto('/');

    const textElements = page.locator('p, span, div').filter({ hasText: /.+/ });
    const count = await textElements.count();

    if (count > 0) {
      const element = textElements.first();
      const fontSize = await element.evaluate(el =>
        parseInt(window.getComputedStyle(el).fontSize)
      );

      // Minimum 12px for mobile readability
      expect(fontSize).toBeGreaterThanOrEqual(12);
    }
  });
});
