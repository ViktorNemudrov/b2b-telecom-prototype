import { expect, test } from "@playwright/test";

test.describe("AI-first user actions", () => {
  test("keyboard send + click navigation to invoice detail", async ({ page }) => {
    await page.goto("/assistant/");

    const chatInput = page.getByLabel("Поле ввода");
    await chatInput.fill("покажи неоплаченные счета");
    await chatInput.press("Enter");

    await expect(page.getByText("Неоплаченные счета", { exact: true })).toBeVisible();

    const firstUnpaidRow = page.getByRole("button", { name: /Не оплачен/ }).first();
    await expect(firstUnpaidRow).toBeVisible();
    await firstUnpaidRow.scrollIntoViewIfNeeded();
    await Promise.all([page.waitForURL(/\/invoices\/.+\/?$/, { timeout: 15_000 }), firstUnpaidRow.click()]);
    await expect(page.getByText("Скачать PDF", { exact: true })).toBeVisible();
  });

  test("settings interactions: toggle notifications switch", async ({ page }) => {
    await page.goto("/settings/");

    const notificationsSwitch = page.getByRole("switch", { name: "Уведомления" });
    await expect(notificationsSwitch).toHaveAttribute("aria-checked", "true");
    await notificationsSwitch.click();
    await expect(notificationsSwitch).toHaveAttribute("aria-checked", "false");
  });
});

test.describe("Classic user actions", () => {
  test.use({ baseURL: "http://127.0.0.1:3001" });

  test("assistant header: profile, main / widgets, notifications", async ({ page }) => {
    await page.goto("/assistant/");
    await expect(page.getByRole("link", { name: "Профиль" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Главный экран" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Виджеты" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Уведомления" })).toBeVisible();

    await page.getByRole("link", { name: "Виджеты" }).click();
    await expect(page).toHaveURL(/\/widgets\/?$/);
    await expect(page.getByText("Связь для бизнеса", { exact: true })).toBeVisible();
    await expect(page.getByText(/Записи разговоров/)).toBeVisible();
  });

  test("assistant: horizontal swipe navigates between main / widgets without navbar tap first", async ({
    page
  }) => {
    await page.goto("/assistant/");
    await page.getByTestId("classic-assistant-nav-swipe-root").waitFor({ state: "attached", timeout: 30_000 });

    await page.evaluate(() => {
      const root = document.querySelector('[data-testid="classic-assistant-nav-swipe-root"]');
      if (!root) throw new Error("classic-assistant-nav-swipe-root missing");
      const startX = 220;
      const y = 420;
      const endX = 100;
      const pid = 44;
      root.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          clientX: startX,
          clientY: y,
          pointerId: pid,
          pointerType: "touch",
          isPrimary: true
        })
      );
      root.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          cancelable: true,
          clientX: endX,
          clientY: y,
          pointerId: pid,
          pointerType: "touch",
          isPrimary: true
        })
      );
    });
    await expect(page).toHaveURL(/\/widgets\/?$/);
  });

  test("widgets: запись разговоров opens communication; bottom nav switches tabs", async ({ page }) => {
    await page.goto("/widgets/");
    await page.getByTestId("widgets-recordings-card").click();
    await expect(page).toHaveURL(/\/communication\/?$/);
    await expect(page.getByRole("heading", { name: "Коммуникация", level: 1 })).toBeVisible();

    await page.goto("/widgets/");
    await page.getByRole("link", { name: "Документы" }).click();
    await expect(page).toHaveURL(/\/widgets\/?$/);
    await expect(page.getByTestId("classic-documents-sheet")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Документы", level: 1 })).toBeVisible();

    await page.getByTestId("documents-tile-support").click();
    await expect(page).toHaveURL(/\/support\/?$/);
    await expect(page.getByRole("heading", { name: "Поддержка", level: 1 })).toBeVisible();

    await page.getByRole("link", { name: "Главная" }).click();
    await expect(page).toHaveURL(/\/widgets\/?$/);
  });

  test("скрытая лента событий: /events/ перенаправляет на ассистента", async ({ page }) => {
    await page.goto("/events/");
    await expect(page).toHaveURL(/\/assistant\/?$/);
    await expect(page.getByRole("link", { name: "Главный экран" })).toBeVisible();
  });

  test("customization screen shows Classic toggles for Feed, Widgets and widgets screen", async ({ page }) => {
    await page.goto("/settings/customization/");
    await expect(page.getByText("Classic навбар: иконка Фид", { exact: true })).toBeVisible();
    await expect(page.getByText("Classic навбар: иконка Виджеты", { exact: true })).toBeVisible();
    await expect(page.getByText("Виджеты: кнопка «Добавить новый продукт»", { exact: true })).toBeVisible();
    await expect(page.getByText("Виджеты: кнопка «Помощник»", { exact: true })).toBeVisible();
    await expect(page.getByText("Виджеты: карточка «Запись разговоров»", { exact: true })).toBeVisible();
    await expect(page.getByText("Виджеты: нижнее меню «Документы»", { exact: true })).toBeVisible();
  });

  test("FAQ contains latest Classic release notes", async ({ page }) => {
    await page.goto("/settings/faq/");
    await expect(page.getByRole("heading", { name: "FAQ и история версий" })).toBeVisible();
    await expect(page.getByText("v.0.2.77", { exact: true })).toBeVisible();
    await expect(page.getByText("PWA Classic: окно установки показывается один раз за сессию страницы", { exact: false })).toBeVisible();
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
    await page.getByTestId("widgets-recordings-card").click();
    await expect(page).toHaveURL(/\/widgets\/?$/);
  });

  test("ассистент: Назад из чата возвращает на главный экран ассистента", async ({ page }) => {
    await page.goto("/assistant/");
    const input = page.getByTestId("assistant-chat-input");
    await input.fill("Мои звонки");
    await input.press("Enter");
    await expect(page.getByRole("button", { name: "Назад" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "Назад" }).click();
    await expect(page).toHaveURL(/\/assistant\/?$/);
    await expect(page.getByRole("link", { name: "Профиль" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Главный экран" })).toBeVisible();
  });

  test("ассистент: Назад после чипа остаётся на главном экране, если зашли с виджетов", async ({ page }) => {
    await page.goto("/widgets/");
    await page.getByRole("link", { name: "Главный экран" }).click();
    await expect(page).toHaveURL(/\/assistant/);
    await page.getByRole("button", { name: "Что ты умеешь" }).click();
    await expect(page.getByRole("button", { name: "Назад" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "Назад" }).click();
    await expect(page).toHaveURL(/\/assistant/);
    await expect(page.getByRole("heading", { name: "Ваш бизнес ассистент" })).toBeVisible();
  });

  test("ассистент: Назад после «Счета на оплату» остаётся на главном экране, если зашли с виджетов", async ({
    page
  }) => {
    await page.goto("/widgets/");
    await page.getByRole("link", { name: "Главный экран" }).click();
    await expect(page).toHaveURL(/\/assistant/);
    await page.getByRole("button", { name: "Счета на оплату" }).click();
    await expect(page.getByRole("button", { name: "Назад" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "Назад" }).click();
    await expect(page).toHaveURL(/\/assistant/);
    await expect(page.getByRole("heading", { name: "Ваш бизнес ассистент" })).toBeVisible();
  });

  test("записи разговоров: Назад возвращает на виджеты после перехода с виджетов", async ({ page }) => {
    await page.goto("/widgets/");
    await page.getByTestId("widgets-recordings-card").click();
    await expect(page).toHaveURL(/\/communication\/?$/);
    await page.getByRole("button", { name: "Назад" }).click();
    await expect(page).toHaveURL(/\/widgets\/?$/);
  });

  test("документы: Финансы → счёт с карточкой и возвратом в финансы", async ({ page }) => {
    await page.goto("/documents/finance/");
    await expect(page.getByTestId("documents-finance-screen")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Финансы" })).toBeVisible();
    await page.getByTestId("classic-invoices-list").locator("a").first().click();
    await expect(page).toHaveURL(/\/invoices\/.+\?from=finance/);
    await expect(page.getByText("Скачать PDF", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Назад" }).click();
    await expect(page).toHaveURL(/\/documents\/finance\/?$/);
  });

  test("финансы: поиск открывает демо-шторку разработки", async ({ page }) => {
    await page.goto("/documents/finance/");
    await page.getByRole("button", { name: "Поиск по счетам" }).click();
    await expect(page.getByRole("heading", { name: "Раздел в разработке" })).toBeVisible();
    await page.getByRole("button", { name: "Понятно" }).click();
    await expect(page.getByRole("heading", { name: "Раздел в разработке" })).toBeHidden();
  });

  test("финансы: фильтр «К оплате» показывает только счета к оплате", async ({ page }) => {
    await page.goto("/documents/finance/");
    await page.getByTestId("finance-filter-pay").click();
    await expect(page.getByTestId("finance-filter-pay")).toHaveAttribute("aria-pressed", "true");
    const rows = page.getByTestId("classic-invoices-list").locator("a");
    const count = await rows.count();
    if (count === 0) {
      await expect(page.getByText(/Нет счетов по выбранному фильтру/i)).toBeVisible();
      return;
    }
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText("Оплатить");
    }
  });

  test("поддержка: блок обращений → список → карточка обращения", async ({ page }) => {
    await page.goto("/support/");
    await expect(page.getByTestId("support-appeals-card")).toBeVisible();
    await page.getByRole("link", { name: "Список обращений" }).click();
    await expect(page).toHaveURL(/\/appeals(\/|\?)/);
    await expect(page.getByRole("button", { name: "Создать обращение" })).toBeVisible();
    await page.getByRole("button", { name: "Мне не могут дозвониться" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Со стороны абонента не проходят");
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
