"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, StopCircle } from "lucide-react";
import { useLLMChat } from "@/src/hooks/useLLMChat";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const { messages, isLoading, error, sendMessage, stopGeneration } = useLLMChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasInitialScrollRef = useRef(false);
  const prevMessagesLengthRef = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const shouldSmooth = hasInitialScrollRef.current && messages.length > prevMessagesLengthRef.current;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: shouldSmooth ? "smooth" : "auto"
    });
    hasInitialScrollRef.current = true;
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    void sendMessage(input);
    setInput("");
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={`${msg.role}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                data-testid="chat-message-bubble"
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100"
                }`}
              >
                {msg.role === "assistant" &&
                !msg.content &&
                isLoading &&
                i === messages.length - 1 ? (
                  <span className="italic text-gray-400">печатает...</span>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {error ? <p className="mt-2 text-center text-xs text-red-500">{error}</p> : null}
      </div>

      <form onSubmit={handleSubmit} className="border-t bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Спросите что-нибудь..."
            className="flex-1 resize-none rounded-xl bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            rows={1}
          />
          <button
            type={isLoading ? "button" : "submit"}
            onClick={isLoading ? () => stopGeneration() : undefined}
            disabled={!isLoading && !input.trim()}
            className="rounded-xl bg-blue-600 p-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={isLoading ? "Остановить генерацию" : "Отправить"}
          >
            {isLoading ? <StopCircle size={20} /> : <Send size={20} />}
          </button>
        </div>
      </form>
    </div>
  );
}
