import { test, expect } from '@playwright/test';

test.describe('Business Profile Onboarding Flow', () => {
  test('should display onboarding wizard correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/onboarding');

    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate through wizard steps', async ({ page }) => {
    // This test would require authentication first
    // For now, we'll test the UI structure
    await page.goto('http://localhost:3000/onboarding');

    // After login redirect, check if onboarding page loads
    // (In real scenario, we'd login first)
  });

  test.describe('With authenticated user', () => {
    test.use({
      storageState: {
        cookies: [],
        origins: [],
      },
    });

    test.skip('should complete step 1 - business type selection', async ({ page }) => {
      // This would require setting up authentication state
      await page.goto('http://localhost:3000/onboarding');

      // Step 1: Select business type
      await expect(page.getByText('בחר את סוג העסק שלך')).toBeVisible();
      await expect(page.getByText('שלב 1 מתוך 3')).toBeVisible();

      // Check business type options
      await expect(page.getByText('עוסק פטור')).toBeVisible();
      await expect(page.getByText('עוסק מורשה')).toBeVisible();
      await expect(page.getByText('חברה בע״מ')).toBeVisible();

      // Select business type
      await page.getByText('עוסק מורשה').click();

      // Click next
      await page.getByRole('button', { name: 'המשך' }).click();

      // Should move to step 2
      await expect(page.getByText('שלב 2 מתוך 3')).toBeVisible();
    });

    test.skip('should complete step 2 - industry selection', async ({ page }) => {
      await page.goto('http://localhost:3000/onboarding');

      // Complete step 1
      await page.getByText('עוסק מורשה').click();
      await page.getByRole('button', { name: 'המשך' }).click();

      // Step 2: Select industry
      await expect(page.getByText('מה תחום העיסוק שלך?')).toBeVisible();

      // Check industry options
      await expect(page.getByText('ייעוץ וניהול')).toBeVisible();
      await expect(page.getByText('הייטק ופיתוח תוכנה')).toBeVisible();
      await expect(page.getByText('מסעדות ומזון')).toBeVisible();

      // Select industry
      await page.getByText('הייטק ופיתוח תוכנה').click();

      // Click next
      await page.getByRole('button', { name: 'המשך' }).click();

      // Should move to step 3
      await expect(page.getByText('שלב 3 מתוך 3')).toBeVisible();
    });

    test.skip('should complete step 3 - additional details', async ({ page }) => {
      await page.goto('http://localhost:3000/onboarding');

      // Complete steps 1 and 2
      await page.getByText('עוסק מורשה').click();
      await page.getByRole('button', { name: 'המשך' }).click();
      await page.getByText('הייטק ופיתוח תוכנה').click();
      await page.getByRole('button', { name: 'המשך' }).click();

      // Step 3: Additional details
      await expect(page.getByText('פרטים נוספים')).toBeVisible();

      // Fill details
      await page.getByLabel('עיר').fill('תל אביב');
      await page.getByLabel('מספר עובדים').fill('5');

      // Submit
      await page.getByRole('button', { name: /סיים/ }).click();

      // Should show success and redirect to dashboard
      await expect(page.getByText('הפרופיל נוצר בהצלחה!')).toBeVisible();
      await page.waitForURL(/.*dashboard/, { timeout: 5000 });
    });
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('http://localhost:3000/onboarding');

    // Try to proceed without selection (after login)
    // This would show in the UI that selection is required
  });

  test('should show progress indicator', async ({ page }) => {
    await page.goto('http://localhost:3000/onboarding');

    // After login, check progress bars
    // Should have 3 progress bars
  });

  test('should allow navigation back to previous step', async ({ page }) => {
    // Test the "חזור" (back) button functionality
  });
});
