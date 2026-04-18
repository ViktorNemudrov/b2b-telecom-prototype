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

  it("uses app /api/llm base → /api/llm/chat with X-LLM-Provider", async () => {
    const fetchSpy = mockFetchOk();
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);

    await getLiveAiText({
      provider: "groq",
      proxyUrl: "/api/llm",
      apiKey: "secret-key-should-not-be-sent",
      model: "llama-3.1-8b-instant",
      prompt: "Тест",
      history: []
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/llm/chat");
    expect(init.headers).toEqual(
      expect.objectContaining({
        "Content-Type": "application/json",
        "X-LLM-Provider": "groq"
      })
    );
    expect(JSON.stringify(init.headers)).not.toContain("Authorization");
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

  const mockGeminiOk = () =>
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: okAnswer }] } }]
      })
    } as unknown as Response);

  it("uses Gemini endpoint when provider=gemini", async () => {
    const fetchSpy = mockGeminiOk();
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);

    await getLiveAiText({
      provider: "gemini",
      apiKey: "AIza-test",
      model: "gemini-2.0-flash",
      prompt: "Тест",
      history: []
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("generativelanguage.googleapis.com");
    expect(url).toContain("models/gemini-2.0-flash:generateContent");
    expect(url).toContain("key=AIza-test");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.stringify(init.headers)).not.toContain("Authorization");
  });

  it("Gemini uses external proxy URL when proxyUrl is set", async () => {
    const fetchSpy = mockGeminiOk();
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);

    await getLiveAiText({
      provider: "gemini",
      apiKey: "k",
      model: "gemini-2.0-flash",
      prompt: "Тест",
      history: [],
      proxyUrl: "https://proxy.example.com/gemini"
    });

    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://proxy.example.com/gemini");
  });

  it("Gemini uses /api/llm/gemini when proxy is app base", async () => {
    const fetchSpy = mockGeminiOk();
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);

    await getLiveAiText({
      provider: "gemini",
      apiKey: "k",
      model: "gemini-2.0-flash",
      prompt: "Тест",
      history: [],
      proxyUrl: "/api/llm"
    });

    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/llm/gemini");
  });

  it("uses Together endpoint when provider=together", async () => {
    const fetchSpy = mockFetchOk();
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);

    await getLiveAiText({
      provider: "together",
      apiKey: "together-key",
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      prompt: "Тест",
      history: []
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.together.xyz/v1/chat/completions");
    expect(init.headers).toEqual(
      expect.objectContaining({
        Authorization: "Bearer together-key",
        "Content-Type": "application/json"
      })
    );
  });

  it("throws on HTTP error for OpenAI-compatible providers (visible in live chain)", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => '{"error":"invalid"}'
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);

    await expect(
      getLiveAiText({
        provider: "groq",
        apiKey: "bad",
        model: "llama-3.1-8b-instant",
        prompt: "Тест",
        history: []
      })
    ).rejects.toThrow(/HTTP 401/);
  });

  it("throws on HTTP error for Gemini", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => "Forbidden"
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);

    await expect(
      getLiveAiText({
        provider: "gemini",
        apiKey: "bad",
        model: "gemini-2.0-flash",
        prompt: "Тест",
        history: []
      })
    ).rejects.toThrow(/HTTP 403/);
  });
});

