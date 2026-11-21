import { test, expect } from '@playwright/test';

test.describe('Permission Denied Page', () => {
  test('renders /unauthorized page with clear message', async ({ page }) => {
    await page.goto('/unauthorized');
    await expect(page.locator('body')).toContainText(/unauthorized|permission|access/i);
  });
});
