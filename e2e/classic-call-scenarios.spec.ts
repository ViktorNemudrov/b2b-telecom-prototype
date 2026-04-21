import { expect, test, type Page } from "@playwright/test";

/**
 * Только приложение Classic (http://127.0.0.1:3001).
 * Проект Playwright: desktop-chromium-classic (см. playwright.config.ts).
 * AI-first (3000) и ai-kit не затрагиваются.
 *
 * Если в браузере «Server Error» / Cannot find module … в `.next` — удалите `apps/classic/.next`
 * и перезапустите `npm run dev:classic`.
 */
test.describe.configure({ mode: "serial", timeout: 120_000 });

async function openClassicAssistant(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("b2b_pwa_install_dismissed_v1", "1");
    window.localStorage.setItem("b2b_chat_logs_v1", "[]");
  });
  await page.goto("/assistant/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Понятно" }).click({ timeout: 8000 }).catch(() => {});
  await page.getByTestId("assistant-chat-input").waitFor({ state: "visible", timeout: 90_000 });
  await expect(page.getByText("Пропущенные звонки", { exact: true }).first()).toBeVisible({ timeout: 60_000 });
}

test("Classic: chip «Пропущенные звонки» открывает ответ в чате", async ({ page }) => {
  await openClassicAssistant(page);
  await page.locator("button").filter({ hasText: /^Пропущенные звонки/ }).click();
  await expect(page.getByText("Пропущенные в чате", { exact: true })).toBeVisible({ timeout: 25_000 });
});

test("Classic: «звонки за неделю» показывает сводку в чате", async ({ page }) => {
  await openClassicAssistant(page);
  await page.getByTestId("assistant-chat-input").fill("звонки за неделю");
  await page.getByTestId("assistant-chat-input").press("Enter");
  await expect(page.getByText("Звонки за неделю", { exact: true })).toBeVisible({ timeout: 25_000 });
});

test("Classic: чип «Счета на оплату» показывает сводку счетов в чате", async ({ page }) => {
  await openClassicAssistant(page);
  await page.locator("button").filter({ hasText: /^Счета на оплату/ }).click();
  await expect(page.getByTestId("invoices-summary-widget")).toBeVisible({ timeout: 25_000 });
  await expect(page.getByText("Всего", { exact: true })).toBeVisible();
});

test("Classic: «Мои счета» в чате показывает виджет сводки", async ({ page }) => {
  await openClassicAssistant(page);
  await page.getByTestId("assistant-chat-input").fill("Мои счета");
  await page.getByTestId("assistant-chat-input").press("Enter");
  await expect(page.getByTestId("invoices-summary-widget")).toBeVisible({ timeout: 25_000 });
});

test("Classic: «Мои обращения» остаётся в чате без перехода на страницу", async ({ page }) => {
  await openClassicAssistant(page);
  await page.getByTestId("assistant-chat-input").fill("Мои обращения");
  await page.getByTestId("assistant-chat-input").press("Enter");
  await expect(page.getByText("Активные обращения", { exact: true })).toBeVisible({ timeout: 25_000 });
  await expect(page).toHaveURL(/\/assistant\/?$/, { timeout: 15_000 });
});

test("Classic: карточка пропущенного (2-й слайд hero) ведёт в карточку звонка", async ({ page }) => {
  await openClassicAssistant(page);
  await page.getByTestId("assistant-hero-swiper").waitFor({ state: "visible", timeout: 30_000 });
  const slot = page.getByTestId("assistant-hero-slot");
  await slot.evaluate((el) => {
    const slideW = Math.round(el.clientWidth * 0.88);
    el.scrollTo({ left: slideW + 12, behavior: "instant" });
  });
  await page.getByRole("button", { name: /Доставка офисной техники/ }).click();
  await expect(page).toHaveURL(/\/call\/c1\/?$/, { timeout: 20_000 });
});
