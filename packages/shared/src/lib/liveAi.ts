import { LIVE_AI_SYSTEM_PROMPT, OPENROUTER_COMPLETION_DEFAULTS } from "./aiLiveConfig";
import { emitAiMetric } from "./aiClientMetrics";
import { shouldRejectModelOutput } from "./liveAiGuards";

export type LiveAiMessage = { role: "user" | "assistant" | "system"; content: string };

type OpenRouterChoice = {
  message?: {
    content?: string | Array<{ type?: string; text?: string }>;
  };
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
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

export function buildLiveAiMessages(prompt: string, history: LiveAiMessage[]): LiveAiMessage[] {
  const preface: LiveAiMessage = {
    role: "system",
    content: LIVE_AI_SYSTEM_PROMPT
  };
  const safeHistory = history.slice(-6).filter((m) => m.content.trim());
  return [preface, ...safeHistory, { role: "user", content: prompt.trim() }];
}

export async function getLiveAiText(args: {
  prompt: string;
  history: LiveAiMessage[];
  apiKey: string;
  model?: string;
  contextSummary?: string;
  signal?: AbortSignal;
  provider?: "openrouter" | "groq" | "grok";
  proxyUrl?: string;
}): Promise<string | null> {
  const { prompt, history, apiKey, signal, contextSummary, provider = "openrouter", proxyUrl } = args;
  const model = args.model || "mistralai/mistral-small-3.2-24b-instruct:free";
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  emitAiMetric({ type: "live_fetch_start", at: Date.now() });
  const messages = buildLiveAiMessages(prompt, history);
  if (contextSummary?.trim()) {
    messages.splice(1, 0, {
      role: "system",
      content: `Контекст данных приложения:\n${contextSummary}`
    });
  }
  let res: Response;
  const endpoint = proxyUrl?.trim()
    ? proxyUrl.trim()
    : provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : provider === "grok"
        ? "https://api.x.ai/v1/chat/completions"
        : "https://openrouter.ai/api/v1/chat/completions";
  try {
    res = await fetch(endpoint, {
      method: "POST",
      cache: "no-store",
      headers: proxyUrl?.trim()
        ? {
            "Content-Type": "application/json"
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
    return null;
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
