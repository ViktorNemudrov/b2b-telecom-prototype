import { expect, test, type Page } from "@playwright/test";

const hasLiveKeys = Boolean(
  process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
    process.env.NEXT_PUBLIC_GROK_API_KEY ||
    process.env.NEXT_PUBLIC_GROQ_API_KEY
);

async function openAssistant(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("pwa-install-dismissed", "1");
    window.localStorage.setItem("b2b_chat_logs_v1", "[]");
  });
  await page.goto("/assistant/");
  await page.getByRole("button", { name: "Понятно" }).click({ timeout: 8000 }).catch(() => {});
}

async function sendWithEnter(page: Page, message: string) {
  const input = page.getByTestId("assistant-chat-input");
  await input.fill(message);
  await input.press("Enter");
}

test.describe("assistant AI UX", () => {
  test("pending strip appears then hides after deterministic reply", async ({ page }) => {
    await openAssistant(page);
    await sendWithEnter(page, "привет");
    await expect(page.getByTestId("assistant-reply-pending")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("И вам здравствуйте, желаю вам хорошего дня")).toBeVisible({
      timeout: 10_000
    });
    await expect(page.getByTestId("assistant-reply-pending")).toBeHidden();
  });

  test("rapid two sends: second reply wins (first in-flight superseded)", async ({ page }) => {
    await openAssistant(page);
    await sendWithEnter(page, "привет");
    await sendWithEnter(page, "покажи неоплаченные счета");
    await expect(page.getByText("привет", { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("покажи неоплаченные счета", { exact: true })).toBeVisible({
      timeout: 10_000
    });
    await expect(page.getByText("Показываю неоплаченные счета в чате.")).toBeVisible({
      timeout: 15_000
    });
  });

  test("cancel during __E2E_SLOW__ removes pending without AI bubble", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __E2E_ASSISTANT_DELAY_MS: number }).__E2E_ASSISTANT_DELAY_MS = 5000;
    });
    await openAssistant(page);
    await sendWithEnter(page, "__E2E_SLOW__");
    await expect(page.getByTestId("assistant-reply-pending")).toBeVisible({ timeout: 5000 });
    await page.getByTestId("assistant-cancel-reply").click();
    await expect(page.getByTestId("assistant-reply-pending")).toBeHidden();
    await expect(
      page.getByText("Для этого запроса нужен live AI-ответ", { exact: false })
    ).toHaveCount(0);
  });

  test("speech button: second click stops (does not restart)", async ({ page }) => {
    await page.addInitScript(() => {
      // Stub speech synthesis to make the test deterministic.
      const calls = { speak: 0, cancel: 0 };
      const synth: any = {
        speaking: false,
        paused: false,
        cancel: () => {
          calls.cancel += 1;
          synth.speaking = false;
          synth.paused = false;
        },
        speak: () => {
          calls.speak += 1;
          synth.speaking = true;
          synth.paused = false;
        }
      };
      (window as any).__speechCalls = calls;
      Object.defineProperty(window, "speechSynthesis", { value: synth });
      (window as any).SpeechSynthesisUtterance = function (text: string) {
        (this as any).text = text;
        (this as any).lang = "";
      };
    });

    await openAssistant(page);
    await sendWithEnter(page, "привет");

    const speakButton = page.getByRole("button", { name: /Озвучить|Остановить озвучку/ }).first();

    await speakButton.click();
    await expect
      .poll(() => page.evaluate(() => (window as any).__speechCalls?.speak ?? 0))
      .toBe(1);
    await expect
      .poll(() => page.evaluate(() => (window as any).__speechCalls?.cancel ?? 0))
      .toBe(1);

    // Second click should stop, not restart the utterance.
    await speakButton.click();
    await expect
      .poll(() => page.evaluate(() => (window as any).__speechCalls?.speak ?? 0))
      .toBe(1);
    await expect
      .poll(() => page.evaluate(() => (window as any).__speechCalls?.cancel ?? 0))
      .toBe(2);
  });

  test("AI bubble shows russian source label", async ({ page }) => {
    await openAssistant(page);

    await sendWithEnter(page, "покажи неоплаченные счета");
    await expect(page.getByText("Показываю неоплаченные счета в чате.")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("детерминированный сценарий").last()).toBeVisible({ timeout: 10_000 });

    await sendWithEnter(page, "привет");
    await expect(page.getByText("И вам здравствуйте, желаю вам хорошего дня")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("замоканный ответ").last()).toBeVisible({ timeout: 10_000 });
  });

  test("AI bubble shows live provider source label (soft check)", async ({ page }) => {
    test.skip(!hasLiveKeys, "Live provider keys are not set for Playwright environment");
    await openAssistant(page);

    await sendWithEnter(page, "расскажи короткий анекдот про программиста");

    await expect(
      page.getByText(/ответ от (Grok\/xAI|OpenRouter|Groq)( \(без строгой верификации\))?/)
    ).toBeVisible({ timeout: 20_000 });
  });
});
