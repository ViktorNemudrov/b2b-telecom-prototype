import { expect, test } from "@playwright/test";

test("smoke: AI-first critical chat send and invoices navigation", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("pwa-install-dismissed", "1");
  });
  await page.goto("/assistant/");

  const input = page.getByLabel("Поле ввода");
  await input.fill("привет");
  await input.press("Enter");
  await expect(page.getByText("И вам здравствуйте, желаю вам хорошего дня")).toBeVisible({ timeout: 10_000 });

  await page.goto("/invoices/");
  await expect(page.getByRole("heading", { name: "Счета 2026" })).toBeVisible();
  await page.locator('a[href^="/invoices/"]').first().click();
  await expect(page).toHaveURL(/\/invoices\/.+\/$/);
});

test("smoke: Classic invoices and details are reachable", async ({ page }) => {
  await page.goto("http://127.0.0.1:3001/invoices/");
  await expect(page.getByRole("heading", { name: "Счета 2026" })).toBeVisible();

  await page.locator('a[href^="/invoices/"]').first().click();
  await expect(page).toHaveURL(/http:\/\/127\.0\.0\.1:3001\/invoices\/.+\/$/);
  await expect(page.getByText("Скачать PDF", { exact: true })).toBeVisible();
});

test("smoke: PWA assets are available for both apps", async ({ request }) => {
  const aiManifest = await request.get("http://127.0.0.1:3000/manifest.webmanifest");
  const aiSw = await request.get("http://127.0.0.1:3000/sw.js");
  const classicManifest = await request.get("http://127.0.0.1:3001/manifest.webmanifest");
  const classicSw = await request.get("http://127.0.0.1:3001/sw.js");

  expect(aiManifest.ok()).toBeTruthy();
  expect(aiSw.ok()).toBeTruthy();
  expect(classicManifest.ok()).toBeTruthy();
  expect(classicSw.ok()).toBeTruthy();
});
