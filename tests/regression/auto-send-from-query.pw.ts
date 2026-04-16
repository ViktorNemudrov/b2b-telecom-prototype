import { expect, test } from "@playwright/test";

test("regression: assistant auto-sends query without manual click", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("pwa-install-dismissed", "1");
  });
  await page.goto("/assistant/?q=%D0%A1%D0%B5%D0%BA%D1%80%D0%B5%D1%82%D0%B0%D1%80%D1%8C");
  await expect(page.getByText("Открываю сценарий «Секретарь»")).toBeVisible({ timeout: 10_000 });
});
