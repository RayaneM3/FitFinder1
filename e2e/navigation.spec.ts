import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads and shows hero CTAs", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("button-find-trainer")).toBeVisible();
    await expect(page.getByTestId("button-become-trainer")).toBeVisible();
  });

  test("Explore link in navbar navigates to /explore", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("link-explore").click();
    await expect(page).toHaveURL(/\/explore/);
    await expect(page.getByTestId("text-page-title")).toHaveText("Explore Trainers");
  });

  test("/legal/terms loads without error", async ({ page }) => {
    await page.goto("/legal/terms");
    // Page should not show a 404 — check that it renders some content
    await expect(page.locator("body")).not.toBeEmpty();
    // Navbar should still be present
    await expect(page.getByTestId("link-home")).toBeVisible();
  });

  test("/legal/privacy loads without error", async ({ page }) => {
    await page.goto("/legal/privacy");
    await expect(page.locator("body")).not.toBeEmpty();
    await expect(page.getByTestId("link-home")).toBeVisible();
  });

  test("/faq loads without error", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.locator("body")).not.toBeEmpty();
    await expect(page.getByTestId("link-home")).toBeVisible();
  });

  test("unauthenticated /dashboard redirects to /auth", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth/, { timeout: 8000 });
  });

  test("Get Started button on homepage navigates to /auth", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("button-find-trainer").click();
    // Should navigate to /explore or /auth depending on auth state
    await expect(page).toHaveURL(/\/(explore|auth)/, { timeout: 6000 });
  });
});
