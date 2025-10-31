import { test, expect } from '@playwright/test';

test.describe('bioGov VAT Assessment Flow', () => {
  test('Complete user journey: Landing → Quiz → Results → Feedback', async ({ page }) => {
    // Step 1: Landing Page
    await page.goto('/');

    // Verify landing page loaded
    await expect(page.getByText('דע את סטטוס המע"מ שלך ב-2 דקות')).toBeVisible();
    await expect(page.locator('header').getByText('bioGov')).toBeVisible();

    // Click Start Assessment button
    await page.getByRole('link', { name: /התחל בדיקה/i }).first().click();

    // Step 2: Quiz - Question 1 (Business Activity)
    await expect(page).toHaveURL(/\/quiz/);
    await expect(page.getByText('מה סוג הפעילות העסקית שלך?')).toBeVisible();

    // Check progress indicators
    await expect(page.getByText('1/5')).toBeVisible();

    // Select "Services" option
    await page.getByText('שירותים', { exact: false }).first().click();

    // Verify selection is highlighted
    await expect(page.locator('button', { hasText: 'שירותים' }).first()).toHaveClass(/border-\[#0f62fe\]/);

    // Click Next
    await page.getByRole('button', { name: /המשך/ }).click();

    // Step 3: Quiz - Question 2 (Revenue)
    await expect(page.getByText('2/5')).toBeVisible();
    await expect(page.getByText('מה המחזור השנתי הצפוי?')).toBeVisible();

    // Select "Less than ₪120,000"
    await page.getByText('פחות מ-₪120,000').click();
    await page.getByRole('button', { name: /המשך/ }).click();

    // Step 4: Quiz - Question 3 (Clients)
    await expect(page.getByText('3/5')).toBeVisible();
    await expect(page.getByText('מי הלקוחות העיקריים שלך?')).toBeVisible();

    // Select "Private clients"
    await page.getByText('לקוחות פרטיים').click();
    await page.getByRole('button', { name: /המשך/ }).click();

    // Step 5: Quiz - Question 4 (Employees)
    await expect(page.getByText('4/5')).toBeVisible();
    await expect(page.getByText('כמה עובדים יש לך?')).toBeVisible();

    // Select "No employees"
    await page.getByText('אין עובדים (רק אני)').click();
    await page.getByRole('button', { name: /המשך/ }).click();

    // Step 6: Quiz - Question 5 (Voluntary)
    await expect(page.getByText('5/5')).toBeVisible();
    await expect(page.getByText('מעוניין ברישום מרצון')).toBeVisible();

    // Select "Not interested"
    await page.getByText('לא מעוניין').click();

    // Click Finish button
    await page.getByRole('button', { name: /סיים ובדוק תוצאות/ }).click();

    // Step 7: Results Page
    // Wait for results to load
    await page.waitForURL(/\/results\/[a-f0-9-]+/);

    // Verify result badge (should be VAT-Exempt for < ₪120K)
    await expect(page.getByText('עוסק פטור ממע"מ')).toBeVisible();
    await expect(page.getByText('✅ התוצאה שלך:')).toBeVisible();

    // Verify checklist is displayed
    await expect(page.getByText('📋 מה אתה צריך לעשות:')).toBeVisible();
    await expect(page.getByText(/בדוק את המחזור השנתי שלך/)).toBeVisible();

    // Verify email signup section
    await expect(page.getByText('📧 שלח לי את התוצאות הללו')).toBeVisible();

    // Step 8: Test Email Signup Form
    await page.getByRole('button', { name: /שלח תוצאות למייל/ }).click();

    // Fill out email form
    await page.getByPlaceholder('יוסי כהן').fill('test-playwright@example.com');
    await page.getByPlaceholder('yossi@example.com').fill('test-playwright@example.com');

    // Check consent checkbox
    await page.getByRole('checkbox', { name: /אני מאשר/ }).check();

    // Submit email form
    await page.getByRole('button', { name: /שלח לי את התוצאות/ }).click();

    // Wait for success message
    await expect(page.getByText('התוצאות נשלחו בהצלחה!')).toBeVisible({ timeout: 10000 });

    // Step 9: Test Feedback Form
    await page.getByRole('button', { name: /דרג את הכלי/ }).click();

    // Select 5-star rating
    const stars = page.locator('button:has-text("⭐")');
    await stars.nth(4).click(); // Click 5th star

    // Optionally add comment
    await page.getByPlaceholder(/מה אהבת/).fill('כלי מצוין! עזר לי מאוד.');

    // Submit feedback
    await page.getByRole('button', { name: /שלח משוב/ }).click();

    // Wait for success message
    await expect(page.getByText('תודה על המשוב!')).toBeVisible({ timeout: 10000 });

    // Step 10: Verify sharing options
    await expect(page.getByRole('button', { name: /העתק קישור לשיתוף/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /התחל שוב/ })).toBeVisible();
  });

  test('Landing page loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check all main sections
    await expect(page.getByText('דע את סטטוס המע"מ שלך ב-2 דקות')).toBeVisible();
    await expect(page.getByText('📊 הבעיה:')).toBeVisible();
    await expect(page.getByText('עוסק פטור vs עוסק מורשה')).toBeVisible();
    await expect(page.getByText('מבוסס על חוקי רשות המיסים')).toBeVisible();

    // Check footer
    await expect(page.getByText('© 2025 bioGov')).toBeVisible();
  });

  test('Quiz validates input before proceeding', async ({ page }) => {
    await page.goto('/quiz');

    // Next button should be disabled initially
    const nextButton = page.getByRole('button', { name: /המשך/ });
    await expect(nextButton).toBeDisabled();

    // Select an option
    await page.getByText('שירותים', { exact: false }).first().click();

    // Next button should now be enabled
    await expect(nextButton).toBeEnabled();
  });

  test('Back button navigates correctly', async ({ page }) => {
    await page.goto('/quiz');

    // On first question
    await expect(page.getByText('1/5')).toBeVisible();

    // Select option and go to next question
    await page.getByText('שירותים', { exact: false }).first().click();
    await page.getByRole('button', { name: /המשך/ }).click();

    // On second question
    await expect(page.getByText('2/5')).toBeVisible();

    // Click back button
    await page.getByRole('button', { name: /חזור/ }).click();

    // Should be back on first question
    await expect(page.getByText('1/5')).toBeVisible();
  });

  test('Results page handles direct access', async ({ page }) => {
    // Try to access non-existent result
    await page.goto('/results/00000000-0000-0000-0000-000000000000');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should show error (check for error icon or loading first)
    await expect(page.getByText(/שגיאה בטעינת התוצאות|תוצאות לא נמצאו/)).toBeVisible({ timeout: 10000 });

    // Should offer to start new assessment
    await expect(page.getByRole('button', { name: /התחל בדיקה חדשה/ })).toBeVisible();
  });
});
