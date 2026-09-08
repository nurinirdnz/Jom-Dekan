# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> a new student can register, land on the dashboard, and log out
- Location: tests\e2e\auth.spec.ts:9:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/dashboard/
Received string:  "http://localhost:5173/register"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × locator resolved to <html lang="en">…</html>
       - unexpected value "http://localhost:5173/register"

```

```yaml
- banner:
  - link "JomDekan":
    - /url: /
  - navigation:
    - link "Log in":
      - /url: /login
    - link "Get started":
      - /url: /register
- main:
  - heading "Create your JomDekan account" [level=1]
  - paragraph: For Malaysian university students — past papers, notes, discussions, and legitimate tutoring, all in one place.
  - text: Full name
  - textbox "Full name": E2E Test Student
  - text: Email
  - textbox "Email": e2e-1788772182948@example.com
  - text: Password
  - textbox "Password": correcthorsebattery
  - paragraph: At least 8 characters.
  - button "Create account"
  - paragraph:
    - text: Already have an account?
    - link "Log in":
      - /url: /login
- contentinfo:
  - paragraph: © 2026 JomDekan. Built for Malaysian university students.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Requires both the backend (http://localhost:3000) and frontend
  5  |  * (http://localhost:5173) dev servers running against a migrated
  6  |  * database. See docs/setup.md. Run with:
  7  |  *   npm --prefix frontend run test:e2e
  8  |  */
  9  | test('a new student can register, land on the dashboard, and log out', async ({ page }) => {
  10 |   const email = `e2e-${Date.now()}@example.com`;
  11 | 
  12 |   await page.goto('/register');
  13 |   await page.getByLabel(/full name/i).fill('E2E Test Student');
  14 |   await page.getByLabel(/email/i).fill(email);
  15 |   await page.getByLabel(/^password/i).fill('correcthorsebattery');
  16 |   await page.getByRole('button', { name: /create account/i }).click();
  17 | 
> 18 |   await expect(page).toHaveURL(/\/dashboard/);
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  19 |   await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
  20 | 
  21 |   await page.getByRole('button', { name: /log out/i }).click();
  22 |   await expect(page).toHaveURL(/\/login/);
  23 | });
  24 | 
```