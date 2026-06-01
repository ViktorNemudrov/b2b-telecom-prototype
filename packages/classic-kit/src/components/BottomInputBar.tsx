"use client";

import { Clock3, Mic, MicOff, Paperclip, Pencil, Plus, SendHorizonal } from "lucide-react";
import * as React from "react";
import { cn } from "@shared/components/ui/cn";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function BottomInputBar({
  value,
  onChange,
  onSend,
  onOpenHistory,
  placement = "inline",
  variant = "default",
  inputDataTestId,
  sendButtonDataTestId
}: {
  value: string;
  onChange: (v: string) => void;
  /** Если передан текст (после диктовки), используется он. */
  onSend: (overrideText?: string) => void;
  onOpenHistory: () => void;
  placement?: "fixedBottom" | "inline";
  /** Макет нижней панели ассистента (1722.png): «лист» с закруглением сверху. */
  variant?: "default" | "assistant";
  inputDataTestId?: string;
  sendButtonDataTestId?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const pendingVoiceRef = React.useRef("");
  const [focused, setFocused] = React.useState(false);
  const [listening, setListening] = React.useState(false);
  const [assistantManualDraft, setAssistantManualDraft] = React.useState(false);
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  const supported = !!getSpeechRecognitionCtor();
  const hasText = value.trim().length > 0;
  const showAssistantSend = variant === "assistant" ? hasText && assistantManualDraft : hasText;

  React.useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!hasText) setAssistantManualDraft(false);
  }, [hasText]);

  return (
    <div
      className={cn(
        placement === "fixedBottom" &&
          "fixed left-0 right-0 z-40 mx-auto w-full max-w-[430px]",
        placement === "fixedBottom" && variant === "assistant" && "bottom-0",
        placement === "fixedBottom" && variant === "default" && "bottom-0",
        placement === "inline" && "w-full"
      )}
    >
      <div
        className={cn(
          "safe-px backdrop-blur",
          variant === "assistant" &&
            "rounded-t-[28px] border-t border-[rgb(var(--border))] bg-[rgb(var(--card))] pb-[calc(12px+clamp(0px,env(safe-area-inset-bottom),14px))] pt-4 shadow-[0_-8px_32px_rgba(0,0,0,0.18)]",
          variant === "default" && "bg-[rgb(var(--bg))]/85",
          placement === "fixedBottom" && variant === "default" && "border-t border-[rgb(var(--border))] pb-4 pt-3",
          placement === "inline" && variant === "default" && "pb-2 pt-1"
        )}
      >
        <div
          className={cn(
            "rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] p-1.5 shadow-softSm",
            focused && "ring-2 ring-accent-orange/30"
          )}
        >
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) openDevelopmentStub(`Файл «${f.name}» выбран (демо: не сохраняется).`);
            }}
          />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              if (variant === "assistant") setAssistantManualDraft(true);
              onChange(e.target.value);
            }}
            placeholder="Чем можем помочь?"
            className={cn(
              "h-9 min-w-0 bg-transparent px-2 text-[15px] text-[rgb(var(--text))] outline-none placeholder:text-[rgb(var(--muted))]",
              variant === "assistant" ? "w-full" : "flex-1"
            )}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                onSend();
              }
            }}
            aria-label="Поле ввода"
            data-testid={inputDataTestId}
          />

          <div className={cn("mt-1 flex items-center justify-between", variant !== "assistant" && "mt-0")}>
            <div className="flex items-center gap-1">
              <button
                aria-label="Прикрепить"
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--border))] active:scale-95"
                onClick={() => fileRef.current?.click()}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgb(var(--border))]">
                  <Paperclip className="h-3.5 w-3.5" />
                </span>
              </button>

              <button
                aria-label="История"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--border))] active:scale-95"
                onClick={onOpenHistory}
              >
                <Clock3 className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              {!showAssistantSend ? (
                <button
                  aria-label="Перейти на главную"
                  type="button"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--border))] active:scale-95"
                  onClick={() => {
                    if (typeof window !== "undefined") window.location.assign("/assistant/?reset=1");
                  }}
                >
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-[rgb(var(--border))]">
                    <Pencil className="h-3.5 w-3.5 -translate-x-[0.5px] -translate-y-[0.5px] -rotate-2" strokeWidth={2} />
                    <Plus className="absolute bottom-[2.5px] right-[1.5px] h-2.5 w-2.5 text-[rgb(var(--muted))]" strokeWidth={2.4} />
                  </span>
                </button>
              ) : null}

              <button
                aria-label={listening ? "Остановить диктовку" : "Диктовать вопрос"}
                className={cn(
                  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition active:scale-95",
                  listening
                    ? "bg-rose-500/15 text-rose-500 animate-pulse"
                    : "text-[rgb(var(--muted))] hover:bg-[rgb(var(--border))]",
                  !supported && "opacity-80"
                )}
                title={
                  !supported
                    ? "Нажмите для подсказки: в части браузеров (например Яндекс на Android) распознавание речи недоступно"
                    : listening
                      ? "Остановить"
                      : "Диктовать"
                }
                onClick={() => {
                  const Ctor = getSpeechRecognitionCtor();
                  if (!Ctor) {
                    openDevelopmentStub(
                      "Распознавание речи недоступно: в этом браузере нет Web Speech API. В Яндекс.Браузере на Android оно часто отключено — попробуйте Chrome или введите текст вручную."
                    );
                    return;
                  }

                  if (listening) {
                    recognitionRef.current?.stop();
                    setListening(false);
                    return;
                  }

                  const rec = new Ctor();
                  recognitionRef.current = rec;
                  rec.lang = "ru-RU";
                  rec.interimResults = true;
                  rec.continuous = false;

                  const prevValue = value;
                  let hadFinal = false;

                  rec.onresult = (event: SpeechRecognitionEvent) => {
                    const parts: string[] = [];
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                      const r = event.results[i];
                      parts.push(r[0]?.transcript ?? "");
                      if (r.isFinal) hadFinal = true;
                    }
                    const spoken = parts.join(" ").trim();
                    const merged = (prevValue ? `${prevValue} ` : "") + spoken;
                    const trimmed = merged.trim();
                    pendingVoiceRef.current = trimmed;
                    onChange(trimmed);
                  };

                  rec.onend = () => {
                    setListening(false);
                    recognitionRef.current = null;
                    inputRef.current?.focus();
                    if (hadFinal) {
                      const t = pendingVoiceRef.current.trim();
                      window.setTimeout(() => {
                        if (t) onSend(t);
                        else onSend();
                      }, 80);
                    }
                  };

                  rec.onerror = () => {
                    setListening(false);
                    recognitionRef.current = null;
                  };

                  setListening(true);
                  inputRef.current?.focus();
                  try {
                    rec.start();
                  } catch {
                    setListening(false);
                    recognitionRef.current = null;
                  }
                }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgb(var(--border))]">
                  {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                </span>
              </button>

              {showAssistantSend ? (
                <button
                  aria-label="Отправить"
                  data-testid={sendButtonDataTestId}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-orange text-white shadow-softSm transition hover:brightness-105 active:scale-95"
                  onClick={() => onSend()}
                >
                  <SendHorizonal className="h-5 w-5" />
                </button>
              ) : null}
            </div>
          </div>

          {listening ? (
            <span className="mt-1 inline-flex shrink-0 rounded-full bg-rose-500/15 px-2 py-1 text-[10px] font-semibold text-rose-500">
              Говорите...
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

