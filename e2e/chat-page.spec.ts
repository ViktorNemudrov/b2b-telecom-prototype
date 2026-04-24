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
});
