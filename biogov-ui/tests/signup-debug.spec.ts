import { test, expect } from '@playwright/test';

test.describe('Signup Flow Debug', () => {
  test.beforeEach(async ({ page }) => {
    // Listen to console messages
    page.on('console', (msg) => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    // Listen to network requests
    page.on('request', (request) => {
      if (request.url().includes('/api/auth/signup')) {
        console.log(`[Network Request] ${request.method()} ${request.url()}`);
        console.log('[Request Body]', request.postData());
      }
    });

    // Listen to network responses
    page.on('response', async (response) => {
      if (response.url().includes('/api/auth/signup')) {
        console.log(`[Network Response] ${response.status()} ${response.url()}`);
        try {
          const body = await response.json();
          console.log('[Response Body]', JSON.stringify(body, null, 2));
        } catch (e) {
          console.log('[Response] Could not parse JSON');
        }
      }
    });
  });

  test('should debug signup form submission', async ({ page }) => {
    // Navigate to signup page
    await page.goto('http://localhost:3002/signup');

    // Wait for page to load
    await expect(page.locator('text=הצטרפ ל-bioGov')).toBeVisible();

    // Fill in the form
    await page.fill('input[type="text"]#name', 'Test User');
    console.log('[Form] Filled name field');

    await page.fill('input[type="email"]#email', 'test@example.com');
    console.log('[Form] Filled email field');

    await page.fill('input[type="password"]#password', 'TestPass123!');
    console.log('[Form] Filled password field');

    // Check the consent checkbox
    const checkbox = page.locator('input[type="checkbox"]#consent');
    await checkbox.check();
    console.log('[Form] Checked consent checkbox');

    // Verify checkbox is checked
    const isChecked = await checkbox.isChecked();
    console.log(`[Form] Checkbox state: ${isChecked ? 'CHECKED' : 'NOT CHECKED'}`);

    // Wait a bit to ensure state updates
    await page.waitForTimeout(500);

    // Take a screenshot before submission
    await page.screenshot({ path: 'tests/screenshots/before-submit.png', fullPage: true });
    console.log('[Screenshot] Saved before-submit.png');

    // Click submit button
    console.log('[Form] Clicking submit button...');
    await page.click('button[type="submit"]');

    // Wait for either success or error
    await page.waitForTimeout(2000);

    // Take a screenshot after submission
    await page.screenshot({ path: 'tests/screenshots/after-submit.png', fullPage: true });
    console.log('[Screenshot] Saved after-submit.png');

    // Check for error message
    const errorMessage = await page.locator('text=Privacy consent is required').isVisible();
    if (errorMessage) {
      console.log('[Error] "Privacy consent is required" message is visible');
    } else {
      console.log('[Success] No error message visible');
    }

    // Log all visible error messages
    const allErrors = await page.locator('[role="alert"], .text-destructive, .text-red-600').allTextContents();
    console.log('[All Errors]', allErrors);
  });

  test('should check consent state before and after clicking', async ({ page }) => {
    await page.goto('http://localhost:3002/signup');

    const checkbox = page.locator('input[type="checkbox"]#consent');

    // Check initial state
    const initialState = await checkbox.isChecked();
    console.log(`[Initial State] Checkbox: ${initialState ? 'CHECKED' : 'UNCHECKED'}`);

    // Click the checkbox
    await checkbox.click();
    await page.waitForTimeout(300);

    // Check state after click
    const afterClickState = await checkbox.isChecked();
    console.log(`[After Click] Checkbox: ${afterClickState ? 'CHECKED' : 'UNCHECKED'}`);

    // Check the checkbox explicitly
    await checkbox.check();
    await page.waitForTimeout(300);

    // Check state after check()
    const afterCheckState = await checkbox.isChecked();
    console.log(`[After check()] Checkbox: ${afterCheckState ? 'CHECKED' : 'UNCHECKED'}`);
  });

  test('should intercept API request and check payload', async ({ page }) => {
    let requestBody: any = null;

    // Intercept the signup request
    await page.route('**/api/auth/signup', async (route) => {
      const request = route.request();
      requestBody = JSON.parse(request.postData() || '{}');
      console.log('[Intercepted Request Body]', JSON.stringify(requestBody, null, 2));

      // Continue with the request
      await route.continue();
    });

    await page.goto('http://localhost:3002/signup');

    // Fill form
    await page.fill('#name', 'Debug User');
    await page.fill('#email', 'debug@test.com');
    await page.fill('#password', 'DebugPass123!');
    await page.check('#consent');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for request
    await page.waitForTimeout(2000);

    // Check if consentGiven was in the request
    if (requestBody) {
      console.log('[Payload Check] email:', requestBody.email);
      console.log('[Payload Check] password:', requestBody.password ? '[PRESENT]' : '[MISSING]');
      console.log('[Payload Check] name:', requestBody.name);
      console.log('[Payload Check] consentGiven:', requestBody.consentGiven);
      console.log('[Payload Check] consent:', requestBody.consent);

      if (requestBody.consentGiven === undefined && requestBody.consent === undefined) {
        console.log('[BUG FOUND] No consent parameter sent in request!');
      }
    }
  });
});
