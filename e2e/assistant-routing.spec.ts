import { expect, test, type Page } from "@playwright/test";

async function openAssistant(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("pwa-install-dismissed", "1");
    window.localStorage.setItem("b2b_chat_logs_v1", "[]");
  });
  await page.goto("/assistant/");
  await page.getByRole("button", { name: "Понятно" }).click({ timeout: 8000 }).catch(() => {});
}

async function sendMessage(page: Page, message: string) {
  const input = page.getByLabel("Поле ввода");
  await input.fill(message);
  await input.press("Enter");
}

test("assistant routing smoke: special -> deterministic -> live/fallback", async ({ page }) => {
  await openAssistant(page);

  await sendMessage(page, "привет");
  await expect(page.getByText("И вам здравствуйте, желаю вам хорошего дня")).toBeVisible();

  await sendMessage(page, "покажи неоплаченные счета");
  await expect(page.getByText("Показываю неоплаченные счета в чате.")).toBeVisible();
  await expect(page.getByText("Неоплаченные счета", { exact: true })).toBeVisible();

  await sendMessage(page, "расскажи что-нибудь про квантовый отжиг");
  await expect(
    page.getByText("Для этого запроса нужен live AI-ответ. Подключите `NEXT_PUBLIC_OPENROUTER_API_KEY`, и я передам вопрос в модель.")
  ).toBeVisible();
});

test("assistant navigates to appeals from deterministic chat intent", async ({ page }) => {
  await openAssistant(page);
  await sendMessage(page, "активные обращения");
  await expect(page).toHaveURL(/\/appeals\/?$/, { timeout: 15_000 });
  await expect(page.getByText("Сейчас у вас:", { exact: false })).toBeVisible();
});

test("assistant opens invoice detail from unpaid widget", async ({ page }) => {
  await openAssistant(page);
  await sendMessage(page, "покажи неоплаченные счета");
  await page.getByText("Неоплаченные счета", { exact: true }).waitFor();
  const firstInvoiceButton = page.locator("button", { hasText: "₽" }).first();
  await firstInvoiceButton.scrollIntoViewIfNeeded();
  await firstInvoiceButton.click();
  await expect(page).toHaveURL(/\/invoices\/.+\/?$/, { timeout: 10_000 });
  await expect(page.getByText("Скачать PDF", { exact: true })).toBeVisible();
});
