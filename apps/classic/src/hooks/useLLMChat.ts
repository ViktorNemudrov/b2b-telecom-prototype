"use client";

import { useCallback, useRef, useState } from "react";
import {
  DEFAULT_OPENROUTER_FREE_FALLBACK_MODELS,
  OPENROUTER_COMPLETION_DEFAULTS
} from "@shared/lib/aiLiveConfig";
import { DEMO_CHAT_NO_AI_MESSAGE } from "@shared/lib/assistantResponse";
import { extractGeminiText } from "@shared/lib/liveAi";
import { parseOpenAiSseLine } from "@shared/lib/openAiSseParse";

type Message = { role: "user" | "assistant" | "system"; content: string };
type LiveProvider = "gemini" | "together" | "openrouter" | "grok" | "groq";
type ProvidersProbeResponse = { enabled?: LiveProvider[] };

async function fetchGroqNonStreaming(args: {
  url: string;
  headers: Record<string, string>;
  messages: Message[];
  signal: AbortSignal;
  model: string;
}): Promise<string | null> {
  const res = await fetch(args.url, {
    method: "POST",
    headers: args.headers,
    signal: args.signal,
    body: JSON.stringify({
      model: args.model,
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

function providersFromClientPublicEnv(): LiveProvider[] {
  const out: LiveProvider[] = [];
  if (process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim()) out.push("gemini");
  if (process.env.NEXT_PUBLIC_TOGETHER_API_KEY?.trim()) out.push("together");
  if (process.env.NEXT_PUBLIC_OPENROUTER_API_KEY?.trim()) out.push("openrouter");
  if (process.env.NEXT_PUBLIC_GROK_API_KEY?.trim()) out.push("grok");
  if (process.env.NEXT_PUBLIC_GROQ_API_KEY?.trim()) out.push("groq");
  return out;
}

function firstOpenAiCompatible(enabled: LiveProvider[]): LiveProvider | null {
  const hit = enabled.find((p) => p !== "gemini");
  return hit ?? null;
}

function messagesToGeminiProxyPayload(messages: Message[], model: string): { model: string; body: Record<string, unknown> } {
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
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: OPENROUTER_COMPLETION_DEFAULTS.temperature,
      topP: OPENROUTER_COMPLETION_DEFAULTS.top_p,
      maxOutputTokens: 1024
    }
  };
  if (systemChunks.length) {
    body.systemInstruction = { parts: [{ text: systemChunks.join("\n\n") }] };
  }
  return { model, body };
}

function getDefaultModel(provider: LiveProvider): string {
  if (provider === "gemini") return process.env.NEXT_PUBLIC_GEMINI_MODEL ?? "gemini-2.0-flash";
  if (provider === "together") return process.env.NEXT_PUBLIC_TOGETHER_MODEL ?? "meta-llama/Llama-3.3-70B-Instruct-Turbo";
  if (provider === "openrouter")
    return process.env.NEXT_PUBLIC_OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_FREE_FALLBACK_MODELS[0];
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

      let providers =
        serverEnabledProviders.length > 0 ? serverEnabledProviders : await probeProviders();
      if (providers.length === 0) {
        providers = providersFromClientPublicEnv();
      }
      const hasLiveViaServer = providers.length > 0;
      if (!envProxy && !groqApiKey && !hasPublicAnyKey && !hasLiveViaServer) {
        const userMsg: Message = { role: "user", content };
        const assistantMsg: Message = {
          role: "assistant",
          content: DEMO_CHAT_NO_AI_MESSAGE
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
      const openAiProvider = firstOpenAiCompatible(providers);
      const geminiOnly = !openAiProvider && providers.includes("gemini");

      const targetUrl = hasExplicitProxy
        ? envProxy!.startsWith("/api/llm")
          ? `${envProxy!.replace(/\/$/, "")}/chat`
          : envProxy!
        : "/api/llm/chat";
      const geminiUrl =
        hasExplicitProxy && envProxy!.startsWith("/api/llm")
          ? `${envProxy!.replace(/\/$/, "")}/gemini`
          : "/api/llm/gemini";

      const preferredProvider: LiveProvider = openAiProvider ?? "groq";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        Pragma: "no-cache"
      };
      if (!hasExplicitProxy || envProxy!.startsWith("/api/llm")) {
        headers["X-LLM-Provider"] = preferredProvider;
      }

      if (geminiOnly) {
        try {
          setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
          const payload = messagesToGeminiProxyPayload(
            [{ role: "system", content: "Ты полезный ассистент." }, ...updated],
            getDefaultModel("gemini")
          );
          const res = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store", Pragma: "no-cache" },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          if (!res.ok) {
            const errText = await res.text().catch(() => "");
            throw new Error(`API error: ${res.status}${errText ? ` — ${errText.slice(0, 200)}` : ""}`);
          }
          const data = (await res.json()) as Parameters<typeof extractGeminiText>[0];
          let assistantContent = (extractGeminiText(data) ?? "").trim();
          if (!assistantContent) assistantContent = DEMO_CHAT_NO_AI_MESSAGE;
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: assistantContent };
            return copy;
          });
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
            setError(null);
            setMessages((prev) => {
              if (prev.length === 0) return prev;
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last.role === "assistant") {
                copy[copy.length - 1] = { role: "assistant", content: DEMO_CHAT_NO_AI_MESSAGE };
              } else {
                copy.push({ role: "assistant", content: DEMO_CHAT_NO_AI_MESSAGE });
              }
              messagesRef.current = copy;
              return copy;
            });
          }
        } finally {
          setIsLoading(false);
          abortRef.current = null;
        }
        return;
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
            signal: controller.signal,
            model: getDefaultModel(preferredProvider)
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
              copy[copy.length - 1] = { role: "assistant", content: DEMO_CHAT_NO_AI_MESSAGE };
              return copy;
            });
            assistantContent = DEMO_CHAT_NO_AI_MESSAGE;
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
          setError(null);
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last.role === "assistant") {
              copy[copy.length - 1] = { role: "assistant", content: DEMO_CHAT_NO_AI_MESSAGE };
            } else {
              copy.push({ role: "assistant", content: DEMO_CHAT_NO_AI_MESSAGE });
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
