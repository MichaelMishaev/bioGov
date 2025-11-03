import { test, expect } from '@playwright/test';

test.describe('Complete Signup with All Fixes', () => {
  const testEmail = `newuser@test.com`;
  const testPassword = 'TestPass123!';
  const testName = 'New User';

  test('should complete signup and login successfully', async ({ page }) => {
    console.log('\n🧪 Testing Complete Signup Flow with All Fixes Applied\n');

    // Step 1: Navigate to signup page
    await page.goto('http://localhost:3002/signup');
    console.log('✅ Step 1: Navigated to signup page');
    await expect(page.locator('text=הצטרפ ל-bioGov')).toBeVisible();

    // Step 2: Fill in all form fields
    await page.fill('#name', testName);
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    console.log('✅ Step 2: Filled in form fields');

    // Step 3: Check consent checkbox
    await page.check('#consent');
    const isChecked = await page.locator('#consent').isChecked();
    expect(isChecked).toBe(true);
    console.log('✅ Step 3: Consent checkbox is checked');

    // Step 4: Intercept the API request to verify payload
    let requestBody: any = null;
    await page.route('**/api/auth/signup', async (route) => {
      const request = route.request();
      requestBody = JSON.parse(request.postData() || '{}');
      console.log('📤 API Request Body:', JSON.stringify(requestBody, null, 2));
      await route.continue();
    });

    // Step 5: Submit the form
    await page.click('button[type="submit"]');
    console.log('✅ Step 4: Submitted signup form');

    // Step 6: Verify consentGiven was sent
    await page.waitForTimeout(1000); // Wait for API call
    expect(requestBody).not.toBeNull();
    expect(requestBody.consentGiven).toBe(true);
    console.log('✅ Step 5: consentGiven parameter was sent correctly');

    // Step 7: Wait for redirect to onboarding page
    await page.waitForURL('**/onboarding', { timeout: 10000 });
    console.log('✅ Step 6: Redirected to onboarding page');

    // Step 8: Verify we're authenticated (should not see Unauthorized)
    await expect(page.locator('text=בחר את סוג העסק שלך')).toBeVisible();
    console.log('✅ Step 7: Onboarding page loaded (user is authenticated)');

    // Step 9: Check cookies were set
    const cookies = await page.context().cookies();
    const accessToken = cookies.find(c => c.name === 'access_token');
    const refreshToken = cookies.find(c => c.name === 'refresh_token');

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    console.log('✅ Step 8: Authentication cookies are set');
    console.log('   - access_token:', accessToken ? '✓' : '✗');
    console.log('   - refresh_token:', refreshToken ? '✓' : '✗');

    console.log('\n🎉 ALL TESTS PASSED! Signup flow is working correctly.\n');
  });

  test('should be able to login after signup', async ({ page }) => {
    console.log('\n🧪 Testing Login After Signup\n');

    // Wait a bit to ensure previous test completed
    await page.waitForTimeout(2000);

    // Step 1: Navigate to login page
    await page.goto('http://localhost:3002/login');
    console.log('✅ Step 1: Navigated to login page');

    // Step 2: Fill in credentials
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    console.log('✅ Step 2: Filled in login credentials');

    // Step 3: Submit login
    await page.click('button[type="submit"]');
    console.log('✅ Step 3: Submitted login form');

    // Step 4: Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Step 4: Redirected to dashboard');

    // Step 5: Verify dashboard loaded
    await expect(page.locator('text=לוח בקרה')).toBeVisible();
    console.log('✅ Step 5: Dashboard loaded successfully');

    console.log('\n🎉 LOGIN TEST PASSED! User can login after signup.\n');
  });
});
