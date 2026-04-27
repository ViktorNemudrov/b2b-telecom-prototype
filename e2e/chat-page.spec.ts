import { expect, test } from "@playwright/test";

/**
 * /chat uses useLLMChat (Groq stream). Regression: empty stream must not show endless «печатает…»;
 * without keys, chat still shows a short demo fallback (no endless «печатает…»).
 */
test.describe("standalone /chat page (Classic)", () => {
  test("renders standalone chat controls", async ({ page }) => {
    await page.goto("http://127.0.0.1:3001/chat");
    const input = page.getByPlaceholder("Спросите что-нибудь...");
    const sendButton = page.getByRole("button", { name: "Отправить" });
    await expect(input).toBeVisible();
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeDisabled();
  });

  test("assistant pending strip clears after superseded slow request", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __E2E_ASSISTANT_DELAY_MS: number }).__E2E_ASSISTANT_DELAY_MS = 6000;
      window.localStorage.setItem("b2b_pwa_install_dismissed_v1", "1");
    });
    await page.goto("http://127.0.0.1:3001/assistant/");
    await page.getByRole("button", { name: "Понятно" }).click({ timeout: 8000 }).catch(() => {});

    const input = page.getByTestId("assistant-chat-input");
    await input.fill("__E2E_SLOW__");
    await input.press("Enter");
    await expect(page.getByTestId("assistant-reply-pending")).toBeVisible({ timeout: 5000 });

    await input.fill("привет");
    await input.press("Enter");

    await expect(page.getByText("И вам здравствуйте, желаю вам хорошего дня")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("assistant-reply-pending")).toBeHidden({ timeout: 10000 });
  });
});
