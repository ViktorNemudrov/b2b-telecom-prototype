import { expect, test } from "@playwright/test";

test("mobile touch: assistant send and open invoice detail", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("b2b_pwa_install_dismissed_v1", "1");
  });
  await page.goto("/assistant/");

  const input = page.getByLabel("Поле ввода");
  await input.fill("привет");
  await input.press("Enter");
  await expect(page.getByText("И вам здравствуйте, желаю вам хорошего дня")).toBeVisible({ timeout: 10_000 });

  await page.goto("/invoices/");
  await page.locator('a[href^="/invoices/"]').first().click();
  await expect(page).toHaveURL(/\/invoices\/.+\/?$/);
});

test("mobile touch: classic app invoices and pwa assets", async ({ page, request }) => {
  await page.goto("http://127.0.0.1:3001/invoices/");
  await page.locator("#invoice-sort-ai").selectOption("amount_asc");
  await expect(page.locator("#invoice-sort-ai")).toHaveValue("amount_asc");

  const manifest = await request.get("http://127.0.0.1:3001/manifest.webmanifest");
  const sw = await request.get("http://127.0.0.1:3001/sw.js");
  expect(manifest.ok()).toBeTruthy();
  expect(sw.ok()).toBeTruthy();
});
