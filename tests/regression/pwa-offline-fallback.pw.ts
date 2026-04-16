import { expect, test } from "@playwright/test";

test("regression: sw contains offline fallback handler", async ({ request }) => {
  const sw = await request.get("http://127.0.0.1:3000/sw.js");
  expect(sw.ok()).toBeTruthy();
  const source = await sw.text();
  expect(source).toContain("Offline mode");
});
