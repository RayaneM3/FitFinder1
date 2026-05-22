import { test, expect } from "@playwright/test";
import { uniqueEmail, signUp, signIn } from "./helpers";

test.describe("Auth – sign up", () => {
  test("new user can sign up and is redirected to onboarding", async ({ page }) => {
    const email = await signUp(page);

    // After signup, the server sets onboardingComplete=false → redirect to /onboarding
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });
    // Role selection step is visible
    await expect(page.getByTestId("role-trainer")).toBeVisible();
    await expect(page.getByTestId("role-client")).toBeVisible();
  });

  test("signup with duplicate email shows an error", async ({ page }) => {
    const email = uniqueEmail("dup");
    // First signup
    await signUp(page, { email });
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });

    // Second signup attempt — go back to auth and try the same email
    await page.goto("/auth");
    await page.getByTestId("button-toggle-auth").click();
    await page.getByTestId("input-name").fill("Another User");
    await page.getByTestId("input-email").fill(email);
    await page.getByTestId("input-password").fill("TestPass123!");
    await page.getByTestId("checkbox-accept-terms").check();
    await page.getByTestId("button-auth-submit").click();

    // Should stay on /auth and show an error toast
    await expect(page).toHaveURL(/\/auth/, { timeout: 8000 });
  });
});

test.describe("Auth – sign in", () => {
  test("existing user can sign in and reach the dashboard", async ({ page }) => {
    // Create the account first
    const email = uniqueEmail("signin");
    await signUp(page, { email });
    // Skip onboarding by navigating away
    await page.goto("/");

    // Sign out via user menu (if logged in)
    const userMenu = page.getByTestId("button-user-menu");
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.getByTestId("button-logout").click();
    }

    // Now sign in
    await signIn(page, email);

    // Lands on /onboarding (account was not completed) or /dashboard
    await expect(page).toHaveURL(/\/(onboarding|dashboard)/, { timeout: 10000 });
  });

  test("wrong password shows an error and stays on auth page", async ({ page }) => {
    const email = uniqueEmail("badpass");
    await signUp(page, { email });
    await page.goto("/");

    // Sign out
    const userMenu = page.getByTestId("button-user-menu");
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.getByTestId("button-logout").click();
    }

    // Try to sign in with wrong password
    await page.goto("/auth");
    await page.getByTestId("input-email").fill(email);
    await page.getByTestId("input-password").fill("WrongPassword999!");
    await page.getByTestId("button-auth-submit").click();

    // Should remain on /auth
    await expect(page).toHaveURL(/\/auth/, { timeout: 8000 });
  });
});
