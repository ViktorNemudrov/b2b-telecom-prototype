"use client";

import { useCallback, useRef, useState } from "react";
import { DEMO_CHAT_NO_AI_MESSAGE } from "@shared/lib/assistantResponse";
import { parseOpenAiSseLine } from "@shared/lib/openAiSseParse";

type Message = { role: "user" | "assistant" | "system"; content: string };

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

export function useLLMChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([]);

  const envProxy = process.env.NEXT_PUBLIC_LLM_PROXY_URL?.trim();
  const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY?.trim();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      if (!envProxy && !groqApiKey) {
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
      const targetUrl = hasExplicitProxy
        ? envProxy!.startsWith("/api/llm")
          ? `${envProxy!.replace(/\/$/, "")}/chat`
          : envProxy!
        : "/api/llm/chat";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        Pragma: "no-cache"
      };
      if (!hasExplicitProxy || envProxy!.startsWith("/api/llm")) {
        headers["X-LLM-Provider"] = "groq";
      }

      try {
        const res = await fetch(targetUrl, {
          method: "POST",
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
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
    [isLoading, envProxy, groqApiKey]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isLoading, error, sendMessage, stopGeneration };
}
