import { test, expect } from '@playwright/test';

test.describe('User Management Routes', () => {
  test('protects /users behind authentication', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
