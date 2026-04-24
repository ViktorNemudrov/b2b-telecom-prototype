import {
  DEFAULT_OPENROUTER_FREE_FALLBACK_MODELS,
  LIVE_AI_SYSTEM_PROMPT,
  OPENROUTER_COMPLETION_DEFAULTS
} from "./aiLiveConfig";
import { emitAiMetric } from "./aiClientMetrics";
import { shouldRejectModelOutput } from "./liveAiGuards";

export type LiveAiMessage = { role: "user" | "assistant" | "system"; content: string };

/** Провайдеры live-ответа в порядке перебора (см. `AiAssistantScreen`). */
export type LiveAiProviderId = "gemini" | "together" | "openrouter" | "groq" | "grok";

type OpenRouterChoice = {
  message?: {
    content?: string | Array<{ type?: string; text?: string }>;
  };
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
};

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

export function extractAssistantText(payload: OpenRouterResponse): string | null {
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return null;
  if (typeof content === "string") return content.trim() || null;
  const text = content
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join(" ")
    .trim();
  return text || null;
}

export function extractGeminiText(payload: GeminiResponse): string | null {
  const parts = payload.candidates?.[0]?.content?.parts;
  if (!parts?.length) return null;
  const text = parts.map((p) => (typeof p.text === "string" ? p.text : "")).join("").trim();
  return text || null;
}

export function buildLiveAiMessages(prompt: string, history: LiveAiMessage[]): LiveAiMessage[] {
  const preface: LiveAiMessage = {
    role: "system",
    content: LIVE_AI_SYSTEM_PROMPT
  };
  const safeHistory = history.slice(-6).filter((m) => m.content.trim());
  return [preface, ...safeHistory, { role: "user", content: prompt.trim() }];
}

function geminiMessagesToRequest(messages: LiveAiMessage[]): {
  systemInstruction?: { parts: { text: string }[] };
  contents: Array<{ role: "user" | "model"; parts: { text: string }[] }>;
} {
  const systemChunks: string[] = [];
  const contents: Array<{ role: "user" | "model"; parts: { text: string }[] }> = [];
  for (const m of messages) {
    if (m.role === "system") {
      systemChunks.push(m.content);
      continue;
    }
    const role = m.role === "assistant" ? "model" : "user";
    contents.push({ role, parts: [{ text: m.content }] });
  }
  const out: {
    systemInstruction?: { parts: { text: string }[] };
    contents: Array<{ role: "user" | "model"; parts: { text: string }[] }>;
  } = { contents };
  if (systemChunks.length) {
    out.systemInstruction = { parts: [{ text: systemChunks.join("\n\n") }] };
  }
  return out;
}

function resolveModel(provider: LiveAiProviderId, explicit?: string): string {
  const m = explicit?.trim();
  if (m) return m;
  switch (provider) {
    case "gemini":
      return "gemini-2.0-flash";
    case "together":
      return "meta-llama/Llama-3.3-70B-Instruct-Turbo";
    case "groq":
      return "llama-3.1-8b-instant";
    case "grok":
      return "grok-3-mini";
    default:
      return DEFAULT_OPENROUTER_FREE_FALLBACK_MODELS[0];
  }
}

function openAiCompatibleEndpoint(provider: Exclude<LiveAiProviderId, "gemini">): string {
  if (provider === "groq") return "https://api.groq.com/openai/v1/chat/completions";
  if (provider === "grok") return "https://api.x.ai/v1/chat/completions";
  if (provider === "together") return "https://api.together.xyz/v1/chat/completions";
  return "https://openrouter.ai/api/v1/chat/completions";
}

async function readHttpErrorSnippet(res: Response): Promise<string> {
  try {
    const t = await res.text();
    return t.replace(/\s+/g, " ").trim().slice(0, 160);
  } catch {
    return "";
  }
}

/** Встроенный Next Route Handler: `/api/llm/chat` и `/api/llm/gemini`; внешний прокси — полный URL без доп. суффикса. */
function isAppLlmProxyBase(p?: string): boolean {
  return Boolean(p?.trim().startsWith("/api/llm"));
}

export async function getLiveAiText(args: {
  prompt: string;
  history: LiveAiMessage[];
  apiKey: string;
  model?: string;
  contextSummary?: string;
  signal?: AbortSignal;
  provider?: LiveAiProviderId;
  proxyUrl?: string;
}): Promise<string | null> {
  const { prompt, history, apiKey, signal, contextSummary, proxyUrl } = args;
  const provider = args.provider ?? "openrouter";
  const model = resolveModel(provider, args.model);
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  emitAiMetric({ type: "live_fetch_start", at: Date.now() });
  const messages = buildLiveAiMessages(prompt, history);
  if (contextSummary?.trim()) {
    messages.splice(1, 0, {
      role: "system",
      content: `Контекст данных приложения:\n${contextSummary}`
    });
  }

  if (provider === "gemini") {
    const { systemInstruction, contents } = geminiMessagesToRequest(messages);
    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: OPENROUTER_COMPLETION_DEFAULTS.temperature,
        topP: OPENROUTER_COMPLETION_DEFAULTS.top_p,
        maxOutputTokens: OPENROUTER_COMPLETION_DEFAULTS.max_tokens
      }
    };
    if (systemInstruction) body.systemInstruction = systemInstruction;

    const useProxy = Boolean(proxyUrl?.trim());
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    let res: Response;
    try {
      if (useProxy) {
        const url = isAppLlmProxyBase(proxyUrl)
          ? `${proxyUrl!.replace(/\/$/, "")}/gemini`
          : proxyUrl!.trim();
        res = await fetch(url, {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, body }),
          signal
        });
      } else {
        res = await fetch(geminiUrl, {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal
        });
      }
    } catch (e) {
      const ms = typeof performance !== "undefined" ? performance.now() - t0 : 0;
      emitAiMetric({ type: "live_fetch_end", at: Date.now(), ok: false, ms });
      throw e;
    }
    if (!res.ok) {
      const ms = typeof performance !== "undefined" ? performance.now() - t0 : 0;
      emitAiMetric({ type: "live_fetch_end", at: Date.now(), ok: false, ms });
      const snippet = await readHttpErrorSnippet(res);
      throw new Error(`HTTP ${res.status}${snippet ? `: ${snippet}` : ""}`);
    }
    const data = (await res.json()) as GeminiResponse;
    const raw = extractGeminiText(data);
    if (!raw) {
      emitAiMetric({ type: "live_output_rejected", reason: "empty" });
      const ms = typeof performance !== "undefined" ? performance.now() - t0 : 0;
      emitAiMetric({ type: "live_fetch_end", at: Date.now(), ok: false, ms });
      return null;
    }
    if (shouldRejectModelOutput(raw)) {
      emitAiMetric({ type: "live_output_rejected", reason: "repetition" });
      const ms = typeof performance !== "undefined" ? performance.now() - t0 : 0;
      emitAiMetric({ type: "live_fetch_end", at: Date.now(), ok: false, ms });
      return null;
    }
    const ms = typeof performance !== "undefined" ? performance.now() - t0 : 0;
    emitAiMetric({ type: "live_fetch_end", at: Date.now(), ok: true, ms, intent: "live" });
    return raw;
  }

  const useProxy = Boolean(proxyUrl?.trim());
  const endpoint = useProxy
    ? isAppLlmProxyBase(proxyUrl)
      ? `${proxyUrl!.replace(/\/$/, "")}/chat`
      : proxyUrl!.trim()
    : openAiCompatibleEndpoint(provider);

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      cache: "no-store",
      headers: useProxy
        ? {
            "Content-Type": "application/json",
            ...(isAppLlmProxyBase(proxyUrl) ? { "X-LLM-Provider": provider } : {})
          }
        : {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
      body: JSON.stringify({
        model,
        messages,
        ...OPENROUTER_COMPLETION_DEFAULTS
      }),
      signal
    });
  } catch (e) {
    const ms = typeof performance !== "undefined" ? performance.now() - t0 : 0;
    emitAiMetric({ type: "live_fetch_end", at: Date.now(), ok: false, ms });
    throw e;
  }
  if (!res.ok) {
    const ms = typeof performance !== "undefined" ? performance.now() - t0 : 0;
    emitAiMetric({ type: "live_fetch_end", at: Date.now(), ok: false, ms });
    const snippet = await readHttpErrorSnippet(res);
    throw new Error(`HTTP ${res.status}${snippet ? `: ${snippet}` : ""}`);
  }
  const data = (await res.json()) as OpenRouterResponse;
  const raw = extractAssistantText(data);
  if (!raw) {
    emitAiMetric({ type: "live_output_rejected", reason: "empty" });
    const ms = typeof performance !== "undefined" ? performance.now() - t0 : 0;
    emitAiMetric({ type: "live_fetch_end", at: Date.now(), ok: false, ms });
    return null;
  }
  if (shouldRejectModelOutput(raw)) {
    emitAiMetric({ type: "live_output_rejected", reason: "repetition" });
    const ms = typeof performance !== "undefined" ? performance.now() - t0 : 0;
    emitAiMetric({ type: "live_fetch_end", at: Date.now(), ok: false, ms });
    return null;
  }
  const ms = typeof performance !== "undefined" ? performance.now() - t0 : 0;
  emitAiMetric({ type: "live_fetch_end", at: Date.now(), ok: true, ms, intent: "live" });
  return raw;
}
