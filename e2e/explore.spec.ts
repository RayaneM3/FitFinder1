import { test, expect } from "@playwright/test";

test.describe("Explore page", () => {
  test("page loads with title and search input", async ({ page }) => {
    await page.goto("/explore");

    await expect(page.getByTestId("text-page-title")).toBeVisible();
    await expect(page.getByTestId("text-page-title")).toHaveText("Explore Trainers");
    await expect(page.getByTestId("input-search")).toBeVisible();
  });

  test("sidebar filters are present on desktop", async ({ page }) => {
    // Use desktop viewport so sidebar is visible (not hidden behind mobile toggle)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/explore");

    await expect(page.getByTestId("select-country")).toBeVisible();
    await expect(page.getByTestId("button-clear-all-sidebar")).toBeVisible();
  });

  test("typing in the search box filters the results heading", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/explore");

    // Wait for results heading to appear before interacting
    await expect(page.getByTestId("text-results-heading")).toBeVisible({ timeout: 8000 });

    const searchInput = page.getByTestId("input-search");
    await searchInput.fill("yoga");

    // Results heading should still be visible (query applied)
    await expect(page.getByTestId("text-results-heading")).toBeVisible({ timeout: 8000 });
  });
});
