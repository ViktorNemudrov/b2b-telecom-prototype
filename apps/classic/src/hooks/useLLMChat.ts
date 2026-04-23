"use client";

import { useCallback, useRef, useState } from "react";
import { buildNoLiveKeysFallbackResponse } from "@shared/lib/assistantResponse";
import { parseOpenAiSseLine } from "@shared/lib/openAiSseParse";

type Message = { role: "user" | "assistant" | "system"; content: string };
type LiveProvider = "gemini" | "together" | "openrouter" | "grok" | "groq";
type ProvidersProbeResponse = { enabled?: LiveProvider[] };

const EMPTY_REPLY_FALLBACK =
  "Не удалось получить текст ответа (пустой поток или неверный формат). Проверьте ключ Groq, настройте NEXT_PUBLIC_LLM_PROXY_URL при блокировке CORS в браузере или попробуйте позже.";

async function fetchGroqNonStreaming(args: {
  url: string;
  headers: Record<string, string>;
  messages: Message[];
  signal: AbortSignal;
}): Promise<string | null> {
  const res = await fetch(args.url, {
    method: "POST",
    headers: args.headers,
    signal: args.signal,
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "system", content: "Ты полезный ассистент." }, ...args.messages],
      stream: false,
      max_tokens: 1024
    })
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content?.trim();
  return text && text.length > 0 ? text : null;
}

function getDefaultModel(provider: LiveProvider): string {
  if (provider === "gemini") return process.env.NEXT_PUBLIC_GEMINI_MODEL ?? "gemini-2.0-flash";
  if (provider === "together") return process.env.NEXT_PUBLIC_TOGETHER_MODEL ?? "meta-llama/Llama-3.3-70B-Instruct-Turbo";
  if (provider === "openrouter") return process.env.NEXT_PUBLIC_OPENROUTER_MODEL ?? "mistralai/mistral-small-3.2-24b-instruct:free";
  if (provider === "grok") return process.env.NEXT_PUBLIC_GROK_MODEL ?? "grok-3-mini";
  return process.env.NEXT_PUBLIC_GROQ_MODEL ?? "llama-3.1-8b-instant";
}

export function useLLMChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverEnabledProviders, setServerEnabledProviders] = useState<LiveProvider[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([]);

  const envProxy = process.env.NEXT_PUBLIC_LLM_PROXY_URL?.trim();
  const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY?.trim();
  const hasPublicAnyKey = Boolean(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_TOGETHER_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_GROK_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_GROQ_API_KEY?.trim()
  );

  const probeProviders = useCallback(async (): Promise<LiveProvider[]> => {
    try {
      const res = await fetch("/api/llm/providers", { method: "GET", cache: "no-store" });
      if (!res.ok) return [];
      const payload = (await res.json()) as ProvidersProbeResponse;
      const enabled = Array.isArray(payload.enabled)
        ? payload.enabled.filter(
            (p): p is LiveProvider => p === "gemini" || p === "together" || p === "openrouter" || p === "grok" || p === "groq"
          )
        : [];
      setServerEnabledProviders(enabled);
      return enabled;
    } catch {
      return [];
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const providers =
        serverEnabledProviders.length > 0
          ? serverEnabledProviders
          : !hasPublicAnyKey
            ? await probeProviders()
            : [];
      const hasLiveViaServer = providers.length > 0;
      if (!envProxy && !groqApiKey && !hasPublicAnyKey && !hasLiveViaServer) {
        const userMsg: Message = { role: "user", content };
        const assistantMsg: Message = {
          role: "assistant",
          content: buildNoLiveKeysFallbackResponse().text
        };
        const next = [...messagesRef.current, userMsg, assistantMsg];
        messagesRef.current = next;
        setMessages(next);
        setError(null);
        return;
      }

      const userMsg: Message = { role: "user", content };
      const updated = [...messagesRef.current, userMsg];
      messagesRef.current = updated;
      setMessages(updated);
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      const hasExplicitProxy = Boolean(envProxy);
      const targetUrl = hasExplicitProxy
        ? envProxy!.startsWith("/api/llm")
          ? `${envProxy!.replace(/\/$/, "")}/chat`
          : envProxy!
        : "/api/llm/chat";
      const preferredProvider: LiveProvider = providers[0] ?? "groq";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        Pragma: "no-cache"
      };
      if (!hasExplicitProxy || envProxy!.startsWith("/api/llm")) {
        headers["X-LLM-Provider"] = preferredProvider;
      }

      try {
        const res = await fetch(targetUrl, {
          method: "POST",
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            model: getDefaultModel(preferredProvider),
            messages: [{ role: "system", content: "Ты полезный ассистент." }, ...updated],
            stream: true,
            max_tokens: 1024
          })
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(`API error: ${res.status}${errText ? ` — ${errText.slice(0, 200)}` : ""}`);
        }
        if (!res.body) throw new Error("No stream body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        let buffer = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        const applyDelta = (chunk: string) => {
          assistantContent += chunk;
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: assistantContent };
            return copy;
          });
        };

        const processLine = (line: string) => {
          const parsed = parseOpenAiSseLine(line);
          if (parsed === null || parsed === "done") return;
          applyDelta(parsed.delta);
        };

        while (true) {
          const { done, value } = await reader.read();
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              processLine(line);
            }
          }
          if (done) break;
        }

        if (buffer.trim()) {
          for (const line of buffer.split("\n")) {
            processLine(line);
          }
        }

        if (!assistantContent.trim()) {
          const fallback = await fetchGroqNonStreaming({
            url: targetUrl,
            headers,
            messages: updated,
            signal: controller.signal
          });
          if (fallback) {
            assistantContent = fallback;
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: assistantContent };
              return copy;
            });
          } else {
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: EMPTY_REPLY_FALLBACK };
              return copy;
            });
            assistantContent = EMPTY_REPLY_FALLBACK;
          }
        }

        messagesRef.current = [...updated, { role: "assistant", content: assistantContent }];
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setError(null);
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last.role === "assistant" && !last.content.trim()) {
              copy[copy.length - 1] = { role: "assistant", content: "Генерация остановлена." };
            }
            messagesRef.current = copy;
            return copy;
          });
        } else {
          const msg = err instanceof Error ? err.message : "Unknown error";
          setError(null);
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last.role === "assistant") {
              copy[copy.length - 1] = {
                role: "assistant",
                content: last.content.trim() ? last.content : `Ошибка: ${msg}`
              };
            } else {
              copy.push({ role: "assistant", content: `Ошибка: ${msg}` });
            }
            messagesRef.current = copy;
            return copy;
          });
        }
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [isLoading, envProxy, groqApiKey, hasPublicAnyKey, probeProviders, serverEnabledProviders]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isLoading, error, sendMessage, stopGeneration };
}
