"use client";

import { Volume2 } from "lucide-react";
import { cn } from "@shared/components/ui/cn";
import { Button } from "@shared/components/ui/button";
import type { ChatMessage } from "@shared/lib/mockData";

function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let lastSpokenText: string | null = null;

function sourceLabelNeedsDetails(label: string): boolean {
  return label.length > 140 || label.includes(" · ") || label.includes("(ошибка)") || label.includes("HTTP ");
}

function AssistantSourceBlock({ sourceLabel }: { sourceLabel: string }) {
  if (!sourceLabelNeedsDetails(sourceLabel)) {
    return <div className="mt-2 text-right text-[11px] text-[rgb(var(--muted))]">{sourceLabel}</div>;
  }
  return (
    <details className="mt-2 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-2.5 py-1.5">
      <summary className="cursor-pointer list-none text-left text-[11px] font-medium text-[rgb(var(--muted))] marker:content-none [&::-webkit-details-marker]:hidden">
        Источник и диагностика
      </summary>
      <div className="mt-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-left text-[11px] leading-snug text-[rgb(var(--muted))]">
        {sourceLabel}
      </div>
    </details>
  );
}

export function ChatBubble({
  message,
  onSuggestedClick
}: {
  message: ChatMessage;
  onSuggestedClick?: (text: string) => void;
}) {
  const isUser = message.role === "user";
  const widgetOnlyAssistant = !isUser && Boolean(message.widget) && !message.text?.trim();
  const hasSuggested = !isUser && Boolean(message.suggested?.length);
  const hasSource = !isUser && Boolean(message.sourceLabel?.trim());

  if (widgetOnlyAssistant) {
    if (!hasSuggested && !hasSource) return null;
    return (
      <div className={cn("flex w-full", "justify-start")}>
        <div className="max-w-[86%] w-full space-y-2 text-sm">
          {hasSource ? <AssistantSourceBlock sourceLabel={message.sourceLabel!} /> : null}
          {hasSuggested ? (
            <div className="flex flex-wrap gap-2">
              {message.suggested!.map((s) => (
                <button
                  key={s}
                  onClick={() => onSuggestedClick?.(s)}
                  className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--text))] transition hover:brightness-105 active:scale-[0.97]"
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

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            // Сообщение пользователя — оранжевый акцент
            ? "bg-accent-orange text-white"
            // Сообщение ИИ — карточка с бордером
            : "border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--text))]"
        )}
      >
        <div className="whitespace-pre-wrap">{message.text}</div>
        {!isUser && hasSource ? <AssistantSourceBlock sourceLabel={message.sourceLabel!} /> : null}

        {!isUser ? (
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-xl text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
              onClick={() => {
                if (!canSpeak()) return;
                const synth = window.speechSynthesis;
                const isActive = synth.speaking || synth.paused || (synth as any).pending;
                const shouldStop = isActive && lastSpokenText === message.text;
                if (shouldStop) {
                  synth.cancel();
                  lastSpokenText = null;
                  return;
                }
                const u = new SpeechSynthesisUtterance(message.text);
                u.lang = "ru-RU";
                synth.cancel();
                lastSpokenText = message.text;
                synth.speak(u);
              }}
              aria-label="Озвучить"
              disabled={!canSpeak()}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        {!isUser && message.suggested?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggested.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestedClick?.(s)}
                className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--text))] transition hover:brightness-105 active:scale-[0.97]"
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

