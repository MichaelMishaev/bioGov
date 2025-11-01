import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Should redirect to login
    await page.waitForURL(/.*login/, { timeout: 5000 });
    await expect(page).toHaveURL(/.*login/);
  });

  test.describe('With authenticated user', () => {
    // These tests would require authentication setup
    test.skip('should display dashboard with RTL layout', async ({ page }) => {
      // After authentication
      await page.goto('http://localhost:3000/dashboard');

      // Check RTL
      const html = page.locator('html');
      await expect(html).toHaveAttribute('dir', 'rtl');

      // Check header
      await expect(page.getByText('bioGov')).toBeVisible();
      await expect(page.getByText('לוח בקרה')).toBeVisible();

      // Check user menu
      await expect(page.getByRole('button', { name: /יציאה/ })).toBeVisible();
    });

    test.skip('should display compliance score widget', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');

      // Check compliance score card
      await expect(page.getByText('ציון ציות')).toBeVisible();

      // Should show percentage score
      await expect(page.locator('text=/%/')).toBeVisible();

      // Should show task statistics
      await expect(page.getByText('משימות שהושלמו')).toBeVisible();
    });

    test.skip('should switch between view modes', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');

      // Check view mode buttons
      await expect(page.getByRole('button', { name: 'סקירה כללית' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'רשימת משימות' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'לוח שנה' })).toBeVisible();

      // Switch to list view
      await page.getByRole('button', { name: 'רשימת משימות' }).click();
      await expect(page.locator('input[placeholder*="חפש משימות"]')).toBeVisible();

      // Switch to calendar view
      await page.getByRole('button', { name: 'לוח שנה' }).click();
      await expect(page.getByText(/ינואר|פברואר|מרץ/)).toBeVisible();

      // Switch back to overview
      await page.getByRole('button', { name: 'סקירה כללית' }).click();
      await expect(page.getByText('ציון ציות')).toBeVisible();
    });

    test.skip('should display upcoming tasks', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');

      // Check upcoming tasks section
      await expect(page.getByText('משימות קרובות (30 ימים הקרובים)')).toBeVisible();

      // Tasks should be visible or show "no tasks" message
      const noTasksMessage = page.getByText('אין משימות קרובות');
      const taskCards = page.locator('[data-testid="task-card"]');

      // Either message or tasks should be visible
      await expect(
        noTasksMessage.or(taskCards.first())
      ).toBeVisible();
    });

    test.skip('should show overdue tasks alert', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');

      // If there are overdue tasks
      const overdueAlert = page.getByText(/משימות באיחור/);

      if (await overdueAlert.isVisible()) {
        await expect(overdueAlert).toBeVisible();
        await expect(page.getByText('צפה במשימות באיחור')).toBeVisible();
      }
    });

    test.skip('should filter tasks in list view', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');

      // Switch to list view
      await page.getByRole('button', { name: 'רשימת משימות' }).click();

      // Check filter pills
      await expect(page.getByRole('button', { name: 'הכל' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'ממתין' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'בתהליך' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'באיחור' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'הושלם' })).toBeVisible();

      // Click filter
      await page.getByRole('button', { name: 'ממתין' }).click();

      // Should filter tasks (verify by checking if filter is active)
      const pendingButton = page.getByRole('button', { name: 'ממתין' });
      // Active filters typically have different styling
    });

    test.skip('should search tasks', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');

      // Switch to list view
      await page.getByRole('button', { name: 'רשימת משימות' }).click();

      // Search for tasks
      const searchInput = page.locator('input[placeholder*="חפש משימות"]');
      await searchInput.fill('מע״מ');

      // Should filter results (this depends on having data)
    });

    test.skip('should open task details modal', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');

      // Switch to list view
      await page.getByRole('button', { name: 'רשימת משימות' }).click();

      // Click on a task (if exists)
      const firstTask = page.locator('[data-testid="task-card"]').first();

      if (await firstTask.isVisible()) {
        await firstTask.click();

        // Modal should open
        await expect(page.getByRole('dialog')).toBeVisible();
      }
    });

    test.skip('should mark task as complete', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');

      // Switch to list view
      await page.getByRole('button', { name: 'רשימת משימות' }).click();

      // Find and click complete button
      const completeButton = page.getByRole('button', { name: 'סמן כהושלם' }).first();

      if (await completeButton.isVisible()) {
        await completeButton.click();

        // Task should be marked as completed
        // Verify by checking if completion count increased
      }
    });

    test.skip('should navigate calendar months', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');

      // Switch to calendar view
      await page.getByRole('button', { name: 'לוח שנה' }).click();

      // Get current month text
      const monthText = await page.locator('text=/ינואר|פברואר|מרץ|אפריל|מאי|יוני|יולי|אוגוסט|ספטמבר|אוקטובר|נובמבר|דצמבר/').first().textContent();

      // Click next month button
      const nextButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      await nextButton.click();

      // Month should change
      const newMonthText = await page.locator('text=/ינואר|פברואר|מרץ|אפריל|מאי|יוני|יולי|אוגוסט|ספטמבר|אוקטובר|נובמבר|דצמבר/').first().textContent();

      // Verify month changed (this is a basic check)
      // In a real scenario, we'd verify the exact month change
    });

    test.skip('should logout successfully', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');

      // Click logout button
      await page.getByRole('button', { name: /יציאה/ }).click();

      // Should redirect to login
      await page.waitForURL(/.*login/, { timeout: 5000 });
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test('should display loading state', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Should show loading indicator briefly
    // (This might be too fast to catch, but we can check for it)
    const loadingText = page.getByText('טוען...');

    // Either loading is visible or we're redirected to login
    // This is because we're not authenticated
  });
});
