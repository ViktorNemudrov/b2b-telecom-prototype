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
  await expect(slot).toBeVisible();

  const readHeroSlotHeight = () =>
    page.evaluate(() => {
      const el = document.querySelector('[data-testid="assistant-hero-slot"]');
      if (!el) throw new Error("assistant-hero-slot missing");
      return Math.round(el.getBoundingClientRect().height);
    });

  const initialHeight = await readHeroSlotHeight();
  expect(initialHeight).toBe(120);

  // Prefer scrolling the carousel track (Classic horizontal slider).
  const scrolled = await slot.evaluate((el) => {
    if (el.scrollWidth <= el.clientWidth + 2) return false;
    const slideW = Math.round(el.clientWidth * 0.88);
    const stride = slideW + 12;
    el.scrollTo({ left: stride, behavior: "instant" });
    return true;
  });

  if (!scrolled) {
    // Do not drive Playwright mouse drag across the card surface: the first hero may be a full-width <button> and the gesture can synthesize a click → /call/.... Dispatch pointer events on the swiper shell so React swipe handlers run without activating the card.
    await page.evaluate(() => {
      const sw = document.querySelector('[data-testid="assistant-hero-swiper"]');
      if (!sw) throw new Error("assistant-hero-swiper missing");
      const r = sw.getBoundingClientRect();
      const y = r.top + Math.min(48, r.height * 0.22);
      const x1 = r.left + r.width * 0.82;
      const x2 = r.left + r.width * 0.18;
      const base = { bubbles: true, cancelable: true, pointerId: 1, pointerType: "mouse", isPrimary: true, button: 0 };
      sw.dispatchEvent(
        new PointerEvent("pointerdown", { ...base, clientX: x1, clientY: y, buttons: 1 })
      );
      sw.dispatchEvent(
        new PointerEvent("pointermove", { ...base, clientX: (x1 + x2) / 2, clientY: y, buttons: 1 })
      );
      sw.dispatchEvent(new PointerEvent("pointerup", { ...base, clientX: x2, clientY: y, buttons: 0 }));
    });
  }
  await page.waitForTimeout(120);

  await expect(page).toHaveURL(/\/assistant\/?(\?.*)?$/);

  const afterFirstSwipe = await readHeroSlotHeight();
  expect(afterFirstSwipe).toBe(initialHeight);
});
