import { describe, expect, it } from "vitest";
import { detectIntent, listIntentCapabilities } from "./chatIntentRegistry";

describe("chatIntentRegistry", () => {
  it("detects known intent", () => {
    expect(detectIntent("какая доля неоплаченных счетов")).toBe("analytics_unpaid_share");
  });

  it("returns null for unknown prompt", () => {
    expect(detectIntent("абвгд")).toBeNull();
  });

  it("returns non-empty capabilities list", () => {
    const caps = listIntentCapabilities();
    expect(caps.length).toBeGreaterThan(5);
  });

  it("detects profanity for chmo", () => {
    expect(detectIntent("ты чмо")).toBe("profanity");
  });

  it("detects invoice month intent", () => {
    expect(detectIntent("счета в январе")).toBe("analytics_invoice_month");
  });
});
