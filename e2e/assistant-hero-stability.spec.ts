import { expect, test } from "@playwright/test";

test("assistant hero cards keep stable height when swiping", async ({ page, isMobile }) => {
  // Pointer swipe is asserted via synthetic mouse events; mobile projects emulate touch and can drop the hero subtree mid-gesture.
  test.skip(isMobile, "Hero slot height: covered on desktop; touch emulation is flaky for Framer exit transitions.");

  await page.addInitScript(() => {
    window.localStorage.setItem("b2b_pwa_install_dismissed_v1", "1");
    window.localStorage.setItem("b2b_chat_logs_v1", "[]");
  });
  await page.goto("/assistant/");
  await page.getByTestId("assistant-hero-slot").waitFor({ state: "visible", timeout: 20_000 });

  const slot = page.getByTestId("assistant-hero-slot");
  const swiper = page.getByTestId("assistant-hero-swiper");
  await expect(slot).toBeVisible();

  const readHeroSlotHeight = () =>
    page.evaluate(() => {
      const el = document.querySelector('[data-testid="assistant-hero-slot"]');
      if (!el) throw new Error("assistant-hero-slot missing");
      return Math.round(el.getBoundingClientRect().height);
    });

  const initialHeight = await readHeroSlotHeight();
  expect(initialHeight).toBe(120);

  const box = await swiper.boundingBox();
  if (!box) throw new Error("Hero swiper bounding box is unavailable");

  // Swipe left to next card and verify height remains the same.
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
  await page.mouse.up();
  await page.waitForTimeout(120);

  const afterFirstSwipe = await readHeroSlotHeight();
  expect(afterFirstSwipe).toBe(initialHeight);
});
