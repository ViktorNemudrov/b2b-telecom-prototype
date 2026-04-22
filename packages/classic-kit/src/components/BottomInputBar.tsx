"use client";

import { Clock3, Mic, MicOff, Paperclip, SendHorizonal } from "lucide-react";
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
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  const supported = !!getSpeechRecognitionCtor();

  React.useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

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
            "rounded-t-[28px] border-t border-[#E8EAED] bg-white pb-[max(14px,env(safe-area-inset-bottom))] pt-4 shadow-[0_-8px_32px_rgba(0,0,0,0.06)] dark:border-slate-700 dark:bg-slate-900",
          variant === "default" && "bg-[rgb(var(--bg))]/85",
          placement === "fixedBottom" && variant === "default" && "border-t border-slate-100 pb-4 pt-3",
          placement === "inline" && variant === "default" && "pb-2 pt-1"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-1 rounded-[20px] border border-[#E5E5EA] bg-white p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:border-slate-600 dark:bg-slate-800",
            focused && "ring-2 ring-accent-yellow/35",
            variant === "assistant" && "min-h-[52px]"
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
          <button
            aria-label="Прикрепить"
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 active:translate-y-[1px] dark:text-slate-300 dark:hover:bg-slate-700"
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <button
            aria-label="История"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 active:translate-y-[1px] dark:text-slate-300 dark:hover:bg-slate-700"
            onClick={onOpenHistory}
          >
            <Clock3 className="h-5 w-5" />
          </button>

          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Чем можем помочь?"
            className="h-9 min-w-0 flex-1 bg-transparent px-1 text-[15px] outline-none placeholder:text-[#C7C7CC] dark:placeholder:text-slate-500"
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

          <button
            aria-label={listening ? "Остановить диктовку" : "Диктовать вопрос"}
            className={cn(
              "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition active:translate-y-[1px]",
              listening
                ? "bg-rose-50 text-rose-700 animate-pulse dark:bg-rose-900/30 dark:text-rose-200"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700",
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
            {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {listening ? (
            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
              Говорите...
            </span>
          ) : null}

          <button
            aria-label="Отправить"
            data-testid={sendButtonDataTestId}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition active:translate-y-[1px]",
              value.trim()
                ? "bg-accent-yellow text-accent-dark shadow-softSm hover:brightness-95"
                : "bg-[#F2F2F7] text-slate-400 dark:bg-slate-700"
            )}
            onClick={() => onSend()}
            disabled={!value.trim()}
          >
            <SendHorizonal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

