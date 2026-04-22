import { expect, test } from "@playwright/test";

/**
 * Classic onboarding mobile regression (http://127.0.0.1:3001/onboarding/).
 * Проекты: mobile-android-chrome, mobile-ios-safari.
 */
test.use({ baseURL: "http://127.0.0.1:3001" });

test("Classic mobile: онбординг помещается в экран без вертикального скролла", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile-"), "Запускается только в мобильных проектах");

  await page.goto("/onboarding/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: "Закрыть онбординг" })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Следующий экран" })).toBeVisible({ timeout: 15_000 });

  const metrics = await page.evaluate(() => {
    const activeNextButton = document.querySelector<HTMLButtonElement>(
      '.pointer-events-auto button[aria-label="Следующий экран"]'
    );
    const rect = activeNextButton?.getBoundingClientRect();
    return {
      viewportHeight: window.visualViewport?.height ?? window.innerHeight,
      buttonBottom: rect ? rect.bottom : null
    };
  });

  expect(metrics.buttonBottom).not.toBeNull();
  expect(metrics.buttonBottom!).toBeLessThanOrEqual(metrics.viewportHeight + 1);

  const scrollState = await page.evaluate(() => {
    const before = window.scrollY;
    window.scrollTo(0, 10_000);
    const after = window.scrollY;
    window.scrollTo(0, before);
    return { before, after };
  });

  expect(scrollState.after).toBeLessThanOrEqual(scrollState.before + 1);
});
