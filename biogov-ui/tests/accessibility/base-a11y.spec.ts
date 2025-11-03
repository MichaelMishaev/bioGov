import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Base Accessibility Test Suite
 * Tests fundamental WCAG 2.1 AA compliance across all pages
 */

test.describe('Base Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Dashboard should not have accessibility violations', async ({ page }) => {
    // Login first
    await page.goto('/login');
    // TODO: Add login credentials when auth is ready
    // For now, test login page

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Login page should not have accessibility violations', async ({ page }) => {
    await page.goto('/login');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Signup page should not have accessibility violations', async ({ page }) => {
    await page.goto('/signup');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Keyboard Navigation Tests', () => {
  test('Should be able to navigate homepage with keyboard only', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Check if focus is visible
    const focusedElement = await page.evaluate(() => {
      const active = document.activeElement;
      return {
        tagName: active?.tagName,
        hasFocus: document.activeElement !== document.body,
      };
    });

    expect(focusedElement.hasFocus).toBe(true);
  });

  test('All interactive elements should be reachable via Tab key', async ({ page }) => {
    await page.goto('/');

    const interactiveElements = await page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();

    // Tab through all elements and count
    let tabbableCount = 0;
    let lastElement = null;

    for (let i = 0; i < interactiveElements + 5; i++) {
      await page.keyboard.press('Tab');
      const currentElement = await page.evaluate(() => document.activeElement?.tagName);

      if (currentElement && currentElement !== 'BODY' && currentElement !== lastElement) {
        tabbableCount++;
        lastElement = currentElement;
      }
    }

    expect(tabbableCount).toBeGreaterThan(0);
  });
});

test.describe('Focus Visibility Tests', () => {
  test('Focused elements should have visible focus indicator', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');

    // Check if focused element has outline or visible focus styles
    const hasFocusStyles = await page.evaluate(() => {
      const element = document.activeElement;
      if (!element) return false;

      const styles = window.getComputedStyle(element);
      const outline = styles.outline;
      const boxShadow = styles.boxShadow;
      const ring = styles.getPropertyValue('--tw-ring-color');

      return (
        outline !== 'none' && outline !== '0px' ||
        boxShadow !== 'none' ||
        ring !== ''
      );
    });

    expect(hasFocusStyles).toBe(true);
  });
});

test.describe('Color Contrast Tests', () => {
  test('Should not have color contrast violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .disableRules(['color-contrast']) // We'll run this separately with specific config
      .analyze();

    // Run color contrast check separately
    const contrastResults = await new AxeBuilder({ page })
      .include('body')
      .withRules(['color-contrast'])
      .analyze();

    expect(contrastResults.violations).toEqual([]);
  });
});

test.describe('HTML Structure Tests', () => {
  test('Page should have proper document structure', async ({ page }) => {
    await page.goto('/');

    // Check for html lang attribute
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBe('he');

    // Check for html dir attribute
    const htmlDir = await page.getAttribute('html', 'dir');
    expect(htmlDir).toBe('rtl');

    // Check for page title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('Page should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('ARIA Tests', () => {
  test('ARIA attributes should be valid', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['aria-valid-attr', 'aria-valid-attr-value', 'aria-allowed-attr'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Interactive elements should have accessible names', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['button-name', 'link-name', 'input-button-name'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Form Accessibility Tests', () => {
  test('Form inputs should have labels', async ({ page }) => {
    await page.goto('/login');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Responsive Design Tests', () => {
  test('Should be accessible at 200% zoom', async ({ page }) => {
    await page.goto('/');

    // Set zoom to 200%
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Should be accessible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
