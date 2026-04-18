import { describe, expect, it } from "vitest";
import { resolveProductTap } from "./widgetTapActions";

describe("resolveProductTap", () => {
  const off = { useMock: false, dimmedDisabled: false };

  it("navigates to recordings when customization allows", () => {
    expect(resolveProductTap("Запись разговоров", off)).toEqual({ kind: "navigate-recordings" });
  });

  it("stubs recordings when useMock", () => {
    expect(resolveProductTap("Запись разговоров", { useMock: true, dimmedDisabled: false })).toEqual({
      kind: "stub",
      message: "Записи разговоров (мок из кастомизации)."
    });
  });

  it("does nothing when recordings card is dimmed", () => {
    expect(resolveProductTap("Запись разговоров", { useMock: false, dimmedDisabled: true })).toEqual({
      kind: "none"
    });
  });

  it("stubs other products", () => {
    expect(resolveProductTap("Секретарь", off)).toEqual({
      kind: "stub",
      message: "Продукт «Секретарь» в разработке."
    });
  });
});
