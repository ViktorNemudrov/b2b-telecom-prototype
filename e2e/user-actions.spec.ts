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

  test("assistant header: profile, feed / main / widgets, notifications", async ({ page }) => {
    await page.goto("/assistant/");
    await expect(page.getByRole("link", { name: "Профиль" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Фид" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Главный экран" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Виджеты" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Уведомления" })).toBeVisible();

    await page.getByRole("link", { name: "Виджеты" }).click();
    await expect(page).toHaveURL(/\/widgets\/?$/);
    await expect(page.getByRole("heading", { name: "Виджеты", level: 1 })).toBeVisible();
    await expect(page.getByText("Сотовая связь", { exact: true })).toBeVisible();
    await expect(page.getByText("Запись разговоров", { exact: true })).toBeVisible();
  });

  test("widgets: запись разговоров opens recordings; bottom nav switches tabs", async ({ page }) => {
    await page.goto("/widgets/");
    await page.getByRole("button", { name: /Запись разговоров/i }).click();
    await expect(page).toHaveURL(/\/call-recordings\/?$/);
    await expect(page.getByRole("heading", { name: "Записи разговоров", level: 1 })).toBeVisible();

    await page.goto("/widgets/");
    await page.getByRole("link", { name: "Документы" }).click();
    await expect(page).toHaveURL(/\/documents\/?$/);
    await expect(page.getByRole("heading", { name: "Документы", level: 1 })).toBeVisible();

    await page.getByRole("link", { name: "Поддержка" }).click();
    await expect(page).toHaveURL(/\/support\/?$/);
    await expect(page.getByRole("heading", { name: "Поддержка", level: 1 })).toBeVisible();

    await page.getByRole("link", { name: "Главная" }).click();
    await expect(page).toHaveURL(/\/widgets\/?$/);
  });

  test("events feed shows title and daily report in stream", async ({ page }) => {
    await page.goto("/events/");
    await expect(page.getByRole("heading", { name: "Лента событий", level: 1 })).toBeVisible();
    await expect(page.getByText("Ежедневный отчет", { exact: true })).toBeVisible();
  });

  test("events feed chips filter content", async ({ page }) => {
    await page.goto("/events/");
    await expect(page.getByRole("toolbar", { name: "Фильтры ленты" })).toBeVisible();
    await page.getByRole("button", { name: "Фильтр: советы от ассистента" }).click();
    await expect(page.getByText("Ежедневный отчет", { exact: true })).toBeVisible();
    await expect(page.getByText("Пополните пакет минут", { exact: true })).toBeVisible();
    await expect(page.getByText("Активные обращения", { exact: true })).toBeHidden();
    await page.getByRole("button", { name: "Фильтр: советы от ассистента" }).click();
    await expect(page.getByText("Активные обращения", { exact: true })).toBeVisible();
  });

  test("customization screen shows Classic toggles for Feed, Widgets and widgets screen", async ({ page }) => {
    await page.goto("/settings/customization/");
    await expect(page.getByText("Classic навбар: иконка Фид", { exact: true })).toBeVisible();
    await expect(page.getByText("Classic навбар: иконка Виджеты", { exact: true })).toBeVisible();
    await expect(page.getByText("Виджеты: карточка «Запись разговоров»", { exact: true })).toBeVisible();
    await expect(page.getByText("Виджеты: нижнее меню «Документы»", { exact: true })).toBeVisible();
  });

  test("кастомизация: мок карточки записей отменяет переход на экран записей", async ({ page }) => {
    await page.goto("/settings/customization/");
    const recMock = page.getByRole("switch", {
      name: /Виджеты: карточка «Запись разговоров».*мок/i
    });
    await expect(recMock).toHaveAttribute("aria-checked", "false");
    await recMock.click();
    await expect(recMock).toHaveAttribute("aria-checked", "true");
    await page.goto("/widgets/");
    await page.getByTestId("widgets-product-recordings").click();
    await expect(page).toHaveURL(/\/widgets\/?$/);
  });

  test("записи разговоров: Назад возвращает на виджеты после перехода с виджетов", async ({ page }) => {
    await page.goto("/widgets/");
    await page.getByTestId("widgets-product-recordings").click();
    await expect(page).toHaveURL(/\/call-recordings\/?$/);
    await page.getByRole("button", { name: "Назад" }).click();
    await expect(page).toHaveURL(/\/widgets\/?$/);
  });

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
