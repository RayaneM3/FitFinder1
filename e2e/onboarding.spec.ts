import { test, expect } from "@playwright/test";
import { signUp, uniqueEmail } from "./helpers";

test.describe("Onboarding – trainer flow", () => {
  test("trainer completes all onboarding steps and reaches dashboard", async ({ page }) => {
    const email = uniqueEmail("trainer");
    await signUp(page, { email, name: "Trainer Joe" });
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });

    // Step 1 — choose role
    await expect(page.getByTestId("role-trainer")).toBeVisible();
    await page.getByTestId("role-trainer").click();
    await page.getByTestId("button-next-step").click();

    // Step 2 — profile info
    await expect(page.getByTestId("input-display-name")).toBeVisible({ timeout: 6000 });
    await page.getByTestId("input-display-name").fill("Trainer Joe");
    await page.getByTestId("input-city").fill("Los Angeles");
    await page.getByTestId("input-country").fill("United States");
    await page.getByTestId("button-next-step").click();

    // Step 3 — trainer specifics
    await expect(page.getByTestId("input-price-min")).toBeVisible({ timeout: 6000 });
    await page.getByTestId("input-price-min").fill("50");
    await page.getByTestId("input-price-max").fill("150");
    await page.getByTestId("checkbox-trainer-agreement").check();
    await page.getByTestId("button-next-step").click();

    // After onboarding there is a 1.2 s delay before the redirect
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 });
  });
});

test.describe("Onboarding – client flow", () => {
  test("client completes all onboarding steps and reaches dashboard", async ({ page }) => {
    const email = uniqueEmail("client");
    await signUp(page, { email, name: "Client Jane" });
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });

    // Step 1 — choose role
    await expect(page.getByTestId("role-client")).toBeVisible();
    await page.getByTestId("role-client").click();
    await page.getByTestId("button-next-step").click();

    // Step 2 — profile info
    await expect(page.getByTestId("input-display-name")).toBeVisible({ timeout: 6000 });
    await page.getByTestId("input-display-name").fill("Client Jane");
    await page.getByTestId("input-city").fill("New York");
    await page.getByTestId("input-country").fill("United States");
    await page.getByTestId("button-next-step").click();

    // Step 3 — client preferences
    await expect(page.getByTestId("checkbox-client-waiver")).toBeVisible({ timeout: 6000 });
    await page.getByTestId("checkbox-client-waiver").check();
    await page.getByTestId("button-next-step").click();

    // After onboarding there is a 1.2 s delay before the redirect
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 });
  });
});

test.describe("Onboarding – validation", () => {
  test("cannot advance past step 1 without selecting a role", async ({ page }) => {
    const email = uniqueEmail("norole");
    await signUp(page, { email });
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });

    // Click Continue without selecting a role
    await page.getByTestId("button-next-step").click();

    // Should remain on the role-selection step
    await expect(page.getByTestId("role-trainer")).toBeVisible();
    await expect(page.getByTestId("role-client")).toBeVisible();
  });
});
