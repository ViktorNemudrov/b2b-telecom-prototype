"use client";

import { ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import { cn } from "@shared/components/ui/cn";
import { Button } from "@shared/components/ui/button";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import type { ChatMessage } from "@shared/lib/mockData";

function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function ChatBubble({
  message,
  onSuggestedClick
}: {
  message: ChatMessage;
  onSuggestedClick?: (text: string) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-softSm",
          isUser
            ? "bg-[#E8F4DE] text-[#2A2D3A]"
            : "border border-slate-200 bg-white text-slate-900"
        )}
      >
        <div className="whitespace-pre-wrap">{message.text}</div>

        {!isUser ? (
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-xl"
              onClick={() => {
                if (!canSpeak()) return;
                const u = new SpeechSynthesisUtterance(message.text);
                u.lang = "ru-RU";
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(u);
              }}
              aria-label="Озвучить"
              disabled={!canSpeak()}
              title={!canSpeak() ? "SpeechSynthesis недоступен" : "Озвучить"}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-xl"
              aria-label="Полезно"
              onClick={() => openDevelopmentStub("Оценка ответа и обратная связь.")}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-xl"
              aria-label="Не полезно"
              onClick={() => openDevelopmentStub("Сбор негативных оценок для улучшения модели.")}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        {!isUser && message.suggested?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggested.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestedClick?.(s)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 active:translate-y-[1px]"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

