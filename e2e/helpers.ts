import { type Page, expect } from "@playwright/test";

/** Unique suffix so parallel runs (or retries) don't clash on email */
export function uniqueEmail(prefix = "testuser"): string {
  return `${prefix}+${Date.now()}@example.com`;
}

/** Fill the signup form and submit. Returns the email used. */
export async function signUp(
  page: Page,
  opts: { name?: string; email?: string; password?: string } = {}
): Promise<string> {
  const email = opts.email ?? uniqueEmail();
  const password = opts.password ?? "TestPass123!";
  const name = opts.name ?? "Test User";

  await page.goto("/auth");

  // Auth page starts in sign-in mode — switch to sign-up
  await page.getByTestId("button-toggle-auth").click();

  await page.getByTestId("input-name").fill(name);
  await page.getByTestId("input-email").fill(email);
  await page.getByTestId("input-password").fill(password);
  await page.getByTestId("checkbox-accept-terms").check();
  await page.getByTestId("button-auth-submit").click();

  return email;
}

/** Sign in with existing credentials. */
export async function signIn(
  page: Page,
  email: string,
  password = "TestPass123!"
): Promise<void> {
  await page.goto("/auth");
  await page.getByTestId("input-email").fill(email);
  await page.getByTestId("input-password").fill(password);
  await page.getByTestId("button-auth-submit").click();
}

/** Complete trainer onboarding after signup.
 *  Assumes the page is already on /onboarding. */
export async function completeTrainerOnboarding(page: Page): Promise<void> {
  // Step 1 — role selection
  await page.getByTestId("role-trainer").click();
  await page.getByTestId("button-next-step").click();

  // Step 2 — profile info
  await page.getByTestId("input-display-name").fill("Test Trainer");
  await page.getByTestId("input-city").fill("London");
  await page.getByTestId("input-country").fill("United Kingdom");
  await page.getByTestId("button-next-step").click();

  // Step 3 — trainer details
  await page.getByTestId("input-price-min").fill("30");
  await page.getByTestId("input-price-max").fill("80");
  await page.getByTestId("checkbox-trainer-agreement").check();
  await page.getByTestId("button-next-step").click();
}

/** Complete client onboarding after signup.
 *  Assumes the page is already on /onboarding. */
export async function completeClientOnboarding(page: Page): Promise<void> {
  // Step 1 — role selection
  await page.getByTestId("role-client").click();
  await page.getByTestId("button-next-step").click();

  // Step 2 — profile info
  await page.getByTestId("input-display-name").fill("Test Client");
  await page.getByTestId("input-city").fill("New York");
  await page.getByTestId("input-country").fill("United States");
  await page.getByTestId("button-next-step").click();

  // Step 3 — client preferences
  await page.getByTestId("checkbox-client-waiver").check();
  await page.getByTestId("button-next-step").click();
}

/** Wait for a toast notification containing the given text. */
export async function expectToast(page: Page, text: string | RegExp): Promise<void> {
  // Sonner renders toasts in [data-sonner-toaster] or just as li elements
  const toast = page.locator("[data-sonner-toast]").filter({ hasText: text });
  await expect(toast.first()).toBeVisible({ timeout: 6000 });
}
