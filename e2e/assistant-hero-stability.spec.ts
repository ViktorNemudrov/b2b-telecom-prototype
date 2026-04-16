import { expect, test } from "@playwright/test";

test("assistant hero cards keep stable height when swiping", async ({ page }) => {
  await page.goto("/assistant/");
  await page.getByRole("button", { name: "Понятно" }).click({ timeout: 8000 }).catch(() => {});

  const slot = page.getByTestId("assistant-hero-slot");
  const swiper = page.getByTestId("assistant-hero-swiper");
  await expect(slot).toBeVisible();

  const initialHeight = await slot.evaluate((el) => Math.round(el.getBoundingClientRect().height));
  expect(initialHeight).toBe(120);

  const box = await swiper.boundingBox();
  if (!box) throw new Error("Hero swiper bounding box is unavailable");

  // Swipe left to next card and verify height remains the same.
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
  await page.mouse.up();
  await page.waitForTimeout(120);

  const afterFirstSwipe = await slot.evaluate((el) => Math.round(el.getBoundingClientRect().height));
  expect(afterFirstSwipe).toBe(initialHeight);

  // Swipe left one more time to third card and verify height remains stable.
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
  await page.mouse.up();
  await page.waitForTimeout(120);

  const afterSecondSwipe = await slot.evaluate((el) => Math.round(el.getBoundingClientRect().height));
  expect(afterSecondSwipe).toBe(initialHeight);
});
