import { expect, test } from "@playwright/test";

test.describe("AI-first user actions", () => {
  test("keyboard send + click navigation to invoice detail", async ({ page }) => {
    await page.goto("/assistant/");

    const chatInput = page.getByLabel("Поле ввода");
    await chatInput.fill("покажи неоплаченные счета");
    await chatInput.press("Enter");

    await expect(page.getByText("Неоплаченные счета", { exact: true })).toBeVisible();

    const firstAmountButton = page.locator("button", { hasText: "₽" }).first();
    const box = await firstAmountButton.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.up();

    await expect(page).toHaveURL(/\/invoices\/.+\/?$/);
    await expect(page.getByText("Скачать PDF", { exact: true })).toBeVisible();
  });

  test("settings interactions: toggle switch and open FAQ", async ({ page }) => {
    await page.goto("/settings/");

    const notificationsSwitch = page.getByRole("switch", { name: "Уведомления" });
    await expect(notificationsSwitch).toHaveAttribute("aria-checked", "true");
    await notificationsSwitch.click();
    await expect(notificationsSwitch).toHaveAttribute("aria-checked", "false");

    await page.getByRole("link", { name: "FAQ и история версий" }).click();
    await expect(page).toHaveURL(/\/settings\/faq\/?$/);
  });
});

test.describe("Classic user actions", () => {
  test.use({ baseURL: "http://127.0.0.1:3001" });

  test("sorting invoices by amount asc changes first row", async ({ page }) => {
    await page.goto("/invoices/");
    await expect(page.getByRole("heading", { name: "Счета 2026" })).toBeVisible();

    const invoiceLinks = page.locator('a[href^="/invoices/"]');
    const firstBefore = await invoiceLinks.first().innerText();

    await page.locator("#invoice-sort-ai").selectOption("amount_asc");
    await expect(page.locator("#invoice-sort-ai")).toHaveValue("amount_asc");

    const firstAfter = await invoiceLinks.first().innerText();
    expect(firstAfter).not.toBe(firstBefore);
  });
});
