import { test, expect } from '@playwright/test';

test.describe('Complete Signup Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  const testName = 'Test User';

  test('should complete full signup flow successfully', async ({ page }) => {
    // Step 1: Navigate to signup page
    await page.goto('http://localhost:3002/signup');
    await expect(page.locator('text=הצטרפ ל-bioGov')).toBeVisible();

    // Step 2: Fill in all form fields
    await page.fill('#name', testName);
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);

    // Step 3: Verify password validation shows success
    await expect(page.locator('text=לפחות 8 תווים').locator('..')).toContainText('✓');
    await expect(page.locator('text=כולל מספר או תו מיוחד').locator('..')).toContainText('✓');

    // Step 4: Check consent checkbox
    await page.check('#consent');
    const isChecked = await page.locator('#consent').isChecked();
    expect(isChecked).toBe(true);

    // Step 5: Submit the form
    await page.click('button[type="submit"]');

    // Step 6: Wait for redirect to onboarding page
    await page.waitForURL('**/onboarding', { timeout: 10000 });

    // Step 7: Verify we're on onboarding page
    await expect(page.locator('text=בחר את סוג העסק שלך')).toBeVisible();

    console.log('✅ Signup successful! User redirected to onboarding page.');
  });

  test('should show error if consent not given', async ({ page }) => {
    await page.goto('http://localhost:3002/signup');

    // Fill form but don't check consent
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test2@example.com');
    await page.fill('#password', 'TestPass123!');

    // Ensure consent is NOT checked
    const isChecked = await page.locator('#consent').isChecked();
    expect(isChecked).toBe(false);

    // Try to submit - button should be disabled
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();

    console.log('✅ Submit button correctly disabled when consent not given.');
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('http://localhost:3002/signup');

    // Fill name and email
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test3@example.com');

    // Try weak password
    await page.fill('#password', 'short');

    // Check password validation indicators
    const lengthCheck = page.locator('text=לפחות 8 תווים');
    const complexityCheck = page.locator('text=כולל מספר או תו מיוחד');

    await expect(lengthCheck).toBeVisible();
    await expect(complexityCheck).toBeVisible();

    // Submit button should be disabled with weak password
    await page.check('#consent');
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();

    console.log('✅ Password validation working correctly.');
  });
});

test.describe('Complete User Journey: Quiz → Results → Signup → Onboarding → Dashboard', () => {
  const testEmail = `journey-${Date.now()}@example.com`;

  test('should complete entire user journey', async ({ page }) => {
    // Step 1: Start with quiz
    await page.goto('http://localhost:3002/quiz');
    console.log('📝 Step 1: Quiz page loaded');

    // Answer quiz questions (simple path - exempt dealer)
    // Question 1: Business type
    await page.click('label:has-text("עוסק פטור")');
    await page.click('button:has-text("הבא")');
    await page.waitForTimeout(500);

    // Question 2: Annual turnover
    await page.click('label:has-text("מתחת ל-102,292 ₪")');
    await page.click('button:has-text("הבא")');
    await page.waitForTimeout(500);

    // Question 3: Business activity
    await page.click('label:has-text("ייעוץ והדרכה")');
    await page.click('button:has-text("הבא")');
    await page.waitForTimeout(500);

    // Question 4: Municipality
    await page.fill('input[type="text"]', 'תל אביב');
    await page.click('button:has-text("הבא")');
    await page.waitForTimeout(500);

    // Question 5: Employees
    await page.click('label:has-text("רק אני")');
    await page.click('button:has-text("סיים")');

    console.log('✅ Step 1: Quiz completed');

    // Step 2: Results page
    await page.waitForURL('**/results/**', { timeout: 10000 });
    console.log('📊 Step 2: Results page loaded');

    // Verify we're on results page and can see the CTA button
    await expect(page.locator('text=תוצאות הערכה')).toBeVisible();

    // Click the CTA button to go to signup
    await page.click('button:has-text("בנה לוח שנה אישי בחינם")');
    console.log('✅ Step 2: Clicked CTA to signup');

    // Step 3: Signup page with redirect
    await page.waitForURL('**/signup?redirect=onboarding', { timeout: 10000 });
    console.log('📝 Step 3: Signup page loaded with redirect parameter');

    // Fill signup form
    await page.fill('#name', 'Journey Test User');
    await page.fill('#email', testEmail);
    await page.fill('#password', 'JourneyTest123!');
    await page.check('#consent');
    await page.click('button[type="submit"]');
    console.log('✅ Step 3: Signup form submitted');

    // Step 4: Onboarding page
    await page.waitForURL('**/onboarding', { timeout: 10000 });
    console.log('🎯 Step 4: Onboarding page loaded');

    // Verify business type is pre-selected from quiz
    await expect(page.locator('text=בחר את סוג העסק שלך')).toBeVisible();

    // Step 1: Business type should be pre-selected as osek_patur
    const oseqPaturButton = page.locator('button:has-text("עוסק פטור")');
    await expect(oseqPaturButton).toHaveClass(/border-primary/);
    console.log('✅ Business type pre-selected from quiz result');

    await page.click('button:has-text("המשך")');
    await page.waitForTimeout(500);

    // Step 2: Select industry
    await page.click('button:has-text("ייעוץ וניהול")');
    await page.click('button:has-text("המשך")');
    await page.waitForTimeout(500);

    // Step 3: Fill additional details
    await page.fill('#city', 'תל אביב');
    await page.fill('#employees', '1');
    await page.click('button:has-text("סיים והתחל")');
    console.log('✅ Step 4: Onboarding completed');

    // Step 5: Dashboard with welcome message
    await page.waitForURL('**/dashboard?welcome=true', { timeout: 10000 });
    console.log('🎉 Step 5: Dashboard loaded with welcome message');

    // Verify welcome banner appears
    await expect(page.locator('text=הלוח שנה שלך מוכן!')).toBeVisible();
    console.log('✅ Welcome banner visible');

    // Verify dashboard content loaded
    await expect(page.locator('text=לוח בקרה')).toBeVisible();
    console.log('✅ Dashboard content loaded');

    console.log('\n🏆 COMPLETE USER JOURNEY TEST PASSED! 🏆\n');
  });
});
