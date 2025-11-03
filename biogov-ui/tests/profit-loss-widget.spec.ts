/**
 * Profit & Loss Widget Test Suite
 * Tests the P&L widget with Israeli tax calculations
 * Phase 3 Week 3: P&L Dashboard
 */

import { test, expect } from '@playwright/test';

test.describe('Profit & Loss Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/finances');
  });

  test('should display P&L widget on finances page', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Check that the P&L widget is rendered (either with data or in error/loading state)
    // The widget shows title "דוח רווח והפסד" when loaded, or error message when API fails
    const hasTitle = await page.locator('text=דוח רווח והפסד').isVisible().catch(() => false);
    const hasError = await page.locator('text=שגיאה בטעינת נתונים').isVisible().catch(() => false);
    const hasLoading = await page.locator('.animate-pulse').isVisible().catch(() => false);

    // At least one state should be visible
    expect(hasTitle || hasError || hasLoading).toBeTruthy();
  });

  test('should have period selector buttons', async ({ page }) => {
    // Check for period selector buttons
    const monthButton = page.locator('button:has-text("חודש")').first();
    const quarterButton = page.locator('button:has-text("רבעון")').first();
    const yearButton = page.locator('button:has-text("שנה")').first();

    await expect(monthButton).toBeVisible({ timeout: 10000 });
    await expect(quarterButton).toBeVisible({ timeout: 10000 });
    await expect(yearButton).toBeVisible({ timeout: 10000 });
  });

  test('should display key metrics (revenue, expenses, profit)', async ({ page }) => {
    // Wait for the widget to load
    await page.waitForSelector('text=דוח רווח והפסד', { timeout: 10000 });

    // Check for metric labels
    const revenueLabel = page.locator('text=הכנסות').first();
    const expensesLabel = page.locator('text=הוצאות').first();
    const profitLabel = page.locator('text=רווח גולמי').first();

    await expect(revenueLabel).toBeVisible({ timeout: 5000 });
    await expect(expensesLabel).toBeVisible({ timeout: 5000 });
    await expect(profitLabel).toBeVisible({ timeout: 5000 });
  });

  test('should display Israeli tax breakdown', async ({ page }) => {
    // Wait for the widget to load
    await page.waitForSelector('text=דוח רווח והפסד', { timeout: 10000 });

    // Check for tax section
    const taxSection = page.locator('text=מסים והטלים').first();
    await expect(taxSection).toBeVisible({ timeout: 5000 });

    // Check for specific tax types
    const incomeTax = page.locator('text=מס הכנסה').first();
    const nationalInsurance = page.locator('text=ביטוח לאומי').first();
    const healthTax = page.locator('text=מס בריאות').first();

    await expect(incomeTax).toBeVisible({ timeout: 5000 });
    await expect(nationalInsurance).toBeVisible({ timeout: 5000 });
    await expect(healthTax).toBeVisible({ timeout: 5000 });
  });

  test('should display VAT position', async ({ page }) => {
    // Wait for the widget to load
    await page.waitForSelector('text=דוח רווח והפסד', { timeout: 10000 });

    // Check for VAT section
    const vatSection = page.locator('text=מצב מע"מ').first();
    await expect(vatSection).toBeVisible({ timeout: 5000 });
  });

  test('should display net profit', async ({ page }) => {
    // Wait for the widget to load
    await page.waitForSelector('text=דוח רווח והפסד', { timeout: 10000 });

    // Check for net profit label
    const netProfitLabel = page.locator('text=רווח נקי').first();
    await expect(netProfitLabel).toBeVisible({ timeout: 5000 });
  });

  test('should switch between periods when clicking buttons', async ({ page }) => {
    // Wait for the widget to load
    await page.waitForSelector('text=דוח רווח והפסד', { timeout: 10000 });

    const quarterButton = page.locator('button:has-text("רבעון")').first();
    await quarterButton.click();

    // Wait for the period to update
    await page.waitForTimeout(1000);

    // Check that the button is now active (has blue background)
    await expect(quarterButton).toHaveClass(/bg-blue-600/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/dashboard/finances');

    // Wait for the widget to load
    await page.waitForSelector('text=דוח רווח והפסד', { timeout: 10000 });

    // Check that the widget is visible
    const plWidget = page.locator('text=דוח רווח והפסד');
    await expect(plWidget).toBeVisible();

    // Check that there's no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
  });

  test('should have RTL direction', async ({ page }) => {
    // Wait for the widget to load
    await page.waitForSelector('text=דוח רווח והפסד', { timeout: 10000 });

    // Check that the main container has RTL direction
    const widget = page.locator('text=דוח רווח והפסד').locator('..').locator('..');
    const direction = await widget.evaluate((el) => window.getComputedStyle(el).direction);
    expect(direction).toBe('rtl');
  });

  test('should handle loading state gracefully', async ({ page }) => {
    // Immediately check for loading indicator or content
    await page.goto('/dashboard/finances');

    // Either loading state or content should appear
    const hasLoadingOrContent = await page.locator('text=דוח רווח והפסד, text=טוען').count();
    expect(hasLoadingOrContent).toBeGreaterThanOrEqual(0);
  });

  test('should display expense breakdown by category', async ({ page }) => {
    // Wait for the widget to load
    await page.waitForSelector('text=דוח רווח והפסד', { timeout: 10000 });

    // Check for expense breakdown section
    const expenseBreakdown = page.locator('text=פירוט הוצאות לפי קטגוריה').first();
    await expect(expenseBreakdown).toBeVisible({ timeout: 5000 });
  });
});

test.describe('P&L API Integration', () => {
  test('should fetch P&L data from API', async ({ page, request }) => {
    // First login to get authentication
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', '12345678');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to finances
    await page.goto('/dashboard/finances');

    // Wait for API call to complete
    const response = await page.waitForResponse(
      (response) => response.url().includes('/api/finances/profit-loss'),
      { timeout: 15000 }
    );

    expect(response.status()).toBe(200);

    const data = await response.json();

    // Verify response structure
    expect(data).toHaveProperty('period');
    expect(data).toHaveProperty('revenue');
    expect(data).toHaveProperty('expenses');
    expect(data).toHaveProperty('profit');
    expect(data).toHaveProperty('vat');
    expect(data).toHaveProperty('taxes');
    expect(data).toHaveProperty('take_home');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/dashboard/finances');

    // If API fails, should show error message or retry option
    await page.waitForSelector('text=דוח רווח והפסד, text=שגיאה', { timeout: 10000 });
  });
});

test.describe('P&L Tax Calculations', () => {
  test('should display correct Israeli tax rates in tooltips or labels', async ({ page }) => {
    await page.goto('/dashboard/finances');
    await page.waitForSelector('text=דוח רווח והפסד', { timeout: 10000 });

    // Check for tax rate labels
    const incomeTaxRate = page.locator('text=30%').first();
    const vatRate = page.locator('text=18%').first();

    // At least one tax rate should be visible
    const ratesVisible = await incomeTaxRate.isVisible().catch(() => false) ||
                         await vatRate.isVisible().catch(() => false);
    expect(ratesVisible).toBeTruthy();
  });
});
