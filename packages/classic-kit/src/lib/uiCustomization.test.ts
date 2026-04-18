import { describe, expect, it } from "vitest";
import { __unsafe_test__sanitizeStore, customizableElements, getCustomizationButtonClasses } from "./uiCustomization";

describe("uiCustomization", () => {
  it("has non-empty customizable elements list", () => {
    expect(customizableElements.length).toBeGreaterThan(5);
  });

  it("sanitizes invalid payload to defaults", () => {
    const sanitized = __unsafe_test__sanitizeStore(null);
    for (const item of customizableElements) {
      expect(sanitized[item.id].useMock).toBe(false);
      expect(sanitized[item.id].dimmedDisabled).toBe(false);
    }
  });

  it("keeps only known keys and boolean flags", () => {
    const sanitized = __unsafe_test__sanitizeStore({
      "ai.notifications": { useMock: 1, dimmedDisabled: "yes" },
      unknown: { useMock: true, dimmedDisabled: true }
    });
    expect(sanitized["ai.notifications"].useMock).toBe(true);
    expect(sanitized["ai.notifications"].dimmedDisabled).toBe(true);
    expect((sanitized as Record<string, unknown>).unknown).toBeUndefined();
  });

  it("returns dimmed classes when disabled", () => {
    expect(getCustomizationButtonClasses(true)).toContain("pointer-events-none");
    expect(getCustomizationButtonClasses(false)).toContain("opacity-100");
  });
});
