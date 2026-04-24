import { expect, test } from "@playwright/test";

/**
 * /chat uses useLLMChat (Groq stream). Regression: empty stream must not show endless «печатает…»;
 * without keys, assistant must still reply with no-keys copy.
 */
test.describe("standalone /chat page (Classic)", () => {
  test("shows a non-empty assistant reply after sending a question", async ({ page }) => {
    await page.goto("http://127.0.0.1:3001/chat");
    const input = page.getByPlaceholder("Спросите что-нибудь...");
    await input.click();
    await input.type("Чем занимаешься?");
    await input.press("Enter");
    await expect(page.getByText("Чем занимаешься?", { exact: true })).toBeVisible();
    await expect(page.getByText("печатает...", { exact: true })).toBeHidden({ timeout: 25_000 });
    await expect(page.getByTestId("chat-message-bubble")).toHaveCount(2, { timeout: 15_000 });
    const texts = await page.getByTestId("chat-message-bubble").allTextContents();
    expect(texts.some((t) => t.includes("Чем занимаешься?"))).toBeTruthy();
    expect(
      texts.some(
        (t) =>
          !t.includes("Чем занимаешься?") &&
          (t.trim().length > 15 || /Ошибка:|ИИ не подключён|NEXT_PUBLIC/i.test(t))
      )
    ).toBeTruthy();
  });
});
