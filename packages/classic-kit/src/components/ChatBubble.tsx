"use client";

import { MoreHorizontal, RefreshCw, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
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
    return <div className="mt-2 text-right text-[11px] text-slate-400 dark:text-slate-500">{sourceLabel}</div>;
  }
  return (
    <details className="mt-2 rounded-xl border border-slate-100 bg-slate-50/90 px-2.5 py-1.5 dark:border-slate-600 dark:bg-slate-900/50">
      <summary className="cursor-pointer list-none text-left text-[11px] font-medium text-slate-600 marker:content-none dark:text-slate-300 [&::-webkit-details-marker]:hidden">
        Источник и диагностика
      </summary>
      <div className="mt-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-left text-[11px] leading-snug text-slate-500 dark:text-slate-400">
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
                  className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--surface2))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text))] transition hover:brightness-110 active:translate-y-[1px] dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface2))] dark:text-[rgb(var(--text))]"
                >
                  ↳ {s}
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
          "max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-[rgb(var(--surface2))] text-[rgb(var(--text))] dark:bg-[rgb(var(--surface2))] dark:text-[rgb(var(--text))]"
            : "border-0 bg-transparent text-[rgb(var(--text))] dark:text-[rgb(var(--text))]"
        )}
      >
        <div className="whitespace-pre-wrap">{message.text}</div>
        {!isUser && hasSource ? <AssistantSourceBlock sourceLabel={message.sourceLabel!} /> : null}

        {!isUser ? (
          <div className="mt-3 flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-xl text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface2))] hover:text-[rgb(var(--text))] dark:text-[rgb(var(--muted))] dark:hover:bg-[rgb(var(--surface2))] dark:hover:text-[rgb(var(--text))]"
              aria-label="Полезно"
              title="Полезно"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-xl text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface2))] hover:text-[rgb(var(--text))] dark:text-[rgb(var(--muted))] dark:hover:bg-[rgb(var(--surface2))] dark:hover:text-[rgb(var(--text))]"
              aria-label="Не полезно"
              title="Не полезно"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-xl text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface2))] hover:text-[rgb(var(--text))] dark:text-[rgb(var(--muted))] dark:hover:bg-[rgb(var(--surface2))] dark:hover:text-[rgb(var(--text))]"
              aria-label="Повторить"
              title="Повторить"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-xl text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface2))] hover:text-[rgb(var(--text))] dark:text-[rgb(var(--muted))] dark:hover:bg-[rgb(var(--surface2))] dark:hover:text-[rgb(var(--text))]"
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
              aria-label={(() => {
                if (!canSpeak()) return "Озвучить";
                const synth = window.speechSynthesis;
                const isActive = synth.speaking || synth.paused || (synth as any).pending;
                const isSame = lastSpokenText === message.text;
                const shouldStop = isActive && isSame;
                return shouldStop ? "Остановить озвучку" : "Озвучить";
              })()}
              disabled={!canSpeak()}
              title={!canSpeak() ? "SpeechSynthesis недоступен" : "Озвучить / остановить"}
            >
              <Volume2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-xl text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface2))] hover:text-[rgb(var(--text))] dark:text-[rgb(var(--muted))] dark:hover:bg-[rgb(var(--surface2))] dark:hover:text-[rgb(var(--text))]"
              aria-label="Ещё"
              title="Ещё"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : null}

        {!isUser && message.suggested?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggested.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestedClick?.(s)}
                className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--surface2))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text))] transition hover:brightness-110 active:translate-y-[1px] dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface2))] dark:text-[rgb(var(--text))]"
              >
                ↳ {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

