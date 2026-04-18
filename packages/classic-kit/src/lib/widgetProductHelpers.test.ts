import { describe, expect, it } from "vitest";
import { isCallRecordingProductLabel } from "./widgetProductHelpers";

describe("isCallRecordingProductLabel", () => {
  it("matches subscription mock title", () => {
    expect(isCallRecordingProductLabel("Запись разговоров")).toBe(true);
  });

  it("matches alternate wording", () => {
    expect(isCallRecordingProductLabel("Запись звонков")).toBe(true);
  });

  it("rejects other products", () => {
    expect(isCallRecordingProductLabel("Сотовая связь")).toBe(false);
    expect(isCallRecordingProductLabel("Секретарь")).toBe(false);
  });
});
