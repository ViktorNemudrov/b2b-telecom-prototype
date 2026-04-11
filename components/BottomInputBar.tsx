"use client";

import { Clock3, Mic, MicOff, Paperclip, SendHorizonal } from "lucide-react";
import * as React from "react";
import { cn } from "@/components/ui/cn";

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
  placement = "fixedBottom"
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onOpenHistory: () => void;
  placement?: "fixedBottom" | "inline";
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
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
          "fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-[430px]",
        placement === "inline" && "w-full"
      )}
    >
      <div
        className={cn(
          "safe-px bg-[rgb(var(--bg))]/85 backdrop-blur",
          placement === "fixedBottom" && "border-t border-slate-100 pb-4 pt-3",
          placement === "inline" && "pb-2 pt-1"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-softSm",
            focused && "ring-2 ring-accent-yellow/40"
          )}
        >
          <button
            aria-label="Прикрепить"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 active:translate-y-[1px]"
            onClick={() => {
              // prototype: no-op
            }}
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <button
            aria-label="История"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 active:translate-y-[1px]"
            onClick={onOpenHistory}
          >
            <Clock3 className="h-5 w-5" />
          </button>

          <button
            aria-label={listening ? "Остановить диктовку" : "Диктовать вопрос"}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition active:translate-y-[1px]",
              listening ? "bg-rose-50 text-rose-700" : "text-slate-500 hover:bg-slate-100",
              !supported && "cursor-not-allowed opacity-50"
            )}
            disabled={!supported}
            title={!supported ? "Диктовка недоступна в этом браузере" : listening ? "Остановить" : "Диктовать"}
            onClick={() => {
              const Ctor = getSpeechRecognitionCtor();
              if (!Ctor) return;

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
                onChange(merged.trim());
              };

              rec.onend = () => {
                setListening(false);
                recognitionRef.current = null;
                inputRef.current?.focus();
                if (hadFinal) {
                  // optional: keep it as text; user can press send
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

          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Чем можем помочь?"
            className="h-10 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-slate-400"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSend();
            }}
          />

          <button
            aria-label="Отправить"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition active:translate-y-[1px]",
              value.trim()
                ? "bg-accent-yellow text-accent-dark shadow-softSm hover:brightness-95"
                : "bg-slate-100 text-slate-400"
            )}
            onClick={onSend}
            disabled={!value.trim()}
          >
            <SendHorizonal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

