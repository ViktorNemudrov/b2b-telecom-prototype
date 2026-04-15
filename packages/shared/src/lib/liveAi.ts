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
    content:
      "Ты помощник для B2B кабинета связи. Отвечай кратко, по делу, на русском языке. Никакой воды, шуток и оффтопа. Если не уверен в данных, честно сообщи, что это предположение."
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
}): Promise<string | null> {
  const { prompt, history, apiKey, signal, contextSummary } = args;
  const model = args.model || "mistralai/mistral-small-3.2-24b-instruct:free";
  const messages = buildLiveAiMessages(prompt, history);
  if (contextSummary?.trim()) {
    messages.splice(1, 0, {
      role: "system",
      content: `Контекст данных приложения:\n${contextSummary}`
    });
  }
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2
    }),
    signal
  });
  if (!res.ok) return null;
  const data = (await res.json()) as OpenRouterResponse;
  return extractAssistantText(data);
}
