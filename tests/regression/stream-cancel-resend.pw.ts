import { expect, test } from "@playwright/test";

test("regression: cancel stream and resend works", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __E2E_ASSISTANT_DELAY_MS: number }).__E2E_ASSISTANT_DELAY_MS = 5000;
    window.localStorage.setItem("pwa-install-dismissed", "1");
  });
  await page.goto("/assistant/");

  const input = page.getByTestId("assistant-chat-input");
  await input.fill("__E2E_SLOW__");
  await input.press("Enter");

  await expect(page.getByTestId("assistant-reply-pending")).toBeVisible();
  await page.getByTestId("assistant-cancel-reply").click();
  await expect(page.getByTestId("assistant-reply-pending")).toBeHidden();

  await input.fill("покажи неоплаченные счета");
  await input.press("Enter");
  await expect(page.getByText("Неоплаченные счета", { exact: true })).toBeVisible({ timeout: 15_000 });
});
