import { describe, expect, it } from "vitest";
import { buildLiveAiMessages, extractAssistantText, extractGeminiText } from "./liveAi";

describe("extractGeminiText", () => {
  it("reads first candidate text parts", () => {
    expect(
      extractGeminiText({
        candidates: [{ content: { parts: [{ text: "Привет" }] } }]
      })
    ).toBe("Привет");
  });

  it("returns null when no candidates", () => {
    expect(extractGeminiText({ candidates: [] })).toBeNull();
  });
});

describe("extractAssistantText", () => {
  it("reads string content", () => {
    expect(extractAssistantText({ choices: [{ message: { content: "Привет" } }] })).toBe("Привет");
  });

  it("reads structured content", () => {
    expect(
      extractAssistantText({
        choices: [{ message: { content: [{ type: "text", text: "Первый" }, { type: "text", text: "второй" }] } }]
      })
    ).toBe("Первый второй");
  });

  it("returns null for missing content", () => {
    expect(extractAssistantText({ choices: [] })).toBeNull();
  });
});

describe("buildLiveAiMessages", () => {
  it("adds system preface and prompt", () => {
    const messages = buildLiveAiMessages("Покажи счета", [{ role: "assistant", content: "Ок" }]);
    expect(messages[0]?.role).toBe("system");
    expect(messages[messages.length - 1]).toEqual({ role: "user", content: "Покажи счета" });
  });

  it("limits history to last 6 messages", () => {
    const history = Array.from({ length: 10 }).map((_, i) => ({
      role: (i % 2 ? "assistant" : "user") as "user" | "assistant",
      content: `m${i}`
    }));
    const messages = buildLiveAiMessages("Q", history);
    expect(messages).toHaveLength(8);
    expect(messages[1]?.content).toBe("m4");
  });
});
