import { expect, test } from "@playwright/test";

test.describe("PWA install banner session behavior", () => {
  test("`Позже` hides banner persistently in browser storage", async ({ browser }) => {
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.goto("/assistant/");

    const titleA = pageA.getByText("Установить Билайн.One");
    await expect(titleA).toBeVisible();
    await pageA.getByRole("button", { name: "Позже" }).click();
    await expect(titleA).toBeHidden();

    // Same browser context keeps localStorage; the banner should stay hidden after reload.
    await pageA.reload();
    await expect(pageA.getByText("Установить Билайн.One")).toBeHidden();
    await contextA.close();
  });
});
