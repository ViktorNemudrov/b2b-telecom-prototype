import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getLiveAiText } from "./liveAi";

describe("getLiveAiText provider routing", () => {
  const okAnswer =
    "По вашему запросу: в кабинете отображаются счета за текущий период. Уточните месяц, если нужна детализация.";

  const mockFetchOk = () =>
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: okAnswer } }]
      })
    } as unknown as Response);

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // ensure tests don't leak globals
    vi.unstubAllGlobals();
  });

  it("uses OpenRouter endpoint when provider=openrouter", async () => {
    const fetchSpy = mockFetchOk();
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);

    await getLiveAiText({
      provider: "openrouter",
      apiKey: "openrouter-key",
      model: "mistralai/mistral-small",
      prompt: "Тест",
      history: []
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(init.headers).toEqual(
      expect.objectContaining({
        Authorization: "Bearer openrouter-key",
        "Content-Type": "application/json"
      })
    );
  });

  it("uses Groq endpoint when provider=groq", async () => {
    const fetchSpy = mockFetchOk();
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);

    await getLiveAiText({
      provider: "groq",
      apiKey: "groq-key",
      model: "llama-3.1-8b-instant",
      prompt: "Тест",
      history: []
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(init.headers).toEqual(
      expect.objectContaining({
        Authorization: "Bearer groq-key",
        "Content-Type": "application/json"
      })
    );
  });

  it("uses xAI endpoint when provider=grok", async () => {
    const fetchSpy = mockFetchOk();
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);

    await getLiveAiText({
      provider: "grok",
      apiKey: "gsk-test-key",
      model: "grok-3-mini",
      prompt: "Тест",
      history: []
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.x.ai/v1/chat/completions");
    expect(init.headers).toEqual(
      expect.objectContaining({
        Authorization: "Bearer gsk-test-key",
        "Content-Type": "application/json"
      })
    );
  });

  it("uses proxy endpoint without Authorization header", async () => {
    const fetchSpy = mockFetchOk();
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);

    await getLiveAiText({
      provider: "groq",
      proxyUrl: "https://proxy.example.com/chat",
      apiKey: "secret-key-should-not-be-sent",
      model: "llama-3.1-8b-instant",
      prompt: "Тест",
      history: []
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://proxy.example.com/chat");
    expect(init.headers).toEqual(
      expect.objectContaining({
        "Content-Type": "application/json"
      })
    );
    expect(JSON.stringify(init.headers)).not.toContain("Authorization");
  });
});

