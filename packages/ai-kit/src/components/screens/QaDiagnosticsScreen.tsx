"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, CircleCheck, CircleX } from "lucide-react";
import { Card, CardContent } from "@shared/components/ui/card";
import { PageBackLink } from "@shared/components/PageBackLink";
import { Button } from "@shared/components/ui/button";

type Check = {
  key: string;
  label: string;
  ok: boolean;
  details: string;
};

function classifyAiResponseSource(label: string): string {
  const normalized = label.toLowerCase();
  if (normalized.includes("google gemini")) return "Live · Google Gemini";
  if (normalized.includes("together ai")) return "Live · Together AI";
  if (normalized.includes("openrouter")) return "Live · OpenRouter";
  if (normalized.includes("grok/xai")) return "Live · Grok/xAI";
  if (normalized.includes("groq")) return "Live · Groq";
  if (normalized.includes("замоканный")) return "Mock";
  if (normalized.includes("детерминирован")) return "Детерминированный сценарий";
  if (normalized.includes("память")) return "Память диалога";
  if (normalized.includes("fallback") || normalized.includes("live")) return "Fallback/guard";
  return "Сценарий приложения";
}

function buildPwaInstallabilityCheck(): Check {
  if (typeof window === "undefined") {
    return {
      key: "pwa-installability",
      label: "PWA installability",
      ok: false,
      details: "Недоступно вне браузера"
    };
  }

  const nav = window.navigator;
  const secureContext = window.isSecureContext || window.location.hostname === "localhost";
  const hasServiceWorker = "serviceWorker" in nav;
  const hasBeforeInstallPrompt = "onbeforeinstallprompt" in window;
  const standalone =
    (window.matchMedia?.("(display-mode: standalone)")?.matches ?? false) ||
    (nav as Navigator & { standalone?: boolean }).standalone === true;
  const ua = nav.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);

  if (standalone) {
    return {
      key: "pwa-installability",
      label: "PWA installability",
      ok: true,
      details: "Уже установлено: приложение запущено с PWA"
    };
  }

  if (!secureContext) {
    return {
      key: "pwa-installability",
      label: "PWA installability",
      ok: false,
      details: "Недоступно: требуется HTTPS (или localhost)"
    };
  }

  if (!hasServiceWorker) {
    return {
      key: "pwa-installability",
      label: "PWA installability",
      ok: false,
      details: "Недоступно: браузер не поддерживает Service Worker"
    };
  }

  if (isIos && isSafari) {
    return {
      key: "pwa-installability",
      label: "PWA installability",
      ok: true,
      details: "iOS Safari: установка через «Поделиться» → «На экран Домой»"
    };
  }

  if (hasBeforeInstallPrompt) {
    return {
      key: "pwa-installability",
      label: "PWA installability",
      ok: true,
      details: "Готово к установке: ожидается событие beforeinstallprompt"
    };
  }

  return {
    key: "pwa-installability",
    label: "PWA installability",
    ok: false,
    details: "Пока недоступно: браузер не предоставляет install prompt в текущем контексте"
  };
}

function buildChecks(): Check[] {
  if (typeof window === "undefined") {
    return [
      { key: "runtime", label: "Browser runtime", ok: false, details: "Недоступно вне браузера" }
    ];
  }
  const nav = window.navigator;
  const storageOk = (() => {
    try {
      const k = "__qa_storage_test__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  })();
  const media = nav.mediaDevices;
  const hasCameraApi = Boolean(media && "getUserMedia" in media);
  const speechOk = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const swOk = "serviceWorker" in nav;
  const pwaPromptOk = "onbeforeinstallprompt" in window;
  const standalone = (window.matchMedia?.("(display-mode: standalone)")?.matches ?? false) || (nav as Navigator & { standalone?: boolean }).standalone === true;
  const platform = `${nav.platform || "unknown"} / ${nav.userAgent}`;

  return [
    { key: "platform", label: "Платформа", ok: true, details: platform },
    { key: "storage", label: "Local storage", ok: storageOk, details: storageOk ? "Работает" : "Ограничен/недоступен" },
    { key: "camera", label: "Камера (mediaDevices)", ok: hasCameraApi, details: hasCameraApi ? "getUserMedia доступен" : "Нет доступа к getUserMedia" },
    { key: "speech", label: "Озвучка (speech synthesis)", ok: speechOk, details: speechOk ? "Speech API доступен" : "Speech API не поддерживается" },
    { key: "service-worker", label: "Service Worker", ok: swOk, details: swOk ? "Поддерживается" : "Не поддерживается" },
    { key: "pwa-prompt", label: "PWA install prompt", ok: pwaPromptOk, details: pwaPromptOk ? "beforeinstallprompt поддерживается" : "Обычно недоступно в Safari (используется iOS hint)" },
    {
      key: "standalone",
      label: "Запуск приложения",
      ok: standalone,
      details: standalone ? "Приложение запущено с PWA" : "Приложение запущено не с PWA"
    },
    buildPwaInstallabilityCheck()
  ];
}

export function QaDiagnosticsScreen({ backHref = "/settings/" }: { backHref?: string }) {
  const [checks, setChecks] = React.useState<Check[]>([]);
  const [aiTrace, setAiTrace] = React.useState<
    Array<{
      at: string;
      source: string;
      prompt: string;
    }>
  >([]);
  const [isAiTraceExpanded, setIsAiTraceExpanded] = React.useState(false);

  const isDev = typeof process !== "undefined" && process.env?.NODE_ENV === "development";

  const refreshAiTrace = React.useCallback(() => {
    if (!isDev) return;
    if (typeof window === "undefined") return;
    try {
      const key = "b2b_ai_self_check_trace_v1";
      const cur = JSON.parse(window.localStorage.getItem(key) ?? "[]") as Array<{
        at: string;
        source: string;
        prompt: string;
      }>;
      const next = Array.isArray(cur) ? cur : [];
      setAiTrace(next.slice().reverse());
    } catch {
      setAiTrace([]);
    }
  }, [isDev]);

  const runChecks = React.useCallback(() => {
    setChecks(buildChecks());
    refreshAiTrace();
  }, [refreshAiTrace]);

  React.useEffect(() => {
    runChecks();
  }, [runChecks]);

  React.useEffect(() => {
    if (!isDev) return;
    const t = window.setInterval(() => {
      refreshAiTrace();
    }, 1200);
    return () => window.clearInterval(t);
  }, [isDev, refreshAiTrace]);
  const aiTraceRows = React.useMemo(
    () =>
      aiTrace.map((item) => ({
        atLabel: new Date(item.at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        variant: item.source,
        source: classifyAiResponseSource(item.source),
        prompt: item.prompt
      })),
    [aiTrace]
  );

  return (
    <div className="safe-px mx-auto max-w-[760px] space-y-4 pb-8 pt-2">
      <PageBackLink href={backHref} />

      <Card>
        <CardContent className="space-y-3 pb-4 pt-4">
          <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">Проверка устройства (QA)</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Быстрый аудит возможностей устройства и браузера для Android, iOS, Windows и macOS.
          </p>
          <button
            type="button"
            onClick={runChecks}
            className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Обновить проверку
          </button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {checks.map((c) => (
          <Card key={c.key}>
            <CardContent className="flex items-start gap-3 py-3">
              {c.ok ? (
                <CircleCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
              ) : (
                <CircleX className="mt-0.5 h-5 w-5 text-rose-600" />
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{c.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{c.details}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isDev ? (
        <Card>
          <CardContent className="space-y-2 pb-4 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Self-check: источник ответов ({aiTrace.length})
              </div>
              <Button
                type="button"
                variant="secondary"
                className="h-8 rounded-xl px-3 text-xs"
                onClick={() => setIsAiTraceExpanded((v) => !v)}
              >
                {isAiTraceExpanded ? (
                  <span className="inline-flex items-center gap-1">
                    <ChevronUp className="h-3.5 w-3.5" />
                    Свернуть
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <ChevronDown className="h-3.5 w-3.5" />
                    Развернуть
                  </span>
                )}
              </Button>
            </div>
            {aiTrace.length ? (
              isAiTraceExpanded ? (
                <div className="max-h-72 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                      <tr className="text-slate-700 dark:text-slate-200">
                        <th className="px-2 py-2 font-semibold">Время</th>
                        <th className="px-2 py-2 font-semibold">Вариант ответа</th>
                        <th className="px-2 py-2 font-semibold">Источник</th>
                        <th className="px-2 py-2 font-semibold">Запрос</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiTraceRows.map((row, idx) => (
                        <tr key={`${row.atLabel}-${idx}`} className="border-t border-slate-200 align-top text-slate-600 dark:border-slate-700 dark:text-slate-300">
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.atLabel}</td>
                          <td className="px-2 py-1.5">{row.variant}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.source}</td>
                          <td className="px-2 py-1.5 max-w-[260px] truncate" title={row.prompt}>
                            {row.prompt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Журнал скрыт. Нажмите «Развернуть», чтобы посмотреть все запросы.
                </div>
              )
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">Пока нет данных. Отправьте запрос в чат и откройте QA.</div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
