import { describe, expect, it } from "vitest";
import { shouldRejectModelOutput } from "../../packages/ai-kit/src/lib/liveAiGuards";

describe("regression: repetition loop detection", () => {
  it("rejects loop-like repetitive output", () => {
    const repetitive = "оплата оплата оплата оплата оплата оплата";
    expect(shouldRejectModelOutput(repetitive)).toBe(true);
  });

  it("accepts normal output", () => {
    const normal = "Сформируйте платеж по счету №42 до конца дня.";
    expect(shouldRejectModelOutput(normal)).toBe(false);
  });
});
