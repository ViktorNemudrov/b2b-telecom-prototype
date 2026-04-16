import { expect, test } from "@playwright/test";

test.describe("PWA install banner session behavior", () => {
  test("`Понятно` hides banner only in current session", async ({ browser }) => {
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.goto("/assistant/");

    const titleA = pageA.getByText("Установить Билайн.One");
    await expect(titleA).toBeVisible();
    await pageA.getByRole("button", { name: "Понятно" }).click();
    await expect(titleA).toBeHidden();
    await contextA.close();

    // A brand new browser context simulates a new session.
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await pageB.goto("/assistant/");
    await expect(pageB.getByText("Установить Билайн.One")).toBeVisible();
    await contextB.close();
  });
});
