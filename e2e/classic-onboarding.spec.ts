import { expect, test } from "@playwright/test";

/**
 * Classic onboarding (http://127.0.0.1:3001/onboarding/).
 * Проект: desktop-chromium-classic.
 */
test.describe.configure({ mode: "serial", timeout: 120_000 });

test("Classic: онбординг открывается и показывает первый шаг", async ({ page }) => {
  await page.goto("/onboarding/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: "Закрыть онбординг" })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Ваш бизнес ассистент", { exact: true })).toBeVisible({ timeout: 15_000 });
});

test("Classic: закрытие онбординга ведёт в ассистент", async ({ page }) => {
  await page.goto("/onboarding/", { waitUntil: "domcontentloaded" });
  const closeBtn = page.getByRole("link", { name: "Закрыть онбординг" });
  await expect(closeBtn).toBeVisible({ timeout: 30_000 });
  await closeBtn.click();
  await expect(page).toHaveURL(/\/assistant\/?/, { timeout: 20_000 });
});

test("Classic: переключение слайдов по точкам навигации", async ({ page }) => {
  await page.goto("/onboarding/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: "Закрыть онбординг" })).toBeVisible({ timeout: 30_000 });
  const dot1 = page.getByTestId("onboarding-dot-1");
  await expect(dot1).toBeVisible({ timeout: 15_000 });
  await dot1.click({ force: true });
  await expect(page.getByRole("img", { name: "Экран онбординга 2" })).toBeVisible({ timeout: 15_000 });
  await page.getByTestId("onboarding-dot-0").click({ force: true });
  await expect(page.getByText("Ваш бизнес ассистент", { exact: true })).toBeVisible({ timeout: 10_000 });
});
