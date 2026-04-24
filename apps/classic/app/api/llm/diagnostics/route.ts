import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ProviderId = "gemini" | "together" | "openrouter" | "grok" | "groq";

type ProbeResult = {
  provider: ProviderId;
  enabled: boolean;
  model: string;
  ok: boolean;
  httpStatus?: number;
  message: string;
};

const OPENAI_ENDPOINTS: Record<Exclude<ProviderId, "gemini">, string> = {
  together: "https://api.together.xyz/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  grok: "https://api.x.ai/v1/chat/completions",
  groq: "https://api.groq.com/openai/v1/chat/completions"
};

const DEFAULT_MODELS: Record<ProviderId, string> = {
  gemini: process.env.NEXT_PUBLIC_GEMINI_MODEL?.trim() || "gemini-2.0-flash",
  together: process.env.NEXT_PUBLIC_TOGETHER_MODEL?.trim() || "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  openrouter: process.env.NEXT_PUBLIC_OPENROUTER_MODEL?.trim() || "openrouter/auto",
  grok: process.env.NEXT_PUBLIC_GROK_MODEL?.trim() || "grok-3-mini",
  groq: process.env.NEXT_PUBLIC_GROQ_MODEL?.trim() || "llama-3.1-8b-instant"
};

function getKey(primary: string, pub: string): string | null {
  const value = process.env[primary] ?? process.env[pub];
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function withTimeout(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function probeOpenAiCompatible(
  provider: Exclude<ProviderId, "gemini">,
  key: string,
  model: string
): Promise<ProbeResult> {
  const endpoint = OPENAI_ENDPOINTS[provider];
  const timeout = withTimeout(12000);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      signal: timeout.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(provider === "openrouter"
          ? {
              Referer: process.env.NEXT_PUBLIC_OPENROUTER_REFERER ?? "https://localhost"
            }
          : {})
      },
      body: JSON.stringify({
        model,
        stream: false,
        max_tokens: 32,
        messages: [{ role: "user", content: "Ответь словом OK" }]
      }),
      cache: "no-store"
    });
    const text = await res.text();
    const snippet = text.replace(/\s+/g, " ").slice(0, 180);
    return {
      provider,
      enabled: true,
      model,
      ok: res.ok,
      httpStatus: res.status,
      message: res.ok ? "ok" : snippet || "provider error"
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "network error";
    return { provider, enabled: true, model, ok: false, message: msg };
  } finally {
    timeout.clear();
  }
}

async function probeGemini(key: string, model: string): Promise<ProbeResult> {
  const timeout = withTimeout(12000);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      method: "POST",
      signal: timeout.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Ответь словом OK" }] }],
        generationConfig: { maxOutputTokens: 24, temperature: 0 }
      }),
      cache: "no-store"
    });
    const text = await res.text();
    const snippet = text.replace(/\s+/g, " ").slice(0, 180);
    return {
      provider: "gemini",
      enabled: true,
      model,
      ok: res.ok,
      httpStatus: res.status,
      message: res.ok ? "ok" : snippet || "provider error"
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "network error";
    return { provider: "gemini", enabled: true, model, ok: false, message: msg };
  } finally {
    timeout.clear();
  }
}

export async function GET() {
  const providers: ProviderId[] = ["gemini", "together", "openrouter", "grok", "groq"];
  const keys: Record<ProviderId, string | null> = {
    gemini: getKey("GEMINI_API_KEY", "NEXT_PUBLIC_GEMINI_API_KEY"),
    together: getKey("TOGETHER_API_KEY", "NEXT_PUBLIC_TOGETHER_API_KEY"),
    openrouter: getKey("OPENROUTER_API_KEY", "NEXT_PUBLIC_OPENROUTER_API_KEY"),
    grok: getKey("GROK_API_KEY", "NEXT_PUBLIC_GROK_API_KEY"),
    groq: getKey("GROQ_API_KEY", "NEXT_PUBLIC_GROQ_API_KEY")
  };

  const results: ProbeResult[] = [];
  for (const provider of providers) {
    const key = keys[provider];
    if (!key) {
      results.push({
        provider,
        enabled: false,
        model: DEFAULT_MODELS[provider],
        ok: false,
        message: "ключ не задан"
      });
      continue;
    }
    if (provider === "gemini") {
      results.push(await probeGemini(key, DEFAULT_MODELS.gemini));
      continue;
    }
    results.push(await probeOpenAiCompatible(provider, key, DEFAULT_MODELS[provider]));
  }

  return NextResponse.json(
    { checkedAt: new Date().toISOString(), results },
    { headers: { "Cache-Control": "no-store" } }
  );
}
