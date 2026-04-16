import { describe, expect, it } from "vitest";
import { safeParseLiveUserPrompt } from "../../packages/shared/src/lib/liveUserPromptSchema";

describe("regression: zod validation", () => {
  it("accepts valid prompt", () => {
    const result = safeParseLiveUserPrompt("Покажи неоплаченные счета");
    expect(result.ok).toBe(true);
  });

  it("rejects empty prompt", () => {
    const result = safeParseLiveUserPrompt("   ");
    expect(result.ok).toBe(false);
  });
});
