import { describe, expect, it } from "vitest";
import { isBlockVisibleForFilter, type EventsFeedBlockKey } from "./eventsFeedFilter";

const blocks: EventsFeedBlockKey[] = [
  "dailyReport",
  "callMissed",
  "callRegular",
  "assistantAdvice",
  "tariffBalance",
  "appealsPanel",
  "appealsQuickLinks"
];

describe("eventsFeedFilter", () => {
  it("all shows every block", () => {
    for (const b of blocks) {
      expect(isBlockVisibleForFilter("all", b)).toBe(true);
    }
  });

  it("missed shows only missed call", () => {
    expect(isBlockVisibleForFilter("missed", "callMissed")).toBe(true);
    expect(isBlockVisibleForFilter("missed", "callRegular")).toBe(false);
    expect(isBlockVisibleForFilter("missed", "dailyReport")).toBe(false);
  });

  it("tips shows daily report and assistant advice", () => {
    expect(isBlockVisibleForFilter("tips", "dailyReport")).toBe(true);
    expect(isBlockVisibleForFilter("tips", "assistantAdvice")).toBe(true);
    expect(isBlockVisibleForFilter("tips", "callMissed")).toBe(false);
    expect(isBlockVisibleForFilter("tips", "tariffBalance")).toBe(false);
  });

  it("invoices shows only tariff balance card", () => {
    expect(isBlockVisibleForFilter("invoices", "tariffBalance")).toBe(true);
    expect(isBlockVisibleForFilter("invoices", "dailyReport")).toBe(false);
    expect(isBlockVisibleForFilter("invoices", "appealsPanel")).toBe(false);
  });

  it("appeals blocks only in all feed", () => {
    expect(isBlockVisibleForFilter("missed", "appealsPanel")).toBe(false);
    expect(isBlockVisibleForFilter("tips", "appealsQuickLinks")).toBe(false);
    expect(isBlockVisibleForFilter("invoices", "appealsPanel")).toBe(false);
    expect(isBlockVisibleForFilter("all", "appealsPanel")).toBe(true);
  });
});
