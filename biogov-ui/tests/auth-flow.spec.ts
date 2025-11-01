import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('http://localhost:3000');
  });

  test('should display login page correctly in Hebrew RTL', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Check RTL direction
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(html).toHaveAttribute('lang', 'he');

    // Check Hebrew text elements
    await expect(page.getByText('ברוכים הבאים ל-bioGov')).toBeVisible();
    await expect(page.getByText('התחבר כדי לנהל את הציות העסקי שלך')).toBeVisible();
    await expect(page.getByLabel('כתובת אימייל')).toBeVisible();
    await expect(page.getByLabel('סיסמה')).toBeVisible();
    await expect(page.getByRole('button', { name: 'התחבר' })).toBeVisible();
    await expect(page.getByText('שכחת סיסמה?')).toBeVisible();
    await expect(page.getByText('הרשם עכשיו')).toBeVisible();
  });

  test('should display signup page correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');

    // Check Hebrew text elements
    await expect(page.getByText('הצטרף ל-bioGov')).toBeVisible();
    await expect(page.getByLabel('שם מלא')).toBeVisible();
    await expect(page.getByLabel('כתובת אימייל')).toBeVisible();
    await expect(page.getByLabel('סיסמה')).toBeVisible();
    await expect(page.getByText('לפחות 8 תווים')).toBeVisible();
  });

  test('should show password validation on signup', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');

    const passwordInput = page.getByLabel('סיסמה');

    // Type weak password
    await passwordInput.fill('weak');
    await expect(page.getByText('לפחות 8 תווים')).toBeVisible();

    // Check that password requirement shows
    const lengthCheck = page.locator('text=לפחות 8 תווים').locator('..');
    await expect(lengthCheck).toBeVisible();

    // Type strong password
    await passwordInput.fill('strong123!');

    // Both requirements should be met (green checkmarks)
    await expect(page.locator('text=לפחות 8 תווים').locator('..').locator('svg').first()).toBeVisible();
  });

  test('should require consent checkbox on signup', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');

    // Fill form without consent
    await page.getByLabel('שם מלא').fill('Test User');
    await page.getByLabel('כתובת אימייל').fill('test@example.com');
    await page.getByLabel('סיסמה').fill('password123!');

    // Submit button should be disabled without consent
    const submitButton = page.getByRole('button', { name: 'הרשם' });
    await expect(submitButton).toBeDisabled();

    // Check consent checkbox
    await page.getByLabel(/אני מסכים/).check();

    // Submit button should be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Click signup link
    await page.getByText('הרשם עכשיו').click();
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.getByText('הצטרף ל-bioGov')).toBeVisible();

    // Click login link
    await page.getByText('התחבר').first().click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText('ברוכים הבאים ל-bioGov')).toBeVisible();
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Fill invalid credentials
    await page.getByLabel('כתובת אימייל').fill('invalid@example.com');
    await page.getByLabel('סיסמה').fill('wrongpassword');

    // Submit form
    await page.getByRole('button', { name: 'התחבר' }).click();

    // Wait for error message
    await page.waitForSelector('text=/שגיאה|Invalid/i', { timeout: 5000 });
  });
});
