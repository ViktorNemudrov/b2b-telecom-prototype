"use client";

import { useCallback, useRef, useState } from "react";

type Message = { role: "user" | "assistant" | "system"; content: string };

export function useLLMChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([]);

  const proxyUrl = process.env.NEXT_PUBLIC_LLM_PROXY_URL;
  const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;
      if (!proxyUrl && !groqApiKey) {
        setError("Не задан ключ Groq или proxy URL.");
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

      try {
        const targetUrl = proxyUrl?.trim()
          ? proxyUrl
          : "https://api.groq.com/openai/v1/chat/completions";
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          Pragma: "no-cache"
        };
        if (!proxyUrl?.trim()) {
          headers.Authorization = `Bearer ${groqApiKey ?? ""}`;
        }

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

        if (!res.ok) throw new Error(`API error: ${res.status}`);
        if (!res.body) throw new Error("No stream body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        let buffer = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
              const chunk = json.choices?.[0]?.delta?.content;
              if (!chunk) continue;
              assistantContent += chunk;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantContent };
                return copy;
              });
            } catch {
              // ignore partial chunks
            }
          }
        }

        messagesRef.current = [...updated, { role: "assistant", content: assistantContent }];
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [isLoading, proxyUrl, groqApiKey]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isLoading, error, sendMessage, stopGeneration };
}
