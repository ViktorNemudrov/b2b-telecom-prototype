import { expect, test } from "@playwright/test";

test("regression: basic chat deterministic flow", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("pwa-install-dismissed", "1");
  });
  await page.goto("/assistant/");

  const input = page.getByLabel("Поле ввода");
  await input.fill("Секретарь");
  await input.press("Enter");

  await expect(page.getByText("Открываю сценарий «Секретарь»")).toBeVisible({ timeout: 10_000 });
});
