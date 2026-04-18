import { describe, expect, it } from "vitest";
import { maxLineRepeatCount, repetitionRatio, shouldRejectModelOutput, tokenizeWords } from "./liveAiGuards";

describe("tokenizeWords", () => {
  it("tokenizes cyrillic", () => {
    expect(tokenizeWords("Счёт №12 и оплата")).toEqual(["счёт", "12", "и", "оплата"]);
  });
});

describe("repetitionRatio", () => {
  it("is low for normal text", () => {
    const t = "По счетам за март у вас три документа, два оплачены. Рекомендую проверить остаток.";
    expect(repetitionRatio(t)).toBeLessThan(0.35);
  });

  it("is high for spammy repetition", () => {
    const words = Array.from({ length: 40 }).map(() => "да");
    const t = words.join(" ");
    expect(repetitionRatio(t)).toBeGreaterThan(0.9);
  });
});

describe("maxLineRepeatCount", () => {
  it("detects repeated lines", () => {
    const t = ["один", "один", "один", "один", "один"].join("\n");
    expect(maxLineRepeatCount(t)).toBeGreaterThanOrEqual(5);
  });
});

describe("shouldRejectModelOutput", () => {
  it("rejects empty-ish", () => {
    expect(shouldRejectModelOutput("short")).toBe(true);
  });

  it("accepts reasonable answer", () => {
    expect(
      shouldRejectModelOutput(
        "По вашему запросу: в кабинете отображаются счета за текущий период. Уточните месяц, если нужна детализация."
      )
    ).toBe(false);
  });
});
