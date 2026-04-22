import { expect, test } from "@playwright/test";

test.describe("PWA install banner session behavior", () => {
  test.use({ baseURL: "http://127.0.0.1:3001" });

  test("Classic: `Позже` hides banner only until full reload", async ({ page }) => {
    await page.goto("/onboarding/");
    await expect(page.getByText("Установить Билайн.One")).toBeHidden();
    await page.getByRole("link", { name: "Закрыть онбординг" }).click();
    await expect(page).toHaveURL(/\/assistant\/?$/);
    const installTitle = page.getByText("Установить Билайн.One");
    await expect(installTitle).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Позже" }).click();
    await expect(installTitle).toBeHidden();

    // Repeat onboarding from profile flow without full reload.
    await page.goto("/assistant/");
    await page.goto("/settings/onboarding/");
    await expect(page.getByText("Установить Билайн.One")).toBeHidden();

    // Full reload starts a new page runtime session.
    await page.goto("/assistant/");
    await page.reload();
    await expect(page.getByText("Установить Билайн.One")).toBeVisible({ timeout: 10_000 });
  });

  test("Classic: legacy dismissed keys do not block first-session banner", async ({ page }) => {
    await page.goto("/onboarding/");
    await page.evaluate(() => {
      window.localStorage.setItem("b2b_pwa_install_dismissed_v1", "1");
      window.localStorage.setItem("pwa-install-dismissed", "1");
    });
    await page.getByRole("link", { name: "Закрыть онбординг" }).click();
    await expect(page).toHaveURL(/\/assistant\/?$/);
    await expect(page.getByText("Установить Билайн.One")).toBeVisible({ timeout: 10_000 });
  });
});
