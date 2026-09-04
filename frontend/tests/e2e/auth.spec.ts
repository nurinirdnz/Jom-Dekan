import { test, expect } from '@playwright/test';

/**
 * Requires both the backend (http://localhost:3000) and frontend
 * (http://localhost:5173) dev servers running against a migrated
 * database. See docs/setup.md. Run with:
 *   npm --prefix frontend run test:e2e
 */
test('a new student can register, land on the dashboard, and log out', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;

  await page.goto('/register');
  await page.getByLabel(/full name/i).fill('E2E Test Student');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/^password/i).fill('correcthorsebattery');
  await page.getByRole('button', { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();

  await page.getByRole('button', { name: /log out/i }).click();
  await expect(page).toHaveURL(/\/login/);
});
