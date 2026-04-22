import { expect, test } from "@playwright/test";

test.describe("PWA install banner session behavior", () => {
  test.use({ baseURL: "http://127.0.0.1:3001" });

  test("Classic: `Позже` hides banner only until full reload", async ({ page }) => {
    await page.goto("/onboarding/");
    const installTitle = page.getByText("Установить Билайн.One");
    await expect(installTitle).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Позже" }).click();
    await expect(installTitle).toBeHidden();

    // Repeat onboarding from profile flow without full reload.
    await page.goto("/assistant/");
    await page.goto("/settings/onboarding/");
    await expect(page.getByText("Установить Билайн.One")).toBeHidden();

    // Full reload starts a new page runtime session.
    await page.reload();
    await expect(page.getByText("Установить Билайн.One")).toBeVisible({ timeout: 10_000 });
  });
});
