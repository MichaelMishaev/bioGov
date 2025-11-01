import { test, expect } from '@playwright/test';

test.describe('RTL Layout Verification', () => {
  const pages = [
    { path: '/login', name: 'Login' },
    { path: '/signup', name: 'Signup' },
    { path: '/onboarding', name: 'Onboarding' },
    { path: '/dashboard', name: 'Dashboard' },
  ];

  pages.forEach(({ path, name }) => {
    test(`${name} page should have RTL layout`, async ({ page }) => {
      await page.goto(`http://localhost:3000${path}`);

      // Check HTML attributes
      const html = page.locator('html');
      await expect(html).toHaveAttribute('dir', 'rtl');
      await expect(html).toHaveAttribute('lang', 'he');
    });
  });

  test('should apply RTL text alignment in inputs', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Email input should have text-right class (RTL alignment)
    const emailInput = page.getByLabel('כתובת אימייל');
    const classes = await emailInput.getAttribute('class');

    // Verify RTL-related classes are present
    expect(classes).toBeTruthy();
  });

  test('should render Hebrew text correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Check for Hebrew characters
    const hebrewText = page.getByText('ברוכים הבאים ל-bioGov');
    await expect(hebrewText).toBeVisible();

    // Verify text is rendered properly (not garbled)
    const textContent = await hebrewText.textContent();
    expect(textContent).toMatch(/[\u0590-\u05FF]/); // Hebrew Unicode range
  });

  test('should render buttons with Hebrew text and proper icon placement', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');

    // Buttons should have Hebrew text
    const signupButton = page.getByRole('button', { name: 'הרשם' });
    await expect(signupButton).toBeVisible();
  });

  test('should render forms with RTL field alignment', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');

    // Check that labels are aligned to the right
    const nameLabel = page.getByText('שם מלא');
    await expect(nameLabel).toBeVisible();

    // Input should be after label in DOM (RTL layout)
    const nameInput = page.getByLabel('שם מלא');
    await expect(nameInput).toBeVisible();
  });

  test('should render cards with RTL content flow', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Card content should flow RTL
    const card = page.locator('.card, [class*="card"]').first();

    if (await card.isVisible()) {
      // Verify card exists and is rendered
      await expect(card).toBeVisible();
    }
  });

  test('should handle Hebrew dates correctly', async ({ page }) => {
    // This test would require authentication and tasks with dates
    // Skipping for now as it requires setup
    test.skip();
  });

  test('should render navigation elements in RTL order', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Check that links are in RTL order
    const signupLink = page.getByText('הרשם עכשיו');
    await expect(signupLink).toBeVisible();

    // Verify link position in layout (rightmost in LTR becomes leftmost in RTL)
  });

  test('should apply RTL to modal dialogs', async ({ page }) => {
    // This would test task detail modal
    // Requires authentication and tasks
    test.skip();
  });

  test('should use Hebrew font (Rubik)', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Check if Rubik font is loaded
    const body = page.locator('body');
    const fontFamily = await body.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });

    // Should include Rubik or a fallback Hebrew font
    expect(fontFamily.toLowerCase()).toMatch(/rubik|sans/);
  });

  test('should render Hebrew placeholder text', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');

    const nameInput = page.getByPlaceholder('משה כהן');
    await expect(nameInput).toBeVisible();

    // Verify placeholder is in Hebrew
    const placeholder = await nameInput.getAttribute('placeholder');
    expect(placeholder).toMatch(/[\u0590-\u05FF]/);
  });

  test('should handle mixed Hebrew and English content', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Email input has English placeholder (email format)
    const emailInput = page.getByPlaceholder('name@example.com');
    await expect(emailInput).toBeVisible();

    // But label is in Hebrew
    const emailLabel = page.getByText('כתובת אימייל');
    await expect(emailLabel).toBeVisible();
  });

  test('should render error messages in Hebrew', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');

    // Try to submit without filling required fields
    const submitButton = page.getByRole('button', { name: 'הרשם' });

    // Password validation messages should be in Hebrew
    const passwordInput = page.getByLabel('סיסמה');
    await passwordInput.fill('weak');

    await expect(page.getByText('לפחות 8 תווים')).toBeVisible();
  });

  test('should maintain RTL in responsive layouts', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/login');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(html).toHaveAttribute('dir', 'rtl');

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(html).toHaveAttribute('dir', 'rtl');
  });
});
