import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('redirects unauthenticated users to /auth/login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('renders login form fields and submit button', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('input[type="email"], input[formControlName="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[formControlName="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
