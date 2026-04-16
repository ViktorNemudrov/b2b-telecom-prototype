import { expect, test } from "@playwright/test";

async function dispatchBeforeInstallPrompt(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    localStorage.removeItem("pwa-install-dismissed");
    (window as Window & { __pwaPromptCalled?: boolean }).__pwaPromptCalled = false;

    const installEvent = new Event("beforeinstallprompt") as Event & {
      prompt?: () => Promise<void>;
      userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
    };
    installEvent.prompt = () => {
      (window as Window & { __pwaPromptCalled?: boolean }).__pwaPromptCalled = true;
      return Promise.resolve();
    };
    installEvent.userChoice = Promise.resolve({ outcome: "accepted", platform: "web" });

    window.dispatchEvent(installEvent);
  });
}

test.describe("PWA install user flows", () => {
  test("AI-first: user can dismiss passive install hint", async ({ page }) => {
    await page.goto("/assistant/");

    await expect(page.getByText("Установить Билайн.One")).toBeVisible();
    await page.getByRole("button", { name: "Понятно" }).click();
    await expect(page.getByText("Установить Билайн.One")).toBeHidden();
  });

  test("AI-first: user accepts install through beforeinstallprompt", async ({ page }) => {
    await page.goto("/assistant/");
    await page.waitForTimeout(600);
    await dispatchBeforeInstallPrompt(page);
    await page.waitForTimeout(200);
    await dispatchBeforeInstallPrompt(page);

    const installButton = page.getByRole("button", { name: "Установить" });
    await expect(installButton).toBeVisible({ timeout: 10_000 });
    await installButton.click();
    await expect(page.getByRole("button", { name: "Установить" })).not.toBeVisible();
    await expect(
      page.evaluate(() => (window as Window & { __pwaPromptCalled?: boolean }).__pwaPromptCalled === true)
    ).resolves.toBe(true);
  });

  test("Classic: manifest and service worker are reachable", async ({ request }) => {
    const manifest = await request.get("http://127.0.0.1:3001/manifest.webmanifest");
    expect(manifest.ok()).toBeTruthy();

    const sw = await request.get("http://127.0.0.1:3001/sw.js");
    expect(sw.ok()).toBeTruthy();
  });
});
