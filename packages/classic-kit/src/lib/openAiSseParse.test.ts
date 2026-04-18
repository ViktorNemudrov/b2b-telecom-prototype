import { describe, expect, it } from "vitest";
import { parseOpenAiSseLine } from "./openAiSseParse";

describe("parseOpenAiSseLine", () => {
  it("parses standard data line with delta", () => {
    const line = 'data: {"choices":[{"delta":{"content":"Привет"}}]}';
    expect(parseOpenAiSseLine(line)).toEqual({ delta: "Привет" });
  });

  it("handles CRLF line endings from Groq/OpenAI", () => {
    const line = 'data: {"choices":[{"delta":{"content":"x"}}]}\r';
    expect(parseOpenAiSseLine(line)).toEqual({ delta: "x" });
  });

  it("returns done for [DONE]", () => {
    expect(parseOpenAiSseLine("data: [DONE]")).toBe("done");
  });

  it("returns null for role-only delta", () => {
    const line = 'data: {"choices":[{"delta":{"role":"assistant"}}]}';
    expect(parseOpenAiSseLine(line)).toBeNull();
  });
});
