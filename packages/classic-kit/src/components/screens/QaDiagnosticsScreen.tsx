"use client";

import * as React from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { Card, CardContent } from "@shared/components/ui/card";
import { PageBackLink } from "@shared/components/PageBackLink";

type Check = {
  key: string;
  label: string;
  ok: boolean;
  details: string;
};

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
      details: "Уже установлено: приложение запущено в standalone-режиме"
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
    { key: "standalone", label: "Режим standalone", ok: standalone, details: standalone ? "Приложение запущено как PWA" : "Запущено в браузере" },
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
      setAiTrace(next.slice(-15).reverse());
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
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Self-check: источник ответов</div>
            {aiTrace.length ? (
              <div className="space-y-2">
                {aiTrace.map((t) => (
                  <div key={t.at} className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{t.source}</span>
                    <span className="ml-2">{new Date(t.at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
                    <div className="mt-1 truncate">{t.prompt}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">Пока нет данных. Отправьте запрос в чат и откройте QA.</div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
