import { expect, test, type Page } from "@playwright/test";

// Один dev-сервер на порт 3000: параллельные страницы дают гонки навигации в чате.
test.describe.configure({ mode: "serial" });

async function openAssistant(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("b2b_pwa_install_dismissed_v1", "1");
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
  await expect(page.getByText("Неоплаченные счета", { exact: true })).toBeVisible();

  await sendMessage(page, "расскажи что-нибудь про квантовый отжиг");
  // При настроенных ключах live ответ может пройти; иначе — запасной сценарий.
  // .first() — избегаем strict mode, если видны и текст ответа, и подпись «ответ от …».
  await expect(
    page
      .getByText("В демо-версии ИИ не подключены.", { exact: false })
      .or(page.getByText(/ответ от /))
      .first()
  ).toBeVisible({ timeout: 25_000 });
});

test("assistant chip Обращения shows appeals summary in chat without leaving assistant", async ({ page }) => {
  await openAssistant(page);
  await page.getByRole("button", { name: "Обращения" }).click();
  await expect(page.getByTestId("appeals-summary-widget")).toBeVisible({ timeout: 25_000 });
  await expect(page).toHaveURL(/\/assistant\/?$/);
});

test("assistant navigates to appeals from deterministic chat intent", async ({ page }) => {
  await openAssistant(page);
  await sendMessage(page, "активные обращения");
  await expect(page.getByText("Активные обращения", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Все обращения" }).click();
  await expect(page).toHaveURL(/\/appeals(\/|\?)/, { timeout: 15_000 });
  await expect(page.getByText("Сейчас у вас:", { exact: false })).toBeVisible();
});

test("assistant opens appeal detail from chat widget via open query", async ({ page }) => {
  await openAssistant(page);
  await sendMessage(page, "активные обращения");
  const widget = page.getByTestId("appeals-summary-widget");
  await expect(widget).toBeVisible({ timeout: 25_000 });
  const appealButton = widget.getByRole("button", { name: /Мне не могут дозвониться/ }).first();
  await appealButton.scrollIntoViewIfNeeded();
  await Promise.all([page.waitForURL(/\/appeals(\/|\?)/, { timeout: 15_000 }), appealButton.click()]);
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Со стороны абонента не проходят", { exact: false })).toBeVisible();
});

test("assistant opens invoice detail from unpaid widget", async ({ page }) => {
  await openAssistant(page);
  await sendMessage(page, "покажи неоплаченные счета");
  await page.getByText("Неоплаченные счета", { exact: true }).waitFor();
  const firstUnpaidRow = page.getByRole("button", { name: /Не оплачен/ }).first();
  await expect(firstUnpaidRow).toBeVisible();
  await firstUnpaidRow.scrollIntoViewIfNeeded();
  await Promise.all([
    page.waitForURL(/\/invoices\/.+\/?$/, { timeout: 15_000 }),
    firstUnpaidRow.click()
  ]);
  await expect(page.getByRole("button", { name: "Скачать PDF", exact: true })).toBeVisible();
});
